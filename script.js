
/* ================= SAFE localStorage ================= */
const inMemory = {};
function safeSet(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }
  catch(e){ inMemory[key] = value; }
}
function safeGet(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return inMemory[key] ?? fallback; }
}

/* ================= DEMO DATA ================= */
let PRODUCTS = safeGet('prod_demo_v2', null);
if(!PRODUCTS){
  PRODUCTS = [
    {id:1,name:"iPhone 12 - 64GB",brand:"iPhone",price:8500,desc:"Garantili, temiz ikinci el.",new:true,stock:3},
    {id:2,name:"Samsung S21 - 128GB",brand:"Samsung",price:7200,desc:"Performant Samsung S21.",new:false,stock:5},
    {id:3,name:"Xiaomi Mi 11 - 128GB",brand:"Xiaomi",price:6000,desc:"Uygun fiyat performans",new:false,stock:2},
    {id:4,name:"iPhone 11 - 64GB",brand:"iPhone",price:6500,desc:"Bakımlı iPhone 11.",new:false,stock:4},
    {id:5,name:"Samsung A52 - 128GB",brand:"Samsung",price:4200,desc:"Günlük kullanım için ideal.",new:false,stock:6},
    {id:6,name:"Huawei P40 - 128GB",brand:"Huawei",price:5200,desc:"İyi durumda, test edildi.",new:false,stock:3},
    {id:7,name:"OnePlus 9 - 128GB",brand:"OnePlus",price:8200,desc:"Hızlı performans, temiz.",new:true,stock:2},
    {id:8,name:"Google Pixel 5 - 128GB",brand:"Google",price:7600,desc:"Temiz, garantili.",new:false,stock:4},
    {id:9,name:"iPhone SE - 64GB",brand:"iPhone",price:4200,desc:"Kompakt ve güçlü.",new:false,stock:8},
    {id:10,name:"Samsung A12 - 64GB",brand:"Samsung",price:3200,desc:"Günlük kullanım için.",new:false,stock:10},
    {id:11,name:"Xiaomi Redmi Note 10",brand:"Xiaomi",price:3500,desc:"F/P ürünü.",new:false,stock:9},
    {id:12,name:"Sony Xperia 5",brand:"Sony",price:9500,desc:"Premium cihaz.",new:true,stock:1}
  ];
  safeSet('prod_demo_v2', PRODUCTS);
}

let REVIEWS = safeGet('rev_demo_v2', null) || [
  {id:1,name:"Ahmet Y",text:"Telefonum aynı gün tamir edildi, çok memnun kaldım.",rating:5},
  {id:2,name:"Elif K",text:"Parçalar orijinal gibiydi, servis hızlı.",rating:5},
  {id:3,name:"Murat D",text:"İkinci el cihazım tertemiz geldi.",rating:4}
];

let POSTS = safeGet('posts_demo_v2', null) || [
  {id:1,title:"Batarya Ömrünü Uzatma",excerpt:"Basit alışkanlıklarla batarya sağlığınızı koruyun."},
  {id:2,title:"Ekran Koruma Rehberi",excerpt:"Hangi koruyucu tercihi daha iyi?"},
  {id:3,title:"Yedek Parça Kalitesi",excerpt:"Orijinal ve OEM farkları."}
];

/* ================= APP STATE ================= */
let CART = safeGet('cart_demo_v2', []);
let lang = safeGet('lang_demo_v2','tr');
let themeLight = safeGet('theme_demo_v2', false);
let productsPage = 1;
const pageSize = 6;

