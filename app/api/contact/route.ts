import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/push";

const MAX_BODY_BYTES = 32 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stripControls = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
const hashKey = (value: string) => createHash("sha256").update(value).digest("hex");

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length && length > MAX_BODY_BYTES) return NextResponse.json({ error: "الرسالة أكبر من الحد المسموح." }, { status: 413 });

    const body = await request.json() as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
    const ipKey = hashKey(`ip:${ip}`);
    const email = typeof body.email === "string" ? stripControls(body.email).slice(0, 254) : "";
    const db = createAdminClient();
    if (!db) return NextResponse.json({ error: "تعذر حفظ الرسالة الآن. حاول مرة أخرى لاحقًا." }, { status: 503 });

    const { data: allowedByIp, error: rateError } = await db.rpc("consume_contact_rate_limit", { p_key_hash: ipKey, p_limit: 2, p_window_seconds: 60 });
    if (rateError || allowedByIp !== true) return NextResponse.json({ error: "تم إرسال رسائل كثيرة خلال دقيقة واحدة. حاول بعد قليل." }, { status: 429 });
    if (email) {
      const { data: allowedByEmail } = await db.rpc("consume_contact_rate_limit", { p_key_hash: hashKey(`email:${email.toLowerCase()}`), p_limit: 5, p_window_seconds: 600 });
      if (allowedByEmail !== true) return NextResponse.json({ error: "تم تجاوز الحد المؤقت لهذا البريد. حاول لاحقًا." }, { status: 429 });
    }

    const name = typeof body.name === "string" ? stripControls(body.name).slice(0, 120) : "";
    const message = typeof body.message === "string" ? stripControls(body.message).slice(0, 5000) : "";
    const phone = typeof body.phone === "string" ? stripControls(body.phone).slice(0, 40) : "";
    const company = typeof body.company === "string" ? stripControls(body.company).slice(0, 120) : "";
    const jobTitle = typeof body.job_title === "string" ? stripControls(body.job_title).slice(0, 120) : "";
    const projectType = typeof body.project_type === "string" ? stripControls(body.project_type).slice(0, 120) : "";
    if (name.length < 2 || !emailPattern.test(email) || message.length < 10) return NextResponse.json({ error: "تحقق من الحقول المطلوبة وحاول مرة أخرى." }, { status: 400 });

    const { data: saved, error: saveError } = await db.from("contact_messages").insert({ name, email, phone, company, job_title: jobTitle, project_type: projectType, message, status: "new" }).select("id").single();
    if (saveError || !saved) return NextResponse.json({ error: "تعذر حفظ رسالتك الآن. حاول مرة أخرى." }, { status: 500 });

    await notifyAdmins(`رسالة جديدة من ${name}`, `${message.slice(0, 120)}${message.length > 120 ? "…" : ""}`, saved.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال الرسالة الآن. حاول مرة أخرى." }, { status: 500 });
  }
}
