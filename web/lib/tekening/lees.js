/* Leest een verkoop- of meerwerktekening (vector-PDF) en maakt er een woningmodel van.
 *
 * WAT ERUIT KOMT, per pagina = verdieping:
 *   naam, schaal, wanden [x0,y0,x1,y1,meerwerk] in mm, ruimtes met oppervlakte en
 *   vloerstroken, deuren (uit hun draaicirkel), en de kap als er hoogtelijnen op staan.
 *
 * WAAROM ZO
 * Een PDF van de aannemer is vectorwerk op schaal, geen plaatje: meten is rekenen.
 * Getest op een echte meerwerktekening (drie verdiepingen, 1:50): woonkamer en keuken
 * 53,7 m² tegen 54,5 m² met de hand, 11 van 11 binnendeuren goed geteld en benoemd.
 * Zie docs/woningvisualisator-bouwplan.md §10.
 *
 * TWEE KOPIEËN, ÉÉN BRON: dit bestand staat ook in de app-repo (src/lib/tekening/lees.js,
 * voor app.bylder.com/dashboard/mijn-woning). Wijzig ze samen, anders meten site en app
 * verschillend.
 *
 * pdf.js wordt van buiten meegegeven: de pagina laadt hem pas als iemand een
 * tekening kiest, zodat de rest van de site er niets van merkt.
 */

var PT_MM = 25.4 / 72;
var KAMERS = /^(woonkamer|keuken|entree|hal|toilet|mk|meterkast|trapkast|slaapkamer\s*\d*|badkamer|overloop|wasruimte|zolder|berging|bijkeuken|werkkamer|studeerkamer|vliering|onbenoemde ruimte|technische ruimte|inpandige berging|woon-?keuken|woonkeuken|eetkamer|zitkamer)$/i;
var NETTE = { mk: 'Meterkast', entree: 'Entree' };

