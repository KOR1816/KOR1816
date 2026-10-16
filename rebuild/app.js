const LANG_KEY = "kor1816_rebuild_lang_v1";
const PAGES = [
  {id:"home", icon:"🏠", labels:{ko:"홈",en:"Home",ja:"ホーム",zh:"首页",de:"Startseite",it:"Home",es:"Inicio",tr:"Ana Sayfa"}},
  {id:"notices", icon:"📢", labels:{ko:"공지",en:"Notices",ja:"お知らせ",zh:"公告",de:"Mitteilungen",it:"Avvisi",es:"Avisos",tr:"Duyurular"}},
  {id:"teams", icon:"⚔️", labels:{ko:"성검쟁탈",en:"Holy Sword",ja:"聖剣争奪",zh:"圣剑争夺",de:"Heiliges Schwert",it:"Spada Sacra",es:"Espada Sagrada",tr:"Kutsal Kılıç"}},
  {id:"alliance", icon:"🗡️", labels:{ko:"3대연맹전",en:"Alliance War",ja:"三大連盟戦",zh:"三大联盟战",de:"Allianzkrieg",it:"Guerra tra Alleanze",es:"Guerra de Alianzas",tr:"İttifak Savaşı"}},
  {id:"battleJoin", icon:"⚔️", labels:{ko:"캐슬참전",en:"Castle Participation",ja:"城参加",zh:"城堡参战",de:"Burgteilnahme",it:"Partecipazione al Castello",es:"Participación en el Castillo",tr:"Kale Katılımı"}},
  {id:"castlewar", icon:"🔱", labels:{ko:"캐슬전",en:"Castle War",ja:"城戦",zh:"城堡战",de:"Burgkrieg",it:"Guerra del Castello",es:"Guerra del Castillo",tr:"Kale Savaşı"}},
  {id:"castlelayout", icon:"🏰", labels:{ko:"캐슬배치",en:"Castle Layout",ja:"城配置",zh:"城堡布阵",de:"Burgaufstellung",it:"Disposizione del Castello",es:"Formación del Castillo",tr:"Kale Dizilimi"}},
  {id:"seating", icon:"🪑", labels:{ko:"자리배치",en:"Seating",ja:"配置表",zh:"座位安排",de:"Platzierung",it:"Disposizione",es:"Distribución",tr:"Yerleşim"}},
  {id:"viking", icon:"🪓", labels:{ko:"바이킹",en:"Viking",ja:"バイキング",zh:"维京",de:"Wikinger",it:"Vichinghi",es:"Vikingos",tr:"Viking"}},
  {id:"glory", icon:"🏆", labels:{ko:"영광의순간들",en:"Moments of Glory",ja:"栄光の瞬間",zh:"荣耀时刻",de:"Ruhmreiche Momente",it:"Momenti di Gloria",es:"Momentos de Gloria",tr:"Zafer Anları"}}
];
const LANGUAGE_LABELS = {ko:"언어",en:"Language",ja:"言語",zh:"语言",de:"Sprache",it:"Lingua",es:"Idioma",tr:"Dil"};
let currentLang = "ko";
const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];

function readLanguage() {
  try { const saved=localStorage.getItem(LANG_KEY); if (saved && LANGUAGE_LABELS[saved]) return saved; } catch {}
  return "ko";
}
function applyLanguage(lang) {
  currentLang = LANGUAGE_LABELS[lang] ? lang : "ko";
  document.documentElement.lang = currentLang;
  $("#language-select").value = currentLang;
  $("#language-label").textContent = LANGUAGE_LABELS[currentLang];
  $$("#main-nav button").forEach((button,index) => {
    const page=PAGES[index];
    button.textContent = page.icon+" "+page.labels[currentLang];
    button.setAttribute("aria-label",page.labels[currentLang]);
  });
  try { localStorage.setItem(LANG_KEY,currentLang); } catch {}
  document.dispatchEvent(new CustomEvent("kor1816:languagechange",{detail:{language:currentLang}}));
}
function renderNavigation() {
  const nav=$("#main-nav");
  nav.replaceChildren();
  PAGES.forEach(page => {
    const button=document.createElement("button");
    button.type="button";
    button.dataset.route=page.id;
    button.addEventListener("click",()=>navigate(page.id));
    nav.append(button);
  });
  applyLanguage(readLanguage());
}
function validPage(id) { return PAGES.some(page=>page.id===id); }
function navigate(id, updateUrl=true) {
  if(!validPage(id)) id="home";
  $$(".page").forEach(page=>page.classList.toggle("active",page.id===id));
  $$("#main-nav button").forEach(button=>{
    if(button.dataset.route===id) button.setAttribute("aria-current","page");
    else button.removeAttribute("aria-current");
  });
  if(updateUrl && location.hash!=="#"+id) history.pushState({page:id},"","#"+id);
  window.scrollTo({top:0,left:0,behavior:"auto"});
  $("#page-root").focus({preventScroll:true});
  document.dispatchEvent(new CustomEvent("kor1816:pagechange",{detail:{page:id,language:currentLang}}));
}
function restoreRoute() {
  const id=decodeURIComponent(location.hash.slice(1));
  navigate(validPage(id)?id:"home",false);
}
$("#language-select").addEventListener("change",event=>applyLanguage(event.target.value));
window.addEventListener("hashchange",restoreRoute);
window.addEventListener("popstate",restoreRoute);
renderNavigation();
restoreRoute();
