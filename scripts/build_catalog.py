#!/usr/bin/env python3
"""
Zet data/tma/catalog.json (output van scrape_tma.py) om naar src/data/generated/catalog.json,
het compacte formaat dat de webshop inleest.

Prijzen en voorraad: niet publiek beschikbaar. Lever een dealerprijslijst aan als
data/tma/prices.csv (kolommen: sku;price[;stock]) — die wordt dan gebruikt. Zonder prijslijst
krijgt elk artikel een RICHTPRIJS op basis van de productgroep, zichtbaar gemarkeerd in de shop.
"""
from __future__ import annotations

import csv
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "tma" / "catalog.json"
PRICES = ROOT / "data" / "tma" / "prices.csv"
OUT = ROOT / "src" / "data" / "generated" / "catalog.json"
IMG_BASE = "https://themusicalliance.co.uk"

# Shopcategorie → TMA-categorie-id (de kinderen daarvan worden subcategorieën)
SHOP = [
    ("gitaren", "Gitaren", "Akoestisch, klassiek en resonator", "acoustic", 28, "407"),
    ("folk", "Ukulele's & folk", "Ukulele's, banjo's en mandolines", "ukulele", 42, "37"),
    ("versterkers", "Versterkers & effecten", "Jouw sound, jouw regels", "amp", 260, "19"),
    ("drums", "Drums & percussie", "Ritme voor elk niveau", "drumkit", 8, "3"),
    ("blaas", "Blaasinstrumenten", "Koper, hout en mondharmonica", "sax", 45, "95"),
    ("strijk", "Strijkinstrumenten", "Viool, cello, contrabas en toebehoren", "violin", 18, "6"),
    ("accordeons", "Accordeons", "Accordeons en toebehoren", "keyboard", 330, "162"),
    ("pro-audio", "Pro audio & licht", "Microfoons, kabels en licht", "mic", 200, "1"),
    ("toetsen", "Toetsen", "Standaards, banken en pedalen", "piano", 220, "4"),
    ("accessoires", "Gitaaraccessoires", "Snaren, banden, tassen en meer", "strings", 150, "23"),
    ("onderdelen", "Onderdelen", "Voor bouwer en reparateur", "tool", 90, "451"),
    ("algemeen", "Algemeen", "Lessenaars, metronomen en cadeaus", "metronome", 300, "587"),
]

RENAME = {
    "resonator guitars": "Resonatorgitaren", "ukeleles": "Ukulele's", "effect pedals": "Effectpedalen",
    "connectors, sockets and adapters": "Connectoren en adapters", "batteries and power adapters": "Batterijen en adapters",
    '19" racks, cases and bags': '19"-racks, koffers en tassen', "trollies": "Trolleys", "care products": "Onderhoudsproducten",
    "pickups for accordions": "Elementen voor accordeons", "Bluetooth headphones & earbuds": "Bluetooth-hoofdtelefoons en oordopjes",
    "power attenuators": "Power attenuators", "mars harnassen, draagriemen  en handschoenen": "Marsharnassen, draagriemen en handschoenen",
    "elektronische slagwerken": "Elektronische drums", "tamboerijnen handtrommen": "Tamboerijnen en handtrommen",
    "tremolo's bruggen en staartstukken": "Tremolo's, bruggen en staartstukken",
}

