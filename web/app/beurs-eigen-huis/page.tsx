import type { Metadata } from 'next'

/**
 * Landingspagina voor de Beurs Eigen Huis, 9 tot en met 11 oktober 2026.
 *
 * WAT DEZE PAGINA MOET DOEN
 * Eén ding: de bezoeker de 25 kaarten laten aanvragen. Alles wat daar niet aan
 * bijdraagt is ballast. Vandaar één actie, drie keer herhaald, en verder alleen
 * antwoorden op de vragen die iemand tegenhouden — moet ik lid worden, hoeveel
 * krijg ik er, hoe komen ze bij me.
 *
 * WAAROM DE VOORWAARDEN BOVENAAN STAAN EN NIET IN DE KLEINE LETTERS
 * "25 kaarten" en "aanvragen tot 5 oktober" zijn geen slechte boodschap maar de
 * reden om nú te klikken. Ze wegstoppen kost aanvragen én levert teleurstelling
 * op bij nummer zesentwintig.
 *
 * SCHEMA
 * Event met alleen wat we zeker weten: naam, data, plaats. Geen organisator en
 * geen aanbod — wij organiseren de beurs niet en verkopen geen kaarten, en
 * schema mag nooit meer beweren dan de pagina.
 *
 * TIJDELIJK: na 11 oktober 2026 gaat deze pagina op noindex of eruit, samen met
 * de aankondigingsbalk (zie _scripts/aankondigingsbalk_pass.py --verwijder).
 */

export const metadata: Metadata = {
  title: 'Gratis kaarten Beurs Eigen Huis 2026 | Bylder',
  description:
    'Bylder heeft 25 gratis kaarten voor de Beurs Eigen Huis, 9 t/m 11 oktober 2026 in de '
    + 'Jaarbeurs Utrecht. Vraag er maximaal twee aan; ze gaan per post. Aanvragen tot 5 oktober.',
  alternates: { canonical: 'https://www.bylder.com/beurs-eigen-huis/' },
  openGraph: {
    title: 'Gratis kaarten voor de Beurs Eigen Huis 2026',
    description:
      '25 kaarten, maximaal twee per persoon, per post thuisbezorgd. Aanvragen tot 5 oktober.',
    url: 'https://www.bylder.com/beurs-eigen-huis/',
    type: 'website',
  },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const AANVRAGEN =
  'https://app.bylder.com/dashboard/beurskaarten?utm_source=bylder-site&utm_campaign=beurs2026'

const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const H2: React.CSSProperties = {
  fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '52px 0 12px',
  textWrap: 'balance', color: '#1A1208',
}
const H3: React.CSSProperties = { fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }
const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24,
}
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: ROEST, fontWeight: 700,
}

function Knop({ children }: { children: React.ReactNode }) {
  return (
    <a href={AANVRAGEN} style={{
      display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800,
      fontSize: 15.5, padding: '14px 26px', borderRadius: 12, textDecoration: 'none',
    }}>{children}</a>
  )
}

const STAPPEN = [
  { kop: 'Maak een Bylder-account', tekst: 'Gratis. We moeten weten wie de kaarten krijgt, en je hebt '
      + 'er meteen de rest van je woningdossier bij.' },
  { kop: 'Vul je adres in', tekst: 'Straat, postcode en woonplaats. Kies één of twee kaarten. '
      + 'Het adres mag afwijken van het adres in je account — veel leden kopen juist een woning '
      + 'waar ze nog niet wonen.' },
  { kop: 'Ze komen per post', tekst: 'Wij sturen ze op. Geen code die je moet omwisselen bij de ingang, '
      + 'gewoon een kaart in de bus.' },
]

const VRAGEN = [
  { v: 'Hoeveel kaarten kan ik aanvragen?',
    a: 'Maximaal twee per persoon. In totaal hebben we er 25, dus op is op. Wie eerder is, is eerder.' },
  { v: 'Tot wanneer kan ik ze aanvragen?',
    a: 'Tot en met 5 oktober 2026. Daarna is het te kort dag om ze nog op tijd op de post te doen.' },
  { v: 'Moet ik lid worden of betalen?',
    a: 'Nee. Een gratis Bylder-account is genoeg. Het lidmaatschap van €79 per jaar is iets aparts en '
      + 'niet nodig voor de kaarten.' },
  { v: 'Wat kost een kaart normaal?',
    a: 'De beurs verkoopt zelf kaarten via beurseigenhuis.nl. Wat wij weggeven zijn kaarten die wij '
      + 'beschikbaar hebben; wat ze aan de kassa kosten bepaalt de organisatie, niet wij.' },
  { v: 'Wanneer en waar is de beurs?',
    a: 'Vrijdag 9, zaterdag 10 en zondag 11 oktober 2026, in de Jaarbeurs in Utrecht.' },
  { v: 'Waarom geeft Bylder kaarten weg?',
    a: 'Omdat onze bezoekers en de bezoekers van die beurs dezelfde mensen zijn: mensen die net een '
      + 'huis hebben gekocht en honderd keuzes voor de boeg hebben. Wij helpen bij die keuzes, en '
      + 'op een beurs zie je ze in het echt.' },
]

