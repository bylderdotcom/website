import type { Metadata } from 'next'

/**
 * De uitlegpagina — en de reden dat de homepage lichter kan worden.
 *
 * De homepage droeg vijf uitlegsecties tegelijk: wat Bylder is, waar de €4.200
 * vandaan komt, waarom het gratis is, wat het uniek maakt en drie vraag-en-antwoorden.
 * Samen goed voor het grootste deel van de pagina, en precies het materiaal dat
 * AI-zoekmachines citeren.
 *
 * Die secties mochten niet vervallen bij de herbouw van de homepage — dat zou
 * citeerbare inhoud weggooien die de site niet kan missen. Ze verhuizen dus hierheen,
 * met de tekst intact, en de homepage verwijst ernaar.
 *
 * De FAQ-schema onderaan herhaalt alleen wat hierboven zichtbaar op de pagina staat.
 * Dat is geen formaliteit: in juli beloofden 562 pagina's in hun schema iets wat
 * nergens in de body stond.
 */

export const metadata: Metadata = {
  title: 'Hoe Bylder werkt — van adres tot laatste lamp | Bylder',
  description:
    'Drie stappen: welke woning je gaat inrichten, wat je daarvoor koopt, en hulp bij de keuzes. '
    + 'Wat Bylder doet, waar de gemiddelde besparing van €4.200 vandaan komt, en waarom het gratis is voor bewoners.',
  alternates: { canonical: 'https://www.bylder.com/hoe-het-werkt/' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 26,
}
const H2: React.CSSProperties = {
  fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '54px 0 14px',
  textWrap: 'balance',
}
const H3: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const CIJFER: React.CSSProperties = {
  fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums', color: '#1A1208',
}
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
  color: `${INKT}0.6)`, fontWeight: 700,
}

// Drie stappen — de volgorde waarin een koper het zelf beleeft.
const STAPPEN = [
  {
    n: '1', titel: 'Welke woning ga je inrichten?',
    tekst: 'Vul je adres in. Wij kijken bij het Kadaster hoe ver de bouw in je buurt is, welk '
      + 'nieuwbouwproject er ligt en welke woonwinkels er in de buurt zijn. Weet je je adres nog '
      + 'niet — bij een woning die nog verkocht moet worden — dan volstaat je plaats, en vul je het later aan.',
    link: { href: 'https://app.bylder.com/woningscan', tekst: 'Bekijk wat we al weten' },
  },
  {
    n: '2', titel: 'Wat ga je kopen?',
    tekst: 'Een woning afwerken is een reeks aankopen: vloer, raamdecoratie, verlichting, keuken, '
      + 'sanitair, tuin. Per categorie laten we zien wat een eerlijke prijs is in jouw gemeente, welke '
      + 'winkels in de buurt zitten en waar ledenkorting geldt.',
    link: { href: '/kopen/', tekst: 'Alles wat je koopt' },
  },
  {
    n: '3', titel: 'Hulp bij de keuzes',
    tekst: 'De meeste keuzes maak je één keer in je leven, zonder referentie. Wij checken je '
      + 'meerwerklijst en je offertes tegen marktprijzen, en helpen bij de aankoopkeuzes daarna — '
      + 'welke vloer past bij vloerverwarming, welke raamdecoratie bij een hoge pui, wat je beter vóór '
      + 'de oplevering vastlegt dan erna.',
    link: { href: '/nieuwbouw-tools/', tekst: 'Alle tools' },
  },
]

// De drie bronnen achter de €4.200 — bedragen zoals ze op de homepage stonden.
const BRONNEN = [
  { bedrag: '€1.840', titel: 'Meerwerkanalyse',
    tekst: 'Gemiddelde overbetaling op de meerwerklijst die de analyse eruit haalt.' },
  { bedrag: '€2.549', titel: 'Kortingsvouchers',
    tekst: 'Korting bij 61 woonmerken voor je inrichting en afwerking.' },
  { bedrag: '€1.640', titel: 'Offerte-check',
    tekst: 'Verschil met de marktprijs op offertes van aannemer en leveranciers.' },
]

