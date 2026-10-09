'use client'

// De opening van /gietvloer/ontwerpen/: een film in vier stappen, in de browser.
//   1. Tekening   de plattegrond tekent zich lijn voor lijn
//   2. Muren      de wanden komen uit de tekening omhoog
//   3. Gietvloer  de vloer loopt vol vanuit één punt, met een straal van boven
//   4. Zo wordt   licht, glans, schaduw en meubels: zo oogt het straks
// Daarna giet hij de vloer om de paar seconden opnieuw in een andere kleur; een
// kleurknop doet dat meteen.
//
// Upload de bezoeker zijn bouwtekening (PDF), dan lezen we die in de browser (dezelfde
// lezer als Mijn woning), bewaren hem waar Mijn woning hem bewaart, en speelt de film
// opnieuw af met de muren en ruimtes uit zijn eigen tekening. De ontwerper eronder
// hoort dat via het event 'bylder:woning' en zet de ruimtes klaar.
//
// Zonder WebGL of met 'minder beweging' staat meteen het eindbeeld stil.

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { UploadSimple, ImageSquare, Check } from '@phosphor-icons/react'
import { leesPdf, type Verdieping } from '@/lib/tekening/lees'
import { KLEUREN, NIET_GIET, isLicht } from './gegevens'

/* ---------------------------------------------------------------- het plan */

type Rect = [number, number, number, number]   // meters: x0, z0, x1, z1
type Plan = { wanden: Rect[]; ruimtes: { naam: string; stroken: Rect[]; giet: boolean }[]; kader: Rect; meubels: boolean }

// Voorbeeldwoning: een open woonkeuken met hal. Geen echte tekening van een koper.
const VOORBEELD: Plan = (() => {
  const W = 0.3, B = 0.1
  return {
    kader: [0, 0, 10, 7.5],
    meubels: true,
    wanden: [
      // buitenmuren, met ramen en voordeur als openingen
      [0, 0, 8.2, W], [9.2, 0, 10, W],
      [0, 7.5 - W, 1.2, 7.5], [3.6, 7.5 - W, 4.4, 7.5], [6.8, 7.5 - W, 10, 7.5],
      [0, 0, W, 2], [0, 4, W, 7.5],
      [10 - W, 0, 10, 4.5], [10 - W, 6, 10, 7.5],
      // hal
      [7.0, W, 7.0 + B, 2.9], [7.0, 2.9, 8.0, 2.9 + B], [8.9, 2.9, 10 - W, 2.9 + B],
    ],
    ruimtes: [
      { naam: 'Woonkamer en keuken', stroken: [[W, W, 7.0, 7.5 - W], [7.0, 2.9 + B, 10 - W, 7.5 - W]], giet: true },
      { naam: 'Hal', stroken: [[7.0 + B, W, 10 - W, 2.9]], giet: true },
    ],
  }
})()

/** Een gelezen verdieping (mm) naar een plan in meters. */
function naarPlan(l: Verdieping, giet: Record<string, boolean> | null, li: number): Plan {
  const k = l.kader, ox = k[0], oy = k[1], m = (v: number) => v / 1000
  const r = (a: number, b: number, c: number, d: number): Rect => [m(Math.min(a, c) - ox), m(Math.min(b, d) - oy), m(Math.max(a, c) - ox), m(Math.max(b, d) - oy)]
  return {
    kader: [0, 0, m(k[2] - k[0]), m(k[3] - k[1])],
    meubels: false,
    wanden: l.wanden.map(w => r(w[0], w[1], w[2], w[3])),
    ruimtes: l.ruimtes.map(x => ({
      naam: x.naam,
      stroken: x.stroken.map(s => r(s[0], s[1], s[2], s[3])),
      giet: giet ? !!giet[`${li}:${x.id}`] : !NIET_GIET.test(x.naam),
    })),
  }
}

/* ---------------------------------------------------------------- de tekening lezen */

const PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/'
const WONING_OPSLAG = 'bylder:mijn-woning:v1'
function laadPdfJs(): Promise<unknown> {
  const w = window as unknown as { pdfjsLib?: unknown }
  if (w.pdfjsLib) return Promise.resolve(w.pdfjsLib)
  const script = (src: string) => new Promise<void>((ok, nee) => {
    const s = document.createElement('script'); s.src = src; s.async = false
    s.onload = () => ok(); s.onerror = () => nee(new Error('laden mislukt'))
    document.head.appendChild(s)
  })
  return script(PDFJS + 'pdf.min.js').then(() => script(PDFJS + 'pdf.worker.min.js')).then(() => {
    if (!w.pdfjsLib) throw new Error('laden mislukt')
    return w.pdfjsLib
  })
}

/* ---------------------------------------------------------------- tijdlijn */