/* ================= UTILITIES ================= */
const $ = id => document.getElementById(id);
function toast(msg, ms=2600){
  const t = $('toast'); if(!t) return;
  t.innerText = msg; t.style.display='block';
  setTimeout(()=> t.style.display='none', ms);
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function currency(tl){
  // digit-by-digit formatting to avoid arithmetic mistakes
  const n = Number(tl) || 0;
  const parts = n.toFixed(2).split('.');
  let int = parts[0], dec = parts[1];
  let out = '';
  for(let i=int.length-1,c=0;i>=0;i--){ out = int[i] + out; c++; if(c===3 && i!==0){ out = '.' + out; c=0; } }
  return out + ',' + dec + ' ₺';
}

/* ============== SCROLL HELP ============== */
function scrollToSection(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.scrollIntoView({behavior:'smooth', block:'start'});
}

/* ================= PRODUCTS RENDER ================= */
function renderProducts(page=1){
  const grid = $('productsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  let list = PRODUCTS.slice(0, page * pageSize);
  const q = $('filterSearch') ? $('filterSearch').value.trim().toLowerCase() : '';
  const brand = $('filterBrand') ? $('filterBrand').value : '';
  const sort = $('sortBy') ? $('sortBy').value : '';
  if(q) list = list.filter(p => (p.name + ' ' + p.brand + ' ' + p.desc).toLowerCase().includes(q));
  if(brand) list = list.filter(p=>p.brand===brand);
  if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if(sort === 'new') list.sort((a,b)=> (b.new?1:0) - (a.new?1:0) );

  list.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'product';
    el.innerHTML = `
      <div class="product-media" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="110" height="110" style="opacity:.95"><rect x="6" y="3" width="12" height="18" rx="2" stroke="#fff" stroke-opacity=".12" stroke-width="0.9" fill="rgba(255,255,255,0.02)"/><circle cx="12" cy="17" r="1.2" fill="#fff"/></svg>
      </div>
      <div class="product-body">
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <div class="product-title">${escapeHtml(p.name)}</div>
            <div class="small-muted" style="margin-top:4px">${escapeHtml(p.brand)} · ${escapeHtml(p.desc)}</div>
          </div>
          <div style="text-align:right">
            <div class="price">${currency(p.price)}</div>
            ${p.new?'<div style="margin-top:6px"><span class="badge-new">YENİ</span></div>':''}
          </div>
        </div>
        <div class="product-actions">
          <button class="btn btn-ghost" onclick='openProduct(${p.id})'>Detay</button>
          <button class="btn btn-primary" onclick='addToCart(${p.id})'>Sepete Ekle</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });

  const loadMoreBtn = $('loadMoreBtn');
  if(loadMoreBtn) loadMoreBtn.style.display = (PRODUCTS.length > page * pageSize) ? 'inline-block' : 'none';
}

/* load more */
function loadMore(){ productsPage++; renderProducts(productsPage); }

/* ============== PRODUCT MODAL ============== */
function openProduct(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  const html = `
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="flex:1">
        <div style="background:linear-gradient(135deg,#052033,#0b2a3b);height:260px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800">${escapeHtml(p.name)}</div>
      </div>
      <div style="flex:1">
        <h3 style="margin:0 0 6px">${escapeHtml(p.name)}</h3>
        <p style="color:var(--muted);margin:0 0 8px">${escapeHtml(p.desc)}</p>
        <p style="color:var(--accent);font-weight:800">${currency(p.price)}</p>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn btn-primary" onclick="addToCart(${p.id})">Sepete Ekle</button>
          <button class="btn btn-ghost" onclick="closeModal()">Kapat</button>
        </div>
      </div>
    </div>`;
  openModal('Ürün Detayı', html);
}

/* ============== CART ================= */
function saveCart(){ safeSet('cart_demo_v2', CART); renderCartPanel(); updateFab(); }
function updateFab(){ const el = $('fabCount'); if(el) el.innerText = CART.length; }
function addToCart(productId){
  const p = PRODUCTS.find(x=>x.id===productId);
  if(!p){ toast('Ürün bulunamadı'); return; }
  // add or increase qty
  const existing = CART.find(c=>c.id===p.id);
  if(existing){ existing.qty += 1; } else { CART.push({id:p.id,name:p.name,price:p.price,qty:1}); }
  saveCart();
  toast(p.name + ' sepete eklendi');
  openCartPanel();
}
function removeFromCart(index){ CART.splice(index,1); saveCart(); }
function changeQty(index, delta){ if(!CART[index]) return; CART[index].qty = Math.max(1, CART[index].qty + delta); saveCart(); }
function cartSum(){
  let s = 0; for(let i=0;i<CART.length;i++) s += CART[i].price * CART[i].qty; return s;
}

function renderCartPanel(){
  const panel = $('cart-panel');
  if(!panel) return;
  panel.style.display='block';
  panel.innerHTML = `<h4 style="margin:6px 0;color:#fff">Sepetiniz (${CART.length})</h4>`;
  if(CART.length===0){
    panel.innerHTML += '<div style="color:var(--muted);padding:12px">Sepetiniz boş</div>';
    panel.innerHTML += `<div style="margin-top:12px"><button class="btn btn-primary" onclick="closeCartPanel()">Kapat</button></div>`;
    return;
  }
  let total = 0;
  CART.forEach((it, idx)=>{
    const sub = it.price * it.qty; total += sub;
    const row = document.createElement('div'); row.className='cart-item';
    row.innerHTML = `<div style="flex:1">
        <div style="font-weight:800">${escapeHtml(it.name)}</div>
        <div class="small-muted">${currency(it.price)} x ${it.qty} = ${currency(sub)}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <div class="qty">
          <button class="btn btn-ghost" onclick="changeQty(${idx},-1)">-</button>
          <div style="padding:6px 10px;background:rgba(255,255,255,0.02);border-radius:6px">${it.qty}</div>
          <button class="btn btn-ghost" onclick="changeQty(${idx},1)">+</button>
        </div>
        <button class="btn btn-ghost" style="color:var(--danger)" onclick="removeFromCart(${idx})">Sil</button>
      </div>`;
    panel.appendChild(row);
  });
  const foot = document.createElement('div'); foot.style.marginTop='12px';
  foot.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:800;color:var(--muted)">Toplam</div><div style="font-weight:900;color:var(--accent)">${currency(total)}</div></div>
    <div style="margin-top:12px;display:flex;gap:8px"><button class="btn btn-primary" onclick="openPaymentDemo()">Ödeme (Demo)</button><button class="btn btn-ghost" onclick="closeCartPanel()">Kapat</button></div>`;
  panel.appendChild(foot);
}

function openCartPanel(){ renderCartPanel(); }
function closeCartPanel(){ const p = $('cart-panel'); if(p) p.style.display='none'; }
function toggleCartPanel(){ const p = $('cart-panel'); if(p.style.display==='block') closeCartPanel(); else openCartPanel(); }

/* ============== PAYMENT DEMO ================== */
function openPaymentDemo(){
  if(CART.length===0){ toast('Sepetiniz boş — önce ürün ekleyin'); return; }
  const demoTotal = $('demoTotal'); if(demoTotal) demoTotal.innerText = currency(cartSum());
  const pd = $('paymentDemo'); if(pd) pd.style.display='flex';
}
function closePaymentDemo(){ const pd = $('paymentDemo'); if(pd) pd.style.display='none'; }
function simulateCheckout(){
  toast('Demo ödeme başarılı — teşekkürler!');
  CART = []; saveCart(); closePaymentDemo();
}

/* ============== MODAL UTIL ================== */
function openModal(title, html){
  const mt = $('modalTitle'); const mb = $('modalBody');
  if(mt) mt.innerText = title;
  if(mb) mb.innerHTML = html;
  const m = $('modal'); if(m) m.style.display = 'flex';
}
function closeModal(){ const m = $('modal'); if(m) m.style.display = 'none'; }

/* ============== ADMIN DEMO ================== */
function openAdmin(){
  const html = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:280px">
        <h4 style="margin-top:0">Yeni Ürün Ekle</h4>
        <input id="adm_name" placeholder="Ürün adı" style="width:100%;padding:8px;border-radius:8px;margin-bottom:8px"><br>
        <input id="adm_brand" placeholder="Marka" style="width:48%;padding:8px;border-radius:8px;margin-bottom:8px;display:inline-block">
        <input id="adm_price" placeholder="Fiyat (TL)" style="width:48%;padding:8px;border-radius:8px;margin-bottom:8px;display:inline-block"><br>
        <textarea id="adm_desc" placeholder="Açıklama" style="width:100%;padding:8px;border-radius:8px;margin-bottom:8px"></textarea>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" onclick="adminAddProduct()">Ekle</button>
          <button class="btn btn-ghost" onclick="closeModal()">Kapat</button>
        </div>
        <hr style="border:none;border-top:1px dashed rgba(255,255,255,0.03);margin:12px 0">
        <h4>CSV ile Toplu Ekle (format: name,brand,price,desc)</h4>
        <textarea id="adm_csv" placeholder="satır1: Ürün,Marka,1000,Açıklama" style="width:100%;height:100px;padding:8px;border-radius:8px"></textarea><br>
        <button class="btn btn-primary" onclick="adminImportCSV()">CSV İçe Aktar</button>
      </div>
      <div style="flex:1;min-width:280px">
        <h4>Mevcut Ürünler</h4>
        <div id="adminList" style="max-height:360px;overflow:auto;padding-right:6px"></div>
      </div>
    </div>`;
  openModal('Admin Paneli (Demo)', html);
  renderAdminList();
}

function adminAddProduct(){
  const name = $('adm_name') ? $('adm_name').value.trim() : '';
  const brand = $('adm_brand') ? $('adm_brand').value.trim() : '';
  const price = Number($('adm_price') ? $('adm_price').value : 0);
  const desc = $('adm_desc') ? $('adm_desc').value.trim() : '';
  if(!name || !brand || !price){ toast('Lütfen tüm alanları doldurun'); return; }
  const id = PRODUCTS.length ? Math.max(...PRODUCTS.map(p=>p.id))+1 : 1;
  PRODUCTS.unshift({id,name,brand,price,desc,new:true,stock:5});
  safeSet('prod_demo_v2', PRODUCTS);
  renderProducts(productsPage);
  renderAdminList();
  toast('Ürün eklendi (demo)');
}

function adminImportCSV(){
  const txt = $('adm_csv') ? $('adm_csv').value.trim() : '';
  if(!txt){ toast('CSV alanı boş'); return; }
  const lines = txt.split(/\r?\n/);
  let added = 0;
  lines.forEach(line=>{
    const parts = line.split(',');
    if(parts.length>=3){
      const name = (parts[0]||'').trim();
      const brand = (parts[1]||'').trim();
      const price = Number((parts[2]||'').trim());
      const desc = (parts[3]||'').trim();
      if(name && brand && price){
        const id = PRODUCTS.length ? Math.max(...PRODUCTS.map(p=>p.id))+1 : 1;
        PRODUCTS.push({id,name,brand,price,desc,new:false,stock:3});
        added++;
      }
    }
  });
  if(added>0){
    safeSet('prod_demo_v2', PRODUCTS);
    renderProducts(productsPage);
    renderAdminList();
    toast(added + ' ürün eklendi (CSV)');
  } else {
    toast('CSV formatı hatalı ya da uygun veri yok');
  }
}

function renderAdminList(){
  const container = $('adminList');
  if(!container) return;
  container.innerHTML = '';
  PRODUCTS.slice(0,50).forEach(p=>{
    const d = document.createElement('div'); d.style.padding='8px 0'; d.style.borderBottom='1px dashed rgba(255,255,255,0.02)';
    d.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><strong>${escapeHtml(p.name)}</strong><div class="small-muted">${escapeHtml(p.brand)} · ${currency(p.price)}</div></div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn btn-ghost" onclick="adminRemove(${p.id})">Sil</button>
      </div>
    </div>`;
    container.appendChild(d);
  });
}
function adminRemove(id){
  PRODUCTS = PRODUCTS.filter(x=>x.id!==id);
  safeSet('prod_demo_v2', PRODUCTS);
  renderProducts(productsPage);
  renderAdminList();
  toast('Ürün silindi (demo)');
}

