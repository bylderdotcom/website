#!/usr/bin/env python3
"""GA4 inrichten en de trechter per product uitlezen (afgesproken met Daniel, 3-11-2026).

Zelfde serviceaccount als de Search Console-meting (repo-secret GSC_KEY_JSON); dat staat
als Editor in de GA4-property. Twee taken:

  python3 scripts/ga4.py inrichten   # eenmalig, mag vaker: maakt wat ontbreekt
  python3 scripts/ga4.py trechter    # maandelijks: reports/ga4-trechter.md

inrichten
  - zoekt de property waarvan een webstream meet met G-LZYCRP1169 (de tag op de site);
  - eigen dimensies voor de parameters die de site meestuurt (product, stap, lead_type, ...);
  - generate_lead als belangrijke gebeurtenis;
  - en een diagnose: welke gebeurtenissen de property de afgelopen 28 dagen binnenkreeg.

trechter
  Per product: configurator gebruikt → offerteformulier geopend → aanvraag verstuurd,
  in gebruikers, over de afgelopen 28 dagen. Plus de winkel (mandje → afrekenen → bestelling).
"""
import json, os, sys
from datetime import date, timedelta

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAPPORT = os.path.join(ROOT, "reports", "ga4-trechter.md")
METING_ID = "G-LZYCRP1169"
# Property-ID van Bylder.com (Daniel, 3-11-2026). accountSummaries gaf een lege lijst voor een
# serviceaccount met alleen toegang tot de property; dan rechtstreeks deze.
PROPERTY = "properties/540349275"
ADMIN = "https://analyticsadmin.googleapis.com/v1beta"
DATA = "https://analyticsdata.googleapis.com/v1beta"

DIMENSIES = [  # parameter, naam in GA4, uitleg
    ("product", "Product", "Welk product: kozijnloze-deur, gietvloer, kast, winkel-…"),
    ("stap", "Configuratorstap", "Stap in de configurator: opening, aangepast, specificatie, …"),
    ("lead_type", "Soort aanvraag", "offerte, bestelling of uitvoerder"),
    ("bron", "Bron aanvraag", "Waar de aanvraag vandaan kwam"),
    ("plek", "Plek van de klik", "Waar op de pagina geklikt werd (balk, project, …)"),
    ("knop", "Menuknop", "Welke knop in het menu"),
    ("pagina", "Pagina van de actie", "Pad van de pagina waarop de actie gebeurde"),
]
BELANGRIJK = ["generate_lead", "offerte_getekend", "purchase"]  # offerte_getekend: app (3-11-2026)


def sessie():
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
    scopes = ["https://www.googleapis.com/auth/analytics.edit",
              "https://www.googleapis.com/auth/analytics.readonly"]
    ruw = os.environ.get("GSC_KEY_JSON", "").strip()
    if not ruw:
        sys.exit("Geen sleutel (GSC_KEY_JSON). Niets gedaan.")
    info = json.loads(ruw)
    print(f"serviceaccount: {info.get('client_email')} (project {info.get('project_id')})")
    cred = service_account.Credentials.from_service_account_info(info, scopes=scopes)
    return AuthorizedSession(cred)


def get(s, url, **kw):
    r = s.get(url, **kw)
    if r.status_code >= 400:
        sys.exit(f"GA4 gaf {r.status_code} op {url}:\n{r.text[:800]}")
    return r.json()


def alle(s, url, sleutel):
    uit, token = [], None
    while True:
        j = get(s, url, params={"pageSize": 200, **({"pageToken": token} if token else {})})
        uit += j.get(sleutel, [])
        token = j.get("nextPageToken")
        if not token:
            return uit


def vind_property(s):
    kandidaten = []
    for acc in alle(s, f"{ADMIN}/accountSummaries", "accountSummaries"):
        for p in acc.get("propertySummaries", []):
            kandidaten.append((p["property"], p.get("displayName"), acc.get("displayName")))
    if not kandidaten:
        kandidaten = [(PROPERTY, "Bylder.com", "?")]
    for prop, naam, acc in kandidaten:
        for st in alle(s, f"{ADMIN}/{prop}/dataStreams", "dataStreams"):
            if (st.get("webStreamData") or {}).get("measurementId") == METING_ID:
                print(f"property: {naam} ({prop}), account {acc}, stream {st.get('displayName')}"
                      f" {st['webStreamData'].get('defaultUri', '')}")
                return prop
    print("Gevonden properties:", kandidaten)
    sys.exit(f"Geen property met een webstream {METING_ID}. De tag op de site meet dan naar een andere property.")


def rapport(s, prop, body):
    r = s.post(f"{DATA}/{prop}:runReport", json=body)
    if r.status_code >= 400:
        sys.exit(f"Data API gaf {r.status_code}:\n{r.text[:800]}")
    return r.json().get("rows", [])


