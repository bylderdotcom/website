// Verwijzing naar de gietvloerontwerper, in dezelfde vorm als KastCTA: tekst met één
// knop, en rechts een paar kleurvlakken uit de kaart. Geen afbeelding en geen script:
// deze blok staat op honderden plaatspagina's, dus laadtijd telt.

import { KLEUREN } from './gietvloer/gegevens'

const ONTWERPER = '/gietvloer/ontwerpen/'
const STAALTJES = ['kalkwit', 'zandbeige', 'betongrijs', 'taupe', 'grafiet', 'antraciet']

export default function GietvloerCTA({ aanleiding, marge = '44px 0' }: { aanleiding: string; marge?: string }) {
  const kleuren = STAALTJES.map(id => KLEUREN.find(k => k.id === id)!).filter(Boolean)
  return (
    <aside aria-label="Gietvloerontwerper" style={{
      background: '#1A1208', borderRadius: 20, margin: marge, overflow: 'hidden', display: 'grid', alignItems: 'center',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
    }}>
      <div style={{ padding: '28px 28px 26px' }}>
        <div style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10 }}>Gietvloer · ontwerpen</div>
        <h2 style={{ fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px', letterSpacing: '-0.022em', textWrap: 'balance' }}>Zie je gietvloer in je eigen woning, vanaf één foto</h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 16px', maxWidth: '56ch' }}>{aanleiding}</p>
        <a href={ONTWERPER} style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }}>Ontwerp je gietvloer &rarr;</a>
        <ul aria-label="Wat je krijgt" style={{ listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Kleur uit je eigen foto', 'Per ruimte en verdieping', 'PU, epoxy of microcement', 'Tot 3 stalen gratis'].map(t => (
            <li key={t} style={{ fontSize: 13, fontWeight: 700, color: '#F5F0E8', border: '1px solid rgba(245,240,232,0.25)', borderRadius: 999, padding: '5px 12px' }}>{t}</li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: 28 }}>
        {kleuren.map(k => (
          <div key={k.id} style={{ aspectRatio: '4 / 3', borderRadius: 12, background: `radial-gradient(120% 90% at 20% 15%, rgba(255,255,255,.22), transparent 55%), ${k.hex}`, display: 'flex', alignItems: 'flex-end', padding: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: k.id === 'grafiet' || k.id === 'antraciet' ? '#F5F0E8' : '#1A1208' }}>{k.naam}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
