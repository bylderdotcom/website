'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Gedeelde site-navigatie — ÉÉN bron voor elke pagina.
 *
 * WAAROM DEZE INDELING (herzien 26 aug 2026, op aanwijzing van Daniel)
 * De vorige nav volgde de funnel: "Je woning", "Kopen", "Hulp bij keuzes". Dat is
 * onze interne logica, niet de taal van de bezoeker — Daniel noemde hem terecht
 * wollig. Menu-items horen te benoemen wat iemand komt doen, in de woorden van de
 * propositie: verbouwen, afwerken, inrichten. Plus het assortiment als eigen
 * ingang, want dat ís het aanbod.
 *
 * Elke sub-regel is een belofte of een feit, geen categorie-omschrijving.
 *
 * GEEN INTERNE LINK VERDWIJNT VAN DE SITE. Wat uit het menu ging (tools, functies,
 * 3D, hoe-het-werkt, wonen-in) staat in de voettekst — die staat op elke pagina.
 * De linkpoort in scripts/homepage_herordenen.mjs bewaakt dat.
 */

type Item = { href: string; title: string; sub?: string }
type Menu = { label: string; href?: string; items?: Item[] }

const MENUS: Menu[] = [
  {
    label: 'Verbouwen',
    items: [
      { href: '/aannemer/', title: 'Vind een vakbedrijf', sub: 'Aannemer, loodgieter, elektricien — met beoordelingen' },
      { href: '/offerte-check/', title: 'Offerte-check', sub: 'Betaal je een eerlijke prijs? Gratis gecheckt' },
      { href: '/eerlijke-prijzen/', title: 'Wat kost het echt', sub: 'Marktprijzen per klus, per gemeente' },
      { href: '/bouwvergunning/', title: 'Bouwvergunning', sub: 'Wat mag zonder vergunning en wat niet' },
      { href: '/woning-verduurzamen/', title: 'Verduurzamen', sub: 'Isolatie, zonnepanelen en de subsidies' },
      { href: '/verbouwen/', title: 'Alle verbouwgidsen' },
    ],
  },
  {
    label: 'Afwerken',
    items: [
      { href: '/meerwerk/', title: 'Meerwerk controleren', sub: 'Vóór je tekent, tegen marktprijzen' },
      { href: '/nieuwbouw-koper/', title: 'Nieuwbouw kopen', sub: 'Van koopakte tot sleutel' },
      { href: '/nieuwbouw-project/', title: 'Nieuwbouwprojecten', sub: 'Wat er gebouwd wordt en hoe ver het is' },
      { href: '/oplevering-nieuwbouw/', title: 'Oplevering & 5%-regeling', sub: 'De checklist en je rechten' },
      { href: '/kopen/vloeren/', title: 'Vloeren', sub: 'Gietvloer, pvc, parket — met prijzen' },
      { href: '/kozijnloze-deuren/', title: 'Kozijnloze deuren', sub: 'Kies vóór de stukadoor komt' },
    ],
  },
  {
    label: 'Inrichten',
    items: [
      { href: '/ruimtes/', title: 'Per ruimte', sub: 'Van keuken tot zolder, alle keuzes' },
      { href: '/kopen/', title: 'Alle productgidsen', sub: '19 categorieën met marktprijzen' },
      { href: '/vouchers/', title: 'Korting bij 61 merken', sub: 'Auping, Goossens, DRT en meer' },
      { href: '/kortingscode/', title: 'Kortingscodes', sub: 'Actuele codes per merk' },
      { href: '/showroomsale/', title: 'Showroomsale', sub: 'Showroommodellen met korting' },
      { href: '/interieur-woning/', title: 'Alle inrichtingsgidsen' },
    ],
  },
  { label: 'Assortiment', href: '/assortiment/' },
  { label: 'Kennisbank', href: '/kennisbank/' },
  {
    label: 'Zakelijk',
    items: [
      { href: '/deelnemer-worden/', title: 'Deelnemer worden', sub: 'Op uitnodiging — een handvol bedrijven per vak per regio' },
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
            Bekijk wat we al weten
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