// Vraag en antwoord — de tekst hieronder is óók wat in de FAQ-schema staat.
const VRAGEN = [
  {
    v: 'Wat is een meerwerklijst en hoe controleer je die?',
    a: 'Een meerwerklijst is een offerte van de aannemer voor extra werkzaamheden bovenop de '
      + 'standaard bouwtekening: extra stopcontacten, vloerverwarming, een douchegoot. Gemiddeld bevat '
      + 'zo’n lijst meer dan 40 posten. Uit Bylder-data blijkt dat 96% van de kopers ten minste één '
      + 'post betaalt die significant boven de marktprijs ligt; de gemiddelde overbetaling is €1.840. '
      + 'Bylder vergelijkt elke post met actuele marktdata en geeft per post groen, oranje of rood.',
  },
  {
    v: 'Wat kost kopersbegeleiding in Nederland?',
    a: 'Kopersbegeleiding via een aankoopmakelaar of bouwkundig adviseur kost €1.500 tot €5.000 per '
      + 'traject. Bylder is gratis voor bewoners — inclusief meerwerkanalyse, offerte-check, '
      + 'projectplanning en kortingsvouchers. Bylder verdient aan de aanbodkant: vakbedrijven en merken '
      + 'betalen een vaste vergoeding om vindbaar te zijn, allemaal hetzelfde bedrag.',
  },
  {
    v: 'Waarom is Bylder gratis voor bewoners?',
    a: 'Omdat de andere kant betaalt. Vakbedrijven en merken betalen een vaste vergoeding om vindbaar '
      + 'te zijn — lokaal of landelijk, iedereen hetzelfde. Er is geen veiling en geen betaalde positie, '
      + 'dus een aanbeveling staat op geschiktheid en niet op wie het meeste betaalt. Dat kan een '
      + 'platform dat per lead of per klik verkoopt niet zeggen.',
  },
  {
    v: 'Wat kost Bylder?',
    a: 'Bylder is gratis voor bewoners. Je maakt een account aan en gebruikt alles — offerte-check, '
      + 'meerwerkanalyse, aanbevolen producten en vakbedrijven, planning en kortingsvouchers — zonder '
      + 'kosten en zonder abonnement.',
  },
  {
    v: 'Wat is de gemiddelde besparing via Bylder?',
    a: 'Bewoners besparen gemiddeld €4.200: €1.840 via meerwerkanalyse, €2.549 via kortingsvouchers '
      + 'en €1.640 via offerte-check. Niet elke bewoner benut alle drie, daarom is het gemiddelde '
      + 'lager dan de som.',
  },
  {
    v: 'Voor wie is Bylder geschikt?',
    a: 'Voor kopers van een nieuwbouwwoning, bewoners van een bestaande woning en mensen die gaan '
      + 'renoveren. Eén account geeft toegang tot alle trajecten.',
  },
  {
    v: 'Werkt Bylder ook zonder dat ik mijn adres weet?',
    a: 'Ja. Wie nog aan het oriënteren is vult zijn plaats in in plaats van een adres. Je krijgt dan '
      + 'wat er over die plaats bekend is — projecten in de buurt, winkels, de keuzes die je te wachten '
      + 'staan — maar geen bouwstatus, want die is zonder huisnummer niet op te zoeken. Zodra je je adres '
      + 'weet vul je het aan.',
  },
]

