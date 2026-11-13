'use client'
import { useState } from 'react'
import { TYPES, kleurenVoor, type TypeId } from './gegevens'
import FotoVoorNa from '../FotoVoorNa'

/**
 * "Zie de vloer in je eigen kamer" (12-11-2026, besluit Daniel): foto van de eigen kamer, een vloer en een kleur, en
 * dezelfde kamer met die gietvloer. De schuif, de upload, de limiet en de feedback zitten in FotoVoorNa.
 */

const API = (process.env.NEXT_PUBLIC_GIETVLOER_API ?? 'https://app.bylder.com/api/gietvloer') + '/kamerfoto'

export default function KamerFoto() {
  const [type, setType] = useState<TypeId>('fine')
  const kleuren = kleurenVoor(type)
  const [kleur, setKleur] = useState<string>(kleuren[0]?.id ?? '')
  const gekozen = kleuren.find(k => k.id === kleur) ?? kleuren[0]
  const naam = TYPES.find(t => t.id === type)?.naam ?? ''
  return (
    <FotoVoorNa id="kf-kop" api={API} meetNaam="kamerfoto"
      oog="Nieuw · met je eigen foto" kop="Zie de vloer in je eigen kamer"
      intro="Maak een foto van je woonkamer of keuken. Je ziet dezelfde kamer met een gietvloer in de kleur die je kiest, en schuift tussen voor en na."
      leegKop="Je eigen kamer" leegTip="Kies een foto of sleep hem hierheen. Het werkt het best met veel vloer in beeld en daglicht."
      knopKies="Kies een foto van je kamer" knopMaak="Laat mijn vloer zien" knopOpnieuw="Maak opnieuw met deze kleur"
      bezigKnop="Je vloer wordt gelegd…" bezigTekst="We leggen je vloer. Dat duurt ongeveer twintig seconden."
      naLabel="Met gietvloer" naAlt={`Je kamer met een gietvloer ${naam} in de kleur ${gekozen?.naam}`}
      vervolg={{ href: '/gietvloer/ontwerpen/', tekst: 'Ontwerp je gietvloer', naam: 'De ontwerper', daar: 'Je kiest per ruimte waar de vloer komt, ziet je vierkante meters en de prijs, en vraagt tot drie stalen aan.' }}
      keuze={{ type, kleur: gekozen?.id ?? '' }} keuzeTekst={`${type} | ${gekozen?.id ?? ''}`} sleutel={`${type}:${gekozen?.id}`}>
      <span className="kf-lab" id="kf-type">Vloer</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="kf-type">
        {TYPES.map(t => <button key={t.id} type="button" role="radio" aria-checked={type === t.id} onClick={() => { setType(t.id); setKleur(kleurenVoor(t.id)[0]?.id ?? '') }}>{t.naam}</button>)}
      </div>
      <span className="kf-lab" id="kf-kleur">Kleur{gekozen ? `: ${gekozen.naam}` : ''}</span>
      <div className="kf-kleuren" role="radiogroup" aria-labelledby="kf-kleur">
        {kleuren.map(k => (
          <button key={k.id} type="button" role="radio" aria-checked={kleur === k.id} aria-label={k.naam} title={k.naam}
            onClick={() => setKleur(k.id)} style={{ backgroundColor: k.hex, backgroundImage: k.foto ? `url(${k.foto})` : undefined }} />
        ))}
      </div>
    </FotoVoorNa>
  )
}
