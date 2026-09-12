'use client'

import { useState } from 'react'
import type { Post } from '../../lib/kortingen'

/**
 * Reken zelf uit wat de vouchers je schelen.
 *
 * De site rekende vroeger vóór de bezoeker ("gemiddeld €4.200 bespaard") met
 * een bedrag dat nergens op sloeg. Dit blok rekent mét hem: hij vult in wat hij
 * denkt uit te geven, en ziet zijn eigen bedrag — opgebouwd uit de percentages
 * die de merken werkelijk geven.
 *
 * Het opent ingevuld, niet leeg. Een leeg formulier met nullen laat niet zien
 * wat het doet, en de bedragen die erin staan zijn gebruikelijke bedragen uit
 * het onderzoek van 12-09-2026. Dat staat er ook bij, zodat niemand ze voor
 * zijn eigen situatie aanziet.
 */

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'

const euro = (n: number) => '€' + Math.round(n).toLocaleString('nl-NL')

export default function Rekenblok({ posten, nietGedekt }: {
  posten: Post[]
  nietGedekt: { naam: string; waarom: string }[]
}) {
  const [bedragen, setBedragen] = useState<Record<string, number>>(
    () => Object.fromEntries(posten.map(p => [p.id, p.standaard])),
  )
  const [aangeraakt, setAangeraakt] = useState(false)

  const zet = (id: string, waarde: string) => {
    const n = Number(waarde.replace(/[^\d]/g, ''))
    setAangeraakt(true)
    setBedragen(b => ({ ...b, [id]: Number.isFinite(n) ? Math.min(n, 500000) : 0 }))
  }

  const regels = posten.map(p => ({ ...p, bedrag: bedragen[p.id] ?? 0, korting: (bedragen[p.id] ?? 0) * p.procent / 100 }))
  const totaalBudget = regels.reduce((s, r) => s + r.bedrag, 0)
  const totaalKorting = regels.reduce((s, r) => s + r.korting, 0)

  return (
    <div className="rb">
      <style>{CSS}</style>

      <div className="rb-kop">
        <h2 className="s-title" style={{ marginBottom: 6 }}>Reken uit wat het jou scheelt</h2>
        <p className="s-sub" style={{ maxWidth: '62ch' }}>
          Wij noemen geen gemiddelde besparing, want die hangt af van wat jíj koopt. Vul in wat je
          denkt uit te geven en je ziet je eigen bedrag, opgebouwd uit de korting die elk merk geeft.
        </p>
      </div>

      <div className="rb-grid">
        <div className="rb-tabel" role="group" aria-label="Je budget per onderdeel">
          {regels.map(r => (
            <div className="rb-rij" key={r.id}>
              <label htmlFor={`rb-${r.id}`} className="rb-naam">
                {r.naam}
                <span className="rb-pct">
                  {r.procent}%{r.hoogste ? ` · tot ${r.hoogste.procent}% bij ${r.hoogste.merk}` : ''} · {r.merken} {r.merken === 1 ? 'merk' : 'merken'}
                </span>
              </label>
              <div className="rb-invoer">
                <span aria-hidden="true">€</span>
                <input
                  id={`rb-${r.id}`}
                  inputMode="numeric"
                  value={r.bedrag ? r.bedrag.toLocaleString('nl-NL') : ''}
                  onChange={e => zet(r.id, e.target.value)}
                  aria-label={`Budget voor ${r.naam} in euro`}
                />
              </div>
              <output className="rb-korting" aria-label={`Korting op ${r.naam}`}>
                {r.korting > 0 ? '−' + euro(r.korting) : '—'}
              </output>
            </div>
          ))}
        </div>

        <aside className="rb-uitkomst">
          <div className="rb-som">
            <span className="rb-somlabel">Jouw budget in deze onderdelen</span>
            <strong>{euro(totaalBudget)}</strong>
          </div>
          <div className="rb-som rb-groot">
            <span className="rb-somlabel">Daarvan met ledenkorting</span>
            <strong>{euro(totaalKorting)}</strong>
            <span className="rb-pctsom">
              {totaalBudget > 0 ? `${(totaalKorting / totaalBudget * 100).toFixed(1)}% van dit budget` : 'vul een bedrag in'}
            </span>
          </div>
          <p className="rb-fijn">
            {aangeraakt
              ? 'Gerekend met het middelste kortingspercentage per onderdeel. Koop je bij het merk dat het meeste geeft, dan valt het hoger uit.'
              : 'Nu ingevuld met bedragen die gebruikelijk zijn — pas ze aan naar je eigen plannen.'}
          </p>
          <a className="rb-cta" href="https://app.bylder.com/registreer?utm_source=bylder-site&amp;utm_campaign=vouchers-rekenblok">
            Vouchers activeren — gratis →
          </a>
        </aside>
      </div>

      <div className="rb-eerlijk">
        <h3>Waar de korting <em>niet</em> voor geldt</h3>
        <ul>
          {nietGedekt.map(n => <li key={n.naam}><strong>{n.naam}</strong> — {n.waarom}</li>)}
        </ul>
        <p>
          De korting geldt bovendien alleen als je koopt bij een merk dat meedoet. Koop je je vloer
          ergens anders, dan telt die regel niet mee.
        </p>
      </div>
    </div>
  )
}

