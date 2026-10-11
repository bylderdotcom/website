import { aantalMerken, kortingenVoor } from './aanbod'

/**
 * Commerciële stappen op de nieuwbouwprojectpagina's (verzoek Daniel, 11-10-2026: "cruciaal").
 *
 * De fragmenten (data/clusters/nieuwbouw-project/content/, gemaakt door
 * scripts/generate_projectpaginas.py) hadden al de deurconfigurator en de kastontwerper. Wat
 * ontbrak, en wat hier bij het renderen wordt toegevoegd:
 *   - de gietvloerknop ging naar de informatiepagina; nu naar de ontwerper
 *   - onzichtbare plinten: dezelfde deadline als de kozijnloze deur (vóór de stukadoor)
 *   - ledenkorting, met de merken bij naam
 *   - Auping met foto stond alleen op de 45 pagina's met een winkel in de buurt; nu op alle,
 *     in dezelfde opmaak (pk-bed). Waar het generatorblok er al staat, blijft dat staan: dat
 *     noemt de dichtstbijzijnde winkel.
 *
 * Hier en niet in de generator: dan geldt het meteen voor alle 289 pagina's, ook zonder
 * nieuwe scrape-ronde, en blijft de opmaak van de fragmenten zelf ongewijzigd.
 */

const utm = (slug: string, wat: string) => `utm_source=bylder-site&amp;utm_campaign=project-${slug}-${wat}`

function plintenEnKorting(slug: string): string {
  const merken = aantalMerken()
  const namen = kortingenVoor(['Verlichting', 'PVC vloer', 'Raamdecoratie', 'Sanitair', 'Meubelen'], 40)
  const noem = ['Goossens', 'DRT Contemporary Flooring', 'Lamp en Licht']
    .map(n => namen.find(d => d.naam === n) ?? kortingenVoor(undefined, 60).find(d => d.naam === n))
    .filter(Boolean)
    .map(d => `${d!.naam} (${d!.aanbod})`)
  return `
<div class="pk-keuzes">
<article>
<div class="pk-etiket">Onzichtbare plinten &middot; offerte</div>
<h3>Een wand zonder lijst langs de vloer</h3>
<p>Een inbouwplint of schaduwvoeg gaat v&oacute;&oacute;r de stukadoor de wand in, op hetzelfde moment
als het kozijn van een kozijnloze deur. Bij nieuwbouw is het een regel op de meerwerklijst; geef het
door voordat het stucwerk is ingepland.</p>
<p><a class="cta-primary" href="/onzichtbare-plinten/?${utm(slug, 'plinten')}#offerte">Vraag een offerte aan &rarr;</a></p>
<p class="noot">Indicatie &euro;8&ndash;20 per strekkende meter. <a href="/onzichtbare-plinten/">Wat een onzichtbare plint is</a>.</p>
</article>
<article>
<div class="pk-etiket">Ledenkorting &middot; ${merken} merken</div>
<h3>Korting op wat je na de sleutel koopt</h3>
<p>Vloer, verlichting, raamdecoratie, sanitair en meubels. Met een gratis account krijg je ledenkorting
bij ${merken} merken${noem.length ? `, onder meer ${noem.join(', ')}` : ''}.</p>
<p><a class="cta-primary" href="/vouchers/?${utm(slug, 'vouchers')}">Bekijk de kortingen &rarr;</a></p>
<p class="noot">Dezelfde account waarin je plattegrond en je keuzes staan.</p>
</article>
</div>
`
}

function auping(slug: string): string {
  return `
<h2>Korting op je bed &mdash; Auping</h2>
<div class="pk-bed">
<img src="/img/auping-noble-solid-oak.webp"
     srcset="/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w"
     sizes="(max-width:760px) 92vw, 280px"
     alt="Auping Noble Solid Oak, een bed van massief eiken in een slaapkamer"
     width="1000" height="1000" loading="lazy" decoding="async">
<div>
<p>Een nieuwe woning is vaak ook een nieuw bed. Met een gratis Bylder-account krijg je tien procent
op het reguliere Auping-assortiment, bij Auping Store Rotterdam Centrum, Den Haag Centrum, Zoetermeer
en Leidschendam. Vanaf &euro;5.000 komt er een gratis leenbed bij voor de levertijd, vanaf &euro;6.500
een overnachting. Niet bovenop een lopende actie of sale.</p>
<p><a class="cta-primary" href="/vouchers/auping/?${utm(slug, 'auping')}">Bekijk het Auping-voordeel &rarr;</a></p>
</div>
</div>
<p class="noot">Auping is aangesloten partner. De korting weegt niet mee in de bedrijven die wij op deze pagina noemen.</p>
`
}

export function verrijkProject(html: string, slug: string): string {
  if (slug === 'index' || html.includes('bylder:project-aanbod')) return html
  let h = html

  // 1. Gietvloer: naar de ontwerper, de lokale verwerkers als tweede link.
  h = h.replace(/<p><a class="cta-primary" href="(\/gietvloer\/[^"]*)">Vraag (?:offertes|een offerte) aan &rarr;<\/a><\/p>/,
    (_m, lokaal) => `<p><a class="cta-primary" href="/gietvloer/ontwerpen/?${utm(slug, 'gietvloer')}">Ontwerp je gietvloer &rarr;</a></p>`
      + `<p class="noot">Kleur uit je eigen foto, tot drie stalen gratis. Of <a href="${lokaal}">bekijk verwerkers in de buurt</a>.</p>`)

  // 2. Plinten en ledenkorting direct na de kast; zonder kastblok vóór de tijdlijn.
  const blok = `<!--bylder:project-aanbod-->${plintenEnKorting(slug)}${h.includes('class="pk-bed"') ? '' : auping(slug)}`
  const kast = h.indexOf('<div class="pk-kast">')
  if (kast >= 0) {
    const eind = h.indexOf('</article>\n</div>', kast)
    if (eind >= 0) {
      const na = eind + '</article>\n</div>'.length
      return h.slice(0, na) + blok + h.slice(na)
    }
  }
  const tijdlijn = h.indexOf('<h2>Wat er nu op je afkomt')
  if (tijdlijn >= 0) return h.slice(0, tijdlijn) + blok + h.slice(tijdlijn)
  const slot = h.lastIndexOf('</div></div>')
  return slot >= 0 ? h.slice(0, slot) + blok + h.slice(slot) : h + blok
}
