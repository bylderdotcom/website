// Verwijzing naar de ledenkorting, in dezelfde vorm als GietvloerCTA en KastCTA: donker vlak,
// tekst met één knop. Voor onderdelen waar geen eigen Bylder-product bij hoort (badkamer,
// keuken, schilderwerk), maar wel merken met korting.

export default function VoucherCTA({
  aanleiding, merken, marge = '44px 0', label = 'Ledenkorting',
  titel = `Korting bij ${merken} merken, met een gratis account`,
}: { aanleiding: string; merken: number; marge?: string; label?: string; titel?: string }) {
  return (
    <aside aria-label="Ledenkorting" style={{ background: '#1A1208', borderRadius: 20, margin: marge, padding: '28px 28px 26px' }}>
      <div style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8A87C', fontWeight: 700, marginBottom: 10 }}>{label}</div>
      <h2 style={{ fontSize: '1.55rem', lineHeight: 1.2, fontWeight: 800, color: '#F5F0E8', margin: '0 0 10px', letterSpacing: '-0.022em', textWrap: 'balance' }}>{titel}</h2>
      <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.78)', margin: '0 0 18px', maxWidth: '62ch' }}>{aanleiding}</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href="/vouchers/" style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800, fontSize: 16, padding: '15px 26px', borderRadius: 12, textDecoration: 'none' }}>Bekijk de kortingen &rarr;</a>
        <a href="/vouchers/auping/" style={{ color: '#F5F0E8', fontWeight: 700, fontSize: 14.5 }}>Auping: 10% en een gratis leenbed</a>
      </div>
    </aside>
  )
}
