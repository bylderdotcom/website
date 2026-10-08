// KOPIE van app/src/components/kast/Tekeningen.tsx (bylderdotcom/app). Wijzig beide tegelijk.
import type { Bouw } from '@/lib/kast/rekenmodel'
import type { Ontwerp } from '@/lib/kast/ontwerp'

// Plattegrond en uitslag, getekend uit hetzelfde rekenmodel als het 3D-beeld.
// Maten in cm. De plattegrond is een echt bovenaanzicht (niet gespiegeld t.o.v. 3D).

const K = { maat: '#8A5A2B', lijn: 'rgba(61,46,30,0.55)', muur: '#D9D3C7', kast: '#4F6379', tekst: '#3D2E1E' }
const nl = (v: number) => String(Math.round(v * 10) / 10).replace('.', ',')

function Maat({ x1, y1, x2, y2, label, links = false }: { x1: number; y1: number; x2: number; y2: number; label: string; links?: boolean }) {
  const hor = Math.abs(y2 - y1) < 0.01, mx = (x1 + x2) / 2, my = (y1 + y2) / 2, t = 2.4
  return (
    <g stroke={K.maat} strokeWidth={0.5}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1 - t} y1={y1 + t} x2={x1 + t} y2={y1 - t} /><line x1={x2 - t} y1={y2 + t} x2={x2 + t} y2={y2 - t} />
      <text x={hor ? mx : mx + (links ? -3 : 3)} y={hor ? my - 2.5 : my} fontSize={9} textAnchor="middle" fill={K.maat} stroke="none"
        transform={hor ? undefined : `rotate(-90 ${mx + (links ? -3 : 3)} ${my})`}>{label}</text>
    </g>
  )
}

export function Plattegrond({ bouw }: { bouw: Bouw }) {
  const X = (x: number) => (bouw.spiegel ? -x : x)
  const pts: [number, number][] = []
  bouw.muren.forEach(m => pts.push([X(m.x0), m.z0], [X(m.x1), m.z1]))
  bouw.delen.forEach(d => pts.push([X(d.b[0]), d.b[4]], [X(d.b[1]), d.b[5]]))
  const xs = pts.map(p => p[0]), zs = pts.map(p => p[1])
  const vb = [Math.min(...xs) - 40, Math.min(...zs) - 40, Math.max(...xs) - Math.min(...xs) + 80, Math.max(...zs) - Math.min(...zs) + 110]
  const rect = (b: number[]) => { const a = X(b[0]), c = X(b[1]); return { x: Math.min(a, c), y: b[4], width: Math.abs(c - a), height: b[5] - b[4] } }
  // Doorsnede net boven de plint: alleen de onderste korpussen.
  const yP = Math.min(...bouw.delen.filter(d => d.rol === 'rug').map(d => d.b[2]), 999)
  const laag = (y: number) => y <= yP + 2.5
  const bodems = bouw.delen.filter(d => d.naam === 'Bodem' && laag(d.b[2]))
  const wanden = bouw.delen.filter(d => (d.naam === 'Zijwand' || d.naam === 'Tussenschot' || d.rol === 'rug') && laag(d.b[2]))
  const zicht = bouw.delen.filter(d => (d.rol === 'vul' || d.rol === 'kopwand') && laag(d.b[2]))
  const fronten = bouw.fronten.filter(f => laag(f.b[2]))
  const koppen = new Map<string, Bouw['rond'][number]>()
  bouw.rond.forEach(r => { if (r.type === 'schil' && !r.plint) koppen.set(r.c.join(','), r) })
  return (
    <svg viewBox={vb.join(' ')} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Plattegrond van de kast">
      {bouw.muren.map((m, i) => {
        const hor = Math.abs(m.z1 - m.z0) < Math.abs(m.x1 - m.x0)
        const a = X(m.x0), b = X(m.x1)
        return hor ? <rect key={i} x={Math.min(a, b)} y={m.z0 - 12} width={Math.abs(b - a)} height={12} fill={K.muur} />
          : <rect key={i} x={bouw.spiegel ? X(m.x0) : m.x0 - 12} y={Math.min(m.z0, m.z1)} width={12} height={Math.abs(m.z1 - m.z0)} fill={K.muur} />
      })}
      {bodems.map((d, i) => <rect key={'b' + i} {...rect(d.b)} fill="#fff" />)}
      {wanden.map((d, i) => <rect key={'w' + i} {...rect(d.b)} fill={K.kast} />)}
      {zicht.map((d, i) => <rect key={i} {...rect(d.b)} fill={K.kast} />)}
      {fronten.map((f, i) => <rect key={i} {...rect(f.b)} fill={K.kast} />)}
      {[...koppen.values()].map((r, i) => {
        const n = 20, p: string[] = [`${X(r.c[0])},${r.c[1]}`]
        for (let k = 0; k <= n; k++) { const a = r.theta + (k / n) * Math.PI / 2; p.push(`${X(r.c[0] + r.r * Math.sin(a))},${r.c[1] + r.r * Math.cos(a)}`) }
        return <polygon key={i} points={p.join(' ')} fill="rgba(79,99,121,0.25)" stroke={K.kast} strokeWidth={1.4} />
      })}
      {fronten.filter(f => f.soort === 'deur' && f.scharnier && f.b[3] - f.b[2] > 100).map((f, i) => {
        const w = f.u1 - f.u0, s = f.scharnier!
        const voor = f.as === 'x' ? f.b[5] : f.b[1]
        const P = (u: number, v: number) => (f.as === 'x' ? [X(u), v] : [X(v), u])
        const [ax, ay] = P(s.pos, voor), [bx, by] = P(s.pos + s.richting * w, voor), [cx, cy] = P(s.pos, voor + w)
        const sweep = ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) > 0 ? 1 : 0
        return <g key={i} stroke={K.lijn} strokeWidth={0.4} fill="none"><line x1={ax} y1={ay} x2={cx} y2={cy} /><path d={`M${bx},${by} A${w},${w} 0 0 ${sweep} ${cx},${cy}`} strokeDasharray="2 1.5" /></g>
      })}
      {bouw.maten.benen.map((been, i) => {
        const langsZ = bouw.muren.length === 2 && i === 0
        return langsZ
          ? <Maat key={i} x1={X(-26)} y1={0} x2={X(-26)} y2={been.lengte} label={`${been.muur} ${nl(been.lengte)}`} links={!bouw.spiegel} />
          : <Maat key={i} x1={X(0)} y1={-26} x2={X(been.lengte)} y2={-26} label={`${been.muur} ${nl(been.lengte)}`} />
      })}
    </svg>
  )
}

