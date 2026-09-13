// ═══════════════════════════════════════════════════════
// AnimeBill — Dashboard Script (Bill History)
// Supports both Supabase Cloud & Offline LocalStorage
// © AnimeBill by iprsnmsra | github.com/iprsnmsra
// ═══════════════════════════════════════════════════════

'use strict';

var currentUser   = null;
var currentPage   = 1;
var pageSize      = 12;
var currentSearch = '';
var currentSortBy = 'created_at';
var currentSortDir = false; // false = DESC

document.addEventListener('DOMContentLoaded', async function () {
  // auth.js fires Auth.init() on its own DOMContentLoaded.
  // Both listeners may run in parallel, so wait for the shared ready promise.
  if (Auth.ready) {
    await Auth.ready;
  } else {
    await Auth.init();
  }

  if (!Auth.currentUser) {
    showLoginRequired();
    return;
  }

  currentUser = Auth.currentUser.id;

  if (!Auth.isCloud) {
    showToast('📴 Offline mode — bills saved on this device only.');
  }

  setupEvents();
  await loadStats(currentUser);
  await loadBills(currentUser, currentPage, currentSearch, currentSortBy, currentSortDir);
});

function showLoginRequired() {
  var container = document.querySelector('.dashboard-container');
  if (container) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">🔒</div>' +
        '<h2>Authentication Required</h2>' +
        '<p>Please log in to view your bill history.</p>' +
        '<a href="index.html" class="btn btn-primary">Go to Home & Sign In</a>' +
      '</div>';
  }
}

function setupEvents() {
  // Search with debounce
  var searchTimeout;
  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () {
        currentSearch = e.target.value.toLowerCase();
        currentPage = 1;
        loadBills(currentUser, currentPage, currentSearch, currentSortBy, currentSortDir);
      }, 400);
    });
  }

  // Sort select
  var sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', function (e) {
      var val = e.target.value;
      if (val === 'newest')  { currentSortBy = 'created_at';  currentSortDir = false; }
      if (val === 'oldest')  { currentSortBy = 'created_at';  currentSortDir = true; }
      if (val === 'highest') { currentSortBy = 'grand_total';  currentSortDir = false; }
      if (val === 'lowest')  { currentSortBy = 'grand_total';  currentSortDir = true; }
      currentPage = 1;
      loadBills(currentUser, currentPage, currentSearch, currentSortBy, currentSortDir);
    });
  }

  // Export CSV
  var exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCSV);
  }

  // Pagination
  var prevBtn = document.getElementById('prevPage');
  var nextBtn = document.getElementById('nextPage');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentPage > 1) {
        currentPage--;
        loadBills(currentUser, currentPage, currentSearch, currentSortBy, currentSortDir);
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentPage++;
      loadBills(currentUser, currentPage, currentSearch, currentSortBy, currentSortDir);
    });
  }

  // Modal close
  var closeModalBtn = document.getElementById('closeModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
      document.getElementById('billModal').classList.add('hidden');
    });
  }
  var billModal = document.getElementById('billModal');
  if (billModal) {
    billModal.addEventListener('click', function (e) {
      if (e.target === billModal) billModal.classList.add('hidden');
    });
  }
}

// ────────────────────────────────────────────────────
// DATA API (Abstracts Cloud vs Offline)
// ────────────────────────────────────────────────────

