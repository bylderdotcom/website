'use client'

import { useState } from 'react'
import OfferteFormulier from '../../components/OfferteFormulier'
import { SCHARNIER, euro } from '@/lib/winkel'

// Bestellen van het verdekte scharnier (31-10-2026): aantal deuren of scharnieren, kleur en of de
// magnetische afdekplaatjes erbij moeten. Drie scharnieren per deur.

const INKT = 'rgba(61,46,30,'
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function ScharnierBestel() {
  const [deuren, setDeuren] = useState('1')
  const [kleur, setKleur] = useState(SCHARNIER.kleuren[0].id)
  const [afdek, setAfdek] = useState(true)
  const n = Math.max(1, Math.min(200, Math.round(Number(deuren) || 1)))
  const stuks = n * SCHARNIER.perDeur
  const kleurNaam = SCHARNIER.kleuren.find(k => k.id === kleur)?.naam ?? kleur
  const spec = [
    `Bestelling ${SCHARNIER.merk} ${SCHARNIER.naam}`,
    `${stuks} scharnieren (${n} ${n === 1 ? 'deur' : 'deuren'} × ${SCHARNIER.perDeur}), ${kleurNaam}`,
    afdek ? `${stuks} × magnetische afdekplaatjes` : 'Zonder afdekplaatjes',
  ].join('\n')
  const totaal = SCHARNIER.prijs != null ? stuks * SCHARNIER.prijs + (afdek && SCHARNIER.prijsAfdekplaatjes != null ? stuks * SCHARNIER.prijsAfdekplaatjes : 0) : null

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div><label htmlFor="sc-n" style={label}>Voor hoeveel deuren?</label>
          <input id="sc-n" inputMode="numeric" value={deuren} onChange={e => setDeuren(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} style={veld} /></div>
        <div><label htmlFor="sc-kleur" style={label}>Kleur</label>
          <select id="sc-kleur" value={kleur} onChange={e => setKleur(e.target.value)} style={veld}>
            {SCHARNIER.kleuren.map(k => <option key={k.id} value={k.id}>{k.naam}</option>)}
          </select></div>
      </div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 15, cursor: 'pointer' }}>
        <input type="checkbox" checked={afdek} onChange={e => setAfdek(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#3D5A3E' }} />
        Met magnetische afdekplaatjes (schroeven uit het zicht)
      </label>
      <p aria-live="polite" style={{ margin: 0, fontSize: 15, color: '#1A1208', background: '#fff', border: '1.5px solid #3D5A3E', borderRadius: 12, padding: '12px 16px' }}>
        <strong>{stuks} scharnieren</strong> · {kleurNaam}{afdek ? ' · met afdekplaatjes' : ''}
        <br /><span style={{ fontSize: 14, color: `${INKT}0.7)` }}>
          {totaal != null ? <>Totaal <strong>{euro(totaal)}</strong>, incl. btw.</> : 'De prijs staat in de bevestiging die je na je bestelling krijgt. Je betaalt pas als je akkoord bent.'}
        </span>
      </p>
      <OfferteFormulier
        product="winkel-scharnier"
        bron="winkel-scharnier"
        specificatie={spec}
        configuratie={{ deuren: n, kleur, afdekplaatjes: afdek }}
        hoeveelheden={{ scharnieren: stuks }}
        terugkijkUrl={() => window.location.href}
        mailFallback={`mailto:info@bylder.com?subject=${encodeURIComponent('Bestelling scharnieren DX-38')}&body=${encodeURIComponent(spec)}`}
        toelichtingHint="Bijvoorbeeld de dikte van je deuren, of welk kozijn je hebt"
      />
    </div>
  )
}
