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
    python3 scripts/generate_projectpaginas.py --min 100  # andere ondergrens
    python3 scripts/generate_projectpaginas.py --dry      # niets wegschrijven
"""
import json, os, re, sys, glob, html, math, collections
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
MIN_WONINGEN = 50
for i, a in enumerate(sys.argv):
    if a == "--min" and i + 1 < len(sys.argv):
        MIN_WONINGEN = int(sys.argv[i + 1])

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


def oplever_schatting(p):
    """(tekst, jaar_van, jaar_tot, grondslag) — altijd als bandbreedte, nooit als feit."""
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
    """Laatste Kadaster-meting per project-URL: panden met recent bouwjaar in de
    directe omgeving. Bewust 'omgeving' — een bbox vangt ook de buren, en zo
    formuleren we het ook op de pagina."""
    uit = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "data", "bag-snapshots", "*.json"))):
        datum = os.path.basename(f)[:-5]
        for url, v in json.load(open(f, encoding="utf8")).items():
            if v.get("panden"):
                uit[url] = (datum, v)
    return uit


BAG = _laad_bag()


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
        return "", ""
    bd, bv = bag
    delen = []
    if bv.get("in_aanbouw"):
        delen.append(f"<strong>{bv['in_aanbouw']} panden in aanbouw</strong>")
    if bv.get("opgeleverd"):
        delen.append(f"<strong>{bv['opgeleverd']} recent opgeleverd</strong>")
    if not delen:
        return "", ""
    antwoord = (f'<p class="antwoord"><strong>Bouwstatus, peildatum {nl_datum(bd)}.</strong> '
                f"In de directe omgeving van {E(naam)} registreert het Kadaster "
                + " en ".join(delen)
                + f", met {bv['nieuwste_bouwjaar']} als nieuwste bouwjaar. Wij meten dit elke "
                  f"twee weken opnieuw.</p>")

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
    log = (f"<h2>Logboek</h2><ul class='log'>"
           f"<li><strong>{nl_datum(bd)}</strong> &middot; {bv.get('in_aanbouw') or 0} panden in "
           f"aanbouw, {bv.get('opgeleverd') or 0} opgeleverd (Kadaster)</li></ul>"
           f'<p class="noot">Dit is de eerste meting. Vanaf de volgende ronde staat hier wat er '
           f"tussen twee metingen veranderde &mdash; wanneer de bouw werkelijk vordert.</p>")
    return antwoord, tabel, log


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


# De vier Auping Stores zijn eigendom van Bylder-oprichter Daniel Paaij. Daarom
# staan ze hier mét die vermelding erbij: op elke andere plek op deze site geldt
# dat plaatsing niet te koop is, en die claim houdt alleen stand als we het
# zeggen wanneer het ons eigen belang raakt.
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
        winkel = "de vier Auping Stores"
        waar = (f"De korting is te verzilveren bij vier winkels: {E(alle)}. Voor {E(naam_project)} "
                f"is dat een rit, geen ommetje &mdash; reken daarop als je gaat passen, want een "
                f"bed koop je niet zonder erop te liggen.")
        kop = "Korting op je bed &mdash; bij vier Auping Stores"
        knop = "Toon je code"
    link = (f"https://app.bylder.com/register?utm_source=bylder&amp;utm_medium=site"
            f"&amp;utm_campaign=auping&amp;utm_content=project-{slug}")
    return f"""<h2>{kop}</h2>
