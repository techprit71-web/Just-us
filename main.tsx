import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, Bell, Camera, Check, CheckCheck, ChevronRight,
  CircleUserRound, Copy, Download, File, FileText, Gamepad2, Image as ImageIcon,
  LockKeyhole, Menu, MessageCircle, Mic, MicOff, MoreHorizontal, Paperclip,
  Phone, Play, Plus, RefreshCw, Search, Send, Settings, ShieldCheck, Smile,
  Sparkles, Square, Trash2, Upload, UserPlus, Users, Video, Volume2, VolumeX,
  Wifi, X, Zap
} from "lucide-react";
import "./styles.css";

type Screen = "welcome" | "security" | "profile" | "app";
type Tab = "chat" | "games" | "media" | "profile";
type Toast = { id:number; text:string; kind?: "success"|"error"|"info" };
type Message = { id:number; text:string; time:string; status:"sent"|"delivered"|"read"; mine:boolean; reply?:string };
type MediaItem = { id:number; name:string; url:string; type:"image"|"file"; from:string; time:string };

const uid = () => Math.floor(Date.now() + Math.random()*1000);
const timeNow = () => new Intl.DateTimeFormat([], {hour:"2-digit", minute:"2-digit"}).format(new Date());

function haptic(level:"light"|"medium"|"success"|"error"="light") {
  const patterns = {light:8, medium:16, success:[8,30,8], error:[18,40,18]} as const;
  try { if ("vibrate" in navigator) navigator.vibrate(patterns[level]); } catch {}
}

function useToasts() {
  const [toasts,setToasts] = useState<Toast[]>([]);
  const toast = (text:string, kind:Toast["kind"]="info") => {
    const id=uid(); setToasts(v=>[...v,{id,text,kind}]);
    window.setTimeout(()=>setToasts(v=>v.filter(x=>x.id!==id)),2600);
  };
  return {toasts,toast};
}

function Toasts({items}:{items:Toast[]}) {
  return <div className="toast-stack" aria-live="polite">{items.map(t=>
    <div className={`toast ${t.kind||""}`} key={t.id}><span className="toast-dot"><Check size={13}/></span>{t.text}</div>
  )}</div>;
}

function App() {
  const [screen,setScreen]=useState<Screen>("welcome");
  const [onboard,setOnboard]=useState(0);
  const [tab,setTab]=useState<Tab>("chat");
  const [profile,setProfile]=useState({name:"",code:"ORBIT-7K2P",avatar:""});
  const [room,setRoom]=useState("ROOM-NOVA-4821");
  const [partnerOnline,setPartnerOnline]=useState(true);
  const [messages,setMessages]=useState<Message[]>([
    {id:1,text:"Hey! Welcome to Orbit 👋",time:"10:42",status:"read",mine:false},
    {id:2,text:"Everything feels really smooth here.",time:"10:43",status:"read",mine:false},
    {id:3,text:"That’s the idea. Private, playful, and simple.",time:"10:44",status:"read",mine:true}
  ]);
  const [media,setMedia]=useState<MediaItem[]>([]);
  const {toasts,toast}=useToasts();

  useEffect(()=>{
    const onShot=()=>toast("Screenshot detected","info");
    // There is no standard web event for OS screenshots. Keep this hook intentionally
    // conservative: browsers that expose a vendor event can wire it here.
    window.addEventListener("orbit:screenshot",onShot);
    return ()=>window.removeEventListener("orbit:screenshot",onShot);
  },[]);

  const next=(fn:()=>void)=>{haptic("light"); fn();};
  const generateCode=()=>{setProfile(p=>({...p,code:"ORBIT-"+Math.random().toString(36).slice(2,6).toUpperCase()+Math.floor(10+Math.random()*90)}));toast("Private code regenerated","success");haptic("success")};
  const createRoom=()=>{const r="ROOM-"+Math.random().toString(36).slice(2,7).toUpperCase()+"-"+Math.floor(100+Math.random()*900);setRoom(r);toast("Random room created","success");haptic("success")};
  const copy=(s:string,label:string)=>{navigator.clipboard?.writeText(s);toast(`${label} copied`,"success");haptic("light")};

  if(screen!=="app") return <><Entry screen={screen} onboard={onboard} setOnboard={setOnboard} profile={profile} setProfile={setProfile} room={room} setRoom={setRoom} next={next} toast={toast} generateCode={generateCode} createRoom={createRoom} finish={()=>setScreen("app")} copy={copy}/><Toasts items={toasts}/></>;

  return <div className="shell">
    <AppHeader tab={tab} profile={profile} partnerOnline={partnerOnline} setPartnerOnline={setPartnerOnline} toast={toast} haptic={haptic}/>
    <main className="app-main">
      {tab==="chat" && <Chat messages={messages} setMessages={setMessages} toast={toast} haptic={haptic} media={media} setMedia={setMedia}/>}
      {tab==="games" && <Games toast={toast} haptic={haptic}/>}
      {tab==="media" && <Media media={media} toast={toast}/>}
      {tab==="profile" && <Profile profile={profile} setProfile={setProfile} room={room} toast={toast} copy={copy}/>}
    </main>
    <BottomNav tab={tab} setTab={(t)=>{haptic("light");setTab(t)}}/>
    <Toasts items={toasts}/>
  </div>;
}

