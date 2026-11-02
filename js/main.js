import {OnlineUI} from './online-ui.js';
import {RemotePlayers} from './remote-players.js';
import {npcs} from '../data/npcs.js';
import {createWorld,createAvatar,T} from './world.js';
import {lessons,questions} from '../data/content.js';
import {loadProgress,claimReward,youtubeId,collectClue,finishExpedition} from './progress.js';
import {createControls} from './controls.js';
import {openLobby} from './lobby.js';
import {destinations,expeditions} from '../data/destinations.js';
const $=s=>document.querySelector(s),panel=$('#panel'),content=$('#panelContent');
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error();}};}
const progress=loadProgress(storage);
let storageKey='eduverse-v1',online,remotePlayers;
let game,avatar,controls,near=null,started=false,vertical=0,yaw=0,pitch=.23,lessonIndex=0,quizIndex=0,score=0,quizLocked=false,toastTimer,activeArea='hub',disposeLobby=null;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3400);}
function save(){try{storage.setItem(storageKey,JSON.stringify(progress));}catch{toast('Penyimpanan tidak tersedia. Progres hanya bertahan selama sesi ini.');}refresh();online?.scheduleSave(progress);}
function refresh(){
 $('#playerName').textContent=progress.name;$('#level').textContent=`Level ${1+Math.floor(progress.xp/100)}`;$('#xpbar').style.width=`${progress.xp%100}%`;$('#coins').textContent=progress.coins;
 $('#xpbar').parentElement.setAttribute('aria-label',`${progress.xp} XP`);
 $('#missionSteps').replaceChildren();const exp=progress.expeditions[activeArea];
 const steps=exp?[[exp.found.length===3,`Temukan petunjuk · ${exp.found.length}/3`],[exp.completed,'Susun langkah di meja penyusun']]:[[progress.talked,'Temui Rani di plaza'],[progress.read,'Pelajari 4 kartu materi'],[progress.passed,'Lulus kuis · minimal 4/5']];
 $('#missionTitle').textContent=exp?expeditions[activeArea].title:'Arsiparis Huma Betang';
 $('#missionDescription').textContent=exp?expeditions[activeArea].hint:'Temui Rani, penjaga arsip, lalu pelajari cara merawat koleksi kelas.';
 $('#missionReward').textContent=exp?'✦ 100 XP · ◈ 30 koin':'✦ 150 XP · ◈ 50 koin';
 for(const [done,text] of steps){const el=document.createElement('div');el.className=`step ${done?'done':''}`;el.textContent=`${done?'✓':'○'} ${text}`;$('#missionSteps').append(el);}
 if(exp?exp.completed:progress.claimed){const el=document.createElement('div');el.className='step done';el.textContent='✦ Hadiah sudah diterima';$('#missionSteps').append(el);}
 $('#areaName').textContent=destinations.find(d=>d.id===activeArea).name;
 game?.syncClues(progress);
}
function open(html){controls?.reset();content.innerHTML=html;panel.classList.remove('lobby');$('#closePanel').hidden=false;document.body.classList.add('panel-open');if(!panel.open)panel.showModal();panel.scrollTop=0;}
function close(){panel.close();controls?.reset();$('#world').focus({preventScroll:true});}
function reward(){if(claimReward(progress)){save();toast('Misi selesai! +150 XP · +50 koin · Badge Arsiparis');}}
function replaceAvatar(){
 if(avatar){game.scene.remove(avatar);const geometries=new Set(),materials=new Set();avatar.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
 avatar=createAvatar(progress);game.scene.add(avatar);
}
function travel(id){
 const d=destinations.find(d=>d.id===id);if(!d)return;
 controls?.reset();avatar.position.set(d.x,0,d.z);avatar.rotation.y=Math.PI+d.yaw;vertical=0;yaw=d.yaw;pitch=.23;near=null;activeArea=id;progress.destination=id;
 game.camera.position.set(d.x+Math.sin(yaw)*11,5,d.z+Math.cos(yaw)*11);
 $('#prompt').hidden=true;save();toast(`${d.name} · ${d.activity}`);
}
function showAvatar(first=false){
 controls?.reset();disposeLobby?.();$('#closePanel').hidden=first;document.body.classList.add('panel-open');
 disposeLobby=openLobby({panel,content,progress,initial:first,onFinish:appearance=>{Object.assign(progress,appearance);replaceAvatar();started=true;travel(appearance.destination);save();close();disposeLobby=null;online?.init();},onClose:()=>{disposeLobby=null;}});
}
function showDestinations(){
 open(`<div class="eyebrow">PETA PETUALANGAN · TIGA TEMPAT</div><h2>Pilih ekspedisi berikutnya.</h2><div class="travel-list">${destinations.map(d=>`<button class="travel-card" data-travel="${d.id}"><span>${d.icon}</span><div><b>${d.name}</b><small>${d.activity}</small><small>${d.reward}</small></div><em>→</em></button>`).join('')}</div><p class="note">Ketiga tempat terhubung dalam satu dunia. Kamu juga bisa berjalan ke sana. Progres tiap misi tetap tersimpan.</p>`);
 content.querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>{close();travel(b.dataset.travel);});
}
function showClue(area,index){
 const fresh=collectClue(progress,area,index);if(fresh)save();const exp=expeditions[area];
 open(`<div class="eyebrow">GULUNGAN DITEMUKAN · ${progress.expeditions[area].found.length} / 3</div><h2>${exp.title}</h2><div class="clue-paper">${exp.steps[index]}</div><p>${progress.expeditions[area].found.length===3?'Semua petunjuk terkumpul! Temukan meja penyusun untuk menata urutannya.':'Cari gulungan bercahaya berikutnya. Petunjuk yang sudah ditemukan tersimpan di Tas.'}</p><button class="primary" id="keepExploring">Lanjut menjelajah →</button>`);
 $('#keepExploring').onclick=close;
}
function showPuzzle(area){
 const exp=expeditions[area],entry=progress.expeditions[area];
 if(entry.completed){open(`<div class="eyebrow">EKSPEDISI SELESAI</div><h2>${exp.title}</h2><p>${exp.explanation}</p><p class="note">Badge, 100 XP, dan 30 koin sudah diterima. Pilih tempat lain melalui menu Dunia.</p>`);return;}
 if(entry.found.length<3){open(`<div class="eyebrow">MEJA PENYUSUN</div><h2>Masih ada petunjuk yang tersembunyi.</h2><p>Kumpulkan tiga gulungan di ${destinations.find(d=>d.id===area).name} sebelum menyusun langkah. Saat ini ${entry.found.length}/3 ditemukan.</p><p>${exp.hint}</p>`);return;}
 let order=[];
 function renderPuzzle(){
  open(`<div class="eyebrow">MEJA PENYUSUN · ${exp.title}</div><h2>Susun langkah yang masuk akal.</h2><p>Ketuk kartu sesuai urutan: persiapan → kegiatan → pemeriksaan atau laporan.</p><div class="order-slots">${[0,1,2].map(i=>`<div><b>${i+1}</b><span>${order[i]===undefined?'Pilih kartu di bawah':exp.steps[order[i]]}</span></div>`).join('')}</div><div id="orderCards"></div><p id="orderFeedback" role="status"></p><button class="secondary" id="resetOrder">Ulangi urutan</button><button class="primary" id="checkOrder" ${order.length!==3?'disabled':''}>Periksa susunan</button>`);
  for(const index of [2,0,1]){const b=document.createElement('button');b.className='option';b.textContent=exp.steps[index];b.disabled=order.includes(index);b.onclick=()=>{order.push(index);renderPuzzle();};$('#orderCards').append(b);}
  $('#resetOrder').onclick=()=>{order=[];renderPuzzle();};
  $('#checkOrder').onclick=()=>{if(finishExpedition(progress,area,order)){save();open(`<div class="eyebrow">MISI SELESAI</div><div class="badge">✦</div><h1>Urutanmu tepat!</h1><p>${exp.explanation}</p><div class="reward-banner">+100 XP <span>◈ +30 koin</span></div><button class="primary" id="donePuzzle">Kembali ke dunia →</button>`);$('#donePuzzle').onclick=close;toast('Badge ekspedisi didapat!');}else{$('#orderFeedback').textContent='Belum tepat. Tentukan kegiatan yang harus selesai sebelum langkah berikutnya, lalu ulangi urutan.';}};
 }
 renderPuzzle();
}
function showLesson(){const l=lessons[lessonIndex];open(`<div class="eyebrow">HUMA BETANG ILMU · ${lessonIndex+1} / ${lessons.length}</div><h2>${l[0]}</h2><p>${l[1]}</p><div><button class="secondary" id="previous" ${lessonIndex===0?'disabled':''}>← Sebelumnya</button><button class="primary" id="next">${lessonIndex===3?'Tandai selesai ✓':'Selanjutnya →'}</button></div>`);$('#previous').onclick=()=>{lessonIndex--;showLesson();};$('#next').onclick=()=>{if(lessonIndex<3){lessonIndex++;showLesson();}else{progress.read=true;save();reward();close();toast('Materi selesai. Masuki portal emas untuk menguji pemahamanmu.');}};}
function showQuiz(){if(quizIndex>=questions.length){progress.best=Math.max(progress.best,score);progress.attempts.push(score);progress.attempts=progress.attempts.slice(-20);if(score>=4)progress.passed=true;save();reward();open(`<div class="eyebrow">ARENA BAHASA · HASIL LATIHAN</div><h1>${score} / 5 jawaban benar</h1><p>${score>=4?'Hebat! Kamu berhasil melewati tantangan arsip kelas.':'Belum lulus. Baca kembali materi, lalu coba lagi. Minimal 4 jawaban benar untuk menyelesaikan misi.'}</p><p class="note">Latihan lokal, bukan nilai resmi. Hadiah misi hanya diberikan satu kali setelah ketiga tujuan selesai.</p><button class="primary" id="retry">Coba lagi</button><button class="secondary" id="back">Kembali menjelajah</button>`);$('#retry').onclick=startQuiz;$('#back').onclick=close;return;}
 quizLocked=false;const q=questions[quizIndex];open(`<div class="eyebrow">TANTANGAN ARSIP · SOAL ${quizIndex+1} / 5</div><h2>${q.text}</h2><div id="answers"></div><p id="feedback" aria-live="polite"></p><button class="primary" id="nextQuestion" hidden>Lanjut →</button>`);q.options.forEach((option,i)=>{const b=document.createElement('button');b.className='option';b.textContent=`${String.fromCharCode(65+i)}. ${option}`;b.onclick=()=>{if(quizLocked)return;quizLocked=true;if(i===q.answer)score++;[...$('#answers').children].forEach((el,j)=>{el.disabled=true;if(j===q.answer)el.classList.add('correct');else if(j===i)el.classList.add('wrong');});$('#feedback').textContent=(i===q.answer?'Benar. ':'Belum tepat. ')+q.explanation;$('#nextQuestion').hidden=false;};$('#answers').append(b);});$('#nextQuestion').onclick=()=>{quizIndex++;showQuiz();};}
