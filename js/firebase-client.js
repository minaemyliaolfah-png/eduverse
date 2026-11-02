import { appearance, cleanName, firebaseError, latestPlayers, mergeProgress, normalizeProgress, roomCode, validRoom } from './network-model.js';

export async function loadFirebase() {
  const local=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('emulator')==='1';
  const config=local?{apiKey:'demo-key',authDomain:'demo-eduverse.firebaseapp.com',projectId:'demo-eduverse',databaseURL:'https://demo-eduverse.firebaseio.com',appId:'demo-eduverse'}:await fetch(new URL('../firebase/config.json',import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('config');return r.json();});
  if(!config.apiKey||!config.projectId||!config.databaseURL||!config.appId||!config.authDomain)return null;
  const base='https://www.gstatic.com/firebasejs/12.4.0/';
  const [app,auth,db,fs]=await Promise.all(['app','auth','database','firestore'].map(name=>import(base+`firebase-${name}.js`)));
  const client=new FirebaseClient({app,auth,db,fs},config,{emulator:local});
  await auth.setPersistence(client.auth,auth.browserSessionPersistence);
  await client.auth.authStateReady();return client;
}

export class FirebaseClient {
  constructor(sdk,config,{emulator=false,name='eduverse'}={}){
    this.sdk=sdk;this.emulator=emulator;this.app=sdk.app.initializeApp(config,name);this.auth=sdk.auth.getAuth(this.app);this.db=sdk.db.getDatabase(this.app);this.fs=sdk.fs.getFirestore(this.app);this.room=null;
    if(emulator){sdk.auth.connectAuthEmulator(this.auth,'http://127.0.0.1:9099',{disableWarnings:true});sdk.db.connectDatabaseEmulator(this.db,'127.0.0.1',9000);sdk.fs.connectFirestoreEmulator(this.fs,'127.0.0.1',8080);}
  }
  onAuth(callback){return this.sdk.auth.onAuthStateChanged(this.auth,callback);}
  async login(email,password,register=false){if(register&&password.length<8)throw Error('weak-password');const fn=register?this.sdk.auth.createUserWithEmailAndPassword:this.sdk.auth.signInWithEmailAndPassword;return fn(this.auth,email.trim(),password);}
  resetPassword(email){return this.sdk.auth.sendPasswordResetEmail(this.auth,email.trim());}
  async logout(){await this.leave();await this.sdk.auth.signOut(this.auth);}
  async readProgress(){const uid=this.auth.currentUser?.uid;if(!uid)throw Error('auth');const s=this.sdk.fs;const doc=await s.getDoc(s.doc(this.fs,'practiceProfiles',uid));return doc.exists()?normalizeProgress(doc.data().progress):null;}
  async saveProgress(progress){
    const uid=this.auth.currentUser?.uid;if(!uid)return;const s=this.sdk.fs,reference=s.doc(this.fs,'practiceProfiles',uid);
    return s.runTransaction(this.fs,async transaction=>{const doc=await transaction.get(reference);const merged=mergeProgress(doc.exists()?doc.data().progress:null,progress);transaction.set(reference,{version:1,progress:merged,updatedAt:s.serverTimestamp()});return merged;});
  }
  async createRoom(title,profile){
    if(!this.auth.currentUser)throw Error('auth');const s=this.sdk.db;
    for(let i=0;i<4;i++){const code=roomCode();try{await s.set(s.ref(this.db,`rooms/${code}/meta`),{owner:this.auth.currentUser.uid,title:cleanName(title),open:true,createdAt:s.serverTimestamp()});return code;}catch(error){if(i===3)throw error;}}
  }
  async join(code,profile,getPose,events){
    await this.leave();code=code.trim().toUpperCase();if(!validRoom(code))throw new Error('Kode ruang harus 8 karakter.');
    const uid=this.auth.currentUser?.uid;if(!uid)throw Error('auth');const s=this.sdk.db;
    const meta=(await s.get(s.ref(this.db,`rooms/${code}/meta`))).val();if(!meta)throw Error('Ruang tidak ditemukan.');if(!meta.open)throw Error('Ruang ditutup oleh pemilik.');
    const slots=(await s.get(s.ref(this.db,`rooms/${code}/slots`))).val()||{};
    let slot=Object.keys(slots).find(key=>slots[key]===uid),claimed=false;
    if(slot===undefined){for(let i=0;i<24;i++){if(slots[i])continue;const result=await s.runTransaction(s.ref(this.db,`rooms/${code}/slots/${i}`),current=>current===null?uid:undefined);if(result.committed){slot=String(i);claimed=true;break;}}}
    if(slot===undefined)throw Error('Ruang penuh (24 anggota). Minta pemilik mengeluarkan anggota yang tidak dipakai.');
    try{await s.set(s.ref(this.db,`rooms/${code}/members/${uid}`),{name:cleanName(profile.name),joinedAt:s.serverTimestamp(),slot});}
    catch(error){if(claimed)await s.remove(s.ref(this.db,`rooms/${code}/slots/${slot}`)).catch(()=>{});throw error;}
    this.room=new RoomConnection(this,code,meta,getPose,events);this.room.start();return this.room;
  }
  async leave(){if(this.room){const room=this.room;this.room=null;await room.leave();}}
}

