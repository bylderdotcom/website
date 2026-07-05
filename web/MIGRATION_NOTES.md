# Migratie-notities — Fase 1 deel B + Fase 2 (marketing-pagina's + clusters → Next)

**✅ 2026-07-05: `next-migration` gemerged (fast-forward) naar `main` en
gepusht naar `origin/main` (commit `34d087d795f`).**

**⚠️ Eerste deploy-poging faalde: Vercel gaf `Command "bash web/build.sh" exited
with 127`.** Oorzaak: `rsync` (gebruikt in de overlay-stap van `build.sh`) is
niet gegarandeerd aanwezig in Vercel's build-containers — bevestigd bekend
probleem, ontbrak hier ook. **Gefixt (commit `1500c8a8`):** rsync vervangen
door `cp -a -n` (standaard coreutils, wel overal aanwezig) met een
top-level-exclude-loop i.p.v. rsync's `--exclude`-patronen. Onderweg ook nog
gevonden: `cp -n` geeft (anders dan rsync `--ignore-existing`) exit 1 zodra
het een al-bestaand bestand overslaat — met `set -e` brak dat het script
direct af; opgevangen met `|| true`. Geverifieerd lokaal met de exacte
install/build-commando's zoals `vercel.json` ze aanroept: omvang ongewijzigd
(4,0GB), `api/` correct afwezig, niet-geport cluster (schilder, 5761
bestanden) correct overlaid, geporte clusters blijven Next-gerenderd,
invarianten 0 overtredingen. Zie ook het geheugenbestand
`bug-nextjs-static-export-rsc-txt-bloat.md` (Claude-geheugen, niet in deze
repo) voor de bredere les over Vercel-build-images.

**Nog steeds niet vanuit deze sessie te volgen/bevestigen** (geen Vercel-
dashboardtoegang): of de HERSTELDE deploy nu wél slaagt. Controleer
handmatig: Vercel-dashboard → Deployments (bouwt 'ie, en slaagt de build
binnen de 45-min-limiet?) en spend/billing (status quo t.o.v. de eerder
genoteerde spend-limit-waarschuwing). Bezoek ook een paar live pagina's
(homepage, een `/kopen/.../` en `/loodgieter/.../`-pagina) om te bevestigen
dat de nieuwe build daadwerkelijk live staat en dat de `/api/`-betaalroutes
(Stripe/PayNL) nog werken.

Vóór de merge: elke pagina/cluster was een aparte commit. Na elke stap:
`web/build.sh` + `python3 scripts/check_site_invariants.py web/out` →
**0 overtredingen** op de volledige site. Niet-gemigreerde pagina's zijn
telkens geverifieerd **byte-identiek** gebleven.

