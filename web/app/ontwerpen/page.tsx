import type { Metadata } from 'next'

// Ontwerpen en bestellen: de drie configuratoren op één plek, en wat er ná het
// ontwerpen gebeurt. Want een ontwerper zonder vervolg is speelgoed; deze pagina
// laat zien dat elk ontwerp een offerte wordt, en die offerte een bestelling bij
// de partij die het maakt of legt.
//
// Wat hier over Mijn woning staat, moet kloppen met wat Mijn woning echt doet
// (app, digitale tweeling fase 1 t/m 3, 10-10-2026): deuren, gietvloer en kast staan
// erin; per onderdeel de stand van de offerte; wijzigen mag altijd, met een nieuwe
// offerte als er iets wezenlijks verandert; één tijdlijn. De site is de voorproef
// zonder account; aanvragen, aanpassen en bestellen gebeurt in de app.

const URL = 'https://www.bylder.com/ontwerpen/'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '56px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '68ch' }
const OOG: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: ROEST, fontWeight: 700, margin: '0 0 8px' }

export const metadata: Metadata = {
  title: 'Ontwerpen en bestellen: deuren, kast op maat en gietvloer | Bylder',
  description: 'Ontwerp je kozijnloze deuren, een kast op maat of je gietvloer, vraag de offerte aan bij de partij die hem maakt en bestel. Gratis, met alles samen in Mijn woning.',
  alternates: { canonical: URL },
  openGraph: { title: 'Ontwerpen en bestellen bij Bylder', description: 'Deuren, kast op maat en gietvloer: van ontwerp naar offerte en bestelling.', url: URL, type: 'website' },
}

const PRODUCTEN = [
  {
    naam: 'Kozijnloze deuren', href: '/kozijnloze-deuren/configurator/', knop: 'Stel je deuren samen',
    img: '/img/classic-next/deur-eiken-fineer-sm.jpg', alt: 'Kozijnloze binnendeur in eiken fineer, plafondhoog',
    wie: 'Classic Next uit Uden maakt de deuren.',
    wat: 'Je kiest per deur het groefpatroon, de kleur (elke RAL-kleur) of fineer, de draairichting en het beslag. Je ziet de deur in 3D en krijgt een sluitende specificatie.',
    daarna: 'Classic Next maakt een offerte op jouw specificatie, met het aantal deuren uit je tekening. Na akkoord worden de deuren gemaakt en geleverd.',
  },
  {
    naam: 'Kast op maat', href: '/kasten-op-maat/ontwerpen/', knop: 'Ontwerp je kast',
    img: '/img/kasten/hoekkast-3d-sm.jpg', alt: 'Hoekkast op maat in 3D, met open vakken aan de zijkanten',
    wie: 'Een timmerbedrijf maakt en plaatst de kast.',
    wat: 'Je laat een foto zien van een kast die je mooi vindt en wijst aan waar hij komt. Je ziet hem in 3D met maten, en het timmerbedrijf krijgt een tekening en een zaaglijst.',
    daarna: 'Het timmerbedrijf komt gratis inmeten en maakt de offerte. Na akkoord wordt de kast gemaakt en geplaatst.',
  },
  {
    naam: 'Gietvloer', href: '/gietvloer/ontwerpen/', knop: 'Ontwerp je gietvloer',
    swatch: true, alt: '',
    wie: 'Een gespecialiseerde verwerker legt de vloer.',
    wat: 'Je uploadt een foto van een vloer die je mooi vindt. We lezen de kleur en tonen de drie kleuren die er het dichtst bij liggen. Je kiest per ruimte en verdieping, en het type: PU, epoxy of cementgebonden.',
    daarna: 'Tot drie stalen zijn gratis en komen bij je thuis. Daarna meet de verwerker in en maakt de offerte.',
  },
]

const STAPPEN = [
  { t: 'Ontwerpen', p: 'Gratis en zonder account. In 3D of in je eigen woning, met de maten uit je tekening als je die hebt.' },
  { t: 'Offerte', p: 'Met een gratis account vraag je de offerte aan. De maker krijgt je ontwerp, je maten en je foto’s. Je hoeft niets opnieuw uit te leggen.' },
  { t: 'Bestellen', p: 'Na inmeten of stalen krijg je een definitieve prijs. Ga je akkoord, dan bestel je bij de maker en betaal je de maker. Via Bylder gelden je voorwaarden en je voucher.' },
  { t: 'Oplevering', p: 'Je ziet in je account wat er besteld is en meldt zelf wanneer het klaar is. Klopt er iets niet, dan zit Bylder ertussen.' },
]

