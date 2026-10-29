import type { Metadata } from 'next'

// De canonieke prijspagina: hier staat het hele commerciële model bij elkaar.
// Bewoners betalen niets voor ontwerpen, dossier, check en korting (besluit 23-07-2026); de afwerking
// door Bylder betalen ze in één offerte (28-10-2026). Zakelijke deelnemers betalen voor
// zichtbaarheid. Elke segmentpagina noemt zijn eigen prijs, maar dit is de enige
// plek waar het geheel te overzien is — daarom linken de segmenten hierheen terug.
export const metadata: Metadata = {
  title: 'Prijzen — gratis voor bewoners, betaald voor bedrijven | Bylder',
  description:
    'Ontwerpen, woningdossier, offerte-check en ledenkorting zijn gratis voor bewoners. De afwerking door Bylder in één offerte. Bedrijven: €79 per jaar lokaal, €995 landelijk.',
  alternates: { canonical: 'https://www.bylder.com/prijzen/' },
}

const CARD: React.CSSProperties = {
  background: '#fff', border: '1px solid rgba(61,46,30,0.12)', borderRadius: 16,
  padding: 28, marginBottom: 18,
}
const PRIJS: React.CSSProperties = { fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }
const SUB: React.CSSProperties = { fontSize: 14, color: 'rgba(61,46,30,0.72)', marginBottom: 14 }
const LI: React.CSSProperties = { fontSize: 15, lineHeight: 1.7, color: 'rgba(61,46,30,0.75)' }
const H2: React.CSSProperties = { fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '38px 0 14px' }