const T = { lijnen: [0.2, 1.8], camera: [1.4, 3.9], muren: [1.7, 3.6], giet: [3.9, 6.3], foto: [6.0, 7.8], wissel: 7.5 }
const FASEN = ['Tekening', 'Muren', 'Gietvloer', 'Zo wordt het'] as const
const tussen = (t: number, [a, b]: number[]) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const zacht = (x: number) => x * x * (3 - 2 * x)
const uit = (x: number) => 1 - Math.pow(1 - x, 3)
const DEKVLOER = '#837E76'
const START_KLEUREN = ['antraciet', 'zandbeige', 'betongrijs', 'kalkwit']

/* ---------------------------------------------------------------- textures */

function wolkTextuur(): THREE.CanvasTexture {
  // Zachte wolken in de vloer: ruis in grijswaarden rond 1, als kleurkaart.
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n
  const g = c.getContext('2d')!, img = g.createImageData(n, n)
  const raster = (s: number) => { const a: number[] = []; for (let i = 0; i < (s + 1) * (s + 1); i++) a.push(Math.random()); return a }
  const lagen = [[4, 0.5], [8, 0.3], [16, 0.2]].map(([s, w]) => ({ s, w, r: raster(s) }))
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let v = 0
    for (const l of lagen) {
      const fx = (x / n) * l.s, fy = (y / n) * l.s, ix = Math.floor(fx), iy = Math.floor(fy), tx = zacht(fx - ix), ty = zacht(fy - iy)
      const at = (a: number, b: number) => l.r[(b % l.s) * (l.s + 1) + (a % l.s)]
      v += l.w * ((at(ix, iy) * (1 - tx) + at(ix + 1, iy) * tx) * (1 - ty) + (at(ix, iy + 1) * (1 - tx) + at(ix + 1, iy + 1) * tx) * ty)
    }
    const p = Math.round(255 * (0.9 + v * 0.1)), i = (y * n + x) * 4
    img.data[i] = img.data[i + 1] = img.data[i + 2] = p; img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.35, 0.35); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function rasterTextuur(): THREE.CanvasTexture {
  const n = 512, c = document.createElement('canvas'); c.width = c.height = n
  const g = c.getContext('2d')!
  g.strokeStyle = 'rgba(61,90,62,0.16)'; g.lineWidth = 1
  for (let i = 0; i <= n; i += n / 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, n); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(n, i); g.stroke() }
  g.strokeStyle = 'rgba(61,90,62,0.3)'; g.lineWidth = 2
  for (let i = 0; i <= n; i += n / 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, n); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(n, i); g.stroke() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** De vloer van een set ruimtes als één vlak uit rechthoeken: echte randen, dus gladde lijnen. */
function vloerVlak(stroken: Rect[], staand = false): THREE.BufferGeometry {
  // staand: in het XY-vlak, voor de spiegel (die draait zelf plat en spiegelt om zijn eigen Z-as)
  const delen = stroken.filter(s => s[2] - s[0] > 0.01 && s[3] - s[1] > 0.01).map(s => {
    const g = new THREE.PlaneGeometry(s[2] - s[0], s[3] - s[1])
    if (staand) g.translate((s[0] + s[2]) / 2, -(s[1] + s[3]) / 2, 0)
    else { g.rotateX(-Math.PI / 2); g.translate((s[0] + s[2]) / 2, 0, (s[1] + s[3]) / 2) }
    return g
  })
  return delen.length ? mergeGeometries(delen) : new THREE.PlaneGeometry(0.01, 0.01)
}

/** Vloermateriaal dat alleen tekent binnen de straal van de gietvloer. */
function vloerMateriaal(basis: THREE.MeshStandardMaterial, u: { r: { value: number }; o: { value: THREE.Vector2 } }) {
  basis.onBeforeCompile = sh => {
    sh.uniforms.uR = u.r; sh.uniforms.uO = u.o
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvW = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vW; uniform float uR; uniform vec2 uO;')
      .replace('void main() {', `void main() {
        float rand = sin(vW.x * 5.3 + vW.z * 2.1) * 0.06 + sin(vW.z * 8.7 - vW.x * 3.3) * 0.04;
        if (distance(vW.xz, uO) > uR + rand) discard;`)
  }
  basis.customProgramCacheKey = () => 'gv-vloer'
  return basis
}

