import type { Metadata } from 'next'
import { S, GROEN } from '../stijl'

/**
 * Verzending en retour van de Bylder-winkel (10-11-2026). Nodig voor Google Merchant Center, en de
 * algemene voorwaarden gaan alleen over de digitale dienst. Wat hier staat is het wettelijke minimum
 * voor verkoop op afstand aan consumenten (14 dagen bedenktijd, terugbetaling incl. de standaard
 * verzendkosten binnen 14 dagen, conformiteit), plus de keuzes van Daniel: verzending € 6,95 voor
 * scharnieren, retourkosten voor de koper. Geen garantietermijnen noemen tot de leverancier die
 * heeft bevestigd (zie CLAUDE.md, Geloofwaardigheid).
 */

const URL = 'https://www.bylder.com/winkel/verzending-en-retour/'

export const metadata: Metadata = {
  title: 'Verzending en retour in de winkel | Bylder',
  description: 'Verzendkosten, levering, 14 dagen bedenktijd en terugsturen bij de winkel van Bylder. Ook wat je doet bij een beschadigde of verkeerde levering.',
  alternates: { canonical: URL },
  openGraph: { title: 'Verzending en retour', url: URL, type: 'website', description: 'Verzending, 14 dagen bedenktijd en terugsturen bij de winkel van Bylder.' },
}

const VRAGEN = [
  { v: 'Hoe lang heb ik bedenktijd?', a: '14 dagen vanaf de dag dat je de bestelling in huis hebt. Je hoeft geen reden te geven.' },
  { v: 'Wie betaalt het terugsturen?', a: 'Jij. Was de levering beschadigd of verkeerd, dan betalen wij.' },
  { v: 'Wanneer krijg ik mijn geld terug?', a: 'Binnen 14 dagen nadat je hebt gemeld dat je de bestelling terugstuurt, op de rekening waarmee je betaalde. We mogen wachten tot het product terug is of tot je laat zien dat je het hebt verstuurd.' },
  { v: 'Kan ik maatwerk terugsturen?', a: 'Nee. Wat speciaal voor jou op maat is gemaakt, zoals een deur, een kast of een op maat gezaagd profiel, valt buiten de bedenktijd. Een fout van onze kant lossen we wel op.' },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Winkel', item: 'https://www.bylder.com/winkel/' },
      { '@type': 'ListItem', position: 3, name: 'Verzending en retour', item: URL }] },
  ]
  return (
    <main style={{ ...S.main, maxWidth: 820 }}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/winkel/" style={S.kruimelLink}>Winkel</a> › Verzending en retour</nav>
      <p style={S.oog}>Winkel</p>
      <h1 style={S.h1}>Verzending en retour</h1>
      <p style={S.lead}>Bylder is de verkoper. De leverancier stuurt je bestelling rechtstreeks naar je toe. Hieronder staat wat verzenden kost, hoe je iets terugstuurt en wat je doet als er iets mis is.</p>

      <h2 style={S.h2}>Verzending</h2>
      <p style={S.p}>We leveren in Nederland. Scharnieren en ander klein beslag versturen we als pakket voor <strong>€ 6,95 per bestelling</strong>. Deuren met kozijn gaan met een aparte vervoerder voor <strong>€ 99 per bestelling</strong>. Profielen van 2 meter ook; die kosten staan in onze bevestiging voordat je betaalt.</p>
      <p style={S.p}>Wat op voorraad ligt, gaat doorgaans binnen enkele werkdagen de deur uit. Je krijgt een mail zodra je bestelling onderweg is.</p>

      <h2 style={S.h2}>Terugsturen binnen 14 dagen</h2>
      <p style={S.p}>Je hebt 14 dagen bedenktijd vanaf de dag dat je de bestelling ontvangt. Je hoeft geen reden te geven.</p>
      <ol style={{ ...S.p, paddingLeft: 22 }}>
        <li>Mail binnen die 14 dagen naar <a href="mailto:info@bylder.com?subject=Retour%20bestelling" style={{ color: GROEN }}>info@bylder.com</a> met je naam en bestelnummer. Een modelformulier mag, maar hoeft niet.</li>
        <li>Je krijgt van ons het retouradres. Stuur het product binnen 14 dagen na je melding terug, onbeschadigd en zo veel mogelijk in de originele verpakking.</li>
        <li>Je krijgt het aankoopbedrag terug, inclusief de verzendkosten van de heenweg, binnen 14 dagen na je melding. We mogen wachten tot het product terug is of tot je laat zien dat je het hebt verstuurd.</li>
      </ol>
      <p style={S.p}>De kosten van het terugsturen zijn voor jou. Je mag het product bekijken en passen zoals in een winkel. Is het gemonteerd, ingefreesd of beschadigd, dan kunnen we de waardevermindering in rekening brengen.</p>

      <h2 style={S.h2}>Wat je niet kunt terugsturen</h2>
      <p style={S.p}>Producten die speciaal voor jou op maat zijn gemaakt, zoals een deur, een kast of een op maat gezaagd profiel. Dat staat erbij voordat je bestelt.</p>

      <h2 style={S.h2}>Beschadigd, verkeerd of kapot</h2>
      <p style={S.p}>Controleer je bestelling bij ontvangst. Is er iets beschadigd of klopt de levering niet, mail dan binnen een paar dagen een foto naar <a href="mailto:info@bylder.com?subject=Probleem%20met%20bestelling" style={{ color: GROEN }}>info@bylder.com</a>. Wij regelen een vervangend product of je geld terug, zonder kosten voor jou.</p>
      <p style={S.p}>Een product moet doen wat je ervan mag verwachten. Blijkt er later een gebrek, dan lossen wij dat op: herstellen, vervangen of terugbetalen. Je hoeft daarvoor niet naar de fabrikant.</p>

      <h2 style={S.h2}>Vragen</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={{ ...S.kaart, padding: '14px 18px' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15.5 }}>{q.v}</summary>
            <p style={{ ...S.p, fontSize: 15, margin: '10px 0 0' }}>{q.a}</p>
          </details>
        ))}
      </div>

      <div style={{ ...S.kaart, marginTop: 40 }}>
        <p style={{ ...S.p, margin: '0 0 6px' }}><strong style={{ color: '#1A1208' }}>Bylder Nederland B.V.</strong> · KvK 65020006</p>
        <p style={{ ...S.p, margin: 0 }}>Vragen over je bestelling: <a href="mailto:info@bylder.com" style={{ color: GROEN }}>info@bylder.com</a>. Terug naar <a href="/winkel/" style={{ color: GROEN }}>de winkel</a>.</p>
      </div>
    </main>
  )
}
