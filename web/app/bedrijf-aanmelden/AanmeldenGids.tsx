'use client'

import { useRef, useState } from 'react'
import { meetLead } from '../components/meet'

// Aanmelding voor een vermelding in de gids (9-11-2026). Gaat naar de app: /api/bedrijf-aanmelding.
// Verving de mailto-knop op /voor-vakbedrijven/.

const API = process.env.NEXT_PUBLIC_BEDRIJF_API ?? 'https://app.bylder.com/api/bedrijf-aanmelding'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const VAKKEN: [string, string][] = [['aannemer', 'Aannemer'], ['badkamer', 'Badkamer'], ['dakkapel', 'Dakkapel'], ['elektricien', 'Elektricien'],
  ['gietvloer', 'Gietvloer'], ['loodgieter', 'Loodgieter'], ['schilder', 'Schilder'], ['stukadoor', 'Stukadoor'], ['tegelzetter', 'Tegelzetter'],
  ['vloeren', 'Vloeren'], ['binnendeuren', 'Binnendeuren'], ['kasten', 'Kasten en timmerwerk'], ['keuken', 'Keuken'], ['anders', 'Anders']]

const veld: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9, border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff' }
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function AanmeldenGids() {
  const start = useRef(Date.now())
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaar, setKlaar] = useState(false)

  if (klaar) return (
    <div role="status" style={{ background: 'rgba(61,90,62,0.08)', border: '1px solid rgba(61,90,62,0.25)', borderRadius: 12, padding: '16px 18px' }}>
      <strong style={{ display: 'block', fontSize: 16, marginBottom: 6 }}>Je aanmelding is binnen</strong>
      <span style={{ fontSize: 14.5, lineHeight: 1.6 }}>We kijken je gegevens na en mailen je zodra je profiel online staat. Je krijgt nu een bevestiging per mail.</span>
    </div>
  )

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const w = (k: string) => String(f.get(k) ?? '').trim()
    setBezig(true); setFout('')
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        vak: w('vak'), bedrijf: w('bedrijf'), plaats: w('plaats'), link: w('link'), kvk: w('kvk'), naam: w('naam'), email: w('email'),
        telefoon: w('telefoon'), toelichting: w('toelichting'), uitvoerder: f.get('uitvoerder') === 'ja', website: w('website'),
        seconden: Math.round((Date.now() - start.current) / 1000),
      }) })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setFout(j.error || 'Versturen lukte niet.'); setBezig(false); return }
      meetLead('vermelding', { vak: w('vak') })
      setKlaar(true)
    } catch { setFout('Versturen lukte niet. Controleer je verbinding.'); setBezig(false) }
  }

  return (
    <form onSubmit={verstuur} style={{ display: 'grid', gap: 14 }} aria-label="Bedrijf aanmelden voor de gids">
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div><label htmlFor="g-vak" style={label}>Vak *</label>
          <select id="g-vak" name="vak" required defaultValue="" style={veld}><option value="" disabled>Kies je vak…</option>{VAKKEN.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></div>
        <div><label htmlFor="g-bedrijf" style={label}>Bedrijfsnaam *</label><input id="g-bedrijf" name="bedrijf" required autoComplete="organization" style={veld} /></div>
        <div><label htmlFor="g-plaats" style={label}>Vestigingsplaats *</label><input id="g-plaats" name="plaats" required autoComplete="address-level2" style={veld} /></div>
        <div><label htmlFor="g-kvk" style={label}>KvK-nummer</label><input id="g-kvk" name="kvk" inputMode="numeric" style={veld} /></div>
      </div>
      <div><label htmlFor="g-link" style={label}>Link naar je bedrijf *</label>
        <input id="g-link" name="link" required inputMode="url" placeholder="Je website, Google-profiel of Werkspot-pagina" style={veld} />
        <span style={{ fontSize: 12.5, color: `${INKT}0.6)` }}>Hiermee stellen we je profiel samen: reviews, werkgebied, contactgegevens.</span></div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div><label htmlFor="g-naam" style={label}>Je naam *</label><input id="g-naam" name="naam" required autoComplete="name" style={veld} /></div>
        <div><label htmlFor="g-email" style={label}>E-mail *</label><input id="g-email" name="email" type="email" required autoComplete="email" style={veld} /></div>
        <div><label htmlFor="g-tel" style={label}>Telefoon</label><input id="g-tel" name="telefoon" type="tel" autoComplete="tel" style={veld} /></div>
      </div>
      <div><label htmlFor="g-toel" style={label}>Toelichting</label>
        <textarea id="g-toel" name="toelichting" rows={2} placeholder="Bijvoorbeeld: waar je werkt, waar je in gespecialiseerd bent" style={{ ...veld, resize: 'vertical' }} /></div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: '#fff', border: `1.5px solid ${INKT}0.14)`, cursor: 'pointer', fontSize: 14.5, lineHeight: 1.5 }}>
        <input type="checkbox" name="uitvoerder" value="ja" style={{ width: 17, height: 17, marginTop: 2, accentColor: GROEN, flexShrink: 0 }} />
        <span><strong>Ik wil ook werk uitvoeren voor Bylder.</strong> Bylder neemt de afwerking van nieuwbouwwoningen aan en zoekt vakbedrijven die het werk doen. <a href="/uitvoerder-worden/" style={{ color: GROEN }}>Meer uitleg</a></span>
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <div><button type="submit" disabled={bezig} style={{ background: '#B85C38', color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0, cursor: bezig ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: bezig ? 0.6 : 1 }}>{bezig ? 'Bezig…' : 'Meld mijn bedrijf aan'}</button></div>
      <p style={{ fontSize: 12.5, color: `${INKT}0.6)`, margin: 0 }}>Een vermelding is gratis. We gebruiken je gegevens alleen voor je profiel en om contact met je op te nemen. <a href="/privacy/" style={{ color: `${INKT}0.7)` }}>Privacy</a></p>
      {fout && <p role="alert" style={{ fontSize: 13.5, color: '#B85C38', margin: 0 }}>{fout}</p>}
    </form>
  )
}
