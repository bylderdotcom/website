#!/usr/bin/env bash
# Fase 0 — strangler-build: Next.js rendert de gemigreerde routes, de bestaande
# statische site vult alle overige paden. Eén map (web/out) = de hele site.
set -euo pipefail
cd "$(dirname "$0")"          # web/
ROOT="$(cd .. && pwd)"        # repo-root (de bestaande statische site)

echo "▸ 1/2  next build (statische export → web/out)"
npx --no-install next build

echo "▸ 2/2  overlay bestaande statische site (Next-pagina's blijven behouden)"
# --ignore-existing: bestanden die Next al genereerde worden NIET overschreven,
# dus de door Next gerenderde /prijzen/ blijft staan; al het andere komt van de
# bestaande site. Dev-/bron-mappen worden uitgesloten.
rsync -a --ignore-existing \
  --exclude '.git' --exclude 'web' --exclude 'node_modules' \
  --exclude '__pycache__' --exclude 'data' --exclude 'scripts' \
  --exclude '_scripts' --exclude '_audits' --exclude 'reports' \
  --exclude '.claude' --exclude 'out' --exclude '.next' \
  --exclude '*.py' --exclude '*.pyc' \
  "$ROOT"/ ./out/

echo "✓ klaar — web/out bevat de volledige site (Next + bestaand)"
