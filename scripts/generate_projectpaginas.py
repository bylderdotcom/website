#!/usr/bin/env python3
"""Genereert nieuwbouwproject-pagina's uit de projectdata plus de ruimte-ontologie.

WAAROM DEZE PAGINA'S INDEXEERBAAR ZIJN, EN WAT DAT EIST
-------------------------------------------------------
Per project verschillen naam, plaats, aantal woningen, de geschatte opleverdatum
en de lokale vakbedrijven. De beslislijst komt uit dezelfde ontologie en is op
elke pagina gelijk. De eerste generatie mat daardoor 43,7% unieke tekst — te dicht
bij de 35% van de 25.697 vakbedrijf-profielen die op 31 juli uit de index gingen
na 8 impressies en 0 klikken.

Daarop is de generieke FAQ en het meerwerk-uitlegblok geschrapt (die uitleg hoort
één keer in de kennisbank, niet 28 keer hier) en vervangen door blokken die met de
projectdata rekenen. Nu 53,9%. Dat is nog niet de 91% van de kennisbank; de weg
daarheen is verkoopdata per project, niet slimmer sjabloneren. Meet opnieuw voordat
je deze generator op alle 181 kandidaten loslaat.

DE GESCHATTE OPLEVERDATUM
-------------------------
Van 976 projecten noemen er 17 een hard opleverjaar. De rest heeft niets of een
kwartaalnotatie die net zo goed over de verkoopstart kan gaan. We schatten dus,
met een bandbreedte en de grondslag erbij, en nodigen de koper uit te corrigeren
vanuit zijn eigen koop-/aannemingsovereenkomst. Die correctie is de reden om een
account te maken, en ze verbetert de pagina voor de volgende bezoeker uit
hetzelfde project.

Gebruik:
    python3 scripts/generate_projectpaginas.py            # alle projecten die de poort halen
    python3 scripts/generate_projectpaginas.py --regio    # alleen de Rotterdamse straal
    python3 scripts/generate_projectpaginas.py --pilot    # alleen de pilotring (golf B)
    python3 scripts/generate_projectpaginas.py --min 100  # andere ondergrens
    python3 scripts/generate_projectpaginas.py --dry      # niets wegschrijven
"""
import json, os, re, sys, glob, html, math, collections, statistics, urllib.parse
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
import nieuwbouw_scraper as ns

PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
VAKBEDRIJVEN = os.path.join(ROOT, "data", "vakbedrijven.json")
WINKELS = os.path.join(ROOT, "data", "winkels-publiek.json")
RUIMTES = os.path.join(ROOT, "data", "ruimtes")
CLUSTER = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project")
VANDAAG = date.today()
NL_MAAND = ("januari februari maart april mei juni juli augustus september oktober "
            "november december").split()

DRY = "--dry" in sys.argv
ALLEEN_REGIO = "--regio" in sys.argv
# Golf B van het marktplein-model: alleen de pilotring rond Baarn, waar de
# woningregisseur fysiek langs kan (zie PILOT verderop).
ALLEEN_PILOT = "--pilot" in sys.argv
MIN_WONINGEN = 50
# De tweede poort, naast de woningdrempel: hoeveel eigen feiten een project
# draagt. Zie eigen_feiten() in main(). 99 = uit (alleen de woningdrempel).
MIN_FEITEN = 99
for i, a in enumerate(sys.argv):
    if a == "--min" and i + 1 < len(sys.argv):
        MIN_WONINGEN = int(sys.argv[i + 1])
    if a == "--feiten" and i + 1 < len(sys.argv):
        MIN_FEITEN = int(sys.argv[i + 1])

E = html.escape


def slugify(naam, plaats):
    s = re.sub(r"[^a-z0-9]+", "-", f"{naam} {plaats}".lower()).strip("-")
    return re.sub(r"-{2,}", "-", s)


def netjes_naam(p):
    return p.get("naam") or "dit project"


def netjes(s):
    vast = {"s-gravenhage": "Den Haag", "rijswijk-zh": "Rijswijk", "beek-l": "Beek",
            "leidschendam-voorburg": "Leidschendam-Voorburg",
            "nissewaard": "Nissewaard", "capelle-aan-den-ijssel": "Capelle aan den IJssel",
            "krimpen-aan-den-ijssel": "Krimpen aan den IJssel",
            "alphen-aan-den-rijn": "Alphen aan den Rijn",
            "hengelo-o": "Hengelo", "laren-nh": "Laren", "middelburg-z": "Middelburg",
            "s-hertogenbosch": "'s-Hertogenbosch"}
    return vast.get(s, " ".join(w.capitalize() if len(w) > 3 else w for w in (s or "").split("-")))


def km(a, b, c, d):
    R = 6371; p = math.pi / 180
    return 2 * R * math.asin(math.sqrt(math.sin((c - a) * p / 2) ** 2 +
           math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2))


def laad_ruimtes():
    """Ruimtes die bij het nieuwbouw-opleveringsmoment horen, rijkste eerst."""
    uit = []
    for f in sorted(glob.glob(os.path.join(RUIMTES, "*.json"))):
        d = json.load(open(f, encoding="utf8"))
        if "nieuwbouw-oplevering" in (d.get("momenten") or []) and d.get("beslissingen"):
            uit.append(d)
    uit.sort(key=lambda d: -(len(d["beslissingen"]) + len(d.get("meerwerk") or [])))
    return uit


# Opleverdata die het project zelf publiceert en die met de hand zijn nagelopen.
# De oogster vindt ze wel maar koppelt ze niet betrouwbaar aan het juiste moment:
# van 28 kandidaten bleken er acht een startdatum, een lotingsdatum of de planning
# van een andere fase ("Q1 2024 Bouw gestart … Medio 2027 Verwachte oplevering"
# leverde Q1 2024 op). Daarom staat hier alleen wat een mens heeft gezien.
OPLEVER_BEVESTIGD_PAD = os.path.join(ROOT, "data", "opleverdata-bevestigd.json")
_OPL = None


def _opleverdata():
    global _OPL
    if _OPL is None:
        try:
            _OPL = json.load(open(OPLEVER_BEVESTIGD_PAD, encoding="utf8"))["projecten"]
        except Exception:
            _OPL = {}
    return _OPL


def oplever_schatting(p):
    """(tekst, jaar_van, jaar_tot, grondslag) — altijd als bandbreedte, nooit als feit."""
    bev = _opleverdata().get(p.get("url"))
    if bev:
        j = bev["jaar"]
        return (bev["wanneer"], j, j, "een opgave van het project zelf, nagelopen op de bron")
    if p.get("oplevering") and p.get("oplevering_bron") == "oplevertrefwoord":
        j = p["oplevering"]
        return (f"in {j}", j, j, "opgave van het project zelf")
    jaren = [j for j in (p.get("jaren") or []) if VANDAAG.year <= j <= VANDAAG.year + 8]
    if jaren:
        lo, hi = min(jaren), max(jaren)
        return (f"tussen {lo} en {hi}" if hi > lo else f"rond {lo}", lo, hi,
                "kwartaalnotaties op de projectpagina — die kunnen ook over de verkoopstart gaan")
    lo = VANDAAG.year + 1; hi = VANDAAG.year + 2
    return (f"tussen {lo} en {hi}", lo, hi,
            "een vuistregel van ongeveer anderhalf jaar tussen verkoop en oplevering; "
            "dit project publiceert zelf geen datum")


# Maandnummer per aanduiding zoals projecten hem schrijven. Bewust aan de late
# kant: bij twijfel liever te laat dan te vroeg, want te vroeg betekent dat de
# pagina een koper vertelt dat hij te laat is terwijl de keuzes nog open staan.
_MAAND = {"januari": 1, "februari": 2, "maart": 3, "april": 4, "mei": 5, "juni": 6,
          "juli": 7, "augustus": 8, "september": 9, "oktober": 10, "november": 11,
          "december": 12}
_PERIODE = {"begin": 4, "voorjaar": 6, "medio": 8, "zomer": 9, "midden": 8,
            "najaar": 12, "herfst": 12, "eind": 12, "winter": 12}
_KWARTAAL = {1: 3, 2: 6, 3: 9, 4: 12}


def opgeleverd(p):
    """(True, wanneer) als de oplevering aantoonbaar achter ons ligt.

    WAAROM DIT POORTJE BESTAAT. De pagina rekende terug vanuit een opleverdatum
    zonder te kijken of die al gepasseerd was. Op Podium (Amersfoort, april 2026)
    en Nova 67 (Zwolle, medio 2026) stond daardoor in september 2026 nog steeds
    dat de keuze "op de meerwerklijst valt, niet op de verhuislijst". Voor wie
    daar koopt is dat precies verkeerd om: de meerwerklijst is daar dicht. De
    tijdlijn en de deadlinetabel filterden verstreken mómenten al weg, maar niet
    het geval dat de oplevering zélf voorbij is.

    ALLEEN OP EEN NAGELOPEN DATUM. Een geschatte oplevering ("tussen 2027 en
    2028", uit een vuistregel of uit kwartaalnotaties die net zo goed over de
    verkoopstart kunnen gaan) is te zwak om een pagina op om te gooien: een
    verkeerde gok schrijft een project af dat nog in verkoop is. Daarom telt
    alleen wat een mens heeft nagelezen (opleverdata-bevestigd.json) of een
    expliciet oplevertrefwoord uit de bron.

    "VANAF" TELT NIET. "vanaf eind 2027" of "vanaf Q2 2026" is een gefaseerde
    start, geen eindpunt: latere fases moeten dan nog kiezen. Zo'n project blijft
    dus een project in wording.
    """
    bev = _opleverdata().get(p.get("url"))
    if bev:
        wanneer, jaar = bev["wanneer"], bev["jaar"]
    elif p.get("oplevering") and p.get("oplevering_bron") == "oplevertrefwoord":
        wanneer, jaar = f"in {p['oplevering']}", p["oplevering"]
    else:
        return (False, "")

    laag = (wanneer or "").lower()
    if "vanaf" in laag or "eerste woningen" in laag:
        return (False, "")

    maand = 12
    for woord, m in _MAAND.items():
        if woord in laag:
            maand = m
            break
    else:
        kw = re.search(r"\b(?:q|kwartaal\s*)([1-4])\b", laag) or \
             re.search(r"\b([1-4])e\s*kwartaal\b", laag)
        if kw:
            maand = _KWARTAAL[int(kw.group(1))]
        else:
            for woord, m in _PERIODE.items():
                if laag.startswith(woord) or f" {woord} " in f" {laag} ":
                    maand = m
                    break

    # Strikt vóór deze maand: een oplevering die deze maand valt is nu bezig.
    if (jaar, maand) < (VANDAAG.year, VANDAAG.month):
        return (True, wanneer)
    return (False, "")


# Ketens die als vakbedrijf of woonwinkel in de data staan maar het niet zijn.
# HORNBACH stond als badkamerspecialist op de pagina, een PLUS-supermarkt als
# verlichtingszaak en een feestwinkel als woonwinkel — direct onder de zin dat
# wij op passendheid rangschikken.
GEEN_VAKBEDRIJF = ("hornbach", "praxis", "gamma", "karwei", "bouwmaat", "hubo",
                   "plus ", "albert heijn", "jumbo", "lidl", "aldi", "action",
                   "kruidvat", "feestwinkel", "solow", "so low", "blokker",
                   "xenos", "big bazar", "tuincentrum", "welkoop", "intratuin",
                   "ikea", "leen bakker", "kwantum", "bauhaus", "formido",
                   "multimate", "toolstation", "bouwcenter", "raab karcher",
                   "stiho", "brico", "makro", "sligro")
# Dit is een pleister, geen oplossing: elke keten die ontbreekt glipt erdoor —
# HORNBACH weggehaald leverde BAUHAUS op. De echte fix is een veld in de
# vakbedrijven-data dat keten van vakbedrijf onderscheidt.


# De zwarte lijst hierboven is de pleister. De taxonomie is de oplossing: per
# bedrijf wat Google zegt dat het is. Waar die er is, wint hij — dan hoeft er geen
# keten meer met de hand op een lijstje.
def _laad_taxonomie():
    p = os.path.join(ROOT, "data", "plaatsen", "taxonomie.json")
    if not os.path.exists(p):
        return {}
    uit = {}
    for v in json.load(open(p, encoding="utf8")).values():
        if v.get("id"):
            uit[v["id"]] = v
    return uit


TAXONOMIE = _laad_taxonomie()


def _laad_deelnemers():
    """Wie meedoet, uit de app. Sluit de lus: een winkel die betaalt ziet zichzelf
    terug op de projectpagina's, en de koper die om die winkel vroeg ziet zijn
    korting verschijnen. Zonder die bevestiging blijft de funnel een reeks losse
    stappen."""
    f = os.path.join(ROOT, "data", "deelnemers.json")
    if not os.path.exists(f):
        return {}
    d = json.load(open(f, encoding="utf8"))
    uit = {}
    for x in (d.get("deelnemers") or d):
        n = re.sub(r"[^a-z0-9]", "", (x.get("naam") or "").lower())
        if len(n) >= 4:
            uit[n] = x
    return uit


DEELNEMERS = _laad_deelnemers()


def deelnemer(naam):
    n = re.sub(r"[^a-z0-9]", "", (naam or "").lower())
    if not n:
        return None
    if n in DEELNEMERS:
        return DEELNEMERS[n]
    # merknaam als deel van de winkelnaam ("Auping Store Zoetermeer" ↔ "Auping")
    for k, v in DEELNEMERS.items():
        if len(k) >= 6 and (k in n or n in k):
            return v
    return None
WINKELTYPES = {"hardware_store", "home_improvement_store", "home_goods_store",
               "furniture_store", "garden_center", "wholesaler", "paint_store",
               "building_materials_store", "bed_shop", "mattress_store",
               "lighting_store", "kitchen_furniture_store", "flooring_store"}
NOOIT_TYPE = {"supermarket", "grocery_store", "convenience_store", "gas_station",
              "restaurant", "cafe", "bar", "lodging", "car_dealer", "pharmacy",
              "bank", "shopping_mall"}


def _laad_snapshots():
    """Alle metingen per project-URL, op datum. Twee metingen maken een logregel;
    één meting is alleen een stand. Daarom bewaren we ze allemaal."""
    d = os.path.join(ROOT, "data", "nieuwbouw-snapshots")
    uit = collections.defaultdict(list)
    for f in sorted(glob.glob(os.path.join(d, "*.json"))):
        datum = os.path.basename(f)[:-5]
        for url, v in json.load(open(f, encoding="utf8")).items():
            if v.get("eenheden"):
                uit[url].append((datum, v))
    return uit


SNAPSHOTS = _laad_snapshots()


def _laad_bag():
    """Álle Kadaster-metingen per project-URL, op datum gesorteerd.

    Dit hield eerst alleen de laatste meting bij: elke nieuwe snapshot overschreef
    de vorige. Daardoor stond op 181 pagina's "Dit is de eerste meting" terwijl er
    vier rondes van 976 projecten in data/bag-snapshots/ lagen — de reeks waar
    deze pagina's het juist van moeten hebben. Eén meting is een momentopname,
    vier metingen zijn een logboek, en dat logboek is het enige op deze pagina dat
    de ontwikkelaar zelf niet publiceert.

    Bewust 'omgeving': een bbox vangt ook de buren, en zo staat het ook op de pagina.
    """
    uit = collections.defaultdict(list)
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "bag-snapshots", "*.json"))):
        datum = os.path.basename(f)[:-5]
        for url, v in json.load(open(f, encoding="utf8")).items():
            if v.get("panden"):
                uit[url].append((datum, v))
    return {u: sorted(r) for u, r in uit.items()}


# De PDOK-bevraging in scripts/bag_bouwstatus.py haalt er maximaal zoveel op.
# Een project dat aan die grens zit, is niet volledig geteld.
BAG_MAX = 500

BAG_REEKS = _laad_bag()
# De laatste meting per project, voor alles wat alleen de stand van nu nodig heeft.
BAG = {u: r[-1] for u, r in BAG_REEKS.items()}


def nl_datum(iso):
    j, m, dg = iso.split("-")
    return f"{int(dg)} {NL_MAAND[int(m) - 1]} {j}"


def bag_blok(p, naam):
    """De bouwstatus uit het Kadaster, als eigen blok.

    Zat eerst in verkoop_blok() en verdween daardoor toen de verkoopdata ongeldig
    bleek. Dat was onterecht: de BAG-meting gaat via een bbox op de coordinaten van
    het project en raakt de bronpagina van nieuwbouw.nl niet aan. Het is nu het
    enige gedateerde feit op deze pagina, en daarmee het enige dat een AI-antwoord
    kan citeren.

    Eerlijk geformuleerd als 'omgeving': een bbox vangt ook de buren.
    """
    bag = BAG.get(p.get("url"))
    if not bag:
        # Drie lege waarden, niet twee. De aanroeper pakt feiten, tabel én log
        # uit; met twee klapte de landelijke run eruit zodra hij het eerste
        # project zonder Kadaster-meting tegenkwam. Binnen de pilotring viel dat
        # niet op, want daar heeft elk project een meting.
        return "", "", ""
    bd, bv = bag
    delen = []
    if bv.get("in_aanbouw"):
        delen.append(f"<strong>{bv['in_aanbouw']} panden in aanbouw</strong>")
    if bv.get("opgeleverd"):
        delen.append(f"<strong>{bv['opgeleverd']} recent opgeleverd</strong>")
    if not delen:
        return "", "", ""
    afgekapt_nu = (bv.get("panden") or 0) >= BAG_MAX
    antwoord = (f'<p class="antwoord"><strong>Bouwstatus, peildatum {nl_datum(bd)}.</strong> '
                f"In de directe omgeving van {E(naam)} registreert het Kadaster "
                + " en ".join(delen)
                + f", met {bv['nieuwste_bouwjaar']} als nieuwste bouwjaar. Wij meten dit elke "
                  f"twee weken opnieuw."
                + (" Het zoekvierkant bevat hier meer panden dan wij per ronde ophalen, dus dit "
                   "is een steekproef uit de buurt en geen volledige telling." if afgekapt_nu else "")
                + "</p>")

    rijen = "".join(
        f"<tr><th>{lbl}</th><td>{val}</td></tr>" for lbl, val in [
            ("Panden in aanbouw", bv.get("in_aanbouw") or "&mdash;"),
            ("Recent opgeleverd", bv.get("opgeleverd") or "&mdash;"),
            ("Nieuwste bouwjaar", bv.get("nieuwste_bouwjaar") or "&mdash;"),
            ("Peildatum", nl_datum(bd)),
            ("Bron", 'Basisregistratie Adressen en Gebouwen (Kadaster), gemeten door Bylder '
                     'binnen ongeveer 650 meter van het project'),
        ])
    tabel = (f"<h2>Bouwstatus rond {E(naam)}</h2><table class=\"feit-tabel\"><tbody>{rijen}</tbody></table>"
             f'<p class="noot">Een zoekvierkant vangt ook de directe buren, dus dit is de stand '
             f"van de omgeving en niet uitsluitend van dit project. Het komt wel uit de officiele "
             f"registratie, niet uit een verkoopsite.</p>")
    # Het logboek: elke meting die wij van dit project hebben, nieuwste bovenaan,
    # met het verschil ten opzichte van de vorige erbij. Dat verschil is het punt.
    # De stand van vandaag staat ook op de site van de ontwikkelaar; wat er tussen
    # 8 en 15 september veranderde staat nergens anders.
    #
    # WAAROM HET VERSCHIL SOMS ONTBREEKT
    # De PDOK-bevraging haalt maximaal 500 panden per zoekvierkant op. Zit een
    # project aan die grens, dan krijgen we elke ronde een ándere greep van 500
    # uit dezelfde buurt, en schuift de verdeling tussen 'in aanbouw' en
    # 'opgeleverd' mee zonder dat er iets gebouwd is. Precies die 97 projecten
    # lieten tussen 8 en 15 september een exacte omklap zien (+97 in aanbouw,
    # -97 opgeleverd bij gelijk totaal). Bij die projecten tonen we de meting wel
    # en het verschil niet: een getal dat beweegt door de meetmethode mag niet
    # worden gelezen als bouwvoortgang.
    reeks = BAG_REEKS.get(p.get("url")) or [(bd, bv)]
    regels = []
    for i in range(len(reeks) - 1, -1, -1):
        dt, m = reeks[i]
        aanbouw, opgeleverd = m.get("in_aanbouw") or 0, m.get("opgeleverd") or 0
        afgekapt = (m.get("panden") or 0) >= BAG_MAX
        staartje = ' <span class="delta stil">telling afgekapt op 500 panden</span>' if afgekapt else ""
        if i > 0 and not afgekapt and not ((reeks[i - 1][1].get("panden") or 0) >= BAG_MAX):
            vorige = reeks[i - 1][1]
            da = aanbouw - (vorige.get("in_aanbouw") or 0)
            do = opgeleverd - (vorige.get("opgeleverd") or 0)
            stukjes = []
            if da: stukjes.append(f"{'+' if da > 0 else ''}{da} in aanbouw")
            if do: stukjes.append(f"{'+' if do > 0 else ''}{do} opgeleverd")
            staartje = (f' <span class="delta">{E(", ".join(stukjes))} sinds '
                        f'{nl_datum(reeks[i - 1][0])}</span>' if stukjes
                        else ' <span class="delta">ongewijzigd</span>')
        regels.append(f"<li><strong>{nl_datum(dt)}</strong> &middot; {aanbouw} panden in "
                      f"aanbouw, {opgeleverd} opgeleverd (Kadaster){staartje}</li>")

    if len(reeks) == 1:
        staart = ('<p class="noot">Dit is de eerste meting van dit project. Vanaf de volgende '
                  "ronde staat hier wat er tussen twee metingen veranderde.</p>")
    else:
        bruikbaar = [(d, m) for d, m in reeks if (m.get("panden") or 0) < BAG_MAX]
        zin = ""
        if len(bruikbaar) >= 2:
            verschil = (bruikbaar[-1][1].get("opgeleverd") or 0) - (bruikbaar[0][1].get("opgeleverd") or 0)
            if verschil > 0:
                zin = (f"Sinds {nl_datum(bruikbaar[0][0])} registreerde het Kadaster "
                       f"{verschil} pand{'en' if verschil != 1 else ''} m&eacute;&eacute;r als "
                       f"opgeleverd in de omgeving. ")
            elif verschil < 0:
                zin = (f"Sinds {nl_datum(bruikbaar[0][0])} staan er {abs(verschil)} pand"
                       f"{'en' if verschil != -1 else ''} m&iacute;nder als opgeleverd "
                       f"geregistreerd; dat gebeurt als een pand van status wisselt. ")
            else:
                zin = (f"Sinds {nl_datum(bruikbaar[0][0])} veranderde er niets aan het aantal "
                       f"opgeleverde panden in de omgeving. ")
        else:
            zin = ("Het zoekvierkant van dit project bevat meer panden dan wij per ronde ophalen, "
                   "dus vergelijken we de rondes hier niet met elkaar. ")
        staart = (f'<p class="noot">{len(reeks)} metingen sinds {nl_datum(reeks[0][0])}. {zin}'
                  "Wij meten elke twee weken opnieuw.</p>")

    verhaal = logboek_verhaal(reeks, naam)
    log = f"<h2>Logboek</h2>{verhaal}<ul class='log'>{''.join(regels)}</ul>{staart}"
    return antwoord, tabel, log


