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
const FIXED_NICKNAMES=["Nemesis","Pham","샌디에이고","Constant","SsungBi","Jinno","KOREAN MONSTER","hhHa","GeeGeeGeeZ","Jiwon","Aveline","DON QUIXOTE","Leo li","Aimee","yongi","moon","Chan Dam Bom","bebe","VIVIAN","Pika","Lekum","ImNotKorean","DDoro","Hani","miiiiia","bossi","Wilk","Krungkrung","Keith ape","OMEGA","Zidf","hajae","Mushi","Libby","LSJ","jennie","Nyctifer_v","Lager","GieZues","Sant Jordi","Eagle","Architect","El Elegido","LJ","Furball","AVA","AgaresKOR","coculim","Rarara","ROKA","Ian","다잘이 돌아왔다","backki","Commander 주","HIGH FIVE","Gideon","Dark Knight","Lady Anaiah","Korean","FlexMan","Dingdong","Alucard","S ssh","Hair loss beam","RESCENE Yaho","SUMMER","hun","themis1994","Sylvanas","RACruze","Kashish","Vista","HERA","Alchemist","DaddyEpstein","KOR","Rayan","ADIPATI KOR","Kuu Rawr","SAGAMI","KK Master","Solace","Bilal","The Warrior","Citykan","스타리아","Adanali Ibo","Hsun","benson627","Remember","Jshan","lolkillmeplz67","Pamuk","gozeromin","KOOK","Ojr","Mahecha","MG PRIME","MissCoco"];
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
let castleWarData = {war:{assault:Array(8).fill(""),rush:Array(8).fill(""),finish:Array(8).fill(""),north:Array(8).fill(""),west:Array(8).fill(""),reserve:Array(8).fill(""),substitute:{assault:"",rush:"",finish:""}},warLeaders:{assault:"Nemesis",rush:"Pham",finish:"샌디에이고"},updatedAt:0};
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
 translateStatic();
 if(activePage==="home")renderHome();
 document.dispatchEvent(new CustomEvent("kor1816:languagechange",{detail:{language:currentLang}}));
}
const ORIGINAL_TEXT = new WeakMap();
const STATIC_TRANSLATIONS = {
 "📢 최신 공지":["📢 최신 공지","📢 Latest Notice","📢 最新のお知らせ","📢 最新公告","📢 Neueste Mitteilung","📢 Ultimo avviso","📢 Aviso reciente","📢 Son Duyuru"],
 "📅 주요 일정":["📅 주요 일정","📅 Schedule","📅 主な予定","📅 主要日程","📅 Zeitplan","📅 Programma","📅 Calendario","📅 Program"],
 "🌍 Kingdom 1816":["🌍 Kingdom 1816","🌍 Kingdom 1816","🌍 Kingdom 1816","🌍 Kingdom 1816","🌍 Kingdom 1816","🌍 Kingdom 1816","🌍 Kingdom 1816","🌍 Kingdom 1816"],
 "공식 디스코드 서버에 입장하세요.":["공식 디스코드 서버에 입장하세요.","Join our official Discord server.","公式Discordサーバーに参加してください。","加入我们的官方 Discord 服务器。","Tritt unserem offiziellen Discord-Server bei.","Entra nel nostro server Discord ufficiale.","Únete a nuestro servidor oficial de Discord.","Resmî Discord sunucumuza katılın."],
 "📋 자리배치 목록":["📋 자리배치 목록","📋 Seating list","📋 配置一覧","📋 座位安排列表","📋 Sitzplan-Liste","📋 Elenco posti","📋 Lista de puestos","📋 Yerleşim listesi"],
 "✏️ 자리배치 닉네임 수정":["✏️ 자리배치 닉네임 수정","✏️ Edit seating nicknames","✏️ 配置名を編集","✏️ 编辑座位昵称","✏️ Sitznamen bearbeiten","✏️ Modifica nomi","✏️ Editar nombres","✏️ Yerleşim takma adlarını düzenle"],
 "⚔️ 성검쟁탈":["⚔️ 성검쟁탈","⚔️ Holy Sword Clash","⚔️ 聖剣争奪","⚔️ 圣剑争夺","⚔️ Heiliges Schwert","⚔️ Duello della Spada Sacra","⚔️ Duelo de la Espada Sagrada","⚔️ Kutsal Kılıç"],
 "🗡️ 3대연맹전":["🗡️ 3대연맹전","🗡️ Three Alliances War","🗡️ 三大連盟戦","🗡️ 三大联盟战","🗡️ Krieg der drei Allianzen","🗡️ Guerra delle Tre Alleanze","🗡️ Guerra de las Tres Alianzas","🗡️ Üç İttifak Savaşı"],
 "🪓 바이킹 팀 편성":["🪓 바이킹 팀 편성","🪓 Viking Team Formation","🪓 バイキング編成","🪓 维京队伍编排","🪓 Wikinger-Teamaufstellung","🪓 Formazione squadre vichinghe","🪓 Formación de equipos vikingos","🪓 Viking Takım Dizilimi"],
 "팀 참가":["팀 참가","Join team","チーム参加","加入队伍","Team beitreten","Unisciti al team","Unirse al equipo","Takıma katıl"],
 "참가 취소":["참가 취소","Cancel participation","参加を取り消す","取消参加","Teilnahme abbrechen","Annulla partecipazione","Cancelar participación","Katılımı iptal et"],
 "게임 닉네임 선택":["게임 닉네임 선택","Select game nickname","ゲーム名を選択","选择游戏昵称","Spielname auswählen","Seleziona nickname di gioco","Elegir apodo del juego","Oyun takma adı seç"],
 "참가 팀":["참가 팀","Team","参加チーム","参赛队伍","Team","Squadra","Equipo","Takım"],
 "⚔️ 전투참전":["⚔️ 전투참전","⚔️ Castle Participation","⚔️ 城战报名","⚔️ 城堡参战","⚔️ Burgteilnahme","⚔️ Partecipazione al Castello","⚔️ Participación en el Castillo","⚔️ Kale Katılımı"],
 "참전 정보를 등록하세요. 닉네임은 고정 명단에서 선택합니다.":["참전 정보를 등록하세요. 닉네임은 고정 명단에서 선택합니다.","Register your participation. Select a nickname from the list.","参加情報を登録してください。リストから名前を選択します。","请登记参战信息，并从名单中选择昵称。","Registriere deine Teilnahme und wähle einen Namen aus der Liste.","Registra la partecipazione e scegli un nome dall'elenco.","Registra tu participación y elige un nombre de la lista.","Katılımını kaydet ve listeden bir takma ad seç."],
 "닉네임":["닉네임","Nickname","名前","昵称","Spitzname","Nickname","Apodo","Takma ad"],
 "캐슬전 참가 상태":["캐슬전 참가 상태","Castle War status","城戦参加状況","城堡战参战状态","Burgkriegsstatus","Stato Guerra del Castello","Estado de Guerra del Castillo","Kale Savaşı durumu"],
 "병영 등급":["병영 등급","Barracks tier","兵舎ランク","兵营等级","Kaserne-Stufe","Livello caserma","Nivel de cuartel","Kışla seviyesi"],
 "등록된 참전 정보":["등록된 참전 정보","Registered participants","登録済み参加者","已登记参战信息","Registrierte Teilnehmer","Partecipanti registrati","Participantes registrados","Kayıtlı katılımcılar"],
 "대기 명단":["대기 명단","Waiting list","待機リスト","等待名单","Warteliste","Lista d'attesa","Lista de espera","Bekleme listesi"],
 "🏆 영광의 순간들":["🏆 영광의 순간들","🏆 Moments of Glory","🏆 栄光の瞬間","🏆 荣耀时刻","🏆 Ruhmreiche Momente","🏆 Momenti di Gloria","🏆 Momentos de Gloria","🏆 Zafer Anları"],
 "준비기간과 전쟁기간의 승패를 기록합니다.":["준비기간과 전쟁기간의 승패를 기록합니다.","Record the results of the preparation and war periods.","準備期間と戦争期間の結果を記録します。","记录准备阶段和战争阶段的胜负。","Erfasse die Ergebnisse der Vorbereitungs- und Kriegsphase.","Registra i risultati della fase di preparazione e di guerra.","Registra los resultados de preparación y guerra.","Hazırlık ve savaş dönemi sonuçlarını kaydedin."],
 "캐슬전 기록 추가":["캐슬전 기록 추가","Add Castle War record","城戦記録を追加","添加城堡战记录","Burgkriegsaufzeichnung hinzufügen","Aggiungi registro Guerra del Castello","Añadir registro de Guerra del Castillo","Kale Savaşı kaydı ekle"],
 "전투 날짜":["전투 날짜","Battle date","戦闘日","战斗日期","Kampftag","Data della battaglia","Fecha de batalla","Savaş tarihi"],
 "상대 왕국":["상대 왕국","Opponent kingdom","相手王国","对手王国","Gegnerisches Königreich","Regno avversario","Reino rival","Rakip krallık"],
 "준비기간 결과":["준비기간 결과","Preparation result","準備期間の結果","准备阶段结果","Ergebnis der Vorbereitungsphase","Risultato preparazione","Resultado de preparación","Hazırlık sonucu"],
 "전쟁기간 결과":["전쟁기간 결과","War period result","戦争期間の結果","战争阶段结果","Ergebnis der Kriegsphase","Risultato della guerra","Resultado de guerra","Savaş dönemi sonucu"],
 "전투 메모 — 선택 사항":["전투 메모 — 선택 사항","Battle notes — optional","戦闘メモ（任意）","战斗备注（可选）","Kampfnotizen – optional","Note battaglia — facoltative","Notas de batalla — opcional","Savaş notları — isteğe bağlı"]
};
Object.assign(STATIC_TRANSLATIONS,{"🔱 캐슬전":["🔱 캐슬전","🔱 Castle War","🔱 城戦","🔱 城堡战","🔱 Burgkrieg","🔱 Guerra del Castello","🔱 Guerra del Castillo","🔱 Kale Savaşı"],"🏰 캐슬배치":["🏰 캐슬배치","🏰 Castle Layout","🏰 城堡配置","🏰 城堡布阵","🏰 Burgaufstellung","🏰 Disposizione del Castello","🏰 Distribución del Castillo","🏰 Kale Dizilimi"],"⚔️ 전투 공지":["⚔️ 전투 공지","⚔️ Battle Orders","⚔️ 戦闘告知","⚔️ 战斗公告","⚔️ Kampfmeldungen","⚔️ Ordini di battaglia","⚔️ Órdenes de batalla","⚔️ Savaş Emirleri"],"돌격조":["돌격조","Assault Squad","突撃隊","突击组","Sturmtrupp","Squadra d'assalto","Escuadrón de asalto","Hücum Ekibi"],"개돌조":["개돌조","Rush Squad","突撃部隊","冲锋组","Angriffstrupp","Squadra rapida","Escuadrón de avance","Hızlı Hücum Ekibi"],"마무리조":["마무리조","Finishing Squad","仕上げ隊","收尾组","Abschlusstrupp","Squadra finale","Escuadrón final","Bitirici Ekip"],"북측포탑":["북측포탑","North Turret","北側砲塔","北侧炮塔","Nordturm","Torretta nord","Torreta norte","Kuzey Kulesi"],"서측포탑":["서측포탑","West Turret","西側砲塔","西侧炮塔","Westturm","Torretta ovest","Torreta oeste","Batı Kulesi"],"집결장":["집결장","Rally Leader","集結主","集结队长","Rally-Anführer","Leader rally","Líder de rally","Ralli Lideri"],"집결원 공격":["집결원 공격","Rally Member Attack","集結メンバー攻撃","集结成员攻击","Angriff der Rally-Mitglieder","Attacco membri rally","Ataque de miembros","Ralli Üyesi Saldırısı"],"집결원 수비":["집결원 수비","Rally Member Defense","集結メンバー防衛","集结成员防守","Verteidigung der Rally-Mitglieder","Difesa membri rally","Defensa de miembros","Ralli Üyesi Savunması"],"⚔️ 전투참전":["⚔️ 전투참전","⚔️ Castle Participation","⚔️ 城战报名","⚔️ 城堡参战","⚔️ Burgteilnahme","⚔️ Partecipazione al Castello","⚔️ Participación en el Castillo","⚔️ Kale Katılımı"],"참전 정보를 등록하세요. 닉네임은 고정 명단에서 선택합니다.":["참전 정보를 등록하세요. 닉네임은 고정 명단에서 선택합니다.","Register your participation. Select a nickname from the list.","参加情報を登録してください。リストから名前を選択します。","请登记参战信息，并从名单中选择昵称。","Registriere deine Teilnahme und wähle einen Namen aus der Liste.","Registra la partecipazione e scegli un nome dall'elenco.","Registra tu participación y elige un nombre de la lista.","Katılımını kaydet ve listeden bir takma ad seç."],"캐슬전 참가 상태":["캐슬전 참가 상태","Castle War status","城戦参加状況","城堡战参战状态","Burgkriegsstatus","Stato Guerra del Castello","Estado de Guerra del Castillo","Kale Savaşı durumu"],"병영 등급":["병영 등급","Barracks tier","兵舎ランク","兵营等级","Kaserne-Stufe","Livello caserma","Nivel de cuartel","Kışla seviyesi"],"등록된 참전 정보":["등록된 참전 정보","Registered participants","登録済み参加者","已登记参战信息","Registrierte Teilnehmer","Partecipanti registrati","Participantes registrados","Kayıtlı katılımcılar"],"대기 명단":["대기 명단","Waiting list","待機リスト","等待名单","Warteliste","Lista d'attesa","Lista de espera","Bekleme listesi"]});
Object.assign(STATIC_TRANSLATIONS,{"곰사냥":["곰사냥","Bear Hunt","ベアハント","熊猎","Bärenjagd","Caccia all'orso","Caza del oso","Ayı Avı"],"성검쟁탈":["성검쟁탈","Holy Sword Clash","聖剣争奪","圣剑争夺","Heiliges Schwert","Duello della Spada Sacra","Duelo de la Espada Sagrada","Kutsal Kılıç"],"3대연맹전":["3대연맹전","Three Alliances War","三大連盟戦","三大联盟战","Krieg der drei Allianzen","Guerra delle Tre Alleanze","Guerra de las Tres Alianzas","Üç İttifak Savaşı"],"골든 글레이브 월요일":["골든 글레이브 월요일","Golden Glaives Monday","ゴールデン・グレイブ（月曜）","黄金长戟（周一）","Goldene Glefen am Montag","Lame Dorate del lunedì","Guja Dorada del lunes","Pazartesi Altın Mızraklar"],"번호":["번호","No.","番号","编号","Nr.","N.","N.º","No."],"닉네임":["닉네임","Nickname","ニックネーム","昵称","Spitzname","Nickname","Apodo","Takma ad"],"가능":["가능","Available","参加可能","可以参战","Verfügbar","Disponibile","Disponible","Katılabilir"],"불가능":["불가능","Unavailable","参加不可","无法参战","Nicht verfügbar","Non disponibile","No disponible","Katılamaz"],"나중에 참전 / 참전 중 휴식":["나중에 참전 / 참전 중 휴식","Later / Resting during war","後で参加 / 休憩中","稍后参战 / 战斗中休息","Später / Pause während des Kriegs","Più tardi / pausa durante la guerra","Más tarde / descanso durante la guerra","Daha sonra / savaşta dinlenme"],"전투력순":["전투력순","Power ranking","戦力順","按战力排序","Nach Kampfkraft","Ordine per potenza","Por poder","Güç sıralaması"],"선착순 투표":["선착순 투표","First-come voting","先着順投票","先到先投票","Abstimmung nach Eingang","Voto in ordine di arrivo","Votación por orden de llegada","İlk gelen oy verir"],"승리":["승리","Victory","勝利","胜利","Sieg","Vittoria","Victoria","Zafer"],"패배":["패배","Defeat","敗北","失败","Niederlage","Sconfitta","Derrota","Yenilgi"],"등록/수정":["등록/수정","Register / Edit","登録 / 編集","登记 / 修改","Registrieren / Bearbeiten","Registra / Modifica","Registrar / Editar","Kaydet / Düzenle"],"참전 정보 등록 / 수정":["참전 정보 등록 / 수정","Register / Edit Participation","参加情報を登録 / 編集","登记 / 修改参战信息","Teilnahme registrieren / bearbeiten","Registra / modifica partecipazione","Registrar / editar participación","Katılımı kaydet / düzenle"],"자동 배치":["자동 배치","Auto-assign","自動配置","自动布阵","Automatisch zuweisen","Assegnazione automatica","Asignación automática","Otomatik yerleştir"],"수동 수정":["수동 수정","Manual edit","手動編集","手动编辑","Manuell bearbeiten","Modifica manuale","Edición manual","Elle düzenle"]});
Object.assign(STATIC_TRANSLATIONS,{"준비기간:":["준비기간:","Preparation:","準備期間：","准备阶段：","Vorbereitung:","Preparazione:","Preparación:","Hazırlık:"],"전쟁기간:":["전쟁기간:","War period:","戦争期間：","战争阶段：","Kriegsphase:","Periodo di guerra:","Periodo de guerra:","Savaş dönemi:"],"기록이 없습니다.":["기록이 없습니다.","No records yet.","記録はありません。","暂无记录。","Noch keine Einträge.","Nessun record.","Aún no hay registros.","Henüz kayıt yok."],"삭제":["삭제","Delete","削除","删除","Löschen","Elimina","Eliminar","Sil"]});
function translateStatic(){
 const root=$("#page-root");if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const parent=node.parentElement;if(!parent)continue;
  if(parent.closest("button,.content,.notice,.msg,.participant-line,.seating-row,.castle-layout1-content,.war-name,.viking-member,input,textarea,script,style"))continue;
  if(!ORIGINAL_TEXT.has(node))ORIGINAL_TEXT.set(node,node.nodeValue);
  const original=ORIGINAL_TEXT.get(node),trim=original.trim();
  const translations=STATIC_TRANSLATIONS[trim];
  if(!translations)continue;
  const translated=translations[langIndex()];
  node.nodeValue=original.replace(trim,translated||trim);
 }
}
function latestBanner(id){
 const labels={
  seating:["최신 자리배치 내용을 불러왔습니다.","Latest seating assignments loaded.","最新の配置を読み込みました。","已加载最新座位安排。","Aktueller Sitzplan geladen.","Ultima disposizione caricata.","Se ha cargado la distribución más reciente.","En güncel yerleşim yüklendi."],
  castlewar1:["최신 캐슬전 내용을 불러왔습니다.","Latest Castle War content loaded.","最新の城戦データを読み込みました。","已加载最新城堡战内容。","Aktuelle Burgkriegsdaten geladen.","Dati Guerra del Castello aggiornati.","Se cargó el contenido más reciente de Guerra del Castillo.","En güncel Kale Savaşı içeriği yüklendi."],
  castlelayout1:["최신 캐슬배치 내용을 불러왔습니다.","Latest Castle Layout loaded.","最新の城配置を読み込みました。","已加载最新城堡布阵。","Aktuelle Burgaufstellung geladen.","Disposizione del Castello aggiornata.","Se cargó la distribución del Castillo más reciente.","En güncel kale dizilimi yüklendi."],
  battleJoin:["최신 캐슬참전 내용을 불러왔습니다.","Latest Castle Participation content loaded.","最新の城戦参加情報を読み込みました。","已加载最新城堡参战信息。","Aktuelle Burgteilnahme geladen.","Partecipazioni al Castello aggiornate.","Se cargó la participación más reciente.","En güncel Kale Katılımı yüklendi."]
 };
 return (labels[id]||[message("load")])[langIndex()];
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
 const edited={latestTitle:$("#homeLatestInput",root)?.value||"",latestBody:$("#homeLatestBody",root)?.value||"",schedule:$("#homeScheduleInput",root)?.value||"",welcome:$("#homeWelcomeInput",root)?.value||""};
 homeData={...homeData,translations:{...(homeData.translations||{}),[currentLang]:edited}};
 if(currentLang==="ko")homeData={...homeData,...edited};
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
 (teamData.subs||[]).forEach((v,i)=>{const el=$("#sub-"+(i+1),root);if(el)el.value=v||"";});
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
 setInputsEnabled(root,adminModes.alliance);
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
function getRows(value){
 if(Array.isArray(value))return value;
 if(!value||typeof value!=="object")return [];
 for(const key of ["columns","seating","layout","seatingData","placements","members","data","rows"]){
  const candidate=value[key];
  if(Array.isArray(candidate))return candidate;
  if(candidate&&typeof candidate==="object"){const nested=getRows(candidate);if(nested.length)return nested;}
 }
 return [];
}
function normalizeSeatingRows(value){
 const source=getRows(value);
 const leftLens=[12,17,26],rightLens=[12,18,16];
 return [0,1,2].map(i=>{
  const row=source[i]||{};
  const left=Array.isArray(row.left)?row.left:[];
  const right=Array.isArray(row.right)?row.right:[];
  return {row:["Row 1","Row 2","Row 3"][i],left:Array.from({length:leftLens[i]},(_,j)=>String(left[j]??"")),right:Array.from({length:rightLens[i]},(_,j)=>String(right[j]??""))};
 });
}
function renderSeating(){
 const root=$("#seating");if(!root)return;
 const wrap=$(".seating-3col-wrap",root);if(!wrap)return;
 wrap.innerHTML=seatingData.rows.map((row,ri)=>'<div class="seating-row-group"><h3 class="seating-column-title">'+row.row+'</h3><div class="seating-split-pair"><section class="seating-split-card"><h4>Bear1</h4>'+row.left.map((name,i)=>'<div class="seating-row"><span>'+(i+1)+'</span><span>'+esc(name||"—")+'</span></div>').join("")+'</section><section class="seating-split-card"><h4>Bear2</h4>'+row.right.map((name,i)=>'<div class="seating-row"><span>'+(i+1)+'</span><span>'+esc(name||"—")+'</span></div>').join("")+'</section></div></div>').join("");
 const panel=$("#seatingEdit",root);if(panel)panel.style.display=adminModes.seating?"block":"none";
 const button=$("#seatingAdminBtn",root);if(button)button.textContent=adminModes.seating?"🔒 수정 종료":"🔐 관리자 수정";
}
function renderSeatingAdmin(){
 const root=$("#seating"),grid=$("#seatingEditGrid",root);if(!grid)return;
 grid.innerHTML=seatingData.rows.map((row,ri)=>'<section class="seating-edit-column"><h4>'+row.row+'</h4><div class="seating-edit-split"><div class="seating-edit-card"><h5>Bear1</h5>'+row.left.map((name,i)=>'<label class="seating-edit-row"><span>'+(i+1)+'</span><input data-seating-row="'+ri+'" data-seating-side="left" data-seating-index="'+i+'" value="'+esc(name)+'" maxlength="80"></label>').join("")+'</div><div class="seating-edit-card"><h5>Bear2</h5>'+row.right.map((name,i)=>'<label class="seating-edit-row"><span>'+(i+1)+'</span><input data-seating-row="'+ri+'" data-seating-side="right" data-seating-index="'+i+'" value="'+esc(name)+'" maxlength="80"></label>').join("")+'</div></div></section>').join("");
}
async function loadSeating(){
 const r=await loadData("seating",seatingData);
 seatingData={rows:normalizeSeatingRows(r.data),updatedAt:r.data.updatedAt||0};
 renderSeating();renderSeatingAdmin();
 setMsg("seatingLatestMsg",r.source==="unavailable"?message("fallback"):latestBanner("seating"));
}
async function toggleSeatingAdmin(){
 if(!adminModes.seating&&!await ensureGoogleAdmin())return;
 adminModes.seating=!adminModes.seating;
 renderSeating();renderSeatingAdmin();
}
async function saveSeating(){
 if(!adminModes.seating){alert(message("admin"));return;}
 $$("#seatingEditGrid [data-seating-row]").forEach(input=>{
  const row=seatingData.rows[Number(input.dataset.seatingRow)];
  if(row)row[input.dataset.seatingSide][Number(input.dataset.seatingIndex)]=input.value.trim();
 });
 try{seatingData=await saveCloud("seating",seatingData);renderSeating();renderSeatingAdmin();setMsg("seatingLatestMsg",message("saved"));}
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
 const sel=$("#ncNick",root);
 if(sel){
  const old=sel.value;
  const names=[...new Set([...FIXED_NICKNAMES,...participants.map(p=>p.nickname)])];
  sel.innerHTML='<option value="">닉네임 선택</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("")+'<option value="__custom__">직접 입력</option>';
  if([...sel.options].some(o=>o.value===old))sel.value=old;
 }
 const list=$("#ncParticipants",root);
 if(list)list.innerHTML=participants.map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(p.status)+'</span><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">등록된 참전 정보가 없습니다.</p>';
 const waiting=$("#ncWaiting",root);
 if(waiting)waiting.innerHTML=participants.filter(p=>p.status==="later").map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">대기 명단이 없습니다.</p>';
 translateStatic();
}
async function loadNewCastleFeatures(){
 const root=$("#"+(activePage==="battleJoin"?"battleJoin":"castlewar1"));
 try{
  const own=await readCloud(activePage==="battleJoin"?"battleJoin":"castlewar1");
  if(activePage==="battleJoin"){
   let data=own;
   if(!data){const old=await getDoc(legacyDoc("battleJoin"));if(old.exists())data=old.data();}
   participants=normalizeParticipants(data||{});
   renderParticipants();setMsg("ncJoinMsg",latestBanner("battleJoin"));
  }else{
   let data=own;
   if(!data){const old=await getDoc(legacyDoc("castlewar1"));if(old.exists())data=old.data();}
   const war=data?.war||data?.castleWar||{};
   castleWarData={war:{...castleWarData.war,...war,substitute:{...castleWarData.war.substitute,...(war.substitute||{})}},warLeaders:data?.warLeaders||castleWarData.warLeaders,updatedAt:data?.updatedAt||0};
   renderCastleWar();setMsg("ncWarMsg",latestBanner("castlewar1"));
  }
 }catch(e){console.error(e);if(activePage==="battleJoin")setMsg("ncJoinMsg",message("fallback"));else setMsg("ncWarMsg",message("fallback"));}
}
function updateNewCastleJoinFields(){
 const root=$("#battleJoin"),sel=$("#ncNick",root),search=$("#ncIdSearch",root),box=$("#ncNickSearchResults",root);
 if(search&&sel?.value&&sel.value!=="__custom__")search.value=sel.value;
 if(box){box.hidden=true;box.style.display="none";}
 const special=FIXED_LEADERS.includes(sel?.value);
 $("[data-nc-optional]",root).forEach(el=>{el.style.display=special?"none":"";});
 const existing=participants.find(p=>p.nickname===sel?.value);
 if(existing){$("#ncStatus",root).value=existing.status;$("#ncTier",root).value=existing.tier;$("#ncSalo",root).value=existing.salo?"yes":"no";$("#ncHilde",root).value=existing.hilde?"yes":"no";}
}
function filterNewCastleNicknames(){
 const root=$("#battleJoin"),search=$("#ncIdSearch",root),box=$("#ncNickSearchResults",root);
 if(!search||!box)return;
 const q=search.value.trim().toLocaleLowerCase();
 if(!q){box.innerHTML="";box.hidden=true;box.style.display="none";return;}
 const names=[...new Set([...FIXED_NICKNAMES,...participants.map(p=>p.nickname)])];
 const matches=names.filter(n=>n.toLocaleLowerCase().startsWith(q)).slice(0,30);
 if(!matches.length){box.innerHTML='<div class="nc-nickname-no-results">검색 결과가 없습니다.</div>';box.hidden=false;box.style.display="block";return;}
 box.innerHTML=matches.map(n=>'<button type="button" class="nc-nickname-result" data-nickname="'+esc(n)+'">'+esc(n+(participants.some(p=>p.nickname===n)?" ✓":""))+'</button>').join("");
 box.hidden=false;box.style.display="block";
 $$(".nc-nickname-result",box).forEach(button=>button.addEventListener("click",()=>chooseNewCastleNickname(button.dataset.nickname)));
}
function chooseNewCastleNickname(name){
 const root=$("#battleJoin"),sel=$("#ncNick",root),search=$("#ncIdSearch",root),box=$("#ncNickSearchResults",root);
 if(!sel||!name)return;
 if(![...sel.options].some(o=>o.value===name)){sel.add(new Option(name,name));}
 sel.value=name;
 if(search)search.value=name;
 if(box){box.hidden=true;box.style.display="none";}
 updateNewCastleJoinFields();
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
 try{await saveCloud("battleJoin",{participants});renderParticipants();setMsg("ncJoinMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncJoinMsg",message("failed"));}
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
function castleParticipantMeta(name){const p=participants.find(x=>x.nickname===name);if(!name)return "";if(FIXED_LEADERS.includes(name))return "S · 집결장";if(!p)return "";return (p.tier||"—")+" · 살로 "+(p.salo?"O":"X")+" · 힐데 "+(p.hilde?"O":"X");}
function renderCastleWar(){
 const root=$("#castlewar1");if(!root)return;
 const attack=$("#ncWarAttack",root),turrets=$("#ncWarTurrets",root);
 const groups=[["assault","돌격조"],["rush","개돌조"],["finish","마무리조"]];
 const turretGroups=[["north","Leo li","북측포탑"],["west","Jinno","서측포탑"],["reserve","SsungBi","포탑 (예비)"]];
 const names=[...new Set([...FIXED_NICKNAMES,...participants.map(p=>p.nickname)])];
 const optionList=(value)=>'<option value="">—</option>'+names.map(n=>'<option value="'+esc(n)+'" '+(n===value?'selected':'')+'>'+esc(n)+'</option>').join("");
 const cell=(name,key,index)=>adminModes.castlewar1?'<select data-war="'+key+'" data-index="'+index+'">'+optionList(name)+'</select>':'<div class="war-name"><strong>'+esc(name||"—")+'</strong><small>'+esc(castleParticipantMeta(name))+'</small></div>';
 const leaderCell=(key)=>adminModes.castlewar1?'<select data-war-leader="'+key+'">'+optionList(castleWarData.warLeaders[key]||"")+'</select>':'<div class="war-name">'+esc(castleWarData.warLeaders[key]||"—")+'</div>';
 const renderAttack=([key,title])=>'<section class="war-column"><h3>'+title+'</h3><div class="war-leader-row"><b>집결장</b>'+leaderCell(key)+'</div>'+Array.from({length:8},(_,i)=>'<label class="war-slot"><span>'+(i+1)+'</span>'+cell(castleWarData.war[key]?.[i]||"",key,i)+'</label>').join("")+'</section>';
 const renderTurret=([key,leader,title])=>'<section class="war-column"><h3>'+title+'</h3><div class="war-leader-row"><b>집결장</b><div class="war-name">'+esc(leader)+'</div></div>'+Array.from({length:8},(_,i)=>'<label class="war-slot"><span>'+(i+1)+'</span>'+cell(castleWarData.war[key]?.[i]||"",key,i)+'</label>').join("")+'</section>';
 if(attack)attack.innerHTML=groups.map(renderAttack).join("");
 if(turrets)turrets.innerHTML=turretGroups.map(renderTurret).join("");
 const waiting=$("#ncWarWaiting",root);
 if(waiting)waiting.innerHTML=participants.filter(p=>p.status==="later").map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">대기 명단이 없습니다.</p>';
 const saveButton=$$("[data-newcastle='save']",root)[0];
 if(saveButton)saveButton.style.display=adminModes.castlewar1?"inline-flex":"none";
 translateStatic();
}
async function saveNewCastleFeatures(){
 if(!adminModes.castlewar1){alert(message("admin"));return;}
 $("#castlewar1 [data-war]").forEach(el=>{const key=el.dataset.war,i=Number(el.dataset.index);if(castleWarData.war[key])castleWarData.war[key][i]=el.value.trim();});
 $("#castlewar1 [data-war-leader]").forEach(el=>{castleWarData.warLeaders[el.dataset.warLeader]=el.value.trim();});
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
   if(old.exists()){
    const d=old.data();castleLayoutData={slots:Array.isArray(d.slots)?d.slots.slice(0,28):Array(28).fill(""),updatedAt:d.updatedAt||0};
   }else{
    const sorted=participants.filter(p=>p.status==="yes"&&participantRank(p)&&!FIXED_LEADERS.includes(p.nickname)).sort((a,b)=>participantRank(a).localeCompare(participantRank(b))||a.nickname.localeCompare(b.nickname));
    castleLayoutData={slots:[...FIXED_LEADERS,...Array.from({length:22},(_,i)=>sorted[i]?.nickname||"")],updatedAt:0};
   }
  }
  while(castleLayoutData.slots.length<28)castleLayoutData.slots.push("");
  FIXED_LEADERS.forEach((n,i)=>castleLayoutData.slots[i]=n);
  renderCastleLayout();setMsg("castleLayout1Msg",latestBanner("castlelayout1"));
 }catch(e){console.error(e);renderCastleLayout();setMsg("castleLayout1Msg",message("fallback"));}
}
function renderCastleLayout(){
 const root=$("#castlelayout1"),wrap=$("#castleLayout1Slots",root);if(!wrap)return;
 const names=[...new Set([...FIXED_LEADERS,...participants.map(p=>p.nickname)])];
 wrap.innerHTML=Array.from({length:28},(_,i)=>{
  const name=castleLayoutData.slots[i]||"",isFixed=i<6,p=participants.find(x=>x.nickname===name);
  let inner;
  if(adminModes.castlelayout1&&!isFixed)inner='<select data-layout-slot="'+i+'"><option value="">—</option>'+names.map(n=>'<option value="'+esc(n)+'" '+(n===name?'selected':'')+'>'+esc(n)+'</option>').join("")+'</select>';
  else if(!name)inner='<span>—</span>';
  else if(isFixed)inner='<div class="layout-person"><strong>'+esc(name)+'</strong><small> S · 집결장</small></div>';
  else inner='<div class="layout-person"><strong>'+esc(name)+'</strong><small>'+esc(p?(participantRank(p)||p.tier)+" · 살로 "+(p.salo?"O":"X")+" · 힐데 "+(p.hilde?"O":"X"):"")+'</small></div>';
  return '<div class="castle-layout1-slot"><span class="castle-layout1-number">'+(i+1)+'</span><div class="castle-layout1-content">'+inner+'</div></div>';
 }).join("");
 const b=$("#castleLayout1AdminBtn",root),save=$("#castleLayout1SaveBtn",root);
 if(b)b.textContent=adminModes.castlelayout1?"🔒 수정 종료":"🔐 관리자 수정";
 if(save)save.style.display=adminModes.castlelayout1?"inline-flex":"none";
 translateStatic();
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
 const root=$("#viking"),team=$("#vikingTeam"),count=$("#vikingCount"),list=$("#vikingTeams"),nick=$("#vikingNickname");
 if(team)team.innerHTML=Array.from({length:25},(_,i)=>'<option value="'+(i+1)+'">Team '+(i+1)+'</option>').join("");
 if(nick){
  const selected=nick.value,names=[...new Set([...FIXED_NICKNAMES,...Object.values(vikingData.teams||{}).flat()])];
  nick.innerHTML='<option value="">닉네임 선택</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("")+'<option value="__custom__">직접 입력</option>';
  if([...nick.options].some(o=>o.value===selected))nick.value=selected;
 }
 if(count)count.textContent=Object.values(vikingData.teams||{}).reduce((n,a)=>n+(a?.length||0),0)+" / 100";
 if(list)list.innerHTML=Array.from({length:25},(_,i)=>{const a=vikingData.teams?.[i+1]||[];return '<div class="viking-team"><h3>Team '+(i+1)+' ('+a.length+'/4)</h3>'+Array.from({length:4},(_,j)=>'<div class="viking-member">'+esc(a[j]||"—")+'</div>').join("")+'</div>';}).join("");
 translateStatic();
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
  let cloud=await readCloud("glory");
  if(!cloud){const legacy=await getDoc(legacyDoc("glory"));cloud=legacy.exists()?legacy.data():null;}
  gloryRecords=Array.isArray(cloud?.records)?cloud.records:clone(defaultGloryRecords);
  renderRecords();setMsg("glory-msg",message("load"));
 }catch(e){console.error(e);gloryRecords=clone(defaultGloryRecords);renderRecords();setMsg("glory-msg",message("fallback"));}
}
function renderRecords(){
 const root=$("#glory-records");if(!root)return;
 root.innerHTML=gloryRecords.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map((r,i)=>'<article class="glory-record"><header><strong>'+esc(r.date)+'</strong><span>상대 왕국 '+esc(r.opponent)+'</span></header><div class="glory-results"><span>준비기간: '+(r.prep==="승"?"🏆 승리":"⚔️ 패배")+'</span><span>전쟁기간: '+(r.castle==="승"?"🏆 승리":"⚔️ 패배")+'</span></div>'+(r.memo?'<p>'+esc(r.memo)+'</p>':"")+(adminModes.glory?'<button type="button" onclick="deleteRecord('+i+')">삭제</button>':"")+'</article>').join("")||'<p class="muted">기록이 없습니다.</p>';
 translateStatic();
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
 updateNewCastleJoinFields,filterNewCastleNicknames,chooseNewCastleNickname,submitNewCastleParticipation,cancelNewCastleParticipation,
 loadNewCastleFeatures,toggleNewCastleAdmin,deleteAllNewCastleParticipants,saveNewCastleFeatures,
 loadCastleLayout1,toggleCastleLayout1Admin,saveCastleLayout1,runCastleLayout1Auto:()=>{if(!adminModes.castlelayout1){alert(message("admin"));return;}const active=participants.filter(p=>p.status==="yes"&&participantRank(p)&&!FIXED_LEADERS.includes(p.nickname)).sort((a,b)=>participantRank(a).localeCompare(participantRank(b))||a.nickname.localeCompare(b.nickname));for(let i=6;i<28;i++)castleLayoutData.slots[i]=active[i-6]?.nickname||"";renderCastleLayout();},
 toggleVikingCustomNick,joinVikingTeam,leaveVikingTeam,loadViking,openEditor,closeEditor,saveRecord,loadRecords,deleteRecord
});

function boot(){
 const savedLang=(()=>{try{return localStorage.getItem("kor1816_rebuild_lang_v1")||localStorage.getItem("kor1816_lang")||"ko";}catch{return "ko";}})();
 currentLang=LANGS.includes(savedLang)?savedLang:"ko";
 setupTemplates();makeNav();
 $("#language-select").addEventListener("change",e=>applyLanguage(e.target.value));
 window.addEventListener("hashchange",restoreRoute);window.addEventListener("popstate",restoreRoute);
 ensureReadSession().catch(e=>console.warn("Read session unavailable",e)).finally(()=>restoreRoute());
}
boot();
