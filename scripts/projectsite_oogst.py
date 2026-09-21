#!/usr/bin/env python3
"""Feiten van de eigen website van een nieuwbouwproject.

WAAROM
Onze projectpagina's halen alles uit databases: het Kadaster, het CBS, onze eigen
bedrijvenlijst. Dat maakt ze feitelijk maar inwisselbaar — 17% van de tekst op een
gegenereerde pagina is uniek, tegen 84% op de vier die met de hand zijn geschreven.
Het verschil zit niet in het sjabloon maar in onderzoek: de handgeschreven pagina's
noemen de ontwikkelaar, de planning, en of er een optielijst te downloaden is.

Die dingen staan op de website van het project zelf. Die site is te vinden: hij
staat als enige externe link op de bronpagina.

WAT WE OVERNEMEN, EN WAT NIET
Alleen feiten, en alleen als ze letterlijk op de gevonden pagina staan. Geen
omschrijvingen, geen sfeerteksten, geen beeld. Elk feit wordt bewaard mét de URL
waar het vandaan komt, zodat het na te lopen is.

DE TWEE EERSTE FEITENFAMILIES
1. Verkoopstand volgens het project zelf ("fase 1 is uitverkocht", "start verkoop
   fase 2"). Dat is een uitspraak van de verkopende partij, met een datum eraan.
2. Welke documenten het project publiceert. Of er een technische omschrijving en
   een optielijst te downloaden zijn, is voor een koper direct bruikbaar: zonder
   die twee weet je niet wat je kunt kiezen en tegen welke prijs. Op de
   handgeschreven pagina van Haarlemszicht is precies dat de sterkste alinea.

Gebruik:
    python3 scripts/projectsite_oogst.py --max 20     # proefronde
    python3 scripts/projectsite_oogst.py              # alles wat de poort haalt
    python3 scripts/projectsite_oogst.py --droog      # niets wegschrijven
"""
import json, os, re, subprocess, sys, time
import html as H
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
UIT = os.path.join(ROOT, "data", "projectsites.json")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")
DELAY = 1.5
MAX_SUBPAGINAS = 5

DROOG = "--droog" in sys.argv
MAX = None
for i, a in enumerate(sys.argv):
    if a == "--max" and i + 1 < len(sys.argv):
        MAX = int(sys.argv[i + 1])

# Domeinen die op een bronpagina staan maar niets met het project te maken hebben.
NEGEER = ('nieuwbouw.nl', 'nieuwwonennederland.nl', 'facebook', 'google', 'twitter',
          'x.com', 'linkedin', 'instagram', 'youtube', 'gstatic', 'cloudflare',
          'jsdelivr', 'cookiebot', 'hotjar', 'doubleclick', 'adobe', 'typekit',
          'w3.org', 'schema.org', 'vimeo', 'bing', 'sentry', 'whatsapp',
          'fontawesome', 'neprom.nl', 'woningbouwers.nl', 'websitevhjaar.nl',
          'xitres.io', 'googleapis', 'jquery', 'apple.com', 'amazonaws.com',
          'woningborg.nl', 'swk.nl', 'bootstrapcdn', 'unpkg', 'gravatar')

# Subpagina's die feiten dragen. De voorpagina is meestal een sfeerpagina; de
# planning en de documenten staan een klik verderop.
WAARDEVOL = re.compile(
    r'(woningaanbod|woningtype|aanbod|download|document|brochure|verkoop|'
    r'planning|bouwnummer|over-|het-project|nieuws|prijslijst|beschikbaar)', re.I)

DOCUMENTEN = {
    "technische omschrijving": r'technische\s+omschrijving',
    "optielijst":              r'optie(?:lijst|formulier)|meerwerklijst|kopersopties',
    "verkooptekeningen":       r'verkooptekening|situatietekening|plattegrond',
    "verkoopbrochure":         r'brochure|verkoopdocumentatie',
}

# DATUMS ZIJN DE POORT
# De eerste versie zocht op woorden als "in verkoop", en las daarmee ook
# "wil je op de hoogte blijven van de start verkoop? schrijf je in" als een
# verkoopstand. Dat is een uitnodiging, geen feit.
#
# Wat een uitspraak van een uitnodiging onderscheidt, is een datum. "Start bouw:
# verwachting oktober 2026" en "16 juli 2026 — fase 7b nu in verkoop" zijn
# mededelingen; zonder datum blijft het sfeer.
#
# Dit is bovendien het waardevolste dat er te halen valt. Onze pagina's zeggen nu
# bij de meeste projecten "er is geen officiële opleverdatum gepubliceerd, wij
# schatten" — als het project zelf een datum noemt, vervangt een feit een schatting.
MAAND = (r'(?:januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|'
         r'november|december)')
