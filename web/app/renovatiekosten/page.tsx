import type { Metadata } from 'next'
import { aantalMerken } from '@/lib/merken'
import AanbodStrook from '../components/AanbodStrook'
import { CATEGORIEEN } from './categorieen'
import { BIJGEWERKT, CEL, GROEN, H2, H3, INKT, KAART, KNOP, KNOP2, LABEL, P, PAGINA, ROEST } from './stijl'

/**
 * /renovatiekosten/ (herbouwd 11-10-2026, verzoek Daniel: "niet aantrekkelijk, niet
 * geoptimaliseerd, geen commerciële CTA").
 *
 * Was een statische pagina met acht tegels en een knop "Start gratis". Nu: de prijzen van alle
 * acht onderdelen in één tabel (het antwoord dat een zoeker en een AI-assistent komen halen),
 * wat een offerte eerlijk maakt, de volgorde van een verbouwing, en wat je via Bylder direct
 * regelt. De onderdeelpagina's staan in ./[categorie]/; de gemeentepagina's blijven statisch.
 */

const URL = 'https://www.bylder.com/renovatiekosten/'

export const metadata: Metadata = {
  title: 'Renovatiekosten 2026: wat een verbouwing kost, per onderdeel | Bylder',
  description:
    'Badkamer €7.500–€20.000, keuken €3.500–€25.000, gietvloer €45–€120 per m², dakkapel €7.500–€22.000. '
    + 'Eerlijke prijzen voor acht onderdelen, wat de prijs bepaalt en hoe je een offerte checkt.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Renovatiekosten 2026: eerlijke prijzen per onderdeel',
    description: 'Badkamer, keuken, gietvloer, schilderwerk, dakkapel, aanbouw, zonnepanelen en warmtepomp: wat het kost en waar je op let.',
    url: URL, type: 'website',
  },
}

const prijs = (c: (typeof CATEGORIEEN)[number]) => `${c.van} – ${c.tot}${c.eenheid === 'per m²' ? ' per m²' : ''}`

const VOLGORDE = [
  { t: 'Ruwbouw en installaties', a: 'Aanbouw, dakkapel, leidingen, elektra en de warmtepomp. Alles wat in of achter de wand verdwijnt.' },
  { t: 'Deuren en plinten in de wand', a: 'Kozijnloze deuren en onzichtbare plinten gaan vóór de stukadoor de wand in. Daarna kan het niet meer.' },
  { t: 'Stucwerk', a: 'Pas als alles in de wand zit. Laat vastleggen of de wanden behangklaar of sauswerkklaar worden opgeleverd.' },
  { t: 'Vloer', a: 'Gietvloer, tegels of pvc. Vloerverwarming moet eerst opgestookt zijn.' },
  { t: 'Badkamer en keuken', a: 'Tegelwerk, sanitair en montage. Meestal parallel, door verschillende vakmensen.' },
  { t: 'Schilderwerk en inrichting', a: 'Als laatste: verf, kasten op maat, raamdecoratie en verlichting.' },
]

const VRAGEN = [
  { v: 'Wat kost een verbouwing in 2026?', a: 'Dat hangt af van het onderdeel. Een badkamer kost meestal €7.500 tot €20.000, een keuken €3.500 tot €25.000, een dakkapel €7.500 tot €22.000 en een aanbouw €1.200 tot €2.800 per m². Een gietvloer kost €45 tot €120 per m², schilderwerk €6 tot €18 per m².' },
  { v: 'Hoe weet ik of een offerte eerlijk is?', a: 'Vraag om een offerte per post: materiaal, arbeid, sloop, afvoer en stelposten apart. Vergelijk de posten met marktprijzen. De offerte-check van Bylder doet dat gratis en geeft per post groen, oranje of rood.' },
  { v: 'In welke volgorde verbouw je een huis?', a: 'Eerst ruwbouw en installaties, dan alles wat in de wand gaat (kozijnloze deuren, inbouwplinten), dan stucwerk, dan de vloer, daarna badkamer en keuken, en als laatste schilderwerk en inrichting.' },
  { v: 'Waarom verschillen renovatieprijzen per gemeente?', a: 'Uurtarieven en de vraag naar vakmensen verschillen per regio. In de Randstad liggen tarieven vaak hoger dan in het noorden en oosten. Per onderdeel vind je hieronder de pagina per gemeente.' },
  { v: 'Kan ik via Bylder ook direct bestellen?', a: 'Ja. Kozijnloze deuren, een gietvloer, een kast op maat en onzichtbare plinten ontwerp je op de site en daarna vraag je een offerte aan bij een partner. Bij 50+ merken krijg je ledenkorting met een gratis account.' },
]

