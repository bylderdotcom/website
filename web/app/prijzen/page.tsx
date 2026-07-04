import type { Metadata } from 'next'

// Fase 0 proof-of-coexistence: deze pagina wordt door Next.js gerenderd,
// terwijl de rest van de site nog uit de bestaande statische HTML komt.
// Metadata (title/description/canonical) spiegelt de bestaande /prijzen/-pagina
// zodat de invarianten (canonical/lang/title) blijven kloppen.
export const metadata: Metadata = {
  title: 'Prijzen — Bylder kopersbegeleiding voor €99 eenmalig',
  description:
    'Bylder kost €99 eenmalig. Geen abonnement. Krijg AI-begeleiding, meerwerkanalyse, kortingsvouchers en meer. Gemiddeld €4.200 besparing.',
  alternates: { canonical: 'https://www.bylder.com/prijzen/' },
}

export default function PrijzenPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', color: '#1A1208' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Prijzen</h1>
      <p style={{ fontSize: 16, color: 'rgba(61,46,30,0.65)', lineHeight: 1.7, marginBottom: 28 }}>
        Bylder kost <strong>€99 eenmalig</strong> — geen abonnement, levenslang toegang voor jouw woning. Leden besparen gemiddeld <strong>€4.200</strong>.
      </p>

      <div style={{ background: '#fff', border: '1px solid rgba(61,46,30,0.12)', borderRadius: 16, padding: 28, marginBottom: 28 }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>€99</div>
        <div style={{ fontSize: 14, color: 'rgba(61,46,30,0.5)', marginBottom: 16 }}>eenmalig · geen abonnement</div>
        <a href="https://app.bylder.com/registreer" style={{ display: 'inline-block', background: '#3D5A3E', color: '#F5F0E8', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
          Start gratis →
        </a>
      </div>

      <p style={{ fontSize: 14, color: 'rgba(61,46,30,0.6)' }}>
        Bekijk ook de <a href="/functies/" style={{ color: '#3D5A3E', fontWeight: 600 }}>functies</a> en de{' '}
        <a href="/vouchers/" style={{ color: '#3D5A3E', fontWeight: 600 }}>kortingsvouchers</a>.
      </p>
    </main>
  )
}
