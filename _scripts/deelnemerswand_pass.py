#!/usr/bin/env python3
"""Zet de deelnemerswand op /deelnemer-worden/ en de merken-subpagina.

WAAROM
------
Een merk dat overweegt mee te doen wil één ding weten dat op geen van beide
pagina's staat: wie doet er al mee. Dat is niet ijdelheid maar risicoafweging —
meedoen met vijfenvijftig bedrijven is iets anders dan de eerste zijn.

De namen staan in data/deelnemers.json, mét categorie. Logo's ontbreken voor een
deel van de deelnemers; namen met hun categorie zijn genoeg en voorkomen een
wand die half leeg oogt.

WAT ER BEWUST NIET IN ZIT
- Geen regiocijfers ("in uw regio doen er al X mee"). Die data bestaat niet.
- Geen kortingspercentages per deelnemer op deze pagina: dat is de afspraak met
  dat merk en hoort in de overeenkomst, niet in een wervingswand.
- Het aantal komt uit het bestand en wordt nergens hardgecodeerd; het groeit.

Gebruik:
    python3 _scripts/deelnemerswand_pass.py --dry
    python3 _scripts/deelnemerswand_pass.py
"""
import html, json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DRY = "--dry" in sys.argv
MERK = "Wie er al meedoen"
PAGINAS = ["deelnemer-worden/index.html", "deelnemer-worden/merken/index.html"]


def wand():
    d = json.load(open(os.path.join(ROOT, "data", "deelnemers.json"), encoding="utf8"))
    lijst = d["deelnemers"] if isinstance(d, dict) else d
    lijst = [x for x in lijst if x.get("naam")]
    lijst.sort(key=lambda x: (x.get("cat") or "", x["naam"]))
    n = len(lijst)
    categorieen = len({x.get("cat") for x in lijst if x.get("cat")})

    kaartjes = "".join(
        f'<div style="background:#fff;border:1px solid rgba(61,46,30,0.12);border-radius:11px;'
        f'padding:11px 14px;">'
        f'<div style="font-weight:700;font-size:14px;color:#1A1208;line-height:1.35;">'
        f'{html.escape(x["naam"])}</div>'
        f'<div style="font-size:12px;color:rgba(61,46,30,0.6);margin-top:2px;">'
        f'{html.escape(x.get("cat") or "")}</div></div>'
        for x in lijst)

    return (
        f'\n  <div style="margin:34px 0 0;">'
        f'<div style="font-family:\'Space Mono\',monospace;font-size:11px;letter-spacing:.09em;'
        f'text-transform:uppercase;color:#B85C38;font-weight:700;margin-bottom:6px;">'
        f'{MERK}</div>'
        f'<h2 style="font-size:1.35rem;font-weight:800;color:#1A1208;margin:0 0 6px;">'
        f'{n} merken en winkels, in {categorieen} categorie&euml;n</h2>'
        f'<p style="font-size:14.5px;color:rgba(61,46,30,0.74);line-height:1.7;margin:0 0 16px;'
        f'max-width:64ch;">Van wandtegels tot zonwering. Elk van hen bepaalde zelf aan welke '
        f'onderdelen van de overeenkomst hij meedoet.</p>'
        f'<div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">'
        f'{kaartjes}</div></div>\n')


def main():
    blok = wand()
    gedaan = overgeslagen = 0
    for rel in PAGINAS:
        p = os.path.join(ROOT, rel)
        if not os.path.exists(p):
            print("  mist:", rel)
            continue
        h = open(p, encoding="utf8").read()
        if MERK in h:
            overgeslagen += 1
            continue
        # Vóór het tarievenkaart-blok, dat zelf vlak voor </main> staat: eerst
        # wie er meedoen, dan waar je ja tegen zegt.
        anker = '\n  <div style="background:#fff;border:1px solid rgba(61,90,62,0.3);border-radius:14px;'
        if anker in h:
            h = h.replace(anker, blok + anker, 1)
        else:
            m = re.search(r"</main>", h)
            if not m:
                print("  geen invoegpunt:", rel)
                continue
            h = h[:m.start()] + blok + h[m.start():]
        if not DRY:
            open(p, "w", encoding="utf8").write(h)
        gedaan += 1
        print("  ok:", rel)

    print(f"{'DROOGDRAAI — ' if DRY else ''}{gedaan} pagina's, {overgeslagen} hadden hem al.")


if __name__ == "__main__":
    main()
