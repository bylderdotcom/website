#!/usr/bin/env python3
"""
Verrijkt vakbedrijven met wat ze zélf op hun site zetten — in één ophaal per bedrijf.

Waarom
------
Gemeten 28 juli 2026: van de 25.707 vakbedrijven heeft er níét één een omschrijving,
dienstenlijst of samenvatting, en 42 een e-mailadres. Een profielpagina bestaat uit
naam, plaats, telefoon, website en een cijfer — de rest is sjabloon dat op alle
pagina's gelijk is. Daarom staan 11.512 profielen bewust op noindex
(`profiel_indexeerbaar` in generate_vakpillar.py): te dun om aan te bieden.

Twee doelen tegelijk, en dat is de reden dat dit één script is en geen twee:

1. **Vindbaarheid.** Eigen inhoud per bedrijf in plaats van sjabloon.
2. **Aanbevelen.** Het platform moet straks kunnen zeggen wélk bedrijf past. Daarvoor
   moet je bedrijven van elkaar kunnen onderscheiden, niet alleen kunnen beschrijven.
   Diensten, keurmerken, werkgebied en oprichtingsjaar doen dat; naam en plaats niet.

Wat dit script níét doet: iets afleiden of aanvullen. Er komt geen model aan te pas.
Staat het niet letterlijk op de site, dan wordt het veld niet gevuld. Dat is bewust —
een verzonnen keurmerk op een profielpagina is erger dan een leeg veld.

Let op de grens: dit is wat een bedrijf over zichzélf zegt. Bruikbaar om te matchen
(wie doet wat, waar), niet om te bepalen wie het beter doet. Dat laatste komt straks
uit de eigen offertestroom — prijs-benchmark, wie reageerde, wat geaccepteerd werd.

De dienstenlijst volgt de `werksoorten` uit generate_vakpillar.py, zodat de chips op
een profiel dezelfde taal spreken als de prijstabellen van datzelfde vak.

Gebruik
-------
  python3 scripts/vakbedrijven_diensten.py <vak> [--limit N] [--sync]

  <vak>      stukadoor | schilder | loodgieter | elektricien | aannemer |
             badkamer | dakkapel | gietvloer
  --limit N  aantal bedrijven (standaard 150) — begin klein en meet de score
  --sync     schrijft naar Supabase. Zonder deze vlag: droogdraai, schrijft niets.
  --hersync  schrijf weg uit reports/diensten-<vak>.json zonder opnieuw op te halen

Velden: diensten, email, kvk, keurmerken, opgericht, werkgebied. De laatste vier
hebben kolommen nodig die er nog niet zijn — zie
app/supabase/migrations/20260728140000_vakbedrijven_verrijking.sql. Zonder die
migratie schrijft --sync alleen diensten en email, en meldt dat.

Na een geslaagde run: `python3 scripts/vakbedrijven_pipeline.py export` om
data/vakbedrijven.json bij te werken, daarna de generator.
"""
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT = os.path.join(ROOT, "data", "vakbedrijven.json")
ENV = "/Users/danielpaaij/Documents/GitHub/app/.env.local"

# Herkenbaar en herleidbaar: een sitebeheerder die dit in zijn log ziet, kan zien
# wie het is en waarom. Anoniem scrapen van bedrijfssites is onnodig onbeleefd.
UA = "BylderBot/1.0 (+https://www.bylder.com/voor-vakbedrijven/)"
SUBPAGINAS = ("/diensten", "/werkzaamheden", "/wat-wij-doen", "/over-ons", "/services")
MAX_DIENSTEN = 6
MIN_TEKST = 300          # minder tekst = parkeerpagina of JS-only site
WERKERS = 8              # tegelijk, niet meer — dit zijn kleine servers

