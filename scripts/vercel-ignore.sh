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

# Geen parent (eerste commit / shallow clone): altijd bouwen.
git rev-parse --verify HEAD^ >/dev/null 2>&1 || exit 1

if git diff --quiet HEAD^ HEAD -- . "${EXCL[@]}"; then
  echo "Alleen docs/scripts/reports gewijzigd — build overgeslagen."
  exit 0
fi
echo "Sitewijzigingen gevonden — bouwen."
exit 1
