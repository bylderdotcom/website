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

import MENU from './menu.json'

type Item = { href: string; title: string; sub?: string; primair?: boolean }
type Menu = { label: string; items: Item[]; breed?: boolean }

// HET MENU STAAT IN menu.json, niet hier (11-10-2026). Hetzelfde bestand zet bij
// elke build het menu op alle statische pagina's (_scripts/nav_pijlers_pass.py
// --stempel, vanuit web/build.sh). Eén wijziging daar = elke pagina.
const BOVENBALK: { href: string; label: string }[] = MENU.bovenbalk

const menus = (MERKEN: number): Menu[] => (MENU.menus as Menu[]).map((m) => ({
  ...m,
  items: m.items.map((i) => ({ ...i, title: i.title.replace('{merken}', String(MERKEN)) })),
}))

const INKT = 'rgba(61,46,30,'
const LINK: React.CSSProperties = {
  fontSize: '0.875rem', color: `${INKT}0.72)`, textDecoration: 'none', whiteSpace: 'nowrap',
}
const KOPJE: React.CSSProperties = {
  fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em',
  color: `${INKT}0.72)`, fontWeight: 700, padding: '14px 0 4px',
}

export default function Nav({ merken }: { merken: number }) {
  // Het aantal merken komt uit data/deelnemers.json en wordt door de layout
  // doorgegeven: deze component draait in de browser en kan zelf geen bestand
  // lezen.
  const MENUS = menus(merken)
  // Alleen nog interactie-state. Of je mobiel bent beslist CSS, niet JavaScript:
  // de oude isMobile-useState begon op false, waardoor elke mobiele bezoeker
  // eerst een flits van het desktopmenu zag totdat de JS geladen was.
  const [open, setOpen] = useState<string | null>(null)
  const [mobielOpen, setMobielOpen] = useState(false)
  const [mobielSectie, setMobielSectie] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

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
    <a href="/" className="bv-logo" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
      <span style={{ width: 32, height: 32, borderRadius: 8, background: '#3D5A3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8', fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>B.</span>
      <span className="bv-lt" style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: '#1A1208' }}>Bylder<span style={{ color: '#3D5A3E' }}>.com</span></span>
    </a>
  )

  const pijl = (om: boolean) => (
    <svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true"
         style={{ transition: 'transform .15s', transform: om ? 'rotate(180deg)' : 'none', flex: 'none' }}>
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )

  const dropdownItem = (it: Item) => it.primair ? (
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
    // display/height/padding/margin expliciet: oudere sjablonen hebben een kale
    // tag-selector nav{display:flex;height:64px;padding:0 5%}. Die greep dit menu
    // op ~33.000 kopen-pagina's en drukte het plat (gevonden 11-09-2026). Het
    // statische menu (bn2.css) verdedigt zich al zo; inline wint van elke
    // stylesheet-regel zonder !important. lineHeight om dezelfde reden: anders erft
    // het menu de regelhoogte van de pagina en verschilt zijn hoogte per route.
    <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'block', height: 'auto', minHeight: 0, padding: 0, margin: 0, lineHeight: 1.7, background: 'rgba(245,240,232,0.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: `1px solid ${INKT}0.07)` }}>
      {/* Zichtbaarheid per schermbreedte in CSS, zodat de eerste render meteen
          klopt — geen desktopmenu-flits meer op mobiel. */}
      <style dangerouslySetInnerHTML={{ __html:
        '.bv-top{display:block}.bv-desk{display:flex;align-items:center;gap:22px}'
        + '.bv-deskl{display:inline}.bv-burger{display:none}'
        + '@media(max-width:1180px){.bv-top{display:none}.bv-desk{display:none}'
        + '.bv-deskl{display:none}.bv-burger{display:flex}}'
        + '@media(min-width:1181px){.bv-sheet{display:none}}'
        // Zes menu's (sinds Ontwerpen erbij kwam, 10-10-2026) passen pas vanaf 1181px.
        // Daaronder, ook op een iPad liggend, het mobiele menu. Tot 1400px blijft
        // Functies weg uit de balk (staat in het mobiele menu en in de footer) en
        // zit er minder ruimte tussen de items.
        + '@media(max-width:1399px){.bv-fn{display:none!important}}'
        + '@media(min-width:1181px) and (max-width:1300px){.bv-desk{gap:15px}.bv-r{gap:10px!important}}'
        // De mobiele balk paste niet binnen 375px: logo + CTA + hamburger waren
        // samen breder dan het scherm, waardoor de hamburger buiten beeld viel
        // en de hele pagina horizontaal kon scrollen. !important omdat de maten
        // hierboven als inline-style op de elementen staan.
        + '@media(max-width:1180px){.bv-bar{padding:13px 16px!important;gap:10px!important}'
        + '.bv-r{gap:10px!important}.bv-cta{font-size:0.8125rem!important;padding:9px 14px!important}'
        + '.bv-burger{padding:6px 2px!important}}'
        + '@media(max-width:420px){.bv-bar{padding:12px 14px!important;gap:8px!important}'
        + '.bv-logo{gap:8px!important}.bv-lt{font-size:16px!important}'
        + '.bv-r{gap:8px!important}.bv-cta{font-size:0.75rem!important;padding:8px 12px!important}}'
        + '@media(max-width:359px){.bv-bar{padding:12px 10px!important}.bv-logo{gap:6px!important}'
        + '.bv-lt{font-size:15px!important}.bv-cta{padding:8px 10px!important}}' }} />

      <div className="bv-top" style={{ borderBottom: `1px solid ${INKT}0.06)`, background: '#EDE6D8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '7px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 12, color: `${INKT}0.6)` }}>Gratis voor bewoners</span>
          <div style={{ display: 'flex', gap: 18 }}>
            {BOVENBALK.map((t) => (
              <a key={t.href} href={t.href} style={{ fontSize: 12.5, color: `${INKT}0.66)`, textDecoration: 'none', whiteSpace: 'nowrap' }}>{t.label}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="bv-bar" style={{ maxWidth: 1200, margin: '0 auto', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {logo}

        <div className="bv-desk" ref={wrapRef}>
          {MENUS.map((m) => (
            <div key={m.label} style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen((o) => (o === m.label ? null : m.label))}
                aria-expanded={open === m.label}
                style={{ ...LINK, fontWeight: 600, color: `${INKT}0.8)`, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {m.label}
                {pijl(open === m.label)}
              </button>
              {/* Altijd in de HTML, verborgen tot het menu open is: zo zien zoekmachines dezelfde
                  menulinks als op de statische pagina's (audit 28-10-2026). */}
              {(
                <div hidden={open !== m.label} style={{
                  position: 'absolute', top: 'calc(100% + 14px)', left: m.breed ? 'auto' : 0,
                  right: m.breed ? -160 : 'auto', background: '#fff', border: `1px solid ${INKT}0.1)`,
                  borderRadius: 14, boxShadow: '0 12px 40px rgba(61,46,30,0.12)', padding: 8,
                  minWidth: m.breed ? 520 : 300, zIndex: 200,
                }}>
                  {m.items.filter((i) => i.primair).map(dropdownItem)}
                  {m.items.some((i) => i.primair) && m.items.some((i) => !i.primair) && (
                    <div style={{ height: 1, background: `${INKT}0.08)`, margin: '6px 8px' }} />
                  )}
                  <div style={m.breed ? { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 4 } : undefined}>
                    {m.items.filter((i) => !i.primair).map(dropdownItem)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bv-r" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/functies/" className="bv-deskl bv-fn" style={{ ...LINK, fontSize: '0.8rem' }}>Functies</a>
          <a href="https://app.bylder.com" className="bv-deskl" style={LINK}>Inloggen</a>
          <a href="https://app.bylder.com/woningscan" className="bv-cta" style={{ background: '#3D5A3E', color: '#F5F0E8', fontSize: '0.875rem', fontWeight: 700, padding: '9px 18px', borderRadius: 9, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Maak je stappenplan
          </a>
          <button className="bv-burger" onClick={() => setMobielOpen((o) => !o)} aria-label="Menu" aria-expanded={mobielOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexDirection: 'column', gap: 4 }}>
            {[0, 1, 2].map((i) => <span key={i} style={{ width: 20, height: 2, background: '#1A1208', borderRadius: 2, display: 'block' }} />)}
          </button>
        </div>
      </div>

      {mobielOpen && (
        <div className="bv-sheet" style={{ borderTop: `1px solid ${INKT}0.07)`, background: '#F5F0E8', padding: '4px 24px 20px', flexDirection: 'column', maxHeight: '78vh', overflowY: 'auto', display: 'flex' }}>
          {/* Accordeon: alles dicht tot je een sectie aanraakt — verzoek Daniel,
              de platte lijst met 30+ regels was onbruikbaar. */}
          {MENUS.map((m) => (
            <div key={m.label} style={{ borderBottom: `1px solid ${INKT}0.08)` }}>
              <button
                onClick={() => setMobielSectie((x) => (x === m.label ? null : m.label))}
                aria-expanded={mobielSectie === m.label}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '14px 0', fontSize: 15, fontWeight: 700, color: '#1A1208' }}
              >
                {m.label}
                {pijl(mobielSectie === m.label)}
              </button>
              {mobielSectie === m.label && (
                <div style={{ paddingBottom: 10 }}>
                  {m.items.map((it) => (
                    <a key={it.href} href={it.href} style={{ display: 'block', padding: '8px 0 8px 8px', fontSize: 14, textDecoration: 'none', fontWeight: it.primair ? 700 : 400, color: it.primair ? '#3D5A3E' : `${INKT}0.75)` }}>{it.title}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{ borderBottom: `1px solid ${INKT}0.08)` }}>
            <button
              onClick={() => setMobielSectie((x) => (x === 'meer' ? null : 'meer'))}
              aria-expanded={mobielSectie === 'meer'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '14px 0', fontSize: 15, fontWeight: 700, color: '#1A1208' }}
            >
              Meer
              {pijl(mobielSectie === 'meer')}
            </button>
            {mobielSectie === 'meer' && (
              <div style={{ paddingBottom: 10 }}>
                {BOVENBALK.map((t) => (
                  <a key={t.href} href={t.href} style={{ display: 'block', padding: '8px 0 8px 8px', fontSize: 14, textDecoration: 'none', color: `${INKT}0.75)` }}>{t.label}</a>
                ))}
                <a href="/functies/" style={{ display: 'block', padding: '8px 0 8px 8px', fontSize: 14, textDecoration: 'none', color: `${INKT}0.75)` }}>Functies</a>
              </div>
            )}
          </div>
          <a href="https://app.bylder.com" style={{ ...LINK, display: 'block', padding: '14px 0 0' }}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
