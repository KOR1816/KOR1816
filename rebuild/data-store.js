import { db, doc, getDoc, setDoc } from "./firebase-client.js";
const COL = "siteData";
export const PAGE_DOCS = {
  home: "home", notices: "notices", teams: "teams", alliance: "alliance",
  seating: "seating_v4", viking: "viking_v1", glory: "glory_records",
  battleJoin: "castle_participation_rebuild_v1",
  castlewar: "castlewar_rebuild_v1",
  castlelayout: "castle_layout1_v1"
};
const localKey = id => "kor1816_rebuild_cache_v1:" + id;
const copy = value => JSON.parse(JSON.stringify(value));
const pageRef = id => {
  if (!PAGE_DOCS[id]) throw new Error("Unknown page: " + id);
  return doc(db, COL, PAGE_DOCS[id]);
};
function readCache(id) {
  try { return JSON.parse(localStorage.getItem(localKey(id)) || "null"); } catch { return null; }
}
function writeCache(id, value) {
  try { localStorage.setItem(localKey(id), JSON.stringify(value)); } catch (error) { console.warn(error); }
}
export async function loadPage(id, defaults = {}) {
  try {
    const snap = await getDoc(pageRef(id));
    if (snap.exists()) {
      const data = snap.data(); writeCache(id, data);
      return { data: { ...copy(defaults), ...data }, source: "cloud", stale: false };
    }
    const cached = readCache(id);
    return { data: cached ? { ...copy(defaults), ...cached } : copy(defaults), source: cached ? "local-fallback" : "cloud-empty", stale: Boolean(cached) };
  } catch (error) {
    const cached = readCache(id);
    return { data: cached ? { ...copy(defaults), ...cached } : copy(defaults), source: cached ? "local-fallback" : "unavailable", stale: true, error };
  }
}
export async function savePage(id, value) {
  const payload = { ...copy(value), updatedAt: Date.now() };
  await setDoc(pageRef(id), payload, { merge: true });
  writeCache(id, payload);
  return payload;
}
export async function refreshPage(id, defaults = {}) {
  const snap = await getDoc(pageRef(id));
  if (!snap.exists()) return loadPage(id, defaults);
  const data = snap.data(); writeCache(id, data);
  return { data: { ...copy(defaults), ...data }, source: "cloud", stale: false };
}
