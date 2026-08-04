#!/usr/bin/env python3
"""Haalt de werkelijke bouwstatus per nieuwbouwproject uit het Kadaster (BAG).

WAAROM DIT DE ONTBREKENDE HELFT IS
----------------------------------
Van onze 995 projecten hebben er 795 geen enkele opleverdatum en 17 een
betrouwbare. Edisonpark — 550 woningen, 89% verkocht — staat op null. En juist
"[projectnaam] oplevering" is de enige zoekvraag ná de handtekening met bewezen
volume. Een pagina die dat niet kan beantwoorden wint niets, niet in Google en
niet in AI-antwoorden.

De beloofde datum staat verspreid op projectsites en gemeentepagina's: rommelig,
half in JavaScript, per project anders. De werkelijke datum staat in de BAG:
per pand een status (bouwvergunning verleend → bouw gestart → pand in gebruik) en
een bouwjaar. Officieel, gratis, machineleesbaar, door gemeenten bijgehouden.

Belofte versus werkelijkheid heeft twee getallen nodig. Dit script haalt de
betrouwbaarste van de twee op zonder te scrapen.

EERLIJK OVER WAT DIT NIET IS
----------------------------
Een bbox vangt ook de buren. Wat hier uitkomt is "in de directe omgeving van dit
project zijn X panden opgeleverd in 2026", niet "dit project is opgeleverd". Zo
moet het ook op de pagina staan. De precieze koppeling pand↔project vraagt om de
adressen van het project, en die hebben we niet.

TECHNISCH
---------
PDOK's BAG-WFS negeert CQL_FILTER; een echt FES 2.0-filter werkt wel. Zonder dat
filter loop je in een stad meteen tegen de limiet van duizend panden aan en zie je
alleen bestaande bouw. Geen sleutel nodig, geen kosten.

Gebruik:
    python3 scripts/bag_bouwstatus.py --regio    # alleen de Rotterdamse straal
    python3 scripts/bag_bouwstatus.py            # alle projecten met coordinaten
    python3 scripts/bag_bouwstatus.py --delta    # verschil met de vorige ronde
"""
import json, os, sys, time, glob, subprocess, urllib.parse, collections
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
UIT = os.path.join(ROOT, "data", "bag-snapshots")
STRAAL_GRADEN = 0.006          # ruwweg 650 meter
VANAF_BOUWJAAR = date.today().year - 2
DELAY = 0.8                    # PDOK is een publieke dienst; niet rammen

WFS = ("https://service.pdok.nl/lv/bag/wfs/v2_0?service=WFS&version=2.0.0"
       "&request=GetFeature&typeNames=bag:pand&count=500&outputFormat=application/json")


def filter_xml(lat, lng, dd=STRAAL_GRADEN, vanaf=VANAF_BOUWJAAR):
    return (
        '<fes:Filter xmlns:fes="http://www.opengis.net/fes/2.0" '
        'xmlns:gml="http://www.opengis.net/gml/3.2"><fes:And>'
        '<fes:BBOX><fes:ValueReference>geometrie</fes:ValueReference>'
        '<gml:Envelope srsName="urn:ogc:def:crs:EPSG::4326">'
        f'<gml:lowerCorner>{lat - dd} {lng - dd}</gml:lowerCorner>'
        f'<gml:upperCorner>{lat + dd} {lng + dd}</gml:upperCorner>'
        '</gml:Envelope></fes:BBOX>'
        '<fes:PropertyIsGreaterThanOrEqualTo><fes:ValueReference>bouwjaar</fes:ValueReference>'
        f'<fes:Literal>{vanaf}</fes:Literal></fes:PropertyIsGreaterThanOrEqualTo>'
        '</fes:And></fes:Filter>')


def haal(lat, lng):
    u = WFS + "&filter=" + urllib.parse.quote(filter_xml(lat, lng))
    for poging in range(3):
        r = subprocess.run(["curl", "-s", "-m", "60", u], capture_output=True, text=True)
        try:
            return json.loads(r.stdout).get("features") or []
        except Exception:
            time.sleep(3 * (poging + 1))
    return None


