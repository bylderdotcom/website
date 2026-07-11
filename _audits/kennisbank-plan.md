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

Wekelijkse cadans is bewust: consistente publicatie weegt zwaarder dan volume
(clusterpublicatie 12+ mnd volgehouden ≈ +40% organisch verkeer vs. piekpublicatie).

## KPI's

AI-citaties (ChatGPT/Perplexity/AI Overviews), AI-referral-verkeer, organische posities
per cluster, interne CTR kennisbank → tools/vouchers, backlinks naar prijzenrapport.
