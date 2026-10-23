import type { CSSProperties } from 'react'
import CommercieleStap from './CommercieleStap'

// Rendert een cluster-fragment (de vakmannen per stad: loodgieter, aannemer, schilder,
// elektricien, badkamer, stukadoor, dakkapel) met de commerciële stap erin (11-10-2026).
//
// Waar: op een stadspagina direct boven de bedrijvenlijst (de tweede h2, na het kort antwoord,
// de prijsrekenaar en het voorstellenblok), elders onderaan. De AanbodStrook komt altijd
// onderaan. Welke stap: web/lib/aanbod.ts, op het eerste deel van het pad.
//
// De fragmenten beginnen met <main style=…><div class="container …">. De <main> gaat eruit
// (de layout levert hem al; zijn opvulling komt op de wrapper), en de container wordt rond de
// stap gesloten en daarna opnieuw geopend, zodat geen element halverwege breekt. Klopt de
// nesting op die plek niet, dan komt de stap gewoon onderaan.

function stijl(s: string): CSSProperties {
  const uit: Record<string, string> = {}
  for (const regel of s.split(';')) {
    const i = regel.indexOf(':')
    if (i < 0) continue
    const k = regel.slice(0, i).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    if (k) uit[k] = regel.slice(i + 1).trim()
  }
  return uit as CSSProperties
}

export default function MetCommercieleStap({ html, pad }: { html: string; pad: string }) {
  const open = html.match(/^\s*<main([^>]*)>/)
  const wrapper = stijl(open?.[1].match(/style="([^"]*)"/)?.[1] ?? '')
  const h = open ? html.slice(open[0].length).replace(/<\/main>\s*$/, '') : html
  const container = h.match(/^\s*(<div class="container[^"]*"[^>]*>)/)?.[1]
  const h2 = [...h.matchAll(/<h2\b/g)].map(m => m.index!)
  const stad = !pad.includes('/bedrijf/') && !pad.includes('/register/')
  let knip = -1
  if (container && stad && h2.length >= 2) {
    const kop = h.slice(0, h2[1])
    const diepte = (kop.match(/<div\b/g) ?? []).length - (kop.match(/<\/div>/g) ?? []).length
    if (diepte === 1) knip = h2[1]
  }
  // Op een bedrijfsprofiel direct onder het blok met naam, telefoon en website (23-10-2026).
  // Wie op een bedrijfsnaam zoekt, haakt na het eerste scherm af; onderaan zag vrijwel
  // niemand de stap. Knip waar het blok met de h1 sluit en de container weer de ouder is.
  const h1 = h.indexOf('<h1')
  if (container && pad.includes('/bedrijf/') && h1 > 0) {
    let diepte = 0
    for (const m of h.matchAll(/<div\b|<\/div>/g)) {
      diepte += m[0] === '</div>' ? -1 : 1
      if (m.index! > h1 && diepte === 1) { knip = m.index! + m[0].length; break }
    }
  }
  const plek = knip < 0 ? 'onderaan' : stad ? 'stad-boven' : 'profiel-boven'
  return (
    <div style={wrapper}>
      {knip > 0 ? (
        <>
          <div dangerouslySetInnerHTML={{ __html: h.slice(0, knip) + '</div>' }} />
          <div className="container bv-raster" data-meet-stap={plek}>
            <CommercieleStap pad={pad} alleen="stap" marge={stad ? '8px 0 24px' : '20px 0 4px'} />
          </div>
          <div dangerouslySetInnerHTML={{ __html: container + h.slice(knip) }} />
        </>
      ) : (
        <>
          <div dangerouslySetInnerHTML={{ __html: h }} />
          <div className="container bv-raster" data-meet-stap={plek}>
            <CommercieleStap pad={pad} alleen="stap" marge="32px 0 0" />
          </div>
        </>
      )}
      <div className="container bv-raster">
        <CommercieleStap pad={pad} alleen="strook" marge="40px 0 24px" />
      </div>
    </div>
  )
}
