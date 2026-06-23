#!/usr/bin/env python3
"""
Beleefde, laag-volume scraper voor nieuwbouw.nl — projectdata voor de lokale-acquisitie-MVP.
Publieke projectdata (naam, plaats, #woningen, coords, status) met bronvermelding.
robots.txt staat /aanbod/koop toe; ToS-toets hoort bij grote uitrol (zie geheugen).

Modes:
  list [max_pages]     Pagineer /aanbod/koop → data/nieuwbouwprojecten.json (url, plaats, naam).
  enrich <gemeente>    Detail-fetch projecten in die gemeente → +woningen +lat/lng +status.
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

def parse_detail(html, naam=""):
    woningen = woningen_uit(eigen_beschrijving(html)) or woningen_uit(naam)   # eigen tekst, anders naam
    geo = re.search(r'"@type":"GeoCoordinates","latitude":(-?[\d.]+),"longitude":(-?[\d.]+)', html)
    lat = float(geo.group(1)) if geo else None
    lng = float(geo.group(2)) if geo else None
    status = None
    for s in ("In verkoop", "In aanbouw", "Toekomstig", "Verkocht"):
        if s.lower() in html.lower(): status = s; break
    # actualiteit: kwartaal-jaren, anders bare jaar nabij oplevering/verwacht/medio/eind
    jaren = sorted({int(y) for y in re.findall(r"Q[1-4]\s*(20[0-9]{2})", html)})
    if not jaren:
        jaren = sorted({int(y) for y in re.findall(r"(?:oplevering|verwacht|medio|eind|begin)[^<]{0,20}?(20[2-9][0-9])", html, re.I)})
    oplevering = max(jaren) if jaren else None
    return woningen, lat, lng, status, jaren, oplevering


def mode_enrich(gemeente):
    data = load()
    doel = [x for x in data["projecten"] if x["plaats"] == gemeente]
    if not doel:
        print(f"Geen projecten in '{gemeente}'. Draai eerst 'list'."); return
    print(f"{len(doel)} projecten in {gemeente} verrijken…")
    for x in doel:
        html = fetch(x["url"])
        w, lat, lng, status, jaren, oplevering = parse_detail(html, x.get("naam", ""))
        x.update(woningen=w, lat=lat, lng=lng, status=status, jaren=jaren, oplevering=oplevering)
        print(f"  {x['naam']}: {w} woningen, {status}, oplevering≈{oplevering}, ({lat},{lng})")
        time.sleep(DELAY)
    save(data)
    print("Klaar.")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "list": mode_list(int(sys.argv[2]) if len(sys.argv) > 2 else 60)
    elif mode == "enrich": mode_enrich(sys.argv[2])
    else: print(__doc__)
