/**
 * EUshop v122 Enterprise Dynamic App Engine
 * Dynamic product rendering, filtering, allergen search & interactive order simulation.
 */
document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  const filterChips = document.querySelectorAll('.filter-chip');
  const cartBadge = document.getElementById('cart-count');

  let activeCategory = 'all';
  let cartCount = 0;

  function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    const filtered = activeCategory === 'all' 
      ? EUSHOP_DATA.featuredProducts 
      : EUSHOP_DATA.featuredProducts.filter(p => p.category === activeCategory);

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" />
        <div class="product-body">
          <div class="product-meta">
            <span>${product.flag} ${product.origin}</span>
            <span>⭐ ${product.rating} (${product.reviewsCount})</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="tag-list">
            ${product.certifications.map(c => `<span class="cert-tag">${c}</span>`).join('')}
          </div>
          <div class="product-footer">
            <span class="price-tag">€${product.price.toFixed(2)}</span>
            <button class="btn-primary add-cart-btn" data-id="${product.id}">Add to Order</button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });

    // Attach Add to Order click events
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        cartCount++;
        if (cartBadge) cartBadge.textContent = cartCount;
        btn.textContent = '✓ Added';
        btn.style.background = '#059669';
        setTimeout(() => {
          btn.textContent = 'Add to Order';
          btn.style.background = '';
        }, 1500);
      });
    });
  }

  // Category Chip Filters
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      renderProducts();
    });
  });

  // Initial render
  renderProducts();
});
