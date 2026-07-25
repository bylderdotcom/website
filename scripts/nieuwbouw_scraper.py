#!/usr/bin/env python3
"""
Beleefde, laag-volume scraper voor nieuwbouw.nl — projectdata voor de lokale-acquisitie-MVP.
Publieke projectdata (naam, plaats, #woningen, coords, status) met bronvermelding.
robots.txt staat /aanbod/koop toe; ToS-toets hoort bij grote uitrol (zie geheugen).

Modes:
  list [max_pages]     Pagineer /aanbod/koop → data/nieuwbouwprojecten.json (url, plaats, naam).
  enrich <gemeente>    Detail-fetch projecten in die gemeente → +woningen +lat/lng +status.
  discover [max_pages] Wekelijks: diff de lijst tegen wat we al kennen, verrijk ALLEEN de
                       nieuwe projecten en scoor ze op pagina-waardigheid. Schrijft
                       reports/nieuwe-projecten.json. Read-only t.o.v. content: genereert
                       nooit pagina's — de output is een reviewbare kandidatenlijst.
"""
import json, os, re, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
BASE = "https://nieuwbouw.nl"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
DELAY = 1.5  # beleefd

def fetch(url):
    for _ in range(3):
        r = subprocess.run(["curl", "-s", "-m", "30", "-A", UA, url], capture_output=True, text=True, timeout=40)
        if r.stdout and len(r.stdout) > 2000:
            return r.stdout
        time.sleep(2)
    return ""

def plaats_uit_url(u):
    m = re.search(r"/aanbod/koop/([a-z0-9-]+)/", u)
    return m.group(1) if m else ""

def naam_uit_slug(u):
    m = re.search(r"/aanbod/koop/[a-z0-9-]+/[A-Z0-9]+-([a-z0-9-]+)", u)
    return " ".join(w.capitalize() for w in m.group(1).split("-")) if m else ""

def load():
    return json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {"_bron": "nieuwbouw.nl (publieke projectdata, gescraped voor Bylder-MVP)", "projecten": []}

def save(data):
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, "w"), ensure_ascii=False, indent=1)


def mode_list(max_pages):
    seen, projecten = set(), []
    for p in range(1, max_pages + 1):
        html = fetch(f"{BASE}/aanbod/koop?page={p}")
        urls = sorted(set(re.findall(r"/aanbod/koop/[a-z0-9-]+/[A-Z0-9]+-[a-z0-9-]+", html)))
        nieuw = [u for u in urls if u not in seen]
        if not nieuw:
            print(f"  pagina {p}: geen nieuwe projecten → einde"); break
        for u in nieuw:
            seen.add(u)
            projecten.append({"url": BASE + u, "plaats": plaats_uit_url(u), "naam": naam_uit_slug(u)})
        if p % 10 == 0: print(f"  …pagina {p}, {len(projecten)} projecten")
        time.sleep(DELAY)
    data = load(); data["projecten"] = projecten; save(data)
    import collections
    per = collections.Counter(x["plaats"] for x in projecten)
    print(f"\n{len(projecten)} projecten over {len(per)} gemeenten.")
    print("Top-15 gemeenten (aantal projecten):")
    for g, c in per.most_common(15): print(f"  {c:2}  {g}")


def woningen_uit(text):
    m = re.search(r"(\d+)\s+(?:koop|huur)?\s*(?:woningen|appartementen|wooneenheden|huizen)", text or "", re.I)
    return int(m.group(1)) if m else None

def eigen_beschrijving(html):
    """De ÉIGEN projectbeschrijving uit de JSON-LD (niet body-breed → geen cross-links)."""
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    if not m: return ""
    try:
        g = json.loads(m.group(1)).get("@graph", [])
    except Exception:
        return ""
    for n in g:
        if n.get("@type") in ("ItemPage", "RealEstateListing") and n.get("description"):
            return n["description"]
    return next((n.get("description", "") for n in g if isinstance(n, dict) and n.get("description")), "")

def woningen_uit_pagina(html):
    """Fallback: hele paginatekst. Neemt de kleinste plausibele match, want grote
    getallen op een projectpagina zijn vaak prijzen of het totaal van het stadsdeel."""
    txt = re.sub(r"<[^>]+>", " ", html or "")
    kand = [int(m) for m in re.findall(
        r"(\d{1,4})\s*(?:nieuwbouw)?\s*(?:koop|huur)?\s*(?:woningen|appartementen|wooneenheden|huizen)",
        txt, re.I)]
    kand = [k for k in kand if 2 <= k <= 3000]
    return min(kand) if kand else None

