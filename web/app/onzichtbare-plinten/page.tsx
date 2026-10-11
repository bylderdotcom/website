import type { Metadata } from 'next'
import PlintAanvraag from './PlintAanvraag'

/**
 * Productpagina onzichtbare plinten (11-10-2026). Backlog: docs/onzichtbare-plinten-content.md.
 *
 * TERMEN
 * De markt gebruikt vier woorden voor hetzelfde: onzichtbare plint, inbouwplint, verdiepte plint en
 * schaduwvoeg (met plintloos afwerken als werkwoord). Eén pagina met alle vier in kop en tekst, net als
 * bij kozijnloze deuren; het kennisbankartikel /kennisbank/vloeren/plintloos-afwerken/ gaat dieper in op
 * de techniek en linkt hierheen.
 *
 * PRIJZEN
 * Alleen de indicatie uit dat kennisbankartikel (€8–20 per strekkende meter, uit door Bylder
 * geanalyseerde offertes, bijgewerkt 27-07-2026). Het rekenvoorbeeld is rekenwerk op een kamer, geen
 * verzonnen gemiddelde per woning. De echte prijs komt uit de offerte.
 *
 * CROSS-SELL (besluit Daniel, 11-10-2026)
 * Kozijnloze deuren en onzichtbare plinten verwijzen altijd naar elkaar: dezelfde strakke wand, hetzelfde
 * moment in de bouw (vóór de stukadoor), vaak dezelfde koper.
 */

const URL = 'https://www.bylder.com/onzichtbare-plinten/'

export const metadata: Metadata = {
  title: 'Onzichtbare plinten en inbouwplinten: kosten en wanneer kiezen | Bylder',
  description:
    'Een onzichtbare plint (inbouwplint of schaduwvoeg) ligt vlak met de wand of laat een voeg van 5–10 mm. '
    + 'Indicatie €8–20 per meter. Beslis vóór de stukadoor komt, net als bij een kozijnloze deur.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Onzichtbare plinten: plintloos afwerken zonder lijst langs de vloer',
    description: 'Inbouwplint, schaduwvoeg of opplakplint: wat het is, wat het kost en wanneer je moet kiezen.',
    url: URL, type: 'website',
  },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const KAART: React.CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24 }
const H2: React.CSSProperties = { fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '54px 0 12px', textWrap: 'balance', color: '#1A1208' }
const H3: React.CSSProperties = { fontSize: '1.04rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '70ch' }
const LABEL: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700 }
const CEL: React.CSSProperties = { padding: '11px 14px', fontSize: 14.5, borderBottom: `1px solid ${INKT}0.08)`, color: `${INKT}0.8)`, verticalAlign: 'top', textAlign: 'left' }

/** Doorsnede onderaan de wand: plint in de wand, vlak met het stucwerk, boven de vloer. */
function Doorsnede() {
  return (
    <svg viewBox="0 0 420 220" width="100%" style={{ maxWidth: 420, display: 'block' }} role="img"
      aria-label="Doorsnede van de onderkant van een wand: de inbouwplint zit in de wand en ligt vlak met het stucwerk. Onder de plint zit een smalle voeg boven de vloer.">
      <defs>
        <pattern id="op-arcering" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={GROEN} strokeWidth="0.7" opacity="0.35" />
        </pattern>
      </defs>
      {/* wand (steen) en stuclaag */}
      <rect x="40" y="10" width="120" height="160" fill="url(#op-arcering)" stroke={GROEN} strokeWidth="1.6" />
      <rect x="160" y="10" width="14" height="128" fill="#EDE7DC" stroke={GROEN} strokeWidth="1.2" />
      {/* inbouwplint: profiel in de wand, voorkant vlak met het stucwerk */}
      <path d="M 174 138 L 174 166 L 150 166 L 150 142 L 160 142 L 160 138 Z" fill="none" stroke={ROEST} strokeWidth="2.6" />
      {/* vloerpakket */}
      <rect x="40" y="170" width="360" height="12" fill="#D9CFBE" stroke={GROEN} strokeWidth="1.2" />
      <rect x="40" y="182" width="360" height="22" fill="url(#op-arcering)" stroke={GROEN} strokeWidth="1.2" />
      {/* lijnen en labels */}
      <line x1="174" y1="20" x2="174" y2="166" stroke={GROEN} strokeWidth="1" strokeDasharray="4 3" />
      <text x="186" y="40" fontSize="12" fill="#1A1208">wandvlak</text>
      <text x="186" y="56" fontSize="12" fill="rgba(61,46,30,.6)">stucwerk en plint liggen vlak</text>
      <text x="186" y="152" fontSize="12" fill={ROEST} fontWeight="700">inbouwplint</text>
      <text x="186" y="168" fontSize="11" fill="rgba(61,46,30,.6)">voeg boven de vloer</text>
      <text x="300" y="198" fontSize="11" fill="rgba(61,46,30,.6)">dekvloer en vloer</text>
    </svg>
  )
}

