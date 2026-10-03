const KEY="stepquest_v2_";
let s=null,SK="",enemy=null,node=null,cooldown=false,isAdmin=false,logs=[];

// Rarity ala SimpleMMO
const RAR=[["Common","#b0b0b0"],["Uncommon","#4cd964"],["Rare","#4da6ff"],["Elite","#c56cf0"],["Epic","#ff9f43"],["Legendary","#ff4757"],["Celestial","#5ce1e6","linear-gradient(90deg,#5ce1e6,#3a6bff)"],["Exotic","#b58cff","linear-gradient(90deg,#4cd964,#b58cff)"]];
const W=[58,20,15,4.5,1.8,.6,.08,.02]; // bobot drop tiap rarity (%)
// nama:[rarity,tipe,stat,harga jual]
const ITEMS={
 "Slime Core":[0,"mat",0,5],"Goblin Ear":[0,"mat",0,8],"Wolf Fang":[1,"mat",0,15],"Healing Herb":[0,"potion",35,20],
 "Iron Ore":[0,"mat",0,10],"Oak Log":[0,"mat",0,8],"Trout":[0,"mat",0,9],"Old Coin Pouch":[1,"mat",0,40],
 "Rusty Dagger":[0,"weapon",5,30],"Iron Sword":[1,"weapon",9,120],"Knight Blade":[3,"weapon",16,600],"Dragon Fang":[5,"weapon",30,5000],
 "Leather Vest":[0,"armor",4,30],"Knight Helm":[2,"helmet",10,200],"Shadow Cloak":[4,"armor",18,1500],"Dragon Scale":[5,"armor",25,4000],
 "Storm Cleaver":[4,"weapon",22,1800],
 "Celestial Blade":[6,"weapon",50,50000],"Astral Plate":[6,"armor",42,40000],
 "Prismatic Edge":[7,"weapon",75,150000],"Prismatic Aegis":[7,"armor",62,120000],
 "Wooden Shield":[0,"shield",6,40],"Leather Boots":[0,"boots",4,30],"Leather Gloves":[0,"gauntlet",3,30],"Lucky Charm":[1,"amulet",5,90],"Wolf Pup":[1,"pet",8,200]
};
const enemies=[
 {ico:"🟢",name:"Slime",level:1,hp:28,attack:5,gold:[8,22],xp:[12,25],drop:["Slime Core"]},
 {ico:"👺",name:"Goblin",level:2,hp:42,attack:8,gold:[15,35],xp:[20,38],drop:["Goblin Ear","Rusty Dagger"]},
 {ico:"🐺",name:"Wolf",level:3,hp:58,attack:11,gold:[24,52],xp:[30,55],drop:["Wolf Fang"]},
 {ico:"🗡️",name:"Dark Knight",level:5,hp:100,attack:18,gold:[55,110],xp:[70,120],drop:["Iron Sword","Knight Helm"]},
 {ico:"👹",name:"Troll",level:8,hp:180,attack:26,gold:[110,220],xp:[140,240],drop:["Knight Blade","Knight Helm"]},
 {ico:"🥶",name:"Frost Giant",level:12,hp:300,attack:34,gold:[200,380],xp:[260,420],drop:["Storm Cleaver","Shadow Cloak"]},
 {ico:"💀",name:"Void Reaper",level:20,hp:500,attack:48,gold:[400,700],xp:[500,800],drop:["Dragon Fang","Dragon Scale"]}
];
const BOSS={ico:"🐉",name:"🐉 Abyssal Dragon (WORLD BOSS)",level:15,hp:500,attack:35,gold:[500,1000],xp:[800,1500],drop:["Dragon Scale","Dragon Fang"]};
// 4 gathering skill, masing-masing butuh tool sendiri
const NODES={
 Mining:{verb:"Mine",tool:"Pickaxe",res:"Iron Ore",icon:"⛏️",txt:"urat bijih besi"},
 Woodcutting:{verb:"Chop",tool:"Axe",res:"Oak Log",icon:"🪓",txt:"pohon oak besar"},
 Fishing:{verb:"Catch",tool:"Fishing Rod",res:"Trout",icon:"🎣",txt:"kolam penuh ikan"},
 Treasure:{verb:"Dig",tool:"Shovel",res:"Old Coin Pouch",icon:"🗝️",txt:"tanah yang mencurigakan"}
};
const SHOP=[["Healing Herb",50,"+35 HP","item"],["Rusty Dagger",150,"+5 ATK","item"],["Leather Vest",120,"+4 DEF","item"],["Iron Sword",400,"+9 ATK","item"],["Knight Helm",300,"+10 DEF","item"],["Pickaxe",250,"Tool Mining","tool"],["Axe",250,"Tool Woodcutting","tool"],["Fishing Rod",250,"Tool Fishing","tool"],["Shovel",300,"Tool Treasure","tool"],["Wooden Shield",120,"+6 DEF","item"],["Leather Boots",90,"+4 DEF","item"],["Leather Gloves",90,"+3 DEF","item"]];
const FLAVOR=["Seorang petani memberimu sebuah apel.","Kamu melihat merpati membawa surat kosong.","Kamu tersandung akar pohon. Untung tidak ada yang lihat.","Seorang pedagang berbisik: harga Healing Herb naik besok.","Awan di atas kepalamu berbentuk seperti Slime."];

const def=()=>({name:"",level:1,xp:0,gold:0,hp:100,maxHp:100,str:10,def:5,dex:5,steps:0,kills:0,inv:[],eq:{weapon:null,armor:null},energy:100,qe:50,tools:{},party:[],loc:0,pts:0,craft:[1,0],npc:{},vis:{0:1},pots:{exp:2,rar:1},pa:{},tx:0,bk:0,bank:0,feed:[],aw:{},joined:Date.now(),qd:{},qc:0,au:0,ap:[],sk:{Mining:[1,0],Woodcutting:[1,0],Fishing:[1,0],Treasure:[1,0]},q:{steps:0,kills:0,gathers:0}});

// UTIL
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function chance(p){return Math.random()<p}
function nextXP(){return Math.round(50*s.level*(1+s.level/10))}
const isOff=t=>t==="weapon"||t==="pet";
function gear(k){return Object.values(s.eq).reduce((a,n)=>a+(n&&(isOff(ITEMS[n][1])?"str":"def")===k?ITEMS[n][2]:0),0)}
function atk(){return s.str+gear("str")}
function dfn(){return s.def+gear("def")}
function nm(n){const r=RAR[ITEMS[n][0]];return `<b style="color:${r[1]};${r[2]?`background:${r[2]};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent`:""}">${n}</b>`}
function bar(v,m){return `<div class=hpb><i style="width:${Math.max(0,v/m*100)}%"></i></div>`}
function save(){checkAwards();localStorage.setItem(SK,JSON.stringify(s));updateUI()}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1500)}
function rollItem(){
 let r=Math.random()*100*(s.pa&&s.pa.rar>Date.now()?.95:1),t=0;
 while(t<7&&r>=W[t]){r-=W[t];t++}
 let p=[];for(;t>=0;t--){p=Object.keys(ITEMS).filter(k=>ITEMS[k][0]==t);if(p.length)break}
 return p[rand(0,p.length-1)];
}

