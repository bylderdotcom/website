'use client'

import { useEffect, useState } from 'react'
import { meet } from '../components/meet'

// "Volg je project" (besluit Daniel, 3-11-2026). Een koper is 1 tot 2 jaar met zijn nieuwbouw bezig;
// hiermee komt hij terug als er iets verandert: de oplevering, de bouw (Kadaster), de projectkorting
// of wat zijn buren kozen. Dubbele bevestiging per mail (app: /api/project-volgen); afmelden in elke mail.

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
const GROEN = '#3D5A3E', INKT = 'rgba(61,46,30,'

export default function VolgProject({ slug, project }: { slug: string; project: string }) {
  const [email, setEmail] = useState('')
  const [staat, setStaat] = useState<'' | 'bezig' | 'klaar' | 'fout' | 'gevolgd'>('')
  // Terug uit de bevestigingsmail (?gevolgd=1).
  useEffect(() => { if (new URLSearchParams(window.location.search).has('gevolgd')) setStaat('gevolgd') }, [])
  async function verstuur(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStaat('fout'); return }
    setStaat('bezig')
    try {
      const r = await fetch(`${APP}/api/project-volgen`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, project: slug }) })
      if (!r.ok) throw new Error()
      meet('project_volgen', { project: slug })
      setStaat('klaar')
    } catch { setStaat('fout') }
  }
  return (
    <section aria-labelledby="volg-kop" style={{ margin: '14px 0 28px', background: '#EDE6D8', borderRadius: 18, padding: 'clamp(18px,3.5vw,26px)' }}>
      <h2 id="volg-kop" style={{ fontSize: 'clamp(1.15rem,2vw,1.35rem)', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>Volg {project}</h2>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: `${INKT}0.8)`, margin: '0 0 14px', maxWidth: '64ch' }}>
        Je krijgt een mail als er iets verandert: de verwachte oplevering, de bouw volgens het Kadaster, de projectkorting of
        wat je buren kozen. Hooguit één mail per week, en afmelden kan in elke mail.
      </p>
      {staat === 'gevolgd' ? (
        <p role="status" style={{ fontSize: 15, fontWeight: 700, color: GROEN, margin: 0 }}>Je volgt dit project. We mailen je zodra er iets verandert.</p>
      ) : staat === 'klaar' ? (
        <p role="status" style={{ fontSize: 15, fontWeight: 700, color: GROEN, margin: 0 }}>Bijna klaar: klik op de link in de mail die we je net stuurden.</p>
      ) : (
        <form onSubmit={verstuur} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <label htmlFor="volg-mail" style={{ position: 'absolute', left: -9999 }}>Je e-mailadres</label>
          <input id="volg-mail" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="je e-mailadres"
            style={{ flex: '1 1 220px', padding: '12px 14px', fontSize: 15.5, border: `1.5px solid ${INKT}0.2)`, borderRadius: 11, background: '#fff', fontFamily: 'inherit' }} />
          <button type="submit" disabled={staat === 'bezig'} style={{ flex: '0 0 auto', background: GROEN, color: '#F5F0E8', border: 0, borderRadius: 11, padding: '12px 20px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', opacity: staat === 'bezig' ? 0.6 : 1 }}>
            Volg dit project
          </button>
          {staat === 'fout' && <p role="alert" style={{ flexBasis: '100%', margin: 0, fontSize: 14, color: '#B85C38', fontWeight: 700 }}>Dat lukte niet. Klopt je e-mailadres?</p>}
        </form>
      )}
    </section>
  )
}
