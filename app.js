(function(){
'use strict';
var D=window.EON, $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var main=$('#main');
var BY={};D.chars.forEach(function(c){BY[c.slug]=c});
var SG={};D.sagas.forEach(function(s){SG[s.id]=s});
var PL={};D.places.forEach(function(p){PL[p.id]=p});
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function inline(s){
  s=esc(s);
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>');
  s=s.replace(/\[\[([a-z0-9:-]+)(?:\|([^\]]+))?\]\]/g,function(m,k,t){
    if(BY[k])return '<a href="#/c/'+k+'">'+(t||BY[k].short)+'</a>';
    if(k.indexOf('place:')===0&&PL[k.slice(6)])return '<a href="#/place/'+k.slice(6)+'">'+(t||PL[k.slice(6)].name)+'</a>';
    if(k.indexOf('saga:')===0&&SG[k.slice(5)])return '<a href="#/saga/'+k.slice(5)+'">'+(t||SG[k.slice(5)].title)+'</a>';
    return t||k;});
  return s;
}
function md(s){return String(s||'').split(/\n\s*\n/).filter(Boolean).map(function(p){return '<p>'+inline(p.trim())+'</p>'}).join('')}
function plain(s){return String(s||'').replace(/\[\[[a-z0-9:-]+\|([^\]]+)\]\]/g,'$1').replace(/\[\[([a-z0-9:-]+)\]\]/g,function(m,k){return BY[k]?BY[k].short:(PL[k.replace('place:','')]?PL[k.replace('place:','')].name:k)}).replace(/\*+/g,'')}
function tierOf(c){return D.tiers[c.tier]}
function avg(c){var v=0,n=0;for(var k in c.stats){v+=c.stats[k];n++}return Math.round(v/n*10)/10}
function nPowers(c){var n=0;c.powers.forEach(function(g){n+=g.items.length});return n}
function sagaTags(ids){return ids.map(function(i){return SG[i]?'<a class="pill g" href="#/saga/'+i+'">'+esc(SG[i].title)+'</a>':''}).join('')}
function img(c,sz){return 'images/characters/'+c.img+(sz==='t'?'-thumb':'')+'.jpg'}

