import { PAGE_CONTENT } from "./page-content.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const app = getApps().length ? getApps()[0] : initializeApp(window.KOR1816_FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_EMAILS = (window.KOR1816_ADMIN_EMAILS || []).map(v => String(v).toLowerCase());
const LANGS = ["ko","en","ja","zh","de","it","es","tr"];
const PAGE_IDS = ["home","notices","teams","alliance","battleJoin","castlewar1","castlelayout1","seating","viking","glory"];
const PAGE_LABELS = {
  home:["홈","Home","ホーム","首页","Startseite","Home","Inicio","Ana Sayfa"],
  notices:["공지","Notices","お知らせ","公告","Mitteilungen","Avvisi","Avisos","Duyurular"],
  teams:["성검쟁탈","Holy Sword Clash","聖剣争奪","圣剑争夺","Heiliges Schwert","Duello della Spada Sacra","Duelo de la Espada Sagrada","Kutsal Kılıç"],
  alliance:["3대연맹전","Three Alliances War","三大連盟戦","三大联盟战","Krieg der drei Allianzen","Guerra delle Tre Alleanze","Guerra de las Tres Alianzas","Üç İttifak Savaşı"],
  battleJoin:["캐슬참전","Castle Participation","城战报名","城堡参战","Burgteilnahme","Partecipazione al Castello","Participación en el Castillo","Kale Katılımı"],
  castlewar1:["캐슬전","Castle War","城战","城堡战","Burgkrieg","Guerra del Castello","Guerra del Castillo","Kale Savaşı"],
  castlelayout1:["캐슬배치","Castle Layout","城堡布阵","城堡布局","Burgaufstellung","Disposizione del Castello","Distribución del Castillo","Kale Dizilimi"],
  seating:["자리배치","Seating","配置表","座位安排","Platzierung","Disposizione","Distribución","Yerleşim"],
  viking:["바이킹","Viking","バイキング","维京","Wikinger","Vichinghi","Vikingos","Viking"],
  glory:["영광의순간들","Moments of Glory","栄光の瞬間","荣耀时刻","Ruhmreiche Momente","Momenti di Gloria","Momentos de Gloria","Zafer Anları"]
};
const DOCS = {
  home:"rebuild_home_v1", notices:"rebuild_notices_v1", teams:"rebuild_teams_v1", alliance:"rebuild_alliance_v1",
  battleJoin:"castle_participation_rebuild_v1", castlewar1:"castlewar_rebuild_v1",
  castlelayout1:"castle_layout_rebuild_v1", seating:"rebuild_seating_v1", viking:"rebuild_viking_v1", glory:"rebuild_glory_records_v1"
};
const LEGACY = {
  home:"home", notices:"notices", teams:"teams", alliance:"alliance", seating:"seating_v4", viking:"viking_v1", glory:"glory_records",
  battleJoin:"castle_features_v1", castlewar1:"castle_features_v1", castlelayout1:"castle_layout1_v1"
};
const FIXED_LEADERS = ["Nemesis","Pham","샌디에이고","Jinno","Leo li","SsungBi"];
const NOTICE_DEFAULTS = {
  bearLeaders:"집결장: 알카 · 페라 · 로사",
  bearMembers:"집결원: 아마데우스 · 첸코 · 연우 · 마르고 · 아마네\n영웅 없이 X",
  bearRatio:"비율: 10 · 10 · 80\n또는\n비율: 1 · 10 · 89",
  bearTroops:"병력: 100,000",
  swordTeam1:"1군: UTC 14:00 (한국시간 23:00) — 전투력순",
  swordTeam2:"2군: UTC 12:00 (한국시간 21:00) — 선착순 투표",
  allianceTeam1:"1군: UTC 12:00 (한국시간 21:00) — 전투력순",
  allianceTeam2:"2군: UTC 14:00 (한국시간 23:00) — 선착순 투표",
  goldenGlaives:"❗️ 일요일 정보(Intel)를 아껴두세요\n\nUTC 00:00 (한국 09:00) — 탐색 금지 / 진행 / 수령\nUTC 08:00 (한국 17:00) — 탐색 금지 / 진행 / 수령 금지\nUTC 16:00 (한국 01:00) — 탐색 / 진행 금지 / 수령 금지\n\n작동 방식\nPAN = 정보 스킬 사용 (화면 이동/탐색)\nDO = 정보 미션 완료\nCOLLECT = 보상 수령\n\n정보 이벤트\nUTC 16:00 (한국 01:00) — 탐색 가능 / 진행 금지 / 수령 금지\n(PAN 유지 15시간)"
};
const NOTICE_TRANSLATIONS = {
  en:{
    bearLeaders:"Rally leaders: Alka · Pera · Rosa",bearMembers:"Rally members: Amadeus · Chenko · Yeonwoo · Margo · Amane\nNo heroes",bearRatio:"Troop ratio: 10 · 10 · 80\nOr\nTroop ratio: 1 · 10 · 89",bearTroops:"Troops: 100,000",
    swordTeam1:"Team 1: UTC 14:00 (23:00 KST) — power ranking",swordTeam2:"Team 2: UTC 12:00 (21:00 KST) — first-come voting",allianceTeam1:"Team 1: UTC 12:00 (21:00 KST) — power ranking",allianceTeam2:"Team 2: UTC 14:00 (23:00 KST) — first-come voting",
    goldenGlaives:"Save your Sunday Intel\n\nUTC 00:00 (09:00 KST) — No Pan / Do / Collect\nUTC 08:00 (17:00 KST) — No Pan / Do / No Collect\nUTC 16:00 (01:00 KST) — Pan / No Do / No Collect\n\nHow it works\nPAN = Use the Intel Pan skill\nDO = Complete Intel missions\nCOLLECT = Claim rewards\n\nIntel event\nUTC 16:00 (01:00 KST) — Pan / No Do / No Collect\n(Pan remains active for 15 hours)"
  },
  ja:{
    bearLeaders:"集結主：アルカ · ペラ · ロサ",bearMembers:"集結メンバー：アマデウス · チェンコ · ヨヌ · マーゴ · アマネ\n英雄なし",bearRatio:"兵士比率：10 · 10 · 80\nまたは\n兵士比率：1 · 10 · 89",bearTroops:"兵士数：100,000",
    swordTeam1:"第1チーム：UTC 14:00（韓国時間23:00）— 戦力順",swordTeam2:"第2チーム：UTC 12:00（韓国時間21:00）— 先着投票",allianceTeam1:"第1チーム：UTC 12:00（韓国時間21:00）— 戦力順",allianceTeam2:"第2チーム：UTC 14:00（韓国時間23:00）— 先着投票",
    goldenGlaives:"日曜日の情報を温存してください\n\nUTC 00:00（韓国09:00）— 探索禁止 / 実行 / 受取\nUTC 08:00（韓国17:00）— 探索禁止 / 実行 / 受取禁止\nUTC 16:00（韓国01:00）— 探索 / 実行禁止 / 受取禁止\n\n操作方法\nPAN = 情報スキルで探索\nDO = 情報ミッション完了\nCOLLECT = 報酬受取\n\n情報イベント\nUTC 16:00（韓国01:00）— 探索 / 実行禁止 / 受取禁止\n（PANは15時間有効）"
  },
  zh:{
    bearLeaders:"集结队长：阿尔卡 · 佩拉 · 罗莎",bearMembers:"集结成员：阿玛迪斯 · 陈科 · 延宇 · 玛戈 · 天音\n不带英雄",bearRatio:"兵力比例：10 · 10 · 80\n或者\n兵力比例：1 · 10 · 89",bearTroops:"兵力：100,000",
    swordTeam1:"一队：UTC 14:00（韩国时间23:00）— 按战力排序",swordTeam2:"二队：UTC 12:00（韩国时间21:00）— 先到先投票",allianceTeam1:"一队：UTC 12:00（韩国时间21:00）— 按战力排序",allianceTeam2:"二队：UTC 14:00（韩国时间23:00）— 先到先投票",
    goldenGlaives:"请保留周日情报\n\nUTC 00:00（韩国09:00）— 禁止探索 / 执行 / 领取\nUTC 08:00（韩国17:00）— 禁止探索 / 执行 / 禁止领取\nUTC 16:00（韩国01:00）— 探索 / 禁止执行 / 禁止领取\n\n操作说明\nPAN = 使用情报技能探索\nDO = 完成情报任务\nCOLLECT = 领取奖励\n\n情报活动\nUTC 16:00（韩国01:00）— 探索 / 禁止执行 / 禁止领取\n（PAN持续15小时）"
  },
  de:{
    bearLeaders:"Rally-Anführer: Alka · Pera · Rosa",bearMembers:"Rally-Mitglieder: Amadeus · Chenko · Yeonwoo · Margo · Amane\nKeine Helden",bearRatio:"Truppenverhältnis: 10 · 10 · 80\nOder\nTruppenverhältnis: 1 · 10 · 89",bearTroops:"Truppen: 100.000",
    swordTeam1:"Team 1: UTC 14:00 (23:00 KST) — nach Kampfkraft",swordTeam2:"Team 2: UTC 12:00 (21:00 KST) — Abstimmung nach Eingang",allianceTeam1:"Team 1: UTC 12:00 (21:00 KST) — nach Kampfkraft",allianceTeam2:"Team 2: UTC 14:00 (23:00 KST) — Abstimmung nach Eingang",
    goldenGlaives:"Spart eure Sonntags-Intel auf\n\nUTC 00:00 (09:00 KST) — Kein Pan / Do / Sammeln\nUTC 08:00 (17:00 KST) — Kein Pan / Do / Kein Sammeln\nUTC 16:00 (01:00 KST) — Pan / Kein Do / Kein Sammeln\n\nSo funktioniert es\nPAN = Intel-Fähigkeit verwenden\nDO = Intel-Aufgaben abschließen\nCOLLECT = Belohnungen abholen\n\nIntel-Event\nUTC 16:00 (01:00 KST) — Pan / Kein Do / Kein Sammeln\n(Pan bleibt 15 Stunden aktiv)"
  },
  it:{
    bearLeaders:"Leader rally: Alka · Pera · Rosa",bearMembers:"Membri rally: Amadeus · Chenko · Yeonwoo · Margo · Amane\nSenza eroi",bearRatio:"Rapporto truppe: 10 · 10 · 80\nOppure\nRapporto truppe: 1 · 10 · 89",bearTroops:"Truppe: 100.000",
    swordTeam1:"Squadra 1: UTC 14:00 (23:00 KST) — ordine per potenza",swordTeam2:"Squadra 2: UTC 12:00 (21:00 KST) — voto in ordine di arrivo",allianceTeam1:"Squadra 1: UTC 12:00 (21:00 KST) — ordine per potenza",allianceTeam2:"Squadra 2: UTC 14:00 (23:00 KST) — voto in ordine di arrivo",
    goldenGlaives:"Conservate le Intel di domenica\n\nUTC 00:00 (09:00 KST) — No Pan / Do / Raccogli\nUTC 08:00 (17:00 KST) — No Pan / Do / No raccolta\nUTC 16:00 (01:00 KST) — Pan / No Do / No raccolta\n\nCome funziona\nPAN = Usa l'abilità Intel Pan\nDO = Completa le missioni Intel\nCOLLECT = Ritira le ricompense\n\nEvento Intel\nUTC 16:00 (01:00 KST) — Pan / No Do / No raccolta\n(Pan resta attivo per 15 ore)"
  },
  es:{
    bearLeaders:"Líderes de rally: Alka · Pera · Rosa",bearMembers:"Miembros del rally: Amadeus · Chenko · Yeonwoo · Margo · Amane\nSin héroes",bearRatio:"Proporción de tropas: 10 · 10 · 80\nO\nProporción de tropas: 1 · 10 · 89",bearTroops:"Tropas: 100.000",
    swordTeam1:"Equipo 1: UTC 14:00 (23:00 KST) — por poder",swordTeam2:"Equipo 2: UTC 12:00 (21:00 KST) — votación por orden de llegada",allianceTeam1:"Equipo 1: UTC 12:00 (21:00 KST) — por poder",allianceTeam2:"Equipo 2: UTC 14:00 (23:00 KST) — votación por orden de llegada",
    goldenGlaives:"Guarda la Intel del domingo\n\nUTC 00:00 (09:00 KST) — No Pan / Do / Recoger\nUTC 08:00 (17:00 KST) — No Pan / Do / No recoger\nUTC 16:00 (01:00 KST) — Pan / No Do / No recoger\n\nCómo funciona\nPAN = Usar la habilidad Pan de Intel\nDO = Completar misiones Intel\nCOLLECT = Reclamar recompensas\n\nEvento Intel\nUTC 16:00 (01:00 KST) — Pan / No Do / No recoger\n(Pan permanece activo 15 horas)"
  },
  tr:{
    bearLeaders:"Ralli liderleri: Alka · Pera · Rosa",bearMembers:"Ralli üyeleri: Amadeus · Chenko · Yeonwoo · Margo · Amane\nKahramansız",bearRatio:"Asker oranı: 10 · 10 · 80\nVeya\nAsker oranı: 1 · 10 · 89",bearTroops:"Asker: 100.000",
    swordTeam1:"1. Takım: UTC 14:00 (Kore 23:00) — güç sıralaması",swordTeam2:"2. Takım: UTC 12:00 (Kore 21:00) — ilk gelen oy verir",allianceTeam1:"1. Takım: UTC 12:00 (Kore 21:00) — güç sıralaması",allianceTeam2:"2. Takım: UTC 14:00 (Kore 23:00) — ilk gelen oy verir",
    goldenGlaives:"Pazar günü istihbaratını sakla\n\nUTC 00:00 (Kore 09:00) — Pan yok / Do / Topla\nUTC 08:00 (Kore 17:00) — Pan yok / Do / Toplama yok\nUTC 16:00 (Kore 01:00) — Pan / Do yok / Toplama yok\n\nNasıl çalışır\nPAN = İstihbarat Pan becerisini kullan\nDO = İstihbarat görevlerini tamamla\nCOLLECT = Ödülleri al\n\nİstihbarat etkinliği\nUTC 16:00 (Kore 01:00) — Pan / Do yok / Toplama yok\n(Pan 15 saat etkin kalır)"
  }
};
let currentLang = "ko";
let activePage = "home";
let adminModes = {};
let readSessionPromise = null;
let homeData = { latestTitle:"", latestBody:"", schedule:"", welcome:"", translations:{} };
let noticeData = { ...NOTICE_DEFAULTS, translations: NOTICE_TRANSLATIONS, updatedAt:0 };
let teamData = {A:Array(7).fill(""),B:Array(7).fill(""),C:Array(7).fill(""),D:Array(7).fill(""),extra:["",""],subs:Array(10).fill("")};
let allianceData = {names:{}};
let seatingData = {rows:[
 {row:"Row 1",left:Array(12).fill(""),right:Array(12).fill("")},
 {row:"Row 2",left:Array(17).fill(""),right:Array(18).fill("")},
 {row:"Row 3",left:Array(26).fill(""),right:Array(16).fill("")}
]};
let participants = [];
let castleWarData = {war:{assault:Array(7).fill(""),rush:Array(7).fill(""),finish:Array(7).fill(""),north:Array(10).fill(""),west:Array(10).fill(""),substitute:{assault:"",rush:"",finish:""}},warLeaders:{assault:"",rush:"",finish:""},updatedAt:0};
let castleLayoutData = {slots:Array(28).fill(""),updatedAt:0};
let vikingData = {teams:Object.fromEntries(Array.from({length:25},(_,i)=>[i+1,[]])),updatedAt:0};
let gloryRecords = [];
const defaultGloryRecords = [
 {date:"2026-10-10",opponent:1775,prep:"패",castle:"패",memo:""},
 {date:"2026-09",opponent:1772,prep:"승",castle:"패",memo:""},
 {date:"2026-08",opponent:1786,prep:"승",castle:"패",memo:""},
 {date:"2026-07",opponent:1799,prep:"패",castle:"승",memo:""},
 {date:"2026-06",opponent:1800,prep:"패",castle:"패",memo:""}
];

