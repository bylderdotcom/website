import type { Metadata } from 'next'

// Getrouwe port van /eerlijke-prijzen/index.html (Fase 1B).
// Nav + Footer komen uit de gedeelde root-layout; de oude in-page nav en de
// pagina-eigen mini-footer vervallen. De disclaimer-tekst uit die mini-footer
// is inhoud (geen chrome) en blijft daarom onderaan de <main> behouden.
// Meta + de 3 JSON-LD-blokken zijn 1-op-1 overgenomen (JSON-LD = harde invariant).

const OG_TITLE = 'Eerlijke prijzen verbouwing: marktprijzen per m² | Bylder.com'
const OG_DESC =
  'Wat is een eerlijke prijs voor je vloer, vloerverwarming, keuken of badkamer? Bekijk de actuele marktbandbreedtes per m² en check gratis of jij niet te veel betaalt.'

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  alternates: { canonical: 'https://www.bylder.com/eerlijke-prijzen/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'article',
    title: OG_TITLE,
    description: OG_DESC,
    url: 'https://www.bylder.com/eerlijke-prijzen/',
  },
}

const JSONLD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoe weet ik of een offerteprijs eerlijk is?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Vergelijk de prijs per eenheid (per m², per punt of totaal) met de marktbandbreedte. Bylder's Prijs-benchmark toetst je prijs aan werkelijke marktdata en zegt of die marktconform of te hoog is.",
      },
    },
    {
      '@type': 'Question',
      name: 'Kan een gewone AI dit ook?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een losse AI gokt op basis van algemene kennis en mist jouw context. Bylder vergelijkt met een dataset van werkelijke prijzen, kent je tekening en regio, en geeft een concreet onderhandelpunt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Zijn deze prijzen exact?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nee, het zijn indicatieve marktbandbreedtes (NL 2026). Ze verschillen per project, regio en afwerking — gebruik ze als ijkpunt, niet als offerte.',
      },
    },
  ],
}

const JSONLD_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Bylder.com', item: 'https://www.bylder.com/' },
    { '@type': 'ListItem', position: 2, name: 'Eerlijke prijzen', item: 'https://www.bylder.com/eerlijke-prijzen/' },
  ],
}

const JSONLD_ARTICLE = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Eerlijke prijzen verbouwing: marktprijzen per m²',
  description:
    'Wat is een eerlijke prijs voor je vloer, vloerverwarming, keuken of badkamer? Bekijk de actuele marktbandbreedtes per m² en check gratis of jij niet te veel betaalt.',
  author: { '@type': 'Organization', name: 'Bylder.com' },
  publisher: { '@type': 'Organization', name: 'Bylder.com' },
}

const TILES = [
  { href: '/eerlijke-prijzen/gietvloer/', title: 'Gietvloer', range: '€70–€130 per m²' },
  { href: '/eerlijke-prijzen/pvc-laminaat/', title: 'PVC- of laminaatvloer', range: '€35–€85 per m²' },
  { href: '/eerlijke-prijzen/tegelvloer/', title: 'Tegelvloer', range: '€60–€130 per m²' },
  { href: '/eerlijke-prijzen/vloerverwarming/', title: 'Vloerverwarming', range: '€45–€85 per m²' },
  { href: '/eerlijke-prijzen/stucwerk/', title: 'Stucwerk wanden', range: '€18–€38 per m²' },
  { href: '/eerlijke-prijzen/schilderwerk/', title: 'Binnenschilderwerk', range: '€12–€28 per m²' },
  { href: '/eerlijke-prijzen/keuken/', title: 'Keuken', range: '€6.000–€20.000 per totaal' },
  { href: '/eerlijke-prijzen/badkamer/', title: 'Badkamer', range: '€7.000–€20.000 per totaal' },
]

const CSS = `
.ep-main *{box-sizing:border-box;}
.ep-main h1,.ep-main h2,.ep-main h3{letter-spacing:-0.02em;color:#1A1208;}
.ep-main a{color:#3D5A3E;}
.ep-main .container{max-width:1180px;margin:0 auto;padding:0 48px;}
.ep-main .badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}
.ep-main .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:36px 0;}
.ep-main .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
.ep-main .faq-item{border-bottom:1px solid rgba(61,46,30,0.08);padding:18px 0;}
.ep-main .faq-item h3{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}
.ep-main .faq-item p{font-size:14px;color:rgba(61,46,30,0.72);line-height:1.7;}
.ep-main .check-list{list-style:none;display:flex;flex-direction:column;gap:10px;padding:0;margin:0;}
.ep-main .check-list li{display:flex;align-items:start;gap:10px;font-size:15px;line-height:1.55;}
.ep-main .check-list li::before{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}
.ep-main .tile{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:14px;padding:16px 18px;transition:border-color .15s;}
.ep-main .tile:hover{border-color:rgba(61,90,62,0.4);}
.ep-main .cta-primary{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}
@media(max-width:768px){.ep-main .container{padding:0 20px;}.ep-main .grid-3{grid-template-columns:1fr;}}
`

