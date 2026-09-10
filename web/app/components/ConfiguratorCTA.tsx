// Verwijzing naar de deurconfigurator.
//
// De configurator was een eiland: hij stond nergens waar iemand hem tegenkomt.
// Dit blok staat op de plekken waar iemand al over kozijnloze deuren aan het
// lezen is, met per pagina een eigen aanleiding — dezelfde knop met dezelfde
// zin op vier pagina's leest als een banner en wordt overgeslagen.

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export default function ConfiguratorCTA({ aanleiding }: { aanleiding: string }) {
  return (
    <aside style={{
      background: '#1A1208', borderRadius: 16, padding: '26px 26px 24px',
      margin: '44px 0', display: 'grid', gap: 18,
      gridTemplateColumns: 'minmax(0,1fr) auto', alignItems: 'center',
    }}>
      <div>
        <div style={{
          fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 8,
        }}>Zelf samenstellen</div>
        <h2 style={{
          fontSize: '1.32rem', fontWeight: 800, color: '#F5F0E8', margin: '0 0 8px',
          letterSpacing: '-0.02em', textWrap: 'balance',
        }}>Zie wat je kiest voordat je iets vraagt</h2>
        <p style={{
          fontSize: 15, lineHeight: 1.7, color: 'rgba(245,240,232,0.74)', margin: 0,
          maxWidth: '54ch',
        }}>{aanleiding}</p>
      </div>
      <a href="/kozijnloze-deuren/configurator/" style={{
        display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800,
        fontSize: 15, padding: '13px 24px', borderRadius: 11, textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}>Stel je deur samen &rarr;</a>
    </aside>
  )
}

export const CTA_STIJL = { INKT, GROEN }
