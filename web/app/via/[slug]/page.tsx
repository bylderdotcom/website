import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AANBRENGERS } from '../aanbrengers'
import RefVastleggen from './RefVastleggen'
import { KLEUREN } from '../../components/gietvloer/gegevens'

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
    description: `${a.naam} raadt deze maatwerkproducten aan voor je nieuwe woning. Via deze link krijg je 10% korting op de orderwaarde.`,
    robots: { index: false, follow: false },
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
type Product = { naam: string; korting: string; wat: string; href: string; knop: string; moment: string; img?: string; sm?: string; alt?: string; logo?: [string, string, number]; kleuren?: boolean; door?: string }
const PRODUCTEN: Product[] = [
  { naam: 'Deuren zonder kozijn', korting: '10% korting', wat: 'Plafondhoge deuren die vlak in de wand liggen, zonder kozijn of architraaf. Stel ze samen in 3D.', href: '/kozijnloze-deuren/configurator/', knop: 'Stel je deuren samen', moment: 'Kies vóór de stukadoor komt',
    img: '/img/classic-next/deur-eiken-fineer.jpg', sm: '/img/classic-next/deur-eiken-fineer-sm.jpg 600w, /img/classic-next/deur-eiken-fineer.jpg 800w', alt: 'Plafondhoge binnendeur in eikenfineer, vlak in een witte wand', logo: ['/img/logos/classic-next.png', 'Classic Next', 18] },
  { naam: 'Gietvloer', korting: '10% korting', wat: 'Upload een foto van een vloer die je mooi vindt; we zoeken de kleur en rekenen je ruimtes uit. Tot drie stalen gratis.', href: '/gietvloer/ontwerpen/', knop: 'Ontwerp je gietvloer', moment: 'Kies vóór de oplevering', kleuren: true, door: 'Gelegd door een verwerker' },
  { naam: 'Kast op maat', korting: '10% korting', wat: 'Laat een foto zien van een kast die je mooi vindt en wijs aan waar hij komt. Je ziet hem in 3D, met maten.', href: '/kasten-op-maat/ontwerpen/', knop: 'Ontwerp je kast', moment: 'Gratis inmeten na de oplevering',
    img: '/img/kasten/hoekkast-3d-sm.jpg', sm: '/img/kasten/hoekkast-3d-sm.jpg 600w, /img/kasten/hoekkast-3d.jpg 1200w', alt: 'Hoekkast op maat in 3D, uit de kastontwerper van Bylder', door: 'Gemaakt door een timmerbedrijf' },
  { naam: 'Auping bed', korting: '10% korting', wat: 'Op het reguliere assortiment van Auping: boxsprings, matrassen en bedframes. Niet bovenop een lopende actie of sale.', href: 'https://app.bylder.com/dashboard/vouchers', knop: 'Haal je Auping-code', moment: 'Gratis account nodig',
    img: '/img/auping-noble-solid-oak.webp', sm: '/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w', alt: 'Auping Noble Solid Oak bed van massief eiken in een lichte slaapkamer', logo: ['/img/logos/auping-blue.svg', 'Auping', 20] },
]
const STAALTJES = ['kalkwit', 'zandbeige', 'betongrijs', 'grafiet'].map(id => KLEUREN.find(k => k.id === id)!).filter(Boolean)

