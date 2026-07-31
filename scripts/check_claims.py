#!/usr/bin/env python3
"""Claim-bewaker: controleert of een pagina, zijn metadata en zijn schema hetzelfde beweren.

Aanleiding (29 juli 2026). Drie keer op één dag meldde ik een wijziging als "overal
doorgevoerd" terwijl dat niet zo was. De laatste keer stond de oude Auping-belofte nog
in de meta description, de og:description en de JSON-LD van 562 pagina's — precies wat
Google toont en wat AI-zoekmachines citeren. Elke keer had ik in de bron gekeken in
plaats van op de pagina.

De kern van het probleem: dezelfde bewering staat op vier plekken in een pagina, en die
plekken worden door verschillende generatoren gevuld. Zichtbare tekst, <title>, de
meta/og/twitter-descriptions en de JSON-LD. Wie er één aanpast, denkt klaar te zijn.

Daarom leest deze bewaker elke pagina als vier gescheiden zones en vergelijkt wat ze
beweren. Het regelboek staat in data/claims.json; elke fout die we maken hoort daar een
regel te worden.

Draait op de build-output (web/out), niet op de bron — een bron liegt niet maar vertelt
maar de helft. Zie feedback-verifieer-op-buildoutput.

Gebruik:
    python3 scripts/check_claims.py web/out              # volledige scan
    python3 scripts/check_claims.py web/out --steekproef 400
    python3 scripts/check_claims.py --live 60            # tegen productie-URL's

Exit-code 1 zodra een harde regel wordt overtreden. Rapport: reports/claims.json
"""

import argparse
import html
import json
import os
import random
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from urllib.parse import urlsplit

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGELBOEK = os.path.join(REPO, "data", "claims.json")
RAPPORT = os.path.join(REPO, "reports", "claims.json")
HOST = "https://www.bylder.com"
VOORBEELDEN = 15

RE_TITLE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
RE_DESCR = re.compile(
    r'<meta[^>]+(?:name|property)\s*=\s*["\'](?:description|og:description|'
    r'twitter:description)["\'][^>]*>', re.I)
