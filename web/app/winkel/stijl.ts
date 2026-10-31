// Gedeelde vormgeving van de winkelpagina's (31-10-2026), in de lijn van de productpagina's.
export const INKT = 'rgba(61,46,30,'
export const GROEN = '#3D5A3E'
export const S: Record<string, React.CSSProperties> = {
  main: { maxWidth: 1120, margin: '0 auto', padding: '32px 20px 72px', color: '#1A1208' },
  kruimel: { fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 22px' },
  kruimelLink: { color: `${INKT}0.6)` },
  oog: { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: GROEN, margin: '0 0 10px' },
  h1: { fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px', textWrap: 'balance' },
  lead: { fontSize: 17, lineHeight: 1.7, color: `${INKT}0.78)`, margin: '0 0 20px', maxWidth: '62ch' },
  h2: { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '52px 0 14px', textWrap: 'balance' },
  h3: { fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px' },
  p: { fontSize: 16, lineHeight: 1.72, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '68ch' },
  kaart: { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 22 },
  held: { display: 'grid', gap: '24px 40px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', alignItems: 'start' },
  beeld: { background: '#fff', border: `1px solid ${INKT}0.1)`, borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  feit: { display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 15, lineHeight: 1.55, color: `${INKT}0.82)`, margin: '0 0 9px' },
  tabelCel: { padding: '10px 12px', fontSize: 14.5, borderBottom: `1px solid ${INKT}0.08)`, textAlign: 'left', verticalAlign: 'top' },
  bestel: { background: '#F1ECE1', borderRadius: 18, padding: 'clamp(18px, 3vw, 28px)', marginTop: 8 },
}