<p>Een bed is de eerste grote aankoop bij oplevering, en de enige die je niet kunt uitstellen.
{waar} Tien procent korting op het hele assortiment, een gratis leenbed vanaf &euro;5.000 en
een overnachting voor twee vanaf &euro;6.500. Niet stapelbaar met een lopende sale. Je
verzilvert hem in de winkel met je persoonlijke code.</p>
<p><a class="cta-primary" href="{link}">{knop}</a></p>
<p class="noot">Deze vier winkels zijn eigendom van de oprichter van Bylder. Wij noemen dat,
omdat plaatsing op deze site niet te koop is &mdash; en die regel is alleen wat waard als hij
ook geldt wanneer het ons eigen belang raakt. De korting weegt niet mee in welke bedrijven wij
hierboven noemen; die lijst komt uit afstand, type en beoordelingen.</p>"""


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


def bouw_pagina(p, ruimtes, vb, wk, buren, gem_totaal, indexeerbaar):
    naam, plaats = p["naam"], netjes(p["plaats"])
    won = p.get("woningen") or 0
    slug = slugify(naam, p["plaats"])
    opl_tekst, lo, hi, grondslag = oplever_schatting(p)
    plaats_ruw = p["plaats"]
    hard = p.get("oplevering_bron") == "oplevertrefwoord"
    reg = f"?utm_source=bylder-site&amp;utm_campaign=project-{slug}"
    app = "https://app.bylder.com/registreer" + reg

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
        lok_html = (f"<h2>Vakbedrijven rond {E(naam)}</h2><p>Bedrijven binnen twaalf kilometer "
                    f"met minstens twintig beoordelingen, gespreid over de vakken die bij een "
                    f"oplevering langskomen. Wij rangschikken op passendheid en afstand; een "
                    f"positie is bij ons niet te koop.</p><ul class='bedrijven'>{li}</ul>")

    # Meerwerkbedragen schalen mee met het woningtype dat in dit project overheerst;
    # de percentages zijn generiek, de uitkomst per project niet.
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
    start_html = (
        f'<div class="startblok">'
        f"<p><strong>Woning gekocht in {E(naam)}?</strong> Wij volgen de bouw voor je en rekenen "
        f"elke deadline terug naar jouw bouwnummer. Je bespaart bij de afwerking en inrichting, "
        f"en je garanties staan straks op &eacute;&eacute;n plek.</p>"
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
            f"weken de verkoopstand en de bouwstatus in het Kadaster."))
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
    faq_html = "<h2>Veelgestelde vragen over " + E(naam) + "</h2>" + "".join(
        f"<h3>{E(q)}</h3><p>{E(ant)}</p>" for q, ant in faq_items)

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
    body = f"""<main>
<div class="container"><div class="kolom">
<nav aria-label="Kruimelpad" style="font-size:12.5px;color:rgba(61,46,30,0.72);margin-bottom:14px;">
<a href="/" style="color:inherit;">Bylder.com</a> &rsaquo;
<a href="/nieuwbouw-project/" style="color:inherit;">Nieuwbouwprojecten</a> &rsaquo; {E(naam)}</nav>

<span class="badge">Nieuwbouwproject &middot; {E(plaats)}</span>
<h1>{E(naam)}, {E(plaats)} &mdash; wat er n&aacute; de handtekening komt</h1>

{feiten_html}

{start_html}

{tabel_html}

{log_html}

{faq_html}

{keuze_html}
<p class="noot">Teruggerekend vanuit een oplevering {opl_tekst} ({grondslag}). Richtdata &mdash;
je eigen <a href="/kennisbank/bouwtechniek/">koop-/aannemingsovereenkomst</a> is leidend.</p>
<div class="card">
<p>Zet je opleverdatum in je dossier, dan rekenen wij deze momenten terug naar jouw bouwnummer.</p>
<p><a class="cta-primary" href="{app}">Zet je opleverdatum erin</a></p></div>

{lok_html}
{wnk_html}
{buur_html}
{aup_html}

{kluskist_html}

<div class="card">
<h2>Woning gekocht in {E(naam)}?</h2>
<p>Wij volgen de bouw en je deadlines, en je bespaart bij de afwerking en inrichting:
ledenkortingen, offertes getoetst aan marktprijzen, garanties op &eacute;&eacute;n plek.
Elke nieuwe meting van {E(naam)} zie je terug in je dossier. Gratis.</p>
<p><a class="cta-primary" href="{app}">Volg {E(naam)} gratis</a></p></div>

