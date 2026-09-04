#!/usr/bin/env python3
"""Houdt het aantal deelnemende merken op de site gelijk aan de werkelijkheid.

HET PROBLEEM DAT DIT OPLOST
De site claimde op 8.669 pagina's "61 merken". Dat was ooit met de hand ingetypt
en was het aantal vouchers uit de legacy-import, niet het aantal merken. Toen er
een merk bij kwam werd het verschil groter in plaats van kleiner.

Een bezoeker telt dit nooit na. Een merk dat overweegt mee te doen wél, en dan
is een te hoog getal geen marketing maar iets wat de rest van de pagina verdacht
maakt.

WAAROM DIT OVER web/out DRAAIT EN NIET OVER DE REPO
De 8.669 statische pagina's dragen het getal in hun navigatie. Elke keer dat er
een deelnemer bij komt zou dat 8.669 gewijzigde bestanden in git opleveren voor
één cijfer — een diff waar niemand meer doorheen kijkt, en precies het soort
grote sweep waarin per ongeluk iets anders meelift.

Daarom draait dit als laatste stap van web/build.sh, over de gebouwde site. De
bron blijft leesbaar, de gepubliceerde site klopt altijd, en het aantal in
data/deelnemers.json is de enige waarheid.

Gebruik:
    python3 _scripts/merkentelling_pass.py --dry
    python3 _scripts/merkentelling_pass.py --dir web/out
"""
import json, os, re, sys

HIER = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HIER, "..")

# Alleen deze formuleringen worden aangepast. Een blinde regex op "<getal>
# merken" zou ook "drie merken die dit systeem leveren" in een artikel raken —
# een zin die niets met deelnemers te maken heeft en niet mag meebewegen.
ZINNEN = [
    re.compile(r"(Ledenkorting bij )\d+( merken)"),
    re.compile(r"(orting bij )\d+( merken)"),
    re.compile(r"(orting bij )\d+( woonmerken)"),
    re.compile(r"(ortingen bij )\d+( merken)"),
    re.compile(r"(Kortingsvouchers bij )\d+( woonmerken)"),
    re.compile(r"(\b)\d+( woonmerken)"),
]


def aantal_merken():
    with open(os.path.join(ROOT, "data", "deelnemers.json"), encoding="utf8") as f:
        d = json.load(f)
    lijst = d["deelnemers"] if isinstance(d, dict) else d
    return len({x["naam"] for x in lijst if x.get("naam")})


def main():
    dry = "--dry" in sys.argv
    # Standaard de gebouwde site: daar hoort dit te draaien, en de bron blijft
    # met rust. Een pad meegeven kan, bijvoorbeeld om één map te controleren.
    doel = os.path.join(ROOT, "web", "out")
    if "--dir" in sys.argv:
        doel = os.path.abspath(sys.argv[sys.argv.index("--dir") + 1])

    n = aantal_merken()
    overslaan = ("node_modules", ".git", ".claude", "_og-templates", "reports", "_audits")
    gedaan = 0

    for pad, mappen, bestanden in os.walk(doel):
        mappen[:] = [m for m in mappen if m not in overslaan]
        for b in bestanden:
            if not b.endswith(".html"):
                continue
            p = os.path.join(pad, b)
            try:
                h = open(p, encoding="utf8").read()
            except (UnicodeDecodeError, OSError):
                continue
            nieuw = h
            for z in ZINNEN:
                nieuw = z.sub(lambda m: f"{m.group(1)}{n}{m.group(2)}", nieuw)
            if nieuw != h:
                if not dry:
                    open(p, "w", encoding="utf8").write(nieuw)
                gedaan += 1

    print(f"{'DROOGDRAAI — ' if dry else ''}{gedaan} pagina's gelijkgetrokken op {n} merken "
          f"({os.path.relpath(doel, ROOT)})")


if __name__ == "__main__":
    main()
