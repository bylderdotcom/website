// Verwijzing naar de afwerking met Bylder als aannemer (besluit Daniel, 28-10-2026): elk bezoek
// moet weten dat Bylder zelf de offerte kan maken voor de hele afwerking van een nieuwbouwwoning.
// Staat onder de commerciële stap van elke pagina (CommercieleStap) en in het menu.

const GROEN = '#3D5A3E'

export default function AfwerkpakketCTA({ marge = '14px 0 0' }: { marge?: string }) {
  return (
    <aside aria-label="Je hele afwerking door Bylder" style={{ margin: marge, display: 'flex', flexWrap: 'wrap', gap: '10px 18px', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1.5px solid ${GROEN}`, borderRadius: 14, padding: '14px 18px' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0, flex: '1 1 320px' }}>
        <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={GROEN} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
          <path d="M3 21V9l9-6 9 6v12M3 21h18M9 21v-6h6v6" />
        </svg>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: '#1A1208' }}>
          <strong>Of laat Bylder je hele afwerking regelen.</strong> Van stucwerk tot tegels, badkamer, vloeren, deuren en kasten: één offerte uit je tekening, één planning, één aanspreekpunt. <span style={{ color: 'rgba(61,46,30,0.65)' }}>Nu in de regio Den Bosch.</span>
        </p>
      </div>
      <a href="/nieuwbouw-afwerken/" style={{ flexShrink: 0, background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14.5, padding: '11px 18px', borderRadius: 10, textDecoration: 'none' }}>Vraag een offerte aan →</a>
    </aside>
  )
}
