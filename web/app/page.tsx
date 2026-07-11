import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import { HOME_JSONLD } from './homeHtml'

// Getrouwe port van de homepage index.html (Fase 1B). Metadata + JSON-LD hier
// (server-component); de interactieve body zit in HomeClient ('use client').

const OG_TITLE = 'Alles voor je (nieuwe) woning. Met eerlijke prijzen als fundament.'
const OG_DESC =
  'Advies, ontwerpen, shoppen en aanbesteden in één woningdossier. AI checkt de prijzen, echte vakmensen voeren uit. Leden besparen gemiddeld €4.200. Eenmalig €99.'

export const metadata: Metadata = {
  title: 'Bylder.com — Alles voor je (nieuwe) woning: offerte check, kopersbegeleiding & kortingen',
  description:
    'Advies, ontwerpen, shoppen en aanbesteden in één woningdossier — voor nieuwbouw, bestaande bouw en renovatie. AI offerte-check, 61 woonmerken met korting. Gemiddeld €4.200 bespaard. Eenmalig €99.',
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
    images: [{ url: 'https://www.bylder.com/og-image.jpg?v=2' }],
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
      <HomeClient />
    </>
  )
}
