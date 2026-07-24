import type { Metadata } from 'next'
import { getPages, getPage, toMetadata } from '../../../lib/gereedschap-lenen'
import RenderCluster from '../RenderCluster'

// /gereedschap-lenen/<slug>/ — alle cluster-pagina's behalve de index.
export function generateStaticParams() {
  return getPages()
    .filter(p => p.slug !== 'index')
    .map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug)
  return page ? toMetadata(page) : {}
}

export default async function GereedschapLenenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getPage(slug)!
  return <RenderCluster page={page} />
}