function Entry({screen,onboard,setOnboard,profile,setProfile,room,setRoom,next,toast,generateCode,createRoom,finish,copy}:{screen:Screen,onboard:number,setOnboard:(n:number)=>void,profile:any,setProfile:any,room:string,setRoom:any,next:(f:()=>void)=>void,toast:any,generateCode:()=>void,createRoom:()=>void,finish:()=>void,copy:(s:string,l:string)=>void}) {
  const go=(s:Screen)=>{haptic("medium"); if(s==="security") setOnboard(0); (window as any).__screen=s;};
  // local state wrapper via DOM-free event flow
  const [local,setLocal]=useState<Screen>(screen);
  useEffect(()=>setLocal(screen),[screen]);
  const transition=(s:Screen)=>{haptic("medium");setLocal(s)};
  if(local==="welcome") return <div className="entry"><div className="entry-orb orb-a"/><div className="entry-orb orb-b"/><section className="hero">
    <div className="brand"><div className="brand-mark"><Sparkles size={20}/></div><span>ORBIT</span></div>
    <div className="hero-copy"><div className="eyebrow"><span className="pulse"/>PRIVATE-FIRST COMMUNICATION</div><h1>Talk. Play.<br/><em>Stay close.</em></h1><p>A calm space for conversations, shared moments, and games — designed around control and clarity.</p></div>
    <button className="primary huge" onClick={()=>transition("security")}>Enter <ArrowRight size={18}/></button>
    <div className="entry-note"><LockKeyhole size={14}/> Privacy is a design goal, not a promise of cryptographic protection.</div>
  </section><div className="entry-footer">ORBIT / 01</div></div>;

  if(local==="security") {
    const cards=[
      {icon:<MessageCircle/>,title:"Communication",text:"Messages, media, presence and calls live in one focused workspace."},
      {icon:<LockKeyhole/>,title:"Encryption",text:"Real end-to-end encryption needs a verified protocol, secure key handling, and a backend designed for it."},
      {icon:<ShieldCheck/>,title:"Boundaries",text:"This browser app does not claim OS-level privacy, guaranteed screenshot detection, or E2E encryption by itself."}
    ];
    return <div className="entry"><div className="security-art"><div className="article"><div className="article-line long"/><div className="article-line"/><div className="article-line short"/><div className="article-photo"/></div><div className="phone"><div className="phone-notch"/><div className="mini-avatar">O</div><div className="mini-bubble">Encrypted-looking UI ≠ encryption.</div><div className="mini-bubble right">Exactly.</div></div></div>
      <section className="security-content"><div className="step-label">02 / WHY IT MATTERS</div><h2>Privacy is a system,<br/><em>not a badge.</em></h2><p>Orbit’s interface is ready for secure infrastructure without pretending that UI alone makes communication secure.</p>
      <div className="info-grid">{cards.map(c=><div className="info-card" key={c.title}>{c.icon}<strong>{c.title}</strong><span>{c.text}</span></div>)}</div>
      <button className="primary" onClick={()=>transition("profile")}>Next <ArrowRight size={17}/></button></section>
    </div>
  }
  return <div className="entry profile-entry"><section className="profile-card">
    <div className="step-label">03 / YOUR PROFILE</div><h2>Make it yours.</h2><p>Use a display name and a private code to identify yourself inside this demo. In production, bind identity to secure authentication.</p>
    <AvatarEditor value={profile.avatar} onChange={(avatar)=>setProfile({...profile,avatar})}/>
    <label className="field"><span>Display name</span><input value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="e.g. Priya" maxLength={40}/></label>
    <div className="code-row"><div><span>Private code</span><b>{profile.code}</b></div><button className="icon-btn" onClick={()=>copy(profile.code,"Private code")} aria-label="Copy code"><Copy size={17}/></button><button className="icon-btn" onClick={generateCode} aria-label="Regenerate code"><RefreshCw size={17}/></button></div>
    <div className="room-box"><div><span>Random room</span><b>{room}</b></div><div className="inline-actions"><button className="ghost" onClick={createRoom}><RefreshCw size={15}/> New</button><button className="ghost" onClick={()=>copy(room,"Room ID")}><Copy size={15}/> Copy</button></div></div>
    <button className="primary full" onClick={()=>{if(!profile.name.trim()){toast("Add a display name first","error");haptic("error");return} next(finish);toast("Profile saved","success")}}>Continue <ArrowRight size={17}/></button>
  </section></div>
}

