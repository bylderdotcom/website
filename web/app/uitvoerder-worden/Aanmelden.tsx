'use client'

import { useRef, useState } from 'react'
import { meetLead } from '../components/meet'

// Aanmelding als uitvoerder (28-10-2026). Gaat naar de app: /api/uitvoerder-aanmelding.

const API = process.env.NEXT_PUBLIC_UITVOERDER_API ?? 'https://app.bylder.com/api/uitvoerder-aanmelding'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const VAKKEN: [string, string][] = [['stucwerk', 'Stucwerk'], ['tegelwerk', 'Tegelwerk'], ['sanitair', 'Sanitair'], ['vloeren', 'Vloeren'],
  ['binnendeuren', 'Binnendeuren'], ['schilderwerk', 'Schilderwerk'], ['kasten', 'Kasten en timmerwerk'], ['anders', 'Anders']]

const veld: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9, border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff' }
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function Aanmelden() {
  const start = useRef(Date.now())
  const [vakken, setVakken] = useState<string[]>([])
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaar, setKlaar] = useState(false)

  if (klaar) return (
    <div role="status" style={{ background: 'rgba(61,90,62,0.08)', border: '1px solid rgba(61,90,62,0.25)', borderRadius: 12, padding: '16px 18px' }}>
      <strong style={{ display: 'block', fontSize: 16, marginBottom: 6 }}>Je aanmelding is binnen</strong>
      <span style={{ fontSize: 14.5, lineHeight: 1.6 }}>We bellen je binnen een week om kennis te maken. Je krijgt ook een bevestiging per mail.</span>
    </div>
  )

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const w = (k: string) => String(f.get(k) ?? '').trim()
    setBezig(true); setFout('')
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        bedrijf: w('bedrijf'), kvk: w('kvk'), naam: w('naam'), email: w('email'), telefoon: w('telefoon'), plaats: w('plaats'),
        mensen: w('mensen'), toelichting: w('toelichting'), vakken, website: w('website'), seconden: Math.round((Date.now() - start.current) / 1000),
      }) })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setFout(j.error || 'Versturen lukte niet.'); setBezig(false); return }
      meetLead('uitvoerder', { vakken: vakken.join(',') })
      setKlaar(true)
    } catch { setFout('Versturen lukte niet. Controleer je verbinding.'); setBezig(false) }
  }

  return (
    <form onSubmit={verstuur} style={{ display: 'grid', gap: 14 }} aria-label="Aanmelden als uitvoerder">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ ...label, marginBottom: 8 }}>Welk werk doe je? *</legend>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))' }}>
          {VAKKEN.map(([k, n]) => {
            const aan = vakken.includes(k)
            return (
              <label key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 14.5, fontWeight: 600, background: '#fff', border: `1.5px solid ${aan ? GROEN : `${INKT}0.14)`}` }}>
                <input type="checkbox" checked={aan} onChange={e => setVakken(v => e.target.checked ? [...v, k] : v.filter(x => x !== k))} style={{ width: 17, height: 17, accentColor: GROEN }} />{n}
              </label>
            )
          })}
        </div>
      </fieldset>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div><label htmlFor="u-bedrijf" style={label}>Bedrijfsnaam *</label><input id="u-bedrijf" name="bedrijf" required autoComplete="organization" style={veld} /></div>
        <div><label htmlFor="u-kvk" style={label}>KvK-nummer</label><input id="u-kvk" name="kvk" inputMode="numeric" style={veld} /></div>
        <div><label htmlFor="u-naam" style={label}>Je naam *</label><input id="u-naam" name="naam" required autoComplete="name" style={veld} /></div>
        <div><label htmlFor="u-tel" style={label}>Telefoon *</label><input id="u-tel" name="telefoon" type="tel" required autoComplete="tel" style={veld} /></div>
        <div><label htmlFor="u-email" style={label}>E-mail *</label><input id="u-email" name="email" type="email" required autoComplete="email" style={veld} /></div>
        <div><label htmlFor="u-plaats" style={label}>Vestigingsplaats</label><input id="u-plaats" name="plaats" autoComplete="address-level2" style={veld} /></div>
        <div><label htmlFor="u-mensen" style={label}>Mensen in dienst</label>
          <select id="u-mensen" name="mensen" defaultValue="" style={veld}><option value="">Kies…</option><option>Alleen ik</option><option>2 tot 5</option><option>6 tot 20</option><option>Meer dan 20</option></select></div>
      </div>
      <div><label htmlFor="u-toel" style={label}>Toelichting</label>
        <textarea id="u-toel" name="toelichting" rows={3} placeholder="Bijvoorbeeld: ervaring met nieuwbouw, wanneer je ruimte hebt in je planning" style={{ ...veld, resize: 'vertical' }} /></div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <div><button type="submit" disabled={bezig} style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0, cursor: bezig ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: bezig ? 0.6 : 1 }}>{bezig ? 'Bezig…' : 'Meld je aan'}</button></div>
      <p style={{ fontSize: 12.5, color: `${INKT}0.6)`, margin: 0 }}>We gebruiken je gegevens alleen om contact met je op te nemen over werk via Bylder. <a href="/privacy/" style={{ color: `${INKT}0.7)` }}>Privacy</a></p>
      {fout && <p role="alert" style={{ fontSize: 13.5, color: '#B85C38', margin: 0 }}>{fout}</p>}
    </form>
  )
}
