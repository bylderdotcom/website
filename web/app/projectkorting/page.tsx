import type { Metadata } from 'next'
import { Stijl as S } from '../nieuwbouw-afwerken/stijl'
import { TREDEN } from '@/lib/projectkorting'

/**
 * /projectkorting/ — uitleg van de projectkorting (besluit Daniel, 3-11-2026): hoe meer woningen in
 * hetzelfde nieuwbouwproject de afwerking door Bylder laten doen, hoe hoger de korting voor iedereen.
 * Op elke projectpagina staat het blok met de teller en de deelknop (ProjectKorting.tsx).
 * Woordkeus: "projectkorting" en "samen met je buren"; "collectiviteitskorting" kennen kopers van de
 * zorgverzekering.
 */

const URL = 'https://www.bylder.com/projectkorting/'

export const metadata: Metadata = {
  title: 'Projectkorting: samen met je buren je nieuwbouw afwerken, tot 10% korting | Bylder',
  description: `Laten meer woningen in jouw nieuwbouwproject de afwerking door Bylder doen, dan krijgt iedereen korting: ${TREDEN.map(t => `${t.procent}% vanaf ${t.woningen}`).join(', ')} woningen. Ook als je eerder tekende.`,
  alternates: { canonical: URL },
  openGraph: { title: 'Projectkorting: samen met je buren tot 10% korting op je afwerking', url: URL, type: 'website' },
}

const VRAGEN = [
  { v: 'Wat is de projectkorting?', a: `Korting op de afwerking door Bylder (stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten) die stijgt naarmate meer woningen in hetzelfde nieuwbouwproject meedoen: ${TREDEN.map(t => `${t.procent}% vanaf ${t.woningen} woningen`).join(', ')}. Iedereen in het project krijgt dezelfde korting.` },
  { v: 'Krijg ik de korting ook als ik als eerste teken?', a: 'Ja. Doen er later meer buren mee, dan gaat jouw korting mee omhoog, tot je werk begint. We verrekenen het verschil in je offerte of op de eindfactuur. Vroeg tekenen kost je dus niets.' },
  { v: 'Wat telt mee?', a: 'Getekende opdrachten voor de afwerking door Bylder, per woning één keer, in hetzelfde nieuwbouwproject. Een aanvraag of offerte telt nog niet mee.' },
  { v: 'Waarom kan Bylder dit geven?', a: 'Werken we in meerdere woningen in hetzelfde project, dan plannen we het werk achter elkaar: geen reistijd, geen gaten in de planning, en materiaal in één keer. Dat voordeel geven we door.' },
  { v: 'Hoe nodig ik mijn buren uit?', a: 'Op de pagina van je project staat een knop om de projectkorting via WhatsApp te delen, bijvoorbeeld in de groep van je project. Wie via die link een offerte aanvraagt, telt mee voor jullie project.' },
  { v: 'Zie ik wie er meedoen?', a: 'Nee. Op de projectpagina staat alleen het aantal woningen, en pas vanaf drie, zodat niemand herkenbaar is.' },
  { v: 'Geldt het ook voor bestaande bouw?', a: 'De projectkorting geldt voor woningen in hetzelfde nieuwbouwproject. Voor een bestaande woning of een renovatie maken we gewoon een offerte; je betaalt alleen de prijs die in de offerte staat.' },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Projectkorting', url: URL,
      about: { '@type': 'Service', name: 'Afwerking van een nieuwbouwwoning door Bylder', provider: { '@type': 'Organization', name: 'Bylder', url: 'https://www.bylder.com/' }, areaServed: 'NL' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Nieuwbouw laten afwerken', item: 'https://www.bylder.com/nieuwbouw-afwerken/' },
      { '@type': 'ListItem', position: 3, name: 'Projectkorting', item: URL }] },
  ]
  return (
    <main style={S.main}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={S.kruimel}>
        <a href="/" style={S.kruimelLink}>Home</a> › <a href="/nieuwbouw-afwerken/" style={S.kruimelLink}>Nieuwbouw laten afwerken</a> › Projectkorting
      </nav>
      <p style={S.oog}>Projectkorting</p>
      <h1 style={S.h1}>Samen met je buren afwerken. Hoe meer woningen meedoen, hoe meer korting voor iedereen.</h1>
      <p style={S.lead}>
        Laten meer woningen in jouw nieuwbouwproject de afwerking door Bylder doen, dan krijgt iedereen in dat project korting
        op zijn offerte. Ook wie als eerste tekende: de korting gaat mee omhoog tot je werk begint.
      </p>

      <ol aria-label="Treden" style={{ ...S.stappen, margin: '8px 0 26px' }}>
        {TREDEN.map(t => (
          <li key={t.woningen} style={S.stap}>
            <span style={{ ...S.nummer, width: 'auto', padding: '0 10px', fontSize: 18 }}>{t.procent}%</span>
            <span style={{ fontSize: 15.5, lineHeight: 1.55 }}><strong>Vanaf {t.woningen} woningen</strong> in hetzelfde project. Bij een afwerking van €25.000 is dat €{(250 * t.procent).toLocaleString('nl-NL')}.</span>
          </li>
        ))}
      </ol>
      <a href="/nieuwbouw-afwerken/#aanvraag" data-meet="projectkorting-uitleg" style={S.knop}>Vraag een offerte aan</a>

      <h2 style={S.h2}>Zo werkt het</h2>
      <ol style={S.stappen}>
        {[
          ['Vraag je offerte aan', 'vanaf de pagina van je project. Dan weten we bij welk project je hoort.'],
          ['Deel de link met je buren', 'bijvoorbeeld in de WhatsApp-groep van je project. De knop staat op je projectpagina.'],
          ['Iedereen krijgt de hoogste korting', 'die het project haalt voordat zijn werk begint. We verrekenen het in de offerte of op de eindfactuur.'],
        ].map(([t, p], i) => (
          <li key={t} style={S.stap}><span style={S.nummer}>{i + 1}</span><span style={{ fontSize: 15.5, lineHeight: 1.55 }}><strong>{t}</strong> {p}</span></li>
        ))}
      </ol>
      <p style={{ ...S.p, marginTop: 16 }}>
        Je project vind je bij de <a href="/nieuwbouw-project/" style={S.link}>nieuwbouwprojecten</a>. Wat de afwerking kost en wat
        erin zit, staat bij <a href="/nieuwbouw-afwerken/" style={S.link}>nieuwbouw laten afwerken</a>.
      </p>

      <h2 style={S.h2}>Vragen</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={S.vraag}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15.5 }}>{q.v}</summary>
            <p style={{ ...S.p, fontSize: 15, margin: '10px 0 0' }}>{q.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