def logboek_verhaal(reeks, naam):
    """Wat de meetreeks laat zien, in zinnen in plaats van rijtjes.

    WAAROM. De uniciteit van deze pagina's stond op 19% terwijl 976 projecten
    een eigen meetreeks hebben — het eigenste bezit dat we hebben, en het stond
    er als tabel met overal dezelfde omlijstende woorden. Acht opeenvolgende
    woorden zijn dan op elke pagina gelijk, ook al verschillen de getallen.

    Hier kiest de vórm zich naar wat de reeks laat zien: stil, net begonnen,
    aan de gang, of al aan het opleveren. Dat is geen opsmuk — het is precies
    wat de koper wil weten, en het is per project anders.

    Niets hier is een schatting. Elke zin gebruikt alleen data uit de metingen
    zelf: de datums, het aantal panden in aanbouw en het aantal opgeleverd.
    """
    bruikbaar = [(d, m) for d, m in reeks if (m.get("panden") or 0) < BAG_MAX]
    if len(bruikbaar) < 2:
        return ""
    (d0, m0), (d1, m1) = bruikbaar[0], bruikbaar[-1]
    a0, a1 = m0.get("in_aanbouw") or 0, m1.get("in_aanbouw") or 0
    o0, o1 = m0.get("opgeleverd") or 0, m1.get("opgeleverd") or 0
    span = f"{nl_datum(d0)} en {nl_datum(d1)}"
    n = len(bruikbaar)

    if o1 > o0 and a1 < a0:
        z = (f"Tussen {span} zag het Kadaster de bouw bij {naam} kantelen: "
             f"{o1 - o0} pand{'en' if o1 - o0 != 1 else ''} ging{'en' if o1 - o0 != 1 else ''} "
             f"van in aanbouw naar opgeleverd, en het aantal panden in aanbouw liep terug van "
             f"{a0} naar {a1}. Dat is de fase waarin de eerste sleutels worden uitgereikt en "
             f"de laatste keuzes bij de bouwer sluiten.")
    elif o1 > o0:
        z = (f"Tussen {span} registreerde het Kadaster {o1 - o0} pand"
             f"{'en' if o1 - o0 != 1 else ''} als opgeleverd rond {naam}, terwijl er "
             f"{a1} in aanbouw bleven staan. Er wordt hier dus opgeleverd en doorgebouwd "
             f"tegelijk &mdash; gebruikelijk bij een project dat in fases gaat.")
    elif a1 > a0 and a0 == 0:
        z = (f"Bij de eerste meting op {nl_datum(d0)} stond er rond {naam} nog niets in "
             f"aanbouw. Op {nl_datum(d1)} "
             f"{'was dat 1 pand' if a1 == 1 else f'waren dat {a1} panden'}. De bouw is tussen die twee "
             f"datums begonnen; vanaf hier gaan de keuzemomenten lopen.")
    elif a1 > a0:
        z = (f"Het aantal panden in aanbouw rond {naam} liep tussen {span} op van {a0} naar "
             f"{a1}. De bouw ligt hier dus niet stil, en dat is het moment waarop de "
             f"meerwerklijst begint te sluiten.")
    elif a1 < a0 and o1 == o0:
        z = (f"Tussen {span} daalde het aantal panden in aanbouw rond {naam} van {a0} naar "
             f"{a1}, zonder dat er meer als opgeleverd geregistreerd werden. Dat gebeurt als "
             f"panden van status wisselen; wij melden het zoals het Kadaster het noteert.")
    else:
        z = (f"Over {n} metingen tussen {span} bleef het beeld rond {naam} gelijk: "
             f"{a1} pand{'en' if a1 != 1 else ''} in aanbouw en {o1} opgeleverd. Geen beweging "
             f"in de registratie hoeft geen stilstand op de bouwplaats te zijn &mdash; het "
             f"Kadaster boekt pas bij een statuswijziging.")
    return f"<p>{z}</p>"


def betrouwbaar(p, meting):
    """Of de verkoopmeting bij dít project hoort.

    De bronpagina van Corner Lofts (265 woningen) bevat negen beschikbaarheids-
    regels, waaronder "11 van 483" — dat is een ander project. Onze telling pakte
    alles op de pagina op, waardoor het verkooppercentage een mengsel werd van
    projecten die niets met elkaar te maken hebben. Bij 343 van de 923 gemeten
    projecten telt de meting meer eenheden dan het project woningen heeft.

    Tot de oogst per fase is afgebakend tonen we het cijfer alleen waar het
    aannemelijk is. Liever geen getal dan een verkeerd getal — dit is precies het
    cijfer waarop deze pagina's moeten worden geloofd.
    """
    # 5 aug 2026: ONGELDIG VERKLAARD. Edisonpark en Soeterdael — twee verschillende
    # projecten — leveren exact dezelfde vijf regels op (4 van 22, 1 van 32,
    # 3 van 32, 21 van 53, 1 van 117). Die komen uit een gedeeld blok met andere
    # projecten op de bronpagina, niet van het project zelf. Elke treffer heeft
    # bovendien een prijskaart met woningtypes ervoor staan: de opmaak van een
    # projectkaartje in een lijst.
    #
    # De plausibiliteitspoort van een uur geleden ving alleen de uitschieters en
    # liet zeven pagina's staan die net zo fout waren. Daarom nu alles dicht tot
    # de oogst per project is afgebakend en opnieuw gemeten.
    return False


def verkoop_blok(p, naam):
    """Het feitenblok en het logboek. Dit is het enige op de pagina dat nergens
    anders staat: nieuwbouw.nl toont de stand, niet het verloop, en de ontwikkelaar
    heeft geen belang bij een publieke tijdlijn."""
    fases = p.get("_fases") or [(None, p.get("url"))]
    per_fase = [(fn, SNAPSHOTS.get(u) or []) for fn, u in fases]
    per_fase = [(fn, m) for fn, m in per_fase if m and betrouwbaar(p, m[-1][1])]
    if not per_fase:
        return "", ""
    # gecombineerde laatste stand over alle fases
    datum = max(m[-1][0] for _, m in per_fase)
    v = {"eenheden": sum(m[-1][1]["eenheden"] for _, m in per_fase),
         "beschikbaar": sum(m[-1][1]["beschikbaar"] for _, m in per_fase),
         "fases": sum(m[-1][1].get("fases") or 1 for _, m in per_fase)}
    v["verkocht_pct"] = round(100 * (v["eenheden"] - v["beschikbaar"]) / max(1, v["eenheden"]))
    metingen = per_fase[0][1]
    verkocht = v["eenheden"] - v["beschikbaar"]
    bag = BAG.get(p.get("url"))
    bag_rij = ""
    if bag:
        bd, bv = bag
        rij_delen = []
        if bv["in_aanbouw"]:
            rij_delen.append(f"{bv['in_aanbouw']} panden in aanbouw")
        if bv["opgeleverd"]:
            rij_delen.append(f"{bv['opgeleverd']} recent opgeleverd")
        bag_rij = (f"<tr><th>Omgeving (Kadaster)</th><td>{', '.join(rij_delen)} &mdash; "
                   f"peildatum {nl_datum(bd)}</td></tr>") if rij_delen else ""
    n_fases = len(per_fase) if len(per_fase) > 1 else v.get("fases", 0)
    fases_zin = f", verdeeld over {n_fases} fases" if n_fases > 1 else ""
    # Het `woningen`-veld uit de scrape is onbetrouwbaar: het is soms het aantal
    # van één fase terwijl de meting alle fases telt. Alleen tonen als het groter
    # is dan wat we werkelijk in de verkoop zien — anders liegt de tabel.
    won_bron = p.get("woningen") or 0
    fase_txt = f", verdeeld over {v['fases']} fases" if v.get("fases", 0) > 1 else ""
    if won_bron > v["eenheden"]:
        omvang_rijen = (f"<tr><th>Project telt</th><td>{won_bron} woningen</td></tr>"
                        f"<tr><th>Nu in de verkoop</th><td>{v['eenheden']} woningen{fase_txt} "
                        f"&mdash; de rest is nog niet aangeboden of al buiten de verkoop</td></tr>")
    else:
        omvang_rijen = f"<tr><th>In de verkoop</th><td>{v['eenheden']} woningen{fase_txt}</td></tr>"
    if bag:
        bd, bv = bag
        # Nul noemen leest als een storing ("het Kadaster registreert 0 panden in
        # aanbouw"). Alleen zeggen wat er wél staat.
        delen = []
        if bv["in_aanbouw"]:
            delen.append(f"{bv['in_aanbouw']} panden in aanbouw")
        if bv["opgeleverd"]:
            delen.append(f"{bv['opgeleverd']} recent opgeleverde")
        bag_zin = (f" In de directe omgeving registreert het Kadaster "
                   + " en ".join(delen)
                   + f" (nieuwste bouwjaar {bv['nieuwste_bouwjaar']})." ) if delen else ""
    else:
        bag_zin = ""
    antwoord = (f'<p class="antwoord"><strong>Stand van {nl_datum(datum)}.</strong> {E(naam)} is '
                f"voor <strong>{v['verkocht_pct']}%</strong> verkocht: {verkocht} van de "
                f"{v['eenheden']} aangeboden woningen{fases_zin}.{bag_zin} Wij meten dit elke "
                f"twee weken opnieuw.</p>")
    feiten = antwoord + f"""<h2>{E(naam)} in cijfers</h2>
<table class="feit-tabel">
<tbody>
{omvang_rijen}
<tr><th>Nog beschikbaar</th><td>{v['beschikbaar']}</td></tr>
<tr><th>Verkocht</th><td><strong>{verkocht} ({v['verkocht_pct']}%)</strong></td></tr>
{"".join(f"<tr><th>&nbsp;&nbsp;{E(fn)}</th><td>{m[-1][1]['eenheden'] - m[-1][1]['beschikbaar']} van {m[-1][1]['eenheden']} verkocht ({m[-1][1]['verkocht_pct']}%)</td></tr>" for fn, m in per_fase if fn)}
<tr><th>Stand van</th><td>{nl_datum(datum)}</td></tr>
{bag_rij}
<tr><th>Gemeten door</th><td>Bylder, op de beschikbaarheid per fase zoals
<a href="{E(p['url'])}" rel="nofollow noopener" target="_blank">nieuwbouw.nl</a> die publiceert</td></tr>
</tbody></table>
"""

    regels = []
    if len(per_fase) > 1:
        for fn, m in per_fase:
            dt, mm = m[-1]
            regels.append(f"<li><strong>{nl_datum(dt)}</strong> &middot; {E(fn)}: nog "
                          f"{mm['beschikbaar']} van de {mm['eenheden']} beschikbaar "
                          f"({mm['verkocht_pct']}% verkocht)</li>")
    for i, (dt, m) in enumerate(reversed(metingen if len(per_fase) == 1 else [])):
        vorig = metingen[len(metingen) - i - 2][1] if len(metingen) - i - 2 >= 0 else None
        verschil = ""
        if vorig and vorig["beschikbaar"] != m["beschikbaar"]:
            weg = vorig["beschikbaar"] - m["beschikbaar"]
            verschil = (f" &mdash; {weg} verkocht sinds de vorige meting"
                        if weg > 0 else f" &mdash; {-weg} weer beschikbaar")
        regels.append(f"<li><strong>{nl_datum(dt)}</strong> &middot; nog {m['beschikbaar']} "
                      f"van de {m['eenheden']} beschikbaar ({m['verkocht_pct']}% verkocht)"
                      f"{verschil}</li>")
    log = f"""<h2>Logboek</h2>
<p>Wat wij bij {E(naam)} zien veranderen, met datum. Wij meten dit zelf; de
projectpagina van de ontwikkelaar toont alleen de stand van vandaag, niet het
verloop.</p>
<ul class='log'>{''.join(regels)}</ul>
{'<p class="noot">Dit is de eerste meting. Vanaf de volgende ronde staat hier wat er tussen twee metingen veranderde &mdash; hoe snel dit project werkelijk verkoopt.</p>' if len(metingen) == 1 else ''}"""
    return feiten, log


def geweerd(naam, place_id=None, vakbedrijf=True):
    v = TAXONOMIE.get(place_id) if place_id else None
    if v:
        if v.get("status") and v["status"] != "OPERATIONAL":
            return True
        if set(v.get("types") or []) & NOOIT_TYPE:
            return True
        if vakbedrijf and v.get("primair") in WINKELTYPES:
            return True
        return False
    # Geen taxonomie voor dit bedrijf (buiten de vier steden): terugvallen op de lijst.
    n = (naam or "").lower()
    return any(x in n for x in GEEN_VAKBEDRIJF)


def lokale_vakbedrijven(vb, p, straal=12, n=6):
    if not (p.get("lat") and p.get("lng")):
        return []
    uit = []
    for b in vb:
        if not (b.get("lat") and b.get("lng")):
            continue
        try:
            d = km(float(p["lat"]), float(p["lng"]), float(b["lat"]), float(b["lng"]))
        except (TypeError, ValueError):
            continue
        if (d <= straal and (b.get("google_reviews") or 0) >= 20
                and float(b.get("google_rating") or 0) >= 4.0
                and not geweerd(b.get("naam"), b.get("google_place_id"), True)):
            uit.append((d, b))
    uit.sort(key=lambda t: (-(t[1].get("google_reviews") or 0), t[0]))
    gezien, res = set(), []
    for d, b in uit:                      # spreiden over vakken, niet zes loodgieters
        if b["vak"] in gezien:
            continue
        gezien.add(b["vak"]); res.append((d, b))
        if len(res) >= n:
            break
    return res


# Bij deze vier winkels staat een expliciete vermelding dat ze aangesloten
# partner zijn. Op elke andere plek op deze site geldt dat plaatsing niet te
# koop is, en die claim houdt alleen stand als we het zeggen zodra er wél een
# belang meespeelt.
AUPING = {
    "s-gravenhage":         "Auping Store Den Haag Centrum",
    "rotterdam":            "Auping Store Rotterdam Centrum",
    "leidschendam-voorburg": "Auping Store Leidschendam",
    "zoetermeer":           "Auping Store Zoetermeer",
}
# Gemeenten zonder eigen winkel, met de winkel waar ze op uitkomen.
AUPING_NAAST = {
    "rijswijk-zh": "s-gravenhage", "wassenaar": "s-gravenhage",
    "voorschoten": "leidschendam-voorburg", "pijnacker-nootdorp": "zoetermeer",
    "delft": "s-gravenhage", "westland": "s-gravenhage",
    "midden-delfland": "s-gravenhage", "lansingerland": "zoetermeer",
    "schiedam": "rotterdam", "vlaardingen": "rotterdam", "capelle-aan-den-ijssel": "rotterdam",
    "barendrecht": "rotterdam", "ridderkerk": "rotterdam", "albrandswaard": "rotterdam",
    "krimpen-aan-den-ijssel": "rotterdam", "maassluis": "rotterdam",
}


def auping_blok(p, naam_project, slug):
    """De actie staat alleen op pagina's waar een koper de winkel ook echt kan
    bereiken. De link draagt het project mee, zodat in de winkel te zien is welk
    project een bezoeker stuurde — de code die de verkoper invoert is het
    meetpunt, niet de klik."""
    plaats = p["plaats"]
    winkelplaats = plaats if plaats in AUPING else AUPING_NAAST.get(plaats)
    alle = ", ".join(list(AUPING.values())[:-1]) + " en " + list(AUPING.values())[-1]
    if winkelplaats:
        winkel = AUPING[winkelplaats]
        hoe = ("in " + netjes(plaats)) if plaats in AUPING else (
            "in " + netjes(winkelplaats) + ", de dichtstbijzijnde vestiging")
        waar = (f"Kopers in {E(naam_project)} kunnen bij {E(winkel)} {hoe} terecht met de "
                f"Bylder-korting. De actie geldt bij vier winkels: {E(alle)}.")
        kop = f"Korting op je bed &mdash; {E(winkel)}"
        knop = f"Toon je code voor {E(winkel)}"
    else:
        # Geen winkel binnen bereik, dus geen blok. Dit stond eerst op 242 van de
        # 283 pagina's, waarvan 185 keer met de mededeling dat het een rit is —
        # honderd woorden die overal hetzelfde zeggen en hier niets toevoegen.
        # Dezelfde afweging als bij de Kluskist: alleen beloven wat kan.
        return ""
    link = (f"https://app.bylder.com/register?utm_source=bylder&amp;utm_medium=site"
            f"&amp;utm_campaign=auping&amp;utm_content=project-{slug}")
    # Dezelfde foto als op de homepage (Noble Solid Oak), met hetzelfde srcset.
    # Een bed laat zien waar de korting over gaat; het logo zegt alleen wie het
    # merk is, en dat staat al in de kop en op de knop.
    return f"""<h2>{kop}</h2>
<div class="pk-bed">
<img src="/img/auping-noble-solid-oak.webp"
     srcset="/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w"
     sizes="(max-width:760px) 92vw, 280px"
     alt="Auping Noble Solid Oak, een bed van massief eiken in een slaapkamer"
     width="1000" height="1000" loading="lazy" decoding="async">
<div>
<p>{waar} Tien procent op het reguliere assortiment, te verzilveren in de winkel met je
persoonlijke code. Bij een besteding vanaf &euro;5.000 komt daar een gratis leenbed bij voor de
levertijd, en vanaf &euro;6.500 een overnachting. De korting komt niet bovenop een lopende actie
of sale &mdash; dan geldt die prijs.</p>
<p>Die persoonlijke code krijg je met hetzelfde gratis account waarin je plattegrond staat.</p>
<p><a class="cta-primary" href="{link}">{knop}</a></p>
</div>
</div>
<p class="noot">Auping is aangesloten partner. De korting weegt niet mee in de bedrijven die wij
hierboven noemen; die lijst komt uit afstand, type en beoordelingen.</p>"""