def inrichten(s, prop):
    bestaand = {d["parameterName"] for d in alle(s, f"{ADMIN}/{prop}/customDimensions", "customDimensions")}
    for par, naam, uitleg in DIMENSIES:
        if par in bestaand:
            print(f"dimensie bestaat al: {par}")
            continue
        r = s.post(f"{ADMIN}/{prop}/customDimensions",
                   json={"parameterName": par, "displayName": naam, "description": uitleg, "scope": "EVENT"})
        print(f"dimensie {par}: {'gemaakt' if r.ok else 'MISLUKT ' + r.text[:300]}")
    ke = {k["eventName"] for k in alle(s, f"{ADMIN}/{prop}/keyEvents", "keyEvents")}
    for ev in BELANGRIJK:
        if ev in ke:
            print(f"belangrijke gebeurtenis bestaat al: {ev}")
            continue
        r = s.post(f"{ADMIN}/{prop}/keyEvents", json={"eventName": ev, "countingMethod": "ONCE_PER_EVENT"})
        print(f"belangrijke gebeurtenis {ev}: {'gemaakt' if r.ok else 'MISLUKT ' + r.text[:300]}")

    # Diagnose: komt er wel iets binnen?
    rijen = rapport(s, prop, {"dateRanges": [{"startDate": "28daysAgo", "endDate": "today"}],
                              "dimensions": [{"name": "eventName"}], "metrics": [{"name": "eventCount"}],
                              "limit": 50})
    print("\ngebeurtenissen afgelopen 28 dagen:")
    for r in rijen:
        print(f"  {r['dimensionValues'][0]['value']}: {r['metricValues'][0]['value']}")
    if not rijen:
        print("  GEEN. Deze property krijgt geen gegevens binnen.")


