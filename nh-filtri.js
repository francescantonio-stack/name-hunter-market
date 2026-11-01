"use strict";
// Name Hunter 3.9 - barra filtri/ordinamento condivisa (stesso file in app e sul sito).
// Si aggancia da sola a OGNI lista: ricerca, filtri (sezione, lunghezza, tipo vendita, chain, account; Moon: relics, avviato)
// e ordinamento (nome, lunghezza, prezzo, saldo NEAR, saldo $MOON, $MOON/h) con pulsante crescente/decrescente. Valori nulli sempre in fondo.
// Saldi in SOLA LETTURA: view_account (NEAR, 1e24) e ft_balance_of su aa-harvest-moon.near ($MOON, 8 decimali = 1e8). Nessuna chiave, nessuna firma.
const NHF=(()=>{
  const MOON_FT='aa-harvest-moon.near',MOON_DEC=1e8,YOCTO=1e24,TMO=8000,TENT=3,TTL=10*60e3;
  const RPC={near:'https://free.rpc.fastnear.com',testnet:'https://rpc.testnet.fastnear.com'};
  const mmk=()=>typeof MMK!=='undefined'?MMK:(typeof window!=='undefined'&&window.MMK)||null;
  // ---------- logica pura (testata in Node) ----------
  const norm=n=>String(n??'').replace(/\s+/g,'').toLowerCase();
  const chainOf=n=>{n=norm(n);return /\.(sol|sns)$/.test(n)?'sol':/\.(near|testnet)$/.test(n)||/^[a-z0-9_-]+$/.test(n)?'near':'altri'};
  const label=n=>norm(n).replace(/\.(near|testnet|sol|sns)$/,'');
  const lenOf=n=>label(n).length;
  const LEN=[['','Lunghezza: tutte'],['1-3','1–3'],['4','4'],['5','5'],['6-8','6–8'],['9+','9+']];
  const lenOk=(l,f)=>!f||(f==='1-3'?l<=3:f==='6-8'?l>=6&&l<=8:f==='9+'?l>=9:l===+f);
  const tipoOf=(n,hint)=>{const M=mmk();if(M){if(M.isSoloOfferta(n)||M.offOnly(n))return 'off';if(M.tipo(n)==='vend')return 'vend'}return hint||''};
  const parseNum=t=>{if(t==null)return null;if(typeof t==='number')return Number.isFinite(t)?t:null;const m=String(t).replace(/\s/g,'').match(/-?[\d.,]+/);if(!m)return null;
    let s=m[0];if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');const v=parseFloat(s);return Number.isFinite(v)?v:null};
  const moonDaRaw=r=>{try{return Number(BigInt(String(r)))/MOON_DEC}catch{return null}};
  const nearDaRaw=r=>{try{const b=BigInt(String(r));return Number(b/10n**18n)/1e6}catch{return null}};
  const S0=()=>({q:'',sez:'',len:'',tipo:'',chain:'',acc:'',rel:'',avv:'',sort:'',dir:1});
  function filtra(items,s){const q=norm(s.q);return items.filter(x=>(!q||norm(x.n).includes(q)||norm(x.acc).includes(q))&&(!s.sez||x.sez===s.sez)&&lenOk(lenOf(x.n),s.len)
    &&(!s.tipo||x.tipo===s.tipo)&&(!s.chain||x.chain===s.chain)&&(!s.acc||x.acc===s.acc)&&(!s.rel||(s.rel==='si'?x.rel>0:!(x.rel>0)))&&(!s.avv||(s.avv==='si'?x.avv===true:x.avv===false)))}
  const KEY={pag:x=>x.pag,nome:x=>label(x.n),len:x=>lenOf(x.n),prezzo:x=>x.pr,near:x=>x.near,moon:x=>x.moon,prod:x=>x.prod,'':x=>x.i};
  // dir 1 = crescente, -1 = decrescente; null/undefined sempre in fondo in entrambe le direzioni; a parita' ordine originale
  function ordina(items,sort,dir=1){const k=KEY[sort]||KEY[''];return items.slice().sort((a,b)=>{const x=k(a),y=k(b),nx=x==null||x!==x,ny=y==null||y!==y;
    if(nx||ny)return nx&&ny?a.i-b.i:nx?1:-1;const c=typeof x==='string'?x.localeCompare(y,'it',{numeric:true}):x-y;return c?c*dir:(a.i-b.i)})}
  const applica=(items,s)=>ordina(filtra(items,s),s.sort,s.dir);
  const SORTS=(moon,rel)=>[['','Ordine: originale'],['nome','Nome'],['len','Lunghezza'],['prezzo','Prezzo'],['near','Saldo NEAR'],['moon','Saldo $MOON'],...(moon?[['prod','$MOON/h']]:[]),...(rel?[['pag','Prezzo pagato']]:[])];
  // ---------- saldi (sola lettura, cache) ----------
  const store=(()=>{try{return typeof localStorage!=='undefined'?localStorage:null}catch{return null}})();
  let BAL={};try{BAL=JSON.parse(store?.getItem('nhf-bal')||'{}')||{}}catch{BAL={}}
  const salvaBal=()=>{try{store?.setItem('nhf-bal',JSON.stringify(BAL))}catch{}};
  const fetchFn=()=>NHF._fetch||(typeof fetch!=='undefined'?fetch:null);
  const tmo=(p,ms)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),ms))]);
  const b64=s=>typeof btoa!=='undefined'?btoa(s):Buffer.from(s).toString('base64');
  const dec=a=>{const u=new Uint8Array(a);return typeof TextDecoder!=='undefined'?new TextDecoder().decode(u):Buffer.from(u).toString()};
  async function rpc(url,params){let err;for(let t=0;t<TENT;t++){try{const r=await tmo(fetchFn()(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'query',params:{finality:'final',...params}})}).then(r=>r.json()),NHF.TMO);
        const e=r.error||r.result?.error;if(e){const m=JSON.stringify(e);if(/UNKNOWN_ACCOUNT|does not exist|not registered|No account/i.test(m))return {nope:true};throw new Error(m.slice(0,120))}return r.result}
      catch(e){err=e;if(t<TENT-1)await new Promise(r=>setTimeout(r,NHF.PAUSA*(t+1)))}}throw err}
  const acc=n=>{n=norm(n);return /\.(near|testnet)$/.test(n)?n:null};
  const fresco=(e)=>e&&Date.now()-e.t<TTL;
  const IN={};
  async function saldo(n){n=acc(n);if(!n)return null;if(fresco(BAL[n]))return BAL[n];if(IN[n])return IN[n];
    IN[n]=(async()=>{const net=n.endsWith('.testnet')?'testnet':'near',o={t:Date.now(),near:null,moon:null};
      try{const r=await rpc(RPC[net],{request_type:'view_account',account_id:n});if(r&&!r.nope)o.near=nearDaRaw(r.amount)}catch{o.err=1}
      if(net==='near')try{const r=await rpc(RPC.near,{request_type:'call_function',account_id:MOON_FT,method_name:'ft_balance_of',args_base64:b64(JSON.stringify({account_id:n}))});
        if(r&&!r.nope&&r.result)o.moon=moonDaRaw(JSON.parse(dec(r.result)))}catch{o.err=1}
      if(!o.err){BAL[n]=o;salvaBal()}delete IN[n];return o})();return IN[n]}
  async function saldi(nomi,conc=2){const q=[...new Set(nomi.map(acc).filter(Boolean))].filter(n=>!fresco(BAL[n])).slice(0,300);
    await Promise.all(Array.from({length:conc},async()=>{while(q.length)await saldo(q.shift())}))}
  const fm=(x,d)=>(+x).toLocaleString('it-IT',{maximumFractionDigits:d});
  const balTxt=n=>{const b=BAL[acc(n)];return 'Saldo: '+(b&&b.near!=null?fm(b.near,3)+' NEAR':'— NEAR')+' · '+(b&&b.moon!=null?fm(b.moon,5)+' $MOON':'— $MOON')};
  const balHTML=n=>`<div class="nhf-bal" data-nhfbal="${String(acc(n)||'').replace(/[^a-z0-9._-]/g,'')}">${balTxt(n)}</div>`;
  // ---------- DOM ----------
  let ST={};try{ST=JSON.parse(store?.getItem('nhf-st')||'{}')||{}}catch{ST={}}
  const salvaST=()=>{try{store?.setItem('nhf-st',JSON.stringify(ST))}catch{}};
  const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CONT='[data-nhf],.card.list,ul.list';
  const itemsDi=c=>c.hasAttribute('data-nhf')&&c.getAttribute('data-nhf')?[...c.querySelectorAll('.mmk,[data-fn]')].filter(x=>!x.parentElement.closest('.mmk')):[...c.children].filter(x=>x.matches('.item,li'));
  // 3.9.1: la barra va SOLO sulle liste di nomi (non su livelli, gear, statistiche, dettagli)
  const NOMELIKE=/^[a-z0-9_-]+(\.[a-z0-9_-]+)+$/;
  function listaNomi(c){if(c.hasAttribute('data-nhfno'))return false;if(c.hasAttribute('data-nhf')||c.dataset.nhfext||c.dataset.nhfrel||c.classList.contains('nhf-vuota')||c.hasAttribute('data-nhfnomi'))return true;
    const its=itemsDi(c);if(!its.length)return false;const ok=its.filter(el=>el.dataset.fn||NOMELIKE.test(norm(el.querySelector(':scope .nm, .k, .acct')?.textContent||''))).length;return ok>0&&ok>=its.length/2}
  const sezDi=(c,el)=>{if(el.dataset.fsez)return el.dataset.fsez;let p=el.closest('[data-fsezc]');if(p)return p.dataset.fsezc;let n=c;while(n){let s=n.previousElementSibling;while(s){if(/^H[1-4]$/.test(s.tagName))return s.textContent.replace(/\s*\(.*$/,'').replace(/\s*·.*$/,'').replace(/(Vedi tutti|Gestisci)$/,'').trim();s=s.previousElementSibling}n=n.parentElement;if(n&&n.id)break}
    const sg=document.querySelector('.seg [aria-selected="true"]');return sg?sg.textContent.trim():''};
  function leggiItem(c,el,i){const d=el.dataset;const nm=d.fn||(el.querySelector(':scope > .k, .k, .nm, .acct')?.textContent)||el.textContent.split('·')[0];
    const n=norm(nm);const e=(el.querySelector('.e')?.textContent||el.querySelector('.meta')?.textContent||'');const am=d.facc||(e.match(/[a-z0-9_.-]+\.near\b/)||[])[0]||'';
    const buy=!!el.querySelector('[data-act="buy"],[data-buy],.btn.buy');
    const pr=d.fpr!=null?(d.fpr===''?null:+d.fpr):(()=>{const v=el.querySelector(':scope > .r .v, .pn');return v&&/Ⓝ/.test(v.textContent)?parseNum(v.textContent):null})();
    const b=BAL[acc(n)];
    return {el,i,n,acc:am,sez:sezDi(c,el),tipo:d.ftipo||tipoOf(n,buy?'vend':''),chain:d.fchain||chainOf(n),pr,near:b?b.near:null,moon:b?b.moon:null,
      prod:d.fprod!=null&&d.fprod!==''?+d.fprod:null,pag:d.fpag!=null&&d.fpag!==''?+d.fpag:null,rel:d.frel!=null?+d.frel:null,avv:d.favv==='1'?true:d.favv==='0'?false:null}}
  const chiaveDi=(c,idx)=>{if(c.dataset.nhfext)return 'ext:'+c.dataset.nhfext;const pane=c.closest('[id]');const h=(typeof location!=='undefined'?location.hash.replace(/[?&]?q=[^&]*/,''):'')+'|'+(location?.pathname||'');
    const seg=document.querySelector('.seg [aria-selected="true"]')?.textContent||'';return c.getAttribute('data-nhf')||[pane?.id||'',h,seg,sezDi(c,c)||'',idx].join('|')};
  const opt=(v,l,cur)=>`<option value="${esc(v)}"${String(cur)===String(v)?' selected':''}>${esc(l)}</option>`;
  const sel=(k,lab,opts,cur)=>`<select data-nhfk="${k}" aria-label="${esc(lab)}">${opts.map(([v,l])=>opt(v,l,cur)).join('')}</select>`;
  function barHTML(key,its,s,moon,rel){const uniq=f=>[...new Set(its.map(f).filter(Boolean))].sort();
    const sez=uniq(x=>x.sez),ch=uniq(x=>x.chain),ac=uniq(x=>x.acc);
    return `<div class="nhf-row"><input type="search" data-nhfk="q" placeholder="Cerca per nome…" value="${esc(s.q)}" autocomplete="off" spellcheck="false" aria-label="Cerca per nome">
      ${sel('sort','Ordina per',SORTS(moon,rel),s.sort)}<button type="button" class="nhf-dir" data-nhfdir="1" aria-label="Direzione: ${s.dir<0?'decrescente':'crescente'}" title="Inverti ordine">${s.dir<0?'↓ decrescente':'↑ crescente'}</button></div>
      <details class="nhf-more"${Object.entries(s).some(([k,v])=>!['q','sort','dir'].includes(k)&&v)?' open':''}><summary>Filtri</summary><div class="nhf-row">
      ${sel('sez','Sezione',[['','Sezione: tutte'],...sez.map(x=>[x,x])],s.sez)}${sel('len','Lunghezza',LEN,s.len)}
      ${sel('tipo','Tipo di vendita',[['','Vendita: tutte'],['vend','Vendita completa'],['off','Solo offerta']],s.tipo)}
      ${sel('chain','Chain',[['','Chain: tutte'],...[...new Set(['near','sol','altri',...ch])].map(x=>[x,x==='near'?'NEAR':x==='sol'?'Solana':'Altri domini'])],s.chain)}
      ${sel('acc','Account',[['','Account: tutti'],...ac.map(x=>[x,x])],s.acc)}
      ${moon?sel('rel','Relics',[['','Relics: tutti'],['si','Con relics'],['no','Senza relics']],s.rel)+sel('avv','Moon avviato',[['','Moon avviato: tutti'],['si','Avviato: sì'],['no','Avviato: no']],s.avv):''}
      </div></details><div class="nhf-count" aria-live="polite"></div>`}
  let busy=false,obs=null,root=null,carica=0,FOC=null,giri=0;
  const EXT={};const extDi=c=>c.dataset&&c.dataset.nhfext&&EXT[c.dataset.nhfext]||null;
  // lista "esterna": i dati li filtra/ordina chi la disegna (stessa logica: NHF.applica), qui solo barra e conteggio
  function appl(c){const bar=c._nhfbar;if(!bar)return;const s=ST[bar.dataset.key]||S0();const ex=extDi(c);
    if(ex){const n=ex.conta?ex.conta():null;const cnt=bar.querySelector('.nhf-count');if(cnt&&n)cnt.textContent=n[0]+' di '+n[1];return}const its=itemsDi(c).map((el,i)=>{el._nhfi??=i;return leggiItem(c,el,el._nhfi)});
    const vis=applica(its,s),set=new Set(vis.map(x=>x.el));its.forEach(x=>x.el.classList.toggle('nhf-hide',!set.has(x.el)));
    // riordino dentro lo stesso contenitore padre (le sezioni restano al loro posto)
    // gruppo = stesso padre + stessa intestazione (h2/h3) precedente: le sezioni (es. Vendibili / Solo offerte) non si mescolano
    const testa=e=>{let x=e.previousElementSibling;while(x&&!/^H[1-4]$/.test(x.tagName))x=x.previousElementSibling;return x};
    const per=new Map();vis.forEach(x=>{const p=x.el.parentElement,h=testa(x.el),k=p;if(!per.has(k))per.set(k,new Map());const g=per.get(k);if(!g.has(h))g.set(h,[]);g.get(h).push(x.el)});
    per.forEach(G=>G.forEach(L=>{const dom=L.slice().sort((a,b)=>a.compareDocumentPosition(b)&4?-1:1);if(dom.every((e,i)=>e===L[i]))return;
      const ph=document.createComment('nhf');dom[0].before(ph);let ref=ph;L.forEach(e=>{ref.after(e);ref=e});ph.remove()}));
    const cnt=bar.querySelector('.nhf-count');if(cnt)cnt.textContent=its.length?vis.length+' di '+its.length:'Lista vuota';
    if((s.sort==='near'||s.sort==='moon')&&its.some(x=>acc(x.n)&&!fresco(BAL[acc(x.n)]))){const k=bar.dataset.key;if(c._nhfload!==k){c._nhfload=k;saldi(its.map(x=>x.n)).then(()=>{c._nhfload=null;agg()})}}}
  function monta(r){busy=true;try{const C=[...r.querySelectorAll(CONT)].filter(c=>!c.closest('.mmk')&&!c.parentElement.closest('[data-nhf]:not([data-nhf=""])')&&!c.closest('.nhf-bar'));
    // barre rimaste su liste che non sono di nomi: via
    [...r.querySelectorAll('.nhf-bar')].forEach(b=>{const n=b.nextElementSibling;if(!n||!C.includes(n)||!listaNomi(n))b.remove()});
    C.forEach((c,idx)=>{if(!listaNomi(c))return;const key=chiaveDi(c,idx),moon=c.getAttribute('data-nhf')==='moon';let bar=c.previousElementSibling;
      if(!(bar&&bar.classList.contains('nhf-bar'))){bar=document.createElement('div');bar.className='nhf-bar';c.parentNode.insertBefore(bar,c);bar._new=1}
      if(bar.dataset.key!==key||bar._new){const s=ST[key]||(ST[key]=S0());const ex=extDi(c);const its=ex?ex.items():itemsDi(c).map((el,i)=>leggiItem(c,el,i));bar.dataset.key=key;bar.innerHTML=barHTML(key,its,s,moon,c.dataset.nhfrel==='1');bar._new=0;
        // se la lista e' stata ridisegnata mentre si scriveva nella ricerca, il focus torna al suo posto
        if(FOC&&FOC.key===key&&(!document.activeElement||document.activeElement===document.body)){const f=bar.querySelector(`[data-nhfk="${FOC.k}"]`);if(f){f.focus({preventScroll:true});try{if(f.setSelectionRange)f.setSelectionRange(f.value.length,f.value.length)}catch{}}}}
      c._nhfbar=bar;appl(c)});
    r.querySelectorAll('[data-nhfbal]').forEach(e=>{e.textContent=balTxt(e.dataset.nhfbal)});
    const nb=[...r.querySelectorAll('[data-nhfbal]')].map(e=>e.dataset.nhfbal).filter(n=>!fresco(BAL[n]));if(nb.length&&!carica&&giri<6){carica=1;giri++;saldi(nb).then(()=>{carica=0;agg();
      // RPC pubblica con "troppe richieste" (429): i saldi mancanti si riprovano piu' tardi, al massimo 6 giri
      if(nb.some(n=>!fresco(BAL[n])))setTimeout(agg,8000)})}
  }finally{obs?.takeRecords();busy=false}}
  const agg=()=>{if(root)monta(root)};
  function evento(e){const t=e.target;const bar=t.closest?.('.nhf-bar');if(!bar)return;const k=t.dataset.nhfk,key=bar.dataset.key,s=ST[key]||(ST[key]=S0());
    if(t.dataset.nhfdir){s.dir=s.dir<0?1:-1;t.textContent=s.dir<0?'↓ decrescente':'↑ crescente';t.setAttribute('aria-label','Direzione: '+(s.dir<0?'decrescente':'crescente'))}else if(k)s[k]=t.value;else return;
    salvaST();const c=bar.nextElementSibling;const ex=c&&extDi(c);if(ex){ex.cambia(s);return}if(c){busy=true;try{appl(c)}finally{obs?.takeRecords();busy=false}}}
  function avvia(r){if(typeof document==='undefined')return;root=r||document.body;['input','change'].forEach(ev=>root.addEventListener(ev,evento));root.addEventListener('focusin',e=>{const b=e.target.closest?.('.nhf-bar');FOC=b&&e.target.dataset.nhfk?{key:b.dataset.key,k:e.target.dataset.nhfk}:null});root.addEventListener('click',e=>{if(e.target.closest?.('[data-nhfdir]'))evento({target:e.target.closest('[data-nhfdir]')})});
    let tm=null;obs=new MutationObserver(()=>{if(busy)return;clearTimeout(tm);tm=setTimeout(agg,30)});obs.observe(root,{childList:true,subtree:true});agg()}
  const stato=key=>ST[key]||(ST[key]=S0());
  return {EXT,stato,item:(n,o={})=>({n:norm(n),acc:'',sez:'',chain:chainOf(n),pr:null,prod:null,rel:null,avv:null,...o,tipo:tipoOf(n,o.tipo),near:BAL[acc(n)]?.near??null,moon:BAL[acc(n)]?.moon??null}),fresco:n=>fresco(BAL[acc(n)]),chainOf,lenOf,label,tipoOf,parseNum,moonDaRaw,nearDaRaw,filtra,ordina,applica,listaNomi,NOMELIKE,SORTS,S0,saldo,saldi,balTxt,balHTML,BAL,monta,avvia,MOON_FT,MOON_DEC,TMO,PAUSA:1200,_fetch:null,ST}})();
if(typeof module!=='undefined')module.exports=NHF;
else if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>NHF.avvia());else NHF.avvia()}
