#!/usr/bin/env python3
"""Werkt de verleende bouwvergunningen op de gemeentepagina's (/wonen-in/) bij.

Het CBS ververst tabel 83671NED elk kwartaal; check_cbs_freshness.py meldt dat, dit script
verwerkt het. Het neemt de laatste vier kwartalen die het CBS heeft, telt per gemeente de
vergunde woningen op (alle opdrachtgevers, koop en huur samen) en past op elke pagina aan:
het aantal, de periode (op drie plekken), de zin die vergund vergelijkt met opgeleverd, en
de datum onderaan. De zin volgt de regel van de eerste bouw (27-07-2026): onder 0,8 keer de
oplevering van het laatste gemeten jaar "minder", boven 1,2 keer "meer", daartussen "dicht bij".

Geen automatische ronde: een mens leest de uitvoer na, want een omgeslagen zin is een bewering.

Gebruik:  python3 scripts/cbs_vergunningen_bijwerken.py [--droog]
"""
import datetime, glob, html, json, os, re, sys, urllib.parse, urllib.request
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "data", "cbs-gemeenten.json")
CONTENT = os.path.join(ROOT, "data", "clusters", "wonen-in", "content")
SITEMAP = os.path.join(ROOT, "wonen-in-sitemap.xml")
DROOG = "--droog" in sys.argv

ZIN = {
    "minder": "Dat is minder dan er in het laatste gemeten jaar is opgeleverd. De pijplijn loopt hier dus leeg, wat over een paar jaar zichtbaar wordt in minder nieuw aanbod.",
    "meer": "Er is dus meer vergund dan er in het laatste gemeten jaar is opgeleverd: de bouwstroom in deze gemeente trekt aan.",
    "dicht": "Dat ligt dicht bij wat er in het laatste gemeten jaar is opgeleverd.",
}
# Namen die op de pagina anders staan dan in de CBS-lijst.
ANDERS = {"Utrecht": "GM0344", "Groningen": "GM0014", "'s-Gravenhage": "GM0518"}


def soort(vergund, gereed):
    r = vergund / gereed
    return "minder" if r < 0.8 else "meer" if r > 1.2 else "dicht"


def mooi(kw):  # 2026KW03 -> 2026 K3
    return "%s K%d" % (kw[:4], int(kw[-2:]))


def punt(n):
    return f"{n:,}".replace(",", ".")


def haal_cbs():
    # Het CBS geeft hooguit 10.000 rijen per vraag: alleen dit jaar en vorig jaar.
    j = datetime.date.today().year
    jaren = " or ".join("substringof('%dKW',Perioden)" % x for x in (j - 1, j))
    rijen, url = [], "https://opendata.cbs.nl/ODataApi/odata/83671NED/TypedDataSet?" + urllib.parse.urlencode({
        "$filter": "Opdrachtgever eq 'T001209' and Eigendom eq 'T001258' and substringof('GM',RegioS) and (%s)" % jaren,
        "$select": "RegioS,Perioden,Woningen_2"})
    while url:
        req = urllib.request.Request(url, headers={"User-Agent": "bylder-cbs/1.0 (+https://www.bylder.com)"})
        d = json.load(urllib.request.urlopen(req, timeout=120))
        rijen += d["value"]
        url = d.get("odata.nextLink")
    return [r for r in rijen if "KW" in r["Perioden"]]