function doLogin(){
 const un=document.getElementById("username").value.trim();
 if(!un){alert("Username kosong!");return}
 isAdmin=un.toLowerCase()==="admin";
 SK=KEY+un.toLowerCase();
 s=Object.assign(def(),JSON.parse(localStorage.getItem(SK)||"null")||{});
 s.name=un;
 document.getElementById("loginOverlay").style.display="none";
 document.getElementById("gameScreen").style.display="flex";
 toast(isAdmin?"Login Admin Aktif!":"Welcome, "+un);
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
 while(s.xp>=nextXP()){s.xp-=nextXP();s.level++;lv++;s.maxHp+=10;s.hp=s.maxHp;s.pts+=4;s.feed.unshift(["Reached level "+s.level,Date.now()]);s.feed.length=Math.min(s.feed.length,20)}
 return lv;
}
function addGold(n){s.gold+=n}
function skillXP(k,x){
 const a=s.sk[k];a[1]+=x;
 while(a[1]>=20*a[0]){a[1]-=20*a[0];a[0]++;toast(`${k} naik ke Lv ${a[0]}!`)}
}

function updateUI(){
 if(!s)return;
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
  const xp=(rand(2*s.level,4*s.level)),g=(rand(3*s.level,8*s.level));
  const lv=addXP(xp);addGold(g);
  t=`👣 ${FLAVOR[rand(0,FLAVOR.length-1)]} +${xp} EXP & +${g} Gold.${lv?` LEVEL UP! Lv ${s.level}.`:""}`;
  showDrop(`+${xp} EXP`,"#00ff88");showDrop(`+${g} Gold`,"#ffcc00",150,25);
 }else if(r<.50){
  const n=rollItem(),xp=rand(s.level,2*s.level+1);s.inv.push(n);addXP(xp);
  t=`📦 Item ditemukan: ${nm(n)} (${RAR[ITEMS[n][0]][0]})! +${xp} EXP.`;
  showDrop(`+${xp} EXP`,"#00ff88");showDrop("Item!",RAR[ITEMS[n][0]][1],150,25);
 }else if(r<.62){
  const k=Object.keys(NODES)[rand(0,3)];node={sk:k,icon:NODES[k].icon,left:rand(2,4)};
  t=`${NODES[k].icon} Kamu menemukan ${NODES[k].txt}! Butuh ${NODES[k].tool}.`;
 }else if(r<.80){
  {const p=pool();spawn(p[rand(0,p.length-1)])}t=`⚔️ Menemukan ${enemy.name} Lv ${enemy.level}!`;
 }else if(r<.90){
  const h=rand(5,15)+s.level*2,xp=rand(s.level,2*s.level+1);s.hp=Math.min(s.maxHp,s.hp+h);addXP(xp);
  t=`💧 Menemukan mata air. +${h} HP.`;
  showDrop(`+${h} HP`,"#ff4757");showDrop(`+${xp} EXP`,"#00ff88",150,25);
 }else t="💨 Jalanan sunyi... tidak ada apa-apa.";
 eventText(t);partyStep();save();renderAction();
 let sec=Math.max(3500,rand(4000,9000)*(Date.now()<sprintUntil?.75:1));if(isAdmin)sec=Math.floor(sec/4);
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
  const x=rand(4,8);s.inv.push(n.res);s.q.gathers++;skillXP(node.sk,x);
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
  if(kind==="sp"||chance(Math.min(.95,.6+s.dex*.02))){
   let d=rand(Math.max(1,atk()-3),atk()+5);if(kind==="sp")d=Math.round(d*2.2);
   const crit=chance(.05+s.dex*.005);if(crit)d*=2;
   enemy.hp-=d;msg=`${kind==="sp"?"💫 Special":"⚔️ Serangan"} ${crit?"CRIT ":""}-${d} HP. `;
  }else msg="Seranganmu meleset! ";
  if(enemy.hp<=0)return win(msg);
 }
 const h=Math.max(1,rand(enemy.attack-3,enemy.attack+3)-dfn());
 s.hp=Math.max(0,s.hp-h);
 eventText(`${msg}${enemy.name} membalas -${h} HP.`);
 if(s.hp===0)return lose();
 save();openPanel("battle");
}

function win(msg){
 if(enemy.arena)return arenaWin(msg);
 const g=(Math.round(rand(enemy.gold[0],enemy.gold[1])*enemy.m)),x=(Math.round(rand(enemy.xp[0],enemy.xp[1])*enemy.m));
 addGold(g);const lv=addXP(x);s.kills++;s.npc=s.npc||{};s.npc[enemy.name.replace(/^\W+/,"")]=1;s.q.kills++;if(enemy.boss)s.bk++;
 let d="";
 if(chance(enemy.boss?1:.35)){const n=enemy.drop[rand(0,enemy.drop.length-1)];s.inv.push(n);d=` Drop: ${nm(n)}.`}
 if(chance(.08)){const n=rollItem();s.inv.push(n);d+=` Bonus: ${nm(n)}!`}
 eventText(`${msg}🏆 ${enemy.name} mati! +${g}G +${x}XP.${d}${lv?" LEVEL UP!":""}`);
 showDrop(`+${x} EXP`,"#00ff88");showDrop(`+${g} Gold`,"#ffcc00",150,25);
 enemy=null;save();renderAction();closePanel();
}
function lose(){
 s.hp=0;
 eventText(`☠️ Kamu kalah dari ${enemy.name}. HP 0, cari Healer atau pakai Herb.`);
 enemy=null;save();renderAction();closePanel();
}

