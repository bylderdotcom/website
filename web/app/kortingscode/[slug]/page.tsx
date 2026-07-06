import type { Metadata } from 'next'
import { getPages, getPage, toMetadata } from '../../../lib/kortingscode'
import RenderCluster from '../RenderCluster'

// /kortingscode/<merk>/ — de 522 individuele merk-subpagina's (de index-hub
// zelf zit apart in ../page.tsx, al geport in Fase 1B).
export function generateStaticParams() {
  return getPages().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug)
  return page ? toMetadata(page) : {}
}

export default async function KortingscodeMerkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getPage(slug)!
  return <RenderCluster page={page} />
}
