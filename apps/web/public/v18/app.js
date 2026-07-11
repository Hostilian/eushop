// EUshop v18 — Marketplace Application Logic (eBay-inspired)
'use strict';

// ── Graceful Degradation Helpers ─────────────────────────────────────────
function safeGetItem(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSetItem(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default:  return m;
    }
  });
}

// Inline SVG placeholder for broken images
const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#f0f0f0"/>' +
  '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" ' +
  'font-family="sans-serif" font-size="14" fill="#999">Image unavailable</text>' +
  '</svg>'
);

// ── State ─────────────────────────────────────────────────────────────────
let activeCategory = 'all';
let activeFormat   = 'all';  // 'all' | 'auction' | 'buynow'
let activeConditions = new Set(['New', 'Used', 'Refurbished']);
let priceMin = 0;
let priceMax = Infinity;
let activeSort = 'ending';
let watchlist = new Set();
let countdownIntervalId = null;
let currentDetail = null;

// ── Data Guard ────────────────────────────────────────────────────────────
// If data.js failed to load, LISTINGS will be undefined.
function getListings() {
  if (typeof LISTINGS === 'undefined' || !Array.isArray(LISTINGS)) return null;
  return LISTINGS;
}

// ── Countdown Utility ─────────────────────────────────────────────────────
function computeCountdown(endsAt) {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return d + 'd ' + h + 'h left';
  if (h > 0) return h + 'h ' + m + 'm left';
  return m + 'm left';
}

// ── Render Listings ───────────────────────────────────────────────────────
function renderListings() {
  const grid = document.getElementById('listings-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  const data = getListings();
  if (!data) {
    grid.innerHTML = '<div class="error-state">⚠️ Product data could not be loaded. Please refresh the page.</div>';
    if (countEl) countEl.textContent = '';
    return;
  }

  const priceMinVal = parseFloat(document.getElementById('price-min') ? document.getElementById('price-min').value : '0') || 0;
  const priceMaxVal = parseFloat(document.getElementById('price-max') ? document.getElementById('price-max').value : '999999') || Infinity;
  const locationVal = (document.getElementById('location-filter') ? document.getElementById('location-filter').value : '').toLowerCase().trim();
  const searchVal = (document.getElementById('search-input') ? document.getElementById('search-input').value : '').toLowerCase().trim();

  let filtered = data.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (activeFormat !== 'all' && item.format !== activeFormat) return false;
    if (!activeConditions.has(item.condition)) return false;
    if (item.price < priceMinVal) return false;
    if (priceMaxVal < Infinity && item.price > priceMaxVal) return false;
    if (locationVal && item.sellerName && !item.sellerName.toLowerCase().includes(locationVal)) return false;
    if (searchVal && !item.title.toLowerCase().includes(searchVal)) return false;
    return true;
  });

  // Sort
  const sortVal = (document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'ending');
  if (sortVal === 'ending') {
    filtered.sort((a, b) => {
      if (!a.endsAt && !b.endsAt) return 0;
      if (!a.endsAt) return 1;
      if (!b.endsAt) return -1;
      return new Date(a.endsAt) - new Date(b.endsAt);
    });
  } else if (sortVal === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortVal === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortVal === 'bids') {
    filtered.sort((a, b) => (b.bids || 0) - (a.bids || 0));
  }

  if (countEl) countEl.innerHTML = '<strong>' + filtered.length + '</strong> results';

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No listings match your filters</h3><p>Try adjusting your criteria or clearing the filters.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(item => renderCard(item)).join('');

  // Attach click handlers
  grid.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.watchlist-btn')) return;
      openDetail(this.dataset.id);
    });
  });
  grid.querySelectorAll('.watchlist-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleWatchlist(this.dataset.id, this);
    });
  });

  // Start countdown updates
  startCountdowns();
}

