#!/usr/bin/env python3
"""Legt vast wát een bedrijf is, volgens Google, en verbindt het aan projecten.

HET PROBLEEM DAT DIT OPLOST
---------------------------
Onze data heeft een handgemaakt `vak`/`cat`-veld. Daardoor stond HORNBACH als
badkamerspecialist op een projectpagina, een PLUS-supermarkt als verlichtingszaak
en een feestwinkel als woonwinkel — direct onder de zin dat wij op passendheid
rangschikken. De reflex is een zwarte lijst, maar HORNBACH weghalen leverde
BAUHAUS op. Dat is dweilen.

Google Places geeft per bedrijf een `types`-lijst: `hardware_store`,
`supermarket`, `plumber`, `electrician`. Daarmee wordt de vraag niet meer "staat
deze keten op mijn lijstje" maar "past dit type bij dit vak". Dat is een regel die
zichzelf onderhoudt.

WAT HET WEGSCHRIJFT
-------------------
data/plaatsen/taxonomie.json   place_id → types, primaryType, status, naam
data/plaatsen/verbindingen.json  project-slug → bedrijven binnen straal, met vak
                                 en afstand; plus hetzelfde per gemeente

Die verbindingen zijn het punt. Nu rekent de paginagenerator bij elke run opnieuw
de afstand uit tussen elk project en 25.707 bedrijven — onzichtbaar en niet na te
kijken. Een vastgelegde tabel kun je inzien en corrigeren, en zo'n correctie
blijft staan.

BEPERKING, EERLIJK
------------------
Dit ruimt twee soorten fouten op: verkeerde categorie en verouderde koppeling. Het
lost geen oordeel op. Een zaak met 4,9 sterren kan nog steeds de verkeerde zijn
voor dít werk, en Google weet niet wie goed is in nieuwbouwoplevering.

REIKWIJDTE
----------
Bewust beperkt tot de vier steden met een Auping Store (besluit Daniel, 4 aug
2026): Rotterdam, Den Haag, Zoetermeer, Leidschendam. Daar staan 700 vakbedrijven,
waarvan 686 met place_id — ongeveer $12 aan Place Details.

Gebruik:
    export GOOGLE_PLACES_API_KEY=...
    python3 scripts/plaatsen_taxonomie.py --raming    # alleen tellen en kosten
    python3 scripts/plaatsen_taxonomie.py --vakbedrijven
    python3 scripts/plaatsen_taxonomie.py --winkels
    python3 scripts/plaatsen_taxonomie.py --verbind   # geen API-verkeer
"""
import json, os, sys, time, math, subprocess, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UIT = os.path.join(ROOT, "data", "plaatsen")
TAX = os.path.join(UIT, "taxonomie.json")
VERB = os.path.join(UIT, "verbindingen.json")

# Vier steden met een Auping Store. Bewust klein gehouden tot dit zich bewijst.
STEDEN = {"rotterdam": "Rotterdam", "s-gravenhage": "Den Haag",
          "zoetermeer": "Zoetermeer", "leidschendam-voorburg": "Leidschendam"}
ALIAS = {"den-haag": "s-gravenhage", "leidschendam": "leidschendam-voorburg",
         "voorburg": "leidschendam-voorburg", "rijswijk-zh": "rijswijk-zh"}

# Wat Google teruggeeft, en of dat bij het vak past dat wij claimen. Alles wat
# hier niet in staat wordt gemeld in plaats van stilzwijgend geaccepteerd.
PAST_BIJ = {
    "loodgieter":    {"plumber"},
    "elektricien":   {"electrician"},
    "dakkapel":      {"roofing_contractor", "general_contractor", "carpenter"},
    "dakdekker":     {"roofing_contractor"},
    "stukadoor":     {"painter", "general_contractor"},
    "schilder":      {"painter"},
    "tegelzetter":   {"general_contractor", "flooring_contractor"},
    "badkamer":      {"plumber", "bathroom_remodeler", "home_improvement_store"},
    "keuken":        {"kitchen_furniture_store", "furniture_store", "home_goods_store"},
    "vloeren":       {"flooring_store", "flooring_contractor", "carpet_store"},
    "gietvloer":     {"flooring_contractor", "flooring_store"},
    "aannemer":      {"general_contractor", "contractor"},
    "timmerman":     {"carpenter", "general_contractor"},
    "hovenier":      {"landscaper", "gardener", "landscape_designer"},
    "raamdecoratie": {"window_treatment_store", "curtain_store", "home_goods_store"},
    "muurdecoratie": {"paint_store", "wallpaper_store", "home_goods_store"},
    "verlichting":   {"lighting_store", "home_goods_store"},
    "meubelwinkel":  {"furniture_store", "home_goods_store"},
    "woonwinkel":    {"furniture_store", "home_goods_store", "interior_designer"},
    "bedden":        {"bed_shop", "mattress_store", "furniture_store"},
    "sanitair":      {"plumbing_supply_store", "bathroom_remodeler", "plumber"},
}
# De regel moet per soort verschillen. HORNBACH is een home_goods_store: fout als
# badkamerspecialist, maar datzelfde type is voor een meubelwinkel juist correct.
# Een vakbedrijf levert een dienst en hoort dus nooit een winkeltype te hebben.
NOOIT_ALTIJD = {"supermarket", "grocery_store", "convenience_store", "gas_station",
                "restaurant", "cafe", "bar", "lodging", "car_dealer", "pharmacy",
                "bank", "shopping_mall"}
