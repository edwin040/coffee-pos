const DEFAULT_PRODUCTS=[
{id:1,name:"Kopi Susu Gula Aren",category:"Kopi",price:22000,emoji:"🧋",desc:"Espresso, susu, gula aren",art:""},
{id:2,name:"Americano",category:"Kopi",price:18000,emoji:"☕",desc:"Espresso dan air",art:""},
{id:3,name:"Cappuccino",category:"Kopi",price:24000,emoji:"☕",desc:"Espresso, susu, foam",art:""},
{id:4,name:"Cafe Latte",category:"Kopi",price:25000,emoji:"🥛",desc:"Espresso dan steamed milk",art:""},
{id:5,name:"Matcha Latte",category:"Non-kopi",price:26000,emoji:"🍵",desc:"Matcha premium dan susu",art:"tea"},
{id:6,name:"Chocolate",category:"Non-kopi",price:23000,emoji:"🍫",desc:"Cokelat creamy",art:"cool"},
{id:7,name:"Lychee Tea",category:"Non-kopi",price:20000,emoji:"🧋",desc:"Teh dan leci",art:"tea"},
{id:8,name:"Croissant",category:"Snack",price:18000,emoji:"🥐",desc:"Butter croissant",art:"bakery"},
{id:9,name:"Butter Cookies",category:"Snack",price:12000,emoji:"🍪",desc:"Cookies homemade",art:"bakery"},
{id:10,name:"French Fries",category:"Snack",price:17000,emoji:"🍟",desc:"Kentang goreng",art:""}
];
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){toast("Penyimpanan penuh atau tidak tersedia");return false}};
const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let products=read("kopikasir_products",DEFAULT_PRODUCTS),cart={},category="Semua",method="Tunai",transactions=read("kopikasir_transactions",[]),editingId=null,lastTransaction=null;
if(!Array.isArray(products))products=DEFAULT_PRODUCTS.map(p=>({...p}));
if(!Array.isArray(transactions))transactions=[];
const saveProducts=()=>write("kopikasir_products",products);
const saveTransactions=()=>write("kopikasir_transactions",transactions);
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
const total=()=>Object.entries(cart).reduce((s,[id,q])=>s+(products.find(p=>p.id===+id)?.price||0)*q,0);
function open(id){$(id).classList.add("show");$(id).setAttribute("aria-hidden","false")}
function close(id){$(id).classList.remove("show");$(id).setAttribute("aria-hidden","true")}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
function renderProducts(){const q=$("searchInput").value.toLowerCase();const list=products.filter(p=>(category==="Semua"||p.category===category)&&p.name.toLowerCase().includes(q));$("productCount").textContent=list.length+" menu";$("productGrid").innerHTML=list.map(p=>'<article class="product-card"><div class="product-art '+esc(p.art)+'">'+esc(p.emoji)+'</div><div class="product-info"><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p><div class="product-foot"><span class="price">'+money(p.price)+'</span><button class="add-btn" data-add="'+p.id+'" aria-label="Tambah '+esc(p.name)+'">+</button></div></div></article>').join("")||'<div class="empty-state">Menu tidak ditemukan.</div>'}
function renderCategories(){const cats=["Semua",...new Set(products.map(p=>p.category))];if(!cats.includes(category))category="Semua";$("categories").innerHTML=cats.map(c=>'<button class="category '+(c===category?"active":"")+'" data-category="'+esc(c)+'">'+esc(c)+'</button>').join("")}
function renderCart(){$("cartCount").textContent=count();$("cartItems").textContent=count()+" item dipilih";$("cartTotal").textContent=money(total());$("sheetTotal").textContent=money(total());$("cartBar").style.display=count()?"flex":"none";$("cartLines").innerHTML=Object.entries(cart).map(([id,q])=>{const p=products.find(x=>x.id===+id);if(!p)return "";return '<div class="cart-line"><div class="line-emoji">'+esc(p.emoji)+'</div><div class="line-info"><b>'+esc(p.name)+'</b><small>'+money(p.price)+'</small></div><div class="qty-control"><button data-qty="'+id+'" data-delta="-1">−</button><b>'+q+'</b><button data-qty="'+id+'" data-delta="1">+</button></div></div>'}).join("")||'<div class="empty-state">Keranjang masih kosong.</div>'}
function updateStats(){const today=new Date().toLocaleDateString("id-ID");const daily=transactions.filter(t=>new Date(t.date).toLocaleDateString("id-ID")===today);$("todayCount").textContent=daily.length;$("todaySales").textContent=money(daily.reduce((s,t)=>s+t.total,0))}
function updateChange(){const cash=+$("cashInput").value||0;$("changeValue").textContent=money(Math.max(0,cash-total()))}
function renderHistory(){$("historyList").innerHTML=transactions.length?transactions.slice().reverse().map(t=>'<article class="history-item"><button class="history-main" data-detail="'+esc(t.id)+'"><b>#'+esc(t.id)+' · '+esc(t.method)+'</b><small>'+new Date(t.date).toLocaleString("id-ID")+' · '+(t.items||[]).reduce((s,i)=>s+i.qty,0)+' item</small><strong>'+money(t.total)+'</strong></button><button class="danger-btn" data-delete-transaction="'+esc(t.id)+'" aria-label="Hapus transaksi">Hapus</button></article>').join(""):'<div class="empty-state">Belum ada transaksi.<br>Transaksi selesai akan muncul di sini.</div>'}
function receipt(t){$("receiptContent").innerHTML='<h3>KopiKasir Coffee Shop</h3><p>Terima kasih sudah mampir ☕</p><div class="receipt-divider"></div><div class="receipt-row"><span>No. transaksi</span><b>#'+esc(t.id)+'</b></div><div class="receipt-row"><span>Waktu</span><span>'+new Date(t.date).toLocaleString("id-ID")+'</span></div><div class="receipt-divider"></div>'+(t.items||[]).map(i=>'<div class="receipt-row"><span>'+esc(i.name)+' × '+i.qty+'</span><b>'+money(i.price*i.qty)+'</b></div>').join("")+'<div class="receipt-divider"></div><div class="receipt-row"><b>Total</b><b>'+money(t.total)+'</b></div><div class="receipt-row"><span>Metode</span><span>'+esc(t.method)+'</span></div>'+(t.method==="Tunai"?'<div class="receipt-row"><span>Uang diterima</span><span>'+money(t.cash)+'</span></div><div class="receipt-row"><span>Kembalian</span><span>'+money(t.change)+'</span></div>':"")+'<div class="receipt-divider"></div><p>Semoga harimu menyenangkan!</p>'}
function renderManage(){ $("manageList").innerHTML=products.map(p=>'<article class="manage-item"><div class="manage-emoji">'+esc(p.emoji)+'</div><div class="manage-info"><b>'+esc(p.name)+'</b><small>'+esc(p.category)+' · '+money(p.price)+'</small></div><button class="small-action" data-edit="'+p.id+'">Edit</button><button class="danger-btn" data-delete="'+p.id+'">Hapus</button></article>').join("")||'<div class="empty-state">Belum ada produk.</div>'; }
function resetProductForm(){editingId=null;$("productForm").reset();$("productFormTitle").textContent="Tambah produk";$("saveProduct").textContent="Simpan produk";$("productEmoji").value="☕";$("productCost").value=""}
function startEdit(id){const p=products.find(x=>x.id===id);if(!p)return;editingId=id;$("productFormTitle").textContent="Edit produk";$("saveProduct").textContent="Simpan perubahan";$("productName").value=p.name;$("productCategory").value=p.category;$("productPrice").value=p.price;$("productCost").value=p.cost??"";$("productEmoji").value=p.emoji;$("productDesc").value=p.desc||"";$("productName").focus()}
function showTransaction(id){const t=transactions.find(x=>String(x.id)===String(id));if(!t)return;receipt(t);open("receiptOverlay")}
$("productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const id=+b.dataset.add;cart[id]=(cart[id]||0)+1;renderCart();toast("Menu ditambahkan")});
$("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;renderCategories();renderProducts()});
$("searchInput").addEventListener("input",renderProducts);
$("openCart").addEventListener("click",()=>open("cartOverlay"));
$("cartLines").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(!b)return;const id=b.dataset.qty;cart[id]=(cart[id]||0)+ +b.dataset.delta;if(cart[id]<=0)delete cart[id];renderCart()});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>close(b.dataset.close)));
$("checkoutBtn").addEventListener("click",()=>{if(!count())return;close("cartOverlay");$("payTotal").textContent=money(total());$("cashInput").value="";method="Tunai";document.querySelectorAll(".pay-option").forEach(b=>b.classList.toggle("selected",b.dataset.method===method));$("cashField").style.display="block";updateChange();open("paymentOverlay")});
document.querySelectorAll(".pay-option").forEach(b=>b.addEventListener("click",()=>{method=b.dataset.method;document.querySelectorAll(".pay-option").forEach(x=>x.classList.toggle("selected",x===b));$("cashField").style.display=method==="Tunai"?"block":"none"}));
$("cashInput").addEventListener("input",updateChange);
$("confirmPayment").addEventListener("click",()=>{if(!count())return;const sum=total(),cash=+$("cashInput").value||0;if(method==="Tunai"&&cash<sum){toast("Uang diterima belum mencukupi");return}const items=Object.entries(cart).map(([id,qty])=>{const p=products.find(x=>x.id===+id);return p?{id:p.id,name:p.name,price:p.price,cost:p.cost??null,qty}:null}).filter(Boolean);lastTransaction={id:Date.now().toString().slice(-7),date:new Date().toISOString(),items,total:sum,method,cash:method==="Tunai"?cash:sum,change:method==="Tunai"?cash-sum:0};transactions.push(lastTransaction);if(!saveTransactions())return;cart={};renderCart();renderHistory();updateStats();close("paymentOverlay");receipt(lastTransaction);open("receiptOverlay")});
$("printReceipt").addEventListener("click",()=>window.print());
$("newOrder").addEventListener("click",()=>{close("receiptOverlay");toast("Siap menerima pesanan baru")});
$("historyBtn").addEventListener("click",()=>{renderHistory();open("historyOverlay")});
$("historyList").addEventListener("click",e=>{const detail=e.target.closest("[data-detail]");if(detail){showTransaction(detail.dataset.detail);return}const del=e.target.closest("[data-delete-transaction]");if(del&&confirm("Hapus transaksi ini dari riwayat?")){transactions=transactions.filter(t=>String(t.id)!==String(del.dataset.deleteTransaction));saveTransactions();renderHistory();updateStats();toast("Transaksi dihapus")}});
$("manageBtn").addEventListener("click",()=>{renderManage();resetProductForm();open("manageOverlay")});
$("addProductBtn").addEventListener("click",()=>{resetProductForm();$("productName").focus()});
$("manageList").addEventListener("click",e=>{const edit=e.target.closest("[data-edit]");if(edit){startEdit(+edit.dataset.edit);return}const del=e.target.closest("[data-delete]");if(del){const id=+del.dataset.delete;if(!confirm("Hapus produk ini?"))return;products=products.filter(p=>p.id!==id);delete cart[id];saveProducts();renderManage();renderProducts();renderCategories();renderCart();toast("Produk berhasil dihapus")}});
$("productForm").addEventListener("submit",e=>{e.preventDefault();const name=$("productName").value.trim(),cat=$("productCategory").value.trim(),price=Number($("productPrice").value),cost=$("productCost").value===""?null:Math.max(0,Number($("productCost").value)||0),emoji=$("productEmoji").value.trim()||"☕",desc=$("productDesc").value.trim();if(!name||!cat||!Number.isFinite(price)||price<1){toast("Periksa nama, kategori, dan harga");return}if(products.some(p=>p.name.toLowerCase()===name.toLowerCase()&&p.id!==editingId)){toast("Nama produk sudah digunakan");return}if(editingId!==null){products=products.map(p=>p.id===editingId?{...p,name,category:cat,price,cost,emoji,desc}:p)}else{products.push({id:Date.now(),name,category:cat,price,cost,emoji,desc,art:""})}const wasEditing=editingId!==null;if(!saveProducts())return;resetProductForm();renderManage();renderProducts();renderCategories();renderCart();toast(wasEditing?"Produk diperbarui":"Produk ditambahkan")});
$("todayLabel").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"}).toUpperCase();
renderCategories();renderProducts();renderCart();updateStats();
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));


