const { createClient } = supabase;
const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const $ = (s) => document.querySelector(s);

const LANG_KEY = 'kattamaram_lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'pt-BR';
const translationCache = JSON.parse(localStorage.getItem('kattamaram_translation_cache') || '{}');

const UI = {
  'pt-BR': { menu:'☰ MENU', lang:'PT-BR', heroSmall:'KATTAMARAM II • FOZ DO IGUAÇU', title:'CARDÁPIO', aboard:'a bordo', heroDesc:'Sabores especiais para tornar seu passeio ainda melhor.', categories:'NOSSAS CATEGORIAS', featured:'DESTAQUES DO CARDÁPIO', products:'PRODUTOS', options:'OPÇÕES', optionAvailable:'opção disponível', optionsAvailable:'opções disponíveis', noProducts:'Nenhum produto disponível nesta categoria.', footer:'KATTAMARAM II • FOZ DO IGUAÇU • @KATTAMARAMFOZ' },
  en: { menu:'☰ MENU', lang:'EN', heroSmall:'KATTAMARAM II • FOZ DO IGUAÇU', title:'MENU', aboard:'on board', heroDesc:'Special flavors to make your trip even better.', categories:'OUR CATEGORIES', featured:'MENU HIGHLIGHTS', products:'PRODUCTS', options:'OPTIONS', optionAvailable:'option available', optionsAvailable:'options available', noProducts:'No products available in this category.', footer:'KATTAMARAM II • FOZ DO IGUAÇU • @KATTAMARAMFOZ' },
  es: { menu:'☰ MENÚ', lang:'ES', heroSmall:'KATTAMARAM II • FOZ DO IGUAÇU', title:'MENÚ', aboard:'a bordo', heroDesc:'Sabores especiales para hacer su paseo aún mejor.', categories:'NUESTRAS CATEGORÍAS', featured:'DESTACADOS DEL MENÚ', products:'PRODUCTOS', options:'OPCIONES', optionAvailable:'opción disponible', optionsAvailable:'opciones disponibles', noProducts:'No hay productos disponibles en esta categoría.', footer:'KATTAMARAM II • FOZ DO IGUAÇU • @KATTAMARAMFOZ' }
};

const money = (v) => v == null ? '' : Number(v).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function t(key){return UI[currentLang]?.[key] ?? UI['pt-BR'][key] ?? key;}
function saveCache(){try{localStorage.setItem('kattamaram_translation_cache', JSON.stringify(translationCache));}catch(e){}}

// Automatic translation for existing content. Stored Supabase translations always win.
async function autoTranslate(text, lang){
  text = String(text ?? '').trim();
  if(!text || lang === 'pt-BR') return text;
  const key = `${lang}|${text}`;
  if(translationCache[key]) return translationCache[key];
  try{
    const tl = lang === 'en' ? 'en' : 'es';
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl='+tl+'&dt=t&q='+encodeURIComponent(text);
    const r = await fetch(url);
    if(!r.ok) throw new Error('translation request failed');
    const data = await r.json();
    const translated = Array.isArray(data?.[0]) ? data[0].map(x=>x?.[0]||'').join('') : '';
    if(translated){translationCache[key]=translated; saveCache(); return translated;}
  }catch(e){console.warn('Automatic translation unavailable:', e);}
  return text;
}

async function enrichObject(obj){
  if(currentLang === 'pt-BR' || !obj) return obj;
  obj.__translated = obj.__translated || {};
  obj.__translated[currentLang] = obj.__translated[currentLang] || {};
  const tr = obj.translations?.[currentLang] || {};
  obj.__translated[currentLang].name = String(tr.name || '').trim() || await autoTranslate(obj.name, currentLang);
  obj.__translated[currentLang].description = String(tr.description || '').trim() || await autoTranslate(obj.description, currentLang);
  if(Array.isArray(obj.options)){
    for(const o of obj.options){
      o.__translated = o.__translated || {};
      o.__translated[currentLang] = o.__translated[currentLang] || {};
      const otr = o.translations?.[currentLang] || {};
      o.__translated[currentLang].name = String(otr.name || '').trim() || await autoTranslate(o.name, currentLang);
      o.__translated[currentLang].description = String(otr.description || '').trim() || await autoTranslate(o.description, currentLang);
    }
  }
  return obj;
}

function tr(obj, field){
  if(currentLang === 'pt-BR') return String(obj?.[field] ?? '').trim();
  return String(obj?.__translated?.[currentLang]?.[field] ?? obj?.translations?.[currentLang]?.[field] ?? obj?.[field] ?? '').trim();
}

