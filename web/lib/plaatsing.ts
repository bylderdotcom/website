// De maanden waaruit de koper kiest wanneer de vloer gelegd of de kast geplaatst moet worden (13-11-2026).
// Zelfde lijst als in de app (src/lib/plaatsing.ts), waar de periode ook wordt gelezen en bewaard.

const MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

/** De komende maanden om uit te kiezen, vanaf deze maand; id als JJJJ-MM. */
export function maandOpties(aantal = 18, vanaf = new Date()): { id: string; naam: string }[] {
  return Array.from({ length: aantal }, (_, i) => {
    const d = new Date(vanaf.getFullYear(), vanaf.getMonth() + i, 1)
    return { id: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, naam: `${MAAND[d.getMonth()]} ${d.getFullYear()}` }
  })
}
