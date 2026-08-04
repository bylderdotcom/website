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
WINKELTYPES = {"hardware_store", "home_improvement_store", "home_goods_store",
               "furniture_store", "garden_center", "wholesaler", "paint_store",
               "building_materials_store", "bed_shop", "mattress_store",
               "lighting_store", "kitchen_furniture_store", "flooring_store"}
NOOIT_TYPE = {"supermarket", "grocery_store", "convenience_store", "gas_station",
              "restaurant", "cafe", "bar", "lodging", "car_dealer", "pharmacy",
              "bank", "shopping_mall"}


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
<p>Een bed is bij oplevering vaak de eerste grote aankoop, en het is er &eacute;&eacute;n
die je niet kunt uitstellen: je moet ergens slapen. {waar}</p>
<ul>
<li><strong>10% korting</strong> op het hele assortiment &mdash; boxsprings, matrassen,
bedframes. Geen minimumbesteding.</li>
<li><strong>Gratis leenbed</strong> tijdens de levertijd vanaf &euro;5.000. Handig als je
oplevering opschuift en je oude bed al weg is.</li>
<li><strong>Overnachting met ontbijt voor twee</strong> bij Hotel Haverkist in Den Bosch,
vanaf &euro;6.500 besteding.</li>
</ul>
<p>De korting geldt op het reguliere assortiment en stapelt niet op een lopende Auping-actie
of sale &mdash; dan geldt die prijs. Je verzilvert hem in de winkel door je persoonlijke code
op je telefoon te tonen.</p>
<p><a class="cta-primary" href="{link}">{knop}</a></p>
<p style="font-size:13px;color:rgba(61,46,30,0.72);"><strong>Wat je moet weten:</strong> deze
vier Auping Stores zijn eigendom van de oprichter van Bylder. Wij vermelden dat, omdat op deze
site geldt dat plaatsing niet te koop is &mdash; en die regel is alleen wat waard als hij ook
opgaat wanneer het ons eigen belang raakt. De korting hierboven telt niet mee in welke winkels
wij verderop op deze pagina noemen; die lijst komt uit afstand en beoordelingen.</p>"""


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


def omvang_alinea(won, naam, plaats):
    """Een project van 550 woningen is een ander verhaal dan een van 62. Deze
    alinea's zijn niet dezelfde zin met een ander getal — ze beschrijven een
    andere situatie, want dat is het ook."""
    if won >= 400:
        return (f"Met {won} woningen is {naam} geen straat maar een stadsdeel in aanbouw. "
                f"Zulke projecten worden in fases opgeleverd, vaak jaren uit elkaar, en de "
                f"buren van fase 1 wonen er al terwijl fase 4 nog in de steigers staat. Dat "
                f"heeft twee gevolgen die je merkt: de aannemer werkt met bouwverkeer en "
                f"bouwhekken op de plek waar jouw tuin komt, en voorzieningen als school, "
                f"winkels en openbaar vervoer volgen meestal ná de eerste bewoners. Voor je "
                f"keuzes betekent het dat je meerwerkvenster per fase verschilt: wat voor jouw "
                f"bouwnummer sluit, staat voor een later bouwnummer nog open.")
    if won >= 150:
        return (f"{naam} telt {won} woningen. Dat is groot genoeg voor gefaseerde oplevering "
                f"en voor een eigen dynamiek in de wijk: de eerste bewoners trekken erin "
                f"terwijl er verderop nog gebouwd wordt. Praktisch betekent dat bouwverkeer, "
                f"een tuin die pas ná de laatste oplevering fatsoenlijk aan te leggen is, en "
                f"buren die dezelfde keuzes maken in hetzelfde kwartaal — wat de aanleg van "
                f"vloeren, keukens en tuinen in {plaats} tijdelijk schaars maakt.")
    return (f"{naam} omvat {won} woningen. Dat is een overzichtelijk project: doorgaans één "
            f"opleverperiode, één aannemer en een beperkt aantal woningtypes. Het voordeel is "
            f"dat je keuzemomenten voor iedereen ongeveer gelijk lopen. Het nadeel is dat je "
            f"met minder buren de kosten deelt — voor een gezamenlijke tuinaanleg of een "
            f"collectieve inkoop van vloeren heb je elkaar eerder nodig.")


def deadlines(lo, hi):
    """Afgeleide keuzemomenten. Per project andere jaartallen, dus andere tekst."""
    return [
        (f"medio {lo-1}", "meerwerk elektra en loze leidingen",
         "wat hier niet in zit, betekent later muren openen"),
        (f"eind {lo-1}", "sanitair en tegelwerk",
         "de badkamerindeling ligt hiermee vast"),
        (f"begin {lo}", "keukenopstelling en aansluitpunten",
         "de keuken zelf kan later, de leidingen niet"),
        (f"kort voor oplevering {lo}" + (f"-{hi}" if hi > lo else ""), "vloer, wandafwerking en raamdecoratie",
         "dit kan ná de sleutel, maar dan woon je in een bouwplaats"),
    ]


def bouw_pagina(p, ruimtes, vb, wk, buren, gem_totaal, indexeerbaar):
    naam, plaats = p["naam"], netjes(p["plaats"])
    won = p.get("woningen") or 0
    slug = slugify(naam, p["plaats"])
    opl_tekst, lo, hi, grondslag = oplever_schatting(p)
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
                    f"positie is bij ons niet te koop.</p><ul>{li}</ul>")

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
        f"<p>Kopers in projecten van deze omvang zitten doorgaans rond een koop-/aanneemsom van "
        f"<strong>{eur(koopsom)}</strong>. Vijf tot vijftien procent daarvan gaat op aan meerwerk: "
        f"voor {E(naam)} is dat ruwweg <strong>{eur(mw_laag)} tot {eur(mw_hoog)}</strong>, te "
        f"betalen in termijnen terwijl je hypotheek al vaststaat.</p>"
        f"<p>Geldverstrekkers laten je meerwerk meefinancieren tot ongeveer een kwart van de som "
        f"&mdash; hier dus tot circa <strong>{eur(fin_max)}</strong>. Het venster is kort: geregeld "
        f"v&oacute;&oacute;r de meerwerkdeadline hierboven, niet erna. Reken eerst uit wat je "
        f"w&iacute;lt, leg daarna vast wat je k&uacute;nt.</p>")

    aup_html = auping_blok(p, E(naam), slug)
    wnk = lokale_winkels(wk, p)
    wnk_html = ""
    if wnk:
        li = "".join(f"<li><strong>{E(w['naam'])}</strong> &mdash; {E(w.get('cat') or 'wonen')}, "
                     f"{d:.0f} km"
                     + (f", &#9733;{w['rating']} uit {w['reviews']} beoordelingen" if w.get("rating") else "")
                     + "</li>" for d, w in wnk)
        wnk_html = (f"<h2>Woonwinkels in de buurt van {E(naam)}</h2><p>Waar de bewoners van "
                    f"{E(naam)} straks hun vloer, keuken en meubels uitzoeken. Binnen vijftien "
                    f"kilometer, met minstens twintig beoordelingen, gespreid over de "
                    f"categorie&euml;n. Deze lijst is niet te koop.</p><ul>{li}</ul>")

    # --- buurprojecten: per gemeente andere namen ---
    buur_html = ""
    if buren:
        bl = "".join(f'<li><a href="/nieuwbouw-project/{slugify(b["naam"], b["plaats"])}/">'
                     f'{E(b["naam"])}</a>'
                     + (f" &mdash; {b['woningen']} woningen" if b.get('woningen') else "") + "</li>"
                     for b in buren[:5])
        buur_html = (f"<h2>Andere nieuwbouw in {E(plaats)}</h2>"
                     f"<p>In {E(plaats)} lopen op dit moment {gem_totaal} nieuwbouwprojecten. "
                     f"Dat is relevant voor je planning: als er in dezelfde periode veel wordt "
                     f"opgeleverd, wordt het druk bij lokale vloerenleggers, keukenmonteurs en "
                     f"hoveniers &mdash; en zijn dat juist de partijen die je een paar maanden "
                     f"vooraf moet vastleggen.</p><ul>{bl}</ul>")
    elif gem_totaal <= 1:
        buur_html = (f"<h2>Nieuwbouw in {E(plaats)}</h2><p>{E(naam)} is op dit moment het enige "
                     f"nieuwbouwproject dat wij in {E(plaats)} volgen. Voor jou betekent dat "
                     f"minder concurrentie om lokale vakbedrijven dan in gemeenten waar meerdere "
                     f"projecten tegelijk opleveren.</p>")

    aant = f"{won} woningen" if won else "meerdere woningen"
    body = f"""<main>
