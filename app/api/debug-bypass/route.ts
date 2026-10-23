import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
  const target = req.nextUrl.searchParams.get("url") || "https://sfl.gl/xPULq";
  const logs: any[] = [];

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  try {
    // Extract alias from URL path
    const u = new URL(target);
    const alias = u.pathname.split("/").filter(Boolean).pop() || "xPULq";
    const rayId = crypto.randomBytes(16).toString("hex");

    const redirectGateUrl = `https://app.khaddavi.net/redirect.php?ray_id=${rayId}&alias=${alias}`;
    logs.push({ step: "1. Skip sfl.gl CF & Go direct to Khaddavi", url: redirectGateUrl });

    // Step 2: Fetch redirect gate & get cookies
    const res2 = await fetch(redirectGateUrl, {
      headers: { ...headers, Referer: target },
      redirect: "manual",
    });

    const loc2 = res2.headers.get("location") || "";
    const rawSetCookie2 = (res2.headers as any).getSetCookie
      ? (res2.headers as any).getSetCookie()
      : res2.headers.get("set-cookie");
    const cookies = parseCookies(rawSetCookie2);
    if (!cookies["__session"]) cookies["__session"] = rayId;

    logs.push({
      step: "2. Khaddavi Gate Result",
      status: res2.status,
      location: loc2,
      cookies,
    });

    if (!loc2) {
      return NextResponse.json({ success: false, reason: "No location from Khaddavi gate", logs });
    }

    const blogUrl1 = new URL(loc2, "https://app.khaddavi.net").toString();
    logs.push({ step: "3. Fetch blogUrl1", url: blogUrl1 });

    const res3 = await fetch(blogUrl1, {
      headers: {
        ...headers,
        Referer: redirectGateUrl,
        Cookie: stringifyCookies(cookies),
      },
    });

    const rawSetCookie3 = (res3.headers as any).getSetCookie
      ? (res3.headers as any).getSetCookie()
      : res3.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookie3));

    logs.push({
      step: "3. Result blogUrl1",
      status: res3.status,
      xsrfToken: cookies["XSRF-TOKEN"] ? "Present" : "Missing",
    });

    // Step 4: /api/session
    const token1 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    const resSession1 = await fetch("https://app.khaddavi.net/api/session", {
      method: "POST",
      headers: {
        ...headers,
        Referer: blogUrl1,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _token: token1 }),
    });

    const rawSetCookieS1 = (resSession1.headers as any).getSetCookie
      ? (resSession1.headers as any).getSetCookie()
      : resSession1.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookieS1));
    const session1Json = await resSession1.json().catch(() => ({}));

    logs.push({
      step: "4. Session 1 Result",
      status: resSession1.status,
      data: session1Json,
    });

    await sleep(1500);

    // Step 5: /api/verify
    const resVerify = await fetch("https://app.khaddavi.net/api/verify", {
      method: "POST",
      headers: {
        ...headers,
        Referer: blogUrl1,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _a: 0 }),
    });

    const verifyData = (await resVerify.json().catch(() => ({}))) as any;
    const rawSetCookieV = (resVerify.headers as any).getSetCookie
      ? (resVerify.headers as any).getSetCookie()
      : resVerify.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookieV));

    logs.push({
      step: "5. Verify Result",
      status: resVerify.status,
      data: verifyData,
    });

    const targetPage2 = verifyData.target || "/redirect.php";
    const blogUrl2 = new URL(targetPage2, "https://app.khaddavi.net").toString();

    // Step 6: Follow target to page 2
    const resPage2 = await fetch(blogUrl2, {
      headers: {
        ...headers,
        Referer: blogUrl1,
        Cookie: stringifyCookies(cookies),
      },
      redirect: "follow",
    });

    const rawSetCookieP2 = (resPage2.headers as any).getSetCookie
      ? (resPage2.headers as any).getSetCookie()
      : resPage2.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookieP2));

    logs.push({
      step: "6. Page 2 Result",
      status: resPage2.status,
      page2Url: resPage2.url,
    });

    // Step 7: /api/session 2
    const token2 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    const resSession2 = await fetch("https://app.khaddavi.net/api/session", {
      method: "POST",
      headers: {
        ...headers,
        Referer: resPage2.url,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ _token: token2 }),
    });

    const rawSetCookieS2 = (resSession2.headers as any).getSetCookie
      ? (resSession2.headers as any).getSetCookie()
      : resSession2.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookieS2));

    logs.push({
      step: "7. Session 2 Result",
      status: resSession2.status,
    });

    await sleep(2500);

    // Step 8: /api/go
    const key = Math.floor(Math.random() * 1000);
    const size = `${(1920 + key) * 2}.${(1080 + key) * 2}`;
    const resGo = await fetch("https://app.khaddavi.net/api/go", {
      method: "POST",
      headers: {
        ...headers,
        Referer: resPage2.url,
        Origin: "https://app.khaddavi.net",
        "Content-Type": "application/json",
        Cookie: stringifyCookies(cookies),
      },
      body: JSON.stringify({ key, size, ado: null }),
    });

    const goData = (await resGo.json().catch(() => ({}))) as any;
    logs.push({
      step: "8. /api/go Result",
      status: resGo.status,
      goData,
    });

    if (!goData.url) {
      return NextResponse.json({ success: false, reason: "No ready/go url", logs });
    }

    // Step 9: ready/go
    const resReady = await fetch(goData.url, { headers });
    const readyHtml = await resReady.text();
    const destMatch =
      readyHtml.match(/location\.href\s*=\s*["']([^"']+)["']/i) ||
      readyHtml.match(/window\.location\.href\s*=\s*["']([^"']+)["']/i);

    const destinationUrl = destMatch ? destMatch[1].replace(/\\\//g, "/") : null;
    logs.push({
      step: "9. Final Destination",
      readyStatus: resReady.status,
      destinationUrl,
    });

    return NextResponse.json({ success: true, destinationUrl, logs });
  } catch (err: any) {
    logs.push({ step: "Exception Caught", error: err.message, stack: err.stack });
    return NextResponse.json({ success: false, error: err.message, logs });
  }
}
