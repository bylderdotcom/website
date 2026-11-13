// "Eén ontwerp, tot drie offertes" (13-11-2026, besluit Daniel): de 3D-aanbesteding voor de kast op maat en de gietvloer.
// Bylder kiest zelf hooguit drie bedrijven, op capaciteit in de gevraagde periode en op expertise; de koper nodigt
// niet zelf uit. De bedrijven rekenen allemaal op hetzelfde ontwerp. De selectie staat in de app (src/lib/verdeling.ts),
// Daniel keurt elk voorstel goed. De periode vraagt de aanvraag in de ontwerper.
// LET OP: op 13-11-2026 was er nog geen bedrijf voor kast of gietvloer als partner aangesloten. "Tot drie" is dus een
// belofte die pas waar is zodra er bedrijven met capaciteit en expertise in de app staan.

const INKT = 'rgba(61,46,30,', GROEN = '#3D5A3E'
type Soort = 'kast' | 'gietvloer'
const TEKST: Record<Soort, { intro: string; knop: string; punten: [string, string][] }> = {
  kast: {
    intro: 'Vraag je bij drie bedrijven een kast aan, dan krijg je drie verschillende kasten terug. Hier werkt het andersom: je ontwerpt de kast één keer, en de bedrijven rekenen allemaal op dat ene ontwerp.',
    knop: 'Ontwerp je kast en vraag offertes aan',
    punten: [
      ['Hetzelfde ontwerp voor iedereen', 'Elk bedrijf krijgt je kast in 3D, met de maten, de indeling en de zaaglijst. Niemand hoeft te gokken, dus je vergelijkt prijzen voor precies dezelfde kast.'],
      ['Wij kiezen de bedrijven', 'Je ontwerp gaat naar hooguit drie bedrijven die dit soort kast kunnen maken: gespoten, in fineer, met ronde vormen. Jij hoeft niemand te zoeken.'],
      ['Geplaatst wanneer het jou past', 'Je geeft aan in welke maanden de kast geplaatst moet worden. Wij kiezen bedrijven die dan ruimte hebben.'],
    ],
  },
  // Gietvloer (13-11-2026, besluit Daniel): wij kiezen de verwerkers zelf, dus het blijft de vloer uit de ontwerper.
  gietvloer: {
    intro: 'Vraag je bij drie verwerkers een gietvloer aan, dan rekent elk met eigen maten. Hier werkt het andersom: je kiest je ruimtes en je kleur één keer, en de verwerkers rekenen allemaal op diezelfde aanvraag.',
    knop: 'Ontwerp je gietvloer en vraag offertes aan',
    punten: [
      ['Dezelfde vloer voor iedereen', 'Elke verwerker krijgt je ruimtes, je vierkante meters, het type vloer en de kleur. Zo vergelijk je prijzen voor precies dezelfde vloer.'],
      ['Wij kiezen de verwerkers', 'Je aanvraag gaat naar hooguit drie verwerkers die de vloer leggen die jij koos. Jij hoeft niemand te zoeken.'],
      ['Gelegd wanneer het jou past', 'Je geeft aan in welke maanden de vloer gelegd moet worden. Wij kiezen verwerkers die dan ruimte hebben.'],
    ],
  },
}

export default function DrieOffertes({ href, soort = 'kast', marge = '56px 0 0' }: { href: string; soort?: Soort; marge?: string }) {
  const t = TEKST[soort]
  return (
    <section aria-labelledby="drie-kop" style={{ margin: marge }}>
      <p style={{ font: "700 13px 'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B85C38', margin: '0 0 12px' }}>Offertes vergelijken</p>
      <h2 id="drie-kop" style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '0 0 12px', textWrap: 'balance', color: '#1A1208' }}>Eén ontwerp, tot drie offertes</h2>
      <p style={{ fontSize: 16.5, lineHeight: 1.7, color: `${INKT}0.8)`, margin: '0 0 18px', maxWidth: '66ch' }}>{t.intro}</p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0 32px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
        {t.punten.map(([kop, tekst], i) => (
          <li key={kop} style={{ borderTop: `1px solid ${INKT}0.14)`, padding: '16px 0 8px' }}>
            <span className="maat" style={{ color: GROEN, fontWeight: 700, fontSize: 14 }}>0{i + 1}</span>
            <strong style={{ display: 'block', fontSize: 18, margin: '6px 0', color: '#1A1208' }}>{kop}</strong>
            <span style={{ fontSize: 15.5, lineHeight: 1.6, color: `${INKT}0.78)` }}>{tekst}</span>
          </li>
        ))}
      </ol>
      <p style={{ margin: '14px 0 0', fontSize: 16 }}><a href={href} data-meet={`drie-offertes-${soort}`} style={{ color: GROEN, fontWeight: 800 }}>{t.knop} →</a></p>
    </section>
  )
}
