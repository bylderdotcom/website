#!/usr/bin/env python3
"""Checkt of het CBS nieuwere cijfers heeft dan wat op de gemeentepagina's staat.

Aanleiding: op 27 juli 2026 kregen 343 gemeentepagina's cijfers uit vier
CBS-tabellen. Dat is een momentopname. De vergunningen ververst het CBS elk
kwartaal, de rest jaarlijks — zonder controle verouderen die pagina's stil,
terwijl er wel een bijgewerkt-datum onder staat. Dat is precies het soort
stilzwijgende veroudering waar een lezer niets van merkt en wij ook niet.

Read-only, conform de standing order: deze check verandert niets en levert
reviewbare output. Exit-code 1 zodra er nieuwere cijfers beschikbaar zijn.

Gebruik:  python3 scripts/check_cbs_freshness.py
"""
import json
import os
import ssl
import sys
import urllib.request

try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "cbs-gemeenten.json")

# tabel -> (omschrijving, sleutel in de cache, periodesoort)
TABELLEN = [
    ("60048ned", "verhuisde personen per gemeente", "jaar_verhuizingen", "JJ"),
    ("83625NED", "gemiddelde verkoopprijs bestaande koopwoning", "jaar_prijs", "JJ"),
    ("85035NED", "woningvoorraad per gemeente", "jaar_voorraad", "JJ"),
    ("83671NED", "verleende bouwvergunningen woonruimten", "vergund_kwartalen", "KW"),
]


def haal(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": "bylder-freshness/1.0 (+https://www.bylder.com)"})
    with urllib.request.urlopen(req, timeout=90, context=CTX) as resp:
        return json.load(resp)


def laatste_periode(tabel, soort):
    """Nieuwste periode die het CBS publiceert voor deze tabel."""
    data = haal("https://opendata.cbs.nl/ODataApi/OData/%s/Perioden" % tabel)
    sleutels = [p["Key"] for p in data.get("value", []) if soort in p["Key"]]
    return max(sleutels) if sleutels else None


def normaliseer(periode):
    """CBS schrijft '2025JJ00', wij bewaren soms '2025'. Vergelijk appels met
    appels: jaartallen als '2025', kwartalen als '2025KW02'."""
    if not periode:
        return None
    periode = str(periode)
    if "JJ" in periode:
        return periode.split("JJ")[0]
    return periode


def onze_periode(cache, sleutel):
    waarde = cache.get(sleutel)
    if isinstance(waarde, list):
        waarde = max(waarde) if waarde else None
    return normaliseer(waarde)


def main():
    if not os.path.isfile(CACHE):
        print("Cache ontbreekt: %s" % CACHE)
        return 1

    with open(CACHE, encoding="utf-8") as f:
        cache = json.load(f)

    print("=" * 70)
    print("CBS-VERSHEID  (gemeentepagina's /wonen-in/)")
    print("=" * 70)

    drift = []
    for tabel, omschrijving, sleutel, soort in TABELLEN:
        van_ons = onze_periode(cache, sleutel)
        try:
            bij_cbs = normaliseer(laatste_periode(tabel, soort))
        except Exception as exc:  # netwerk of API-wijziging
            print("[FOUT] %-10s %s -> %s" % (tabel, omschrijving, str(exc)[:60]))
            continue

        if van_ons is None or bij_cbs is None:
            status = "?   "
        elif bij_cbs > van_ons:
            status = "NIEUW"
            drift.append((tabel, omschrijving, van_ons, bij_cbs))
        else:
            status = "OK  "
        print("[%s] %-10s %-44s onze: %-9s cbs: %s"
              % (status, tabel, omschrijving[:44], van_ons, bij_cbs))

    print()
    if not drift:
        print("Alle cijfers zijn actueel.")
        return 0

    print("Er zijn nieuwere cijfers beschikbaar:")
    for tabel, omschrijving, van_ons, bij_cbs in drift:
        print("  - %s (%s): %s -> %s" % (omschrijving, tabel, van_ons, bij_cbs))
    print()
    print("Bijwerken gaat in twee stappen, allebei met de hand te starten:")
    print("  1. de ophaal-scripts opnieuw draaien (data/cbs-gemeenten.json)")
    print("  2. het cluster hergenereren en de bijgewerkt-datum ophogen")
    print()
    print("Niet automatisch doen: een nieuwe jaargang kan een trendzin op de")
    print("pagina onwaar maken ('de bouwstroom trekt aan'), en dat hoort een")
    print("mens te lezen voordat het live gaat.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
