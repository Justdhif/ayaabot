import axios from "axios";
import crypto from "crypto";

const FIREBASE_API_KEY = "AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0";
const ID_TOOLKIT_URL = "https://www.googleapis.com/identitytoolkit/v3/relyingparty";
const VERIFY_PURCHASE_URL = "https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase";

// In-memory cache for pending sessions by Discord User ID
const pendingAmSessions = new Map<string, string>();

// Simple in-memory stats tracker
let memoryStats = {
  totalPremium: 150,
  todayPremium: 12,
  lastDate: new Date().toISOString().split("T")[0],
};

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getAmStats() {
  const today = getTodayDateString();
  if (memoryStats.lastDate !== today) {
    memoryStats.todayPremium = 0;
    memoryStats.lastDate = today;
  }
  return {
    total: memoryStats.totalPremium,
    today: memoryStats.todayPremium,
  };
}

function incrementStats() {
  const current = getAmStats();
  memoryStats.totalPremium = current.total + 1;
  memoryStats.todayPremium = current.today + 1;
  return {
    total: memoryStats.totalPremium,
    today: memoryStats.todayPremium,
  };
}

export function getAmPendingEmail(discordUserId: string): string | undefined {
  return pendingAmSessions.get(discordUserId);
}

export function setAmPendingEmail(discordUserId: string, email: string): void {
  pendingAmSessions.set(discordUserId, email.toLowerCase().trim());
}

export function clearAmPendingEmail(discordUserId: string): void {
  pendingAmSessions.delete(discordUserId);
}

const generateRandomIp = () =>
  `${crypto.randomInt(1, 255)}.${crypto.randomInt(0, 255)}.${crypto.randomInt(0, 255)}.${crypto.randomInt(1, 255)}`;

const spoofHeaders = (baseHeaders: Record<string, string>) => ({
  ...baseHeaders,
  "x-forwarded-for": generateRandomIp(),
  "x-real-ip": generateRandomIp(),
  "client-ip": generateRandomIp(),
  "x-client-ip": generateRandomIp(),
  "x-originating-ip": generateRandomIp(),
  "x-cluster-client-ip": generateRandomIp(),
});

const androidHeaders = {
  "content-type": "application/json",
  "x-android-package": "com.alightcreative.motion",
  "x-android-cert": "ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8",
  "user-agent": "dalvik/2.1.0 (linux; u; android 15; 23127pn0cc build/bp1a.250505.005)",
};

const verifyHeaders = {
  "content-type": "application/json; charset=utf-8",
  "user-agent": "okhttp/3.12.1",
  "accept-encoding": "gzip",
};

const formatAxiosError = (err: any): string => {
  const data = err.response?.data;
  return data
    ? typeof data === "object"
      ? JSON.stringify(data)
      : String(data)
    : err.message || "Unknown network error";
};

export function friendlyFirebaseError(errStr: string): string {
  if (!errStr || typeof errStr !== "string") {
    return "Terjadi kendala autentikasi dengan server Alight Motion.";
  }
  if (errStr.includes("INVALID_OOB_CODE")) {
    return "Kode magic link tidak valid atau sudah pernah digunakan.";
  }
  if (errStr.includes("EXPIRED_OOB_CODE")) {
    return "Magic link telah kedaluwarsa. Silakan minta tautan baru.";
  }
  if (errStr.includes("INVALID_EMAIL")) {
    return "Format email tidak valid. Pastikan penulisan alamat email benar.";
  }
  if (errStr.includes("EMAIL_NOT_FOUND")) {
    return "Email tidak ditemukan di sistem. Silakan klik tombol 'Minta Link' terlebih dahulu.";
  }
  if (errStr.includes("USER_DISABLED")) {
    return "Akun Alight Motion ini dinonaktifkan oleh pihak Alight Creative.";
  }
  if (errStr.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
    return "Terlalu banyak percobaan ke server Alight Motion. Harap tunggu beberapa menit sebelum mencoba lagi.";
  }
  if (errStr.includes("Gagal mengekstrak oobCode") || errStr.includes("code gak ada")) {
    return "Format tautan verifikasi tidak dikenali. Pastikan kamu menyalin seluruh tautan utuh dari tombol di Gmail.";
  }
  return errStr.length > 300 ? `${errStr.slice(0, 300)}...` : errStr;
}

export function extractOobCode(raw: string): string | null {
  if (!raw) return null;
  let s = String(raw).replace(/&amp;/g, "&");
  try {
    s = decodeURIComponent(s);
  } catch (_) {}

  try {
    const u = new URL(s);
    let c = u.searchParams.get("oobCode");
    if (!c) {
      const nested = u.searchParams.get("link") || u.searchParams.get("q") || u.searchParams.get("url");
      if (nested) {
        try {
          c = new URL(nested).searchParams.get("oobCode");
        } catch (_) {}
      }
    }
    if (c) return c.replace(/[^a-zA-Z0-9_-]/g, "");
  } catch (_) {}

  const match = s.match(/oobCode=([a-zA-Z0-9_-]+)/i);
  if (match) return match[1];

  const trimmed = raw.trim();
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes("://")) {
    return trimmed;
  }

  return null;
}

