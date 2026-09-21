// Relevante interne links onder een bedrijfsprofiel, gerangschikt door Jev (TypeSafe).
//
// Waarom dit bestaat: de bestaande tegels ("Andere gietvloer-specialisten in
// <stad>") komen uit de oude generator en volgen één regel — zelfde stad. Is een
// bedrijf het enige in zijn plaats, dan blijft dat blok leeg. Over alle acht
// city+bedrijf-clusters heen hebben 2.345 profielen nul gerelateerde links en
// 4.077 er hooguit één (gemeten 21-09-2026).
//
// Bereikbaarheid is niet het probleem — die staat op 99,5% sinds de
// link-architectuur van juli (reports/interne-linkarchitectuur-ontwerp.md).
// Relevantie wel: een kilometerregel zet een parketzaak naast een gietvloerder.
// Vandaar de voorselectie in code (zelfde vak, dichtstbij, straal begrensd) en het
// oordeel bij Jev. De data komt uit scripts/jev_interne_links.py; hier alleen de
// renderlaag. Geen bestand = geen blok, dus de site bouwt ook zonder.

import fs from 'node:fs'
import path from 'node:path'

export type ExtraLink = {
  href: string
  name: string
  rating?: string | number | null
  km: number
  noul: number
}

const REPO = path.join(process.cwd(), '..')
const _cache: Record<string, Record<string, ExtraLink[]>> = {}

function getLinks(cluster: string): Record<string, ExtraLink[]> {
  if (!(cluster in _cache)) {
    const p = path.join(REPO, 'data', 'interne-links', `${cluster}.json`)
    try {
      _cache[cluster] = JSON.parse(fs.readFileSync(p, 'utf8'))
    } catch {
      _cache[cluster] = {}
    }
  }
  return _cache[cluster]
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Afstand in hele kilometers; onder de 1 km is "minder dan 1 km" eerlijker dan 0.
function afstand(km: number): string {
  return km < 1 ? 'minder dan 1 km' : `${Math.round(km)} km`
}

/**
 * Het blok met extra links, of een lege string als er voor dit profiel niets is.
 * Wordt vóór </main> ingevoegd, net als het markt- en claimblok.
 */
export function extraLinksHtml(cluster: string, slug: string, vakLabel: string): string {
  const links = getLinks(cluster)[slug]
  if (!links || links.length === 0) return ''

  const tegels = links.map(l => {
    const naam = esc(l.name)
    const meta = `${afstand(l.km)}${l.rating ? ` &middot; &#9733; ${esc(String(l.rating))}` : ''}`
    return `<a href="${l.href}" class="tile">${naam} `
      + `<span style="color:rgba(61,46,30,0.72);font-weight:400;">${meta}</span></a>`
  }).join('')

  return '<h2 style="font-size:1.4rem;font-weight:800;margin:40px 0 6px;">'
    + `Ook ${esc(vakLabel)} in de omgeving</h2>`
    + '<p style="font-size:14px;color:rgba(61,46,30,0.72);margin-bottom:14px;">'
    + 'Staat er in deze plaats maar één specialist, dan zijn dit de dichtstbijzijnde '
    + 'bedrijven die vergelijkbaar werk doen.</p>'
    + `<div class="grid-3">${tegels}</div>`
}
