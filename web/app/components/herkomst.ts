'use client'

/**
 * Waar een bezoeker vandaan kwam, van de eerste klik tot de offerteaanvraag.
 *
 * HET PROBLEEM
 * Het offerteformulier stuurt een veld `bron` mee, maar dat stond hard in de
 * pagina: elke aanvraag uit de deurconfigurator heette `configurator-deur`, of
 * iemand nu op de beursvloer stond of thuis op de bank zat. Na afloop van een
 * campagne valt dan niet te zien wat hij heeft opgeleverd.
 *
 * HOE HET WERKT
 * Een campagne-adres zet `?bron=` in de URL (bv. /beurs → de configurator met
 * `?bron=beurs`). Die waarde gaat één keer in sessionStorage, en het formulier
 * leest hem daar weer uit. Dat moet, want tussen scannen en aanvragen zit een
 * wandeling: iemand kijkt eerst bij de prijzen, komt terug, en vraagt dán pas
 * een offerte aan. Een waarde die alleen in de URL van de eerste pagina staat,
 * is op dat moment allang weg.
 *
 * WAAROM sessionStorage EN NIET localStorage
 * Het geldt voor één bezoek. Wie vandaag scant op de beurs en volgende week via
 * Google terugkomt, is geen beursbezoeker meer. Op de tablet op de stand is het
 * bovendien precies wat je wil: de volgende bezoeker begint schoon.
 */

const SLEUTEL = 'bylder-herkomst'

/** Alleen korte, simpele namen. De API kapt op 40 tekens; hier houden we het strak. */
const GELDIG = /^[a-z0-9][a-z0-9-]{0,39}$/

/**
 * Leest de herkomst uit de URL (en bewaart hem), of geeft de eerder bewaarde
 * terug. Geeft null als er niets bekend is.
 *
 * Alleen aanroepen vanuit een effect: sessionStorage bestaat niet tijdens het
 * renderen op de server, en een waarde die per bezoeker verschilt hoort niet in
 * de eerste render — anders wijkt de HTML van de server af van de browser.
 */
export function herkomst(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const uitUrl = new URLSearchParams(window.location.search).get('bron')
    if (uitUrl && GELDIG.test(uitUrl)) {
      sessionStorage.setItem(SLEUTEL, uitUrl)
      return uitUrl
    }
    const bewaard = sessionStorage.getItem(SLEUTEL)
    return bewaard && GELDIG.test(bewaard) ? bewaard : null
  } catch {
    // Privémodus of geblokkeerde opslag: dan valt de pagina terug op zijn
    // eigen bron. Een aanvraag zonder campagnenaam is beter dan geen aanvraag.
    return null
  }
}

/** De herkomsten waarvoor de stand-tablet extra knoppen krijgt. */
export const TABLET_HERKOMST = 'beurs-tablet'
