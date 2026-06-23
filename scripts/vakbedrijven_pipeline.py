#!/usr/bin/env python3
"""
Vakbedrijven-datapijplijn (KvK-VRIJ) voor de vakbedrijven-laag.

Modes:
  seed-osm <vak>            Haal échte bedrijven uit OpenStreetMap (gratis, geen key) en upsert.
  discover-places <vak> [n] Ontdek via Google Places API (betaald per call) per stad; n = pagina's/plaats (default 1, kostenbewust).
  clean-data                Schoon de bron op: postcode/huisnummer uit plaatsnaam + platforms/opleidingen op opt_out.
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


def plaatsen_voor(vak):
    """Landelijke plaatslijst = de bestaande offerte-check/[vak]/[stad]-slugs (±281).
    Fallback: de 15 pilot-steden."""
    d = os.path.join(ROOT, "offerte-check", vak)
    if os.path.isdir(d):
        slugs = [s for s in os.listdir(d) if os.path.isdir(os.path.join(d, s))]
        return sorted(slugs)
    return [s.replace(" ", "-") for s in PILOT_STEDEN]


def plaatsnaam(slug):
    return " ".join(w.capitalize() for w in slug.split("-")).replace("'S-", "'s-")


def stad_uit_adres(adres, fallback):
    """Echte plaats uit een NL Places-adres: '... , 1234 AB Plaatsnaam, Netherlands'."""
    if not adres: return fallback
    parts = [x.strip() for x in adres.split(",") if x.strip()]
    if parts and parts[-1].lower() in ("netherlands", "nederland"): parts = parts[:-1]
    if not parts: return fallback
    # NL-postcode strippen: zowel '1234 AB Plaats' als het bare '1234 Plaats'.
    m = re.match(r"^\d{4}\s*(?:[A-Za-z]{2}\s+)?(.+)$", parts[-1])
    return ((m.group(1) if m else parts[-1]).strip() or fallback)


def zoekterm_voor(vak):
    """Natuurlijke zoekterm uit de taxonomie (kvk_zoekterm), bv. 'schildersbedrijf'."""
    try:
        tax = json.load(open(os.path.join(ROOT, "data", "vakgebieden.json"), encoding="utf-8"))
        for v in tax.get("vakgebieden", []):
            if v["slug"] == vak:
                return v.get("kvk_zoekterm") or vak
    except Exception:
        pass
    return vak


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
    base = env("NEXT_PUBLIC_SUPABASE_URL").rstrip("/") + "/rest/v1/vakbedrijven?select=*&opt_out=eq.false&order=vak,stad"
    rows, page, size = [], 0, 1000
    while True:                                  # PostgREST capt op 1000/req → pagineren
        chunk = curl_json("GET", f"{base}&limit={size}&offset={page * size}", supa_headers(content=False))
        if not isinstance(chunk, list) or not chunk: break
        rows += chunk
        if len(chunk) < size: break
        page += 1
    return rows


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
def discover_places(vak, max_pages=1):
    """Ontdek bedrijven via Places searchText. Kosten-bewust:
    - Trimme field-mask (geen priceLevel/googleMapsUri/editorialSummary: leeg voor vakbedrijven +
      duurdere SKU; Maps-deeplink bouwen we gratis uit place_id).
    - max_pages bepaalt het aantal betaalde verzoeken per plaats (1 = 20 resultaten, goedkoopst).
    - Telt en logt het totale aantal API-calls zodat de kosten zichtbaar zijn."""
    import time
    key = env("GOOGLE_PLACES_API_KEY")
    if not key:
        print("GOOGLE_PLACES_API_KEY ontbreekt (zet 'm in ../app/.env.local). Discovery overgeslagen."); return
    term = zoekterm_voor(vak)
    plaatsen = plaatsen_voor(vak)
    h = {"Content-Type": "application/json", "X-Goog-Api-Key": key,
         "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.location,nextPageToken"}
    by_place = {}   # dedup landelijk op place_id
    calls = 0
    overgeslagen = []
    abort = False
    TRANSIENT = {429, 500, 502, 503, "UNAVAILABLE", "RESOURCE_EXHAUSTED", "INTERNAL", "DEADLINE_EXCEEDED", "ABORTED"}
    print(f"Places '{term}' over {len(plaatsen)} plaatsen (max {max_pages} pagina/plaats)…")
    for i, slug in enumerate(plaatsen):
        if abort: break
        stad = plaatsnaam(slug)
        token = None
        for _page in range(max_pages):
            body = {"textQuery": f"{term} {stad}", "languageCode": "nl", "regionCode": "NL", "maxResultCount": 20}
            if token: body["pageToken"] = token
            # retry op transiente fouten; persistente fout (auth/quota/veldmask) = harde stop
            res = {}
            for attempt in range(4):
                res = curl_json("POST", "https://places.googleapis.com/v1/places:searchText", h, body) or {}
                calls += 1
                err = res.get("error")
                if not err: break
                if err.get("code") in TRANSIENT or err.get("status") in TRANSIENT:
                    time.sleep(2 * (attempt + 1)); continue          # backoff en opnieuw
                print("  Persistente API-fout (stop):", json.dumps(err)[:200]); abort = True; break
            if abort: break
            if res.get("error"):
                overgeslagen.append(stad); break                     # transient bleef → stad overslaan
            for p in res.get("places", []):
                pid = p.get("id"); naam = (p.get("displayName") or {}).get("text")
                if not pid or not naam or pid in by_place: continue
                by_place[pid] = {
                    "slug": f"{vak}-{slugify(naam)}-{pid[-6:].lower()}",
                    "naam": naam, "vak": vak,
                    "stad": stad_uit_adres(p.get("formattedAddress"), stad),
                    "website": p.get("websiteUri"), "telefoon": p.get("nationalPhoneNumber"),
                    "google_place_id": pid,
                    "google_rating": p.get("rating"), "google_reviews": p.get("userRatingCount"),
                    "lat": (p.get("location") or {}).get("latitude"),
                    "lng": (p.get("location") or {}).get("longitude"),
                    "status": "unclaimed", "bron": "places",
                }
            token = res.get("nextPageToken")
            if not token: break
            time.sleep(2)                            # pageToken even laten activeren
        if (i + 1) % 25 == 0:
            print(f"  …{i+1}/{len(plaatsen)} plaatsen, {len(by_place)} bedrijven, {calls} API-calls")
    recs = list(by_place.values())
    status = "AFGEBROKEN (persistente fout)" if abort else "klaar"
    print(f"Places '{vak}': {len(recs)} unieke bedrijven in {calls} API-calls — {status}")
    if overgeslagen:
        print(f"  {len(overgeslagen)} plaatsen overgeslagen na transient-fouten: {', '.join(overgeslagen[:15])}{'…' if len(overgeslagen) > 15 else ''}")
    for j in range(0, len(recs), 500):               # upsert in batches
        upsert(recs[j:j + 500])


# ---------- Data-opschoning ----------
UITGESLOTEN = ("banenplatform", "platform van nederland", "vacature", "uitzend", "detachering",
               "werving", "werktalent", "vakopleiding", "academie", "opleidingscentrum", "vergelijk offertes")

def _schoon_stad(s):
    if not s: return s
    s = s.strip()
    m = re.match(r"^\d+\s+(?:[A-Za-z]{2}\s+)?(.+)$", s)
    if m: s = m.group(1).strip()
    if not s or re.fullmatch(r"[A-Za-z]{1,2}", s): return None
    return s


def _patch(slug, body):
    url = env("NEXT_PUBLIC_SUPABASE_URL").rstrip("/") + f"/rest/v1/vakbedrijven?slug=eq.{slug}"
    h = supa_headers(); h["Prefer"] = "return=minimal"
    cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", "PATCH", url]
    for k, v in h.items(): cmd += ["-H", f"{k}: {v}"]
    cmd += ["--data", json.dumps(body)]
    return subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout


def clean_data():
    """Sync de pagina-opschoning naar de bron: postcode uit stad strippen + platforms op opt_out."""
    rows = fetch_all()
    if not isinstance(rows, list):
        print("Fout bij ophalen:", rows); return
    n_stad = n_plat = 0
    for b in rows:
        naam = (b.get("naam") or "").lower()
        if any(k in naam for k in UITGESLOTEN):
            print(f"  opt_out: {b['naam']}  → http={_patch(b['slug'], {'opt_out': True})}"); n_plat += 1
            continue
        stad = b.get("stad")
        if stad and re.match(r"^\d", stad):
            schoon = _schoon_stad(stad)
            print(f"  stad: {stad!r} → {schoon!r}  http={_patch(b['slug'], {'stad': schoon})}"); n_stad += 1
    print(f"Opgeschoond: {n_stad} plaatsnamen + {n_plat} platforms op opt_out.")


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
    elif mode == "discover-places": discover_places(arg, int(sys.argv[3]) if len(sys.argv) > 3 else 1)
    elif mode == "clean-data": clean_data()
    elif mode == "export": export()
    else:
        print(__doc__)
