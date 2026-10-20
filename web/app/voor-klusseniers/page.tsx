import type { Metadata } from 'next'
import { aantalMerken } from '@/lib/merken'
import AanbodStrook from '../components/AanbodStrook'

/**
 * Uitleg voor De Klusseniers (20-10-2026): hoe een Klussenier klanten aanbrengt met zijn
 * eigen link (bylder.com/via/<slug>/, zie via/aanbrengers.ts) en wat hij daaraan verdient.
 * Geschreven voor hun marketing, die het aan de vestigingen uitlegt.
 *
 * Feiten (Daniel, 20-10-2026):
 * - link delen via WhatsApp; wij zien wie via die link ontwerpt, aanvraagt en bestelt
 * - bij een aankoop commissie; de hoogte is nog niet bepaald ("nader te bepalen")
 * - Classic Next-deuren: de Klussenier verdient ook aan de montage
 * - kast op maat en gietvloer plaatst de Klussenier niet zelf, wel commissie
 * Korting voor de klant (11-10-2026): 10% op de orderwaarde voor deuren, gietvloer, kast.
 *
 * Noindex: een uitleg voor één samenwerking, geen zoekpagina, en de naam van De Klusseniers
 * hoort pas in Google als zij daar akkoord op geven.
 */

export const metadata: Metadata = {
  title: 'Klanten aanbrengen via Bylder: zo werkt het voor Klusseniers | Bylder',
  description: 'Deel je eigen Bylder-link via WhatsApp. Je klant krijgt 10% korting op deuren, gietvloer en kast op maat; jij krijgt commissie op elke aankoop, en bij Classic Next-deuren ook de montage.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.bylder.com/voor-klusseniers/' },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.7, color: `${INKT}0.78)`, margin: '0 0 12px', maxWidth: '66ch' }