// ITEM, SHOP, QUEST
function heal(){
 if(s.hp>=s.maxHp)return toast("HP penuh");
 const i=s.inv.indexOf("Healing Herb");if(i<0)return toast("Tidak ada Healing Herb");
 s.inv.splice(i,1);s.hp=Math.min(s.maxHp,s.hp+35);save();toast("+35 HP");openPanel("potions");
}
function equip(n){
 const t=ITEMS[n][1],old=s.eq[t];
 s.inv.splice(s.inv.indexOf(n),1);if(old)s.inv.push(old);
 s.eq[t]=n;toast("Dipakai: "+n);save();openPanel("inventory");
}
function sell(n){
 s.inv.splice(s.inv.indexOf(n),1);s.gold+=ITEMS[n][3];save();toast(`Terjual +${ITEMS[n][3]}G`);openPanel("inventory");
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
function openAdminPanel(){
 if(!isAdmin)return toast("Akses Ditolak! Login dengan username: admin");
 document.getElementById("modalTitle").textContent="⚙️ Admin";
 document.getElementById("modalBody").innerHTML=`<button class="btn-admin" onclick="addGold(100000);save();toast('100k Gold!')">💰 100k Gold</button><button class="btn-admin" style="background:#ff4757" onclick="s.hp=s.maxHp;s.energy=100;save();toast('HP & Energy Full!')">❤️ Full Heal</button><button class="btn-admin" style="background:#1fa971" onclick="adminLevel(5)">⬆️ +5 Level</button><p style="margin:8px 0;font-size:12px;color:var(--text-muted)">Beri item random per rarity:</p>`+RAR.map((r,i)=>`<button class="btn-admin" style="background:#23252a;border:1px solid ${r[1]};color:${r[1]}" onclick="adminGive(${i})">${r[0]}</button>`).join("");
 document.getElementById("modal").classList.remove("hidden");
}

function openPanel(type){
 const m=document.getElementById("modal"),t=document.getElementById("modalTitle"),b=document.getElementById("modalBody");
 let h="";m.classList.toggle("full",type==="battle");m.classList.toggle("page",["char","profile","hub","inventory","shops","shop","town","loc","settings","party","myparty","leader","lbview","boards","social","events","guilds","allguilds","tasks","craft","collect"].includes(type));
 if(type==="stats"){
  t.textContent="";
  const cr=(a,v,m)=>`<div class=cm-row><b>${a}</b><span><b>${v.toLocaleString()}</b> / ${m.toLocaleString()}</span></div>`;
  h=`<div class=cm-ban><i class="fa-solid fa-jedi"></i><div><b>${s.name}</b><span>Lv.${s.level}</span></div></div>${cr("Health",s.hp,s.maxHp)}${pbar(s.hp,s.maxHp,"#e84040")}${cr("Experience",s.xp,nextXP())}${pbar(s.xp,nextXP(),"#0f9d6e")}`
   +`<div class=cm-two><div>${cr("EP",s.energy,100)}${pbar(s.energy,100,"#f5b82e")}</div><div>${cr("QP",s.qe,50)}${pbar(s.qe,50,"#5b9cff")}</div></div>`
   +`<div class=gm-sec><span>Currencies</span></div><div class=stat><span>Gold</span><b>🪙 ${s.gold.toLocaleString()}</b></div><div class=stat><span>Bank</span><b>🪙 ${s.bank.toLocaleString()}</b></div>`
   +`<div class=gm-sec><span>Statistics</span></div><div class=stat><span>Steps</span><b>${s.steps}</b></div><div class=stat><span>PvE Kill</span><b>${s.kills}</b></div>`
   +`<button class=fight style="background:#4f46e5;margin-top:14px" onclick="profTab(0)">Public Profile</button><button class="fight alt" style="margin-top:8px" onclick="closePanel()">Close</button>`;
 }else if(type==="char"){
  t.textContent="Character";
  const sr=(k,l,v)=>`<div class="card2 flex"><div><small>${l}</small><br><b>${v}</b></div><button class=mini2 ${s.pts>0?"":"disabled"} onclick="addStat('${k}')">+</button></div>`;
  const pr=(l,v,m)=>`<div class=card2><small>${l}</small><div class=cm-row><b>${v} <span style="color:#888">/ ${m}</span></b><b>${Math.round(v/m*100)}%</b></div>${pbar(v,m,"#2ecc71")}</div>`;
  h=`<div class=pf-ban></div><div class=pf-av style="margin-top:-60px"><i class="fa-solid fa-jedi"></i></div><div class=pf-n><b>${s.name}</b></div><div class=pf-lv>Level ${s.level}</div><button class=fight style="background:#4f46e5" onclick="profTab(0)">View Public Profile</button>`
   +`<div class=gm-sec><span>Your Stats</span></div>${s.pts?`<div class=card2 style="border:1px solid #4f46e5">You have <b>${s.pts}</b> points remaining</div>`:""}${sr("str","Strength",atk())}${sr("def","Defence",dfn())}${sr("dex","Dexterity",s.dex)}<div class=card2><small>spATK Damage</small><br><b>+120%</b></div>`
   +`<div class=gm-sec><span>Skills</span></div>`+Object.entries(s.sk).map(([k,[l]])=>`<div class=srow><span>${NODES[k].icon} ${k}</span><span>Level ${l}</span></div>`).join("")
   +`<div class=gm-sec><span>Progress</span></div>${pr("Energy",s.energy,100)}${pr("Quest Points",s.qe,50)}${pr("Awards",Object.keys(s.aw).length,AWARDS.length)}`;
 }else if(type==="profile"){
  t.textContent="Profile";
  const row=(a,v)=>`<div class=srow><span>${a}</span><b>${v}</b></div>`,nA=Object.keys(s.aw).length;let b="";
  if(ptab===0)b=`<div class=pf-ban></div><div class=pf-av style="margin-top:-60px"><i class="fa-solid fa-jedi"></i></div><div class=pf-n><b>${s.name}</b> <small>#${s.name.length*1337%9000+1000}</small> <span class=on></span></div><div class=pf-lv>Level ${s.level}</div><div class=pf-pill>Online Now</div><div class="card2" style="text-align:center">“There is no motto for this player.”</div><div class=gm-sec><span>Feed</span></div><div class=card2>${s.feed.slice(0,3).map(f=>`<div class=srow><span><b>${f[0]}</b><br><small>${ago(f[1])}</small></span></div>`).join("")||"Belum ada aktivitas."}</div>`;
  else if(ptab===1)b=`<div class=card2><small>Strength</small><br><b>${atk()}</b></div><div class=card2><small>Defence</small><br><b>${dfn()}</b></div><div class=card2><small>Dexterity</small><br><b>${s.dex}</b></div><div class=card2><small>Health</small><div class=cm-row><b>${s.hp} <span style="color:#888">/ ${s.maxHp}</span></b><b>${Math.round(s.hp/s.maxHp*100)}%</b></div>${pbar(s.hp,s.maxHp,"#e84040")}</div>`
   +[["Gold",s.gold.toLocaleString()],["Steps",s.steps],["Awards",nA],["NPC Kills",s.kills],["Boss Kills",s.bk],["Quests Completed",s.qc],["Total EXP",s.tx.toLocaleString()],["Join Date",new Date(s.joined).toLocaleDateString()]].map(([a,v])=>row(a,v)).join("")
   +Object.entries(s.sk).map(([k,[l]])=>row(NODES[k].icon+" "+k,"Level "+l)).join("");
  else if(ptab===2)b=eqHTML();
  else b=`<div class=card2><div class=srow><span>🏅 Awards</span><b>${nA}</b></div></div><div class=card2>`+(AWARDS.filter(a=>s.aw[a[0]]).map(a=>`<div class=srow><span><b>${a[0]}</b><br><small>${a[1]}</small><br><small>${ago(s.aw[a[0]])}</small></span><button class="mini alt" onclick="toast('Highlight!')">Highlight</button></div>`).join("")||"Belum ada award.")+`</div>`;
  h=tabs(["PROFILE","STATS","EQUIPPED","AWARDS"],ptab,"profTab")+b;
 }else if(type==="hub"){
  t.textContent="Battle";
  const a=ARENA[s.au],pg=s.ap[s.au]||0,row=(i,n,v)=>`<div class=srow><span>${i} ${n}</span><b>${v}</b></div>`;
  h=`<div class=card2><button class=fight style="background:#4f46e5" onclick="openPanel('arenaPve')">⚔️ Fight Monster</button><button class="fight alt" style="margin-top:8px" onclick="toast('Fight Players segera hadir')">Fight Players</button></div>`
   +`<div class=gm-sec><span>User</span></div><div class=card2><b>Energy Points</b>${pbar(s.energy,100,"#f5b82e")}<div class=cm-row><span style="color:#f5b82e"><b>${s.energy}</b>/100</span><span>+1 / 10 dtk</span></div><button class="fight alt" style="margin-top:10px" onclick="refillEnergy()">Refill Energy Points (${20*s.level}G)</button></div>`
   +`<div class=gm-sec><span>Progress</span></div><div class=card2>${row("🧟","NPC Kills",s.kills)}${row("☄️","Player Kills",0)}${row("🗡️","World Boss Kills",s.bk)}</div>`
   +`<div class=gm-sec><span>Battle Arena</span></div><div class=card2>${row("⚔️","Current Tier",a[0])}${row("🎁","Progress",pg+" / "+a[2])}${pbar(pg,a[2],"#2ecc71")}<button class="fight alt" style="margin-top:12px" onclick="toast('Chest: gold + 2 item')">View Completion Reward</button><button class="fight alt" style="margin-top:8px" onclick="openPanel('arena')">View Arena Tiers</button></div>`
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
   return `<div class=loot><span><b>${n}</b><br><small>${d}</small></span><button class=mini ${own?"disabled":""} onclick="buy(${i})">${own?"Dimiliki":p+"G"}</button></div>`}).join(""):"<p>Toko ini belum buka.</p>");
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
    +`<div class=bt-arena><div class=bt-sp><i class="fa-solid fa-jedi" style="color:#5ce1e6"></i>${s.party.map(k=>`<i class="fa-solid ${COMP[k][0]} pet"></i>`).join("")}</div><div class=bt-sp>${enemy.ico||"👹"}</div></div><div class=bt-log>${logs[0]||""}</div>`
    +`<div class=bt-panel><div class=bt-en><i class="fa-solid fa-bolt"></i><div class=ebar><i style="width:${s.energy}%"></i></div><b>${s.energy}/100</b></div><button class=fight style="background:#4f46e5" onclick="fight('atk')">Attack</button><button class="fight alt" style="margin-top:8px" onclick="fight('herb')">Use Item (${s.inv.filter(x=>x==="Healing Herb").length})</button><div class=btn-row><button class="fight sp" onclick="fight('sp')">💫 Special (10⚡)</button><button class="fight alt" onclick="fight('run')">🏃 Kabur</button></div></div></div>`;
  }
 }else if(type==="town"){
  t.textContent="Town";
  const L=LOCS[s.loc],sec=(n,r)=>`<div class=tsec>${n}</div><div class=tlist>`+r.map(([a,i,f])=>`<button onclick="${f||"toast('Segera hadir')"}"><span>${i}</span>${a}</button>`).join("")+`</div>`;
  h=`<div class=banner><h1>${L[0]}</h1><p>Kamu berkeliling di kota ${L[0]} dan mendengar obrolan penduduk bergema di telingamu.</p><div class=chips2><button class=mini2 style="background:#4f46e5" onclick="openPanel('loc')">Change Location</button><button class=mini2 onclick="toast('Segera hadir')">View Bulletin Board</button></div></div>`
   +sec("Market",[["Player Market","🤝"],["Item Shop","🛒","openPanel('shops')"],["Diamond Market","💎"],["Bank","💰"]])+sec("East Side",[["Mahols Hut","⛺"],["Folen the Healer","🧙","healer()"],["Item Dumping Grounds","🦴"]])
   +sec("Underground",[["Bounties","🎯"],["Vault","📦"]])+sec("Town Centre",[["Temple","⛪"],["Orphanage","🧸"],["Town Hall","📜"],["Library","📚"]]);
 }else if(type==="quests"){
  t.textContent="Quests";
  const F=["All","In Progress","Completed","Not Completed"];
  h=`<div class=gm-sec><span>User</span></div><div class=card2><b>Quest Points</b>${pbar(s.qe,50,"#5b9cff")}<div class=cm-row><span><b style="color:#5b9cff">${s.qe}</b>/50</span><span style="color:#aaa">+1 / 10 dtk</span></div></div>`
   +`<div class=gm-sec><span>Bonuses</span></div><div class=elist><div class=er><div>✨ Experience</div><b>+${(s.qc*.5).toFixed(1)}%</b></div><div class=er><div>🪙 Gold</div><b>+${(s.qc*.5).toFixed(1)}%</b></div></div>`
   +`<div class=qf>${F.map((x,i)=>`<button class="${i===qf?"sel":""}" onclick="qf=${i};openPanel('quests')">${x}</button>`).join("")}</div>`
   +QUESTS.map((q,i)=>[q,i]).reverse().map(([q,i])=>{const d=s.qd[i]||0,done=d>=q[3],lock=q[0]>s.level;
    if(qf===1&&(done||!d)||qf===2&&!done||qf===3&&done)return "";
    return `<button class="qc ${done?"done":""} ${lock?"lock":""}" onclick="${lock?`toast('Butuh Level ${q[0]}')`:`openQuest(${i})`}"><span class=qi>${lock?"🔒":QICO[i]}</span><span class=qb><b>${q[2]}</b><span class=qlv>Level ${q[0]}</span></span><span class=ql>${done?"✔ Done":(q[3]-d)+" Left"}</span></button>`}).join("");
 }else if(type==="arena"){
  t.textContent="Battle Arena (PvE)";
  h=`<p style="font-size:12px;color:var(--text-muted);margin-bottom:6px">Lawan NPC lokasi ${LOCS[s.loc][0]}. Biaya: Gold + 1⚡ per NPC (kamu ${s.energy}⚡)</p>`
   +ARENA.map((a,i)=>{const ok=i<=s.au;return `<div class=loot style="${ok?"":"opacity:.45"}"><span><b>${a[0]}</b><br><small>${ok?`${Math.min(s.ap[i]||0,a[2])}/${a[2]} NPC — 🪙${arenaCost(i)} — ~${Math.round(a[1]*nextXP()*.06)} XP`:"🔒 Selesaikan tier sebelumnya"}</small></span><button class=mini ${ok?"":"disabled"} onclick="arenaFight(${i})">Lawan</button></div>`}).join("");
 }else if(type==="loc"){
  t.textContent="Horse and Carriage";
  h=LOCS.map((l,i)=>l[1]>s.level+20?"":`<button class="locc ${i===s.loc?"cur":""} ${l[1]>s.level?"lock":""}" style="background:${LBG[i]}" onclick="goLoc(${i})"><b>${l[0]}</b><span class=lchips><span>Level ${l[1]}</span><span>${(LPOP[i]).toLocaleString()} <i class="fa-solid fa-users"></i></span></span></button>`).join("")+`<p class=hint>You can unlock more locations by levelling up</p>`;
 }else if(type==="settings"){
  t.textContent="Settings";
  const sec=(n,r)=>`<div class=tsec>${n}</div><div class=tlist>`+r.map(([a,i,f])=>`<button onclick="${f||"toast('Segera hadir')"}"><span>${i}</span>${a}</button>`).join("")+`</div>`;
  h=sec("Character",[["Change username","🪶","renameChar()"],["Change username colour","🧪"],["Change profile number","📜"],["Safe Mode","🛡️"]])+sec("Account",[["Change Password","🔒"],["Change Email Address","💾"]])
   +sec("More",[["Push Notifications","❗"],["Membership Settings","🌐"],["Notifications Filter","❕"],["Dark Mode","🌌","toast('Dark mode sudah aktif')"],["Blocked Players","🙁"],["Customisation","⚙️"]])
   +sec("Deletion",[["Delete Account","❌","if(confirm('Hapus save karakter ini?')){localStorage.removeItem(SK);location.reload()}"]]);
 }else if(type==="party"){
  t.textContent="Travel Party";
  const n=s.party.length+1;
  h=`<div class=tsec>Options</div><div class=tlist><button onclick="openPanel('myparty')"><span><i class="fa-solid fa-circle-plus" style="margin:0;color:#ddd"></i></span>${s.party.length?"My Party ("+n+"/4)":"Create Party"}</button></div>`
   +`<div class=tsec>Invites</div><p class=hint>There are no pending Invites</p><div class=tsec>Friends Parties</div><p class=hint>There are no friend parties.</p>`
   +`<div class=tsec>Public Parties</div><div class=tlist>`+PUB.map(([nm,ic,ow,c,f])=>`<button onclick="${f?"toast('Party penuh')":"openPanel('myparty')"}"><span>${ic}</span><span class=pp><b>${nm}</b><small style="color:${c}">${ow}</small></span><em class="${f?"full":"free"}">${f?"Full":f===0&&false?"":(4-(nm.length%3+1))+" spaces free"}</em></button>`).join("")+`</div>`;
 }else if(type==="myparty"){
  t.textContent=`My Party (${s.party.length+1}/4)`;
  h=`<div class=loot><span>👑 <b>${s.name}</b><br><small>Owner</small></span></div>`+Object.entries(COMP).map(([k,c])=>{const on=s.party.includes(k);return `<div class=loot><span><i class="fa-solid ${c[0]}"></i> <b>${c[1]}</b></span><button class="mini ${on?"alt":""}" onclick="${on?"kick":"recruit"}('${k}')">${on?"Keluarkan":"Undang"}</button></div>`}).join("")
   +`<p class=hint>Tiap teman punya peluang memberi EXP & Gold kecil saat kamu melangkah.</p>`+(s.party.length?`<button class="fight alt" onclick="disband()">Bubarkan Party</button>`:"");
 }else if(type==="leader"){
  t.textContent="Leaderboards";
  h=`<div class=tlist>`+LB.map(([n,i,f])=>`<button onclick="lbKey='${n}';openPanel('lbview')"><span>${i}</span>${n}</button>`).join("")+`</div>`;
 }else if(type==="lbview"){
  const e=LB.find(x=>x[0]===lbKey),me=e[2](s);t.textContent=lbKey;
  const rows=BOTS.map((b,i)=>[b,Math.round(Math.max(me,10)*(3.2-i*.45))]).concat([[s.name+" (You)",me]]).sort((a,b)=>b[1]-a[1]);
  h=`<div class=tlist>`+rows.map(([n,v],i)=>`<button class="${n.endsWith("(You)")?"me":""}"><span>${["🥇","🥈","🥉"][i]||"#"+(i+1)}</span>${n}<em>${v.toLocaleString()}</em></button>`).join("")+`</div>`;
 }else if(type==="boards"){
  t.textContent="Discussion Boards";
  const sec=(n,r)=>`<div class=tsec>${n}</div><div class=tlist>`+r.map(([a,i,c])=>`<button onclick="toast('Board ${a} segera hadir')"><span>${i}</span>${a}<em>${c.toLocaleString()}</em></button>`).join("")+`</div>`;
  h=sec("Main",[["General","💬",6117],["Suggestions","❤️",25616],["Trade","🔁",8203],["Help","❓",3706],["Games and Competitions","🎲",1609],["Bugs","🐞",2990],["Guilds","🛡️",619]])+sec("Other",[["Introductions","👋",435],["Video Games","🎮",272],["Television","📺",92],["Music","🎵",200]]);
 }else if(type==="social"){
  t.textContent="Social Media";
  h=`<div class=tlist><button onclick="toast('Discord segera hadir')"><span>👾</span>Discord<i class="fa-solid fa-caret-right"></i></button><button onclick="toast('Instagram segera hadir')"><span>📸</span>Instagram<i class="fa-solid fa-caret-right"></i></button></div><div class=tlist><button onclick="toast('Road map segera hadir')"><span>🗺️</span>StepQuest Road Map<i class="fa-solid fa-caret-right"></i></button></div>`;
 }else if(type==="guilds"){
  t.textContent="Guilds";
  h=`<div class=card2 style="padding:0;background:#1c1c1f"><div style="padding:16px"><b>${s.guild?s.guild:"No Guild"}</b><br><span style="color:#aaa">${s.guild?"Kamu anggota guild ini":"You are not in a guild"}</span></div><div class=gbtns><button class=mini2 onclick="openPanel('allguilds')">Find a Guild</button><button class=mini2 onclick="toast('Tidak ada undangan')">Invites</button><button class=mini2 onclick="createGuild()">Create a Guild</button></div></div>`
   +`<div class=tsec>More</div><div class=tlist><button onclick="openPanel('allguilds')"><span>🏰</span>All Guilds</button><button onclick="toast('Guild Wars segera hadir')"><span>🗡️</span>Guild Wars</button></div>`
   +`<div class=tsec>Leaderboards</div><div class=tlist><button onclick="openPanel('allguilds')"><span>🏆</span>Seasons</button><button onclick="openPanel('allguilds')"><span>🏆</span>Legacy</button></div>`;
 }else if(type==="allguilds"){
  t.textContent="All Guilds";
  h=`<div class=tlist>`+GUILDS.map(([n,tag,m],i)=>`<button onclick="joinGuild(${i})"><span>${["🥇","🥈","🥉"][i]||"🛡️"}</span><span class=pp><b>${n}</b><small style="color:#aaa">[${tag}] · ${m} members</small></span><em class=free>${s.guild===n?"Joined":"Join"}</em></button>`).join("")+`</div>`;
 }else if(type==="tasks"){
  t.textContent="Tasks";
  const P=["daily","weekly","monthly"][ttab],T=taskState(P),done=T.list.filter(x=>x.cur>=x.n).length,pct=Math.round(done/5*100),R=TREW[P];
  h=tabs(["DAILY","WEEKLY","MONTHLY"],ttab,"taskTab")+`<div class=tsec>Completion Chest</div><div class="card2 trow"><span class=ti>🧰</span><div style="flex:1"><div class=cm-row style="margin:0"><span><b>${done}</b> / 5 tasks completed</span><span>${pct}%</span></div>${pbar(done,5,"#0f9d6e")}<small>${T.chest?"Chest sudah diambil":`Redeem this chest to get 💎 ${R[2]} diamonds`}</small>${done>=5&&!T.chest?`<br><button class=mini2 style="margin-top:8px" onclick="claimChest('${P}')">Redeem</button>`:""}</div></div>`
   +`<div class=tsec>Tasks</div><div class=elist>`+T.list.map((x,i)=>`<div class="trow tk"><span class=ti>${x.ico}</span><div style="flex:1"><div>${x.txt}</div>${pbar(Math.min(x.cur,x.n),x.n,"#0f9d6e")}<div class=tmeta><b>${Math.min(x.cur,x.n).toLocaleString()}</b> / ${x.n.toLocaleString()} ✨ ${R[0].toLocaleString()} EXP 🗝️ 2x ${R[1]} Keys</div>${x.got?`<button class=mini2 disabled>Claimed ✔</button>`:x.cur>=x.n?`<button class=mini2 style="background:#0f4a36" onclick="claimTask('${P}',${i})">Claim</button>`:`<button class=mini2 onclick="${x.go}">Proceed ›</button>`}</div></div>`).join("")+`</div>`
   +`<p class=hint>New tasks in ${untilTxt(T.end)}</p>`;
 }else if(type==="craft"){
  t.textContent="Crafting";
  const have=commonMats(),need=15*cq,ok=have>=need&&s.energy>=cq;
  h=`<div class=tsec>What type of items do you want to craft?</div><div class=cbox>Common Item</div>`
   +`<div class=tsec>How many items do you want to craft?</div><div class=sp-in><input type=number min=1 value=${cq} onchange="cq=Math.max(1,+this.value||1);openPanel('craft')"><button onclick="cq=Math.max(1,cq-1);openPanel('craft')">−</button><button onclick="cq++;openPanel('craft')">+</button></div>`
   +`<div class=tsec>Requirements</div><div class=crow><span>🎒</span>Common Materials<em style="color:${have>=need?"#4cd964":"#ff6b6b"}">${have>=need?"✔":"✖"} ${have}/${need}</em></div>`
   +`<div class=tsec>Cost</div><div class=crow><span>⚡</span>Energy cost<em>${cq}</em></div>`
   +`<div class=tsec>Outcome</div><div class=crow><span>🔨</span>Crafting EXP<em>${15*cq}</em></div><div class=crow><span>✨</span>Character EXP<em>${cq*s.level*5}</em></div><div class=crow><span>🕒</span>Crafting Level<em>${s.craft[0]}</em></div>`
   +`<button class=fight style="background:${ok?"#4f46e5":"#2a2a6a"};margin-top:16px" ${ok?"":"disabled"} onclick="doCraft()">Craft ${cq}x</button><p class=hint>Material Common (Slime Core, Iron Ore, Oak Log, dll) didapat dari jalan & gathering.</p>`;
 }else if(type==="collect"){
  t.textContent="Collections";
  const u=[...new Set(s.inv.concat(Object.values(s.eq).filter(Boolean)))],c=[["Avatars","🧙",1],["Collectables","🔮",u.filter(n=>ITEMS[n]&&ITEMS[n][1]==="mat").length],["Items","🛡️",u.filter(n=>ITEMS[n]&&!["mat","potion"].includes(ITEMS[n][1])).length],["Sprites","🐾",s.party.length],["Backgrounds","🌄",Object.keys(s.vis||{0:1}).length],["Cards","🃏",0],["Events","🎁",0],["NPCs","👹",Object.keys(s.npc||{}).length]];
  h=`<div class=tsec>Your Collection</div><div class=tlist>`+c.map(([n,i,v])=>`<button onclick="toast('${n}: ${v} dikoleksi')"><span>${i}</span>${n}<em>${v}</em></button>`).join("")+`</div>`;
 }else if(type==="events"){
  t.textContent="Events";
  h=`<div class="banner ev"><h1>Events</h1><p>StepQuest mengadakan banyak event yang bisa kamu ikuti. Cek daftar event mendatang di bawah!</p></div><div class=tlist><button onclick="toast('Belum dimulai')"><span>🎃</span>Halloween 2026<em>Mon Oct 19 2026</em></button><button onclick="toast('Belum dimulai')"><span>🎄</span>Winter Holidays 2026<em>Mon Dec 14 2026</em></button></div>`;
 }
 b.innerHTML=h;m.classList.remove("hidden");
}
const LBG=["linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),radial-gradient(ellipse at 80% 110%,#3f8a34 0 30%,transparent 31%),linear-gradient(#5a8a7a,#2f6b4a)","linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)),linear-gradient(170deg,#6a8ab0 0 40%,#3a7a3a 41%,#a8904a 70%,#2f6b2a)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#3a1a14,#6a2a1e 60%,#2a120c)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#1f6a6a 0 15%,#4a2a3a 16%,#8a3a2a 70%,#3a1a1a)","linear-gradient(rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(#a8c8e8,#e8f0f8 60%,#8aa8c8)"];
const LPOP=[90686,15996,18179,13384,8021];
const PUB=[["calm steps","🧘","[Φ] calmly","#a855f7",1],["5mk Glory","🤸","[TSL] Mickey","#e74c3c",0],["Steeeping","🧙‍♀️","[BRG] Mima Mima","#4cd964",0],["5MK","👹","[TSL] Minnie","#e74c3c",0],["Endlessly stepping 5 min","🌳","[Φ] Farmer","#a855f7",1],["steppy","🐷","[RF] Ameliaaahh","#ff6b6b",0]];
const BOTS=["Cihhhh","Forlorn","Mima Mima","Ameliaaahh","calmly","Mickey"];
const LB=[["Steps","🥾",s=>s.steps],["Gold","🪙",s=>s.gold],["Level","✨",s=>s.level],["NPC Kills","💥",s=>s.kills],["Player Kills","⚔️",s=>0],["Strength","🏆",s=>atk()],["Dexterity","🏅",s=>s.dex],["Defence","🛡️",s=>dfn()],["Successful Quests","💎",s=>s.qc],["World Boss Kills","🐉",s=>s.bk],["Woodcutting","🪓",s=>s.sk.Woodcutting[0]],["Mining","⛏️",s=>s.sk.Mining[0]],["Fishing","🎣",s=>s.sk.Fishing[0]],["Treasure Hunting","🗝️",s=>s.sk.Treasure[0]]];
let lbKey="Steps";
function potLeft(k){const l=(s.pa[k]||0)-Date.now();return l>0?`${Math.floor(l/60000)}:${String(Math.floor(l/1000)%60).padStart(2,"0")} left`:""}
function usePot(k){if(s.pots[k]<1)return toast("Potion habis");s.pots[k]--;s.pa[k]=Math.max(Date.now(),s.pa[k]||0)+(k==="exp"?5:15)*60000;save();toast(k==="exp"?"+5% Experience aktif":"+5% Rarity Rate aktif");openPanel("potions")}
function renameChar(){const n=prompt("Username baru:",s.name);if(n&&n.trim()){s.name=n.trim();save();toast("Nama diganti")}}
const GUILDS=[["Simple Knights","SK",48],["The Step Lords","TSL",50],["Rainbow Guild","BRG",37],["Phi Order","Φ",42],["Night Foxes","RF",29]];
function createGuild(){if(s.gold<5000)return toast("Butuh 5,000 gold");const n=prompt("Nama guild:");if(!n)return;s.gold-=5000;s.guild=n.trim();save();openPanel("guilds")}
function joinGuild(i){s.guild=GUILDS[i][0];save();toast("Bergabung dengan "+s.guild);openPanel("guilds")}
let ttab=0,cq=1;
const TREW={daily:[600,"Bronze",5],weekly:[1800,"Silver",15],monthly:[2520,"Gold",35]};
const TDEF={daily:[["🥾","Take 150 steps when travelling.","steps",150,"closePanel()"],["⚔️","Kill 15 NPCS while travelling.","kills",15,"closePanel()"],["⭐","Successfully perform 5 quests.","quests",5,"openPanel('quests')"],["⛏️","Gather 10 materials while travelling.","gathers",10,"closePanel()"],["🔨","Craft 2 items.","crafts",2,"openPanel('craft')"]],
 weekly:[["🔨","Craft 12 items.","crafts",12,"openPanel('craft')"],["📜","Complete 3 daily tasks.","dtasks",3,"taskTab(0)"],["🗡️","Kill 175 NPCS in the Battle Arena or while travelling.","kills",175,"openPanel('hub')"],["🐈",'Successfully perform the quest "Selamatkan kucing" 50 times.',"cat",50,"openQuest(0)"],["🥾","Take 1,785 steps when travelling.","steps",1785,"closePanel()"]],
 monthly:[["🎣","Gather 625 materials while travelling (Fishing, Woodcutting, Treasure, Mining).","gathers",625,"closePanel()"],["🔨","Craft 105 items.","crafts",105,"openPanel('craft')"],["🥾","Take 6,595 steps when travelling.","steps",6595,"closePanel()"],["🛒","Purchase 390 items from the market.","buys",390,"openPanel('shops')"],["🗡️","Kill 650 NPCS in the Battle Arena or while travelling.","kills",650,"openPanel('hub')"]]};
