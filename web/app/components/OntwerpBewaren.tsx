'use client'

import { useRef, useState } from 'react'
import { herkomst } from './herkomst'

/**
 * "Stuur mij dit ontwerp" — onder een configurator.
 *
 * WAAROM
 * De configurator ving alleen wie een offerte aanvroeg. Wie iets samenstelde
 * en wegliep — op de beurs, of thuis omdat het eten klaar was — liet niets
 * achter. Dit vraagt één ding, een e-mailadres, en mailt hem zijn ontwerp
 * terug. Voor hem: zijn deur is niet weg. Voor Bylder: de lijst voor de
 * mailing na de beurs bestaat.
 *
 * Bewust géén naam, plaats of telefoon. Dat is de offerte-aanvraag ernaast;
 * dit is de kleinere stap ervoor, en die moet klein blijven.
 */

const API = process.env.NEXT_PUBLIC_ONTWERP_API ?? 'https://app.bylder.com/api/ontwerp-bewaren'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export default function OntwerpBewaren(p: {
  product: 'kozijnloze-deur' | 'gietvloer' | 'onzichtbare-plint' | 'combinatie'
  bron: string
  specificatie: string
  configuratie: unknown
  hoeveelheden: Record<string, number | null>
  urlFn: () => string
  knopStijl: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaar, setKlaar] = useState<string | null>(null)
  const geopend = useRef(0)

  if (klaar) {
    return (
      <div role="status" style={{ flexBasis: '100%', background: 'rgba(61,90,62,0.07)', border: '1px solid rgba(61,90,62,0.25)', borderRadius: 10, padding: '11px 14px', fontSize: 13.5, lineHeight: 1.55, color: `${INKT}0.85)` }}>
        <strong style={{ color: '#1A1208' }}>Verstuurd naar {klaar}.</strong> De link in die mail opent dit ontwerp precies zoals het nu staat.
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" style={p.knopStijl} onClick={() => { setOpen(true); geopend.current = Date.now() }}>
        Stuur mij dit ontwerp
      </button>
    )
  }

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') ?? '').trim()
    setBezig(true); setFout('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          product: p.product,
          // Kwam iemand via een campagne-adres (de beurs), dan is dát de herkomst.
          bron: herkomst() || p.bron,
          url: p.urlFn(),
          configuratie: p.configuratie,
          hoeveelheden: p.hoeveelheden,
          specificatie: p.specificatie,
          website: String(f.get('website') ?? ''),
          seconden: Math.round((Date.now() - geopend.current) / 1000),
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setFout(j.error || 'Versturen lukte niet.'); setBezig(false); return }
      setKlaar(email)
    } catch {
      setFout('Versturen lukte niet. Controleer je verbinding.')
      setBezig(false)
    }
  }

  return (
    <form onSubmit={verstuur} style={{ flexBasis: '100%', display: 'grid', gap: 8, background: '#fff', border: `1.5px solid ${INKT}0.14)`, borderRadius: 10, padding: '12px 14px' }}>
      <label htmlFor="ontwerp-email" style={{ fontSize: 13, fontWeight: 700, color: `${INKT}0.75)` }}>
        Waar mogen we dit ontwerp heen mailen?
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          id="ontwerp-email" name="email" type="email" required autoComplete="email" inputMode="email"
          placeholder="je@voorbeeld.nl" autoFocus
          style={{ flex: '1 1 200px', padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208' }}
        />
        {/* Honeypot: mensen zien dit veld niet, bots vullen het in. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
        <button type="submit" disabled={bezig} style={{
          background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14, padding: '10px 16px',
          borderRadius: 9, border: 0, cursor: bezig ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: bezig ? 0.7 : 1,
        }}>{bezig ? 'Bezig…' : 'Versturen'}</button>
        <button type="button" onClick={() => setOpen(false)} style={{ ...p.knopStijl, padding: '10px 12px' }}>Toch niet</button>
      </div>
      {fout && <p role="alert" style={{ margin: 0, fontSize: 13, color: '#B85C38', fontWeight: 600 }}>{fout}</p>}
      <p style={{ margin: 0, fontSize: 12, color: `${INKT}0.55)`, lineHeight: 1.5 }}>
        Je krijgt één mail met de link naar dit ontwerp. Geen nieuwsbrief, geen account nodig.
      </p>
    </form>
  )
}