DATUM = rf'(?:(?:{MAAND}|[Qq][1-4]|(?:begin|medio|eind|najaar|voorjaar|zomer|winter))\s*)?20[2-4]\d'

# WAT WE WEL EN NIET AUTOMATISCH GELOVEN
# "Start verkoop" staat vrijwel altijd in een nieuwsbericht met een datum ervoor
# ("15 juli 2026 — Start verkoop Fase 7B"), en dat leest betrouwbaar.
#
# "Start bouw" en "oplevering" staan in planningsblokken met meerdere fases:
# "Oplevering en wonen: Fase 1A en 1B in het eerste halfjaar van 2027, Fase 2 in
# het eerste halfjaar van 2028. Start bouw: …". Welke datum bij welk moment hoort,
# is daar niet met een venster te bepalen — Dillekwartier leverde zo eerst 2027 en
# na aanscherping 2028 op, allebei zonder dat te controleren valt.
#
# Die twee zijn juist het waardevolst: onze pagina's zeggen nu bij de meeste
# projecten "er is geen officiële opleverdatum gepubliceerd, wij schatten". Maar
# een verkeerd opleverjaar staat op de pagina waarop iemand zijn verhuizing plant.
# Ze worden dus wél geoogst en níét gepubliceerd: ze gaan in een lijst ter controle.
MOMENTEN = {
    "start verkoop": r'start\s+(?:van\s+de\s+)?verkoop',
}

TER_CONTROLE = {
    "start bouw":  r'start\s+(?:van\s+de\s+)?bouw|bouw\s+(?:is\s+)?gestart',
    "oplevering":  r'oplevering|opgeleverd\s+in',
}

# --- de kenmerken die per project verschillen -------------------------------
#
# WAAROM DEZE ERBIJ KOMEN. De projectpagina's kwamen op 20% eigen tekst uit; de
# vier handgeschreven pagina's op 81-86%. Het verschil is geen sjabloon maar
# onderzoek: die vier noemen de bouwer, de manier van verwarmen, of er een
# kopersbegeleider is. Precies de dingen die een koper wil weten vóór hij tekent,
# en precies de dingen die op de eigen site van elk project anders staan.
#
# WAT WE WEL EN NIET OVERNEMEN. Alleen het feit en de vindplaats — nooit de zin
# van de ontwikkelaar zelf. De gevonden zin gaat mee als bewijs voor de controle,
# niet naar de pagina. Dezelfde grens als bij Nieuw Wonen Nederland: feiten mogen,
# omschrijvingen niet.
BOUWERS = [
    "BAM", "Heijmans", "Dura Vermeer", "Van Wijnen", "Ballast Nedam", "VanWonen",
    "Janssen de Jong", "Plegt-Vos", "Nijhuis", "Trebbe", "Koopmans", "Slokker",
    "ERA Contour", "Heilijgers", "Roosdom Tijhuis", "Giesbers", "Hurks",
    "Stam + De Koning", "Van Norel", "Klaassen", "Rotij", "De Bonth", "Adriaans",
    "Hendriks Bouw", "Bébouw", "Van der Leij", "Schoonderbeek", "Vink Bouw",
    "Aan de Stegge", "Van de Ven", "Berghege", "Van Bekkum", "Verwelius",
]
ONTWIKKELAARS = [
    "BPD", "AM", "Synchroon", "Amvest", "Blauwhoed", "Novaform", "Timpaan",
    "Van Wanrooij", "Heembouw", "Ten Brinke", "Kondor Wessels", "VORM", "Local",
    "Wonam", "Being", "Greystar", "Certitudo", "Wibaut", "Lingotto", "Provast",
]
KENMERKEN = {
    "warmtepomp":        (r'warmtepomp', "individuele warmtepomp"),
    "stadsverwarming":   (r'stadsverwarming|warmtenet', "stadsverwarming of een warmtenet"),
    "wko":               (r'\bwko\b|warmte-?koudeopslag', "warmte-koudeopslag"),
    "vloerverwarming":   (r'vloerverwarming', "vloerverwarming"),
    "zonnepanelen":      (r'zonnepanelen|pv-?panelen', "zonnepanelen"),
    "nom":               (r'nul\s*op\s*de\s*meter|\bnom-?woning', "nul op de meter"),
    "parkeerkelder":     (r'parkeerkelder|ondergronds\s+parkeren|parkeergarage',
                          "een parkeerkelder of parkeergarage"),
    "kopersbegeleider":  (r'kopersbegeleid|woonconsulent|kopersadviseur',
                          "een eigen kopersbegeleider vanuit het project"),
    "showroom":          (r'\bshowroom\b|inspiratiecentrum|woonwinkel\s+van\s+het\s+project',
                          "een showroom of inspiratieruimte"),
}

