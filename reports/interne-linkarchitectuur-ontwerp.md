# Interne-linkarchitectuur — meting + ontwerp (7 jul 2026)

Aanleiding: GSC Coverage-export 6 jul: 35.940 pagina's "Gevonden — momenteel niet
geïndexeerd" (bekend bij Google, nooit gecrawld). Grootste resterende hefboom na de
kortingscode-snoei/verrijking. Dit document = de analyse + het uitvoeringsontwerp.
Meetinstrument: `scripts/check_link_reachability.py` (BFS vanaf de homepage over de
echte interne linkgraaf in `web/out`; herhaalbaar na elke wijziging).

## Meting (nulmeting 7 jul, web/out = 75.577 pagina's)

**64.484 bereikbaar (85,3%) — 11.093 pagina's onbereikbaar via interne links.**

| bevinding | omvang | oorzaak |
|---|---|---|
| Drie complete clusters onbereikbaar, incl. hun hubs: loodgieter (5.391), dakkapel (1.700), gietvloer (657) | **7.748** | De footer-kolom "Vakmannen" wijst naar `/aannemer-matching/*` (noindex-cluster) i.p.v. de echte bedrijvengidsen. Nergens op de site staat een link naar deze drie hubs. |
| Wees-bedrijfsprofielen in de 5 wél bereikbare city+bedrijf-clusters (stukadoor 630, schilder 617, aannemer 603, elektricien 551, badkamer 364) | **~2.765** | Bedrijven in plaatsen zónder stadspagina (te weinig bedrijven voor een eigen stad). Wel in sitemap, 0 inkomende links. Zelfde patroon zit óók in de 3 onbereikbare clusters. |
| Heel `/en-us/` onbereikbaar vanaf NL-root | 380 | Geen enkele NL-pagina linkt het VS-cluster; alleen en-us-sitemap. |
| `nieuwbouw/`-wezen | 98 | (Deels) verouderde typo-duplicaten naast de correcte slug (bv. `drenthe/nordenveld` naast `drenthe/noordenveld`). Duplicate-content-lek, geen link-probleem. |
| `nieuwbouw-gids/`-wezen | 26 | Artikelen die op geen enkele hub/fase-pagina gelinkt staan (o.a. `meerwerk-nieuwbouw-complete-gids-2026`). |
| Legacy/junk: `bylder-seo-v3/v4/v5` (31), `badkamer-renoveren`, `keuken-renoveren`, `tuin-aanleggen`, `vve-appartement` (26), `blog` (4), losse AI-landingspagina's, `voucher`, `cep-kaart` | ~76 | Oude experimenten die nog gedeployed worden. Enkele staan in sitemap.xml én op index (blog, badkamer-renoveren, keuken-renoveren); bylder-seo-v4 heeft canonicals naar niet-bestaande root-URL's. Zelfde klasse als het eerder verwijderde `output/`. |

**Diepte (bereikbaar deel):** bedrijfsprofielen zitten op klikdiepte 5–6.
`kopen` (33.014) is volledig gelinkt op diepte 3–4 via zijn eigen hub-tussenlagen —
structureel gezond, geen ingreep nodig; daar is crawl-budget/autoriteit de bottleneck.

## Ontwerp

### Fase 1 — Footer-fix (grootste effect, kleinste ingreep)
`web/app/components/Footer.tsx` (gedeelde Next-footer): de "Vakmannen"-kolom laten
wijzen naar de 8 city+bedrijf-hubs: `/loodgieter/`, `/elektricien/`, `/schilder/`,
`/aannemer/`, `/badkamer/`, `/stukadoor/`, `/dakkapel/`, `/gietvloer/` (i.p.v.
aannemer-matching/renovatiekosten/offerte-check, die noindex zijn — links daarheen
lekken crawl-budget). Effect: alle 8 hubs op diepte 1 vanaf elke Next-pagina, steden
diepte 2, bedrijven diepte 3 (was 5–6 of onbereikbaar). Ontsluit in één klap 7.748
pagina's. Legacy-pagina's hebben oude ingebakken footers; die volgen vanzelf naarmate
clusters porten — de homepage (Next) alleen al zet de hubs op diepte 1.

