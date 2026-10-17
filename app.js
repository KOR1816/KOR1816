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
const PAGE_ICONS = {
  home:"🏠", notices:"📢", teams:"⚔️", alliance:"🗡️", battleJoin:"⚔️",
  castlewar1:"🔱🛡️", castlelayout1:"🏰", seating:"🪑", viking:"🪓", glory:"🏆"
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
  allianceTeam1:"1군: UTC 14:00 (한국시간 23:00) — 전투력순",
  allianceTeam2:"2군: UTC 12:00 (한국시간 21:00) — 선착순 투표",
  goldenGlaives:"❗️ 일요일 정보를 아껴두세요 ❗️\n\nUTC00:00 (한국 09:00) — 🚫 탐색(Pan) / ✅ 진행(Do) / ✅ 수령(Collect)\nUTC08:00 (한국 17:00) — 🚫 탐색(Pan) / ✅ 진행(Do) / 🚫 수령(Collect)\nUTC16:00 (한국 01:00) — ✅ 탐색(Pan) / 🚫 진행(Do) / 🚫 수령(Collect)\nUTC00:00 (한국 09:00) — ✅ 탐색(Pan) / ✅ 진행(Do) / ✅ 수령(Collect)\n\n💡 작동 방식\n✅ PAN = 정보 스킬 사용 (화면 이동/탐색)\nDO = 정보 미션 완료 DO\nCOLLECT = 보상 수령 COLLECT\n\n정보 이벤트\nUTC16:00 (한국 01:00) — ✅ 탐색(Pan) / 🚫 진행(Do) / 🚫 수령(Collect)\n(PAN 유지 15시간)"
};
const NOTICE_TRANSLATIONS = {
  en:{
    bearLeaders:"Rally leaders: Alka · Pera · Rosa",bearMembers:"Rally members: Amadeus · Chenko · Yeonwoo · Margo · Amane\nNo heroes",bearRatio:"Troop ratio: 10 · 10 · 80\nOr\nTroop ratio: 1 · 10 · 89",bearTroops:"Troops: 100,000",
    swordTeam1:"Team 1: UTC 14:00 (23:00 KST) — power ranking",swordTeam2:"Team 2: UTC 12:00 (21:00 KST) — first-come voting",allianceTeam1:"Team 1: UTC 14:00 (23:00 KST) — power ranking",allianceTeam2:"Team 2: UTC 12:00 (21:00 KST) — first-come voting",
    goldenGlaives:"Save your Sunday Intel\n\nUTC 00:00 (09:00 KST) — No Pan / Do / Collect\nUTC 08:00 (17:00 KST) — No Pan / Do / No Collect\nUTC 16:00 (01:00 KST) — Pan / No Do / No Collect\n\nHow it works\nPAN = Use the Intel Pan skill\nDO = Complete Intel missions\nCOLLECT = Claim rewards\n\nIntel event\nUTC 16:00 (01:00 KST) — Pan / No Do / No Collect\n(Pan remains active for 15 hours)"
  },
  ja:{
    bearLeaders:"集結主：アルカ · ペラ · ロサ",bearMembers:"集結メンバー：アマデウス · チェンコ · ヨヌ · マーゴ · アマネ\n英雄なし",bearRatio:"兵士比率：10 · 10 · 80\nまたは\n兵士比率：1 · 10 · 89",bearTroops:"兵士数：100,000",
    swordTeam1:"第1チーム：UTC 14:00（韓国時間23:00）— 戦力順",swordTeam2:"第2チーム：UTC 12:00（韓国時間21:00）— 先着投票",allianceTeam1:"第1チーム：UTC 14:00（韓国時間23:00）— 戦力順",allianceTeam2:"第2チーム：UTC 12:00（韓国時間21:00）— 先着投票",
    goldenGlaives:"日曜日の情報を温存してください\n\nUTC 00:00（韓国09:00）— 探索禁止 / 実行 / 受取\nUTC 08:00（韓国17:00）— 探索禁止 / 実行 / 受取禁止\nUTC 16:00（韓国01:00）— 探索 / 実行禁止 / 受取禁止\n\n操作方法\nPAN = 情報スキルで探索\nDO = 情報ミッション完了\nCOLLECT = 報酬受取\n\n情報イベント\nUTC 16:00（韓国01:00）— 探索 / 実行禁止 / 受取禁止\n（PANは15時間有効）"
  },
  zh:{
    bearLeaders:"集结队长：阿尔卡 · 佩拉 · 罗莎",bearMembers:"集结成员：阿玛迪斯 · 陈科 · 延宇 · 玛戈 · 天音\n不带英雄",bearRatio:"兵力比例：10 · 10 · 80\n或者\n兵力比例：1 · 10 · 89",bearTroops:"兵力：100,000",
    swordTeam1:"一队：UTC 14:00（韩国时间23:00）— 按战力排序",swordTeam2:"二队：UTC 12:00（韩国时间21:00）— 先到先投票",allianceTeam1:"一队：UTC 14:00（韩国时间23:00）— 按战力排序",allianceTeam2:"二队：UTC 12:00（韩国时间21:00）— 先到先投票",
    goldenGlaives:"请保留周日情报\n\nUTC 00:00（韩国09:00）— 禁止探索 / 执行 / 领取\nUTC 08:00（韩国17:00）— 禁止探索 / 执行 / 禁止领取\nUTC 16:00（韩国01:00）— 探索 / 禁止执行 / 禁止领取\n\n操作说明\nPAN = 使用情报技能探索\nDO = 完成情报任务\nCOLLECT = 领取奖励\n\n情报活动\nUTC 16:00（韩国01:00）— 探索 / 禁止执行 / 禁止领取\n（PAN持续15小时）"
  },
  de:{
    bearLeaders:"Rally-Anführer: Alka · Pera · Rosa",bearMembers:"Rally-Mitglieder: Amadeus · Chenko · Yeonwoo · Margo · Amane\nKeine Helden",bearRatio:"Truppenverhältnis: 10 · 10 · 80\nOder\nTruppenverhältnis: 1 · 10 · 89",bearTroops:"Truppen: 100.000",
    swordTeam1:"Team 1: UTC 14:00 (23:00 KST) — nach Kampfkraft",swordTeam2:"Team 2: UTC 12:00 (21:00 KST) — Abstimmung nach Eingang",allianceTeam1:"Team 1: UTC 14:00 (23:00 KST) — nach Kampfkraft",allianceTeam2:"Team 2: UTC 12:00 (21:00 KST) — Abstimmung nach Eingang",
    goldenGlaives:"Spart eure Sonntags-Intel auf\n\nUTC 00:00 (09:00 KST) — Kein Pan / Do / Sammeln\nUTC 08:00 (17:00 KST) — Kein Pan / Do / Kein Sammeln\nUTC 16:00 (01:00 KST) — Pan / Kein Do / Kein Sammeln\n\nSo funktioniert es\nPAN = Intel-Fähigkeit verwenden\nDO = Intel-Aufgaben abschließen\nCOLLECT = Belohnungen abholen\n\nIntel-Event\nUTC 16:00 (01:00 KST) — Pan / Kein Do / Kein Sammeln\n(Pan bleibt 15 Stunden aktiv)"
  },
  it:{
    bearLeaders:"Leader rally: Alka · Pera · Rosa",bearMembers:"Membri rally: Amadeus · Chenko · Yeonwoo · Margo · Amane\nSenza eroi",bearRatio:"Rapporto truppe: 10 · 10 · 80\nOppure\nRapporto truppe: 1 · 10 · 89",bearTroops:"Truppe: 100.000",
    swordTeam1:"Squadra 1: UTC 14:00 (23:00 KST) — ordine per potenza",swordTeam2:"Squadra 2: UTC 12:00 (21:00 KST) — voto in ordine di arrivo",allianceTeam1:"Squadra 1: UTC 14:00 (23:00 KST) — ordine per potenza",allianceTeam2:"Squadra 2: UTC 12:00 (21:00 KST) — voto in ordine di arrivo",
    goldenGlaives:"Conservate le Intel di domenica\n\nUTC 00:00 (09:00 KST) — No Pan / Do / Raccogli\nUTC 08:00 (17:00 KST) — No Pan / Do / No raccolta\nUTC 16:00 (01:00 KST) — Pan / No Do / No raccolta\n\nCome funziona\nPAN = Usa l'abilità Intel Pan\nDO = Completa le missioni Intel\nCOLLECT = Ritira le ricompense\n\nEvento Intel\nUTC 16:00 (01:00 KST) — Pan / No Do / No raccolta\n(Pan resta attivo per 15 ore)"
  },
  es:{
    bearLeaders:"Líderes de rally: Alka · Pera · Rosa",bearMembers:"Miembros del rally: Amadeus · Chenko · Yeonwoo · Margo · Amane\nSin héroes",bearRatio:"Proporción de tropas: 10 · 10 · 80\nO\nProporción de tropas: 1 · 10 · 89",bearTroops:"Tropas: 100.000",
    swordTeam1:"Equipo 1: UTC 14:00 (23:00 KST) — por poder",swordTeam2:"Equipo 2: UTC 12:00 (21:00 KST) — votación por orden de llegada",allianceTeam1:"Equipo 1: UTC 14:00 (23:00 KST) — por poder",allianceTeam2:"Equipo 2: UTC 12:00 (21:00 KST) — votación por orden de llegada",
    goldenGlaives:"Guarda la Intel del domingo\n\nUTC 00:00 (09:00 KST) — No Pan / Do / Recoger\nUTC 08:00 (17:00 KST) — No Pan / Do / No recoger\nUTC 16:00 (01:00 KST) — Pan / No Do / No recoger\n\nCómo funciona\nPAN = Usar la habilidad Pan de Intel\nDO = Completar misiones Intel\nCOLLECT = Reclamar recompensas\n\nEvento Intel\nUTC 16:00 (01:00 KST) — Pan / No Do / No recoger\n(Pan permanece activo 15 horas)"
  },
  tr:{
    bearLeaders:"Ralli liderleri: Alka · Pera · Rosa",bearMembers:"Ralli üyeleri: Amadeus · Chenko · Yeonwoo · Margo · Amane\nKahramansız",bearRatio:"Asker oranı: 10 · 10 · 80\nVeya\nAsker oranı: 1 · 10 · 89",bearTroops:"Asker: 100.000",
    swordTeam1:"1. Takım: UTC 14:00 (Kore 23:00) — güç sıralaması",swordTeam2:"2. Takım: UTC 12:00 (Kore 21:00) — ilk gelen oy verir",allianceTeam1:"1. Takım: UTC 14:00 (Kore 23:00) — güç sıralaması",allianceTeam2:"2. Takım: UTC 12:00 (Kore 21:00) — ilk gelen oy verir",
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
let castleWarData = {war:{assault:Array(10).fill(""),rush:Array(10).fill(""),finish:Array(10).fill(""),north:Array(10).fill(""),west:Array(10).fill(""),substitute:{assault:"",rush:"",finish:""}},warLeaders:{assault:"Nemesis",rush:"Pham",finish:"샌디에이고"},updatedAt:0};
let castleLayoutData = {slots:Array(28).fill(""),updatedAt:0};
let vikingData = {teams:Object.fromEntries(Array.from({length:25},(_,i)=>[i+1,[]])),updatedAt:0};
let vikingPhotosByTeam = {};
let vikingPhotoAdmin = false;
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
 Object.assign(values.ko,{
  loginFailed:"Google 로그인에 실패했습니다. 다시 시도해 주세요.",adminDenied:"관리자 권한이 없는 Google 계정입니다.",
  nicknameRequired:"닉네임을 선택하거나 입력하세요.",nicknameTooLong:"닉네임은 80자 이내로 입력하세요.",cancelNickRequired:"삭제할 닉네임을 선택하세요.",
  cancelParticipation:"{nickname}님의 참전 정보를 취소할까요?",deleteAllParticipants:"참전 등록 명단을 모두 삭제할까요?",
  fixedLeaderSlots:"1~6번 고정 집결장은 7~28번에 다시 배치할 수 없습니다.",duplicateLayout:"7~28번에는 중복 닉네임을 넣을 수 없습니다.",
  imageOnly:"이미지 파일만 선택할 수 있습니다.",photoTooLarge:"사진은 12MB 이하로 선택해 주세요.",processingPhoto:"{nickname} 사진을 처리하는 중입니다.",
  selectNicknameCancel:"취소할 닉네임을 선택하세요.",noVikingTeam:"등록된 팀이 없습니다.",gloryRequired:"날짜와 상대 왕국을 입력하세요.",deleteRecord:"이 기록을 삭제할까요?"
 });
 Object.assign(values.en,{
  loginFailed:"Google sign-in failed. Please try again.",adminDenied:"This Google account is not authorized as an administrator.",
  nicknameRequired:"Choose or enter a nickname.",nicknameTooLong:"Nicknames must be 80 characters or fewer.",cancelNickRequired:"Choose a nickname to remove.",
  cancelParticipation:"Cancel participation for {nickname}?",deleteAllParticipants:"Delete all registered participants?",
  fixedLeaderSlots:"Slots 1–6 are fixed rally leaders and cannot be assigned again to slots 7–28.",duplicateLayout:"Duplicate nicknames are not allowed in slots 7–28.",
  imageOnly:"Please select an image file.",photoTooLarge:"Choose a photo no larger than 12 MB.",processingPhoto:"Processing the photo for {nickname}.",
  selectNicknameCancel:"Choose a nickname to cancel.",noVikingTeam:"No team registration was found.",gloryRequired:"Enter the date and opposing kingdom.",deleteRecord:"Delete this record?"
 });
 Object.assign(values.ja,{
  loginFailed:"Googleログインに失敗しました。もう一度お試しください。",adminDenied:"このGoogleアカウントには管理者権限がありません。",
  nicknameRequired:"ニックネームを選択または入力してください。",nicknameTooLong:"ニックネームは80文字以内で入力してください。",cancelNickRequired:"削除するニックネームを選択してください。",
  cancelParticipation:"{nickname}さんの参加登録を取り消しますか？",deleteAllParticipants:"登録済みの参加者をすべて削除しますか？",
  fixedLeaderSlots:"1～6番は固定の集結長です。7～28番には配置できません。",duplicateLayout:"7～28番に同じニックネームは配置できません。",
  imageOnly:"画像ファイルを選択してください。",photoTooLarge:"12MB以下の写真を選択してください。",processingPhoto:"{nickname}の写真を処理しています。",
  selectNicknameCancel:"取り消すニックネームを選択してください。",noVikingTeam:"登録されたチームがありません。",gloryRequired:"日付と相手王国を入力してください。",deleteRecord:"この記録を削除しますか？"
 });
 Object.assign(values.zh,{
  loginFailed:"Google 登录失败，请重试。",adminDenied:"此 Google 账号没有管理员权限。",
  nicknameRequired:"请选择或输入昵称。",nicknameTooLong:"昵称不得超过80个字符。",cancelNickRequired:"请选择要删除的昵称。",
  cancelParticipation:"要取消 {nickname} 的参战登记吗？",deleteAllParticipants:"要删除所有已登记的参战人员吗？",
  fixedLeaderSlots:"1–6号是固定集结队长，不能再次放入7–28号位。",duplicateLayout:"7–28号位不能使用重复昵称。",
  imageOnly:"请选择图片文件。",photoTooLarge:"请选择不超过12MB的照片。",processingPhoto:"正在处理 {nickname} 的照片。",
  selectNicknameCancel:"请选择要取消的昵称。",noVikingTeam:"没有找到已登记的队伍。",gloryRequired:"请输入日期和对手王国。",deleteRecord:"要删除这条记录吗？"
 });
 Object.assign(values.de,{
  loginFailed:"Google-Anmeldung fehlgeschlagen. Bitte erneut versuchen.",adminDenied:"Dieses Google-Konto hat keine Administratorrechte.",
  nicknameRequired:"Bitte einen Spitznamen auswählen oder eingeben.",nicknameTooLong:"Spitznamen dürfen höchstens 80 Zeichen lang sein.",cancelNickRequired:"Bitte den zu löschenden Spitznamen auswählen.",
  cancelParticipation:"Teilnahme von {nickname} stornieren?",deleteAllParticipants:"Alle registrierten Teilnehmer löschen?",
  fixedLeaderSlots:"Plätze 1–6 sind feste Sammelführer und dürfen nicht erneut auf Plätze 7–28 gesetzt werden.",duplicateLayout:"Auf den Plätzen 7–28 sind doppelte Spitznamen nicht erlaubt.",
  imageOnly:"Bitte eine Bilddatei auswählen.",photoTooLarge:"Bitte ein Foto mit höchstens 12 MB auswählen.",processingPhoto:"Foto von {nickname} wird verarbeitet.",
  selectNicknameCancel:"Bitte einen Spitznamen zum Abbrechen auswählen.",noVikingTeam:"Keine Teamregistrierung gefunden.",gloryRequired:"Datum und gegnerisches Königreich eingeben.",deleteRecord:"Diesen Eintrag löschen?"
 });
 Object.assign(values.it,{
  loginFailed:"Accesso Google non riuscito. Riprova.",adminDenied:"Questo account Google non dispone dei permessi di amministratore.",
  nicknameRequired:"Seleziona o inserisci un nickname.",nicknameTooLong:"Il nickname non può superare 80 caratteri.",cancelNickRequired:"Seleziona il nickname da rimuovere.",
  cancelParticipation:"Annullare la partecipazione di {nickname}?",deleteAllParticipants:"Eliminare tutti i partecipanti registrati?",
  fixedLeaderSlots:"Gli slot 1–6 sono capi raduno fissi e non possono essere assegnati di nuovo agli slot 7–28.",duplicateLayout:"Gli slot 7–28 non possono contenere nickname duplicati.",
  imageOnly:"Seleziona un file immagine.",photoTooLarge:"Seleziona una foto non superiore a 12 MB.",processingPhoto:"Elaborazione della foto di {nickname}.",
  selectNicknameCancel:"Seleziona un nickname da annullare.",noVikingTeam:"Nessuna squadra registrata.",gloryRequired:"Inserisci la data e il regno avversario.",deleteRecord:"Eliminare questo record?"
 });
 Object.assign(values.es,{
  loginFailed:"No se pudo iniciar sesión con Google. Inténtalo de nuevo.",adminDenied:"Esta cuenta de Google no tiene permisos de administrador.",
  nicknameRequired:"Elige o introduce un apodo.",nicknameTooLong:"El apodo no puede superar los 80 caracteres.",cancelNickRequired:"Elige el apodo que deseas eliminar.",
  cancelParticipation:"¿Cancelar la participación de {nickname}?",deleteAllParticipants:"¿Eliminar todos los participantes registrados?",
  fixedLeaderSlots:"Las posiciones 1–6 son líderes fijos y no pueden asignarse de nuevo a las posiciones 7–28.",duplicateLayout:"No se permiten apodos duplicados en las posiciones 7–28.",
  imageOnly:"Selecciona un archivo de imagen.",photoTooLarge:"Selecciona una foto de hasta 12 MB.",processingPhoto:"Procesando la foto de {nickname}.",
  selectNicknameCancel:"Elige un apodo para cancelar.",noVikingTeam:"No hay ningún equipo registrado.",gloryRequired:"Introduce la fecha y el reino rival.",deleteRecord:"¿Eliminar este registro?"
 });
 Object.assign(values.tr,{
  loginFailed:"Google girişi başarısız. Lütfen tekrar deneyin.",adminDenied:"Bu Google hesabının yönetici yetkisi yok.",
  nicknameRequired:"Bir takma ad seçin veya girin.",nicknameTooLong:"Takma ad en fazla 80 karakter olabilir.",cancelNickRequired:"Silmek için bir takma ad seçin.",
  cancelParticipation:"{nickname} katılımı iptal edilsin mi?",deleteAllParticipants:"Kayıtlı tüm katılımcılar silinsin mi?",
  fixedLeaderSlots:"1–6 numaralı yerler sabit toplanma liderleridir; 7–28 arasına tekrar atanamaz.",duplicateLayout:"7–28 numaralı yerlerde aynı takma ad birden fazla kullanılamaz.",
  imageOnly:"Lütfen bir resim dosyası seçin.",photoTooLarge:"12 MB veya daha küçük bir fotoğraf seçin.",processingPhoto:"{nickname} fotoğrafı işleniyor.",
  selectNicknameCancel:"İptal etmek için bir takma ad seçin.",noVikingTeam:"Kayıtlı takım bulunamadı.",gloryRequired:"Tarih ve rakip krallığı girin.",deleteRecord:"Bu kayıt silinsin mi?"
 });
 Object.assign(values.ko,{vikingSelect:"닉네임과 팀을 선택하세요.",vikingAlreadyInTeam:"이미 다른 팀에 등록되어 있습니다.",vikingTeamFull:"선택한 팀이 가득 찼습니다."});
 Object.assign(values.en,{vikingSelect:"Choose a nickname and a team.",vikingAlreadyInTeam:"This nickname is already registered with another team.",vikingTeamFull:"The selected team is full."});
 Object.assign(values.ja,{vikingSelect:"ニックネームとチームを選択してください。",vikingAlreadyInTeam:"このニックネームはすでに別のチームに登録されています。",vikingTeamFull:"選択したチームは満員です。"});
 Object.assign(values.zh,{vikingSelect:"请选择昵称和队伍。",vikingAlreadyInTeam:"此昵称已登记在其他队伍中。",vikingTeamFull:"所选队伍已满。"});
 Object.assign(values.de,{vikingSelect:"Wähle einen Spitznamen und ein Team.",vikingAlreadyInTeam:"Dieser Spitzname ist bereits in einem anderen Team registriert.",vikingTeamFull:"Das ausgewählte Team ist voll."});
 Object.assign(values.it,{vikingSelect:"Seleziona un nickname e una squadra.",vikingAlreadyInTeam:"Questo nickname è già registrato in un'altra squadra.",vikingTeamFull:"La squadra selezionata è al completo."});
 Object.assign(values.es,{vikingSelect:"Elige un apodo y un equipo.",vikingAlreadyInTeam:"Este apodo ya está registrado en otro equipo.",vikingTeamFull:"El equipo seleccionado está lleno."});
 Object.assign(values.tr,{vikingSelect:"Bir takma ad ve takım seçin.",vikingAlreadyInTeam:"Bu takma ad zaten başka bir takıma kayıtlı.",vikingTeamFull:"Seçilen takım dolu."});
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
  catch(e){if(e?.code!=="auth/popup-closed-by-user"&&e?.code!=="auth/cancelled-popup-request")alert(message("loginFailed"));return false;}
 }
 if(!user?.email||!ADMIN_EMAILS.includes(user.email.toLowerCase())){
  alert(message("adminDenied"));
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
 if(adminModes.home)captureHomeEditor();
 if(noticeAdmin)captureNoticeEditor();
 currentLang=LANGS.includes(lang)?lang:"ko";
 document.documentElement.lang=currentLang;
 $("#language-select").value=currentLang;
 $("#language-label").textContent=({ko:"언어",en:"Language",ja:"言語",zh:"语言",de:"Sprache",it:"Lingua",es:"Idioma",tr:"Dil"})[currentLang];
 $$("#main-nav button").forEach((b,i)=>{const id=PAGE_IDS[i];b.textContent=PAGE_ICONS[id]+" "+PAGE_LABELS[id][langIndex()];b.setAttribute("aria-label",PAGE_LABELS[id][langIndex()]);});
 try{localStorage.setItem("kor1816_rebuild_lang_v1",currentLang);localStorage.setItem("kor1816_lang",currentLang);}catch{}
 renderNotices();
 translateCommonControls();
 translateStatic();
 refreshGenericLoadMessages();
 if(activePage==="home")renderHome();
 if(activePage==="seating")refreshTranslatedBanner("seating","seatingLatestMsg");
 if(activePage==="castlewar1")refreshTranslatedBanner("castlewar1","ncWarMsg");
 if(activePage==="castlelayout1")refreshTranslatedBanner("castlelayout1","castleLayout1Msg");
 if(activePage==="battleJoin")refreshTranslatedBanner("battleJoin","ncJoinMsg");
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
Object.assign(STATIC_TRANSLATIONS,{"🔱 캐슬전":["🔱 캐슬전","🔱 Castle War","🔱 城戦","🔱 城堡战","🔱 Burgkrieg","🔱 Guerra del Castello","🔱 Guerra del Castillo","🔱 Kale Savaşı"],"🏰 캐슬배치":["🏰 캐슬배치","🏰 Castle Layout","🏰 城堡配置","🏰 城堡布阵","🏰 Burgaufstellung","🏰 Disposizione del Castello","🏰 Distribución del Castillo","🏰 Kale Dizilimi"],"⚔️ 전투 공지":["📢 공지","📢 Notice","📢 お知らせ","📢 公告","📢 Mitteilung","📢 Avviso","📢 Aviso","📢 Duyuru"],"돌격조":["돌격조","Assault Squad","突撃隊","突击组","Sturmtrupp","Squadra d'assalto","Escuadrón de asalto","Hücum Ekibi"],"개돌조":["개돌조","Rush Squad","突撃部隊","冲锋组","Angriffstrupp","Squadra rapida","Escuadrón de avance","Hızlı Hücum Ekibi"],"마무리조":["마무리조","Finishing Squad","仕上げ隊","收尾组","Abschlusstrupp","Squadra finale","Escuadrón final","Bitirici Ekip"],"북측포탑":["북측포탑","North Turret","北側砲塔","北侧炮塔","Nordturm","Torretta nord","Torreta norte","Kuzey Kulesi"],"서측포탑":["서측포탑","West Turret","西側砲塔","西侧炮塔","Westturm","Torretta ovest","Torreta oeste","Batı Kulesi"],"집결장":["집결장","Rally Leader","集結主","集结队长","Rally-Anführer","Leader rally","Líder de rally","Ralli Lideri"],"집결원 공격":["집결원 공격","Rally Member Attack","集結メンバー攻撃","集结成员攻击","Angriff der Rally-Mitglieder","Attacco membri rally","Ataque de miembros","Ralli Üyesi Saldırısı"],"집결원 수비":["집결원 수비","Rally Member Defense","集結メンバー防衛","集结成员防守","Verteidigung der Rally-Mitglieder","Difesa membri rally","Defensa de miembros","Ralli Üyesi Savunması"],"⚔️ 전투참전":["⚔️ 전투참전","⚔️ Castle Participation","⚔️ 城战报名","⚔️ 城堡参战","⚔️ Burgteilnahme","⚔️ Partecipazione al Castello","⚔️ Participación en el Castillo","⚔️ Kale Katılımı"],"참전 정보를 등록하세요. 닉네임은 고정 명단에서 선택합니다.":["참전 정보를 등록하세요. 닉네임은 고정 명단에서 선택합니다.","Register your participation. Select a nickname from the list.","参加情報を登録してください。リストから名前を選択します。","请登记参战信息，并从名单中选择昵称。","Registriere deine Teilnahme und wähle einen Namen aus der Liste.","Registra la partecipazione e scegli un nome dall'elenco.","Registra tu participación y elige un nombre de la lista.","Katılımını kaydet ve listeden bir takma ad seç."],"캐슬전 참가 상태":["캐슬전 참가 상태","Castle War status","城戦参加状況","城堡战参战状态","Burgkriegsstatus","Stato Guerra del Castello","Estado de Guerra del Castillo","Kale Savaşı durumu"],"병영 등급":["병영 등급","Barracks tier","兵舎ランク","兵营等级","Kaserne-Stufe","Livello caserma","Nivel de cuartel","Kışla seviyesi"],"등록된 참전 정보":["등록된 참전 정보","Registered participants","登録済み参加者","已登记参战信息","Registrierte Teilnehmer","Partecipanti registrati","Participantes registrados","Kayıtlı katılımcılar"],"대기 명단":["대기 명단","Waiting list","待機リスト","等待名单","Warteliste","Lista d'attesa","Lista de espera","Bekleme listesi"]});
Object.assign(STATIC_TRANSLATIONS,{"곰사냥":["곰사냥","Bear Hunt","ベアハント","熊猎","Bärenjagd","Caccia all'orso","Caza del oso","Ayı Avı"],"성검쟁탈":["성검쟁탈","Holy Sword Clash","聖剣争奪","圣剑争夺","Heiliges Schwert","Duello della Spada Sacra","Duelo de la Espada Sagrada","Kutsal Kılıç"],"3대연맹전":["3대연맹전","Three Alliances War","三大連盟戦","三大联盟战","Krieg der drei Allianzen","Guerra delle Tre Alleanze","Guerra de las Tres Alianzas","Üç İttifak Savaşı"],"골든 글레이브 월요일":["골든 글레이브 월요일","Golden Glaives Monday","ゴールデン・グレイブ（月曜）","黄金长戟（周一）","Goldene Glefen am Montag","Lame Dorate del lunedì","Guja Dorada del lunes","Pazartesi Altın Mızraklar"],"번호":["번호","No.","番号","编号","Nr.","N.","N.º","No."],"닉네임":["닉네임","Nickname","ニックネーム","昵称","Spitzname","Nickname","Apodo","Takma ad"],"가능":["가능","Available","参加可能","可以参战","Verfügbar","Disponibile","Disponible","Katılabilir"],"불가능":["불가능","Unavailable","参加不可","无法参战","Nicht verfügbar","Non disponibile","No disponible","Katılamaz"],"나중에 참전 / 참전 중 휴식":["나중에 참전 / 참전 중 휴식","Later / Resting during war","後で参加 / 休憩中","稍后参战 / 战斗中休息","Später / Pause während des Kriegs","Più tardi / pausa durante la guerra","Más tarde / descanso durante la guerra","Daha sonra / savaşta dinlenme"],"전투력순":["전투력순","Power ranking","戦力順","按战力排序","Nach Kampfkraft","Ordine per potenza","Por poder","Güç sıralaması"],"선착순 투표":["선착순 투표","First-come voting","先着順投票","先到先投票","Abstimmung nach Eingang","Voto in ordine di arrivo","Votación por orden de llegada","İlk gelen oy verir"],"승리":["승리","Victory","勝利","胜利","Sieg","Vittoria","Victoria","Zafer"],"패배":["패배","Defeat","敗北","失败","Niederlage","Sconfitta","Derrota","Yenilgi"],"등록/수정":["등록/수정","Register / Edit","登録 / 編集","登记 / 修改","Registrieren / Bearbeiten","Registra / Modifica","Registrar / Editar","Kaydet / Düzenle"],"참전 정보 등록 / 수정":["참전 정보 등록 / 수정","Register / Edit Participation","参加情報を登録 / 編集","登记 / 修改参战信息","Teilnahme registrieren / bearbeiten","Registra / modifica partecipazione","Registrar / editar participación","Katılımı kaydet / düzenle"],"자동 배치":["자동 배치","Auto-assign","自動配置","自动布阵","Automatisch zuweisen","Assegnazione automatica","Asignación automática","Otomatik yerleştir"],"수동 수정":["수동 수정","Manual edit","手動編集","手动编辑","Manuell bearbeiten","Modifica manuale","Edición manual","Elle düzenle"]});
Object.assign(STATIC_TRANSLATIONS,{"준비기간:":["준비기간:","Preparation:","準備期間：","准备阶段：","Vorbereitung:","Preparazione:","Preparación:","Hazırlık:"],"전쟁기간:":["전쟁기간:","War period:","戦争期間：","战争阶段：","Kriegsphase:","Periodo di guerra:","Periodo de guerra:","Savaş dönemi:"],"기록이 없습니다.":["기록이 없습니다.","No records yet.","記録はありません。","暂无记录。","Noch keine Einträge.","Nessun record.","Aún no hay registros.","Henüz kayıt yok."],"삭제":["삭제","Delete","削除","删除","Löschen","Elimina","Eliminar","Sil"]});
Object.assign(STATIC_TRANSLATIONS,{"🪑 자리배치":["🪑 자리배치","🪑 Seating","🪑 配置表","🪑 座位安排","🪑 Sitzplan","🪑 Disposizione","🪑 Distribución","🪑 Yerleşim"],"포탑 (예비)":["포탑 (예비)","Reserve Turret","予備砲塔","备用炮塔","Reserveturm","Torretta di riserva","Torreta de reserva","Yedek Kule"],"사진 관리자":["사진 관리자","Photo admin","写真管理","照片管理","Fotoadmin","Gestione foto","Admin de fotos","Foto yöneticisi"]});
Object.assign(STATIC_TRANSLATIONS,{"📢 공지":["📢 공지","📢 Notice","📢 お知らせ","📢 公告","📢 Mitteilung","📢 Avviso","📢 Aviso","📢 Duyuru"],"📅 이벤트 일정":["📅 이벤트 일정","📅 Event Schedule","📅 イベント予定","📅 活动日程","📅 Eventplan","📅 Programma eventi","📅 Calendario de eventos","📅 Etkinlik Takvimi"],"제목":["제목","Title","タイトル","标题","Titel","Titolo","Título","Başlık"],"내용":["내용","Content","内容","内容","Inhalt","Contenuto","Contenido","İçerik"],"💥 개돌조":["💥 개돌조","💥 Charge Squad","💥 突撃隊","💥 冲锋组","💥 Sturmtrupp","💥 Squadra d'assalto","💥 Escuadrón de asalto","💥 Hücum Ekibi"],"1팀":["1팀","Team 1","チーム1","1队","Team 1","Squadra 1","Equipo 1","Takım 1"],"2팀":["2팀","Team 2","チーム2","2队","Team 2","Squadra 2","Equipo 2","Takım 2"],"3팀":["3팀","Team 3","チーム3","3队","Team 3","Squadra 3","Equipo 3","Takım 3"],"4팀":["4팀","Team 4","チーム4","4队","Team 4","Squadra 4","Equipo 4","Takım 4"],"가능":["가능","Available","参加可能","可以参加","Verfügbar","Disponibile","Disponible","Katılabilir"],"불가능":["불가능","Unavailable","参加不可","无法参加","Nicht verfügbar","Non disponibile","No disponible","Katılamaz"],"나중에 참전 / 참전 중 휴식":["나중에 참전 / 참전 중 휴식","Join later / rest during war","後で参加／戦闘中は休憩","稍后参战／战斗期间休息","Später teilnehmen / während des Kriegs pausieren","Parteciperò dopo / riposo durante la guerra","Participar después / descansar durante la guerra","Daha sonra katıl / savaş sırasında dinlen"],"병영 5":["병영 5","Barracks 5","兵舎 5","兵营 5","Kaserne 5","Caserma 5","Cuartel 5","Kışla 5"],"병영 4.5":["병영 4.5","Barracks 4.5","兵舎 4.5","兵营 4.5","Kaserne 4.5","Caserma 4.5","Cuartel 4.5","Kışla 4.5"],"병영 4":["병영 4","Barracks 4","兵舎 4","兵营 4","Kaserne 4","Caserma 4","Cuartel 4","Kışla 4"],"살로 원정 5스킬":["살로 원정 5스킬","Salo expedition skill 5","サロ遠征スキル5","萨洛远征技能5","Salo-Expeditionsfähigkeit 5","Abilità spedizione Salo 5","Habilidad de expedición de Salo 5","Salo sefer yeteneği 5"],"힐데 원정 5스킬":["힐데 원정 5스킬","Hilde expedition skill 5","ヒルデ遠征スキル5","希尔德远征技能5","Hilde-Expeditionsfähigkeit 5","Abilità spedizione Hilde 5","Habilidad de expedición de Hilde 5","Hilde sefer yeteneği 5"],"참전 정보 등록 / 수정":["참전 정보 등록 / 수정","Register / update participation","参加情報を登録／更新","登记／更新参战信息","Teilnahme registrieren / aktualisieren","Registra / aggiorna partecipazione","Registrar / actualizar participación","Katılımı kaydet / güncelle"],"🔱 캐슬전":["🔱 캐슬전","🔱 Castle War","🔱 城战","🔱 城堡战","🔱 Burgkrieg","🔱 Guerra del Castello","🔱 Guerra del Castillo","🔱 Kale Savaşı"],"🏰 캐슬배치":["🏰 캐슬배치","🏰 Castle Layout","🏰 城堡布阵","🏰 城堡布局","🏰 Burgaufstellung","🏰 Disposizione del Castello","🏰 Distribución del Castillo","🏰 Kale Dizilimi"],"🪑 자리배치":["🪑 자리배치","🪑 Seating","🪑 座位安排","🪑 座位安排","🪑 Platzierung","🪑 Disposizione","🪑 Distribución","🪑 Yerleşim"],"닉네임 선택":["닉네임 선택","Choose nickname","ニックネームを選択","选择昵称","Spitznamen wählen","Scegli nickname","Elegir apodo","Takma ad seç"],"직접 입력":["직접 입력","Enter manually","直接入力","手动输入","Manuell eingeben","Inserisci manualmente","Introducir manualmente","Elle gir"],"연맹원 100명 기준 · 25개 팀 · 팀당 최대 4명입니다. 게임 닉네임을 입력하고 참가할 팀을 선택하세요.":["연맹원 100명 기준 · 25개 팀 · 팀당 최대 4명입니다. 게임 닉네임을 입력하고 참가할 팀을 선택하세요.","For 100 alliance members: 25 teams, up to 4 members each. Enter your game nickname and choose a team.","同盟メンバー100人を想定：25チーム、各チーム最大4人。ゲーム内の名前を入力してチームを選択してください。","按100名联盟成员设置：共25队，每队最多4人。输入游戏昵称并选择队伍。","Für 100 Allianzmitglieder: 25 Teams mit höchstens 4 Mitgliedern. Gib deinen Spielnamen ein und wähle ein Team.","Per 100 membri dell'alleanza: 25 squadre, massimo 4 membri ciascuna. Inserisci il nickname e scegli una squadra.","Para 100 miembros de alianza: 25 equipos, hasta 4 miembros por equipo. Introduce tu apodo y elige un equipo.","100 ittifak üyesi için: 25 takım, takım başına en fazla 4 kişi. Oyun takma adını girip takım seç."],"⚔️ 전투 공지":["📢 공지","📢 Notice","📢 お知らせ","📢 公告","📢 Mitteilung","📢 Avviso","📢 Aviso","📢 Duyuru"],"곰사냥":["곰사냥","Bear Hunt","熊狩り","熊猎","Bärenjagd","Caccia all'orso","Caza del oso","Ayı Avı"],"집결장":["집결장","Rally Leader","集結長","集结队长","Sammelführer","Capo raduno","Líder de reunión","Toplanma lideri"],"집결원":["집결원","Rally Members","集結メンバー","集结成员","Sammelteilnehmer","Membri del raduno","Miembros de reunión","Toplanma üyeleri"],"병력 비율":["병력 비율","Troop Ratio","兵士比率","兵力比例","Truppenverhältnis","Rapporto truppe","Proporción de tropas","Birlik oranı"],"병력":["병력","Troops","兵士","兵力","Truppen","Truppe","Tropas","Birlikler"],"골든 글레이브 월요일":["골든 글레이브 월요일","Golden Glaives Monday","ゴールデングレイブ（月曜日）","黄金战戟（周一）","Goldene Glefen (Montag)","Gladi d'Oro (lunedì)","Guja dorada (lunes)","Altın Mızraklar Pazartesi"],"일요일 정보(Intel)":["일요일 정보(Intel)","Sunday Intel","日曜日の情報","周日情报","Sonntagsinformationen","Intel della domenica","Intel del domingo","Pazar istihbaratı"],"공지 내용":["공지 내용","Notice Content","お知らせ内容","公告内容","Mitteilungsinhalt","Contenuto dell'avviso","Contenido del aviso","Duyuru içeriği"],"패배":["패배","Loss","敗北","失败","Niederlage","Sconfitta","Derrota","Mağlubiyet"],"승리":["승리","Win","勝利","胜利","Sieg","Vittoria","Victoria","Galibiyet"],"공개 KvK 전적 참고":["공개 KvK 전적 참고","Public KvK Records","公開KvK戦績","公开KvK战绩","Öffentliche KvK-Ergebnisse","Risultati KvK pubblici","Resultados públicos de KvK","Herkese açık KvK kayıtları"],"1816 왕국 전적":["1816 왕국 전적","Kingdom 1816 Records","王国1816の戦績","1816王国战绩","Ergebnisse Königreich 1816","Risultati Regno 1816","Resultados del Reino 1816","1816 Krallığı kayıtları"],"1775 왕국 전적":["1775 왕국 전적","Kingdom 1775 Records","王国1775の戦績","1775王国战绩","Ergebnisse Königreich 1775","Risultati Regno 1775","Resultados del Reino 1775","1775 Krallığı kayıtları"]});
Object.assign(STATIC_TRANSLATIONS,{
 "집결원 공격":["집결원 공격","Rally Attack Members","集結攻撃メンバー","集结进攻成员","Angriffs-Sammelteilnehmer","Membri raduno attacco","Miembros de reunión de ataque","Toplanma saldırı üyeleri"],
 "집결원 수비":["집결원 수비","Rally Defense Members","集結防衛メンバー","集结防守成员","Verteidigungs-Sammelteilnehmer","Membri raduno difesa","Miembros de reunión de defensa","Toplanma savunma üyeleri"]
});
Object.assign(STATIC_TRANSLATIONS,{
 "돌격조":["돌격조","Assault Squad","突撃隊","突击组","Sturmtrupp","Squadra d'assalto","Escuadrón de asalto","Hücum Ekibi"],
 "개돌조":["개돌조","Charge Squad","突撃部隊","冲锋组","Angriffstrupp","Squadra d'attacco","Escuadrón de carga","Hücum Birliği"],
 "마무리조":["마무리조","Finishing Squad","仕上げ隊","收尾组","Abschlusstrupp","Squadra finale","Escuadrón final","Son Vuruş Ekibi"],
 "북측포탑":["북측포탑","North Turret","北側砲塔","北侧炮塔","Nordturm","Torre nord","Torreta norte","Kuzey Kulesi"],
 "서측포탑":["서측포탑","West Turret","西側砲塔","西侧炮塔","Westturm","Torre ovest","Torreta oeste","Batı Kulesi"],
 "대기 명단":["대기 명단","Waiting List","待機リスト","候补名单","Warteliste","Lista d'attesa","Lista de espera","Bekleme listesi"],
 "등록된 참전 정보":["등록된 참전 정보","Registered Participants","登録済み参加情報","已登记参战信息","Registrierte Teilnehmer","Partecipanti registrati","Participantes registrados","Kayıtlı katılımcılar"],
 "캐슬전 참가 상태":["캐슬전 참가 상태","Castle War Status","城戦参加状況","城战参战状态","Burgkriegsstatus","Stato partecipazione guerra","Estado de participación","Kale savaşı durumu"],
 "닉네임":["닉네임","Nickname","ニックネーム","昵称","Spitzname","Nickname","Apodo","Takma ad"],
 "병영 등급":["병영 등급","Barracks Tier","兵舎ランク","兵营等级","Kaserne-Stufe","Livello caserma","Nivel de cuartel","Kışla seviyesi"]
});
Object.assign(STATIC_TRANSLATIONS,{
 "성검쟁탈 · 3대연맹전":["성검쟁탈 · 3대연맹전","Holy Sword Clash · Three Alliances War","聖剣争奪 · 三大連盟戦","圣剑争夺 · 三大联盟战","Heiliges Schwert · Krieg der drei Allianzen","Duello della Spada Sacra · Guerra delle Tre Alleanze","Duelo de la Espada Sagrada · Guerra de las Tres Alianzas","Kutsal Kılıç · Üç İttifak Savaşı"]
});
function translateStatic(){
 const root=$("#page-root");if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  const parent=node.parentElement;if(!parent)continue;
  if(parent.closest("button,.content,.notice,.msg,.participant-line,.seating-row,.castle-layout1-content,.layout-person,.war-name,.viking-member-name,.viking-member,input,textarea,script,style"))continue;
  if(!ORIGINAL_TEXT.has(node))ORIGINAL_TEXT.set(node,node.nodeValue);
  const original=ORIGINAL_TEXT.get(node),trim=original.trim();
  const translations=STATIC_TRANSLATIONS[trim];
  if(!translations)continue;
  const translated=translations[langIndex()];
  node.nodeValue=original.replace(trim,translated||trim);
 }
}
function refreshGenericLoadMessages(){
 const known=["최신 내용을 불러왔습니다.","Latest content loaded.","最新の内容を読み込みました。","已加载最新内容。","Aktuelle Inhalte geladen.","Contenuti aggiornati caricati.","Contenido actualizado cargado.","En güncel içerik yüklendi."];
 $$(".msg, .status, [role=\"status\"]").forEach(el=>{if(known.includes((el.textContent||"").trim()))el.textContent=message("load");});
}
function refreshTranslatedBanner(pageId,targetId){
 const el=$("#"+targetId),value=el?.textContent||"";
 if(!value||/최신|Latest|latest|最新|已加载|Aktuelle|Ultima|Se ha cargado|En güncel/i.test(value))setMsg(targetId,latestBanner(pageId));
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
const ADMIN_BUTTON_LABELS={
 ko:["🔐 관리자 수정","🔒 수정 종료"],en:["🔐 Admin edit","🔒 Finish editing"],ja:["🔐 管理者編集","🔒 編集終了"],zh:["🔐 管理员编辑","🔒 结束编辑"],de:["🔐 Admin-Bearbeitung","🔒 Bearbeitung beenden"],it:["🔐 Modifica admin","🔒 Termina modifica"],es:["🔐 Edición admin","🔒 Finalizar edición"],tr:["🔐 Yönetici düzenleme","🔒 Düzenlemeyi bitir"]
};
function setAdminButton(button,on){
 if(!button)return;
 button.dataset.adminState=on?"on":"off";
 button.textContent=(ADMIN_BUTTON_LABELS[currentLang]||ADMIN_BUTTON_LABELS.ko)[on?1:0];
}
const EXTRA_BUTTON_TRANSLATIONS={"💾 홈 저장":["💾 홈 저장","💾 Save Home","💾 ホームを保存","💾 保存主页","💾 Startseite speichern","💾 Salva Home","💾 Guardar inicio","💾 Ana sayfayı kaydet"],"💾 전체 저장":["💾 전체 저장","💾 Save All","💾 すべて保存","💾 全部保存","💾 Alles speichern","💾 Salva tutto","💾 Guardar todo","💾 Tümünü kaydet"],"💾 3대연맹전 저장":["💾 3대연맹전 저장","💾 Save Alliances War","💾 三大連盟戦を保存","💾 保存三大联盟战","💾 Krieg der drei Allianzen speichern","💾 Salva Guerra delle Tre Alleanze","💾 Guardar Guerra de las Tres Alianzas","💾 Üç İttifak Savaşı'nı kaydet"],"💾 자리배치 저장":["💾 자리배치 저장","💾 Save Seating","💾 座席配置を保存","💾 保存座位安排","💾 Sitzordnung speichern","💾 Salva disposizione","💾 Guardar distribución","💾 Yerleşimi kaydet"],"🗑️ 전체삭제":["🗑️ 전체삭제","🗑️ Delete All","🗑️ すべて削除","🗑️ 全部删除","🗑️ Alles löschen","🗑️ Elimina tutto","🗑️ Eliminar todo","🗑️ Tümünü sil"],"🔄 대체자":["🔄 대체자","🔄 Substitute","🔄 代替メンバー","🔄 替补","🔄 Ersatz","🔄 Sostituto","🔄 Sustituto","🔄 Yedek"],"참전 정보 등록 / 수정":["참전 정보 등록 / 수정","Register / Update Participation","参加情報を登録／更新","登记／更新参战信息","Teilnahme registrieren / aktualisieren","Registra / aggiorna partecipazione","Registrar / actualizar participación","Katılımı kaydet / güncelle"]};
Object.assign(EXTRA_BUTTON_TRANSLATIONS,{
 "새로고침":["새로고침","Refresh","更新","刷新","Aktualisieren","Aggiorna","Actualizar","Yenile"],
 "💥 개돌조":["💥 개돌조","💥 Charge Squad","💥 突撃隊","💥 冲锋组","💥 Sturmtrupp","💥 Squadra d'assalto","💥 Escuadrón de asalto","💥 Hücum Ekibi"]
});
Object.assign(EXTRA_BUTTON_TRANSLATIONS,{
 "🔐 사진 관리자":["🔐 사진 관리자","🔐 Photo Admin","🔐 写真管理","🔐 照片管理员","🔐 Fotoadmin","🔐 Gestione foto","🔐 Administración de fotos","🔐 Foto yöneticisi"]
});
Object.assign(STATIC_TRANSLATIONS,{
 "A30　B30　C30 + 5명":["A30　B30　C30 + 5명","A30　B30　C30 + 5 members","A30　B30　C30 + 5人","A30　B30　C30 + 5人","A30　B30　C30 + 5 Mitglieder","A30　B30　C30 + 5 membri","A30　B30　C30 + 5 miembros","A30　B30　C30 + 5 üye"],
 "A28　B28　C28 + 5명":["A28　B28　C28 + 5명","A28　B28　C28 + 5 members","A28　B28　C28 + 5人","A28　B28　C28 + 5人","A28　B28　C28 + 5 Mitglieder","A28　B28　C28 + 5 membri","A28　B28　C28 + 5 miembros","A28　B28　C28 + 5 üye"],
 "A31　B31　C31 + 5명":["A31　B31　C31 + 5명","A31　B31　C31 + 5 members","A31　B31　C31 + 5人","A31　B31　C31 + 5人","A31　B31　C31 + 5 Mitglieder","A31　B31　C31 + 5 membri","A31　B31　C31 + 5 miembros","A31　B31　C31 + 5 üye"],
 "A27　B27　C27 + 5명":["A27　B27　C27 + 5명","A27　B27　C27 + 5 members","A27　B27　C27 + 5人","A27　B27　C27 + 5人","A27　B27　C27 + 5 Mitglieder","A27　B27　C27 + 5 membri","A27　B27　C27 + 5 miembros","A27　B27　C27 + 5 üye"],
 "A19　B19　C19 + 5명":["A19　B19　C19 + 5명","A19　B19　C19 + 5 members","A19　B19　C19 + 5人","A19　B19　C19 + 5人","A19　B19　C19 + 5 Mitglieder","A19　B19　C19 + 5 membri","A19　B19　C19 + 5 miembros","A19　B19　C19 + 5 üye"],
 "A18　B18　C18 + 5명":["A18　B18　C18 + 5명","A18　B18　C18 + 5 members","A18　B18　C18 + 5人","A18　B18　C18 + 5人","A18　B18　C18 + 5 Mitglieder","A18　B18　C18 + 5 membri","A18　B18　C18 + 5 miembros","A18　B18　C18 + 5 üye"]
});
function translateCommonControls(){
 const maps={
  "🔄 새로고침":["🔄 새로고침","🔄 Refresh","🔄 更新","🔄 刷新","🔄 Aktualisieren","🔄 Aggiorna","🔄 Actualizar","🔄 Yenile"],
  "🔐 관리자 수정":["🔐 관리자 수정","🔐 Admin edit","🔐 管理者編集","🔐 管理员编辑","🔐 Admin-Bearbeitung","🔐 Modifica admin","🔐 Edición admin","🔐 Yönetici düzenleme"],
  "💾 저장":["💾 저장","💾 Save","💾 保存","💾 保存","💾 Speichern","💾 Salva","💾 Guardar","💾 Kaydet"],
  "💾 기록 저장":["💾 기록 저장","💾 Save record","💾 記録を保存","💾 保存记录","💾 Eintrag speichern","💾 Salva record","💾 Guardar registro","💾 Kaydı kaydet"],
  "➕ 기록 추가":["➕ 기록 추가","➕ Add record","➕ 記録を追加","➕ 添加记录","➕ Eintrag hinzufügen","➕ Aggiungi record","➕ Añadir registro","➕ Kayıt ekle"],
  "취소":["취소","Cancel","キャンセル","取消","Abbrechen","Annulla","Cancelar","İptal"]
 };
 Object.assign(maps,EXTRA_BUTTON_TRANSLATIONS);
 $$("button").forEach(b=>{
  if(b.dataset.adminState){setAdminButton(b,b.dataset.adminState==="on");return;}
  if(b.dataset.photoAdminState){setPhotoAdminButton(b.dataset.photoAdminState==="on");return;}
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
function restoreRoute(){const hash=decodeURIComponent(location.hash.slice(1));const query=new URLSearchParams(location.search).get("page")||"";const id=hash||query;navigate(PAGE_IDS.includes(id)?id:"home",false);}

function setupTemplates(){
 for(const id of PAGE_IDS){const root=$("#"+id);if(!root)continue;root.innerHTML=PAGE_CONTENT[id]||'<div class="card"><h2>'+esc(PAGE_LABELS[id][0])+'</h2></div>';}
 const n=$("#notices");
 if(n){
  $("#notice-refresh",n)?.addEventListener("click",loadNotices);
  $("#notice-admin",n)?.addEventListener("click",toggleNoticeAdmin);
  $("#notice-save",n)?.addEventListener("click",saveNotices);
  $("#notice-edit-language",n)?.addEventListener("change",e=>{captureNoticeEditor();noticeEditLang=LANGS.includes(e.target.value)?e.target.value:"ko";renderNotices();});
 }
 // The source markup is content only; handlers below are shared, page-aware actions.
}
function updateMsgForPage(id,msg){const target={home:"homeMsg",teams:"teamMsg",alliance:"allianceMsg",seating:"seatingLatestMsg",battleJoin:"ncJoinMsg",castlewar1:"ncWarMsg",castlelayout1:"castleLayout1Msg",viking:"vikingMsg"}[id];if(target)say(msg,target);else say(msg);}
function currentInputs(root){const out={};$$("input,textarea,select",root).forEach(el=>{if(!el.id||el.type==="button"||el.type==="submit")return;out[el.id]=el.value;});return out;}
function fillInputs(root,values){for(const [id,value] of Object.entries(values||{})){const el=$("#"+CSS.escape(id),root);if(el&&"value" in el)el.value=value??"";}}
function toggleButtonsForAdmin(root,on,buttonId,saveId){
 const b=buttonId?$("#"+buttonId,root):null,s=saveId?$("#"+saveId,root):null;
 setAdminButton(b,on);
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
const HOME_TRANSLATIONS={
ko:{notice:"공지",lines:["항상 웃으면서","현실이 먼저이며!!","게임은 쉬엄쉬엄 즐기세요!!"],welcome:"소통 · 협력 · 성장 · KVK 조직력을 중심으로 함께합니다.",groups:["성검쟁탈 · 3대연맹전","곰 트랩","기타 일정"],unscheduled:"시간 미정",empty:"일정이 등록되지 않았습니다.",sword:"성검쟁탈",alliance:"3대연맹전",viking:"바이킹",bear1:"곰 1트랩",bear2:"곰 2트랩",squad1:"1군",squad2:"2군"},
en:{notice:"Announcement",lines:["Always keep smiling","Real life comes first!!","Take it easy and enjoy the game!!"],welcome:"Built on communication · cooperation · growth · and strong KVK teamwork.",groups:["Holy Sword Clash · Three Alliances War","Bear Trap","Other Events"],unscheduled:"Time TBA",empty:"No schedule has been posted.",sword:"Holy Sword Clash",alliance:"Three Alliances War",viking:"Viking",bear1:"Bear Trap 1",bear2:"Bear Trap 2",squad1:"Squad 1",squad2:"Squad 2"},
ja:{notice:"お知らせ",lines:["いつも笑顔で","現実を最優先に!!","ゲームは無理せず楽しみましょう!!"],welcome:"コミュニケーション · 協力 · 成長 · KVKでの連携を大切にします。",groups:["聖剣争奪 · 三大連盟戦","ベアトラップ","その他の予定"],unscheduled:"時間未定",empty:"予定はまだ登録されていません。",sword:"聖剣争奪",alliance:"三大連盟戦",viking:"バイキング",bear1:"ベアトラップ1",bear2:"ベアトラップ2",squad1:"第1部隊",squad2:"第2部隊"},
zh:{notice:"公告",lines:["永远保持微笑","现实生活永远优先!!","轻松享受游戏!!"],welcome:"以沟通 · 合作 · 成长 · KVK团队协作为核心。",groups:["圣剑争夺 · 三大联盟战","熊陷阱","其他日程"],unscheduled:"时间待定",empty:"尚未发布日程。",sword:"圣剑争夺",alliance:"三大联盟战",viking:"维京",bear1:"熊陷阱1",bear2:"熊陷阱2",squad1:"第1队",squad2:"第2队"},
de:{notice:"Ankündigung",lines:["Immer mit einem Lächeln","Das echte Leben geht vor!!","Spielt entspannt und habt Spaß!!"],welcome:"Wir setzen auf Kommunikation · Zusammenarbeit · Wachstum und Teamwork im KVK.",groups:["Heiliges Schwert · Krieg der drei Allianzen","Bärenfalle","Weitere Termine"],unscheduled:"Zeit folgt",empty:"Es wurde noch kein Zeitplan veröffentlicht.",sword:"Heiliges Schwert",alliance:"Krieg der drei Allianzen",viking:"Wikinger",bear1:"Bärenfalle 1",bear2:"Bärenfalle 2",squad1:"Trupp 1",squad2:"Trupp 2"},
it:{notice:"Annuncio",lines:["Sorridete sempre","La vita reale viene prima di tutto!!","Godetevi il gioco senza stress!!"],welcome:"Puntiamo su comunicazione · collaborazione · crescita e gioco di squadra nel KVK.",groups:["Duello della Spada Sacra · Guerra delle Tre Alleanze","Trappola per orsi","Altri eventi"],unscheduled:"Orario da definire",empty:"Nessun programma pubblicato.",sword:"Duello della Spada Sacra",alliance:"Guerra delle Tre Alleanze",viking:"Vichinghi",bear1:"Trappola per orsi 1",bear2:"Trappola per orsi 2",squad1:"Squadra 1",squad2:"Squadra 2"},
es:{notice:"Anuncio",lines:["Sonrían siempre","La vida real es lo primero!!","Disfruten del juego con calma!!"],welcome:"Nos centramos en la comunicación · la cooperación · el crecimiento y el trabajo en equipo en KVK.",groups:["Duelo de la Espada Sagrada · Guerra de las Tres Alianzas","Trampa para osos","Otros eventos"],unscheduled:"Horario por confirmar",empty:"Aún no hay ningún horario publicado.",sword:"Duelo de la Espada Sagrada",alliance:"Guerra de las Tres Alianzas",viking:"Vikingos",bear1:"Trampa para osos 1",bear2:"Trampa para osos 2",squad1:"Grupo 1",squad2:"Grupo 2"},
tr:{notice:"Duyuru",lines:["Her zaman gülümseyin","Gerçek hayat her şeyden önce gelir!!","Oyunun tadını sakin sakin çıkarın!!"],welcome:"İletişim · iş birliği · gelişim ve KVK takım ruhunu temel alıyoruz.",groups:["Kutsal Kılıç · Üç İttifak Savaşı","Ayı Tuzağı","Diğer Etkinlikler"],unscheduled:"Saat daha sonra belli olacak",empty:"Henüz bir program yayınlanmadı.",sword:"Kutsal Kılıç",alliance:"Üç İttifak Savaşı",viking:"Viking",bear1:"Ayı Tuzağı 1",bear2:"Ayı Tuzağı 2",squad1:"1. Takım",squad2:"2. Takım"}
};
function homeText(key){return (HOME_TRANSLATIONS[currentLang]||HOME_TRANSLATIONS.ko)[key]||HOME_TRANSLATIONS.ko[key]||key;}
function translateHomeEvent(event){
 const isAlliance=/3대연맹전|Three Alliances War|三大連盟戦|三大联盟战|Krieg der drei Allianzen|Guerra delle Tre Alleanze|Guerra de las Tres Alianzas|Üç İttifak Savaşı/i.test(event);
 const pairs=[
  [/성검쟁탈/g,homeText("sword")],[/3대연맹전/g,homeText("alliance")],[/바이킹/g,homeText("viking")],
  [/곰 1트랩/g,homeText("bear1")],[/곰 2트랩/g,homeText("bear2")]
 ];
 let translated=pairs.reduce((value,pair)=>value.replace(pair[0],pair[1]),event);
 translated=translated.replace(/1군/g,homeText("squad1")).replace(/2군/g,homeText("squad2"));
 return isAlliance?translated.replace(/^⚔️/,"🗡️"):translated;
}

const homeDefaults={
 latestTitle:"공지",
 latestBody:"소통 · 협력 · 성장 · KVK 조직력을 중심으로 함께합니다.",
 schedule:"⚔️ 성검쟁탈 1군 · 23:00 (UTC 14:00)\n⚔️ 성검쟁탈 2군 · 21:00 (UTC 12:00)\n⚔️ 3대연맹전 1군 · 23:00 (UTC 14:00)\n⚔️ 3대연맹전 2군 · 21:00 (UTC 12:00)\n🪓 바이킹 · 23:00 (UTC 14:00)\n🐻 곰 1트랩 · 23:00 (UTC 14:00)\n🐻 곰 2트랩 · 21:00 (UTC 12:00)",
 welcome:"소통 · 협력 · 성장 · KVK 조직력을 중심으로 함께합니다."
};
async function loadHome(){
 const r=await loadData("home",homeDefaults);homeData=r.data;
 renderHome();
 if(r.source==="unavailable")setMsg("homeMsg",message("fallback"));else setMsg("homeMsg",message("load"));
}
function ensureHomeNoticeBody(){
 return homeText("lines").join("\n");
}
function captureHomeEditor(){
 const root=$("#home");if(!root||!adminModes.home)return;
 const edited={latestTitle:$("#homeLatestInput",root)?.value||"",latestBody:ensureHomeNoticeBody($("#homeLatestBody",root)?.value||""),schedule:$("#homeScheduleInput",root)?.value||"",welcome:$("#homeWelcomeInput",root)?.value||""};
 homeData={...homeData,translations:{...(homeData.translations||{}),[currentLang]:edited}};
 if(currentLang==="ko")homeData={...homeData,...edited};
}
function renderHomeSchedule(value){
 const entries=String(value||"").split(/\r?\n/).map((line,index)=>{
  const raw=line.trim();
  if(!raw)return null;
  const match=raw.match(/\s[·—-]\s*(\d{1,2}:\d{2})(?:\s*\(([^)]*)\))?\s*$/);
  const event=match?raw.slice(0,match.index).trim():raw;
  const time=match?match[1]:"";
  const secondary=match?(match[2]||""):"";
  const minutes=time?Number(time.split(":")[0])*60+Number(time.split(":")[1]):Infinity;
  const group=/성검|3대연맹전|연맹전|three alliances/i.test(event)?"성검쟁탈 · 3대연맹전":/곰/.test(event)?"곰 트랩":"기타 일정";
  return {event,time,secondary,minutes,index,group};
 }).filter(Boolean);
 // Keep the 3대연맹전 rows paired with the matching 성검쟁탈 squad/time,
 // including when an older saved schedule only contains 성검쟁탈 rows.
 const swordRows=entries.filter(item=>/성검쟁탈/.test(item.event)&&/[12]군/.test(item.event));
 for(const item of swordRows){
  const squad=(item.event.match(/[12]군/)||[])[0];
  if(!entries.some(row=>/3대연맹전|연맹전|three alliances/i.test(row.event)&&row.event.includes(squad)))
   entries.push({...item,event:item.event.replace(/성검쟁탈/,"3대연맹전"),index:entries.length});
 }
 const groups=["성검쟁탈 · 3대연맹전","곰 트랩","기타 일정"];
 if(!entries.length)return '<p class="home-schedule-empty">'+esc(homeText("empty"))+'</p>';
 return '<div class="home-schedule-list">'+groups.map(group=>{
  const groupIndex=groups.indexOf(group);
  const groupLabel=homeText("groups")[groupIndex]||group;
  const items=entries.filter(item=>item.group===group).sort((a,b)=>a.minutes-b.minutes||a.index-b.index);
  if(!items.length)return "";
  const rows=[];
  items.forEach(item=>{
   const isPaired=/성검쟁탈|3대연맹전|연맹전|three alliances/i.test(item.event)&&/[12]군/.test(item.event);
   const squad=isPaired?(item.event.match(/[12]군/)||[])[0]:"";
   const pairKey=isPaired?item.time+"|"+squad:"";
   let row=pairKey?rows.find(r=>r.pairKey===pairKey):null;
   if(!row){row={...item,pairKey,pairedEvents:[item.event]};rows.push(row);}
   else if(!row.pairedEvents.includes(item.event))row.pairedEvents.push(item.event);
  });
  rows.sort((a,b)=>a.minutes-b.minutes||a.index-b.index);
  return '<section class="home-schedule-group"><h3 class="home-schedule-heading">'+esc(groupLabel)+'</h3>'+rows.map(item=>'<div class="home-schedule-row">'+
   (item.time?'<div class="home-schedule-time"><strong>'+esc(item.time)+'</strong>'+(item.secondary?'<small>'+esc(item.secondary)+'</small>':'')+'</div>':'<div class="home-schedule-time home-schedule-no-time"><span>'+esc(homeText("unscheduled"))+'</span></div>')+
   '<div class="home-schedule-event">'+item.pairedEvents.map(event=>'<div class="home-schedule-event-line">'+esc(translateHomeEvent(event))+'</div>').join("")+'</div></div>').join("")+'</section>';
 }).join("")+'</div>';
}
function renderHome(){
 const d=homeData.translations?.[currentLang]||homeData.translations?.ko||homeData;
 const title=$("#homeLatestTitle"),body=$("#homeLatest"),sch=$("#homeSchedule"),wel=$("#homeWelcome");
 if(title)title.textContent="📢 "+homeText("notice");
 if(body)body.textContent=ensureHomeNoticeBody(d.latestBody||"");
 if(sch)sch.innerHTML=renderHomeSchedule(d.schedule||"");
 if(wel)wel.textContent=homeText("welcome");
 fillInputs($("#home"),{homeLatestInput:d.latestTitle,homeLatestBody:ensureHomeNoticeBody(d.latestBody||""),homeScheduleInput:d.schedule,homeWelcomeInput:d.welcome});
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
 setAdminButton(button,adminModes.home);
}

/* Notices: Korean source and prewritten translations. */
let noticeAdmin=false;
let noticeEditLang="ko";
function noticeValue(key){if(currentLang==="ko")return noticeData[key]||"";return noticeData.translations?.[currentLang]?.[key]||NOTICE_TRANSLATIONS[currentLang]?.[key]||noticeData[key]||"";}
function koreanOnly(value){return String(value??"").trim();}
function normalizeBearNoticeText(source){
 const d={...(source||{})};
 const labelPatterns={
  bearLeaders:/^\\s*(?:집결장|rally\\s*leaders?)\\s*[:：]\\s*/i,
  bearMembers:/^\\s*(?:집결원|rally\\s*members?)\\s*[:：]\\s*/i,
  bearTroops:/^\\s*(?:병력|troops?|兵士数|兵力|Truppen|Truppe|Truppe|Truppe|Truppe|Truppe)\\s*[:：]\\s*/i,
  bearRatio:/^\\s*(?:비율|troop\\s*ratio|兵士比率|兵力比例|Truppenverhältnis|Rapporto truppe|Proporción de tropas|Asker oranı)\\s*[:：]\\s*/i
 };
 const clean=(key,value)=>{
  let text=String(value??"");
  if(key==="bearRatio")text=text.replace(/\\s+(?:또는|or|oder|oppure|o|veya|または|或者)\\s+/gi,"\\n");
  return text.split("\\n").map(line=>line.replace(labelPatterns[key]||/$^/,"").trim())
   .filter(line=>line&&!/^(?:또는|or|oder|oppure|o|veya|または|或者|\/\\s*or)$/i.test(line)).join("\\n");
 };
 for(const key of Object.keys(labelPatterns))if(d[key]!==undefined)d[key]=clean(key,d[key]);
 if(d.translations&&typeof d.translations==="object"){
  d.translations={...d.translations};
  for(const [lang,values] of Object.entries(d.translations)){
   if(!values||typeof values!=="object")continue;
   const next={...values};
   for(const key of Object.keys(labelPatterns))if(next[key]!==undefined)next[key]=clean(key,next[key]);
   d.translations[lang]=next;
  }
 }
 return d;
}
function mergeCombinedEventNotices(){
 const strip=value=>String(value??"").trim()
  .replace(/^(?:성검쟁탈|3대연맹전|Holy Sword Clash|Three Alliances War|聖剣争奪|三大連盟戦|圣剑争夺|三大联盟战|Heiliges Schwert|Krieg der drei Allianzen|Duello della Spada Sacra|Guerra delle Tre Alleanze|Duelo de la Espada Sagrada|Guerra de las Tres Alianzas|Kutsal Kılıç|Üç İttifak Savaşı)\s*:\s*/i,"")
  .replace(/^(?:1군|2군|1st team|2nd team|Team 1|Team 2|第1チーム|第2チーム|一队|二队|Team 1|Team 2|Squadra 1|Squadra 2|Equipo 1|Equipo 2|1\. Takım|2\. Takım)\s*:\s*/i,"");
 for(const group of [1,2]){
  const key="swordTeam"+group,oldKey="allianceTeam"+group;
  const current=String(noticeData[key]||NOTICE_DEFAULTS[key]||"");
  const hasBoth=/(?:성검쟁탈|Holy Sword Clash|聖剣争奪|圣剑争夺|Heiliges Schwert|Duello della Spada Sacra|Duelo de la Espada Sagrada|Kutsal Kılıç)\s*:/i.test(current)&&/(?:3대연맹전|Three Alliances War|三大連盟戦|三大联盟战|Krieg der drei Allianzen|Guerra delle Tre Alleanze|Guerra de las Tres Alianzas|Üç İttifak Savaşı)\s*:/i.test(current);
  noticeData[key]=hasBoth?current.split("\n").map(strip).filter(Boolean).filter((value,index,items)=>items.indexOf(value)===index).join("\n"):[strip(current),strip(noticeData[oldKey]||NOTICE_DEFAULTS[oldKey]||"")].filter(Boolean).filter((value,index,items)=>items.indexOf(value)===index).join("\n");
  noticeData.translations=noticeData.translations||{};
  for(const lang of LANGS.slice(1)){
   const source={...(noticeData.translations[lang]||{})};
   const defaults=NOTICE_TRANSLATIONS[lang]||{};
   const existing=String(source[key]||defaults[key]||NOTICE_DEFAULTS[key]||"");
   const translatedHasBoth=/(?:Holy Sword Clash|聖剣争奪|圣剑争夺|Heiliges Schwert|Duello della Spada Sacra|Duelo de la Espada Sagrada|Kutsal Kılıç)\s*:/i.test(existing)&&/(?:Three Alliances War|三大連盟戦|三大联盟战|Krieg der drei Allianzen|Guerra delle Tre Alleanze|Guerra de las Tres Alianzas|Üç İttifak Savaşı)\s*:/i.test(existing);
   source[key]=translatedHasBoth?existing.split("\n").map(strip).filter(Boolean).filter((value,index,items)=>items.indexOf(value)===index).join("\n"):[strip(existing),strip(source[oldKey]||defaults[oldKey]||NOTICE_DEFAULTS[oldKey]||"")].filter(Boolean).filter((value,index,items)=>items.indexOf(value)===index).join("\n");
   noticeData.translations[lang]=source;
  }
 }
}

function captureNoticeEditor(){
 const root=$("#notices");if(!root||!noticeAdmin)return;
 if(noticeEditLang!=="ko")noticeData.translations[noticeEditLang]={...(noticeData.translations[noticeEditLang]||NOTICE_TRANSLATIONS[noticeEditLang]||{})};
 for(const id of Object.keys(NOTICE_DEFAULTS)){
  const edit=$("#e"+id[0].toUpperCase()+id.slice(1),root);if(!edit)continue;
  if(noticeEditLang==="ko")noticeData[id]=edit.value;
  else noticeData.translations[noticeEditLang][id]=edit.value;
 }
}
function renderNotices(){
 const root=$("#notices");if(!root)return;
 noticeData=normalizeBearNoticeText(noticeData);
 const ids=Object.keys(NOTICE_DEFAULTS);
 for(const id of ids){
  const view=$("#"+id,root),edit=$("#e"+id[0].toUpperCase()+id.slice(1),root);
  if(view)view.textContent=noticeValue(id);
  if(edit){
   edit.value=noticeEditLang==="ko"?(noticeData[id]??NOTICE_DEFAULTS[id]):(noticeData.translations?.[noticeEditLang]?.[id]??NOTICE_TRANSLATIONS[noticeEditLang]?.[id]??noticeData[id]??NOTICE_DEFAULTS[id]);
   edit.disabled=!noticeAdmin;
  }
 }
 const admin=$("#notice-admin",root),save=$("#notice-save",root),languageWrap=$("#notice-edit-language-wrap",root),languageSelect=$("#notice-edit-language",root),help=$("#notice-translation-help",root);
 const editorText={
  ko:["편집 언어","언어를 선택해 각 공지의 번역을 수정한 뒤 저장하세요. 자동 번역은 사용하지 않습니다."],
  en:["Edit language","Choose a language, edit each notice translation, and save. No automatic translation is used."],
  ja:["編集言語","言語を選び、各お知らせの翻訳を編集して保存してください。自動翻訳は使用しません。"],
  zh:["编辑语言","选择语言，编辑各条公告的翻译后保存。不会使用自动翻译。"],
  de:["Bearbeitungssprache","Sprache auswählen, Übersetzungen bearbeiten und speichern. Es wird keine automatische Übersetzung verwendet."],
  it:["Lingua di modifica","Scegli una lingua, modifica le traduzioni degli avvisi e salva. Non viene usata la traduzione automatica."],
  es:["Idioma de edición","Elige un idioma, edita las traducciones de los avisos y guarda. No se usa traducción automática."],
  tr:["Düzenleme dili","Bir dil seçin, duyuru çevirilerini düzenleyin ve kaydedin. Otomatik çeviri kullanılmaz."]
 }[currentLang]||["Edit language","Edit notice translations and save."];
 const editorLabel=$("#notice-edit-language-wrap span",root);
 if(editorLabel)editorLabel.textContent=editorText[0];
 if(help)help.textContent=editorText[1];
 root.classList.toggle("editing",noticeAdmin);
 setAdminButton(admin,noticeAdmin);
 if(save)save.hidden=!noticeAdmin;
 if(languageWrap)languageWrap.hidden=!noticeAdmin;
 if(help)help.hidden=!noticeAdmin;
 if(languageSelect)languageSelect.value=noticeEditLang;
}
const GOLDEN_GLAIVES_CONTENT_BY_LANG={
 ko:NOTICE_DEFAULTS.goldenGlaives,
 en:"❗️ Save your Sunday Intel ❗️\n\nUTC00:00 (Korea 09:00) — 🚫 Pan / ✅ Do / ✅ Collect\nUTC08:00 (Korea 17:00) — 🚫 Pan / ✅ Do / 🚫 Collect\nUTC16:00 (Korea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\nUTC00:00 (Korea 09:00) — ✅ Pan / ✅ Do / ✅ Collect\n\n💡 How it works\n✅ PAN = Use the Intel skill (navigate/explore)\nDO = Complete Intel missions\nCOLLECT = Claim rewards\n\nIntel event\nUTC16:00 (Korea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\n(PAN remains active for 15 hours)",
 ja:"❗️ 日曜日の情報を温存してください ❗️\n\nUTC00:00（韓国09:00）— 🚫 探索(Pan) / ✅ 実行(Do) / ✅ 受取(Collect)\nUTC08:00（韓国17:00）— 🚫 探索(Pan) / ✅ 実行(Do) / 🚫 受取(Collect)\nUTC16:00（韓国01:00）— ✅ 探索(Pan) / 🚫 実行(Do) / 🚫 受取(Collect)\nUTC00:00（韓国09:00）— ✅ 探索(Pan) / ✅ 実行(Do) / ✅ 受取(Collect)\n\n💡 操作方法\n✅ PAN = 情報スキルを使用（移動/探索）\nDO = 情報ミッションを完了\nCOLLECT = 報酬を受け取る\n\n情報イベント\nUTC16:00（韓国01:00）— ✅ 探索(Pan) / 🚫 実行(Do) / 🚫 受取(Collect)\n（PANは15時間維持）",
 zh:"❗️ 请保留周日情报 ❗️\n\nUTC00:00（韩国09:00）— 🚫 探索(Pan) / ✅ 执行(Do) / ✅ 领取(Collect)\nUTC08:00（韩国17:00）— 🚫 探索(Pan) / ✅ 执行(Do) / 🚫 领取(Collect)\nUTC16:00（韩国01:00）— ✅ 探索(Pan) / 🚫 执行(Do) / 🚫 领取(Collect)\nUTC00:00（韩国09:00）— ✅ 探索(Pan) / ✅ 执行(Do) / ✅ 领取(Collect)\n\n💡 操作说明\n✅ PAN = 使用情报技能（移动/探索）\nDO = 完成情报任务\nCOLLECT = 领取奖励\n\n情报活动\nUTC16:00（韩国01:00）— ✅ 探索(Pan) / 🚫 执行(Do) / 🚫 领取(Collect)\n（PAN持续15小时）",
 de:"❗️ Hebt euch die Sonntags-Intel auf ❗️\n\nUTC00:00 (Korea 09:00) — 🚫 Pan / ✅ Do / ✅ Collect\nUTC08:00 (Korea 17:00) — 🚫 Pan / ✅ Do / 🚫 Collect\nUTC16:00 (Korea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\nUTC00:00 (Korea 09:00) — ✅ Pan / ✅ Do / ✅ Collect\n\n💡 So funktioniert es\n✅ PAN = Intel-Fähigkeit verwenden (bewegen/erkunden)\nDO = Intel-Aufgaben abschließen\nCOLLECT = Belohnungen abholen\n\nIntel-Event\nUTC16:00 (Korea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\n(PAN bleibt 15 Stunden aktiv)",
 it:"❗️ Conservate le Intel di domenica ❗️\n\nUTC00:00 (Corea 09:00) — 🚫 Pan / ✅ Do / ✅ Collect\nUTC08:00 (Corea 17:00) — 🚫 Pan / ✅ Do / 🚫 Collect\nUTC16:00 (Corea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\nUTC00:00 (Corea 09:00) — ✅ Pan / ✅ Do / ✅ Collect\n\n💡 Come funziona\n✅ PAN = Usa l'abilità Intel (spostamento/esplorazione)\nDO = Completa le missioni Intel\nCOLLECT = Ritira le ricompense\n\nEvento Intel\nUTC16:00 (Corea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\n(PAN resta attivo per 15 ore)",
 es:"❗️ Guarda la Intel del domingo ❗️\n\nUTC00:00 (Corea 09:00) — 🚫 Pan / ✅ Do / ✅ Collect\nUTC08:00 (Corea 17:00) — 🚫 Pan / ✅ Do / 🚫 Collect\nUTC16:00 (Corea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\nUTC00:00 (Corea 09:00) — ✅ Pan / ✅ Do / ✅ Collect\n\n💡 Cómo funciona\n✅ PAN = Usar la habilidad Intel (moverse/explorar)\nDO = Completar misiones Intel\nCOLLECT = Reclamar recompensas\n\nEvento Intel\nUTC16:00 (Corea 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\n(PAN se mantiene activo durante 15 horas)",
 tr:"❗️ Pazar gününün istihbaratını saklayın ❗️\n\nUTC00:00 (Kore 09:00) — 🚫 Pan / ✅ Do / ✅ Collect\nUTC08:00 (Kore 17:00) — 🚫 Pan / ✅ Do / 🚫 Collect\nUTC16:00 (Kore 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\nUTC00:00 (Kore 09:00) — ✅ Pan / ✅ Do / ✅ Collect\n\n💡 Nasıl çalışır\n✅ PAN = İstihbarat becerisini kullan (hareket/keşif)\nDO = İstihbarat görevlerini tamamla\nCOLLECT = Ödülleri al\n\nİstihbarat etkinliği\nUTC16:00 (Kore 01:00) — ✅ Pan / 🚫 Do / 🚫 Collect\n(PAN 15 saat aktif kalır)"
};
async function loadNotices(){
 const root=$("#notices");if(!root)return;
 try{
  let cloud=await readCloud("notices");
  if(!cloud){const legacy=await getDoc(legacyDoc("notices"));cloud=legacy.exists()?legacy.data():null;}
  const directNoticeKeys=Object.keys(NOTICE_DEFAULTS);
  const saved=cloud?.noticesV1&&typeof cloud.noticesV1==="object"?cloud.noticesV1:
   (cloud&&directNoticeKeys.some(key=>typeof cloud[key]==="string")?cloud:null);
  if(saved){
   const translated={};
   for(const lang of LANGS.slice(1))translated[lang]={...(NOTICE_TRANSLATIONS[lang]||{}),...(saved.translations?.[lang]||{})};
   const koreanSaved={};
   for(const key of directNoticeKeys)koreanSaved[key]=koreanOnly(saved[key]??NOTICE_DEFAULTS[key]);
   noticeData={...NOTICE_DEFAULTS,...koreanSaved,translations:translated,goldenGlaivesVersion:Number(saved.goldenGlaivesVersion||0),squadScheduleVersion:Number(saved.squadScheduleVersion||0),updatedAt:saved.updatedAt||cloud?.updatedAt||0};
  }else noticeData={...NOTICE_DEFAULTS,translations:NOTICE_TRANSLATIONS};
     noticeData=normalizeBearNoticeText(noticeData);
     if(Number(noticeData.squadScheduleVersion||0)<1){noticeData.translations=noticeData.translations||{};for(const language of LANGS){const source=language==="ko"?NOTICE_DEFAULTS:(NOTICE_TRANSLATIONS[language]||NOTICE_DEFAULTS);noticeData.translations[language]={...(noticeData.translations[language]||{}),swordTeam1:source.swordTeam1||NOTICE_DEFAULTS.swordTeam1,swordTeam2:source.swordTeam2||NOTICE_DEFAULTS.swordTeam2,allianceTeam1:source.allianceTeam1||NOTICE_DEFAULTS.allianceTeam1,allianceTeam2:source.allianceTeam2||NOTICE_DEFAULTS.allianceTeam2};}Object.assign(noticeData,{swordTeam1:NOTICE_DEFAULTS.swordTeam1,swordTeam2:NOTICE_DEFAULTS.swordTeam2,allianceTeam1:NOTICE_DEFAULTS.allianceTeam1,allianceTeam2:NOTICE_DEFAULTS.allianceTeam2,squadScheduleVersion:1});}
   if(Number(noticeData.goldenGlaivesVersion||0)<2){noticeData.goldenGlaives=NOTICE_DEFAULTS.goldenGlaives;noticeData.translations=noticeData.translations||{};for(const language of LANGS){noticeData.translations[language]={...(noticeData.translations[language]||{}),goldenGlaives:GOLDEN_GLAIVES_CONTENT_BY_LANG[language]||NOTICE_DEFAULTS.goldenGlaives};}noticeData.goldenGlaivesVersion=2;}
   // Apply the requested Korean time display to saved Korean Golden Glaives content only.
   // Keep the existing notice lines, action instructions, and line breaks unchanged.
   const formatGoldenGlaives=value=>String(value||"")
    .replace(/(UTC[^\n—]*?)\s*—\s*(?=[🚫✅])/g,"$1\n");
   noticeData.goldenGlaives=formatGoldenGlaives(noticeData.goldenGlaives);
   if(noticeData.translations)for(const language of Object.keys(noticeData.translations)){const translated=noticeData.translations[language];if(translated&&translated.goldenGlaives)translated.goldenGlaives=formatGoldenGlaives(translated.goldenGlaives);}
  mergeCombinedEventNotices();
  noticeEditLang="ko";
  renderNotices();setMsg("notice-status",message("load"));
 }catch(e){console.error(e);renderNotices();setMsg("notice-status",message("fallback"));}
}
async function toggleNoticeAdmin(){
 if(!noticeAdmin&&!await ensureGoogleAdmin())return;
 if(noticeAdmin)captureNoticeEditor();
 noticeAdmin=!noticeAdmin;renderNotices();
}
async function saveNotices(){
 if(!noticeAdmin){alert(message("admin"));return;}
 captureNoticeEditor();
 noticeData=normalizeBearNoticeText(noticeData);
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
 setAdminButton(b,adminModes.teams);
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
 setAdminButton(b,adminModes.alliance);
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
 const button=$("#seatingAdminBtn",root);setAdminButton(button,adminModes.seating);
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
function participantStatusLabel(status){
 const labels={
  ko:{yes:"가능",no:"불가능",later:"나중에 참전 / 참전 중 휴식"},
  en:{yes:"Available",no:"Unavailable",later:"Join later / rest during war"},
  ja:{yes:"参加可能",no:"参加不可",later:"後で参加／戦闘中は休憩"},
  zh:{yes:"可以参加",no:"无法参加",later:"稍后参战／战斗期间休息"},
  de:{yes:"Verfügbar",no:"Nicht verfügbar",later:"Später teilnehmen / während des Kriegs pausieren"},
  it:{yes:"Disponibile",no:"Non disponibile",later:"Parteciperò dopo / riposo durante la guerra"},
  es:{yes:"Disponible",no:"No disponible",later:"Participar después / descansar durante la guerra"},
  tr:{yes:"Katılabilir",no:"Katılamaz",later:"Daha sonra katıl / savaş sırasında dinlen"}
 };
 return labels[currentLang]?.[status]||labels.ko[status]||status;
}
function normalizeParticipants(raw){
 const list=Array.isArray(raw?.participants)?raw.participants:[];
 return list.filter(x=>x&&typeof x==="object").map(x=>({
  nickname:String(x.nickname||"").trim(),status:["yes","no","later"].includes(x.status)?x.status:"yes",
  tier:["A","B","C","none"].includes(x.tier)?x.tier:"A",salo:(x.salo===true||x.salo==="yes"||x.salo==="O"),hilde:(x.hilde===true||x.hilde==="yes"||x.hilde==="O"),updatedAt:Number(x.updatedAt)||0
 })).filter(x=>x.nickname);
}
async function loadParticipantRoster(){
 let data=await readCloud("battleJoin");
 if(!data){const legacy=await getDoc(doc(db,"siteData","castle_features_v1"));data=legacy.exists()?legacy.data():null;}
 participants=normalizeParticipants(data||{});
 return participants;
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
 if(list)list.innerHTML=participants.map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantStatusLabel(p.status))+'</span><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">등록된 참전 정보가 없습니다.</p>';
 const waiting=$("#ncWaiting",root);
 if(waiting)waiting.innerHTML=participants.filter(p=>p.status==="later").map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">대기 명단이 없습니다.</p>';
 translateStatic();
}
async function loadNewCastleFeatures(){
 // Capture the route before awaiting Firestore so a quick page switch cannot mix page state.
 const pageId=activePage==="battleJoin"?"battleJoin":"castlewar1";
 const root=$("#"+pageId);
 try{
  const own=await readCloud(pageId);
  if(pageId==="battleJoin"){
   let data=own;
   if(!data){const old=await getDoc(legacyDoc("battleJoin"));if(old.exists())data=old.data();}
   participants=normalizeParticipants(data||{});
   renderParticipants();setMsg("ncJoinMsg",latestBanner("battleJoin"));
  }else{
   // Participant roster is auxiliary; its read failure must not block loading Castle War's own data.
   try{await loadParticipantRoster();}catch(rosterError){console.warn("Participant roster unavailable for Castle War",rosterError);participants=[];}
   let data=own;
   if(!data){const old=await getDoc(legacyDoc("castlewar1"));if(old.exists())data=old.data();}
   const war=data?.war||data?.castleWar||{};
   castleWarData={war:{...castleWarData.war,...war,assault:Array.from({length:10},(_,i)=>war.assault?.[i]||""),rush:Array.from({length:10},(_,i)=>war.rush?.[i]||""),finish:Array.from({length:10},(_,i)=>war.finish?.[i]||""),north:Array.from({length:10},(_,i)=>war.north?.[i]||""),west:Array.from({length:10},(_,i)=>war.west?.[i]||""),substitute:{...castleWarData.war.substitute,...(war.substitute||{})}},warLeaders:{assault:data?.warLeaders?.assault||"Nemesis",rush:data?.warLeaders?.rush||"Pham",finish:data?.warLeaders?.finish||"샌디에이고"},updatedAt:data?.updatedAt||0};
   renderCastleWar();setMsg("ncWarMsg",latestBanner("castlewar1"));
  }
 }catch(e){console.error(e);if(pageId==="battleJoin")setMsg("ncJoinMsg",message("fallback"));else setMsg("ncWarMsg",message("fallback"));}
}
function updateNewCastleJoinFields(){
 const root=$("#battleJoin"),sel=$("#ncNick",root),search=$("#ncIdSearch",root),box=$("#ncNickSearchResults",root);
 if(search&&sel?.value&&sel.value!=="__custom__")search.value=sel.value;
 if(box){box.hidden=true;box.style.display="none";}
 const special=FIXED_LEADERS.includes(sel?.value);
 $$("[data-nc-optional]",root).forEach(el=>{el.style.display=special?"none":"";});
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
 if(!nickname){setMsg("ncJoinMsg",message("nicknameRequired"));return;}
 if(nickname.length>80){setMsg("ncJoinMsg",message("nicknameTooLong"));return;}
 const item={nickname,status:$("#ncStatus",root)?.value||"yes",tier:$("#ncTier",root)?.value||"A",salo:$("#ncSalo",root)?.value==="yes",hilde:$("#ncHilde",root)?.value==="yes",updatedAt:Date.now()};
 const next=participants.slice(),idx=next.findIndex(p=>p.nickname.toLowerCase()===nickname.toLowerCase());
 if(idx>=0)next[idx]=item;else next.push(item);
 try{await saveCloud("battleJoin",{participants:next});participants=next;renderParticipants();setMsg("ncJoinMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncJoinMsg",message("failed"));}
}
async function cancelNewCastleParticipation(){
 const root=$("#battleJoin"),sel=$("#ncNick",root),nickname=sel?.value||"";
 if(!nickname||nickname==="__custom__"){setMsg("ncJoinMsg",message("cancelNickRequired"));return;}
 if(!confirm(message("cancelParticipation").replace("{nickname}",nickname)))return;
 const next=participants.filter(p=>p.nickname.toLowerCase()!==nickname.toLowerCase());
 try{await saveCloud("battleJoin",{participants:next});participants=next;renderParticipants();setMsg("ncJoinMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncJoinMsg",message("failed"));}
}
async function deleteAllNewCastleParticipants(){
 if(!adminModes.battleJoin||!confirm(message("deleteAllParticipants")))return;
 try{await saveCloud("battleJoin",{participants:[]});participants=[];renderParticipants();setMsg("ncJoinMsg",message("saved"));}
 catch(e){console.error(e);setMsg("ncJoinMsg",message("failed"));}
}
async function toggleNewCastleAdmin(){
 if(activePage==="battleJoin"){
  if(!adminModes.battleJoin&&!await ensureGoogleAdmin())return;
  adminModes.battleJoin=!adminModes.battleJoin;
  const b=$("#ncAdminBtn"),del=$("#ncDeleteAllBtn");
  setAdminButton(b,adminModes.battleJoin);
  if(del)del.style.display=adminModes.battleJoin?"inline-flex":"none";
  return;
 }
 if(!adminModes.castlewar1&&!await ensureGoogleAdmin())return;
 adminModes.castlewar1=!adminModes.castlewar1;
 const b=$("[data-newcastle='admin']",$("#castlewar1"));
 setAdminButton(b,adminModes.castlewar1);
 renderCastleWar();
}
const CASTLE_CARD_TEXT={
 ko:{leader:"집결장",tierA:"A등급",tierB:"B등급",tierC:"C등급",tierNone:"등급 없음",salo:"살로",hilde:"힐데",choose:"닉네임 선택",empty:"—"},
 en:{leader:"Rally leader",tierA:"Tier A",tierB:"Tier B",tierC:"Tier C",tierNone:"No tier",salo:"Salo",hilde:"Hilde",choose:"Choose nickname",empty:"—"},
 ja:{leader:"集結長",tierA:"Aランク",tierB:"Bランク",tierC:"Cランク",tierNone:"ランクなし",salo:"サロ",hilde:"ヒルデ",choose:"ニックネームを選択",empty:"—"},
 zh:{leader:"集结队长",tierA:"A级",tierB:"B级",tierC:"C级",tierNone:"无等级",salo:"萨洛",hilde:"希尔德",choose:"选择昵称",empty:"—"},
 de:{leader:"Sammelführer",tierA:"Rang A",tierB:"Rang B",tierC:"Rang C",tierNone:"Ohne Rang",salo:"Salo",hilde:"Hilde",choose:"Spitznamen wählen",empty:"—"},
 it:{leader:"Capo raduno",tierA:"Grado A",tierB:"Grado B",tierC:"Grado C",tierNone:"Senza grado",salo:"Salo",hilde:"Hilde",choose:"Scegli nickname",empty:"—"},
 es:{leader:"Líder de reunión",tierA:"Rango A",tierB:"Rango B",tierC:"Rango C",tierNone:"Sin rango",salo:"Salo",hilde:"Hilde",choose:"Elegir apodo",empty:"—"},
 tr:{leader:"Toplanma lideri",tierA:"A kademesi",tierB:"B kademesi",tierC:"C kademesi",tierNone:"Kademesiz",salo:"Salo",hilde:"Hilde",choose:"Takma ad seç",empty:"—"}
};
function castleCardText(key){return (CASTLE_CARD_TEXT[currentLang]||CASTLE_CARD_TEXT.ko)[key]||key;}
function castleAvatar(name){
 const style=vikingSpriteStyle(name);
 return '<span class="castle-avatar" '+(style?'style="'+style+'"':"")+'>'+(style?"":'<span>?</span>')+'</span>';
}
function castleParticipantCard(p){
 if(!p||!p.nickname)return '<div class="castle-person-empty">—</div>';
 const name=p.nickname,fixed=FIXED_LEADERS.includes(name),hasTier=["A","B","C"].includes(p.tier),tier=fixed?"S":hasTier?p.tier:"😭";
 const barracks=fixed?castleCardText("leader"):castleCardText(p.tier==="A"?"tierA":p.tier==="B"?"tierB":p.tier==="C"?"tierC":"tierNone");
 const skills=[];
 if(p.salo)skills.push(castleCardText("salo")+" O");
 if(p.hilde)skills.push(castleCardText("hilde")+" O");
 return '<div class="castle-person-card"><strong class="castle-rank'+(hasTier||fixed?"":" castle-rank-none")+'">'+tier+'</strong>'+castleAvatar(name)+'<div class="castle-person-main"><div class="castle-person-name"><strong>'+esc(name)+'</strong><span>('+esc(barracks)+')</span></div><small>'+esc(skills.join(" · "))+'</small></div></div>';
}
function castleMemberCard(name,meta){
 if(!name)return '<div class="castle-person-empty">—</div>';
 const p=participants.find(x=>x.nickname===name);
 if(p)return castleParticipantCard(p);
 if(FIXED_LEADERS.includes(name))return castleParticipantCard({nickname:name,tier:"S",salo:false,hilde:false});
 return '<div class="castle-person-card">'+castleAvatar(name)+'<div class="castle-person-main"><div class="castle-person-name"><strong>'+esc(name)+'</strong></div><small>'+esc(meta||"")+'</small></div></div>';
}
function castleWarSelect(value){
 const names=[...new Set([...FIXED_LEADERS,...participants.map(p=>p.nickname)])];
 return '<option value="">'+esc(castleCardText("choose"))+'</option>'+names.map(n=>{const p=participants.find(x=>x.nickname===n),tier=FIXED_LEADERS.includes(n)?"S":p&&["A","B","C"].includes(p.tier)?p.tier:"—";return '<option value="'+esc(n)+'" '+(n===value?'selected':'')+'>'+esc(tier+" · "+n)+'</option>';}).join("");
}
function castleParticipantMeta(name){const p=participants.find(x=>x.nickname===name);if(!name)return "";if(FIXED_LEADERS.includes(name))return "S · 집결장";if(!p)return "";return (p.tier||"—")+" · 살로 "+(p.salo?"O":"X")+" · 힐데 "+(p.hilde?"O":"X");}
function renderCastleWar(){
 const root=$("#castlewar1");if(!root)return;
 const attack=$("#ncWarAttack",root),turrets=$("#ncWarTurrets",root);
 const groups=[["assault","돌격조"],["rush","개돌조"],["finish","마무리조"]];
 const turretGroups=[["north","Leo li","북측포탑"],["west","Jinno","서측포탑"]];
 const names=[...new Set([...FIXED_LEADERS,...participants.map(p=>p.nickname)])];
 const optionList=(value)=>'<option value="">—</option>'+names.map(n=>'<option value="'+esc(n)+'" '+(n===value?'selected':'')+'>'+esc(n)+'</option>').join("");
 const cell=(name,key,index)=>adminModes.castlewar1?'<select data-war="'+key+'" data-index="'+index+'">'+castleWarSelect(name)+'</select>':castleMemberCard(name,castleParticipantMeta(name));
 const leaderCell=(key)=>adminModes.castlewar1?'<select data-war-leader="'+key+'">'+castleWarSelect(castleWarData.warLeaders[key]||"")+'</select>':castleMemberCard(castleWarData.warLeaders[key]||"",castleCardText("leader"));
 const renderAttack=([key,title])=>'<section class="war-column"><h3>'+title+'</h3><div class="war-leader-row"><b>집결장</b>'+leaderCell(key)+'</div>'+Array.from({length:10},(_,i)=>'<label class="war-slot"><span>'+(i+1)+'</span>'+cell(castleWarData.war[key]?.[i]||"",key,i)+'</label>').join("")+'</section>';
 const renderTurret=([key,leader,title])=>'<section class="war-column"><h3>'+title+'</h3><div class="war-leader-row"><b>'+esc(castleCardText("leader"))+'</b>'+castleMemberCard(leader,castleCardText("leader"))+'</div>'+Array.from({length:10},(_,i)=>'<label class="war-slot"><span>'+(i+1)+'</span>'+cell(castleWarData.war[key]?.[i]||"",key,i)+'</label>').join("")+'</section>';
 if(attack)attack.innerHTML=groups.map(renderAttack).join("");
 if(turrets)turrets.innerHTML=turretGroups.map(renderTurret).join("");
 const waiting=$("#ncWarWaiting",root);
 if(waiting)waiting.innerHTML=participants.filter(p=>p.status==="later").map(p=>'<div class="participant-line"><strong>'+esc(p.nickname)+'</strong><span>'+esc(participantRank(p)||p.tier)+'</span></div>').join("")||'<p class="muted">대기 명단이 없습니다.</p>';
 const saveButton=$("[data-newcastle='save']",root);
 if(saveButton)saveButton.style.display=adminModes.castlewar1?"inline-flex":"none";
 translateStatic();
}
async function saveNewCastleFeatures(){
 if(!adminModes.castlewar1){alert(message("admin"));return;}
 $$("#castlewar1 [data-war]").forEach(el=>{const key=el.dataset.war,i=Number(el.dataset.index);if(castleWarData.war[key])castleWarData.war[key][i]=el.value.trim();});
 $$("#castlewar1 [data-war-leader]").forEach(el=>{castleWarData.warLeaders[el.dataset.warLeader]=el.value.trim();});
 try{castleWarData=await saveCloud("castlewar1",castleWarData);setMsg("ncWarMsg",message("saved"));renderCastleWar();}
 catch(e){console.error(e);setMsg("ncWarMsg",message("failed"));}
}

/* Castle Layout — its own document; never writes to the war or participant record. */
async function loadCastleLayout1(){
 try{
  // The saved layout must remain readable even when the separate participant roster is unavailable.
  try{await loadParticipantRoster();}catch(rosterError){console.warn("Participant roster unavailable for Castle Layout",rosterError);participants=[];}
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
  else if(isFixed)inner=castleMemberCard(name,castleCardText("leader"));
  else inner=castleMemberCard(name,p?(participantRank(p)||p.tier)+" · "+castleCardText("salo")+" "+(p.salo?"O":"X")+" · "+castleCardText("hilde")+" "+(p.hilde?"O":"X"):"");
  return '<div class="castle-layout1-slot"><span class="castle-layout1-number">'+(i+1)+'</span><div class="castle-layout1-content">'+inner+'</div></div>';
 }).join("");
 const b=$("#castleLayout1AdminBtn",root),save=$("#castleLayout1SaveBtn",root);
 setAdminButton(b,adminModes.castlelayout1);
 if(save)save.style.display=adminModes.castlelayout1?"inline-flex":"none";
 translateStatic();
}
async function toggleCastleLayout1Admin(){await togglePageAdmin("castlelayout1","castleLayout1AdminBtn","castleLayout1SaveBtn");}
async function saveCastleLayout1(){
 if(!adminModes.castlelayout1){alert(message("admin"));return;}
 $$("#castlelayout1 [data-layout-slot]").forEach(el=>castleLayoutData.slots[Number(el.dataset.layoutSlot)]=el.value);
 FIXED_LEADERS.forEach((n,i)=>castleLayoutData.slots[i]=n);
 const chosen=castleLayoutData.slots.slice(6).filter(Boolean);
 if(chosen.some(n=>FIXED_LEADERS.includes(n))){alert(message("fixedLeaderSlots"));return;}
 if(new Set(chosen).size!==chosen.length){alert(message("duplicateLayout"));return;}
 try{castleLayoutData=await saveCloud("castlelayout1",castleLayoutData);renderCastleLayout();setMsg("castleLayout1Msg",message("saved"));}
 catch(e){console.error(e);setMsg("castleLayout1Msg",message("failed"));}
}

/* Viking team registration */
function getVikingSprite(nickname){
 const exact=String(nickname||"").normalize("NFKC").trim().toLowerCase();
 const rank=FIXED_NICKNAMES.findIndex(name=>String(name||"").normalize("NFKC").trim().toLowerCase()===exact)+1;
 if(rank<1||rank>99)return null;
 const tops={2:[134,210,286,363,440,516],3:[134,210,286,363,440,516],4:[143,219,294,370,446,522],5:[143,219,295,371,447,523],6:[136,212,288,364,441,517],7:[143,219,295,371,447,523],8:[143,219,295,371,447,523],9:[143,219,295,371,447,523],10:[143,219,295,371,447,523],11:[143,219,295,371,447,523],12:[143,219,295,371,447,523],13:[143,219,295,371,447,523],14:[143,219,295,371,447,523],15:[143,219,295,371,447,523],16:[136,212,288,364,441,517],17:[143,219,295,371,447,523]};
 let slide,row,top;
 if(rank<=96){slide=Math.floor((rank-1)/6)+2;row=(rank-1)%6;top=tops[slide]?.[row];}
 else{slide=18;row=rank-94;top=[166,242,319,395,471,548][row];}
 return top?{slide,top}:null;
}
function vikingSpriteStyle(nickname){
 const p=getVikingSprite(nickname);if(!p)return "";
 const scale=32/72;
 return "background-image:url('https://raw.githubusercontent.com/KOR1816/1816KOR/main/Slide"+p.slide+".jpg');background-repeat:no-repeat;background-size:"+(1280*scale)+"px "+(720*scale)+"px;background-position:-"+(70*scale)+"px -"+Math.round((p.top-4)*scale)+"px;";
}
function renderViking(){
 const root=$("#viking"),team=$("#vikingTeam"),count=$("#vikingCount"),list=$("#vikingTeams"),nick=$("#vikingNickname");
 if(team)team.innerHTML='<option value="">참가 팀</option>'+Array.from({length:25},(_,i)=>'<option value="'+(i+1)+'">Team '+(i+1)+'</option>').join("");
 if(nick){
  const selected=nick.value,names=[...new Set([...FIXED_NICKNAMES,...Object.values(vikingData.teams||{}).flat()])];
  nick.innerHTML='<option value="">닉네임 선택</option>'+names.map(n=>'<option value="'+esc(n)+'">'+esc(n)+'</option>').join("")+'<option value="__custom__">직접 입력</option>';
  if([...nick.options].some(o=>o.value===selected))nick.value=selected;
 }
 if(count)count.textContent=Object.values(vikingData.teams||{}).reduce((n,a)=>n+(a?.length||0),0)+" / 100";
 if(list)list.innerHTML=Array.from({length:25},(_,i)=>{
  const teamNo=i+1,roster=vikingData.teams?.[teamNo]||[],photos=vikingPhotosByTeam[teamNo]||{};
  const members=roster.length?roster.map(name=>{
   const photo=photos[name],sprite=vikingSpriteStyle(name),avatar=typeof photo==="string"&&photo.startsWith("data:image/")?'<img src="'+photo+'" alt="">':sprite?'<span class="viking-sprite" style="'+sprite+'"></span>':'<span class="viking-no-photo">?</span>';
   const upload=vikingPhotoAdmin?'<button type="button" class="viking-photo-button" data-viking-photo="1" data-team="'+teamNo+'" data-nick="'+esc(name)+'">📷</button>':"";
   return '<div class="viking-member"><span class="viking-avatar">'+avatar+'</span><span class="viking-member-name">'+esc(name)+'</span>'+upload+'</div>';
  }).join(""):'<div class="viking-empty">—</div>';
  return '<div class="viking-team"><h3>🛡️ Team '+teamNo+' <small>('+roster.length+'/4)</small></h3>'+members+'</div>';
 }).join("");
 const photoButton=$("#vikingPhotoAdminBtn",root);
 if(photoButton){photoButton.dataset.photoAdminState=vikingPhotoAdmin?"on":"off";photoButton.textContent=(PHOTO_ADMIN_LABELS[currentLang]||PHOTO_ADMIN_LABELS.ko)[vikingPhotoAdmin?1:0];}
 $$("#vikingTeams [data-viking-photo]").forEach(button=>button.addEventListener("click",()=>triggerVikingPhoto(Number(button.dataset.team),button.dataset.nick)));
 translateStatic();
}
const PHOTO_ADMIN_LABELS={
 ko:["🔐 사진 관리자","🔒 사진 수정 종료"],en:["🔐 Photo admin","🔒 Finish photo editing"],ja:["🔐 写真管理","🔒 写真編集終了"],zh:["🔐 照片管理","🔒 结束照片编辑"],de:["🔐 Fotoadmin","🔒 Fotobearbeitung beenden"],it:["🔐 Gestione foto","🔒 Termina modifica foto"],es:["🔐 Admin de fotos","🔒 Finalizar edición de fotos"],tr:["🔐 Foto yöneticisi","🔒 Foto düzenlemeyi bitir"]
};
function setPhotoAdminButton(on){
 const b=$("#vikingPhotoAdminBtn");if(!b)return;
 b.dataset.photoAdminState=on?"on":"off";
 b.textContent=(PHOTO_ADMIN_LABELS[currentLang]||PHOTO_ADMIN_LABELS.ko)[on?1:0];
}
async function loadVikingPhotos(){
 const entries=await Promise.all(Array.from({length:25},async(_,i)=>{
  const teamNo=i+1;
  try{
   const [newSnap,legacySnap]=await Promise.all([
    getDoc(doc(db,"siteData","rebuild_viking_photos_team_"+teamNo)),
    getDoc(doc(db,"siteData","viking_photos_team_"+teamNo))
   ]);
   const legacyPhotos=legacySnap.exists()&&legacySnap.data()?.photos&&typeof legacySnap.data().photos==="object"?legacySnap.data().photos:{};
   const newPhotos=newSnap.exists()&&newSnap.data()?.photos&&typeof newSnap.data().photos==="object"?newSnap.data().photos:{};
   return [teamNo,{...legacyPhotos,...newPhotos}];
  }catch(error){console.warn("Viking photo read",teamNo,error);return [teamNo,{}];}
 }));
 vikingPhotosByTeam=Object.fromEntries(entries);
}
async function toggleVikingPhotoAdmin(){
 if(!vikingPhotoAdmin&&!await ensureGoogleAdmin())return;
 vikingPhotoAdmin=!vikingPhotoAdmin;setPhotoAdminButton(vikingPhotoAdmin);renderViking();
}
async function triggerVikingPhoto(teamNo,nickname){
 if(!vikingPhotoAdmin||!await ensureGoogleAdmin())return;
 const input=document.createElement("input");input.type="file";input.accept="image/*";
 input.addEventListener("change",async()=>{
  const file=input.files?.[0];if(!file)return;
  if(!file.type.startsWith("image/")){alert(message("imageOnly"));return;}
  if(file.size>12*1024*1024){alert(message("photoTooLarge"));return;}
  try{
   setMsg("vikingMsg",message("processingPhoto").replace("{nickname}",nickname));
   const dataUrl=await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=reject;
    reader.onload=()=>{
     const image=new Image();image.onerror=reject;
     image.onload=()=>{
      const canvas=document.createElement("canvas");canvas.width=128;canvas.height=128;
      const side=Math.min(image.width,image.height),sx=(image.width-side)/2,sy=(image.height-side)/2;
      const ctx=canvas.getContext("2d");ctx.drawImage(image,sx,sy,side,side,0,0,128,128);
      resolve(canvas.toDataURL("image/jpeg",0.72));
     };
     image.src=String(reader.result);
    };
    reader.readAsDataURL(file);
   });
   if(dataUrl.length>180000)throw new Error("압축된 사진이 너무 큽니다.");
   await setDoc(doc(db,"siteData","rebuild_viking_photos_team_"+teamNo),{photos:{[nickname]:dataUrl},updatedAt:Date.now()},{merge:true});
   vikingPhotosByTeam[teamNo]=vikingPhotosByTeam[teamNo]||{};vikingPhotosByTeam[teamNo][nickname]=dataUrl;
   setMsg("vikingMsg",message("saved"));renderViking();
  }catch(error){console.error("Viking photo save",error);setMsg("vikingMsg",message("failed"));}
 });
 input.click();
}
function toggleVikingCustomNick(){const sel=$("#vikingNickname"),custom=$("#vikingCustomNickname");if(!sel||!custom)return;custom.style.display=sel.value==="__custom__"?"block":"none";}
function getVikingSelectedNick(){return $("#vikingNickname")?.value==="__custom__"?($("#vikingCustomNickname")?.value||"").trim():($("#vikingNickname")?.value||"").trim();}
async function loadViking(){
 const r=await loadData("viking",vikingData);
 if(r.data.teams)vikingData={...vikingData,...r.data,teams:{...vikingData.teams,...r.data.teams}};
 await loadVikingPhotos();
 renderViking();setMsg("vikingMsg",r.source==="unavailable"?message("fallback"):message("load"));
}
async function saveViking(next=vikingData){try{vikingData=await saveCloud("viking",next);renderViking();setMsg("vikingMsg",message("saved"));return true;}catch(e){console.error(e);setMsg("vikingMsg",message("failed"));return false;}}
async function joinVikingTeam(){
 const name=getVikingSelectedNick(),team=Number($("#vikingTeam")?.value),msg=$("#vikingMsg");
 if(!name||!team){if(msg)msg.textContent=message("vikingSelect");return;}
 if(Object.values(vikingData.teams).some(a=>a.some(n=>n.toLowerCase()===name.toLowerCase()))){if(msg)msg.textContent=message("vikingAlreadyInTeam");return;}
 const roster=vikingData.teams[team]||[];if(roster.length>=4){if(msg)msg.textContent=message("vikingTeamFull");return;}
 const next=clone(vikingData);next.teams[team]=[...roster,name];await saveViking(next);
}
async function leaveVikingTeam(){
 const name=getVikingSelectedNick();if(!name){setMsg("vikingMsg",message("selectNicknameCancel"));return;}
 const next=clone(vikingData);let found=false;
 for(const [team,roster] of Object.entries(next.teams)){if(roster.some(n=>n.toLowerCase()===name.toLowerCase())){next.teams[team]=roster.filter(n=>n.toLowerCase()!==name.toLowerCase());found=true;}}
 if(!found){setMsg("vikingMsg",message("noVikingTeam"));return;}await saveViking(next);
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
 const sorted=gloryRecords.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 root.innerHTML=sorted.map(r=>{
  const originalIndex=gloryRecords.findIndex(x=>x.date===r.date&&x.opponent===r.opponent&&x.prep===r.prep&&x.castle===r.castle&&x.memo===r.memo);
  return '<article class="glory-record"><header><strong>'+esc(r.date)+'</strong><span>상대 왕국 '+esc(r.opponent)+'</span></header><div class="glory-results"><span>준비기간: '+(r.prep==="승"?"🏆 승리":"⚔️ 패배")+'</span><span>전쟁기간: '+(r.castle==="승"?"🏆 승리":"⚔️ 패배")+'</span></div>'+(r.memo?'<p>'+esc(r.memo)+'</p>':"")+(adminModes.glory?'<button type="button" onclick="deleteRecord('+originalIndex+')">삭제</button>':"")+'</article>';
 }).join("")||'<p class="muted">기록이 없습니다.</p>';
 translateStatic();
}
function openEditor(){if(!adminModes.glory){ensureGoogleAdmin().then(ok=>{if(ok){adminModes.glory=true;$("#glory-editor").hidden=false;renderRecords();}});return;}$("#glory-editor").hidden=false;}
function closeEditor(){$("#glory-editor").hidden=true;}
async function saveRecord(){
 if(!adminModes.glory&&!await ensureGoogleAdmin())return;adminModes.glory=true;
 const date=$("#glory-date")?.value,opponent=Number($("#glory-opponent")?.value);
 if(!date||!opponent){setMsg("glory-editor-msg",message("gloryRequired"));return;}
 const next=[...gloryRecords,{date,opponent,prep:$("#glory-prep")?.value||"패",castle:$("#glory-castle")?.value||"패",memo:$("#glory-memo")?.value.trim()||""}];
 try{await saveCloud("glory",{records:next});gloryRecords=next;renderRecords();closeEditor();setMsg("glory-msg",message("saved"));}
 catch(e){console.error(e);setMsg("glory-msg",message("failed"));}
}
async function deleteRecord(index){
 if(!adminModes.glory||!confirm(message("deleteRecord")))return;
 const next=gloryRecords.filter((_,i)=>i!==index);
 try{await saveCloud("glory",{records:next});gloryRecords=next;renderRecords();setMsg("glory-msg",message("saved"));}
 catch(e){console.error(e);setMsg("glory-msg",message("failed"));}
}

/* Inline handlers are explicitly exported because page markup is static HTML. */
Object.assign(window,{
 loadHome,toggleHomeAdmin,saveHome,refreshTeams:loadTeams,toggleTeamsAdmin,saveAllTeams,
 loadAlliance,toggleAllianceAdmin,saveAlliance,loadSeating,toggleSeatingAdmin,saveSeating,
 updateNewCastleJoinFields,filterNewCastleNicknames,chooseNewCastleNickname,submitNewCastleParticipation,cancelNewCastleParticipation,
 loadNewCastleFeatures,toggleNewCastleAdmin,deleteAllNewCastleParticipants,saveNewCastleFeatures,
 loadCastleLayout1,toggleCastleLayout1Admin,saveCastleLayout1,runCastleLayout1Auto:()=>{if(!adminModes.castlelayout1){alert(message("admin"));return;}const active=participants.filter(p=>p.status==="yes"&&participantRank(p)&&!FIXED_LEADERS.includes(p.nickname)).sort((a,b)=>participantRank(a).localeCompare(participantRank(b))||a.nickname.localeCompare(b.nickname));for(let i=6;i<28;i++)castleLayoutData.slots[i]=active[i-6]?.nickname||"";renderCastleLayout();},
 toggleVikingCustomNick,joinVikingTeam,leaveVikingTeam,loadViking,toggleVikingPhotoAdmin,triggerVikingPhoto,openEditor,closeEditor,saveRecord,loadRecords,deleteRecord
});

function boot(){
 const savedLang=(()=>{try{return new URLSearchParams(location.search).get("lang")||localStorage.getItem("kor1816_rebuild_lang_v1")||localStorage.getItem("kor1816_lang")||"ko";}catch{return "ko";}})();
 currentLang=LANGS.includes(savedLang)?savedLang:"ko";
 setupTemplates();makeNav();
 $("#language-select").addEventListener("change",e=>applyLanguage(e.target.value));
 window.addEventListener("hashchange",restoreRoute);window.addEventListener("popstate",restoreRoute);
 ensureReadSession().catch(e=>console.warn("Read session unavailable",e)).finally(()=>restoreRoute());
}
boot();
