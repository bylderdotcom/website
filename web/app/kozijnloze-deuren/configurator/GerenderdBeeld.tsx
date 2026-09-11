'use client'

// De deur zoals Blender hem rendert, in elke kleur, zonder opnieuw te renderen.
//
// HOE HET WERKT
// Per ontwerp liggen er drie renders, met deur en wand in grijs 0,03, 0,20 en
// 0,80. In een render zijn rood, groen en blauw onafhankelijk: het rode licht
// in het beeld hangt alleen af van hoe rood de oppervlakken zijn. Die drie
// grijze beelden zijn dus per kleurkanaal drie meetpunten, en een kwadratische
// lijn erdoor voorspelt elke kleur — inclusief het licht dat de wand op de deur
// terugkaatst. Gemeten tegen een echte render: 0,27% verschil in licht.
//
// De weergavecurve is een benadering van Blenders AgX met een correctie per
// kanaal, gekalibreerd op kleuren die Blender zelf renderde: minder dan 1 op
// 255 verschil.
//
// De beelden zijn RGB zonder alfa: browsers behandelen alfa als doorzichtigheid
// en rekenen er dan stilletjes mee, ook als het een helderheidsschaal is.

import { useEffect, useRef, useState } from 'react'

const MAP = '/img/classic-next/render'

const VS = `attribute vec2 p; varying vec2 uv; uniform float spiegel;
void main(){ uv = vec2(mix(p.x*.5+.5, .5-p.x*.5, spiegel), .5-p.y*.5); gl_Position = vec4(p,0.,1.); }`

const FS = `precision highp float;
varying vec2 uv;
uniform sampler2D n0, n1, n2, s, lut;
uniform vec3 kleur;
const float BEREIK = 16.0;
vec3 dec(vec4 t, float schaal){ return pow(t.rgb, vec3(2.2)) * schaal * BEREIK; }
vec3 door3(vec3 c0, vec3 c1, vec3 c2, vec3 t){
  vec3 l0 = (t - 0.20) * (t - 0.80) / ((0.03 - 0.20) * (0.03 - 0.80));
  vec3 l1 = (t - 0.03) * (t - 0.80) / ((0.20 - 0.03) * (0.20 - 0.80));
  vec3 l2 = (t - 0.03) * (t - 0.20) / ((0.80 - 0.03) * (0.80 - 0.20));
  return c0 * l0 + c1 * l1 + c2 * l2;
}
vec3 agx(vec3 x){
  mat3 M  = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                 0.0784335999999992, 0.878468636469772, 0.0784336,
                 0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  mat3 Mi = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                 -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                 -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  x = M * max(x, vec3(0.));
  x = clamp((log2(max(x, vec3(1e-10))) + 12.47393) / 16.5, 0., 1.);
  vec3 x2 = x*x, x4 = x2*x2;
  vec3 y = 15.5*x4*x2 - 40.14*x4*x + 31.96*x4 - 6.868*x2*x + 0.4298*x2 + 0.1191*x - 0.00232;
  return clamp(Mi * y, 0., 1.);
}
float corr(float v, float k){
  vec3 c = texture2D(lut, vec2(v * (63.0/64.0) + 0.5/64.0, 0.5)).rgb;
  return k < 0.5 ? c.r : (k < 1.5 ? c.g : c.b);
}
void main(){
  vec3 sc = texture2D(s, uv).rgb;
  vec3 c0 = dec(texture2D(n0, uv), sc.r), c1 = dec(texture2D(n1, uv), sc.g), c2 = dec(texture2D(n2, uv), sc.b);
  vec3 a = agx(door3(c0, c1, c2, kleur));
  gl_FragColor = vec4(corr(a.r, 0.), corr(a.g, 1.), corr(a.b, 2.), 1.);
}`

function naarLineair(v: number) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
function hexNaarLineair(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => naarLineair(v / 255)) as [number, number, number]
}
function laad(src: string) {
  return new Promise<HTMLImageElement>((ok, mis) => {
    const b = new Image(); b.onload = () => ok(b); b.onerror = () => mis(new Error(src)); b.src = src
  })
}

type Staat = { gl: WebGLRenderingContext; prog: WebGLProgram; tex: WebGLTexture[] }

export default function GerenderdBeeld(
  { ontwerp, kleurHex, spiegel }: { ontwerp: string; kleurHex: string; spiegel: boolean },
) {
  const doek = useRef<HTMLCanvasElement>(null)
  const staat = useRef<Staat | null>(null)
  const cache = useRef<Record<string, Promise<HTMLImageElement[]>>>({})
  const [laadt, setLaadt] = useState(true)
  const [fout, setFout] = useState(false)

  // Eenmalig: WebGL, shader, vijf texturen en de correctiecurve.
  useEffect(() => {
    const c = doek.current
    const gl = c?.getContext('webgl', { antialias: false, premultipliedAlpha: false }) as WebGLRenderingContext | null
    if (!c || !gl) { setFout(true); return }
    const sh = (t: number, bron: string) => {
      const s = gl.createShader(t)!; gl.shaderSource(s, bron); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFout(true); return }
    gl.useProgram(prog)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
    const tex = ['n0', 'n1', 'n2', 's', 'lut'].map((n, i) => {
      const t = gl.createTexture()!; gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.uniform1i(gl.getUniformLocation(prog, n), i)
      return t
    })
    staat.current = { gl, prog, tex }
    laad(`${MAP}/agx-correctie.png`).then(b => {
      gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tex[4])
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, b)
    }).catch(() => setFout(true))
  }, [])

  // Per ontwerp de vier beelden (één keer ophalen), per kleur alleen opnieuw tekenen.
  useEffect(() => {
    const st = staat.current
    if (!st) return
    let weg = false
    setLaadt(true)
    cache.current[ontwerp] ??= Promise.all(['n0', 'n1', 'n2', 'schaal'].map(k => laad(`${MAP}/${ontwerp}-${k}.webp`)))
    cache.current[ontwerp].then(beelden => {
      if (weg) return
      const { gl, prog, tex } = st
      beelden.forEach((b, i) => {
        gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, tex[i])
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, b)
      })
      doek.current!.width = beelden[0].naturalWidth; doek.current!.height = beelden[0].naturalHeight
      gl.viewport(0, 0, beelden[0].naturalWidth, beelden[0].naturalHeight)
      gl.uniform3fv(gl.getUniformLocation(prog, 'kleur'), hexNaarLineair(kleurHex))
      gl.uniform1f(gl.getUniformLocation(prog, 'spiegel'), spiegel ? 1 : 0)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      setLaadt(false)
    }).catch(() => { if (!weg) setFout(true) })
    return () => { weg = true }
  }, [ontwerp, kleurHex, spiegel])

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#2A2723' }}>
      <canvas ref={doek} aria-label="Gerenderde deur in de gekozen kleur"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                 opacity: laadt ? 0.35 : 1, transition: 'opacity .25s' }} />
      {fout && (
        <p style={{ position: 'absolute', inset: 'auto 16px 16px', margin: 0, color: '#F5F0E8', fontSize: 14,
                    background: 'rgba(20,16,11,.7)', padding: '10px 12px', borderRadius: 8 }}>
          Deze weergave laadt niet in je browser. Kies &ldquo;3D&rdquo; om de deur te bekijken.
        </p>
      )}
    </div>
  )
}
