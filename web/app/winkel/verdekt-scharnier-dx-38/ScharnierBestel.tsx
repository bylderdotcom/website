'use client'

import { useState } from 'react'
import MandKnop from '../MandKnop'
import { useWinkelPrijzen, euroCent, productCent } from '../prijzen'
import { SCHARNIER } from '@/lib/winkel'

// Bestellen van het verdekte scharnier (31-10-2026): aantal deuren, kleur, en of de freesmal erbij moet.
// Drie scharnieren per deur; de magnetische afdekplaatjes zitten erbij (Thijs, 9-11-2026).

const INKT = 'rgba(61,46,30,'
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function ScharnierBestel() {
  const [deuren, setDeuren] = useState('1')
  const [kleur, setKleur] = useState(SCHARNIER.kleuren[0].id)
  const [mal, setMal] = useState(false)
  const [hoog, setHoog] = useState(false)
  const prijzen = useWinkelPrijzen()
  const n = Math.max(1, Math.min(200, Math.round(Number(deuren) || 1)))
  const per = hoog ? SCHARNIER.perDeurHoog : SCHARNIER.perDeur
  const stuks = n * per
  const kleurNaam = SCHARNIER.kleuren.find(k => k.id === kleur)?.naam ?? kleur
  const spec = [
    `Bestelling ${SCHARNIER.merk} ${SCHARNIER.naam}`,
    `${stuks} scharnieren (${n} ${n === 1 ? 'deur' : 'deuren'} × ${per}${hoog ? ', hoger dan 2315 mm of kamerhoog' : ''}), ${kleurNaam}`,
    'Inclusief magnetische afdekplaatjes',
    ...(mal ? ['1 × freesmal Basys Pivotica DX'] : []),
  ].join('\n')
  const online = !!prijzen?.online['winkel-scharnier']
  const totaal = productCent('winkel-scharnier', { deuren: n, mal, kamerhoog: hoog }, prijzen)
  const perStuk = prijzen?.prijzen.scharnier.stuk ?? null
  const malCent = prijzen?.prijzen.scharnier.mal ?? null

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div><label htmlFor="sc-n" style={label}>Voor hoeveel deuren?</label>
          <input id="sc-n" inputMode="numeric" value={deuren} onChange={e => setDeuren(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} style={veld} /></div>
        <div><label htmlFor="sc-kleur" style={label}>Kleur</label>
          <select id="sc-kleur" value={kleur} onChange={e => setKleur(e.target.value)} style={veld}>
            {SCHARNIER.kleuren.map(k => <option key={k.id} value={k.id}>{k.naam}</option>)}
          </select></div>
        <div><label htmlFor="sc-hoogte" style={label}>Hoogte van de deur</label>
          <select id="sc-hoogte" value={hoog ? 'hoog' : 'std'} onChange={e => setHoog(e.target.value === 'hoog')} style={veld}>
            <option value="std">Tot 231,5 cm: {SCHARNIER.perDeur} per deur</option>
            <option value="hoog">Hoger of kamerhoog: {SCHARNIER.perDeurHoog} per deur</option>
          </select></div>
      </div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, cursor: 'pointer', lineHeight: 1.5 }}>
        <input type="checkbox" checked={mal} onChange={e => setMal(e.target.checked)} style={{ width: 18, height: 18, marginTop: 3, accentColor: '#3D5A3E', flexShrink: 0 }} />
        <span>Freesmal erbij{malCent != null ? <> ({euroCent(malCent)})</> : null}<br /><span style={{ fontSize: 13.5, color: `${INKT}0.65)` }}>Voor wie zelf freest in deur en kozijn. Een timmerman heeft hem vaak al.</span></span>
      </label>
      <p aria-live="polite" style={{ margin: 0, fontSize: 15, color: '#1A1208', background: '#fff', border: '1.5px solid #3D5A3E', borderRadius: 12, padding: '12px 16px' }}>
        <strong>{stuks} scharnieren</strong> · {kleurNaam} · met afdekplaatjes{mal ? ' · met freesmal' : ''}
        <br /><span style={{ fontSize: 14, color: `${INKT}0.7)` }}>
          {totaal != null
            ? <><strong style={{ fontSize: 17, color: '#1A1208' }}>{euroCent(totaal)}</strong> incl. btw{perStuk != null ? <> ({euroCent(perStuk)} per scharnier)</> : null}, excl. verzending. {online ? 'Je rekent af in je mandje, met iDEAL.' : 'De verzendkosten staan in de bevestiging; je betaalt pas als je akkoord bent.'}</>
            : 'De prijs staat in de bevestiging die je na je bestelling krijgt. Je betaalt pas als je akkoord bent.'}
        </span>
      </p>
      <MandKnop
        product="winkel-scharnier"
        klaar
        titel="Verdekt scharnier Basys DX-38"
        regels={spec.split('\n').slice(1)}
        href="/winkel/verdekt-scharnier-dx-38/"
        configuratie={{ deuren: n, kleur, mal, kamerhoog: hoog }}
        hoeveelheden={{ scharnieren: stuks }}
      />
    </div>
  )
}
