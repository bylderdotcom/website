// KOPIE van app/src/components/kast/Kast3D.tsx (bylderdotcom/app). Wijzig beide tegelijk.
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Bouw } from '@/lib/kast/rekenmodel'
import type { Afwerking } from '@/lib/kast/ontwerp'

// Het 3D-beeld van een kast, opgebouwd uit precies dezelfde delen als de zaaglijst.
// Deuren draaien om hun echte scharnierkant, lades schuiven uit.

// Camera op afstand zetten zodat de hele kast in beeld is, ook in een smal of
// staand venster (telefoon). Draait opnieuw bij elke maatwijziging van het venster,
// in de richting waarin de camera nu kijkt.
function kadreer(s: { cam: THREE.PerspectiveCamera; ctr: OrbitControls; kader?: { midden: THREE.Vector3; grootte: number } }) {
  if (!s.kader) return
  const afstand = Math.max(3, s.kader.grootte * 1.95) * Math.max(1, 1.5 / s.cam.aspect)
  const richting = s.cam.position.clone().sub(s.ctr.target).normalize()
  s.cam.position.copy(s.ctr.target).addScaledVector(richting, afstand)
  s.ctr.update()
}

type Props = { bouw: Bouw; afwerking: Afwerking; binnen: 'wit' | 'zelfde'; open: boolean; hoogte?: number | string; draai?: boolean; achtergrond?: string }

export default function Kast3D({ bouw, afwerking, binnen, open, hoogte = 460, draai = false, achtergrond = '#EDE9E2' }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const staat = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; ctr: OrbitControls; groep: THREE.Group | null; kader?: { midden: THREE.Vector3; grootte: number }; basisHoek: number | null; zwaai: boolean; beweeg: { obj: THREE.Object3D; doel: number; soort: 'draai' | 'schuif'; as?: THREE.Vector3 }[]; open: boolean } | null>(null)

  // eenmalig: renderer, licht, camera
  useEffect(() => {
    const el = box.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.95
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    // setSize(..., false) laat de CSS-maat met rust; zonder deze regel is het doek
    // op een scherm met devicePixelRatio 2 of 3 twee à drie keer te groot en zie je
    // alleen de linkerbovenhoek van de kast.
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#EDE9E2')
    const cam = new THREE.PerspectiveCamera(38, 1, 0.05, 60)
    const ctr = new OrbitControls(cam, renderer.domElement)
    ctr.enableDamping = true; ctr.maxPolarAngle = Math.PI * 0.52; ctr.minDistance = 1; ctr.maxDistance = 12
    scene.add(new THREE.HemisphereLight('#FFFFFF', '#B9A88E', 1.6))
    const zon = new THREE.DirectionalLight('#FFF3E2', 2.6)
    zon.position.set(2.6, 3.8, 6.5); zon.castShadow = true; zon.shadow.mapSize.set(2048, 2048); zon.shadow.bias = -0.0004
    Object.assign(zon.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 16 })
    scene.add(zon, zon.target)
    const vul = new THREE.DirectionalLight('#E8EEFF', 0.6); vul.position.set(-5, 2, 4); scene.add(vul)
    staat.current = { renderer, scene, cam, ctr, groep: null, basisHoek: null, zwaai: false, beweeg: [], open: false }
    // Wie zelf gaat draaien, neemt het over: het zwaaien stopt.
    ctr.addEventListener('start', () => { if (staat.current) staat.current.zwaai = false })

    const maat = () => { const r = el.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix(); kadreer(staat.current!) }
    const ro = new ResizeObserver(maat); ro.observe(el); maat()
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const loop = () => {
      const s = staat.current!
      s.beweeg.forEach(b => {
        const doel = s.open ? b.doel : 0
        if (b.soort === 'draai') { const nu = b.obj.rotation.y; b.obj.rotation.y = reduce ? doel : nu + (doel - nu) * 0.1 }
        else { const nu = b.obj.userData.t ?? 0; const t = reduce ? doel : nu + (doel - nu) * 0.1; b.obj.userData.t = t; b.obj.position.copy(b.obj.userData.basis).addScaledVector(b.as!, t) }
      })
      // Zachtjes heen en weer rond het vooraanzicht, niet helemaal rond: een
      // inbouwkast heeft geen achterkant om naar te kijken.
      if (s.zwaai && s.basisHoek !== null) {
        const doel = s.basisHoek + Math.sin(performance.now() / 1000 * 0.45) * 0.5
        const nu = ctr.getAzimuthalAngle()
        cam.position.sub(ctr.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), doel - nu).add(ctr.target)
      }
      ctr.update(); renderer.render(scene, cam); raf = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); ctr.dispose(); renderer.dispose(); el.removeChild(renderer.domElement) }
  }, [])

  useEffect(() => { if (staat.current) staat.current.open = open }, [open])
  useEffect(() => {
    const s = staat.current; if (!s) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    s.ctr.autoRotate = false; s.zwaai = draai && !reduce
    s.scene.background = new THREE.Color(achtergrond)
  }, [draai, achtergrond])

  // bij elk nieuw ontwerp: scène opnieuw opbouwen
  useEffect(() => {
    const s = staat.current; if (!s) return
    if (s.groep) { s.scene.remove(s.groep); s.groep.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose() } }) }
    const { groep, beweeg, midden, grootte } = bouwScene(bouw, afwerking, binnen)
    s.scene.add(groep); s.groep = groep; s.beweeg = beweeg
    // camera: schuin voor de kast, alles in beeld
    const hoek = bouw.muren.length === 2
    const richting = new THREE.Vector3(hoek ? 1 : 0.35, 0.42, 1).normalize()
    if (bouw.spiegel) richting.x *= -1
    s.kader = { midden, grootte }
    s.ctr.target.copy(midden)
    s.cam.position.copy(midden).add(richting)
    kadreer(s)
    // Draaien blijft aan de voorkant: tot ongeveer 45 graden naar links en rechts.
    s.basisHoek = s.ctr.getAzimuthalAngle()
    s.ctr.minAzimuthAngle = s.basisHoek - 0.8; s.ctr.maxAzimuthAngle = s.basisHoek + 0.8
  }, [bouw, afwerking, binnen])

  return <div ref={box} style={{ width: '100%', height: hoogte, borderRadius: 18, overflow: 'hidden', background: achtergrond, touchAction: 'none' }} />
}

