// Wat de bezoeker zelf al heeft gedaan, uit zijn eigen browser (11-11-2026). De woning komt uit Mijn woning
// (localStorage 'bylder:mijn-woning:v1'); de voorbeeldwoning wordt daar niet bewaard en telt dus niet mee.
// Hiermee reageert de site op de bezoeker: "jouw 7 deuren" in plaats van "deuren", en de reisbalk weet
// bij welke stap hij is. Er gaat niets naar een server.

export type JouwWoning = { m2: number; deuren: number; m2Giet: number; gekozen: boolean; project?: string }

const WONING = 'bylder:mijn-woning:v1'
const AANVRAAG = 'bylder:aanvraag:v1'

type Ruimte = { id: string; m2: number }
type Laag = { ruimtes?: Ruimte[]; deuren?: unknown[] }

export function leesJouwWoning(): JouwWoning | null {
  try {
    const s = localStorage.getItem(WONING)
    if (!s) return null
    const o = JSON.parse(s) as { lagen?: Laag[]; giet?: Record<string, boolean>; deuren?: Record<string, unknown>; project?: { naam?: string }; voorbeeld?: boolean }
    if (!o?.lagen?.length || o.voorbeeld) return null
    let m2 = 0, deuren = 0, m2Giet = 0
    o.lagen.forEach((l, li) => {
      deuren += l.deuren?.length ?? 0
      ;(l.ruimtes ?? []).forEach(r => { m2 += r.m2 || 0; if (o.giet?.[li + ':' + r.id]) m2Giet += r.m2 || 0 })
    })
    if (m2 <= 0) return null
    return { m2: Math.round(m2), deuren, m2Giet: Math.round(m2Giet), gekozen: Object.keys(o.deuren ?? {}).length > 0, project: o.project?.naam }
  } catch { return null }
}

export function heeftAangevraagd(): boolean {
  try { return !!localStorage.getItem(AANVRAAG) } catch { return false }
}
export function onthoudAanvraag() {
  try { localStorage.setItem(AANVRAAG, new Date().toISOString().slice(0, 10)) } catch { /* privévenster */ }
}
