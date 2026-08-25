import type { Metadata } from 'next'

/**
 * Pillar voor onzichtbare kozijnen / kozijnloze deuren.
 *
 * WAAROM ÉÉN PAGINA EN NIET TWEE
 * De markt gebruikt twee woorden voor hetzelfde ding. Leveranciers die er hun
 * hoofdterm van maken: "onzichtbaar kozijn" bij kozijnen2000, kunststofkozijnen.nl,
 * GYZS, Simon Maree, Schreuder & Co, Ironware en Xinnix zelf; "kozijnloze deur" bij
 * ECLISSE, minimal windows en Rimadesio. De technische term heeft de meeste
 * leveranciersaandacht, de consumententerm de mooiste woorden.
 *
 * Twee losse pagina's zouden elkaar opeten — hetzelfde onderwerp, hetzelfde
 * antwoord. Dus één pagina, met beide termen in de kop, de titel en de tekst.
 *
 * WAAR DE AUTORITEIT VANDAAN MOET KOMEN
 * De bestaande pagina's van leveranciers zijn goed maar noemen geen merken en
 * zeggen niet wanneer je de keuze moet maken. Dat is precies waar Bylder wél iets
 * heeft: het moment vóór de ruwbouw, en de vakbedrijven die het moeten uitvoeren.
 */

