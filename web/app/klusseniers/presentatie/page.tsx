import type { Metadata } from 'next'
import { DIAS } from './dias'
import { vulIn } from './gegevens'
import Presentatie from './Presentatie'

/**
 * De presentatie voor De Klussenier (verzoek Daniel, 11-11-2026): Joost presenteert de samenwerking aan
 * een groep Klusseniers en deelt hem daarna met een link in plaats van een bijlage. Dezelfde 13 dia's als
 * de Slides-presentatie (dias.ts is daaruit omgezet, zonder sprekersnotities). Bovenaan "Presenteer":
 * schermvullend, met pijltjestoetsen, klikken of vegen. De film is die van de homepage, opgenomen.
 *
 * Geen zoekpagina (noindex): hij is voor Klusseniers en hoort niet in Google.
 */

export const metadata: Metadata = {
  title: 'Klusseniers × Bylder: de presentatie | Bylder',
  description: 'Je eigen link, je vergoeding en de woning van je klant in 3D. De presentatie voor Klusseniers.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://www.bylder.com/klusseniers/presentatie/' },
  openGraph: {
    type: 'website', url: 'https://www.bylder.com/klusseniers/presentatie/', siteName: 'Bylder',
    title: 'Klusseniers × Bylder: jouw klant, jouw link, jouw vergoeding',
    description: 'Meeverdienen aan de deuren, gietvloer en kasten die je klanten toch al kopen.',
    images: [{ url: 'https://www.bylder.com/img/klusseniers/woning3d.webp', alt: 'Een woning in 3D met de ruimtes en hun oppervlakte' }],
  },
}

export default function PresentatiePagina() {
  const dias = DIAS.map(d => ({ id: d.id, html: vulIn(d.html) }))
  return (
    <main style={{ background: '#F5F0E8', padding: '32px 16px 64px' }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap" precedence="default" />
      <Presentatie dias={dias} />
    </main>
  )
}
