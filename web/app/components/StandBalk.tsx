'use client'

import { useEffect, useState } from 'react'
import { herkomst, TABLET_HERKOMST } from './herkomst'

/**
 * De balk op de tablet die op de stand ligt.
 *
 * WAAROM DIE NODIG IS
 * Op een beursvloer geven medewerkers dezelfde tablet de hele dag door. Zonder
 * knop staat de deur van de vorige bezoeker er nog: zijn kleur, zijn beslag,
 * de naam die hij aan zijn hal gaf. De volgende bezoeker begint dan in iemand
 * anders zijn huis, en de medewerker moet met zijn rug naar de klant staan te
 * klikken om dat weg te krijgen.
 *
 * "Begin opnieuw" laadt het stand-adres opnieuw: dat wist de configuratie (die
 * in de URL staat) en de ingevulde formuliervelden, en bewaart de herkomst,
 * zodat elke aanvraag van deze tablet ook als zodanig binnenkomt.
 *
 * De balk verschijnt alleen op de tablet — een gewone bezoeker die op zijn
 * telefoon scant, ziet hem niet. Dat scheelt uitleg en een knop die hij niet
 * moet indrukken.
 */

const GROEN = '#3D5A3E'
const ZAND = '#F5F0E8'

export default function StandBalk({ adres = '/beurs/tablet' }: { adres?: string }) {
  const [tablet, setTablet] = useState(false)
  useEffect(() => { setTablet(herkomst() === TABLET_HERKOMST) }, [])

  if (!tablet) return null

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, background: GROEN, color: ZAND, borderRadius: 12, padding: '12px 16px', margin: '0 0 18px',
    }}>
      <span style={{ fontSize: 14.5, fontWeight: 700 }}>
        Tablet op de stand — aanvragen komen binnen als beursaanvraag
      </span>
      <button
        type="button"
        onClick={() => { window.location.href = adres }}
        style={{
          background: ZAND, color: GROEN, fontWeight: 800, fontSize: 14.5, fontFamily: 'inherit',
          border: 0, borderRadius: 9, padding: '9px 16px', cursor: 'pointer',
        }}
      >
        Begin opnieuw voor de volgende bezoeker
      </button>
    </div>
  )
}