def samenvat(features):
    """Wat er van die panden toe doet: hoeveel, in welke staat, hoe vers."""
    if features is None:
        return {"fout": "geen antwoord"}
    st = collections.Counter(f["properties"].get("status") for f in features)
    bj = collections.Counter(f["properties"].get("bouwjaar") for f in features)
    vo = sum(f["properties"].get("aantal_verblijfsobjecten") or 0 for f in features)
    return {
        "panden": len(features),
        "verblijfsobjecten": vo,
        "in_aanbouw": st.get("Bouw gestart", 0) + st.get("Bouwvergunning verleend", 0),
        "opgeleverd": st.get("Pand in gebruik", 0) + st.get("Pand in gebruik (niet ingemeten)", 0),
        "status": dict(st),
        "bouwjaren": {str(k): v for k, v in sorted(bj.items()) if k},
        "nieuwste_bouwjaar": max([b for b in bj if b], default=None),
    }


def toon_delta():
    fs = sorted(glob.glob(os.path.join(UIT, "*.json")))
    if len(fs) < 2:
        print(f"Nog maar {len(fs)} ronde(s). De BAG verandert in maanden, niet in dagen — "
              f"verschillen ontstaan pas bij de volgende ronde over enkele weken.")
        return
    oud = json.load(open(fs[-2], encoding="utf8")); nieuw = json.load(open(fs[-1], encoding="utf8"))
    n = 0
    for url, d in nieuw.items():
        v = oud.get(url) or {}
        for veld, woord in (("opgeleverd", "opgeleverd"), ("in_aanbouw", "in aanbouw")):
            if d.get(veld) is not None and v.get(veld) is not None and d[veld] != v[veld]:
                n += 1
                print(f"  {d['naam'][:38]:<40} {woord}: {v[veld]} → {d[veld]}")
    print(f"\n{n} veranderingen tussen {os.path.basename(fs[-2])[:-5]} en {os.path.basename(fs[-1])[:-5]}")


def main():
    if "--delta" in sys.argv:
        return toon_delta()
    sys.path.insert(0, os.path.join(ROOT, "scripts"))
    projecten = json.load(open(PROJECTEN, encoding="utf8"))["projecten"]
    if "--regio" in sys.argv:
        import nieuwbouw_scraper as ns
        prio = ns.KERN | ns.RING
        projecten = [p for p in projecten if p["plaats"] in prio]
    projecten = [p for p in projecten if p.get("lat") and p.get("lng")]

    os.makedirs(UIT, exist_ok=True)
    pad = os.path.join(UIT, f"{date.today()}.json")
    uit = json.load(open(pad, encoding="utf8")) if os.path.exists(pad) else {}
    todo = [p for p in projecten if p["url"] not in uit]
    print(f"{len(projecten)} projecten met coordinaten · {len(todo)} te gaan "
          f"(~{len(todo) * (DELAY + 1.2) / 60:.0f} min)\n", flush=True)

    for i, p in enumerate(todo, 1):
        d = samenvat(haal(float(p["lat"]), float(p["lng"])))
        d.update(naam=p["naam"], plaats=p["plaats"], woningen=p.get("woningen"))
        uit[p["url"]] = d
        if d.get("panden"):
            print(f"  {d['opgeleverd']:>3} opgeleverd  {d['in_aanbouw']:>3} in aanbouw  "
                  f"(nieuwste {d['nieuwste_bouwjaar']})  {p['naam'][:34]:<36} {p['plaats']}",
                  flush=True)
        if i % 20 == 0:
            json.dump(uit, open(pad, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        time.sleep(DELAY)

    json.dump(uit, open(pad, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    met = [d for d in uit.values() if d.get("panden")]
    bouw = [d for d in met if d.get("in_aanbouw")]
    print(f"\nKLAAR — {len(uit)} projecten, {len(met)} met nieuwbouw in de omgeving, "
          f"{len(bouw)} met panden die nu in aanbouw zijn. Momentopname: {os.path.basename(pad)}")


if __name__ == "__main__":
    main()