def main():
    cache = json.load(open(CACHE, encoding="utf-8"))
    rijen = haal_cbs()
    kwartalen = sorted({r["Perioden"] for r in rijen})[-4:]
    oud_kw = cache["vergund_kwartalen"]
    if kwartalen == oud_kw:
        print("Geen nieuwere kwartalen:", kwartalen); return 0
    nieuw = defaultdict(int); gemeten = set()
    for r in rijen:
        if r["Perioden"] in kwartalen and r["Woningen_2"] is not None:
            nieuw[r["RegioS"].strip()] += r["Woningen_2"]; gemeten.add(r["RegioS"].strip())
    oud_p = "%s t/m %s" % (mooi(oud_kw[0]), mooi(oud_kw[-1]))
    nieuw_p = "%s t/m %s" % (mooi(kwartalen[0]), mooi(kwartalen[-1]))
    naam2gm = {v: k for k, v in cache["gemeenten"].items()}; naam2gm.update(ANDERS)
    vandaag = datetime.date.today().isoformat()
    zin_re = re.compile(
        r"(In )" + re.escape(oud_p) + r"( werden in (.*?) vergunningen verleend voor\s*(?:<[^>]+>)?\s*)([\d.]+) woning(?:en)?(\s*(?:</[^>]+>)?\.\s*)("
        + "|".join(re.escape(z) for z in ZIN.values()) + r")?", re.S)
    punt_re = re.compile(r"(Voor <strong>)([\d.]+) woning(?:en)?(</strong> zijn in )" + re.escape(oud_p))
    telling, omgeslagen, overgeslagen, gewijzigd = Counter(), [], [], []
    for pad in sorted(glob.glob(os.path.join(CONTENT, "*.html"))):
        slug = os.path.basename(pad)[:-5]
        s = open(pad, encoding="utf-8").read()
        m = zin_re.search(s)
        if not m:
            if oud_p in s: overgeslagen.append((slug, "zin niet herkend"))
            continue
        gm = naam2gm.get(html.unescape(m.group(3)))
        if not gm or gm not in gemeten:
            overgeslagen.append((slug, "geen cijfer bij het CBS voor deze periode")); continue
        v = nieuw[gm]
        gereed = (cache["nieuwbouw_gereed"].get(gm) or {}).get(cache["nieuwbouw_jaren"][-1])
        oude_zin = m.group(6)
        nieuwe_zin = ZIN[soort(v, gereed)] if (oude_zin and gereed) else (oude_zin or "")
        if oude_zin and not gereed:
            overgeslagen.append((slug, "geen oplevercijfer om mee te vergelijken")); continue
        wn = "woning" if v == 1 else "woningen"
        t = zin_re.sub(lambda x: f"{x.group(1)}{nieuw_p}{x.group(2)}{punt(v)} {wn}{x.group(5)}{nieuwe_zin}", s, count=1)
        t, n = punt_re.subn(lambda x: f"{x.group(1)}{punt(v)} {wn}{x.group(3)}{nieuw_p}", t, count=1)
        if n != 1:
            overgeslagen.append((slug, "opsommingsregel niet herkend")); continue
        t = t.replace(f"tabel 83671NED ({oud_p})", f"tabel 83671NED ({nieuw_p})")
        if oud_p in t:
            overgeslagen.append((slug, "oude periode staat er nog")); continue
        t = re.sub(r"Bijgewerkt op \d{4}-\d{2}-\d{2}\.", f"Bijgewerkt op {vandaag}.", t)
        if oude_zin and nieuwe_zin != oude_zin:
            was = [k for k, z in ZIN.items() if z == oude_zin][0]
            omgeslagen.append((slug, was, soort(v, gereed), int(m.group(4).replace(".", "")), v, gereed))
        telling[soort(v, gereed) if gereed else "zonder zin"] += 1
        gewijzigd.append(slug)
        if not DROOG:
            open(pad, "w", encoding="utf-8").write(t)
    print(f"Periode: {oud_p} -> {nieuw_p}")
    print(f"Pagina's bijgewerkt: {len(gewijzigd)}  ({dict(telling)})")
    print(f"Zin omgeslagen: {len(omgeslagen)}")
    for o in omgeslagen: print("  %-34s %s -> %s  (vergund %d -> %d, opgeleverd %s)" % o)
    print(f"Overgeslagen: {len(overgeslagen)}")
    for o in overgeslagen: print("  %-34s %s" % o)
    if DROOG: return 0
    cache["vergund_4kw"] = {gm: nieuw[gm] for gm in cache["vergund_4kw"] if gm in gemeten}
    cache["vergund_kwartalen"] = kwartalen
    json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
    if os.path.exists(SITEMAP):
        x = open(SITEMAP, encoding="utf-8").read()
        for slug in gewijzigd:
            x = re.sub(r"(/wonen-in/%s/</loc><lastmod>)\d{4}-\d{2}-\d{2}" % re.escape(slug), r"\g<1>" + vandaag, x)
        open(SITEMAP, "w", encoding="utf-8").write(x)
    return 0


if __name__ == "__main__":
    sys.exit(main())
