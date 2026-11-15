#!/usr/bin/env python3
"""
Downloadt alle productfoto's uit de catalogus en bundelt ze tot sprite sheets.

Waarom: een Claude-artifact (en elke statische host zonder externe afbeeldingen) mag maar een beperkt
aantal bestanden bevatten. 8.700 losse foto's passen daar niet in; ±140 sprite sheets wel.

    python3 scripts/build_sprites.py            # download + sprites
    python3 scripts/build_sprites.py --cell 256 --grid 8 --quality 78

Output:
    data/tma/images/<id>.jpg          losse foto's (cache, ook bruikbaar voor eigen hosting)
    data/tma/sprites/s<n>.jpg         sprite sheets
    src/data/generated/sprites.json   { cell, grid, map: { productId: [sheet, index] } }
"""
from __future__ import annotations

import argparse
import concurrent.futures as cf
import io
import json
import os
import ssl
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
CATALOG = ROOT / "src" / "data" / "generated" / "catalog.json"
IMG_DIR = ROOT / "data" / "tma" / "images"
SPRITE_DIR = ROOT / "data" / "tma" / "sprites"
OUT_MAP = ROOT / "src" / "data" / "generated" / "sprites.json"

ctx = ssl.create_default_context()
for p in (os.environ.get("SSL_CERT_FILE"), "/root/.ccr/ca-bundle.crt"):
    if p and Path(p).exists():
        ctx.load_verify_locations(p)


def download(base: str, pid: str, path: str, size: int) -> bool:
    dest = IMG_DIR / f"{pid}.jpg"
    if dest.exists() and dest.stat().st_size > 500:
        return True
    url = f"{base}{path}?width={size}&height={size}"
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; catalog-sync/1.0)"})
            with urllib.request.urlopen(req, timeout=60, context=ctx) as r:
                data = r.read()
            Image.open(io.BytesIO(data)).verify()
            dest.write_bytes(data)
            time.sleep(0.1)
            return True
        except Exception as e:  # noqa: BLE001
            if attempt == 3:
                print(f"  ! {pid}: {e}", file=sys.stderr)
            time.sleep(2 ** attempt)
    return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cell", type=int, default=256)
    ap.add_argument("--grid", type=int, default=8)
    ap.add_argument("--quality", type=int, default=78)
    ap.add_argument("--workers", type=int, default=4)
    a = ap.parse_args()

    cat = json.loads(CATALOG.read_text(encoding="utf-8"))
    base = cat["imageBase"]
    # sorteer op categorie/sub/soort zodat een categoriepagina maar enkele sheets nodig heeft
    order = {c["id"]: i for i, c in enumerate(cat["categories"])}
    prods = sorted((p for p in cat["products"] if p.get("im")), key=lambda p: (order.get(p["c"], 99), p["u"], p["l"], -p["p"]))
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    SPRITE_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Foto's downloaden: {len(prods)}")
    ok: dict[str, bool] = {}
    with cf.ThreadPoolExecutor(a.workers) as ex:
        futs = {ex.submit(download, base, p["i"], p["im"], a.cell * 2): p["i"] for p in prods}
        for n, f in enumerate(cf.as_completed(futs), 1):
            ok[futs[f]] = f.result()
            if n % 500 == 0:
                print(f"  {n}/{len(prods)}", flush=True)

    per = a.grid * a.grid
    have = [p for p in prods if ok.get(p["i"])]
    mapping: dict[str, list[int]] = {}
    for old in SPRITE_DIR.glob("s*.jpg"):
        old.unlink()
    for s in range(0, len(have), per):
        chunk = have[s:s + per]
        sheet = Image.new("RGB", (a.cell * a.grid, a.cell * a.grid), (255, 255, 255))
        for i, p in enumerate(chunk):
            try:
                im = Image.open(IMG_DIR / f"{p['i']}.jpg").convert("RGB")
            except Exception:  # noqa: BLE001
                continue
            im.thumbnail((a.cell, a.cell), Image.LANCZOS)
            x = (i % a.grid) * a.cell + (a.cell - im.width) // 2
            y = (i // a.grid) * a.cell + (a.cell - im.height) // 2
            sheet.paste(im, (x, y))
            mapping[p["i"]] = [s // per, i]
        sheet.save(SPRITE_DIR / f"s{s // per}.jpg", "JPEG", quality=a.quality, optimize=True, progressive=True)

    total = sum(f.stat().st_size for f in SPRITE_DIR.glob("s*.jpg"))
    OUT_MAP.write_text(json.dumps({"cell": a.cell, "grid": a.grid, "sheets": (len(have) + per - 1) // per, "map": mapping},
                                  separators=(",", ":")), encoding="utf-8")
    print(f"✓ {len(mapping)} foto's in {(len(have) + per - 1) // per} sheets, {total / 1e6:.1f} MB → {SPRITE_DIR}")


if __name__ == "__main__":
    main()
