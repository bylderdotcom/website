// KOPIE van app/src/lib/kast/rekenmodel.ts (bylderdotcom/app). Wijzig beide tegelijk, anders lopen
// de website-ontwerper en wat het timmerbedrijf ziet uit elkaar.
// Het rekenmodel: van ontwerp (ontwerp.ts) naar platen, fronten, beslag en controles.
//
// Alles wat de koper ziet en het timmerbedrijf krijgt komt hieruit: het 3D-beeld,
// de tekeningen, de zaaglijst en de beslaglijst. Zo kunnen ze nooit uit elkaar
// lopen. De vakregels staan hier ook; breekt een ontwerp er een, dan komt dat terug
// als 'fout' en past de AI het ontwerp aan voordat de koper het ziet.
//
// Wereldcoördinaten in cm: x en z langs de vloer, y omhoog. De muren liggen op x = 0
// en/of z = 0, de kamer aan de positieve kant. Een been heeft eigen coördinaten:
// u langs de muur, v van de muur af. 'spiegel' zegt of de weergave in x gespiegeld
// moet worden (zie Bouw.spiegel); het rekenmodel zelf spiegelt niets.

import type { Ontwerp, Zone, Vak } from './ontwerp'

export const MAAT = { naad: 0.3, vul: 6, front: 1.9, rug: 0.8, schil: 1.0, nisPas: 2, maxPlank: 80, maxPlankLat: 120, maxDeurB: 60, maxDeurH: 240, maxLade: 100 }

export type Rol = 'korpus' | 'plank' | 'rug' | 'front' | 'vul' | 'plint' | 'pas' | 'kopwand'
export type Deel = {
  naam: string; waar: string; mat: string; rol: Rol
  /** [x0, x1, y0, y1, z0, z1] */
  b: [number, number, number, number, number, number]
  kant?: string; zicht?: boolean
  /** Voor de aanzichten: welk been en waar langs de muur. */
  been: number; u0: number; u1: number
}
export type Rond = {
  naam: string; waar: string; mat: string; type: 'schijf' | 'schil'
  r: number; y0: number; y1: number; c: [number, number]
  /** Hoek (rad) waar het kwart begint, gemeten zoals three.js: x = sin, z = cos. */
  theta: number; dikte: number; open?: boolean; plint?: boolean
  been: number; u0: number; u1: number
}
export type Front = {
  soort: 'deur' | 'lade' | 'paneel'; waar: string; mat: string
  b: [number, number, number, number, number, number]
  /** Langs welke wereldas de breedte loopt. */
  as: 'x' | 'z'
  /** Scharnierkant (voor deuren): positie op 'as' en richting waarin de deur van het scharnier af loopt. */
  scharnier?: { pos: number; richting: 1 | -1 }
  /** Normaal naar de kamer: +1 op de andere as. */
  greep?: { pos: number; y: number; liggend: boolean } | null
  begrenzer?: boolean
  scharnieren?: number
  been: number; u0: number; u1: number
}
export type Vakinfo = { waar: string; breedte: number; vrijeHoogte: number; functie?: string | null }

export type Bouw = {
  delen: Deel[]; rond: Rond[]; fronten: Front[]; vakken: Vakinfo[]
  fouten: string[]; waarschuwingen: string[]
  spiegel: boolean
  maten: { benen: { muur: string; lengte: number }[]; hoogte: number; diepte: number }
  mat: { korpus: string; front: string; buig: string; rug: string }
  /** Muren voor de weergave: lijnstukken op de vloer. */
  muren: { x0: number; z0: number; x1: number; z1: number }[]
}

const r1 = (v: number) => Math.round(v * 10) / 10
const nl = (v: number) => String(r1(v)).replace('.', ',')

