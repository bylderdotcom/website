'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Gedeelde site-navigatie — ÉÉN bron voor elke pagina.
 *
 * OPBOUW (ontwerp Daniel, 26 aug 2026, naar het EVTrader-model)
 * Twee lagen. Een smalle bovenbalk voor de secundaire wereld: soort woning
 * (nieuwbouw / bestaande bouw / renovatie), kennisbank en zakelijk. Daaronder de
 * hoofdnav met de pijlers van het bedrijf: Assortiment, Diensten en
 * Kortingsvouchers, met de Stappenplan-knop als vierde pijler — dat is de
 * primaire handeling, dus hij is een knop en geen menu-item. Ernaast een
 * subtiele verwijzing naar Functies.
 *
 * In elke dropdown is er visueel onderscheid tussen het primaire onderwerp
 * (kaartje met achtergrond) en de secundaire onderwerpen (compacte lijst achter
 * een scheidingslijn) — verzoek Daniel, zodat het overzichtelijk blijft.
 *
 * GEEN INTERNE LINK VERDWIJNT VAN DE SITE. Wat uit het menu ging staat in de
 * voettekst; de linkpoort in scripts/homepage_herordenen.mjs bewaakt dat.
 */

type Item = { href: string; title: string; sub?: string; primair?: boolean }
type Menu = { label: string; items: Item[]; breed?: boolean }

// Smalle bovenbalk: waar je woning in zit + de leeswereld + zakelijk.
const BOVENBALK: { href: string; label: string }[] = [
  { href: '/nieuwbouw-koper/', label: 'Nieuwbouw' },
  { href: '/bestaande-bouw/', label: 'Bestaande bouw' },
  { href: '/renovatie/', label: 'Renovatie' },
  { href: '/kennisbank/', label: 'Kennisbank' },
  { href: '/zakelijk/', label: 'Zakelijk' },
]

