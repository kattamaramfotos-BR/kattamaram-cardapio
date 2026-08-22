const {createClient}=supabase,db=createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);let products=[],cats=[];const $=s=>document.querySelector(s),money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}),esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const ADMIN_EMAIL='kattamaramfotos@gmail.com';
function isAdmin(session){return !!session?.user?.email&&session.user.email.toLowerCase()===ADMIN_EMAIL.toLowerCase()}
function init(){db.auth.getSession().then(({data:{session}})=>{if(session&&isAdmin(session))showApp();else{if(session)db.auth.signOut();showLogin()}})}
function showLogin(){$('#login').classList.remove('hidden');$('#app').classList.add('hidden')}
function showApp(){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');load()}
$('#loginForm').onsubmit=async e=>{e.preventDefault();$('#loginError').textContent='';const email=$('#email').value.trim().toLowerCase(),password=$('#password').value,{data,error}=await db.auth.signInWithPassword({email,password});if(error){$('#loginError').textContent=error.message;return}if(!isAdmin(data.session)){await db.auth.signOut();$('#loginError').textContent='Acesso negado. Este usuário não é administrador.';return}showApp()};
$('#logout').onclick=$('#mlogout').onclick=async()=>{await db.auth.signOut();showLogin()};document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>view(b.dataset.v));function view(id){document.querySelectorAll('.view').forEach(x=>x.classList.add('hidden'));$('#'+id).classList.remove('hidden')}
async function load(){let c=await db.from('categories').select('*').order('position'),p=await db.from('products').select('*,categories(name)').order('position');if(c.error||p.error){alert((c.error||p.error).message);return}cats=c.data||[];products=p.data||[];$('#sp').textContent=products.filter(x=>x.active).length;$('#sc').textContent=cats.filter(x=>x.active).length;$('#sf').textContent=products.filter(x=>x.active&&x.featured).length;fillCats();drawProducts();drawCats()}
function fillCats(){const active=cats.filter(x=>x.active);$('#pcat').innerHTML=active.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');$('#filterCat').innerHTML='<option value="">Todas as categorias</option>'+cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}
function drawProducts(){let q=($('#search').value||'').toLowerCase(),fc=$('#filterCat').value;let list=products.filter(p=>(!q||p.name.toLowerCase().includes(q))&&(!fc||String(p.category_id)===fc));$('#rows').innerHTML=list.map(p=>{let n=Array.isArray(p.options)?p.options.length:0;return `<tr><td><img src="${p.image_url||'images/placeholder.svg'}"><strong>${esc(p.name)}</strong><small>${esc(p.description||'')}</small></td><td>${esc(p.categories?.name||'—')}</td><td>${money(p.price)}</td><td>${n?`<span class="optionBadge">${n} ${n===1?'opção':'opções'}</span>`:'—'}</td><td><span class="badge ${p.active?'':'off'}">${p.active?'ATIVO':'OCULTO'}</span></td><td><button class="edit" onclick="openProduct(${p.id})">Editar</button> <button class="edit danger" onclick="delProduct(${p.id})">Excluir</button></td></tr>`}).join('')||'<tr><td colspan="6">Nenhum produto.</td></tr>'}
function drawCats(){$('#catGrid').innerHTML=cats.map(c=>`<div class="catCard"><div class="catIcon">${c.icon||'•'}</div><h3>${esc(c.name)}</h3><div>${c.active?'Ativa':'Oculta'} • ordem ${c.position||0}</div><div class="translationStatus">🌐 EN: ${esc(c.translations?.en?.name||'não preenchido')}<br>🌐 ES: ${esc(c.translations?.es?.name||'não preenchido')}</div><button onclick="openCategory(${c.id})">Editar</button><button onclick="delCat(${c.id})">Excluir</button></div>`).join('')}
function optionTemplate(o={},i=0){const tr=o.translations||{};return `<div class="optionItem" data-option><div class="optionHead"><strong>Opção ${i+1}</strong><button type="button" class="removeOption" onclick="this.closest('[data-option]').remove();reindexOptions()">×</button></div><div class="formGrid"><label>Nome (PT-BR)<input data-oname value="${esc(o.name||'')}" placeholder="Ex.: Morango"></label><label>Preço adicional<input data-oprice type="number" step="0.01" value="${o.price==null?'':o.price}" placeholder="0,00"></label></div><label>Descrição (PT-BR)<input data-odesc value="${esc(o.description||'')}" placeholder="Ex.: com frutas frescas"></label><div class="optionTranslations"><div><h5>🇺🇸 English</h5><label>Nome<input data-oen-name value="${esc(tr.en?.name||'')}" placeholder="English name"></label><label>Descrição<input data-oen-desc value="${esc(tr.en?.description||'')}" placeholder="English description"></label></div><div><h5>🇪🇸 Español</h5><label>Nome<input data-oes-name value="${esc(tr.es?.name||'')}" placeholder="Nombre en español"></label><label>Descrição<input data-oes-desc value="${esc(tr.es?.description||'')}" placeholder="Descripción en español"></label></div></div><div class="optionImage"><label>Foto da opção<input data-ofile type="file" accept="image/*"></label>${o.image_url?`<img src="${o.image_url}" alt="">`:''}<input type="hidden" data-oimage value="${esc(o.image_url||'')}"></div></div>`}
function addOption(o={}){$('#optionsList').insertAdjacentHTML('beforeend',optionTemplate(o,$('#optionsList').children.length));reindexOptions()}
function reindexOptions(){[...document.querySelectorAll('[data-option]')].forEach((el,i)=>el.querySelector('.optionHead strong').textContent=`Opção ${i+1}`)}
function collectOptions(){return [...document.querySelectorAll('[data-option]')].map(el=>({name:el.querySelector('[data-oname]').value.trim(),price:el.querySelector('[data-oprice]').value===''?null:Number(el.querySelector('[data-oprice]').value),description:el.querySelector('[data-odesc]').value.trim()||null,translations:{en:{name:el.querySelector('[data-oen-name]').value.trim()||null,description:el.querySelector('[data-oen-desc]').value.trim()||null},es:{name:el.querySelector('[data-oes-name]').value.trim()||null,description:el.querySelector('[data-oes-desc]').value.trim()||null}},image_url:el.querySelector('[data-oimage]').value||null,file:el.querySelector('[data-ofile]').files[0]||null})).filter(o=>o.name)}
async function uploadFile(file){let path=`products/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`,u=await db.storage.from('product-images').upload(path,file,{contentType:file.type});if(u.error)throw u.error;return db.storage.from('product-images').getPublicUrl(path).data.publicUrl}
function openProduct(id){$('#perr').textContent='';$('#saveState').textContent='';$('#productForm').reset();$('#pid').value='';$('#ptitle').textContent='Novo produto';$('#pactive').checked=true;$('#oldimg').innerHTML='';$('#optionsList').innerHTML='';$('#pen').value='';$('#pden').value='';$('#pes').value='';$('#pdes').value='';if(id){let p=products.find(x=>x.id===id),tr=p.translations||{};$('#ptitle').textContent='Editar produto';$('#pid').value=p.id;$('#pname').value=p.name;$('#pcat').value=p.category_id;$('#pprice').value=p.price;$('#ppos').value=p.position||0;$('#pdesc').value=p.description||'';$('#pen').value=tr.en?.name||'';$('#pden').value=tr.en?.description||'';$('#pes').value=tr.es?.name||'';$('#pdes').value=tr.es?.description||'';$('#pfeatured').checked=!!p.featured;$('#pactive').checked=!!p.active;if(p.image_url)$('#oldimg').innerHTML=`<img src="${p.image_url}" style="max-width:130px;border-radius:8px" alt="">`;(Array.isArray(p.options)?p.options:[]).forEach(o=>addOption(o))}$('#pmodal').classList.add('show')}
function closeProduct(){$('#pmodal').classList.remove('show')}
$('#productForm').onsubmit=async e=>{e.preventDefault();$('#perr').textContent='';$('#saveState').textContent='Salvando...';let id=$('#pid').value,old=products.find(p=>String(p.id)===id),url=old?.image_url||null,file=$('#pfile').files[0];try{if(file)url=await uploadFile(file);let opts=collectOptions();for(const o of opts){if(o.file)o.image_url=await uploadFile(o.file);delete o.file}
  const ptName=$('#pname').value.trim(),ptDesc=$('#pdesc').value.trim();
  $('#saveState').textContent='🌐 Traduzindo para inglês e espanhol...';
  const oldTr=old?.translations||{};
  const en=await buildAutoTranslation(ptName,ptDesc,'en',old?.name,old?.description,oldTr.en,{name:$('#pen').value.trim(),description:$('#pden').value.trim()});
  const es=await buildAutoTranslation(ptName,ptDesc,'es',old?.name,old?.description,oldTr.es,{name:$('#pes').value.trim(),description:$('#pdes').value.trim()});
  $('#pen').value=en.name||'';$('#pden').value=en.description||'';$('#pes').value=es.name||'';$('#pdes').value=es.description||'';
  for(const o of opts){const tr=o.translations||{},oen=tr.en||{},oes=tr.es||{};const enO=await buildAutoTranslation(o.name,o.description,'en',null,null,null,{name:oen.name||'',description:oen.description||''});const esO=await buildAutoTranslation(o.name,o.description,'es',null,null,null,{name:oes.name||'',description:oes.description||''});o.translations={en:enO,es:esO};}
  let payload={category_id:+$('#pcat').value,name:ptName,description:ptDesc||null,price:+$('#pprice').value,image_url:url,featured:$('#pfeatured').checked,active:$('#pactive').checked,position:+$('#ppos').value||0,options:opts,translations:{en,es},updated_at:new Date().toISOString()};
  $('#saveState').textContent='Salvando produto traduzido...';let r=id?await db.from('products').update(payload).eq('id',id):await db.from('products').insert(payload);if(r.error)throw r.error;$('#saveState').textContent='Salvo e traduzido ✓';setTimeout(()=>{closeProduct();load()},500)}catch(x){$('#saveState').textContent='';$('#perr').textContent='O produto não foi salvo porque a tradução automática falhou. '+(x.message||String(x))}};
async function delProduct(id){if(confirm('Excluir este produto?')){let r=await db.from('products').delete().eq('id',id);if(r.error)alert(r.error.message);else load()}}
function openCategory(id){$('#categoryForm').reset();$('#cid').value='';$('#cactive').checked=true;$('#cerr').textContent='';$('#cen').value='';$('#ces').value='';if(id){let c=cats.find(x=>x.id===id),tr=c.translations||{};$('#cid').value=c.id;$('#cname').value=c.name;$('#cen').value=tr.en?.name||'';$('#ces').value=tr.es?.name||'';$('#cicon').value=c.icon||'';$('#cpos').value=c.position||0;$('#cactive').checked=c.active}$('#cmodal').classList.add('show')}
function closeCategory(){$('#cmodal').classList.remove('show')}
$('#categoryForm').onsubmit=async e=>{e.preventDefault();let id=$('#cid').value,cOld=cats.find(c=>String(c.id)===String(id));$('#cerr').textContent='';let name=$('#cname').value.trim();try{$('#cen').value=await buildCategoryTranslation(name,'en',cOld?.name,cOld?.translations?.en?.name,$('#cen').value.trim());$('#ces').value=await buildCategoryTranslation(name,'es',cOld?.name,cOld?.translations?.es?.name,$('#ces').value.trim());let p={name,icon:$('#cicon').value.trim(),position:+$('#cpos').value||0,active:$('#cactive').checked,translations:{en:{name:$('#cen').value.trim()||null},es:{name:$('#ces').value.trim()||null}}},r=id?await db.from('categories').update(p).eq('id',id):await db.from('categories').insert(p);if(r.error)throw r.error;closeCategory();load()}catch(x){$('#cerr').textContent='A tradução automática falhou: '+(x.message||String(x))}};
async function delCat(id){if(confirm('Excluir categoria? Produtos ligados a ela também serão excluídos pela regra atual do banco.')){let r=await db.from('categories').delete().eq('id',id);if(r.error)alert(r.error.message);else load()}}
db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')showLogin()});init();

// Automatic bulk translation of all existing categories, products and subproducts.
const adminTranslationCache = JSON.parse(localStorage.getItem('kattamaram_translation_cache') || '{}');
function saveAdminTranslationCache(){try{localStorage.setItem('kattamaram_translation_cache',JSON.stringify(adminTranslationCache));}catch(e){}}
async function translatePT(text,target){
  text=String(text||'').trim(); if(!text)return '';
  const key=`${target}|${text}`; if(adminTranslationCache[key])return adminTranslationCache[key];
  const url='https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl='+target+'&dt=t&q='+encodeURIComponent(text);
  let lastError=null;
  for(let attempt=0;attempt<3;attempt++){
    try{
      const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error('Falha na tradução automática (HTTP '+r.status+')');
      const d=await r.json(); const out=Array.isArray(d?.[0])?d[0].map(x=>x?.[0]||'').join(''):'';
      if(!out)throw new Error('A tradução retornou vazia');
      adminTranslationCache[key]=out;saveAdminTranslationCache(); return out;
    }catch(e){lastError=e;await new Promise(r=>setTimeout(r,350*(attempt+1)));}
  }
  throw lastError||new Error('Falha na tradução automática');
}
async function buildAutoTranslation(name,description,target,oldName,oldDescription,oldTranslation,currentFields={}){
  const oldT=oldTranslation||{}; const fields=currentFields||{};
  let out={name:fields.name||'',description:fields.description||''};
  const oldAutoName=oldName?await translatePT(oldName,target):'';
  const oldAutoDesc=oldDescription?await translatePT(oldDescription,target):'';
  // New item: translate immediately. Existing item: if the PT-BR text changed and the
  // previous translation was still the automatic translation, refresh it automatically.
  if(name && (!out.name || (oldName && name!==oldName && out.name===oldAutoName))) out.name=await translatePT(name,target);
  if(description && (!out.description || (oldDescription && description!==oldDescription && out.description===oldAutoDesc))) out.description=await translatePT(description,target);
  return {name:out.name||null,description:out.description||null};
}
async function buildCategoryTranslation(name,target,oldName,oldTranslation,currentValue){
  const oldAuto=oldName?await translatePT(oldName,target):'';
  if(!currentValue || (oldName && name!==oldName && currentValue===oldAuto)) return await translatePT(name,target);
  return currentValue;
}

async function translateEverything(){
  if(!confirm('Traduzir automaticamente TODAS as categorias, produtos, descrições e subprodutos para inglês e espanhol? Isso preencherá apenas os campos que estiverem vazios e salvará no Supabase.'))return;
  const btn=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('TRADUZIR TUDO')); if(btn){btn.disabled=true;btn.textContent='🌐 TRADUZINDO...';}
  try{
    let changedCats=0,changedProducts=0;
    for(const c of cats){
      const tr=c.translations||{}; const en=tr.en||{},es=tr.es||{};
      if(!en.name)en.name=await translatePT(c.name,'en'); if(!es.name)es.name=await translatePT(c.name,'es');
      const r=await db.from('categories').update({translations:{en,es}}).eq('id',c.id); if(r.error)throw r.error;
      changedCats++;
    }
    for(const p of products){
      const tr=p.translations||{},en=tr.en||{},es=tr.es||{};
      if(!en.name)en.name=await translatePT(p.name,'en'); if(!en.description&&p.description)en.description=await translatePT(p.description,'en');
      if(!es.name)es.name=await translatePT(p.name,'es'); if(!es.description&&p.description)es.description=await translatePT(p.description,'es');
      const opts=Array.isArray(p.options)?p.options:[];
      for(const o of opts){const ot=o.translations||{},oen=ot.en||{},oes=ot.es||{};if(!oen.name)oen.name=await translatePT(o.name,'en');if(!oen.description&&o.description)oen.description=await translatePT(o.description,'en');if(!oes.name)oes.name=await translatePT(o.name,'es');if(!oes.description&&o.description)oes.description=await translatePT(o.description,'es');o.translations={en:oen,es:oes};}
      const r=await db.from('products').update({translations:{en,es},options:opts}).eq('id',p.id); if(r.error)throw r.error; changedProducts++;
    }
    alert(`Concluído! ${changedCats} categorias e ${changedProducts} produtos foram traduzidos, incluindo todos os subprodutos/opções.`); await load();
  }catch(e){alert('Não foi possível concluir a tradução automática. Verifique sua conexão com a internet e tente novamente.\n\n'+(e.message||e));}
  finally{if(btn){btn.disabled=false;btn.textContent='🌐 TRADUZIR TUDO';}}
}
