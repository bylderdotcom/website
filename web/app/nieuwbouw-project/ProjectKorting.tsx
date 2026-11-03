'use client'

import { useEffect, useState } from 'react'
import { TREDEN, TELLER_VANAF, kortingBij, volgendeTrede, deelUrl } from '../../lib/projectkorting'
import { meet } from '../components/meet'

// Projectkorting op een projectpagina (3-11-2026): de treden, hoeveel woningen al meedoen (vanaf 3),
// en een link om met de buren te delen. De teller komt uit de app (/api/projectkorting).

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
const GROEN = '#3D5A3E', INKT = 'rgba(61,46,30,'

export default function ProjectKorting({ slug, project, offerte }: { slug: string; project: string; offerte: string }) {
  const [woningen, setWoningen] = useState(0)
  const [gekopieerd, setGekopieerd] = useState(false)
  // Pas na het laden weten we of de telefoon kan delen; anders verschilt de server-HTML.
  const [kanDelen, setKanDelen] = useState(false)
  useEffect(() => { setKanDelen('share' in navigator) }, [])
  useEffect(() => {
    fetch(`${APP}/api/projectkorting?project=${encodeURIComponent(slug)}`)
      .then(r => (r.ok ? r.json() : null)).then(d => { if (d && typeof d.woningen === 'number') setWoningen(d.woningen) })
      .catch(() => undefined)
  }, [slug])

  const zichtbaar = woningen >= TELLER_VANAF ? woningen : 0
  const nu = kortingBij(zichtbaar)
  const volgende = volgendeTrede(zichtbaar)
  const url = deelUrl(slug)
  const bericht = `Wij laten onze woning in ${project} afwerken via Bylder. Doe je mee? Hoe meer buren meedoen, hoe meer korting voor iedereen, tot 10%. ${url}`

  const deel = async () => {
    meet('projectkorting_delen', { methode: 'delen', project: slug })
    try { await navigator.share({ title: `Projectkorting ${project}`, text: bericht }) } catch { /* geannuleerd */ }
  }
  const kopieer = async () => {
    meet('projectkorting_delen', { methode: 'kopie', project: slug })
    try { await navigator.clipboard.writeText(url); setGekopieerd(true); setTimeout(() => setGekopieerd(false), 2500) } catch { /* geen klembord */ }
  }

  return (
    <section id="projectkorting" aria-labelledby="pk-kop" style={{ scrollMarginTop: 90, margin: '28px 0 0', background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 20, padding: 'clamp(20px,4vw,30px)' }}>
      <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: GROEN, margin: '0 0 8px' }}>Projectkorting</p>
      <h2 id="pk-kop" style={{ fontSize: 'clamp(1.3rem,2.4vw,1.7rem)', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', margin: '0 0 10px', color: '#1A1208' }}>
        Hoe meer buren in {project} meedoen, hoe goedkoper de afwerking voor iedereen
      </h2>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: `${INKT}0.8)`, margin: '0 0 16px', maxWidth: '64ch' }}>
        Laten meer woningen in {project} de afwerking door Bylder doen, dan krijgt iedereen korting op zijn offerte. Ook wie
        al eerder tekende: de korting gaat mee omhoog tot je werk begint.
      </p>
      <ol aria-label="Treden van de projectkorting" style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
        {TREDEN.map(t => {
          const bereikt = nu >= t.procent
          return (
            <li key={t.woningen} style={{ borderRadius: 12, padding: '12px clamp(10px,2.5vw,14px)', border: `1.5px solid ${bereikt ? GROEN : INKT + '0.14)'}`, background: bereikt ? '#EEF3EC' : '#FAF7F1' }}>
              <div style={{ fontSize: 'clamp(20px,5vw,24px)', fontWeight: 800, color: GROEN }}>{t.procent}%</div>
              <div style={{ fontSize: 13.5, color: `${INKT}0.75)` }}>vanaf {t.woningen} woningen</div>
            </li>
          )
        })}
      </ol>
      <p role="status" style={{ fontSize: 15, fontWeight: 700, color: '#1A1208', margin: '0 0 14px' }}>
        {zichtbaar
          ? `${zichtbaar} woningen in ${project} doen al mee${nu ? `: iedereen krijgt nu ${nu}%` : ''}.${volgende ? ` Nog ${volgende.woningen - zichtbaar}, dan wordt het ${volgende.procent}%.` : ''}`
          : `Doe je mee met 1 buur, dan krijgen jullie allebei ${TREDEN[0].procent}%.`}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <a href={offerte} data-meet="projectkorting" style={{ background: GROEN, color: '#F5F0E8', borderRadius: 11, padding: '13px 20px', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>Vraag een offerte aan</a>
        <a href={`https://wa.me/?text=${encodeURIComponent(bericht)}`} target="_blank" rel="noopener" onClick={() => meet('projectkorting_delen', { methode: 'whatsapp', project: slug })}
          style={{ border: `1.5px solid ${GROEN}`, color: GROEN, borderRadius: 11, padding: '12px 18px', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Deel met je buren via WhatsApp</a>
        {kanDelen
          ? <button type="button" onClick={deel} style={{ border: `1.5px solid ${INKT}0.2)`, background: '#fff', color: '#1A1208', borderRadius: 11, padding: '12px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Delen</button>
          : <button type="button" onClick={kopieer} style={{ border: `1.5px solid ${INKT}0.2)`, background: '#fff', color: '#1A1208', borderRadius: 11, padding: '12px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>{gekopieerd ? 'Link gekopieerd' : 'Kopieer de link'}</button>}
      </div>
      <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '12px 0 0' }}>
        Telt mee: getekende opdrachten voor de afwerking in dit project. <a href="/projectkorting/" style={{ color: GROEN, fontWeight: 700 }}>Zo werkt de projectkorting</a>
      </p>
    </section>
  )
}