function ctr(){return {steps:s.steps,kills:s.kills,gathers:s.q.gathers,crafts:s.cr||0,buys:s.buys||0,quests:Object.values(s.qd).reduce((a,b)=>a+b,0),cat:s.qd[0]||0,dtasks:s.dt||0}}
function periodEnd(P){const d=new Date();if(P==="daily")return new Date(d.getFullYear(),d.getMonth(),d.getDate()+1).getTime();if(P==="weekly")return new Date(d.getFullYear(),d.getMonth(),d.getDate()+(7-((d.getDay()+6)%7))).getTime();return new Date(d.getFullYear(),d.getMonth()+1,1).getTime()}
function taskState(P){s.tk=s.tk||{};let T=s.tk[P];if(!T||Date.now()>=T.end){T=s.tk[P]={end:periodEnd(P),base:ctr(),got:[],chest:0};save()}
 const c=ctr();return {...T,list:TDEF[P].map(([ico,txt,k,n,go],i)=>({ico,txt,n,go,cur:c[k]-(T.base[k]||0),got:T.got.includes(i)}))}}
function claimTask(P,i){const T=s.tk[P];if(T.got.includes(i))return;T.got.push(i);addXP(TREW[P][0]);s.keys=s.keys||{};s.keys[TREW[P][1]]=(s.keys[TREW[P][1]]||0)+2;if(P==="daily")s.dt=(s.dt||0)+1;save();toast(`+${TREW[P][0]} EXP & 2x ${TREW[P][1]} Keys`);openPanel("tasks")}
function claimChest(P){s.tk[P].chest=1;s.dia=(s.dia||0)+TREW[P][2];save();toast(`💎 +${TREW[P][2]} diamonds`);openPanel("tasks")}
function taskTab(i){ttab=i;openPanel("tasks")}
function untilTxt(t){let x=Math.max(0,Math.floor((t-Date.now())/1000));const d=Math.floor(x/86400),h=Math.floor(x%86400/3600),m=Math.floor(x%3600/60),sec=x%60;return `${d} days, ${h} hours, ${m} minutes, and ${sec} seconds`}
function commonMats(){return s.inv.filter(n=>ITEMS[n]&&ITEMS[n][1]==="mat"&&ITEMS[n][0]===0).length}
function doCraft(){
 const need=15*cq;if(commonMats()<need)return toast("Material kurang");if(s.energy<cq)return toast("⚡ Energy tidak cukup");
 let r=need;s.inv=s.inv.filter(n=>{if(r>0&&ITEMS[n]&&ITEMS[n][1]==="mat"&&ITEMS[n][0]===0){r--;return false}return true});
 const pool=Object.keys(ITEMS).filter(k=>ITEMS[k][0]===0&&!["mat","potion"].includes(ITEMS[k][1])),got=[];
 for(let i=0;i<cq;i++){const n=pool[rand(0,pool.length-1)];s.inv.push(n);got.push(n)}
 s.energy-=cq;s.cr=(s.cr||0)+cq;s.craft[1]+=15*cq;while(s.craft[1]>=50*s.craft[0]){s.craft[1]-=50*s.craft[0];s.craft[0]++}addXP(cq*s.level*5);
 save();toast("🔨 Crafted: "+got.join(", "));openPanel("craft");
}
function closePanel(){const m=document.getElementById("modal");m.classList.add("hidden");m.classList.remove("full","page")}

