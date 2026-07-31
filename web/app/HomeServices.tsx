// De verweven-pijlers-sectie ("Alles voor je (nieuwe) woning" — herpositionering
// 10 jul 2026): vier pijlers (Advies/Ontwerpen/Shoppen/Aanbesteden) rond één kern,
// het woningdossier. Vervangt de donkere "Bylder diensten"-sectie; de 8 city+bedrijf-
// hub-links + eerlijke-prijzen (linkarchitectuur-fase) blijven volledig behouden en
// zijn uitgebreid met de overige hubs.
// Server-component, geen client-JS; de animatie in de Ontwerpen-glimpse is puur CSS.

type Vak = { href: string; label: string }

const VAKMANNEN: Vak[] = [
  { href: '/aannemer/', label: 'Aannemer' },
  { href: '/loodgieter/', label: 'Loodgieter' },
  { href: '/elektricien/', label: 'Elektricien' },
  { href: '/schilder/', label: 'Schilder' },
  { href: '/stukadoor/', label: 'Stukadoor' },
  { href: '/badkamer/', label: 'Badkamerspecialist' },
  { href: '/gietvloer/', label: 'Gietvloerspecialist' },
  { href: '/dakkapel/', label: 'Dakkapelspecialist' },
]

const line = 'rgba(61,46,30,0.10)'
const muted = 'rgba(61,46,30,0.72)'
const faint = 'rgba(61,46,30,0.7)'
const mono = "'Space Mono',monospace"