function AvatarEditor({value,onChange}:{value:string,onChange:(v:string)=>void}) {
  const ref=useRef<HTMLInputElement>(null);
  return <div className="avatar-editor"><button className="avatar-big" onClick={()=>ref.current?.click()}>{value?<img src={value}/>:<CircleUserRound size={45}/>}<span><Camera size={15}/></span></button><input ref={ref} type="file" accept="image/*" hidden onChange={e=>{const f=e.target.files?.[0];if(f){const r=new FileReader();r.onload=()=>onChange(String(r.result));r.readAsDataURL(f)}}}/><div><b>Profile photo</b><p>Choose an image. A circular preview is applied; production deployments should add server-side processing and validation.</p>{value&&<button className="text-btn" onClick={()=>onChange("")}>Remove</button>}</div></div>
}

function AppHeader({tab,profile,partnerOnline,setPartnerOnline,toast,haptic}:{tab:Tab,profile:any,partnerOnline:boolean,setPartnerOnline:(b:boolean)=>void,toast:any,haptic:any}) {
  return <header className="app-header"><div className="partner"><div className="avatar small">{profile.avatar?<img src={profile.avatar}/>:<span>O</span>}</div><div><b>{profile.name||"Your partner"}</b><span onClick={()=>{setPartnerOnline(!partnerOnline);haptic("light");toast(partnerOnline?"Presence set offline":"Presence set online","info")}}><i className={partnerOnline?"online-dot":""}/>{partnerOnline?"Online":"Offline"}</span></div></div>
  <div className="header-actions"><button className="icon-btn" onClick={()=>toast("Voice call needs signaling + a peer","info")}><Phone size={18}/></button><button className="icon-btn" onClick={()=>toast("Video call needs signaling + a peer","info")}><Video size={18}/></button><button className="icon-btn"><MoreHorizontal size={19}/></button></div></header>
}

function BottomNav({tab,setTab}:{tab:Tab,setTab:(t:Tab)=>void}) {
  const items:[Tab,string,any][]=[["chat","Chat",MessageCircle],["games","Play",Gamepad2],["media","Media",ImageIcon],["profile","You",CircleUserRound]];
  return <nav className="bottom-nav">{items.map(([id,label,I])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}><I size={19}/><span>{label}</span></button>)}</nav>
}