# --- de woningregisseur -----------------------------------------------------
# Golf B van het marktplein-model: op een afgebakende ring rond Baarn staat een
# mens op de pagina in plaats van alleen een formulier. Eén persoon die meerwerk,
# afwerking en inrichting in samenhang regelt — de rol die kopers nu bij drie
# partijen los moeten inkopen.
#
# WAAROM MAAR EEN HANDVOL PLAATSEN. Dit blok belooft dat iemand langskomt. Die
# belofte is alleen waar binnen rijafstand, en een pagina die iets toezegt wat
# niet gebeurt kost meer vertrouwen dan de sectie oplevert — dezelfde afweging
# als bij de Kluskist hierboven. Uitbreiden = deze set uitbreiden, verder niets.
#
# WAAROM "WONINGREGISSEUR" EN GEEN BESTAANDE TITEL. "Interieurarchitect" is een
# beschermde titel (Wet op de architectentitel, architectenregister) en mag hier
# dus niet staan. "Kopersbegeleider" is de term van de bouwer zelf, en juist
# daarvan is dit de onafhankelijke tegenhanger. "Binnenhuisarchitect" dekt alleen
# het inrichten. Regie over alle drie de fases is wat er feitelijk gebeurt.
PILOT = {
    "amsterdam": "Amsterdam", "aalsmeer": "Aalsmeer", "zaanstad": "Zaanstad",
    "haarlemmermeer": "Haarlemmermeer", "utrecht": "Utrecht", "zeist": "Zeist",
}
# Waar het blok verschijnt is iets anders dan welke projecten een pagina krijgen.
# PILOT bepaalt de selectie van --pilot; REGISSEUR_GEBIED bepaalt of het blok op
# een pagina komt. Die twee gelijkstellen zou in Rotterdam en Den Haag tientallen
# nieuwe pagina's opleveren die niemand vroeg — daar staan de pagina's al.
REGISSEUR_GEBIED = set(PILOT) | ns.KERN | ns.RING
# Ondergrens binnen de pilotring: lager dan de landelijke poort, want hier telt
# rijafstand zwaarder dan cohortgrootte. Eikenstein Zeist (36) hoort erbij.
PILOT_POORT = 25


def regisseur_blok(p, naam_project, slug, opl_tekst):
    """Daniel als woningregisseur op de pilotpagina's. Bewust één naam en geen
    'ons team': het is één persoon, en dat is precies het aanbod. De koper die
    hierop reageert levert het marktonderzoek waar de rest van het model op
    wacht — welke keuzes lopen echt vast, en waar loopt een koper klem.

    Het traject is gratis (besluit 29 aug). Dat verplaatst de disclosure: bij een
    betaald advies is 'wij verdienen niet aan je aankoop' het argument, bij een
    gratis advies is het omgekeerde waar en moet de pagina zeggen dat Bylder aan
    de aangesloten bedrijven verdient. Gratis advies dat dat verzwijgt is verkapte
    verkoop; met het belang erbij is het een aanbod dat de koper kan wegen."""
    plaats = netjes(p["plaats"])
    link = (f"https://app.bylder.com/registreer?utm_source=bylder-site"
            f"&amp;utm_medium=projectpagina&amp;utm_campaign=woningregisseur"
            f"&amp;utm_content=project-{slug}")
    return f"""<h2>Een woningregisseur voor {E(naam_project)}</h2>
<p>Na het tekenen loopt alles door elkaar: de meerwerklijst sluit terwijl je nog aan het
rekenen bent, de aannemer wil een keuze die pas over een jaar zichtbaar wordt, en de
inrichting koop je op een moment dat de maten nog niet vaststaan. Wie dat los inkoopt komt
uit bij drie partijen die elkaars werk niet zien.</p>
<p>Een woningregisseur doet die drie in samenhang: <strong>verbouwen, afwerken,
inrichten</strong> &mdash; welk meerwerk je laat staan omdat het later goedkoper kan, welke
afwerking v&oacute;&oacute;r oplevering moet, en welke aankopen kunnen wachten tot de maten
kloppen. In &eacute;&eacute;n plan, met &eacute;&eacute;n aanspreekpunt.</p>
<p>Voor kopers in {E(naam_project)} doet <strong>Daniel Paaij</strong> dit zelf, aan de
keukentafel in {E(plaats)}. Hij is de oprichter van Bylder en houdt deze gesprekken bewust
zelf: de koper krijgt er een plan uit, en wij zien waar het in de praktijk vastloopt.
{moment_zin(p, opl_tekst)}</p>
<p>Het gesprek en het plan zijn <strong>gratis</strong>. Geen uurtarief, geen offerte achteraf.</p>
<p><a class="cta-primary" href="{link}">Plan een gesprek over {E(naam_project)}</a></p>
<p class="noot">Waarom dit gratis kan: Bylder verdient aan de bedrijven en winkels die zich bij
ons aansluiten, niet aan jou. Dat is ook meteen het belang dat je moet kennen &mdash; wij hebben
er baat bij als je bij een aangesloten partij koopt. Daarom staat op deze pagina wie dat zijn,
en daarom komt het advies met de vraag erbij of het ook zonder ons goedkoper kan. Je zit
nergens aan vast: geen contract, geen verplichte offerte, en je dossier blijft van jou.</p>"""


def lokale_winkels(wk, p, straal=15, n=6):
    """Woonwinkels en interieurzaken in de buurt. Bewust GEEN prefab of
    hypotheekadvies: prefab hoort bij verbouwen (dakkapel, aanbouw) en niet bij
    een oplevering, en de hypotheek is bij dit publiek al geregeld. Wat er van de
    geldvraag wel toe doet — meerwerkfinanciering — staat als tekstblok op de
    pagina, niet als adviseurslijst."""
    if not (p.get("lat") and p.get("lng")):
        return []
    goed = {"woonwinkel", "interieurwinkel"}
    uit = []
    for w in wk:
        g = w.get("groep") or w.get("cat")
        if g not in goed and (w.get("cat") not in ("keuken", "vloeren", "sanitair", "meubelwinkel")):
            continue
        if geweerd(w.get("naam"), None, False):
            continue
        if float(w.get("rating") or 0) < 4.0:
            continue
        if not (w.get("lat") and w.get("lng")):
            continue
        d = km(float(p["lat"]), float(p["lng"]), float(w["lat"]), float(w["lng"]))
        if d <= straal and (w.get("reviews") or 0) >= 20:
            uit.append((d, w))
    uit.sort(key=lambda t: (-(t[1].get("reviews") or 0), t[0]))
    zien, res = set(), []
    for d, w in uit:
        c = w.get("cat")
        if c in zien:
            continue
        zien.add(c); res.append((d, w))
        if len(res) >= n:
            break
    return res


def deadlines(lo, hi):
    """Afgeleide keuzemomenten, met verstreken data eruit.

    Een deadlinetabel die opent met "medio 2026" terwijl het augustus 2026 is,
    vertelt de koper dat hij te laat is. Momenten die al voorbij zijn worden
    daarom niet meer getoond; blijft er niets over, dan valt de tabel weg en
    zegt de pagina dat de keuzemomenten voor dit project al lopen.
    """
    ruw = [
        (f"medio {lo-1}", "meerwerk elektra en loze leidingen",
         "wat hier niet in zit, betekent later muren openen"),
        (f"eind {lo-1}", "sanitair en tegelwerk",
         "de badkamerindeling ligt hiermee vast"),
        (f"begin {lo}", "keukenopstelling en aansluitpunten",
         "de keuken zelf kan later, de leidingen niet"),
        (f"kort voor oplevering {lo}" + (f"-{hi}" if hi > lo else ""), "vloer, wandafwerking en raamdecoratie",
         "dit kan ná de sleutel, maar dan woon je in een bouwplaats"),
    ]
    # jaartal uit het label halen en vergelijken met vandaag
    def nog_actueel(label):
        jaren = [int(x) for x in re.findall(r"20\d\d", label)]
        if not jaren:
            return True
        jaar = max(jaren)
        if jaar > VANDAAG.year:
            return True
        if jaar < VANDAAG.year:
            return False
        # zelfde jaar: "medio" is juli, "eind" december, "begin" maart
        maand = 7 if label.startswith("medio") else (12 if label.startswith("eind") else
                 (3 if label.startswith("begin") else 12))
        return maand >= VANDAAG.month
    return [r for r in ruw if nog_actueel(r[0])]


# --- trede 4: opgezocht handwerk -------------------------------------------
# Feiten die niet uit onze data komen: wat er eerder op deze plek stond, de
# starterslening van deze gemeente, de ontwikkelaar, het bestemmingsplan, de
# voorzieningen in de wijk. Ze worden opgezocht en vastgelegd in
# handwerk-feiten.json, met bron en controledatum.
#
# DE BRONPLICHT IS HIER DE HELE POINT. Een feit zonder vindplaats komt niet op
# de pagina — niet met een slag om de arm, niet met "waarschijnlijk", helemaal
# niet. Dit is precies de vraagsoort waarbij een taalmodel iets plausibels
# verzint, en één verzonnen zin op een projectpagina kost meer dan de hele
# sectie oplevert. Vandaag stonden er nog drie pagina's op de site met bedrijven
# die niet bestaan; dezelfde fout, ander jasje.
#
# Feiten verouderen ook. Een controledatum ouder dan een jaar telt niet meer:
# een starterslening kan zijn afgeschaft en een ontwikkelaar failliet.
FEITEN_PAD = os.path.join(CLUSTER, "handwerk-feiten.json")
FEIT_HOUDBAAR_DAGEN = 400
_FEITEN = None

# De volgorde is de leesvolgorde op de pagina, en die is niet willekeurig: wat
# er wél en niet in de koopsom zit staat bovenaan, want dat bepaalt of de
# meerwerklijst over duizenden of tienduizenden euro's gaat. De geschiedenis van
# de plek is aardig maar verandert niets aan wat iemand moet beslissen.
FEIT_KOPPEN = {
    "opleverniveau": "Wat er wel en niet in zit",
    "kopersopties": "Meerwerk en kopersopties",
    "bouwwijze": "Hoe het gebouwd wordt",
    "buitenruimte": "Tuin, balkon en berging",
    "parkeren": "Parkeren",
    "fasering": "Fases en planning",
    "ontwikkelaar": "Wie het bouwt",
    "bestemming": "Bestemmingsplan en welstand",
    "starterslening": "Koopregelingen in deze gemeente",
    "voorzieningen": "Voorzieningen in de wijk",
    "historie": "Wat hier eerder stond",
}


def _feiten():
    global _FEITEN
    if _FEITEN is None:
        try:
            _FEITEN = json.load(open(FEITEN_PAD, encoding="utf8"))
        except (OSError, json.JSONDecodeError):
            _FEITEN = {}
    return _FEITEN


def handwerk_blok(slug, naam):
    """Toont alleen feiten met een waarde, een bron en een verse controledatum."""
    vak = _feiten().get(slug) or {}
    bruikbaar = []
    for sleutel, kop in FEIT_KOPPEN.items():
        f = vak.get(sleutel) or {}
        waarde, bron, datum = (f.get("waarde") or "").strip(), (f.get("bron") or "").strip(), \
                              (f.get("gecontroleerd_op") or "").strip()
        if not (waarde and bron and datum):
            continue
        try:
            gecontroleerd = date.fromisoformat(datum)
        except ValueError:
            continue
        if (VANDAAG - gecontroleerd).days > FEIT_HOUDBAAR_DAGEN:
            continue
        bruikbaar.append((kop, waarde, bron, gecontroleerd))

    if not bruikbaar:
        return ""

    stukken = []
    for kop, waarde, bron, gecontroleerd in bruikbaar:
        link = (f'<a href="{E(bron)}" rel="nofollow noopener" target="_blank">bron</a>'
                if bron.startswith("http") else E(bron))
        stukken.append(f"<h3>{E(kop)}</h3><p>{E(waarde)} "
                       f'<span class="noot">({link}, gecontroleerd {nl_datum(gecontroleerd.isoformat())})</span></p>')

    # De kop was "Over de plek van X" toen dit blok alleen over de locatie ging.
    # Met elf velden gaat het merendeel over de woning en de koop — opleverniveau,
    # meerwerk, bouwwijze — en dan dekt "de plek" de lading niet meer.
    return (f"<h2>Wat {E(naam)} zelf laat weten</h2>"
            f"<p>Opgezocht op de eigen site van het project, met de vindplaats per punt. "
            f"Klopt er iets niet? Laat het weten &mdash; wij passen het aan en noteren "
            f"wanneer.</p>" + "".join(stukken))


# --- trede 3: vragen die per project verschillen ---------------------------
# De gegenereerde pagina's hadden twee vraag-antwoordblokken, de handgeschreven
# zes. Dat verschil bleek bij nameten de kern van hun voorsprong: koppen die
# alleen over dát project gaan in plaats van "[iets] rond [projectnaam]".
#
# Alles hieronder is AFGELEID uit wat we al weten — opleverjaar, aantal
# woningen, de gemeentecijfers, de buurprojecten. Niets is opgezocht en niets
# is geschat. Waar een gegeven ontbreekt, valt de vraag weg in plaats van dat er
# een slag om de arm wordt gehouden; een pagina met "waarschijnlijk" erin is
# minder waard dan een pagina zonder die vraag.

def afgeleide_vragen(p, naam, plaats, lo, hi, won, buren, gem):
    """Vraag-antwoordparen die per project anders uitvallen."""
    uit = []

    # 1. Gasaansluiting. Sinds 1 juli 2018 mogen nieuwe woningen niet meer op
    #    aardgas worden aangesloten (Wet VET). Dat is geen schatting maar wet,
    #    en het is een van de meestgestelde vragen van een nieuwbouwkoper.
    if lo and lo >= 2020:
        uit.append((f"Heeft {naam} een gasaansluiting?",
            f"Nee &mdash; sinds 1 juli 2018 mag dat niet meer (Wet VET). Reken dus op een "
            f"inductiekookplaat en een zwaardere groepenkast in je meerwerk."))

    # 2. Wat sluit er nú. Dezelfde bron als de deadlinetabel, maar dan als
    #    antwoord op de vraag die een koper in augustus stelt.
    # Na de oplevering klopt deze vraag niet meer: er sluit niets meer, want de
    # meerwerklijst is dicht. De tabel filtert verstreken mómenten weg, maar bij
    # een project dat al is opgeleverd blijft "kort voor oplevering" staan.
    dl = [] if opgeleverd(p)[0] else (deadlines(lo, hi) if lo else [])
    if opgeleverd(p)[0]:
        uit.append((f"Wat moet ik nu al beslissen voor {naam}?",
            f"Bij de bouwer niets meer: {naam} is opgeleverd en de meerwerklijst is gesloten. "
            f"Wat overblijft regel je zelf en in je eigen tempo — vloer, binnendeuren, "
            f"wandafwerking en raamdecoratie. Staat de woning nog leeg, dan is dat het "
            f"goedkoopste moment om het in één keer te doen."))
    if dl:
        eerste = dl[0]
        uit.append((f"Wat moet ik nu al beslissen voor {naam}?",
            f"Het eerstvolgende moment is {eerste[0]}: {eerste[1]}. {eerste[2].capitalize()}. "
            f"Daarna volgen nog {len(dl) - 1} keuzemomenten. Deze data zijn teruggerekend vanuit "
            f"de verwachte oplevering; je eigen koop-/aannemingsovereenkomst is leidend."
            if len(dl) > 1 else
            f"Het eerstvolgende moment is {eerste[0]}: {eerste[1]}. {eerste[2].capitalize()}. "
            f"Dit is teruggerekend vanuit de verwachte oplevering; je eigen koop-/aannemings"
            f"overeenkomst is leidend."))

    # 3. Hoe groot is dit project in zijn gemeente. Zegt iets over hoe druk het
    #    straks is met vakmensen en levertijden — en dat is precies waar een
    #    koper na de sleutel tegenaan loopt.
    if won and gem and gem.get("nieuwbouw_gem5"):
        gem5 = gem["nieuwbouw_gem5"]
        aandeel = round(100 * won / gem5) if gem5 else 0
        if aandeel >= 5:
            uit.append((f"Hoe groot is {naam} voor {plaats}?",
                f"{won} woningen, tegenover gemiddeld {gem5} nieuwbouwwoningen per jaar in de "
                f"hele gemeente. Dit project is daarmee goed voor ongeveer {aandeel}% van een "
                f"gemiddeld bouwjaar. Dat merk je aan de vraag naar vakmensen rond de "
                f"oplevering: iedereen zoekt tegelijk een stukadoor en een vloerenlegger."))

    # 4. De buren. Alleen als er meerdere projecten in dezelfde plaats zijn,
    #    want anders is het antwoord "geen" en dat is geen antwoord.
    if buren:
        namen = ", ".join(netjes_naam(q) for q in buren[:3])
        uit.append((f"Wordt er nog meer gebouwd in {plaats}?",
            f"Ja. Wij volgen daar {len(buren) + 1} projecten, waaronder {namen}"
            f"{' en meer' if len(buren) > 3 else ''}. Dat is relevant voor je planning: "
            f"projecten die tegelijk opleveren trekken dezelfde vakbedrijven en dezelfde "
            f"levertijden leeg."))

    return uit


# --- trede 1: de gemeente in cijfers ---------------------------------------
# data/gemeenten.json draagt 21 velden per gemeente en dekt alle 332 projecten
# die groot genoeg zijn voor een eigen publiek. Geen enkele projectpagina
# gebruikte er iets van, terwijl dit precies het soort inhoud is dat de vier
# handgeschreven pagina's onderscheidt: cijfers die per project verschillen
# omdat elke gemeente anders is.
#
# Alles hier komt uit CBS en het Kadaster, met het jaar erbij. Geen schattingen,
# geen vergelijkingen die we niet kunnen onderbouwen.
GEMEENTEN_PAD = os.path.join(ROOT, "data", "gemeenten.json")
_GEM = None
_PRIJSIDX = None


def _gemeenten():
    global _GEM
    if _GEM is None:
        d = json.load(open(GEMEENTEN_PAD, encoding="utf8"))
        _GEM = {"landelijk": d, "per_slug": {g["slug"]: g for g in d["gemeenten"]}}
    return _GEM


def eur_duizend(n):
    """450123 -> '450.000'. Afgerond op duizendtallen, want de bron is een
    jaargemiddelde en een exacte euro suggereert een precisie die er niet is.
    Heet niet eur(): bouw_pagina heeft een eigen, andere eur()."""
    return f"{round(n / 1000):,}".replace(",", ".") + ".000"


def gemeente_blok(p, naam, plaats):
    """Cijfers over de gemeente waar dit project staat.

    Waarom dit op een projectpagina hoort: wie net een woning kocht wil weten of
    hij duur of goedkoop zat, hoeveel er in zijn gemeente gebouwd wordt en hoe
    druk het straks is met vakmensen. Dat is precies de context die de site van
    de ontwikkelaar niet geeft.
    """
    G = _gemeenten()
    g = G["per_slug"].get(p["plaats"])
    if not g or not g.get("prijs"):
        return ""
    land = G["landelijk"]
    rijen = []

    verschil = g.get("prijs_vs_nl")
    if verschil is not None:
        richting = ("hoger dan" if verschil > 0 else "lager dan") if verschil else "gelijk aan"
        rijen.append((f"Gemiddelde woningprijs ({land.get('jaar_prijs', '')[:4]})",
                      f"&euro;{eur_duizend(g['prijs'])}",
                      f"{abs(verschil)}% {richting} het landelijk gemiddelde"
                      if verschil else "gelijk aan het landelijk gemiddelde"))

    reeks = g.get("nieuwbouw_gereed") or {}
    if reeks:
        jaren = sorted(reeks)
        laatste_jaar = jaren[-1]
        rijen.append((f"Nieuwbouw opgeleverd in {laatste_jaar}",
                      f"{reeks[laatste_jaar]:,}".replace(",", "."),
                      f"gemiddeld {g.get('nieuwbouw_gem5', 0):,}".replace(",", ".")
                      + f" per jaar over {jaren[0]}&ndash;{laatste_jaar}"))

    if g.get("vergund"):
        rijen.append(("Vergunningen verleend",
                      f"{g['vergund']:,}".replace(",", "."),
                      f"periode {E(land.get('vergund_periode', ''))} &mdash; dit komt er nog aan"))

    if g.get("doorstroom_pct"):
        # Nederlandse notatie: 22,9% en niet 22.9%.
        rijen.append(("Verhuisbewegingen per jaar",
                      f"{g['doorstroom_pct']}".replace(".", ",") + "%",
                      "van de woningvoorraad wisselt van bewoner"))

    if g.get("vakbedrijven_n"):
        rijen.append(("Vakbedrijven in beeld", f"{g['vakbedrijven_n']:,}".replace(",", "."),
                      f"aannemers, loodgieters, elektriciens en meer in {E(plaats)}"))

    if len(rijen) < 3:
        return ""

    tabel = "".join(f"<tr><td>{k}</td><td><strong>{v}</strong></td>"
                    f"<td style=\"color:rgba(61,46,30,0.7);\">{t}</td></tr>"
                    for k, v, t in rijen)

    duiding = ""
    if verschil is not None and abs(verschil) >= 8:
        duiding = (f"<p>Wonen in {E(plaats)} is {abs(verschil)}% "
                   f"{'duurder' if verschil > 0 else 'goedkoper'} dan gemiddeld in Nederland. "
                   f"Dat werkt door in je meerwerkbudget: aannemers rekenen met lokale "
                   f"tarieven, en die volgen het prijspeil van de regio.</p>")

    return (f"<h2>{E(plaats)} in cijfers</h2>"
            f"<p>Waar je koopt bepaalt meer dan de woning zelf. Dit is de gemeente waarin "
            f"{E(naam)} wordt gebouwd, in cijfers van het CBS en het Kadaster.</p>"
            f'<table class="feit-tabel"><tbody>{tabel}</tbody></table>'
            f"{duiding}"
            f'<p class="noot">Bron: CBS (woningprijzen, voorraad, verhuizingen, '
            f'opgeleverde nieuwbouw en verleende vergunningen) en de bedrijvenregistratie '
            f'van Bylder. Prijspeil {E(land.get("jaar_prijs", "")[:4])}.</p>')




