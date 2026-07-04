import type { Metadata } from 'next'
import VoucherFaq from './VoucherFaq'

// Getrouwe port van /vouchers/index.html (Fase 1B).
// Nav + Footer uit de gedeelde root-layout; de pagina-eigen mini-footer wordt
// vervangen (die links zitten in de gedeelde Footer). De FAQ-accordion is een
// kleine 'use client'-component; de pagina-specifieke /auping-popup.js blijft.
// Phosphor-iconfonts worden meegeladen zoals in de bron (een aantal voucher-
// tegels leunt erop). Meta (incl. og/twitter/robots) + JSON-LD 1-op-1 over.

const OG_TITLE = 'Kortingsvouchers nieuwbouw — 10% bij 40+ woonmerken | Bylder'
const DESC =
  'Exclusieve kortingsvouchers voor kopers van een nieuwbouwwoning. 10% korting bij Auping, DRT Contemporary, Goossens, Tables by Tim, Whoon en 35+ andere merken. Gratis voor Bylder leden.'

export const metadata: Metadata = {
  title: OG_TITLE,
  description: DESC,
  authors: [{ name: 'Bylder Nederland B.V.' }],
  alternates: { canonical: 'https://www.bylder.com/vouchers/' },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: OG_TITLE,
    description:
      'Exclusieve kortingsvouchers voor kopers van een nieuwbouwwoning. 10% korting bij Auping, DRT Contemporary, Goossens en meer.',
    url: 'https://www.bylder.com/vouchers/',
    locale: 'nl_NL',
    images: [{ url: 'https://www.bylder.com/og-image.jpg?v=2' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kortingsvouchers wonen — Auping, Goossens, DRT & 40+ merken | Bylder',
    description: 'Exclusieve kortingen voor nieuwbouw- en renovatiekopers. Gemiddeld €2.549 bespaard. Eenmalig €99.',
  },
}

const JSONLD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Welke kortingen krijg ik als Bylder-lid bij Auping?', acceptedAnswer: { '@type': 'Answer', text: 'Bylder-leden ontvangen 10% korting bij Auping Rotterdam Centrum, Den Haag Centrum en Zoetermeer. Exclusief inbegrepen: gratis leenbed tijdens de levertijd van je bestelling. De korting is geldig op het volledige assortiment boxsprings, matrassen en bedframes.' } },
    { '@type': 'Question', name: 'Zijn de Bylder vouchers ook geldig voor bestaande bouw en renovatie?', acceptedAnswer: { '@type': 'Answer', text: 'Ja. Alle Bylder kortingsvouchers zijn geldig voor zowel nieuwbouwkopers als kopers van bestaande woningen en renovatieprojecten. Met één lidmaatschap van €99 activeer je alle vouchers.' } },
    { '@type': 'Question', name: 'Wat is de gemiddelde besparing via Bylder vouchers?', acceptedAnswer: { '@type': 'Answer', text: 'Bylder-leden besparen gemiddeld €2.549 via kortingsvouchers bij 40+ partnermerken. De grootste besparingen komen van Parketgigant (25% op parket/laminaat), Lampenlicht (20% op verlichting), De Bossche Tapijtschuur (15% op raamdecoratie) en Auping (10% op bedden).' } },
  ],
}

type Voucher = {
  brand: string
  cat: string
  discount: string
  desc: string
  logo?: string
  alt?: string
  icon?: string
}