# Per werksoort de termen die er letterlijk op een site staan. Bewust krap: liever
# een dienst missen dan er een verzinnen. Alles kleingeletterd, accenten weg.
VOCAB = {
    "stukadoor": {
        "Spuitwerk / spackspuiten": ["spackspuit", "spuitwerk", "spuitplamuur", "latex spuiten"],
        "Wanden behangklaar pleisteren": ["behangklaar", "behangklare"],
        "Wanden glad pleisteren": ["glad pleister", "sausklaar", "stucwerk glad", "gladpleister"],
        "Sierpleister / decoratief": ["sierpleister", "betonlook", "marokkaans", "kalkpleister", "tadelakt", "decoratief pleister"],
        "Buitenstucwerk / gevelpleister": ["buitenstuc", "gevelpleister", "gevelstuc", "buitengevel"],
    },
    "schilder": {
        "Binnenschilderwerk": ["binnenschilderwerk", "binnenwerk schilder", "schilderen binnen"],
        "Buitenschilderwerk": ["buitenschilderwerk", "buitenwerk", "kozijnen schilderen"],
        "Behangen": ["behangen", "behangwerk", "glasvlies"],
        "Houtrot herstellen": ["houtrot", "houtherstel"],
        "Spuitwerk": ["spuitwerk", "lakspuiten", "spuiten van kozijnen"],
    },
    "loodgieter": {
        "Kraan of mengkraan vervangen": ["kraan vervang", "mengkraan", "kranen vervangen"],
        "Lekkage opsporen en verhelpen": ["lekkage", "lekdetectie", "waterschade"],
        "Toilet vervangen": ["toilet vervang", "hangend toilet", "wc vervangen"],
        "Radiator plaatsen of vervangen": ["radiator", "verwarmingselement"],
        "Cv-ketel vervangen": ["cv-ketel", "cv ketel", "ketelvervanging", "hr-ketel"],
        "Afvoer of riool ontstoppen": ["ontstopp", "riool", "verstopping", "afvoer verstopt"],
    },
    "elektricien": {
        "Stopcontact of schakelaar bijplaatsen": ["stopcontact", "schakelaar", "wandcontactdoos"],
        "Verlichting of inbouwspots": ["inbouwspot", "verlichting aanleggen", "lichtplan", "spots"],
        "Storing of aardlekschakelaar": ["storing", "aardlek", "kortsluiting"],
        "Laadpaal installeren": ["laadpaal", "thuislader", "laadstation"],
        "Groepenkast vervangen": ["groepenkast", "meterkast uitbreiden", "verdeelkast"],
        "Woning herbedraden": ["herbedrad", "nieuwe bedrading", "installatie vernieuwen"],
    },
    "aannemer": {
        "Aanbouw of uitbouw": ["aanbouw", "uitbouw", "serre"],
        "Verbouwing": ["verbouw", "renovatie", "totaalrenovatie"],
        "Dakopbouw": ["dakopbouw", "opbouw op", "extra verdieping"],
        "Casco en ruwbouw": ["casco", "ruwbouw", "metselwerk"],
        "Constructief werk": ["draagmuur", "constructief", "staalconstructie", "stalen balk"],
    },
    "badkamer": {
        "Complete badkamer": ["complete badkamer", "badkamer renovatie", "badkamerrenovatie", "totale badkamer"],
        "Tegelwerk": ["tegelwerk", "tegelzetter", "tegels zetten"],
        "Inloopdouche": ["inloopdouche", "walk-in"],
        "Sanitair plaatsen": ["sanitair", "wastafel", "toiletruimte"],
        "Vloerverwarming": ["vloerverwarming"],
    },
    "dakkapel": {
        "Dakkapel plaatsen": ["dakkapel"],
        "Prefab dakkapel": ["prefab", "kant-en-klaar"],
        "Dakkapel op maat": ["op maat", "maatwerk"],
        "Vergunning regelen": ["vergunning", "omgevingsvergunning"],
        "Isolatie en afwerking": ["isolatie", "afwerking binnenzijde"],
    },
    "gietvloer": {
        "Gietvloer woonhuis": ["gietvloer", "giet vloer"],
        "Betonlook vloer": ["betonlook", "beton cire", "beton-cire"],
        "PU of epoxy": ["polyurethaan", " pu-", "epoxy"],
        "Vloerverwarming geschikt": ["vloerverwarming"],
        "Egaliseren en voorbereiding": ["egalis", "ondervloer", "zandcement"],
    },
}

# ── Overige velden ──────────────────────────────────────────────────────────
# E-mail: rolgebonden adressen eerst. De junk-lijst vangt adressen van de bouwer
# van de site en voorbeelden in sjabloontekst af — die staan er verrassend vaak in.
JUNK_MAIL = ("@example", "@sentry", "@wixpress", "@domain", "@email.com", "@jouwweb",
             "@wordpress", "@yourdomain", "@test", "noreply", "no-reply", ".png", ".jpg", ".webp")
ROL_EERST = ("info@", "contact@", "mail@", "administratie@", "offerte@", "planning@")

# Alleen keurmerken die te controleren zijn en in deze branche iets betekenen.
KEURMERKEN = {
    "VCA": r"\bvca\b",
    "BouwGarant": r"\bbouwgarant\b",
    "KOMO": r"\bkomo\b",
    "SKG-IKOB": r"\bskg[- ]?ikob\b|\bskg\b",
    "Techniek Nederland": r"techniek nederland|uneto[- ]?vni",
    "InstallQ": r"\binstallq\b|\bsterkin\b",
    "Stichting Garantiewoning": r"garantiewoning|swk garantie|woningborg",
    "ISO 9001": r"iso[- ]?9001",
}

