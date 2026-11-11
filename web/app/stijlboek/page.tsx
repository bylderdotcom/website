import type { Metadata } from 'next'
import Maquette, { type MaquetteAccent } from '../components/Maquette'

// /stijlboek/ — de huisstijl van Bylder op één pagina (11-11-2026). Niet voor zoekmachines: een
// werkdocument waar elke nieuwe pagina tegenaan wordt gehouden. De regels staan ook in CLAUDE.md.

export const metadata: Metadata = {
  title: 'Stijlboek | Bylder.com',
  description: 'De huisstijl van Bylder: het vaste beeld, de kleuren, de letters en de regels voor elke pagina.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.bylder.com/stijlboek/' },
}

const INKT = 'rgba(61,46,30,', GROEN = '#3D5A3E'
const BEELDEN: [MaquetteAccent, string][] = [
  ['vloeren', 'Vloeren'], ['binnendeuren', 'Binnendeuren'], ['kasten', 'Kasten op maat'], ['sanitair', 'Sanitair en badkamer'],
  ['tegelwerk', 'Tegelwerk'], ['stucwerk', 'Stucwerk'], ['schilderwerk', 'Schilderwerk'], ['geen', 'Zonder accent'],
]
const KLEUREN: [string, string, string, boolean][] = [
  ['Papier', '#F5F0E8', 'De achtergrond van elke pagina', false],
  ['Inkt', '#1A1208', 'Koppen en tekst', true],
  ['Groen', '#3D5A3E', 'De hoofdactie en het accent in het beeld', true],
  ['Roest', '#B85C38', 'Alleen het kleine label boven een kop', true],
  ['Wit', '#FFFFFF', 'Een vlak dat iets bij elkaar houdt', false],
]
const h2: React.CSSProperties = { fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '72px 0 10px' }
const p: React.CSSProperties = { fontSize: 16.5, lineHeight: 1.7, color: `${INKT}0.8)`, margin: '0 0 22px', maxWidth: '64ch' }
const oog: React.CSSProperties = { fontSize: 13, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B85C38', fontWeight: 700, margin: '0 0 12px' }
const knop: React.CSSProperties = { display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }
const regel: React.CSSProperties = { display: 'grid', gap: 4, padding: '16px 0', borderTop: `1px solid ${INKT}0.14)` }

export default function Stijlboek() {
  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 16px 96px', color: '#1A1208' }}>
      <p style={oog}>Stijlboek</p>
      <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, margin: '0 0 18px', textWrap: 'balance' }}>Zo ziet Bylder eruit.</h1>
      <p style={{ ...p, fontSize: 18.5 }}>Eén beeld dat je onthoudt, rust op de pagina en cijfers als op een bouwtekening. Elke nieuwe pagina houden we hiertegenaan.</p>

      <h2 style={h2}>1. Het beeld: de woning als maquette</h2>
      <p style={p}>Een woning van bovenaf, met witte muren en een donkere rand. Per onderwerp is precies één ding groen: de vloer, de deuren, de badkamer. De rest blijft papier. Dit beeld staat bij elk onderwerp, op deelafbeeldingen, in mails en in offertes.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '28px 20px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))' }}>
        {BEELDEN.map(([a, naam]) => <li key={a}><Maquette accent={a} bijschrift={naam} /></li>)}
      </ul>

      <h2 style={h2}>2. Kleuren</h2>
      <p style={p}>Vijf kleuren. Groen is schaars: op een scherm is het de hoofdactie of het accent in het beeld, verder niets.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
        {KLEUREN.map(([naam, hex, waar, donker]) => (
          <li key={hex} style={{ background: hex, color: donker ? '#F5F0E8' : '#1A1208', border: `1px solid ${INKT}0.14)`, borderRadius: 14, padding: '18px 16px', minHeight: 132, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 17 }}>{naam}</strong>
            <span style={{ fontSize: 13.5, lineHeight: 1.45 }}>{waar}<br /><span className="maat">{hex}</span></span>
          </li>
        ))}
      </ul>

      <h2 style={h2}>3. Letters en cijfers</h2>
      <p style={p}>Koppen kort en vet. Tekst in korte zinnen. Alles wat je kunt meten of betalen staat in de typemachineletter: maten, aantallen, bedragen.</p>
      <div style={regel}><span style={oog}>Label boven een kop</span></div>
      <div style={regel}><span style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Van sleutel tot ingericht huis.</span></div>
      <div style={regel}><span style={{ fontSize: 16.5, lineHeight: 1.7, color: `${INKT}0.8)` }}>Upload je tekening en zie je woning in 3D. Kies je deuren, vloer en kasten op hun plek.</span></div>
      <div style={{ ...regel, borderBottom: `1px solid ${INKT}0.14)` }}><span className="maat" style={{ fontSize: 17, fontWeight: 700 }}>83 m² · 7 deuren · vanaf € 8.809</span></div>

      <h2 style={h2}>4. Eén hoofdactie per scherm</h2>
      <p style={p}>Op elk scherm staat één gevulde groene knop, steeds links onder de tekst. Een tweede stap is een link met een pijl, geen tweede knop.</p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href="/mijn-woning/" style={knop}>Zet je woning in 3D</a>
        <a href="/mijn-woning/?voorbeeld" style={{ color: GROEN, fontWeight: 700 }}>Bekijk een voorbeeld →</a>
      </div>

      <h2 style={h2}>5. Wit in plaats van kaders</h2>
      <p style={p}>Ruimte scheidt, een lijn ordent, een kader is de uitzondering. Een wit vlak met een rand gebruiken we alleen voor iets wat je kunt aanklikken of invullen: een productkaart, een formulier, een prijs.</p>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
        <div>
          <p style={{ ...oog, color: GROEN }}>Zo</p>
          {['Stucwerk', 'Tegelwerk', 'Schilderwerk'].map((t, i) => (
            <div key={t} style={{ ...regel, gridTemplateColumns: '1fr auto', alignItems: 'baseline' }}><strong>{t}</strong><span className="maat" style={{ fontSize: 14.5 }}>{['€ 18 tot € 38 per m²', '€ 60 tot € 130 per m²', '€ 12 tot € 28 per m²'][i]}</span></div>
          ))}
        </div>
        <div>
          <p style={{ ...oog, color: `${INKT}0.55)` }}>Zo niet</p>
          <div style={{ display: 'grid', gap: 8, opacity: 0.6 }}>
            {['Stucwerk', 'Tegelwerk', 'Schilderwerk'].map(t => (
              <div key={t} style={{ background: '#fff', border: `1px solid ${INKT}0.2)`, borderRadius: 14, padding: '12px 14px' }}><div style={{ border: `1px solid ${INKT}0.2)`, borderRadius: 10, padding: '8px 10px' }}><strong>{t}</strong></div></div>
            ))}
          </div>
        </div>
      </div>

      <h2 style={h2}>6. Schrijven</h2>
      <p style={{ ...p, marginBottom: 0 }}>Korte zinnen, concreet, vanuit onze eigen cijfers. Geen holle openingen en geen grote woorden. De knop zegt wat er gebeurt: &ldquo;Vraag een offerte aan&rdquo;, &ldquo;Zet je woning in 3D&rdquo;.</p>
    </main>
  )
}
