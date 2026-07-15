// ═══════════════════════════════════════════════════════
// AnimeBill — Core Application Logic (v1.1 — PNG Fixed)
// © AnimeBill by iprsnmsra | github.com/iprsnmsra
// ═══════════════════════════════════════════════════════

'use strict';

// ─── State ───
let selectedCurrencySymbol = '₹';
let selectedCurrencyCode   = 'INR';
let currentCharacter       = null;
let currentQuote           = null;
let billGenerated          = false;
let currentBillNo          = null;

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  initItems();
  initCharacterSelect();
  currentCharacter = getRandomCharacter();
  currentQuote     = getRandomQuote();
});

// ──────────────────────────────────────────────────────
// ITEMS MANAGEMENT
// ──────────────────────────────────────────────────────

let itemIdCounter = 0;

function initItems() {
  addItem('Sample Product',   1, 299,  18);
  addItem('Another Item',     2, 149,   5);
}

function addItem(name = '', qty = 1, price = '', gst = 18) {
  itemIdCounter++;
  const list = document.getElementById('itemsList');

  if (itemIdCounter === 1) {
    const hdr = document.createElement('div');
    hdr.className = 'items-col-header';
    hdr.id = 'colHeader';
    hdr.innerHTML = `<span>Item Name</span><span>Qty</span><span>Price</span><span>GST%</span><span></span>`;
    list.appendChild(hdr);
  }

  // Build GST rate options
  const gstRates = [0, 3, 5, 12, 18, 28];
  const gstOptions = gstRates.map(r =>
    `<option value="${r}" ${Number(r) === Number(gst) ? 'selected' : ''}>${r}%</option>`
  ).join('');

  const row = document.createElement('div');
  row.className = 'item-row';
  row.id = `item-${itemIdCounter}`;
  row.setAttribute('role', 'listitem');
  row.innerHTML = `
    <input type="text"   id="iname-${itemIdCounter}"  placeholder="Item name"  value="${escAttr(name)}"  oninput="liveUpdate()">
    <input type="number" id="iqty-${itemIdCounter}"   placeholder="1"          value="${qty}"   min="1" oninput="liveUpdate()">
    <input type="number" id="iprice-${itemIdCounter}" placeholder="0.00"       value="${price}" min="0" step="0.01" oninput="liveUpdate()">
    <select id="igst-${itemIdCounter}" class="gst-select" onchange="liveUpdate()" title="GST Rate">${gstOptions}</select>
    <button class="remove-item-btn" onclick="removeItem('item-${itemIdCounter}')" title="Remove item" aria-label="Remove item">×</button>
  `;
  list.appendChild(row);
  liveUpdate();
}

function removeItem(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.transition = 'all 0.18s ease';
  el.style.opacity = '0';
  el.style.transform = 'translateX(-12px)';
  setTimeout(() => { el.remove(); liveUpdate(); }, 190);
}

// ──────────────────────────────────────────────────────
// CURRENCY
// ──────────────────────────────────────────────────────

function selectCurrency(btn) {
  document.querySelectorAll('.currency-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  selectedCurrencySymbol = btn.dataset.symbol;
  selectedCurrencyCode   = btn.dataset.code;
  liveUpdate();
}

// ──────────────────────────────────────────────────────
// CHARACTER SELECT
// ──────────────────────────────────────────────────────

function initCharacterSelect() {
  const sel = document.getElementById('characterSelect');
  sel.innerHTML = '<option value="">— Choose Character —</option>';

  const grouped = {};
  ANIME_CHARACTERS.forEach(c => {
    if (!grouped[c.anime]) grouped[c.anime] = [];
    grouped[c.anime].push(c);
  });

  Object.entries(grouped).forEach(([anime, chars]) => {
    const grp = document.createElement('optgroup');
    grp.label = anime;
    chars.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      grp.appendChild(opt);
    });
    sel.appendChild(grp);
  });
}

