'use client'
import { useState } from 'react'
import FotoVoorNa from './FotoVoorNa'

/**
 * "Zie je badkamer met andere tegels" (13-11-2026, besluit Daniel): foto van de eigen badkamer of het toilet, een
 * tegel, waar hij komt (vloer, wand of allebei) en of het sanitair blijft of nieuw wordt. Op de pagina's over tegelwerk
 * en sanitair. Het is een impressie: de indeling, de leidingen en wat haalbaar is staan in de offerte, niet in het beeld.
 * De schuif, de upload, de limiet en de feedback zitten in FotoVoorNa; de app-route is /api/afwerken/badkamerfoto,
 * met dezelfde tegelsleutels als hier.
 */

const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.bylder.com'
const API = `${APP}/api/afwerken/badkamerfoto`

export const BAD_TEGELS = [
  { id: 'betonlook', naam: 'Betonlook', hex: '#B8B3AA' }, { id: 'zandsteen', naam: 'Zandsteen', hex: '#D9CBB3' },
  { id: 'marmer', naam: 'Marmerlook', hex: '#ECEAE6' }, { id: 'terrazzo', naam: 'Terrazzo', hex: '#E3DCD0' },
  { id: 'metro', naam: 'Metrotegel', hex: '#F7F7F5' }, { id: 'antraciet', naam: 'Antraciet', hex: '#474B4E' },
]
const WAAR = [['beide', 'Vloer en wand'], ['vloer', 'Alleen vloer'], ['wand', 'Alleen wand']] as const

export default function BadkamerFoto({ onderdeel }: { onderdeel: 'tegelwerk' | 'sanitair' }) {
  const [tegel, setTegel] = useState<string>('betonlook')
  const [waar, setWaar] = useState<string>('beide')
  const [sanitair, setSanitair] = useState<'nieuw' | 'houden'>(onderdeel === 'sanitair' ? 'nieuw' : 'houden')
  const t = BAD_TEGELS.find(x => x.id === tegel) ?? BAD_TEGELS[0]
  return (
    <FotoVoorNa id="bf-kop" api={API} meetNaam="badkamerfoto"
      oog="Nieuw · met je eigen foto" kop={onderdeel === 'sanitair' ? 'Zie je badkamer met nieuw sanitair en andere tegels' : 'Zie je badkamer met andere tegels'}
      intro="Maak een foto van je badkamer of toilet. Je ziet dezelfde ruimte met de tegels die je kiest, en schuift tussen voor en na."
      leegKop="Je eigen badkamer" leegTip="Kies een foto of sleep hem hierheen. Het werkt het best met vloer en wand samen in beeld en het licht aan."
      knopKies="Kies een foto van je badkamer" knopMaak="Laat mijn badkamer zien" knopOpnieuw="Maak opnieuw met deze keuze"
      bezigKnop="Je badkamer wordt betegeld…" bezigTekst="We betegelen je badkamer. Dat duurt ongeveer twintig seconden."
      naLabel={sanitair === 'nieuw' ? 'Nieuwe tegels en sanitair' : 'Nieuwe tegels'} naAlt={`Je badkamer met ${t.naam.toLowerCase()}${sanitair === 'nieuw' ? ' en nieuw sanitair' : ''}`}
      vervolg={{ href: '#aanvraag', tekst: 'Vraag je offerte aan', naam: 'De offerte', daar: 'Wij meten badkamer en toilet uit je tekening. De tegels, het sanitair en het werk staan elk apart in de offerte, met wat er bij jouw aansluitpunten kan.' }}
      keuze={{ tegel: t.id, waar, sanitair }} keuzeTekst={`${t.id} | ${waar} | ${sanitair} | ${onderdeel}`} sleutel={`${t.id}:${waar}:${sanitair}`}>
      <span className="kf-lab" id="bf-tegel">Tegel: {t.naam}</span>
      <div className="kf-kleuren" role="radiogroup" aria-labelledby="bf-tegel">
        {BAD_TEGELS.map(x => <button key={x.id} type="button" role="radio" aria-checked={tegel === x.id} aria-label={x.naam} title={x.naam} onClick={() => setTegel(x.id)} style={{ backgroundColor: x.hex }} />)}
      </div>
      <span className="kf-lab" id="bf-waar">Waar</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="bf-waar">
        {WAAR.map(([id, naam]) => <button key={id} type="button" role="radio" aria-checked={waar === id} onClick={() => setWaar(id)}>{naam}</button>)}
      </div>
      <span className="kf-lab" id="bf-sanitair">Sanitair</span>
      <div className="kf-types" role="radiogroup" aria-labelledby="bf-sanitair">
        <button type="button" role="radio" aria-checked={sanitair === 'houden'} onClick={() => setSanitair('houden')}>Laten staan</button>
        <button type="button" role="radio" aria-checked={sanitair === 'nieuw'} onClick={() => setSanitair('nieuw')}>Nieuw sanitair</button>
      </div>
    </FotoVoorNa>
  )
}
