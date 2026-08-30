import type { Metadata } from 'next'

/**
 * Publieke uitleg van de transactielaag: wat er gebeurt tussen een
 * doorverwijzing en een uitbetaling.
 *
 * WAAROM DEZE PAGINA BESTAAT
 * Twee vragen houden partijen tegen, en allebei worden ze zelden hardop
 * gesteld. Een vakbedrijf denkt: hoe weet ik dat ik mijn geld krijg. Een merk
 * denkt: wat moet ik hiervoor doen. Zolang die vragen onbeantwoord zijn, blijft
 * "vanaf 1% van de aankoopwaarde" een belofte zonder mechaniek erachter.
 *
 * WAT ER BEWUST NIET OP STAAT
 * - Geen vast percentage. Publiek is "vanaf 1%"; het verschilt per merk en soms
 *   per productgroep. Eén hard getal is een claim die per partij niet klopt.
 * - Geen bouwvolgorde, geen "binnenkort", geen opsomming van wat nog niet af is.
 * - Alleen registratiemanieren die werken. Op 30 augustus zijn dat er twee: de
 *   code bij het afrekenen in een webshop, en de controlepagina waarop een
 *   winkel de code van de klant nakijkt (app.bylder.com/voucher-check, live).
 *   Aanmelden vooraf bij maatwerk en achteraf gebundeld matchen staan in de
 *   plannen maar draaien niet, dus staan ze hier niet.
 *
 * INDEXATIE
 * Voorlopig noindex. De pagina beschrijft hoe een vakbedrijf wordt uitbetaald;
 * die cyclus is nog niet één keer rondgegaan. Wél al bruikbaar in outreach —
 * voor een mail in een e-mailprogramma maakt noindex niets uit. Zet hem op
 * index zodra de eerste vergoeding daadwerkelijk is uitbetaald, en neem hem dan
 * op in de sitemap.
 */

export const metadata: Metadata = {
  title: 'Hoe een order via Bylder verloopt | Bylder Zakelijk',
  description:
    'Van doorverwijzing tot uitbetaling: hoe een verkoop via Bylder wordt geregistreerd, '
    + 'wanneer een vakbedrijf zijn vergoeding krijgt en wat een merk of winkel ervoor moet doen.',
  alternates: { canonical: 'https://www.bylder.com/zakelijk/hoe-een-order-verloopt/' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Hoe een order via Bylder verloopt',
    description: 'Van doorverwijzing tot uitbetaling, in gewone taal.',
    url: 'https://www.bylder.com/zakelijk/hoe-een-order-verloopt/',
    type: 'article',
    images: [{ url: 'https://www.bylder.com/og-image.jpg' }],
  },
  twitter: { card: 'summary_large_image' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const OKER = '#B85C38'

const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24,
}
const H2: React.CSSProperties = {
  fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '56px 0 12px',
  textWrap: 'balance', color: '#1A1208', scrollMarginTop: 90,
}
const H3: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: '#1A1208' }
const P: React.CSSProperties = {
  fontSize: 15.5, maxWidth: '68ch', lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px',
}
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.09em', color: OKER, fontWeight: 700,
}
const KNOP: React.CSSProperties = {
  display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
  padding: '14px 26px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
}

const REGISTRATIE = [
  {
    kop: 'Webshop',
    tekst: 'De klant vult zijn persoonlijke code in bij het afrekenen. Het orderbedrag en '
      + 'het ordernummer komen rechtstreeks uit jouw systeem — jij hoeft niets extra’s te doen.',
  },
  {
    kop: 'Fysieke winkel',
    tekst: 'De verkoper voert de code in op onze controlepagina. Hij ziet meteen om welke klant '
      + 'het gaat en welke korting geldt, en vult het orderbedrag in. Eén handeling aan de kassa, '
      + 'geen koppeling met je kassasysteem nodig.',
  },
]

