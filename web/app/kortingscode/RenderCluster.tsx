import type { KortingscodePage } from '../../lib/kortingscode'
import { getMainHtml, getClusterCss } from '../../lib/kortingscode'

// Server-component: rendert één /kortingscode/<merk>/-pagina. Cluster-CSS +
// JSON-LD + de <main>-HTML (nav uit het bron-fragment al gestript in
// getMainHtml). Nav + Footer komen uit de gedeelde root-layout.
export default function RenderCluster({ page }: { page: KortingscodePage }) {
  const css = getClusterCss()
  const main = getMainHtml(page)
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {page.ldjson.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <div dangerouslySetInnerHTML={{ __html: main }} />
    </>
  )
}
