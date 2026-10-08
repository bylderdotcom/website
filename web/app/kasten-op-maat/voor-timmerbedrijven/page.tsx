import type { Metadata } from 'next'
import { bouw, MAAT } from '@/lib/kast/rekenmodel'
import { voorbeeld } from '@/lib/kast/voorbeelden'
import { Uitslag, Plattegrond } from '../../components/kast/Tekeningen'
import Werkplaats from '../../components/kast/Werkplaats'
import VoorbeeldKast from '../_hub/VoorbeeldKast'

// Deelpagina voor het timmerbedrijf dat de kasten maakt (en voor de volgende).
// Laat zien wat een aanvraag bevat, met een echt ontwerp en de volledige
// zaaglijst. Noindex: het is een pagina om te delen, geen zoekbestemming, en
// hij staat niet in de sitemap.

export const metadata: Metadata = {
  title: 'Kasten op maat via Bylder: wat je als timmerbedrijf ontvangt | Bylder',
  description: 'Hoe een aanvraag voor een kast op maat bij je binnenkomt: 3D-ontwerp, maattekeningen, zaaglijst, beslaglijst en de gegevens van de koper.',
  alternates: { canonical: 'https://www.bylder.com/kasten-op-maat/voor-timmerbedrijven/' },
  robots: { index: false, follow: true },
}

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const H2: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.022em', margin: '52px 0 12px', textWrap: 'balance', color: '#1A1208' }
const P: React.CSSProperties = { fontSize: 16, lineHeight: 1.75, color: `${INKT}0.78)`, margin: '0 0 14px' }
const LABEL: React.CSSProperties = { fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', color: `${INKT}0.55)`, fontWeight: 700 }
const KAART: React.CSSProperties = { background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 16, padding: 22 }

const STAPPEN = [
  { t: 'De koper ontwerpt', p: 'Met voorbeeldfoto’s en een gesprek met de ontwerper. Die legt alles vast in maten en bewaakt de vakregels hieronder. Kleur en afwerking komen uit de foto’s, als RAL-kleur of houtsoort.' },
  { t: 'De koper vraagt een offerte aan', p: 'Vanuit zijn Bylder-omgeving, na akkoord om zijn gegevens met jou te delen. Jij krijgt een melding per e-mail.' },
  { t: 'Jij opent de aanvraag', p: 'In je partneromgeving op app.bylder.com: het ontwerp in 3D, vooraanzicht en plattegrond met maten, de zaaglijst, de beslaglijst, de foto’s uit het gesprek, en naam, adres en telefoonnummer van de koper.' },
  { t: 'Je meet in en maakt een offerte', p: 'Elk ontwerp heeft een maatstatus. ‘Gemeten’ komt uit een bouwtekening of nauwkeurige meting; ‘indicatief’ is geschat. Inmeten doe je in beide gevallen, en het is voor de koper gratis. De opdracht sluit je rechtstreeks met de koper.' },
]

export default function VoorTimmerbedrijvenPage() {
  const v = voorbeeld('hoekkast')
  const b = bouw(v.ontwerp)
  const regels = [
    `Deuren hooguit ${MAAT.maxDeurB} cm breed en ${MAAT.maxDeurH} cm hoog; breder wordt een dubbele deur.`,
    `Legplanken overspannen hooguit ${MAAT.maxPlank} cm, tot ${MAAT.maxPlankLat} cm met een lat onder de voorkant. Bredere open vakken splitst het model zelf.`,
    `Lades hooguit ${MAAT.maxLade} cm breed.`,
    `Frontnaad ${MAAT.naad * 10} mm, frontdikte ${MAAT.front * 10} mm, rug ${MAAT.rug * 10} mm.`,
    `Vulstuk van ${MAAT.vul} cm in een binnenhoek; deuren daar met openingsbegrenzer.`,
    `${MAAT.nisPas} cm speling in een nis, en een passtrook tegen het plafond.`,
    'Ronde koppen alleen aan een vrij uiteinde, als kwartcirkel met straal gelijk aan de diepte, open of dicht.',
  ]
  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 24px 72px', color: '#1A1208' }}>
      <div style={{ maxWidth: 812 }}>
        <p style={LABEL}>Voor timmerbedrijven en meubelmakers</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4.4vw, 2.3rem)', lineHeight: 1.15, fontWeight: 800, letterSpacing: '-0.028em', margin: '8px 0 14px', textWrap: 'balance' }}>
          Een aanvraag voor een kast op maat, met de tekening en de zaaglijst erbij
        </h1>
        <p style={{ ...P, fontSize: 17.5 }}>
          Kopers ontwerpen op Bylder hun eigen kast: een hoekkast, tv-wand, inbouwkast of boekenkast. Geen
          bouwpakket en geen vaste kastjes, maar vrij maatwerk. Vraagt een koper een offerte aan, dan krijg jij
          een ontwerp waar je mee kunt zagen. Hieronder staat een echt voorbeeld, precies zoals het bij je
          binnenkomt.
        </p>
      </div>

      <h2 style={H2}>Zo loopt een aanvraag</h2>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', counterReset: 'stap' }}>
        {STAPPEN.map((s, i) => (
          <li key={s.t} style={KAART}>
            <span style={{ ...LABEL, color: '#B85C38' }}>Stap {i + 1}</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '6px 0 8px' }}>{s.t}</h3>
            <p style={{ ...P, fontSize: 14.5, margin: 0 }}>{s.p}</p>
          </li>
        ))}
      </ol>

      <h2 style={H2}>Het voorbeeld: {v.titel.toLowerCase()}</h2>
      <p style={{ ...P, maxWidth: '70ch' }}>
        Een hoekkast in een woonkamer: {b.maten.benen.map(x => `${String(x.lengte).replace('.', ',')} cm langs de ${x.muur}`).join(' en ')},
        tot {b.maten.hoogte} cm hoog bij een plafond van {v.ontwerp.plafond} cm, {v.ontwerp.diepte} cm diep. Mat gelakt in {v.ontwerp.afwerking.naam},
        met een vak voor een steelstofzuiger in de hoek. Maatstatus: {v.ontwerp.maatstatus}, uit de {v.ontwerp.maatbron}.
      </p>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))', alignItems: 'start' }}>
        <VoorbeeldKast slug="hoekkast" hoogte={440} />
        <div style={{ display: 'grid', gap: 18 }}>
          <figure style={{ ...KAART, margin: 0, padding: 16 }}>
            <figcaption style={{ ...LABEL, marginBottom: 8 }}>Vooraanzicht</figcaption>
            <Uitslag bouw={b} ontwerp={v.ontwerp} />
          </figure>
          <figure style={{ ...KAART, margin: 0, padding: 16 }}>
            <figcaption style={{ ...LABEL, marginBottom: 8 }}>Plattegrond</figcaption>
            <Plattegrond bouw={b} />
          </figure>
        </div>
      </div>

      <h2 style={H2}>Zaaglijst, platen en beslag</h2>
      <p style={{ ...P, maxWidth: '70ch' }}>
        Uit hetzelfde model als het 3D-beeld. Maten in millimeters, als lengte × breedte × dikte. Bij een aanvraag
        staat precies deze lijst in je partneromgeving.
      </p>
      <Werkplaats bouw={b} />

      <div style={{ maxWidth: 812 }}>
        <h2 style={H2}>De vakregels die de ontwerper bewaakt</h2>
        <p style={P}>Een ontwerp dat een van deze regels breekt, laat de ontwerper niet aan de koper zien; hij past het eerst aan.</p>
        <ul style={{ ...P, paddingLeft: 20, display: 'grid', gap: 6 }}>
          {regels.map(r => <li key={r}>{r}</li>)}
        </ul>
        <div style={{ ...KAART, background: '#F3EFE6', borderColor: 'transparent' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 8px' }}>Werk jij anders?</h3>
          <p style={{ ...P, margin: 0 }}>
            Deze regels zijn een startpunt. Andere plaatdiktes, een ander scharniermerk, een maximale deurmaat die
            bij jouw werkplaats past: we zetten het in het model, en vanaf dan ontwerpt elke koper binnen jouw maten.
          </p>
        </div>

        <h2 style={H2}>Probeer het zelf</h2>
        <p style={P}>
          Zie hoe een koper ontwerpt: <a href="/kasten-op-maat/ontwerpen/" style={{ color: GROEN, fontWeight: 700 }}>open de ontwerper</a> en
          upload een foto van een kast die je ooit gemaakt hebt. Of lees <a href="/kasten-op-maat/" style={{ color: GROEN, fontWeight: 700 }}>wat
          kopers over kasten op maat te lezen krijgen</a>.
        </p>
      </div>
    </main>
  )
}