/* ============== REVIEWS / BLOG / GALLERY ============== */
let reviewInterval = null;
function renderReviews(){
  const wrap = $('testiWrap'); if(!wrap) return;
  wrap.innerHTML = '';
  REVIEWS.forEach(r=>{
    const el = document.createElement('div'); el.className = 'testimonial';
    el.innerHTML = `<p>"${escapeHtml(r.text)}"</p><div style="font-weight:800">${escapeHtml(r.name)}</div><div class="rating">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>`;
    wrap.appendChild(el);
  });
  const rc = $('reviewCount'); if(rc) rc.innerText = REVIEWS.length;
  const items = wrap.querySelectorAll('.testimonial');
  if(items.length===0){ wrap.innerHTML = '<div style="color:var(--muted)">Yorum yok</div>'; return; }
  items.forEach((it,i)=> it.style.display = i===0 ? 'block' : 'none');
  // clear previous interval to avoid duplicates
  if(reviewInterval) clearInterval(reviewInterval);
  let idx = 0;
  reviewInterval = setInterval(()=>{ 
    items[idx].style.display='none'; 
    idx=(idx+1)%items.length; 
    items[idx].style.display='block'; 
  },3800);
}
function renderBlog(){
  const b = $('blogGrid'); if(!b) return; b.innerHTML = '';
  POSTS.forEach(p=>{
    const d = document.createElement('div'); d.className='card';
    d.style.padding='14px'; d.style.borderRadius='10px'; d.style.background='var(--card)';
    d.innerHTML = `<h4>${escapeHtml(p.title)}</h4><p style="color:var(--muted)">${escapeHtml(p.excerpt)}</p><div style="margin-top:8px"><button class="btn btn-ghost" onclick="openPost(${p.id})">Oku</button></div>`;
    b.appendChild(d);
  });
}
function openPost(id){
  const p = POSTS.find(x=>x.id===id);
  if(!p) return;
  openModal(p.title, `<p style="color:var(--muted)">${escapeHtml(p.excerpt)}</p><p style="margin-top:8px">Detaylı içerik demo metnidir.</p>`);
}
function renderGallery(){
  const g = $('galleryGrid'); if(!g) return; g.innerHTML = '';
  // örnek "öncesi/sonrası" görselleri - placeholder olarak via.placeholder kullanıldı
  const images = [
    'https://via.placeholder.com/800x600?text=Öncesi+1',
    'https://via.placeholder.com/800x600?text=Sonrası+1',
    'https://via.placeholder.com/800x600?text=Öncesi+2',
    'https://via.placeholder.com/800x600?text=Sonrası+2',
    'https://via.placeholder.com/800x600?text=Öncesi+3',
    'https://via.placeholder.com/800x600?text=Sonrası+3',
    'https://via.placeholder.com/800x600?text=Öncesi+4',
    'https://via.placeholder.com/800x600?text=Sonrası+4'
  ];
  images.forEach(src=>{
    const div = document.createElement('div'); div.className='tile';
    div.style.backgroundImage = `url('${src}')`;
    div.addEventListener('click', ()=> openLightbox(src));
    g.appendChild(div);
  });
}