function renderCard(item) {
  const isAuction = item.format === 'auction';
  const isWatched = watchlist.has(item.id);
  const countdown = item.endsAt ? computeCountdown(item.endsAt) : null;
  const shipping = item.shipping === 0 ? '<span class="shipping-tag">Free shipping</span>' : '+€' + item.shipping.toFixed(2) + ' shipping';
  const stars = '★'.repeat(Math.round((item.sellerRating / 100) * 5));

  return [
    '<div class="listing-card" data-id="' + escapeHTML(item.id) + '" role="article" tabindex="0" aria-label="' + escapeHTML(item.title) + '">',
    '  <div class="card-thumb-wrap">',
    '    <img class="card-thumb" src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '"',
    '      loading="lazy" onerror="this.src=\'' + PLACEHOLDER_SVG + '\'">',
    '    <button class="watchlist-btn' + (isWatched ? ' active' : '') + '" data-id="' + escapeHTML(item.id) + '"',
    '      aria-label="' + (isWatched ? 'Remove from' : 'Add to') + ' watchlist" title="Watchlist">',
    '      ' + (isWatched ? '★' : '☆'),
    '    </button>',
    '    <span class="format-badge ' + escapeHTML(item.format) + '">' + (isAuction ? 'Auction' : 'Buy Now') + '</span>',
    '  </div>',
    '  <div class="card-body">',
    '    <p class="card-title">' + escapeHTML(item.title) + '</p>',
    '    <p class="card-price"><span class="currency">€</span>' + item.price.toFixed(2) + '</p>',
    '    <div class="card-meta">',
    isAuction && countdown
      ? '      <span class="countdown-badge" data-ends="' + escapeHTML(item.endsAt) + '">⏱ ' + escapeHTML(countdown) + '</span>'
      : '',
    isAuction ? '      <span>' + (item.bids || 0) + ' bid' + (item.bids !== 1 ? 's' : '') + '</span>' : '',
    '      ' + shipping,
    '      <span class="condition-tag">' + escapeHTML(item.condition) + '</span>',
    '    </div>',
    '    <div class="seller-line">',
    '      <span class="seller-stars">' + escapeHTML(stars) + '</span>',
    '      <span class="seller-pct">' + escapeHTML(String(item.sellerRating)) + '%</span>',
    '      <span>(' + escapeHTML(String(item.reviewCount)) + ')</span>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');
}

// ── Countdowns ────────────────────────────────────────────────────────────
function startCountdowns() {
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  updateAllCountdowns();
  countdownIntervalId = setInterval(updateAllCountdowns, 60000);
}

function updateAllCountdowns() {
  document.querySelectorAll('.countdown-badge[data-ends]').forEach(el => {
    const endsAt = el.getAttribute('data-ends');
    const text = computeCountdown(endsAt);
    el.textContent = text ? '⏱ ' + text : '';
  });
  // Also update detail modal if open
  const detailCountdown = document.getElementById('detail-countdown');
  if (detailCountdown && currentDetail) {
    const text = computeCountdown(currentDetail.endsAt);
    detailCountdown.textContent = text ? '⏱ ' + text : '';
  }
}

// ── Watchlist ─────────────────────────────────────────────────────────────
function toggleWatchlist(id, btn) {
  if (watchlist.has(id)) {
    watchlist.delete(id);
    btn.textContent = '☆';
    btn.classList.remove('active');
    btn.setAttribute('aria-label', 'Add to watchlist');
    showToast('Removed from watchlist');
  } else {
    watchlist.add(id);
    btn.textContent = '★';
    btn.classList.add('active');
    btn.setAttribute('aria-label', 'Remove from watchlist');
    showToast('Added to watchlist');
  }
}

