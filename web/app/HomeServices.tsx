// Vervangt de oude hardcoded "Laag 2"-sectie uit homeHtml.ts (Vakmannen/Kosten/
// Offerte-check), die uitsluitend naar de noindex-clusters aannemer-matching/
// renovatiekosten/offerte-check linkte — de homepage (hoogste autoriteit)
// promootte daarmee nooit de 8 echte, indexeerbare city+bedrijf-hubs.
// Data-driven naar het patroon van Footer.tsx (COLS-array): één plek om bij te
// werken zodra een cluster van noindex naar index gaat, i.p.v. zoeken door een
// 170KB hardcoded string. Server-component, geen client-JS nodig.
// Zie reports/interne-linkarchitectuur-ontwerp.md voor de analyse.

type Vak = { href: string; label: string }

const VAKMANNEN: Vak[] = [
  { href: '/aannemer/', label: 'Aannemer' },
  { href: '/loodgieter/', label: 'Loodgieter' },
  { href: '/elektricien/', label: 'Elektricien' },
  { href: '/schilder/', label: 'Schilder' },
  { href: '/stukadoor/', label: 'Stukadoor' },
  { href: '/badkamer/', label: 'Badkamerspecialist' },
  { href: '/gietvloer/', label: 'Gietvloerspecialist' },
  { href: '/dakkapel/', label: 'Dakkapelspecialist' },
]

const eyebrow: React.CSSProperties = { fontSize: 11, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(201,168,76,0.7)', fontWeight: 700, marginBottom: 10 }
const cardBase: React.CSSProperties = { background: 'rgba(245,240,232,0.04)', border: '1px solid rgba(245,240,232,0.08)', borderRadius: 16, padding: 28 }
const vakLink: React.CSSProperties = { fontSize: 13, color: '#3D5A3E', textDecoration: 'none' }

export default function HomeServices() {
  return (
    <section style={{ padding: '80px 0', background: '#1A1208' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        <div style={eyebrow}>Bylder diensten</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 800, color: '#F5F0E8', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
            Vakman vinden, kosten checken<br />en offerte controleren
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

          <div style={cardBase}>
            <div style={{ fontSize: 28, marginBottom: 12 }}><i className="ph-thin ph-wrench" /></div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0E8', marginBottom: 8, letterSpacing: '-0.01em' }}>Vakman vinden + kosten checken</div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', lineHeight: 1.65, marginBottom: 20 }}>
              Beoordeelde vakmensen per gemeente, mét een directe prijsindicatie op elke stadspagina — geen aparte kostencalculator nodig.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {VAKMANNEN.map(v => (
                <a key={v.href} href={v.href} style={vakLink}>→ {v.label}</a>
              ))}
            </div>
          </div>

          <div style={cardBase}>
            <div style={{ fontSize: 28, marginBottom: 12 }}><i className="ph-thin ph-clipboard-text" /></div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#F5F0E8', marginBottom: 8, letterSpacing: '-0.01em' }}>Offerte controleren</div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', lineHeight: 1.65, marginBottom: 20 }}>
              Is jouw offerteprijs marktconform? Vergelijk 'm met echte marktbandbreedtes per post, voordat je tekent.
            </p>
            <a href="/eerlijke-prijzen/" style={{ fontSize: 13, fontWeight: 700, color: 'rgba(245,240,232,0.6)', textDecoration: 'none' }}>Eerlijke prijzen bekijken →</a>
          </div>

        </div>
      </div>
    </section>
  )
}
