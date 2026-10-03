(function(){
"use strict";
var C=window.JUST_US_CONFIG||{};
var app=document.getElementById("app"), toast=document.getElementById("toast"), topStatus=document.getElementById("topStatus");
var state={room:null,deviceId:null,name:"",page:"home",messages:[],poll:null,lastMessageId:null};

function uid(){return "d-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}
state.deviceId=localStorage.getItem("justus_device_id")||uid();localStorage.setItem("justus_device_id",state.deviceId);
state.name=localStorage.getItem("justus_name")||"You";

function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function showToast(s){toast.textContent=s;toast.className="toast show";setTimeout(function(){toast.className="toast"},2400)}
function cfgOk(){return C.SUPABASE_URL&&C.SUPABASE_URL.indexOf("https://")===0&&C.SUPABASE_ANON_KEY&&C.SUPABASE_ANON_KEY.indexOf("YOUR-")!==0}
function api(path,method,body,prefer){return new Promise(function(resolve,reject){
 if(!cfgOk()){reject(new Error("Add your Supabase URL and publishable/anon key in config.js"));return}
 var x=new XMLHttpRequest();x.open(method||"GET",C.SUPABASE_URL+"/rest/v1/"+path,true);
 x.setRequestHeader("apikey",C.SUPABASE_ANON_KEY);x.setRequestHeader("Authorization","Bearer "+C.SUPABASE_ANON_KEY);x.setRequestHeader("Content-Type","application/json");
 if(prefer)x.setRequestHeader("Prefer",prefer);
 x.onreadystatechange=function(){if(x.readyState!==4)return;var d=null;try{d=x.responseText?JSON.parse(x.responseText):null}catch(e){}
 if(x.status>=200&&x.status<300)resolve(d);else reject(new Error((d&&d.message)||x.responseText||("HTTP "+x.status)))};
 x.onerror=function(){reject(new Error("Network error"))};x.send(body?JSON.stringify(body):null)
})}
function rpc(fn,body){return new Promise(function(resolve,reject){
 if(!cfgOk()){reject(new Error("Add your Supabase URL and publishable/anon key in config.js"));return}
 var x=new XMLHttpRequest();x.open("POST",C.SUPABASE_URL+"/rest/v1/rpc/"+fn,true);
 x.setRequestHeader("apikey",C.SUPABASE_ANON_KEY);x.setRequestHeader("Authorization","Bearer "+C.SUPABASE_ANON_KEY);x.setRequestHeader("Content-Type","application/json");
 x.onreadystatechange=function(){if(x.readyState!==4)return;var d=null;try{d=x.responseText?JSON.parse(x.responseText):null}catch(e){}
 if(x.status>=200&&x.status<300)resolve(d);else reject(new Error((d&&d.message)||x.responseText||("HTTP "+x.status)))};
 x.onerror=function(){reject(new Error("Network error"))};x.send(JSON.stringify(body||{}))
})}
function cleanCode(v){return String(v||"").trim().replace(/\s+/g,"").toUpperCase()}
function home(){
 stopPoll();state.page="home";setNav("home");
 app.innerHTML='<section class="hero"><div class="eyebrow">A private space for two</div><h1>Just you two.</h1><p>No feed. No noise. Just a room that belongs to the two people who know the code.</p></section>'+
 '<section class="panel room-panel">'+
 '<div class="action-card"><div><div class="icon">♡</div><h2>Create your private room</h2><p>Generate a six-character room code. Share it with one person.</p></div><button class="primary" id="createBtn">Create private room</button></div>'+
 '<div class="action-card"><div><div class="icon">⌁</div><h2>Join with a code</h2><p>Type the exact code. Spaces and letter case are ignored safely.</p></div><div class="code-row"><input id="joinCode" class="code-input" maxlength="12" inputmode="text" autocomplete="off" placeholder="ROOM CODE"><button class="secondary" id="joinBtn">Join</button></div></div>'+
 '</section>'+
 '<section class="features"><div class="feature">💬<b>Chat</b><span>Simple private messages with lightweight polling.</span></div><div class="feature">📷<b>Moments</b><span>A space for little photos and memories.</span></div><div class="feature">🎮<b>Play</b><span>Room for games without making the home screen busy.</span></div><div class="feature">🔒<b>Private</b><span>Room membership is controlled by the shared code.</span></div></section>';
 document.getElementById("createBtn").onclick=createRoom;document.getElementById("joinBtn").onclick=joinRoom;
}
function createRoom(){var b=document.getElementById("createBtn");b.disabled=true;b.textContent="Creating…";rpc("create_private_room",{p_device_id:state.deviceId,p_display_name:state.name}).then(function(r){state.room=r[0]||r;localStorage.setItem("justus_room_code",state.room.code);showToast("Room created: "+state.room.code);roomPage()}).catch(function(e){showToast(e.message)}).then(function(){b.disabled=false;b.textContent="Create private room"})}
function joinRoom(){var code=cleanCode(document.getElementById("joinCode").value);if(!code){showToast("Enter the room code");return}
var b=document.getElementById("joinBtn");b.disabled=true;b.textContent="Joining…";rpc("join_private_room",{p_code:code,p_device_id:state.deviceId,p_display_name:state.name}).then(function(r){state.room=r[0]||r;localStorage.setItem("justus_room_code",state.room.code);showToast("Connected to "+state.room.code);roomPage()}).catch(function(e){showToast(e.message)}).then(function(){b.disabled=false;b.textContent="Join"})}
function roomPage(){state.page="chat";setNav("chat");topStatus.textContent="room "+state.room.code;app.innerHTML='<section class="hero"><div class="eyebrow">Private space</div><div class="room-head"><div><h1 style="font-size:42px">Just Us ♡</h1><div class="room-code">Room <strong>'+esc(state.room.code)+'</strong> · connected</div></div><button class="secondary" id="leaveBtn" style="width:auto;padding:10px 13px">Leave</button></div></section><section class="panel"><div id="chatbox" class="chatbox"><div class="empty">Loading your private conversation…</div></div><div class="compose"><input id="msgInput" maxlength="1000" autocomplete="off" placeholder="Write something…"><button id="sendBtn" class="primary" style="width:auto">Send</button></div></section>';
 document.getElementById("leaveBtn").onclick=leaveRoom;document.getElementById("sendBtn").onclick=sendMessage;document.getElementById("msgInput").onkeydown=function(e){if(e.key==="Enter")sendMessage()};loadMessages();startPoll()
}
function loadMessages(){api("messages?room_id=eq."+encodeURIComponent(state.room.id)+"&select=id,device_id,display_name,body,created_at&order=created_at.asc&limit=100","GET").then(function(rows){state.messages=rows||[];renderMessages()}).catch(function(e){showToast(e.message)})}
function renderMessages(){var box=document.getElementById("chatbox");if(!box)return;if(!state.messages.length){box.innerHTML='<div class="empty">This is your space. Say hello. ♡</div>';return}
box.innerHTML=state.messages.map(function(m){return '<div class="msg '+(m.device_id===state.deviceId?"mine":"")+'"><div>'+esc(m.body)+'</div><small>'+esc(m.display_name||"You")+' · '+new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</small></div>'}).join("");box.scrollTop=box.scrollHeight}
function sendMessage(){var input=document.getElementById("msgInput"),body=(input.value||"").trim();if(!body||!state.room)return;input.disabled=true;
api("messages","POST",{room_id:state.room.id,device_id:state.deviceId,display_name:state.name,body:body},"return=minimal").then(function(){input.value="";loadMessages()}).catch(function(e){showToast(e.message)}).then(function(){input.disabled=false;input.focus()})}
function startPoll(){stopPoll();state.poll=setInterval(function(){if(state.room)loadMessages()},2500)}
function stopPoll(){if(state.poll){clearInterval(state.poll);state.poll=null}}
function leaveRoom(){stopPoll();state.room=null;topStatus.textContent="private space";home()}
function setNav(n){document.querySelectorAll(".nav-item").forEach(function(b){b.className="nav-item "+(b.getAttribute("data-nav")===n?"active":"")})}
document.querySelectorAll("[data-nav]").forEach(function(b){b.onclick=function(){var n=b.getAttribute("data-nav");if(n==="home")home();else if(n==="chat"){if(state.room)roomPage();else{home();showToast("Create or join a room first")}}else{setNav(n);app.innerHTML='<section class="hero"><div class="eyebrow">Coming together</div><h1>'+esc(n.charAt(0).toUpperCase()+n.slice(1))+'.</h1><p class="muted">This section stays lightweight so older phones are not forced to load features they cannot use.</p></section>'}}});
home();
})();
