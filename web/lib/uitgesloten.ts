// Bedrijven die geen vakbedrijf zijn uit de overzichtslijsten houden.
//
// WAAROM. De acht clusters bevatten 25.594 profielen. De vakclassificatie van Jev
// wees er 381 aan die geen installateur zijn maar een winkel, showroom of iets
// heel anders. Na een tweede, anders gestelde vraag en een derde oordeel op hun
// eigen website bleven er 206 over waar alle signalen het eens waren. Daar zitten
// BAUHAUS Venlo, Karwei Hulst, Woonboulevard Dordt, Taxi Teylingen en een
// Shell-station tussen — allemaal onder een vakkop waar ze niet horen.
//
// WAT DIT WEL EN NIET DOET. Het haalt de kaart van zo'n bedrijf uit de
// plaatslijst ("badkamerspecialisten in Aalsmeer"). Het profiel zelf blijft
// bestaan: geen URL die verdwijnt, geen 404, geen redirect, en de interne links
// ernaartoe blijven werken. Zit er een fout in, dan is het één regel uit
// data/vakbedrijven-uitgesloten.json halen en de volgende bouw staat het weer
// goed. Omkeerbaar was hier meer waard dan zeker.
//
// HOE. De kaarten in de plaatspagina's zijn <div class="card vb-card">…</div> met
// sluitende divs, en elke kaart draagt de link naar het profiel. We knippen op
// het id-achtervoegsel van de slug, want dat is het enige dat de bron
// (vakbedrijven.json) en het cluster-fragment delen.
import fs from 'node:fs'
import path from 'node:path'

const REPO = path.join(process.cwd(), '..')

type Uitgesloten = { cluster: string; naam: string }

let _perCluster: Record<string, Set<string>> | null = null

function achtervoegsels(): Record<string, Set<string>> {
  if (_perCluster) return _perCluster
  _perCluster = {}
  try {
    const rauw = fs.readFileSync(
      path.join(REPO, 'data', 'vakbedrijven-uitgesloten.json'), 'utf8')
    const alle: Record<string, Uitgesloten> = JSON.parse(rauw)
    for (const [slug, v] of Object.entries(alle)) {
      const id = slug.split('-').pop()
      if (!id) continue
      ;(_perCluster[v.cluster] ??= new Set()).add(id)
    }
  } catch {
    // Geen bestand = niets uitsluiten. De site bouwt ook zonder.
  }
  return _perCluster
}

/** Haalt de kaarten van uitgesloten bedrijven uit een plaatspagina. */
export function zonderUitgesloten(cluster: string, html: string): string {
  const ids = achtervoegsels()[cluster]
  if (!ids || ids.size === 0) return html

  let uit = html
  let vanaf = 0
  for (;;) {
    const i = uit.indexOf('vb-card', vanaf)
    if (i < 0) break
    const start = uit.lastIndexOf('<div', i)
    if (start < 0) { vanaf = i + 7; break }

    // Einde van de kaart: tellen tot de div weer sluit.
    let diepte = 0
    let j = start
    const re = /<div\b|<\/div>/g
    re.lastIndex = start
    for (;;) {
      const m = re.exec(uit)
      if (!m) { j = -1; break }
      diepte += m[0] === '</div>' ? -1 : 1
      j = m.index + m[0].length
      if (diepte === 0) break
    }
    if (j < 0) break

    const kaart = uit.slice(start, j)
    const href = kaart.match(new RegExp(`/${cluster}/bedrijf/([^"/]+)/`))
    const id = href ? href[1].split('-').pop() : null
    if (id && ids.has(id)) {
      uit = uit.slice(0, start) + uit.slice(j)
      vanaf = start
    } else {
      vanaf = j
    }
  }
  return uit
}
