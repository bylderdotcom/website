// auping-popup.js — Bylder.com
// Zelfstandig popup script, werkt op alle pagina's
// Logo en stijl zijn ingebakken, geen externe afhankelijkheden

(function(){
  if(localStorage.getItem('aupingPopupDismissed')) return;
  if(document.getElementById('aupingPopup')) return; // al aanwezig (homepage)

  // ── CSS ──────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    @keyframes aupingSlideUp {
      from {opacity:0;transform:translateY(50px)}
      to   {opacity:1;transform:translateY(0)}
    }
    #aupingPopup {
      display:none;position:fixed;inset:0;
      background:rgba(0,0,0,0.65);
      backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
      z-index:99999;
      align-items:flex-end;justify-content:center;padding:0;
    }
    @media(min-width:600px){
      #aupingPopup{align-items:center;padding:20px;}
      #aupingPopupInner{border-radius:20px!important;max-width:480px!important;}
    }
    #aupingPopupInner{
      background:#fff;
      border-radius:20px 20px 0 0;
      width:100%;max-width:100%;
      overflow:hidden;
      box-shadow:0 -8px 40px rgba(0,0,0,0.25);
      animation:aupingSlideUp 0.35s cubic-bezier(0.34,1.4,0.64,1);
      padding-bottom:env(safe-area-inset-bottom);
      max-height:92dvh;overflow-y:auto;
      -webkit-overflow-scrolling:touch;
    }
    .auping-drag{width:40px;height:4px;background:rgba(0,0,0,0.15);border-radius:2px;margin:10px auto 0;}
    .auping-hdr{background:#003B6F;padding:20px 20px 22px;position:relative;}
    .auping-close{
      position:absolute;top:14px;right:14px;
      background:rgba(255,255,255,0.15);border:none;color:#fff;
      width:34px;height:34px;border-radius:50%;cursor:pointer;
      font-size:20px;line-height:1;
      display:flex;align-items:center;justify-content:center;
      -webkit-tap-highlight-color:transparent;touch-action:manipulation;
    }
    .auping-logorow{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
    .auping-bylder{background:rgba(61,90,62,0.9);border-radius:6px;padding:6px 11px;font-size:13px;font-weight:800;color:#F5F0E8;font-family:'Plus Jakarta Sans',sans-serif;}
    .auping-label{font-size:10px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.5);margin-bottom:7px;}
    .auping-title{font-size:19px;font-weight:800;color:#fff;letter-spacing:-.02em;line-height:1.25;font-family:'Plus Jakarta Sans',sans-serif;}
    .auping-body{padding:18px 16px 16px;display:flex;flex-direction:column;gap:10px;}
    .auping-perk{display:flex;align-items:flex-start;gap:12px;padding:13px;background:#EEF3F9;border-radius:12px;}
    .auping-perk-num{width:34px;height:34px;background:#003B6F;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#fff;font-family:'Space Mono',monospace;flex-shrink:0;}
    .auping-perk-t{font-size:14px;font-weight:800;color:#003B6F;margin-bottom:2px;font-family:'Plus Jakarta Sans',sans-serif;}
    .auping-perk-d{font-size:12px;color:#2D4A6B;line-height:1.5;font-family:'Plus Jakarta Sans',sans-serif;}
    .auping-loc{font-size:11px;color:rgba(0,59,111,.45);text-align:center;font-family:'Space Mono',monospace;letter-spacing:.06em;padding-top:2px;}
    .auping-cta{display:block;background:#003B6F;color:#fff;padding:15px;border-radius:12px;font-size:15px;font-weight:800;text-decoration:none;text-align:center;font-family:'Plus Jakarta Sans',sans-serif;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}
    .auping-dismiss{background:none;border:none;color:rgba(61,46,30,.4);font-size:13px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;padding:6px;width:100%;-webkit-tap-highlight-color:transparent;}
  `;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────────────────
  var div = document.createElement('div');
  div.id = 'aupingPopup';
  div.innerHTML = `
    <div id="aupingPopupInner">
      <div class="auping-drag"></div>
      <div class="auping-hdr">
        <button class="auping-close" onclick="window._sluitAupingPopup()" aria-label="Sluiten">&#215;</button>
        <div class="auping-logorow">
          <img src="data:image/png;base64,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" alt="Auping" style="height:26px;display:block;">
          <span style="color:rgba(255,255,255,.35);font-size:13px;">&#215;</span>
          <span class="auping-bylder">Bylder.com</span>
        </div>
        <div class="auping-label">Exclusief voor Bylder-leden</div>
        <div class="auping-title">Drie voordelen bij<br>Auping Rotterdam Centrum</div>
      </div>
      <div class="auping-body">
        <div class="auping-perk">
          <div class="auping-perk-num">1</div>
          <div><div class="auping-perk-t">10% korting op alles</div><div class="auping-perk-d">Op het volledige assortiment — boxsprings, matrassen en bedframes. Geen minimumbesteding.</div></div>
        </div>
        <div class="auping-perk">
          <div class="auping-perk-num">2</div>
          <div><div class="auping-perk-t">&#128705; Gratis leenbed</div><div class="auping-perk-d">Slaap comfortabel tijdens de levertijd van je Auping. <strong>Vanaf &#8364;5.000 besteding.</strong></div></div>
        </div>
        <div class="auping-perk" style="background:linear-gradient(135deg,#EEF3F9,#dce6f0);border:1px solid rgba(0,59,111,0.12);">
          <div class="auping-perk-num">3</div>
          <div><div class="auping-perk-t">&#127976; Gratis Hotel Haverkist</div><div class="auping-perk-d">Overnachting + ontbijt voor 2 in Den Bosch, t.w.v. &#8364;199. <strong>Vanaf &#8364;6.500 besteding.</strong></div></div>
        </div>
        <div class="auping-loc">UITSLUITEND GELDIG BIJ AUPING ROTTERDAM CENTRUM</div>
        <a class="auping-cta" href="/vouchers/auping/" onclick="window._sluitAupingPopup()">Bekijk alle Auping voordelen &#8594;</a>
        <button class="auping-dismiss" onclick="window._sluitAupingPopup();localStorage.setItem('aupingPopupDismissed','1')">Niet meer tonen</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);

  // ── Functies ──────────────────────────────────────────────────────────
  window._sluitAupingPopup = function(){
    document.getElementById('aupingPopup').style.display='none';
  };

  // Sluit op backdrop klik
  div.addEventListener('click', function(e){ if(e.target===this) window._sluitAupingPopup(); });

  // Swipe omlaag = sluiten
  var inner = div.querySelector('#aupingPopupInner');
  var startY = 0;
  inner.addEventListener('touchstart', function(e){ startY=e.touches[0].clientY; }, {passive:true});
  inner.addEventListener('touchend',   function(e){ if(e.changedTouches[0].clientY - startY > 60) window._sluitAupingPopup(); }, {passive:true});

  // Toon na 4 seconden
  setTimeout(function(){ div.style.display='flex'; }, 4000);

})();