function startQuiz(){quizIndex=0;score=0;showQuiz();}
function showVideo(){open(`<div class="eyebrow">BIOSKOP PEMBELAJARAN</div><h2>Ruang menonton bersama ide.</h2><p>Masukkan tautan video pembelajaran pilihan guru. Pada tahap ini, tautan disimpan hanya di browser ini.</p><form id="videoForm"><label for="videoUrl">Tautan YouTube</label><input id="videoUrl" type="url" placeholder="https://www.youtube.com/watch?v=…" required><button class="primary">Buka video</button></form><div id="videoPlayer"></div><p class="note">Video memerlukan internet. Jika pemutaran ditolak oleh pemilik video, gunakan “Buka di YouTube”.</p>`);try{$('#videoUrl').value=storage.getItem('eduverse-video')||'';}catch{}$('#videoForm').onsubmit=e=>{e.preventDefault();const id=youtubeId($('#videoUrl').value.trim());if(!id){toast('Tautan YouTube tidak valid. Gunakan watch, youtu.be, atau shorts.');return;}try{storage.setItem('eduverse-video',$('#videoUrl').value);}catch{}$('#videoPlayer').replaceChildren();const iframe=document.createElement('iframe');iframe.title='Video pembelajaran pilihan guru';iframe.src=`https://www.youtube-nocookie.com/embed/${id}`;iframe.allow='fullscreen; encrypted-media; picture-in-picture';iframe.referrerPolicy='strict-origin-when-cross-origin';const a=document.createElement('a');a.className='video-link';a.href=`https://www.youtube.com/watch?v=${id}`;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Buka di YouTube ↗';$('#videoPlayer').append(iframe,a);};}
function show(name){if(name==='online'){online.init();return online.show();}if(name.startsWith('npc:'))return showNPC(name);if(name==='world')return showDestinations();if(name==='mission'&&activeArea!=='hub')return showExpeditionMission(activeArea);if(name.startsWith('clue:')){const [,area,index]=name.split(':');return showClue(area,Number(index));}if(name.startsWith('puzzle:'))return showPuzzle(name.split(':')[1]);if(name==='avatar')return showAvatar();if(name==='lesson'){lessonIndex=0;return showLesson();}if(name==='video')return showVideo();if(name==='quiz')return startQuiz();if(name==='npc'){progress.talked=true;save();reward();open('<div class="eyebrow">RANI · NPC PENJAGA ARSIP</div><h2>Selamat datang, penjelajah!</h2><p>Di ruang belajar Huma Betang, kita akan menata koleksi kelas. Kunjungi portal hijau untuk membaca petunjuk, lalu portal emas untuk menyelesaikan tantangan.</p><p>Perhatikan urutan, kalimat perintah, dan syarat dalam setiap langkah. Kita ingin semua orang mudah menemukan buku!</p><button class="primary" id="accept">Siap, aku akan membantu →</button>');$('#accept').onclick=close;return;}
 if(name==='mission'){open(`<div class="eyebrow">BUKU MISI · 01</div><h2>Arsiparis Huma Betang</h2><p>1. Temui Rani di sebelah kiri tangga.<br>2. Baca empat kartu di portal hijau.<br>3. Jawab benar minimal empat dari lima soal di portal emas.</p><p>Hadiah: 150 XP, 50 koin, dan badge Arsiparis. ${progress.claimed?'Hadiah sudah diterima.':'Hadiah otomatis diterima setelah semua langkah selesai.'}</p><p class="note">Lingkungan terinspirasi Rumah Betang dan sungai Kalimantan Tengah. Misi adalah skenario sekolah fiktif; rincian budaya perlu ditinjau guru.</p>`);return;}
 if(name==='achievements'||name==='bag'){return showInventory(name);}
 if(name==='settings'){open('<div class="eyebrow">PENGATURAN</div><h2>Atur perjalananmu</h2><label for="quality">Kualitas tampilan</label><select id="quality"><option value="high">Standar · bayangan aktif</option><option value="low">Ringan · tanpa bayangan</option></select><p class="note">Mode ringan aktif otomatis saat masuk melalui HP. Gunakan mode ini jika perangkat terasa lambat. Efek suara belum digunakan pada prototype ini.</p><button class="primary" id="resume">Lanjut bermain</button>');$('#quality').value=game.renderer.shadowMap.enabled?'high':'low';$('#quality').onchange=e=>{game.renderer.shadowMap.enabled=e.target.value==='high';game.renderer.setPixelRatio(e.target.value==='high'?Math.min(devicePixelRatio,1.5):1);game.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});};$('#resume').onclick=close;return;}
 open('<div class="eyebrow">PANDUAN PENJELAJAH</div><h2>Seluruh dunia di langkahmu.</h2><p><b>W A S D</b> — berjalan sesuai arah kamera<br><b>Shift</b> — tahan untuk berlari<br><b>Spasi</b> — melompat<br><b>Seret mouse di dunia</b> — putar kamera<br><b>E</b> — berinteraksi saat dekat portal atau Rani<br><b>Esc</b> — jeda / tutup panel<br><b>⌂ Plaza</b> — kembali ke titik awal</p><p class="note">Di HP: gerakkan joystick di kiri, geser dunia dengan jari kanan untuk kamera, dan ketuk tombol Lari, Lompat, atau Interaksi. Dua jari bisa digunakan bersamaan. Gunakan menu Dunia untuk berpindah tempat. Putar HP mendatar untuk pandangan lebih luas.</p>');}
