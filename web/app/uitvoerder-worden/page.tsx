import type { Metadata } from 'next'
import { Stijl as S, Lijn } from '../nieuwbouw-afwerken/stijl'
import Aanmelden from './Aanmelden'

/**
 * /uitvoerder-worden/ — vakbedrijven die als onderaannemer werk doen in de afwerking met Bylder als
 * aannemer (besluit Daniel, 28-10-2026). Werving via pull: deze pagina, de link na het claimen van
 * een profiel en de profielen in de gids. Nooit koude e-mail (zie Compliance in CLAUDE.md).
 * Geen beloftes over tarief of betaaltermijn: die staan in de overeenkomst.
 */

const URL = 'https://www.bylder.com/uitvoerder-worden/'

export const metadata: Metadata = {
  title: 'Uitvoerder worden: werk in nieuwbouw zonder acquisitie | Bylder',
  description: 'Stukadoor, tegelzetter, vloerenlegger, schilder of timmerbedrijf? Doe werk in nieuwbouw waarvoor Bylder de opdracht aanneemt. Geen acquisitie.',
  alternates: { canonical: URL },
  openGraph: { title: 'Werk in nieuwbouw, zonder acquisitie', url: URL, type: 'website',
    description: 'Bylder neemt de afwerking van nieuwbouwwoningen aan. Wij zoeken vakbedrijven die het werk doen.' },
}

const KRIJGT = [
  'Werk in nieuwbouwwoningen, ingepland vanaf de opleverdatum, zodat je weken vooruit weet waar je staat',
  'De maten en keuzes vooraf: vierkante meters per ruimte, gekozen tegels en vloeren, deuren en kasten met zaaglijst',
  'Geen acquisitie en geen offertes maken voor niets: wij verkopen, jij voert uit',
  'Eén opdrachtgever die de planning bewaakt, zodat de ruimte vrij is als jij komt',
]
const VRAGEN_WE = [
  'Ingeschreven bij de KvK, met een aansprakelijkheidsverzekering voor bedrijven',
  'Ervaring met dit werk in woningen, het liefst in nieuwbouw',
  'Je komt op de afgesproken dag, en meldt het als dat niet lukt',
  'Na afloop foto’s van het werk, voor de oplevering aan de koper',
]
const STAPPEN = [
  { t: 'Aanmelden', p: 'Met het formulier hieronder. Kost twee minuten.' },
  { t: 'Kennismaken', p: 'We bellen je binnen een week. Wat doe je, waar, en wanneer heb je ruimte?' },
  { t: 'Overeenkomst', p: 'We leggen tarief, betaaltermijn, kwaliteit en garantie vast in een overeenkomst voor onderaanneming.' },
  { t: 'In de planning', p: 'Je krijgt werk met de maten en de planning erbij. Na het werk meld je het klaar, met foto’s.' },
]
const VRAGEN = [
  { v: 'Wat is het verschil met een profiel in de gids?', a: 'In de gids sta je als bedrijf, en kopers vragen jou rechtstreeks een offerte. Als uitvoerder doe je werk waarvoor Bylder de opdracht heeft aangenomen: wij maken de offerte en plannen, jij voert uit. Het kan allebei.' },
  { v: 'Hoe word ik betaald?', a: 'Je factureert aan Bylder. Tarief en betaaltermijn leggen we vooraf vast in de overeenkomst, per vak.' },
  { v: 'Moet ik exclusief voor Bylder werken?', a: 'Nee. Je plant zelf hoeveel ruimte je voor ons vrijhoudt.' },
  { v: 'In welke regio werken jullie?', a: 'In heel Nederland. Geef bij je aanmelding op waar je werkt; we plannen je in voor woningen in jouw werkgebied.' },
]

export default function UitvoerderWordenPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Uitvoerder worden', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › Uitvoerder worden</nav>
      <p style={S.oog}>Voor vakbedrijven</p>
      <h1 style={S.h1}>Werk in nieuwbouw, zonder acquisitie.</h1>
      <p style={S.lead}>
        Bylder neemt de afwerking van nieuwbouwwoningen aan: stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk
        en kasten. Wij hebben geen eigen ploegen. Het werk doen vakbedrijven bij de koper in de buurt. Ben jij er een van?
      </p>
      <a href="#aanmelden" style={S.knop}>Meld je aan als uitvoerder</a>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', marginTop: 8 }}>
        <section>
          <h2 style={S.h2}>Wat je krijgt</h2>
          <ul style={S.vinkjes}>{KRIJGT.map(t => <li key={t} style={{ ...S.vinkje, alignItems: 'flex-start', fontWeight: 500, lineHeight: 1.55 }}><Lijn d="M5 12l5 5 9-10" /> {t}</li>)}</ul>
        </section>
        <section>
          <h2 style={S.h2}>Wat we vragen</h2>
          <ul style={S.vinkjes}>{VRAGEN_WE.map(t => <li key={t} style={{ ...S.vinkje, alignItems: 'flex-start', fontWeight: 500, lineHeight: 1.55 }}><Lijn d="M5 12l5 5 9-10" /> {t}</li>)}</ul>
        </section>
      </div>

      <h2 style={S.h2}>Zo gaat het</h2>
      <ol style={S.stappen}>
        {STAPPEN.map((s, i) => (
          <li key={s.t} style={S.stap}>
            <span aria-hidden="true" style={S.nummer}>{i + 1}</span>
            <div><strong style={{ display: 'block', fontSize: 15.5 }}>{s.t}</strong><span style={{ fontSize: 14.5, color: 'rgba(61,46,30,0.75)' }}>{s.p}</span></div>
          </li>
        ))}
      </ol>

      <section id="aanmelden" aria-labelledby="aanmelden-kop" style={S.aanvraag}>
        <h2 id="aanmelden-kop" style={{ ...S.h2, margin: '0 0 8px' }}>Meld je aan als uitvoerder</h2>
        <p style={{ ...S.p, margin: '0 0 18px' }}>We bellen je binnen een week.</p>
        <Aanmelden />
      </section>

      <h2 style={S.h2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 820 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={S.vraag}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16 }}>{q.v}</summary>
            <p style={{ ...S.p, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>
      <p style={{ ...S.p, marginTop: 22 }}>Liever zelf gevonden worden door kopers? <a href="/voor-vakbedrijven/" style={S.link}>Zet je bedrijf in de gids →</a></p>
    </main>
  )
}
