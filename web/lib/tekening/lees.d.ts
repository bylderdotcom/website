/** Eén wand in millimeters op de tekening: [x0, y0, x1, y1, meerwerk (0/1)]. */
export type Wand = [number, number, number, number, number]

export type Ruimte = {
  id: number
  naam: string
  m2: number
  /** plek van het label op de tekening, mm */
  x: number
  y: number
  /** vloerstroken [x0, y0, x1, y1] in mm, samen precies de vloer van deze ruimte */
  stroken: [number, number, number, number][]
}

export type Deur = {
  x: number
  y: number
  breedte: number
  raakt: number[]
  /** naam van de ruimte die de deur afsluit, uniek per verdieping */
  naar: string
}

export type Verdieping = {
  naam: string
  schaal: number
  wanden: Wand[]
  kader: [number, number, number, number]
  binnenY?: [number, number]
  kap: { nokY: number; zNok: number; k: number } | null
  ruimtes: Ruimte[]
  deuren: Deur[]
}

export function leesPdf(pdfjsLib: unknown, data: Uint8Array): Promise<Verdieping[]>
