// Wat een bewoner met de vouchers kan besparen, gerekend op onze eigen data.
// Alleen build/server (fs) — nooit in een client-component importeren.
//
// WAAROM DIT BESTAND BESTAAT
// Op de site stonden jarenlang vaste bedragen ("gemiddeld €4.200 bespaard",
// "€1.640"). Die kwamen uit een bulkronde paginageneratie: geen meting, geen
// bron, en ze spraken elkaar tegen. Nagerekend bleek €1.640 het láágste
// scenario te zijn, gepresenteerd als het gemiddelde (onderzoek 12-09-2026).
//
// Eén ding is wél hard: het percentage dat elk merk geeft. Dat staat in
// data/deelnemers.json en is na te tellen op deze pagina zelf. Daarom rekent de
// site niet meer vóór de bezoeker, maar mét hem: hij vult zijn eigen budget in
// en krijgt zijn eigen bedrag, opgebouwd uit die percentages.
//
// De mediaan, niet het hoogste merk: wie in een categorie bij het best
// kortende merk koopt, komt hoger uit, maar dat is niet de verwachting die we
// mogen wekken. Het hoogste merk staat er los bij ("tot 25% bij Parketgigant").

import fs from 'node:fs'
import path from 'node:path'

export type Post = {
  id: string
  /** Zoals een koper het noemt, niet zoals onze data het indeelt. */
  naam: string
  /** Wat er gebruikelijk aan opgaat; vult het formulier voor. Bron: zie onderzoek. */
  standaard: number
  /** Mediaan van de percentages in deze post. */
  procent: number
  /** Het best kortende merk, om "tot …%" eerlijk te kunnen tonen. */
  hoogste: { merk: string; procent: number } | null
  /** Hoeveel merken meedoen in deze post. */
  merken: number
}

type Deelnemer = { naam?: string; cat?: string; aanbod?: string }

/** Onze categorieën bij elkaar geveegd tot posten die een koper herkent. */
const POSTEN: { id: string; naam: string; standaard: number; cats: string[] }[] = [
  { id: 'vloer', naam: 'Vloer', standaard: 6000, cats: ['PVC vloer', 'Gietvloer', 'Vloertegels', 'Trapbekleding'] },
  { id: 'meubels', naam: 'Meubels en bed', standaard: 10000, cats: ['Meubelen'] },
  { id: 'sanitair', naam: 'Sanitair en tegels', standaard: 6000, cats: ['Sanitair', 'Wandtegels'] },
  { id: 'tuin', naam: 'Tuin', standaard: 3000, cats: ['Tuin', 'Tuinmeubelen'] },
  { id: 'deuren', naam: 'Binnendeuren', standaard: 2500, cats: ['Deuren'] },
  { id: 'kasten', naam: 'Kasten', standaard: 2000, cats: ['Kasten'] },
  { id: 'raamdecoratie', naam: 'Raamdecoratie en zonwering', standaard: 1500, cats: ['Raamdecoratie', 'Zonwering'] },
  { id: 'verlichting', naam: 'Verlichting', standaard: 1200, cats: ['Verlichting'] },
  { id: 'wand', naam: 'Behang en wandafwerking', standaard: 800, cats: ['Behang', 'Muurbekleding'] },
]

/** Posten waar we géén merk met een percentage hebben — die noemen we apart. */
export const NIET_GEDEKT = [
  { naam: 'Keuken', waarom: 'één merk met een vast bedrag van €750, geen percentage' },
  { naam: 'Stuc- en schilderwerk', waarom: 'alleen €1 per m² bij Super-stuc' },
  { naam: 'Het arbeidsloon van vakbedrijven', waarom: 'daar gaan de vouchers niet over' },
]

function mediaan(getallen: number[]): number {
  const s = [...getallen].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

let _cache: Post[] | null = null

export function posten(): Post[] {
  if (_cache) return _cache
  const p = path.join(process.cwd(), '..', 'data', 'deelnemers.json')
  const rauw = JSON.parse(fs.readFileSync(p, 'utf8'))
  const lijst: Deelnemer[] = Array.isArray(rauw) ? rauw : rauw.deelnemers

  _cache = POSTEN.map(({ id, naam, standaard, cats }) => {
    const inPost = lijst.filter(d => d.cat && cats.includes(d.cat))
    const metProcent = inPost
      .map(d => ({ merk: d.naam || '', procent: Number((d.aanbod || '').match(/(\d{1,2})\s*%/)?.[1] ?? 0) }))
      .filter(x => x.procent > 0)
    if (!metProcent.length) return null
    const top = metProcent.reduce((a, b) => (b.procent > a.procent ? b : a))
    const mid = mediaan(metProcent.map(x => x.procent))
    return {
      id, naam, standaard, procent: mid,
      // Alleen tonen als het hoogste merk echt boven de mediaan uitkomt.
      hoogste: top.procent > mid ? top : null,
      merken: metProcent.length,
    }
  }).filter((x): x is Post => x !== null)

  return _cache
}