/* Theme preference is saved independently from POS product and sales data. */
(function(){
 const key="kopikasir_theme";
 const button=document.getElementById("themeToggle");
 const meta=document.querySelector('meta[name="theme-color"]');
 function applyTheme(theme){
  const selected=theme==="dark"?"dark":"light";
  document.documentElement.dataset.theme=selected;
  if(meta)meta.setAttribute("content",selected==="dark"?"#151412":"#f7f5f0");
  if(button){
   button.textContent=selected==="dark"?"☀":"☾";
   button.setAttribute("aria-label",selected==="dark"?"Aktifkan tema terang":"Aktifkan tema gelap");
   button.setAttribute("aria-pressed",String(selected==="dark"));
   button.title=selected==="dark"?"Tema terang":"Tema gelap";
  }
 }
 let saved="light";
 try{saved=localStorage.getItem(key)||"light"}catch(e){}
 applyTheme(saved);
 if(button)button.addEventListener("click",()=>{
  const next=document.documentElement.dataset.theme==="dark"?"light":"dark";
  try{localStorage.setItem(key,next)}catch(e){}
  applyTheme(next);
  toast(next==="dark"?"Tema gelap diaktifkan":"Tema terang diaktifkan");
 });
})();

/* Pembukuan: HPP, biaya operasional, analisa dan ekspor CSV. */
const expenseKey="kopikasir_expenses";let expenses=read(expenseKey,[]);if(!Array.isArray(expenses))expenses=[];
const saveExpenses=()=>write(expenseKey,expenses),isoToday=()=>new Date().toISOString().slice(0,10);
function reportTransactions(){const m=$("reportRange").value,n=new Date();return transactions.filter(t=>{const d=new Date(t.date);if(Number.isNaN(d.getTime()))return false;if(m==="today")return d.toDateString()===n.toDateString();if(m==="month")return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();if(m==="7"||m==="30")return d>=new Date(n.getTime()-Number(m)*86400000);return true})}
function reportExpenses(){const m=$("reportRange").value,n=new Date();return expenses.filter(x=>{const d=new Date((x.date||"")+"T12:00:00");if(m==="today")return d.toDateString()===n.toDateString();if(m==="month")return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();if(m==="7"||m==="30")return d>=new Date(n.getTime()-Number(m)*86400000);return true})}
function renderAccounting(){const ts=reportTransactions(),ex=reportExpenses(),sales=ts.reduce((a,t)=>a+(+t.total||0),0),cogs=ts.reduce((a,t)=>a+(t.items||[]).reduce((v,i)=>v+(Number(i.cost)||0)*Number(i.qty||0),0),0),known=ts.filter(t=>(t.items||[]).every(i=>i.cost!==undefined&&i.cost!==null)).length,exp=ex.reduce((a,x)=>a+(+x.amount||0),0),profit=sales-cogs-exp,methods={},best={};ts.forEach(t=>{methods[t.method]=(methods[t.method]||0)+(+t.total||0);(t.items||[]).forEach(i=>best[i.name]=(best[i.name]||0)+(+i.qty||0))});const rows=Object.entries(best).sort((a,b)=>b[1]-a[1]).slice(0,5);$("accountingReport").innerHTML='<div class="accounting-cards"><article><small>Omzet</small><strong>'+money(sales)+'</strong></article><article><small>HPP / modal terjual</small><strong>'+money(cogs)+'</strong></article><article><small>Biaya operasional</small><strong>'+money(exp)+'</strong></article><article class="profit-card"><small>Estimasi laba bersih</small><strong>'+money(profit)+'</strong></article></div><div class="report-note">'+ts.length+' transaksi · '+ex.length+' catatan biaya · HPP tercatat '+known+'/'+ts.length+' transaksi</div><section class="report-section"><h3>Rincian pemasukan</h3><div class="report-line"><span>Total penjualan</span><b>'+money(sales)+'</b></div><div class="report-line"><span>HPP produk</span><b>− '+money(cogs)+'</b></div><div class="report-line"><span>Pengeluaran operasional</span><b>− '+money(exp)+'</b></div><div class="report-line report-total"><span>Estimasi laba bersih</span><b>'+money(profit)+'</b></div></section><section class="report-section"><h3>Metode pembayaran</h3>'+Object.entries(methods).map(([k,v])=>'<div class="report-line"><span>'+esc(k)+'</span><b>'+money(v)+'</b></div>').join("")+'<div class="report-line"><span>Jumlah transaksi</span><b>'+ts.length+'</b></div></section><section class="report-section"><h3>Produk terlaris</h3>'+(rows.length?rows.map(([n,q],i)=>'<div class="report-line"><span>'+(i+1)+'. '+esc(n)+'</span><b>'+q+' terjual</b></div>').join(""):'<p class="muted">Belum ada data penjualan.</p>')+'</section>'+(known<ts.length?'<p class="accounting-warning">'+(ts.length-known)+' transaksi lama atau transaksi tanpa modal belum memiliki catatan HPP. Isi modal produk untuk transaksi berikutnya agar laba lebih akurat.</p>':'');$("expenseList").innerHTML=ex.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(x=>'<article class="manage-item"><div class="manage-info"><b>'+esc(x.name)+'</b><small>'+esc(x.date)+'</small></div><strong>'+money(x.amount)+'</strong><button class="danger-btn" data-expense-delete="'+esc(x.id)+'">Hapus</button></article>').join("")||'<p class="muted">Belum ada pengeluaran pada periode ini.</p>'}
$("bookkeepingBtn").addEventListener("click",()=>{renderAccounting();$("expenseDate").value=isoToday();open("accountingOverlay")});$("reportRange").addEventListener("change",renderAccounting);
$("addExpenseBtn").addEventListener("click",()=>{$("expenseForm").hidden=!$("expenseForm").hidden;if(!$("expenseForm").hidden){$("expenseForm").reset();$("expenseDate").value=isoToday()}});
$("expenseForm").addEventListener("submit",e=>{e.preventDefault();const name=$("expenseName").value.trim(),amount=Number($("expenseAmount").value),date=$("expenseDate").value;if(!name||amount<=0||!date)return;expenses.push({id:Date.now().toString(),name,amount,date});if(!saveExpenses())return;$("expenseForm").reset();$("expenseForm").hidden=true;renderAccounting();toast("Pengeluaran tersimpan")});
$("expenseList").addEventListener("click",e=>{const b=e.target.closest("[data-expense-delete]");if(!b)return;if(!confirm("Hapus catatan pengeluaran ini?"))return;expenses=expenses.filter(x=>String(x.id)!==String(b.dataset.expenseDelete));saveExpenses();renderAccounting();toast("Catatan pengeluaran dihapus")});
$("exportReportBtn").addEventListener("click",()=>{const rows=[["Tanggal","Jenis","Keterangan","Metode","Jumlah","HPP","Laba sebelum biaya"],...reportTransactions().map(t=>[new Date(t.date).toLocaleString("id-ID"),"Penjualan",(t.items||[]).map(i=>i.name+" x"+i.qty).join("; "),t.method,t.total,(t.items||[]).reduce((s,i)=>s+(Number(i.cost)||0)*i.qty,0),t.total-(t.items||[]).reduce((s,i)=>s+(Number(i.cost)||0)*i.qty,0)]),...reportExpenses().map(x=>[x.date,"Pengeluaran",x.name,"",-x.amount,0,-x.amount])];const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="laporan-kopikasir-"+isoToday()+".csv";a.click();URL.revokeObjectURL(url)});

$("backupBtn").addEventListener("click",()=>{const payload={app:"KopiKasir",version:1,createdAt:new Date().toISOString(),products,transactions,expenses};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="backup-kopikasir-"+isoToday()+".json";a.click();URL.revokeObjectURL(url);toast("Cadangan data berhasil dibuat")});
$("restoreBtn").addEventListener("click",()=>$("restoreFile").click());
$("restoreFile").addEventListener("change",e=>{const file=e.target.files&&e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!d||!Array.isArray(d.products)||!Array.isArray(d.transactions)||!Array.isArray(d.expenses))throw new Error("format");if(!confirm("Pulihkan data akan mengganti produk, transaksi, dan pengeluaran di perangkat ini. Lanjutkan?"))return;products=d.products;transactions=d.transactions;expenses=d.expenses;if(!saveProducts()||!saveTransactions()||!saveExpenses())throw new Error("storage");renderProducts();renderCategories();renderManage();renderHistory();renderCart();updateStats();renderAccounting();toast("Data berhasil dipulihkan")}catch(err){toast("File cadangan tidak valid atau gagal dipulihkan")}finally{$("restoreFile").value=""}};reader.readAsText(file)});