const MENUS: Menu[] = [
  {
    label: 'Assortiment',
    breed: true,
    items: [
      { href: '/assortiment/', title: 'Zo werkt ons assortiment',
        sub: 'Deels eigen aanbod, deels partners — bij elk aanbod staat wie levert', primair: true },
      { href: '/kopen/vloeren/', title: 'Vloeren' },
      { href: '/kopen/tegels/', title: 'Tegels' },
      { href: '/kozijnloze-deuren/', title: 'Kozijnloze deuren' },
      { href: '/kopen/binnendeuren/', title: 'Binnendeuren' },
      { href: '/kopen/buitendeuren/', title: 'Buitendeuren' },
      { href: '/kopen/keuken/', title: 'Keukens' },
      { href: '/kopen/sanitair/', title: 'Badkamer & sanitair' },
      { href: '/kopen/slaap-en-bedden/', title: 'Bedden & matrassen' },
      { href: '/kopen/zitmeubelen/', title: 'Banken & stoelen' },
      { href: '/kopen/kasten/', title: 'Kasten' },
      { href: '/kopen/raamdecoratie/', title: 'Raamdecoratie' },
      { href: '/kopen/verlichting/', title: 'Verlichting' },
      { href: '/kopen/elektronica/', title: 'Elektronica' },
      { href: '/kopen/verf/', title: 'Verf' },
      { href: '/kopen/wandafwerking/', title: 'Wandafwerking' },
      { href: '/kopen/tuin/', title: 'Tuin' },
      { href: '/kopen/dakkapellen/', title: 'Dakkapellen' },
      { href: '/kopen/zonnepanelen/', title: 'Zonnepanelen' },
      { href: '/kopen/isolatie/', title: 'Isolatie' },
      { href: '/kopen/laadpalen/', title: 'Laadpalen' },
    ],
  },
  {
    label: 'Diensten',
    items: [
      { href: '/offerte-check/', title: 'Offerte-check',
        sub: 'Betaal je een eerlijke prijs? Gratis gecheckt', primair: true },
      { href: '/aannemer/', title: 'Vind een vakbedrijf',
        sub: 'Aannemer, loodgieter, elektricien — met beoordelingen', primair: true },
      { href: '/meerwerk/', title: 'Meerwerk controleren',
        sub: 'Vóór je tekent, tegen marktprijzen', primair: true },
      { href: '/eerlijke-prijzen/', title: 'Eerlijke prijzen per klus' },
      { href: '/bouwvergunning/', title: 'Bouwvergunning' },
      { href: '/oplevering-nieuwbouw/', title: 'Oplevering & 5%-regeling' },
      { href: '/ruimtes/', title: 'Keuzes per ruimte' },
    ],
  },
  {
    label: 'Kortingsvouchers',
    items: [
      { href: '/vouchers/', title: 'Ledenkorting bij 61 merken',
        sub: 'Auping, Goossens, DRT en meer — met een gratis account', primair: true },
      { href: '/kortingscode/', title: 'Kortingscodes per merk' },
      { href: '/showroomsale/', title: 'Showroomsale' },
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

  const dropdownItem = (it: Item, breed?: boolean) => it.primair ? (
    <a key={it.href} href={it.href} style={{
      display: 'block', padding: '12px 14px', borderRadius: 10, textDecoration: 'none',
      background: '#EBF0E8', marginBottom: 4,
    }}>
      <strong style={{ display: 'block', fontSize: 13.5, fontWeight: 800, color: '#1A1208' }}>{it.title}</strong>
      {it.sub && <span style={{ fontSize: 11.5, color: `${INKT}0.72)` }}>{it.sub}</span>}
    </a>
  ) : (
    <a key={it.href} href={it.href} style={{
      display: 'block', padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
      fontSize: 13, fontWeight: 600, color: `${INKT}0.82)`,
    }}>{it.title}</a>
  )

  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: `1px solid ${INKT}0.07)` }}>
      {/* Bovenbalk — de secundaire wereld, klein en rustig (EVTrader-model). */}
      {!isMobile && (
        <div style={{ borderBottom: `1px solid ${INKT}0.06)`, background: '#EDE6D8' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '7px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 12, color: `${INKT}0.6)` }}>Gratis voor bewoners</span>
            <div style={{ display: 'flex', gap: 18 }}>
              {BOVENBALK.map((t) => (
                <a key={t.href} href={t.href} style={{ fontSize: 12.5, color: `${INKT}0.66)`, textDecoration: 'none', whiteSpace: 'nowrap' }}>{t.label}</a>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {logo}

        {!isMobile && (
          <div ref={wrapRef} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {MENUS.map((m) => (
              <div key={m.label} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpen((o) => (o === m.label ? null : m.label))}
                  aria-expanded={open === m.label}
                  style={{ ...LINK, fontWeight: 600, color: `${INKT}0.8)`, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  {m.label}
                  <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true"
                       style={{ transition: 'transform .15s', transform: open === m.label ? 'rotate(180deg)' : 'none' }}>
                    <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                {open === m.label && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 14px)', left: m.breed ? 'auto' : 0,
                    right: m.breed ? -160 : 'auto', background: '#fff', border: `1px solid ${INKT}0.1)`,
                    borderRadius: 14, boxShadow: '0 12px 40px rgba(61,46,30,0.12)', padding: 8,
                    minWidth: m.breed ? 520 : 300, zIndex: 200,
                  }}>
                    {m.items.filter((i) => i.primair).map((i) => dropdownItem(i, m.breed))}
                    {m.items.some((i) => i.primair) && m.items.some((i) => !i.primair) && (
                      <div style={{ height: 1, background: `${INKT}0.08)`, margin: '6px 8px' }} />
                    )}
                    <div style={m.breed ? { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 4 } : undefined}>
                      {m.items.filter((i) => !i.primair).map((i) => dropdownItem(i, m.breed))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* De subtiele hint naar de functies, naast de pijler-knop. */}
          {!isMobile && <a href="/functies/" style={{ ...LINK, fontSize: '0.8rem' }}>Functies</a>}
          {!isMobile && <a href="https://app.bylder.com" style={LINK}>Inloggen</a>}
          <a href="https://app.bylder.com/woningscan" style={{ background: '#3D5A3E', color: '#F5F0E8', fontSize: '0.875rem', fontWeight: 700, padding: '9px 18px', borderRadius: 9, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Maak je stappenplan
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
          {MENUS.map((m) => (
            <div key={m.label}>
              <div style={KOPJE}>{m.label}</div>
              {m.items.map((it) => (
                <a key={it.href} href={it.href} style={{ ...LINK, display: 'block', padding: '8px 0', fontWeight: it.primair ? 700 : 400, color: it.primair ? '#1A1208' : `${INKT}0.72)` }}>{it.title}</a>
              ))}
            </div>
          ))}
          <div style={KOPJE}>Meer</div>
          {BOVENBALK.map((t) => (
            <a key={t.href} href={t.href} style={{ ...LINK, display: 'block', padding: '8px 0' }}>{t.label}</a>
          ))}
          <a href="/functies/" style={{ ...LINK, display: 'block', padding: '8px 0' }}>Functies</a>
          <a href="https://app.bylder.com" style={{ ...LINK, display: 'block', padding: '14px 0 0' }}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