JAAR_RE = re.compile(r"(?:sinds|opgericht in|opgericht sinds|actief sinds|since)\s+(1[89]\d\d|20[0-2]\d)")
KVK_RE = re.compile(r"kvk[^0-9]{0,25}(\d{8})\b|handelsregister[^0-9]{0,25}(\d{8})\b")
# Alleen plaatsen die in een werkgebied-zin staan. Losse plaatsnamen door de hele
# site matchen levert onzin op: "Best", "Beek" en "Bergen" zijn ook gewone woorden.
WERKGEBIED_RE = re.compile(
    r"[^.!?]{0,200}(?:werkgebied|wij werken in|werkzaam in|actief in|omgeving van|regio)[^.!?]{0,300}",
    re.IGNORECASE)


def email_uit(rauw, tekst):
    kandidaten = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", (rauw or "") + " " + (tekst or ""))
    kandidaten = [c.lower() for c in kandidaten
                  if len(c) < 60 and not any(j in c.lower() for j in JUNK_MAIL)]
    if not kandidaten:
        return None
    for pre in ROL_EERST:
        for c in kandidaten:
            if c.startswith(pre):
                return c
    return kandidaten[0]


def kvk_uit(tekst):
    m = KVK_RE.search((tekst or "").lower())
    return (m.group(1) or m.group(2)) if m else None


def keurmerken_uit(tekst):
    tekst = (tekst or "").lower()
    return [naam for naam, patroon in KEURMERKEN.items() if re.search(patroon, tekst)]


def opgericht_uit(tekst):
    m = JAAR_RE.search((tekst or "").lower())
    if not m:
        return None
    jaar = int(m.group(1))
    return jaar if 1850 <= jaar <= 2026 else None


def werkgebied_uit(tekst, plaatsen):
    """Plaatsen binnen een werkgebied-zin: hele woorden én met een hoofdletter.

    Twee fouten uit twee eerdere runs, allebei echt weggeschreven:
      1. zonder woordgrenzen kreeg een stukadoor in Alkmaar 'rheden' (uit
         "waarheden") en 'echt' (uit "slecht");
      2. mét woordgrenzen maar zonder hoofdletters bleef 'heel' en 'echt'
         doorkomen — dat zijn gemeenten in Limburg én gewone woorden.

    Een plaatsnaam krijgt in lopende tekst een hoofdletter, het bijwoord niet.
    Dat onderscheid is het enige dat hier werkt. Bergen, Best en Laren blijven
    daardoor gewoon vindbaar wanneer ze als plaats bedoeld zijn.
    """
    gebied = []
    for zin in WERKGEBIED_RE.findall(tekst or "")[:6]:
        for p in plaatsen:
            if len(p) < 4 or p.lower() in gebied:
                continue
            for m in re.finditer(rf"(?<![A-Za-z]){re.escape(p)}(?![a-z])", zin, re.IGNORECASE):
                eerste = next((c for c in m.group(0) if c.isalpha()), "")
                if eerste.isupper():
                    gebied.append(p.lower())
                    break
    return gebied[:12]


ARGS = [a for a in sys.argv[1:] if not a.startswith("--")]
FLAGS = [a for a in sys.argv[1:] if a.startswith("--")]
SYNC = "--sync" in FLAGS
HERSYNC = "--hersync" in FLAGS          # sla het ophalen over, gebruik het vorige rapport
if HERSYNC:
    SYNC = True
LIMIET = 150
for f in FLAGS:
    if f.startswith("--limit"):
        LIMIET = int(f.split("=", 1)[1]) if "=" in f else int(sys.argv[sys.argv.index(f) + 1])

if not ARGS or ARGS[0] not in VOCAB:
    sys.exit(f"Gebruik: python3 scripts/vakbedrijven_diensten.py <vak> [--limit N] [--sync]\n"
             f"  vakken: {', '.join(VOCAB)}")
VAK = ARGS[0]


def env(naam):
    try:
        with open(ENV) as f:
            for regel in f:
                if regel.startswith(naam + "="):
                    return regel.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return os.environ.get(naam)


def haal(url):
    try:
        r = subprocess.run(["curl", "-sL", "-m", "12", "-A", UA, url],
                           capture_output=True, text=True, timeout=18, errors="ignore")
        return r.stdout or ""
    except Exception:
        return ""


