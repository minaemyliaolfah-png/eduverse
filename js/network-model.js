import { initialProgress, loadProgress } from './progress.js';
export const QUICK_MESSAGES = ['Halo, teman!', 'Ayo ke Huma Betang.', 'Ayo ke tepian sungai.', 'Ayo ke Rimba Literasi.', 'Aku butuh bantuan.', 'Terima kasih!', 'Misi selesai!', 'Tunggu sebentar, ya.'];
export function cleanName(value) { return String(value || 'Penjelajah').replace(/[<>\r\n]/g, '').trim().slice(0, 20) || 'Penjelajah'; }
export function validRoom(code) { return /^[A-HJ-NP-Z2-9]{8}$/.test(code); }
export function roomCode() { const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789', bytes=crypto.getRandomValues(new Uint8Array(8)); return [...bytes].map(b=>chars[b%chars.length]).join(''); }
export function normalizeProgress(value) { return loadProgress({getItem:()=>JSON.stringify(value || initialProgress())}); }
// Completion is monotonic across devices. This is practice progress, not a trusted grade.
export function mergeProgress(remote, local) {
  const a=normalizeProgress(remote),b=normalizeProgress(local),p={...b};
  for(const key of ['talked','read','passed','claimed'])p[key]=a[key]||b[key];
  p.best=Math.max(a.best,b.best);p.attempts=(b.attempts.length>=a.attempts.length?b.attempts:a.attempts).slice(-20);
  p.expeditions={};for(const area of ['river','forest'])p.expeditions[area]={found:[...new Set([...a.expeditions[area].found,...b.expeditions[area].found])].sort(),completed:a.expeditions[area].completed||b.expeditions[area].completed};
  return normalizeProgress(p);
}
export function appearance(p){return {name:cleanName(p.name),character:['explorer','ranger','maker'].includes(p.character)?p.character:'explorer',skin:/^#[a-f0-9]{6}$/i.test(p.skin)?p.skin:'#dca977',shirt:/^#[a-f0-9]{6}$/i.test(p.shirt)?p.shirt:'#237e91',hair:/^#[a-f0-9]{6}$/i.test(p.hair)?p.hair:'#302c29'};}
export function safePose(p){
  if(!p || !['x','y','z','angle','at'].every(k=>Number.isFinite(p[k])) || Math.abs(p.x)>50 || p.y<0 || p.y>12 || p.z< -40 || p.z>46 || !['hub','river','forest'].includes(p.area))return null;
  return {...appearance(p),x:p.x,y:p.y,z:p.z,angle:p.angle,area:p.area,moving:!!p.moving,emote:[0,1,2,3].includes(p.emote)?p.emote:0,emoteAt:Number.isFinite(p.emoteAt)?p.emoteAt:0,at:p.at};
}
export function latestPlayers(tree,self,now){
  const result={};for(const [uid,sessions] of Object.entries(tree||{})){if(uid===self)continue;for(const value of Object.values(sessions||{})){const p=safePose(value);if(p&&now-p.at<45000&&p.at<=now+10000&&(!result[uid]||p.at>result[uid].at))result[uid]=p;}}
  return result;
}
export function firebaseError(error){const code=String(error?.code||error?.message||'');if(/invalid-credential|wrong-password|user-not-found/.test(code))return 'Email atau kata sandi tidak cocok.';if(/email-already-in-use/.test(code))return 'Email sudah terdaftar. Gunakan Masuk.';if(/invalid-email/.test(code))return 'Format email belum benar.';if(/weak-password/.test(code))return 'Gunakan kata sandi minimal 8 karakter.';if(/too-many-requests/.test(code))return 'Terlalu banyak percobaan. Tunggu sebelum mencoba lagi.';if(/permission.denied|PERMISSION_DENIED|permission-denied/i.test(code))return 'Akses ditolak. Periksa kode ruang, status anggota, dan Security Rules Firebase.';if(/network|unavailable|timeout|offline/i.test(code))return 'Koneksi terputus atau layanan belum tersedia. Coba lagi setelah internet tersambung.';return 'Operasi belum berhasil. Periksa konfigurasi Firebase dan koneksi, lalu coba lagi.';}
