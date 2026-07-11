// EUshop v19 — Amazon-Inspired Catalog Application Logic
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

const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
  '<rect width="400" height="400" fill="#f0f0f0"/>' +
  '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" ' +
  'font-family="sans-serif" font-size="14" fill="#999">Image unavailable</text>' +
  '</svg>'
);

// ── State ─────────────────────────────────────────────────────────────────
let cart = {};          // { id: qty }
let cartCount = 0;
let activeCategory = 'all';
let activeSort = 'featured';
let currentDetail = null;
let carouselIndex = 0;
let carouselInterval = null;

// ── Data Guard ────────────────────────────────────────────────────────────
function getProducts() {
  if (typeof PRODUCTS === 'undefined' || !Array.isArray(PRODUCTS)) return null;
  return PRODUCTS;
}
function getHeroSlides() {
  if (typeof HERO_SLIDES === 'undefined' || !Array.isArray(HERO_SLIDES)) return [];
  return HERO_SLIDES;
}

// ── Star Rating Helper ────────────────────────────────────────────────────
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ── Hero Carousel ─────────────────────────────────────────────────────────
function buildCarousel() {
  const track = document.getElementById('carousel-track');
  const dotsContainer = document.getElementById('carousel-dots');
  const slides = getHeroSlides();
  if (!track || !slides.length) return;

  track.innerHTML = slides.map((s, i) =>
    '<div class="carousel-slide" style="background:' + escapeHTML(s.bg) + '">' +
    '  <div class="slide-content">' +
    '    <h2 class="slide-title">' + escapeHTML(s.title) + '</h2>' +
    '    <p class="slide-subtitle">' + escapeHTML(s.subtitle) + '</p>' +
    '    <button class="slide-cta" onclick="setCategory(\'' + escapeHTML(s.cat) + '\')">' + escapeHTML(s.cta) + '</button>' +
    '  </div>' +
    '  <div class="slide-icon" aria-hidden="true">' + s.icon + '</div>' +
    '</div>'
  ).join('');

  if (dotsContainer) {
    dotsContainer.innerHTML = slides.map((_, i) =>
      '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" ' +
      'aria-label="Slide ' + (i+1) + '" onclick="goToSlide(' + i + ')"></button>'
    ).join('');
  }

  startCarousel();
}

function goToSlide(idx) {
  const track = document.getElementById('carousel-track');
  const slides = getHeroSlides();
  if (!track || !slides.length) return;
  carouselIndex = ((idx % slides.length) + slides.length) % slides.length;
  track.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function startCarousel() {
  if (carouselInterval) clearInterval(carouselInterval);
  carouselInterval = setInterval(function() {
    const slides = getHeroSlides();
    goToSlide((carouselIndex + 1) % (slides.length || 1));
  }, 4000);
}

// ── Cart ──────────────────────────────────────────────────────────────────
function addToCart(id, qty) {
  qty = qty || 1;
  cart[id] = (cart[id] || 0) + qty;
  cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  updateCartBadge();
  showToast('✓ Added to cart');
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  if (!badge) return;
  badge.textContent = cartCount;
  badge.style.display = cartCount > 0 ? 'flex' : 'none';
}

// ── Render Scroll Rows ────────────────────────────────────────────────────
function buildScrollRows() {
  const data = getProducts();
  if (!data) return;

  // Deals row: items with a wasPrice
  const dealsRow = document.getElementById('deals-row');
  if (dealsRow) {
    const deals = data.filter(p => p.wasPrice).slice(0, 10);
    dealsRow.innerHTML = deals.map(p => renderMiniCard(p)).join('');
    attachMiniCardClicks(dealsRow);
  }

  // Electronics row
  const elRow = document.getElementById('electronics-row');
  if (elRow) {
    const electronics = data.filter(p => p.category === 'electronics');
    elRow.innerHTML = electronics.map(p => renderMiniCard(p)).join('');
    attachMiniCardClicks(elRow);
  }
}

function renderMiniCard(p) {
  return [
    '<div class="mini-card" data-id="' + escapeHTML(p.id) + '" role="button" tabindex="0" aria-label="' + escapeHTML(p.title) + '">',
    '  <img class="mini-card-img" src="' + escapeHTML(p.image) + '" alt="' + escapeHTML(p.title) + '"',
    '    loading="lazy" onerror="this.src=\'' + PLACEHOLDER_SVG + '\'">',
    '  <div class="mini-card-title">' + escapeHTML(p.title) + '</div>',
    '  <div class="mini-card-price">€' + p.price.toFixed(2) + '</div>',
    '</div>',
  ].join('');
}

function attachMiniCardClicks(container) {
  container.querySelectorAll('.mini-card').forEach(card => {
    card.addEventListener('click', function() { openDetail(this.dataset.id); });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(this.dataset.id); }
    });
  });
}

