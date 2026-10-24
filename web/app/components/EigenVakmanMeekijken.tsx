// "Je eigen vakman kijkt mee" (besluit Daniel, 24-10-2026).
//
// In de app nodigt een koper naast onze partners ook zelf bedrijven uit. Die krijgen
// een link, kijken mee in de woning met de producten die de koper samenstelde, en
// zetten hun offerte ernaast. Voor de koper een reden om bij Bylder te beginnen; voor
// ons de manier waarop nieuwe partners ons leren kennen.
//
// Eén blok voor alle landingspagina's, zodat de belofte overal hetzelfde luidt.
// `product` maakt de kop concreet ("je gietvloer"); `campagne` gaat mee als utm.

const GROEN = '#3D5A3E'

const PUNTEN: Array<{ titel: string; tekst: string; icoon: React.ReactNode }> = [
  {
    titel: 'Dezelfde maten voor iedereen',
    tekst: 'Elk bedrijf rekent op de maten uit jouw tekening en op wat je samenstelde. Zo vergelijk je offertes die over hetzelfde gaan.',
    icoon: <path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6" />,
  },
  {
    titel: 'Alle offertes naast elkaar',
    tekst: 'De offerte van je eigen vakman staat naast die van onze partners. Je kiest zelf bij wie je tekent.',
    icoon: <path d="M4 5h7v14H4zM13 5h7v14h-7zM6.5 9h2M6.5 12h2M15.5 9h2M15.5 12h2" />,
  },
  {
    titel: 'Jij bepaalt wat ze zien',
    tekst: 'Per bedrijf kies je of het je tekening en je woning ziet. Een uitnodiging trek je met één klik in.',
    icoon: <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3zM9 12l2 2 4-4" />,
  },
]

export default function EigenVakmanMeekijken({ product, campagne, marge = '48px 0 0' }: {
  /** Bv. "je gietvloer"; zonder: "je woning". */
  product?: string
  campagne: string
  marge?: string
}) {
  const href = `https://app.bylder.com/registreer?utm_source=bylder-site&utm_campaign=${encodeURIComponent(campagne)}&utm_content=eigen-vakman`
  return (
    <section aria-labelledby={`eigen-vakman-${campagne}`} style={{ margin: marge, background: '#fff', border: '1px solid rgba(61,46,30,0.1)', borderRadius: 18, padding: 'clamp(22px, 4vw, 36px)', color: '#1A1208' }}>
      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: GROEN, margin: '0 0 10px' }}>
        Je eigen vakman kijkt mee
      </p>
      <h2 id={`eigen-vakman-${campagne}`} style={{ fontSize: 'clamp(1.35rem, 2.4vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 12px', textWrap: 'balance' }}>
        Ook het bedrijf dat jij al kent, maakt een offerte voor {product ?? 'je woning'}.
      </h2>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: 'rgba(61,46,30,0.8)', margin: '0 0 22px', maxWidth: '68ch' }}>
        Naast de vakbedrijven en verwerkers die al bij Bylder zitten, nodig je zelf bedrijven uit. Ze krijgen
        een link, zien je woning in 3D met de deuren, vloer en kasten die je samenstelde, en zetten hun offerte
        ernaast. Het bedrijf heeft geen account nodig en betaalt niets.
      </p>
      <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {PUNTEN.map(p => (
          <li key={p.titel} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GROEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>{p.icoon}</svg>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, margin: '0 0 4px' }}>{p.titel}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(61,46,30,0.75)', margin: 0 }}>{p.tekst}</p>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <a href={href} style={{ display: 'inline-block', background: GROEN, color: '#F5F0E8', borderRadius: 11, padding: '13px 22px', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
          Zet je woning in Bylder
        </a>
        <span style={{ fontSize: 13.5, color: 'rgba(61,46,30,0.6)' }}>Gratis voor bewoners. Uitnodigen doe je vanuit je offerteaanvraag.</span>
      </div>
    </section>
  )
}

/** Voor de FAQ op pagina's met dit blok, en voor hun FAQPage-schema. */
export const EIGEN_VAKMAN_VRAAG = {
  v: 'Kan ik ook mijn eigen vakman laten meekijken?',
  a: 'Ja. Naast de vakbedrijven en verwerkers die al bij Bylder zitten, nodig je in je offerteaanvraag zelf bedrijven uit met hun e-mailadres. '
    + 'Ze kijken mee in je woning met de producten die je samenstelde en zetten hun offerte naast die van onze partners. '
    + 'Het bedrijf heeft geen account nodig en betaalt niets. Jij bepaalt per bedrijf of het je tekening ziet.',
}
