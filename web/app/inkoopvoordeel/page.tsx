import type { Metadata } from 'next'

/**
 * Wervingspagina voor het inkoopprogramma — vakbedrijven als verkooppunt van het
 * gecureerde afwerkings- en inrichtingsassortiment.
 *
 * Besluit Daniel, 27 aug 2026. De begrenzing is onderdeel van het idee: GEEN
 * ruwbouwmaterialen — die haalt een vakbedrijf al bij zijn bouwgroothandel en
 * daar valt niets te winnen. Wél de afwerking en inrichting die de klant nu zelf
 * bij een winkel koopt, waar de vakman niets aan verdient.
 *
 * Besluit Daniel, 29 aug 2026: de deur gaat open. "Op uitnodiging" was een
 * drempel die we zelf opwierpen; elk vakbedrijf kan meedoen voor EUR 79 per jaar.
 * En het programma is niet één maar twee dingen — dat tweede is het overtuigende
 * deel en stond er helemaal niet op:
 *
 *   1. inkoopkorting op wat het bedrijf zelf verwerkt;
 *   2. vanaf 1% van de aankoopwaarde als de KLANT via de code van het
 *      vakbedrijf koopt — een categorie waar dit bedrijf nooit iets verdiende,
 *      zonder inkopen, voorraad of montage.
 *
 * Waarheidsgrens: "vanaf 1%" en niet één hard getal, want het verschilt per merk.
 * Eén percentage op de pagina wordt een belofte die bij het eerste afwijkende
 * merk niet klopt. Wat er verder staat is echt: het assortiment is live, CNX/DDC
 * is de eerste leverancier, en de vraagkant (woningscan, Kadaster) draait.
 *
 * Uitbetalen kan pas als elke aankoop herleidbaar is tot een persoonlijke code.
 * Zolang die er niet is, is dit een propositie en geen werkend systeem — houd
 * die volgorde in de gaten voordat dit breed wordt uitgezet.
 */

