// Aankondigingsbalk voor de Beurs Eigen Huis (9, 10 en 11 oktober 2026).
//
// Dezelfde markup als in _scripts/aankondigingsbalk_pass.py, dat hem op de
// 8.773 losse pagina's zet. Hier staat hij één keer voor alle Next-routes.
//
// TIJDELIJK — na 11 oktober weghalen: deze component uit layout.tsx, en
// `python3 _scripts/aankondigingsbalk_pass.py --verwijder` voor de rest.
//
// Hij staat vóór de navigatie en is niet sticky: hij schuift weg bij het
// scrollen, waarna de navigatie bovenaan blijft plakken.
export default function Aankondiging() {
  return (
    <div data-aankondiging="beurs2026" style={{
      background: '#1A1208', color: '#F5F0E8', fontSize: '13.5px',
      lineHeight: 1.5, padding: '10px 20px', textAlign: 'center',
    }}>
      <span style={{ fontWeight: 700 }}>25 gratis kaarten voor de Beurs Eigen Huis</span>
      <span style={{ opacity: .62 }}> &middot; 9 t/m 11 oktober, Jaarbeurs Utrecht &middot; </span>
      <a href="/beurs-eigen-huis/" style={{
        color: '#F5F0E8', fontWeight: 700, textDecoration: 'underline',
        textUnderlineOffset: '3px',
      }}>Vraag je kaarten aan</a>
    </div>
  )
}
