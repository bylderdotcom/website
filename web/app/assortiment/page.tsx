import type { Metadata } from 'next'

/**
 * Het assortiment — de verkoopkant van Bylder, openlijk gescheiden van het advies.
 *
 * WAAROM DEZE PAGINA BESTAAT
 * Besluit Daniel, 26 aug 2026: Bylder regelt verbouwing, afwerking en inrichting —
 * deels zelf, deels met partners. Advies (Koopadvies-menu, gidsen, offerte-check)
 * en verkoop (deze pagina) zijn gescheiden werelden met verschillende beloftes;
 * dat is hoe je speler én betrouwbaar blijft zonder Amazon-macht.
 *
 * V1-REGEL: hier staat alleen wat vandaag echt bestaat en echt te krijgen is.
 * Geen categorieën "binnenkort", geen placeholder-producten. De pagina groeit
 * per echte toevoeging — dat is de aanhuis-les: bewijs weegt, inventaris niet.
 */

export const metadata: Metadata = {
  title: 'Assortiment — wat Bylder en partners leveren | Bylder',
  description:
    'Het assortiment van Bylder: kozijnloze deuren, korting bij 61 woonmerken en de showroomsale. '
    + 'Deels eigen aanbod, deels partners — bij elk aanbod staat wie het levert.',
  alternates: { canonical: 'https://www.bylder.com/assortiment/' },
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
const H3: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 12px' }
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700,
}
const CTA: React.CSSProperties = { fontWeight: 700, color: GROEN, fontSize: 14.5, textDecoration: 'none' }

// Elk aanbod noemt zijn leverancier. Dat is regel één van deze pagina, dus het
// staat in de datastructuur — een aanbod zonder leverancier kan niet eens.
const AANBOD = [
  {
    kop: 'Kozijnloze deuren',
    levering: 'Geleverd door CNX Doorframes, onderdeel van Dutch Doors Company (Uden) · meten en montage door de leverancier of een vakbedrijf uit jouw regio',
    tekst: 'Complete combinatie van onzichtbaar kozijn en deur, met magneetslot en verdekte scharnieren. '
      + 'Vanaf €759 exclusief btw. Let op: het frame moet in de wand vóórdat de stukadoor komt — '
      + 'bij nieuwbouw is dit meerwerk, geen inrichting.',
    links: [
      { href: '/kozijnloze-deuren/', tekst: 'Prijzen en wanneer je kiest' },
    ],
  },
  {
    kop: 'Korting bij 61 woonmerken',
    levering: 'Geleverd door de merken en hun winkels · korting via je gratis Bylder-account',
    tekst: 'Auping, Goossens, DRT Contemporary, Tables by Tim, Whoon en meer — voor bed, bank, vloer, '
      + 'gordijnen, verlichting en tuin. De korting verzilver je bij de winkel of webshop van het merk zelf.',
    links: [
      { href: '/vouchers/', tekst: 'Alle 61 merken en kortingen' },
      { href: '/kortingscode/', tekst: 'Actuele kortingscodes per merk' },
    ],
  },
  {
    kop: 'Showroomsale',
    levering: 'Geleverd door deelnemende winkels · showroommodellen, dus op = op',
    tekst: 'Winkels bieden hun showroommodellen aan met korting: bedden, banken, keukens en badkamers '
      + 'die in de winkel hebben gestaan. Vaak de grootste korting die er op merkmeubels te krijgen is.',
    links: [
      { href: '/showroomsale/', tekst: 'Bekijk het actuele aanbod' },
    ],
  },
]

// De volledige categoriestructuur — ingedeeld naar hoe je een woning afwerkt
// (aanhuis-model), niet naar magazijnindeling. Elke categorie heeft al een
// gids met marktprijzen in /kopen/; het partneraanbod wordt er per categorie
// aan toegevoegd. Zichtbaar maken dwingt tot vullen — dat is de bedoeling.
const GROEPEN: { kop: string; items: { naam: string; href: string }[] }[] = [
  { kop: 'Vloeren & wanden', items: [
    { naam: 'Vloeren', href: '/kopen/vloeren/' },
    { naam: 'Tegels', href: '/kopen/tegels/' },
    { naam: 'Wandafwerking', href: '/kopen/wandafwerking/' },
    { naam: 'Verf', href: '/kopen/verf/' },
  ] },
  { kop: 'Deuren & kozijnen', items: [
    { naam: 'Kozijnloze deuren', href: '/kozijnloze-deuren/' },
    { naam: 'Binnendeuren', href: '/kopen/binnendeuren/' },
    { naam: 'Buitendeuren', href: '/kopen/buitendeuren/' },
  ] },
  { kop: 'Keuken & sanitair', items: [
    { naam: 'Keukens', href: '/kopen/keuken/' },
    { naam: 'Badkamer & sanitair', href: '/kopen/sanitair/' },
  ] },
  { kop: 'Slapen & meubels', items: [
    { naam: 'Bedden & matrassen', href: '/kopen/slaap-en-bedden/' },
    { naam: 'Banken & stoelen', href: '/kopen/zitmeubelen/' },
    { naam: 'Kasten', href: '/kopen/kasten/' },
  ] },
  { kop: 'Raamdecoratie & licht', items: [
    { naam: 'Raamdecoratie', href: '/kopen/raamdecoratie/' },
    { naam: 'Verlichting', href: '/kopen/verlichting/' },
    { naam: 'Elektronica', href: '/kopen/elektronica/' },
  ] },
  { kop: 'Buiten & energie', items: [
    { naam: 'Tuin', href: '/kopen/tuin/' },
    { naam: 'Dakkapellen', href: '/kopen/dakkapellen/' },
    { naam: 'Zonnepanelen', href: '/kopen/zonnepanelen/' },
    { naam: 'Isolatie', href: '/kopen/isolatie/' },
    { naam: 'Laadpalen', href: '/kopen/laadpalen/' },
  ] },
]

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Bylder assortiment',
  description: 'Wat Bylder en partners leveren: kozijnloze deuren, merkenkorting en showroomsale.',
  itemListElement: AANBOD.map((a, i) => ({
    '@type': 'ListItem', position: i + 1, name: a.kop,
    url: 'https://www.bylder.com' + a.links[0].href,
  })),
}

