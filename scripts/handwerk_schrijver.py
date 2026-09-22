#!/usr/bin/env python3
"""Vijf opgezochte feiten per nieuwbouwproject, met vindplaats.

WAAROM DIT BESTAAT
De projectpagina's halen alles uit databases en komen daardoor op 20% eigen
tekst uit; de vier met de hand geschreven pagina's op 81-86%. Vier ingrepen om
dat gat te dichten zijn gemeten en bleven allemaal binnen één punt:

    logboek als verhaal              +0,5
    negentig gedeelde woorden weg    +0,4
    geoogste feiten in volzinnen     -1,1
    geoogste feiten in korte rijen   -1,0

De twee laatste gingen omláág. De reden is steeds dezelfde: alles wat wij uit
een kleine woordenschat samenstellen, herhaalt zich over driehonderd pagina's.
Negen kenmerken en drie labels leveren dezelfde negen zinnen in een andere
volgorde. Variatie ontstaat alleen als de tekst per project echt anders
geformuleerd is, en dat kan alleen als de bron per project anders is.

Daarom leest dit script de eigen website van elk project en laat het daar vijf
feiten uit halen — dezelfde vijf die de handgeschreven pagina's sterk maken.

DE BRONPLICHT IS DE HELE POINT
Elk feit krijgt de URL waar het gevonden is en de datum waarop dat gebeurde.
generate_projectpaginas.py toont een feit alléén met alle drie (waarde, bron,
controledatum) en gooit het na 400 dagen weg. Een feit zonder vindplaats komt
niet op de pagina — niet met een slag om de arm, niet met "waarschijnlijk".

WAT HET MODEL WEL EN NIET MAG
Wel: samenvatten wat er letterlijk op de opgehaalde pagina staat, in onze eigen
woorden. Niet: aanvullen uit eigen kennis, gissen, of de sfeertekst van de
ontwikkelaar overnemen. Weet het het niet, dan blijft het veld leeg — en leeg is
hier het goede antwoord, want een verzonnen bestemmingsplan staat op de pagina
waarop iemand zijn verhuizing plant.

Na afloop wordt elk feit nagelopen: de inhoudswoorden moeten in de opgehaalde
tekst terug te vinden zijn. Wat dat niet haalt, wordt weggegooid en geteld.

Gebruik:
    python3 scripts/handwerk_schrijver.py --max 10        # proefronde
    python3 scripts/handwerk_schrijver.py                 # alles met een site
    python3 scripts/handwerk_schrijver.py --droog         # niets wegschrijven
"""
import json, os, re, subprocess, sys, time
import html as H
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
SITES = os.path.join(ROOT, "data", "projectsites.json")
UIT = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project", "handwerk-feiten.json")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")
DELAY = 1.5
MAX_TEKST = 22000          # tekens per project die we aan het model geven
MODEL = "claude-haiku-4-5-20251001"   # volumewerk hoort op het goedkope model

DROOG = "--droog" in sys.argv
MAX = None
for i, a in enumerate(sys.argv):
    if a == "--max" and i + 1 < len(sys.argv):
        MAX = int(sys.argv[i + 1])

# Elf velden. De eerste ronde vulde er gemiddeld twee tot drie per project, en
# leverde daarmee +2,6 punt uniciteit op de behandelde pagina's. Meer velden is
# de goedkoopste manier om dat verder te brengen: dezelfde opgehaalde tekst,
# dezelfde controle, alleen meer waar we naar kijken.
#
# De zes nieuwe zijn gekozen op wat een koper moet weten vóór hij over meerwerk
# beslist — en niet op wat mooi staat. Het opleverniveau is daarvan de
# belangrijkste: of de keuken, het sanitair en het tegelwerk erin zitten,
# bepaalt of de meerwerklijst over duizenden of over tienduizenden euro's gaat.
VELDEN = ["historie", "starterslening", "ontwikkelaar", "bestemming", "voorzieningen",
          "opleverniveau", "kopersopties", "bouwwijze", "buitenruimte", "parkeren",
          "fasering"]