def tekst_uit(h):
    """Platte tekst mét oorspronkelijke hoofdletters.

    Die hoofdletters zijn geen detail: ze zijn het enige verschil tussen de
    gemeente Heel en het woord "heel", en tussen Echt en "echt". Alles wat niet
    op plaatsnamen matcht, kleinlettert zelf.
    """
    h = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h or "")
    h = re.sub(r"(?s)<[^>]+>", " ", h)
    h = re.sub(r"&[a-z]+;|&#\d+;", " ", h)
    return re.sub(r"\s+", " ", h)


def diensten_uit(tekst):
    tekst = (tekst or "").lower()
    gevonden = []
    for dienst, termen in VOCAB[VAK].items():
        if any(t in tekst for t in termen):
            gevonden.append(dienst)
    return gevonden[:MAX_DIENSTEN]


rows = json.load(open(EXPORT, encoding="utf-8"))["vakbedrijven"]
# Plaatsnamen uit de eigen dataset: rijker dan een gemeentelijst, want hier staan
# ook dorpen in. Alleen gebruikt binnen een werkgebied-zin, zie werkgebied_uit.
PLAATSEN = sorted({(b.get("stad") or "").strip().lower() for b in rows if b.get("stad")}, key=len, reverse=True)


def verwerk(b):
    basis = (b.get("website") or "").rstrip("/")
    if not basis.startswith("http"):
        basis = "https://" + basis

    rauw = haal(basis)
    tekst = tekst_uit(rauw)
    bereikbaar = len(tekst) >= MIN_TEKST

    diensten = diensten_uit(tekst) if bereikbaar else []
    email = email_uit(rauw, tekst) if bereikbaar else None

    # Eén ronde subpagina's, en alleen als de homepage iets belangrijks miste.
    # Contactgegevens en dienstenlijsten staan daar nu eenmaal vaak apart.
    if bereikbaar and (not diensten or not email):
        for sub in SUBPAGINAS + ("/contact", "/contact.html"):
            sub_rauw = haal(basis + sub)
            sub_tekst = tekst_uit(sub_rauw)
            if len(sub_tekst) < MIN_TEKST:
                continue
            rauw += " " + sub_rauw
            tekst += " " + sub_tekst
            diensten = diensten or diensten_uit(sub_tekst)
            email = email or email_uit(sub_rauw, sub_tekst)
            if diensten and email:
                break
            time.sleep(0.3)

    return {
        "id": b["id"], "naam": b["naam"], "website": basis,
        "bereikbaar": bereikbaar,
        "diensten": diensten,
        "email": email,
        "kvk": kvk_uit(tekst) if bereikbaar else None,
        "keurmerken": keurmerken_uit(tekst) if bereikbaar else [],
        "opgericht": opgericht_uit(tekst) if bereikbaar else None,
        "werkgebied": werkgebied_uit(tekst, PLAATSEN) if bereikbaar else [],
    }


kandidaten = [b for b in rows if b.get("vak") == VAK and b.get("website")
              and not b.get("diensten") and not b.get("opt_out")][:LIMIET]

print(f"{VAK}: {len(kandidaten)} bedrijven met website, nog zonder diensten.")
print(f"Woordenlijst: {len(VOCAB[VAK])} diensten. "
      f"{'SCHRIJFT NAAR SUPABASE' if SYNC else 'Droogdraai — schrijft niets.'}\n")

# Ophalen is het dure deel: 200 bedrijven kosten een kwartier, 21.317 een nacht.
# De vondst gaat daarom altijd naar schijf vóór het wegschrijven begint. Mislukt
# dat laatste — en dat gebeurde: 159 SSL-fouten op de eerste run — dan hoef je met
# --hersync alleen de database-kant over te doen.
RAPPORT = os.path.join(ROOT, "reports", f"diensten-{VAK}.json")

if HERSYNC:
    if not os.path.exists(RAPPORT):
        sys.exit(f"⚠ --hersync: {RAPPORT} bestaat nog niet. Draai eerst zonder die vlag.")
    resultaten = json.load(open(RAPPORT, encoding="utf-8"))["resultaten"]
    print(f"Uit rapport gelezen: {len(resultaten)} bedrijven (niets opnieuw opgehaald).\n")
