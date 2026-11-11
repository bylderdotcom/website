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

// Trechter per product in GA4 (3-11-2026): configurator_stap (product, stap) is de eerste
// stap, offerte_formulier_open de tweede, generate_lead de derde. Dezelfde stappen gaan ook
// naar de eigen trechter in de app (/admin/trechter).
export const meetConfigurator = (product: string, stap: string) => {
  meet('configurator_stap', { product, stap })
  // Ook bewaren voor de feedbackknop in de configurator (ConfiguratorFeedback, 11-11-2026): een
  // melding zegt dan in welke stap iemand zat en welke route hij liep. Alleen in dit tabblad.
  try {
    const w = window as unknown as { __bylderConfigurator?: { product: string; stappen: string[] } }
    const huidig = w.__bylderConfigurator?.product === product ? w.__bylderConfigurator : { product, stappen: [] }
    if (huidig.stappen[huidig.stappen.length - 1] !== stap) huidig.stappen = [...huidig.stappen, stap].slice(-12)
    w.__bylderConfigurator = huidig
  } catch { /* geen window: server */ }
}

export const meetLead = (leadType: string, params: Record<string, string | number | null> = {}) =>
  meet('generate_lead', { lead_type: leadType, ...params })