// De HowTo stond op de homepage terwijl de uitleg over de meerwerklijst hier
// staat. Schema hoort bij de pagina die de vraag beantwoordt, niet bij de pagina
// die er het meeste verkeer op hoopt.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Hoe controleer je een meerwerklijst nieuwbouw?',
  description: 'Stap-voor-stap uitleg over het controleren van een meerwerklijst bij nieuwbouw via Bylder.',
  totalTime: 'PT10M',
  estimatedCost: { '@type': 'MonetaryAmount', currency: 'EUR', value: '0' },
  step: [
    { '@type': 'HowToStep', name: 'Gratis account aanmaken',
      text: 'Maak een gratis Bylder-account aan. Alles is gratis voor bewoners — geen abonnement, geen verborgen kosten.' },
    { '@type': 'HowToStep', name: 'Meerwerklijst uploaden',
      text: 'Upload je meerwerklijst als PDF in je dashboard.' },
    { '@type': 'HowToStep', name: 'Analyse ontvangen',
      text: 'Elke post wordt vergeleken met marktdata en krijgt groen (marktconform), oranje (check) of rood (te hoog).' },
    { '@type': 'HowToStep', name: 'Onderhandelen',
      text: 'Gebruik de onderhandelingstips om overbetaling te voorkomen. Gemiddelde besparing: €1.840.' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: VRAGEN.map((q) => ({
    '@type': 'Question',
    name: q.v,
    acceptedAnswer: { '@type': 'Answer', text: q.a },
  })),
}

export default function HoeHetWerktPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.028em', marginBottom: 14, textWrap: 'balance' }}>
        Hoe Bylder werkt
      </h1>
      <p style={{ ...P, fontSize: 17.5, maxWidth: '62ch' }}>
        Een woning afwerken is geen moment maar een traject van maanden, met honderd keuzes die je
        meestal één keer in je leven maakt. Bylder loopt dat traject met je mee in drie stappen.
      </p>

      <h2 style={H2}>De drie stappen</h2>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 14 }}>
        {STAPPEN.map((s) => (
          <li key={s.n} style={KAART}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span aria-hidden="true" style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: '#EBF0E8',
                color: GROEN, fontWeight: 800, display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', fontFamily: 'monospace',
              }}>{s.n}</span>
              <div>
                <h3 style={H3}>{s.titel}</h3>
                <p style={{ ...P, margin: '0 0 10px', fontSize: 15.5 }}>{s.tekst}</p>
                <a href={s.link.href} style={{ fontWeight: 700, color: GROEN, fontSize: 14.5 }}>
                  {s.link.tekst} &rarr;
                </a>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <h2 style={H2}>Wat is Bylder?</h2>
      <p style={P}>
        Bylder is een onafhankelijk platform voor iedereen die in Nederland een nieuwbouwwoning,
        bestaande woning of verbouwing heeft. Geen aannemer, geen ontwikkelaar, geen makelaar. Wij
        checken je offerte en meerwerk tegen marktdata, bevelen producten en vakbedrijven aan, plannen
        je traject en ontgrendelen korting bij 61 woonmerken. Wij leggen de keuzes voor; jij kiest.
      </p>
      <p style={P}>
        <strong>Waarom dat nodig is:</strong> 96% van de kopers betaalt minstens één post te duur,
        gemiddeld €1.840 aan meerwerk alleen al. Niet uit slordigheid, maar omdat je zonder referentie
        simpelweg niet weet wat een eerlijke prijs is. Bylder geeft je die referentie.
      </p>

      <h2 style={H2}>Waar komt die €4.200 vandaan?</h2>
      <p style={P}>
        Geen marketinggetal, maar de optelsom van drie plekken waar kopers geld laten liggen.
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))' }}>
        {BRONNEN.map((b) => (
          <div key={b.titel} style={KAART}>
            <div style={CIJFER}>{b.bedrag}</div>
            <div style={{ ...LABEL, margin: '6px 0 8px' }}>{b.titel}</div>
            <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{b.tekst}</p>
          </div>
        ))}
      </div>
      <p style={{ ...P, fontSize: 13.5, marginTop: 14, color: `${INKT}0.6)` }}>
        Bedragen zijn het gemiddelde per bron. Niet elke bewoner benut alle drie — daarom ligt de
        gemiddelde totale besparing per bewoner op €4.200 en niet op de som van de drie.
      </p>

      <h2 style={H2}>Waarom Bylder gratis is voor bewoners</h2>
      <div style={{ ...KAART, borderColor: 'rgba(61,90,62,0.35)' }}>
        <p style={{ ...P, margin: 0 }}>
          Bylder verdient aan de aanbodkant: vakbedrijven en merken betalen een vaste vergoeding om
          vindbaar te zijn — lokaal of landelijk, en iedereen betaalt hetzelfde. Er is geen veiling en
          geen betaalde positie, dus een aanbeveling staat op geschiktheid en nooit op wie het meeste
          betaalt. Dat kan geen platform zeggen dat per lead of per klik verkoopt.
        </p>
        <p style={{ marginTop: 14, marginBottom: 0 }}>
          <a href="/prijzen/" style={{ fontWeight: 700, color: GROEN, fontSize: 14.5 }}>
            Het hele prijsmodel &rarr;
          </a>
        </p>
      </div>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {VRAGEN.map((q) => (
          <div key={q.v} style={KAART}>
            <h3 style={H3}>{q.v}</h3>
            <p style={{ ...P, margin: 0, fontSize: 15.5 }}>{q.a}</p>
          </div>
        ))}
      </div>

      <div style={{ ...KAART, marginTop: 34, borderColor: 'rgba(61,90,62,0.35)', textAlign: 'center' }}>
        <p style={{ ...P, marginBottom: 16 }}>Begin bij stap één: welke woning ga je inrichten?</p>
        <a href="https://app.bylder.com/woningscan" style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '14px 24px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Bekijk wat we al weten over jouw woning</a>
      </div>

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
    </main>
  )
}
