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
# --ignore-existing: bestanden die Next al genereerde worden NIET overschreven,
# dus de door Next gerenderde /prijzen/ blijft staan; al het andere komt van de
# bestaande site. Dev-/bron-mappen worden uitgesloten. api/ NIET meekopiëren:
# Vercel detecteert serverless functions altijd op basis van de repo-root
# /api/-map, ongeacht outputDirectory — een statische kopie van die .js-bestanden
# in web/out/api/ voegt niks toe, lekt broncode van de betaalroutes als platte
# tekst, en kan de echte functie-routing in de weg zitten.
rsync -a --ignore-existing \
  --exclude '.git' --exclude 'web' --exclude 'node_modules' \
  --exclude '__pycache__' --exclude 'data' --exclude 'scripts' \
  --exclude '_scripts' --exclude '_audits' --exclude 'reports' \
  --exclude '.claude' --exclude 'out' --exclude '.next' \
  --exclude '*.py' --exclude '*.pyc' \
  --exclude 'api' --exclude '.vercel' --exclude 'supabase' \
  "$ROOT"/ ./out/

echo "✓ klaar — web/out bevat de volledige site (Next + bestaand)"