/* ============== FAQ toggle ============== */
function toggleFaq(el){
  const a = el.nextElementSibling;
  a.style.display = (a.style.display === 'block') ? 'none' : 'block';
}

/* ============== QUICK FORM & CONTACT ============== */
function openQuick(){ 
  // Modal içi kısa form; varsa yan panel değerleri modal formda öntanımlı gösteriliyor.
  const modelVal = $('quick_model') ? $('quick_model').value : '';
  const svcVal = $('quick_service') ? $('quick_service').value : '';
  const html = `<div style="padding:8px">
    <label class="small">Model</label>
    <input id="quick_model_modal" placeholder="Model" value="${escapeHtml(modelVal)}" style="width:100%;padding:8px;margin-top:8px">
    <label class="small" style="margin-top:8px">Hizmet</label>
    <select id="quick_service_modal" style="width:100%;padding:8px;margin-top:8px">
      <option ${svcVal===''?'selected':''}>Seçiniz — Hizmet</option>
      <option ${svcVal==='Ekran Değişimi'?'selected':''}>Ekran Değişimi</option>
      <option ${svcVal==='Batarya Değişimi'?'selected':''}>Batarya Değişimi</option>
      <option ${svcVal==='Yazılım & Veri Kurtarma'?'selected':''}>Yazılım & Veri Kurtarma</option>
    </select>
    <div style="margin-top:12px;display:flex;gap:8px"><button class="btn btn-primary" onclick="submitQuick()">Gönder</button><button class="btn btn-ghost" onclick="closeModal()">İptal</button></div>
  </div>`;
  openModal('Hızlı Teklif', html);
}
function submitQuick(){
  // modal içindeki inputları öncelikle kullan, yoksa sayfadaki quick_model/quick_service alanlarını kullan
  let model = $('quick_model_modal') ? $('quick_model_modal').value.trim() : ($('quick_model')? $('quick_model').value.trim() : '');
  let svc = $('quick_service_modal') ? $('quick_service_modal').value : ($('quick_service')? $('quick_service').value : '');
  if(!model && !svc){ toast('Lütfen model veya hizmet bilgisi girin'); return; }
  toast(`${svc || 'Hizmet'} talebiniz alındı: ${model || 'Belirtilmedi'}`);
  closeModal();
}
if(document.getElementById('contactForm')){
  document.getElementById('contactForm').addEventListener('submit', function(e){ e.preventDefault(); toast('Mesajınız alındı. Teşekkürler!'); this.reset(); });
}

