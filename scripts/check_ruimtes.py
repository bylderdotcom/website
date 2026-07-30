#!/usr/bin/env python3
"""
Validator voor de ruimte-ontologie (data/ruimtes/*.json).

Waarom dit er meteen bij zit: de ontologie is een verwijzingslaag. Hij verwijst naar
vakken, naar bestaande pagina's en naar productcategorieën uit de database. Een
verwijzing die niet klopt valt nergens op — de pagina rendert gewoon, met een link
naar niets. Precies zo ontstonden "Auping {{city}} Centrum" en de drie clusters die
door een redirect onbereikbaar waren.

Gecontroleerd wordt:
  1. schema      — verplichte velden aanwezig, waarden uit de toegestane set
  2. vakken      — elk genoemd vak bestaat in generate_vakpillar.VAKKEN
  3. paden       — elk genoemd pad bestaat als pagina (repo-map, cluster of Next-route)
  4. redirects   — geen pad wordt geschaduwd door een redirect in vercel.json
  5. verwijzingen — verwante_ruimtes bestaan als bestand
  6. categorieën — alleen als --online: productcategorieën bestaan in merchant_vouchers
  7. meerwerk    — alleen als --online: meerwerk-slugs bestaan in meerwerk_opties

Gebruik: python3 scripts/check_ruimtes.py [--online]
Exit 1 bij fouten, zodat een loop of build erop kan afgaan.
"""
import importlib.util
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUIMTE_DIR = os.path.join(ROOT, "data", "ruimtes")
ONLINE = "--online" in sys.argv[1:]

TYPES = {"binnen", "buiten", "technisch", "verkeersruimte"}
STATUSSEN = {"node", "pagina"}
MOMENTEN = {"nieuwbouw-oplevering", "verbouwing", "verhuizing", "verduurzaming"}
VERPLICHT = ("slug", "naam", "synoniemen", "type", "status", "kern", "momenten", "beslissingen", "vakken")

fouten: list[str] = []
waarschuwingen: list[str] = []


def vakken_uit_generator() -> set[str]:
    spec = importlib.util.spec_from_file_location("vp", os.path.join(ROOT, "generate_vakpillar.py"))
    mod = importlib.util.module_from_spec(spec)
    bewaard, sys.argv = sys.argv, ["check_ruimtes"]
    try:
        spec.loader.exec_module(mod)
    except SystemExit:
        pass
    finally:
        sys.argv = bewaard
    return set(mod.VAKKEN.keys())


def pad_bestaat(pad: str) -> bool:
    """Een pad telt als bestaand bij een statisch bestand, een cluster-slug of een Next-route."""
    rel = pad.strip("/")
    if os.path.exists(os.path.join(ROOT, rel, "index.html")):
        return True
    if os.path.exists(os.path.join(ROOT, "web", "app", rel, "page.tsx")):
        return True
    # cluster: eerste segment is de clusternaam, de rest een slug in pages.json
    delen = rel.split("/", 1)
    pages = os.path.join(ROOT, "data", "clusters", delen[0], "pages.json")
    if os.path.exists(pages):
        paden = {p["path"].strip("/") for p in json.load(open(pages, encoding="utf-8"))}
        if rel in paden:
            return True
        if len(delen) == 1:
            return True
    return False


def geschaduwd_door_redirect(pad: str) -> str | None:
    """Redirects die dit pad op www.bylder.com wegsturen.

    Regels met een `has`-voorwaarde op een andere host (mijn.bylder.com, of de
    bylder.com→www-canonicalisatie) slaan we over: die gelden niet voor onze
    paden. Zonder die uitzondering meldt de controle élk pad als geschaduwd, en
    een controle die altijd alarm slaat is net zo nutteloos als geen controle.
    """
    vercel = json.load(open(os.path.join(ROOT, "vercel.json"), encoding="utf-8"))
    for r in vercel.get("redirects", []):
        if any(h.get("type") == "host" and h.get("value") != "www.bylder.com" for h in r.get("has", [])):
            continue
        bron = r["source"]
        patroon = "^" + re.sub(r"\(\.\*\)", ".*", re.escape(bron).replace(r"\(\.\*\)", "(.*)")) + "/?$"
        try:
            if re.match(patroon, pad.rstrip("/")) or re.match(patroon, pad):
                return f'{bron} → {r["destination"]}'
        except re.error:
            continue
    return None


VAKKEN = vakken_uit_generator()
bestanden = sorted(f for f in os.listdir(RUIMTE_DIR) if f.endswith(".json"))
slugs = {f[:-5] for f in bestanden}

