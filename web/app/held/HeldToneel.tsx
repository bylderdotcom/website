'use client'

import { useEffect, useRef, useState } from 'react'

// De held van de homepage, in beeld: een plattegrond die wordt uitgelezen.
//
// Vijf fasen, in een lus: de tekening ligt plat → kantelt en licht op (de
// deuren rood) → de hoeveelheden verschijnen → per regel het merk en de korting
// → het zegel met het aantal merken. Dit is geen illustratie bij een tekst maar
// de tekst zelf: wat Bylder doet, zonder één zin uitleg.
//
// De woning is een voorbeeld (10,40 × 7,80 m begane grond); de merken en de
// kortingen komen uit data/deelnemers.json en zijn dus echt. Wat hier NIET
// wordt beloofd: dat de telling automatisch aan een merk gekoppeld wordt — de
// tekeninganalyse telt wel, maar koppelt nog niet.

export type Regel = {
  hoeveel: string
  eenheid: string
  wat: string
  toelichting: string
  merk: string
  korting: string   // "10%" of "configurator"
}

const FASEN = [
  ['1', 'Je tekening'],
  ['2', 'Uitgelezen'],
  ['3', 'Wat je kiest'],
  ['4', 'Merk en korting'],
  ['5', 'In je dossier'],
] as const

export default function HeldToneel({ regels, merken }: { regels: Regel[]; merken: number }) {
  const [fase, setFase] = useState(1)
  const [vast, setVast] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (vast) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setFase(5); return }
    timer.current = setInterval(() => setFase(f => (f === 5 ? 1 : f + 1)), 2600)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [vast])

  const kies = (n: number) => { setVast(true); setFase(n) }

  return (
    <div className={`ht ht-f${fase}`} aria-label="Zo leest Bylder een plattegrond uit">
      <div className="ht-doek">
        <div className="ht-tekenvlak">
          <div className="ht-raster" aria-hidden="true" />
          <div className="ht-plan">
            <svg viewBox="0 0 400 312" role="img" aria-label="Plattegrond van de begane grond met de binnendeuren gemarkeerd">
              <path className="ht-vlak" d="M22 22 H378 V290 H22 Z" />
              <path className="ht-muur" d="M22 22 H378 V290 H22 Z" />
              <path className="ht-muur" d="M22 170 H246" />
              <path className="ht-muur" d="M246 22 V290" />
              <path className="ht-muur" d="M246 220 H378" />
              <path className="ht-dun" d="M118 170 v-26" />
              <path className="ht-dun" d="M300 290 v-18" />
              <path className="ht-deur" d="M96 170 h34" />
              <path className="ht-deur" d="M182 170 h34" />
              <path className="ht-deur" d="M246 96 v34" />
              <path className="ht-deur" d="M246 246 v34" />
              <path className="ht-deur" d="M284 220 h34" />
              <path className="ht-deur" d="M336 220 h30" />
              <text className="ht-maat" x="200" y="14" textAnchor="middle">10.40 M</text>
              <text className="ht-maat" x="134" y="98" textAnchor="middle">WOONKAMER</text>
              <text className="ht-maat" x="134" y="236" textAnchor="middle">KEUKEN</text>
              <text className="ht-maat" x="312" y="126" textAnchor="middle">HAL</text>
              <text className="ht-maat" x="312" y="262" textAnchor="middle">BERGING</text>
            </svg>
          </div>
          <span className="ht-stempel">BLAD 1 VAN 2 · BEGANE GROND 78 M²</span>
        </div>

        <div className="ht-staat">
          <div className="ht-staatkop">
            <h2>Wat je nog moet kiezen</h2>
            <span>uit je eigen tekening</span>
          </div>
          {regels.map((r, i) => (
            <div className="ht-rij" key={r.wat} style={{ ['--i' as string]: i }}>
              <div className="ht-hoeveel">{r.hoeveel}<small>{r.eenheid}</small></div>
              <div className="ht-wat"><b>{r.wat}</b><span>{r.toelichting}</span></div>
              <div className="ht-merk"><b>{r.merk}</b><span className="ht-korting">{r.korting}</span></div>
            </div>
          ))}
          <div className="ht-slot">
            <span className="ht-zegel">{merken} AANGESLOTEN MERKEN</span>
            <p>Alles in één dossier, met de sluitdata van de bouwer ernaast.</p>
          </div>
        </div>
      </div>

      <div className="ht-rail" role="tablist" aria-label="Fasen">
        {FASEN.map(([n, naam]) => (
          <button key={n} type="button" role="tab" className="ht-stap"
            aria-selected={fase === +n} onClick={() => kies(+n)}>
            <em>Fase {n}</em><b>{naam}</b>
          </button>
        ))}
      </div>
    </div>
  )
}
