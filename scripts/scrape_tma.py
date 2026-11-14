#!/usr/bin/env python3
"""
Scraper voor de publieke online catalogus van The Music Alliance (themusicalliance.co.uk).

Fase 1 (standaard): alle categorieën + productoverzichten
    → artikelnummer, merk/serie, omschrijving, afbeelding, categoriepad.
Fase 2 (--details): productdetailpagina's → EAN en kenmerkenlijst.

Prijzen en voorraad zijn NIET publiek (dealerlogin) en worden dus niet opgehaald.

Gebruik:
    python3 scripts/scrape_tma.py                 # fase 1 → data/tma/catalog.json
    python3 scripts/scrape_tma.py --details       # fase 1 + 2
    python3 scripts/scrape_tma.py --details-only  # alleen fase 2 op bestaande catalog.json

Alleen standaardbibliotheek. Respecteert HTTPS_PROXY en is bewust traag (max. 2 parallelle
verzoeken, pauze per verzoek) om de server van TMA niet te belasten. Hervat automatisch dankzij
een cache in data/tma/cache/.
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import hashlib
import html
import json
import os
import re
import ssl
import sys
import time
import urllib.request
from pathlib import Path

BASE = "https://themusicalliance.co.uk"
ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "data" / "tma"
CACHE = OUT_DIR / "cache"
UA = "Mozilla/5.0 (compatible; catalog-sync/1.0)"
LANG = os.environ.get("TMA_LANG", "nl")  # nl of en
DELAY = 0.6
WORKERS = 2


def ctx() -> ssl.SSLContext:
    c = ssl.create_default_context()
    for p in (os.environ.get("SSL_CERT_FILE"), "/root/.ccr/ca-bundle.crt"):
        if p and Path(p).exists():
            c.load_verify_locations(p)
    return c


SSL = ctx()


def get(path: str, retries: int = 4) -> str:
    url = path if path.startswith("http") else BASE + path
    key = CACHE / (hashlib.sha1(url.encode()).hexdigest() + ".html")
    if key.exists():
        return key.read_text(encoding="utf-8", errors="ignore")
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": LANG})
            with urllib.request.urlopen(req, timeout=60, context=SSL) as r:
                body = r.read().decode("utf-8", errors="ignore")
            key.write_text(body, encoding="utf-8")
            time.sleep(DELAY)
            return body
        except Exception as e:  # noqa: BLE001
            wait = 2 ** attempt * 2
            print(f"  ! {url} ({e}); opnieuw over {wait}s", file=sys.stderr)
            time.sleep(wait)
    raise RuntimeError(f"Kon {url} niet ophalen")


def clean(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()


# ───────────────────────── categorieën

def parse_tree(home: str) -> dict[str, dict]:
    tree: dict[str, dict] = {}
    for title, cid, parent in re.findall(
        r'\{"title":"((?:[^"\\]|\\.)*)","id":"(\d+)","image":[^,]*,"title_eng":"(?:[^"\\]|\\.)*","parentCategoryId":"(\d+)"', home
    ):
        tree[cid] = {"id": cid, "name": html.unescape(json.loads(f'"{title}"')), "parent": parent}
    # topniveau (bv. 2 = stringed instruments) staat alleen als link in het menu
    for cid, slug, name in re.findall(r'href="/(?:en|nl)/category/(\d+)/([^"?]+)"[^>]*>\s*([^<]{2,60}?)\s*<', home):
        tree.setdefault(cid, {"id": cid, "name": html.unescape(name.strip()), "parent": None})
        tree[cid]["slug"] = slug
    for c in tree.values():
        c["children"] = [k for k, v in tree.items() if v["parent"] == c["id"]]
    return tree


# ───────────────────────── overzichtspagina's

ITEM_RE = re.compile(r'<div data-item="(\d+)" class="products-item[^"]*">([\s\S]*?)</p>\s*</div>\s*</div>')


def parse_listing(page: str) -> list[dict]:
    items = []
    for pid, block in ITEM_RE.findall(page):
        href = re.search(r'href="(/(?:en|nl)/product/\d+/[^"?]+)', block)
        img = re.search(r'<img src="(/images/[^"?]+)', block)
        sku = re.search(r'<span class="itemnr">\s*<span>([\s\S]*?)<span', block)
        title = re.search(r'<span class="item-text">([\s\S]*?)</span>', block)
        bs = re.search(r'stock-simple-brand-series">([\s\S]*?)</span>', block)
        desc = re.search(r'<p>(?:<span[^>]*>[\s\S]*?</span>)?([\s\S]*)$', block)
        items.append({
            "id": pid,
            "url": href.group(1) if href else None,
            "sku": clean(sku.group(1)) if sku else "",
            "title": clean(title.group(1)) if title else "",
            "brandSeries": clean(bs.group(1)) if bs else "",
            "description": clean(desc.group(1)) if desc else "",
            "image": img.group(1) if img else None,
        })
    return items


def brands_on(page: str) -> dict[str, str]:
    return {bid: html.unescape(name.strip()) for bid, name in re.findall(r'\?brandId=(\d+)">([^<]{1,60})</a>', page)}


def crumbs(page: str) -> list[str]:
    m = re.search(r'id="breadcrumbs">([\s\S]*?)</div>', page)
    return re.findall(r'/(?:en|nl)/category/(\d+)/', m.group(1)) if m else []


def crawl_category(cid: str, slug: str) -> tuple[str, list[dict], dict[str, str], list[str]]:
    first = get(f"/{LANG}/category/{cid}/{slug}")
    total = re.search(r"found (\d+) products|(\d+) producten gevonden", first)
    n = int(total.group(1) or total.group(2)) if total else 0
    items = parse_listing(first)
    pages = (n + 99) // 100
    for p in range(2, pages + 1):
        items += parse_listing(get(f"/{LANG}/category/{cid}/{slug}?currentPage={p}"))
    return cid, items, brands_on(first), crumbs(first)


# ───────────────────────── detailpagina's

def parse_detail(page: str) -> dict:
    out: dict = {}
    ean = re.search(r">\s*(\d{12,14})\s*<", page)
    if ean:
        out["ean"] = ean.group(1)
    text = clean(re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", "", page).replace("<br", "\n<br").replace("</li>", "\n</li>"))
    m = re.search(r"Features:\s*(.*?)(?:\s«\s*(?:back|terug)|\s\^\s|Contact\s)", text)
    if m:
        feats = [f.strip(" -•") for f in re.split(r"\s-\s|\s•\s", " " + m.group(1)) if f.strip(" -•")]
        out["features"] = feats[:25]
    imgs = sorted(set(re.findall(r'(/images/\d+/\d+(?:_\d+)?\.(?:jpg|png))', page)))
    if imgs:
        out["images"] = imgs[:8]
    return out


# ───────────────────────── main

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--details", action="store_true")
    ap.add_argument("--details-only", action="store_true")
    ap.add_argument("--new", action="store_true", help="markeer nieuwe producten (/product/new)")
    ap.add_argument("--limit", type=int, default=0, help="max. aantal categorieën (test)")
    a = ap.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / "catalog.json"

    if not a.details_only:
        print("Categorieën ophalen…")
        tree = parse_tree(get(f"/{LANG}/"))
        leaves = [c for c in tree.values() if not c["children"] and c.get("slug")]
        # categorieën zonder slug: slug afleiden
        for c in tree.values():
            c.setdefault("slug", re.sub(r"[^a-z0-9]+", "-", c["name"].lower()).strip("-"))
        leaves = [c for c in tree.values() if not c["children"] and c["id"] != "0"]
        if a.limit:
            leaves = leaves[: a.limit]
        print(f"{len(tree)} categorieën, {len(leaves)} eindcategorieën")

        products: dict[str, dict] = {}
        brands: dict[str, str] = {}
        done = 0
        with cf.ThreadPoolExecutor(WORKERS) as ex:
            futs = [ex.submit(crawl_category, c["id"], c["slug"]) for c in leaves]
            for f in cf.as_completed(futs):
                cid, items, bmap, path = f.result()
                brands.update(bmap)
                if path:
                    tree[cid]["path"] = path
                for it in items:
                    p = products.setdefault(it["id"], {**it, "categories": []})
                    if cid not in p["categories"]:
                        p["categories"].append(cid)
                done += 1
                if done % 25 == 0:
                    print(f"  {done}/{len(leaves)} categorieën · {len(products)} producten")

        names = sorted(set(brands.values()), key=len, reverse=True)
        for p in products.values():
            bs = p["brandSeries"] or p["title"]
            p["brand"] = next((b for b in names if bs.lower().startswith(b.lower())), bs.split(" ")[0] if bs else "")
            p["series"] = bs[len(p["brand"]):].strip()
        data = {
            "source": BASE,
            "scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "categories": {k: {kk: vv for kk, vv in v.items() if kk != "children"} | {"children": v["children"]} for k, v in tree.items()},
            "brands": sorted(set(brands.values())),
            "products": sorted(products.values(), key=lambda x: int(x["id"])),
        }
        out_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"✓ {len(products)} producten, {len(data['brands'])} merken → {out_file}")

    if a.new:
        data = json.loads(out_file.read_text(encoding="utf-8"))
        first = get(f"/{LANG}/product/new")
        total = re.search(r"found (\d+) products|(\d+) producten gevonden", first)
        n = int(total.group(1) or total.group(2)) if total else 0
        ids = {i["id"] for i in parse_listing(first)}
        for p in range(2, (n + 99) // 100 + 1):
            ids |= {i["id"] for i in parse_listing(get(f"/{LANG}/product/new?currentPage={p}"))}
        for p in data["products"]:
            p["isNew"] = p["id"] in ids
        out_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"✓ {len(ids)} nieuwe producten gemarkeerd")

    if a.details or a.details_only:
        data = json.loads(out_file.read_text(encoding="utf-8"))
        todo = [p for p in data["products"] if p.get("url") and "ean" not in p and "features" not in p]
        print(f"Detailpagina's ophalen: {len(todo)}")
        n = 0
        with cf.ThreadPoolExecutor(WORKERS) as ex:
            for p, d in zip(todo, ex.map(lambda p: parse_detail(get(p["url"] + "?view=onlinecatalog")), todo)):
                p.update(d)
                n += 1
                if n % 250 == 0:
                    print(f"  {n}/{len(todo)}")
                    out_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        out_file.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print("✓ details bijgewerkt")


if __name__ == "__main__":
    main()
