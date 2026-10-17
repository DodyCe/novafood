// menu.js - Vanilla equivalent of HamburgerMenuOverlay (Lightswind UI).
// Animation: clip-path circle expands from button center, items slide in from left with stagger.
// Menu/X icon: cross-fade + rotate + scale (mirrors the React component exactly).

const SVG_MENU = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`;
const SVG_X    = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

export function crearMenuOverlay({
  items = [],
  overlayBackground = "linear-gradient(135deg, #D62828 0%, #F77F00 100%)",
  enableBlur = false,
  menuAlignment = "left",
  animationDuration = 1.5,
  staggerDelay = 0.1,
  buttonTop = "40px",
  buttonLeft = "40px",
  buttonColor = "#D62828",
  textColor = "#ffffff",
  onOpen = () => {},
  onClose = () => {},
} = {}) {

  // Load Krona One (same font as original component)
  if (!document.getElementById("nf-krona-font")) {
    const pre = document.createElement("link"); pre.rel="preconnect"; pre.href="https://fonts.googleapis.com"; document.head.appendChild(pre);
    const pre2 = document.createElement("link"); pre2.rel="preconnect"; pre2.href="https://fonts.gstatic.com"; pre2.crossOrigin="anonymous"; document.head.appendChild(pre2);
    const lnk = document.createElement("link"); lnk.id="nf-krona-font"; lnk.rel="stylesheet";
    lnk.href="https://fonts.googleapis.com/css2?family=Krona+One:wght@400&display=swap"; document.head.appendChild(lnk);
  }

  // Inject all styles once
  if (!document.getElementById("nf-menu-styles")) {
    const s = document.createElement("style"); s.id = "nf-menu-styles";
    s.textContent = [
      `.nf-overlay{position:fixed;inset:0;display:flex;flex-direction:column;justify-content:center;`,
      `background:${overlayBackground};z-index:1040;`,
      `clip-path:circle(0px at ${buttonLeft} ${buttonTop});`,
      `transition:clip-path ${animationDuration}s cubic-bezier(0.25,0.46,0.45,0.94);`,
      enableBlur ? "backdrop-filter:blur(10px);" : "",
      `pointer-events:none;}`,
      `.nf-overlay.nf-open{clip-path:circle(150% at ${buttonLeft} ${buttonTop});pointer-events:auto;}`,
      `.nf-menu-list{list-style:none;margin:0;padding:0 5rem;display:flex;flex-direction:column;gap:.25rem;}`,
      `@media(max-width:768px){.nf-menu-list{padding:0 2.5rem;}}`,
      `.nf-menu-item{position:relative;padding:.4rem 0;cursor:pointer;list-style:none;`,
      `transform:translateX(-200px);opacity:0;`,
      `transition:transform .4s ease,opacity .4s ease;`,
      `font-family:'Krona One',monospace;font-weight:400;color:${textColor};}`,
      `.nf-menu-item.nf-visible{transform:translateX(0);opacity:1;}`,
      `.nf-menu-item::before{content:'';position:absolute;left:-1.5rem;top:50%;`,
      `transform:translateY(-50%) translateX(-100%);width:1rem;height:5px;border-radius:10px;`,
      `background:${textColor};opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none;}`,
      `.nf-menu-item:hover::before{opacity:1;transform:translateY(-50%) translateX(0);}`,
      `.nf-menu-item .nf-item-inner{opacity:.7;transition:opacity .25s ease;`,
      `display:flex;align-items:center;gap:.85rem;font-size:clamp(1.6rem,4vw,3rem);line-height:1.25;}`,
      `.nf-menu-item:hover .nf-item-inner{opacity:1;}`,
      `.nf-menu-item:focus{outline:2px solid ${textColor};outline-offset:4px;border-radius:4px;}`,
      `.nf-btn{position:fixed;top:${buttonTop};left:${buttonLeft};transform:translate(-50%,-50%);z-index:1050;`,
      `width:48px;height:48px;border-radius:50%;background:${buttonColor};border:none;cursor:pointer;`,
      `display:flex;align-items:center;justify-content:center;`,
      `box-shadow:0 4px 18px rgba(0,0,0,.28);animation:nfBtnIn .45s ease;`,
      `transition:transform .3s ease,box-shadow .3s ease;}`,
      `@keyframes nfBtnIn{from{opacity:0;transform:translate(-50%,-50%) scale(.55);}to{opacity:1;transform:translate(-50%,-50%) scale(1);}}`,
      `.nf-btn:hover{transform:translate(-50%,-50%) scale(1.1);box-shadow:0 6px 28px rgba(0,0,0,.38);}`,
      `.nf-btn .nf-icon{position:absolute;display:flex;align-items:center;justify-content:center;color:#fff;transition:opacity .3s ease,transform .3s ease;}`,
      `.nf-btn .nf-icon-menu{opacity:1;transform:rotate(0deg) scale(1);}`,
      `.nf-btn .nf-icon-close{opacity:0;transform:rotate(-45deg) scale(0);}`,
      `.nf-btn.nf-open .nf-icon-menu{opacity:0;transform:rotate(45deg) scale(0);}`,
      `.nf-btn.nf-open .nf-icon-close{opacity:1;transform:rotate(0deg) scale(1);}`,
      `@media(max-width:768px){.nf-overlay{clip-path:circle(0px at 30px 30px)!important;}`,
      `.nf-overlay.nf-open{clip-path:circle(150% at 30px 30px)!important;}`,
      `.nf-btn{top:30px!important;left:30px!important;}}`,
    ].join(""); document.head.appendChild(s);
  }

  // Build overlay
  const overlay = document.createElement("div");
  overlay.id = "menuOverlay"; overlay.className = "nf-overlay";
  overlay.setAttribute("aria-hidden","true"); overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true"); overlay.setAttribute("aria-label","Menu de navegacion");

  const ul = document.createElement("ul"); ul.className = "nf-menu-list";
  const liItems = [];
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "nf-menu-item"; li.setAttribute("role","button");
    li.setAttribute("tabindex","-1"); li.setAttribute("aria-label","Ir a " + item.label);
    const iconHtml = item.icon
      ? `<span style="display:flex;align-items:center;width:28px;height:28px;flex-shrink:0">${item.icon}</span>`
      : "";
    li.innerHTML = `<span class="nf-item-inner">${iconHtml}${item.label}</span>`;
    li.addEventListener("click", () => {
      if (item.onClick) item.onClick();
      else if (item.href) {
        if (item.href.startsWith("#")) document.querySelector(item.href)?.scrollIntoView({behavior:"smooth"});
        else window.location.href = item.href;
      }
      cerrar();
    });
    li.addEventListener("keydown", (e) => { if (e.key==="Enter"||e.key===" "){e.preventDefault();li.click();} });
    ul.appendChild(li); liItems.push(li);
  });
  overlay.appendChild(ul); document.body.appendChild(overlay);

  // Build button
  const btn = document.createElement("button");
  btn.id = "btnMenu"; btn.className = "nf-btn";
  btn.setAttribute("aria-label","Menu de navegacion");
  btn.setAttribute("aria-expanded","false"); btn.setAttribute("aria-controls","menuOverlay");
  btn.innerHTML = `<span class="nf-icon nf-icon-menu">${SVG_MENU}</span><span class="nf-icon nf-icon-close">${SVG_X}</span>`;
  document.body.appendChild(btn);

  let abierto = false;
  function abrir() {
    abierto=true; btn.setAttribute("aria-expanded","true"); btn.classList.add("nf-open");
    overlay.classList.add("nf-open"); overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    liItems.forEach((li,i)=>{ li.setAttribute("tabindex","0"); setTimeout(()=>li.classList.add("nf-visible"),i*(staggerDelay*1000)+150); });
    onOpen();
  }
  function cerrar() {
    if(!abierto)return; abierto=false; btn.setAttribute("aria-expanded","false");
    btn.classList.remove("nf-open"); overlay.classList.remove("nf-open");
    overlay.setAttribute("aria-hidden","true"); document.body.style.overflow="";
    liItems.forEach((li)=>{ li.classList.remove("nf-visible"); li.setAttribute("tabindex","-1"); });
    onClose();
  }
  btn.addEventListener("click",()=>(abierto?cerrar():abrir()));
  document.addEventListener("keydown",(e)=>{ if(e.key==="Escape"&&abierto)cerrar(); });
  return { abrir, cerrar, toggle:()=>(abierto?cerrar():abrir()) };
}
