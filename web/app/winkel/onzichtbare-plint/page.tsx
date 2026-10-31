import type { Metadata } from 'next'
import PlintCalculator from './PlintCalculator'
import PlintBeeld from '../PlintBeeld'
import BestelMoment from '../BestelMoment'
import Vinkje from '../Vinkje'
import { PLINT, SCHARNIER } from '@/lib/winkel'
import { S, INKT, GROEN } from '../stijl'

/**
 * Winkel: de onzichtbare plint van AGS-systems (31-10-2026). Bylder verkoopt, de leverancier levert.
 * Uniek hier: de calculator rekent het pakket per ruimte uit de eigen plattegrond (Mijn woning).
 * De uitleg en kosten van plintloos afwerken staan op /onzichtbare-plinten/; die pagina linkt hierheen.
 */

const URL = 'https://www.bylder.com/winkel/onzichtbare-plint/'

export const metadata: Metadata = {
  title: 'Onzichtbare plint bestellen: AGS Light 46 en Light 60 | Bylder',
  description: 'Aluminium inbouwplint die vóór het stucwerk de wand in gaat. Bereken je pakket per ruimte uit je eigen plattegrond: profielen, hoeken en koppelstukken.',
  alternates: { canonical: URL },
  openGraph: { title: 'Onzichtbare plint bestellen, berekend uit je plattegrond', url: URL, type: 'website',
    description: 'AGS Light 46 en Light 60: profielen, hoeken en koppelstukken in één pakket.' },
}

