'use client'
import { useState } from 'react'
import FotoVoorNa from './FotoVoorNa'

/**
 * "Zie een kast op maat op je eigen wand" (13-11-2026, besluit Daniel): foto van een wand of hoek in huis, een soort
 * kast, een kleur en een greep, en dezelfde plek met die kast erin. Op /kasten-op-maat/ en de pagina's per kasttype.
 * Het is een impressie van het idee, niet het ontwerp met maten: dat maakt de bezoeker daarna in de ontwerper.
 * De schuif, de upload, de limiet en de feedback zitten in FotoVoorNa; de app-route is /api/kast/wandfoto, met
 * dezelfde sleutels voor soort en kleur als hier.
 */

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
const API = `${APP}/api/kast/wandfoto`

export const KAST_SOORTEN = [
  { id: 'inbouwkast', naam: 'Inbouwkast' }, { id: 'hoekkast', naam: 'Hoekkast' }, { id: 'tv-wand', naam: 'Tv-wand' },
  { id: 'boekenkast', naam: 'Boekenkast' }, { id: 'kast-in-nis', naam: 'Kast in een nis' },
]
export const KAST_KLEUREN = [
  { id: 'wit', naam: 'Wit', hex: '#F2F0EA' }, { id: 'zand', naam: 'Zand', hex: '#D6C8B0' }, { id: 'salie', naam: 'Salie', hex: '#A9B49A' },
  { id: 'duifblauw', naam: 'Duifblauw', hex: '#6A84A0' }, { id: 'antraciet', naam: 'Antraciet', hex: '#3B3F42' }, { id: 'eiken', naam: 'Eiken', hex: '#C19A6B' },
]

export default function KastFoto({ start }: { start?: string }) {
  const [soort, setSoort] = useState<string>(KAST_SOORTEN.some(s => s.id === start) ? start! : 'inbouwkast')
  const [kleur, setKleur] = useState<string>('zand')
  const [greep, setGreep] = useState<'geen' | 'staaf'>('geen')
  const s = KAST_SOORTEN.find(x => x.id === soort) ?? KAST_SOORTEN[0], k = KAST_KLEUREN.find(x => x.id === kleur) ?? KAST_KLEUREN[0]
  return (
    <FotoVoorNa id="kaf-kop" api={API} meetNaam="kastfoto"
      oog="Nieuw · met je eigen foto" kop="Zie een kast op maat op je eigen wand"
      intro="Maak een foto van de wand of de hoek waar je een kast wilt. Je ziet dezelfde plek met een kast van muur tot plafond, en schuift tussen voor en na."
      leegKop="Je eigen wand" leegTip="Kies een foto of sleep hem hierheen. Het werkt het best als de hele wand recht in beeld staat, van vloer tot plafond."
      knopKies="Kies een foto van je wand" knopMaak="Laat mijn kast zien" knopOpnieuw="Maak opnieuw met deze keuze"
      bezigKnop="Je kast wordt geplaatst…" bezigTekst="We plaatsen je kast. Dat duurt ongeveer twintig seconden."
      naLabel="Met kast op maat" naAlt={`Je eigen wand met een ${s.naam.toLowerCase()} op maat in ${k.naam.toLowerCase()}`}
      vervolg={{ href: `/kasten-op-maat/ontwerpen/?start=${s.id}`, tekst: 'Ontwerp je kast', naam: 'De ontwerper', daar: 'Je maakt de kast op je eigen maten, met de indeling die je wilt, en ziet hem in 3D. Het timmerbedrijf krijgt de tekening en de zaaglijst.' }}
      keuze={{ soort: s.id, kleur: k.id, greep }} keuzeTekst={`${s.id} | ${k.id} | ${greep}`} sleutel={`${s.id}:${k.id}:${greep}`}>
      <span className="kf-lab" id="kaf-soort">Soort kast</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="kaf-soort">
        {KAST_SOORTEN.map(x => <button key={x.id} type="button" role="radio" aria-checked={soort === x.id} onClick={() => setSoort(x.id)}>{x.naam}</button>)}
      </div>
      <span className="kf-lab" id="kaf-kleur">Kleur: {k.naam}</span>
      <div className="kf-kleuren" role="radiogroup" aria-labelledby="kaf-kleur">
        {KAST_KLEUREN.map(x => <button key={x.id} type="button" role="radio" aria-checked={kleur === x.id} aria-label={x.naam} title={x.naam} onClick={() => setKleur(x.id)} style={{ backgroundColor: x.hex }} />)}
      </div>
      <span className="kf-lab" id="kaf-greep">Greep</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="kaf-greep">
        <button type="button" role="radio" aria-checked={greep === 'geen'} onClick={() => setGreep('geen')}>Greeploos</button>
        <button type="button" role="radio" aria-checked={greep === 'staaf'} onClick={() => setGreep('staaf')}>Staafgreep</button>
      </div>
    </FotoVoorNa>
  )
}