export const metadata: Metadata = {
  title: 'Inkoopvoordeel voor vakbedrijven — €79 per jaar | Bylder',
  description:
    'Verdien aan de afwerking, niet alleen aan je uren. Inkoopkorting op het Bylder-assortiment '
    + 'én vanaf 1% van de aankoopwaarde als je klant via jouw code koopt. €79 per jaar, open voor elk vakbedrijf.',
  alternates: { canonical: 'https://www.bylder.com/inkoopvoordeel/' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24,
}
const H2: React.CSSProperties = {
  fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '48px 0 12px',
  textWrap: 'balance', color: '#1A1208',
}
const H3: React.CSSProperties = { fontSize: '1.03rem', fontWeight: 800, margin: '0 0 6px', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 15.5, maxWidth: '70ch', lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 12px' }
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700,
}

const STAPPEN = [
  { n: '1', kop: 'Meld je aan', tekst: 'Vertel wat je vak is en in welke regio je werkt. Elk vakbedrijf kan '
    + 'meedoen; deelname kost €79 per jaar. Je krijgt je eigen code en je profiel op Bylder.' },
  { n: '2', kop: 'Kies je categorieën', tekst: 'Per productcategorie maken we afspraken. We beginnen met '
    + 'kozijnloze deuren en breiden categorie voor categorie uit — vloeren, raamdecoratie, verlichting.' },
  { n: '3', kop: 'Verkoop en plaats', tekst: 'Jij adviseert en plaatst bij de klant; het merk levert '
    + 'rechtstreeks aan jou en factureert jou rechtstreeks. Geen tussenvoorraad, geen gedoe.' },
  { n: '4', kop: 'Of laat je klant zelf kopen', tekst: 'Wil je klant iets uit het assortiment dat je niet '
    + 'zelf levert — een bed, een bank, verlichting? Geef hem je code. Hij krijgt korting, jij krijgt vanaf '
    + '1% van de aankoopwaarde. Geen inkoop, geen voorraad, geen montage.' },
  { n: '5', kop: 'Wij leveren de vraag erbij', tekst: 'Bylder ziet via het Kadaster welke woningen in '
    + 'jouw regio voor een keuze staan. Die vraag sturen we naar aangesloten verkooppunten — en jouw '
    + 'uitgevoerde werk komt als portfolio op je Bylder-profiel.' },
]

const VRAGEN = [
  {
    v: 'Wat kost deelname?',
    a: '€79 per jaar. Dat is het enige wat je betaalt: geen opstartkosten, geen commissie over je eigen '
      + 'werk. Met twee klanten die via jouw code iets kopen heb je het er doorgaans al uit — bij een '
      + 'aankoop van €4.000 is 1% al €40.',
  },
  {
    v: 'Hoe verdien ik aan iets dat ik niet zelf lever?',
    a: 'Je klant koopt tóch. Als hij dat via jouw persoonlijke code doet, krijgt hij korting op het '
      + 'Bylder-assortiment en ontvang jij vanaf 1% van de aankoopwaarde. Je koopt niets in, houdt niets '
      + 'op voorraad en monteert niets. Het enige wat je doet is de code geven.',
  },
  {
    v: 'Is dat percentage voor elk merk hetzelfde?',
    a: 'Nee. Het begint bij 1% en ligt bij sommige merken hoger; het hangt af van de afspraak met dat merk. '
      + 'Wat je per merk krijgt staat in je eigen omgeving, zodat je het van tevoren weet.',
  },
  {
    v: 'Waarom geen ruwbouwmaterialen?',
    a: 'Die haal je al bij je bouwgroothandel, tegen condities waar wij weinig aan toevoegen. Dit programma '
      + 'gaat over het geld dat nu aan je voorbijloopt: de afwerking en inrichting die de klant zelf bij een '
      + 'winkel koopt terwijl jij hem plaatst.',
  },
  {
    v: 'Wie kan meedoen?',
    a: 'Elk vakbedrijf in Nederland, ongeacht vak of regio. Er is geen uitnodiging nodig en geen maximum '
      + 'per gebied. Het assortiment groeit per categorie, dus wat je kunt aanbieden hangt af van welke '
      + 'categorieën al open staan — dat zie je in je eigen omgeving.',
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

const MAIL = 'mailto:info@bylder.com?subject=' + encodeURIComponent('Inkoopvoordeel — aanmelding vakbedrijf')

export default function InkoopvoordeelPage() {
  return (
    <main style={{ maxWidth: 1200, boxSizing: 'border-box', margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <p style={LABEL}>Zakelijk &middot; &euro;79 per jaar</p>
      <h1 style={{ fontSize: '2.15rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
        Verdien aan de afwerking, niet alleen aan je uren
      </h1>
      <p style={{ ...P, fontSize: 17, maxWidth: '64ch' }}>
        Jij plaatst de deur, de vloer of de raamdecoratie — maar gekocht wordt hij bij een winkel, en dat
        geld loopt aan je voorbij. Bij Bylder verdien je er op twee manieren aan: <strong>inkoopkorting</strong> op
        wat je zelf verwerkt, en <strong>vanaf 1% van de aankoopwaarde</strong> als je klant via jouw code koopt.
        Ook aan spullen die je niet zelf levert.
      </p>

      <div style={{ ...KAART, marginTop: 20, background: '#EBF0E8', borderColor: 'rgba(61,90,62,0.3)', maxWidth: '64ch' }}>
        <h2 style={{ ...H2, margin: '0 0 8px', fontSize: '1.18rem' }}>Het rekensommetje</h2>
        <p style={{ ...P, margin: 0, fontSize: 15 }}>
          Een klant van jou koopt een bed. Jij zegt één zin: <em>koop &rsquo;m via deze code, dan krijg je
          korting.</em> De klant betaalt minder, jij ontvangt vanaf 1% van de aankoopwaarde — bij
          &euro;4.000 is dat &euro;40. Twee van die zinnen en je jaarbijdrage van &euro;79 is eruit;
          alles daarna is winst. Je koopt niets in, houdt niets op voorraad en monteert niets.
        </p>
        <p style={{ ...P, margin: '12px 0 0', fontSize: 14.5, paddingTop: 12,
                    borderTop: '1px solid rgba(61,90,62,0.25)' }}>
          <strong style={{ color: '#1A1208' }}>Inkopen en doorverwijzen lopen niet door elkaar.</strong>{' '}
          Het tarief volgt de betaler: koop je zelf in op bedrijfsnaam, dan geldt je inkooptarief en
          is er geen verwijsvergoeding &mdash; je verwijst niet naar jezelf. Koopt je klant, dan krijgt
          hij de korting en ontvang jij de vergoeding. Nooit allebei op &eacute;&eacute;n factuur.{' '}
          <a href="/zakelijk/hoe-een-order-verloopt/#vakbedrijven"
             style={{ color: GROEN, fontWeight: 700 }}>Van doorverwijzing tot uitbetaling &rarr;</a>
        </p>
      </div>
      <p style={{ margin: '18px 0 0' }}>
        <a href={MAIL} style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '14px 24px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Meld je aan &mdash; &euro;79 per jaar</a>
      </p>

      <h2 style={H2}>Waarom dit iets anders is dan je groothandel</h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        <div style={KAART}>
          <h3 style={H3}>Geen ruwbouw</h3>
          <p style={{ ...P, margin: 0, fontSize: 14.5 }}>Gips, hout en leidingwerk haal je al bij je
          bouwgroothandel — daar blijven we vanaf. Dit gaat om wat de klant zíét: deuren, vloeren,
          raamdecoratie, verlichting.</p>
        </div>
        <div style={KAART}>
          <h3 style={H3}>Gecureerd, niet alles</h3>
          <p style={{ ...P, margin: 0, fontSize: 14.5 }}>Per categorie een klein aantal merken dat wij
          zelf zouden kiezen — te beginnen met de kozijnloze deuren van CNX Doorframes (Dutch Doors
          Company, Uden), die nu al in <a href="/assortiment/" style={{ color: GROEN, fontWeight: 700 }}>ons
          assortiment</a> staan.</p>
        </div>
        <div style={KAART}>
          <h3 style={H3}>De vraag komt erbij</h3>
          <p style={{ ...P, margin: 0, fontSize: 14.5 }}>Bylder ziet via het Kadaster welke woningen in
          jouw regio voor een keuze staan — vóórdat de klant een winkel binnenloopt. Geen inkoopclub
          die alleen korting regelt: wij brengen ook de klant.</p>
        </div>
      </div>

      <h2 style={H2}>Zo werkt het</h2>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
        {STAPPEN.map((s) => (
          <li key={s.n} style={{ ...KAART, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span aria-hidden="true" style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: '#EBF0E8',
              color: GROEN, fontWeight: 800, display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'monospace',
            }}>{s.n}</span>
            <div>
              <h3 style={H3}>{s.kop}</h3>
              <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{s.tekst}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {VRAGEN.map((q) => (
          <div key={q.v} style={KAART}>
            <h3 style={H3}>{q.v}</h3>
            <p style={{ ...P, margin: 0, fontSize: 15 }}>{q.a}</p>
          </div>
        ))}
      </div>

      <div style={{ ...KAART, marginTop: 30, borderColor: 'rgba(61,90,62,0.35)' }}>
        <p style={{ ...P, marginBottom: 14 }}>
          Eén regel om te onthouden: wij nemen nooit zelf werk aan. Het werk — verkopen, plaatsen,
          de klantrelatie — is en blijft van het vakbedrijf. Wij leveren het assortiment, het volume
          en het moment. En als jouw klant iets koopt dat jij niet levert, verdien jij eraan mee in
          plaats van dat het aan je voorbijgaat.
        </p>
        <a href={MAIL} style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '13px 22px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Meld je aan &mdash; &euro;79 per jaar</a>
      </div>

      <p style={{ ...P, fontSize: 13, color: `${INKT}0.55)`, marginTop: 26 }}>
        Bylder verdient aan de jaarbijdrage en aan een volumebonus bij de merken. Ons advies aan bewoners
        blijft daarvan gescheiden: de offerte-check vergelijkt op marktprijs, ook als dat tegen ons eigen
        aanbod of dat van aangesloten vakbedrijven ingaat. Vergoedingen worden uitgekeerd op basis van
        aankopen die via een persoonlijke code herleidbaar zijn.
      </p>

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  )
}
