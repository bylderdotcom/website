import type { Metadata } from 'next'
import VakmanReviews, { reviewSchema } from '../../components/VakmanReviews'

/**
 * Productpagina: de freesdeuren van Classic Next.
 *
 * WAAROM DIT EEN EIGEN PAGINA IS EN GEEN BLOK OP DE MERKPAGINA
 * Dit is een andere vraag dan "welk merk". Iemand die "deur met groeven",
 * "gefreesde binnendeur" of "strakke witte binnendeur" zoekt is aan het kiezen
 * hoe zijn deur eruitziet, niet bij wie hij hem koopt. Dertien ontwerpen met
 * een foto per stuk beantwoorden die vraag; een merkpagina doet dat niet.
 *
 * WAAROM DIT UNIEK IS
 * Deze dertien ontwerpen staan met naam en beeld nergens anders zo bij elkaar.
 * Dat is precies het soort pagina dat een taalmodel citeert en een zoekmachine
 * niet elders kan vinden — in tegenstelling tot nog een uitleg over wat een
 * instuckozijn is, die al twintig keer bestaat.
 *
 * DE BEELDEN komen van Classic Next zelf (contentpakket, 3 september 2026) en
 * zijn hier verkleind naar 900 en 450 px. Geen webp: sips op de bouwmachine kan
 * webp lezen maar niet schrijven — het meldt succes en schrijft niets. Op een
 * witte achtergrond zonder transparantie kost jpeg nauwelijks meer.
 *
 * GEEN sterren of aggregateRating zolang er geen echte vakman-beoordeling is.
 */

