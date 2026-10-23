import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

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

function makeSafelinkuSessionToken(xsrfToken: string): string {
  const dummyData =
    "webgl:Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11)||audio:124.043||canvas:cf4c6f||fonts:Arial,Calibri||system:Win32||env:chrome||network:4g";
  const c = crypto.createHash("sha256").update(dummyData).digest("hex");
  const u = "#" + Buffer.from(c).toString("base64");
  const decoded = decodeURIComponent(xsrfToken || "");
  return decoded.slice(0, 128 - u.length) + u;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: NextRequest) {
  const urlStr = req.nextUrl.searchParams.get("url") || "https://sfl.gl/xPULq";
  const logs: any[] = [];

  try {
    logs.push({ step: "1. Fetch sfl.gl (with Google fallback)", url: urlStr });
    let html1 = "";
    try {
      const res1 = await fetch(urlStr, {
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      if (res1.status === 200) {
        html1 = await res1.text();
      }
      logs.push({ step: "1. Direct fetch status", status: res1.status, htmlLength: html1.length });
    } catch (e: any) {
      logs.push({ step: "1. Direct fetch error", error: e.message });
    }

    if (!html1.includes('name="ray_id"')) {
      logs.push({ step: "1b. Fetching via Google Translate proxy..." });
      const gUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(urlStr)}`;
      const gRes = await fetch(gUrl, {
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });
      if (gRes.ok) {
        html1 = await gRes.text();
      }
      logs.push({ step: "1b. Google proxy status", status: gRes.status, hasRayId: html1.includes('name="ray_id"') });
    }

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

    logs.push({ step: "1c. Extracted parameters", rayId, alias, actionUrl });

    if (!rayId || !alias) {
      return NextResponse.json({ success: false, reason: "Could not extract rayId or alias", logs });
    }

    const redirectGateUrl = `${actionUrl}?ray_id=${rayId}&alias=${alias}`;
    logs.push({ step: "2. Fetch gate", url: redirectGateUrl });

    const res2 = await fetch(redirectGateUrl, {
      headers: { "User-Agent": DEFAULT_USER_AGENT, Referer: urlStr },
      redirect: "manual",
    });

    const loc2 = res2.headers.get("location") || "";
    const rawCookies2 = (res2.headers as any).getSetCookie
      ? (res2.headers as any).getSetCookie()
      : res2.headers.get("set-cookie");
    const cookies = parseCookies(rawCookies2);
    if (!cookies["__session"]) cookies["__session"] = rayId;

    logs.push({ step: "2. Gate result", status: res2.status, location: loc2, cookies });

    if (!loc2) {
      return NextResponse.json({ success: false, reason: "No gate location", logs });
    }

    const blogUrl1 = new URL(loc2, "https://app.khaddavi.net").toString();
    logs.push({ step: "3. Fetch blog 1", url: blogUrl1 });

    const res3 = await fetch(blogUrl1, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: redirectGateUrl,
        Cookie: stringifyCookies(cookies),
      },
    });

    const rawCookies3 = (res3.headers as any).getSetCookie
      ? (res3.headers as any).getSetCookie()
      : res3.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawCookies3));

    logs.push({ step: "3. Blog 1 result", status: res3.status, hasXsrf: !!cookies["XSRF-TOKEN"] });

    // Step 4: /api/session 1
    const token1 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    const resSession1 = await fetch("https://app.khaddavi.net/api/session", {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: blogUrl1,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _token: token1 }),
    });

    const rawCookiesS1 = (resSession1.headers as any).getSetCookie
      ? (resSession1.headers as any).getSetCookie()
      : resSession1.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawCookiesS1));
    const s1Json = await resSession1.json().catch(() => ({}));
    logs.push({ step: "4. Session 1 result", status: resSession1.status, json: s1Json });

    await sleep(1500);

    // Step 5: /api/verify
    const resVerify = await fetch("https://app.khaddavi.net/api/verify", {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: blogUrl1,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _a: 0 }),
    });

    const rawCookiesV = (resVerify.headers as any).getSetCookie
      ? (resVerify.headers as any).getSetCookie()
      : resVerify.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawCookiesV));
    const verifyData = (await resVerify.json().catch(() => ({}))) as any;
    logs.push({ step: "5. Verify result", status: resVerify.status, verifyData });

    const targetPage2 = verifyData.target || "/redirect.php";
    const blogUrl2 = new URL(targetPage2, "https://app.khaddavi.net").toString();

    // Step 6: Follow target to Page 2
    const resPage2 = await fetch(blogUrl2, {
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: blogUrl1,
        Cookie: stringifyCookies(cookies),
      },
      redirect: "follow",
    });

    const rawCookiesP2 = (resPage2.headers as any).getSetCookie
      ? (resPage2.headers as any).getSetCookie()
      : resPage2.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawCookiesP2));
    logs.push({ step: "6. Page 2 result", status: resPage2.status, url: resPage2.url });

    // Step 7: /api/session 2
    const token2 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    const resSession2 = await fetch("https://app.khaddavi.net/api/session", {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: resPage2.url,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _token: token2 }),
    });

    const rawCookiesS2 = (resSession2.headers as any).getSetCookie
      ? (resSession2.headers as any).getSetCookie()
      : resSession2.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawCookiesS2));
    logs.push({ step: "7. Session 2 result", status: resSession2.status });

    await sleep(2500);

    // Step 8: /api/go
    const key = Math.floor(Math.random() * 1000);
    const size = `${(1920 + key) * 2}.${(1080 + key) * 2}`;
    const resGo = await fetch("https://app.khaddavi.net/api/go", {
      method: "POST",
      headers: {
        "User-Agent": DEFAULT_USER_AGENT,
        Referer: resPage2.url,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ key, size, ado: null }),
    });

    const goData = (await resGo.json().catch(() => ({}))) as any;
    logs.push({ step: "8. /api/go result", status: resGo.status, goData });

    if (!goData.url) {
      return NextResponse.json({ success: false, reason: "No goData.url", logs });
    }

    // Step 9: ready/go
    let readyHtml = "";
    try {
      const resReady = await fetch(goData.url, { headers: { "User-Agent": DEFAULT_USER_AGENT } });
      if (resReady.ok) {
        readyHtml = await resReady.text();
      }
    } catch (_) {}

    if (!readyHtml.includes("location.href") && !readyHtml.includes("window.location")) {
      const gReadyUrl = `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(goData.url)}`;
      const gReadyRes = await fetch(gReadyUrl, { headers: { "User-Agent": DEFAULT_USER_AGENT } });
      if (gReadyRes.ok) {
        readyHtml = await gReadyRes.text();
      }
    }

    const destMatch =
      readyHtml.match(/location\.href\s*=\s*["']([^"']+)["']/i) ||
      readyHtml.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);
    const destinationUrl = destMatch ? destMatch[1].replace(/\\\//g, "/") : null;
    logs.push({ step: "9. Final Destination", destinationUrl });

    return NextResponse.json({ success: true, destinationUrl, logs });
  } catch (err: any) {
    logs.push({ step: "Exception Caught", error: err.message, stack: err.stack });
    return NextResponse.json({ success: false, error: err.message, logs });
  }
}
