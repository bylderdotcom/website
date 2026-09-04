import type { Metadata } from 'next'

/**
 * Voor vakbedrijven: aan kozijnloze deuren verdienen, op twee manieren.
 *
 * WAAROM DEZE PAGINA NIET AAN ÉÉN FRANCHISE HANGT
 * De aanleiding was een gesprek met vakmensen van één keten. Toch staat die naam
 * hier niet, om twee redenen. De eerste is dat deze repo openbaar is en de
 * propositie voor elk vakbedrijf open staat, niet op uitnodiging. De tweede is
 * dat een pagina die één keten adresseert precies het soort verband publiceert
 * dat hier nooit hoort te staan. Een link naar deze pagina doet hetzelfde werk.
 *
 * WAAROM HET MONTAGEWERK BOVENAAN STAAT EN DE COMMISSIE ERONDER
 * Eerlijk rekenen: acht deuren in een woning is zo'n €6.000 aan product, dus
 * rond de €60 commissie bij 1%. De montage van diezelfde acht deuren is €2.000
 * tot €4.800. Wie de commissie bovenaan zet, verkoopt het kleinste bedrag als
 * het grootste argument — en dat merkt een aannemer binnen één alinea.
 *
 * Het interessante aan de commissie is iets anders: die loopt óók op producten
 * die je niet zelf monteert. Dat is het argument, en zo staat het er.
 *
 * WAARHEIDSGRENS: "vanaf 1%", nooit één hard getal — het verschilt per merk.
 * De gratis montagetraining is een toezegging van Classic Next; die staat er
 * als zodanig, niet als iets wat Bylder verzorgt.
 */

