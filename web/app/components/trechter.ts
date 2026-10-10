'use client'

import { herkomst, TABLET_HERKOMST } from './herkomst'

/**
 * Een stap in de trechter van een configurator (app.bylder.com/admin/trechter).
 *
 * Platte tekst en no-cors: geen preflight, en de pagina wacht niet op het antwoord.
 * Geen persoonsgegevens, alleen een willekeurige id. Elke stap telt één keer per
 * paginabezoek.
 *
 * Op de tablet op de stand gebruiken alle bezoekers dezelfde browser. Daar zit de id
 * daarom in sessionStorage, en "Begin opnieuw" (StandBalk) gooit hem weg: zo telt
 * elke volgende bezoeker als een nieuwe.
 */

const API = process.env.NEXT_PUBLIC_TRECHTER_API ?? 'https://app.bylder.com/api/trechter'
export const STAND_ID = 'bylder:t-stand'
const gemeten = new Set<string>()

export function meetStap(product: string, stap: string) {
  if (gemeten.has(`${product}:${stap}`)) return
  gemeten.add(`${product}:${stap}`)
  try {
    const h = herkomst()
    const opslag = h === TABLET_HERKOMST ? sessionStorage : localStorage
    const sleutel = h === TABLET_HERKOMST ? STAND_ID : 'bylder:t'
    let id = opslag.getItem(sleutel)
    if (!id) { id = crypto.randomUUID(); opslag.setItem(sleutel, id) }
    const bron = h === 'beurs' || h === TABLET_HERKOMST ? h : 'site'
    fetch(API, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ product, stap, sessie: id, bron }) }).catch(() => undefined)
  } catch { /* privévenster of geen netwerk: niet erg */ }
}