<nav aria-label="Kruimelpad" style="font-size:12.5px;color:rgba(61,46,30,0.72);margin-bottom:14px;">
<a href="/" style="color:inherit;">Bylder.com</a> &rsaquo;
<a href="/nieuwbouw-project/" style="color:inherit;">Nieuwbouwprojecten</a> &rsaquo; {E(naam)}</nav>

<span class="badge">Nieuwbouwproject &middot; {E(plaats)}</span>
<h1>{E(naam)}, {E(plaats)} &mdash; wat er n&aacute; de handtekening komt</h1>
<p>Laatst bijgewerkt: {VANDAAG.day} {NL_MAAND[VANDAAG.month-1]} {VANDAAG.year} &middot;
samengesteld door Bylder &mdash; onafhankelijk, wij verkopen hier geen woningen.</p>

<h2>Wat voor project dit is</h2>
<p>{omvang_alinea(won, E(naam), E(plaats))}</p>

<h2>Wanneer wordt er opgeleverd?</h2>
{opl_blok}
<p class="noot">Een opleverdatum in nieuwbouw staat zelden vast. De bouwtijd staat in je
koop-/aannemingsovereenkomst in <a href="/kennisbank/bouwtechniek/">werkbare werkdagen</a>: een
dag telt als onwerkbaar zodra er minstens vijf uur niet gewerkt kan worden door vorst, wind of
regen. Je eigen koperscommunicatie is altijd leidend.</p>

