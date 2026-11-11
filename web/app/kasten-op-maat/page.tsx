import type { Metadata } from 'next'
import { PIJLER, urlVan } from '@/lib/kast/hub'
import HubWeergave from './_hub/HubWeergave'

// Pijler van de ContentHub "Kasten op maat". Inhoud: lib/kast/hub.ts.

export const metadata: Metadata = {
  title: PIJLER.title,
  description: PIJLER.description,
  alternates: { canonical: urlVan(PIJLER) },
  openGraph: { title: PIJLER.h1, description: PIJLER.description, url: urlVan(PIJLER), type: 'website', images: [{ url: 'https://www.bylder.com/img/og/kasten.jpg', width: 1200, height: 630, alt: 'Maquette van een woning met een kast op maat in groen' }] },
  twitter: { card: 'summary_large_image' },
}

export default function KastenOpMaatPage() {
  return <HubWeergave p={PIJLER} />
}
