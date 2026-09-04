#!/usr/bin/env python3
"""Zet het aantal merken met een voucher gelijk aan wat er werkelijk staat.

WAAROM
De site claimt op 8.680 pagina's "61 merken". Dat getal is ooit met de hand
ingetypt en klopt niet meer: er staan 62 goedgekeurde vouchers van 56 merken.
Het aantal vouchers en het aantal merken zijn niet hetzelfde getal, en dat is
precies waar het misging.

Een bezoeker telt dit nooit na. Een merk dat overweegt mee te doen wél, en dan
is een te hoog getal geen marketing maar een leugen die de rest van de pagina
verdacht maakt.

DIT BLIJFT HANDWERK ZOLANG HET GETAL HARDGECODEERD IS. De echte oplossing is dat
de nav dit uit data/deelnemers.json haalt, net als de deelnemerswand. Tot die
tijd: dit script na elke nieuwe deelnemer draaien.

Gebruik:
    python3 _scripts/merkentelling_pass.py --dry
    python3 _scripts/merkentelling_pass.py
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DRY = "--dry" in sys.argv
OVERSLAAN = ("web/", "node_modules/", ".git/", ".claude/", "_og-templates/",
             "output/", "docs/", "reports/", "_audits/")


def aantal_merken():
    d = json.load(open(os.path.join(ROOT, "data", "deelnemers.json"), encoding="utf8"))
    lijst = d["deelnemers"] if isinstance(d, dict) else d
    return len({x["naam"] for x in lijst if x.get("naam")})


def main():
    n = aantal_merken()
    paren = [("61 merken", f"{n} merken"), ("61 woonmerken", f"{n} woonmerken")]
    if n == 61:
        print("Het getal klopt al; niets te doen.")
        return

    gedaan = 0
    for pad, mappen, bestanden in os.walk(ROOT):
        rel = os.path.relpath(pad, ROOT).replace(os.sep, "/") + "/"
        if any(rel.startswith(o) for o in OVERSLAAN):
            mappen[:] = []
            continue
        for b in bestanden:
            if not b.endswith(".html"):
                continue
            p = os.path.join(pad, b)
            try:
                h = open(p, encoding="utf8").read()
            except (UnicodeDecodeError, OSError):
                continue
            nieuw = h
            for oud, new in paren:
                nieuw = nieuw.replace(oud, new)
            if nieuw != h:
                if not DRY:
                    open(p, "w", encoding="utf8").write(nieuw)
                gedaan += 1

    print(f"{'DROOGDRAAI — ' if DRY else ''}{gedaan} pagina's van 61 naar {n} merken")


if __name__ == "__main__":
    main()
