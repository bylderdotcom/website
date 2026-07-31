#!/usr/bin/env python3
"""
Wekelijkse vers-heid-check voor /nieuwbouw-project/-pagina's.

Projectpagina's verouderen sneller dan elk ander paginatype: fases sluiten,
opleverdata verschuiven, "in verkoop" wordt "uitverkocht". Deze check haalt de
bron-URL's per project op (data/clusters/nieuwbouw-project/bronnen.json),
destilleert de signaal-zinnen (fase/verkoop/oplevering/aantallen) en vergelijkt
die met de vastgelegde snapshot.

BEWUST read-only: bij drift is de output een rapport (en in CI een issue) —
nooit een content-wijziging. Menselijke review bepaalt of en wat er op de
pagina verandert. Zie de standing order in CLAUDE.md.

Modes:
  snapshot   Leg de huidige signaal-zinnen vast als baseline (na elke review).
  check      Vergelijk met de baseline; exit 1 + rapport bij drift.
"""
import json, os, re, subprocess, sys, time, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "clusters", "nieuwbouw-project")
SNAP = os.path.join(DATA, "snapshots")
UA = "Mozilla/5.0 (compatible; BylderFreshness/1.0; +https://www.bylder.com)"
DELAY = 2.0  # beleefd — één fetch per bron per week

# Zinnen met deze signalen bepalen of de pagina-feiten nog kloppen.
SIGNAAL = re.compile(
    r"fase|verkoop|oplever|uitverkocht|start bouw|sleutel|inschrijv|loting|"
    r"koopgarant|\b\d{1,3}\s+woningen\b|\b20(2[5-9]|3\d)\b", re.I)

def fetch(url):
    for _ in range(3):
        r = subprocess.run(["curl", "-sL", "-m", "30", "-A", UA, url],
                           capture_output=True, text=True, timeout=40)
        if r.stdout and len(r.stdout) > 500:
            return r.stdout
        time.sleep(3)
    return ""

def signaal_zinnen(html):
    # HTML -> platte tekst -> genormaliseerde zinnen met een signaal erin.
    txt = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?/*a11y-focus*/:focus-visible{outline:3px solid #3D5A3E!important;outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}</style>", " ", html)
    txt = re.sub(r"<[^>]+>", " ", txt)
    txt = unicodedata.normalize("NFKC", txt)
    txt = re.sub(r"\s+", " ", txt)
    zinnen = re.split(r"(?<=[.!?])\s+", txt)
    uniq = sorted({z.strip() for z in zinnen if 25 < len(z) < 400 and SIGNAAL.search(z)})
    return uniq

def run(mode):
    reg = json.load(open(os.path.join(DATA, "bronnen.json")))
    drift_totaal = {}
    for slug, cfg in reg.items():
        huidig = {}
        for bron in cfg["bronnen"]:
            html = fetch(bron["url"])
            huidig[bron["url"]] = {"label": bron["label"],
                                   "zinnen": signaal_zinnen(html) if html else ["FETCH_MISLUKT"]}
            time.sleep(DELAY)
        snap_pad = os.path.join(SNAP, f"{slug}.json")
        if mode == "snapshot":
            json.dump(huidig, open(snap_pad, "w"), indent=1, ensure_ascii=False)
            print(f"snapshot: {slug} — {sum(len(v['zinnen']) for v in huidig.values())} signaal-zinnen")
            continue
        if not os.path.exists(snap_pad):
            print(f"GEEN BASELINE voor {slug} — draai eerst 'snapshot'"); sys.exit(2)
        oud = json.load(open(snap_pad))
        diff = {}
        for url, cur in huidig.items():
            was = set(oud.get(url, {}).get("zinnen", []))
            nu = set(cur["zinnen"])
            nieuw, weg = sorted(nu - was), sorted(was - nu)
            if nieuw or weg:
                diff[url] = {"label": cur["label"], "nieuw": nieuw[:12], "verdwenen": weg[:12]}
        if diff:
            drift_totaal[slug] = {"pagina": cfg["pagina"], "bronnen": diff}
    if mode == "check":
        rapport = os.path.join(ROOT, "reports", "project-freshness.json")
        os.makedirs(os.path.dirname(rapport), exist_ok=True)
        json.dump(drift_totaal, open(rapport, "w"), indent=1, ensure_ascii=False)
        if drift_totaal:
            print(f"DRIFT bij {len(drift_totaal)} project(en) — zie {rapport}")
            for slug, d in drift_totaal.items():
                print(f"\n## {slug} ({d['pagina']})")
                for url, b in d["bronnen"].items():
                    print(f"- {b['label']}: +{len(b['nieuw'])} nieuw, -{len(b['verdwenen'])} verdwenen")
            sys.exit(1)
        print("Geen drift — projectpagina's zijn actueel.")

if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "check")
