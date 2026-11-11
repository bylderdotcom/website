import { VOORBEELD_LAGEN } from '../mijn-woning/voorbeeld'

/**
 * Het vaste beeld van Bylder (stijlboek, 11-11-2026): de voorbeeldwoning als maquette, van bovenaf, met
 * witte muren en een donkere rand, zoals in de film op de homepage. Per onderwerp krijgt precies één
 * onderdeel de groene accentkleur: de vloer, de deuren, de wanden, de badkamer of een kast. Alles
 * daaromheen blijft papierkleurig. Zelfde projectie en kleuren als de woning in 3D op /mijn-woning/.
 * Servercomponent: geen script, geen afbeelding om te laden.
 */

export type MaquetteAccent = 'geen' | 'stucwerk' | 'tegelwerk' | 'sanitair' | 'vloeren' | 'binnendeuren' | 'schilderwerk' | 'kasten'

const COS = Math.cos(Math.PI / 6), YK = 0.42, ZK = 0.62
const iso = (x: number, y: number, z: number) => [(x - y) * COS, (x + y) * YK - z * ZK]
const pts = (a: number[][]) => a.map(q => { const p = iso(q[0], q[1], q[2]); return p[0].toFixed(0) + ',' + p[1].toFixed(0) }).join(' ')

const MUUR = 1300
const PAPIER = { x: '#F7F4EE', y: '#E4DED3', t: '#2F2A24', lijn: '#D4CCBF' }
const GROEN = { x: '#5E7F5F', y: '#4A6A4B', t: '#3D5A3E', lijn: '#3D5A3E', vlak: '#C4D3BF' }

/** Welke verdieping het onderwerp het best laat zien. */
const LAAG: Record<MaquetteAccent, number> = { geen: 0, stucwerk: 0, tegelwerk: 1, sanitair: 1, vloeren: 0, binnendeuren: 1, schilderwerk: 1, kasten: 1 }

export const MAQUETTE_ALT: Record<MaquetteAccent, string> = {
  geen: 'Voorbeeldwoning als maquette, van bovenaf',
  stucwerk: 'Maquette van een woning met alle wanden in groen: het stucwerk',
  tegelwerk: 'Maquette van een verdieping met de badkamervloer in groene tegels',
  sanitair: 'Maquette van een verdieping met bad, wastafel en toilet in groen in de badkamer',
  vloeren: 'Maquette van de begane grond met de hele vloer in groen',
  binnendeuren: 'Maquette van een verdieping met de vier binnendeuren in groen',
  schilderwerk: 'Maquette van een verdieping met de wanden in groen: het schilderwerk',
  kasten: 'Maquette van een verdieping met een kast op maat in groen in de slaapkamer',
}