export function materialen(o: Ontwerp) {
  const a = o.afwerking
  const front = a.soort === 'lak' ? `MDF lakdragend 19 mm, gelakt ${a.naam}${a.glans ? ' ' + a.glans : ''}`
    : a.soort === 'hout' ? `MDF 19 mm met fineer, ${a.naam}` : `Decorplaat 19 mm, ${a.naam}`
  return {
    korpus: o.binnen === 'wit' ? 'Wit melamine spaanplaat 18 mm' : front,
    front,
    buig: a.soort === 'lak' ? 'Buig-MDF 2 × 5 mm, gelakt' : `Buig-MDF 2 × 5 mm met fineer, ${a.naam}`,
    rug: 'MDF wit 8 mm (rug)',
  }
}

/** Aantal scharnieren naar deurhoogte. */
export const scharnierAantal = (h: number) => (h <= 90 ? 2 : h <= 160 ? 3 : h <= 220 ? 4 : 5)

export function bouw(o: Ontwerp): Bouw {
  const fouten: string[] = [], waarsch: string[] = []
  const mat = materialen(o)
  const delen: Deel[] = [], rond: Rond[] = [], fronten: Front[] = [], vakken: Vakinfo[] = []
  const D = o.diepte, tf = MAAT.front, tr = MAAT.rug, g = MAAT.naad
  const tc = o.binnen === 'wit' ? 1.8 : 1.9
  const dc = D - tf
  const yP = o.plint?.hoogte ?? 0

  if (D < 25 || D > 70) fouten.push(`Diepte ${nl(D)} cm is ongebruikelijk; kies tussen 25 en 70 cm.`)
  const nBenen = o.opstelling === 'hoek' ? 2 : 1
  if (o.benen.length !== nBenen) fouten.push(`Opstelling '${o.opstelling}' vraagt ${nBenen} ${nBenen === 1 ? 'been' : 'benen'}, er zijn er ${o.benen.length}.`)
  const benen = o.benen.slice(0, nBenen)

  const lengtes: { muur: string; lengte: number }[] = []
  let maxTop = yP

  benen.forEach((been, bi) => {
    // (u,v) → wereld (x,z)
    const langsZ = o.opstelling === 'hoek' && bi === 0
    const W = (u: number, v: number): [number, number] => (langsZ ? [v, u] : [u, v])
    const box = (naam: string, waar: string, m: string, rol: Rol, u0: number, u1: number, v0: number, v1: number, y0: number, y1: number, extra: Partial<Deel> = {}) => {
      const [xa, za] = W(Math.min(u0, u1), Math.min(v0, v1)), [xb, zb] = W(Math.max(u0, u1), Math.max(v0, v1))
      delen.push({ naam, waar, mat: m, rol, b: [Math.min(xa, xb), Math.max(xa, xb), y0, y1, Math.min(za, zb), Math.max(za, zb)], been: bi, u0: Math.min(u0, u1), u1: Math.max(u0, u1), ...extra })
    }
    const as: 'x' | 'z' = langsZ ? 'z' : 'x'
    // kwartcirkel richting: theta van de richting (du, dv) in wereld
    const thetaVan = (du: number, dv: number) => { const [x, z] = W(du, dv); return Math.atan2(x, z) }

    const naam = been.muur || `been ${bi + 1}`
    const isHoek = o.opstelling === 'hoek'
    // Startpunten: korpus en voorkant
    let uFront = 0, uKorpus = 0
    if (isHoek) { uFront = D + MAAT.vul; uKorpus = bi === 0 ? 0 : D }
    if (o.opstelling === 'nis') { uFront = MAAT.nisPas; uKorpus = MAAT.nisPas }

    const segs = been.segmenten
    let u = uFront
    let lengte = 0
    let topEersteSeg = yP
    const kopNaast: number[] = []
    segs.forEach((s, si) => {
      const eerste = si === 0, laatste = si === segs.length - 1
      const waar = `${naam}, deel ${si + 1}`
      const top = yP + s.zones.reduce((t, z) => t + (z.hoogte || 0), 0)
      maxTop = Math.max(maxTop, top)
      if (eerste) topEersteSeg = top
      if (top + (o.passtrook > 0 ? o.passtrook : 0) > o.plafond + 0.5)
        fouten.push(`${waar}: ${nl(top)} cm hoog plus ${nl(o.passtrook)} cm passtrook past niet onder het plafond van ${nl(o.plafond)} cm.`)
      const gat = o.plafond - top
      if (gat > Math.max(o.passtrook, 0) + 0.5 && gat < 10)
        waarsch.push(`${waar}: tussen kast en plafond blijft ${nl(gat)} cm. Dat is te weinig om schoon te houden en te veel voor een passtrook. Maak hem hoger of laat minstens 10 cm vrij.`)

      if (s.vorm === 'rond') {
        const vrijeKant = o.opstelling === 'wand' ? (eerste || laatste) : o.opstelling === 'hoek' ? laatste : false
        if (!vrijeKant) fouten.push(`${waar}: een ronde kop kan alleen aan een vrij uiteinde.`)
        if (Math.abs(s.breedte - D) > 0.5) waarsch.push(`${waar}: een ronde kop is even breed als de kast diep is; gerekend met ${nl(D)} cm.`)
        const R = D
        const naarBegin = o.opstelling === 'wand' && eerste && !laatste
        const cu = naarBegin ? u + R : u
        // kwart tussen +v en ±u
        const t1 = thetaVan(0, 1), t2 = naarBegin ? thetaVan(-1, 0) : thetaVan(1, 0)
        const lo = kwartStart(t1, t2)
        const c = W(cu, 0)
        const ku0 = u, ku1 = u + R
        let y = yP
        s.zones.forEach((z, zi) => {
          const zw = `${waar}, ${zoneNaam(z, zi)}`
          if (!['open', 'dicht', 'leeg'].includes(z.inhoud)) fouten.push(`${zw}: in een ronde kop kan alleen open of dicht; gebogen deuren en lades maken we (nog) niet.`)
          const y1 = y + z.hoogte
          if (z.inhoud !== 'leeg') {
            rond.push({ naam: 'Kopbodem', waar: zw, mat: mat.front, type: 'schijf', r: z.inhoud === 'open' ? R : R - MAAT.schil, y0: y, y1: y + tf, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: tf })
            if (z.inhoud === 'dicht') {
              rond.push({ naam: 'Bekleding kop', waar: zw, mat: mat.buig, type: 'schil', r: R, y0: y, y1, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: MAAT.schil })
              if (z.hoogte > 40) rond.push({ naam: 'Spant kop', waar: zw, mat: mat.front, type: 'schijf', r: R - MAAT.schil, y0: y + z.hoogte / 2 - tf / 2, y1: y + z.hoogte / 2 + tf / 2, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: tf })
            } else {
              const n = Math.max(0, z.planken ?? 0)
              const vrij = (z.hoogte - tf * (n + 1)) / (n + 1)
              for (let i = 1; i <= n; i++) { const py = y + tf + i * vrij + (i - 1) * tf; rond.push({ naam: 'Open plank kop', waar: zw, mat: mat.front, type: 'schijf', r: R, y0: py, y1: py + tf, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: tf, open: true }) }
              if (vrij < 15) waarsch.push(`${zw}: vakken van ${nl(vrij)} cm hoog zijn erg laag.`)
            }
            if (zi === s.zones.length - 1) rond.push({ naam: 'Kopblad', waar: zw, mat: mat.front, type: 'schijf', r: z.inhoud === 'open' ? R : R - MAAT.schil, y0: y1 - tf, y1, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: tf })
            // vlakke zijden van de kop (zichtwerk)
            // Staat er een recht deel naast de kop, dan is diens zijwand de wand van
            // de kop (die wordt aan de kopkant afgewerkt, zie hieronder). Een eigen
            // kopwand zou op precies dezelfde plek staan: dubbel op de zaaglijst en
            // in 3D twee vlakken door elkaar heen.
            const buur = naarBegin ? segs[si + 1] : segs[si - 1]
            if (buur?.vorm === 'recht') kopNaast.push(cu)
            else {
              const uk0 = naarBegin ? cu : cu - tf, uk1 = naarBegin ? cu + tf : cu
              box('Kopwand korpuszijde', zw, mat.front, 'kopwand', uk0, uk1, 0, R, y, y1, { kant: 'zichtkant afgewerkt', zicht: true })
            }
            const um0 = naarBegin ? cu - R : cu + tf, um1 = naarBegin ? cu : cu + R
            box('Kopwand muurzijde', zw, mat.front, 'kopwand', um0, um1, 0, tf, y, y1, { kant: 'zichtkant afgewerkt', zicht: true })
          }
          y = y1
        })
        if (yP > 0) rond.push({ naam: 'Plint kop', waar, mat: mat.buig, type: 'schil', r: R - o.plint.terug, y0: 0, y1: yP, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: tf, plint: true })
        if (o.passtrook > 0 && Math.abs(o.plafond - o.passtrook - top) < 0.6) rond.push({ naam: 'Passtrook kop', waar, mat: mat.buig, type: 'schil', r: R, y0: top, y1: o.plafond, c, theta: lo, been: bi, u0: ku0, u1: ku1, dikte: MAAT.schil })
        u += R
        lengte = u
        return
      }

      // Recht segment
      const a = u, e = u + s.breedte
      const k0 = eerste ? uKorpus : a
      if (s.breedte < 15) fouten.push(`${waar}: ${nl(s.breedte)} cm is te smal voor een kast.`)
      let y = yP
      s.zones.forEach((z, zi) => {
        const zw = `${waar}, ${zoneNaam(z, zi)}`
        if (z.hoogte < 10) fouten.push(`${zw}: ${nl(z.hoogte)} cm hoog is te laag.`)
        const y0 = y, y1 = y + z.hoogte
        y = y1
        if (z.inhoud === 'leeg') return
        const open = z.inhoud === 'open'
        const km = open ? mat.front : mat.korpus
        const t = open ? tf : tc
        // korpus
        box('Rug', zw, mat.rug, 'rug', k0, e, 0, tr, y0, y1)
        box('Zijwand', zw, km, 'korpus', k0, k0 + t, tr, dc + (open ? tf : 0), y0, y1, { kant: '1 lange kant', zicht: open })
        box('Zijwand', zw, km, 'korpus', e - t, e, tr, dc + (open ? tf : 0), y0, y1, { kant: '1 lange kant', zicht: open })
        box('Bodem', zw, km, 'korpus', k0 + t, e - t, tr, dc + (open ? tf : 0), y0, y0 + t, { kant: '1 lange kant', zicht: open })
        box('Bovenblad', zw, km, 'korpus', k0 + t, e - t, tr, dc + (open ? tf : 0), y1 - t, y1, { kant: '1 lange kant', zicht: open })

        // schotten: onder de deurnaad, of automatisch bij brede open vakken
        const schotten: number[] = []
        const nDeur = z.inhoud === 'deuren' ? (z.deuren ?? 0) : 0
        const dw = nDeur ? (e - a - (nDeur + 1) * g) / nDeur : 0
        if (z.inhoud === 'deuren') {
          if (!nDeur) fouten.push(`${zw}: zeg hoeveel deuren (1 of 2).`)
          if (dw > MAAT.maxDeurB) fouten.push(`${zw}: deuren van ${nl(dw)} cm breed zijn te breed (max ${MAAT.maxDeurB}). Maak ${nDeur === 1 ? 'er 2 deuren van' : 'het segment smaller of verdeel het in twee segmenten'}.`)
          if (z.hoogte - g > MAAT.maxDeurH) fouten.push(`${zw}: een deur van ${nl(z.hoogte)} cm hoog trekt krom (max ${MAAT.maxDeurH}). Splits de zone.`)
          if (nDeur === 2 && z.tussenschot !== false) schotten.push(a + g + dw + g / 2)
        }
        if (open && (z.planken ?? 0) > 0) {
          const breed = e - k0 - 2 * t
          const n = Math.ceil(breed / MAAT.maxPlank)
          for (let i = 1; i < n; i++) schotten.push(k0 + t + (breed / n) * i)
          if (n > 1) waarsch.push(`${zw}: open vak van ${nl(breed)} cm breed automatisch verdeeld in ${n} vakken, anders buigen de planken door.`)
        }
        schotten.forEach(sx => box('Tussenschot', zw, km, 'korpus', sx - t / 2, sx + t / 2, tr, dc + (open ? tf : 0), y0 + t, y1 - t, { kant: '1 lange kant', zicht: open }))
        const grens = [k0 + t, ...schotten.flatMap(sx => [sx - t / 2, sx + t / 2]), e - t]
        const nVak = grens.length / 2
        if (z.vakken && z.vakken.length && z.vakken.length !== nVak) waarsch.push(`${zw}: ${z.vakken.length} vakken beschreven, maar de zone heeft er ${nVak}.`)
        for (let i = 0; i < nVak; i++) {
          const l = grens[2 * i], r = grens[2 * i + 1], br = r - l
          const vk: Vak = z.vakken?.[i] ?? { planken: z.planken ?? 0, functie: z.functie }
          const n = Math.max(0, z.inhoud === 'lades' || z.inhoud === 'dicht' ? 0 : vk.planken ?? 0)
          const binnenH = z.hoogte - 2 * t
          const lat = n > 0 && br > MAAT.maxPlank
          if (lat && br > MAAT.maxPlankLat) fouten.push(`${zw}: een plank van ${nl(br)} cm breed buigt door, ook met een lat eronder (max ${MAAT.maxPlankLat}). Zet er een tussenschot onder, of maak het vak zonder planken.`)
          else if (lat) waarsch.push(`${zw}: plank van ${nl(br)} cm breed krijgt een versterkingslat aan de voorkant.`)
          let hoogtes: number[] = []
          if (n > 0) {
            if (vk.vrijOnder && vk.vrijOnder > 0) {
              if (vk.vrijOnder + tc > binnenH) fouten.push(`${zw}: ${nl(vk.vrijOnder)} cm vrij onderin past niet in een vak van ${nl(binnenH)} cm.`)
              const start = y0 + t + vk.vrijOnder
              const rest = (y1 - t) - (start + tc)
              const s2 = n > 1 ? (rest - (n - 1) * tc) / n : 0
              hoogtes = [start, ...Array.from({ length: n - 1 }, (_, j) => start + tc + s2 * (j + 1) + tc * j)]
            } else {
              const s2 = (binnenH - n * tc) / (n + 1)
              hoogtes = Array.from({ length: n }, (_, j) => y0 + t + s2 * (j + 1) + tc * j)
            }
          }
          hoogtes.forEach(h => box(lat ? 'Legplank met lat' : 'Legplank', zw, open ? mat.front : mat.korpus, 'plank', l + 0.1, r - 0.1, tr, dc + (open ? tf : 0) - 2, h, h + (open ? tf : tc), { kant: '1 lange kant', zicht: open }))
          const vrijeH = hoogtes.length ? hoogtes[0] - (y0 + t) : binnenH
          vakken.push({ waar: `${zw}, vak ${i + 1}`, breedte: r1(br), vrijeHoogte: r1(vrijeH), functie: vk.functie ?? z.functie ?? null })
        }

        // fronten
        const front = (soort: Front['soort'], u0: number, u1: number, fy0: number, fy1: number, extra: Partial<Front> = {}) => {
          const [xa, za] = W(u0, dc), [xb, zb] = W(u1, D)
          fronten.push({ soort, waar: zw, mat: mat.front, b: [Math.min(xa, xb), Math.max(xa, xb), fy0, fy1, Math.min(za, zb), Math.max(za, zb)], as, been: bi, u0, u1, ...extra })
        }
        const hoog = z.hoogte >= 100
        if (z.inhoud === 'deuren' && nDeur) {
          for (let i = 0; i < nDeur; i++) {
            const u0 = a + g + i * (dw + g), u1 = u0 + dw
            // Scharnierkant: bij twee deuren buitenom, grepen in het midden.
            // In een hoek: been 1 draait vanuit de hoek (met begrenzer), been 2 draait van de hoek af.
            let kant: 'min' | 'max' = nDeur === 2 ? (i === 0 ? 'min' : 'max') : 'max'
            if (isHoek && eerste && bi === 1) kant = 'max'
            const begrenzer = isHoek && eerste && kant === 'min'
            const greepKant = kant === 'min' ? u1 - 4 : u0 + 4
            front('deur', u0, u1, y0 + g / 2, y1 - g / 2, {
              scharnier: { pos: kant === 'min' ? u0 : u1, richting: kant === 'min' ? 1 : -1 },
              greep: o.greep !== 'geen' && hoog ? { pos: greepKant, y: Math.min(y0 + 105, (y0 + y1) / 2), liggend: false } : null,
              begrenzer, scharnieren: scharnierAantal(z.hoogte),
            })
          }
        } else if (z.inhoud === 'lades') {
          const n = Math.max(1, z.lades ?? 1), lh = (z.hoogte - (n + 1) * g) / n
          if (lh < 12) fouten.push(`${zw}: lades van ${nl(lh)} cm hoog zijn te laag (min 12).`)
          if (e - a > MAAT.maxLade) fouten.push(`${zw}: lades van ${nl(e - a)} cm breed zijn te breed (max ${MAAT.maxLade}).`)
          for (let i = 0; i < n; i++) {
            const fy0 = y0 + g + i * (lh + g)
            front('lade', a + g, e - g, fy0, fy0 + lh, { greep: o.greep !== 'geen' ? { pos: (a + e) / 2, y: fy0 + lh - 4, liggend: true } : null })
          }
        } else if (z.inhoud === 'dicht') {
          front('paneel', a + g, e - g, y0 + g / 2, y1 - g / 2)
        }
      })
      // plint en passtrook
      if (yP > 0) {
        const pv = D - o.plint.terug
        const pu0 = eerste && isHoek ? (bi === 0 ? pv - tf : pv) : a
        box('Plint', waar, mat.front, 'plint', pu0, e, pv - tf, pv, 0, yP, { kant: 'zichtkant afgewerkt', zicht: true })
      }
      if (o.passtrook > 0 && Math.abs(o.plafond - o.passtrook - top) < 0.6)
        box('Passtrook plafond', waar, mat.front, 'pas', eerste && isHoek ? D : a, e, dc, D, top, o.plafond, { kant: 'aftekenen op plafond', zicht: true })
      u = e
      lengte = e
    })
    // Zijwanden die aan een ronde kop grenzen zijn vanuit de kop te zien: in de
    // afwerking, met de zichtkant afgewerkt.
    delen.forEach(d => {
      if (d.been !== bi || d.naam !== 'Zijwand' || !kopNaast.some(c => Math.abs(d.u0 - c) < 0.01 || Math.abs(d.u1 - c) < 0.01)) return
      d.naam = 'Zijwand aan de kop'; d.mat = mat.front; d.zicht = true; d.kant = 'zichtkant afgewerkt'
    })
    // Vulstuk in de binnenhoek / passtroken in een nis
    // Het vulstuk loopt langs de zones met fronten. Naast een open vak blijft de
    // hoek open: de planken lopen dan door tot in de hoek.
    if (isHoek && segs[0]) {
      let y = yP, van: number | null = null
      const sluit = (tot: number) => { if (van !== null && tot > van) box('Vulstuk binnenhoek', naam, mat.front, 'vul', D, D + MAAT.vul, dc, D, van, tot, { kant: 'zichtkant afgewerkt', zicht: true }); van = null }
      for (const z of segs[0].zones) {
        if (z.inhoud === 'open' || z.inhoud === 'leeg') sluit(y); else if (van === null) van = y
        y += z.hoogte
      }
      sluit(Math.min(y, topEersteSeg))
    }
    if (o.opstelling === 'nis') {
      const top = maxTop
      box('Passtrook muur', naam, mat.front, 'pas', 0, MAAT.nisPas, dc, D, yP, top, { kant: 'aftekenen op muur', zicht: true })
      box('Passtrook muur', naam, mat.front, 'pas', lengte, lengte + MAAT.nisPas, dc, D, yP, top, { kant: 'aftekenen op muur', zicht: true })
      lengte += MAAT.nisPas
    }
    lengtes.push({ muur: naam, lengte: r1(lengte) })
    if (been.muurlengte) {
      if (lengte > been.muurlengte + 0.5) fouten.push(`Langs de ${naam} is de kast ${nl(lengte)} cm, maar er is maar ${nl(been.muurlengte)} cm muur.`)
      else if (o.opstelling === 'nis' && been.muurlengte - lengte > 3) waarsch.push(`In de nis blijft ${nl(been.muurlengte - lengte)} cm over. Maak een vak breder of laat de meubelmaker een passtrook zetten.`)
    }
  })

  // muren voor de weergave
  const muren: Bouw['muren'] = []
  const L0 = Math.max(lengtes[0]?.lengte ?? 0, benen[0]?.muurlengte ?? 0) + 40
  if (o.opstelling === 'hoek') {
    const L1 = Math.max(lengtes[1]?.lengte ?? 0, benen[1]?.muurlengte ?? 0) + 40
    muren.push({ x0: 0, z0: 0, x1: 0, z1: L0 }, { x0: 0, z0: 0, x1: L1, z1: 0 })
  } else {
    muren.push({ x0: -40, z0: 0, x1: L0, z1: 0 })
    if (o.opstelling === 'nis') {
      const L = lengtes[0]?.lengte ?? 0
      muren.push({ x0: 0, z0: 0, x1: 0, z1: D + 30 }, { x0: L, z0: 0, x1: L, z1: D + 30 })
    }
  }

  return {
    delen, rond, fronten, vakken, fouten, waarschuwingen: waarsch,
    spiegel: o.opstelling === 'hoek' && o.eersteBeenLinks === false,
    maten: { benen: lengtes, hoogte: r1(maxTop + (o.passtrook > 0 && Math.abs(o.plafond - o.passtrook - maxTop) < 0.6 ? o.passtrook : 0)), diepte: D },
    mat, muren,
  }
}

