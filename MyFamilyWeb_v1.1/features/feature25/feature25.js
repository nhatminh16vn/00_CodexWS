"use strict";

const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");

let W=innerWidth,H=innerHeight;
canvas.width=W;canvas.height=H;

onresize=()=>{
 W=innerWidth;H=innerHeight;
 canvas.width=W;canvas.height=H;
};

const WORLD_NAMES=[
"🌱 Grassland","🌵 Desert","❄️ Ice","🌋 Volcano","👾 Cyber",
"🌲 Forest","🏜️ Canyon","🌊 Ocean","🌴 Jungle","🏰 Castle",
"🌙 Moon","☁️ Sky","🏔️ Mountain","🏖️ Tropical","🌌 Galaxy",
"🪐 Planet","☄️ Meteor","👻 Haunted","🧪 Laboratory","🏭 Factory",
"⚡ Lightning","🌊 Deep Sea","🧊 Glacier","🏜️ Wasteland","🏯 Ancient",
"🐉 Dragon","🏝️ Lost Island","🔥 Inferno","🌑 Dark World","🤖 Robot",
"🧬 Quantum","🔮 Magic","👽 Alien","🚀 Space Station","🌠 Nebula",
"🕳️ Black Hole","💎 Crystal","🌀 Dimension","👑 Kingdom","⚔️ Battle",
"🔥 Chaos","☠️ Nightmare","💀 Death World","♾️ Infinity","🌟 Ultimate",
"🛸 Future","🧿 Void","🌐 Matrix","👑 God World","♾️ ENDLESS"
];

const UNLOCK=[1,30,10,200,500,750,1000,1500,2000,2500,3000,4000,5000,6000,7500,9000,10000,12500,15000,20000,25000,30000,40000,50000,60000,75000,90000,100000,125000,150000,175000,200000,250000,300000,350000,400000,500000,600000,750000,1000000,1250000,1500000,2000000,2500000,3000000,4000000,5000000,7500000,10000000,25000000];

let level=1,xp=0,coins=0,gems=0,distance=0,score=0;
let rebirth=0,xpMulti=1;

let playing=false,paused=false,mathActive=false;
let camera=0,last100=0,lastMilestone=0;

let leftKey=false,rightKey=false,jumpKey=false;
let immuneUntil=0;

let power="";
let powerUntil=0;

let player={
 x:100,y:300,w:38,h:50,
 vx:0,vy:0,ground:false
};

let platforms=[];
let enemies=[];
let coinList=[];
let lucky=[];
let boss=null;

let correct=0;
let timer=30;
let mathMaxTimer=30;
let timerID=null;

/* =========================
   V8.1 NEW STATE
========================= */

let maxHp=100,hp=100;
let keys=0;

let comboCoin=0,comboWindowUntil=0;
let xpCombo=0,lastXpTime=0;
let critChance=.1;
let gemMulti=1;

let facing=1;
let dashKey=false,sprintKey=false;
let dashUntil=0,dashCooldown=0;
let wallSide=0;
let onIce=false;

let currentElement="🔥 FIRE";
let unlockedElements=["🔥 FIRE"];
let attackCooldown=0;

let projectiles=[];
let enemyProjectiles=[];

let chests=[];
let keyPickups=[];
let doors=[];
let teleporters=[];

let lava=[];
let water=[];
let wind=[];
let meteors=[];

let completedWorlds=[];
let worldTrophy={};
let lastWorldSeen=1;

let currentSlot=1;

let stats={
 totalCoins:0,totalDeaths:0,totalMathCorrect:0,totalMathWrong:0,
 enemiesDefeated:0
};

const SKINS=[
 {name:"🔵 Classic Blue",body:"#2563eb",head:"#fbbf24"},
 {name:"🔴 Crimson",body:"#dc2626",head:"#fde68a"},
 {name:"🟢 Emerald",body:"#16a34a",head:"#fef08a"},
 {name:"🟣 Violet",body:"#7c3aed",head:"#fbcfe8"},
 {name:"⚫ Shadow",body:"#111827",head:"#f87171"},
 {name:"🌈 Rainbow",body:"#f472b6",head:"#facc15"}
];
let selectedSkin=0;
let unlockedSkins=[0];

let musicOn=true;
let sfxOn=true;
let musicTimer=null;
let audioCtx=null;
let currentLang="en";

let dayNightT=0;

let rainbowUntil=0,meteorUntil=0,coinRainUntil=0,swarmUntil=0;
let lastEventCheck=0;

let damageFlashUntil=0;

/* =========================
   LEVEL / XP
========================= */

function needXP(){
 return Math.floor(100*Math.pow(1.5,level-1));
}

function world(){
 let w=1;
 for(let i=0;i<50;i++){
  if(level>=UNLOCK[i])w=i+1;
 }
 return w;
}

function addXP(amount){

 let now=performance.now();

 if(now<rainbowUntil)amount*=2;

 if(now-lastXpTime<1500)xpCombo++;
 else xpCombo=1;
 lastXpTime=now;

 let critical=Math.random()<critChance;
 if(critical)amount*=2;

 amount*=1+Math.min(xpCombo,10)*.05;

 if(critical)showCombo("🎯 "+t("critXp"));
 else if(xpCombo>=5)showCombo("🔥 "+t("xpComboMsg").replace("{n}",xpCombo));

 xp+=amount*xpMulti;

 while(xp>=needXP()){
  xp-=needXP();
  levelSound();

  level++;

  if(level>=500){
   document.getElementById("rebirthBox").style.display="flex";
  }
 }

 save();
 updateHUD();
}

function levelSound(){
 const A=new(window.AudioContext||window.webkitAudioContext)();
 [523,659,784].forEach((f,i)=>{
  let o=A.createOscillator();
  let g=A.createGain();
  o.frequency.value=f;
  g.gain.value=.1;
  o.connect(g);
  g.connect(A.destination);
  o.start(A.currentTime+i*.1);
  o.stop(A.currentTime+i*.1+.12);
 });
}

/* =========================
   SAVE
========================= */

function save(){
 localStorage.setItem("MathPlatformerV8_1_slot"+currentSlot,JSON.stringify({
  level,xp,coins,gems,distance,score,rebirth,xpMulti,
  hp,maxHp,keys,stats,completedWorlds,worldTrophy,
  unlockedSkins,selectedSkin,unlockedElements,
  musicOn,sfxOn,currentLang
 }));
}

function load(){

 let key="MathPlatformerV8_1_slot"+currentSlot;
 let s=localStorage.getItem(key);

 if(!s && currentSlot===1){
  s=localStorage.getItem("MathPlatformerV8"); /* migrate old V8 save */
 }

 if(!s)return;

 try{
  let d=JSON.parse(s);
  level=d.level||1;
  xp=d.xp||0;
  coins=d.coins||0;
  gems=d.gems||0;
  distance=d.distance||0;
  score=d.score||0;
  rebirth=d.rebirth||0;
  xpMulti=d.xpMulti||1;
  hp=d.hp!==undefined?d.hp:maxHp;
  maxHp=d.maxHp||100;
  keys=d.keys||0;
  stats=d.stats||stats;
  completedWorlds=d.completedWorlds||[];
  worldTrophy=d.worldTrophy||{};
  unlockedSkins=d.unlockedSkins||[0];
  selectedSkin=d.selectedSkin||0;
  unlockedElements=d.unlockedElements||["🔥 FIRE"];
  musicOn=d.musicOn!==undefined?d.musicOn:true;
  sfxOn=d.sfxOn!==undefined?d.sfxOn:true;
  currentLang=d.currentLang||"en";
  gemMulti=1+rebirth*.1;
 }catch(e){}
}

/* =========================
   REBIRTH
========================= */

function rebirthNow(){
 level=1;
 xp=0;
 rebirth++;
 xpMulti=1+rebirth*.25;
 gemMulti=1+rebirth*.1;
 hp=maxHp;

 document.getElementById("rebirthBox").style.display="none";

 save();
 updateHUD();
}

/* =========================
   MAP GENERATION
========================= */

function generate(){
 platforms=[];
 enemies=[];
 coinList=[];
 lucky=[];
 chests=[];
 keyPickups=[];
 doors=[];
 teleporters=[];
 lava=[];
 water=[];
 wind=[];
 meteors=[];
 projectiles=[];
 enemyProjectiles=[];
 boss=null;
 lastWorldSeen=world();

 platforms.push({
  x:-1000,
  y:550,
  w:2200,
  h:30,
  type:"normal"
 });

 let teleQueue=null;

 for(let i=0;i<500;i++){

  let x=1000+i*220;
  let y=330+Math.random()*200;

  /* PLATFORM TYPE */

  let type="normal";
  let tr=Math.random();
  if(tr<.08)type="ice";
  else if(tr<.16)type="moving";
  else if(tr<.22)type="falling";
  else if(tr<.27)type="elevator";

  platforms.push({
   x:x,y:y,w:150+Math.random()*150,h:30,
   type:type,baseX:x,baseY:y,
   range:80+Math.random()*60,
   dir:Math.random()<.5?-1:1,
   phase:Math.random()*6.28,
   fallTimer:0,falling:false
  });

  if(Math.random()<.8){
   coinList.push({
    x:x+60+Math.random()*80,
    y:y-35,
    taken:false,
    falling:false
   });
  }

  /* ENEMY VARIANTS */

  if(Math.random()<.4){

   let etype="fly";
   let er=Math.random();
   if(er<.5)etype="fly";
   else if(er<.7)etype="bat";
   else if(er<.85)etype="bee";
   else if(er<.95)etype="robot";
   else etype="elite";

   enemies.push({
    x:x+Math.random()*150,
    y:80+Math.random()*380,
    w:etype==="elite"?54:42,
    h:etype==="elite"?54:42,
    vx:(Math.random()<.5?-1:1)*
       (1.5+world()*.04)*(etype==="bat"?1.6:1),
    phase:Math.random()*6.28,
    type:etype,
    hp:etype==="elite"?3:1,
    slowUntil:0,
    shootTimer:Math.random()*120
   });
  }

  /* MINI BOSS */

  if(i>0 && i%15===0){
   enemies.push({
    x:x+100,y:250,w:70,h:70,
    vx:(Math.random()<.5?-1:1)*1.2,
    phase:0,type:"miniboss",hp:8,
    slowUntil:0,shootTimer:60
   });
  }

  /* LUCKY BLOCK */

  if(Math.random()<.15){

   lucky.push({
    x:x+30,
    y:y-80,
    opened:false
   });
  }

  /* CHEST (requires key) */

  if(i>0 && i%18===0){
   chests.push({x:x+40,y:y-45,w:34,h:34,opened:false});
  }

  /* KEY PICKUP */

  if(i>0 && i%9===0){
   keyPickups.push({x:x+90,y:y-40,taken:false});
  }

  /* LOCKED DOOR */

  if(i>0 && i%25===0){
   doors.push({x:x+170,y:y-140,w:26,h:140,open:false});
  }

  /* TELEPORTER PAIR */

  if(i>0 && i%40===0){
   if(!teleQueue){
    teleQueue={x:x+20,y:y-40};
   }else{
    teleporters.push({
     ax:teleQueue.x,ay:teleQueue.y,
     bx:x+20,by:y-40,cool:0
    });
    teleQueue=null;
   }
  }

  /* HAZARDS */

  if(i>0 && i%30===0){
   lava.push({x:x-20,y:585,w:160,h:40});
  }

  if(i>0 && i%45===0){
   water.push({x:x-40,y:500,w:220,h:120});
  }

  if(i>0 && i%55===0){
   wind.push({x:x-30,y:100,w:120,h:450,dir:Math.random()<.5?-1:1});
  }
 }
}

/* =========================
   START
========================= */

function start(){
 playing=true;
 paused=false;
 document.getElementById("menu").style.display="none";
 generate();
 player.x=100;
 player.y=300;
}

function menu(){
 if(mathActive)return;
 playing=false;
 paused=false;
 document.getElementById("menu").style.display="flex";
}

function pauseGame(){
 if(!playing||mathActive)return;
 paused=!paused;
 document.getElementById("pause").style.display=
  paused?"flex":"none";
}

/* =========================
   UPDATE
========================= */

function update(){

 if(!playing||paused||mathActive)return;

 let now=performance.now();

 checkElementUnlocks();

 /* facing */

 if(leftKey)facing=-1;
 if(rightKey)facing=1;

 /* dash trigger (edge) */

 if(dashKey && now>dashCooldown){
  dashUntil=now+160;
  dashCooldown=now+1500;
  immuneUntil=Math.max(immuneUntil,now+160);
 }
 dashKey=false;

 let baseSpeed=speed();
 if(sprintKey&&player.ground)baseSpeed*=1.5;

 /* movement */

 if(now<dashUntil){
  player.vx=facing*22;
 }
 else if(leftKey)player.vx=-baseSpeed;
 else if(rightKey)player.vx=baseSpeed;
 else player.vx*=(onIce?.97:.82);

 /* jump / wall jump */

 if(jumpKey&&player.ground){
  player.vy=jumpPower();
  player.ground=false;
 }
 else if(jumpKey&&!player.ground&&wallSide!==0){
  player.vy=jumpPower()*.9;
  player.vx=-wallSide*8;
  wallSide=0;
 }

 player.vy+=.6;

 player.x+=player.vx;
 player.y+=player.vy;

 player.ground=false;
 wallSide=0;
 onIce=false;

 for(let p of platforms){

  if(p.type==="moving"){
   p.phase+=.015;
   p.x=p.baseX+Math.sin(p.phase)*p.range;
  }
  if(p.type==="elevator"){
   p.phase+=.02;
   p.y=p.baseY+Math.sin(p.phase)*p.range;
  }
  if(p.type==="falling"&&p.falling){
   p.fallTimer++;
   if(p.fallTimer>30)p.y+=6;
   if(p.fallTimer>90)continue;
  }

  if(
   player.x+player.w>p.x &&
   player.x<p.x+p.w &&
   player.y+player.h>=p.y &&
   player.y+player.h<=p.y+35 &&
   player.vy>=0
  ){
   player.y=p.y-player.h;
   player.vy=0;
   player.ground=true;

   if(p.type==="ice")onIce=true;

   if(p.type==="falling"&&!p.falling){
    p.falling=true;
    p.fallTimer=0;
   }
  }

  /* wall touch (airborne side collision) */

  if(!player.ground &&
     player.y+player.h>p.y+10 &&
     player.y<p.y+p.h-10){

   if(player.x+player.w>=p.x&&player.x+player.w<=p.x+14&&player.vx>=0){
    wallSide=1;
   }
   if(player.x<=p.x+p.w&&player.x>=p.x+p.w-14&&player.vx<=0){
    wallSide=-1;
   }
  }
 }

 camera=Math.max(
  0,
  player.x-W*.35
 );

 distance=Math.max(
  distance,
  Math.floor(player.x/10)
 );

 score=Math.max(
  score,
  Math.floor(player.x/5)
 );

 /* 100m XP */

 let m=Math.floor(distance/100);

 if(m>last100){
  last100=m;
  addXP(20);
 }

 /* MILESTONE */

 if(distance>=1000 &&
    Math.floor(distance/1000)>lastMilestone){

  lastMilestone=Math.floor(distance/1000);
  addXP(100);
 }

 /* COINS */

 for(let c of coinList){

  if(c.taken)continue;

  if(c.falling)c.y+=4;

  let dx=player.x-c.x;
  let dy=player.y-c.y;

  if(Math.hypot(dx,dy)<50){
   collectCoin(c);
  }
  else if(power==="🧲 MAGNET" &&
     Math.hypot(dx,dy)<220){
   collectCoin(c);
  }
 }

 /* WORLD BOSS TRIGGER */

 let curWorld=world();
 if(curWorld>lastWorldSeen){
  lastWorldSeen=curWorld;
  spawnBoss(curWorld);
 }

 /* RANDOM EVENTS */

 checkEvents();

 /* ENEMIES */

 for(let e of enemies){

  let slowed=e.slowUntil>now;
  let speedMul=slowed?.3:1;

  if(e.type==="bee"){
   e.vx=(player.x>e.x?1:-1)*Math.abs(e.vx||2);
   e.x+=e.vx*speedMul*1.3;
   e.y+=Math.sin(e.phase)*1.2;
   e.phase+=.05;
  }
  else if(e.type==="robot"){
   e.shootTimer--;
   if(e.shootTimer<=0){
    e.shootTimer=140;
    enemyProjectiles.push({
     x:e.x,y:e.y+e.h/2,w:10,h:10,
     vx:(player.x>e.x?4:-4)
    });
   }
  }
  else{
   e.phase+=.04;
   e.x+=e.vx*speedMul;
   e.y+=Math.sin(e.phase)*1.8;
  }

  if(e.x<player.x-500||e.x>player.x+1000)e.vx*=-1;

  if(overlap(player,e)){

   if(power==="🛡️ SHIELD")continue;
   if(now<immuneUntil)continue;

   let dmg=e.type==="elite"?30:e.type==="miniboss"?35:e.type==="robot"?18:15;
   takeDamage(dmg);
  }
 }

 /* PLAYER PROJECTILES vs ENEMIES */

 for(let i=projectiles.length-1;i>=0;i--){

  let pr=projectiles[i];
  pr.x+=pr.vx;

  let hitSomething=false;

  for(let j=enemies.length-1;j>=0;j--){

   let e=enemies[j];
   if(!overlap(pr,e))continue;

   let dmg=1;
   if(pr.element==="⚡ LIGHTNING")dmg=2;
   if(pr.element==="❄️ ICE")e.slowUntil=now+2500;

   e.hp-=dmg;
   hitSomething = pr.element!=="⚡ LIGHTNING";

   if(e.hp<=0){
    let reward=e.type==="miniboss"?15:e.type==="elite"?8:3;
    coins+=reward;
    stats.enemiesDefeated++;
    addXP(e.type==="miniboss"?60:e.type==="elite"?25:12);
    enemies.splice(j,1);
   }
  }

  if(boss&&overlap(pr,boss)){
   boss.hp--;
   hitSomething=true;

   if(boss.hp<=0){
    let bw=boss.world;
    if(!completedWorlds.includes(bw)){
     completedWorlds.push(bw);
     worldTrophy[bw]=true;
    }
    gems+=Math.ceil(20*gemMulti);
    coins+=100;
    addXP(300);
    showCombo("👑 "+t("bossDefeated").replace("{w}",bw));
    boss=null;
   }
  }

  if(hitSomething||Math.abs(pr.x-player.x)>700){
   projectiles.splice(i,1);
  }
 }

 /* ENEMY PROJECTILES vs PLAYER */

 for(let i=enemyProjectiles.length-1;i>=0;i--){

  let pr=enemyProjectiles[i];
  pr.x+=pr.vx;

  if(overlap(player,pr)){
   takeDamage(12);
   enemyProjectiles.splice(i,1);
   continue;
  }

  if(Math.abs(pr.x-player.x)>900){
   enemyProjectiles.splice(i,1);
  }
 }

 /* METEORS */

 if(now<meteorUntil && Math.random()<.05){
  meteors.push({x:player.x+W*.6+Math.random()*300,y:-30,vy:6});
 }

 for(let i=meteors.length-1;i>=0;i--){
  let mt=meteors[i];
  mt.y+=mt.vy;

  if(overlap(player,{x:mt.x,y:mt.y,w:26,h:26})){
   takeDamage(20);
   meteors.splice(i,1);
   continue;
  }

  if(mt.y>H+50)meteors.splice(i,1);
 }

 /* COIN RAIN */

 if(now<coinRainUntil && Math.random()<.1){
  coinList.push({
   x:player.x+W*.6+Math.random()*400,
   y:-20,taken:false,falling:true
  });
 }

 /* LUCKY BLOCK */

 for(let b of lucky){

  if(b.opened)continue;

  if(
   player.x+player.w>b.x &&
   player.x<b.x+35 &&
   player.y+player.h>b.y &&
   player.y<b.y+35
  ){

   b.opened=true;
   randomPower();
  }
 }

 /* CHESTS */

 for(let c of chests){

  if(c.opened)continue;

  if(overlap(player,c) && keys>0){
   c.opened=true;
   keys--;
   gems+=Math.ceil(3*gemMulti);
   coins+=20;
   addXP(50);
   showCombo("🎁 "+t("chestOpened"));
  }
 }

 /* KEY PICKUPS */

 for(let k of keyPickups){

  if(k.taken)continue;

  if(dist(player,k)<45){
   k.taken=true;
   keys++;
  }
 }

 /* LOCKED DOORS */

 for(let d of doors){

  if(d.open)continue;

  if(overlap(player,d)){
   if(keys>0){
    keys--;
    d.open=true;
   }else{
    if(player.x<d.x)player.x=d.x-player.w;
    else player.x=d.x+d.w;
    player.vx=0;
   }
  }
 }

 /* TELEPORTERS */

 for(let tp of teleporters){

  if(now<tp.cool)continue;

  if(dist(player,{x:tp.ax,y:tp.ay})<40){
   player.x=tp.bx;player.y=tp.by-10;
   tp.cool=now+1000;
   showCombo("🌀 "+t("teleported"));
  }
  else if(dist(player,{x:tp.bx,y:tp.by})<40){
   player.x=tp.ax;player.y=tp.ay-10;
   tp.cool=now+1000;
   showCombo("🌀 "+t("teleported"));
  }
 }

 /* HAZARDS */

 for(let l of lava){
  if(overlapRect(player,l)){
   takeDamage(25);
   player.vy=-10;
  }
 }

 for(let wt of water){
  if(overlapRect(player,wt)){
   player.vy*=.5;
  }
 }

 for(let wd of wind){
  if(overlapRect(player,wd)){
   player.x+=wd.dir*3;
  }
 }

 /* FALL */

 if(player.y>H+250){
  takeDamage(9999,true);
 }

 /* power timer */

 if(power && now>powerUntil){
  power="";
 }

 /* BOSS movement/attack */

 if(boss){
  boss.x-=.5;
  boss.shootTimer--;

  if(boss.shootTimer<=0){
   boss.shootTimer=90;
   enemyProjectiles.push({
    x:boss.x,y:boss.y+boss.h/2,w:14,h:14,vx:-5
   });
  }

  if(overlap(player,boss)){
   if(power!=="🛡️ SHIELD" && now>immuneUntil){
    takeDamage(30);
   }
  }
 }

 /* day/night + weather timer */

 dayNightT+=.0008;
}

/* =========================
   COMBAT / HELPERS
========================= */

function overlap(a,b){
 return a.x+a.w>b.x&&a.x<b.x+b.w&&a.y+a.h>b.y&&a.y<b.y+b.h;
}

function overlapRect(p,r){
 return p.x+p.w>r.x&&p.x<r.x+r.w&&p.y+p.h>r.y&&p.y<r.y+r.h;
}

function dist(a,b){
 return Math.hypot(a.x-b.x,a.y-b.y);
}

function shade(hex,percent){
 let num=parseInt(hex.replace("#",""),16);
 let r=Math.min(255,Math.max(0,(num>>16)+percent));
 let g=Math.min(255,Math.max(0,((num>>8)&0xff)+percent));
 let b=Math.min(255,Math.max(0,(num&0xff)+percent));
 return "#"+(0x1000000+r*0x10000+g*0x100+b).toString(16).slice(1);
}

function takeDamage(amount,ignore){

 let now=performance.now();

 if(!ignore){
  if(power==="🛡️ SHIELD")return;
  if(now<immuneUntil)return;
 }

 hp-=amount;
 damageFlashUntil=now+250;
 hitSound();

 if(hp<=0){
  hp=0;
  die();
 }else{
  immuneUntil=now+900;
 }

 updateHUD();
}

function collectCoin(c){

 c.taken=true;
 coins++;
 stats.totalCoins++;
 coinSound();

 let now=performance.now();

 if(now<comboWindowUntil)comboCoin++;
 else comboCoin=1;

 comboWindowUntil=now+1200;

 let bonus=Math.min(comboCoin,10);
 addXP(10+bonus*2);

 if(comboCoin>=3){
  showCombo("🪙 "+t("coinCombo").replace("{n}",comboCoin));
 }
}

function fireAttack(){

 let now=performance.now();
 if(now<attackCooldown)return;
 attackCooldown=now+400;

 projectiles.push({
  x:player.x+(facing>0?player.w:0),
  y:player.y+20,w:16,h:10,
  vx:facing*11,
  element:currentElement
 });
}

function cycleElement(){
 let idx=unlockedElements.indexOf(currentElement);
 idx=(idx+1)%unlockedElements.length;
 currentElement=unlockedElements[idx];
}

function checkElementUnlocks(){
 let w=world();
 if(w>=3 && !unlockedElements.includes("❄️ ICE"))unlockedElements.push("❄️ ICE");
 if(w>=5 && !unlockedElements.includes("⚡ LIGHTNING"))unlockedElements.push("⚡ LIGHTNING");
}

function spawnBoss(w){
 boss={
  x:player.x+900,y:250,w:110,h:110,
  hp:10+w*2,maxHp:10+w*2,
  shootTimer:90,world:w
 };
 showCombo("👑 "+t("bossAppeared").replace("{w}",w));
}

function checkEvents(){

 let now=performance.now();
 let m=Math.floor(distance/300);

 if(m>lastEventCheck){
  lastEventCheck=m;

  let r=Math.random();

  if(r<.25){
   rainbowUntil=now+8000;
   showCombo("🌈 "+t("rainbowEvent"));
  }
  else if(r<.5){
   meteorUntil=now+8000;
   showCombo("☄️ "+t("meteorShower"));
  }
  else if(r<.75){
   coinRainUntil=now+6000;
   showCombo("🪙 "+t("coinRain"));
  }
  else{
   swarmUntil=now+8000;
   showCombo("👾 "+t("enemySwarm"));

   for(let s=0;s<6;s++){
    enemies.push({
     x:player.x+300+s*60,
     y:100+Math.random()*300,
     w:36,h:36,
     vx:(Math.random()<.5?-1:1)*3,
     phase:Math.random()*6,
     type:"fly",hp:1,slowUntil:0,shootTimer:0
    });
   }
  }
 }
}

function showCombo(text){
 let el=document.getElementById("comboPopup");
 el.textContent=text;
 el.style.display="block";
 clearTimeout(showCombo._t);
 showCombo._t=setTimeout(()=>{el.style.display="none";},1200);
}