function teken(accent: MaquetteAccent): string {
  const l = VOORBEELD_LAGEN[LAAG[accent]]
  const k = l.kader, bx = k[2] - k[0], by = k[3] - k[1]
  const stuk: { d: number; s: string }[] = []
  const blok = (x0: number, y0: number, x1: number, y1: number, h: number, kl: typeof PAPIER, z0 = 0) => {
    const c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
    ;[[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([i, j]) => {
      const a = c[i], b = c[j]
      stuk.push({ d: (a[0] + b[0] + a[1] + b[1]) / 2, s: `<polygon fill="${i % 2 === 0 ? kl.x : kl.y}" stroke="${kl.lijn}" stroke-width="10" stroke-linejoin="round" points="${pts([[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], h], [a[0], a[1], h]])}"/>` })
    })
    stuk.push({ d: (x0 + x1 + y0 + y1) / 2 + 1, s: `<polygon fill="${kl.t}" stroke="${kl.t}" stroke-width="10" stroke-linejoin="round" points="${pts(c.map(q => [q[0], q[1], h]))}"/>` })
  }
  const vlak = (x0: number, y0: number, x1: number, y1: number, vul: string) =>
    `<polygon fill="${vul}" points="${pts([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]])}"/>`

  let vloer = `<polygon fill="rgba(26,18,8,.10)" points="${pts([[260, 420, 0], [bx + 420, 420, 0], [bx + 420, by + 520, 0], [260, by + 520, 0]])}"/>`
    + `<polygon fill="#ECE7DE" stroke="#D8D1C4" stroke-width="16" points="${pts([[0, 0, 0], [bx, 0, 0], [bx, by, 0], [0, by, 0]])}"/>`

  if (accent === 'vloeren') l.ruimtes.forEach(r => r.stroken.forEach(s => { vloer += vlak(s[0], s[1], s[2], s[3], GROEN.vlak) }))
  const bad = l.ruimtes.find(r => /badkamer/i.test(r.naam))
  if (bad && (accent === 'tegelwerk' || accent === 'sanitair')) {
    const s = bad.stroken[0]
    vloer += vlak(s[0], s[1], s[2], s[3], accent === 'tegelwerk' ? GROEN.vlak : '#DDE5DA')
    if (accent === 'tegelwerk') {
      for (let x = s[0] + 300; x < s[2]; x += 300) { const a = iso(x, s[1], 0), b = iso(x, s[3], 0); vloer += `<line x1="${a[0].toFixed(0)}" y1="${a[1].toFixed(0)}" x2="${b[0].toFixed(0)}" y2="${b[1].toFixed(0)}" stroke="${GROEN.t}" stroke-width="14"/>` }
      for (let y = s[1] + 300; y < s[3]; y += 300) { const a = iso(s[0], y, 0), b = iso(s[2], y, 0); vloer += `<line x1="${a[0].toFixed(0)}" y1="${a[1].toFixed(0)}" x2="${b[0].toFixed(0)}" y2="${b[1].toFixed(0)}" stroke="${GROEN.t}" stroke-width="14"/>` }
    }
  }

  const wandKleur = accent === 'stucwerk' || accent === 'schilderwerk' ? { ...GROEN, x: '#C9D8C5', y: '#AFC3AB' } : PAPIER
  l.wanden.forEach(w => blok(w[0], w[1], w[2], w[3], MUUR, wandKleur))

  if (accent === 'binnendeuren') l.deuren.forEach(d => {
    // De deur staat in de wand waar hij doorheen gaat: langs de lange kant van die wand, iets dikker, in groen.
    const w = l.wanden.find(q => d.x >= q[0] && d.x <= q[2] && d.y >= q[1] && d.y <= q[3])
    const langsY = w ? (w[3] - w[1]) > (w[2] - w[0]) : false
    const h = d.breedte / 2, dik = 90
    if (langsY) blok(d.x - dik, d.y - h, d.x + dik, d.y + h, MUUR + 40, GROEN)
    else blok(d.x - h, d.y - dik, d.x + h, d.y + dik, MUUR + 40, GROEN)
  })
  if (accent === 'sanitair' && bad) {
    const s = bad.stroken[0]
    blok(s[2] - 1750, s[1] + 60, s[2] - 60, s[1] + 800, 560, GROEN)            // bad
    blok(s[0] + 60, s[3] - 1300, s[0] + 520, s[3] - 100, 850, GROEN)            // wastafelmeubel
    blok(s[2] - 460, s[3] - 700, s[2] - 60, s[3] - 160, 420, GROEN)             // toilet
  }
  if (accent === 'kasten') {
    const r = l.ruimtes.find(q => /slaapkamer 1/i.test(q.naam))
    if (r) { const s = r.stroken[0]; blok(s[0] + 40, s[1] + 40, s[0] + 3000, s[1] + 640, MUUR - 60, GROEN) }
  }

  stuk.sort((p, q) => p.d - q.d)
  const xs: number[] = [], ys: number[] = []
  ;[[0, 0], [bx, 0], [bx, by], [0, by]].forEach(q => [0, MUUR].forEach(z => { const p = iso(q[0], q[1], z); xs.push(p[0]); ys.push(p[1]) }))
  const pad = 700, vx0 = Math.min(...xs) - pad, vx1 = Math.max(...xs) + pad, vy0 = Math.min(...ys) - pad, vy1 = Math.max(...ys) + pad
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx0.toFixed(0)} ${vy0.toFixed(0)} ${(vx1 - vx0).toFixed(0)} ${(vy1 - vy0).toFixed(0)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${MAQUETTE_ALT[accent]}" style="display:block;width:100%;height:auto">`
    + vloer + stuk.map(x => x.s).join('') + '</svg>'
}

/** De maquette als losse svg-tekst, voor wie er een afbeelding van wil maken (deelbeeld, mail, offerte). */
export const maquetteSvg = teken

export default function Maquette({ accent = 'geen', bijschrift, style }: { accent?: MaquetteAccent; bijschrift?: string; style?: React.CSSProperties }) {
  return (
    <figure style={{ margin: 0, ...style }}>
      <div dangerouslySetInnerHTML={{ __html: teken(accent) }} />
      {bijschrift && <figcaption className="maat" style={{ fontSize: 13, color: 'rgba(61,46,30,0.65)', marginTop: 6, textAlign: 'center' }}>{bijschrift}</figcaption>}
    </figure>
  )
}
