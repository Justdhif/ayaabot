const AMPREM_API_BASE =
  process.env.AMPREM_API_URL?.replace(/\/+$/, "") || "https://amprem-api.vercel.app";

// In-memory cache for pending sessions by Discord User ID
const pendingAmSessions = new Map<string, { email: string; sessionId?: string }>();

export interface AmStats {
  total: number;
  today: number;
  status: string;
}

let cachedStats: AmStats = {
  total: 143,
  today: 19,
  status: "Online 🟢",
};

/**
 * Memperbarui data statistik aktivasi dari API secara asynchronous
 */
export async function refreshAmStats(): Promise<AmStats> {
  try {
    const res = await fetch(`${AMPREM_API_BASE}/api/am/stats`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        cachedStats = {
          total: Number(json.data.totalPremium) || cachedStats.total,
          today: Number(json.data.todayPremium) || cachedStats.today,
          status: json.data.status || "Online 🟢",
        };
      }
    }
  } catch (err) {
    console.error("Gagal memperbarui statistik AM dari API:", err);
  }
  return cachedStats;
}

/**
 * Mendapatkan statistik terkini untuk tampilan embed Discord
 */
export function getAmStats(): AmStats {
  // Trigger background refresh jika belum sinkron
  refreshAmStats().catch(() => {});
  return cachedStats;
}

export function getAmPendingEmail(discordUserId: string): string | undefined {
  return pendingAmSessions.get(discordUserId)?.email;
}

export function setAmPendingEmail(discordUserId: string, email: string, sessionId?: string): void {
  pendingAmSessions.set(discordUserId, {
    email: email.toLowerCase().trim(),
    sessionId,
  });
}

export function clearAmPendingEmail(discordUserId: string): void {
  pendingAmSessions.delete(discordUserId);
}

/**
 * Mengirimkan magic link verifikasi Alight Motion ke email user via amprem-api
 */
export async function sendVerificationLink(email: string, discordUserId?: string) {
  const cleanEmail = email.trim().toLowerCase();

  const response = await fetch(`${AMPREM_API_BASE}/api/am/send-link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: cleanEmail,
      senderId: discordUserId,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const errorMsg =
      data?.message || data?.error || `Gagal mengirim link verifikasi (${response.status})`;
    throw new Error(errorMsg);
  }

  if (discordUserId) {
    setAmPendingEmail(discordUserId, cleanEmail, data.sessionId);
  }

  return {
    ok: true,
    email: cleanEmail,
    sessionId: data.sessionId,
    message: data.message,
  };
}

/**
 * Memverifikasi tautan magic link dan mengaktifkan lisensi Alight Motion Pro VIP via amprem-api
 */
export async function verifyMagicLink(email: string, magicLink: string, discordUserId?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const session = discordUserId ? pendingAmSessions.get(discordUserId) : undefined;

  const response = await fetch(`${AMPREM_API_BASE}/api/am/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      link: magicLink.trim(),
      email: cleanEmail || session?.email,
      sessionId: session?.sessionId,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const errorMsg =
      result?.message || result?.error || `Gagal memverifikasi tautan (${response.status})`;
    throw new Error(errorMsg);
  }

  const u = result.data || {};
  const formattedUserData = {
    uid: u.uid || "-",
    email: u.email || cleanEmail,
    status: u.status || "ACTIVE",
    tier: u.tier || "Alight Motion Pro VIP",
    subscription: u.subscription || "Yearly VIP License",
    orderId: u.orderId || null,
    validUntil: u.validUntil || "1 Tahun ke depan",
    stats: u.stats,
  };

  return {
    ok: true,
    isPremium: Boolean(result.isPremium ?? true),
    userData: formattedUserData,
    premiumError: result.isPremium === false ? result.message : null,
  };
}

export interface PresetItem {
  url: string;
  type: string;
  source: string;
  label: string;
  context: string;
  author?: string;
  isCreator?: boolean;
}

export interface FindPresetResult {
  video: {
    id: string;
    url: string;
    title: string;
    author: {
      id?: string;
      username: string;
      nickname?: string;
      avatar?: string;
    };
    cover?: string;
    stats?: {
      likes?: number;
      comments?: number;
      shares?: number;
      views?: number;
    };
  };
  presets: PresetItem[];
  totalPresetsFound: number;
  totalCommentsScanned: number;
  caption: string;
  formattedText: string;
}

/**
 * Mencari tautan preset Alight Motion dari caption & komentar video TikTok via amprem-api
 */
export async function findAlightPresets(tiktokUrl: string): Promise<FindPresetResult> {
  const cleanUrl = tiktokUrl.trim();

  const response = await fetch(`${AMPREM_API_BASE}/api/am/preset/find`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      url: cleanUrl,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const errorMsg =
      result?.message || result?.error || `Gagal mencari preset dari TikTok (${response.status})`;
    throw new Error(errorMsg);
  }

  return result.data as FindPresetResult;
}
