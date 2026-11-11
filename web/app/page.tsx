import type { Metadata } from 'next'
import NieuweHome from './home/NieuweHome'
import { HOME_JSONLD } from './homeHtml'

// Metadata + JSON-LD hier; de pagina zelf is app/home/NieuweHome.tsx (sinds 11-11-2026).

const OG_TITLE = 'Van sleutel tot ingericht huis | Bylder'
const OG_DESC =
  'Upload je tekening en zie je woning in 3D. Kies je deuren, vloer en kasten op hun plek, en laat het afwerken in één offerte. Gratis ontwerpen, voor nieuwbouw en bestaande bouw.'

export const metadata: Metadata = {
  title: 'Je woning in 3D: deuren, vloer en kasten kiezen en laten afwerken | Bylder',
  description:
    'Van sleutel tot ingericht huis: zet je woning in 3D uit je eigen tekening, kies deuren, gietvloer en kasten met prijs, en laat de afwerking in één offerte doen.',
  authors: [{ name: 'Bylder Nederland B.V.' }],
  keywords: [
    'kopersbegeleiding nieuwbouw', 'offerte check aannemer', 'meerwerk controleren',
    'kortingsvouchers wonen', 'gietvloer kopen', 'laadpaal installeren', 'badkamer renovatie prijs',
  ],
  robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  alternates: {
    canonical: 'https://www.bylder.com/',
    languages: {
      'nl-NL': 'https://www.bylder.com/',
      'en-US': 'https://www.bylder.com/en-us/',
      'x-default': 'https://www.bylder.com/',
    },
  },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESC,
    url: 'https://www.bylder.com/',
    type: 'website',
    locale: 'nl_NL',
    images: [{ url: 'https://www.bylder.com/img/og/home.jpg', width: 1200, height: 630, alt: 'Van sleutel tot ingericht huis: de woning als maquette' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESC,
  },
}

export default function HomePage() {
  return (
    <>
      {HOME_JSONLD.map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: block }} />
      ))}
      <NieuweHome />
    </>
  )
}