**Status vóór deploy: alle 6 marketing-pagina's (incl. homepage) + 5
data-gedreven clusters (bouwvergunning/project/kopen/gietvloer/loodgieter,
~45k pagina's) geport.** Fonts + gtag + top-witruimte centraal geregeld.
Vercel-build-config (`vercel.json`) ingericht: `web/build.sh` als
buildCommand, `web/out` als outputDirectory, bestaande 36 redirects/2
rewrites/1 headers-blok behouden, `api/`-functiedetectie blijft
root-gebaseerd (nu ook niet meer per ongeluk gedupliceerd als statisch
bestand). Deploy-omvang geoptimaliseerd: 9,9GB → 4,0GB door Next's
ongebruikte RSC-prefetch-`.txt`-bestanden op te ruimen (geen enkele geporte
pagina gebruikt `next/link`, dus die bestanden werden nooit opgevraagd).

## Wat is geport (6 pagina's, klaar)

| Route | Bron | Bijzonderheden | Commit |
|---|---|---|---|
| `/eerlijke-prijzen/` | `eerlijke-prijzen/index.html` | 8 prijs-tegels, FAQ, 3× JSON-LD (FAQPage/Breadcrumb/Article). Disclaimer uit pagina-eigen mini-footer behouden in de body. | `732df76` |
| `/3d-sfeerimpressie/` | `3d-sfeerimpressie/index.html` | 4 tile-grids (stijlen/ruimtes/woningtypes/gidsen), sticky aside, 4× JSON-LD, `/auping-popup.js` behouden. | `a8d3326` |
| `/vouchers/` | `vouchers/index.html` | 18 merk-tegels (3 secties), FAQ-accordion als `'use client'`, Phosphor-iconen, `/auping-popup.js`. | `70af264` |
| `/functies/` | `functies/index.html` | Woningtype-toggle + `#hash`-preselectie in `FunctiesClient` (`'use client'`), 25 functie-kaarten. | `87d8210` |
| `/kortingscode/` | `kortingscode/index.html` | Data-hub: 522 merk-tegels / 35 categorieën, byte-getrouw via `dangerouslySetInnerHTML` (`mainHtml.ts`). | `0b885cd` |
| `/` (homepage) | `index.html` | Zwaarste: 2173 regels, 13 scripts. Body byte-getrouw via `dangerouslySetInnerHTML` (`homeHtml.ts`); inline scripts herbedraad in `HomeClient` useEffect (typewriter, woningtype-toggle, keuze-knoppen, hpCalc, auping-popup). Tailwind via Play-CDN + merk-config; FA + Phosphor icon-fonts; 3× JSON-LD; hreflang nl/en/x-default. | `e69ab77` |

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

## Al opgelost ná de eerste 5 ports

- **✅ Fonts (Plus Jakarta Sans + Space Mono) + `gtag` in de gedeelde layout**
  (`0423f1b`). Body-font nu Plus Jakarta Sans i.p.v. system-ui → alle Next-routes
  hebben dezelfde typografie als de live-site en de analytics valt niet meer weg.
  Geverifieerd: webfonts laden echt, `window.gtag` actief.
- **✅ Homepage (`/`) geport** (`e69ab77`) — zie tabel hierboven. Was eerder bewust
  overgeslagen als té risicovol voor een *onbewaakte* sessie; met de gebruiker erbij
  (expliciet groen licht) alsnog gedaan mét zware preview-verificatie als QA:
  Tailwind stijlt (Play-CDN + merk-config, 14 kleuren), typewriter animeert + cycelt,
  keuze-knoppen / woningtype-toggle / hpCalc-calculator (€400k → depot €20.000,
  totaal €456.000) werken, auping-popup vuurt na 4s + sluit (backdrop + swipe), geen
  console-errors. Aanpak = body byte-getrouw injecteren + inline scripts herbedraad in
  één `HomeClient` useEffect (globale onclick-functies op `window`).
- **✅ Top-witruimte bijgesteld** (`1098477`) — de bron rekende op een `position:fixed`
  nav (~64px) en padde de top fors; de gedeelde Nav is `sticky` (neemt eigen ruimte).
  Paddings met ~nav-hoogte verlaagd zodat de gap de live-site matcht: vouchers/functies
  hero 120→56px, kortingscode-breadcrumb 72→8px. Gemeten in preview (gap nav→h1 nu 51–77px).
- **✅ Desktop-klikronde** — op 1280px geverifieerd: nav-dropdown "Voor wie? ▾" opent
  met 3 items, vouchers-FAQ toggelt, functies-woningtype-toggle wisselt.

## Fase 2 — data-gedreven clusters (gestart)

**✅ `/bouwvergunning/` (25 pagina's) geport** (`96f84f7`) — eerste data-gedreven
pagina-type. De renderlaag migreert, de datalaag blijft: `web/lib/bouwvergunning.ts`
leest op build-time de canonieke bron (`data/clusters/bouwvergunning/pages.json` +
content-fragmenten + gedeelde `templates/clusters/.../`-CSS + aside-varianten) en
resolvet per pagina de `<main>` (content + `{{aside}}`) net als de Python
`render_page`. Route = `page.tsx` (index) + `[slug]/page.tsx` (24,
`generateStaticParams`). Metadata uit pages.json (entities gedecodeerd → geen
dubbel-encoding), JSON-LD 1-op-1. Geverifieerd: 25/25 Next-gerenderd, aside
project+thema resolven, geen console-errors, invarianten 0.

> NB: bouwvergunning wordt nu Next-gerenderd i.p.v. `generate_cluster.py`; die
> byte-pariteit-check is voor dít cluster niet meer representatief (Python-
> renderlaag verdwijnt sowieso in Fase 3).

**✅ `/project/` (5.641 pagina's) geport** (`16fb9d6`) — grootste port tot nu toe
en de eerste met **vakstad-templating** (projecttype × gemeente). `web/lib/project.ts`
leest `pages.json` (metadata) + `vaksteden.json` (stad/provincie per pagina) + de
gedeelde `content.vakstad.<type>.<variant>.html`-templates en vult per pagina
`{{city}}/{{city_slug}}/{{prov}}/{{prov_slug}}` in (net als Python
`render_vakstad_content`). Hubs laden hun self-contained fragment; per-pagina
head-`<style>` via het shell-veld (default/v2/v3). Route = één optionele catch-all
`[[...slug]]` voor index + hub + vakstad. Geverifieerd: 5.641/5.641 Next, 0 onvervulde
placeholders, city+provincie correct, invarianten 0, build ~7s. Dit patroon
bleek direct herbruikbaar voor het grootste cluster:

**✅ `/kopen/` (33.014 pagina's, grootste cluster van de site) geport** (`4141e09`)
— directe clone van `web/lib/project.ts` naar `web/lib/kopen.ts`, met twee
verschillen: slug is 3 niveaus diep (categorie/subcategorie/gemeente i.p.v.
type/gemeente) en hub-content-fragmenten gebruiken `__` i.p.v. `/` in de
bestandsnaam (`binnendeuren__glazen-binnendeur.html`). 4 shell-varianten
(default/v2/v3/v4) i.p.v. 3. Route = dezelfde optionele-catch-all-vorm als
project. Geverifieerd: 33.014/33.014 Next, 0 onvervulde placeholders (steekproef
500), depth-3 breadcrumb + stad/provincie correct, alle hub-shell-varianten eigen
CSS, invarianten 0. **Samen met bouwvergunning + project: 38.689 Next-pagina's,
build ~2:51.**

**✅ `/gietvloer/` (657 pagina's) geport** (`eeb68d7`) — de **eerste city+bedrijf-
cluster**, een nieuwe render-vorm t.o.v. vakstad. `web/lib/gietvloer.ts` leest
`pages.json` (content_kind city/bedrijf/hub) + `cities.json` (per stad: bedrijvenlijst
+ card-vorm rated/unrated) + `bedrijven.json` (per bedrijf: naam/stad/rating/contact
+ siblings-tegels). Card/rij-templates (rating_row/contact_row, meerdere varianten)
1-op-1 overgenomen; velden alleen ingevuld als de bron ze levert. Twee inline
`<script>`-blokken (kostencalculator + sorteer-dropdown) herbedraad in
`InteractiveScripts.tsx` (`'use client'`, één `useEffect`). De unieke E-E-A-T-
disclaimer uit de oude cluster-footer is behouden als contentregel op city/bedrijf-
pagina's. Geverifieerd: 657/657 Next, 0 placeholders, calculator rekent correct
(30m² epoxy → €1.500–2.700), sorteer-dropdown werkt, bedrijfsprofiel + sibling-tegel
correct, invarianten 0.

### Cluster-landschap (roadmap voor de rest van Fase 2)
Drie vormen, **alle drie nu bewezen**: simpel (bouwvergunning), vakstad (project,
kopen), city+bedrijf (gietvloer). Sortering op **geïndexeerde** pagina's (= live
SEO-waarde):

| Cluster | Pagina's | Geïndexeerd | Vorm | Status |
|---|---|---|---|---|
| bouwvergunning | 25 | 25 | simpel (1 frag/pagina) | ✅ |
| project | 5.641 | 5.641 | vakstad (type × gemeente) | ✅ |
| kopen | 33.014 | 33.014 | vakstad (cat × subcat × gemeente, depth 3) | ✅ |
| gietvloer | 657 | 479 | city + bedrijf | ✅ |
| loodgieter | 5.391 | 3.516 | **city + bedrijf** | ✅ |
| aannemer | 4.717 | 2.682 | city + bedrijf | ⭐ volgende — clone van loodgieter/gietvloer |
| schilder | 5.761 | 2.553 | city + bedrijf | open |
| elektricien | 3.886 | 2.428 | city + bedrijf | open |
| badkamer | 2.359 | 1.978 | city + bedrijf | open |
| stukadoor | 3.389 | 1.499 | city + bedrijf | open |
| dakkapel | 1.700 | 1.214 | city + bedrijf | open |
| kortingscode (subpagina's) | 523 | 523 | simpel 1:1 (hub al apart geport) | open |
| offerte-check / renovatiekosten / aannemer-matching | ~2.257 / 2.821 | **~0% (noindex-gated)** | vakstad, dun | later (weinig SEO-waarde nu) |

**✅ `/loodgieter/` (5.391 pagina's) geport** (`799ff1b`) — clone van
`web/lib/gietvloer.ts`, twee bevestigde aandachtspunten: kaarten gebruiken overal
`{{maps_cid_href}}` (maps.google.com/?cid=…) i.p.v. `{{maps_href}}`, en 2 extra
card-vormen (v3 = geen Maps-link, v4 = met prijsniveau-badge "€€") — beide velden
generiek doorgegeven, alleen ingevuld wat de bron levert. De prijsindicatie-
calculator heeft een andere vorm (vaste prijs per klus, geen m²-invoer, berekent al
bij laden) → aparte `InteractiveScripts.tsx`; de sorteer-dropdown-logica is
byte-identiek aan gietvloer en hergebruikt. Disclaimer-tekst aangepast per cluster
("geen loodgietersbedrijf"). Geverifieerd: 5.391/5.391 Next, 0 placeholders
(steekproef 300), v4-kaart (rating+prijsniveau+maps_cid_href) correct, calculator
correct bij laden én wijziging, invarianten 0.

**Volgende:** de resterende 6 city+bedrijf-clusters (aannemer/schilder/elektricien/
badkamer/stukadoor/dakkapel) zijn **mechanisch te clonen** van `gietvloer.ts` of
`loodgieter.ts` — dezelfde soort overgang als project→kopen. Checklist per cluster
(uit de gietvloer→loodgieter-ervaring): (1) `city_alt`/`name_alt` (alternatieve
spelling) — nog geen van beide gezien, maar blijf checken (`replace_spellings` in
`generate_cluster.py`); (2) `maps_href` vs `maps_cid_href` — verschilt per cluster,
geef beide generiek door; (3) extra card-/tile-vormen naast rated/unrated (loodgieter
had v3/v4) — `card.${shape}.html` leest ze automatisch, alleen typen als `string`
i.p.v. vaste union; (4) de exacte inline-scripts (calculator-vorm + sorteer-dropdown)
kunnen per cluster verschillen (gietvloer rekende per m², loodgieter per vaste klus)
— altijd het content.city-fragment nalezen vóór je `InteractiveScripts` kopieert;
(5) de exacte disclaimer-tekst per cluster-footer. Begin met `aannemer` (grootste
geïndexeerd van de resterende 6, 2.682).

`web/lib/bouwvergunning.ts` (simpel), `web/lib/project.ts`/`kopen.ts` (vakstad),
`web/lib/gietvloer.ts`/`loodgieter.ts` (city+bedrijf, 2 voorbeelden) zijn nu de
blauwdrukken. Generaliseren naar één `cluster.ts`-fabriek per vorm kan vanaf hier
overwogen worden — na 2 city+bedrijf-clusters is het variatiepatroon (maps-veld,
card-vormen, calculator-vorm) bekend genoeg om te weten wat generiek kan en wat
per cluster blijft verschillen.

## Nog voor later (bewust niet nu)

- **Icoon-strategie.** vouchers/functies/homepage laden Phosphor (+ homepage ook
  Font Awesome) van CDN, zoals de bron. Standing order wil op termijn lijn-iconen via
  een gedeelde `icons`-component (Fase 4) i.p.v. externe iconfonts — nu getrouw gelaten.
- **Tailwind runtime-CDN op de homepage.** De homepage-body leunt op de Tailwind
  Play-CDN (runtime JIT), net als de bron. Werkt, maar geeft een korte FOUC vóór de
  CDN geladen is en is niet ideaal voor productie. Fase 4: echte Tailwind in de build
  (of utilities → CSS) zodat de styling in de statische output zit i.p.v. runtime.
- **Homepage-min-h-screen hero.** De hero is een volle-hoogte, verticaal-gecentreerde
  hero (`min-h-screen` + flex) — bewust byte-getrouw gelaten. Fijn-tunen van die
  hoogte t.o.v. de sticky nav kan mee in de Fase-4 design-systeem-slag.

## Repo-status / losse eindjes
- Werkboom-wijzigingen die **niet** van deze taak zijn (stonden al bij sessiestart):
  `.claude/launch.json` (M), `reports/site-invariants.json` (M, wordt door elke
  invarianten-run overschreven — nu wijst 'ie naar `web/out`), `CLAUDE.md` (??),
  `supabase/` (??). Bewust ongemoeid gelaten.
- Richting echte deploy nog te regelen (Fase 1/2-overgang, buiten deze taak):
  `api/`-routing + Vercel output-config die `web/out` serveert.
