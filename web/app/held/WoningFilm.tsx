'use client'

// De film in de kop van de homepage: wat Bylder met één tekening doet, in zes stappen.
//   0. Tekening   de plattegrond tekent zich lijn voor lijn
//   1. Muren      de wanden komen uit de tekening omhoog
//   2. Gietvloer  de vloer loopt vol vanuit één punt
//   3. Deuren     kozijnloze deuren, plafondhoog, zakken in de openingen
//   4. Kast       de kast op maat bouwt zich op tegen de achterwand
//   5. Zo wordt   licht, glans, schaduw en meubels
// Daarna giet hij de vloer om de paar seconden opnieuw in een andere kleur.
//
// Dezelfde voorbeeldwoning als de plattegrond die hier eerst stond: 10,40 × 7,80 m,
// woonkamer, keuken, hal en berging, zes binnendeuren. Geen tekening van een koper.
// Zonder WebGL of met 'minder beweging' staat meteen het eindbeeld stil.

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { wolkTextuur, rasterTextuur, vloerVlak, vloerMateriaal, SPIEGEL, type Rect } from '../components/gietvloer/drie'
import { KLEUREN } from '../components/gietvloer/gegevens'

/* ---------------------------------------------------------------- de woning */

// Coördinaten van de oude plattegrond (400 × 312 eenheden = 10,40 × 7,80 m).
const U = 0.026
// [x, y, lengte, hoek, buitenmuur]; de openingen ertussen zijn de deuren.
const MUREN: Array<[number, number, number, 0 | 90, boolean]> = [
  [22, 22, 356, 0, true], [378, 22, 268, 90, true], [22, 290, 356, 0, true], [22, 22, 268, 90, true],
  [22, 170, 74, 0, false], [130, 170, 52, 0, false], [216, 170, 30, 0, false],
  [246, 22, 74, 90, false], [246, 130, 116, 90, false], [246, 280, 10, 90, false],
  [246, 220, 38, 0, false], [318, 220, 18, 0, false], [366, 220, 12, 0, false],
]
// Deuropeningen: [x, y, lengte, hoek]. De eerste staat op een kier.
const DEUREN: Array<[number, number, number, 0 | 90]> = [
  [246, 96, 34, 90], [96, 170, 34, 0], [182, 170, 34, 0], [246, 246, 34, 90], [284, 220, 34, 0], [336, 220, 30, 0],
]
const HOOGTE = 2.6
const BINNEN: Rect = [22 * U + 0.15, 22 * U + 0.15, 378 * U - 0.15, 290 * U - 0.15]
const KADER: Rect = [22 * U - 0.15, 22 * U - 0.15, 378 * U + 0.15, 290 * U + 0.15]
// De kast op maat: tegen de achterwand van de woonkamer, plafondhoog, met een open tv-vak.
const KAST = { x: 1.15, z: BINNEN[1], diepte: 0.45, kolommen: [0.6, 0.6, 0.9, 0.6, 0.6], kleur: '#6F8597' }

function wandRect([x, y, l, a, buiten]: [number, number, number, 0 | 90, boolean]): Rect {
  const d = buiten ? 0.3 : 0.1, h = d / 2
  return a === 0 ? [x * U, y * U - h, (x + l) * U, y * U + h] : [x * U - h, y * U, x * U + h, (y + l) * U]
}

/* ---------------------------------------------------------------- tijdlijn */

const T = { lijnen: [0.2, 1.8], camera: [1.4, 3.9], muren: [1.7, 3.6], giet: [3.9, 5.9], deuren: [5.9, 7.5], kast: [7.4, 9.2], foto: [9.2, 10.9], wissel: 8 }
const START: number[] = [0, T.muren[0], T.giet[0], T.deuren[0], T.kast[0], T.foto[0]]
const tussen = (t: number, [a, b]: number[]) => Math.min(1, Math.max(0, (t - a) / (b - a)))
const zacht = (x: number) => x * x * (3 - 2 * x)
const uit = (x: number) => 1 - Math.pow(1 - x, 3)
const DEKVLOER = '#837E76'
const KLEURREEKS = ['antraciet', 'betongrijs', 'zandbeige', 'kalkwit']

