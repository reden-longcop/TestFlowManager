const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./App-ZNdE4P9M.js","./vendor-CnLy6pY0.js","./vendor-Dit8VdZN.css","./components-rn_Tn36V.js","./components-CX2QJhyA.css"])))=>i.map(i=>d[i]);
import{c as y,j as u,d as g}from"./vendor-CnLy6pY0.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const r of t.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&c(r)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function c(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();const v="modulepreload",E=function(f,s){return new URL(f,s).href},h={},R=function(s,i,c){let e=Promise.resolve();if(i&&i.length>0){const t=document.getElementsByTagName("link"),r=document.querySelector("meta[property=csp-nonce]"),m=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));e=Promise.all(i.map(o=>{if(o=E(o,c),o in h)return;h[o]=!0;const l=o.endsWith(".css"),p=l?'[rel="stylesheet"]':"";if(!!c)for(let a=t.length-1;a>=0;a--){const d=t[a];if(d.href===o&&(!l||d.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${o}"]${p}`))return;const n=document.createElement("link");if(n.rel=l?"stylesheet":v,l||(n.as="script",n.crossOrigin=""),n.href=o,m&&n.setAttribute("nonce",m),document.head.appendChild(n),l)return new Promise((a,d)=>{n.addEventListener("load",a),n.addEventListener("error",()=>d(new Error(`Unable to preload CSS for ${o}`)))})}))}return e.then(()=>s()).catch(t=>{const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=t,window.dispatchEvent(r),!r.defaultPrevented)throw t})},L=React.lazy(()=>R(()=>import("./App-ZNdE4P9M.js"),__vite__mapDeps([0,1,2,3,4]),import.meta.url)),P=y.createRoot(document.getElementById("root"));P.render(u.jsx(React.StrictMode,{children:u.jsx(g,{children:u.jsx(React.Suspense,{fallback:u.jsx("div",{children:"Loading..."}),children:u.jsx(L,{})})})}));
