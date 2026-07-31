#!/usr/bin/env bash
# Vercel "Ignored Build Step": exit 0 = build overslaan, exit 1 = bouwen.
#
# Waarom een script en geen inline ignoreCommand: de uitsluitingslijst werd
# 293 tekens en Vercel weigert een ignoreCommand boven 256 — dat brak elke
# deploy met "schema validation failed". De logica hoort hier: onbeperkt lang,
# leesbaar en testbaar.
#
# Sla de build over als er in deze commit NIETS buiten deze paden wijzigde.
set -u

EXCL=(
  ':(exclude)_audits'      ':(exclude)reports'
  ':(exclude).claude'      ':(exclude)__pycache__'
  ':(exclude)output'       ':(exclude)supabase'
  ':(exclude)scripts'      ':(exclude)_scripts'
  ':(exclude).github'      ':(exclude).DS_Store'
  ':(exclude)*.md'         ':(exclude)*.py'
)

# Preview-builds standaard overslaan (besluit 29-07-2026). Elke wijziging bouwde
# twee keer — eerst een preview bij de PR, daarna productie na de merge — en één
# build van deze site duurt een kwartier. Bij een reeks wijzigingen op een dag
# staan er zo drie builds in de rij en loopt productie ver achter.
#
# Ontsnappingsluik: een branch die met `preview/` begint bouwt wél. Gebruik dat
# voor wijzigingen die je eerst wilt zíén — een nieuwe pagina, een andere
# volgorde, een ander ontwerp. Voor tekstcorrecties en data is het overbodig.
if [ "${VERCEL_ENV:-}" = "preview" ]; then
  case "${VERCEL_GIT_COMMIT_REF:-}" in
    preview/*) echo "Preview-branch — bouwen." ;;
    *) echo "Preview overgeslagen (branch begint niet met preview/)." ; exit 0 ;;
  esac
fi

# Geen parent (eerste commit / shallow clone): altijd bouwen.
git rev-parse --verify HEAD^ >/dev/null 2>&1 || exit 1

if git diff --quiet HEAD^ HEAD -- . "${EXCL[@]}"; then
  echo "Alleen docs/scripts/reports gewijzigd — build overgeslagen."
  exit 0
fi
echo "Sitewijzigingen gevonden — bouwen."
exit 1