// ── Detail Modal ──────────────────────────────────────────────────────────
function openDetail(id) {
  const data = getListings();
  if (!data) return;
  const item = data.find(i => i.id === id);
  if (!item) return;
  currentDetail = item;

  const overlay = document.getElementById('detail-overlay');
  const content = document.getElementById('detail-content');
  if (!overlay || !content) return;

  const isAuction = item.format === 'auction';
  const countdown = item.endsAt ? computeCountdown(item.endsAt) : null;
  const stars = '★'.repeat(Math.round((item.sellerRating / 100) * 5));

  // Generate synthetic thumb images (same seed, different sizes)
  const thumbs = [item.image, item.image + '2', item.image + '3'].map((src, i) =>
    '<img src="' + escapeHTML(item.image) + '" alt="View ' + (i+1) + '" class="' + (i===0 ? 'active' : '') + '"' +
    ' onerror="this.src=\'' + PLACEHOLDER_SVG + '\'" onclick="switchThumb(this, \'' + escapeHTML(item.image) + '\')">'
  ).join('');

  // Bid history (synthetic)
  const bidRows = isAuction && item.bids > 0 ? Array.from({length: Math.min(item.bids, 5)}, (_, i) => {
    const amt = (item.price - i * (item.price * 0.05)).toFixed(2);
    const mins = (i * 37) + ' min ago';
    return '<tr><td>Bidder' + (1000 + i) + '</td><td>€' + amt + '</td><td>' + mins + '</td></tr>';
  }).join('') : '<tr><td colspan="3" style="color:var(--muted);text-align:center">No bids yet</td></tr>';

  content.innerHTML = [
    '<div class="detail-inner">',
    '  <div class="detail-gallery">',
    '    <img id="detail-main-img" class="detail-main-img" src="' + escapeHTML(item.image) + '"',
    '      alt="' + escapeHTML(item.title) + '" onerror="this.src=\'' + PLACEHOLDER_SVG + '\'">',
    '    <div class="thumb-strip">' + thumbs + '</div>',
    '  </div>',
    '  <div class="detail-panel">',
    '    <h2 class="detail-title">' + escapeHTML(item.title) + '</h2>',
    '    <div class="detail-price-row">',
    '      <span class="detail-price">€' + item.price.toFixed(2) + '</span>',
    isAuction ? '<span class="detail-bids">' + escapeHTML(String(item.bids || 0)) + ' bids</span>' : '',
    '    </div>',
    countdown ? '<div class="detail-countdown" id="detail-countdown">⏱ ' + escapeHTML(countdown) + '</div>' : '<div id="detail-countdown"></div>',
    '    <div class="detail-shipping">' + (item.shipping === 0 ? '✓ Free shipping' : '+ €' + item.shipping.toFixed(2) + ' shipping') + '</div>',
    '    <span class="detail-condition">' + escapeHTML(item.condition) + '</span>',
    '',
    isAuction
      ? '<button class="detail-action-btn btn-bid" onclick="showToast(\'Bidding coming soon in the live version!\')">Place Bid →</button>'
      : [
          '<div class="qty-row">',
          '  <span class="qty-label">Qty:</span>',
          '  <select class="qty-select" id="detail-qty">',
          '    <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>',
          '  </select>',
          '</div>',
          '<button class="detail-action-btn btn-buynow" onclick="showToast(\'Added to cart!\')">Buy Now</button>',
        ].join(''),
    '',
    isAuction
      ? '<div class="bid-history"><div class="bid-history-title">Recent Bids</div>' +
        '<table class="bid-table"><thead><tr><th>Bidder</th><th>Amount</th><th>When</th></tr></thead>' +
        '<tbody>' + bidRows + '</tbody></table></div>'
      : '',
    '',
    '    <div class="seller-card">',
    '      <div class="seller-card-name">' + escapeHTML(item.sellerName) + '</div>',
    '      <div class="seller-card-meta">',
    '        <span class="seller-stars">' + escapeHTML(stars) + '</span>',
    '        ' + escapeHTML(String(item.sellerRating)) + '% positive feedback · ' + escapeHTML(String(item.reviewCount)) + ' reviews',
    '      </div>',
    '      <button class="msg-seller-btn" onclick="messageSeller(' + JSON.stringify(escapeHTML(item.sellerName)) + ')">',
    '        ✉️ Message ' + escapeHTML(item.sellerName),
    '      </button>',
    '    </div>',
    '  </div>',
    '</div>',
  ].join('\n');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Update countdown in detail immediately
  updateAllCountdowns();
}

function closeDetail() {
  const overlay = document.getElementById('detail-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  currentDetail = null;
}

function switchThumb(el, src) {
  const mainImg = document.getElementById('detail-main-img');
  if (mainImg) mainImg.src = src;
  document.querySelectorAll('.thumb-strip img').forEach(img => img.classList.remove('active'));
  el.classList.add('active');
}

function messageSeller(name) {
  showToast('✉️ Message sent to ' + name + '! (Demo — no message was actually sent)');
}

// ── Filters ───────────────────────────────────────────────────────────────
function initFilters() {
  // Category nav links
  document.querySelectorAll('.catnav-link[data-cat]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      activeCategory = this.dataset.cat;
      document.querySelectorAll('.catnav-link[data-cat]').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      renderListings();
    });
  });

  // Format radio
  document.querySelectorAll('input[name="format"]').forEach(radio => {
    radio.addEventListener('change', function() {
      activeFormat = this.value;
      renderListings();
    });
  });

  // Condition checkboxes
  document.querySelectorAll('input[name="condition"]').forEach(cb => {
    cb.addEventListener('change', function() {
      if (this.checked) activeConditions.add(this.value);
      else activeConditions.delete(this.value);
      renderListings();
    });
  });

  // Sort select
  const sortSel = document.getElementById('sort-select');
  if (sortSel) sortSel.addEventListener('change', renderListings);

  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      // Debounce slightly
      clearTimeout(searchInput._t);
      searchInput._t = setTimeout(renderListings, 200);
    });
    // Search form submit (prevent page reload)
    const form = document.getElementById('search-form');
    if (form) form.addEventListener('submit', function(e) { e.preventDefault(); renderListings(); });
  }

  // Apply filters button
  const applyBtn = document.getElementById('sidebar-apply-btn');
  if (applyBtn) applyBtn.addEventListener('click', renderListings);

  // Mobile filter toggle
  const filterToggle = document.getElementById('filter-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      this.textContent = sidebar.classList.contains('open') ? '🔼 Hide Filters' : '🔽 Show Filters';
    });
  }

  // Detail modal close
  const overlay = document.getElementById('detail-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeDetail();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeDetail();
    });
  }
  const closeBtn = document.getElementById('detail-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
}

// ── Toast ─────────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Scroll effects ────────────────────────────────────────────────────────
function initScroll() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', function() {
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
}

// ── DOMContentLoaded ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  renderListings();
  initFilters();
  initScroll();
});