export default function PrijzenPage() {
  return (
    // Op het raster van het menu (zie /kozijnloze-deuren/): inhoud houdt 772px, links.
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', color: '#1A1208' }}>
      <div style={{ maxWidth: 772 }}>
      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 12 }}>
        Gratis voor bewoners. Bedrijven betalen voor zichtbaarheid.
      </h1>
      <p style={{ fontSize: 16.5, color: 'rgba(61,46,30,0.68)', lineHeight: 1.75, marginBottom: 10 }}>
        Ontwerpen, je woningdossier, de offerte-check en de ledenkorting kosten je niets. Laat je de
        afwerking van je woning door Bylder doen, dan betaal je alleen de prijs in die offerte. Bedrijven
        betalen voor hun plek in de gids, en elk bedrijf betaalt hetzelfde: de volgorde is nooit te koop.
      </p>
      <p style={{ fontSize: 12.5, color: 'rgba(61,46,30,0.72)', marginBottom: 24 }}>Laatst bijgewerkt: 28 oktober 2026</p>

      <h2 style={H2}>Voor bewoners</h2>
      <div style={{ ...CARD, borderColor: 'rgba(61,90,62,0.35)' }}>
        <div style={PRIJS}>Gratis</div>
        <div style={SUB}>geen abonnement, geen creditcard</div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li style={LI}>Je woningdossier: bouwtekening, planning, keuzes en documenten op één plek</li>
          <li style={LI}>Je woning in 3D en de ontwerpers voor deuren, gietvloer en kasten</li>
          <li style={LI}>AI-begeleiding met onbeperkt vragen over jouw woning</li>
          <li style={LI}>Onbeperkt offertes en meerwerklijsten laten checken tegen marktprijzen</li>
          <li style={LI}>Tot tien 3D-sfeerimpressies per maand</li>
          <li style={LI}>Kortingsvouchers bij 56 woonmerken</li>
        </ul>
      </div>

      <h2 style={H2}>De afwerking door Bylder</h2>
      <div style={CARD}>
        <div style={PRIJS}>Eén offerte</div>
        <div style={SUB}>voor alles wat je laat doen</div>
        <p style={{ ...LI, margin: '0 0 12px' }}>
          Wij maken de offerte uit je eigen tekening. Per onderdeel zie je wat het kost en welk vakbedrijf het
          uitvoert. Indicaties per onderdeel staan op de pagina <a href="/nieuwbouw-afwerken/" style={{ color: '#3D5A3E', fontWeight: 600 }}>nieuwbouw laten afwerken</a>.
        </p>
        <a href="/nieuwbouw-afwerken/#aanvraag" data-meet="prijzen" style={{ display: 'inline-block', background: '#3D5A3E', color: '#F5F0E8', padding: '12px 22px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Vraag een offerte aan →</a>
      </div>

      <h2 style={H2}>Voor bedrijven: aanbevolen worden</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
        <div style={CARD}>
          <div style={PRIJS}>€79</div>
          <div style={SUB}>per jaar · lokaal</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={LI}>Vermelding in de gids voor jouw regio</li>
            <li style={LI}>Gerangschikt op geschiktheid, niet op wie betaalt</li>
            <li style={LI}>Een kortingsvoucher voor Bylder-bewoners</li>
            <li style={LI}>Een showroomsale plaatsen</li>
            <li style={LI}>Geen kosten per lead, geen veiling</li>
          </ul>
        </div>
        <div style={CARD}>
          <div style={PRIJS}>€995</div>
          <div style={SUB}>per jaar · landelijk</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={LI}>Hetzelfde als lokaal, in heel Nederland</li>
            <li style={LI}>Voor partijen die niet aan één regio gebonden zijn</li>
          </ul>
        </div>
      </div>
      <p style={{ fontSize: 13.5, color: 'rgba(61,46,30,0.72)', margin: '10px 0 0' }}>
        Je deelname loopt per jaar; vóór de verlenging ontvang je een betaalverzoek en opzeggen kan per jaar.
      </p>

      <h2 style={H2}>Werk uitvoeren voor Bylder</h2>
      <div style={{ ...CARD, borderColor: 'rgba(61,90,62,0.35)' }}>
        <div style={PRIJS}>Aanmelden is gratis</div>
        <div style={SUB}>voor stukadoors, tegelzetters, vloerenleggers, schilders en timmerbedrijven</div>
        <p style={{ ...LI, margin: '0 0 12px' }}>
          Bylder neemt de hele afwerking van nieuwbouwwoningen aan, in één offerte voor de koper. Het werk doen
          vakbedrijven uit ons netwerk. Je krijgt de maten en de planning vooraf, maakt geen offertes voor niets en
          factureert aan Bylder. Tarief en betaaltermijn leggen we per vak vast in een overeenkomst. Dit staat los van
          je plek in de gids; het kan allebei.
        </p>
        <a href="/uitvoerder-worden/" data-meet="prijzen-uitvoerder" style={{ display: 'inline-block', background: '#3D5A3E', color: '#F5F0E8', padding: '12px 22px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Meld je aan als uitvoerder →</a>
      </div>

      <h2 style={H2}>Producten laten aanbevelen</h2>
      <div style={CARD}>
        <div style={PRIJS}>vanaf €149</div>
        <div style={SUB}>per jaar · gestaffeld op je eigen assortiment</div>
        <p style={{ ...LI, margin: 0 }}>
          Verkoop je zelf? Koppel je productfeed en je artikelen verschijnen tussen de keuzes van de koper,
          gematcht op ruimte, stijl en budget. De staffel volgt uit de mediane productprijs in je eigen feed —
          zie <a href="/deelnemer-worden/winkels-webshops/" style={{ color: '#3D5A3E', fontWeight: 600 }}>winkels &amp; webshops</a>.
        </p>
      </div>

      <h2 style={H2}>Merkplaatsing zonder eigen verkoop</h2>
      <div style={CARD}>
        <div style={PRIJS}>vanaf €295</div>
        <div style={SUB}>per maand per categorie · jaarlijks gefactureerd</div>
        <p style={{ ...LI, margin: 0 }}>
          Verkoop je via winkels en dealers? Dan staat je merk in het ontwerp van de koper en verwijzen we
          hem naar een verkooppunt in zijn regio — zie <a href="/deelnemer-worden/merken/" style={{ color: '#3D5A3E', fontWeight: 600 }}>merken</a>.
        </p>
      </div>

      <h2 style={H2}>Andere samenwerkingen</h2>
      <div style={CARD}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li style={LI}><strong>Ontwikkelaars en bouwers</strong> — Bylder als kopersservice bij je project, vanaf €49 per woning</li>
          <li style={LI}><strong>Prefab-productie en -netwerk</strong> — €99 per gerealiseerde match, geen kosten per lead</li>
          <li style={LI}><strong>Commercieel vastgoed</strong> — offerte- en tender-check, €299 per dossier</li>
        </ul>
      </div>

      <p style={{ fontSize: 15, color: 'rgba(61,46,30,0.7)', lineHeight: 1.7, marginTop: 28 }}>
        Bekijk <a href="/deelnemer-worden/" style={{ color: '#3D5A3E', fontWeight: 600 }}>alle zakelijke segmenten</a>,
        de <a href="/functies/" style={{ color: '#3D5A3E', fontWeight: 600 }}>functies</a> of
        de <a href="/vouchers/" style={{ color: '#3D5A3E', fontWeight: 600 }}>kortingsvouchers</a>.
      </p>

      <div style={{ background: '#3D5A3E', color: '#F5F0E8', borderRadius: 18, padding: 32, marginTop: 28 }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px' }}>Van sleutel tot ingericht huis</h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.85, margin: '0 0 18px' }}>
          Ontwerp je deuren, gietvloer en kasten in je eigen woning, en laat de afwerking in één offerte doen.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/nieuwbouw-afwerken/#aanvraag" data-meet="prijzen-slot" style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', padding: '12px 24px', borderRadius: 10, fontWeight: 800, textDecoration: 'none' }}>Vraag een offerte aan →</a>
          <a href="/ontwerpen/" style={{ display: 'inline-block', color: '#F5F0E8', border: '1px solid rgba(245,240,232,.4)', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Begin met ontwerpen</a>
        </div>
      </div>
      </div>
    </main>
  )
}
