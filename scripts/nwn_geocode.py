#!/usr/bin/env python3
"""Coördinaten bij de projecten van Nieuw Wonen Nederland.

WAAROM DIT MOET
Zonder coördinaat meet scripts/bag_bouwstatus.py een project niet, en zonder
meting heeft de projectpagina geen logboek — precies het blok dat haar
onderscheidt van de site van de ontwikkelaar. Op 21 september 2026 haalden 115
projecten wél de publicatiepoort maar hadden ze geen coördinaat; alle 115 kwamen
uit deze tweede bron, die geen coördinaten publiceert.

WAAROM NIET OP DE PROJECTNAAM GEOCODEREN
Omdat dat de plaats teruggeeft en niet het project. "Kloostergoed Theresia Vught"
levert bij PDOK het middelpunt van Vught op, en een zoekvierkant daaromheen meet
de binnenstad in plaats van de bouwplaats. Een verkeerde meting is erger dan geen
meting: hij ziet er even geloofwaardig uit en staat straks in een logboek.

WAT WEL WERKT
De bronpagina noemt vrijwel altijd een straat, en vaak met huisnummer ("waar nu
nog de meubelzaak aan de Kooimeerlaan 17 te Alkmaar gevestigd is"). Dat adres is
een feit, geen tekst die we overnemen: we gebruiken het om te geocoderen en
publiceren alleen de meting die eruit volgt.

DE POORT
Een coördinaat wordt alleen aangenomen als PDOK een straat óf adres teruggeeft
waarvan de plaatsnaam overeenkomt met de plaats van het project. "Bakkerspad
Nijkerk" geeft Bakkerspad in Delfzijl en in Hulshorst — allebei fout, allebei met
een hoge score. Zonder die controle zet je het project 200 kilometer verderop.

Gebruik:
    python3 scripts/nwn_geocode.py            # alles wat de poort haalt en geen coördinaat heeft
    python3 scripts/nwn_geocode.py --max 10   # kleine proefronde
    python3 scripts/nwn_geocode.py --droog    # niets wegschrijven
"""
import json, os, re, subprocess, sys, time, unicodedata, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
NWN = os.path.join(ROOT, "data", "nwn-projecten.json")
UA = "BylderBot/1.0 (+https://www.bylder.com/contact/; nieuwbouwprojecten, alleen feiten)"
PDOK = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free"
DELAY = 2.0
ANKER = "Klik op een van de onderstaande knoppen."

DROOG = "--droog" in sys.argv
MAX = None
for i, a in enumerate(sys.argv):
    if a == "--max" and i + 1 < len(sys.argv):
        MAX = int(sys.argv[i + 1])

# Straatachtervoegsels waarop we een naam herkennen. Bewust niet "-hof" en
# "-park" alleen: die zitten ook in projectnamen zelf ("Condorpark"), en dan
# geocodeer je de naam van het project in plaats van zijn ligging.
STRAAT = re.compile(
    r"\b([A-ZÀ-Ý][\wÀ-ÿ'\-]*(?:\s(?:van|de|der|den|het|aan|op|te))?\s?"
    r"[\wÀ-ÿ'\-]*?(?:straat|laan|weg|plein|kade|dijk|singel|gracht|steeg|pad|baan|dreef|boulevard))"
    r"(?:\s+(\d{1,4}))?\b")