function Chat({messages,setMessages,toast,haptic,media,setMedia}:{messages:Message[],setMessages:any,toast:any,haptic:any,media:MediaItem[],setMedia:any}) {
  const [text,setText]=useState(""); const [reply,setReply]=useState<string>(); const end=useRef<HTMLDivElement>(null);
  useEffect(()=>end.current?.scrollIntoView({behavior:"smooth"}),[messages.length]);
  const send=()=>{if(!text.trim())return;const m={id:uid(),text:text.trim(),time:timeNow(),status:"sent" as const,mine:true,reply};setMessages((v:Message[])=>[...v,m]);setText("");setReply(undefined);haptic("light");toast("Message sent","success");setTimeout(()=>setMessages((v:Message[])=>v.map(x=>x.id===m.id?{...x,status:"delivered"}:x)),500);setTimeout(()=>setMessages((v:Message[])=>v.map(x=>x.id===m.id?{...x,status:"read"}:x)),1300)};
  const attach=(file:File)=>{if(file.type.startsWith("image/")){const r=new FileReader();r.onload=()=>{const item={id:uid(),name:file.name,url:String(r.result),type:"image" as const,from:"You",time:timeNow()};setMedia((v:MediaItem[])=>[item,...v]);setMessages((v:Message[])=>[...v,{id:uid(),text:"📷 Photo shared",time:timeNow(),status:"read",mine:true}]);toast("Photo sent","success");haptic("success")};r.readAsDataURL(file)}else{setMessages((v:Message[])=>[...v,{id:uid(),text:`📎 ${file.name} (${Math.round(file.size/1024)} KB)`,time:timeNow(),status:"sent",mine:true}]);toast("File attached","success");haptic("success")}};
  return <section className="chat"><div className="chat-banner"><div className="secure-pill"><ShieldCheck size={14}/> Local demo session</div><span>Not E2E encrypted</span></div><div className="messages">{messages.map(m=><div key={m.id} className={`message-row ${m.mine?"mine":""}`} onContextMenu={e=>{e.preventDefault();setReply(m.text)}}><div className="bubble">{m.reply&&<div className="reply-preview">{m.reply}</div>}<span>{m.text}</span><small>{m.time} {m.mine&&(m.status==="read"?<CheckCheck size={13}/>:<Check size={13}/>)}</small></div></div>)}<div ref={end}/></div>
  {reply&&<div className="reply-bar"><span>Replying to <b>{reply.slice(0,42)}</b></span><button className="icon-btn" onClick={()=>setReply(undefined)}><X size={16}/></button></div>}
  <div className="composer"><label className="icon-btn" aria-label="Attach photo"><ImageIcon size={19}/><input hidden type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0];if(f)attach(f)}}/></label><label className="icon-btn" aria-label="Attach file"><Paperclip size={19}/><input hidden type="file" onChange={e=>{const f=e.target.files?.[0];if(f)attach(f)}}/></label><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())} placeholder="Write a message…" aria-label="Message"/><button className={`send ${text.trim()?"ready":""}`} onClick={send} aria-label="Send"><Send size={18}/></button></div></section>
}

function Media({media,toast}:{media:MediaItem[],toast:any}) {
  return <section className="page"><div className="page-title"><div><div className="eyebrow">SHARED SPACE</div><h2>Media & files</h2></div><button className="icon-btn"><Search size={18}/></button></div>{media.length===0?<div className="empty"><div className="empty-icon"><ImageIcon/></div><h3>No shared media yet</h3><p>Photos and files you send from chat appear here.</p></div>:<div className="media-grid">{media.map(m=>m.type==="image"?<div className="media-card" key={m.id}><img src={m.url}/><div><b>{m.name}</b><span>{m.from} · {m.time}</span></div></div>:<div className="file-card" key={m.id}><FileText/><div><b>{m.name}</b><span>{m.from} · {m.time}</span></div><button className="icon-btn" onClick={()=>toast("Download is available for generated file URLs","info")}><Download size={16}/></button></div>)}</div>}</section>
}

function Profile({profile,setProfile,room,toast,copy}:{profile:any,setProfile:any,room:string,toast:any,copy:any}) {
  return <section className="page"><div className="page-title"><div><div className="eyebrow">ACCOUNT</div><h2>Your profile</h2></div><button className="icon-btn" onClick={()=>toast("Settings panel ready for backend preferences","info")}><Settings size={18}/></button></div><div className="profile-hero"><div className="avatar profile">{profile.avatar?<img src={profile.avatar}/>:<span>{(profile.name||"O").slice(0,1).toUpperCase()}</span>}</div><h3>{profile.name||"Unnamed"}</h3><span className="status-line"><i className="online-dot"/> Available</span></div><div className="settings-list"><div><span>Private code</span><b>{profile.code}</b><button onClick={()=>copy(profile.code,"Private code")}><Copy size={16}/></button></div><div><span>Room</span><b>{room}</b><button onClick={()=>copy(room,"Room ID")}><Copy size={16}/></button></div><div><span>Security</span><b>Frontend demo / no E2E claim</b><ShieldCheck size={17}/></div></div><div className="notice"><LockKeyhole size={18}/><div><b>Production security note</b><p>For real private messaging, add authenticated identity, key exchange, audited cryptography, secure storage, server authorization, and transport protections.</p></div></div></section>
}