# --- trede 2: wat het project zélf opgeeft ---------------------------------
# Nieuw Wonen Nederland levert per project een prijsvork en een woonoppervlak.
# Nieuwbouw.nl doet dat niet. Dat zijn de eerste harde, projecteigen cijfers op
# deze pagina's: alles daarvoor was een gemeentecijfer of een schatting, en dat
# is precies wat 233 pagina's op elkaar deed lijken.
#
# Alles hieronder is rekenwerk op cijfers van het project zelf, of een
# vergelijking met de projecten die wij al volgen. Geen enkel getal is verzonnen.

def _prijs_index():
    """Prijsvorken van alle projecten die er een opgeven, per plaats en landelijk."""
    global _PRIJSIDX
    if _PRIJSIDX is None:
        alle = json.load(open(PROJECTEN, encoding="utf8"))["projecten"]
        per_plaats = collections.defaultdict(list)
        landelijk = []
        for q in alle:
            v = q.get("prijs_van")
            if not v:
                continue
            per_plaats[q["plaats"]].append((v, q.get("naam") or "", q.get("plaats")))
            landelijk.append(v)
        _PRIJSIDX = {"plaats": per_plaats, "nl": sorted(landelijk)}
    return _PRIJSIDX


def _mediaan(xs):
    xs = sorted(xs)
    n = len(xs)
    return None if not n else (xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) // 2)


def prijsfeiten_blok(p, naam, plaats):
    """De prijsvork, het woonoppervlak en de vierkantemeterprijs van dít project,
    afgezet tegen de andere projecten die wij in dezelfde plaats volgen."""
    van, tot = p.get("prijs_van"), p.get("prijs_tot")
    o_van, o_tot = p.get("woonoppervlak_van"), p.get("woonoppervlak_tot")
    if not van and not o_van:
        return "", []

    rijen, vragen = [], []
    vork = ""
    if van:
        vork = (f"&euro;{eur_duizend(van)} tot &euro;{eur_duizend(tot)}" if tot and tot > van
                else f"vanaf &euro;{eur_duizend(van)}")
        rijen.append(("Vraagprijs", vork, "zoals het project die zelf publiceert"))
    if o_van:
        opp = f"{o_van} tot {o_tot} m&sup2;" if o_tot and o_tot > o_van else f"vanaf {o_van} m&sup2;"
        rijen.append(("Woonoppervlak", opp, "gebruiksoppervlakte wonen"))

    # Vierkantemeterprijs: de goedkoopste woning op de kleinste maat, en de
    # duurste op de grootste. Dat is de vork zoals hij daadwerkelijk uitpakt.
    m2_laag = m2_hoog = None
    if van and o_van:
        m2_laag = round(van / o_van)
        if tot and o_tot:
            m2_hoog = round(tot / o_tot)
        # Oplopend tonen. De kleinste woning heeft niet altijd de laagste
        # vierkantemeterprijs — bij 1865 Stationskwartier is dat €5.830 tegen
        # €5.067 voor de grootste — en "€5.830 tot €5.067" leest als een fout.
        if m2_hoog and m2_hoog != m2_laag:
            onder, boven = sorted((m2_laag, m2_hoog))
            lo_hi = f"&euro;{onder:,} tot &euro;{boven:,}".replace(",", ".")
        else:
            lo_hi = f"&euro;{m2_laag:,}".replace(",", ".")
        rijen.append(("Prijs per vierkante meter", lo_hi,
                      "de goedkoopste en de duurste vierkante meter in dit project"))

    # Positie tussen de projecten die wij in dezelfde plaats volgen. Dit is de
    # vraag die een koper hardop stelt en die de website van de ontwikkelaar
    # nooit beantwoordt: zit ik hier duur? Het antwoord bestaat alleen doordat
    # wij 1.268 projecten volgen — en het is per pagina ander rekenwerk met
    # andere namen, wat deze pagina's onderling laat verschillen.
    duiding = ""
    if van:
        idx = _prijs_index()
        hier = sorted(idx["plaats"].get(p["plaats"], []))
        if len(hier) >= 3:
            lager = sum(1 for x, _n, _p in hier if x < van)
            med = _mediaan([x for x, _n, _p in hier])
            # De vijf projecten rond dit project in prijs, met naam.
            pos = min(range(len(hier)), key=lambda i: abs(hier[i][0] - van))
            van_i, tot_i = max(0, pos - 2), min(len(hier), pos + 3)
            lijst = ""
            for v2, n2, pl2 in hier[van_i:tot_i]:
                dit = (n2 == naam)
                link = f"/nieuwbouw-project/{slugify(n2, pl2)}/"
                label = (f"<strong>{E(n2)}</strong>" if dit
                         else f'<a href="{link}">{E(n2)}</a>')
                lijst += (f'<tr{" style=\"background:rgba(184,92,56,0.07);\"" if dit else ""}>'
                          f"<td>{label}</td><td><strong>vanaf &euro;{eur_duizend(v2)}</strong></td>"
                          f'<td style="color:rgba(61,46,30,0.7);">'
                          f'{"dit project" if dit else ""}</td></tr>')
            duiding = (f"<p>Van de {len(hier)} projecten in {E(plaats)} waarvan wij een prijs "
                       f"kennen, beginnen er {lager} lager dan {E(naam)}. De mediane instapprijs "
                       f"in {E(plaats)} is &euro;{eur_duizend(med)}. Zo ligt {E(naam)} tussen zijn "
                       f"directe buren:</p>"
                       f'<table class="feit-tabel"><tbody>{lijst}</tbody></table>')
            vragen.append((f"Is {naam} duur voor {plaats}?",
                f"De instapprijs is \u20ac{eur_duizend(van)}. Van de {len(hier)} projecten in "
                f"{plaats} waarvan wij een prijs kennen, beginnen er {lager} lager. De mediane "
                f"instapprijs in {plaats} ligt op \u20ac{eur_duizend(med)}. Dat is een "
                f"vergelijking van vraagprijzen, geen taxatie."))
        else:
            nl = idx["nl"]
            med = _mediaan(nl)
            if med:
                duiding = (f"<p>Wij kennen van {len(nl)} nieuwbouwprojecten in Nederland de "
                           f"instapprijs; de mediaan daarvan is &euro;{eur_duizend(med)}. "
                           f"{E(naam)} begint {'daarboven' if van > med else 'daaronder'}.</p>")

    if van and o_van:
        m2_tekst = f"{m2_laag:,}".replace(",", ".")
        maat = f"{o_van} tot {o_tot}" if o_tot and o_tot > o_van else f"{o_van}"
        vragen.append((f"Wat kost een woning in {naam}?",
            f"Het project publiceert {vork.replace('&euro;', chr(8364))} voor woningen van "
            f"{maat} m\u00b2 gebruiksoppervlakte. Voor de kleinste woning komt dat neer op "
            f"ongeveer \u20ac{m2_tekst} per vierkante meter. Prijzen zijn van de aanbieder; "
            f"de actuele prijslijst van het project is leidend."))

    tabel = "".join(f"<tr><td>{k}</td><td><strong>{v}</strong></td>"
                    f"<td style=\"color:rgba(61,46,30,0.7);\">{t}</td></tr>" for k, v, t in rijen)
    bron = p.get("bron") or "nieuwbouw.nl"
    html_blok = (f"<h2>Wat {E(naam)} zelf opgeeft</h2>"
                 f"<p>De cijfers die het project publiceert, met wat ze betekenen als je ze "
                 f"naast de andere nieuwbouw in {E(plaats)} legt.</p>"
                 f'<table class="feit-tabel"><tbody>{tabel}</tbody></table>'
                 f"{duiding}"
                 f'<p class="noot">Bron: {E(bron)}, overgenomen als feit en teruggelinkt. '
                 f"Prijzen en oppervlakten wijzigen; de prijslijst van het project is leidend.</p>")
    return html_blok, vragen


# --- trede 3: wat de afwerking in dít project kost --------------------------
# De vraag die elke koper stelt zodra de koopsom vaststaat. Wij hebben er twee
# dingen voor: het woonoppervlak van het project zelf, en de bandbreedte die op
# onze eigen gietvloerpagina staat. Alles daartussen is één vermenigvuldiging,
# met de aanname zichtbaar in de tekst. Geen bedrag dat wij niet kunnen navertellen.
GIETVLOER_M2 = (80, 130)          # PU-woonvloer, zoals op /gietvloer/ gepubliceerd


def afwerkbudget_blok(p, naam, plaats_ruw, slug, lo, hi, opgel=""):
    o_van, o_tot = p.get("woonoppervlak_van"), p.get("woonoppervlak_tot")
    if not o_van:
        return ""
    stad_slug = re.sub(r"[^a-z0-9]+", "-", plaats_ruw.lower()).strip("-")
    n_gv = _gietvloer_steden().get(stad_slug, 0)
    gv_href = f"/gietvloer/{stad_slug}/" if n_gv else "/gietvloer/"
    conf = ("/kozijnloze-deuren/configurator/?utm_source=bylder-site"
            f"&amp;utm_campaign=project-{slug}-budget")

    # De begane grond is de verdieping waar een gietvloer doorloopt. Bij een
    # eengezinswoning is dat grofweg de helft van het woonoppervlak; bij een
    # appartement ligt alles op één laag. Wij rekenen met de helft en zeggen het
    # erbij, zodat je het zelf kunt bijstellen.
    bg_laag = round(o_van / 2)
    bg_hoog = round((o_tot or o_van) / 2)
    e_laag = bg_laag * GIETVLOER_M2[0]
    e_hoog = bg_hoog * GIETVLOER_M2[1]
    def eu(n):
        return "&euro;" + f"{round(n / 100) * 100:,}".replace(",", ".")

    jaar = f"{lo}" if hi <= lo else f"{lo}\u2013{hi}"
    if opgel:
        deur_zin = ("Het kozijn gaat &iacute;n de wand en wordt meegestukadoord. Hier is "
                    "opgeleverd, dus dit loopt niet meer via de meerwerklijst: je kiest "
                    "zelf wie het doet en wanneer.")
    else:
        # De regelafbreking staat er bewust in: zo blijven de pagina's van
        # projecten die nog niet zijn opgeleverd byte voor byte gelijk.
        deur_zin = (f"Het kozijn gaat &iacute;n de wand en wordt meegestukadoord: bij een "
                    f"oplevering in\n{jaar} is dat een regel op de meerwerklijst, in een "
                    f"bestaand huis een verbouwing.")
    return f"""<h2>Wat de afwerking hier ongeveer kost</h2>
<p>Gerekend met het woonoppervlak dat {E(naam)} zelf opgeeft
({o_van}{f'&ndash;{o_tot}' if o_tot and o_tot > o_van else ''} m&sup2;). Richtbedragen om mee te
beginnen, geen offerte &mdash; maar wel na te rekenen.</p>
<div class="pk-keuzes">
<article>
<div class="pk-etiket">Gietvloer</div>
<h3>{bg_laag}{f'&ndash;{bg_hoog}' if bg_hoog > bg_laag else ''} m&sup2; begane grond</h3>
<p>Voor een PU-woonvloer rekenen we {GIETVLOER_M2[0]} tot {GIETVLOER_M2[1]} euro per vierkante
meter &mdash; de bandbreedte die op onze <a href="{gv_href}">gietvloerpagina</a> staat. Voor dit
project komt dat neer op ruwweg <strong>{eu(e_laag)} tot {eu(e_hoog)}</strong>. Wij rekenen de
begane grond op de helft van het woonoppervlak; ligt jouw woning op &eacute;&eacute;n laag, dan
verdubbel je het.</p>
<p><a class="cta-primary" href="{gv_href}">Vraag offertes aan &rarr;</a></p>
<p class="noot">De dekvloer moet droog zijn v&oacute;&oacute;r het gieten. Dat bepaalt wanneer
het kan, en dus wanneer je moet beslissen.</p>
</article>
<article>
<div class="pk-etiket">Binnendeuren &middot; ClassicNext</div>
<h3>Plafondhoog, zonder kozijn</h3>
{VENSTER.format(conf=conf)}
<p>{deur_zin} De prijs hangt
af van het aantal deuren en de afwerking &mdash; in de configurator zie je hem op jouw eigen
samenstelling, en het aantal deuren komt uit je plattegrond hierboven.</p>
<p><a class="cta-primary" href="{conf}">Stel je deuren samen &rarr;</a></p>
<p class="noot">Dertien groefpatronen, elke RAL-kleur, direct in 3D. Ook de plint.</p>
</article>
</div>
<p class="noot" style="margin-top:14px;">Met een gratis account leggen we deze keuzes vast in je
dossier, krijg je de <a href="/vouchers/">ledenkorting bij aangesloten merken</a> en toetsen we je
offerte aan wat anderen in {E(netjes(plaats_ruw))} betaalden.</p>
"""



# --- trede 4: wat het project zélf publiceert -------------------------------
# Alles hierboven komt uit onze eigen bronnen: het Kadaster, het CBS, onze
# bedrijvenlijst. Feitelijk, maar inwisselbaar — de pagina's leken daardoor op
# elkaar. Dit blok komt van de website van het project zelf, geoogst door
# scripts/projectsite_oogst.py, en verschilt per project van nature.
#
# HET STERKSTE DEEL IS WAT ER ONTBREEKT
# Op de handgeschreven pagina van Haarlemszicht staat de scherpste alinea over
# iets dat er níét is: "Er is geen openbare optielijst — de downloads bevatten
# alleen situatie- en verkooptekeningen. Zonder die documenten weet je niet wat je
# kunt kiezen en tegen welke prijs." Dat is precies het soort zin waarvoor een
# koper terugkomt, en hij is af te leiden uit wat we wel en niet vinden.
#
# Eén voorbehoud, en dat staat er ook bij: wij kijken naar een handvol pagina's
# van die site. Iets niet vinden is niet hetzelfde als iets niet bestaat. De zin
# is daarom "wij vonden het niet, vraag ernaar" en nooit "het bestaat niet".
PROJECTSITES_PAD = os.path.join(ROOT, "data", "projectsites.json")
_SITES = None

# Volgorde van belang voor een koper: zonder omschrijving en optielijst weet hij
# niet wát hij kiest en tegen welke prijs; tekeningen en brochure zijn prettig.
DOC_LABEL = [
    ("technische omschrijving", "de technische omschrijving"),
    ("optielijst", "de optie- of meerwerklijst"),
    ("verkooptekeningen", "de verkooptekeningen"),
    ("verkoopbrochure", "de brochure"),
]


def _projectsites():
    global _SITES
    if _SITES is None:
        try:
            _SITES = json.load(open(PROJECTSITES_PAD, encoding="utf8"))
        except Exception:
            _SITES = {}
    return _SITES


def projectsite_blok(p, naam):
    f = _projectsites().get(p.get("url")) or {}
    site = f.get("site")
    if not site or f.get("_onbereikbaar"):
        return "", []

    docs = f.get("documenten") or {}
    momenten = f.get("momenten") or {}
    kenmerken = f.get("kenmerken") or {}
    partijen = f.get("partijen") or {}
    if not docs and not momenten and not kenmerken and not partijen:
        return "", []

    vragen = []
    regels = []

    # Wie het bouwt, en hoe het verwarmd wordt. Twee dingen die per project
    # verschillen, die een koper wil weten vóór hij tekent, en die tot nu toe
    # nergens op onze pagina stonden terwijl ze op de site van het project zelf
    # staan. Elk met de vindplaats erbij; de zin van de ontwikkelaar nemen we
    # niet over, alleen het feit.
    wie = partijen.get("bouwer") or partijen.get("ontwikkelaar")
    if wie:
        vragen.append((f"Wie bouwt {naam}?",
            f"{wie['naam']}, volgens de eigen site van het project. Wie er bouwt bepaalt welk "
            f"meerwerk via de optielijst loopt en wat je na de oplevering zelf mag regelen."))

    KENMERK_ZIN = {
        "warmtepomp": "een individuele warmtepomp", "stadsverwarming": "stadsverwarming",
        "wko": "warmte-koudeopslag", "vloerverwarming": "vloerverwarming",
        "zonnepanelen": "zonnepanelen", "nom": "een nul-op-de-meter-uitvoering",
        "parkeerkelder": "een parkeerkelder", "kopersbegeleider": "een eigen kopersbegeleider",
        "showroom": "een eigen showroom",
    }
    # KORT HOUDEN IS HIER GEEN STIJLKWESTIE. De eerste versie zette deze feiten in
    # volzinnen: zestig woorden omlijsting om twee woorden feit. Gemeten over 123
    # pagina's zakte de uniciteit daardoor van 20,3% naar 19,2% — het frame is op
    # elke pagina gelijk en verdringt de eigen tekst. Nu een rij met alleen het
    # feit en de vindplaats.
    rijen_f = []
    if wie:
        rol = "Bouwer" if partijen.get("bouwer") else "Ontwikkelaar"
        rijen_f.append((rol, E(wie["naam"]), wie["bron"]))
    for k in KENMERK_ZIN:
        if k in kenmerken:
            rijen_f.append(("Installatie" if k in ("warmtepomp", "stadsverwarming", "wko",
                                                   "vloerverwarming") else "Op het terrein",
                            E(KENMERK_ZIN[k]), kenmerken[k]["bron"]))
    if rijen_f:
        li = "".join(
            f'<li><span>{lbl}</span> <strong>{wat}</strong> '
            f'<a href="{E(bron)}" rel="nofollow noopener" target="_blank">bron</a></li>'
            for lbl, wat, bron in rijen_f[:6])
        regels.append(f"<ul class='pk-eigen'>{li}</ul>")

    # Wat er te downloaden is, en wat niet.
    heeft = [(sleutel, label) for sleutel, label in DOC_LABEL if sleutel in docs]
    mist = [(sleutel, label) for sleutel, label in DOC_LABEL if sleutel not in docs]
    if heeft:
        li = "".join(
            f'<li><a href="{E(docs[sleutel])}" rel="nofollow noopener" target="_blank">'
            f"{E(label[3:] if label.startswith('de ') else label)}</a></li>"
            for sleutel, label in heeft)
        regels.append(f"<p>Op hun eigen site staat {E(heeft[0][1])}"
                      + (f" en nog {len(heeft) - 1} document{'en' if len(heeft) > 2 else ''}"
                         if len(heeft) > 1 else "")
                      + f" klaar:</p><ul class='bedrijven'>{li}</ul>")

    # De twee die ertoe doen, als ze ontbreken.
    kern_mist = [label for sleutel, label in mist
                 if sleutel in ("technische omschrijving", "optielijst")]
    if kern_mist:
        wat = " en ".join(kern_mist)
        regels.append(
            f"<p><strong>Wat wij niet vonden: {E(wat)}.</strong> Vraag die op bij de makelaar "
            f"v&oacute;&oacute;rdat je tekent. Zonder die twee weet je niet wat je zelf mag "
            f"kiezen en tegen welke prijs &mdash; en dat is precies het deel waar meerwerk "
            f"duur wordt. Wij keken naar een handvol pagina&rsquo;s van hun site; het kan zijn "
            f"dat het er wel staat en wij het misten.</p>")
        vragen.append((f"Publiceert {naam} een optielijst?",
            f"Op de eigen site van het project vonden wij {wat} niet. Vraag die op bij de "
            f"makelaar voordat je tekent: zonder die documenten weet je niet welk meerwerk "
            f"mogelijk is en wat het kost. Wij keken naar een deel van hun site, dus het kan "
            f"zijn dat het er wel staat."))

    if "start verkoop" in momenten:
        wanneer = momenten["start verkoop"].get("wanneer")
        if wanneer:
            regels.append(f"<p>Het project meldde zelf de start van de verkoop in "
                          f"<strong>{E(wanneer)}</strong>.</p>")
    if "uitverkocht" in momenten:
        regels.append("<p>Op hun site staat dat (een deel van) dit project "
                      "<strong>uitverkocht</strong> is. Voor wie al gekocht heeft verandert dat "
                      "niets aan de keuzemomenten hieronder.</p>")

    if not regels:
        return "", []

    blok = (f"<h2>Wat {E(naam)} zelf publiceert</h2>"
            + "".join(regels)
            + f'<p class="noot">Gevonden op <a href="{E(site)}" rel="nofollow noopener" '
              f'target="_blank">de website van het project</a>, gecontroleerd op '
              f'{nl_datum(f.get("_gehaald", ""))}.</p>')
    return blok, vragen


