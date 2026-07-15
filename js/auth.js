// ═══════════════════════════════════════════════════════
// AnimeBill — Auth System (localStorage-based)
// Accounts + Shop Profile saved per user, per device
// © AnimeBill by iprsnmsra | github.com/iprsnmsra
// ═══════════════════════════════════════════════════════

'use strict';

const AUTH_KEY    = 'animebill_users';
const SESSION_KEY = 'animebill_session';

// ─── Simple hash (client-side only, not cryptographic) ───
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(36);
}

// ─── Storage helpers ───
function getUsers() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || '[]'); } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, user ? JSON.stringify({ id: user.id, email: user.email, name: user.name }) : 'null');
}

// ─── Auth API ───
const Auth = {
  currentUser: null,

  init() {
    const session = getSession();
    if (session) {
      const users = getUsers();
      const user  = users.find(u => u.id === session.id);
      if (user) {
        this.currentUser = user;
        this._onLogin(user);
      } else {
        saveSession(null);
      }
    }
    this._renderHeader();
  },

  register(email, password, name) {
    email = email.trim().toLowerCase();
    name  = name.trim();
    if (!email || !password || !name) return { ok: false, msg: 'All fields are required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, msg: 'Enter a valid email address.' };
    if (password.length < 6) return { ok: false, msg: 'Password must be at least 6 characters.' };

    const users = getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'This email is already registered.' };

    const user = {
      id:      'u_' + Date.now().toString(36),
      email,
      name,
      passwordHash: simpleHash(password),
      profile: { shopName: name + "'s Store", address: '', phone: '', gstin: '' },
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    this.currentUser = user;
    saveSession(user);
    this._onLogin(user);
    this._renderHeader();
    return { ok: true };
  },

  login(email, password) {
    email = email.trim().toLowerCase();
    const users = getUsers();
    const user  = users.find(u => u.email === email);
    if (!user) return { ok: false, msg: 'No account found with this email.' };
    if (user.passwordHash !== simpleHash(password)) return { ok: false, msg: 'Incorrect password.' };
    this.currentUser = user;
    saveSession(user);
    this._onLogin(user);
    this._renderHeader();
    return { ok: true };
  },

  logout() {
    this.currentUser = null;
    saveSession(null);
    this._renderHeader();
    showToast('👋 Logged out successfully!');
  },

  saveProfile(profile) {
    if (!this.currentUser) return;
    const users = getUsers();
    const idx   = users.findIndex(u => u.id === this.currentUser.id);
    if (idx === -1) return;
    users[idx].profile = { ...users[idx].profile, ...profile };
    this.currentUser   = users[idx];
    saveUsers(users);
    saveSession(this.currentUser);
    showToast('💾 Profile saved! It will auto-fill next time.');
  },

  _onLogin(user) {
    // Auto-fill form fields from saved profile
    const p = user.profile || {};
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    set('shopName',    p.shopName);
    set('shopAddress', p.address);
    set('shopPhone',   p.phone);
    set('gstin',       p.gstin);
    if (typeof liveUpdate === 'function') liveUpdate();
    showToast(`✅ Welcome back, ${user.name.split(' ')[0]}! Your profile has been loaded.`);
  },

  _renderHeader() {
    const zone = document.getElementById('authZone');
    if (!zone) return;
    if (this.currentUser) {
      const initial = this.currentUser.name.charAt(0).toUpperCase();
      zone.innerHTML = `
        <div class="auth-user-pill" id="authPill">
          <span class="auth-avatar">${initial}</span>
          <span class="auth-username">${this.currentUser.name.split(' ')[0]}</span>
          <span class="auth-chevron">▾</span>
        </div>
        <div class="auth-dropdown" id="authDropdown">
          <div class="auth-dropdown-header">
            <div class="auth-dd-name">${this.currentUser.name}</div>
            <div class="auth-dd-email">${this.currentUser.email}</div>
          </div>
          <button class="auth-dd-btn" id="saveProfileBtn" onclick="Auth.saveProfileFromForm()">
            💾 Save Store Profile
          </button>
          <button class="auth-dd-btn auth-dd-btn--danger" onclick="Auth.logout(); document.getElementById('authDropdown').classList.remove('open')">
            🚪 Sign Out
          </button>
        </div>
      `;
      document.getElementById('authPill').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('authDropdown').classList.toggle('open');
      });
    } else {
      zone.innerHTML = `
        <button class="auth-signin-btn" id="authSignInBtn" onclick="openAuthModal('login')">
          Sign In
        </button>
        <button class="auth-create-btn" id="authCreateBtn" onclick="openAuthModal('register')">
          Create Account
        </button>
      `;
    }
  },

  saveProfileFromForm() {
    const g = id => (document.getElementById(id)?.value || '').trim();
    this.saveProfile({
      shopName: g('shopName'),
      address:  g('shopAddress'),
      phone:    g('shopPhone'),
      gstin:    g('gstin'),
    });
    document.getElementById('authDropdown')?.classList.remove('open');
  },
};

// ─── Modal helpers ───
function openAuthModal(tab = 'login') {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.add('open');
    switchAuthTab(tab);
    // Clear fields
    ['authEmail','authPassword','authName','authLoginEmail','authLoginPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    clearAuthError();
  }
}

function closeAuthModal() {
  document.getElementById('authModal')?.classList.remove('open');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.getElementById('authLoginPanel').style.display  = tab === 'login'    ? 'flex' : 'none';
  document.getElementById('authRegisterPanel').style.display = tab === 'register' ? 'flex' : 'none';
  clearAuthError();
}

function clearAuthError() {
  const el = document.getElementById('authError');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function showAuthError(msg) {
  const el = document.getElementById('authError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function doLogin() {
  const email    = document.getElementById('authLoginEmail').value;
  const password = document.getElementById('authLoginPassword').value;
  const result   = Auth.login(email, password);
  if (result.ok) {
    closeAuthModal();
  } else {
    showAuthError(result.msg);
  }
}

function doRegister() {
  const name     = document.getElementById('authName').value;
  const email    = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const result   = Auth.register(email, password, name);
  if (result.ok) {
    closeAuthModal();
  } else {
    showAuthError(result.msg);
  }
}

// Close modal & dropdown on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('authModal');
  if (modal?.classList.contains('open') && e.target === modal) closeAuthModal();
  const dd = document.getElementById('authDropdown');
  if (dd?.classList.contains('open') && !dd.contains(e.target) && !document.getElementById('authPill')?.contains(e.target)) {
    dd.classList.remove('open');
  }
});

// Enter key support in forms
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAuthModal();
  if (e.key === 'Enter') {
    const loginPanel = document.getElementById('authLoginPanel');
    const regPanel   = document.getElementById('authRegisterPanel');
    if (loginPanel?.style.display !== 'none' && document.getElementById('authModal')?.classList.contains('open')) doLogin();
    if (regPanel?.style.display  !== 'none' && document.getElementById('authModal')?.classList.contains('open')) doRegister();
  }
});

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => Auth.init());
