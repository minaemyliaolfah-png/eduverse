import {loadFirebase} from './firebase-client.js';
import {QUICK_MESSAGES,appearance,firebaseError,normalizeProgress,mergeProgress} from './network-model.js';
import {initialProgress} from './progress.js';

export class OnlineUI {
 constructor({open,close,toast,getProgress,setAccount,getPose,onPeers,onSpeak,onStatus}){Object.assign(this,{open,close,toast,getProgress,setAccount,getPose,onPeers,onSpeak,onStatus});this.client=null;this.state='loading';this.uid=null;this.ready=false;this.sync='Belum masuk';this.peers={};this.members={};this.feed=[];this.seen=new Set();this.hidden=new Set();this.version=0;this.roomStatus='';this.error='';this.lastList='';}
 init(){if(this.initializing)return this.initializing;this.initializing=this.initialize();return this.initializing;}
 async initialize(){
  try{this.client=await loadFirebase();if(!this.client){this.state='unconfigured';this.onStatus('SOLO · FIREBASE BELUM DIATUR');this.renderIfOpen();return;}
   this.state='ready';this.client.onAuth(user=>{this.authChanged(user).catch(e=>{this.error=firebaseError(e);this.renderIfOpen();});});
  }catch(e){this.state='error';this.error=firebaseError(e);this.onStatus('SOLO · KONEKSI BELUM SIAP');this.renderIfOpen();}
 }
 async authChanged(user){
  const version=++this.version;this.ready=false;clearTimeout(this.saveTimer);this.pending=null;this.peers={};this.onPeers({});this.uid=user?.uid||null;
  if(!user){await this.client.leave();this.setAccount(null,null);this.sync='Progres solo';this.onStatus('SOLO · MASUK UNTUK BERTEMU');this.renderIfOpen();return;}
  this.sync='Mengambil progres…';this.onStatus('AKUN MASUK · BELUM DI RUANG');this.renderIfOpen();
  // Never copy a previous user's progress into a newly signed-in account.
  let cache=null;try{cache=JSON.parse(localStorage.getItem(`eduverse-user-${user.uid}`));}catch{}
  const starter=cache?normalizeProgress(cache):{...initialProgress(),...appearance(this.getProgress())};
  this.setAccount(user.uid,starter);
  try{const remote=await this.client.readProgress();if(version!==this.version)return;this.setAccount(user.uid,remote?mergeProgress(remote,cache||remote):starter);this.ready=true;this.sync='Progres tersambung';this.scheduleSave(this.getProgress());}
  catch(e){if(version!==this.version)return;this.sync='Progres cloud gagal dimuat';this.error=firebaseError(e);}
  this.renderIfOpen();
 }
 scheduleSave(progress){
  if(!this.uid||!this.ready)return;this.pending=normalizeProgress(progress);this.sync='Menunggu simpan…';clearTimeout(this.saveTimer);
  this.saveTimer=setTimeout(()=>this.flush(),1600);
 }
 async flush(){
  clearTimeout(this.saveTimer);if(!this.pending||!this.ready||this.saving)return;
  const snapshot=this.pending,version=this.version;this.pending=null;this.saving=true;this.sync='Menyimpan…';
  try{await this.client.saveProgress(snapshot);if(version===this.version){this.sync='Tersimpan di Firebase';this.error='';}}
  catch(e){if(version===this.version){this.pending=this.pending||snapshot;this.sync='Belum tersimpan di cloud';this.error=firebaseError(e);}}
  finally{this.saving=false;this.renderSync();if(this.pending&&version===this.version&&this.sync==='Tersimpan di Firebase')this.saveTimer=setTimeout(()=>this.flush(),1600);}
 }
 renderSync(){const el=document.querySelector('#syncStatus');if(el)el.textContent=this.sync;}
 renderIfOpen(){if(document.querySelector('#onlinePanel'))this.show();}
 frame(){return {...this.getPose(),...appearance(this.getProgress())};}
 async join(code){
  if(!this.ready)throw Error('Muat progres akun terlebih dahulu.');this.error='';this.members={};this.blocked={};this.memberNames={};this.peers={};this.feed=[];this.seen.clear();this.hidden.clear();this.lastList='';
  const room=await this.client.join(code,this.getProgress(),()=>this.frame(),{
   players:players=>{this.peers=players;this.onPeers(Object.fromEntries(Object.entries(players).filter(([uid])=>!this.hidden.has(uid))));this.updatePeople();},
   members:members=>{this.memberNames={...this.memberNames,...Object.fromEntries(Object.entries(members).map(([id,m])=>[id,m.name]))};this.members=members;this.lastList='';this.updatePeople();},
   blocked:blocked=>{this.blocked=blocked;this.updateBlocked();},
   messages:(messages,now)=>{for(const [uid,m] of Object.entries(messages)){if(!Number.isInteger(m.code)||!QUICK_MESSAGES[m.code]||!Number.isFinite(m.at)||now-m.at>45000)continue;const key=`${uid}:${m.at}`;if(this.seen.has(key))continue;this.seen.add(key);if(this.hidden.has(uid))continue;const text=QUICK_MESSAGES[m.code];this.feed.push({name:String(m.name||'Pemain').slice(0,20),text});this.onSpeak(uid,text);}this.feed=this.feed.slice(-30);this.updateFeed();},
   status:status=>{this.roomStatus=status;this.onStatus(`${status} · ${Object.keys(this.peers).length+1} pemain`);const e=document.querySelector('#roomStatus');if(e)e.textContent=status;},
   error:message=>{this.error=message;this.toast(message);},
   left:()=>{this.roomStatus='Keluar dari ruang';this.onStatus('SOLO · AKUN MASUK');this.peers={};this.onPeers({});setTimeout(()=>this.renderIfOpen(),0);}
  });
  this.show();return room;
 }
 show(){
  if(this.state==='loading'){this.open('<div id="onlinePanel"><h2>Menghubungkan layanan…</h2><p>Permainan solo tetap tersedia.</p></div>');this.init();return;}
  if(this.state==='unconfigured'||this.state==='error'){
   this.open(`<div id="onlinePanel"><div class="eyebrow">BERMAIN BERSAMA TEMAN</div><h2>${this.state==='unconfigured'?'Firebase belum dihubungkan.':'Layanan belum dapat dimuat.'}</h2><p>Kode multiplayer sudah tersedia. Aktifkan proyek Firebase dan pasang konfigurasinya agar pemain dari HP berbeda bisa bertemu.</p><a class="primary setup-link" href="setup.html" target="_blank" rel="noopener">Buka panduan penyiapan ↗</a><p class="note">Tanpa konfigurasi, game berjalan solo. NPC tidak dihitung sebagai pemain online.</p><p id="onlineError" role="alert"></p></div>`);document.querySelector('#onlineError').textContent=this.error;return;
  }
  if(!this.uid){
   this.open(`<div id="onlinePanel"><div class="eyebrow">AKUN EDUVERSE ${this.client.emulator?'· UJI LOKAL':''}</div><h2>Temui teman satu ruang.</h2><p>Masuk atau daftar dengan email dan kata sandi. Email hanya dipakai untuk akun; teman melihat nama karaktermu.</p><form id="loginForm"><label for="accountEmail">Email</label><input id="accountEmail" type="email" required autocomplete="email"><label for="accountPassword">Kata sandi</label><div class="password-row"><input id="accountPassword" type="password" required minlength="8" autocomplete="current-password"><button type="button" class="secondary" id="showPassword">Lihat</button></div><p id="onlineError" class="form-error" role="alert"></p><button class="primary">Masuk</button><button type="button" class="secondary" id="register">Daftar akun</button><button type="button" class="secondary" id="resetPassword">Lupa sandi</button></form><p class="note">Progres solo tetap terpisah. Akun baru memulai progres baru. Gunakan akun masing-masing, lalu kode ruang yang sama.</p></div>`);
   const email=document.querySelector('#accountEmail'),password=document.querySelector('#accountPassword'),form=document.querySelector('#loginForm');
   document.querySelector('#showPassword').onclick=e=>{password.type=password.type==='password'?'text':'password';e.target.textContent=password.type==='password'?'Lihat':'Sembunyikan';};
   const login=async(register)=>{if(!form.reportValidity())return;await this.action(async()=>{await this.client.login(email.value,password.value,register);password.value='';},false);};
   form.onsubmit=e=>{e.preventDefault();login(false);};document.querySelector('#register').onclick=()=>login(true);
   document.querySelector('#resetPassword').onclick=async()=>{if(!email.reportValidity())return;await this.action(async()=>{await this.client.resetPassword(email.value);this.toast('Jika email terdaftar, periksa pesan pemulihan akun.');},false);};return;
  }
  const room=this.client.room&&!this.client.room.closed?this.client.room:null;
  this.open(`<div id="onlinePanel"><div class="eyebrow">${room?'RUANG MULTIPLAYER':'AKUN TERHUBUNG'} ${this.client.emulator?'· EMULATOR LOKAL':''}</div><h2>${room?'Bertemu dan belajar bersama.':'Pilih ruang pertemuan.'}</h2><p id="ownEmail"></p><small id="syncStatus"></small><p id="onlineError" class="form-error" role="alert"></p>${room?`<div class="room-code"><small>KODE RUANG · BAGIKAN KE TEMAN</small><b>${room.code}</b><button class="secondary" id="copyRoom">Salin kode</button></div><p id="roomStatus"></p><div class="emotes"><button class="secondary" data-emote="1">👋 Melambai</button><button class="secondary" data-emote="2">🙌 Semangat</button><button class="secondary" data-emote="3">🤔 Berpikir</button></div><h3>Pesan cepat</h3><div class="quick-chat">${QUICK_MESSAGES.map((m,i)=>`<button class="secondary" data-message="${i}">${m}</button>`).join('')}</div><div id="messageFeed" aria-live="polite"></div><h3>Anggota ruang <span id="playerCount"></span></h3><div id="peopleList"></div><p class="note">Nama berlabel NPC adalah pemandu komputer. Daftar ini hanya memuat anggota akun. Maksimal 24 anggota per ruang. ${room.meta.owner===this.uid?'Kamu pemilik ruang dan dapat mengelola anggotanya.':''}</p><button class="secondary" id="leaveRoom">Keluar ruang</button>${room.meta.owner===this.uid?'<button class="secondary" id="closeRoom">Tutup ruang untuk semua</button>':''}`:`<form id="createRoomForm"><label for="roomTitle">Nama ruang baru</label><input id="roomTitle" value="Kelas Bahasa" minlength="2" maxlength="20" required><button class="primary" ${!this.ready?'disabled':''}>Buat ruang</button></form><form id="joinRoomForm"><label for="roomCode">Kode ruang dari guru/teman</label><input id="roomCode" placeholder="8 karakter" minlength="8" maxlength="8" required autocapitalize="characters" autocomplete="off"><button class="primary" ${!this.ready?'disabled':''}>Gabung ruang</button></form>`}<div class="account-tools"><button class="secondary" id="syncNow">${this.ready?'Simpan progres sekarang':'Coba muat progres lagi'}</button><button class="secondary" id="logout">Keluar akun</button></div></div>`);
  document.querySelector('#ownEmail').textContent=this.client.auth.currentUser?.email||'';document.querySelector('#syncStatus').textContent=this.sync;document.querySelector('#onlineError').textContent=this.error;
  document.querySelector('#logout').onclick=()=>this.action(async()=>{await this.flush();if(this.pending)this.toast('Progres terbaru masih tersimpan di perangkat ini. Sinkronkan saat masuk lagi.');await this.client.logout();},false);
  document.querySelector('#syncNow').onclick=()=>this.action(async()=>{if(!this.ready)await this.authChanged(this.client.auth.currentUser);else{this.pending=normalizeProgress(this.getProgress());await this.flush();}},false);
  if(!room){document.querySelector('#createRoomForm').onsubmit=e=>{e.preventDefault();const title=document.querySelector('#roomTitle').value;this.action(async()=>{const code=await this.client.createRoom(title,this.getProgress());await this.join(code);});};document.querySelector('#joinRoomForm').onsubmit=e=>{e.preventDefault();const code=document.querySelector('#roomCode').value;this.action(()=>this.join(code));};return;}
  document.querySelector('#roomStatus').textContent=this.roomStatus;
  document.querySelector('#copyRoom').onclick=async()=>{try{await navigator.clipboard.writeText(room.code);this.toast('Kode ruang disalin.');}catch{this.toast(`Kode ruang: ${room.code}`);}};
  document.querySelector('#leaveRoom').onclick=()=>this.action(async()=>{await this.client.leave();this.show();});
  if(document.querySelector('#closeRoom'))document.querySelector('#closeRoom').onclick=()=>{this.open('<div id="onlinePanel"><h2>Tutup ruang ini?</h2><p>Semua anggota akan keluar dari multiplayer. Progres belajar mereka tetap tersimpan.</p><button class="primary" id="confirmClose">Ya, tutup ruang</button><button class="secondary" id="cancelClose">Batal</button><p id="onlineError"></p></div>');document.querySelector('#cancelClose').onclick=()=>this.show();document.querySelector('#confirmClose').onclick=()=>this.action(()=>room.closeRoom());};
  document.querySelectorAll('[data-message]').forEach(b=>b.onclick=()=>this.action(()=>room.send(Number(b.dataset.message)),false));
  document.querySelectorAll('[data-emote]').forEach(b=>b.onclick=()=>{room.gesture(Number(b.dataset.emote));this.toast('Emote dikirim ke teman.');this.close();});
  this.lastList='';this.updatePeople();this.updateFeed();this.updateBlocked();
 }
 async action(fn,rerender=true){
  const panel=document.querySelector('#onlinePanel');if(!panel||this.busy)return;this.busy=true;panel.querySelectorAll('button').forEach(b=>b.disabled=true);this.error='';
  try{await fn();if(rerender)this.renderIfOpen();}
  catch(e){this.error=e.code?firebaseError(e):e.message;const el=document.querySelector('#onlineError');if(el)el.textContent=this.error;else this.toast(this.error);}
  finally{this.busy=false;if(panel.isConnected)panel.querySelectorAll('button').forEach(b=>b.disabled=false);this.renderSync();}
 }
 updatePeople(){
  const room=this.client?.room;if(!room||room.closed)return;
  const connected=Object.keys(this.peers).length+1;this.onStatus(`${this.roomStatus||'Menyambungkan'} · ${connected} pemain`);
  const list=document.querySelector('#peopleList');if(!list)return;const fingerprint=JSON.stringify([this.members,Object.entries(this.peers).map(([id,p])=>[id,p.name,p.area]),[...this.hidden]]);if(fingerprint===this.lastList)return;this.lastList=fingerprint;list.replaceChildren();
  document.querySelector('#playerCount').textContent=`· ${connected} tersambung`;
  for(const [uid,member] of Object.entries(this.members)){const peer=this.peers[uid],self=uid===this.uid;const row=document.createElement('div');row.className='person-row';const title=document.createElement('span');title.textContent=`${self?this.getProgress().name:peer?.name||member.name} · ${self?'Kamu':peer?({hub:'Huma Betang',river:'Tepian Kahayan',forest:'Rimba Literasi'}[peer.area]||'Online'):'Offline'}`;row.append(title);
   if(!self){const hide=document.createElement('button');hide.className='secondary';hide.textContent=this.hidden.has(uid)?'Tampilkan':'Sembunyikan';hide.onclick=()=>{this.hidden.has(uid)?this.hidden.delete(uid):this.hidden.add(uid);this.onPeers(Object.fromEntries(Object.entries(this.peers).filter(([id])=>!this.hidden.has(id))));this.lastList='';this.updatePeople();};row.append(hide);
    if(room.meta.owner===this.uid)for(const [action,label] of [['mute','Bisukan'],['unmute','Buka suara'],['kick','Keluarkan']]){const b=document.createElement('button');b.className='secondary';b.textContent=label;b.onclick=()=>this.action(()=>room.moderate(uid,action),false);row.append(b);}
   }list.append(row);
  }
 }
 updateBlocked(){
  const room=this.client?.room,panel=document.querySelector('#onlinePanel');if(!panel||!room||room.closed||room.meta.owner!==this.uid)return;
  let list=document.querySelector('#blockedList');if(!list){list=document.createElement('div');list.id='blockedList';document.querySelector('#peopleList')?.after(list);}list.replaceChildren();
  const ids=Object.keys(this.blocked||{});if(!ids.length)return;const heading=document.createElement('h3');heading.textContent='Dikeluarkan dari ruang';list.append(heading);
  for(const uid of ids){const row=document.createElement('div');row.className='person-row';const label=document.createElement('span');label.textContent=this.memberNames?.[uid]||`Akun ${uid.slice(0,8)}…`;const button=document.createElement('button');button.className='secondary';button.textContent='Izinkan bergabung lagi';button.onclick=()=>this.action(()=>room.moderate(uid,'unblock'),false);row.append(label,button);list.append(row);}
 }
 updateFeed(){const list=document.querySelector('#messageFeed');if(!list)return;list.replaceChildren();for(const message of this.feed){const p=document.createElement('p');p.textContent=`${message.name}: ${message.text}`;list.append(p);}list.scrollTop=list.scrollHeight;}
}
