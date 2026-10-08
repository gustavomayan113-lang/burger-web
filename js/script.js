/* =====================================================
   CONFIGURE AQUI
   ===================================================== */
const WHATSAPP = "5500000000000";   // código do país + DDD + número, sem espaços

// Para colocar foto num prato: preencha "img" com o caminho, ex.: "imagens/classico.jpg"
const CARDAPIO = [
  {cat:"Burgers", nome:"Clássico da Brasa", desc:"Carne 160g, queijo prato, alface, tomate e molho da casa.", preco:28, img:"img/Clássico da Brasa.png"},
  {cat:"Burgers", nome:"Bacon Duplo",       desc:"Duas carnes, cheddar, bacon crocante e cebola caramelizada.", preco:36, img:"img/Bacon Duplo.png"},
  {cat:"Burgers", nome:"Picanha Smash",     desc:"Blend de picanha, queijo provolone e maionese de alho.", preco:39, img:"img/Picanha Smash.png"},
  {cat:"Burgers", nome:"Veggie Verde",      desc:"Burger de grão-de-bico, rúcula, tomate seco e molho de ervas.", preco:30, img:"img/Veggie Verde.png"},
  {cat:"Porções", nome:"Batata Rústica",    desc:"Com casca, alecrim e sal grosso. Acompanha molho.", preco:18, img:"img/Batata Rústica.png"},
  {cat:"Porções", nome:"Anéis de Cebola",   desc:"Empanados na hora, crocantes por fora e macios por dentro.", preco:20, img:"img/Anéis de Cebola.png"},
  {cat:"Bebidas", nome:"Limonada da Casa",  desc:"Limão siciliano, hortelã e gelo. 500ml.", preco:11, img:"img/Limonada da Casa.png"},
  {cat:"Bebidas", nome:"Milkshake",         desc:"Chocolate, baunilha ou morango. 400ml.", preco:19, img:"img/Milkshake.png"}
];

const EXTRAS = [
  {id:"queijo", nome:"Queijo",  preco:4, cls:"l-queijo"},
  {id:"bacon",  nome:"Bacon",   preco:6, cls:"l-bacon"},
  {id:"alface", nome:"Alface",  preco:2, cls:"l-alface"},
  {id:"tomate", nome:"Tomate",  preco:2, cls:"l-tomate"},
  {id:"picles", nome:"Picles",  preco:2, cls:"l-picles"},
  {id:"cebola", nome:"Cebola roxa", preco:2, cls:"l-cebola"},
  {id:"carne",  nome:"Carne extra", preco:9, cls:"l-carne"}
];
const BASE = 18;
const TAG = {"Bacon Duplo":"Mais pedido","Picanha Smash":"Novo","Veggie Verde":"Vegetariano","Clássico da Brasa":"Clássico"};
const ICO = {"Burgers":"🍔","Porções":"🍟","Bebidas":"🥤"};

/* =====================================================
   CÓDIGO
   ===================================================== */
const $ = s => document.querySelector(s);
const brl = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let pedido = [];  // {nome, preco, qtd}

/* imagens: preenche os espaços que tiverem data-src */
function carregarImagens(raiz=document){
  raiz.querySelectorAll(".slot[data-src]").forEach(el=>{
    const src = el.dataset.src;
    if(src && !el.querySelector("img")){
      const img = new Image(); img.loading = "lazy"; img.decoding = "async"; img.src = src; img.alt = el.dataset.alt || "";
      img.onload = () => el.querySelector("span")?.remove();
      el.appendChild(img);
    }
  });
}

/* faixa rolando */
$("#faixa").textContent = "ARTESANAL ✦ NA BRASA ✦ PÃO MACIO ✦ MOLHO DA CASA ✦ ".repeat(8);