var DataAPI = {
  async getStats(userId) {
    if (Auth.isCloud) return await DB.getStats(userId);
    
    // Offline logic
    var bills = getOfflineBills(userId);
    var stats = {
      total_bills: bills.length,
      total_revenue: 0,
      avg_bill_value: 0,
      fav_character: '—'
    };
    if (bills.length === 0) return stats;
    
    var chars = {};
    bills.forEach(function(b) {
      stats.total_revenue += b.grand_total;
      if (b.character_name) chars[b.character_name] = (chars[b.character_name] || 0) + 1;
    });
    stats.avg_bill_value = stats.total_revenue / bills.length;
    
    var topChar = '—', maxC = 0;
    for (var c in chars) { if (chars[c] > maxC) { topChar = c; maxC = chars[c]; } }
    stats.fav_character = topChar;
    
    return stats;
  },

  async getBills(userId, opts) {
    if (Auth.isCloud) return await DB.getBills(userId, opts);
    
    // Offline logic
    var bills = getOfflineBills(userId);
    
    if (opts.search) {
      bills = bills.filter(function(b) {
        return (b.bill_no && b.bill_no.toLowerCase().includes(opts.search)) ||
               (b.shop_name && b.shop_name.toLowerCase().includes(opts.search)) ||
               (b.character_name && b.character_name.toLowerCase().includes(opts.search));
      });
    }
    
    bills.sort(function(a, b) {
      var valA = a[opts.sortBy], valB = b[opts.sortBy];
      if (opts.sortBy === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return opts.sortDir ? -1 : 1;
      if (valA > valB) return opts.sortDir ? 1 : -1;
      return 0;
    });
    
    var total = bills.length;
    var totalPages = Math.ceil(total / opts.pageSize) || 1;
    var from = (opts.page - 1) * opts.pageSize;
    var to = from + opts.pageSize;
    var paged = bills.slice(from, to);
    
    return { bills: paged, total: total, page: opts.page, pageSize: opts.pageSize, totalPages: totalPages };
  },

  async getBillWithItems(billId) {
    if (Auth.isCloud) return await DB.getBillWithItems(billId);
    
    // Offline logic
    var all = JSON.parse(localStorage.getItem('animebill_offline_bills') || '[]');
    var bill = all.find(function(b) { return b.id === billId; });
    if (!bill) return null;
    return { bill: bill, items: bill.items || [] };
  },

  async deleteBill(billId) {
    if (Auth.isCloud) return await DB.deleteBill(billId);
    
    // Offline logic
    var all = JSON.parse(localStorage.getItem('animebill_offline_bills') || '[]');
    var filtered = all.filter(function(b) { return b.id !== billId; });
    localStorage.setItem('animebill_offline_bills', JSON.stringify(filtered));
    return { ok: true };
  },

  async exportBillsCSV(userId) {
    if (Auth.isCloud) return await DB.exportBillsCSV(userId);
    
    // Offline logic
    var bills = getOfflineBills(userId);
    if (bills.length === 0) return null;
    
    var headers = ['Bill No', 'Shop Name', 'Grand Total', 'Items', 'Currency', 'Character', 'Anime', 'Date'];
    var rows = bills.map(function(b) {
      return [
        b.bill_no,
        '"' + (b.shop_name || '').replace(/"/g, '""') + '"',
        b.grand_total,
        b.item_count,
        b.currency_code,
        b.character_name || '',
        b.anime_name || '',
        new Date(b.created_at).toLocaleDateString()
      ].join(',');
    });
    return headers.join(',') + '\\n' + rows.join('\\n');
  }
};

function getOfflineBills(userId) {
  var all = JSON.parse(localStorage.getItem('animebill_offline_bills') || '[]');
  return all.filter(function(b) { return b.user_id === userId; });
}

// ────────────────────────────────────────────────────
// STATS
// ────────────────────────────────────────────────────

async function loadStats(userId) {
  try {
    var stats = await DataAPI.getStats(userId);
    animateValue('statTotalBills', 0, stats.total_bills || 0, 800);

    var revenueEl = document.getElementById('statRevenue');
    if (revenueEl) revenueEl.textContent = fmtCurrency(stats.total_revenue || 0, '₹');

    var avgEl = document.getElementById('statAvgBill');
    if (avgEl) avgEl.textContent = fmtCurrency(stats.avg_bill_value || 0, '₹');

    var favEl = document.getElementById('statFavChar');
    if (favEl) favEl.textContent = stats.fav_character || '—';
  } catch (err) {
    console.error('[Dashboard] Stats error:', err);
  }
}

// ────────────────────────────────────────────────────
// BILLS LIST
// ────────────────────────────────────────────────────

async function loadBills(userId, page, search, sortBy, sortDir) {
  var grid       = document.getElementById('billsGrid');
  var emptyState = document.getElementById('emptyState');
  var pagination = document.getElementById('pagination');

  if (!grid) return;

  try {
    var response = await DataAPI.getBills(userId, {
      page:     page,
      pageSize: pageSize,
      search:   search,
      sortBy:   sortBy,
      sortDir:  sortDir
    });

    grid.innerHTML = '';

    if (!response.bills || response.bills.length === 0) {
      grid.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      if (pagination) pagination.classList.add('hidden');
      return;
    }

    grid.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');

    response.bills.forEach(function (bill, index) {
      var card = document.createElement('div');
      card.className = 'bill-card';
      card.style.animationDelay = (index * 0.05) + 's';

      var animeColor = getAnimeColor(bill.anime_name);
      card.style.borderLeftColor = animeColor;

      card.innerHTML =
        '<div class="bill-card-header">' +
          '<span class="bill-no">#' + escHtml(bill.bill_no) + '</span>' +
          '<span class="bill-date">' + timeAgo(bill.created_at) + '</span>' +
        '</div>' +
        '<div class="bill-card-body">' +
          '<h3 class="shop-name">' + escHtml(bill.shop_name || 'Anime Shop') + '</h3>' +
          '<div class="bill-total">' + fmtCurrency(bill.grand_total, bill.currency_symbol || '₹') + '</div>' +
          '<div class="bill-meta">' +
            '<span class="char-name">👤 ' + escHtml(bill.character_name || 'Unknown') + '</span>' +
            '<span class="anime-name">🎌 ' + escHtml(bill.anime_name || 'Unknown') + '</span>' +
          '</div>' +
          '<div class="items-count">' + (bill.item_count || 0) + ' items</div>' +
        '</div>' +
        '<div class="bill-card-actions">' +
          '<button class="btn btn-sm btn-view" data-id="' + bill.id + '">👁️ View</button>' +
          '<button class="btn btn-sm btn-delete" data-id="' + bill.id + '">🗑️ Delete</button>' +
        '</div>';

      // Event delegation for buttons
      card.querySelector('.btn-view').addEventListener('click', function () {
        viewBill(bill.id);
      });
      card.querySelector('.btn-delete').addEventListener('click', function () {
        deleteBillConfirm(bill.id);
      });

      grid.appendChild(card);
    });

    // Update pagination
    var pageInfo = document.getElementById('pageInfo');
    if (pageInfo) pageInfo.textContent = 'Page ' + response.page + ' of ' + (response.totalPages || 1);

    var prevBtn = document.getElementById('prevPage');
    var nextBtn = document.getElementById('nextPage');
    if (prevBtn) prevBtn.disabled = response.page <= 1;
    if (nextBtn) nextBtn.disabled = response.page >= (response.totalPages || 1);

  } catch (err) {
    console.error('[Dashboard] Bills error:', err);
    showToast('Error loading bills');
  }
}

// ────────────────────────────────────────────────────
// VIEW BILL DETAIL — shows the EXACT generated bill
// ────────────────────────────────────────────────────

async function viewBill(billId) {
  try {
    var data = await DataAPI.getBillWithItems(billId);
    if (!data || !data.bill) { showToast('Bill not found'); return; }

    var bill = data.bill;

    // Try to get saved HTML (offline: in bill object, cloud: in localStorage keyed by billId)
    var billHtml = bill.bill_html || localStorage.getItem('animebill_html_' + billId) || null;

    var modalTitle = document.getElementById('modalBillNo');
    if (modalTitle) modalTitle.textContent = 'Bill #' + bill.bill_no;

    var modalBody = document.getElementById('modalBody');
    if (!modalBody) return;

    if (billHtml) {
      // ── RENDER THE EXACT BILL ──────────────────────────
      modalBody.innerHTML =
        '<div class="modal-bill-wrapper" id="modalBillPreview">' +
          billHtml +
        '</div>' +
        '<div class="modal-bill-actions">' +
          '<button class="modal-action-btn" onclick="printHistoryBill()">🖨️ Print</button>' +
          '<button class="modal-action-btn modal-action-btn--png" onclick="downloadHistoryPNG()">💾 Save PNG</button>' +
        '</div>';
    } else {
      // ── FALLBACK: data table if HTML wasn't saved ──────
      var items = data.items || [];
      var rows = '';
      items.forEach(function(item) {
        rows += '<tr><td>' + escHtml(item.name) + '</td><td>' + item.qty + '</td>' +
          '<td>' + fmtCurrency(item.price, bill.currency_symbol) + '</td>' +
          '<td>' + (item.gst_rate || 0) + '%</td>' +
          '<td>' + fmtCurrency(item.line_total, bill.currency_symbol) + '</td></tr>';
      });
      modalBody.innerHTML =
        '<div class="modal-meta">' +
          '<p><strong>Shop:</strong> ' + escHtml(bill.shop_name || 'N/A') + '</p>' +
          '<p><strong>Character:</strong> ' + escHtml(bill.character_name || 'N/A') + ' — ' + escHtml(bill.anime_name || '') + '</p>' +
          '<p><strong>Date:</strong> ' + new Date(bill.created_at).toLocaleString() + '</p>' +
        '</div>' +
        '<table class="modal-items-table"><thead><tr>' +
          '<th>Item</th><th>Qty</th><th>Price</th><th>GST</th><th>Total</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div class="modal-totals">' +
          '<p><strong>Subtotal:</strong> ' + fmtCurrency(bill.subtotal, bill.currency_symbol) + '</p>' +
          '<p><strong>GST:</strong> ' + fmtCurrency(bill.total_gst, bill.currency_symbol) + '</p>' +
          '<p class="modal-grand-total"><strong>Grand Total:</strong> ' + fmtCurrency(bill.grand_total, bill.currency_symbol) + '</p>' +
        '</div>' +
        '<p class="modal-regen-note">⚠️ This bill was saved before full history was enabled. Generate it again from the main page to save the visual.</p>';
    }

    document.getElementById('billModal').classList.remove('hidden');
  } catch (err) {
    console.error('[Dashboard] View bill error:', err);
    showToast('Error loading bill details');
  }
}

function printHistoryBill() {
  var el = document.getElementById('modalBillPreview');
  if (!el) return;
  var win = window.open('', '_blank', 'width=700,height=900');
  win.document.write(
    '<!DOCTYPE html><html><head>' +
    '<title>AnimeBill Print</title>' +
    '<link rel="stylesheet" href="' + window.location.origin + '/css/style.css">' +
    '<style>body{background:#fff;display:flex;justify-content:center;padding:20px} @media print{body{padding:0}}</style>' +
    '</head><body>' +
    el.innerHTML +
    '<script>window.onload=function(){window.print();window.close();}<\/script>' +
    '</body></html>'
  );
  win.document.close();
}

async function downloadHistoryPNG() {
  var el = document.getElementById('modalBillPreview');
  if (!el) { showToast('No bill to export'); return; }
  var billEl = el.querySelector('#animeBill') || el.firstElementChild;
  if (!billEl) { showToast('No bill to export'); return; }

  if (typeof html2canvas === 'undefined') {
    // Load html2canvas dynamically
    await new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  showToast('📸 Generating PNG...');
  try {
    var canvas = await html2canvas(billEl, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    var link = document.createElement('a');
    link.download = 'AnimeBill_' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('✅ PNG downloaded!');
  } catch(e) {
    console.error(e);
    showToast('PNG export failed — try Print instead');
  }
}


// ────────────────────────────────────────────────────
// DELETE BILL
// ────────────────────────────────────────────────────

async function deleteBillConfirm(billId) {
  if (!confirm('⚠️ Delete this bill? This cannot be undone.')) return;

  try {
    var res = await DataAPI.deleteBill(billId);
    if (res && res.ok) {
      showToast('🗑️ Bill deleted');
      loadStats(currentUser);
      loadBills(currentUser, currentPage, currentSearch, currentSortBy, currentSortDir);
    } else {
      showToast('Failed to delete bill');
    }
  } catch (err) {
    console.error('[Dashboard] Delete error:', err);
    showToast('Error deleting bill');
  }
}

// ────────────────────────────────────────────────────
// EXPORT CSV
// ────────────────────────────────────────────────────

async function exportCSV() {
  if (!currentUser) return;
  try {
    var csv = await DataAPI.exportBillsCSV(currentUser);
    if (!csv) {
      showToast('No bills to export');
      return;
    }
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'AnimeBill_Export_' + Date.now() + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 CSV exported!');
  } catch (err) {
    console.error('[Dashboard] Export error:', err);
    showToast('Export failed');
  }
}

// ────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────────

function showToast(message) {
  document.querySelectorAll('.toast').forEach(function (t) { t.remove(); });
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(function () {
    toast.classList.add('toast-show');
  });
  setTimeout(function () {
    toast.classList.remove('toast-show');
    setTimeout(function () { toast.remove(); }, 300);
  }, 3000);
}

function fmtCurrency(amount, symbol) {
  symbol = symbol || '₹';
  return symbol + ' ' + Number(amount || 0).toFixed(2);
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

function timeAgo(dateStr) {
  var date = new Date(dateStr);
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval;
  interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'just now';
}

function animateValue(id, start, end, duration) {
  var obj = document.getElementById(id);
  if (!obj) return;
  if (end === 0) { obj.textContent = '0'; return; }
  var startTimestamp = null;
  function step(timestamp) {
    if (!startTimestamp) startTimestamp = timestamp;
    var progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = end;
    }
  }
  window.requestAnimationFrame(step);
}

function getAnimeColor(animeName) {
  if (!animeName) return '#444';
  var name = animeName.toLowerCase();
  if (name.indexOf('one piece') >= 0)       return '#e74c3c';
  if (name.indexOf('jujutsu') >= 0)         return '#9b59b6';
  if (name.indexOf('naruto') >= 0)          return '#f39c12';
  if (name.indexOf('dragon ball') >= 0)     return '#f1c40f';
  if (name.indexOf('attack on titan') >= 0) return '#2ecc71';
  if (name.indexOf('demon slayer') >= 0)    return '#3498db';
  if (name.indexOf('fullmetal') >= 0)       return '#e67e22';
  if (name.indexOf('pok') >= 0)             return '#e74c3c';
  return '#888';
}
