#!/usr/bin/env python3
"""Meldt de vak-sitemaps aan bij Search Console.

WAAROM
------
Op 21 augustus 2026 bleek bij het terugdraaien van de noindex dat zes van de acht
vak-sitemaps nog nooit waren ingediend — waaronder loodgieter met 3.516 URL's, de
grootste verkeersbron van de site (225 klikken in drie maanden). Alleen badkamer
en dakkapel stonden er.

Ze hangen wel onder de sitemap-index, maar een losse aanmelding geeft twee dingen
die je anders mist: Google verwerkt hem sneller, en je krijgt per sitemap een
eigen dekkingsrapport in plaats van één hoop van 42.457 URL's.

VEILIGHEID
----------
Het script weigert te draaien zolang de profielpagina's nog noindex serveren. Een
sitemap indienen die naar noindex-pagina's wijst is niet alleen zinloos maar
contraproductief: je vraagt de crawler langs te komen om te lezen dat hij weg moet
blijven.

Gebruik:
    python3 scripts/gsc_sitemaps_indienen.py --controleer          # alleen kijken
    python3 scripts/gsc_sitemaps_indienen.py                      # de acht vak-sitemaps
    python3 scripts/gsc_sitemaps_indienen.py --alles              # elke sitemap apart
    python3 scripts/gsc_sitemaps_indienen.py --alles --controleer
"""
import glob, json, os, ssl, subprocess, sys, urllib.parse, urllib.request

try:
    import certifi
    CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    CTX = ssl.create_default_context()

from google.oauth2 import service_account
from google.auth.transport.requests import Request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
SITE = "sc-domain:bylder.com"
BASE = "https://www.bylder.com"
VAKKEN = ["loodgieter", "aannemer", "schilder", "elektricien",
          "stukadoor", "badkamer", "dakkapel", "gietvloer"]


def alle_sitemaps():
    """Elke losse sitemap in de repo-root, grootste eerst.

    Waarom niet alleen de vak-sitemaps (--alles, 29 augustus): Search Console
    geeft per aangemelde sitemap een eigen dekkingsrapport. Zolang alles onder
    één index hangt, zie je één hoop van 56.688 URL's en niet welke laag de
    35.011 niet-opgehaalde adressen vult. Dat onderscheid bepaalt of we in
    /kopen/ moeten snoeien of ergens anders — en zonder losse aanmelding is het
    niet te meten.
    """
    uit = []
    for pad in sorted(glob.glob(os.path.join(ROOT, "*-sitemap.xml"))):
        naam = os.path.basename(pad)
        n = open(pad, encoding="utf8").read().count("<url>")
        if n:
            uit.append((naam, n))
    return sorted(uit, key=lambda x: -x[1])
PROEF = "/loodgieter/bedrijf/duron-dt15fq/"   # een profiel dat weer geïndexeerd hoort te zijn


def token():
    c = service_account.Credentials.from_service_account_file(
        KEY, scopes=["https://www.googleapis.com/auth/webmasters"])
    c.refresh(Request())
    return c.token


def api(pad, tok, methode="GET"):
    u = (f"https://www.googleapis.com/webmasters/v3/sites/"
         f"{urllib.parse.quote(SITE, safe='')}/{pad}")
    kop = {"Authorization": f"Bearer {tok}"}
    if methode == "PUT":
        kop["Content-Length"] = "0"
    r = urllib.request.Request(u, method=methode, headers=kop)
    resp = urllib.request.urlopen(r, context=CTX)
    body = resp.read()
    return json.loads(body) if body else {}


def productie_staat_op_index():
    """Serveert productie de profielen weer als indexeerbaar?"""
    h = subprocess.run(["curl", "-s", "-m", "25", BASE + PROEF],
                       capture_output=True, text=True).stdout
    if "noindex" in h:
        return False, "noindex"
    if 'content="index' in h:
        return True, "index"
    return False, "geen robots-tag gevonden"


ALLES = "--alles" in sys.argv


def main():
    alleen_kijken = "--controleer" in sys.argv
    ok, wat = productie_staat_op_index()
    print(f"productie serveert {PROEF} als: {wat}")
    if not ok and not alleen_kijken:
        sys.exit("Nog niet indienen: de profielen staan nog op noindex. Wacht tot de "
                 "productiebouw klaar is — anders vraag je Google langs te komen om te "
                 "lezen dat hij weg moet blijven.")

    tok = token()
    bestaand = {s.get("path", "").split("/")[-1]
                for s in api("sitemaps", tok).get("sitemap", [])}

    if ALLES:
        lijst = alle_sitemaps()
    else:
        lijst = [(f"{v}-sitemap.xml",
                  open(os.path.join(ROOT, f"{v}-sitemap.xml"), encoding="utf8").read().count("<url>")
                  if os.path.exists(os.path.join(ROOT, f"{v}-sitemap.xml")) else 0)
                 for v in VAKKEN]
    print(f"\n{len(lijst)} sitemaps, samen {sum(n for _, n in lijst)} URL's\n")

    for naam, n in lijst:
        status = "al aangemeld" if naam in bestaand else "nieuw"
        if alleen_kijken:
            print(f"  {naam:<26} {n:>6} URL's  ({status})")
            continue
        try:
            api(f"sitemaps/{urllib.parse.quote(BASE + '/' + naam, safe='')}", tok, "PUT")
            print(f"  {naam:<26} {n:>6} URL's  ingediend ({status})")
        except urllib.error.HTTPError as e:
            print(f"  {naam:<26} MISLUKT {e.code}: {e.read()[:120]}")

    if not alleen_kijken:
        print("\nGoogle verwerkt een sitemap niet direct; reken op dagen tot de eerste "
              "URL's opnieuw worden opgehaald, en op weken tot ze weer ranken.")


if __name__ == "__main__":
    main()
