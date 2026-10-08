import type { Metadata } from 'next'
import Ontwerper from '../../components/kast/Ontwerper'
import { TYPES, URL_BASIS } from '@/lib/kast/hub'

// De kastontwerper op de website. Het scherm zelf praat met de publieke API van
// de app (app.bylder.com/api/kast); zonder account, met id + sleutel in de URL.
// De tekst eronder is wat een zoekmachine van deze pagina leest: een WebGL-doek
// en een chatvenster zijn voor een crawler leeg.

const URL = `${URL_BASIS}ontwerpen/`

export const metadata: Metadata = {
  title: 'Kast op maat ontwerpen met AI: upload je voorbeeld, zie hem in 3D | Bylder',
  description: 'Upload een foto van een kast die je mooi vindt en vertel waar hij komt. De ontwerper tekent hem in 3D, met maten en zaaglijst. Gratis, met of zonder bouwtekening.',
  alternates: { canonical: URL },
  openGraph: { title: 'Ontwerp een kast die precies past', description: 'Van voorbeeldfoto tot 3D-ontwerp en zaaglijst, in gewone taal.', url: URL, type: 'website' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const H2: React.CSSProperties = { fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '46px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const KAART: React.CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 20px' }

const VRAGEN = [
  { v: 'Wat moet ik uploaden?', a: 'Eén tot vier foto’s van kasten die je mooi vindt: uit een tijdschrift, van Pinterest of uit een showroom. Een foto van de plek waar de kast komt helpt ook, het liefst met een A4’tje tegen de muur voor de schaal.' },
  { v: 'Ik heb geen bouwtekening. Kan ik toch ontwerpen?', a: 'Ja. De ontwerper vraagt om de paar maten die nodig zijn: de muurlengte op drie hoogtes en de plafondhoogte op twee plekken. Weet je die niet, dan schat hij ze uit een foto. Je ontwerp heet dan indicatief en het timmerbedrijf meet gratis in voordat er gezaagd wordt.' },
  { v: 'Moet ik een account maken?', a: 'Niet om te beginnen. Je eerste drie vragen zijn zonder account. Daarna vragen we je e-mailadres, zodat je ontwerp bewaard blijft en je later verder kunt. Een offerte vraag je aan vanuit je gratis Bylder-omgeving.' },
  { v: 'Wie ziet mijn ontwerp en foto’s?', a: 'Alleen jij, zolang je geen offerte aanvraagt. Vraag je een offerte aan, dan ziet het timmerbedrijf je ontwerp, de tekeningen, de zaaglijst en de foto’s die je in het gesprek gebruikte, plus je naam, adres en telefoonnummer om in te meten.' },
  { v: 'Hoe nauwkeurig is de kleur?', a: 'De ontwerper leidt de kleur af uit je foto en zoekt de dichtstbijzijnde RAL- of houtkleur. Een scherm geeft kleur nooit precies weer; vraag het timmerbedrijf om een staal voordat je tekent.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Kasten op maat', item: URL_BASIS },
      { '@type': 'ListItem', position: 3, name: 'Ontwerpen', item: URL },
    ] },
    { '@type': 'WebApplication', name: 'Bylder kastontwerper', url: URL, applicationCategory: 'DesignApplication', operatingSystem: 'Web',
      inLanguage: 'nl-NL', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      description: 'Ontwerp een kast op maat uit je eigen voorbeeldfoto’s, met 3D-weergave, maattekeningen en zaaglijst.',
      publisher: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' } },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

export default function KastOntwerpenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Ontwerper />
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 24px 72px', color: '#1A1208' }} aria-label="Uitleg bij de ontwerper">
        <div style={{ maxWidth: 812 }}>
          <h2 style={{ ...H2, marginTop: 24 }}>Van voorbeeldfoto tot zaaglijst</h2>
          <p style={P}>De ontwerper werkt zoals een meubelmaker denkt: in korpussen, fronten, planken en beslag. Je beschrijft wat je wilt in gewone taal, hij legt het vast in maten. Een rekenmodel controleert elk voorstel op de vakregels, zoals deuren van hooguit 60 cm breed en planken die niet doorbuigen. Wat niet te maken is, komt niet bij je terug.</p>
          <p style={P}>Je ziet de kast in 3D, in vooraanzicht en als plattegrond. Ben je tevreden, dan neem je het ontwerp mee naar je Bylder-omgeving en vraag je daar een offerte aan. Het timmerbedrijf krijgt dan precies wat jij ziet, plus de zaaglijst en de beslaglijst.</p>
          <p style={P}><a href="/kasten-op-maat/" style={{ color: GROEN, fontWeight: 700 }}>Lees meer over kasten op maat</a>, of kijk per type:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 8px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TYPES.map(t => (
              <li key={t.slug}><a href={`/kasten-op-maat/${t.slug}/`} style={{ display: 'inline-block', padding: '7px 14px', borderRadius: 999, border: `1px solid ${INKT}0.18)`, background: '#fff', color: '#1A1208', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>{t.kort}</a></li>
            ))}
          </ul>
          <h2 style={H2}>Veelgestelde vragen</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {VRAGEN.map(q => (
              <details key={q.v} style={KAART}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
                <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