export default async function ViaPagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const a = AANBRENGERS.find(x => x.slug === slug)
  if (!a) notFound()
  const voornaam = a.naam.split(' ')[0]
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '44px 24px 72px', color: '#1A1208' }}>
      <RefVastleggen slug={a.slug} />
      <p style={LABEL}>Aanbevolen door {a.naam} · {a.bedrijf}</p>
      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance', maxWidth: '24ch' }}>
        Maatwerk voor je nieuwe woning, met 10% korting via {voornaam}
      </h1>
      <p style={{ ...P, fontSize: 18 }}>
        {voornaam} raadt deze producten aan omdat ze bij een nieuwbouwwoning het verschil maken, en omdat je ze op tijd
        moet regelen. Via deze link krijg je <strong>10% korting op de orderwaarde</strong>. Je ontwerpt gratis, vraagt
        een offerte aan bij de maker en beslist pas daarna.
      </p>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', margin: '26px 0 0' }}>
        {PRODUCTEN.map(p => (
          <section key={p.naam} aria-labelledby={`p-${p.href}`} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'block', aspectRatio: '4 / 3', overflow: 'hidden', background: '#1A1208', position: 'relative' }}>
              {p.img
                ? <img src={p.img} srcSet={p.sm} sizes="(max-width:720px) 100vw, 240px" alt={p.alt} width={600} height={450} loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>{STAALTJES.map(k => <span key={k.id} style={{ background: k.hex }} />)}</span>}
              <span style={{ position: 'absolute', left: 10, top: 10, fontSize: 12.5, fontWeight: 800, color: GROEN, background: '#F5F0E8', borderRadius: 999, padding: '4px 10px' }}>{p.korting}</span>
            </span>
            <span style={{ padding: '16px 20px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {p.logo
              ? <img src={p.logo[0]} alt={p.logo[1]} height={p.logo[2]} style={{ height: p.logo[2], width: 'auto', alignSelf: 'flex-start' }} />
              : <span style={{ fontSize: 12, fontWeight: 700, color: `${INKT}0.55)`, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.door}</span>}
            <h2 id={`p-${p.href}`} style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0' }}>{p.naam}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: `${INKT}0.75)`, margin: 0, flex: 1 }}>{p.wat}</p>
            <p style={{ fontSize: 12.5, color: `${INKT}0.55)`, margin: 0 }}>{p.moment}</p>
            <a href={p.href} style={{ marginTop: 6, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14.5, padding: '11px 16px', borderRadius: 10, textDecoration: 'none', textAlign: 'center' }}>{p.knop}</a>
            </span>
          </section>
        ))}
      </div>

      <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '48px 0 12px' }}>Zo werkt het</h2>
      <ol style={{ ...P, paddingLeft: 22, display: 'grid', gap: 8 }}>
        <li><strong>Ontwerp gratis.</strong> Zonder account, in 3D of op je eigen plattegrond.</li>
        <li><strong>Vraag een offerte aan.</strong> De maker krijgt je ontwerp en maten, en weet dat je 10% korting krijgt. Je hoeft geen code te onthouden: deze link onthoudt het voor je.</li>
        <li><strong>Beslis zelf.</strong> Pas na inmeten en een definitieve prijs ga je akkoord, met de maker. Je betaalt de maker, niet Bylder.</li>
      </ol>

      <div style={{ background: 'rgba(61,90,62,0.06)', border: '1px solid rgba(61,90,62,0.2)', borderRadius: 14, padding: '16px 18px', marginTop: 24, maxWidth: 760 }}>
        <p style={{ ...P, margin: 0, fontSize: 14.5 }}>
          <strong>Eerlijk gezegd:</strong> {a.naam} werkt samen met Bylder en krijgt een vergoeding van Bylder als je via
          deze link bestelt. Jij betaalt daar niets extra voor; je krijgt juist korting. Bylder kiest de makers op de
          kwaliteit van hun product en hun werk; bij wie je bestelt, beslis je zelf.
        </p>
      </div>

      <p style={{ ...P, fontSize: 13.5, marginTop: 28 }}>
        {a.naam} · {a.vak} in {a.plaats}{a.website ? <> · <a href={a.website} style={{ color: GROEN, fontWeight: 700 }} rel="noopener">website</a></> : null}.
        Meer over hoe bestellen via Bylder werkt: <a href="/ontwerpen/" style={{ color: GROEN, fontWeight: 700 }}>Ontwerpen en bestellen</a>.
      </p>
    </div>
  )
}
