import type { Metadata } from 'next'
import { ONTWERPEN, KLEUREN } from './ontwerpen'
// Rechtstreeks importeren, niet via next/dynamic met ssr:false — dat mag niet in
// een server-component. De configurator raakt window en document uitsluitend
// binnen effecten aan, dus hij overleeft het prerenderen prima.
import Configurator from './Configurator'

/**
 * Configurator voor kozijnloze deuren.
 *
 * WAT DEZE PAGINA MOET DOEN
 * Iemand zover krijgen dat hij een offerte aanvraagt, met beeld en met een
 * sluitende specificatie — niet met een prijs. Prijzen hangen af van maat,
 * wanddikte en afwerking; een bedrag hier zou net zo stil verouderen als de
 * vanafprijs die we van de merkpagina hebben gehaald.
 *
 * WAAROM ER TEKST ONDER STAAT
 * Een WebGL-doek is voor een zoekmachine een leeg vlak. De uitleg eronder is
 * wat er te vinden en te citeren valt, en beantwoordt de vragen die iemand
 * tegenhouden voordat hij aanvraagt.
 */

export const metadata: Metadata = {
  title: 'Kozijnloze deur samenstellen — 13 ontwerpen, elke RAL-kleur | Bylder',
  description:
    'Stel je plafondhoge kozijnloze deur samen: kies een groefpatroon, sleep door de '
    + 'RAL-kleuren en zie de schaduw meebewegen. Vraag daarna een offerte aan op maat.',
  alternates: { canonical: 'https://www.bylder.com/kozijnloze-deuren/configurator/' },
  openGraph: {
    title: 'Stel je kozijnloze deur samen',
    description: '13 ontwerpen, elke RAL-kleur, plafondhoog. Zie de groef veranderen met de kleur.',
    url: 'https://www.bylder.com/kozijnloze-deuren/configurator/',
    type: 'website',
  },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const H2: React.CSSProperties = {
  fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '46px 0 12px',
  textWrap: 'balance', color: '#1A1208',
}
const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 22,
}

const VRAGEN = [
  { v: 'Waarom staan er geen prijzen bij?',
    a: 'Omdat een prijs voor dit product afhangt van de maat, de wanddikte en de afwerking. '
      + 'Een vanafprijs in een configurator veroudert stil, en dan klopt de offerte niet met wat '
      + 'je hier zag. Je krijgt een prijs op je eigen configuratie.' },
  { v: 'Zijn de kleuren op mijn scherm betrouwbaar?',
    a: 'Als richting wel, als keuze niet. RAL is een fysieke standaard op een kleurstaal; elk '
      + 'beeldscherm geeft hem anders weer. Gebruik de configurator om te zien hoe het patroon '
      + 'zich gedraagt bij licht en donker, en vraag een staal voor de definitieve kleur.' },
  { v: 'Waarom altijd plafondhoog?',
    a: 'Dat is waar dit systeem voor gemaakt is. Zonder bovenlicht en zonder zichtbaar kozijn '
      + 'vormt de deur één vlak met de wand — dat effect verdwijnt zodra er een strook wand '
      + 'boven de deur overblijft.' },
  { v: 'Wat betekent naar binnen of naar buiten draaien?',
    a: 'De kant waarheen de deur opengaat, gezien vanuit de ruimte die je binnenkomt. Het bepaalt '
      + 'aan welke zijde het kozijn wordt afgewerkt en waar de deur ruimte nodig heeft. Twijfel je, '
      + 'kies dan wat je nu hebt; we lopen het bij de offerte na.' },
  { v: 'Wanneer moet ik dit beslissen?',
    a: 'Vóór de stukadoor komt. Het kozijn gaat de wand in en wordt meegestuukt, dus bij nieuwbouw '
      + 'hoort dit op de meerwerklijst en niet op de verlanglijst. Het groefpatroon en de kleur '
      + 'mogen daarna nog schuiven, zolang de maatvoering vaststaat.' },
  { v: 'Hoeveel deuren kan ik samenstellen?',
    a: 'Zoveel als je wilt. De meeste woningen hebben er zes tot acht, en ze hoeven niet gelijk te '
      + 'zijn: één uitgesproken ontwerp in de hal en rustiger deuren daarachter werkt beter dan '
      + 'overal hetzelfde.' },
]

