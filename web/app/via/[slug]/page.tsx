import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AANBRENGERS } from '../aanbrengers'
import RefVastleggen from './RefVastleggen'
import { KLEUREN } from '../../components/gietvloer/gegevens'
import { VANAF, euroRond } from '../../kozijnloze-deuren/configurator/prijs'

/**
 * De pagina achter de link en QR-code van een vakman (11-10-2026). Scenario: hij staat op
 * de kijkdag bij een koper en zegt "zoek je nog deuren, een gietvloer of een kast op maat?
 * Via mijn link krijg je korting." Alles wat de koper daarna aanvraagt, hoort bij hem.
 *
 * KORTING (Daniel, 11-10-2026): 10% op de orderwaarde voor deuren, gietvloer en kast op
 * maat; Auping via zijn eigen voucher (10% op het reguliere assortiment, niet bovenop een
 * actie). De verrekening tussen partner, Bylder en vakman volgt later.
 *
 * EERLIJK OVER DE VERGOEDING: een aanbeveling met een financieel belang zeggen we erbij.
 * Dat is wat de Reclamecode vraagt, en het past bij hoe Bylder werkt.
 *
 * WIE MAAKT DE OFFERTE (11-11-2026): dat verschilt per product en staat per kaart. Deuren: Bylder (sinds 3-11-2026).
 * Gietvloer: een verwerker uit het netwerk. Kast: een timmerbedrijf uit het netwerk. Auping: de winkel, met de code.
 * De winkel (vaste prijzen, geen aanbrengkorting) en de afwerking door Bylder staan hier bewust niet op.
 *
 * OPTIMALISATIE (11-11-2026, verzoek Daniel): voor nieuwbouw én bestaande bouw; bovenaan wie de vakman is, wat de klant
 * krijgt en één hoofdknop naar de eigen woning in 3D in de app (met ?ref=, zodat de aanbrenger bewaard blijft, ook na het
 * inloggen); een voorbeeld zonder account; delen met je partner via WhatsApp; een voorvertoning (Open Graph) voor als de
 * vakman de link zelf via WhatsApp deelt. Klikken gemeten met data-meet (GA4 afwerk_klik, plek via-...).
 *
 * Geen zoekpagina (noindex): hij is persoonlijk en hoort niet in Google.
 */