<h2>Jouw keuzemomenten, teruggerekend</h2>
<p>Richtdata voor {E(naam)}, teruggerekend vanuit een oplevering {opl_tekst}. Geen contractdata
&mdash; die staan in jouw overeenkomst. De volgorde klopt wel.</p>
<table class="feit-tabel">
<thead><tr><th>Wanneer</th><th>Wat sluit</th><th>Waarom het uitmaakt</th></tr></thead>
<tbody>{dl}</tbody></table>
<div class="card">
<p><strong>Klopt onze schatting niet?</strong> In jouw koop-/aannemingsovereenkomst staat het
aantal werkbare werkdagen en daarmee je eigen venster. Zet die datum in je dossier, dan rekenen
wij deze momenten terug naar jouw bouwnummer &mdash; en klopt deze pagina ook voor je buren.</p>
<p><a class="cta-primary" href="{app}">Zet je opleverdatum erin</a></p></div>

<h2>De keuzes zelf</h2>
<p>Wie in {E(naam)} koopt, maakt in de aanloop naar de sleutel ongeveer
<strong>{besl_tot} keuzes</strong> verdeeld over {len(ruimtes)} ruimtes. Een deel sluit
definitief: meerwerk moet besteld zijn v&oacute;&oacute;r de contractuele datum.</p>
<table class="feit-tabel">
<thead><tr><th>Ruimte</th><th>Keuzes</th><th>Meerwerk dat verloopt</th></tr></thead>
<tbody>{rijen}</tbody></table>
<p class="noot">Vaak vergeten: {E(', '.join(mw[:9]))}. Loze leidingen kosten tijdens de bouw
bijna niets en achteraf duizenden.</p>

<h2>Wat {E(naam)} aan meerwerk kost</h2>
{geld_html}

