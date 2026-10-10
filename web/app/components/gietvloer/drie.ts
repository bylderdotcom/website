// Gedeelde 3D-onderdelen voor de films op de site: de opening van de gietvloerontwerper
// (GietvloerHeld) en die van de homepage (held/WoningFilm). Gietvloer met wolken en
// glans, de tekentafel eronder, en de spiegeling die alleen telt waar al gegoten is.

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export type Rect = [number, number, number, number]   // meters: x0, z0, x1, z1

const zacht = (x: number) => x * x * (3 - 2 * x)

/* ---------------------------------------------------------------- textures */

export function wolkTextuur(): THREE.CanvasTexture {
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

export function rasterTextuur(): THREE.CanvasTexture {
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
export function vloerVlak(stroken: Rect[], staand = false): THREE.BufferGeometry {
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
export function vloerMateriaal(basis: THREE.MeshStandardMaterial, u: { r: { value: number }; o: { value: THREE.Vector2 } }) {
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
export const SPIEGEL = {
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