OPDRACHT = """Je krijgt de tekst van de eigen website van een Nederlands nieuwbouwproject.

Haal er hoogstens vijf feiten uit, voor deze velden:

- historie: wat er vroeger op deze plek stond of wat er gesloopt is
- starterslening: koopregelingen die dit project of deze gemeente noemt
  (starterslening, koopgarant, erfpacht, sociale koop, zelfbewoningsplicht)
- ontwikkelaar: wie het ontwikkelt of bouwt, en welke rol die partij heeft
- bestemming: bestemmingsplan, welstand, of regels over aanbouwen en dakkapellen
- voorzieningen: wat er in de wijk komt of al is (school, winkels, park, halte)
- opleverniveau: wat er wel en niet in de koopsom zit — keuken, sanitair,
  tegelwerk, vloerafwerking, schilderwerk; casco of afgewerkt
- kopersopties: wat het project zegt over meerwerk, optielijst, showroom,
  kopersbegeleiding en sluitingsdata van keuzes
- bouwwijze: constructie en materialen (metselwerk, prefab, houtskeletbouw,
  gietbouw), en wat dat betekent voor wanden en installaties
- buitenruimte: tuin, balkon, dakterras, berging, en de oriëntatie ervan
- parkeren: parkeerplaats bij de woning, parkeerkelder, parkeernorm, vergunning
- fasering: hoeveel fases het project heeft, welke nu loopt, hoeveel woningen
  per fase

HARDE REGELS
1. Alleen wat LETTERLIJK in de aangeleverde tekst staat. Niets aanvullen uit
   eigen kennis, ook niet als je het zeker weet.
2. Weet je het niet, laat het veld dan weg. Leeg is goed. Vijf velden invullen
   is geen doel.
3. Schrijf in je eigen woorden, in het Nederlands, twee tot drie zinnen per
   veld. Neem geen zinnen van de ontwikkelaar over en gebruik geen
   verkooptaal ("uniek", "droomwoning", "ruimtelijk opgezet").
4. Noem bij elk feit de bron-URL die je onderaan de tekst bij dat fragment
   aantreft, precies zoals hij er staat.
5. Schrijf voor iemand die daar een woning koopt en moet beslissen over
   meerwerk en afwerking. Concreet, geen sfeer.

Antwoord UITSLUITEND met JSON, zonder tekst eromheen:
{"historie": {"waarde": "...", "bron": "https://..."}, "bestemming": {...}}
Laat velden die je niet kunt vullen helemaal weg. Geen markdown, geen uitleg."""


def haal(url):
    try:
        r = subprocess.run(["curl", "-sSL", "-m", "25", "-A", UA, url],
                           capture_output=True, text=True, timeout=40)
        return r.stdout if r.returncode == 0 else ""
    except Exception:
        return ""


def kale_tekst(h):
    h = re.sub(r"<(script|style|noscript|svg)\b[^>]*>.*?</\1>", " ", h, flags=re.S | re.I)
    return re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", h))).strip()