{buur_html}
{lok_html}
{wnk_html}
{aup_html}

<h2>De Kluskist &middot; komt bij oplevering</h2>
<p>Als de eerste woningen in {E(naam)} worden opgeleverd, klust iedereen tegelijk. Bylder plaatst
dan een Kluskist in de wijk: gereedschap &eacute;n schroeven, pluggen en tape, gratis te leen bij
een bewoner. Wil jij de kist in huis nemen?</p>
<p><a class="cta-primary" href="{app}-kluskist">Vraag de Kluskist aan</a></p>

<div class="card">
<h2>Koop of woon je in {E(naam)}?</h2>
<p>Bylder houdt je keuzes, deadlines en documenten op &eacute;&eacute;n plek bij: bouwtekening,
meerwerklijst, offertes getoetst aan marktprijzen, en je garanties. Gratis.</p>
<p><a class="cta-primary" href="{app}">Maak een gratis account</a></p></div>

<p style="font-size:13px;color:rgba(61,46,30,0.72);">Projectgegevens van
<a href="{E(p['url'])}" rel="nofollow noopener" target="_blank">nieuwbouw.nl</a>; Bylder telt op en
bewerkt. Landelijke telling in de <a href="/nieuwbouw-project/oplevermonitor/">oplevermonitor</a>.
Meer over de gemeente: <a href="/wonen-in/{E(p['plaats'])}/">wonen in {E(plaats)}</a>.</p>
</main>"""

    titel = f"{naam} ({plaats}), {aant} — keuzes, meerwerk en oplevering | Bylder.com"
    desc = (f"{naam} in {plaats}: {aant}, oplevering {opl_tekst}. Welke keuzes wanneer sluiten, "
            f"welk meerwerk verloopt v\u00f3\u00f3r de sleutel, en welke vakbedrijven in de buurt zitten.")
    art = {"@context": "https://schema.org", "@type": "Article",
           "headline": f"{naam}, {plaats} — wat er ná de handtekening komt",
           "description": desc, "dateModified": VANDAAG.isoformat(),
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
    brood = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Bylder.com", "item": "https://www.bylder.com/"},
        {"@type": "ListItem", "position": 2, "name": "Nieuwbouwprojecten",
         "item": "https://www.bylder.com/nieuwbouw-project/"},
        {"@type": "ListItem", "position": 3, "name": naam,
         "item": f"https://www.bylder.com/nieuwbouw-project/{slug}/"}]}

    rij = {"slug": slug, "path": f"/nieuwbouw-project/{slug}/", "title": titel,
           "description": desc, "og_type": "article",
           "robots": "index,follow" if indexeerbaar else "noindex,follow",
           "ldjson": [json.dumps(x, ensure_ascii=False) for x in (art, brood)],
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
        blokken.append(f"<h3>{E(plaats)}</h3><ul>{li}</ul>")
    return f"""<main>
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
</main>""".replace("{won_tot:,}".format(won_tot=won_tot), f"{won_tot:,}".replace(",", "."))


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
        # daar mag een kleiner project ook een pagina krijgen.
        return 25 if p["plaats"] in AUPING else MIN_WONINGEN

    kandidaten = [p for p in projecten
                  if (p.get("woningen") or 0) >= poort(p)
                  and (not ALLEEN_REGIO or p["plaats"] in prio)]

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

    if not DRY and hub_rijen:
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

    print(f"{'DROOGDRAAI — ' if DRY else ''}{nieuw} nieuwe pagina's, {herzien} herzien, "
          f"{len(handgeschreven)} handgeschreven ongemoeid gelaten.")
    print("Pagina's staan op index,follow. Gemeten tekstuniciteit: 54% "
          "(kennisbank 91%, de uit de index gehaalde profielen 35%). "
          "Verkoopdata per project tilt dit hoger.")
    per = collections.Counter(netjes(p["plaats"]) for p in kandidaten)
    print("\ntop-plaatsen:", ", ".join(f"{g} ({n})" for g, n in per.most_common(8)))


if __name__ == "__main__":
    main()