const SECTIE_1: Voucher[] = [
  { brand: 'Auping', cat: 'Slaapkamer & matrassen', discount: '10%', desc: 'Geldig bij Auping Rotterdam Centrum, Den Haag Centrum en Zoetermeer. Inclusief gratis leenbed tijdens levertijd.', logo: '/img/voucher-logos/auping-nl.png', alt: 'Auping logo' },
  { brand: 'Goossens Den Bosch', cat: 'Meubelen & wonen', discount: '10%', desc: 'Winkelkorting + gratis 2D woonadviesdienst. Op alle banken, tafels, kasten en woonaccessoires.', logo: '/img/voucher-logos/goossenswonen-nl.svg', alt: 'Goossens Den Bosch logo' },
  { brand: 'Tylko', cat: 'Maatwerk kasten', discount: '€250', desc: '€250 korting bij besteding vanaf €800. Op maatwerk kasten, wandmeubels en boekenkasten.', icon: 'ph-thin ph-armchair' },
  { brand: 'Tables by Tim', cat: 'Maatwerk eettafels', discount: '€125', desc: '€125 korting op handgemaakte eettafels van massief eiken en walnoot. Gratis opmeetafspraak inbegrepen.', logo: '/img/voucher-logos/tablesbytim-nl.png', alt: 'Tables by Tim logo' },
  { brand: 'HelloChair', cat: 'Ergonomische stoelen', discount: '10–15%', desc: '10% korting webshop, 15% in de winkel. Op alle ergonomische bureaustoelen en loungestoelen.', logo: '/img/voucher-logos/hellochair-nl.png', alt: 'HelloChair logo' },
  { brand: 'Kave Home', cat: 'Design meubelen', discount: '10%', desc: 'Op het volledige online assortiment van Kave Home. Moderne design meubels voor elke kamer.', icon: 'ph-thin ph-house' },
]

const SECTIE_2: Voucher[] = [
  { brand: 'DRT Contemporary', cat: 'Gietvloer & PVC vloeren', discount: '10%', desc: 'Op gietvloeren en premium PVC-vloeren bij DRT Den Bosch. Inclusief gratis opmeting aan huis.', logo: '/img/voucher-logos/drtgietvloeren-nl.svg', alt: 'DRT Contemporary logo' },
  { brand: 'Parketgigant Zaandam', cat: 'Parket & laminaat', discount: '25%', desc: '25% korting op parket en laminaat. Grootste assortiment van Nederland inclusief legservice.', logo: '/img/voucher-logos/parketgigant-nl.png', alt: 'Parketgigant Zaandam logo' },
  { brand: 'Graham & Brown', cat: 'Behang & verf', discount: '10%', desc: 'Op het volledige behang en verf assortiment. Inclusief gratis stalenservice aan huis.', logo: '/img/voucher-logos/grahambrown-com.ico', alt: 'Graham & Brown logo' },
  { brand: 'Super-stuc.nl', cat: 'Stucwerk materialen', discount: '€1/m²', desc: '€1,- korting per m² op stucwerkmaterialen. Direct te bestellen online, levertijd 2-3 werkdagen.', logo: '/img/voucher-logos/super-stuc-nl.png', alt: 'Super-stuc.nl logo' },
  { brand: 'Solza', cat: 'Vloeren online', discount: '10%', desc: 'Op laminaat, pvc en vinyl vloeren. Groot online assortiment met snelle levering.', logo: '/img/voucher-logos/solza-nl.png', alt: 'Solza logo' },
  { brand: 'Laminaatpaleis Ede', cat: 'Laminaat & vinyl', discount: 'Gratis legservice', desc: 'Gratis plakservice bij aankoop van laminaat of vinyl vloer. Geldig in de winkel Ede.', logo: '/img/voucher-logos/laminaatpaleis-nl.png', alt: 'Laminaatpaleis Ede logo' },
]

