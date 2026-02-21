/* ==============================
   app.js — Global State & Utilities
   ============================== */

// ---- State helpers ----
const AppState = {
    get(key, fallback = null) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// ---- Theme ----
function initTheme() {
    const theme = AppState.get('theme', 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    AppState.set('theme', next);
    updateThemeButton(next);
}

function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ---- Font Size ----
function initFontSize() {
    const size = AppState.get('fontSize', 'medium');
    document.documentElement.setAttribute('data-font', size);
    updateFontButtons(size);
}

function setFontSize(size) {
    document.documentElement.setAttribute('data-font', size);
    AppState.set('fontSize', size);
    updateFontButtons(size);
}

function updateFontButtons(size) {
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === size);
    });
}

// ---- Random Dhamma Tip ----
let dhammaQuotes = [];

async function initDhammaTip() {
    const container = document.getElementById('dhamma-tip');
    if (!container) return;

    try {
        const res = await fetch('data/dhamma_quotes.json');
        dhammaQuotes = await res.json();
        showRandomTip(container);
    } catch (e) {
        console.warn('Could not load dhamma quotes:', e);
        container.style.display = 'none';
    }
}

function showRandomTip(container) {
    if (!dhammaQuotes.length) return;
    const lastId = sessionStorage.getItem('last_tip_id');
    let candidates = dhammaQuotes.filter(q => q.id !== lastId);
    if (!candidates.length) candidates = dhammaQuotes;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    sessionStorage.setItem('last_tip_id', pick.id);

    container.innerHTML = `
    <div class="tip-card">
      <span class="tip-icon">🪷</span>
      <div class="tip-content">
        <div class="tip-label">ข้อคิดในพระพุทธศาสนา</div>
        <div class="tip-text">${pick.th}</div>
      </div>
      <div class="tip-actions">
        <button class="tip-reroll" onclick="rerollTip()" title="สุ่มใหม่">🔄 สุ่มใหม่</button>
      </div>
    </div>
  `;

    // Re-trigger animation
    const card = container.querySelector('.tip-card');
    if (card) {
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = '';
    }
}

function rerollTip() {
    const container = document.getElementById('dhamma-tip');
    if (container) showRandomTip(container);
}

// ---- Toast ----
function showToast(message, duration = 3000) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ---- Service Worker ----
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('pwa/service-worker.js').then(reg => {
            reg.addEventListener('updatefound', () => {
                const newSW = reg.installing;
                if (newSW) {
                    newSW.addEventListener('statechange', () => {
                        if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                            showToast('มีเวอร์ชันใหม่ — กดเพื่ออัปเดต');
                            const toast = document.getElementById('app-toast');
                            if (toast) {
                                toast.style.cursor = 'pointer';
                                toast.onclick = () => {
                                    newSW.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                };
                            }
                        }
                    });
                }
            });
        }).catch(err => console.warn('SW registration failed:', err));
    }
}

// ---- Nikaya / Type labels ----
const NIKAYA_LABELS = {
    mahanikai: 'มหานิกาย',
    dhammayut: 'ธรรมยุต'
};

const TYPE_LABELS = {
    monk: 'บวชพระภิกษุ',
    novice: 'บวชสามเณร'
};

function getNikayaLabel(key) { return NIKAYA_LABELS[key] || key; }
function getTypeLabel(key) { return TYPE_LABELS[key] || key; }

// ---- Breadcrumb helper ----
function renderBreadcrumb(items) {
    const bc = document.getElementById('breadcrumb');
    if (!bc) return;
    bc.innerHTML = items.map((item, i) => {
        if (i === items.length - 1) {
            return `<span class="current">${item.label}</span>`;
        }
        return `<a href="${item.href}">${item.label}</a><span class="sep">›</span>`;
    }).join('');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFontSize();
    initDhammaTip();
    registerSW();

    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Font size buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => setFontSize(btn.dataset.size));
    });
});
