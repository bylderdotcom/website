#!/usr/bin/env python3
"""
Winkel-pijplijn voor de lokale-acquisitie-MVP (per stad).
  discover <stad>        Places: woonwinkels per categorie → ketens eruit → data/winkels_<stad>.json
  scrape-emails <stad>   Bezoek elke winkel-website → e-mail (mailto/contactpagina), beleefd.
  batch <stad> [n]       Toon de volgende n winkels-met-e-mail als verzendklare mail-batch (default 10).
Eigen scraper = gratis. Places-key uit ../app/.env.local.
"""
import json, os, re, subprocess, sys, time, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV = os.path.join(ROOT, "..", "app", ".env.local")
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

CATS = {"meubelwinkel": "meubelwinkel", "woonwinkel": "woonwinkel woonaccessoires",
        "vloeren": "vloerenwinkel parket laminaat", "verf": "verfwinkel", "raamdecoratie": "raamdecoratie gordijnen",
        "keuken": "keukenspeciaalzaak", "sanitair": "sanitair badkamer showroom", "verlichting": "verlichtingswinkel",
        "tegel": "tegelwinkel", "bedden": "beddenwinkel matrassen"}

# Landelijke ketens / niet-lokale-ondernemer → uit de MVP (nemen geen €79-listing).
KETENS = ("hornbach", "gamma", "praxis", "karwei", "kwantum", "ikea", "leen bakker", "jysk", "beter bed",
          "veneta", "intratuin", "woonboulevard", "bauhaus", "hubo", "multimate", "fonq", "xenos", "action",
          "carpetright", "tapijtcentrum", "mandemakers", "sanidump", "praxis", "welkoop", "boer staphorst",
          "trendhopper", "seats and sofas", "swiss sense", "auping store", "kwantum", "pamono",
          # regionale ketens / centrale-balie (converteren slecht voor lokale €79-listing)
          "jeha", "montel", "montèl", "goossens", "prominent", "sfeer.nl")

def env(k):
    for line in open(ENV):
        if line.startswith(k + "="): return line.split("=", 1)[1].strip().strip('"').strip("'")

def is_keten(naam):
    n = (naam or "").lower()
    return any(k in n for k in KETENS)

def path(stad): return os.path.join(ROOT, "data", f"winkels_{stad}.json")
def load(stad): return json.load(open(path(stad), encoding="utf-8")) if os.path.exists(path(stad)) else {"stad": stad, "winkels": []}
def save(stad, d): json.dump(d, open(path(stad), "w"), ensure_ascii=False, indent=1)


def discover(stad):
    key = env("GOOGLE_PLACES_API_KEY")
    h = {"Content-Type": "application/json", "X-Goog-Api-Key": key,
         "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.location"}
    seen = {}
    for cat, term in CATS.items():
        body = {"textQuery": f"{term} {stad}", "languageCode": "nl", "regionCode": "NL", "maxResultCount": 20}
        cmd = ["curl", "-s", "-X", "POST", "https://places.googleapis.com/v1/places:searchText"]
        for k, v in h.items(): cmd += ["-H", f"{k}: {v}"]
        cmd += ["--data", json.dumps(body)]
        res = json.loads(subprocess.run(cmd, capture_output=True, text=True, timeout=60).stdout or "{}")
        for p in res.get("places", []):
            pid = p.get("id"); naam = (p.get("displayName") or {}).get("text")
            if not pid or pid in seen or not naam or is_keten(naam): continue
            if not p.get("websiteUri"): continue          # zonder website geen e-mail te scrapen
            seen[pid] = {"naam": naam, "website": p.get("websiteUri"), "cat": cat,
                         "rating": p.get("rating"), "reviews": p.get("userRatingCount"),
                         "adres": p.get("formattedAddress"),
                         "lat": (p.get("location") or {}).get("latitude"), "lng": (p.get("location") or {}).get("longitude"),
                         "email": None, "status": "nieuw"}
        time.sleep(0.3)
    d = load(stad); d["winkels"] = list(seen.values()); save(stad, d)
    print(f"{stad}: {len(seen)} lokale woonwinkels met website (ketens gefilterd).")


JUNK = ("example.", "sentry", "wix", "@2x", ".png", ".jpg", ".gif", "your-email", "domain.com", "u003e",
        # NL/placeholder-adressen die geen echt postvak zijn
        "domein.", "gebruiker@", "voorbeeld", "naam@", "jouw@", "uw-email", "@example", "emailadres",
        "noreply", "no-reply", "no_reply", "@sentry", ".webp", ".svg", "@email.com", "test@")
def email_uit(html):
    cand = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", html or "")
    cand = [c for c in cand if not any(j in c.lower() for j in JUNK) and len(c) < 60]
    if not cand: return None
    for pre in ("info@", "contact@", "welkom@", "mail@", "verkoop@", "winkel@"):  # role-based eerst
        for c in cand:
            if c.lower().startswith(pre): return c.lower()
    return cand[0].lower()

def fetch(url):
    try:
        r = subprocess.run(["curl", "-sL", "-m", "15", "-A", UA, url], capture_output=True, text=True, timeout=20)
        return r.stdout or ""
    except Exception:
        return ""

