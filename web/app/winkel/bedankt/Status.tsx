'use client'

import { useEffect, useState } from 'react'
import { WINKEL_API, euroCent } from '../prijzen'
import { S, GROEN, INKT } from '../stijl'

type Bestelling = { nummer: string; status: string; regels: { naam: string; aantal: number; prijs_cent: number }[]; verzend_cent: number; totaal_cent: number }

// Pay.nl stuurt de klant terug voordat de bevestiging (exchange) altijd binnen is. Daarom vragen we
// de status een paar keer op, tot hij op 'betaald' staat of we het opgeven.
export default function Status() {
  const [b, setB] = useState<Bestelling | null>(null)
  const [fout, setFout] = useState(false)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const url = `${WINKEL_API}/status?nr=${encodeURIComponent(q.get('nr') ?? '')}&t=${encodeURIComponent(q.get('t') ?? '')}`
    let pogingen = 0, weg = false
    const vraag = () => fetch(url).then(r => (r.ok ? r.json() : Promise.reject())).then((d: Bestelling) => {
      if (weg) return
      setB(d)
      if (d.status === 'open' && ++pogingen < 8) setTimeout(vraag, 2500)
    }).catch(() => { if (!weg) setFout(true) })
    vraag()
    return () => { weg = true }
  }, [])

  if (fout) return <><h1 style={S.h1}>We vinden deze bestelling niet.</h1><p style={S.p}>Klopt de link uit je mail niet? Mail ons op <a href="mailto:info@bylder.com" style={{ color: GROEN, fontWeight: 700 }}>info@bylder.com</a>, met je bestelnummer.</p></>
  if (!b) return <p style={S.p}>Even je bestelling ophalen…</p>
  const betaald = b.status !== 'open' && b.status !== 'geannuleerd'
  return (
    <>
      <h1 style={S.h1}>{betaald ? 'Dank je wel, je bestelling is betaald.' : b.status === 'geannuleerd' ? 'Deze bestelling is geannuleerd.' : 'We wachten nog op de bevestiging van je betaling.'}</h1>
      <p style={S.lead}>
        {betaald
          ? `Bestelnummer ${b.nummer}. Je krijgt een bevestiging per mail. We plaatsen de bestelling nu bij de leverancier en laten je weten wanneer hij komt.`
          : `Bestelnummer ${b.nummer}. Heb je betaald, dan staat het hier zo goed. Je krijgt dan ook een mail. Niet betaald? Je kunt opnieuw bestellen.`}
      </p>
      <div style={{ ...S.kaart }}>
        {b.regels.map(r => (
          <p key={r.naam} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, margin: '0 0 8px', fontSize: 15 }}>
            <span>{r.aantal} × {r.naam}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{euroCent(r.aantal * r.prijs_cent)}</span>
          </p>
        ))}
        <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0 0 8px', fontSize: 15, color: `${INKT}0.7)` }}><span>Verzending</span><span>{euroCent(b.verzend_cent)}</span></p>
        <p style={{ display: 'flex', justifyContent: 'space-between', margin: 0, paddingTop: 10, borderTop: `1px solid ${INKT}0.1)`, fontSize: 16, fontWeight: 800 }}><span>Totaal, incl. btw</span><span>{euroCent(b.totaal_cent)}</span></p>
      </div>
      <p style={{ ...S.p, marginTop: 24 }}><a href="/winkel/" style={{ color: GROEN, fontWeight: 700 }}>Terug naar de winkel</a></p>
    </>
  )
}