# --- ontwerpronde 29 augustus ----------------------------------------------
# Daniel: "wat zijn die pagina's lelijk en niet overtuigend opgemaakt" en "ik zie
# geen enkele opvallende call to action". Dat laatste bleek letterlijk waar: de
# knopkleur was gelijk aan de achtergrondkleur van de pagina.
#
# Wat hier verandert is de volgorde en het ritme, niet de inhoud. De kop gaat
# over de koper in plaats van over ons, ons bewijs uit het Kadaster staat als
# cijferstrook terzijde in plaats van als eerste alinea, de keuzemomenten zijn
# een tijdlijn waarin het eerstvolgende oplicht, en er is één hoofdactie in
# plaats van zeven die even zwaar wegen.

def hero_tekening(naam):
    """Eén schets voor alle projecten, met de projectnaam in het stempel.

    Bewust geen tekening pér project: die data hebben we niet, en een
    gefantaseerde plattegrond is precies het soort verzinsel dat hier nergens
    thuishoort. Dit is een schema, en het stempel zegt dat er ook bij.
    """
    return f"""<div class="pk-tekening">
<svg viewBox="6 63 585 464" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="Isometrische lijntekening van een woning met drie keuzemomenten: dakkapel, vloer en meerwerk">
<defs><pattern id="pkr" width="20" height="20" patternUnits="userSpaceOnUse">
<path d="M20 0 L0 0 0 20" fill="none" stroke="#3D5A3E" stroke-width=".5" opacity=".18"/></pattern></defs>
<rect x="6" y="63" width="585" height="464" fill="url(#pkr)"/>
<g fill="none" stroke="#3D5A3E" stroke-width="1.4" stroke-linecap="round">
<path d="M283.4,214.7 L585.3,389.0 L356.6,521.0 L54.7,346.7 Z" stroke-dasharray="5 5" opacity=".45"/>
<path d="M240.0,374.5 L240.0,326.9"/><path d="M304.0,411.4 L304.0,363.9"/>
<path d="M394.3,414.7 L394.3,375.1"/>
<path d="M105.0,359.9 L333.7,492.0"/><path d="M111.9,356.0 L98.2,363.9"/>
<path d="M340.6,488.0 L326.9,495.9"/>
</g>
<g fill="none" stroke="#3D5A3E" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
<path d="M127.9,346.7 L356.6,478.8 L356.6,357.3 L127.9,225.3 Z" fill="#FFFDF9"/>
<path d="M516.7,386.3 L356.6,478.8 L356.6,357.3 L436.6,216.0 L516.7,264.9 Z" fill="#FFFDF9"/>
<path d="M208.0,84.0 L436.6,216.0 L356.6,357.3 L127.9,225.3 Z" fill="#FFFDF9"/>
<path d="M155.4,362.6 L187.4,381.1 L187.4,301.8 L155.4,283.4 Z"/>
<path d="M219.4,362.6 L260.5,386.3 L260.5,338.8 L219.4,315.0 Z"/>
<path d="M283.4,399.5 L324.6,423.3 L324.6,375.8 L283.4,352.0 Z"/>
<path d="M411.5,404.8 L377.2,424.6 L377.2,385.0 L411.5,365.2 Z"/>
<path d="M372.6,179.1 L372.6,152.7 L395.5,165.9 L395.5,192.3"/>
<path d="M372.6,152.7 L386.3,144.7 L409.2,157.9 L395.5,165.9"/>
<path d="M409.2,157.9 L409.2,173.8"/>
</g>
<g fill="none" stroke="#3D5A3E" stroke-width="2" stroke-dasharray="4 4" opacity=".35">
<path d="M212.5,183.1 L267.5,214.8 L267.5,177.8 L212.5,146.0 Z"/><path d="M212.5,146.0 L243.7,128.0"/>
<path d="M267.5,177.8 L298.6,159.8"/><path d="M243.7,128.0 L298.6,159.8"/>
<path d="M267.5,214.8 L298.6,159.8"/><path d="M226.3,181.7 L253.7,197.6 L253.7,179.1 L226.3,163.2 Z"/>
<path d="M125.6,387.7 L217.1,440.5 L153.1,477.4 L61.6,424.6 Z"/><path d="M109.6,396.9 L201.1,449.7"/>
<path d="M93.6,406.1 L185.1,458.9"/><path d="M77.6,415.4 L169.1,468.2"/>
<path d="M324.6,199.5 L388.6,236.5 L345.2,313.2 L281.1,276.2 Z"/><path d="M345.8,211.8 L302.4,288.5"/>
<path d="M367.3,224.2 L323.9,300.9"/><path d="M302.8,237.9 L366.9,274.9"/>
</g>
<g font-family="monospace" font-size="10" letter-spacing=".6" text-anchor="middle">
<g transform="translate(240.0,103.9)">
<line x1="0" y1="0" x2="0" y2="58" stroke="#B85C38" stroke-width="1.4" opacity=".7"/>
<circle r="13" fill="#B85C38" stroke="#F5F0E8" stroke-width="2"/>
<text y="4" fill="#fff" font-weight="700" font-size="12">1</text>
<text y="-24" fill="#3D5A3E">1 DAKKAPEL</text></g>
<g transform="translate(53.3,402.5)">
<line x1="0" y1="0" x2="86" y2="30" stroke="#B85C38" stroke-width="1.4" opacity=".7"/>
<circle r="13" fill="#B85C38" stroke="#F5F0E8" stroke-width="2"/>
<text y="4" fill="#fff" font-weight="700" font-size="12">2</text>
<text y="32" fill="#3D5A3E">2 VLOER</text></g>
<g transform="translate(426.9,212.4)">
<line x1="0" y1="0" x2="-92" y2="44" stroke="#B85C38" stroke-width="1.4" opacity=".7"/>
<circle r="13" fill="#B85C38" stroke="#F5F0E8" stroke-width="2"/>
<text y="4" fill="#fff" font-weight="700" font-size="12">3</text>
<text y="32" fill="#3D5A3E">3 MEERWERK</text></g>
</g>
</svg>
<div class="pk-stempel">{naam} &middot; schema, geen plattegrond</div>
</div>"""


def cijferstrook(paren):
    """Vier getallen naast elkaar. Lege waarden vallen weg."""
    rijen = [f"<div><b>{w}</b><span>{t}</span></div>" for w, t in paren if w]
    return f'<div class="pk-strook">{"".join(rijen)}</div>' if rijen else ""


def _moment_actueel(label):
    jaren = [int(x) for x in re.findall(r"20\d\d", label)]
    if not jaren:
        return True                       # "kort voor oplevering" telt altijd mee
    jaar = max(jaren)
    if jaar != VANDAAG.year:
        return jaar > VANDAAG.year
    maand = 7 if label.startswith("medio") else (12 if label.startswith("eind") else 3)
    return maand >= VANDAAG.month


def tijdlijn(lo):
    """Alle keuzemomenten, verstreken erbij maar grijs.

    De oude tabel liet verstreken momenten weg. Dat is netjes bedoeld, maar het
    haalt de spanning eruit: een koper wil juist zien dat er al twee voorbij zijn
    en welke er nu speelt. Vandaar alles tonen, met een merkteken op het
    eerstvolgende.
    """
    if not lo:
        return ""
    ruw = [
        (f"medio {lo-1}", "Elektra en loze leidingen",
         "Wat hier niet in zit, betekent later muren openen."),
        (f"eind {lo-1}", "Sanitair en tegelwerk",
         "De badkamerindeling ligt hiermee vast."),
        (f"begin {lo}", "Keukenopstelling en aansluitpunten",
         "De keuken zelf kan later, de leidingen niet."),
        ("kort voor oplevering", "Vloer, wandafwerking en raamdecoratie",
         "Dit kan n&aacute; de sleutel, maar dan woon je in een bouwplaats."),
    ]
    open_i = [i for i, r in enumerate(ruw) if _moment_actueel(r[0])]
    eerste = open_i[0] if open_i else None
    uit = []
    for i, (wanneer, kop, uitleg) in enumerate(ruw):
        klasse = "pk-moment"
        chip = ""
        if i == eerste:
            klasse += " nu"
            chip = '<span class="pk-nu-chip">sluit als eerste</span>'
        elif i not in open_i:
            klasse += " klaar"
        uit.append(f'<div class="{klasse}"><div class="wanneer">{wanneer}</div>'
                   f"<div><h3>{kop}{chip}</h3><p>{uitleg}</p></div></div>")
    return f'<div class="pk-tijdlijn">{"".join(uit)}</div>'


def prijsvergelijking(g, land, plaats):
    """Twee balken: deze gemeente naast het landelijk gemiddelde."""
    if not (g and g.get("prijs") and land.get("nl_prijs")):
        return ""
    hier, nl = g["prijs"], land["nl_prijs"]
    top = max(hier, nl)
    return (f'<div class="pk-verg">'
            f'<div class="rij"><div class="naam">{plaats}</div>'
            f'<div class="baan"><i class="hier" style="width:{round(100*hier/top)}%"></i></div>'
            f'<div class="cijfer">&euro;{eur_duizend(hier)}</div></div>'
            f'<div class="rij"><div class="naam">Nederland</div>'
            f'<div class="baan"><i class="nl" style="width:{round(100*nl/top)}%"></i></div>'
            f'<div class="cijfer">&euro;{eur_duizend(nl)}</div></div></div>')


SHINGLE = 8
UNIEK_VLOER = 35   # de grens waarop de vakbedrijf-profielen op 31 juli uit de index gingen


def meet_uniciteit(toon=8):
    """Meet hoeveel van elke pagina alleen op díe pagina staat.

    STOND HIER EERST ALS VASTE TEKST. De generator printte elke ronde "mediaan
    20,4%" — een getal uit een meting van weken eerder, hardgecodeerd, dat niet
    meebewoog met wat hij zelf net had weggeschreven. Precies het cijfer waarop
    we moeten besluiten of de poort open mag, en het werd niet gemeten.

    Methode: elke pagina wordt gehakt in stukjes van acht opeenvolgende woorden
    (de tekst, zonder script/style/svg). Een stukje dat op twee of meer pagina's
    voorkomt telt als duplicaat. Uniciteit = het aandeel stukjes dat maar één
    keer voorkomt in de hele set.
    """
    paden = [p for p in sorted(glob.glob(os.path.join(CLUSTER, "content", "*.html")))
             if os.path.basename(p) not in ("index.html", "oplevermonitor.html")]
    if len(paden) < 2:
        return []
    per, teller = {}, collections.Counter()
    for pad in paden:
        s = open(pad, encoding="utf8").read()
        s = re.sub(r"<(script|style|svg)\b[^>]*>.*?</\1>", " ", s, flags=re.S | re.I)
        w = re.sub(r"[^a-z0-9 ]", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)).lower()).split()
        sh = {tuple(w[i:i + SHINGLE]) for i in range(max(0, len(w) - SHINGLE + 1))}
        per[pad] = sh
        teller.update(sh)
    scores = sorted((sum(1 for x in sh if teller[x] == 1) / len(sh) * 100,
                     os.path.basename(pad)[:-5]) for pad, sh in per.items() if sh)
    med = statistics.median(s[0] for s in scores)
    laag = sum(1 for s in scores if s[0] < UNIEK_VLOER)
    print(f"\nTekstuniciteit (shingle van {SHINGLE} woorden, gemeten op wat er nu staat):")
    print(f"  mediaan {med:.1f}%  ·  onder de {UNIEK_VLOER}%: {laag} van {len(scores)}")
    if laag:
        # IJkpunten met dezelfde methode gemeten (N=8, nav en footer eruit), niet
        # overgenomen uit een notitie: kennisbank 92,0%, nieuwbouw-plaatspagina's
        # 36,1%, stukadoor-profielen 24,9% — die laatste staan uit de index.
        print(f"  Zelfde methode op andere clusters: kennisbank 92%, plaatspagina's 36%, "
              f"stukadoor-profielen 25% (die staan uit de index). Dit cluster zit daaronder.")
        print("  Let op: dit cijfer hangt aan de shingle-lengte. Bij 15 woorden leest "
              "dezelfde set 31,7%. Gebruik het om verschillen te zien, niet als rapportcijfer.")
    print("  laagste:", ", ".join(f"{n} ({s:.0f}%)" for s, n in scores[:3]))
    print("  hoogste:", ", ".join(f"{n} ({s:.0f}%)" for s, n in scores[-3:]))
    return scores


def mijn_woning_link(naam, slug, plek):
    """De link naar /mijn-woning/ met het project erbij. utm_content zegt welke knop
    het was (hero of blok), zodat we zien welke van de twee het werk doet."""
    return ("/mijn-woning/?project=" + slug + "&naam=" + urllib.parse.quote(naam)
            + "&utm_source=bylder&utm_medium=projectpagina&utm_campaign=mijn-woning"
            + "&utm_content=" + plek)


def tekening_blok(naam, slug, app, is_opgeleverd):
    """De plattegrond erin, vlak onder de kop en als eerste vraag op de pagina.

    WAAROM DIT BLOK BOVENAAN HOORT. De pagina vroeg om een account voordat hij
    iets had bewezen. Dit blok bewijst eerst: sleep de tekening erin en je ziet je
    eigen woning in 3D, zonder account. Een woning zien maakt enthousiaster dan een
    document uploaden (Daniel, 23-09-2026). Het account komt daarna, als de plek
    waar die woning bewaard blijft.

    WAAR DE KNOP HEEN GAAT. Naar /mijn-woning/ op deze site, met het project erbij
    (?project=<slug>&naam=<naam>). Die pagina meet wanden, ruimtes, deuren en kap
    uit de vectoren van de PDF, in de browser, en zet de naam van het project in
    de kop. Een scan of foto heeft geen vectoren; daarvoor blijft de tekening-
    analyse in de app (taalmodel), als tweede link.

    WAT ER BELOOFD WORDT IS WAT HIJ DOET. Oppervlakte per ruimte, de binnendeuren
    geteld en benoemd, de vloer in m² met een rekenvoorbeeld. Geen offerte: de
    offertetool voor gietvloeren bestaat nog niet.
    """
    link = mijn_woning_link(naam, slug, "blok")
    foto = app.replace(f"project-{slug}", f"project-{slug}-tekening")
    wanneer = ("Woon je er al, dan zie je zo wat er aan afwerking op je afkomt."
               if is_opgeleverd else
               "Zo weet je v&oacute;&oacute;r de meerwerklijst sluit hoe je woning eruitziet en wat erin moet.")
    return f"""<h2>Zie je woning in {E(naam)}, voordat hij af is</h2>
<p>Sleep de plattegrond die je van de ontwikkelaar kreeg erin. Een paar seconden later staat
je woning in 3D: elke ruimte met zijn vierkante meters, elke binnendeur geteld en benoemd
naar de kamer die hij afsluit, en hoeveel vloer je nodig hebt. {wanneer}</p>
<div class="pk-uitkomst">
<div><strong>Je woning in 3D</strong><span>wanden, ruimtes en kap uit je eigen tekening</span></div>
<div><strong>Elke binnendeur</strong><span>geteld, en in &eacute;&eacute;n keer naar de deurconfigurator</span></div>
<div><strong>Je vloer in m&sup2;</strong><span>per ruimte aan of uit, met een rekenvoorbeeld gietvloer</span></div>
</div>
<p><a class="cta-primary" href="{E(link)}">Zie je woning in 3D &rarr;</a></p>
<p class="noot">Geen account nodig; je tekening blijft op je eigen apparaat. Werkt met de
PDF van je verkoop- of meerwerktekening. Alleen een scan of foto?
<a href="{foto}">Zet hem in je dossier</a>, dan rekenen wij hem na.</p>"""


def lidmaatschap_blok(app, met_auping):
    """Wat het gratis account nog meer oplevert, op élke projectpagina.

    De Auping-korting staat alleen op de 45 pagina's met een winkel binnen
    bereik: vier winkels, alleen in de winkel, dus elders is het een belofte die
    een koper niet kan verzilveren. Het lidmaatschap zelf geldt wél overal, en
    dat stond nergens op deze pagina's — alleen een kale link naar /vouchers/
    op zestig procent van de pagina.

    EERLIJK OVER HET VERSCHIL. Van de 56 aangesloten merken zijn er 17 waar de
    korting losstaat van een winkel; de andere 39 hangen aan een vestiging. Die
    splitsing staat er met zoveel woorden bij, want "korting bij 56 merken"
    suggereert dat ze allemaal overal gelden en dat is niet zo.
    """
    overal = [d for d in DEELNEMERS.values() if not d.get("plaats") and d.get("aanbod")]
    n_overal, n_totaal = len(overal), len(DEELNEMERS)
    # Drie met een hard getal; die zeggen meer dan een merk zonder bedrag.
    keuze = [d for d in overal if re.match(r"^[€\d]", str(d.get("aanbod")))][:3]
    rijtje = "".join(
        f'<li><strong>{E(d["naam"])}</strong> &middot; {E(str(d["aanbod"]))} '
        f'<span>{E(d.get("cat") or "")}</span></li>' for d in keuze)
    auping_zin = (" De Auping-korting hierboven is er zo een: die geldt bij vier winkels."
                  if met_auping else "")
    return f"""<h2>Wat het account verder oplevert</h2>
<p>Ledenkorting bij {n_totaal} merken. Bij {n_overal} staat die los van een winkel; de andere
{n_totaal - n_overal} hangen aan een vestiging &mdash; welke dat bij jou zijn, staat in je
dossier.{auping_zin}</p>
<ul class="pk-leden">{rijtje}</ul>
<p><a class="cta-stil" href="/vouchers/">Bekijk de ledenkortingen</a></p>"""


def moment_zin(p, opl_tekst, aanwijzend="de"):
    """Eén zin over het moment, die ook klopt als er al opgeleverd is.

    Stond twee keer bijna identiek in de regisseurblokken ("Met een oplevering
    <datum> vallen de keuzes nu"). Na oplevering is dat onwaar: de keuzes bij de
    bouwer zijn dan geweest, en juist daarom is er iets te regelen.
    """
    klaar, wanneer = opgeleverd(p)
    if klaar:
        return (f"Hier is {E(wanneer)} opgeleverd, dus de meerwerklijst is dicht &mdash; "
                f"wat er nu gebeurt, kies je zelf.")
    return f"Met een oplevering {E(opl_tekst)} vallen {aanwijzend} keuzes nu."


