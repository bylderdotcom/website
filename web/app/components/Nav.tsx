'use client'

import { useState, useEffect, useRef } from 'react'
import { NAV_CSS } from './navCss'

/**
 * Gedeelde site-navigatie — ÉÉN bron voor elke Next-route.
 *
 * OPBOUW (ontwerp Daniel, 26 aug 2026, naar het EVTrader-model)
 * Twee lagen. Een smalle bovenbalk voor de secundaire wereld: soort woning
 * (nieuwbouw / bestaande bouw / renovatie) en kennisbank. Daaronder de hoofdnav
 * met de pijlers van het bedrijf: Assortiment, Diensten, Kortingsvouchers en
 * Zakelijk, met de Stappenplan-knop als primaire handeling — die is een knop en
 * geen menu-item. Ernaast een subtiele verwijzing naar Functies.
 *
 * In elke dropdown is er visueel onderscheid tussen het primaire onderwerp
 * (kaartje met achtergrond) en de secundaire onderwerpen (compacte lijst achter
 * een scheidingslijn) — verzoek Daniel, zodat het overzichtelijk blijft.
 *
 * VORMGEVING ZIT IN KLASSEN, NIET INLINE (27-08-2026). Deze nav stond met 153
 * inline style=""-attributen op ~104.000 pagina's (36k statische + 67.710
 * Next-routes). Dat was 24 kB per pagina — 57% van een gemiddelde pagina — en
 * liet de Vercel-build op schijfruimte stuklopen (ENOSPC, 6.304 MB output).
 * De CSS komt uit navCss.ts, gegenereerd uit _scripts/nav_pijlers_pass.py,
 * zodat de Next-routes en de statische pagina's letterlijk dezelfde
 * vormgeving hebben en niet uit elkaar kunnen lopen.
 *
 * GEEN INTERNE LINK VERDWIJNT VAN DE SITE. Wat uit het menu ging staat in de
 * voettekst; de linkpoort in scripts/homepage_herordenen.mjs bewaakt dat.
 */

type Item = { href: string; title: string; sub?: string; primair?: boolean }
type Menu = { label: string; items: Item[]; breed?: boolean }

// Smalle bovenbalk: waar je woning in zit + de leeswereld.
const BOVENBALK: { href: string; label: string }[] = [
  { href: '/nieuwbouw-koper/', label: 'Nieuwbouw' },
  { href: '/bestaande-bouw/', label: 'Bestaande bouw' },
  { href: '/renovatie/', label: 'Renovatie' },
  { href: '/kennisbank/', label: 'Kennisbank' },
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
      { href: '/vouchers/auping/', title: 'Auping: 10% + gratis leenbed' },
      { href: '/kortingscode/', title: 'Kortingscodes per merk' },
      { href: '/showroomsale/', title: 'Showroomsale' },
    ],
  },
  {
    label: 'Zakelijk',
    items: [
      { href: '/inkoopvoordeel/', title: 'Inkoopvoordeel voor vakbedrijven',
        sub: 'Word verkooppunt van het gecureerde assortiment — op uitnodiging', primair: true },
      { href: '/deelnemer-worden/', title: 'Deelnemer worden',
        sub: 'Bereik kopers op het juiste koopmoment', primair: true },
      { href: '/deelnemer-worden/commercieel-vastgoed/', title: 'Commercieel vastgoed' },
      { href: '/voor-vakbedrijven/', title: 'Voor vakbedrijven' },
      { href: '/zakelijk/', title: 'Alles over Bylder Zakelijk' },
    ],
  },
]

const P = 'bn2'

