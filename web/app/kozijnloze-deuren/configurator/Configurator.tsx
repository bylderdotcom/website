'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ONTWERPEN, KLEUREN, AFWERKINGEN, FINEREN,
         type Afwerking } from './ontwerpen'
import { maakTexturen } from './texturen'
import KleurKiezer, { dichtstbijzijndeRal } from './KleurKiezer'
import { KRUKKEN, SLOTEN, SCHARNIEREN } from './beslag'
import GerenderdBeeld from './GerenderdBeeld'

// Configurator voor kozijnloze deuren van Classic Next.
//
// De deur is altijd plafondhoog: dat is het product, en het is ook het verhaal —
// dit is geen deur in een gat maar een wandvlak dat opengaat.
//
// Er staan bewust GEEN prijzen in. De tool moet overtuigen met wat je ziet en met
// een sluitende specificatie; het bedrag komt uit de offerte. Een vanafprijs in een
// configurator veroudert net zo stil als een vanafprijs in een zin.

type Deur = {
  // Een deur zonder naam is bij de offerte onbruikbaar: "deur 3" zegt niemand
  // waar hij hangt. De naam is de plek in huis.
  naam: string
  ontwerp: string
  afwerking: Afwerking
  ral: string
  // Vrij gekozen kleur. Leeg = de RAL uit het raster. Wat er geleverd wordt is
  // altijd een RAL; de vrije kleur is er om te zien hoe iets valt.
  vrij: string
  helderheid: number
  fineer: string
  richting: 'binnen' | 'buiten'
  scharnier: 'links' | 'rechts'
  kruk: string
  krukAfwerking: string
  slot: string
  scharnierKleur: string
}

const NIEUW: Deur = {
  naam: '', ontwerp: 'dawn', afwerking: 'gelakt', ral: '9010', vrij: '', helderheid: 1,
  fineer: 'licht',
  richting: 'binnen', scharnier: 'links',
  kruk: 'oma-q-slim', krukAfwerking: 'Zwart', slot: 'loop', scharnierKleur: 'Zwart',
}

// Suggesties, geen keurslijf: het invoerveld blijft vrij tekst.
const PLEKKEN = ['Hal', 'Woonkamer', 'Keuken', 'Slaapkamer', 'Badkamer', 'Berging',
                 'Werkkamer', 'Overloop', 'Kinderkamer', 'Toilet']

const GRONDVERF = '#E7E4DD'

const INKT = 'rgba(61,46,30,'
// Maten van het systeem in meters. Het blad ligt vlak met de wand; de kier is
// wat je van een instuckozijn nog ziet.
const MAAT = {
  blad: 1.05, dikte: 0.05, plafond: 2.72, kier: 0.003, vloerkier: 0.008,
  get hoogte() { return this.plafond - this.kier - this.vloerkier },
}
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

function leesUrl(): Deur[] {
  if (typeof window === 'undefined') return [NIEUW]
  const q = new URLSearchParams(window.location.search).get('deuren')
  if (!q) return [NIEUW]
  const uit = q.split('_').map(s => {
    // Adressen van vóór 10 september misten het veld voor de vrije kleur en
    // kenden nog geen beslag. Aan het aantal velden zie je welke soort het is.
    const v = s.split('~')
    const [ontwerp, afwerking, ral, vrij, fineer, richting, scharnier,
           kruk, krukAfwerking, slot, scharnierKleur, naam] =
      v.length === 7 ? [v[0], v[1], v[2], '', v[3], v[4], v[5], '', '', '', '', v[6]] : v
    if (!ONTWERPEN.some(o => o.id === ontwerp)) return null
    const km = KRUKKEN.find(k => k.id === kruk) ?? KRUKKEN.find(k => k.id === NIEUW.kruk)!
    return {
      naam: decodeURIComponent(naam || ''),
      ontwerp,
      afwerking: (AFWERKINGEN.some(a => a.id === afwerking) ? afwerking : 'gelakt') as Afwerking,
      ral: KLEUREN.some(k => k.ral === ral) ? ral : '9010',
      vrij: /^[0-9a-f]{6}$/i.test(vrij || '') ? `#${vrij}` : '',
      helderheid: 1,
      fineer: FINEREN.some(f => f.id === fineer) ? fineer : 'licht',
      richting: richting === 'buiten' ? 'buiten' : 'binnen',
      scharnier: scharnier === 'rechts' ? 'rechts' : 'links',
      kruk: km.id,
      krukAfwerking: km.varianten.some(v => v.afwerking === krukAfwerking)
        ? krukAfwerking : km.varianten[0].afwerking,
      slot: SLOTEN.some(x => x.id === slot) ? slot : NIEUW.slot,
      scharnierKleur: SCHARNIEREN.some(v => v.afwerking === scharnierKleur)
        ? scharnierKleur : NIEUW.scharnierKleur,
    } as Deur
  }).filter(Boolean) as Deur[]
  return uit.length ? uit : [NIEUW]
}

const naarUrl = (d: Deur[]) =>
  d.map(x => [x.ontwerp, x.afwerking, x.ral, x.vrij.replace('#', ''), x.fineer,
              x.richting, x.scharnier, x.kruk, x.krukAfwerking, x.slot,
              x.scharnierKleur, encodeURIComponent(x.naam)].join('~')).join('_')

