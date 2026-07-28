#!/usr/bin/env python3
"""
Bouwt /sitemap.xml als sitemap-index over alle losse *-sitemap.xml in de repo-root.

Waarom dit bestaat
------------------
Elke clustergenerator schrijft zijn eigen `<cluster>-sitemap.xml`. Die stonden
alleen als losse `Sitemap:`-regel in robots.txt, en Google pikte er op 28 juli 2026
zes van de negenentwintig op. Gemeten gevolg: 25.707 vakbedrijf-profielen en de 343
gemeentepagina's stonden bij de URL-inspectie op "URL is unknown to Google" —
nooit gecrawld. Niet afgewezen, nooit gevonden.

De hoofdsitemap wérd wel elke dag opgehaald. Die is daarom nu de index: één bestand
dat Google al kent en dat naar alle andere wijst. De 39.237 losse URL's die erin
stonden zijn verhuisd naar hoofd-sitemap.xml.

Draai dit script opnieuw zodra er een cluster (en dus een sitemap) bij komt —
anders blijft de nieuwe onvindbaar, precies de fout die hierboven beschreven staat.

Gebruik: python3 generate_sitemap_index.py [--check]
  --check  schrijft niets, meldt alleen of de index nog klopt (voor een loop)
"""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

BASE = "https://www.bylder.com"
ROOT = Path(__file__).resolve().parent
INDEX = ROOT / "sitemap.xml"
NS = "http://www.sitemaps.org/schemas/sitemap/0.9"

CHECK = "--check" in sys.argv[1:]


def sitemaps() -> list[str]:
    """Alle *-sitemap.xml in de root, alfabetisch. De index zelf telt niet mee."""
    return sorted(p.name for p in ROOT.glob("*-sitemap.xml") if p.name != INDEX.name)


def urls_in(path: Path) -> int:
    """Aantal <loc>'s, zonder het hele bestand te parsen — hoofd-sitemap is 7,7 MB."""
    n = 0
    with path.open(encoding="utf-8") as f:
        for regel in f:
            n += regel.count("<loc>")
    return n


def bouw(namen: list[str]) -> str:
    regels = ['<?xml version="1.0" encoding="UTF-8"?>', f'<sitemapindex xmlns="{NS}">']
    for naam in namen:
        regels.append(f"  <sitemap><loc>{BASE}/{naam}</loc></sitemap>")
    regels.append("</sitemapindex>")
    return "\n".join(regels) + "\n"


namen = sitemaps()
if not namen:
    sys.exit("⚠ Geen enkele *-sitemap.xml gevonden — draai je dit wel in de repo-root?")

# Leeg of stuk aanbieden is schadelijker dan niet aanbieden: Google onthoudt een
# kapotte index en haalt hem trager opnieuw op.
leeg = [n for n in namen if urls_in(ROOT / n) == 0]
if leeg:
    print("⚠ Sitemaps zonder URL's (worden overgeslagen):", ", ".join(leeg))
    namen = [n for n in namen if n not in leeg]

xml = bouw(namen)
ET.fromstring(xml)  # faalt hard bij ongeldige XML

if CHECK:
    huidig = INDEX.read_text(encoding="utf-8") if INDEX.exists() else ""
    if huidig == xml:
        print(f"[OK] Index klopt: {len(namen)} sitemaps.")
        sys.exit(0)
    print(f"[VEROUDERD] Index wijkt af — draai zonder --check. ({len(namen)} sitemaps gevonden)")
    sys.exit(1)

INDEX.write_text(xml, encoding="utf-8")

totaal = sum(urls_in(ROOT / n) for n in namen)
print(f"[OK] {INDEX.name}: index over {len(namen)} sitemaps, samen {totaal:,} URL's.".replace(",", "."))
for naam in namen:
    print(f"  {urls_in(ROOT / naam):>7}  {naam}")
