'use client'

import { useEffect, useState } from 'react'
import MandKnop from '../MandKnop'
import { useWinkelPrijzen, euroCent, productCent } from '../prijzen'
import { DEURSET, setKleur } from '@/lib/winkel'

// Bestellen van een deurset (11-11-2026): aantal, maat, draairichting en slot. Zonder `ral` de gegronde
// standaardset; met `ral` een afgelakte set in die kleur, standaardhoogte of plafondhoog (?hoogte=plafond
// in het adres kiest plafondhoog vooraf, voor de link vanuit Google Shopping). Prijs per set vast.

const INKT = 'rgba(61,46,30,'
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function DeursetBestel({ ral }: { ral?: string }) {
  const kleur = setKleur(ral)
  const [plafond, setPlafond] = useState(false)
  const [plafondCm, setPlafondCm] = useState('260')
  useEffect(() => {
    if (kleur && new URLSearchParams(window.location.search).get('hoogte') === 'plafond') setPlafond(true)
  }, [kleur])
  const [aantal, setAantal] = useState('1')
  const [breedte, setBreedte] = useState(88)
  const [hoogte, setHoogte] = useState('231,5')
  const [draai, setDraai] = useState<'links' | 'rechts'>('links')
  const [slot, setSlot] = useState(DEURSET.sloten[0].id)
  const prijzen = useWinkelPrijzen()
  const n = Math.max(1, Math.min(60, Math.round(Number(aantal) || 1)))
  const online = !!prijzen?.online['winkel-deurset']
  const cfg = { aantal: n, ral: kleur?.ral, plafond: !!kleur && plafond }
  const totaal = productCent('winkel-deurset', cfg, prijzen)
  const perSet = productCent('winkel-deurset', { ...cfg, aantal: 1 }, prijzen)
  const hCm = plafond ? String(Math.max(230, Math.min(270, Math.round(Number(plafondCm) || 260)))) : hoogte
  const uitvoering = kleur ? `afgelakt RAL ${kleur.ral} ${kleur.naam}` : 'gegrond'
  const slotNaam = DEURSET.sloten.find(s => s.id === slot)?.naam.split(' (')[0] ?? slot
  const regels = [
    `${n} × ${plafond && kleur ? 'plafondhoge set' : 'standaardset'} ${uitvoering}, ${breedte} × ${hCm} cm`,
    `Scharnieren ${draai}, ${slotNaam.toLowerCase()}`,
    `Kozijn met bovendorpel, ${plafond && kleur ? 4 : 3} scharnieren DX-38 en magneetslot; zonder kruk`,
  ]

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <div><label htmlFor="ds-n" style={label}>Aantal deuren</label>
          <input id="ds-n" inputMode="numeric" value={aantal} onChange={e => setAantal(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} style={veld} /></div>
        <div><label htmlFor="ds-b" style={label}>Breedte deurblad</label>
          <select id="ds-b" value={breedte} onChange={e => setBreedte(Number(e.target.value))} style={veld}>
            {DEURSET.breedtes.map(b => <option key={b} value={b}>{b} cm</option>)}
          </select></div>
        {kleur && (
          <div style={{ gridColumn: '1 / -1' }}><label htmlFor="ds-ph" style={label}>Hoogte</label>
            <select id="ds-ph" value={plafond ? 'plafond' : 'std'} onChange={e => setPlafond(e.target.value === 'plafond')} style={veld}>
              <option value="std">Standaardhoogte, tot 231,5 cm</option>
              <option value="plafond">Plafondhoog, tot 270 cm</option>
            </select></div>
        )}
        {plafond && kleur ? (
          <div><label htmlFor="ds-pc" style={label}>Hoogte tot het plafond (cm)</label>
            <input id="ds-pc" inputMode="numeric" value={plafondCm} onChange={e => setPlafondCm(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} style={veld} /></div>
        ) : (
          <div><label htmlFor="ds-h" style={label}>Hoogte deurblad</label>
            <select id="ds-h" value={hoogte} onChange={e => setHoogte(e.target.value)} style={veld}>
              {DEURSET.hoogtes.map(h => <option key={h} value={h}>{h} cm</option>)}
            </select></div>
        )}
        <div><label htmlFor="ds-d" style={label}>Scharnieren</label>
          <select id="ds-d" value={draai} onChange={e => setDraai(e.target.value === 'rechts' ? 'rechts' : 'links')} style={veld}>
            <option value="links">Links</option><option value="rechts">Rechts</option>
          </select></div>
        <div style={{ gridColumn: '1 / -1' }}><label htmlFor="ds-s" style={label}>Slot (zit in de set)</label>
          <select id="ds-s" value={slot} onChange={e => setSlot(e.target.value)} style={veld}>
            {DEURSET.sloten.map(s => <option key={s.id} value={s.id}>{s.naam}</option>)}
          </select></div>
      </div>
      <p aria-live="polite" style={{ margin: 0, fontSize: 15, color: '#1A1208', background: '#fff', border: '1.5px solid #3D5A3E', borderRadius: 12, padding: '12px 16px' }}>
        <strong>{n} {n === 1 ? 'deur' : 'deuren'}</strong> · {kleur ? `RAL ${kleur.ral} · ` : ''}{breedte} × {hCm} cm · scharnieren {draai}
        <br /><span style={{ fontSize: 14, color: `${INKT}0.7)` }}>
          {totaal != null
            ? <><strong style={{ fontSize: 17, color: '#1A1208' }}>{euroCent(totaal)}</strong> incl. btw{n > 1 && perSet != null ? <> ({euroCent(perSet)} per deur)</> : null}, excl. montage en levering. {online ? 'Je rekent af in je mandje, met iDEAL.' : 'De leverkosten staan in onze bevestiging; je betaalt pas als je akkoord bent.'}</>
            : 'De prijs staat in de bevestiging die je na je bestelling krijgt. Je betaalt pas als je akkoord bent.'}
        </span>
      </p>
      <MandKnop
        product="winkel-deurset"
        klaar
        titel={kleur ? `Kozijnloze deur ${kleur.naam}${plafond ? ', plafondhoog' : ''}` : 'Kozijnloze deur, standaardset gegrond'}
        regels={regels}
        href={kleur ? `/winkel/${DEURSET.slug}/ral-${kleur.ral}/` : `/winkel/${DEURSET.slug}/`}
        configuratie={{ aantal: n, breedte, hoogte: hCm, draai, slot, ...(kleur ? { ral: kleur.ral, plafond } : {}) }}
        hoeveelheden={{ deuren: n }}
      />
    </div>
  )
}
