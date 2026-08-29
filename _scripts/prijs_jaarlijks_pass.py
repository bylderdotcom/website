#!/usr/bin/env python3
"""Trekt de vakbedrijf-prijs site-breed gelijk: van eenmalig 79 euro naar 79 euro per jaar.

WAAROM
------
Besluit Daniel, 29 augustus 2026. Twee pagina's beweerden verschillende dingen:
/inkoopvoordeel/ zegt 79 euro per jaar, /voor-vakbedrijven/ zei op vier plekken dat
het bedrag eenmalig was en dat er geen abonnement aan vastzat. Dat is geen stijlverschil maar een
tegenstrijdige prijsbelofte, en de site staat er op 28.000 pagina's mee vol —
elke vak-stadpagina en elk bedrijfsprofiel draagt de zin mee.

"Geen abonnement" moet mee weg. Bij een jaarlijkse bijdrage is dat niet langer
waar, en het is precies het soort zin waar de claim-bewaker op let: iets wat de
pagina belooft en het product niet waarmaakt.

WAT DIT NIET DOET
-----------------
Het bedrag zelf blijft €79 en de rest van de propositie blijft staan. Dit is een
prijsvorm-correctie, geen herschrijving.

De app-repo (betaalpagina, Paywall, facturatie) staat hier buiten. Daar moet
dezelfde correctie gebeuren, maar die repo heeft zijn eigen uitrol.

Gebruik:
    python3 _scripts/prijs_jaarlijks_pass.py --dry
    python3 _scripts/prijs_jaarlijks_pass.py
"""
import os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DRY = "--dry" in sys.argv

# Volgorde telt: de langste, meest specifieke formulering eerst, anders knipt een
# kortere vervanging het staartje af waar de langere op matcht.
# WAARSCHUWING: de zoekstrings hieronder staan bewust in stukken. Bij de eerste
# ronde stond de volledige zin er letterlijk, en dit script staat zelf in _scripts/
# — dus het herschreef zijn eigen bron en hield daarna niets meer om op te
# zoeken. Opgeknipte strings en de uitsluiting van dit bestand voorkomen dat.
E = "een" + "malig"

VERVANG = [
    # --- volledige zinnen met "geen abonnement" ---
    (f"Je profiel activeren kost {E} &euro;79 (geen abonnement).",
     "Je profiel activeren kost &euro;79 per jaar."),
    (f"kost {E} &euro;79 (geen abonnement). Geen terugkerende leadkosten.",
     "kost &euro;79 per jaar. Geen leadkosten, geen veiling."),
    (f"kost {E} &euro;79 (geen abonnement).", "kost &euro;79 per jaar."),
    (f"kost {E} &euro;79. Geen abonnement en geen terugkerende leadkosten.",
     "kost &euro;79 per jaar. Geen leadkosten en geen veiling."),
    (f"E{E[1:]} &euro;79 &mdash; geen abonnement", "&euro;79 per jaar"),
    (f"E{E[1:]} &euro;79. Geen abonnement, geen veiling, geen kosten per lead.",
     "&euro;79 per jaar. Geen veiling, geen kosten per lead."),
    (f"E{E[1:]}. Geen abonnement, geen leadkosten.",
     "Per jaar. Geen leadkosten, geen veiling."),
    # --- schema en losse beweringen die de prijsvorm noemen ---
    (f"E{E[1:]}e activering van een vakbedrijf-profiel, geen abonnement.",
     "Jaarlijkse activering van een vakbedrijf-profiel."),
    (f"E{E[1:]} betalen en je bent live", "Eén bedrag per jaar en je bent live"),
    # --- losse formuleringen ---
    (f"Activeer je profiel {E} voor &euro;79 en", "Activeer je profiel voor &euro;79 per jaar en"),
    (f"je activeert het voor {E} &euro;79.", "je activeert het voor &euro;79 per jaar."),
    (f"Sta waar kopers je zoeken &mdash; voor {E} &euro;79",
     "Sta waar kopers je zoeken &mdash; voor &euro;79 per jaar"),
    (f"sta waar kopers je zoeken \u2014 {E} \u20ac79",
     "sta waar kopers je zoeken \u2014 \u20ac79 per jaar"),
    (f"{E} voor &euro;79", "voor &euro;79 per jaar"),
    (f"{E} &euro;79 (geen abonnement)", "&euro;79 per jaar"),
    (f"{E} &euro;79", "&euro;79 per jaar"),
    (f"{E} \u20ac79 (geen abonnement)", "\u20ac79 per jaar"),
    (f"E{E[1:]} \u20ac79", "\u20ac79 per jaar"),
    (f"{E} \u20ac79", "\u20ac79 per jaar"),
]

# "E{E[1:]} Bylder-account" op 5.095 pagina's blijft staan: dat gaat over het
# gratis account van een bewoner, niet over de bijdrage van een vakbedrijf.

# Mappen zonder publieke functie of met hun eigen uitrol.
SKIP = {".git", "node_modules", "web", "out", ".next", "__pycache__", "output",
        "bylder-seo-v3", "bylder-seo-v4", "bylder-seo-v5", ".claude", "_audits",
        "reports", "docs"}
EXT = (".html", ".py", ".tsx", ".ts", ".json")


def verwerk(tekst):
    n = 0
    for oud, nieuw in VERVANG:
        if oud in tekst:
            n += tekst.count(oud)
            tekst = tekst.replace(oud, nieuw)
    return tekst, n


def main():
    bestanden = vervangingen = 0
    per_map = {}
    zelf = os.path.abspath(__file__)
    for dirpath, dirnames, files in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP]
        for f in files:
            if not f.endswith(EXT):
                continue
            pad = os.path.join(dirpath, f)
            if os.path.abspath(pad) == zelf:
                continue
            try:
                t = open(pad, encoding="utf8").read()
            except (UnicodeDecodeError, OSError):
                continue
            if "enmalig" not in t:
                continue
            nieuw, n = verwerk(t)
            if not n:
                continue
            if not DRY:
                open(pad, "w", encoding="utf8").write(nieuw)
            bestanden += 1
            vervangingen += n
            top = os.path.relpath(pad, ROOT).split(os.sep)[0]
            per_map[top] = per_map.get(top, 0) + n

    print(f"{'DROOGDRAAI — ' if DRY else ''}{vervangingen} vervangingen in "
          f"{bestanden} bestanden.\n")
    for m, n in sorted(per_map.items(), key=lambda x: -x[1])[:14]:
        print(f"  {m:<28} {n:>6}")

    # Wat er ná deze pass nog aan "eenmalig" overblijft is niet per se fout — het
    # woord komt ook in andere zinnen voor — maar het is wel het enige plekje waar
    # een gemiste prijsbelofte zich nog kan verstoppen. Dus tellen en tonen.
    rest = 0
    for dirpath, dirnames, files in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP]
        for f in files:
            if not f.endswith(EXT):
                continue
            try:
                t = open(os.path.join(dirpath, f), encoding="utf8").read()
            except (UnicodeDecodeError, OSError):
                continue
            if "enmalig" in t and ("79" in t):
                rest += 1
    print(f"\n{rest} bestanden bevatten na afloop nog 'eenmalig' én '79' — nakijken.")


if __name__ == "__main__":
    main()
