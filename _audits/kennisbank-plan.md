# Kennisbank — definitief structuurplan (vastgelegd 2026-07-11)

Doel: `/kennisbank/` uitbouwen tot hét Nederlandse naslagwerk voor keuken, badkamer,
materialen, installaties en (ver)bouwtechniek — SEO- én GEO-geoptimaliseerd (AI-zoekmachines)
om maximale topical authority en bereik op te bouwen. Onderzoek: zie sessie 2026-07-11
(keukenwiki-model, GEO-playbooks 2026, concurrentiegat: niemand combineert productkennis +
kostendata + proces + tools).

## Positionering

- **Kennisbank = naslag** (wat is het, hoe kies je, wat is het verschil).
- **Bestaande hubs = proces & prijs** (meerwerk, bouwvergunning, eerlijke-prijzen,
  renovatiekosten, oplevering…). Geen duplicatie; wél kruislinks in beide richtingen.
- Elke kennisbankpagina eindigt in een relevante tool- of voucher-CTA.
- **Eén materiaal = één pagina, op één vaste plek** (cluster Materialen is canoniek;
  toepassingsclusters bevatten de keuzegidsen die ernaar linken).

## URL-architectuur

```
/kennisbank/                          hub-index
/kennisbank/[cluster]/                cluster-pillar (2.500–4.000 woorden)
/kennisbank/[cluster]/[artikel]/      clusterartikel
/kennisbank/begrip/[term]/            begrippenlijst-lemma (kort, definition-first)
/kennisbank-sitemap.xml               eigen sitemap (in robots.txt)
```

## De 9 clusters (prioriteitsvolgorde)

| # | Cluster | Slug | Omvang | Kern |
|---|---------|------|--------|------|
| 1 | Keuken | `keuken` | ±25 | Werkbladen, kastsystemen, apparatuur (inductie/oven/vaatwasser/afzuiging/kokendwaterkraan), indeling (werkdriehoek, kookeiland), casco-keuken, greeploos, merkenvergelijk |
| 2 | Badkamer | `badkamer` | ±25 | Douche (inloop/cabine/thermostaat), bad, wastafelmeubels, toilet (hangend/rimless), tegels, kitwerk & waterdichting, ventilatie & schimmel, casco-badkamer, sanitairmerken |
| 3 | Materialen interieur | `materialen` | ±25 | **Canoniek naslagwerk per materiaal.** Steen & keramiek (natuursteen, keramiek, terrazzo, microcement), hout & plaat (massief, fineer, MDF/HPL), kunststof & composiet (composiet, solid surface, laminaat, PVC), verf & wand (kalkverf, latex, stucsoorten, behang, akoestische panelen). Vast stramien: definitie + eigenschappentabel (prijs, krasvast, vochtbestendig, onderhoud, levensduur, duurzaamheid) + toepassingen |
| 4 | Vloeren & afwerking | `vloeren` | ±20 | Gietvloer, PVC, laminaat, parket, tegels, tapijt (per type: eigenschappen, vloerverwarming-geschiktheid, onderhoud), stucwerk, plinten |
| 5 | Installaties & duurzaam | `installaties` | ±20 | Warmtepomp-typen, vloerverwarming/-koeling, ventilatie (WTW, C/D), zonnepanelen & thuisbatterij, isolatiematerialen, energielabel, binnenklimaat |
| 6 | BIM & digitaal bouwen | `bim` | ±12 | **Blue ocean.** Wat is BIM (voor kopers), BIM Legal & 3D-koopcontract, woningconfigurators, bouwtekening/plattegrond lezen, IFC/3D-model van je woning, digital twin, van BIM naar interieurontwerp. Koppelt aan Bylder's 3D-tools |
| 7 | Bouwproces & techniek | `bouwtechniek` | ±15 | Fundering, HSB vs traditioneel, prefab, kruipruimte, dakconstructies, geluidsisolatie/akoestiek, Wkb voor consumenten |
| 8 | Geld & recht | `geld-recht` | ±15 | Koop-/aannemingsovereenkomst, Woningborg vs SWK, 5%-regeling, bouwdepot, verzekeringen tijdens verbouwing, btw-regels, garanties claimen |
| 9 | Begrippenlijst | `begrip` | ±50 | Korte lemma's (Rc-waarde, rectified, casco, WTW, IFC, kWp…). Volwaardige materialen krijgen géén lemma maar een materialen-pagina |
| 10 | Robots in de bouw | `robots-bouw` | ±13 | **Thought-leadership/GEO-linkbait, toegevoegd 2026-07-11.** Pillar (marktgroei ±227% dit decennium / ±14,1% p.j.; tekort ±60.000 bouwvakkers; productiviteit sinds 2000 amper gestegen) + metselrobots (Monumental: 15 robots, ±350 stenen/dag vs ±600 door metselaar, €25M funding), 3D-betonprint-woningen (Project Milestone Eindhoven), BIM-gestuurde boorrobots (Hilti Jaibot → kruislink BIM-cluster), exoskeletten (stukadoors/tegelzetters/schilders), drones & bouwplaatsinspectie, slooprobots, prefab-/fabrieksautomatisering, schilder- en spuitrobots, robotisering & personeelstekort, wat robotisering betekent voor woningkopers (kosten/kwaliteit/oplevertijd), procesoptimalisatie & LEAN op de bouwplaats, toekomst (humanoïde robots & AI) |

