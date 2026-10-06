import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const visitorId = String(body?.visitorId || "").trim();
    const path = String(body?.path || "/").slice(0, 200);
    if (!/^[0-9a-fA-F-]{36}$/.test(visitorId)) return NextResponse.json({ ok: false }, { status: 400 });
    const db = await createClient();
    if (!db) return NextResponse.json({ ok: false }, { status: 503 });
    const visitDay = new Date().toISOString().slice(0, 10);
    const { error } = await db.from("site_visits").upsert({ visitor_id: visitorId, visit_day: visitDay, path }, { onConflict: "visitor_id,visit_day", ignoreDuplicates: true });
    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