export default function Nav() {
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

  const pijl = (om: boolean) => (
    <svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true"
         style={om ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )

  const dropdownItem = (it: Item) => it.primair ? (
    <a key={it.href} href={it.href} className={`${P}-p`}>
      <strong>{it.title}</strong>{it.sub && <span>{it.sub}</span>}
    </a>
  ) : (
    <a key={it.href} href={it.href} className={`${P}-s`}>{it.title}</a>
  )

  return (
    <nav className="byl-nav2026" aria-label="Hoofdnavigatie">
      <style dangerouslySetInnerHTML={{ __html: NAV_CSS }} />

      <div className={`${P}-top`}>
        <div className={`${P}-w ${P}-tw`}>
          <span className={`${P}-free`}>Gratis voor bewoners</span>
          <div className={`${P}-tls`}>
            {BOVENBALK.map((t) => (
              <a key={t.href} href={t.href} className={`${P}-tl`}>{t.label}</a>
            ))}
          </div>
        </div>
      </div>

      <div className={`${P}-w ${P}-mw`}>
        <a href="/" className={`${P}-logo`}>
          <span className={`${P}-lm`}>B.</span>
          <span className={`${P}-lt`}>Bylder<span className={`${P}-lg`}>.com</span></span>
        </a>

        <div className={`${P}-desk`} ref={wrapRef}>
          {MENUS.map((m) => (
            <div key={m.label} className={`${P}-m`}>
              <button
                type="button"
                className={`${P}-btn`}
                onClick={() => setOpen((o) => (o === m.label ? null : m.label))}
                aria-expanded={open === m.label}
              >
                {m.label}
                {pijl(open === m.label)}
              </button>
              {/* Klikken opent hier expliciet; de :hover-regel in de CSS doet de
                  rest. Beide wegen tonen dezelfde dropdown. */}
              <div className={`${P}-dd${m.breed ? ' w' : ''}`}
                   style={open === m.label ? { display: 'block' } : undefined}>
                {m.items.filter((i) => i.primair).map(dropdownItem)}
                {m.items.some((i) => i.primair) && m.items.some((i) => !i.primair) && (
                  <div className={`${P}-sep`} />
                )}
                {m.breed
                  ? <div className={`${P}-g`}>{m.items.filter((i) => !i.primair).map(dropdownItem)}</div>
                  : m.items.filter((i) => !i.primair).map(dropdownItem)}
              </div>
            </div>
          ))}
        </div>

        <div className={`${P}-r`}>
          <a href="/functies/" className={`${P}-lnk sm`}>Functies</a>
          <a href="https://app.bylder.com" className={`${P}-lnk`}>Inloggen</a>
          <a href="https://app.bylder.com/woningscan" className={`${P}-cta`}>Maak je stappenplan</a>
          <button className={`${P}-bg`} onClick={() => setMobielOpen((o) => !o)}
                  aria-label="Menu" aria-expanded={mobielOpen}>
            <i /><i /><i />
          </button>
        </div>
      </div>

      {mobielOpen && (
        <div className={`${P}-sheet o`}>
          {/* Accordeon: alles dicht tot je een sectie aanraakt — verzoek Daniel,
              de platte lijst met 30+ regels was onbruikbaar. */}
          {MENUS.map((m) => (
            <div key={m.label} className={`${P}-det`}>
              <button
                className={`${P}-sumb`}
                onClick={() => setMobielSectie((x) => (x === m.label ? null : m.label))}
                aria-expanded={mobielSectie === m.label}
              >
                {m.label}
                {pijl(mobielSectie === m.label)}
              </button>
              {mobielSectie === m.label && (
                <div>
                  {m.items.map((it) => (
                    <a key={it.href} href={it.href} className={`${P}-mi${it.primair ? ' p' : ''}`}>{it.title}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className={`${P}-det`}>
            <button
              className={`${P}-sumb`}
              onClick={() => setMobielSectie((x) => (x === 'meer' ? null : 'meer'))}
              aria-expanded={mobielSectie === 'meer'}
            >
              Meer
              {pijl(mobielSectie === 'meer')}
            </button>
            {mobielSectie === 'meer' && (
              <div>
                {BOVENBALK.map((t) => (
                  <a key={t.href} href={t.href} className={`${P}-mi`}>{t.label}</a>
                ))}
                <a href="/functies/" className={`${P}-mi`}>Functies</a>
              </div>
            )}
          </div>
          <a href="https://app.bylder.com" className={`${P}-ml`}>Inloggen</a>
        </div>
      )}
    </nav>
  )
}
