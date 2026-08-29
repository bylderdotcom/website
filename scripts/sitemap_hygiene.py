#!/usr/bin/env python3
"""Haalt adressen uit de sitemaps die er niet in horen: omleidingen en doodlopers.

WAAROM
------
Search Console meldde op 29 augustus 652 pagina's "met omleiding" en 362 "niet
gevonden (404)". Allebei kosten ze crawlbudget dat we hard nodig hebben: van de
49.471 bekende adressen heeft Google er 35.011 nooit opgehaald. Een crawler die
langskomt voor een adres dat doorverwijst of niet bestaat, is een crawler die
onze projectpagina's niet ophaalt.

Een sitemap is een uitnodiging. Iets uitnodigen wat er niet is, of wat meteen
doorverwijst, is de goedkoopste vorm van verspilling die er bestaat.

HOE — EN WAAROM ZONDER NETWERK
------------------------------
Beide categorieën zijn uit de repo zelf af te leiden, zonder één HTTP-verzoek:

  - Omleidingen staan in vercel.json. Elk adres dat daar bronkant is, hoort niet
    in een sitemap. Ook de patronen met :path* worden meegenomen.
  - Doodlopers zijn adressen zonder pagina: geen entry in de pages.json van een
    cluster en geen index.html op de schijf.

Dat is betrouwbaarder dan de site aflopen: geen last van tijdelijke fouten, geen
rate limits, en het draait in elke omgeving. Wat het niet vangt zijn 404's die
pas op productie ontstaan (een build die iets niet wegschrijft); daarvoor blijft
de wekelijkse controle op de bouw-uitvoer de aangewezen plek.

Gebruik:
    python3 scripts/sitemap_hygiene.py --dry
    python3 scripts/sitemap_hygiene.py
"""
import json, os, re, sys, glob, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRY = "--dry" in sys.argv
RAPPORT = os.path.join(ROOT, "reports", "sitemap-hygiene.json")

# Sitemaps die we met rust laten: de index zelf verwijst naar sitemaps en niet
# naar pagina's, dus de controles hieronder slaan er niet op aan.
OVERSLAAN = {"sitemap.xml"}


def omleidingsbronnen():
    """Elk pad dat in vercel.json de bronkant van een redirect is.

    Retourneert (exacte_paden, patroon_prefixen). Een bron met :path* dekt alles
    eronder; die vergelijken we op prefix in plaats van exact.
    """
    vj = os.path.join(ROOT, "vercel.json")
    if not os.path.exists(vj):
        return set(), []
    d = json.load(open(vj, encoding="utf8"))
    exact, prefix = set(), []
    for r in d.get("redirects", []):
        bron = r.get("source", "")
        if not bron.startswith("/"):
            continue
        # Voorwaardelijke omleidingen tellen niet mee. De belangrijkste is
        # "/:path*" met has-host bylder.com: dat is de non-www-canonical, die
        # alleen geldt als iemand het domein zónder www opvraagt. Onze sitemaps
        # bevatten uitsluitend www-adressen, dus die omleiding raakt er geen
        # enkele. Zonder deze uitzondering leest het patroon als "alles" en
        # leegt deze opschoning elke sitemap — gemeten in de droogdraai: alle
        # 56.688 adressen zouden zijn verdwenen.
        if r.get("has") or r.get("missing"):
            continue
        if ":" in bron:
            # "/deelnemer-worden/woonwinkels/:path*" → prefix "/deelnemer-worden/woonwinkels/"
            prefix.append(bron.split(":", 1)[0])
        else:
            exact.add(bron.rstrip("/") + "/")
    return exact, prefix


DYNAMISCH = set()   # prefixen die door een dynamische Next-route bediend worden