export default function ConfiguratorPagina() {
  return (
    <div style={{ background: '#F5F0E8' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            name: 'Kozijnloze deur samenstellen',
            applicationCategory: 'DesignApplication',
            operatingSystem: 'Web',
            url: 'https://www.bylder.com/kozijnloze-deuren/configurator/',
            description:
              `Stel een plafondhoge kozijnloze deur samen uit ${ONTWERPEN.length} groefpatronen `
              + `en ${KLEUREN.length} RAL-kleuren, en vraag er een offerte op aan.`,
            isAccessibleForFree: true,
            // Geen offers-blok: er staat geen prijs op de pagina, dus het schema
            // mag er ook geen beweren.
          },
          {
            '@type': 'FAQPage',
            mainEntity: VRAGEN.map(q => ({
              '@type': 'Question', name: q.v,
              acceptedAnswer: { '@type': 'Answer', text: q.a },
            })),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Bylder', item: 'https://www.bylder.com/' },
              { '@type': 'ListItem', position: 2, name: 'Kozijnloze deuren',
                item: 'https://www.bylder.com/kozijnloze-deuren/' },
              { '@type': 'ListItem', position: 3, name: 'Samenstellen',
                item: 'https://www.bylder.com/kozijnloze-deuren/configurator/' },
            ],
          },
        ],
      }) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 72px' }}>

        <nav aria-label="Kruimelpad" style={{ paddingTop: 26, fontSize: 12,
          fontFamily: "'Space Mono',monospace", letterSpacing: '0.06em',
          textTransform: 'uppercase', color: `${INKT}0.5)` }}>
          <a href="/" style={{ color: 'inherit' }}>Bylder</a>{' / '}
          <a href="/kozijnloze-deuren/" style={{ color: 'inherit' }}>Kozijnloze deuren</a>
          {' / Samenstellen'}
        </nav>

        <section style={{ padding: '22px 0 26px', maxWidth: '68ch' }}>
          <h1 style={{
            fontSize: 'clamp(1.85rem, 4.2vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#1A1208', margin: '0 0 14px', textWrap: 'balance', lineHeight: 1.12,
          }}>
            Stel je kozijnloze deur samen
          </h1>
          <p style={{ ...P, fontSize: 17.5, margin: 0 }}>
            Dertien groefpatronen, elke RAL-kleur, altijd plafondhoog. Sleep door het
            kleurenraster en kijk wat er met het patroon gebeurt: een groef is een schaduw,
            dus wat in gebroken wit fluistert, roept in antraciet.
          </p>
        </section>

        <Configurator />

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Waar je op let voordat je aanvraagt</h2>
          <p style={P}>
            <strong>Het kozijn is de deadline, niet de deur.</strong> Het frame gaat de wand in en
            wordt meegestuukt, dus het moet er staan v&oacute;&oacute;rdat de stukadoor komt. Bij
            nieuwbouw betekent dat: op de meerwerklijst. Het patroon en de kleur mogen daarna nog
            schuiven, de maatvoering niet.
          </p>
          <p style={P}>
            <strong>Licht bepaalt wat je ziet.</strong> Verticale groeven komen tot leven bij licht
            van opzij, horizontale bij licht van boven. Dezelfde deur oogt in twee huizen anders,
            en daarom staat het licht in deze weergave schuin — recht van voren verdwijnt elk
            patroon.
          </p>
          <p style={P}>
            <strong>Niet elke deur hoeft gelijk te zijn.</strong> Een uitgesproken ontwerp werkt als
            er &eacute;&eacute;n van is. Zet je Ember of Horizon in elke ruimte, dan wordt het een
            motief in plaats van een deur.
          </p>
          <p style={P}>
            Meer over het systeem, de montage en wanneer deze keuze valt staat in de{' '}
            <a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700 }}>gids over
            kozijnloze deuren</a> en op de pagina over{' '}
            <a href="/kozijnloze-deuren/freesdeuren/" style={{ color: GROEN, fontWeight: 700 }}>de
            dertien freesdeuren</a>.
          </p>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Vragen</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {VRAGEN.map(q => (
              <div key={q.v} style={KAART}>
                <h3 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>
                  {q.v}
                </h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{q.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
