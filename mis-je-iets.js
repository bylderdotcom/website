// mis-je-iets.js — Bylder.com
// Vraagt bezoekers wat ze missen of niet vinden. Zelfstandig script zonder
// afhankelijkheden, net als auping-popup.js, zodat het op elke gegenereerde
// pagina kan staan.
//
// Bewust onopdringerig: geen popup, geen overlay, geen timer die iets over de
// pagina schuift. Een strook onderaan de pagina die pas opengaat als iemand
// erop klikt. Wie niks wil zeggen, merkt er niets van.

(function () {
  if (document.getElementById('bylderMisJeIets')) return;
  try {
    if (localStorage.getItem('bylderMisJeIetsVerstuurd')) return;
  } catch (e) {
    /* privacymodus: dan maar elke keer tonen */
  }

  var GEOPEND = Date.now();

  var style = document.createElement('style');
  style.textContent = [
    '#bylderMisJeIets{--bmji-bark:#1A1208;--bmji-moss:#3D5A3E;--bmji-cream:#F5F0E8;',
    'margin:48px auto 0;max-width:720px;padding:0 20px 40px;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
    '#bylderMisJeIets .bmji-open{display:flex;align-items:center;gap:9px;margin:0 auto;',
    'background:none;border:none;cursor:pointer;color:rgba(26,18,8,0.55);font:inherit;',
    'font-size:13.5px;text-decoration:underline;text-underline-offset:3px;padding:6px;}',
    '#bylderMisJeIets .bmji-open:hover{color:var(--bmji-moss);}',
    '#bylderMisJeIets .bmji-paneel{display:none;background:#fff;',
    'border:1px solid rgba(26,18,8,0.12);border-radius:16px;padding:20px;}',
    '#bylderMisJeIets.bmji-uit .bmji-open{display:none;}',
    '#bylderMisJeIets.bmji-uit .bmji-paneel{display:block;}',
    '#bylderMisJeIets label{display:block;font-size:13.5px;font-weight:700;',
    'color:var(--bmji-bark);margin-bottom:8px;}',
    '#bylderMisJeIets .bmji-hint{font-size:12.5px;color:rgba(26,18,8,0.5);',
    'font-weight:400;margin:0 0 12px;line-height:1.5;}',
    '#bylderMisJeIets textarea,#bylderMisJeIets input[type=email]{width:100%;',
    'box-sizing:border-box;padding:11px 14px;border:1.5px solid rgba(26,18,8,0.12);',
    'border-radius:10px;font:inherit;font-size:14px;color:var(--bmji-bark);',
    'background:#fff;resize:vertical;}',
    '#bylderMisJeIets textarea:focus,#bylderMisJeIets input[type=email]:focus{',
    'outline:none;border-color:var(--bmji-moss);}',
    '#bylderMisJeIets .bmji-mail{margin-top:10px;}',
    '#bylderMisJeIets .bmji-rij{display:flex;gap:10px;align-items:center;margin-top:14px;}',
    '#bylderMisJeIets .bmji-stuur{padding:11px 20px;border-radius:10px;border:none;',
    'background:var(--bmji-moss);color:var(--bmji-cream);font:inherit;font-size:13.5px;',
    'font-weight:700;cursor:pointer;}',
    '#bylderMisJeIets .bmji-stuur[disabled]{opacity:0.5;cursor:default;}',
    '#bylderMisJeIets .bmji-annuleer{background:none;border:none;font:inherit;',
    'font-size:13px;color:rgba(26,18,8,0.45);cursor:pointer;text-decoration:underline;',
    'text-underline-offset:3px;}',
    '#bylderMisJeIets .bmji-melding{font-size:13px;margin-top:10px;line-height:1.5;}',
    '#bylderMisJeIets .bmji-fout{color:#B85C38;}',
    '#bylderMisJeIets .bmji-hp{position:absolute;left:-9999px;width:1px;height:1px;',
    'overflow:hidden;}',
    '@media(prefers-reduced-motion:no-preference){',
    '#bylderMisJeIets .bmji-paneel{animation:bmjiIn .18s ease-out;}}',
    '@keyframes bmjiIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
  ].join('');
  document.head.appendChild(style);

  var wrap = document.createElement('section');
  wrap.id = 'bylderMisJeIets';
  wrap.setAttribute('aria-label', 'Iets missen op deze pagina');
  wrap.innerHTML = [
    '<button type="button" class="bmji-open">',
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ',
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    'Mis je iets op deze pagina?</button>',
    '<div class="bmji-paneel">',
    '<label for="bmji-tekst">Wat zocht je, maar vond je niet?</label>',
    '<p class="bmji-hint">Eén zin is genoeg. We lezen alles zelf — komt iets vaker terug, ',
    'dan bouwen of regelen we het.</p>',
    '<textarea id="bmji-tekst" rows="3" placeholder="Bijv. de prijzen per m² voor mijn regio"></textarea>',
    '<div class="bmji-hp" aria-hidden="true">',
    '<label for="bmji-website">Laat dit veld leeg</label>',
    '<input type="text" id="bmji-website" tabindex="-1" autocomplete="off"></div>',
    '<div class="bmji-mail">',
    '<input type="email" id="bmji-mail" placeholder="E-mail (optioneel — alleen om je te laten weten als het er is)" ',
    'aria-label="E-mailadres, optioneel"></div>',
    '<div class="bmji-rij">',
    '<button type="button" class="bmji-stuur">Versturen</button>',
    '<button type="button" class="bmji-annuleer">Laat maar</button></div>',
    '<p class="bmji-melding" role="status"></p>',
    '</div>',
  ].join('');

  function plaats() {
    var doel = document.querySelector('main') || document.body;
    doel.appendChild(wrap);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', plaats);
  } else {
    plaats();
  }

  var open = wrap.querySelector('.bmji-open');
  var tekst = wrap.querySelector('#bmji-tekst');
  var mail = wrap.querySelector('#bmji-mail');
  var hp = wrap.querySelector('#bmji-website');
  var stuur = wrap.querySelector('.bmji-stuur');
  var annuleer = wrap.querySelector('.bmji-annuleer');
  var melding = wrap.querySelector('.bmji-melding');

  open.addEventListener('click', function () {
    wrap.classList.add('bmji-uit');
    tekst.focus();
  });

  annuleer.addEventListener('click', function () {
    wrap.classList.remove('bmji-uit');
    melding.textContent = '';
  });

  stuur.addEventListener('click', function () {
    var t = (tekst.value || '').trim();
    melding.className = 'bmji-melding';
    if (t.length < 3) {
      melding.className = 'bmji-melding bmji-fout';
      melding.textContent = 'Vertel kort wat je mist.';
      return;
    }

    stuur.disabled = true;
    stuur.textContent = 'Versturen…';

    fetch('/api/feature-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tekst: t,
        email: (mail.value || '').trim() || null,
        website: hp.value || '',
        seconden: (Date.now() - GEOPEND) / 1000,
        url: location.pathname,
        context: document.title.slice(0, 120),
      }),
    })
      .then(function (r) {
        return r.json().then(function (d) { return { ok: r.ok, d: d }; });
      })
      .then(function (res) {
        if (!res.ok) throw new Error((res.d && res.d.error) || 'Versturen mislukt.');
        try { localStorage.setItem('bylderMisJeIetsVerstuurd', '1'); } catch (e) {}
        wrap.querySelector('.bmji-paneel').innerHTML =
          '<p style="font-size:14px;font-weight:700;color:#1A1208;margin:0 0 4px">Genoteerd — dank je.</p>' +
          '<p style="font-size:13px;color:rgba(26,18,8,0.55);margin:0;line-height:1.55">' +
          'We lezen het zelf. Komt het vaker terug, dan pakken we het op.</p>';
      })
      .catch(function (e) {
        stuur.disabled = false;
        stuur.textContent = 'Versturen';
        melding.className = 'bmji-melding bmji-fout';
        melding.textContent = e.message || 'Versturen mislukt.';
      });
  });
})();
