(() => {
'use strict';
const EGG_KEY='viral_voice_recovered_signals_v2';
const eggs={
zero:{title:'TRANSMISSION ZERO',copy:'You noticed the thing that was designed not to be noticed. That is usually where the interesting part starts.',gain:7},
origin:{title:'WHY THE SIGNAL EXISTS',copy:'Because certainty is cheap. Curiosity costs attention. The Viral Voice is not a set of answers. It is an invitation to inspect the frame before accepting the picture.',gain:5},
frame:{title:'THE FRAME',copy:'Every message has a frame. Every frame leaves something outside it. Ask what you are not being shown.',gain:9},
frequency:{title:'87.9 // OPEN CHANNEL',copy:'A frequency with no station. A voice with no permission slip. Some broadcasts are found because somebody was willing to turn the dial.',gain:11},
remember:{title:'THE SIGNAL REMEMBERS',copy:'You came back. The machine noticed. Not because you joined a cult, calm down. Because persistence is part of the experience.',gain:13},
archive:{title:'RECOVERED FILE // 003',copy:'The archive is intentionally incomplete. Future promos, physical merch, QR codes and live appearances can open new pieces of it.',gain:15},
believe:{title:'TRUE BELIEVER // DEFINITION',copy:'A True Believer is not someone who believes The Viral Voice. It is someone who still believes their own mind is worth using.',gain:17},
final:{title:'YOU FOLLOWED IT HERE',copy:'The signal ends where another person picks it up. Speak. Spread. Change.',gain:23}
};
const TOTAL_EGGS=Object.keys(eggs).length;
let found=[];try{found=JSON.parse(localStorage.getItem(EGG_KEY)||'[]')}catch{found=[]}
found=[...new Set(found)].filter(id=>eggs[id]);
const modal=document.querySelector('[data-modal]'),title=document.querySelector('[data-modal-title]'),copy=document.querySelector('[data-modal-copy]'),strength=document.querySelector('[data-modal-strength]'),count=document.querySelector('[data-egg-count]'),toast=document.querySelector('[data-signal-toast]');
function localStrength(){if(found.length>=TOTAL_EGGS)return 100;const recovered=found.reduce((n,id)=>n+(eggs[id]?.gain||0),0);return Math.min(99,10+recovered)}
function updateCount(){const complete=found.length>=TOTAL_EGGS;if(count)count.textContent=`${found.length} / ${TOTAL_EGGS}`;document.documentElement.style.setProperty('--signal',`${localStrength()}%`);document.documentElement.classList.toggle('signal-complete',complete);document.body.classList.toggle('signal-complete',complete)}
function showToast(text){if(!toast)return;toast.textContent=text;toast.hidden=false;clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.hidden=true,2600)}
function openEgg(id,button){const egg=eggs[id];if(!egg)return;const fresh=!found.includes(id);if(fresh){found.push(id);localStorage.setItem(EGG_KEY,JSON.stringify(found));button?.classList.add('egg-found');showToast(found.length>=TOTAL_EGGS?'SIGNAL COMPLETE // 100%':`SIGNAL RECOVERED // ${String(found.length).padStart(2,'0')}`)}title.textContent=egg.title;copy.textContent=egg.copy;strength.textContent=fresh?(found.length>=TOTAL_EGGS?'100% // FULL SIGNAL':`+${egg.gain}%`):'RECOVERED';modal.hidden=false;document.body.style.overflow='hidden';updateCount()}
document.querySelectorAll('.egg-trigger').forEach(btn=>{if(found.includes(btn.dataset.egg))btn.classList.add('egg-found');btn.addEventListener('click',()=>openEgg(btn.dataset.egg,btn))});
document.querySelector('[data-close]')?.addEventListener('click',()=>{modal.hidden=true;document.body.style.overflow='' });modal?.addEventListener('click',e=>{if(e.target===modal){modal.hidden=true;document.body.style.overflow=''}});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal&&!modal.hidden){modal.hidden=true;document.body.style.overflow=''}});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelector('[data-menu]')?.addEventListener('click',()=>document.querySelector('.site-header')?.classList.toggle('open'));document.querySelectorAll('.site-header nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.site-header')?.classList.remove('open')));
const cursor=document.querySelector('.cursor-signal');window.addEventListener('pointermove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}});
window.addEventListener('scroll',()=>{const y=window.scrollY;document.documentElement.style.setProperty('--scroll-shift',`${y*.03}px`)},{passive:true});
window.addEventListener('viralvoice:signalchange',e=>{if(found.length>=TOTAL_EGGS){document.documentElement.style.setProperty('--signal','100%');return}const backend=Number(e.detail?.strength)||10,local=found.reduce((n,id)=>n+(eggs[id]?.gain||0),0);document.documentElement.style.setProperty('--signal',`${Math.min(99,backend+local)}%`)});
updateCount();
})();