'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { leesRef } from '../components/aanbreng'
import { meet, meetLead } from '../components/meet'
import { WINKEL_API, euroCent } from './prijzen'

// Afrekenen in de winkel (31-10-2026, zonder drempels sinds 1-11-2026).
//   - Nooit een account vragen: na de betaling hoort de bestelling bij het account op dit
//     e-mailadres, en de bevestigingsmail logt meteen in.
//   - "Snel invullen met Google" vult naam en e-mail (bevestigd door Google).
//   - Postcode + huisnummer vullen straat en plaats aan (BAG, via de app).
//   - Wat je invulde onthoudt deze browser voor de volgende keer.
// Staat het product online (alle prijzen bekend), dan betaal je meteen met iDEAL. Anders gaat het
// als bestelling naar ons en bevestigen wij met prijs en betaallink. Bylder is de verkoper.

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
// Dezelfde Google-login als de app. Een Client ID is openbaar; www.bylder.com moet in Google Cloud
// als toegestane herkomst staan, anders laat Google de knop niet werken.
const GOOGLE_CLIENT_ID = '498389793394-c1bpeste3d560sgd533ahhsvavj8oikh.apps.googleusercontent.com'
const ONTHOUD = 'bylder:klant:v1'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

type Klant = { naam: string; email: string; telefoon: string; postcode: string; huisnummer: string; straat: string; plaats: string }
const LEEG: Klant = { naam: '', email: '', telefoon: '', postcode: '', huisnummer: '', straat: '', plaats: '' }

type GoogleId = { accounts: { id: { initialize: (o: object) => void; renderButton: (el: HTMLElement, o: object) => void } } }

