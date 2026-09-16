(() => {
'use strict';
const stage=document.querySelector('[data-depth-stage]');
if(!stage||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const root=document.documentElement, scenes=[...document.querySelectorAll('[data-depth-scene]')], finalWhite=document.querySelector('[data-whiteout]'), exit=document.querySelector('[data-exit-scene]');
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function sceneCurve(p,center,width=.16){const d=Math.abs(p-center);return clamp(1-d/width)}
function render(){const r=stage.getBoundingClientRect(), travel=stage.offsetHeight-innerHeight, p=clamp(-r.top/Math.max(1,travel));root.style.setProperty('--journey',`${(p*100).toFixed(1)}%`);root.style.setProperty('--journey-number',p.toFixed(3));root.style.setProperty('--tunnel-scale',(1+p*5.5).toFixed(3));root.style.setProperty('--exit-light',clamp((p-.68)/.27).toFixed(3));root.style.setProperty('--whiteout',clamp((p-.965)/.035).toFixed(3));document.body.classList.toggle('journey-mode',p>.015&&p<.985);
const centers=[.06,.22,.39,.54,.69,.86];scenes.forEach((s,i)=>{const a=sceneCurve(p,centers[i]??.5,i===5?.18:.145);const approach=clamp((p-(centers[i]-.16))/.16);const passed=clamp((p-centers[i])/.14);const z=-850+approach*900+passed*900;const scale=.38+approach*.62+passed*.5;s.style.setProperty('--scene-opacity',a.toFixed(3));s.style.setProperty('--scene-z',`${z.toFixed(0)}px`);s.style.setProperty('--scene-scale',scale.toFixed(3));s.style.setProperty('--scene-blur',`${((1-a)*15).toFixed(1)}px`);s.classList.toggle('is-active',a>.55)});
if(exit){const complete=document.documentElement.classList.contains('signal-complete');exit.classList.toggle('full-signal',complete)}requestAnimationFrame(()=>{})}
let ticking=false;function queue(){if(ticking)return;ticking=true;requestAnimationFrame(()=>{render();ticking=false})}addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);render();
})();