def parse_detail(html, naam=""):
    # eigen projectbeschrijving eerst (meest betrouwbaar), dan de naam, dan de pagina
    woningen = (woningen_uit(eigen_beschrijving(html)) or woningen_uit(naam)
                or woningen_uit_pagina(html))
    geo = re.search(r'"@type":"GeoCoordinates","latitude":(-?[\d.]+),"longitude":(-?[\d.]+)', html)
    lat = float(geo.group(1)) if geo else None
    lng = float(geo.group(2)) if geo else None
    status = None
    for s in ("In verkoop", "In aanbouw", "Toekomstig", "Verkocht"):
        if s.lower() in html.lower(): status = s; break
    # Jaartallen zijn verraderlijk: een portaal noemt vaak hetzelfde jaar voor
    # start verkoop, start bouw én oplevering. Bij Dok District (Almere) stond
    # "2026" voor de verkoopstart terwijl de oplevering Q1 2029 is — de score
    # dacht daardoor dat het klusvenster nabij was. Daarom: leg vast op WELK
    # trefwoord een jaar werd gevonden, en geef voorrang aan oplever-woorden.
    jaren = sorted({int(y) for y in re.findall(r"Q[1-4]\s*(20[0-9]{2})", html)})
    treffers = [(kw.lower(), int(jr)) for kw, jr in re.findall(
        r"(oplevering|sleuteloverdracht|opgeleverd|start\s+bouw|start\s+verkoop|verwacht|medio|eind|begin)"
        r"[^<]{0,24}?(20[2-9][0-9])", html, re.I)]
    hard = [jr for kw, jr in treffers if kw in ("oplevering", "sleuteloverdracht", "opgeleverd")]
    if hard:
        oplevering, oplevering_bron = max(hard), "oplevertrefwoord"
    elif jaren:
        oplevering, oplevering_bron = max(jaren), "kwartaalnotatie (onzeker)"
    elif treffers:
        oplevering, oplevering_bron = max(jr for _, jr in treffers), "zwak trefwoord (ONBETROUWBAAR)"
    else:
        oplevering, oplevering_bron = None, None
    if not jaren:
        jaren = sorted({jr for _, jr in treffers})
    return woningen, lat, lng, status, jaren, oplevering, oplevering_bron


def mode_enrich(gemeente):
    data = load()
    doel = [x for x in data["projecten"] if x["plaats"] == gemeente]
    if not doel:
        print(f"Geen projecten in '{gemeente}'. Draai eerst 'list'."); return
    print(f"{len(doel)} projecten in {gemeente} verrijken…")
    for x in doel:
        html = fetch(x["url"])
        w, lat, lng, status, jaren, oplevering, opl_bron = parse_detail(html, x.get("naam", ""))
        x.update(woningen=w, lat=lat, lng=lng, status=status, jaren=jaren,
                 oplevering=oplevering, oplevering_bron=opl_bron)
        print(f"  {x['naam']}: {w} woningen, {status}, oplevering≈{oplevering}, ({lat},{lng})")
        time.sleep(DELAY)
    save(data)
    print("Klaar.")



# ── Wekelijkse ontdekking ────────────────────────────────────────────────────
# Waarom een score en niet "alles genereren": 995 bijna-identieke projectpagina's
# is precies de dunne-content-val die de kortingscode-pagina's op noindex bracht
# (en die sinds Helpful Content het hele domein raakt). Een projectpagina verdient
# alleen te bestaan als er genoeg eigen substantie is. Deze score rangschikt
# kandidaten; een mens kiest.
def score_project(x):
    """0-100 pagina-waardigheid + de redenen erachter."""
    score, redenen = 0, []
    w = x.get("woningen") or 0
    if w >= 200:   score += 35; redenen.append(f"{w} woningen (groot project, veel zoekers)")
    elif w >= 75:  score += 25; redenen.append(f"{w} woningen")
    elif w >= 25:  score += 15; redenen.append(f"{w} woningen")
    elif w:        score += 5;  redenen.append(f"{w} woningen (klein)")
    else:          redenen.append("aantal woningen onbekend")

    st = (x.get("status") or "").lower()
    if "verkoop" in st:    score += 30; redenen.append("in verkoop — funnelvenster staat open")
    elif "aanbouw" in st:  score += 25; redenen.append("in aanbouw — meerwerk/oplevering nog te gaan")
    elif "toekomstig" in st: score += 12; redenen.append("toekomstig — vroeg, maar wél first-mover")
    elif "verkocht" in st: score += 3;  redenen.append("verkocht — alleen afwerkingsfase resteert")

    op = x.get("oplevering")
    zwak = x.get("oplevering_bron") == "zwak trefwoord (ONBETROUWBAAR)"
    if op and not zwak:
        from datetime import date
        d = op - date.today().year
        if 0 <= d <= 2: score += 25; redenen.append(f"oplevering ~{op} — klusvenster binnen bereik")
        elif d > 2:     score += 12; redenen.append(f"oplevering ~{op} — lange aanloop")
    elif op and zwak:
        score += 5
        redenen.append(f"jaartal {op} gevonden, maar niet als oplevering — VERIFIEER bij de bron")
    else:
        redenen.append("opleverjaar onbekend")

    if x.get("lat"):  score += 10; redenen.append("locatie bekend (geo-schema mogelijk)")

    # Naam-kwaliteit is geen bonus maar een voorwaarde: de hele funnel hangt aan
    # de naam-zoekvraag ("Landgoed Coudewater"), dus een project dat alleen
    # "Fase 1b" of "Deelplan 3" heet is onvindbaar en verdient geen eigen pagina.
    kern = re.sub(r"\b(fase|deelplan|blok|veld|type|bouwnummer|fase)\s*[0-9a-z]*\b", "",
                  x.get("naam", ""), flags=re.I).strip(" -–—")
    if len(kern) < 5:
        score = min(score, 35)
        redenen.append("GEEN eigen zoekbare naam — niemand zoekt hierop; geen pagina")
    return min(score, 100), redenen