/** Naam en e-mail uit het ID-token van Google. Alleen om in te vullen; inloggen gebeurt in de app. */
function uitToken(jwt: string): { naam?: string; email?: string } {
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))))
    return p.email_verified ? { naam: p.name, email: p.email } : {}
  } catch { return {} }
}

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
  const [k, setK] = useState<Klant>(LEEG)
  const [toelichting, setToelichting] = useState('')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaarMelding, setKlaarMelding] = useState(false)
  const [viaGoogle, setViaGoogle] = useState(false)
  const geopend = useRef(0)
  const googleKnop = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try { const o = JSON.parse(localStorage.getItem(ONTHOUD) ?? 'null'); if (o) setK({ ...LEEG, ...o }) } catch { /* privévenster */ }
  }, [])
  const zet = (n: Partial<Klant>) => setK(x => ({ ...x, ...n }))

  // Postcode + huisnummer → straat en plaats.
  useEffect(() => {
    const pc = k.postcode.replace(/\s/g, '').toUpperCase()
    if (!/^\d{4}[A-Z]{2}$/.test(pc) || !/^\d{1,5}/.test(k.huisnummer.trim())) return
    const t = setTimeout(() => {
      fetch(`${APP}/api/adres?postcode=${pc}&huisnummer=${encodeURIComponent(k.huisnummer.trim())}`)
        .then(r => (r.ok ? r.json() : null)).then(d => { if (d?.adres) zet({ straat: d.adres.straat, plaats: d.adres.plaats }) }).catch(() => undefined)
    }, 350)
    return () => clearTimeout(t)
  }, [k.postcode, k.huisnummer])

  function startGoogle() {
    const g = (window as unknown as { google?: GoogleId }).google
    if (!g || !googleKnop.current) return
    g.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (r: { credential: string }) => {
        const u = uitToken(r.credential)
        if (u.email) { setK(x => ({ ...x, email: u.email!, naam: x.naam || u.naam || '' })); setViaGoogle(true); meet('afrekenen_google', { product: p.product }) }
      },
    })
    g.accounts.id.renderButton(googleKnop.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', locale: 'nl', width: 280 })
  }

  if (klaarMelding) {
    return (
      <div role="status" style={{ background: 'rgba(61,90,62,0.07)', border: '1px solid rgba(61,90,62,0.25)', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#1A1208', marginBottom: 6 }}>Je bestelling is binnen</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: `${INKT}0.8)` }}>Binnen één werkdag krijg je van ons een bevestiging met de prijs, de levertijd en een betaallink. Pas als je betaalt is de bestelling definitief. In de mail staat ook een knop naar je bestelling in je Bylder-account.</p>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" disabled={!p.klaar} onClick={() => { setOpen(true); geopend.current = Date.now(); meet('afrekenen_open', { product: p.product }) }} style={{
        background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0,
        cursor: p.klaar ? 'pointer' : 'not-allowed', opacity: p.klaar ? 1 : 0.5, fontFamily: 'inherit',
      }}>{p.online ? `Afrekenen${p.totaalCent != null ? ` · ${euroCent(p.totaalCent)}` : ''}` : 'Bestellen'}</button>
    )
  }

  const adres = `${k.straat} ${k.huisnummer}`.trim()

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const honing = String(new FormData(e.currentTarget).get('website') ?? '')
    setBezig(true); setFout('')
    try { localStorage.setItem(ONTHOUD, JSON.stringify(k)) } catch { /* privévenster */ }
    try {
      if (p.online) {
        const res = await fetch(`${WINKEL_API}/bestel`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: p.product, configuratie: p.configuratie, bron: p.product, ref: leesRef() ?? undefined,
            naam: k.naam, email: k.email, telefoon: k.telefoon, adres, postcode: k.postcode, plaats: k.plaats, toelichting, website: honing }),
        })
        const j = await res.json().catch(() => ({}))
        if (!res.ok || !j.betaalUrl) { setFout(j.error || 'Afrekenen lukte niet.'); setBezig(false); return }
        meetLead('bestelling', { product: p.product, bron: 'winkel', waarde: p.totaalCent != null ? p.totaalCent / 100 : null })
        window.location.href = j.betaalUrl
      } else {
        // Nog geen online prijzen: als bestelling naar het loket in de app; wij bevestigen met een betaallink.
        const res = await fetch(`${APP}/api/offerte-aanvraag`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: p.product, bron: p.product, ref: leesRef() ?? undefined, specificatie: p.specificatie, configuratie: p.configuratie,
            hoeveelheden: p.hoeveelheden, terugkijk_url: window.location.href, naam: k.naam, email: k.email, telefoon: k.telefoon,
            postcode: k.postcode, plaats: k.plaats, planning: '', toelichting: [`Afleveradres: ${adres}, ${k.postcode} ${k.plaats}`, toelichting].filter(Boolean).join('\n'),
            website: honing, seconden: Math.round((Date.now() - geopend.current) / 1000) }),
        })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) { setFout(j.error || 'Versturen lukte niet.'); setBezig(false); return }
        meetLead('bestelling', { product: p.product, bron: 'winkel' })
        setKlaarMelding(true)
      }
    } catch {
      setFout('Dat lukte niet. Controleer je verbinding.'); setBezig(false)
    }
  }

  return (
    <form onSubmit={verstuur} style={{ display: 'grid', gap: 12 }} aria-label={p.online ? 'Afrekenen' : 'Bestellen'}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={startGoogle} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center' }}>
        <div ref={googleKnop} style={{ minHeight: 40 }} />
        <span style={{ fontSize: 13, color: `${INKT}0.6)` }}>{viaGoogle ? 'Naam en e-mail ingevuld met Google.' : 'Vult je naam en e-mail in. Je hoeft geen account te maken.'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div><label htmlFor="ak-email" style={label}>E-mail *</label><input id="ak-email" type="email" required autoComplete="email" value={k.email} onChange={e => zet({ email: e.target.value })} style={veld} /></div>
        <div><label htmlFor="ak-naam" style={label}>Naam *</label><input id="ak-naam" required autoComplete="name" value={k.naam} onChange={e => zet({ naam: e.target.value })} style={veld} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <div><label htmlFor="ak-pc" style={label}>Postcode *</label><input id="ak-pc" required autoComplete="postal-code" pattern="\d{4}\s?[A-Za-z]{2}" value={k.postcode} onChange={e => zet({ postcode: e.target.value })} style={veld} /></div>
        <div><label htmlFor="ak-nr" style={label}>Huisnummer *</label><input id="ak-nr" required inputMode="text" value={k.huisnummer} onChange={e => zet({ huisnummer: e.target.value.slice(0, 12) })} placeholder="bv. 12 of 12A" style={veld} /></div>
        <div><label htmlFor="ak-straat" style={label}>Straat *</label><input id="ak-straat" required autoComplete="address-line1" value={k.straat} onChange={e => zet({ straat: e.target.value })} style={veld} /></div>
        <div><label htmlFor="ak-plaats" style={label}>Plaats *</label><input id="ak-plaats" required autoComplete="address-level2" value={k.plaats} onChange={e => zet({ plaats: e.target.value })} style={veld} /></div>
      </div>
      <details>
        <summary style={{ fontSize: 13.5, color: GROEN, fontWeight: 700, cursor: 'pointer' }}>Telefoon of een opmerking toevoegen</summary>
        <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
          <div><label htmlFor="ak-tel" style={label}>Telefoon</label><input id="ak-tel" type="tel" autoComplete="tel" value={k.telefoon} onChange={e => zet({ telefoon: e.target.value })} style={veld} /></div>
          <div><label htmlFor="ak-toel" style={label}>Opmerking</label><textarea id="ak-toel" rows={2} value={toelichting} onChange={e => setToelichting(e.target.value)} placeholder={p.toelichtingHint} style={{ ...veld, resize: 'vertical' }} /></div>
        </div>
      </details>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      {fout && <p role="alert" style={{ color: '#B3261E', fontSize: 14, margin: 0 }}>{fout}</p>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" disabled={bezig} style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, border: 0, cursor: bezig ? 'wait' : 'pointer', opacity: bezig ? 0.6 : 1, fontFamily: 'inherit' }}>
          {bezig ? 'Even geduld…' : p.online ? `Betalen met iDEAL${p.totaalCent != null ? ` · ${euroCent(p.totaalCent)}` : ''}` : 'Plaats bestelling'}
        </button>
        <span style={{ fontSize: 12.5, color: `${INKT}0.6)` }}>{p.online ? 'Bylder is de verkoper · prijs incl. btw en verzending' : 'Je betaalt pas na onze bevestiging'}</span>
      </div>
      <p style={{ fontSize: 12.5, color: `${INKT}0.6)`, margin: 0 }}>Je bestelling komt in je Bylder-account op dit e-mailadres, zodat je hem kunt volgen. Een wachtwoord is niet nodig.</p>
    </form>
  )
}
