// ═══════════════════════════════════════════════════════
// AnimeBill — Dashboard Script (Bill History)
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
  if (!window.DB) {
    showToast('⚠️ Supabase not configured — cloud features unavailable');
    showLoginRequired();
    return;
  }

  var session = await DB.getSession();
  if (!session || !session.user) {
    showLoginRequired();
    return;
  }

  currentUser = session.user.id;

  // Auth zone
  var authZone = document.getElementById('authZone');
  if (authZone) {
    authZone.innerHTML = '<span class="user-email">' + escHtml(session.user.email) + '</span>';
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
        currentSearch = e.target.value;
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
// STATS
// ────────────────────────────────────────────────────

async function loadStats(userId) {
  try {
    var stats = await DB.getStats(userId);
    animateValue('statTotalBills', 0, stats.total_bills || 0, 800);

    var revenueEl = document.getElementById('statRevenue');
    if (revenueEl) {
      revenueEl.textContent = fmtCurrency(stats.total_revenue || 0, '₹');
    }

    var avgEl = document.getElementById('statAvgBill');
    if (avgEl) {
      avgEl.textContent = fmtCurrency(stats.avg_bill_value || 0, '₹');
    }

    var favEl = document.getElementById('statFavChar');
    if (favEl) {
      favEl.textContent = stats.fav_character || '—';
    }
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
    var response = await DB.getBills(userId, {
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
// VIEW BILL DETAIL
// ────────────────────────────────────────────────────

async function viewBill(billId) {
  try {
    var data = await DB.getBillWithItems(billId);
    if (!data || !data.bill) {
      showToast('Bill not found');
      return;
    }

    var bill  = data.bill;
    var items = data.items || [];

    var modalTitle = document.getElementById('modalBillNo');
    if (modalTitle) modalTitle.textContent = 'Bill #' + bill.bill_no;

    var itemsHtml =
      '<table class="modal-items-table">' +
        '<thead><tr>' +
          '<th>Item</th><th>Qty</th><th>Price</th><th>GST</th><th>Total</th>' +
        '</tr></thead><tbody>';

    items.forEach(function (item) {
      itemsHtml +=
        '<tr>' +
          '<td>' + escHtml(item.name) + '</td>' +
          '<td>' + item.qty + '</td>' +
          '<td>' + fmtCurrency(item.price, bill.currency_symbol) + '</td>' +
          '<td>' + (item.gst_rate || 0) + '%</td>' +
          '<td>' + fmtCurrency(item.line_total, bill.currency_symbol) + '</td>' +
        '</tr>';
    });

    itemsHtml +=
        '</tbody></table>' +
        '<div class="modal-totals">' +
          '<p><strong>Subtotal:</strong> ' + fmtCurrency(bill.subtotal, bill.currency_symbol) + '</p>' +
          '<p><strong>GST:</strong> ' + fmtCurrency(bill.total_gst, bill.currency_symbol) + '</p>' +
          '<p class="modal-grand-total"><strong>Grand Total:</strong> ' + fmtCurrency(bill.grand_total, bill.currency_symbol) + '</p>' +
        '</div>';

    var modalBody = document.getElementById('modalBody');
    if (modalBody) {
      modalBody.innerHTML =
        '<div class="modal-meta">' +
          '<p><strong>Shop:</strong> ' + escHtml(bill.shop_name || 'N/A') + '</p>' +
          '<p><strong>Character:</strong> ' + escHtml(bill.character_name || 'N/A') + '</p>' +
          '<p><strong>Anime:</strong> ' + escHtml(bill.anime_name || 'N/A') + '</p>' +
          '<p><strong>Date:</strong> ' + new Date(bill.created_at).toLocaleString() + '</p>' +
        '</div>' +
        itemsHtml;
    }

    document.getElementById('billModal').classList.remove('hidden');
  } catch (err) {
    console.error('[Dashboard] View bill error:', err);
    showToast('Error loading bill details');
  }
}

// ────────────────────────────────────────────────────
// DELETE BILL
// ────────────────────────────────────────────────────

async function deleteBillConfirm(billId) {
  if (!confirm('⚠️ Delete this bill? This cannot be undone.')) return;

  try {
    var res = await DB.deleteBill(billId);
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
    var csv = await DB.exportBillsCSV(currentUser);
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
