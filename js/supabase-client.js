// ═══════════════════════════════════════════════════════
// AnimeBill — Supabase Client Wrapper
// Central database layer — auth, profiles, bills, stats
// Falls back to offline mode if Supabase is not configured
// © AnimeBill by iprsnmsra | github.com/iprsnmsra
// ═══════════════════════════════════════════════════════

'use strict';

var DB = (function () {

  // ── Check if Supabase is configured ──────────────────
  var isConfigured = (
    typeof SUPABASE_URL !== 'undefined' &&
    typeof SUPABASE_ANON_KEY !== 'undefined' &&
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('YOUR_PROJECT') &&
    !SUPABASE_ANON_KEY.includes('YOUR_ANON')
  );

  if (!isConfigured) {
    console.warn('[AnimeBill] Supabase not configured → running in offline/localStorage mode.');
    console.info('[AnimeBill] To enable cloud features, copy js/config.example.js → js/config.js and add your Supabase keys.');
    return null;
  }

  // ── Initialize Supabase client ───────────────────────
  var client;
  try {
    // The Supabase CDN script exposes window.supabase with createClient
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.error('[AnimeBill] Supabase SDK not loaded. Check your internet connection.');
      return null;
    }
  } catch (err) {
    console.error('[AnimeBill] Failed to initialize Supabase:', err);
    return null;
  }

  console.info('[AnimeBill] ✅ Supabase connected → cloud mode active');

  // ════════════════════════════════════════════════════
  // AUTH
  // ════════════════════════════════════════════════════

  async function signUp(email, password, name) {
    var _ref = await client.auth.signUp({
      email: email,
      password: password,
      options: { data: { name: name } }
    });
    var data = _ref.data, error = _ref.error;
    if (error) return { ok: false, msg: error.message };
    // Profile is auto-created by the DB trigger
    return { ok: true, user: data.user, session: data.session };
  }

  async function signIn(email, password) {
    var _ref = await client.auth.signInWithPassword({
      email: email,
      password: password
    });
    var data = _ref.data, error = _ref.error;
    if (error) return { ok: false, msg: error.message };
    return { ok: true, user: data.user, session: data.session };
  }

  async function signOut() {
    var _ref = await client.auth.signOut();
    return { ok: !_ref.error, msg: _ref.error ? _ref.error.message : '' };
  }

  async function getSession() {
    var _ref = await client.auth.getSession();
    return _ref.data.session;
  }

  function getUser() {
    // Synchronous check from cached session
    return client.auth.getUser ? client.auth.getUser() : null;
  }

  function onAuthStateChange(callback) {
    return client.auth.onAuthStateChange(function (_event, session) {
      callback(session ? session.user : null, _event);
    });
  }

  // ════════════════════════════════════════════════════
  // PROFILES
  // ════════════════════════════════════════════════════

  async function getProfile(userId) {
    var _ref = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return _ref.data;
  }

  async function updateProfile(userId, profileData) {
    var _ref = await client
      .from('profiles')
      .upsert({
        id: userId,
        name:          profileData.name      || '',
        shop_name:     profileData.shopName   || profileData.shop_name  || '',
        address:       profileData.address    || '',
        phone:         profileData.phone      || '',
        gstin:         profileData.gstin      || '',
        currency_code: profileData.currency   || profileData.currency_code || 'INR',
        updated_at:    new Date().toISOString()
      }, { onConflict: 'id' });
    return { ok: !_ref.error, error: _ref.error };
  }

  // ════════════════════════════════════════════════════
  // BILLS — SAVE
  // ════════════════════════════════════════════════════

  async function saveBill(userId, billData, items, character, quote) {
    // Calculate totals
    var subtotal = 0, totalGst = 0;
    items.forEach(function (item) {
      var lineAmt = item.qty * item.price;
      subtotal += lineAmt;
      totalGst += lineAmt * (item.gst || 0) / 100;
    });
    var grandTotal = subtotal + totalGst;
    var itemCount  = items.reduce(function (a, i) { return a + i.qty; }, 0);

    // Insert bill
    var _ref = await client
      .from('bills')
      .insert({
        user_id:         userId,
        bill_no:         billData.billNo,
        shop_name:       billData.shopName,
        shop_address:    billData.shopAddress    || '',
        shop_phone:      billData.shopPhone      || '',
        gstin:           billData.gstin           || '',
        currency_code:   billData.currencyCode   || 'INR',
        currency_symbol: billData.currencySymbol || '₹',
        subtotal:        subtotal,
        total_gst:       totalGst,
        grand_total:     grandTotal,
        item_count:      itemCount,
        character_id:    character ? character.id    : null,
        character_name:  character ? character.name  : null,
        anime_name:      character ? character.anime : null,
        quote_text:      quote ? quote.text   : null,
        quote_source:    quote ? quote.source : null,
        quote_emoji:     quote ? quote.emoji  : null,
      })
      .select()
      .single();

    if (_ref.error) {
      console.error('[AnimeBill] saveBill error:', _ref.error);
      return { ok: false, error: _ref.error };
    }

    var bill = _ref.data;

    // Insert bill items
    if (items.length > 0) {
      var billItems = items.map(function (item, idx) {
        return {
          bill_id:    bill.id,
          name:       item.name,
          qty:        item.qty,
          price:      item.price,
          gst_rate:   item.gst || 0,
          line_total: item.qty * item.price,
          sort_order: idx
        };
      });

      var _ref2 = await client
        .from('bill_items')
        .insert(billItems);

      if (_ref2.error) {
        console.error('[AnimeBill] saveBillItems error:', _ref2.error);
      }
    }

    return { ok: true, bill: bill };
  }

  // ════════════════════════════════════════════════════
  // BILLS — QUERY
  // ════════════════════════════════════════════════════

  async function getBills(userId, opts) {
    opts = opts || {};
    var page     = opts.page     || 1;
    var pageSize = opts.pageSize || 20;
    var search   = (opts.search  || '').trim();
    var sortBy   = opts.sortBy   || 'created_at';
    var sortDir  = opts.sortDir  || false; // false = descending

    var from = (page - 1) * pageSize;
    var to   = from + pageSize - 1;

    var query = client
      .from('bills')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order(sortBy, { ascending: sortDir })
      .range(from, to);

    // Search filter
    if (search) {
      query = query.or(
        'bill_no.ilike.%' + search + '%,' +
        'shop_name.ilike.%' + search + '%,' +
        'character_name.ilike.%' + search + '%,' +
        'anime_name.ilike.%' + search + '%'
      );
    }

    var _ref = await query;
    return {
      bills:     _ref.data || [],
      total:     _ref.count || 0,
      page:      page,
      pageSize:  pageSize,
      totalPages: Math.ceil((_ref.count || 0) / pageSize)
    };
  }

  async function getBillWithItems(billId) {
    var billRef = await client
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single();

    if (billRef.error || !billRef.data) return null;

    var itemsRef = await client
      .from('bill_items')
      .select('*')
      .eq('bill_id', billId)
      .order('sort_order', { ascending: true });

    return {
      bill:  billRef.data,
      items: itemsRef.data || []
    };
  }

  async function deleteBill(billId) {
    // bill_items cascade-delete automatically
    var _ref = await client
      .from('bills')
      .delete()
      .eq('id', billId);
    return { ok: !_ref.error, error: _ref.error };
  }

  // ════════════════════════════════════════════════════
  // STATS — Dashboard analytics
  // ════════════════════════════════════════════════════

  async function getStats(userId) {
    var _ref = await client
      .from('user_bill_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (_ref.error || !_ref.data) {
      return {
        total_bills:     0,
        total_revenue:   0,
        avg_bill_value:  0,
        highest_bill:    0,
        fav_character:   '—',
        fav_anime:       '—',
        primary_currency: 'INR',
        first_bill_date: null,
        last_bill_date:  null
      };
    }
    return _ref.data;
  }

  // ════════════════════════════════════════════════════
  // EXPORT — CSV download
  // ════════════════════════════════════════════════════

  async function exportBillsCSV(userId) {
    var _ref = await client
      .from('bills')
      .select('bill_no, shop_name, grand_total, item_count, currency_code, character_name, anime_name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    var bills = _ref.data || [];
    if (!bills.length) return null;

    var headers = ['Bill No', 'Shop Name', 'Grand Total', 'Items', 'Currency', 'Character', 'Anime', 'Date'];
    var rows = bills.map(function (b) {
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

    return headers.join(',') + '\n' + rows.join('\n');
  }

  // ════════════════════════════════════════════════════
  // PUBLIC API
  // ════════════════════════════════════════════════════

  return {
    client: client,
    isOnline: true,

    // Auth
    signUp:             signUp,
    signIn:             signIn,
    signOut:            signOut,
    getSession:         getSession,
    getUser:            getUser,
    onAuthStateChange:  onAuthStateChange,

    // Profile
    getProfile:    getProfile,
    updateProfile: updateProfile,

    // Bills
    saveBill:          saveBill,
    getBills:          getBills,
    getBillWithItems:  getBillWithItems,
    deleteBill:        deleteBill,

    // Analytics
    getStats:       getStats,
    exportBillsCSV: exportBillsCSV,
  };

})();