export default function EerlijkePrijzenPage() {
  return (
    <main className="ep-main" style={{ padding: '60px 0', background: '#F5F0E8', color: '#3D2E1E', lineHeight: 1.7 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_BREADCRUMB) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_ARTICLE) }} />

      <div className="container">
        <div style={{ maxWidth: 760 }}>
          <div className="badge">Eerlijke prijzen</div>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, lineHeight: 1.14, marginBottom: 14 }}>Betaal je een eerlijke prijs voor je verbouwing?</h1>
          <p style={{ fontSize: '1.12rem', color: 'rgba(61,46,30,0.72)', lineHeight: 1.7, marginBottom: 18 }}>Offerteprijzen lopen sterk uiteen. <strong>96% van de kopers betaalt minstens één post te duur.</strong> Bekijk hieronder de actuele marktbandbreedtes per categorie — en check gratis of jouw prijs marktconform is.</p>
          <a href="https://app.bylder.com/registreer" style={{ display: 'inline-block', background: '#3D5A3E', color: '#F5F0E8', padding: '14px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>Check je prijs gratis →</a>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '44px 0 8px' }}>Marktprijzen per categorie</h2>
        <p style={{ fontSize: 15, color: 'rgba(61,46,30,0.72)', marginBottom: 16 }}>Indicatieve bandbreedtes (laag–hoog), NL 2026.</p>
        <div className="grid-3">
          {TILES.map(t => (
            <a key={t.href} href={t.href} className="tile">
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1208' }}>{t.title}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(61,46,30,0.72)', marginTop: 2 }}>{t.range}</div>
            </a>
          ))}
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '36px 0 12px' }}>Waarom Bylder dit beter doet dan een losse AI</h2>
        <ul className="check-list">
          <li><span><strong>Vergelijkt met échte marktprijzen.</strong> Een losse AI gokt op basis van algemene kennis; Bylder toetst je prijs aan een dataset van werkelijke offertes — en die wordt scherper met elke koper.</span></li>
          <li><span><strong>Kent jouw situatie.</strong> Gekoppeld aan je tekening, meerwerklijst en regio — geen koude losse vraag, maar context.</span></li>
          <li><span><strong>Geeft je een actie.</strong> Niet alleen &ldquo;te duur&rdquo;, maar een onderbouwd onderhandelpunt voor je aannemer.</span></li>
        </ul>

        <div style={{ background: '#3D5A3E', borderRadius: 20, padding: 44, textAlign: 'center', margin: '40px 0' }}>
          <p style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,240,232,0.5)', marginBottom: 10 }}>Bylder Prijs-benchmark</p>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#F5F0E8', marginBottom: 12 }}>Betaal jij een eerlijke prijs?</h2>
          <p style={{ color: 'rgba(245,240,232,0.72)', marginBottom: 26, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', fontSize: 15, lineHeight: 1.65 }}>Vul je geoffreerde prijs in en zie direct of die marktconform is. Met gratis account benchmarkt Bylder je hele offerte of meerwerklijst automatisch — gemiddeld €1.840 bespaard.</p>
          <a href="https://app.bylder.com/registreer" className="cta-primary">Check je prijs gratis →</a>
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '36px 0 12px' }}>Veelgestelde vragen</h2>
        <div className="faq-item"><h3>Hoe weet ik of een offerteprijs eerlijk is?</h3><p>Vergelijk de prijs per eenheid (per m², per punt of totaal) met de marktbandbreedte. Bylder&#x27;s Prijs-benchmark toetst je prijs aan werkelijke marktdata en zegt of die marktconform of te hoog is.</p></div>
        <div className="faq-item"><h3>Kan een gewone AI dit ook?</h3><p>Een losse AI gokt op basis van algemene kennis en mist jouw context. Bylder vergelijkt met een dataset van werkelijke prijzen, kent je tekening en regio, en geeft een concreet onderhandelpunt.</p></div>
        <div className="faq-item"><h3>Zijn deze prijzen exact?</h3><p>Nee, het zijn indicatieve marktbandbreedtes (NL 2026). Ze verschillen per project, regio en afwerking — gebruik ze als ijkpunt, niet als offerte.</p></div>

        <div className="divider"></div>
        <p style={{ fontSize: 14, color: 'rgba(61,46,30,0.72)' }}>Verder: <a href="/meerwerk/">meerwerk bij nieuwbouw</a> · <a href="/nieuwbouw-koper/">nieuwbouw kopen</a> · <a href="/functies/">alle functies</a></p>

        <p style={{ fontSize: 12, color: 'rgba(61,46,30,0.72)', maxWidth: 560, lineHeight: 1.6, marginTop: 32 }}>Prijzen zijn indicatieve marktbandbreedtes en verschillen per project, regio en afwerking. Bylder vergelijkt jouw offerte met de markt voor een eerlijke check per post.</p>
      </div>
    </main>
  )
}