const UITVOERINGEN = [
  { naam: 'Inbouwplint', ook: 'verdiepte plint', wat: 'Aluminium profiel in de wand, meegestukadoord. Ligt daarna vlak met het wandvlak.', wanneer: 'Vóór de stukadoor', voor: 'Nieuwbouw en grondige renovatie' },
  { naam: 'Schaduwvoeg', ook: 'plintloos afwerken', wat: 'Een stucstopprofiel sluit het stucwerk onderaan strak af; er blijft een open voeg van 5–10 mm.', wanneer: 'Vóór de stukadoor', voor: 'Nieuwbouw, gietvloer, plak-PVC' },
  { naam: 'Opplakplint', ook: 'dunne aluminium plint', wat: 'Een strip van een paar millimeter die op de afgewerkte wand wordt geplakt.', wanneer: 'Achteraf', voor: 'Bestaande bouw' },
]

const VRAGEN = [
  { v: 'Wat is een onzichtbare plint?', a: 'Een plint die niet als lijst op de wand zit maar erin. Een inbouwplint is een aluminium profiel dat wordt meegestukadoord en vlak met de wand ligt; bij een schaduwvoeg eindigt het stucwerk strak boven de vloer met een open voeg van 5 tot 10 mm. De wand lijkt dan los van de vloer te staan.' },
  { v: 'Wat kost een onzichtbare plint per meter?', a: 'Reken indicatief op €8 tot €20 per strekkende meter voor profiel en montage, plus extra stucwerk omdat de onderrand strak moet. Gewone plinten kosten indicatief €5 tot €15 per meter. De indicatie komt uit offertes die Bylder analyseerde; je echte prijs volgt uit de offerte van het vakbedrijf.' },
  { v: 'Wanneer moet ik kiezen voor een inbouwplint?', a: 'Vóór de stukadoor begint. Het profiel wordt in of onder het stucwerk gezet, op de hoogte van het complete vloerpakket. Bij nieuwbouw is het meerwerk, dus geef het door vóór de meerwerkdeadline van je aannemer: hetzelfde moment waarop je een kozijnloze deur kiest.' },
  { v: 'Kan een onzichtbare plint in een bestaande woning?', a: 'Een opplakplint wel: die gaat op de afgewerkte wand. Een inbouwplint of schaduwvoeg achteraf betekent de onderrand van het stucwerk uitslijpen of opnieuw zetten. Dat kan, maar het is meer werk dan het in één keer goed doen.' },
  { v: 'Bij welke vloer past een onzichtbare plint?', a: 'Het best bij vloeren die zelf strak en naadloos zijn en weinig werken: een gietvloer, plak-PVC en verlijmd parket. Bij zwevende vloeren zoals laminaat en klik-PVC wordt het afgeraden, omdat die rondom uitzettingsruimte nodig hebben die normaal onder de plint verdwijnt.' },
  { v: 'Past een onzichtbare plint bij kozijnloze deuren?', a: 'Ja, het is dezelfde gedachte: geen lijsten op de wand. Een kozijnloze deur haalt het kozijn en de architraaf weg, een onzichtbare plint de lijst langs de vloer. Beide gaan vóór de stukadoor de wand in, dus je regelt ze op hetzelfde moment.' },
]

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Assortiment', item: 'https://www.bylder.com/assortiment/' },
      { '@type': 'ListItem', position: 3, name: 'Onzichtbare plinten', item: URL },
    ] },
    { '@type': 'WebPage', '@id': URL, url: URL, name: 'Onzichtbare plinten en inbouwplinten', inLanguage: 'nl-NL',
      about: [{ '@type': 'Thing', name: 'Onzichtbare plint' }, { '@type': 'Thing', name: 'Inbouwplint' }, { '@type': 'Thing', name: 'Schaduwvoeg' }],
      isPartOf: { '@type': 'WebSite', name: 'Bylder', url: 'https://www.bylder.com/' },
      publisher: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' } },
    { '@type': 'HowTo', name: 'Onzichtbare plinten laten plaatsen in een nieuwbouwwoning', step: [
      { '@type': 'HowToStep', name: 'Kies je vloer', text: 'Het profiel komt op de hoogte van het complete vloerpakket, dus de vloer moet vaststaan.' },
      { '@type': 'HowToStep', name: 'Geef het door vóór de meerwerkdeadline', text: 'Bij nieuwbouw is een inbouwplint meerwerk; de stukadoor moet het weten voordat hij begint.' },
      { '@type': 'HowToStep', name: 'Profiel plaatsen', text: 'De stukadoor of afbouwer zet het profiel waterpas rondom.' },
      { '@type': 'HowToStep', name: 'Stucwerk', text: 'De wand wordt strak tot op het profiel gestuukt.' },
      { '@type': 'HowToStep', name: 'Vloer leggen', text: 'Pas daarna komt de vloer, tot in of net onder de voeg.' },
    ] },
    { '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
  ],
}