# Twijfelgevallen: alleen fout als het het hóófdtype is. HAY Rotterdam draagt
# gift_shop als bijtype maar is een echte designmeubelzaak; een winkelcentrum
# draagt shopping_mall als hoofdtype en is geen winkel.
NOOIT_ALS_HOOFDTYPE = {"gift_shop", "department_store", "discount_store",
                       "party_store", "variety_store", "book_store"}
# Alleen voor vakbedrijven: een dienstverlener met een winkeltype als hoofdtype is
# een keten die per ongeluk in de vakbedrijvenlijst zit.
WINKELTYPES = {"hardware_store", "home_improvement_store", "home_goods_store",
               "furniture_store", "garden_center", "wholesaler", "paint_store",
               "building_materials_store", "bed_shop", "mattress_store",
               "lighting_store", "kitchen_furniture_store", "flooring_store"}


def deugt(v, soort):
    """Of dit bedrijf mag meedoen. Geeft (ja/nee, reden) terug."""
    t = set(v.get("types") or [])
    if v.get("status") and v["status"] != "OPERATIONAL":
        return False, f"status {v['status']}"
    if t & NOOIT_ALTIJD:
        return False, "type " + ", ".join(sorted(t & NOOIT_ALTIJD))
    if v.get("primair") in NOOIT_ALS_HOOFDTYPE:
        return False, f"hoofdtype {v['primair']}"
    if soort == "vakbedrijf" and (v.get("primair") in WINKELTYPES):
        return False, f"winkeltype {v['primair']} bij een vakbedrijf"
    return True, ""


def km(a, b, c, d):
    R = 6371; p = math.pi / 180
    return 2 * R * math.asin(math.sqrt(math.sin((c - a) * p / 2) ** 2 +
           math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2))


def stad_norm(s):
    s = (s or "").lower().replace("'", "").replace(" ", "-")
    return ALIAS.get(s, s)


def sleutel():
    k = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not k:
        sys.exit("GOOGLE_PLACES_API_KEY ontbreekt. export GOOGLE_PLACES_API_KEY=... "
                 "en draai opnieuw. Zonder sleutel doet dit script niets.")
    return k


def laad_vakbedrijven():
    d = json.load(open(os.path.join(ROOT, "data", "vakbedrijven.json"), encoding="utf8"))
    v = d if isinstance(d, list) else (d.get("vakbedrijven") or list(d.values())[0])
    return [b for b in v if stad_norm(b.get("stad")) in STEDEN]


def laad_winkels():
    p = os.path.join(ROOT, "data", "winkels_rotterdam-regio.json")
    if not os.path.exists(p):
        return []
    d = json.load(open(p, encoding="utf8"))
    w = d["winkels"] if isinstance(d, dict) else d
    return [x for x in w if stad_norm(x.get("zoekplaats")) in STEDEN]


def details(pid, key):
    r = subprocess.run(["curl", "-s", "-m", "20",
                        f"https://places.googleapis.com/v1/places/{pid}",
                        "-H", f"X-Goog-Api-Key: {key}",
                        "-H", "X-Goog-FieldMask: id,displayName,types,primaryType,"
                              "businessStatus,rating,userRatingCount,location"],
                       capture_output=True, text=True)
    try:
        return json.loads(r.stdout)
    except Exception:
        return {}


def zoek(naam, plaats, key):
    body = json.dumps({"textQuery": f"{naam} {plaats}", "maxResultCount": 1,
                       "languageCode": "nl", "regionCode": "NL"})
    r = subprocess.run(["curl", "-s", "-m", "20", "-X", "POST",
                        "https://places.googleapis.com/v1/places:searchText",
                        "-H", f"X-Goog-Api-Key: {key}",
                        "-H", "Content-Type: application/json",
                        "-H", "X-Goog-FieldMask: places.id,places.displayName,places.types,"
                              "places.primaryType,places.businessStatus,places.location",
                        "-d", body], capture_output=True, text=True)
    try:
        p = json.loads(r.stdout).get("places") or []
        return p[0] if p else {}
    except Exception:
        return {}


def bewaar(tax):
    os.makedirs(UIT, exist_ok=True)
    json.dump(tax, open(TAX, "w", encoding="utf8"), ensure_ascii=False, indent=1)


