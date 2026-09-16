/* THE VIRAL VOICE // SIGNAL SUPPLY */
(() => {
  "use strict";

  const PRICING = { stickerSingle:5, stickerPair:8, stickerCompleteSet:18, shirt:null, holographicSticker:null };
  const STANDARD_STICKER_IDS = ["VV-SIG-001","VV-SIG-002","VV-SIG-003","VV-TB-001","VV-TB-002"];

  const PRODUCTS = [
    {id:"VV-APP-001",category:"apparel",title:"Distressed Sigil Tee",image:"assets/VVshirt1.png",description:"Garment-dyed natural tee. Small distressed sigil front. Oversized Viral Voice and sigil back print.",badge:"Front + Back",price:null,sizes:["S","M","L","XL","2XL","3XL"],available:false,status:"COMING SOON"},
    {id:"VV-APP-002",category:"apparel",title:"Viral Voice Portrait Tee",image:"assets/VVshirt2.png",description:"Garment-dyed black tee with the Viral Voice portrait, sigil, and distressed broadcast artwork.",badge:"Portrait",price:null,sizes:["S","M","L","XL","2XL","3XL"],available:false,status:"COMING SOON"},
    {id:"VV-APP-003",category:"apparel",title:"True Believer Tee",image:"assets/VVshirt3-final.png",description:"Garment-dyed black tee with the full I'M A TRUE BELIEVER front print and Think For Yourself message.",badge:"Movement",price:null,sizes:["S","M","L","XL","2XL","3XL"],available:false,status:"COMING SOON"},
    {id:"VV-SIG-001",category:"stickers",title:"Classic Sigil",image:"assets/viral_voice_top_left_logo.png",description:"Clean cyan-on-black circular sigil marker.",badge:"Standard",price:5,available:true,bundleEligible:true},
    {id:"VV-SIG-002",category:"stickers",title:"Distressed Sigil",image:"assets/viral_voice_top_right_distressed_logo.png",description:"Dripping, distressed version of the primary signal mark.",badge:"Standard",price:5,available:true,bundleEligible:true},
    {id:"VV-SIG-003",category:"stickers",title:"Viral Voice Logo",image:"assets/viral_voice_top_center_name_logo.png",description:"Sigil plus full Viral Voice wordmark in one irregular die-cut piece.",badge:"Standard",price:5,available:true,bundleEligible:true},
    {id:"VV-SIG-004",category:"stickers",title:"Holographic Sigil",image:"assets/viral_voice_holographic_logo.png",description:"Iridescent holographic signal mark with shifting color under light.",badge:"Holographic",price:null,available:false,status:"PRICE TBA"},
    {id:"VV-TB-001",category:"stickers",title:"True Believer Head",image:"assets/I_Am_A_True_Believer_Head.png",description:"Profile design with the third-eye signal and distressed cyan broadcast treatment.",badge:"True Believer",price:5,available:true,bundleEligible:true},
    {id:"VV-TB-002",category:"stickers",title:"True Believer Triangle",image:"assets/I_Am_A_True_Believer_Triangle.png",description:"Triangular True Believer marker built around the core Viral Voice sigil language.",badge:"True Believer",price:5,available:true,bundleEligible:true}
  ];

  const CART_KEY="viral_voice_signal_supply_cart";
  const getProduct=id=>PRODUCTS.find(p=>p.id===id);
  let cart=loadCart().filter(i=>getProduct(i.id)?.available);
  const grids={apparel:document.querySelector('[data-product-grid="apparel"]'),stickers:document.querySelector('[data-product-grid="stickers"]')};
  const money=n=>typeof n==="number"?`$${n}`:"PRICE TBA";

  function productCard(p){
    const disabled=p.available?"":" disabled", unavailable=p.available?"":" unavailable";
    const sizes=p.sizes?`<select class="product-size" data-size aria-label="Select size"${disabled}>${p.sizes.map(s=>`<option value="${s}">${s}</option>`).join("")}</select>`:"";
    return `<article class="product-card${unavailable}" data-category="${p.category}" data-product-id="${p.id}"><div class="product-visual"><span class="product-code">${p.id}</span><span class="product-badge">${p.badge}</span>${p.available?"":`<span class="product-status-overlay">${p.status}</span>`}<img src="${p.image}" alt="${p.title}" loading="lazy" /></div><div class="product-body"><span class="product-category">${p.category==="apparel"?"APPAREL":"SIGNAL MARKER"}</span><h3 class="product-title">${p.title}</h3><p class="product-description">${p.description}</p><div class="product-meta"><strong class="product-price${typeof p.price==="number"?"":" pending"}">${money(p.price)}</strong>${sizes}</div>${p.bundleEligible?`<div class="bundle-note">ANY 2 // $8 &nbsp;&nbsp; COMPLETE 5-SET // $18</div>`:""}<div class="product-actions"><button class="acquire-button" type="button" data-add="${p.id}"${disabled}>${p.available?"ACQUIRE ARTIFACT":p.status}</button><button class="quick-button" type="button" data-add="${p.id}" aria-label="Add ${p.title} to cart"${disabled}>+</button></div></div></article>`;
  }

  function renderProducts(){Object.entries(grids).forEach(([cat,grid])=>{if(grid)grid.innerHTML=PRODUCTS.filter(p=>p.category===cat).map(productCard).join("");});}
  function loadCart(){try{const x=JSON.parse(localStorage.getItem(CART_KEY));return Array.isArray(x)?x:[];}catch{return[];}}
  function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));renderCart();}
  function addToCart(id,button){const p=getProduct(id);if(!p?.available)return;const size=button.closest('.product-card')?.querySelector('[data-size]')?.value||null;const key=`${id}:${size||"default"}`;const old=cart.find(i=>i.key===key);old?old.quantity++:cart.push({key,id,size,quantity:1});saveCart();openCart();}
  function changeQuantity(key,d){const i=cart.find(x=>x.key===key);if(!i)return;i.quantity+=d;if(i.quantity<=0)cart=cart.filter(x=>x.key!==key);saveCart();}
  function removeItem(key){cart=cart.filter(x=>x.key!==key);saveCart();}

  function calculateStickerPricing(){
    const q=Object.fromEntries(STANDARD_STICKER_IDS.map(id=>[id,0]));
    cart.forEach(i=>{if(i.id in q)q[i.id]+=i.quantity;});
    const sets=Math.min(...STANDARD_STICKER_IDS.map(id=>q[id]));
    STANDARD_STICKER_IDS.forEach(id=>q[id]-=sets);
    const remaining=STANDARD_STICKER_IDS.reduce((s,id)=>s+q[id],0), pairs=Math.floor(remaining/2), singles=remaining%2;
    return {total:sets*PRICING.stickerCompleteSet+pairs*PRICING.stickerPair+singles*PRICING.stickerSingle,completeSets:sets,pairs,singles,quantity:sets*5+remaining};
  }
  function calculateCartTotal(){const sp=calculateStickerPricing();const other=cart.reduce((s,i)=>STANDARD_STICKER_IDS.includes(i.id)?s:s+(typeof getProduct(i.id)?.price==="number"?getProduct(i.id).price*i.quantity:0),0);return{total:sp.total+other,stickerPricing:sp};}
  function bundleSummary(p){const a=[];if(p.completeSets)a.push(`${p.completeSets} COMPLETE 5-SET${p.completeSets>1?"S":""}`);if(p.pairs)a.push(`${p.pairs} TWO-STICKER DEAL${p.pairs>1?"S":""}`);if(p.singles)a.push(`${p.singles} SINGLE`);return a.join(" // ");}

  function renderCart(){
    const container=document.querySelector('[data-cart-items]'),empty=document.querySelector('[data-cart-empty]'),total=document.querySelector('[data-cart-total]'),bundle=document.querySelector('[data-cart-bundle]');
    document.querySelectorAll('[data-cart-count]').forEach(n=>n.textContent=String(cart.reduce((s,i)=>s+i.quantity,0)));
    if(!container||!empty||!total)return;
    empty.hidden=cart.length>0;container.hidden=cart.length===0;
    container.innerHTML=cart.map(i=>{const p=getProduct(i.id);if(!p)return"";return `<div class="cart-item"><img src="${p.image}" alt="" /><div class="cart-item-copy"><strong>${p.title}</strong><span>${i.size?`SIZE ${i.size} // `:""}${p.bundleEligible?"$5 EACH // BUNDLE PRICING AT SUBTOTAL":money(p.price)}</span><div class="cart-item-tools"><button type="button" data-qty="-1" data-key="${i.key}">−</button><b>${i.quantity}</b><button type="button" data-qty="1" data-key="${i.key}">+</button></div></div><button class="cart-remove" type="button" data-remove="${i.key}">×</button></div>`;}).join("");
    const pricing=calculateCartTotal();total.textContent=cart.length?money(pricing.total):"$0";
    if(bundle){const s=bundleSummary(pricing.stickerPricing);bundle.textContent=s?`BUNDLE APPLIED // ${s}`:"";bundle.hidden=!s;}
  }

  function openCart(){document.body.classList.add('cart-open');const d=document.querySelector('.cart-drawer');if(d)d.setAttribute('aria-hidden','false');}
  function closeCart(){document.body.classList.remove('cart-open');const d=document.querySelector('.cart-drawer');if(d)d.setAttribute('aria-hidden','true');}
  function applyFilter(filter){document.querySelectorAll('.filter-button').forEach(b=>b.classList.toggle('active',b.dataset.filter===filter));document.querySelectorAll('.product-card').forEach(c=>c.hidden=filter!=="all"&&c.dataset.category!==filter);}

  document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){addToCart(add.dataset.add,add);return;}const qty=e.target.closest('[data-qty]');if(qty){changeQuantity(qty.dataset.key,Number(qty.dataset.qty));return;}const rem=e.target.closest('[data-remove]');if(rem){removeItem(rem.dataset.remove);return;}if(e.target.closest('[data-cart-open]')){openCart();return;}if(e.target.closest('[data-cart-close]')){closeCart();return;}const filter=e.target.closest('[data-filter]');if(filter)applyFilter(filter.dataset.filter);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart();});
  renderProducts();renderCart();
})();