export const metadata: Metadata = {
  title: 'Freesdeuren: 13 ontwerpen op een rij (Classic Next) | Bylder',
  description:
    'Dertien gefreesde binnendeuren naast elkaar, van vlak tot visgraat. Welk groefpatroon '
    + 'past bij welke ruimte, wat het kost, en waarom je dit vóór de ruwbouw kiest.',
  alternates: { canonical: 'https://www.bylder.com/kozijnloze-deuren/freesdeuren/' },
  openGraph: {
    title: 'Freesdeuren: dertien ontwerpen op een rij',
    description: 'Van vlak tot visgraat, met foto per ontwerp. Plus wat het kost en wanneer je kiest.',
    url: 'https://www.bylder.com/kozijnloze-deuren/freesdeuren/',
    type: 'article',
  },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const H2: React.CSSProperties = {
  fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '52px 0 12px',
  textWrap: 'balance', color: '#1A1208',
}
const H3: React.CSSProperties = { fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }
const KAART: React.CSSProperties = {
  background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 24,
}

type Deur = { naam: string; slug: string; groef: string; wat: string; waar: string }

// Volgorde van rustig naar uitgesproken. Dat is ook de volgorde waarin mensen
// kiezen: bijna iedereen begint bij "strak en wit" en schuift op naar iets meer.
const DEUREN: Deur[] = [
  { naam: 'Origin', slug: 'origin', groef: 'Geen freeswerk',
    wat: 'Het vlakke deurblad. Geen lijn, geen paneel, niets dat schaduw vangt.',
    waar: 'De standaard waar de rest tegen afgezet wordt. In een instuckozijn verdwijnt deze deur het verst in de wand.' },
  { naam: 'Dawn', slug: 'dawn', groef: '1 verticale groef',
    wat: 'Eén rechte lijn over de volle hoogte, uit het midden geplaatst.',
    waar: 'Voor wie wél een detail wil maar geen patroon. Werkt in een gang, waar je de deur vanuit een hoek ziet.' },
  { naam: 'Whisper', slug: 'whisper', groef: '2 verticale groeven',
    wat: 'Twee lijnen vlak naast elkaar, als een dubbele naad.',
    waar: 'Rustiger dan het klinkt: op afstand lees je één accent, van dichtbij twee.' },
  { naam: 'Shadow', slug: 'shadow', groef: '3 verticale groeven',
    wat: 'Drie lijnen dicht op elkaar, richting de scharnierzijde.',
    waar: 'Het patroon vangt strijklicht. In een ruimte met licht van opzij zie je de groeven pas echt.' },
  { naam: 'Noir', slug: 'noir', groef: '5 verticale groeven',
    wat: 'Vijf lijnen met ruimte ertussen, over de volle hoogte.',
    waar: 'Geeft de deur een lattenlook zonder dat er latten op zitten. Past bij houten wandpanelen elders in huis.' },
  { naam: 'Aura', slug: 'aura', groef: 'Bundel fijne verticale groeven',
    wat: 'Een dicht opeen gefreesde bundel lijnen, als een ribbelpaneel in het deurblad.',
    waar: 'De meest uitgesproken van de verticale reeks. Eén per ruimte is genoeg.' },
  { naam: 'Muse', slug: 'muse', groef: '2 horizontale groeven',
    wat: 'Twee lijnen dwars, die de deur in drie banen verdelen.',
    waar: 'Horizontaal maakt een ruimte optisch breder. Handig in een smalle overloop.' },
  { naam: 'Echo', slug: 'echo', groef: '4 horizontale groeven',
    wat: 'Vier dwarslijnen, vijf even hoge banen.',
    waar: 'Regelmatiger dan Muse en daardoor rustiger, ondanks meer lijnen.' },
  { naam: 'Drift', slug: 'drift', groef: 'Verticaal én horizontaal',
    wat: 'Eén staande en twee liggende lijnen die een asymmetrisch raster vormen.',
    waar: 'De enige met een duidelijke compositie. Vraagt om een wand waar hij alleen staat.' },
  { naam: 'Solace', slug: 'solace', groef: 'Enkele omlijsting',
    wat: 'Eén rechthoek, ingefreesd op enige afstand van de rand: een paneel zonder paneel.',
    waar: 'De klassieke paneeldeur, teruggebracht tot een lijn. Verzoent een strak interieur met een jaren-dertig-huis.' },
  { naam: 'Halo', slug: 'halo', groef: 'Dubbele omlijsting',
    wat: 'Twee rechthoeken vlak binnen elkaar, dicht op de rand.',
    waar: 'Zelfde gedachte als Solace, met meer nadruk op de omtrek van de deur.' },
  { naam: 'Horizon', slug: 'horizon', groef: 'Boogmotief',
    wat: 'Een grote dubbele boog binnen een omlijsting, die de helft van de deur vult.',
    waar: 'Geen deur voor het hele huis, wel voor de deur waar je op uitkijkt vanaf de trap.' },
  { naam: 'Ember', slug: 'ember', groef: 'Visgraat',
    wat: 'Een chevronpatroon binnen een omlijsting, van boven tot onder doorlopend.',
    waar: 'De meest decoratieve. Slaat aan bij een visgraatvloer, en vloekt met bijna alles daarbuiten.' },
]

const VRAGEN = [
  { v: 'Wat is een freesdeur?',
    a: 'Een binnendeur waarin het patroon in het deurblad zelf is gefreesd, in plaats van erop gelijmd '
      + 'of geplakt. De groef zit dus in het materiaal en wordt meegelakt. Dat is het verschil met een '
      + 'paneeldeur, waar losse profiellijsten op het blad zitten die na jaren kunnen loslaten.' },
  { v: 'Wat kost een freesdeur?',
    a: 'Classic Next levert kozijn en deur samen vanaf €759 exclusief btw. Het gefreesde patroon zelf '
      + 'is geen dure ingreep — het is een bewerking op een blad dat er toch al is. Wat de prijs bepaalt '
      + 'is de maat: kamerhoge deuren en extra breedtes kosten meer dan standaardmaten.' },
  { v: 'Kan ik elke kleur krijgen?',
    a: 'De deuren worden in elke RAL-kleur geleverd. Let wel op: hoe donkerder de lak, hoe sterker de '
      + 'groef opvalt, want een groef is in de kern een schaduw. Een patroon dat in wit subtiel is, '
      + 'wordt in antraciet nadrukkelijk.' },
  { v: 'Past een freesdeur in een onzichtbaar kozijn?',
    a: 'Ja, en dat is precies waar deze deuren voor gemaakt zijn. Het kozijn verdwijnt in de wand, de '
      + 'deur blijft over als een vlak met een lijn erin. Zonder kozijn eromheen is dat vlak het enige '
      + 'wat je ziet, en dus het enige waar het ontwerp nog vandaan kan komen.' },
  { v: 'Wanneer moet ik kiezen?',
    a: 'Het deurblad kun je relatief laat kiezen, het kozijn niet. Dat moet in de wand vóór de '
      + 'stukadoor komt. Bij nieuwbouw betekent dat: het kozijn hoort op de meerwerklijst, het patroon '
      + 'mag daarna nog schuiven — zolang de maatvoering vaststaat.' },
  { v: 'Zijn deze deuren ook als schuifdeur te krijgen?',
    a: 'Classic Next levert een railsysteem voor deurpanelen van 40 tot 44 mm, voorgemonteerd en met '
      + 'soft-close. Een gefreesd blad kan daarin hangen. Een schuifdeur in de wand vraagt wel om een '
      + 'dubbele wand op die plek, dus die keuze valt nóg eerder dan het kozijn.' },
]

export default function Freesdeuren() {
  const rs = reviewSchema('classic-next-freesdeur')
  return (
    <div style={{ background: '#F5F0E8' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Product',
            name: 'Freesdeuren van Classic Next',
            description:
              'Binnendeuren met een in het deurblad gefreesd patroon, in dertien ontwerpen, '
              + 'leverbaar in elke RAL-kleur en te combineren met een onzichtbaar kozijn.',
            brand: { '@type': 'Brand', name: 'Classic Next', alternateName: 'CNX Doorframes' },
            category: 'Binnendeuren',
            offers: {
              '@type': 'AggregateOffer',
              priceCurrency: 'EUR',
              lowPrice: 759,
              valueAddedTaxIncluded: false,
              availability: 'https://schema.org/InStock',
              areaServed: { '@type': 'Country', name: 'Nederland' },
            },
            ...(rs ?? {}),
          },
          {
            '@type': 'ItemList',
            name: 'Freesdeur-ontwerpen',
            numberOfItems: DEUREN.length,
            itemListElement: DEUREN.map((d, i) => ({
              '@type': 'ListItem', position: i + 1, name: d.naam, description: d.wat,
            })),
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
              { '@type': 'ListItem', position: 3, name: 'Freesdeuren',
                item: 'https://www.bylder.com/kozijnloze-deuren/freesdeuren/' },
            ],
          },
        ],
      }) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        <nav aria-label="Kruimelpad" style={{ paddingTop: 26, fontSize: 12,
          fontFamily: "'Space Mono',monospace", letterSpacing: '0.06em',
          textTransform: 'uppercase', color: `${INKT}0.5)` }}>
          <a href="/" style={{ color: 'inherit' }}>Bylder</a>{' / '}
          <a href="/kozijnloze-deuren/" style={{ color: 'inherit' }}>Kozijnloze deuren</a>
          {' / Freesdeuren'}
        </nav>

        <section style={{ padding: '26px 0 0', maxWidth: '68ch' }}>
          <h1 style={{
            fontSize: 'clamp(1.9rem, 4.4vw, 2.7rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#1A1208', margin: '0 0 16px', textWrap: 'balance', lineHeight: 1.12,
          }}>
            Freesdeuren: dertien ontwerpen naast elkaar
          </h1>
          <p style={{ ...P, fontSize: 17.5 }}>
            Bij een freesdeur zit het patroon &iacute;n het deurblad gefreesd, niet erop geplakt. De
            groef wordt meegelakt en kan dus niet loslaten. Hieronder staan de dertien ontwerpen van{' '}
            <a href="/kozijnloze-deuren/classic-next/" style={{ color: GROEN, fontWeight: 700 }}>Classic
            Next</a> op volgorde van rustig naar uitgesproken, met per deur waar hij op zijn plek valt.
          </p>
          <p style={P}>
            Waarom het uitmaakt: in een onzichtbaar kozijn verdwijnt het kozijn in de wand en blijft de
            deur over als een vlak. Alles wat je dan nog ziet, komt uit dat vlak. De keuze voor een
            groefpatroon is bij deze deuren dus niet decoratie achteraf maar het hele ontwerp.
          </p>
        </section>

        <section>
          <h2 style={H2}>De dertien ontwerpen</h2>
          <div style={{ display: 'grid', gap: 16,
            gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
            {DEUREN.map(d => (
              <article key={d.slug} style={{ ...KAART, padding: 0, overflow: 'hidden',
                display: 'flex', flexDirection: 'column' }}>
                <img
                  src={`/img/classic-next/freesdeur-${d.slug}.jpg`}
                  srcSet={`/img/classic-next/freesdeur-${d.slug}-sm.jpg 450w, /img/classic-next/freesdeur-${d.slug}.jpg 900w`}
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 230px"
                  alt={`Freesdeur ${d.naam}: wit deurblad met ${d.groef.toLowerCase()}`}
                  width={900} height={900} loading="lazy" decoding="async"
                  // height:'auto' is hier geen opsmuk. Het height-attribuut (dat er
                  // staat om de ruimte te reserveren en zo verspringen te voorkomen)
                  // telt als opgegeven hoogte, en dan negeert de browser aspect-ratio.
                  // Zonder deze regel wordt elke deur 900 pixels hoog uitgerekt.
                  style={{ width: '100%', height: 'auto', aspectRatio: '1/1',
                    objectFit: 'contain', background: '#fff', display: 'block' }}
                />
                <div style={{ padding: '14px 18px 18px', display: 'flex', flexDirection: 'column',
                  gap: 6, flex: 1, borderTop: `1px solid ${INKT}0.08)` }}>
                  <div style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace",
                    textTransform: 'uppercase', letterSpacing: '0.08em', color: GROEN,
                    fontWeight: 700 }}>{d.groef}</div>
                  <h3 style={{ ...H3, margin: 0, fontSize: '1.06rem' }}>{d.naam}</h3>
                  <p style={{ ...P, margin: 0, fontSize: 14 }}>{d.wat}</p>
                  <p style={{ ...P, margin: 0, fontSize: 13.5, color: `${INKT}0.58)` }}>{d.waar}</p>
                </div>
              </article>
            ))}
          </div>
          <p style={{ fontSize: 13, color: `${INKT}0.5)`, margin: '14px 0 0' }}>
            Beeld: Classic Next. Kleuren op de foto&apos;s zijn wit; alle ontwerpen zijn in elke
            RAL-kleur leverbaar.
          </p>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Hoe je kiest zonder er later spijt van te krijgen</h2>
          <p style={P}>
            Een groef is in de kern een schaduw. Dat verklaart waarom dezelfde deur in twee huizen
            anders oogt: waar het licht vandaan komt bepaalt hoeveel je van het patroon ziet. Verticale
            groeven komen tot leven bij licht van opzij, horizontale bij licht van boven.
          </p>
          <p style={P}>
            Tweede regel: hoe donkerder de kleur, hoe nadrukkelijker de groef. Een patroon dat in
            gebroken wit fluistert, roept in antraciet. Kies het patroon dus niet los van de kleur.
          </p>
          <p style={P}>
            Derde: dit zijn binnendeuren, en die staan zelden alleen. Een uitgesproken ontwerp als Ember
            of Horizon werkt als er &eacute;&eacute;n van is. Zet je hem in elke ruimte, dan wordt het
            een motief in plaats van een deur.
          </p>
          <p style={P}>
            En de volgorde in de tijd: het{' '}
            <a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700 }}>kozijn</a> moet in de
            wand v&oacute;&oacute;r de stukadoor komt, het deurblad kan later. Zorg dus eerst dat de
            maatvoering en het kozijn op de{' '}
            <a href="/nieuwbouw-gids/" style={{ color: ROEST, fontWeight: 700 }}>meerwerklijst</a> staan;
            het patroon is de keuze die je nog even mag uitstellen.
          </p>
        </section>

        <section>
          <h2 style={H2}>Wat vakmensen ervan vinden</h2>
          <VakmanReviews product="classic-next-freesdeur" wat="een freesdeur van Classic Next" />
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Vragen over freesdeuren</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {VRAGEN.map(q => (
              <div key={q.v} style={KAART}>
                <h3 style={H3}>{q.v}</h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{q.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ margin: '52px 0 64px', maxWidth: '68ch' }}>
          <h2 style={{ ...H2, margin: '0 0 12px' }}>Verder lezen</h2>
          <ul style={{ ...P, paddingLeft: 20, margin: 0 }}>
            <li><a href="/kozijnloze-deuren/" style={{ color: GROEN, fontWeight: 700 }}>Kozijnloze
              deuren: prijzen en wanneer je kiest</a></li>
            <li><a href="/kozijnloze-deuren/classic-next/" style={{ color: GROEN, fontWeight: 700 }}>Classic
              Next: wat het merk levert</a></li>
            <li><a href="/timmerman/" style={{ color: ROEST, fontWeight: 700 }}>Een timmerman
              vinden</a> &mdash; want iemand moet het kozijn stellen.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
