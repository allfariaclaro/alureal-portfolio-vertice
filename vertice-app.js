const D=window.VERTICE_DATA||{};const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>[...r.querySelectorAll(s)];const FAV='vertice-favs-v2',COMP='vertice-compare-v1',THEME='vertice-theme';const storageGet=k=>{try{return localStorage.getItem(k)}catch{return null}};const storageSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch{return false}};const read=(k,f)=>{try{const v=JSON.parse(storageGet(k));if(Array.isArray(f))return Array.isArray(v)?v:f;return v??f}catch{return f}};const write=(k,v)=>storageSet(k,JSON.stringify(v));const money=v=>'R$ '+Number(v||0).toLocaleString('pt-BR');
function theme(v){const next=v==='dark'?'dark':'light';document.documentElement.dataset.theme=next;storageSet(THEME,next);$$('[data-theme-toggle]').forEach(b=>{b.textContent=next==='dark'?'☀':'☾';b.setAttribute('aria-label',next==='dark'?'Ativar modo claro':'Ativar modo escuro')})}
function shell(){const h=$('[data-shell-header]');if(h)h.innerHTML='<header class="topbar"><div class="wrap topbar-row"><a class="logo" href="index.html">VÉRT<i>I</i>CE</a><nav class="nav"><a href="imoveis.html">Imóveis</a><a href="bairros.html">Bairros</a><a href="comparar.html">Comparar</a><a href="financiamento.html">Simular</a></nav><div class="actions"><button class="icon-btn" data-theme-toggle aria-label="Ativar modo escuro">☾</button><a class="icon-btn" href="favoritos.html">♡</a><a class="secondary" href="consultoria.html">Consultoria</a></div></div></header>';const f=$('[data-shell-footer]');if(f)f.innerHTML='<nav class="mobile-nav"><a href="index.html">⌂<span>Início</span></a><a href="imoveis.html">⌕<span>Imóveis</span></a><a href="favoritos.html">♡<span>Salvos</span></a><a href="comparar.html">⇄<span>Comparar</span></a></nav><footer class="app-footer"><div class="wrap footer-grid"><div><a class="logo" href="index.html">VÉRT<i>I</i>CE</a><p>Portal imobiliário conceitual desenvolvido pela Alureal.</p></div><div><strong>Descobrir</strong><p><a href="imoveis.html">Imóveis</a><br><a href="bairros.html">Bairros</a><br><a href="favoritos.html">Favoritos</a></p></div><div><strong>Decidir</strong><p><a href="comparar.html">Comparar</a><br><a href="financiamento.html">Financiamento</a><br><a href="consultoria.html">Consultoria</a></p></div></div></footer>'}
function initTheme(){const raw=storageGet(THEME);const stored=raw==='dark'||raw==='light'?raw:null;let system='light';try{system=window.matchMedia?.('(prefers-color-scheme:dark)').matches?'dark':'light'}catch{}theme(stored||system);$$('[data-theme-toggle]').forEach(b=>b.onclick=()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark'))}
const favs=()=>read(FAV,[]),comp=()=>read(COMP,[]);

// The URL is the single persistent source of listing criteria.
const FILTER_KEYS=['bairro','tipo','precoMax','quartos','q'];
function parsePrice(raw){
  let value=String(raw||'').trim().toLowerCase().replace(/^até\s*/,'').replace(/^r\$\s*/,'').replace(/\s/g,'');
  if(!value)return '';
  const unit=value.match(/(mi|milhão|milhões|mil)$/);
  if(unit)value=value.slice(0,-unit[0].length);
  if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(value))value=value.replace(/\./g,'').replace(',','.');
  else if(/^\d+(,\d{1,2})?$/.test(value))value=value.replace(',','.');
  else if(!(unit&&/^\d+(\.\d+)?$/.test(value)))return '';
  const number=Number(value)*(unit?(unit[0]==='mil'?1000:1000000):1);
  return Number.isSafeInteger(number)&&number>=0?String(number):'';
}
function filterState(query){
  const q=query instanceof URLSearchParams?query:new URLSearchParams(query);
  const allowed=(key,values)=>values.includes(q.get(key))?q.get(key):'';
  return {bairro:allowed('bairro',[...new Set((D.properties||[]).map(p=>p.neighborhood))]),tipo:allowed('tipo',[...new Set((D.properties||[]).map(p=>p.type))]),precoMax:parsePrice(q.get('precoMax')),quartos:allowed('quartos',['2','3','4']),q:(q.get('q')||'').trim().slice(0,200)};
}
function filterQuery(state){const q=new URLSearchParams();FILTER_KEYS.forEach(k=>{if(state[k]!==''&&state[k]!=null)q.set(k,state[k])});return q.toString()}
function listingUrl(state){const q=filterQuery(state);return 'imoveis.html'+(q?'?'+q:'')}
function safeListingReturn(value){
  if(!/^imoveis\.html(?:\?[^#]*)?$/.test(value||'')||/[\\\r\n]/.test(value))return 'imoveis.html';
  return listingUrl(filterState(value.split('?')[1]||''));
}
const fold=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filteredProperties(state){return (D.properties||[]).filter(p=>(!state.bairro||p.neighborhood===state.bairro)&&(!state.tipo||p.type===state.tipo)&&(state.precoMax===''||p.price<=Number(state.precoMax))&&(!state.quartos||p.beds>=Number(state.quartos))&&(!state.q||fold([p.title,p.desc,p.neighborhood,p.type,...p.tags].join(' ')).includes(fold(state.q))))}
function detailUrl(id){const q=new URLSearchParams({id});if($('[data-listing]'))q.set('retorno',listingUrl(filterState(location.search)));return 'imovel.html?'+q.toString()}
function syncCardButtons(){
  $$('[data-fav]').forEach(b=>{const active=favs().includes(b.dataset.fav);b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));b.textContent=b.hasAttribute('data-fav-label')?(active?'♥ Salvo':'♡ Salvar'):(active?'♥':'♡')});
  $$('[data-compare]').forEach(b=>{const active=comp().includes(b.dataset.compare);b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}

function card(p){const f=favs().includes(p.id),c=comp().includes(p.id);return '<article class="property-card" data-property="'+p.id+'"><div class="property-photo"><a href="'+detailUrl(p.id)+'"><img src="'+p.images[0]+'" alt="'+p.title+'" loading="lazy"></a><div class="badges">'+(p.featured?'<span class="badge">Destaque</span>':'')+'<span class="badge">'+p.neighborhood+'</span></div><button class="compare-btn '+(c?'active':'')+'" data-compare="'+p.id+'">⇄</button><button class="fav-btn '+(f?'active':'')+'" data-fav="'+p.id+'">'+(f?'♥':'♡')+'</button></div><div class="property-body"><h3><a href="'+detailUrl(p.id)+'">'+p.title+'</a></h3><p>'+p.desc+'</p><div class="property-meta"><span>'+p.area+' m²</span><span>'+p.beds+' quartos</span><span>'+p.parking+' vagas</span></div><div class="property-price">'+money(p.price)+'</div></div></article>'}
function renderProps(){const g=$('[data-properties]');if(g){let list=D.properties||[];const type=g.dataset.type,hood=g.dataset.hood;if(type)list=list.filter(p=>p.type===type);if(hood)list=list.filter(p=>p.neighborhood===hood);g.innerHTML=list.map(card).join('');bindCards()}}
function bindCards(){
  $$('[data-fav]').forEach(b=>b.onclick=e=>{e.preventDefault();let f=favs();f=f.includes(b.dataset.fav)?f.filter(x=>x!==b.dataset.fav):[...f,b.dataset.fav];write(FAV,f);renderFavorites();syncCardButtons()});
  $$('[data-compare]').forEach(b=>b.onclick=e=>{e.preventDefault();let c=comp();const id=b.dataset.compare;if(c.includes(id))c=c.filter(x=>x!==id);else if(c.length<3)c=[...c,id];else alert('Compare até 3 imóveis.');write(COMP,c);syncCardButtons();updateCompareBar()});
  syncCardButtons();
}
function updateCompareBar(){const b=$('[data-compare-bar]');if(!b)return;const c=comp();b.classList.toggle('show',c.length>0);$('[data-compare-count]').textContent=c.length}
function renderNeighborhoods(){const g=$('[data-neighborhoods]');if(g)g.innerHTML=(D.neighborhoods||[]).map(n=>'<a class="neighborhood" href="imoveis.html?bairro='+encodeURIComponent(n.name)+'"><img src="'+n.image+'" alt="'+n.name+'"><div class="neighborhood-body"><h3>'+n.name+'</h3><p>'+n.desc+'</p><span class="neighborhood-score">Índice de conveniência '+n.score+'</span></div></a>').join('')}
function initSearch(){const f=$('[data-search-form]');if(f)f.onsubmit=e=>{e.preventDefault();location.href=listingUrl(filterState(new URLSearchParams(new FormData(f))))}}
function renderListing(syncInputs=true){
  const g=$('[data-listing]');if(!g)return;
  const state=filterState(location.search),list=filteredProperties(state);
  const form=$('[data-filter-form]');if(form&&syncInputs)FILTER_KEYS.forEach(k=>{form.elements[k].value=state[k]});
  g.innerHTML=list.length?list.map(card).join(''):'<p role="status">Nenhum imóvel encontrado. Ajuste os filtros ou use “Limpar filtros”.</p>';
  $('[data-result-count]').textContent=list.length+' imóveis encontrados';bindCards();
}
function initFilters(){
  const form=$('[data-filter-form]');if(!form)return;
  const apply=()=>{const state=filterState(new URLSearchParams(new FormData(form)));const url=listingUrl(state);if(url!==location.pathname.split('/').pop()+location.search)history.pushState(null,'',url);renderListing(false)};
  form.oninput=e=>{if(e.target.tagName==='INPUT')apply()};form.onchange=e=>{if(e.target.tagName==='SELECT')apply()};form.onsubmit=e=>{e.preventDefault();apply()};
  $('[data-clear-filters]').onclick=()=>{history.pushState(null,'','imoveis.html');renderListing()};
  window.addEventListener('popstate',()=>renderListing());
}
function renderDetail(){const root=$('[data-detail]');if(!root)return;const back=$('[data-listing-return]');if(back)back.href=safeListingReturn(new URLSearchParams(location.search).get('retorno'));const id=new URLSearchParams(location.search).get('id')||D.properties[0].id;const p=D.properties.find(x=>x.id===id)||D.properties[0];document.title='VÉRTICE — '+p.title;root.innerHTML='<div class="detail-grid"><div><div class="gallery"><div class="gallery-main"><img src="'+p.images[0]+'" alt="'+p.title+'"></div><div class="gallery-side">'+p.images.slice(1,3).map(i=>'<div><img src="'+i+'" alt=""></div>').join('')+'</div></div><div class="facts"><div class="fact"><strong>'+p.area+'</strong><span>m²</span></div><div class="fact"><strong>'+p.beds+'</strong><span>quartos</span></div><div class="fact"><strong>'+p.baths+'</strong><span>banheiros</span></div><div class="fact"><strong>'+p.parking+'</strong><span>vagas</span></div></div><section class="section"><span class="eyebrow">Sobre o imóvel</span><h2>'+p.desc+'</h2><div class="tag-row">'+p.tags.map(t=>'<span class="tag">'+t+'</span>').join('')+'</div></section></div><aside class="detail-card"><span class="eyebrow">'+p.neighborhood+' · '+p.type+'</span><h1>'+p.title+'</h1><div class="property-price">'+money(p.price)+'</div><p>Condomínio '+(p.condo?money(p.condo)+'/mês':'não aplicável')+'<br>IPTU '+money(p.iptu)+'/ano</p><button class="primary" style="width:100%" onclick="location.href=\'consultoria.html?imovel='+p.id+'\'">Agendar visita</button><button class="secondary" style="width:100%;margin-top:8px" data-fav-label data-fav="'+p.id+'">'+(favs().includes(p.id)?'♥ Salvo':'♡ Salvar')+'</button><button class="secondary" style="width:100%;margin-top:8px" data-compare="'+p.id+'">⇄ Comparar</button></aside></div>';bindCards()}
function renderFavorites(){const g=$('[data-favorites]');if(g){const list=D.properties.filter(p=>favs().includes(p.id));g.innerHTML=list.length?list.map(card).join(''):'<p>Nenhum imóvel salvo ainda.</p>';bindCards()}}
function renderCompare(){const root=$('[data-compare-table]');if(!root)return;const list=D.properties.filter(p=>comp().includes(p.id));if(!list.length){root.innerHTML='<p style="padding:20px">Adicione imóveis usando o botão ⇄.</p>';return}const rows=[['Preço',...list.map(p=>money(p.price))],['Área',...list.map(p=>p.area+' m²')],['Quartos',...list.map(p=>p.beds)],['Vagas',...list.map(p=>p.parking)],['Condomínio',...list.map(p=>p.condo?money(p.condo):'—')],['Bairro',...list.map(p=>p.neighborhood)]];root.innerHTML='<div class="compare-row"><strong>Característica</strong>'+list.map(p=>'<strong>'+p.title+'</strong>').join('')+'</div>'+rows.map(r=>'<div class="compare-row">'+r.map((x,i)=>i?'<span>'+x+'</span>':'<strong>'+x+'</strong>').join('')+'</div>').join('')}
function initCalc(){const f=$('[data-calculator]');if(!f)return;const run=()=>{const price=Number($('[name=price]',f).value)||0,down=Number($('[name=down]',f).value)||0,months=Number($('[name=months]',f).value)||360,rate=Number($('[name=rate]',f).value)||10.5;const principal=Math.max(0,price-down);const m=Math.pow(1+rate/100,1/12)-1;const payment=m?principal*m*Math.pow(1+m,months)/(Math.pow(1+m,months)-1):principal/months;$('[data-payment]').textContent=money(payment)+'/mês';};f.oninput=run;run()}
const safeRun=(name,fn)=>{try{fn()}catch(error){console.error('[VERTICE] '+name+' failed',error)}};
function init(){safeRun('shell',shell);safeRun('theme',initTheme);safeRun('properties',renderProps);safeRun('neighborhoods',renderNeighborhoods);safeRun('search',initSearch);safeRun('listing',renderListing);safeRun('filters',initFilters);safeRun('detail',renderDetail);safeRun('favorites',renderFavorites);safeRun('compare',renderCompare);safeRun('compare-bar',updateCompareBar);safeRun('calculator',initCalc)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();