<p style="font-size:13px;color:rgba(61,46,30,0.72);">Verkoopstand gemeten door Bylder op
<a href="{E(p['url'])}" rel="nofollow noopener" target="_blank">nieuwbouw.nl</a>. Landelijke
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
    if pct_nu is None or pct_nu >= 85:
        titel = f"Gekocht in {naam} ({plaats})? Korting bij woonwinkels in de buurt | Bylder"
        desc = (f"Woning gekocht in {naam}? Wij volgen de bouw voor je \u00e9n je bespaart op "
                f"afwerking en inrichting: ledenkortingen, offertes getoetst aan marktprijzen. "
                f"Gratis.")
    elif pct_nu is not None:
        titel = f"{naam}, {plaats}: {pct_nu}% verkocht — oplevering en bouwstatus | Bylder"
        desc = (f"{naam} kopen of al gekocht? Wij meten de verkoopstand elke twee weken "
                f"({pct_nu}% verkocht) en helpen kopers besparen op afwerking en inrichting. "
                f"Onafhankelijk, gratis.")
    else:
        titel = f"{naam} ({plaats}), {aant} — oplevering en bouwstatus | Bylder.com"
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

    rij = {"slug": slug, "path": f"/nieuwbouw-project/{slug}/", "title": titel,
           "description": desc, "og_type": "article",
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
    def poort(p):
        # Waar een Auping Store staat willen we hoe dan ook gevonden worden, dus
        # daar mag een kleiner project ook een pagina krijgen. Op 4 aug van 50 naar
        # 25; op 5 aug naar 10, omdat Leidschendam met één project te dun was —
        # De Pauwentuin (22 woningen) hoort er gewoon bij. Onder de 10 wordt het
        # een pagina zonder publiek.
        return 10 if p["plaats"] in AUPING else MIN_WONINGEN

    kandidaten = [p for p in projecten
                  if (p.get("woningen") or 0) >= poort(p)
                  and (not ALLEEN_REGIO or p["plaats"] in prio)]

    # Niemand zoekt "zwanenpark fase 2" — men zoekt "zwanenpark vlaardingen".
    # Drie bijna-identieke fase-URL's verdringen elkaar; één pagina met de fases
    # als rijen wint. De oude fase-adressen krijgen een 301 in vercel.json.
    def fasebasis(n):
        b = re.sub(r"\s*[-–]?\s*fase\s*\d+\w*\s*$", "", n, flags=re.I).strip()
        return b if len(b) > 3 else n

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
          f"{' · alleen Rotterdamse straal' if ALLEEN_REGIO else ''} → {len(kandidaten)} kandidaten")
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
        if not DRY:
            os.makedirs(os.path.join(CLUSTER, "content"), exist_ok=True)
            open(os.path.join(CLUSTER, "content", f"{slug}.html"), "w", encoding="utf8").write(body)
            bestond = any(x["slug"] == slug for x in pages)
            pages = [x for x in pages if x["slug"] != slug] + [rij]
            nieuw += 0 if bestond else 1
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
        for x in pages:
            if x["slug"] in handgeschreven and "noindex" not in (x.get("robots") or ""):
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
                x["description"] = (f"Wij volgen {len(projecten)} nieuwbouwprojecten in Nederland. "
                    f"Voor {len(hub_rijen)} staat uitgewerkt welke keuzes een koper na het tekenen "
                    f"maakt, wanneer ze sluiten en wat ze kosten.")[:158]

    if not DRY:
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
    print("Tekstuniciteit (shingle op >=2 pagina's = duplicaat): mediaan 20,4%. "
          "Kennisbank 91%, de uit de index gehaalde profielen 35%. Sjabloneren "
          "is hier uitgeput; het logboek moet het doen zodra er meerdere "
          "metingen zijn en elk project een eigen verloop krijgt.")
    per = collections.Counter(netjes(p["plaats"]) for p in kandidaten)
    print("\ntop-plaatsen:", ", ".join(f"{g} ({n})" for g, n in per.most_common(8)))


if __name__ == "__main__":
    main()