### Fase 2 — Wees-bedrijven ontsluiten (UITGEVOERD, 8 jul, commit volgt) ✅
Per city+bedrijf-cluster een "register"-laag: pagina's per beginletter
(`/<cluster>/register/<a-z>/`, plus `/overig/` voor niet-alfabetische namen) die
álle bedrijfsprofielen linken, gelinkt vanaf de cluster-hub ("Alle bedrijven A–Z").
Op `noindex,follow`: crawlpad, geen zoekresultaat-kandidaat — geen indexvervuiling,
wel linkwaarde-doorgifte.

**Gebouwd als puur Next-side navigatieconstruct** (niet in de Python-datalaag/
pages.json): elke `web/lib/<cluster>.ts` genereert de registerpagina's zelf uit
`bedrijven.json` (`buildRegisterPages()`), toegevoegd aan `getPages()` — bestaat dus
niet in de legacy site en heeft geen content-bron nodig. Consistent doorgevoerd op
alle 8 clusters (gietvloer/loodgieter/aannemer/schilder/elektricien/badkamer/
stukadoor/dakkapel), 25-27 letterpagina's per cluster.

**Bijvangst-bugfix:** `parseRobots()` in alle 8 lib's liet `noindex` altijd ook
`nofollow` meeslepen, ook als de bron alleen `noindex,follow` zei. Trof niet alleen
de nieuwe registerpagina's maar **al 11.511 bestaande bedrijfsprofielen**
(178–3.208 per cluster) die al op `noindex,follow` stonden in pages.json maar tot nu
toe alsnog `nofollow` kregen — die pagina's gaven dus geen linkwaarde door aan hun
sibling-tegels. Nu index/follow onafhankelijk uitgelezen (zoals `web/lib/
kortingscode.ts` al deed).

**Resultaat:** BFS-bereikbaarheid 93,8% → **99,2%**. Alle 8 clusters volledig van de
weeslijst verdwenen (was in totaal ~11.093 wezen incl. de 3 hele clusters uit fase 1).

### Fase 3 — Kleine fixes
- `nieuwbouw-gids`: hub/fase-pagina's laten linken naar alle 26 wees-artikelen.
- `nieuwbouw`: typo-duplicaat-gemeentes inventariseren → verwijderen uit build +
  eventueel 301 naar de correcte slug (geen links toevoegen; het zijn duplicaten).
- `en-us`: één bescheiden footer-link ("For US homebuyers") naar `/en-us/`.

### Fase 4 — Junk-cleanup (zelfde patroon als output/-exclude)
`bylder-seo-v3/v4/v5`, `badkamer-renoveren`, `keuken-renoveren`, `tuin-aanleggen`,
`vve-appartement`, `blog`, losse AI-landingspagina's, `voucher`, `cep-kaart`:
per geval excluden uit de build (EXCLUDE_TOP in web/build.sh) of 301'en; blog +
badkamer-renoveren + keuken-renoveren ook uit sitemap.xml. Dit ruimt tegelijk een
deel van de 404/canonical-posten uit de GSC-export op.

## Meetpunten
1. Na elke fase: `python3 scripts/check_link_reachability.py` → bereikbaarheid moet
   naar ~99%+ (excl. bewust-noindex clusters).
2. Volgende GSC Coverage-export: daalt "Gevonden — niet geïndexeerd" (35.940) en
   stijgt geïndexeerd voorbij de 4.487-flatline (samen met het kortingscode-effect).

## Uitvoering
Ontwerp = Fable 5 (dit document). Uitrol fase 1–4 = mechanisch werk (Sonnet 5),
final review vóór push = Fable 5, conform de vaste modelstrategie.
