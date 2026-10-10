// Opmaak van de nieuwe homepage-blokken. Eén bestand, één prefix (hh- voor de
// pagina, ht- voor het toneel in de kop), zodat niets botst met home.css of
// met de vier oude blokken die letterlijk zijn overgenomen.
//
// Kleuren zijn die van de site: crème, inkt, mos, roest. Het raster is 1200px
// en staat links uitgelijnd onder het logo — dat is een harde regel.

export const HELD_STIJL = `
.hh-wrap{max-width:1200px;margin:0 auto;padding:0 24px}
.hh-oog{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;
  color:#B85C38;font-weight:700;margin:0 0 12px}
.hh-kop h2{font-size:clamp(1.7rem,3vw,2.5rem);font-weight:800;letter-spacing:-.03em;line-height:1.08;
  color:#1A1208;margin:0;text-wrap:balance;max-width:22ch}
.hh-sub{font-size:16.5px;line-height:1.65;color:rgba(61,46,30,.72);margin:14px 0 0;max-width:62ch}
.hh-kop-rij{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.hh-knop-licht{font-size:14.5px;font-weight:800;color:#3D5A3E;text-decoration:none;border:1.5px solid #3D5A3E;
  border-radius:10px;padding:11px 18px;white-space:nowrap}
.hh-knop-licht:hover{background:#3D5A3E;color:#F5F0E8}

/* ── 1. de kop ── */
.hh-hero{background:#F5F0E8;padding:56px 0 64px;position:relative;overflow:hidden}
.hh-hero::before{content:"";position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(ellipse at 70% 40%,rgba(245,240,232,0) 30%,#F5F0E8 75%),
                   linear-gradient(rgba(61,46,30,.07) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(61,46,30,.07) 1px,transparent 1px);
  background-size:100% 100%,40px 40px,40px 40px}
.hh-hero-grid{position:relative;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:48px;align-items:center}
.hh-hero-copy h1{font-size:clamp(2.2rem,4.4vw,3.7rem);font-weight:800;letter-spacing:-.035em;line-height:1.02;
  color:#1A1208;margin:0;text-wrap:balance}
.hh-hero-copy h1 em{font-style:normal;font-weight:300;color:#3D2E1E}
.hh-hero-copy h1 br{display:none}
@media(min-width:1001px){.hh-hero-copy h1 br{display:inline}}
.hh-lead{font-size:17px;line-height:1.65;color:rgba(61,46,30,.78);margin:20px 0 0;max-width:56ch}
.hh-lead b{color:#1A1208;font-weight:700}
.hh-zoek,.hh-hero #woningzoek{margin:26px 0 0;background:#fff;border:1px solid rgba(61,46,30,.12);border-radius:16px;padding:18px;
  box-shadow:0 6px 24px rgba(26,18,8,.06);max-width:600px}
.hh-zoek label{display:block;font-size:14.5px;font-weight:700;color:#1A1208;margin-bottom:9px}
.hh-zoek-rij{display:flex;gap:9px;flex-wrap:wrap}
.hh-zoek input{flex:1;min-width:190px;padding:13px 15px;border:1px solid rgba(61,46,30,.2);border-radius:11px;
  font-size:15px;font-family:inherit;color:#1A1208;background:#fff}
.hh-zoek input:focus{outline:2px solid rgba(61,90,62,.45);outline-offset:1px}
.hh-zoek button{background:#3D5A3E;color:#F5F0E8;border:0;padding:13px 22px;border-radius:11px;font-size:15px;
  font-weight:800;cursor:pointer;font-family:inherit}
.hh-zoek button:hover{background:#4E7350}
.hh-zoek #woningzoekHint{font-size:12.5px;color:rgba(61,46,30,.62);margin:10px 0 0;line-height:1.55}
.hh-zoek #woningzoekHint a{color:#3D5A3E;font-weight:700}
.hh-zijpad{margin:16px 0 0;font-size:13.5px;color:rgba(61,46,30,.62)}
.hh-zijpad a{color:#3D5A3E;font-weight:700;text-decoration:none}
.hh-hero-toneel{min-width:0}

/* ── het toneel ── */
.ht{border:1px solid rgba(61,46,30,.14);border-radius:16px;background:#FFFDF9;overflow:hidden;
  box-shadow:0 18px 50px rgba(26,18,8,.08);font-variant-numeric:tabular-nums}
.ht-doek{display:grid;grid-template-columns:minmax(0,1fr)}
.ht-doek .ht-tekenvlak{min-height:380px;border-right:0;border-bottom:1px solid rgba(61,46,30,.12)}
.ht-doek .ht-wat span{display:none}
.ht-doek .ht-rij{padding:7px 0}
.wf-doek{position:absolute;inset:0}.wf-doek canvas{display:block;width:100%!important;height:100%!important}
.ht-rij.aan{background:linear-gradient(90deg,rgba(184,92,56,.10),rgba(184,92,56,0));box-shadow:inset 3px 0 0 #B85C38}
.ht-stap:disabled{cursor:default}
.ht-tekenvlak{position:relative;border-right:1px solid rgba(61,46,30,.12);perspective:1000px;display:grid;
  place-items:center;padding:24px 16px;overflow:hidden;background:#F5F0E8}
.ht-raster{position:absolute;inset:0;
  background-image:radial-gradient(ellipse at 50% 46%,rgba(245,240,232,0) 36%,#F5F0E8 80%),
                   linear-gradient(rgba(61,46,30,.16) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(61,46,30,.16) 1px,transparent 1px);
  background-size:100% 100%,26px 26px,26px 26px}
.ht-plan{position:relative;width:min(300px,86%);aspect-ratio:1.28;
  transition:transform 1.2s cubic-bezier(.62,.02,.22,1);transform:rotateX(0) rotateZ(0)}
.ht-f2 .ht-plan,.ht-f3 .ht-plan,.ht-f4 .ht-plan,.ht-f5 .ht-plan{transform:rotateX(56deg) rotateZ(-43deg) scale(.96)}
.ht-plan{transform-style:preserve-3d}
.ht-plan svg{width:100%;height:100%;display:block;overflow:visible}
.ht-muren{position:absolute;inset:0;transform-style:preserve-3d;pointer-events:none}
.ht-m{position:absolute;height:30px;background:rgba(61,90,62,.26);border-bottom:1.5px solid #3D5A3E;
  transform-origin:0 0;transform:rotateZ(var(--a)) rotateX(90deg) scaleY(0);
  transition:transform .8s cubic-bezier(.2,.7,.2,1);transition-delay:calc(.5s + var(--n) * .05s)}
.ht-m.buiten{background:rgba(61,90,62,.12);border-bottom-color:rgba(61,90,62,.55)}
.ht-f2 .ht-m,.ht-f3 .ht-m,.ht-f4 .ht-m,.ht-f5 .ht-m{transform:rotateZ(var(--a)) rotateX(90deg) scaleY(1)}
.ht-muur{fill:none;stroke:#3D5A3E;stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
.ht-dun{fill:none;stroke:#3D5A3E;stroke-width:1.2;opacity:.55}
.ht-vlak{fill:#3D5A3E;opacity:0;transition:opacity .8s ease}
.ht-f2 .ht-vlak,.ht-f3 .ht-vlak,.ht-f4 .ht-vlak,.ht-f5 .ht-vlak{opacity:.075}
.ht-maat{font-family:'Space Mono',monospace;font-size:7px;fill:rgba(61,46,30,.5);letter-spacing:.08em}
.ht-deur{fill:none;stroke:#B85C38;stroke-width:3.2;stroke-linecap:round;opacity:0;transition:opacity .45s ease}
.ht-f2 .ht-deur,.ht-f3 .ht-deur,.ht-f4 .ht-deur,.ht-f5 .ht-deur{opacity:1}
.ht-stempel{position:absolute;z-index:1;left:16px;bottom:12px;font-family:'Space Mono',monospace;font-size:9px;
  letter-spacing:.12em;color:rgba(61,46,30,.45)}

.ht-staat{padding:20px 22px 18px;display:flex;flex-direction:column}
.ht-staatkop{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-bottom:8px;
  border-bottom:1.5px solid #1A1208}
.ht-staatkop .ht-kop{margin:0;font-size:13px;font-weight:700;letter-spacing:.01em;color:#1A1208}
.ht-staatkop span{font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(61,46,30,.5)}
.ht-rij{display:grid;grid-template-columns:58px minmax(0,1fr) auto;gap:12px;align-items:baseline;padding:9px 0;
  border-bottom:1px solid rgba(61,46,30,.12);opacity:.28;transform:translateY(4px);
  transition:opacity .5s ease,transform .5s ease,background .5s ease,box-shadow .5s ease;transition-delay:calc(var(--i) * .09s)}
.ht-f3 .ht-rij,.ht-f4 .ht-rij,.ht-f5 .ht-rij{opacity:1;transform:none}
.ht-hoeveel{font-family:'Space Mono',monospace;font-weight:700;font-size:15px;color:#B85C38;text-align:right;
  letter-spacing:-.02em}
.ht-hoeveel small{display:block;font-weight:400;font-size:8.5px;color:rgba(61,46,30,.5);letter-spacing:.08em;
  text-transform:uppercase;margin-top:1px}
.ht-wat b{display:block;font-size:14px;font-weight:700;letter-spacing:-.01em;color:#1A1208}
.ht-wat span{display:block;font-size:12px;color:rgba(61,46,30,.66);margin-top:1px;line-height:1.4}
.ht-merk{justify-self:end;text-align:right;opacity:0;transform:translateX(9px);
  transition:opacity .45s ease,transform .45s ease;transition-delay:calc(var(--i) * .08s)}
.ht-f4 .ht-merk,.ht-f5 .ht-merk{opacity:1;transform:none}
.ht-merk b{display:block;font-size:12px;font-weight:700;white-space:nowrap;color:#1A1208}
.ht-korting{display:inline-block;margin-top:3px;font-family:'Space Mono',monospace;font-size:10.5px;font-weight:700;
  color:#FFF6EE;background:#B85C38;padding:2px 7px;border-radius:4px;letter-spacing:.02em}
.ht-slot{margin-top:auto;padding-top:12px;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;
  opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s ease}
.ht-f5 .ht-slot{opacity:1;transform:none}
.ht-zegel{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.06em;background:#2B3F2C;color:#F5F0E8;
  padding:6px 11px;border-radius:4px}
.ht-slot p{margin:0;font-size:12px;color:rgba(61,46,30,.66);line-height:1.5;max-width:36ch}

.ht-rail{display:grid;grid-template-columns:repeat(6,1fr);gap:1px;background:rgba(61,46,30,.12);
  border-top:1px solid rgba(61,46,30,.12)}
.ht-stap{background:#FFFDF9;border:0;padding:10px 11px;text-align:left;cursor:pointer;font:inherit;
  color:rgba(61,46,30,.6);transition:background .25s,color .25s;border-top:2px solid transparent}
.ht-stap:hover{background:#F5F0E8}
.ht-stap[aria-selected="true"]{color:#1A1208;border-top-color:#B85C38;background:#F5F0E8}
.ht-stap em{display:block;font-family:'Space Mono',monospace;font-size:8.5px;font-style:normal;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(61,46,30,.45);margin-bottom:2px}
.ht-stap b{display:block;font-size:12px;font-weight:700;letter-spacing:-.01em}

/* ── 2. de keten ── */
.hh-keten{background:#fff;padding:80px 0}
.hh-stappen{list-style:none;margin:40px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;
  position:relative}
.hh-stappen::before{content:"";position:absolute;left:0;right:0;top:9px;height:2px;background:rgba(61,46,30,.14)}
.hh-stappen li{position:relative;padding-top:28px}
.hh-stappen li::before{content:"";position:absolute;left:0;top:3px;width:14px;height:14px;border-radius:50%;
  background:#F5F0E8;border:3px solid #3D5A3E}
.hh-stappen li:last-child::before{background:#3D5A3E}
.hh-tijd{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(61,46,30,.55);display:block;margin-bottom:8px}
.hh-stappen h3{font-size:1.45rem;font-weight:800;letter-spacing:-.025em;color:#1A1208;margin:0 0 8px}
.hh-stappen p{font-size:14.5px;line-height:1.6;color:rgba(61,46,30,.74);margin:0 0 12px}
.hh-stappen a{font-size:14px;font-weight:800;color:#3D5A3E;text-decoration:none}
.hh-stappen a:hover{text-decoration:underline}

/* ── 3. configurator ── */
.hh-conf{background:#fff;padding:0 0 80px}

/* ── 4. merken ── */
.hh-merken{background:#F5F0E8;padding:80px 0}
.hh-merkraster{list-style:none;margin:36px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.hh-merkraster li{background:#fff;border:1px solid rgba(61,46,30,.12);border-radius:14px;padding:16px 18px;
  display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"cat cat" "naam voordeel";gap:2px 10px;
  align-items:end}
.hh-cat{grid-area:cat;font-family:'Space Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(61,46,30,.5);margin-bottom:6px}
.hh-merkraster b{grid-area:naam;font-size:15px;font-weight:800;letter-spacing:-.015em;color:#1A1208;line-height:1.2}
.hh-voordeel{grid-area:voordeel;font-family:'Space Mono',monospace;font-size:13px;font-weight:700;color:#FFF6EE;
  background:#B85C38;padding:4px 9px;border-radius:6px;white-space:nowrap}

/* ── 4b. productfoto's en logo's ── */
.hh-fotos{list-style:none;margin:36px 0 0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.hh-fotos a{display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid rgba(61,46,30,.12);border-radius:14px;
  overflow:hidden;text-decoration:none;color:inherit;transition:border-color .2s,box-shadow .2s}
.hh-fotos a:hover{border-color:rgba(61,90,62,.45);box-shadow:0 12px 36px rgba(61,46,30,.1)}
.hh-fotos img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;height:auto}
.hh-foto-merk{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#3D5A3E;
  font-weight:700;margin:14px 16px 4px}
.hh-fotos b{font-size:15px;font-weight:800;letter-spacing:-.015em;color:#1A1208;margin:0 16px}
.hh-fotos p{font-size:13px;line-height:1.55;color:rgba(61,46,30,.72);margin:6px 16px 0;flex:1}
.hh-foto-cta{font-size:13px;font-weight:700;color:#3D5A3E;margin:10px 16px 16px}
.hh-logo img{display:block;max-width:100%;width:auto;object-fit:contain}
.hh-merkraster{margin-top:12px}

/* ── 6. demo ── */
.hh-demo{background:#EDE6D8;padding-top:64px}
.hh-demo .hh-huis{max-width:520px;margin:0 auto -30px}
.hh-demo .hh-huis svg{width:100%;height:auto;display:block}
.hh-demo > div:last-child section{padding-top:24px!important}

/* ── 7. na de sleutel ── */
.hh-na{background:#1A1208;color:#F5F0E8;padding:84px 0}
.hh-na .hh-oog{color:#E8A87C}
.hh-na .hh-kop h2{color:#F5F0E8;max-width:26ch}
.hh-na .hh-sub{color:rgba(245,240,232,.72)}
.hh-na-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:44px}
.hh-na-grid > div{border-top:2px solid rgba(245,240,232,.25);padding-top:18px}
.hh-na-grid h3{font-size:1.25rem;font-weight:800;letter-spacing:-.02em;margin:0 0 8px;color:#F5F0E8}
.hh-na-grid p{font-size:14.5px;line-height:1.6;color:rgba(245,240,232,.7);margin:0 0 14px}
.hh-na-grid ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.hh-na-grid a{color:#F5F0E8;font-size:14px;font-weight:600;text-decoration:none;border-bottom:1px solid rgba(245,240,232,.3)}
.hh-na-grid a:hover{border-bottom-color:#E8A87C;color:#E8A87C}

/* ── 8. vragen ── */
.hh-faq{background:#F5F0E8;padding:72px 0}
.hh-vragen{margin:28px 0 0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 40px}
.hh-vragen div{border-top:1.5px solid #1A1208;padding-top:14px}
.hh-vragen dt{font-size:17px;font-weight:800;letter-spacing:-.015em;color:#1A1208;margin:0 0 6px}
.hh-vragen dd{margin:0;font-size:14.5px;line-height:1.65;color:rgba(61,46,30,.74);max-width:60ch}

@media(max-width:1000px){
  .hh-hero-grid{grid-template-columns:1fr;gap:36px}
  .hh-stappen{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hh-stappen::before{display:none}
  .hh-merkraster{grid-template-columns:repeat(3,minmax(0,1fr))}
  .hh-fotos{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hh-na-grid{grid-template-columns:1fr;gap:22px}
  .hh-vragen{grid-template-columns:1fr}
}
@media(max-width:720px){
  .hh-wrap{padding:0 18px}
  .hh-hero{padding:32px 0 48px}
  .hh-hero-copy h1{font-size:2.1rem}
  .hh-lead{font-size:15.5px}
  .hh-zoek,.hh-hero #woningzoek{padding:14px;margin-top:22px}
  .hh-zoek button{width:100%}
  .hh-keten,.hh-merken,.hh-na{padding:56px 0}
  .hh-stappen{grid-template-columns:1fr;gap:22px;margin-top:28px}
  .hh-stappen li{padding-top:0;padding-left:26px}
  .hh-stappen li::before{left:0;top:6px}
  .hh-merkraster{grid-template-columns:1fr 1fr;gap:9px}
  .hh-fotos{gap:9px;margin-top:26px}
  .hh-fotos p{display:none}
  .hh-fotos b{font-size:13.5px}
  .hh-merkraster li{padding:12px 13px}
  .hh-merkraster b{font-size:13.5px}
  .hh-voordeel{font-size:11.5px}
  .hh-demo .hh-huis{margin-bottom:-10px}
  .ht-doek{grid-template-columns:1fr;min-height:0}
  .ht-doek .ht-tekenvlak{min-height:320px}
  .ht-plan{width:min(240px,80%)}
  .ht-staat{padding:16px 14px 14px}
  .ht-rij{grid-template-columns:56px minmax(0,1fr) auto;gap:9px}
  .ht-hoeveel small{font-size:7.5px;letter-spacing:.04em}
  .ht-wat span{display:none}
  .ht-rail{grid-template-columns:repeat(3,1fr)}
  .ht-stap{padding:8px 6px}
  .ht-stap em{display:none}
  .ht-stap b{font-size:10.5px}
}
@media (prefers-reduced-motion:reduce){
  .ht-plan,.ht-vlak,.ht-rij,.ht-merk,.ht-slot,.ht-deur,.ht-m{transition-duration:.01ms!important}
}
`
