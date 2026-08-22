const { createClient } = supabase;
const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const $ = (s) => document.querySelector(s);
const money = (v) => v == null ? '' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[m]));

async function load() {
  const c = await db.from('categories').select('*').eq('active', true).order('position');
  if (c.error) { console.error(c.error); showError('Não foi possível carregar o cardápio.'); return; }

  const categories = c.data || [];
  const catsEl = $('#cats');
  catsEl.innerHTML = categories.map(x => `
    <button class="category" type="button" data-category-id="${x.id}" data-category-name="${esc(x.name)}">
      <div class="icon">${esc(x.icon || '•')}</div><strong>${esc(x.name)}</strong>
    </button>`).join('');

  catsEl.querySelectorAll('[data-category-id]').forEach(btn => {
    btn.addEventListener('click', () => loadCategory(btn.dataset.categoryId, btn.dataset.categoryName));
  });

  const f = await db.from('products').select('*').eq('active', true).eq('featured', true).order('position');
  if (f.error) { console.error(f.error); return; }
  render($('#featured'), f.data || []);

  if (categories.length) await loadCategory(categories[0].id, categories[0].name, false);
}

async function loadCategory(id, name, scroll = true) {
  $('#title').textContent = String(name || '').toUpperCase();
  const r = await db.from('products').select('*').eq('active', true).eq('category_id', id).order('position');
  if (r.error) { console.error(r.error); showError('Não foi possível carregar os produtos.'); return; }
  render($('#products'), r.data || []);
  if (scroll) $('#productsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function render(el, items) {
  el.innerHTML = items.length ? items.map(p => `
    <article class="product" data-product-id="${p.id}">
      <img src="${esc(p.image_url || 'images/placeholder.svg')}" alt="${esc(p.name)}" loading="lazy">
      <div class="product-info">
        <div class="product-name">${esc(p.name)}</div>
        ${p.description ? `<div class="product-description">${esc(p.description)}</div>` : ''}
        <div class="price">${money(p.price)}</div>
        ${Array.isArray(p.options) && p.options.length ? `<div class="optionsHint">${p.options.length} ${p.options.length === 1 ? 'opção disponível' : 'opções disponíveis'}</div>` : ''}
      </div>
    </article>`).join('') : '<div class="empty">Nenhum produto disponível nesta categoria.</div>';

  el.querySelectorAll('[data-product-id]').forEach(card => {
    const p = items.find(item => String(item.id) === card.dataset.productId);
    if (p) card.addEventListener('click', () => openModal(p));
  });
}

function openModal(p) {
  $('#mi').src = p.image_url || 'images/placeholder.svg';
  $('#mi').alt = p.name || '';
  $('#mn').textContent = p.name || '';
  $('#md').textContent = p.description || '';
  $('#mp').textContent = money(p.price);
  const opts = Array.isArray(p.options) ? p.options : [];
  $('#modalOptions').innerHTML = opts.length ? `<div class="modalOptionsTitle">OPÇÕES</div>` + opts.map(o => `
    <div class="modalOption">
      ${o.image_url ? `<img src="${esc(o.image_url)}" alt="${esc(o.name || '')}">` : ''}
      <div><strong>${esc(o.name)}</strong>${o.description ? `<small>${esc(o.description)}</small>` : ''}</div>
      ${o.price != null ? `<b>${o.price > 0 ? '+ ' : ''}${money(o.price)}</b>` : ''}
    </div>`).join('') : '';
  $('#modal').classList.add('show');
}

function closeModal(e) {
  if (!e || e.target.id === 'modal' || e.target.classList.contains('close')) $('#modal').classList.remove('show');
}

function showError(message) {
  let el = $('#appError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'appError';
    el.className = 'appError';
    document.body.prepend(el);
  }
  el.textContent = message;
}

load().catch(err => { console.error(err); showError('Erro ao carregar o cardápio.'); });
