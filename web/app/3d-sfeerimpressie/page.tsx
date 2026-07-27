import type { Metadata } from 'next'

// Getrouwe port van /3d-sfeerimpressie/index.html (Fase 1B).
// Nav + Footer uit de gedeelde root-layout; de pagina-eigen footer bevatte enkel
// stijl-links die ook in de body-grids en de aside staan → geen inhoud verloren.
// De pagina-specifieke /auping-popup.js (staat óók in de bron) blijft behouden.
// Meta + de 4 JSON-LD-blokken (HowTo/SoftwareApplication/FAQPage/BreadcrumbList)
// zijn 1-op-1 overgenomen.

const OG_TITLE = '3D-sfeerimpressie maken van je plattegrond | Bylder.com'
const OG_DESC =
  "Upload je plattegrond en zie je nieuwe woning in 3D, in 6 interieurstijlen. Zo kies je vol vertrouwen je afwerking en inrichting — vóór je duizenden euro's uitgeeft."

export const metadata: Metadata = {
  title: OG_TITLE,
  description: OG_DESC,
  alternates: { canonical: 'https://www.bylder.com/3d-sfeerimpressie/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    title: OG_TITLE,
    description: OG_DESC,
    url: 'https://www.bylder.com/3d-sfeerimpressie/',
  },
}

const JSONLD_HOWTO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Een 3D-sfeerimpressie van je plattegrond maken',
  step: [
    { '@type': 'HowToStep', name: 'Upload je plattegrond', text: 'Upload je bouwtekening of plattegrond (PDF of afbeelding) in je Bylder-dashboard.' },
    { '@type': 'HowToStep', name: 'Kies een stijl', text: 'Kies uit zes interieurstijlen: Scandinavisch, Japandi, Industrieel, Modern warm, Klassiek of Botanisch.' },
    { '@type': 'HowToStep', name: 'Genereer de impressie', text: "Bylder's AI maakt binnen enkele minuten een 3D-sfeerimpressie van je ruimte in de gekozen stijl." },
    { '@type': 'HowToStep', name: 'Vergelijk en beslis', text: 'Vergelijk stijlen, deel ze en gebruik ze om je afwerking, inrichting en meerwerk te kiezen.' },
  ],
}

const JSONLD_SOFTWARE = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Bylder 3D-sfeerimpressie',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', description: 'Gratis voor bewoners' },
  description:
    "Upload je plattegrond en zie je nieuwe woning in 3D, in 6 interieurstijlen. Zo kies je vol vertrouwen je afwerking en inrichting — vóór je duizenden euro's uitgeeft.",
}

const JSONLD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Wat is een 3D-sfeerimpressie?', acceptedAnswer: { '@type': 'Answer', text: 'Een 3D-sfeerimpressie is een realistische weergave van hoe een ruimte eruit kan zien, gegenereerd uit je plattegrond. Het laat materialen, kleuren en sfeer zien, zodat je je nieuwe woning kunt ervaren vóór de afwerking en inrichting vaststaan.' } },
    { '@type': 'Question', name: 'Hoe maakt Bylder de impressie?', acceptedAnswer: { '@type': 'Answer', text: 'Je uploadt je plattegrond of bouwtekening in je Bylder-dashboard en kiest een van de zes interieurstijlen. De AI genereert binnen enkele minuten een sfeerimpressie van je ruimte in die stijl.' } },
    { '@type': 'Question', name: 'Is het gratis?', acceptedAnswer: { '@type': 'Answer', text: 'Een account aanmaken, je plattegrond uploaden en 3D-sfeerimpressies genereren is gratis voor bewoners: je maakt tot tien impressies per maand, plus kortingen bij 40+ woonmerken activeert.' } },
    { '@type': 'Question', name: 'Vervangt dit een interieurontwerper of bouwtekening?', acceptedAnswer: { '@type': 'Answer', text: 'Nee. Een sfeerimpressie is bedoeld om snel te verkennen, keuzes te maken en te communiceren. Voor een definitief ontwerp of een bouwvergunning blijven een interieurontwerper en gecertificeerde tekeningen nodig.' } },
    { '@type': 'Question', name: 'Voor welke woningen werkt het?', acceptedAnswer: { '@type': 'Answer', text: 'Voor nieuwbouw, bestaande bouw én renovatie. De tool is woningtype-bewust, zodat de impressie aansluit op jouw situatie.' } },
  ],
}

