'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { ONTWERPEN, KLEUREN, AFWERKINGEN, FINEREN,
         type Afwerking } from './ontwerpen'
import { maakTexturen } from './texturen'

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
  fineer: string
  richting: 'binnen' | 'buiten'
  scharnier: 'links' | 'rechts'
}

const NIEUW: Deur = {
  naam: '', ontwerp: 'dawn', afwerking: 'gelakt', ral: '9010', fineer: 'licht',
  richting: 'binnen', scharnier: 'links',
}

// Suggesties, geen keurslijf: het invoerveld blijft vrij tekst.
const PLEKKEN = ['Hal', 'Woonkamer', 'Keuken', 'Slaapkamer', 'Badkamer', 'Berging',
                 'Werkkamer', 'Overloop', 'Kinderkamer', 'Toilet']

const GRONDVERF = '#E7E4DD'

const INKT = 'rgba(61,46,30,'
const GROEN = '#3D5A3E'
const ROEST = '#B85C38'

function leesUrl(): Deur[] {
  if (typeof window === 'undefined') return [NIEUW]
  const q = new URLSearchParams(window.location.search).get('deuren')
  if (!q) return [NIEUW]
  const uit = q.split('_').map(s => {
    const [ontwerp, afwerking, ral, fineer, richting, scharnier, naam] = s.split('~')
    if (!ONTWERPEN.some(o => o.id === ontwerp)) return null
    return {
      naam: decodeURIComponent(naam || ''),
      ontwerp,
      afwerking: (AFWERKINGEN.some(a => a.id === afwerking) ? afwerking : 'gelakt') as Afwerking,
      ral: KLEUREN.some(k => k.ral === ral) ? ral : '9010',
      fineer: FINEREN.some(f => f.id === fineer) ? fineer : 'licht',
      richting: richting === 'buiten' ? 'buiten' : 'binnen',
      scharnier: scharnier === 'rechts' ? 'rechts' : 'links',
    } as Deur
  }).filter(Boolean) as Deur[]
  return uit.length ? uit : [NIEUW]
}

const naarUrl = (d: Deur[]) =>
  d.map(x => [x.ontwerp, x.afwerking, x.ral, x.fineer, x.richting, x.scharnier,
              encodeURIComponent(x.naam)].join('~')).join('_')

