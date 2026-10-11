// Wat je via Bylder kunt bestellen of met korting kunt kopen, als één rij kaarten.
//
// Besluit Daniel (11-10-2026): elke pagina heeft een commerciële vervolgstap. Deze strook is
// de algemene versie, voor pagina's waar niet één product vanzelf voor de hand ligt (een
// overzicht, een kostenpagina). Waar wél één product past, staat daarboven de eigen CTA van
// dat product (ConfiguratorCTA, GietvloerCTA, KastCTA, VoucherCTA).

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

type Kaart = { href: string; label: string; titel: string; tekst: string; knop: string }

const kaarten = (merken: number): Kaart[] => [
  { href: '/kozijnloze-deuren/configurator/', label: 'Ontwerpen', titel: 'Kozijnloze deuren', tekst: 'Stel je deuren samen in 3D. Offerte en levering door Classic Next.', knop: 'Stel samen' },
  { href: '/gietvloer/ontwerpen/', label: 'Ontwerpen', titel: 'Gietvloer', tekst: 'Kleur uit je eigen foto, per ruimte. Tot drie stalen gratis.', knop: 'Ontwerp je vloer' },
  { href: '/kasten-op-maat/ontwerpen/', label: 'Ontwerpen', titel: 'Kast op maat', tekst: 'Vanaf een voorbeeldfoto, in 3D. Gemaakt door een timmerbedrijf.', knop: 'Ontwerp je kast' },
  { href: '/onzichtbare-plinten/', label: 'Offerte', titel: 'Onzichtbare plinten', tekst: 'Een wand zonder lijst langs de vloer. Kies vóór de stukadoor komt.', knop: 'Vraag een offerte aan' },
  { href: '/vouchers/', label: 'Korting', titel: `Ledenkorting bij ${merken} merken`, tekst: 'Auping, Goossens, DRT en meer. Met een gratis account.', knop: 'Bekijk de kortingen' },
]

export default function AanbodStrook({
  merken, titel = 'Direct regelen via Bylder', intro, marge = '48px 0',
}: { merken: number; titel?: string; intro?: string; marge?: string }) {
  return (
    <section aria-labelledby="aanbod-strook" style={{ margin: marge }}>
      <h2 id="aanbod-strook" style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '0 0 8px', color: '#1A1208' }}>{titel}</h2>
      {intro && <p style={{ fontSize: 16, lineHeight: 1.7, color: `${INKT}0.75)`, margin: '0 0 18px', maxWidth: '68ch' }}>{intro}</p>}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
        {kaarten(merken).map(k => (
          <a key={k.href} href={k.href} style={{
            background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '18px 18px 16px',
            textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#B85C38', fontWeight: 700 }}>{k.label}</span>
            <span style={{ fontSize: 16.5, fontWeight: 800, color: '#1A1208', lineHeight: 1.25 }}>{k.titel}</span>
            <span style={{ fontSize: 14, color: `${INKT}0.7)`, lineHeight: 1.55, flex: 1 }}>{k.tekst}</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: GROEN, marginTop: 4 }}>{k.knop} &rarr;</span>
          </a>
        ))}
      </div>
    </section>
  )
}
