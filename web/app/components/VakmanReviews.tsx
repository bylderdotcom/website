// Beoordelingen van vakmensen op productniveau.
//
// WAAROM DIT BLOK LEEG BEGINT
// Een review is het oordeel van iemand die het product in handen heeft gehad.
// Die kun je verzamelen, niet maken. Verzonnen beoordelingen zijn een
// misleidende handelspraktijk (art. 6:193c BW) en kosten bij ontdekking ook nog
// de vindbaarheid van de hele site.
//
// Zolang er geen echte beoordelingen zijn toont dit blok dus geen sterren, geen
// gemiddelde en geen aantal — alleen een uitnodiging aan de vakman die dit
// product monteerde. Dat is dezelfde lijn als het klussenblok op de
// projectpagina's: leeg tot de eerste echte klus.
//
// GEEN aggregateRating in de structured data zolang de lijst leeg is. Een
// gemiddelde over nul beoordelingen is geen nul maar een leugen.
export type VakmanReview = {
  product: string        // sleutel waarop dit blok filtert
  naam: string
  bedrijf: string
  vak: string            // timmerman, stukadoor, ...
  plaats: string
  datum: string          // ISO
  sterren: number        // 1-5
  tekst: string
  klus?: string          // link naar de uitgevoerde klus, als die er is
}

import { readFileSync } from 'fs'
import path from 'path'

// Het bestand staat in de repo-wortel, buiten web/. Dezelfde route als
// web/lib/wonen-in.ts en de andere clusterbestanden nemen: bij de build lezen,
// niet importeren — de alias @/ wijst naar web/ en komt daar niet.
const reviews = JSON.parse(readFileSync(
  path.join(process.cwd(), '..', 'data', 'vakman-reviews.json'), 'utf8')) as
  { reviews: VakmanReview[] }


const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export function reviewsVoor(product: string): VakmanReview[] {
  return (reviews.reviews as VakmanReview[]).filter(r => r.product === product)
}

/** JSON-LD voor de reviews. Geeft null terug als er niets te melden valt. */
export function reviewSchema(product: string) {
  const lijst = reviewsVoor(product)
  if (!lijst.length) return null
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (lijst.reduce((t, r) => t + r.sterren, 0) / lijst.length).toFixed(1),
      reviewCount: lijst.length,
    },
    review: lijst.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.naam },
      datePublished: r.datum,
      reviewRating: { '@type': 'Rating', ratingValue: r.sterren, bestRating: 5 },
      reviewBody: r.tekst,
    })),
  }
}

export default function VakmanReviews({ product, wat }: { product: string; wat: string }) {
  const lijst = reviewsVoor(product)

  if (!lijst.length) {
    return (
      <div style={{
        background: '#fff', border: `1px dashed ${INKT}0.22)`, borderRadius: 16,
        padding: 24, maxWidth: '68ch',
      }}>
        <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>
          Heb jij dit gemonteerd?
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: `${INKT}0.75)`, margin: '0 0 14px' }}>
          Er staat hier nog geen beoordeling van een vakman. Dat blijft zo tot de eerste
          timmerman of stukadoor die {wat} daadwerkelijk heeft gemonteerd er een achterlaat.
          Wat hier komt te staan is dus geen marketingtekst maar een oordeel uit de praktijk:
          hoe de montage beviel, waar je op moet letten, en wat je de volgende keer anders doet.
        </p>
        <a href="/vakbedrijf-beoordeling/?product=eigen-ervaring" style={{
          color: GROEN, fontWeight: 700, fontSize: 15, textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}>Beoordeel dit product als vakman</a>
      </div>
    )
  }

  const gemiddelde = lijst.reduce((t, r) => t + r.sterren, 0) / lijst.length
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: '68ch' }}>
      <p style={{ fontSize: 14.5, color: `${INKT}0.62)`, margin: 0 }}>
        {gemiddelde.toFixed(1)} gemiddeld, uit {lijst.length}{' '}
        {lijst.length === 1 ? 'beoordeling' : 'beoordelingen'} van vakmensen die dit
        zelf monteerden.
      </p>
      {lijst.map(r => (
        <div key={`${r.bedrijf}-${r.datum}`} style={{
          background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 22,
        }}>
          <div style={{ fontSize: 14, color: GROEN, fontWeight: 800 }}>
            {'★'.repeat(r.sterren)}<span style={{ color: `${INKT}0.2)` }}>{'★'.repeat(5 - r.sterren)}</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${INKT}0.8)`, margin: '8px 0 10px' }}>{r.tekst}</p>
          <div style={{ fontSize: 13, color: `${INKT}0.55)` }}>
            {r.naam} &middot; {r.bedrijf} ({r.vak}, {r.plaats}) &middot;{' '}
            {new Date(r.datum).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  )
}
