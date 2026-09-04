import type { Metadata } from 'next'
import VakmanReviews, { reviewSchema } from '../../components/VakmanReviews'

/**
 * Merkpagina voor Classic Next, Uden.
 *
 * WAAROM ONDER /kozijnloze-deuren/ EN NIET OP EEN EIGEN /merken/-tak
 * De pillar over kozijnloze deuren is het onderwerp waar deze pagina bij hoort.
 * Een merkpagina eronder erft die relevantie en maakt de hiërarchie voor zowel
 * bezoeker als zoekmachine leesbaar: onderwerp → merk → product. Een losse
 * /merken/-tak zou een tweede, lege boom optuigen.
 *
 * GEEN VERWIJZING NAAR DE OUDE NAAM (besluit Daniel, 4 september 2026). Die had
 * geen historie en geen naamsbekendheid, dus er valt geen zoekvraag mee te
 * vangen — en hem noemen maakt een merk dat net begint alleen maar ouder en
 * onduidelijker dan het is.
 *
 * GEEN PRIJZEN. Een vanafprijs op een merkpagina veroudert stil: de pagina blijft
 * hem beweren lang nadat de leverancier hem heeft bijgesteld, en dan klopt de
 * offerte niet met wat wij zeggen.
 *
 * WAT ER BEWUST NIET OP STAAT
 * De ledenkorting staat er sinds 4 september 2026, en pas sinds die dag: de
 * voucher stond tot dan op 'pending' en een korting beloven die niet te claimen
 * is, is een belofte die bij de kassa niet klopt.
 * Geen sterren of aantallen bij de beoordelingen, en dus ook geen
 * aggregateRating in de structured data, zolang er geen echte beoordeling is.
 *
 * BRON van de productgegevens: cnx-doorframes.com, geraadpleegd 3 september 2026.
 */

export const metadata: Metadata = {
  title: 'Classic Next: onzichtbare kozijnen en deuren uit Uden | Bylder',
  description:
    'Classic Next maakt instuckozijnen en deuren als één systeem, met magneetslot en verdekte '
    + 'scharnieren. Wat het merk levert, hoe het monteert en wanneer je deze keuze maakt.',
  alternates: { canonical: 'https://www.bylder.com/kozijnloze-deuren/classic-next/' },
}

// Aan sinds de voucher in de app op 'approved' staat. Zet dit terug op null als
// de voucher ooit wordt ingetrokken — een kortingsblok zonder claimbare code
// stuurt mensen naar een lege hand.
const KORTING: { label: string; url: string } | null = {
  label: 'Leden van Bylder krijgen 5% korting op het assortiment van Classic Next. '
    + 'Je claimt de code met een gratis account en laat hem zien bij je bestelling.',
  url: 'https://app.bylder.com/dashboard/vouchers?utm_source=bylder-site'
    + '&utm_campaign=classic-next-korting',
}

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
const LABEL: React.CSSProperties = {
  fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: 700,
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
  ['Standaard inbegrepen', 'Magneetslot, verdekte scharnieren, stucgaas'],
  ['Deurdikte schuifsysteem', '40 – 44 mm'],
  ['Maatwerk', 'Alle maten en afwerkingen op aanvraag'],
]

const VRAGEN = [
  { v: 'Wat kost een kozijn van Classic Next?',
    a: 'Dat hangt af van hoogte, breedte, wanddikte en afwerking, en het is dus een offerte en geen '
      + 'schapprijs. Kamerhoge deuren en extra breedtes kosten meer dan standaardmaten. Montage komt '
      + 'er nog bij: reken op €250 tot €600 per deur, afhankelijk van de wand.' },
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
            scharnieren. Wat overblijft is een schaduwvoeg. Alles wordt gemaakt in hun eigen
            werkplaats in Uden.
          </p>
          <p style={P}>
            Dit is geen inrichtingskeuze maar een bouwkeuze. Het frame moet in de wand v&oacute;&oacute;r
            de stukadoor komt, en dat betekent bij nieuwbouw: op de meerwerklijst, niet op de
            verlanglijst. Wie het later bedenkt betaalt sloop- en stucwerk erbij.
          </p>

        </section>

        {/* Twee publieken, twee acties, en ze mogen elkaar niet in de weg zitten.
            De koper wil korting; de vakman wil weten of hij eraan verdient. Eén
            gedeelde knop zou voor allebei het verkeerde beloven, dus staan ze
            naast elkaar met een eigen kop, en is meteen zichtbaar welke van de
            twee jij bent. */}
        <section>
          <div style={{ display: 'grid', gap: 16, marginTop: 34,
            gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>

            {KORTING && (
              <div style={{ ...KAART, borderColor: `${GROEN}55`, display: 'flex',
                flexDirection: 'column' }}>
                <div style={{ ...LABEL, color: GROEN, marginBottom: 8 }}>Koop je een woning?</div>
                <h2 style={{ ...H3, fontSize: '1.12rem', margin: '0 0 8px' }}>
                  5% korting met een gratis account
                </h2>
                <p style={{ ...P, margin: '0 0 8px', fontSize: 14.5 }}>{KORTING.label}</p>
                <p style={{ ...P, margin: '0 0 16px', fontSize: 14.5 }}>
                  Bij acht binnendeuren scheelt dat al gauw een paar honderd euro &mdash; en het
                  account kost niets. Je claimt de code &eacute;&eacute;n keer en laat hem zien
                  bij je bestelling.
                </p>
                <a href={KORTING.url} style={{
                  marginTop: 'auto', display: 'inline-block', background: GROEN, color: '#F5F0E8',
                  fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11,
                  textDecoration: 'none', textAlign: 'center',
                }}>Claim je kortingscode</a>
              </div>
            )}

            <div style={{ ...KAART, background: '#1A1208', border: 'none', display: 'flex',
              flexDirection: 'column' }}>
              <div style={{ ...LABEL, color: '#E8A87C', marginBottom: 8 }}>Ben je vakman?</div>
              <h2 style={{ ...H3, fontSize: '1.12rem', margin: '0 0 8px', color: '#F5F0E8' }}>
                Verdien aan deze deuren, ook zonder ze te monteren
              </h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.74)',
                margin: '0 0 8px' }}>
                Via ons partnerprogramma krijg je vanaf 1% van de aankoopwaarde als jouw klant
                via jouw code bestelt. Monteer je ze zelf, dan komt het montagewerk daar bovenop
                &mdash; en de montagetraining van Classic Next is gratis.
              </p>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(245,240,232,0.74)',
                margin: '0 0 16px' }}>
                Open voor elk vakbedrijf, &euro;79 per jaar. Geen uitnodiging, geen omzeteis.
              </p>
              <a href="/kozijnloze-deuren/classic-next/voor-vakbedrijven/" style={{
                marginTop: 'auto', display: 'inline-block', background: '#F5F0E8', color: '#1A1208',
                fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11,
                textDecoration: 'none', textAlign: 'center',
              }}>Zo werkt het partnerprogramma</a>
            </div>
          </div>
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
            <li><a href="/kozijnloze-deuren/classic-next/voor-vakbedrijven/" style={{ color: GROEN, fontWeight: 700 }}>Voor
              vakbedrijven: monteren en eraan verdienen</a> &mdash; het montagewerk, de gratis training
              en de commissie op wat je klant koopt.</li>
            <li><a href="/nieuwbouw-gids/" style={{ color: ROEST, fontWeight: 700 }}>De meerwerklijst
              en wanneer die sluit</a> &mdash; want dit is een keuze met een deadline.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}