function Games({toast,haptic}:{toast:any,haptic:any}) {
  const [game,setGame]=useState<"hub"|"ludo"|"carrom">("hub");
  if(game==="ludo") return <Ludo onBack={()=>setGame("hub")} toast={toast} haptic={haptic}/>;
  if(game==="carrom") return <Carrom onBack={()=>setGame("hub")} toast={toast} haptic={haptic}/>;
  return <section className="page"><div className="page-title"><div><div className="eyebrow">ARCADE</div><h2>Play together</h2></div><div className="game-status"><span className="online-dot"/> Local</div></div><p className="muted">Playable local games. Multiplayer synchronization requires a realtime backend; these games never pretend a remote player is connected.</p><div className="game-cards"><button className="game-card ludo-card" onClick={()=>{haptic("medium");setGame("ludo");toast("Ludo started","success")}}><div className="game-icon"><Gamepad2/></div><div><h3>Ludo</h3><p>Dice, tokens, captures, safe zones & win state.</p></div><ChevronRight/></button><button className="game-card carrom-card" onClick={()=>{haptic("medium");setGame("carrom");toast("Carrom started","success")}}><div className="game-icon"><Zap/></div><div><h3>Carrom</h3><p>Touch/mouse striker, collisions, pockets & scoring.</p></div><ChevronRight/></button></div></section>
}

type Token={id:string;player:number;pos:number;finished:boolean};
function Ludo({onBack,toast,haptic}:{onBack:()=>void,toast:any,haptic:any}) {
  const [turn,setTurn]=useState(0),[dice,setDice]=useState(1),[rolling,setRolling]=useState(false),[winner,setWinner]=useState<number|null>(null);
  const [tokens,setTokens]=useState<Token[]>(()=>[0,1].flatMap(p=>[0,1,2,3].map(i=>({id:`${p}-${i}`,player:p,pos:0,finished:false}))));
  const roll=()=>{if(rolling||winner!==null)return;setRolling(true);haptic("light");let n=0;const timer=setInterval(()=>{setDice(1+Math.floor(Math.random()*6));if(++n>8){clearInterval(timer);const d=1+Math.floor(Math.random()*6);setDice(d);setRolling(false);toast(`Player ${turn+1} rolled ${d}`,"info");if(d!==6)setTurn(t=>t?0:1)}},70)};
  const move=(t:Token)=>{if(rolling||winner!==null||t.player!==turn)return;if(dice!==6&&t.pos===0){toast("Roll a 6 to leave base","info");return}const np=Math.min(57,t.pos+dice);setTokens(v=>v.map(x=>x.id===t.id?{...x,pos:np,finished:np>=57}:x));haptic("medium");toast(np>=57?"Token reached home":"Token moved","success");if(np>=57){const count=tokens.filter(x=>x.player===turn&&x.id!==t.id&&x.finished).length;if(count>=3)setWinner(turn)}else if(dice!==6)setTurn(t=>t?0:1)};
  const cell=(t:Token)=>{const x=t.pos===0?(t.player?80:20):8+((t.pos-1)%12)*7.0;const y=t.pos===0?(t.player?20:80):20+Math.floor((t.pos-1)/12)*12;return {left:`${x}%`,top:`${y}%`}};
  return <section className="game-screen"><div className="game-top"><button className="icon-btn" onClick={onBack}><ArrowLeft/></button><div><span>LUDO</span><b>Player {turn+1}'s turn</b></div><button className="ghost" onClick={()=>{setTokens([0,1].flatMap(p=>[0,1,2,3].map(i=>({id:`${p}-${i}`,player:p,pos:0,finished:false}))));setWinner(null);setTurn(0);setDice(1);toast("Game restarted","info")}}>Restart</button></div><div className="ludo-board"><div className="ludo-cross"><div/><div/><div/><div/><div/></div>{[0,1].map(p=><div className={`ludo-base base-${p}`} key={p}><span>{p?"P2":"P1"}</span>{[0,1,2,3].map(i=><button className={`token t${i}`} key={i} style={tokens.find(t=>t.id===`${p}-${i}`)?.pos?cell(tokens.find(t=>t.id===`${p}-${i}`)!):undefined} onClick={()=>move(tokens.find(t=>t.id===`${p}-${i}`)!)}>{i+1}</button>)}</div>)}<div className="ludo-center">HOME</div></div><div className="dice-area"><button className={`dice ${rolling?"rolling":""}`} onClick={roll} aria-label="Roll dice">{dice}</button><p>{winner!==null?`Player ${winner+1} wins!`:rolling?"Rolling…":"Tap the die to roll"}</p></div></section>
}

