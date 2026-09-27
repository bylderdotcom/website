// Gedeelde site-footer — ÉÉN bron voor elke pagina. Server-component (geen JS).
// Structuur 1:1 overgenomen van de bestaande site (6 kolommen + logo + onderbalk).

type Col = { title: string; links: { href: string; label: string; accent?: boolean }[] }

const COLS: Col[] = [
  // Dezelfde links als voorheen — de linkpoort in scripts/homepage_herordenen.mjs
  // rekent op elke href hier — maar niet meer als één kolom van 32 regels.
  // Gegroepeerd naar wat een bezoeker zoekt: over Bylder, de nieuwbouwkoper,
  // wonen en verbouwen, en dan de vier bestaande lijsten.
  { title: 'Bylder', links: [
    { href: '/hoe-het-werkt/', label: 'Hoe Bylder werkt' },
    { href: '/functies/', label: 'Alle functies' },
    { href: '/nieuwbouw-tools/', label: 'Alle tools' },
    { href: '/prijzen/', label: 'Prijzen' },
    { href: '/eerlijke-prijzen/', label: 'Eerlijke prijzen' },
    { href: '/over-ons/', label: 'Over ons' },
    { href: '/blog/', label: 'Blog' },
    { href: '/zakelijk/', label: 'Zakelijk' },
    { href: '/deelnemer-worden/', label: 'Deelnemer worden' },
    { href: '/inkoopvoordeel/', label: 'Inkoopvoordeel vakbedrijven' },
    { href: '/deelnemer-worden/commercieel-vastgoed/', label: 'Commercieel vastgoed' },
    { href: '/en-us/', label: 'For US homebuyers' },
  ] },
  { title: 'Nieuwbouw', links: [
    { href: '/nieuwbouw-koper/', label: 'Nieuwbouwkoper' },
    { href: '/nieuwbouw-project/', label: 'Nieuwbouwprojecten' },
    { href: '/wonen-in/', label: 'Wonen in jouw gemeente' },
    { href: '/meerwerk/', label: 'Meerwerk' },
    { href: '/offerte-check/', label: 'Offerte-check' },
    { href: '/oplevering-nieuwbouw/', label: 'Oplevering' },
    { href: '/bouwvergunning/', label: 'Bouwvergunning' },
    { href: '/3d-sfeerimpressie/', label: '3D-sfeerimpressie' },
    { href: '/ruimtes/', label: 'Per ruimte' },
    { href: '/nieuwbouw-gids/', label: 'Gidsen' },
  ] },
  { title: 'Wonen & verbouwen', links: [
    { href: '/bestaande-bouw/', label: 'Bestaande bouw' },
    { href: '/renovatie/', label: 'Renovatie' },
    { href: '/verbouwen/', label: 'Verbouwen' },
    { href: '/woning-verduurzamen/', label: 'Verduurzamen' },
    { href: '/interieur-woning/', label: 'Inrichten' },
    { href: '/slaapkamer/', label: 'Slaapkamer' },
    { href: '/assortiment/', label: 'Assortiment' },
    { href: '/kortingscode/', label: 'Kortingscodes' },
    { href: '/vouchers/', label: 'Vouchers' },
    { href: '/showroomsale/', label: 'Showroomsale' },
  ] },
  { title: 'Kopen', links: [
    { href: '/kopen/vloeren/', label: 'Vloeren' },
    { href: '/kopen/sanitair/', label: 'Sanitair' },
    { href: '/kozijnloze-deuren/', label: 'Kozijnloze deuren' },
    { href: '/kopen/verlichting/', label: 'Verlichting' },
    { href: '/kopen/laadpalen/', label: 'Laadpalen' },
    { href: '/kopen/zonnepanelen/', label: 'Zonnepanelen' },
    { href: '/kopen/', label: 'Alle categorieën →', accent: true },
  ] },
  { title: 'Projecten', links: [
    { href: '/project/badkamer-renovatie/', label: 'Badkamer renovatie' },
    { href: '/project/gietvloer-leggen/', label: 'Gietvloer leggen' },
    { href: '/project/laadpaal-installeren/', label: 'Laadpaal installeren' },
    { href: '/project/schilderwerk-binnen/', label: 'Schilderwerk' },
    { href: '/project/dakkapel-plaatsen/', label: 'Dakkapel plaatsen' },
    { href: '/project/', label: 'Alle projecten →', accent: true },
  ] },
  { title: 'Vakmannen', links: [
    { href: '/aannemer/', label: 'Aannemer' },
    { href: '/loodgieter/', label: 'Loodgieter' },
    { href: '/elektricien/', label: 'Elektricien' },
    { href: '/schilder/', label: 'Schilder' },
    { href: '/stukadoor/', label: 'Stukadoor' },
    { href: '/badkamer/', label: 'Badkamerspecialist' },
    { href: '/gietvloer/', label: 'Gietvloerspecialist' },
    { href: '/dakkapel/', label: 'Dakkapelspecialist' },
  ] },
  { title: 'Gemeenten', links: [
    { href: '/nieuwbouw/noord-holland/', label: 'Noord-Holland' },
    { href: '/nieuwbouw/zuid-holland/', label: 'Zuid-Holland' },
    { href: '/nieuwbouw/noord-brabant/', label: 'Noord-Brabant' },
    { href: '/nieuwbouw/utrecht/', label: 'Utrecht' },
    { href: '/nieuwbouw/gelderland/', label: 'Gelderland' },
    { href: '/nieuwbouw/', label: 'Alle 12 provincies →', accent: true },
  ] },
]

