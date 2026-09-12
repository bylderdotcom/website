// Showroomgids — leest data/showrooms.json op build-time.
// Alleen build/server (fs) — nooit in een client-component importeren.
//
// De gids is een reisgids voor woningkopers: per producttype een kleine,
// gecureerde selectie showrooms met een geschreven reden om erheen te gaan.
// Vermeldingen komen van Daniel; de feiten komen van de eigen website van de
// showroom, met datum. Geen reviewteksten, geen eigendomsverhoudingen, geen
// partnerlabel tenzij dat per showroom is afgesproken (besluit 12-09-2026).

import fs from 'node:fs'
import path from 'node:path'

export type ShowroomType = { slug: string; naam: string; kopen: string; intro: string }
export type Showroom = {
  id: string
  type: string
  naam: string
  plaats: string
  adres: string
  website: string
  telefoon?: string
  lat?: number
  lng?: number
  uren?: string
  feiten: string[]
  tip: string
  tip_status: 'concept' | 'definitief'
  bron_datum: string
}

type Bestand = { types: ShowroomType[]; showrooms: Showroom[] }

let cache: Bestand | null = null
function lees(): Bestand {
  if (cache) return cache
  const p = path.join(process.cwd(), '..', 'data', 'showrooms.json')
  cache = JSON.parse(fs.readFileSync(p, 'utf8')) as Bestand
  return cache
}

/** Alleen types die minstens één vermelding hebben — een lege gids bestaat niet. */
export function showroomTypes(): ShowroomType[] {
  const d = lees()
  const met = new Set(d.showrooms.map(s => s.type))
  return d.types.filter(t => met.has(t.slug))
}

export function showroomType(slug: string): ShowroomType | undefined {
  return lees().types.find(t => t.slug === slug)
}

export function showroomsVanType(slug: string): Showroom[] {
  return lees().showrooms.filter(s => s.type === slug)
}

export function alleShowrooms(): Showroom[] {
  return lees().showrooms
}

/** Datum als "12 september 2026", voor de bronregel onder een vermelding. */
export function datumNl(iso: string): string {
  const [j, m, d] = iso.split('-').map(Number)
  const maanden = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
    'augustus', 'september', 'oktober', 'november', 'december']
  return `${d} ${maanden[m - 1]} ${j}`
}
