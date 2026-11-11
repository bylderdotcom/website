import type { ClusterPage } from '../../lib/nieuwbouw-project'
import { getMainHtml, getClusterCss } from '../../lib/nieuwbouw-project'
import { verrijkProject } from '../../lib/project-aanbod'
import { aantalMerken } from '../../lib/merken'
import AanbodStrook from '../components/AanbodStrook'
import { afwerkBlokProject } from '../../lib/afwerken'
import ProjectKorting from './ProjectKorting'
import VolgProject from './VolgProject'
import ProjectFilm from './ProjectFilm'
import BurenKozen from './BurenKozen'
import ProjectBalk from './ProjectBalk'

// Server-component: rendert één nieuwbouw-project-clusterpagina. Cluster-CSS +
// JSON-LD + de <main>-HTML. Nav + Footer komen uit de gedeelde root-layout.
//
// Commerciële stappen (11-10-2026): verrijkProject zet plinten, ledenkorting en Auping met
// foto in de pagina, en de gietvloerknop naar de ontwerper. Onderaan de AanbodStrook.
// De <main>-tags van het fragment gaan eruit: de layout levert de <main> al.
// Rust op de pagina (UX-audit 11-11-2026): de pagina was op een telefoon 25 schermen met 20 blokken.
// De blokken waar een koper iets mee doet blijven open; de rest wordt een rij uitklapbare koppen.
// De tekst blijft in de HTML staan (Google leest hem), de bezoeker ziet een overzicht.
const OPEN = /Zie je woning in|Twee afwerkingen|zelf publiceert/
function klapIn(html: string): string {
  const koppen = [...html.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/g)]
  if (koppen.length < 4) return html
  let uit = html.slice(0, koppen[0].index!)
  koppen.forEach((k, i) => {
    const eind = i + 1 < koppen.length ? koppen[i + 1].index! : html.length
    const stuk = html.slice(k.index!, eind)
    if (OPEN.test(k[0])) { uit += stuk; return }
    // Alleen het deel dat netjes binnen zijn eigen <div>'s blijft gaat in het uitklapblok.
    let diepte = 0, knip = stuk.length
    for (const t of stuk.matchAll(/<(\/?)div\b[^>]*>/g)) {
      diepte += t[1] ? -1 : 1
      if (diepte < 0) { knip = t.index!; break }
    }
    if (diepte > 0) { uit += stuk; return }
    const inhoud = stuk.slice(k[0].length, knip)
    if (inhoud.replace(/<[^>]+>/g, '').trim().length < 20) { uit += stuk; return }
    uit += `<details class="pm"><summary>${k[0]}</summary>${inhoud}</details>` + stuk.slice(knip)
  })
  return uit
}
const KLAP_CSS = '.pm{border-top:1px solid rgba(26,18,8,.12);margin:0}.pm:last-of-type{border-bottom:1px solid rgba(26,18,8,.12)}'
  + '.pm>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 2px;min-height:44px}'
  + '.pm>summary::-webkit-details-marker{display:none}.pm>summary h2{margin:0!important;font-size:1.1rem!important;line-height:1.3!important;letter-spacing:-.01em}'
  + '.pm>summary::after{content:"";flex:none;width:10px;height:10px;border-right:2px solid #3D5A3E;border-bottom:2px solid #3D5A3E;transform:rotate(45deg);margin:0 6px 4px 0;transition:transform .15s}'
  + '.pm[open]>summary::after{transform:rotate(-135deg);margin-bottom:-4px}.pm[open]{padding-bottom:18px}'
  + '@media(prefers-reduced-motion:reduce){.pm>summary::after{transition:none}}'

export default function RenderCluster({ page }: { page: ClusterPage }) {
  const css = getClusterCss()
  let main = verrijkProject(getMainHtml(page), page.slug)
    .replace(/<main[^>]*>/, '').replace(/<\/main>(?![\s\S]*<\/main>)/, '')
  // Op elke projectpagina (29-10-2026): "Van sleutel tot ingericht huis in <project>", vóór de afwerkkeuzes.
  const project = main.match(/Je tekende voor ([^<.]+)\./)?.[1]?.trim() ?? page.title.split(' — ')[0]
  const oplevering = page.description.match(/oplevering verwacht ([^.,]+)/)?.[1]?.trim() ?? null
  const blok = afwerkBlokProject(project, page.slug, oplevering)
  // Zo hoog mogelijk (3-11-2026): wie op een projectpagina komt, moet meteen zien wat Bylder voor
  // hem doet. Direct onder de kop en de cijfers; anders vóór de afwerkkeuzes; anders achteraan.
  let anker = main.search(/<h2[^>]*>Zie je woning in/)
  if (anker < 0) anker = main.search(/<h2[^>]*>Twee afwerkingen/)
  main = anker >= 0 ? main.slice(0, anker) + blok + '<!--pk-->' + main.slice(anker) : main + blok + '<!--pk-->'
  // Projectkorting (3-11-2026) direct onder het afwerkblok.
  // Het blok staat binnen <div class="container"><div class="kolom">. Sluit die rond de projectkorting
  // en open ze daarna opnieuw; klopt de nesting op die plek niet, dan komt het blok onder de pagina.
  let [voorPk, naPk] = main.split('<!--pk-->')
  const diepte = (voorPk.match(/<div\b/g) ?? []).length - (voorPk.match(/<\/div>/g) ?? []).length
  const opKolom = diepte === 2 && /^\s*<div class="container"><div class="kolom">/.test(voorPk)
  if (opKolom) { voorPk += '</div></div>'; naPk = '<div class="container"><div class="kolom">' + naPk }
  else { voorPk = voorPk + naPk; naPk = '' }
  if (naPk) naPk = klapIn(naPk)
  const offerteUrl = `/nieuwbouw-afwerken/?${new URLSearchParams({ project, project_slug: page.slug, ...(oplevering ? { oplevering } : {}) }).toString()}#aanvraag`
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css + KLAP_CSS }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: voorPk }} />
      <div className="container"><div className="kolom"><ProjectKorting slug={page.slug} project={project} offerte={offerteUrl} /><VolgProject slug={page.slug} project={project} /></div></div>
      {naPk && <div dangerouslySetInnerHTML={{ __html: naPk }} />}
      <ProjectFilm />
      <BurenKozen project={page.slug} />
      <ProjectBalk project={project} offerte={offerteUrl}
        woning={`/mijn-woning/?${new URLSearchParams({ project: page.slug, naam: project }).toString()}`} />
      <div className="container">
        <AanbodStrook merken={aantalMerken()} titel="Alles wat je via Bylder regelt" marge="8px 0 56px" />
      </div>
    </>
  )
}