def bestaande_paden():
    """Alle paden waarvoor een pagina bestaat: uit de clusters én van de schijf."""
    paden = set()
    for pj in glob.glob(os.path.join(ROOT, "data", "clusters", "*", "pages.json")):
        try:
            for p in json.load(open(pj, encoding="utf8")):
                if p.get("path"):
                    paden.add(p["path"].rstrip("/") + "/")
        except (json.JSONDecodeError, OSError):
            continue
    # Next-routes: een page.tsx in web/app is een pagina, ook zonder index.html
    # op de schijf en zonder entry in een pages.json. Zonder deze stap ziet de
    # opschoning /functies/, /ruimtes/ en /kozijnloze-deuren/ voor doodlopers aan
    # en gooit ze uit de sitemap — pagina's die het gewoon doen. Dynamische
    # segmenten ([slug], [[...slug]]) slaan we over: die worden gedekt door de
    # pages.json van hun cluster, die hierboven al is ingelezen.
    app = os.path.join(ROOT, "web", "app")
    for dirpath, _dirs, files in os.walk(app):
        if not any(f.startswith("page.") for f in files):
            continue
        rel = os.path.relpath(dirpath, app)
        if rel == ".":
            paden.add("/")
            continue
        segmenten = [s for s in rel.split(os.sep) if not s.startswith("(")]
        dyn = next((i for i, s in enumerate(segmenten) if s.startswith("[")), None)
        if dyn is not None:
            # Een dynamische route serveert onbekend welke slugs. Sommige lezen
            # hun lijst uit een cluster-pages.json (die kennen we), andere uit een
            # eigen bron — /ruimtes/[slug] komt bijvoorbeeld uit data/ruimtes/*.json.
            # Offline valt niet sluitend vast te stellen wat zo'n route wél
            # aankan, dus verklaren we het hele pad eronder onaantastbaar. Liever
            # een doodloper missen dan een werkende pagina uit de sitemap gooien:
            # dit script zag /ruimtes/balkon/ tot en met deze regel voor dood aan.
            DYNAMISCH.add("/" + "/".join(segmenten[:dyn]) + "/" if dyn else "/")
            continue
        paden.add("/" + "/".join(segmenten) + "/")

    # Statische pagina's: elke map met een index.html is een geldig pad.
    for dirpath, dirnames, files in os.walk(ROOT):
        dirnames[:] = [x for x in dirnames if x not in
                       {".git", "node_modules", "web", "data", "scripts", "_scripts",
                        "_audits", "reports", ".claude", "__pycache__", "templates",
                        "docs", "_og-templates", "output", "out", ".next"}]
        if "index.html" in files:
            rel = os.path.relpath(dirpath, ROOT)
            paden.add("/" if rel == "." else "/" + rel.replace(os.sep, "/") + "/")
    return paden


def main():
    exact, prefix = omleidingsbronnen()
    bestaat = bestaande_paden()
    print(f"{len(exact)} exacte omleidingen en {len(prefix)} patronen uit vercel.json")
    print(f"{len(bestaat)} bestaande paden gevonden\n")

    weg = collections.defaultdict(lambda: {"omleiding": [], "doodloper": []})
    totaal_voor = totaal_na = 0

    for sm in sorted(glob.glob(os.path.join(ROOT, "*-sitemap.xml"))) + \
              [os.path.join(ROOT, "sitemap.xml")]:
        naam = os.path.basename(sm)
        if naam in OVERSLAAN:
            continue
        xml = open(sm, encoding="utf8").read()
        blokken = re.findall(r"<url>.*?</url>", xml, re.S)
        if not blokken:
            continue
        houden = []
        for b in blokken:
            m = re.search(r"<loc>([^<]+)</loc>", b)
            if not m:
                houden.append(b)
                continue
            pad = re.sub(r"^https?://[^/]+", "", m.group(1)).rstrip("/") + "/"
            if pad in exact or any(pad.startswith(p) for p in prefix):
                weg[naam]["omleiding"].append(pad)
            elif pad not in bestaat and not any(pad.startswith(d) for d in DYNAMISCH):
                weg[naam]["doodloper"].append(pad)
            else:
                houden.append(b)
        totaal_voor += len(blokken)
        totaal_na += len(houden)
        if len(houden) != len(blokken) and not DRY:
            nieuw = ('<?xml version="1.0" encoding="UTF-8"?>\n'
                     '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                     + "".join("  " + b + "\n" for b in houden) + "</urlset>\n")
            open(sm, "w", encoding="utf8").write(nieuw)

    print(f"{'DROOGDRAAI — ' if DRY else ''}{totaal_voor} adressen bekeken, "
          f"{totaal_voor - totaal_na} eruit, {totaal_na} blijven staan.\n")
    for naam, v in sorted(weg.items(), key=lambda x: -(len(x[1]['omleiding']) + len(x[1]['doodloper']))):
        n = len(v["omleiding"]) + len(v["doodloper"])
        if not n:
            continue
        print(f"  {naam:<36} {n:>5} weg  ({len(v['omleiding'])} omleiding, {len(v['doodloper'])} doodloper)")
        for p in (v["omleiding"] + v["doodloper"])[:3]:
            print(f"      {p}")

    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    json.dump({"bekeken": totaal_voor, "verwijderd": totaal_voor - totaal_na,
               "per_sitemap": {k: v for k, v in weg.items()}},
              open(RAPPORT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    open(RAPPORT, "a").write("\n")


if __name__ == "__main__":
    main()
