// Verwijzing naar de kastontwerper, in dezelfde vorm als ConfiguratorCTA (de
// deurconfigurator): tekst met één knop, en een venster met een echt beeld uit
// de ontwerper. Het beeld is een vaste afbeelding, geen 3D: op de homepage en de
// projectpagina's telt laadtijd zwaarder dan een draaiende kast.
//
// Het beeld: web/public/img/kasten/hoekkast-3d(-sm).jpg, gemaakt van het
// voorbeeld op /kasten-op-maat/. Verandert de weergave zichtbaar, maak dan een nieuwe.

const ONTWERPER = '/kasten-op-maat/ontwerpen/'

export default function KastCTA({
  aanleiding,
  titel = 'Ontwerp een kast op maat, en zie hem in 3D',
  label = 'Maatwerk · kasten',
  marge = '44px 0',
  start,
}: {
  aanleiding: string
  titel?: string
  label?: string
  marge?: string
  /** Kasttype om mee te beginnen (?start=), bv. 'hoekkast'. */
  start?: string
}) {
  const href = start ? `${ONTWERPER}?start=${start}` : ONTWERPER
  return (
    <aside aria-label="Kastontwerper" style={{
      background: '#1A1208', borderRadius: 20, margin: marge, overflow: 'hidden',
      display: 'grid', alignItems: 'center',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
    }}>
      <div style={{ padding: '28px 28px 26px' }}>
        <div style={{
          fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10,
        }}>{label}</div>
        <h2 style={{
          fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px',
          letterSpacing: '-0.022em', textWrap: 'balance',
        }}>{titel}</h2>
        <p style={{
          fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 16px', maxWidth: '56ch',
        }}>{aanleiding}</p>
        <a href={href} style={{
          display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800,
          fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none',
        }}>Ontwerp je kast &rarr;</a>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(245,240,232,0.6)', margin: '12px 0 0' }}>
          Gratis. Of lees eerst <a href="/kasten-op-maat/" style={{ color: '#F5F0E8' }}>hoe een kast op maat werkt</a>.
        </p>
        <ul aria-label="Wat je krijgt" style={{
          listStyle: 'none', padding: 0, margin: '18px 0 0', display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {['Vrije vorm, geen vaste kastjes', 'Uit je eigen voorbeeldfoto’s', 'Tekening en zaaglijst', 'Gratis inmeten'].map(t => (
            <li key={t} style={{
              fontSize: 13, fontWeight: 700, color: '#F5F0E8', border: '1px solid rgba(245,240,232,0.25)',
              borderRadius: 999, padding: '5px 12px',
            }}>{t}</li>
          ))}
        </ul>
      </div>
      <a href={href} tabIndex={-1} aria-hidden="true" style={{ display: 'block', padding: '4px 22px 22px', textDecoration: 'none' }}>
        <div style={{ background: '#F5F0E8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 12px',
            borderBottom: '1px solid rgba(61,46,30,0.1)', background: '#EDE6D8',
          }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: '#D9CFBF', display: 'block' }} />)}
            <span style={{
              marginLeft: 10, fontSize: 11.5, color: 'rgba(61,46,30,0.6)', background: '#F5F0E8',
              borderRadius: 6, padding: '3px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
            }}>bylder.com/kasten-op-maat/ontwerpen</span>
          </div>
          <img
            src="/img/kasten/hoekkast-3d.jpg"
            srcSet="/img/kasten/hoekkast-3d-sm.jpg 600w, /img/kasten/hoekkast-3d.jpg 1200w"
            sizes="(max-width: 900px) 100vw, 600px"
            alt="" width={1200} height={800} loading="lazy" decoding="async"
            style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>
      </a>
    </aside>
  )
}
