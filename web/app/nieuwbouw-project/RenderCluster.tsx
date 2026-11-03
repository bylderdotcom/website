import type { ClusterPage } from '../../lib/nieuwbouw-project'
import { getMainHtml, getClusterCss } from '../../lib/nieuwbouw-project'
import { verrijkProject } from '../../lib/project-aanbod'
import { aantalMerken } from '../../lib/merken'
import AanbodStrook from '../components/AanbodStrook'
import { afwerkBlokProject } from '../../lib/afwerken'
import ProjectKorting from './ProjectKorting'
import ProjectFilm from './ProjectFilm'
import BurenKozen from './BurenKozen'
import ProjectBalk from './ProjectBalk'

// Server-component: rendert één nieuwbouw-project-clusterpagina. Cluster-CSS +
// JSON-LD + de <main>-HTML. Nav + Footer komen uit de gedeelde root-layout.
//
// Commerciële stappen (11-10-2026): verrijkProject zet plinten, ledenkorting en Auping met
// foto in de pagina, en de gietvloerknop naar de ontwerper. Onderaan de AanbodStrook.
// De <main>-tags van het fragment gaan eruit: de layout levert de <main> al.
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
  const offerteUrl = `/nieuwbouw-afwerken/?${new URLSearchParams({ project, project_slug: page.slug, ...(oplevering ? { oplevering } : {}) }).toString()}#aanvraag`
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: voorPk }} />
      <div className="container"><div className="kolom"><ProjectKorting slug={page.slug} project={project} offerte={offerteUrl} /></div></div>
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