def claude(prompt, sleutel):
    body = json.dumps({
        "model": MODEL, "max_tokens": 2600,
        "system": OPDRACHT,
        "messages": [{"role": "user", "content": prompt}],
    })
    r = subprocess.run(
        ["curl", "-sS", "-m", "90", "https://api.anthropic.com/v1/messages",
         "-H", f"x-api-key: {sleutel}", "-H", "anthropic-version: 2023-06-01",
         "-H", "content-type: application/json", "-d", body],
        capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
    except Exception:
        return None, f"onleesbaar antwoord: {r.stdout[:120]}"
    if "error" in d:
        return None, d["error"].get("message", "")[:140]
    tekst = "".join(b.get("text", "") for b in d.get("content", []))
    m = re.search(r"\{.*\}", tekst, re.S)
    if not m:
        return None, "geen JSON in het antwoord"
    try:
        return json.loads(m.group(0)), None
    except Exception:
        return None, "JSON niet te ontleden"


def inhoudswoorden(s):
    """Woorden die iets betekenen: langer dan vijf letters, geen stopwoord."""
    stop = {"worden", "wordt", "hebben", "tussen", "volgens", "hiervoor", "daarbij",
            "waarbij", "waardoor", "project", "woningen", "woning", "bewoners",
            "gemeente", "ongeveer", "mogelijk", "verschillende", "bijvoorbeeld"}
    return {w for w in re.findall(r"[a-zà-ü]{6,}", s.lower()) if w not in stop}


def controleer(waarde, bron_tekst):
    """Hoeveel van de inhoudswoorden komt in de opgehaalde tekst terug?

    Een samenvatting in eigen woorden haalt hier geen 100%, en dat hoeft ook
    niet. Maar een verzonnen feit deelt vrijwel niets met de bron; de grens
    ligt daarom laag genoeg om herformulering door te laten en hoog genoeg om
    verzinsels te vangen.
    """
    w = inhoudswoorden(waarde)
    if not w:
        return 0.0
    laag = bron_tekst.lower()
    return sum(1 for x in w if x in laag) / len(w)


DREMPEL = 0.55


def main():
    sleutel = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not sleutel:
        sys.exit("ANTHROPIC_API_KEY ontbreekt. In Actions komt hij uit de repo-secret; "
                 "lokaal moet hij in de omgeving staan.")

    sites = json.load(open(SITES, encoding="utf8"))
    projecten = {p["url"]: p for p in json.load(open(PROJECTEN, encoding="utf8"))["projecten"]}
    bestaand = json.load(open(UIT, encoding="utf8")) if os.path.exists(UIT) else {}

    def slugify(naam, plaats):
        s = re.sub(r"[^a-z0-9]+", "-", f"{naam} {plaats}".lower()).strip("-")
        return re.sub(r"-{2,}", "-", s)

    todo = [(u, v) for u, v in sites.items()
            if v.get("site") and not v.get("_onbereikbaar") and u in projecten]
    if MAX:
        todo = todo[:MAX]
    print(f"{len(todo)} projecten met een eigen site\n")

    geschreven = gewogen = leeg = mis = 0
    for i, (url, info) in enumerate(todo, 1):
        p = projecten[url]
        slug = slugify(p["naam"], p["plaats"])
        naam = re.sub(r"\s+", " ", p["naam"]).strip()

        # Dezelfde pagina's die de oogst al bruikbaar vond, plus de voorpagina.
        paginas, tekst = info.get("gekeken") or [info["site"]], []
        for u in paginas[:5]:
            h = haal(u)
            if h:
                t = kale_tekst(h)[:6000]
                if t:
                    tekst.append(f"--- bron: {u} ---\n{t}")
            time.sleep(DELAY)
        if not tekst:
            print(f"  ✗ {naam[:34]:36} niets op te halen")
            mis += 1
            continue

        bron_tekst = "\n\n".join(tekst)[:MAX_TEKST]
        antwoord, fout = claude(f"Project: {naam} in {p['plaats']}\n\n{bron_tekst}", sleutel)
        if fout:
            print(f"  ✗ {naam[:34]:36} {fout}")
            mis += 1
            continue

        vak = bestaand.get(slug) or {}
        erin = []
        for veld in VELDEN:
            f = (antwoord or {}).get(veld) or {}
            waarde, bron = (f.get("waarde") or "").strip(), (f.get("bron") or "").strip()
            if not waarde or not bron.startswith("http"):
                continue
            score = controleer(waarde, bron_tekst)
            if score < DREMPEL:
                gewogen += 1
                continue
            vak[veld] = {"waarde": waarde, "bron": bron,
                         "gecontroleerd_op": date.today().isoformat()}
            erin.append(veld)
        if erin:
            bestaand[slug] = vak
            geschreven += 1
            print(f"  ✓ {naam[:34]:36} {', '.join(erin)}")
        else:
            leeg += 1
            print(f"  · {naam[:34]:36} geen feit dat de controle haalde")

        if i % 10 == 0 and not DROOG:
            json.dump(bestaand, open(UIT, "w", encoding="utf8"),
                      ensure_ascii=False, indent=1, sort_keys=True)

    if not DROOG:
        json.dump(bestaand, open(UIT, "w", encoding="utf8"),
                  ensure_ascii=False, indent=1, sort_keys=True)
        open(UIT, "a").write("\n")

    print(f"\n{geschreven} projecten met feiten, {leeg} zonder, {mis} mislukt. "
          f"{gewogen} feiten weggegooid omdat ze niet in de bron terug te vinden waren.")


if __name__ == "__main__":
    main()
