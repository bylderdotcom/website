import type { ClusterPage } from '../../lib/nieuwbouw-project'
import { getMainHtml, getClusterCss } from '../../lib/nieuwbouw-project'
import { verrijkProject } from '../../lib/project-aanbod'
import { aantalMerken } from '../../lib/merken'
import AanbodStrook from '../components/AanbodStrook'
import { afwerkBlokProject, plaatsVoorProject } from '../../lib/afwerken'

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
  // In de regio Den Bosch (28-10-2026): "Laat je woning in <project> afwerken", vóór de afwerkkeuzes.
  const plaats = plaatsVoorProject(page.slug)
  if (plaats) {
    const project = main.match(/Je tekende voor ([^<.]+)\./)?.[1]?.trim() ?? page.title.split(' — ')[0]
    const oplevering = page.description.match(/oplevering verwacht ([^.,]+)/)?.[1]?.trim() ?? null
    const blok = afwerkBlokProject(project, plaats, oplevering)
    const anker = main.search(/<h2[^>]*>Twee afwerkingen/)
    main = anker >= 0 ? main.slice(0, anker) + blok + main.slice(anker) : main + blok
  }
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
      <div className="container">
        <AanbodStrook merken={aantalMerken()} titel="Alles wat je via Bylder regelt" marge="8px 0 56px" />
      </div>
    </>
  )
}
