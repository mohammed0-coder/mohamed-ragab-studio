import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

const requestWindows = new Map<string, { count: number; until: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json() as { path?: unknown; sessionId?: unknown };
    const path = typeof body.path === "string" ? body.path.trim().slice(0, 160) : "/";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 80) : "";
    if (!sessionId || !path.startsWith("/") || path.startsWith("//") || path.includes("javascript:")) {
      return NextResponse.json({ ok: true });
    }

    const rateKey = sessionId;
    const now = Date.now();
    const window = requestWindows.get(rateKey);
    if (window && window.until > now && window.count >= 90) return NextResponse.json({ ok: true });
    if (!window || window.until < now) requestWindows.set(rateKey, { count: 1, until: now + 60 * 60 * 1000 });
    else window.count += 1;

    const db = createPublicClient();
    if (!db) return NextResponse.json({ ok: true });
    await db.rpc("record_analytics_visit", { p_session_id: sessionId, p_path: path });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
