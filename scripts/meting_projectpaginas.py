#!/usr/bin/env python3
"""Meting per nieuwbouwproject-pagina: wordt hij gevonden, en wat levert hij op?

WAAROM DEZE METING BESTAAT
--------------------------
De export van 29 augustus liet zien dat de vier handgeschreven projectpagina's
samen 91 vertoningen haalden en de 34 gegenereerde samen 12. Dertig keer verschil
per pagina. Dat is precies het onderscheid dat beslist of we het sjabloon over de
resterende 945 projecten mogen uitrollen of niet — en het is een getal dat je
maandelijks opnieuw moet meten, want de gegenereerde pagina's waren toen pas drie
weken oud en leeftijd verklaart een deel van het gat.

Deze meting legt per ronde vast wat elke pagina deed, zodat het verschil tussen
"nog te jong" en "wordt nooit gevonden" zichtbaar wordt in plaats van dat we er
elke maand opnieuw over speculeren.

WAT EEN LEGE REGEL BETEKENT — EN WAT NIET
-----------------------------------------
Search Console noemt alleen pagina's die minstens één vertoning hadden. Een
pagina die hier op nul staat is dus NIET aantoonbaar ongeïndexeerd; hij is
aantoonbaar ongezien. Dat verschil is groot: ongeïndexeerd is een technisch
probleem, ongezien een vraag- of kwaliteitsprobleem, en de oplossingen zijn
tegengesteld. Voor de echte indexstatus is de export van het rapport
Pagina-indexering nodig; staat die in dezelfde map, dan leest dit script hem mee.

GEBRUIK
-------
    python3 scripts/meting_projectpaginas.py <map-of-zip-van-de-GSC-export>
    python3 scripts/meting_projectpaginas.py --api [dagen]

De export haal je in Search Console via Prestaties → filter Pagina bevat
'/nieuwbouw-project/' → Exporteren → CSV downloaden. De --api-variant werkt
alleen buiten de sandbox (die blokkeert uitgaand verkeer op certificaatniveau);
hij gebruikt dezelfde servicesleutel als gsc_traction.py.
"""
import csv, json, os, re, sys, glob, zipfile, tempfile, collections
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLUSTER = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project")
PROJECTEN = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
RAPPORT = os.path.join(ROOT, "reports", "projectpaginas-meting.json")
VANDAAG = date.today().isoformat()