function zoneNaam(z: Zone, i: number) {
  const n = { deuren: 'deurvak', open: 'open vak', lades: 'lades', dicht: 'dicht vak', leeg: 'vrije ruimte' }[z.inhoud]
  return `${n} ${i + 1}`
}

/** Begin van het kwart tussen twee richtingen die 90° uit elkaar liggen. */
function kwartStart(a: number, b: number) {
  const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  const A = norm(a), B = norm(b)
  return norm(B - A) <= Math.PI ? A : B
}

/* ───────────── Lijsten voor de werkplaats ───────────── */

export type ZaagRegel = { mat: string; naam: string; waar: string[]; L: number; B: number; T: number; n: number; afwerking: string }

export function zaaglijst(b: Bouw): ZaagRegel[] {
  const mm = (v: number) => Math.round(v * 10)
  const kort = (w: string) => w.replace(/, (deurvak|open vak|lades|dicht vak|vrije ruimte) \d+$/, '')
  const rijen = new Map<string, ZaagRegel>()
  const voeg = (mat: string, naam: string, waar: string, L: number, B: number, T: number, afw: string) => {
    const k = [mat, naam, L, B, T, afw].join('|')
    const r = rijen.get(k) ?? { mat, naam, waar: [], L, B, T, n: 0, afwerking: afw }
    if (!r.waar.includes(kort(waar))) r.waar.push(kort(waar))
    r.n++; rijen.set(k, r)
  }
  b.delen.forEach(d => {
    const [x0, x1, y0, y1, z0, z1] = d.b
    const m = [x1 - x0, y1 - y0, z1 - z0].map(mm).sort((p, q) => q - p)
    voeg(d.mat, d.naam, d.waar, m[0], m[1], m[2], d.kant ?? '')
  })
  b.fronten.forEach(f => {
    const [x0, x1, y0, y1, z0, z1] = f.b
    const m = [x1 - x0, y1 - y0, z1 - z0].map(mm).sort((p, q) => q - p)
    const naam = f.soort === 'deur' ? 'Deur' : f.soort === 'lade' ? 'Ladefront' : 'Vast paneel'
    voeg(f.mat, naam, f.waar, m[0], m[1], m[2], 'rondom afgewerkt')
  })
  b.rond.forEach(r => {
    if (r.type === 'schijf') voeg(r.mat, r.naam, r.waar, mm(r.r), mm(r.r), mm(r.dikte), `kwartrond R ${mm(r.r)}, CNC`)
    else voeg(r.mat, r.naam, r.waar, mm(Math.PI / 2 * r.r), mm(r.y1 - r.y0), mm(r.dikte), `gebogen R ${mm(r.r)}`)
  })
  const volgorde = [b.mat.front, b.mat.buig, b.mat.korpus, b.mat.rug]
  return [...rijen.values()].sort((p, q) => volgorde.indexOf(p.mat) - volgorde.indexOf(q.mat) || p.naam.localeCompare(q.naam, 'nl') || q.L - p.L)
}

