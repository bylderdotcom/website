#!/usr/bin/env bash
# Fase 0 — strangler-build: Next.js rendert de gemigreerde routes, de bestaande
# statische site vult alle overige paden. Eén map (web/out) = de hele site.
set -euo pipefail
cd "$(dirname "$0")"          # web/
ROOT="$(cd .. && pwd)"        # repo-root (de bestaande statische site)

echo "▸ 1/4  next build (statische export → web/out)"
npx --no-install next build

echo "▸ 2/4  RSC-prefetch-payloads opruimen (__next*.txt/index.txt per route)"
# App Router-static-export genereert per route ook RSC-prefetch-.txt-bestanden
# voor client-side <Link>-navigatie. Geen enkele geporte pagina gebruikt next/link
# (alle interne links zijn platte <a href> in dangerouslySetInnerHTML-content) —
# dus deze bestanden worden door geen enkele bezoeker ooit opgevraagd, maar wél
# ~60% van de deploy-omvang (9,9GB → 4,0GB op 45k geporte pagina's, gemeten
# 2026-07-05). Draait vóór de rsync-overlay: op dit punt bevat ./out alleen
# Next's eigen output, dus dit kan een legitieme .txt uit de bestaande site
# (bv. robots.txt) nooit raken.
find ./out -name "*.txt" -delete

# Welke HTML Next zelf schreef, vastgelegd vóór de overlay: stap 4 laat die
# pagina's met rust (ze krijgen hun menu al uit Nav.tsx).
NEXT_HTML="$(mktemp)"
find "$PWD/out" -name "*.html" > "$NEXT_HTML"

echo "▸ 3/4  overlay bestaande statische site (Next-pagina's blijven behouden)"
# Bestanden die Next al genereerde worden NIET overschreven (cp -n), dus de
# door Next gerenderde routes blijven staan; al het andere komt van de
# bestaande site. Dev-/bron-mappen worden uitgesloten (top-level; geneste
# data/scripts/*.py-varianten zitten uitsluitend onder .claude/, dat als
# geheel al uitgesloten is). api/ NIET meekopiëren: Vercel detecteert
# serverless functions altijd op basis van de repo-root /api/-map, ongeacht
# outputDirectory — een statische kopie van die .js-bestanden in web/out/api/
# voegt niks toe, lekt broncode van de betaalroutes als platte tekst, en kan
# de echte functie-routing in de weg zitten.
#
# Geen rsync: niet gegarandeerd aanwezig in Vercel's build-image (faalde daar
# met exit 127, "command not found" — rsync zit niet in het standaard build-
# image). cp -a -n (archive + no-clobber, beide standaard-coreutils-vlaggen)
# is het portable alternatief. Getest: volledige overlay van het grootste
# geporte cluster (kopen, 33k pagina's, alles bestaat al) kost ~5s — ruim
# snel genoeg t.o.v. de 45-min-buildlimiet van Vercel.
#
# output/ NIET meekopiëren: verweesd, verouderd tussenresultaat van
# generate.py (dunnere kopie van nieuwbouw-gids/ en tools/, zonder de
# FAQ/Breadcrumb/Article-schema die de echte root-pagina's wél hebben, en met
# niet-www canonicals). Stond live zonder dat iets ernaar linkt of het in de
# sitemap staat — gevonden via de wekelijkse audit van 2026-07-06, hier
# opgelost door 'm niet langer te serveren i.p.v. de losse canonicals te
# patchen (de map zelf blijft ongemoeid in de repo, alleen niet meer gedeployed).
# bylder-seo-v3/v4/v5 NIET meekopiëren: stale concept-snapshots (1:1 duplicaat
# van live pagina's, canonical wijst er al naar terug — zelfde klasse als
# output/, gevonden bij de Fase-4 interne-linkarchitectuur-opruiming 8 jul).
# templates/ NIET meekopiëren: dit zijn de bronbestanden met {{city}}-
# placeholders waaruit de clusterpagina's worden gerenderd. Ze stonden live
# (902 bestanden, HTTP 200, niet in robots.txt) en zijn bijna-duplicaat van
# elke echte clusterpagina — precies het soort dunne, crawlbare kopie waar
# de indexatie last van heeft. Gemeten 2026-07-27.
# docs/ NIET meekopiëren: interne strategiestukken (prijsmodel, concurrentie-
# analyse, B2B-acquisitieplan) stonden publiek leesbaar. Dezelfde meting.
# _og-templates/ NIET meekopiëren: HTML/SVG-bron waaruit og/*.jpg wordt
# gegenereerd; de gegenereerde jpg's in og/ blijven wél staan.
EXCLUDE_TOP=(.git web node_modules __pycache__ data scripts _scripts _audits reports .claude out .next api .vercel supabase output bylder-seo-v3 bylder-seo-v4 bylder-seo-v5 templates docs _og-templates)
# Losse bestanden in de repo-root die geen publieke functie hebben. vercel.json
# lekt de volledige redirect- en headerconfiguratie; package.json de exacte
# dependency-versies. De rest is bron of intern. Alles wat hier NIET staat
# blijft gewoon publiek: robots.txt, llms.txt, de sitemaps, favicons,
# site.webmanifest, og-image.jpg, auping-popup.js en scan.js.
EXCLUDE_FILE=(package.json package-lock.json vercel.json RECOVERY.md CLAUDE.md gemeenten_data_v2.csv template_v2.html)
for entry in "$ROOT"/*; do
  name="$(basename "$entry")"
  excluded=false
  for ex in "${EXCLUDE_TOP[@]}" "${EXCLUDE_FILE[@]}"; do
    if [ "$name" = "$ex" ]; then excluded=true; break; fi
  done
  $excluded && continue
  case "$name" in *.py|*.pyc|*.log) continue ;; esac
  # cp -n geeft (anders dan rsync --ignore-existing) exit 1 zodra het een
  # bestaand bestand overslaat — bedoeld gedrag hier (Next-output blijft
  # staan), dus expliciet opvangen zodat set -e het script niet afbreekt.
  if [ -d "$entry" ]; then
    mkdir -p "./out/$name"
    cp -a -n "$entry"/. "./out/$name"/ || true
  else
    cp -n "$entry" "./out/$name" || true
  fi
done

echo "▸ 4/4  menu uit web/app/components/menu.json op elke statische pagina"
# Eén menu voor de hele site (11-10-2026). Tot deze dag zat het menu als
# kopie in ~38.000 statische HTML-bestanden en moest elke wijziging met een
# veegronde worden rondgebracht; clusters die die ronde misten liepen achter.
# Nu zet elke build het menu opnieuw neer, uit hetzelfde bestand dat Nav.tsx
# leest. Een wijziging in menu.json staat dus na de volgende deploy overal.
# Zonder python3 geen afgebroken deploy: dan blijft het menu staan zoals het
# in de bestanden zat, en zegt de bouwlog dat hardop.
if command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/_scripts/nav_pijlers_pass.py" --stempel ./out "$NEXT_HTML"
else
  echo "⚠ python3 ontbreekt: menu NIET bijgewerkt op de statische pagina's"
fi
rm -f "$NEXT_HTML"

# De zoeklijst achter het zoekvak op de homepage, vers uit de projectpagina's. Stond tot
# 20-10-2026 met de hand in web/public/ en liep een maand achter (38 van 288 projecten).
if command -v python3 >/dev/null 2>&1; then
  python3 "$ROOT/_scripts/zoek_index.py" --uit ./out/zoek-index.json
fi

echo "✓ klaar — web/out bevat de volledige site (Next + bestaand)"
