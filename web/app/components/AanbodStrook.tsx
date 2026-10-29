// Wat je via Bylder kunt bestellen of met korting kunt kopen, als één rij kaarten met beeld,
// in dezelfde vorm als de fotorij op de homepage (HomeHeld.tsx): deuren en Auping met foto,
// de kast met het 3D-beeld uit de ontwerper, de gietvloer met kleurvlakken.
//
// Besluit Daniel (11-10-2026): elke pagina heeft een commerciële vervolgstap, en Auping
// hoort er altijd bij zoals op de homepage, met afbeelding. Deze strook staat onder de
// stap die bij het onderwerp hoort (CommercieleStap) en op overzichtspagina's.

import { KLEUREN } from './gietvloer/gegevens'

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

type Kaart = { href: string; merk: string; titel: string; tekst: string; knop: string; img?: string; sm?: string; alt?: string; kleuren?: boolean }

const kaarten = (merken: number): Kaart[] => [
  { href: '/nieuwbouw-afwerken/', merk: 'Bylder als aannemer', titel: 'Je hele afwerking', tekst: 'Stucwerk, tegels, badkamer, vloeren, deuren en kasten in één offerte.', knop: 'Vraag een offerte aan' },
  { href: '/kozijnloze-deuren/configurator/', merk: 'Classic Next', titel: 'Kozijnloze deuren', tekst: 'Plafondhoog, zonder architraaf. Stel samen in 3D en vraag direct een offerte aan.', knop: 'Stel je deur samen',
    img: '/img/classic-next/deur-eiken-fineer.jpg', sm: '/img/classic-next/deur-eiken-fineer-sm.jpg 600w, /img/classic-next/deur-eiken-fineer.jpg 800w',
    alt: 'Plafondhoge binnendeur in eikenfineer, vlak in een witte wand' },
  { href: '/vouchers/auping/', merk: 'Auping', titel: '10% en een gratis leenbed', tekst: 'Op het reguliere assortiment, bij vier Auping-winkels. Met een gratis account.', knop: 'Auping-voordeel',
    img: '/img/auping-noble-solid-oak.webp', sm: '/img/auping-noble-solid-oak-sm.webp 500w, /img/auping-noble-solid-oak.webp 1000w',
    alt: 'Auping Noble Solid Oak bed van massief eiken in een lichte slaapkamer' },
  { href: '/kasten-op-maat/ontwerpen/', merk: 'Maatwerk', titel: 'Kast op maat', tekst: 'Vanaf een voorbeeldfoto, in 3D. Gemaakt door een timmerbedrijf.', knop: 'Ontwerp je kast',
    img: '/img/kasten/hoekkast-3d-sm.jpg', sm: '/img/kasten/hoekkast-3d-sm.jpg 600w, /img/kasten/hoekkast-3d.jpg 1200w',
    alt: 'Hoekkast op maat in 3D, uit de kastontwerper van Bylder' },
  { href: '/gietvloer/ontwerpen/', merk: 'Gietvloer', titel: 'Kleur uit je eigen foto', tekst: 'Per ruimte in je woning, tot drie stalen gratis. Gelegd door een verwerker.', knop: 'Ontwerp je vloer', kleuren: true },
  { href: '/vouchers/', merk: `${merken} merken`, titel: 'Ledenkorting', tekst: 'Goossens, DRT, Lamp en Licht en meer, plus onzichtbare plinten op offerte.', knop: 'Bekijk de kortingen' },
]

const STAALTJES = ['kalkwit', 'zandbeige', 'betongrijs', 'grafiet']

export default function AanbodStrook({
  merken, titel = 'Direct regelen via Bylder', intro, marge = '48px 0',
}: { merken: number; titel?: string; intro?: string; marge?: string }) {
  const kleuren = STAALTJES.map(id => KLEUREN.find(k => k.id === id)).filter(Boolean) as { id: string; hex: string; naam: string }[]
  return (
    <section aria-labelledby="aanbod-strook" style={{ margin: marge }}>
      <h2 id="aanbod-strook" style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '0 0 8px', color: '#1A1208' }}>{titel}</h2>
      {intro && <p style={{ fontSize: 16, lineHeight: 1.7, color: `${INKT}0.75)`, margin: '0 0 18px', maxWidth: '68ch' }}>{intro}</p>}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {kaarten(merken).map(k => (
          <li key={k.href} style={{ display: 'flex' }}>
            <a href={k.href} style={{
              background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, overflow: 'hidden',
              textDecoration: 'none', display: 'flex', flexDirection: 'column', width: '100%',
            }}>
              <span aria-hidden={k.img ? undefined : true} style={{ display: 'block', aspectRatio: '4 / 3', overflow: 'hidden', flexShrink: 0, background: '#1A1208' }}>
                {k.img
                  ? <img src={k.img} srcSet={k.sm} sizes="(max-width:720px) 100vw, 220px" alt={k.alt} width={600} height={450}
                      loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                  : k.kleuren
                    ? <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%' }}>
                        {kleuren.map(c => <span key={c.id} style={{ background: `radial-gradient(120% 90% at 20% 15%, rgba(255,255,255,.22), transparent 55%), ${c.hex}` }} />)}
                      </span>
                    : <span style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#E8A87C', fontWeight: 800, fontSize: '2.4rem', letterSpacing: '-0.03em' }}>{merken}</span>}
              </span>
              <span style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                <span style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B85C38', fontWeight: 700 }}>{k.merk}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1208', lineHeight: 1.25 }}>{k.titel}</span>
                <span style={{ fontSize: 13.5, color: `${INKT}0.7)`, lineHeight: 1.5, flex: 1 }}>{k.tekst}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: GROEN, marginTop: 4 }}>{k.knop} &rarr;</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