# (trefwoord in categoriepad, art-kind, prijsbereik)
RULES: list[tuple[str, str, tuple[float, float]]] = [
    ("resonator", "resonator", (349, 1199)), ("akoestische basgitaren", "acoustic", (249, 699)),
    ("akoestische gitaren", "acoustic", (149, 899)), ("klassieke gitaren", "classical", (89, 699)),
    ("zelfbouw", "electric", (99, 249)), ("ukeleles", "ukulele", (29, 299)), ("banjo", "acoustic", (199, 799)),
    ("mandoline", "acoustic", (149, 599)), ("gitaarversterkers", "amp", (79, 699)), ("attenuator", "amp", (99, 299)),
    ("effectpedalen", "pedal", (39, 249)), ("voedingen", "electronics", (19, 129)), ("versterkeronderdelen", "electronics", (9, 79)),
    ("akoestische drumkits", "drumkit", (399, 1499)), ("kinderdrums", "drumkit", (149, 399)), ("snaredrums", "snare", (99, 449)),
    ("marstrommels", "snare", (149, 599)), ("elektronische slagwerken", "edrum", (299, 1299)), ("cajons", "cajon", (59, 249)),
    ("bongo", "djembe", (49, 199)), ("conga", "djembe", (149, 499)), ("timbalen", "snare", (199, 499)), ("rototoms", "snare", (99, 299)),
    ("percussie", "djembe", (9, 99)), ("bekken", "cymbal", (39, 399)), ("gongs", "cymbal", (49, 499)),
    ("stokken en kloppers", "sticks", (7, 29)), ("drumvellen", "drumhead", (12, 69)), ("drumonderdelen", "bridge", (3, 49)),
    ("drums en percussie", "snare", (9, 149)),
    ("saxofoons", "sax", (499, 1999)), ("klarinetten", "clarinet", (299, 999)), ("dwarsfluiten", "flute", (249, 899)),
    ("blokfluiten", "recorder", (7, 89)), ("tin-whistles", "recorder", (9, 39)), ("ocarina", "recorder", (12, 49)),
    ("trompetten", "trumpet", (299, 1299)), ("trombones", "trombone", (349, 1199)), ("hoorn", "trumpet", (699, 1999)),
    ("bugels", "trumpet", (399, 1199)), ("eufoniums", "trombone", (999, 2499)), ("mondharmonica", "harmonica", (9, 99)),
    ("bluesharp", "harmonica", (19, 69)), ("melodica", "harmonica", (29, 99)), ("rieten", "care", (9, 39)),
    ("mondstukken", "trumpet", (19, 149)), ("blaasinstrumenten", "care", (5, 79)),
    ("violen", "violin", (149, 899)), ("altviolen", "violin", (199, 999)), ("cello's", "cello", (499, 1999)),
    ("contrabassen", "cello", (1199, 3499)), ("strijkstokken", "tool", (39, 299)), ("vioolsnaren", "strings", (9, 69)),
    ("snaren", "strings", (6, 39)), ("koffers", "case", (59, 299)), ("tassen", "bag", (19, 149)), ("hoezen", "bag", (19, 89)),
    ("strijkinstrumenten", "violin", (5, 79)),
    ("accordeons", "keyboard", (299, 2499)),
    ("microfoons", "mic", (29, 249)), ("microfoon accessoires", "stand", (5, 49)), ("mixers", "mixer", (79, 499)),
    ("di boxen", "interface", (29, 149)), ("draadloze", "wireless", (79, 349)), ("hoofdtelefoons", "headphones", (19, 149)),
    ("verlichting", "speaker", (29, 299)), ("kabels", "cable", (5, 39)), ("connectors", "cable", (2, 19)),
    ("statieven", "stand", (12, 79)), ("pro audio", "electronics", (5, 99)),
    ("keyboardstandaards", "stand", (29, 99)), ("keyboardbanken", "stand", (39, 129)), ("pianobanken", "stand", (69, 249)),
    ("pianolampen", "electronics", (29, 99)), ("pedalen", "stand", (19, 69)), ("toetsen", "keyboard", (9, 99)),
    ("riemen", "strap", (9, 59)), ("ophanghaken", "stand", (7, 49)), ("stemapparaten", "tuner", (9, 39)),
    ("elementen", "pickup", (29, 149)), ("plectrums", "picks", (2, 15)), ("capo", "capo", (9, 39)), ("slides", "capo", (6, 25)),
    ("onderhoud", "care", (5, 25)), ("mechanieken", "tuners", (19, 79)), ("elektronica", "electronics", (4, 49)),
    ("knoppen", "electronics", (3, 15)), ("kammen en zadels", "bridge", (3, 25)), ("tremolo", "bridge", (19, 129)),
    ("gereedschap", "tool", (9, 79)), ("bodies", "electric", (49, 249)), ("slagplaten", "pickup", (12, 49)),
    ("lakken", "care", (9, 39)), ("bindingen", "tool", (5, 29)), ("hardware", "bridge", (3, 39)),
    ("lessenaar", "stand", (12, 79)), ("metronomen", "metronome", (15, 69)), ("cadeau", "picks", (5, 29)),
    ("miniatuur", "acoustic", (12, 39)), ("kleding", "bag", (15, 39)),
]

