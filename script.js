const KEY="stepquest_v2_";
let s=null,SK="",enemy=null,node=null,cooldown=false,isAdmin=false,logs=[];

// Rarity ala SimpleMMO
const RAR=[["Common","#b0b0b0"],["Uncommon","#4cd964"],["Rare","#4da6ff"],["Elite","#c56cf0"],["Epic","#ff9f43"],["Legendary","#ff4757"],["Celestial","#5ce1e6","linear-gradient(90deg,#5ce1e6,#3a6bff)"],["Exotic","#b58cff","linear-gradient(90deg,#4cd964,#b58cff)"]];
const W=[58,20,15,4.5,1.8,.6,.08,.02]; // bobot drop tiap rarity (%)
// nama:[rarity,tipe,stat utama,harga,{lv,str,def,crit,dex}] — data asli SimpleMMO dari items-db.js (smmo-db.com)
const CUSTOM_ITEMS={"Mushroom of Energy":[1,"mat",0,500,{lv:1}],"Healing Herb":[0,"potion",35,20,{lv:1}],"Iron Ore":[0,"mat",0,10,{lv:1}],"Oak Log":[0,"mat",0,8,{lv:1}],"Trout":[0,"mat",0,9,{lv:1}],"Old Coin Pouch":[1,"mat",0,40,{lv:1}]};
const ITEMS=Object.assign({},DB_ITEMS,CUSTOM_ITEMS);
const IMG_BASE="https://web.simple-mmo.com/img/";
const ITEM_IMG=Object.assign({},DB_IMG,{"Healing Herb":"icons/midnight/collectibles/Flower4.png","Iron Ore":"icons/crafting/materials/IronOreSpriteSmall.png","Oak Log":"icons/events/christmas-25/materials/Offering%20Log.gif","Old Coin Pouch":"icons/I_GoldCoin.png","Trout":"icons/I_Fang.png","Mushroom of Energy":"icons/midnight/collectibles/Flower4.png"});
const TOOLK={"Pickaxe":"pickaxe","Axe":"wood axe","Fishing Rod":"fishing rod","Shovel":"shovel"};
Object.entries(TOOLK).forEach(([t,k])=>{const n=Object.keys(DB_ITEMS).find(x=>DB_ITEMS[x][1]==="tool"&&DB_ITEMS[x][4].kind===k);if(n)ITEM_IMG[t]=DB_IMG[n]});
const imgUrl=p=>/^https?:/.test(p)?p:IMG_BASE+p;
function ico(n,c=""){const p=ITEM_IMG[n];return p?`<img class="iti ${c}" src="${imgUrl(p)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`:""}
const ilv=n=>(ITEMS[n]&&ITEMS[n][4]&&ITEMS[n][4].lv)||1;
const GEAR_T=["weapon","armor","helmet","amulet","shield","greaves","gauntlet","boots","pet"];
function isOffT(t){return t==="weapon"||t==="pet"}
function avHTML(c=""){const a=AVATARS[s&&s.av||0]||AVATARS[0];return a?`<img class="avi ${c}" src="${imgUrl(a[1])}" alt="${a[0]}" referrerpolicy="no-referrer">`:'<i class="fa-solid fa-user"></i>'}
function dbLink(n){return `<a class=dbl href="https://smmo-db.com/items?name=${encodeURIComponent(n)}" target=_blank rel=noopener title="Lihat di smmo-db">smmo-db ↗</a>`}
const enemies=[
 {ico:"🟢",name:"Slime",level:1,hp:28,attack:5,gold:[8,22],xp:[12,25],drop:[]},
 {ico:"👺",name:"Goblin",level:2,hp:42,attack:8,gold:[15,35],xp:[20,38],drop:[]},
 {ico:"🐺",name:"Wolf",level:3,hp:58,attack:11,gold:[24,52],xp:[30,55],drop:[]},
 {ico:"🗡️",name:"Dark Knight",level:5,hp:100,attack:18,gold:[55,110],xp:[70,120],drop:[]},
 {ico:"👹",name:"Troll",level:8,hp:180,attack:26,gold:[110,220],xp:[140,240],drop:[]},
 {ico:"🥶",name:"Frost Giant",level:12,hp:300,attack:34,gold:[200,380],xp:[260,420],drop:[]},
 {ico:"💀",name:"Void Reaper",level:20,hp:500,attack:48,gold:[400,700],xp:[500,800],drop:[]},
 {ico:"🦍",name:"Mountain Troll",level:30,hp:750,attack:70,gold:[500,950],xp:[650,1050],drop:[]},
 {ico:"🦅",name:"Griffon",level:35,hp:950,attack:85,gold:[620,1150],xp:[800,1300],drop:[]},
 {ico:"😈",name:"Imp",level:50,hp:1300,attack:115,gold:[850,1600],xp:[1100,1800],drop:[]},
 {ico:"👿",name:"Demon Knight",level:60,hp:1650,attack:140,gold:[1050,1950],xp:[1400,2200],drop:[]},
 {ico:"🏜️",name:"Sand Wraith",level:100,hp:2800,attack:230,gold:[1800,3400],xp:[2400,3800],drop:[]},
 {ico:"🧞",name:"Mirage Djinn",level:120,hp:3400,attack:280,gold:[2200,4100],xp:[2900,4600],drop:[]},
 {ico:"🧝",name:"Elvenguard",level:150,hp:4300,attack:340,gold:[2800,5200],xp:[3700,5800],drop:[]},
 {ico:"🔮",name:"Ednian Sorcerer",level:170,hp:4900,attack:390,gold:[3200,5900],xp:[4200,6600],drop:[]},
 {ico:"🗿",name:"Stone Golem",level:200,hp:5800,attack:450,gold:[3800,7000],xp:[5000,7800],drop:[]},
 {ico:"🐲",name:"Rock Wyvern",level:220,hp:6400,attack:500,gold:[4200,7700],xp:[5500,8500],drop:[]},
 {ico:"🐊",name:"Swamp Lurker",level:250,hp:7300,attack:560,gold:[4800,8800],xp:[6300,9800],drop:[]},
 {ico:"🐙",name:"Bog Hydra",level:270,hp:7900,attack:610,gold:[5200,9500],xp:[6800,10500],drop:[]},
 {ico:"⚰️",name:"Fallen Paladin",level:300,hp:8800,attack:670,gold:[5800,10600],xp:[7600,11800],drop:[]},
 {ico:"👻",name:"Cathedral Wraith",level:320,hp:9400,attack:720,gold:[6200,11300],xp:[8100,12500],drop:[]},
 {ico:"🏹",name:"Bandit Captain",level:350,hp:10300,attack:780,gold:[6800,12400],xp:[8900,13800],drop:[]},
 {ico:"🪓",name:"Highway Brute",level:370,hp:10900,attack:830,gold:[7200,13100],xp:[9400,14500],drop:[]},
 {ico:"🐍",name:"Lake Serpent",level:400,hp:11800,attack:890,gold:[7800,14200],xp:[10200,15800],drop:[]},
 {ico:"🌊",name:"Drowned Marauder",level:420,hp:12400,attack:940,gold:[8200,14900],xp:[10700,16500],drop:[]},
 {ico:"🧟",name:"Elder Wight",level:450,hp:13300,attack:1000,gold:[8800,16000],xp:[11500,17800],drop:[]},
 {ico:"🛡️",name:"Ancient Guardian",level:470,hp:13900,attack:1050,gold:[9200,16700],xp:[12000,18500],drop:[]},
 {ico:"🦉",name:"Hawkfel Harpy",level:500,hp:14800,attack:1110,gold:[9800,17800],xp:[12800,19800],drop:[]},
 {ico:"🗻",name:"Cliff Behemoth",level:520,hp:15400,attack:1160,gold:[10200,18500],xp:[13300,20500],drop:[]},
 {ico:"☠️",name:"Ranhor Revenant",level:550,hp:16300,attack:1220,gold:[10800,19600],xp:[14100,21800],drop:[]},
 {ico:"🗿",name:"Ruin Colossus",level:570,hp:16900,attack:1270,gold:[11200,20300],xp:[14600,22500],drop:[]},
 {ico:"🌋",name:"Venzorian Brute",level:600,hp:17800,attack:1330,gold:[11800,21400],xp:[15400,23800],drop:[]},
 {ico:"🐕‍🦺",name:"Magma Hound",level:620,hp:18400,attack:1380,gold:[12200,22100],xp:[15900,24500],drop:[]},
 {ico:"🐉",name:"Wyrmling",level:700,hp:20800,attack:1550,gold:[13800,25000],xp:[18000,27800],drop:[]},
 {ico:"🐲",name:"Dragon Knight",level:750,hp:22300,attack:1660,gold:[14800,26800],xp:[19300,29800],drop:[]},
 {ico:"🐉",name:"Ancient Wyrm",level:800,hp:23800,attack:1770,gold:[15800,28600],xp:[20600,31800],drop:[]},
 {ico:"⚔️",name:"Arkhan Reaper",level:850,hp:25300,attack:1880,gold:[16800,30400],xp:[21900,33800],drop:[]},
 {ico:"🌑",name:"Voidlord Arkhan",level:900,hp:26800,attack:1990,gold:[17800,32200],xp:[23200,35800],drop:[]}
];
const BOSS={ico:"🐉",name:"🐉 Abyssal Dragon (WORLD BOSS)",level:15,hp:500,attack:35,gold:[500,1000],xp:[800,1500],drop:[]};
// 4 gathering skill, masing-masing butuh tool sendiri
const NODES={
 Mining:{verb:"Mine",tool:"Pickaxe",res:"Iron Ore",icon:"⛏️",txt:"urat bijih besi"},
 Woodcutting:{verb:"Chop",tool:"Axe",res:"Oak Log",icon:"🪓",txt:"pohon oak besar"},
 Fishing:{verb:"Catch",tool:"Fishing Rod",res:"Trout",icon:"🎣",txt:"kolam penuh ikan"},
 Treasure:{verb:"Dig",tool:"Shovel",res:"Old Coin Pouch",icon:"🗝️",txt:"tanah yang mencurigakan"}
};
const SHOP_GEAR=GEAR_T.flatMap(t=>Object.keys(DB_ITEMS).filter(k=>DB_ITEMS[k][1]===t&&DB_ITEMS[k][0]<=1&&ilv(k)<=12&&DB_ITEMS[k][2]>0).sort((a,b)=>ilv(a)-ilv(b)).slice(0,3));
const SHOP=[["Healing Herb",50,"+35 HP","item"],["Pickaxe",250,"Tool Mining","tool"],["Axe",250,"Tool Woodcutting","tool"],["Fishing Rod",250,"Tool Fishing","tool"],["Shovel",300,"Tool Treasure","tool"]].concat(SHOP_GEAR.map(n=>[n,Math.max(30,ITEMS[n][3]*3),`Lv ${ilv(n)} · +${ITEMS[n][2]} ${isOffT(ITEMS[n][1])?"STR":"DEF"}`,"item"]));
const FLAVOR=["Seorang petani memberimu sebuah apel.","Kamu melihat merpati membawa surat kosong.","Kamu tersandung akar pohon. Untung tidak ada yang lihat.","Seorang pedagang berbisik: harga Healing Herb naik besok.","Awan di atas kepalamu berbentuk seperti Slime."];

const def=()=>({name:"",level:1,xp:0,gold:0,hp:100,maxHp:100,str:10,def:5,dex:5,steps:0,kills:0,inv:[],eq:{weapon:null,armor:null},energy:100,qe:50,tools:{},party:[],loc:0,pts:0,craft:[1,0],npc:{},vis:{0:1},pots:{exp:2,rar:1},pa:{},tx:0,bk:0,bank:0,feed:[],aw:{},joined:Date.now(),qd:{},qc:0,au:0,ap:[],sk:{Mining:[1,0],Woodcutting:[1,0],Fishing:[1,0],Treasure:[1,0]},q:{steps:0,kills:0,gathers:0}});

// UTIL
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function chance(p){return Math.random()<p}
function nextXP(){return Math.round(50*s.level*(1+s.level/10))}
const isOff=t=>t==="weapon"||t==="pet";
function gear(k){return Object.values(s.eq).reduce((a,n)=>{if(!n)return a;const it=ITEMS[n],x=it[4]||{};return a+((isOff(it[1])?"str":"def")===k?it[2]:0)+(x[k]||0)},0)}
function critB(){return Object.values(s.eq).reduce((a,n)=>a+(n&&ITEMS[n][4]&&ITEMS[n][4].crit||0),0)}
function exTxt(n){const x=ITEMS[n][4];return x?[x.str&&`+${x.str.toLocaleString()} str`,x.def&&`+${x.def.toLocaleString()} def`,x.crit&&`+${x.crit}% crit`,x.dex&&`+${x.dex.toLocaleString()} dex`].filter(Boolean).map(t=>" · "+t).join(""):""}
function dexT(){return s.dex+gear("dex")}
function atk(){return s.str+gear("str")}
function dfn(){return s.def+gear("def")}
function nmT(n){return nm(n).replace(/<img[^>]*>/,"")}
function nm(n){const r=RAR[ITEMS[n][0]];return ico(n,"sm")+`<b style="color:${r[1]};${r[2]?`background:${r[2]};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent`:""}">${n}</b>`}
function bar(v,m){return `<div class=hpb><i style="width:${Math.max(0,v/m*100)}%"></i></div>`}
function save(){checkAwards();localStorage.setItem(SK,JSON.stringify(s));updateUI();netUpd()}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1500)}
function rollItem(minR=0,lvl){
 lvl=lvl||(s?s.level:1);let r=Math.random()*100*(s.pa&&s.pa.rar>Date.now()?.95:1),t=0;
 while(t<7&&r>=W[t]){r-=W[t];t++}t=Math.max(t,minR);
 const cap=Math.max(5,lvl+5),ok=k=>GEAR_T.includes(ITEMS[k][1])&&ilv(k)<=cap;
 let p=[];for(let u=t;u>=0;u--){p=Object.keys(ITEMS).filter(k=>ITEMS[k][0]==u&&ok(k));if(p.length)break}
 if(!p.length)p=Object.keys(ITEMS).filter(k=>GEAR_T.includes(ITEMS[k][1])).sort((a,b)=>ilv(a)-ilv(b)).slice(0,20);
 return p[rand(0,p.length-1)];
}

const PAGE=document.body.dataset.page||"";
const PAGE_FILE={home:"index.html",hub:"battle.html",town:"town.html",quests:"quests.html",inventory:"inventory.html",stats:"profile.html",char:"character.html",tasks:"tasks.html",craft:"crafting.html",prof:"profession.html",collect:"collections.html",awards:"awards.html",market:"market.html",guilds:"guilds.html",leader:"leaderboards.html",party:"party.html",notes:"notifications.html",diamond:"diamond-store.html",settings:"settings.html",events:"events.html",support:"support.html",about:"about.html",admin:"admin.html",legacy:"legacy.html",player:"player.html"};
let vpName=new URLSearchParams(location.search).get("n")||"";
function navGo(p){const f=PAGE_FILE[p];if(!f)return openPanel(p);if(PAGE===p||(p==="home"&&!PAGE))return p==="home"?closePanel():openPanel(p);location.href=f}
function doLogout(){localStorage.removeItem("sq_user");sessionStorage.removeItem("sq_akey");location.href="index.html"}
function doLogin(auto){
 const un=(auto||document.getElementById("username").value).trim();
 if(!un){alert("Username kosong!");return}
 if(!auto){localStorage.setItem("sq_user",un);const pw=document.getElementById("password").value;if(un.toLowerCase()==="admin"&&pw)sessionStorage.setItem("sq_akey",pw)}
 isAdmin=un.toLowerCase()==="admin";
 SK=KEY+un.toLowerCase();
 s=Object.assign(def(),JSON.parse(localStorage.getItem(SK)||"null")||{});
 s.name=un;
 s.inv=s.inv.filter(n=>ITEMS[n]);Object.keys(s.eq).forEach(k=>{if(s.eq[k]&&!ITEMS[s.eq[k]])s.eq[k]=null});s.party=[];if(s.av==null)s.av=Math.max(0,AVATARS.findIndex(a=>a[0]==="Yashinzen"));
 const lo=document.getElementById("loginOverlay");if(lo)lo.style.display="none";
 document.getElementById("gameScreen").style.display="flex";
 if(!auto)toast(isAdmin?"Login Admin Aktif!":"Welcome, "+un);netInit();
 document.querySelectorAll(".admin-only").forEach(e=>e.classList.toggle("hidden",!isAdmin));
 document.querySelectorAll(".bottom-nav [data-nav]").forEach(e=>e.classList.toggle("active",e.dataset.nav===(PAGE||"home")));
 if(PAGE)setTimeout(()=>openPanel(PAGE),0);
 save();
}

function showDrop(text,color,delay=0,yOffset=0){
 setTimeout(()=>{
  const c=document.getElementById("profileCard");if(!c)return;
  const el=document.createElement("div");el.className="float-text";
  el.style.background=({"#ffcc00":"#d4a62a","#00ff88":"#1f5a55","#ff4757":"#a8323e"})[color]||"#2a2a3a";el.style.color="#fff";
  el.textContent=text.replace(/^\+(\d[\d,]*) EXP$/,"✨ $1 experience").replace(/^\+(\d[\d,]*) Gold$/,"🪙 $1 gold");el.style.top=(10+yOffset*1.7)+"px";
  c.appendChild(el);setTimeout(()=>el.remove(),2000);
 },delay);
}

const TITLES={"👣":"Kamu melangkah...","📦":"Item ditemukan!","⚔️":"Pertarungan!","🔥":"WORLD BOSS!","💧":"Mata air","💨":"Jalanan sunyi","🏆":"Kemenangan!","☠️":"Kamu kalah","🏃":"Kabur","👥":"Teman ikut melangkah","🏟️":"Battle Arena","💀":"Kamu mati","💫":"Pertarungan!","💥":"Pertarungan!"};
function eventText(text){
 logs.unshift(text);if(logs.length>8)logs.pop();
 const c=[...text][0],k=Object.keys(TITLES).find(x=>[...x][0]===c),body=k?text.slice(c.length).replace(/^\uFE0F/,"").trim():text;
 const g=(text.match(/\+([\d,]+)\s*(?:Gold|G)\b/)||[])[1],x=(text.match(/\+([\d,]+)\s*(?:EXP|XP)\b/)||[])[1];
 document.getElementById("eventBox").innerHTML=`<b class="ev-title">${k?TITLES[k]:"Kamu melangkah..."}</b><div class="ev-text">${body}</div>`
  +(logs.length>1?`<details class="hist"><summary>Riwayat</summary>${logs.slice(1).map(l=>`<div>${l}</div>`).join("")}</details>`:"");
}

function addXP(n){
 if(s.pa&&s.pa.exp>Date.now())n=Math.ceil(n*1.05);
 s.xp+=n;s.tx+=n;let lv=0;
 while(s.xp>=nextXP()){s.xp-=nextXP();s.level++;lv++;s.maxHp+=10;s.hp=s.maxHp;s.pts+=4;s.feed.unshift(["Reached level "+s.level,Date.now()]);(s.notes=s.notes||[]).unshift(["System","⬆️ Kamu mencapai level "+s.level,Date.now()]);s.nu=(s.nu||0)+1;s.feed.length=Math.min(s.feed.length,20)}
 return lv;
}
function addGold(n){s.gold+=n}
function skillXP(k,x){
 const a=s.sk[k];a[1]+=x;
 while(a[1]>=20*a[0]){a[1]-=20*a[0];a[0]++;toast(`${k} naik ke Lv ${a[0]}!`)}
}

function updateUI(){
 if(!s)return;
 const nb=document.getElementById("notif");if(nb){nb.textContent=s.nu||0;nb.classList.toggle("hidden",!s.nu)}
 document.querySelectorAll("#gameScreen .avatar,#sideMenu .avatar").forEach(e=>{if(e.dataset.av!=String(s.av)){e.innerHTML=avHTML();e.dataset.av=s.av}});const na=document.getElementById("navAv");if(na&&na.dataset.av!=String(s.av)){na.innerHTML=avHTML("nav");na.dataset.av=s.av}
 for(const [id,v] of [["level",s.level],["gold",s.gold.toLocaleString()],["xp",s.xp],["nextXp",nextXP()],["playerName",s.name],["energyTxt",s.energy],["qEnergyTxt",s.qe],["hpTxt",s.hp+"/"+s.maxHp],["menuName",s.name],["menuLvl",s.level]]){
  const el=document.getElementById(id);if(el)el.textContent=v;
 }
 renderParty();
 document.getElementById("xpbar").style.width=Math.min(100,s.xp/nextXP()*100)+"%";
}

setInterval(()=>{if(!s)return;if(s.energy<100)s.energy++;if(s.qe<50)s.qe++;updateUI()},10000);

function renderAction(){
 const a=document.getElementById("actionBox"),e=document.getElementById("eventBox");let h="";
 if(node){const n=NODES[node.sk],r=RAR[ITEMS[n.res][0]];h=`<div class=enc><b>${n.res}</b><div class=enc-ico>${n.icon}</div><div class=enc-sub>Level ${s.sk[node.sk][0]} <span style="color:${r[1]}">${r[0]}</span></div><button class=enc-btn onclick="openGather()">${n.verb}</button></div>`}
 else if(enemy)h=`<div class=enc><b>${enemy.name}</b><div class=enc-ico>${enemy.ico||"👹"}</div><div class=enc-sub>Level ${enemy.level}</div><button class=enc-btn onclick="openPanel('battle')">Attack</button></div>`;
 a.innerHTML=h;e.style.display=h?"none":"";
}

