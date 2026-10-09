import type { Metadata } from 'next'
import Ontwerper from '../../components/gietvloer/Ontwerper'
import GietvloerHeld from '../../components/gietvloer/GietvloerHeld'
import { TYPES } from '../../components/gietvloer/gegevens'

// De gietvloerontwerper op de website. Het scherm praat met de publieke API van de
// app (app.bylder.com/api/gietvloer): zonder account, met id + sleutel in de URL.
// Stalen gaan via Dr. Schutz; de offerte loopt via een account in de app.
// De tekst eronder is wat een zoekmachine leest: een fotovak en knoppen zijn voor
// een crawler leeg.

const URL = 'https://www.bylder.com/gietvloer/ontwerpen/'
const API = process.env.NEXT_PUBLIC_GIETVLOER_API ?? 'https://app.bylder.com/api/gietvloer'

export const metadata: Metadata = {
  title: 'Gietvloer ontwerpen: van inspiratiefoto naar je eigen woning | Bylder',
  description: 'Upload een foto van een gietvloer die je mooi vindt. We lezen kleur en glans, tonen hem in je eigen woning en sturen tot 3 stalen gratis.',
  alternates: { canonical: URL },
  openGraph: { title: 'Ontwerp je gietvloer vanaf een foto', description: 'Kleur uit je inspiratiefoto, de vloer in je eigen woning, tot 3 stalen gratis.', url: URL, type: 'website' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const H2: React.CSSProperties = { fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '46px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const KAART: React.CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 20px' }

const prijs = (id: string) => { const t = TYPES.find(x => x.id === id)!; return `€${t.prijs[0]} tot €${t.prijs[1]}` }

const VRAGEN = [
  { v: 'Hoe haalt de ontwerper de kleur uit mijn foto?', a: 'De AI kijkt alleen naar de vloer en schat de kleur zoals die bij neutraal daglicht is. Warm avondlicht of een filter maakt een vloer op een foto vaak warmer of donkerder dan hij is; daar corrigeert hij voor. Daarna zoeken we de drie kleuren die het dichtst bij liggen, gemeten zoals het oog kleur ziet. Een scherm toont kleur nooit precies, daarom kun je stalen aanvragen.' },
  { v: 'Zijn de stalen echt gratis?', a: 'Ja, tot drie stalen. Dr. Schutz stuurt ze naar je huisadres. We geven daarvoor alleen je naam, je adres en de gekozen kleuren door, en pas nadat je daar akkoord op gaf.' },
  { v: 'Wat kost een gietvloer per m²?', a: `Als indicatie, inclusief btw: een PU-gietvloer ${prijs('pu')} per m², epoxy ${prijs('epoxy')} en een cementgebonden vloer (microcement) ${prijs('cement')}. Voorbereiding van de dekvloer en plinten komen er soms bij. De echte prijs volgt na het inmeten.` },
  { v: 'Kan een gietvloer op vloerverwarming?', a: 'Ja. Een gietvloer is een paar millimeter dik en geeft warmte snel door. Belangrijk is dat de dekvloer droog genoeg is en dat de vloerverwarming volgens schema is opgestookt voordat de vloer gelegd wordt. In een nieuwbouwwoning plan je dat rond de oplevering.' },
  { v: 'Ik heb geen bouwtekening. Kan ik toch ontwerpen?', a: 'Ja. Je vult zelf in welke ruimtes een gietvloer krijgen, met een schatting van de vierkante meters. Heb je de plattegrond van je aannemer wel, zet hem dan in Mijn woning: dan meten we elke kamer uit de tekening en zie je de vloer in je eigen woning.' },
  { v: 'Wie legt de vloer?', a: 'Een verwerker die Dr. Schutz aanbeveelt. Je vraagt de offerte aan in je gratis Bylder-omgeving; de verwerker krijgt je ruimtes, je kleur en je inspiratiefoto, en meet eerst in voordat hij een definitieve prijs geeft.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Gietvloer', item: 'https://www.bylder.com/gietvloer/' },
      { '@type': 'ListItem', position: 3, name: 'Ontwerpen', item: URL },
    ] },
    { '@type': 'WebApplication', name: 'Bylder gietvloerontwerper', url: URL, applicationCategory: 'DesignApplication', operatingSystem: 'Web',
      inLanguage: 'nl-NL', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      description: 'Ontwerp een gietvloer vanaf je eigen inspiratiefoto: kleur en glans gelezen, de vloer in je eigen woning, tot drie stalen gratis.',
      publisher: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' } },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

export default function GietvloerOntwerpenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ background: '#F5F0E8' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 16px 8px' }}>
          <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 14px' }}>
            <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <a href="/gietvloer/" style={{ color: 'inherit' }}>Gietvloer</a> / <span aria-current="page">Ontwerpen</span>
          </nav>
          <GietvloerHeld />
          <Ontwerper api={API} modus="site" />
        </div>
      </div>
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 16px 72px', color: '#1A1208' }} aria-label="Uitleg bij de gietvloerontwerper">
        <div style={{ maxWidth: 812 }}>
          <h2 style={{ ...H2, marginTop: 30 }}>Van inspiratiefoto naar een vloer die je kunt bestellen</h2>
          <p style={P}>Bijna iedereen begint met een foto: een woonkamer op Pinterest, een vloer in een showroom. Het lastige is de stap daarna. Welke kleur is dat precies, welk type vloer, en hoe ziet hij eruit in jouw kamers? Daar is deze ontwerper voor.</p>
          <p style={P}>Je kiest per ruimte en per verdieping waar de gietvloer komt. Komt je tekening uit <a href="/mijn-woning/" style={{ color: GROEN, fontWeight: 700 }}>Mijn woning</a>, dan zie je de vloer meteen in je eigen plattegrond, met de vierkante meters per kamer. Zonder tekening vul je de ruimtes zelf in.</p>
          <h2 style={H2}>PU, epoxy of cementgebonden</h2>
          <p style={P}>In een woning kiezen de meeste kopers een PU-gietvloer: warmer en stiller dan epoxy, en licht elastisch. Epoxy is hard en voordelig, maar voelt koud en galmt meer; het past beter in een garage of berging. Een cementgebonden vloer (microcement) geeft de levendige, wolkerige betonlook, maar vraagt meer handwerk en onderhoud. In de ontwerper staan de voor- en nadelen per type naast elkaar.</p>
          <p style={P}>Wil je eerst vergelijken wie er bij jou in de buurt gietvloeren legt? <a href="/gietvloer/" style={{ color: GROEN, fontWeight: 700 }}>Bekijk gietvloerbedrijven per plaats</a>.</p>
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