export const dynamicParams = false
export function generateStaticParams() { return AANBRENGERS.map(a => ({ slug: a.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const a = AANBRENGERS.find(x => x.slug === slug)
  if (!a) return {}
  return {
    title: `Aanbevolen door ${a.naam}, ${a.bedrijf} | Bylder`,
    description: `${a.naam} regelt 10% korting op deuren zonder kozijn, een gietvloer en een kast op maat. Zie ze eerst in je eigen woning in 3D.`,
    robots: { index: false, follow: false },
    // De voorvertoning als de vakman de link via WhatsApp of mail deelt.
    openGraph: { type: 'website', url: `https://www.bylder.com/via/${a.slug}/`, siteName: 'Bylder',
      title: `10% korting via ${a.naam.split(' ')[0]} van ${a.bedrijf}`,
      description: 'Deuren zonder kozijn, gietvloer en kast op maat. Gratis ontwerpen in je eigen woning in 3D.',
      images: [{ url: 'https://www.bylder.com/img/voorbeeldwoning-3d.webp', width: 1200, height: 712, alt: 'Een woning in 3D met gekozen vloer en deuren' }] },
    alternates: { canonical: `https://www.bylder.com/via/${a.slug}/` },
  }
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.7, color: `${INKT}0.78)`, margin: '0 0 12px', maxWidth: '64ch' }
const LABEL: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: ROEST, fontWeight: 700 }

// Beeld per product (verzoek Daniel, 20-10-2026): de koper ziet meteen wat hij krijgt en van
// welk merk. Deuren en Auping met foto en logo; de gietvloer met kleurvlakken en de kast met
// het 3D-beeld uit de ontwerper, zonder merk: daar kiest de koper zelf de maker.
type Product = { naam: string; korting: string; wat: string; href: string; knop: string; moment: string; img?: string; sm?: string; alt?: string; logo?: [string, string, number]; kleuren?: boolean; door?: string; offerte: string }
const PRODUCTEN: Product[] = [
  { naam: 'Deuren zonder kozijn', korting: '10% korting', wat: 'Plafondhoge deuren die vlak in de wand liggen, zonder kozijn of architraaf. Stel ze samen in 3D.', href: '/kozijnloze-deuren/configurator/', knop: 'Stel je deuren samen', moment: `Vanaf ${euroRond(VANAF)} per deur vóór korting · kies vóór de stukadoor komt`, offerte: 'Bylder maakt je offerte en is je aanspreekpunt',
    img: '/img/classic-next/deur-eiken-fineer.jpg', sm: '/img/classic-next/deur-eiken-fineer-sm.jpg 600w, /img/classic-next/deur-eiken-fineer.jpg 800w', alt: 'Plafondhoge binnendeur in eikenfineer, vlak in een witte wand', logo: ['/img/logos/classic-next.png', 'Classic Next', 18] },
  { naam: 'Gietvloer', korting: '10% korting', wat: 'Upload een foto van een vloer die je mooi vindt; we zoeken de kleur en rekenen je ruimtes uit. Tot drie stalen gratis.', href: '/gietvloer/ontwerpen/', knop: 'Ontwerp je gietvloer', moment: 'Kies voordat de vloer gelegd wordt', kleuren: true, door: 'Gelegd door een verwerker', offerte: 'Offerte van een verwerker bij jou in de buurt' },
  { naam: 'Kast op maat', korting: '10% korting', wat: 'Laat een foto zien van een kast die je mooi vindt en wijs aan waar hij komt. Je ziet hem in 3D, met maten.', href: '/kasten-op-maat/ontwerpen/', knop: 'Ontwerp je kast', moment: 'Gratis inmeten na de oplevering', offerte: 'Offerte van een timmerbedrijf uit ons netwerk',
    img: '/img/kasten/hoekkast-3d-sm.jpg', sm: '/img/kasten/hoekkast-3d-sm.jpg 600w, /img/kasten/hoekkast-3d.jpg 1200w', alt: 'Hoekkast op maat in 3D, uit de kastontwerper van Bylder', door: 'Gemaakt door een timmerbedrijf' },
  { naam: 'Auping bed', korting: '10% korting', wat: 'Op het reguliere assortiment van Auping: boxsprings, matrassen en bedframes. Niet bovenop een lopende actie of sale.', href: 'https://app.bylder.com/dashboard/vouchers?ref={slug}', knop: 'Haal je Auping-code', moment: 'Gratis account nodig', offerte: 'Je code laat je zien in de Auping-winkel',
    img: '/img/auping-noble-solid-oak.webp', sm: '/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w', alt: 'Auping Noble Solid Oak bed van massief eiken in een lichte slaapkamer', logo: ['/img/logos/auping-blue.svg', 'Auping', 20] },
]
// Huisstijl per organisatie (verzoek Daniel, 11-11-2026): een Klussenier deelt een pagina in de
// kleuren en letters van Klussenier (marineblauw, rood, Futura-achtige koppen), met beide logo's.
type Thema = { knop: string; knopTekst: string; accent: string; tint: string; tintRand: string; inkt: string; kop?: string; tekst?: string; pagina?: string; zacht?: string; logo?: [string, string] }
const THEMA: Record<'bylder' | 'klussenier', Thema> = {
  bylder: { knop: GROEN, knopTekst: '#F5F0E8', accent: GROEN, tint: 'rgba(61,90,62,0.08)', tintRand: 'rgba(61,90,62,0.2)', inkt: '#1A1208' },
  klussenier: { knop: '#C11733', knopTekst: '#FFFFFF', accent: '#213C73', tint: 'rgba(33,60,115,0.07)', tintRand: 'rgba(33,60,115,0.2)', inkt: '#14213D',
    kop: "'Barlow Condensed', 'Arial Narrow', sans-serif", tekst: "'Source Sans 3', Arial, sans-serif", pagina: '#FFFFFF', zacht: '#4A5568', logo: ['/img/klusseniers/klussenier-logo.png', 'Klussenier, vertrouwd verbouwen'] },
}

const STAALTJES = ['kalkwit', 'zandbeige', 'betongrijs', 'grafiet'].map(id => KLEUREN.find(k => k.id === id)!).filter(Boolean)

export default async function ViaPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = AANBRENGERS.find(x => x.slug === slug)
  if (!a) notFound()
  const voornaam = a.naam.split(' ')[0]
  const app3d = `https://app.bylder.com/dashboard/mijn-woning?ref=${a.slug}`
  const deelTekst = `Kijk, via ${voornaam} van ${a.bedrijf} krijgen we 10% korting op deuren, een gietvloer en kasten: https://www.bylder.com/via/${a.slug}/`
  const T = THEMA[a.huisstijl ?? 'bylder']
  const KOP: React.CSSProperties = T.kop ? { fontFamily: T.kop, letterSpacing: '0' } : {}
  // Lopende tekst en labels in de letter en kleuren van de organisatie, als die er een heeft.
  const PT: React.CSSProperties = T.tekst ? { ...P, fontFamily: T.tekst, color: T.zacht, fontSize: 17 } : P
  const LB: React.CSSProperties = T.tekst ? { ...LABEL, fontFamily: T.tekst, fontSize: 13, letterSpacing: '0.04em' } : LABEL
  const initialen = a.naam.split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).slice(0, 2).join('')
  const KNOP: React.CSSProperties = { background: T.knop, color: T.knopTekst, fontWeight: 800, fontSize: 16, padding: '14px 22px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }
  const KNOP2: React.CSSProperties = { background: '#fff', color: T.inkt, fontWeight: 800, fontSize: 16, padding: '13px 20px', borderRadius: 12, textDecoration: 'none', display: 'inline-block', border: `1.5px solid ${INKT}0.18)` }
  return (
    <div style={{ background: T.pagina, fontFamily: T.tekst }}>
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '44px 24px 72px', color: T.inkt }}>
      {T.kop && <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Source+Sans+3:wght@400;600;700;800&display=swap" precedence="default" />}
      {T.logo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '0 0 22px' }}>
          <img src={T.logo[0]} alt={T.logo[1]} width={190} height={53} style={{ height: 50, width: 'auto' }} />
          <span aria-hidden="true" style={{ color: T.knop, fontWeight: 800, fontSize: 20 }}>×</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: T.accent }}>Bylder.com</span>
        </div>
      )}
      <RefVastleggen slug={a.slug} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 26, background: T.accent, color: '#FFFFFF', fontWeight: 800, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initialen}</span>
        <p style={{ ...LB, color: T.knop, margin: 0 }}>Aanbevolen door {a.naam}<br /><span style={{ color: `${INKT}0.6)` }}>{a.bedrijf}</span></p>
      </div>
      <h1 style={{ fontSize: T.kop ? 'clamp(2.2rem, 6vw, 3rem)' : 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.028em', ...KOP, margin: '10px 0 14px', textWrap: 'balance', maxWidth: '22ch' }}>
        Deuren, vloer en kasten voor je huis, met 10% korting via {voornaam}
      </h1>
      <p style={{ ...PT, fontSize: 18 }}>
        Ga je verbouwen of krijg je de sleutel van een nieuwe woning? Zet je huis in 3D en zie de deuren, de vloer en de
        kasten meteen op hun plek. Via deze link krijg je <strong>10% korting op de orderwaarde</strong>. Ontwerpen is
        gratis; je beslist pas na een definitieve prijs.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['10% korting via ' + voornaam, 'Gratis ontwerpen', 'Nieuwbouw en bestaande bouw', 'Je beslist pas na de prijs'].map(t => (
          <li key={t} style={{ fontSize: 14, fontWeight: 700, color: T.accent, background: T.tint, borderRadius: 999, padding: '6px 12px' }}>{t}</li>
        ))}
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <a href={app3d} data-meet="via-3d-boven" style={KNOP}>Zet je woning in 3D</a>
        <a href="#producten" style={KNOP2}>Kies een product</a>
      </div>
      <p style={{ fontSize: 13.5, color: `${INKT}0.6)`, margin: '10px 0 0' }}>
        Gratis account, inloggen met Google of een link in je mail. Eerst rondkijken? <a href="/mijn-woning/?voorbeeld" data-meet="via-voorbeeld" style={{ color: T.accent, fontWeight: 700 }}>Bekijk een voorbeeldwoning</a>.
      </p>

      <h2 id="producten" style={{ ...KOP, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '44px 0 4px', scrollMarginTop: 110 }}>Waar je korting op krijgt</h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', margin: '16px 0 0' }}>
        {PRODUCTEN.map(p => (
          <section key={p.naam} aria-labelledby={`p-${p.href}`} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'block', aspectRatio: '4 / 3', overflow: 'hidden', background: '#1A1208', position: 'relative' }}>
              {p.img
                ? <img src={p.img} srcSet={p.sm} sizes="(max-width:720px) 100vw, 240px" alt={p.alt} width={600} height={450} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>{STAALTJES.map(k => <span key={k.id} style={{ background: k.hex }} />)}</span>}
              <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 12.5, fontWeight: 800, color: T.accent, background: '#FFFFFF', borderRadius: 999, padding: '4px 10px' }}>{p.korting}</span>
            </span>
            <span style={{ padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {p.logo
              ? <img src={p.logo[0]} alt={p.logo[1]} height={p.logo[2]} style={{ height: p.logo[2], width: 'auto', alignSelf: 'flex-start' }} />
              : <span style={{ fontSize: 12, fontWeight: 700, color: `${INKT}0.55)`, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.door}</span>}
            <h2 id={`p-${p.href}`} style={{ ...KOP, fontSize: T.kop ? '1.35rem' : '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>{p.naam}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: `${INKT}0.75)`, margin: 0, flex: 1 }}>{p.wat}</p>
            <p style={{ fontSize: 13, color: T.inkt, margin: 0, fontWeight: 600 }}>{p.offerte}</p>
            <p style={{ fontSize: 12.5, color: `${INKT}0.55)`, margin: 0 }}>{p.moment}</p>
            <a href={p.href.replace('{slug}', a.slug)} data-meet={`via-${p.href.split('/')[1] || 'auping'}`} style={{ marginTop: 6, background: T.knop, color: T.knopTekst, fontWeight: 800, fontSize: 14.5, padding: '11px 16px', borderRadius: 10, textDecoration: 'none', textAlign: 'center' }}>{p.knop}</a>
            </span>
          </section>
        ))}
      </div>

      <section aria-labelledby="h-3d" style={{ marginTop: 44, background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 18, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
        <img src="/img/voorbeeldwoning-3d.webp" srcSet="/img/voorbeeldwoning-3d-sm.webp 600w, /img/voorbeeldwoning-3d.webp 1200w" sizes="(max-width:720px) 100vw, 480px"
          alt="Een woning in 3D, met de gekozen vloer en deuren per ruimte" width={1200} height={712} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#E9E4DA' }} />
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 id="h-3d" style={{ ...KOP, fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Je hele huis in 3D, uit je eigen plattegrond</h2>
          <ul style={{ ...PT, margin: 0, paddingLeft: 20, fontSize: 15.5 }}>
            <li>Upload de bouwtekening of een plattegrond, van een nieuw of een bestaand huis.</li>
            <li>De ruimtes en m² komen eruit; je kiest vloer, deuren en kasten per kamer.</li>
            <li>Laat {voornaam} meekijken en zet zijn offerte ernaast.</li>
          </ul>
          <div><a href={app3d} data-meet="via-3d-blok" style={KNOP}>Zet je woning in 3D</a></div>
        </div>
      </section>

      <h2 style={{ ...KOP, fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '48px 0 12px' }}>Zo werkt het</h2>
      <ol style={{ ...PT, paddingLeft: 22, display: 'grid', gap: 8 }}>
        <li><strong>Ontwerp gratis.</strong> Zonder account, in 3D of op je eigen plattegrond.</li>
        <li><strong>Vraag een offerte aan.</strong> Je ontwerp en maten gaan naar wie de offerte maakt: Bylder voor de deuren, een verwerker of timmerbedrijf uit ons netwerk voor de gietvloer en de kast. Je 10% korting staat er al in. Je hoeft geen code te onthouden: deze link onthoudt het voor je.</li>
        <li><strong>Beslis zelf.</strong> Pas na inmeten en een definitieve prijs ga je akkoord. Je betaalt wie je offerte maakt.</li>
      </ol>

      <div style={{ background: T.tint, border: `1px solid ${T.tintRand}`, borderRadius: 14, padding: '16px 18px', marginTop: 24, maxWidth: 760 }}>
        <p style={{ ...PT, margin: 0, fontSize: 14.5 }}>
          <strong>Eerlijk gezegd:</strong> {a.naam} werkt samen met Bylder en krijgt een vergoeding van Bylder als je via
          deze link bestelt. Jij betaalt daar niets extra voor; je krijgt juist korting. Bylder kiest de makers op de
          kwaliteit van hun product en hun werk; bij wie je bestelt, beslis je zelf.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 26 }}>
        <a href={`https://wa.me/?text=${encodeURIComponent(deelTekst)}`} data-meet="via-deel-whatsapp" rel="noopener" style={KNOP2}>Stuur naar je partner via WhatsApp</a>
        <span style={{ fontSize: 13.5, color: `${INKT}0.6)` }}>De korting gaat mee: de link onthoudt {voornaam}.</span>
      </div>

      <p style={{ ...PT, fontSize: 13.5, marginTop: 28 }}>
        {a.naam} · {a.vak} in {a.plaats}{a.website ? <> · <a href={a.website} style={{ color: T.accent, fontWeight: 700 }} rel="noopener">website</a></> : null}.
        Meer over hoe bestellen via Bylder werkt: <a href="/ontwerpen/" style={{ color: T.accent, fontWeight: 700 }}>Ontwerpen en bestellen</a>.
      </p>
    </div>
    </div>
  )
}