export default function AssortimentPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 72px', color: '#1A1208' }}>
      <p style={LABEL}>Assortiment</p>
      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
        Wat Bylder en partners leveren
      </h1>
      <p style={{ ...P, fontSize: 17, maxWidth: '62ch' }}>
        Dit is de verkoopkant van Bylder — bewust gescheiden van onze gidsen en prijschecks. Hier staat
        alleen wat vandaag echt te krijgen is, en bij elk aanbod staat wie het levert.
      </p>

      {/* De drie regels — niet als kleine lettertjes maar als onderdeel van het aanbod.
          Dit is wat het verschil maakt met een marktplaats die alles belooft. */}
      <div style={{ ...KAART, borderColor: 'rgba(61,90,62,0.35)', marginTop: 24 }}>
        <p style={{ ...LABEL, marginBottom: 10 }}>Zo werkt ons assortiment</p>
        <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
          <li style={{ ...P, margin: 0, fontSize: 14.5 }}>
            <strong>Uitvoering doen wij nooit met eigen mensen.</strong> Montage en plaatsing gaan
            altijd naar een vakbedrijf of winkel die deelneemt — het assortiment is hun orderboek,
            niet hun concurrent.
          </li>
          <li style={{ ...P, margin: 0, fontSize: 14.5 }}>
            <strong>Bij elk aanbod staat wie het levert.</strong> Eigen aanbod heet eigen aanbod,
            partneraanbod noemt de partner.
          </li>
          <li style={{ ...P, margin: 0, fontSize: 14.5 }}>
            <strong>Advies en verkoop zijn gescheiden.</strong> Onze gidsen en de offerte-check
            vergelijken op marktprijs — ook als dat tegen ons eigen aanbod ingaat.
          </li>
        </ol>
      </div>

      <h2 style={H2}>Het aanbod</h2>
      <div style={{ display: 'grid', gap: 14 }}>
        {AANBOD.map((a) => (
          <article key={a.kop} style={KAART}>
            <h3 style={H3}>{a.kop}</h3>
            <p style={{ ...LABEL, fontSize: 11, marginBottom: 10, textTransform: 'none', letterSpacing: 0 }}>{a.levering}</p>
            <p style={{ ...P, fontSize: 15 }}>{a.tekst}</p>
            <p style={{ margin: 0, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {a.links.map((l) => (
                <a key={l.href} href={l.href} style={CTA}>{l.tekst} &rarr;</a>
              ))}
            </p>
          </article>
        ))}
      </div>

      <h2 style={H2}>Alle categorie&euml;n</h2>
      <p style={P}>
        Dit is de volledige structuur van het assortiment &mdash; ingedeeld zoals je een woning afwerkt,
        niet zoals een magazijn is ingericht. Per categorie staat de gids met marktprijzen al klaar;
        het partneraanbod vullen we categorie voor categorie, op uitnodiging.
      </p>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {GROEPEN.map((g) => (
          <div key={g.kop} style={{ ...KAART, padding: '18px 20px' }}>
            <p style={{ ...LABEL, marginBottom: 10 }}>{g.kop}</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
              {g.items.map((c) => (
                <li key={c.href}>
                  <a href={c.href} style={{ fontSize: 14.5, fontWeight: 600, color: GROEN, textDecoration: 'none' }}>
                    {c.naam}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 style={H2}>Leveren aan Bylder-bewoners?</h2>
      <div style={KAART}>
        <p style={{ ...P, marginBottom: 14 }}>
          Deelnemen kan op uitnodiging — wij laten een handvol bedrijven per vak per regio toe, zodat
          elke deelnemer er ook echt iets aan heeft. Werk dat via Bylder binnenkomt, wordt door
          deelnemers uitgevoerd; wij nemen het nooit zelf aan.
        </p>
        <a href="/deelnemer-worden/" style={{
          display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11,
          padding: '13px 22px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
        }}>Meld je aan voor een uitnodiging</a>
        <p style={{ ...P, margin: '14px 0 0', fontSize: 14 }}>
          Vakbedrijf? Bekijk het <a href="/inkoopvoordeel/" style={{ color: GROEN, fontWeight: 700 }}>inkoopvoordeel</a> &mdash;
          word verkooppunt van dit assortiment.
        </p>
      </div>

      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    </main>
  )
}