export async function requestMagicLink(email: string) {
  try {
    try {
      await axios.post(
        `${ID_TOOLKIT_URL}/createAuthUri?key=${FIREBASE_API_KEY}`,
        { identifier: email, continueUri: "http://localhost" },
        { headers: spoofHeaders(androidHeaders), timeout: 10000 }
      );
    } catch (_) {
      // Warmup call
    }

    await axios.post(
      `${ID_TOOLKIT_URL}/getOobConfirmationCode?key=${FIREBASE_API_KEY}`,
      {
        requestType: 6,
        email: email,
        androidInstallApp: true,
        canHandleCodeInApp: true,
        continueUrl: "https://alightcreative.com?ui_sid=0366624874&ui_sd=0",
        iosBundleId: "com.alightcreative.motion",
        androidPackageName: "com.alightcreative.motion",
        androidMinimumVersion: "585",
        clientType: "CLIENT_TYPE_ANDROID",
      },
      { headers: spoofHeaders(androidHeaders), timeout: 15000 }
    );
    return { ok: true };
  } catch (e) {
    return { ok: false, why: formatAxiosError(e) };
  }
}

export async function authenticateEmailLink(email: string, rawLink: string) {
  const oobCode = extractOobCode(rawLink);
  if (!oobCode) {
    return { ok: false, why: "Gagal mengekstrak oobCode dari tautan email" };
  }

  try {
    const authRes = await axios.post(
      `${ID_TOOLKIT_URL}/emailLinkSignin?key=${FIREBASE_API_KEY}`,
      {
        email: email,
        oobCode: oobCode,
        clientType: "CLIENT_TYPE_ANDROID",
      },
      { headers: spoofHeaders(androidHeaders), timeout: 15000 }
    );

    let accountInfo: any = null;
    try {
      const infoRes = await axios.post(
        `${ID_TOOLKIT_URL}/getAccountInfo?key=${FIREBASE_API_KEY}`,
        { idToken: authRes.data.idToken },
        { headers: spoofHeaders(androidHeaders), timeout: 10000 }
      );
      accountInfo = infoRes.data?.users?.[0] || null;
    } catch (_) {}

    return {
      ok: true,
      email: email,
      id: authRes.data.idToken,
      refreshToken: authRes.data.refreshToken,
      uid: authRes.data.localId,
      isNewUser: Boolean(authRes.data.isNewUser),
      user: accountInfo,
    };
  } catch (e) {
    return { ok: false, why: formatAxiosError(e) };
  }
}

export async function activateProSubscription(idToken: string) {
  const orderId = "neo-" + crypto.randomBytes(6).toString("hex");
  const payload = {
    data: {
      productId: "am.full.sub.annual.19q4",
      token:
        "mmgaobamlahbbeccfplmbkbb.AO-J1OzqG0or_GJJIx-ms8GrTm-jaglCRfhQSRPUZKpl2YspYS-oN7_94uv8RC5vQbvd_Ios2pPDStZ2n7F0hLE3FiOU7HS3R6Fquulv5xLXFECSv4ctElw",
      skuType: "subs",
      orderId: orderId,
    },
  };
  const headers = {
    ...verifyHeaders,
    authorization: "Bearer " + idToken,
    "firebase-instance-id-token":
      "cSDnCyp3T-uwp07z3tL86T:APA91bFkmvvsHw5nnqa1SBFci-99DRsKClLiETdRrVcJjS5yBx1v_FbCb1d8WhBuea_zmwnYBktyTIzcRhN4b6uNOUur9wPc0gKXmJDoZic0LhNq5V2s0xI",
  };

  try {
    const res = await axios.post(VERIFY_PURCHASE_URL, payload, {
      headers: spoofHeaders(headers),
      timeout: 20000,
    });
    return { ok: true, order: orderId, data: res.data };
  } catch (e) {
    return { ok: false, why: formatAxiosError(e) };
  }
}

export async function sendVerificationLink(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const res = await requestMagicLink(cleanEmail);

  if (!res.ok) {
    throw new Error(friendlyFirebaseError(res.why || "Unknown error"));
  }

  return {
    ok: true,
    email: cleanEmail,
    message: `Link verifikasi Alight Motion berhasil dikirim ke ${cleanEmail}. Periksa inbox atau folder spam email Anda.`,
  };
}

export async function verifyMagicLink(email: string, magicLink: string) {
  const cleanEmail = email.trim().toLowerCase();
  const auth = await authenticateEmailLink(cleanEmail, magicLink.trim());

  if (!auth.ok) {
    throw new Error(friendlyFirebaseError(auth.why || "Unknown error"));
  }

  const premium = await activateProSubscription(auth.id || "");
  const stats = premium.ok ? incrementStats() : getAmStats();

  const now = new Date();
  const until = new Date();
  until.setFullYear(until.getFullYear() + 1);

  const formattedUserData = {
    uid: auth.uid || auth.user?.localId || "-",
    email: auth.user?.email || cleanEmail,
    displayName: auth.user?.displayName || null,
    isNewUser: Boolean(auth.isNewUser),
    status: premium.ok ? "ACTIVE" : "INACTIVE",
    membershipStatus: premium.ok ? "PREMIUM_ACTIVE" : "LOGIN_ONLY",
    tier: premium.ok ? "Alight Motion Pro VIP" : "Alight Motion Member",
    subscription: premium.ok ? "Yearly VIP License (1 Tahun)" : "Login Only",
    orderId: premium.order || null,
    activatedAt: now.toISOString(),
    validUntil: until.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    stats,
  };

  return {
    ok: true,
    isPremium: premium.ok,
    userData: formattedUserData,
    premiumError: premium.ok ? null : premium.why,
  };
}
