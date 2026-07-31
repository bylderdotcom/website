'use client'

import { useState, useEffect, useRef } from 'react'

// Gedeelde site-navigatie — ÉÉN bron voor elke pagina.
// Journey-nav (2026-07-11) + Zakelijk-dropdown (2026-07-12, zie
// _audits/deelnemer-structuur-plan.md): het zakelijke item heet 'Zakelijk',
// linkt naar de /zakelijk/-landing en klapt op desktop uit naar
// Deelnemer worden + Commercieel vastgoed. Mobiel: sectiekopje 'Zakelijk'.

const JOURNEY = [
  { href: '/nieuwbouw-koper/', label: 'Nieuwbouw kopen' },
  { href: '/verbouwen/', label: 'Verbouwen' },
  { href: '/interieur-woning/', label: 'Inrichten' },
  { href: '/woning-verduurzamen/', label: 'Verduurzamen' },
  { href: '/kennisbank/', label: 'Kennisbank' },
  { href: '/nieuwbouw-tools/', label: 'Tools' },
]

const ZAKELIJK = [
  { href: '/deelnemer-worden/', title: 'Deelnemer worden', sub: 'Bereik kopers op het juiste koopmoment' },
  { href: '/deelnemer-worden/commercieel-vastgoed/', title: 'Commercieel vastgoed', sub: 'Offerte-check, m²-benchmarks & fit-out' },
]

const LINK: React.CSSProperties = { fontSize: '0.875rem', color: 'rgba(61,46,30,0.72)', textDecoration: 'none', whiteSpace: 'nowrap' }
const KOPJE: React.CSSProperties = { fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(61,46,30,0.72)', fontWeight: 700, padding: '14px 0 4px' }

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [zakelijkOpen, setZakelijkOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1020px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!zakelijkOpen) return
    const onClick = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setZakelijkOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [zakelijkOpen])

  const logo = (
    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: '#3D5A3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8', fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>B.</span>
      <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#1A1208' }}>Bylder<span style={{ color: '#3D5A3E' }}>.com</span></span>
    </a>
  )

  const startGratis = (
    <a href="https://app.bylder.com/registreer" style={{ background: '#3D5A3E', color: '#F5F0E8', fontSize: '0.875rem', fontWeight: 700, padding: '9px 18px', borderRadius: 9, textDecoration: 'none', whiteSpace: 'nowrap' }}>Start gratis →</a>
  )

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(61,46,30,0.07)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {logo}

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {JOURNEY.map(j => <a key={j.href} href={j.href} style={LINK}>{j.label}</a>)}
            <div ref={wrapRef} style={{ position: 'relative' }}>
              <button onClick={() => setZakelijkOpen(o => !o)} style={{ ...LINK, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                Zakelijk <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {zakelijkOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#fff', border: '1px solid rgba(61,46,30,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(61,46,30,0.12)', padding: 8, minWidth: 280, zIndex: 200 }}>
                  {ZAKELIJK.map(z => (
                    <a key={z.href} href={z.href} style={{ display: 'block', padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>
                      <strong style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{z.title}</strong>
                      <span style={{ fontSize: 11, color: 'rgba(61,46,30,0.72)' }}>{z.sub}</span>
                    </a>
                  ))}
                  <a href="/zakelijk/" style={{ display: 'block', padding: '10px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 12, fontWeight: 700, color: '#3D5A3E', borderTop: '1px solid rgba(61,46,30,0.07)' }}>Alles over Bylder Zakelijk →</a>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && <a href="https://app.bylder.com" style={LINK}>Inloggen</a>}
          {startGratis}
          {isMobile && (
            <button onClick={() => setMobileOpen(o => !o)} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 20, height: 2, background: '#1A1208', borderRadius: 2, display: 'block' }} />)}
            </button>
          )}
        </div>
      </div>

      {isMobile && mobileOpen && (
        <div style={{ borderTop: '1px solid rgba(61,46,30,0.07)', background: '#F5F0E8', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {JOURNEY.map(j => <a key={j.href} href={j.href} style={{ ...LINK, padding: '10px 0' }}>{j.label}</a>)}
          <div style={KOPJE}>Zakelijk</div>
          {ZAKELIJK.map(z => <a key={z.href} href={z.href} style={{ ...LINK, padding: '10px 0' }}>{z.title}</a>)}
          <a href="/zakelijk/" style={{ ...LINK, padding: '10px 0', color: '#3D5A3E', fontWeight: 600 }}>Alles over Bylder Zakelijk →</a>
          <a href="https://app.bylder.com" style={{ ...LINK, padding: '10px 0' }}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
