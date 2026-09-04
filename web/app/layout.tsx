import type { Metadata } from 'next'
import Script from 'next/script'
import Aankondiging from './components/Aankondiging'
import Nav from './components/Nav'
import { aantalMerken } from '@/lib/merken'
import Footer from './components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.bylder.com'),
}

// Google Analytics-id, gelijk aan elke bron-pagina van bylder.com.
const GA_ID = 'G-LZYCRP1169'

// Root-layout = de gedeelde chrome op één plek. Elke Next-route krijgt
// automatisch dezelfde Nav + Footer — dé "menu op één plek"-winst van Fase 1.
// Fonts (Plus Jakarta Sans + Space Mono) en gtag staan hier centraal, zodat elke
// gemigreerde pagina dezelfde typografie als de live-site heeft en de analytics
// niet wegvalt. Weight-set is een superset van wat de losse pagina's gebruiken.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Focusindicator centraal, zodat elke Next-route hem erft en niet elk
            cluster hem apart moet meenemen. Het nieuwe cluster /wonen-in/ ging
            op 27 juli live met 343 pagina's zonder indicator, precies omdat de
            verse cluster-CSS hem niet had. Mosgroen alleen haalt 6.78:1 op crème
            maar zakt naar 2.41:1 op de donkere secties, onder de 3:1 die WCAG
            1.4.11 eist voor UI — vandaar de lichte halo eromheen. */}
        <style dangerouslySetInnerHTML={{ __html:
          '/*a11y-focus*/:focus-visible{outline:3px solid #3D5A3E!important;'
          + 'outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}'
          + '@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;'
          + 'transition-duration:.01ms!important;scroll-behavior:auto!important}}' }} />
      </head>
      <body style={{ margin: 0, background: '#F5F0E8', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
        }} />
        {/* Meldkanaal. Op de 8.714 losse pagina's staat dit script per pagina
            in de HTML; de 26 pagina's die hier doorheen komen — homepage
            voorop — hadden het niet. Eén keer centraal in plaats van 26 keer
            los. lazyOnload: het is een strook onder aan de pagina, die hoeft
            niet mee te vechten om de eerste render. */}
        <Script src="/mis-je-iets.js" strategy="lazyOnload" />
        <Aankondiging />
        <Nav merken={aantalMerken()} />
        {/* <main> is hier geen opsmuk. Twee redenen: schermlezers en
            toetsenbordgebruikers gebruiken het om de navigatie over te slaan,
            en mis-je-iets.js hangt zichzelf onder in dit blok. Zonder <main>
            valt de widget terug op <body> en belandt hij ónder de voettekst,
            na de copyrightregel — waar hij op een fout lijkt. */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