export default function BeursEigenHuis() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Event',
            name: 'Beurs Eigen Huis 2026',
            startDate: '2026-10-09',
            endDate: '2026-10-11',
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
              '@type': 'Place',
              name: 'Jaarbeurs',
              address: { '@type': 'PostalAddress', addressLocality: 'Utrecht', addressCountry: 'NL' },
            },
          },
          {
            '@type': 'FAQPage',
            mainEntity: VRAGEN.map(q => ({
              '@type': 'Question', name: q.v,
              acceptedAnswer: { '@type': 'Answer', text: q.a },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
              { '@type': 'ListItem', position: 2, name: 'Beurs Eigen Huis',
                item: 'https://www.bylder.com/beurs-eigen-huis/' },
            ],
          },
        ],
      }) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* Hero — één belofte, één knop, en meteen de grenzen erbij */}
        <section style={{ padding: '48px 0 8px', maxWidth: '68ch' }}>
          <div style={LABEL}>9, 10 en 11 oktober 2026 &middot; Jaarbeurs Utrecht</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#1A1208', margin: '10px 0 16px', textWrap: 'balance', lineHeight: 1.1,
          }}>
            25 gratis kaarten voor de <span style={{ color: ROEST, fontStyle: 'italic', fontWeight: 300 }}>Beurs
            Eigen Huis</span>
          </h1>
          <p style={{ ...P, fontSize: 17.5 }}>
            Wij hebben 25 kaarten en sturen ze per post op. Vraag er &eacute;&eacute;n of twee aan met
            een gratis Bylder-account. Aanvragen kan tot en met <strong>5 oktober</strong>{' '}&mdash;
            daarna krijgen we ze niet meer op tijd bij je.
          </p>
          <div style={{ margin: '22px 0 8px' }}><Knop>Vraag je kaarten aan</Knop></div>
          <p style={{ fontSize: 13.5, color: `${INKT}0.55)`, margin: 0 }}>
            Gratis account. Geen lidmaatschap nodig. Op is op.
          </p>
        </section>

        {/* Hoe het werkt */}
        <section>
          <h2 style={H2}>Hoe je ze krijgt</h2>
          <ol style={{
            listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14,
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          }}>
            {STAPPEN.map((s, i) => (
              <li key={s.kop} style={KAART}>
                <div style={{ ...LABEL, color: GROEN, marginBottom: 8 }}>Stap {i + 1}</div>
                <h3 style={H3}>{s.kop}</h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{s.tekst}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Waarom deze beurs voor deze bezoeker */}
        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Waarom die beurs de moeite waard is als je net gekocht hebt</h2>
          <p style={P}>
            De keuzes die het meeste geld kosten maak je vroeg, en vaak op papier: het kozijn dat
            in de wand moet v&oacute;&oacute;rdat de stukadoor komt, de vloer die de deurhoogte
            bepaalt, de badkamer die op de meerwerklijst staat. Op een beurs zie en voel je
            waar je anders alleen een productfoto van hebt.
          </p>
          <p style={P}>
            Neem je meerwerklijst mee en je plattegrond. Dat zijn de twee dingen waar elke
            standhouder een concreet antwoord op kan geven, en waarmee je thuis verder kunt.
          </p>
          <p style={P}>
            Kozijnloze deuren zijn zo&apos;n keuze die vroeg valt: het frame moet in de wand
            v&oacute;&oacute;r het stucwerk. Wat het kost en wanneer je moet beslissen staat in
            onze <a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700 }}>gids over
            kozijnloze deuren</a>.
          </p>
        </section>

        {/* Vragen */}
        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Vragen</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {VRAGEN.map(q => (
              <div key={q.v} style={KAART}>
                <h3 style={H3}>{q.v}</h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{q.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Slot */}
        <section style={{ margin: '52px 0 64px' }}>
          <div style={{ ...KAART, background: '#1A1208', border: 'none', padding: '34px 28px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px', textWrap: 'balance' }}>
              Er zijn er 25, en dan is het klaar
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.72)', lineHeight: 1.7, margin: '0 auto 20px', maxWidth: '52ch' }}>
              Aanvragen kan tot en met 5 oktober. Daarna sluiten we, zodat ze op tijd op de mat liggen.
            </p>
            <Knop>Vraag je kaarten aan</Knop>
          </div>
        </section>
      </div>
    </div>
  )
}
