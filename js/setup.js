export function parseWebConfig(text,databaseURL=''){
 if(/private_key|service_account|BEGIN PRIVATE KEY/.test(text))throw Error('Ini tampaknya kunci privat. Gunakan konfigurasi aplikasi WEB dari Project settings, bukan service account.');
 const config={};for(const key of ['apiKey','authDomain','projectId','databaseURL','appId','storageBucket','messagingSenderId']){
  const match=text.match(new RegExp(`["']?${key}["']?\\s*:\\s*["']([^"'\\r\\n]+)["']`));if(match)config[key]=match[1];
 }
 if(databaseURL.trim())config.databaseURL=databaseURL.trim();
 for(const key of ['apiKey','authDomain','projectId','databaseURL','appId'])if(!config[key])throw Error(`Kolom ${key} belum ditemukan.`);
 if(!/^[a-z][a-z0-9-]{4,29}$/.test(config.projectId))throw Error('projectId tidak sesuai format Firebase. Salin dari pengaturan proyek.');
 const url=new URL(config.databaseURL);if(url.protocol!=='https:'||!/(\.firebaseio\.com|\.firebasedatabase\.app)$/.test(url.hostname)||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw Error('databaseURL harus alamat HTTPS Realtime Database Firebase, tanpa path atau parameter.');
 if(!/^[A-Za-z0-9._-]+$/.test(config.authDomain))throw Error('authDomain tidak valid. Salin domain dari konfigurasi Firebase.');
 if(!/^AIza[\w-]{20,}$/.test(config.apiKey)||!config.appId.startsWith('1:'))throw Error('apiKey atau appId belum sesuai. Tempel konfigurasi web asli dari Firebase.');
 return config;
}
if(typeof document!=='undefined')document.querySelector('#configForm')?.addEventListener('submit',event=>{
 event.preventDefault();const status=document.querySelector('#configMessage'),preview=document.querySelector('#configPreview');
 try{const config=parseWebConfig(document.querySelector('#configText').value,document.querySelector('#databaseURL').value);const json=JSON.stringify(config,null,2);preview.textContent=json;const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='config.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Format valid. Ganti firebase/config.json dengan berkas ini, lalu unggah ulang. Ini memeriksa format; koneksi akun dan database harus diuji di game.';}catch(error){preview.textContent='';status.textContent=error.message;}
});