const SECTIE_3: Voucher[] = [
  { brand: 'Sanitairwinkel', cat: 'Sanitair online & showroom', discount: '5–10%', desc: '5% korting webshop, 10% in de winkel Rosmalen. Op alle sanitair, douches en badkamers.', icon: 'ph-thin ph-shower' },
  { brand: 'De Bossche Tapijtschuur', cat: 'Raamdecoratie & gordijnen', discount: '15%', desc: 'Op het volledige assortiment gordijnen, vitrages en raamdecoratie. Den Bosch showroom.', icon: 'ph-thin ph-app-window' },
  { brand: 'Lampenlicht Breda/Eindhoven', cat: 'Verlichting', discount: '10%', desc: '20% korting op het volledige verlichtingsassortiment in de winkels Breda en Eindhoven.', icon: 'ph-thin ph-lightbulb' },
  { brand: 'Topdeuren Veldhoven', cat: 'Binnendeuren', discount: '10%', desc: 'Op alle binnendeuren, kozijnen en deurbeslag. Showroom in Veldhoven, ook online te bestellen.', logo: '/img/voucher-logos/topdeuren-nl.png', alt: 'Topdeuren Veldhoven logo' },
  { brand: 'Debouwmarktshop.nl', cat: 'Bouwmaterialen online', discount: '3–15%', desc: '3% op bouwmaterialen, 5% op deuren/gevels, 15% op vloeren/tegels. Groot online assortiment.', logo: '/img/voucher-logos/debouwmarktshop-nl.png', alt: 'Debouwmarktshop.nl logo' },
  { brand: 'Eduard Strang Verhuizingen', cat: 'Verhuisservice', discount: '10 gratis dozen', desc: '10 gratis verhuisdozen + gratis inboedelverzekering tijdens de verhuizing. Noord-Nederland.', logo: '/img/voucher-logos/strang-nl.jpg', alt: 'Eduard Strang Verhuizingen logo' },
]

const LOGO_ICON_STYLE: React.CSSProperties = { background: '#fff', border: '1px solid rgba(61,46,30,.1)', padding: 6 }

function VoucherCard({ v }: { v: Voucher }) {
  return (
    <div className="voucher-card">
      <div className="voucher-top">
        <div className="voucher-icon" style={v.logo ? LOGO_ICON_STYLE : undefined}>
          {v.logo ? (
            <img src={v.logo} alt={v.alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} loading="lazy" />
          ) : (
            <i className={v.icon}></i>
          )}
        </div>
        <div>
          <div className="voucher-brand">{v.brand}</div>
          <div className="voucher-cat">{v.cat}</div>
        </div>
      </div>
      <div className="voucher-discount">{v.discount}</div>
      <div className="voucher-desc">{v.desc}</div>
      <div className="voucher-footer">
        <span className="voucher-validity">t/m 31 dec 2026</span>
        <a href="/betalen/" className="voucher-btn">Activeren</a>
      </div>
    </div>
  )
}