// TRAVEL
let spMin=1;
function doSprint(){
 if(Date.now()<sprintUntil)return toast("Sprint masih aktif");
 document.getElementById("sprintPop").classList.toggle("hidden");spRender();
}
function spRender(){document.getElementById("spMin").value=spMin;document.getElementById("spCost").textContent=spMin}
function spAdj(d){spMin=Math.max(1,Math.min(60,spMin+d));spRender()}
function startSprint(){
 spMin=Math.max(1,Math.min(60,parseInt(document.getElementById("spMin").value)||1));
 if(s.energy<spMin)return toast("⚡ Energy tidak cukup");
 s.energy-=spMin;sprintUntil=Date.now()+spMin*60000;document.getElementById("sprintPop").classList.add("hidden");save();toast(`🏃 Sprint ${spMin} menit: step speed +25%`);sprintTick();
}
function sprintTick(){
 const l=sprintUntil-Date.now(),on=l>0,b=document.getElementById("sprintBan");
 document.getElementById("spPill").classList.toggle("hidden",!on);document.getElementById("eventBox").classList.toggle("sprinting",on);document.getElementById("sprintBtn").disabled=on;
 b.classList.toggle("hidden",!on);
 if(on){const sec=Math.ceil(l/1000);b.textContent=`Sprinting ends in ${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;setTimeout(sprintTick,1000)}
}

function spawn(b,boss){
 enemy={...b,boss:!!boss,m:1};
 if(!boss){
  enemy.level=Math.max(b.level,s.level+rand(-1,1));
  const d=enemy.level-b.level;
  enemy.hp=Math.round(b.hp*(1+d*.06));enemy.attack=Math.round(b.attack*(1+d*.04));enemy.m=1+d*.08;
 }
 enemy.maxHp=enemy.hp;openPanel("battle");
}

function buffMul(type){const b=s.buffs&&s.buffs[type];return b&&b.exp>Date.now()?(1+b.pct/100):1}
function takeStep(sprint=false){
 if(cooldown)return;
 if(s.hp<=0){eventText("💀 Kamu mati. Sembuhkan dulu (Healer / Herb).");openPanel("potions");return}
 cooldown=true;node=null;
 const btn=document.getElementById("stepBtn");btn.disabled=true;
 s.steps++;s.q.steps++;
 const r=Math.random();let t="";
 if(r<.01){
  spawn(BOSS,true);t=`🔥 WORLD BOSS MUNCUL! ${enemy.name} mengadang!`;
 }else if(r<.38){
  const xp=Math.round(rand(2*s.level,4*s.level)*buffMul("travel")),g=(rand(3*s.level,8*s.level));
  const lv=addXP(xp);addGold(g);
  t=`👣 ${FLAVOR[rand(0,FLAVOR.length-1)]} +${xp} EXP & +${g} Gold.${lv?` LEVEL UP! Lv ${s.level}.`:""}`;
  showDrop(`+${xp} EXP`,"#00ff88");showDrop(`+${g} Gold`,"#ffcc00",150,25);
 }else if(r<.50){
  const n=chance(.12)?"Mushroom of Energy":chance(.35)?MATN[Math.min(5,(()=>{let r=Math.random()*100,t=0;while(t<5&&r>=W[t]){r-=W[t];t++}return t})())]:rollItem(),xp=Math.round(rand(s.level,2*s.level+1)*buffMul("travel"));s.inv.push(n);addXP(xp);s.itemsFound=(s.itemsFound||0)+1;
  t=`📦 Item ditemukan: ${nm(n)} (${RAR[ITEMS[n][0]][0]})! +${xp} EXP.`;
  showDrop(`+${xp} EXP`,"#00ff88");showDrop("Item!",RAR[ITEMS[n][0]][1],150,25);
 }else if(r<.62){
  const k=Object.keys(NODES)[rand(0,3)];node={sk:k,icon:NODES[k].icon,left:rand(2,4)};if(s.buffs&&s.buffs.node&&s.buffs.node.exp>Date.now())node.left++;
  t=`${NODES[k].icon} Kamu menemukan ${NODES[k].txt}! Butuh ${NODES[k].tool}.`;
 }else if(r<.80){
  {const p=pool();spawn(p[rand(0,p.length-1)])}t=`⚔️ Menemukan ${enemy.name} Lv ${enemy.level}!`;
 }else if(r<.90){
  const h=rand(5,15)+s.level*2,xp=rand(s.level,2*s.level+1);s.hp=Math.min(s.maxHp,s.hp+h);addXP(xp);
  t=`💧 Menemukan mata air. +${h} HP.`;
  showDrop(`+${h} HP`,"#ff4757");showDrop(`+${xp} EXP`,"#00ff88",150,25);
 }else t="💨 Jalanan sunyi... tidak ada apa-apa.";
 eventText(t);partyStep();save();renderAction();
 let sec=Math.max(3500,rand(4000,9000)*(Date.now()<sprintUntil?.75:1));if(isAdmin)sec=Math.floor(sec/4);if(isAdmin&&s.fast)sec=300;
 btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
 btn.style.setProperty("--cd",sec+"ms");btn.classList.add("cooling");
 const sc=document.getElementById("scene");sc.style.setProperty("--cd",sec+"ms");sc.classList.remove("walk");void sc.offsetWidth;sc.classList.add("walk");
 setTimeout(()=>{cooldown=false;btn.disabled=false;btn.classList.remove("cooling");btn.innerHTML='<i class="fa-solid fa-hand-point-right"></i> Take a Step'},sec);
}

// GATHERING
function gather(){
 if(!node)return;
 const n=NODES[node.sk];
 if(!s.tools[n.tool])return toast(`Butuh ${n.tool} (beli di Shop)`);
 if(chance(Math.min(.95,.5+s.sk[node.sk][0]*.05))){
  const x=rand(4,8);s.inv.push(n.res);s.q.gathers++;s.itemsFound=(s.itemsFound||0)+1;skillXP(node.sk,x);
  toast(`+1 ${n.res}`);showDrop(`+${x} ${node.sk} XP`,"#5ce1e6");
 }else toast("Gagal, coba lagi!");
 if(--node.left<=0){node=null;eventText("🌿 Resource di area ini sudah habis.")}
 save();renderAction();
 if(node)openGather();else closePanel();
}

// BATTLE
function fight(kind){
 if(!enemy)return;let msg="";
 if(kind==="run"){
  if(chance(enemy.boss?.3:.6)){enemy=null;eventText("🏃 Kamu berhasil kabur.");renderAction();closePanel();return}
  msg="Gagal kabur! ";
 }else if(kind==="herb"){
  const i=s.inv.indexOf("Healing Herb");if(i<0)return toast("Tidak ada Healing Herb");
  s.inv.splice(i,1);s.hp=Math.min(s.maxHp,s.hp+35);msg="🌿 +35 HP. ";
 }else{
  if(kind==="sp"){if(s.energy<10)return toast("⚡ Butuh 10 Energy");s.energy-=10}
  if(kind==="sp"||chance(Math.min(.95,.6+dexT()*.02))){
   let d=rand(Math.max(1,atk()-3),atk()+5);if(kind==="sp")d=Math.round(d*2.2);
   const crit=chance(.05+dexT()*.005+critB()/100);if(crit)d*=2;
   if(enemy.pvp)d=Math.max(1,Math.round(d-(enemy.def||0)*.3));enemy.hp-=d;msg=`${kind==="sp"?"💫 Special":"⚔️ Serangan"} ${crit?"CRIT ":""}-${d} HP. `;
  }else msg="Seranganmu meleset! ";
  if(enemy.hp<=0)return win(msg);
 }
 const h=s.god?0:Math.max(1,rand(enemy.attack-3,enemy.attack+3)-dfn());
 s.hp=Math.max(0,s.hp-h);
 eventText(`${msg}${enemy.name} membalas -${h} HP.`);
 if(s.hp===0)return lose();
 save();openPanel("battle");
}

function win(msg){
 if(enemy.arena)return arenaWin(msg);
 if(enemy.pvp){const g=enemy.steal||0,x=rand(enemy.xp[0],enemy.xp[1]);addGold(g);const lv=addXP(x);s.pk=(s.pk||0)+1;if(SOCK)SOCK.emit("pvp:result",{target:enemy.pvp,won:true,gold:g});eventText(`${msg}🏆 Kamu mengalahkan ${esc(enemy.name)}! +${g.toLocaleString()}G +${x}XP${lv?" LEVEL UP!":""}`);enemy=null;save();renderAction();closePanel();return}
 const g=(Math.round(rand(enemy.gold[0],enemy.gold[1])*enemy.m)),x=(Math.round(rand(enemy.xp[0],enemy.xp[1])*enemy.m*buffMul("battle")));
 addGold(g);const lv=addXP(x);if(enemy.pvp)s.pk=(s.pk||0)+1;else s.kills++;s.npc=s.npc||{};s.npc[enemy.name.replace(/^\W+/,"")]=1;s.q.kills++;if(enemy.boss)s.bk++;
 let d="";
 if(chance(enemy.boss?1:.35)){const n=rollItem(enemy.boss?4:0,enemy.level);s.inv.push(n);d=` Drop: ${nm(n)}.`}
 if(chance(.08)){const n=rollItem();s.inv.push(n);d+=` Bonus: ${nm(n)}!`}
 eventText(`${msg}🏆 ${enemy.name} mati! +${g}G +${x}XP.${d}${lv?" LEVEL UP!":""}`);
 showDrop(`+${x} EXP`,"#00ff88");showDrop(`+${g} Gold`,"#ffcc00",150,25);
 enemy=null;save();renderAction();closePanel();
}
function lose(){
 s.hp=0;if(enemy.pvp&&SOCK)SOCK.emit("pvp:result",{target:enemy.pvp,won:false,gold:0});
 eventText(`☠️ Kamu kalah dari ${enemy.name}. HP 0, cari Healer atau pakai Herb.`);
 enemy=null;save();renderAction();closePanel();
}

// ITEM, SHOP, QUEST
function heal(n="Healing Herb"){
 if(s.hp>=s.maxHp)return toast("HP penuh");
 const i=s.inv.indexOf(n);if(i<0)return toast("Tidak ada "+n);
 const v=ITEMS[n][2]||35;s.inv.splice(i,1);s.hp=Math.min(s.maxHp,s.hp+v);save();toast(`+${v} HP`);openPanel(n==="Healing Herb"?"potions":"inventory");
}
function equip(n){
 if(ilv(n)>s.level)return toast(`Butuh Level ${ilv(n)} untuk memakai ${n}`);
 const t=ITEMS[n][1],old=s.eq[t];
 s.inv.splice(s.inv.indexOf(n),1);if(old)s.inv.push(old);
 s.eq[t]=n;toast("Dipakai: "+n);save();openPanel("inventory");
}
function sell(n){
 if((s.locked||[]).includes(n))return toast("🔒 Item terkunci, buka kunci dulu di Inspect");
 s.inv.splice(s.inv.indexOf(n),1);s.gold+=ITEMS[n][3];save();toast(`Terjual +${ITEMS[n][3]}G`);openPanel("inventory");
}
function toggleLock(n){s.locked=s.locked||[];const i=s.locked.indexOf(n);if(i>=0)s.locked.splice(i,1);else s.locked.push(n);save();inspectItem(n)}
function quickSell(n){if((s.locked||[]).includes(n))return toast("🔒 Item terkunci");s.inv.splice(s.inv.indexOf(n),1);s.gold+=ITEMS[n][3];save();toast(`Terjual +${ITEMS[n][3]}G`);closePanel()}
function inspectItem(n){
 const it=ITEMS[n];if(!it)return;
 const [r,ty,v,p]=it,eq=SLOTS.some(x=>x[0]===ty)||ty==="tool",cur=eq&&s.eq[ty]?ITEMS[s.eq[ty]][2]:null,locked=(s.locked||[]).includes(n);
 const circ=1000+((Array.from(n).reduce((a,c)=>a+c.charCodeAt(0),0)*37)%500000),lo=Math.round(p*3*(1+r)),hi=Math.round(p*(40+r*60)),inColl=!["potion","boost","tool"].includes(ty);
 document.getElementById("modalTitle").textContent="";
 document.getElementById("modalBody").innerHTML=`<div style="text-align:center">${ico(n,"lg")}<h3 class=qt>${nmT(n)}</h3><div style="color:${RAR[r][1]};font-weight:600;margin-bottom:6px">${RAR[r][0]}</div></div>`
  +(eq||exTxt(n)?`<div class=gm-sec><span>Stats</span></div>${eq?`<div class=stat><span>${isOffT(ty)?"⚔️":"🛡️"} +${v.toLocaleString()} ${isOffT(ty)?"str":"def"}</span></div>`:""}${exTxt(n)?`<div class=stat><span>${exTxt(n).replace(/^ · /,"")}</span></div>`:""}${cur!=null?`<div class=stat><span>Currently equipped</span><b>+${cur.toLocaleString()}</b></div>`:""}`:"")
  +`<div class=gm-sec><span>Details</span></div><div class=dgrid3><div><small>Type</small><br><b>${ty}</b></div><div><small>Value</small><br><b>🪙 ${p.toLocaleString()}</b></div><div><small>Collection</small><br><b style="color:${inColl?"#2ecc71":"#e74c3c"}">${inColl?"✔":"✖"}</b></div><div><small>Level</small><br><b>${ilv(n).toLocaleString()}</b></div><div><small>Circulation</small><br><b>${circ.toLocaleString()}</b></div><div><small>Yours</small><br><b>${s.inv.filter(x=>x===n).length}</b></div></div>`
  +`<div class=gm-sec><span>Market Value</span></div><div class=stat><span>🪙 ${lo.toLocaleString()} to ${hi.toLocaleString()}</span></div>`
  +`<div class=gm-sec><span>Actions</span></div><div class=agrid>`
  +(eq?`<button class=btn-admin onclick="equip('${n.replace(/'/g,"\'")}');closePanel()">Equip</button>`:`<button class=btn-admin disabled>Equipped</button>`)
  +`<button class=btn-admin onclick="closePanel();navGo('market')">View on Market</button>`
  +`<button class=btn-admin ${locked?"disabled":""} onclick="quickSell('${n.replace(/'/g,"\'")}')">Quick Sell</button>`
  +`<button class=btn-admin onclick="toggleLock('${n.replace(/'/g,"\'")}')">${locked?"🔓 Unlock Item":"🔒 Lock Item"}</button>`
  +`</div><button class="fight alt" style="margin-top:12px;background:#111" onclick="openPanel('inventory')">Close</button>`;
 const m=document.getElementById("modal");m.classList.remove("full");m.classList.remove("hidden");
}
function buy(i){
 const [n,p,,t]=SHOP[i];
 if(s.gold<p)return toast("❌ Gold tidak cukup!");
 if(t==="tool"&&s.tools[n])return toast("Sudah dimiliki");
 s.gold-=p;
 if(t==="tool")s.tools[n]=1;else s.inv.push(n);s.buys=(s.buys||0)+1;
 save();toast("🛒 Beli "+n);openPanel("shop");
}

function adminGive(t){const p=Object.keys(ITEMS).filter(k=>ITEMS[k][0]==t),n=p[rand(0,p.length-1)];s.inv.push(n);save();toast("Dapat: "+n)}
function adminLevel(n){for(let i=0;i<n;i++)addXP(nextXP());save();toast("Level "+s.level)}
function openAdminPanel(){navGo("admin")}

function openPanel(type){
 lastPanel=type;
 const m=document.getElementById("modal"),t=document.getElementById("modalTitle"),b=document.getElementById("modalBody");
 let h="";m.classList.toggle("full",type==="battle");m.classList.toggle("page",["char","profile","hub","inventory","shops","shop","town","loc","settings","party","myparty","leader","lbview","boards","social","events","guilds","allguilds","tasks","craft","collect","prof","bank","mahol","chests","support","diamond","awards","market","online","pvp","avatars","notes","about","admin","chat","legacy"].includes(type)||(!!PAGE&&type!=="battle"));
 if(type==="stats"){
  t.textContent="";
  const cr=(a,v,m)=>`<div class=cm-row><b>${a}</b><span><b>${v.toLocaleString()}</b> / ${m.toLocaleString()}</span></div>`;
  h=`<div class=cm-ban>${avHTML()}<div><b>${s.name}</b><span>Lv.${s.level}</span></div></div>${cr("Health",s.hp,s.maxHp)}${pbar(s.hp,s.maxHp,"#e84040")}${cr("Experience",s.xp,nextXP())}${pbar(s.xp,nextXP(),"#0f9d6e")}`
   +`<div class=cm-two><div>${cr("EP",s.energy,100)}${pbar(s.energy,100,"#f5b82e")}</div><div>${cr("QP",s.qe,50)}${pbar(s.qe,50,"#5b9cff")}</div></div>`
   +`<div class=gm-sec><span>Currencies</span></div><div class=stat><span>Gold</span><b>🪙 ${s.gold.toLocaleString()}</b></div><div class=stat><span>Bank</span><b>🪙 ${s.bank.toLocaleString()}</b></div>`
   +`<div class=gm-sec><span>Statistics</span></div><div class=stat><span>Steps</span><b>${s.steps}</b></div><div class=stat><span>PvE Kill</span><b>${s.kills}</b></div>`
   +`<div class=gm-sec><span>Rank</span></div><div id=statsExtra class=card2><p class=hint style="margin:0">Menghitung peringkat…</p></div>`
   +`<div class=gm-sec><span>Mushrooms of Energy Usage</span></div><div class=card2><div class=cm-row style="margin:0"><b>${muUsed()}</b><span style="color:#888">/ 125</span></div>${pbar(muUsed(),125,"#f5a623")}<small style="color:#888">Resets daily</small></div>`
   +`<div class=gm-sec><span>Awards</span></div><div class=card2 style="cursor:pointer" onclick="navGo('awards')"><div class=cm-row style="margin:0"><b>${Object.keys(s.aw).length}</b><span style="color:#888">/ ${AWARDS.length}</span></div>${pbar(Object.keys(s.aw).length,AWARDS.length,"#2ecc71")}<small style="color:#8b8bff">View Award Progress →</small></div>`
   +`<button class=fight style="background:#4f46e5;margin-top:14px" onclick="viewPlayer(s.name)">Public Profile</button><button class="fight alt" style="margin-top:8px" onclick="closePanel()">Close</button>`;
  setTimeout(()=>{
   if(lastPanel!=="stats"||!SOCK)return;
   SOCK.emit("leaderboard",list=>{
    const pct=(arr,v)=>{if(!arr||!arr.length)return null;const below=arr.filter(x=>x<v).length;return Math.max(0,100-(below/arr.length*100))};
    const rows=[["Strength",atk(),list.map(p=>p.str||0)],["Defence",dfn(),list.map(p=>p.def||0)],["Dexterity",dexT(),list.map(p=>p.dex||0)]];
    const el=document.getElementById("statsExtra");if(!el)return;
    el.innerHTML=rows.map(([l,v,arr])=>{const top=pct(arr,v);return `<div class=stat><span>${l}</span><span><b>${v.toLocaleString()}</b>${top!=null?` <small style="color:#888">Top ${top<1?top.toFixed(2):top.toFixed(1)}%</small>`:""}</span></div>`}).join("");
   });
  },0);
 }else if(type==="char"){
  t.textContent="Character";
  const sr=(k,l,v)=>`<div class="card2 flex"><div><small>${l}</small><br><b>${v}</b></div><button class=mini2 ${s.pts>0?"":"disabled"} onclick="addStat('${k}')">+</button></div>`;
  const pr=(l,v,m)=>`<div class=card2><small>${l}</small><div class=cm-row><b>${v} <span style="color:#888">/ ${m}</span></b><b>${Math.round(v/m*100)}%</b></div>${pbar(v,m,"#2ecc71")}</div>`;
  h=`<div class=pf-ban></div><div class=pf-av style="margin-top:-60px">${avHTML()}</div><div class=pf-n><b>${s.name}</b></div><div class=pf-lv>Level ${s.level}</div><button class=fight style="background:#4f46e5" onclick="viewPlayer(s.name)">View Public Profile</button>`
   +`<div class=gm-sec><span>Your Stats</span></div>${s.pts?`<div class=card2 style="border:1px solid #4f46e5">You have <b>${s.pts}</b> points remaining</div>`:""}${sr("str","Strength",atk())}${sr("def","Defence",dfn())}${sr("dex","Dexterity",s.dex)}<div class=card2><small>spATK Damage</small><br><b>+120%</b></div>`
   +`<div class=gm-sec><span>Skills</span></div>`+Object.entries(s.sk).map(([k,[l]])=>`<div class=srow><span>${NODES[k].icon} ${k}</span><span>Level ${l}</span></div>`).join("")
   +`<div class=gm-sec><span>Progress</span></div>${pr("Energy",s.energy,100)}${pr("Quest Points",s.qe,50)}${pr("Awards",Object.keys(s.aw).length,AWARDS.length)}`
   +`<div class=gm-sec><span>Danger Zone</span></div><button class="fight alt" style="background:#3a1a1a;color:#ff8a8a" onclick="navGo('legacy')"><i class="fa-solid fa-dna" style="margin-right:6px"></i>Legacy Mode${(s.legacy&&s.legacy.list.length)?` (x${s.legacy.list.length})`:""}</button>`;
 }else if(type==="profile"){
  t.textContent="Profile";
  const row=(a,v)=>`<div class=srow><span>${a}</span><b>${v}</b></div>`,nA=Object.keys(s.aw).length;let b="";
  if(ptab===0)b=`<div class=pf-ban></div><div class=pf-av style="margin-top:-60px">${avHTML()}</div><div class=pf-n><b>${s.name}</b> <small>#${s.name.length*1337%9000+1000}</small> <span class=on></span></div><div class=pf-lv>Level ${s.level}</div><div class=pf-pill>Online Now</div>${s.legacy&&s.legacy.list.length?`<div class=pf-pill style="background:#2a1830;color:#d9a3ff;margin-top:6px">🧬 Legacy x${s.legacy.list.length}</div>`:""}<div class="card2" style="text-align:center">“There is no motto for this player.”</div><div class=gm-sec><span>Feed</span></div><div class=card2>${s.feed.slice(0,3).map(f=>`<div class=srow><span><b>${f[0]}</b><br><small>${ago(f[1])}</small></span></div>`).join("")||"Belum ada aktivitas."}</div>`;
  else if(ptab===1)b=`<div class=card2><small>Strength</small><br><b>${atk()}</b></div><div class=card2><small>Defence</small><br><b>${dfn()}</b></div><div class=card2><small>Dexterity</small><br><b>${s.dex}</b></div><div class=card2><small>Health</small><div class=cm-row><b>${s.hp} <span style="color:#888">/ ${s.maxHp}</span></b><b>${Math.round(s.hp/s.maxHp*100)}%</b></div>${pbar(s.hp,s.maxHp,"#e84040")}</div>`
   +[["Gold",s.gold.toLocaleString()],["Steps",s.steps],["Awards",nA],["NPC Kills",s.kills],["Boss Kills",s.bk],["Quests Completed",s.qc],["Total EXP",s.tx.toLocaleString()],["Join Date",new Date(s.joined).toLocaleDateString()]].map(([a,v])=>row(a,v)).join("")
   +Object.entries(s.sk).map(([k,[l]])=>row(NODES[k].icon+" "+k,"Level "+l)).join("");
  else if(ptab===2)b=eqHTML();
  else b=`<div class=card2><div class=srow><span>🏅 Awards</span><b>${nA}</b></div></div><div class=card2>`+(AWARDS.filter(a=>s.aw[a[0]]).map(a=>`<div class=srow><span><b>${a[0]}</b><br><small>${a[1]}</small><br><small>${ago(s.aw[a[0]])}</small></span><button class="mini alt" onclick="toast('Highlight!')">Highlight</button></div>`).join("")||"Belum ada award.")+`</div>`;
  h=tabs(["PROFILE","STATS","EQUIPPED","AWARDS"],ptab,"profTab")+b;
 }else if(type==="hub"){
  t.textContent="Battle";
  const a=ARENA[s.au],pg=s.ap[s.au]||0,row=(i,n,v)=>`<div class=srow><span>${i} ${n}</span><b>${v}</b></div>`;
  h=`<div class=card2><button class=fight style="background:#4f46e5" onclick="openPanel('arenaPve')">⚔️ Fight Monster</button><button class="fight alt" style="margin-top:8px" onclick="openPanel('pvp')">Fight Players</button></div>`
   +`<div class=gm-sec><span>User</span></div><div class=card2><b>Energy Points</b>${pbar(s.energy,100,"#f5b82e")}<div class=cm-row><span style="color:#f5b82e"><b>${s.energy}</b>/100</span><span>+1 / 10 dtk</span></div><button class="fight alt" style="margin-top:10px" onclick="openRefill()">⚡ Refill Energy Points</button></div>`
   +`<div class=gm-sec><span>Progress</span></div><div class=card2>${row("🧟","NPC Kills",s.kills)}${row("☄️","Player Kills",s.pk||0)}${row("🗡️","World Boss Kills",s.bk)}</div>`
   +`<div class=gm-sec><span>Battle Arena</span></div><div class=card2>${row("⚔️","Current Tier",a[0])}${row("🎁","Progress",pg+" / "+a[2])}${pbar(pg,a[2],"#2ecc71")}<button class="fight alt" style="margin-top:12px" onclick="openArenaReward()">View Completion Reward</button><button class="fight alt" style="margin-top:8px" onclick="openPanel('arena')">View Arena Tiers</button></div>`
   +`<div class=gm-sec><span>Upcoming World Boss</span></div><div class=card2><div class=srow><span><b>${BOSS.name}</b><br><small>Level ${BOSS.level}</small><br><small>Muncul 1% tiap langkah</small></span><button class="mini alt" onclick="toast('Jalan terus buat nemu dia!')">View</button></div></div>`;
 }else if(type==="arenaPve"){
  t.textContent="";
  const i=s.au,a=ARENA[i];
  h=`<div class=gm-hd>⚔️ Battle Arena (PvE)</div><p class=gm-p>Generate a monster to fight in the Battle Arena. Kekuatan monster mengikuti tier arena dan levelmu.</p><div class=gm-sec><span>Modifiers</span></div><div class=chips><span>✨ ~${Math.round(a[1]*nextXP()*.06)} EXP Gain</span><span>✨ ${a[1]} EXP Modifier</span></div><div class=gm-sec><span>Cost</span></div><div class=chips><span>🪙 ${arenaCost(i)} Gold</span><span>⚡ 1 Energy Point</span></div><button class=fight style="background:#4f46e5;margin-top:16px" onclick="arenaFight(${i})">Generate Monster</button><button class="fight alt" style="margin-top:8px" onclick="closePanel()">Close</button>`;
 }else if(type==="inventory"){
  t.textContent="Inventory";
  h=tabs(["ITEMS","EQUIPPED"],itab,"invTab")+(itab?eqHTML():itemsHTML());
 }else if(type==="shops"){
  t.textContent="Shops";
  h=`<div class=tlist>`+SHOPS.map((x,i)=>`<button onclick="curShop=${i};openPanel('shop')"><span>${x[2]}</span>${x[0]}<i class="fa-solid fa-chevron-right"></i></button>`).join("")+`</div>`;
 }else if(type==="shop"){
  t.textContent=SHOPS[curShop][0];
  h=`<div style="margin-bottom:10px;color:#ffcc00;font-weight:bold">🪙 ${s.gold.toLocaleString()} G</div>`+(SHOPS[curShop][1].length?SHOP.map(([n,p,d,ty],i)=>{
   if(!SHOPS[curShop][1].includes(n))return "";const own=ty==="tool"&&s.tools[n];
   return `<div class=loot><span class=lr>${ico(n,"lg")}<span><b>${n}</b><br><small>${d}</small></span></span><button class=mini ${own?"disabled":""} onclick="buy(${i})">${own?"Dimiliki":p+"G"}</button></div>`}).join(""):"<p>Toko ini belum buka.</p>");
 }else if(type==="potions"){
  t.textContent="";
  const herb=s.inv.filter(x=>x==="Healing Herb").length,row=(c,i,n,m,f)=>`<div class=por onclick="${f}"><span class=pq>${c}x</span><span>${i}</span><span class=pn>${n}</span><span class=pm>${m}</span></div>`;
  h=`<div class=poh>🧪 <b>Use Potion</b></div><div class=pot><b class=pot-t>Travel</b>`
   +row(s.pots.exp,"🧪","5% Experience",potLeft("exp")||"5 minutes","usePot('exp')")+row(s.pots.rar,"🧪","5% Rarity Rate",potLeft("rar")||"15 minutes","usePot('rar')")
   +`<b class=pot-t>Health</b>`+row(herb,"🌿",`Healing Herb (+35 HP)`,`${s.hp}/${s.maxHp}`,"heal()")+row("1","🧙",`Folen the Healer`,`${5*s.level}G`,"healer()")
   +`</div><button class="fight alt" style="background:#111" onclick="closePanel()">Close</button>`;
 }else if(type==="battle"){
  t.textContent="";
  if(!enemy)h="<p>Jalan dulu cari musuh!</p>";else{
   const ph=Math.round(s.hp/s.maxHp*100),eh=Math.max(0,Math.round(enemy.hp/enemy.maxHp*100)),hb=(v,p)=>`<div class=hpr><i style="width:${p}%"></i><b>${v}</b></div>`;
   h=`<div class=bt><div class=bt-bars><div>${hb(s.hp,ph)}<div class=bt-n><b>${s.name}</b><span>${ph}%</span></div></div><div>${hb(Math.max(0,enemy.hp),eh)}<div class=bt-n><b>${enemy.name}</b><span>${eh}%</span></div></div></div>`
    +`<div class=bt-arena><div class=bt-sp>${avHTML("big")}</div><div class=bt-sp>${enemy.ico||"👹"}</div></div><div class=bt-log>${logs[0]||""}</div>`
    +`<div class=bt-panel><div class=bt-en><i class="fa-solid fa-bolt"></i><div class=ebar><i style="width:${s.energy}%"></i></div><b>${s.energy}/100</b></div><button class=fight style="background:#4f46e5" onclick="fight('atk')">Attack</button><button class="fight alt" style="margin-top:8px" onclick="fight('herb')">Use Item (${s.inv.filter(x=>x==="Healing Herb").length})</button><div class=btn-row><button class="fight sp" onclick="fight('sp')">💫 Special (10⚡)</button><button class="fight alt" onclick="fight('run')">🏃 Kabur</button></div></div></div>`;
  }
 }else if(type==="town"){
  t.textContent="Town";
  const L=LOCS[s.loc],sec=(n,r)=>`<div class=tsec>${n}</div><div class=tlist>`+r.map(([a,i,f])=>`<button onclick="${f||"toast('Segera hadir')"}"><span>${i}</span>${a}</button>`).join("")+`</div>`;
  h=`<div class=banner><h1>${L[0]}</h1><p>Kamu berkeliling di kota ${L[0]} dan mendengar obrolan penduduk bergema di telingamu.</p><div class=chips2><button class=mini2 style="background:#4f46e5" onclick="openPanel('loc')">Change Location</button><button class=mini2 onclick="toast('Segera hadir')">View Bulletin Board</button></div></div>`
   +sec("Community",[["Community Challenges","🚩","openPanel('challenges')"],["Town Supply Requests","🏘️","openPanel('townsupply')"]])
   +sec("Market",[["Player Market","🤝","openPanel('market')"],["Item Shop","🛒","openPanel('shops')"],["Diamond Market","💎"],["Bank","💰","openPanel('bank')"]])+sec("East Side",[["Mahols Hut","⛺","openPanel('mahol')"],["Folen the Healer","🧙","healer()"],["Item Dumping Grounds","🦴"]])
   +sec("Underground",[["Bounties","🎯"],["Vault","📦"]])+sec("Town Centre",[["Temple","⛪"],["Orphanage","🧸"],["Town Hall","📜"],["Library","📚"]]);
 }else if(type==="challenges"){
  t.textContent="";m.classList.remove("page");
  const C=commState(),row=(ic,l,v,need)=>`<div class=crow2><span>${ic}</span><div style="flex:1"><b>${l}</b><em>${v>=need?"Completed":Math.min(v,need).toLocaleString()+" / "+need.toLocaleString()}</em>${pbar(Math.min(v,need),need,v>=need?"#2ecc71":"#4f46e5")}</div></div>`;
  h=`<div class=poh>🚩 <b>Community Challenges</b></div><p class=gm-p>Complete challenges as a community to unlock rewards for everyone! Challenges reset every week.</p>`
   +row("📦","Items Collected",C.items,50)+row("📖","Total Quest Success",C.quests,10)+row("🥾","Steps Taken",C.steps,500)
   +`<button class=fight style="background:#4f46e5;margin-top:14px" onclick="openPanel('challengesReward')">View Rewards</button>`
   +(C.claimed?`<p class=hint>You have already redeemed the reward this week.</p>`:"")
   +`<p class=hint>New challenges in ${untilTxt(C.end)}</p><button class="fight alt" style="margin-top:8px;background:#111" onclick="closePanel()">Close</button>`;
 }else if(type==="challengesReward"){
  t.textContent="";m.classList.remove("page");
  const C=commState();
  h=`<div class=poh>🚩 <b>Rewards</b></div><div style="text-align:center;padding:8px 0 16px;line-height:1.9"><div>30% Travel Experience for 240 minutes</div><div>30% Battle Experience for 240 minutes</div><div>30% Quest Experience for 240 minutes</div><div>30% Profession Experience for 240 minutes</div></div>`
   +`<button class=fight style="background:${C.done&&!C.claimed?"#4f46e5":"#2a2a6a"}" ${C.done&&!C.claimed?"":"disabled"} onclick="claimChallenge()">Redeem Rewards</button>`
   +(C.claimed?`<p class=hint>You have already redeemed the reward this week.</p>`:!C.done?`<p class=hint>Selesaikan ketiga progress dulu.</p>`:"")
   +`<button class="fight alt" style="margin-top:8px;background:#111" onclick="openPanel('challenges')">Close</button>`;
 }else if(type==="townsupply"){
  t.textContent="";m.classList.remove("page");
  const T=townState(),cats=[["boots","Boots","👢",5],["helmet","Helmet","🪖",5],["weapon","Weapon","⚔️",10],["armour","Armour","🛡️",10],["gauntlet","Gauntlet","🧤",5]];
  h=`<div class=poh>🏘️ <b>Town Supply Requests</b></div><p class=gm-p>The town is in need of supplies to improve overall well-being of citizens. Contribute to the supply requests below and earn rewards for your efforts!</p>`
   +cats.map(([k,l,ic,need])=>{const v=T.contrib[k]||0;return `<div class=crow2><span>${ic}</span><div style="flex:1"><b>${l}</b><em>${v>=need?"Completed":v+" / "+need}</em>${pbar(Math.min(v,need),need,v>=need?"#2ecc71":"#8b5cf6")}</div></div>`}).join("")
   +`<button class=fight style="background:#4f46e5;margin-top:14px" onclick="openPanel('townContribute')">Contribute Supplies</button>`
   +`<button class="fight alt" style="margin-top:8px" onclick="openPanel('townReward')">View Rewards</button>`
   +`<button class="fight alt" style="margin-top:8px" onclick="toast('Segera hadir')">View Point Distribution</button>`
   +`<p class=hint>New Town Supply Requests in ${untilTxt(T.end)}</p><button class="fight alt" style="margin-top:8px;background:#111" onclick="closePanel()">Close</button>`;
 }else if(type==="townContribute"){
  t.textContent="Contribute Supplies";m.classList.remove("page");
  const TYPEMAP={boots:"boots",helmet:"helmet",weapon:"weapon",armour:"armor",gauntlet:"gauntlet"},cats=[["boots","Boots","👢"],["helmet","Helmet","🪖"],["weapon","Weapon","⚔️"],["armour","Armour","🛡️"],["gauntlet","Gauntlet","🧤"]];
  h=cats.map(([k,l,ic])=>{const items=[...new Set(s.inv)].filter(n=>ITEMS[n]&&ITEMS[n][1]===TYPEMAP[k]);return `<div class=tsec>${ic} ${l}</div>`+(items.length?items.map(n=>`<div class=loot><span class=lr>${ico(n,"lg")}<span>${nmT(n)}<br><small>x${s.inv.filter(x=>x===n).length}</small></span></span><button class=mini onclick="townContribute('${k}',DECODE('${encodeURIComponent(n)}'))">Sumbang</button></div>`).join(""):`<p class=hint>Tidak ada item ${l} di inventory.</p>`)}).join("")
   +`<button class="fight alt" style="margin-top:8px;background:#111" onclick="openPanel('townsupply')">Close</button>`;
 }else if(type==="townReward"){
  t.textContent="";m.classList.remove("page");
  const T=townState(),done=["boots","helmet","weapon","armour","gauntlet"].every(k=>(T.contrib[k]||0)>=T.need[k]);
  h=`<div class=poh>🏘️ <b>Rewards</b></div><div style="text-align:center;padding:8px 0;line-height:1.9"><b>Redeemable Rewards</b><div>20% Travel Experience for 300 minutes</div><div>20% PvE Battle Experience for 300 minutes</div><div>+1 Gathering Node for 300 minutes</div><b style="display:block;margin-top:10px">Global Passive Rewards</b><div>+2 Daily Healer additional uses</div></div>`
   +`<button class=fight style="background:${done&&!T.claimed?"#4f46e5":"#2a2a6a"}" ${done&&!T.claimed?"":"disabled"} onclick="claimTown()">Redeem Rewards</button>`
   +(T.claimed?`<p class=hint>You have already redeemed the reward this week.</p>`:!done?`<p class=hint>Lengkapi semua kategori dulu.</p>`:"")
   +`<button class="fight alt" style="margin-top:8px;background:#111" onclick="openPanel('townsupply')">Close</button>`;
 }else if(type==="showcase"){
  t.textContent="Edit Showcase";
  const u=[...new Set(s.inv)];
  h=`<p class=hint>Pilih maks 9 item untuk dipamerkan di profil (${(s.showcase||[]).length}/9).</p>`+(u.length?u.map(n=>{const on=(s.showcase||[]).includes(n);return `<div class=loot><span class=lr>${ico(n,"lg")}<span>${nmT(n)}</span></span><button class="mini ${on?"":"alt"}" onclick="toggleShowcase(DECODE('${encodeURIComponent(n)}'))">${on?"✔ Dipilih":"Pilih"}</button></div>`}).join(""):"<p class=hint>Inventory kosong.</p>");
}else if(type==="guildview"){
  t.textContent="";
  h=`<p class=hint>Loading…</p>`;
  const render=g=>{if(lastPanel!=="guildview")return;
   if(!g){document.getElementById("modalBody").innerHTML="<p class=hint>Guild tidak ditemukan.</p>";document.getElementById("modalTitle").textContent="Guild";return}
   document.getElementById("modalTitle").textContent=`${g.name} [${g.tag}]`;
   document.getElementById("modalBody").innerHTML=`<p class=hint>Owner: ${esc(g.owner)} · ${g.members.length} members</p><div class=tlist>`+g.members.map(m=>`<button onclick="viewPlayer(DECODE('${encodeURIComponent(m)}'))"><span>👤</span>${esc(m)}${m===g.owner?" 👑":""}</button>`).join("")+`</div>`};
  const go2=()=>{if(!SOCK)return render(null);if(!netHello)return void setTimeout(go2,120);SOCK.emit("guild:get",vgName,render)};go2();
}else if(type==="player"){
  t.textContent="";
  h=`<p class=hint>Loading…</p>`;
  const nm=vpName||s.name;
  const render=d=>{if(lastPanel!=="player")return;
   if(!d){document.getElementById("modalBody").innerHTML=`<p class=hint>Pemain "${esc(nm)}" tidak ditemukan di server (belum pernah login).</p>`;document.getElementById("modalTitle").textContent="Profile";return}
   renderPlayerProfile(d,nm)};
  const go1=()=>{if(!SOCK)return render(null);if(!netHello)return void setTimeout(go1,120);SOCK.emit("profile:get",nm,render)};go1();
 }else if(type==="quests"){
  t.textContent="Quests";
  const F=["All","In Progress","Completed","Not Completed"];
  h=`<div class=gm-sec><span>User</span></div><div class=card2><b>Quest Points</b>${pbar(s.qe,50,"#5b9cff")}<div class=cm-row><span><b style="color:#5b9cff">${s.qe}</b>/50</span><span style="color:#aaa">+1 / 10 dtk</span></div></div>`
   +`<div class=gm-sec><span>Bonuses</span></div><div class=elist><div class=er><div>✨ Experience</div><b>+${(s.qc*.5).toFixed(1)}%</b></div><div class=er><div>🪙 Gold</div><b>+${(s.qc*.5).toFixed(1)}%</b></div></div>`
   +`<div class=qf>${F.map((x,i)=>`<button class="${i===qf?"sel":""}" onclick="qf=${i};openPanel('quests')">${x}</button>`).join("")}</div>`
   +`<p class=hint>${QUESTS.length} quests (Lv 1 – ${QUESTS[QUESTS.length-1][1]}) · data asli SimpleMMO</p>`
   +QUESTS.map((q,i)=>[q,i]).reverse().map(([q,i])=>{const d=s.qd[i]||0,done=d>=q[4],lock=q[1]>s.level;
    if(qf===1&&(done||!d)||qf===2&&!done||qf===3&&done)return "";
    return `<button class="qc ${done?"done":""} ${lock?"lock":""}" onclick="${lock?`toast('Butuh Level ${q[1]}')`:`openQuest(${i})`}"><span class=qi>${lock?"🔒":q[0]}</span><span class=qb><b>${q[3]}</b><span class=qlv>Level ${q[1]}</span></span><span class=ql>${done?"✔ Done":(q[4]-d)+" Left"}</span></button>`}).join("");
 }else if(type==="arena"){
  t.textContent="";m.classList.remove("page");
  h=`<div class=al>`+ARENA.map((a,i)=>{const pg=s.ap[i]||0,st=i<s.au?"done":i===s.au?"cur":"lk";return `<div class="ar ${st}" onclick="${st==="lk"?"toast('Selesaikan tier sebelumnya')":`arenaFight(${i})`}"><span class=ri>${["⚔️","🥉","🥈","🥇","💠","☠️","⛧","🔮","🌋","☄️","✴️"][i]}</span><b>${a[0]}</b><em>${st==="done"?"Completed":st==="cur"?`${a[2]-pg}<br>Remaining`:"Locked"}</em></div>`}).join("")+`</div><button class="fight alt" style="margin-top:14px;background:#1a1a1c" onclick="closePanel()">Close</button>`;
 }else if(type==="loc"){
  t.textContent="Horse and Carriage";
  h=LOCS.map((l,i)=>l[1]>s.level+20?"":`<button class="locc ${i===s.loc?"cur":""} ${l[1]>s.level?"lock":""}" style="background:${LBG[i]}" onclick="goLoc(${i})"><b>${l[0]}</b><span class=lchips><span>Level ${l[1]}</span><span>${NET.online.filter(p=>(p.loc||0)===i).length} online <i class="fa-solid fa-users"></i></span></span></button>`).join("")+`<p class=hint>You can unlock more locations by levelling up</p>`;
 }else if(type==="settings"){
  t.textContent="Settings";
  const sec=(n,r)=>`<div class=tsec>${n}</div><div class=tlist>`+r.map(([a,i,f])=>`<button onclick="${f||"toast('Segera hadir')"}"><span>${i}</span>${a}</button>`).join("")+`</div>`;
  h=sec("Character",[["Change avatar","🧙","openPanel('avatars')"],["Change username","🪶","renameChar()"],["Change username colour","🧪"],["Change profile number","📜"],["Safe Mode","🛡️"]])+sec("Account",[["Change Password","🔒"],["Change Email Address","💾"]])
   +sec("More",[["Push Notifications","❗"],["Membership Settings","🌐"],["Notifications Filter","❕"],["Dark Mode","🌌","toast('Dark mode sudah aktif')"],["Blocked Players","🙁"],["Customisation","⚙️"]])
   +sec("Deletion",[["Delete Account","❌","if(confirm('Hapus save karakter ini?')){localStorage.removeItem(SK);location.reload()}"]]);
 }else if(type==="party"){
  t.textContent="Travel Party";const mp=myParty();
  h=`<div class=tsec>Options</div><div class=tlist>${mp?`<button onclick="openPanel('myparty')"><span>👥</span>${esc(mp.name)} (${mp.members.length}/4)<i class="fa-solid fa-chevron-right"></i></button><button onclick="partyLeave()"><span>🚪</span>Leave Party</button>`:`<button onclick="partyCreate()"><span><i class="fa-solid fa-circle-plus" style="margin:0;color:#ddd"></i></span>Create Party</button>`}</div>`
   +`<div class=tsec>Invites</div><p class=hint>There are no pending Invites</p>`
   +`<div class=tsec>Public Parties</div>`+(!SOCK?`<p class=hint>Tidak terhubung ke server.</p>`:NET.parties.filter(p=>!mp||p.id!==mp.id).length?`<div class=tlist>`+NET.parties.filter(p=>!mp||p.id!==mp.id).map(p=>{const f=4-p.members.length;return `<button onclick="${f>0?`partyJoin('${p.id}')`:"toast('Party penuh')"}"><span>👥</span><span class=pp><b>${esc(p.name)}</b><small style="color:#aaa">${esc(p.owner)}</small></span><em class="${f>0?"free":"full"}">${f>0?f+" space"+(f>1?"s":"")+" free":"Full"}</em></button>`}).join("")+`</div>`:`<p class=hint>There are no public parties. Party muncul saat ada pemain lain online.</p>`);
 }else if(type==="myparty"){
  const mp=myParty();if(!mp){h="<p class=hint>Kamu tidak di party.</p>";t.textContent="Party"}else{
  t.textContent=`${mp.name} (${mp.members.length}/4)`;
  h=mp.members.map(x=>`<div class=loot><span class=lr style="cursor:pointer" onclick="viewPlayer(DECODE('${encodeURIComponent(x.name)}'))">${avById(x.id)}<span><b>${esc(x.name)}</b>${x.id===myId?" (You)":""}<br><small>Level ${x.level}</small></span></span></div>`).join("")
   +`<p class=hint>Saat kamu melangkah, tiap anggota party yang online punya peluang memberi bonus EXP & Gold.</p><button class="fight alt" onclick="partyLeave()">Leave Party</button>`}
 }else if(type==="online"){
  t.textContent=`Players Online (${NET.online.length})`;
  const o=NET.online.filter(p=>p.id!==myId);
  h=!SOCK?`<p class=hint>Tidak terhubung ke server.</p>`:o.length?`<div class=tlist>`+o.map(p=>`<div class=loot><span class=lr style="cursor:pointer" onclick="viewPlayer(DECODE('${encodeURIComponent(p.name)}'))">${avImg(p.av)}<span><b>${esc(p.name)}</b><br><small>Level ${p.level}${p.guild?" · "+esc(p.guild):""} · 📍 ${LOCS[p.loc||0]?LOCS[p.loc||0][0]:"?"}</small></span></span><button class=mini onclick="pvpFight('${p.id}')">⚔️ Attack</button></div>`).join("")+`</div>`:`<p class=hint>Belum ada pemain lain yang online.</p>`;
 }else if(type==="pvp"){
  t.textContent="Fight Players";
  const o=NET.online.filter(p=>p.id!==myId);
  h=`<div class="card2 role"><div style="font-size:40px">⚔️</div><h3>PvP</h3><p>Lawan pemain sungguhan yang sedang online. Biaya 1⚡ per serangan. Menang = curi 5% gold lawan.</p></div>`
   +(!SOCK?`<p class=hint>Tidak terhubung ke server.</p>`:o.length?`<div class=tlist>`+o.map(p=>`<div class=loot><span class=lr style="cursor:pointer" onclick="viewPlayer(DECODE('${encodeURIComponent(p.name)}'))">${avImg(p.av)}<span><b>${esc(p.name)}</b><br><small>Level ${p.level} · STR ${p.str.toLocaleString()} · DEF ${p.def.toLocaleString()}</small></span></span><button class=mini onclick="pvpFight('${p.id}')">Attack</button></div>`).join("")+`</div>`:`<div class="card2" style="text-align:center"><b>🔒 PvP ditutup</b><p class=hint style="margin:8px 0 0">Belum ada pemain lain yang online. PvP otomatis dibuka saat ada pemain online.</p></div>`);
 }else if(type==="leader"){
  t.textContent="Leaderboards";
  h=`<div class=tlist>`+LB.map(([n,i,f])=>`<button onclick="lbKey='${n}';openPanel('lbview')"><span>${i}</span>${n}</button>`).join("")+`</div>`;
 }else if(type==="lbview"){
  const e=LB.find(x=>x[0]===lbKey);t.textContent=lbKey;
  h=`<p class=hint>Loading…</p>`;
  const render=list=>{const me={name:s.name,v:e[2](s)};let rows=e[3]?(list||[]).filter(p=>p.name.toLowerCase()!==s.name.toLowerCase()).map(p=>({name:p.name,v:p[e[3]]||0})):[];rows.push(me);rows.sort((a,b)=>b.v-a.v);
   if(lastPanel!=="lbview")return;document.getElementById("modalBody").innerHTML=`<div class=tlist>`+rows.slice(0,50).map((r,i)=>`<button class="${r===me?"me":""}" onclick="viewPlayer(DECODE('${encodeURIComponent(r.name)}'))"><span>${["🥇","🥈","🥉"][i]||"#"+(i+1)}</span>${esc(r.name)}${r===me?" (You)":""}<em>${r.v.toLocaleString()}</em></button>`).join("")+`</div>`+(e[3]?"":`<p class=hint>Skill ini belum dibagikan ke server, hanya menampilkan milikmu.</p>`)};
  setTimeout(()=>SOCK?SOCK.emit("leaderboard",render):render([]),0);
 }else if(type==="boards"){
  t.textContent="Discussion Boards";
  const sec=(n,r)=>`<div class=tsec>${n}</div><div class=tlist>`+r.map(([a,i,c])=>`<button onclick="toast('Board ${a} segera hadir')"><span>${i}</span>${a}<em>${c.toLocaleString()}</em></button>`).join("")+`</div>`;
  h=sec("Main",[["General","💬",6117],["Suggestions","❤️",25616],["Trade","🔁",8203],["Help","❓",3706],["Games and Competitions","🎲",1609],["Bugs","🐞",2990],["Guilds","🛡️",619]])+sec("Other",[["Introductions","👋",435],["Video Games","🎮",272],["Television","📺",92],["Music","🎵",200]]);
 }else if(type==="social"){
  t.textContent="Social Media";
  h=`<div class=tlist><button onclick="toast('Discord segera hadir')"><span>👾</span>Discord<i class="fa-solid fa-caret-right"></i></button><button onclick="toast('Instagram segera hadir')"><span>📸</span>Instagram<i class="fa-solid fa-caret-right"></i></button></div><div class=tlist><button onclick="toast('Road map segera hadir')"><span>🗺️</span>StepQuest Road Map<i class="fa-solid fa-caret-right"></i></button></div>`;
 }else if(type==="guilds"){
  t.textContent="Guilds";
  h=`<div class=card2 style="padding:0;background:#1c1c1f"><div style="padding:16px"><b>${s.guild?esc(s.guild):"No Guild"}</b><br><span style="color:#aaa">${s.guild?"Kamu anggota guild ini":"You are not in a guild"}</span></div><div class=gbtns><button class=mini2 onclick="openPanel('allguilds')">Find a Guild</button><button class=mini2 onclick="toast('Tidak ada undangan')">Invites</button>${s.guild?`<button class=mini2 onclick="guildLeave()">Leave Guild</button>`:`<button class=mini2 onclick="createGuild()">Create a Guild</button>`}</div></div>`
   +`<div class=tsec>More</div><div class=tlist><button onclick="openPanel('allguilds')"><span>🏰</span>All Guilds</button><button onclick="toast('Guild Wars segera hadir')"><span>🗡️</span>Guild Wars</button></div>`
   +`<div class=tsec>Leaderboards</div><div class=tlist><button onclick="openPanel('allguilds')"><span>🏆</span>Seasons</button><button onclick="openPanel('allguilds')"><span>🏆</span>Legacy</button></div>`;
 }else if(type==="allguilds"){
  t.textContent="All Guilds";
  h=!SOCK?`<p class=hint>Tidak terhubung ke server.</p>`:NET.guilds.length?`<div class=tlist>`+NET.guilds.slice().sort((a,b)=>b.members-a.members).map((g,i)=>`<button onclick="joinGuild(DECODE('${encodeURIComponent(g.name)}'))"><span>${["🥇","🥈","🥉"][i]||"🛡️"}</span><span class=pp><b>${esc(g.name)}</b><small style="color:#aaa">[${esc(g.tag)}] · ${g.members} members · owner ${esc(g.owner)}</small></span><em class=free>${s.guild===g.name?"Joined":"Join"}</em></button>`).join("")+`</div>`:`<p class=hint>Belum ada guild. Jadilah yang pertama membuat guild!</p>`;
 }else if(type==="tasks"){
  t.textContent="Tasks";
  const P=["daily","weekly","monthly"][ttab],T=taskState(P),done=T.list.filter(x=>x.cur>=x.n).length,pct=Math.round(done/5*100),R=TREW[P];
  h=tabs(["DAILY","WEEKLY","MONTHLY"],ttab,"taskTab")+`<div class=tsec>Completion Chest</div><div class="card2 trow"><span class=ti>🧰</span><div style="flex:1"><div class=cm-row style="margin:0"><span><b>${done}</b> / 5 tasks completed</span><span>${pct}%</span></div>${pbar(done,5,"#0f9d6e")}<small>${T.chest?"Chest sudah diambil":`Redeem this chest to get 💎 ${R[2]} diamonds`}</small>${done>=5&&!T.chest?`<br><button class=mini2 style="margin-top:8px" onclick="claimChest('${P}')">Redeem</button>`:""}</div></div>`
   +`<div class=tsec>Tasks</div><div class=elist>`+T.list.map((x,i)=>`<div class="trow tk"><span class=ti>${x.ico}</span><div style="flex:1"><div>${x.txt}</div>${pbar(Math.min(x.cur,x.n),x.n,"#0f9d6e")}<div class=tmeta><b>${Math.min(x.cur,x.n).toLocaleString()}</b> / ${x.n.toLocaleString()} ✨ ${R[0].toLocaleString()} EXP 🗝️ 2x ${R[1]} Keys</div>${x.got?`<button class=mini2 disabled>Claimed ✔</button>`:x.cur>=x.n?`<button class=mini2 style="background:#0f4a36" onclick="claimTask('${P}',${i})">Claim</button>`:`<button class=mini2 onclick="${x.go}">Proceed ›</button>`}</div></div>`).join("")+`</div>`
   +`<p class=hint>New tasks in ${untilTxt(T.end)}</p>`;
 }else if(type==="craft"){
  t.textContent="Crafting";
  const T=CTYPES[ct],have=matCount(T[3]),need=T[4]*cq,lock=s.craft[0]<T[2],ok=!lock&&have>=need&&s.energy>=cq;
  h=`<div class=tsec>What type of items do you want to craft?</div><button class="cbox" style="width:100%;cursor:pointer;color:#fff" onclick="openPanel('crafttype')">${T[1]} ${T[0]} ▾</button>`
   +`<div class=tsec>How many items do you want to craft?</div><div class=sp-in><input type=number min=1 value=${cq} onchange="cq=Math.max(1,+this.value||1);openPanel('craft')"><button onclick="cq=Math.max(1,cq-1);openPanel('craft')">−</button><button onclick="cq++;openPanel('craft')">+</button></div>`
   +`<div class=tsec>Requirements</div><div class=crow>${ico(MATN[T[3]],"sm")||"<span>🎒</span>"}${RAR[T[3]][0]} Materials<em style="color:${have>=need?"#4cd964":"#ff6b6b"}">${have>=need?"✔":"✖"} ${have}/${need}</em></div>`+(lock?`<div class=crow><span>🔒</span>Crafting level<em style="color:#ff6b6b">${T[2]} required</em></div>`:"")
   +`<div class=tsec>Cost</div><div class=crow><span>⚡</span>Energy cost<em>${cq}</em></div>`
   +`<div class=tsec>Outcome</div><div class=crow><span>🔨</span>Crafting EXP<em>${(T[2]*5+15)*cq}</em></div><div class=crow><span>✨</span>Character EXP<em>${cq*s.level*5}</em></div><div class=crow><span>🕒</span>Crafting Level<em>${s.craft[0]} (${s.craft[1]}/${50*s.craft[0]})</em></div>`
   +`<button class=fight style="background:${ok?"#4f46e5":"#2a2a6a"};margin-top:16px" onclick="doCraft()">Craft ${cq}x</button><p class=hint>Material (Common Material, Uncommon Material, dst.) ditemukan saat melangkah. Iron Ore, Oak Log, dll juga dihitung sebagai Common.</p>`;
 }else if(type==="crafttype"){
  t.textContent="";m.classList.remove("page");
  h=`<div class=tsec>What do you want to craft?</div><div class=tlist>`+CTYPES.map((c,i)=>{const lk=s.craft[0]<c[2];return `<button class="${lk?"lk2":""}" onclick="ct=${i};openPanel('craft')"><span>${c[1]}</span><span class=pp><b>${c[0]}</b>${lk?`<small style="color:#e74c3c">Crafting level ${c[2]} required</small>`:""}</span></button>`}).join("")+`</div>`;
 }else if(type==="collect"){
  t.textContent="Collections";
  const u=[...new Set(s.inv.concat(Object.values(s.eq).filter(Boolean)))],c=[["Avatars","🧙",AVATARS.length],["Collectables","🔮",u.filter(n=>ITEMS[n]&&ITEMS[n][1]==="mat").length],["Items","🛡️",u.filter(n=>ITEMS[n]&&!["mat","potion"].includes(ITEMS[n][1])).length],["Sprites","🐾",s.party.length],["Backgrounds","🌄",Object.keys(s.vis||{0:1}).length],["Cards","🃏",0],["Events","🎁",0],["NPCs","👹",Object.keys(s.npc||{}).length]];
  h=`<div class=tsec>Your Collection</div><div class=tlist>`+c.map(([n,i,v])=>`<button onclick="${n==="Avatars"?"openPanel('avatars')":`toast('${n}: ${v} dikoleksi')`}"><span>${i}</span>${n}<em>${v}</em></button>`).join("")+`</div>`;
 }else if(type==="prof"){
  const P=profS(),c=PROFS.find(x=>x[0]===P.cur),[lv,xp]=P.lv[P.cur],R=ranks(P.cur),ci=R.reduce((a,r,i)=>lv>=r[1]?i:a,0),cr=R[ci],need=profNeed(lv);
  t.textContent="Profession";
  const rk=(r,cls)=>`<div class="rk ${cls}"><span class=ri>${r[2]}</span><div style="flex:1"><div class=cm-row style="margin:0"><b>${r[0]}</b><span style="color:#aaa">${cls==="lk"?"Level Required":"Level"} <b style="color:#fff">${r[1].toLocaleString()}</b></span></div><div class=chips style="justify-content:flex-start;margin-top:8px"><span>✨ ${r[3]}/min</span><span>${c[1]} ${r[4]}/min</span><span>🪙 ${r[5]}/min</span></div></div></div>`;
  h=`<div class="card2 pc"><div class=gm-ico>${c[1]}</div><b style="font-size:18px">${P.cur}</b><div>${cr[0]}</div><div>Level ${lv}</div><button class=fight style="background:#4f46e5;margin-top:14px" onclick="profWork()">Start Working</button><button class="fight alt" style="margin-top:8px;background:#2a2a2d" onclick="openPanel('profpick')">Switch Profession</button></div>`
   +`<div class=card2><b>Experience</b>${pbar(xp,need,"#4f46e5")}<span><b style="color:#7c7cff">${(need-xp).toLocaleString()}</b> <span style="color:#aaa">EXP needed</span></span></div>`
   +`<div class=card2><b>Energy Points</b>${pbar(s.energy,100,"#f5b82e")}<div class=cm-row><span><b style="color:#f5b82e">${s.energy}</b>/100</span><span class=regen>+1 / 10 dtk</span></div><small>Energy sama dengan Energy di profil (dipakai juga untuk Sprint, Arena, Crafting).</small></div>`
   +`<div class=gm-sec><span>Current Rank</span></div>${rk(cr,"")}`
   +`<div class=tsec>Unlocked Ranks</div>`+R.filter((r,i)=>i<ci).map(r=>rk(r,"")).join("")
   +`<div class=tsec>Locked Ranks</div>`+R.filter((r,i)=>i>ci).map(r=>rk(r,"lk")).join("");
 }else if(type==="profpick"){
  t.textContent="";const P=profS();
  h=`<div class=poh>🕒 <b>Professions</b></div><div style="margin-top:10px">`+PROFS.map(([n,i,st])=>`<div class="pr ${pp===n?"sel":""} ${P.cur===n?"cur":""}" onclick="pp='${n}';openPanel('profpick')"><span class=ri>${i}</span><b>${n}</b>${P.cur===n?"":`<em>${{Strength:"🗡️",Defence:"🛡️",Dexterity:"💨"}[st]} ${st}</em>`}</div>`).join("")
   +`</div><p class=hint>You can change professions without losing your progress.</p><button class=fight style="background:#4f46e5" onclick="pickProf()">Choose Profession</button><button class="fight alt" style="margin-top:8px;background:#111" onclick="openPanel('prof')">Close</button>`;
 }else if(type==="bank"){
  t.textContent="Bank";
  h=`<div class="card2" style="text-align:center;padding:24px"><div style="color:#aaa">Bank Account Balance</div><div class=bal>🪙 ${s.bank.toLocaleString()}</div><small>Gold di tangan: ${s.gold.toLocaleString()}</small></div><div class=tsec>What do you want to do?</div><div class=sortbar><button onclick="bankDo(1)">Deposit</button><button onclick="bankDo(-1)">Withdraw</button></div>`;
 }else if(type==="mahol"){
  t.textContent="Mahol's Hut";const k=s.keys||{};
  h=`<div class="card2 trow"><div style="text-align:center;width:90px"><div style="font-size:52px">🧙‍♂️</div><b>Mahol</b></div><p style="flex:1;line-height:1.5">You come into a hut on the very outskirts of the town. As you enter, Mahol is sitting on the floor in the centre of the room with his eyes closed.<br><br>He opens his eyes, looks at your direction and says "I've been expecting you".</p></div>`
   +`<div class=tsec>More</div><div class=tlist><button onclick="openPanel('chests')"><span>🧰</span>Chests<em>🗝️ ${(k.Bronze||0)+(k.Silver||0)+(k.Gold||0)}</em></button><button onclick="claimRew('d')"><span>🎁</span>Daily Reward<em>${canRew('d')?"Ready":"Claimed"}</em></button><button onclick="claimRew('m')"><span>🎁</span>Monthly Reward<em>${canRew('m')?"Ready":"Claimed"}</em></button><button onclick="lottery()"><span>🎲</span>Lottery<em>${50*s.level}G</em></button><button onclick="toast('Belum ulang tahunmu 🎂')"><span>🎂</span>Birthday Gifts</button><button onclick="buyKey()"><span>🗝️</span>Buy Keys<em>1,000G</em></button></div>`;
 }else if(type==="chests"){
  t.textContent="Chests";const k=s.keys||{};
  h=`<div class=tlist>`+[["Bronze","🟫",1],["Silver","⬜",2],["Gold","🟨",3]].map(([n,i,q])=>`<button onclick="openChest('${n}')"><span>${i}</span>${n} Chest<em>${k[n]||0} keys</em></button>`).join("")+`</div><p class=hint>Dapatkan kunci dari Tasks atau beli di Mahol's Hut. Kunci lebih baik = item lebih langka.</p>`;
 }else if(type==="support"){
  t.textContent="Support";
  const role=(n,b,i,c,d)=>`<div class="card2 role" style="border-top:3px solid ${c}"><div style="font-size:44px">${i}</div><span class=rb style="border-color:${c}">${i} ${b}</span><h3>${n}</h3><p>${d}</p><a style="color:${c}" onclick="toast('Segera hadir')">See our ${n} →</a></div>`;
  h=`<div class="card2 role"><div style="font-size:44px">🦅</div><h3 style="font-size:22px">How can we help?</h3><p>Head over to our Helpdesk to create a support ticket.</p><button class=fight style="background:#4f46e5" onclick="toast('Helpdesk segera hadir')">Go To Helpdesk</button><button class="fight alt" style="margin-top:8px;background:#2a2a2d" onclick="openPanel('social')">Go To Discord</button><a style="color:#8b8bff;display:block;margin-top:10px" onclick="toast('Belum ada tiket')">View Your Legacy Support Tickets</a></div>`
   +`<div class=role style="padding:16px 0"><h3 style="font-size:22px">Our Team</h3><p>Volunteer staff supporting the StepQuest community. Please treat them with respect while they help keep the world fair, welcoming, and running smoothly.</p></div><div class=gm-sec><span>Staff Roles</span></div>`
   +role("Admins","Admin","🛡️","#f5c518","Oversee the staff team, make high-level decisions, and step into complex or escalated issues.")+role("Moderators","Mod","🛡️","#8b8bff","Answer questions, enforce community guidelines, and keep everyday interactions safe and constructive.")+role("Guardians","Guardian","🔘","#6aa8ff","Bridge the gap between players and senior staff so concerns reach the right people quickly.")
   +`<div class="card2 role"><h3 style="font-size:22px">Community Resources</h3><p>Our community is built on mutual respect, support, and collaboration.</p>`+[["Help Discussion Board","💜","#b58cff","A place you can ask questions, share solutions, and discuss various topics.","openPanel('boards')"],["Discord Server","💎","#6aa8ff","A place to chat with other players, share tips, and get support from the community.","openPanel('social')"],["Support Channel","💛","#f5c518","A place in our chat to get assistance from community members.","toast('Segera hadir')"]].map(([n,i,c,d,f])=>`<div class=res onclick="${f}"><span>${i}</span><div><b style="color:${c}">${n}</b><br><small>${d}</small></div><em>→</em></div>`).join("")+`</div>`;
 }else if(type==="diamond"){
  t.textContent="Rewards";
  const card=([n,i,c,f,col])=>`<button class=dc onclick="${f}"><span class=di>${i}</span><b style="${col?`color:${col}`:""}">${n}</b><span>💎 ${c}</span></button>`;
  h=`<div class="card2 role"><div style="font-size:40px">🔥</div><h3>SALE!</h3><p>Get <b>10%</b> off all diamond purchases.<br>Saldo kamu: <b>💎 ${(s.dia||0).toLocaleString()}</b></p></div><button class=fight style="background:#1f8a5a" onclick="toast('Pembelian diamond belum tersedia — dapatkan dari Completion Chest di Tasks')">💎 Buy Diamonds</button>`
   +`<div class=tsec>Best Sellers</div><div class=dg>`+DSHOP.slice(0,8).map(card).join("")+`</div><div class=tsec>Great Deals</div><div class=dg>`+DSHOP.slice(8).map(card).join("")+`</div>`;
 }else if(type==="awards"){
  t.textContent="Awards";
  const L=AWARDS.map(a=>{const p=AWP[a[0]],cur=p?Math.min(p[0](s),p[1]):0,done=!!s.aw[a[0]];return {a,cur,max:p?p[1]:1,done}}),dn=L.filter(x=>x.done).length,F=["All","Completed","Not Completed"];
  h=`<div class=tsec>Progress</div><div class=card2><div class=cm-row style="margin:0"><b>Awards Unlocked</b><span>${dn} / ${L.length}</span></div>${pbar(dn,L.length,"#4f46e5")}</div>`
   +`<div class=qf>${F.map((x,i)=>`<button class="${i===af?"sel":""}" onclick="af=${i};openPanel('awards')">${x}</button>`).join("")}</div>`
   +L.filter(x=>af===0||(af===1)===x.done).map(({a,cur,max,done})=>`<div class="aw ${done?"ok":""}"><span class=ri>🏅</span><div style="flex:1"><b>${a[0]}</b><br><small>${a[1]}</small>${pbar(cur,max,done?"#2ecc71":"#4f46e5")}<small>${cur.toLocaleString()} / ${max.toLocaleString()}</small></div><em>${done?"Completed":(max-cur).toLocaleString()+"<br>Remaining"}</em></div>`).join("");
 }else if(type==="market"){
  t.textContent="Player Market";
  const L=NET.listings.filter(l=>ITEMS[l.item]);
  h=`<div class=tabs>${["BUY","SELL","MY LISTINGS"].map((x,i)=>`<button class="${i===mt?"on":""}" onclick="mt=${i};openPanel('market')">${x}</button>`).join("")}</div>`
   +(!SOCK?`<p class=hint>Tidak terhubung ke server.</p>`:mt===0?`<p class=hint>Listing dari pemain lain · 🪙 ${s.gold.toLocaleString()}</p>`+(L.filter(l=>l.seller!==s.name).map(l=>`<div class=loot><span class=lr>${ico(l.item,"lg")}<span>${nmT(l.item)}<br><small>oleh ${esc(l.seller)} · Lv ${ilv(l.item)} · ${RAR[ITEMS[l.item][0]][0]}</small></span></span><button class=mini onclick="mBuy(${l.id})">${l.price.toLocaleString()}G</button></div>`).join("")||"<p class=hint>Belum ada listing dari pemain lain.</p>")
   :mt===1?`<p class=hint>Pasang itemmu, pembeli bisa pemain mana saja. Pajak 5%. Gold masuk otomatis walau kamu offline.</p>`+([...new Set(s.inv)].map(n=>`<div class=loot><span class=lr>${ico(n,"lg")}<span>${nmT(n)}<br><small>x${s.inv.filter(x=>x===n).length} · nilai ${ITEMS[n][3].toLocaleString()}G</small></span></span><button class=mini onclick="mSell(DECODE('${encodeURIComponent(n)}'))">Pasang</button></div>`).join("")||"<p class=hint>Inventory kosong.</p>")
   :(L.filter(l=>l.seller===s.name).map(l=>`<div class=loot><span class=lr>${ico(l.item,"lg")}<span>${nmT(l.item)}<br><small>${l.price.toLocaleString()}G</small></span></span><button class="mini alt" onclick="mCancel(${l.id})">Batal</button></div>`).join("")||"<p class=hint>Kamu belum memasang listing.</p>"));
 }else if(type==="avatars"){
  t.textContent="Avatars";
  h=`<p class=hint>Pilih avatar (data asli SimpleMMO dari smmo-db).</p><div class=avg>`+AVATARS.map((a,i)=>`<button class="avc ${i===(s.av||0)?"on2":""}" onclick="s.av=${i};save();openPanel('avatars')"><img src="${imgUrl(a[1])}" referrerpolicy="no-referrer" loading="lazy"><small>${esc(a[0])}</small></button>`).join("")+`</div>`;
 }else if(type==="admin"){
  t.textContent="🛡️ Admin Panel";
  if(!isAdmin){h=`<div class="card2" style="text-align:center"><b>🔒 Akses ditolak</b><p class=hint>Login dengan username <b>admin</b> untuk membuka Admin Panel.</p></div>`}else{
  const T=["PLAYER","ITEMS","WORLD","SAVE","SERVER"];
  h=tabs(T,atab,"admTab")+[admPlayer,admItems,admWorld,admSave,admServer][atab]();}
 }else if(type==="notes"){
  t.textContent="Notifications";s.nu=0;setTimeout(save,0);
  const L=(s.notes||[]).filter(n=>nf===0||n[0]===NCAT[nf]);
  h=`<select class=sel onchange="nf=+this.value;openPanel('notes')">${NCAT.map((c,i)=>`<option value=${i} ${i===nf?"selected":""}>${c}</option>`).join("")}</select>`
   +(L.length?`<div class=elist>`+L.map(n=>`<div class="er nt"><span class=ri>❗</span><div style="flex:1">${n[1]}<br><small>${ago(n[2])}</small></div><em class=ntag>${n[0]==="Player Interaction"?"Player":n[0]}</em></div>`).join("")+`</div>`:`<p class=hint>Belum ada notifikasi.</p>`)
   +((s.notes||[]).length?`<button class="fight alt" style="margin-top:10px" onclick="s.notes=[];save();openPanel('notes')">Hapus semua</button>`:"");
 }else if(type==="legacy"){
  t.textContent="Legacy";
  const L=s.legacy&&s.legacy.list||[];
  h=`<div class="warn" style="margin-bottom:14px">⚠️ This action is irreversible. Proceed with caution.</div>`
   +`<p class=gm-p>Legacy mode allows you to reset your account to <b>level 1</b> for a new challenge. Every time you reset, your current stats are saved to your family tree.</p>`
   +`<div class=gm-sec><span>Current</span></div><div class=card2><div class=cm-row style="margin:0"><b>Level ${s.level}</b><span>STR ${atk().toLocaleString()} · DEF ${dfn().toLocaleString()} · DEX ${dexT().toLocaleString()}</span></div></div>`
   +`<div class=gm-sec><span>Legacy Lite Mode</span></div><div class=card2><p style="margin:0 0 10px">Simply resets your level and stats to level 1. Your inventory, gold, collections and more remain intact.</p><ul class=credits style="margin:0 0 12px"><li>Level, Health, Strength, Dexterity, Defence</li></ul><button class="fight alt" style="background:#2a2a6a" onclick="legacyDo('lite')">Enter Legacy Lite</button></div>`
   +`<div class=gm-sec><span>Legacy Pro Mode</span></div><div class=card2><p style="margin:0 0 10px">Resets your whole account to a certain degree — stats, gold, inventory, bank, crafting, gathering, quests and arena progress.</p><ul class=credits style="margin:0 0 12px"><li>Level, Health, Strength, Dexterity, Defence, Gold</li><li>Inventory, Collections, Market Listings</li><li>Bank, Crafting Level, Gathering Level</li><li>Quest Completions, Battle Arena Leaderboard Progress</li><li>Profession Progress</li></ul><button class="fight" style="background:#7a1f1f" onclick="legacyDo('pro')">Enter Legacy Pro</button></div>`
   +`<div class=gm-sec><span>Family Tree</span></div>`+(L.length?L.map(x=>`<div class=loot><span>${x.mode==="pro"?"🩸":"🧬"} <b>Level ${x.level}</b><br><small>${x.mode==="pro"?"Legacy Pro":"Legacy Lite"} · STR ${x.str.toLocaleString()} DEF ${x.def.toLocaleString()} DEX ${x.dex.toLocaleString()}</small></span><small>${ago(x.date)}</small></div>`).join(""):`<p class=hint>If this is your first reset, you will not have a family tree option yet. Your current level will become your first legacy point.</p>`);
 }else if(type==="about"){
  t.textContent="About";
  const L=[["Game Rules","fa-shield-halved","Hormati pemain lain, jangan spam chat, jangan memakai bot/script curang, dan jangan menjual akun."],["Terms of Service","fa-triangle-exclamation","StepQuest adalah proyek fan-made gratis. Data bisa direset kapan saja selama masa pengembangan."],["Privacy Policy","fa-eye-slash","Progress karakter disimpan di browser kamu. Server hanya menyimpan nama, level, stat publik, guild, listing market, dan chat."],["Cookie Policy","fa-circle-exclamation","Kami hanya memakai localStorage untuk menyimpan save game dan sesi login. Tidak ada cookie pelacak."]];
  h=`<div class="card2 role"><p>StepQuest menghadirkan pengalaman MMORPG dengan cara paling sederhana — terinspirasi penuh oleh SimpleMMO. Game kecil dengan grafis pixel art bergaya abad pertengahan dan komponen RPG klasik.<br><br>Ini adalah RPG incremental dengan elemen MMO sebagai intinya.<br><br>Yang perlu kamu lakukan hanyalah melangkah dengan satu klik tombol!</p></div>`
   +`<div class=tlist>`+L.map(([n,i,d])=>`<button onclick="alert(DECODE('${encodeURIComponent(n+"\n\n"+d)}'))"><span><i class="fa-solid ${i}" style="margin:0"></i></span>${n}</button>`).join("")+`</div>`
   +`<div class=tlist><button onclick="toast('Road map segera hadir')"><span>🗺️</span>StepQuest Road Map<i class="fa-solid fa-caret-right"></i></button></div>`
   +`<div class=card2><ul class=credits><li>Data item, avatar & sprite: <a href="https://smmo-db.com" target=_blank rel=noopener>smmo-db.com</a> / SimpleMMO (© Mike Grim / SimpleMMO)</li><li>Icons by Font Awesome</li><li>Font: Inter (Google Fonts)</li><li>Dibuat untuk komunitas — bukan produk resmi SimpleMMO</li></ul></div>`;
 }else if(type==="events"){
  t.textContent="Events";
  h=`<div class="banner ev"><h1>Events</h1><p>StepQuest mengadakan banyak event yang bisa kamu ikuti. Cek daftar event mendatang di bawah!</p></div><div class=tlist><button onclick="toast('Belum dimulai')"><span>🎃</span>Halloween 2026<em>Mon Oct 19 2026</em></button><button onclick="toast('Belum dimulai')"><span>🎄</span>Winter Holidays 2026<em>Mon Dec 14 2026</em></button></div>`;
 }
 b.innerHTML=h;m.classList.remove("hidden");
}
const LBG=["linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),radial-gradient(ellipse at 80% 110%,#3f8a34 0 30%,transparent 31%),linear-gradient(#5a8a7a,#2f6b4a)","linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),linear-gradient(170deg,#6a8ab0 0 40%,#3a7a3a 41%,#a8904a 70%,#2f6b2a)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#3a1a14,#6a2a1e 60%,#2a120c)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#1f6a6a 0 15%,#4a2a3a 16%,#8a3a2a 70%,#3a1a1a)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#a8c8e8,#e8f0f8 60%,#8aa8c8)",
 "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),linear-gradient(#5a7a8a,#8a9a7a 55%,#4a5a3a)","linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),linear-gradient(#2a0a0a,#5a1a1a 60%,#140505)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.25)),linear-gradient(#d8a86a,#b87a3a 55%,#6a4a2a)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#3a6a6a,#5a8a7a 55%,#2a4a4a)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#7a7a7a,#9a9a9a 55%,#4a4a4a)",
 "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),linear-gradient(#4a5a2a,#6a7a3a 55%,#2a3a1a)","linear-gradient(rgba(0,0,0,.15),rgba(0,0,0,.15)),linear-gradient(#e8e0c8,#c8b888 55%,#d4af37)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#a88a5a,#8a6a3a 55%,#5a4525)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#1a4a7a,#2a6a9a 55%,#0a2a4a)","linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3)),linear-gradient(#3a4a3a,#5a6a4a 55%,#2a3a2a)",
 "linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#8a6a5a,#d8894a 55%,#4a3a2a)","linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3)),linear-gradient(#4a3a5a,#6a4a7a 55%,#2a1a3a)","linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.3)),linear-gradient(#5a1a0a,#8a3a1a 55%,#2a0a05)","linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),linear-gradient(#4a0a0a,#7a1a1a 55%,#1a0505)","linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),linear-gradient(#1a0a2a,#3a1a4a 55%,#05020a)"];
const LPOP=[90686,15996,18179,13384,8021];
const LB=[["Steps","🥾",s=>s.steps,"steps"],["Gold","🪙",s=>s.gold,"gold"],["Level","✨",s=>s.level,"level"],["NPC Kills","💥",s=>s.kills,"kills"],["Player Kills","⚔️",s=>s.pk||0,"pk"],["Strength","🏆",s=>atk(),"str"],["Dexterity","🏅",s=>dexT(),"dex"],["Defence","🛡️",s=>dfn(),"def"],["Successful Quests","💎",s=>s.qc,"qc"],["World Boss Kills","🐉",s=>s.bk,"bk"],["Woodcutting","🪓",s=>s.sk.Woodcutting[0]],["Mining","⛏️",s=>s.sk.Mining[0]],["Fishing","🎣",s=>s.sk.Fishing[0]],["Treasure Hunting","🗝️",s=>s.sk.Treasure[0]]];
let lbKey="Steps";
function potLeft(k){const l=(s.pa[k]||0)-Date.now();return l>0?`${Math.floor(l/60000)}:${String(Math.floor(l/1000)%60).padStart(2,"0")} left`:""}
function usePot(k){if(s.pots[k]<1)return toast("Potion habis");s.pots[k]--;s.pa[k]=Math.max(Date.now(),s.pa[k]||0)+(k==="exp"?5:15)*60000;save();toast(k==="exp"?"+5% Experience aktif":"+5% Rarity Rate aktif");openPanel("potions")}
function renameChar(){const n=prompt("Username baru:",s.name);if(n&&n.trim()){s.name=n.trim();save();toast("Nama diganti")}}
function createGuild(){if(!SOCK)return toast("Tidak terhubung ke server");if(s.gold<5000)return toast("Butuh 5,000 gold");const n=(prompt("Nama guild:")||"").trim();if(!n)return;if(NET.guilds.some(g=>g.name===n))return toast("Nama guild sudah dipakai");const tag=(prompt("Tag guild (maks 5 huruf):",n.slice(0,3))||"").trim();s.gold-=5000;s.guild=n;SOCK.emit("guild:create",{name:n,tag});save();toast("🛡️ Guild dibuat!");openPanel("guilds")}
function joinGuild(n){if(!SOCK)return;if(s.guild===n)return toast("Sudah bergabung");s.guild=n;SOCK.emit("guild:join",n);addNote("Guild","Kamu bergabung dengan guild "+esc(n));save();toast("Bergabung dengan "+n);openPanel("guilds")}
function guildLeave(){if(SOCK)SOCK.emit("guild:leave");s.guild="";save();openPanel("guilds")}
let ttab=0,cq=1;
const TREW={daily:[600,"Bronze",5],weekly:[1800,"Silver",15],monthly:[2520,"Gold",35]};
const TDEF={daily:[["🥾","Take 150 steps when travelling.","steps",150,"closePanel()"],["⚔️","Kill 15 NPCS while travelling.","kills",15,"closePanel()"],["⭐","Successfully perform 5 quests.","quests",5,"openPanel('quests')"],["⛏️","Gather 10 materials while travelling.","gathers",10,"closePanel()"],["🔨","Craft 2 items.","crafts",2,"openPanel('craft')"]],
 weekly:[["🔨","Craft 12 items.","crafts",12,"openPanel('craft')"],["📜","Complete 3 daily tasks.","dtasks",3,"taskTab(0)"],["🗡️","Kill 175 NPCS in the Battle Arena or while travelling.","kills",175,"openPanel('hub')"],["🐈",'Successfully perform the quest "Save a cat" 50 times.',"cat",50,"openQuest(0)"],["🥾","Take 1,785 steps when travelling.","steps",1785,"closePanel()"]],
 monthly:[["🎣","Gather 625 materials while travelling (Fishing, Woodcutting, Treasure, Mining).","gathers",625,"closePanel()"],["🔨","Craft 105 items.","crafts",105,"openPanel('craft')"],["🥾","Take 6,595 steps when travelling.","steps",6595,"closePanel()"],["🛒","Purchase 390 items from the market.","buys",390,"openPanel('shops')"],["🗡️","Kill 650 NPCS in the Battle Arena or while travelling.","kills",650,"openPanel('hub')"]]};
function ctr(){return {steps:s.steps,kills:s.kills,gathers:s.q.gathers,crafts:s.cr||0,buys:s.buys||0,quests:Object.values(s.qd).reduce((a,b)=>a+b,0),cat:s.qd[0]||0,dtasks:s.dt||0}}
function periodEnd(P){const d=new Date();if(P==="daily")return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();if(P==="weekly")return new Date(d.getFullYear(),d.getMonth(),d.getDate()+(7-((d.getDay()+6)%7))).getTime();return new Date(d.getFullYear(),d.getMonth()+1,1).getTime()}
function taskState(P){s.tk=s.tk||{};let T=s.tk[P];if(!T||Date.now()>=T.end){T=s.tk[P]={end:periodEnd(P),base:ctr(),got:[],chest:0};save()}
 const c=ctr();return {...T,list:TDEF[P].map(([ico,txt,k,n,go],i)=>({ico,txt,n,go,cur:c[k]-(T.base[k]||0),got:T.got.includes(i)}))}}
function claimTask(P,i){const T=s.tk[P];if(T.got.includes(i))return;T.got.push(i);addXP(TREW[P][0]);s.keys=s.keys||{};s.keys[TREW[P][1]]=(s.keys[TREW[P][1]]||0)+2;if(P==="daily")s.dt=(s.dt||0)+1;save();toast(`+${TREW[P][0]} EXP & 2x ${TREW[P][1]} Keys`);openPanel("tasks")}
function claimChest(P){s.tk[P].chest=1;s.dia=(s.dia||0)+TREW[P][2];save();toast(`💎 +${TREW[P][2]} diamonds`);openPanel("tasks")}
function taskTab(i){ttab=i;openPanel("tasks")}
function untilTxt(t){let x=Math.max(0,Math.floor((t-Date.now())/1000));const d=Math.floor(x/86400),h=Math.floor(x%86400/3600),m=Math.floor(x%3600/60),sec=x%60;return `${d} days, ${h} hours, ${m} minutes, and ${sec} seconds`}
// ===== Community Challenges (mingguan, global flavor) =====
function commState(){
 s.comm=s.comm||{};let C=s.comm;
 if(!C.end||Date.now()>=C.end){C=s.comm={end:periodEnd("weekly"),base:{items:s.itemsFound||0,quests:Object.values(s.qd).reduce((a,b)=>a+b,0),steps:s.steps},claimed:false};save()}
 const items=(s.itemsFound||0)-C.base.items,quests=Object.values(s.qd).reduce((a,b)=>a+b,0)-C.base.quests,steps=s.steps-C.base.steps;
 return {end:C.end,claimed:C.claimed,items,quests,steps,done:items>=50&&quests>=10&&steps>=500};
}
function claimChallenge(){
 const C=commState();if(!C.done||s.comm.claimed)return;
 s.comm.claimed=true;const exp=Date.now()+240*60000;
 s.buffs=s.buffs||{};s.buffs.travel={exp,pct:30};s.buffs.battle={exp,pct:30};s.buffs.quest={exp,pct:30};s.buffs.prof={exp,pct:30};
 save();toast("🎉 Reward diklaim! +30% EXP (Travel/Battle/Quest/Profession) selama 240 menit");openPanel("challengesReward");
}
// ===== Town Supply Requests (mingguan, per kategori item) =====
function townState(){
 const need={boots:5,helmet:5,weapon:10,armour:10,gauntlet:5};
 s.town=s.town||{};let T=s.town;
 if(!T.end||Date.now()>=T.end){T=s.town={end:periodEnd("weekly"),contrib:{},claimed:false};save()}
 T.need=need;return T;
}
function townContribute(k,n){
 const T=townState(),i=s.inv.indexOf(n);if(i<0)return;
 s.inv.splice(i,1);T.contrib[k]=(T.contrib[k]||0)+1;save();toast(`+1 ${k}`);openPanel("townContribute");
}
function claimTown(){
 const T=townState(),done=["boots","helmet","weapon","armour","gauntlet"].every(k=>(T.contrib[k]||0)>=T.need[k]);
 if(!done||T.claimed)return;
 T.claimed=true;const exp=Date.now()+300*60000;
 s.buffs=s.buffs||{};s.buffs.travel={exp,pct:20};s.buffs.battle={exp,pct:20};s.buffs.node={exp,pct:0};
 s.healerFreeUses=(s.healerFreeUses||0)+2;
 save();toast("🎁 Reward diklaim! +20% EXP 300 menit & +2 Healer gratis");openPanel("townReward");
}
// [nama, ikon, level crafting, rarity material, material per item, hasil]
const CTYPES=[["Common Item","🦐",1,0,15,0],["Uncommon Item","👑",3,1,15,1],["Rare Item","📿",5,2,15,2],["Elite Item","🦺",10,3,15,3],["Epic Item","🛡️",20,4,15,4],["Legendary Item","🗡️",30,5,15,5],["Celestial and Exotic Item","⚔️",50,6,15,6],["Diamonds","💎",20,3,10,"dia"],["Bronze Keys","🗝️",10,1,15,"Bronze"],["Silver Keys","🔑",25,2,15,"Silver"]];
const MATN=["Common Material","Uncommon Material","Rare Material","Elite Material","Epic Material","Legendary Material","Solomon","Solomon"];
let ct=0;
const isMat=(n,r)=>n!=="Mushroom of Energy"&&ITEMS[n]&&ITEMS[n][1]==="mat"&&(r>=6?ITEMS[n][0]>=6:ITEMS[n][0]===r);
function matCount(r){return s.inv.filter(n=>isMat(n,r)).length}
function commonMats(){return matCount(0)}
function doCraft(){
 const T=CTYPES[ct],need=T[4]*cq;
 if(s.craft[0]<T[2])return toast(`🔒 Crafting level ${T[2]} required`);
 if(matCount(T[3])<need)return toast("Material kurang");if(s.energy<cq)return toast("⚡ Energy tidak cukup");
 let r=need;s.inv=s.inv.filter(n=>{if(r>0&&isMat(n,T[3])){r--;return false}return true});
 const got=[];
 for(let i=0;i<cq;i++){
  if(T[5]==="dia"){s.dia=(s.dia||0)+1;got.push("💎 Diamond")}
  else if(typeof T[5]==="string"){s.keys=s.keys||{};s.keys[T[5]]=(s.keys[T[5]]||0)+1;got.push(T[5]+" Key")}
  else{const rr=T[5]===6&&chance(.2)?7:T[5],pool=Object.keys(ITEMS).filter(k=>ITEMS[k][0]===rr&&GEAR_T.includes(ITEMS[k][1])&&ilv(k)<=Math.max(10,s.level+10));const pl=pool.length?pool:Object.keys(ITEMS).filter(k=>ITEMS[k][0]===rr&&GEAR_T.includes(ITEMS[k][1]));const n=pl[rand(0,pl.length-1)];s.inv.push(n);got.push(n)}
 }
 const cx=(T[2]*5+15)*cq;s.energy-=cq;s.cr=(s.cr||0)+cq;s.craft[1]+=cx;while(s.craft[1]>=50*s.craft[0]){s.craft[1]-=50*s.craft[0];s.craft[0]++;toast("🔨 Crafting level "+s.craft[0])}addXP(cq*s.level*5);
 save();toast("🔨 Crafted: "+got.join(", "));openPanel("craft");
}
const PROFS=[["Blacksmith","🔥","Strength"],["Thief","🥷","Dexterity"],["Chef","🍖","Dexterity"],["Guard","🗡️","Defence"],["Banker","💰","Defence"],["Warrior","⚔️","Strength"],["Defender","🛡️","Defence"],["Rogue","🟣","Dexterity"]];
const RANKN={Banker:["Penny Handler","Bank Service Agent","Bank Manager","Bank Director","Master of Coin","Director of Humanity","Mr Bank Note","Made O' Money","CEO of Money","A Greedy MMORPG Developer"]};
const RLV=[1,10,25,75,200,350,650,1050,2000,3200],RICO=["⚪","⚪","🟡","📏","💰","🦅","💵","💸","🪙","☄️"];
function ranks(p){const n=RANKN[p]||["Apprentice","Journeyman","Adept","Expert","Veteran","Master","Grandmaster","Legend","Mythic","Ascended"].map(x=>x+" "+p);return n.map((x,i)=>[x,RLV[i],RICO[i],[10,14,20,25,30,40,45,55,76,96][i],[15,37,66,187,245,316,460,575,1006,1438][i],[5,25,85,230,400,700,850,1300,2450,3500][i]])}
function profNeed(l){return 40+l*50}
let pp="";
function profS(){if(!s.prof)s.prof={cur:"Banker",lv:{},ep:5,epT:Date.now()};const P=s.prof;PROFS.forEach(([n])=>P.lv[n]=P.lv[n]||[1,0]);while(P.ep<5&&Date.now()-P.epT>=300000){P.ep++;P.epT+=300000}if(P.ep>=5)P.epT=Date.now();return P}
function profWork(){const P=profS();if(s.energy<1)return toast("⚡ Energy tidak cukup");const l=P.lv[P.cur],R=ranks(P.cur),r=R.reduce((a,x)=>l[0]>=x[1]?x:a,R[0]);s.energy--;addGold(r[5]);addXP(Math.round(r[3]*buffMul("prof")));l[1]+=r[4];let up=0;while(l[1]>=profNeed(l[0])){l[1]-=profNeed(l[0]);l[0]++;up=1}save();toast(`💼 +${r[5]}G +${r[3]} EXP +${r[4]} ${P.cur} EXP${up?" — LEVEL UP!":""}`);openPanel("prof")}
function pickProf(){if(!pp)return toast("Pilih profesi dulu");profS().cur=pp;pp="";save();openPanel("prof")}
function mmss(ms){ms=Math.max(0,ms);return `${String(Math.floor(ms/60000)).padStart(2,"0")}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}`}
function bankDo(d){const max=d>0?s.gold:s.bank,v=parseInt(prompt(`${d>0?"Deposit":"Withdraw"} berapa? (maks ${max.toLocaleString()})`,max));if(!v||v<1)return;if(v>max)return toast("Jumlah melebihi saldo");s.gold-=v*d;s.bank+=v*d;save();toast(d>0?"💰 Deposit berhasil":"💰 Withdraw berhasil");openPanel("bank")}
function rk(k){const d=new Date();return k==="d"?d.toDateString():d.getFullYear()+"-"+d.getMonth()}
function canRew(k){return (s.rw||{})[k]!==rk(k)}
function claimRew(k){if(!canRew(k))return toast("Sudah diklaim");s.rw=s.rw||{};s.rw[k]=rk(k);const g=(k==="d"?50:500)*s.level;addGold(g);s.keys=s.keys||{};if(k==="m")s.keys.Silver=(s.keys.Silver||0)+1;save();toast(`🎁 +${g.toLocaleString()} gold${k==="m"?" + 1 Silver Key":""}`);openPanel("mahol")}
function lottery(){const c=50*s.level;if(s.gold<c)return toast("❌ Gold tidak cukup!");s.gold-=c;const r=Math.random();let m="🎲 Tidak menang kali ini";if(r<.02){addGold(c*25);m=`🎉 JACKPOT! +${(c*25).toLocaleString()}G`}else if(r<.2){addGold(c*2);m=`🎲 Menang +${(c*2).toLocaleString()}G`}save();toast(m);openPanel("mahol")}
function buyKey(){if(s.gold<1000)return toast("❌ Gold tidak cukup!");s.gold-=1000;s.keys=s.keys||{};s.keys.Bronze=(s.keys.Bronze||0)+1;save();toast("🗝️ +1 Bronze Key");openPanel("mahol")}
function openChest(n){s.keys=s.keys||{};if(!(s.keys[n]>0))return toast("Tidak punya "+n+" Key");s.keys[n]--;const q={Bronze:1,Silver:2,Gold:3}[n],got=[];for(let i=0;i<q;i++){let it=rollItem();if(n==="Gold"&&ITEMS[it][0]<2)it=rollItem();s.inv.push(it);got.push(it)}const g=q*100*s.level;addGold(g);save();toast(`🧰 +${g}G: ${got.join(", ")}`);openPanel("chests")}
let af=0;
const AWP={"Baby Steps":[s=>s.steps,100],"Butcher":[s=>s.kills,10],"Checkbox":[s=>s.qc,1],"Gatherer":[s=>s.q.gathers,10],"Marathon":[s=>s.steps,1000],"Rich":[s=>s.gold,10000],"Slayer":[s=>s.kills,100],"Dragon Slayer":[s=>s.bk,1]};
function dBuy(c,fn){s.dia=s.dia||0;if(s.dia<c)return toast(`💎 Butuh ${c} diamonds`);s.dia-=c;fn();save();openPanel("diamond")}
const DSHOP=[["Animated Avatar","🐉",200,"dBuy(200,()=>toast('Avatar animasi aktif!'))"],["Item Rename","🏷️",25,"dBuy(25,()=>toast('Pilih item di inventory untuk rename'))"],["Gold Key","🗝️",4,"dBuy(4,()=>{s.keys=s.keys||{};s.keys.Gold=(s.keys.Gold||0)+1;toast('+1 Gold Key')})"],["Increase max quest points","✨",40,"toast('Segera hadir')"],["Gradient username","🪶",150,"dBuy(150,()=>{s.nc='grad';toast('Username gradient aktif')})","#2dd4bf"],["Change item into celestial","🪽",50,"toast('Segera hadir')"],["Refill Quest Points","💎",4,"dBuy(4,()=>{s.qe=50;toast('Quest Points penuh')})"],["Refill Energy Points","⚡",5,"dBuy(5,()=>{s.energy=100;toast('Energy penuh')})"],
 ["Custom Item Sprite","⚒️",75,"toast('Segera hadir')"],["Static Avatar","🧝",150,"toast('Segera hadir')"],["Username Change","📜",10,"dBuy(10,renameChar)"],["Item Inscription","📜",20,"toast('Segera hadir')"],["Coloured username","🖋️",100,"dBuy(100,()=>{s.nc='green';toast('Username berwarna aktif')})","#22c55e"],["Refill your HP","💗",4,"dBuy(4,()=>{s.hp=s.maxHp;toast('HP penuh')})"],["Reset Skills","🏆",15,"dBuy(15,()=>{const p=s.str+s.def+s.dex-20;s.str=10;s.def=5;s.dex=5;s.pts+=p;toast('Stat direset: +'+p+' poin')})"],["Library Book","📕",35,"dBuy(35,()=>{addXP(nextXP());toast('📕 +1 level EXP')})"]];
let CHAT={},chatC="Global";
function toggleChat(){const p=document.getElementById("chatPanel"),b=document.getElementById("chatBack");const o=p.classList.toggle("hidden");b.classList.toggle("hidden",o);if(!o){renderChat();setTimeout(()=>document.getElementById("chatTxt").focus(),50)}}
function chatCh(c){chatC=c;document.querySelectorAll(".chat-tabs button").forEach(b=>b.classList.toggle("act",b.dataset.ch===c));renderChat()}
function renderChat(){const el=document.getElementById("chatList");if(!el)return;const L=CHAT[chatC]||[];el.innerHTML=!SOCK?`<p class=hint>Tidak terhubung ke server.</p>`:L.length?L.map(m=>`<div class=cm><span class=cav>${avImg(m.av)}</span><div class=cb><div><b style="color:${m.mod?"#f5c518":"#ffd866"};cursor:pointer" onclick="viewPlayer(DECODE('${encodeURIComponent(m.name)}'))">${esc(m.name)}</b>${m.mod?` <span class=modb>🛡️ Mod</span>`:""} <small>${new Date(m.t).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small></div><div>${esc(m.txt)}</div></div></div>`).join(""):`<p class=hint>Belum ada pesan di ${chatC}. Sapa pemain lain!</p>`;el.scrollTop=el.scrollHeight}
function chatSend(){const i=document.getElementById("chatTxt"),v=i.value.trim();if(!v||!SOCK)return;SOCK.emit("chat:send",{ch:chatC,txt:v,key:isAdmin?AKEY():""});i.value=""}
// ===== Public Player Profile (diri sendiri atau pemain lain) =====
let vgName="";
function viewPlayer(name){
 name=(name||s.name||"").trim();if(!name)return;
 if(PAGE==="player"){vpName=name;try{history.replaceState(null,"","player.html?n="+encodeURIComponent(name))}catch(e){}openPanel("player")}
 else location.href="player.html?n="+encodeURIComponent(name);
}
function viewGuild(name){vgName=name;openPanel("guildview")}
function pseudoBadges(d){
 const B=[];
 if(d.level>=50)B.push(["Veteran","This player has been recognized for having a positive impact on the community.","🎗️"]);
 if(d.pk>=10)B.push(["Gladiator","This player has finished a previous season high in total kills.","⚔️"]);
 if(d.bk>=1)B.push(["Dragon Slayer","This player has defeated a world boss.","🐉"]);
 if(d.level>=500)B.push(["Legend","This player has reached an extraordinary level.","🌟"]);
 if(!B.length)B.push(["Pleb","This player is a mighty pleb.","⚪"]);
 return B.slice(0,4);
}
function renderPlayerProfile(d,nm){
 const self=nm.toLowerCase()===s.name.toLowerCase();
 document.getElementById("modalTitle").textContent="";
 const badges=self?(AWARDS.filter(a=>s.aw[a[0]]).slice(-4).map(a=>[a[0],a[1],"🏅"])):pseudoBadges(d);
 if(self&&!badges.length)badges.push(["Pleb","This player is a mighty pleb.","⚪"]);
 const up=(d.rep&&d.rep.up)||0,down=(d.rep&&d.rep.down)||0,sc=self?(s.showcase||[]):(d.showcase||[]),bio=self?(s.bio||""):(d.bio||"");
 const onlineTxt=d.online?`<div class=pf-pill>Online Now</div>`:`<div class=pf-pill style="background:#2a2a2d;color:#aaa">${d.seen?"Last online "+ago(d.seen):"Offline"}</div>`;
 let h=`<div class=pf-ban></div><div class=pf-av style="margin-top:-60px">${self?avHTML():avImg(d.av)}</div>`
  +`<div class=pf-n><b>${esc(d.name)}</b>${d.guildInfo?` <small style="color:#8b8bff">[${esc(d.guildInfo.tag)}]</small>`:""}</div><div class=pf-lv>Level ${d.level.toLocaleString()}</div>${onlineTxt}`
  +(bio?`<div class="card2" style="text-align:center">"${esc(bio)}"</div>`:self?`<button class="fight alt" style="background:#2a2a2d" onclick="editBio()">+ Add a motto</button>`:"");
 h+=`<div class=gm-sec><span>Badges</span></div><div class=badgerow>`+badges.map(b=>`<div class=badge title="${esc(b[1])}"><span>${b[2]}</span><small>${esc(b[0])}</small></div>`).join("")+`</div>`;
 if(d.guildInfo)h+=`<div class=gm-sec><span>Guild</span></div><div class="card2 flex"><span><b>${esc(d.guildInfo.name)}</b><br><small style="color:#aaa">[${esc(d.guildInfo.tag)}]</small></span><button class=mini2 onclick="viewGuild(DECODE('${encodeURIComponent(d.guildInfo.name)}'))">View Guild</button></div>`;
 if(!self){
  const onlineP=NET.online.find(p=>p.name.toLowerCase()===nm.toLowerCase());
  h+=`<div class=actrow><button class=aact ${onlineP?"":"disabled"} onclick="${onlineP?`pvpFight('${onlineP.id}')`:""}">⚔️ Attack</button><button class=aact onclick="toast('👋 Kamu melambai ke ${esc(nm)}')">👋 Wave</button><button class=aact onclick="toast('Fitur Trade belum tersedia')">🤝 Trade</button></div>`
   +`<div class=actrow><button class=aact onclick="toast('Fitur Add Friend belum tersedia')">➕ Add Friend</button><button class=aact onclick="toast('Fitur Message belum tersedia')">✉️ Message</button></div>`;
 }
 h+=`<div class=gm-sec><span>Showcase</span></div>`+(sc.length?`<div class=showgrid>`+sc.filter(n=>ITEMS[n]).map(n=>`<div class=showitem>${ico(n,"lg")}<small>${esc(n)}</small></div>`).join("")+`</div>`:`<p class=hint>Belum ada showcase.</p>`)
  +(self?`<button class="fight alt" style="background:#2a2a2d;margin-top:8px" onclick="openPanel('showcase')">Edit Showcase</button>`:"");
 if(self)h+=`<div class=gm-sec><span>Feed</span></div><div class=card2>`+(s.feed.slice(0,5).map(f=>`<div class=srow><span><b>${esc(f[0])}</b><br><small>${ago(f[1])}</small></span></div>`).join("")||"Belum ada aktivitas.")+`</div>`;
 if(!self)h+=`<div class=gm-sec><span>More</span></div><div class=tlist><button onclick="payPrompt(DECODE('${encodeURIComponent(nm)}'),'gold')"><span>🪙</span>Send Gold</button><button onclick="payPrompt(DECODE('${encodeURIComponent(nm)}'),'dia')"><span>💎</span>Gift Diamonds</button><button onclick="payPrompt(DECODE('${encodeURIComponent(nm)}'),'item')"><span>🎒</span>Send Item</button><button onclick="toast('Fitur Spy belum tersedia')"><span>🕵️</span>Spy</button></div>`;
 h+=`<div class=gm-sec><span>Statistics</span></div><div class=card2><div class=srow><span>🪙 Gold</span><b>${d.gold.toLocaleString()}</b></div><div class=srow><span>🥾 Steps</span><b>${d.steps.toLocaleString()}</b></div><div class=srow><span>🧟 NPC Kills</span><b>${d.kills.toLocaleString()}</b></div><div class=srow><span>⚔️ Player Kills</span><b>${d.pk.toLocaleString()}</b></div><div class=srow><span>🐉 World Boss Kills</span><b>${d.bk.toLocaleString()}</b></div><div class=srow><span>💎 Successful Quests</span><b>${d.qc.toLocaleString()}</b></div></div>`;
 h+=`<div class=gm-sec><span>Reputation</span></div><div class="card2 flex"><b style="color:${up-down>=0?"#2ecc71":"#e74c3c"}">${up-down>=0?"+":""}${(up-down).toLocaleString()}</b>`
  +(self?`<small style="color:#aaa">👍 ${up} · 👎 ${down}</small>`:`<span><button class=mini onclick="voteRep(DECODE('${encodeURIComponent(nm)}'),'up')">👍 ${up}</button><button class="mini alt" onclick="voteRep(DECODE('${encodeURIComponent(nm)}'),'down')">👎 ${down}</button></span>`)+`</div>`;
 if(!self)h+=`<div class=gm-sec><span>Actions</span></div><div class=tlist><button onclick="toast('Laporan terkirim')"><span>🚩</span>Report</button><button onclick="toast('Pemain diblokir (lokal)')"><span>⛔</span>Block</button></div>`;
 else h+=`<div class=gm-sec><span>More</span></div><div class=tlist><button onclick="navGo('market')"><span>🤝</span>View Market</button><button onclick="navGo('collect')"><span>📦</span>View Collection</button></div>`;
 const cm=d.comments||[];
 h+=`<div class=gm-sec><span>Comments (${cm.length})</span></div><div class=card2>`+(cm.length?cm.slice().reverse().map(c=>`<div class=srow style="align-items:flex-start"><span class=lr>${avImg(c.av)}<span><b style="cursor:pointer" onclick="viewPlayer(DECODE('${encodeURIComponent(c.name)}'))">${esc(c.name)}</b> <small style="color:#888">${ago(c.t)}</small><br>${esc(c.txt)}</span></span></div>`).join(""):"<p class=hint style=\"margin:0\">Belum ada komentar.</p>")+`</div>`
  +`<div class=sp-in style="margin-top:8px"><input id=cmTxt maxlength=200 placeholder="Tulis komentar…"><button onclick="postComment(DECODE('${encodeURIComponent(nm)}'))">Kirim</button></div>`;
 document.getElementById("modalBody").innerHTML=h;
}
function editBio(){const b=(prompt("Motto/bio (maks 140 karakter):",s.bio||"")||"").slice(0,140);s.bio=b;save();viewPlayer(s.name)}
function toggleShowcase(n){s.showcase=s.showcase||[];const i=s.showcase.indexOf(n);if(i>=0)s.showcase.splice(i,1);else{if(s.showcase.length>=9)return toast("Maks 9 item");s.showcase.push(n)}save();openPanel("showcase")}
function voteRep(name,dir){if(!SOCK)return;SOCK.emit("profile:vote",{name,dir});toast(dir==="up"?"👍 Vote terkirim":"👎 Vote terkirim");setTimeout(()=>viewPlayer(name),400)}
function postComment(name){const i=document.getElementById("cmTxt");if(!i)return;const v=i.value.trim();if(!v||!SOCK)return;SOCK.emit("profile:comment",{name,txt:v});i.value="";setTimeout(()=>viewPlayer(name),400)}
function payPrompt(name,kind){
 if(!SOCK)return toast("Tidak terhubung ke server");
 if(kind==="gold"){const v=parseInt(prompt(`Kirim berapa gold ke ${name}?`,"1000"));if(!v||v<1)return;if(v>s.gold)return toast("Gold tidak cukup");SOCK.emit("pay:send",{toName:name,gold:v},r=>{if(r&&r.ok){s.gold-=v;save();toast("🪙 Terkirim ke "+name)}else toast("❌ "+(r&&r.msg))})}
 else if(kind==="dia"){const v=parseInt(prompt(`Kirim berapa diamond ke ${name}?`,"10"));if(!v||v<1)return;if(v>(s.dia||0))return toast("Diamond tidak cukup");SOCK.emit("pay:send",{toName:name,dia:v},r=>{if(r&&r.ok){s.dia-=v;save();toast("💎 Terkirim ke "+name)}else toast("❌ "+(r&&r.msg))})}
 else{const n=(prompt("Nama item yang mau dikirim (persis sama seperti di inventory)?")||"").trim();if(!n)return;if(!s.inv.includes(n))return toast("Item tidak ada di inventory");SOCK.emit("pay:send",{toName:name,item:n},r=>{if(r&&r.ok){s.inv.splice(s.inv.indexOf(n),1);save();toast("🎒 Terkirim ke "+name)}else toast("❌ "+(r&&r.msg))})}
}
let mt=0,nf=0,atab=0,aq="",art=-1,aty="",aqty=1;
function legacyDo(mode){
 if(!confirm(`Yakin masuk Legacy ${mode==="pro"?"Pro":"Lite"} Mode? Aksi ini TIDAK BISA dibatalkan dan mereset levelmu ke 1.`))return;
 s.legacy=s.legacy||{list:[]};
 s.legacy.list.unshift({level:s.level,str:atk(),def:dfn(),dex:dexT(),maxHp:s.maxHp,date:Date.now(),mode});
 s.level=1;s.xp=0;s.str=10;s.def=5;s.dex=5;s.maxHp=100;s.hp=100;s.pts=0;
 if(mode==="pro"){
  s.gold=0;s.inv=[];s.eq={helmet:null,amulet:null,armor:null,weapon:null,shield:null,pet:null,greaves:null,gauntlet:null,boots:null,special:null};
  s.bank=0;s.craft=[1,0];s.sk={Mining:[1,0],Woodcutting:[1,0],Fishing:[1,0],Treasure:[1,0]};
  s.qd={};s.qc=0;s.au=0;s.ap=[];s.tk={};s.prof=null;
 }
 save();toast(`🧬 Legacy ${mode==="pro"?"Pro":"Lite"} selesai! Kamu kembali ke Level 1.`);openPanel("legacy");
}
function admTab(i){atab=i;openPanel("admin")}
const AKEY=()=>sessionStorage.getItem("sq_akey")||"";
function admSet(k,v){v=Math.max(0,Math.round(+v||0));s[k]=v;if(k==="maxHp")s.hp=Math.min(s.hp,v);save();toast(`✅ ${k} = ${v.toLocaleString()}`);openPanel("admin")}
function admLevel(v){v=Math.max(1,Math.round(+v||1));s.level=v;s.xp=0;s.maxHp=100+(v-1)*10;s.hp=s.maxHp;save();toast("✅ Level "+v);openPanel("admin")}
function admGive(n,q=1){if(!ITEMS[n])return;for(let i=0;i<q;i++)s.inv.push(n);save();toast(`🎁 +${q} ${n}`)}
function admRand(r,q=1){const got=[];for(let i=0;i<q;i++){const p=Object.keys(ITEMS).filter(k=>ITEMS[k][0]==r&&GEAR_T.includes(ITEMS[k][1]));const n=p[rand(0,p.length-1)];s.inv.push(n);got.push(n)}save();toast("🎁 "+got.join(", "))}
function admKeys(k,q){s.keys=s.keys||{};s.keys[k]=(s.keys[k]||0)+q;save();toast(`🗝️ +${q} ${k} Key`);openPanel("admin")}
function admSpawn(i){closePanel();if(i<0)spawn(BOSS,true);else spawn(enemies[i]);eventText(`🛡️ Admin spawn: ${enemy.name}`);save()}
function admEquipBest(){GEAR_T.forEach(t=>{const c=Object.keys(ITEMS).filter(k=>ITEMS[k][1]===t&&ilv(k)<=s.level).sort((a,b)=>ITEMS[b][2]-ITEMS[a][2])[0];if(c)s.eq[t]=c});save();toast("🛡️ Equip item terbaik sesuai level");openPanel("admin")}
function admSrv(cmd,args){if(!SOCK)return toast("Tidak terhubung ke server");SOCK.emit("admin",{key:AKEY(),cmd,args},r=>{toast(r&&r.ok?"✅ "+(r.msg||"OK"):"❌ "+(r&&r.msg||"Gagal"));if(r&&r.data)ADM=r.data;openPanel("admin")})}
let ADM=null;
const inp=(id,v,ph="")=>`<input id="${id}" class=ain type=number value="${v}" placeholder="${ph}">`;
const row2=(l,id,v,fn)=>`<div class=arow><span>${l}</span>${inp(id,v)}<button class=mini onclick="${fn}(document.getElementById('${id}').value)">Set</button></div>`;
function admPlayer(){
 return `<div class=tsec>Currencies</div><div class=card2>${row2("🪙 Gold","a_g",s.gold,"admSetGold")}${row2("🏦 Bank","a_b",s.bank,"admSetBank")}${row2("💎 Diamonds","a_d",s.dia||0,"admSetDia")}</div>`
 +`<div class=tsec>Level & Stats</div><div class=card2>${row2("✨ Level","a_l",s.level,"admLevel")}${row2("💪 Strength","a_s",s.str,"admSetStr")}${row2("🛡️ Defence","a_df",s.def,"admSetDef")}${row2("💨 Dexterity","a_dx",s.dex,"admSetDex")}${row2("❤️ Max HP","a_hp",s.maxHp,"admSetHp")}${row2("⭐ Stat Points","a_p",s.pts,"admSetPts")}</div>`
 +`<div class=tsec>Quick Actions</div><div class=agrid>`
 +[["❤️ Full Heal","s.hp=s.maxHp"],["⚡ Full Energy","s.energy=100"],["🔥 Full Quest Pts","s.qe=50"],["💰 +100k Gold","addGold(100000)"],["💰 +10M Gold","addGold(10000000)"],["💎 +1,000 Diamonds","s.dia=(s.dia||0)+1000"],["⬆️ +1 Level","addXP(nextXP())"],["⬆️ +10 Level","for(let i=0;i<10;i++)addXP(nextXP())"],["🚀 Level 100","admLevel(100)"],["💪 +1000 semua stat","s.str+=1000;s.def+=1000;s.dex+=1000"],["🧪 +10 Potion EXP/Rar","s.pots.exp+=10;s.pots.rar+=10"],["💀 HP = 1","s.hp=1"]].map(([l,c])=>`<button class=btn-admin onclick="${c};save();toast('${l}');openPanel('admin')">${l}</button>`).join("")
 +`<button class=btn-admin style="background:${s.god?"#1fa971":"#3a3a4e"}" onclick="s.god=!s.god;save();openPanel('admin')">🛡️ God Mode: ${s.god?"ON":"OFF"}</button><button class=btn-admin style="background:${s.fast?"#1fa971":"#3a3a4e"}" onclick="s.fast=!s.fast;save();openPanel('admin')">⏩ Instant Step: ${s.fast?"ON":"OFF"}</button></div>`
 +`<div class=tsec>Skills & Profession</div><div class=card2>${Object.keys(s.sk).map(k=>row2(NODES[k].icon+" "+k,"a_sk_"+k,s.sk[k][0],"admSk_"+k)).join("")}${row2("🔨 Crafting","a_cr",s.craft[0],"admSetCraft")}${row2("💼 "+profS().cur,"a_pf",profS().lv[profS().cur][0],"admSetProf")}</div>`;
}
function admSetGold(v){admSet("gold",v)}function admSetBank(v){admSet("bank",v)}function admSetDia(v){admSet("dia",v)}function admSetStr(v){admSet("str",v)}function admSetDef(v){admSet("def",v)}function admSetDex(v){admSet("dex",v)}function admSetHp(v){admSet("maxHp",v);s.hp=s.maxHp;save()}function admSetPts(v){admSet("pts",v)}
function admSetCraft(v){s.craft=[Math.max(1,+v||1),0];save();openPanel("admin")}
function admSetProf(v){const P=profS();P.lv[P.cur]=[Math.max(1,+v||1),0];save();openPanel("admin")}
["Mining","Woodcutting","Fishing","Treasure"].forEach(k=>{window["admSk_"+k]=v=>{s.sk[k]=[Math.max(1,+v||1),0];save();openPanel("admin")}});
function admItems(){
 const types=[...new Set(Object.values(ITEMS).map(x=>x[1]))];
 const L=Object.keys(ITEMS).filter(k=>(!aq||k.toLowerCase().includes(aq.toLowerCase()))&&(art<0||ITEMS[k][0]===art)&&(!aty||ITEMS[k][1]===aty)).sort((a,b)=>ITEMS[b][0]-ITEMS[a][0]||ilv(b)-ilv(a));
 return `<div class=card2><input class=ain style="width:100%" placeholder="Cari item (${Object.keys(ITEMS).length} item)…" value="${esc(aq)}" onchange="aq=this.value;openPanel('admin')"><div class=arow style="margin-top:8px"><select class=sel onchange="art=+this.value;openPanel('admin')"><option value=-1>Semua rarity</option>${RAR.map((r,i)=>`<option value=${i} ${art===i?"selected":""}>${r[0]}</option>`).join("")}</select><select class=sel onchange="aty=this.value;openPanel('admin')"><option value="">Semua tipe</option>${types.map(x=>`<option ${aty===x?"selected":""}>${x}</option>`).join("")}</select><input class=ain type=number min=1 value=${aqty} style="width:70px" onchange="aqty=Math.max(1,+this.value||1)" title="Qty"></div></div>`
 +`<p class=hint>${L.length} hasil · klik Give untuk memberi ${aqty}x</p>`+L.slice(0,60).map(n=>`<div class=loot><span class=lr>${ico(n,"lg")}<span>${nmT(n)}<br><small>${ITEMS[n][1]} · Lv ${ilv(n).toLocaleString()} · +${ITEMS[n][2].toLocaleString()}${exTxt(n)}</small></span></span><button class=mini onclick="admGive(DECODE('${encodeURIComponent(n)}'),aqty)">Give</button></div>`).join("")
 +`<div class=tsec>Random by rarity</div><div class=agrid>${RAR.map((r,i)=>`<button class=btn-admin style="background:#23252a;border:1px solid ${r[1]};color:${r[1]}" onclick="admRand(${i},aqty)">${r[0]}</button>`).join("")}</div>`
 +`<div class=tsec>Keys, Tools & Materials</div><div class=agrid>${["Bronze","Silver","Gold"].map(k=>`<button class=btn-admin onclick="admKeys('${k}',10)">🗝️ +10 ${k} (${(s.keys||{})[k]||0})</button>`).join("")}<button class=btn-admin onclick="Object.keys(TOOLK).forEach(t=>s.tools[t]=1);save();toast('🔧 Semua tool');openPanel('admin')">🔧 Semua Tool</button>${MATN.slice(0,6).map((m,i)=>`<button class=btn-admin onclick="admGive('${m}',50)">${RAR[i][0]} Mat ×50</button>`).join("")}<button class=btn-admin onclick="admGive('Mushroom of Energy',20)">🍄 Mushroom ×20</button><button class=btn-admin onclick="admGive('Healing Herb',20)">🌿 Herb ×20</button><button class=btn-admin onclick="admEquipBest()">🛡️ Equip terbaik</button><button class=btn-admin style="background:#7a1f1f" onclick="if(confirm('Kosongkan inventory?')){s.inv=[];save();openPanel('admin')}">🗑️ Clear Inventory</button><button class=btn-admin style="background:#7a1f1f" onclick="Object.keys(s.eq).forEach(k=>s.eq[k]=null);save();openPanel('admin')">❎ Unequip semua</button></div>`;
}
function admWorld(){
 return `<div class=tsec>Teleport</div><div class=agrid>${LOCS.map((l,i)=>`<button class=btn-admin style="background:${i===s.loc?"#4f46e5":"#3a3a4e"}" onclick="s.loc=${i};s.vis[${i}]=1;save();toast('📍 ${l[0]}');openPanel('admin')">📍 ${l[0]}</button>`).join("")}</div>`
 +`<div class=tsec>Spawn Enemy</div><div class=agrid>${enemies.map((e,i)=>`<button class=btn-admin onclick="admSpawn(${i})">${e.ico} ${e.name}</button>`).join("")}<button class=btn-admin style="background:#7a1f1f" onclick="admSpawn(-1)">🐉 World Boss</button></div>`
 +`<div class=tsec>Battle Arena</div><div class=agrid><button class=btn-admin onclick="s.ap[s.au]=ARENA[s.au][2]-1;save();toast('1 NPC lagi untuk tier ini');openPanel('admin')">🏁 Hampir selesai tier</button><button class=btn-admin onclick="s.au=10;ARENA.forEach((a,i)=>s.ap[i]=a[2]);save();toast('Semua tier terbuka');openPanel('admin')">🔓 Buka semua tier</button><button class=btn-admin onclick="s.au=0;s.ap=[];save();openPanel('admin')">↺ Reset arena</button></div>`
 +`<div class=tsec>Quests, Tasks & Awards</div><div class=agrid><button class=btn-admin onclick="QUESTS.forEach((q,i)=>s.qd[i]=q[4]);s.qc=QUESTS.length;save();toast('Semua quest selesai');openPanel('admin')">✅ Selesaikan semua quest</button><button class=btn-admin onclick="s.qd={};s.qc=0;save();openPanel('admin')">↺ Reset quest</button><button class=btn-admin onclick="s.tk={};save();toast('Tasks direset');openPanel('admin')">↺ Reset tasks</button><button class=btn-admin onclick="AWARDS.forEach(a=>s.aw[a[0]]=Date.now());save();toast('Semua award');openPanel('admin')">🏅 Unlock semua award</button><button class=btn-admin onclick="s.aw={};save();openPanel('admin')">↺ Reset award</button><button class=btn-admin onclick="s.rw={};save();toast('Daily/Monthly reward bisa diklaim lagi');openPanel('admin')">🎁 Reset daily reward</button><button class=btn-admin onclick="sprintUntil=Date.now()+3600000;sprintTick();toast('Sprint 60 menit')">🏃 Sprint 60 menit</button><button class=btn-admin onclick="s.pa.exp=s.pa.rar=Date.now()+3600000;save();toast('Boost EXP & Rarity 1 jam')">🧪 Boost 1 jam</button></div>`
 +`<div class=tsec>Avatar</div><div class=agrid><button class=btn-admin onclick="openPanel('avatars')">🧙 Ganti avatar</button><button class=btn-admin onclick="s.av=rand(0,AVATARS.length-1);save();openPanel('admin')">🎲 Avatar acak</button></div>`;
}
function admSave(){
 return `<div class=tsec>Export / Import Save</div><div class=card2><textarea id=a_json class=ain style="width:100%;height:160px;font-family:monospace;font-size:11px">${esc(JSON.stringify(s))}</textarea><div class=agrid style="margin-top:8px"><button class=btn-admin onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('a_json').value);toast('Disalin')">📋 Copy</button><button class=btn-admin onclick="try{const j=JSON.parse(document.getElementById('a_json').value);s=Object.assign(def(),j);save();toast('✅ Save diimpor');openPanel('admin')}catch(e){toast('❌ JSON tidak valid')}">📥 Import</button></div></div>`
 +`<div class=tsec>Bahaya</div><div class=agrid><button class=btn-admin style="background:#7a1f1f" onclick="if(confirm('Reset karakter admin ke awal?')){const n=s.name;s=def();s.name=n;save();openPanel('admin')}">💣 Reset karakter</button><button class=btn-admin style="background:#7a1f1f" onclick="if(confirm('Hapus SEMUA save di browser ini?')){Object.keys(localStorage).filter(k=>k.startsWith(KEY)).forEach(k=>localStorage.removeItem(k));doLogout()}">🧨 Hapus semua save lokal</button></div>`;
}
function admServer(){
 const on=NET.online.filter(p=>p.id!==myId);
 return (AKEY()?"":`<div class="warn" style="margin:0 0 10px">⚠️ Perintah server butuh password admin. Logout lalu login lagi sebagai <b>admin</b> dengan password admin server (env <code>ADMIN_PASSWORD</code>).</div>`)
 +`<div class=tsec>Announcement</div><div class=card2><div class=arow><input id=a_ann class=ain style="flex:1" placeholder="Pesan untuk semua pemain online"><button class=mini onclick="admSrv('announce',{txt:document.getElementById('a_ann').value})">Kirim</button></div></div>`
 +`<div class=tsec>Pemain Online (${on.length})</div>`+(on.length?on.map(p=>`<div class=loot><span class=lr>${avImg(p.av)}<span><b>${esc(p.name)}</b><br><small>Lv ${p.level} · 🪙 ${p.gold.toLocaleString()}</small></span></span><span><button class=mini onclick="admSrv('gift',{id:'${p.id}',gold:+prompt('Gold?','10000')||0,dia:+prompt('Diamonds?','0')||0})">🎁</button><button class="mini alt" onclick="if(confirm('Kick ${esc(p.name)}?'))admSrv('kick',{id:'${p.id}'})">Kick</button></span></div>`).join(""):`<p class=hint>Tidak ada pemain lain online.</p>`)
 +`<div class=tsec>Market & Guild</div><div class=agrid><button class=btn-admin onclick="admSrv('stats')">📊 Statistik server</button><button class=btn-admin style="background:#7a1f1f" onclick="if(confirm('Hapus semua listing market?'))admSrv('clearMarket')">🧹 Clear market (${NET.listings.length})</button><button class=btn-admin style="background:#7a1f1f" onclick="if(confirm('Hapus semua chat?'))admSrv('clearChat')">🧹 Clear chat</button></div>`
 +(NET.guilds.length?NET.guilds.map(g=>`<div class=loot><span><b>${esc(g.name)}</b> [${esc(g.tag)}]<br><small>${g.members} members · owner ${esc(g.owner)}</small></span><button class="mini alt" onclick="if(confirm('Hapus guild?'))admSrv('delGuild',{name:DECODE('${encodeURIComponent(g.name)}')})">Hapus</button></div>`).join(""):"")
 +(ADM?`<div class=card2><b>📊 Server</b>${Object.entries(ADM).map(([k,v])=>`<div class=srow><span>${k}</span><b>${v}</b></div>`).join("")}</div>`:"");
}
const NCAT=["All","Action","Market","PvP","Player Interaction","Guild","System","Other"];
function addNote(cat,txt){if(!s)return;s.notes=s.notes||[];s.notes.unshift([cat,txt,Date.now()]);s.notes.length=Math.min(s.notes.length,100);s.nu=(s.nu||0)+1;save()}
const DECODE=decodeURIComponent;
function mBuy(id){const l=NET.listings.find(x=>x.id===id);if(!l)return;if(s.gold<l.price)return toast("❌ Gold tidak cukup!");SOCK.emit("market:buy",id,r=>{if(!r||!r.ok)return toast("Listing sudah terjual");s.gold-=l.price;s.inv.push(l.item);s.buys=(s.buys||0)+1;save();toast("🤝 Dibeli: "+l.item);openPanel("market")})}
function mSell(n){const i=s.inv.indexOf(n);if(i<0)return;const v=parseInt(prompt(`Harga jual ${n}?`,Math.round(ITEMS[n][3]*1.2)));if(!v||v<1)return;s.inv.splice(i,1);SOCK.emit("market:list",{item:n,price:v});save();toast("📦 Dipasang di market");openPanel("market")}
function mCancel(id){SOCK.emit("market:cancel",id)}
// ===== ONLINE (socket.io) =====
let SOCK=null,myId=null,netHello=false,NET={online:[],parties:[],listings:[],guilds:[]},netT=null,lastPanel="";
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const avImg=i=>{const a=AVATARS[i||0];return a?`<img class="iti" src="${imgUrl(a[1])}" referrerpolicy="no-referrer">`:"👤"};
const avById=id=>{const p=NET.online.find(x=>x.id===id);return avImg(p&&p.av)};
function prof(){return {name:s.name,level:s.level,str:atk(),def:dfn(),dex:dexT(),maxHp:s.maxHp,av:s.av||0,guild:s.guild||"",steps:s.steps,gold:s.gold,kills:s.kills,pk:s.pk||0,qc:s.qc,bk:s.bk,loc:s.loc,bio:s.bio||"",showcase:s.showcase||[]}}
function netUpd(){if(!SOCK||!SOCK.connected)return;clearTimeout(netT);netT=setTimeout(()=>SOCK.emit("update",prof()),800)}
function myParty(){return NET.parties.find(p=>p.members.some(m=>m.id===myId))}
function partyCreate(){if(!SOCK)return toast("Tidak terhubung ke server");const n=prompt("Nama party:",s.name+"'s party");if(n===null)return;SOCK.emit("party:create",n)}
function partyJoin(id){SOCK.emit("party:join",id);const p=NET.parties.find(x=>x.id===id);addNote("Player Interaction","Kamu bergabung dengan party "+esc(p?p.name:""))}
function partyLeave(){SOCK.emit("party:leave");toast("Keluar dari party")}
function netInit(){
 if(typeof io==="undefined"||SOCK)return;
 SOCK=io();
 SOCK.on("connect",()=>{myId=SOCK.id;SOCK.emit("hello",prof());netHello=true;SOCK.emit("chat:history",h=>{CHAT=h||{};renderChat()})});
 SOCK.on("chat:msg",m=>{(CHAT[m.ch]=CHAT[m.ch]||[]).push(m);if(CHAT[m.ch].length>60)CHAT[m.ch].shift();if(m.ch===chatC)renderChat()});
 SOCK.on("announce",a=>{addNote("System",`📢 ${esc(a.txt)}`);toast("📢 "+a.txt)});
 SOCK.on("admin:gift",g=>{if(g.gold)addGold(g.gold);if(g.dia)s.dia=(s.dia||0)+g.dia;(g.items||[]).forEach(i=>ITEMS[i]&&s.inv.push(i));addNote("System",`🎁 Admin memberimu ${g.gold?"🪙 "+g.gold.toLocaleString()+" ":""}${g.dia?"💎 "+g.dia+" ":""}${(g.items||[]).join(", ")}`);save();toast("🎁 Hadiah dari admin!")});
 SOCK.on("admin:kicked",()=>{alert("Kamu di-kick oleh admin.");doLogout()});
 SOCK.on("state",st=>{NET=st;const b=document.getElementById("onlineN");if(b)b.textContent=st.online.length;if(!document.getElementById("modal").classList.contains("hidden")&&["party","myparty","online","pvp","market","allguilds"].includes(lastPanel))openPanel(lastPanel)});
 SOCK.on("credit",c=>{addNote("Market",`${esc(c.note||"Market")}${c.gold?" — kamu menerima 🪙 "+c.gold.toLocaleString():""}${c.dia?" 💎 "+c.dia:""}`);if(c.gold)addGold(c.gold);if(c.dia)s.dia=(s.dia||0)+c.dia;(c.items||[]).forEach(i=>ITEMS[i]&&s.inv.push(i));save();toast(`💰 ${c.note||"Market"}${c.gold?" +"+c.gold.toLocaleString()+"G":""}${c.dia?" +"+c.dia+"💎":""}`)});
 SOCK.on("pvp:attacked",({by,won,gold})=>{addNote("PvP",won?`${esc(by)} menyerangmu dan menang, mencuri 🪙 ${Math.min(s.gold,gold).toLocaleString()}.`:`${esc(by)} menyerangmu tapi kalah.`);if(won){const l=Math.min(s.gold,gold);s.gold-=l;eventText(`⚔️ ${esc(by)} menyerangmu dan menang! -${l.toLocaleString()} Gold`)}else eventText(`🛡️ ${esc(by)} menyerangmu tapi kalah!`);save();toast(`⚔️ Diserang oleh ${by}`)});
}
function pvpFight(id){
 const p=NET.online.find(x=>x.id===id);
 if(!p)return toast("Pemain sudah offline");if(enemy)return toast("Selesaikan battle dulu");if(s.hp<=0)return toast("💀 HP 0, sembuhkan dulu");if(s.energy<1)return toast("⚡ Energy tidak cukup");
 s.energy--;
 enemy={ico:avImg(p.av).replace('class="iti"','class="avi big"'),name:p.name,level:p.level,hp:Math.max(50,p.maxHp),maxHp:Math.max(50,p.maxHp),attack:Math.max(3,Math.round(p.str*.6)),def:p.def,gold:[0,0],xp:[p.level*8,p.level*16],drop:[],m:1,pvp:id,steal:Math.floor(p.gold*.05)};
 save();openPanel("battle");
}
function closePanel(){if(PAGE){if(lastPanel===PAGE)return void(location.href="index.html");return openPanel(PAGE)}const m=document.getElementById("modal");m.classList.add("hidden");m.classList.remove("full","page")}

// MENU SAMPING (hamburger)
function toggleMenu(){document.getElementById("sideMenu").classList.toggle("open");document.getElementById("sideBackdrop").classList.toggle("open")}
function menuGo(p){toggleMenu();navGo(p)}

// ===== DATA DARI smmo-wiki.com =====
let sprintUntil=0;
// lokasi: nama, level minimal, musuh
const LOCS=[["Simpletopia",1,["Slime","Goblin","Wolf"]],["Holbeck",5,["Wolf","Dark Knight"]],["Davenport",10,["Dark Knight","Troll"]],["Ironforge",30,["Troll","Frost Giant","Mountain Troll"]],["Everwinter",50,["Frost Giant","Void Reaper","Griffon"]],
 ["Elise Mountain",100,["Mountain Troll","Griffon","Imp"]],["The Underworld",150,["Imp","Demon Knight","Elvenguard"]],["Desert of Eternal Dreams",200,["Sand Wraith","Mirage Djinn"]],["Ednia",250,["Elvenguard","Ednian Sorcerer"]],["Mount Byrior",300,["Stone Golem","Rock Wyvern"]],
 ["Baththagnte Creek",350,["Swamp Lurker","Bog Hydra"]],["Saint Xvilhol",400,["Fallen Paladin","Cathedral Wraith"]],["New Bramp",450,["Bandit Captain","Highway Brute"]],["Lake Masmark",500,["Lake Serpent","Drowned Marauder"]],["Eldham",550,["Elder Wight","Ancient Guardian"]],
 ["Mount Hawkfels",600,["Hawkfel Harpy","Cliff Behemoth"]],["Old Ranhor",650,["Ranhor Revenant","Ruin Colossus"]],["Venzor",700,["Venzorian Brute","Magma Hound"]],["Dragontail",800,["Wyrmling","Dragon Knight","Ancient Wyrm"]],["Arkhan",900,["Arkhan Reaper","Voidlord Arkhan"]]];
// Battle Arena: tier, EXP modifier, syarat selesai (NPC), biaya maks (gold)
const ARENA=[["Copper League",2,100,1000],["Bronze League",2.2,225,2500],["Silver League",2.4,500,6000],["Gold League",2.6,950,9375],["Platinum League",3,1500,11250],["Titanium League",3.5,2500,13750],["7th Circle",4,3000,16250],["Ragnarok",4.5,4000,18750],["Mount Olympus",5,5000,21250],["Rapture",5.5,6000,27000],["Nirvana",6,7500,34500]];

function pool(){return enemies.filter(e=>LOCS[s.loc][2].includes(e.name))}
function arenaCost(i){return Math.min(ARENA[i][3],5*s.level*(i+1)+10)}
function arenaFight(i){
 closePanel();
 if(enemy)return toast("Selesaikan battle dulu");
 const c=arenaCost(i);
 if(s.hp<=0)return toast("💀 HP 0, sembuhkan dulu");
 if(s.energy<1)return toast("⚡ Energy tidak cukup");
 if(s.gold<c)return toast("❌ Gold tidak cukup!");
 s.energy--;s.gold-=c;const p=pool();spawn(p[rand(0,p.length-1)]);enemy.arena=i+1;save();
}
const ARENA_ICO=["⚔️","🥉","🥈","🥇","💠","☠️","⛧","🔮","🌋","☄️","✴️"];
function arenaDia(i){return 2*(i+1)}
function openArenaReward(){const i=s.au,a=ARENA[i];document.getElementById("modalTitle").textContent="";
 document.getElementById("modalBody").innerHTML=`<div class=gm><div class=gm-ico>${ARENA_ICO[i]}</div><h3 class=qt>${a[0]} Reward</h3><p class=gm-p>Complete the tier and receive the rewards.</p><div class=gm-sec><span>Rewards</span></div><div class=chips><span>🗝️ 1 Gold Key</span><span>💎 ${arenaDia(i)} Diamonds</span><span>🪙 ${(arenaCost(i)*30).toLocaleString()}</span><span>📦 2 Items</span></div></div><button class="fight alt" style="margin-top:16px;background:#111" onclick="openPanel('hub')">Close</button>`;
 const m=document.getElementById("modal");m.classList.remove("full");m.classList.remove("hidden")}
function arenaWin(msg){
 const i=enemy.arena-1,a=ARENA[i],x=Math.round(a[1]*nextXP()*.06),lv=addXP(x);
 s.kills++;s.ap[i]=(s.ap[i]||0)+1;let ex="";
 if(i===s.au&&s.ap[i]>=a[2]&&i<10){s.au++;const g=arenaCost(i)*30,d=arenaDia(i);addGold(g);s.inv.push(rollItem(),rollItem());s.keys=s.keys||{};s.keys.Gold=(s.keys.Gold||0)+1;s.dia=(s.dia||0)+d;ex=` 🎁 ${ARENA[s.au][0]} terbuka! Reward: 1 Gold Key, 💎 ${d}, +${g}G & 2 item`;addNote("Action",`Tier ${a[0]} selesai! +1 Gold Key, 💎 ${d}`)}
 eventText(`${msg}🏟️ ${enemy.name} kalah di ${a[0]}! +${x} XP${lv?" LEVEL UP!":""}.${ex}`);
 showDrop(`+${x} EXP`,"#00ff88");enemy=null;save();renderAction();closePanel();
}
function doQuest(i){
 const q=QUESTS[i];
 if(s.qe<1)return toast("🔥 Quest Point habis");
 s.qe--;
 if(chance(Math.min(1,dexT()/q[2]))){
  const k=(1+s.level*.25)*(1+.005*s.qc),g=Math.round(q[5]*k),x=Math.round(q[6]*k*buffMul("quest"));
  addGold(g);addXP(x);s.qd[i]=(s.qd[i]||0)+1;
  if(s.qd[i]===q[4]){s.qc++;toast("🏁 Quest selesai! Bonus quest +0,5%");addNote("Action",`Quest "${q[3]}" selesai!`)}else toast(`✅ ${q[7]} +${g}G +${x}XP`);
 }else toast("❌ "+q[8]);
 save();openQuest(i);
}
let qf=0;
function openQuest(i){
 const q=QUESTS[i],d=s.qd[i]||0,k=(1+s.level*.25)*(1+.005*s.qc),p=Math.round(Math.min(1,dexT()/q[2])*100);
 document.getElementById("modalTitle").textContent="";
 document.getElementById("modalBody").innerHTML=`<div class=gm><div class=gm-ico>${q[0]}</div><h3 class=qt>${q[3]}</h3><div class=chips><span>Lv. ${q[1]}</span><span class="${p>=100?"ok":p>=50?"mid":"bad"}" title="${q[2]} Dexterity: 100%">${p}% Success</span></div><div class=qr>Rewards</div><div class=chips><span>✨ ${Math.round(q[6]*k)}</span><span>🪙 ${Math.round(q[5]*k)}</span></div></div>`
  +`<div class=cm-row><b>Progress</b><span><b>${Math.min(d,q[4])}</b> / ${q[4]}</span></div>${pbar(d,q[4],"#2ecc71")}<div class=cm-row><b>Quest Points</b><span><b style="color:#5b9cff">${s.qe}</b>/50</span></div>${pbar(s.qe,50,"#5b9cff")}`
  +(p<100?`<div class=warn>⚠️ Naikkan <b>Dexterity</b> ke ${q[2]} untuk 100% sukses.</div>`:"")
  +`<button class=fight style="background:#4f46e5;margin-top:16px" onclick="doQuest(${i})">Perform</button><button class="fight alt" style="margin-top:8px" onclick="openPanel('quests')">Close</button>`;
 const m=document.getElementById("modal");m.classList.remove("full","page");m.classList.remove("hidden");
}
function goLoc(i){if(LOCS[i][1]>s.level)return toast("Level kurang");s.loc=i;s.vis=s.vis||{};s.vis[i]=1;save();toast("Tiba di "+LOCS[i][0]);openPanel("loc")}
function healer(){
 if(s.hp>=s.maxHp)return toast("HP penuh");
 if(s.healerFreeUses>0){s.healerFreeUses--;s.hp=s.maxHp;save();toast("🧙 Folen menyembuhkanmu (gratis, sisa "+s.healerFreeUses+"x)");openPanel("potions");return}
 const c=5*s.level;
 if(s.gold<c)return toast("❌ Gold tidak cukup!");
 s.gold-=c;s.hp=s.maxHp;save();toast("🧙 Folen menyembuhkanmu");openPanel("potions");
}

// ===== TRAVEL PARTY (gratis, maks 4): saat kamu melangkah, teman punya peluang kasih EXP & Gold kecil sesuai levelmu =====
function partyStep(){
 const mp=myParty();if(!mp)return;let g=0,x=0;const who=[];
 mp.members.filter(m=>m.id!==myId).forEach(m=>{if(chance(.4)){g+=rand(1,s.level*2);x+=rand(1,s.level*2);who.push(m.name)}});
 if(who.length){addGold(g);addXP(x);eventText(`👥 Party (${who.map(esc).join(", ")}) ikut melangkah: +${x} EXP +${g} Gold`)}
}
function renderParty(){const e=document.getElementById("bExp");if(e)e.textContent="📍 "+LOCS[s.loc][0]}
// MODAL GATHERING (ala SimpleMMO)
function openGather(){
 if(!node)return;
 const k=node.sk,n=NODES[k],[lv,xp]=s.sk[k],need=20*lv,pct=Math.round(xp/need*100),has=s.tools[n.tool],r=RAR[ITEMS[n.res][0]];
 document.getElementById("modalTitle").textContent="";
 document.getElementById("modalBody").innerHTML=`<div class=gm><div class=gm-ico>${n.icon}</div><div class=gm-res>${n.res}</div><b>${k}</b><div class=gm-lv>Level ${lv} <span style="color:${r[1]}">${r[0]}</span></div>`
  +`<div class=gm-sec><span>Information</span></div><div class=stat><span>${k} Level</span><b>${lv}</b></div><div class=stat><span>Equipped Item</span><b style="color:${has?"#8fb4ff":"#ff6b6b"}">${has?n.tool:"Belum punya "+n.tool}</b></div><div class=stat><span>Remaining Material</span><b>${node.left}</b></div>`
  +`<div class=gm-sec><span>Progress</span></div><div class=gm-pr><b>${pct}%</b><span><b>${need-xp}</b> exp remaining</span></div><div class=gbar><i style="width:${pct}%"></i></div>`
  +`<button class=fight style="background:#4f46e5;margin-top:16px" onclick="gather()">${n.icon} ${n.verb}</button><button class="fight alt" style="margin-top:8px" onclick="closePanel()">Close</button></div>`;
 const m=document.getElementById("modal");m.classList.remove("full","page");m.classList.remove("hidden");
}

// ===== halaman-halaman ala app SimpleMMO =====
const SLOTS=[["helmet","Helmet"],["amulet","Amulet"],["armor","Armour"],["weapon","Weapon"],["shield","Shield"],["pet","Pet"],["greaves","Greaves"],["gauntlet","Gauntlet"],["boots","Boots"],["special","Special"]];
const SHOPS=[["Ronwarus Fruit and Veg Shop",["Healing Herb"],"🥕"],["Caspers Emporium",SHOP_GEAR,"🧛"],["Mysterious Shop",[],"🧙"],["Mikels Beasts",[],"🐾"],["Toms Tools",["Pickaxe","Axe","Fishing Rod","Shovel"],"🔧"]];
const AWARDS=[["Baby Steps","This player has taken 100 steps.",s=>s.steps>=100],["Butcher","This player has defeated 10 NPCs.",s=>s.kills>=10],["Checkbox","This player has completed their first quest.",s=>s.qc>=1],["Gatherer","This player has gathered 10 resources.",s=>s.q.gathers>=10],["Marathon","This player has taken 1,000 steps.",s=>s.steps>=1000],["Rich","This player has held 10,000 gold.",s=>s.gold>=10000],["Slayer","This player has defeated 100 NPCs.",s=>s.kills>=100],["Dragon Slayer","This player has defeated a world boss.",s=>s.bk>=1],["Legacy Lite","This player has reset using Legacy Lite Mode.",s=>!!(s.legacy&&s.legacy.list.some(x=>x.mode==="lite"))],["Legacy Pro","This player has reset using Legacy Pro Mode.",s=>!!(s.legacy&&s.legacy.list.some(x=>x.mode==="pro"))]];
let itab=0,ptab=0,isort=0,curShop=0;
function checkAwards(){if(s)AWARDS.forEach(a=>{if(!s.aw[a[0]]&&a[2](s)){s.aw[a[0]]=Date.now();toast("🏅 Award: "+a[0])}})}
function ago(t){const m=Math.floor((Date.now()-t)/60000);return m<1?"just now":m<60?m+" minutes ago":m<1440?Math.floor(m/60)+" hours ago":Math.floor(m/1440)+" days ago"}
function pbar(v,m,c){return `<div class=gbar2><i style="width:${Math.min(100,v/m*100)}%;background:${c}"></i></div>`}
function tabs(l,a,f){return `<div class=tabs>${l.map((x,i)=>`<button class="${i===a?"on":""}" onclick="${f}(${i})">${x}</button>`).join("")}</div>`}
function invTab(i){itab=i;openPanel("inventory")}
function invSort(i){isort=i;openPanel("inventory")}
function profTab(i){ptab=i;openPanel("profile")}
function addStat(k){if(s.pts<=0)return;s.pts--;s[k]++;save();openPanel("char")}
let rfTab=0,rfN=0,rfM=0;
function muUsed(){const d=new Date().toDateString();if(!s.mu||s.mu.d!==d)s.mu={d,n:0};return s.mu.n}
function openRefill(){
 const miss=100-s.energy,cost=Math.ceil(rfN/5),mush=s.inv.filter(x=>x==="Mushroom of Energy").length,used=muUsed();
 document.getElementById("modalTitle").textContent="";
 document.getElementById("modalBody").innerHTML=`<div class="poh" style="justify-content:space-between">⚡ <b style="flex:1">Refill Energy Points</b><span class=chips><span>💎 ${(s.dia||0).toLocaleString()} Available</span></span></div>`
  +`<div class=qf>${["Diamonds","Mushroom of Energy","Gold"].map((x,i)=>`<button class="${i===rfTab?"sel":""}" onclick="rfTab=${i};openRefill()">${x}</button>`).join("")}</div>`
  +(rfTab===0?`<div class=gm-sec><span>How many Energy Points do you wish to refill?</span></div><div class=sp-in><input type=number value=${rfN} min=0 onchange="rfN=Math.max(0,Math.min(${miss},+this.value||0));openRefill()"><button onclick="rfN=Math.max(0,rfN-1);openRefill()">-</button><button onclick="rfN=Math.min(${miss},rfN+1);openRefill()">+</button><button onclick="rfN=${miss};openRefill()">Max</button></div>`
    +`<div class=gm-sec><span>Tier Breakpoints</span></div><div class=bpg>${[10,25,50,100,200,500,750,1000].map(v=>`<button onclick="rfN=Math.min(${miss},${v});openRefill()">${v.toLocaleString()}</button>`).join("")}</div>`
    +`<div class=gm-sec><span>Cost</span></div><div class=chips><span>💎 ${cost} Diamonds</span></div><button class=fight style="background:${rfN&&s.dia>=cost?"#4f46e5":"#2a2a6a"};margin-top:16px" onclick="rfBuy()">Purchase Energy Points</button>`
  :rfTab===1?`<div class=gm-sec><span>Usage (Resets daily)</span></div>${pbar(used,125,"#ff9f43")}<div class=cm-row><span><b style="color:#ff9f43">${used}</b> / 125</span><span>Available <b>${mush}</b></span></div><div class=gm-sec><span>Available Mushrooms of Energy</span></div><button class="fight alt" style="background:#262628" onclick="rfM=Math.min(${mush},${125-used},rfM+1);openRefill()">+1 (pakai ${rfM})</button><button class=fight style="background:${rfM?"#4f46e5":"#2a2a6a"};margin-top:12px" onclick="rfMush()">Use Mushrooms of Energy</button><p class=hint>1 Mushroom = +10 ⚡. Mushroom kadang ditemukan saat melangkah.</p>`
  :`<p class=gm-p>Isi penuh energy dengan gold.</p><button class=fight style="background:#4f46e5;margin-top:12px" onclick="refillEnergy()">Refill penuh (🪙 ${(20*s.level).toLocaleString()})</button>`)
  +`<button class="fight alt" style="margin-top:8px;background:#111" onclick="rfN=0;rfM=0;openPanel('hub')">Close</button>`;
 const m=document.getElementById("modal");m.classList.remove("full");m.classList.remove("hidden")}
function rfBuy(){const c=Math.ceil(rfN/5);if(!rfN)return;if((s.dia||0)<c)return toast("💎 Diamond tidak cukup");s.dia-=c;s.energy=Math.min(100,s.energy+rfN);toast(`⚡ +${rfN} Energy`);rfN=0;save();openRefill()}
function rfMush(){if(!rfM)return;for(let i=0;i<rfM;i++)s.inv.splice(s.inv.indexOf("Mushroom of Energy"),1);muUsed();s.mu.n+=rfM;s.energy=Math.min(100,s.energy+rfM*10);toast(`🍄 +${rfM*10} Energy`);rfM=0;save();openRefill()}
function refillEnergy(){const c=20*s.level;if(s.energy>=100)return toast("Energy penuh");if(s.gold<c)return toast("❌ Gold tidak cukup!");s.gold-=c;s.energy=100;save();toast("⚡ Energy penuh");openRefill()}
function eqHTML(){
 const row=(n,l)=>n?`<div class=er>${ico(n,"lg")}<div style="flex:1"><b class=dot style="color:${RAR[ITEMS[n][0]][1]}">${n}</b><br><small>+${ITEMS[n][2].toLocaleString()} ${isOff(ITEMS[n][1])?"str":"def"}${exTxt(n)}</small> ${dbLink(n)}</div><span>${l}</span></div>`:`<div class="er dim"><div>Empty ${l} Slot</div></div>`;
 const tl=[["Axe","Wood Axe"],["Fishing Rod","Fishing Rod"],["Pickaxe","Pickaxe"],["Shovel","Shovel"]].map(([k,l])=>s.tools[k]?`<div class=er>${ico(k,"lg")}<div style="flex:1"><b class=dot style="color:#8fb4ff">${k}</b></div><span>${l}</span></div>`:`<div class="er dim"><div>Empty ${l} Slot</div></div>`);
 return `<div class=elist>`+SLOTS.slice(0,6).map(([k,l])=>row(s.eq[k],l)).join("")+tl.join("")+SLOTS.slice(6).map(([k,l])=>row(s.eq[k],l)).join("")+`</div>`;
}
function itemsHTML(){
 const cnt=n=>s.inv.filter(x=>x===n).length,u=[...new Set(s.inv)].sort([(a,b)=>cnt(b)-cnt(a),(a,b)=>a.localeCompare(b),(a,b)=>ITEMS[b][2]-ITEMS[a][2],(a,b)=>ITEMS[b][3]-ITEMS[a][3],(a,b)=>ITEMS[b][0]-ITEMS[a][0]][isort]);
 return `<div class=card2><small>Inventory</small><div class=cm-row><b>${s.inv.length} <span style="color:#888">/ 20,000</span></b><b>${(s.inv.length/200).toFixed(1)}%</b></div>${pbar(s.inv.length,20000,"#555")}</div>`
  +`<div class=sortbar>${["Qty","Name","Stats","Value","Level"].map((x,i)=>`<button class="${i===isort?"on":""}" onclick="invSort(${i})">${x}</button>`).join("")}</div>`
  +(u.length?u.map(n=>{const [r,ty,v,p]=ITEMS[n],eq=SLOTS.some(x=>x[0]===ty),cur=eq&&s.eq[ty]?ITEMS[s.eq[ty]][2]:0;
   return `<div class=ir><div class=ir-top>${ico(n,"lg")}<div style="flex:1"><div>x${cnt(n)} <b class=dot style="color:${RAR[r][1]};cursor:pointer" onclick="inspectItem('${n.replace(/'/g,"\\'")}')">${n}</b> <span class=lv>— Level ${ilv(n).toLocaleString()}</span> ${dbLink(n)}${(s.locked||[]).includes(n)?' <i class="fa-solid fa-lock" style="color:#f5c518;font-size:11px" title="Terkunci"></i>':""}</div><div class=ir-sub>🪙 ${p.toLocaleString()}${eq?` · +${v.toLocaleString()} ${isOff(ty)?"str":"def"}${exTxt(n)} ${v>cur?"<i style=color:#2ecc71>▲</i>":v<cur?"<i style=color:#e74c3c>▼</i>":""}`:ty==="potion"?` · +${v} hp`:""}</div></div><span class=ir-slot>${eq?SLOTS.find(x=>x[0]===ty)[1]:ty==="potion"?"Food":ty==="boost"?"Potion":ty==="tool"?"Tool":"Material"}</span></div><div class=ir-act>${eq?`<button class=mini onclick="equip('${n}')">Equip</button>`:ty==="potion"?`<button class=mini onclick="heal(DECODE('${encodeURIComponent(n)}'))">Pakai</button>`:""}<button class="mini alt" onclick="sell('${n}')">Jual</button><button class="mini alt" onclick="inspectItem('${n.replace(/'/g,"\\'")}')">🔍</button></div></div>`}).join(""):"<p>Kosong.</p>");
}

// ===== auto-login (sesi tersimpan) untuk semua halaman =====
(function(){const u=localStorage.getItem("sq_user");if(u)doLogin(u);else if(PAGE)location.href="index.html"})();
