#!/usr/bin/env python3
"""Tweede bron voor nieuwbouwprojecten: Nieuw Wonen Nederland.

WAAROM EEN TWEEDE BRON
Nieuwbouw.nl is een deelnemersmodel: ontwikkelaars koppelen hun CRM, en wie dat
niet doet staat er niet op. BPD, de grootste gebiedsontwikkelaar van Nederland,
heeft er een pagina met drie projecten. Van de 1.087 projecten die nieuwbouw.nl
publiceert hebben wij er 995 — onze scraper doet het goed, de bron dekt de markt
niet. Kloostergoed Theresia in Vught (156 woningen, BPD) was het eerste project
dat we aantoonbaar misten.

Nieuw Wonen Nederland is opgericht door ruim veertig nieuwbouwmakelaars en
publiceert 1.974 projecten.

WAT WE WEL EN NIET OVERNEMEN — DIT IS GEEN DETAIL
Hun voorwaarden verbieden het kopiëren van "materialen" en maken expliciet een
uitzondering voor citaatrecht. Ze claimen geen databankrecht en hun robots.txt
staat projectpagina's toe.

Wij nemen daarom uitsluitend FEITEN over: naam, plaats, status, prijsvork,
aantal woningen, woonoppervlak. Feiten zijn niet auteursrechtelijk beschermd.

NIET overnemen, en dat is de hele reden dat dit mag:
  - foto's en plattegronden
  - de projectomschrijving of enige andere lopende tekst

Dat is precies het verschil tussen Zoekallehuizen, dat in 2006 van de NVM won
(alleen feiten en deeplinks), en Jaap.nl, dat verloor omdat het omschrijvingen
en foto's integraal overnam.

Elke rij krijgt de bron-URL mee, zodat de projectpagina terugverwijst. Deeplinken
is geen verveelvoudiging (Hof Arnhem 2006), en we sturen ze verkeer in plaats van
het af te nemen — dat is ook de toets die het Europese Hof in CV-Online aanlegde.

BELEEFD
Eén verzoek per 1,5 seconde, één keer per run, met een herkenbare user-agent en
een contactadres. Bij een foutcode stoppen we, niet doorrammen.

Gebruik:
  python3 scripts/nwn_scraper.py --lijst          # alleen de sitemap lezen
  python3 scripts/nwn_scraper.py --haal 25        # 25 projecten ophalen
  python3 scripts/nwn_scraper.py --haal alles     # de hele lijst
  python3 scripts/nwn_scraper.py --samenvoegen    # naar nieuwbouwprojecten.json
"""
import json
import os
import re
import sys
import time
import html as htmllib
import subprocess
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UIT = os.path.join(ROOT, "data", "nwn-projecten.json")
DOEL = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
BASE = "https://www.nieuwwonennederland.nl"
SITEMAP = f"{BASE}/sitemap.xml"
DELAY = 2.0
UA = "BylderBot/1.0 (+https://www.bylder.com/contact/; nieuwbouwprojecten, alleen feiten)"

PROJECT_URL = re.compile(r"^https://www\.nieuwwonennederland\.nl/nieuwbouw/([^/]+)/([^/]+)/(\d+)$")


def haal(url):
    """Via curl, net als de nieuwbouw.nl-scraper: python op deze machine mist de
    certificaatketen, en curl gebruikt die van het systeem.

    Eén keer opnieuw proberen na een pauze. Een netwerkhapering (curl-code 000)
    is geen weigering — dat bleek bij de eerste proefronde, waar dezelfde URL
    even later gewoon 200 gaf. Een échte foutcode laten we wél staan, zodat de
    aanroeper kan stoppen."""
    for poging in (1, 2):
        r = subprocess.run(["curl", "-sS", "-m", "30", "-A", UA, "-w", "\n%{http_code}", url],
                           capture_output=True, text=True, timeout=45)
        tekst, _, code = r.stdout.rpartition("\n")
        code = code.strip()
        if code == "200":
            return tekst
        if code not in ("", "000") or poging == 2:
            raise RuntimeError(f"HTTP {code or '?'}")
        time.sleep(8)


def kale_tekst(h):
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", h, flags=re.S)
    return re.sub(r"\s+", " ", htmllib.unescape(re.sub(r"<[^>]+>", " ", t)))


def bedrag(s):
    """'€ 300.000' → 300000. Nederlandse notatie: punt is duizendtal."""
    m = re.search(r"\d[\d.]*", s or "")
    return int(m.group(0).replace(".", "")) if m else None


STATUSSEN = ("In verkoop", "Volledig verkocht", "Toekomstig", "In aanbouw",
             "Verkoop gestart", "Opgeleverd")


# De feitenstrook staat direct achter de deelknoppen, in vaste volgorde:
# <plaats> <status> <naam> <prijs>. Daarbuiten komen dezelfde woorden ook voor —
# "In verkoop" staat ook in de navigatie — dus alleen binnen dit venster kijken.
ANKER = "Klik op een van de onderstaande knoppen."


