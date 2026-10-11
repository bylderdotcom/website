'use client'

import { useState } from 'react'
import OfferteFormulier from '../components/OfferteFormulier'

// De offerteaanvraag voor onzichtbare plinten: meters en uitvoering, daarna het gewone
// formulier. Dezelfde route als de deuren (offerte_aanvragen in de app, product
// 'onzichtbare-plint', hoeveelheid in meters).

const INKT = 'rgba(61,46,30,'
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

const UITVOERINGEN = [
  ['inbouw', 'Inbouwplint, vlak met de wand'],
  ['schaduwvoeg', 'Schaduwvoeg met stucstopprofiel'],
  ['opplak', 'Opplakplint op een afgewerkte wand'],
  ['advies', 'Weet ik nog niet, graag advies'],
] as const

export default function PlintAanvraag() {
  const [meter, setMeter] = useState('')
  const [uitvoering, setUitvoering] = useState<string>('advies')
  const m = Number(meter.replace(',', '.'))
  const geldig = Number.isFinite(m) && m > 0 && m < 2000
  const naam = UITVOERINGEN.find(u => u[0] === uitvoering)?.[1] ?? ''
  const spec = `${geldig ? `${Math.round(m * 10) / 10} m` : 'Aantal meters nog onbekend'} onzichtbare plint · ${naam}`
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div>
          <label htmlFor="plint-meter" style={label}>Hoeveel meter, ongeveer?</label>
          <input id="plint-meter" inputMode="decimal" value={meter} onChange={e => setMeter(e.target.value)}
            placeholder="Bijvoorbeeld 60" style={veld} />
        </div>
        <div>
          <label htmlFor="plint-uitvoering" style={label}>Uitvoering</label>
          <select id="plint-uitvoering" value={uitvoering} onChange={e => setUitvoering(e.target.value)} style={veld}>
            {UITVOERINGEN.map(([id, t]) => <option key={id} value={id}>{t}</option>)}
          </select>
        </div>
      </div>
      <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: 0, lineHeight: 1.55 }}>
        Geen idee hoeveel meter? Tel per kamer de lengte van de wanden en trek de deuren eraf. Of zet je
        plattegrond in <a href="/mijn-woning/" style={{ color: '#3D5A3E', fontWeight: 700 }}>Mijn woning</a>; het vakbedrijf meet het
        toch na voordat er iets besteld wordt.
      </p>
      <div>
        <OfferteFormulier
          product="onzichtbare-plint"
          bron="plinten-pagina"
          specificatie={spec}
          configuratie={{ uitvoering }}
          hoeveelheden={{ m_plint: geldig ? Math.round(m * 10) / 10 : null }}
          terugkijkUrl={() => window.location.href}
          mailFallback={`mailto:info@bylder.com?subject=${encodeURIComponent('Offerteaanvraag onzichtbare plinten')}&body=${encodeURIComponent(spec)}`}
          toelichtingHint="Bijv. nieuwbouw of bestaande bouw, welke vloer, wanneer de stukadoor komt"
        />
      </div>
    </div>
  )
}
