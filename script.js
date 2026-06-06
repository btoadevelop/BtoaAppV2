// ==================== APP STATE ====================
let appState = {
  passwords: [],
  notes: [],
  todos: [],
  transactions: [],
  currentUser: null,
  pinEnabled: false,
  pinCode: '',
  currentNav: 'dashboard'
};

// ==================== HELPER FUNCTIONS ====================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '⚠️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('open');
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('open');
}

function formatCurrency(amount) {
  return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
}

function saveToLocalStorage() {
  localStorage.setItem('btoa_passwords', JSON.stringify(appState.passwords));
  localStorage.setItem('btoa_notes', JSON.stringify(appState.notes));
  localStorage.setItem('btoa_todos', JSON.stringify(appState.todos));
  localStorage.setItem('btoa_transactions', JSON.stringify(appState.transactions));
  localStorage.setItem('btoa_pin_enabled', JSON.stringify(appState.pinEnabled));
  if (appState.pinCode) localStorage.setItem('btoa_pin_code', appState.pinCode);
}

function loadFromLocalStorage() {
  appState.passwords = JSON.parse(localStorage.getItem('btoa_passwords') || '[]');
  appState.notes = JSON.parse(localStorage.getItem('btoa_notes') || '[]');
  appState.todos = JSON.parse(localStorage.getItem('btoa_todos') || '[]');
  appState.transactions = JSON.parse(localStorage.getItem('btoa_transactions') || '[]');
  appState.pinEnabled = JSON.parse(localStorage.getItem('btoa_pin_enabled') || 'false');
  appState.pinCode = localStorage.getItem('btoa_pin_code') || '';
  
  // Demo data if empty
  if (appState.passwords.length === 0) {
    appState.passwords = [{ id: '1', site: 'Google', username: 'user@gmail.com', password: 'demo123', folder: 'Semua' }];
  }
  if (appState.notes.length === 0) {
    appState.notes = [{ id: '1', title: 'Selamat Datang!', content: 'Ini adalah catatan pertama Anda.' }];
  }
  if (appState.todos.length === 0) {
    appState.todos = [{ id: '1', title: 'Contoh tugas', completed: false, priority: 'medium' }];
  }
  if (appState.transactions.length === 0) {
    appState.transactions = [{ id: '1', amount: 500000, category: 'Pemasukan', type: 'income', date: new Date().toISOString().split('T')[0] }];
  }
}

// ==================== RENDER FUNCTIONS ====================
function renderDashboard() {
  document.getElementById('greeting-name').innerHTML = 'Pengguna';
  const totalIncome = appState.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = appState.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  document.getElementById('dash-balance').innerHTML = formatCurrency(totalIncome - totalExpense);
  document.getElementById('dash-income').innerHTML = formatCurrency(totalIncome);
  document.getElementById('dash-expense').innerHTML = formatCurrency(totalExpense);
  document.getElementById('stat-passwords').innerHTML = appState.passwords.length;
  document.getElementById('stat-notes').innerHTML = appState.notes.length;
  document.getElementById('stat-todos').innerHTML = appState.todos.filter(t => !t.completed).length;
  document.getElementById('stat-transactions').innerHTML = appState.transactions.length;
  
  const recent = [...appState.transactions].slice(-3).reverse();
  const container = document.getElementById('recent-activity');
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-desc">Belum ada aktivitas</div></div>';
  } else {
    container.innerHTML = recent.map(t => `
      <div class="activity-item">
        <div class="list-icon" style="background:${t.type === 'income' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)'}">${t.type === 'income' ? '💰' : '💸'}</div>
        <div class="list-content"><div class="list-title">${t.category}</div><div class="list-meta">${t.date}</div></div>
        <div style="color:${t.type === 'income' ? '#34C759' : '#FF3B30'};font-weight:700">${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}</div>
      </div>
    `).join('');
  }
}

