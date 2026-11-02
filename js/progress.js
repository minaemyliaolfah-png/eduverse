export function initialProgress() {
  return { name: 'Penjelajah', character: 'explorer', destination: 'hub', skin: '#dca977', shirt: '#237e91', hair: '#302c29', xp: 0, coins: 0, talked: false, read: false, passed: false, claimed: false, best: 0, attempts: [],
    expeditions: { river: { found: [], completed: false }, forest: { found: [], completed: false } } };
}
export function loadProgress(storage) {
  try {
    const raw = JSON.parse(storage.getItem('eduverse-v1'));
    if (!raw || typeof raw !== 'object') return initialProgress();
    const p = initialProgress();
    for (const key of ['talked', 'read', 'passed', 'claimed']) p[key] = raw[key] === true;
    for (const key of ['skin', 'shirt', 'hair']) if (/^#[0-9a-f]{6}$/i.test(raw[key])) p[key] = raw[key];
    if (typeof raw.name === 'string') p.name = raw.name.replace(/[<>]/g, '').slice(0, 20) || p.name;
    if (['explorer', 'ranger', 'maker'].includes(raw.character)) p.character = raw.character;
    if (['hub', 'river', 'forest'].includes(raw.destination)) p.destination = raw.destination;
    p.best = Number.isFinite(raw.best) ? Math.min(5, Math.max(0, raw.best)) : 0;
    p.attempts = Array.isArray(raw.attempts) ? raw.attempts.filter(n => Number.isInteger(n) && n >= 0 && n <= 5).slice(-20) : [];
    for (const id of ['river', 'forest']) {
      const entry = raw.expeditions?.[id];
      if (entry && Array.isArray(entry.found)) p.expeditions[id].found = [...new Set(entry.found.filter(n => Number.isInteger(n) && n >= 0 && n < 3))];
      p.expeditions[id].completed = entry?.completed === true && p.expeditions[id].found.length === 3;
    }
    recalculateRewards(p); return p;
  } catch { return initialProgress(); }
}
function recalculateRewards(p) {
  const completed = Object.values(p.expeditions).filter(e => e.completed).length;
  p.xp = (p.claimed ? 150 : 0) + completed * 100;
  p.coins = (p.claimed ? 50 : 0) + completed * 30;
}
export function claimReward(p) {
  if (p.claimed || !p.talked || !p.read || !p.passed) return false;
  p.claimed = true; recalculateRewards(p); return true;
}
export function collectClue(p, area, index) {
  const entry = p.expeditions[area];
  if (!entry || !Number.isInteger(index) || index < 0 || index > 2 || entry.found.includes(index)) return false;
  entry.found.push(index); return true;
}
export function finishExpedition(p, area, order) {
  const entry = p.expeditions[area];
  if (!entry || entry.found.length !== 3 || entry.completed || order.length !== 3 || !order.every((n, i) => n === i)) return false;
  entry.completed = true; recalculateRewards(p); return true;
}
export function youtubeId(value){try{const u=new URL(value);if(u.protocol!=='https:')return null;let id;if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)){id=u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.startsWith('/shorts/')?u.pathname.split('/')[2]:null;}return /^[\w-]{11}$/.test(id||'')?id:null;}catch{return null;}}