/* ============== LIGHTBOX ============== */
function openLightbox(src){ const lb = $('lightbox'); const img = $('lightImage'); if(img) img.src = src || ''; if(lb) lb.style.display = 'flex'; }
function closeLightbox(){ const lb = $('lightbox'); if(lb) lb.style.display = 'none'; }
const lb = $('lightbox');
if(lb){
  lb.addEventListener('click', (e)=>{ if(e.target === lb || e.target.id==='lightImage') closeLightbox(); });
}

/* ============== SEARCH & FILTER HOOKS ============== */
if($('filterSearch')) $('filterSearch').addEventListener('input', ()=> renderProducts(productsPage));
if($('filterBrand')) $('filterBrand').addEventListener('change', ()=> renderProducts(productsPage));
if($('sortBy')) $('sortBy').addEventListener('change', ()=> renderProducts(productsPage));
if($('globalSearch')) $('globalSearch').addEventListener('input', (e)=>{ if($('filterSearch')){ $('filterSearch').value = e.target.value; renderProducts(productsPage); } });

/* ============== COUNTDOWN ================== */
function initCountdown(endDate){
  function update(){
    const now = new Date().getTime();
    const diff = endDate - now;
    const cd = $('countdown');
    if(!cd) return;
    if(diff <= 0){ cd.innerHTML = '<div class="small-muted">Kampanya sona erdi</div>'; return; }
    const days = Math.floor(diff/(1000*60*60*24));
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
    const mins = Math.floor((diff%(1000*60*60))/(1000*60));
    const secs = Math.floor((diff%(1000*60))/1000);
    $('cdDays').innerText = days; $('cdHours').innerText = hours; $('cdMins').innerText = mins; $('cdSecs').innerText = secs;
  }
  update(); setInterval(update,1000);
}