// ── Render Product Grid ───────────────────────────────────────────────────
function renderProducts() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  const data = getProducts();
  if (!data) {
    grid.innerHTML = '<div class="error-state-v19">⚠️ Product data could not be loaded. Please refresh the page.</div>';
    if (countEl) countEl.textContent = '';
    return;
  }

  const searchVal = (document.getElementById('search-input') ? document.getElementById('search-input').value : '').toLowerCase().trim();

  let filtered = data.filter(p => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (searchVal && !p.title.toLowerCase().includes(searchVal)) return false;
    return true;
  });

  // Sort
  const sortVal = (document.getElementById('sort-select-v19') ? document.getElementById('sort-select-v19').value : 'featured');
  if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortVal === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sortVal === 'reviews') filtered.sort((a, b) => b.reviewCount - a.reviewCount);

  if (countEl) {
    countEl.innerHTML = filtered.length + ' result' + (filtered.length !== 1 ? 's' : '') +
      (activeCategory !== 'all' ? ' in <strong>' + escapeHTML(activeCategory) + '</strong>' : '');
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state-v19"><div class="empty-icon">🔍</div><p>No products match your search. Try a different term.</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(p => renderProductCard(p)).join('');

  grid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.add-to-cart-btn')) return;
      openDetail(this.dataset.id);
    });
  });
  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(this.dataset.id, 1);
    });
  });
}

function renderProductCard(p) {
  const badge = p.badge
    ? '<span class="product-badge ' + (p.badge === 'Best Seller' ? 'bestseller' : 'fastdelivery') + '">' + escapeHTML(p.badge) + '</span>'
    : '';
  const discount = p.wasPrice
    ? ' <span class="detail-discount">(' + Math.round((1 - p.price / p.wasPrice) * 100) + '% off)</span>'
    : '';

  return [
    '<div class="product-card" data-id="' + escapeHTML(p.id) + '" role="article" tabindex="0" aria-label="' + escapeHTML(p.title) + '">',
    badge,
    '  <img class="product-img" src="' + escapeHTML(p.image) + '" alt="' + escapeHTML(p.title) + '"',
    '    loading="lazy" onerror="this.src=\'' + PLACEHOLDER_SVG + '\'">',
    '  <div class="product-body">',
    '    <p class="product-title">' + escapeHTML(p.title) + '</p>',
    '    <div class="star-row">',
    '      <span class="stars" aria-label="Rating: ' + p.rating + ' out of 5">' + renderStars(p.rating) + '</span>',
    '      <span class="review-count">(' + p.reviewCount.toLocaleString() + ')</span>',
    '    </div>',
    '    <div class="price-row">',
    '      <span class="price-now">€' + p.price.toFixed(2) + '</span>',
    p.wasPrice ? '<span class="price-was">€' + p.wasPrice.toFixed(2) + '</span>' : '',
    '    </div>',
    '    <div class="shipping-label">' + escapeHTML(p.shipping) + '</div>',
    '    <button class="add-to-cart-btn" data-id="' + escapeHTML(p.id) + '" aria-label="Add ' + escapeHTML(p.title) + ' to cart">',
    '      Add to Cart',
    '    </button>',
    '  </div>',
    '</div>',
  ].join('\n');
}