COLORS = {
    "zwart": "#1f1f22", "black": "#1f1f22", "wit": "#f1ede4", "white": "#f1ede4", "rood": "#b3202a", "red": "#b3202a",
    "blauw": "#1f4e9a", "blue": "#1f4e9a", "groen": "#2f6b47", "green": "#2f6b47", "geel": "#e8b931", "yellow": "#e8b931",
    "oranje": "#e0712c", "orange": "#e0712c", "roze": "#e48aa8", "pink": "#e48aa8", "paars": "#6b3fa0", "purple": "#6b3fa0",
    "bruin": "#7a4a2a", "brown": "#7a4a2a", "sunburst": "#8a3b12", "naturel": "#d9a66b", "natural": "#d9a66b",
    "zilver": "#b9bcc2", "silver": "#b9bcc2", "chroom": "#c8ccd2", "chrome": "#c8ccd2", "goud": "#c9a23b", "gold": "#c9a23b",
    "messing": "#c9a23b", "brass": "#c9a23b", "grijs": "#6e737a", "grey": "#6e737a", "gray": "#6e737a", "ivoor": "#efe6cf",
    "cream": "#efe6cf", "creme": "#efe6cf", "turquoise": "#2bb3b1", "cognac": "#9a5626", "mahonie": "#6b2c1a",
}
COLOR_LABEL = {
    "#1f1f22": "Zwart", "#f1ede4": "Wit", "#b3202a": "Rood", "#1f4e9a": "Blauw", "#2f6b47": "Groen", "#e8b931": "Geel",
    "#e0712c": "Oranje", "#e48aa8": "Roze", "#6b3fa0": "Paars", "#7a4a2a": "Bruin", "#8a3b12": "Sunburst", "#d9a66b": "Naturel",
    "#b9bcc2": "Zilver", "#c8ccd2": "Chroom", "#c9a23b": "Goud", "#6e737a": "Grijs", "#efe6cf": "Ivoor", "#2bb3b1": "Turquoise",
    "#9a5626": "Cognac", "#6b2c1a": "Mahonie",
}


