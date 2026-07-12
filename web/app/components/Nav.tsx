'use client'

import { useState, useEffect } from 'react'

// Gedeelde site-navigatie — ÉÉN bron voor elke pagina.
// Journey-nav (besloten 2026-07-11, zie _audits/deelnemer-structuur-plan.md):
// Nieuwbouw kopen · Verbouwen · Inrichten · Verduurzamen · Kennisbank · Tools ·
// Deelnemer worden. Het 'Voor wie?'-dropdown is vervangen door de journey-items;
// Kortingscodes/Functies/Prijzen leven in de footer en de journey-hubs.

const JOURNEY = [
  { href: '/nieuwbouw-koper/', label: 'Nieuwbouw kopen' },
  { href: '/verbouwen/', label: 'Verbouwen' },
  { href: '/interieur-woning/', label: 'Inrichten' },
  { href: '/woning-verduurzamen/', label: 'Verduurzamen' },
  { href: '/kennisbank/', label: 'Kennisbank' },
  { href: '/nieuwbouw-tools/', label: 'Tools' },
  { href: '/deelnemer-worden/', label: 'Deelnemer worden' },
]

const LINK: React.CSSProperties = { fontSize: '0.875rem', color: 'rgba(61,46,30,0.55)', textDecoration: 'none', whiteSpace: 'nowrap' }

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1020px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

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
          <a href="https://app.bylder.com" style={{ ...LINK, padding: '10px 0' }}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
