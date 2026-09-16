import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const startTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatencyMs = Date.now() - startTime;

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        status: "connected",
        latencyMs: dbLatencyMs,
      },
      bot: {
        name: "CuanHD",
        version: "1.0.0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: {
          status: "disconnected",
          error: error.message,
        },
      },
      { status: 500 }
    );
  }
}