def slug(s: str) -> str:
    s = s.lower().replace("'", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def cap(s: str) -> str:
    s = RENAME.get(s, s)
    return s[:1].upper() + s[1:]


def h(s: str) -> float:
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF


def nice_price(lo: float, hi: float, key: str) -> float:
    v = lo + (hi - lo) * (h(key) ** 1.6)
    if v < 20:
        return round(round(v * 2) / 2 - 0.05, 2)
    if v < 100:
        return float(int(v)) + 0.95 if v % 1 else float(int(v)) - 0.05
    return float(int(round(v / 10) * 10 - 1))


def main() -> None:
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    cats = raw["categories"]

    def path(cid: str) -> list[str]:
        out = []
        while cid and cid in cats:
            out.insert(0, cid)
            cid = cats[cid]["parent"]
        return out

    # subcategorie-knooppunt per shopcategorie (bij één kind: één niveau dieper)
    top_of: dict[str, tuple[str, str]] = {}  # tma-id → (shopcat, sub-tma-id)
    categories = []
    for sid, name, tagline, icon, hue, tma in SHOP:
        node = tma
        while len(cats[node]["children"]) == 1:
            node = cats[node]["children"][0]
        subs = []
        for ch in cats[node]["children"]:
            subs.append({"id": slug(cap(cats[ch]["name"])) or ch, "name": cap(cats[ch]["name"]), "parent": sid, "tma": ch})
        if not cats[node]["children"]:
            subs.append({"id": slug(cats[node]["name"]), "name": cap(cats[node]["name"]), "parent": sid, "tma": node})
        # dubbele slugs binnen één categorie voorkomen
        seen: set[str] = set()
        for s in subs:
            base = s["id"]
            i = 2
            while s["id"] in seen:
                s["id"] = f"{base}-{i}"; i += 1
            seen.add(s["id"])
            top_of[s["tma"]] = (sid, s["id"])
        categories.append({"id": sid, "name": name, "tagline": tagline, "icon": icon, "hue": hue, "children": subs})

    prices: dict[str, tuple[float, int | None]] = {}
    if PRICES.exists():
        with PRICES.open(encoding="utf-8") as f:
            for row in csv.reader(f, delimiter=";"):
                if len(row) >= 2 and row[0] and re.match(r"^[\d.,]+$", row[1].strip()):
                    prices[row[0].strip()] = (float(row[1].replace(",", ".")), int(row[2]) if len(row) > 2 and row[2].strip().isdigit() else None)

    products = []
    brand_count: dict[str, int] = {}
    skipped = 0
    for p in raw["products"]:
        # kies de eerste categorie die in de shopstructuur valt
        hit = None
        for cid in p["categories"]:
            pp = path(cid)
            for node in pp:
                if node in top_of:
                    hit = (top_of[node], pp)
                    break
            if hit:
                break
        if not hit:
            skipped += 1
            continue
        (shopcat, sub), pp = hit
        leaf = cap(cats[pp[-1]]["name"])
        pathtxt = " / ".join(cats[x]["name"].lower() for x in pp)
        kind, rng = "strings", (9.0, 49.0)
        # meest specifieke categorie eerst: 'mechanieken voor klassieke gitaren' is een onderdeel, geen gitaar
        found = False
        for node in reversed(pp):
            nm = cats[node]["name"].lower()
            for kw, k, r in RULES:
                if kw in nm:
                    kind, rng, found = k, r, True
                    break
            if found:
                break
        if not found:
            for kw, k, r in RULES:
                if kw in pathtxt:
                    kind, rng = k, r
                    break
        text = f"{p['title']} {p['description']}".lower()
        color = next((c for w, c in COLORS.items() if re.search(rf"\b{w}\b", text)), None)
        brand = (p.get("brand") or "").strip() or "Overig"
        brand_count[brand] = brand_count.get(brand, 0) + 1
        price, stock = prices.get(p["sku"], (None, None))
        title = p["title"].strip()
        desc = p["description"].strip().rstrip(",")
        name = title or p["sku"]
        prod = {
            "i": p["id"], "s": p["sku"], "n": name, "b": slug(brand), "se": p.get("series", ""), "c": shopcat, "u": sub,
            "l": leaf, "d": desc, "k": kind,
            "p": price if price is not None else nice_price(*rng, p["sku"] or p["id"]), "pe": price is None,
        }
        if stock is not None:
            prod["st"] = stock
        if color:
            prod["co"] = [color, COLOR_LABEL.get(color, "")]
        if p.get("image"):
            prod["im"] = p["image"]
        if p.get("ean"):
            prod["e"] = p["ean"]
        if p.get("features"):
            prod["f"] = p["features"]
        if p.get("images"):
            prod["ims"] = p["images"]
        if p.get("isNew"):
            prod["nw"] = 1
        products.append(prod)

    brands = [{"id": slug(b), "name": b, "count": n} for b, n in sorted(brand_count.items(), key=lambda x: -x[1])]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "source": raw["source"], "scrapedAt": raw["scrapedAt"], "imageBase": IMG_BASE, "pricesFromFeed": bool(prices),
        "categories": [{**c, "children": [{k: v for k, v in s.items() if k != "tma"} for s in c["children"]]} for c in categories],
        "brands": brands, "products": products,
    }, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"✓ {len(products)} producten, {len(brands)} merken, {len(categories)} categorieën → {OUT} (overgeslagen: {skipped})")


if __name__ == "__main__":
    main()