function mul(a, b) { // 2D affiene matrices [a,b,c,d,e,f]
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}
function tp(m, x, y) { return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
function kleur(args) {
  if (typeof args[0] === 'string') { var h = args[0].replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  if (args.length === 1) return [args[0] * 255, args[0] * 255, args[0] * 255];
  return [args[0], args[1], args[2]].map(function (v) { return v <= 1 && !(args[0] > 1 || args[1] > 1 || args[2] > 1) ? v * 255 : v; });
}
function soortKleur(c) {
  if (c[0] < 60 && c[1] < 60 && c[2] < 60) return 'zwart';
  if (c[0] > 180 && c[1] < 80 && c[2] < 80) return 'rood';
  return null;
}

async function leesPagina(pdfjsLib, page) {
  var OPS = pdfjsLib.OPS;
  var vp = page.getViewport({ scale: 1 });
  var ops = await page.getOperatorList();
  var tekst = await page.getTextContent();

  // --- schaal uit de tekst ("Schaal 1 : 50")
  var alles = tekst.items.map(function (t) { return t.str; }).join(' ');
  var sm = alles.match(/schaal\s*1\s*:\s*(\d+)/i);
  var schaal = sm ? +sm[1] : 50;
  var MM = PT_MM * schaal;
  var naamM = alles.match(/(begane grond|\d+e\s+verdieping|zolder|kelder)/i);

  // --- gevulde rechthoeken met hun kleur, in paginapunten (y omlaag)
  var ctm = vp.transform.slice(), stapel = [], vul = [0, 0, 0], rects = [];
  var fn = ops.fnArray, ar = ops.argsArray;
  var pad = [], bogen = [];
  for (var i = 0; i < fn.length; i++) {
    var f = fn[i], a = ar[i];
    if (f === OPS.save) stapel.push([ctm, vul]);
    else if (f === OPS.restore) { var s = stapel.pop(); if (s) { ctm = s[0]; vul = s[1]; } }
    else if (f === OPS.transform) ctm = mul(ctm, a);
    else if (f === OPS.setFillRGBColor || f === OPS.setFillGray || f === OPS.setFillColor) vul = kleur(a);
    else if (f === OPS.constructPath) {
      // rechthoeken komen als 're' of als gesloten vierhoek van moveTo/lineTo
      // Een gevuld vlak: we nemen de omhullende van het hele pad, net als een CAD-lezer.
      // Wanden komen als 're', als gesloten vierhoek of als twee driehoeken; allemaal rechthoekig.
      var sub = a[0], co = a[1], k = 0, alle = [], krom = false, bp = [];
      for (var j = 0; j < sub.length; j++) {
        var op = sub[j];
        if (op === OPS.rectangle) {
          var x = co[k], y = co[k + 1], w = co[k + 2], h = co[k + 3]; k += 4;
          alle.push(tp(ctm, x, y), tp(ctm, x + w, y + h));
        } else if (op === OPS.moveTo || op === OPS.lineTo) { var pp = tp(ctm, co[k], co[k + 1]); alle.push(pp); bp.push(pp); k += 2; }
        else if (op === OPS.curveTo) { for (var c1 = 0; c1 < 3; c1++) bp.push(tp(ctm, co[k + 2 * c1], co[k + 2 * c1 + 1])); k += 6; krom = true; }
        else if (op === OPS.curveTo2 || op === OPS.curveTo3) { for (var c2 = 0; c2 < 2; c2++) bp.push(tp(ctm, co[k + 2 * c2], co[k + 2 * c2 + 1])); k += 4; krom = true; }
      }
      // een draaicirkel van een deur: kwartboog, vierkante omhullende van 70-130 cm
      if (krom && bp.length) {
        var bxs = bp.map(function (q) { return q[0] * MM; }), bys = bp.map(function (q) { return q[1] * MM; });
        var bw = Math.max.apply(null, bxs) - Math.min.apply(null, bxs), bh = Math.max.apply(null, bys) - Math.min.apply(null, bys);
        if (Math.max(bw, bh) >= 700 && Math.max(bw, bh) <= 1300 && Math.min(bw, bh) / Math.max(bw, bh) > 0.7)
          bogen.push([Math.min.apply(null, bxs), Math.min.apply(null, bys), Math.max.apply(null, bxs), Math.max.apply(null, bys)]);
      }
      if (!krom && alle.length >= 3) {
        var xs = alle.map(function (q) { return q[0]; }), ys = alle.map(function (q) { return q[1]; });
        pad.push([Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]);
      }
    } else if (f === OPS.fill || f === OPS.eoFill || f === OPS.fillStroke || f === OPS.eoFillStroke || f === OPS.closeFillStroke || f === OPS.closeEOFillStroke) {
      var sk = soortKleur(vul);
      if (sk) pad.forEach(function (r) { rects.push({ r: r, k: sk }); });
      pad = [];
    } else if (f === OPS.endPath || f === OPS.stroke || f === OPS.closeStroke) pad = [];
  }

  // --- naar millimeters; dikke vlakken zijn wanden, dunne paren zijn framewanden
  var dik = [], dun = [];
  rects.forEach(function (o) {
    var r = o.r.map(function (v) { return v * MM; });
    var w = r[2] - r[0], h = r[3] - r[1];
    if (Math.min(w, h) >= 60 && Math.max(w, h) >= 90 && !(w < 110 && h < 110)) dik.push([r[0], r[1], r[2], r[3], o.k === 'rood' ? 1 : 0]);
    else if (Math.min(w, h) < 30 && Math.max(w, h) >= 250) dun.push([r[0], r[1], r[2], r[3], o.k === 'rood' ? 1 : 0, w > h ? 'h' : 'v']);
  });
  // twee evenwijdige dunne lijnen 60-160 mm uit elkaar = één wand
  var gebruikt = {};
  for (var p = 0; p < dun.length; p++) for (var q = p + 1; q < dun.length; q++) {
    var A = dun[p], B = dun[q];
    if (A[5] !== B[5] || gebruikt[p] || gebruikt[q]) continue;
    if (A[5] === 'h') {
      var ov = Math.min(A[2], B[2]) - Math.max(A[0], B[0]), gap = Math.abs(A[1] - B[1]);
      if (ov > 200 && gap >= 60 && gap <= 160) { dik.push([Math.max(A[0], B[0]), Math.min(A[1], B[1]), Math.min(A[2], B[2]), Math.max(A[3], B[3]), A[4] || B[4]]); gebruikt[p] = gebruikt[q] = 1; }
    } else {
      var ov2 = Math.min(A[3], B[3]) - Math.max(A[1], B[1]), gap2 = Math.abs(A[0] - B[0]);
      if (ov2 > 200 && gap2 >= 60 && gap2 <= 160) { dik.push([Math.min(A[0], B[0]), Math.max(A[1], B[1]), Math.max(A[2], B[2]), Math.min(A[3], B[3]), A[4] || B[4]]); gebruikt[p] = gebruikt[q] = 1; }
    }
  }

  // --- grootste samenhangende groep = het gebouw (schaalstok en titelblok vallen weg)
  var n = dik.length, ouder = dik.map(function (_, i) { return i; });
  function wortel(i) { while (ouder[i] !== i) i = ouder[i] = ouder[ouder[i]]; return i; }
  for (var u = 0; u < n; u++) for (var v = u + 1; v < n; v++) {
    var R = dik[u], S = dik[v], m = 2000; // gevelopeningen tot 2 m overbruggen, schaalstok ligt verder weg
    if (R[0] - m < S[2] && S[0] - m < R[2] && R[1] - m < S[3] && S[1] - m < R[3]) ouder[wortel(u)] = wortel(v);
  }
  var groep = {};
  dik.forEach(function (r, i) { var w = wortel(i); groep[w] = (groep[w] || 0) + (r[2] - r[0]) * (r[3] - r[1]); });
  var beste = Object.keys(groep).sort(function (x, y) { return groep[y] - groep[x]; })[0];
  var wanden = dik.filter(function (_, i) { return String(wortel(i)) === beste; });
  if (!wanden.length) return null;

  var bx0 = Math.min.apply(null, wanden.map(function (r) { return r[0]; })), by0 = Math.min.apply(null, wanden.map(function (r) { return r[1]; }));
  var bx1 = Math.max.apply(null, wanden.map(function (r) { return r[2]; })), by1 = Math.max.apply(null, wanden.map(function (r) { return r[3]; }));

  // --- teksten in mm (pdf.js geeft de tekstmatrix in PDF-ruimte; via de viewport naar y-omlaag)
  var teksten = tekst.items.map(function (t) {
    var pt = tp(vp.transform, t.transform[4], t.transform[5]);
    return { s: t.str.trim(), x: (pt[0] + t.width / 2) * MM, y: (pt[1] - Math.abs(t.transform[3]) / 2) * MM };
  }).filter(function (t) { return t.s; });

  var labels = teksten.filter(function (t) {
    return KAMERS.test(t.s) && t.x > bx0 && t.x < bx1 && t.y > by0 && t.y < by1;
  });

  // --- hoogtelijnen onder de kap: "1500+ vloer", en "nok"
  var hl = teksten.filter(function (t) { return /^\d{3,4}\s*\+\s*vloer$/i.test(t.s) && t.y > by0 && t.y < by1; })
    .map(function (t) { return { y: t.y, z: parseInt(t.s, 10) }; });
  var nokT = teksten.filter(function (t) { return /^nok$/i.test(t.s); })[0];
  var kap = null;
  if (hl.length >= 3) {
    var nokY = nokT ? nokT.y : hl.reduce(function (s, h) { return s + h.y; }, 0) / hl.length;
    // z = zNok - k * |y - nokY|, kleinste kwadraten
    var X = hl.map(function (h) { return Math.abs(h.y - nokY); }), Z = hl.map(function (h) { return h.z; });
    var mx = X.reduce(function (s, x) { return s + x; }, 0) / X.length, mz = Z.reduce(function (s, z) { return s + z; }, 0) / Z.length;
    var num = 0, den = 0;
    X.forEach(function (x, i) { num += (x - mx) * (Z[i] - mz); den += (x - mx) * (x - mx); });
    var k = -num / den, zNok = mz + k * mx;
    kap = { nokY: nokY, zNok: zNok, k: k };
  }

  return { naam: naamM ? naamM[1] : 'Verdieping', schaal: schaal, wanden: wanden, labels: labels, kap: kap, kader: [bx0, by0, bx1, by1],
    bogen: bogen.filter(function (b) { return b[0] >= bx0 && b[2] <= bx1; }) };
}

/* Ruimtes vinden: raster van 50 mm, wanden verdikt zodat deuropeningen dichtgaan,
   vullen vanaf elk label, en daarna het gebied weer tot tegen de echte wand laten groeien. */
function ruimtes(v) {
  var C = 50, k = v.kader, W = Math.ceil((k[2] - k[0]) / C) + 2, Hh = Math.ceil((k[3] - k[1]) / C) + 2;
  var muur = new Uint8Array(W * Hh);
  v.wanden.forEach(function (r) {
    for (var y = Math.floor((r[1] - k[1]) / C); y <= Math.ceil((r[3] - k[1]) / C); y++)
      for (var x = Math.floor((r[0] - k[0]) / C); x <= Math.ceil((r[2] - k[0]) / C); x++)
        if (x >= 0 && y >= 0 && x < W && y < Hh) muur[y * W + x] = 1;
  });
  // afstand tot de dichtstbijzijnde wand (in cellen), twee-staps chamfer
  var d = new Float32Array(W * Hh);
  for (var i = 0; i < d.length; i++) d[i] = muur[i] ? 0 : 1e9;
  for (var y = 0; y < Hh; y++) for (var x = 0; x < W; x++) {
    var j = y * W + x;
    if (x > 0) d[j] = Math.min(d[j], d[j - 1] + 1);
    if (y > 0) d[j] = Math.min(d[j], d[j - W] + 1);
    if (x > 0 && y > 0) d[j] = Math.min(d[j], d[j - W - 1] + 1.414);
    if (x < W - 1 && y > 0) d[j] = Math.min(d[j], d[j - W + 1] + 1.414);
  }
  for (y = Hh - 1; y >= 0; y--) for (x = W - 1; x >= 0; x--) {
    j = y * W + x;
    if (x < W - 1) d[j] = Math.min(d[j], d[j + 1] + 1);
    if (y < Hh - 1) d[j] = Math.min(d[j], d[j + W] + 1);
    if (x < W - 1 && y < Hh - 1) d[j] = Math.min(d[j], d[j + W + 1] + 1.414);
    if (x > 0 && y < Hh - 1) d[j] = Math.min(d[j], d[j + W - 1] + 1.414);
  }
  // buiten = een cel waarvan je in minstens drie richtingen de rand haalt zonder wand
  var buiten = new Uint8Array(W * Hh);
  for (y = 0; y < Hh; y++) for (x = 0; x < W; x++) {
    j = y * W + x; if (muur[j]) continue;
    var vrij = 0, xx, yy;
    for (xx = x; xx >= 0 && !muur[y * W + xx]; xx--); if (xx < 0) vrij++;
    for (xx = x; xx < W && !muur[y * W + xx]; xx++); if (xx >= W) vrij++;
    for (yy = y; yy >= 0 && !muur[yy * W + x]; yy--); if (yy < 0) vrij++;
    for (yy = y; yy < Hh && !muur[yy * W + x]; yy++); if (yy >= Hh) vrij++;
    if (vrij >= 3) buiten[j] = 1;
  }

  // binnen = alleen waar links én rechts een wand staat (voorkomt spouw, luifel en schoorsteen)
  var bx0k = k[0], bx1k = k[2];
  function dekking(zijde) {
    var st = v.wanden.filter(function (r) { return (r[3] - r[1]) > 3 * (r[2] - r[0]) && (zijde ? r[2] > bx1k - 450 : r[0] < bx0k + 450); })
      .map(function (r) { return [r[1], r[3]]; }).sort(function (a, b) { return a[0] - b[0]; });
    var lo = st.length ? st[0][0] : k[1], hi = lo;
    st.forEach(function (q) { if (q[0] <= hi + 200) hi = Math.max(hi, q[1]); });
    return [lo, hi];
  }
  var L = dekking(0), Rr = dekking(1), ylo = Math.max(L[0], Rr[0]), yhi = Math.min(L[1], Rr[1]);
  for (y = 0; y < Hh; y++) { var ym = y * C + k[1]; if (ym < ylo || ym > yhi) for (x = 0; x < W; x++) buiten[y * W + x] = 1; }
  v.binnenY = [ylo, yhi];

  // Stroomgebied op de afstandskaart: elke kamer groeit vanuit zijn label, brede delen eerst.
  // Twee kamers ontmoeten elkaar daardoor in de smalste doorgang: de deur.
  var regio = new Int32Array(W * Hh).fill(-1), heap = [];
  function duw(c, pr) { heap.push([pr, c]); var i = heap.length - 1; while (i > 0) { var o = (i - 1) >> 1; if (heap[o][0] >= heap[i][0]) break; var t = heap[o]; heap[o] = heap[i]; heap[i] = t; i = o; } }
  function pak() { var top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; var i = 0; for (;;) { var l = 2 * i + 1, r = l + 1, m = i; if (l < heap.length && heap[l][0] > heap[m][0]) m = l; if (r < heap.length && heap[r][0] > heap[m][0]) m = r; if (m === i) break; var t = heap[m]; heap[m] = heap[i]; heap[i] = t; i = m; } } return top; }
  var zaden = [];
  v.labels.forEach(function (l, id) {
    var sx = Math.round((l.x - k[0]) / C), sy = Math.round((l.y - k[1]) / C), best = -1e9, bc = -1;
    for (var dy = -10; dy <= 10; dy++) for (var dx = -10; dx <= 10; dx++) {
      var xx2 = sx + dx, yy2 = sy + dy; if (xx2 < 0 || yy2 < 0 || xx2 >= W || yy2 >= Hh) continue;
      var c = yy2 * W + xx2; if (muur[c] || buiten[c]) continue;
      var sc = -Math.sqrt(dx * dx + dy * dy); // dichtstbijzijnde vrije cel: een label staat ín zijn kamer
      if (sc > best) { best = sc; bc = c; }
    }
    // vanaf het label bergop klimmen op de afstandskaart: naar het midden van dezelfde kamer,
    // nooit door een deur (daar daalt de afstand eerst)
    if (bc >= 0) for (var klim = 0; klim < 400; klim++) {
      var nb2 = -1, hoog = d[bc];
      [bc - 1, bc + 1, bc - W, bc + W, bc - W - 1, bc - W + 1, bc + W - 1, bc + W + 1].forEach(function (q) {
        if (q >= 0 && q < d.length && !muur[q] && !buiten[q] && d[q] > hoog) { hoog = d[q]; nb2 = q; }
      });
      if (nb2 < 0) break; bc = nb2;
    }
    if (bc >= 0 && regio[bc] < 0) { regio[bc] = id; duw(bc, d[bc]); zaden.push(id); }
  });
  while (heap.length) {
    var it = pak(), c5 = it[1], id5 = regio[c5];
    [c5 - 1, c5 + 1, c5 - W, c5 + W].forEach(function (nb) {
      if (nb < 0 || nb >= d.length || regio[nb] >= 0 || muur[nb] || buiten[nb]) return;
      regio[nb] = id5; duw(nb, Math.min(d[nb], it[0]));
    });
  }
  // open ruimtes: twee gebieden die over meer dan 1,2 m aan elkaar grenzen zijn één ruimte
  var contact = {};
  for (j = 0; j < regio.length; j++) {
    if (regio[j] < 0) continue;
    [j + 1, j + W].forEach(function (nb) {
      if (nb < regio.length && regio[nb] >= 0 && regio[nb] !== regio[j]) {
        var a1 = Math.min(regio[j], regio[nb]), b1 = Math.max(regio[j], regio[nb]);
        var cx = j % W, cy = (j / W) | 0, key0 = a1 + '|' + b1, z = contact[key0] || [1e9, 1e9, -1e9, -1e9];
        contact[key0] = [Math.min(z[0], cx), Math.min(z[1], cy), Math.max(z[2], cx), Math.max(z[3], cy)];
      }
    });
  }
  var baas = v.labels.map(function (_, i) { return i; });
  function hoofd(i) { while (baas[i] !== i) i = baas[i]; return i; }
  Object.keys(contact).forEach(function (key) {
    var z = contact[key];
    if (Math.max(z[2] - z[0], z[3] - z[1]) * C > 1200) { var pr = key.split('|').map(Number); baas[hoofd(pr[1])] = hoofd(pr[0]); }
  });
  var tel = {};
  for (j = 0; j < regio.length; j++) if (regio[j] >= 0) { var h = hoofd(regio[j]); tel[h] = (tel[h] || 0) + 1; }
  var groepen = {};
  v.labels.forEach(function (l, i) { var h = hoofd(i); (groepen[h] = groepen[h] || []).push(l); });
  // vloerstroken per ruimte (voor het inkleuren), rij voor rij samengevoegd
  var stroken = {};
  for (y = 0; y < Hh; y++) {
    var start = -1, wie = -1;
    for (x = 0; x <= W; x++) {
      var r0 = x < W && regio[y * W + x] >= 0 ? hoofd(regio[y * W + x]) : -1;
      if (r0 !== wie) {
        if (wie >= 0) {
          var lijst = stroken[wie] = stroken[wie] || [], vorige = lijst[lijst.length - 1];
          var nx0 = start * C + k[0], nx1 = x * C + k[0], ny = y * C + k[1];
          if (vorige && vorige[0] === nx0 && vorige[2] === nx1 && vorige[3] === ny) vorige[3] = ny + C;
          else lijst.push([nx0, ny, nx1, ny + C]);
        }
        start = x; wie = r0;
      }
    }
  }
  // deuren: draaicirkels binnen de woning, niet tegen de gevel (voordeur, tuindeuren)
  v.deuren = (v.bogen || []).filter(function (b) { return b[1] > ylo + 60 && b[3] < yhi - 60; }).map(function (b) {
    // welke ruimtes raakt de draaicirkel (met 20 cm marge)?
    var raakt = {};
    for (var yy = Math.floor((b[1] - 100 - k[1]) / C); yy <= Math.ceil((b[3] + 100 - k[1]) / C); yy++)
      for (var xx = Math.floor((b[0] - 100 - k[0]) / C); xx <= Math.ceil((b[2] + 100 - k[0]) / C); xx++) {
        if (xx < 0 || yy < 0 || xx >= W || yy >= Hh) continue;
        var c = yy * W + xx; if (regio[c] >= 0) raakt[hoofd(regio[c])] = 1;
      }
    return { x: (b[0] + b[2]) / 2, y: (b[1] + b[3]) / 2, breedte: Math.max(b[2] - b[0], b[3] - b[1]), raakt: Object.keys(raakt).map(Number) };
  });
  var namen = {};
  var uitk = Object.keys(groepen).map(function (h) {
    var ls = groepen[h];
    var nm = ls.map(function (l) { var s0 = l.s; return NETTE[s0.toLowerCase()] || (s0.charAt(0).toUpperCase() + s0.slice(1)); });
    var naam = nm.length > 1 ? nm.slice(0, -1).join(', ') + ' en ' + nm[nm.length - 1].toLowerCase() : nm[0];
    namen[h] = naam;
    return { id: +h, naam: naam, m2: (tel[h] || 0) * C * C / 1e6, x: ls[0].x, y: ls[0].y, stroken: stroken[h] || [] };
  });
  // Een deur heet naar de ruimte die hij afsluit, niet naar de gang waar hij in draait.
  var VOORRANG = ['toilet', 'badkamer', 'meterkast', 'trapkast', 'wasruimte', 'berging', 'bijkeuken', 'technische', 'onbenoemde',
    'werkkamer', 'studeerkamer', 'slaapkamer', 'woonkamer', 'keuken', 'zolder', 'overloop', 'hal', 'entree'];
  function rang(naam) { var n = naam.toLowerCase(); for (var i = 0; i < VOORRANG.length; i++) if (n.indexOf(VOORRANG[i]) === 0) return i; return 50; }
  // Elke kamer heeft meestal één deur: wijs uniek toe, deuren met de minste keus eerst.
  var bezet = {}, VRIJ = /^(woonkamer|keuken|overloop|hal|entree)/i;
  v.deuren.map(function (d, i) { return i; })
    .sort(function (a, b) { return (v.deuren[a].raakt.length - v.deuren[b].raakt.length) || (v.deuren[a].breedte - v.deuren[b].breedte); })
    .forEach(function (i) {
      var d = v.deuren[i];
      // eerst echte kamers, verkeersruimte achteraan; daarbinnen de kleinste eerst
      var kand = d.raakt.filter(function (h) { return namen[h]; }).sort(function (a, b) {
        return (VRIJ.test(namen[a]) - VRIJ.test(namen[b])) || ((tel[a] || 0) - (tel[b] || 0));
      }).map(function (h) { return namen[h]; });
      var nm = kand.filter(function (n) { return !bezet[n] || VRIJ.test(n); })[0] || kand[0] || 'Binnendeur';
      bezet[nm] = (bezet[nm] || 0) + 1;
      d.naar = nm + (bezet[nm] > 1 ? ' (' + bezet[nm] + ')' : '');
    });
  return uitk;
}

export async function leesPdf(pdfjsLib, data) {
  var doc = await pdfjsLib.getDocument({ data: data }).promise;
  var lagen = [];
  for (var p = 1; p <= doc.numPages; p++) {
    var v = await leesPagina(pdfjsLib, await doc.getPage(p));
    if (!v || v.wanden.length < 4) continue;
    v.ruimtes = ruimtes(v);
    lagen.push(v);
  }
  return lagen;
}