/* ============== THEME & LANG ================== */
function applyTheme(){
  if(themeLight) document.body.classList.add('light'); else document.body.classList.remove('light');
  safeSet('theme_demo_v2', themeLight);
}
if($('themeBtn')) $('themeBtn').addEventListener('click', ()=>{ themeLight = !themeLight; applyTheme(); toast(themeLight ? 'Aydınlık tema etkin' : 'Karanlık tema etkin'); });

if($('langBtn')) $('langBtn').addEventListener('click', ()=>{ lang = (lang==='tr' ? 'en' : 'tr'); safeSet('lang_demo_v2', lang); updateLang(); toast(lang === 'tr' ? 'Türkçe' : 'English'); });

function updateLang(){
  if(lang==='tr'){
    // keep Turkish labels (already set)
    if($('tagline')) $('tagline').innerText = 'Profesyonel servis — garantiyle';
  } else {
    if($('tagline')) $('tagline').innerText = 'Professional service — with warranty';
  }
}

/* ============== INIT BOOT ============== */
function init(){
  // initial render
  renderProducts(productsPage);
  renderReviews();
  renderBlog();
  renderGallery();
  updateFab();
  if(document.getElementById('year')) document.getElementById('year').innerText = new Date().getFullYear();
  applyTheme();
  updateLang();

  // countdown: 3 days from now
  const now = new Date(); const end = new Date(now.getTime() + 3*24*60*60*1000 + 5*60*60*1000);
  initCountdown(end.getTime());
}
init();