/* montador */
const ativos = new Set(["queijo"]);
let ultimo = null;
function desenhaPilha(){
  const p = $("#pilha"); p.innerHTML = "";
  const add = (cls,key) => {
    const d = document.createElement("div");
    d.className = "layer "+cls;
    if(key && key===ultimo) ultimo = null; else d.style.animation = "none";
    p.appendChild(d);
  };
  add("l-topo");
  EXTRAS.filter(e=>ativos.has(e.id) && e.id!=="carne").forEach(e=>add(e.cls,e.id===ultimo?e.id:null));
  add("l-carne");
  if(ativos.has("carne")) add("l-carne","carne");
  add("l-base");
  // anima só a camada recém-adicionada
  if(ultimo){ const k=p.children; for(const c of k){ if(c.classList.contains(EXTRAS.find(e=>e.id===ultimo)?.cls)){c.style.animation="";} } }
  let total = BASE; ativos.forEach(id => total += EXTRAS.find(e=>e.id===id).preco);
  $("#totalMontado").textContent = brl(total);
  return total;
}
$("#chips").innerHTML = EXTRAS.map(e=>`<button class="chip" data-id="${e.id}" aria-pressed="${ativos.has(e.id)}">${e.nome} +${e.preco}</button>`).join("");
$("#chips").addEventListener("click", ev=>{
  const b = ev.target.closest(".chip"); if(!b) return;
  const id = b.dataset.id;
  if(ativos.has(id)){ ativos.delete(id); ultimo=null; } else { ativos.add(id); ultimo=id; }
  b.setAttribute("aria-pressed", ativos.has(id));
  desenhaPilha();
});
desenhaPilha();
$("#addMontado").addEventListener("click", ()=>{
  const lista = EXTRAS.filter(e=>ativos.has(e.id)).map(e=>e.nome.toLowerCase()).join(", ");
  const total = [...ativos].reduce((s,id)=>s+EXTRAS.find(e=>e.id===id).preco, BASE);
  adicionar("Burger montado" + (lista ? " ("+lista+")" : ""), total);
  const b = $("#addMontado"); b.textContent = "Adicionado!";
  setTimeout(()=>b.textContent="Adicionar ao pedido",1200);
});

/* cardápio */
const cats = ["Todos", ...new Set(CARDAPIO.map(i=>i.cat))];
let filtro = "Todos";
function desenhaFiltros(){
  $("#filtros").innerHTML = cats.map(c=>`<button class="filtro" aria-pressed="${c===filtro}" data-c="${c}">${c}</button>`).join("");
}
function desenhaGrade(){
  $("#grade").innerHTML = CARDAPIO.map((it,i)=>({it,i})).filter(({it})=>filtro==="Todos"||it.cat===filtro).map(({it,i})=>`
    <article class="card">
      <div class="slot" data-src="${it.img}" data-alt="${it.nome}">${TAG[it.nome]?`<em class="tag">${TAG[it.nome]}</em>`:""}<span><big style="font-size:2.4rem">${ICO[it.cat]}</big><br>Foto: ${it.nome}</span></div>
      <div class="info">
        <h3>${it.nome}</h3>
        <p>${it.desc}</p>
        <div class="rodape"><span class="preco">${brl(it.preco)}</span><button class="add" data-i="${i}">Adicionar</button></div>
      </div>
    </article>`).join("");
  carregarImagens($("#grade"));
}
$("#filtros").addEventListener("click", ev=>{
  const b = ev.target.closest(".filtro"); if(!b) return;
  filtro = b.dataset.c; desenhaFiltros(); desenhaGrade();
});
$("#grade").addEventListener("click", ev=>{
  const b = ev.target.closest(".add"); if(!b) return;
  const it = CARDAPIO[b.dataset.i];
  adicionar(it.nome, it.preco);
  b.classList.add("ok"); b.textContent = "Adicionado!";
  setTimeout(()=>{b.classList.remove("ok"); b.textContent="Adicionar";},1000);
});
desenhaFiltros(); desenhaGrade(); carregarImagens();

/* pedido */
function adicionar(nome, preco){
  const x = pedido.find(p=>p.nome===nome && p.preco===preco);
  x ? x.qtd++ : pedido.push({nome,preco,qtd:1});
  atualizaPedido();
}
function atualizaPedido(){
  const qtd = pedido.reduce((s,p)=>s+p.qtd,0);
  const total = pedido.reduce((s,p)=>s+p.qtd*p.preco,0);
  $("#qtd").textContent = qtd;
  $("#totalPedido").textContent = brl(total);
  $("#pedido").classList.toggle("on", qtd>0);
  const linhas = pedido.map(p=>`${p.qtd}x ${p.nome} - ${brl(p.qtd*p.preco)}`).join("\n");
  const msg = `Olá! Quero fazer um pedido:\n${linhas}\nTotal: ${brl(total)}`;
  $("#zap").href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}
$("#limpar").addEventListener("click", ()=>{pedido=[];atualizaPedido();});

// "Me surpreenda": sorteia ingredientes e monta um por um
function sincChips(){ document.querySelectorAll(".chip").forEach(b=>b.setAttribute("aria-pressed", ativos.has(b.dataset.id))); }
let sorteando = false;
$("#sorte").addEventListener("click", ()=>{
  if(sorteando) return; sorteando = true;
  ativos.clear(); ultimo = null; sincChips(); desenhaPilha();
  const lista = [...EXTRAS].sort(()=>Math.random()-.5).slice(0, 3+Math.floor(Math.random()*3));
  lista.forEach((e,i)=>setTimeout(()=>{
    ativos.add(e.id); ultimo = e.id; sincChips(); desenhaPilha();
    if(i===lista.length-1) sorteando = false;
  }, 380*(i+1)));
});

