# Kennisbank — schrijfwijzer & artikel-schema (fase 1+)

Elk artikel is één JSON-bestand in `data/clusters/kennisbank/artikelen/<cluster>--<slug>.json`.
De generator (`_scripts/generate_kennisbank.py`) rendert hieruit de pagina's.

## JSON-schema

```json
{
  "cluster": "keuken | badkamer | materialen | begrip",
  "slug": "url-slug",
  "titel": "H1 zonder merknaam",
  "title_tag": "SEO-title ≤60 tekens, eindigend op ' | Bylder'",
  "meta_description": "±150 tekens, actief geformuleerd",
  "intro": ["Alinea 1 — DEFINITION-FIRST: de eerste zin beantwoordt de kernvraag letterlijk.", "Alinea 2 — context/waarom het ertoe doet."],
  "stats": [["€12.000","gem. complete keuken"],["...","..."],["...","..."]],
  "secties": [
    {"kop": "H2 in vraagvorm", "html": "<p>...</p> en optioneel <table class=\"vgl\"><thead><tr><th>..</th></tr></thead><tbody><tr><td>..</td></tr></tbody></table>"}
  ],
  "faq": [{"q": "vraag", "a": "antwoord, 2-4 zinnen, zelfstandig leesbaar"}],
  "links": {
    "tool": ["/pad/", "label"],
    "commercieel": ["/pad/", "label"],
    "zusters": ["slug-in-zelfde-cluster", "cluster:slug voor cross-cluster"]
  }
}
```

Begrippen (`cluster: "begrip"`): zelfde schema maar compacter — intro[0] = de definitie
(2-3 zinnen), 1-2 secties, 2 faq-items, stats mag `[]` zijn.

## Stijlregels

- **Definition-first**: eerste zin van intro[0] beantwoordt de vraag uit de titel letterlijk.
- **Vraag-H2's**: elke sectiekop is een vraag zoals een koper hem googelt/aan AI stelt.
- **Vergelijkingstabellen** waar materialen/opties vergeleken worden (prijs, onderhoud, levensduur).
- Nederlands, warm-zakelijk, geen AI-clichés ("in de wereld van", "duik in", "naadloos").
- Cijfers alleen uit de feitenbasis hieronder of algemeen verifieerbare kennis; ranges i.p.v. schijnprecisie.
- 400–700 woorden per artikel (begrippen 150–300).

## Feitenbasis (consistent met de site — niet van afwijken)

- Complete keuken: €6.000–€20.000, gemiddeld €12.000 (middensegment).
- Complete badkamer: €7.000–€20.000, gemiddeld €12.000; renovatie €7.500–€20.000.
- Bylder-lidmaatschap: €99 eenmalig; gemiddelde besparing €4.200; 61 deelnemende merken (schrijf "60+").
- 96% van de kopers betaalt minstens één post te duur; gemiddeld €1.840 te veel aan meerwerk.
- Nieuwbouw-afwerking totaal: €35.000–€65.000 (gemiddeld €42.000).

## Vaste interne linkdoelen

Tools: /ai-offerte-check-aannemer/ (offerte-check), /keuken-badkamer-offerte-check/ (keuken/badkamer-check),
/3d-sfeerimpressie/ (3D-ontwerp), /ai-keuken-ontwerpen-badkamerplanner/ (planner), /nieuwbouw-tools/.
Commercieel: /kopen/sanitair/, /kopen/tegels/, /showroomsale/, /eerlijke-prijzen/keuken/, /eerlijke-prijzen/badkamer/, /verbouwen/.
Proces-hubs: /keuken-renoveren/, /badkamer-renoveren/, /meerwerk/, /oplevering-nieuwbouw/, /kopersbegeleiding/keuken-badkamer-casco/.