def moment_blok(is_opgeleverd, opgel_wanneer, opl_tekst, grondslag, lo, app):
    """De keuzemomenten, of — na oplevering — wat er dan nog te kiezen valt.

    Vóór de oplevering is dit de urgentie van de pagina: de tijdlijn telt terug
    naar de sleutel. Daarna slaat die redenering om. De tijdlijn zou alles grijs
    tonen zonder eerstvolgend moment, en "zet je opleverdatum in je dossier"
    vraagt om iets wat de bewoner al heeft. Wat er dan nog wél toe doet is dat
    de meerwerklijst dicht is en de keuze dus van hem is.
    """
    if is_opgeleverd:
        return f"""<h2>Wat er nu nog te kiezen valt</h2>
<p>De oplevering was {E(opgel_wanneer)}. De meerwerklijst is daarmee dicht, en dat scheelt:
vloer, deuren, wandafwerking en raamdecoratie liggen nu bij jou en niet bij de
aannemer. Wie er nog niet woont heeft het rustigste moment te pakken dat er is, want in een
leeg huis kan alles in &eacute;&eacute;n keer.</p>
<p style="margin-top:20px;"><a class="cta-stil" href="{app}">Zet je woning in je dossier</a></p>"""
    return f"""<h2>Wat er nu op je afkomt</h2>
<p>Teruggerekend vanuit een oplevering {opl_tekst} ({grondslag}). Je eigen
<a href="/kennisbank/bouwtechniek/">koop-/aannemingsovereenkomst</a> is leidend.</p>
{tijdlijn(lo)}
<p style="margin-top:20px;"><a class="cta-stil" href="{app}">Zet je opleverdatum in je dossier</a></p>"""


def regisseur_kaart(naam_project, plaats, slug, opl_tekst, opl_zin):
    """De woningregisseur in een donker vlak, zonder portret.

    Er komt geen foto (besluit Daniel, 29 aug). Een monogram is eerlijker dan een
    lege plek of een stockfoto van iemand die hier niet werkt.
    """
    link = (f"https://app.bylder.com/registreer?utm_source=bylder-site"
            f"&amp;utm_medium=projectpagina&amp;utm_campaign=woningregisseur"
            f"&amp;utm_content=project-{slug}")
    return f"""<div class="pk-mens">
<div class="kop"><div class="pk-monogram" aria-hidden="true">DP</div>
<div><h3>Dani&euml;l Paaij</h3><div class="rol">Woningregisseur &middot; oprichter van Bylder</div></div></div>
<p>Meerwerk, afwerking en inrichting in &eacute;&eacute;n plan, aan je eigen keukentafel in {plaats}.
Ongeveer anderhalf uur. Je krijgt een overzicht van wat je via de aannemer doet, wat je na
oplevering zelf regelt, en in welke volgorde. {opl_zin}</p>
<p><strong>Het gesprek en het plan zijn gratis.</strong> Geen uurtarief, geen offerte achteraf.</p>
<p><a class="cta-primary" href="{link}">Plan een gesprek over {naam_project}</a></p>
<p class="fijn">Waarom dit gratis kan: Bylder verdient aan de bedrijven en winkels die zich bij ons
aansluiten, niet aan jou. Daarom komt het advies met de vraag erbij of het ook zonder ons
goedkoper kan. Je zit nergens aan vast.</p></div>"""


# --- zoekresultaat en deelkaart -------------------------------------------
# Gemeten 29 augustus: 38 van de 40 projectpagina's had een titel boven de 60
# tekens en 26 een description boven de 158 — allebei worden ze in Google
# afgekapt, precies op de plek waar de belofte staat. En geen enkele pagina had
# een og:image, dus elke deling in WhatsApp of Slack toonde een blinde kaart.
#
# Deze pagina's staan op positie 4 tot 7 als iemand de projectnaam zoekt. Dat is
# goed genoeg om gezien te worden; wat ontbreekt is de reden om te klikken.
OG_BEELD = "https://www.bylder.com/og/nieuwbouw-gemeente.jpg"
TITEL_MAX = 60
DESC_MAX = 155


def kort_titel(kern, staart=" | Bylder"):
    """Houdt de titel onder de afkapgrens, en gooit weg wat het minst mist.

    Volgorde: eerst het merkachtervoegsel (dat staat toch al in het domein onder
    het resultaat), dan de toelichting achter het gedachtestreepje, dan pas de
    naam zelf. Zo overleeft altijd waar de zoeker op zocht — de projectnaam —
    in plaats van dat die er als eerste afvalt.
    """
    if len(kern + staart) <= TITEL_MAX:
        return kern + staart
    if len(kern) <= TITEL_MAX:
        return kern
    for scheider in (" \u2014 ", ": ", ", "):
        if scheider in kern:
            voor = kern.split(scheider)[0]
            if len(voor) <= TITEL_MAX:
                return voor
    return kern[:TITEL_MAX - 1].rstrip(" ,;-") + "\u2026"


def kort_desc(tekst):
    """Kapt af op een zinsgrens in plaats van midden in een woord."""
    tekst = " ".join(tekst.split())
    if len(tekst) <= DESC_MAX:
        return tekst
    knip = tekst[:DESC_MAX]
    for teken in (". ", "? ", "! "):
        i = knip.rfind(teken)
        if i > DESC_MAX * 0.6:
            return knip[:i + 1].strip()
    return knip[:knip.rfind(" ")].rstrip(" ,;-") + "\u2026"


# --- twee afwerkingen die vóór de oplevering vallen -------------------------
# Waarom dit blok bovenaan staat: het is geen advertentie maar een deadline.
# Een kozijnloos deurkozijn gaat in de wand en wordt meegestukadoord, en een
# gietvloer ligt op de dekvloer. Allebei dus vóór de sleutel, en allebei
# achteraf duur. Dat is wat het op déze pagina thuis maakt: hij gaat al over
# keuzemomenten die sluiten.
#
# Het blok verschilt per project, want anders staat dezelfde alinea 189 keer
# op de site: het noemt het opleverjaar van dit project, de plaats, en het
# aantal gietvloerleggers dat wij in die plaats in kaart hebben. Geen van die
# drie is verzonnen — ze komen uit dezelfde data als de rest van de pagina.

_GV = None


def _gietvloer_steden():
    """Plaatsen waarvoor we een gietvloerpagina met bedrijven hebben."""
    global _GV
    if _GV is None:
        try:
            with open("data/clusters/gietvloer/cities.json", encoding="utf-8") as f:
                rauw = json.load(f)
            _GV = {k: len(v.get("companies") or []) for k, v in rauw.items()}
        except (OSError, ValueError):
            _GV = {}
    return _GV


# Het configuratorvenster: een schermafbeelding van de configurator zelf, in een
# kaal vensterkader. Zonder beeld moet de koper zich "plafondhoog, in de kleur van
# de wand" voorstellen; met beeld ziet hij in een halve seconde wat het ding doet.
# Dezelfde afbeelding als in het blok op de homepage. De link is dezelfde als de
# knop eronder, dus weg uit de tabvolgorde en weg voor de schermlezer.
VENSTER = (
    '<a class="pk-venster" href="{conf}" tabindex="-1" aria-hidden="true">'
    '<span class="balk"><i></i><i></i><i></i>'
    '<span>bylder.com/kozijnloze-deuren/configurator</span></span>'
    '<img src="/img/configurator/configurator-voorbeeld.jpg"'
    ' srcset="/img/configurator/configurator-voorbeeld-sm.jpg 640w,'
    ' /img/configurator/configurator-voorbeeld.jpg 1200w"'
    ' sizes="(max-width:760px) 92vw, 420px" alt="" width="1200" height="530"'
    ' loading="lazy" decoding="async"></a>'
)


def keuzes_blok(naam, plaats, plaats_ruw, slug, lo, hi, opgel=""):
    stad_slug = re.sub(r"[^a-z0-9]+", "-", plaats_ruw.lower()).strip("-")
    n_gv = _gietvloer_steden().get(stad_slug, 0)
    conf = ("/kozijnloze-deuren/configurator/?utm_source=bylder-site"
            f"&amp;utm_campaign=project-{slug}")
    gv_href = f"/gietvloer/{stad_slug}/" if n_gv else "/gietvloer/"

    # De deadline in eigen woorden, met het opleverjaar van dít project. Is er
    # al opgeleverd, dan is het omgekeerde waar: de meerwerklijst is dicht, en
    # dat is hier geen verlies maar de kern van het aanbod — je bent niet meer
    # gebonden aan wat de bouwer aanbood.
    jaar = f"{lo}" if hi <= lo else f"{lo}-{hi}"
    if opgel:
        deadline = ("De meerwerklijst is hier dicht: dit regel je nu zelf, "
                    "bij wie je zelf kiest.")
    else:
        deadline = (f"Bij een oplevering in {jaar} valt die keuze op de meerwerklijst, "
                    f"niet op de verhuislijst.")

    gv_bewijs = (f"Je ziet wie het in {E(plaats)} doet, met beoordelingen en afstand."
                 if n_gv else
                 "Je ziet per plaats wie het doet, met beoordelingen en afstand.")

    lokaal = (f" In {E(plaats)} hebben wij {n_gv} gietvloerleggers in kaart gebracht,"
              f" met hun beoordelingen." if n_gv >= 3 else "")
    venster = VENSTER.format(conf=conf)
    if opgel:
        inleiding = (f"<p>Deuren zonder kozijn en een gietvloer horen bij de eerste "
                     f"maanden in een nieuw huis: allebei gaan ze het best in een woning "
                     f"waar nog niets in zit.{lokaal} {deadline}</p>")
        kop = "Twee afwerkingen die je het beste nu doet"
    else:
        # Regelafbrekingen exact als voorheen: pagina's van projecten die nog
        # niet zijn opgeleverd blijven zo byte voor byte gelijk.
        inleiding = (f"<p>Deuren zonder kozijn en een gietvloer kunnen allebei alleen in een "
                     f"nieuw huis, en allebei\nmoeten ze besloten zijn voordat de stukadoor en "
                     f"de dekvloer klaar zijn &mdash; dus ruim\nv&oacute;&oacute;r de oplevering "
                     f"van {E(naam)}.{lokaal} {deadline}</p>")
        kop = "Twee afwerkingen die je nu kiest, niet later"
    return f"""<h2>{kop}</h2>
{inleiding}
<div class="pk-keuzes">
<article>
<div class="pk-etiket">Deuren zonder kozijn &middot; ClassicNext</div>
<h3>Een deur die opgaat in de wand</h3>
{venster}
<p>Plafondhoog, zonder omlijsting, in de kleur van de wand. Het kozijn gaat &iacute;n de wand en
wordt meegestukadoord &mdash; dus deze keuze valt v&oacute;&oacute;r de stukadoor begint, eerder
dan de meeste kopers denken.</p>
<p><a class="cta-primary" href="{conf}">Stel je deur samen &rarr;</a></p>
<p class="noot">Dertien groefpatronen, elke RAL-kleur, direct in 3D. Ook de plinten.</p>
</article>
<article>
<div class="pk-etiket">Gietvloer</div>
<h3>E&eacute;n vloer, geen naden</h3>
<p>Naadloos over de hele verdieping, en beter voor de vloerverwarming die er al ligt. De
dekvloer moet w&eacute;l droog zijn, en dat bepaalt wanneer het kan.</p>
<p><a class="cta-primary" href="{gv_href}">Vraag een offerte aan &rarr;</a></p>
<p class="noot">{gv_bewijs}</p>
</article>
</div>
<p class="noot" style="margin-top:14px;">Met een gratis account krijg je bij allebei de
<a href="/vouchers/">ledenkorting bij aangesloten merken</a>.</p>
"""