def raming():
    vb, wk = laad_vakbedrijven(), laad_winkels()
    met_id = sum(1 for b in vb if b.get("google_place_id"))
    per = collections.Counter(STEDEN[stad_norm(b.get("stad"))] for b in vb)
    print("Reikwijdte: " + ", ".join(STEDEN.values()))
    for k, n in per.most_common():
        print(f"  {k:<14} {n} vakbedrijven")
    print(f"\n  {len(vb)} vakbedrijven, {met_id} met place_id → Place Details")
    print(f"  {len(wk)} winkels zonder place_id → Text Search")
    print(f"\nGeschatte kosten: ${met_id * 0.017 + len(wk) * 0.032:.2f} "
          f"(Details ~$17/1000, Text Search ~$32/1000)")
    print("Dit is een schatting op de openbare tarieven; controleer je eigen prijsafspraak.")


def haal(soort):
    key = sleutel()
    tax = json.load(open(TAX, encoding="utf8")) if os.path.exists(TAX) else {}
    rijen = laad_vakbedrijven() if soort == "vakbedrijven" else laad_winkels()
    nieuw = fout = 0
    for i, b in enumerate(rijen, 1):
        pid = b.get("google_place_id")
        eigen = pid or f"naam:{b.get('naam')}|{b.get('zoekplaats') or b.get('stad')}"
        if eigen in tax:
            continue
        d = details(pid, key) if pid else zoek(b.get("naam"), b.get("zoekplaats") or b.get("stad"), key)
        if not d.get("id"):
            tax[eigen] = {"fout": "niet gevonden", "naam": b.get("naam")}
            fout += 1
        else:
            tax[eigen] = {"id": d["id"], "naam": (d.get("displayName") or {}).get("text"),
                          "types": d.get("types") or [], "primair": d.get("primaryType"),
                          "status": d.get("businessStatus"),
                          "ons_label": b.get("vak") or b.get("cat"), "soort": "vakbedrijf" if soort == "vakbedrijven" else "winkel"}
            nieuw += 1
        if i % 25 == 0:
            bewaar(tax)
            print(f"  … {i}/{len(rijen)}", flush=True)
        time.sleep(0.12)
    bewaar(tax)
    print(f"KLAAR — {nieuw} opgehaald, {fout} niet gevonden, {len(tax)} in de taxonomie")
    rapport(tax)


def rapport(tax=None):
    tax = tax or json.load(open(TAX, encoding="utf8"))
    mis = collections.Counter(); verboden = []
    for k, v in tax.items():
        if v.get("fout"):
            continue
        t = set(v.get("types") or [])
        label = v.get("ons_label")
        ok, reden = deugt(v, v.get("soort") or "winkel")
        if not ok:
            verboden.append((v["naam"], label, [reden]))
        elif label in PAST_BIJ and not (t & PAST_BIJ[label]):
            mis[label] += 1
    print(f"\n{len(verboden)} bedrijven met een type dat hier nooit hoort:")
    for n, l, t in verboden[:12]:
        print(f"    {str(n)[:40]:<42} wij: {l:<14} Google: {', '.join(t)}")
    if mis:
        print(f"\nLabels waar ons vak niet matcht met Google's type:")
        for l, n in mis.most_common(10):
            print(f"    {l:<16} {n}x")


def verbind():
    """Projecten aan bedrijven knopen, één keer, na te kijken. Geen API-verkeer."""
    tax = json.load(open(TAX, encoding="utf8"))
    goed = {v["id"]: v for v in tax.values()
            if v.get("id") and deugt(v, "vakbedrijf")[0]}
    prj = json.load(open(os.path.join(ROOT, "data", "nieuwbouwprojecten.json"),
                         encoding="utf8"))["projecten"]
    vb = {b.get("google_place_id"): b for b in laad_vakbedrijven()}
    uit = {}
    for p in prj:
        if stad_norm(p.get("plaats")) not in STEDEN or not (p.get("lat") and p.get("lng")):
            continue
        buren = []
        for pid, b in vb.items():
            if pid not in goed or not (b.get("lat") and b.get("lng")):
                continue
            d = km(float(p["lat"]), float(p["lng"]), float(b["lat"]), float(b["lng"]))
            if d <= 12:
                buren.append({"place_id": pid, "naam": b.get("naam"), "vak": b.get("vak"),
                              "km": round(d, 1), "types": goed[pid]["types"][:3]})
        buren.sort(key=lambda x: x["km"])
        uit[p["naam"]] = {"plaats": p["plaats"], "bedrijven": buren[:40]}
    os.makedirs(UIT, exist_ok=True)
    json.dump(uit, open(VERB, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    n = sum(len(v["bedrijven"]) for v in uit.values())
    print(f"{len(uit)} projecten verbonden aan {n} bedrijfsrelaties → {VERB}")


if __name__ == "__main__":
    a = sys.argv[1:] or ["--raming"]
    if "--raming" in a:
        raming()
    elif "--vakbedrijven" in a:
        haal("vakbedrijven")
    elif "--winkels" in a:
        haal("winkels")
    elif "--verbind" in a:
        verbind()
    elif "--rapport" in a:
        rapport()
    else:
        sys.exit(__doc__)