const CSS = `
.rb{background:#fff;border:1px solid ${INKT}0.1);border-radius:20px;padding:32px}
.rb-kop{margin-bottom:24px}
.rb-grid{display:grid;grid-template-columns:1fr 280px;gap:28px;align-items:start}
.rb-tabel{display:grid;gap:2px}
.rb-rij{display:grid;grid-template-columns:1fr 130px 88px;gap:14px;align-items:center;padding:10px 0;border-bottom:1px solid ${INKT}0.07)}
.rb-rij:last-child{border-bottom:0}
.rb-naam{display:grid;gap:2px;font-size:15px;font-weight:700;color:#1A1208;cursor:pointer}
.rb-pct{font-family:"Space Mono",monospace;font-size:11px;font-weight:400;color:${INKT}0.55);letter-spacing:.01em}
.rb-invoer{display:flex;align-items:center;gap:4px;border:1.5px solid ${INKT}0.16);border-radius:9px;padding:8px 10px;background:#fff;color:${INKT}0.6);font-size:14px}
.rb-invoer:focus-within{border-color:${GROEN}}
.rb-invoer input{border:0;outline:0;width:100%;font:700 15px/1.2 inherit;color:#1A1208;background:transparent;font-variant-numeric:tabular-nums}
.rb-korting{font-family:"Space Mono",monospace;font-size:15px;font-weight:700;color:${GROEN};text-align:right;font-variant-numeric:tabular-nums}
/* De menubalk plakt zelf al op 105px hoog; zonder die marge schuift het
   totaal eronder zodra je scrollt. */
.rb-uitkomst{background:#F5F0E8;border-radius:14px;padding:22px;display:grid;gap:16px;position:sticky;top:121px}
.rb-som{display:grid;gap:2px}
.rb-somlabel{font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;color:${INKT}0.55)}
.rb-som strong{font-size:1.3rem;color:#1A1208;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.rb-groot strong{font-size:2.1rem;color:${GROEN};line-height:1.1}
.rb-pctsom{font-size:12.5px;color:${INKT}0.6)}
.rb-fijn{font-size:12.5px;line-height:1.55;color:${INKT}0.62);margin:0}
.rb-cta{display:block;text-align:center;background:${GROEN};color:#F5F0E8;font-weight:700;font-size:14.5px;padding:11px 16px;border-radius:10px;text-decoration:none}
.rb-eerlijk{margin-top:26px;padding-top:20px;border-top:1px solid ${INKT}0.1)}
.rb-eerlijk h3{font-size:15px;font-weight:800;color:#1A1208;margin:0 0 8px}
.rb-eerlijk em{font-style:normal;text-decoration:underline;text-underline-offset:3px}
.rb-eerlijk ul{margin:0 0 10px;padding-left:18px;display:grid;gap:5px;font-size:14px;color:${INKT}0.75);line-height:1.55}
.rb-eerlijk p{font-size:14px;color:${INKT}0.75);line-height:1.55;margin:0;max-width:64ch}
@media(max-width:820px){
  .rb{padding:24px 20px}
  .rb-grid{grid-template-columns:1fr}
  .rb-uitkomst{position:static}
}
@media(max-width:480px){
  .rb-rij{grid-template-columns:1fr 104px;gap:8px 12px}
  .rb-korting{grid-column:2;text-align:right}
}
`
