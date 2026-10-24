import crypto from "crypto";

export interface BypassHop {
  url: string;
  type: string;
  label: string;
}

export interface BypassVariant {
  name: string;
  url: string;
}

export interface BypassResult {
  success: boolean;
  originalUrl: string;
  directDownloadUrl: string;
  destinationUrl: string;
  filename: string;
  filesize?: string;
  filetype?: string;
  isDirectDownload: boolean;
  executionTimeMs: number;
  chain: BypassHop[];
  variants?: BypassVariant[];
}

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/**
 * Normalisasi dan bersihkan input URL dari user (hapus bracket, markdown, tambah protocol jika absen)
 */
export function normalizeInputUrl(raw: string): string {
  if (!raw) return "";
  let cleaned = raw.trim();

  // Strip markdown link brackets e.g. [https://...] or <https://...>
  cleaned = cleaned.replace(/^[<\[("'\s]+|[>\])"'\s]+$/g, "").trim();

  // If user pasted something like "LINK SCRIPT : [https://sfl.gl/xPULq]"
  const urlMatch = cleaned.match(/https?:\/\/[^\s<>"'\])]+/i);
  if (urlMatch) {
    return urlMatch[0];
  }

  cleaned = cleaned.replace(/^[\/\\\[(<"']+/g, "").trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }

  try {
    new URL(cleaned);
    return cleaned;
  } catch (_) {
    return raw.trim();
  }
}

/**
 * Format bytes into human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch dengan retry otomatis untuk mengatasi socket drop (ECONNRESET) sementara
 */
async function fetchWithRetry(url: string, init?: RequestInit, maxRetries = 2): Promise<Response> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await sleep(1000);
      }
    }
  }
  throw lastError;
}

/**
 * Cookie parsing helper
 */
function parseCookies(cookieHeaders: any): Record<string, string> {
  if (!cookieHeaders) return {};
  const cookies: Record<string, string> = {};
  const parts = Array.isArray(cookieHeaders) ? cookieHeaders : [cookieHeaders];
  for (const part of parts) {
    const rawPairs = String(part).split(/,(?=\s*[a-zA-Z0-9_-]+=)/);
    for (const raw of rawPairs) {
      const match = raw.trim().match(/^([^=]+)=([^;]+)/);
      if (match) {
        cookies[match[1].trim()] = match[2].trim();
      }
    }
  }
  return cookies;
}

function stringifyCookies(cookieObj: Record<string, string>): string {
  return Object.entries(cookieObj)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

/**
 * Buat session token untuk Khaddavi / Safelinku
 */
function makeSafelinkuSessionToken(xsrfToken: string): string {
  const dummyData =
    "webgl:Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11)||audio:124.043||canvas:cf4c6f||fonts:Arial,Calibri||system:Win32||env:chrome||network:4g";
  const c = crypto.createHash("sha256").update(dummyData).digest("hex");
  const u = "#" + Buffer.from(c).toString("base64");
  const decoded = decodeURIComponent(xsrfToken || "");
  return decoded.slice(0, 128 - u.length) + u;
}

/**
 * Cek apakah sebuah URL mengarah ke file hosting atau file arsip
 */
function isFileOrHostUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("mediafire.com/file/") ||
    lower.includes("mediafire.com/download/") ||
    lower.includes("drive.google.com/") ||
    lower.includes("sfile.mobi/") ||
    lower.includes("sfile.co/") ||
    lower.includes("safefileku.com/") ||
    lower.includes("pixeldrain.com/u/") ||
    lower.includes("krakenfiles.com/view/") ||
    lower.includes("dropbox.com/s/") ||
    lower.includes("dropbox.com/scl/") ||
    /\.(zip|apk|rar|7z|tar|gz|exe|bin|iso)(?:$|[?#])/i.test(url)
  );
}

/**
 * Ekstraksi nama file dari path URL
 */
function extractFilenameFromUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const pathname = u.pathname;
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && last.includes(".") && !last.endsWith(".html") && !last.endsWith(".php")) {
      return decodeURIComponent(last);
    }
    if (last) {
      return decodeURIComponent(last);
    }
  } catch (_) {}
  return "File_Unduhan";
}

/**
 * Deteksi tipe ekstensi file
 */
function detectFileType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".zip")) return "ZIP Archive 📦";
  if (lower.endsWith(".apk")) return "Android APK 📱";
  if (lower.endsWith(".rar")) return "RAR Archive 📦";
  if (lower.endsWith(".7z")) return "7-Zip Archive 📦";
  if (lower.endsWith(".tar") || lower.endsWith(".gz")) return "Tarball Archive 📦";
  if (lower.endsWith(".pdf")) return "PDF Document 📄";
  if (lower.endsWith(".mp4") || lower.endsWith(".mkv")) return "Video File 🎬";
  if (lower.endsWith(".mp3") || lower.endsWith(".wav")) return "Audio File 🎵";
  return "File Unduhan 📄";
}

/**
 * Resolver 1: Mediafire Direct CDN Link
 */
async function resolveMediafire(url: string): Promise<{ directUrl: string; filename: string; filesize?: string } | null> {
  try {
    const res = await fetchWithRetry(url, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const directMatch =
      html.match(/aria-label=["']Download file["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/id=["']downloadButton["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/href=["'](https?:\/\/[^"']*download[^"']*mediafire\.com\/[^"']+)["']/i) ||
      html.match(/class=["'][^"']*download_link[^"']*["'][^>]*href=["']([^"']+)["']/i);

    if (!directMatch) return null;

    const directUrl = directMatch[1].replace(/&amp;/g, "&");

    // Filename extraction
    const fnMatch =
      html.match(/<div class=["']filename["'][^>]*>([^<]+)<\/div>/i) ||
      html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i);
    let filename = fnMatch ? fnMatch[1].trim() : extractFilenameFromUrl(directUrl);
    if (!filename.includes(".") && !directUrl.endsWith(filename)) {
      filename = `${filename}.zip`;
    }

    // Size extraction
    const sizeMatch =
      html.match(/File size:\s*<span>([^<]+)<\/span>/i) ||
      html.match(/details["']>.*?<span>([^<]+)<\/span>/s) ||
      html.match(/\(([0-9.]+\s*(?:KB|MB|GB|B))\)/i);
    const filesize = sizeMatch ? sizeMatch[1].trim() : undefined;

    return { directUrl, filename, filesize };
  } catch (err) {
    console.error("Error resolving Mediafire:", err);
    return null;
  }
}

/**
 * Resolver 2: Google Drive Direct Link
 */
function resolveGoogleDrive(url: string): { directUrl: string; filename: string } | null {
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
    url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);

  if (!match) return null;
  const fileId = match[1];
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  return {
    directUrl,
    filename: `GoogleDrive_File_${fileId.slice(0, 8)}.zip`,
  };
}

/**
 * Resolver 3: Pixeldrain Direct Link
 */
function resolvePixeldrain(url: string): { directUrl: string; filename: string } | null {
  const match = url.match(/pixeldrain\.com\/u\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  const fileId = match[1];
  const directUrl = `https://pixeldrain.com/api/file/${fileId}?download=1`;
  return {
    directUrl,
    filename: `Pixeldrain_${fileId}.zip`,
  };
}

/**
 * Resolver 4: Dropbox Direct Link
 */
function resolveDropbox(url: string): { directUrl: string; filename: string } | null {
  if (!url.includes("dropbox.com/s/") && !url.includes("dropbox.com/scl/")) return null;
  const directUrl = url.includes("dl=0")
    ? url.replace(/([?&])dl=0/g, "$1dl=1")
    : url.includes("dl=1")
    ? url
    : `${url}${url.includes("?") ? "&" : "?"}dl=1`;
  return {
    directUrl,
    filename: extractFilenameFromUrl(url),
  };
}

/**
 * Resolver 5: Sfile.mobi & Sfile.co Direct Link
 */
async function resolveSfile(url: string): Promise<{ directUrl: string; filename: string; filesize?: string } | null> {
  try {
    const res = await fetchWithRetry(url, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const titleMatch =
      html.match(/<h1 class=["'][^"']*text-xs-center[^"']*["']>([^<]+)<\/h1>/i) ||
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
      html.match(/<meta property=["']og:title["'] content=["']([^"']+)["']/i);
    let filename = titleMatch ? titleMatch[1].replace(/^Download\s+/i, "").trim() : extractFilenameFromUrl(url);
    if (!filename.includes(".")) filename = `${filename}.zip`;

    const sizeMatch = html.match(/\(([0-9.]+\s*(?:KB|MB|GB|B))\)/i);
    const filesize = sizeMatch ? sizeMatch[1].trim() : undefined;

    let nextStepUrl = url;
    const dwMatch = html.match(/data-dw-url=["']([^"']+)["']/i);
    const dlMatch =
      html.match(/id=["']download["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/class=["'][^"']*btn-primary download[^"']*["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/href=["'](https?:\/\/[^"']*(?:sfile\.mobi|sfile\.co)\/download\/[^"']+)["']/i);

    if (dwMatch && dwMatch[1] && dwMatch[1] !== "#") {
      nextStepUrl = dwMatch[1];
    } else if (dlMatch && dlMatch[1] && dlMatch[1] !== "#") {
      nextStepUrl = dlMatch[1];
    }

    if (nextStepUrl.includes("/download/") && !nextStepUrl.includes("fid=")) {
      const step2Res = await fetchWithRetry(nextStepUrl, {
        headers: { "User-Agent": DEFAULT_USER_AGENT, Referer: url },
      });
      if (step2Res.ok) {
        const step2Html = await step2Res.text();
        const directBtn =
          step2Html.match(/id=["']download-btn["'][^>]*href=["']([^"']+)["']/i) ||
          step2Html.match(/href=["'](https?:\/\/[^"']*\/download\/[^"']+)["']/i);
        if (directBtn) {
          nextStepUrl = directBtn[1];
        }
      }
    }

    return { directUrl: nextStepUrl, filename, filesize };
  } catch (err) {
    console.error("Error resolving Sfile:", err);
    return null;
  }
}

/**
 * Resolver 6: Sub2Unlock, Sub4Unlock & Social Unlock Gates
 */
async function resolveSub2Unlock(url: string): Promise<string | null> {
  try {
    const res = await fetchWithRetry(url, {
      headers: { "User-Agent": DEFAULT_USER_AGENT },
    });
    if (!res.ok) return null;
    const html = await res.text();

    const patterns = [
      /<div id=["']the_link["'][^>]*>([^<]+)<\/div>/i,
      /var\s+link\s*=\s*["'](https?:\/\/[^"']+)["']/i,
      /destination\s*=\s*["'](https?:\/\/[^"']+)["']/i,
      /target_url\s*=\s*["'](https?:\/\/[^"']+)["']/i,
      /data-url=["'](https?:\/\/[^"']+)["']/i,
      /href=["'](https?:\/\/[^"']+)["'][^>]*id=["']btn-unlock["']/i,
      /href=["'](https?:\/\/[^"']+)["'][^>]*class=["'][^"']*btn-unlock/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && (match[1].startsWith("http://") || match[1].startsWith("https://"))) {
        return match[1].trim();
      }
    }
  } catch (err) {
    console.error("Error resolving Sub2Unlock:", err);
  }
  return null;
}

/**
 * Helper untuk fetch dengan multi-tier fallback (Google Translate & Jina Reader) saat menghadapi proteksi Cloudflare 403 / Turnstile
 */
async function fetchWithCloudflareFallback(url: string, headers: Record<string, string>): Promise<string> {
  let html = "";
  try {
    const res = await fetchWithRetry(url, { headers });
    if (res.status === 200) {
      html = await res.text();
    }
  } catch (_) {}

  // Jika terkena Cloudflare 403, 503, atau halaman tantangan bot
  if (!html || html.includes("<title>Just a moment...</title>") || html.includes("challenge-platform")) {
    // 1. Coba Google Translate proxy crawler
    try {
      const gUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(url)}`;
      const gRes = await fetchWithRetry(gUrl, {
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      if (gRes.ok) {
        const gText = await gRes.text();
        if (gText && !gText.includes("<title>Just a moment...</title>")) {
          html = gText;
        }
      }
    } catch (_) {}

    // 2. Coba Jina Reader jika Google Translate gagal atau masih terhalang Cloudflare
    if (!html || html.includes("<title>Just a moment...</title>")) {
      try {
        const jUrl = `https://r.jina.ai/${url}`;
        const jRes = await fetchWithRetry(jUrl, {
          headers: {
            "User-Agent": DEFAULT_USER_AGENT,
            "X-Return-Format": "html",
          },
        });
        if (jRes.ok) {
          const jText = await jRes.text();
          if (jText && !jText.includes("<title>Just a moment...</title>")) {
            html = jText;
          }
        }
      } catch (_) {}
    }
  }

  return html;
}

/**
 * Resolver Safefileku (safefileku.com): Ekstrak nama file asli dan ukuran file
 */
async function resolveSafefileku(url: string): Promise<{ filename: string; filesize?: string; destinationUrl: string } | null> {
  if (!url.includes("safefileku.com")) return null;
  try {
    const html = await fetchWithCloudflareFallback(url, { "User-Agent": DEFAULT_USER_AGENT });
    if (!html) return null;

    const titleMatch =
      html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
      html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    let filename = titleMatch
      ? titleMatch[1].replace(/\s*-\s*Safefileku$/i, "").trim()
      : extractFilenameFromUrl(url);

    const sizeMatch =
      html.match(/Size<\/div>\s*<div[^>]*>([^<]+)<\/div>/i) ||
      html.match(/class=["'][^"']*size[^"']*["'][^>]*>([^<]+)<\/div>/i);
    const filesize = sizeMatch ? sizeMatch[1].trim() : undefined;

    return { filename, filesize, destinationUrl: url };
  } catch (_) {
    return null;
  }
}

/**
 * Resolver 7: Safelinku & Khaddavi Gate Bypasser (sfl.gl, safelinku.com, khaddavi.net)
 */
async function resolveSafelinku(
  urlStr: string,
  chain: BypassHop[]
): Promise<string | null> {
  try {
    // 1. Fetch initial sfl.gl / safelinku URL (didukung fallback crawler anti-Cloudflare)
    const html1 = await fetchWithCloudflareFallback(urlStr, {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    });

    let rayId = html1.match(/name=["']ray_id["']\s+value=["']([^"']+)["']/i)?.[1];
    let alias = html1.match(/name=["']alias["']\s+value=["']([^"']+)["']/i)?.[1];
    let actionUrl =
      html1.match(/action=["'](https?:\/\/[^"']+)["']/i)?.[1] ||
      "https://app.khaddavi.net/redirect.php";

    if (!alias) {
      try {
        const u = new URL(urlStr);
        alias = u.pathname.split("/").filter(Boolean).pop() || u.searchParams.get("alias") || undefined;
      } catch (_) {}
    }

    if (!rayId || !alias) {
      return null;
    }

    const gateOrigin = new URL(actionUrl).origin;
    const redirectGateUrl = `${actionUrl}?ray_id=${rayId}&alias=${alias}`;

    // 2. Fetch redirect gate & dapatkan session cookie
    const res2 = await fetchWithRetry(redirectGateUrl, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: urlStr,
      },
      redirect: "manual",
    });

    const loc2 = res2.headers.get("location") || "";
    const getSetCookieFn = (res2.headers as any).getSetCookie;
    const cookies = parseCookies(
      typeof getSetCookieFn === "function" ? getSetCookieFn.call(res2.headers) : res2.headers.get("set-cookie")
    );
    if (!cookies["__session"]) cookies["__session"] = rayId;

    const blogUrl1 = new URL(loc2, gateOrigin).toString();
    const res3 = await fetchWithRetry(blogUrl1, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: redirectGateUrl,
        Cookie: stringifyCookies(cookies),
      },
    });

    const getSetCookie3Fn = (res3.headers as any).getSetCookie;
    Object.assign(
      cookies,
      parseCookies(
        typeof getSetCookie3Fn === "function" ? getSetCookie3Fn.call(res3.headers) : res3.headers.get("set-cookie")
      )
    );

    // 3. Request /api/session (Step 1)
    const token1 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    const resSession1 = await fetchWithRetry(`${gateOrigin}/api/session`, {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: blogUrl1,
        Origin: gateOrigin,
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _token: token1 }),
    });

    const getSetCookieS1Fn = (resSession1.headers as any).getSetCookie;
    Object.assign(
      cookies,
      parseCookies(
        typeof getSetCookieS1Fn === "function" ? getSetCookieS1Fn.call(resSession1.headers) : resSession1.headers.get("set-cookie")
      )
    );

    // Jeda aman untuk server timer
    await sleep(1500);

    // 4. Request /api/verify
    const resVerify = await fetchWithRetry(`${gateOrigin}/api/verify`, {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: blogUrl1,
        Origin: gateOrigin,
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _a: 0 }),
    });

    const verifyData = (await resVerify.json().catch(() => ({}))) as any;
    const getSetCookieVFn = (resVerify.headers as any).getSetCookie;
    Object.assign(
      cookies,
      parseCookies(
        typeof getSetCookieVFn === "function" ? getSetCookieVFn.call(resVerify.headers) : resVerify.headers.get("set-cookie")
      )
    );

    const targetPage2 = verifyData.target || "/redirect.php";
    const blogUrl2 = new URL(targetPage2, gateOrigin).toString();

    // 5. Follow target redirect ke Page 2
    const resPage2 = await fetchWithRetry(blogUrl2, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: blogUrl1,
        Cookie: stringifyCookies(cookies),
      },
      redirect: "follow",
    });

    const getSetCookieP2Fn = (resPage2.headers as any).getSetCookie;
    Object.assign(
      cookies,
      parseCookies(
        typeof getSetCookieP2Fn === "function" ? getSetCookieP2Fn.call(resPage2.headers) : resPage2.headers.get("set-cookie")
      )
    );

    // 6. Request /api/session (Step 2)
    const token2 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    const resSession2 = await fetchWithRetry(`${gateOrigin}/api/session`, {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: resPage2.url,
        Origin: gateOrigin,
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _token: token2 }),
    });

    const getSetCookieS2Fn = (resSession2.headers as any).getSetCookie;
    Object.assign(
      cookies,
      parseCookies(
        typeof getSetCookieS2Fn === "function" ? getSetCookieS2Fn.call(resSession2.headers) : resSession2.headers.get("set-cookie")
      )
    );

    // Jeda aman untuk step 2
    await sleep(2500);

    // 7. Request /api/go untuk mendapatkan link ready/go akhir
    const key = Math.floor(Math.random() * 1000);
    const size = `${(1920 + key) * 2}.${(1080 + key) * 2}`;
    const resGo = await fetchWithRetry(`${gateOrigin}/api/go`, {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: resPage2.url,
        Origin: gateOrigin,
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ key, size, ado: null }),
    });

    const goData = (await resGo.json().catch(() => ({}))) as any;
    if (!goData.url) return null;

    const readyGoUrl = goData.url;

    // 8. Fetch ready/go untuk ekstrak tautan tujuan asli (destination URL)
    let readyHtml = "";
    try {
      const resReady = await fetchWithRetry(readyGoUrl, {
        headers: { "User-Agent": DEFAULT_USER_AGENT },
      });
      if (resReady.ok) {
        readyHtml = await resReady.text();
      }
    } catch (_) {}

    if (!readyHtml.includes("location.href") && !readyHtml.includes("window.location")) {
      readyHtml = await fetchWithCloudflareFallback(readyGoUrl, {
        "User-Agent": DEFAULT_USER_AGENT,
      });
    }

    const destMatch =
      readyHtml.match(/location\.href\s*=\s*["']([^"']+)["']/i) ||
      readyHtml.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);

    if (destMatch && destMatch[1]) {
      const destinationUrl = destMatch[1].replace(/\\\//g, "/");
      const gateHost = new URL(redirectGateUrl).hostname;
      chain.push({
        url: redirectGateUrl,
        type: "Safelink Gateway",
        label: `Melewati Verifikasi Gateway (${gateHost})`,
      });
      chain.push({
        url: destinationUrl,
        type: "Safelink Destination",
        label: "Tujuan Asli Shortlink Terbuka",
      });
      return destinationUrl;
    }
  } catch (err) {
    console.error("Error in resolveSafelinku:", err);
  }
  return null;
}

/**
 * Resolver Universal: Memindai halaman web/blog/shortlink apa pun
 * untuk mengekstrak Link Unduhan File Hosting, Meta Refresh, atau Tombol Get Link
 */
async function resolveGenericLandingOrShortlinkPage(
  urlStr: string
): Promise<{ redirectUrl?: string; primaryFileUrl?: string; variants?: BypassVariant[]; label?: string } | null> {
  try {
    let html = "";
    try {
      const res = await fetchWithRetry(urlStr, {
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (
          contentType.includes("text/html") ||
          contentType.includes("application/xhtml") ||
          contentType === ""
        ) {
          html = await res.text();
        }
      }
    } catch (_) {}

    // Fallback crawler jika blog atau landing page diproteksi Cloudflare Under Attack
    if (!html || html.includes("<title>Just a moment...</title>")) {
      html = await fetchWithCloudflareFallback(urlStr, {
        "User-Agent": DEFAULT_USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      });
    }

    if (!html) return null;

    // 1. PRIORITAS UTAMA: Ekstraksi Item Unduhan & Varian File Hosting
    // (Mediafire, GDrive, Sfile, Pixeldrain, Dropbox, dsb)
    const variants: BypassVariant[] = [];
    const seenUrls = new Set<string>();

    function addVariant(name: string, url: string) {
      let fullUrl = url.trim();
      if (fullUrl.startsWith("//")) fullUrl = "https:" + fullUrl;
      if (fullUrl.startsWith("/")) {
        try {
          fullUrl = new URL(fullUrl, urlStr).toString();
        } catch (_) {}
      }
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) return;
      if (seenUrls.has(fullUrl)) return;
      seenUrls.add(fullUrl);
      variants.push({
        name: name.replace(/<[^>]+>/g, "").trim() || `Pilihan ${variants.length + 1}`,
        url: fullUrl,
      });
    }

    // A. Cari blok item download terstruktur (seperti download-item di blog skin ML/game)
    const items = html
      .split(
        /class=["'][^"']*(?:download-item|download_box|link-item|dl-item|script-item)[^"']*["']/i
      )
      .slice(1);
    for (const block of items) {
      const chunk = block.slice(0, 1500);
      const nameMatch =
        chunk.match(/class=["'][^"']*(?:script-name|file-name|title|name)[^"']*["'][^>]*>([^<]+)<\/div>/i) ||
        chunk.match(/<h[2-6][^>]*>([^<]+)<\/h[2-6]>/i);
      const linkMatch = chunk.match(/href=["'](https?:\/\/[^"']+)["']/i);
      if (linkMatch && isFileOrHostUrl(linkMatch[1])) {
        addVariant(nameMatch ? nameMatch[1] : "File Unduhan", linkMatch[1]);
      }
    }

    // B. Cari semua tag <a> yang mengarah ke file host atau direct archive
    const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let aMatch;
    while ((aMatch = anchorRegex.exec(html)) !== null) {
      const href = aMatch[1];
      const text = aMatch[2].replace(/<[^>]+>/g, "").trim();
      if (isFileOrHostUrl(href)) {
        const cleanName = text.length > 2 && text.length < 50 ? text : "File Unduhan";
        addVariant(cleanName, href);
      }
    }

    // Jika ditemukan tautan file unduhan di halaman ini, prioritaskan!
    if (variants.length > 0) {
      return {
        primaryFileUrl: variants[0].url,
        variants,
      };
    }

    // 2. JIKA BUKAN HALAMAN DOWNLOAD: Periksa apakah ini halaman pengalihan / gate
    // A. Cek Button "Get Link" atau tombol tujuan di halaman iklan
    const getLinkMatch =
      html.match(
        /<a[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*class=["'][^"']*(?:get-link|btn-main|go-link|download-btn)[^"']*["']/i
      ) ||
      html.match(
        /<a[^>]*class=["'][^"']*(?:get-link|btn-main|go-link|download-btn)[^"']*["'][^>]*href=["'](https?:\/\/[^"']+)["']/i
      ) ||
      html.match(
        /<a[^>]*id=["'](?:get-link|btn-main|btn-download|downloadButton)["'][^>]*href=["'](https?:\/\/[^"']+)["']/i
      );
    if (getLinkMatch && getLinkMatch[1]) {
      const target = getLinkMatch[1].trim();
      if (target !== urlStr && (isFileOrHostUrl(target) || target.startsWith("http"))) {
        return { redirectUrl: target, label: "Tombol Get Link / Tujuan Terbuka" };
      }
    }

    // B. Cek Meta Refresh: <meta http-equiv="refresh" content="0;url=...">
    const metaMatch = html.match(
      /<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']\d+;\s*url=([^"']+)["']/i
    );
    if (metaMatch && metaMatch[1]) {
      try {
        const redirectUrl = new URL(metaMatch[1].trim(), urlStr).toString();
        if (
          redirectUrl !== urlStr &&
          !redirectUrl.includes("google.com") &&
          !redirectUrl.includes("facebook.com")
        ) {
          return { redirectUrl, label: "Meta Refresh Redirect" };
        }
      } catch (_) {}
    }
  } catch (err) {
    console.error("Error in resolveGenericLandingOrShortlinkPage:", err);
  }
  return null;
}

/**
 * Resolver 8: Query Parameter Unwrapper (e.g. ?url=, ?r=, base64)
 */
function unwrapQueryParams(urlStr: string): string | null {
  try {
    const u = new URL(urlStr);
    const redirectKeys = [
      "url",
      "r",
      "dest",
      "link",
      "target",
      "to",
      "u",
      "safe",
      "redirect",
      "href",
      "go",
      "out",
    ];

    for (const k of redirectKeys) {
      const val = u.searchParams.get(k);
      if (val) {
        if (val.startsWith("http://") || val.startsWith("https://")) {
          return val;
        }
        // Base64 decode attempt
        try {
          const decoded = Buffer.from(val, "base64").toString("utf-8");
          if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
            return decoded;
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  return null;
}

/**
 * Resolver 9: Follow Single HTTP Redirect (301/302/303/307/308)
 */
async function followHttpRedirect(urlStr: string): Promise<string | null> {
  try {
    const res = await fetchWithRetry(urlStr, {
      method: "HEAD",
      redirect: "manual",
      headers: { "User-Agent": DEFAULT_USER_AGENT },
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (location) {
        return new URL(location, urlStr).toString();
      }
    }
  } catch (_) {
    try {
      const res = await fetchWithRetry(urlStr, {
        method: "GET",
        redirect: "manual",
        headers: { "User-Agent": DEFAULT_USER_AGENT },
      });
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get("location");
        if (location) {
          return new URL(location, urlStr).toString();
        }
      }
    } catch (_) {}
  }
  return null;
}

/**
 * Periksa metadata file langsung (Content-Length, Content-Disposition)
 */
async function inspectDirectFile(urlStr: string): Promise<{ filename?: string; filesize?: string }> {
  try {
    const res = await fetchWithRetry(urlStr, {
      method: "HEAD",
      headers: { "User-Agent": DEFAULT_USER_AGENT },
    });

    let filename: string | undefined;
    let filesize: string | undefined;

    const disposition = res.headers.get("content-disposition");
    if (disposition) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match) {
        filename = match[1].trim();
      }
    }

    const length = res.headers.get("content-length");
    if (length && !isNaN(Number(length))) {
      filesize = formatBytes(Number(length));
    }

    return { filename, filesize };
  } catch (_) {
    return {};
  }
}

/**
 * Main Bypass Engine (Multi-Tier Universal Link Resolver)
 */
export async function bypassLink(initialUrl: string): Promise<BypassResult> {
  const startTime = Date.now();
  const cleanUrl = normalizeInputUrl(initialUrl);

  if (!cleanUrl || (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://"))) {
    throw new Error("URL tidak valid. Masukkan link lengkap (contoh: https://sfl.gl/xxxx atau https://mediafire.com/file/xxxx)");
  }

  const chain: BypassHop[] = [
    {
      url: cleanUrl,
      type: "Initial Link",
      label: "Link Awal",
    },
  ];

  let currentUrl = cleanUrl;
  let filename = extractFilenameFromUrl(cleanUrl);
  let filesize: string | undefined;
  let isDirectDownload = false;
  let destinationUrl = cleanUrl;
  let directDownloadUrl = cleanUrl;
  let variants: BypassVariant[] | undefined;

  const maxHops = 10;
  let hopCount = 0;
  const visitedUrls = new Set<string>();

  while (hopCount < maxHops) {
    hopCount++;
    if (visitedUrls.has(currentUrl)) {
      break;
    }
    visitedUrls.add(currentUrl);

    // 1. Cek Mediafire
    if (currentUrl.includes("mediafire.com/file/") || currentUrl.includes("mediafire.com/download/")) {
      const mf = await resolveMediafire(currentUrl);
      if (mf) {
        filename = mf.filename || filename;
        filesize = mf.filesize || filesize;
        directDownloadUrl = mf.directUrl;
        destinationUrl = currentUrl;
        isDirectDownload = true;
        chain.push({
          url: mf.directUrl,
          type: "Mediafire Direct CDN",
          label: "Mediafire Direct Link",
        });
        break;
      }
    }

    // 2. Cek Sfile.mobi
    if (currentUrl.includes("sfile.mobi") || currentUrl.includes("sfile.co")) {
      const sf = await resolveSfile(currentUrl);
      if (sf) {
        filename = sf.filename || filename;
        filesize = sf.filesize || filesize;
        directDownloadUrl = sf.directUrl;
        destinationUrl = currentUrl;
        isDirectDownload = true;
        chain.push({
          url: sf.directUrl,
          type: "Sfile Direct",
          label: "Sfile Direct Link",
        });
        break;
      }
    }

    // 3. Cek Google Drive
    if (currentUrl.includes("drive.google.com")) {
      const gd = resolveGoogleDrive(currentUrl);
      if (gd) {
        filename = gd.filename || filename;
        directDownloadUrl = gd.directUrl;
        destinationUrl = currentUrl;
        isDirectDownload = true;
        chain.push({
          url: gd.directUrl,
          type: "Google Drive Direct",
          label: "Google Drive Direct Link",
        });
        break;
      }
    }

    // 4. Cek Pixeldrain
    if (currentUrl.includes("pixeldrain.com/u/")) {
      const pd = resolvePixeldrain(currentUrl);
      if (pd) {
        filename = pd.filename || filename;
        directDownloadUrl = pd.directUrl;
        destinationUrl = currentUrl;
        isDirectDownload = true;
        chain.push({
          url: pd.directUrl,
          type: "Pixeldrain Direct",
          label: "Pixeldrain Direct Link",
        });
        break;
      }
    }

    // 5. Cek Dropbox
    if (currentUrl.includes("dropbox.com/s/") || currentUrl.includes("dropbox.com/scl/")) {
      const db = resolveDropbox(currentUrl);
      if (db) {
        filename = db.filename || filename;
        directDownloadUrl = db.directUrl;
        destinationUrl = currentUrl;
        isDirectDownload = true;
        chain.push({
          url: db.directUrl,
          type: "Dropbox Direct",
          label: "Dropbox Direct Link",
        });
        break;
      }
    }

    // 5.5 Cek Safefileku (safefileku.com)
    if (currentUrl.includes("safefileku.com")) {
      const sfk = await resolveSafefileku(currentUrl);
      if (sfk) {
        filename = sfk.filename || filename;
        filesize = sfk.filesize || filesize;
        destinationUrl = currentUrl;
        directDownloadUrl = currentUrl;
        isDirectDownload = false; // Halaman file host, bukan CDN direct stream
        chain.push({
          url: currentUrl,
          type: "Safefileku File Host",
          label: "Halaman File Safefileku Terbuka",
        });
        break;
      }
    }

    // 6. Cek Safelink / Khaddavi / AdSafeLink Engine Shortlinks
    if (
      currentUrl.includes("sfl.gl") ||
      currentUrl.includes("safelinku.com") ||
      currentUrl.includes("safelinkblogger.com") ||
      currentUrl.includes("khaddavi.net") ||
      currentUrl.includes("adsafelink.com") ||
      currentUrl.includes("gociwidey.com") ||
      currentUrl.includes("safelink")
    ) {
      const bypassedSfl = await resolveSafelinku(currentUrl, chain);
      if (bypassedSfl && bypassedSfl !== currentUrl) {
        currentUrl = bypassedSfl;
        destinationUrl = bypassedSfl;
        continue;
      }
    }

    // 7. Cek Sub2Unlock / Sub4Unlock & Social Gates
    if (
      currentUrl.includes("sub2unlock") ||
      currentUrl.includes("sub4unlock") ||
      currentUrl.includes("rekonise.com")
    ) {
      const unlockedUrl = await resolveSub2Unlock(currentUrl);
      if (unlockedUrl && unlockedUrl !== currentUrl) {
        chain.push({
          url: unlockedUrl,
          type: "Social Unlock Bypassed",
          label: "Sub2Unlock Berhasil Dibypass",
        });
        currentUrl = unlockedUrl;
        destinationUrl = unlockedUrl;
        continue;
      }
    }

    // 8. Cek Query Param Redirect Unwrapper (?url=, ?dest=, ?link=, dsb)
    const unwrapped = unwrapQueryParams(currentUrl);
    if (unwrapped && unwrapped !== currentUrl) {
      chain.push({
        url: unwrapped,
        type: "Parameter Unwrapped",
        label: "Ekstraksi URL Parameter",
      });
      currentUrl = unwrapped;
      destinationUrl = unwrapped;
      continue;
    }

    // 9. Follow HTTP 3xx Redirect (TinyURL, Bitly, Cuttly, dsb)
    const nextRedirect = await followHttpRedirect(currentUrl);
    if (nextRedirect && nextRedirect !== currentUrl) {
      chain.push({
        url: nextRedirect,
        type: "HTTP Redirect",
        label: "Pengalihan Otomatis (3xx)",
      });
      currentUrl = nextRedirect;
      destinationUrl = nextRedirect;
      continue;
    }

    // 10. Universal Web Page Inspector (Blog, Website Script Skin, Intermediate Landing Page)
    // Berlaku untuk domain apa pun yang memuat tombol unduh atau pengalihan (Meta Refresh / Get Link)
    const pageResolution = await resolveGenericLandingOrShortlinkPage(currentUrl);
    if (pageResolution) {
      if (pageResolution.primaryFileUrl && pageResolution.primaryFileUrl !== currentUrl) {
        if (pageResolution.variants && pageResolution.variants.length > 0) {
          variants = pageResolution.variants;
        }
        chain.push({
          url: pageResolution.primaryFileUrl,
          type: "Download Link Extracted",
          label: "Tautan Unduhan Ditemukan di Halaman",
        });
        currentUrl = pageResolution.primaryFileUrl;
        destinationUrl = pageResolution.primaryFileUrl;
        continue;
      }

      if (pageResolution.redirectUrl && pageResolution.redirectUrl !== currentUrl) {
        chain.push({
          url: pageResolution.redirectUrl,
          type: "Page Redirect",
          label: pageResolution.label || "Pengalihan Halaman Terdeteksi",
        });
        currentUrl = pageResolution.redirectUrl;
        destinationUrl = pageResolution.redirectUrl;
        continue;
      }
    }

    // Jika tidak ada rule yang cocok lagi, hentikan loop
    break;
  }

  // Jika URL tujuan berujung pada file langsung (.zip, .apk, .rar, dll)
  const pathnameOnly = currentUrl.split("?")[0].toLowerCase();
  const hasRealFileExt = /\.(zip|apk|rar|7z|tar|gz|pdf|mp4|mp3|exe|iso)$/i.test(pathnameOnly);
  const isKnownShortlink =
    currentUrl.includes("sfl.gl") ||
    currentUrl.includes("safelinku") ||
    currentUrl.includes("khaddavi") ||
    currentUrl.includes("adsafelink") ||
    currentUrl.includes("gociwidey") ||
    currentUrl.includes("sub2unlock") ||
    currentUrl.includes("rekonise");

  if (hasRealFileExt && !isKnownShortlink && !isDirectDownload) {
    directDownloadUrl = currentUrl;
    destinationUrl = currentUrl;
    isDirectDownload = true;
  }

  // Coba periksa file header jika direct download
  if (isDirectDownload && directDownloadUrl) {
    const inspected = await inspectDirectFile(directDownloadUrl);
    if (inspected.filename) filename = inspected.filename;
    if (inspected.filesize) filesize = inspected.filesize;
  }

  // Jika bypass berhasil melewati rintangan / shortlink (shortlink terurai ke file host / web tujuan)
  const hasBypassedGate = chain.length > 1 || destinationUrl !== cleanUrl;
  if (!directDownloadUrl) {
    directDownloadUrl = destinationUrl;
  }

  // VALIDASI MUTLAK: Hanya gagal jika tidak ada rintangan yang berhasil dilewati sama sekali
  if (!isDirectDownload && !hasBypassedGate) {
    throw new Error(
      "Tidak dapat mengekstrak file unduhan langsung dari tautan ini. Pastikan link masih aktif atau coba buka tautan sumbernya."
    );
  }

  const executionTimeMs = Date.now() - startTime;
  const filetype = detectFileType(filename);

  return {
    success: true,
    originalUrl: cleanUrl,
    directDownloadUrl,
    destinationUrl: destinationUrl || currentUrl,
    filename,
    filesize,
    filetype,
    isDirectDownload,
    executionTimeMs,
    chain,
    variants,
  };
}