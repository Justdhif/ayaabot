export interface BypassHop {
  url: string;
  type: string;
  label: string;
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
}

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

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
  } catch (_) {}
  return "Download_File.zip";
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
  return "Direct File 📄";
}

/**
 * Resolver 1: Mediafire Direct CDN Link
 */
async function resolveMediafire(url: string): Promise<{ directUrl: string; filename: string; filesize?: string } | null> {
  try {
    const res = await fetch(url, {
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
    const filename = fnMatch ? fnMatch[1].trim() : extractFilenameFromUrl(directUrl);

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
    filename: `GoogleDrive_File_${fileId.slice(0, 8)}`,
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
    filename: `Pixeldrain_${fileId}`,
  };
}

/**
 * Resolver 4: Sfile.mobi Direct Link
 */
async function resolveSfile(url: string): Promise<{ directUrl: string; filename: string; filesize?: string } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Sfile direct or download button
    const dlMatch =
      html.match(/id=["']download["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/class=["'][^"']*btn-primary download[^"']*["'][^>]*href=["']([^"']+)["']/i) ||
      html.match(/href=["'](https?:\/\/[^"']*sfile\.mobi\/download\/[^"']+)["']/i);

    if (!dlMatch) return null;
    let nextStepUrl = dlMatch[1];

    // Filename & size
    const titleMatch = html.match(/<h1 class=["'][^"']*text-xs-center[^"']*["']>([^<]+)<\/h1>/i);
    const filename = titleMatch ? titleMatch[1].trim() : extractFilenameFromUrl(url);

    const sizeMatch = html.match(/\(([0-9.]+\s*(?:KB|MB|GB|B))\)/i);
    const filesize = sizeMatch ? sizeMatch[1].trim() : undefined;

    // Follow step 2 if needed
    if (nextStepUrl.includes("sfile.mobi/download/")) {
      const step2Res = await fetch(nextStepUrl, {
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
 * Resolver 5: Sub2Unlock, Sub4Unlock & Social Unlock Gates
 */
async function resolveSub2Unlock(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
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
 * Resolver 6: Query Parameter Unwrapper (e.g. ?url=, ?r=, base64)
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
 * Resolver 7: Follow Single HTTP Redirect (301/302/303/307/308)
 */
async function followHttpRedirect(urlStr: string): Promise<string | null> {
  try {
    const res = await fetch(urlStr, {
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
    // If HEAD fails, attempt GET without downloading body
    try {
      const res = await fetch(urlStr, {
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
    const res = await fetch(urlStr, {
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
 * Main Bypass Engine (Multi-Tier Recursive Link Resolver)
 */
export async function bypassLink(initialUrl: string): Promise<BypassResult> {
  const startTime = Date.now();
  const cleanUrl = initialUrl.trim();

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

  const maxHops = 8;
  let hopCount = 0;

  while (hopCount < maxHops) {
    hopCount++;

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

    // 5. Cek Sub2Unlock / Sub4Unlock
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
        continue; // Lanjutkan rekursi untuk cek apakah targetnya adalah Mediafire/GDrive
      }
    }

    // 6. Cek Query Param Redirect Unwrapper
    const unwrapped = unwrapQueryParams(currentUrl);
    if (unwrapped && unwrapped !== currentUrl) {
      chain.push({
        url: unwrapped,
        type: "Parameter Unwrapped",
        label: "Ekstraksi URL Parameter",
      });
      currentUrl = unwrapped;
      continue;
    }

    // 7. Follow HTTP 3xx Redirect
    const nextRedirect = await followHttpRedirect(currentUrl);
    if (nextRedirect && nextRedirect !== currentUrl) {
      chain.push({
        url: nextRedirect,
        type: "HTTP Redirect",
        label: "Pengalihan Otomatis (3xx)",
      });
      currentUrl = nextRedirect;
      continue;
    }

    // Jika tidak ada rule khusus yang cocok lagi, hentikan loop
    break;
  }

  // Jika URL tujuan berujung pada file langsung (.zip, .apk, .rar, dll)
  const isDirectFileFormat =
    /\.(zip|apk|rar|7z|tar|gz|pdf|mp4|mp3|exe|iso)$/i.test(currentUrl) ||
    currentUrl.includes("download") ||
    isDirectDownload;

  if (isDirectFileFormat && !isDirectDownload) {
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
  };
}
