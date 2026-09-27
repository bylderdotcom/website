import { readFileSync } from 'fs'
import path from 'path'

/**
 * Hoeveel merken doen er mee? Eén bron: data/deelnemers.json.
 *
 * Dit getal stond op 8.669 pagina's met de hand ingetypt als "61 merken" —
 * het aantal vouchers uit de legacy-import, niet het aantal merken. Toen er een
 * merk bij kwam werd het verschil groter in plaats van kleiner.
 *
 * Wordt bij de build gelezen, niet in de browser: het bestand blijft dus aan de
 * serverkant en de bezoeker krijgt alleen het getal. De layout geeft het door
 * aan de navigatie, die een client-component is en zelf geen bestand kan lezen.
 */
export function aantalMerken(): number {
  const p = path.join(process.cwd(), '..', 'data', 'deelnemers.json')
  const d = JSON.parse(readFileSync(p, 'utf8'))
  const lijst: { naam?: string }[] = Array.isArray(d) ? d : d.deelnemers
  return new Set(lijst.filter(x => x.naam).map(x => x.naam)).size
}

export type Deelnemer = { naam: string; aanbod: string; cat: string; plaats?: string }

/**
 * De deelnemers zelf, voor de homepage: naam, aanbod ("10%", "€250", "Gratis
 * dozen") en categorie. Zelfde bron als het getal hierboven, dus wat op de
 * homepage staat kan nooit afwijken van het aantal in het menu.
 */
export function deelnemers(): Deelnemer[] {
  const p = path.join(process.cwd(), '..', 'data', 'deelnemers.json')
  const d = JSON.parse(readFileSync(p, 'utf8'))
  const lijst: Deelnemer[] = Array.isArray(d) ? d : d.deelnemers
  const gezien = new Set<string>()
  return lijst.filter(x => x.naam && !gezien.has(x.naam) && gezien.add(x.naam))
}