/* ---------------------------------------------------------------- de scène */

type Film = { naar: (fase: number) => void; stop: () => void }

function maakFilm(doek: HTMLDivElement, opFase: (f: number) => void, rustig: boolean): Film | null {
  let renderer: THREE.WebGLRenderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }) } catch { return null }
  const klein = window.innerWidth < 760
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, klein ? 1.75 : 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.domElement.setAttribute('aria-hidden', 'true')
  doek.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const papier = new THREE.Color('#F7F3EC'), warm = new THREE.Color('#D3C8B7')
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

  const groep = new THREE.Group(); scene.add(groep)
  const [x0, z0, x1, z1] = KADER
  const midden = new THREE.Vector3((x0 + x1) / 2, 0, (z0 + z1) / 2), grootte = Math.max(x1 - x0, z1 - z0)
  // Gieten vanuit het midden van de woonkamer.
  const o = new THREE.Vector2(3.4, 2.6)
  const rMax = Math.max(...[[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([x, z]) => Math.hypot(x - o.x, z - o.y))) + 0.3

  /* vloer */
  const uOud = { r: { value: 0 }, o: { value: o.clone() } }, uNieuw = { r: { value: 0 }, o: { value: o.clone() } }
  const uDek = { r: { value: 1e3 }, o: { value: o.clone() } }
  const vloerMat = (kleur: THREE.ColorRepresentation) => new THREE.MeshPhysicalMaterial({
    color: kleur, map: wolk, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.25,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  })
  const dek = new THREE.Mesh(vloerVlak([BINNEN]), vloerMateriaal(new THREE.MeshStandardMaterial({ color: DEKVLOER, roughness: 0.97 }), uDek))
  dek.position.y = 0.001; dek.receiveShadow = true; groep.add(dek)
  const oudMat = vloerMat(DEKVLOER), nieuwMat = vloerMat(DEKVLOER)
  nieuwMat.polygonOffsetFactor = -4; nieuwMat.polygonOffsetUnits = -4
  const oud = new THREE.Mesh(vloerVlak([BINNEN]), vloerMateriaal(oudMat, uOud))
  const nieuw = new THREE.Mesh(vloerVlak([BINNEN]), vloerMateriaal(nieuwMat, uNieuw))
  oud.position.y = 0.003; nieuw.position.y = 0.005; oud.receiveShadow = nieuw.receiveShadow = true; groep.add(oud, nieuw)
  const zwart = new THREE.Color('#000')
  const spiegel = new Reflector(vloerVlak([BINNEN], true), { shader: SPIEGEL, clipBias: 0.003, textureWidth: Math.round(doek.clientWidth * 0.4) || 256, textureHeight: Math.round(doek.clientHeight * 0.4) || 256 })
  const sm = spiegel.material as THREE.ShaderMaterial
  sm.transparent = true; sm.depthWrite = false; sm.blending = THREE.AdditiveBlending
  sm.polygonOffset = true; sm.polygonOffsetFactor = -8; sm.polygonOffsetUnits = -8
  sm.uniforms.uO.value.copy(o)
  const voorSpiegel = spiegel.onBeforeRender.bind(spiegel)
  spiegel.onBeforeRender = (...a: Parameters<typeof spiegel.onBeforeRender>) => {
    const bg = scene.background, fog = scene.fog; scene.background = zwart; scene.fog = null; grond.visible = false; rasterVlak.visible = false
    voorSpiegel(...a)
    scene.background = bg; scene.fog = fog; grond.visible = true; rasterVlak.visible = true
  }
  spiegel.rotation.x = -Math.PI / 2; spiegel.position.y = 0.01; groep.add(spiegel)
  const straal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.6, 20), vloerMat(DEKVLOER))
  straal.position.set(o.x, 0.8, o.y); straal.scale.y = 0; groep.add(straal)

  /* lijnen van de tekening */
  const wanden = MUREN.map(wandRect)
  const pos: number[] = []
  wanden.forEach(w => {
    const c = [[w[0], w[1]], [w[2], w[1]], [w[2], w[3]], [w[0], w[3]]]
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; pos.push(a[0], 0.004, a[1], b[0], 0.004, b[1]) }
  })
  // de deuren als draaiboog, zoals op een bouwtekening
  DEUREN.forEach(([x, y, l, a]) => {
    const r = l * U, cx = x * U, cz = y * U, n = 10
    for (let i = 0; i < n; i++) {
      const h0 = (i / n) * Math.PI / 2, h1 = ((i + 1) / n) * Math.PI / 2
      const p = (h: number) => a === 0 ? [cx + Math.cos(h) * r, cz + Math.sin(h) * r] : [cx + Math.sin(h) * r, cz + Math.cos(h) * r]
      const [ax, az] = p(h0), [bx, bz] = p(h1); pos.push(ax, 0.004, az, bx, 0.004, bz)
    }
  })
  const lijnMat = new THREE.LineBasicMaterial({ color: '#2B3A2C', transparent: true })
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  const lijnen = new THREE.LineSegments(lg, lijnMat); groep.add(lijnen)
  const lijnAantal = pos.length / 3

  /* muren: aan de kant van de camera laag (kijkdoos), de rest op plafondhoogte */
  const muurMat = new THREE.MeshStandardMaterial({ color: '#EEE9E1', roughness: 0.9 })
  const kapMat = new THREE.MeshStandardMaterial({ color: '#2A2520', roughness: 0.8 })
  const muren: { mesh: THREE.Mesh; d: number }[] = []
  wanden.forEach(w => {
    const bx = Math.max(0.05, w[2] - w[0]), bz = Math.max(0.05, w[3] - w[1])
    const cx = (w[0] + w[2]) / 2, cz = (w[1] + w[3]) / 2
    const voor = cz > z1 - (z1 - z0) * 0.08 || cx > x1 - (x1 - x0) * 0.08
    const h = voor ? 0.5 : HOOGTE
    const g = new THREE.BoxGeometry(bx, h, bz); g.translate(0, h / 2, 0)
    const m = new THREE.Mesh(g, [muurMat, muurMat, kapMat, muurMat, muurMat, muurMat])
    m.position.set(cx, 0, cz); m.scale.y = 0.001; m.castShadow = m.receiveShadow = true; m.visible = false
    groep.add(m); muren.push({ mesh: m, d: Math.hypot(cx - o.x, cz - o.y) / rMax })
  })

  /* deuren: plafondhoog, zonder kozijn, vlak met de wand */
  const deurMat = new THREE.MeshStandardMaterial({ color: '#D8CDBB', roughness: 0.42, transparent: true, opacity: 0 })
  const deurNaad = new THREE.MeshStandardMaterial({ color: '#2B2723', roughness: 0.6, transparent: true, opacity: 0 })
  const deuren: { obj: THREE.Group; i: number }[] = []
  DEUREN.forEach(([x, y, l, a], i) => {
    const b = l * U - 0.012, dik = 0.045, h = HOOGTE - 0.012
    const blad = new THREE.Mesh(new THREE.BoxGeometry(b, h, dik), deurMat); blad.castShadow = true
    const kruk = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.16, 0.07), deurNaad)
    const scharnier = new THREE.Group()
    blad.position.set(b / 2, h / 2, 0); kruk.position.set(b - 0.09, 1.05, 0)
    scharnier.add(blad, kruk)
    const g = new THREE.Group(); g.add(scharnier)
    g.position.set(x * U + (a === 0 ? 0.006 : 0), 0, y * U + (a === 90 ? 0.006 : 0))
    if (a === 90) g.rotation.y = -Math.PI / 2
    if (i === 0) scharnier.rotation.y = -0.55   // op een kier: je ziet dat het een deur is
    g.visible = false; groep.add(g); deuren.push({ obj: g, i })
  })

  /* de kast op maat */
  const kastMat = new THREE.MeshStandardMaterial({ color: KAST.kleur, roughness: 0.5 })
  const kastBinnen = new THREE.MeshStandardMaterial({ color: '#4E6170', roughness: 0.7 })
  const plankMat = new THREE.MeshStandardMaterial({ color: '#A57D55', roughness: 0.55 })
  const kolommen: { obj: THREE.Group; i: number }[] = []
  let kx = KAST.x
  KAST.kolommen.forEach((b, i) => {
    const g = new THREE.Group(), open = i === 2, h = HOOGTE - 0.01
    if (open) {
      const achter = new THREE.Mesh(new THREE.BoxGeometry(b, h, 0.02), kastBinnen); achter.position.set(0, h / 2, -KAST.diepte / 2 + 0.01)
      const boven = new THREE.Mesh(new THREE.BoxGeometry(b, 1.15, KAST.diepte), kastMat); boven.position.set(0, h - 0.575, 0)
      const onder = new THREE.Mesh(new THREE.BoxGeometry(b, 0.5, KAST.diepte), kastMat); onder.position.set(0, 0.25, 0)
      const plank = new THREE.Mesh(new THREE.BoxGeometry(b - 0.02, 0.03, KAST.diepte - 0.04), plankMat); plank.position.set(0, 0.5, 0.0)
      ;[achter, boven, onder, plank].forEach(m => { m.castShadow = m.receiveShadow = true; g.add(m) })
    } else {
      const korpus = new THREE.Mesh(new RoundedBoxGeometry(b - 0.004, h, KAST.diepte, 2, 0.006), kastMat)
      korpus.position.set(0, h / 2, 0); korpus.castShadow = korpus.receiveShadow = true; g.add(korpus)
      // een smalle greeplijst in het front
      const greep = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.42, 0.012), kastBinnen); greep.position.set(i < 2 ? b / 2 - 0.05 : -b / 2 + 0.05, 1.05, KAST.diepte / 2 + 0.004); g.add(greep)
    }
    g.position.set(kx + b / 2, 0, KAST.z + KAST.diepte / 2); kx += b
    g.scale.set(1, 1, 0.001); g.visible = false; groep.add(g); kolommen.push({ obj: g, i })
  })

  /* meubels */
  const meubels: { obj: THREE.Object3D; d: number }[] = []
  {
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
      const g = new THREE.Group(); onderdelen.forEach(x2 => g.add(x2)); g.position.set(x, 0, z); g.scale.setScalar(0.001); g.visible = false; groep.add(g)
      meubels.push({ obj: g, d: Math.hypot(x - o.x, z - o.y) / rMax })
    }
    // bank met de rug naar de keuken, kijkend naar de kast met het tv-vak
    stuk([doos(2.4, 0.42, 0.95, 0, 0, 0, stof, 0.08), doos(2.4, 0.42, 0.22, 0, 0.42, 0.37, stof, 0.08)], 2.9, 3.55)
    stuk([doos(0.9, 0.36, 0.9, 0, 0, 0, eik, 0.2)], 2.9, 2.35)
    stuk([doos(2.6, 0.86, 0.9, 0, 0, 0, wit, 0.02), doos(2.7, 0.04, 1.0, 0, 0.86, 0, blad, 0.01)], 2.6, 6.0)
    stuk([doos(1.5, 0.04, 0.85, 0, 0.72, 0, eik, 0.015), doos(0.07, 0.72, 0.07, -0.65, 0, -0.33, blad, 0.01), doos(0.07, 0.72, 0.07, 0.65, 0, -0.33, blad, 0.01), doos(0.07, 0.72, 0.07, -0.65, 0, 0.33, blad, 0.01), doos(0.07, 0.72, 0.07, 0.65, 0, 0.33, blad, 0.01)], 5.0, 6.1)
    stuk([doos(0.42, 0.4, 0.42, 0, 0, 0, pot, 0.12), (() => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 16), groen); b.position.y = 0.85; b.scale.y = 1.25; b.castShadow = true; return b })()], 8.9, 1.4)
  }

  zon.position.set(midden.x - grootte * 0.55, grootte * 0.9, midden.z + grootte * 0.75); zon.target.position.copy(midden)
  const sc = zon.shadow.camera; sc.left = sc.bottom = -grootte * 0.85; sc.right = sc.top = grootte * 0.85; sc.near = 0.5; sc.far = grootte * 4; sc.updateProjectionMatrix()
  rasterVlak.position.set(midden.x, 0.0005, midden.z)

  /* tijd */
  // ?filmt=6.5 zet de film stil op dat moment: om elke stap te kunnen nakijken.
  const q = Number(new URLSearchParams(window.location.search).get('filmt'))
  const stil = Number.isFinite(q) && q > 0 ? q : null
  let t0 = performance.now(), gietStart = T.giet[0], kleurIdx = 0, fase = -1, actief = true
  let doelOud = new THREE.Color(DEKVLOER), doelNieuw = new THREE.Color(KLEUREN.find(k => k.id === KLEURREEKS[0])!.hex)

  function camera(t: number) {
    const k = zacht(tussen(t, T.camera)), asp = Math.max(1, 1.25 / cam.aspect)
    const boven = new THREE.Vector3(midden.x, grootte * 1.6 * asp, midden.z + 0.01)
    const schuin = new THREE.Vector3(midden.x + grootte * 0.62 * asp, grootte * 0.86 * asp, midden.z + grootte * 1.08 * asp)
    const p = boven.lerp(schuin, k)
    if (t > T.foto[1]) { const a = (t - T.foto[1]) * 0.05; const r = new THREE.Vector3().subVectors(p, midden); r.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.sin(a) * 0.12); p.copy(midden).add(r) }
    cam.position.copy(p); cam.lookAt(midden.x - 0.4 * k, 0, midden.z - grootte * 0.05 * k)
  }

  function nieuweGiet(hex: string, t: number) {
    doelOud.copy(doelNieuw); uOud.r.value = 1e3
    doelNieuw = new THREE.Color(hex); gietStart = t
  }

  function teken(nu: number) {
    if (!actief) return
    let t = (nu - t0) / 1000
    if (rustig) t = T.foto[1] + 0.01
    if (stil != null) t = stil
    camera(t)
    lijnen.geometry.setDrawRange(0, Math.floor(lijnAantal * uit(tussen(t, T.lijnen)) / 2) * 2)
    lijnMat.opacity = 1 - tussen(t, [3.4, 4.6]) * 0.85
    rasterVlak.material.opacity = 1 - tussen(t, T.foto)
    muren.forEach(m => { const k = uit(tussen(t, [T.muren[0] + m.d * 0.9, T.muren[0] + m.d * 0.9 + 1.0])); m.mesh.visible = k > 0.001; m.mesh.scale.y = Math.max(0.001, k) })
    // gietvloer
    const gietT = t - gietStart
    const g = gietT < 0 ? 0 : uit(Math.min(1, gietT / (T.giet[1] - T.giet[0])))
    uNieuw.r.value = g * rMax
    const u = sm.uniforms; u.uR.value = Math.max(uNieuw.r.value, uOud.r.value > 100 ? 1e3 : 0); u.uSterkte.value = 0.04 + 0.06 * zacht(tussen(t, T.foto))
    oudMat.color.copy(doelOud); nieuwMat.color.copy(doelNieuw); (straal.material as THREE.MeshPhysicalMaterial).color.copy(doelNieuw)
    const s = gietT < -0.25 ? 0 : gietT < 0.15 ? (gietT + 0.25) / 0.4 : gietT < 1.5 ? 1 : Math.max(0, 1 - (gietT - 1.5) / 0.35)
    straal.scale.y = Math.max(0.001, s); straal.position.y = 1.6 - 0.8 * s; straal.visible = s > 0.01
    if (gietT > T.giet[1] - T.giet[0] + 0.05 && !doelOud.equals(doelNieuw)) { doelOud.copy(doelNieuw); uOud.r.value = 1e3 }
    // deuren zakken op hun plek, één voor één
    const dk = (i: number) => uit(tussen(t, [T.deuren[0] + i * 0.2, T.deuren[0] + i * 0.2 + 0.7]))
    deuren.forEach(d => { const k = dk(d.i); d.obj.visible = k > 0.001; d.obj.position.y = (1 - k) * 2.2 })
    deurMat.opacity = deurNaad.opacity = Math.min(1, tussen(t, [T.deuren[0], T.deuren[0] + 0.4]))
    deurMat.transparent = deurMat.opacity < 1; deurNaad.transparent = deurMat.transparent
    // kast: kolom voor kolom uit de wand
    kolommen.forEach(c => { const k = uit(tussen(t, [T.kast[0] + c.i * 0.22, T.kast[0] + c.i * 0.22 + 0.75])); c.obj.visible = k > 0.001; c.obj.scale.z = Math.max(0.001, k); c.obj.position.z = KAST.z + KAST.diepte / 2 * k })
    // eindbeeld
    const f = zacht(tussen(t, T.foto))
    renderer.toneMappingExposure = 0.95 - f * 0.17
    zon.intensity = 0.5 + f * 1.25; hemi.intensity = 1.1 - f * 0.65
    scene.environmentIntensity = 0.4 + f * 0.5
    ;(grond.material as THREE.MeshStandardMaterial).color.copy(papier).lerp(warm, f)
    meubels.forEach(m => { const k = uit(tussen(t, [T.foto[0] + m.d * 0.8, T.foto[0] + m.d * 0.8 + 0.9])); m.obj.visible = k > 0.001; m.obj.scale.setScalar(Math.max(0.001, k)) })
    const nf = START.reduce((n, s0, i) => (t >= s0 ? i : n), 0)
    if (nf !== fase) { fase = nf; opFase(nf) }
    if (!rustig && t > T.foto[1] && gietT > T.wissel) { kleurIdx = (kleurIdx + 1) % KLEURREEKS.length; nieuweGiet(KLEUREN.find(k => k.id === KLEURREEKS[kleurIdx])!.hex, t) }
    renderer.render(scene, cam)
  }

  const maat = () => {
    const w = doek.clientWidth, h = doek.clientHeight
    renderer.setSize(w, h, false); cam.aspect = w / Math.max(1, h); cam.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(maat); ro.observe(doek); maat()
  const io = new IntersectionObserver(([e]) => { actief = e.isIntersecting })
  io.observe(doek)
  renderer.setAnimationLoop(teken)

  return {
    // Naar het begin van een stap: alles daarvoor staat al, de stap speelt opnieuw.
    naar: (n: number) => {
      if (rustig) return
      t0 = performance.now() - START[Math.max(0, Math.min(START.length - 1, n))] * 1000
      if (n <= 2) { doelOud = new THREE.Color(DEKVLOER); uOud.r.value = 0; gietStart = T.giet[0]; kleurIdx = 0; doelNieuw = new THREE.Color(KLEUREN.find(k => k.id === KLEURREEKS[0])!.hex) }
      fase = -1
    },
    stop: () => { renderer.setAnimationLoop(null); ro.disconnect(); io.disconnect(); spiegel.dispose(); renderer.dispose(); pmrem.dispose(); doek.removeChild(renderer.domElement) },
  }
}

/* ---------------------------------------------------------------- het scherm */

export default function WoningFilm({ opFase, naar, opGeenWebgl }: {
  opFase: (f: number) => void
  /** verhoog `n` om naar stap `fase` te springen */
  naar: { fase: number; n: number }
  opGeenWebgl: () => void
}) {
  const doek = useRef<HTMLDivElement>(null)
  const film = useRef<Film | null>(null)
  const terug = useRef(opFase); terug.current = opFase

  useEffect(() => {
    if (!doek.current) return
    const rustig = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const f = maakFilm(doek.current, x => terug.current(x), rustig)
    if (!f) { opGeenWebgl(); return }
    film.current = f
    return () => { f.stop(); film.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { if (naar.n > 0) film.current?.naar(naar.fase) }, [naar])

  return <div ref={doek} className="wf-doek" />
}
