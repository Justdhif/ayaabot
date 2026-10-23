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

export async function GET(req: NextRequest) {
  const targetUrl = req.nextUrl.searchParams.get("url") || "https://sfl.gl/xPULq";
  const logs: any[] = [];

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  };

  try {
    logs.push({ step: "1. Fetch initial URL", url: targetUrl });
    const res1 = await fetch(targetUrl, { headers });
    const html1 = await res1.text();
    const rayId = html1.match(/name=["']ray_id["']\s+value=["']([^"']+)["']/i)?.[1];
    const alias = html1.match(/name=["']alias["']\s+value=["']([^"']+)["']/i)?.[1];
    const actionUrl =
      html1.match(/action=["'](https?:\/\/[^"']+)["']/i)?.[1] ||
      "https://app.khaddavi.net/redirect.php";

    logs.push({
      step: "1. Result",
      status: res1.status,
      htmlLength: html1.length,
      htmlSnippet: html1.slice(0, 400),
      rayId,
      alias,
      actionUrl,
    });

    if (!rayId || !alias) {
      return NextResponse.json({ success: false, reason: "Missing rayId or alias in Step 1", logs });
    }

    const redirectGateUrl = `${actionUrl}?ray_id=${rayId}&alias=${alias}`;
    logs.push({ step: "2. Fetch redirect gate", url: redirectGateUrl });

    const res2 = await fetch(redirectGateUrl, {
      headers: { ...headers, Referer: targetUrl },
      redirect: "manual",
    });

    const loc2 = res2.headers.get("location") || "";
    const rawSetCookie2 = (res2.headers as any).getSetCookie ? (res2.headers as any).getSetCookie() : res2.headers.get("set-cookie");
    const cookies = parseCookies(rawSetCookie2);
    if (!cookies["__session"]) cookies["__session"] = rayId;

    logs.push({
      step: "2. Result",
      status: res2.status,
      location: loc2,
      rawSetCookie: rawSetCookie2,
      parsedCookies: cookies,
    });

    if (!loc2) {
      return NextResponse.json({ success: false, reason: "No location header in Step 2", logs });
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

    const rawSetCookie3 = (res3.headers as any).getSetCookie ? (res3.headers as any).getSetCookie() : res3.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookie3));

    logs.push({
      step: "3. Result",
      status: res3.status,
      cookiesAfterStep3: cookies,
    });

    const token1 = makeSafelinkuSessionToken(cookies["XSRF-TOKEN"] || "");
    logs.push({ step: "4. Request /api/session (Step 1)", token: token1 });

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

    const session1Text = await resSession1.text();
    const rawSetCookieS1 = (resSession1.headers as any).getSetCookie ? (resSession1.headers as any).getSetCookie() : resSession1.headers.get("set-cookie");
    Object.assign(cookies, parseCookies(rawSetCookieS1));

    logs.push({
      step: "4. Result",
      status: resSession1.status,
      body: session1Text,
      cookiesAfterStep4: cookies,
    });

    // Verify step
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

    const verifyText = await resVerify.text();
    logs.push({
      step: "5. Verify Result",
      status: resVerify.status,
      body: verifyText,
    });

    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    logs.push({ step: "Exception Caught", error: err.message, stack: err.stack });
    return NextResponse.json({ success: false, error: err.message, logs });
  }
}
