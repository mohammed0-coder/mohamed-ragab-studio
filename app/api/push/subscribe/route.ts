import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const auth = await createClient();
    if (!auth) return NextResponse.json({ error: "غير متاح" }, { status: 503 });
    const { data: { user } } = await auth.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await request.json() as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
    const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
    const p256dh = typeof body.keys?.p256dh === "string" ? body.keys.p256dh.trim() : "";
    const authKey = typeof body.keys?.auth === "string" ? body.keys.auth.trim() : "";
    if (!/^https:\/\//i.test(endpoint) || endpoint.length > 2048 || !p256dh || !authKey) return NextResponse.json({ error: "بيانات الإشعار غير صالحة." }, { status: 400 });

    const db = createAdminClient();
    if (!db) return NextResponse.json({ error: "إعدادات الإشعارات غير مكتملة." }, { status: 503 });
    const { error } = await db.from("admin_push_subscriptions").upsert({
      admin_user_id: user.id,
      endpoint,
      subscription: { endpoint, keys: { p256dh, auth: authKey } },
      updated_at: new Date().toISOString(),
    }, { onConflict: "endpoint" });
    if (error) return NextResponse.json({ error: "تعذر حفظ الاشتراك." }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر تفعيل الإشعارات." }, { status: 400 });
  }
}
