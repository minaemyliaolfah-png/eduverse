import { createAvatar, T } from './world.js';
import { characters, destinations } from '../data/destinations.js';

export function openLobby({ panel, content, progress, initial, onFinish, onClose }) {
  let step = initial ? 0 : 1, selected = progress.character || 'explorer', place = progress.destination || 'hub';
  let name = initial && progress.name === 'Penjelajah' ? '' : progress.name;
  const colors = { skin: progress.skin, shirt: progress.shirt, hair: progress.hair };
  let cleanup = () => {};
  panel.classList.add('lobby');
  function render() {
    cleanup();
    content.innerHTML = `<div class="lobby-brand">EDUVERSE<span>✦</span></div><div class="lobby-steps" aria-label="Langkah masuk"><span class="${step===0?'current':''}">01 NAMA</span><span class="${step===1?'current':''}">02 KARAKTER</span><span class="${step===2?'current':''}">03 TEMPAT</span></div><div id="lobbyBody"></div>`;
    const body = content.querySelector('#lobbyBody');
    if (step === 0) {
      body.innerHTML = `<div class="welcome-art"><span>⌂</span><i>✦</i><b>EKSPEDISI BAHASA</b></div><h1>Duniamu. Karaktermu.<br>Petualanganmu.</h1><p>Jelajahi dunia 3D, temukan petunjuk, dan taklukkan misi Bahasa Indonesia.</p><form id="nameForm"><label for="displayName">Siapa nama penjelajahmu?</label><input id="displayName" maxlength="20" minlength="2" placeholder="Ketik namamu…" autocomplete="nickname" required><p id="nameError" class="form-error" role="alert"></p><button class="primary wide">Pilih karakter →</button></form><div class="lobby-foot">SENTUH & KEYBOARD <span>✦</span> 3 TEMPAT <span>✦</span> SOLO & MULTIPLAYER</div>`;
      const input = body.querySelector('input'); input.value = name;
      body.querySelector('form').onsubmit = e => {
        e.preventDefault(); const value = input.value.trim();
        if (!/^[\p{L}\p{N} _.-]{2,20}$/u.test(value)) { body.querySelector('#nameError').textContent = 'Gunakan 2–20 huruf, angka, spasi, titik, atau tanda hubung.'; return; }
        name = value; step = 1; render();
      };
    } else if (step === 1) {
      body.innerHTML = `<h1>Pilih teman petualanganmu.</h1><p>Tiga gaya orisinal. Putar karakter dengan menggeser pratinjau.</p><div class="character-layout"><div class="avatar-stage"><canvas id="avatarPreview" aria-label="Pratinjau karakter 3D, geser untuk memutar"></canvas><small>↔ GESER UNTUK MEMUTAR</small></div><div><div class="character-options">${characters.map(c=>`<button type="button" data-character="${c.id}" class="character-card ${selected===c.id?'selected':''}" aria-pressed="${selected===c.id}"><b>${c.name}</b><small>${c.detail}</small><span>${selected===c.id?'✓':'○'}</span></button>`).join('')}</div><div class="color-options"><label>Pakaian<input type="color" id="shirt" value="${colors.shirt}"></label><label>Kulit<input type="color" id="skin" value="${colors.skin}"></label><label>Rambut<input type="color" id="hair" value="${colors.hair}"></label></div></div></div><div class="lobby-nav"><button class="secondary" id="backLobby">← Nama</button><button class="primary" id="nextLobby">Pilih tempat →</button></div>`;
      cleanup = avatarPreview(body.querySelector('canvas'), { ...colors, character: selected });
      body.querySelectorAll('[data-character]').forEach(button => button.onclick = () => {
        selected = button.dataset.character; const c = characters.find(c => c.id === selected);
        Object.assign(colors, { skin: c.skin, shirt: c.shirt, hair: c.hair }); render();
      });
      for (const key of ['skin', 'shirt', 'hair']) body.querySelector('#'+key).oninput = e => { colors[key] = e.target.value; cleanup.update(key, colors[key]); };
      body.querySelector('#backLobby').onclick = () => { step = 0; render(); };
      body.querySelector('#nextLobby').onclick = () => { step = 2; render(); };
    } else {
      body.innerHTML = `<h1>Mau menjelajah ke mana?</h1><p>Setiap tempat punya tantangan berbeda. Kamu bisa berpindah kapan saja lewat menu Dunia.</p><div class="destination-grid">${destinations.map(d=>`<button class="destination ${place===d.id?'selected':''}" data-place="${d.id}" aria-pressed="${place===d.id}" style="--place:${d.color}"><div class="place-art ${d.id}"><span>${d.icon}</span><i>✦</i></div><small>${d.subtitle}</small><h3>${d.name}</h3><p>${d.description}</p><em>${d.activity}</em><strong>✦ ${d.reward}</strong></button>`).join('')}</div><div class="lobby-nav"><button class="secondary" id="backLobby">← Karakter</button><button class="primary" id="enterWorld">Masuk dunia →</button></div><small class="lobby-foot">HP: joystick kiri + geser dunia untuk kamera. Posisi mendatar lebih nyaman.</small>`;
      body.querySelectorAll('[data-place]').forEach(button => button.onclick = () => { place = button.dataset.place; render(); });
      body.querySelector('#backLobby').onclick = () => { step = 1; render(); };
      body.querySelector('#enterWorld').onclick = () => {
        dispose(); onFinish({ name, character: selected, destination: place, ...colors });
      };
    }
    panel.scrollTop = 0;
  }
  function dispose() { cleanup(); panel.classList.remove('lobby'); panel.removeEventListener('close', closed); }
  function closed() { dispose(); onClose?.(); }
  panel.addEventListener('close', closed);
  render(); if (!panel.open) panel.showModal();
  return dispose;
}

function avatarPreview(canvas, appearance) {
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, .1, 30);
  camera.position.set(0, 1.7, 5.8); camera.lookAt(0, 1.35, 0);
  scene.add(new T.HemisphereLight('#ffffff', '#8195ae', 2.5));
  const light = new T.DirectionalLight('#fff4dc', 2); light.position.set(-2, 4, 5); scene.add(light);
  const avatar = createAvatar(appearance); scene.add(avatar);
  let frame, previous = 0, pointer = null, last = 0, angle = -.3;
  canvas.onpointerdown = e => { pointer=e.pointerId; last=e.clientX; canvas.setPointerCapture(pointer); };
  canvas.onpointermove = e => { if(e.pointerId===pointer){angle+=(e.clientX-last)*.018;last=e.clientX;} };
  canvas.onpointerup = canvas.onpointercancel = () => { pointer=null; };
  function draw(time) {
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio())){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    if(pointer===null)angle+=Math.min((time-previous)/1000,.05)*.3;previous=time;
    avatar.rotation.y=angle;renderer.render(scene,camera);frame=requestAnimationFrame(draw);
  }
  frame=requestAnimationFrame(draw);
  const dispose=()=>{cancelAnimationFrame(frame);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();};
  dispose.update=(key,value)=>avatar.userData[key].color.set(value);
  return dispose;
}