// MENU SAMPING (hamburger)
function toggleMenu(){document.getElementById("sideMenu").classList.toggle("open");document.getElementById("sideBackdrop").classList.toggle("open")}
function menuGo(p){toggleMenu();openPanel(p)}

// ===== DATA DARI smmo-wiki.com =====
let sprintUntil=0;
// lokasi: nama, level minimal, musuh
const LOCS=[["Simpletopia",1,["Slime","Goblin","Wolf"]],["Holbeck",5,["Wolf","Dark Knight"]],["Davenport",10,["Dark Knight","Troll"]],["Ironforge",30,["Troll","Frost Giant"]],["Everwinter",50,["Frost Giant","Void Reaper"]]];
// Battle Arena: tier, EXP modifier, syarat selesai (NPC), biaya maks (gold)
const ARENA=[["Copper League",2,100,1000],["Bronze League",2.2,225,2500],["Silver League",2.4,500,6000],["Gold League",2.6,950,9375],["Platinum League",3,1500,11250],["Titanium League",3.5,2500,13750],["7th Circle",4,3000,16250],["Ragnarok",4.5,4000,18750],["Mount Olympus",5,5000,21250],["Rapture",5.5,6000,27000],["Nirvana",6,7500,34500]];
// quest: level min, dex utk 100% sukses, nama, jumlah selesai, gold, exp, teks sukses, teks gagal
const QUESTS=[
 [1,8,"Selamatkan kucing",10,5,10,"Kucing berhasil diselamatkan!","Kamu jatuh dari pohon."],
 [3,9,"Lindungi petani",15,10,15,"Bandit berhasil diusir!","Lututmu terluka, kamu kabur."],
 [5,11,"Lindungi bangsawan dari pembunuh",20,15,35,"Sisa bandit melarikan diri.","Kamu tersandung batu."],
 [7,14,"Lindungi desa dari bandit",25,25,40,"Desa selamat, kamu dibuatkan patung!","Kamu diberi arah yang salah."],
 [9,16,"Temani sarjana ke reruntuhan",30,35,50,"Ekspedisi berjalan lancar.","Sang sarjana terkena jebakan."],
 [11,20,"Ambil batu bersama penyihir",40,50,60,"Batu legendaris didapat!","Ada naga 25 meter menunggumu."],
 [13,21,"Selamatkan gadis dalam bahaya",45,60,80,"Kamu menyelamatkannya.","Kamu malah dirampok."],
 [15,23,"Bantu pria buta cari anjingnya",50,70,90,"Anjingnya ketemu!","Kamu memberinya roti berjamur."],
 [18,29,"Selamatkan anak yang sakit",55,80,100,"Sang anak pulih.","Obatnya dibawa orang lain."],
 [20,37,"Tangkap troll hidup",55,95,105,"Troll tidur dan tertangkap.","Troll bangun, kamu kabur."],
 [25,42,"Mabuk di penginapan",60,105,115,"Kamu bikin kekacauan.","Kamu membakar penginapan."],
 [39,48,"Belanja",65,120,130,"Kamu belanja dan dapat gold.","Tidak ada hadiah."]
];
const COMP={ninja:["fa-user-ninja","Ninja"],cat:["fa-cat","Cat"],wizard:["fa-hat-wizard","Wizard"]};

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
function arenaWin(msg){
 const i=enemy.arena-1,a=ARENA[i],x=Math.round(a[1]*nextXP()*.06),lv=addXP(x);
 s.kills++;s.ap[i]=(s.ap[i]||0)+1;let ex="";
 if(i===s.au&&s.ap[i]>=a[2]&&i<10){s.au++;const g=arenaCost(i)*30;addGold(g);s.inv.push(rollItem(),rollItem());ex=` 🎁 ${ARENA[s.au][0]} terbuka! Chest: +${g}G & 2 item`}
 eventText(`${msg}🏟️ ${enemy.name} kalah di ${a[0]}! +${x} XP${lv?" LEVEL UP!":""}.${ex}`);
 showDrop(`+${x} EXP`,"#00ff88");enemy=null;save();renderAction();closePanel();
}
function doQuest(i){
 const q=QUESTS[i];
 if(s.qe<1)return toast("🔥 Quest Point habis");
 s.qe--;
 if(chance(Math.min(1,s.dex/q[1]))){
  const k=(1+s.level*.25)*(1+.005*s.qc),g=Math.round(q[4]*k),x=Math.round(q[5]*k);
  addGold(g);addXP(x);s.qd[i]=(s.qd[i]||0)+1;
  if(s.qd[i]===q[3]){s.qc++;toast("🏁 Quest selesai! Bonus quest +0,5%")}else toast(`✅ ${q[6]} +${g}G +${x}XP`);
 }else toast("❌ "+q[7]);
 save();openQuest(i);
}
let qf=0;
const QICO=["🐈","🥕","🗡️","🏘️","🏛️","🪨","🕊️","🐕","🧒","🧌","🍺","🛍️"];
function openQuest(i){
 const q=QUESTS[i],d=s.qd[i]||0,k=(1+s.level*.25)*(1+.005*s.qc),p=Math.round(Math.min(1,s.dex/q[1])*100);
 document.getElementById("modalTitle").textContent="";
 document.getElementById("modalBody").innerHTML=`<div class=gm><div class=gm-ico>${QICO[i]}</div><h3 class=qt>${q[2]}</h3><div class=chips><span>Lv. ${q[0]}</span><span class="${p>=100?"ok":p>=50?"mid":"bad"}" title="${q[1]} Dexterity: 100%">${p}% Success</span></div><div class=qr>Rewards</div><div class=chips><span>✨ ${Math.round(q[5]*k)}</span><span>🪙 ${Math.round(q[4]*k)}</span></div></div>`
  +`<div class=cm-row><b>Progress</b><span><b>${Math.min(d,q[3])}</b> / ${q[3]}</span></div>${pbar(d,q[3],"#2ecc71")}<div class=cm-row><b>Quest Points</b><span><b style="color:#5b9cff">${s.qe}</b>/50</span></div>${pbar(s.qe,50,"#5b9cff")}`
  +(p<100?`<div class=warn>⚠️ Naikkan <b>Dexterity</b> ke ${q[1]} untuk 100% sukses.</div>`:"")
  +`<button class=fight style="background:#4f46e5;margin-top:16px" onclick="doQuest(${i})">Perform</button><button class="fight alt" style="margin-top:8px" onclick="openPanel('quests')">Close</button>`;
 const m=document.getElementById("modal");m.classList.remove("full","page");m.classList.remove("hidden");
}
function goLoc(i){if(LOCS[i][1]>s.level)return toast("Level kurang");s.loc=i;s.vis=s.vis||{};s.vis[i]=1;save();toast("Tiba di "+LOCS[i][0]);openPanel("loc")}
function healer(){
 const c=5*s.level;
 if(s.hp>=s.maxHp)return toast("HP penuh");
 if(s.gold<c)return toast("❌ Gold tidak cukup!");
 s.gold-=c;s.hp=s.maxHp;save();toast("🧙 Folen menyembuhkanmu");openPanel("potions");
}

