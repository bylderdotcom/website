import fs from 'node:fs'
import path from 'node:path'

// Links van een bedrijfsprofiel naar de stadspagina van zijn plaats (23-10-2026).
//
// Een stadspagina bestaat per vak alleen voor de grotere plaatsen (bv. 291 bij stukadoors).
// Het profielsjabloon linkte toch altijd naar /<vak>/<plaats>/: ruim 4.000 profielen
// verwezen zo naar een 404. Het vangnet in de build (_scripts/dode_links_pass.py) zet zo'n
// link om naar /<vak>/, maar de tekst bleef "Bekijk alle stukadoors in Zuidwolde". Hier
// krijgt de link meteen een doel én een tekst die kloppen:
//
//   kruimelpad "Zuidwolde"                → de plaatsnaam zonder link
//   "Bekijk alle stukadoors in Zuidwolde" → "… in Meppel" als een andere plaats in dezelfde
//   "stukadoors in Zuidwolde"               gemeente een pagina heeft (die met de meeste
//                                           bedrijven), anders "Bekijk alle stukadoors" en
//                                           "alle stukadoors" naar /<vak>/
//
// Plaats → gemeente komt uit data/plaats-gemeente.json.

const REPO = path.join(process.cwd(), '..')
let _gemeente: Record<string, string> | null = null
function gemeenteVan(plaats: string): string | undefined {
  if (!_gemeente) {
    _gemeente = {}
    try {
      const p = JSON.parse(fs.readFileSync(path.join(REPO, 'data', 'plaats-gemeente.json'), 'utf8')).plaatsen
      for (const [k, v] of Object.entries(p as Record<string, { slug: string }>)) _gemeente[k] = v.slug
    } catch { /* zonder koppeling: altijd naar het overzicht */ }
  }
  return _gemeente[plaats]
}

type Stad = { city: string; companies: unknown[] }

/** De stadspagina in dezelfde gemeente met de meeste bedrijven, of null. */
export function stadInGemeente(plaats: string, steden: Record<string, Stad>): string | null {
  const g = gemeenteVan(plaats)
  if (!g) return null
  let beste: string | null = null
  for (const [slug, s] of Object.entries(steden)) {
    if (gemeenteVan(slug) === g && (!beste || s.companies.length > steden[beste].companies.length)) beste = slug
  }
  return beste
}

const regex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function stadslinks(html: string, vak: string, plaats: string | undefined, plaatsNaam: string | undefined,
  steden: Record<string, Stad>): string {
  if (!plaats || !plaatsNaam || plaats in steden) return html
  const alt = stadInGemeente(plaats, steden)
  const naam = regex(plaatsNaam)
  return html.replace(new RegExp(`<a href="/${regex(vak)}/${regex(plaats)}/"([^>]*)>([^<]*)</a>`, 'g'), (_, attrs: string, tekst: string) => {
    if (tekst.trim() === plaatsNaam) return `<span${attrs}>${tekst}</span>`
    if (alt) return `<a href="/${vak}/${alt}/"${attrs}>${tekst.replace(new RegExp(naam, 'g'), steden[alt].city)}</a>`
    const zonder = tekst.replace(new RegExp(` in ${naam}`, 'g'), '')
    return `<a href="/${vak}/"${attrs}>${/^Bekijk\b/.test(zonder) ? zonder : `alle ${zonder}`}</a>`
  })
}