RE_CONTENT = re.compile(r'content\s*=\s*["\'](.*?)["\']', re.I | re.S)
RE_JSONLD = re.compile(
    r'<script[^>]+type\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S)
RE_SCRIPT_STYLE = re.compile(r"<(script|style)\b[^>]*>.*?</\1>", re.I | re.S)
RE_TAG = re.compile(r"<[^>]+>")
RE_WS = re.compile(r"\s+")
RE_DUBBELE_ESCAPE = re.compile(r"&amp;(amp|mdash|nbsp|quot|lt|gt|#\d+);", re.I)
# Elk cluster schrijft zijn FAQ anders op: /ruimtes/ gebruikt .faq-item > h3,
# de vakpillars .faq-q, /kopen/ een <button class="fq">. Wie hier één vorm
# aanneemt, meet 'nul zichtbare vragen' op een pagina die er drie toont — en
# een bewaker die dat verkeerd meldt, wordt genegeerd.
RE_FAQ_ZICHTBAAR = re.compile(
    r'<(?:h3|h4|button|summary|div)[^>]*class="[^"]*\b(?:faq-q|faq-vraag|fq)\b[^"]*"'
    r'[^>]*>(.*?)</(?:h3|h4|button|summary|div)>', re.I | re.S)
RE_FAQ_ITEM_H3 = re.compile(
    r'<div[^>]*class="[^"]*faq-item[^"]*"[^>]*>\s*<h3[^>]*>(.*?)</h3>', re.I | re.S)
# /kortingscode/ en /wonen-in/ gebruiken <details><summary>. Zonder deze vorm
# meldde de bewaker 1.001 pagina's als 'schema zonder zichtbare tekst' terwijl
# de vragen er gewoon stonden.
RE_FAQ_SUMMARY = re.compile(r"<summary[^>]*>(.*?)</summary>", re.I | re.S)
# Next levert een deel van de opmaak als geëscapete string in de RSC-payload.
# Zonder deze stap zit de zichtbare FAQ van /kopen/ voor ons in een <script>.
RE_PAYLOAD = re.compile(r"\\u003c")
RE_BIJGEWERKT = re.compile(
    r"Laatst bijgewerkt:\s*(\d{1,2})\s+([a-z]+)\s+(\d{4})", re.I)

MAANDEN = {m: i for i, m in enumerate(
    ["januari", "februari", "maart", "april", "mei", "juni", "juli",
     "augustus", "september", "oktober", "november", "december"], 1)}

def ontescape(s):
    # Met een eigen tabel miste ik eerst &#x27; (39.676 valse afwijkingen) en
    # daarna &sup2; en &euro; (nog eens duizenden). De stdlib kent ze allemaal;
    # een handgeschreven lijst is hier per definitie incompleet.
    return html.unescape(s)


def normaliseer(s):
    return RE_WS.sub(" ", ontescape(RE_TAG.sub(" ", s))).strip()


def zones_uit(html):
    """Splits een pagina in de vier plekken waar dezelfde bewering kan staan.

    Ze worden door verschillende generatoren gevuld en lopen daardoor uiteen.
    Precies dat uiteenlopen is wat we willen zien.
    """
    m = RE_TITLE.search(html)
    titel = normaliseer(m.group(1)) if m else ""

    descr = []
    for tag in RE_DESCR.finditer(html):
        c = RE_CONTENT.search(tag.group(0))
        if c:
            descr.append(ontescape(c.group(1)))

    schema = [b.strip() for b in RE_JSONLD.findall(html)]

    zichtbaar = normaliseer(RE_SCRIPT_STYLE.sub(" ", html))

    return {
        "titel": titel,
        "description": " ‖ ".join(descr),
        "schema": " ‖ ".join(schema),
        "zichtbaar": zichtbaar,
    }


def faq_uit_schema(schema_blokken):
    vragen = []
    for blok in schema_blokken:
        try:
            data = json.loads(blok)
        except (ValueError, TypeError):
            continue
        for d in (data if isinstance(data, list) else [data]):
            if not isinstance(d, dict):
                continue
            if d.get("@type") == "FAQPage":
                for q in d.get("mainEntity", []) or []:
                    if isinstance(q, dict) and q.get("name"):
                        vragen.append(normaliseer(str(q["name"])))
    return vragen


def ontsnap_payload(html):
    """Maakt de geëscapete opmaak uit de Next-payload weer leesbaar."""
    return (html.replace("\\u003c", "<").replace("\\u003e", ">")
                .replace("\\u0026", "&").replace('\\"', '"'))


def faq_uit_pagina(html):
    bron = html + ("\n" + ontsnap_payload(html) if RE_PAYLOAD.search(html) else "")
    v = [normaliseer(x) for x in RE_FAQ_ITEM_H3.findall(bron)]
    v += [normaliseer(x) for x in RE_FAQ_ZICHTBAAR.findall(bron)]
    v += [normaliseer(x) for x in RE_FAQ_SUMMARY.findall(bron)]
    uit, gezien = [], set()
    for x in v:
        # Het plusteken van de uitklapknop hoort niet bij de vraag.
        x = x.rstrip("+ ").strip()
        if x and x not in gezien:
            gezien.add(x)
            uit.append(x)
    return uit


def stad_uit_pad(relpad):
    """Laatste padsegment als stadsnaam, voor de verzonnen-vestiging-regel."""
    delen = [d for d in relpad.replace("\\", "/").split("/") if d]
    if delen and delen[-1] in ("index.html",):
        delen = delen[:-1]
    if not delen:
        return None
    laatste = delen[-1]
    if not re.fullmatch(r"[a-z]+(?:-[a-z]+)*", laatste):
        return None
    return " ".join(w.capitalize() for w in laatste.split("-"))


class Regels:
    """Voorgecompileerd regelboek. Één keer opbouwen, in elke worker hergebruiken."""

    def __init__(self, rb):
        f = re.I
        self.gekoppeld = [{
            "naam": r["naam"],
            "wanneer": re.compile(r["wanneer"], f),
            "alleen_als": re.compile(r["alleen_als"], f) if r.get("alleen_als") else None,
            "dan_ook": re.compile(r["dan_ook"], f),
            "waar": r.get("waar", "zichtbaar"),
            "hard": r.get("hard", True),
        } for r in rb.get("gekoppelde_claims", [])]
        self.verboden = [{
            "naam": r["naam"],
            "patroon": re.compile(r["patroon"], f),
            "hard": r.get("hard", True),
        } for r in rb.get("verboden_claims", [])]
        vv = rb.get("verzonnen_vestigingen", {})
        self.merken = vv.get("merken", [])
        self.merken_hard = vv.get("hard", True)
        self.lengtes = rb.get("lengtes", {})


_REGELS = None


def _init_worker(rulebook):
    global _REGELS
    _REGELS = Regels(rulebook)


def controleer(html, ident, relpad=None):
    """Alle regels op één pagina. Geeft een lijst bevindingen terug."""
    R = _REGELS
    z = zones_uit(html)
    bev = []

    def meld(regel, soort, detail, hard):
        bev.append({"pagina": ident, "regel": regel, "soort": soort,
                    "detail": detail, "hard": hard})

    # --- Gekoppelde claims -------------------------------------------------
    # Een voorwaardelijke belofte hoort nooit los van zijn voorwaarde te staan.
    # Met waar="zelfde_zone" eisen we dat per plek: staat de korting in de meta
    # description, dan hoort de voorwaarde daar ook. Dat is wat op 29 juli
    # ontbrak, want de zichtbare tekst klopte wél.
    for r in R.gekoppeld:
        if r["alleen_als"] and not r["alleen_als"].search(z["zichtbaar"] + z["description"] + z["titel"]):
            continue
        if r["waar"] == "zelfde_zone":
            for naam in ("titel", "description", "schema", "zichtbaar"):
                tekst = z[naam]
                if not tekst or not r["wanneer"].search(tekst):
                    continue
                # De voorwaarde past niet in een <title>; die mag naar de
                # zichtbare tekst wijzen. Anders zou de regel titels afkeuren
                # die niet anders kunnen, en een regel die vals alarm geeft
                # wordt genegeerd.
                doel = z["zichtbaar"] if naam == "titel" else tekst
                if not r["dan_ook"].search(doel):
                    meld(r["naam"], "claim zonder voorwaarde",
                         "in zone '%s'" % naam, r["hard"])
        else:
            if r["wanneer"].search(z["zichtbaar"] + z["description"] + z["schema"] + z["titel"]) \
                    and not r["dan_ook"].search(z["zichtbaar"]):
                meld(r["naam"], "claim zonder voorwaarde", "zichtbare tekst", r["hard"])

    # --- Verboden beweringen ----------------------------------------------
    for r in R.verboden:
        for naam in ("titel", "description", "schema", "zichtbaar"):
            m = r["patroon"].search(z[naam])
            if m:
                meld(r["naam"], "afgeschafte bewering",
                     "'%s' in zone '%s'" % (m.group(0)[:60], naam), r["hard"])

    # --- Pagina == schema: de FAQ ------------------------------------------
    # Een FAQ-schema dat andere vragen bevat dan de pagina toont, is precies het
    # soort verschil waar Google een handmatige maatregel voor uitdeelt.
    zichtbare_faq = faq_uit_pagina(html)
    schema_faq = faq_uit_schema(RE_JSONLD.findall(html))
    if schema_faq and not zichtbare_faq:
        pass  # hieronder als eigen regel gemeld
    elif zichtbare_faq and not schema_faq:
        # Zichtbare vragen zonder schema is geen overtreding maar een gemiste
        # kans: de FAQ staat er, Google kan hem alleen niet als zodanig lezen.
        meld("faq-zonder-schema", "gemiste kans",
             "%d vragen zichtbaar, geen FAQPage" % len(zichtbare_faq), False)
    if schema_faq or zichtbare_faq:
        if len(zichtbare_faq) != len(schema_faq) and schema_faq and zichtbare_faq:
            meld("faq-pariteit", "pagina wijkt af van schema",
                 "%d zichtbaar, %d in schema" % (len(zichtbare_faq), len(schema_faq)),
                 True)
        elif zichtbare_faq and schema_faq and zichtbare_faq != schema_faq:
            afw = next((i for i, (a, b) in enumerate(zip(zichtbare_faq, schema_faq))
                        if a != b), 0)
            meld("faq-pariteit", "pagina wijkt af van schema",
                 "vraag %d: '%s' vs '%s'" % (afw + 1, zichtbare_faq[afw][:50],
                                             schema_faq[afw][:50]), True)
        if schema_faq and not zichtbare_faq:
            meld("faq-onzichtbaar", "schema zonder zichtbare tekst",
                 "%d vragen alleen in het schema" % len(schema_faq), True)

    # --- Datumpariteit ------------------------------------------------------
    # De zichtbare "laatst bijgewerkt" en dateModified in het schema komen uit
    # verschillende plekken in de code en lopen daardoor uiteen.
    m = RE_BIJGEWERKT.search(z["zichtbaar"])
    if m and "dateModified" in z["schema"]:
        maand = MAANDEN.get(m.group(2).lower())
        if maand:
            zichtbaar_iso = "%s-%02d-%02d" % (m.group(3), maand, int(m.group(1)))
            for iso in set(re.findall(r'"dateModified"\s*:\s*"(\d{4}-\d{2}-\d{2})',
                                      z["schema"])):
                if iso != zichtbaar_iso:
                    meld("datum-pariteit", "pagina wijkt af van schema",
                         "pagina %s, schema %s" % (zichtbaar_iso, iso), True)

    # --- Dubbel ge-escapete entities ---------------------------------------
    # &amp;mdash; toont letterlijk "&mdash;" in het zoekresultaat.
    m = RE_DUBBELE_ESCAPE.search(html)
    if m:
        meld("dubbele-escape", "onleesbare tekens", m.group(0), True)

    # --- Verzonnen vestiging ------------------------------------------------
    # De handtekening is de merknaam pal voor de stad van de pagina zélf. Een
    # vaste vermelding ("Adviba Nijmegen" op elke pagina) is juist correct.
    stad = stad_uit_pad(relpad) if relpad else None
    if stad and len(stad) > 3:
        for merk in R.merken:
            if re.search(r"\b%s %s\b" % (re.escape(merk), re.escape(stad)),
                         z["zichtbaar"] + z["description"]):
                meld("verzonnen-vestiging", "filiaal dat niet bestaat",
                     "%s %s" % (merk, stad), R.merken_hard)

    # --- Lengtes (zacht) ----------------------------------------------------
    L = R.lengtes
    if L and z["titel"]:
        n = len(z["titel"])
        if n > L.get("title_max", 65):
            meld("titel-lengte", "metadata", "%d tekens" % n, False)
        elif n < L.get("title_min", 30):
            meld("titel-lengte", "metadata", "%d tekens" % n, False)
    if L and z["description"]:
        eerste = z["description"].split(" ‖ ")[0]
        n = len(eerste)
        if n > L.get("description_max", 165) or n < L.get("description_min", 110):
            meld("description-lengte", "metadata", "%d tekens" % n, False)

    return bev


def _werk_bestand(args):
    relpad, root = args
    try:
        with open(os.path.join(root, relpad), encoding="utf-8", errors="replace") as fh:
            html = fh.read()
    except OSError as e:
        return [{"pagina": relpad, "regel": "leesfout", "soort": "io",
                 "detail": str(e), "hard": False}]
    return controleer(html, "/" + relpad.replace("index.html", ""), relpad)


def _ssl_context():
    """macOS levert Python zonder systeemcertificaten; zonder certifi faalt elke
    HTTPS-call met CERTIFICATE_VERIFY_FAILED. Dezelfde valkuil kostte eerder een
    hele scrape-ronde (159 fouten, 0 rijen)."""
    import ssl
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def _haal(url, timeout=30):
    import urllib.request
    req = urllib.request.Request(url, headers={"User-Agent": "Bylder-claimbewaker/1.0"})
    return urllib.request.urlopen(req, timeout=timeout, context=_ssl_context())


def _werk_url(url):
    try:
        with _haal(url) as r:
            if r.status != 200:
                return [{"pagina": url, "regel": "status", "soort": "bereikbaarheid",
                         "detail": "HTTP %d" % r.status, "hard": True}]
            html = r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001 — netwerk, alles is hier informatief
        return [{"pagina": url, "regel": "status", "soort": "bereikbaarheid",
                 "detail": type(e).__name__, "hard": True}]
    return controleer(html, url, urlsplit(url).path.lstrip("/") + "index.html")


def verzamel_bestanden(root):
    uit = []
    for dirpath, dirnames, files in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in ("_next", "__pycache__")]
        for fn in files:
            if fn.endswith(".html"):
                uit.append(os.path.relpath(os.path.join(dirpath, fn), root))
    return sorted(uit)


