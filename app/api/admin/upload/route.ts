import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = new Set(["project-images", "client-logos", "site-assets"]);
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_JSON_BYTES = 48 * 1024;

function cleanSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9/_-]/g, "-").replace(/\/{2,}/g, "/").replace(/^\/+|\/+$/g, "").slice(0, 140);
}

function extensionFromType(type: string) {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : type === "image/avif" ? "avif" : "jpg";
}

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") || 0);
    if (length && length > MAX_JSON_BYTES) return NextResponse.json({ error: "بيانات الرفع أكبر من الحد المسموح." }, { status: 413 });

    const auth = await createClient();
    if (!auth) return NextResponse.json({ error: "Supabase غير مهيأ." }, { status: 503 });
    const { data: { user } } = await auth.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") return NextResponse.json({ error: "غير مصرح." }, { status: 401 });

    const body = await request.json() as { bucket?: unknown; folder?: unknown; name?: unknown; type?: unknown; size?: unknown };
    const bucket = typeof body.bucket === "string" ? body.bucket : "";
    const folder = typeof body.folder === "string" ? cleanSegment(body.folder) : "uploads";
    const type = typeof body.type === "string" ? body.type : "";
    const size = Number(body.size || 0);
    if (!ALLOWED_BUCKETS.has(bucket)) return NextResponse.json({ error: "هذا النوع من التخزين غير مسموح." }, { status: 400 });
    if (!IMAGE_TYPES.has(type)) return NextResponse.json({ error: "مسموح برفع الصور فقط: JPG, PNG, WEBP, AVIF." }, { status: 400 });
    const max = bucket === "client-logos" ? 5 * 1024 * 1024 : 15 * 1024 * 1024;
    if (!Number.isFinite(size) || size <= 0 || size > max) return NextResponse.json({ error: `حجم الصورة يتجاوز الحد المسموح (${Math.round(max / 1024 / 1024)}MB).` }, { status: 413 });

    const db = auth;
    const path = `${folder}/${user.id}/${Date.now()}-${randomUUID()}.${extensionFromType(type)}`;
    const { data: ticket, error } = await db.storage.from(bucket).createSignedUploadUrl(path);
    if (error || !ticket?.token) return NextResponse.json({ error: "تعذر تجهيز رفع الصورة." }, { status: 500 });

    const { data: publicUrl } = db.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ path, token: ticket.token, value: publicUrl.publicUrl });
  } catch {
    return NextResponse.json({ error: "تعذر تجهيز رفع الصورة." }, { status: 400 });
  }
}
