/**
 * EUshop v177 Production App Engine
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
      ? EUSHOP_V177_DATA.featuredProducts 
      : EUSHOP_V177_DATA.featuredProducts.filter(p => p.category === activeCategory);

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" />
        <div class="product-body">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem; color:var(--text-muted);">
            <span>${product.flag} ${product.origin}</span>
            <span>⭐ ${product.rating} (${product.reviewsCount})</span>
          </div>
          <h3 class="product-title">${product.name}</h3>
          <p class="product-desc">${product.description}</p>
          <div class="product-footer">
            <span class="price-tag">€${product.price.toFixed(2)}</span>
            <button class="btn-primary add-cart-btn" data-id="${product.id}">Add to Order</button>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });

    document.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
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

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      renderProducts();
    });
  });

  renderProducts();
});