function showNPC(id){
 const npc=npcs.find(n=>n.id===id);if(!npc)return;
 open(`<div class="eyebrow">${npc.name.toUpperCase()} · NPC ${npc.role}</div><h2>Halo, penjelajah!</h2><p>${npc.text}</p><button class="primary" id="npcAction">${npc.button}</button>`);
 document.querySelector('#npcAction').onclick=()=>show(npc.action);
}
function showExpeditionMission(area){
 const entry=progress.expeditions[area],exp=expeditions[area];
 open(`<div class="eyebrow">BUKU MISI · EKSPLORASI</div><h2>${exp.title}</h2><p>${exp.hint}</p><p>1. Dekati setiap gulungan dan ketuk Interaksi.<br>2. Kumpulkan ketiga petunjuk (${entry.found.length}/3).<br>3. Temukan meja penyusun di area ini.<br>4. Susun langkah secara logis.</p><p class="note">${entry.completed?'Misi selesai. Hadiah sudah diterima.':'Hadiah: 100 XP, 30 koin, dan satu badge. Ikuti panah petunjuk di layar.'}</p>`);
}
function showInventory(name) {
 const completed=Number(progress.claimed)+Object.values(progress.expeditions).filter(e=>e.completed).length;
 open(`<div class="eyebrow">${name==='bag'?'TAS PENJELAJAH':'BALAI PRESTASI'}</div><h2>Jejak petualanganmu</h2><div class="stat-grid"><div><b>${progress.xp}</b><small>TOTAL XP</small></div><div><b>${progress.coins}</b><small>KOIN</small></div><div><b>${completed}/3</b><small>MISI</small></div></div><div class="badge-list"><div class="${progress.claimed?'earned':''}">✦<span>Arsiparis</span></div><div class="${progress.expeditions.river.completed?'earned':''}">≈<span>Pengamat sungai</span></div><div class="${progress.expeditions.forest.completed?'earned':''}">♧<span>Pencatat rimba</span></div></div><p>Skor kuis terbaik: ${progress.best}/5 · Materi: ${progress.read?'4/4':'Belum selesai'}<br>Riwayat: ${progress.attempts.length?progress.attempts.map(s=>s+'/5').join(' · '):'Belum ada'}</p><div id="collectedClues"></div><p class="note">Progres solo tersimpan di browser. Jika masuk akun, progres latihan disimpan ke Firebase. Nilai latihan ini bukan penilaian resmi.</p>`);
 for(const area of ['river','forest']){const entry=progress.expeditions[area];const section=document.createElement('section');const title=document.createElement('h3');title.textContent=`${expeditions[area].title} · ${entry.found.length}/3`;section.append(title);for(const i of entry.found){const p=document.createElement('p');p.className='clue-paper';p.textContent=expeditions[area].steps[i];section.append(p);}$('#collectedClues').append(section);}
}
function interact(){if(!panel.open&&started){if(near)show(near.id);else toast('Dekati portal, gulungan, meja penyusun, atau Rani.');}}
function jump(){if(started&&!panel.open&&avatar.position.y<=game.groundHeight(avatar.position.x,avatar.position.z)+.02)vertical=7;}
$('#closePanel').onclick=()=>{if(started)close();};
panel.addEventListener('cancel',e=>{if(!started)e.preventDefault();});
panel.addEventListener('close',()=>{content.querySelectorAll('iframe').forEach(e=>e.remove());controls?.reset();document.body.classList.remove('panel-open');});
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>show(b.dataset.panel));
$('#interact').onclick=interact;$('#prompt').onclick=interact;
$('#run').onclick=()=>{controls.state.running=!controls.state.running;$('#run').setAttribute('aria-pressed',String(controls.state.running));};
$('#jump').onclick=jump;$('#home').onclick=()=>travel('hub');
$('#toggleMission').onclick=()=>{$('.mission').classList.toggle('expanded');$('#toggleMission').setAttribute('aria-expanded',String($('.mission').classList.contains('expanded')));};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Layar penuh tidak tersedia di browser ini. Putar HP mendatar.');}catch{toast('Browser tidak mengizinkan layar penuh. Game tetap bisa dimainkan.');}};
function map(){
 const c=$('#minimap').getContext('2d'),sx=x=>90+x*1.6,sz=z=>65+z*1.6;
 c.fillStyle='#235957';c.fillRect(0,0,180,150);c.fillStyle='#3a9fba';c.fillRect(0,sz(29),180,16);c.fillStyle='#98aa7b';c.fillRect(sx(-16),sz(-9),51,62);c.fillStyle='#d4bd83';c.fillRect(sx(-12),sz(-20),38,17);c.fillRect(sx(-3),sz(28),10,23);c.fillRect(sx(-35),sz(-18),10,63);c.fillRect(sx(18),sz(22),45,8);
 for(const p of game.portals){if(p.id.startsWith('clue:')){const [,area,index]=p.id.split(':');if(progress.expeditions[area].found.includes(Number(index)))continue;}c.fillStyle=p.id==='npc'?'#fff2b6':p.id==='quiz'?'#ffcc71':p.id==='video'?'#bf9aff':'#83e9d7';c.beginPath();c.arc(sx(p.x),sz(p.z),p.id.startsWith('clue:')?2:3,0,Math.PI*2);c.fill();}
 c.save();c.translate(sx(avatar.position.x),sz(avatar.position.z));c.rotate(-yaw);c.fillStyle='#fff';c.beginPath();c.moveTo(0,-5);c.lineTo(4,4);c.lineTo(0,2);c.lineTo(-4,4);c.fill();c.restore();
}
function detectArea(){const {x,z}=avatar.position;return x < -26 ? 'forest' : x>17&&z>16 ? 'river':'hub';}
function isAvailable(p){if(!p.id.startsWith('clue:'))return true;const [,area,index]=p.id.split(':');return !progress.expeditions[area].found.includes(Number(index));}
function updateObjective(){
 let target;
 if(activeArea==='hub')target=!progress.talked?game.portals.find(p=>p.id==='npc'):!progress.read?game.portals.find(p=>p.id==='lesson'):!progress.passed?game.portals.find(p=>p.id==='quiz'):null;
 else target=game.portals.filter(p=>p.id.startsWith(`clue:${activeArea}:`)&&isAvailable(p)).sort((a,b)=>Math.hypot(a.x-avatar.position.x,a.z-avatar.position.z)-Math.hypot(b.x-avatar.position.x,b.z-avatar.position.z))[0]||(!progress.expeditions[activeArea].completed?game.portals.find(p=>p.id===`puzzle:${activeArea}`):null);
 $('#objective').hidden=!target;
 if(target){const dx=target.x-avatar.position.x,dz=target.z-avatar.position.z,angle=Math.atan2(dx,-dz)+yaw;$('#objectiveArrow').style.transform=`rotate(${angle}rad)`;$('#objectiveText').textContent=`${target.title} · ${Math.round(Math.hypot(dx,dz))} m`;}
}
try{
 game=createWorld($('#world'));remotePlayers=new RemotePlayers(game.scene);replaceAvatar();avatar.position.set(0,0,21);avatar.rotation.y=Math.PI;
 controls=createControls({canvas:$('#world'),stick:$('#joystick'),knob:$('#joystickKnob'),active:()=>started&&!panel.open,turn:(dx,dy)=>{yaw-=dx;pitch=Math.max(.12,Math.min(.8,pitch+dy));},jump,interact,pause:()=>show('settings')});
 online=new OnlineUI({open,close,toast,getProgress:()=>progress,getPose:()=>({x:avatar.position.x,y:avatar.position.y,z:avatar.position.z,angle:Math.atan2(Math.sin(avatar.rotation.y),Math.cos(avatar.rotation.y)),area:activeArea,moving:started&&!panel.open&&controls.read().moving>0}),setAccount:(uid,value)=>{storageKey=uid?`eduverse-user-${uid}`:'eduverse-v1';Object.assign(progress,value||loadProgress(storage));replaceAvatar();if(started)travel(progress.destination);else refresh();},onPeers:peers=>remotePlayers.set(peers),onSpeak:(uid,message)=>remotePlayers.speak(uid,message),onStatus:status=>{const label=document.querySelector('.local');label.textContent=status.startsWith('Online')?'● ONLINE':'● SOLO';label.title=status;$('#onlineState').textContent=status.startsWith('Online')?'Online':'Teman';$('#onlineButton').title=status;}});
 refresh();$('#loading').remove();showAvatar(true);
 const clock=new T.Clock();let elapsed=0,lastUI=0;const desired=new T.Vector3(),target=new T.Vector3();game.camera.position.set(0,6,34);
 $('#world').addEventListener('webglcontextlost',e=>{e.preventDefault();controls.reset();open('<h2>Tampilan 3D terhenti.</h2><p>Perangkat mungkin kehabisan memori grafis. Progres yang tersimpan tetap aman. Muat ulang halaman dan gunakan mode ringan.</p><button class="primary" id="reloadGame">Muat ulang</button>');$('#reloadGame').onclick=()=>location.reload();});
 function frame(){
  requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
  if(started&&!panel.open){
   const input=controls.read();
   if(input.moving){const speed=(input.run?8:4.5)*dt,dx=(input.x*Math.cos(yaw)+input.z*Math.sin(yaw))*speed,dz=(-input.x*Math.sin(yaw)+input.z*Math.cos(yaw))*speed;
    // Small movement steps prevent walking through thin rails at low frame rates.
    const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));for(let i=0;i<count;i++){if(!game.blocked(avatar.position.x+dx/count,avatar.position.z))avatar.position.x+=dx/count;if(!game.blocked(avatar.position.x,avatar.position.z+dz/count))avatar.position.z+=dz/count;}
    const angle=Math.atan2(dx,dz);avatar.rotation.y+=Math.atan2(Math.sin(angle-avatar.rotation.y),Math.cos(angle-avatar.rotation.y))*Math.min(1,dt*16);
   }
   const floor=game.groundHeight(avatar.position.x,avatar.position.z);vertical-=18*dt;avatar.position.y=Math.max(floor,avatar.position.y+vertical*dt);if(avatar.position.y===floor)vertical=0;
   avatar.userData.limbs.forEach((limb,i)=>{const sign=[1,-1,-1,1][i];limb.rotation.x=avatar.position.y>game.groundHeight(avatar.position.x,avatar.position.z)+.1?(i%2===0?-.6:.3):input.moving?Math.sin(elapsed*(input.run?14:9))*.65*sign*input.moving:Math.sin(elapsed*2)*.025;});
   const area=detectArea();if(area!==activeArea){activeArea=area;refresh();}
   near=game.portals.reduce((best,p)=>{if(!isAvailable(p))return best;const d=Math.hypot(avatar.position.x-p.x,avatar.position.z-p.z);return d<3.2&&(!best||d<best.d)?{...p,d}:best;},null);
   $('#prompt').hidden=!near;if(near)$('#prompt').textContent=`${matchMedia('(pointer:coarse)').matches?'Ketuk':'E'} · ${near.title}`;
   $('#interact').classList.toggle('ready',!!near);$('#location').textContent=near?near.title:destinations.find(d=>d.id===activeArea).name;
  }
  target.copy(avatar.position).add(new T.Vector3(0,1.5,0));const distance=innerWidth<600?10:12;desired.set(target.x+Math.sin(yaw)*distance*Math.cos(pitch),target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*distance*Math.cos(pitch));
  for(let fraction=.1;fraction<=1;fraction+=.04){const x=T.MathUtils.lerp(target.x,desired.x,fraction),z=T.MathUtils.lerp(target.z,desired.z,fraction),y=T.MathUtils.lerp(target.y,desired.y,fraction);if(y<10&&game.solids.some(o=>o.z< -10&&o.w>8&&Math.abs(x-o.x)<o.w/2+.3&&Math.abs(z-o.z)<o.d/2+.3)){desired.lerpVectors(target,desired,Math.max(.1,fraction-.08));break;}}
  game.camera.position.lerp(desired,1-Math.exp(-10*dt));game.camera.lookAt(target);
  remotePlayers.update(dt,elapsed,avatar.position,online?.client?.room?.now()||Date.now());
  const gesture=online?.client?.room;if(gesture?.ready&&Date.now()-(gesture.emoteAt-gesture.offset)<4000&&gesture.emote){avatar.userData.limbs[0].rotation.z=-2.4+Math.sin(elapsed*10)*.3;if(gesture.emote===2)avatar.userData.limbs[2].rotation.z=2.4;}else{avatar.userData.limbs[0].rotation.z=avatar.userData.limbs[2].rotation.z=0;}
  const ground=game.groundHeight(avatar.position.x,avatar.position.z);game.playerShadow.position.set(avatar.position.x,ground+.015,avatar.position.z);game.playerShadow.material.opacity=Math.max(.07,.22-(avatar.position.y-ground)*.07);
  if(elapsed-lastUI>.1){map();if(started)updateObjective();lastUI=elapsed;}
  // The lobby preview has its own small renderer; keep the background inexpensive.
  if(!document.hidden&&(!panel.open||Math.floor(elapsed*10)!==Math.floor((elapsed-dt)*10))){game.update(elapsed);game.renderer.render(game.scene,game.camera);}
 }
 frame();addEventListener('resize',()=>{game.camera.aspect=innerWidth/innerHeight;game.camera.updateProjectionMatrix();game.renderer.setSize(innerWidth,innerHeight);});
}catch(error){console.error(error);const notice=$('#loading')||document.body.appendChild(document.createElement('div'));notice.id='loading';notice.textContent='Dunia 3D belum dapat dimuat. Gunakan browser terbaru dengan WebGL2, lalu buka lewat GitHub Pages atau server lokal.';}



