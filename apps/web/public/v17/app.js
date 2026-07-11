// EuShop — Application Logic
'use strict';
// ── Graceful Degradation Storage & XSS Security Helpers ───────────────────
function safeGetItem(key) {
  try { return safeGetItem(key); } catch (e) { return null; }
}
function safeSetItem(key, value) {
  try { safeSetItem(key, value); } catch (e) {}
}
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return str.toString().replace(/[&<>"']/g, function(m) {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
      default: return m;
    }
  });
}


// ── State ─────────────────────────────────────────────────────────────────
let allListings = [];
let allRequests = [];
let favorites = new Set();
let activeCountry = null;
let activeCategory = 'all';
let catalogFilter = '';
let countryFilter = '';
let SESSION_KEY = 'eushop_session_' + (safeGetItem('eushop_uid') || (() => {
  const uid = 'u_' + Date.now();
  safeSetItem('eushop_uid', uid);
  return uid;
})());


// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadListings();
  loadRequests();
  loadFavorites();
  buildHeroFlags();
  buildHeroStars();
  buildCountryGrid();
  buildCountrySelect();
  buildRequestCountrySelect();
  buildEmojiPicker();
  renderListings();
  renderRequests();
  renderMyListings();
  buildCatalog();
  buildTestimonials();
  buildFAQ();
  updateStatCount();
  initScrollEffects();
  initNavScroll();
  initBackToTop();
  initCookieBanner();
  updateRangeTrack();
});


// ── localStorage ──────────────────────────────────────────────────────────
function loadListings() {
  const stored = JSON.parse(safeGetItem('eushop_listings') || '[]');
  allListings = [...DEMO_LISTINGS, ...stored];
}
function saveListings() {
  const userListings = allListings.filter(l => !l.id.startsWith('demo'));
  safeSetItem('eushop_listings', JSON.stringify(userListings));
}
function loadRequests() {
  allRequests = JSON.parse(safeGetItem('eushop_requests') || '[]');
}
function saveRequests() {
  safeSetItem('eushop_requests', JSON.stringify(allRequests));
}
function loadFavorites() {
  favorites = new Set(JSON.parse(safeGetItem('eushop_favs') || '[]'));
}
function saveFavorites() {
  safeSetItem('eushop_favs', JSON.stringify([...favorites]));
}


// ── Hero Flags Scroll ─────────────────────────────────────────────────────
function buildHeroFlags() {
  const track = document.getElementById('flags-track');
  if (!track) return;
  const items = [...COUNTRIES, ...COUNTRIES].map(c => {
    const pill = document.createElement('div');
    pill.className = 'flag-pill';
    const fc = c.code.toLowerCase();
    pill.innerHTML = `<img src="https://flagcdn.com/w40/${fc}.png" style="width:22px;height:15px;border-radius:2px;object-fit:cover" alt="${c.name}"/><span>${c.name}</span>`;
    return pill;
  });
  items.forEach(el => track.appendChild(el));
}

// ── Hero Stars ────────────────────────────────────────────────────────────
function buildHeroStars() {
  const bg = document.getElementById('hero-stars-bg');
  if (!bg) return;
  for (let i = 0; i < 60; i++) {
    const s = document.createElement('div');
    s.className = 'hero-star';
    s.textContent = '★';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 3) + 's';
    s.style.fontSize = (0.4 + Math.random() * 0.8) + 'rem';
    bg.appendChild(s);
  }
}

// ── Country Grid ──────────────────────────────────────────────────────────
function buildCountryGrid(filter = '') {
  const grid = document.getElementById('countries-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const q = filter.toLowerCase();
  COUNTRIES.filter(c => !q || c.name.toLowerCase().includes(q)).forEach(c => {
    const count = allListings.filter(l => l.country === c.code).length;
    const card = document.createElement('div');
    card.className = 'country-card fade-in' + (activeCountry === c.code ? ' active' : '');
    card.id = 'country-' + c.code;
    const flagCode = c.code.toLowerCase();
    card.innerHTML = `<img class="country-flag-img" src="https://flagcdn.com/w80/${flagCode}.png" alt="${c.name} flag" onerror="this.style.display='none';if(this.nextElementSibling) this.nextElementSibling.style.display='block'"/><span class="country-flag" style="display:none">${c.flag}</span>
      <div class="country-card-name">${c.name}</div>
      <div class="country-card-count">${count} listing${count !== 1 ? 's' : ''}</div>`;
    card.onclick = () => setCountryFilter(c.code, c.name, c.flag);
    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

function filterCountries(val) {
  countryFilter = val;
  buildCountryGrid(val);
}

function setCountryFilter(code, name, flag) {
  if (activeCountry === code) { clearCountryFilter(); return; }
  activeCountry = code;
  buildCountryGrid(countryFilter);
  const af = document.getElementById('active-filter');
  const afl = document.getElementById('active-filter-label');
  af.style.display = 'flex';
  afl.textContent = `${flag} Showing: ${name}`;
  renderListings();
  document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
}

function clearCountryFilter() {
  activeCountry = null;
  buildCountryGrid(countryFilter);
  document.getElementById('active-filter').style.display = 'none';
  renderListings();
}

// ── Country Select (form) ─────────────────────────────────────────────────
function buildCountrySelect() {
  const sel = document.getElementById('form-country');
  if (!sel) return;
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.flag + ' ' + c.name;
    sel.appendChild(opt);
  });
}

function populateFoodSuggestions() {
  const code = document.getElementById('form-country').value;
  const dl = document.getElementById('food-suggestions');
  dl.innerHTML = '';
  CATALOG.filter(f => f.country === code).forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.name;
    dl.appendChild(opt);
  });
}