const $ = (sel,root=document)=>root.querySelector(sel);
const $$ = (sel,root=document)=>[...root.querySelectorAll(sel)];
const pageDoc = id => doc(db,"siteData",DOCS[id]);
const legacyDoc = id => doc(db,"siteData",LEGACY[id]);
const clone = v => JSON.parse(JSON.stringify(v));
function say(message, target="global-message"){const el=$("#"+target);if(el)el.textContent=message;}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function langIndex(){return Math.max(0,LANGS.indexOf(currentLang));}
function textFor(obj){return obj[currentLang]||obj.ko||"";}
function message(key){
 const values={
  ko:{saved:"공용 서버에 저장했습니다.",load:"최신 내용을 불러왔습니다.",failed:"공용 서버 연결에 실패했습니다. 저장되지 않았습니다.",admin:"관리자 로그인이 필요합니다.",fallback:"서버 연결에 실패해 이 기기의 임시 내용을 표시합니다."},
  en:{saved:"Saved to the shared server.",load:"Latest content loaded.",failed:"Shared server connection failed. Changes were not saved.",admin:"Administrator sign-in required.",fallback:"Server unavailable; showing this device's cached content."},
  ja:{saved:"共有サーバーに保存しました。",load:"最新の内容を読み込みました。",failed:"共有サーバーへの接続に失敗しました。保存されていません。",admin:"管理者ログインが必要です。",fallback:"サーバーに接続できないため、この端末の一時データを表示しています。"},
  zh:{saved:"已保存到共享服务器。",load:"已加载最新内容。",failed:"共享服务器连接失败，内容未保存。",admin:"需要管理员登录。",fallback:"服务器不可用，正在显示此设备的缓存内容。"},
  de:{saved:"Auf dem gemeinsamen Server gespeichert.",load:"Aktuelle Inhalte geladen.",failed:"Verbindung zum Server fehlgeschlagen. Änderungen wurden nicht gespeichert.",admin:"Administrator-Anmeldung erforderlich.",fallback:"Server nicht erreichbar; lokaler Zwischenspeicher wird angezeigt."},
  it:{saved:"Salvato sul server condiviso.",load:"Contenuti aggiornati caricati.",failed:"Connessione al server non riuscita. Modifiche non salvate.",admin:"È necessario l'accesso amministratore.",fallback:"Server non disponibile; vengono mostrati i dati temporanei locali."},
  es:{saved:"Guardado en el servidor compartido.",load:"Contenido actualizado cargado.",failed:"No se pudo conectar al servidor. No se guardaron los cambios.",admin:"Se requiere iniciar sesión como administrador.",fallback:"Servidor no disponible; se muestra la copia temporal local."},
  tr:{saved:"Paylaşılan sunucuya kaydedildi.",load:"En güncel içerik yüklendi.",failed:"Paylaşılan sunucu bağlantısı başarısız. Değişiklikler kaydedilmedi.",admin:"Yönetici girişi gerekli.",fallback:"Sunucu kullanılamıyor; bu cihazdaki geçici içerik gösteriliyor."}
 };
 return values[currentLang]?.[key]||values.ko[key];
}
async function ensureReadSession(){
 if(auth.currentUser)return auth.currentUser;
 if(!readSessionPromise)readSessionPromise=signInAnonymously(auth).then(r=>r.user).catch(e=>{readSessionPromise=null;throw e;});
 return readSessionPromise;
}
async function ensureGoogleAdmin(){
 let user=auth.currentUser;
 if(!user?.email){
  try{user=(await signInWithPopup(auth,new GoogleAuthProvider())).user;}
  catch(e){if(e?.code!=="auth/popup-closed-by-user"&&e?.code!=="auth/cancelled-popup-request")alert("Google 로그인에 실패했습니다. 다시 시도해 주세요.");return false;}
 }
 if(!user?.email||!ADMIN_EMAILS.includes(user.email.toLowerCase())){
  alert("관리자 권한이 없는 Google 계정입니다.");
  try{await signOut(auth);await signInAnonymously(auth);}catch(e){console.warn(e);}
  return false;
 }
 return true;
}
async function readCloud(id){
 const snap=await getDoc(pageDoc(id));
 return snap.exists()?snap.data():null;
}
async function saveCloud(id,data){
 const payload={...clone(data),updatedAt:Date.now()};
 await setDoc(pageDoc(id),payload,{merge:false});
 return payload;
}
async function loadData(id, defaults){
 try{
  const data=await readCloud(id);
  if(data)return {data:{...clone(defaults),...data},source:"cloud"};
  if(LEGACY[id]){
   const legacy=await getDoc(legacyDoc(id));
   if(legacy.exists()){
    const old=legacy.data()||{};
    return {data:{...clone(defaults),...old},source:"legacy-read-only"};
   }
  }
  return {data:clone(defaults),source:"empty"};
 }catch(error){console.error("Cloud load "+id,error);return {data:clone(defaults),source:"unavailable",error};}
}
function makeNav(){
 const nav=$("#main-nav");nav.replaceChildren();
 PAGE_IDS.forEach((id,i)=>{
  const b=document.createElement("button");b.type="button";b.dataset.route=id;b.dataset.pos=String(i+1);
  b.addEventListener("click",()=>navigate(id));
  nav.append(b);
 });
 applyLanguage(currentLang);
}
function applyLanguage(lang){
 currentLang=LANGS.includes(lang)?lang:"ko";
 document.documentElement.lang=currentLang;
 $("#language-select").value=currentLang;
 $("#language-label").textContent=({ko:"언어",en:"Language",ja:"言語",zh:"语言",de:"Sprache",it:"Lingua",es:"Idioma",tr:"Dil"})[currentLang];
 $$("#main-nav button").forEach((b,i)=>{const id=PAGE_IDS[i];b.textContent=(i+1)+". "+PAGE_LABELS[id][langIndex()];b.setAttribute("aria-label",PAGE_LABELS[id][langIndex()]);});
 try{localStorage.setItem("kor1816_rebuild_lang_v1",currentLang);localStorage.setItem("kor1816_lang",currentLang);}catch{}
 renderNotices();
 translateCommonControls();
 document.dispatchEvent(new CustomEvent("kor1816:languagechange",{detail:{language:currentLang}}));
}
function translateCommonControls(){
 const maps={
  "🔄 새로고침":["🔄 새로고침","🔄 Refresh","🔄 更新","🔄 刷新","🔄 Aktualisieren","🔄 Aggiorna","🔄 Actualizar","🔄 Yenile"],
  "🔐 관리자 수정":["🔐 관리자 수정","🔐 Admin edit","🔐 管理者編集","🔐 管理员编辑","🔐 Admin-Bearbeitung","🔐 Modifica admin","🔐 Edición admin","🔐 Yönetici düzenleme"],
  "💾 저장":["💾 저장","💾 Save","💾 保存","💾 保存","💾 Speichern","💾 Salva","💾 Guardar","💾 Kaydet"],
  "💾 기록 저장":["💾 기록 저장","💾 Save record","💾 記録を保存","💾 保存记录","💾 Eintrag speichern","💾 Salva record","💾 Guardar registro","💾 Kaydı kaydet"],
  "➕ 기록 추가":["➕ 기록 추가","➕ Add record","➕ 記録を追加","➕ 添加记录","➕ Eintrag hinzufügen","➕ Aggiungi record","➕ Añadir registro","➕ Kayıt ekle"],
  "취소":["취소","Cancel","キャンセル","取消","Abbrechen","Annulla","Cancelar","İptal"]
 };
 $$("button").forEach(b=>{
  if(b.dataset.keepLabel==="1")return;
  const raw=b.dataset.originalLabel||b.textContent.trim();
  if(!maps[raw])return;
  b.dataset.originalLabel=raw;
  b.textContent=maps[raw][langIndex()];
 });
}
function navigate(id,updateUrl=true){
 if(!PAGE_IDS.includes(id))id="home";
 activePage=id;
 $$(".page").forEach(p=>p.classList.toggle("active",p.id===id));
 $$("#main-nav button").forEach(b=>{if(b.dataset.route===id)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
 if(updateUrl&&location.hash!=="#"+id)history.pushState({page:id},"","#"+id);
 window.scrollTo({top:0,left:0,behavior:"auto"});
 if(id==="notices")loadNotices();
 if(id==="glory")loadRecords();
 if(id==="home")loadHome();
 if(id==="teams")loadTeams();
 if(id==="alliance")loadAlliance();
 if(id==="seating")loadSeating();
 if(id==="battleJoin")loadNewCastleFeatures();
 if(id==="castlewar1")loadNewCastleFeatures();
 if(id==="castlelayout1")loadCastleLayout1();
 if(id==="viking")loadViking();
 document.dispatchEvent(new CustomEvent("kor1816:pagechange",{detail:{page:id,language:currentLang}}));
}
function restoreRoute(){const id=decodeURIComponent(location.hash.slice(1));navigate(PAGE_IDS.includes(id)?id:"home",false);}

function setupTemplates(){
 for(const id of PAGE_IDS){const root=$("#"+id);if(!root)continue;root.innerHTML=PAGE_CONTENT[id]||'<div class="card"><h2>'+esc(PAGE_LABELS[id][0])+'</h2></div>';}
 const n=$("#notices");
 if(n){
  $("#notice-refresh",n)?.addEventListener("click",loadNotices);
  $("#notice-admin",n)?.addEventListener("click",toggleNoticeAdmin);
  $("#notice-save",n)?.addEventListener("click",saveNotices);
 }
 // The source markup is content only; handlers below are shared, page-aware actions.
}
function updateMsgForPage(id,msg){const target={home:"homeMsg",teams:"teamMsg",alliance:"allianceMsg",seating:"seatingLatestMsg",battleJoin:"ncMsg",castlewar1:"ncWarMsg",castlelayout1:"castleLayout1Msg",viking:"vikingMsg"}[id];if(target)say(msg,target);else say(msg);}
function currentInputs(root){const out={};$$("input,textarea,select",root).forEach(el=>{if(!el.id||el.type==="button"||el.type==="submit")return;out[el.id]=el.value;});return out;}
function fillInputs(root,values){for(const [id,value] of Object.entries(values||{})){const el=$("#"+CSS.escape(id),root);if(el&&"value" in el)el.value=value??"";}}
function toggleButtonsForAdmin(root,on,buttonId,saveId){
 const b=buttonId?$("#"+buttonId,root):null,s=saveId?$("#"+saveId,root):null;
 if(b)b.textContent=on?"🔒 수정 종료":"🔐 관리자 수정";
 if(s)s.hidden=!on;
 root.classList.toggle("editing",on);
}
async function togglePageAdmin(id,buttonId,saveId){
 const root=$("#"+id);if(!root)return;
 if(!adminModes[id]&&!await ensureGoogleAdmin())return;
 adminModes[id]=!adminModes[id];
 toggleButtonsForAdmin(root,adminModes[id],buttonId,saveId);
 if(id==="teams")setTeamsInputsEnabled(adminModes[id]);
 if(id==="alliance")setInputsEnabled(root,adminModes[id]);
 if(id==="seating")renderSeating();
 if(id==="castlewar1")renderCastleWar();
 if(id==="castlelayout1")renderCastleLayout();
}
function setInputsEnabled(root,enabled){$$("input,textarea,select",root).forEach(el=>{if(!["vikingNickname","vikingTeam","ncNick","ncIdSearch","ncStatus","ncTier"].includes(el.id))el.disabled=!enabled;});}
function setMsg(id,msg){const el=$("#"+id);if(el)el.textContent=msg;}

/* Home */
const homeDefaults={
 latestTitle:"공지",
 latestBody:"소통 · 협력 · 성장 · KVK 조직력을 중심으로 함께합니다.",
 schedule:"⚔️ 성검쟁탈 1군 · 23:00 (UTC 14:00)\n⚔️ 성검쟁탈 2군 · 21:00 (UTC 12:00)\n🪓 바이킹 · 23:00 (UTC 14:00)\n🐻 곰 1트랩 · 23:00 (UTC 14:00)\n🐻 곰 2트랩 · 21:00 (UTC 12:00)",
 welcome:"소통 · 협력 · 성장 · KVK 조직력을 중심으로 함께합니다."
};
async function loadHome(){
 const r=await loadData("home",homeDefaults);homeData=r.data;
 renderHome();
 if(r.source==="unavailable")setMsg("homeMsg",message("fallback"));else setMsg("homeMsg",message("load"));
}
function renderHome(){
 const d=homeData.translations?.[currentLang]||homeData.translations?.ko||homeData;
 const title=$("#homeLatestTitle"),body=$("#homeLatest"),sch=$("#homeSchedule"),wel=$("#homeWelcome");
 if(title)title.textContent="📢 "+(d.latestTitle||"공지");
 if(body)body.textContent=d.latestBody||"";
 if(sch)sch.textContent=d.schedule||"";
 if(wel)wel.textContent=d.welcome||"";
 fillInputs($("#home"),{homeLatestInput:d.latestTitle,homeLatestBody:d.latestBody,homeScheduleInput:d.schedule,homeWelcomeInput:d.welcome});
}
async function saveHome(){
 if(!adminModes.home){alert(message("admin"));return;}
 const root=$("#home");
 homeData={...homeData,latestTitle:$("#homeLatestInput",root)?.value||"",latestBody:$("#homeLatestBody",root)?.value||"",schedule:$("#homeScheduleInput",root)?.value||"",welcome:$("#homeWelcomeInput",root)?.value||""};
 try{homeData=await saveCloud("home",homeData);renderHome();setMsg("homeMsg",message("saved"));}
 catch(e){console.error(e);setMsg("homeMsg",message("failed"));}
}
async function toggleHomeAdmin(){
 const root=$("#home");if(!root)return;
 if(!adminModes.home&&!await ensureGoogleAdmin())return;
 adminModes.home=!adminModes.home;
 const view=$("#homeView",root),edit=$("#homeEdit",root),button=$("#homeAdminBtn",root);
 if(view)view.style.display=adminModes.home?"none":"grid";
 if(edit)edit.style.display=adminModes.home?"grid":"none";
 if(button)button.textContent=adminModes.home?"🔒 수정 종료":"🔐 관리자 수정";
}

/* Notices: Korean source and prewritten translations. */
let noticeAdmin=false;
function noticeValue(key){if(currentLang==="ko")return noticeData[key]||"";return NOTICE_TRANSLATIONS[currentLang]?.[key]||noticeData.translations?.[currentLang]?.[key]||noticeData[key]||"";}
function koreanOnly(value){
 return String(value??"").split("\n").filter(line=>/[가-힣]/.test(line)||!/[A-Za-z]{3,}/.test(line)).join("\n").trim();
}
function renderNotices(){
 const root=$("#notices");if(!root)return;
 const ids=Object.keys(NOTICE_DEFAULTS);
 for(const id of ids){
  const view=$("#"+id,root),edit=$("#e"+id[0].toUpperCase()+id.slice(1),root);
  if(view)view.textContent=noticeValue(id);
  if(edit){edit.value=noticeData[id]||NOTICE_DEFAULTS[id];edit.disabled=!noticeAdmin;}
 }
 const admin=$("#notice-admin",root),save=$("#notice-save",root);
 if(admin)admin.textContent=noticeAdmin?"🔒 수정 종료":"🔐 관리자 수정";
 if(save)save.hidden=!noticeAdmin;
}
async function loadNotices(){
 const root=$("#notices");if(!root)return;
 try{
  let cloud=await readCloud("notices");
  if(!cloud){const legacy=await getDoc(legacyDoc("notices"));cloud=legacy.exists()?legacy.data():null;}
  if(cloud?.noticesV1){
   const saved=cloud.noticesV1;
   const translated={};
   for(const lang of LANGS.slice(1))translated[lang]={...(NOTICE_TRANSLATIONS[lang]||{}),...(saved.translations?.[lang]||{})};
   const koreanSaved={};
   for(const key of Object.keys(NOTICE_DEFAULTS))koreanSaved[key]=koreanOnly(saved[key]||NOTICE_DEFAULTS[key]);
   noticeData={...NOTICE_DEFAULTS,...koreanSaved,translations:translated,updatedAt:saved.updatedAt||cloud.updatedAt||0};
  }else noticeData={...NOTICE_DEFAULTS,translations:NOTICE_TRANSLATIONS};
  renderNotices();setMsg("notice-status",message("load"));
 }catch(e){console.error(e);renderNotices();setMsg("notice-status",message("fallback"));}
}
async function toggleNoticeAdmin(){
 if(!noticeAdmin&&!await ensureGoogleAdmin())return;
 noticeAdmin=!noticeAdmin;renderNotices();
}
async function saveNotices(){
 if(!noticeAdmin){alert(message("admin"));return;}
 const root=$("#notices");
 for(const id of Object.keys(NOTICE_DEFAULTS)){const el=$("#e"+id[0].toUpperCase()+id.slice(1),root);if(el)noticeData[id]=el.value.trim();}
 // Keep the prepared translations for the unchanged fixed notice phrases. If the Korean source is edited,
 // it is stored separately and the owner can update its corresponding translation strings in the document.
 noticeData.updatedAt=Date.now();
 try{
  await setDoc(pageDoc("notices"),{noticesV1:noticeData,updatedAt:noticeData.updatedAt},{merge:true});
  renderNotices();setMsg("notice-status",message("saved"));
 }catch(e){console.error(e);setMsg("notice-status",message("failed"));}
}

/* Holy Sword and Alliance */
function setTeamsInputsEnabled(enabled){setInputsEnabled($("#teams"),enabled);}
async function loadTeams(){
 const r=await loadData("teams",teamData);teamData={...teamData,...r.data};
 const root=$("#teams");
 for(const group of ["A","B","C","D"]){(teamData[group]||[]).forEach((v,i)=>{const el=$("#team-"+group+"-"+(i+1),root);if(el)el.value=v||"";});}
 (teamData.extra||[]).forEach((v,i)=>{const el=$("#extra-"+(i+1),root);if(el)el.value=v||"";});
 (teamData.subs||[]).forEach((v,i)=>{const el=$("#team-sub-"+(i+1),root)||$("#team-subs-"+(i+1),root);if(el)el.value=v||"";});
 setTeamsInputsEnabled(Boolean(adminModes.teams));
 if(r.source==="unavailable")setMsg("teamMsg",message("fallback"));else setMsg("teamMsg",message("load"));
}
async function toggleTeamsAdmin(){
 const root=$("#teams");if(!root)return;
 if(!adminModes.teams&&!await ensureGoogleAdmin())return;
 adminModes.teams=!adminModes.teams;
 setTeamsInputsEnabled(adminModes.teams);
 const b=$("#teamsAdminBtn",root),save=$("#teamsSaveBtn",root);
 if(b)b.textContent=adminModes.teams?"🔒 수정 종료":"🔐 관리자 수정";
 if(save)save.style.display=adminModes.teams?"inline-flex":"none";
}
async function saveAllTeams(){
 if(!adminModes.teams){alert(message("admin"));return;}
 const root=$("#teams"),next={A:[],B:[],C:[],D:[],extra:[],subs:[]};
 for(const g of ["A","B","C","D"])for(let i=1;i<=7;i++)next[g].push($("#team-"+g+"-"+i,root)?.value.trim()||"");
 for(let i=1;i<=2;i++)next.extra.push($("#extra-"+i,root)?.value.trim()||"");
 for(let i=1;i<=10;i++)next.subs.push($("#sub-"+i,root)?.value.trim()||"");
 try{teamData=await saveCloud("teams",next);setMsg("teamMsg",message("saved"));}
 catch(e){console.error(e);setMsg("teamMsg",message("failed"));}
}
async function loadAlliance(){
 const r=await loadData("alliance",allianceData);allianceData=r.data;
 const root=$("#alliance");
 for(let t=1;t<=4;t++){
  const groups=allianceData.names?.[t]||{};
  for(let g=1;g<=(t<=2?2:1);g++){
   const vals=groups["g"+g]||[];
   for(let k=3;k<=7;k++){const el=$("#alliance-"+t+"-"+g+"-"+k,root);if(el)el.value=vals[k]||"";}
  }
 }
 setInputsEnabled(root,Boolean(adminModes.alliance));
 setMsg("allianceMsg",r.source==="unavailable"?message("fallback"):message("load"));
}
async function toggleAllianceAdmin(){
 const root=$("#alliance");if(!root)return;
 if(!adminModes.alliance&&!await ensureGoogleAdmin())return;
 adminModes.alliance=!adminModes.alliance;
 const view=$("#allianceView",root),edit=$("#allianceEdit",root),b=$("#allianceAdminBtn",root);
 if(view)view.style.display=adminModes.alliance?"none":"block";
 if(edit)edit.style.display=adminModes.alliance?"block":"none";
 if(b)b.textContent=adminModes.alliance?"🔒 수정 종료":"🔐 관리자 수정";
}
async function saveAlliance(){
 if(!adminModes.alliance){alert(message("admin"));return;}
 const root=$("#alliance"),next={names:{}};
 for(let t=1;t<=4;t++){
  next.names[t]={};
  for(let g=1;g<=(t<=2?2:1);g++){
   next.names[t]["g"+g]=["","",""];
   for(let k=3;k<=7;k++)next.names[t]["g"+g].push($("#ae-"+t+"-"+g+"-"+k,root)?.value.trim()||"");
  }
 }
 try{allianceData=await saveCloud("alliance",next);setMsg("allianceMsg",message("saved"));}
 catch(e){console.error(e);setMsg("allianceMsg",message("failed"));}
}

/* Seating table */
function getRows(raw){
 if(Array.isArray(raw))return raw;
 if(Array.isArray(raw?.rows))return raw.rows;
 if(Array.isArray(raw?.columns))return raw.columns;
 return [];
}
function renderSeating(){
 const root=$("#seating");if(!root)return;
 const wrap=$(".seating-3col-wrap",root);if(!wrap)return;
 const rows=getRows(seatingData.rows?.length?seatingData.rows:seatingData);
 wrap.innerHTML="";
 rows.forEach((row,ri)=>{
  const block=document.createElement("div");block.className="seating-row-card";
  const title=document.createElement("h4");title.textContent=row.row||("Row "+(ri+1));block.append(title);
  const grid=document.createElement("div");grid.className="seating-two-side";
  for(const side of ["left","right"]){
   const col=document.createElement("div");col.className="seating-side";
   (Array.isArray(row[side])?row[side]:[]).forEach((name,idx)=>{
    const line=document.createElement("label");line.className="seating-entry";
    const num=document.createElement("span");num.textContent=String(idx+1);
    const input=document.createElement("input");input.type="text";input.maxLength=80;input.value=name||"";input.disabled=!adminModes.seating;input.dataset.row=ri;input.dataset.side=side;input.dataset.index=idx;
    line.append(num,input);col.append(line);
   });
   grid.append(col);
  }
  block.append(grid);wrap.append(block);
 });
 const edit=$("#seatingEdit",root);if(edit)edit.style.display=adminModes.seating?"block":"none";
 const b=$("#seatingAdminBtn",root);if(b)b.textContent=adminModes.seating?"🔒 수정 종료":"🔐 관리자 수정";
}
async function loadSeating(){
 const r=await loadData("seating",seatingData);
 const rows=getRows(r.data);
 if(rows.length)seatingData={rows:rows.map(x=>({row:x.row||"",left:Array.isArray(x.left)?x.left.slice():[],right:Array.isArray(x.right)?x.right.slice():[]})),updatedAt:r.data.updatedAt||0};
 renderSeating();setMsg("seatingLatestMsg",r.source==="unavailable"?message("fallback"):"최신 자리배치 내용을 불러왔습니다.");
}
async function toggleSeatingAdmin(){await togglePageAdmin("seating","seatingAdminBtn","seatingSaveBtn");}
async function saveSeating(){
 if(!adminModes.seating){alert(message("admin"));return;}
 $$("#seating .seating-entry input").forEach(input=>{const row=seatingData.rows[Number(input.dataset.row)];if(row)row[input.dataset.side][Number(input.dataset.index)]=input.value.trim();});
 try{seatingData=await saveCloud("seating",seatingData);setMsg("seatingLatestMsg",message("saved"));renderSeating();}
 catch(e){console.error(e);setMsg("seatingLatestMsg",message("failed"));}
}

/* Castle Participation roster: its document is independent from war and layout. */
function normalizeParticipants(raw){
 const list=Array.isArray(raw?.participants)?raw.participants:[];
 return list.filter(x=>x&&typeof x==="object").map(x=>({
  nickname:String(x.nickname||"").trim(),status:["yes","no","later"].includes(x.status)?x.status:"yes",
  tier:["A","B","C","none"].includes(x.tier)?x.tier:"A",salo:(x.salo===true||x.salo==="yes"||x.salo==="O"),hilde:(x.hilde===true||x.hilde==="yes"||x.hilde==="O"),updatedAt:Number(x.updatedAt)||0
 })).filter(x=>x.nickname);
}
function participantRank(p){if(!p||p.status!=="yes")return "";const base={A:"A",B:"B",C:"C"}[p.tier];if(!base)return "";return base+(p.salo?"1":"2");}
function renderParticipants(){
 const root=$("#battleJoin");if(!root)return;
 const sel=$("#ncNick",root);if(sel){
  const old=sel.value;sel.innerHTML='<option value="">닉네임 선택</option>'+[...new Set(participants.map(p=>p.nickname))].sort((a,b)=>a.localeCompare(b)).map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("")+'<option value="__custom__">직접 입력</option>';
  if([...sel.options].some(o=>o.value===old))sel.value=old;
 }
 const list=$("#ncParticipants",root);
 if(list)list.innerHTML=participants.map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(p.status)+ '</span><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">등록된 참전 정보가 없습니다.</p>';
 const waiting=$("#ncWaiting",root);
 if(waiting)waiting.innerHTML=participants.filter(p=>p.status==="later").map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">대기 명단이 없습니다.</p>';

}
async function loadNewCastleFeatures(){
 const root=$("#"+(activePage==="battleJoin"?"battleJoin":"castlewar1"));
 try{
  const own=await readCloud(activePage==="battleJoin"?"battleJoin":"castlewar1");
  if(activePage==="battleJoin"){
   let data=own;
   if(!data){const old=await getDoc(legacyDoc("battleJoin"));if(old.exists())data=old.data();}
   participants=normalizeParticipants(data||{});
   renderParticipants();setMsg("ncJoinMsg",message("load"));
  }else{
   let data=own;
   if(!data){const old=await getDoc(legacyDoc("castlewar1"));if(old.exists())data=old.data();}
   const war=data?.war||data?.castleWar||{};
   castleWarData={war:{...castleWarData.war,...war,substitute:{...castleWarData.war.substitute,...(war.substitute||{})}},warLeaders:data?.warLeaders||castleWarData.warLeaders,updatedAt:data?.updatedAt||0};
   renderCastleWar();setMsg("ncWarMsg",message("load"));
  }
 }catch(e){console.error(e);if(activePage==="battleJoin")setMsg("ncJoinMsg",message("fallback"));else setMsg("ncWarMsg",message("fallback"));}
}
function updateNewCastleJoinFields(){
 const root=$("#battleJoin"),sel=$("#ncNick",root),custom=$("#ncCustomNickname",root);
 if(custom)custom.hidden=sel?.value!=="__custom__";
 const existing=participants.find(p=>p.nickname===sel?.value);
 if(existing){$("#ncStatus",root).value=existing.status;$("#ncTier",root).value=existing.tier;$("#ncSalo",root).value=existing.salo?"yes":"no";$("#ncHilde",root).value=existing.hilde?"yes":"no";}
}
function filterNewCastleNicknames(){
 const root=$("#battleJoin"),search=$("#ncIdSearch",root),sel=$("#ncNick",root);
 if(!search||!sel)return;
 const q=search.value.trim().toLowerCase();
 [...sel.options].forEach((o,i)=>{if(!o.value||o.value==="__custom__")return;o.hidden=Boolean(q)&&!o.textContent.toLowerCase().includes(q);});
}
async function submitNewCastleParticipation(){
 const root=$("#battleJoin"),sel=$("#ncNick",root);
 let nickname=sel?.value==="__custom__"?($("#ncIdSearch",root)?.value||"").trim():(sel?.value||"").trim();
 if(!nickname){setMsg("ncJoinMsg","닉네임을 선택하거나 입력하세요.");return;}
 if(nickname.length>80){setMsg("ncJoinMsg","닉네임은 80자 이내로 입력하세요.");return;}
 const item={nickname,status:$("#ncStatus",root)?.value||"yes",tier:$("#ncTier",root)?.value||"A",salo:$("#ncSalo",root)?.value==="yes",hilde:$("#ncHilde",root)?.value==="yes",updatedAt:Date.now()};
 const idx=participants.findIndex(p=>p.nickname.toLowerCase()===nickname.toLowerCase());
 if(idx>=0)participants[idx]=item;else participants.push(item);
 try{await saveCloud("battleJoin",{participants});renderParticipants();setMsg("ncJoinMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncJoinMsg",message("failed"));}
}
async function cancelNewCastleParticipation(){
 const root=$("#battleJoin"),sel=$("#ncNick",root),nickname=sel?.value||"";
 if(!nickname||nickname==="__custom__"){setMsg("ncJoinMsg","삭제할 닉네임을 선택하세요.");return;}
 if(!confirm(nickname+"님의 참전 정보를 취소할까요?"))return;
 participants=participants.filter(p=>p.nickname.toLowerCase()!==nickname.toLowerCase());
 try{await saveCloud("battleJoin",{participants});renderParticipants();setMsg("ncMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncMsg",message("failed"));}
}
async function deleteAllNewCastleParticipants(){
 if(!adminModes.battleJoin||!confirm("참전 등록 명단을 모두 삭제할까요?"))return;
 participants=[];
 try{await saveCloud("battleJoin",{participants});renderParticipants();setMsg("ncMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncMsg",message("failed"));}
}
async function toggleNewCastleAdmin(){
 if(activePage==="battleJoin"){
  if(!adminModes.battleJoin&&!await ensureGoogleAdmin())return;
  adminModes.battleJoin=!adminModes.battleJoin;
  const b=$("#ncAdminBtn"),del=$("#ncDeleteAllBtn");
  if(b)b.textContent=adminModes.battleJoin?"🔒 수정 종료":"🔐 관리자 수정";
  if(del)del.style.display=adminModes.battleJoin?"inline-flex":"none";
  return;
 }
 if(!adminModes.castlewar1&&!await ensureGoogleAdmin())return;
 adminModes.castlewar1=!adminModes.castlewar1;
 const b=$("[data-newcastle='admin']",$("#castlewar1"))[0];
 if(b)b.textContent=adminModes.castlewar1?"🔒 수정 종료":"🔐 관리자 수정";
 renderCastleWar();
}
function renderCastleWar(){
 const root=$("#castlewar1");if(!root)return;
 const config=[["assault","돌격조",7],["rush","개돌조",7],["finish","마무리조",7],["north","북측포탑",10],["west","서측포탑",10]];
 const attack=$("#ncWarAttack",root),turrets=$("#ncWarTurrets",root);
 const renderColumn=([key,title,count])=>'<section class="war-column"><h3>'+title+'</h3>'+Array.from({length:count},(_,i)=>{const value=castleWarData.war[key]?.[i]||"";return '<label class="war-slot"><span>'+(i+1)+'</span><input '+(!adminModes.castlewar1?'disabled':'')+' data-war="'+key+'" data-index="'+i+'" value="'+esc(value)+'" maxlength="80"></label>';}).join("")+'</section>';
 if(attack)attack.innerHTML=config.slice(0,3).map(renderColumn).join("");
 if(turrets)turrets.innerHTML=config.slice(3).map(renderColumn).join("");
 const waiting=$("#ncWarWaiting",root);
 if(waiting)waiting.innerHTML=participants.filter(p=>p.status==="later").map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">대기 명단이 없습니다.</p>';
 const saveButton=$("[data-newcastle='save']",root)[0];
 if(saveButton)saveButton.style.display=adminModes.castlewar1?"inline-flex":"none";
}
async function saveNewCastleFeatures(){
 if(!adminModes.castlewar1){alert(message("admin"));return;}
 $$("#castlewar1 [data-war]").forEach(el=>{const key=el.dataset.war,i=Number(el.dataset.index);if(castleWarData.war[key])castleWarData.war[key][i]=el.value.trim();});
 try{castleWarData=await saveCloud("castlewar1",castleWarData);setMsg("ncWarMsg",message("saved"));renderCastleWar();}
 catch(e){console.error(e);setMsg("ncWarMsg",message("failed"));}
}

/* Castle Layout — its own document; never writes to the war or participant record. */
async function loadCastleLayout1(){
 try{
  if(!participants.length){
   const legacyRoster=await getDoc(doc(db,"siteData","castle_features_v1"));
   if(legacyRoster.exists())participants=normalizeParticipants(legacyRoster.data());
  }
  const own=await readCloud("castlelayout1");
  if(own&&Array.isArray(own.slots))castleLayoutData={slots:own.slots.slice(0,28),updatedAt:own.updatedAt||0};
  else{
   const old=await getDoc(legacyDoc("castlelayout1"));
   if(old.exists()){const d=old.data();castleLayoutData={slots:Array.isArray(d.slots)?d.slots.slice(0,28):Array(28).fill(""),updatedAt:d.updatedAt||0};}
  }
  while(castleLayoutData.slots.length<28)castleLayoutData.slots.push("");
  FIXED_LEADERS.forEach((n,i)=>castleLayoutData.slots[i]=n);
  renderCastleLayout();setMsg("castleLayout1Msg",message("load"));
 }catch(e){console.error(e);renderCastleLayout();setMsg("castleLayout1Msg",message("fallback"));}
}
function renderCastleLayout(){
 const root=$("#castlelayout1"),wrap=$("#castleLayout1Slots",root);if(!wrap)return;
 const names=[...new Set([...FIXED_LEADERS,...participants.map(p=>p.nickname)])];
 wrap.innerHTML=Array.from({length:28},(_,i)=>{
  const name=castleLayoutData.slots[i]||"",isFixed=i<6;
  let inner;
  if(adminModes.castlelayout1&&!isFixed)inner='<select data-layout-slot="'+i+'"><option value="">—</option>'+names.map(n=>'<option value="'+esc(n)+'" '+(n===name?'selected':'')+'>'+esc(n)+'</option>').join("")+'</select>';
  else inner='<span>'+esc(name||"—")+'</span>';
  return '<div class="castle-layout1-slot"><span class="castle-layout1-number">'+(i+1)+'</span><div class="castle-layout1-content">'+inner+'</div></div>';
 }).join("");
 const b=$("#castleLayout1AdminBtn",root),s=$("#castleLayout1SaveBtn",root);
 if(b)b.textContent=adminModes.castlelayout1?"🔒 수정 종료":"🔐 관리자 수정";
 if(s)s.hidden=!adminModes.castlelayout1;
}
async function toggleCastleLayout1Admin(){await togglePageAdmin("castlelayout1","castleLayout1AdminBtn","castleLayout1SaveBtn");}
async function saveCastleLayout1(){
 if(!adminModes.castlelayout1){alert(message("admin"));return;}
 $$("#castlelayout1 [data-layout-slot]").forEach(el=>castleLayoutData.slots[Number(el.dataset.layoutSlot)]=el.value);
 FIXED_LEADERS.forEach((n,i)=>castleLayoutData.slots[i]=n);
 const chosen=castleLayoutData.slots.slice(6).filter(Boolean);
 if(new Set(chosen).size!==chosen.length){alert("7~28번에는 중복 닉네임을 넣을 수 없습니다.");return;}
 try{castleLayoutData=await saveCloud("castlelayout1",castleLayoutData);renderCastleLayout();setMsg("castleLayout1Msg",message("saved"));}
 catch(e){console.error(e);setMsg("castleLayout1Msg",message("failed"));}
}

/* Viking team registration */
function renderViking(){
 const root=$("#viking"),team=$("#vikingTeam"),count=$("#vikingCount"),list=$("#vikingTeams");
 if(team)team.innerHTML=Array.from({length:25},(_,i)=>'<option value="'+(i+1)+'">Team '+(i+1)+'</option>').join("");
 if(count)count.textContent=Object.values(vikingData.teams||{}).reduce((n,a)=>n+(a?.length||0),0)+" / 100";
 if(list)list.innerHTML=Array.from({length:25},(_,i)=>{const a=vikingData.teams?.[i+1]||[];return '<div class="viking-team"><h3>Team '+(i+1)+' ('+a.length+'/4)</h3>'+Array.from({length:4},(_,j)=>'<div class="viking-member">'+esc(a[j]||"—")+'</div>').join("")+'</div>';}).join("");
}
function toggleVikingCustomNick(){const sel=$("#vikingNickname"),custom=$("#vikingCustomNickname");if(!sel||!custom)return;custom.style.display=sel.value==="__custom__"?"block":"none";}
function getVikingSelectedNick(){return $("#vikingNickname")?.value==="__custom__"?($("#vikingCustomNickname")?.value||"").trim():($("#vikingNickname")?.value||"").trim();}
async function loadViking(){
 const r=await loadData("viking",vikingData);
 if(r.data.teams)vikingData={...vikingData,...r.data,teams:{...vikingData.teams,...r.data.teams}};
 renderViking();setMsg("vikingMsg",r.source==="unavailable"?message("fallback"):message("load"));
}
async function saveViking(){try{vikingData=await saveCloud("viking",vikingData);renderViking();setMsg("vikingMsg",message("saved"));return true;}catch(e){console.error(e);setMsg("vikingMsg",message("failed"));return false;}}
async function joinVikingTeam(){
 const name=getVikingSelectedNick(),team=Number($("#vikingTeam")?.value),msg=$("#vikingMsg");
 if(!name||!team){if(msg)msg.textContent="닉네임과 팀을 선택하세요.";return;}
 if(Object.values(vikingData.teams).some(a=>a.some(n=>n.toLowerCase()===name.toLowerCase()))){if(msg)msg.textContent="이미 다른 팀에 등록되어 있습니다.";return;}
 const roster=vikingData.teams[team]||[];if(roster.length>=4){if(msg)msg.textContent="선택한 팀이 가득 찼습니다.";return;}
 vikingData.teams[team]=[...roster,name];await saveViking();
}
async function leaveVikingTeam(){
 const name=getVikingSelectedNick();if(!name){setMsg("vikingMsg","취소할 닉네임을 선택하세요.");return;}
 let found=false;
 for(const [team,roster] of Object.entries(vikingData.teams)){if(roster.some(n=>n.toLowerCase()===name.toLowerCase())){vikingData.teams[team]=roster.filter(n=>n.toLowerCase()!==name.toLowerCase());found=true;}}
 if(!found){setMsg("vikingMsg","등록된 팀이 없습니다.");return;}await saveViking();
}

/* Glory records */
async function loadRecords(){
 try{
  const cloud=await readCloud("glory");
  gloryRecords=Array.isArray(cloud?.records)?cloud.records:clone(defaultGloryRecords);
  renderRecords();setMsg("glory-msg",message("load"));
 }catch(e){console.error(e);gloryRecords=clone(defaultGloryRecords);renderRecords();setMsg("glory-msg",message("fallback"));}
}
function renderRecords(){
 const root=$("#glory-records");if(!root)return;
 root.innerHTML=gloryRecords.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map((r,i)=>'<article class="glory-record"><header><strong>'+esc(r.date)+'</strong><span>상대 왕국 '+esc(r.opponent)+'</span></header><div class="glory-results"><span>준비기간: '+(r.prep==="승"?"🏆 승리":"⚔️ 패배")+'</span><span>전쟁기간: '+(r.castle==="승"?"🏆 승리":"⚔️ 패배")+'</span></div>'+(r.memo?'<p>'+esc(r.memo)+'</p>':"")+(adminModes.glory?'<button type="button" onclick="deleteRecord('+i+')">삭제</button>':"")+'</article>').join("")||'<p class="muted">기록이 없습니다.</p>';
}
function openEditor(){if(!adminModes.glory){ensureGoogleAdmin().then(ok=>{if(ok){adminModes.glory=true;$("#glory-editor").hidden=false;renderRecords();}});return;}$("#glory-editor").hidden=false;}
function closeEditor(){$("#glory-editor").hidden=true;}
async function saveRecord(){
 if(!adminModes.glory&&!await ensureGoogleAdmin())return;adminModes.glory=true;
 const date=$("#glory-date")?.value,opponent=Number($("#glory-opponent")?.value);
 if(!date||!opponent){setMsg("glory-editor-msg","날짜와 상대 왕국을 입력하세요.");return;}
 gloryRecords.push({date,opponent,prep:$("#glory-prep")?.value||"패",castle:$("#glory-castle")?.value||"패",memo:$("#glory-memo")?.value.trim()||""});
 try{await saveCloud("glory",{records:gloryRecords});renderRecords();closeEditor();setMsg("glory-msg",message("saved"));}
 catch(e){console.error(e);setMsg("glory-msg",message("failed"));}
}
async function deleteRecord(index){
 if(!adminModes.glory||!confirm("이 기록을 삭제할까요?"))return;
 gloryRecords.splice(index,1);
 try{await saveCloud("glory",{records:gloryRecords});renderRecords();setMsg("glory-msg",message("saved"));}
 catch(e){console.error(e);setMsg("glory-msg",message("failed"));}
}

/* Inline handlers are explicitly exported because page markup is static HTML. */
Object.assign(window,{
 loadHome,toggleHomeAdmin,saveHome,refreshTeams:loadTeams,toggleTeamsAdmin,saveAllTeams,
 loadAlliance,toggleAllianceAdmin,saveAlliance,loadSeating,toggleSeatingAdmin,saveSeating,
 updateNewCastleJoinFields,filterNewCastleNicknames,submitNewCastleParticipation,cancelNewCastleParticipation,
 loadNewCastleFeatures,toggleNewCastleAdmin,deleteAllNewCastleParticipants,saveNewCastleFeatures,
 loadCastleLayout1,toggleCastleLayout1Admin,saveCastleLayout1,runCastleLayout1Auto:()=>{if(!adminModes.castlelayout1){alert(message("admin"));return;}const active=participants.filter(p=>p.status==="yes"&&participantRank(p)).sort((a,b)=>participantRank(a).localeCompare(participantRank(b)));for(let i=6;i<28;i++)castleLayoutData.slots[i]=active[i-6]?.nickname||"";renderCastleLayout();},
 toggleVikingCustomNick,joinVikingTeam,leaveVikingTeam,loadViking,openEditor,closeEditor,saveRecord,loadRecords,deleteRecord
});

function boot(){
 const savedLang=(()=>{try{return localStorage.getItem("kor1816_rebuild_lang_v1")||localStorage.getItem("kor1816_lang")||"ko";}catch{return "ko";}})();
 currentLang=LANGS.includes(savedLang)?savedLang:"ko";
 setupTemplates();makeNav();
 $("#language-select").addEventListener("change",e=>applyLanguage(e.target.value));
 window.addEventListener("hashchange",restoreRoute);window.addEventListener("popstate",restoreRoute);
 ensureReadSession().catch(e=>console.warn("Read session unavailable",e));
 restoreRoute();
}
boot();