function selectCharacter() {
  const id = document.getElementById('characterSelect').value;
  if (id) {
    currentCharacter = getCharacterById(id);
    liveUpdate();
    showToast(`🎌 ${currentCharacter.name} selected!`);
  }
}

function randomizeCharacter() {
  currentCharacter = getRandomCharacter();
  currentQuote     = getRandomQuote();
  document.getElementById('characterSelect').value = currentCharacter.id;
  liveUpdate();
  showToast(`🎲 ${currentCharacter.name} — ${currentCharacter.anime}`);
}

// ──────────────────────────────────────────────────────
// DATA COLLECTION
// ──────────────────────────────────────────────────────

function collectFormData() {
  const shopName    = document.getElementById('shopName').value.trim()    || 'Your Store';
  const shopAddress = document.getElementById('shopAddress').value.trim() || '';
  const shopPhone   = document.getElementById('shopPhone').value.trim()   || '';
  const gstin       = (document.getElementById('gstin')?.value || '').trim().toUpperCase();

  const items = [];
  document.querySelectorAll('.item-row').forEach(row => {
    const idx   = row.id.split('-')[1];
    const name  = (document.getElementById(`iname-${idx}`)?.value || '').trim();
    const qty   = Math.max(1, parseInt(document.getElementById(`iqty-${idx}`)?.value || '1') || 1);
    const price = parseFloat(document.getElementById(`iprice-${idx}`)?.value || '0') || 0;
    const gst   = parseFloat(document.getElementById(`igst-${idx}`)?.value  || '0') || 0;
    if (name) items.push({ name, qty, price, gst });
  });

  return { shopName, shopAddress, shopPhone, gstin, items };
}

// ──────────────────────────────────────────────────────
// FORMATTING HELPERS
// ──────────────────────────────────────────────────────

function fmt(amount) {
  const fixed = amount.toFixed(2);
  if (selectedCurrencyCode === 'INR') {
    const [intPart, dec] = fixed.split('.');
    let int = intPart, result = '';
    if (int.length > 3) {
      result = ',' + int.slice(-3);
      int = int.slice(0, -3);
      while (int.length > 2) { result = ',' + int.slice(-2) + result; int = int.slice(0, -2); }
      result = int + result;
    } else { result = int; }
    return `${selectedCurrencySymbol} ${result}.${dec}`;
  }
  return `${selectedCurrencySymbol} ${fixed}`;
}

function generateBillNo() {
  return 'AB-' + Math.floor(100000 + Math.random() * 900000);
}

