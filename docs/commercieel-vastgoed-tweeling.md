# Backlog: ontwerpen, digitale tweeling en bestellen voor commercieel vastgoed

Vastgelegd 10-10-2026 op verzoek van Daniel ("Wil je dit onthouden om te bouwen?").
Status: **nog niet gebouwd.** Bouwen ná fase 3 en 4 van de digitale tweeling voor woningen.

## Waar we staan

| Onderdeel | Woningkoper | Commercieel vastgoed |
|---|---|---|
| Offerte-check, benchmark aanneemsom | ja | ja (`/deelnemer-worden/commercieel-vastgoed/`) |
| Configuratoren (deuren, kast op maat, gietvloer) | ja | nee: bezoekersstroom en teksten zijn op de woningkoper gericht |
| Digitale tweeling (Mijn woning) | ja | nee: één woning per account, verdiepingen en kamers |
| Offerte → bestelling → oplevering → commissie | ja | nee: partnerkeuze op postcode voor particuliere producten |

## Wat er anders moet

1. **Object in plaats van woning.** Eén account beheert meerdere panden en units (kantoor, winkel, horeca,
   bedrijfshal). De tweeling wordt per pand, met units per verdieping. Huurder en eigenaar zijn verschillende rollen.
2. **Casco naar huurdersinrichting (fit-out).** Elementen die erbij komen: systeemwanden, systeemplafonds,
   pantry's, balies en receptiemeubels (de kastontwerper uitbreiden), vloeren per zone (gietvloer, tapijttegels).
   Kozijnloze deuren en gietvloer blijven bruikbaar.
3. **Grotere getallen.** Honderden tot duizenden m², meerdere verdiepingen; de tekeninglezer moet dat aankunnen
   (nu maximaal 8 verdiepingen en 60 ruimtes per verdieping in `geldigModel`).
4. **Zakelijke prijzen en voorwaarden.** Bedragen exclusief btw, offertes per fase of per unit, oplevering per unit.
   De momentopname en de regels voor 'wezenlijk' gelden per unit.
5. **Andere partners.** Projectinrichters en interieurbouwers naast de huidige verwerkers; partnersoort en
   productlijst uitbreiden. Commissie via dezelfde Pay.nl-route.
6. **Koppeling met de offerte-check.** Wie een aanneemsom laat checken, kan de inrichting daarna in de tweeling
   samenstellen en uitvragen.

## Volgorde (voorstel)

1. Het datamodel: `woning_modellen` → panden met units (of een `object_type` en `unit` erbij), zonder de
   woningkant te breken.
2. Mijn woning → Mijn pand voor zakelijke accounts; dezelfde 3D-weergave per unit.
3. Fit-out-elementen in de kastontwerper (balie, pantry) en een zone-gietvloer.
4. Zakelijke offerteroute (excl. btw, per unit) en partners.
5. Landingspagina's per objecttype met SEO/GEO, en een CTA vanaf de offerte-check.