export default function Configurator() {
  const doek = useRef<HTMLDivElement>(null)
  const scene = useRef<{
    renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera
    deur: THREE.Mesh; scharnierpunt: THREE.Group; materiaal: THREE.MeshPhysicalMaterial
    wandMat: THREE.MeshStandardMaterial; krukMat: THREE.MeshStandardMaterial
    krukGroep: THREE.Group
    doelHoek: number; doelCam: THREE.Vector3; doelKijk: THREE.Vector3; stop: boolean
  } | null>(null)

  const [deuren, setDeuren] = useState<Deur[]>([NIEUW])
  const [actief, setActief] = useState(0)
  const [sleept, setSleept] = useState(false)
  const [spec, setSpec] = useState(false)
  // De server kent het adres van de bezoeker niet. Lees het pas na de eerste
  // render, anders wijkt de mailto-link af van wat de server stuurde.
  const [gemonteerd, setGemonteerd] = useState(false)
  // De wand in dezelfde kleur als de deur is niet zomaar een weergaveoptie: het
  // ís waar dit product voor bestaat. Zonder kozijn en zonder architraaf worden
  // deur en wand één vlak, en blijft alleen de schaduwvoeg over.
  const [wandGelijk, setWandGelijk] = useState(false)
  // Op afstand zie je pas of dat effect klopt. Van dichtbij beoordeel je de
  // groef, van een meter of vier de wand.
  const [veraf, setVeraf] = useState(false)
  // Dicht is waar het product om draait: dan zie je alleen nog de kier. Op een
  // kier laat zien dát het een deur is, open laat zien hoe hij draait.
  const [stand, setStand] = useState<'dicht' | 'kier' | 'open'>('kier')
  // Gerenderd is de foto uit Blender, 3D is het model om aan te draaien. Twee
  // vragen: "hoe ziet dit eruit" wil een foto, "hoe werkt dit" wil een model.
  const [weergave, setWeergave] = useState<'foto' | '3d'>('foto')
  const [gekopieerd, setGekopieerd] = useState(false)

  const huidig = deuren[actief] ?? NIEUW
  const ontwerp = ONTWERPEN.find(o => o.id === huidig.ontwerp) ?? ONTWERPEN[0]
  const kleur = KLEUREN.find(k => k.ral === huidig.ral) ?? KLEUREN[0]
  const fineer = FINEREN.find(f => f.id === huidig.fineer) ?? FINEREN[0]
  const afwerking = AFWERKINGEN.find(a => a.id === huidig.afwerking) ?? AFWERKINGEN[1]
  const lakKleur = huidig.vrij || kleur.hex
  const toonFoto = weergave === 'foto' && huidig.afwerking !== 'fineer'
  const krukModel = KRUKKEN.find(k => k.id === huidig.kruk) ?? KRUKKEN[0]
  const krukVar = krukModel.varianten.find(v => v.afwerking === huidig.krukAfwerking)
              ?? krukModel.varianten[0]
  const slotType = SLOTEN.find(x => x.id === huidig.slot) ?? SLOTEN[0]
  const scharnierVar = SCHARNIEREN.find(x => x.afwerking === huidig.scharnierKleur)
              ?? SCHARNIEREN[0]
  const naamVan = (d: Deur, i: number) => d.naam.trim() || `Deur ${i + 1}`

  useEffect(() => { setDeuren(leesUrl()); setGemonteerd(true) }, [])

  // ── De scène ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = doek.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    // Een groef is maar een paar pixels breed; op een lage pixelverhouding
    // wordt hij een trapje. Tot 2,5 renderen kost weinig en scheelt veel.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.92
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const sc = new THREE.Scene()
    sc.background = new THREE.Color('#CFC8BC')

    // Omgevingsbelichting. Dit is de grootste sprong in realisme die er te maken
    // is: lak is een spiegelend materiaal, en zonder iets om te weerspiegelen
    // blijft het verf. RoomEnvironment bakt een simpele kamer met lichtvlakken
    // tot een omgevingskaart — daarna vangt de deur die vlakken op als zachte
    // glans, en zien donkere kleuren er als lak uit in plaats van als karton.
    // Geen extern bestand nodig, dus geen laadtijd en geen afhankelijkheid.
    const pmrem = new THREE.PMREMGenerator(renderer)
    sc.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    sc.environmentIntensity = 0.55

    // Bijna frontaal. Schuin van opzij zie je een plaat op zijn kant en kun je
    // geen patroon beoordelen; recht van voren verdwijnt de diepte. Net uit het
    // midden en iets boven ooghoogte laat allebei toe: het vlak én de kier.
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)
    camera.position.set(0.62, 1.46, 4.90)
    camera.lookAt(0, 1.30, 0)

    // Licht van linksboven onder een schuine hoek: dat is wat een groef laat zien.
    // Recht van voren verdwijnt het patroon, precies zoals in een echte gang.
    const zon = new THREE.DirectionalLight(0xfff6ea, 3.0)
    zon.position.set(-3.2, 4.4, 3.0)
    zon.castShadow = true
    zon.shadow.mapSize.set(2048, 2048)
    zon.shadow.camera.left = -3; zon.shadow.camera.right = 3
    zon.shadow.camera.top = 4; zon.shadow.camera.bottom = -0.5
    zon.shadow.bias = -0.0004
    zon.shadow.normalBias = 0.02
    zon.shadow.radius = 3
    sc.add(zon)
    sc.add(new THREE.HemisphereLight(0xf2f6ff, 0x9a9082, 0.42))
    const vul = new THREE.DirectionalLight(0xffffff, 0.32)
    vul.position.set(2.5, 1.6, 2.2)
    sc.add(vul)

    // Wand met opening. De deur zit ín de wand: het profiel is meegestukadoord,
    // dus tussen blad en wand blijft alleen een kier van 3 mm, en het blad ligt
    // vlak met het wandvlak. Eerder was de opening 1,13 m voor een blad van
    // 1,05 m — 40 mm speling per kant, en die zag je.
    const wandMat = new THREE.MeshStandardMaterial({ color: '#A9A296', roughness: 0.86 })
    const wand = new THREE.Group()
    const zij = MAAT.blad / 2 + MAAT.kier
    for (const x of [-(zij + 1.30), zij + 1.30]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(2.60, MAAT.plafond, 0.12), wandMat)
      m.position.set(x, MAAT.plafond / 2, -0.06)
      m.receiveShadow = true
      wand.add(m)
    }
    // De aanslag achter de kier: daar valt het blad tegenaan, en daardoor kijk
    // je door de kier niet de ruimte erachter in.
    const aanslagMat = new THREE.MeshStandardMaterial({ color: '#2A2B2D', roughness: 0.5, metalness: 0.4 })
    const aanslagB = 0.012 + MAAT.kier
    for (const [w, h, x, y] of [
      [aanslagB, MAAT.plafond, -zij + aanslagB / 2, MAAT.plafond / 2],
      [aanslagB, MAAT.plafond, zij - aanslagB / 2, MAAT.plafond / 2],
      [zij * 2, aanslagB, 0, MAAT.plafond - aanslagB / 2],
    ] as [number, number, number, number][]) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), aanslagMat)
      a.position.set(x, y, -MAAT.dikte - 0.006)
      wand.add(a)
    }
    // Wat je ziet als de deur op een kier staat: de ruimte erachter, donker.
    const dag = new THREE.Mesh(new THREE.BoxGeometry(zij * 2 + 0.2, MAAT.plafond, 0.02),
      new THREE.MeshStandardMaterial({ color: '#4A453D', roughness: 1 }))
    dag.position.set(0, MAAT.plafond / 2, -0.30)
    dag.receiveShadow = true
    wand.add(dag)
    sc.add(wand)

    const vloer = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshStandardMaterial({ color: '#A89372', roughness: 0.75 }))
    vloer.rotation.x = -Math.PI / 2
    vloer.receiveShadow = true
    sc.add(vloer)

    // Het deurblad hangt aan een groep die om de scharnierzijde draait.
    const materiaal = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(KLEUREN[0].hex),
      roughness: 0.42, metalness: 0.0,
      clearcoat: 0.1, clearcoatRoughness: 0.5,
      // De studio-omgeving is feller dan een kamer met één raam; op volle
      // sterkte weerspiegelt een donker blad hem als een lichte baan.
      envMapIntensity: 0.4, specularIntensity: 0.35,
      normalScale: new THREE.Vector2(1.15, 1.15),
    })
    const deur = new THREE.Mesh(new THREE.BoxGeometry(MAAT.blad, MAAT.hoogte, MAAT.dikte), materiaal)
    deur.castShadow = true
    deur.receiveShadow = true
    deur.position.set(MAAT.blad / 2, 0, -MAAT.dikte / 2)   // t.o.v. het scharnierpunt
    // De kruk. Bewust een vereenvoudigde vorm en geen ingescand model: de foto
    // in de keuzelijst toont het échte beslag, dit geeft alleen de plek, de maat
    // en de kleur van het metaal in de ruimte. Dat staat ook bij de pagina.
    const krukMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2123'), metalness: 0.85, roughness: 0.3,
    })
    const krukGroep = new THREE.Group()
    const rozet = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.052, 0.012), krukMat)
    rozet.position.set(0, 0, 0.031)
    const steel = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.032, 16), krukMat)
    steel.rotation.x = Math.PI / 2
    steel.position.set(0, 0, 0.05)
    const greep = new THREE.Mesh(new THREE.BoxGeometry(0.118, 0.019, 0.019), krukMat)
    greep.position.set(-0.05, 0, 0.063)
    for (const m of [rozet, steel, greep]) { m.castShadow = true; krukGroep.add(m) }
    // Op grijphoogte (1,05 m) en aan de sluitzijde, dus tegenover het scharnier.
    krukGroep.position.set(0.40, -0.30, 0)
    deur.add(krukGroep)

    const scharnierpunt = new THREE.Group()
    scharnierpunt.position.set(-MAAT.blad / 2, MAAT.vloerkier + MAAT.hoogte / 2, 0)
    scharnierpunt.add(deur)
    sc.add(scharnierpunt)

    const maat = () => {
      const b = el.clientWidth, h = el.clientHeight
      // Zonder de derde parameter zet three óók de CSS-maat van het doek. Met
      // `false` blijft die leeg en toont de browser het canvas op zijn
      // pixelmaat — bij devicePixelRatio 2 dus twee keer te groot, bijgesneden
      // door de container. Je ziet dan een uitvergroot stuk deur in plaats van
      // de deur in de wand.
      renderer.setSize(b, h)
      camera.aspect = b / Math.max(h, 1)
      camera.updateProjectionMatrix()
    }
    maat()
    const ro = new ResizeObserver(maat)
    ro.observe(el)

    const st = { renderer, scene: sc, camera, deur, scharnierpunt, materiaal, wandMat,
                 krukMat, krukGroep,
                 doelHoek: 0,
                 doelCam: camera.position.clone(),
                 doelKijk: new THREE.Vector3(0, 1.30, 0),
                 stop: false }
    scene.current = st

    const _kijk = new THREE.Vector3(0, 1.30, 0)
    const lus = () => {
      if (st.stop) return
      // Zachte aanloop naar de doelhoek; een deur die verspringt oogt goedkoop.
      scharnierpunt.rotation.y += (st.doelHoek - scharnierpunt.rotation.y) * 0.12
      camera.position.lerp(st.doelCam, 0.08)
      _kijk.lerp(st.doelKijk, 0.08)
      camera.lookAt(_kijk)
      renderer.render(sc, camera)
      requestAnimationFrame(lus)
    }
    lus()

    return () => {
      st.stop = true
      ro.disconnect()
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  // ── Ontwerp → groeven op het deurblad ──────────────────────────────────
  useEffect(() => {
    const st = scene.current
    if (!st) return
    const { normalMap, map } = maakTexturen(
      ontwerp.groeven, huidig.afwerking === 'fineer' ? fineer : undefined)
    st.materiaal.normalMap?.dispose()
    st.materiaal.map?.dispose()
    st.materiaal.normalMap = normalMap
    st.materiaal.map = map
    st.materiaal.needsUpdate = true
  }, [ontwerp, huidig.afwerking, fineer])

  // ── Kleur en glans volgen de afwerking ─────────────────────────────────
  //
  // Gegrond is matte grondverf en hoort dof te zijn; gelakt heeft een harde
  // fabriekslak met glans; fineer is hout en krijgt zijn kleur uit de nerf, dus
  // het materiaal zelf blijft wit — anders kleur je het hout.
  useEffect(() => {
    const m = scene.current?.materiaal
    if (!m) return
    if (huidig.afwerking === 'fineer') {
      m.color.set('#ffffff'); m.roughness = 0.55; m.clearcoat = 0.25
    } else if (huidig.afwerking === 'gegrond') {
      // Wél de gekozen kleur, maar mat: dit is muurverf op de bouw, geen
      // fabriekslak. Het verschil met 'gelakt' zit in de glans, niet in de kleur.
      m.color.set(lakKleur); m.roughness = 0.88; m.clearcoat = 0.0
    } else {
      // Zijdeglans, geen hoogglans. Met meer glans weerkaatst een donker blad
      // de lichte kamer en leest het als een lichte baan naast een matte wand —
      // precies het effect dat een kozijnloze deur niet moet hebben.
      m.color.set(lakKleur); m.roughness = 0.62; m.clearcoat = 0.06; m.clearcoatRoughness = 0.55
    }
    m.needsUpdate = true
  }, [lakKleur, huidig.afwerking])

  // ── Draairichting en scharnierzijde ────────────────────────────────────
  useEffect(() => {
    const st = scene.current
    if (!st) return
    const links = huidig.scharnier === 'links'
    const buiten = huidig.richting === 'buiten'
    st.scharnierpunt.position.x = links ? -MAAT.blad / 2 : MAAT.blad / 2
    st.deur.position.x = links ? MAAT.blad / 2 : -MAAT.blad / 2
    // Het scharnier zit aan de kant waar de deur heen draait. Draait hij om het
    // midden van het blad, dan zwaait de achterhoek met 3 mm kier de wand in.
    st.scharnierpunt.position.z = buiten ? 0 : -MAAT.dikte
    st.deur.position.z = buiten ? -MAAT.dikte / 2 : MAAT.dikte / 2
    // Naar buiten = naar de kijker toe.
    const mate = stand === 'dicht' ? 0 : stand === 'kier' ? 0.23 : 1.25
    st.doelHoek = mate * (buiten ? 1 : -1) * (links ? 1 : -1)
  }, [huidig.scharnier, huidig.richting, stand])

  // ── De kruk: kleur en kant ─────────────────────────────────────────────
  useEffect(() => {
    const st = scene.current
    if (!st) return
    st.krukMat.color.set(krukVar.hex)
    // Zwart en donker beslag is doorgaans mat gepoedercoat; chroom en goud
    // spiegelen. Zonder dat verschil ziet alles eruit als hetzelfde metaal.
    const donker = ['Zwart', 'Grafiet', 'Basalt'].includes(krukVar.afwerking)
    st.krukMat.metalness = donker ? 0.35 : 0.9
    st.krukMat.roughness = donker ? 0.55 : 0.22
    st.krukMat.needsUpdate = true
    // De kruk hoort aan de sluitzijde, dus tegenover de scharnieren.
    const links = huidig.scharnier === 'links'
    st.krukGroep.position.x = links ? 0.40 : -0.40
    st.krukGroep.scale.x = links ? 1 : -1
  }, [krukVar, huidig.scharnier])

  // ── Dichtbij of op afstand ─────────────────────────────────────────────
  useEffect(() => {
    const st = scene.current
    if (!st) return
    st.doelCam.set(...(veraf ? [1.85, 1.62, 8.6] : [0.62, 1.46, 4.90]) as [number, number, number])
    st.doelKijk.set(0, veraf ? 1.28 : 1.30, 0)
  }, [veraf])

  // ── Wand in dezelfde kleur als de deur ─────────────────────────────────
  useEffect(() => {
    const st = scene.current
    if (!st) return
    // Bij fineer volgt de wand de basiskleur van het hout; anders zou de wand
    // wit blijven naast een houten deur en klopt het effect niet.
    const kleurVoorWand = huidig.afwerking === 'fineer' ? fineer.basis : lakKleur
    st.wandMat.color.set(wandGelijk ? kleurVoorWand : '#A9A296')
    st.wandMat.needsUpdate = true
  }, [wandGelijk, lakKleur, huidig.afwerking, fineer])

  // ── De URL volgt de configuratie, zodat je hem kunt delen ──────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const u = new URL(window.location.href)
    u.searchParams.set('deuren', naarUrl(deuren))
    window.history.replaceState(null, '', u)
  }, [deuren])

  const wijzig = useCallback((p: Partial<Deur>) => {
    setDeuren(d => d.map((x, i) => (i === actief ? { ...x, ...p } : x)))
  }, [actief])

  const specTekst = deuren.map((d, i) => {
    const o = ONTWERPEN.find(x => x.id === d.ontwerp)!
    const k = KLEUREN.find(x => x.ral === d.ral)!
    const f = FINEREN.find(x => x.id === d.fineer)!
    const vrijeRal = d.vrij ? dichtstbijzijndeRal(d.vrij) : null
    const afw = d.afwerking === 'gelakt'
              ? (vrijeRal
                  ? `gelakt, gekozen kleur ${d.vrij} — dichtstbijzijnde RAL ${vrijeRal.ral} ${vrijeRal.naam}`
                  : `gelakt in RAL ${k.ral} ${k.naam}`)
              : d.afwerking === 'fineer' ? `fineer ${f.naam.toLowerCase()} (houtsoort nog te kiezen)`
              : 'gegrond, zelf te schilderen'
    const km = KRUKKEN.find(x => x.id === d.kruk) ?? KRUKKEN[0]
    const sl = SLOTEN.find(x => x.id === d.slot) ?? SLOTEN[0]
    return `${naamVan(d, i)}: ${o.naam} (${o.groef.toLowerCase()}) · ${afw} · `
         + `plafondhoog · draait naar ${d.richting} · scharnieren ${d.scharnier} · `
         + `kruk ${km.naam} (${km.merk}) in ${d.krukAfwerking} · ${sl.naam} · `
         + `scharnier DX38 ${d.scharnierKleur}`
  }).join('\n')

  const mail = 'mailto:info@bylder.com?subject='
    + encodeURIComponent('Offerteaanvraag kozijnloze deuren')
    + '&body=' + encodeURIComponent(
        `Mijn configuratie:\n\n${specTekst}\n\n`
        + `Bekijk hem terug: ${gemonteerd ? window.location.href : ''}\n\n`
        + `Nog in te vullen:\nAantal deuren totaal:\nPlaats:\nWanddikte (indien bekend):\n`
        + `Oplevering / gewenste plaatsing:\nNaam:\nTelefoon:\n`)

  const knop: React.CSSProperties = {
    padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${INKT}0.14)`,
    background: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', color: `${INKT}0.75)`,
  }
  const knopAan: React.CSSProperties = {
    ...knop, borderColor: GROEN, background: 'rgba(61,90,62,0.08)', color: GROEN, fontWeight: 800,
  }

  return (
    <div className="conf-raster" style={{ display: 'grid', gap: 20, alignItems: 'start' }}>
      {/* Inline stijlen kennen geen mediaquery, en de tweede kolom eist 300 px.
          Op een telefoon liep de rechterkolom daardoor buiten het scherm. */}
      <style>{`
        .conf-raster { grid-template-columns: minmax(0,1.15fr) minmax(300px,1fr) }
        @media (max-width: 860px) { .conf-raster { grid-template-columns: minmax(0,1fr) } }
      `}</style>

      {/* ── Het beeld ── */}
      <div>
        <div style={{ position: 'relative', width: '100%', height: 'min(68vh, 640px)', borderRadius: 16,
                      overflow: 'hidden', border: `1px solid ${INKT}0.12)`, background: '#EDE7DC' }}>
          <div ref={doek} style={{
            // Vaste hoogte in plaats van een verhouding: met aspect-ratio plus
            // max-height rekt de doos zich alsnog op tot ver buiten beeld, en dan
            // staat de deur half onder de vouw.
            width: '100%', height: '100%',
          }} />
          {toonFoto && (
            // In de render zit de kruk links, dus de scharnieren rechts. Kiest de
            // koper scharnieren links, dan spiegelen we het beeld.
            <GerenderdBeeld ontwerp={ontwerp.id} kleurHex={lakKleur} spiegel={huidig.scharnier === 'links'} />
          )}
        </div>
        <div role="group" aria-label="Weergave" style={{ display: 'flex', gap: 4, margin: '10px 0 0' }}>
          <button onClick={() => setWeergave('foto')} aria-pressed={toonFoto} disabled={huidig.afwerking === 'fineer'}
            title={huidig.afwerking === 'fineer' ? 'Fineer volgt zodra de houtscans er zijn' : undefined}
            style={{ ...(toonFoto ? knopAan : knop), opacity: huidig.afwerking === 'fineer' ? 0.45 : 1 }}>
            Gerenderd
          </button>
          <button onClick={() => setWeergave('3d')} aria-pressed={!toonFoto} style={!toonFoto ? knopAan : knop}>
            3D
          </button>
        </div>
        {toonFoto ? (
          <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: '8px 0 0', lineHeight: 1.6 }}>
            Gerenderd in Blender, met deur en wand in de kleur die je kiest en een kier van 3 mm &mdash;
            zo ziet een instuckozijn eruit na het stucwerk. De kruk staat hier in zwart; je eigen keuze en
            de draairichting zie je in 3D.
          </p>
        ) : (
        <>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', margin: '10px 0 0' }}>
          <button onClick={() => setWandGelijk(v => !v)} aria-pressed={wandGelijk}
            style={wandGelijk ? knopAan : knop}>
            Wand in dezelfde kleur
          </button>
          <button onClick={() => setVeraf(v => !v)} aria-pressed={veraf}
            style={veraf ? knopAan : knop}>
            {veraf ? 'Van dichtbij' : 'Op afstand bekijken'}
          </button>
          <span role="group" aria-label="Stand van de deur" style={{ display: 'inline-flex', gap: 4 }}>
            {([['dicht', 'Dicht'], ['kier', 'Op een kier'], ['open', 'Open']] as const).map(([w, t]) => (
              <button key={w} onClick={() => setStand(w)} aria-pressed={stand === w}
                style={stand === w ? knopAan : knop}>{t}</button>
            ))}
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: '8px 0 0', lineHeight: 1.6 }}>
          Weergave op schaal: plafondhoog bij 2.720 mm, met een kier van 3 mm rond het blad. Het licht valt van linksboven &mdash;
          daarom verandert het groefpatroon als je een donkerder kleur kiest. Zet de wand in
          dezelfde kleur en bekijk hem op afstand: dan zie je waar dit systeem het voor doet,
          want zonder kozijn en architraaf worden deur en wand &eacute;&eacute;n vlak met alleen
          een schaduwvoeg ertussen. Kleuren op scherm zijn een benadering; vraag een staal voor
          de definitieve keuze.
        </p>
        </>
        )}
      </div>

      {/* ── De keuzes ── */}
      <div style={{ display: 'grid', gap: 22 }}>

        {/* Deuren — de knop staat tussen de deuren zelf, niet in een hoek.
            Dat een configuratie mééér deuren kan bevatten is de kern van het
            product (een woning heeft er zes tot acht), en dat moet je zien
            zonder ernaar te zoeken. */}
        <div>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>
            Jouw deuren
          </h2>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            {deuren.map((d, i) => {
              const k = KLEUREN.find(x => x.ral === d.ral)!
              const f = FINEREN.find(x => x.id === d.fineer)!
              const staal = d.afwerking === 'fineer' ? f.basis
                          : d.afwerking === 'gegrond' ? GRONDVERF
                          : (d.vrij || k.hex)
              return (
                <button key={i} onClick={() => setActief(i)}
                  style={{ ...(i === actief ? knopAan : knop), padding: '7px 10px', fontSize: 13,
                           display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 13, height: 13, borderRadius: 3, background: staal,
                                 border: `1px solid ${INKT}0.25)`, display: 'inline-block' }} />
                  {naamVan(d, i)}
                  {deuren.length > 1 && (
                    <span onClick={e => { e.stopPropagation()
                        setDeuren(x => x.filter((_, j) => j !== i))
                        setActief(a => Math.max(0, a - (i <= a ? 1 : 0))) }}
                      aria-label={`${naamVan(d, i)} verwijderen`}
                      style={{ marginLeft: 2, color: `${INKT}0.4)`, fontWeight: 700 }}>×</span>
                  )}
                </button>
              )
            })}
            <button onClick={() => { setDeuren(d => [...d, { ...huidig, naam: '' }])
                                     setActief(deuren.length) }}
              style={{ padding: '8px 14px', borderRadius: 9, border: 'none', background: GROEN,
                       color: '#F5F0E8', fontSize: 13.5, fontWeight: 800, cursor: 'pointer',
                       fontFamily: 'inherit' }}>
              + Deur toevoegen
            </button>
          </div>
        </div>

        {/* Naam — waar hangt deze deur? */}
        <div>
          <label htmlFor="deurnaam" style={{ display: 'block', fontSize: '1.02rem',
            fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>Waar komt deze deur?</label>
          <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 8px' }}>
            Geef hem de naam van de ruimte, dan weet iedereen bij de offerte welke deur
            welke is.
          </p>
          <input id="deurnaam" list="plekken" value={huidig.naam}
            placeholder={`Bijvoorbeeld ${PLEKKEN[actief % PLEKKEN.length].toLowerCase()}`}
            onChange={e => wijzig({ naam: e.target.value })}
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 9, fontSize: 14.5,
                     border: `1.5px solid ${INKT}0.14)`, fontFamily: 'inherit',
                     color: '#1A1208', background: '#fff' }} />
          <datalist id="plekken">{PLEKKEN.map(x => <option key={x} value={x} />)}</datalist>
        </div>

        {/* Afwerking — bepaalt of je een kleur of een houtsoort kiest */}
        <div>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>
            Afwerking
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {AFWERKINGEN.map(a => (
              <button key={a.id} onClick={() => wijzig({ afwerking: a.id })}
                style={{ ...(a.id === huidig.afwerking ? knopAan : knop), flex: 1 }}>{a.naam}</button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: `${INKT}0.62)`, margin: '9px 0 0', lineHeight: 1.65 }}>
            {afwerking.uitleg}
          </p>
        </div>

        {/* Kleur of houtsoort, afhankelijk van de afwerking */}
        {(huidig.afwerking === 'gelakt' || huidig.afwerking === 'gegrond') && (
          <div>
            <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
              {huidig.afwerking === 'gegrond' ? 'Welke kleur ga je schilderen?' : 'Kleur'}
            </h2>
            <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
              {huidig.afwerking === 'gegrond'
                ? 'Je bent nergens aan gebonden — kies gerust je wandkleur. Sleep over het raster.'
                : `Sleep over het raster. RAL ${kleur.ral} · ${kleur.naam}`}
            </p>
            <div
              onPointerDown={() => setSleept(true)}
              onPointerUp={() => setSleept(false)}
              onPointerLeave={() => setSleept(false)}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(38px,1fr))',
                       gap: 5, touchAction: 'none' }}>
              {KLEUREN.map(k => (
                <button key={k.ral}
                  onPointerDown={() => wijzig({ ral: k.ral, vrij: '' })}
                  onPointerEnter={() => { if (sleept) wijzig({ ral: k.ral, vrij: '' }) }}
                  title={`RAL ${k.ral} — ${k.naam}`}
                  aria-label={`RAL ${k.ral}, ${k.naam}`}
                  aria-pressed={!huidig.vrij && k.ral === huidig.ral}
                  style={{
                    aspectRatio: '1', borderRadius: 7, background: k.hex, cursor: 'pointer',
                    border: !huidig.vrij && k.ral === huidig.ral
                      ? `2.5px solid ${GROEN}` : `1px solid ${INKT}0.18)`,
                    boxShadow: !huidig.vrij && k.ral === huidig.ral
                      ? '0 0 0 3px rgba(61,90,62,0.16)' : 'none',
                  }} />
              ))}
            </div>
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 13.5, fontWeight: 700, color: GROEN, cursor: 'pointer' }}>
                Een andere kleur proberen
              </summary>
              <div style={{ marginTop: 10 }}>
                <KleurKiezer
                  waarde={lakKleur}
                  helderheid={huidig.helderheid}
                  onKies={(hexKleur, _h, _s, v) =>
                    wijzig({ vrij: hexKleur, helderheid: v })} />
              </div>
            </details>
          </div>
        )}

        {huidig.afwerking === 'fineer' && (
          <div>
            <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
              Houtsoort
            </h2>
            <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
              Drie fineren. {fineer.naam}.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {FINEREN.map(f => (
                <button key={f.id} onClick={() => wijzig({ fineer: f.id })}
                  aria-pressed={f.id === huidig.fineer}
                  style={{ flex: 1, height: 62, borderRadius: 9, cursor: 'pointer',
                    background: `repeating-linear-gradient(90deg, ${f.basis} 0 6px, ${f.nerf} 6px 7px)`,
                    border: f.id === huidig.fineer
                      ? `2.5px solid ${GROEN}` : `1px solid ${INKT}0.18)`,
                    boxShadow: f.id === huidig.fineer ? '0 0 0 3px rgba(61,90,62,0.16)' : 'none',
                  }} />
              ))}
            </div>
            {fineer.voorlopig && (
              <p style={{ fontSize: 12.5, color: `${INKT}0.55)`, margin: '9px 0 0', lineHeight: 1.6 }}>
                De houtnerf op dit scherm is een indicatie. Classic Next levert drie fineren;
                zodra hun scans er zijn staat hier het echte materiaal, met de naam van de
                houtsoort erbij.
              </p>
            )}
          </div>
        )}

        {/* Ontwerp */}
        <div>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
            Ontwerp
          </h2>
          <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
            {ontwerp.naam} &middot; {ontwerp.groef.toLowerCase()}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ONTWERPEN.map(o => (
              <button key={o.id} onClick={() => wijzig({ ontwerp: o.id })}
                style={{ ...(o.id === huidig.ontwerp ? knopAan : knop),
                         padding: '6px 10px', fontSize: 13 }}>{o.naam}</button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: `${INKT}0.62)`, margin: '10px 0 0', lineHeight: 1.65 }}>
            {ontwerp.waar}
          </p>
        </div>

        {/* Beslag — de kruk zie je elke dag, dus die keuze hoort erbij en niet
            pas bij de offerte. De foto's zijn van het echte beslag; de kruk in
            het 3D-beeld is een vereenvoudigde vorm die alleen plek, maat en
            kleur toont. */}
        <div>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
            Deurkruk
          </h2>
          <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
            {krukModel.naam} van {krukModel.merk} &middot; {krukVar.afwerking}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {KRUKKEN.map(k => (
              <button key={k.id}
                onClick={() => wijzig({ kruk: k.id, krukAfwerking: k.varianten[0].afwerking })}
                style={{ ...(k.id === huidig.kruk ? knopAan : knop), padding: '6px 10px',
                         fontSize: 13 }}>{k.naam}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 7,
            gridTemplateColumns: 'repeat(auto-fill,minmax(88px,1fr))' }}>
            {krukModel.varianten.map(v => (
              <button key={v.afwerking} onClick={() => wijzig({ krukAfwerking: v.afwerking })}
                title={v.afwerking} aria-label={`${krukModel.naam} in ${v.afwerking}`}
                aria-pressed={v.afwerking === krukVar.afwerking}
                style={{ padding: 0, cursor: 'pointer', borderRadius: 9, overflow: 'hidden',
                  background: '#fff',
                  border: v.afwerking === krukVar.afwerking
                    ? `2.5px solid ${GROEN}` : `1px solid ${INKT}0.16)` }}>
                <img src={`/img/classic-next/beslag/${v.beeld}.jpg`} alt=""
                  width={340} height={340} loading="lazy" decoding="async"
                  style={{ width: '100%', height: 'auto', display: 'block' }} />
                <span style={{ display: 'block', fontSize: 11, padding: '3px 4px 5px',
                  color: `${INKT}0.65)` }}>{v.afwerking}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slot — dit is een functionele keuze, geen esthetische. Een badkamer
            wil vrij/bezet; dat weet niet iedereen, dus staat het erbij. */}
        <div>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
            Slot
          </h2>
          <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
            Magneetslot &mdash; valt geruisloos dicht en laat het wandvlak heel.
          </p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {SLOTEN.map(x => (
              <button key={x.id} onClick={() => wijzig({ slot: x.id })}
                style={{ ...(x.id === huidig.slot ? knopAan : knop), flex: 1,
                         padding: '8px 6px', fontSize: 12.5 }}>{x.naam}</button>
            ))}
          </div>
          <p style={{ fontSize: 13, color: `${INKT}0.62)`, margin: 0, lineHeight: 1.65 }}>
            {slotType.uitleg}
          </p>
        </div>

        {/* Scharnier */}
        <div>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
            Scharnier
          </h2>
          <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
            Verdekt scharnier DX38 &mdash; van buiten onzichtbaar, in drie richtingen
            verstelbaar. {scharnierVar.afwerking}.
          </p>
          <div style={{ display: 'flex', gap: 7 }}>
            {SCHARNIEREN.map(v => (
              <button key={v.afwerking} onClick={() => wijzig({ scharnierKleur: v.afwerking })}
                aria-pressed={v.afwerking === scharnierVar.afwerking}
                style={{ padding: 0, cursor: 'pointer', borderRadius: 9, overflow: 'hidden',
                  background: '#fff', flex: 1, maxWidth: 130,
                  border: v.afwerking === scharnierVar.afwerking
                    ? `2.5px solid ${GROEN}` : `1px solid ${INKT}0.16)` }}>
                <img src={`/img/classic-next/beslag/${v.beeld}.jpg`} alt=""
                  width={249} height={340} loading="lazy" decoding="async"
                  style={{ width: '100%', height: 'auto', display: 'block' }} />
                <span style={{ display: 'block', fontSize: 11, padding: '3px 4px 5px',
                  color: `${INKT}0.65)` }}>{v.afwerking}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Draairichting */}
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>
              Draait naar
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['binnen', 'buiten'] as const).map(r => (
                <button key={r} onClick={() => wijzig({ richting: r })}
                  style={{ ...(r === huidig.richting ? knopAan : knop), flex: 1 }}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 8px', color: '#1A1208' }}>
              Scharnieren
            </h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['links', 'rechts'] as const).map(s => (
                <button key={s} onClick={() => wijzig({ scharnier: s })}
                  style={{ ...(s === huidig.scharnier ? knopAan : knop), flex: 1 }}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Specificatie + offerte */}
        <div style={{ background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 14,
                      padding: 20 }}>
          <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 6px', color: '#1A1208' }}>
            {deuren.length === 1 ? 'Jouw specificatie' : `Jouw specificatie — ${deuren.length} deuren`}
          </h2>
          <p style={{ fontSize: 13.5, color: `${INKT}0.7)`, margin: '0 0 14px', lineHeight: 1.65 }}>
            Wij sturen je configuratie door en komen met een offerte terug. Prijzen hangen af
            van maat, wanddikte en afwerking &mdash; daarom staat er hier geen bedrag dat
            straks niet klopt.
          </p>
          {spec && (
            <pre style={{ fontSize: 12.5, lineHeight: 1.7, background: `${INKT}0.04)`,
                          padding: '12px 14px', borderRadius: 9, overflowX: 'auto',
                          fontFamily: "'Space Mono',monospace", margin: '0 0 14px',
                          color: `${INKT}0.8)`, whiteSpace: 'pre-wrap' }}>{specTekst}</pre>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href={mail} style={{
              background: GROEN, color: '#F5F0E8', fontWeight: 800, fontSize: 14.5,
              padding: '12px 20px', borderRadius: 11, textDecoration: 'none',
            }}>Vraag een offerte aan</a>
            <button onClick={() => setSpec(s => !s)} style={knop}>
              {spec ? 'Verberg specificatie' : 'Toon specificatie'}
            </button>
            <button style={knop} onClick={() => {
              navigator.clipboard?.writeText(window.location.href)
              setGekopieerd(true); setTimeout(() => setGekopieerd(false), 2000)
            }}>{gekopieerd ? 'Link gekopieerd' : 'Deel deze configuratie'}</button>
          </div>
          <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: '12px 0 0', lineHeight: 1.6 }}>
            Deuren van <a href="/kozijnloze-deuren/classic-next/"
              style={{ color: ROEST, fontWeight: 700 }}>Classic Next</a> uit Uden, geleverd als
            kozijn en deur in één systeem.
          </p>
        </div>
      </div>
    </div>
  )
}