export default function OnzichtbarePlintenPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Kruimelpad" style={LABEL}>
        <a href="/" style={{ color: 'inherit' }}>Bylder</a> / <a href="/assortiment/" style={{ color: 'inherit' }}>Assortiment</a> / Onzichtbare plinten
      </nav>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance', maxWidth: '22ch' }}>
        Onzichtbare plinten: een wand zonder lijst langs de vloer
      </h1>
      <p style={{ ...P, fontSize: 18 }}>
        Een onzichtbare plint zit in de wand in plaats van erop. Als <strong>inbouwplint</strong> ligt hij vlak met het
        stucwerk; als <strong>schaduwvoeg</strong> eindigt de wand strak boven de vloer. Je kiest hem vóór de stukadoor
        komt, op hetzelfde moment als een kozijnloze deur.
      </p>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', margin: '22px 0 0' }}>
        {[['€8–20', 'per strekkende meter, indicatie uit door Bylder geanalyseerde offertes'],
          ['5–10 mm', 'gangbare voeg boven de vloer bij een schaduwvoeg'],
          ['Vóór het stucwerk', 'het moment waarop je moet kiezen']].map(([g, t]) => (
          <div key={g} style={{ ...KAART, padding: '18px 20px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: GROEN }}>{g}</div>
            <div style={{ fontSize: 13.5, color: `${INKT}0.65)`, lineHeight: 1.5, marginTop: 4 }}>{t}</div>
          </div>
        ))}
      </div>
      <p style={{ margin: '18px 0 0' }}>
        <a href="#offerte" style={{ display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>
          Vraag een offerte aan
        </a>
      </p>

      {/* Het antwoord eerst: de alinea die een AI-antwoord kan overnemen. */}
      <h2 style={{ ...H2, marginTop: 44 }}>Wat is een onzichtbare plint?</h2>
      <p style={P}>
        Een gewone plint is een lijst die je achteraf tegen de wand zet. Een onzichtbare plint zit in de wand: een
        aluminium profiel dat in de ruwbouw wordt gezet en daarna wordt meegestukadoord. Na afwerking zie je geen lijst
        meer, alleen een strak wandvlak en een smalle voeg boven de vloer. In de bouw heet hij ook <strong>inbouwplint</strong> of{' '}
        <strong>verdiepte plint</strong>; zonder profiel en met alleen een voeg heet het <strong>plintloos afwerken</strong>.
      </p>
      <div style={{ ...KAART, display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap', marginTop: 18 }}>
        <div style={{ flex: '1 1 300px', minWidth: 240 }}><Doorsnede /></div>
        <div style={{ flex: '1 1 240px' }}>
          <h3 style={H3}>Wat je op de doorsnede ziet</h3>
          <p style={{ ...P, fontSize: 14.5, margin: 0 }}>
            Het profiel zit in de onderkant van de wand en het stucwerk loopt er tot tegenaan. De voorkant ligt vlak met
            het wandvlak. De hoogte hangt af van het hele vloerpakket: dekvloer, egaline en vloer. Daarom moet de vloer
            vaststaan voordat het profiel geplaatst wordt.
          </p>
        </div>
      </div>

      <h2 style={H2}>Drie uitvoeringen</h2>
      <div style={{ ...KAART, padding: 0, overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 620 }}>
          <caption style={{ position: 'absolute', left: -9999 }}>Uitvoeringen van een onzichtbare plint</caption>
          <thead><tr>{['Uitvoering', 'Wat het is', 'Wanneer', 'Past bij'].map(h => <th key={h} scope="col" style={{ ...CEL, ...LABEL, fontSize: 11 }}>{h}</th>)}</tr></thead>
          <tbody>
            {UITVOERINGEN.map(u => (
              <tr key={u.naam}>
                <th scope="row" style={{ ...CEL, fontWeight: 800, color: '#1A1208' }}>{u.naam}<div style={{ fontWeight: 400, fontSize: 12.5, color: `${INKT}0.55)` }}>ook: {u.ook}</div></th>
                <td style={CEL}>{u.wat}</td>
                <td style={CEL}>{u.wanneer}</td>
                <td style={CEL}>{u.voor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={H2}>Het moment telt: vóór de stukadoor</h2>
      <p style={P}>
        Een inbouwplint of schaduwvoeg wordt in of onder het stucwerk verwerkt. Is de wand al gestuukt, dan moet de
        onderrand worden uitgeslepen en opnieuw opgezet. Bij nieuwbouw is het meerwerk: je aannemer levert standaard
        behangklare wanden zonder profielen. Geef het dus door vóór de meerwerkdeadline.
      </p>
      <ol style={{ ...P, paddingLeft: 22 }}>
        <li><strong>Kies je vloer.</strong> Het profiel komt op de hoogte van het complete vloerpakket.</li>
        <li><strong>Geef het door vóór de meerwerkdeadline.</strong> De stukadoor moet het weten voordat hij begint.</li>
        <li><strong>Profiel plaatsen.</strong> Waterpas, rondom, door de stukadoor of afbouwer.</li>
        <li><strong>Stucwerk.</strong> Strak tot op het profiel.</li>
        <li><strong>Vloer leggen.</strong> Tot in of net onder de voeg.</li>
      </ol>

      <h2 style={H2}>Wat kost een onzichtbare plint?</h2>
      <p style={P}>
        Reken indicatief op <strong>€8 tot €20 per strekkende meter</strong> voor profiel en montage, plus extra
        stucwerk omdat de onderrand perfect strak moet. Gewone plinten kosten indicatief €5 tot €15 per meter. De
        indicatie komt uit offertes die Bylder analyseerde; de echte prijs volgt uit de offerte.
      </p>
      <div style={{ ...KAART, background: 'rgba(61,90,62,0.06)', borderColor: 'rgba(61,90,62,0.25)' }}>
        <h3 style={H3}>Rekenvoorbeeld: één kamer van 4 bij 5 meter</h3>
        <p style={{ ...P, fontSize: 15, margin: 0 }}>
          Rondom is dat 18 meter wand. Min een deur van 0,93 m blijft er ongeveer 17 meter over. Bij €8 tot €20 per
          meter is dat <strong>€136 tot €340</strong> voor profiel en montage, plus het extra stucwerk. Tel zo per
          kamer, of laat het uitrekenen uit je plattegrond in <a href="/mijn-woning/" style={{ color: GROEN, fontWeight: 700 }}>Mijn woning</a>.
        </p>
      </div>

      <h2 style={H2}>Bij welke vloer past het?</h2>
      <p style={P}>
        Het best bij vloeren die zelf strak en naadloos zijn: een <a href="/gietvloer/" style={{ color: GROEN, fontWeight: 700 }}>gietvloer</a>,
        plak-PVC en verlijmd parket. Bij zwevende vloeren zoals laminaat en klik-PVC wordt het afgeraden: die hebben
        rondom uitzettingsruimte nodig, en die verdwijnt normaal onder de plint.
      </p>
      <p style={P}>
        Eerlijk over de nadelen: de onderkant van de wand is stucwerk in plaats van een stootrand. Stofzuiger en
        schoenen laten sneller sporen na, en bij het dweilen mag er geen water tegen de wand lopen.
      </p>

      {/* Cross-sell: dezelfde strakke wand, hetzelfde moment. */}
      <section aria-labelledby="ook-kozijnloos" style={{ ...KAART, marginTop: 44, display: 'grid', gap: 10, borderColor: GROEN, borderWidth: 1.5 }}>
        <p style={{ ...LABEL, color: ROEST, margin: 0 }}>Hoort erbij</p>
        <h2 id="ook-kozijnloos" style={{ ...H2, margin: 0, fontSize: '1.3rem' }}>Ook geen kozijnen?</h2>
        <p style={{ ...P, margin: 0 }}>
          Een onzichtbare plint haalt de lijst langs de vloer weg, een <strong>kozijnloze deur</strong> het kozijn en de
          architraaf. Samen houd je een wand zonder lijsten over. Beide gaan vóór de stukadoor de wand in, dus je regelt
          ze op hetzelfde moment.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/kozijnloze-deuren/configurator/" style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14.5, padding: '11px 18px', borderRadius: 10, textDecoration: 'none' }}>Stel je kozijnloze deuren samen</a>
          <a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700, fontSize: 14.5, padding: '11px 4px' }}>Wat een kozijnloze deur is &rarr;</a>
        </div>
      </section>

      <h2 id="offerte" style={H2}>Vraag een offerte aan</h2>
      <p style={P}>
        We zetten je aanvraag uit bij een vakbedrijf dat inbouwplinten plaatst. Het komt eerst kijken en meet na; de
        offerte komt van dat bedrijf.
      </p>
      <div style={KAART}><PlintAanvraag /></div>

      <h2 style={H2}>Verder lezen</h2>
      <ul style={{ ...P, paddingLeft: 20 }}>
        <li><a href="/kennisbank/vloeren/plintloos-afwerken/" style={{ color: GROEN, fontWeight: 700 }}>Plintloos afwerken: hoe een schaduwvoeg technisch werkt</a></li>
        <li><a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700 }}>Kozijnloze deuren en onzichtbare kozijnen</a></li>
        <li><a href="/gietvloer/ontwerpen/" style={{ color: GROEN, fontWeight: 700 }}>Ontwerp je gietvloer</a></li>
        <li><a href="/ontwerpen/" style={{ color: GROEN, fontWeight: 700 }}>Ontwerpen en bestellen bij Bylder</a></li>
      </ul>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 812 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 20px' }}>
            <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
            <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