function speed(){
 return power==="⚡ SPEED" ? 9 : 5+rebirth*.1;
}

function jumpPower(){
 return power==="🦘 SUPER JUMP" ? -24 : -13-rebirth*.02;
}

/* =========================
   LUCKY BLOCK
========================= */

function randomPower(){

 powerupSound();

 let r=Math.random()*100;

 if(r<30){
  power="⚡ SPEED";
  powerUntil=performance.now()+10000;
 }

 else if(r<55){
  power="🛡️ SHIELD";
  powerUntil=performance.now()+10000;
 }

 else if(r<80){
  power="🧲 MAGNET";
  powerUntil=performance.now()+15000;
 }

 else{
  power="🦘 SUPER JUMP";
  powerUntil=performance.now()+10000;
 }
}

/* =========================
   DEATH / MATH
========================= */

function die(){

 if(mathActive)return;

 stats.totalDeaths++;

 mathActive=true;
 createQuestion();

 document.getElementById("math").style.display="flex";
}

function createQuestion(){

 clearInterval(timerID);

 let r=Math.random()*100;
 let max;

 if(r<75){
  max=20;
  timer=15;
  mathMaxTimer=15;
  document.getElementById("mathType").textContent=
   "🟢 Math 20 — 75% — 15 sec";
  document.getElementById("scratchpad").style.display="block";
 }
 else if(r<99){
  max=100;
  timer=30;
  mathMaxTimer=30;
  document.getElementById("mathType").textContent=
   "🟡 Math 100 — 24% — 30 sec";
  document.getElementById("scratchpad").style.display="block";
 }
 else{
  max=1000;
  timer=45;
  mathMaxTimer=45;
  document.getElementById("mathType").textContent=
   "🔴 Math 1000 — 1% — 45 sec";
  document.getElementById("scratchpad").style.display="block";
 }

 let a,b,op;

 if(max===20){

  op=Math.floor(Math.random()*4);

  if(op===0){
   a=Math.floor(Math.random()*21);
   b=Math.floor(Math.random()*(21-a));
   correct=a+b;
   question(`${a} + ${b} = ?`);
  }
  else if(op===1){
   a=Math.floor(Math.random()*21);
   b=Math.floor(Math.random()*(a+1));
   correct=a-b;
   question(`${a} − ${b} = ?`);
  }
  else if(op===2){
   a=1+Math.floor(Math.random()*5);
   b=1+Math.floor(Math.random()*5);
   correct=a*b;
   question(`${a} × ${b} = ?`);
  }
  else{
   b=1+Math.floor(Math.random()*5);
   correct=1+Math.floor(Math.random()*5);
   a=b*correct;
   question(`${a} ÷ ${b} = ?`);
  }

 }
 else if(max===100){

  let r2=Math.random();

  if(r2<.4){
   a=Math.floor(Math.random()*101);
   b=Math.floor(Math.random()*(101-a));
   correct=a+b;
   question(`${a} + ${b} = ?`);
  }
  else if(r2<.8){
   a=Math.floor(Math.random()*101);
   b=Math.floor(Math.random()*(a+1));
   correct=a-b;
   question(`${a} − ${b} = ?`);
  }
  else if(r2<.9){
   a=2+Math.floor(Math.random()*10);
   b=2+Math.floor(Math.random()*10);
   correct=a*b;
   question(`${a} × ${b} = ?`);
  }
  else{
   b=2+Math.floor(Math.random()*9);
   correct=2+Math.floor(Math.random()*20);
   a=b*correct;
   question(`${a} ÷ ${b} = ?`);
  }

 }
 else{

  if(Math.random()<.5){
   a=100+Math.floor(Math.random()*801);
   b=Math.floor(Math.random()*(1001-a));
   correct=a+b;
   question(`${a} + ${b} = ?`);
  }
  else{
   a=100+Math.floor(Math.random()*901);
   b=Math.floor(Math.random()*(a+1));
   correct=a-b;
   question(`${a} − ${b} = ?`);
  }
 }

 document.getElementById("answer").value="";
 document.getElementById("scratchpad").value="";
 document.getElementById("msg").textContent="";
 updateTimer();

 timerID=setInterval(()=>{
  timer--;
  updateTimer();

  if(timer<=0){
   clearInterval(timerID);
   createQuestion();
  }
 },1000);
}

function question(q){
 document.getElementById("question").textContent=q;
}

function updateTimer(){
 document.getElementById("mathTimer").textContent=
  "⏱️ "+timer+" sec";

 let bar=document.getElementById("mathTimerBarFill");
 if(bar){
  let pct=Math.max(0,Math.min(100,(timer/mathMaxTimer)*100));
  bar.style.width=pct+"%";
 }
}

function check(){

 let answer=Number(
  document.getElementById("answer").value
 );

 if(answer===correct){

  clearInterval(timerID);

  stats.totalMathCorrect++;

  addXP(30);

  hp=maxHp;
  immuneUntil=performance.now()+2000;

  document.getElementById("msg").textContent=
   "🎉 CORRECT! +30 XP — ❤️ FULL HEAL — 🛡️ IMMUNE 2 SEC";

  setTimeout(()=>{

   document.getElementById("math").style.display="none";

   mathActive=false;

   player.x=Math.max(
    100,
    player.x-100
   );

   player.y=200;
   player.vy=0;

  },700);

 }
 else{

  stats.totalMathWrong++;

  document.getElementById("msg").textContent=
   t("wrongMsg");
 }
}

/* =========================
   HUD
========================= */

function updateHUD(){

 document.getElementById("lv").textContent=level;
 document.getElementById("xp").textContent=Math.floor(xp);
 document.getElementById("need").textContent=needXP();
 document.getElementById("world").textContent=world();
 document.getElementById("rebirth").textContent=rebirth;
 document.getElementById("coins").textContent=coins;
 document.getElementById("gems").textContent=gems;
 document.getElementById("distance").textContent=distance;
 document.getElementById("score").textContent=score;
 document.getElementById("power").textContent=power||"None";

 let fill=document.getElementById("hpBarFill");
 if(fill){
  let pct=Math.max(0,hp/maxHp*100);
  fill.style.width=pct+"%";
  fill.style.background=hp>50?"#22c55e":hp>25?"#f59e0b":"#ef4444";
 }

 let keysEl=document.getElementById("keys");
 if(keysEl)keysEl.textContent=keys;

 let comboEl=document.getElementById("combo");
 if(comboEl)comboEl.textContent=comboCoin;

 let elemEl=document.getElementById("elemDisplay");
 if(elemEl)elemEl.textContent=currentElement;

 let elemBtn=document.getElementById("elementBtn");
 if(elemBtn)elemBtn.textContent=currentElement.split(" ")[0];
}

/* =========================
   WORLD MENU
========================= */

function worlds(){

 let html="";

 for(let i=0;i<50;i++){

  let unlocked=level>=UNLOCK[i];
  let trophy=worldTrophy[i+1]?" 🏆":"";

  html+=`
  <div class="item" style="opacity:${unlocked?1:.4}">
  ${WORLD_NAMES[i]}${trophy}<br>
  🔓 Level ${UNLOCK[i]}
  ${unlocked?"✅":"🔒"}
  </div>`;
 }

 info("🌍 50 WORLDS",
 `<div class="grid">${html}</div>`);
}

function info(title,body){

 document.getElementById("infoTitle").textContent=title;
 document.getElementById("infoBody").innerHTML=body;
 document.getElementById("info").style.display="flex";
}

function closeInfo(){
 document.getElementById("info").style.display="none";
}

function showAchievements(){
 info("🏆 ACHIEVEMENTS",
 `
 🏆 First Coin<br>
 🏃 Runner — 1000m<br>
 🧮 Math Genius<br>
 ⭐ Level 100<br>
 🔄 First Rebirth<br>
 🌍 World 10<br>
 🌍 World 50<br>
 👹 Boss Hunter
 `);
}

function showInventory(){
 info("🎒 INVENTORY",
 `
 ⚡ SPEED ×3<br>
 🛡️ SHIELD ×2<br>
 🧲 MAGNET ×3<br>
 🦘 SUPER JUMP ×2
 `);
}

function showMissions(){
 info("📅 DAILY MISSIONS",
 `
 🪙 Collect 50 Coins<br>
 📏 Run 500m<br>
 🧮 Answer 10 Math Questions<br>
 🎁 Reward: 💎 Gems + XP
 `);
}

/* =========================
   STATS / SKINS / SLOTS
========================= */

function openSettings(){

 populateLangSelect();

 document.getElementById("settingsMusicBtn").textContent=
  "🎵 "+t("music")+": "+(musicOn?t("on"):t("off"));

 document.getElementById("settingsSfxBtn").textContent=
  "🔊 "+t("sfx")+": "+(sfxOn?t("on"):t("off"));

 document.getElementById("settingsScreen").style.display="flex";
}

function closeScreen(id){
 document.getElementById(id).style.display="none";
}

/* =========================
   LANGUAGE (50 most spoken)
========================= */

