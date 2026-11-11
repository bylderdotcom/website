// De gegevens die in de presentatie nog openstaan (11-11-2026). Vul ze hier in zodra Daniel ze
// heeft; null = nog niet bekend, dan toont de pagina de tekst erachter in plaats van een gat.
export const VERGOEDING: string | null = null          // bv. '€ 50' of '5%'
export const VERGOEDING_UITLEG: string | null = null   // bv. 'per bestelling, of 5% van de orderwaarde'
export const UITBETALING: string | null = null         // bv. 'Maandelijks'
export const CONTACT: string | null = null             // bv. '06 12 34 56 78 · daniel@bylder.com'

export function vulIn(html: string): string {
  return html
    .replace('{{VERGOEDING}}', VERGOEDING ?? 'Per order')
    .replace('{{VERGOEDING_UITLEG}}', VERGOEDING_UITLEG ?? 'een vergoeding voor elke bestelling via jouw link. Het bedrag hoor je bij je aanmelding.')
    .replace('{{UITBETALING}}', UITBETALING ?? 'Overzicht')
    .replace('{{CONTACT}}', CONTACT ?? 'info@bylder.com, of via Joost')
}