const VRAGEN = [
  {
    v: 'Mag ik als vakbedrijf via mijn eigen link kopen?',
    a: 'Ja, maar dan geldt je inkooptarief en niet de verwijsvergoeding. Het tarief volgt de '
      + 'betaler: koop je zelf in op bedrijfsnaam, dan is dat een zakelijke inkoop. Koopt je klant, '
      + 'dan krijgt hij de consumentenkorting en ontvang jij de vergoeding. Nooit allebei op één factuur.',
  },
  {
    v: 'Wanneer krijg ik uitbetaald?',
    a: 'Per kwartaal, en pas nadat de retourtermijn van de order voorbij is. Bij een webshop is dat '
      + 'veertien dagen; bij maatwerk zoals een keuken of raamdecoratie langer, omdat de opdracht dan '
      + 'pas definitief is. Wat er voor je klaarstaat zie je doorlopend in je account.',
  },
  {
    v: 'Hoe weet ik dat een verkoop van mijn klant ook echt aan mij wordt toegerekend?',
    a: 'Elke klant krijgt bij het claimen een eigen code, gekoppeld aan het moment waarop hij die '
      + 'kreeg en aan het vakbedrijf dat hem aanbracht. Die code is niet deelbaar en niet zelf te '
      + 'kiezen. Zonder code geen registratie, met code een sluitende keten van klant tot order.',
  },
  {
    v: 'Moet ik als winkel iets koppelen aan mijn kassa of webshop?',
    a: 'Nee. Een verkoper kan de code op onze controlepagina invoeren; daar is geen koppeling voor '
      + 'nodig. Werkt het bij jou makkelijker via je webshop, dan kan dat ook. Wij richten het in op '
      + 'jouw manier van werken.',
  },
  {
    v: 'Zit er exclusiviteit aan?',
    a: 'Nee. Je bepaalt zelf aan welke onderdelen van de overeenkomst je meedoet, en je kunt met '
      + 'andere partijen blijven samenwerken zoals je gewend bent.',
  },
  {
    v: 'Wat kost het een merk of winkel?',
    a: 'Je betaalt alleen bij een gerealiseerde verkoop. Geen opstartkosten, geen vergoeding per '
      + 'klik of per lead.',
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

const broodSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Bylder.com', item: 'https://www.bylder.com/' },
    { '@type': 'ListItem', position: 2, name: 'Zakelijk', item: 'https://www.bylder.com/zakelijk/' },
    { '@type': 'ListItem', position: 3, name: 'Hoe een order verloopt',
      item: 'https://www.bylder.com/zakelijk/hoe-een-order-verloopt/' },
  ],
}

/** De keten in vier stappen. currentColor, zodat hij meekleurt met de tekst. */
function Keten() {
  const stappen = [
    { t: 'De klant krijgt zijn code', o: 'via zijn vakman of rechtstreeks' },
    { t: 'Hij koopt bij een aangesloten partij', o: 'met korting, op zijn eigen code' },
    { t: 'De verkoop wordt geregistreerd', o: 'in de webshop of op de controlepagina' },
    { t: 'Uitbetaling per kwartaal', o: 'na de retourtermijn, met factuur' },
  ]
  return (
    <div style={{ ...KAART, padding: '28px 24px', marginTop: 20, overflowX: 'auto' }}>
      <svg viewBox="0 0 880 150" style={{ display: 'block', width: '100%', minWidth: 620, height: 'auto', color: GROEN }}
           role="img" aria-label="De keten in vier stappen: de klant krijgt een code, koopt bij een aangesloten partij, de verkoop wordt geregistreerd, en er volgt uitbetaling per kwartaal.">
        {stappen.map((s, i) => {
          const x = 20 + i * 218
          return (
            <g key={s.t}>
              <rect x={x} y={20} width={180} height={62} rx={11} fill="none"
                    stroke="currentColor" strokeWidth={1.6} />
              <circle cx={x + 26} cy={51} r={13} fill="currentColor" />
              <text x={x + 26} y={56} textAnchor="middle" fill="#F5F0E8"
                    fontFamily="'Space Mono',monospace" fontSize={13} fontWeight={700}>{i + 1}</text>
              <text x={x + 48} y={47} fill="#1A1208" fontSize={12.5} fontWeight={700}>
                {s.t.length > 26 ? s.t.slice(0, 25) + '…' : s.t}
              </text>
              <text x={x + 48} y={65} fill="rgba(61,46,30,0.62)" fontSize={11}>
                {s.o.length > 30 ? s.o.slice(0, 29) + '…' : s.o}
              </text>
              {i < 3 && (
                <path d={`M${x + 186} 51 L${x + 212} 51 M${x + 205} 45 L${x + 212} 51 L${x + 205} 57`}
                      fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
              )}
            </g>
          )
        })}
        <text x={20} y={120} fill="rgba(61,46,30,0.62)" fontSize={11.5}
              fontFamily="'Space Mono',monospace">
          ELKE STAP IS VASTGELEGD — DE CODE VERBINDT KLANT, VAKBEDRIJF EN ORDER
        </text>
      </svg>
    </div>
  )
}

