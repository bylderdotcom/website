'use client'

import { useState, useEffect, useRef } from 'react'

// Gedeelde site-navigatie — ÉÉN bron voor elke pagina.
// Canonieke items (besloten 2026-07-04): Kortingscodes · Functies · Voor wie? ▾ · Prijzen.
// 'Voordelen' (kapot #features-anker) en het dubbele 'Vouchers' zijn eruit; de
// kortingen-ingang heet nu 'Kortingscodes' en wijst naar /kortingscode/.

const VOOR_WIE = [
  { href: '/nieuwbouw-koper/', title: 'Nieuwbouwkoper', sub: 'Meerwerklijst, vouchers, planning' },
  { href: '/bestaande-bouw/', title: 'Bestaande bouw koper', sub: 'Offerte-check, aannemer matching' },
  { href: '/renovatie/', title: 'Renovatiewoning', sub: 'Budgettool, subsidies, planning' },
]

const LINK: React.CSSProperties = { fontSize: '0.875rem', color: 'rgba(61,46,30,0.55)', textDecoration: 'none' }

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const [voorWieOpen, setVoorWieOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!voorWieOpen) return
    const onClick = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setVoorWieOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [voorWieOpen])

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="/kortingscode/" style={LINK}>Kortingscodes</a>
            <a href="/functies/" style={LINK}>Functies</a>
            <div ref={wrapRef} style={{ position: 'relative' }}>
              <button onClick={() => setVoorWieOpen(o => !o)} style={{ ...LINK, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                Voor wie? <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {voorWieOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid rgba(61,46,30,0.1)', borderRadius: 14, boxShadow: '0 12px 40px rgba(61,46,30,0.12)', padding: 8, minWidth: 260, zIndex: 200 }}>
                  {VOOR_WIE.map(v => (
                    <a key={v.href} href={v.href} style={{ display: 'block', padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>
                      <strong style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{v.title}</strong>
                      <span style={{ fontSize: 11, color: 'rgba(61,46,30,0.5)' }}>{v.sub}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="/prijzen/" style={LINK}>Prijzen</a>
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
          <a href="/kortingscode/" style={{ ...LINK, padding: '10px 0' }}>Kortingscodes</a>
          <a href="/functies/" style={{ ...LINK, padding: '10px 0' }}>Functies</a>
          {VOOR_WIE.map(v => <a key={v.href} href={v.href} style={{ ...LINK, padding: '10px 0' }}>{v.title}</a>)}
          <a href="/prijzen/" style={{ ...LINK, padding: '10px 0' }}>Prijzen</a>
          <a href="https://app.bylder.com" style={{ ...LINK, padding: '10px 0' }}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
