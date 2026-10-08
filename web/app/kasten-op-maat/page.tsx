import type { Metadata } from 'next'
import { PIJLER, urlVan } from '@/lib/kast/hub'
import HubWeergave from './_hub/HubWeergave'

// Pijler van de ContentHub "Kasten op maat". Inhoud: lib/kast/hub.ts.

export const metadata: Metadata = {
  title: PIJLER.title,
  description: PIJLER.description,
  alternates: { canonical: urlVan(PIJLER) },
  openGraph: { title: PIJLER.h1, description: PIJLER.description, url: urlVan(PIJLER), type: 'website' },
}

export default function KastenOpMaatPage() {
  return <HubWeergave p={PIJLER} />
}
