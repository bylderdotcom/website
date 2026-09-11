'use client'

import { useRef, useState } from 'react'

// Offerteformulier onder een configurator. Stuurt de aanvraag naar het loket in
// de app (offerte_aanvragen), waar Daniel hem ziet en aan een partner geeft.
//
// Tot 11 september 2026 was dit een mailto-link. Wie geen mailprogramma had
// ingesteld, drukte op een knop die niets deed, en wat wél aankwam stond los in
// een mailbox. De mailto blijft bestaan, maar alleen als uitweg als het
// versturen mislukt.
//
// Herbruikbaar: de deur is de eerste, gietvloer en plint volgen.

const API = process.env.NEXT_PUBLIC_OFFERTE_API ?? 'https://app.bylder.com/api/offerte-aanvraag'

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

const veld: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9,
  border: `1.5px solid ${INKT}0.16)`, fontSize: 15, fontFamily: 'inherit', color: '#1A1208', background: '#fff',
}
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: `${INKT}0.75)`, margin: '0 0 5px' }

const PLANNING = ['Zo snel mogelijk', 'Binnen 3 maanden', 'Over 3 tot 6 maanden', 'Later dan 6 maanden', 'Weet ik nog niet']

export default function OfferteFormulier(p: {
  product: 'kozijnloze-deur' | 'gietvloer' | 'onzichtbare-plint' | 'combinatie'
  bron: string
  specificatie: string
  configuratie: unknown
  hoeveelheden: Record<string, number | null>
  terugkijkUrl: () => string
  mailFallback: string
  toelichtingHint?: string
}) {
  const [open, setOpen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')
  const [klaar, setKlaar] = useState(false)
  const geopend = useRef(0)

  if (klaar) {
    return (
      <div role="status" style={{ background: 'rgba(61,90,62,0.07)', border: `1px solid rgba(61,90,62,0.25)`, borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#1A1208', marginBottom: 6 }}>Je aanvraag is binnen</div>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, color: `${INKT}0.8)` }}>
          Je krijgt een bevestiging per mail. We zoeken een vakbedrijf dat dit bij jou kan maken en nemen daarna contact met je op.
          De offerte komt van dat vakbedrijf. Ga je akkoord, dan sluit je de opdracht met hen, niet met Bylder.
        </p>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => { setOpen(true); geopend.current = Date.now() }} style={{
        background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14.5, padding: '12px 20px',
        borderRadius: 11, border: 0, cursor: 'pointer', fontFamily: 'inherit',
      }}>Vraag een offerte aan</button>
    )
  }

  async function verstuur(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const waarde = (k: string) => String(f.get(k) ?? '').trim()
    setBezig(true); setFout('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: p.product, bron: p.bron,
          specificatie: p.specificatie, configuratie: p.configuratie, hoeveelheden: p.hoeveelheden,
          terugkijk_url: p.terugkijkUrl(),
          naam: waarde('naam'), email: waarde('email'), telefoon: waarde('telefoon'),
          postcode: waarde('postcode'), plaats: waarde('plaats'),
          planning: waarde('planning'), toelichting: waarde('toelichting'),
          toestemming_delen: f.get('toestemming') === 'on',
          website: waarde('website'),
          seconden: Math.round((Date.now() - geopend.current) / 1000),
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setFout(j.error || 'Versturen lukte niet.'); setBezig(false); return }
      setKlaar(true)
    } catch {
      setFout('Versturen lukte niet. Controleer je verbinding.')
      setBezig(false)
    }
  }

  return (
    <form onSubmit={verstuur} style={{ display: 'grid', gap: 12, width: '100%' }} aria-label="Offerte aanvragen">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div><label htmlFor="of-naam" style={label}>Naam *</label><input id="of-naam" name="naam" required autoComplete="name" style={veld} /></div>
        <div><label htmlFor="of-email" style={label}>E-mail *</label><input id="of-email" name="email" type="email" required autoComplete="email" style={veld} /></div>
        <div><label htmlFor="of-tel" style={label}>Telefoon</label><input id="of-tel" name="telefoon" type="tel" autoComplete="tel" style={veld} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 8 }}>
          <div><label htmlFor="of-pc" style={label}>Postcode</label><input id="of-pc" name="postcode" autoComplete="postal-code" style={veld} /></div>
          <div><label htmlFor="of-plaats" style={label}>Plaats *</label><input id="of-plaats" name="plaats" required autoComplete="address-level2" style={veld} /></div>
        </div>
      </div>
      <div>
        <label htmlFor="of-planning" style={label}>Wanneer moet het er zijn?</label>
        <select id="of-planning" name="planning" defaultValue="" style={veld}>
          <option value="">Kies…</option>
          {PLANNING.map(x => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="of-toel" style={label}>Toelichting</label>
        <textarea id="of-toel" name="toelichting" rows={3} placeholder={p.toelichtingHint} style={{ ...veld, resize: 'vertical' }} />
      </div>
      {/* Honeypot: onzichtbaar voor mensen, bots vullen hem in. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.55, color: `${INKT}0.8)`, cursor: 'pointer' }}>
        <input type="checkbox" name="toestemming" required style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
        <span>
          Bylder mag mijn aanvraag en contactgegevens delen met het vakbedrijf dat de offerte maakt. Bylder bemiddelt en krijgt daarvoor een vergoeding van dat bedrijf.{' '}
          <a href="/privacy/" style={{ color: ROEST }}>Privacy</a>
        </span>
      </label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" disabled={bezig} style={{
          background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15, padding: '12px 22px',
          borderRadius: 11, border: 0, cursor: bezig ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: bezig ? 0.6 : 1,
        }}>{bezig ? 'Bezig met versturen…' : 'Verstuur aanvraag'}</button>
        <span style={{ fontSize: 12.5, color: `${INKT}0.55)` }}>Gratis en vrijblijvend</span>
      </div>
      {fout && (
        <p role="alert" style={{ fontSize: 13.5, color: ROEST, margin: 0, lineHeight: 1.55 }}>
          {fout} Je kunt je aanvraag ook <a href={p.mailFallback} style={{ color: ROEST, fontWeight: 700 }}>per mail sturen</a>.
        </p>
      )}
    </form>
  )
}