def plat(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", s.lower())


def haal(url):
    r = subprocess.run(["curl", "-sS", "-m", "30", "-A", UA, "-w", "\n%{http_code}", url],
                       capture_output=True, text=True, timeout=45)
    tekst, _, code = r.stdout.rpartition("\n")
    return tekst if code.strip() == "200" else None


def kale_tekst(h):
    t = re.sub(r"(?s)<(script|style).*?</\1>", " ", h)
    t = re.sub(r"<[^>]+>", " ", t)
    import html as H
    return re.sub(r"\s+", " ", H.unescape(t))


def straten_uit(html_tekst, naam):
    """Straatkandidaten, in de volgorde waarin ze bij het project horen.

    Alleen het stuk ná het deel-anker: daarvóór staat het menu van de site, en
    daarin komen straatnamen van andere projecten voor.
    """
    t = kale_tekst(html_tekst)
    i = t.find(ANKER)
    strook = t[i:i + 2500] if i >= 0 else t[:2500]
    uit = []
    for m in STRAAT.finditer(strook):
        straat, nr = m.group(1).strip(), m.group(2)
        # De projectnaam zelf is geen adres.
        if plat(straat) and plat(straat) in plat(naam):
            continue
        if (straat, nr) not in uit:
            uit.append((straat, nr))
    return uit[:4]


def geocodeer(straat, nr, plaats):
    """Eén kandidaat toetsen. Geeft (lat, lng, hoe) terug of None.

    De plaatsnaam moet kloppen. PDOK geeft graag een gelijknamige straat in een
    andere gemeente terug, met een even hoge score.
    """
    q = f"{straat} {nr} {plaats}" if nr else f"{straat} {plaats}"
    soort = "adres" if nr else "weg"
    url = (f"{PDOK}?q={urllib.parse.quote(q)}&rows=5"
           f"&fq={urllib.parse.quote(f'type:{soort}')}")
    rauw = haal(url)
    if not rauw:
        return None
    try:
        docs = json.loads(rauw)["response"]["docs"]
    except Exception:
        return None
    for d in docs:
        weergave = d.get("weergavenaam") or ""
        # De plaats van het project moet in de weergavenaam voorkomen, en de
        # straatnaam ook — anders is het een andere treffer die toevallig scoort.
        if plat(plaats) not in plat(weergave):
            continue
        if plat(straat) not in plat(weergave):
            continue
        punt = d.get("centroide_ll") or ""
        m = re.match(r"POINT\(([-\d.]+) ([-\d.]+)\)", punt)
        if not m:
            continue
        return float(m.group(2)), float(m.group(1)), f"{soort}: {weergave}"
    return None


def main():
    doel = json.load(open(PROJECTEN, encoding="utf8"))
    nwn = {p["url"]: p for p in json.load(open(NWN, encoding="utf8"))["projecten"]}

    def poort(p):
        return ((p.get("woningen") or 0) >= 50
                or (p.get("prijs_van") and p.get("woonoppervlak_van") and (p.get("woningen") or 0) >= 20))

    open_staand = [p for p in doel["projecten"]
                   if poort(p) and not p.get("lat") and p.get("bron") == "nieuwwonennederland.nl"]
    if MAX:
        open_staand = open_staand[:MAX]
    print(f"{len(open_staand)} projecten zonder coördinaat, {DELAY}s tussen verzoeken…\n")

    raak = mis = stuk = 0
    for i, p in enumerate(open_staand, 1):
        html_tekst = haal(p["url"])
        if not html_tekst:
            print(f"  ✗ {p['naam'][:34]:36} bronpagina niet op te halen")
            stuk += 1
            time.sleep(DELAY)
            continue
        gevonden = None
        for straat, nr in straten_uit(html_tekst, p["naam"]):
            gevonden = geocodeer(straat, nr, p["plaats"])
            time.sleep(0.4)
            if gevonden:
                break
        if gevonden:
            lat, lng, hoe = gevonden
            p["lat"], p["lng"] = lat, lng
            # Vastleggen hóé we eraan komen: een coördinaat uit een straatnaam is
            # minder precies dan een adres, en dat moet later na te gaan zijn.
            p["coordinaat_bron"] = hoe
            print(f"  ✓ {p['naam'][:34]:36} {hoe[:56]}")
            raak += 1
        else:
            print(f"  – {p['naam'][:34]:36} geen bruikbaar adres op de bronpagina")
            mis += 1
        if i % 20 == 0 and not DROOG:
            json.dump(doel, open(PROJECTEN, "w", encoding="utf8"), ensure_ascii=False, indent=1)
            print(f"     …{i}/{len(open_staand)} (tussentijds bewaard)")
        time.sleep(DELAY)

    if not DROOG:
        json.dump(doel, open(PROJECTEN, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        open(PROJECTEN, "a").write("\n")
    print(f"\n{raak} gelukt, {mis} zonder bruikbaar adres, {stuk} onbereikbaar"
          + (" (DROOGDRAAI — niets weggeschreven)" if DROOG else ""))


if __name__ == "__main__":
    main()
