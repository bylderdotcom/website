#!/usr/bin/env python3
"""
Vakbedrijven-datapijplijn (KvK-VRIJ) voor de vakbedrijven-laag.

Modes:
  seed-osm <vak>            Haal échte bedrijven uit OpenStreetMap (gratis, geen key) en upsert.
  discover-places <vak>     Ontdek via Google Places API (vereist GOOGLE_PLACES_API_KEY) per stad.
  export                    Haal alles uit Supabase en schrijf data/vakbedrijven.json (door de SEO-generator gelezen).

Bron van waarheid = Supabase-tabel public.vakbedrijven. HTTP via curl (stabiele system-certs).
Creds uit ../app/.env.local. GEEN KvK-data.
"""
import json, os, re, subprocess, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = os.path.join(ROOT, "..", "app", ".env.local")

# OSM craft-tags per vak (alleen vakken die OSM kent). Places dekt de rest.
OSM_CRAFT = {
    "stukadoor": "plasterer", "schilder": "painter", "elektricien": "electrician",
    "loodgieter": "plumber", "tegelzetter": "tiler", "timmerman": "carpenter",
    "dakdekker": "roofer", "metselaar": "bricklayer", "hovenier": "gardener",
}
PILOT_STEDEN = ["amsterdam","rotterdam","den haag","utrecht","eindhoven","groningen","tilburg",
                "almere","breda","nijmegen","apeldoorn","haarlem","arnhem","amersfoort","zwolle"]


def env(key):
    if not os.path.exists(ENV): return None
    for line in open(ENV):
        if line.startswith(key + "="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return re.sub(r"-+", "-", s)


def curl_json(method, url, headers, body=None):
    cmd = ["curl", "-s", "-X", method, url]
    for k, v in headers.items():
        cmd += ["-H", f"{k}: {v}"]
    if body is not None:
        cmd += ["--data", json.dumps(body)]
    out = subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout
    try:
        return json.loads(out) if out.strip() else None
    except json.JSONDecodeError:
        return {"_raw": out[:400]}


def supa_headers(content=True):
    key = env("SUPABASE_SERVICE_ROLE_KEY")
    h = {"apikey": key, "Authorization": f"Bearer {key}"}
    if content: h["Content-Type"] = "application/json"
    return h


def upsert(records):
    if not records:
        print("  (geen records)"); return
    url = env("NEXT_PUBLIC_SUPABASE_URL").rstrip("/") + "/rest/v1/vakbedrijven?on_conflict=slug"
    h = supa_headers(); h["Prefer"] = "resolution=merge-duplicates,return=minimal"
    cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", url]
    for k, v in h.items(): cmd += ["-H", f"{k}: {v}"]
    cmd += ["--data", json.dumps(records)]
    code = subprocess.run(cmd, capture_output=True, text=True, timeout=120).stdout
    print(f"  upsert {len(records)} records → http={code}")


def fetch_all():
    url = env("NEXT_PUBLIC_SUPABASE_URL").rstrip("/") + "/rest/v1/vakbedrijven?select=*&opt_out=eq.false&order=vak,stad"
    return curl_json("GET", url, supa_headers(content=False)) or []


# ---------- OSM ----------
def seed_osm(vak):
    craft = OSM_CRAFT.get(vak)
    if not craft:
        print(f"Geen OSM craft-tag voor '{vak}' — gebruik discover-places."); return
    q = f'[out:json][timeout:90];area["ISO3166-1"="NL"][admin_level=2]->.nl;(node["craft"="{craft}"](area.nl);way["craft"="{craft}"](area.nl););out center tags 400;'
    res = curl_json("POST", "https://overpass-api.de/api/interpreter", {"Content-Type": "text/plain"}, None) if False else None
    # POST met body via curl --data
    out = subprocess.run(["curl", "-s", "-m", "120", "-G", "https://overpass-api.de/api/interpreter",
                          "--data-urlencode", "data=" + q], capture_output=True, text=True, timeout=140).stdout
    data = json.loads(out)
    recs = []
    for e in data.get("elements", []):
        t = e.get("tags", {})
        naam = t.get("name")
        if not naam: continue
        stad = t.get("addr:city") or t.get("addr:place")
        web = t.get("website") or t.get("contact:website")
        recs.append({
            "slug": f"{vak}-{slugify(naam)}",
            "naam": naam, "vak": vak,
            "stad": stad.title() if stad else None,
            "website": web,
            "telefoon": t.get("phone") or t.get("contact:phone"),
            "email": t.get("email") or t.get("contact:email"),
            "lat": e.get("lat") or (e.get("center") or {}).get("lat"),
            "lng": e.get("lon") or (e.get("center") or {}).get("lon"),
            "status": "unclaimed", "bron": "osm",
        })
    # dedup op slug
    seen, uniq = set(), []
    for r in recs:
        if r["slug"] in seen: continue
        seen.add(r["slug"]); uniq.append(r)
    print(f"OSM '{craft}': {len(uniq)} bedrijven met naam")
    upsert(uniq)


# ---------- Google Places ----------
def discover_places(vak):
    key = env("GOOGLE_PLACES_API_KEY")
    if not key:
        print("GOOGLE_PLACES_API_KEY ontbreekt (zet 'm in ../app/.env.local). Discovery overgeslagen."); return
    from urllib.parse import quote
    total = []
    for stad in PILOT_STEDEN:
        # Places Text Search (New): POST places:searchText
        body = {"textQuery": f"{vak} {stad}", "languageCode": "nl", "regionCode": "NL", "maxResultCount": 20}
        h = {"Content-Type": "application/json", "X-Goog-Api-Key": key,
             "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.location"}
        res = curl_json("POST", "https://places.googleapis.com/v1/places:searchText", h, body)
        for p in (res or {}).get("places", []):
            naam = (p.get("displayName") or {}).get("text")
            if not naam: continue
            total.append({
                "slug": f"{vak}-{slugify(naam)}-{slugify(stad)}",
                "naam": naam, "vak": vak, "stad": stad.title(),
                "website": p.get("websiteUri"), "telefoon": p.get("nationalPhoneNumber"),
                "google_place_id": p.get("id"),
                "google_rating": p.get("rating"), "google_reviews": p.get("userRatingCount"),
                "lat": (p.get("location") or {}).get("latitude"),
                "lng": (p.get("location") or {}).get("longitude"),
                "status": "unclaimed", "bron": "places",
            })
    print(f"Places '{vak}': {len(total)} resultaten over {len(PILOT_STEDEN)} steden")
    upsert(total)


# ---------- Export ----------
def export():
    rows = fetch_all()
    if not isinstance(rows, list):
        print("Export-fout:", rows); return
    path = os.path.join(ROOT, "data", "vakbedrijven.json")
    payload = {"_doc": "Geëxporteerd uit Supabase public.vakbedrijven (KvK-vrij). Bron per record in 'bron'. OSM-data © OpenStreetMap-bijdragers (ODbL).",
               "vakbedrijven": rows}
    json.dump(payload, open(path, "w"), ensure_ascii=False, indent=1)
    print(f"Export: {len(rows)} bedrijven → data/vakbedrijven.json")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    arg = sys.argv[2] if len(sys.argv) > 2 else "stukadoor"
    if mode == "seed-osm": seed_osm(arg)
    elif mode == "discover-places": discover_places(arg)
    elif mode == "export": export()
    else:
        print(__doc__)