function renderPasswords() {
  const container = document.getElementById('password-list');
  document.getElementById('pass-count-label').innerHTML = `${appState.passwords.length} password`;
  if (appState.passwords.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔑</div><div class="empty-title">Belum Ada Password</div></div>';
  } else {
    container.innerHTML = appState.passwords.map(p => `
      <div class="list-item" onclick="viewPassword('${p.id}')">
        <div class="list-icon" style="background:rgba(255,59,48,0.12)">🔐</div>
        <div class="list-content"><div class="list-title">${escapeHtml(p.site)}</div><div class="list-meta">${escapeHtml(p.username)}</div></div>
        <div class="list-chevron">›</div>
      </div>
    `).join('');
  }
}

function renderNotes() {
  const container = document.getElementById('notes-list');
  document.getElementById('notes-count-label').innerHTML = `${appState.notes.length} catatan`;
  if (appState.notes.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column:span 2"><div class="empty-icon">📝</div><div class="empty-title">Belum Ada Catatan</div></div>';
  } else {
    container.innerHTML = appState.notes.map(n => `
      <div class="note-card" onclick="viewNote('${n.id}')">
        <div class="note-title">${escapeHtml(n.title || 'Tanpa Judul')}</div>
        <div class="note-preview">${escapeHtml((n.content || '').substring(0, 60))}</div>
      </div>
    `).join('');
  }
}

function renderTodos() {
  const container = document.getElementById('todo-list');
  const incomplete = appState.todos.filter(t => !t.completed);
  const completed = appState.todos.filter(t => t.completed);
  document.getElementById('todo-count-label').innerHTML = `${appState.todos.length} tugas`;
  document.getElementById('todo-done-count').innerHTML = completed.length;
  document.getElementById('todo-pending-count').innerHTML = incomplete.length;
  const pct = appState.todos.length === 0 ? 0 : (completed.length / appState.todos.length) * 100;
  document.getElementById('todo-progress-pct').innerHTML = `${Math.round(pct)}%`;
  document.getElementById('todo-progress-bar').style.width = `${pct}%`;
  
  if (appState.todos.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">Belum Ada Tugas</div></div>';
  } else {
    container.innerHTML = appState.todos.map(t => `
      <div class="list-item">
        <div class="todo-checkbox ${t.completed ? 'checked' : ''}" onclick="toggleTodo('${t.id}')">${t.completed ? '✓' : ''}</div>
        <div class="list-content"><div class="list-title ${t.completed ? 'done' : ''}">${escapeHtml(t.title)}</div></div>
        <div class="priority-dot priority-${t.priority}"></div>
      </div>
    `).join('');
  }
}

