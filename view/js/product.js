// ===== LOAD ALL PRODUCTS =====
let allProducts = [];
let activeCategory = 'all';

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Show skeleton loader
  grid.innerHTML = Array(6).fill(`
    <div class="product-card">
      <div class="skeleton" style="height:200px;border-radius:0"></div>
      <div class="card-body">
        <div class="skeleton" style="height:20px;width:70%;margin-bottom:12px"></div>
        <div class="skeleton" style="height:28px;width:40%;margin-bottom:10px"></div>
        <div class="skeleton" style="height:14px;width:50%"></div>
      </div>
    </div>
  `).join('');

  try {
    const res = await fetch('/products');
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">⚠️</div>
        <h3>Could not load products</h3>
        <p>Please refresh the page.</p>
      </div>`;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const user = getUser();

  if (!products || products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🛍️</div>
        <h3>No items yet</h3>
        <p>Be the first to list something for sale!</p>
      </div>`;
    return;
  }

  grid.innerHTML = '';
  products.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i * 0.05}s`;

    const imgHTML = p.image_path
      ? `<img class="card-img" src="${p.image_path}" alt="${escapeHTML(p.title)}" onerror="this.outerHTML='<div class=\\'card-no-img\\'>📷</div>'">`
      : `<div class="card-no-img">📷</div>`;

    const catEmoji = getCatEmoji(p.cat_name);

    card.innerHTML = `
      <div style="position:relative">
        ${imgHTML}
        <span class="card-badge">${catEmoji} ${escapeHTML(p.cat_name || 'Other')}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHTML(p.title)}</div>
        <div class="card-price">Nu. ${formatPrice(p.price)}</div>
        <div class="card-meta">👤 ${escapeHTML(p.seller_name)}</div>
        ${p.description ? `<div class="card-desc">${escapeHTML(p.description)}</div>` : ''}
      </div>`;

    grid.appendChild(card);
  });
}

function filterByCategory(cat, el) {
  activeCategory = cat;

  // Update chips
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  let filtered = allProducts;
  if (cat !== 'all') {
    filtered = allProducts.filter(p => p.cat_name === cat);
  }
  renderProducts(filtered);
}

function searchProducts(query) {
  const q = query.toLowerCase();
  let pool = activeCategory === 'all' ? allProducts : allProducts.filter(p => p.cat_name === activeCategory);
  const filtered = pool.filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q) ||
    (p.seller_name || '').toLowerCase().includes(q)
  );
  renderProducts(filtered);
}

// ===== ADD PRODUCT =====
async function addProduct() {
  const btn = document.getElementById('postBtn');

  const title = document.getElementById('title').value.trim();
  const price = document.getElementById('price').value;
  const catID = document.getElementById('cat_id').value;
  const description = document.getElementById('description').value.trim();
  const imageFile = document.getElementById('image').files[0];

  if (!title) { showToast('Please enter a title', 'error'); return; }
  if (!price || parseFloat(price) <= 0) { showToast('Please enter a valid price', 'error'); return; }
  if (!catID) { showToast('Please select a category', 'error'); return; }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('price', price);
  formData.append('cat_id', catID);
  formData.append('description', description);
  if (imageFile) formData.append('image', imageFile);

  btn.disabled = true;
  btn.textContent = 'Posting...';

  try {
    const res = await fetch('/product', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      showToast('Item posted successfully!');
      setTimeout(() => window.location.href = '/home', 1200);
    } else {
      showToast(data.error || 'Failed to post item', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Post Item';
  }
}

// ===== MY PRODUCTS =====
async function loadMyProducts() {
  const container = document.getElementById('myProducts');
  if (!container) return;

  container.innerHTML = `<div style="padding:20px;color:var(--stone)">Loading your items...</div>`;

  try {
    const res = await fetch('/my-products');
    if (res.status === 401) {
      window.location.href = '/';
      return;
    }
    const products = await res.json();

    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No items listed yet</h3>
          <p>Start selling by posting your first item.</p>
          <br>
          <a href="/add-item" class="btn btn-primary" style="width:auto;margin-top:8px">+ Post an Item</a>
        </div>`;
      return;
    }

    container.innerHTML = '';
    products.forEach(p => {
      const row = document.createElement('div');
      row.className = 'my-item-row';
      row.id = `item-${p.prod_id}`;

      const imgHTML = p.image_path
        ? `<img class="my-item-img" src="${p.image_path}" alt="${escapeHTML(p.title)}" onerror="this.outerHTML='<div class=\\'my-item-img-placeholder\\'>📷</div>'">`
        : `<div class="my-item-img-placeholder">📷</div>`;

      row.innerHTML = `
        ${imgHTML}
        <div class="my-item-info">
          <div class="my-item-title">${escapeHTML(p.title)}</div>
          <div class="my-item-meta">
            <span>${getCatEmoji(p.cat_name)} ${escapeHTML(p.cat_name || 'Other')}</span>
            <span>📅 ${p.created_at || ''}</span>
          </div>
        </div>
        <div class="my-item-price">Nu. ${formatPrice(p.price)}</div>
        <button class="btn btn-danger" onclick="deleteProduct(${p.prod_id})">🗑 Delete</button>
      `;
      container.appendChild(row);
    });
  } catch {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Could not load your items.</p></div>`;
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

  try {
    const res = await fetch(`/product/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Item deleted successfully');
      const el = document.getElementById(`item-${id}`);
      if (el) {
        el.style.transition = 'all 0.3s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        setTimeout(() => el.remove(), 300);
      }
    } else {
      const data = await res.json();
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
  }
}

// ===== HELPERS =====
function getCatEmoji(cat) {
  const map = {
    'Electronics': '📱', 'Clothing': '👗', 'Books': '📚',
    'Furniture': '🪑', 'Other': '📦'
  };
  return map[cat] || '📦';
}

function formatPrice(price) {
  return parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getUser() {
  return {
    id: localStorage.getItem('user_id'),
    name: localStorage.getItem('user_name'),
  };
}

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  // Set nav user name
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    const name = localStorage.getItem('user_name') || 'User';
    userNameEl.textContent = name;
    const avatarEl = document.getElementById('navAvatar');
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
  }

  if (path === '/home') loadProducts();
  if (path === '/my-items') loadMyProducts();
});