const CSS = `
.vc-main{
  --cream:#F5F0E8;--cream-2:#EDE6D8;
  --bark:#1A1208;--bark-2:#3D2E1E;--bark-3:rgba(61,46,30,0.5);
  --moss:#3D5A3E;--moss-2:#4E7350;
  --rust:#B85C38;--gold:#C9A84C;
  --white:#fff;--border:rgba(61,46,30,0.1);
  background:var(--cream);color:var(--bark-2);line-height:1.65;
}
.vc-main *,.vc-main *::before,.vc-main *::after{box-sizing:border-box;}
.vc-main .container{max-width:1060px;margin:0 auto;padding:0 5%}
.vc-main .section{padding:80px 0}
.vc-main .s-label{font-size:11px;font-family:"Space Mono",monospace;text-transform:uppercase;letter-spacing:0.12em;color:var(--moss);font-weight:700;margin-bottom:10px}
.vc-main .s-title{font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:var(--bark);letter-spacing:-0.03em;line-height:1.1;margin-bottom:14px}
.vc-main .s-sub{font-size:17px;color:var(--bark-3);line-height:1.65;max-width:580px}
.vc-main .hero{padding:120px 0 72px;text-align:center}
.vc-main .hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);color:var(--gold);padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;font-family:"Space Mono",monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px}
.vc-main .hero h1{font-size:clamp(2rem,4vw,3.2rem);font-weight:800;color:var(--bark);letter-spacing:-0.03em;line-height:1.1;margin-bottom:16px}
.vc-main .hero h1 em{color:var(--moss);font-style:normal}
.vc-main .hero-sub{font-size:17px;color:var(--bark-3);max-width:560px;margin:0 auto 40px;line-height:1.65}
.vc-main .hero-stats{display:flex;justify-content:center;gap:48px;flex-wrap:wrap;padding:32px 0;border-top:1px solid var(--border)}
.vc-main .stat-val{font-size:2.2rem;font-weight:800;color:var(--bark);letter-spacing:-0.03em;font-family:"Space Mono",monospace;line-height:1}
.vc-main .stat-lbl{font-size:12px;color:var(--bark-3);margin-top:4px}
.vc-main .vouchers-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.vc-main .voucher-card{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:12px;transition:box-shadow 0.2s}
.vc-main .voucher-card:hover{box-shadow:0 8px 32px rgba(61,46,30,0.1)}
.vc-main .voucher-top{display:flex;align-items:center;gap:12px}
.vc-main .voucher-icon{width:48px;height:48px;border-radius:12px;background:var(--cream-2);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.vc-main .voucher-brand{font-size:15px;font-weight:800;color:var(--bark)}
.vc-main .voucher-cat{font-size:11px;color:var(--bark-3);margin-top:2px}
.vc-main .voucher-discount{font-size:2rem;font-weight:800;color:var(--moss);letter-spacing:-0.02em;font-family:"Space Mono",monospace}
.vc-main .voucher-desc{font-size:13px;color:var(--bark-2);line-height:1.6;flex:1}
.vc-main .voucher-footer{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border);margin-top:auto}
.vc-main .voucher-validity{font-size:11px;color:var(--bark-3)}
.vc-main .voucher-btn{background:var(--moss);color:var(--cream);border:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;text-decoration:none;transition:background 0.15s}
.vc-main .voucher-btn:hover{background:var(--moss-2)}
.vc-main .how-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:40px}
.vc-main .how-card{background:var(--white);border:1px solid var(--border);border-radius:16px;padding:28px 24px;text-align:center}
.vc-main .how-num{width:40px;height:40px;background:var(--moss);color:var(--cream);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;font-family:"Space Mono",monospace;margin:0 auto 16px}
.vc-main .how-title{font-size:16px;font-weight:800;color:var(--bark);margin-bottom:8px;letter-spacing:-0.01em}
.vc-main .how-desc{font-size:14px;color:var(--bark-2);line-height:1.6}
.vc-main .faq-list{max-width:720px;margin:40px auto 0}
.vc-main .faq-item{border-bottom:1px solid var(--border)}
.vc-main .faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;padding:18px 0;font-size:15px;font-weight:700;color:var(--bark);background:none;border:none;cursor:pointer;text-align:left;font-family:"Plus Jakarta Sans",sans-serif;gap:16px}
.vc-main .faq-q:hover{color:var(--moss)}
.vc-main .faq-icon{font-size:18px;flex-shrink:0;transition:transform 0.2s}
.vc-main .faq-a{display:none;padding:0 0 18px;font-size:14px;color:var(--bark-2);line-height:1.7}
.vc-main .faq-item.open .faq-icon{transform:rotate(45deg)}
.vc-main .faq-item.open .faq-a{display:block}
.vc-main .cta-section{background:var(--bark);padding:80px 0;text-align:center}
.vc-main .cta-section h2{font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;color:var(--cream);letter-spacing:-0.03em;margin-bottom:14px}
.vc-main .cta-section p{font-size:16px;color:rgba(245,240,232,0.55);max-width:480px;margin:0 auto 32px;line-height:1.65}
.vc-main .btn-primary{background:var(--moss);color:var(--cream);padding:14px 32px;border-radius:12px;font-size:16px;font-weight:800;font-family:"Plus Jakarta Sans",sans-serif;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all 0.2s;border:none;cursor:pointer}
.vc-main .btn-primary:hover{background:var(--moss-2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(61,90,62,0.3)}
@media(max-width:900px){.vc-main .vouchers-grid{grid-template-columns:repeat(2,1fr)}.vc-main .how-grid{grid-template-columns:1fr}}
@media(max-width:540px){.vc-main .vouchers-grid{grid-template-columns:1fr}.vc-main .hero-stats{gap:24px}}
`