export function Uitslag({ bouw, ontwerp }: { bouw: Bouw; ontwerp: Ontwerp }) {
  const hoek = ontwerp.opstelling === 'hoek'
  const links = ontwerp.eersteBeenLinks === false ? 1 : 0
  const L = (b: number) => bouw.maten.benen[b]?.lengte ?? 0
  const cx = hoek ? L(links) + 40 : 40
  const XU = (been: number, u: number) => (hoek ? (been === links ? cx - u : cx + u) : cx + u)
  const H = Math.max(ontwerp.plafond, bouw.maten.hoogte)
  const Y = (y: number) => H + 20 - y
  const breedte = hoek ? L(0) + L(1) + 80 : L(0) + 80
  const rect = (been: number, u0: number, u1: number, y0: number, y1: number) => {
    const a = XU(been, u0), b = XU(been, u1)
    return { x: Math.min(a, b), y: Y(y1), width: Math.abs(b - a), height: y1 - y0 }
  }
  const zichtOpen = bouw.delen.filter(d => d.zicht && (d.rol === 'korpus' || d.rol === 'plank'))
  return (
    <svg viewBox={`-16 0 ${breedte + 46} ${H + 60}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Uitslag van de kast met maten">
      <line x1={0} y1={Y(0)} x2={breedte} y2={Y(0)} stroke={K.lijn} strokeWidth={0.6} />
      <line x1={0} y1={Y(ontwerp.plafond)} x2={breedte} y2={Y(ontwerp.plafond)} stroke={K.lijn} strokeWidth={0.6} strokeDasharray="3 2" />
      <text x={breedte - 2} y={Y(ontwerp.plafond) - 3} fontSize={8} textAnchor="end" fill={K.lijn}>plafond</text>
      {hoek && <line x1={cx} y1={Y(0)} x2={cx} y2={Y(ontwerp.plafond)} stroke={K.lijn} strokeWidth={0.5} strokeDasharray="1.5 1.5" />}
      {bouw.delen.filter(d => d.rol === 'plint' || d.rol === 'pas' || d.rol === 'vul').map((d, i) =>
        <rect key={i} {...rect(d.been, d.u0, d.u1, d.b[2], d.b[3])} fill={d.rol === 'plint' ? '#4F6379' : '#7F95AD'} />)}
      {zichtOpen.map((d, i) => <rect key={'o' + i} {...rect(d.been, d.u0, d.u1, d.b[2], d.b[3])} fill={d.rol === 'plank' ? '#6F86A0' : 'rgba(111,134,160,0.25)'} />)}
      {bouw.rond.map((r, i) => <rect key={'r' + i} {...rect(r.been, r.u0, r.u1, r.y0, r.y1)}
        fill={r.type === 'schil' ? (r.plint ? '#4F6379' : '#6F86A0') : r.open ? '#6F86A0' : 'rgba(111,134,160,0.25)'} stroke={r.type === 'schil' ? '#4F6379' : 'none'} strokeWidth={0.3} />)}
      {bouw.fronten.map((f, i) => {
        const r = rect(f.been, f.u0, f.u1, f.b[2], f.b[3])
        const gx = f.greep ? XU(f.been, f.greep.pos) : 0
        return <g key={'f' + i}>
          <rect {...r} fill="#6F86A0" stroke="#4F6379" strokeWidth={0.35} />
          {f.greep && (f.greep.liggend
            ? <rect x={gx - 7.5} y={Y(f.greep.y) - 0.6} width={15} height={1.2} fill="#151515" />
            : <rect x={gx - 0.6} y={Y(f.greep.y + 7.5)} width={1.2} height={15} fill="#151515" />)}
        </g>
      })}
      <Maat x1={-2} y1={Y(0)} x2={-2} y2={Y(bouw.maten.hoogte)} label={nl(bouw.maten.hoogte)} links />
      {(() => {
        // hoogtes per zone van het eerste segment van het linker been
        const zones = ontwerp.benen[hoek ? links : 0]?.segmenten[0]?.zones ?? []
        const stappen = [0, ontwerp.plint?.hoogte ?? 0]
        zones.forEach(z => stappen.push(stappen[stappen.length - 1] + z.hoogte))
        return stappen.slice(1).map((y, i) => <Maat key={'z' + i} x1={14} y1={Y(stappen[i])} x2={14} y2={Y(y)} label={nl(y - stappen[i])} links />)
      })()}
      {bouw.maten.benen.map((b, i) => {
        const a = XU(i, 0), e = XU(i, b.lengte)
        return <Maat key={i} x1={Math.min(a, e)} y1={Y(-14)} x2={Math.max(a, e)} y2={Y(-14)} label={`${b.muur} ${nl(b.lengte)}`} />
      })}
    </svg>
  )
}