function getDateTime() {
  const now = new Date();
  return {
    dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}

// ──────────────────────────────────────────────────────
// BILL HTML RENDERER
// ──────────────────────────────────────────────────────

function renderBillHTML(data, billNo, character, quote) {
  const { shopName, shopAddress, shopPhone, gstin, items } = data;
  const { dateStr, timeStr } = getDateTime();

  // ── GST Calculations ──────────────────────────────
  let subtotal = 0;
  let totalGst = 0;
  const gstGroups = {}; // { rate: { base, gstAmt } }

  items.forEach(item => {
    const lineAmt = item.qty * item.price;
    subtotal += lineAmt;
    const gstAmt = lineAmt * (item.gst || 0) / 100;
    totalGst += gstAmt;
    if ((item.gst || 0) > 0) {
      if (!gstGroups[item.gst]) gstGroups[item.gst] = { base: 0, gstAmt: 0 };
      gstGroups[item.gst].base   += lineAmt;
      gstGroups[item.gst].gstAmt += gstAmt;
    }
  });
  const grandTotal = subtotal + totalGst;
  const hasGst     = totalGst > 0;
  const itemCount  = items.reduce((a, i) => a + i.qty, 0);

  // ── Items Table HTML ─────────────────────────────
  const itemsHTML = items.length
    ? items.map((item, idx) => {
        const lineAmt = item.qty * item.price;
        const gstLabel = (item.gst || 0) > 0 ? `${item.gst}%` : '—';
        return `
          <div class="bill-item-row" style="background:${idx % 2 === 0 ? 'rgba(0,0,0,0.018)' : 'transparent'}">
            <span>${escHtml(item.name)}</span>
            <span class="bill-item-qty">${item.qty}</span>
            <span class="bill-item-price" style="text-align:right;font-size:0.75rem">${fmt(item.price)}</span>
            <span style="text-align:center;font-family:'Courier New',monospace;font-size:0.72rem;color:#666">${gstLabel}</span>
            <span class="bill-item-price">${fmt(lineAmt)}</span>
          </div>`;
      }).join('')
    : `<div class="bill-item-row" style="color:#999;font-style:italic;font-size:0.8rem"><span>No items added</span></div>`;

  // ── GST Breakdown Rows ────────────────────────────
  let gstRowsHTML = '';
  if (hasGst) {
    gstRowsHTML += `
      <div class="bill-total-row">
        <span>Taxable Amount</span>
        <span>${fmt(subtotal)}</span>
      </div>`;

    Object.entries(gstGroups)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([rate, grp]) => {
        const halfRate = Number(rate) / 2;
        const cgst     = grp.gstAmt / 2;
        const sgst     = grp.gstAmt / 2;
        gstRowsHTML += `
          <div class="bill-total-row gst-row">
            <span>CGST @ ${halfRate}% <span style="color:#aaa;font-size:0.6rem">(on ${fmt(grp.base)})</span></span>
            <span>${fmt(cgst)}</span>
          </div>
          <div class="bill-total-row gst-row">
            <span>SGST @ ${halfRate}% <span style="color:#aaa;font-size:0.6rem">(on ${fmt(grp.base)})</span></span>
            <span>${fmt(sgst)}</span>
          </div>`;
      });

    gstRowsHTML += `
      <div class="bill-total-row gst-separator" style="font-weight:600;color:#333">
        <span>Total GST</span>
        <span>${fmt(totalGst)}</span>
      </div>`;
  } else {
    gstRowsHTML = `
      <div class="bill-total-row">
        <span>Subtotal</span>
        <span>${fmt(subtotal)}</span>
      </div>`;
  }

  // ── GSTIN badge ─────────────────────────────────
  const gstinHTML = gstin
    ? `<div style="margin-top:0.25rem"><span class="bill-gstin-badge">GSTIN: ${escHtml(gstin)}</span></div>`
    : '';

  return `
    <div id="animeBill" class="bill-appear" data-billno="${escAttr(billNo)}">
      <div class="bill-sketch-bg">${buildSketchHTML(character)}</div>
      <div class="bill-scanlines"></div>
      <div class="bill-content">

        <div class="bill-header">
          <div class="bill-header-shine"></div>
          <div class="bill-shop-name">${escHtml(shopName)}</div>
          ${shopAddress ? `<div class="bill-shop-address">${escHtml(shopAddress)}</div>` : ''}
          ${shopPhone   ? `<div class="bill-shop-phone">📞 ${escHtml(shopPhone)}</div>`   : ''}
          ${gstinHTML}
        </div>

        <div class="bill-meta">
          <div class="bill-meta-left">
            <div class="bill-number">BILL #${escHtml(billNo)}</div>
            <div>${escHtml(dateStr)}</div>
          </div>
          <div class="bill-meta-right" style="text-align:right">
            <div>${escHtml(timeStr)}</div>
            <div>${itemCount} item${itemCount !== 1 ? 's' : ''}</div>
          </div>
        </div>

        <div class="bill-items-container">
          <div class="bill-items-header">
            <span>ITEM</span>
            <span style="text-align:center">QTY</span>
            <span style="text-align:right">RATE</span>
            <span style="text-align:center">GST</span>
            <span style="text-align:right">AMOUNT</span>
          </div>
          ${itemsHTML}
        </div>

        <hr class="bill-divider-thick" style="margin-top:0">

        <div class="bill-totals">
          ${gstRowsHTML}
          <div class="bill-total-row grand-total">
            <span>GRAND TOTAL</span>
            <span>${fmt(grandTotal)}</span>
          </div>
        </div>

        <div class="bill-quote">
          <span class="bill-quote-text">${escHtml(quote.emoji)} "${escHtml(quote.text)}"</span>
          <span class="bill-quote-source">— ${escHtml(quote.source)}</span>
        </div>

        <div class="bill-footer">
          <div class="bill-copyright">
            <div>Powered by <strong>AnimeBill™</strong></div>
            <div>© 2026 <strong>iprsnmsra</strong></div>
            <div style="margin-top:1px;font-size:0.5rem;color:#bbb">github.com/iprsnmsra</div>
          </div>
          <div class="bill-anime-title">
            <span class="bill-anime-name" style="font-family:${character.animeFont};font-size:${character.animeFontSize}">
              ${escHtml(character.anime)}
            </span>
            <span class="bill-character-name">${escHtml(character.name)}</span>
          </div>
        </div>

        <div class="bill-bottom-decoration"></div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────
// GENERATE BILL
// ──────────────────────────────────────────────────────

function generateBill() {
  const data = collectFormData();
  if (!data.items.length) {
    showToast('⚠️ Please add at least one item!');
    return;
  }

  currentCharacter = getRandomCharacter();
  currentQuote     = getRandomQuote();
  currentBillNo    = generateBillNo();

  document.getElementById('characterSelect').value = currentCharacter.id;

  const wrapper = document.getElementById('billWrapper');
  wrapper.innerHTML = renderBillHTML(data, currentBillNo, currentCharacter, currentQuote);
  billGenerated = true;

  showToast(`⚡ Bill generated! ${currentCharacter.name} appears today!`);
}

function liveUpdate() {
  if (!billGenerated) return;
  const data    = collectFormData();
  const wrapper = document.getElementById('billWrapper');
  const existing = document.getElementById('animeBill');
  if (existing) {
    wrapper.innerHTML = renderBillHTML(data, currentBillNo, currentCharacter, currentQuote);
  }
}

// Keep old name alias
function updatePreview() { liveUpdate(); }

// ──────────────────────────────────────────────────────
// PRINT
// ──────────────────────────────────────────────────────

function printBill() {
  if (!billGenerated) {
    generateBill();
    setTimeout(() => window.print(), 450);
    return;
  }
  window.print();
}

// ──────────────────────────────────────────────────────
// PNG DOWNLOAD — Simplified (images handle better than SVGs)
// ──────────────────────────────────────────────────────

async function downloadPNG() {
  const bill = document.getElementById('animeBill');
  if (!bill) { showToast('⚠️ Generate a bill first!'); return; }
  if (typeof html2canvas === 'undefined') {
    showToast('⚠️ Export library not ready. Check internet connection.');
    return;
  }

  showToast('📥 Preparing image...');
  // Short wait so sketch image is fully painted
  await new Promise(r => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(bill, {
      scale:           2.8,
      useCORS:         true,
      allowTaint:      true,
      backgroundColor: '#ffffff',
      logging:         false,
      imageTimeout:    10000,
      onclone: (doc, el) => {
        el.style.boxShadow    = 'none';
        el.style.borderRadius = '0';
        // Preserve sketch image appearance in export
        const sImg = el.querySelector('.bill-sketch-img');
        if (sImg) {
          sImg.style.opacity = '0.11';
          sImg.style.filter  = 'grayscale(100%) contrast(160%) brightness(105%)';
        }
        // Preserve SVG sketch appearance
        const sSvg = el.querySelector('.bill-sketch-svg');
        if (sSvg) sSvg.style.opacity = '0.09';
      }
    });

    const link = document.createElement('a');
    const data = collectFormData();
    const name = (data.shopName || 'bill')
      .replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
    link.download = `AnimeBill_${name}_${Date.now()}.png`;
    link.href     = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✅ Bill saved as PNG!');

  } catch (err) {
    console.error('PNG export error:', err);
    showToast('❌ PNG failed. Use 🖨️ Print → Save as PDF instead!');
  }
}

// ──────────────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────────────

function showToast(msg) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast?.remove(); }, 3200);
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
