"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CmsPageKey } from "@/lib/cms";

const allowedKeys: CmsPageKey[] = ["homepage", "about", "contact", "global"];

async function adminClient() {
  const db = await createClient();
  if (!db) return null;
  const { data: { user } } = await db.auth.getUser();
  return user?.app_metadata?.role === "admin" ? db : null;
}

function clean(value: FormDataEntryValue | null, max = 4000) {
  return String(value || "").trim().slice(0, max);
}

export async function saveCmsDraft(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const key = clean(formData.get("key"), 30) as CmsPageKey;
  if (!allowedKeys.includes(key)) redirect("/admin/cms?error=invalid-key");
  const fields = clean(formData.get("fields"), 50000);
  let draft: Record<string, string>;
  try {
    draft = JSON.parse(fields);
  } catch {
    redirect(`/admin/cms?section=${key}&error=invalid-data`);
  }
  const sanitized = Object.fromEntries(Object.entries(draft).map(([name, value]) => [name, String(value ?? "").slice(0, 4000)]));
  const { data: current } = await db.from("cms_pages").select("published").eq("key", key).maybeSingle();
  await db.from("cms_pages").upsert({ key, draft: sanitized, published: current?.published || sanitized, status: "draft", updated_at: new Date().toISOString() }, { onConflict: "key" });
  revalidatePath("/admin/cms");
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/contact");
  redirect(`/admin/cms?section=${key}&saved=draft`);
}

export async function publishCmsDraft(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const key = clean(formData.get("key"), 30) as CmsPageKey;
  if (!allowedKeys.includes(key)) redirect("/admin/cms?error=invalid-key");
  const { data } = await db.from("cms_pages").select("draft").eq("key", key).maybeSingle();
  const draft = data?.draft && typeof data.draft === "object" ? data.draft : {};
  await db.from("cms_pages").upsert({ key, draft, published: draft, status: "published", updated_at: new Date().toISOString(), published_at: new Date().toISOString() }, { onConflict: "key" });
  revalidatePath("/"); revalidatePath("/about"); revalidatePath("/contact"); revalidatePath("/admin/cms");
  redirect(`/admin/cms?section=${key}&saved=published`);
}

export async function discardCmsDraft(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const key = clean(formData.get("key"), 30) as CmsPageKey;
  const { data } = await db.from("cms_pages").select("published").eq("key", key).maybeSingle();
  const published = data?.published && typeof data.published === "object" ? data.published : {};
  await db.from("cms_pages").update({ draft: published, status: "published", updated_at: new Date().toISOString() }).eq("key", key);
  revalidatePath("/admin/cms");
  redirect(`/admin/cms?section=${key}&saved=discarded`);
}

export async function saveContactSettings(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const values: Record<string, string> = {
    contact_phone: clean(formData.get("contact_phone"), 60),
    contact_whatsapp: clean(formData.get("contact_whatsapp"), 500),
    social_linkedin: clean(formData.get("social_linkedin"), 500),
    social_instagram: clean(formData.get("social_instagram"), 500),
    social_facebook: clean(formData.get("social_facebook"), 500),
    social_behance: clean(formData.get("social_behance"), 500),
  };
  for (const [key, text] of Object.entries(values)) await db.from("site_settings").upsert({ key, value: { text }, updated_at: new Date().toISOString() }, { onConflict: "key" });
  revalidatePath("/contact"); revalidatePath("/", "layout");
  redirect("/admin/cms?section=contact&saved=settings");
}

export async function setFeaturedProject(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const projectId = clean(formData.get("project_id"), 80);
  await db.from("projects").update({ homepage_featured: false }).eq("homepage_featured", true);
  if (projectId) await db.from("projects").update({ homepage_featured: true }).eq("id", projectId);
  revalidatePath("/"); revalidatePath("/admin/cms");
  redirect("/admin/cms?section=homepage&saved=featured");
}


export async function saveServiceCms(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const id = clean(formData.get("id"), 80);
  if (!id) redirect("/admin/cms?section=services&error=invalid-service");
  const row = {
    title: clean(formData.get("title"), 200),
    title_en: clean(formData.get("title_en"), 200) || null,
    description: clean(formData.get("description"), 4000),
    description_en: clean(formData.get("description_en"), 4000) || null,
    cta_label_ar: clean(formData.get("cta_label_ar"), 200) || "اطلب هذه الخدمة ↙",
    cta_label_en: clean(formData.get("cta_label_en"), 200) || "Request this service ↙",
    cta_url: clean(formData.get("cta_url"), 600) || null,
    sort_order: Number(formData.get("sort_order") || 0),
    visible: formData.get("visible") === "on",
  };
  if (row.title.length < 2) redirect("/admin/cms?section=services&error=invalid-service");
  const { error } = await db.from("services").update(row).eq("id", id);
  if (error) redirect("/admin/cms?section=services&error=save-service");
  revalidatePath("/services"); revalidatePath("/contact"); revalidatePath("/"); revalidatePath("/admin/cms");
  redirect("/admin/cms?section=services&saved=service");
}

export async function saveClientCms(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const id = clean(formData.get("id"), 80);
  if (!id) redirect("/admin/cms?section=clients&error=invalid-client");
  const row = {
    name: clean(formData.get("name"), 200),
    website_url: clean(formData.get("website_url"), 800) || null,
    logo_url: clean(formData.get("logo_url"), 1000) || null,
    alt_text: clean(formData.get("alt_text"), 300) || null,
    row_assignment: Number(formData.get("row_assignment") || 1) === 2 ? 2 : 1,
    animation_speed: Math.max(8, Math.min(120, Number(formData.get("animation_speed") || 28))),
    visible: formData.get("visible") === "on",
    sort_order: Number(formData.get("sort_order") || 0),
  };
  if (row.name.length < 2) redirect("/admin/cms?section=clients&error=invalid-client");
  const { error } = await db.from("clients").update(row).eq("id", id);
  if (error) redirect("/admin/cms?section=clients&error=save-client");
  revalidatePath("/clients"); revalidatePath("/"); revalidatePath("/admin/cms");
  redirect("/admin/cms?section=clients&saved=client");
}