else:
    resultaten = []
    with ThreadPoolExecutor(max_workers=WERKERS) as pool:
        for i, r in enumerate(pool.map(verwerk, kandidaten), 1):
            resultaten.append(r)
            if i % 25 == 0:
                print(f"  … {i}/{len(kandidaten)}", end="\r")
    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    json.dump({"vak": VAK, "aantal": len(resultaten), "resultaten": resultaten},
              open(RAPPORT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

print(" " * 60, end="\r")
bereikbaar = [r for r in resultaten if r["bereikbaar"]]
n = len(resultaten)


def score(veld):
    raak = sum(1 for r in resultaten if r[veld])
    return f"{raak:>4}  ({100 * raak // max(n, 1):>3}% van alle, {100 * raak // max(len(bereikbaar), 1):>3}% van bereikbare)"


print(f"Bereikbaar   : {len(bereikbaar)}/{n}")
for veld in ("diensten", "email", "kvk", "keurmerken", "opgericht", "werkgebied"):
    print(f"  {veld:<12} {score(veld)}")

verdeling = {}
for r in resultaten:
    for d in r["diensten"]:
        verdeling[d] = verdeling.get(d, 0) + 1
if verdeling:
    print("\nPer dienst:")
    for d, aantal in sorted(verdeling.items(), key=lambda kv: -kv[1]):
        print(f"  {aantal:>4}  {d}")

print("\nVoorbeelden:")
for r in [x for x in resultaten if x["diensten"] or x["email"]][:8]:
    extra = []
    if r["email"]:
        extra.append(r["email"])
    if r["keurmerken"]:
        extra.append("+".join(r["keurmerken"]))
    if r["opgericht"]:
        extra.append(f"sinds {r['opgericht']}")
    if r["werkgebied"]:
        extra.append(f"{len(r['werkgebied'])} plaatsen")
    print(f"  {r['naam'][:34]:<34} {', '.join(r['diensten'])[:44]:<44} {' · '.join(extra)}")

if not SYNC:
    print("\n(droogdraai — geef --sync mee om weg te schrijven)")
    sys.exit(0)

# ── Wegschrijven ────────────────────────────────────────────────────────────
import ssl
import urllib.request

# Zonder expliciete CA-bundel geeft urllib hier CERTIFICATE_VERIFY_FAILED op élk
# verzoek aan Supabase. Dat kostte een hele run: 159 fouten, 0 weggeschreven — en
# omdat de kolomcontrole via dezelfde weg loopt, meldde hij ook nog eens ten
# onrechte dat de kolommen ontbraken. De scrape zelf gaat via curl en had er
# geen last van, wat het verwarrend maakte.
try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    CTX = ssl.create_default_context()

sb_url, sb_key = env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY")
if not sb_url or not sb_key:
    sys.exit("\n⚠ --sync: Supabase-gegevens niet gevonden in app/.env.local.")

KOP = {"apikey": sb_key, "Authorization": f"Bearer {sb_key}"}


def kolom_bestaat(kolom):
    req = urllib.request.Request(f"{sb_url}/rest/v1/vakbedrijven?select={kolom}&limit=1", headers=KOP)
    try:
        urllib.request.urlopen(req, context=CTX).read()
        return True
    except Exception as e:
        print(f"  ! kolomcontrole {kolom} mislukt: {e}")
        return False


NIEUW = ("kvk", "keurmerken", "opgericht", "werkgebied")
aanwezig = {k: kolom_bestaat(k) for k in NIEUW}
ontbreekt = [k for k, v in aanwezig.items() if not v]
if ontbreekt:
    print(f"\nℹ Kolommen ontbreken nog: {', '.join(ontbreekt)} — die worden overgeslagen.")
    print("  → draai app/supabase/migrations/20260728140000_vakbedrijven_verrijking.sql")

ok = fout = leeg = 0
for r in resultaten:
    payload = {}
    if r["diensten"]:
        payload["diensten"] = r["diensten"]
    if r["email"]:
        payload["email"] = r["email"]
    for k in NIEUW:
        if aanwezig[k] and r[k]:
            payload[k] = r[k]
    if not payload:
        leeg += 1
        continue
    req = urllib.request.Request(
        f"{sb_url}/rest/v1/vakbedrijven?id=eq.{r['id']}",
        data=json.dumps(payload).encode(), method="PATCH",
        headers={**KOP, "Content-Type": "application/json", "Prefer": "return=minimal"})
    try:
        urllib.request.urlopen(req, context=CTX).read()
        ok += 1
    except Exception as e:
        fout += 1
        if fout <= 5:
            print("  !", r["naam"], e)

print(f"\nWeggeschreven: {ok} bijgewerkt · {leeg} zonder vondst overgeslagen · {fout} fouten.")
print("Vergeet daarna niet: python3 scripts/vakbedrijven_pipeline.py export")