def trechter(s, prop):
    eind = date.today() - timedelta(days=1)
    begin = eind - timedelta(days=27)
    rijen = rapport(s, prop, {
        "dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
        "dimensions": [{"name": "eventName"}, {"name": "customEvent:product"}],
        "metrics": [{"name": "totalUsers"}, {"name": "eventCount"}],
        "dimensionFilter": {"filter": {"fieldName": "eventName", "inListFilter": {"values": [
            "configurator_stap", "offerte_formulier_open", "generate_lead", "mand_toevoegen", "afrekenen_open"]}}},
        "limit": 500})
    t = {}
    for r in rijen:
        ev, prod = (d["value"] for d in r["dimensionValues"])
        t.setdefault(prod, {})[ev] = int(r["metricValues"][0]["value"])
    bezoek = rapport(s, prop, {"dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
                               "metrics": [{"name": "totalUsers"}, {"name": "sessions"}]})
    bez = bezoek[0]["metricValues"] if bezoek else [{"value": "0"}, {"value": "0"}]

    def pct(a, b):
        return f"{100 * a / b:.0f}%" if b else "–"
    regels = [f"# Trechter per product, {begin:%d-%m} t/m {eind:%d-%m-%Y}", "",
              f"Bezoekers: {int(bez[0]['value']):,} · sessies: {int(bez[1]['value']):,}".replace(",", "."), "",
              "| Product | Configurator gebruikt | Formulier geopend | Aanvraag verstuurd | Formulier → aanvraag |",
              "|---|---|---|---|---|"]
    for prod in ("kozijnloze-deur", "gietvloer", "kast", "afwerking-nieuwbouw", "onzichtbare-plint"):
        v = t.get(prod, {})
        c, f, l = v.get("configurator_stap", 0), v.get("offerte_formulier_open", 0), v.get("generate_lead", 0)
        regels.append(f"| {prod} | {c or '–'} | {f} | {l} | {pct(l, f)} |")
    winkel = {k: sum(t.get(p, {}).get(k, 0) for p in t if p.startswith("winkel"))
              for k in ("mand_toevoegen", "afrekenen_open", "generate_lead")}
    regels += ["", f"Winkel: {winkel['mand_toevoegen']} in het mandje · {winkel['afrekenen_open']} afrekenen geopend · "
               f"{winkel['generate_lead']} bestellingen", "",
               "Aantallen zijn gebruikers. Een product zonder cijfer in de eerste kolom heeft geen configurator.",
               "De productkolom vult zich pas vanaf de dag dat de eigen dimensie 'product' bestaat."]
    overig = sorted(p for p in t if p not in ("kozijnloze-deur", "gietvloer", "kast", "afwerking-nieuwbouw",
                                               "onzichtbare-plint") and not p.startswith("winkel"))
    if overig:
        regels += ["", "Overig: " + ", ".join(f"{p} ({t[p].get('generate_lead', 0)} aanvragen)" for p in overig)]
    # Terugkerende bezoekers en betrokkenheid per groep pagina's (3-11-2026): komen mensen terug, en waar
    # blijven ze? Groep = het eerste deel van het pad (/loodgieter/, /nieuwbouw-project/, ...).
    nvr = rapport(s, prop, {"dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
                            "dimensions": [{"name": "newVsReturning"}], "metrics": [{"name": "activeUsers"}]})
    nv = {r["dimensionValues"][0]["value"]: int(r["metricValues"][0]["value"]) for r in nvr}
    tot_nv = sum(nv.values())
    regels += ["", "## Komen bezoekers terug?", "",
               f"Nieuw: {nv.get('new', 0):,} · terugkerend: {nv.get('returning', 0):,}".replace(",", ".")
               + (f" ({100 * nv.get('returning', 0) / tot_nv:.0f}%)" if tot_nv else "")]
    paden = rapport(s, prop, {"dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
                              "dimensions": [{"name": "pagePath"}, {"name": "newVsReturning"}],
                              "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}, {"name": "userEngagementDuration"}],
                              "limit": 25000})
    groep = {}
    for r in paden:
        pad, soort = (d["value"] for d in r["dimensionValues"])
        g = "/" + (pad.strip("/").split("/")[0] + "/" if pad.strip("/") else "")
        x = groep.setdefault(g, {"views": 0, "gebruikers": 0, "terug": 0, "sec": 0.0})
        v, u, sec = int(r["metricValues"][0]["value"]), int(r["metricValues"][1]["value"]), float(r["metricValues"][2]["value"])
        x["views"] += v; x["gebruikers"] += u; x["sec"] += sec
        if soort == "returning": x["terug"] += u
    top = sorted(groep.items(), key=lambda kv: -kv[1]["views"])[:15]
    regels += ["", "| Groep | Weergaven | Gebruikers | Waarvan terugkerend | Tijd per gebruiker |", "|---|---|---|---|---|"]
    for g, x in top:
        regels.append(f"| {g} | {x['views']} | {x['gebruikers']} | {100 * x['terug'] / x['gebruikers']:.0f}% | {x['sec'] / max(1, x['gebruikers']):.0f} s |"
                      if x["gebruikers"] else f"| {g} | {x['views']} | 0 | – | – |")
    # "Volg je project" (sinds 3-11-2026)
    volg = rapport(s, prop, {"dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
                             "dimensions": [{"name": "eventName"}], "metrics": [{"name": "eventCount"}],
                             "dimensionFilter": {"filter": {"fieldName": "eventName", "inListFilter": {"values": ["project_volgen", "projectkorting_delen"]}}}})
    vv = {r["dimensionValues"][0]["value"]: r["metricValues"][0]["value"] for r in volg}
    regels += ["", f"Project gevolgd: {vv.get('project_volgen', 0)} keer · projectkorting gedeeld: {vv.get('projectkorting_delen', 0)} keer"]

    # Vakbedrijfprofielen (profielblok sinds 3-11-2026): klikken per plek.
    plekken = rapport(s, prop, {
        "dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
        "dimensions": [{"name": "eventName"}, {"name": "customEvent:plek"}],
        "metrics": [{"name": "eventCount"}],
        "dimensionFilter": {"filter": {"fieldName": "eventName", "inListFilter": {"values": [
            "commerciele_stap", "afwerk_klik"]}}},
        "limit": 100})
    if plekken:
        regels += ["", "## Klikken per plek", "", "| Event | Plek | Klikken |", "|---|---|---|"]
        for r in sorted(plekken, key=lambda r: -int(r["metricValues"][0]["value"])):
            ev, pl = (d["value"] for d in r["dimensionValues"])
            regels.append(f"| {ev} | {pl} | {r['metricValues'][0]['value']} |")
        regels += ["", "Profielblok: commerciele_stap plek profiel-boven (beide knoppen) en afwerk_klik plek profiel "
                   "(alleen 'Vraag een offerte aan bij Bylder'). Nulmeting tot 3-11: 8 klikken op de stap."]
    os.makedirs(os.path.dirname(RAPPORT), exist_ok=True)
    open(RAPPORT, "w", encoding="utf8").write("\n".join(regels) + "\n")
    print("\n".join(regels))