for naam in bestanden:
    pad_bestand = os.path.join(RUIMTE_DIR, naam)
    try:
        d = json.load(open(pad_bestand, encoding="utf-8"))
    except json.JSONDecodeError as e:
        fouten.append(f"{naam}: ongeldige JSON — {e}")
        continue

    def fout(msg): fouten.append(f"{naam}: {msg}")

    for veld in VERPLICHT:
        if veld not in d or d[veld] in (None, "", []):
            fout(f"verplicht veld ontbreekt of is leeg: {veld}")

    if d.get("slug") != naam[:-5]:
        fout(f"slug '{d.get('slug')}' komt niet overeen met bestandsnaam")
    if d.get("type") not in TYPES:
        fout(f"onbekend type: {d.get('type')}")
    if d.get("status") not in STATUSSEN:
        fout(f"onbekende status: {d.get('status')}")
    for m in d.get("momenten", []):
        if m not in MOMENTEN:
            fout(f"onbekend moment: {m}")

    for v in d.get("vakken", []):
        if v not in VAKKEN:
            fout(f"vak bestaat niet in generate_vakpillar: {v}")

    for r in d.get("verwante_ruimtes", []):
        if r not in slugs:
            fout(f"verwante ruimte bestaat niet: {r}")

    for p in d.get("paden", []) + d.get("kosten_paden", []):
        if not pad_bestaat(p):
            fout(f"pad bestaat niet: {p}")
        schaduw = geschaduwd_door_redirect(p)
        if schaduw:
            fout(f"pad wordt geschaduwd door redirect: {p}  ({schaduw})")

    verg = d.get("vergunning")
    if verg:
        if verg.get("nodig") not in ("ja", "nee", "soms"):
            fout(f"vergunning.nodig moet ja/nee/soms zijn, niet {verg.get('nodig')!r}")
        if verg.get("pad") and not pad_bestaat(verg["pad"]):
            fout(f"vergunning.pad bestaat niet: {verg['pad']}")

    # Bedragen horen in de renovatiekosten-laag, niet hier — anders lopen ze uiteen.
    blob = json.dumps(d, ensure_ascii=False)
    for m in re.finditer(r"€\s?\d", blob):
        waarschuwingen.append(f"{naam}: bedrag in de ontologie ({blob[max(0,m.start()-40):m.start()+30]!r}) — hoort in renovatiekosten")

    if d.get("status") == "pagina" and not d.get("beslissingen"):
        fout("status 'pagina' zonder beslissingen — dan is er niets te schrijven")

if ONLINE:
    import ssl, urllib.request
    try:
        import certifi
        CTX = ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        CTX = ssl.create_default_context()

    def env(k):
        for regel in open("/Users/danielpaaij/Documents/GitHub/app/.env.local", encoding="utf-8"):
            if regel.startswith(k + "="):
                return regel.split("=", 1)[1].strip().strip('"').strip("'")
        return None

    u, key = env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY")
    req = urllib.request.Request(f"{u}/rest/v1/merchant_vouchers?select=category&status=eq.approved",
                                 headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, context=CTX) as r:
        rows = json.load(r)
    bekend = {c.strip() for row in rows for c in (row["category"] or "").split(",") if c.strip()}

    req = urllib.request.Request(f"{u}/rest/v1/meerwerk_opties?select=slug",
                                 headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urllib.request.urlopen(req, context=CTX) as r:
        meerwerk_slugs = {x["slug"] for x in json.load(r)}

    for naam in bestanden:
        d = json.load(open(os.path.join(RUIMTE_DIR, naam), encoding="utf-8"))
        for c in d.get("productcategorieen", []):
            if c not in bekend:
                waarschuwingen.append(f"{naam}: productcategorie zonder deelnemer: {c}")
        for m in d.get("meerwerk", []):
            if m not in meerwerk_slugs:
                fouten.append(f"{naam}: meerwerk-slug bestaat niet in meerwerk_opties: {m}")

pagina = sum(1 for f in bestanden if json.load(open(os.path.join(RUIMTE_DIR, f), encoding="utf-8"))["status"] == "pagina")
print(f"{len(bestanden)} ruimtes · {pagina} met status 'pagina' · {len(bestanden) - pagina} als node")
for w in waarschuwingen:
    print(f"  ⚠ {w}")
for f in fouten:
    print(f"  ✗ {f}")
if not fouten:
    print("[OK] alle verwijzingen kloppen" + ("" if ONLINE else " (draai met --online voor de productcategorieën)"))
sys.exit(1 if fouten else 0)