const LANGS={
 en:{name:"English",t:{subtitle:"✨ V8.1 InDev — Enhanced Edition",start:"START",worlds:"WORLDS",achievements:"ACHIEVEMENTS",inventory:"INVENTORY",stats:"STATS",skins:"SKINS",saveSlots:"SAVE SLOTS",settings:"SETTINGS",close:"CLOSE",music:"Music",sfx:"Sound Effects",on:"ON",off:"OFF",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"PAUSED",resume:"CONTINUE",mainMenu:"MENU",youDied:"YOU DIED!",answer:"ANSWER",statsCoins:"Total Coins collected",statsDeaths:"Deaths",statsCorrect:"Correct answers",statsWrong:"Wrong answers",statsEnemies:"Enemies defeated",statsDistance:"Farthest distance",statsScore:"Best score",statsWorlds:"Worlds completed",rebirthTitle:"REBIRTH!",rebirthBtn:"REBIRTH",rebirthLevelReset:"Level → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"World stays the same",rebirthXpBoost:"XP +25%",controlsKeyboard:"KEYBOARD CONTROLS",controlsTouch:"TOUCH CONTROLS",wrongMsg:"❌ Wrong! Try again!",critXp:"CRITICAL XP!",xpComboMsg:"XP COMBO x{n}",bossDefeated:"WORLD {w} BOSS DEFEATED!",chestOpened:"CHEST OPENED!",teleported:"TELEPORTED!",coinCombo:"COIN COMBO x{n}!",bossAppeared:"WORLD {w} BOSS APPEARED!",rainbowEvent:"RAINBOW EVENT! XP x2",meteorShower:"METEOR SHOWER!",coinRain:"COIN RAIN!",enemySwarm:"ENEMY SWARM!",progressReset:"PROGRESS RESET!",achFirstCoin:"First Coin",achRunner:"Runner 1000m",achMathGenius:"Math Genius",achLevel100:"Level 100",achFirstRebirth:"First Rebirth",achWorld50:"World 50",invSpeed:"Speed",invShield:"Shield",invMagnet:"Magnet",invSuperJump:"Super Jump"}},
 zh:{name:"中文",t:{subtitle:"✨ V8.1 开发版 — 增强版",start:"开始",worlds:"世界",achievements:"成就",inventory:"背包",stats:"统计",skins:"皮肤",saveSlots:"存档位",settings:"设置",close:"关闭",music:"音乐",sfx:"音效",on:"开",off:"关",hudLevel:"等级",hudXp:"经验",hudHp:"生命",hudCombo:"连击",pauseTitle:"已暂停",resume:"继续",mainMenu:"主菜单",youDied:"你死了！",answer:"回答",statsCoins:"收集的金币总数",statsDeaths:"死亡次数",statsCorrect:"答对次数",statsWrong:"答错次数",statsEnemies:"击败敌人数",statsDistance:"最远距离",statsScore:"最高分数",statsWorlds:"已完成世界",rebirthTitle:"重生！",rebirthBtn:"重生",rebirthLevelReset:"等级 → 1",rebirthXpReset:"经验 → 0",rebirthWorldSame:"世界保持不变",rebirthXpBoost:"经验 +25%",controlsKeyboard:"键盘操作",controlsTouch:"触屏操作",wrongMsg:"❌ 错误！再试一次！",critXp:"暴击经验！",xpComboMsg:"经验连击 x{n}",bossDefeated:"世界 {w} 首领被击败！",chestOpened:"宝箱已开启！",teleported:"已传送！",coinCombo:"金币连击 x{n}！",bossAppeared:"世界 {w} 首领出现！",rainbowEvent:"彩虹事件！经验 x2",meteorShower:"流星雨！",coinRain:"金币雨！",enemySwarm:"敌人蜂拥而至！",progressReset:"进度已重置！",achFirstCoin:"第一枚金币",achRunner:"跑者 1000米",achMathGenius:"数学天才",achLevel100:"等级 100",achFirstRebirth:"首次重生",achWorld50:"世界 50",invSpeed:"速度",invShield:"护盾",invMagnet:"磁铁",invSuperJump:"超级跳跃"}},
 hi:{name:"हिन्दी",t:{subtitle:"✨ V8.1 इनडेव — एन्हांस्ड एडिशन",start:"शुरू करें",worlds:"संसार",achievements:"उपलब्धियाँ",inventory:"इन्वेंटरी",stats:"आँकड़े",skins:"स्किन्स",saveSlots:"सेव स्लॉट",settings:"सेटिंग्स",close:"बंद करें",music:"संगीत",sfx:"ध्वनि प्रभाव",on:"चालू",off:"बंद",hudLevel:"लेवल",hudXp:"एक्सपी",hudHp:"एचपी",hudCombo:"कॉम्बो",pauseTitle:"रुका हुआ",resume:"जारी रखें",mainMenu:"मेनू",youDied:"आप मर गए!",answer:"उत्तर दें",statsCoins:"कुल एकत्रित सिक्के",statsDeaths:"मृत्यु",statsCorrect:"सही उत्तर",statsWrong:"गलत उत्तर",statsEnemies:"हराए गए दुश्मन",statsDistance:"सबसे दूर दूरी",statsScore:"सर्वश्रेष्ठ स्कोर",statsWorlds:"पूर्ण संसार",rebirthTitle:"पुनर्जन्म!",rebirthBtn:"पुनर्जन्म",rebirthLevelReset:"लेवल → 1",rebirthXpReset:"एक्सपी → 0",rebirthWorldSame:"संसार वही रहेगा",rebirthXpBoost:"एक्सपी +25%",controlsKeyboard:"कीबोर्ड नियंत्रण",controlsTouch:"टच नियंत्रण",wrongMsg:"❌ गलत! फिर कोशिश करें!",critXp:"क्रिटिकल एक्सपी!",xpComboMsg:"एक्सपी कॉम्बो x{n}",bossDefeated:"वर्ल्ड {w} बॉस हराया गया!",chestOpened:"चेस्ट खुला!",teleported:"टेलीपोर्ट हुआ!",coinCombo:"कॉइन कॉम्बो x{n}!",bossAppeared:"वर्ल्ड {w} बॉस प्रकट हुआ!",rainbowEvent:"रेनबो इवेंट! एक्सपी x2",meteorShower:"उल्का वर्षा!",coinRain:"कॉइन वर्षा!",enemySwarm:"दुश्मनों का झुंड!",progressReset:"प्रगति रीसेट हुई!",achFirstCoin:"पहला सिक्का",achRunner:"रनर 1000मी",achMathGenius:"मैथ जीनियस",achLevel100:"लेवल 100",achFirstRebirth:"पहला पुनर्जन्म",achWorld50:"वर्ल्ड 50",invSpeed:"स्पीड",invShield:"शील्ड",invMagnet:"मैग्नेट",invSuperJump:"सुपर जंप"}},
 es:{name:"Español",t:{subtitle:"✨ V8.1 InDev — Edición Mejorada",start:"INICIAR",worlds:"MUNDOS",achievements:"LOGROS",inventory:"INVENTARIO",stats:"ESTADÍSTICAS",skins:"ASPECTOS",saveSlots:"RANURAS",settings:"AJUSTES",close:"CERRAR",music:"Música",sfx:"Efectos de sonido",on:"ACTIVADO",off:"DESACTIVADO",hudLevel:"Nv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"PAUSADO",resume:"CONTINUAR",mainMenu:"MENÚ",youDied:"¡MORISTE!",answer:"RESPONDER",statsCoins:"Monedas totales recolectadas",statsDeaths:"Muertes",statsCorrect:"Respuestas correctas",statsWrong:"Respuestas incorrectas",statsEnemies:"Enemigos derrotados",statsDistance:"Distancia máxima",statsScore:"Mejor puntuación",statsWorlds:"Mundos completados",rebirthTitle:"¡RENACER!",rebirthBtn:"RENACER",rebirthLevelReset:"Nivel → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"El mundo permanece igual",rebirthXpBoost:"XP +25%",controlsKeyboard:"CONTROLES DE TECLADO",controlsTouch:"CONTROLES TÁCTILES",wrongMsg:"❌ ¡Incorrecto! ¡Inténtalo de nuevo!",critXp:"¡XP CRÍTICO!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"¡JEFE DEL MUNDO {w} DERROTADO!",chestOpened:"¡COFRE ABIERTO!",teleported:"¡TELETRANSPORTADO!",coinCombo:"¡COMBO DE MONEDAS x{n}!",bossAppeared:"¡JEFE DEL MUNDO {w} APARECIÓ!",rainbowEvent:"¡EVENTO ARCOÍRIS! XP x2",meteorShower:"¡LLUVIA DE METEOROS!",coinRain:"¡LLUVIA DE MONEDAS!",enemySwarm:"¡ENJAMBRE DE ENEMIGOS!",progressReset:"¡PROGRESO REINICIADO!",achFirstCoin:"Primera Moneda",achRunner:"Corredor 1000m",achMathGenius:"Genio Matemático",achLevel100:"Nivel 100",achFirstRebirth:"Primer Renacer",achWorld50:"Mundo 50",invSpeed:"Velocidad",invShield:"Escudo",invMagnet:"Imán",invSuperJump:"Súper Salto"}},
 fr:{name:"Français",t:{subtitle:"✨ V8.1 InDev — Édition Améliorée",start:"DÉMARRER",worlds:"MONDES",achievements:"SUCCÈS",inventory:"INVENTAIRE",stats:"STATISTIQUES",skins:"APPARENCES",saveSlots:"EMPLACEMENTS",settings:"PARAMÈTRES",close:"FERMER",music:"Musique",sfx:"Effets sonores",on:"ACTIVÉ",off:"DÉSACTIVÉ",hudLevel:"Niv",hudXp:"XP",hudHp:"PV",hudCombo:"Combo",pauseTitle:"PAUSE",resume:"CONTINUER",mainMenu:"MENU",youDied:"VOUS ÊTES MORT !",answer:"RÉPONDRE",statsCoins:"Total de pièces collectées",statsDeaths:"Morts",statsCorrect:"Réponses correctes",statsWrong:"Réponses incorrectes",statsEnemies:"Ennemis vaincus",statsDistance:"Distance maximale",statsScore:"Meilleur score",statsWorlds:"Mondes complétés",rebirthTitle:"RENAISSANCE !",rebirthBtn:"RENAÎTRE",rebirthLevelReset:"Niveau → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Le monde reste le même",rebirthXpBoost:"XP +25%",controlsKeyboard:"CONTRÔLES CLAVIER",controlsTouch:"CONTRÔLES TACTILES",wrongMsg:"❌ Faux ! Réessayez !",critXp:"XP CRITIQUE !",xpComboMsg:"COMBO XP x{n}",bossDefeated:"BOSS DU MONDE {w} VAINCU !",chestOpened:"COFFRE OUVERT !",teleported:"TÉLÉPORTÉ !",coinCombo:"COMBO PIÈCES x{n} !",bossAppeared:"BOSS DU MONDE {w} APPARU !",rainbowEvent:"ÉVÉNEMENT ARC-EN-CIEL ! XP x2",meteorShower:"PLUIE DE MÉTÉORES !",coinRain:"PLUIE DE PIÈCES !",enemySwarm:"ESSAIM D'ENNEMIS !",progressReset:"PROGRESSION RÉINITIALISÉE !",achFirstCoin:"Première Pièce",achRunner:"Coureur 1000m",achMathGenius:"Génie des Maths",achLevel100:"Niveau 100",achFirstRebirth:"Première Renaissance",achWorld50:"Monde 50",invSpeed:"Vitesse",invShield:"Bouclier",invMagnet:"Aimant",invSuperJump:"Super Saut"}},
 ar:{name:"العربية",t:{subtitle:"✨ V8.1 قيد التطوير — إصدار محسّن",start:"ابدأ",worlds:"العوالم",achievements:"الإنجازات",inventory:"المخزون",stats:"الإحصائيات",skins:"المظاهر",saveSlots:"فتحات الحفظ",settings:"الإعدادات",close:"إغلاق",music:"الموسيقى",sfx:"المؤثرات الصوتية",on:"تشغيل",off:"إيقاف",hudLevel:"المستوى",hudXp:"خبرة",hudHp:"صحة",hudCombo:"تتابع",pauseTitle:"متوقف",resume:"متابعة",mainMenu:"القائمة",youDied:"لقد مت!",answer:"أجب",statsCoins:"إجمالي العملات المجمعة",statsDeaths:"الوفيات",statsCorrect:"إجابات صحيحة",statsWrong:"إجابات خاطئة",statsEnemies:"الأعداء المهزومون",statsDistance:"أبعد مسافة",statsScore:"أفضل نتيجة",statsWorlds:"العوالم المكتملة",rebirthTitle:"ولادة جديدة!",rebirthBtn:"ولادة جديدة",rebirthLevelReset:"المستوى → 1",rebirthXpReset:"الخبرة → 0",rebirthWorldSame:"العالم يبقى كما هو",rebirthXpBoost:"الخبرة +25%",controlsKeyboard:"أزرار لوحة المفاتيح",controlsTouch:"أزرار اللمس",wrongMsg:"❌ خطأ! حاول مرة أخرى!",critXp:"خبرة حرجة!",xpComboMsg:"تتابع الخبرة x{n}",bossDefeated:"تم هزيمة زعيم العالم {w}!",chestOpened:"تم فتح الصندوق!",teleported:"تم النقل الآني!",coinCombo:"تتابع العملات x{n}!",bossAppeared:"ظهر زعيم العالم {w}!",rainbowEvent:"حدث قوس قزح! خبرة x2",meteorShower:"وابل النيازك!",coinRain:"مطر العملات!",enemySwarm:"سرب الأعداء!",progressReset:"تمت إعادة تعيين التقدم!",achFirstCoin:"أول عملة",achRunner:"عداء 1000م",achMathGenius:"عبقري الرياضيات",achLevel100:"المستوى 100",achFirstRebirth:"أول ولادة جديدة",achWorld50:"العالم 50",invSpeed:"السرعة",invShield:"الدرع",invMagnet:"المغناطيس",invSuperJump:"القفزة الخارقة"}},
 bn:{name:"বাংলা",t:{subtitle:"✨ V8.1 ইনডেভ — উন্নত সংস্করণ",start:"শুরু করুন",worlds:"বিশ্ব",achievements:"অর্জন",inventory:"ইনভেন্টরি",stats:"পরিসংখ্যান",skins:"স্কিন",saveSlots:"সেভ স্লট",settings:"সেটিংস",close:"বন্ধ করুন",music:"সঙ্গীত",sfx:"শব্দ প্রভাব",on:"চালু",off:"বন্ধ",hudLevel:"লেভেল",hudXp:"এক্সপি",hudHp:"এইচপি",hudCombo:"কম্বো",pauseTitle:"বিরতি",resume:"চালিয়ে যান",mainMenu:"মেনু",youDied:"আপনি মারা গেছেন!",answer:"উত্তর দিন",statsCoins:"মোট সংগৃহীত কয়েন",statsDeaths:"মৃত্যু",statsCorrect:"সঠিক উত্তর",statsWrong:"ভুল উত্তর",statsEnemies:"পরাজিত শত্রু",statsDistance:"সর্বোচ্চ দূরত্ব",statsScore:"সেরা স্কোর",statsWorlds:"সম্পন্ন বিশ্ব",rebirthTitle:"পুনর্জন্ম!",rebirthBtn:"পুনর্জন্ম",rebirthLevelReset:"লেভেল → 1",rebirthXpReset:"এক্সপি → 0",rebirthWorldSame:"বিশ্ব একই থাকবে",rebirthXpBoost:"এক্সপি +25%",controlsKeyboard:"কীবোর্ড নিয়ন্ত্রণ",controlsTouch:"টাচ নিয়ন্ত্রণ",wrongMsg:"❌ ভুল! আবার চেষ্টা করুন!",critXp:"ক্রিটিক্যাল এক্সপি!",xpComboMsg:"এক্সপি কম্বো x{n}",bossDefeated:"বিশ্ব {w} বস পরাজিত!",chestOpened:"চেস্ট খোলা হয়েছে!",teleported:"টেলিপোর্ট হয়েছে!",coinCombo:"কয়েন কম্বো x{n}!",bossAppeared:"বিশ্ব {w} বস আবির্ভূত!",rainbowEvent:"রংধনু ইভেন্ট! এক্সপি x2",meteorShower:"উল্কাবৃষ্টি!",coinRain:"কয়েন বৃষ্টি!",enemySwarm:"শত্রুর ঝাঁক!",progressReset:"অগ্রগতি রিসেট হয়েছে!",achFirstCoin:"প্রথম কয়েন",achRunner:"রানার 1000মি",achMathGenius:"গণিত জিনিয়াস",achLevel100:"লেভেল 100",achFirstRebirth:"প্রথম পুনর্জন্ম",achWorld50:"বিশ্ব 50",invSpeed:"গতি",invShield:"শিল্ড",invMagnet:"ম্যাগনেট",invSuperJump:"সুপার জাম্প"}},
 pt:{name:"Português",t:{subtitle:"✨ V8.1 InDev — Edição Melhorada",start:"INICIAR",worlds:"MUNDOS",achievements:"CONQUISTAS",inventory:"INVENTÁRIO",stats:"ESTATÍSTICAS",skins:"APARÊNCIAS",saveSlots:"SLOTS DE SALVAMENTO",settings:"CONFIGURAÇÕES",close:"FECHAR",music:"Música",sfx:"Efeitos sonoros",on:"LIGADO",off:"DESLIGADO",hudLevel:"Nv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"PAUSADO",resume:"CONTINUAR",mainMenu:"MENU",youDied:"VOCÊ MORREU!",answer:"RESPONDER",statsCoins:"Total de moedas coletadas",statsDeaths:"Mortes",statsCorrect:"Respostas corretas",statsWrong:"Respostas erradas",statsEnemies:"Inimigos derrotados",statsDistance:"Distância máxima",statsScore:"Melhor pontuação",statsWorlds:"Mundos completados",rebirthTitle:"RENASCER!",rebirthBtn:"RENASCER",rebirthLevelReset:"Nível → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"O mundo permanece o mesmo",rebirthXpBoost:"XP +25%",controlsKeyboard:"CONTROLES DE TECLADO",controlsTouch:"CONTROLES DE TOQUE",wrongMsg:"❌ Errado! Tente novamente!",critXp:"XP CRÍTICO!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"CHEFE DO MUNDO {w} DERROTADO!",chestOpened:"BAÚ ABERTO!",teleported:"TELETRANSPORTADO!",coinCombo:"COMBO DE MOEDAS x{n}!",bossAppeared:"CHEFE DO MUNDO {w} APARECEU!",rainbowEvent:"EVENTO ARCO-ÍRIS! XP x2",meteorShower:"CHUVA DE METEOROS!",coinRain:"CHUVA DE MOEDAS!",enemySwarm:"ENXAME DE INIMIGOS!",progressReset:"PROGRESSO REINICIADO!",achFirstCoin:"Primeira Moeda",achRunner:"Corredor 1000m",achMathGenius:"Gênio da Matemática",achLevel100:"Nível 100",achFirstRebirth:"Primeiro Renascimento",achWorld50:"Mundo 50",invSpeed:"Velocidade",invShield:"Escudo",invMagnet:"Ímã",invSuperJump:"Super Salto"}},
 ru:{name:"Русский",t:{subtitle:"✨ V8.1 InDev — Улучшенное издание",start:"СТАРТ",worlds:"МИРЫ",achievements:"ДОСТИЖЕНИЯ",inventory:"ИНВЕНТАРЬ",stats:"СТАТИСТИКА",skins:"СКИНЫ",saveSlots:"СЛОТЫ СОХРАНЕНИЯ",settings:"НАСТРОЙКИ",close:"ЗАКРЫТЬ",music:"Музыка",sfx:"Звуковые эффекты",on:"ВКЛ",off:"ВЫКЛ",hudLevel:"Ур",hudXp:"ОП",hudHp:"ХП",hudCombo:"Комбо",pauseTitle:"ПАУЗА",resume:"ПРОДОЛЖИТЬ",mainMenu:"МЕНЮ",youDied:"ВЫ УМЕРЛИ!",answer:"ОТВЕТИТЬ",statsCoins:"Всего собрано монет",statsDeaths:"Смертей",statsCorrect:"Правильных ответов",statsWrong:"Неправильных ответов",statsEnemies:"Побеждено врагов",statsDistance:"Максимальная дистанция",statsScore:"Лучший счёт",statsWorlds:"Пройдено миров",rebirthTitle:"ПЕРЕРОЖДЕНИЕ!",rebirthBtn:"ПЕРЕРОДИТЬСЯ",rebirthLevelReset:"Уровень → 1",rebirthXpReset:"ОП → 0",rebirthWorldSame:"Мир остаётся прежним",rebirthXpBoost:"ОП +25%",controlsKeyboard:"УПРАВЛЕНИЕ С КЛАВИАТУРЫ",controlsTouch:"СЕНСОРНОЕ УПРАВЛЕНИЕ",wrongMsg:"❌ Неверно! Попробуйте снова!",critXp:"КРИТИЧЕСКИЙ ОПЫТ!",xpComboMsg:"КОМБО ОПЫТА x{n}",bossDefeated:"БОСС МИРА {w} ПОБЕЖДЁН!",chestOpened:"СУНДУК ОТКРЫТ!",teleported:"ТЕЛЕПОРТАЦИЯ!",coinCombo:"КОМБО МОНЕТ x{n}!",bossAppeared:"БОСС МИРА {w} ПОЯВИЛСЯ!",rainbowEvent:"РАДУЖНОЕ СОБЫТИЕ! ОПЫТ x2",meteorShower:"МЕТЕОРНЫЙ ДОЖДЬ!",coinRain:"ДОЖДЬ ИЗ МОНЕТ!",enemySwarm:"РОЙ ВРАГОВ!",progressReset:"ПРОГРЕСС СБРОШЕН!",achFirstCoin:"Первая монета",achRunner:"Бегун 1000м",achMathGenius:"Гений математики",achLevel100:"Уровень 100",achFirstRebirth:"Первое перерождение",achWorld50:"Мир 50",invSpeed:"Скорость",invShield:"Щит",invMagnet:"Магнит",invSuperJump:"Супер прыжок"}},
 ur:{name:"اردو",t:{subtitle:"✨ V8.1 InDev — بہتر ایڈیشن",start:"شروع کریں",worlds:"دنیائیں",achievements:"کامیابیاں",inventory:"انوینٹری",stats:"اعداد و شمار",skins:"اسکنز",saveSlots:"سیو سلاٹس",settings:"ترتیبات",close:"بند کریں",music:"موسیقی",sfx:"صوتی اثرات",on:"آن",off:"آف",hudLevel:"لیول",hudXp:"ایکسپی",hudHp:"ایچ پی",hudCombo:"کومبو",pauseTitle:"موقوف",resume:"جاری رکھیں",mainMenu:"مینو",youDied:"آپ مر گئے!",answer:"جواب دیں",statsCoins:"کل جمع شدہ سکے",statsDeaths:"اموات",statsCorrect:"درست جوابات",statsWrong:"غلط جوابات",statsEnemies:"شکست شدہ دشمن",statsDistance:"سب سے دور فاصلہ",statsScore:"بہترین اسکور",statsWorlds:"مکمل دنیائیں",rebirthTitle:"از سر نو جنم!",rebirthBtn:"از سر نو جنم",rebirthLevelReset:"لیول → 1",rebirthXpReset:"ایکسپی → 0",rebirthWorldSame:"دنیا وہی رہے گی",rebirthXpBoost:"ایکسپی +25%",controlsKeyboard:"کی بورڈ کنٹرولز",controlsTouch:"ٹچ کنٹرولز",wrongMsg:"❌ غلط! دوبارہ کوشش کریں!",critXp:"کریٹیکل ایکسپی!",xpComboMsg:"ایکسپی کومبو x{n}",bossDefeated:"ورلڈ {w} باس شکست ہوگیا!",chestOpened:"چیسٹ کھل گیا!",teleported:"ٹیلی پورٹ ہوگیا!",coinCombo:"سکہ کومبو x{n}!",bossAppeared:"ورلڈ {w} باس نمودار ہوا!",rainbowEvent:"رین بو ایونٹ! ایکسپی x2",meteorShower:"شہاب ثاقب کی بارش!",coinRain:"سکوں کی بارش!",enemySwarm:"دشمنوں کا غول!",progressReset:"پیش رفت ری سیٹ ہوگئی!",achFirstCoin:"پہلا سکہ",achRunner:"رنر 1000میٹر",achMathGenius:"ریاضی کا ماہر",achLevel100:"لیول 100",achFirstRebirth:"پہلا از سر نو جنم",achWorld50:"ورلڈ 50",invSpeed:"سپیڈ",invShield:"شیلڈ",invMagnet:"میگنیٹ",invSuperJump:"سپر جمپ"}},
 id:{name:"Bahasa Indonesia",t:{subtitle:"✨ V8.1 InDev — Edisi Lebih Baik",start:"MULAI",worlds:"DUNIA",achievements:"PENCAPAIAN",inventory:"INVENTARIS",stats:"STATISTIK",skins:"SKIN",saveSlots:"SLOT SIMPANAN",settings:"PENGATURAN",close:"TUTUP",music:"Musik",sfx:"Efek Suara",on:"AKTIF",off:"NONAKTIF",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"JEDA",resume:"LANJUTKAN",mainMenu:"MENU",youDied:"ANDA MATI!",answer:"JAWAB",statsCoins:"Total koin terkumpul",statsDeaths:"Kematian",statsCorrect:"Jawaban benar",statsWrong:"Jawaban salah",statsEnemies:"Musuh dikalahkan",statsDistance:"Jarak terjauh",statsScore:"Skor terbaik",statsWorlds:"Dunia diselesaikan",rebirthTitle:"LAHIR KEMBALI!",rebirthBtn:"LAHIR KEMBALI",rebirthLevelReset:"Level → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Dunia tetap sama",rebirthXpBoost:"XP +25%",controlsKeyboard:"KONTROL KEYBOARD",controlsTouch:"KONTROL SENTUH",wrongMsg:"❌ Salah! Coba lagi!",critXp:"XP KRITIS!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"BOS DUNIA {w} DIKALAHKAN!",chestOpened:"PETI DIBUKA!",teleported:"TERTELEPORT!",coinCombo:"COMBO KOIN x{n}!",bossAppeared:"BOS DUNIA {w} MUNCUL!",rainbowEvent:"EVENT PELANGI! XP x2",meteorShower:"HUJAN METEOR!",coinRain:"HUJAN KOIN!",enemySwarm:"GEROMBOLAN MUSUH!",progressReset:"PROGRES DIRESET!",achFirstCoin:"Koin Pertama",achRunner:"Pelari 1000m",achMathGenius:"Jenius Matematika",achLevel100:"Level 100",achFirstRebirth:"Kelahiran Kembali Pertama",achWorld50:"Dunia 50",invSpeed:"Kecepatan",invShield:"Perisai",invMagnet:"Magnet",invSuperJump:"Lompatan Super"}},
 de:{name:"Deutsch",t:{subtitle:"✨ V8.1 InDev — Erweiterte Edition",start:"START",worlds:"WELTEN",achievements:"ERFOLGE",inventory:"INVENTAR",stats:"STATISTIK",skins:"SKINS",saveSlots:"SPEICHERPLÄTZE",settings:"EINSTELLUNGEN",close:"SCHLIESSEN",music:"Musik",sfx:"Soundeffekte",on:"AN",off:"AUS",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"PAUSIERT",resume:"WEITER",mainMenu:"MENÜ",youDied:"DU BIST GESTORBEN!",answer:"ANTWORTEN",statsCoins:"Insgesamt gesammelte Münzen",statsDeaths:"Tode",statsCorrect:"Richtige Antworten",statsWrong:"Falsche Antworten",statsEnemies:"Besiegte Gegner",statsDistance:"Weiteste Entfernung",statsScore:"Bester Punktestand",statsWorlds:"Abgeschlossene Welten",rebirthTitle:"WIEDERGEBURT!",rebirthBtn:"WIEDERGEBURT",rebirthLevelReset:"Level → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Welt bleibt gleich",rebirthXpBoost:"XP +25%",controlsKeyboard:"TASTATURSTEUERUNG",controlsTouch:"TOUCH-STEUERUNG",wrongMsg:"❌ Falsch! Versuch es nochmal!",critXp:"KRITISCHE XP!",xpComboMsg:"XP-COMBO x{n}",bossDefeated:"WELT-{w}-BOSS BESIEGT!",chestOpened:"TRUHE GEÖFFNET!",teleported:"TELEPORTIERT!",coinCombo:"MÜNZEN-COMBO x{n}!",bossAppeared:"WELT-{w}-BOSS ERSCHIENEN!",rainbowEvent:"REGENBOGEN-EVENT! XP x2",meteorShower:"METEORSCHAUER!",coinRain:"MÜNZREGEN!",enemySwarm:"FEINDSCHWARM!",progressReset:"FORTSCHRITT ZURÜCKGESETZT!",achFirstCoin:"Erste Münze",achRunner:"Läufer 1000m",achMathGenius:"Mathe-Genie",achLevel100:"Level 100",achFirstRebirth:"Erste Wiedergeburt",achWorld50:"Welt 50",invSpeed:"Geschwindigkeit",invShield:"Schild",invMagnet:"Magnet",invSuperJump:"SuperSprung"}},
 ja:{name:"日本語",t:{subtitle:"✨ V8.1 開発版 — 拡張エディション",start:"スタート",worlds:"ワールド",achievements:"実績",inventory:"インベントリ",stats:"統計",skins:"スキン",saveSlots:"セーブスロット",settings:"設定",close:"閉じる",music:"音楽",sfx:"効果音",on:"オン",off:"オフ",hudLevel:"レベル",hudXp:"経験値",hudHp:"HP",hudCombo:"コンボ",pauseTitle:"一時停止",resume:"再開",mainMenu:"メニュー",youDied:"あなたは死んだ！",answer:"回答",statsCoins:"収集したコイン合計",statsDeaths:"死亡回数",statsCorrect:"正解数",statsWrong:"不正解数",statsEnemies:"倒した敵",statsDistance:"最長距離",statsScore:"最高スコア",statsWorlds:"クリアしたワールド",rebirthTitle:"転生！",rebirthBtn:"転生する",rebirthLevelReset:"レベル → 1",rebirthXpReset:"経験値 → 0",rebirthWorldSame:"ワールドはそのまま",rebirthXpBoost:"経験値 +25%",controlsKeyboard:"キーボード操作",controlsTouch:"タッチ操作",wrongMsg:"❌ 不正解！もう一度！",critXp:"クリティカルXP！",xpComboMsg:"XPコンボ x{n}",bossDefeated:"ワールド{w}ボス撃破！",chestOpened:"宝箱を開けた！",teleported:"テレポートした！",coinCombo:"コインコンボ x{n}！",bossAppeared:"ワールド{w}ボス出現！",rainbowEvent:"レインボーイベント！XP x2",meteorShower:"隕石群！",coinRain:"コインの雨！",enemySwarm:"敵の大群！",progressReset:"進行状況をリセットしました！",achFirstCoin:"最初のコイン",achRunner:"ランナー1000m",achMathGenius:"数学の天才",achLevel100:"レベル100",achFirstRebirth:"初転生",achWorld50:"ワールド50",invSpeed:"スピード",invShield:"シールド",invMagnet:"マグネット",invSuperJump:"スーパージャンプ"}},
 sw:{name:"Kiswahili",t:{subtitle:"✨ V8.1 InDev — Toleo Bora",start:"ANZA",worlds:"DUNIA",achievements:"MAFANIKIO",inventory:"MALI",stats:"TAKWIMU",skins:"NGOZI",saveSlots:"NAFASI ZA KUHIFADHI",settings:"MIPANGILIO",close:"FUNGA",music:"Muziki",sfx:"Athari za Sauti",on:"WASHA",off:"ZIMA",hudLevel:"Kiwango",hudXp:"XP",hudHp:"Afya",hudCombo:"Mfululizo",pauseTitle:"IMESIMAMISHWA",resume:"ENDELEA",mainMenu:"MENYU",youDied:"UMEFARIKI!",answer:"JIBU",statsCoins:"Jumla ya sarafu zilizokusanywa",statsDeaths:"Vifo",statsCorrect:"Majibu sahihi",statsWrong:"Majibu mabaya",statsEnemies:"Maadui walioshindwa",statsDistance:"Umbali wa mbali zaidi",statsScore:"Alama bora",statsWorlds:"Dunia zilizokamilika",rebirthTitle:"KUZALIWA UPYA!",rebirthBtn:"ZALIWA UPYA",rebirthLevelReset:"Kiwango → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Dunia inabaki sawa",rebirthXpBoost:"XP +25%",controlsKeyboard:"UDHIBITI WA KIBODI",controlsTouch:"UDHIBITI WA KUGUSA",wrongMsg:"❌ Kosa! Jaribu tena!",critXp:"XP MUHIMU!",xpComboMsg:"MFULULIZO WA XP x{n}",bossDefeated:"BOSI WA DUNIA {w} ASHINDWA!",chestOpened:"SANDUKU LIMEFUNGULIWA!",teleported:"UMESAFIRISHWA!",coinCombo:"MFULULIZO WA SARAFU x{n}!",bossAppeared:"BOSI WA DUNIA {w} AMETOKEA!",rainbowEvent:"TUKIO LA UPINDE WA MVUA! XP x2",meteorShower:"MVUA YA VIMONDO!",coinRain:"MVUA YA SARAFU!",enemySwarm:"KUNDI LA MAADUI!",progressReset:"MAENDELEO YAMEWEKWA UPYA!",achFirstCoin:"Sarafu ya Kwanza",achRunner:"Mkimbiaji 1000m",achMathGenius:"Fikra ya Hesabu",achLevel100:"Kiwango 100",achFirstRebirth:"Kuzaliwa Upya kwa Kwanza",achWorld50:"Dunia 50",invSpeed:"Kasi",invShield:"Ngao",invMagnet:"Sumaku",invSuperJump:"Kuruka Kubwa"}},
 mr:{name:"मराठी",t:{subtitle:"✨ V8.1 इनडेव्ह — वर्धित आवृत्ती",start:"सुरू करा",worlds:"जग",achievements:"यश",inventory:"यादी",stats:"आकडेवारी",skins:"स्किन्स",saveSlots:"सेव्ह स्लॉट्स",settings:"सेटिंग्ज",close:"बंद करा",music:"संगीत",sfx:"ध्वनी प्रभाव",on:"चालू",off:"बंद",hudLevel:"लेव्हल",hudXp:"एक्सपी",hudHp:"एचपी",hudCombo:"कॉम्बो",pauseTitle:"थांबवले",resume:"सुरू ठेवा",mainMenu:"मेनू",youDied:"तुम्ही मेलात!",answer:"उत्तर द्या",statsCoins:"एकूण गोळा केलेली नाणी",statsDeaths:"मृत्यू",statsCorrect:"बरोबर उत्तरे",statsWrong:"चुकीची उत्तरे",statsEnemies:"पराभूत शत्रू",statsDistance:"सर्वात दूर अंतर",statsScore:"सर्वोत्तम गुण",statsWorlds:"पूर्ण जग",rebirthTitle:"पुनर्जन्म!",rebirthBtn:"पुनर्जन्म",rebirthLevelReset:"लेव्हल → 1",rebirthXpReset:"एक्सपी → 0",rebirthWorldSame:"जग तेच राहील",rebirthXpBoost:"एक्सपी +25%",controlsKeyboard:"कीबोर्ड नियंत्रणे",controlsTouch:"टच नियंत्रणे",wrongMsg:"❌ चूक! पुन्हा प्रयत्न करा!",critXp:"क्रिटिकल एक्सपी!",xpComboMsg:"एक्सपी कॉम्बो x{n}",bossDefeated:"वर्ल्ड {w} बॉस पराभूत!",chestOpened:"चेस्ट उघडली!",teleported:"टेलीपोर्ट झाले!",coinCombo:"कॉइन कॉम्बो x{n}!",bossAppeared:"वर्ल्ड {w} बॉस प्रकट झाला!",rainbowEvent:"इंद्रधनुष्य इव्हेंट! एक्सपी x2",meteorShower:"उल्कावर्षाव!",coinRain:"नाणी वर्षाव!",enemySwarm:"शत्रूंचा थवा!",progressReset:"प्रगती रीसेट झाली!",achFirstCoin:"पहिले नाणे",achRunner:"धावपटू 1000मी",achMathGenius:"गणित प्रतिभा",achLevel100:"लेव्हल 100",achFirstRebirth:"पहिला पुनर्जन्म",achWorld50:"वर्ल्ड 50",invSpeed:"वेग",invShield:"ढाल",invMagnet:"चुंबक",invSuperJump:"सुपर जंप"}},
 te:{name:"తెలుగు",t:{subtitle:"✨ V8.1 ఇన్‌డెవ్ — మెరుగైన ఎడిషన్",start:"ప్రారంభించు",worlds:"ప్రపంచాలు",achievements:"విజయాలు",inventory:"ఇన్వెంటరీ",stats:"గణాంకాలు",skins:"స్కిన్స్",saveSlots:"సేవ్ స్లాట్‌లు",settings:"సెట్టింగ్‌లు",close:"మూసివేయి",music:"సంగీతం",sfx:"ధ్వని ప్రభావాలు",on:"ఆన్",off:"ఆఫ్",hudLevel:"లెవల్",hudXp:"ఎక్స్‌పి",hudHp:"హెచ్‌పి",hudCombo:"కాంబో",pauseTitle:"ఆగింది",resume:"కొనసాగించు",mainMenu:"మెనూ",youDied:"మీరు చనిపోయారు!",answer:"సమాధానం ఇవ్వండి",statsCoins:"మొత్తం సేకరించిన నాణేలు",statsDeaths:"మరణాలు",statsCorrect:"సరైన సమాధానాలు",statsWrong:"తప్పు సమాధానాలు",statsEnemies:"ఓడించిన శత్రువులు",statsDistance:"అత్యధిక దూరం",statsScore:"అత్యుత్తమ స్కోరు",statsWorlds:"పూర్తయిన ప్రపంచాలు",rebirthTitle:"పునర్జన్మ!",rebirthBtn:"పునర్జన్మ",rebirthLevelReset:"లెవల్ → 1",rebirthXpReset:"ఎక్స్‌పి → 0",rebirthWorldSame:"ప్రపంచం అలాగే ఉంటుంది",rebirthXpBoost:"ఎక్స్‌పి +25%",controlsKeyboard:"కీబోర్డ్ నియంత్రణలు",controlsTouch:"టచ్ నియంత్రణలు",wrongMsg:"❌ తప్పు! మళ్ళీ ప్రయత్నించండి!",critXp:"క్రిటికల్ ఎక్స్‌పి!",xpComboMsg:"ఎక్స్‌పి కాంబో x{n}",bossDefeated:"వరల్డ్ {w} బాస్ ఓడిపోయాడు!",chestOpened:"చెస్ట్ తెరవబడింది!",teleported:"టెలిపోర్ట్ అయ్యింది!",coinCombo:"కాయిన్ కాంబో x{n}!",bossAppeared:"వరల్డ్ {w} బాస్ కనిపించాడు!",rainbowEvent:"హరివిల్లు ఈవెంట్! ఎక్స్‌పి x2",meteorShower:"ఉల్కాపాతం!",coinRain:"నాణేల వర్షం!",enemySwarm:"శత్రువుల గుంపు!",progressReset:"పురోగతి రీసెట్ చేయబడింది!",achFirstCoin:"మొదటి నాణెం",achRunner:"రన్నర్ 1000మీ",achMathGenius:"గణిత మేధావి",achLevel100:"లెవల్ 100",achFirstRebirth:"మొదటి పునర్జన్మ",achWorld50:"వరల్డ్ 50",invSpeed:"వేగం",invShield:"కవచం",invMagnet:"అయస్కాంతం",invSuperJump:"సూపర్ జంప్"}},
 tr:{name:"Türkçe",t:{subtitle:"✨ V8.1 InDev — Gelişmiş Sürüm",start:"BAŞLA",worlds:"DÜNYALAR",achievements:"BAŞARIMLAR",inventory:"ENVANTER",stats:"İSTATİSTİKLER",skins:"KOSTÜMLER",saveSlots:"KAYIT YUVALARI",settings:"AYARLAR",close:"KAPAT",music:"Müzik",sfx:"Ses Efektleri",on:"AÇIK",off:"KAPALI",hudLevel:"Sv",hudXp:"XP",hudHp:"HP",hudCombo:"Kombo",pauseTitle:"DURAKLATILDI",resume:"DEVAM ET",mainMenu:"MENÜ",youDied:"ÖLDÜN!",answer:"CEVAPLA",statsCoins:"Toplanan toplam para",statsDeaths:"Ölümler",statsCorrect:"Doğru cevaplar",statsWrong:"Yanlış cevaplar",statsEnemies:"Yenilen düşmanlar",statsDistance:"En uzak mesafe",statsScore:"En iyi skor",statsWorlds:"Tamamlanan dünyalar",rebirthTitle:"YENİDEN DOĞUŞ!",rebirthBtn:"YENİDEN DOĞ",rebirthLevelReset:"Seviye → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Dünya aynı kalır",rebirthXpBoost:"XP +25%",controlsKeyboard:"KLAVYE KONTROLLERİ",controlsTouch:"DOKUNMATİK KONTROLLER",wrongMsg:"❌ Yanlış! Tekrar dene!",critXp:"KRİTİK XP!",xpComboMsg:"XP KOMBOSU x{n}",bossDefeated:"DÜNYA {w} PATRONU YENİLDİ!",chestOpened:"SANDIK AÇILDI!",teleported:"IŞINLANDIN!",coinCombo:"PARA KOMBOSU x{n}!",bossAppeared:"DÜNYA {w} PATRONU BELİRDİ!",rainbowEvent:"GÖKKUŞAĞI ETKİNLİĞİ! XP x2",meteorShower:"METEOR YAĞMURU!",coinRain:"PARA YAĞMURU!",enemySwarm:"DÜŞMAN SÜRÜSÜ!",progressReset:"İLERLEME SIFIRLANDI!",achFirstCoin:"İlk Para",achRunner:"Koşucu 1000m",achMathGenius:"Matematik Dehası",achLevel100:"Seviye 100",achFirstRebirth:"İlk Yeniden Doğuş",achWorld50:"Dünya 50",invSpeed:"Hız",invShield:"Kalkan",invMagnet:"Mıknatıs",invSuperJump:"Süper Zıplama"}},
 ta:{name:"தமிழ்",t:{subtitle:"✨ V8.1 இன்டெவ் — மேம்படுத்தப்பட்ட பதிப்பு",start:"தொடங்கு",worlds:"உலகங்கள்",achievements:"சாதனைகள்",inventory:"பொருட்கள்",stats:"புள்ளிவிவரங்கள்",skins:"தோற்றங்கள்",saveSlots:"சேமிப்பு இடங்கள்",settings:"அமைப்புகள்",close:"மூடு",music:"இசை",sfx:"ஒலி விளைவுகள்",on:"ஆன்",off:"ஆஃப்",hudLevel:"நிலை",hudXp:"எக்ஸ்பி",hudHp:"ஆரோக்கியம்",hudCombo:"காம்போ",pauseTitle:"இடைநிறுத்தப்பட்டது",resume:"தொடரவும்",mainMenu:"மெனு",youDied:"நீங்கள் இறந்தீர்கள்!",answer:"பதில் அளி",statsCoins:"மொத்தம் சேகரித்த நாணயங்கள்",statsDeaths:"மரணங்கள்",statsCorrect:"சரியான பதில்கள்",statsWrong:"தவறான பதில்கள்",statsEnemies:"தோற்கடிக்கப்பட்ட எதிரிகள்",statsDistance:"அதிக தூரம்",statsScore:"சிறந்த மதிப்பெண்",statsWorlds:"முடிக்கப்பட்ட உலகங்கள்",rebirthTitle:"மறுபிறவி!",rebirthBtn:"மறுபிறவி",rebirthLevelReset:"நிலை → 1",rebirthXpReset:"எக்ஸ்பி → 0",rebirthWorldSame:"உலகம் அப்படியே இருக்கும்",rebirthXpBoost:"எக்ஸ்பி +25%",controlsKeyboard:"விசைப்பலகை கட்டுப்பாடுகள்",controlsTouch:"தொடு கட்டுப்பாடுகள்",wrongMsg:"❌ தவறு! மீண்டும் முயற்சிக்கவும்!",critXp:"க்ரிட்டிகல் எக்ஸ்பி!",xpComboMsg:"எக்ஸ்பி காம்போ x{n}",bossDefeated:"உலகம் {w} தலைவன் தோற்கடிக்கப்பட்டான்!",chestOpened:"பெட்டி திறக்கப்பட்டது!",teleported:"தொலைநகர்த்தப்பட்டது!",coinCombo:"நாணய காம்போ x{n}!",bossAppeared:"உலகம் {w} தலைவன் தோன்றினான்!",rainbowEvent:"வானவில் நிகழ்வு! எக்ஸ்பி x2",meteorShower:"விண்கல் மழை!",coinRain:"நாணய மழை!",enemySwarm:"எதிரிகள் திரள்!",progressReset:"முன்னேற்றம் மீட்டமைக்கப்பட்டது!",achFirstCoin:"முதல் நாணயம்",achRunner:"ரன்னர் 1000மீ",achMathGenius:"கணித மேதை",achLevel100:"நிலை 100",achFirstRebirth:"முதல் மறுபிறவி",achWorld50:"உலகம் 50",invSpeed:"வேகம்",invShield:"கவசம்",invMagnet:"காந்தம்",invSuperJump:"சூப்பர் ஜம்ப்"}},
 yue:{name:"粵語",t:{subtitle:"✨ V8.1 開發版 — 加強版",start:"開始",worlds:"世界",achievements:"成就",inventory:"背囊",stats:"統計",skins:"造型",saveSlots:"存檔位",settings:"設定",close:"關閉",music:"音樂",sfx:"音效",on:"開",off:"關",hudLevel:"等級",hudXp:"經驗",hudHp:"生命",hudCombo:"連擊",pauseTitle:"已暫停",resume:"繼續",mainMenu:"主選單",youDied:"你死咗！",answer:"回答",statsCoins:"收集金幣總數",statsDeaths:"死亡次數",statsCorrect:"答啱次數",statsWrong:"答錯次數",statsEnemies:"擊敗敵人數",statsDistance:"最遠距離",statsScore:"最高分數",statsWorlds:"已完成世界",rebirthTitle:"重生！",rebirthBtn:"重生",rebirthLevelReset:"等級 → 1",rebirthXpReset:"經驗 → 0",rebirthWorldSame:"世界保持不變",rebirthXpBoost:"經驗 +25%",controlsKeyboard:"鍵盤操作",controlsTouch:"觸控操作",wrongMsg:"❌ 錯誤！再試一次！",critXp:"暴擊經驗！",xpComboMsg:"經驗連擊 x{n}",bossDefeated:"世界 {w} 首領被擊敗！",chestOpened:"寶箱已開啟！",teleported:"已傳送！",coinCombo:"金幣連擊 x{n}！",bossAppeared:"世界 {w} 首領出現！",rainbowEvent:"彩虹事件！經驗 x2",meteorShower:"流星雨！",coinRain:"金幣雨！",enemySwarm:"敵人蜂擁而至！",progressReset:"進度已重置！",achFirstCoin:"第一個金幣",achRunner:"跑者 1000米",achMathGenius:"數學天才",achLevel100:"等級 100",achFirstRebirth:"首次重生",achWorld50:"世界 50",invSpeed:"速度",invShield:"護盾",invMagnet:"磁鐵",invSuperJump:"超級跳躍"}},
 vi:{name:"Tiếng Việt",t:{subtitle:"✨ V8.1 InDev — Phiên bản nâng cấp",start:"BẮT ĐẦU",worlds:"THẾ GIỚI",achievements:"THÀNH TỰU",inventory:"KHO ĐỒ",stats:"THỐNG KÊ",skins:"SKIN",saveSlots:"Ô LƯU",settings:"CÀI ĐẶT",close:"ĐÓNG",music:"Âm nhạc",sfx:"Hiệu ứng âm thanh",on:"BẬT",off:"TẮT",hudLevel:"Lv",hudXp:"XP",hudHp:"Máu",hudCombo:"Combo",pauseTitle:"TẠM DỪNG",resume:"TIẾP TỤC",mainMenu:"MENU",youDied:"BẠN ĐÃ CHẾT!",answer:"TRẢ LỜI",statsCoins:"Tổng coin đã nhặt",statsDeaths:"Số lần chết",statsCorrect:"Trả lời đúng",statsWrong:"Trả lời sai",statsEnemies:"Enemies đã hạ",statsDistance:"Quãng đường xa nhất",statsScore:"Điểm cao nhất",statsWorlds:"World đã hoàn thành",rebirthTitle:"TÁI SINH!",rebirthBtn:"TÁI SINH",rebirthLevelReset:"Level → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"World giữ nguyên",rebirthXpBoost:"XP +25%",controlsKeyboard:"ĐIỀU KHIỂN BÀN PHÍM",controlsTouch:"ĐIỀU KHIỂN CHẠM",wrongMsg:"❌ Sai! Thử lại!",critXp:"XP CHÍ MẠNG!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"BOSS THẾ GIỚI {w} ĐÃ BỊ HẠ!",chestOpened:"ĐÃ MỞ RƯƠNG!",teleported:"ĐÃ DỊCH CHUYỂN!",coinCombo:"COMBO COIN x{n}!",bossAppeared:"BOSS THẾ GIỚI {w} XUẤT HIỆN!",rainbowEvent:"SỰ KIỆN CẦU VỒNG! XP x2",meteorShower:"MƯA SAO BĂNG!",coinRain:"MƯA COIN!",enemySwarm:"BẦY QUÁI VẬT!",progressReset:"ĐÃ RESET TIẾN TRÌNH!",achFirstCoin:"Coin Đầu Tiên",achRunner:"Runner 1000m",achMathGenius:"Thiên Tài Toán Học",achLevel100:"Level 100",achFirstRebirth:"Tái Sinh Lần Đầu",achWorld50:"World 50",invSpeed:"Tốc Độ",invShield:"Khiên",invMagnet:"Nam Châm",invSuperJump:"Siêu Nhảy"}},
 ko:{name:"한국어",t:{subtitle:"✨ V8.1 개발중 — 확장판",start:"시작",worlds:"월드",achievements:"업적",inventory:"인벤토리",stats:"통계",skins:"스킨",saveSlots:"저장 슬롯",settings:"설정",close:"닫기",music:"음악",sfx:"효과음",on:"켜짐",off:"꺼짐",hudLevel:"레벨",hudXp:"경험치",hudHp:"체력",hudCombo:"콤보",pauseTitle:"일시정지",resume:"계속하기",mainMenu:"메뉴",youDied:"사망했습니다!",answer:"답하기",statsCoins:"총 수집한 코인",statsDeaths:"사망 횟수",statsCorrect:"정답 수",statsWrong:"오답 수",statsEnemies:"처치한 적",statsDistance:"최장 거리",statsScore:"최고 점수",statsWorlds:"완료한 월드",rebirthTitle:"환생!",rebirthBtn:"환생하기",rebirthLevelReset:"레벨 → 1",rebirthXpReset:"경험치 → 0",rebirthWorldSame:"월드는 그대로 유지",rebirthXpBoost:"경험치 +25%",controlsKeyboard:"키보드 조작",controlsTouch:"터치 조작",wrongMsg:"❌ 틀렸습니다! 다시 시도하세요!",critXp:"크리티컬 경험치!",xpComboMsg:"경험치 콤보 x{n}",bossDefeated:"월드 {w} 보스 처치!",chestOpened:"상자를 열었습니다!",teleported:"텔레포트했습니다!",coinCombo:"코인 콤보 x{n}!",bossAppeared:"월드 {w} 보스 등장!",rainbowEvent:"무지개 이벤트! 경험치 x2",meteorShower:"유성우!",coinRain:"코인 비!",enemySwarm:"적 무리!",progressReset:"진행 상황이 초기화되었습니다!",achFirstCoin:"첫 코인",achRunner:"러너 1000m",achMathGenius:"수학 천재",achLevel100:"레벨 100",achFirstRebirth:"첫 환생",achWorld50:"월드 50",invSpeed:"스피드",invShield:"실드",invMagnet:"마그넷",invSuperJump:"슈퍼 점프"}},
 it:{name:"Italiano",t:{subtitle:"✨ V8.1 InDev — Edizione Avanzata",start:"INIZIA",worlds:"MONDI",achievements:"OBIETTIVI",inventory:"INVENTARIO",stats:"STATISTICHE",skins:"ASPETTI",saveSlots:"SLOT DI SALVATAGGIO",settings:"IMPOSTAZIONI",close:"CHIUDI",music:"Musica",sfx:"Effetti Sonori",on:"ATTIVO",off:"DISATTIVO",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"IN PAUSA",resume:"CONTINUA",mainMenu:"MENU",youDied:"SEI MORTO!",answer:"RISPONDI",statsCoins:"Monete totali raccolte",statsDeaths:"Morti",statsCorrect:"Risposte corrette",statsWrong:"Risposte sbagliate",statsEnemies:"Nemici sconfitti",statsDistance:"Distanza massima",statsScore:"Miglior punteggio",statsWorlds:"Mondi completati",rebirthTitle:"RINASCITA!",rebirthBtn:"RINASCI",rebirthLevelReset:"Livello → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Il mondo resta lo stesso",rebirthXpBoost:"XP +25%",controlsKeyboard:"CONTROLLI TASTIERA",controlsTouch:"CONTROLLI TOUCH",wrongMsg:"❌ Sbagliato! Riprova!",critXp:"XP CRITICO!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"BOSS DEL MONDO {w} SCONFITTO!",chestOpened:"FORZIERE APERTO!",teleported:"TELETRASPORTATO!",coinCombo:"COMBO MONETE x{n}!",bossAppeared:"BOSS DEL MONDO {w} APPARSO!",rainbowEvent:"EVENTO ARCOBALENO! XP x2",meteorShower:"PIOGGIA DI METEORE!",coinRain:"PIOGGIA DI MONETE!",enemySwarm:"SCIAME DI NEMICI!",progressReset:"PROGRESSI REIMPOSTATI!",achFirstCoin:"Prima Moneta",achRunner:"Corridore 1000m",achMathGenius:"Genio della Matematica",achLevel100:"Livello 100",achFirstRebirth:"Prima Rinascita",achWorld50:"Mondo 50",invSpeed:"Velocità",invShield:"Scudo",invMagnet:"Magnete",invSuperJump:"Super Salto"}},
 ha:{name:"Hausa",t:{subtitle:"✨ V8.1 InDev — Sigar Inganta",start:"FARA",worlds:"DUNIYOYI",achievements:"NASAROI",inventory:"KAYAYYAKI",stats:"KIDAYA",skins:"FATA",saveSlots:"WURAREN AJIYA",settings:"SAITUNA",close:"RUFE",music:"Kiɗa",sfx:"Sautin Musamman",on:"KUNNE",off:"KASHE",hudLevel:"Mataki",hudXp:"XP",hudHp:"Lafiya",hudCombo:"Hadewa",pauseTitle:"AN DAKATAR",resume:"CI GABA",mainMenu:"MENU",youDied:"KA MUTU!",answer:"AMSA",statsCoins:"Jimillar tsabar kuɗi da aka tara",statsDeaths:"Mace-mace",statsCorrect:"Amsoshin daidai",statsWrong:"Amsoshin kuskure",statsEnemies:"Abokan gaba da aka sha kaye",statsDistance:"Mafi nisa",statsScore:"Mafi kyawun maki",statsWorlds:"Duniyoyin da aka kammala",rebirthTitle:"SAKE HAIHUWA!",rebirthBtn:"SAKE HAIHUWA",rebirthLevelReset:"Mataki → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Duniya ta kasance daidai",rebirthXpBoost:"XP +25%",controlsKeyboard:"MAKULLAN KEYBOARD",controlsTouch:"MAKULLAN TABAWA",wrongMsg:"❌ Kuskure! Sake gwadawa!",critXp:"XP MAI MAHIMMANCI!",xpComboMsg:"HADEWAR XP x{n}",bossDefeated:"AN CI BOS NA DUNIYA {w}!",chestOpened:"AN BUDE AKWATI!",teleported:"AN MOTSA!",coinCombo:"HADEWAR KUDI x{n}!",bossAppeared:"BOS NA DUNIYA {w} YA BAYYANA!",rainbowEvent:"BIKIN BAKAN GIZO! XP x2",meteorShower:"RUWAN TAURARO!",coinRain:"RUWAN KUDI!",enemySwarm:"RUNDUNAR ABOKAN GABA!",progressReset:"AN SAKE SAITA CI GABA!",achFirstCoin:"Tsabar Kuɗi Ta Farko",achRunner:"Mai Gudu 1000m",achMathGenius:"Gwanin Lissafi",achLevel100:"Mataki 100",achFirstRebirth:"Sake Haihuwa Ta Farko",achWorld50:"Duniya 50",invSpeed:"Sauri",invShield:"Garkuwa",invMagnet:"Maganadisu",invSuperJump:"Babban Tsalle"}},
 th:{name:"ไทย",t:{subtitle:"✨ V8.1 InDev — รุ่นปรับปรุง",start:"เริ่ม",worlds:"โลก",achievements:"ความสำเร็จ",inventory:"คลังไอเทม",stats:"สถิติ",skins:"สกิน",saveSlots:"ช่องเซฟ",settings:"ตั้งค่า",close:"ปิด",music:"เพลง",sfx:"เอฟเฟกต์เสียง",on:"เปิด",off:"ปิด",hudLevel:"เลเวล",hudXp:"เอ็กซ์พี",hudHp:"เลือด",hudCombo:"คอมโบ",pauseTitle:"หยุดชั่วคราว",resume:"ดำเนินต่อ",mainMenu:"เมนู",youDied:"คุณตายแล้ว!",answer:"ตอบ",statsCoins:"เหรียญที่เก็บได้ทั้งหมด",statsDeaths:"จำนวนการตาย",statsCorrect:"ตอบถูก",statsWrong:"ตอบผิด",statsEnemies:"ศัตรูที่กำจัดได้",statsDistance:"ระยะทางไกลสุด",statsScore:"คะแนนสูงสุด",statsWorlds:"โลกที่ผ่าน",rebirthTitle:"เกิดใหม่!",rebirthBtn:"เกิดใหม่",rebirthLevelReset:"เลเวล → 1",rebirthXpReset:"เอ็กซ์พี → 0",rebirthWorldSame:"โลกยังคงเดิม",rebirthXpBoost:"เอ็กซ์พี +25%",controlsKeyboard:"การควบคุมแป้นพิมพ์",controlsTouch:"การควบคุมสัมผัส",wrongMsg:"❌ ผิด! ลองอีกครั้ง!",critXp:"เอ็กซ์พีคริติคอล!",xpComboMsg:"คอมโบเอ็กซ์พี x{n}",bossDefeated:"บอสโลก {w} พ่ายแพ้แล้ว!",chestOpened:"เปิดกล่องแล้ว!",teleported:"เทเลพอร์ตแล้ว!",coinCombo:"คอมโบเหรียญ x{n}!",bossAppeared:"บอสโลก {w} ปรากฏตัว!",rainbowEvent:"อีเวนต์สายรุ้ง! เอ็กซ์พี x2",meteorShower:"ฝนดาวตก!",coinRain:"ฝนเหรียญ!",enemySwarm:"ฝูงศัตรู!",progressReset:"รีเซ็ตความคืบหน้าแล้ว!",achFirstCoin:"เหรียญแรก",achRunner:"นักวิ่ง 1000ม.",achMathGenius:"อัจฉริยะคณิตศาสตร์",achLevel100:"เลเวล 100",achFirstRebirth:"เกิดใหม่ครั้งแรก",achWorld50:"โลก 50",invSpeed:"ความเร็ว",invShield:"โล่",invMagnet:"แม่เหล็ก",invSuperJump:"กระโดดสุดยอด"}},
 gu:{name:"ગુજરાતી",t:{subtitle:"✨ V8.1 ઇનડેવ — ઉન્નત આવૃત્તિ",start:"શરૂ કરો",worlds:"વિશ્વ",achievements:"સિદ્ધિઓ",inventory:"ઈન્વેન્ટરી",stats:"આંકડા",skins:"સ્કિન્સ",saveSlots:"સેવ સ્લોટ",settings:"સેટિંગ્સ",close:"બંધ કરો",music:"સંગીત",sfx:"સાઉન્ડ ઈફેક્ટ્સ",on:"ચાલુ",off:"બંધ",hudLevel:"લેવલ",hudXp:"એક્સપી",hudHp:"એચપી",hudCombo:"કોમ્બો",pauseTitle:"થોભાવ્યું",resume:"ચાલુ રાખો",mainMenu:"મેનુ",youDied:"તમે મરી ગયા!",answer:"જવાબ આપો",statsCoins:"કુલ એકત્રિત સિક્કા",statsDeaths:"મૃત્યુ",statsCorrect:"સાચા જવાબો",statsWrong:"ખોટા જવાબો",statsEnemies:"પરાજિત દુશ્મનો",statsDistance:"સૌથી દૂરનું અંતર",statsScore:"શ્રેષ્ઠ સ્કોર",statsWorlds:"પૂર્ણ થયેલ વિશ્વ",rebirthTitle:"પુનર્જન્મ!",rebirthBtn:"પુનર્જન્મ",rebirthLevelReset:"લેવલ → 1",rebirthXpReset:"એક્સપી → 0",rebirthWorldSame:"વિશ્વ સમાન રહેશે",rebirthXpBoost:"એક્સપી +25%",controlsKeyboard:"કીબોર્ડ નિયંત્રણો",controlsTouch:"ટચ નિયંત્રણો",wrongMsg:"❌ ખોટું! ફરી પ્રયાસ કરો!",critXp:"ક્રિટિકલ એક્સપી!",xpComboMsg:"એક્સપી કોમ્બો x{n}",bossDefeated:"વિશ્વ {w} બોસ પરાજિત!",chestOpened:"પેટી ખોલાઈ!",teleported:"ટેલિપોર્ટ થયું!",coinCombo:"સિક્કા કોમ્બો x{n}!",bossAppeared:"વિશ્વ {w} બોસ દેખાયો!",rainbowEvent:"મેઘધનુષ્ય ઇવેન્ટ! એક્સપી x2",meteorShower:"ઉલ્કાવર્ષા!",coinRain:"સિક્કાનો વરસાદ!",enemySwarm:"દુશ્મન ટોળું!",progressReset:"પ્રગતિ રીસેટ થઈ!",achFirstCoin:"પ્રથમ સિક્કો",achRunner:"દોડવીર 1000મી",achMathGenius:"ગણિત પ્રતિભા",achLevel100:"લેવલ 100",achFirstRebirth:"પ્રથમ પુનર્જન્મ",achWorld50:"વિશ્વ 50",invSpeed:"ઝડપ",invShield:"ઢાલ",invMagnet:"ચુંબક",invSuperJump:"સુપર જમ્પ"}},
 fa:{name:"فارسی",t:{subtitle:"✨ V8.1 در حال توسعه — نسخه ارتقا یافته",start:"شروع",worlds:"جهان‌ها",achievements:"دستاوردها",inventory:"موجودی",stats:"آمار",skins:"ظاهرها",saveSlots:"اسلات‌های ذخیره",settings:"تنظیمات",close:"بستن",music:"موسیقی",sfx:"جلوه‌های صوتی",on:"روشن",off:"خاموش",hudLevel:"سطح",hudXp:"تجربه",hudHp:"سلامتی",hudCombo:"کمبو",pauseTitle:"متوقف شد",resume:"ادامه",mainMenu:"منو",youDied:"شما مردید!",answer:"پاسخ دهید",statsCoins:"مجموع سکه‌های جمع‌آوری شده",statsDeaths:"مرگ‌ها",statsCorrect:"پاسخ‌های درست",statsWrong:"پاسخ‌های نادرست",statsEnemies:"دشمنان شکست‌خورده",statsDistance:"دورترین فاصله",statsScore:"بهترین امتیاز",statsWorlds:"جهان‌های تکمیل شده",rebirthTitle:"تولد دوباره!",rebirthBtn:"تولد دوباره",rebirthLevelReset:"سطح → ۱",rebirthXpReset:"تجربه → ۰",rebirthWorldSame:"جهان همان باقی می‌ماند",rebirthXpBoost:"تجربه +۲۵٪",controlsKeyboard:"کنترل‌های صفحه‌کلید",controlsTouch:"کنترل‌های لمسی",wrongMsg:"❌ اشتباه! دوباره امتحان کنید!",critXp:"تجربه حیاتی!",xpComboMsg:"کمبو تجربه x{n}",bossDefeated:"رئیس جهان {w} شکست خورد!",chestOpened:"صندوق باز شد!",teleported:"تله‌پورت شد!",coinCombo:"کمبو سکه x{n}!",bossAppeared:"رئیس جهان {w} ظاهر شد!",rainbowEvent:"رویداد رنگین‌کمان! تجربه x2",meteorShower:"باران شهاب‌سنگ!",coinRain:"باران سکه!",enemySwarm:"ازدحام دشمن!",progressReset:"پیشرفت بازنشانی شد!",achFirstCoin:"اولین سکه",achRunner:"دونده ۱۰۰۰متر",achMathGenius:"نابغه ریاضی",achLevel100:"سطح ۱۰۰",achFirstRebirth:"اولین تولد دوباره",achWorld50:"جهان ۵۰",invSpeed:"سرعت",invShield:"سپر",invMagnet:"آهنربا",invSuperJump:"پرش فوق‌العاده"}},
 pl:{name:"Polski",t:{subtitle:"✨ V8.1 InDev — Edycja Rozszerzona",start:"START",worlds:"ŚWIATY",achievements:"OSIĄGNIĘCIA",inventory:"EKWIPUNEK",stats:"STATYSTYKI",skins:"SKÓRKI",saveSlots:"SLOTY ZAPISU",settings:"USTAWIENIA",close:"ZAMKNIJ",music:"Muzyka",sfx:"Efekty Dźwiękowe",on:"WŁ",off:"WYŁ",hudLevel:"Poz",hudXp:"XP",hudHp:"PŻ",hudCombo:"Combo",pauseTitle:"WSTRZYMANO",resume:"KONTYNUUJ",mainMenu:"MENU",youDied:"ZGINĄŁEŚ!",answer:"ODPOWIEDZ",statsCoins:"Łącznie zebrane monety",statsDeaths:"Zgony",statsCorrect:"Poprawne odpowiedzi",statsWrong:"Błędne odpowiedzi",statsEnemies:"Pokonani wrogowie",statsDistance:"Najdłuższy dystans",statsScore:"Najlepszy wynik",statsWorlds:"Ukończone światy",rebirthTitle:"ODRODZENIE!",rebirthBtn:"ODRODŹ SIĘ",rebirthLevelReset:"Poziom → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Świat pozostaje taki sam",rebirthXpBoost:"XP +25%",controlsKeyboard:"STEROWANIE KLAWIATURĄ",controlsTouch:"STEROWANIE DOTYKIEM",wrongMsg:"❌ Źle! Spróbuj ponownie!",critXp:"KRYTYCZNE XP!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"BOSS ŚWIATA {w} POKONANY!",chestOpened:"SKRZYNIA OTWARTA!",teleported:"TELEPORTACJA!",coinCombo:"COMBO MONET x{n}!",bossAppeared:"BOSS ŚWIATA {w} POJAWIŁ SIĘ!",rainbowEvent:"WYDARZENIE TĘCZY! XP x2",meteorShower:"DESZCZ METEORÓW!",coinRain:"DESZCZ MONET!",enemySwarm:"ROJ WROGÓW!",progressReset:"POSTĘP ZRESETOWANY!",achFirstCoin:"Pierwsza Moneta",achRunner:"Biegacz 1000m",achMathGenius:"Geniusz Matematyki",achLevel100:"Poziom 100",achFirstRebirth:"Pierwsze Odrodzenie",achWorld50:"Świat 50",invSpeed:"Szybkość",invShield:"Tarcza",invMagnet:"Magnes",invSuperJump:"Super Skok"}},
 kn:{name:"ಕನ್ನಡ",t:{subtitle:"✨ V8.1 ಇನ್‌ಡೆವ್ — ವರ್ಧಿತ ಆವೃತ್ತಿ",start:"ಪ್ರಾರಂಭಿಸಿ",worlds:"ಜಗತ್ತುಗಳು",achievements:"ಸಾಧನೆಗಳು",inventory:"ದಾಸ್ತಾನು",stats:"ಅಂಕಿಅಂಶಗಳು",skins:"ಸ್ಕಿನ್‌ಗಳು",saveSlots:"ಸೇವ್ ಸ್ಲಾಟ್‌ಗಳು",settings:"ಸೆಟ್ಟಿಂಗ್‌ಗಳು",close:"ಮುಚ್ಚಿ",music:"ಸಂಗೀತ",sfx:"ಧ್ವನಿ ಪರಿಣಾಮಗಳು",on:"ಆನ್",off:"ಆಫ್",hudLevel:"ಹಂತ",hudXp:"ಎಕ್ಸ್‌ಪಿ",hudHp:"ಎಚ್‌ಪಿ",hudCombo:"ಕಾಂಬೊ",pauseTitle:"ವಿರಾಮ",resume:"ಮುಂದುವರಿಸಿ",mainMenu:"ಮೆನು",youDied:"ನೀವು ಸತ್ತಿದ್ದೀರಿ!",answer:"ಉತ್ತರಿಸಿ",statsCoins:"ಒಟ್ಟು ಸಂಗ್ರಹಿಸಿದ ನಾಣ್ಯಗಳು",statsDeaths:"ಸಾವುಗಳು",statsCorrect:"ಸರಿಯಾದ ಉತ್ತರಗಳು",statsWrong:"ತಪ್ಪಾದ ಉತ್ತರಗಳು",statsEnemies:"ಸೋಲಿಸಿದ ಶತ್ರುಗಳು",statsDistance:"ಅತಿ ದೂರದ ಅಂತರ",statsScore:"ಅತ್ಯುತ್ತಮ ಸ್ಕೋರ್",statsWorlds:"ಪೂರ್ಣಗೊಂಡ ಜಗತ್ತುಗಳು",rebirthTitle:"ಪುನರ್ಜನ್ಮ!",rebirthBtn:"ಪುನರ್ಜನ್ಮ",rebirthLevelReset:"ಹಂತ → 1",rebirthXpReset:"ಎಕ್ಸ್‌ಪಿ → 0",rebirthWorldSame:"ಜಗತ್ತು ಹಾಗೆಯೇ ಇರುತ್ತದೆ",rebirthXpBoost:"ಎಕ್ಸ್‌ಪಿ +25%",controlsKeyboard:"ಕೀಬೋರ್ಡ್ ನಿಯಂತ್ರಣಗಳು",controlsTouch:"ಟಚ್ ನಿಯಂತ್ರಣಗಳು",wrongMsg:"❌ ತಪ್ಪು! ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ!",critXp:"ಕ್ರಿಟಿಕಲ್ ಎಕ್ಸ್‌ಪಿ!",xpComboMsg:"ಎಕ್ಸ್‌ಪಿ ಕಾಂಬೊ x{n}",bossDefeated:"ಜಗತ್ತು {w} ಬಾಸ್ ಸೋಲಿಸಲಾಗಿದೆ!",chestOpened:"ಪೆಟ್ಟಿಗೆ ತೆರೆಯಲಾಗಿದೆ!",teleported:"ಟೆಲಿಪೋರ್ಟ್ ಆಗಿದೆ!",coinCombo:"ನಾಣ್ಯ ಕಾಂಬೊ x{n}!",bossAppeared:"ಜಗತ್ತು {w} ಬಾಸ್ ಕಾಣಿಸಿಕೊಂಡಿದೆ!",rainbowEvent:"ಕಾಮನಬಿಲ್ಲು ಈವೆಂಟ್! ಎಕ್ಸ್‌ಪಿ x2",meteorShower:"ಉಲ್ಕಾಪಾತ!",coinRain:"ನಾಣ್ಯ ಮಳೆ!",enemySwarm:"ಶತ್ರುಗಳ ಗುಂಪು!",progressReset:"ಪ್ರಗತಿ ಮರುಹೊಂದಿಸಲಾಗಿದೆ!",achFirstCoin:"ಮೊದಲ ನಾಣ್ಯ",achRunner:"ರನ್ನರ್ 1000ಮೀ",achMathGenius:"ಗಣಿತ ಪ್ರತಿಭೆ",achLevel100:"ಹಂತ 100",achFirstRebirth:"ಮೊದಲ ಪುನರ್ಜನ್ಮ",achWorld50:"ಜಗತ್ತು 50",invSpeed:"ವೇಗ",invShield:"ಗುರಾಣಿ",invMagnet:"ಮ್ಯಾಗ್ನೆಟ್",invSuperJump:"ಸೂಪರ್ ಜಂಪ್"}},
 ml:{name:"മലയാളം",t:{subtitle:"✨ V8.1 ഇൻഡെവ് — മെച്ചപ്പെട്ട പതിപ്പ്",start:"ആരംഭിക്കുക",worlds:"ലോകങ്ങൾ",achievements:"നേട്ടങ്ങൾ",inventory:"ഇൻവെന്ററി",stats:"സ്ഥിതിവിവരക്കണക്ക്",skins:"സ്കിന്നുകൾ",saveSlots:"സേവ് സ്ലോട്ടുകൾ",settings:"സെറ്റിംഗ്സ്",close:"അടയ്ക്കുക",music:"സംഗീതം",sfx:"ശബ്ദ ഇഫക്റ്റുകൾ",on:"ഓൺ",off:"ഓഫ്",hudLevel:"ലെവൽ",hudXp:"എക്സ്പി",hudHp:"എച്ച്പി",hudCombo:"കോംബോ",pauseTitle:"താൽക്കാലികം",resume:"തുടരുക",mainMenu:"മെനു",youDied:"നിങ്ങൾ മരിച്ചു!",answer:"ഉത്തരം നൽകുക",statsCoins:"ആകെ ശേഖരിച്ച നാണയങ്ങൾ",statsDeaths:"മരണങ്ങൾ",statsCorrect:"ശരിയായ ഉത്തരങ്ങൾ",statsWrong:"തെറ്റായ ഉത്തരങ്ങൾ",statsEnemies:"തോൽപ്പിച്ച ശത്രുക്കൾ",statsDistance:"ഏറ്റവും ദൂരം",statsScore:"മികച്ച സ്കോർ",statsWorlds:"പൂർത്തിയാക്കിയ ലോകങ്ങൾ",rebirthTitle:"പുനർജന്മം!",rebirthBtn:"പുനർജന്മം",rebirthLevelReset:"ലെവൽ → 1",rebirthXpReset:"എക്സ്പി → 0",rebirthWorldSame:"ലോകം അതേപടി തുടരും",rebirthXpBoost:"എക്സ്പി +25%",controlsKeyboard:"കീബോർഡ് നിയന്ത്രണങ്ങൾ",controlsTouch:"ടച്ച് നിയന്ത്രണങ്ങൾ",wrongMsg:"❌ തെറ്റ്! വീണ്ടും ശ്രമിക്കുക!",critXp:"ക്രിട്ടിക്കൽ എക്സ്പി!",xpComboMsg:"എക്സ്പി കോംബോ x{n}",bossDefeated:"ലോകം {w} ബോസ് പരാജയപ്പെട്ടു!",chestOpened:"നിധി പെട്ടി തുറന്നു!",teleported:"ടെലിപോർട്ട് ചെയ്തു!",coinCombo:"നാണയ കോംബോ x{n}!",bossAppeared:"ലോകം {w} ബോസ് പ്രത്യക്ഷപ്പെട്ടു!",rainbowEvent:"മഴവില്ല് ഇവന്റ്! എക്സ്പി x2",meteorShower:"ഉൽക്കാവർഷം!",coinRain:"നാണയ മഴ!",enemySwarm:"ശത്രു കൂട്ടം!",progressReset:"പുരോഗതി പുനഃസജ്ജമാക്കി!",achFirstCoin:"ആദ്യ നാണയം",achRunner:"റണ്ണർ 1000മീ",achMathGenius:"ഗണിത പ്രതിഭ",achLevel100:"ലെവൽ 100",achFirstRebirth:"ആദ്യ പുനർജന്മം",achWorld50:"ലോകം 50",invSpeed:"വേഗത",invShield:"കവചം",invMagnet:"കാന്തം",invSuperJump:"സൂപ്പർ ജംപ്"}},
 su:{name:"Basa Sunda",t:{subtitle:"✨ V8.1 InDev — Édisi Ditingkatkeun",start:"MITEK",worlds:"DUNYA",achievements:"KASUKSESAN",inventory:"INVENTARIS",stats:"STATISTIK",skins:"SKIN",saveSlots:"SLOT SIMPEN",settings:"SETÉLAN",close:"TUTUP",music:"Musik",sfx:"Épék Sora",on:"HIDUP",off:"PAEH",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"EUREUN",resume:"LANJUT",mainMenu:"MENU",youDied:"ANJEUN PAEH!",answer:"WALON",statsCoins:"Total koin dikumpulkeun",statsDeaths:"Maot",statsCorrect:"Jawaban bener",statsWrong:"Jawaban salah",statsEnemies:"Musuh éléh",statsDistance:"Jarak pangjauhna",statsScore:"Skor pangalusna",statsWorlds:"Dunya réngsé",rebirthTitle:"LAHIR DEUI!",rebirthBtn:"LAHIR DEUI",rebirthLevelReset:"Level → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Dunya tetep sarua",rebirthXpBoost:"XP +25%",controlsKeyboard:"KONTROL KEYBOARD",controlsTouch:"KONTROL SÉNTUH",wrongMsg:"❌ Salah! Cobaan deui!",critXp:"XP KRITIS!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"BOS DUNYA {w} ÉLÉH!",chestOpened:"PETI DIBUKA!",teleported:"DITELEPORT!",coinCombo:"COMBO KOIN x{n}!",bossAppeared:"BOS DUNYA {w} MUNCUL!",rainbowEvent:"ACARA PALANGI! XP x2",meteorShower:"HUJAN METEOR!",coinRain:"HUJAN KOIN!",enemySwarm:"GEROMBOLAN MUSUH!",progressReset:"KAMAJUAN DIRESET!",achFirstCoin:"Koin Kahiji",achRunner:"Palari 1000m",achMathGenius:"Jenius Matematika",achLevel100:"Level 100",achFirstRebirth:"Lahir Deui Kahiji",achWorld50:"Dunya 50",invSpeed:"Gancang",invShield:"Tameng",invMagnet:"Magnét",invSuperJump:"Luncat Super"}},
 uk:{name:"Українська",t:{subtitle:"✨ V8.1 InDev — Покращене видання",start:"СТАРТ",worlds:"СВІТИ",achievements:"ДОСЯГНЕННЯ",inventory:"ІНВЕНТАР",stats:"СТАТИСТИКА",skins:"СКІНИ",saveSlots:"СЛОТИ ЗБЕРЕЖЕННЯ",settings:"НАЛАШТУВАННЯ",close:"ЗАКРИТИ",music:"Музика",sfx:"Звукові ефекти",on:"УВІМК",off:"ВИМК",hudLevel:"Рів",hudXp:"ОД",hudHp:"ХП",hudCombo:"Комбо",pauseTitle:"ПАУЗА",resume:"ПРОДОВЖИТИ",mainMenu:"МЕНЮ",youDied:"ВИ ЗАГИНУЛИ!",answer:"ВІДПОВІСТИ",statsCoins:"Всього зібрано монет",statsDeaths:"Смертей",statsCorrect:"Правильних відповідей",statsWrong:"Неправильних відповідей",statsEnemies:"Переможено ворогів",statsDistance:"Найбільша відстань",statsScore:"Кращий рахунок",statsWorlds:"Пройдено світів",rebirthTitle:"ПЕРЕРОДЖЕННЯ!",rebirthBtn:"ПЕРЕРОДИТИСЯ",rebirthLevelReset:"Рівень → 1",rebirthXpReset:"ОД → 0",rebirthWorldSame:"Світ залишається тим самим",rebirthXpBoost:"ОД +25%",controlsKeyboard:"УПРАВЛІННЯ КЛАВІАТУРОЮ",controlsTouch:"СЕНСОРНЕ КЕРУВАННЯ",wrongMsg:"❌ Неправильно! Спробуйте ще раз!",critXp:"КРИТИЧНИЙ ДОСВІД!",xpComboMsg:"КОМБО ДОСВІДУ x{n}",bossDefeated:"БОСА СВІТУ {w} ПЕРЕМОЖЕНО!",chestOpened:"СКРИНЮ ВІДКРИТО!",teleported:"ТЕЛЕПОРТОВАНО!",coinCombo:"КОМБО МОНЕТ x{n}!",bossAppeared:"БОС СВІТУ {w} З'ЯВИВСЯ!",rainbowEvent:"ВЕСЕЛКОВА ПОДІЯ! ДОСВІД x2",meteorShower:"МЕТЕОРНИЙ ДОЩ!",coinRain:"ДОЩ З МОНЕТ!",enemySwarm:"РІЙ ВОРОГІВ!",progressReset:"ПРОГРЕС СКИНУТО!",achFirstCoin:"Перша монета",achRunner:"Бігун 1000м",achMathGenius:"Математичний геній",achLevel100:"Рівень 100",achFirstRebirth:"Перше переродження",achWorld50:"Світ 50",invSpeed:"Швидкість",invShield:"Щит",invMagnet:"Магніт",invSuperJump:"Супер стрибок"}},
 nl:{name:"Nederlands",t:{subtitle:"✨ V8.1 InDev — Verbeterde Editie",start:"START",worlds:"WERELDEN",achievements:"PRESTATIES",inventory:"INVENTARIS",stats:"STATISTIEKEN",skins:"SKINS",saveSlots:"OPSLAGVAKKEN",settings:"INSTELLINGEN",close:"SLUITEN",music:"Muziek",sfx:"Geluidseffecten",on:"AAN",off:"UIT",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"GEPAUZEERD",resume:"DOORGAAN",mainMenu:"MENU",youDied:"JE BENT DOOD!",answer:"ANTWOORDEN",statsCoins:"Totaal verzamelde munten",statsDeaths:"Doden",statsCorrect:"Juiste antwoorden",statsWrong:"Foute antwoorden",statsEnemies:"Verslagen vijanden",statsDistance:"Verste afstand",statsScore:"Beste score",statsWorlds:"Voltooide werelden",rebirthTitle:"WEDERGEBOORTE!",rebirthBtn:"HERBOREN WORDEN",rebirthLevelReset:"Level → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Wereld blijft hetzelfde",rebirthXpBoost:"XP +25%",controlsKeyboard:"TOETSENBORDBESTURING",controlsTouch:"AANRAAKBESTURING",wrongMsg:"❌ Fout! Probeer opnieuw!",critXp:"KRITIEKE XP!",xpComboMsg:"XP-COMBO x{n}",bossDefeated:"WERELD {w} BAAS VERSLAGEN!",chestOpened:"KIST GEOPEND!",teleported:"GETELEPORTEERD!",coinCombo:"MUNT-COMBO x{n}!",bossAppeared:"WERELD {w} BAAS VERSCHENEN!",rainbowEvent:"REGENBOOG-EVENT! XP x2",meteorShower:"METEORENREGEN!",coinRain:"MUNTENREGEN!",enemySwarm:"VIJANDENZWERM!",progressReset:"VOORTGANG GERESET!",achFirstCoin:"Eerste Munt",achRunner:"Hardloper 1000m",achMathGenius:"Wiskundegenie",achLevel100:"Level 100",achFirstRebirth:"Eerste Wedergeboorte",achWorld50:"Wereld 50",invSpeed:"Snelheid",invShield:"Schild",invMagnet:"Magneet",invSuperJump:"Superspong"}},
 pa:{name:"ਪੰਜਾਬੀ",t:{subtitle:"✨ V8.1 ਇਨਡੇਵ — ਵਧਾਇਆ ਸੰਸਕਰਣ",start:"ਸ਼ੁਰੂ ਕਰੋ",worlds:"ਸੰਸਾਰ",achievements:"ਪ੍ਰਾਪਤੀਆਂ",inventory:"ਇਨਵੈਂਟਰੀ",stats:"ਅੰਕੜੇ",skins:"ਸਕਿਨਾਂ",saveSlots:"ਸੇਵ ਸਲਾਟ",settings:"ਸੈਟਿੰਗਾਂ",close:"ਬੰਦ ਕਰੋ",music:"ਸੰਗੀਤ",sfx:"ਧੁਨੀ ਪ੍ਰਭਾਵ",on:"ਚਾਲੂ",off:"ਬੰਦ",hudLevel:"ਲੈਵਲ",hudXp:"ਐਕਸਪੀ",hudHp:"ਐਚਪੀ",hudCombo:"ਕੌਂਬੋ",pauseTitle:"ਰੋਕਿਆ ਗਿਆ",resume:"ਜਾਰੀ ਰੱਖੋ",mainMenu:"ਮੀਨੂ",youDied:"ਤੁਸੀਂ ਮਰ ਗਏ!",answer:"ਜਵਾਬ ਦਿਓ",statsCoins:"ਕੁੱਲ ਇਕੱਠੇ ਕੀਤੇ ਸਿੱਕੇ",statsDeaths:"ਮੌਤਾਂ",statsCorrect:"ਸਹੀ ਜਵਾਬ",statsWrong:"ਗਲਤ ਜਵਾਬ",statsEnemies:"ਹਰਾਏ ਦੁਸ਼ਮਣ",statsDistance:"ਸਭ ਤੋਂ ਦੂਰ ਦੂਰੀ",statsScore:"ਸਭ ਤੋਂ ਵਧੀਆ ਸਕੋਰ",statsWorlds:"ਪੂਰੇ ਹੋਏ ਸੰਸਾਰ",rebirthTitle:"ਮੁੜ ਜਨਮ!",rebirthBtn:"ਮੁੜ ਜਨਮ",rebirthLevelReset:"ਲੈਵਲ → 1",rebirthXpReset:"ਐਕਸਪੀ → 0",rebirthWorldSame:"ਸੰਸਾਰ ਉਹੀ ਰਹੇਗਾ",rebirthXpBoost:"ਐਕਸਪੀ +25%",controlsKeyboard:"ਕੀਬੋਰਡ ਕੰਟਰੋਲ",controlsTouch:"ਟੱਚ ਕੰਟਰੋਲ",wrongMsg:"❌ ਗਲਤ! ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ!",critXp:"ਕ੍ਰਿਟੀਕਲ ਐਕਸਪੀ!",xpComboMsg:"ਐਕਸਪੀ ਕੌਂਬੋ x{n}",bossDefeated:"ਸੰਸਾਰ {w} ਬੌਸ ਹਰਾਇਆ ਗਿਆ!",chestOpened:"ਸੰਦੂਕ ਖੁੱਲ੍ਹ ਗਿਆ!",teleported:"ਟੈਲੀਪੋਰਟ ਹੋ ਗਿਆ!",coinCombo:"ਸਿੱਕਾ ਕੌਂਬੋ x{n}!",bossAppeared:"ਸੰਸਾਰ {w} ਬੌਸ ਪ੍ਰਗਟ ਹੋਇਆ!",rainbowEvent:"ਸਤਰੰਗੀ ਈਵੈਂਟ! ਐਕਸਪੀ x2",meteorShower:"ਉਲਕਾ ਵਰਖਾ!",coinRain:"ਸਿੱਕਾ ਵਰਖਾ!",enemySwarm:"ਦੁਸ਼ਮਣਾਂ ਦਾ ਝੁੰਡ!",progressReset:"ਤਰੱਕੀ ਰੀਸੈੱਟ ਹੋਈ!",achFirstCoin:"ਪਹਿਲਾ ਸਿੱਕਾ",achRunner:"ਦੌੜਾਕ 1000ਮੀ",achMathGenius:"ਗਣਿਤ ਪ੍ਰਤਿਭਾ",achLevel100:"ਲੈਵਲ 100",achFirstRebirth:"ਪਹਿਲਾ ਮੁੜ ਜਨਮ",achWorld50:"ਸੰਸਾਰ 50",invSpeed:"ਸਪੀਡ",invShield:"ਸ਼ੀਲਡ",invMagnet:"ਮੈਗਨੈਟ",invSuperJump:"ਸੁਪਰ ਜੰਪ"}},
 am:{name:"አማርኛ",t:{subtitle:"✨ V8.1 InDev — የተሻሻለ እትም",start:"ጀምር",worlds:"ዓለማት",achievements:"ስኬቶች",inventory:"ዕቃዎች",stats:"ስታቲስቲክስ",skins:"ቆዳዎች",saveSlots:"የማስቀመጫ ቦታዎች",settings:"ቅንብሮች",close:"ዝጋ",music:"ሙዚቃ",sfx:"የድምጽ ውጤቶች",on:"በርቷል",off:"ጠፍቷል",hudLevel:"ደረጃ",hudXp:"XP",hudHp:"ጤና",hudCombo:"ኮምቦ",pauseTitle:"ቆሟል",resume:"ቀጥል",mainMenu:"ምናሌ",youDied:"ሞተሃል!",answer:"መልስ ስጥ",statsCoins:"ጠቅላላ የተሰበሰቡ ሳንቲሞች",statsDeaths:"ሞቶች",statsCorrect:"ትክክለኛ መልሶች",statsWrong:"የተሳሳቱ መልሶች",statsEnemies:"የተሸነፉ ጠላቶች",statsDistance:"እጅግ ሩቅ ርቀት",statsScore:"ምርጥ ውጤት",statsWorlds:"የተጠናቀቁ ዓለማት",rebirthTitle:"ዳግም ልደት!",rebirthBtn:"ዳግም ተወለድ",rebirthLevelReset:"ደረጃ → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"ዓለም እንደተጠበቀ ይቆያል",rebirthXpBoost:"XP +25%",controlsKeyboard:"የኪቦርድ መቆጣጠሪያዎች",controlsTouch:"የመዳሰሻ መቆጣጠሪያዎች",wrongMsg:"❌ ስህተት! እንደገና ሞክር!",critXp:"ወሳኝ XP!",xpComboMsg:"የXP ኮምቦ x{n}",bossDefeated:"የዓለም {w} አለቃ ተሸንፏል!",chestOpened:"ሳጥን ተከፍቷል!",teleported:"ተጓጉዟል!",coinCombo:"የሳንቲም ኮምቦ x{n}!",bossAppeared:"የዓለም {w} አለቃ ታይቷል!",rainbowEvent:"የቀስተ ደመና ክስተት! XP x2",meteorShower:"የተወርዋሪ ኮከብ ዝናብ!",coinRain:"የሳንቲም ዝናብ!",enemySwarm:"የጠላት መንጋ!",progressReset:"እድገት ዳግም ተጀምሯል!",achFirstCoin:"የመጀመሪያ ሳንቲም",achRunner:"ሯጭ 1000ሜ",achMathGenius:"የሂሳብ ሊቅ",achLevel100:"ደረጃ 100",achFirstRebirth:"የመጀመሪያ ዳግም ልደት",achWorld50:"ዓለም 50",invSpeed:"ፍጥነት",invShield:"ጋሻ",invMagnet:"ማግኔት",invSuperJump:"ሱፐር ዝላይ"}},
 or:{name:"ଓଡ଼ିଆ",t:{subtitle:"✨ V8.1 ଇନଡେଭ୍ — ଉନ୍ନତ ସଂସ୍କରଣ",start:"ଆରମ୍ଭ କରନ୍ତୁ",worlds:"ଜଗତ",achievements:"ସଫଳତା",inventory:"ଇନଭେଣ୍ଟୋରୀ",stats:"ପରିସଂଖ୍ୟାନ",skins:"ସ୍କିନ୍",saveSlots:"ସେଭ୍ ସ୍ଲଟ୍",settings:"ସେଟିଂସ୍",close:"ବନ୍ଦ କରନ୍ତୁ",music:"ସଙ୍ଗୀତ",sfx:"ଧ୍ୱନି ପ୍ରଭାବ",on:"ଚାଲୁ",off:"ବନ୍ଦ",hudLevel:"ସ୍ତର",hudXp:"ଏକ୍ସପି",hudHp:"ଏଚପି",hudCombo:"କମ୍ବୋ",pauseTitle:"ବିରତ",resume:"ଜାରି ରଖନ୍ତୁ",mainMenu:"ମେନୁ",youDied:"ଆପଣ ମରିଗଲେ!",answer:"ଉତ୍ତର ଦିଅନ୍ତୁ",statsCoins:"ମୋଟ ସଂଗ୍ରହ କରାଯାଇଥିବା ମୁଦ୍ରା",statsDeaths:"ମୃତ୍ୟୁ",statsCorrect:"ସଠିକ ଉତ୍ତର",statsWrong:"ଭୁଲ ଉତ୍ତର",statsEnemies:"ପରାସ୍ତ ଶତ୍ରୁ",statsDistance:"ସର୍ବାଧିକ ଦୂରତା",statsScore:"ସର୍ବୋତ୍ତମ ସ୍କୋର",statsWorlds:"ସମାପ୍ତ ବିଶ୍ୱ",rebirthTitle:"ପୁନର୍ଜନ୍ମ!",rebirthBtn:"ପୁନର୍ଜନ୍ମ",rebirthLevelReset:"ସ୍ତର → 1",rebirthXpReset:"ଏକ୍ସପି → 0",rebirthWorldSame:"ବିଶ୍ୱ ସମାନ ରହିବ",rebirthXpBoost:"ଏକ୍ସପି +25%",controlsKeyboard:"କୀବୋର୍ଡ ନିୟନ୍ତ୍ରଣ",controlsTouch:"ସ୍ପର୍ଶ ନିୟନ୍ତ୍ରଣ",wrongMsg:"❌ ଭୁଲ! ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ!",critXp:"କ୍ରିଟିକାଲ ଏକ୍ସପି!",xpComboMsg:"ଏକ୍ସପି କମ୍ବୋ x{n}",bossDefeated:"ବିଶ୍ୱ {w} ବସ ପରାସ୍ତ!",chestOpened:"ବାକ୍ସ ଖୋଲିଲା!",teleported:"ଟେଲିପୋର୍ଟ ହେଲା!",coinCombo:"ମୁଦ୍ରା କମ୍ବୋ x{n}!",bossAppeared:"ବିଶ୍ୱ {w} ବସ ଦେଖାଗଲା!",rainbowEvent:"ଇନ୍ଦ୍ରଧନୁ ଇଭେଣ୍ଟ! ଏକ୍ସପି x2",meteorShower:"ଉଲ୍କାପାତ!",coinRain:"ମୁଦ୍ରା ବର୍ଷା!",enemySwarm:"ଶତ୍ରୁ ଝୁଣ୍ଡ!",progressReset:"ପ୍ରଗତି ପୁନଃସ୍ଥାପିତ!",achFirstCoin:"ପ୍ରଥମ ମୁଦ୍ରା",achRunner:"ଦୌଡ଼ାଳି 1000ମି",achMathGenius:"ଗଣିତ ପ୍ରତିଭା",achLevel100:"ସ୍ତର 100",achFirstRebirth:"ପ୍ରଥମ ପୁନର୍ଜନ୍ମ",achWorld50:"ବିଶ୍ୱ 50",invSpeed:"ବେଗ",invShield:"ଢାଲ",invMagnet:"ଚୁମ୍ବକ",invSuperJump:"ସୁପର ଡିଆଁ"}},
 my:{name:"မြန်မာ",t:{subtitle:"✨ V8.1 InDev — မြှင့်တင်ထားသော ဗားရှင်း",start:"စတင်ရန်",worlds:"ကမ္ဘာများ",achievements:"အောင်မြင်မှုများ",inventory:"ပစ္စည်းများ",stats:"စာရင်းအင်း",skins:"အသွင်များ",saveSlots:"သိမ်းဆည်းမှု နေရာများ",settings:"ဆက်တင်များ",close:"ပိတ်ရန်",music:"ဂီတ",sfx:"အသံအထူးထူးထင်ထင်",on:"ဖွင့်",off:"ပိတ်",hudLevel:"အဆင့်",hudXp:"အတွေ့အကြုံ",hudHp:"အသက်",hudCombo:"ကွမ်ဘို",pauseTitle:"ခေတ္တရပ်ထား",resume:"ဆက်လုပ်ရန်",mainMenu:"မီနူး",youDied:"သင်သေဆုံးပါပြီ!",answer:"ဖြေရန်",statsCoins:"စုစုပေါင်းရရှိသောဒင်္ဂါး",statsDeaths:"သေဆုံးမှု",statsCorrect:"မှန်ကန်သောအဖြေများ",statsWrong:"မှားယွင်းသောအဖြေများ",statsEnemies:"အနိုင်ယူထားသောရန်သူများ",statsDistance:"အဝေးဆုံးအကွာအဝေး",statsScore:"အကောင်းဆုံးရမှတ်",statsWorlds:"ပြီးစီးသောကမ္ဘာများ",rebirthTitle:"ပြန်လည်မွေးဖွားခြင်း!",rebirthBtn:"ပြန်လည်မွေးဖွား",rebirthLevelReset:"အဆင့် → 1",rebirthXpReset:"အတွေ့အကြုံ → 0",rebirthWorldSame:"ကမ္ဘာမှာမပြောင်းလဲပါ",rebirthXpBoost:"အတွေ့အကြုံ +25%",controlsKeyboard:"ကီးဘုတ်ထိန်းချုပ်မှု",controlsTouch:"တို့ထိထိန်းချုပ်မှု",wrongMsg:"❌ မှား! ထပ်စမ်းကြည့်ပါ!",critXp:"အရေးကြီးအတွေ့အကြုံ!",xpComboMsg:"အတွေ့အကြုံ ကွမ်ဘို x{n}",bossDefeated:"ကမ္ဘာ {w} ခေါင်းဆောင်ကို အနိုင်ရရှိသည်!",chestOpened:"သေတ္တာဖွင့်ပြီးပါပြီ!",teleported:"နေရာပြောင်းပြီးပါပြီ!",coinCombo:"ဒင်္ဂါး ကွမ်ဘို x{n}!",bossAppeared:"ကမ္ဘာ {w} ခေါင်းဆောင်ပေါ်လာသည်!",rainbowEvent:"သက်တံ့အဖြစ်အပျက်! အတွေ့အကြုံ x2",meteorShower:"ကြယ်ကျမိုး!",coinRain:"ဒင်္ဂါးမိုး!",enemySwarm:"ရန်သူအုပ်စု!",progressReset:"တိုးတက်မှု ပြန်လည်သတ်မှတ်ပြီးပါပြီ!",achFirstCoin:"ပထမဆုံးဒင်္ဂါး",achRunner:"ပြေးသူ 1000မီတာ",achMathGenius:"သင်္ချာပညာရှင်",achLevel100:"အဆင့် 100",achFirstRebirth:"ပထမဆုံးပြန်လည်မွေးဖွား",achWorld50:"ကမ္ဘာ 50",invSpeed:"အမြန်နှုန်း",invShield:"အကာအကွယ်",invMagnet:"သံလိုက်",invSuperJump:"ထူးခြားသောခုန်ခြင်း"}},
 bho:{name:"भोजपुरी",t:{subtitle:"✨ V8.1 इनडेव — बढ़ल संस्करण",start:"शुरू करीं",worlds:"दुनिया",achievements:"उपलब्धि",inventory:"सामान",stats:"आँकड़ा",skins:"स्किन",saveSlots:"सेव स्लॉट",settings:"सेटिंग",close:"बंद करीं",music:"संगीत",sfx:"आवाज असर",on:"चालू",off:"बंद",hudLevel:"लेवल",hudXp:"एक्सपी",hudHp:"एचपी",hudCombo:"कॉम्बो",pauseTitle:"रोकल गइल",resume:"जारी राखीं",mainMenu:"मेनू",youDied:"रउआ मर गइनी!",answer:"जवाब दीं",statsCoins:"कुल जमा कइल सिक्का",statsDeaths:"मउत",statsCorrect:"सही जवाब",statsWrong:"गलत जवाब",statsEnemies:"हराइल गइल दुश्मन",statsDistance:"सबसे दूर दूरी",statsScore:"बेहतरीन स्कोर",statsWorlds:"पूरा भइल दुनिया",rebirthTitle:"पुनर्जन्म!",rebirthBtn:"पुनर्जन्म",rebirthLevelReset:"लेवल → 1",rebirthXpReset:"एक्सपी → 0",rebirthWorldSame:"दुनिया ओहीजा रहिहे",rebirthXpBoost:"एक्सपी +25%",controlsKeyboard:"कीबोर्ड नियंत्रण",controlsTouch:"टच नियंत्रण",wrongMsg:"❌ गलत! फेर कोशिश करीं!",critXp:"क्रिटिकल एक्सपी!",xpComboMsg:"एक्सपी कॉम्बो x{n}",bossDefeated:"वर्ल्ड {w} बॉस हार गइल!",chestOpened:"चेस्ट खुल गइल!",teleported:"टेलीपोर्ट भइल!",coinCombo:"कॉइन कॉम्बो x{n}!",bossAppeared:"वर्ल्ड {w} बॉस दिखाई देलक!",rainbowEvent:"रंगधनुष इवेंट! एक्सपी x2",meteorShower:"उल्का बारिश!",coinRain:"सिक्का बारिश!",enemySwarm:"दुश्मन के झुंड!",progressReset:"प्रगति रीसेट भइल!",achFirstCoin:"पहिला सिक्का",achRunner:"धावक 1000मी",achMathGenius:"गणित प्रतिभा",achLevel100:"लेवल 100",achFirstRebirth:"पहिला पुनर्जन्म",achWorld50:"वर्ल्ड 50",invSpeed:"गति",invShield:"ढाल",invMagnet:"चुंबक",invSuperJump:"सुपर जंप"}},
 uz:{name:"Oʻzbekcha",t:{subtitle:"✨ V8.1 InDev — Kengaytirilgan nashr",start:"BOSHLASH",worlds:"DUNYOLAR",achievements:"YUTUQLAR",inventory:"INVENTAR",stats:"STATISTIKA",skins:"KO'RINISHLAR",saveSlots:"SAQLASH JOYLARI",settings:"SOZLAMALAR",close:"YOPISH",music:"Musiqa",sfx:"Tovush effektlari",on:"YONIQ",off:"OʻCHIQ",hudLevel:"Daraja",hudXp:"XP",hudHp:"HP",hudCombo:"Kombo",pauseTitle:"TO'XTATILDI",resume:"DAVOM ETISH",mainMenu:"MENYU",youDied:"SIZ O'LDINGIZ!",answer:"JAVOB BERISH",statsCoins:"Jami yig'ilgan tangalar",statsDeaths:"O'limlar",statsCorrect:"To'g'ri javoblar",statsWrong:"Noto'g'ri javoblar",statsEnemies:"Mag'lub qilingan dushmanlar",statsDistance:"Eng uzoq masofa",statsScore:"Eng yaxshi natija",statsWorlds:"Tugallangan dunyolar",rebirthTitle:"QAYTA TUG'ILISH!",rebirthBtn:"QAYTA TUG'ILISH",rebirthLevelReset:"Daraja → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Dunyo bir xil qoladi",rebirthXpBoost:"XP +25%",controlsKeyboard:"KLAVIATURA BOSHQARUVI",controlsTouch:"TEGISH BOSHQARUVI",wrongMsg:"❌ Xato! Qayta urinib ko'ring!",critXp:"MUHIM XP!",xpComboMsg:"XP KOMBOSI x{n}",bossDefeated:"DUNYO {w} BOSSI MAG'LUB QILINDI!",chestOpened:"SANDIQ OCHILDI!",teleported:"TELEPORT QILINDI!",coinCombo:"TANGA KOMBOSI x{n}!",bossAppeared:"DUNYO {w} BOSSI PAYDO BO'LDI!",rainbowEvent:"KAMALAK TADBIRI! XP x2",meteorShower:"METEOR YOMG'IRI!",coinRain:"TANGA YOMG'IRI!",enemySwarm:"DUSHMAN TO'DASI!",progressReset:"JARAYON QAYTA O'RNATILDI!",achFirstCoin:"Birinchi Tanga",achRunner:"Yugurchi 1000m",achMathGenius:"Matematika Dahosi",achLevel100:"Daraja 100",achFirstRebirth:"Birinchi Qayta Tug'ilish",achWorld50:"Dunyo 50",invSpeed:"Tezlik",invShield:"Qalqon",invMagnet:"Magnit",invSuperJump:"Super Sakrash"}},
 ig:{name:"Igbo",t:{subtitle:"✨ V8.1 InDev — Mbipụta Kaziri",start:"MALITE",worlds:"ỤWA",achievements:"IHE ỊRỤPỤTA",inventory:"NGWA AKỤ",stats:"ỌNỤ ỌGỤGỤ",skins:"AKPỤKPỌ",saveSlots:"EBE NCHEKWA",settings:"NTỌALA",close:"MECHIE",music:"Egwú",sfx:"Mmetụta ụda",on:"GBANYE",off:"GBANYỤ",hudLevel:"Ọkwa",hudXp:"XP",hudHp:"Ahụike",hudCombo:"Kọmbo",pauseTitle:"AKWỤSỊLA",resume:"GAA N'IHU",mainMenu:"ndepụta nhọrọ",youDied:"Ị NWỤRỤ!",answer:"ZAA",statsCoins:"Mkpokọta mkpụrụ ego achịkọtara",statsDeaths:"Ọnwụ",statsCorrect:"Azịza ziri ezi",statsWrong:"Azịza na-ezighi ezi",statsEnemies:"Ndị iro e meriri",statsDistance:"Anya kachasị",statsScore:"Isi mkpụrụ kacha mma",statsWorlds:"Ụwa ndị emechara",rebirthTitle:"ỌMỤMỤ ỌHỤRỤ!",rebirthBtn:"MỤA ỌZỌ",rebirthLevelReset:"Ọkwa → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Ụwa ga-adịgide",rebirthXpBoost:"XP +25%",controlsKeyboard:"NJIKWA KIBOOD",controlsTouch:"NJIKWA MMETU",wrongMsg:"❌ Ezighi ezi! Nwaa ọzọ!",critXp:"XP Dị MKPA!",xpComboMsg:"KỌMBO XP x{n}",bossDefeated:"E MERIRI ONYE ISI ỤWA {w}!",chestOpened:"E MEGHERE IGBOKWU!",teleported:"E BUGHARIRI GỊ!",coinCombo:"KỌMBO EGO x{n}!",bossAppeared:"ONYE ISI ỤWA {w} PỤTARA!",rainbowEvent:"MMEME EGWURUEGWU! XP x2",meteorShower:"MMIRI KIPUTA IGWE!",coinRain:"MMIRI EGO!",enemySwarm:"IGWE NDỊ IRO!",progressReset:"E TỌGHATARA ỌGANIHU!",achFirstCoin:"Mkpụrụ Ego Mbụ",achRunner:"Ọgba Ọsọ 1000m",achMathGenius:"Onye Ọka Mgbakọ",achLevel100:"Ọkwa 100",achFirstRebirth:"Ọmụmụ Ọhụrụ Mbụ",achWorld50:"Ụwa 50",invSpeed:"Ọsọ",invShield:"Ọta",invMagnet:"Magnet",invSuperJump:"Super Mbaba"}},
 ro:{name:"Română",t:{subtitle:"✨ V8.1 InDev — Ediție Îmbunătățită",start:"START",worlds:"LUMI",achievements:"REALIZĂRI",inventory:"INVENTAR",stats:"STATISTICI",skins:"APARENȚE",saveSlots:"SLOTURI DE SALVARE",settings:"SETĂRI",close:"ÎNCHIDE",music:"Muzică",sfx:"Efecte Sonore",on:"PORNIT",off:"OPRIT",hudLevel:"Niv",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"PAUZĂ",resume:"CONTINUĂ",mainMenu:"MENIU",youDied:"AI MURIT!",answer:"RĂSPUNDE",statsCoins:"Total monede colectate",statsDeaths:"Decese",statsCorrect:"Răspunsuri corecte",statsWrong:"Răspunsuri greșite",statsEnemies:"Inamici învinși",statsDistance:"Distanța maximă",statsScore:"Cel mai bun scor",statsWorlds:"Lumi finalizate",rebirthTitle:"RENAȘTERE!",rebirthBtn:"RENAȘTE",rebirthLevelReset:"Nivel → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Lumea rămâne aceeași",rebirthXpBoost:"XP +25%",controlsKeyboard:"CONTROALE TASTATURĂ",controlsTouch:"CONTROALE TACTILE",wrongMsg:"❌ Greșit! Încearcă din nou!",critXp:"XP CRITIC!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"ȘEFUL LUMII {w} ÎNVINS!",chestOpened:"CUFĂR DESCHIS!",teleported:"TELEPORTAT!",coinCombo:"COMBO MONEDE x{n}!",bossAppeared:"ȘEFUL LUMII {w} A APĂRUT!",rainbowEvent:"EVENIMENT CURCUBEU! XP x2",meteorShower:"PLOAIE DE METEORIȚI!",coinRain:"PLOAIE DE MONEDE!",enemySwarm:"ROI DE INAMICI!",progressReset:"PROGRES RESETAT!",achFirstCoin:"Prima Monedă",achRunner:"Alergător 1000m",achMathGenius:"Geniu la Matematică",achLevel100:"Nivel 100",achFirstRebirth:"Prima Renaștere",achWorld50:"Lumea 50",invSpeed:"Viteză",invShield:"Scut",invMagnet:"Magnet",invSuperJump:"Super Săritură"}},
 ne:{name:"नेपाली",t:{subtitle:"✨ V8.1 इनडेभ — सुधारिएको संस्करण",start:"सुरु गर्नुहोस्",worlds:"संसारहरू",achievements:"उपलब्धिहरू",inventory:"सामान",stats:"तथ्याङ्क",skins:"स्किनहरू",saveSlots:"सेभ स्लटहरू",settings:"सेटिङहरू",close:"बन्द गर्नुहोस्",music:"संगीत",sfx:"ध्वनि प्रभावहरू",on:"अन",off:"अफ",hudLevel:"लेभल",hudXp:"एक्सपी",hudHp:"एचपी",hudCombo:"कम्बो",pauseTitle:"रोकिएको",resume:"जारी राख्नुहोस्",mainMenu:"मेनु",youDied:"तपाईं मर्नुभयो!",answer:"जवाफ दिनुहोस्",statsCoins:"कुल सङ्कलन गरिएका सिक्काहरू",statsDeaths:"मृत्यु",statsCorrect:"सही जवाफहरू",statsWrong:"गलत जवाफहरू",statsEnemies:"पराजित शत्रुहरू",statsDistance:"सबैभन्दा टाढाको दूरी",statsScore:"उत्कृष्ट स्कोर",statsWorlds:"पूरा भएका संसारहरू",rebirthTitle:"पुनर्जन्म!",rebirthBtn:"पुनर्जन्म",rebirthLevelReset:"लेभल → 1",rebirthXpReset:"एक्सपी → 0",rebirthWorldSame:"संसार उस्तै रहन्छ",rebirthXpBoost:"एक्सपी +25%",controlsKeyboard:"किबोर्ड नियन्त्रणहरू",controlsTouch:"टच नियन्त्रणहरू",wrongMsg:"❌ गलत! फेरि प्रयास गर्नुहोस्!",critXp:"क्रिटिकल एक्सपी!",xpComboMsg:"एक्सपी कम्बो x{n}",bossDefeated:"संसार {w} बस पराजित!",chestOpened:"बाकस खोलियो!",teleported:"टेलिपोर्ट भयो!",coinCombo:"सिक्का कम्बो x{n}!",bossAppeared:"संसार {w} बस देखा पर्‍यो!",rainbowEvent:"इन्द्रेणी घटना! एक्सपी x2",meteorShower:"उल्का वर्षा!",coinRain:"सिक्का वर्षा!",enemySwarm:"शत्रुको हुल!",progressReset:"प्रगति रिसेट भयो!",achFirstCoin:"पहिलो सिक्का",achRunner:"धावक 1000मी",achMathGenius:"गणित प्रतिभा",achLevel100:"लेभल 100",achFirstRebirth:"पहिलो पुनर्जन्म",achWorld50:"संसार 50",invSpeed:"गति",invShield:"ढाल",invMagnet:"चुम्बक",invSuperJump:"सुपर जम्प"}},
 si:{name:"සිංහල",t:{subtitle:"✨ V8.1 InDev — වැඩිදියුණු කළ සංස්කරණය",start:"ආරම්භ කරන්න",worlds:"ලෝක",achievements:"ජයග්‍රහණ",inventory:"ද්‍රව්‍ය ලැයිස්තුව",stats:"සංඛ්‍යාලේඛන",skins:"හම්",saveSlots:"සුරැකුම් ස්ලොට්",settings:"සැකසුම්",close:"වසන්න",music:"සංගීතය",sfx:"ශබ්ද ප්‍රතිඵල",on:"ක්‍රියාත්මකයි",off:"අක්‍රියයි",hudLevel:"මට්ටම",hudXp:"XP",hudHp:"සෞඛ්‍යය",hudCombo:"කොම්බෝ",pauseTitle:"විරාමයි",resume:"දිගටම කරගෙන යන්න",mainMenu:"මෙනුව",youDied:"ඔබ මිය ගියා!",answer:"පිළිතුරු දෙන්න",statsCoins:"එකතු කළ මුළු කාසි",statsDeaths:"මරණ",statsCorrect:"නිවැරදි පිළිතුරු",statsWrong:"වැරදි පිළිතුරු",statsEnemies:"පරාජය කළ සතුරන්",statsDistance:"වැඩිම දුර",statsScore:"හොඳම ලකුණු",statsWorlds:"සම්පූර්ණ කළ ලෝක",rebirthTitle:"පුනර්ජන්මය!",rebirthBtn:"පුනර්ජන්මය",rebirthLevelReset:"මට්ටම → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"ලෝකය එලෙසම පවතී",rebirthXpBoost:"XP +25%",controlsKeyboard:"යතුරුපුවරු පාලන",controlsTouch:"ස්පර්ශ පාලන",wrongMsg:"❌ වැරදියි! නැවත උත්සාහ කරන්න!",critXp:"තීරණාත්මක XP!",xpComboMsg:"XP කොම්බෝ x{n}",bossDefeated:"ලෝක {w} බොස් පරාජිත විය!",chestOpened:"පෙට්ටිය විවෘත විය!",teleported:"ටෙලිපෝට් විය!",coinCombo:"කාසි කොම්බෝ x{n}!",bossAppeared:"ලෝක {w} බොස් පෙනී සිටියේය!",rainbowEvent:"දේදුන්න සිදුවීම! XP x2",meteorShower:"උල්කා වර්ෂාව!",coinRain:"කාසි වර්ෂාව!",enemySwarm:"සතුරු රංචුව!",progressReset:"ප්‍රගතිය යළි පිහිටුවන ලදී!",achFirstCoin:"පළමු කාසිය",achRunner:"ධාවකයා 1000මී",achMathGenius:"ගණිත මේධාවියා",achLevel100:"මට්ටම 100",achFirstRebirth:"පළමු පුනර්ජන්මය",achWorld50:"ලෝකය 50",invSpeed:"වේගය",invShield:"පලිහ",invMagnet:"චුම්බකය",invSuperJump:"සුපිරි පැනීම"}},
 ms:{name:"Bahasa Melayu",t:{subtitle:"✨ V8.1 InDev — Edisi Dipertingkat",start:"MULA",worlds:"DUNIA",achievements:"PENCAPAIAN",inventory:"INVENTORI",stats:"STATISTIK",skins:"KULIT",saveSlots:"SLOT SIMPAN",settings:"TETAPAN",close:"TUTUP",music:"Muzik",sfx:"Kesan Bunyi",on:"HIDUP",off:"MATI",hudLevel:"Lv",hudXp:"XP",hudHp:"HP",hudCombo:"Gabungan",pauseTitle:"DIHENTIKAN SEKETIKA",resume:"SAMBUNG",mainMenu:"MENU",youDied:"ANDA MATI!",answer:"JAWAB",statsCoins:"Jumlah syiling dikumpul",statsDeaths:"Kematian",statsCorrect:"Jawapan betul",statsWrong:"Jawapan salah",statsEnemies:"Musuh dikalahkan",statsDistance:"Jarak terjauh",statsScore:"Skor terbaik",statsWorlds:"Dunia selesai",rebirthTitle:"KELAHIRAN SEMULA!",rebirthBtn:"LAHIR SEMULA",rebirthLevelReset:"Tahap → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Dunia kekal sama",rebirthXpBoost:"XP +25%",controlsKeyboard:"KAWALAN PAPAN KEKUNCI",controlsTouch:"KAWALAN SENTUH",wrongMsg:"❌ Salah! Cuba lagi!",critXp:"XP KRITIKAL!",xpComboMsg:"GABUNGAN XP x{n}",bossDefeated:"BOS DUNIA {w} DIKALAHKAN!",chestOpened:"PETI DIBUKA!",teleported:"DITELEPORT!",coinCombo:"GABUNGAN SYILING x{n}!",bossAppeared:"BOS DUNIA {w} MUNCUL!",rainbowEvent:"ACARA PELANGI! XP x2",meteorShower:"HUJAN METEOR!",coinRain:"HUJAN SYILING!",enemySwarm:"KAWANAN MUSUH!",progressReset:"KEMAJUAN DITETAPKAN SEMULA!",achFirstCoin:"Syiling Pertama",achRunner:"Pelari 1000m",achMathGenius:"Genius Matematik",achLevel100:"Tahap 100",achFirstRebirth:"Kelahiran Semula Pertama",achWorld50:"Dunia 50",invSpeed:"Kelajuan",invShield:"Perisai",invMagnet:"Magnet",invSuperJump:"Lompatan Super"}},
 zu:{name:"isiZulu",t:{subtitle:"✨ V8.1 InDev — Uhlelo Oluthuthukisiwe",start:"QALA",worlds:"IZWE",achievements:"IMPUMELELO",inventory:"IMPAHLA",stats:"IZIBALO",skins:"IZIKHUMBA",saveSlots:"IZINDAWO ZOKUGCINA",settings:"IZILUNGISELELO",close:"VALA",music:"UMCULO",sfx:"IMIPHUMELA YOMSINDO",on:"VULIWE",off:"VALIWE",hudLevel:"Izinga",hudXp:"XP",hudHp:"Impilo",hudCombo:"Ikhomba",pauseTitle:"KUMISIWE",resume:"QHUBEKA",mainMenu:"IMENYU",youDied:"USHONILE!",answer:"PHENDULA",statsCoins:"Sisonke izinhlamvu ezibuthiwe",statsDeaths:"Ukufa",statsCorrect:"Izimpendulo eziqondile",statsWrong:"Izimpendulo ezingalungile",statsEnemies:"Izitha ezehluliwe",statsDistance:"Ibanga elikude kakhulu",statsScore:"Amaphuzu angcono kakhulu",statsWorlds:"Amazwe aqediwe",rebirthTitle:"UKUZALWA KABUSHA!",rebirthBtn:"ZALWA KABUSHA",rebirthLevelReset:"Izinga → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Izwe lihlala lifana",rebirthXpBoost:"XP +25%",controlsKeyboard:"UKULAWULA IKIBOARD",controlsTouch:"UKULAWULA NGOKUTHINTA",wrongMsg:"❌ Kuphutha! Zama futhi!",critXp:"I-XP EBALULEKILE!",xpComboMsg:"IKHOMBA LE-XP x{n}",bossDefeated:"IBHOSI LEZWE {w} LINQOBIWE!",chestOpened:"IBHOKISI LIVULIWE!",teleported:"USETHULWE!",coinCombo:"IKHOMBA LEZINHLAMVU x{n}!",bossAppeared:"IBHOSI LEZWE {w} LIVELE!",rainbowEvent:"UMCIMBI WETHOLOKOSI! XP x2",meteorShower:"IMVULA YENKANYEZI!",coinRain:"IMVULA YEZINHLAMVU!",enemySwarm:"IQOQO LEZITHA!",progressReset:"INQUBEKELA PHAMBILI ISETHIWE KABUSHA!",achFirstCoin:"Uhlamvu Lokuqala",achRunner:"Umgijimi 1000m",achMathGenius:"Iqhawe Lezibalo",achLevel100:"Izinga 100",achFirstRebirth:"Ukuzalwa Kabusha Kokuqala",achWorld50:"Izwe 50",invSpeed:"Isivinini",invShield:"Isihlangu",invMagnet:"Umagnethi",invSuperJump:"Ukugxuma Okukhulu"}},
 hu:{name:"Magyar",t:{subtitle:"✨ V8.1 InDev — Bővített Kiadás",start:"INDÍTÁS",worlds:"VILÁGOK",achievements:"EREDMÉNYEK",inventory:"LELTÁR",stats:"STATISZTIKA",skins:"KINÉZETEK",saveSlots:"MENTÉSI HELYEK",settings:"BEÁLLÍTÁSOK",close:"BEZÁRÁS",music:"Zene",sfx:"Hanghatások",on:"BE",off:"KI",hudLevel:"Szint",hudXp:"XP",hudHp:"HP",hudCombo:"Kombó",pauseTitle:"SZÜNET",resume:"FOLYTATÁS",mainMenu:"MENÜ",youDied:"MEGHALTÁL!",answer:"VÁLASZOLJ",statsCoins:"Összegyűjtött érmék",statsDeaths:"Halálok",statsCorrect:"Helyes válaszok",statsWrong:"Helytelen válaszok",statsEnemies:"Legyőzött ellenségek",statsDistance:"Legnagyobb távolság",statsScore:"Legjobb pontszám",statsWorlds:"Teljesített világok",rebirthTitle:"ÚJJÁSZÜLETÉS!",rebirthBtn:"ÚJJÁSZÜLETÉS",rebirthLevelReset:"Szint → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"A világ ugyanaz marad",rebirthXpBoost:"XP +25%",controlsKeyboard:"BILLENTYŰZET IRÁNYÍTÁS",controlsTouch:"ÉRINTÉSVEZÉRLÉS",wrongMsg:"❌ Rossz! Próbáld újra!",critXp:"KRITIKUS XP!",xpComboMsg:"XP KOMBÓ x{n}",bossDefeated:"{w}. VILÁG FŐNÖKE LEGYŐZVE!",chestOpened:"LÁDA KINYITVA!",teleported:"TELEPORTÁLVA!",coinCombo:"ÉRME KOMBÓ x{n}!",bossAppeared:"{w}. VILÁG FŐNÖKE MEGJELENT!",rainbowEvent:"SZIVÁRVÁNY ESEMÉNY! XP x2",meteorShower:"METEORZÁPOR!",coinRain:"ÉRMEESŐ!",enemySwarm:"ELLENSÉG RAJ!",progressReset:"HALADÁS VISSZAÁLLÍTVA!",achFirstCoin:"Első Érme",achRunner:"Futó 1000m",achMathGenius:"Matek Zseni",achLevel100:"100. Szint",achFirstRebirth:"Első Újjászületés",achWorld50:"50. Világ",invSpeed:"Sebesség",invShield:"Pajzs",invMagnet:"Mágnes",invSuperJump:"Szuperugrás"}},
 el:{name:"Ελληνικά",t:{subtitle:"✨ V8.1 InDev — Βελτιωμένη Έκδοση",start:"ΕΝΑΡΞΗ",worlds:"ΚΟΣΜΟΙ",achievements:"ΕΠΙΤΕΥΓΜΑΤΑ",inventory:"ΑΠΟΘΗΚΗ",stats:"ΣΤΑΤΙΣΤΙΚΑ",skins:"ΕΜΦΑΝΙΣΕΙΣ",saveSlots:"ΘΕΣΕΙΣ ΑΠΟΘΗΚΕΥΣΗΣ",settings:"ΡΥΘΜΙΣΕΙΣ",close:"ΚΛΕΙΣΙΜΟ",music:"Μουσική",sfx:"Ηχητικά Εφέ",on:"ΕΝΕΡΓΟ",off:"ΑΝΕΝΕΡΓΟ",hudLevel:"Επ",hudXp:"XP",hudHp:"HP",hudCombo:"Κόμπο",pauseTitle:"ΣΕ ΠΑΥΣΗ",resume:"ΣΥΝΕΧΕΙΑ",mainMenu:"ΜΕΝΟΥ",youDied:"ΠΕΘΑΝΕΣ!",answer:"ΑΠΑΝΤΗΣΕ",statsCoins:"Σύνολο συλλεγμένων νομισμάτων",statsDeaths:"Θάνατοι",statsCorrect:"Σωστές απαντήσεις",statsWrong:"Λάθος απαντήσεις",statsEnemies:"Νικημένοι εχθροί",statsDistance:"Μέγιστη απόσταση",statsScore:"Καλύτερη βαθμολογία",statsWorlds:"Ολοκληρωμένοι κόσμοι",rebirthTitle:"ΑΝΑΓΕΝΝΗΣΗ!",rebirthBtn:"ΑΝΑΓΕΝΝΗΣΟΥ",rebirthLevelReset:"Επίπεδο → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Ο κόσμος παραμένει ίδιος",rebirthXpBoost:"XP +25%",controlsKeyboard:"ΧΕΙΡΙΣΤΗΡΙΑ ΠΛΗΚΤΡΟΛΟΓΙΟΥ",controlsTouch:"ΧΕΙΡΙΣΤΗΡΙΑ ΑΦΗΣ",wrongMsg:"❌ Λάθος! Προσπάθησε ξανά!",critXp:"ΚΡΙΣΙΜΟ XP!",xpComboMsg:"COMBO XP x{n}",bossDefeated:"Ο ΑΡΧΗΓΟΣ ΤΟΥ ΚΟΣΜΟΥ {w} ΝΙΚΗΘΗΚΕ!",chestOpened:"ΤΟ ΣΕΝΤΟΥΚΙ ΑΝΟΙΞΕ!",teleported:"ΤΗΛΕΜΕΤΑΦΕΡΘΗΚΕΣ!",coinCombo:"COMBO ΝΟΜΙΣΜΑΤΩΝ x{n}!",bossAppeared:"Ο ΑΡΧΗΓΟΣ ΤΟΥ ΚΟΣΜΟΥ {w} ΕΜΦΑΝΙΣΤΗΚΕ!",rainbowEvent:"ΓΕΓΟΝΟΣ ΟΥΡΑΝΙΟΥ ΤΟΞΟΥ! XP x2",meteorShower:"ΒΡΟΧΗ ΜΕΤΕΩΡΙΤΩΝ!",coinRain:"ΒΡΟΧΗ ΝΟΜΙΣΜΑΤΩΝ!",enemySwarm:"ΣΜΗΝΟΣ ΕΧΘΡΩΝ!",progressReset:"Η ΠΡΟΟΔΟΣ ΕΠΑΝΑΦΕΡΘΗΚΕ!",achFirstCoin:"Πρώτο Νόμισμα",achRunner:"Δρομέας 1000μ",achMathGenius:"Ιδιοφυΐα Μαθηματικών",achLevel100:"Επίπεδο 100",achFirstRebirth:"Πρώτη Αναγέννηση",achWorld50:"Κόσμος 50",invSpeed:"Ταχύτητα",invShield:"Ασπίδα",invMagnet:"Μαγνήτης",invSuperJump:"Υπεράλμα"}},
 cs:{name:"Čeština",t:{subtitle:"✨ V8.1 InDev — Vylepšená edice",start:"START",worlds:"SVĚTY",achievements:"ÚSPĚCHY",inventory:"INVENTÁŘ",stats:"STATISTIKY",skins:"VZHLEDY",saveSlots:"ULOŽENÉ POZICE",settings:"NASTAVENÍ",close:"ZAVŘÍT",music:"Hudba",sfx:"Zvukové efekty",on:"ZAPNUTO",off:"VYPNUTO",hudLevel:"Úr",hudXp:"XP",hudHp:"HP",hudCombo:"Combo",pauseTitle:"POZASTAVENO",resume:"POKRAČOVAT",mainMenu:"MENU",youDied:"ZEMŘEL JSI!",answer:"ODPOVĚDĚT",statsCoins:"Celkem nasbíraných mincí",statsDeaths:"Úmrtí",statsCorrect:"Správné odpovědi",statsWrong:"Špatné odpovědi",statsEnemies:"Poražení nepřátelé",statsDistance:"Nejdelší vzdálenost",statsScore:"Nejlepší skóre",statsWorlds:"Dokončené světy",rebirthTitle:"ZNOVUZROZENÍ!",rebirthBtn:"ZNOVUZRODIT SE",rebirthLevelReset:"Úroveň → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Svět zůstává stejný",rebirthXpBoost:"XP +25%",controlsKeyboard:"OVLÁDÁNÍ KLÁVESNICÍ",controlsTouch:"DOTYKOVÉ OVLÁDÁNÍ",wrongMsg:"❌ Špatně! Zkus to znovu!",critXp:"KRITICKÉ XP!",xpComboMsg:"XP COMBO x{n}",bossDefeated:"BOSS SVĚTA {w} PORAŽEN!",chestOpened:"TRUHLA OTEVŘENA!",teleported:"TELEPORTOVÁNO!",coinCombo:"COMBO MINCÍ x{n}!",bossAppeared:"BOSS SVĚTA {w} SE OBJEVIL!",rainbowEvent:"DUHOVÁ UDÁLOST! XP x2",meteorShower:"METEORICKÝ DÉŠŤ!",coinRain:"DÉŠŤ MINCÍ!",enemySwarm:"ROJ NEPŘÁTEL!",progressReset:"POSTUP RESETOVÁN!",achFirstCoin:"První Mince",achRunner:"Běžec 1000m",achMathGenius:"Matematický Génius",achLevel100:"Úroveň 100",achFirstRebirth:"První Znovuzrození",achWorld50:"Svět 50",invSpeed:"Rychlost",invShield:"Štít",invMagnet:"Magnet",invSuperJump:"Super Skok"}},
 sr:{name:"Српски",t:{subtitle:"✨ V8.1 InDev — Побољшано издање",start:"СТАРТ",worlds:"СВЕТОВИ",achievements:"ДОСТИГНУЋА",inventory:"ИНВЕНТАР",stats:"СТАТИСТИКА",skins:"ИЗГЛЕДИ",saveSlots:"МЕСТА ЗА ЧУВАЊЕ",settings:"ПОДЕШАВАЊА",close:"ЗАТВОРИ",music:"Музика",sfx:"Звучни ефекти",on:"УКЉУЧЕНО",off:"ИСКЉУЧЕНО",hudLevel:"Ниво",hudXp:"XP",hudHp:"ХП",hudCombo:"Комбо",pauseTitle:"ПАУЗИРАНО",resume:"НАСТАВИ",mainMenu:"МЕНИ",youDied:"УМРО СИ!",answer:"ОДГОВОРИ",statsCoins:"Укупно сакупљених новчића",statsDeaths:"Смрти",statsCorrect:"Тачни одговори",statsWrong:"Погрешни одговори",statsEnemies:"Поражени непријатељи",statsDistance:"Највећа удаљеност",statsScore:"Најбољи резултат",statsWorlds:"Завршени светови",rebirthTitle:"ПОНОВНО РОЂЕЊЕ!",rebirthBtn:"ПОНОВО СЕ РОДИ",rebirthLevelReset:"Ниво → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Свет остаје исти",rebirthXpBoost:"XP +25%",controlsKeyboard:"КОНТРОЛЕ ТАСТАТУРЕ",controlsTouch:"ДОДИРНЕ КОНТРОЛЕ",wrongMsg:"❌ Погрешно! Покушај поново!",critXp:"КРИТИЧНИ XP!",xpComboMsg:"КОМБО XP x{n}",bossDefeated:"БОС СВЕТА {w} ПОРАЖЕН!",chestOpened:"САНДУК ОТВОРЕН!",teleported:"ТЕЛЕПОРТОВАН!",coinCombo:"КОМБО НОВЧИЋА x{n}!",bossAppeared:"БОС СВЕТА {w} СЕ ПОЈАВИО!",rainbowEvent:"ДОГАЂАЈ ДУГЕ! XP x2",meteorShower:"КИША МЕТЕОРА!",coinRain:"КИША НОВЧИЋА!",enemySwarm:"РОЈ НЕПРИЈАТЕЉА!",progressReset:"НАПРЕДАК РЕСЕТОВАН!",achFirstCoin:"Први Новчић",achRunner:"Тркач 1000м",achMathGenius:"Математички Геније",achLevel100:"Ниво 100",achFirstRebirth:"Прво Поновно Рођење",achWorld50:"Свет 50",invSpeed:"Брзина",invShield:"Штит",invMagnet:"Магнет",invSuperJump:"Супер Скок"}},
 so:{name:"Soomaali",t:{subtitle:"✨ V8.1 InDev — Nooc La Hagaajiyay",start:"BILOW",worlds:"ADDUUNYADA",achievements:"GUULAHA",inventory:"ALAABTA",stats:"TIRAKOOB",skins:"MAQAARADA",saveSlots:"MEELAHA KAYDINTA",settings:"DEJINTA",close:"XIR",music:"Muusig",sfx:"Saameynta Codka",on:"SHIDAN",off:"DEMIN",hudLevel:"Heerka",hudXp:"XP",hudHp:"Caafimaad",hudCombo:"Isku-xir",pauseTitle:"LA JOOJIYAY",resume:"SII WAD",mainMenu:"MENU",youDied:"WAAD DHIMATAY!",answer:"KA JAWAAB",statsCoins:"Wadarta lacagaha la ururiyay",statsDeaths:"Dhimasho",statsCorrect:"Jawaabaha saxda ah",statsWrong:"Jawaabaha khaldan",statsEnemies:"Cadaawayaasha la jabiyay",statsDistance:"Masaafada ugu fog",statsScore:"Dhibcaha ugu fiican",statsWorlds:"Adduunyada la dhammeeyay",rebirthTitle:"DHALASHO CUSUB!",rebirthBtn:"DHASH MAR KALE",rebirthLevelReset:"Heerka → 1",rebirthXpReset:"XP → 0",rebirthWorldSame:"Adduunku wuu isku mid ahaanayaa",rebirthXpBoost:"XP +25%",controlsKeyboard:"XAKAMEYNTA KIBOORKA",controlsTouch:"XAKAMEYNTA TABASHADA",wrongMsg:"❌ Khalad! Isku day mar kale!",critXp:"XP MUHIIM AH!",xpComboMsg:"ISKU-XIRKA XP x{n}",bossDefeated:"MADAXA ADDUUNKA {w} WAA LA JABIYAY!",chestOpened:"SANDUUQA WAA LA FURAY!",teleported:"WAA LA GUDBIYAY!",coinCombo:"ISKU-XIRKA LACAGTA x{n}!",bossAppeared:"MADAXA ADDUUNKA {w} WAA MUUQDAY!",rainbowEvent:"DHACDADA QAANSADA ROOBKA! XP x2",meteorShower:"ROOBKA XIDDIGAHA!",coinRain:"ROOBKA LACAGTA!",enemySwarm:"XOOGAAGA CADAAWAHA!",progressReset:"HORUMARKA WAA LA DIB-U-DEJIYAY!",achFirstCoin:"Lacagta Ugu Horeysa",achRunner:"Ordaha 1000m",achMathGenius:"Garaadka Xisaabta",achLevel100:"Heerka 100",achFirstRebirth:"Dhalashada Cusub Ee Ugu Horeysa",achWorld50:"Adduunka 50",invSpeed:"Xawaare",invShield:"Gaashaan",invMagnet:"Birlab",invSuperJump:"Boodid Fiican"}},
 as:{name:"অসমীয়া",t:{subtitle:"✨ V8.1 ইনডেভ — উন্নত সংস্কৰণ",start:"আৰম্ভ কৰক",worlds:"বিশ্ব",achievements:"সাফল্য",inventory:"বস্তু তালিকা",stats:"পৰিসংখ্যা",skins:"স্কিন",saveSlots:"ছেভ স্লট",settings:"ছেটিংছ",close:"বন্ধ কৰক",music:"সংগীত",sfx:"শব্দ প্ৰভাৱ",on:"অন",off:"অফ",hudLevel:"স্তৰ",hudXp:"এক্সপি",hudHp:"এইচপি",hudCombo:"কম্বো",pauseTitle:"বিৰতি",resume:"অব্যাহত ৰাখক",mainMenu:"মেনু",youDied:"আপুনি মৃত্যু হ'ল!",answer:"উত্তৰ দিয়ক",statsCoins:"মুঠ সংগ্ৰহ কৰা মুদ্ৰা",statsDeaths:"মৃত্যু",statsCorrect:"শুদ্ধ উত্তৰ",statsWrong:"ভুল উত্তৰ",statsEnemies:"পৰাজিত শত্ৰু",statsDistance:"সৰ্বাধিক দূৰত্ব",statsScore:"সৰ্বোত্তম স্ক'ৰ",statsWorlds:"সম্পূৰ্ণ বিশ্ব",rebirthTitle:"পুনৰ্জন্ম!",rebirthBtn:"পুনৰ্জন্ম",rebirthLevelReset:"স্তৰ → 1",rebirthXpReset:"এক্সপি → 0",rebirthWorldSame:"বিশ্ব একেই থাকিব",rebirthXpBoost:"এক্সপি +25%",controlsKeyboard:"কীব’ৰ্ড নিয়ন্ত্ৰণ",controlsTouch:"স্পৰ্শ নিয়ন্ত্ৰণ",wrongMsg:"❌ ভুল! আকৌ চেষ্টা কৰক!",critXp:"সংকটজনক এক্সপি!",xpComboMsg:"এক্সপি কম্বো x{n}",bossDefeated:"বিশ্ব {w} বছ পৰাজিত হ'ল!",chestOpened:"চেষ্ট খোলা হ'ল!",teleported:"টেলিপ'ৰ্ট হ'ল!",coinCombo:"মুদ্ৰা কম্বো x{n}!",bossAppeared:"বিশ্ব {w} বছ প্ৰকাশ পালে!",rainbowEvent:"ৰামধেনু ঘটনা! এক্সপি x2",meteorShower:"উল্কাবৃষ্টি!",coinRain:"মুদ্ৰা বৃষ্টি!",enemySwarm:"শত্ৰুৰ জাক!",progressReset:"প্ৰগতি ৰিছেট কৰা হ'ল!",achFirstCoin:"প্ৰথম মুদ্ৰা",achRunner:"দৌৰাৰু 1000মি",achMathGenius:"গণিত প্ৰতিভা",achLevel100:"স্তৰ 100",achFirstRebirth:"প্ৰথম পুনৰ্জন্ম",achWorld50:"বিশ্ব 50",invSpeed:"গতি",invShield:"ঢাল",invMagnet:"চুম্বক",invSuperJump:"ছুপাৰ জাম্প"}}
};

function t(key){
 let lang=LANGS[currentLang]||LANGS.en;
 return (lang.t&&lang.t[key])||LANGS.en.t[key]||key;
}

function applyLanguage(){

 document.querySelectorAll("[data-i18n]").forEach(el=>{
  el.textContent=t(el.getAttribute("data-i18n"));
 });

 let mb=document.getElementById("settingsMusicBtn");
 if(mb)mb.textContent="🎵 "+t("music")+": "+(musicOn?t("on"):t("off"));

 let sb=document.getElementById("settingsSfxBtn");
 if(sb)sb.textContent="🔊 "+t("sfx")+": "+(sfxOn?t("on"):t("off"));
}

function populateLangSelect(){

 let sel=document.getElementById("langSelect");
 if(!sel)return;

 sel.innerHTML="";

 Object.keys(LANGS).forEach(code=>{
  let opt=document.createElement("option");
  opt.value=code;
  opt.textContent=LANGS[code].name;
  if(code===currentLang)opt.selected=true;
  sel.appendChild(opt);
 });
}

function setLanguage(code){
 if(!LANGS[code])return;
 currentLang=code;
 applyLanguage();
 save();
}

function openAchievements(){
 info(
  "🏆 "+t("achievements"),
  "🏆 "+t("achFirstCoin")+"<br>🏆 "+t("achRunner")+"<br>🏆 "+t("achMathGenius")+
  "<br>🏆 "+t("achLevel100")+"<br>🏆 "+t("achFirstRebirth")+"<br>🏆 "+t("achWorld50")
 );
}

function openInventory(){
 info(
  "🎒 "+t("inventory"),
  "⚡ "+t("invSpeed")+" ×3<br>🛡️ "+t("invShield")+" ×2<br>🧲 "+t("invMagnet")+" ×3<br>🦘 "+t("invSuperJump")+" ×2"
 );
}

function openStats(){
 document.getElementById("statsBody").innerHTML=`
 🪙 ${t("statsCoins")}: ${stats.totalCoins}<br>
 💀 ${t("statsDeaths")}: ${stats.totalDeaths}<br>
 🧮 ${t("statsCorrect")}: ${stats.totalMathCorrect}<br>
 ❌ ${t("statsWrong")}: ${stats.totalMathWrong}<br>
 👾 ${t("statsEnemies")}: ${stats.enemiesDefeated}<br>
 📏 ${t("statsDistance")}: ${distance}m<br>
 🏆 ${t("statsScore")}: ${score}<br>
 🌍 ${t("statsWorlds")}: ${completedWorlds.length}/50
 `;
 document.getElementById("stats").style.display="flex";
}

function openSkins(){

 let html="";

 SKINS.forEach((s,i)=>{
  let unlocked=unlockedSkins.includes(i);

  html+=`<div class="item" style="opacity:${unlocked?1:.4}">
  ${s.name}<br>
  ${unlocked?
   `<button onclick="selectSkin(${i})">${selectedSkin===i?"✅ IN USE":"SELECT"}</button>`
   :`<button onclick="buySkin(${i})">💎 ${5*(i+1)} Gems</button>`}
  </div>`;
 });

 document.getElementById("skinBody").innerHTML=html;
 document.getElementById("skinScreen").style.display="flex";
}

function selectSkin(i){
 selectedSkin=i;
 save();
 openSkins();
}

function buySkin(i){
 let cost=5*(i+1);

 if(gems>=cost){
  gems-=cost;
  unlockedSkins.push(i);
  save();
  updateHUD();
 }

 openSkins();
}

function openSlots(){

 let html="";

 for(let s=1;s<=3;s++){

  let raw=localStorage.getItem("MathPlatformerV8_1_slot"+s);
  let label=raw?`⭐ Lv ${JSON.parse(raw).level||1}`:"Empty";

  html+=`<div class="item">
  💾 SLOT ${s} — ${label}<br>
  <button onclick="useSlot(${s})">${currentSlot===s?"✅ IN USE":"SELECT"}</button>
  <button onclick="resetSlot(${s})">🗑️ DELETE</button>
  </div>`;
 }

 document.getElementById("slotBody").innerHTML=`<div class="grid">${html}</div>
 <button onclick="partialReset()" style="background:linear-gradient(180deg,#f97316,#9a3412);margin-top:14px">
 ♻️ RESET Level/Coins/HP/Keys/Stats/Trophies
 </button>`;
 document.getElementById("slotScreen").style.display="flex";
}

function partialReset(){

 if(!confirm("Reset Level, Coins, HP, Keys, Stats and Trophies?\nGems, Distance, Score, Rebirth, Skins and Elements will be kept.")){
  return;
 }

 level=1;
 xp=0;
 coins=0;
 hp=maxHp;
 keys=0;
 stats={totalCoins:0,totalDeaths:0,totalMathCorrect:0,totalMathWrong:0,enemiesDefeated:0};
 completedWorlds=[];
 worldTrophy={};

 save();
 updateHUD();
 showCombo("♻️ "+t("progressReset"));
 openSlots();
}

function useSlot(s){
 currentSlot=s;
 load();
 updateHUD();
 openSlots();
}

function resetSlot(s){

 localStorage.removeItem("MathPlatformerV8_1_slot"+s);

 if(s===currentSlot){
  level=1;xp=0;coins=0;gems=0;distance=0;score=0;rebirth=0;xpMulti=1;
  hp=maxHp;keys=0;
  stats={totalCoins:0,totalDeaths:0,totalMathCorrect:0,totalMathWrong:0,enemiesDefeated:0};
  completedWorlds=[];worldTrophy={};
  unlockedSkins=[0];selectedSkin=0;
  unlockedElements=["🔥 FIRE"];
  updateHUD();
 }

 openSlots();
}

/* =========================
   SOUND / MUSIC
========================= */

function playTone(freq,dur,type){

 if(!sfxOn)return;

 try{
  const A=getAudioCtx();
  let o=A.createOscillator();
  let g=A.createGain();

  o.type=type||"sine";
  o.frequency.value=freq;

  let t=A.currentTime;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(.08,t+.01);
  g.gain.linearRampToValueAtTime(0,t+dur);

  o.connect(g);
  g.connect(A.destination);

  o.start(t);
  o.stop(t+dur+.02);
 }catch(e){}
}

function coinSound(){playTone(880,.08);}
function hitSound(){playTone(140,.15,"sawtooth");}
function powerupSound(){playTone(660,.2,"triangle");}

function toggleMusic(){
 musicOn=!musicOn;
 document.getElementById("musicBtn").textContent=musicOn?"🎵 ON":"🔇 OFF";

 if(musicOn)startMusic();
 else stopMusic();

 let sb=document.getElementById("settingsMusicBtn");
 if(sb)sb.textContent="🎵 "+t("music")+": "+(musicOn?t("on"):t("off"));

 save();
}

function toggleSfx(){
 sfxOn=!sfxOn;

 let sb=document.getElementById("settingsSfxBtn");
 if(sb)sb.textContent="🔊 "+t("sfx")+": "+(sfxOn?t("on"):t("off"));

 save();
}

/* =========================
   MUSIC ENGINE
   (persistent AudioContext + lookahead scheduler
    for tight, click-free chiptune playback)
========================= */

function getAudioCtx(){
 if(!audioCtx){
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();
 }
 if(audioCtx.state==="suspended")audioCtx.resume();
 return audioCtx;
}

function playToneAt(t,freq,dur,type,vol){
 try{
  let A=getAudioCtx();
  let o=A.createOscillator();
  let g=A.createGain();

  o.type=type||"sine";
  o.frequency.value=freq;

  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+.012);
  g.gain.linearRampToValueAtTime(0,t+dur);

  o.connect(g);
  g.connect(A.destination);

  o.start(t);
  o.stop(t+dur+.02);
 }catch(e){}
}

function playHatAt(t,vol){
 try{
  let A=getAudioCtx();
  let bufSize=Math.floor(A.sampleRate*.03);
  let buffer=A.createBuffer(1,bufSize,A.sampleRate);
  let data=buffer.getChannelData(0);

  for(let i=0;i<bufSize;i++){
   data[i]=(Math.random()*2-1)*(1-i/bufSize);
  }

  let noise=A.createBufferSource();
  noise.buffer=buffer;

  let g=A.createGain();
  g.gain.setValueAtTime(vol,t);
  g.gain.linearRampToValueAtTime(0,t+.03);

  noise.connect(g);
  g.connect(A.destination);

  noise.start(t);
 }catch(e){}
}

/* upbeat platformer loop in C major — melody + bass + arpeggio */

const MUSIC_MELODY=[
 523.25,659.25,783.99,659.25,698.46,880.00,783.99,659.25,
 587.33,698.46,880.00,698.46,783.99,987.77,1046.50,783.99
];

const MUSIC_BASS=[
 130.81,130.81,174.61,174.61,196.00,196.00,130.81,130.81,
 174.61,174.61,196.00,196.00,220.00,220.00,196.00,196.00
];

const STEP_DUR=.16;
const SCHEDULE_AHEAD=.15;

let musicStep=0;
let nextNoteTime=0;

function scheduleMusic(){

 let A=getAudioCtx();

 while(nextNoteTime<A.currentTime+SCHEDULE_AHEAD){

  let step=musicStep%MUSIC_MELODY.length;

  playToneAt(nextNoteTime,MUSIC_MELODY[step],STEP_DUR*.85,"square",.045);

  if(step%2===0){
   playToneAt(nextNoteTime,MUSIC_BASS[step],STEP_DUR*1.8,"triangle",.06);
   playHatAt(nextNoteTime,.05);
  }
  else{
   playHatAt(nextNoteTime,.025);
  }

  nextNoteTime+=STEP_DUR;
  musicStep++;
 }
}

function startMusic(){
 stopMusic();

 let A=getAudioCtx();
 musicStep=0;
 nextNoteTime=A.currentTime+.05;

 musicTimer=setInterval(()=>{
  if(!musicOn||!playing||paused)return;
  scheduleMusic();
 },25);
}

function stopMusic(){
 if(musicTimer)clearInterval(musicTimer);
 musicTimer=null;
}

/* =========================
   KEYBOARD
========================= */

onkeydown=e=>{

 if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")
  leftKey=true;

 if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")
  rightKey=true;

 if(e.key==="ArrowUp"||
    e.key.toLowerCase()==="w"||
    e.key===" ")
  jumpKey=true;

 if(e.key==="Escape")
  pauseGame();

 if(e.key.toLowerCase()==="f")
  fireAttack();

 if(e.key==="Shift")
  dashKey=true;

 if(e.key.toLowerCase()==="r")
  sprintKey=true;

 if(e.key.toLowerCase()==="q")
  cycleElement();
};

onkeyup=e=>{

 if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")
  leftKey=false;

 if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")
  rightKey=false;

 if(e.key==="ArrowUp"||
    e.key.toLowerCase()==="w"||
    e.key===" ")
  jumpKey=false;

 if(e.key==="Shift")
  dashKey=false;

 if(e.key.toLowerCase()==="r")
  sprintKey=false;
};

/* =========================
   MOBILE
========================= */

function hold(id,key){

 let b=document.getElementById(id);

 b.onpointerdown=e=>{
  e.preventDefault();
  window[key]=true;
 };

 b.onpointerup=e=>{
  e.preventDefault();
  window[key]=false;
 };

 b.onpointercancel=()=>{
  window[key]=false;
 };
}

hold("left","leftKey");
hold("right","rightKey");
hold("jump","jumpKey");
hold("sprintBtn","sprintKey");

document.getElementById("attackBtn").onpointerdown=e=>{
 e.preventDefault();
 fireAttack();
};

document.getElementById("dashBtn").onpointerdown=e=>{
 e.preventDefault();
 dashKey=true;
};

document.getElementById("elementBtn").onpointerdown=e=>{
 e.preventDefault();
 cycleElement();
};

/* =========================
   DRAW
========================= */

function draw(){

 let w=world();
 let now=performance.now();

 let bg="#60a5fa";
 let bg2="#3b82f6";

 if(w===2){bg="#f59e0b";bg2="#b45309";}
 if(w===3){bg="#bae6fd";bg2="#7dd3fc";}
 if(w===4){bg="#ef4444";bg2="#7f1d1d";}
 if(w>=5){bg="#312e81";bg2="#0f0c29";}

 ctx.save();

 /* damage shake */

 if(now<damageFlashUntil){
  ctx.translate(
   (Math.random()-.5)*8,
   (Math.random()-.5)*8
  );
 }

 let skyGrad=ctx.createLinearGradient(0,0,0,H);
 skyGrad.addColorStop(0,bg);
 skyGrad.addColorStop(1,bg2);
 ctx.fillStyle=skyGrad;
 ctx.fillRect(0,0,W,H);

 /* parallax mountains */

 let mtCol=w>=5?"#1e1b4b":w===4?"#991b1b":w===3?"#93c5fd":w===2?"#b45309":"#3b82f6";
 ctx.fillStyle=mtCol+"77";
 let mtOff=(camera*.2)%400;
 for(let i=-1;i<4;i++){
  let mx=i*400-mtOff;
  ctx.beginPath();
  ctx.moveTo(mx,H*.55);
  ctx.lineTo(mx+150,H*.32);
  ctx.lineTo(mx+300,H*.55);
  ctx.closePath();
  ctx.fill();
 }

 /* parallax clouds */

 ctx.fillStyle="#ffffff55";
 let clOff=(camera*.35)%500;
 for(let i=-1;i<4;i++){
  let cx=i*500-clOff+120;
  let cy=90+((i*57)%60);
  ctx.beginPath();
  ctx.ellipse(cx,cy,45,18,0,0,Math.PI*2);
  ctx.ellipse(cx+35,cy+6,32,14,0,0,Math.PI*2);
  ctx.ellipse(cx-32,cy+8,30,13,0,0,Math.PI*2);
  ctx.fill();
 }

 /* moon / sun */

 let sunGrad=ctx.createRadialGradient(W-80,80,4,W-80,80,38);
 sunGrad.addColorStop(0,"#fff9c4");
 sunGrad.addColorStop(1,"#fde047");
 ctx.fillStyle=sunGrad;
 ctx.beginPath();
 ctx.arc(W-80,80,35,0,Math.PI*2);
 ctx.fill();

 /* weather (rain/snow depending on world) */

 if(w%3===2){
  ctx.strokeStyle="#ffffff88";
  ctx.lineWidth=2;
  for(let i=0;i<40;i++){
   let sx=(i*97+ (now*.05))%W;
   let sy=(i*53+now*.2)%H;
   ctx.beginPath();
   ctx.moveTo(sx,sy);
   ctx.lineTo(sx-4,sy+10);
   ctx.stroke();
  }
 }
 else if(w%3===0){
  ctx.fillStyle="#fffffbaa";
  for(let i=0;i<30;i++){
   let sx=(i*67+now*.03)%W;
   let sy=(i*41+now*.08)%H;
   ctx.beginPath();
   ctx.arc(sx,sy,2.5,0,Math.PI*2);
   ctx.fill();
  }
 }

 /* hazards: water */

 for(let wt of water){
  let x=wt.x-camera;
  if(x+wt.w<0||x>W)continue;

  let wGrad=ctx.createLinearGradient(0,wt.y,0,wt.y+wt.h);
  wGrad.addColorStop(0,"#3b82f6aa");
  wGrad.addColorStop(1,"#1e3a8acc");
  ctx.fillStyle=wGrad;
  ctx.fillRect(x,wt.y,wt.w,wt.h);

  ctx.strokeStyle="#bfdbfeaa";
  ctx.lineWidth=2;
  for(let wi=0;wi<3;wi++){
   ctx.beginPath();
   for(let wx=0;wx<wt.w;wx+=10){
    let wy=wt.y+8+wi*14+Math.sin((wx+now*.05+wi*40)*.05)*3;
    if(wx===0)ctx.moveTo(x+wx,wy);
    else ctx.lineTo(x+wx,wy);
   }
   ctx.stroke();
  }
 }

 /* platforms */

 for(let p of platforms){

  if(p.type==="falling"&&p.falling&&p.fallTimer>90)continue;

  let x=p.x-camera;

  if(x+p.w<0||x>W)continue;

  let baseCol=p.type==="ice"?"#bae6fd":
               p.type==="moving"?"#a16207":
               p.type==="elevator"?"#6b7280":
               w===3?"#e5e7eb":
               w>=5?"#172554":
               "#713f12";

  let topCol=p.type==="ice"?"#e0f2fe":
               w===3?"#fff":
               w>=5?"#22d3ee":
               "#22c55e";

  let bodyGrad=ctx.createLinearGradient(0,p.y,0,p.y+p.h);
  bodyGrad.addColorStop(0,baseCol);
  bodyGrad.addColorStop(1,shade(baseCol,-30));

  ctx.fillStyle=bodyGrad;
  ctx.fillRect(x,p.y,p.w,p.h);

  /* subtle vertical texture lines */
  ctx.strokeStyle=shade(baseCol,-15)+"88";
  ctx.lineWidth=1;
  for(let lx=20;lx<p.w;lx+=26){
   ctx.beginPath();
   ctx.moveTo(x+lx,p.y+8);
   ctx.lineTo(x+lx,p.y+p.h);
   ctx.stroke();
  }

  let topGrad=ctx.createLinearGradient(0,p.y,0,p.y+7);
  topGrad.addColorStop(0,shade(topCol,20));
  topGrad.addColorStop(1,topCol);
  ctx.fillStyle=topGrad;
  ctx.fillRect(x,p.y,p.w,7);
 }

 /* hazards: lava */

 for(let l of lava){
  let x=l.x-camera;
  if(x+l.w<0||x>W)continue;

  let lvGrad=ctx.createLinearGradient(0,l.y,0,l.y+l.h);
  lvGrad.addColorStop(0,"#fde047");
  lvGrad.addColorStop(.3,"#f97316");
  lvGrad.addColorStop(1,"#7c2d12");
  ctx.fillStyle=lvGrad;
  ctx.fillRect(x,l.y,l.w,l.h);

  ctx.fillStyle="#fed7aa";
  for(let bi=0;bi<5;bi++){
   let bx=x+((bi*37+now*.03)%l.w);
   let by=l.y+6+Math.sin(now/200+bi)*3;
   ctx.beginPath();
   ctx.arc(bx,by,3,0,Math.PI*2);
   ctx.fill();
  }
 }

 /* hazards: wind */

 for(let wd of wind){
  let x=wd.x-camera;
  if(x+wd.w<0||x>W)continue;
  ctx.strokeStyle="#e5e7eb99";
  ctx.lineWidth=3;
  for(let i=0;i<4;i++){
   let ly=wd.y+30+i*(wd.h/4);
   ctx.beginPath();
   ctx.moveTo(x+10,ly);
   ctx.lineTo(x+10+wd.dir*30,ly-10);
   ctx.stroke();
  }
 }

 /* coins */

 for(let c of coinList){

  if(c.taken)continue;

  let spin=Math.abs(Math.cos(now/220+c.x*.01));
  let coinGrad=ctx.createRadialGradient(
   c.x-camera-3,c.y-3,1,c.x-camera,c.y,11
  );
  coinGrad.addColorStop(0,"#fff9c4");
  coinGrad.addColorStop(.5,"#facc15");
  coinGrad.addColorStop(1,"#b45309");

  ctx.fillStyle=coinGrad;
  ctx.beginPath();
  ctx.ellipse(c.x-camera,c.y,11*Math.max(.25,spin),11,0,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle="#fde68a";
  ctx.lineWidth=1.5;
  ctx.stroke();
 }

 /* lucky blocks */

 for(let b of lucky){

  if(b.opened)continue;

  let lGrad=ctx.createLinearGradient(b.x-camera,b.y,b.x-camera,b.y+35);
  lGrad.addColorStop(0,"#fde047");
  lGrad.addColorStop(1,"#ca8a04");

  ctx.fillStyle=lGrad;
  ctx.fillRect(b.x-camera,b.y,35,35);

  ctx.strokeStyle="#92400e";
  ctx.lineWidth=2;
  ctx.strokeRect(b.x-camera+2,b.y+2,31,31);

  ctx.fillStyle="#78350f";
  ctx.font="bold 24px Arial";
  ctx.fillText("?",b.x-camera+10,b.y+26);
 }

 /* chests */

 for(let c of chests){

  if(c.opened)continue;

  let x=c.x-camera;
  if(x+c.w<0||x>W)continue;

  let chGrad=ctx.createLinearGradient(x,c.y,x,c.y+c.h);
  chGrad.addColorStop(0,"#b45309");
  chGrad.addColorStop(1,"#78350f");

  ctx.fillStyle=chGrad;
  ctx.fillRect(x,c.y,c.w,c.h);

  ctx.strokeStyle="#451a03";
  ctx.lineWidth=1;
  ctx.strokeRect(x+2,c.y+2,c.w-4,c.h-4);

  ctx.fillStyle="#facc15";
  ctx.fillRect(x,c.y+c.h/2-4,c.w,6);
  ctx.fillStyle="#78350f";
  ctx.beginPath();
  ctx.arc(x+c.w/2,c.y+c.h/2,3,0,Math.PI*2);
  ctx.fill();
 }

 /* key pickups */

 for(let k of keyPickups){

  if(k.taken)continue;

  ctx.font="22px Arial";
  ctx.fillText("🔑",k.x-camera-11,k.y+8);
 }

 /* locked doors */

 for(let d of doors){

  if(d.open)continue;

  let x=d.x-camera;
  if(x+d.w<0||x>W)continue;

  ctx.fillStyle="#7f1d1d";
  ctx.fillRect(x,d.y,d.w,d.h);
  ctx.fillStyle="#facc15";
  ctx.font="16px Arial";
  ctx.fillText("🔒",x-2,d.y+d.h/2);
 }

 /* teleporters */

 for(let tp of teleporters){

  ctx.fillStyle="#a855f7aa";
  ctx.beginPath();
  ctx.arc(tp.ax-camera,tp.ay,18,0,Math.PI*2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(tp.bx-camera,tp.by,18,0,Math.PI*2);
  ctx.fill();
 }

 /* meteors */

 for(let mt of meteors){
  ctx.fillStyle="#f97316";
  ctx.beginPath();
  ctx.arc(mt.x-camera,mt.y,13,0,Math.PI*2);
  ctx.fill();
 }

 /* enemy projectiles */

 for(let pr of enemyProjectiles){
  let pg=ctx.createRadialGradient(pr.x-camera,pr.y+pr.h/2,1,pr.x-camera,pr.y+pr.h/2,8);
  pg.addColorStop(0,"#fecaca");
  pg.addColorStop(1,"#dc2626");
  ctx.fillStyle=pg;
  ctx.beginPath();
  ctx.arc(pr.x-camera,pr.y+pr.h/2,7,0,Math.PI*2);
  ctx.fill();
 }

 /* player projectiles */

 for(let pr of projectiles){
  let pcol=pr.element==="❄️ ICE"?"#38bdf8":
               pr.element==="⚡ LIGHTNING"?"#facc15":
               "#f97316";
  let pg=ctx.createRadialGradient(
   pr.x-camera+pr.w/2,pr.y+pr.h/2,1,
   pr.x-camera+pr.w/2,pr.y+pr.h/2,12
  );
  pg.addColorStop(0,shade(pcol,50)+"cc");
  pg.addColorStop(1,pcol+"00");
  ctx.fillStyle=pg;
  ctx.beginPath();
  ctx.arc(pr.x-camera+pr.w/2,pr.y+pr.h/2,12,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle=pcol;
  ctx.fillRect(pr.x-camera,pr.y,pr.w,pr.h);
 }

 /* enemies (variants) */

 for(let e of enemies){

  let x=e.x-camera;
  if(x+e.w<0||x>W)continue;

  let col="#ef4444";
  if(e.type==="bat")col="#7c3aed";
  if(e.type==="bee")col="#facc15";
  if(e.type==="robot")col="#6b7280";
  if(e.type==="elite")col="#b91c1c";
  if(e.type==="miniboss")col="#111827";

  if(e.slowUntil>now)ctx.globalAlpha=.6;

  let flap=Math.sin(now/90+e.phase)*6;
  let cx=x+e.w/2,cy=e.y+e.h/2;

  /* wings for flying types */
  if(e.type!=="robot"){
   ctx.fillStyle=col+"aa";
   ctx.beginPath();
   ctx.ellipse(x-4,cy-flap,10,5,0,0,Math.PI*2);
   ctx.fill();
   ctx.beginPath();
   ctx.ellipse(x+e.w+4,cy+flap,10,5,0,0,Math.PI*2);
   ctx.fill();
  }

  /* body with radial shading */
  let bodyGrad=ctx.createRadialGradient(cx-e.w*.2,e.y+e.h*.2,2,cx,cy,e.w*.75);
  bodyGrad.addColorStop(0,shade(col,45));
  bodyGrad.addColorStop(1,shade(col,-25));

  ctx.fillStyle=bodyGrad;

  if(e.type==="bat"){
   /* bat: rounded body + pointed ears */
   ctx.beginPath();
   ctx.ellipse(cx,cy,e.w*.42,e.h*.42,0,0,Math.PI*2);
   ctx.fill();
   ctx.beginPath();
   ctx.moveTo(cx-e.w*.28,e.y+6);
   ctx.lineTo(cx-e.w*.4,e.y-8);
   ctx.lineTo(cx-e.w*.1,e.y+4);
   ctx.closePath();
   ctx.fill();
   ctx.beginPath();
   ctx.moveTo(cx+e.w*.28,e.y+6);
   ctx.lineTo(cx+e.w*.4,e.y-8);
   ctx.lineTo(cx+e.w*.1,e.y+4);
   ctx.closePath();
   ctx.fill();
  }
  else if(e.type==="bee"){
   /* bee: oval body with stripes */
   ctx.beginPath();
   ctx.ellipse(cx,cy,e.w*.45,e.h*.4,0,0,Math.PI*2);
   ctx.fill();
   ctx.fillStyle="#111827";
   for(let si=-1;si<=1;si++){
    ctx.fillRect(cx+si*e.w*.18-3,e.y+6,6,e.h-12);
   }
  }
  else if(e.type==="robot"){
   /* robot: boxy with antenna and glowing eye */
   ctx.fillRect(x,e.y,e.w,e.h);
   ctx.strokeStyle=shade(col,-40);
   ctx.lineWidth=2;
   ctx.strokeRect(x+3,e.y+3,e.w-6,e.h-6);
   ctx.strokeStyle="#9ca3af";
   ctx.beginPath();
   ctx.moveTo(cx,e.y);
   ctx.lineTo(cx,e.y-10);
   ctx.stroke();
   ctx.fillStyle="#ef4444";
   ctx.beginPath();
   ctx.arc(cx,e.y-12,3,0,Math.PI*2);
   ctx.fill();
  }
  else if(e.type==="elite"||e.type==="miniboss"){
   /* elite/miniboss: bigger body with spikes */
   ctx.beginPath();
   ctx.roundRect?ctx.roundRect(x,e.y,e.w,e.h,8):ctx.rect(x,e.y,e.w,e.h);
   ctx.fill();
   ctx.fillStyle=shade(col,-10);
   for(let si=0;si<4;si++){
    let sx=x+si*(e.w/3.2)+6;
    ctx.beginPath();
    ctx.moveTo(sx,e.y);
    ctx.lineTo(sx+7,e.y-10);
    ctx.lineTo(sx+14,e.y);
    ctx.closePath();
    ctx.fill();
   }
  }
  else{
   /* default fly: rounded blob */
   ctx.beginPath();
   ctx.ellipse(cx,cy,e.w*.45,e.h*.45,0,0,Math.PI*2);
   ctx.fill();
  }

  /* eyes */
  ctx.fillStyle="#fff";
  ctx.beginPath();
  ctx.arc(x+e.w*.34,e.y+e.h*.38,4,0,Math.PI*2);
  ctx.arc(x+e.w*.66,e.y+e.h*.38,4,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#111";
  ctx.beginPath();
  ctx.arc(x+e.w*.34,e.y+e.h*.38,1.8,0,Math.PI*2);
  ctx.arc(x+e.w*.66,e.y+e.h*.38,1.8,0,Math.PI*2);
  ctx.fill();

  /* mouth */
  ctx.fillStyle="#111";
  ctx.fillRect(x+e.w*.3,e.y+e.h-14,e.w*.4,5);

  ctx.globalAlpha=1;

  if(e.type==="miniboss"||e.type==="elite"){
   ctx.fillStyle="#0009";
   ctx.fillRect(x,e.y-10,e.w,6);
   ctx.fillStyle="#22c55e";
   ctx.fillRect(x,e.y-10,e.w*Math.max(0,e.hp/(e.type==="miniboss"?8:3)),6);
  }
 }

 /* world boss */

 if(boss){
  let x=boss.x-camera;
  let bcx=x+boss.w/2,bcy=boss.y+boss.h/2;

  let bossGrad=ctx.createRadialGradient(bcx-20,boss.y+20,4,bcx,bcy,boss.w*.8);
  bossGrad.addColorStop(0,"#334155");
  bossGrad.addColorStop(1,"#0f172a");

  ctx.fillStyle=bossGrad;
  ctx.fillRect(x,boss.y,boss.w,boss.h);

  ctx.fillStyle="#1e293b";
  for(let si=0;si<5;si++){
   let sx=x+si*(boss.w/4.5)+4;
   ctx.beginPath();
   ctx.moveTo(sx,boss.y);
   ctx.lineTo(sx+9,boss.y-16);
   ctx.lineTo(sx+18,boss.y);
   ctx.closePath();
   ctx.fill();
  }

  let eyeGlow=.6+.4*Math.abs(Math.sin(now/200));
  ctx.fillStyle=`rgba(239,68,68,${eyeGlow})`;
  ctx.beginPath();
  ctx.arc(x+boss.w*.24,boss.y+30,10,0,Math.PI*2);
  ctx.arc(x+boss.w*.76,boss.y+30,10,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle="#111";
  ctx.fillRect(x+boss.w*.3,boss.y+boss.h*.65,boss.w*.4,8);

  ctx.fillStyle="#0009";
  ctx.fillRect(x,boss.y-16,boss.w,8);
  ctx.fillStyle="#dc2626";
  ctx.fillRect(x,boss.y-16,boss.w*Math.max(0,boss.hp/boss.maxHp),8);
 }

 /* player (skin-aware, animated) */

 let alpha=1;

 if(now<immuneUntil)
  alpha=.4+.6*Math.abs(Math.sin(now/70));

 ctx.globalAlpha=alpha;

 let skin=SKINS[selectedSkin]||SKINS[0];

 let moving=Math.abs(player.vx)>.5;
 let walkCycle=Math.sin(now/70)*(moving&&player.ground?1:0);
 let squashY=player.ground?1:(player.vy<0?1.12:.9);
 let squashX=player.ground?1:(player.vy<0?.92:1.08);
 let bodyH=35*squashY;
 let bodyW=player.w*squashX;
 let bodyOffX=(player.w-bodyW)/2;
 let tilt=walkCycle*4;

 let px=player.x-camera;
 let py=player.y+15+(35-bodyH);

 ctx.save();
 ctx.translate(px+player.w/2,py+bodyH/2);
 ctx.rotate(tilt*Math.PI/180);
 ctx.translate(-(player.w/2),-(bodyH/2));

 let bodyGrad=ctx.createLinearGradient(bodyOffX,0,bodyOffX+bodyW,0);
 bodyGrad.addColorStop(0,shade(skin.body,-15));
 bodyGrad.addColorStop(.5,shade(skin.body,20));
 bodyGrad.addColorStop(1,shade(skin.body,-15));

 ctx.fillStyle=bodyGrad;
 ctx.beginPath();
 if(ctx.roundRect)ctx.roundRect(bodyOffX,0,bodyW,bodyH,6);
 else ctx.rect(bodyOffX,0,bodyW,bodyH);
 ctx.fill();

 /* chest highlight stripe */
 ctx.fillStyle=shade(skin.body,35)+"aa";
 ctx.fillRect(bodyOffX+bodyW*.3,4,bodyW*.15,bodyH-8);

 /* legs (simple walk animation) */
 if(player.ground){
  ctx.fillStyle=shade(skin.body,-25);
  let legSwing=moving?Math.sin(now/60)*6:0;
  ctx.fillRect(bodyOffX+4,bodyH-2,6,10+legSwing);
  ctx.fillRect(bodyOffX+bodyW-10,bodyH-2,6,10-legSwing);
 }

 ctx.restore();

 let headGrad=ctx.createRadialGradient(
  player.x-camera+13,player.y+9,2,
  player.x-camera+19,player.y+15,18
 );
 headGrad.addColorStop(0,shade(skin.head,40));
 headGrad.addColorStop(1,skin.head);

 ctx.fillStyle=headGrad;
 ctx.beginPath();
 ctx.arc(
  player.x-camera+19,
  player.y+15+Math.sin(now/140)*(moving?0:1.5),
 17,0,Math.PI*2
 );
 ctx.fill();

 ctx.strokeStyle=shade(skin.head,-30);
 ctx.lineWidth=1.5;
 ctx.stroke();

 ctx.fillStyle="#111";
 ctx.beginPath();
 ctx.arc(player.x-camera+12.5,player.y+13,3,0,Math.PI*2);
 ctx.arc(player.x-camera+27.5,player.y+13,3,0,Math.PI*2);
 ctx.fill();

 ctx.fillStyle="#7f1d1d";
 ctx.beginPath();
 ctx.arc(player.x-camera+19,player.y+21,4,0,Math.PI);
 ctx.fill();

 /* dash after-image trail */
 if(now<dashUntil){
  ctx.globalAlpha=alpha*.3;
  ctx.fillStyle=skin.body;
  ctx.fillRect(player.x-camera-facing*20,player.y+15,player.w,35);
  ctx.globalAlpha=alpha;
 }

 ctx.globalAlpha=1;

 /* day / night overlay */

 let nightAlpha=Math.max(0,Math.sin(dayNightT))*.45;
 if(nightAlpha>0){
  ctx.fillStyle=`rgba(10,10,40,${nightAlpha})`;
  ctx.fillRect(0,0,W,H);
 }

 ctx.restore();

 /* damage flash overlay */

 document.getElementById("flash").style.display=
  now<damageFlashUntil?"block":"none";
}

/* =========================
   GAME LOOP
========================= */

function loop(){

 update();
 draw();
 updateHUD();

 requestAnimationFrame(loop);
}

load();
generate();
updateHUD();
applyLanguage();
if(musicOn)startMusic();
loop();