const JSONLD_BREADCRUMB = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Bylder.com', item: 'https://www.bylder.com/' },
    { '@type': 'ListItem', position: 2, name: '3D-sfeerimpressie', item: 'https://www.bylder.com/3d-sfeerimpressie/' },
  ],
}

const STYLES = [
  { href: '/3d-sfeerimpressie/scandinavisch/', name: 'Scandinavisch', sub: 'Licht, luchtig en natuurlijk', sw: ['#F4EFE7', '#D8C3A5', '#A9B7A0', '#2E2A24'] },
  { href: '/3d-sfeerimpressie/japandi/', name: 'Japandi', sub: 'Warm minimalisme met rust', sw: ['#EDE6DA', '#C9A88B', '#8A7B6B', '#3B342B'] },
  { href: '/3d-sfeerimpressie/industrieel/', name: 'Industrieel', sub: 'Stoer met warme accenten', sw: ['#CDC4BA', '#8A8178', '#B5653F', '#2A2723'] },
  { href: '/3d-sfeerimpressie/modern-warm/', name: 'Modern warm', sub: 'Zacht, rond en sfeervol', sw: ['#EFE7DC', '#D9B98C', '#B98A5E', '#2E261F'] },
  { href: '/3d-sfeerimpressie/klassiek/', name: 'Klassiek', sub: 'Tijdloos en verfijnd', sw: ['#ECE4D6', '#C2B79C', '#6E6453', '#2B2823'] },
  { href: '/3d-sfeerimpressie/botanisch/', name: 'Botanisch', sub: 'Groen, fris en organisch', sw: ['#E9E9DC', '#9FB089', '#5E7A4F', '#2C3327'] },
]

const RUIMTES = [
  { href: '/3d-sfeerimpressie/woonkamer/', name: 'Woonkamer', sub: 'Het hart van je huis' },
  { href: '/3d-sfeerimpressie/keuken/', name: 'Keuken', sub: 'Functie én sfeer' },
  { href: '/3d-sfeerimpressie/slaapkamer/', name: 'Slaapkamer', sub: 'Rust en comfort' },
  { href: '/3d-sfeerimpressie/badkamer/', name: 'Badkamer', sub: 'Tegels, sanitair en sfeer' },
  { href: '/3d-sfeerimpressie/kinderkamer/', name: 'Kinderkamer', sub: 'Veilig, fris en flexibel' },
  { href: '/3d-sfeerimpressie/thuiswerkplek/', name: 'Thuiswerkplek', sub: 'Geconcentreerd en comfortabel' },
  { href: '/3d-sfeerimpressie/hal-entree/', name: 'Hal & entree', sub: 'De eerste indruk' },
  { href: '/3d-sfeerimpressie/eetkamer/', name: 'Eetkamer', sub: 'Samenkomen aan tafel' },
]

const WONINGTYPES = [
  { href: '/3d-sfeerimpressie/nieuwbouw/', name: 'Nieuwbouwwoning', sub: 'Kies vóór de bouw klaar is' },
  { href: '/3d-sfeerimpressie/bestaande-bouw/', name: 'Bestaande woning', sub: 'Zie het potentieel' },
  { href: '/3d-sfeerimpressie/renovatie/', name: 'Renovatie & verbouwing', sub: 'Zie het eindresultaat vooraf' },
  { href: '/3d-sfeerimpressie/appartement/', name: 'Appartement', sub: 'Slim met ruimte en licht' },
  { href: '/3d-sfeerimpressie/tussenwoning/', name: 'Tussenwoning', sub: 'Maximale sfeer in een vertrouwd format' },
  { href: '/3d-sfeerimpressie/vrijstaand/', name: 'Vrijstaande woning', sub: 'Ruimte om te ontwerpen' },
]

const GIDSEN = [
  { href: '/3d-sfeerimpressie/plattegrond-naar-3d/', name: 'Plattegrond naar 3D', sub: 'Hoe werkt het?' },
  { href: '/3d-sfeerimpressie/bouwtekening-lezen/', name: 'Bouwtekening lezen', sub: 'Begrijp je tekening' },
  { href: '/3d-sfeerimpressie/2d-naar-3d-plattegrond/', name: 'Van 2D naar 3D', sub: 'Het verschil en de winst' },
  { href: '/3d-sfeerimpressie/interieur-visualiseren-ai/', name: 'Interieur visualiseren met AI', sub: 'Wat kan het wel en niet' },
  { href: '/3d-sfeerimpressie/wat-kost-3d-impressie/', name: 'Wat kost een 3D-impressie?', sub: 'Prijzen en wat je krijgt' },
  { href: '/3d-sfeerimpressie/3d-impressie-vs-render-maquette/', name: '3D-impressie vs. render vs. maquette', sub: 'Welke kies je wanneer' },
  { href: '/3d-sfeerimpressie/sfeerimpressie-maken/', name: 'Sfeerimpressie maken', sub: 'Stappenplan' },
]