export default function Configurator() {
  const doek = useRef<HTMLDivElement>(null)
  const scene = useRef<{
    renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera
    deur: THREE.Mesh; scharnierpunt: THREE.Group; materiaal: THREE.MeshPhysicalMaterial
    doelHoek: number; stop: boolean
  } | null>(null)

  const [deuren, setDeuren] = useState<Deur[]>([NIEUW])
  const [actief, setActief] = useState(0)
  const [sleept, setSleept] = useState(false)
  const [spec, setSpec] = useState(false)
  const [gekopieerd, setGekopieerd] = useState(false)

  const huidig = deuren[actief] ?? NIEUW
  const ontwerp = ONTWERPEN.find(o => o.id === huidig.ontwerp) ?? ONTWERPEN[0]
  const kleur = KLEUREN.find(k => k.ral === huidig.ral) ?? KLEUREN[0]
  const fineer = FINEREN.find(f => f.id === huidig.fineer) ?? FINEREN[0]
  const afwerking = AFWERKINGEN.find(a => a.id === huidig.afwerking) ?? AFWERKINGEN[1]
  const naamVan = (d: Deur, i: number) => d.naam.trim() || `Deur ${i + 1}`

  useEffect(() => { setDeuren(leesUrl()) }, [])

  // ── De scène ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = doek.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.92
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const sc = new THREE.Scene()
    sc.background = new THREE.Color('#CFC8BC')

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
    zon.shadow.bias = -0.0005
    sc.add(zon)
    sc.add(new THREE.HemisphereLight(0xf2f6ff, 0x9a9082, 0.42))
    const vul = new THREE.DirectionalLight(0xffffff, 0.32)
    vul.position.set(2.5, 1.6, 2.2)
    sc.add(vul)

    // Wand met opening. De deur zit ín de wand: geen kozijn, alleen een schaduwvoeg.
    const wandMat = new THREE.MeshStandardMaterial({ color: '#A9A296', roughness: 0.98 })
    const wand = new THREE.Group()
    const stukken: [number, number, number, number][] = [
      // breedte, hoogte, x, y
      [2.60, 2.72, -1.865, 1.36],
      [2.60, 2.72, 1.865, 1.36],
    ]
    for (const [w, h, x, y] of stukken) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), wandMat)
      m.position.set(x, y, -0.06)
      m.receiveShadow = true
      wand.add(m)
    }
    // Terugliggende dagkant: geeft de schaduwvoeg zijn diepte.
    const dag = new THREE.Mesh(new THREE.BoxGeometry(1.14, 2.76, 0.10), 
      new THREE.MeshStandardMaterial({ color: '#4A453D', roughness: 1 }))
    dag.position.set(0, 1.36, -0.13)
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
      clearcoat: 0.55, clearcoatRoughness: 0.35,
      normalScale: new THREE.Vector2(1.15, 1.15),
    })
    const deur = new THREE.Mesh(new THREE.BoxGeometry(1.05, 2.70, 0.05), materiaal)
    deur.castShadow = true
    deur.receiveShadow = true
    deur.position.set(0.525, 0, 0)          // t.o.v. het scharnierpunt
    const scharnierpunt = new THREE.Group()
    scharnierpunt.position.set(-0.525, 1.35, -0.02)
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

    const st = { renderer, scene: sc, camera, deur, scharnierpunt, materiaal,
                 doelHoek: 0, stop: false }
    scene.current = st

    const lus = () => {
      if (st.stop) return
      // Zachte aanloop naar de doelhoek; een deur die verspringt oogt goedkoop.
      scharnierpunt.rotation.y += (st.doelHoek - scharnierpunt.rotation.y) * 0.12
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
      m.color.set(GRONDVERF); m.roughness = 0.86; m.clearcoat = 0.0
    } else {
      m.color.set(kleur.hex); m.roughness = 0.42; m.clearcoat = 0.55
    }
    m.needsUpdate = true
  }, [kleur, huidig.afwerking])

  // ── Draairichting en scharnierzijde ────────────────────────────────────
  useEffect(() => {
    const st = scene.current
    if (!st) return
    const links = huidig.scharnier === 'links'
    st.scharnierpunt.position.x = links ? -0.525 : 0.525
    st.deur.position.x = links ? 0.525 : -0.525
    // Naar buiten = naar de kijker toe.
    const hoek = 0.23 * (huidig.richting === 'buiten' ? 1 : -1) * (links ? 1 : -1)
    st.doelHoek = hoek
  }, [huidig.scharnier, huidig.richting])

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
    const afw = d.afwerking === 'gelakt' ? `gelakt in RAL ${k.ral} ${k.naam}`
              : d.afwerking === 'fineer' ? `fineer ${f.naam.toLowerCase()} (houtsoort nog te kiezen)`
              : 'gegrond, zelf te schilderen'
    return `${naamVan(d, i)}: ${o.naam} (${o.groef.toLowerCase()}) · ${afw} · `
         + `plafondhoog · draait naar ${d.richting} · scharnieren ${d.scharnier}`
  }).join('\n')

  const mail = 'mailto:info@bylder.com?subject='
    + encodeURIComponent('Offerteaanvraag kozijnloze deuren')
    + '&body=' + encodeURIComponent(
        `Mijn configuratie:\n\n${specTekst}\n\n`
        + `Bekijk hem terug: ${typeof window !== 'undefined' ? window.location.href : ''}\n\n`
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
    <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(0,1.15fr) minmax(300px,1fr)',
                  alignItems: 'start' }}>

      {/* ── Het beeld ── */}
      <div>
        <div ref={doek} style={{
          // Vaste hoogte in plaats van een verhouding: met aspect-ratio plus
          // max-height rekt de doos zich alsnog op tot ver buiten beeld, en dan
          // staat de deur half onder de vouw.
          width: '100%', height: 'min(68vh, 640px)', borderRadius: 16,
          overflow: 'hidden', border: `1px solid ${INKT}0.12)`, background: '#EDE7DC',
        }} />
        <p style={{ fontSize: 12.5, color: `${INKT}0.5)`, margin: '8px 0 0', lineHeight: 1.6 }}>
          Weergave op schaal, plafondhoog (2.700 mm). Het licht valt van linksboven —
          daarom zie je het groefpatroon veranderen als je een donkerder kleur kiest.
          RAL-kleuren zijn een benadering op scherm; vraag een staal voor de definitieve keuze.
        </p>
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
                          : d.afwerking === 'gegrond' ? GRONDVERF : k.hex
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
            style={{ width: '100%', padding: '10px 12px', borderRadius: 9, fontSize: 14.5,
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
        {huidig.afwerking === 'gelakt' && (
          <div>
            <h2 style={{ fontSize: '1.02rem', fontWeight: 800, margin: '0 0 3px', color: '#1A1208' }}>
              Kleur
            </h2>
            <p style={{ fontSize: 13, color: `${INKT}0.6)`, margin: '0 0 10px' }}>
              Sleep over het raster. RAL {kleur.ral} &middot; {kleur.naam}
            </p>
            <div
              onPointerDown={() => setSleept(true)}
              onPointerUp={() => setSleept(false)}
              onPointerLeave={() => setSleept(false)}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(38px,1fr))',
                       gap: 5, touchAction: 'none' }}>
              {KLEUREN.map(k => (
                <button key={k.ral}
                  onPointerDown={() => wijzig({ ral: k.ral })}
                  onPointerEnter={() => { if (sleept) wijzig({ ral: k.ral }) }}
                  title={`RAL ${k.ral} — ${k.naam}`}
                  aria-label={`RAL ${k.ral}, ${k.naam}`}
                  aria-pressed={k.ral === huidig.ral}
                  style={{
                    aspectRatio: '1', borderRadius: 7, background: k.hex, cursor: 'pointer',
                    border: k.ral === huidig.ral
                      ? `2.5px solid ${GROEN}` : `1px solid ${INKT}0.18)`,
                    boxShadow: k.ral === huidig.ral ? '0 0 0 3px rgba(61,90,62,0.16)' : 'none',
                  }} />
              ))}
            </div>
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

        {huidig.afwerking === 'gegrond' && (
          <p style={{ fontSize: 14, color: `${INKT}0.7)`, lineHeight: 1.7, margin: 0,
                      background: '#fff', border: `1px solid ${INKT}0.12)`, borderRadius: 12,
                      padding: '14px 16px' }}>
            Geen kleurkeuze nodig: je schildert deze deur zelf, in elke kleur die je wilt —
            ook later nog een keer. Op het scherm zie je hem in grondverf.
          </p>
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
