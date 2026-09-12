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
          /* box-sizing als eerste. De clusterpagina's brengen hun eigen reset mee,
             de handgeschreven Next-pagina's niet: daar werd een container van
             maxWidth 1200 met 24px marge 1248 breed, en stond het menu 24px links
             van waar het op alle andere pagina's staat (logo op 120 in plaats van
             144). Eén reset zet dat recht — en voorkomt dat een veld met
             width:100% plus padding buiten zijn kolom valt (gevonden 11/12-09-2026). */
          '*,*::before,*::after{box-sizing:border-box}'
          + '/*a11y-focus*/:focus-visible{outline:3px solid #3D5A3E!important;'
          + 'outline-offset:2px;box-shadow:0 0 0 8px rgba(245,240,232,.85)}'
          + '@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;'
          + 'transition-duration:.01ms!important;scroll-behavior:auto!important}}'
          /* Mobiel vangnet, gelijk aan bn2.css voor de statische pagina's:
             kaartenrijen die hard op twee of drie kolommen staan, brede
             tabellen en blokken die niet mogen krimpen maakten de pagina
             breder dan de telefoon. Alleen onder 720px. */
          + '@media(max-width:720px){'
          + '[style*="grid-template-columns:1fr "],[style*="grid-template-columns: 1fr "],'
          + '[style*="grid-template-columns:1.6fr"],'
          + '[style*="grid-template-columns:2fr 1fr"],[style*="grid-template-columns:repeat(2,"],'
          + '[style*="grid-template-columns:repeat(3,"],[style*="grid-template-columns:repeat(4,"],'
          + '[style*="grid-template-columns:repeat(5,"],[style*="grid-template-columns: repeat(2,"],'
          + '[style*="grid-template-columns: repeat(3,"],[style*="grid-template-columns: repeat(4,"]'
          + '{grid-template-columns:1fr!important}'
          + '.grid,.grid-2,.grid-3,.grid-4,.grid-5,.grid-cards,.stat-row,.art-grid,.aff-grid,'
          + '.hero-grid,.step-grid,.two-col,.kv,.kv-grid,.seg-grid,.tile-grid,.layout,'
          + '.further-grid,.verder-grid,.verder-lezen-grid,.read-more-grid,.cluster-grid,'
          + '.keuze-grid,.compare-grid,.price-grid,.name-row,.vent-grid,.footer-inner,'
          + '.footer-grid{grid-template-columns:1fr}'
          + '*{min-width:0}'
          + '[style*="min-width:2"],[style*="min-width:3"],[style*="min-width:4"],'
          + '[style*="min-width:5"],[style*="min-width:6"],[style*="min-width:7"],'
          + '[style*="min-width:8"],[style*="min-width:9"],[style*="min-width: 2"],'
          + '[style*="min-width: 3"],[style*="min-width: 4"],[style*="min-width: 5"],'
          + '[style*="min-width: 6"]{min-width:0!important}'
          + 'h1,h2,h3{-webkit-hyphens:auto;hyphens:auto}body{overflow-wrap:break-word}'
          + 'table,table[class],table[style]{display:block;max-width:100%;overflow-x:auto}'
          + 'table[style*="min-width"],table[style*="min-width"] *{min-width:0!important}}'
          /* Meescrollende blokken onder het menu houden: het menu is op desktop
             104px hoog en blijft staan, een kaart op 100px gleed eronder
             (homepage, /3d-sfeerimpressie/). Gelijk aan bn2.css. */
          + '@media(min-width:1021px){[style*="position:sticky;top:80px"],'
          + '[style*="position:sticky;top:84px"],[style*="position:sticky;top:90px"],'
          + '[style*="position:sticky;top:96px"],[style*="position:sticky;top:100px"],'
          + '.sidebar-card{top:120px!important}}'
          /* Clusterpagina's op het raster van het menu (zie lib/raster.ts):
             container = menuraster (1200px, zelfde zijmarge als het menu per
             schermbreedte), inhoud even breed als voorheen maar links. */
          + '.container.bv-raster{max-width:1200px;padding:0 24px;box-sizing:border-box}'
          + '.container.bv-raster>*{max-width:var(--bv-inhoud,824px)}'
          + '@media(max-width:1020px){.container.bv-raster{padding:0 16px}}'
          + '@media(max-width:420px){.container.bv-raster{padding:0 14px}}'
          + '@media(max-width:359px){.container.bv-raster{padding:0 10px}}' }} />
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
