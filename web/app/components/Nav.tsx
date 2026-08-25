'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Gedeelde site-navigatie — ÉÉN bron voor elke pagina.
 *
 * WAAROM DEZE VORM
 * De oude nav was een vlakke rij van zes onderwerpen (Nieuwbouw kopen, Verbouwen,
 * Inrichten, Verduurzamen, Kennisbank, Tools). Zes gelijkwaardige items dwingen de
 * bezoeker te kiezen zonder dat iets hem vertelt waar hij is in zijn eigen traject.
 *
 * De funnel heeft drie stappen: welke woning, wat koop je, welke hulp bij je keuzes.
 * De nav volgt die nu, met drie ingangen plus de kennisbank en het zakelijke deel.
 *
 * GEEN INTERNE LINK IS VERDWENEN. Alle zes oude hubs staan nog steeds in de nav,
 * alleen een niveau dieper. Dat is bewust: die links stonden op elke pagina van de
 * site en dragen hun deel van de interne linkstructuur. Ze uit het menu halen zou
 * bij 56.000 URL's de doorstroming raken — precies het risico waar de site op dit
 * moment niet tegen kan.
 */

type Item = { href: string; title: string; sub?: string }
type Menu = { label: string; href?: string; items?: Item[] }

const MENUS: Menu[] = [
  {
    label: 'Je woning',
    items: [
      { href: 'https://app.bylder.com/woningscan', title: 'Doe de woningscan', sub: 'Je adres is genoeg — wij zoeken de rest op' },
      { href: '/nieuwbouw-project/', title: 'Nieuwbouwprojecten', sub: 'Wat er gebouwd wordt, en hoe ver het is' },
      { href: '/nieuwbouw-koper/', title: 'Nieuwbouw kopen', sub: 'Van bezichtiging tot sleutel' },
      { href: '/wonen-in/', title: 'Wonen in jouw gemeente', sub: 'Prijzen en aanbod per plaats' },
      { href: '/bouwvergunning/', title: 'Bouwvergunning', sub: 'Wat mag wel en wat niet' },
    ],
  },
  {
    label: 'Kopen',
    items: [
      { href: '/kopen/', title: 'Alles wat je koopt', sub: 'Van gietvloer tot laadpaal' },
      { href: '/ruimtes/', title: 'Per ruimte', sub: 'Keuken, badkamer, zolder, tuin' },
      { href: '/kortingscode/', title: 'Kortingscodes', sub: 'Actuele codes per merk' },
      { href: '/vouchers/', title: 'Ledenkorting', sub: 'Korting bij winkels in de buurt' },
      { href: '/interieur-woning/', title: 'Inrichten' },
      { href: '/verbouwen/', title: 'Verbouwen' },
      { href: '/woning-verduurzamen/', title: 'Verduurzamen' },
    ],
  },
  {
    label: 'Hulp bij keuzes',
    items: [
      { href: '/nieuwbouw-tools/', title: 'Alle tools', sub: 'Rekenen, vergelijken, plannen' },
      { href: '/offerte-check/', title: 'Offerte-check', sub: 'Betaal je een eerlijke prijs?' },
      { href: '/eerlijke-prijzen/', title: 'Eerlijke prijzen', sub: 'Wat kost het echt, per post' },
      { href: '/hoe-het-werkt/', title: 'Hoe Bylder werkt', sub: 'Wat wij doen en wat het kost' },
      { href: '/prijzen/', title: 'Wat kost Bylder' },
    ],
  },
  { label: 'Kennisbank', href: '/kennisbank/' },
  {
    label: 'Zakelijk',
    items: [
      { href: '/deelnemer-worden/', title: 'Deelnemer worden', sub: 'Bereik kopers op het juiste koopmoment' },
      { href: '/deelnemer-worden/commercieel-vastgoed/', title: 'Commercieel vastgoed', sub: 'Offerte-check, m²-benchmarks & fit-out' },
      { href: '/zakelijk/', title: 'Alles over Bylder Zakelijk' },
    ],
  },
]

const INKT = 'rgba(61,46,30,'
const LINK: React.CSSProperties = {
  fontSize: '0.875rem', color: `${INKT}0.72)`, textDecoration: 'none', whiteSpace: 'nowrap',
}
const KOPJE: React.CSSProperties = {
  fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
  color: `${INKT}0.72)`, fontWeight: 700, padding: '14px 0 4px',
}

export default function Nav() {
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1020px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!open) return
    const buiten = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(null)
    }
    // Escape sluit het menu en houdt de focus waar hij was — anders zit een
    // toetsenbordgebruiker vast in een uitgeklapt paneel.
    const toets = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', buiten)
    document.addEventListener('keydown', toets)
    return () => {
      document.removeEventListener('mousedown', buiten)
      document.removeEventListener('keydown', toets)
    }
  }, [open])

  const logo = (
    <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: '#3D5A3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8', fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>B.</span>
      <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#1A1208' }}>Bylder<span style={{ color: '#3D5A3E' }}>.com</span></span>
    </a>
  )

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: `1px solid ${INKT}0.07)` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {logo}

        {!isMobile && (
          <div ref={wrapRef} style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            {MENUS.map((m) => m.href ? (
              <a key={m.label} href={m.href} style={LINK}>{m.label}</a>
            ) : (
              <div key={m.label} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpen((o) => (o === m.label ? null : m.label))}
                  aria-expanded={open === m.label}
                  style={{ ...LINK, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  {m.label}
                  <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true"
                       style={{ transition: 'transform .15s', transform: open === m.label ? 'rotate(180deg)' : 'none' }}>
                    <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                {open === m.label && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 14px)', left: 0, background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 14, boxShadow: '0 12px 40px rgba(61,46,30,0.12)', padding: 8, minWidth: 296, zIndex: 200 }}>
                    {m.items!.map((it) => (
                      <a key={it.href} href={it.href} style={{ display: 'block', padding: '10px 14px', borderRadius: 10, textDecoration: 'none' }}>
                        <strong style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A1208' }}>{it.title}</strong>
                        {it.sub && <span style={{ fontSize: 11, color: `${INKT}0.72)` }}>{it.sub}</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && <a href="https://app.bylder.com" style={LINK}>Inloggen</a>}
          {/* De knop noemt de eerste stap in plaats van "Start gratis". Wie hier
              klikt weet nu wat er gebeurt, en het is dezelfde handeling als het
              zoekveld op de homepage. */}
          <a href="https://app.bylder.com/woningscan" style={{ background: '#3D5A3E', color: '#F5F0E8', fontSize: '0.875rem', fontWeight: 700, padding: '9px 18px', borderRadius: 9, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Doe de woningscan
          </a>
          {isMobile && (
            <button onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" aria-expanded={mobileOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 20, height: 2, background: '#1A1208', borderRadius: 2, display: 'block' }} />)}
            </button>
          )}
        </div>
      </div>

      {isMobile && mobileOpen && (
        <div style={{ borderTop: `1px solid ${INKT}0.07)`, background: '#F5F0E8', padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '78vh', overflowY: 'auto' }}>
          {MENUS.map((m) => m.href ? (
            <a key={m.label} href={m.href} style={{ ...LINK, padding: '10px 0', fontWeight: 600 }}>{m.label}</a>
          ) : (
            <div key={m.label}>
              <div style={KOPJE}>{m.label}</div>
              {m.items!.map((it) => (
                <a key={it.href} href={it.href} style={{ ...LINK, display: 'block', padding: '9px 0' }}>{it.title}</a>
              ))}
            </div>
          ))}
          <a href="https://app.bylder.com" style={{ ...LINK, padding: '14px 0 0' }}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
