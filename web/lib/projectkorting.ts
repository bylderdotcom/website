// Projectkorting op de afwerking door Bylder (besluit Daniel, 3-11-2026).
//
// Hoe meer woningen in hetzelfde nieuwbouwproject de afwerking door Bylder laten doen, hoe hoger de
// korting voor iedereen in dat project, ook achteraf. Wat telt: getekende opdrachten, geen aanvragen.
// Betaald uit de inkoop: meerdere woningen achter elkaar in één project is voor de uitvoerder werk
// zonder reistijd en zonder gaten in de planning.
//
// Dezelfde treden staan in de app (src/lib/projectkorting.ts), die telt en de korting verrekent.
// Wijzig je ze, wijzig ze dan op beide plekken.

export const TREDEN = [
  { woningen: 2, procent: 4 },
  { woningen: 4, procent: 7 },
  { woningen: 6, procent: 10 },
] as const

/** De teller op een projectpagina verschijnt pas vanaf dit aantal, zodat niemand herkenbaar is. */
export const TELLER_VANAF = 3

export function kortingBij(woningen: number): number {
  let p = 0
  for (const t of TREDEN) if (woningen >= t.woningen) p = t.procent
  return p
}

export function volgendeTrede(woningen: number) {
  return TREDEN.find(t => woningen < t.woningen) ?? null
}

export const deelUrl = (slug: string) =>
  `https://www.bylder.com/nieuwbouw-project/${slug}/?utm_source=buren&utm_medium=deellink&utm_campaign=projectkorting#projectkorting`
