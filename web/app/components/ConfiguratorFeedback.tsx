'use client'
import { useRef, useState } from 'react'
import { meet } from './meet'

/**
 * Feedback ín de configurator (verzoek Daniel, 11-11-2026). De strook "Mis je iets?" onderaan
 * elke pagina zegt alleen welke pagina het was. Hier gaat mee in welke stap iemand zat, welke
 * stappen hij liep, de link met zijn keuzes (de deurconfigurator bewaart ze in de url) en het
 * scherm. Zo is een melding te beoordelen zonder na te vragen.
 *
 * Komt in dezelfde lijst als alle andere meldingen (app: feature_requests, segment bezoeker,
 * bron_repo website), en daarmee in de nachtelijke groepering en de goedkeuring in /admin/feedback.
 * Meten: GA4 configurator_feedback (open/verstuurd), zonder de tekst.
 */

const INKT = 'rgba(26,18,8,'
const GROEN = '#3D5A3E'

function context(product: string): string {
  let stappen: string[] = []
  try {
    const c = (window as unknown as { __bylderConfigurator?: { product: string; stappen: string[] } }).__bylderConfigurator
    if (c) stappen = c.stappen
  } catch { /* niets */ }
  const stap = stappen[stappen.length - 1] ?? 'begin'
  const scherm = `${window.innerWidth}x${window.innerHeight}`
  const aanraak = window.matchMedia?.('(pointer: coarse)').matches ? 'aanraak' : 'muis'
  return `configurator:${product} | stap:${stap} | route:${stappen.join('>') || '-'} | scherm:${scherm} ${aanraak}`.slice(0, 500)
}

export default function ConfiguratorFeedback({ product }: { product: string }) {
  const [open, setOpen] = useState(false)
  const [tekst, setTekst] = useState('')
  const [email, setEmail] = useState('')
  const [staat, setStaat] = useState<'invullen' | 'bezig' | 'klaar' | 'fout'>('invullen')
  const [fout, setFout] = useState('')
  const val = useRef<HTMLInputElement>(null)

  const openen = () => { setOpen(true); meet('configurator_feedback', { product, actie: 'open' }) }

  const verstuur = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tekst.trim().length < 3) { setFout('Vertel kort wat er niet lukte.'); return }
    setStaat('bezig'); setFout('')
    try {
      const r = await fetch('/api/feature-request', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tekst: tekst.trim(), email: email.trim() || undefined, url: window.location.href.slice(0, 300),
          context: context(product), website: val.current?.value || '',
          seconden: Math.round(performance.now() / 1000),
        }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setFout(j.error || 'Versturen lukte niet. Probeer het zo nog eens.'); setStaat('fout'); return
      }
      setStaat('klaar'); meet('configurator_feedback', { product, actie: 'verstuurd' })
    } catch { setFout('Versturen lukte niet. Probeer het zo nog eens.'); setStaat('fout') }
  }

  const knop: React.CSSProperties = { font: 'inherit', fontSize: 14, fontWeight: 600, borderRadius: 999, padding: '10px 18px', cursor: 'pointer' }

  return (
    <aside aria-label="Feedback op de configurator" style={{ maxWidth: 720, margin: '20px auto 8px', padding: '0 16px' }}>
      {!open && (
        <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: `${INKT}0.62)` }}>
          Loopt er iets vast of klopt er iets niet?{' '}
          <button type="button" onClick={openen} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontWeight: 700, color: GROEN, textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer' }}>
            Laat het ons weten
          </button>
        </p>
      )}
      {open && staat === 'klaar' && (
        <p role="status" style={{ margin: 0, textAlign: 'center', fontSize: 15, color: GROEN, fontWeight: 600 }}>
          Dank je, je melding is binnen. We lezen ze allemaal.
        </p>
      )}
      {open && staat !== 'klaar' && (
        <form onSubmit={verstuur} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 18, display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600, color: '#1A1208' }}>
            Wat lukte niet, of wat miste je?
            <textarea value={tekst} onChange={e => setTekst(e.target.value)} rows={3} maxLength={2000} required autoFocus
              placeholder="Bijvoorbeeld: ik kan de hoogte van mijn deur niet invullen"
              style={{ font: 'inherit', fontWeight: 400, fontSize: 15, padding: 10, borderRadius: 10, border: `1px solid ${INKT}0.2)`, resize: 'vertical' }} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontSize: 14, fontWeight: 600, color: '#1A1208' }}>
            <span>E-mailadres <span style={{ fontWeight: 400, color: `${INKT}0.6)` }}>(niet verplicht, alleen als je antwoord wilt)</span></span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
              style={{ font: 'inherit', fontWeight: 400, fontSize: 15, padding: 10, borderRadius: 10, border: `1px solid ${INKT}0.2)` }} />
          </label>
          {/* Onzichtbaar voor mensen; ingevuld = bot. */}
          <input ref={val} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: `${INKT}0.6)` }}>We sturen mee in welke stap je was en wat je koos, zodat we het kunnen nazien. Geen andere gegevens.</p>
          {fout && <p role="alert" style={{ margin: 0, fontSize: 14, color: '#A3412A' }}>{fout}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="submit" disabled={staat === 'bezig'} style={{ ...knop, background: GROEN, color: '#F5F0E8', border: `1.5px solid ${GROEN}` }}>
              {staat === 'bezig' ? 'Bezig met versturen' : 'Versturen'}
            </button>
            <button type="button" onClick={() => setOpen(false)} style={{ ...knop, background: 'transparent', color: GROEN, border: `1.5px solid ${GROEN}` }}>Annuleren</button>
          </div>
        </form>
      )}
    </aside>
  )
}