// cards inclinam com o mouse
if(matchMedia("(hover:hover)").matches){
  $("#grade").addEventListener("mousemove", ev=>{
    const c = ev.target.closest(".card"); if(!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--ry", ((ev.clientX-r.left)/r.width-.5)*10+"deg");
    c.style.setProperty("--rx", (.5-(ev.clientY-r.top)/r.height)*10+"deg");
  });
  $("#grade").addEventListener("mouseout", ev=>{
    const c = ev.target.closest(".card");
    if(c && !c.contains(ev.relatedTarget)){ c.style.setProperty("--rx","0deg"); c.style.setProperty("--ry","0deg"); }
  });
}

// entrada ao rolar + contadores
function conta(el){
  const n = parseFloat(el.dataset.n), dec = el.dataset.n.includes(".")?1:0, t0 = performance.now();
  (function f(t){
    const p = Math.min((t-t0)/1400,1), v = n*(1-Math.pow(1-p,3));
    el.textContent = dec ? v.toFixed(1).replace(".",",") : Math.round(v).toLocaleString("pt-BR");
    if(p<1) requestAnimationFrame(f);
  })(t0);
}
const io = new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  e.target.classList.add("in"); io.unobserve(e.target);
  if(e.target.dataset.n) conta(e.target);
}), {threshold:.15});
document.querySelectorAll(".sec-titulo,.sobre h2,.sobre p,.contato .wrap>div").forEach(el=>{el.classList.add("rv");io.observe(el);});
document.querySelectorAll(".stats b").forEach(el=>io.observe(el));
function observaCards(){ $("#grade").querySelectorAll(".card").forEach((c,i)=>{c.classList.add("rv2");c.style.setProperty("--d",(i%4)*80+"ms");io.observe(c);}); }
const dg0 = desenhaGrade; desenhaGrade = function(){ dg0(); observaCards(); };
observaCards();
/* ===== MOLHO ESCORRENDO ===== */
let molhoId = 0;
const molhos = [];
function molho(host, base, max){
  const NS="http://www.w3.org/2000/svg", id=++molhoId;
  const W = Math.max(host.clientWidth, screen.width, screen.height), H = base+max+40;
  const gap = W>900 ? 100 : 74;
  const svg = document.createElementNS(NS,"svg");
  svg.setAttribute("class","molho"); svg.setAttribute("width",W); svg.setAttribute("height",H); svg.setAttribute("aria-hidden","true");
  let goo = `<rect x="-10" y="-10" width="${W+20}" height="${base+6}"/>`;
  let luz = `<rect x="0" y="${base*.3}" width="${W}" height="4" rx="2" fill="#FFE0B8" opacity=".1"/>`;
  for(let x=-10; x<W+20; x+=18+Math.random()*30) goo += `<circle cx="${x}" cy="${base+2}" r="${8+Math.random()*16}"/>`;
  const drips = [];
  for(let x=14, i=0; x<W; x+=gap*(.6+Math.random()*.8), i++){
    const w = 16+Math.random()*26, neck = w*.72, L = 90+Math.random()*(max-90), k = `${id}_${i}`;
    goo += `<rect id="r${k}" x="${x}" y="${base-10}" width="${neck}" height="${L}" rx="${neck/2}"/><circle id="b${k}" cx="${x+neck/2}" cy="${base+L}" r="${w*.62}"/><circle id="c${k}" cx="${x+neck/2}" cy="${base}" r="0"/>`;
    luz += `<rect id="h${k}" x="${x+neck*.18}" y="${base+4}" width="${neck*.18}" height="${L-20}" rx="${neck*.09}" fill="#FFE0B8" opacity=".6"/>`
         + `<rect id="s${k}" x="${x+neck*.66}" y="${base+4}" width="${neck*.22}" height="${L-20}" rx="${neck*.1}" fill="#C23C00" opacity=".22"/>`
         + `<ellipse id="t${k}" cx="${x+neck*.2}" cy="${base+L-4}" rx="${w*.12}" ry="${w*.2}" fill="#FFF1DC" opacity=".65"/>`;
    drips.push({k,w,L,cx:x+neck/2,Lmin:34+Math.random()*26,T:5000+Math.random()*4500,o:Math.random()*12000});
  }
  svg.innerHTML = `<defs>
    <linearGradient id="g${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${base+max}"><stop offset="0" stop-color="#FF9A1F"/><stop offset=".45" stop-color="#FF6A00"/><stop offset="1" stop-color="#FF5200"/></linearGradient>
    <filter id="f${id}" x="0" y="0" width="100%" height="100%"><feGaussianBlur in="SourceGraphic" stdDeviation="7"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"/></filter></defs>
    <g filter="url(#f${id})" fill="url(#g${id})">${goo}</g><g>${luz}</g>`;
  host.insertBefore(svg, host.firstChild);
  drips.forEach(d=>{ ["r","b","c","h","s","t"].forEach(l=>d[l]=svg.querySelector(`#${l}${d.k}`)); });
  molhos.push({svg,drips,base,host,vis:false});
}
// camada que cobre a página inteira: as gotas caem por ela até o rodapé
const camada = document.createElement("div");
camada.className = "camada";
camada.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><radialGradient id="gotaG" cx=".35" cy=".65" r=".8"><stop offset="0" stop-color="#FFB04A"/><stop offset=".55" stop-color="#FF6A00"/><stop offset="1" stop-color="#E04A00"/></radialGradient></defs></svg>';
document.body.appendChild(camada);
const GOTA = '<svg viewBox="0 0 20 28" aria-hidden="true"><path d="M10 1C10 1 2 12 2 19a8 8 0 0 0 16 0C18 12 10 1 10 1Z" fill="url(#gotaG)" stroke="#9A3300" stroke-width=".8"/><ellipse cx="6.6" cy="19.5" rx="1.5" ry="3.4" fill="#FFE6C4" opacity=".75" transform="rotate(12 6.6 19.5)"/></svg>';
const gotas = [];
let ultT = 0;

