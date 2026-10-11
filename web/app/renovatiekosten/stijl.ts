import type { CSSProperties } from 'react'

export const INKT = 'rgba(61,46,30,'
export const GROEN = '#3D5A3E'
export const ROEST = '#B85C38'
export const KAART: CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24 }
export const H2: CSSProperties = { fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '54px 0 12px', textWrap: 'balance', color: '#1A1208' }
export const H3: CSSProperties = { fontSize: '1.04rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }
export const P: CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '70ch' }
export const LABEL: CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700 }
export const CEL: CSSProperties = { padding: '12px 14px', fontSize: 14.5, borderBottom: `1px solid ${INKT}0.08)`, color: `${INKT}0.8)`, verticalAlign: 'top', textAlign: 'left' }
export const KNOP: CSSProperties = { background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 15.5, padding: '14px 22px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }
export const KNOP2: CSSProperties = { color: GROEN, fontWeight: 800, fontSize: 15, padding: '13px 18px', borderRadius: 12, textDecoration: 'none', display: 'inline-block', border: `1.5px solid rgba(61,90,62,0.35)` }
export const PAGINA: CSSProperties = { maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px', color: '#1A1208' }
export const BIJGEWERKT = '11 oktober 2026'