export default function VouchersPage() {
  return (
    <div className="vc-main">
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" />
      <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }} />

      <section className="hero">
        <div className="container">
          <div className="hero-badge"><i className="ph-thin ph-tag"></i> Exclusieve kortingen</div>
          <h1>Bespaar <em>gemiddeld €4.200</em><br />op je inrichting &amp; verbouwing</h1>
          <p className="hero-sub">Exclusieve kortingsvouchers bij 40+ woonmerken — direct actief na je Bylder lidmaatschap. Eenmalig €99.</p>
          <a href="/betalen/" className="btn-primary" style={{ margin: '0 auto 40px', display: 'inline-flex' }}>Vouchers activeren voor €99 →</a>
          <div className="hero-stats">
            <div><div className="stat-val">€4.200</div><div className="stat-lbl">Gem. besparing per lid</div></div>
            <div><div className="stat-val">40+</div><div className="stat-lbl">Partnermerken</div></div>
            <div><div className="stat-val">12.400+</div><div className="stat-lbl">Actieve leden</div></div>
            <div><div className="stat-val">€99</div><div className="stat-lbl">Eenmalig lidmaatschap</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)', paddingTop: 0 }}>
        <div className="container">
          <div className="s-label">Slaap &amp; Meubelen</div>
          <h2 className="s-title">Slaapkamer, meubels &amp; wonen</h2>
          <div className="vouchers-grid">{SECTIE_1.map(v => <VoucherCard key={v.brand} v={v} />)}</div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--cream-2)' }}>
        <div className="container">
          <div className="s-label">Vloeren &amp; Wandafwerking</div>
          <h2 className="s-title">Vloeren, tegels &amp; stucwerk</h2>
          <div className="vouchers-grid">{SECTIE_2.map(v => <VoucherCard key={v.brand} v={v} />)}</div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div className="s-label">Sanitair &amp; Raamdecoratie</div>
          <h2 className="s-title">Badkamer, keuken &amp; raamdecoratie</h2>
          <div className="vouchers-grid">{SECTIE_3.map(v => <VoucherCard key={v.brand} v={v} />)}</div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--cream-2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 0 }}>
            <div className="s-label" style={{ textAlign: 'center' }}>Hoe werkt het</div>
            <h2 className="s-title" style={{ textAlign: 'center', maxWidth: '100%' }}>Vouchers activeren in 3 stappen</h2>
          </div>
          <div className="how-grid">
            <div className="how-card"><div className="how-num">1</div><div className="how-title">Word Bylder lid</div><div className="how-desc">Betaal eenmalig €99. Geen abonnement, geen automatische verlengingen. Direct toegang tot alle vouchers.</div></div>
            <div className="how-card"><div className="how-num">2</div><div className="how-title">Activeer je voucher</div><div className="how-desc">Log in op app.bylder.com, kies het gewenste merk en klik activeren. Je kortingscode arriveert direct per e-mail.</div></div>
            <div className="how-card"><div className="how-num">3</div><div className="how-title">Bespaar direct</div><div className="how-desc">Gebruik de code online of laat hem zien in de winkel. De korting wordt direct verwerkt bij het afrekenen.</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}><div className="s-label">Vragen</div><h2 className="s-title">Veelgestelde vragen over vouchers</h2></div>
          <VoucherFaq />
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Activeer alle 40+ vouchers</h2>
          <p>Eenmalig €99. Direct toegang tot alle kortingsvouchers én de AI-kopersbegeleider.</p>
          <a href="/betalen/" className="btn-primary">Activeer mijn vouchers →</a>
          <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(245,240,232,0.35)', fontFamily: "'Space Mono',monospace" }}><i className="ph-thin ph-star"></i> 4.8/5 · 12.400+ leden · 14 dagen geld-terug garantie</div>
        </div>
      </section>

      <script src="/auping-popup.js"></script>
    </div>
  )
}