def paden(s, prop, prefix):
    """Per pagina binnen een groep (bv. /kozijnloze-deuren/): weergaven, gebruikers, tijd, terugkerend."""
    eind = date.today() - timedelta(days=1)
    begin = eind - timedelta(days=27)
    rijen = rapport(s, prop, {"dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
                              "dimensions": [{"name": "pagePath"}],
                              "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}, {"name": "userEngagementDuration"}],
                              "dimensionFilter": {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "BEGINS_WITH", "value": prefix}}},
                              "limit": 200})
    print(f"Pagina's onder {prefix}, {begin:%d-%m} t/m {eind:%d-%m-%Y}")
    for r in sorted(rijen, key=lambda r: -int(r["metricValues"][0]["value"])):
        pad = r["dimensionValues"][0]["value"]
        v, u, sec = (float(m["value"]) for m in r["metricValues"])
        print(f"  {pad}: {int(v)} weergaven, {int(u)} gebruikers, {sec / max(1, u):.0f} s per gebruiker")
    # Bronnen van die gebruikers, om te zien waar ze vandaan komen.
    bron = rapport(s, prop, {"dateRanges": [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}],
                             "dimensions": [{"name": "sessionDefaultChannelGroup"}], "metrics": [{"name": "activeUsers"}],
                             "dimensionFilter": {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "BEGINS_WITH", "value": prefix}}}})
    print("  kanalen: " + ", ".join(f"{r['dimensionValues'][0]['value']} {r['metricValues'][0]['value']}" for r in bron))


def vanaf(s, prop, pad):
    """Wat doen bezoekers op één pagina (bv. de homepage)? Weergaven, gebeurtenissen op die pagina,
    de pagina's waar ze daarna heen gaan (verwijzer = deze pagina) en de klikken per plek/knop.
    Voor de UX-audit van 11-11-2026: welke blokken van de homepage worden gebruikt?"""
    eind = date.today() - timedelta(days=1)
    begin = eind - timedelta(days=27)
    dr = [{"startDate": begin.isoformat(), "endDate": eind.isoformat()}]
    op = {"filter": {"fieldName": "pagePath", "stringFilter": {"matchType": "EXACT", "value": pad}}}
    print(f"Pagina {pad}, {begin:%d-%m} t/m {eind:%d-%m-%Y}")
    for r in rapport(s, prop, {"dateRanges": dr, "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}, {"name": "userEngagementDuration"}, {"name": "bounceRate"}], "dimensionFilter": op}):
        v, u, sec, b = (float(m["value"]) for m in r["metricValues"])
        print(f"  {int(v)} weergaven, {int(u)} gebruikers, {sec / max(1, u):.0f} s per gebruiker, {b * 100:.0f}% zonder interactie")
    print("  Gebeurtenissen op deze pagina:")
    for r in sorted(rapport(s, prop, {"dateRanges": dr, "dimensions": [{"name": "eventName"}], "metrics": [{"name": "eventCount"}, {"name": "activeUsers"}], "dimensionFilter": op}), key=lambda r: -int(r["metricValues"][0]["value"])):
        print(f"    {r['dimensionValues'][0]['value']}: {r['metricValues'][0]['value']} keer, {r['metricValues'][1]['value']} gebruikers")
    for dim in ("customEvent:plek", "customEvent:knop", "linkUrl"):
        try:
            rijen = rapport(s, prop, {"dateRanges": dr, "dimensions": [{"name": "eventName"}, {"name": dim}], "metrics": [{"name": "eventCount"}], "dimensionFilter": op, "limit": 60})
        except SystemExit as e:
            print(f"  ({dim} niet beschikbaar: {str(e)[:80]})"); continue
        rijen = [r for r in rijen if r["dimensionValues"][1]["value"] not in ("(not set)", "")]
        if rijen:
            print(f"  Klikken per {dim}:")
            for r in sorted(rijen, key=lambda r: -int(r["metricValues"][0]["value"]))[:40]:
                print(f"    {r['dimensionValues'][0]['value']} · {r['dimensionValues'][1]['value']}: {r['metricValues'][0]['value']}")
    print("  Waar ze daarna heen gaan (pagina's met deze pagina als verwijzer):")
    for host in ("https://www.bylder.com", "https://bylder.com"):
        ref = {"filter": {"fieldName": "pageReferrer", "stringFilter": {"matchType": "EXACT", "value": host + pad}}}
        rijen = rapport(s, prop, {"dateRanges": dr, "dimensions": [{"name": "pagePath"}], "metrics": [{"name": "screenPageViews"}], "dimensionFilter": ref, "limit": 60})
        for r in sorted(rijen, key=lambda r: -int(r["metricValues"][0]["value"]))[:40]:
            if r["dimensionValues"][0]["value"] != pad:
                print(f"    {r['dimensionValues'][0]['value']}: {r['metricValues'][0]['value']}")


if __name__ == "__main__":
    taak = sys.argv[1] if len(sys.argv) > 1 else "trechter"
    s = sessie()
    prop = vind_property(s)
    if taak == "inrichten":
        inrichten(s, prop)
    elif taak.startswith("vanaf:"):
        vanaf(s, prop, taak.split(":", 1)[1])
    elif taak.startswith("paden:"):
        paden(s, prop, taak.split(":", 1)[1])
    else:
        trechter(s, prop)
