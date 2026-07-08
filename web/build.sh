#!/usr/bin/env bash
# Fase 0 — strangler-build: Next.js rendert de gemigreerde routes, de bestaande
# statische site vult alle overige paden. Eén map (web/out) = de hele site.
set -euo pipefail
cd "$(dirname "$0")"          # web/
ROOT="$(cd .. && pwd)"        # repo-root (de bestaande statische site)

echo "▸ 1/3  next build (statische export → web/out)"
npx --no-install next build

echo "▸ 2/3  RSC-prefetch-payloads opruimen (__next*.txt/index.txt per route)"
# App Router-static-export genereert per route ook RSC-prefetch-.txt-bestanden
# voor client-side <Link>-navigatie. Geen enkele geporte pagina gebruikt next/link
# (alle interne links zijn platte <a href> in dangerouslySetInnerHTML-content) —
# dus deze bestanden worden door geen enkele bezoeker ooit opgevraagd, maar wél
# ~60% van de deploy-omvang (9,9GB → 4,0GB op 45k geporte pagina's, gemeten
# 2026-07-05). Draait vóór de rsync-overlay: op dit punt bevat ./out alleen
# Next's eigen output, dus dit kan een legitieme .txt uit de bestaande site
# (bv. robots.txt) nooit raken.
find ./out -name "*.txt" -delete

echo "▸ 3/3  overlay bestaande statische site (Next-pagina's blijven behouden)"
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
EXCLUDE_TOP=(.git web node_modules __pycache__ data scripts _scripts _audits reports .claude out .next api .vercel supabase output bylder-seo-v3 bylder-seo-v4 bylder-seo-v5)
for entry in "$ROOT"/*; do
  name="$(basename "$entry")"
  excluded=false
  for ex in "${EXCLUDE_TOP[@]}"; do
    if [ "$name" = "$ex" ]; then excluded=true; break; fi
  done
  $excluded && continue
  case "$name" in *.py|*.pyc) continue ;; esac
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

echo "✓ klaar — web/out bevat de volledige site (Next + bestaand)"