function houtTextuur(hex: string) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 1024
  const g = c.getContext('2d')!
  g.fillStyle = hex; g.fillRect(0, 0, 256, 1024)
  const basis = new THREE.Color(hex)
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * 256, w = 0.6 + Math.random() * 2.2
    const k = basis.clone().multiplyScalar(0.72 + Math.random() * 0.22)
    g.strokeStyle = `#${k.getHexString()}`; g.globalAlpha = 0.35 + Math.random() * 0.4; g.lineWidth = w
    g.beginPath(); g.moveTo(x, 0)
    for (let y = 0; y <= 1024; y += 64) g.lineTo(x + Math.sin(y / 140 + i) * 4, y)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function bouwScene(b: Bouw, afw: Afwerking, binnen: 'wit' | 'zelfde') {
  const W = new THREE.Group(); W.scale.set(b.spiegel ? -0.01 : 0.01, 0.01, 0.01)
  const glans = afw.glans === 'hoogglans' ? 0.18 : afw.glans === 'zijdeglans' ? 0.38 : 0.62
  const hout = afw.soort !== 'lak' ? houtTextuur(afw.hex) : null
  const std = (c: string, r = 0.6, map: THREE.Texture | null = null) => new THREE.MeshStandardMaterial({ color: map ? '#FFFFFF' : c, roughness: r, metalness: 0, map })
  const M = {
    front: std(afw.hex, glans, hout), plint: std(new THREE.Color(afw.hex).multiplyScalar(0.8).getStyle(), glans, hout),
    wit: std('#F2F0EB'), rug: std('#ECEAE5'), muur: std('#EEEAE3', 0.9), vloer: std('#B48A5E', 0.75),
    zwart: new THREE.MeshStandardMaterial({ color: '#121212', roughness: 0.4, metalness: 0.6 }),
  }
  const korpusM = binnen === 'wit' ? M.wit : M.front
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m }
  const blok = (bx: number[], mat: THREE.Material) => {
    const [x0, x1, y0, y1, z0, z1] = bx
    const m = mesh(new THREE.BoxGeometry(Math.max(0.05, x1 - x0), Math.max(0.05, y1 - y0), Math.max(0.05, z1 - z0)), mat)
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); return m
  }

  // kamer
  const bb = new THREE.Box3()
  b.delen.forEach(d => bb.expandByPoint(new THREE.Vector3(d.b[0], d.b[2], d.b[4])).expandByPoint(new THREE.Vector3(d.b[1], d.b[3], d.b[5])))
  b.rond.forEach(r => bb.expandByPoint(new THREE.Vector3(r.c[0] + r.r * Math.sign(Math.sin(r.theta + Math.PI / 4)), r.y1, r.c[1] + r.r * Math.sign(Math.cos(r.theta + Math.PI / 4)))))
  const hoogte = Math.max(260, bb.max.y)
  b.muren.forEach(m => {
    const lx = Math.abs(m.x1 - m.x0), lz = Math.abs(m.z1 - m.z0)
    const dik = 12
    const bx = lx > lz ? [Math.min(m.x0, m.x1) - (m.z0 === 0 && m.x0 === 0 ? dik : 0), Math.max(m.x0, m.x1), 0, hoogte, m.z0 - dik, m.z0]
      : [m.x0 - dik, m.x0, 0, hoogte, Math.min(m.z0, m.z1), Math.max(m.z0, m.z1)]
    const w = blok(bx, M.muur); w.castShadow = false; W.add(w)
  })
  const vloer = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), M.vloer); vloer.rotation.x = -Math.PI / 2; vloer.position.set(200, 0, 200); vloer.receiveShadow = true; W.add(vloer)

  b.delen.forEach(d => {
    const mat = d.rol === 'rug' ? M.rug : d.rol === 'plint' ? M.plint : d.zicht || d.rol === 'front' || d.rol === 'vul' || d.rol === 'pas' || d.rol === 'kopwand' ? M.front : korpusM
    W.add(blok(d.b, mat))
  })
  b.rond.forEach(r => {
    const h = r.y1 - r.y0
    if (r.type === 'schijf') {
      const m = mesh(new THREE.CylinderGeometry(r.r, r.r, h, 48, 1, false, r.theta, Math.PI / 2), M.front)
      m.position.set(r.c[0], r.y0 + h / 2, r.c[1]); W.add(m)
    } else {
      const s = new THREE.Shape(), n = 48, t = r.dikte
      for (let i = 0; i <= n; i++) { const a = r.theta + (i / n) * Math.PI / 2; const p: [number, number] = [r.r * Math.sin(a), r.r * Math.cos(a)]; if (i) s.lineTo(...p); else s.moveTo(...p) }
      for (let i = n; i >= 0; i--) { const a = r.theta + (i / n) * Math.PI / 2; s.lineTo((r.r - t) * Math.sin(a), (r.r - t) * Math.cos(a)) }
      const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: 48 }); g.rotateX(Math.PI / 2); g.translate(0, h, 0)
      const m = mesh(g, r.plint ? M.plint : M.front); m.position.set(r.c[0], r.y0, r.c[1]); W.add(m)
    }
  })

  const beweeg: { obj: THREE.Object3D; doel: number; soort: 'draai' | 'schuif'; as?: THREE.Vector3 }[] = []
  b.fronten.forEach(f => {
    const [, x1, , , , z1] = f.b
    const plaat = blok(f.b, M.front)
    const normaal = f.as === 'x' ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0)
    const voor = f.as === 'x' ? z1 : x1
    const grepen: THREE.Mesh[] = []
    if (f.greep) {
      const gw = f.greep.liggend ? 15 : 1.2, gh = f.greep.liggend ? 1.2 : 15
      const g = f.as === 'x' ? mesh(new THREE.BoxGeometry(gw, gh, 1.6), M.zwart) : mesh(new THREE.BoxGeometry(1.6, gh, gw), M.zwart)
      if (f.as === 'x') g.position.set(f.greep.pos, f.greep.y, voor + 0.8); else g.position.set(voor + 0.8, f.greep.y, f.greep.pos)
      grepen.push(g)
    }
    if (f.soort === 'deur' && f.scharnier) {
      const piv = new THREE.Group()
      if (f.as === 'x') piv.position.set(f.scharnier.pos, 0, voor); else piv.position.set(voor, 0, f.scharnier.pos)
      ;[plaat, ...grepen].forEach(m => { m.position.sub(piv.position); piv.add(m) })
      const e = f.as === 'x' ? new THREE.Vector3(f.scharnier.richting, 0, 0) : new THREE.Vector3(0, 0, f.scharnier.richting)
      const r90 = new THREE.Vector3(e.z, 0, -e.x)
      const doel = (r90.distanceTo(normaal) < 0.01 ? 1 : -1) * Math.PI / 2 * 0.95
      beweeg.push({ obj: piv, doel, soort: 'draai' }); W.add(piv)
    } else if (f.soort === 'lade') {
      const g = new THREE.Group(); [plaat, ...grepen].forEach(m => g.add(m))
      g.userData.basis = g.position.clone()
      beweeg.push({ obj: g, doel: 30, soort: 'schuif', as: normaal }); W.add(g)
    } else { W.add(plaat); grepen.forEach(m => W.add(m)) }
  })

  const midden = new THREE.Vector3((bb.min.x + bb.max.x) / 2, hoogte * 0.45, (bb.min.z + bb.max.z) / 2).multiplyScalar(0.01)
  if (b.spiegel) midden.x *= -1
  const grootte = Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z, hoogte) / 100
  return { groep: W, beweeg, midden, grootte }
}
