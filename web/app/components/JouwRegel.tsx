'use client'
import { useEffect, useState } from 'react'
import { leesJouwWoning, type JouwWoning } from '@/lib/jouw-woning'

/**
 * Eén regel die de eigen woning van de bezoeker noemt als die er is (11-11-2026): "Jouw 7 deuren, vanaf
 * € 8.806" in plaats van "Vanaf € 1.258 per deur". Zonder woning staat de gewone regel er. De bedragen
 * rekent de pagina uit met dezelfde prijzen als de configurators en geeft ze hier door.
 */
export default function JouwRegel({ soort, standaard, perDeur, perM2, minM2 = 35 }: {
  soort: 'deuren' | 'gietvloer' | 'kast'
  standaard: string
  perDeur?: number
  perM2?: [number, number]
  minM2?: number
}) {
  const [w, setW] = useState<JouwWoning | null>(null)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setW(leesJouwWoning()) }, [])
  /* eslint-enable react-hooks/set-state-in-effect */
  const eur = (n: number) => '€ ' + Math.round(n).toLocaleString('nl-NL')
  let tekst = standaard
  if (w && soort === 'deuren' && w.deuren > 0 && perDeur) tekst = `Jouw ${w.deuren} deuren, vanaf ${eur(w.deuren * perDeur)}`
  if (w && soort === 'gietvloer' && w.m2Giet > 0 && perM2) { const m = Math.max(w.m2Giet, minM2); tekst = `Jouw ${w.m2Giet} m², ${eur(m * perM2[0])} tot ${eur(m * perM2[1])}` }
  if (w && soort === 'kast') tekst = 'Gratis ontwerpen, op de maten van jouw woning'
  return <>{tekst}</>
}