// ===== TRAVEL PARTY (gratis, maks 4): saat kamu melangkah, teman punya peluang kasih EXP & Gold kecil sesuai levelmu =====
function partyStep(){
 let g=0,x=0;const who=[];
 s.party.forEach(k=>{if(chance(.4)){g+=rand(1,s.level*2);x+=rand(1,s.level*2);who.push(COMP[k][1])}});
 if(who.length){addGold(g);addXP(x);eventText(`👥 ${who.join(", ")} ikut melangkah: +${x} EXP +${g} Gold`)}
}
function renderParty(){const e=document.getElementById("bExp");if(e)e.textContent="📍 "+LOCS[s.loc][0]}
function recruit(k){if(s.party.length>=3)return toast("Party penuh");s.party.push(k);save();toast(COMP[k][1]+" bergabung!");openPanel("party")}
function kick(k){s.party=s.party.filter(x=>x!==k);save();openPanel("party")}
function disband(){s.party=[];save();toast("Party dibubarkan. Kamu solo lagi.");openPanel("party")}

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
const SHOPS=[["Ronwarus Fruit and Veg Shop",["Healing Herb"],"🥕"],["Caspers Emporium",["Rusty Dagger","Iron Sword","Leather Vest","Knight Helm","Wooden Shield","Leather Boots","Leather Gloves"],"🧛"],["Mysterious Shop",[],"🧙"],["Mikels Beasts",[],"🐾"],["Toms Tools",["Pickaxe","Axe","Fishing Rod","Shovel"],"🔧"]];
const AWARDS=[["Baby Steps","This player has taken 100 steps.",s=>s.steps>=100],["Butcher","This player has defeated 10 NPCs.",s=>s.kills>=10],["Checkbox","This player has completed their first quest.",s=>s.qc>=1],["Gatherer","This player has gathered 10 resources.",s=>s.q.gathers>=10],["Marathon","This player has taken 1,000 steps.",s=>s.steps>=1000],["Rich","This player has held 10,000 gold.",s=>s.gold>=10000],["Slayer","This player has defeated 100 NPCs.",s=>s.kills>=100],["Dragon Slayer","This player has defeated a world boss.",s=>s.bk>=1]];
let itab=0,ptab=0,isort=0,curShop=0;
function checkAwards(){if(s)AWARDS.forEach(a=>{if(!s.aw[a[0]]&&a[2](s)){s.aw[a[0]]=Date.now();toast("🏅 Award: "+a[0])}})}
function ago(t){const m=Math.floor((Date.now()-t)/60000);return m<1?"just now":m<60?m+" minutes ago":m<1440?Math.floor(m/60)+" hours ago":Math.floor(m/1440)+" days ago"}
function pbar(v,m,c){return `<div class=gbar2><i style="width:${Math.min(100,v/m*100)}%;background:${c}"></i></div>`}
function tabs(l,a,f){return `<div class=tabs>${l.map((x,i)=>`<button class="${i===a?"on":""}" onclick="${f}(${i})">${x}</button>`).join("")}</div>`}
function invTab(i){itab=i;openPanel("inventory")}
function invSort(i){isort=i;openPanel("inventory")}
function profTab(i){ptab=i;openPanel("profile")}
function addStat(k){if(s.pts<=0)return;s.pts--;s[k]++;save();openPanel("char")}
function refillEnergy(){const c=20*s.level;if(s.energy>=100)return toast("Energy penuh");if(s.gold<c)return toast("❌ Gold tidak cukup!");s.gold-=c;s.energy=100;save();openPanel("hub")}
function eqHTML(){
 const row=(n,l)=>n?`<div class=er><div><b class=dot style="color:${RAR[ITEMS[n][0]][1]}">${n}</b><br><small>+${ITEMS[n][2]} ${isOff(ITEMS[n][1])?"str":"def"}</small></div><span>${l}</span></div>`:`<div class="er dim"><div>Empty ${l} Slot</div></div>`;
 const tl=[["Axe","Wood Axe"],["Fishing Rod","Fishing Rod"],["Pickaxe","Pickaxe"],["Shovel","Shovel"]].map(([k,l])=>s.tools[k]?`<div class=er><div><b class=dot style="color:#8fb4ff">${k}</b></div><span>${l}</span></div>`:`<div class="er dim"><div>Empty ${l} Slot</div></div>`);
 return `<div class=elist>`+SLOTS.slice(0,6).map(([k,l])=>row(s.eq[k],l)).join("")+tl.join("")+SLOTS.slice(6).map(([k,l])=>row(s.eq[k],l)).join("")+`</div>`;
}
function itemsHTML(){
 const cnt=n=>s.inv.filter(x=>x===n).length,u=[...new Set(s.inv)].sort([(a,b)=>cnt(b)-cnt(a),(a,b)=>a.localeCompare(b),(a,b)=>ITEMS[b][2]-ITEMS[a][2],(a,b)=>ITEMS[b][3]-ITEMS[a][3],(a,b)=>ITEMS[b][0]-ITEMS[a][0]][isort]);
 return `<div class=card2><small>Inventory</small><div class=cm-row><b>${s.inv.length} <span style="color:#888">/ 20,000</span></b><b>${(s.inv.length/200).toFixed(1)}%</b></div>${pbar(s.inv.length,20000,"#555")}</div>`
  +`<div class=sortbar>${["Qty","Name","Stats","Value","Level"].map((x,i)=>`<button class="${i===isort?"on":""}" onclick="invSort(${i})">${x}</button>`).join("")}</div>`
  +(u.length?u.map(n=>{const [r,ty,v,p]=ITEMS[n],eq=SLOTS.some(x=>x[0]===ty),cur=eq&&s.eq[ty]?ITEMS[s.eq[ty]][2]:0;
   return `<div class=ir><div class=ir-top><div><div>x${cnt(n)} <b class=dot style="color:${RAR[r][1]}">${n}</b> <span class=lv>— Level ${r*8+1}</span></div><div class=ir-sub>🪙 ${p.toLocaleString()}${eq?` · +${v} ${isOff(ty)?"str":"def"} ${v>cur?"<i style=color:#2ecc71>▲</i>":v<cur?"<i style=color:#e74c3c>▼</i>":""}`:ty==="potion"?` · +${v} hp`:""}</div></div><span class=ir-slot>${eq?SLOTS.find(x=>x[0]===ty)[1]:ty==="potion"?"Food":"Material"}</span></div><div class=ir-act>${eq?`<button class=mini onclick="equip('${n}')">Equip</button>`:ty==="potion"?`<button class=mini onclick="heal()">Pakai</button>`:""}<button class="mini alt" onclick="sell('${n}')">Jual</button></div></div>`}).join(""):"<p>Kosong.</p>");
}