export function platen(b: Bouw) {
  const plaat: Record<string, number> = {}
  const m2: Record<string, number> = {}
  zaaglijst(b).forEach(r => { m2[r.mat] = (m2[r.mat] ?? 0) + (r.L * r.B * r.n) / 1e6 * (r.mat === b.mat.buig ? 2 : 1) })
  Object.keys(m2).forEach(k => { plaat[k] = /melamine/.test(k) ? 2.8 * 2.07 : 3.05 * 1.22 })
  return Object.keys(m2).map(k => ({ mat: k, m2: Math.round(m2[k] * 10) / 10, platen: Math.ceil(m2[k] / (plaat[k] * 0.8)) }))
}

export function beslag(b: Bouw) {
  const deuren = b.fronten.filter(f => f.soort === 'deur'), lades = b.fronten.filter(f => f.soort === 'lade')
  const planken = b.delen.filter(d => d.rol === 'plank').length
  const korpussen = b.delen.filter(d => d.naam === 'Rug').length
  const lijst: [string, number][] = [
    ['Potscharnier 35 mm, opdek, zachtsluitend', deuren.reduce((s, d) => s + (d.scharnieren ?? 2), 0)],
    ['  waarvan met openingsbegrenzer ±90° (deur in de binnenhoek)', deuren.filter(d => d.begrenzer).reduce((s, d) => s + (d.scharnieren ?? 2), 0)],
    ['Greep', b.fronten.filter(f => f.greep).length],
    ['Drukopener (greeploze fronten)', b.fronten.filter(f => f.soort !== 'paneel' && !f.greep).length],
    ['Ladegeleider volledig uittrekbaar, zachtsluitend (paar)', lades.length],
    ['Plankdrager', planken * 4],
    ['Versterkingslat onder brede plank', b.delen.filter(d => d.naam === 'Legplank met lat').length],
    ['Stelpoot met plintclip', Math.max(4, korpussen * 2)],
    ['Wandbevestiging (ophangbeslag of hoekstaal)', Math.max(2, korpussen * 2)],
  ]
  if (b.vakken.some(v => /stofzuig/i.test(v.functie ?? ''))) lijst.push(['Stopcontact in het stofzuigervak (elektricien)', 1])
  return lijst.filter(([, n]) => n > 0)
}
