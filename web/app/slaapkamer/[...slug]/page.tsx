import type { Metadata } from 'next'
import { getPages, getPage, toMetadata } from '../../../lib/slaapkamer'
import RenderCluster from '../RenderCluster'

// Catch-all: dit cluster heeft geneste paden zoals
// /slaapkamer/matras-materialen/schuim/, dus één [slug]-segment volstaat niet.
export function generateStaticParams() {
  return getPages()
    .filter(p => p.slug !== 'index')
    .map(p => ({ slug: p.slug.split('/') }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  return page ? (toMetadata(page) as Metadata) : {}
}

export default async function SlaapkamerPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  return <RenderCluster page={getPage(slug.join('/'))!} />
}