# --------------------------------------------------------------------------
# inlezen van de GSC-export
# --------------------------------------------------------------------------
def _csv_rijen(pad):
    with open(pad, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def _vind_csv(map_, *trefwoorden):
    """Zoekt het CSV-bestand waarvan de eerste kolomnaam een trefwoord bevat.

    De bestandsnamen in een export volgen de taal van het Search Console-account
    ("Pagina's.csv", "Pages.csv") en worden bovendien HTML-geëscaped weggeschreven
    ("Pagina&#39;s.csv"). Matchen op de kolomkop is daar ongevoelig voor.
    """
    for pad in sorted(glob.glob(os.path.join(map_, "*.csv"))):
        try:
            rijen = _csv_rijen(pad)
        except (OSError, UnicodeDecodeError):
            continue
        if not rijen:
            continue
        eerste = list(rijen[0].keys())[0].lower()
        if any(t in eerste for t in trefwoorden):
            return pad, rijen
    return None, []


def _getal(x, komma_ok=False):
    x = (x or "").strip().replace("%", "").replace(",", "." if komma_ok else "")
    try:
        return float(x) if komma_ok else int(float(x))
    except ValueError:
        return 0


def lees_export(bron):
    """Geeft {pad: {klikken, vertoningen, positie}} plus de indexstatus als die er is."""
    tijdelijk = None
    if bron.lower().endswith(".zip"):
        tijdelijk = tempfile.mkdtemp(prefix="gsc-")
        with zipfile.ZipFile(bron) as z:
            z.extractall(tijdelijk)
        bron = tijdelijk

    _, rijen = _vind_csv(bron, "pagina", "page", "url")
    if not rijen:
        sys.exit(f"Geen pagina-CSV gevonden in {bron}. Verwacht een export uit "
                 f"Search Console → Prestaties → Exporteren.")

    k = list(rijen[0].keys())
    per_pagina = {}
    for r in rijen:
        url = (r[k[0]] or "").strip()
        pad = re.sub(r"^https?://[^/]+", "", url)
        if not pad:
            continue
        per_pagina[pad] = {
            "klikken": _getal(r.get(k[1])),
            "vertoningen": _getal(r.get(k[2])),
            "positie": _getal(r.get(k[4]) if len(k) > 4 else "0", komma_ok=True),
        }

    # Optioneel: een per-URL lijst met indexstatus (ontstaat als je in het rapport
    # Pagina-indexering op één reden klikt en dié exporteert).
    index_status = {}
    _, idx = _vind_csv(bron, "indexering", "indexing", "dekking")
    for r in idx:
        kk = list(r.keys())
        url = (r[kk[0]] or "").strip()
        index_status[re.sub(r"^https?://[^/]+", "", url)] = (r.get(kk[1]) or "").strip()

    return per_pagina, index_status


def lees_api(dagen):
    """Zelfde vorm als lees_export(), maar rechtstreeks uit de API."""
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
    except ImportError:
        sys.exit("google-auth ontbreekt. Gebruik de export-variant, of: pip install google-auth")
    import urllib.request, ssl
    from datetime import timedelta

    KEY = "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
    if not os.path.exists(KEY):
        sys.exit(f"Servicesleutel niet gevonden op {KEY}.")
    creds = service_account.Credentials.from_service_account_file(
        KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    creds.refresh(Request())
    eind = date.today() - timedelta(days=2)      # GSC loopt ~2 dagen achter
    body = {
        "startDate": (eind - timedelta(days=dagen)).isoformat(),
        "endDate": eind.isoformat(),
        "dimensions": ["page"],
        "dimensionFilterGroups": [{"filters": [
            {"dimension": "page", "operator": "contains", "expression": "/nieuwbouw-project/"}]}],
        "rowLimit": 25000,
    }
    req = urllib.request.Request(
        "https://www.googleapis.com/webmasters/v3/sites/"
        + urllib.parse.quote("https://www.bylder.com/", safe="") + "/searchAnalytics/query",
        data=json.dumps(body).encode(),
        headers={"Authorization": "Bearer " + creds.token, "Content-Type": "application/json"})
    try:
        data = json.load(urllib.request.urlopen(req, context=ssl.create_default_context(), timeout=60))
    except Exception as e:                                     # noqa: BLE001
        sys.exit(f"API niet bereikbaar ({e}). Binnen de sandbox lukt dit niet — "
                 f"draai dit in een gewone terminal, of gebruik de export-variant.")
    per_pagina = {}
    for r in data.get("rows", []):
        pad = re.sub(r"^https?://[^/]+", "", r["keys"][0])
        per_pagina[pad] = {"klikken": int(r.get("clicks", 0)),
                           "vertoningen": int(r.get("impressions", 0)),
                           "positie": round(r.get("position", 0), 1)}
    return per_pagina, {}


def lees_dekking(map_of_zip):
    """Leest de site-brede export van het rapport Pagina-indexering.

    Dit rapport gaat over de héle site en niet over losse URL's, maar het is wel
    het getal waar de projectpagina's in leven: staan er 35.000 URL's in de rij
    "gevonden maar niet gecrawld", dan concurreren onze veertig projectpagina's
    met die rij om hetzelfde crawlbudget. Zonder die context lees je een pagina
    met nul vertoningen verkeerd.
    """
    if not map_of_zip:
        return None
    map_ = map_of_zip
    if map_.lower().endswith(".zip"):
        map_ = tempfile.mkdtemp(prefix="gsc-dekking-")
        with zipfile.ZipFile(map_of_zip) as z:
            z.extractall(map_)

    uit = {}
    _, diagram = _vind_csv(map_, "datum", "date")
    reeks = [r for r in diagram if (list(r.values())[2] or "").strip()]
    if reeks:
        k = list(reeks[0].keys())
        laatste, eerste = reeks[-1], reeks[0]
        uit["peildatum"] = laatste[k[0]]
        uit["geindexeerd"] = _getal(laatste[k[2]])
        uit["niet_geindexeerd"] = _getal(laatste[k[1]])
        uit["bekend_totaal"] = uit["geindexeerd"] + uit["niet_geindexeerd"]
        uit["geindexeerd_begin"] = _getal(eerste[k[2]])
        uit["vanaf"] = eerste[k[0]]
        # De piek zegt meer dan de eindstand: dalen ná een piek betekent dat
        # Google pagina's die hij hád, weer heeft laten vallen.
        piek = max(reeks, key=lambda r: _getal(r[k[2]]))
        uit["piek"] = {"datum": piek[k[0]], "geindexeerd": _getal(piek[k[2]])}

    _, redenen = _vind_csv(map_, "reden", "reason")
    if redenen:
        k = list(redenen[0].keys())
        uit["redenen"] = [{"reden": r[k[0]], "paginas": _getal(r[k[-1]])}
                          for r in redenen if _getal(r[k[-1]])]
        uit["redenen"].sort(key=lambda x: -x["paginas"])
    return uit or None


VAKKEN = ("aannemer", "loodgieter", "elektricien", "schilder", "stukadoor", "badkamer",
          "dakkapel", "gietvloer", "dakdekker", "timmerman", "kozijnbedrijf",
          "isolatiebedrijf", "ventilatiebedrijf", "energieadviseur", "warmtepompinstallateur")


def _laag(pad):
    seg = pad.strip("/").split("/")
    top = seg[0] if seg and seg[0] else ""
    if top in VAKKEN:
        return "vakbedrijf-profielen" if len(seg) > 1 and seg[1] == "bedrijf" else "vak-stadpagina's"
    if top == "kopen":
        return "/kopen/ (assortiment per stad)"
    if top == "nieuwbouw-project":
        return "projectpagina's"
    if not top:
        return "homepage"
    return f"overig: /{top}/"


def clusterverkeer(per_pagina, dagreeks_totaal=None):
    """Rekent klikken en vertoningen toe aan de laag waar een pagina in zit.

    Waarom dit erbij hoort: op 31 juli ging een hele laag op noindex op grond van
    een aanname over welke pagina's niets opleveren. Dat kostte drie weken van de
    best presterende laag van de site. Sindsdien geldt: geen laag kleiner maken
    voordat dit overzicht op tafel ligt.

    Let op de afkapping. Search Console exporteert maximaal 1.000 pagina's. Voor
    klikken maakt dat niets uit — die duizend bevatten ze vrijwel allemaal, en een
    pagina die er niet in staat heeft er dus geen. Voor vertoningen wel: de staart
    daarbuiten is groot. Snoeibesluiten mogen daarom op klikken, niet op
    vertoningen.
    """
    if not per_pagina:
        return None
    agg = collections.defaultdict(lambda: {"klikken": 0, "vertoningen": 0, "paginas": 0})
    for pad, m in per_pagina.items():
        a = agg[_laag(pad)]
        a["klikken"] += m["klikken"]
        a["vertoningen"] += m["vertoningen"]
        a["paginas"] += 1
    lagen = [{"laag": n, **v} for n, v in agg.items()]
    lagen.sort(key=lambda x: -x["klikken"])
    uit = {"lagen": lagen, "paginas_in_export": len(per_pagina),
           "afgekapt": len(per_pagina) >= 1000}
    if dagreeks_totaal:
        uit["site_totaal"] = dagreeks_totaal
        uit["klik_dekking"] = round(100 * sum(l["klikken"] for l in lagen)
                                    / max(dagreeks_totaal["klikken"], 1))
        uit["vertoning_dekking"] = round(100 * sum(l["vertoningen"] for l in lagen)
                                         / max(dagreeks_totaal["vertoningen"], 1))
    return uit


def lees_dagreeks(map_of_zip):
    """Het echte sitetotaal over de periode, uit de dagreeks van dezelfde export."""
    if not map_of_zip:
        return None
    map_ = map_of_zip
    if map_.lower().endswith(".zip"):
        map_ = tempfile.mkdtemp(prefix="gsc-reeks-")
        with zipfile.ZipFile(map_of_zip) as z:
            z.extractall(map_)
    _, d = _vind_csv(map_, "datum", "date")
    if not d:
        return None
    k = list(d[0].keys())
    return {"klikken": sum(_getal(r[k[1]]) for r in d),
            "vertoningen": sum(_getal(r[k[2]]) for r in d)}


def sitemap_omvang():
    """Hoeveel URL's bieden we Google aan, en welk deel daarvan is een project?"""
    totaal = project = 0
    for f in glob.glob(os.path.join(ROOT, "*-sitemap.xml")):
        try:
            n = open(f, encoding="utf8").read().count("<loc>")
        except OSError:
            continue
        totaal += n
        if os.path.basename(f).startswith("nieuwbouw-project"):
            project = n
    return {"urls_in_sitemaps": totaal, "waarvan_projectpaginas": project}


# --------------------------------------------------------------------------
# de meting zelf
# --------------------------------------------------------------------------
def main():
    args = [a for a in sys.argv[1:]]
    if not args:
        sys.exit(__doc__.split("GEBRUIK")[1].strip())

    dekking_bron = next((a for a in args[1:] if not a.startswith("-")), None)

    if "--api" in args:
        dagen = next((int(a) for a in args if a.isdigit()), 90)
        gsc, index_status = lees_api(dagen)
        bron = f"API, laatste {dagen} dagen"
    else:
        pad = args[0]
        gsc, index_status = lees_export(pad)
        bron = os.path.basename(pad.rstrip("/"))

    pages = json.load(open(os.path.join(CLUSTER, "pages.json"), encoding="utf8"))
    handwerk = set(json.load(open(os.path.join(CLUSTER, "handwerk.json"), encoding="utf8")))
    projecten = json.load(open(PROJECTEN, encoding="utf8"))["projecten"]

    # Het regisseur-blok staat in het contentfragment, niet in pages.json.
    def heeft_regisseur(slug):
        f = os.path.join(CLUSTER, "content", f"{slug}.html")
        try:
            return "woningregisseur voor" in open(f, encoding="utf8").read()
        except OSError:
            return False

    rijen = []
    for p in pages:
        slug = p["slug"]
        if slug in ("index", "oplevermonitor"):
            continue
        m = gsc.get(p["path"], {})
        rijen.append({
            "slug": slug,
            "pad": p["path"],
            "soort": "handwerk" if slug in handwerk else "gegenereerd",
            "regisseur": heeft_regisseur(slug),
            "geindexeerd": index_status.get(p["path"]),      # None = onbekend
            "klikken": m.get("klikken", 0),
            "vertoningen": m.get("vertoningen", 0),
            "positie": m.get("positie", 0),
        })

    rijen.sort(key=lambda r: (-r["vertoningen"], r["slug"]))

    # --- aggregaat per soort: dit is het getal dat de uitrolbeslissing draagt ---
    per_soort = {}
    for soort in ("handwerk", "gegenereerd"):
        groep = [r for r in rijen if r["soort"] == soort]
        vert = sum(r["vertoningen"] for r in groep)
        per_soort[soort] = {
            "paginas": len(groep),
            "klikken": sum(r["klikken"] for r in groep),
            "vertoningen": vert,
            "vertoningen_per_pagina": round(vert / len(groep), 1) if groep else 0,
            "stil": sum(1 for r in groep if r["vertoningen"] == 0),
        }

    # --- dekking: hoeveel van de markt hebben we überhaupt een pagina voor ---
    met_pagina = {r["slug"] for r in rijen}
    def slugify(naam, plaats):
        s = re.sub(r"[^a-z0-9]+", "-", f"{naam} {plaats}".lower()).strip("-")
        return re.sub(r"-{2,}", "-", s)
    bakken = [("100+ woningen", 100, 10**9), ("50-99", 50, 99), ("25-49", 25, 49), ("<25", 0, 24)]
    dekking = []
    for label, lo, hi in bakken:
        groep = [q for q in projecten if lo <= (q.get("woningen") or 0) <= hi]
        heeft = sum(1 for q in groep if slugify(q.get("naam") or "", q["plaats"]) in met_pagina)
        dekking.append({"cohort": label, "projecten": len(groep), "met_pagina": heeft})

    site = lees_dekking(dekking_bron)
    sitemaps = sitemap_omvang()
    clusters = clusterverkeer(gsc, lees_dagreeks(args[0] if not args[0].startswith("-") else None))

    meting = {"datum": VANDAAG, "bron": bron, "per_soort": per_soort,
              "site_indexatie": site, "sitemaps": sitemaps,
              "clusterverkeer": clusters, "dekking": dekking, "paginas": rijen}

    # --- historie: elke ronde erbij, zodat "te jong" van "onvindbaar" te scheiden is ---
    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    historie = []
    if os.path.exists(RAPPORT):
        try:
            oud = json.load(open(RAPPORT, encoding="utf8"))
            historie = [m for m in oud.get("metingen", []) if m["datum"] != VANDAAG]
        except (json.JSONDecodeError, OSError):
            pass
    historie.append(meting)
    json.dump({"metingen": historie}, open(RAPPORT, "w", encoding="utf8"),
              ensure_ascii=False, indent=1)
    open(RAPPORT, "a").write("\n")

    # --- uitvoer ---
    print(f"Meting {VANDAAG} — bron: {bron}\n")
    print(f"{'':<44}{'klik':>6}{'vert':>7}{'pos':>7}  soort")
    for r in rijen[:15]:
        pos = f"{r['positie']:.1f}" if r["positie"] else "—"
        vlag = " ·R" if r["regisseur"] else "   "
        print(f"{r['slug'][:42]:<44}{r['klikken']:>6}{r['vertoningen']:>7}{pos:>7}{vlag} {r['soort']}")
    stil = [r for r in rijen if r["vertoningen"] == 0]
    if len(rijen) > 15:
        print(f"... nog {len(rijen)-15} pagina's (zie {os.path.relpath(RAPPORT, ROOT)})")

    print("\nPER SOORT")
    for soort, s in per_soort.items():
        print(f"  {soort:<12} {s['paginas']:>3} pagina's · {s['vertoningen']:>5} vertoningen · "
              f"{s['vertoningen_per_pagina']:>6} per pagina · {s['stil']} zonder één vertoning")
    h, g = per_soort["handwerk"], per_soort["gegenereerd"]
    if g["vertoningen_per_pagina"]:
        print(f"  → handgeschreven haalt {h['vertoningen_per_pagina']/g['vertoningen_per_pagina']:.1f}× "
              f"zoveel per pagina als gegenereerd")
    elif h["vertoningen_per_pagina"]:
        print("  → gegenereerde pagina's haalden geen enkele vertoning")

    print("\nDEKKING VAN DE MARKT")
    for d in dekking:
        print(f"  {d['cohort']:<14} {d['met_pagina']:>3} van {d['projecten']:>4} projecten heeft een pagina")

    print(f"\n{len(stil)} van de {len(rijen)} pagina's had geen enkele vertoning.")
    print("Let op: dat betekent ongezien, niet ongeïndexeerd — Search Console noemt")
    print("alleen pagina's mét vertoningen. Exporteer ook Pagina-indexering en zet die")
    print("CSV in dezelfde map, dan vult deze meting de echte indexstatus in.")
    if clusters and len(clusters["lagen"]) > 1:
        print("\nVERKEER PER LAAG")
        print(f"  {'laag':<30}{'klik':>7}{'vert':>9}{'pag.':>7}")
        for l in clusters["lagen"][:10]:
            print(f"  {l['laag'][:28]:<30}{l['klikken']:>7}{l['vertoningen']:>9}{l['paginas']:>7}")
        if clusters.get("site_totaal"):
            t = clusters["site_totaal"]
            print(f"  site-totaal uit de dagreeks: {t['klikken']} klikken, {t['vertoningen']} vertoningen")
            print(f"  deze export dekt {clusters['klik_dekking']}% van de klikken en "
                  f"{clusters['vertoning_dekking']}% van de vertoningen")
        if clusters["afgekapt"]:
            print("  LET OP: Search Console kapt af op 1.000 pagina's. Klikken zijn vrijwel")
            print("  volledig gedekt, vertoningen niet — snoei dus op klikken, niet op vertoningen.")

    if site:
        print("\nINDEXATIE VAN DE HELE SITE  (peildatum %s)" % site.get("peildatum", "?"))
        print(f"  {site['geindexeerd']:>6} geïndexeerd van {site['bekend_totaal']:>6} bekende URL's"
              f"  ({100*site['geindexeerd']/max(site['bekend_totaal'],1):.0f}%)")
        p = site.get("piek")
        if p and p["geindexeerd"] > site["geindexeerd"]:
            print(f"  piek was {p['geindexeerd']} op {p['datum']} — sindsdien "
                  f"{p['geindexeerd']-site['geindexeerd']} pagina's uit de index gevallen")
        for r in site.get("redenen", [])[:4]:
            print(f"  {r['paginas']:>6}  {r['reden']}")
        s_ = sitemaps
        print(f"\n  We bieden {s_['urls_in_sitemaps']} URL's aan; {s_['waarvan_projectpaginas']} "
              f"daarvan zijn projectpagina's "
              f"({100*s_['waarvan_projectpaginas']/max(s_['urls_in_sitemaps'],1):.2f}%).")
        print("  Dat is de verhouding waarin ze om crawlbudget moeten concurreren.")

    if any(r["geindexeerd"] for r in rijen):
        tel = collections.Counter(r["geindexeerd"] for r in rijen if r["geindexeerd"])
        print("\nINDEXSTATUS")
        for status, n in tel.most_common():
            print(f"  {n:>3} × {status}")


if __name__ == "__main__":
    main()
