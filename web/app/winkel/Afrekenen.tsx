'use client'

import { useRef, useState } from 'react'
import OfferteFormulier from '../components/OfferteFormulier'
import { leesRef } from '../components/aanbreng'
import { meet, meetLead } from '../components/meet'
import { WINKEL_API, euroCent } from './prijzen'

// Afrekenen in de winkel (31-10-2026). Staat het product online (alle prijzen bekend in de app), dan
// betaalt de klant meteen met iDEAL via Pay.nl. Anders het bestelformulier: wij bevestigen met prijs
// en betaallink. Bylder is in beide gevallen de verkoper.

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

export default function Afrekenen(p: {
  product: 'winkel-plint' | 'winkel-scharnier'
  online: boolean
  totaalCent: number | null
  configuratie: Record<string, unknown>
  specificatie: string
  hoeveelheden: Record<string, number | null>
  klaar: boolean
  toelichtingHint?: string
}) {
  const [open, setOpen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const geopend = useRef(0)

  if (!p.online) {
    return (
      <OfferteFormulier product={p.product} bron={p.product} specificatie={p.specificatie} configuratie={p.configuratie}
        hoeveelheden={p.hoeveelheden} terugkijkUrl={() => window.location.href}
        mailFallback={`mailto:info@bylder.com?subject=${encodeURIComponent('Bestelling')}&body=${encodeURIComponent(p.specificatie)}`}
        toelichtingHint={p.toelichtingHint} />
    )
  }

  if (!open) {
    return (
      <button type="button" disabled={!p.klaar} onClick={() => { setOpen(true); geopend.current = Date.now(); meet('afrekenen_open', { product: p.product }) }} style={{
        background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0,
        cursor: p.klaar ? 'pointer' : 'not-allowed', opacity: p.klaar ? 1 : 0.5, fontFamily: 'inherit',
      }}>Afrekenen{p.totaalCent != null ? ` · ${euroCent(p.totaalCent)}` : ''}</button>
    )
  }

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const w = (k: string) => String(f.get(k) ?? '').trim()
    setBezig(true); setFout('')
    try {
      const res = await fetch(`${WINKEL_API}/bestel`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: p.product, configuratie: p.configuratie, bron: p.product, ref: leesRef() ?? undefined,
          naam: w('naam'), email: w('email'), telefoon: w('telefoon'), adres: w('adres'), postcode: w('postcode'), plaats: w('plaats'),
          toelichting: w('toelichting'), website: w('website'),
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.betaalUrl) { setFout(j.error || 'Afrekenen lukte niet.'); setBezig(false); return }
      meetLead('bestelling', { product: p.product, bron: 'winkel', waarde: p.totaalCent != null ? p.totaalCent / 100 : null })
      window.location.href = j.betaalUrl
    } catch {
      setFout('Afrekenen lukte niet. Controleer je verbinding.'); setBezig(false)
    }
  }

  return (
    <form onSubmit={verstuur} style={{ display: 'grid', gap: 12 }} aria-label="Afrekenen">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div><label htmlFor="ak-naam" style={label}>Naam *</label><input id="ak-naam" name="naam" required autoComplete="name" style={veld} /></div>
        <div><label htmlFor="ak-email" style={label}>E-mail *</label><input id="ak-email" name="email" type="email" required autoComplete="email" style={veld} /></div>
        <div><label htmlFor="ak-tel" style={label}>Telefoon</label><input id="ak-tel" name="telefoon" type="tel" autoComplete="tel" style={veld} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
        <div style={{ gridColumn: 'span 2' }}><label htmlFor="ak-adres" style={label}>Straat en huisnummer *</label><input id="ak-adres" name="adres" required autoComplete="street-address" style={veld} /></div>
        <div><label htmlFor="ak-pc" style={label}>Postcode *</label><input id="ak-pc" name="postcode" required autoComplete="postal-code" pattern="\d{4}\s?[A-Za-z]{2}" style={veld} /></div>
        <div><label htmlFor="ak-plaats" style={label}>Plaats *</label><input id="ak-plaats" name="plaats" required autoComplete="address-level2" style={veld} /></div>
      </div>
      <div><label htmlFor="ak-toel" style={label}>Opmerking</label>
        <textarea id="ak-toel" name="toelichting" rows={2} placeholder={p.toelichtingHint} style={{ ...veld, resize: 'vertical' }} /></div>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      {fout && <p role="alert" style={{ color: '#B3261E', fontSize: 14, margin: 0 }}>{fout}</p>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" disabled={bezig} style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0, cursor: bezig ? 'wait' : 'pointer', opacity: bezig ? 0.6 : 1, fontFamily: 'inherit' }}>
          {bezig ? 'Even geduld…' : `Betalen met iDEAL${p.totaalCent != null ? ` · ${euroCent(p.totaalCent)}` : ''}`}
        </button>
        <span style={{ fontSize: 12.5, color: `${INKT}0.6)` }}>Bylder is de verkoper · prijs incl. btw en verzending</span>
      </div>
    </form>
  )
}
