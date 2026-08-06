#!/usr/bin/env python3
"""BUITEN GEBRUIK — dit signaal bestaat niet op nieuwbouw.nl.

Vastgesteld op 5 aug 2026. De "X van Y beschikbaar"-regels op een projectpagina
horen bij ANDERE projecten: ze komen uit een aanbevelingsblok. Edisonpark en
Soeterdael — twee verschillende projecten — gaven exact dezelfde vijf regels, en
op de Edisonpark-pagina wordt de eerste treffer voorafgegaan door "In verkoop —
De Pauwentuin Leidschendam".

Afbakenen helpt niet: van de 445.000 tekens op zo'n pagina gaat 17.800 over het
project zelf, en daarin staat geen beschikbaarheid, geen fases en geen oplevering.
De JSON-LD bevat alleen naam, omschrijving en locatie.

Dit script draaide 995 projecten en die cijfers stonden op 34 live pagina's.
Allemaal ongeldig, inmiddels verwijderd. Gebruik scripts/bag_bouwstatus.py, dat
op coordinaten meet in plaats van op paginatekst.

De oorspronkelijke toelichting hieronder is bewaard omdat de redenering over
momentopnamen wel klopt — alleen de bron deugde niet.

Oogst de verkoopvoortgang per nieuwbouwproject, en bewaart elke run apart.

WAAROM MOMENTOPNAMEN EN NIET ÉÉN BESTAND
----------------------------------------
Eén meting zegt "nog 4 van de 22 beschikbaar". Twee metingen zeggen "van 6 naar 4
in drie weken", en dát is het feit dat niemand anders publiceert: nieuwbouw.nl
toont de stand, niet de geschiedenis. De ontwikkelaar heeft geen belang bij een
publieke tijdlijn. Daarom schrijft dit script per run een gedateerd bestand weg;
de verschillen ertussen voeden het logboek op de projectpagina.

Uniciteit wordt zo een bijproduct van meten in plaats van een schrijfopgave. Dat
is de enige uitweg uit het plafond van 54% waar sjabloneren tegenaan liep.

WAAROM HET ZO LANGZAAM GAAT
---------------------------
Nieuwbouw.nl sluit de deur na ongeveer vijftien snelle verzoeken. Dat is geen
blokkade maar een tempo-eis: op 5 seconden per project zijn alle 976 in krap
anderhalf uur binnen. Draai het 's nachts. Bij een leeg antwoord wacht het script
langer en probeert het later opnieuw, in plaats van door te beuken.

Het `status`-veld uit de scraper is waardeloos — het staat voor alle 976 projecten
op "In verkoop", omdat dat woord in het filtermenu van elke pagina voorkomt. Wat
hier geoogst wordt is de beschikbaarheid per fase, en dat is wel echt.

Gebruik:
    python3 scripts/nieuwbouw_verkoopstatus.py           # alles, hervat waar het stopte
    python3 scripts/nieuwbouw_verkoopstatus.py --max 50  # kleine proefronde
    python3 scripts/nieuwbouw_verkoopstatus.py --delta   # toon alleen de verschillen
"""
import json, os, re, subprocess, sys, time, glob
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
SNAPSHOTS = os.path.join(ROOT, "data", "nieuwbouw-snapshots")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")

DELAY = 5.0           # onder de drempel blijven kost tijd; doorbeuken kost de hele run
RUST_NA_LEEG = 60.0   # eerste teken van afknijpen: even helemaal stoppen

BESCHIKBAAR = re.compile(r"(\d+)\s*van\s*(\d+)\s*beschikbaar", re.I)


def fetch(url):
    for poging in range(3):
        r = subprocess.run(["curl", "-s", "-m", "30", "-A", UA, url],
                           capture_output=True, text=True)
        if r.stdout and len(r.stdout) > 2000:
            return r.stdout
        time.sleep(RUST_NA_LEEG * (poging + 1))
    return ""


def parse(html):
    paren = [(int(a), int(b)) for a, b in BESCHIKBAAR.findall(html)]
    if not paren:
        return None
    besch = sum(a for a, _ in paren)
    totaal = sum(b for _, b in paren)
    return {"fases": len(paren), "beschikbaar": besch, "eenheden": totaal,
            "verkocht_pct": round(100 * (totaal - besch) / totaal) if totaal else None}


