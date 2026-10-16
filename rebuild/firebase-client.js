import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// This is the public Firebase web configuration already used by the current site.
// The production branch is not modified by this development module.
const firebaseConfig = window.KOR1816_FIREBASE_CONFIG;
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { doc, getDoc, setDoc };

export async function ensureReadSession() {
  if (auth.currentUser) return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}

export async function ensureGoogleAdmin() {
  let user = auth.currentUser;
  if (!user || !user.email) {
    try { user = (await signInWithPopup(auth, new GoogleAuthProvider())).user; }
    catch (error) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") return false;
      throw new Error("Google 로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  }
  const allowed = (window.KOR1816_ADMIN_EMAILS || []).map(value => String(value).toLowerCase());
  if (!user?.email || !allowed.includes(user.email.toLowerCase())) {
    try { await signOut(auth); await signInAnonymously(auth); } catch (error) { console.warn(error); }
    throw new Error("관리자 권한이 없는 Google 계정입니다.");
  }
  return true;
}