def bouw_pagina(p, ruimtes, vb, wk, buren, gem_totaal, indexeerbaar):
    naam, plaats = p["naam"], netjes(p["plaats"])
    won = p.get("woningen") or 0
    slug = slugify(naam, p["plaats"])
    opl_tekst, lo, hi, grondslag = oplever_schatting(p)
    is_opgeleverd, opgel_wanneer = opgeleverd(p)
    plaats_ruw = p["plaats"]
    hard = p.get("oplevering_bron") == "oplevertrefwoord"
    reg = f"?utm_source=bylder-site&amp;utm_campaign=project-{slug}"
    app = "https://app.bylder.com/registreer" + reg

    # De eigen cijfers van het project, en wat de afwerking daarmee kost.
    prijs_html, prijs_vragen = prijsfeiten_blok(p, naam, plaats)
    site_html, site_vragen = projectsite_blok(p, naam)
    budget_html = afwerkbudget_blok(p, naam, plaats_ruw, slug, lo, hi, opgel_wanneer)

    besl_tot = sum(len(r["beslissingen"]) for r in ruimtes)
    mw = sorted({m for r in ruimtes for m in (r.get("meerwerk") or [])})
    top = ruimtes[:6]

    # --- opleverblok: andere tekst naar gelang wat we echt weten ---
    if hard:
        opl_blok = (f"<p>{E(naam)} noemt zelf <strong>{lo}</strong> als opleverjaar. Dat is een "
                    f"opgave van het project en daarmee harder dan wat wij voor de meeste "
                    f"projecten kunnen zeggen &mdash; maar ook die datum staat in werkbare "
                    f"werkdagen, niet in kalenderdagen.</p>")
    elif p.get("jaren"):
        opl_blok = (f"<p>Op de projectpagina staan kwartaalnotaties die uitkomen "
                    f"<strong>{opl_tekst}</strong>. Wij nemen dat als bandbreedte en niet als "
                    f"datum, want zo'n notatie gaat net zo vaak over de start van de verkoop "
                    f"als over de oplevering.</p>")
    elif _opleverdata().get(p.get("url")):
        b = _opleverdata()[p["url"]]
        opl_blok = (f"<p>{E(naam)} noemt zelf <strong>{E(b['wanneer'])}</strong> als moment van "
                    f"oplevering. Dat staat op "
                    f'<a href="{E(b["bron"])}" rel="nofollow noopener" target="_blank">hun eigen '
                    f"site</a>; wij hebben die zin nagelezen voordat we hem hier overnamen. Ook "
                    f"een opgave van het project zelf is een planning en geen belofte &mdash; "
                    f"jouw koop-/aannemingsovereenkomst is leidend.</p>")
    else:
        opl_blok = (f"<p>{E(naam)} publiceert zelf geen opleverdatum. Wij schatten daarom "
                    f"<strong>{opl_tekst}</strong>, op de vuistregel van ongeveer anderhalf jaar "
                    f"tussen verkoop en sleutel. Dat is een schatting van Bylder en niets meer "
                    f"dan dat &mdash; jouw contract is leidend.</p>")

    dl = "".join(f"<tr><td>{E(w)}</td><td>{E(t)}</td><td>{E(g)}</td></tr>"
                 for w, t, g in deadlines(lo, hi))

    rijen = "".join(
        f"<tr><td><a href=\"{r['pagina_pad']}\">{E(r['naam'])}</a></td>"
        f"<td>{len(r['beslissingen'])}</td>"
        f"<td>{E(', '.join((r.get('meerwerk') or [])[:3]) or '&mdash;')}</td></tr>" for r in top)

    eerste = [(r["naam"], r["beslissingen"][0]) for r in top[:3]]
    vragen = "".join(
        f"<div class=\"faq-item\"><div class=\"faq-q\">{E(b['vraag'])}</div>"
        f"<div class=\"faq-a\">{E((b.get('waarom') or '')[:340])} "
        f"<a href=\"{[r for r in top if r['naam']==rn][0]['pagina_pad']}\">Meer over de {E(rn.lower())}</a>.</div></div>"
        for rn, b in eerste)

    # --- lokale vakbedrijven: echte namen, dus echt unieke tekst ---
    lok = lokale_vakbedrijven(vb, p)
    lok_html = ""
    if lok:
        li = "".join(f"<li><strong>{E(b['naam'])}</strong> &mdash; {E(b['vak'])} in "
                     f"{E(b.get('stad') or plaats)}, {d:.0f} km van {E(naam)}"
                     + (f", &#9733;{b['google_rating']} uit {b['google_reviews']} beoordelingen"
                        if b.get('google_rating') else "") + "</li>" for d, b in lok)
        # Twee publieken op één blok. De koper zoekt hier een vakman; het vakbedrijf
        # dat naar dit project kijkt — omdat het in zijn werkgebied ligt — herkent
        # zichzelf en leest wat er voor hem in zit. Eén regel, onder de lijst: de
        # pagina blijft van de koper.
        #
        # Hier is dat scherper dan op een profielpagina, want hier staat een cohort
        # dat op hetzelfde moment gaat inrichten.
        #
        # Het klusregister (uitgevoerde klussen per project) landt later als eigen
        # sectie vlak vóór de kennisbank-links — eerst het eigen bewijs, dan het
        # vervolg elders. Bewust géén aankondiging hier dat het komt: een pagina
        # die belooft wat er nog niet is, is precies wat we op deze site niet doen.
        cohort = (f"de {won} huishoudens die hier gaan wonen" if won
                  else "de kopers van dit project")
        voor_vakman = (
            f'<div style="background:rgba(184,92,56,0.06);border-left:3px solid #B85C38;'
            f'border-radius:0 10px 10px 0;padding:14px 18px;margin:16px 0 0;">'
            f'<p style="font-size:14.5px;line-height:1.7;color:rgba(61,46,30,0.78);margin:0;">'
            f'<strong>Werk jij aan {E(naam)}?</strong> Verdien aan wat de kopers hier inrichten: '
            f'koopt een klant via jouw persoonlijke code, dan krijgt hij korting en ontvang jij '
            f'vanaf 1% van de aankoopwaarde. '
            f'<a href="/zakelijk/hoe-een-order-verloopt/#vakbedrijven" '
            f'style="color:#3D5A3E;font-weight:700;">Zo werkt dat</a> &middot; '
            f'<a href="/voor-vakbedrijven/" style="color:#3D5A3E;font-weight:700;">aansluiten</a>'
            f'</p></div>')
        lok_html = (f"<h2>Vakbedrijven rond {E(naam)}</h2><p>Bedrijven binnen twaalf kilometer "
                    f"met minstens twintig beoordelingen, gespreid over de vakken die bij een "
                    f"oplevering langskomen. Wij rangschikken op passendheid en afstand; een "
                    f"positie is bij ons niet te koop.</p>"
                    f"<ul class='bedrijven'>{li}</ul>{voor_vakman}")

    # Meerwerkbedragen schalen mee met het woningtype dat in dit project overheerst;
    # de percentages zijn generiek, de uitkomst per project niet.
    # Publiceert het project zelf een prijsvork, dan rekenen we daarmee. Anders
    # blijft het een aanname op projectgrootte, en dat staat er dan ook bij.
    if p.get("prijs_van"):
        koopsom = (p["prijs_van"] + p["prijs_tot"]) // 2 if p.get("prijs_tot") else p["prijs_van"]
    else:
        koopsom = 285000 if won >= 400 else (340000 if won >= 150 else 395000)
    mw_laag, mw_hoog = int(koopsom * 0.05 / 1000) * 1000, int(koopsom * 0.15 / 1000) * 1000
    fin_max = int(koopsom * 0.25 / 1000) * 1000
    def eur(n):
        # duizendtallen met een punt, zonder de rest van de zin te raken — de
        # vorige versie draaide .replace(",", ".") over de hele f-string en at
        # daarmee ook de komma van ", te betalen" op
        return "&euro;" + f"{n:,}".replace(",", ".")

    geld_html = (
        f"<p>Meerwerk kost doorgaans vijf tot vijftien procent van de koopsom en moet in "
        f"termijnen worden betaald terwijl je hypotheek al vaststaat. Geldverstrekkers laten "
        f"je het meefinancieren tot ongeveer een kwart van de som, maar het venster is kort: "
        f"geregeld v&oacute;&oacute;r de meerwerkdeadline hierboven, niet erna. Hoe dat precies "
        f"werkt staat in de <a href=\"/kennisbank/meerwerk/\">meerwerkgids</a>.</p>")

    # Eén handeling direct onder het antwoord. Stond eerst op 1933 px, ver onder de
    # vouw: de bezoeker las wat wij weten en kon er niets mee. Les van Solvari, waar
    # de enige handeling op 441 px staat.
    # De hero belooft anders iets wat niet meer kan: "wij volgen de bouw" en
    # "wij bewaken je keuzemomenten" gaan over een bouw die af is. De regel-
    # afbreking in de oorspronkelijke zin blijft staan, zodat de 281 pagina's van
    # projecten die nog moeten opleveren byte voor byte gelijk blijven.
    # De hoofdknop is sinds 25-09-2026 "Zie je woning in 3D": je eigen woning zien
    # maakt meer indruk dan een project volgen (Daniel). Volgen blijft de tweede
    # knop; de woningregisseur heeft verderop een eigen blok en kaart.
    if is_opgeleverd:
        intro_zin = ("De oplevering is geweest. Wij helpen je met wat daarna komt: wat de "
                     "afwerking hoort te kosten, en bij welke winkels je korting krijgt.")
        hero_knop = "Richt je woning in"
    else:
        intro_zin = ("Wij volgen de bouw, bewaken je keuzemomenten en zorgen dat je bij de\n"
                     "afwerking en inrichting niet te veel betaalt.")
        hero_knop = "Volg dit project"

    if is_opgeleverd:
        start_zin = (f"<p><strong>Woning gekocht in {E(naam)}?</strong> Hier is opgeleverd, dus "
                     f"het meerwerk is geweest. Wat je zelf doet &mdash; vloer, deuren, "
                     f"wandafwerking &mdash; koop je bij ons voordeliger, en je garanties staan "
                     f"op &eacute;&eacute;n plek.</p>")
    else:
        start_zin = (f"<p><strong>Woning gekocht in {E(naam)}?</strong> Wij volgen de bouw voor "
                     f"je en rekenen elke deadline terug naar jouw bouwnummer. Je bespaart bij "
                     f"de afwerking en inrichting, en je garanties staan straks op "
                     f"&eacute;&eacute;n plek.</p>")
    start_html = (
        f'<div class="startblok">'
        f"{start_zin}"
        f'<p><a class="cta-primary" href="{app}">Volg {E(naam)} gratis</a></p>'
        f'<p class="klein">Gratis account &middot; geen betaling nodig &middot; opzeggen wanneer je wilt</p>'
        f"</div>")

    keuze_html = (f"<h2>Keuzemomenten voor {E(naam)}</h2>"
                  f'<table class="feit-tabel"><thead><tr><th>Wanneer</th><th>Wat sluit</th>'
                  f"<th>Waarom het uitmaakt</th></tr></thead><tbody>{dl}</tbody></table>"
                  ) if dl else (
                  f"<h2>Keuzemomenten voor {E(naam)}</h2>"
                  f"<p>De belangrijkste keuzemomenten voor {E(naam)} liggen al achter ons of "
                  f"lopen nu. Wat er in jouw geval nog open staat, hangt af van je bouwnummer "
                  f"en je eigen koop-/aannemingsovereenkomst.</p>")
    feiten_html, log_html = verkoop_blok(p, E(naam))
    tabel_html = ""
    if not feiten_html:
        feiten_html, tabel_html, log_html = bag_blok(p, E(naam))
    # De Kluskist alleen beloven waar hij binnen afzienbare tijd kan komen. Op 36
    # pagina's een kist toezeggen voor een oplevering in 2029 is een belofte die
    # je niet nakomt, en dat kost meer geloofwaardigheid dan de sectie opbrengt.
    kluskist_html = ""
    if hi and hi <= VANDAAG.year + 1:
        kluskist_html = (
            f"<h2>De Kluskist komt naar {E(naam)}</h2>"
            f"<p>Als de eerste woningen worden opgeleverd klust iedereen tegelijk. Bylder "
            f"plaatst dan een Kluskist in de wijk: gereedschap, schroeven, pluggen en tape, "
            f"gratis te leen bij een bewoner. Wil jij de kist in huis nemen?</p>"
            f'<p><a class="cta-primary" href="{app}-kluskist">Vraag de Kluskist aan</a></p>')
    # Vraag-antwoord: zichtbaar op de pagina, en het schema zegt hetzelfde —
    # de vorige versie had een FAQ-schema over tekst die nergens stond.
    metingen_faq = [m for m in (SNAPSHOTS.get(p.get("url")) or []) if betrouwbaar(p, m[1])]
    faq_items = []
    if p.get("oplevering") and p.get("oplevering_bron") == "oplevertrefwoord":
        faq_items.append((f"Wanneer wordt {naam} opgeleverd?",
            f"Het project noemt zelf {p['oplevering']} als opleverjaar. Wij meten elke twee "
            f"weken de bouwstatus in het Kadaster; het verloop staat in het logboek op deze pagina."))
    elif _opleverdata().get(p.get("url")):
        b = _opleverdata()[p["url"]]
        if is_opgeleverd:
            faq_items.append((f"Is {naam} al opgeleverd?",
                f"Ja. Het project noemt zelf {b['wanneer']} als moment van oplevering; dat staat "
                f"op de eigen site van {naam} en is door ons nagelezen. De meerwerklijst is "
                f"daarmee gesloten: afwerking en inrichting regel je nu zelf. Wij meten elke twee "
                f"weken de bouwstatus in het Kadaster."))
        else:
            faq_items.append((f"Wanneer wordt {naam} opgeleverd?",
                f"Het project noemt zelf {b['wanneer']} als moment van oplevering; dat staat op de "
                f"eigen site van {naam} en is door ons nagelezen. Een planning is geen belofte — je "
                f"koop-/aannemingsovereenkomst is leidend. Wij meten elke twee weken de bouwstatus "
                f"in het Kadaster."))
    else:
        faq_items.append((f"Wanneer wordt {naam} opgeleverd?",
            f"Er is geen officiële opleverdatum gepubliceerd. Wij schatten een oplevering "
            f"{opl_tekst}, op basis van {grondslag}. Wij meten elke twee weken de bouwstatus."))
    if metingen_faq:
        fd, fv = metingen_faq[-1]
        faq_items.append((f"Hoeveel woningen zijn er nog beschikbaar in {naam}?",
            f"Stand {nl_datum(fd)}: nog {fv['beschikbaar']} van de {fv['eenheden']} aangeboden "
            f"woningen beschikbaar ({fv['verkocht_pct']}% verkocht). Gemeten door Bylder op de "
            f"beschikbaarheid per fase."))
    faq_items += prijs_vragen
    faq_items += site_vragen
    faq_items += afgeleide_vragen(p, naam, plaats, lo, hi, won, buren,
                                  _gemeenten()["per_slug"].get(p["plaats"]))

    faq_html = "<h2>Veelgestelde vragen over " + E(naam) + "</h2>" + "".join(
        f"<h3>{E(q)}</h3><p>{E(ant)}</p>" for q, ant in faq_items)

    # De gemeente in cijfers. Staat vóór de bedrijvenlijsten en ná de
    # keuzemomenten: eerst wat er speelt in dit project, dan waar het staat, dan
    # wie het kan uitvoeren.
    gem_html = gemeente_blok(p, E(naam), E(plaats))

    # Opgezocht handwerk. Leeg zolang er niets met bron is vastgelegd — dat is
    # de bedoeling en geen gebrek.
    hand_html = handwerk_blok(slug, E(naam))

    # Direct na de keuzemomenten: daar staat wát er beslist moet worden, hier
    # staat wie het samen met je doet. Vóór de bedrijvenlijsten, want dit is de
    # regie over die lijsten en niet nog een aanbieder erin.
    reg_html = (regisseur_kaart(E(naam), E(plaats), slug, opl_tekst, moment_zin(p, opl_tekst, "die"))
                if plaats_ruw in REGISSEUR_GEBIED else "")

    aup_html = auping_blok(p, E(naam), slug)
    wnk = lokale_winkels(wk, p)
    wnk_html = ""
    if wnk:
        # Deelnemers eerst: dat is wat de bezoeker hier komt halen, en het is de
        # zichtbare beloning voor de winkel die betaalde.
        wnk = sorted(wnk, key=lambda t: (deelnemer(t[1]["naam"]) is None, t[0]))
        li = ""
        for d, w in wnk:
            dl = deelnemer(w["naam"])
            merk = (f' <span class="deelnemer">Bylder-korting'
                    + (f": {E(dl['aanbod'])}" if dl.get("aanbod") else "") + "</span>") if dl else ""
            li += (f"<li><strong>{E(w['naam'])}</strong>{merk} &mdash; {E(w.get('cat') or 'wonen')}, "
                   f"{d:.0f} km"
                   + (f", &#9733;{w['rating']} uit {w['reviews']} beoordelingen" if w.get("rating") else "")
                   + "</li>")
        vraag = (f'<div class="card"><h3>Nog geen Bylder-korting bij een van deze winkels?</h3>'
                 f"<p>Bylder-leden krijgen ledenkorting bij aangesloten winkels en merken. Wil "
                 f"jij korting bij een winkel die nog niet meedoet? Maak een gratis account "
                 f"&mdash; wij vragen je bij welke winkels jij korting wilt, bundelen die vraag "
                 f"met je buren uit {E(naam)} en nodigen de winkel uit. Hoe meer kopers "
                 f"meedoen, hoe sterker de uitnodiging.</p>"
                 f'<p><a class="cta-primary" href="https://app.bylder.com/winkelwens?project={slug}'
                 f'&amp;utm_source=bylder-site&amp;utm_campaign=project-{slug}-winkelwens">'
                 f"Vraag korting aan bij winkels in de buurt</a></p></div>")
        wnk_html = (f"<h2>Woonwinkels binnen 15 km</h2><ul class='bedrijven'>{li}</ul>"
                    f'<p class="noot">Gespreid over categorie&euml;n, minstens twintig '
                    f"beoordelingen, minimaal vier sterren. Deze lijst is niet te koop.</p>"
                    + vraag)

    # --- buurprojecten: per gemeente andere namen ---
    buur_html = ""
    if buren:
        bl = "".join(f'<li><a href="/nieuwbouw-project/{slugify(b["naam"], b["plaats"])}/">'
                     f'{E(b["naam"])}</a>'
                     + (f" &mdash; {b['woningen']} woningen" if b.get('woningen') else "") + "</li>"
                     for b in buren[:5])
        buur_html = (f"<h2>Andere nieuwbouw in {E(plaats)} ({gem_totaal} projecten)</h2>"
                     f"<ul class='bedrijven'>{bl}</ul>")
    elif gem_totaal <= 1:
        buur_html = (f'<p class="noot">{E(naam)} is het enige nieuwbouwproject dat wij in '
                     f"{E(plaats)} volgen.</p>")

    aant = f"{won} woningen" if won else "meerdere woningen"

    # --- de pagina, in de volgorde van de koper -----------------------------
    # 1 hero met één hoofdactie, 2 ons bewijs als cijferstrook, 3 zijn agenda,
    # 4 waar hij koopt, 5 de mens, 6 wie het werk kan doen, 7 korting,
    # 8 vragen, 9 één slotactie. De oude volgorde begon met ons bewijs.
    G = _gemeenten()
    g_hier = G["per_slug"].get(p["plaats"])
    meting = [m for m in (SNAPSHOTS.get(p.get("url")) or []) if betrouwbaar(p, m[1])]
    bag = BAG.get(p.get("url"))

    # BAG.get() geeft (datum, meting) terug; de cijfers zitten in de meting.
    strook = []
    if bag:
        _b = bag[1]
        if _b.get("in_aanbouw"):
            strook.append((str(_b["in_aanbouw"]), "panden in aanbouw"))
        if _b.get("opgeleverd"):
            strook.append((str(_b["opgeleverd"]), "recent opgeleverd"))
    if won:
        strook.append((str(won), "woningen in dit project"))
    if meting:
        strook.append((f"{meting[-1][1]['verkocht_pct']}%", "verkocht"))
    # Een volledige datum als groot cijfer breekt de strook; kort houden.
    if bag:
        _d = date.fromisoformat(bag[0])
        strook.append((f"{_d.day} {NL_MAAND[_d.month - 1][:3]}", "laatste meting"))
    else:
        strook.append((opgel_wanneer, "opgeleverd") if is_opgeleverd
                      else (opl_tekst, "verwachte oplevering"))

    vragen_html = "".join(
        f'<details class="pk-vraag"{" open" if n == 0 else ""}>'
        f"<summary>{E(q)}</summary><p>{E(a)}</p></details>"
        for n, (q, a) in enumerate(faq_items))

    body = f"""<main>
<div class="container"><div class="kolom">
<nav aria-label="Kruimelpad" style="font-size:12.5px;color:rgba(61,46,30,0.72);margin-bottom:18px;">
<a href="/" style="color:inherit;">Bylder.com</a> &rsaquo;
<a href="/nieuwbouw-project/" style="color:inherit;">Nieuwbouwprojecten</a> &rsaquo; {E(naam)}</nav>

<div class="pk-hero">
<div>
<div class="pk-etiket">{E(plaats)} &middot; {aant} &middot; {("opgeleverd " + E(opgel_wanneer)) if is_opgeleverd else ("oplevering " + E(opl_tekst))}</div>
<h1>Je tekende voor {E(naam)}.<br>Nu begint het pas.</h1>
<p class="intro">{intro_zin}</p>
<div class="pk-acties">
<a class="cta-primary" href="{E(mijn_woning_link(naam, slug, "hero"))}">Zie je woning in 3D &rarr;</a>
<a class="cta-stil" href="{app}">{hero_knop}</a>
</div>
<p class="pk-onder">Sleep je plattegrond erin &middot; geen account nodig &middot; je tekening blijft op je eigen apparaat</p>
</div>
{hero_tekening(E(naam))}
</div>

{cijferstrook(strook)}

{tekening_blok(naam, slug, app, is_opgeleverd)}

{budget_html if budget_html else keuzes_blok(naam, plaats, plaats_ruw, slug, lo, hi, opgel_wanneer)}

{aup_html}

{lidmaatschap_blok(app, bool(aup_html))}

{prijs_html}

{site_html}

{moment_blok(is_opgeleverd, opgel_wanneer, opl_tekst, grondslag, lo, app)}

{gem_html}
{prijsvergelijking(g_hier, G["landelijk"], E(plaats))}

{hand_html}


<h2>Iemand die het met je doorloopt</h2>
{reg_html}

{lok_html}
{wnk_html}

{tabel_html}
{log_html}

<h2>Wat kopers ons vragen over {E(naam)}</h2>
{vragen_html}

{buur_html}
{kluskist_html}

<div class="pk-slot">
<div class="pk-etiket">E&eacute;n handeling</div>
<h2>Volg {E(naam)}</h2>
<p>Elke twee weken een nieuwe meting in je dossier, je deadlines teruggerekend naar jouw
bouwnummer.</p>
<p><a class="cta-primary" href="{app}">Maak een gratis account &rarr;</a></p>
<p class="fijn">Geen betaling nodig &middot; opzeggen wanneer je wilt</p>
</div>

<p style="font-size:13px;color:rgba(61,46,30,0.72);margin-top:28px;">Bouwstatus gemeten door
Bylder in de BAG van het Kadaster. Projectgegevens van
<a href="{E(p['url'])}" rel="nofollow noopener" target="_blank">{E(p.get('bron') or 'nieuwbouw.nl')}</a>. Landelijke
telling in de <a href="/nieuwbouw-project/oplevermonitor/">oplevermonitor</a>. Algemene uitleg
over meerwerk en opleveren in de <a href="/kennisbank/">kennisbank</a>. Meer over de gemeente:
<a href="/wonen-in/{E(p['plaats'])}/">wonen in {E(plaats)}</a>.</p>
</div></div>
</main>"""

    # De titel doet rankingwerk en wint vertrouwen; de description is advertentie-
    # ruimte en praat tegen de koper (Daniels leestest: wie is ingeloot klikt op
    # korting bij winkels in de buurt, niet op het ambtelijke resultaat). Waar het
    # project grotendeels verkocht is, is de zoeker vrijwel zeker een koper en
    # krijgt ook de titel de belofte. GSC beslecht per pagina wie gelijk had.
    _m = [m for m in (SNAPSHOTS.get(p.get("url")) or []) if betrouwbaar(p, m[1])]
    pct_nu = _m[-1][1].get("verkocht_pct") if _m else None
    if opgeleverd(p)[0]:
        # Opgeleverd: "wij volgen de bouw" is dan een belofte over iets wat voorbij
        # is, en juist in de zoekresultaten valt dat op. Wat er nog wel is: de
        # afwerking, en die koopt de bewoner nu zelf.
        # Kort houden: kort_titel() gooit alles achter het gedachtestreepje weg
        # zodra de titel over de 60 tekens gaat, en "opgeleverd" is precies het
        # woord dat deze pagina onderscheidt van de 280 andere.
        titel = f"{naam}, {plaats} \u2014 opgeleverd"
        desc = (f"{naam} is opgeleverd, dus de afwerking is aan jou. Ledenkorting bij "
                f"aangesloten merken en je offerte getoetst aan marktprijzen. Gratis.")
    elif pct_nu is None or pct_nu >= 85:
        titel = f"{naam}, {plaats} \u2014 korting bij woonwinkels"
        desc = (f"Woning gekocht in {naam}? Wij volgen de bouw voor je \u00e9n je bespaart op "
                f"afwerking en inrichting: ledenkortingen, offertes getoetst aan marktprijzen. "
                f"Gratis.")
    elif pct_nu is not None:
        titel = f"{naam}, {plaats}: {pct_nu}% verkocht \u2014 oplevering"
        desc = (f"{naam} kopen of al gekocht? Wij meten de verkoopstand elke twee weken "
                f"({pct_nu}% verkocht) en helpen kopers besparen op afwerking en inrichting. "
                f"Onafhankelijk, gratis.")
    else:
        titel = f"{naam}, {plaats} \u2014 oplevering en bouwstatus"
        desc = (f"{naam} in {plaats}: {aant}, oplevering {opl_tekst}. Wij volgen de bouwstatus "
                f"en helpen kopers besparen op afwerking en inrichting. Gratis.")
    art = {"@context": "https://schema.org", "@type": "Article",
           "headline": f"{naam}, {plaats} — wat er ná de handtekening komt",
           "description": desc,
           # Niet vandaag: dat is een vers-stempel zonder inhoud. De datum van de
           # laatste waarneming die op deze pagina staat.
           "dateModified": (BAG.get(p.get("url")) or [VANDAAG.isoformat()])[0],
           "author": {"@type": "Organization", "name": "Bylder.com"},
           "publisher": {"@type": "Organization", "name": "Bylder.com",
                         "url": "https://www.bylder.com/"},
           "isBasedOn": p.get("url"),
           "about": {"@type": "Residence", "name": naam,
                     "address": {"@type": "PostalAddress", "addressLocality": plaats,
                                 "addressCountry": "NL"},
                     **({"geo": {"@type": "GeoCoordinates", "latitude": p["lat"],
                                 "longitude": p["lng"]}} if p.get("lat") and p.get("lng") else {}),
                     **({"numberOfAccommodationUnits": {"@type": "QuantitativeValue",
                          "value": won}} if won else {})}}
    faq_schema = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q,
         "acceptedAnswer": {"@type": "Answer", "text": ant}} for q, ant in faq_items]}
    brood = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Bylder.com", "item": "https://www.bylder.com/"},
        {"@type": "ListItem", "position": 2, "name": "Nieuwbouwprojecten",
         "item": "https://www.bylder.com/nieuwbouw-project/"},
        {"@type": "ListItem", "position": 3, "name": naam,
         "item": f"https://www.bylder.com/nieuwbouw-project/{slug}/"}]}

    rij = {"slug": slug, "path": f"/nieuwbouw-project/{slug}/",
           "title": kort_titel(titel.replace(" | Bylder", "").replace(" | Bylder.com", "")),
           "description": kort_desc(desc), "og_type": "article",
           "og_image": OG_BEELD, "twitter_card": "summary_large_image",
           "robots": "index,follow" if indexeerbaar else "noindex,follow",
           "ldjson": [json.dumps(x, ensure_ascii=False) for x in (art, faq_schema, brood)],
           "content_kind": None}
    return slug, body, rij


