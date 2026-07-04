'use client'

import { useState } from 'react'

// Getrouwe port van de FAQ-accordion uit /vouchers/index.html.
// Origineel: <button class="faq-q" onclick="toggleFaq()"> + CSS .faq-item.open.
// Hier als kleine client-component; classes komen uit de pagina-<style>.

const ITEMS: [string, string][] = [
  ['Zijn de vouchers cumuleerbaar?', 'Ja — je kunt meerdere vouchers tegelijk activeren, één per merk. Je kunt dus tegelijk besparen bij Auping, DRT Contemporary en Goossens. Elke voucher wordt apart per e-mail bezorgd met je persoonlijke kortingscode.'],
  ['Zijn de vouchers ook geldig bij renovatie, niet alleen nieuwbouw?', 'Ja. Bylder vouchers zijn geldig voor zowel kopers van een nieuwbouwwoning als mensen die een bestaande woning hebben gekocht of grondig renoveren. Je hoeft geen nieuwbouwwoning te kopen om gebruik te maken van alle kortingen.'],
  ['Hoe lang zijn de vouchers geldig na activering?', 'Eenmaal geactiveerde codes hebben een geldigheidsduur die per merk verschilt — doorgaans 6 tot 12 maanden na activering. De exacte geldigheidsdatum staat vermeld in de bevestigingsmail en in je Bylder account.'],
  ['Wat is de gratis leenbed service bij Auping?', 'Auping levert maatwerk boxsprings met een levertijd van 6-12 weken. Bylder-leden mogen gratis een leenbed gebruiken tijdens de wachttijd, zodat je niet op de grond hoeft te slapen na je verhuizing. Dit is exclusief beschikbaar bij Auping Rotterdam Centrum, Den Haag Centrum en Zoetermeer.'],
]

export default function VoucherFaq() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="faq-list">
      {ITEMS.map(([q, a], i) => (
        <div key={q} className={i === open ? 'faq-item open' : 'faq-item'}>
          <button className="faq-q" onClick={() => setOpen(o => (o === i ? null : i))}>
            {q}<span className="faq-icon">+</span>
          </button>
          <div className="faq-a">{a}</div>
        </div>
      ))}
    </div>
  )
}
