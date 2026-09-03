import type { Metadata } from 'next'
import VakmanReviews, { reviewSchema } from '../../components/VakmanReviews'

/**
 * Merkpagina voor Classic Next (voorheen CNX Doorframes), Uden.
 *
 * WAAROM ONDER /kozijnloze-deuren/ EN NIET OP EEN EIGEN /merken/-tak
 * De pillar over kozijnloze deuren is het onderwerp waar deze pagina bij hoort.
 * Een merkpagina eronder erft die relevantie en maakt de hiërarchie voor zowel
 * bezoeker als zoekmachine leesbaar: onderwerp → merk → product. Een losse
 * /merken/-tak zou een tweede, lege boom optuigen.
 *
 * WAAROM "VOORHEEN CNX DOORFRAMES" ER LETTERLIJK STAAT
 * Hun eigen site heet op dit moment nog CNX Doorframes. Wie hier doorklikt komt
 * dus op een pagina met een andere naam; zonder die zin lijkt dat een fout. Het
 * lost bovendien twee dingen tegelijk op: de zoekvraag op de oude naam blijft
 * binnenkomen, en zoekmachines en taalmodellen kunnen de twee namen aan elkaar
 * knopen in plaats van er twee bedrijven van te maken.
 *
 * WAT ER BEWUST NIET OP STAAT
 * Geen ledenkorting. Die is pas waar zodra de voucher in de app bestaat; tot dan
 * zou het een belofte zijn die bij de kassa niet klopt. Zie KORTING hieronder:
 * één regel invullen en het blok verschijnt.
 * Geen sterren of aantallen bij de beoordelingen, en dus ook geen
 * aggregateRating in de structured data, zolang er geen echte beoordeling is.
 *
 * BRON van de productgegevens: cnx-doorframes.com, geraadpleegd 3 september 2026.
 */

export const metadata: Metadata = {
  title: 'Classic Next (CNX Doorframes): onzichtbare kozijnen uit Uden | Bylder',
  description:
    'Classic Next maakt instuckozijnen en deuren als één systeem, met magneetslot en verdekte '
    + 'scharnieren. Vanaf €759 excl. btw. Wat het merk levert, wat het kost en wanneer je kiest.',
  alternates: { canonical: 'https://www.bylder.com/kozijnloze-deuren/classic-next/' },
}

// Vul dit zodra de voucher in de app staat; dan verschijnt het kortingsblok.
// Null laten staan is geen vergetelheid maar de enige eerlijke stand zolang er
// niets te verzilveren valt.
const KORTING: { label: string; url: string } | null = null

const BRON = 'cnx-doorframes.com, geraadpleegd 3 september 2026'
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
const CEL: React.CSSProperties = {
  padding: '11px 14px', fontSize: 14.5, borderBottom: `1px solid ${INKT}0.08)`,
  color: `${INKT}0.8)`, verticalAlign: 'top',
}

const SYSTEMEN = [
  { kop: 'Instuckozijn met deur',
    tekst: 'Het kozijn wordt in de ruwbouw gezet en meegestuukt, met de deur erbij geleverd als één '
      + 'combinatie. Standaard met magneetslot en verdekte scharnieren, zodat er geen beslag zichtbaar '
      + 'blijft. Na het stucwerk zie je alleen een schaduwvoeg.' },
  { kop: 'AGS-montagesysteem',
    tekst: 'Verstelbare wandbeugels waarmee het kozijn haaks en waterpas gesteld wordt zonder dat je '
      + 'aan de wand hoeft te passen. Stucgaas zit erbij. Dit is het onderdeel waar een timmerman de '
      + 'tijdwinst haalt: stellen in plaats van schaven.' },
  { kop: 'Schuifdeursysteem',
    tekst: 'Een voorgemonteerd railsysteem met hydraulische soft-close dempers en kogellagers, voor '
      + 'deurpanelen van 40 tot 44 mm. Geschikt voor massieve wanden én gipswanden. De rail blijft '
      + 'bereikbaar en is later te verwijderen zonder de wand open te breken.' },
  { kop: 'Vlakke wandaansluitingen',
    tekst: 'Inbouwprofielen die wand en vloer vlak op elkaar laten aansluiten, waarbij de plint in het '
      + 'wandvlak opgaat. Relevant als je de deur onzichtbaar maakt maar de plint het effect zou breken.' },
]