async function setLanguage(lang){
  if(!UI[lang]) return;
  currentLang=lang; localStorage.setItem(LANG_KEY,lang); updateStaticTexts(); closeLanguageMenu();
  await load();
}
function updateStaticTexts(){
  document.documentElement.lang=currentLang==='pt-BR'?'pt-BR':currentLang;
  $('#menuLabel').textContent=t('menu'); $('#languageButton').textContent=t('lang'); $('#heroSmall').textContent=t('heroSmall');
  $('#heroTitle').childNodes[0].nodeValue=`${t('title')} `; $('#heroAboard').textContent=t('aboard'); $('#heroDesc').textContent=t('heroDesc');
  $('#categoriesTitle').textContent=t('categories'); $('#featuredTitle').textContent=t('featured'); $('#title').textContent=t('products'); $('#footerText').textContent=t('footer');
}
function closeLanguageMenu(){$('#languageMenu')?.classList.remove('show');}
function initLanguagePicker(){
  const btn=$('#languageButton'),menu=$('#languageMenu');
  btn.addEventListener('click',e=>{e.stopPropagation();menu.classList.toggle('show');});
  menu.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
  document.addEventListener('click',e=>{if(!e.target.closest('.languagePicker'))closeLanguageMenu();});
}

async function load(){
  const c=await db.from('categories').select('*').eq('active',true).order('position');
  if(c.error){console.error(c.error);showError(t('noProducts'));return;}
  const categories=c.data||[];
  if(currentLang!=='pt-BR') await Promise.all(categories.map(enrichObject));
  const catsEl=$('#cats');
  catsEl.innerHTML=categories.map(x=>{const name=tr(x,'name');return `<button class="category" type="button" data-category-id="${x.id}" data-category-name="${esc(name)}"><div class="icon">${esc(x.icon||'•')}</div><strong>${esc(name)}</strong></button>`;}).join('');
  catsEl.querySelectorAll('[data-category-id]').forEach(btn=>btn.addEventListener('click',()=>loadCategory(btn.dataset.categoryId,btn.dataset.categoryName)));

  const f=await db.from('products').select('*').eq('active',true).eq('featured',true).order('position');
  if(!f.error){const featured=f.data||[];if(currentLang!=='pt-BR')await Promise.all(featured.map(enrichObject));render($('#featured'),featured);}
  if(categories.length) await loadCategory(categories[0].id,tr(categories[0],'name'),false);
}

async function loadCategory(id,name,scroll=true){
  $('#title').textContent=String(name||t('products')).toUpperCase();
  const r=await db.from('products').select('*').eq('active',true).eq('category_id',id).order('position');
  if(r.error){console.error(r.error);showError(t('noProducts'));return;}
  const items=r.data||[]; if(currentLang!=='pt-BR') await Promise.all(items.map(enrichObject)); render($('#products'),items);
  if(scroll)$('#productsSection').scrollIntoView({behavior:'smooth',block:'start'});
}

function render(el,items){
  el.innerHTML=items.length?items.map(p=>{const name=tr(p,'name'),description=tr(p,'description'),count=Array.isArray(p.options)?p.options.length:0;return `<article class="product" data-product-id="${p.id}"><img src="${esc(p.image_url||'images/placeholder.svg')}" alt="${esc(name)}" loading="lazy"><div class="product-info"><div class="product-name">${esc(name)}</div>${description?`<div class="product-description">${esc(description)}</div>`:''}<div class="price">${money(p.price)}</div>${count?`<div class="optionsHint">${count} ${count===1?t('optionAvailable'):t('optionsAvailable')}</div>`:''}</div></article>`;}).join(''):`<div class="empty">${t('noProducts')}</div>`;
  el.querySelectorAll('[data-product-id]').forEach(card=>{const p=items.find(item=>String(item.id)===card.dataset.productId);if(p)card.addEventListener('click',()=>openModal(p));});
}

function openModal(p){
  const name=tr(p,'name'),description=tr(p,'description'); $('#mi').src=p.image_url||'images/placeholder.svg'; $('#mi').alt=name||''; $('#mn').textContent=name||''; $('#md').textContent=description||''; $('#mp').textContent=money(p.price);
  const opts=Array.isArray(p.options)?p.options:[];
  $('#modalOptions').innerHTML=opts.length?`<div class="modalOptionsTitle">${t('options')}</div>`+opts.map(o=>{const oname=tr(o,'name'),odesc=tr(o,'description');return `<div class="modalOption">${o.image_url?`<img src="${esc(o.image_url)}" alt="${esc(oname||'')}">`:''}<div><strong>${esc(oname)}</strong>${odesc?`<small>${esc(odesc)}</small>`:''}</div>${o.price!=null?`<b>${o.price>0?'+ ':''}${money(o.price)}</b>`:''}</div>`;}).join(''):'';
  $('#modal').classList.add('show');
}
function closeModal(e){if(!e||e.target.id==='modal'||e.target.classList.contains('close'))$('#modal').classList.remove('show');}
function showError(message){let el=$('#appError');if(!el){el=document.createElement('div');el.id='appError';el.className='appError';document.body.prepend(el);}el.textContent=message;}

initLanguagePicker(); updateStaticTexts(); load().catch(err=>{console.error(err);showError(t('noProducts'));});
