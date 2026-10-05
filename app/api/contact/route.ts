import { NextResponse } from "next/server";

const requestWindows = new Map<string, { count: number; until: number }>();

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (typeof body.website === "string" && body.website) return NextResponse.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const window = requestWindows.get(ip);
    if (window && window.until > now && window.count >= 5) {
      return NextResponse.json({ error: "تم إرسال طلبات كثيرة. حاول لاحقًا." }, { status: 429 });
    }
    if (!window || window.until < now) requestWindows.set(ip, { count: 1, until: now + 60 * 60 * 1000 });
    else window.count += 1;

    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) {
      return NextResponse.json({ error: "تحقق من الحقول المطلوبة وحاول مرة أخرى." }, { status: 400 });
    }

    const accessKey = process.env.WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey || accessKey === "#") {
      return NextResponse.json({ code: "web3forms_not_configured" }, { status: 503 });
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `رسالة جديدة من ${name}`,
        from_name: "موقع محمد رجب",
        name,
        email,
        phone: String(body.phone || "").slice(0, 40),
        company: String(body.company || "").slice(0, 120),
        job_title: String(body.job_title || "").slice(0, 120),
        project_type: String(body.project_type || "").slice(0, 120),
        message,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    const result = await response.json() as { success?: boolean; message?: string };
    if (!response.ok || !result.success) {
      return NextResponse.json({ error: "تعذر إرسال رسالتك الآن. حاول مرة أخرى." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بخدمة إرسال الرسائل. حاول مرة أخرى." }, { status: 502 });
  }
}
