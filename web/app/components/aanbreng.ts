'use client'

/**
 * Aanbrengers: een vakman deelt bylder.com/via/<slug>/ (of een link met ?ref=<slug>).
 * Wie zo binnenkomt, hoort bij die vakman, ook als hij pas veel later iets aanvraagt
 * (besluit Daniel, 11-10-2026).
 *
 * Anders dan `herkomst` (één bezoek, sessionStorage) bewaren we dit een jaar in
 * localStorage: tussen kijkdag en bestelling zit vaak de hele bouw. De eerste vakman wint;
 * een latere link overschrijft hem niet.
 *
 * Twee wegen naar de app, want de app kan deze opslag niet lezen:
 *   - links en doorsturen naar app.bylder.com krijgen ?ref= mee (de app zet dan zijn
 *     eigen cookie en legt het vast op het profiel);
 *   - het offerteformulier op de site stuurt de ref mee in de aanvraag.
 */

const SLEUTEL = 'bylder-ref'
const JAAR = 365 * 86400_000
const GELDIG = /^[a-z0-9-]{3,80}$/

/** Bewaar een ref, tenzij er al een (nog geldige) staat. */
export function legRefVast(ref: string | null | undefined) {
  if (!ref || !GELDIG.test(ref)) return
  try {
    if (leesRef()) return
    localStorage.setItem(SLEUTEL, JSON.stringify({ ref, op: Date.now() }))
  } catch { /* privémodus */ }
}

export function leesRef(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const r = JSON.parse(localStorage.getItem(SLEUTEL) ?? 'null') as { ref?: string; op?: number } | null
    if (r?.ref && GELDIG.test(r.ref) && Date.now() - (r.op ?? 0) < JAAR) return r.ref
  } catch { /* kapotte waarde */ }
  return null
}

/** Een adres in de app, met de ref erbij als die er is. Andere adressen blijven gelijk. */
export function metRef(url: string): string {
  const ref = leesRef()
  if (!ref) return url
  try {
    const u = new URL(url, window.location.href)
    if (u.hostname !== 'app.bylder.com' || u.searchParams.has('ref')) return url
    u.searchParams.set('ref', ref)
    return u.toString()
  } catch { return url }
}