const FEITEN: [string, string][] = [
  ['Wat', 'Onzichtbare kozijnen (instuckozijnen) en deuren als één systeem'],
  ['Waar', 'Eigen werkplaats in Uden, Noord-Brabant'],
  ['Levering', 'Heel Nederland, rechtstreeks uit de werkplaats'],
  ['Vanafprijs', '€759 excl. btw voor kozijn en deur samen'],
  ['Standaard inbegrepen', 'Magneetslot, verdekte scharnieren, stucgaas'],
  ['Deurdikte schuifsysteem', '40 – 44 mm'],
  ['Maatwerk', 'Alle maten en afwerkingen op aanvraag'],
  ['Eerdere naam', 'CNX Doorframes'],
]

const VRAGEN = [
  { v: 'Is Classic Next hetzelfde bedrijf als CNX Doorframes?',
    a: 'Ja. Het bedrijf uit Uden heette CNX Doorframes en gaat verder onder de naam Classic Next. '
      + 'Zelfde werkplaats, zelfde systemen. Op het moment van schrijven staat op hun eigen website '
      + 'nog de oude naam.' },
  { v: 'Wat kost een kozijn van Classic Next?',
    a: 'Vanaf €759 exclusief btw voor de combinatie van kozijn en deur. Dat is een vanafprijs: hoogte, '
      + 'breedte, wanddikte en afwerking bepalen wat het bij jou wordt. Montage komt er nog bij — reken '
      + 'op €250 tot €600 per deur, afhankelijk van de wand.' },
  { v: 'Kan ik er als particulier terecht?',
    a: 'Het bedrijf richt zich op de professionele markt: architecten, interieurontwerpers en '
      + 'projectontwikkelaars. Voor een nieuwbouwkoper betekent dat in de praktijk dat je aannemer of '
      + 'timmerman de bestelling doet. Dat is geen omweg maar de normale gang: het kozijn moet in de '
      + 'ruwbouw, en dat is werk van de bouwer.' },
  { v: 'Wanneer moet ik dit beslissen?',
    a: 'Vóór de ruwbouw af is, en bij nieuwbouw dus op de meerwerklijst. Het frame moet in de wand '
      + 'staan voordat de stukadoor komt. Een schuifdeur vraagt zelfs om een dubbele wand op die plek, '
      + 'dus die keuze valt nog eerder.' },
  { v: 'Waarom een magneetslot?',
    a: 'Een gewone slotplaat vraagt om een sluitkom in het kozijn, en dat is precies het zichtbare '
      + 'detail dat je met een onzichtbaar kozijn wilde vermijden. Een magneetslot valt geruisloos in '
      + 'het slot en laat het wandvlak heel.' },
  { v: 'Wat is het AGS-systeem?',
    a: 'Het montagesysteem met verstelbare wandbeugels waarmee het kozijn wordt gesteld. Het bepaalt '
      + 'hoe snel en hoe zuiver de montage gaat, en het is de reden dat een timmerman dit kozijn anders '
      + 'inbouwt dan een traditioneel kozijn.' },
]

