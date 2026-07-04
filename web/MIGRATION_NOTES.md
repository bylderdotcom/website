# Migratie-notities — Fase 1 deel B (marketing-pagina's → Next-routes)

Branch: `next-migration` · niet gepusht, niet gedeployed. Elke pagina is een
aparte commit. Na elke pagina: `web/build.sh` + `python3 scripts/check_site_invariants.py web/out`
→ **0 overtredingen gehouden** op ~75,6k pagina's. Niet-gemigreerde pagina's
(incl. de homepage) zijn geverifieerd **byte-identiek** gebleven.

## Wat is geport (5 pagina's, klaar)

| Route | Bron | Bijzonderheden | Commit |
|---|---|---|---|
| `/eerlijke-prijzen/` | `eerlijke-prijzen/index.html` | 8 prijs-tegels, FAQ, 3× JSON-LD (FAQPage/Breadcrumb/Article). Disclaimer uit pagina-eigen mini-footer behouden in de body. | `732df76` |
| `/3d-sfeerimpressie/` | `3d-sfeerimpressie/index.html` | 4 tile-grids (stijlen/ruimtes/woningtypes/gidsen), sticky aside, 4× JSON-LD, `/auping-popup.js` behouden. | `a8d3326` |
| `/vouchers/` | `vouchers/index.html` | 18 merk-tegels (3 secties), FAQ-accordion als `'use client'`, Phosphor-iconen, `/auping-popup.js`. | `70af264` |
| `/functies/` | `functies/index.html` | Woningtype-toggle + `#hash`-preselectie in `FunctiesClient` (`'use client'`), 25 functie-kaarten. | `87d8210` |
| `/kortingscode/` | `kortingscode/index.html` | Data-hub: 522 merk-tegels / 35 categorieën, byte-getrouw via `dangerouslySetInnerHTML` (`mainHtml.ts`). | `0b885cd` |

### Aanpak-principes (consistent toegepast)
- **Chrome uit de gedeelde layout.** De oude in-page nav én de pagina-eigen
  footers vervallen bewust — dat is de Fase-1-winst (menu op één plek, canonieke
  IA: Kortingscodes · Functies · Voor wie? ▾ · Prijzen). Waar een pagina-eigen
  footer unieke tekst had (bv. de prijs-disclaimer op `/eerlijke-prijzen/`) is die
  tekst als content in de body behouden; verder waren het enkel nav-links die de
  gedeelde Footer al bevat.
- **Meta getrouw.** title/description/canonical/og/twitter/robots + alle JSON-LD
  1-op-1 overgenomen. JSON-LD is een harde invariant en blijft groen.
- **Interactieve JS → kleine `'use client'`.** FAQ-accordion (vouchers) en de
  woningtype-toggle + hash-preselect (functies) zijn geverifieerd in de preview.
- **`/auping-popup.js` per pagina.** Zit alleen op de pagina's die 'm in de bron
  hadden (3d + vouchers), niet op de andere — bewuste marketingkeuze in de bron,
  getrouw gevolgd. Geverifieerd: de popup vuurt op /vouchers/.
- **`kortingscode` via `dangerouslySetInnerHTML`.** Bewuste keuze: 522 merknamen/
  slugs met de hand overtypen is merk-gevoelig én linkrisico. De body gebruikt
  alleen eigen classes (`container`/`grid-cards`/`brandcard`) — géén Tailwind — dus
  de Tailwind-CDN uit de bron was niet nodig. Geen eigen JS op die hub.

## Al opgelost ná de 5 ports (commit `0423f1b`)

- **✅ Fonts (Plus Jakarta Sans + Space Mono) + `gtag` in de gedeelde layout.**
  Fonts via Google Fonts (weight-superset van alle losse pagina's), `gtag` via
  `next/script` (afterInteractive). Body-font is nu Plus Jakarta Sans i.p.v.
  system-ui → alle 6 Next-routes hebben dezelfde typografie als de live-site en de
  analytics valt niet meer weg. Geverifieerd in preview: beide webfonts laden echt,
  `window.gtag` actief, invarianten 0, niet-gemigreerde pagina's byte-identiek.

## Voor de ochtend visueel nakijken (functioneel groen, maar oog erop)

1. **Top-witruimte (sticky vs. fixed nav).** De bronpagina's rekenden op een
   `position:fixed` nav en compenseerden met veel `padding-top` (bv. hero
   `120px`, kortingscode-breadcrumb `72px`). De gedeelde Nav is `sticky` (neemt
   eigen ruimte). Getrouw overgenomen → iets extra witruimte bovenaan. Cosmetisch;
   even bekijken of het strak genoeg oogt, evt. paddings licht bijstellen.
2. **Icoon-strategie.** vouchers/functies laden de Phosphor-iconfonts van unpkg
   (zoals de bron). Standing order wil op termijn lijn-iconen via een gedeelde
   `icons`-component (Fase 4) i.p.v. externe iconfont — nu getrouw gelaten.
3. **Snelle klik-ronde** op desktop-breedte (preview-viewport was smal, dus de Nav
   toonde de mobiele burger): dropdown "Voor wie? ▾", vouchers-FAQ, functies-toggle.

## Overgeslagen — bewust, met reden

**HOMEPAGE (`/`) — NIET geport.** Conform de opdracht (homepage alleen als 1–5
schoon zijn én getrouwe onbewaakte reproductie niet te risicovol is; anders
overslaan i.p.v. half doen).

Waarom te risicovol voor een onbewaakte sessie:
- **2173 regels / 187 KB, 13 `<script>`-blokken** met custom **Typewriter**,
  **modals**, **keuze-knoppen**, **2 marquees**, `localStorage`, dropdown — elk
  moet naar zorgvuldige `'use client'`-logica. De `dangerouslySetInnerHTML`-truc
  die `kortingscode` redde werkt hier niet: geïnjecteerde `<script>`s draaien niet
  en de interactie moet echt herbedraad worden.
- **Twee iconensets tegelijk** (Font Awesome **én** Phosphor) + **zware
  Tailwind-CDN**-afhankelijkheid door de hele markup (niet nav-only zoals bij
  kortingscode).
- **Merk-kritische voordeur**, recent nog volop iteratief gewijzigd (storytelling
  fase 1–3, klantcijfer-consistentie, 3D+vouchers-herordening). Subtiele breuk hier
  = direct merkschade en niet vangbaar door de invarianten-checker (die controleert
  geen animaties/interactie/visuele pariteit).

Aanbevolen vervolg (bewaakte sessie, sterkste model + menselijke visuele QA):
1. Homepage opdelen in secties; statische secties als server-component, elk
   interactief blok als eigen `'use client'`-component (Typewriter, modals,
   keuze-knoppen, marquees).
2. Tailwind niet via runtime-CDN maar echte Tailwind in de build óf de utilities
   naar inline/CSS omzetten; iconen consolideren.
3. Naast invarianten: expliciete visuele diff + interactie-checklist vóór merge.

## Repo-status / losse eindjes
- Werkboom-wijzigingen die **niet** van deze taak zijn (stonden al bij sessiestart):
  `.claude/launch.json` (M), `reports/site-invariants.json` (M, wordt door elke
  invarianten-run overschreven — nu wijst 'ie naar `web/out`), `CLAUDE.md` (??),
  `supabase/` (??). Bewust ongemoeid gelaten.
- Richting echte deploy nog te regelen (Fase 1/2-overgang, buiten deze taak):
  `api/`-routing + Vercel output-config die `web/out` serveert.