const FAQ = [
  ['Wat is een 3D-sfeerimpressie?', 'Een 3D-sfeerimpressie is een realistische weergave van hoe een ruimte eruit kan zien, gegenereerd uit je plattegrond. Het laat materialen, kleuren en sfeer zien, zodat je je nieuwe woning kunt ervaren vóór de afwerking en inrichting vaststaan.'],
  ['Hoe maakt Bylder de impressie?', 'Je uploadt je plattegrond of bouwtekening in je Bylder-dashboard en kiest een van de zes interieurstijlen. De AI genereert binnen enkele minuten een sfeerimpressie van je ruimte in die stijl.'],
  ['Is het gratis?', 'Een account aanmaken, je plattegrond uploaden en 3D-sfeerimpressies genereren is gratis voor bewoners: je maakt tot tien impressies per maand, plus kortingen bij 40+ woonmerken activeert.'],
  ['Vervangt dit een interieurontwerper of bouwtekening?', 'Nee. Een sfeerimpressie is bedoeld om snel te verkennen, keuzes te maken en te communiceren. Voor een definitief ontwerp of een bouwvergunning blijven een interieurontwerper en gecertificeerde tekeningen nodig.'],
  ['Voor welke woningen werkt het?', 'Voor nieuwbouw, bestaande bouw én renovatie. De tool is woningtype-bewust, zodat de impressie aansluit op jouw situatie.'],
]

const CSS = `
.sf-main *{box-sizing:border-box;}
.sf-main h1,.sf-main h2,.sf-main h3{letter-spacing:-0.02em;color:#1A1208;}
.sf-main a{color:#3D5A3E;}
.sf-main .container{max-width:1280px;margin:0 auto;padding:0 48px;}
.sf-main .badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;background:rgba(61,90,62,0.1);border:1px solid rgba(61,90,62,0.2);color:#3D5A3E;font-size:11px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;}
.sf-main .card{background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:24px;}
.sf-main .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(200,184,154,0.5),transparent);margin:40px 0;}
.sf-main .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.sf-main .highlight{background:rgba(61,90,62,0.06);border-left:3px solid #3D5A3E;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;}
.sf-main .check-list{list-style:none;display:flex;flex-direction:column;gap:10px;padding:0;margin:0;}
.sf-main .check-list li{display:flex;align-items:start;gap:10px;font-size:15px;}
.sf-main .check-list li::before{content:'✓';color:#3D5A3E;font-weight:700;flex-shrink:0;margin-top:2px;}
.sf-main .faq-item{border-bottom:1px solid rgba(61,46,30,0.08);padding:20px 0;}
.sf-main .faq-item h3{font-size:16px;font-weight:700;margin-bottom:8px;color:#1A1208;}
.sf-main .faq-item p{font-size:14px;color:rgba(61,46,30,0.72);line-height:1.7;}
.sf-main .swatches{display:flex;gap:0;border-radius:10px;overflow:hidden;height:64px;margin-bottom:16px;border:1px solid rgba(61,46,30,0.1);}
.sf-main .swatches span{flex:1;}
.sf-main .style-tile{display:block;text-decoration:none;color:inherit;background:#fff;border:1px solid rgba(61,46,30,0.1);border-radius:16px;padding:18px;transition:border-color .15s;}
.sf-main .style-tile:hover{border-color:rgba(61,90,62,0.4);}
.sf-main .cta-primary{display:inline-block;background:#F5F0E8;color:#3D5A3E;padding:14px 28px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;}
@media(max-width:768px){.sf-main .container{padding:0 20px;}.sf-main .grid-3{grid-template-columns:1fr;}.sf-main .hero-grid{grid-template-columns:1fr!important;gap:32px!important;}.sf-main aside{position:static!important;}}
`

function Tile({ href, name, sub }: { href: string; name: string; sub: string }) {
  return (
    <a href={href} className="style-tile">
      <div style={{ fontWeight: 700, fontSize: 15, color: '#1A1208', marginBottom: 2 }}>{name}</div>
      <div style={{ fontSize: 13, color: 'rgba(61,46,30,0.55)' }}>{sub}</div>
    </a>
  )
}

