import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import HomeHeld from './held/HomeHeld'
import { HOME_JSONLD } from './homeHtml'

// Getrouwe port van de homepage index.html (Fase 1B). Metadata + JSON-LD hier
// (server-component); de interactieve body zit in HomeClient ('use client').

const OG_TITLE = 'Richt je huis in voordat het er staat — Bylder'
const OG_DESC =
  'Bylder leest je plattegrond en de planning van de bouwer: per keuze wanneer hij valt, en je deuren, vloer en verlichting alvast samengesteld met de maten uit jouw tekening. Gratis voor bewoners.'

export const metadata: Metadata = {
  title: 'Richt je nieuwbouwhuis in voordat het er staat | Bylder',
  description:
    'Bylder leest je plattegrond en de bouwplanning: per keuze wanneer hij valt, en je deuren, vloer en licht alvast samengesteld. Korting bij 56 merken. Gratis voor bewoners.',
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
    images: [{ url: 'https://www.bylder.com/og-image.jpg?v=3' }],
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
      <HomeClient><HomeHeld /></HomeClient>
    </>
  )
}