def urls_uit_sitemaps(limiet):
    """Steekproef voor de live-modus: gespreid over alle sitemaps, niet de eerste N."""
    def haal(u):
        with _haal(u) as r:
            return r.read().decode("utf-8", "replace")
    index = haal(HOST + "/sitemap.xml")
    kinderen = re.findall(r"<loc>\s*(.*?)\s*</loc>", index, re.S)
    urls = []
    per = max(1, limiet // max(1, len(kinderen)))
    for kind in kinderen:
        try:
            locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", haal(kind), re.S)
        except Exception:  # noqa: BLE001
            continue
        random.shuffle(locs)
        urls.extend(locs[:per])
    random.shuffle(urls)
    return urls[:limiet]


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("map", nargs="?", default=os.path.join(REPO, "web", "out"),
                   help="build-output om te controleren (standaard web/out)")
    p.add_argument("--steekproef", type=int, metavar="N",
                   help="controleer N willekeurige pagina's in plaats van alles")
    p.add_argument("--live", type=int, metavar="N",
                   help="controleer N productie-URL's uit de sitemaps")
    p.add_argument("--zaad", type=int, default=20260731,
                   help="vaste willekeur, zodat een steekproef herhaalbaar is")
    args = p.parse_args()

    with open(REGELBOEK, encoding="utf-8") as fh:
        rulebook = json.load(fh)
    random.seed(args.zaad)
    t0 = time.time()

    if args.live:
        doelen = urls_uit_sitemaps(args.live)
        bron = "productie (%d URL's)" % len(doelen)
        _init_worker(rulebook)
        with ProcessPoolExecutor(max_workers=8,
                                 initializer=_init_worker,
                                 initargs=(rulebook,)) as ex:
            resultaten = list(ex.map(_werk_url, doelen, chunksize=2))
    else:
        root = os.path.abspath(args.map)
        if not os.path.isdir(root):
            sys.exit("Map bestaat niet: %s — draai eerst de build." % root)
        bestanden = verzamel_bestanden(root)
        if args.steekproef and args.steekproef < len(bestanden):
            bestanden = random.sample(bestanden, args.steekproef)
        doelen = [(b, root) for b in bestanden]
        bron = "%s (%d pagina's)" % (root, len(bestanden))
        with ProcessPoolExecutor(initializer=_init_worker,
                                 initargs=(rulebook,)) as ex:
            resultaten = list(ex.map(_werk_bestand, doelen, chunksize=64))

    bevindingen = [b for r in resultaten for b in r]

    per_regel = {}
    for b in bevindingen:
        s = per_regel.setdefault(b["regel"], {"aantal": 0, "hard": b["hard"],
                                              "voorbeelden": []})
        s["aantal"] += 1
        if len(s["voorbeelden"]) < VOORBEELDEN:
            s["voorbeelden"].append({"pagina": b["pagina"], "soort": b["soort"],
                                     "detail": b["detail"]})

    rapport = {
        "bron": bron,
        "gecontroleerd": len(doelen),
        "bevindingen": len(bevindingen),
        "seconden": round(time.time() - t0, 1),
        "per_regel": per_regel,
    }
    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    with open(RAPPORT, "w", encoding="utf-8") as fh:
        json.dump(rapport, fh, ensure_ascii=False, indent=2)

    print("=" * 72)
    print("CLAIM-BEWAKER  %s" % bron)
    print("=" * 72)
    if not per_regel:
        print("[OK] geen enkele afwijking gevonden")
    hard_fout = False
    for naam in sorted(per_regel, key=lambda k: (-per_regel[k]["hard"],
                                                 -per_regel[k]["aantal"])):
        s = per_regel[naam]
        status = "FOUT" if s["hard"] else "let op"
        hard_fout = hard_fout or s["hard"]
        print("[%-6s] %-22s %d pagina's" % (status, naam, s["aantal"]))
        for v in s["voorbeelden"][:5]:
            print("           %s — %s" % (v["pagina"][:58], v["detail"][:70]))
        if s["aantal"] > 5:
            print("           ... nog %d (zie reports/claims.json)" % (s["aantal"] - 5))
    print("\n%d pagina's in %ss" % (len(doelen), rapport["seconden"]))
    sys.exit(1 if hard_fout else 0)


if __name__ == "__main__":
    main()
