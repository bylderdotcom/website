// "Eén ontwerp, tot drie offertes" (13-11-2026, besluit Daniel): de 3D-aanbesteding voor de kast op maat. De koper
// nodigt zelf de bedrijven uit die hij kent; ze rekenen allemaal op hetzelfde ontwerp, met dezelfde maten en zaaglijst.
// Bewust "tot drie" en "die je kent": op 13-11-2026 was er nog geen timmerbedrijf als partner aangesloten, dus wij
// beloven geen offertes uit ons eigen netwerk. Waar we wel een partner hebben, vult de app aan. Het uitnodigen zelf
// zit in de app (dashboard/offertes/<id>#uitnodigen); de periode van plaatsen vraagt de aanvraag in de ontwerper.
// Geen belofte over capaciteit: doorsturen op de planning van bedrijven bestaat nog niet.
// Vervangt op de kastenpagina's het blok EigenVakmanMeekijken: dat vertelde hetzelfde.

const INKT = 'rgba(61,46,30,', GROEN = '#3D5A3E'
const PUNTEN: [string, string][] = [
  ['Hetzelfde ontwerp voor iedereen', 'Elk bedrijf krijgt je kast in 3D, met de maten, de indeling en de zaaglijst. Niemand hoeft te gokken, dus je vergelijkt prijzen voor precies dezelfde kast.'],
  ['Jij kiest wie meedoet', 'Een timmerman, een interieurbouwer, een keukenzaak: nodig tot drie bedrijven uit die je kent. Ze hebben geen account nodig en zien alleen wat jij deelt.'],
  ['Geplaatst wanneer het jou past', 'Je geeft aan in welke maanden de kast geplaatst moet worden. Die periode gaat mee met je aanvraag, zodat een bedrijf meteen ziet of het past.'],
]

export default function DrieOffertes({ href, marge = '56px 0 0' }: { href: string; marge?: string }) {
  return (
    <section aria-labelledby="drie-kop" style={{ margin: marge }}>
      <p style={{ font: "700 13px 'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B85C38', margin: '0 0 12px' }}>Offertes vergelijken</p>
      <h2 id="drie-kop" style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '0 0 12px', textWrap: 'balance', color: '#1A1208' }}>Eén ontwerp, tot drie offertes</h2>
      <p style={{ fontSize: 16.5, lineHeight: 1.7, color: `${INKT}0.8)`, margin: '0 0 18px', maxWidth: '66ch' }}>
        Vraag je bij drie bedrijven een kast aan, dan krijg je drie verschillende kasten terug. Hier werkt het andersom: je ontwerpt de kast één keer, en de bedrijven rekenen allemaal op dat ene ontwerp.
      </p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0 32px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
        {PUNTEN.map(([kop, tekst], i) => (
          <li key={kop} style={{ borderTop: `1px solid ${INKT}0.14)`, padding: '16px 0 8px' }}>
            <span className="maat" style={{ color: GROEN, fontWeight: 700, fontSize: 14 }}>0{i + 1}</span>
            <strong style={{ display: 'block', fontSize: 18, margin: '6px 0', color: '#1A1208' }}>{kop}</strong>
            <span style={{ fontSize: 15.5, lineHeight: 1.6, color: `${INKT}0.78)` }}>{tekst}</span>
          </li>
        ))}
      </ol>
      <p style={{ margin: '14px 0 0', fontSize: 16 }}><a href={href} data-meet="drie-offertes" style={{ color: GROEN, fontWeight: 800 }}>Ontwerp je kast en vraag offertes aan →</a></p>
    </section>
  )
}
