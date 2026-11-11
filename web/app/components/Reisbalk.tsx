'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { leesJouwWoning, heeftAangevraagd, type JouwWoning } from '@/lib/jouw-woning'

/**
 * De reis in één lijn (besluit Daniel, 11-11-2026): tekening, woning in 3D, kiezen, offerte, afgewerkt.
 * Staat onder het menu op de pagina's van die reis. De bezoeker ziet waar hij is en wat de volgende stap
 * is, en zodra hij een woning heeft staat die erbij ("Jouw woning: 83 m², 7 deuren"). Alles komt uit zijn
 * eigen browser (lib/jouw-woning.ts). Niet vast in beeld: de configurators hebben al een vaste balk.
 * Klikken: GA4 afwerk_klik met plek reis-<stap> (KlikMeter).
 */

const PADEN = /^\/($|mijn-woning|kozijnloze-deuren|gietvloer|kasten-op-maat|nieuwbouw-afwerken|winkel|nieuwbouw-project|ontwerpen|hoe-het-werkt|via\/)/
const CONFIGURATOR = /^\/(kozijnloze-deuren\/configurator|gietvloer\/ontwerpen|kasten-op-maat\/ontwerpen)/
const STAPPEN = [
  { naam: 'Tekening', href: '/mijn-woning/', doe: 'Upload je tekening', kort: 'Upload je tekening' },
  { naam: 'Woning in 3D', href: '/mijn-woning/', doe: 'Bekijk je woning in 3D', kort: 'Bekijk je woning' },
  { naam: 'Kiezen', href: '/ontwerpen/', doe: 'Kies deuren, vloer en kasten', kort: 'Kies je afwerking' },
  { naam: 'Offerte', href: '/nieuwbouw-afwerken/#aanvraag', doe: 'Vraag je offerte aan', kort: 'Vraag je offerte aan' },
  { naam: 'Afgewerkt', href: '', doe: 'We nemen contact op over je offerte', kort: 'Offerte aangevraagd' },
]
const GROEN = '#3D5A3E', INKT = 'rgba(26,18,8,'

export default function Reisbalk() {
  const pad = usePathname() ?? ''
  const [w, setW] = useState<JouwWoning | null>(null)
  const [aangevraagd, setAangevraagd] = useState(false)
  // De browseropslag bestaat pas na het laden; tot dan de balk van een nieuwe bezoeker.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setW(leesJouwWoning()); setAangevraagd(heeftAangevraagd()) }, [pad])
  /* eslint-enable react-hooks/set-state-in-effect */
  if (!PADEN.test(pad)) return null

  const klaar = [!!w, !!w, !!w && (w.gekozen || aangevraagd), aangevraagd, false]
  const nu = Math.max(0, klaar.indexOf(false))
  const stap = STAPPEN[nu]
  const feiten = w ? [`${w.m2} m²`, w.deuren ? `${w.deuren} deuren` : '', w.m2Giet ? `${w.m2Giet} m² gietvloer` : ''].filter(Boolean).join(' · ') : ''

  return (
    <nav aria-label="Je reis bij Bylder" className={CONFIGURATOR.test(pad) ? 'rb rb-conf' : 'rb'}>
      <style>{`
        .rb{background:#FBF8F2;border-bottom:1px solid ${INKT}0.08)}
        .rb-in{max-width:1200px;margin:0 auto;padding:8px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:44px}
        .rb ol{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:6px;min-width:0}
        .rb li{display:flex;align-items:center;gap:6px;font-size:13px;color:${INKT}0.55);white-space:nowrap}
        .rb li+li::before{content:"";width:18px;height:1px;background:${INKT}0.2)}
        .rb li a,.rb li span.t{color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
        .rb i{font-style:normal;width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:1.5px solid ${INKT}0.25);flex:none}
        .rb li.ok{color:${GROEN}}.rb li.ok i{background:${GROEN};border-color:${GROEN};color:#F5F0E8}
        .rb li.nu{color:#1A1208;font-weight:800}.rb li.nu i{border-color:${GROEN};color:${GROEN}}
        .rb-r{display:flex;align-items:center;gap:14px;min-width:0;font-size:13.5px}
        .rb-r a{color:${GROEN};font-weight:800;text-decoration:none;white-space:nowrap}
        .rb-w{color:${INKT}0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @media(max-width:860px){.rb-in{padding:8px 16px}.rb li:not(.nu){font-size:0}.rb li:not(.nu) i{font-size:11px}.rb li+li::before{width:8px}.rb-w{display:none}}
        .rb-k{display:none}
        @media(max-width:520px){.rb li.nu{font-size:0}.rb li.nu i{font-size:11px}.rb-l{display:none}.rb-k{display:inline}.rb-in{gap:10px}}
        @media(max-width:720px){.rb-conf{display:none}}
      `}</style>
      <div className="rb-in">
        <ol>
          {STAPPEN.map((s, i) => (
            <li key={s.naam} className={klaar[i] ? 'ok' : i === nu ? 'nu' : undefined} aria-current={i === nu ? 'step' : undefined}>
              {s.href && i <= nu + 1
                ? <a href={s.href} data-meet={`reis-${i + 1}`}><i aria-hidden="true">{klaar[i] ? '✓' : i + 1}</i>{s.naam}</a>
                : <span className="t"><i aria-hidden="true">{klaar[i] ? '✓' : i + 1}</i>{s.naam}</span>}
            </li>
          ))}
        </ol>
        <div className="rb-r">
          {w && <a className="rb-w" href="/mijn-woning/" data-meet="reis-woning" style={{ color: `${INKT}0.7)`, fontWeight: 600 }}>Jouw woning{w.project ? ` in ${w.project}` : ''}: {feiten}</a>}
          {stap.href ? <a href={stap.href} data-meet={`reis-volgende-${nu + 1}`}><span className="rb-l">{stap.doe}</span><span className="rb-k">{stap.kort}</span> →</a> : <span style={{ color: `${INKT}0.7)` }}><span className="rb-l">{stap.doe}</span><span className="rb-k">{stap.kort}</span></span>}
        </div>
      </div>
    </nav>
  )
}
