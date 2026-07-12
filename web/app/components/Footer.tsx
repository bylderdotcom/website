// Gedeelde site-footer — ÉÉN bron voor elke pagina. Server-component (geen JS).
// Structuur 1:1 overgenomen van de bestaande site (6 kolommen + logo + onderbalk).

type Col = { title: string; links: { href: string; label: string; accent?: boolean }[] }

const COLS: Col[] = [
  { title: 'Ontdek', links: [
    { href: '/prijzen/', label: 'Prijzen' },
    { href: '/kortingscode/', label: 'Kortingscodes' },
    { href: '/vouchers/', label: 'Vouchers' },
    { href: '/showroomsale/', label: 'Showroomsale' },
    { href: '/deelnemer-worden/', label: 'Deelnemer worden' },
    { href: '/nieuwbouw-koper/', label: 'Nieuwbouwkoper' },
    { href: '/bestaande-bouw/', label: 'Bestaande bouw' },
    { href: '/renovatie/', label: 'Renovatie' },
    { href: '/nieuwbouw-gids/', label: 'Gidsen' },
    { href: '/blog/', label: 'Blog' },
    { href: '/bouwvergunning/', label: 'Bouwvergunning' },
    { href: '/eerlijke-prijzen/', label: 'Eerlijke prijzen' },
    { href: '/over-ons/', label: 'Over ons' },
    { href: '/en-us/', label: 'For US homebuyers' },
  ] },
  { title: 'Projecten', links: [
    { href: '/project/badkamer-renovatie/', label: 'Badkamer renovatie' },
    { href: '/project/gietvloer-leggen/', label: 'Gietvloer leggen' },
    { href: '/project/laadpaal-installeren/', label: 'Laadpaal installeren' },
    { href: '/project/schilderwerk-binnen/', label: 'Schilderwerk' },
    { href: '/project/dakkapel-plaatsen/', label: 'Dakkapel plaatsen' },
    { href: '/project/', label: 'Alle projecten →', accent: true },
  ] },
  { title: 'Kopen', links: [
    { href: '/kopen/vloeren/', label: 'Vloeren' },
    { href: '/kopen/sanitair/', label: 'Sanitair' },
    { href: '/kopen/verlichting/', label: 'Verlichting' },
    { href: '/kopen/laadpalen/', label: 'Laadpalen' },
    { href: '/kopen/zonnepanelen/', label: 'Zonnepanelen' },
    { href: '/kopen/', label: 'Alle categorieën →', accent: true },
  ] },
  { title: 'Vakmannen', links: [
    { href: '/aannemer/', label: 'Aannemer vinden' },
    { href: '/loodgieter/', label: 'Loodgieter vinden' },
    { href: '/elektricien/', label: 'Elektricien vinden' },
    { href: '/schilder/', label: 'Schilder vinden' },
    { href: '/stukadoor/', label: 'Stukadoor vinden' },
    { href: '/badkamer/', label: 'Badkamerspecialist vinden' },
    { href: '/gietvloer/', label: 'Gietvloerspecialist vinden' },
    { href: '/dakkapel/', label: 'Dakkapelspecialist vinden' },
  ] },
  { title: 'Gemeenten', links: [
    { href: '/nieuwbouw/noord-holland/', label: 'Noord-Holland' },
    { href: '/nieuwbouw/zuid-holland/', label: 'Zuid-Holland' },
    { href: '/nieuwbouw/noord-brabant/', label: 'Noord-Brabant' },
    { href: '/nieuwbouw/utrecht/', label: 'Utrecht' },
    { href: '/nieuwbouw/gelderland/', label: 'Gelderland' },
    { href: '/nieuwbouw/', label: 'Alle 12 provincies →', accent: true },
  ] },
  { title: 'Juridisch', links: [
    { href: '/privacy/', label: 'Privacybeleid' },
    { href: '/algemene-voorwaarden/', label: 'Voorwaarden' },
    { href: '/cookies/', label: 'Cookiebeleid' },
    { href: 'mailto:info@bylder.com', label: 'Contact' },
  ] },
]

const eyebrow: React.CSSProperties = { fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(245,240,232,.25)', fontWeight: 700, marginBottom: 16 }

export default function Footer() {
  return (
    <footer style={{ padding: '64px 0 36px', background: '#1A1208', color: 'rgba(245,240,232,.8)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, marginBottom: 48, alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#3D5A3E', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#F5F0E8', fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>B.</span>
              <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: '#F5F0E8' }}>Bylder<span style={{ color: '#3D5A3E' }}>.com</span></span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,.4)', lineHeight: 1.7, maxWidth: 200 }}>AI-platform voor kopers van nieuwbouw, bestaande bouw en renovatiewoningen.</p>
            <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(245,240,232,.25)', fontFamily: 'monospace' }}>Bylder Nederland B.V.<br />KvK 65020006</div>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <p style={eyebrow}>{col.title}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0 }}>
                {col.links.map(l => (
                  <li key={l.href + l.label}>
                    <a href={l.href} style={{ fontSize: 13, color: l.accent ? '#3D5A3E' : 'rgba(245,240,232,.45)', fontWeight: l.accent ? 600 : 400, textDecoration: 'none' }}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(245,240,232,.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'rgba(245,240,232,.25)', margin: 0 }}>© 2026 Bylder Nederland B.V. — KvK 65020006</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'monospace', color: 'rgba(245,240,232,.25)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3D5A3E', display: 'inline-block' }} />
            Alle systemen operationeel
          </div>
        </div>
      </div>
    </footer>
  )
}
