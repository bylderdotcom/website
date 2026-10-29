import type { Verdieping } from '@/lib/tekening/lees'

// Voorbeeldwoning voor /mijn-woning/?voorbeeld (29-10-2026). Een fictieve tussenwoning van
// 5,4 bij 9 meter, met de hand opgezet in hetzelfde formaat dat leesPdf uit een tekening haalt
// (mm, wanden als rechthoek). Zo ziet een bezoeker zonder tekening wat de woning in 3D wordt,
// en tonen de projectpagina's een echt beeld in plaats van een schets. Geen tekening van een
// echte koper: die hebben we wel, maar die is niet van ons om te laten zien.

const BUITEN: [number, number, number, number, number][] = [
  [0, 0, 5400, 200, 0], [0, 8800, 5400, 9000, 0], [0, 0, 200, 9000, 0], [5200, 0, 5400, 9000, 0],
]

export const VOORBEELD_LAGEN: Verdieping[] = [
  {
    naam: 'BEGANE GROND', schaal: 100, kader: [0, 0, 5400, 9000], kap: null,
    wanden: [...BUITEN,
      [2600, 200, 2700, 3650, 0], [200, 3550, 2700, 3650, 0], [200, 1750, 2600, 1850, 0], [1200, 1850, 1300, 3550, 0]],
    ruimtes: [
      { id: 1, naam: 'Woonkamer en keuken', m2: 34.3, x: 3300, y: 6200, stroken: [[2700, 200, 5200, 3650], [200, 3650, 5200, 8800]] },
      { id: 2, naam: 'Entree', m2: 3.7, x: 1400, y: 950, stroken: [[200, 200, 2600, 1750]] },
      { id: 3, naam: 'Toilet', m2: 1.7, x: 700, y: 2700, stroken: [[200, 1850, 1200, 3550]] },
      { id: 4, naam: 'Trapkast', m2: 2.2, x: 1950, y: 2700, stroken: [[1300, 1850, 2600, 3550]] },
    ],
    deuren: [
      { x: 2650, y: 900, breedte: 830, raakt: [2, 1], naar: 'Woonkamer en keuken' },
      { x: 700, y: 1800, breedte: 730, raakt: [2, 3], naar: 'Toilet' },
      { x: 1950, y: 1800, breedte: 730, raakt: [2, 4], naar: 'Trapkast' },
    ],
  },
  {
    naam: 'EERSTE VERDIEPING', schaal: 100, kader: [0, 0, 5400, 9000], kap: null,
    wanden: [...BUITEN,
      [200, 5550, 5200, 5650, 0], [2700, 200, 2800, 5550, 0], [2800, 3400, 5200, 3500, 0], [200, 2800, 2700, 2900, 0]],
    ruimtes: [
      { id: 1, naam: 'Slaapkamer 1', m2: 15.8, x: 2700, y: 7200, stroken: [[200, 5650, 5200, 8800]] },
      { id: 2, naam: 'Badkamer', m2: 4.9, x: 4400, y: 5150, stroken: [[2800, 3500, 5200, 5550]] },
      { id: 3, naam: 'Overloop', m2: 6.6, x: 1450, y: 4200, stroken: [[200, 2900, 2700, 5550]] },
      { id: 4, naam: 'Slaapkamer 2', m2: 7.7, x: 4000, y: 1800, stroken: [[2800, 200, 5200, 3400]] },
      { id: 5, naam: 'Slaapkamer 3', m2: 6.5, x: 1450, y: 1500, stroken: [[200, 200, 2700, 2800]] },
    ],
    deuren: [
      { x: 1400, y: 5600, breedte: 830, raakt: [3, 1], naar: 'Slaapkamer 1' },
      { x: 2750, y: 4500, breedte: 730, raakt: [3, 2], naar: 'Badkamer' },
      { x: 2750, y: 3150, breedte: 830, raakt: [3, 4], naar: 'Slaapkamer 2' },
      { x: 1400, y: 2850, breedte: 830, raakt: [3, 5], naar: 'Slaapkamer 3' },
    ],
  },
]

/** Twee deuren alvast samengesteld (velden zoals de configurator ze teruggeeft), zodat je ziet
 *  dat een gekozen deur in de woning zijn kleur krijgt. */
export const VOORBEELD_DEUREN: Record<string, string[]> = {
  '0:0': ['dawn', 'fineer', '', '', 'oslo-oak', 'binnen', 'links', 'oma-q-slim', 'Zwart', 'loop', 'Zwart', '', 'Zwart'],
  '1:0': ['dawn', 'gelakt', '7016', '', 'oslo-oak', 'binnen', 'rechts', 'oma-q-slim', 'Zwart', 'loop', 'Zwart', '', 'Zwart'],
}