export default function HoeEenOrderVerlooptPage() {
  return (
    <main style={{ maxWidth: 1200, boxSizing: 'border-box', margin: '0 auto', padding: '44px 24px 80px', color: '#1A1208' }}>
      <p style={{ fontSize: 13, color: `${INKT}0.66)`, marginBottom: 24 }}>
        <a href="/" style={{ color: 'inherit' }}>Bylder.com</a> &rsaquo;{' '}
        <a href="/zakelijk/" style={{ color: 'inherit' }}>Zakelijk</a> &rsaquo; Hoe een order verloopt
      </p>

      <p style={LABEL}>Voor vakbedrijven, merken en winkels</p>
      <h1 style={{ fontSize: '2.3rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 16px', textWrap: 'balance', maxWidth: '18ch' }}>
        Hoe een order via Bylder verloopt
      </h1>
      <p style={{ ...P, fontSize: 17.5, maxWidth: '58ch' }}>
        Een klant krijgt bij ons een persoonlijke code, vaak via zijn eigen vakman. Koopt hij daarmee
        bij een aangesloten merk of winkel, dan krijgt hij korting, wordt de verkoop geregistreerd en
        ontvangt het vakbedrijf dat hem aanbracht een vergoeding. Op deze pagina staat wat er tussen
        die doorverwijzing en die uitbetaling gebeurt.
      </p>

      <Keten />

      <h2 style={H2}>Hoe een verkoop bij ons binnenkomt</h2>
      <p style={P}>
        Wij passen ons aan hoe jij verkoopt, niet andersom. Twee manieren, allebei zonder dat je iets
        aan je systemen hoeft te veranderen.
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(17rem,1fr))' }}>
        {REGISTRATIE.map((r) => (
          <div key={r.kop} style={KAART}>
            <div style={{ width: 28, height: 4, borderRadius: 2, background: GROEN, marginBottom: 14 }} />
            <h3 style={H3}>{r.kop}</h3>
            <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{r.tekst}</p>
          </div>
        ))}
      </div>

      <h2 style={H2}>Twee rollen, één regel</h2>
      <p style={P}>
        Een vakbedrijf kan twee dingen tegelijk doen: zelf inkopen bij onze deelnemers, én klanten
        doorverwijzen. Die twee lopen niet door elkaar, en de regel daarvoor is eenvoudig:{' '}
        <strong style={{ color: '#1A1208' }}>het tarief volgt de betaler.</strong>
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(17rem,1fr))' }}>
        <div style={KAART}>
          <h3 style={H3}>Jij betaalt</h3>
          <p style={{ ...P, margin: 0, fontSize: 14.5 }}>
            Koop je in op bedrijfsnaam, met KvK en btw-nummer op de factuur, dan geldt je
            <strong> inkooptarief</strong>. Er is dan geen verwijsvergoeding — je verwijst niet naar jezelf.
          </p>
        </div>
        <div style={KAART}>
          <h3 style={H3}>Je klant betaalt</h3>
          <p style={{ ...P, margin: 0, fontSize: 14.5 }}>
            Koopt je klant op zijn eigen code, dan krijgt hij de <strong>consumentenkorting</strong> en
            ontvang jij de <strong>verwijsvergoeding</strong> over wat hij besteedt.
          </p>
        </div>
      </div>
      <p style={{ ...P, marginTop: 16 }}>
        Nooit twee tarieven op één factuur. Dat maakt het voor jou navolgbaar en voor de winkel
        controleerbaar.
      </p>

      <h2 style={H2} id="vakbedrijven">Voor vakbedrijven: wat je krijgt en wanneer</h2>
      <p style={P}>
        Je ontvangt <strong>vanaf 1% van de aankoopwaarde</strong> van wat je klant koopt. Het exacte
        percentage verschilt per merk en soms per productgroep; wat er voor jou geldt staat in je
        eigen omgeving, zodat je het van tevoren weet.
      </p>
      <ul style={{ ...P, paddingLeft: 20 }}>
        <li style={{ marginBottom: 8 }}>
          <strong>Wanneer:</strong> per kwartaal, en pas nadat de retourtermijn voorbij is. Bij een
          webshop is dat veertien dagen; bij maatwerk langer, omdat de opdracht dan pas definitief is.
        </li>
        <li style={{ marginBottom: 8 }}>
          <strong>Hoe:</strong> met een factuur die wij voor je opmaken — je hoeft zelf niets te
          factureren.
        </li>
        <li>
          <strong>Waar:</strong> in je account zie je doorlopend welke verkopen zijn geregistreerd en
          wat er voor je klaarstaat.
        </li>
      </ul>
      <p style={{ marginTop: 18 }}>
        <a href="/inkoopvoordeel/" style={KNOP}>Aansluiten als vakbedrijf</a>
      </p>

      <h2 style={H2} id="merken">Voor merken en winkels: één overeenkomst, drie onderdelen</h2>
      <p style={P}>
        Je krijgt één overeenkomst met drie onderdelen, en je bepaalt zelf aan welke je meedoet.
        Geen van drieën is verplicht.
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(15rem,1fr))' }}>
        {[
          ['Consumentenkorting', 'Wat een koper met een persoonlijke code bij jou krijgt.'],
          ['Inkooptarief', 'Wat een aangesloten vakbedrijf betaalt als het zelf inkoopt, op zakelijke factuur.'],
          ['Verwijsvergoeding', 'Wat een vakbedrijf ontvangt als zijn klant bij jou koopt. Betaal je alleen bij een gerealiseerde verkoop.'],
        ].map(([k, t]) => (
          <div key={k} style={KAART}>
            <h3 style={H3}>{k}</h3>
            <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{t}</p>
          </div>
        ))}
      </div>
      <p style={{ ...P, marginTop: 16 }}>
        Er zit geen exclusiviteit aan, en je betaalt niets vooraf. De manier van terugmelden richten
        wij in op hoe jij werkt: via je webshop bij het afrekenen, of via onze controlepagina aan de
        kassa.
      </p>
      <p style={{ marginTop: 18 }}>
        <a href="/deelnemer-worden/" style={KNOP}>Deelnemer worden</a>
      </p>

      <h2 style={H2}>Wat wij niet doen</h2>
      <div style={{ ...KAART, borderColor: 'rgba(184,92,56,0.35)', maxWidth: '54rem' }}>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15.5, lineHeight: 1.8, color: `${INKT}0.78)` }}>
          <li><strong style={{ color: '#1A1208' }}>Wij zijn geen partij bij de koop.</strong> De
            overeenkomst is tussen de klant en jou. Retouren, garantie en aansprakelijkheid lopen niet
            via ons.</li>
          <li><strong style={{ color: '#1A1208' }}>Wij verkopen geen leads.</strong> Er is geen
            veiling, geen prijs per aanvraag en geen doorverkoop van dezelfde vraag aan meerdere
            partijen.</li>
          <li><strong style={{ color: '#1A1208' }}>Wij verkopen geen klantgegevens door.</strong> Een
            deelnemer ziet wat hij nodig heeft om de korting te verwerken, niet meer.</li>
        </ul>
      </div>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 12, maxWidth: '54rem' }}>
        {VRAGEN.map((q) => (
          <div key={q.v} style={KAART}>
            <h3 style={H3}>{q.v}</h3>
            <p style={{ ...P, margin: 0, fontSize: 15 }}>{q.a}</p>
          </div>
        ))}
      </div>

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(broodSchema) }} />
    </main>
  )
}
