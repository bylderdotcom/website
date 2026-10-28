// Gedeelde opmaak voor /nieuwbouw-afwerken/ en de onderdeelpagina's.

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export const Stijl: Record<string, React.CSSProperties> = {
  main: { maxWidth: 1180, boxSizing: 'border-box', margin: '0 auto', padding: '28px 16px 72px', color: '#1A1208' },
  kruimel: { fontSize: 13.5, color: `${INKT}0.6)`, margin: '0 0 22px' },
  kruimelLink: { color: GROEN, textDecoration: 'none', fontWeight: 600 },
  held: { display: 'grid', gap: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', alignItems: 'start' },
  oog: { fontSize: 11.5, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B85C38', fontWeight: 700, margin: '0 0 12px' },
  h1: { fontSize: 'clamp(2rem, 4.4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 16px', textWrap: 'balance' },
  lead: { fontSize: 17.5, lineHeight: 1.65, color: `${INKT}0.8)`, margin: '0 0 18px', maxWidth: '58ch' },
  vinkjes: { listStyle: 'none', padding: 0, margin: '0 0 22px', display: 'grid', gap: 8 },
  vinkje: { display: 'flex', gap: 10, alignItems: 'center', fontSize: 15.5, fontWeight: 600 },
  knop: { display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' },
  prijsKaart: { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 18, padding: 24 },
  h2: { fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '56px 0 14px', textWrap: 'balance' },
  p: { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.8)`, margin: '0 0 14px', maxWidth: '72ch' },
  link: { color: GROEN, fontWeight: 700 },
  raster: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' },
  kaartLink: { display: 'flex', flexDirection: 'column', gap: 6, height: '100%', boxSizing: 'border-box', background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 14, padding: '18px 18px 16px', textDecoration: 'none' },
  stappen: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' },
  stap: { display: 'flex', gap: 12, alignItems: 'flex-start', background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 14, padding: '14px 16px' },
  nummer: { flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: '#EBF0E8', color: GROEN, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' },
  aanvraag: { margin: '56px 0 0', background: '#EDE6D8', borderRadius: 20, padding: 'clamp(20px, 4vw, 34px)' },
  vraag: { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 14, padding: '16px 20px' },
}

/** Lijn-icoon (geen emoji als UI-icoon). */
export function Lijn({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GROEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}