def vorige_snapshot():
    """De laatste run vóór vandaag — daartegen meten we het verschil."""
    bestanden = sorted(glob.glob(os.path.join(SNAPSHOTS, "*.json")))
    vandaag = os.path.join(SNAPSHOTS, f"{date.today()}.json")
    eerder = [b for b in bestanden if b != vandaag]
    return json.load(open(eerder[-1], encoding="utf8")) if eerder else {}


def toon_delta():
    bestanden = sorted(glob.glob(os.path.join(SNAPSHOTS, "*.json")))
    if len(bestanden) < 2:
        print(f"Nog maar {len(bestanden)} momentopname(n). Verschillen ontstaan pas "
              f"vanaf de tweede run — daar is dit script voor.")
        return
    oud = json.load(open(bestanden[-2], encoding="utf8"))
    nieuw = json.load(open(bestanden[-1], encoding="utf8"))
    a = os.path.basename(bestanden[-2])[:-5]
    b = os.path.basename(bestanden[-1])[:-5]
    print(f"Verschil {a} → {b}\n")
    n = 0
    for url, d in nieuw.items():
        v = oud.get(url)
        if not (v and d.get("beschikbaar") is not None and v.get("beschikbaar") is not None):
            continue
        if d["beschikbaar"] != v["beschikbaar"]:
            n += 1
            print(f"  {d['naam'][:40]:<42} {d['plaats']:<18} "
                  f"nog {d['beschikbaar']} van {d['eenheden']} "
                  f"(was {v['beschikbaar']}) → {d['verkocht_pct']}% verkocht")
    print(f"\n{n} projecten verschoven. Dat zijn {n} logboekregels die nergens anders staan.")


def main():
    if "--toch" not in sys.argv:
        sys.exit("Dit script is buiten gebruik: het signaal bestaat niet op nieuwbouw.nl.\n"
                 "Zie de toelichting bovenaan. Gebruik scripts/bag_bouwstatus.py.\n"
                 "Draai met --toch als je het bewijs zelf wilt reproduceren.")

    if "--delta" in sys.argv:
        return toon_delta()
    cap = 10 ** 9
    for i, a in enumerate(sys.argv):
        if a == "--max" and i + 1 < len(sys.argv):
            cap = int(sys.argv[i + 1])

    os.makedirs(SNAPSHOTS, exist_ok=True)
    projecten = json.load(open(PROJECTEN, encoding="utf8"))["projecten"]
    vandaag = os.path.join(SNAPSHOTS, f"{date.today()}.json")
    uit = json.load(open(vandaag, encoding="utf8")) if os.path.exists(vandaag) else {}
    vorig = vorige_snapshot()

    todo = [p for p in projecten if p["url"] not in uit][:cap]
    duur = len(todo) * DELAY / 60
    print(f"{len(projecten)} projecten · {len(uit)} vandaag al gemeten · {len(todo)} te gaan")
    print(f"Op {DELAY:.0f}s per project duurt dat ongeveer {duur:.0f} minuten.\n", flush=True)

    for i, p in enumerate(todo, 1):
        d = parse(fetch(p["url"])) or {}
        d.update(naam=p["naam"], plaats=p["plaats"], woningen=p.get("woningen"))
        uit[p["url"]] = d
        if d.get("eenheden"):
            v = vorig.get(p["url"], {}).get("beschikbaar")
            verschil = f"  (was {v})" if v is not None and v != d["beschikbaar"] else ""
            print(f"  {d['verkocht_pct']:>3}% verkocht  {d['beschikbaar']:>3}/{d['eenheden']:<4} "
                  f"{p['naam'][:36]:<38} {p['plaats']}{verschil}", flush=True)
        if i % 20 == 0:
            json.dump(uit, open(vandaag, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        time.sleep(DELAY)

    json.dump(uit, open(vandaag, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    met = [d for d in uit.values() if d.get("eenheden")]
    print(f"\nKLAAR — {len(uit)} gemeten, {len(met)} met beschikbaarheidsdata "
          f"({100 * len(met) // max(1, len(uit))}%). Momentopname: {os.path.basename(vandaag)}")
    if vorig:
        print("Verschillen met de vorige run: python3 scripts/nieuwbouw_verkoopstatus.py --delta")


if __name__ == "__main__":
    main()