def scrape_emails(stad):
    d = load(stad)
    todo = [w for w in d["winkels"] if not w.get("email") and w.get("website")]
    print(f"{stad}: e-mails scrapen voor {len(todo)} winkels…")
    found = 0
    for i, w in enumerate(todo):
        base = w["website"].rstrip("/")
        em = email_uit(fetch(base))
        if not em:
            for p in ("/contact", "/contact.html", "/over-ons", "/contact-ons"):
                em = email_uit(fetch(base + p))
                if em: break
        w["email"] = em
        if em: found += 1
        if (i + 1) % 20 == 0: print(f"  …{i+1}/{len(todo)}, {found} adressen")
        time.sleep(1)
    save(stad, d)
    tot = len(d["winkels"]); met = sum(1 for w in d["winkels"] if w.get("email"))
    print(f"Klaar: {met}/{tot} winkels met e-mail ({100*met//tot if tot else 0}%).")


def batch(stad, n=10):
    d = load(stad)
    klaar = [w for w in d["winkels"] if w.get("email") and w.get("status") != "gemaild" and not is_keten(w["naam"])]
    print(f"{stad}: {len(klaar)} winkels klaar om te mailen. Volgende {min(n,len(klaar))}:")
    for w in klaar[:n]:
        print(f"  {w['email']:34} {w['naam'][:38]:38} ★{w.get('rating')} [{w['cat']}]")


def _afstand(la, lo, lb, mb):
    R = 6371; p = math.radians
    dla, dlo = p(lb - la), p(mb - lo)
    x = math.sin(dla / 2) ** 2 + math.cos(p(la)) * math.cos(p(lb)) * math.sin(dlo / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))

DEELNEMEN_URL = "https://app.bylder.com/deelnemen"

def _projecten_zin(stad):
    """Noem de 3 grootste projecten (op #woningen) als één zin — zelfde mail voor alle winkels."""
    pj = os.path.join(ROOT, "data", "nieuwbouwprojecten.json")
    alle = [p for p in json.load(open(pj, encoding="utf-8"))["projecten"]
            if p.get("plaats") == stad and p.get("woningen")] if os.path.exists(pj) else []
    top = sorted(alle, key=lambda p: -(p.get("woningen") or 0))[:3]
    delen = [f"{p['naam']} ({p['woningen']} woningen)" for p in top]
    if len(delen) >= 2:
        return ", ".join(delen[:-1]) + " en " + delen[-1]
    return delen[0] if delen else "meerdere projecten"

def mails(stad, n=10):
    """Eén gedeelde mail (meerdere projecten + /deelnemen-link) + de adreslijst voor de volgende n winkels.
    EERLIJK: geen 'kopers aangemeld'-claim (projecten van nieuwbouw.nl) — wel het publieke #woningen-signaal."""
    d = load(stad)
    stad_l = stad.capitalize()
    klaar = [w for w in d["winkels"] if w.get("email") and w.get("status") != "gemaild" and not is_keten(w["naam"])][:n]
    projzin = _projecten_zin(stad)

    print("=" * 72)
    print("DEZELFDE MAIL NAAR ALLE ONDERSTAANDE WINKELS")
    print("=" * 72)
    print(f"ONDERWERP: Nieuwe bewoners in {stad_l} zoeken lokale winkels — doe mee")
    print(f"""
Beste heer/mevrouw,

In {stad_l} worden meerdere nieuwbouwprojecten gebouwd — waaronder {projzin}.
Honderden nieuwe bewoners gaan binnenkort hun woning inrichten.

Via Bylder.com brengen wij die kopers in contact met lokale winkels. Vanaf
€79 per jaar (excl. btw) staat u erbij als aanbevolen lokale winkel en kunt u
hen een nieuwbouwkorting bieden — geen abonnement. Uw korting blijft een jaar
geldig na activatie.

Lees de voordelen en meld u direct aan: {DEELNEMEN_URL}

Met vriendelijke groet,
Daniël Paaij
Bylder.com""")
    print("\n" + "=" * 72)
    print(f"VERSTUUR NAAR DEZE {len(klaar)} ADRESSEN (één voor één):")
    print("=" * 72)
    for w in klaar:
        print(f"  {w['email']:34} {w['naam'][:40]}")
        w["status"] = "gemaild"
    save(stad, d)
    rest = sum(1 for w in d["winkels"] if w.get("email") and w.get("status") != "gemaild" and not is_keten(w["naam"]))
    print("=" * 72)
    print(f"\n{len(klaar)} gemarkeerd als verzonden. Nog {rest} winkels in de wachtrij voor volgende rondes.")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    stad = sys.argv[2] if len(sys.argv) > 2 else ""
    if mode == "discover": discover(stad)
    elif mode == "scrape-emails": scrape_emails(stad)
    elif mode == "batch": batch(stad, int(sys.argv[3]) if len(sys.argv) > 3 else 10)
    elif mode == "mails": mails(stad, int(sys.argv[3]) if len(sys.argv) > 3 else 10)
    else: print(__doc__)
