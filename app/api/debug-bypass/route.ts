import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url") || "https://sfl.gl/xPULq";
  const results: any = {};

  // 1. Direct fetch
  try {
    const r1 = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "id,en;q=0.9",
      }
    });
    const text1 = await r1.text();
    results["direct"] = {
      status: r1.status,
      length: text1.length,
      hasRayId: text1.includes('name="ray_id"'),
      snippet: text1.slice(0, 200)
    };
  } catch (e: any) {
    results["direct"] = { error: e.message };
  }

  // 2. Test app.khaddavi.net directly
  try {
    const rK = await fetch("https://app.khaddavi.net", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });
    results["khaddavi_direct"] = {
      status: rK.status,
      hasCf: (await rK.text()).includes("Just a moment")
    };
  } catch (e: any) {
    results["khaddavi_direct"] = { error: e.message };
  }

  // 3. Test api.allorigins.win
  try {
    const rAo = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`);
    const textAo = await rAo.text();
    results["allorigins"] = {
      status: rAo.status,
      length: textAo.length,
      hasRayId: textAo.includes('name="ray_id"'),
      snippet: textAo.slice(0, 200)
    };
  } catch (e: any) {
    results["allorigins"] = { error: e.message };
  }

  // 4. Test corsproxy.io
  try {
    const rCp = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(target)}`);
    const textCp = await rCp.text();
    results["corsproxy_io"] = {
      status: rCp.status,
      length: textCp.length,
      hasRayId: textCp.includes('name="ray_id"'),
      snippet: textCp.slice(0, 200)
    };
  } catch (e: any) {
    results["corsproxy_io"] = { error: e.message };
  }

  // 5. Test codetabs
  try {
    const rCt = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`);
    const textCt = await rCt.text();
    results["codetabs"] = {
      status: rCt.status,
      length: textCt.length,
      hasRayId: textCt.includes('name="ray_id"'),
      snippet: textCt.slice(0, 200)
    };
  } catch (e: any) {
    results["codetabs"] = { error: e.message };
  }

  return NextResponse.json(results);
}