function Carrom({onBack,toast,haptic}:{onBack:()=>void,toast:any,haptic:any}) {
  const canvas=useRef<HTMLCanvasElement>(null), [score,setScore]=useState([0,0]), [turn,setTurn]=useState(0), [running,setRunning]=useState(false);
  const [coins,setCoins]=useState(()=>Array.from({length:8},(_,i)=>({x:0,y:0,active:true,id:i})));
  const striker=useRef({x:0,y:0,vx:0,vy:0});
  useEffect(()=>{const c=canvas.current;if(!c)return;const ctx=c.getContext("2d")!;let raf=0;const resize=()=>{const d=Math.min(2,devicePixelRatio||1),r=c.getBoundingClientRect();c.width=r.width*d;c.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);coins.forEach((q,i)=>{if(!q.x){q.x=r.width/2+(i%4-1.5)*24;q.y=r.height/2+(Math.floor(i/4)-.5)*24}});striker.current.x=r.width/2;striker.current.y=r.height-55};resize();window.addEventListener("resize",resize);
    const loop=()=>{const r=c.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);ctx.fillStyle="#d6b27a";ctx.fillRect(0,0,r.width,r.height);ctx.strokeStyle="#4c3324";ctx.lineWidth=3;ctx.strokeRect(14,14,r.width-28,r.height-28);ctx.beginPath();ctx.arc(r.width/2,r.height/2,52,0,Math.PI*2);ctx.stroke();[[30,30],[r.width-30,30],[30,r.height-30],[r.width-30,r.height-30]].forEach(([x,y])=>{ctx.fillStyle="#2a1a15";ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill()});
      coins.forEach(q=>{if(!q.active)return;ctx.fillStyle=q.id===0?"#111":"#eee";ctx.beginPath();ctx.arc(q.x,q.y,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#8d725a";ctx.stroke()});ctx.fillStyle="#c48b45";ctx.beginPath();ctx.arc(striker.current.x,striker.current.y,14,0,Math.PI*2);ctx.fill();ctx.stroke();if(running){striker.current.x+=striker.current.vx;striker.current.y+=striker.current.vy;striker.current.vx*=.985;striker.current.vy*=.985;if(Math.hypot(striker.current.vx,striker.current.vy)<.08){setRunning(false);setTurn(t=>t?0:1)};coins.forEach(q=>{if(q.active&&Math.hypot(q.x-striker.current.x,q.y-striker.current.y)<20){q.active=false;setScore(s=>{const n=[...s];n[turn]++;return n});toast("Coin pocketed!","success");haptic("success")}})}raf=requestAnimationFrame(loop)};loop();return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize)}},[running,coins,turn]);
  const shoot=(e:React.PointerEvent)=>{if(running)return;const c=canvas.current!,r=c.getBoundingClientRect();const dx=e.clientX-r.left-striker.current.x,dy=e.clientY-r.top-striker.current.y;const mag=Math.min(18,Math.hypot(dx,dy)/8);striker.current.vx=-dx/Math.max(1,Math.hypot(dx,dy))*mag;striker.current.vy=-dy/Math.max(1,Math.hypot(dx,dy))*mag;setRunning(true);haptic("medium");toast("Striker launched","info")};
  return <section className="game-screen"><div className="game-top"><button className="icon-btn" onClick={onBack}><ArrowLeft/></button><div><span>CARROM</span><b>P{turn+1} · {score[0]} — {score[1]}</b></div><button className="ghost" onClick={()=>{setScore([0,0]);setTurn(0);setCoins(Array.from({length:8},(_,i)=>({x:0,y:0,active:true,id:i})));toast("Board reset","info")}}>Restart</button></div><div className="carrom-wrap"><canvas ref={canvas} onPointerUp={shoot} aria-label="Carrom board; release pointer to shoot"/></div><p className="game-help">Aim by pressing and releasing toward the direction you want the striker to travel. This is a lightweight canvas physics implementation for the browser.</p></section>
}

function AppRoot(){return <App/>}
createRoot(document.getElementById("root")!).render(<React.StrictMode><AppRoot/></React.StrictMode>);
