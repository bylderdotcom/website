import * as THREE from 'three'
import type { Groef, Fineer } from './ontwerpen'

// De groeven worden eerst als hoogtekaart getekend en daarna omgerekend naar een
// normal map. Dat is de hele truc van deze configurator.
//
// WAAROM NIET GEWOON DONKERE LIJNEN OP HET DEURBLAD
// Een ingetekende lijn blijft even donker als je de deur zwart maakt, en dan
// verdwijnt het patroon. Een groef ís geen lijn maar een vorm: hij vangt licht op
// de ene flank en houdt het tegen op de andere. Door dat als normaalrichting vast
// te leggen en het licht zijn werk te laten doen, klopt het gedrag bij élke kleur —
// en zie je vanzelf wat de productpagina belooft: in gebroken wit fluistert het
// patroon, in antraciet roept het.
//
// De omweg via een hoogtekaart is er omdat bogen en visgraat anders per soort
// uitgerekend moeten worden. Nu tekent elk ontwerp gewoon lijnen, en doet één
// Sobel-berekening de rest.

const BREEDTE = 700          // px; deurblad 1.050 mm → ~1,5 mm per pixel
const HOOGTE = 1800          // px; deurblad 2.700 mm

/** Groefbreedte in pixels. Een echte frees is 4 à 8 mm; iets ruimer leest beter. */
const GROEF_PX = 7

/** Een geladen decor: de kleur- en dieptekaart van de leverancier. */
export type Decor = {
  kleur: HTMLImageElement
  /** De persing van het decor. Ontbreekt bij decors waar de leverancier alleen
   *  een normaalkaart gaf; dan blijft het oppervlak vlak. */
  structuur?: HTMLImageElement
  /** Breedte en hoogte van de tegel in millimeters. Niet elk decor is vierkant. */
  tegelMm: [number, number]
}

/** Tegelt een beeld over het hele deurdoek, op ware grootte. */
function tegel(g: CanvasRenderingContext2D, beeld: HTMLImageElement, tegelMm: [number, number]) {
  // Het doek is 700 px voor 1050 mm en 1800 px voor 2700 mm — 1,5 mm per pixel
  // in beide richtingen. Afronden naar hele pixels: op een halve pixel tekenen
  // laat een zichtbare naad achter waar twee tegels elkaar raken, en een halve
  // pixel op 867 is een schaalfout van 0,04%.
  const bx = Math.round((tegelMm[0] / 1050) * BREEDTE)
  const by = Math.round((tegelMm[1] / 2700) * HOOGTE)
  for (let y = 0; y < HOOGTE; y += by) {
    for (let x = 0; x < BREEDTE; x += bx) g.drawImage(beeld, x, y, bx, by)
  }
}

function tekenHoogte(groeven: Groef[], decor?: Decor): ImageData {
  const c = document.createElement('canvas')
  c.width = BREEDTE; c.height = HOOGTE
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.fillRect(0, 0, BREEDTE, HOOGTE)
  if (decor?.structuur) {
    // De persing zit óók in het reliëf, maar veel ondieper dan een frees.
    // Vandaar de lage dekking: je wilt hem zien in strijklicht, niet als een
    // tweede groevenpatroon.
    g.globalAlpha = 0.22
    tegel(g, decor.structuur, decor.tegelMm)
    g.globalAlpha = 1
  }

  // Zwart = diep. De vervaging maakt van een platte lijn een V-vormige flank;
  // zonder die overgang staat de groef loodrecht en vangt hij geen licht.
  g.filter = 'blur(3px)'
  g.strokeStyle = '#000'
  g.lineWidth = GROEF_PX
  g.lineCap = 'butt'

  for (const gr of groeven) {
    g.beginPath()
    if (gr.soort === 'verticaal') {
      const x = gr.x * BREEDTE
      g.moveTo(x, 0); g.lineTo(x, HOOGTE)
    } else if (gr.soort === 'horizontaal') {
      const y = gr.y * HOOGTE
      g.moveTo(0, y); g.lineTo(BREEDTE, y)
    } else if (gr.soort === 'kader') {
      const mx = gr.inset * BREEDTE
      const my = gr.inset * BREEDTE      // gelijke marge in mm, niet in fractie
      g.rect(mx, my, BREEDTE - 2 * mx, HOOGTE - 2 * my)
    } else if (gr.soort === 'boog') {
      // Het raster is isotroop — 1,5 mm per pixel in beide richtingen — dus een
      // cirkel in de textuur blijft een cirkel op de deur.
      const rad = (d: number) => (d * Math.PI) / 180
      g.arc(gr.cx * BREEDTE, gr.cy * HOOGTE, gr.r * BREEDTE,
            rad(gr.van ?? 0), rad(gr.tot ?? 360))
    } else if (gr.soort === 'chevron') {
      // De punt wijst omhoog. Hij wees omlaag; gemeld door Classic Next op
      // 14-09-2026 ("frees zit ondersteboven gespiegeld").
      const y = gr.y * HOOGTE, h = gr.hoogte * HOOGTE
      const m = 0.135 * BREEDTE            // binnen het kader van Ember
      g.moveTo(m, y + h); g.lineTo(BREEDTE / 2, y); g.lineTo(BREEDTE - m, y + h)
    }
    g.stroke()
  }
  return g.getImageData(0, 0, BREEDTE, HOOGTE)
}