export const metadata: Metadata = {
  title: 'Kozijnloze deuren monteren en eraan verdienen | Bylder',
  description:
    'Twee inkomsten uit één klus: het montagewerk aan onzichtbare kozijnen, en commissie op '
    + 'wat je klant via jouw code koopt. Met gratis montagetraining van de leverancier.',
  alternates: {
    canonical: 'https://www.bylder.com/kozijnloze-deuren/classic-next/voor-vakbedrijven/',
  },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

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
const CEL: React.CSSProperties = {
  padding: '11px 14px', fontSize: 14.5, borderBottom: `1px solid ${INKT}0.08)`,
  color: `${INKT}0.8)`, verticalAlign: 'top',
}

const AANMELDEN = 'https://app.bylder.com/registreer?utm_source=bylder-site&utm_campaign=vakbedrijf-deuren'

function Knop({ children, href = AANMELDEN }: { children: React.ReactNode; href?: string }) {
  return (
    <a href={href} style={{
      display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800,
      fontSize: 15.5, padding: '14px 26px', borderRadius: 12, textDecoration: 'none',
    }}>{children}</a>
  )
}

// Het rekenvoorbeeld staat of valt met eerlijke getallen. Montagebedragen komen
// van de pillar over kozijnloze deuren; de vanafprijs van het product van de
// leverancier zelf.
const REKENING: [string, string, string][] = [
  ['Product: 8 kozijnen met deur', 'marktprijs €700 – €1.500 per stuk', '€5.600 – €12.000'],
  ['Jouw montage: 8 deuren', '€250 – €600 per deur', '€2.000 – €4.800'],
  ['Jouw commissie op het product', 'vanaf 1% van de aankoopwaarde', 'vanaf €56 – €120'],
  ['Jaarbedrag Bylder', 'eenmaal per jaar, ongeacht het aantal klussen', '−€79'],
]

const STAPPEN = [
  { kop: 'Je meldt je aan', tekst: 'Voor €79 per jaar. Daarmee krijg je je eigen code, je profiel op '
      + 'Bylder en toegang tot het gecureerde assortiment. Open voor elk vakbedrijf; geen uitnodiging '
      + 'nodig, geen omzeteis.' },
  { kop: 'Je volgt de montagetraining', tekst: 'Classic Next verzorgt die kosteloos. Een instuckozijn '
      + 'monteer je niet zoals een gewoon kozijn: het gaat om stellen met verstelbare beugels, en om de '
      + 'overdracht naar de stukadoor. Wie dat één keer goed heeft gezien, doet de tweede in de helft '
      + 'van de tijd.' },
  { kop: 'Je klant koopt via jouw code', tekst: 'Hij bestelt het product zelf, met jouw code. De code '
      + 'wordt aan jou vastgeklonken op het moment dat hij hem claimt — daarna verandert dat niet meer, '
      + 'ook niet als iemand anders er later een link overheen stuurt.' },
  { kop: 'Je factureert je uren, wij de commissie', tekst: 'Het montagewerk loopt zoals altijd tussen '
      + 'jou en je klant; Bylder zit daar niet tussen. De commissie op de aankoop komt van ons, op basis '
      + 'van de verkopen die aan jouw code hangen.' },
]

const VRAGEN = [
  { v: 'Wat kost de montagetraining?',
    a: 'Niets. Classic Next verzorgt de training voor vakbedrijven die hun systemen monteren. Reken op '
      + 'een dagdeel; het gaat vooral om het stellen van het kozijn en om wat de stukadoor van jou moet '
      + 'krijgen.' },
  { v: 'Hoeveel commissie precies?',
    a: 'Vanaf 1% van de aankoopwaarde. Het exacte percentage verschilt per merk en per afspraak, dus we '
      + 'noemen hier geen vast getal dat bij het volgende merk niet blijkt te kloppen. Wat vaststaat is '
      + 'de ondergrens en de manier van rekenen: over de aankoopwaarde, niet over de marge.' },
  { v: 'Moet mijn klant lid worden van Bylder?',
    a: 'Hij heeft een gratis account nodig om de code te claimen. Het betaalde lidmaatschap is iets '
      + 'anders en niet nodig voor de korting die aan jouw code hangt.' },
  { v: 'Gaan jullie mijn klanten zelf benaderen?',
    a: 'Voor het werk dat jij doet niet. Bylder verkoopt geen montage-uren en levert geen vakmensen '
      + 'aan achteraf; wij staan aan de productkant. Dat is ook waarom deze constructie kan bestaan: '
      + 'als we jouw werk zouden verkopen, was je een concurrent kwijt in plaats van een kanaal erbij.' },
  { v: 'Wat als de klant uiteindelijk niets koopt?',
    a: 'Dan is er geen commissie. Er is geen doorverwijsvergoeding voor een gesprek, alleen voor een '
      + 'aankoop. Dat is aan beide kanten duidelijker: je hoeft niemand iets aan te praten om iets over '
      + 'te houden aan een advies dat je toch al gaf.' },
  { v: 'Verdien ik dit jaarbedrag terug?',
    a: 'Bij één woning met kozijnloze deuren is het jaarbedrag terugverdiend aan de commissie alleen, '
      + 'en dat is nog buiten de inkoopkorting en het montagewerk om. Of dat bij jou uitkomt hangt af '
      + 'van hoeveel van dit soort klussen je doet — dat rekenen we hierboven voor met echte bedragen.' },
]

export default function VoorVakbedrijven() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
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
              { '@type': 'ListItem', position: 2, name: 'Kozijnloze deuren',
                item: 'https://www.bylder.com/kozijnloze-deuren/' },
              { '@type': 'ListItem', position: 3, name: 'Classic Next',
                item: 'https://www.bylder.com/kozijnloze-deuren/classic-next/' },
              { '@type': 'ListItem', position: 4, name: 'Voor vakbedrijven',
                item: 'https://www.bylder.com/kozijnloze-deuren/classic-next/voor-vakbedrijven/' },
            ],
          },
        ],
      }) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        <nav aria-label="Kruimelpad" style={{ paddingTop: 26, fontSize: 12,
          fontFamily: "'Space Mono',monospace", letterSpacing: '0.06em',
          textTransform: 'uppercase', color: `${INKT}0.5)` }}>
          <a href="/" style={{ color: 'inherit' }}>Bylder</a>{' / '}
          <a href="/kozijnloze-deuren/" style={{ color: 'inherit' }}>Kozijnloze deuren</a>{' / '}
          <a href="/kozijnloze-deuren/classic-next/" style={{ color: 'inherit' }}>Classic Next</a>
          {' / Voor vakbedrijven'}
        </nav>

        <section style={{ padding: '26px 0 0', maxWidth: '68ch' }}>
          <div style={LABEL}>Voor vakbedrijven</div>
          <h1 style={{
            fontSize: 'clamp(1.9rem, 4.4vw, 2.7rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#1A1208', margin: '10px 0 16px', textWrap: 'balance', lineHeight: 1.12,
          }}>
            Kozijnloze deuren monteren, en verdienen aan wat je klant koopt
          </h1>
          <p style={{ ...P, fontSize: 17.5 }}>
            Onzichtbare kozijnen zijn timmerwerk met een leercurve: het kozijn moet gesteld in de
            ruwbouw, en het stucwerk komt eroverheen. Wie dat kan, heeft werk waar niet iedereen aan
            begint. Twee dingen maken het interessanter dan een gewone montageklus.
          </p>
          <p style={P}>
            <strong>Het eerste is het werk zelf.</strong> Acht deuren in een woning is €2.000 tot €4.800
            aan montage, en Classic Next geeft je de montagetraining gratis mee.{' '}
            <strong>Het tweede is de commissie:</strong> koopt jouw klant het product via jouw code, dan
            krijg je vanaf 1% van de aankoopwaarde &mdash; ook op producten die je zelf niet monteert.
          </p>
          <div style={{ margin: '22px 0 8px' }}><Knop>Meld je aan &mdash; &euro;79 per jaar</Knop></div>
          <p style={{ fontSize: 13.5, color: `${INKT}0.55)`, margin: 0 }}>
            Open voor elk vakbedrijf. Geen uitnodiging, geen omzeteis.
          </p>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Wat het oplevert bij &eacute;&eacute;n woning</h2>
          <p style={P}>
            Geen aannames, wel echte bedragen. Acht binnendeuren is een gangbaar aantal voor een
            eengezinswoning.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff',
            border: `1px solid ${INKT}0.12)`, borderRadius: 16, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th scope="col" style={{ ...CEL, textAlign: 'left', fontWeight: 800, color: '#1A1208' }}>Post</th>
                <th scope="col" style={{ ...CEL, textAlign: 'left', fontWeight: 800, color: '#1A1208' }}>Tarief</th>
                <th scope="col" style={{ ...CEL, textAlign: 'right', fontWeight: 800, color: '#1A1208' }}>Voor jou</th>
              </tr>
            </thead>
            <tbody>
              {REKENING.map(([post, tarief, bedrag]) => (
                <tr key={post}>
                  <th scope="row" style={{ ...CEL, textAlign: 'left', fontWeight: 700, color: '#1A1208' }}>{post}</th>
                  <td style={CEL}>{tarief}</td>
                  <td style={{ ...CEL, textAlign: 'right', fontWeight: 700 }}>{bedrag}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 13, color: `${INKT}0.5)`, margin: '10px 0 0' }}>
            Productprijzen zijn de marktbandbreedte uit onze gids, geen offerte. Montagetarieven zijn de
            bandbreedte uit onze{' '}
            <a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700 }}>gids over kozijnloze
            deuren</a>. Commissie is een ondergrens: het percentage verschilt per merk.
          </p>
          <p style={{ ...P, margin: '18px 0 0' }}>
            Kijk naar de verhouding, want die is het eerlijke verhaal: <strong>het montagewerk is de
            omzet, de commissie is het extraatje.</strong> Wat de commissie bijzonder maakt is niet de
            hoogte maar waar hij vandaan komt &mdash; hij loopt ook als je niets monteert. Adviseert je
            klant je over een bed, een vloer of een keuken en koopt hij dat via jouw code, dan verdien je
            aan werk dat je nooit had gefactureerd.
          </p>
        </section>

        <section>
          <h2 style={H2}>Hoe het loopt</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14,
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
            {STAPPEN.map((s, i) => (
              <li key={s.kop} style={KAART}>
                <div style={{ ...LABEL, color: GROEN, marginBottom: 8 }}>Stap {i + 1}</div>
                <h3 style={H3}>{s.kop}</h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{s.tekst}</p>
              </li>
            ))}
          </ol>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Waarom wij hier geen concurrent van je zijn</h2>
          <p style={P}>
            De vraag die elk vakbedrijf terecht stelt: als Bylder mijn klant bereikt, hoe lang duurt het
            dan voordat Bylder mijn werk verkoopt? Het antwoord zit in waar het geld vandaan komt. Wij
            verdienen aan de productkant, bij merken en winkels. Aan jouw uren verdienen we niets, en
            een tussenpersoon voor montage worden zou die geldstroom kannibaliseren, niet aanvullen.
          </p>
          <p style={P}>
            Daarom draait het model om jou als kanaal. Jij staat bij de klant in de woning, met de
            plattegrond op tafel, op het moment dat de keuzes vallen. Dat is een positie die wij met
            geen enkele pagina kunnen namaken &mdash; en precies daarom betalen we ervoor in plaats van
            hem te bestrijden.
          </p>
          <p style={P}>
            Meer over de constructie, de tarieven per merk en de uitbetaling staat op{' '}
            <a href="/inkoopvoordeel/" style={{ color: GROEN, fontWeight: 700 }}>de pagina over het
            inkoopvoordeel</a>.
          </p>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Wat je moet weten over het monteren</h2>
          <p style={P}>
            Een instuckozijn wordt in de ruwbouw gezet en daarna meegestuukt. De montage staat of valt
            bij het stellen: het kozijn moet haaks en waterpas staan v&oacute;&oacute;rdat de wand
            dichtgaat, want erna corrigeren betekent stucwerk slopen.
          </p>
          <p style={P}>
            Het systeem van Classic Next werkt met verstelbare wandbeugels en levert stucgaas mee. Dat
            is de reden dat de training zin heeft: niet omdat het moeilijk is, maar omdat de handelingen
            anders zijn dan bij een kozijn dat je vastzet en afwerkt. De tweede afspraak in het proces is
            de overdracht naar de{' '}
            <a href="/stukadoor/" style={{ color: GROEN, fontWeight: 700 }}>stukadoor</a>: wie wat
            aflevert, en waar de naad hoort te zitten.
          </p>
          <p style={P}>
            De ontwerpen die je gaat monteren staan op de{' '}
            <a href="/kozijnloze-deuren/freesdeuren/" style={{ color: GROEN, fontWeight: 700 }}>pagina
            met de dertien freesdeuren</a>. Handig om erbij te hebben als een klant vraagt wat er kan.
          </p>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Veelgestelde vragen</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {VRAGEN.map(q => (
              <div key={q.v} style={KAART}>
                <h3 style={H3}>{q.v}</h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{q.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ margin: '52px 0 64px' }}>
          <div style={{ ...KAART, background: '#1A1208', border: 'none', padding: '34px 28px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px',
              textWrap: 'balance' }}>
              Twee inkomsten uit dezelfde klus
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(245,240,232,0.72)', lineHeight: 1.7,
              margin: '0 0 20px', maxWidth: '58ch' }}>
              Het montagewerk factureer je zelf. De commissie komt van ons, over alles wat je klant via
              jouw code koopt. De montagetraining kost je niets, en het jaarbedrag is bij &eacute;&eacute;n
              woning met kozijnloze deuren terugverdiend.
            </p>
            <Knop>Meld je aan &mdash; &euro;79 per jaar</Knop>
          </div>
        </section>
      </div>
    </div>
  )
}