const VRAGEN = [
  { v: 'Wanneer moet ik de plint bestellen?', a: 'Vóór de stukadoor komt. Het profiel wordt op de ruwe wand gezet en het stucwerk sluit erop aan. Bestel dus zodra je weet wanneer er gestuct wordt.' },
  { v: 'Light 46 of Light 60?', a: 'Het verschil is de hoogte van de plint: 46 of 60 mm. Een lage plint valt minder op; een hogere beschermt de wand beter tegen stofzuiger en stoelpoten. Het profiel is in beide gevallen 15 mm diep.' },
  { v: 'Steen of gipswand?', a: 'Er is een profiel voor steen, beton of kalkzandsteen en een voor gipswanden (droogbouw). Kies wat bij je wanden past. Heb je beide, bestel dan per wandtype.' },
  { v: 'Hoe wordt het gemonteerd?', a: 'Profielen op maat zagen, hoeken erop, montageschuim op de achterkant, uitlijnen op hoogte en vastzetten, vóór het stucwerk. Na het leggen van de vloer gaat de folie eraf en klik je de plint erin. Het werk is voor een stukadoor of timmerman.' },
  { v: 'Kan er verlichting in?', a: 'Ja. In het profiel past een ledstrip voor indirect licht langs de vloer.' },
  { v: 'Hoe klopt de berekening?', a: 'Uit je plattegrond nemen we per ruimte de wand rond de vloer, min de deuropeningen, plus 7% zaagverlies. Profielen zijn 2 meter lang. Laat de maten voor het bestellen nog even nameten door wie het monteert.' },
  { v: 'Wie is de verkoper?', a: 'Bylder. Je bestelling en de betaling lopen via ons; de leverancier levert rechtstreeks bij je af.' },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Product', name: `${PLINT.naam} ${PLINT.merk} Light 46 en Light 60`, brand: { '@type': 'Brand', name: PLINT.merk },
      description: PLINT.kort, url: URL, category: 'Plinten', seller: { '@type': 'Organization', name: 'Bylder' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: 'https://www.bylder.com/winkel/' },
      { '@type': 'ListItem', position: 3, name: PLINT.naam, item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/winkel/" style={S.kruimelLink}>Winkel</a> › {PLINT.naam}</nav>

      <div style={S.held}>
        <div>
          <p style={S.oog}>Winkel · {PLINT.merk}</p>
          <h1 style={S.h1}>Onzichtbare plint, berekend uit je eigen plattegrond.</h1>
          <p style={S.lead}>{PLINT.kort} Geen lijst langs de vloer, geen stofrand, geen kitnaad.</p>
          {['Light 46 of Light 60: plint van 46 of 60 mm hoog', 'Voor steen en voor gipswanden', 'Profielen van 2 m, met hoeken en koppelstukken', 'Ledstrip mogelijk voor licht langs de vloer'].map(t => (
            <p key={t} style={S.feit}><Vinkje />{t}</p>
          ))}
          <a href="#bestellen" style={{ display: 'inline-block', marginTop: 10, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15.5, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>Bereken je pakket</a>
        </div>
        <div style={{ ...S.beeld, padding: 20 }}><PlintBeeld /></div>
      </div>

      <h2 style={S.h2}>Zo zit hij in de wand</h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
        {[
          ['1. Vóór het stucwerk', 'Het aluminium profiel gaat op de ruwe wand, met montageschuim over de hele achterkant. De bovenrand is meteen de lijn voor de stukadoor.'],
          ['2. De vloer', 'De vloer wordt gelegd. Doordat de plint de wand en de vloer niet raakt, gaan er geen trillingen van de vloer de muur in.'],
          ['3. De plint erin', 'Folie eraf en de houten plint (tot 9 mm dik) in het profiel. Vlak met de wand.'],
        ].map(([t, p]) => (
          <div key={t} style={S.kaart}><h3 style={S.h3}>{t}</h3><p style={{ ...S.p, fontSize: 15, margin: 0 }}>{p}</p></div>
        ))}
      </div>

      <h2 style={S.h2}>Welk profiel?</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 520, background: '#fff', borderRadius: 12 }}>
          <thead><tr>{['Model', 'Plinthoogte', 'Steen of beton', 'Gipswand', 'Diepte'].map(k => <th key={k} scope="col" style={{ ...S.tabelCel, fontSize: 12.5, color: `${INKT}0.6)` }}>{k}</th>)}</tr></thead>
          <tbody>
            {PLINT.modellen.map(m => (
              <tr key={m.id}>
                <th scope="row" style={S.tabelCel}>{m.naam}</th>
                <td style={S.tabelCel}>{m.hoogteMm} mm</td>
                <td style={S.tabelCel}>art. {PLINT.artikelen[m.id].steen}</td>
                <td style={S.tabelCel}>art. {PLINT.artikelen[m.id].droogbouw}</td>
                <td style={S.tabelCel}>{PLINT.diepteMm} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section id="bestellen" aria-labelledby="bestellen-kop" style={{ scrollMarginTop: 110 }}>
        <h2 id="bestellen-kop" style={S.h2}>Bereken en bestel je pakket</h2>
        <p style={S.p}>Staat je woning in <a href="/mijn-woning/" style={{ color: GROEN, fontWeight: 700 }}>Mijn woning</a>, dan rekenen we per ruimte uit hoeveel profielen, hoeken en koppelstukken je nodig hebt. Anders vul je de meters zelf in.</p>
        <div style={{ marginBottom: 14 }}><BestelMoment wat="Het plintprofiel" /></div>
        <div style={S.bestel}><PlintCalculator /></div>
      </section>

      <h2 style={S.h2}>Vragen</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={{ ...S.kaart, padding: '14px 18px' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15.5 }}>{q.v}</summary>
            <p style={{ ...S.p, fontSize: 15, margin: '10px 0 0' }}>{q.a}</p>
          </details>
        ))}
      </div>

      <div style={{ ...S.kaart, marginTop: 40, display: 'flex', flexWrap: 'wrap', gap: '12px 24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...S.p, margin: 0 }}><strong style={{ color: '#1A1208' }}>Ook een kozijnloze deur?</strong> Dezelfde strakke wand, hetzelfde moment in de bouw. Het verdekte scharnier {SCHARNIER.merk} DX-38 zit er onzichtbaar in.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={`/winkel/${SCHARNIER.slug}/`} style={{ border: `1.5px solid ${GROEN}`, color: GROEN, fontWeight: 700, padding: '10px 16px', borderRadius: 10, textDecoration: 'none' }}>Het scharnier</a>
          <a href="/kozijnloze-deuren/configurator/" style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, padding: '11px 16px', borderRadius: 10, textDecoration: 'none' }}>Stel je deur samen</a>
        </div>
      </div>
      <p style={{ ...S.p, fontSize: 14, marginTop: 24 }}>Meer over plintloos afwerken, en wat een vakbedrijf ervoor rekent: <a href="/onzichtbare-plinten/" style={{ color: GROEN, fontWeight: 700 }}>onzichtbare plinten</a>.</p>
    </main>
  )
}