function renderMoney() {
  const container = document.getElementById('money-list');
  const totalIncome = appState.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = appState.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  document.getElementById('money-balance').innerHTML = formatCurrency(totalIncome - totalExpense);
  document.getElementById('money-income').innerHTML = formatCurrency(totalIncome);
  document.getElementById('money-expense').innerHTML = formatCurrency(totalExpense);
  
  if (appState.transactions.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">💰</div><div class="empty-title">Belum Ada Transaksi</div></div>';
  } else {
    container.innerHTML = [...appState.transactions].reverse().map(t => `
      <div class="list-item" onclick="editTransaction('${t.id}')">
        <div class="list-icon" style="background:${t.type === 'income' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.12)'}">${t.type === 'income' ? '📈' : '📉'}</div>
        <div class="list-content"><div class="list-title">${escapeHtml(t.category)}</div><div class="list-meta">${t.date}</div></div>
        <div style="color:${t.type === 'income' ? '#34C759' : '#FF3B30'};font-weight:700">${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}</div>
      </div>
    `).join('');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==================== CRUD OPERATIONS ====================
window.addPassword = function() {
  const site = document.getElementById('pass-site').value;
  const username = document.getElementById('pass-username').value;
  const password = document.getElementById('pass-password').value;
  if (!site) { showToast('Nama situs harus diisi', 'error'); return; }
  appState.passwords.push({ id: Date.now().toString(), site, username, password, folder: 'Semua' });
  saveToLocalStorage();
  renderPasswords();
  closeModal('modal-password');
  document.getElementById('pass-site').value = '';
  document.getElementById('pass-username').value = '';
  document.getElementById('pass-password').value = '';
  showToast('Password berhasil disimpan');
  renderDashboard();
};

window.addNote = function() {
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  if (!title && !content) { showToast('Judul atau isi catatan harus diisi', 'error'); return; }
  appState.notes.push({ id: Date.now().toString(), title: title || 'Catatan Baru', content });
  saveToLocalStorage();
  renderNotes();
  closeModal('modal-note');
  document.getElementById('note-title').value = '';
  document.getElementById('note-content').value = '';
  showToast('Catatan berhasil disimpan');
  renderDashboard();
};

window.addTodo = function() {
  const title = document.getElementById('todo-title').value;
  if (!title) { showToast('Nama tugas harus diisi', 'error'); return; }
  const priority = document.getElementById('todo-priority').value;
  appState.todos.push({ id: Date.now().toString(), title, completed: false, priority });
  saveToLocalStorage();
  renderTodos();
  closeModal('modal-todo');
  document.getElementById('todo-title').value = '';
  showToast('Tugas berhasil ditambahkan');
  renderDashboard();
};

window.toggleTodo = function(id) {
  const todo = appState.todos.find(t => t.id === id);
  if (todo) { todo.completed = !todo.completed; saveToLocalStorage(); renderTodos(); renderDashboard(); }
};

window.addTransaction = function() {
  const amount = parseInt(document.getElementById('money-amount').value);
  const category = document.getElementById('money-category').value;
  const type = document.getElementById('money-type').value;
  if (!amount || amount <= 0) { showToast('Jumlah harus diisi', 'error'); return; }
  appState.transactions.push({ id: Date.now().toString(), amount, category, type, date: new Date().toISOString().split('T')[0] });
  saveToLocalStorage();
  renderMoney();
  closeModal('modal-money');
  document.getElementById('money-amount').value = '';
  showToast('Transaksi berhasil disimpan');
  renderDashboard();
};

// ==================== NAVIGATION ====================
function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-nav="${pageId}"]`).classList.add('active');
  appState.currentNav = pageId;
  
  // Render based on page
  if (pageId === 'dashboard') renderDashboard();
  else if (pageId === 'password') renderPasswords();
  else if (pageId === 'notes') renderNotes();
  else if (pageId === 'todo') renderTodos();
  else if (pageId === 'money') renderMoney();
}

// ==================== THEME ====================
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('btoa_theme', theme);
}

function loadTheme() {
  const saved = localStorage.getItem('btoa_theme');
  if (saved) setTheme(saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  else setTheme('light');
}

// ==================== PIN LOCK ====================
let pinInput = '';
function initPinScreen() {
  const pinScreen = document.getElementById('pin-screen');
  const mainScreen = document.getElementById('main-screen');
  if (appState.pinEnabled && appState.pinCode) {
    pinScreen.style.display = 'flex';
    mainScreen.classList.remove('visible');
  } else {
    pinScreen.style.display = 'none';
    mainScreen.classList.add('visible');
  }
}

function setupPinListeners() {
  document.querySelectorAll('.pin-key[data-pin]').forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = btn.getAttribute('data-pin');
      if (pinInput.length < 4) {
        pinInput += digit;
        updatePinDots();
        if (pinInput.length === 4) {
          if (pinInput === appState.pinCode) {
            document.getElementById('pin-screen').style.display = 'none';
            document.getElementById('main-screen').classList.add('visible');
            pinInput = '';
          } else {
            showToast('PIN salah!', 'error');
            pinInput = '';
            updatePinDots();
          }
        }
      }
    });
  });
  document.querySelector('.pin-key-del')?.addEventListener('click', () => {
    pinInput = pinInput.slice(0, -1);
    updatePinDots();
  });
}

function updatePinDots() {
  document.querySelectorAll('.pin-dot').forEach((dot, i) => {
    if (i < pinInput.length) dot.classList.add('filled');
    else dot.classList.remove('filled');
  });
}

// ==================== AUTH ====================
function checkAuth() {
  const isLoggedIn = localStorage.getItem('btoa_logged_in') === 'true';
  if (isLoggedIn) {
    document.getElementById('auth-screen').style.display = 'none';
    initPinScreen();
  } else {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').classList.remove('visible');
  }
}

// ==================== EVENT LISTENERS ====================
function initEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-nav')));
  });
  
  // Quick actions
  document.querySelectorAll('.quick-action').forEach(q => {
    q.addEventListener('click', () => navigateTo(q.getAttribute('data-module')));
  });
  
  // More page items
  document.querySelectorAll('[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.getAttribute('data-page')));
  });
  
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.getAttribute('data-back')));
  });
  
  // Auth tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.getAttribute('data-tab') === 'login';
      document.getElementById('login-form').style.display = isLogin ? 'flex' : 'none';
      document.getElementById('register-form').style.display = isLogin ? 'none' : 'flex';
    });
  });
  
  // Login
  document.getElementById('btn-login')?.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    if (email) {
      localStorage.setItem('btoa_logged_in', 'true');
      localStorage.setItem('btoa_user_email', email);
      checkAuth();
      showToast('Berhasil masuk');
      renderDashboard();
    } else {
      showToast('Masukkan email', 'error');
    }
  });
  
  // Register
  document.getElementById('btn-register')?.addEventListener('click', () => {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    if (name && email) {
      localStorage.setItem('btoa_logged_in', 'true');
      localStorage.setItem('btoa_user_email', email);
      localStorage.setItem('btoa_user_name', name);
      document.getElementById('greeting-name').innerHTML = name;
      checkAuth();
      showToast('Pendaftaran berhasil');
      renderDashboard();
    } else {
      showToast('Lengkapi data', 'error');
    }
  });
  
  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('btoa_logged_in');
    appState.currentUser = null;
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').classList.remove('visible');
    showToast('Berhasil keluar');
  });
  
  // Avatar button
  document.getElementById('avatar-btn')?.addEventListener('click', () => {
    navigateTo('settings');
  });
  
  // Theme
  document.getElementById('theme-light')?.addEventListener('click', () => setTheme('light'));
  document.getElementById('theme-dark')?.addEventListener('click', () => setTheme('dark'));
  
  // PIN Toggle
  document.getElementById('pin-toggle')?.addEventListener('click', () => {
    if (appState.pinEnabled) {
      appState.pinEnabled = false;
      appState.pinCode = '';
      document.getElementById('pin-toggle').classList.remove('on');
      showToast('PIN Lock dinonaktifkan');
    } else {
      const newPin = prompt('Masukkan PIN 4 digit untuk keamanan:');
      if (newPin && newPin.length === 4 && /^\d+$/.test(newPin)) {
        appState.pinEnabled = true;
        appState.pinCode = newPin;
        document.getElementById('pin-toggle').classList.add('on');
        showToast('PIN Lock diaktifkan');
      } else {
        showToast('PIN harus 4 digit angka', 'error');
      }
    }
    saveToLocalStorage();
  });
  
  // Modal buttons
  document.getElementById('add-password-btn')?.addEventListener('click', () => openModal('modal-password'));
  document.getElementById('add-note-btn')?.addEventListener('click', () => openModal('modal-note'));
  document.getElementById('add-todo-btn')?.addEventListener('click', () => openModal('modal-todo'));
  document.getElementById('add-transaction-btn')?.addEventListener('click', () => openModal('modal-money'));
  
  document.getElementById('save-password-btn')?.addEventListener('click', addPassword);
  document.getElementById('save-note-btn')?.addEventListener('click', addNote);
  document.getElementById('save-todo-btn')?.addEventListener('click', addTodo);
  document.getElementById('save-money-btn')?.addEventListener('click', addTransaction);
}

// ==================== INIT ====================
function init() {
  loadFromLocalStorage();
  loadTheme();
  initEventListeners();
  setupPinListeners();
  checkAuth();
  
  // Hide loading
  setTimeout(() => {
    const loader = document.getElementById('loading-overlay');
    loader.classList.add('hide');
    setTimeout(() => loader.style.display = 'none', 500);
  }, 800);
}

window.viewPassword = (id) => { const p = appState.passwords.find(p => p.id === id); if(p) alert(`Site: ${p.site}\nUsername: ${p.username}\nPassword: ${p.password}`); };
window.viewNote = (id) => { const n = appState.notes.find(n => n.id === id); if(n) alert(`${n.title}\n\n${n.content}`); };
window.editTransaction = (id) => { alert('Fitur edit akan segera hadir'); };

init();