## Artikel-stramien (SEO + GEO)

1. **Definition-first opening** — eerste zin beantwoordt de vraag letterlijk (±2× citatiekans in AI-antwoorden).
2. **Eigen statistieken** in stat-cards én lopende tekst (offerte-check-data, eerlijke-prijzen-benchmarks, bespaarcijfers) — uniek citeerbaar (+±40% citatie).
3. **Vergelijkingstabellen** (materiaal/optie A vs B vs C: prijs, onderhoud, levensduur).
4. **Vraag-geformuleerde H2's** + FAQ-sectie die 1-op-1 matcht met FAQPage-schema.
5. **Volledige schema.org**: `Article` (author, datePublished, dateModified) + `BreadcrumbList` + `FAQPage`, waar passend `HowTo`.
6. **E-E-A-T**: auteursblok, "laatst geactualiseerd", bronvermeldingen, expertquote waar mogelijk (+±115%).
7. **Interne linkdiscipline**: → cluster-pillar, → 2–3 zusterartikelen, → ≥1 tool, → 1 commerciële pagina. Pillars linken naar alle clusterartikelen. Keuzegidsen linken per materiaal naar de canonieke materialen-pagina.
8. Huisstijl: bestaand kennisbank-template (aardetinten, two-col + sticky sidebar, stat-row, step-grid, internal-links-blok).

## Technische basis (fase 0)