const JURIDISCH = [
  { href: '/privacy/', label: 'Privacybeleid' },
  { href: '/algemene-voorwaarden/', label: 'Voorwaarden' },
  { href: '/cookies/', label: 'Cookiebeleid' },
  { href: 'mailto:info@bylder.com', label: 'Contact' },
]

const STIJL = `
.ft{padding:64px 0 32px;background:#1A1208;color:rgba(245,240,232,.8);font-family:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif}
.ft-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.ft-top{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.9fr);gap:40px;padding-bottom:36px;border-bottom:1px solid rgba(245,240,232,.1)}
.ft-merk{display:flex;align-items:center;gap:10px}
.ft-merk .b{width:34px;height:34px;border-radius:8px;background:#3D5A3E;display:inline-flex;align-items:center;justify-content:center;color:#F5F0E8;font-size:13px;font-weight:800;font-family:'Space Mono',monospace}
.ft-merk .n{font-weight:800;font-size:18px;letter-spacing:-.02em;color:#F5F0E8}
.ft-merk .n span{color:#659567}
.ft-top p{font-size:15px;line-height:1.6;color:rgba(245,240,232,.66);margin:16px 0 0;max-width:34ch}
.ft-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.ft-cta a{font-size:13.5px;font-weight:700;text-decoration:none;border-radius:9px;padding:10px 16px}
.ft-cta .p{background:#F5F0E8;color:#1A1208}
.ft-cta .s{color:#F5F0E8;border:1px solid rgba(245,240,232,.3)}
.ft-feit{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-self:end}
.ft-feit div{border-left:2px solid rgba(245,240,232,.18);padding-left:14px}
.ft-feit b{display:block;font-family:'Space Mono',monospace;font-size:22px;font-weight:700;color:#F5F0E8;letter-spacing:-.02em}
.ft-feit span{display:block;font-size:12.5px;color:rgba(245,240,232,.6);margin-top:3px;line-height:1.4}
.ft-kol{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:28px 22px;padding:40px 0 36px}
.ft-kol p{font-size:10.5px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:.12em;color:#F5F0E8;font-weight:700;margin:0 0 14px;padding-bottom:10px;border-bottom:1px solid rgba(245,240,232,.14)}
.ft-kol ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.ft-kol a{font-size:13px;color:rgba(245,240,232,.62);text-decoration:none;line-height:1.35}
.ft-kol a:hover{color:#F5F0E8}
.ft-kol a.acc{color:#8AAE8B;font-weight:600}
.ft-bar{border-top:1px solid rgba(245,240,232,.1);padding-top:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px 24px}
.ft-bar p{font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,.5);margin:0}
.ft-bar ul{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px 18px}
.ft-bar ul a{font-size:12.5px;color:rgba(245,240,232,.6);text-decoration:none}
.ft-bar ul a:hover{color:#F5F0E8}
.ft-ok{display:flex;align-items:center;gap:6px;font-size:12px;font-family:'Space Mono',monospace;color:rgba(245,240,232,.5)}
.ft-ok i{width:6px;height:6px;border-radius:50%;background:#659567;display:inline-block}
@media(max-width:1000px){.ft-kol{grid-template-columns:repeat(4,minmax(0,1fr))}.ft-top{grid-template-columns:1fr;gap:28px}.ft-feit{align-self:start}}
@media(max-width:640px){.ft{padding:48px 0 28px}.ft-kol{grid-template-columns:repeat(2,minmax(0,1fr));gap:26px 18px;padding:32px 0 28px}.ft-feit{grid-template-columns:1fr 1fr;gap:14px}.ft-feit b{font-size:19px}}
`

export default function Footer({ merken = 56 }: { merken?: number }) {
  return (
    <footer className="ft">
      <style dangerouslySetInnerHTML={{ __html: STIJL }} />
      <div className="ft-wrap">
        <div className="ft-top">
          <div>
            <div className="ft-merk">
              <span className="b">B.</span>
              <span className="n">Bylder<span>.com</span></span>
            </div>
            <p>Wij lezen je plattegrond en de planning van de bouwer, zodat je op het juiste moment kiest — en alvast samenstelt wat je koopt. Voor nieuwbouw, bestaande bouw en renovatie.</p>
            <div className="ft-cta">
              <a className="p" href="https://app.bylder.com/registreer?utm_source=bylder-site&utm_campaign=footer">Upload je plattegrond</a>
              <a className="s" href="/hoe-het-werkt/">Hoe het werkt</a>
            </div>
          </div>
          <div className="ft-feit" aria-label="Bylder in cijfers">
            <div><b>{merken}</b><span>aangesloten merken met ledenkorting</span></div>
            <div><b>289</b><span>nieuwbouwprojecten met een eigen pagina</span></div>
            <div><b>0 €</b><span>voor bewoners — de merken betalen</span></div>
          </div>
        </div>

        <nav className="ft-kol" aria-label="Sitemap">
          {COLS.map(col => (
            <div key={col.title}>
              <p>{col.title}</p>
              <ul>
                {col.links.map(l => (
                  <li key={l.href + l.label}>
                    <a href={l.href} className={l.accent ? 'acc' : undefined}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="ft-bar">
          <p>© 2026 Bylder Nederland B.V. — KvK 65020006</p>
          <ul aria-label="Juridisch">
            {JURIDISCH.map(l => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
          </ul>
          <span className="ft-ok"><i />Alle systemen operationeel</span>
        </div>
      </div>
    </footer>
  )
}
