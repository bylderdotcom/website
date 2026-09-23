import type { Metadata } from 'next'
import MijnWoning from './MijnWoning'

/**
 * /mijn-woning/ — sleep je plattegrond erin en zie je nieuwe woning.
 *
 * WAT DEZE PAGINA DOET
 * Een koper sleept de verkoop- of meerwerktekening van zijn aannemer erin. De pagina
 * leest wanden, ruimtes, deuren en kap uit de PDF, bouwt de woning in doorzichtig 3D
 * op, en zet er twee dingen onder die we verkopen: de binnendeuren (Classic Next,
 * rechtstreeks naar de configurator met alle deuren al klaargezet) en de vloer
 * (DRT-gietvloer, per ruimte aan te zetten, met een rekenvoorbeeld).
 *
 * HEEN EN TERUG MET DE CONFIGURATOR
 * De knop naar de configurator geeft ?terug=/mijn-woning/ mee. De configurator toont
 * dan "Terug naar mijn woning" en stuurt de gekozen deuren in dezelfde vorm terug
 * (?deuren=, zoals hij ze zelf in zijn adres zet). Deze pagina koppelt ze op naam aan
 * de deuren uit de tekening. Niemand hoeft iets opnieuw in te stellen.
 *
 * WAAR DE GEGEVENS BLIJVEN
 * Alleen in de browser van de bezoeker (localStorage). De tekening wordt niet
 * verstuurd en niet bewaard; alleen het model dat eruit komt. Bewaren in een account
 * op app.bylder.com is de volgende stap (docs/woningvisualisator-bouwplan.md §4).
 *
 * NOINDEX, EN NIET IN DE SITEMAP
 * Dit is een proef op echte tekeningen (standing order: onvalideerd = noindex tot
 * bewijs). Er staat geen voorbeeldtekening in: de enige proeftekening die we hebben
 * is van een echte koper.
 */

export const metadata: Metadata = {
  title: 'Mijn woning — zie je nieuwe woning uit je eigen tekening | Bylder',
  description:
    'Sleep de plattegrond van je aannemer hierheen. Je ziet je woning in 3D, hoeveel '
    + 'binnendeuren erin zitten en hoeveel vierkante meter vloer je nodig hebt.',
  alternates: { canonical: 'https://www.bylder.com/mijn-woning/' },
  robots: { index: false, follow: false },
}

export default function Pagina() {
  return (
    <main style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <MijnWoning />
    </main>
  )
}
