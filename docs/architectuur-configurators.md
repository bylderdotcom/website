# Architectuurmemo — configurators en de digital twin

**Status:** voorstel om tegen te beslissen. Niets hiervan is gebouwd.
**Datum:** 11-09-2026. Alle cijfers in dit stuk zijn gemeten in deze repo op die datum.

## 1. Waar dit over gaat

Het doel is een configurator per relevante productgroep — kozijnloze deuren,
gietvloer, onzichtbare plinten, mogelijk gordijnen — die elk los te gebruiken zijn
als product- en offertetool. En daarbovenop een omgeving waarin een echte woning is
nagemaakt uit technische tekeningen, eventueel aangevuld met foto's, waarin al die
configurators samenkomen: een digital twin.

Dit memo gaat niet over of dat moet. Het gaat over de bouwvolgorde, want die bepaalt
of het één platform wordt of zes eilanden.

Het sluit aan op de propositie in `CLAUDE.md`: een koper koopt gietvloer, deuren en
gordijnen nooit in één winkel, en de adviseur beweegt tussen showrooms. De twin is de
digitale kant van exact dat verhaal — de plek waar producten uit verschillende winkels
naast elkaar komen te liggen vóórdat iemand de deur uit gaat.

## 2. Wat er vandaag staat

De deurconfigurator werkt en staat live op `/kozijnloze-deuren/configurator/`.

| Bestand | Regels | Wat het is |
|---|---|---|
| `Configurator.tsx` | 872 | UI, keuzestaat, URL-staat, prijslogica — alles door elkaar |
| `page.tsx` | 228 | route + productpagina eromheen |
| `GerenderdBeeld.tsx` | 157 | de three.js-scene |
| `texturen.ts` | 148 | **de motor** — hoogtekaart naar normal map |
| `KleurKiezer.tsx` | 142 | kleurkeuze |
| `ontwerpen.ts` | 140 | de dertien freesontwerpen, parametrisch |
| `beslag.ts` | 55 | beslagvarianten |

De waarde zit in `texturen.ts`. Die beschrijft een groef niet als donkere lijn maar als
vorm, tekent er een hoogtekaart van, en laat het licht het werk doen. Daarom klopt het
patroon zowel in gebroken wit als in antraciet — precies wat de productpagina belooft.

**Dat principe is niet deur-specifiek.** Het is een materiaal- en lichtmotor.

## 3. De valkuil, met bewijs uit deze repo

In `web/MIGRATION_NOTES.md` staat wat er bij de vakclusters gebeurde: `gietvloer.ts`
is acht keer gekopieerd — loodgieter, aannemer, schilder, elektricien, badkamer,
stukadoor, dakkapel. Onder aan die notities staat de conclusie: *"Generaliseren naar
één cluster-fabriek per vorm kan vanaf hier overwogen worden."* Achteraf opgeschreven,
na acht keer.

Configurators zijn een niveau duurder dan clusters: ze hebben staat, prijs, en een
offerte aan de achterkant.

> **Regel voor dit traject: de gedeelde motor komt eruit vóór configurator twee, niet
> na configurator vier.** Nu kost dat een week. Bij vier configurators kost het een
> maand en durft niemand er nog aan te zitten.

## 4. Wat er echt ontbreekt, en het is niet 3D

Het offerteformulier (`web/app/components/OfferteFormulier.tsx`) heeft deze velden:
naam, e-mail, telefoon, postcode, plaats, planning, toelichting. **Geen enkel veld
voor wat iemand geconfigureerd heeft.**

De configurator zet de gekozen deuren wél in de URL en leest ze daar ook weer uit
(`leesUrl()` in `Configurator.tsx`). Maar op het moment dat iemand een offerte
aanvraagt, valt die configuratie op de grond. Er komt een aanvraag binnen met een vrij
tekstveld.

Dat is de ruggengraat die mist. Niet de weergave — die werkt. Wat mist is één afspraak
over hoe een configuratie eruitziet. Zonder die afspraak kan de twin niet bestaan, want
een twin is per definitie het optellen van configuraties uit verschillende bronnen.
Zes configurators die elk hun eigen vorm verzonnen hebben, tellen niet op.

### 4.1 Voorstel voor die afspraak

Eén vorm die elke configurator uitspuugt, die in een URL past, opgeslagen kan worden,
aan een offerte hangt en naar een vakbedrijf of winkel doorgestuurd kan worden:

```
Configuratie {
  versie      1
  ruimte?     { id, naam, type }        // 'Woonkamer', of een ruimte uit de twin
  regels      Regel[]
  bron        { configurator, versie }   // welke tool, welke uitgave
}

Regel {
  id          stabiel                    // dezelfde regel in URL, offerte en briefing
  product     'kozijnloze-deur' | 'gietvloer' | 'plint' | 'gordijn'
  variant     'noir' | 'epoxy-zijdeglans' | ...
  maten       altijd in mm of m², nooit in "groot/klein"
  aantal
  opties      kleur, beslag, draairichting, glans — per product vrij
  plek?       'Hal', of een ruimte-id uit de twin
  prijs       { bedrag_excl, eenheid, peildatum, herkomst }
}
```

Drie regels die niet onderhandelbaar zijn:

1. **Elke regel heeft een stabiel id.** Zodat de URL, de opgeslagen configuratie, de
   offerte en de briefing aan het vakbedrijf naar hetzelfde ding verwijzen.
2. **Een prijs reist nooit zonder peildatum en herkomst.** Een bedrag dat alleen in de
   browser uitgerekend werd, is over drie maanden niet meer te verantwoorden — en dit
   platform belooft de beste prijs, dus de herkomst is het product.
3. **Maten in millimeters en vierkante meters.** Geen maatlabels, geen "standaard".
   De twin rekent later met deze getallen.