/* ---------- views ---------- */
function card(c){
  return '<a class="card" href="#/c/'+c.slug+'" style="--accent:'+c.color+'"><img loading="lazy" src="'+img(c)+'" srcset="'+img(c,'t')+' 202w, '+img(c)+' 606w" sizes="(max-width:640px) 46vw, 260px" alt="Portrait of '+esc(c.name)+'"><span class="tr">'+esc(tierOf(c).name)+'</span><span class="ov"><div class="nm">'+esc(c.short)+'</div><div class="tg">'+esc(c.tagline)+'</div></span></a>';
}
var FILTERS=[['all','All'],['sword','Swordswomen'],['mage','Spellcasters'],['divine','Divine & Sacred'],['leader','Leaders & Rulers'],['eon','Bonded to Eon']];
function filterGrid(host,state){
  var list=D.chars.filter(function(c){
    if(state.f!=='all'&&c.tags.indexOf(state.f)<0)return false;
    if(state.q){var t=(c.name+' '+c.tagline+' '+c.aliases.join(' ')+' '+c.race+' '+c.origin+' '+c.role+' '+c.tags.join(' ')).toLowerCase();if(t.indexOf(state.q.toLowerCase())<0)return false}
    return true;});
  $('.grid',host).innerHTML=list.length?list.map(card).join(''):'<div class="empty" style="grid-column:1/-1">No character matches that filter. Try another one.</div>';
}
function gridBlock(){
  var h='<div class="gridwrap"><div class="filters"><input class="fq" type="search" placeholder="Filter the seven by name, role, power…" aria-label="Filter characters"><div class="chips">'+FILTERS.map(function(f,i){return '<button class="chip'+(i?'':' on')+'" data-f="'+f[0]+'">'+f[1]+'</button>'}).join('')+'</div></div><div class="grid"></div></div>';
  return h;
}
function wireGrid(){
  var host=$('.gridwrap'),st={f:'all',q:''};if(!host)return;
  filterGrid(host,st);
  $('.fq',host).addEventListener('input',function(e){st.q=e.target.value.trim();filterGrid(host,st)});
  $$('.chip',host).forEach(function(b){b.addEventListener('click',function(){st.f=b.dataset.f;$$('.chip',host).forEach(function(x){x.classList.toggle('on',x===b)});filterGrid(host,st)})});
}
function vHome(){
  var top=D.chars.slice().sort(function(a,b){return avg(b)-avg(a)});
  main.innerHTML='<section class="hero"><div class="eyebrow">An original fantasy cycle</div><h1>The Eon Chronicles</h1><p class="lead">'+esc(D.meta.tagline)+'</p><div class="btns"><a class="btn" href="#/characters">Meet the Seven</a><a class="btn alt" href="#/world">Enter the World</a><a class="btn alt" href="#/ranking">Power Ranking</a></div></section>'+
  '<section class="sec"><h2>The Seven</h2>'+gridBlock()+'</section>'+
  '<section class="sec"><h2>The World in Brief</h2><div class="panel prose">'+md(D.world.short)+'<p><a class="btn alt" href="#/world">Read the full world guide →</a></p></div></section>'+
  '<section class="sec"><h2>Chronicles</h2><div class="cols c3">'+D.sagas.slice(0,6).map(function(s){return '<a class="panel tile" href="#/saga/'+s.id+'" style="text-decoration:none"><div class="eyebrow" style="margin:0 0 4px">Chronicle '+s.num+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.blurb)+'</p></a>'}).join('')+'</div></section>'+
  '<section class="sec"><h2>Strongest Right Now</h2>'+top.slice(0,3).map(function(c,i){return rankRow(c,i+1)}).join('')+'<p><a href="#/ranking">See the full ranking and comparison table →</a></p></section>';
  wireGrid();
}
function vCharacters(){
  main.innerHTML='<div class="crumbs"><a href="#/">Home</a> › Characters</div><h1>Characters</h1><p class="muted">Seven sovereign women across six worlds, each bound to the Dreamer called Eon. Tap a portrait to open her page.</p>'+gridBlock();
  wireGrid();
}
function rankRow(c,n){
  return '<a class="rank" href="#/c/'+c.slug+'" style="--accent:'+c.color+'"><div class="no">'+n+'</div><img src="'+img(c,'t')+'" alt=""><div class="rb"><div class="rn">'+esc(c.short)+'</div><div class="small muted">'+esc(tierOf(c).name)+' · '+nPowers(c)+' named powers</div><div class="meter"><i style="width:'+avg(c)*10+'%"></i></div></div><div class="sc">'+avg(c).toFixed(1)+'</div></a>';
}
function infobox(c){
  var rows=[['Full name',c.fullName],['Aliases',c.aliases.join(' · ')],['Titles',c.titles.join(' · ')],['Species / race',c.race],['Age',c.age],['Height / build',c.height+' · '+c.build],['Hair',c.hair],['Eyes',c.eyes],['Origin',c.origin],['Affiliation',c.affiliation],['Role / rank',c.role],['Status',c.status]];
  var h='<aside class="infobox" aria-label="Infobox"><div class="ib-t">'+esc(c.name)+'</div><div class="ib-img" data-lb="'+img(c)+'" data-cap="'+esc(c.name)+'"><img src="'+img(c)+'" alt="Portrait of '+esc(c.name)+'"></div><div class="ib-cap">'+esc(c.caption)+'</div>';
  h+='<div class="ib-sec">Profile</div>'+rows.map(function(r){return '<dl class="ib-row"><dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd></dl>'}).join('');
  h+='<div class="ib-sec">Story</div><dl class="ib-row"><dt>Chronicles</dt><dd>'+c.sagas.map(function(i){return '<a href="#/saga/'+i+'">'+esc(SG[i].title)+'</a>'}).join('<br>')+'</dd></dl><dl class="ib-row"><dt>First appears</dt><dd><a href="#/saga/'+c.firstSaga+'">'+esc(SG[c.firstSaga].title)+'</a></dd></dl>';
  h+='<div class="ib-sec">Power</div><dl class="ib-row"><dt>Tier</dt><dd><b style="color:var(--accent)">'+esc(tierOf(c).name)+'</b> ('+avg(c).toFixed(1)+'/10)</dd></dl><dl class="ib-row"><dt>Named powers</dt><dd>'+nPowers(c)+'</dd></dl>';
  h+='<div class="ib-sec">Relationships</div>'+c.relationships.slice(0,6).map(function(r){return '<dl class="ib-row"><dt>'+esc(r.kind)+'</dt><dd>'+(BY[r.who]?'<a href="#/c/'+r.who+'">'+esc(BY[r.who].short)+'</a>':esc(r.name||r.who))+'</dd></dl>'}).join('');
  return h+'</aside>';
}
function powerHTML(p,i,cid){
  var tag=p.src==='source'?'<span class="src">Source name</span>':'<span class="src n">Editor’s name</span>';
  return '<details class="power" id="pw-'+cid+'-'+i+'"'+(p.open?' open':'')+'><summary><span class="pn">'+esc(p.name)+(p.alt?'<small>'+esc(p.alt)+'</small>':'')+'</span>'+tag+(p.tier?'<span class="tier">'+esc(p.tier)+'</span>':'')+'<span class="chev">▸</span></summary><div class="pb"><dl>'+
   '<dt>What it does</dt><dd>'+inline(p.what)+'</dd><dt>How it works</dt><dd>'+inline(p.how)+'</dd><dt>Limits &amp; cost</dt><dd>'+inline(p.limits)+'</dd><dt>Notable feats</dt><dd>'+inline(p.feats)+'</dd></dl></div></details>';
}
function vChar(slug){
  var c=BY[slug];if(!c)return v404();
  var idx=D.chars.indexOf(c),prev=D.chars[(idx+6)%7],next=D.chars[(idx+1)%7];
  var secs=[['bio','Biography'],['appearance','Appearance'],['personality','Personality'],['powers','Powers & Abilities'],['relationships','Relationships'],['trivia','Trivia & Quotes'],['gallery','Gallery'],['compare','Power comparison']];
  var h='<div class="crumbs"><a href="#/">Home</a> › <a href="#/characters">Characters</a> › '+esc(c.short)+'</div><div class="art" style="--accent:'+c.color+'">';
  h+='<div class="art-h"><h1>'+esc(c.name)+'</h1><div class="sub">'+esc(c.tagline)+'</div></div>'+infobox(c);
  if(c.note)h+='<div class="note">'+inline(c.note)+'</div>';
  h+='<div class="lead-p prose">'+md(c.intro)+'</div>';
  h+='<nav class="toc" aria-label="Contents"><b>Contents</b><ol>'+secs.map(function(s){return '<li><a href="#/c/'+slug+'" data-scroll="'+s[0]+'">'+s[1]+'</a></li>'}).join('')+'</ol></nav>';
  h+='<section id="bio" class="prose"><h2>Biography</h2>'+c.bio.map(function(b){return '<h3>'+esc(b.h)+'</h3>'+md(b.t)}).join('')+'</section>';
  h+='<section id="appearance" class="prose"><h2>Appearance</h2>'+md(c.appearance)+'</section>';
  h+='<section id="personality" class="prose"><h2>Personality</h2>'+c.personality.map(function(b){return '<h3>'+esc(b.h)+'</h3>'+md(b.t)}).join('')+'</section>';
  var k=0;
  h+='<section id="powers"><h2>Powers &amp; Abilities</h2><div class="prose">'+md(c.powersIntro)+'</div><p class="small muted">Tap a power to open it. Each entry lists what it does, how it works, its limits and cost, and notable feats. “Source name” means the name appears in the story; “Editor’s name” is a descriptive title coined for this wiki.</p>';
  h+=c.powers.map(function(g){return '<div class="pcat"><h3>'+esc(g.cat)+'</h3><p>'+esc(g.blurb)+'</p>'+g.items.map(function(p){return powerHTML(p,k++,c.slug)}).join('')+'</div>'}).join('');
  h+='<div class="panel" style="margin-top:14px"><b>Combat tier:</b> <span style="color:var(--accent)">'+esc(tierOf(c).name)+'</span> — '+esc(tierOf(c).desc)+'</div></section>';
  h+='<section id="relationships"><h2>Relationships</h2><div class="panel">'+c.relationships.map(function(r){
    var o=BY[r.who];
    return '<div class="rel">'+(o?'<a href="#/c/'+o.slug+'"><img src="'+img(o,'t')+'" alt=""></a>':'<div class="av">'+esc((r.name||r.who).charAt(0))+'</div>')+'<div><span class="k">'+esc(r.kind)+'</span><br><b>'+(o?'<a href="#/c/'+o.slug+'">'+esc(o.short)+'</a>':esc(r.name||r.who))+'</b><p>'+inline(r.text)+'</p></div></div>'}).join('')+'</div></section>';
  h+='<section id="trivia"><h2>Trivia &amp; Quotes</h2>'+c.quotes.map(function(q){return '<blockquote class="quote">“'+esc(q[0])+'”<cite>'+esc(q[1])+'</cite></blockquote>'}).join('')+'<ul class="tight" style="margin-top:14px">'+c.trivia.map(function(t){return '<li>'+inline(t)+'</li>'}).join('')+'</ul></section>';
  h+='<section id="gallery"><h2>Gallery</h2><div class="gal"><figure data-lb="'+img(c)+'" data-cap="'+esc(c.caption)+'"><img loading="lazy" src="'+img(c,'t')+'" alt="Portrait of '+esc(c.name)+'"><figcaption>'+esc(c.caption)+'</figcaption></figure></div></section>';
  h+='<section id="compare"><h2>Power comparison</h2>'+rankingTable(c.slug)+'<p class="small muted" style="margin-top:8px"><a href="#/ranking">Open the full ranking →</a></p></section>';
  h+='<div class="pn-nav"><a class="btn alt" href="#/c/'+prev.slug+'">← '+esc(prev.short)+'</a><a class="btn alt" href="#/c/'+next.slug+'">'+esc(next.short)+' →</a></div></div>';
  main.innerHTML=h;document.title=c.name+' – The Eon Chronicles';
}
var SORT={k:'avg',d:-1};
function rankingTable(hl){
  var keys=Object.keys(D.statLabels);
  var rows=D.chars.slice().sort(function(a,b){var x=SORT.k==='avg'?avg(a):(SORT.k==='n'?nPowers(a):a.stats[SORT.k]),y=SORT.k==='avg'?avg(b):(SORT.k==='n'?nPowers(b):b.stats[SORT.k]);return (y-x)*-SORT.d||avg(b)-avg(a)});
  var h='<div class="tw"><table class="t"><thead><tr><th data-s="name">Character</th>'+keys.map(function(k){return '<th data-s="'+k+'" title="'+esc(D.statLabels[k][1])+'">'+D.statLabels[k][0]+(SORT.k===k?(SORT.d<0?' ▼':' ▲'):'')+'</th>'}).join('')+'<th data-s="avg">Overall'+(SORT.k==='avg'?(SORT.d<0?' ▼':' ▲'):'')+'</th><th data-s="n">Powers'+(SORT.k==='n'?(SORT.d<0?' ▼':' ▲'):'')+'</th></tr></thead><tbody>';
  rows.forEach(function(c){
    h+='<tr style="--accent:'+c.color+'"'+(hl===c.slug?' class="hl"':'')+'><td><a href="#/c/'+c.slug+'"'+(hl===c.slug?' style="color:var(--gold2);font-weight:700"':'')+'>'+esc(c.short)+'</a></td>'+keys.map(function(k){var v=c.stats[k];return '<td class="n" style="color:hsl('+(v*12)+',70%,'+(55+v)+'%)">'+v+'</td>'}).join('')+'<td class="n"><span class="bar" style="width:'+avg(c)*6+'px"></span>'+avg(c).toFixed(1)+'</td><td class="n">'+nPowers(c)+'</td></tr>';
  });
  return h+'</tbody></table></div>';
}
function vRanking(){
  var order=D.chars.slice().sort(function(a,b){return avg(b)-avg(a)});
  var h='<div class="crumbs"><a href="#/">Home</a> › Power Ranking</div><h1>Power Ranking</h1><div class="prose">'+md(D.world.rankIntro)+'</div>';
  h+='<h2 style="color:var(--gold2)">The ladder</h2>'+order.map(function(c,i){return rankRow(c,i+1)}).join('');
  h+='<h2 style="color:var(--gold2);margin-top:28px">Comparison table</h2><p class="muted small">Tap a column title to sort. Scores run 1–10 and describe peak, in-story capability.</p><div id="rt">'+rankingTable()+'</div>';
  h+='<h2 style="color:var(--gold2);margin-top:28px">What the columns mean</h2><div class="cols c2">'+Object.keys(D.statLabels).map(function(k){return '<div class="panel"><b style="color:var(--gold2)">'+D.statLabels[k][0]+'</b><p class="muted" style="margin:4px 0 0;font-size:.93rem">'+esc(D.statLabels[k][1])+'</p></div>'}).join('')+'</div>';
  h+='<h2 style="color:var(--gold2);margin-top:28px">Tiers</h2><div class="cols c2">'+Object.keys(D.tiers).map(function(k){var t=D.tiers[k];return '<div class="panel"><b style="color:var(--gold2)">'+esc(t.name)+'</b><p class="muted" style="margin:4px 0 0;font-size:.93rem">'+esc(t.desc)+'</p><div style="margin-top:6px">'+D.chars.filter(function(c){return c.tier===k}).map(function(c){return '<a class="pill g" href="#/c/'+c.slug+'">'+esc(c.short)+'</a>'}).join('')+'</div></div>'}).join('')+'</div>';
  h+='<div class="note" style="margin-top:20px">'+inline(D.world.rankNote)+'</div>';
  main.innerHTML=h;wireSort();
}
function wireSort(){
  var host=$('#rt');if(!host)return;
  host.addEventListener('click',function(e){var th=e.target.closest('th');if(!th||!th.dataset.s||th.dataset.s==='name')return;var k=th.dataset.s;if(SORT.k===k)SORT.d*=-1;else{SORT.k=k;SORT.d=-1}host.innerHTML=rankingTable()});
}
function vWorld(){
  var w=D.world,h='<div class="crumbs"><a href="#/">Home</a> › World</div><h1>The World of the Eon Chronicles</h1>';
  h+='<div class="lead-p prose">'+md(w.intro)+'</div>';
  w.sections.forEach(function(s){h+='<section class="prose"><h2>'+esc(s.h)+'</h2>'+md(s.t)+'</section>'});
  h+='<h2>The cultivation ladder</h2><div class="panel"><ol class="tight" style="margin:0">'+w.ladder.map(function(l){return '<li><b>'+esc(l[0])+'</b> — '+esc(l[1])+'</li>'}).join('')+'</ol></div>';
  h+='<h2>Glossary</h2><div class="cols c2">'+w.glossary.map(function(g){return '<div class="panel"><b style="color:var(--gold2)">'+esc(g[0])+'</b><p class="muted" style="margin:3px 0 0;font-size:.93rem">'+inline(g[1])+'</p></div>'}).join('')+'</div>';
  main.innerHTML=h;
}
function vSagas(){
  var h='<div class="crumbs"><a href="#/">Home</a> › Chronicles</div><h1>The Chronicles</h1><div class="prose">'+md(D.world.sagaIntro)+'</div><div class="cols">';
  D.sagas.forEach(function(s){h+='<a class="panel tile" href="#/saga/'+s.id+'" style="text-decoration:none"><div class="eyebrow" style="margin:0 0 4px">Chronicle '+s.num+' · '+esc(s.world)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.blurb)+'</p><div style="margin-top:8px">'+s.chars.map(function(k){return '<span class="pill g">'+esc(BY[k].short)+'</span>'}).join('')+'</div></a>'});
  main.innerHTML=h+'</div>';
}
function vSaga(id){
  var s=SG[id];if(!s)return v404();
  var h='<div class="crumbs"><a href="#/">Home</a> › <a href="#/sagas">Chronicles</a> › '+esc(s.title)+'</div><div class="eyebrow">Chronicle '+s.num+' · '+esc(s.world)+'</div><h1>'+esc(s.title)+'</h1><div class="lead-p prose" style="--accent:var(--gold)">'+md(s.blurb)+'</div>';
  h+='<h2>Featured characters</h2><div class="grid" style="max-width:640px">'+s.chars.map(function(k){return card(BY[k])}).join('')+'</div>';
  h+='<section class="prose"><h2>Story overview</h2>'+md(s.summary)+'</section>';
  h+='<h2>Key moments</h2><ul class="timeline">'+s.beats.map(function(b){return '<li>'+inline(b)+'</li>'}).join('')+'</ul>';
  var pl=D.places.filter(function(p){return p.sagas.indexOf(id)>=0});
  if(pl.length)h+='<h2>Places in this chronicle</h2><div>'+pl.map(function(p){return '<a class="pill g" href="#/place/'+p.id+'">'+esc(p.name)+'</a>'}).join('')+'</div>';
  var i=D.sagas.indexOf(s);
  h+='<div class="pn-nav">'+(i>0?'<a class="btn alt" href="#/saga/'+D.sagas[i-1].id+'">← '+esc(D.sagas[i-1].title)+'</a>':'<span></span>')+(i<D.sagas.length-1?'<a class="btn alt" href="#/saga/'+D.sagas[i+1].id+'">'+esc(D.sagas[i+1].title)+' →</a>':'')+'</div>';
  main.innerHTML=h;document.title=s.title+' – The Eon Chronicles';
}
function placeCard(p,full){
  return '<article class="panel" id="pl-'+p.id+'"><div class="eyebrow" style="margin:0 0 4px">'+esc(p.region)+' · '+esc(p.type)+'</div><h3 style="color:var(--gold2)"><a href="#/place/'+p.id+'" style="color:inherit">'+esc(p.name)+'</a></h3><div class="prose">'+(full?md(p.desc):'<p class="muted">'+esc(plain(p.desc.split('\n\n')[0]))+'</p>')+'</div><div>'+p.chars.map(function(k){return '<a class="pill g" href="#/c/'+k+'">'+esc(BY[k].short)+'</a>'}).join('')+'</div></article>';
}
var PF='all';
function vPlaces(){
  var regs=['all'].concat(D.places.map(function(p){return p.region}).filter(function(v,i,a){return a.indexOf(v)===i}));
  var h='<div class="crumbs"><a href="#/">Home</a> › Places</div><h1>Places</h1><p class="muted">Locations that matter to the seven, grouped by world.</p><div class="chips" style="margin-bottom:14px">'+regs.map(function(r){return '<button class="chip'+(r===PF?' on':'')+'" data-p="'+esc(r)+'">'+(r==='all'?'All':esc(r))+'</button>'}).join('')+'</div><div class="cols c2" id="plg"></div>';
  main.innerHTML=h;
  function draw(){$('#plg').innerHTML=D.places.filter(function(p){return PF==='all'||p.region===PF}).map(function(p){return placeCard(p,false)}).join('')}
  draw();
  $$('.chip',main).forEach(function(b){b.addEventListener('click',function(){PF=b.dataset.p;$$('.chip',main).forEach(function(x){x.classList.toggle('on',x===b)});draw()})});
}
function vPlace(id){
  var p=PL[id];if(!p)return v404();
  main.innerHTML='<div class="crumbs"><a href="#/">Home</a> › <a href="#/places">Places</a> › '+esc(p.name)+'</div><h1>'+esc(p.name)+'</h1>'+placeCard(p,true).replace('<h3','<h3 hidden')+'<h2>Appears in</h2><div>'+sagaTags(p.sagas)+'</div>';
  document.title=p.name+' – The Eon Chronicles';
}
function hl(t,q){t=esc(t);if(!q)return t;try{return t.replace(new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>')}catch(e){return t}}
function snip(text,q,n){text=plain(text);var i=text.toLowerCase().indexOf(q.toLowerCase());if(i<0)return text.slice(0,n)+(text.length>n?'…':'');var s=Math.max(0,i-n/3);return (s?'…':'')+text.slice(s,s+n)+'…'}
function vSearch(q){
  q=decodeURIComponent(q||'').trim();$('#sq').value=q;
  var ql=q.toLowerCase(),res={c:[],p:[],w:[],s:[],l:[],t:[]};
  if(ql.length>=2){
    D.chars.forEach(function(c){
      var head=(c.name+' '+c.aliases.join(' ')+' '+c.titles.join(' ')+' '+c.tagline+' '+c.race+' '+c.origin+' '+c.role).toLowerCase();
      if(head.indexOf(ql)>=0)res.c.push({href:'#/c/'+c.slug,t:c.name,s:c.tagline});
      c.powers.forEach(function(g,gi){g.items.forEach(function(p){var tx=(p.name+' '+(p.alt||'')+' '+p.what+' '+p.how).toLowerCase();if(tx.indexOf(ql)>=0)res.w.push({href:'#/c/'+c.slug,t:p.name+' — '+c.short,s:snip(p.what,q,140)})})});
      var body=[c.intro].concat(c.bio.map(function(b){return b.h+' '+b.t}),c.personality.map(function(b){return b.h+' '+b.t}),[c.appearance]);
      var seen=false;body.forEach(function(b){if(!seen&&plain(b).toLowerCase().indexOf(ql)>=0&&head.indexOf(ql)<0){seen=true;res.t.push({href:'#/c/'+c.slug,t:c.name+' (article text)',s:snip(b,q,150)})}});
    });
    D.places.forEach(function(p){if((p.name+' '+p.desc+' '+p.region).toLowerCase().indexOf(ql)>=0)res.p.push({href:'#/place/'+p.id,t:p.name,s:snip(p.desc,q,140)})});
    D.sagas.forEach(function(s){if((s.title+' '+s.blurb+' '+s.summary+' '+s.beats.join(' ')+' '+s.world).toLowerCase().indexOf(ql)>=0)res.s.push({href:'#/saga/'+s.id,t:s.title,s:snip(s.blurb,q,140)})});
    D.world.glossary.forEach(function(g){if((g[0]+' '+g[1]).toLowerCase().indexOf(ql)>=0)res.l.push({href:'#/world',t:g[0],s:snip(g[1],q,140)})});
  }
  var total=0,h='<div class="crumbs"><a href="#/">Home</a> › Search</div><h1>Search</h1>';
  var groups=[['c','Characters'],['w','Powers'],['p','Places'],['s','Chronicles'],['l','World glossary'],['t','Mentioned in articles']];
  var body='';groups.forEach(function(g){var a=res[g[0]];if(!a.length)return;total+=a.length;body+='<div class="res"><h3>'+g[1]+' ('+a.length+')</h3>'+a.slice(0,30).map(function(r){return '<a class="hit" href="'+r.href+'"><div class="ht">'+hl(r.t,q)+'</div><div class="hs">'+hl(r.s,q)+'</div></a>'}).join('')+'</div>'});
  h+=ql.length<2?'<p class="muted">Type at least two letters to search characters, powers, places and chronicles.</p>':(total?'<p class="muted">'+total+' result'+(total>1?'s':'')+' for “'+esc(q)+'”.</p>'+body:'<div class="empty">Nothing found for “'+esc(q)+'”. Try a name, a power or a place.</div>');
  main.innerHTML=h;
}
function v404(){main.innerHTML='<h1>Page not found</h1><p class="muted">That page is not in the Chronicles. <a href="#/">Return home</a>.</p>'}

/* ---------- router ---------- */
function route(){
  var hsh=location.hash.replace(/^#\/?/,''),p=hsh.split('/'),r=p[0]||'home';
  document.title='The Eon Chronicles – Character Wiki';
  $('#nav').classList.remove('open');$('#burger').setAttribute('aria-expanded','false');
  var key={c:'characters',characters:'characters',home:'home',world:'world',sagas:'sagas',saga:'sagas',places:'places',place:'places',ranking:'ranking'}[r]||'';
  $$('#nav a').forEach(function(a){a.classList.toggle('on',a.dataset.r===key)});
  try{
    if(r==='home')vHome();else if(r==='characters')vCharacters();else if(r==='c')vChar(p[1]);else if(r==='world')vWorld();else if(r==='sagas')vSagas();else if(r==='saga')vSaga(p[1]);
    else if(r==='places')vPlaces();else if(r==='place')vPlace(p[1]);else if(r==='ranking')vRanking();else if(r==='search')vSearch(p.slice(1).join('/'));else v404();
  }catch(e){main.innerHTML='<h1>Something went wrong</h1><p class="muted">Please reload the page.</p>';console.error(e)}
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
$('#burger').addEventListener('click',function(){var o=$('#nav').classList.toggle('open');this.setAttribute('aria-expanded',o)});
$('#sform').addEventListener('submit',function(e){e.preventDefault();var q=$('#sq').value.trim();if(q)location.hash='#/search/'+encodeURIComponent(q)});
document.addEventListener('click',function(e){
  var a=e.target.closest('[data-scroll]');
  if(a){e.preventDefault();var t=document.getElementById(a.dataset.scroll);if(t){var y=t.getBoundingClientRect().top+window.pageYOffset-70;window.scrollTo({top:y,behavior:'smooth'})}return}
  var lb=e.target.closest('[data-lb]');
  if(lb){var L=$('#lb');$('img',L).src=lb.dataset.lb;$('img',L).alt=lb.dataset.cap||'';$('p',L).textContent=lb.dataset.cap||'';L.hidden=false;return}
  if(e.target.closest('#lb')){$('#lb').hidden=true}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('#lb').hidden=true});
route();
})();
