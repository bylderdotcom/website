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

function tekenHoogte(groeven: Groef[]): ImageData {
  const c = document.createElement('canvas')
  c.width = BREEDTE; c.height = HOOGTE
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.fillRect(0, 0, BREEDTE, HOOGTE)

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
      g.arc(gr.cx * BREEDTE, gr.cy * HOOGTE, gr.r * BREEDTE, 0, Math.PI * 2)
    } else if (gr.soort === 'chevron') {
      const y = gr.y * HOOGTE, h = gr.hoogte * HOOGTE
      const m = 0.10 * BREEDTE
      g.moveTo(m, y); g.lineTo(BREEDTE / 2, y + h); g.lineTo(BREEDTE - m, y)
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
export function maakTexturen(groeven: Groef[], fineer?: Fineer) {
  const h = tekenHoogte(groeven)
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
    tekenFineer(mg, fineer)
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
