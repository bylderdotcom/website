#!/usr/bin/env python3
"""Houdt het aantal deelnemende merken op de site gelijk aan de werkelijkheid.

HET PROBLEEM DAT DIT OPLOST
De site claimde op 8.669 pagina's "61 merken". Dat was ooit met de hand ingetypt
en was het aantal vouchers uit de legacy-import, niet het aantal merken. Toen er
een merk bij kwam werd het verschil groter in plaats van kleiner.

Een bezoeker telt dit nooit na. Een merk dat overweegt mee te doen wél, en dan
is een te hoog getal geen marketing maar iets wat de rest van de pagina verdacht
maakt.

SNELHEID IS HIER GEEN LUXE
Deze stap draait bij elke deploy. De eerste versie opende alle 68.000
pagina's om er twee aan te passen, en kostte in de Vercel-build vier minuten —
vier minuten wachten op elke merge, voor een correctie die alleen nodig is als
er een deelnemer bij komt. Nu zoekt grep eerst de handvol bestanden op die het
getal überhaupt dragen, en openen we alleen die. Zonder grep valt hij terug op
de oude wandeling, zodat het overal blijft werken.

WAAROM DIT OVER web/out DRAAIT EN NIET OVER DE REPO
De 8.669 statische pagina's dragen het getal in hun navigatie. Elke keer dat er
een deelnemer bij komt zou dat 8.669 gewijzigde bestanden in git opleveren voor
één cijfer — een diff waar niemand meer doorheen kijkt, en precies het soort
grote sweep waarin per ongeluk iets anders meelift.

Daarom draait dit als laatste stap van web/build.sh, over de gebouwde site. De
bron blijft leesbaar, de gepubliceerde site klopt altijd, en het aantal in
data/deelnemers.json is de enige waarheid.

RAPPORTEREN IS DE STANDAARD
Zonder vlag kijkt dit script alleen en geeft het exit-code 1 als er iets scheef
staat. Dat past bij de standing order dat loops read-only draaien. Herstellen
doe je bewust met --herstel, en dat levert een commit op die je zelf nakijkt.

Gebruik:
    python3 _scripts/merkentelling_pass.py            # alleen kijken
    python3 _scripts/merkentelling_pass.py --herstel  # ook aanpassen
    python3 _scripts/merkentelling_pass.py --dir web/out --herstel
"""
import json, os, re, subprocess, sys

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


OVERSLAAN = ("node_modules", ".git", ".claude", "_og-templates", "reports",
             "_audits", "web", "out", "output", "docs", ".next")

# Alleen bestanden waar überhaupt "<getal> merken" of "<getal> woonmerken" in
# staat. Dat zijn er een paar duizend van de 68.000, en grep vindt ze in
# seconden waar Python er minuten over doet.
GREP = r"[0-9]+ (woon)?merken"


def kandidaten(doel):
    """Paden die het getal dragen. Valt terug op een volledige wandeling als
    grep ontbreekt of struikelt — beter traag dan stil niets doen."""
    try:
        # --exclude-dir móét mee: grep -r kent OVERSLAAN niet en dook zonder
        # deze vlaggen de tool-cache in .claude in (570.000 bestanden) en de
        # build-output in web/. Dat maakte de "snelle" versie vijf keer trager
        # dan de wandeling die hij moest vervangen.
        r = subprocess.run(
            ["grep", "-rlE", "--include=*.html",
             *[f"--exclude-dir={d}" for d in OVERSLAAN], GREP, doel],
            capture_output=True, text=True, timeout=600)
        # 0 = treffers, 1 = geen treffers (allebei goed), 2 = fout
        if r.returncode in (0, 1):
            return [p for p in r.stdout.splitlines() if p]
        print(f"grep gaf {r.returncode}; volledige wandeling als terugval")
    except (OSError, subprocess.SubprocessError) as e:
        print(f"grep niet bruikbaar ({e}); volledige wandeling als terugval")
    uit = []
    for pad, mappen, bestanden in os.walk(doel):
        mappen[:] = [m for m in mappen if m not in OVERSLAAN]
        uit += [os.path.join(pad, b) for b in bestanden if b.endswith(".html")]
    return uit


def main():
    dry = "--herstel" not in sys.argv
    # Standaard de repo. Daar staan 8.700 pagina's; web/out heeft er 68.000 en
    # kost dus acht keer zoveel voor dezelfde uitkomst. Bovendien hoort een
    # correctie in de bron thuis, niet in wegwerp-output.
    doel = ROOT
    if "--dir" in sys.argv:
        doel = os.path.abspath(sys.argv[sys.argv.index("--dir") + 1])

    n = aantal_merken()
    gedaan = 0

    for p in kandidaten(doel):
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

    plek = os.path.relpath(doel, ROOT)
    if not gedaan:
        print(f"Merkentelling klopt: overal {n} merken ({plek}).")
        return 0
    if dry:
        print(f"SCHEEF — {gedaan} pagina's noemen een ander aantal dan {n} ({plek}).")
        print("Herstellen: python3 _scripts/merkentelling_pass.py --herstel")
        return 1
    print(f"{gedaan} pagina's gelijkgetrokken op {n} merken ({plek}).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
