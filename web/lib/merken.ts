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
