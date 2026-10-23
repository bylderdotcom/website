#!/usr/bin/env python3
"""Woonwinkels per producttype uit OpenStreetMap, voor heel Nederland.

WAAROM
------
data/winkels-publiek.json komt uit Google Places en dekt vooral de regio Rotterdam.
Landelijk opschalen via Google kan niet: de voorwaarden van Google Maps Platform staan niet
toe dat je die gegevens langer dan 30 dagen bewaart (behalve het place ID). OpenStreetMap
mag met bronvermelding (ODbL). Een telling op 23-10-2026 gaf voor heel Nederland onder meer
682 keukenwinkels, 481 beddenwinkels, 237 sanitairwinkels en 314 vloerenwinkels; te dun
voor tegels (53), binnendeuren (28) en gietvloer (3). Die laatste vullen we met een eigen
lijst; dit script doet de rest.

Gebruikt op de klus-per-gemeentepagina's (web/lib/klus-lokaal.ts), naast de Google-lijst.
Ratings zitten niet in OpenStreetMap; die komen alleen uit de bestaande lijst.

BRONVERMELDING
--------------
Waar deze winkels op een pagina staan, staat "© OpenStreetMap-bijdragers (ODbL)" erbij.
Het bestand zelf geven we niet uit; de pagina is een afgeleid werk.

GEBRUIK
-------
    osmium tags-filter netherlands-latest.osm.pbf nwr/shop -o shops.osm.pbf
    osmium export shops.osm.pbf -f geojsonseq -o shops.geojsonseq --geometry-types=point,polygon
    python3 scripts/osm_winkels.py shops.geojsonseq            # schrijft data/winkels-osm.json
    python3 scripts/osm_winkels.py shops.geojsonseq --droog    # alleen tellen
De maandelijkse ronde: .github/workflows/osm-winkels.yml.
"""
import collections
import json
import os
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UIT = os.path.join(ROOT, "data", "winkels-osm.json")

# OSM-shop → de categorie zoals winkels-publiek.json en klus-lokaal.ts die kennen.
CAT = {
    "bathroom_furnishing": "sanitair",
    "tiles": "tegel",
    "flooring": "vloeren",
    "carpet": "vloeren",
    "kitchen": "keuken",
    "lighting": "verlichting",
    "curtain": "raamdecoratie",
    "window_blind": "zonwering",
    "bed": "bedden",
    "furniture": "meubelwinkel",
    "paint": "verf",
    "doors": "deuren",
}


def midden(geom):
    """Een punt voor de winkel: het punt zelf, of het gemiddelde van de buitenrand."""
    if geom["type"] == "Point":
        return geom["coordinates"]
    ring = geom["coordinates"][0] if geom["type"] == "Polygon" else geom["coordinates"][0][0]
    return [sum(c[0] for c in ring) / len(ring), sum(c[1] for c in ring) / len(ring)]


def main():
    bron, droog = sys.argv[1], "--droog" in sys.argv
    winkels, per = [], collections.Counter()
    for regel in open(bron, encoding="utf-8"):
        regel = regel.lstrip("\x1e").strip()
        if not regel:
            continue
        f = json.loads(regel)
        p = f.get("properties") or {}
        cat = CAT.get(p.get("shop"))
        naam = (p.get("name") or "").strip()
        if not cat or not naam or not f.get("geometry"):
            continue
        lng, lat = midden(f["geometry"])
        w = {"naam": naam, "cat": cat, "lat": round(lat, 6), "lng": round(lng, 6)}
        site = p.get("website") or p.get("contact:website")
        if site:
            w["website"] = site if site.startswith("http") else "https://" + site
        if p.get("addr:city"):
            w["plaats"] = p["addr:city"]
        if p.get("@id"):
            w["osm"] = p["@id"]
        winkels.append(w)
        per[cat] += 1

    winkels.sort(key=lambda w: (w["cat"], w["naam"].lower()))
    print(f"{len(winkels)} winkels met naam en locatie")
    for c, n in per.most_common():
        print(f"  {c:16}{n:>6}")
    if droog:
        return
    json.dump({"_bron": "© OpenStreetMap-bijdragers, ODbL (openstreetmap.org/copyright); "
                        "Geofabrik-extract van Nederland, eigen selectie van woonwinkels",
               "_datum": date.today().isoformat(), "aantal": len(winkels), "per_cat": dict(per),
               "winkels": winkels},
              open(UIT, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(f"geschreven: {UIT}")


if __name__ == "__main__":
    main()