export default function RenovatiekostenPage() {
  const merken = aantalMerken()
  const vragen = VRAGEN.map(q => ({ ...q, a: q.a.replace('50+', String(merken)) }))
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
        { '@type': 'ListItem', position: 2, name: 'Renovatiekosten', item: URL },
      ] },
      { '@type': 'WebPage', '@id': URL, url: URL, name: 'Renovatiekosten 2026 per onderdeel', inLanguage: 'nl-NL', dateModified: '2026-10-11',
        isPartOf: { '@type': 'WebSite', name: 'Bylder', url: 'https://www.bylder.com/' },
        publisher: { '@type': 'Organization', name: 'Bylder Nederland B.V.', url: 'https://www.bylder.com/' } },
      { '@type': 'ItemList', name: 'Renovatiekosten per onderdeel', itemListElement: CATEGORIEEN.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: `${c.naam}: ${prijs(c)}`, url: `${URL}${c.slug}/`,
      })) },
      { '@type': 'FAQPage', mainEntity: vragen.map(q => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.a } })) },
    ],
  }

  return (
    <div style={PAGINA}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <nav aria-label="Kruimelpad" style={LABEL}>
        <a href="/" style={{ color: 'inherit' }}>Bylder</a> / Renovatiekosten
      </nav>
      <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', lineHeight: 1.12, fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 14px', textWrap: 'balance', maxWidth: '24ch' }}>
        Renovatiekosten 2026: wat een verbouwing kost, per onderdeel
      </h1>
      <p style={{ ...P, fontSize: 18 }}>
        Een badkamer kost meestal <strong>€7.500 tot €20.000</strong>, een keuken <strong>€3.500 tot €25.000</strong> en een
        gietvloer <strong>€45 tot €120 per m²</strong>. Hieronder de bandbreedte voor acht onderdelen, wat de prijs bepaalt en
        in welke volgorde je het aanpakt.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '18px 0 0' }}>
        <a href="#prijzen" style={KNOP}>Bekijk de prijzen</a>
        <a href="#direct-regelen" style={KNOP2}>Direct regelen via Bylder</a>
      </div>

      <h2 id="prijzen" style={{ ...H2, scrollMarginTop: 90 }}>Prijzen per onderdeel</h2>
      <div style={{ ...KAART, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <caption style={{ ...LABEL, textAlign: 'left', padding: '16px 14px 6px' }}>Eerlijke marktprijs 2026, indicatie</caption>
          <thead>
            <tr>
              <th scope="col" style={{ ...CEL, fontWeight: 800, color: '#1A1208' }}>Onderdeel</th>
              <th scope="col" style={{ ...CEL, fontWeight: 800, color: '#1A1208' }}>Prijs</th>
              <th scope="col" style={{ ...CEL, fontWeight: 800, color: '#1A1208' }}>Grootste prijsverschil zit in</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIEEN.map(c => (
              <tr key={c.slug}>
                <th scope="row" style={{ ...CEL, fontWeight: 800 }}>
                  <a href={`/renovatiekosten/${c.slug}/`} style={{ color: GROEN }}>{c.naam}</a>
                </th>
                <td style={{ ...CEL, whiteSpace: 'nowrap', fontWeight: 700, color: '#1A1208' }}>{prijs(c)}</td>
                <td style={CEL}>{c.bepalers[0]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...P, fontSize: 13.5, marginTop: 10 }}>
        Indicaties voor een gemiddelde woning. De prijs in jouw offerte hangt af van de woning, de regio en de keuzes. Bijgewerkt {BIJGEWERKT}.
      </p>

      <div id="direct-regelen" style={{ scrollMarginTop: 90 }}>
      <AanbodStrook merken={merken} marge="44px 0 0"
        titel="Direct regelen via Bylder"
        intro="Een deel van de verbouwing kun je op de site zelf ontwerpen en daarna laten offreren. Voor de rest krijg je ledenkorting bij de merken die meedoen." />
      </div>

      <h2 style={H2}>Kies je onderdeel</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
        {CATEGORIEEN.map(c => (
          <a key={c.slug} href={`/renovatiekosten/${c.slug}/`} style={{ ...KAART, padding: '18px 20px', textDecoration: 'none', display: 'grid', gap: 4 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: '#1A1208' }}>{c.naam}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: GROEN }}>{prijs(c)}</span>
            <span style={{ fontSize: 13.5, color: `${INKT}0.65)`, lineHeight: 1.5 }}>Wat erin zit, wat de prijs bepaalt en de prijs per gemeente</span>
          </a>
        ))}
      </div>

      <h2 style={H2}>Zo herken je een eerlijke offerte</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
        {[
          ['Per post, niet als totaal', 'Materiaal, arbeid, sloop, afvoer en stelposten apart. Een totaalbedrag kun je niet vergelijken.'],
          ['Stelposten zijn geen prijs', 'Een stelpost is een schatting. Is hij laag, dan komt het verschil later als meerwerk.'],
          ['Uren én tarief', 'Bij werk op uurbasis wil je een schatting van het aantal uren, niet alleen het tarief.'],
          ['Wat er níét in zit', 'Afvoer, steigers, vergunning en btw. Kijk wat ontbreekt, niet alleen wat er staat.'],
        ].map(([t, a]) => (
          <div key={t} style={{ ...KAART, padding: '18px 20px' }}>
            <h3 style={H3}>{t}</h3>
            <p style={{ ...P, fontSize: 14.5, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 }}>
        <a href="/offerte-check/" style={KNOP}>Laat je offerte gratis checken</a>
        <a href="/meerwerk/" style={KNOP2}>Meerwerk bij nieuwbouw controleren</a>
      </div>

      <h2 style={H2}>In welke volgorde verbouw je?</h2>
      <p style={P}>De volgorde bepaalt wat het kost. Wat na het stucwerk nog de wand in moet, betaal je twee keer.</p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10, maxWidth: 812 }}>
        {VOLGORDE.map((s, i) => (
          <li key={s.t} style={{ ...KAART, padding: '16px 20px', display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, alignItems: 'start' }}>
            <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 999, background: i === 1 ? ROEST : GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14, display: 'grid', placeItems: 'center' }}>{i + 1}</span>
            <div>
              <h3 style={{ ...H3, margin: '3px 0 4px' }}>{s.t}</h3>
              <p style={{ ...P, fontSize: 14.5, margin: 0 }}>{s.a}</p>
            </div>
          </li>
        ))}
      </ol>
      <p style={{ ...P, marginTop: 16 }}>
        Stap 2 vergeten veel mensen. <a href="/kozijnloze-deuren/configurator/" style={{ color: GROEN, fontWeight: 700 }}>Stel je kozijnloze deuren samen</a> en{' '}
        <a href="/onzichtbare-plinten/" style={{ color: GROEN, fontWeight: 700 }}>vraag een offerte voor onzichtbare plinten</a> aan
        voordat de stukadoor is ingepland.
      </p>

      <h2 style={H2}>Veelgestelde vragen</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 812 }}>
        {vragen.map(q => (
          <details key={q.v} style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: '16px 20px' }}>
            <summary style={{ fontWeight: 800, cursor: 'pointer' }}>{q.v}</summary>
            <p style={{ ...P, margin: '10px 0 0', fontSize: 15 }}>{q.a}</p>
          </details>
        ))}
      </div>

      <h2 style={H2}>Verder lezen</h2>
      <ul style={{ ...P, paddingLeft: 20 }}>
        <li><a href="/eerlijke-prijzen/" style={{ color: GROEN, fontWeight: 700 }}>Eerlijke prijzen per klus</a></li>
        <li><a href="/aannemer/" style={{ color: GROEN, fontWeight: 700 }}>Vind een vakbedrijf met beoordelingen</a></li>
        <li><a href="/bouwvergunning/" style={{ color: GROEN, fontWeight: 700 }}>Wanneer heb je een bouwvergunning nodig?</a></li>
        <li><a href="/showrooms/" style={{ color: GROEN, fontWeight: 700 }}>Showrooms om te bezoeken, per producttype</a></li>
      </ul>
    </div>
  )
}