// ── Listings ──────────────────────────────────────────────────────────────
function filterListings(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderListings();
}

function getSortedListings(arr) {
  const sort = document.getElementById('sort-select')?.value || 'newest';
  const copy = [...arr];
  if (sort === 'fee-asc') copy.sort((a,b) => a.fee - b.fee);
  else if (sort === 'fee-desc') copy.sort((a,b) => b.fee - a.fee);
  else if (sort === 'country') copy.sort((a,b) => (a.country||'').localeCompare(b.country||''));
  else copy.sort((a,b) => new Date(b.date||0) - new Date(a.date||0));
  return copy;
}

function renderListings() {
  const grid = document.getElementById('listings-grid');
  const empty = document.getElementById('listings-empty');
  if (!grid) return;
  grid.innerHTML = '';

  let filtered = allListings;
  if (activeCountry) filtered = filtered.filter(l => l.country === activeCountry);
  if (activeCategory === 'favs') filtered = filtered.filter(l => favorites.has(l.id));
  else if (activeCategory !== 'all') filtered = filtered.filter(l => l.category === activeCategory);

  // Live search
  const q = (document.getElementById('listings-search')?.value || '').toLowerCase().trim();
  if (q) filtered = filtered.filter(l =>
    l.food.toLowerCase().includes(q) ||
    l.location.toLowerCase().includes(q) ||
    (COUNTRIES.find(c => c.code === l.country)?.name || '').toLowerCase().includes(q)
  );

  // Fee range
  const maxFee = parseFloat(document.getElementById('fee-max')?.value || 100);
  filtered = filtered.filter(l => l.fee <= maxFee);
  updateRangeTrack();

  filtered = getSortedListings(filtered);

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach((l, i) => {
    const country = COUNTRIES.find(c => c.code === l.country) || {};
    const card = document.createElement('div');
    card.className = 'listing-card fade-in';
    card.id = 'listing-' + l.id;
    const fc = (l.country || 'eu').toLowerCase();
    const flagImg = `<img src="https://flagcdn.com/w80/${fc}.png" style="width:32px;height:22px;border-radius:3px;object-fit:cover" alt="${country.name||'EU'}"/>`;
    const isFav = favorites.has(l.id);
    card.innerHTML = `
      <div class="listing-card-header">
        <span class="listing-country-flag">${flagImg}</span>
        <span class="listing-category-badge">${catLabel(l.category)}</span>
        <button class="fav-btn ${isFav?'active':''}" id="fav-${l.id}" onclick="toggleFav(event,'${l.id}')">${isFav?'❤️':'🤍'}</button>
      </div>
      <div class="listing-card-body">
        <div class="listing-food-name">${escapeHTML(l.food)}</div>
        <div class="listing-location">📍 ${escapeHTML(l.location)}</div>
        <div class="listing-description">${escapeHTML(l.description || 'No description provided.')}</div>
        <div class="listing-footer">
          <div class="listing-fee">€${l.fee} <span>finder's fee</span></div>
          <button class="listing-contact-btn" onclick="openDetailModal('${l.id}')">View Details</button>
        </div>
      </div>
      <div class="listing-poster">Posted by ${escapeHTML(l.name)} · ${formatDate(l.date)}</div>`;
    grid.appendChild(card);
    setTimeout(() => card.classList.add('visible'), i * 60);
  });

  updateStatCount();
}


function catLabel(cat) {
  const m = {chocolate:'🍫 Chocolate',candy:'🍬 Candy',biscuit:'🍪 Biscuit',savory:'🥩 Savory',sweet:'🍰 Sweet',drink:'🍶 Drink'};
  return m[cat] || cat;
}

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); } catch { return d; }
}

function updateStatCount() {
  const el = document.getElementById('stat-listings');
  if (el) el.textContent = allListings.length;
}

