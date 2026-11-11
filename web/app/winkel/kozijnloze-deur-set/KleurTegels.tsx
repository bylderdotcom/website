import { SET_KLEUREN, DEURSET } from '@/lib/winkel'
import { setPrijs } from '../../kozijnloze-deuren/configurator/prijs'

// Tegels naar de sets in kleur (11-11-2026), met de render van die kleur. Op de gegronde set en op elke kleur.
export default function KleurTegels({ huidig }: { huidig?: string }) {
  const vanaf = '€ ' + setPrijs('standaard', 'gelakt').toLocaleString('nl-NL', { minimumFractionDigits: 2 })
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(min(46%, 150px), 1fr))' }}>
      {SET_KLEUREN.filter(k => k.ral !== huidig).map(k => (
        <a key={k.ral} href={`/winkel/${DEURSET.slug}/ral-${k.ral}/`} style={{ display: 'block', textDecoration: 'none', color: '#1A1208', background: '#fff', border: '1px solid rgba(61,46,30,0.12)', borderRadius: 14, overflow: 'hidden' }}>
          <img src={`/img/winkel/deuren/origin-${k.ral}-sm.webp`} width="400" height="420" loading="lazy" alt={`Kozijnloze deur in RAL ${k.ral} ${k.naam}`}
            style={{ width: '100%', height: 'auto', aspectRatio: '400 / 420', objectFit: 'cover', display: 'block', background: k.hex }} />
          <span style={{ display: 'block', padding: '9px 12px 11px', fontSize: 14 }}>
            <strong style={{ textTransform: 'capitalize' }}>{k.naam}</strong>
            <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(61,46,30,0.65)' }}>RAL {k.ral} · vanaf {vanaf}</span>
          </span>
        </a>
      ))}
    </div>
  )
}
