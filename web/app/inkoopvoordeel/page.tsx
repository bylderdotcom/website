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
 * Waarheidsgrens: dit is werving ("op uitnodiging"), geen claim. Er staan geen
 * kortingspercentages of deelnemersaantallen op die niet bestaan. Wat er wél
 * staat is echt: het assortiment is live, CNX/DDC is de eerste leverancier, en
 * de vraagkant (woningscan, Kadaster) draait.
 */

export const metadata: Metadata = {
  title: 'Inkoopvoordeel voor vakbedrijven | Bylder',
  description:
    'Verdien aan de afwerking, niet alleen aan je uren. Word verkooppunt van het gecureerde '
    + 'Bylder-assortiment voor afwerking en inrichting — op uitnodiging, een handvol bedrijven per vak per regio.',
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
const P: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 12px' }
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700,
}

const STAPPEN = [
  { n: '1', kop: 'Meld je aan', tekst: 'Vertel wat je vak is en in welke regio je werkt. Deelname is op '
    + 'uitnodiging: een handvol bedrijven per vak per regio, zodat het voor iedereen die meedoet iets oplevert.' },
  { n: '2', kop: 'Kies je categorieën', tekst: 'Per productcategorie maken we afspraken. We beginnen met '
    + 'kozijnloze deuren en breiden categorie voor categorie uit — vloeren, raamdecoratie, verlichting.' },
  { n: '3', kop: 'Verkoop en plaats', tekst: 'Jij adviseert en plaatst bij de klant; het merk levert '
    + 'rechtstreeks aan jou en factureert jou rechtstreeks. Geen tussenvoorraad, geen gedoe.' },
  { n: '4', kop: 'Wij leveren de vraag erbij', tekst: 'Bylder ziet via het Kadaster welke woningen in '
    + 'jouw regio voor een keuze staan. Die vraag sturen we naar aangesloten verkooppunten — en jouw '
    + 'uitgevoerde werk komt als portfolio op je Bylder-profiel.' },
]

const VRAGEN = [
  {
    v: 'Wat kost deelname?',
    a: 'Niets vooraf. Bylder verdient een volumebonus bij de merken over wat er via het programma loopt — '
      + 'niet aan jou. Hoe meer verkooppunten er verkopen, hoe beter de condities voor iedereen worden.',
  },
  {
    v: 'Waarom geen ruwbouwmaterialen?',
    a: 'Die haal je al bij je bouwgroothandel, tegen condities waar wij weinig aan toevoegen. Dit programma '
      + 'gaat over het geld dat nu aan je voorbijloopt: de afwerking en inrichting die de klant zelf bij een '
      + 'winkel koopt terwijl jij hem plaatst.',
  },
  {
    v: 'Wie kan meedoen?',
    a: 'Een handvol bedrijven per vak per regio, op uitnodiging. We beginnen in de regio Rotterdam, '
      + 'Den Haag, Zoetermeer en Leidschendam en breiden van daaruit uit. Aanmelden kan uit heel Nederland; '
      + 'je hoort van ons zodra jouw vak en regio opengaan.',
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

const MAIL = 'mailto:info@bylder.com?subject=' + encodeURIComponent('Inkoopvoordeel — aanmelding verkooppunt')

export default function InkoopvoordeelPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <p style={LABEL}>Zakelijk &middot; op uitnodiging</p>
      <h1 style={{ fontSize: '2.15rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
        Verdien aan de afwerking, niet alleen aan je uren
      </h1>
      <p style={{ ...P, fontSize: 17, maxWidth: '64ch' }}>
        Jij plaatst de deur, de vloer of de raamdecoratie — maar gekocht wordt hij bij een winkel, en dat
        geld loopt aan je voorbij. Bylder maakt van aangesloten vakbedrijven het verkooppunt van een
        gecureerd assortiment voor afwerking en inrichting. Jij verkoopt en plaatst; het merk levert
        rechtstreeks; wij bundelen het volume en sturen de vraag jouw kant op.
      </p>
      <p style={{ margin: '18px 0 0' }}>
        <a href={MAIL} style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '14px 24px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Meld je aan voor een uitnodiging</a>
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
          en het moment.
        </p>
        <a href={MAIL} style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '13px 22px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Meld je aan voor een uitnodiging</a>
      </div>

      <p style={{ ...P, fontSize: 13, color: `${INKT}0.55)`, marginTop: 26 }}>
        Bylder verdient in dit programma een volumebonus bij de merken. Ons advies aan bewoners blijft
        daarvan gescheiden: de offerte-check vergelijkt op marktprijs, ook als dat tegen ons eigen
        aanbod of dat van aangesloten verkooppunten ingaat.
      </p>

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </main>
  )
}