## 5. Welke producten meeliften, en welke niet

| Product | Overdracht van de motor | Moeite |
|---|---|---|
| **Kozijnloze deuren** | staat er | klaar |
| **Gietvloer** | zelfde motor: een vloer is een oppervlak met korrel, glans en naadloosheid — dat is wat een normal map doet | laag |
| **Onzichtbare plinten** | geometrie in plaats van textuur: een schaduwnaad tussen wand en vloer. Visueel subtiel, technisch eenvoudiger dan de deur | laag |
| **Gordijnen** | **ander probleem.** Stof valt, vouwt en laat licht door. Geen normal map maar doekvorm: voorgebakken vouwprofielen of echte simulatie | hoog |

Zet gordijnen niet in dezelfde adem als de rest. Alles behalve gordijnen is één motor
met andere instellingen. Gordijnen zijn een tweede motor.

## 6. De digital twin: los niet het probleem op dat het lijkt te zijn

"Een woning nabouwen uit technische tekeningen" is voor een willekeurig huis een
computer-visionproject met onzekere uitkomst.

Maar wij verkopen niet aan willekeurige huizen. In `data/nieuwbouwprojecten.json`
staan **995 projecten, samen 38.957 woningen, alle 995 met een bronlink.** En een
nieuwbouwproject heeft geen 200 unieke plattegronden — het heeft er vijf tot dertig,
één per woningtype, en die staan in de verkoopbrochure.

Dat verandert de opgave volledig:

- Eén plattegrond die je één keer goed omzet, bedient **elke koper van dat woningtype
  in dat project.**
- Je hoeft geen willekeurige tekening te kunnen lezen. Je hoeft dertig tekeningen per
  project te verwerken, en dat werk schrijf je af over honderden kopers.
- Daarmee wordt een computer-visiongok een contentpijplijn — precies wat de
  Python-pipelines in deze repo al doen.

Het is ook de verdedigingslinie. Een concurrent kan een configurator namaken. Een
bibliotheek gevalideerde plattegronden per Nederlands nieuwbouwproject kan hij niet
namaken zonder dezelfde jaren.

**Wat er nog niet is:** de projectdata heeft naam, plaats, coördinaten, oplevering,
status, bronlink en aantal woningen — **geen woningtypes en geen plattegronden.** Dat
is de eerste datataak, niet de eerste bouwtaak.

**Foto's komen erbovenop, niet eronder.** Een tekening geeft de maten, een foto geeft
licht en bestaande materialen. Begin bij de tekening.

**Beginpunt bestaat al:** `api/quote-check.js` leest een PDF of foto en geeft
gestructureerde JSON terug. Dat is het patroon voor tekeninginterpretatie — geen nieuw
type werk, een nieuwe toepassing van bestaand werk.

## 7. Bouwvolgorde

Per stap staat erbij wanneer hij klaar is. Niet "de code staat er" maar iets dat te
controleren valt.

| # | Stap | Klaar wanneer |
|---|---|---|
| 1 | **De configuratievorm** vastleggen, en het offerteformulier laat hem meereizen | Een geconfigureerde deur komt als leesbare regels binnen bij een offerteaanvraag, niet als vrij tekstveld |
| 2 | **De motor eruit.** Materiaal- en lichtmotor los van de deur-UI | De deurconfigurator draait ongewijzigd op de losgetrokken motor; beeld identiek |
| 3 | **Gietvloer als tweede configurator** | Gebouwd op de motor uit stap 2 zonder die te kopiëren, en aangesloten op de bestaande prijslogica van de 657 gietvloerpagina's |
| 4 | **Plinten als derde** | Idem, en de motor is niet opnieuw aangepast — dat bewijst dat stap 2 klopte |
| 5 | **De twin-schil met handinvoer** | Een ruimte die je zelf intekent of via een maatformulier invult, met de drie configurators erin en één gezamenlijke offerte eruit |
| 6 | **Plattegronden per project** | Tien projecten met de hand omgezet en gevalideerd, vóór er iets geautomatiseerd wordt |
| 7 | **Gordijnen** | Apart traject, pas starten als 1–5 omzet maken |

Stap 3 is bewust de makkelijkste van de nieuwe drie. Als de motor daar niet past, weet
je dat na twee weken in plaats van na vier configurators.

Voor stap 5 bestaan vraag en URL's al: `plattegrond-inrichten/`,
`ai-plattegrond-maken-3d/`, `ai-interieurontwerp-room-planner/`.

## 8. Wat dit betekent voor de poort

De invariantencheck (`scripts/check_site_invariants.py`) controleert canonical,
sitemap, taal, JSON-LD en interne links. Een configurator die stilletjes de verkeerde
kleur rendert of een groef laat verdwijnen, komt daar ongeschonden door.

Er is dus beeldvergelijking nodig: van elke configurator een handvol vaste opnamen
(ontwerp × kleur × beslag), en de poort klaagt als het beeld verschuift. Dat past ook
bij hoe hier beoordeeld wordt — een screenshot is leesbaar, een diff niet.

## 9. Openstaande beslissingen

1. **Waar woont de configuratie als iemand hem opslaat?** Deze repo is statisch; het
   koperdashboard en de betalingen zitten in de app-repo. Een bewaarde configuratie
   hoort waarschijnlijk daar, niet hier. Dat raakt stap 1.
2. **Prijs zichtbaar of op aanvraag per product?** Bepaalt of `prijs` in de regel een
   bedrag of een indicatie is.
3. **Gordijnen: eigen motor bouwen of uitstellen?** Voorstel: uitstellen tot 1–5 lopen.
4. **Plattegronden: eerst tien met de hand.** Wie doet die tien, en welke projecten?
   Voorstel: projecten die nu al verkeer trekken, niet de grootste.