/** Een indicatieve houtnerf. Vervalt zodra de scans van Classic Next er zijn. */
function tekenFineer(g: CanvasRenderingContext2D, f: Fineer) {
  g.fillStyle = f.basis
  g.fillRect(0, 0, BREEDTE, HOOGTE)
  g.strokeStyle = f.nerf
  g.globalAlpha = 0.30
  // Verticale nerf met wat drift, zoals een gezaagd blad. Bewust grof: dit is
  // een indicatie, geen weergave van het echte materiaal.
  for (let i = 0; i < 190; i++) {
    const x0 = Math.random() * BREEDTE
    g.lineWidth = 0.6 + Math.random() * 2.6
    g.globalAlpha = 0.06 + Math.random() * 0.20
    g.beginPath()
    g.moveTo(x0, 0)
    let x = x0
    for (let y = 0; y <= HOOGTE; y += 60) {
      x += (Math.random() - 0.5) * 9
      g.lineTo(x, y)
    }
    g.stroke()
  }
  g.globalAlpha = 1
}

/** Hoogtekaart → normal map (Sobel) plus een lichte donkering in de groef. */
export function maakTexturen(groeven: Groef[], fineer?: Fineer, decor?: Decor) {
  const h = tekenHoogte(groeven, decor)
  const nc = document.createElement('canvas'); nc.width = BREEDTE; nc.height = HOOGTE
  const mc = document.createElement('canvas'); mc.width = BREEDTE; mc.height = HOOGTE
  const nd = nc.getContext('2d')!.createImageData(BREEDTE, HOOGTE)
  const md = mc.getContext('2d')!.createImageData(BREEDTE, HOOGTE)
  const hoogte = (x: number, y: number) => {
    const cx = Math.min(BREEDTE - 1, Math.max(0, x))
    const cy = Math.min(HOOGTE - 1, Math.max(0, y))
    return h.data[(cy * BREEDTE + cx) * 4] / 255
  }

  // Sterkte van de helling. Te hoog en het wordt plastic; te laag en de groef
  // verdwijnt zodra de deur donker wordt.
  const K = 2.6

  for (let y = 0; y < HOOGTE; y++) {
    for (let x = 0; x < BREEDTE; x++) {
      const dx = (hoogte(x + 1, y) - hoogte(x - 1, y)) * K
      const dy = (hoogte(x, y + 1) - hoogte(x, y - 1)) * K
      // Normaal = genormaliseerde (-dx, -dy, 1), verpakt in 0-255.
      const len = Math.sqrt(dx * dx + dy * dy + 1)
      const i = (y * BREEDTE + x) * 4
      nd.data[i]     = ((-dx / len) * 0.5 + 0.5) * 255
      nd.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255
      nd.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255
      nd.data[i + 3] = 255

      // Kleurkaart: wit waar het vlak is, iets grijzer in de groef. Vermenigvuldigt
      // met de gekozen RAL-kleur, dus de groef wordt donkerder in élke kleur —
      // precies zoals een schaduw zich hoort te gedragen. Bij fineer wordt de
      // houtnerf de basis en legt de groef er zijn schaduw overheen.
      const v = 255 - (1 - hoogte(x, y)) * 46
      md.data[i] = md.data[i + 1] = md.data[i + 2] = v
      md.data[i + 3] = 255
    }
  }
  nc.getContext('2d')!.putImageData(nd, 0, 0)
  const mg = mc.getContext('2d')!
  if (fineer) {
    // Een echt decor van de leverancier gaat vóór op onze eigen getekende nerf.
    if (decor) tegel(mg, decor.kleur, decor.tegelMm)
    else tekenFineer(mg, fineer)
    // De groefdonkering als vermenigvuldiging over de nerf.
    const tmp = document.createElement('canvas')
    tmp.width = BREEDTE; tmp.height = HOOGTE
    tmp.getContext('2d')!.putImageData(md, 0, 0)
    mg.globalCompositeOperation = 'multiply'
    mg.drawImage(tmp, 0, 0)
    mg.globalCompositeOperation = 'source-over'
  } else {
    mg.putImageData(md, 0, 0)
  }

  const normalMap = new THREE.CanvasTexture(nc)
  const map = new THREE.CanvasTexture(mc)
  map.colorSpace = THREE.SRGBColorSpace
  for (const t of [normalMap, map]) {
    t.anisotropy = 8
    t.needsUpdate = true
  }
  return { normalMap, map }
}