def mode_discover(max_pages):
    data = load()
    bekend = {x["url"] for x in data["projecten"]}
    print(f"Bekend: {len(bekend)} projecten. Lijst ophalen…")

    gevonden = []
    seen = set()
    for pg in range(1, max_pages + 1):
        html = fetch(f"{BASE}/aanbod/koop?page={pg}")
        urls = sorted(set(re.findall(r"/aanbod/koop/[a-z0-9-]+/[A-Z0-9]+-[a-z0-9-]+", html)))
        nieuw_op_pagina = [u for u in urls if u not in seen]
        if not nieuw_op_pagina:
            break
        for u in nieuw_op_pagina:
            seen.add(u)
            gevonden.append(BASE + u)
        time.sleep(DELAY)

    nieuw = [u for u in gevonden if u not in bekend]
    # Alleen bij een (bijna) volledige scan zegt "niet meer in de lijst" iets;
    # bij een partiële scan (kleine max_pages) is elk niet-gezien project ruis.
    volledig = len(gevonden) >= 0.8 * len(bekend) if bekend else True
    verdwenen = [u for u in bekend if u not in set(gevonden)] if volledig else []
    print(f"Gevonden: {len(gevonden)} | nieuw: {len(nieuw)} | "
          + (f"niet meer in de lijst: {len(verdwenen)}" if volledig
             else "partiële scan → verdwenen-check overgeslagen"))

    kandidaten = []
    for u in nieuw:
        rec = {"url": u, "plaats": plaats_uit_url(u.replace(BASE, "")), "naam": naam_uit_slug(u)}
        html = fetch(u)
        w, lat, lng, status, jaren, oplevering, opl_bron = parse_detail(html, rec["naam"])
        rec.update(woningen=w, lat=lat, lng=lng, status=status, jaren=jaren,
                   oplevering=oplevering, oplevering_bron=opl_bron)
        rec["score"], rec["redenen"] = score_project(rec)
        kandidaten.append(rec)
        data["projecten"].append(rec)
        print(f"  [{rec['score']:3}] {rec['naam']} ({rec['plaats']}) — {status}, {w} woningen")
        time.sleep(DELAY)

    kandidaten.sort(key=lambda x: -x["score"])
    save(data)

    rap = os.path.join(ROOT, "reports", "nieuwe-projecten.json")
    os.makedirs(os.path.dirname(rap), exist_ok=True)
    json.dump({"gescand": len(gevonden), "nieuw": len(nieuw),
               "volledige_scan": volledig,
               "niet_meer_in_lijst": verdwenen[:50],
               "kandidaten": kandidaten}, open(rap, "w"), ensure_ascii=False, indent=1)

    print(f"\nRapport: {rap}")
    if kandidaten:
        print("\nTop-kandidaten voor een eigen projectpagina:")
        for k in kandidaten[:10]:
            print(f"  [{k['score']:3}] {k['naam']} ({k['plaats']}) — {'; '.join(k['redenen'][:3])}")
        print("\nDrempel-advies: score >= 60 = kandidaat voor een volwaardige pagina.")
        print("Onder de 60: te weinig eigen substantie — niet genereren (dunne content).")
        print("\nLET OP: de score is een SHORTLIST, geen groen licht. Portaaldata bleek bij")
        print("Dok District (Almere) fout: 'in verkoop, 2026' terwijl de verkoop pas Q3 2026")
        print("start en de oplevering Q1 2029 is. Verifieer status en planning altijd eerst")
        print("bij primaire bronnen (ontwikkelaar, gemeente) voordat je een pagina bouwt.")
    return kandidaten


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "list": mode_list(int(sys.argv[2]) if len(sys.argv) > 2 else 60)
    elif mode == "enrich": mode_enrich(sys.argv[2])
    elif mode == "discover": mode_discover(int(sys.argv[2]) if len(sys.argv) > 2 else 60)
    else: print(__doc__)
