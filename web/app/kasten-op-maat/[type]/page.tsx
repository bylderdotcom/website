import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TYPES, urlVan } from '@/lib/kast/hub'
import HubWeergave from '../_hub/HubWeergave'

// Eén pagina per kasttype (hoekkast, tv-wand, ...). Inhoud: lib/kast/hub.ts.

export const dynamicParams = false
export function generateStaticParams() {
  return TYPES.map(t => ({ type: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params
  const p = TYPES.find(t => t.slug === type)
  if (!p) return {}
  return {
    title: p.title, description: p.description,
    alternates: { canonical: urlVan(p) },
    openGraph: { title: p.h1, description: p.description, url: urlVan(p), type: 'article' },
  }
}

export default async function KastTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params
  const p = TYPES.find(t => t.slug === type)
  if (!p) notFound()
  return <HubWeergave p={p} />
}