// Spiegeling in de gietvloer: de scène gespiegeld, opgeteld bij de vloer (zonder de
// achtergrond, dus alleen muren en meubels). Alleen waar de vloer al gegoten is.
const SPIEGEL = {
  name: 'GietSpiegel',
  uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uR: { value: 0 }, uO: { value: new THREE.Vector2() }, uSterkte: { value: 0 } },
  vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
    void main() { vUv = textureMatrix * vec4(position, 1.0); vW = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uR; uniform vec2 uO; uniform float uSterkte; varying vec4 vUv; varying vec3 vW;
    void main() {
      float rand = sin(vW.x * 5.3 + vW.z * 2.1) * 0.06 + sin(vW.z * 8.7 - vW.x * 3.3) * 0.04;
      if (distance(vW.xz, uO) > uR + rand) discard;
      vec4 base = texture2DProj(tDiffuse, vUv);
      // Opgeteld in schermwaarden, zonder omzetting naar sRGB: die blaast kleine waarden op.
      gl_FragColor = vec4(clamp(base.rgb, 0.0, 1.0) * uSterkte, 1.0);
    }`,
}

/* ---------------------------------------------------------------- de scène */

type Scene = { start: (plan: Plan) => void; giet: (hex: string) => void; stop: () => void; fase: () => number }

function maakScene(doek: HTMLDivElement, opFase: (f: number) => void, rustig: boolean): Scene | null {
  let renderer: THREE.WebGLRenderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }) } catch { return null }
  const klein = window.innerWidth < 760
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, klein ? 1.75 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  doek.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const papier = new THREE.Color('#F2EDE3'), warm = new THREE.Color('#CFC4B3')
  scene.background = papier.clone()
  scene.fog = new THREE.Fog(papier, 30, 70)
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 200)

  const hemi = new THREE.HemisphereLight('#fffaf2', '#b9ad9c', 1.2); scene.add(hemi)
  const zon = new THREE.DirectionalLight('#ffe7c4', 0.6)
  zon.castShadow = true; zon.shadow.mapSize.set(klein ? 1024 : 2048, klein ? 1024 : 2048); zon.shadow.bias = -0.0004; zon.shadow.normalBias = 0.02; zon.shadow.radius = 4
  scene.add(zon, zon.target)

  const raster = rasterTextuur(), wolk = wolkTextuur()
  const grond = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: papier, roughness: 1 }))
  grond.rotation.x = -Math.PI / 2; grond.position.y = -0.002; grond.receiveShadow = true; scene.add(grond)
  const rasterVlak = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ map: raster, transparent: true, depthWrite: false }))
  rasterVlak.rotation.x = -Math.PI / 2; rasterVlak.position.y = 0.0005; raster.repeat.set(4, 4); scene.add(rasterVlak)

  let groep = new THREE.Group(); scene.add(groep)
  let muren: { mesh: THREE.Mesh; d: number; h: number }[] = []
  let meubels: { obj: THREE.Object3D; d: number }[] = []
  let lijnen: THREE.LineSegments | null = null, lijnAantal = 0
  const lijnMat = new THREE.LineBasicMaterial({ color: '#2B3A2C', transparent: true })
  const uOud = { r: { value: 0 }, o: { value: new THREE.Vector2() } }, uNieuw = { r: { value: 0 }, o: { value: new THREE.Vector2() } }
  const uDek = { r: { value: 1e3 }, o: { value: new THREE.Vector2() } }
  let oudMat: THREE.MeshPhysicalMaterial, nieuwMat: THREE.MeshPhysicalMaterial
  let straal: THREE.Mesh
  let spiegel: Reflector | null = null
  const zwart = new THREE.Color('#000')
  let plan: Plan = VOORBEELD, midden = new THREE.Vector3(), grootte = 10, rMax = 10
  let t0 = performance.now(), gietStart = 0, kleurIdx = 0, zelfGekozen = false, fase = -1, actief = true
  let doelOud = new THREE.Color(DEKVLOER), doelNieuw = new THREE.Color(DEKVLOER)

  const vloerMat = (kleur: THREE.ColorRepresentation) => new THREE.MeshPhysicalMaterial({
    color: kleur, map: wolk, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.25,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  })

  function bouw(p: Plan) {
    scene.remove(groep); groep.traverse(o => { if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose() })
    groep = new THREE.Group(); scene.add(groep); muren = []; meubels = []
    plan = p
    const [x0, z0, x1, z1] = p.kader
    midden = new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2); grootte = Math.max(x1 - x0, z1 - z0)
    const giet = p.ruimtes.filter(r => r.giet).flatMap(r => r.stroken)
    const groot = giet.slice().sort((a, b) => (b[2] - b[0]) * (b[3] - b[1]) - (a[2] - a[0]) * (a[3] - a[1]))[0] ?? [x0, z0, x1, z1]
    const o = new THREE.Vector2((groot[0] + groot[2]) / 2, (groot[1] + groot[3]) / 2)
    rMax = Math.max(...[[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => Math.hypot(x - o.x, z - o.y))) + 0.3
    uOud.o.value.copy(o); uNieuw.o.value.copy(o)

    // dekvloer onder alle ruimtes, gietvloer alleen waar hij komt
    const dek = new THREE.Mesh(vloerVlak(p.ruimtes.flatMap(x => x.stroken)), vloerMateriaal(new THREE.MeshStandardMaterial({ color: DEKVLOER, roughness: 0.97 }), uDek))
    dek.position.y = 0.001; dek.receiveShadow = true; groep.add(dek)
    oudMat = vloerMat(DEKVLOER); nieuwMat = vloerMat(DEKVLOER)
    nieuwMat.polygonOffsetFactor = -4; nieuwMat.polygonOffsetUnits = -4
    const oud = new THREE.Mesh(vloerVlak(giet), vloerMateriaal(oudMat, uOud))
    const nieuw = new THREE.Mesh(vloerVlak(giet), vloerMateriaal(nieuwMat, uNieuw))
    oud.position.y = 0.003; nieuw.position.y = 0.005
    oud.receiveShadow = nieuw.receiveShadow = true; groep.add(oud, nieuw)
    spiegel?.dispose()
    const sp = new Reflector(vloerVlak(giet, true), { shader: SPIEGEL, clipBias: 0.003, textureWidth: Math.round(doek.clientWidth * 0.4), textureHeight: Math.round(doek.clientHeight * 0.4) })
    const mat = sp.material as THREE.ShaderMaterial
    mat.transparent = true; mat.depthWrite = false; mat.blending = THREE.AdditiveBlending
    mat.polygonOffset = true; mat.polygonOffsetFactor = -8; mat.polygonOffsetUnits = -8
    mat.uniforms.uO.value.copy(o)
    const voor = sp.onBeforeRender.bind(sp)
    sp.onBeforeRender = (...a: Parameters<typeof sp.onBeforeRender>) => {
      const bg = scene.background, fog = scene.fog; scene.background = zwart; scene.fog = null; grond.visible = false; rasterVlak.visible = false
      voor(...a)
      scene.background = bg; scene.fog = fog; grond.visible = true; rasterVlak.visible = true
    }
    sp.rotation.x = -Math.PI / 2; sp.position.y = 0.01; groep.add(sp); spiegel = sp

    // straal van boven
    straal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.6, 20), vloerMat(DEKVLOER))
    straal.position.set(o.x, 0.8, o.y); straal.scale.y = 0; groep.add(straal)

    // lijnen van de tekening: elke wand als rechthoek
    const pos: number[] = []
    p.wanden.forEach(w => {
      const c = [[w[0], w[1]], [w[2], w[1]], [w[2], w[3]], [w[0], w[3]]]
      for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; pos.push(a[0], 0.004, a[1], b[0], 0.004, b[1]) }
    })
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    lijnen = new THREE.LineSegments(lg, lijnMat); lijnAantal = pos.length / 3; groep.add(lijnen)

    // muren: de muren aan de kant van de camera laag (kijkdoos), de rest op plafondhoogte
    const muurMat = new THREE.MeshStandardMaterial({ color: '#EEE9E1', roughness: 0.9 })
    const kapMat = new THREE.MeshStandardMaterial({ color: '#2A2520', roughness: 0.8 })
    p.wanden.forEach(w => {
      const bx = Math.max(0.05, w[2] - w[0]), bz = Math.max(0.05, w[3] - w[1])
      const cx = (w[0] + w[2]) / 2, cz = (w[1] + w[3]) / 2
      const voor = cz > z1 - (z1 - z0) * 0.08 || cx > x1 - (x1 - x0) * 0.08
      const h = voor ? 0.5 : 2.6
      const g = new THREE.BoxGeometry(bx, h, bz); g.translate(0, h / 2, 0)
      const m = new THREE.Mesh(g, [muurMat, muurMat, kapMat, muurMat, muurMat, muurMat])
      m.position.set(cx, 0, cz); m.scale.y = 0.001; m.castShadow = m.receiveShadow = true; m.visible = false
      groep.add(m); muren.push({ mesh: m, d: Math.hypot(cx - o.x, cz - o.y) / rMax, h })
    })

    // meubels in de voorbeeldwoning
    if (p.meubels) {
      const stof = new THREE.MeshStandardMaterial({ color: '#CDBFA8', roughness: 1 })
      const eik = new THREE.MeshStandardMaterial({ color: '#A57D55', roughness: 0.6 })
      const wit = new THREE.MeshStandardMaterial({ color: '#F1EEE8', roughness: 0.55 })
      const blad = new THREE.MeshStandardMaterial({ color: '#2C2B29', roughness: 0.35, metalness: 0.1 })
      const groen = new THREE.MeshStandardMaterial({ color: '#506B47', roughness: 0.9 })
      const pot = new THREE.MeshStandardMaterial({ color: '#B8A58E', roughness: 0.8 })
      const doos = (b: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material, r = 0.04) => {
        const m = new THREE.Mesh(new RoundedBoxGeometry(b, h, d, 3, r), mat); m.position.set(x, y + h / 2, z); m.castShadow = m.receiveShadow = true; return m
      }
      const stuk = (onderdelen: THREE.Object3D[], x: number, z: number) => {
        const g = new THREE.Group(); onderdelen.forEach(o2 => g.add(o2)); g.position.set(x, 0, z); g.scale.setScalar(0.001); groep.add(g)
        meubels.push({ obj: g, d: Math.hypot(x - o.x, z - o.y) / rMax })
      }
      stuk([doos(2.5, 0.42, 0.95, 0, 0, 0, stof, 0.08), doos(2.5, 0.42, 0.22, 0, 0.42, 0.37, stof, 0.08), doos(0.95, 0.42, 1.2, -0.78, 0, -1.05, stof, 0.08)], 2.4, 6.3)
      stuk([doos(0.9, 0.36, 0.9, 0, 0, 0, eik, 0.2)], 2.6, 4.9)
      stuk([doos(1.7, 0.04, 0.9, 0, 0.72, 0, eik, 0.015), doos(0.08, 0.72, 0.08, -0.75, 0, -0.35, blad, 0.01), doos(0.08, 0.72, 0.08, 0.75, 0, -0.35, blad, 0.01), doos(0.08, 0.72, 0.08, -0.75, 0, 0.35, blad, 0.01), doos(0.08, 0.72, 0.08, 0.75, 0, 0.35, blad, 0.01)], 5.6, 5.3)
      stuk([doos(2.8, 0.86, 0.9, 0, 0, 0, wit, 0.02), doos(2.9, 0.04, 1.0, 0, 0.86, 0, blad, 0.01)], 3.4, 2.1)
      stuk([doos(3.7, 0.86, 0.62, 0, 0, 0, wit, 0.02), doos(3.7, 0.04, 0.64, 0, 0.86, 0, blad, 0.01), doos(1.2, 2.3, 0.62, -2.45, 0, 0, wit, 0.02)], 2.45 + 0.3, 0.62)
      stuk([doos(0.42, 0.4, 0.42, 0, 0, 0, pot, 0.12), (() => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), groen); b.position.y = 0.85; b.scale.y = 1.25; b.castShadow = true; return b })()], 6.6, 6.7)
    }

    // zon en schaduwcamera passend bij de woning
    zon.position.set(midden.x - grootte * 0.55, grootte * 0.9, midden.z + grootte * 0.75); zon.target.position.copy(midden)
    const sc = zon.shadow.camera; sc.left = sc.bottom = -grootte * 0.85; sc.right = sc.top = grootte * 0.85; sc.near = 0.5; sc.far = grootte * 4; sc.updateProjectionMatrix()
    rasterVlak.position.set(midden.x, 0.0005, midden.z); rasterVlak.scale.setScalar(Math.max(1, grootte / 10))
  }

  function camera(t: number) {
    const k = zacht(tussen(t, T.camera)), asp = Math.max(1, 1.25 / cam.aspect)
    const boven = new THREE.Vector3(midden.x, grootte * 1.7 * asp, midden.z + 0.01)
    const schuin = new THREE.Vector3(midden.x + grootte * 0.72 * asp, grootte * 0.92 * asp, midden.z + grootte * 1.12 * asp)
    const p = boven.lerp(schuin, k)
    if (t > T.foto[1]) { const a = (t - T.foto[1]) * 0.05; const r = new THREE.Vector3().subVectors(p, midden); r.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(a) * 0.12); p.copy(midden).add(r) }
    cam.position.copy(p); cam.lookAt(midden.x, 0, midden.z - grootte * 0.04 * k)
  }

  function teken(nu: number) {
    if (!actief) return
    let t = (nu - t0) / 1000
    if (rustig) t = T.foto[1] + 0.01
    camera(t)
    // 1. lijnen
    if (lijnen) { lijnen.geometry.setDrawRange(0, Math.floor(lijnAantal * uit(tussen(t, T.lijnen)) / 2) * 2); lijnMat.opacity = 1 - tussen(t, [3.4, 4.6]) * 0.85 }
    rasterVlak.material.opacity = 1 - tussen(t, T.foto)
    // 2. muren
    muren.forEach(m => { const k = uit(tussen(t, [T.muren[0] + m.d * 0.9, T.muren[0] + m.d * 0.9 + 1.0])); m.mesh.visible = k > 0.001; m.mesh.scale.y = Math.max(0.001, k) })
    // 3. gietvloer
    const gietT = t - gietStart
    const g = gietT < 0 ? 0 : uit(Math.min(1, gietT / (T.giet[1] - T.giet[0])))
    uNieuw.r.value = g * rMax
    if (spiegel) { const u = (spiegel.material as THREE.ShaderMaterial).uniforms; u.uR.value = Math.max(uNieuw.r.value, uOud.r.value > 100 ? 1e3 : 0); u.uSterkte.value = 0.04 + 0.06 * zacht(tussen(t, T.foto)) }
    oudMat.color.copy(doelOud); nieuwMat.color.copy(doelNieuw); (straal.material as THREE.MeshPhysicalMaterial).color.copy(doelNieuw)
    const s = gietT < -0.25 ? 0 : gietT < 0.15 ? (gietT + 0.25) / 0.4 : gietT < 1.6 ? 1 : Math.max(0, 1 - (gietT - 1.6) / 0.35)
    straal.scale.y = Math.max(0.001, s); straal.position.y = 1.6 - 0.8 * s; straal.visible = s > 0.01
    if (gietT > T.giet[1] - T.giet[0] + 0.05 && !doelOud.equals(doelNieuw)) { doelOud.copy(doelNieuw); uOud.r.value = 1e3 }
    // 4. foto
    const f = zacht(tussen(t, T.foto))
    renderer.toneMappingExposure = 0.95 - f * 0.17
    zon.intensity = 0.5 + f * 1.25; hemi.intensity = 1.1 - f * 0.65
    scene.environmentIntensity = 0.4 + f * 0.5
    ;(grond.material as THREE.MeshStandardMaterial).color.copy(papier).lerp(warm, f)
    meubels.forEach(m => { const k = uit(tussen(t, [T.foto[0] + m.d * 0.8, T.foto[0] + m.d * 0.8 + 0.9])); m.obj.scale.setScalar(Math.max(0.001, k)) })
    // fase voor de knoppen
    const nf = t < T.muren[0] ? 0 : t < T.giet[0] - 0.2 ? 1 : t < T.foto[0] ? 2 : 3
    if (nf !== fase) { fase = nf; opFase(nf) }
    // daarna steeds een andere kleur
    if (!rustig && !zelfGekozen && t > T.foto[1] && gietT > T.wissel) { kleurIdx = (kleurIdx + 1) % START_KLEUREN.length; nieuweGiet(KLEUREN.find(k => k.id === START_KLEUREN[kleurIdx])!.hex, t) }
    renderer.render(scene, cam)
  }

  function nieuweGiet(hex: string, t: number) {
    doelOud.copy(doelNieuw); uOud.r.value = 1e3
    doelNieuw = new THREE.Color(hex); gietStart = t
    ;(straal.material as THREE.MeshPhysicalMaterial).color.set(hex)
  }

  const maat = () => {
    const w = doek.clientWidth, h = doek.clientHeight
    renderer.setSize(w, h, false); cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(maat); ro.observe(doek); maat()
  const io = new IntersectionObserver(([e]) => { actief = e.isIntersecting })
  io.observe(doek)
  renderer.setAnimationLoop(teken)

  const start = (p: Plan) => {
    bouw(p); t0 = performance.now(); fase = -1; zelfGekozen = false; kleurIdx = 0
    doelOud = new THREE.Color(DEKVLOER); doelNieuw = new THREE.Color(KLEUREN.find(k => k.id === START_KLEUREN[0])!.hex)
    uOud.r.value = 0; gietStart = T.giet[0]
    if (rustig) { doelOud.copy(doelNieuw); uOud.r.value = 1e3; gietStart = -100 }
  }
  start(VOORBEELD)
  return {
    start,
    giet: hex => { zelfGekozen = true; const t = (performance.now() - t0) / 1000; if (rustig) { doelOud.set(hex); doelNieuw.set(hex) } else nieuweGiet(hex, Math.max(t, T.foto[0])) },
    stop: () => { renderer.setAnimationLoop(null); ro.disconnect(); io.disconnect(); renderer.dispose(); pmrem.dispose(); doek.removeChild(renderer.domElement) },
    fase: () => fase,
  }
}

/* ---------------------------------------------------------------- het scherm */

export default function GietvloerHeld() {
  const doek = useRef<HTMLDivElement>(null)
  const sc = useRef<Scene | null>(null)
  const bestand = useRef<HTMLInputElement>(null)
  const [fase, setFase] = useState(0)
  const [geenWebgl, setGeenWebgl] = useState(false)
  const [kleur, setKleur] = useState('antraciet')
  const [lezen, setLezen] = useState('')
  const [fout, setFout] = useState('')
  const [eigen, setEigen] = useState<string | null>(null)

  useEffect(() => {
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const s = maakScene(doek.current!, setFase, rustig)
    if (!s) { setGeenWebgl(true); return }
    sc.current = s
    // Staat er al een tekening in Mijn woning, dan meteen die woning.
    try {
      const o = JSON.parse(localStorage.getItem(WONING_OPSLAG) || 'null')
      if (o?.lagen?.length) { s.start(naarPlan(o.lagen[0], o.giet ?? null, 0)); setEigen(o.bron ?? 'je tekening') }
    } catch { /* geen woning */ }
    return () => { s.stop(); sc.current = null }
  }, [])

  const kies = async (f?: File | null) => {
    if (!f) return
    if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { setFout('Dit is geen PDF. Kies de tekening als PDF-bestand.'); return }
    setFout(''); setLezen('Tekening openen…')
    try {
      const data = new Uint8Array(await f.arrayBuffer())
      let pdfjs: unknown
      try { pdfjs = await laadPdfJs() } catch { throw new Error('De PDF-lezer kon niet laden. Controleer je verbinding en probeer het opnieuw.') }
      setLezen('Wanden en ruimtes lezen…')
      const lagen = await leesPdf(pdfjs, data)
      if (!lagen.length) throw new Error('We vonden geen wanden in deze PDF. Dat gebeurt bij een scan of foto van een tekening. Een PDF die je van de aannemer of makelaar kreeg werkt meestal wel.')
      const giet: Record<string, boolean> = {}
      lagen[0].ruimtes.forEach(r => { if (!NIET_GIET.test(r.naam)) giet['0:' + r.id] = true })
      try {
        const oud = JSON.parse(localStorage.getItem(WONING_OPSLAG) || 'null')
        localStorage.setItem(WONING_OPSLAG, JSON.stringify({ lagen, bron: f.name, kleur: 'zand', giet, deuren: {}, ...(oud?.project ? { project: oud.project } : {}) }))
      } catch { /* privévenster: de film werkt toch */ }
      window.dispatchEvent(new Event('bylder:woning'))
      sc.current?.start(naarPlan(lagen[0], giet, 0))
      setEigen(f.name); setLezen('')
      doek.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } catch (e) { setLezen(''); setFout((e as Error).message) }
  }

  const giet = (id: string) => { setKleur(id); sc.current?.giet(KLEUREN.find(k => k.id === id)!.hex) }
  const naarFoto = () => document.getElementById('gv-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="gh" aria-labelledby="gh-titel">
      <style>{CSS}</style>
      <div className="gh-tekst">
        <p className="gh-oog">Gietvloer · ontwerpen</p>
        <h1 id="gh-titel">Zie je gietvloer in je eigen woning, voordat hij gegoten is.</h1>
        <p className="gh-lead">Upload de bouwtekening van je aannemer. Wij zetten de muren op, gieten de vloer in de kleur die jij kiest en laten zien hoe het wordt.</p>
        <div className="gh-knoppen">
          <button type="button" className="gh-knop" onClick={() => bestand.current?.click()} disabled={!!lezen}>
            <UploadSimple size={19} weight="bold" aria-hidden="true" />{lezen || (eigen ? 'Andere tekening' : 'Upload je bouwtekening')}
          </button>
          <input ref={bestand} type="file" accept="application/pdf,.pdf" className="gh-verborgen" aria-label="Bouwtekening als PDF" onChange={e => { kies(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="gh-knop gh-knop-licht" onClick={naarFoto}><ImageSquare size={19} aria-hidden="true" />Begin met een foto</button>
        </div>
        {fout ? <p className="gh-fout" role="alert">{fout}</p>
          : <p className="gh-klein">{eigen ? <><Check size={14} weight="bold" aria-hidden="true" /> Dit is jouw woning, uit {eigen}. Kies hieronder de ruimtes.</> : 'PDF van je aannemer of makelaar. Je tekening blijft in je browser.'}</p>}
        <div className="gh-kleuren" role="radiogroup" aria-label="Giet de vloer in een kleur">
          <span>Giet in</span>
          {['kalkwit', 'zandbeige', 'betongrijs', 'taupe', 'antraciet'].map(id => {
            const k = KLEUREN.find(x => x.id === id)!
            return (
              <button key={id} type="button" role="radio" aria-checked={kleur === id} aria-label={k.naam} title={k.naam} onClick={() => giet(id)} style={{ background: k.hex, color: isLicht(k.hex) ? '#1A1208' : '#F5F0E8' }}>
                {kleur === id && <Check size={14} weight="bold" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <ul className="gh-punten">
          <li>Tot 3 stalen gratis via Dr. Schutz</li><li>PU, epoxy of microcement</li><li>Gratis, zonder account</li>
        </ul>
      </div>
      <div className="gh-beeld">
        <div ref={doek} className="gh-doek" role="img" aria-label="Animatie: een bouwtekening waaruit de muren omhoogkomen, waarna de vloer volloopt met gietvloer en de kamer wordt ingericht." />
        {geenWebgl && <div className="gh-stil" aria-hidden="true" />}
        <ol className="gh-fasen" aria-hidden="true">
          {FASEN.map((f, i) => <li key={f} className={i === fase ? 'nu' : i < fase ? 'klaar' : ''}><b>{i + 1}</b>{f}</li>)}
        </ol>
      </div>
    </section>
  )
}

const CSS = `
.gh{display:grid;gap:0;background:#F2EDE3;border-radius:0 0 28px 28px;overflow:hidden;margin:0 -16px 22px}
@media (min-width:980px){.gh{grid-template-columns:minmax(0,5fr) minmax(0,7fr);margin:0 0 26px;border-radius:28px;min-height:620px}}
.gh-tekst{padding:22px 20px 24px;display:flex;flex-direction:column;justify-content:center;order:2}
@media (min-width:980px){.gh-tekst{order:1;padding:44px 40px}}
.gh-oog{font:700 12px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#B85C38;margin:0 0 12px}
.gh h1{font-size:clamp(1.85rem,3.4vw,2.9rem);line-height:1.04;letter-spacing:-.04em;font-weight:800;color:#1A1208;margin:0 0 14px;text-wrap:balance}
.gh-lead{font-size:16.5px;line-height:1.6;color:rgba(61,46,30,.74);margin:0 0 20px;max-width:46ch}
.gh-knoppen{display:flex;flex-wrap:wrap;gap:10px}
.gh-knop{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:52px;padding:13px 20px;border-radius:14px;border:0;background:#1A1208;color:#F5F0E8;font-weight:800;font-size:16px;font-family:inherit;cursor:pointer;box-shadow:0 14px 30px -14px rgba(26,18,8,.55);transition:transform .15s,box-shadow .15s}
.gh-knop:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 18px 34px -14px rgba(26,18,8,.6)}
.gh-knop:disabled{opacity:.75;cursor:progress}
.gh-knop-licht{background:#fff;color:#1A1208;box-shadow:inset 0 0 0 1px rgba(61,46,30,.16)}
@media (max-width:520px){.gh-knop{width:100%}}
.gh-verborgen{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.gh-klein{display:flex;gap:6px;align-items:center;margin:10px 0 0;font-size:13.5px;color:rgba(61,46,30,.62)}
.gh-klein svg{color:#3D5A3E;flex:none}
.gh-fout{margin:10px 0 0;font-size:14px;font-weight:600;color:#A3402A}
.gh-kleuren{display:flex;align-items:center;gap:8px;margin:20px 0 0;flex-wrap:wrap}
.gh-kleuren span{font-size:13.5px;font-weight:700;color:#1A1208;margin-right:2px}
.gh-kleuren button{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(26,18,8,.16),0 6px 14px -8px rgba(26,18,8,.5);cursor:pointer;transition:transform .15s}
.gh-kleuren button:hover{transform:scale(1.08)}
.gh-kleuren button[aria-checked=true]{box-shadow:0 0 0 2px #1A1208}
.gh-punten{list-style:none;padding:0;margin:18px 0 0;display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:rgba(61,46,30,.7)}
.gh-punten li::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#3D5A3E;margin-right:7px;vertical-align:middle}
.gh-beeld{position:relative;order:1;height:min(46vh,400px);min-height:300px}
@media (min-width:980px){.gh-beeld{order:2;height:auto;min-height:620px}}
.gh-doek{position:absolute;inset:0}
.gh-doek canvas{display:block;width:100%!important;height:100%!important}
.gh-stil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(242,237,227,0) 60%,#F2EDE3),repeating-linear-gradient(0deg,rgba(61,90,62,.12) 0 1px,transparent 1px 32px),repeating-linear-gradient(90deg,rgba(61,90,62,.12) 0 1px,transparent 1px 32px)}
.gh-fasen{position:absolute;left:12px;right:12px;top:12px;list-style:none;margin:0;padding:6px;display:flex;gap:4px;justify-content:center;flex-wrap:wrap;pointer-events:none}
.gh-fasen li{display:flex;align-items:center;gap:6px;padding:6px 11px 6px 6px;border-radius:999px;background:rgba(255,255,255,.72);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-size:12.5px;font-weight:700;color:rgba(26,18,8,.45);transition:background .3s,color .3s}
.gh-fasen b{display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:rgba(26,18,8,.08);font-size:11px}
.gh-fasen li.nu{background:#1A1208;color:#F5F0E8}.gh-fasen li.nu b{background:#E8A87C;color:#1A1208}
.gh-fasen li.klaar{color:#3D5A3E}.gh-fasen li.klaar b{background:rgba(61,90,62,.16)}
@media (max-width:520px){.gh-fasen li:not(.nu){font-size:0;gap:0;padding:6px}.gh-fasen li{font-size:12px}}
`