def lees_project(h, url):
    """Alleen feiten. Geen omschrijving, geen beeld — zie de kop van dit bestand."""
    t = kale_tekst(h)
    m = PROJECT_URL.match(url)
    plaats_slug, naam_slug, nummer = m.group(1), m.group(2), m.group(3)

    kop = re.search(r"<title>(.*?)</title>", h, re.S)
    naam = htmllib.unescape(kop.group(1)).strip() if kop else naam_slug.replace("-", " ").title()

    i = t.find(ANKER)
    strook = t[i + len(ANKER): i + len(ANKER) + 300] if i >= 0 else ""

    status = next((s for s in STATUSSEN if s in strook), None)

    prijs = re.search(r"€\s?([\d.]+)\s*tot\s*€\s?([\d.]+)", strook)
    prijs_van = bedrag(prijs.group(1)) if prijs else None
    prijs_tot = bedrag(prijs.group(2)) if prijs else None
    if not prijs:
        een = re.search(r"vanaf\s*€\s?([\d.]+)", strook, re.I)
        prijs_van = bedrag(een.group(1)) if een else None

    # Het aantal woningen staat er alleen als de ontwikkelaar het aanleverde;
    # bij een project in voorbereiding ontbreekt het vaak.
    aantal = re.search(r"Aantal woningen\s+(\d+)", strook)
    opp = re.search(r"Wonen\s+(\d+)\s*-\s*(\d+)\s*m", strook)

    return {
        "url": url,
        "plaats": plaats_slug,
        "naam": naam,
        "woningen": int(aantal.group(1)) if aantal else None,
        "status": status,
        "prijs_van": prijs_van,
        "prijs_tot": prijs_tot,
        "woonoppervlak_van": int(opp.group(1)) if opp else None,
        "woonoppervlak_tot": int(opp.group(2)) if opp else None,
        "bron": "nieuwwonennederland.nl",
        "bron_id": nummer,
        # Losstaand van de feiten: hiermee weten we dat deze pagina bezocht is,
        # ook als er niets bruikbaars op stond. Anders halen we hem elke ronde
        # opnieuw op, en dat is precies het onbeleefde gedrag dat we vermijden.
        "_gehaald": date.today().isoformat(),
    }


def laad():
    if os.path.exists(UIT):
        return json.load(open(UIT, encoding="utf-8"))
    return {"_bron": "nieuwwonennederland.nl — alleen feiten, geen tekst of beeld overgenomen",
            "_toelichting": "Zie de kop van scripts/nwn_scraper.py voor wat we wel en niet overnemen.",
            "projecten": []}


def bewaar(d):
    json.dump(d, open(UIT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def mode_lijst():
    print("sitemap ophalen…")
    urls = re.findall(r"<loc>([^<]+)</loc>", haal(SITEMAP))
    proj = sorted({u for u in urls if PROJECT_URL.match(u)})
    d = laad()
    bekend = {p["url"] for p in d["projecten"]}
    for u in proj:
        if u not in bekend:
            m = PROJECT_URL.match(u)
            d["projecten"].append({"url": u, "plaats": m.group(1),
                                   "naam": m.group(2).replace("-", " ").title(),
                                   "bron": "nieuwwonennederland.nl", "bron_id": m.group(3)})
    bewaar(d)
    print(f"{len(proj)} projectpagina's in de sitemap, {len(d['projecten'])} in onze lijst")


def mode_haal(hoeveel):
    d = laad()
    open_staand = [p for p in d["projecten"] if not p.get("_gehaald") and not p.get("_mislukt")]
    if hoeveel != "alles":
        open_staand = open_staand[: int(hoeveel)]
    print(f"{len(open_staand)} projecten ophalen, {DELAY}s ertussen…")
    op_url = {p["url"]: p for p in d["projecten"]}
    gelukt = 0
    for i, p in enumerate(open_staand, 1):
        try:
            p.update(lees_project(haal(p["url"]), p["url"]))
            gelukt += 1
        except RuntimeError as e:
            # Een foutcode is een signaal, geen hobbel: stoppen in plaats van
            # doorrammen. Dat is het verschil tussen beleefd en vervelend.
            print(f"  {e} op {p['url']} — gestopt")
            p["_mislukt"] = str(e)
            break
        except Exception as e:
            print(f"  fout op {p['url']}: {e}")
            p["_mislukt"] = str(e)[:80]
        if i % 25 == 0:
            bewaar(d); print(f"  …{i}/{len(open_staand)}")
        time.sleep(DELAY)
    bewaar(d)
    print(f"{gelukt} projecten opgehaald")


def sleutel(naam, plaats):
    return re.sub(r"[^a-z0-9]", "", f"{naam}{plaats}".lower())


def mode_samenvoegen():
    """Zet wat nieuwbouw.nl niet heeft in de hoofdlijst, met bron erbij."""
    nwn = laad()["projecten"]
    doel = json.load(open(DOEL, encoding="utf-8"))
    bestaand = {sleutel(p.get("naam", ""), p.get("plaats", "")) for p in doel["projecten"]}
    nieuw = 0
    for p in nwn:
        if p.get("woningen") is None:
            continue
        if sleutel(p["naam"], p["plaats"]) in bestaand:
            continue
        doel["projecten"].append({
            "url": p["url"], "plaats": p["plaats"], "naam": p["naam"],
            "woningen": p["woningen"], "status": p.get("status"),
            "oplevering": None, "oplevering_bron": None, "jaren": None,
            "handmatig": True,          # overleeft een nieuwbouw.nl-scrape
            "bron": "nieuwwonennederland.nl",
        })
        nieuw += 1
    json.dump(doel, open(DOEL, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{nieuw} projecten toegevoegd; totaal {len(doel['projecten'])}")


if __name__ == "__main__":
    a = sys.argv[1:]
    if "--lijst" in a:
        mode_lijst()
    elif "--haal" in a:
        mode_haal(a[a.index("--haal") + 1] if len(a) > a.index("--haal") + 1 else "25")
    elif "--samenvoegen" in a:
        mode_samenvoegen()
    else:
        print(__doc__)
