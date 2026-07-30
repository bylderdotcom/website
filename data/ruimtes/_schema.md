# Ruimte-ontologie — het model

Eén JSON per woonruimte in `data/ruimtes/`. Deze bestanden zijn de **bron**, geen pagina's.
Contentpagina's, de AI-agent, de tools in de app en straks de aanbevelingslaag lezen hier allemaal
uit. Een ruimte bestaat dus in het brein zodra hij hier staat — of er ooit een pagina van komt is
een aparte beslissing.

Waarom deze laag bestaat: woningdossier, meerwerk, vakbedrijven, prijs-benchmark, 3D-tool en
vouchers gaan allemaal over ruimtes, maar niets verbindt ze. De ruimte is de as waar dat op past.
En AI-zoekmachines beantwoorden ruimte-vragen ("wat kost een zolder verbouwen", "welke vloer in
een bijkeuken"); wie daarvan de best gestructureerde bron is, wordt geciteerd.

## Velden

| Veld | Verplicht | Betekenis |
|---|---|---|
| `slug` | ja | Bestandsnaam zonder `.json`. Kleine letters, koppeltekens. |
| `naam` | ja | Zoals een bewoner het noemt. |
| `synoniemen` | ja | Alle andere namen. Voedt de agent en de zoekfunctie: bijkamer = logeerkamer = hobbykamer. Mag leeg zijn, maar denk er twee keer over na. |
| `type` | ja | `binnen` · `buiten` · `technisch` · `verkeersruimte` |
| `status` | ja | `node` = alleen in het brein · `pagina` = verdient eigen content |
| `kern` | ja | Eén zin: wat is deze ruimte en waarom doet hij ertoe. |
| `momenten` | ja | Wanneer wordt hier over besloten: `nieuwbouw-oplevering`, `verbouwing`, `verhuizing`, `verduurzaming`. |
| `beslissingen` | ja | De keuzes die hier vallen. Per stuk: `vraag`, `waarom`, `opties[]`. |
| `vakken` | ja | Slugs uit `generate_vakpillar.py` (VAKKEN). De validator controleert dat ze bestaan. |
| `vergunning` | nee | `{ nodig: ja/nee/soms, toelichting, pad }` |
| `kosten_paden` | nee | Paden naar bestaande kostenpagina's. **Geen bedragen hier** — die staan in de renovatiekosten-data en horen niet gedupliceerd. |
| `productcategorieen` | nee | Categorieën uit `merchant_vouchers.category`. Validator controleert bestaan. |
| `fouten` | nee | Wat er in deze ruimte het vaakst misgaat. Dit is het meest citeerbare veld. |
| `vragen` | nee | `{ v, a }` — feitelijke vraag-antwoordparen, bruikbaar als FAQ-schema én als agent-kennis. |
| `verwante_ruimtes` | nee | Slugs van andere ruimtes. |
| `paden` | nee | Bestaande pagina's die deze ruimte al deels dekken. Validator controleert dat het pad bestaat. |

## Regels

**Geen bedragen in dit bestand.** Prijzen veranderen en staan al in de renovatiekosten-laag.
Verwijs ernaar; dupliceer niet.

**Alleen verwijzingen die bestaan.** Vakken, productcategorieën en paden worden gevalideerd door
`scripts/check_ruimtes.py`. Een verwijzing naar iets dat niet bestaat is een harde fout — dat is
precies hoe "Auping {{city}} Centrum" en drie geschaduwde clusters konden ontstaan.

**Pad vrij vóór je `status: pagina` zet.** Controleer het pad tegen de redirects in `vercel.json`.
Op 29 juli bleken `/slaapkamer`, `/badkamer` en `/dakkapel` alle drie door een redirect
onbereikbaar gemaakt — 3.200 URL's. De validator controleert dit nu automatisch.

**Beschrijf mechanisme, geen belofte** (vergelijkingsraamwerk §5). Een ruimte-bestand dat zegt dat
iets "beter" is zonder waarom, is niet bruikbaar voor de agent en niet citeerbaar voor AI-search.