const VRAGEN = [
  { v: 'Kan ik bij Bylder ook echt bestellen, of alleen ontwerpen?', a: 'Je kunt echt bestellen. Elk ontwerp gaat als offerteaanvraag naar de partij die het product maakt of legt. Dat zijn fabrikanten en vakbedrijven die we kiezen op de kwaliteit van hun product en van hun werk. Na inmeten krijg je een definitieve prijs. Ga je akkoord, dan bestel je bij die partij.' },
  { v: 'Bij wie betaal ik?', a: 'Bij de maker of verwerker, op hun factuur. Bylder rekent niets aan jou: wij worden betaald door de partners, met een vergoeding over wat via ons besteld wordt.' },
  { v: 'Wat kost ontwerpen?', a: 'Niets. De ontwerpers zijn gratis, ook zonder account. Een account heb je pas nodig als je een offerte aanvraagt of je ontwerpen wilt bewaren in Mijn woning.' },
  { v: 'Kan ik meerdere producten tegelijk ontwerpen?', a: 'Ja. Elk ontwerp krijgt zijn eigen offerte, van de partij die het maakt. In Mijn woning staan ze bij elkaar op je eigen plattegrond, zodat je ziet of deur, vloer en kast bij elkaar passen.' },
  { v: 'Wat doet Mijn woning precies?', a: 'Je uploadt de plattegrond van je aannemer. Wij lezen de verdiepingen, de ruimtes en de deuren eruit en bouwen je woning na. Je deuren staan erin op de plek uit de tekening, de vierkante meters voor je gietvloer komen per ruimte uit de tekening, en je kast op maat staat tegen de wand die je aanwees. Per onderdeel zie je hoe ver je offerte is, en alles staat op één tijdlijn tot de oplevering.' },
  { v: 'Kan ik mijn ontwerp nog aanpassen als ik al een offerte heb?', a: 'Ja, altijd, ook nadat je getekend hebt. Verandert er iets wezenlijks, zoals de maten van een kast, een extra ruimte met gietvloer of een ander groefpatroon op een deur, dan zie je dat meteen in Mijn woning. Met één klik vraag je een nieuwe offerte aan; de maker krijgt de verschillen erbij. Een kleine wijziging, zoals een andere kleur, geven we gewoon door. Heb je al getekend, dan blijft je offerte gelden tot je de nieuwe tekent.' },
  { v: 'Ik heb nog geen bouwtekening. Kan ik toch beginnen?', a: 'Ja. Elke ontwerper werkt ook zonder tekening: je vult de maten of ruimtes zelf in. Komt je tekening later, dan zet je hem in Mijn woning en sluiten je ontwerpen erop aan.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Ontwerpen en bestellen', item: URL },
    ] },
    { '@type': 'ItemList', name: 'Ontwerpers van Bylder', itemListElement: PRODUCTEN.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p.naam, url: `https://www.bylder.com${p.href}` })) },
    { '@type': 'HowTo', name: 'Van ontwerp naar bestelling bij Bylder',
      step: STAPPEN.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.t, text: s.p })) },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

const STAAL = ['#ECE7DF', '#D9CBB2', '#B5B1AA', '#9C8F80', '#6D6A66', '#4A4846']