/* ============== UTILITY & EXPOSURE ============== */
window.addToCart = addToCart;
window.openProduct = openProduct;
window.openAdmin = openAdmin;
window.toggleCartPanel = toggleCartPanel;
window.openQuick = openQuick;
window.openPaymentDemo = openPaymentDemo;
window.closePaymentDemo = closePaymentDemo;

/* save some state on unload */
window.addEventListener('beforeunload', ()=>{ safeSet('prod_demo_v2', PRODUCTS); safeSet('cart_demo_v2', CART); safeSet('lang_demo_v2', lang); safeSet('theme_demo_v2', themeLight); });

/* keyboard close */
document.addEventListener('keydown', e=>{ if(e.key==='Escape'){ closeModal(); closeLightbox(); closeCartPanel(); const pd=document.getElementById('paymentDemo'); if(pd) pd.style.display='none'; } });



function openTip(id){document.getElementById('tip-'+id).style.display='flex';}
function closeTip(id){document.getElementById('tip-'+id).style.display='none';}

const botBtn=document.getElementById('chatBotBtn');
const botWin=document.getElementById('chatBotWin');
const botMsgs=document.getElementById('chatBotMsgs');
function toggleBot(){botWin.style.display=botWin.style.display==='flex'?'none':'flex';botWin.style.flexDirection='column';}
if(botBtn) botBtn.addEventListener('click',toggleBot);
function sendBot(){
  const inp=document.getElementById('botTxt');
  const msg=inp.value.trim(); if(!msg) return;
  addMsg('Siz',msg); inp.value='';
  setTimeout(()=>{ addMsg('Bot',botReply(msg)); },600);
}
function addMsg(from,text){
  const d=document.createElement('div');
  d.innerHTML='<b>'+from+':</b> '+text;
  botMsgs.appendChild(d); botMsgs.scrollTop=botMsgs.scrollHeight;
}
function botReply(msg){
  const low=msg.toLowerCase();
  if(low.includes('adres')) return 'Adresimiz: Konya Selçuklu Tepekent';
  if(low.includes('telefon')||low.includes('numara')) return 'Telefonumuz: +90 534 488 37 46';
  if(low.includes('merhaba')) return 'Merhaba! Size nasıl yardımcı olabilirim?';
  if(low.includes('fiyat')) return 'Fiyat bilgisi için ürünler bölümüne bakabilirsiniz.';
  const cevaplar=[
    'Daha fazla bilgi için iletişim kısmına göz atın.',
    'Size yardımcı olmaktan mutluluk duyarım.',
    'Sorunuzu biraz daha detaylı açıklayabilir misiniz?',
    'En güncel bilgileri mağaza kısmında bulabilirsiniz.'
  ];
  return cevaplar[Math.floor(Math.random()*cevaplar.length)];
}