// ── Detail Modal ──────────────────────────────────────────────────────────
function openDetail(id) {
  const data = getProducts();
  if (!data) return;
  const item = data.find(p => p.id === id);
  if (!item) return;
  currentDetail = item;

  const overlay = document.getElementById('detail-overlay');
  const content = document.getElementById('detail-content');
  if (!overlay || !content) return;

  const discount = item.wasPrice
    ? Math.round((1 - item.price / item.wasPrice) * 100) + '% off'
    : null;

  // Related products
  const related = (item.relatedIds || []).map(rid => data.find(p => p.id === rid)).filter(Boolean);
  const relatedHTML = related.map(r =>
    '<div class="mini-card" data-id="' + escapeHTML(r.id) + '" role="button" tabindex="0" style="cursor:pointer" onclick="openDetail(\'' + escapeHTML(r.id) + '\')">' +
    '<img class="mini-card-img" src="' + escapeHTML(r.image) + '" alt="' + escapeHTML(r.title) + '" onerror="this.src=\'' + PLACEHOLDER_SVG + '\'">' +
    '<div class="mini-card-title">' + escapeHTML(r.title) + '</div>' +
    '<div class="mini-card-price">€' + r.price.toFixed(2) + '</div>' +
    '</div>'
  ).join('');

  content.innerHTML = [
    '<div class="detail-inner">',
    // Gallery
    '  <div class="detail-gallery">',
    '    <img id="detail-main-img" class="detail-main-img" src="' + escapeHTML(item.image) + '"',
    '      alt="' + escapeHTML(item.title) + '" onerror="this.src=\'' + PLACEHOLDER_SVG + '\'">',
    '    <div class="thumb-strip">',
    [item.image, item.image + '_2', item.image + '_3'].map((src, i) =>
      '<img src="' + escapeHTML(item.image) + '" alt="View ' + (i+1) + '" class="' + (i===0 ? 'active' : '') + '"' +
      ' onerror="this.src=\'' + PLACEHOLDER_SVG + '\'" onclick="switchThumb(this, \'' + escapeHTML(item.image) + '\')">'
    ).join(''),
    '    </div>',
    '  </div>',
    // Panel
    '  <div class="detail-panel">',
    '    <h2 class="detail-title">' + escapeHTML(item.title) + '</h2>',
    '    <div class="detail-star-row">',
    '      <span class="detail-stars">' + renderStars(item.rating) + '</span>',
    '      <span class="detail-review-count">' + item.reviewCount.toLocaleString() + ' reviews</span>',
    '    </div>',
    '    <div class="detail-price-block">',
    '      <span class="detail-price">€' + item.price.toFixed(2) + '</span>',
    item.wasPrice ? '<span class="detail-was-price">€' + item.wasPrice.toFixed(2) + '</span>' : '',
    discount ? '<span class="detail-discount">' + escapeHTML(discount) + '</span>' : '',
    '    </div>',
    '    <div class="detail-shipping">✓ ' + escapeHTML(item.shipping) + '</div>',
    // Buy box
    '    <div class="buy-box">',
    '      <div class="buy-box-price">€' + item.price.toFixed(2) + '</div>',
    '      <div class="qty-row-v19">',
    '        <span class="qty-label-v19">Qty:</span>',
    '        <select class="qty-select-v19" id="detail-qty">',
    '          <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>',
    '        </select>',
    '      </div>',
    '      <button class="detail-btn btn-add-cart" onclick="addToCartFromDetail(\'' + escapeHTML(item.id) + '\')">Add to Cart</button>',
    '      <button class="detail-btn btn-buy-now" onclick="showToast(\'Checkout coming in the live version!\')">Buy Now</button>',
    '    </div>',
    '  </div>',
    '</div>',
    // Related products row
    related.length > 0
      ? '<div class="detail-related-section">' +
        '<div class="detail-related-title">Customers also bought</div>' +
        '<div class="detail-related-row">' + relatedHTML + '</div>' +
        '</div>'
      : '',
  ].join('\n');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function addToCartFromDetail(id) {
  const qtyEl = document.getElementById('detail-qty');
  const qty = qtyEl ? parseInt(qtyEl.value, 10) || 1 : 1;
  addToCart(id, qty);
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

// ── Category Filter ───────────────────────────────────────────────────────
function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.cat === cat);
  });
  document.querySelectorAll('.nav-cat-link[data-cat]').forEach(link => {
    link.classList.toggle('active', link.dataset.cat === cat);
  });
  renderProducts();
  // Scroll to grid on mobile
  const grid = document.getElementById('product-grid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Init ──────────────────────────────────────────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', function() { setCategory(this.dataset.cat); });
  });
  document.querySelectorAll('.nav-cat-link[data-cat]').forEach(link => {
    link.addEventListener('click', function(e) { e.preventDefault(); setCategory(this.dataset.cat); });
  });

  const sortSel = document.getElementById('sort-select-v19');
  if (sortSel) sortSel.addEventListener('change', renderProducts);

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchInput._t);
      searchInput._t = setTimeout(renderProducts, 200);
    });
    const form = document.getElementById('search-form');
    if (form) form.addEventListener('submit', function(e) { e.preventDefault(); renderProducts(); });
  }

  // Detail modal close
  const overlay = document.getElementById('detail-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeDetail(); });
  }
  const closeBtn = document.getElementById('detail-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeDetail);
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeDetail(); });

  // Carousel controls
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (prevBtn) prevBtn.addEventListener('click', function() {
    const slides = getHeroSlides();
    goToSlide((carouselIndex - 1 + slides.length) % slides.length);
    startCarousel(); // reset timer
  });
  if (nextBtn) nextBtn.addEventListener('click', function() {
    const slides = getHeroSlides();
    goToSlide((carouselIndex + 1) % slides.length);
    startCarousel();
  });
}