function solta(host, d, topo){
  if(gotas.length>=8) return;
  const r = host.getBoundingClientRect();
  const x = r.left+scrollX+d.cx;
  if(x > document.documentElement.clientWidth-14) return;
  const tam = 14+d.w*.5, h = tam*1.4;
  const el = document.createElement("div");
  el.className = "gota"; el.style.width = tam+"px"; el.style.height = h+"px"; el.innerHTML = GOTA;
  camada.appendChild(el);
  gotas.push({el, x, y:r.top+scrollY+topo+d.L, v:60, t:0, tam, h, alvo:$("footer").offsetTop});
}
function splash(x, y){
  const s = document.createElement("div");
  s.className = "splash"; s.style.left = x+"px"; s.style.top = y+"px";
  s.innerHTML = '<u></u><b style="--dx:-30px"></b><b style="--dx:-14px"></b><b style="--dx:16px"></b><b style="--dx:32px"></b>';
  camada.appendChild(s); setTimeout(()=>s.remove(), 800);
}
function moveGotas(dt){
  for(let i=gotas.length-1; i>=0; i--){
    const g = gotas[i];
    g.t += dt; g.v = Math.min(g.v+1900*dt, 1400); g.y += g.v*dt;
    if(g.y >= g.alvo){ splash(g.x, g.alvo); g.el.remove(); gotas.splice(i,1); continue; }
    const e = Math.min(g.t/.18,1)*.45+.55, vel = g.v/1400;
    g.el.style.transform = `translate(${g.x-g.tam/2}px,${g.y-g.h}px) scale(${e*(1-vel*.12)},${e*(1+vel*.3)})`;
  }
}

function animaMolho(t){
  const dt = Math.min((t-(ultT||t))/1000, .05); ultT = t;
  molhos.forEach(m=>{
    if(!m.vis) return;
    const topo = m.base-10;
    m.drips.forEach(d=>{
      // ciclo: o molho desce devagar, acelera, a gota se solta e cai, e recomeça
      const u = ((t+d.o)%d.T)/d.T;
      let h, g = 0;
      if(u<.78){ g = Math.pow(u/.78,1.6); h = d.Lmin+(d.L-d.Lmin)*g; }
      else if(u<.88){ const q=(u-.78)/.1; h = d.L-(d.L-d.Lmin)*(q*q*(3-2*q)); g = 1-q; }
      else h = d.Lmin;
      const fim = topo+h, hh = Math.max(h-20,0);
      d.r.setAttribute("height",h);
      d.b.setAttribute("cy",fim-d.w*.1); d.b.setAttribute("r",d.w*(.46+.2*g));
      d.h.setAttribute("height",hh); d.s.setAttribute("height",hh);
      d.t.setAttribute("cy",fim-d.w*.12);
      if(u>=.78){ if(!d.f){ d.f = true; if(Math.random()<.4) solta(m.host, d, topo); } } else d.f = false;
    });
  });
  moveGotas(dt);
  requestAnimationFrame(animaMolho);
}
molho($(".hero"), 46, 430);
molho($(".sobre"), 34, 260);
// só anima o molho de quem está visível na tela (sem medir layout a cada quadro)
const ioMolho = new IntersectionObserver(es=>es.forEach(e=>{ const m = molhos.find(x=>x.host===e.target); if(m) m.vis = e.isIntersecting; }));
molhos.forEach(m=>ioMolho.observe(m.host));
if(!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(animaMolho);