# Woorden die verraden dat het een vraag of uitnodiging is en geen mededeling.
GEEN_FEIT = re.compile(r'(schrijf\s+je\s+in|op\s+de\s+hoogte|nieuwsbrief|wil\s+je|'
                       r'blijf\s+op|interesse|meld\s+je\s+aan|\?)', re.I)

UITVERKOCHT = re.compile(r'\b(?:is\s+)?uitverkocht\b|volledig\s+verkocht', re.I)


def haal(url):
    try:
        r = subprocess.run(["curl", "-sSL", "-m", "25", "-A", UA, "-w", "\n%{http_code}", url],
                           capture_output=True, text=True, timeout=40)
        tekst, _, code = r.stdout.rpartition("\n")
        return tekst if code.strip() == "200" else None
    except Exception:
        return None


def kale_tekst(h):
    t = re.sub(r"(?s)<(script|style).*?</\1>", " ", h)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", H.unescape(t))


def projectsite(bron_html):
    """Het eigen webadres van het project, als enige externe domein op de bronpagina."""
    doms = {}
    for m in re.finditer(r'https?://([a-z0-9.-]+\.[a-z]{2,})(/[^\s"\'<>]*)?', bron_html.lower()):
        d = m.group(1)
        if any(s in d for s in NEGEER):
            continue
        doms[d] = doms.get(d, 0) + 1
    if not doms:
        return None
    # Het vaakst genoemde domein is de projectsite; losse verwijzingen naar een
    # architect of een gemeente komen één keer voor.
    return "https://" + max(doms, key=doms.get)


def subpaginas(html_tekst, domein):
    uit = []
    for m in re.finditer(r'href="([^"#]+)"', html_tekst):
        u = m.group(1)
        if u.startswith("/"):
            u = domein.rstrip("/") + u
        if domein.split("//")[-1] not in u:
            continue
        if u.lower().endswith((".jpg", ".png", ".webp", ".svg", ".css", ".js", ".ico")):
            continue
        if WAARDEVOL.search(u) and u not in uit:
            uit.append(u)
    return uit[:MAX_SUBPAGINAS]


def oogst(url_site):
    """Feiten uit de projectsite. Elk feit met de pagina waar het staat."""
    voor = haal(url_site)
    if not voor:
        return None
    paginas = [(url_site, voor)]
    for sub in subpaginas(voor, url_site):
        h = haal(sub)
        if h:
            paginas.append((sub, h))
        time.sleep(DELAY)

    feiten = {"site": url_site, "gekeken": [u for u, _ in paginas], "documenten": {},
              "momenten": {}, "ter_controle": {}, "kenmerken": {}, "partijen": {},
              "_gehaald": date.today().isoformat()}

    for u, h in paginas:
        t = kale_tekst(h)
        tl = t.lower()
        # Een document telt alleen als er ook echt een bestand aan hangt.
        for naam, patroon in DOCUMENTEN.items():
            if naam in feiten["documenten"]:
                continue
            for m in re.finditer(patroon, tl):
                venster = tl[max(0, m.start() - 160): m.end() + 160]
                if "download" in venster or ".pdf" in venster or "bekijk" in venster:
                    feiten["documenten"][naam] = u
                    break

        # Momenten: alleen met een datum in de buurt, en niet in een uitnodiging.
        for naam, patroon in MOMENTEN.items():
            if naam in feiten["momenten"]:
                continue
            for m in re.finditer(patroon, tl):
                venster = t[max(0, m.start() - 100): m.end() + 110]
                if GEEN_FEIT.search(venster):
                    continue
                # De datum moet bij dít moment horen, niet bij de zin ernaast.
                # "Start bouw: oktober 2026" hoort erbij; in "Oplevering en wonen
                # ... in 2027. Start bouw fase 1A" hoort de 2027 bij de oplevering
                # en niet bij de start bouw. Vandaar: ruim zoeken ná het trefwoord
                # en maar een handbreedte ervóór — dat laatste alleen omdat een
                # nieuwsbericht zijn datum vooraan zet ("15 juli 2026 Start verkoop").
                na = t[m.end(): m.end() + 70]
                voor = t[max(0, m.start() - 22): m.start()]
                d = re.search(DATUM, na) or re.search(DATUM, voor)
                if not d:
                    continue
                feiten["momenten"][naam] = {"wanneer": d.group(0).strip(), "bron": u,
                                            "zin": re.sub(r"\s+", " ", venster).strip()}
                break

        for naam, patroon in TER_CONTROLE.items():
            if naam in feiten["ter_controle"]:
                continue
            for m in re.finditer(patroon, tl):
                venster = t[max(0, m.start() - 100): m.end() + 110]
                if GEEN_FEIT.search(venster):
                    continue
                d = (re.search(DATUM, t[m.end(): m.end() + 70])
                     or re.search(DATUM, t[max(0, m.start() - 22): m.start()]))
                if not d:
                    continue
                feiten["ter_controle"][naam] = {"wanneer": d.group(0).strip(), "bron": u,
                                                "zin": re.sub(r"\s+", " ", venster).strip()}
                break

        # Kenmerken: één treffer is genoeg, maar hij moet in een mededeling staan
        # en niet in een vraag of een aanmeldzin.
        for naam, (patroon, _) in KENMERKEN.items():
            if naam in feiten["kenmerken"]:
                continue
            m = re.search(patroon, tl)
            if not m:
                continue
            venster = t[max(0, m.start() - 110): m.end() + 110]
            if GEEN_FEIT.search(venster):
                continue
            feiten["kenmerken"][naam] = {"bron": u, "zin": re.sub(r"\s+", " ", venster).strip()}

        # Wie het bouwt en wie het ontwikkelt. Alleen een naam uit de lijst telt:
        # "de ontwikkelaar" zonder naam is geen feit, en een willekeurig hoofdletter-
        # woord levert bedrijfsnamen op die er niet staan.
        for rol, namen in (("bouwer", BOUWERS), ("ontwikkelaar", ONTWIKKELAARS)):
            if rol in feiten["partijen"]:
                continue
            for naam in namen:
                if re.search(r'\b' + re.escape(naam.lower()) + r'\b', tl):
                    i = tl.find(naam.lower())
                    feiten["partijen"][rol] = {
                        "naam": naam, "bron": u,
                        "zin": re.sub(r"\s+", " ", t[max(0, i - 90): i + 110]).strip()}
                    break

        if "uitverkocht" not in feiten["momenten"]:
            for m in UITVERKOCHT.finditer(tl):
                venster = t[max(0, m.start() - 110): m.end() + 80]
                if GEEN_FEIT.search(venster):
                    continue
                feiten["momenten"]["uitverkocht"] = {"wanneer": None, "bron": u,
                                                     "zin": re.sub(r"\s+", " ", venster).strip()}
                break
    return feiten


