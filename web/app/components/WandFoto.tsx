'use client'
import { useState } from 'react'
import FotoVoorNa from './FotoVoorNa'

/**
 * "Zie je wanden in een andere kleur" (13-11-2026, besluit Daniel): foto van de eigen kamer, een wandkleur, en dezelfde
 * kamer met de wanden in die kleur, naar keuze strak gestuukt. Op de pagina's over schilderwerk en stucwerk. De schuif,
 * de upload, de limiet en de feedback zitten in FotoVoorNa; de app-route is /api/afwerken/wandfoto, met dezelfde
 * kleursleutels als hier.
 */

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
const API = `${APP}/api/afwerken/wandfoto`

export const WAND_KLEUREN = [
  { id: 'wit', naam: 'Wit', hex: '#F4F2EC' }, { id: 'gebroken-wit', naam: 'Gebroken wit', hex: '#EAE4D6' },
  { id: 'zand', naam: 'Zand', hex: '#D8C9AE' }, { id: 'greige', naam: 'Greige', hex: '#B9AE9F' },
  { id: 'salie', naam: 'Salie', hex: '#A9B49A' }, { id: 'olijf', naam: 'Olijf', hex: '#6B7355' },
  { id: 'terracotta', naam: 'Terracotta', hex: '#B5674A' }, { id: 'oudroze', naam: 'Oudroze', hex: '#C9A39A' },
  { id: 'nachtblauw', naam: 'Nachtblauw', hex: '#27384A' }, { id: 'antraciet', naam: 'Antraciet', hex: '#3B3F42' },
]

export default function WandFoto({ onderdeel }: { onderdeel: 'schilderwerk' | 'stucwerk' }) {
  const stuc = onderdeel === 'stucwerk'
  const [kleur, setKleur] = useState<string>(stuc ? 'wit' : 'salie')
  const [strak, setStrak] = useState<boolean>(stuc)
  const gekozen = WAND_KLEUREN.find(k => k.id === kleur) ?? WAND_KLEUREN[0]
  return (
    <FotoVoorNa id="wf-kop" api={API} meetNaam="wandfoto"
      oog="Nieuw · met je eigen foto" kop={stuc ? 'Zie je wanden strak gestuukt' : 'Zie je wanden in een andere kleur'}
      intro={stuc
        ? 'Maak een foto van je kamer. Je ziet dezelfde kamer met gladde, strak gestuukte wanden in de kleur die je kiest, en schuift tussen voor en na.'
        : 'Maak een foto van je kamer. Je ziet dezelfde kamer met de wanden in de kleur die je kiest, en schuift tussen voor en na.'}
      leegKop="Je eigen kamer" leegTip="Kies een foto of sleep hem hierheen. Het werkt het best met veel wand in beeld en daglicht."
      knopKies="Kies een foto van je kamer" knopMaak="Laat mijn wanden zien" knopOpnieuw="Maak opnieuw met deze keuze"
      bezigKnop="Je wanden worden gedaan…" bezigTekst="We doen je wanden. Dat duurt ongeveer twintig seconden."
      naLabel={strak ? 'Strak en geschilderd' : 'Geschilderd'} naAlt={`Je kamer met de wanden in ${gekozen.naam.toLowerCase()}${strak ? ', strak gestuukt' : ''}`}
      vervolg={{ href: '#aanvraag', tekst: 'Vraag je offerte aan' }}
      keuze={{ kleur: gekozen.id, strak: strak ? 'ja' : 'nee' }} keuzeTekst={`${gekozen.id} | ${strak ? 'strak' : 'alleen verf'} | ${onderdeel}`} sleutel={`${gekozen.id}:${strak}`}>
      <span className="kf-lab" id="wf-kleur">Kleur: {gekozen.naam}</span>
      <div className="kf-kleuren" role="radiogroup" aria-labelledby="wf-kleur">
        {WAND_KLEUREN.map(k => (
          <button key={k.id} type="button" role="radio" aria-checked={kleur === k.id} aria-label={k.naam} title={k.naam} onClick={() => setKleur(k.id)} style={{ backgroundColor: k.hex }} />
        ))}
      </div>
      <span className="kf-lab" id="wf-wand">Wand</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="wf-wand">
        <button type="button" role="radio" aria-checked={strak} onClick={() => setStrak(true)}>Strak gestuukt</button>
        <button type="button" role="radio" aria-checked={!strak} onClick={() => setStrak(false)}>Alleen schilderen</button>
      </div>
    </FotoVoorNa>
  )
}
