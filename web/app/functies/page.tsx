import type { Metadata } from 'next'
import FunctiesClient from './FunctiesClient'

// Getrouwe port van /functies/index.html (Fase 1B). De interactieve toggle zit
// in FunctiesClient ('use client'); metadata blijft hier (server-component).

const OG_TITLE = 'Functies — wat Bylder voor je doet, per woningtype | Bylder'
const DESC =
  'Alle Bylder-functies op een rij, uitgesplitst per woningtype: nieuwbouw, bestaande bouw en renovatie. Zie per functie wat gratis is en wat gratis voor bewoners.'

export const metadata: Metadata = {
  title: OG_TITLE,
  description: DESC,
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.bylder.com/functies/' },
  openGraph: {
    title: 'Functies — wat Bylder voor je doet, per woningtype',
    description:
      'Alle functies per woningtype: nieuwbouw, bestaande bouw en renovatie. Zie wat gratis is en wat gratis voor bewoners.',
    url: 'https://www.bylder.com/functies/',
    images: [{ url: 'https://www.bylder.com/og-image.jpg?v=2' }],
  },
}

export default function FunctiesPage() {
  return <FunctiesClient />
}