export default function ClassicNext() {
  const rs = reviewSchema('classic-next-instuckozijn')
  return (
    <div style={{ background: '#F5F0E8' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Brand',
            name: 'Classic Next',
            alternateName: 'CNX Doorframes',
            url: 'https://cnx-doorframes.com/',
            description:
              'Fabrikant van onzichtbare kozijnen (instuckozijnen) en deuren als één systeem, '
              + 'uit eigen werkplaats in Uden.',
            areaServed: { '@type': 'Country', name: 'Nederland' },
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
              { '@type': 'ListItem', position: 3, name: 'Classic Next',
                item: 'https://www.bylder.com/kozijnloze-deuren/classic-next/' },
            ],
          },
          ...(rs ? [{ '@type': 'Product', name: 'Classic Next instuckozijn met deur', ...rs }] : []),
        ],
      }) }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        <nav aria-label="Kruimelpad" style={{ paddingTop: 26, fontSize: 12,
          fontFamily: "'Space Mono',monospace", letterSpacing: '0.06em',
          textTransform: 'uppercase', color: `${INKT}0.5)` }}>
          <a href="/" style={{ color: 'inherit' }}>Bylder</a>
          {' / '}
          <a href="/kozijnloze-deuren/" style={{ color: 'inherit' }}>Kozijnloze deuren</a>
          {' / Classic Next'}
        </nav>

        <section style={{ padding: '26px 0 0', maxWidth: '68ch' }}>
          <h1 style={{
            fontSize: 'clamp(1.9rem, 4.4vw, 2.7rem)', fontWeight: 800, letterSpacing: '-0.03em',
            color: '#1A1208', margin: '0 0 16px', textWrap: 'balance', lineHeight: 1.12,
          }}>
            Classic Next: onzichtbare kozijnen uit een werkplaats in Uden
          </h1>
          <p style={{ ...P, fontSize: 17.5 }}>
            Classic Next maakt instuckozijnen en deuren als &eacute;&eacute;n geheel: het kozijn gaat
            de wand in en wordt meegestuukt, de deur hangt erin met een magneetslot en verdekte
            scharnieren. Wat overblijft is een schaduwvoeg. Het bedrijf heette tot voor kort{' '}
            <strong>CNX Doorframes</strong> en maakt alles in eigen werkplaats in Uden.
          </p>
          <p style={P}>
            Dit is geen inrichtingskeuze maar een bouwkeuze. Het frame moet in de wand v&oacute;&oacute;r
            de stukadoor komt, en dat betekent bij nieuwbouw: op de meerwerklijst, niet op de
            verlanglijst. Wie het later bedenkt betaalt sloop- en stucwerk erbij.
          </p>

          {KORTING && (
            <div style={{ ...KAART, borderColor: `${GROEN}44`, margin: '20px 0' }}>
              <h2 style={{ ...H3, margin: '0 0 6px' }}>Ledenvoordeel</h2>
              <p style={{ ...P, margin: '0 0 12px', fontSize: 15 }}>{KORTING.label}</p>
              <a href={KORTING.url} style={{
                display: 'inline-block', background: GROEN, color: '#F5F0E8', fontWeight: 800,
                fontSize: 15, padding: '12px 22px', borderRadius: 11, textDecoration: 'none',
              }}>Bekijk je korting</a>
            </div>
          )}
        </section>

        <section>
          <h2 style={H2}>Wat ze maken</h2>
          <div style={{ display: 'grid', gap: 14,
            gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))' }}>
            {SYSTEMEN.map(s => (
              <div key={s.kop} style={KAART}>
                <h3 style={H3}>{s.kop}</h3>
                <p style={{ ...P, margin: 0, fontSize: 14.5 }}>{s.tekst}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>De feiten op een rij</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff',
            border: `1px solid ${INKT}0.12)`, borderRadius: 16, overflow: 'hidden' }}>
            <tbody>
              {FEITEN.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" style={{ ...CEL, textAlign: 'left', fontWeight: 700,
                    color: '#1A1208', width: '38%' }}>{k}</th>
                  <td style={CEL}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 13, color: `${INKT}0.5)`, margin: '10px 0 0' }}>
            Bron: {BRON}. Prijzen en specificaties kunnen veranderen; controleer ze bij de offerte.
          </p>
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Waar het merk zich van onderscheidt</h2>
          <p style={P}>
            Het verschil zit niet in de deur maar in de montage. De meeste leveranciers verkopen een
            profiel; wie het inbouwt moet zelf zorgen dat het haaks staat, dat het stucgaas aansluit
            en dat de deur past. Classic Next levert kozijn, deur, slot, scharnieren en stucgaas als
            &eacute;&eacute;n pakket, met verstelbare beugels om het kozijn te stellen.
          </p>
          <p style={P}>
            Dat verschuift het risico. Bij losse onderdelen is een scheve dag op de bouw meteen een
            deur die klemt; bij een gesteld systeem stel je bij. Voor een{' '}
            <a href="/timmerman/" style={{ color: GROEN, fontWeight: 700 }}>timmerman</a> scheelt dat
            uren, en voor de{' '}
            <a href="/stukadoor/" style={{ color: GROEN, fontWeight: 700 }}>stukadoor</a> scheelt het
            een discussie achteraf over wie de naad heeft veroorzaakt.
          </p>
          <p style={P}>
            Wat je ervoor terugkrijgt is een leverancier die op de professionele markt zit. Voor een
            particuliere koper betekent dat: je bestelt via je aannemer of timmerman. Dat is bij dit
            product ook de logische route, want de montage valt samen met de ruwbouw.
          </p>
        </section>

        <section>
          <h2 style={H2}>Wat vakmensen ervan vinden</h2>
          <VakmanReviews product="classic-next-instuckozijn"
            wat="een instuckozijn van Classic Next" />
        </section>

        <section style={{ maxWidth: '68ch' }}>
          <h2 style={H2}>Vragen over Classic Next</h2>
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
              deuren: prijzen en wanneer je kiest</a> &mdash; de merkonafhankelijke gids, met de
              andere leveranciers ernaast.</li>
            <li><a href="/kozijnloze-deuren/freesdeuren/" style={{ color: GROEN, fontWeight: 700 }}>De
              dertien freesdeuren</a> &mdash; elk ontwerp met foto, en waar het op zijn plek valt.</li>
            <li><a href="/nieuwbouw-gids/" style={{ color: ROEST, fontWeight: 700 }}>De meerwerklijst
              en wanneer die sluit</a> &mdash; want dit is een keuze met een deadline.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
