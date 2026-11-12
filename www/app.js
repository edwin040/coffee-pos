const products=[
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
const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
let cart={},category="Semua",method="Tunai",transactions=read("kopikasir_transactions",[]),lastTransaction=null;
const $=id=>document.getElementById(id);
const save=()=>localStorage.setItem("kopikasir_transactions",JSON.stringify(transactions));
const count=()=>Object.values(cart).reduce((a,b)=>a+b,0);
const total=()=>Object.entries(cart).reduce((s,[id,q])=>s+products.find(p=>p.id===+id).price*q,0);
function renderProducts(){const q=$("searchInput").value.toLowerCase();const list=products.filter(p=>(category==="Semua"||p.category===category)&&p.name.toLowerCase().includes(q));$("productCount").textContent=list.length+" menu";$("productGrid").innerHTML=list.map(p=>`<article class="product-card"><div class="product-art ${p.art}">${p.emoji}</div><div class="product-info"><h3>${p.name}</h3><p>${p.desc}</p><div class="product-foot"><span class="price">${money(p.price)}</span><button class="add-btn" data-add="${p.id}" aria-label="Tambah ${p.name}">+</button></div></div></article>`).join("")||'<div class="empty-state">Menu tidak ditemukan.</div>'}
function renderCategories(){const cats=["Semua",...new Set(products.map(p=>p.category))];$("categories").innerHTML=cats.map(c=>`<button class="category ${c===category?"active":""}" data-category="${c}">${c}</button>`).join("")}
function renderCart(){$("cartCount").textContent=count();$("cartItems").textContent=count()+" item dipilih";$("cartTotal").textContent=money(total());$("sheetTotal").textContent=money(total());$("cartBar").style.display=count()?"flex":"none";$("cartLines").innerHTML=Object.entries(cart).map(([id,q])=>{const p=products.find(x=>x.id===+id);return `<div class="cart-line"><div class="line-emoji">${p.emoji}</div><div class="line-info"><b>${p.name}</b><small>${money(p.price)}</small></div><div class="qty-control"><button data-qty="${id}" data-delta="-1">−</button><b>${q}</b><button data-qty="${id}" data-delta="1">+</button></div></div>`}).join("")||'<div class="empty-state">Keranjang masih kosong.</div>'}
function open(id){$(id).classList.add("show");$(id).setAttribute("aria-hidden","false")}
function close(id){$(id).classList.remove("show");$(id).setAttribute("aria-hidden","true")}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2100)}
function updateStats(){const today=new Date().toLocaleDateString("id-ID");const daily=transactions.filter(t=>new Date(t.date).toLocaleDateString("id-ID")===today);$("todayCount").textContent=daily.length;$("todaySales").textContent=money(daily.reduce((s,t)=>s+t.total,0))}
function updateChange(){const cash=+$("cashInput").value||0;$("changeValue").textContent=money(Math.max(0,cash-total()))}
function renderHistory(){$("historyList").innerHTML=transactions.length?transactions.slice().reverse().map(t=>`<div class="history-item"><div><b>#${t.id} · ${t.method}</b><small>${new Date(t.date).toLocaleString("id-ID")} · ${t.items.reduce((s,i)=>s+i.qty,0)} item</small></div><strong>${money(t.total)}</strong></div>`).join(""):'<div class="empty-state">Belum ada transaksi.<br>Transaksi yang selesai akan muncul di sini.</div>'}
function receipt(t){$("receiptContent").innerHTML=`<h3>KopiKasir Coffee Shop</h3><p>Terima kasih sudah mampir ☕</p><div class="receipt-divider"></div><div class="receipt-row"><span>No. transaksi</span><b>#${t.id}</b></div><div class="receipt-row"><span>Waktu</span><span>${new Date(t.date).toLocaleString("id-ID")}</span></div><div class="receipt-divider"></div>${t.items.map(i=>`<div class="receipt-row"><span>${i.name} × ${i.qty}</span><b>${money(i.price*i.qty)}</b></div>`).join("")}<div class="receipt-divider"></div><div class="receipt-row"><b>Total</b><b>${money(t.total)}</b></div><div class="receipt-row"><span>Metode</span><span>${t.method}</span></div>${t.method==="Tunai"?`<div class="receipt-row"><span>Uang diterima</span><span>${money(t.cash)}</span></div><div class="receipt-row"><span>Kembalian</span><span>${money(t.change)}</span></div>`:""}<div class="receipt-divider"></div><p>Semoga harimu menyenangkan!</p>`}
$("productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;const id=+b.dataset.add;cart[id]=(cart[id]||0)+1;renderCart();toast("Menu ditambahkan")});
$("categories").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;category=b.dataset.category;renderCategories();renderProducts()});
$("searchInput").addEventListener("input",renderProducts);
$("openCart").addEventListener("click",()=>open("cartOverlay"));
$("cartLines").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(!b)return;const id=b.dataset.qty;cart[id]=(cart[id]||0)+ +b.dataset.delta;if(cart[id]<=0)delete cart[id];renderCart()});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>close(b.dataset.close)));
$("checkoutBtn").addEventListener("click",()=>{if(!count())return;close("cartOverlay");$("payTotal").textContent=money(total());$("cashInput").value="";method="Tunai";document.querySelectorAll(".pay-option").forEach(b=>b.classList.toggle("selected",b.dataset.method===method));$("cashField").style.display="block";updateChange();open("paymentOverlay")});
document.querySelectorAll(".pay-option").forEach(b=>b.addEventListener("click",()=>{method=b.dataset.method;document.querySelectorAll(".pay-option").forEach(x=>x.classList.toggle("selected",x===b));$("cashField").style.display=method==="Tunai"?"block":"none"}));
$("cashInput").addEventListener("input",updateChange);
$("confirmPayment").addEventListener("click",()=>{if(!count())return;const sum=total(),cash=+$("cashInput").value||0;if(method==="Tunai"&&cash<sum){toast("Uang diterima belum mencukupi");return}const items=Object.entries(cart).map(([id,qty])=>{const p=products.find(x=>x.id===+id);return {id:p.id,name:p.name,price:p.price,qty}});lastTransaction={id:Date.now().toString().slice(-7),date:new Date().toISOString(),items,total:sum,method,cash:method==="Tunai"?cash:sum,change:method==="Tunai"?cash-sum:0};transactions.push(lastTransaction);save();cart={};renderCart();renderHistory();updateStats();close("paymentOverlay");receipt(lastTransaction);open("receiptOverlay")});
$("printReceipt").addEventListener("click",()=>window.print());
$("newOrder").addEventListener("click",()=>{close("receiptOverlay");toast("Siap menerima pesanan baru")});
$("historyBtn").addEventListener("click",()=>{renderHistory();open("historyOverlay")});
$("todayLabel").textContent=new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long"}).toUpperCase();
renderCategories();renderProducts();renderCart();updateStats();
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));