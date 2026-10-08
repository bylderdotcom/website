// KOPIE van app/src/components/kast/Werkplaats.tsx (bylderdotcom/app). Wijzig beide tegelijk.
import { zaaglijst, platen, beslag, type Bouw } from '@/lib/kast/rekenmodel'

// Wat het timmerbedrijf nodig heeft: zaaglijst, platen, beslag en de vakken.

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(61,46,30,.55)', fontFamily: 'monospace', background: '#F5F0E8' }
const td: React.CSSProperties = { padding: '7px 10px', borderTop: '1px solid rgba(61,46,30,.1)', fontSize: 13.5, verticalAlign: 'top' }
const n: React.CSSProperties = { ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const tabel: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', background: '#fff' }
const doos: React.CSSProperties = { overflowX: 'auto', border: '1px solid rgba(61,46,30,.12)', borderRadius: 12 }
const nl = (v: number) => v.toLocaleString('nl-NL')

export default function Werkplaats({ bouw }: { bouw: Bouw }) {
  const lijst = zaaglijst(bouw)
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {(bouw.fouten.length > 0 || bouw.waarschuwingen.length > 0) && (
        <div style={{ display: 'grid', gap: 6 }}>
          {bouw.fouten.map((f, i) => <p key={'f' + i} style={{ margin: 0, fontSize: 13.5, color: '#8C2F1E', background: 'rgba(184,92,56,.09)', padding: '8px 12px', borderRadius: 10 }}>{f}</p>)}
          {bouw.waarschuwingen.map((w, i) => <p key={'w' + i} style={{ margin: 0, fontSize: 13.5, color: '#6B5A1F', background: 'rgba(200,160,60,.12)', padding: '8px 12px', borderRadius: 10 }}>{w}</p>)}
        </div>
      )}
      <div>
        <h3 style={{ fontSize: 15, margin: '0 0 8px' }}>Vakken</h3>
        <div style={doos}><table style={tabel}><thead><tr><th style={th}>Vak</th><th style={{ ...th, textAlign: 'right' }}>Breed</th><th style={{ ...th, textAlign: 'right' }}>Vrij hoog</th><th style={th}>Voor</th></tr></thead>
          <tbody>{bouw.vakken.map((v, i) => <tr key={i}><td style={td}>{v.waar}</td><td style={n}>{nl(v.breedte)} cm</td><td style={n}>{nl(v.vrijeHoogte)} cm</td><td style={td}>{v.functie ?? ''}</td></tr>)}</tbody></table></div>
      </div>
      <div>
        <h3 style={{ fontSize: 15, margin: '0 0 8px' }}>Zaaglijst <span style={{ fontWeight: 400, color: 'rgba(61,46,30,.6)', fontSize: 13 }}>· maten in mm</span></h3>
        <div style={doos}><table style={tabel}>
          <thead><tr><th style={th}>Onderdeel</th><th style={th}>Waar</th><th style={{ ...th, textAlign: 'right' }}>L</th><th style={{ ...th, textAlign: 'right' }}>B</th><th style={{ ...th, textAlign: 'right' }}>D</th><th style={{ ...th, textAlign: 'right' }}>Aantal</th><th style={th}>Afwerking</th></tr></thead>
          <tbody>{lijst.flatMap((r, i) => {
            const rij = <tr key={i}><td style={td}>{r.naam}</td><td style={td}>{r.waar.join(', ')}</td><td style={n}>{nl(r.L)}</td><td style={n}>{nl(r.B)}</td><td style={n}>{r.T}</td><td style={n}>{r.n}</td><td style={td}>{r.afwerking}</td></tr>
            if (i > 0 && lijst[i - 1].mat === r.mat) return [rij]
            return [<tr key={'m' + i}><td colSpan={7} style={{ ...td, background: '#F5F0E8', fontWeight: 700 }}>{r.mat}</td></tr>, rij]
          })}</tbody></table></div>
      </div>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
        <div><h3 style={{ fontSize: 15, margin: '0 0 8px' }}>Platen</h3>
          <div style={doos}><table style={tabel}><thead><tr><th style={th}>Plaat</th><th style={{ ...th, textAlign: 'right' }}>m²</th><th style={{ ...th, textAlign: 'right' }}>Platen</th></tr></thead>
            <tbody>{platen(bouw).map((p, i) => <tr key={i}><td style={td}>{p.mat}</td><td style={n}>{nl(p.m2)}</td><td style={n}>{p.platen}</td></tr>)}</tbody></table></div></div>
        <div><h3 style={{ fontSize: 15, margin: '0 0 8px' }}>Beslag</h3>
          <div style={doos}><table style={tabel}><thead><tr><th style={th}>Onderdeel</th><th style={{ ...th, textAlign: 'right' }}>Aantal</th></tr></thead>
            <tbody>{beslag(bouw).map(([a, b], i) => <tr key={i}><td style={td}>{a}</td><td style={n}>{b}</td></tr>)}</tbody></table></div></div>
      </div>
    </div>
  )
}
