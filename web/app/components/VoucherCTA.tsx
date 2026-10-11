// Verwijzing naar de ledenkorting, in dezelfde vorm als GietvloerCTA en KastCTA: donker vlak,
// tekst met één knop. Voor onderwerpen waar geen eigen Bylder-product bij hoort, maar wel
// merken met korting. Met 'lijst' staan de merken zelf erin, met hun korting: dat is concreter
// dan een getal, en het komt uit dezelfde bron als de rest (data/deelnemers.json).

type Merk = { naam: string; aanbod: string; plaats?: string }

export default function VoucherCTA({
  aanleiding, merken, lijst, marge = '44px 0', label = 'Ledenkorting',
  titel = `Korting bij ${merken} merken, met een gratis account`,
}: { aanleiding: string; merken: number; lijst?: Merk[]; marge?: string; label?: string; titel?: string }) {
  return (
    <aside aria-label="Ledenkorting" style={{ background: '#1A1208', borderRadius: 20, margin: marge, padding: '28px 28px 26px' }}>
      <div style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10 }}>{label}</div>
      <h2 style={{ fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px', letterSpacing: '-0.022em', textWrap: 'balance' }}>{titel}</h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 18px', maxWidth: '62ch' }}>{aanleiding}</p>
      {lijst && lijst.length > 0 && (
        <ul aria-label="Merken met korting" style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))' }}>
          {lijst.map(m => (
            <li key={m.naam} style={{ border: '1px solid rgba(245,240,232,0.18)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
              <span style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 14.5 }}>{m.naam}</span>
              <span style={{ color: '#E8A87C', fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>{m.aanbod}</span>
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href="/vouchers/" style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }}>Bekijk de kortingen &rarr;</a>
        <a href="/vouchers/auping/" style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 14.5 }}>Auping: 10% en een gratis leenbed</a>
      </div>
    </aside>
  )
}