const LABEL: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: ROEST, fontWeight: 700, margin: 0 }
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '52px 0 12px', color: '#1A1208' }
const KAART: React.CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '18px 20px' }
const KNOP: React.CSSProperties = { display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 20px', borderRadius: 12, textDecoration: 'none' }

const VOORBEELD = 'https://www.bylder.com/via/mike-van-giesen/'
const BERICHT = `Hoi! Voor je nieuwe woning: via mijn link krijg je 10% korting op deuren zonder kozijn, een gietvloer of een kast op maat. Je ontwerpt het zelf, gratis, en beslist pas na de offerte. ${VOORBEELD}`
const AANMELDEN = 'mailto:info@bylder.com?subject=' + encodeURIComponent('Eigen Bylder-link voor mijn Klussenier-vestiging')
  + '&body=' + encodeURIComponent('Naam:\nVestiging (plaats):\nTelefoon:\nWebsite van mijn vestiging:\n')

const STAPPEN = [
  { t: 'Je krijgt een eigen link en QR-code', a: 'Per vestiging, op jouw naam: bylder.com/via/jouw-naam/. Achter de link staat een pagina met "aanbevolen door" jou en je vestiging.' },
  { t: 'Je deelt hem met je klant via WhatsApp', a: 'Na een kijkdag, bij een offerte of gewoon als je klant nog deuren, een vloer of een kast zoekt. Op de bouw kan hij ook de QR-code scannen.' },
  { t: 'Je klant ontwerpt en vraagt een offerte aan', a: 'Deuren zonder kozijn in 3D, een gietvloer vanaf een foto, een kast op maat. Gratis, zonder account. Hij krijgt 10% korting op de orderwaarde; de link onthoudt dat voor hem.' },
  { t: 'Wij zien wat er via jouw link gebeurt', a: 'Per klant: aangemeld via jouw link, ontwerp gemaakt, offerte aangevraagd, besteld. Ook als hij pas na de oplevering bestelt.' },
  { t: 'Bij een aankoop krijg je commissie', a: 'Op elke opdracht die doorgaat. Bij Classic Next-deuren verdien je daarnaast aan de montage, want die doe jij.' },
]

const PRODUCTEN = [
  { naam: 'Deuren zonder kozijn', merk: 'Classic Next', plaatst: 'Jij', verdien: 'Commissie en de montage', klant: '10% korting' },
  { naam: 'Kast op maat', merk: 'Timmerbedrijf', plaatst: 'De maker', verdien: 'Commissie', klant: '10% korting' },
  { naam: 'Gietvloer', merk: 'Gietvloerverwerker', plaatst: 'De verwerker', verdien: 'Commissie', klant: '10% korting' },
]

const VRAGEN = [
  { v: 'Hoeveel commissie krijgt een Klussenier?', a: 'De hoogte van de commissie is nog nader te bepalen. We spreken die af in de samenwerking met De Klusseniers, en hij geldt voor elke opdracht die via jouw link doorgaat.' },
  { v: 'Wat als de klant pas maanden later bestelt?', a: 'Hij blijft aan jou gekoppeld. Alles wat hij via Bylder aanvraagt en bestelt, ook na de oplevering, staat op jouw naam. De eerste die een klant aanbrengt, krijgt hem.' },
  { v: 'Moet ik zelf iets inkopen of een offerte maken?', a: 'Nee. De maker maakt de offerte, meet in en levert. Bij Classic Next-deuren plaats jij ze en verdien je aan de montage. Bij een kast op maat en een gietvloer plaatst de maker zelf; jij krijgt de commissie.' },
  { v: 'Weet mijn klant dat ik een vergoeding krijg?', a: 'Ja. Op jouw pagina staat eerlijk dat je met Bylder samenwerkt en een vergoeding krijgt. Je klant betaalt daar niets extra voor; hij krijgt juist 10% korting.' },
  { v: 'Hoe krijg ik mijn eigen link?', a: 'Stuur een mail naar info@bylder.com met je naam, je vestiging en je telefoonnummer. Je krijgt je link en QR-code binnen een paar werkdagen.' },
]

export default function VoorKlusseniers() {
  const merken = aantalMerken()
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'HowTo', name: 'Klanten aanbrengen via Bylder als Klussenier', step: STAPPEN.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.t, text: s.a })) },
  ]
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '44px 20px 72px', color: '#1A1208' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <p style={LABEL}>Voor Klusseniers · klanten aanbrengen</p>
      <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 14px', textWrap: 'balance', maxWidth: '22ch' }}>
        Deel je link via WhatsApp, verdien aan elke aankoop
      </h1>
      <p style={{ ...P, fontSize: 18 }}>
        Je klant zoekt deuren, een vloer of een kast. Jij stuurt hem je eigen Bylder-link. Hij krijgt <strong>10% korting</strong>,
        ontwerpt zelf en vraagt een offerte aan bij de maker. Bestelt hij, dan krijg jij <strong>commissie</strong>. Bij
        Classic Next-deuren doe jij bovendien de montage.
      </p>
      <p style={{ margin: '22px 0 0', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={AANMELDEN} style={KNOP}>Vraag je eigen link aan</a>
        <a href={VOORBEELD} style={{ fontWeight: 700, color: GROEN, fontSize: 15 }}>Bekijk een voorbeeld: de pagina van Klussenier Rosmalen</a>
      </p>

      <h2 style={H2}>Zo werkt het</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, maxWidth: 760 }}>
        {STAPPEN.map((s, i) => (
          <li key={s.t} style={{ ...KAART, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span aria-hidden="true" style={{ flex: '0 0 32px', height: 32, borderRadius: 999, background: GROEN, color: '#F5F0E8', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{i + 1}</span>
            <span><strong style={{ display: 'block', fontSize: 16, marginBottom: 3 }}>{s.t}</strong><span style={{ fontSize: 15, lineHeight: 1.6, color: `${INKT}0.75)` }}>{s.a}</span></span>
          </li>
        ))}
      </ol>

      <h2 style={H2}>Een bericht dat je zo kunt sturen</h2>
      <p style={P}>Zo ziet het eruit in WhatsApp. Met jouw link in plaats van het voorbeeld.</p>
      <div style={{ background: '#E9E2D6', borderRadius: 18, padding: '18px 16px', maxWidth: 460 }}>
        <div style={{ background: '#DCF3D0', borderRadius: '14px 14px 4px 14px', padding: '10px 12px 8px', marginLeft: 'auto', maxWidth: 380, fontSize: 14.5, lineHeight: 1.55, color: '#1A1208', boxShadow: '0 1px 1px rgba(0,0,0,.08)' }}>
          {BERICHT.replace(VOORBEELD, '')}
          <span style={{ color: '#0B6E4F', textDecoration: 'underline', wordBreak: 'break-all' }}>{VOORBEELD.replace('https://', '')}</span>
          <span style={{ display: 'block', textAlign: 'right', fontSize: 11, color: 'rgba(26,18,8,.45)', marginTop: 4 }}>10:42</span>
        </div>
      </div>
      <p style={{ ...P, marginTop: 12 }}>
        <a href={`https://wa.me/?text=${encodeURIComponent(BERICHT)}`} style={{ fontWeight: 700, color: GROEN }} rel="noopener">Open dit bericht in WhatsApp</a>
      </p>

      <h2 style={H2}>Wat je verdient, per product</h2>
      <p style={P}>Commissie krijg je op elke opdracht die via jouw link doorgaat. De hoogte is nog <strong>nader te bepalen</strong>.</p>
      <div style={{ overflowX: 'auto', maxWidth: 820 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 520, background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${INKT}0.12)` }}>
          <caption style={{ textAlign: 'left', fontSize: 13, color: `${INKT}0.6)`, padding: '0 0 8px', captionSide: 'top' }}>Producten die je via je link aanbeveelt</caption>
          <thead>
            <tr style={{ background: '#F5F0E8', textAlign: 'left' }}>
              {['Product', 'Gemaakt door', 'Geplaatst door', 'Jij verdient', 'Je klant krijgt'].map(k => <th key={k} scope="col" style={{ padding: '10px 12px', fontWeight: 800 }}>{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {PRODUCTEN.map(p => (
              <tr key={p.naam} style={{ borderTop: `1px solid ${INKT}0.1)` }}>
                <th scope="row" style={{ padding: '10px 12px', textAlign: 'left' }}>{p.naam}</th>
                <td style={{ padding: '10px 12px' }}>{p.merk}</td>
                <td style={{ padding: '10px 12px' }}>{p.plaatst}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700, color: GROEN }}>{p.verdien}</td>
                <td style={{ padding: '10px 12px' }}>{p.klant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...P, fontSize: 14.5, marginTop: 12 }}>
        Je koopt niets in, maakt geen offerte en draagt geen risico. De maker offreert, meet in en levert. Je klant betaalt de maker.
      </p>

      <h2 style={H2}>Spelregels</h2>
      <ul style={{ ...P, paddingLeft: 20, display: 'grid', gap: 6 }}>
        <li><strong>De eerste die een klant aanbrengt, krijgt hem.</strong> Ook als hij pas na de oplevering bestelt.</li>
        <li><strong>Eerlijk naar je klant.</strong> Op je pagina staat dat je een vergoeding van Bylder krijgt. Zo hoort dat bij een aanbeveling met een financieel belang.</li>
        <li><strong>Alleen klanten die je kent.</strong> Deel je link met mensen voor wie je werkt of gaat werken. Geen massamail naar onbekenden.</li>
      </ul>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 8, maxWidth: 760 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={KAART}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 15.5 }}>{q.v}</summary>
            <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>

      <section aria-labelledby="meedoen" style={{ background: '#1A1208', color: '#F5F0E8', borderRadius: 18, padding: '24px 22px', marginTop: 48 }}>
        <h2 id="meedoen" style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px' }}>Meedoen met je vestiging</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'rgba(245,240,232,.8)', margin: '0 0 16px', maxWidth: '60ch' }}>
          Stuur je naam, je vestiging en je telefoonnummer. Je krijgt binnen een paar werkdagen je eigen link en QR-code.
        </p>
        <a href={AANMELDEN} style={{ ...KNOP, background: '#F5F0E8', color: '#1A1208' }}>Vraag je eigen link aan</a>
      </section>

      <AanbodStrook merken={merken} titel="Dit raad je je klant aan" intro="Zo ziet je klant het aanbod: ontwerpen in 3D, offerte bij de maker, en ledenkorting bij de aangesloten merken." />

      <p style={{ ...P, fontSize: 13.5 }}>
        Meer voor vakbedrijven: <a href="/voor-vakbedrijven/" style={{ color: GROEN, fontWeight: 700 }}>Bylder voor vakbedrijven</a>.
      </p>
    </div>
  )
}
