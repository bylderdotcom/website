import type { Metadata } from 'next'
import MontageAnimatie from './MontageAnimatie'
import { STAPPEN } from './stappen'
import { MONTAGE_UUR, VANAF, euroRond } from '../configurator/prijs'

/**
 * /kozijnloze-deuren/montage/ — hoe een kozijnloze deur wordt gemonteerd, als animatie (besluit Daniel, 11-11-2026).
 * Voor de koper: wat er gebeurt, in welke volgorde en wie het doet, zodat hij weet wat hij moet regelen en wanneer.
 * Geen werkinstructie: maten en bevestiging volgen uit de handleiding van Classic Next (zie stappen.ts).
 */

const URL = 'https://www.bylder.com/kozijnloze-deuren/montage/'
const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

export const metadata: Metadata = {
  title: 'Kozijnloze deur monteren: de stappen, als animatie | Bylder',
  description: `Hoe een kozijnloze deur met onzichtbaar kozijn wordt gemonteerd, in acht stappen: van sparing en kozijn vóór het stucwerk tot afstellen en schilderen. Montage ongeveer ${MONTAGE_UUR} uur per deur.`,
  alternates: { canonical: URL },
  openGraph: { title: 'Kozijnloze deur monteren, stap voor stap', url: URL, type: 'article',
    description: 'Van sparing tot geschilderde deur, in acht stappen.' },
}

const VRAGEN = [
  { v: 'Hoe lang duurt het monteren van een kozijnloze deur?', a: `Ongeveer ${MONTAGE_UUR} uur per deur voor het kozijn en het deurblad samen. Het stucwerk en het schilderen komen daar los bij.` },
  { v: 'Wanneer moet het kozijn erin?', a: 'Vóór de stukadoor komt. Het kozijn wordt in de wand gestuct; wie het na het stucwerk bedenkt, betaalt hakken en opnieuw stucen.' },
  { v: 'Wie monteert een kozijnloze deur?', a: 'Een timmerman plaatst het kozijn en hangt de deur; de stukadoor werkt de wand af tot tegen het kozijn. Laat je de afwerking door Bylder doen, dan regelen wij beide in één planning.' },
  { v: 'Kan ik het zelf doen?', a: 'Het schilderen wel. Het plaatsen en afstellen van het kozijn vraagt ervaring: zit het niet haaks, dan sluit de deur nooit met een gelijke kier. Volg altijd de montagehandleiding van de fabrikant.' },
]

export default function Pagina() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'HowTo', name: 'Een kozijnloze deur monteren', inLanguage: 'nl-NL',
      description: 'De volgorde van het monteren van een kozijnloze deur met onzichtbaar kozijn, voor kopers.',
      step: STAPPEN.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.kop, text: s.tekst })) },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: VRAGEN.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.bylder.com/' },
      { '@type': 'ListItem', position: 2, name: 'Kozijnloze deuren', item: 'https://www.bylder.com/kozijnloze-deuren/' },
      { '@type': 'ListItem', position: 3, name: 'Montage', item: URL }] },
  ]
  const h2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '48px 0 12px' }
  const p: React.CSSProperties = { fontSize: 16, lineHeight: 1.72, color: `${INKT}0.78)`, margin: '0 0 14px', maxWidth: '68ch' }
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 72px', color: '#1A1208' }}>
      {ld.map((b, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />)}
      <nav aria-label="Kruimelpad" style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 22px' }}>
        <a href="/" style={{ color: `${INKT}0.6)` }}>Home</a> › <a href="/kozijnloze-deuren/" style={{ color: `${INKT}0.6)` }}>Kozijnloze deuren</a> › Montage
      </nav>
      <p style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: GROEN, margin: '0 0 10px' }}>Kozijnloze deuren</p>
      <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>Zo wordt een kozijnloze deur gemonteerd</h1>
      <p style={{ ...p, fontSize: 17 }}>
        Een kozijnloze deur zit in de wand in plaats van ervoor. Daarom gaat het kozijn erin vóór de stukadoor komt, en de deur
        pas als het stucwerk droog is. Het monteren van kozijn en deur kost ongeveer <strong>{MONTAGE_UUR} uur per deur</strong>.
      </p>

      <MontageAnimatie />
      <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '10px 0 0' }}>
        De volgorde in grote lijnen, voor kopers. De monteur werkt met de handleiding van de fabrikant; daarin staan de maten en de bevestiging.
      </p>

      <h2 style={h2}>De acht stappen</h2>
      <ol style={{ paddingLeft: 22, margin: 0, display: 'grid', gap: 14 }}>
        {STAPPEN.map(s => (
          <li key={s.kop} style={{ ...p, margin: 0 }}><strong style={{ color: '#1A1208' }}>{s.kop}</strong> <span style={{ color: `${INKT}0.55)` }}>({s.wie.toLowerCase()})</span><br />{s.tekst}</li>
        ))}
      </ol>

      <h2 style={h2}>Wat je zelf regelt</h2>
      <ul style={{ ...p, paddingLeft: 22 }}>
        <li>Bestel de deur zo dat hij er is vóór de stukadoor begint. Reken op een levertijd van ongeveer zes weken.</li>
        <li>Spreek af wie het kozijn plaatst en wanneer, en zorg dat de stukadoor weet dat er een instuckozijn zit.</li>
        <li>Kies een gegronde deur als je hem in de kleur van de wand wilt schilderen; afgelakt is meteen klaar.</li>
      </ul>

      <div style={{ background: '#F1ECE1', borderRadius: 18, padding: 'clamp(18px, 3vw, 26px)', marginTop: 34, display: 'grid', gap: 12 }}>
        <h2 style={{ ...h2, margin: 0, fontSize: '1.3rem' }}>Je deur kiezen</h2>
        <p style={{ ...p, margin: 0 }}>Een complete kozijnloze deur met kozijn, scharnieren en magneetslot kost vanaf {euroRond(VANAF)} inclusief btw. Laat je de afwerking door Bylder doen, dan zit de montage in dezelfde offerte.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href="/winkel/kozijnloze-deur-set/" style={{ background: GROEN, color: '#F5F0E8', fontWeight: 800, padding: '12px 18px', borderRadius: 10, textDecoration: 'none' }}>Bekijk de standaardsets</a>
          <a href="/kozijnloze-deuren/configurator/" style={{ background: '#fff', color: '#1A1208', fontWeight: 800, padding: '12px 18px', borderRadius: 10, textDecoration: 'none', border: `1.5px solid ${INKT}0.16)` }}>Stel je deur samen</a>
          <a href="/nieuwbouw-afwerken/binnendeuren/#aanvraag" style={{ color: GROEN, fontWeight: 800, padding: '12px 4px', textDecoration: 'none' }}>Vraag een offerte aan, met montage →</a>
        </div>
      </div>

      <h2 style={h2}>Vragen</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {VRAGEN.map(q => (
          <details key={q.v} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 14, padding: '14px 18px' }}>
            <summary style={{ fontWeight: 700, cursor: 'pointer', fontSize: 15.5 }}>{q.v}</summary>
            <p style={{ ...p, fontSize: 15, margin: '10px 0 0' }}>{q.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