// ── Post Listing Modal ────────────────────────────────────────────────────
function openPostModal() {
  document.getElementById('post-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePostModal() {
  document.getElementById('post-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function closePostModalOutside(e) {
  if (e.target === document.getElementById('post-modal')) closePostModal();
}

function submitListing(e) {
  e.preventDefault();
  const code = document.getElementById('form-country').value;
  const country = COUNTRIES.find(c => c.code === code) || {};
  const listing = {
    id: 'user_' + Date.now(),
    name: document.getElementById('form-name').value.trim(),
    country: code,
    flag: country.flag || '🇪🇺',
    emoji: document.getElementById('form-emoji')?.value || '🍫',
    food: document.getElementById('form-food').value.trim(),
    category: document.getElementById('form-category').value,
    location: document.getElementById('form-location').value.trim(),
    fee: parseFloat(document.getElementById('form-fee').value),
    contact: document.getElementById('form-contact').value.trim(),
    description: document.getElementById('form-description').value.trim(),
    date: new Date().toISOString().split('T')[0],
  };
  allListings.unshift(listing);
  saveListings();
  renderListings();
  renderMyListings();
  buildCountryGrid(countryFilter);
  closePostModal();
  document.getElementById('post-form').reset();
  document.getElementById('form-emoji').value = '🍫';
  showToast('🎉 Your listing is live! People can now find your ' + listing.food);
}


// ── Detail Modal ──────────────────────────────────────────────────────────
function openDetailModal(id) {
  const l = allListings.find(x => x.id === id);
  if (!l) return;
  const country = COUNTRIES.find(c => c.code === l.country) || {};
  const content = document.getElementById('detail-modal-content');
  const fc = (l.country || 'eu').toLowerCase();
  const flagImg = `<img src="https://flagcdn.com/w80/${fc}.png" style="width:60px;height:42px;border-radius:6px;object-fit:cover;display:block;margin:0 auto .8rem" alt="${country.name||'EU'}"/>`;
  const isFav = favorites.has(l.id);
  const isOwn = !l.id.startsWith('demo');
  const alsoFrom = buildAlsoFrom(l.country, l.id);
  content.innerHTML = `
    ${flagImg}
    <div class="detail-food">${escapeHTML(l.emoji ? l.emoji + ' ' : '')}${escapeHTML(l.food)}</div>
    <div class="detail-country-name">${escapeHTML(country.name || l.country)} · ${catLabel(l.category)}</div>
    <div class="detail-fee-big">€${l.fee}</div>
    <div class="detail-fee-label">Finder's Fee</div>
    ${l.description ? `<div class="detail-desc">${escapeHTML(l.description)}</div>` : ''}
    <div class="detail-grid">
      <div class="detail-item"><div class="detail-item-label">📍 Location</div><div class="detail-item-value">${escapeHTML(l.location)}</div></div>
      <div class="detail-item"><div class="detail-item-label">👤 Listed By</div><div class="detail-item-value">${escapeHTML(l.name)}</div></div>
      <div class="detail-item"><div class="detail-item-label">📅 Posted</div><div class="detail-item-value">${formatDate(l.date)}</div></div>
      <div class="detail-item"><div class="detail-item-label">🏷️ Category</div><div class="detail-item-value">${catLabel(l.category)}</div></div>
    </div>
    <button class="detail-contact-btn" onclick="contactLister('${escapeHTML(l.contact.replace(/'/g, "\\'"))}','${escapeHTML(l.food.replace(/'/g, "\\'"))}')">📩 Contact ${l.name}</button>
    <div class="detail-actions">
      <button class="detail-share-btn" onclick="shareListing('${l.id}')">🔗 Share Listing</button>
      <button class="detail-share-btn ${isFav?'active':''}" style="${isFav?'background:var(--navy);color:#fff;':''}" onclick="toggleFav(event,'${l.id}');openDetailModal('${l.id}')">${isFav?'❤️ Saved':'🤍 Save'}</button>
    </div>
    ${isOwn ? `<div class="detail-actions" style="margin-top:.5rem"><button class="detail-delete-btn" onclick="deleteListing('${l.id}')">🗑️ Delete My Listing</button></div>` : ''}
    ${alsoFrom}`;
  document.getElementById('detail-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('open');
  document.body.style.overflow = '';
}
function closeDetailModalOutside(e) {
  if (e.target === document.getElementById('detail-modal')) closeDetailModal();
}
function contactLister(contact, food) {
  if (contact.includes('@')) {
    window.location.href = `mailto:${contact}?subject=EuShop: Interested in ${food}&body=Hi! I found your listing on EuShop and I'm interested in your ${food}. What are the next steps?`;
  } else {
    const num = contact.replace(/\s/g, '');
    window.open(`https://wa.me/${num.replace('+','')}?text=Hi! I found your listing on EuShop and I'm interested in your ${food}.`, '_blank');
  }
  showToast('Opening contact for ' + food + '…');
}

function toggleFav(e, id) {
  e.stopPropagation();
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast('Removed from saved listings');
  } else {
    favorites.add(id);
    showToast('❤️ Saved to your favourites!');
  }
  saveFavorites();
  renderListings();
}

function shareListing(id) {
  const l = allListings.find(x => x.id === id);
  if (!l) return;
  const text = `Check out this listing on EuShop: ${l.food} from ${(COUNTRIES.find(c=>c.code===l.country)||{}).name||l.country} · €${l.fee} finder's fee · ${l.location}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    showToast('📋 Listing details copied to clipboard!');
  } else {
    showToast(text);
  }
}

function deleteListing(id) {
  if (!confirm('Delete this listing? This cannot be undone.')) return;
  allListings = allListings.filter(l => l.id !== id);
  favorites.delete(id);
  saveListings();
  saveFavorites();
  closeDetailModal();
  renderListings();
  renderMyListings();
  buildCountryGrid(countryFilter);
  showToast('🗑️ Listing deleted');
}


// ── Catalog ───────────────────────────────────────────────────────────────
function buildCatalog(filter = '') {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const q = filter.toLowerCase();

  COUNTRIES.forEach(c => {
    const items = CATALOG.filter(f => f.country === c.code && (
      !q || f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    ));
    if (!items.length) return;
    const block = document.createElement('div');
    block.className = 'catalog-country-block fade-in';
    const flagCode = c.code.toLowerCase();
    block.innerHTML = `
      <div class="catalog-country-header">
        <img class="country-flag-img" src="https://flagcdn.com/w80/${flagCode}.png" alt="${c.name}" style="width:32px;height:22px;border-radius:3px;border:none"/>
        <span class="catalog-country-name">${c.name}</span>
      </div>
      <div class="catalog-items-list">
        ${items.map(f => `
          <div class="catalog-item">
            <span class="catalog-item-icon">${f.icon}</span>
            <div class="catalog-item-info">
              <div class="catalog-item-name">${f.name}</div>
              <div class="catalog-item-desc">${f.desc}</div>
              <span class="catalog-item-type">${f.type}</span>
            </div>
          </div>`).join('')}
      </div>`;
    grid.appendChild(block);
    requestAnimationFrame(() => block.classList.add('visible'));
  });
}

function filterCatalog(val) {
  catalogFilter = val;
  buildCatalog(val);
}

// ── Scroll Animations ─────────────────────────────────────────────────────
function initScrollEffects() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.step-card, .fade-in').forEach(el => obs.observe(el));
}

function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

// ── Toast ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Request a Food ────────────────────────────────────────────────────────
function buildRequestCountrySelect() {
  const sel = document.getElementById('req-country');
  if (!sel) return;
  COUNTRIES.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

function submitRequest(e) {
  e.preventDefault();
  const code = document.getElementById('req-country').value;
  const country = COUNTRIES.find(c => c.code === code) || {};
  const req = {
    id: 'req_' + Date.now(),
    food: document.getElementById('req-food').value.trim(),
    country: code,
    countryName: country.name || code,
    location: document.getElementById('req-location').value.trim(),
    contact: document.getElementById('req-contact').value.trim(),
    note: document.getElementById('req-note').value.trim(),
    date: new Date().toISOString().split('T')[0],
  };
  allRequests.unshift(req);
  saveRequests();
  renderRequests();
  document.getElementById('request-form').reset();
  showToast('📣 Your request is posted! Locals will reach out if they have it.');
}

function renderRequests() {
  const list = document.getElementById('requests-list');
  const count = document.getElementById('req-count');
  if (!list) return;
  if (count) count.textContent = allRequests.length;
  if (!allRequests.length) {
    list.innerHTML = '<div class="req-empty">No open requests yet. Be the first!</div>';
    return;
  }
  list.innerHTML = allRequests.map(r => `
    <div class="req-card">
      <div class="req-food-name">🔍 ${escapeHTML(r.food)}</div>
      <div class="req-meta">From: ${escapeHTML(r.countryName || r.country)} &nbsp;·&nbsp; 📍 ${escapeHTML(r.location)} &nbsp;·&nbsp; ${formatDate(r.date)}</div>
      ${r.note ? `<div class="req-note">${escapeHTML(r.note)}</div>` : ''}
      <button class="req-contact-btn" onclick="contactLister('${escapeHTML(r.contact.replace(/'/g, "\\'"))}','${escapeHTML(r.food.replace(/'/g, "\\'"))}')">📩 I Have This!</button>
    </div>`).join('');
}

// ── My Listings ───────────────────────────────────────────────────────────
function renderMyListings() {
  const grid = document.getElementById('my-listings-grid');
  if (!grid) return;
  const mine = allListings.filter(l => !l.id.startsWith('demo'));
  grid.innerHTML = '';
  if (!mine.length) {
    grid.innerHTML = `<div class="my-empty-state"><div class="empty-icon">🏠</div><p>You haven't posted any listings yet.</p><button class="btn-primary" onclick="openPostModal()">Post Your First Listing</button></div>`;
    return;
  }
  mine.forEach(l => {
    const country = COUNTRIES.find(c => c.code === l.country) || {};
    const fc = (l.country || 'eu').toLowerCase();
    const card = document.createElement('div');
    card.className = 'my-listing-card fade-in';
    card.innerHTML = `
      <div class="my-listing-header">
        <img src="https://flagcdn.com/w80/${fc}.png" style="width:28px;height:20px;border-radius:3px;object-fit:cover" alt="${country.name||''}"/>
        <span class="my-listing-title">${escapeHTML(l.food)}</span>
        <span style="color:var(--gold);font-weight:700">€${l.fee}</span>
      </div>
      <div class="my-listing-body">
        <div class="my-listing-meta">📍 ${escapeHTML(l.location)} &nbsp;·&nbsp; ${catLabel(l.category)}</div>
        <div class="my-listing-meta">Posted ${formatDate(l.date)}</div>
        <div class="my-listing-actions">
          <button class="my-btn-edit" onclick="openDetailModal('${l.id}')">👁 View</button>
          <button class="my-btn-delete" onclick="deleteListing('${l.id}')">🗑️ Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

// ── Fee Range Track ───────────────────────────────────────────────────────
function updateFeeLabel() {
  const val = document.getElementById('fee-max')?.value || 50;
  const label = document.getElementById('fee-max-label');
  if (label) label.textContent = `€${val}`;
  updateRangeTrack();
}
function updateRangeTrack() {
  const el = document.getElementById('fee-max');
  if (!el) return;
  const pct = ((el.value - el.min) / (el.max - el.min)) * 100;
  el.style.background = `linear-gradient(90deg, var(--navy) ${pct}%, var(--gray-200) ${pct}%)`;
}

// ── Emoji Picker ──────────────────────────────────────────────────────────
const FOOD_EMOJIS = ['🍫','🍬','🍪','🥩','🍰','🍶','🍷','🧀','🥨','🍞','🧁','🍩','🥐','🥗','🫙','🫚','🍯','🥜','🍎','🌶️'];
function buildEmojiPicker() {
  const el = document.getElementById('emoji-picker');
  if (!el) return;
  el.innerHTML = '';
  FOOD_EMOJIS.forEach((e, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-opt' + (i === 0 ? ' selected' : '');
    btn.textContent = e;
    btn.onclick = () => {
      document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('form-emoji').value = e;
    };
    el.appendChild(btn);
  });
}

// ── Testimonials ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {emoji:'🇵🇱',name:'Monika R.',origin:'Warsaw → London',avatar:'🧑',text:'I\'d been in London for 3 years without Ptasie Mleczko. Found Katarzyna\'s listing on EuShop and nearly cried when I opened the box. Worth every penny of the finder\'s fee.',stars:5},
  {emoji:'🇳🇱',name:'Daan V.',origin:'Amsterdam → Berlin',avatar:'👨',text:'Nobody in Berlin understands drop (salty liquorice). EuShop connected me with Piet who had a whole bag. My German colleagues thought I was insane. I was in heaven.',stars:5},
  {emoji:'🇭🇺',name:'Eszter K.',origin:'Budapest → Vienna',avatar:'👩',text:'Túró Rudi kept refrigerated, fresh from Budapest. I found a listing 2km from my apartment. I\'ve since become a regular customer. EuShop is the best idea ever.',stars:5},
  {emoji:'🇮🇪',name:'Seán M.',origin:'Dublin → Munich',avatar:'🧔',text:'Tayto crisps. That\'s all I\'ll say. If you\'re Irish and living abroad, you already know. Found a box through EuShop and it genuinely made my week.',stars:5},
  {emoji:'🇸🇪',name:'Linnea B.',origin:'Stockholm → Paris',avatar:'👱',text:'Swedish bilar (foam cars) are my comfort food. Found a lister near Bastille who had 2kg. We ended up having fika together. EuShop is a community, not just a marketplace.',stars:5},
  {emoji:'🇷🇴',name:'Andrei P.',origin:'Cluj-Napoca → Brussels',avatar:'👦',text:'ROM chocolate is deeply tied to my childhood. I posted a request on EuShop and within 24 hours someone reached out saying they had 10 bars. Incredible.',stars:5},
];
function buildTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  TESTIMONIALS.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card fade-in';
    card.innerHTML = `
      <div class="testimonial-quote">❝</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="testimonial-avatar">${t.avatar}</div>
        <div>
          <div class="testimonial-name">${t.name} ${t.emoji}</div>
          <div class="testimonial-origin">${t.origin}</div>
          <div class="testimonial-stars">${'★'.repeat(t.stars)}</div>
        </div>
      </div>`;
    grid.appendChild(card);
    setTimeout(() => card.classList.add('visible'), i * 100);
  });
}

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQS = [
  {q:'Is EuShop free to use?', a:'Yes, completely free. EuShop is a community platform. We don\'t charge any fees — the finder\'s fee goes directly from buyer to seller, agreed between them.'},
  {q:'How does the finder\'s fee work?', a:'When you list a food, you set your own price. It\'s not a commission — it\'s whatever you decide is fair for sourcing, carrying, or storing the item. Most listings are €4–€15.'},
  {q:'How do I contact a lister?', a:'Click "View Details" on any listing, then hit the Contact button. If they left an email, it opens your mail client. If they left a WhatsApp number, it opens a pre-filled WhatsApp message.'},
  {q:'Can I list food I\'ve brought from home?', a:'Absolutely — that\'s the whole idea! Brought back some Mozartkugeln, a bag of drop, or some Fazer Blue from your last trip home? List it for other expats to find.'},
  {q:'Is this legal?', a:'Selling small quantities of food between private individuals for personal consumption is generally fine in most EU countries. Always check your local rules. EuShop is not responsible for transactions — we\'re just connecting people.'},
  {q:'What countries does EuShop cover?', a:'All 27 EU member states, plus Norway, Iceland, and Switzerland. The catalog includes specialty foods from every country with descriptions and categories.'},
  {q:'Can I delete my listing?', a:'Yes! Open the listing\'s detail view and click "Delete My Listing". It\'s instantly removed from the public feed and from your My Listings section.'},
  {q:'What if I can\'t find what I\'m looking for?', a:'Use the "Request a Food" section to post what you\'re looking for. Anyone who has it can reach out to you directly. It\'s a reverse listing!'},
];
function buildFAQ() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  FAQS.forEach((f, i) => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    item.innerHTML = `
      <button class="faq-question" id="faq-q-${i}" onclick="toggleFAQ(${i})">
        ${f.q}
        <span class="faq-chevron">▾</span>
      </button>
      <div class="faq-answer" id="faq-a-${i}">
        <p>${f.a}</p>
      </div>`;
    list.appendChild(item);
  });
}
function toggleFAQ(i) {
  const q = document.getElementById('faq-q-' + i);
  const a = document.getElementById('faq-a-' + i);
  const isOpen = a.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-answer').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-question').forEach(el => el.classList.remove('open'));
  if (!isOpen) { q.classList.add('open'); a.classList.add('open'); }
}

// ── Back to Top ───────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('visible', window.scrollY > 400);
  });
}

// ── Cookie Banner ─────────────────────────────────────────────────────────
function initCookieBanner() {
  if (safeGetItem('eushop_cookies')) return;
  setTimeout(() => document.getElementById('cookie-banner')?.classList.add('show'), 1800);
}
function acceptCookies() {
  safeSetItem('eushop_cookies', '1');
  const b = document.getElementById('cookie-banner');
  if (b) { b.style.transform = 'translateY(100%)'; setTimeout(() => b.remove(), 400); }
  showToast('🍪 Cookies accepted — now go find some actual speculoos!');
}

// ── "Also from Country" in detail modal ──────────────────────────────────
function buildAlsoFrom(countryCode, currentId) {
  const others = CATALOG.filter(f => f.country === countryCode).slice(0, 8);
  if (!others.length) return '';
  const chips = others.map(f =>
    `<span class="also-chip" onclick="filterByFoodName('${f.name.replace(/'/g, "'")}')">${f.icon} ${f.name}</span>`
  ).join('');
  const c = COUNTRIES.find(x => x.code === countryCode);
  return `<div class="also-from">
    <div class="also-from-title">More from ${c?.name || countryCode}</div>
    <div class="also-from-chips">${chips}</div>
  </div>`;
}
function filterByFoodName(name) {
  closeDetailModal();
  const input = document.getElementById('listings-search');
  if (input) { input.value = name; renderListings(); }
  document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
}

