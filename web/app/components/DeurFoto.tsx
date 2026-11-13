'use client'
import { useState } from 'react'
import { SET_KLEUREN } from '@/lib/winkel'
import FotoVoorNa from './FotoVoorNa'

/**
 * "Zie een kozijnloze deur in je eigen huis" (13-11-2026, besluit Daniel): foto van een deur in huis, en dezelfde plek
 * met een deur zonder kozijn, in de kleur van de wand of in een van de zes kleuren van de deurset. De schuif, de
 * upload, de limiet en de feedback zitten in FotoVoorNa; de app-route is /api/deuren/deurfoto.
 */

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
const API = `${APP}/api/deuren/deurfoto`

export default function DeurFoto() {
  const [kleur, setKleur] = useState<string>('wand')
  const [hoogte, setHoogte] = useState<'standaard' | 'plafond'>('standaard')
  const gekozen = SET_KLEUREN.find(k => k.ral === kleur)
  const kleurNaam = gekozen ? `RAL ${gekozen.ral} ${gekozen.naam}` : 'zelfde kleur als de wand'
  return (
    <FotoVoorNa id="df-kop" api={API} meetNaam="deurfoto" verhouding="3/4"
      oog="Nieuw · met je eigen foto" kop="Zie een kozijnloze deur in je eigen huis"
      intro="Maak een foto van een deur in je gang of kamer. Je ziet dezelfde plek met een deur zonder kozijn, en schuift tussen voor en na."
      leegKop="Je eigen deur" leegTip="Kies een foto of sleep hem hierheen. Het werkt het best als de hele deur recht in beeld staat."
      knopKies="Kies een foto van je deur" knopMaak="Laat mijn deur zien" knopOpnieuw="Maak opnieuw met deze keuze"
      bezigKnop="Je deur wordt geplaatst…" bezigTekst="We plaatsen je deur. Dat duurt ongeveer twintig seconden."
      naLabel="Zonder kozijn" naAlt={`Je eigen deur vervangen door een kozijnloze deur, ${kleurNaam}`}
      vervolg={{ href: '/kozijnloze-deuren/configurator/', tekst: 'Stel je deur samen', naam: 'De configurator', daar: 'Je kiest per deur het groefpatroon, de kleur, de hoogte en de kruk, en ziet de prijs per deur.' }}
      keuze={{ kleur, hoogte }} keuzeTekst={`${kleur} | ${hoogte}`} sleutel={`${kleur}:${hoogte}`}>
      <span className="kf-lab" id="df-kleur">Kleur: {kleurNaam}</span>
      <div className="kf-kleuren" role="radiogroup" aria-labelledby="df-kleur">
        <button type="button" role="radio" aria-checked={kleur === 'wand'} aria-label="Zelfde kleur als de wand" title="Zelfde kleur als de wand" className="kf-wand" onClick={() => setKleur('wand')}>wand</button>
        {SET_KLEUREN.map(k => (
          <button key={k.ral} type="button" role="radio" aria-checked={kleur === k.ral} aria-label={`RAL ${k.ral} ${k.naam}`} title={`RAL ${k.ral} ${k.naam}`}
            onClick={() => setKleur(k.ral)} style={{ backgroundColor: k.hex }} />
        ))}
      </div>
      <span className="kf-lab" id="df-hoogte">Hoogte</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="df-hoogte">
        <button type="button" role="radio" aria-checked={hoogte === 'standaard'} onClick={() => setHoogte('standaard')}>Zoals nu</button>
        <button type="button" role="radio" aria-checked={hoogte === 'plafond'} onClick={() => setHoogte('plafond')}>Tot het plafond</button>
      </div>
    </FotoVoorNa>
  )
}