const pillar: React.CSSProperties = { background: '#fff', border: `1px solid ${line}`, borderRadius: 18, padding: '24px 24px 20px', position: 'relative', zIndex: 2, boxShadow: '0 14px 44px rgba(26,18,8,0.07)' }
const num: React.CSSProperties = { fontSize: 11, letterSpacing: '0.09em', color: faint, textTransform: 'uppercase', fontWeight: 700, fontFamily: mono }
const h3s: React.CSSProperties = { fontSize: '1.3rem', fontWeight: 800, margin: '6px 0 2px', color: '#1A1208', letterSpacing: '-0.02em' }
const belofte: React.CSSProperties = { fontSize: 14, color: '#B85C38', fontWeight: 700, marginBottom: 12 }
const li: React.CSSProperties = { fontSize: 13.5, color: muted, display: 'flex', gap: 9, alignItems: 'flex-start', lineHeight: 1.5 }
const dot: React.CSSProperties = { width: 6, height: 6, borderRadius: 2, background: '#3D5A3E', flexShrink: 0, marginTop: 7 }
const hubLink: React.CSSProperties = { fontSize: 12.5, color: '#3D5A3E', textDecoration: 'none', fontWeight: 600 }
const chip: React.CSSProperties = { position: 'absolute', zIndex: 4, background: '#1A1208', color: '#F5F0E8', fontSize: 11.5, padding: '6px 13px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: '0 6px 18px rgba(26,18,8,0.22)', fontFamily: mono }
const shot: React.CSSProperties = { border: `1px solid ${line}`, borderRadius: 12, overflow: 'hidden', marginBottom: 14, background: '#F5F0E8' }
const shotBar: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', background: '#FBF9F5', borderBottom: `1px solid ${line}` }
const shotDot = (c: string): React.CSSProperties => ({ width: 7, height: 7, borderRadius: '50%', background: c })
const shotLbl: React.CSSProperties = { fontSize: 9.5, color: faint, marginLeft: 6, fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
const mrow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#3D2E1E', background: '#F5F0E8', border: `1px solid ${line}`, borderRadius: 7, padding: '6px 9px' }
const mdot = (c: string): React.CSSProperties => ({ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: c })
const mprice: React.CSSProperties = { marginLeft: 'auto', fontWeight: 800, color: '#1A1208', whiteSpace: 'nowrap' }
const vchip: React.CSSProperties = { border: `1px solid ${line}`, borderRadius: 8, padding: '8px 9px', display: 'flex', flexDirection: 'column', gap: 2 }

function Bar({ label }: { label: string }) {
  return (
    <div style={shotBar}>
      <span style={shotDot('#E0C7A8')} /><span style={shotDot('#CFE0C2')} /><span style={shotDot('#E8D2C7')} />
      <span style={shotLbl}>{label}</span>
    </div>
  )
}

export default function HomeServices() {
  return (
    <section id="pijlers" style={{ padding: '76px 0 84px', background: '#EDE6D8', borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
      <style>{`
        @keyframes hsv-reveal{0%,38%{opacity:1}50%,88%{opacity:0}100%{opacity:1}}
        @keyframes hsv-la{0%,38%{opacity:1}50%,88%{opacity:0}100%{opacity:1}}
        @keyframes hsv-lb{0%,38%{opacity:0}50%,88%{opacity:1}100%{opacity:0}}
        @media (prefers-reduced-motion:reduce){.hsv-anim{animation:none!important}.hsv-tek{opacity:0!important}.hsv-lbl-b{opacity:1!important}}
        .hsv-grid{display:grid;grid-template-columns:1fr 1fr;gap:120px 160px;position:relative}
        .hsv-hub{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:3;width:172px;height:172px;border-radius:50%;background:#3D5A3E;color:#F5F0E8;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:4px;box-shadow:0 18px 50px rgba(61,90,62,0.35);border:5px solid #EDE6D8}
        @media(max-width:820px){
          .hsv-grid{grid-template-columns:1fr;gap:40px}
          .hsv-hub{position:static;transform:none;width:100%;height:auto;border-radius:18px;padding:20px;order:-1;border:none}
          .hsv-chip{display:none!important}
          #pijler-advies{order:1}#pijler-ontwerpen{order:2}#pijler-shoppen{order:3}#pijler-aanbesteden{order:4}
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ textAlign: 'center', maxWidth: 660, margin: '0 auto 48px' }}>
          <div style={{ fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B85C38', fontWeight: 700, marginBottom: 12, fontFamily: mono }}>Eén dossier, vier pijlers</div>
          <h2 style={{ fontSize: 'clamp(1.7rem,3.4vw,2.4rem)', fontWeight: 800, color: '#1A1208', letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 12 }}>
            Upload één keer je tekening.<br />Alles werkt ermee.
          </h2>
          <p style={{ color: muted, fontSize: '1.02rem', lineHeight: 1.65 }}>
            Geen losse tools, maar één verweven geheel: wat je in de ene stap doet, maakt de volgende slimmer.
          </p>
        </div>

        <div style={{ position: 'relative', maxWidth: 940, margin: '0 auto' }}>
          <span className="hsv-chip" style={{ ...chip, top: -16, left: '50%', transform: 'translateX(-50%)' }}>→ je tekening rekent mee in elk ontwerp</span>
          <span className="hsv-chip" style={{ ...chip, top: '50%', left: '75%', transform: 'translate(-50%,-50%)' }}>→ product in je render = te shoppen, met voucher</span>
          <span className="hsv-chip" style={{ ...chip, bottom: -16, left: '50%', transform: 'translateX(-50%)' }}>→ gekozen? de juiste vakman plaatst het</span>
          <span className="hsv-chip" style={{ ...chip, top: '50%', left: '25%', transform: 'translate(-50%,-50%)' }}>→ elk voorstel gecheckt tegen de marktprijs</span>

          <div className="hsv-grid">
            <div className="hsv-hub">
              <span style={{ fontSize: 11, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#8AAE8B', fontFamily: mono }}>de kern</span>
              <span style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2, padding: '0 14px' }}>Jouw woning&shy;dossier</span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.75)', padding: '0 16px', lineHeight: 1.35 }}>tekening · maten · planning · budget</span>
            </div>

            <div style={pillar} id="pijler-advies">
              <div style={num}>Pijler 1</div>
              <h3 style={h3s}>Advies</h3>
              <div style={belofte}>Weet wat eerlijk is.</div>
              <div style={shot}>
                <Bar label="jouw offerte-check" />
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, background: '#fff' }}>
                  <div style={mrow}><span style={mdot('#4C7A4E')} />Stucwerk woonkamer<span style={mprice}>€2.340</span></div>
                  <div style={mrow}><span style={mdot('#C98A2E')} />Meerwerk elektra <small style={{ color: faint, fontSize: 9.5 }}>boven marktprijs</small><span style={mprice}>€4.100</span></div>
                  <div style={mrow}><span style={mdot('#4C7A4E')} />Vloerverwarming<span style={mprice}>€3.150</span></div>
                  <div style={{ fontSize: 10.5, color: '#3D5A3E', fontWeight: 700, padding: '2px 2px 0' }}>AI checkt elke post · gem. besparing €1.640</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={li}><span style={dot} /><span><a href="/eerlijke-prijzen/" style={{ color: '#1A1208', fontWeight: 700 }}>Marktprijzen</a> per klus en per plaats, uit eigen data</span></div>
                <div style={li}><span style={dot} /><span><a href="/bouwvergunning/" style={{ color: '#1A1208', fontWeight: 700 }}>Vergunning-wegwijzer</a>: wat mag vergunningvrij, wat niet</span></div>
              </div>
            </div>

            <div style={pillar} id="pijler-ontwerpen">
              <div style={num}>Pijler 2</div>
              <h3 style={h3s}>Ontwerpen</h3>
              <div style={belofte}>Zie je woning áf, vóór je beslist.</div>
              <div style={shot}>
                <Bar label="tekening → interieur" />
                <div style={{ position: 'relative', aspectRatio: '16/9', background: '#fff' }}>
                  <img src="/img/3d-impressie-voorbeeld.jpg" alt="3D-sfeerimpressie gemaakt van een bouwtekening" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  <img src="/img/plattegrond-tekening.jpg" alt="Technische bouwtekening — het startpunt" loading="lazy" className="hsv-anim hsv-tek" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', background: '#fff', animation: 'hsv-reveal 7s ease-in-out infinite' }} />
                  <span className="hsv-anim" style={{ position: 'absolute', left: 8, bottom: 8, fontSize: 9, background: '#1A1208', color: '#F5F0E8', padding: '3px 8px', borderRadius: 999, fontFamily: mono, animation: 'hsv-la 7s ease-in-out infinite' }}>jouw bouwtekening</span>
                  <span className="hsv-anim hsv-lbl-b" style={{ position: 'absolute', left: 8, bottom: 8, fontSize: 9, background: '#3D5A3E', color: '#F5F0E8', padding: '3px 8px', borderRadius: 999, fontFamily: mono, opacity: 0, animation: 'hsv-lb 7s ease-in-out infinite' }}>nieuw interieur — in seconden</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={li}><span style={dot} /><span><a href="/plattegrond-inrichten/" style={{ color: '#1A1208', fontWeight: 700 }}>Inrichten op schaal</a> op je eigen plattegrond</span></div>
                <div style={li}><span style={dot} /><span><a href="/3d-sfeerimpressie/" style={{ color: '#1A1208', fontWeight: 700 }}>Foto of tekening → interieur</a> in seconden, in jouw stijl</span></div>
              </div>
            </div>

            <div style={pillar} id="pijler-aanbesteden">
              <div style={num}>Pijler 4</div>
              <h3 style={h3s}>Aanbesteden</h3>
              <div style={belofte}>Laat de juiste vakman het doen.</div>
              <div style={shot}>
                <Bar label="jouw aanvraag · stucwerk 86 m²" />
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6, background: '#fff' }}>
                  <div style={mrow}><span style={mdot('#4C7A4E')} />Stukadoorsbedrijf de Vries <small style={{ color: faint, fontSize: 9.5 }}>★ 4,8</small><span style={mprice}>€2.150</span></div>
                  <div style={mrow}><span style={mdot('#4C7A4E')} />Afbouw Jansen <small style={{ color: faint, fontSize: 9.5 }}>★ 4,6</small><span style={mprice}>€2.290</span></div>
                  <div style={{ fontSize: 9.5, color: faint, padding: '2px 2px 0' }}>marktprijs voor deze klus: €1.900–€2.400</div>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.55, marginBottom: 10 }}>
                <strong style={{ color: '#1A1208' }}>25.697 vakbedrijven</strong> in 1.541 plaatsen, met reviews gebundeld en de marktprijs naast elk voorstel:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {VAKMANNEN.map(v => (
                  <a key={v.href} href={v.href} style={hubLink}>→ {v.label}</a>
                ))}
              </div>
            </div>

            <div style={pillar} id="pijler-shoppen">
              <div style={num}>Pijler 3</div>
              <h3 style={h3s}>Shoppen</h3>
              <div style={belofte}>Shop producten én kortingen bij 61 merken.</div>
              <div style={shot}>
                <Bar label="jouw vouchers" />
                <div style={{ padding: '10px 10px 0', background: '#fff' }}>
                  <div style={{ ...mrow, background: 'rgba(61,90,62,0.06)', borderColor: 'rgba(61,90,62,0.2)' }}><span style={mdot('#4C7A4E')} />Aanbevolen bij jouw render: eiken salontafel<span style={mprice}>shop →</span></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '6px 10px 10px', background: '#fff' }}>
                  <div style={vchip}><span style={{ fontWeight: 800, fontSize: 11, color: '#1A1208' }}>Auping</span><span style={{ fontSize: 9.5, color: '#3D5A3E', fontWeight: 700 }}>10% korting</span></div>
                  <div style={vchip}><span style={{ fontWeight: 800, fontSize: 11, color: '#1A1208' }}>Goossens</span><span style={{ fontSize: 9.5, color: '#3D5A3E', fontWeight: 700 }}>10% korting</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={li}><span style={dot} /><span><a href="/vouchers/" style={{ color: '#1A1208', fontWeight: 700 }}>Alle vouchers</a> — landelijk én lokaal bij jou in de buurt</span></div>
                <div style={li}><span style={dot} /><span><a href="/kortingscode/" style={{ color: '#1A1208', fontWeight: 700 }}>Kortingscodes</a> per merk, gecheckt en actueel</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
