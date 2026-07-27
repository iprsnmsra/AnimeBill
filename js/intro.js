/* ══════════════════════════════════════════════════════
   AnimeBill — Manga Loading Intro Script
   Builds SVG mountain scene + handwritten "Anime Bill"
   © AnimeBill by iprsnmsra
   ══════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── Create overlay container ───
  var overlay = document.createElement("div");
  overlay.className = "intro-overlay";
  overlay.id = "introOverlay";

  // ─── MOUNTAIN SVG — Sharp dramatic peaks ───
  var mountainSVG = '<svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" aria-label="Ink-drawn mountain landscape">'

    // Sky hatching
    + '<g opacity="0.05">'
    + '<line x1="0" y1="30" x2="800" y2="28" stroke="#1a1a1a" stroke-width="0.5"/>'
    + '<line x1="0" y1="50" x2="800" y2="52" stroke="#1a1a1a" stroke-width="0.4"/>'
    + '<line x1="0" y1="68" x2="800" y2="66" stroke="#1a1a1a" stroke-width="0.3"/>'
    + '</g>'

    // ── Far mountain range (lighter, background) ──
    + '<path class="mountain-fill" d="M0,210 L80,180 L130,145 L165,170 L220,110 L270,150 L320,90 L370,140 L430,75 L480,130 L530,95 L580,135 L640,105 L700,145 L750,120 L800,155 L800,280 L0,280 Z" fill="#e8e5e0" style="--fill-delay:1.6s"/>'
    + '<path class="mountain-stroke" d="M0,210 L80,180 L130,145 L165,170 L220,110 L270,150 L320,90 L370,140 L430,75 L480,130 L530,95 L580,135 L640,105 L700,145 L750,120 L800,155" stroke-width="1.5" style="--path-len:1500;--draw-dur:2.2s;--draw-delay:0s"/>'

    // Snow on far peaks
    + '<path class="snow-stroke" d="M315,92 L320,85 L330,92 L325,96" style="--path-len:30;--draw-dur:0.5s;--draw-delay:1.8s"/>'
    + '<path class="snow-stroke" d="M425,78 L430,70 L440,78 L435,82" style="--path-len:30;--draw-dur:0.5s;--draw-delay:2s"/>'
    + '<path class="snow-stroke" d="M525,98 L530,90 L538,97" style="--path-len:25;--draw-dur:0.4s;--draw-delay:2.1s"/>'

    // ── Main left mountain — sharp jagged peak ──
    + '<path class="mountain-fill" d="M-20,265 L50,220 L100,185 L130,205 L170,140 L200,170 L245,68 L285,145 L320,120 L360,165 L400,195 L430,250 L430,280 L-20,280 Z" fill="#d6d2cc" style="--fill-delay:2s"/>'
    + '<path class="mountain-stroke" d="M-20,265 L50,220 L100,185 L130,205 L170,140 L200,170 L245,68 L285,145 L320,120 L360,165 L400,195 L430,250" stroke-width="2.5" style="--path-len:1000;--draw-dur:2s;--draw-delay:0.4s"/>'

    // Snow cap on left main peak
    + '<path class="mountain-fill" d="M230,80 L245,58 L260,80 L250,90 L238,88 Z" fill="#faf8f5" style="--fill-delay:2.4s"/>'
    + '<path class="snow-stroke" d="M228,82 L245,55 L262,82" stroke-width="2" style="--path-len:80;--draw-dur:0.6s;--draw-delay:2.3s"/>'
    + '<path class="snow-stroke" d="M238,78 L248,73 L255,79" style="--path-len:25;--draw-dur:0.3s;--draw-delay:2.6s"/>'
    + '<path class="snow-stroke" d="M240,85 L250,82" style="--path-len:12;--draw-dur:0.2s;--draw-delay:2.7s"/>'

    // ── Main right mountain — sharp dramatic peak ──
    + '<path class="mountain-fill" d="M370,240 L420,200 L460,170 L490,190 L530,115 L560,150 L600,55 L640,140 L680,110 L720,155 L760,175 L800,210 L820,260 L820,280 L370,280 Z" fill="#ccc8c2" style="--fill-delay:2.2s"/>'
    + '<path class="mountain-stroke" d="M370,240 L420,200 L460,170 L490,190 L530,115 L560,150 L600,55 L640,140 L680,110 L720,155 L760,175 L800,210 L820,260" stroke-width="2.5" style="--path-len:1000;--draw-dur:2s;--draw-delay:0.7s"/>'

    // Snow cap on right peak
    + '<path class="mountain-fill" d="M585,68 L600,45 L615,68 L607,76 L592,74 Z" fill="#faf8f5" style="--fill-delay:2.6s"/>'
    + '<path class="snow-stroke" d="M583,70 L600,42 L617,70" stroke-width="2" style="--path-len:80;--draw-dur:0.6s;--draw-delay:2.5s"/>'
    + '<path class="snow-stroke" d="M592,66 L602,62 L610,67" style="--path-len:25;--draw-dur:0.3s;--draw-delay:2.8s"/>'

    // Ridge detail lines
    + '<path class="detail-stroke" d="M140,195 L160,188 L180,194" style="--path-len:45;--draw-dur:0.4s;--draw-delay:2.5s"/>'
    + '<path class="detail-stroke" d="M310,135 L330,128 L348,133" style="--path-len:45;--draw-dur:0.4s;--draw-delay:2.6s"/>'
    + '<path class="detail-stroke" d="M500,175 L520,168 L538,173" style="--path-len:45;--draw-dur:0.4s;--draw-delay:2.7s"/>'
    + '<path class="detail-stroke" d="M690,130 L710,122 L728,128" style="--path-len:45;--draw-dur:0.4s;--draw-delay:2.8s"/>'

    // Trees at base
    + '<g class="detail-stroke" style="--path-len:35;--draw-dur:0.3s;--draw-delay:2.9s">'
    + '<path d="M60,260 L67,244 L74,260"/><path d="M80,258 L87,240 L94,258"/><path d="M100,256 L106,242 L112,256"/>'
    + '</g>'
    + '<g class="detail-stroke" style="--path-len:35;--draw-dur:0.3s;--draw-delay:3s">'
    + '<path d="M360,240 L367,226 L374,240"/><path d="M380,242 L386,228 L392,242"/>'
    + '</g>'
    + '<g class="detail-stroke" style="--path-len:35;--draw-dur:0.3s;--draw-delay:3.1s">'
    + '<path d="M460,252 L467,236 L474,252"/><path d="M480,250 L487,234 L494,250"/><path d="M500,254 L506,240 L512,254"/>'
    + '</g>'

    // Ground line
    + '<path class="mountain-stroke" d="M0,268 L200,265 L400,268 L600,264 L800,267" stroke-width="0.8" style="--path-len:810;--draw-dur:1.2s;--draw-delay:2.5s"/>'

    // Ink splatter dots
    + '<circle cx="120" cy="255" r="1.5" fill="#1a1a1a" class="mountain-fill" style="--fill-delay:3.2s"/>'
    + '<circle cx="540" cy="248" r="1" fill="#1a1a1a" class="mountain-fill" style="--fill-delay:3.3s"/>'
    + '<circle cx="710" cy="240" r="1.2" fill="#1a1a1a" class="mountain-fill" style="--fill-delay:3.4s"/>'

    + '</svg>';

  // ─── TITLE SVG — "Anime Bill" ───
  var titleSVG = '<svg viewBox="0 0 420 80" xmlns="http://www.w3.org/2000/svg" aria-label="Anime Bill">'
    // A
    + '<path class="title-stroke" d="M18,65 L40,12 L62,65 M28,48 L52,48" style="--path-len:150"/>'
    // n
    + '<path class="title-stroke" d="M76,35 L76,65 M76,46 Q76,32 92,32 Q104,32 104,46 L104,65" style="--path-len:95"/>'
    // i
    + '<path class="title-stroke" d="M118,35 L118,65" style="--path-len:32"/>'
    + '<circle class="title-fill" cx="118" cy="25" r="2.8" fill="#1a1a1a" style="--fill-delay:3.8s"/>'
    // m
    + '<path class="title-stroke" d="M132,35 L132,65 M132,46 Q132,32 146,32 Q156,32 156,46 L156,65 M156,46 Q156,32 170,32 Q180,32 180,46 L180,65" style="--path-len:155"/>'
    // e
    + '<path class="title-stroke" d="M198,48 Q198,32 212,32 Q226,32 226,48 L196,48 Q196,65 212,67 Q225,65 228,56" style="--path-len:115"/>'

    // gap
    // B
    + '<path class="title-stroke" d="M262,12 L262,65 M262,12 Q290,12 290,28 Q290,38 262,38 M262,38 Q295,38 295,50 Q295,65 262,65" style="--path-len:195"/>'
    // i
    + '<path class="title-stroke" d="M312,35 L312,65" style="--path-len:32"/>'
    + '<circle class="title-fill" cx="312" cy="25" r="2.8" fill="#1a1a1a" style="--fill-delay:3.9s"/>'
    // l
    + '<path class="title-stroke" d="M328,12 L328,65" style="--path-len:55"/>'
    // l
    + '<path class="title-stroke" d="M344,12 L344,65" style="--path-len:55"/>'

    // Brush underline
    + '<path class="title-stroke" d="M12,73 Q100,69 210,71 Q330,73 355,71" stroke-width="2.5" opacity="0.25" style="--path-len:360"/>'
    + '</svg>';

  // ─── Build HTML ───
  overlay.innerHTML =
    '<div class="intro-scene">'
    + '<div class="intro-mountains">' + mountainSVG + '</div>'
    + '<div class="intro-title">' + titleSVG + '</div>'
    + '<div class="intro-loading">'
    + '  <div class="intro-bar-track"><div class="intro-bar-fill"></div></div>'
    + '  <span class="intro-loading-text">Loading...</span>'
    + '</div>'
    + '<div class="intro-copyright">'
    + '  <p>&copy; ' + new Date().getFullYear() + ' <span class="copy-name">AnimeBill</span> by <span class="copy-name">iprsnmsra</span></p>'
    + '  <p>All Rights Reserved</p>'
    + '</div>'
    + '</div>';

  // ─── Inject into DOM ───
  document.body.prepend(overlay);

  // ─── Auto-dismiss after animation completes ───
  var totalAnimDuration = 5400;
  setTimeout(function () {
    overlay.classList.add("intro-hidden");
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 700);
  }, totalAnimDuration);
})();
