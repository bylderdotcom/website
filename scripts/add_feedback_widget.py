#!/usr/bin/env python3
# ============================================================================
# WIDGET "Mis je iets op deze pagina?" op elke publieke pagina zetten.
#
# De feature-request-funnel in de app verzamelt alleen van ingelogde gebruikers,
# en dat zijn er weinig. Het verkeer zit hier. Bezoekers die iets zoeken en het
# niet vinden zijn precies de groep die kan vertellen wat ontbreekt — maar die
# hadden geen enkele manier om dat kwijt te kunnen.
#
# Zelfde mechaniek als auping-popup.js: één regel <script> per pagina, het
# script doet de rest. Idempotent: pagina's die de tag al hebben slaan we over.
#
# Bewust NIET op: juridische pagina's, bedankt-/betaalpagina's en losse
# fragmenten zonder </body> (die worden ingeladen door een andere pagina, die
# de widget zelf al heeft).
#
# Draai eerst met --dry-run: dit raakt tienduizenden bestanden.
# ============================================================================
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAG = '<script src="/mis-je-iets.js" defer></script>'

# Mappen die geen bezoekerspagina's bevatten of niet meegedeployed worden.
SKIP_DIRS = {
    "node_modules", ".git", ".claude", "web", "output", "__pycache__",
    "_og-templates", "_audits", "templates", "data", "scripts", "_scripts",
}

# Pagina's waar de vraag misstaat of de flow verstoort.
# Inlog- en afrekenschermen erbij: daar is de bezoeker met iets anders bezig en
# een extra vraag onderaan leidt alleen maar af.
SKIP_NAMEN = re.compile(
    r"(algemene-voorwaarden|privacy|cookie|disclaimer|bedankt|betaal|betalen|"
    r"checkout|login|inloggen|registreer|wachtwoord)",
    re.I,
)


def kandidaten():
    for pad in ROOT.rglob("*.html"):
        rel = pad.relative_to(ROOT)
        if any(deel in SKIP_DIRS for deel in rel.parts[:-1]):
            continue
        if SKIP_NAMEN.search(str(rel)):
            continue
        yield pad


def verwerk(pad: Path, dry: bool) -> bool:
    html = pad.read_text(encoding="utf-8", errors="ignore")
    if TAG in html:
        return False
    # Fragmenten zonder eigen </body> zijn geen zelfstandige pagina.
    if "</body>" not in html:
        return False
    if not dry:
        pad.write_text(html.replace("</body>", f"  {TAG}\n</body>", 1), encoding="utf-8")
    return True


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true", help="alleen tellen, niets schrijven")
    p.add_argument("--limit", type=int, default=0, help="stop na N bestanden (voor een proef)")
    args = p.parse_args()

    geraakt = bekeken = 0
    for pad in kandidaten():
        bekeken += 1
        if verwerk(pad, args.dry_run):
            geraakt += 1
            if args.limit and geraakt >= args.limit:
                break

    actie = "zou krijgen" if args.dry_run else "gekregen"
    print(f"{bekeken} pagina's bekeken, {geraakt} {actie} de widget")
    return 0


if __name__ == "__main__":
    sys.exit(main())