def bouw_hub(rijen, kandidaten, totaal_projecten):
    """De hub. Was een stub van 137 woorden op noindex; hij staat nu boven pagina's
    die we w&eacute;l willen laten indexeren, en een noindex-ouder boven indexeerbare
    kinderen is een structuurfout. Inhoud is de telling zelf — dat is data die
    nergens anders zo staat."""
    per = collections.defaultdict(list)
    for r in rijen:
        per[r["_plaats"]].append(r)
    won_tot = sum(k.get("woningen") or 0 for k in kandidaten)
    blokken = []
    for plaats in sorted(per):
        li = "".join(
            f'<li><a href="{E(r["path"])}">{E(r["_naam"])}</a> &mdash; '
            f'{r["_won"]} woningen{", oplevering " + E(r["_opl"]) if r.get("_opl") else ""}</li>'
            for r in sorted(per[plaats], key=lambda x: -x["_won"]))
        blokken.append(f"<h3>{E(plaats)}</h3><ul class='bedrijven'>{li}</ul>")
    return f"""<main>
<div class="container"><div class="kolom">
<nav aria-label="Kruimelpad" style="font-size:12.5px;color:rgba(61,46,30,0.72);margin-bottom:14px;">
<a href="/" style="color:inherit;">Bylder.com</a> &rsaquo; Nieuwbouwprojecten</nav>
<h1>Nieuwbouwprojecten &mdash; wat er n&aacute; de handtekening komt</h1>
<p>Wij volgen <strong>{totaal_projecten} nieuwbouwprojecten</strong> in Nederland. Voor
{len(rijen)} daarvan staat hier uitgewerkt wat een koper na het tekenen te wachten staat:
welke keuzes er zijn, wanneer ze dichtgaan, wat het kost en welke bedrijven in de buurt het
werk doen. Wij verkopen geen woningen en worden niet betaald door de ontwikkelaar.</p>
<p>Deze {len(rijen)} projecten samen zijn goed voor <strong>{won_tot:,} woningen</strong>.
De landelijke telling &mdash; alle {totaal_projecten} projecten, met opleverjaar &mdash; staat in de
<a href="/nieuwbouw-project/oplevermonitor/">oplevermonitor</a>.</p>
<h2>Waarom per project, en niet &eacute;&eacute;n algemene gids</h2>
<p>Een oplevering in 2027 vraagt andere dingen dan een oplevering volgend voorjaar. Meerwerk
sluit maanden voor de sleutel; vloeren en keukens hebben levertijden die per regio verschillen;
en in een gemeente waar vier projecten tegelijk opleveren is een goede stukadoor schaarser dan
in een gemeente met &eacute;&eacute;n. Daarom rekenen wij per project terug vanaf de opleverdatum.</p>
<h2>Projecten per plaats</h2>
{"".join(blokken)}
<div class="card"><h2>Staat jouw project er niet bij?</h2>
<p>Zet je opleverdatum in je dossier, dan rekenen wij de keuzemomenten terug naar jouw
bouwnummer &mdash; ook als er nog geen pagina is. Gratis.</p>
<p><a class="cta-primary" href="https://app.bylder.com/register?utm_source=bylder&amp;utm_medium=site&amp;utm_campaign=nieuwbouw-project-hub">Maak een gratis account</a></p></div>
</div></div>
</main>""".replace("{won_tot:,}".format(won_tot=won_tot), f"{won_tot:,}".replace(",", "."))


# De handgeschreven pagina's blijven handwerk — maar de meetlaag (verkoopstand,
# Kadaster, Auping-blok) hoort ook daar te staan en vers te blijven. Daarom een
# gemarkeerd blok dat elke run wordt ververst zonder de tekst eromheen te raken.
# Bijvangst: het eerder los aangeplakte Auping-blok stond buiten de content-
# kolom en rendeerde over de volle breedte; dat ruimt dit meteen op.
HANDWERK_INFO = {
    "de-suikerzijde-groningen": {"plaats": "groningen", "naam": "De Suikerzijde", "zoek": "suikerzijde"},
    "volharding-marum": {"plaats": "marum", "naam": "Volharding", "zoek": "volharding"},
    "condorpark-apeldoorn": {"plaats": "apeldoorn", "naam": "CondorPark", "zoek": "condor"},
    "haarlemszicht-haarlem": {"plaats": "haarlem", "naam": "Haarlemszicht", "zoek": "haarlemszicht"},
}
MARK_A, MARK_B = "<!--bylder:meetlaag-->", "<!--/bylder:meetlaag-->"


def verrijk_handwerk(projecten):
    for slug, info in HANDWERK_INFO.items():
        f = os.path.join(CLUSTER, "content", f"{slug}.html")
        if not os.path.exists(f):
            continue
        h = open(f, encoding="utf8").read()
        # oude losse aanplak weghalen (stond buiten de kolom)
        i = h.find("<h2>Korting op je bed")
        if i >= 0 and MARK_A not in h[:i]:
            j = h.find("</main>", i)
            h = h[:i] + (h[j:] if j >= 0 else "")
        # bestaand gemarkeerd blok weghalen (idempotent)
        if MARK_A in h and MARK_B in h:
            h = h[:h.index(MARK_A)] + h[h.index(MARK_B) + len(MARK_B):]
        prj = next((q for q in projecten
                    if info["zoek"] in (q.get("naam") or "").lower()
                    and q["plaats"] == info["plaats"]), None)
        feiten = log = ""
        if prj:
            feiten, log = verkoop_blok(prj, E(info["naam"]))
        aup = auping_blok({"plaats": info["plaats"]}, E(info["naam"]), slug)
        blok = (f'{MARK_A}<div style="max-width:820px;margin:0 auto;">'
                f"{feiten}{log}{aup}</div>{MARK_B}\n")
        h = h.replace("</main>", blok + "</main>", 1) if "</main>" in h else h + blok
        open(f, "w", encoding="utf8").write(h)
        print(f"handwerk verrijkt: {slug}" + (" (met verkoopdata)" if feiten else " (alleen Auping)"))


def main():
    projecten = [p for p in json.load(open(PROJECTEN, encoding="utf8"))["projecten"] if p.get("status")]
    vbd = json.load(open(VAKBEDRIJVEN, encoding="utf8"))
    vb = vbd if isinstance(vbd, list) else (vbd.get("vakbedrijven") or list(vbd.values())[0])
    wkd = json.load(open(WINKELS, encoding="utf8"))
    wk = wkd["winkels"] if isinstance(wkd, dict) else wkd
    ruimtes = laad_ruimtes()

    pj = os.path.join(CLUSTER, "pages.json")
    pages = json.load(open(pj, encoding="utf8"))
    HANDWERK = os.path.join(CLUSTER, "handwerk.json")
    if os.path.exists(HANDWERK):
        handgeschreven = set(json.load(open(HANDWERK, encoding="utf8")))
    else:
        # eerste keer: alles wat er nu staat is handwerk, en dat leggen we vast
        handgeschreven = {x["slug"] for x in pages if x["slug"] not in ("index", "oplevermonitor")}
        json.dump(sorted(handgeschreven), open(HANDWERK, "w", encoding="utf8"), indent=1)

    prio = ns.KERN | ns.RING
    if ALLEEN_PILOT:
        prio = set(PILOT)
    def poort(p):
        # Waar een Auping Store staat willen we hoe dan ook gevonden worden, dus
        # daar mag een kleiner project ook een pagina krijgen. Op 4 aug van 50 naar
        # 25; op 5 aug naar 10, omdat Leidschendam met één project te dun was —
        # De Pauwentuin (22 woningen) hoort er gewoon bij. Onder de 10 wordt het
        # een pagina zonder publiek.
        if p["plaats"] in AUPING:
            return 10
        # Binnen de pilotring telt rijafstand zwaarder dan cohortgrootte: daar is
        # een kleiner project juist bruikbaar, want de regisseur kan er langs.
        if p["plaats"] in PILOT:
            return PILOT_POORT
        # Een project dat zijn prijsvork én zijn woonoppervlak publiceert, draagt
        # meer eigen feiten dan een groot project dat alleen een aantal woningen
        # noemt. Daar mag de cohortdrempel dus lager: twintig kopers is genoeg
        # publiek voor een pagina die echt iets te vertellen heeft.
        if p.get("prijs_van") and p.get("woonoppervlak_van"):
            return 20
        return MIN_WONINGEN

    def eigen_feiten(p):
        """Hoeveel dit project zélf te vertellen heeft.

        WAAROM NAAST DE WONINGDREMPEL. De poort hierboven meet cohortgrootte, en
        dat is een slechte maat voor of een pagina iets te zeggen heeft: 558 van
        de 1.268 projecten hebben helemaal geen woningaantal en vallen dus af om
        een leeg veld, niet omdat ze te klein zijn. Tegelijk haalt een project
        van 60 woningen zonder verdere gegevens de poort wél, en dan staat er
        een pagina die alleen zijn naam draagt.

        Wat hier telt is wat de pagina uniek maakt: de Kadaster-meting (en
        vooral de reeks, want die heeft niemand anders), de eigen prijsvork, het
        woonoppervlak, en de ligging waarmee we winkels en vakbedrijven in de
        buurt kunnen noemen.
        """
        n = 0
        b = BAG.get(p.get("url"))
        if b and (b[1].get("nieuwste_bouwjaar")):
            n += 1
        if b and b[1].get("in_aanbouw"):
            n += 1
        if len(SNAPSHOTS.get(p.get("url")) or []) >= 2:
            n += 1          # een reeks is een logboek, en dat is het eigenste dat we hebben
        if p.get("prijs_van"):
            n += 1
        if p.get("woonoppervlak_van"):
            n += 1
        if p.get("woningen"):
            n += 1
        if p.get("lat") and p.get("lng"):
            n += 1
        return n

    kandidaten = [p for p in projecten
                  if ((p.get("woningen") or 0) >= poort(p) or eigen_feiten(p) >= MIN_FEITEN)
                  and (not (ALLEEN_REGIO or ALLEEN_PILOT) or p["plaats"] in prio)]

    # In de pilotring telt bovendien het moment. Het regisseur-blok zegt "de keuzes
    # vallen nu"; op een project dat in 2029 oplevert is dat niet waar, en 42
    # pagina's in zes plaatsen delen bovendien zo veel tekst dat de uniciteit onder
    # de 35% zakt waarop de vakbedrijf-profielen op 31 juli uit de index gingen.
    # Vandaar: alleen projecten met een eigen opgegeven opleverjaar binnen twee
    # jaar. Dat is een selectie op wat we wéten, niet op wat we schatten.
    #
    # 'zwak trefwoord (ONBETROUWBAAR)' en projecten zonder enige datum vallen af:
    # daar weten we het moment niet en kan het blok zijn belofte niet waarmaken.
    # De kwartaalnotatie is onzeker maar wél een uitspraak van het project zelf,
    # en de pagina zegt er in het opleverblok bij dat het een bandbreedte is.
    if ALLEEN_PILOT:
        BRON_OK = {"oplevertrefwoord", "kwartaalnotatie (onzeker)"}
        kandidaten = [p for p in kandidaten
                      if p.get("oplevering_bron") in BRON_OK
                      and str(p.get("oplevering", ""))[:4].isdigit()
                      and VANDAAG.year <= int(str(p["oplevering"])[:4]) <= VANDAAG.year + 1]

    # Niemand zoekt "zwanenpark fase 2" — men zoekt "zwanenpark vlaardingen".
    # Drie bijna-identieke fase-URL's verdringen elkaar; één pagina met de fases
    # als rijen wint. De oude fase-adressen krijgen een 301 in vercel.json.
    def fasebasis(n):
        # Sommige projectnamen dragen achter het fasenummer nog een telling mee
        # ("Eikenstein Fase 3 36 Woningen", "Eikenstein Fase 2 29 Appartementen
        # Bosvilla"). Die staarten verschillen per fase, dus zonder ze eerst weg
        # te halen groepeert de fase-regex hieronder niets en krijgt hetzelfde
        # project twee bijna-identieke pagina's in dezelfde plaats — precies het
        # onderlinge verdringen dat deze samenvoeging moet voorkomen.
        b = re.sub(r"\s+\d+\s+(woning|appartement|huis|huizen|kavel)\w*\b.*$", "", n, flags=re.I)
        b = re.sub(r"\s*[-–]?\s*fase\s*\d+\w*\s*$", "", b, flags=re.I).strip()
        return b if len(b) > 3 else n

    # Een pagina die "Je tekende voor Fase 7b" als kop draagt, hoort niet te
    # bestaan. Dat gebeurt wanneer de projectnaam in de bron alleen een
    # faseaanduiding is: de fase-samenvoeging hieronder haalt er dan niets
    # zinnigs uit en er blijft een nummer over. Niemand zoekt daarop, en het is
    # het soort pagina waar een bezoeker aan twijfelt of hij goed zit.
    ZWAKKE_NAAM = re.compile(r"^(fase|deelplan|blok|veld|kavel|type|woningtype|"
                             r"bouwnummer|nr|deel)\b[\s\-]*\d", re.I)
    voor = len(kandidaten)
    kandidaten = [q for q in kandidaten if not ZWAKKE_NAAM.match(fasebasis(q["naam"]))]
    if voor != len(kandidaten):
        print(f"overgeslagen: {voor - len(kandidaten)} project(en) zonder eigen naam "
              f"(alleen een faseaanduiding)")

    groepen = collections.defaultdict(list)
    for q in kandidaten:
        groepen[(fasebasis(q["naam"]).lower(), q["plaats"])].append(q)
    samengevoegd, oude_slugs = [], {}
    for (bnaam, pl), leden in groepen.items():
        if len(leden) == 1:
            samengevoegd.append(leden[0]); continue
        leden.sort(key=lambda q: q["naam"])
        hoofd = max(leden, key=lambda q: q.get("woningen") or 0)
        f = dict(hoofd)
        f["naam"] = fasebasis(hoofd["naam"])
        f["woningen"] = sum(q.get("woningen") or 0 for q in leden) or None
        f["_fases"] = [(q["naam"], q["url"]) for q in leden]
        nieuw_slug = slugify(f["naam"], pl)
        for q in leden:
            oud = slugify(q["naam"], q["plaats"])
            if oud != nieuw_slug:
                oude_slugs[oud] = nieuw_slug
        samengevoegd.append(f)
    kandidaten = samengevoegd

    print(f"{len(projecten)} projecten · poort >= {MIN_WONINGEN} woningen"
          f"{' · alleen Rotterdamse straal' if ALLEEN_REGIO else ''}"
          f"{' · alleen pilotring (golf B)' if ALLEEN_PILOT else ''} → {len(kandidaten)} kandidaten")
    # Opgeleverde projecten hardop tellen. Zonder deze regel valt het pas op als
    # iemand toevallig zo'n pagina leest — en dan staat er al maanden dat de
    # keuze "op de meerwerklijst valt" bij een project dat al bewoond wordt.
    klaar = [q for q in kandidaten if opgeleverd(q)[0]]
    if klaar:
        print(f"opgeleverd (andere tekst, geen tijdlijn): {len(klaar)} — "
              + ", ".join(f"{netjes_naam(q)} ({opgeleverd(q)[1]})" for q in klaar[:6]))
    gem_tel = collections.Counter(q["plaats"] for q in kandidaten)
    print(f"ontologie: {len(ruimtes)} ruimtes, "
          f"{sum(len(r['beslissingen']) for r in ruimtes)} beslissingen\n")

    nieuw = herzien = 0
    hub_rijen = []
    for p in kandidaten:
        buren = [q for q in kandidaten if q["plaats"] == p["plaats"] and q["url"] != p["url"]]
        buren.sort(key=lambda q: -(q.get("woningen") or 0))
        slug, body, rij = bouw_pagina(p, ruimtes, vb, wk, buren, gem_tel[p["plaats"]], indexeerbaar=True)
        if slug in handgeschreven:
            continue                      # nooit over handwerk heen schrijven
        hub_rijen.append({"path": rij["path"], "_naam": netjes_naam(p),
                          "_plaats": netjes(p["plaats"]), "_won": p.get("woningen") or 0,
                          "_opl": oplever_schatting(p)[0]})
        # Tellen gebeurt altijd, ook bij een droogdraai. Toen de tellers binnen
        # `if not DRY` stonden meldde --dry stelselmatig "0 nieuwe pagina's",
        # ongeacht wat een echte run zou doen. Een droogdraai die niets zegt is
        # erger dan geen droogdraai: hij wekt vertrouwen dat er niets gebeurt.
        bestond = any(x["slug"] == slug for x in pages)
        nieuw += 0 if bestond else 1
        if not DRY:
            os.makedirs(os.path.join(CLUSTER, "content"), exist_ok=True)
            open(os.path.join(CLUSTER, "content", f"{slug}.html"), "w", encoding="utf8").write(body)
            pages = [x for x in pages if x["slug"] != slug] + [rij]
        herzien += 1 if bestond else 0

    if not DRY and oude_slugs:
        pages = [x for x in pages if x["slug"] not in oude_slugs]
        for oud in oude_slugs:
            f = os.path.join(CLUSTER, "content", f"{oud}.html")
            if os.path.exists(f):
                os.remove(f)
        vj = os.path.join(ROOT, "vercel.json")
        vd = json.load(open(vj, encoding="utf8"))
        bestaand = {r["source"] for r in vd.get("redirects", [])}
        toegevoegd = 0
        for oud, doel in oude_slugs.items():
            src = f"/nieuwbouw-project/{oud}/"
            if src not in bestaand:
                vd.setdefault("redirects", []).append(
                    {"source": src, "destination": f"/nieuwbouw-project/{doel}/",
                     "permanent": True})
                toegevoegd += 1
        if toegevoegd:
            json.dump(vd, open(vj, "w", encoding="utf8"), ensure_ascii=False, indent=2)
            open(vj, "a").write("\n")
        print(f"fases samengevoegd: {len(oude_slugs)} oude adressen → 301 ({toegevoegd} nieuw in vercel.json)")

    if not DRY and hub_rijen:
        # De handgeschreven pagina's (De Suikerzijde, CondorPark, ...) stonden niet
        # in de hub terwijl het de beste van het cluster zijn; ze hingen alleen aan
        # de sitemap. Hier alsnog erbij, met hun eigen plaats.
        # ...en bij een deelronde (--regio, --pilot) ook de pagina's die deze ronde
        # niet aanraakte. Zonder dit schrijft een pilotronde een hub met alleen de
        # tien nieuwe projecten erin en verdwijnen de 34 bestaande uit de enige
        # plek die naar ze linkt. Een volle ronde merkt hier niets van: die heeft
        # elke gegenereerde pagina al in hub_rijen staan.
        al_in_hub = {r["path"] for r in hub_rijen}
        for x in pages:
            if (x["slug"] not in ("index", "oplevermonitor")
                    and x["path"] not in al_in_hub
                    and "noindex" not in (x.get("robots") or "")):
                pl = x.get("title", "").split("(")[-1].split(")")[0] if "(" in x.get("title", "") else ""
                hub_rijen.append({"path": x["path"],
                                  "_naam": x["title"].split(",")[0].split("(")[0].strip(),
                                  "_plaats": pl or "Elders in Nederland",
                                  "_won": 0, "_opl": ""})
        open(os.path.join(CLUSTER, "content", "index.html"), "w", encoding="utf8").write(
            bouw_hub(hub_rijen, kandidaten, len(projecten)))
        for x in pages:
            if x["slug"] == "index":
                x["robots"] = "index,follow"
                x["og_image"] = OG_BEELD
                x["twitter_card"] = "summary_large_image"
                x["title"] = kort_titel("Nieuwbouwprojecten: advies per project")
                x["description"] = kort_desc(
                    f"Wij volgen {len(projecten)} nieuwbouwprojecten in Nederland. Voor "
                    f"{len(hub_rijen)} staat uitgewerkt welke keuzes een koper na het tekenen "
                    f"maakt, wanneer ze sluiten en wat ze kosten.")

    if not DRY:
        # De handgeschreven pagina's worden nooit door de generator herschreven,
        # maar zijn wél de best presterende van het cluster (91 van de 103
        # vertoningen in drie maanden). Juist zij hadden geen deelkaart. Alleen
        # de velden zetten die ontbreken; aan hun tekst raken we niet.
        for x in pages:
            x.setdefault("og_image", OG_BEELD)
            x.setdefault("twitter_card", "summary_large_image")
            if len(x.get("title", "")) > TITEL_MAX:
                x["title"] = kort_titel(x["title"].replace(" | Bylder.com", "")
                                                  .replace(" | Bylder", ""))
            if len(x.get("description", "")) > DESC_MAX:
                x["description"] = kort_desc(x["description"])

        vast = [x for x in pages if x["slug"] in ("index", "oplevermonitor")]
        rest = sorted([x for x in pages if x["slug"] not in ("index", "oplevermonitor")],
                      key=lambda x: x["slug"])
        json.dump(vast + rest, open(pj, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        open(pj, "a").write("\n")

    if not DRY:
        sm = os.path.join(ROOT, "nieuwbouw-project-sitemap.xml")
        idx = [x for x in pages if "noindex" not in (x.get("robots") or "")]
        rows = "".join(
            f"  <url><loc>https://www.bylder.com{x['path']}</loc>"
            f"<lastmod>{VANDAAG.isoformat()}</lastmod></url>\n" for x in idx)
        open(sm, "w", encoding="utf8").write(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + rows + "</urlset>\n")
        print(f"sitemap: {len(idx)} URL's weggeschreven (stond op 4)")

    if not DRY:
        verrijk_handwerk(projecten)

    print(f"{'DROOGDRAAI — ' if DRY else ''}{nieuw} nieuwe pagina's, {herzien} herzien, "
          f"{len(handgeschreven)} handgeschreven ongemoeid gelaten.")
    meet_uniciteit()
    per = collections.Counter(netjes(p["plaats"]) for p in kandidaten)
    print("\ntop-plaatsen:", ", ".join(f"{g} ({n})" for g, n in per.most_common(8)))


if __name__ == "__main__":
    main()
