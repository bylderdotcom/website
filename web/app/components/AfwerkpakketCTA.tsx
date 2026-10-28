import { onderdeelVoorPad, plaatsInRegio } from '@/lib/afwerken'

// Verwijzing naar de afwerking met Bylder als aannemer (besluit Daniel, 28-10-2026): elk bezoek
// moet weten dat Bylder zelf de offerte kan maken voor de hele afwerking van een nieuwbouwwoning.
// Staat onder de commerciële stap van elke pagina (CommercieleStap), op de homepage en in het menu.
//
// Met een pad: gaat de pagina over een onderdeel (stucwerk, tegels, vloer...), dan linkt hij naar
// dat onderdeel; ligt de plaats in de regio Den Bosch, dan wordt hij groter en noemt hij de plaats.

const GROEN = '#3D5A3E'

export default function AfwerkpakketCTA({ marge = '14px 0 0', pad = '', plek = 'onder-stap' }: { marge?: string; pad?: string; plek?: string }) {
  const o = onderdeelVoorPad(pad)
  const plaats = plaatsInRegio(pad)
  const href = o ? `/nieuwbouw-afwerken/${o.slug}/` : '/nieuwbouw-afwerken/'
  const wat = o ? `${o.naam.toLowerCase()} en de rest van je afwerking` : 'je hele afwerking'

  if (plaats) {
    return (
      <aside aria-label="Je hele afwerking door Bylder" style={{ margin: marge, background: GROEN, borderRadius: 18, padding: '22px 24px', color: '#F5F0E8' }}>
        <p style={{ fontSize: 11.5, fontFamily: "'Space Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#E8D9B8', margin: '0 0 8px' }}>Bylder als aannemer · {plaats}</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2, margin: '0 0 8px', letterSpacing: '-0.02em', textWrap: 'balance' }}>
          In {plaats} regelen wij {wat}, in één offerte.
        </h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'rgba(245,240,232,0.85)', margin: '0 0 16px', maxWidth: '64ch' }}>
          Stucwerk, tegels, badkamer, vloeren, deuren, schilderwerk en kasten. Wij maken de offerte uit je tekening, plannen alles en zijn je enige aanspreekpunt. Het werk doen vakbedrijven uit de regio.
        </p>
        <a href={href} data-meet={`regio:${plaats}`} style={{ display: 'inline-block', background: '#F5F0E8', color: '#1A1208', fontWeight: 800, fontSize: 15, padding: '13px 22px', borderRadius: 11, textDecoration: 'none' }}>Vraag je offerte aan →</a>
      </aside>
    )
  }

  return (
    <aside aria-label="Je hele afwerking door Bylder" style={{ margin: marge, display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1.5px solid ${GROEN}`, borderRadius: 14, padding: '14px 18px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0, flex: '1 1 320px' }}>
        <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GROEN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6" />
        </svg>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: '#1A1208' }}>
          <strong>Of laat Bylder {wat} regelen.</strong> Van stucwerk tot tegels, badkamer, vloeren, deuren en kasten: één offerte uit je tekening, één planning, één aanspreekpunt. <span style={{ color: 'rgba(61,46,30,0.65)' }}>Nu in de regio Den Bosch.</span>
        </p>
      </div>
      <a href={href} data-meet={plek} style={{ flexShrink: 0, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14.5, padding: '11px 18px', borderRadius: 10, textDecoration: 'none' }}>Vraag een offerte aan →</a>
    </aside>
  )
}