def main():
    doel = json.load(open(PROJECTEN, encoding="utf8"))
    bestaand = json.load(open(UIT, encoding="utf8")) if os.path.exists(UIT) else {}

    def poort(p):
        return ((p.get("woningen") or 0) >= 50
                or (p.get("prijs_van") and p.get("woonoppervlak_van") and (p.get("woningen") or 0) >= 20))

    # --opnieuw haalt ook de projecten op die er al in staan. Nodig zodra de
    # oogst meer velden kent dan de vorige ronde: zonder deze vlag blijft de
    # nieuwe extractie leeg voor de 297 die al binnen waren.
    OPNIEUW = "--opnieuw" in sys.argv
    todo = [p for p in doel["projecten"]
            if poort(p) and (OPNIEUW or p["url"] not in bestaand)]
    if MAX:
        todo = todo[:MAX]
    print(f"{len(todo)} projecten te oogsten\n")

    gevonden = leeg = geensite = 0
    for i, p in enumerate(todo, 1):
        bron = haal(p["url"])
        time.sleep(DELAY)
        site = projectsite(bron) if bron else None
        if not site:
            print(f"  – {p['naam'][:32]:34} geen eigen site op de bronpagina")
            bestaand[p["url"]] = {"site": None, "_gehaald": date.today().isoformat()}
            geensite += 1
            continue
        f = oogst(site)
        if not f:
            print(f"  ✗ {p['naam'][:32]:34} {site} onbereikbaar")
            bestaand[p["url"]] = {"site": site, "_onbereikbaar": True,
                                  "_gehaald": date.today().isoformat()}
            geensite += 1
            continue
        bestaand[p["url"]] = f
        n_doc, n_st = len(f["documenten"]), len(f["momenten"])
        if n_doc or n_st:
            print(f"  ✓ {p['naam'][:32]:34} {site[:34]:36} {n_doc} doc, {n_st} moment")
            gevonden += 1
        else:
            print(f"  · {p['naam'][:32]:34} {site[:34]:36} site gevonden, geen feiten")
            leeg += 1
        if i % 10 == 0 and not DROOG:
            json.dump(bestaand, open(UIT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        time.sleep(DELAY)

    if not DROOG:
        json.dump(bestaand, open(UIT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        open(UIT, "a").write("\n")
    print(f"\n{gevonden} met feiten, {leeg} site zonder feiten, {geensite} zonder bruikbare site"
          + (" (DROOGDRAAI)" if DROOG else ""))


if __name__ == "__main__":
    main()