export class RoomConnection {
  constructor(client,code,meta,getPose,events={}){
    this.client=client;this.s=client.sdk.db;this.code=code;this.meta=meta;this.uid=client.auth.currentUser.uid;this.getPose=getPose;this.events=events;this.unsub=[];this.closed=false;this.online=false;this.ready=false;this.offset=0;this.epoch=0;this.lastPose='';this.lastWrite=0;this.sending=false;this.lastMessage=0;this.tree={};this.messages={};this.memberData={};this.session=crypto.randomUUID().replaceAll('-','');this.emote=0;this.emoteAt=0;
    this.base=`rooms/${code}`;this.reference=this.ref(`players/${this.uid}/${this.session}`);
  }
  ref(path){return this.s.ref(this.client.db,`${this.base}/${path}`);}
  now(){return Date.now()+this.offset;}
  start(){
    const s=this.s;const fail=error=>{if(this.closed)return;this.ready=false;this.events.error?.(firebaseError(error));this.events.players?.({});this.leave().catch(()=>{});};
    this.unsub.push(s.onValue(s.ref(this.client.db,'.info/serverTimeOffset'),snapshot=>{this.offset=snapshot.val()||0;}));
    this.unsub.push(s.onValue(this.ref('players'),snapshot=>{this.tree=snapshot.val()||{};this.emitPlayers();},fail));
    this.unsub.push(s.onValue(this.ref('members'),snapshot=>{this.memberData=snapshot.val()||{};this.events.members?.(this.memberData);},fail));
    if(this.uid===this.meta.owner)this.unsub.push(s.onValue(this.ref('blocked'),snapshot=>this.events.blocked?.(snapshot.val()||{}),fail));
    this.unsub.push(s.onValue(this.ref('messages'),snapshot=>{this.messages=snapshot.val()||{};this.events.messages?.(this.messages,this.now());},fail));
    this.unsub.push(s.onValue(this.ref('meta'),snapshot=>{const value=snapshot.val();if(!value||!value.open){this.events.error?.('Ruang ditutup. Kamu dapat melanjutkan permainan sendiri.');this.leave().catch(()=>{});return;}this.meta=value;},fail));
    this.unsub.push(s.onValue(s.ref(this.client.db,'.info/connected'),snapshot=>{
      this.online=snapshot.val()===true;this.ready=false;const epoch=++this.epoch;
      this.events.status?.(this.online?'Menyambungkan ruang…':'Koneksi terputus · menyambung ulang');
      if(!this.online){this.events.players?.({});return;}
      // Register cleanup before publishing presence; repeat after every reconnect.
      s.onDisconnect(this.reference).remove().then(async()=>{if(this.closed||epoch!==this.epoch)return;await this.publish(true);if(this.closed||epoch!==this.epoch)return;this.ready=true;this.events.status?.(`Online · ${this.code}`);}).catch(fail);
    }));
    this.timer=setInterval(()=>{if(this.closed)return;this.emitPlayers();if(this.online&&this.ready)this.publish().catch(fail);},200);
  }
  emitPlayers(){this.events.players?.(this.online?latestPlayers(this.tree,this.uid,this.now()):{});}
  async publish(force=false){
    if(this.closed||!this.online||this.sending||(!force&&this.now()-this.lastWrite<200))return;const p=this.getPose();if(!p)return;
    const round=n=>Math.round(n*100)/100;
    const pose={...appearance(p),x:round(p.x),y:round(p.y),z:round(p.z),angle:round(p.angle),area:p.area,moving:!!p.moving,emote:this.emote,emoteAt:this.emoteAt};
    const key=JSON.stringify(pose);if(!force&&key===this.lastPose&&this.now()-this.lastWrite<10000)return;
    this.sending=true;try{await this.s.set(this.reference,{...pose,at:this.s.serverTimestamp()});this.lastPose=key;this.lastWrite=this.now();}finally{this.sending=false;}
  }
  async send(code){
    if(!this.ready||this.closed)throw Error('offline');if(!Number.isInteger(code)||code<0||code>7)throw Error('message');if(this.now()-this.lastMessage<2600)throw Error('Tunggu 3 detik sebelum mengirim pesan lagi.');
    await this.s.set(this.ref(`messages/${this.uid}`),{code,at:this.s.serverTimestamp(),name:appearance(this.getPose()).name});this.lastMessage=this.now();
  }
  gesture(code){if(!this.ready)return;this.emote=code;this.emoteAt=this.now();}
  async moderate(uid,action){
    if(this.uid!==this.meta.owner||uid===this.uid)throw Error('permission-denied');
    if(action==='mute')await this.s.set(this.ref(`muted/${uid}`),true);
    else if(action==='unmute')await this.s.remove(this.ref(`muted/${uid}`));
    else if(action==='kick'){const slot=this.memberData[uid]?.slot;await this.s.set(this.ref(`blocked/${uid}`),true);await Promise.all([this.s.remove(this.ref(`players/${uid}`)),this.s.remove(this.ref(`members/${uid}`)),this.s.remove(this.ref(`messages/${uid}`)),...(slot!==undefined?[this.s.remove(this.ref(`slots/${slot}`))]:[])]);}
    else if(action==='unblock')await this.s.remove(this.ref(`blocked/${uid}`));
  }
  async closeRoom(){if(this.uid!==this.meta.owner)throw Error('permission-denied');await this.s.update(this.ref('meta'),{open:false});}
  async leave(){
    if(this.closed)return;this.closed=true;this.ready=false;++this.epoch;clearInterval(this.timer);this.unsub.forEach(fn=>fn());this.unsub=[];this.events.players?.({});this.events.left?.();
    // A session is removed, not another tab's presence. Membership remains until explicitly removed by the owner.
    if(this.online){await this.s.remove(this.reference).catch(()=>{});await this.s.onDisconnect(this.reference).cancel().catch(()=>{});}
    // If offline, the registered server cleanup remains armed.
  }
}

