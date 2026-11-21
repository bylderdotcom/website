import type { Metadata } from 'next'
import MijnWoning from './MijnWoning'
import EigenVakmanMeekijken from '../components/EigenVakmanMeekijken'

/**
 * /mijn-woning/ — sleep je plattegrond erin en zie je nieuwe woning.
 *
 * WAT DEZE PAGINA DOET
 * Een koper sleept de verkoop- of meerwerktekening van zijn aannemer erin. De pagina
 * leest wanden, ruimtes, deuren en kap uit de PDF, bouwt de woning in doorzichtig 3D
 * op, en zet er twee dingen onder die we verkopen: de binnendeuren (Classic Next,
 * rechtstreeks naar de configurator met alle deuren al klaargezet) en de vloer
 * (gietvloer, per ruimte aan te zetten, met een prijsindicatie).
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
 * IN DE INDEX EN DE SITEMAP (besluit Daniel, 21-11-2026)
 * Stond tot 21-11 op noindex als proef. Sindsdien de pagina waar de homepage alles naartoe
 * stuurt ("Zet je woning in 3D"), met een fictieve voorbeeldwoning erin (voorbeeld.ts).
 */

export const metadata: Metadata = {
  title: 'Mijn woning — zie je nieuwe woning uit je eigen tekening | Bylder',
  description:
    'Sleep de plattegrond van je aannemer hierheen. Je ziet je woning in 3D, hoeveel '
    + 'binnendeuren erin zitten en hoeveel vierkante meter vloer je nodig hebt.',
  alternates: { canonical: 'https://www.bylder.com/mijn-woning/' },
  robots: { index: true, follow: true },
  openGraph: { title: 'Zet je woning in 3D, uit je eigen tekening', url: 'https://www.bylder.com/mijn-woning/', type: 'website', images: [{ url: 'https://www.bylder.com/img/og/mijn-woning.jpg', width: 1200, height: 630, alt: 'De woning als maquette, van bovenaf' }] },
  twitter: { card: 'summary_large_image' },
}

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Je woning in 3D',
      url: 'https://www.bylder.com/mijn-woning/',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      description: 'Sleep de plattegrond van je aannemer erin en zie je woning in 3D, met het aantal binnendeuren en de vierkante meters vloer per ruimte.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      provider: { '@type': 'Organization', name: 'Bylder', url: 'https://www.bylder.com/' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
        { '@type': 'ListItem', position: 2, name: 'Je woning in 3D', item: 'https://www.bylder.com/mijn-woning/' },
      ],
    },
  ],
}

export default function Pagina() {
  return (
    <main style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <MijnWoning />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 56px' }}>
        <EigenVakmanMeekijken campagne="mijn-woning" marge="8px 0 0" />
      </div>
    </main>
  )
}