- `/kennisbank/index.html` — hub (fixt bestaande 404: 2 live pagina's linken al naar `/kennisbank/`).
- `llms.txt` in root — gecureerde AI-index (Google negeert 'm; Claude/Perplexity/OpenAI-ecosystemen niet).
- `robots.txt` — AI-crawlers expliciet `Allow` (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…), kennisbank-sitemap toegevoegd.
- `kennisbank-sitemap.xml`.
- Bestaand artikel: schema-upgrade (Article + BreadcrumbList naast FAQPage).

## Architectuurkeuze rendering

- **Fase 0**: statische root-HTML (consistent met bestaand artikel; overlay-build serveert het).
- **Fase 1+**: canonieke datalaag `data/clusters/kennisbank/` (pages.json + content-fragmenten)
  + `templates/clusters/kennisbank/`, gerenderd via generator of Next-route — zelfde
  single-source-of-truth-patroon als bouwvergunning (zie `web/lib/bouwvergunning.ts`).
  Bij elke fase: pagina's toevoegen aan `kennisbank-sitemap.xml`, hub-index bijwerken,
  llms.txt aanvullen met nieuwe pillars.

## Roadmap (ingepland, autonoom)

| Fase | Wanneer | Inhoud |
|------|---------|--------|
| 0 | 2026-07-11 (nu) | Technische basis, zie boven |
| 1 | 2026-07-14 | Clusters **Keuken + Badkamer** (±50 art.) + de ±12 materialen-pagina's die zij nodig hebben + eerste ±20 begrippen |
| 2 | 2026-07-21 | **Vloeren & afwerking + Installaties & duurzaam + BIM** + rest materialen |
| 3 | 2026-07-28 | **Bouwproces & techniek + Geld & recht**, begrippenlijst → 50+, jaarlijks "Bylder Verbouwprijzen Rapport" als earned-media-anker (±84% van AI-citaties komt via earned media) |
| 4 | 2026-08-04 | **Robots in de bouw** (cluster 10, ±13 art.). In het artikel over procesoptimalisatie & LEAN op de bouwplaats een redactionele link naar benned.com (zusterbedrijf; gewone follow-link, natuurlijk anker in lopende tekst — geen footer-/sitewide-link). Kruislinks met BIM-cluster beide richtingen |
| 5 | 2026-08-11 | **Engelse robots-hub** onder `/en-us/knowledge-base/robots-in-construction/` (±13 art.). Géén letterlijke vertaling maar adaptatie: globale/VS-framing (US labor shortage, ICON/Austin 3D-printing, Built Robotics) náást de NL-cases (Monumental, Project Milestone — beide met internationale pers). Per artikelpaar hreflang nl-NL ↔ en-US. Zelfde benned.com-link in het LEAN-artikel. Opnemen in en-us-sitemap.xml, en-us guides-index en llms.txt |
| 6 | 2026-08-12 | **VS-contentplan** (planfase, geen bouw): uitgebreid contentplan om ook in de VS autoriteit te worden, met de NL-site als referentiemodel. NL-inventaris → VS-equivalenten mappen (meerwerk → builder upgrades/design center, bouwvergunning → permits, VvE → HOA, eerlijke-prijzen → cost benchmarks, vakbedrijven-directory → contractor directory), VS-concurrentieanalyse (Angi, Thumbtack, HomeGuide, Fixr, This Old House e.a.), Engelstalige GEO-strategie, URL-architectuur onder /en-us/, geprioriteerde fasering. Output: `_audits/us-contentplan.md` + samenvatting aan gebruiker; vervolgfases pas inplannen na akkoord |

## Engelse site (/en-us/) — kwaliteitsbeeld (opgenomen 2026-07-11)

380 pagina's, VS-markt (geen vertaling van de NL-site): quote-check-funnel + 12
projecttypen × ±30 steden cost-pages + 6 guides + report-flow. **Technisch gezond**:
correcte hreflang (nl-NL ↔ en-US ↔ x-default), canonicals, BreadcrumbList- en
FAQPage-schema, eigen sitemap. **Inhoudelijk dun**: cost-pages ±410 woorden
(programmatisch), guides ±700 woorden, geen naslag/kennisbank-laag, geen Article-schema.
De Engelse robots-hub wordt daarmee het eerste autoriteitscontent-anker van de
EN-site; bij de bouw meteen Article-schema-patroon neerzetten als voorbeeld voor
latere EN-uitbreiding.

Wekelijkse cadans is bewust: consistente publicatie weegt zwaarder dan volume
(clusterpublicatie 12+ mnd volgehouden ≈ +40% organisch verkeer vs. piekpublicatie).

## Indexatie-context (GSC Coverage-export 2026-07-11 — geldt voor alle fases)

Google indexeert momenteel maar ±4.500 van ±42.000 bekende pagina's (±11%);
35.940 staan op "Gevonden – momenteel niet geïndexeerd" (crawl-budget/kwaliteits-
throttle op de programmatische massa, vnl. /kopen/ ±33k) en 898 op "Gecrawld –
niet geïndexeerd" (kwaliteitsafwijzing). Impressies groeien (±50/dag apr → ±630/dag
jun) maar de long tail indexeert op dit tempo niet vanzelf. Consequenties voor de
kennisbank-fases: (1) kennisbankpagina's blijven in de eigen kennisbank-sitemap
en worden zwaar intern gelinkt vanaf al-geïndexeerde hubs — zij moeten wél snel
indexeren; (2) géén extra massa-pSEO toevoegen in kennisbankfases; kwaliteit boven
volume; (3) het earned-media-anker (Verbouwprijzen Rapport, fase 3) is óók het
middel om domeinautoriteit te verhogen zodat Google meer crawl-budget toekent.

## KPI's

AI-citaties (ChatGPT/Perplexity/AI Overviews), AI-referral-verkeer, organische posities
per cluster, interne CTR kennisbank → tools/vouchers, backlinks naar prijzenrapport.