export const metadata: Metadata = {
  title: 'Kozijnloze deuren & onzichtbaar kozijn — wat het kost en wanneer je kiest | Bylder',
  description:
    'Een kozijnloze deur hangt in een onzichtbaar kozijn: de deur verdwijnt in de wand. Wat het kost, '
    + 'hoe het technisch werkt, welke merken er zijn — en waarom je deze keuze vóór de ruwbouw maakt.',
  alternates: { canonical: 'https://www.bylder.com/kozijnloze-deuren/' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24,
}
const H2: React.CSSProperties = {
  fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '54px 0 12px',
  textWrap: 'balance', color: '#1A1208',
}
const H3: React.CSSProperties = { fontSize: '1.04rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700,
}
const CEL: React.CSSProperties = {
  padding: '11px 14px', fontSize: 14.5, borderBottom: `1px solid ${INKT}0.08)`,
  color: `${INKT}0.8)`, verticalAlign: 'top',
}

/**
 * Doorsnede van de wand op de plek van het kozijn. Geen productfoto: die zou van
 * één leverancier zijn en dan gaat de pagina over dat merk. Een doorsnede laat
 * zien waar het écht om gaat — het frame zit ín de wand en er blijft alleen een
 * schaduwvoeg over.
 */
function Doorsnede() {
  return (
    <svg viewBox="0 0 420 240" width="100%" style={{ maxWidth: 420, display: 'block' }}
         role="img" aria-label="Doorsnede van een wand: het aluminium frame zit ingebouwd in de wand, met stucwerk eroverheen en alleen een smalle schaduwvoeg naast de deur zichtbaar.">
      <defs>
        <pattern id="ok-arcering" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={GROEN} strokeWidth="0.7" opacity="0.35" />
        </pattern>
      </defs>
      {/* wand links en rechts */}
      <rect x="10" y="40" width="150" height="160" fill="url(#ok-arcering)" stroke={GROEN} strokeWidth="1.6" />
      <rect x="300" y="40" width="110" height="160" fill="url(#ok-arcering)" stroke={GROEN} strokeWidth="1.6" />
      {/* het ingebouwde frame */}
      <rect x="160" y="40" width="16" height="160" fill="none" stroke={GROEN} strokeWidth="2.4" />
      <rect x="284" y="40" width="16" height="160" fill="none" stroke={GROEN} strokeWidth="2.4" />
      {/* de deur */}
      <rect x="182" y="46" width="96" height="148" fill="none" stroke={GROEN} strokeWidth="2.4" />
      {/* schaduwvoeg */}
      <line x1="178" y1="46" x2="178" y2="194" stroke={ROEST} strokeWidth="3" />
      <line x1="282" y1="46" x2="282" y2="194" stroke={ROEST} strokeWidth="3" />
      {/* maatvoering en labels */}
      <line x1="10" y1="220" x2="160" y2="220" stroke={GROEN} strokeWidth="1" strokeDasharray="4 3" />
      <line x1="182" y1="220" x2="278" y2="220" stroke={GROEN} strokeWidth="1" strokeDasharray="4 3" />
      <text x="85" y="234" textAnchor="middle" fontFamily="'Space Mono',monospace" fontSize="10" fill={GROEN}>WAND</text>
      <text x="230" y="234" textAnchor="middle" fontFamily="'Space Mono',monospace" fontSize="10" fill={GROEN}>DEURBLAD</text>
      <text x="168" y="30" textAnchor="middle" fontFamily="'Space Mono',monospace" fontSize="10" fill={GROEN}>FRAME</text>
      <text x="282" y="212" textAnchor="middle" fontFamily="'Space Mono',monospace" fontSize="10" fill={ROEST}>SCHADUWVOEG</text>
    </svg>
  )
}

const SOORTEN = [
  { titel: 'Draaiend, in de wand', tekst: 'Het gewone geval: een scharnierende deur in een ingebouwd frame, '
      + 'met verdekte scharnieren en een magneetslot zodat er geen beslag zichtbaar is. Wandddikte vanaf '
      + 'ongeveer 100 mm, afhankelijk van het profiel.' },
  { titel: 'Schuivend, in de wand', tekst: 'De deur verdwijnt in een cassette in de wand. Vraagt om een '
      + 'dubbele wand op die plek en dus om een besluit vóórdat de wanden staan. Wint ruimte in een gang '
      + 'of een kleine badkamer.' },
  { titel: 'Taatsdeur', tekst: 'Draait om een punt in de vloer en het plafond in plaats van om scharnieren '
      + 'aan de zijkant. Kan zonder kozijn worden uitgevoerd, maar sluit minder goed af — let op tocht en '
      + 'geluid tussen ruimtes.' },
]

const MERKEN = [
  { naam: 'Xinnix', land: 'België', wat: 'X1, X2 en X3-profielen voor draaiend en schuivend. Het bekendste '
      + 'systeem in Nederland en België; veel dealers, dus makkelijk aan te komen.' },
  { naam: 'ECLISSE', land: 'Italië', wat: 'Sterk in schuifdeurcassettes (Syntesis) en kozijnloze draaideuren. '
      + 'Ruime keuze in wanddiktes.' },
  { naam: 'CNX Doorframes', land: 'Uden, NL', wat: 'Instuckozijn met magneetslot en scharnieren als complete '
      + 'combinatie, uit eigen werkplaats. Levert rechtstreeks, gericht op architecten en ontwikkelaars.' },
]

const VRAGEN = [
  {
    v: 'Wat is een onzichtbaar kozijn precies?',
    a: 'Een aluminium of stalen frame dat in de ruwbouw wordt gezet en daarna wordt meegestuukt. Na het '
      + 'stucwerk zie je geen kozijn en geen architraaf meer — alleen een smalle schaduwvoeg tussen de wand '
      + 'en het deurblad. Het heet ook wel een instuckozijn, en een deur die erin hangt heet een kozijnloze '
      + 'deur of onzichtbare deur.',
  },
  {
    v: 'Wat kost een onzichtbaar kozijn?',
    a: 'Leveranciers noemen in augustus 2026 tussen de €700 en €1.500 per kozijn exclusief montage, en rond '
      + '€1.300 voor een compleet systeem inclusief deur. CNX Doorframes uit Uden begint bij €759 exclusief '
      + 'btw voor de combinatie van kozijn en deur. Montage komt daar bovenop: reken op €250 tot €600 per '
      + 'deur, afhankelijk van de wand en de afwerking. Prefab-maten zijn 10 tot 20 procent goedkoper dan '
      + 'volledig maatwerk.',
  },
  {
    v: 'Wanneer moet ik deze keuze maken?',
    a: 'Vóór de ruwbouw, niet erna. Het frame moet in de wand staan voordat er gestuukt wordt, en een '
      + 'schuifdeurcassette vraagt zelfs om een dubbele wand op die plek. Bij nieuwbouw betekent dat: bij de '
      + 'meerwerklijst, niet bij het inrichten. Wie het later bedenkt, betaalt sloop- en stucwerk erbij.',
  },
  {
    v: 'Kan het ook in een bestaande woning?',
    a: 'Ja, maar dan hak je de bestaande sparing open, plaats je het frame en stuuk je de wand opnieuw. Dat '
      + 'is een grotere ingreep dan een deur vervangen en je hebt er een stukadoor bij nodig. Reken op meer '
      + 'kosten dan de leveranciersprijs suggereert.',
  },
  {
    v: 'Wie plaatst een onzichtbaar kozijn?',
    a: 'Meestal een timmerman of montagebedrijf voor het frame en een stukadoor voor de afwerking. Juist die '
      + 'afwerking bepaalt het resultaat: het frame zit recht of niet, en de schaduwvoeg is strak of niet. '
      + 'Vraag naar eerder werk met dit specifieke systeem, niet naar stucwerk in het algemeen.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: VRAGEN.map((q) => ({
    '@type': 'Question', name: q.v,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
}

export default function OnzichtbaarKozijnPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <p style={LABEL}>Keuze vóór de ruwbouw</p>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
        Kozijnloze deuren: de deur verdwijnt in de wand
      </h1>
      <p style={{ ...P, fontSize: 17.5, maxWidth: '62ch' }}>
        Geen kozijn, geen architraaf, geen zichtbaar beslag — alleen een deurblad en een smalle schaduwvoeg.
        Ook wel <strong>kozijnloze deur</strong>, <strong>onzichtbare deur</strong> of{' '}
        <strong>instuckozijn</strong> genoemd. Dit is wat het kost, hoe het technisch in elkaar zit, en
        waarom het moment waarop je kiest belangrijker is dan het merk dat je kiest.
      </p>

      <div style={{ ...KAART, display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap', marginTop: 26 }}>
        <div style={{ flex: '1 1 300px', minWidth: 260 }}><Doorsnede /></div>
        <div style={{ flex: '1 1 240px' }}>
          <h2 style={{ ...H3, marginBottom: 10 }}>Wat je op de doorsnede ziet</h2>
          <p style={{ ...P, fontSize: 14.5, margin: 0 }}>
            Het frame zit ín de wand in plaats van eromheen. Het stucwerk loopt er tot tegenaan, zodat er
            na afwerking alleen een voeg van een paar millimeter overblijft. Daar zit de hele techniek in:
            de wand moet dik genoeg zijn en het frame moet kaarsrecht staan, want die voeg vergeeft niets.
          </p>
        </div>
      </div>

      <h2 style={H2}>Wat het kost</h2>
      <p style={P}>
        Prijzen zoals leveranciers ze zelf publiceren in augustus 2026. Bylder controleert offertes tegen
        marktprijzen; dit zijn de bedragen waarmee je een offerte kunt vergelijken.
      </p>
      <div style={{ overflowX: 'auto', border: `1px solid ${INKT}0.12)`, borderRadius: 14, background: '#fff' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 460 }}>
          <thead>
            <tr>
              <th style={{ ...CEL, ...LABEL, textAlign: 'left', background: '#F5F0E8' }}>Post</th>
              <th style={{ ...CEL, ...LABEL, textAlign: 'left', background: '#F5F0E8' }}>Bedrag</th>
              <th style={{ ...CEL, ...LABEL, textAlign: 'left', background: '#F5F0E8' }}>Waar het van afhangt</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={CEL}>Kozijn los</td><td style={{ ...CEL, fontWeight: 700 }}>€700 – €1.500</td>
              <td style={CEL}>Materiaal, wanddikte, plafondhoog of standaard</td></tr>
            <tr><td style={CEL}>Kozijn + deur</td><td style={{ ...CEL, fontWeight: 700 }}>vanaf ±€760</td>
              <td style={CEL}>Prefab-maat is 10–20% goedkoper dan maatwerk</td></tr>
            <tr><td style={CEL}>Montage</td><td style={{ ...CEL, fontWeight: 700 }}>€250 – €600</td>
              <td style={CEL}>Per deur; hangt af van de wand en het stucwerk</td></tr>
            <tr><td style={{ ...CEL, borderBottom: 'none' }}>Bij bestaande bouw</td>
              <td style={{ ...CEL, borderBottom: 'none', fontWeight: 700 }}>+ sloop &amp; stucwerk</td>
              <td style={{ ...CEL, borderBottom: 'none' }}>Sparing openhakken en de wand opnieuw afwerken</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ ...P, fontSize: 13.5, marginTop: 12, color: `${INKT}0.6)` }}>
        Laat je offerte controleren voordat je tekent — <a href="/offerte-check/" style={{ color: GROEN, fontWeight: 700 }}>de
        offerte-check</a> vergelijkt elke post met de marktprijs.
      </p>

      <h2 style={H2}>Drie manieren waarop het kan</h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {SOORTEN.map((s) => (
          <div key={s.titel} style={KAART}>
            <h3 style={H3}>{s.titel}</h3>
            <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{s.tekst}</p>
          </div>
        ))}
      </div>

      <h2 style={H2}>Het moment telt zwaarder dan het merk</h2>
      <p style={P}>
        Dit is de reden dat deze pagina op Bylder staat en niet alleen bij een leverancier. Een onzichtbaar
        kozijn is geen inrichtingskeuze maar een <strong>bouwkeuze</strong>. Het frame moet in de wand staan
        vóórdat de stukadoor komt. Een schuifdeurcassette vraagt zelfs om een dubbele wand, en die beslis je
        bij de tekening — niet bij de oplevering.
      </p>
      <p style={P}>
        Bij nieuwbouw betekent dat: dit hoort op de <a href="/nieuwbouw-gids/fase-2-bouwfase/meerwerk-nieuwbouw/"
        style={{ color: GROEN, fontWeight: 700 }}>meerwerklijst</a>, in dezelfde ronde als extra stopcontacten
        en vloerverwarming. Wie het pas bedenkt als de sleutel er is, betaalt sloopwerk en een tweede keer
        stucwerk bovenop de deur.
      </p>

      <h2 style={H2}>Welke systemen er zijn</h2>
      <p style={P}>
        De meeste pagina&rsquo;s over dit onderwerp noemen geen enkel merk. Dat maakt kiezen lastig, want de
        profielen verschillen in wanddikte, in of ze duwend open kunnen en in wat er standaard bij zit.
      </p>
      <div style={{ display: 'grid', gap: 12 }}>
        {MERKEN.map((m) => (
          <div key={m.naam} style={{ ...KAART, padding: '18px 22px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <h3 style={{ ...H3, margin: 0 }}>{m.naam}</h3>
              <span style={{ ...LABEL, fontSize: 11 }}>{m.land}</span>
            </div>
            <p style={{ ...P, margin: '6px 0 0', fontSize: 14.5 }}>{m.wat}</p>
          </div>
        ))}
      </div>

      <h2 style={H2}>Wie het plaatst</h2>
      <p style={P}>
        Het frame is timmerwerk, de afwerking is stucwerk — en de afwerking bepaalt of het resultaat strak is.
        Een schaduwvoeg van een paar millimeter laat elke scheefstand zien. Vraag een vakbedrijf naar eerder
        werk met dít systeem, niet naar stucwerk in het algemeen.
      </p>
      <p style={P}>
        <a href="/stukadoor/" style={{ color: GROEN, fontWeight: 700 }}>Stukadoors in jouw gemeente</a>
        {' · '}
        <a href="/aannemer/" style={{ color: GROEN, fontWeight: 700 }}>Aannemers</a>
        {' · '}
        <a href="/kopen/binnendeuren/" style={{ color: GROEN, fontWeight: 700 }}>Alle binnendeuren</a>
      </p>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {VRAGEN.map((q) => (
          <div key={q.v} style={KAART}>
            <h3 style={H3}>{q.v}</h3>
            <p style={{ ...P, margin: 0, fontSize: 15.5 }}>{q.a}</p>
          </div>
        ))}
      </div>

      <div style={{ ...KAART, marginTop: 34, borderColor: 'rgba(61,90,62,0.35)' }}>
        <h2 style={{ ...H3, fontSize: '1.15rem', marginBottom: 10 }}>Weet je al wanneer je moet kiezen?</h2>
        <p style={{ ...P, marginBottom: 16 }}>
          De woningscan laat zien hoe ver de bouw bij jou is en welke keuzes er nog voor je liggen — inclusief
          de keuzes die vóór het stucwerk vastliggen.
        </p>
        <a href="https://app.bylder.com/woningscan" style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '13px 22px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Bekijk wat we al weten over jouw woning</a>
      </div>

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  )
}