function initScroll() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', function() {
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
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

// ── DOMContentLoaded ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  buildCarousel();
  buildScrollRows();
  renderProducts();
  initFilters();
  initScroll();
  updateCartBadge();
});




// ── EUSHOP DYNAMIC VERSION NAVIGATION WIDGET ──────────────────────────────
(function() {
  if (window.self !== window.top) return; // Do not render inside iframes
  if (document.getElementById('eushop-dynamic-nav')) return;

  const versions = [
    { key: 'v15', name: 'V15 - Next-Gen Discovery', path: '/eushop/' },
    { key: 'v1', name: 'V1 - Pitch & Calculator', path: '/eushop/?v=v1' },
    { key: 'v2', name: 'V2 - Buyer Marketplace', path: '/eushop/?v=v2' },
    { key: 'v3', name: 'V3 - Seller Compliance Hub', path: '/eushop/become-seller/?v=v3' },
    { key: 'v4', name: 'V4 - Admin Console', path: '/eushop/admin/dashboard/?v=v4' },
    { key: 'v5', name: 'V5 - Developer Portal & Docs', path: '/eushop/docs/?v=v5' },
    { key: 'v3_static', name: 'V3 - Legacy Static Core App', path: '/eushop/v3/' },
    { key: 'v6', name: 'V6 - Original Core App', path: '/eushop/v6/' },
    { key: 'v7', name: 'V7 - Original: Emerald', path: '/eushop/v7/' },
    { key: 'v8', name: 'V8 - Original: Midnight', path: '/eushop/v8/' },
    { key: 'v9', name: 'V9 - Original: Rose Gold', path: '/eushop/v9/' },
    { key: 'v10', name: 'V10 - Platinum Light', path: '/eushop/v10/' },
    { key: 'v11', name: 'V11 - Forest Green', path: '/eushop/v11/' },
    { key: 'v12', name: 'V12 - Terracotta Warm', path: '/eushop/v12/' },
    { key: 'v13', name: 'V13 - Lavender Field', path: '/eushop/v13/' },
    { key: 'v18', name: 'V18 - Auction Marketplace', path: '/eushop/v18/' },
    { key: 'v19', name: 'V19 - Catalog Marketplace', path: '/eushop/v19/' }
  ];

  // Determine current active version
  let activeKey = 'v15';
  const pathName = window.location.pathname;
  if (pathName.includes('/v3/')) activeKey = 'v3_static';
  else if (pathName.includes('/v6/')) activeKey = 'v6';
  else if (pathName.includes('/v7/')) activeKey = 'v7';
  else if (pathName.includes('/v8/')) activeKey = 'v8';
  else if (pathName.includes('/v9/')) activeKey = 'v9';
  else if (pathName.includes('/v10/')) activeKey = 'v10';
  else if (pathName.includes('/v11/')) activeKey = 'v11';
  else if (pathName.includes('/v12/')) activeKey = 'v12';
  else if (pathName.includes('/v13/')) activeKey = 'v13';
  else if (pathName.includes('/v18/')) activeKey = 'v18';
  else if (pathName.includes('/v19/')) activeKey = 'v19';

  // Inject Styles
  const style = document.createElement('style');
  style.id = 'eushop-dynamic-nav-style';
  style.innerHTML = `
    .eushop-nav-bar {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 999px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: all 0.3s ease;
    }
    .dark .eushop-nav-bar, [data-theme="dark"] .eushop-nav-bar, body.dark-mode .eushop-nav-bar, .dark-mode .eushop-nav-bar {
      background: rgba(20, 20, 25, 0.9);
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .eushop-nav-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      white-space: nowrap;
    }
    .dark .eushop-nav-label, [data-theme="dark"] .eushop-nav-label, body.dark-mode .eushop-nav-label, .dark-mode .eushop-nav-label {
      color: #aaa;
    }
    .eushop-nav-select {
      background: transparent;
      border: none;
      font-size: 13px;
      font-weight: 700;
      color: #111;
      cursor: pointer;
      outline: none;
      padding-right: 20px;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
      background-repeat: no-repeat;
      background-position: right center;
      background-size: 14px;
    }
    .dark .eushop-nav-select, [data-theme="dark"] .eushop-nav-select, body.dark-mode .eushop-nav-select, .dark-mode .eushop-nav-select {
      color: #fff;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
    }
    .eushop-nav-portal {
      font-size: 12px;
      font-weight: 700;
      color: #2563eb;
      text-decoration: none;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(37, 99, 235, 0.08);
      transition: all 0.2s;
      white-space: nowrap;
    }
    .eushop-nav-portal:hover {
      background: rgba(37, 99, 235, 0.16);
      text-decoration: none;
    }
  `;
  document.head.appendChild(style);

  // Create Container
  const container = document.createElement('div');
  container.id = 'eushop-dynamic-nav';
  container.className = 'eushop-nav-bar';
  
  const label = document.createElement('span');
  label.className = 'eushop-nav-label';
  label.innerText = 'Active Face:';
  container.appendChild(label);

  const select = document.createElement('select');
  select.className = 'eushop-nav-select';
  
  versions.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.key;
    opt.style.color = '#000'; // Make options readable in dark mode
    opt.innerText = v.name;
    opt.selected = v.key === activeKey;
    select.appendChild(opt);
  });
  
  select.addEventListener('change', function() {
    const selected = versions.find(v => v.key === this.value);
    if (selected) {
      localStorage.setItem('eushop-demo-version', selected.key);
      window.location.href = selected.path;
    }
  });
  
  container.appendChild(select);

  const portalLink = document.createElement('a');
  portalLink.className = 'eushop-nav-portal';
  portalLink.href = '/eushop/versions/';
  portalLink.innerText = 'Portal';
  container.appendChild(portalLink);

  document.body.appendChild(container);
})();