// Dark Mode
function initDarkMode() {
  const saved = localStorage.getItem('eushop_theme');
  if (saved === 'dark') applyDark(true, false);
}
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyDark(!isDark);
}
function applyDark(on, save = true) {
  const btn = document.getElementById('dark-mode-toggle');
  if (on) {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (btn) btn.textContent = String.fromCodePoint(0x2600,0xFE0F);
    if (save) localStorage.setItem('eushop_theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (btn) btn.textContent = String.fromCodePoint(0x1F319);
    if (save) localStorage.setItem('eushop_theme', 'light');
  }
}

// View Counter
function getViews() { return JSON.parse(localStorage.getItem('eushop_views') || '{}'); }
function incrementView(id) {
  const v = getViews(); v[id] = (v[id] || 0) + 1;
  localStorage.setItem('eushop_views', JSON.stringify(v)); return v[id];
}
function getViewCount(id) { return getViews()[id] || 0; }
function isHot(id) { return getViewCount(id) >= 5; }
function isNew(listing) {
  if (!listing.date) return false;
  const age = (Date.now() - new Date(listing.date).getTime()) / (1000 * 60 * 60);
  return age < 48;
}

// Recently Viewed
function getRV() { return JSON.parse(localStorage.getItem('eushop_rv') || '[]'); }
function addToRV(id) {
  let rv = getRV().filter(x => x !== id);
  rv.unshift(id); if (rv.length > 8) rv = rv.slice(0, 8);
  localStorage.setItem('eushop_rv', JSON.stringify(rv));
  renderRecentlyViewed();
}
function clearRecentlyViewed() {
  localStorage.removeItem('eushop_rv');
  const bar = document.getElementById('recently-viewed-bar');
  if (bar) bar.style.display = 'none';
}
function renderRecentlyViewed() {
  const bar = document.getElementById('recently-viewed-bar');
  const track = document.getElementById('rv-track');
  if (!bar || !track) return;
  const rv = getRV().map(id => allListings.find(l => l.id === id)).filter(Boolean);
  if (!rv.length) { bar.style.display = 'none'; return; }
  bar.style.display = '';
  track.innerHTML = rv.map(l => {
    const fc = (l.country || 'eu').toLowerCase();
    return '<div class="rv-pill" onclick="openDetailModal(\'' + l.id + '\')">' +
      '<img src="https://flagcdn.com/w40/' + fc + '.png" alt=""/>' +
      '<span>' + (l.emoji || '') + ' ' + l.food + '</span>' +
      '<span style="color:var(--gray-400);font-size:.75rem">EUR' + l.fee + '</span>' +
      '</div>';
  }).join('');
}

// Listing Status
function setListingStatus(id, status) {
  const l = allListings.find(x => x.id === id);
  if (!l) return;
  l.status = status; saveListings(); renderMyListings(); renderListings();
  showToast('Status updated: ' + status);
}

// Chip Counts
function updateChipCounts() {
  ['chocolate','candy','savory','biscuit','sweet','drink'].forEach(cat => {
    const btn = document.getElementById('chip-' + cat);
    if (!btn) return;
    const count = allListings.filter(l => l.category === cat).length;
    let s = btn.querySelector('.chip-count');
    if (!s) { s = document.createElement('span'); s.className = 'chip-count'; btn.appendChild(s); }
    s.textContent = count;
  });
  const favBtn = document.getElementById('chip-favs');
  if (favBtn) {
    let s = favBtn.querySelector('.chip-count');
    if (!s) { s = document.createElement('span'); s.className = 'chip-count'; favBtn.appendChild(s); }
    s.textContent = favorites.size;
  }
}

// Delivery Toggle
function setDelivery(val) {
  const hidden = document.getElementById('form-delivery');
  if (hidden) hidden.value = val;
  ['collection','delivery','both'].forEach(v => {
    const el = document.getElementById('dtoggle-' + v);
    if (el) el.classList.toggle('active', v === val);
  });
}

// Animated Hero Counter
function animateCounter(el, target, duration) {
  if (!el) return;
  duration = duration || 1200;
  const step = target / (duration / 16);
  let cur = 0;
  const t = setInterval(function() {
    cur = Math.min(cur + step, target);
    el.textContent = Math.floor(cur);
    if (cur >= target) clearInterval(t);
  }, 16);
}
function runHeroCounters() {
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        animateCounter(document.getElementById('stat-listings'), allListings.length);
        animateCounter(document.getElementById('stat-foods'), 200);
        animateCounter(document.getElementById('stat-countries'), 27);
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });
  const hero = document.getElementById('hero-stats');
  if (hero) obs.observe(hero);
}


