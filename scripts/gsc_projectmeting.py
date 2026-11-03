#!/usr/bin/env python3
"""Maandelijkse meting per projectpagina uit Search Console (ronde 3, besluit Daniel 3-11-2026).

WAT HET DOET
Haalt voor elke /nieuwbouw-project/-pagina de cijfers van de afgelopen 28 dagen op:
klikken, vertoningen, doorklik en gemiddelde positie, plus de vijf zoekopdrachten
waarop hij het vaakst verscheen. Schrijft dat naar
data/clusters/nieuwbouw-project/gsc-meting.json en een lijst met kansen naar
reports/gsc-kansen.md.

WAARVOOR
1. De feitenronde (handwerk_schrijver.py) werkt de pagina's die Google al laat zien
   als eerste bij: daar levert een betere pagina meteen bezoek op.
2. De kansenlijst laat zien welke pagina's veel vertoond worden maar weinig klikken
   krijgen, of net buiten de top 10 staan. Daar loont een betere titel of meer feiten.

TOEGANG
Een serviceaccount met leesrecht op de property sc-domain:bylder.com. In Actions komt
de sleutel uit de repo-secret GSC_KEY_JSON (de inhoud van het JSON-bestand); lokaal
uit GSC_KEY_PAD of het bestand naast de app. Zonder sleutel stopt het script netjes.

Gebruik:
    python3 scripts/gsc_projectmeting.py
"""
import json, os, re, sys, urllib.parse, urllib.request
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UIT = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project", "gsc-meting.json")
KANSEN = os.path.join(ROOT, "reports", "gsc-kansen.md")
SITE = "sc-domain:bylder.com"
API = f"https://www.googleapis.com/webmasters/v3/sites/{urllib.parse.quote(SITE, safe='')}/searchAnalytics/query"


def token():
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    scopes = ["https://www.googleapis.com/auth/webmasters.readonly"]
    ruw = os.environ.get("GSC_KEY_JSON", "").strip()
    if ruw:
        cred = service_account.Credentials.from_service_account_info(json.loads(ruw), scopes=scopes)
    else:
        pad = os.environ.get("GSC_KEY_PAD") or "/Users/danielpaaij/Documents/GitHub/app/.gsc-key.json"
        if not os.path.exists(pad):
            sys.exit("Geen Search Console-sleutel (GSC_KEY_JSON of GSC_KEY_PAD). Niets gemeten.")
        cred = service_account.Credentials.from_service_account_file(pad, scopes=scopes)
    cred.refresh(Request())
    return cred.token


def vraag(tk, body):
    req = urllib.request.Request(API, data=json.dumps(body).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {tk}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r).get("rows", [])


def slug_van(url):
    m = re.search(r"/nieuwbouw-project/([^/?#]+)/?", url)
    return m.group(1) if m else None


def main():
    tk = token()
    eind = date.today() - timedelta(days=3)          # GSC loopt een paar dagen achter
    begin = eind - timedelta(days=27)
    filt = [{"filters": [{"dimension": "page", "operator": "contains", "expression": "/nieuwbouw-project/"}]}]
    basis = {"startDate": begin.isoformat(), "endDate": eind.isoformat(), "type": "web",
             "dimensionFilterGroups": filt, "rowLimit": 25000}

    meting = {}
    for r in vraag(tk, {**basis, "dimensions": ["page"]}):
        s = slug_van(r["keys"][0])
        if not s or s == "index":
            continue
        meting[s] = {"klikken": int(r["clicks"]), "vertoningen": int(r["impressions"]),
                     "ctr": round(r["ctr"] * 100, 2), "positie": round(r["position"], 1), "zoekopdrachten": []}
    for r in vraag(tk, {**basis, "dimensions": ["page", "query"]}):
        s = slug_van(r["keys"][0])
        if s in meting:
            meting[s]["zoekopdrachten"].append({"q": r["keys"][1], "vertoningen": int(r["impressions"]),
                                                "klikken": int(r["clicks"]), "positie": round(r["position"], 1)})
    for v in meting.values():
        v["zoekopdrachten"] = sorted(v["zoekopdrachten"], key=lambda x: -x["vertoningen"])[:5]

    json.dump({"_periode": f"{begin.isoformat()} t/m {eind.isoformat()}", "paginas": meting},
              open(UIT, "w", encoding="utf8"), ensure_ascii=False, indent=1, sort_keys=True)

    # Kansen: veel gezien, weinig geklikt; of net buiten de top 10.
    weinig = sorted([(s, v) for s, v in meting.items() if v["vertoningen"] >= 50 and v["ctr"] < 2],
                    key=lambda x: -x[1]["vertoningen"])[:20]
    bijna = sorted([(s, v) for s, v in meting.items() if 8 <= v["positie"] <= 20 and v["vertoningen"] >= 20],
                   key=lambda x: -x[1]["vertoningen"])[:20]
    tot_k = sum(v["klikken"] for v in meting.values()); tot_v = sum(v["vertoningen"] for v in meting.values())
    regels = [f"# Projectpagina's in Google, {begin:%d-%m} t/m {eind:%d-%m-%Y}", "",
              f"{len(meting)} projectpagina's vertoond · {tot_v} vertoningen · {tot_k} klikken", "",
              "## Veel gezien, weinig geklikt (titel en omschrijving verbeteren)", ""]
    regels += [f"- /nieuwbouw-project/{s}/ — {v['vertoningen']} vertoningen, {v['ctr']}% doorklik, positie {v['positie']}"
               + (f" · meest gezocht: “{v['zoekopdrachten'][0]['q']}”" if v["zoekopdrachten"] else "") for s, v in weinig] or ["- geen"]
    regels += ["", "## Net buiten de top 10 (meer eigen feiten, betere pagina)", ""]
    regels += [f"- /nieuwbouw-project/{s}/ — positie {v['positie']}, {v['vertoningen']} vertoningen" for s, v in bijna] or ["- geen"]
    os.makedirs(os.path.dirname(KANSEN), exist_ok=True)
    open(KANSEN, "w", encoding="utf8").write("\n".join(regels) + "\n")
    print("\n".join(regels[:4]))


if __name__ == "__main__":
    main()