export default function OntwerpenPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <style dangerouslySetInnerHTML={{ __html:
        '.ow-kaarten{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:18px}'
        + '.ow-stappen{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);gap:14px;list-style:none;padding:0;margin:0;counter-reset:s}'
        + '@media(max-width:900px){.ow-kaarten{grid-template-columns:minmax(0,1fr)}.ow-stappen{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}'
        + '@media(max-width:520px){.ow-stappen{grid-template-columns:minmax(0,1fr)}}' }} />
      <div style={{ background: '#F5F0E8', color: '#1A1208' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '26px 16px 72px' }}>
          <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 18px' }}>
            <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <span aria-current="page">Ontwerpen en bestellen</span>
          </nav>

          <p style={OOG}>Ontwerpen en bestellen</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 14px', textWrap: 'balance', maxWidth: '20ch' }}>
            Ontwerp het zelf. Bestel het bij wie het maakt.
          </h1>
          <p style={{ ...P, fontSize: 18 }}>
            Deuren, een kast op maat en je gietvloer ontwerp je hier zelf, gratis. Elk ontwerp gaat als offerteaanvraag
            naar de partij die het maakt of legt. Na inmeten bestel je, met de voorwaarden die via Bylder gelden.
          </p>

          <div className="ow-kaarten" style={{ marginTop: 30 }}>
            {PRODUCTEN.map(p => (
              <article key={p.naam} style={{ background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <a href={p.href} tabIndex={-1} aria-hidden="true" style={{ display: 'block', aspectRatio: '4 / 3', background: '#EDE6D8' }}>
                  {p.swatch ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: 8, padding: 16, height: '100%' }}>
                      {STAAL.map(c => <span key={c} style={{ borderRadius: 10, background: `radial-gradient(120% 90% at 20% 15%, rgba(255,255,255,.25), transparent 55%), ${c}` }} />)}
                    </div>
                  ) : (
                    <img src={p.img} alt="" width={600} height={450} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </a>
                <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{p.naam}</h2>
                  <p style={{ fontSize: 14, fontWeight: 700, color: GROEN, margin: '0 0 10px' }}>{p.wie}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: `${INKT}0.78)`, margin: '0 0 10px' }}>{p.wat}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: `${INKT}0.78)`, margin: '0 0 18px' }}><b style={{ color: '#1A1208' }}>Daarna:</b> {p.daarna}</p>
                  <a href={p.href} style={{ marginTop: 'auto', alignSelf: 'flex-start', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '12px 20px', borderRadius: 11, textDecoration: 'none' }}>{p.knop} &rarr;</a>
                </div>
              </article>
            ))}
          </div>

          <h2 style={H2}>Van ontwerp naar bestelling</h2>
          <ol className="ow-stappen">
            {STAPPEN.map((s, i) => (
              <li key={s.t} style={{ background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 16, padding: '18px 18px 16px' }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: ROEST, fontWeight: 700 }}>Stap {i + 1}</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0 6px' }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: `${INKT}0.78)`, margin: 0 }}>{s.p}</p>
              </li>
            ))}
          </ol>

          <h2 style={H2}>Alles samen in Mijn woning</h2>
          <p style={P}>
            Je deuren, je vloer en je kast komen vaak van verschillende makers. Of ze bij elkaar passen, zie je pas
            als ze samen in je huis staan. Daarom bouwen we je woning na uit de plattegrond van je aannemer: de
            verdiepingen, de ruimtes en de deuren.
          </p>
          <p style={P}>
            Je deuren staan erin op de plek uit de tekening, elk met de kleur en het ontwerp dat je koos. De gietvloer
            krijgt de vierkante meters per ruimte uit diezelfde tekening. Je kast op maat staat tegen de wand die je
            aanwees, met de lengte uit de tekening.
          </p>
          <p style={P}>
            Per onderdeel zie je hoe ver je offerte is: aangevraagd, binnen, getekend, ingemeten, opgeleverd. Wijzigen
            mag altijd. Verandert er iets wezenlijks, dan zie je dat meteen en vraag je met één klik een nieuwe offerte
            aan. Alles staat op één tijdlijn, tot de oplevering van je woning.
          </p>
          <p style={P}>
            Hier op de site probeer je het uit, zonder account. Bewaren, aanvragen, aanpassen en bestellen doe je in je
            gratis account.
          </p>
          <a href="/mijn-woning/" style={{ display: 'inline-block', marginTop: 6, background: '#1A1208', color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>Zet je tekening in Mijn woning &rarr;</a>

          <h2 style={H2}>Veelgestelde vragen</h2>
          <div style={{ display: 'grid', gap: 10, maxWidth: 812 }}>
            {VRAGEN.map(q => (
              <details key={q.v} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 20px' }}>
                <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
                <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
