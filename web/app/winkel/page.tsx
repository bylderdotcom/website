import type { Metadata } from 'next'
import PlintBeeld from './PlintBeeld'
import { PLINT, SCHARNIER } from '@/lib/winkel'
import { S, INKT, GROEN } from './stijl'

/**
 * De Bylder-winkel (31-10-2026). Bylder verkoopt zelf; eerste producten: onzichtbare plint en verdekt
 * scharnier. Wat deze winkel anders maakt staat in de drie punten: hoeveelheden uit je plattegrond,
 * op het juiste moment in de bouw, en wie het monteert.
 */

const URL = 'https://www.bylder.com/winkel/'

export const metadata: Metadata = {
  title: 'Winkel: onzichtbare plinten en verdekte scharnieren | Bylder',
  description: 'Producten voor een strakke woning, besteld bij Bylder. Het pakket berekend uit je eigen plattegrond, op tijd voor de stukadoor.',
  alternates: { canonical: URL },
}

const PRODUCTEN = [
  { href: `/winkel/${PLINT.slug}/`, merk: PLINT.merk, naam: PLINT.naam, tekst: 'Inbouwplint vlak met de wand. Het pakket rekenen we uit je plattegrond.', beeld: <div style={{ padding: 16 }}><PlintBeeld /></div> },
  { href: `/winkel/${SCHARNIER.slug}/`, merk: SCHARNIER.merk, naam: SCHARNIER.naam, tekst: `Verborgen scharnier tot ${SCHARNIER.draagvermogenKg} kg per set, 3D verstelbaar.`,
    beeld: <img src="/img/winkel/dx38.webp" width="1000" height="1366" alt="Verdekt scharnier Basys DX-38 Design" style={{ height: 260, width: 'auto', display: 'block', margin: '12px auto' }} /> },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Bylder-winkel', url: URL,
      hasPart: PRODUCTEN.map(p => ({ '@type': 'Product', name: `${p.merk} ${p.naam}`, url: `https://www.bylder.com${p.href}` })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › Winkel</nav>
      <p style={S.oog}>Bylder-winkel</p>
      <h1 style={S.h1}>De winkel die je woning kent.</h1>
      <p style={S.lead}>Producten voor een strakke woning, besteld bij Bylder. We rekenen uit wat je nodig hebt uit je eigen plattegrond, en zeggen erbij wanneer het er moet zijn.</p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', margin: '6px 0 34px' }}>
        {[
          ['Uit je plattegrond', 'Staat je woning in Mijn woning, dan berekenen we de hoeveelheden per ruimte. Geen rekenwerk, geen overschot.'],
          ['Op tijd voor de bouw', 'Wat vóór de stukadoor de wand in moet, zeggen we erbij. Zo bestel je niet te laat.'],
          ['Ook gemonteerd', 'Laat je de afwerking door Bylder doen, dan nemen we het mee in dezelfde offerte.'],
        ].map(([t, p]) => (
          <div key={t} style={{ ...S.kaart, padding: '16px 18px' }}><h2 style={{ ...S.h3, fontSize: 16 }}>{t}</h2><p style={{ ...S.p, fontSize: 14.5, margin: 0 }}>{p}</p></div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        {PRODUCTEN.map(p => (
          <a key={p.href} href={p.href} style={{ ...S.kaart, padding: 0, overflow: 'hidden', textDecoration: 'none', color: '#1A1208', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: '#FAF7F1', borderBottom: `1px solid ${INKT}0.08)`, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.beeld}</div>
            <div style={{ padding: '16px 18px 20px' }}>
              <p style={{ ...S.oog, margin: '0 0 4px' }}>{p.merk}</p>
              <h2 style={{ ...S.h3, fontSize: '1.2rem' }}>{p.naam}</h2>
              <p style={{ ...S.p, fontSize: 15, margin: '0 0 12px' }}>{p.tekst}</p>
              <span style={{ color: GROEN, fontWeight: 800, fontSize: 15 }}>Bekijken en bestellen →</span>
            </div>
          </a>
        ))}
      </div>

      <p style={{ ...S.p, fontSize: 14, marginTop: 30 }}>Bylder is de verkoper. Je bestelling en de betaling lopen via ons; de leverancier levert rechtstreeks bij je af.</p>
    </main>
  )
}