export default function SfeerimpressiePage() {
  return (
    <main className="sf-main" style={{ padding: '64px 0', background: '#F5F0E8', color: '#3D2E1E', lineHeight: 1.7 }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_HOWTO) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_SOFTWARE) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_BREADCRUMB) }} />

      <div className="container">
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 64, alignItems: 'start' }}>
          <article>
            <p style={{ fontSize: 13, color: 'rgba(61,46,30,0.4)', marginBottom: 32 }}><a href="/" style={{ color: 'rgba(61,46,30,0.4)', textDecoration: 'none' }}>Bylder.com</a> → <span style={{ color: 'rgba(61,46,30,0.6)' }}>3D-sfeerimpressie</span></p>
            <div className="badge">AI-visualisatie</div>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.15 }}>3D-sfeerimpressie van je plattegrond</h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(61,46,30,0.5)', marginBottom: 8, fontStyle: 'italic' }}>Zie hoe je nieuwe woning wordt — vóór je kiest, koopt en afwerkt</p>
            <div className="divider"></div>
            <p style={{ fontSize: '1.05rem', color: 'rgba(61,46,30,0.7)', marginBottom: 16, lineHeight: 1.8 }}>Een nieuwbouw- of verbouwwoning koop je op basis van een plattegrond — een platte tekening waarop moeilijk te zien is hoe het écht wordt. Toch maak je juist dán keuzes van tienduizenden euro's: vloeren, keuken, kleuren, inrichting. Bylder zet je plattegrond om in een realistische <strong>3D-sfeerimpressie</strong>, zodat je je woning kunt ervaren en met vertrouwen beslist.</p>
            <p style={{ fontSize: '1.05rem', color: 'rgba(61,46,30,0.7)', marginBottom: 8, lineHeight: 1.8 }}>Je kiest uit zes interieurstijlen en ziet binnen enkele minuten hoe je ruimte eruit kan zien. Vergelijk stijlen naast elkaar, ontdek wat bij je past en gebruik de beelden om af te stemmen met je partner, aannemer of leverancier.</p>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Kies je stijl</h2>
            <p style={{ fontSize: 15, color: 'rgba(61,46,30,0.65)', marginBottom: 18 }}>Elke stijl heeft een eigen materiaal- en kleurenpalet. Bekijk per stijl hoe je woonkamer, keuken en slaapkamer eruit kunnen zien.</p>
            <div className="grid-3" style={{ marginBottom: 8 }}>
              {STYLES.map(s => (
                <a key={s.href} href={s.href} className="style-tile">
                  <div className="swatches" aria-hidden="true">{s.sw.map((c, i) => <span key={i} style={{ background: c }}></span>)}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1A1208', marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'rgba(61,46,30,0.55)' }}>{s.sub}</div>
                </a>
              ))}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Per ruimte</h2>
            <div className="grid-3">{RUIMTES.map(t => <Tile key={t.href} {...t} />)}</div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Per woningtype</h2>
            <div className="grid-3">{WONINGTYPES.map(t => <Tile key={t.href} {...t} />)}</div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Gidsen & uitleg</h2>
            <div className="grid-3">{GIDSEN.map(t => <Tile key={t.href} {...t} />)}</div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Zo werkt het — in 4 stappen</h2>
            <ol style={{ listStyle: 'decimal', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 15 }}>
              <li><strong>Upload je plattegrond.</strong> Een bouwtekening of plattegrond als PDF of foto, direct in je Bylder-dashboard.</li>
              <li><strong>Kies een stijl.</strong> Scandinavisch, Japandi, Industrieel, Modern warm, Klassiek of Botanisch.</li>
              <li><strong>Genereer de impressie.</strong> De AI maakt binnen enkele minuten een 3D-sfeerimpressie van je ruimte.</li>
              <li><strong>Vergelijk en beslis.</strong> Zet stijlen naast elkaar en gebruik ze voor je afwerking, inrichting en meerwerkkeuzes.</li>
            </ol>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Wat je ermee wint</h2>
            <ul className="check-list">
              <li><span><strong>Betere keuzes.</strong> Zie het effect van een vloer, kleur of stijl vóórdat je tekent bij de leverancier.</span></li>
              <li><span><strong>Minder spijt en meerwerk.</strong> Twijfel je tussen opties? Visualiseer beide en kies bewust.</span></li>
              <li><span><strong>Makkelijker afstemmen.</strong> Eén beeld zegt meer dan tien gesprekken met je partner of aannemer.</span></li>
              <li><span><strong>Direct gekoppeld aan voordeel.</strong> Vanuit je impressie activeer je kortingen bij 40+ woonmerken.</span></li>
            </ul>

            <div className="highlight"><strong>Voor nieuwbouw, bestaande bouw én renovatie.</strong> De tool is woningtype-bewust: of je nu een nieuwbouwwoning afwerkt of een bestaande woning verbouwt, de impressie sluit aan op jouw situatie.</div>

            <div style={{ background: '#3D5A3E', borderRadius: 20, padding: 48, textAlign: 'center', margin: '48px 0' }}>
              <p style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,240,232,0.5)', marginBottom: 10 }}>Gratis voor bewoners · tot tien impressies per maand</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F5F0E8', marginBottom: 12 }}>Zie je nieuwe woning vóór je een euro uitgeeft</h2>
              <p style={{ color: 'rgba(245,240,232,0.7)', marginBottom: 28, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto', fontSize: 15 }}>Maak gratis een account aan en upload je plattegrond. Je genereert tot 10 3D-sfeerimpressies per maand in elke stijl — en activeer je kortingen bij 40+ woonmerken.</p>
              <a href="https://app.bylder.com/registreer" className="cta-primary">Start gratis →</a>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Eerlijk over wat het wél en niet is</h2>
            <p style={{ fontSize: 15, color: 'rgba(61,46,30,0.7)', lineHeight: 1.8, marginBottom: 8 }}>Een 3D-sfeerimpressie is een <em>verkenningstool</em>: hij laat sfeer, materialen en kleurrichting zien en helpt je sneller en bewuster kiezen. Het is geen exacte maatvoering en vervangt geen interieurontwerper of gecertificeerde bouwtekening. Voor een definitief ontwerp of een vergunning blijf je bij een professional. De kracht zit in het verkennen: in minuten zie je richtingen die anders pas op de bouwplaats duidelijk worden.</p>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '40px 0 14px' }}>Veelgestelde vragen</h2>
            {FAQ.map(([q, a]) => (
              <div key={q} className="faq-item"><h3>{q}</h3><p>{a}</p></div>
            ))}

            <div className="divider"></div>
            <p style={{ fontSize: 14, color: 'rgba(61,46,30,0.6)' }}>Verder lezen: <a href="/ai-plattegrond-maken-3d/">plattegrond maken (2D naar 3D)</a> · <a href="/nieuwbouw-tools/">gratis nieuwbouw-tools</a> · <a href="/functies/">alle functies van Bylder</a></p>
          </article>

          <aside style={{ position: 'sticky', top: 100 }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>Probeer de tool</p>
              <p style={{ fontSize: 13, color: 'rgba(61,46,30,0.55)', marginBottom: 16, lineHeight: 1.6 }}>Maak gratis een account en upload je plattegrond. Gratis voor bewoners: tot 10 impressies per maand.</p>
              <a href="https://app.bylder.com/registreer" style={{ display: 'block', textAlign: 'center', background: '#3D5A3E', color: '#F5F0E8', padding: 11, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Start gratis →</a>
            </div>
            <div className="card" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 12 }}>De 6 stijlen</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/3d-sfeerimpressie/scandinavisch/" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }}>Scandinavisch — licht, luchtig en natuurlijk</a>
                <a href="/3d-sfeerimpressie/japandi/" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }}>Japandi — warm minimalisme met rust</a>
                <a href="/3d-sfeerimpressie/industrieel/" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }}>Industrieel — stoer met warme accenten</a>
                <a href="/3d-sfeerimpressie/modern-warm/" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }}>Modern warm — zacht, rond en sfeervol</a>
                <a href="/3d-sfeerimpressie/klassiek/" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }}>Klassiek — tijdloos en verfijnd</a>
                <a href="/3d-sfeerimpressie/botanisch/" style={{ fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }}>Botanisch — groen, fris en organisch</a>
              </div>
            </div>
            <div className="card">
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1208', marginBottom: 8 }}>10% korting bij 40+ merken</p>
              <p style={{ fontSize: 13, color: 'rgba(61,46,30,0.55)', marginBottom: 16, lineHeight: 1.6 }}>Auping, Goossens en meer — gekoppeld aan je woning.</p>
              <a href="/#vouchers" style={{ display: 'block', textAlign: 'center', background: '#F5F0E8', color: '#3D5A3E', border: '1.5px solid rgba(61,90,62,0.3)', padding: 11, borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Vouchers bekijken →</a>
            </div>
          </aside>
        </div>
      </div>

      <script src="/auping-popup.js"></script>
    </main>
  )
}
