// Metingen naar Google Analytics (audit 28-10-2026: aanvragen werden niet gemeten).
//
// generate_lead is het aanbevolen GA4-event voor een aanvraag; in GA4 markeer je het één keer
// als "key event". lead_type zegt wat het is (offerte, uitvoerder), product welk product, en
// pagina waar het vandaan kwam. Geen persoonsgegevens.

type Gtag = (cmd: 'event', naam: string, params: Record<string, string | number | null>) => void

export function meet(naam: string, params: Record<string, string | number | null> = {}) {
  try {
    const g = (window as unknown as { gtag?: Gtag }).gtag
    if (g) g('event', naam, { pagina: window.location.pathname, ...params })
  } catch { /* geen gtag (adblocker): niet erg */ }
}

export const meetLead = (leadType: string, params: Record<string, string | number | null> = {}) =>
  meet('generate_lead', { lead_type: leadType, ...params })