// ─── Floating Version Selector (Added for Multi-Version Integration) ───────────
function initFloatingSelector(currentKey) {
  const style = document.createElement('style');
  style.textContent = `
    .floating-version-selector {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fvs-btn {
      background: #0f172a;
      color: #f8fafc;
      border: 1px solid #1e293b;
      padding: 10px 18px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    }
    .fvs-btn:hover {
      background: #1e293b;
      transform: translateY(-2px);
      box-shadow: 0 12px 36px rgba(0,0,0,0.4);
    }
    .fvs-dropdown {
      display: none;
      position: absolute;
      bottom: 54px;
      right: 0;
      width: 340px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid #1e293b;
      border-radius: 20px;
      padding: 10px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      flex-direction: column;
      gap: 6px;
      max-height: 400px;
      overflow-y: auto;
      animation: fvs-slide-in 0.2s ease-out;
    }
    @keyframes fvs-slide-in {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .fvs-dropdown.open {
      display: flex;
    }
    .fvs-header {
      padding: 6px 12px 10px;
      border-bottom: 1px solid #1e293b;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .fvs-option {
      background: none;
      border: none;
      color: #cbd5e1;
      padding: 8px 12px;
      border-radius: 12px;
      cursor: pointer;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      flex-direction: column;
      transition: all 0.15s;
    }
    .fvs-option:hover {
      background: #1e293b;
      color: #f8fafc;
    }
    .fvs-option.active {
      background: rgba(37, 99, 235, 0.2);
      border: 1px solid rgba(37, 99, 235, 0.3);
      color: #60a5fa;
    }
    .fvs-option-desc {
      font-size: 10px;
      color: #64748b;
      font-weight: 400;
      margin-top: 3px;
    }
    .fvs-badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 4px;
      align-self: flex-start;
      letter-spacing: 0.05em;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.className = 'floating-version-selector';
  
  const versions = [
    { key: 'v1', name: 'V1 - Investor Pitch', badge: 'INVESTOR', path: '/eushop/?v=v1', bg: '#fee2e2', color: '#be123c', desc: 'Financial waitlist & TAM pitch' },
    { key: 'v2', name: 'V2 - Buyer Marketplace', badge: 'BUYER', path: '/eushop/?v=v2', bg: '#dcfce7', color: '#15803d', desc: 'Food Explorer, Cart, Checkout' },
    { key: 'v3', name: 'V3 - Seller Compliance', badge: 'SELLER', path: '/eushop/become-seller/?v=v3', bg: '#fef3c7', color: '#b45309', desc: 'KYBC DAC7 Registration' },
    { key: 'v4', name: 'V4 - Admin Console', badge: 'OPERATOR', path: '/eushop/admin/dashboard/?v=v4', bg: '#ede9fe', color: '#6d28d9', desc: 'Moderation, Audits, Logs' },
    { key: 'v5', name: 'V5 - Developer Portal', badge: 'DEVELOPER', path: '/eushop/docs/?v=v5', bg: '#dbeafe', color: '#1d4ed8', desc: 'Audits & REST API Docs' },
    { key: 'v3_static', name: 'V3 - Legacy Static', badge: 'LEGACY', path: '/eushop/v3/', bg: '#e2e8f0', color: '#475569', desc: 'Original Static Prototype' },
    { key: 'v6', name: 'V6 - Orig: Core App', badge: 'ORIGINAL', path: '/eushop/v6/', bg: '#e2e8f0', color: '#475569', desc: 'Original Static Prototype' },
    { key: 'v7', name: 'V7 - Orig: Emerald', badge: 'THEME', path: '/eushop/v7/', bg: '#ccfbf1', color: '#0f766e', desc: 'Clean Emerald Iteration' },
    { key: 'v8', name: 'V8 - Orig: Midnight', badge: 'THEME', path: '/eushop/v8/', bg: '#f1f5f9', color: '#0f172a', desc: 'Dark Slate Midnight Iteration' },
    { key: 'v9', name: 'V9 - Orig: Rose Gold', badge: 'THEME', path: '/eushop/v9/', bg: '#ffe4e6', color: '#9f1239', desc: 'Rose Gold Luxury Iteration' },
    { key: 'v10', name: 'V10 - Platinum Light', badge: 'THEME', path: '/eushop/v10/', bg: '#f1f5f9', color: '#0f172a', desc: 'Premium Platinum Minimalist' },
    { key: 'v11', name: 'V11 - Forest Green', badge: 'THEME', path: '/eushop/v11/', bg: '#dcfce7', color: '#15803d', desc: 'Sleek Alabaster & Forest' },
    { key: 'v12', name: 'V12 - Terracotta Warm', badge: 'THEME', path: '/eushop/v12/', bg: '#ffedd5', color: '#c2410c', desc: 'Warm Ivory & Terracotta' },
    { key: 'v13', name: 'V13 - Lavender Field', badge: 'THEME', path: '/eushop/v13/', bg: '#f3e8ff', color: '#7e22ce', desc: 'Minimalist Lavender & Snow' },
  ];

  const currentOpt = versions.find(v => v.key === currentKey);

  container.innerHTML = `
    <button class="fvs-btn" id="fvs-btn">
      <span style="background:${currentOpt.bg};color:${currentOpt.color};padding:2px 6px;border-radius:4px;font-size:9px;font-weight:900">${currentOpt.badge}</span>
      <span>${currentOpt.name.split(' - ')[0]}</span>
      <span style="font-size:8px;color:#64748b">▲</span>
    </button>
    <div class="fvs-dropdown" id="fvs-dropdown">
      <div class="fvs-header">Select Demo Face</div>
      ${versions.map(v => `
        <button class="fvs-option ${v.key === currentKey ? 'active' : ''}" onclick="window.setDemoVersion('${v.key}', '${v.path}')">
          <span class="fvs-badge" style="background:${v.bg};color:${v.color}">${v.badge}</span>
          <span style="display:flex;justify-content:space-between;align-items:center;width:100%">
            <span>${v.name}</span>
            ${v.key === currentKey ? '<span style="color:#60a5fa">●</span>' : ''}
          </span>
          <span class="fvs-option-desc">${v.desc}</span>
        </button>
      `).join('')}
    </div>
  `;

  document.body.appendChild(container);

  const btn = document.getElementById('fvs-btn');
  const dropdown = document.getElementById('fvs-dropdown');
  
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  window.setDemoVersion = function(key, path) {
    try {
      localStorage.setItem('eushop-demo-version', key);
    } catch(e) {}
    window.location.href = path;
  };
}

// Auto-initialize floating selector
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  let key = 'v6';
  if (currentPath.includes('/v3/')) key = 'v3_static';
  else if (currentPath.includes('/v7/')) key = 'v7';
  else if (currentPath.includes('/v8/')) key = 'v8';
  else if (currentPath.includes('/v9/')) key = 'v9';
  else if (currentPath.includes('/v10/')) key = 'v10';
  else if (currentPath.includes('/v11/')) key = 'v11';
  else if (currentPath.includes('/v12/')) key = 'v12';
  else if (currentPath.includes('/v13/')) key = 'v13';
  initFloatingSelector(key);
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
