import type { Metadata } from 'next'
import { Stijl as S, Lijn } from '../nieuwbouw-afwerken/stijl'
import AanmeldenGids from './AanmeldenGids'

/**
 * /bedrijf-aanmelden/ — een vakbedrijf vraagt een gratis vermelding in de gids aan (besluit Daniel,
 * 9-11-2026). Verving de mailto-knop op /voor-vakbedrijven/: die aanmeldingen bleven in de mailbox
 * liggen. Gaat naar de app (/api/bedrijf-aanmelding, feature_requests segment 'vermelding').
 * Pull, geen koude mail (Compliance in CLAUDE.md).
 */

const URL = 'https://www.bylder.com/bedrijf-aanmelden/'

export const metadata: Metadata = {
  title: 'Bedrijf aanmelden op Bylder: gratis vermelding in de gids | Bylder',
  description: 'Meld je vakbedrijf gratis aan voor de gids van Bylder. Deel je website, Google- of Werkspot-link; wij stellen je profiel samen en mailen je als het online staat.',
  alternates: { canonical: URL },
  openGraph: { title: 'Bedrijf aanmelden op Bylder', url: URL, type: 'website',
    description: 'Gratis vermelding in de gids voor nieuwbouwkopers. Twee minuten.' },
}

const STAPPEN = [
  { t: 'Aanmelden', p: 'Vak, plaats en een link naar je bedrijf. Twee minuten.' },
  { t: 'Wij stellen je profiel samen', p: 'Met je reviews, werkgebied en contactgegevens. We mailen je zodra het online staat.' },
  { t: 'Claimen en aanvullen', p: 'Je claimt je profiel, vult het aan en kopers in jouw plaats vragen je rechtstreeks een offerte.' },
]
const VRAGEN = [
  { v: 'Wat kost een vermelding?', a: 'Niets. De vermelding in de gids en het claimen van je profiel zijn gratis.' },
  { v: 'Mijn bedrijf staat er al op. Moet ik me aanmelden?', a: 'Nee. Zoek je profiel op en claim het met de knop op die pagina. Aanmelden is voor bedrijven die nog niet in de gids staan.' },
  { v: 'Hoe lang duurt het?', a: 'We kijken elke aanmelding met de hand na. Je krijgt een mail zodra je profiel online staat.' },
]

export default function BedrijfAanmeldenPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Voor vakbedrijven', item: 'https://www.bylder.com/voor-vakbedrijven/' },
      { '@type': 'ListItem', position: 3, name: 'Bedrijf aanmelden', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}><a href="/" style={S.kruimelLink}>Home</a> › <a href="/voor-vakbedrijven/" style={S.kruimelLink}>Voor vakbedrijven</a> › Bedrijf aanmelden</nav>
      <p style={S.oog}>Voor vakbedrijven</p>
      <h1 style={S.h1}>Meld je bedrijf aan voor de gids.</h1>
      <p style={S.lead}>
        Kopers van een nieuwbouwwoning zoeken op Bylder een vakbedrijf in hun plaats. Sta je er nog niet tussen? Meld je
        hier aan. Gratis, en wij stellen je profiel samen.
      </p>

      <section id="aanmelden" aria-labelledby="aanmelden-kop" style={{ ...S.aanvraag, marginTop: 8 }}>
        <h2 id="aanmelden-kop" style={{ ...S.h2, margin: '0 0 8px' }}>Je gegevens</h2>
        <p style={{ ...S.p, margin: '0 0 18px' }}>Velden met * zijn nodig.</p>
        <AanmeldenGids />
      </section>

      <h2 style={S.h2}>Zo gaat het</h2>
      <ol style={S.stappen}>
        {STAPPEN.map((s, i) => (
          <li key={s.t} style={S.stap}>
            <span aria-hidden="true" style={S.nummer}>{i + 1}</span>
            <div><strong style={{ display: 'block', fontSize: 15.5 }}>{s.t}</strong><span style={{ fontSize: 14.5, color: 'rgba(61,46,30,0.75)' }}>{s.p}</span></div>
          </li>
        ))}
      </ol>

      <h2 style={S.h2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 820 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={S.vraag}>
            <summary style={{ fontWeight: 800, cursor: 'pointer', fontSize: 16 }}>{q.v}</summary>
            <p style={{ ...S.p, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>
      <ul style={{ ...S.vinkjes, marginTop: 22 }}>
        <li style={{ ...S.vinkje, fontWeight: 500 }}><Lijn d="M5 12l5 5 9-10" /> <span>Wil je ook werk doen in de afwerking van nieuwbouwwoningen? <a href="/uitvoerder-worden/" style={S.link}>Word uitvoerder →</a></span></li>
      </ul>
    </main>
  )
}
