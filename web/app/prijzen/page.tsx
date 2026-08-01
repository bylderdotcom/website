import type { Metadata } from 'next'

// De canonieke prijspagina: hier staat het hele commerciële model bij elkaar.
// Bewoners betalen niets (besluit 23-07-2026); zakelijke deelnemers betalen voor
// zichtbaarheid. Elke segmentpagina noemt zijn eigen prijs, maar dit is de enige
// plek waar het geheel te overzien is — daarom linken de segmenten hierheen terug.
export const metadata: Metadata = {
  title: 'Prijzen — gratis voor bewoners, betaald voor bedrijven | Bylder',
  description:
    'Bylder is gratis voor bewoners: woningdossier, AI-begeleiding en offerte-checks. Bedrijven betalen voor zichtbaarheid — €79 per jaar lokaal, €995 landelijk.',
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
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px', color: '#1A1208' }}>
      <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 12 }}>
        Gratis voor bewoners. Bedrijven betalen voor zichtbaarheid.
      </h1>
      <p style={{ fontSize: 16.5, color: 'rgba(61,46,30,0.68)', lineHeight: 1.75, marginBottom: 10 }}>
        Woon je in de woning, dan kost Bylder je niets. Wil je als bedrijf aanbevolen worden aan onze
        bewoners, dan betaal je daarvoor — en elk bedrijf betaalt hetzelfde, zodat de volgorde in onze
        aanbevelingen nooit te koop is.
      </p>
      <p style={{ fontSize: 12.5, color: 'rgba(61,46,30,0.72)', marginBottom: 24 }}>Laatst bijgewerkt: 26 juli 2026</p>

      <h2 style={H2}>Voor bewoners</h2>
      <div style={{ ...CARD, borderColor: 'rgba(61,90,62,0.35)' }}>
        <div style={PRIJS}>Gratis</div>
        <div style={SUB}>geen abonnement, geen creditcard</div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li style={LI}>Je woningdossier: bouwtekening, planning, keuzes en documenten op één plek</li>
          <li style={LI}>AI-begeleiding met onbeperkt vragen over jouw woning</li>
          <li style={LI}>Onbeperkt offertes en meerwerklijsten laten checken tegen marktprijzen</li>
          <li style={LI}>Tot tien 3D-sfeerimpressies per maand</li>
          <li style={LI}>Kortingsvouchers bij 61 woonmerken — gemiddeld €4.200 besparing</li>
        </ul>
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
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px' }}>Begin gratis</h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, opacity: 0.85, margin: '0 0 18px' }}>
          Maak een account, upload je bouwtekening en zie wat Bylder voor jouw woning uitrekent.
        </p>
        <a href="https://app.bylder.com/registreer?utm_source=bylder-site&utm_campaign=prijzen" style={{ display: 'inline-block', background: '#F5F0E8', color: '#3D5A3E', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>
          Start gratis →
        </a>
      </div>
    </main>
  )
}
