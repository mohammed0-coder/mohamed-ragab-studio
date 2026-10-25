"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { PUBLIC_SETTING_KEYS } from "@/lib/site-settings";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";

export async function login(_state: { error?: string } | undefined, formData: FormData): Promise<{ error?: string } | undefined> {
  const db = await createClient();
  if (!db) return { error: "أضف إعدادات Supabase في ملف البيئة أولًا." };
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "تعذر تسجيل الدخول. راجع البريد وكلمة المرور." };
  if (data.user.app_metadata?.role !== "admin") {
    await db.auth.signOut();
    return { error: "هذا الحساب لا يملك صلاحية الإدارة." };
  }
  redirect("/admin/dashboard");
}

async function adminClient() {
  const db = await createClient();
  if (!db) return null;
  const { data: { user } } = await db.auth.getUser();
  return user?.app_metadata?.role === "admin" ? db : null;
}

function revalidateSite(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/clients");
  revalidatePath("/services");
  revalidatePath("/contact");
  revalidatePath("/api/site-settings");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function saveProject(formData: FormData): Promise<void> {
  const PROJECT_THEMES = ["olive", "blue", "red", "sand", "ink", "lilac"] as const;
  const db = await adminClient();
  if (!db) redirect("/admin");
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const requestedCategory = String(formData.get("category") || "Other").trim();
  const category = PROJECT_CATEGORIES.includes(requestedCategory as (typeof PROJECT_CATEGORIES)[number]) ? requestedCategory : "Other";
  const requestedTheme = String(formData.get("theme") || "red");
  const theme = PROJECT_THEMES.includes(requestedTheme as (typeof PROJECT_THEMES)[number]) ? requestedTheme : "red";
  const requestedShowcase = String(formData.get("showcase_type") || "gallery");
  const showcaseType = category === "Software Development" ? "website" : ["gallery", "website", "external"].includes(requestedShowcase) ? requestedShowcase : "gallery";
  const rawShowcaseUrl = String(formData.get("showcase_url") || "").trim();
  let showcaseUrl: string | null = null;
  if (rawShowcaseUrl) {
    try {
      const parsed = new URL(rawShowcaseUrl);
      showcaseUrl = parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
    } catch { showcaseUrl = null; }
  }
  const introTextAr = String(formData.get("intro_text_ar") || "").trim() || null;
  const introTextEn = String(formData.get("intro_text_en") || "").trim() || null;
  if (title.length < 2 || slug.length < 2) redirect("/admin/dashboard?error=invalid-project");

  const row: Partial<Project> = {
    title,
    slug,
    client_name: String(formData.get("client_name") || ""),
    category,
    short_description: String(formData.get("short_description") || ""),
    description: String(formData.get("description") || "") || null,
    intro_title: String(formData.get("intro_title") || "") || null,
    intro_text: introTextAr || introTextEn || null,
    intro_text_ar: introTextAr,
    intro_text_en: introTextEn,
    challenge: String(formData.get("challenge") || "") || null,
    solution: String(formData.get("solution") || "") || null,
    results: String(formData.get("results") || "") || null,
    start_date: String(formData.get("start_date") || "") || null,
    end_date: String(formData.get("end_date") || "") || null,
    cover_image: String(formData.get("cover_image") || "") || null,
    hero_image: String(formData.get("hero_image") || "") || null,
    services: String(formData.get("services") || "").split(",").map((x) => x.trim()).filter(Boolean),
    published: id ? formData.get("published") === "on" : true,
    featured: formData.get("featured") === "on",
    homepage_featured: formData.get("homepage_featured") === "on",
    theme,
    showcase_type: showcaseType as Project["showcase_type"],
    showcase_url: showcaseUrl,
    external_url: showcaseUrl,
    sort_order: Number(formData.get("sort_order") || 0),
  };

  let projectId = id;
  let previousSlug = "";
  if (id) {
    const { data: previous } = await db.from("projects").select("slug").eq("id", id).maybeSingle();
    previousSlug = previous?.slug || "";
    const { error } = await db.from("projects").update(row).eq("id", id);
    if (error) redirect("/admin/dashboard?error=save-project");
  } else {
    const { data, error } = await db.from("projects").insert(row).select("id").single();
    if (error || !data) redirect("/admin/dashboard?error=save-project");
    projectId = data.id;
  }

  if (formData.has("gallery_images")) {
    const images = String(formData.get("gallery_images") || "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    const { error: deleteError } = await db.from("project_images").delete().eq("project_id", projectId);
    if (deleteError) redirect("/admin/dashboard?error=save-gallery");
    if (images.length) {
      const { error } = await db.from("project_images").insert(images.map((image_url, sort_order) => ({ project_id: projectId, image_url, alt_text: title, sort_order })));
      if (error) redirect("/admin/dashboard?error=save-gallery");
    }
  }

  revalidateSite(previousSlug && previousSlug !== slug ? previousSlug : undefined);
  revalidateSite(slug);
  redirect("/admin/dashboard?status=project-saved");
}

export async function duplicateProject(id: string) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const { data: original } = await db.from("projects").select("*").eq("id", id).maybeSingle();
  if (!original) redirect("/admin/dashboard?error=project-not-found");
  const baseSlug = String(original.slug || "project");
  const copy = { ...original, id: undefined, title: `${original.title} — نسخة`, slug: `${baseSlug}-copy`, published: false, homepage_featured: false, featured: false };
  delete (copy as { id?: string }).id;
  const { error } = await db.from("projects").insert(copy);
  if (error) redirect("/admin/dashboard?error=duplicate-project");
  revalidateSite();
  redirect("/admin/dashboard?status=project-duplicated");
}

export async function saveClient(formData: FormData) {
  const db = await adminClient();
  if (!db) return;
  const id = String(formData.get("id") || "");
  const row = { name: String(formData.get("name") || "").trim(), website_url: String(formData.get("website_url") || "").trim() || null, logo_url: String(formData.get("logo_url") || "").trim() || null, visible: formData.get("visible") === "on", sort_order: Number(formData.get("sort_order") || 0) };
  if (!row.name) return;
  if (id) await db.from("clients").update(row).eq("id", id); else await db.from("clients").insert(row);
  revalidateSite();
  redirect("/admin/dashboard?status=client-saved");
}

export async function deleteClient(id: string) { const db = await adminClient(); if (!db) redirect("/admin"); await db.from("clients").delete().eq("id", id); revalidateSite(); redirect("/admin/dashboard?status=client-deleted"); }

export async function saveService(formData: FormData) {
  const db = await adminClient();
  if (!db) return;
  const id = String(formData.get("id") || "");
  const row = { number: String(formData.get("number") || "01"), title: String(formData.get("title") || "").trim(), description: String(formData.get("description") || ""), items: String(formData.get("items") || "").split(",").map((x) => x.trim()).filter(Boolean), visible: formData.get("visible") === "on", sort_order: Number(formData.get("sort_order") || 0) };
  if (!row.title) return;
  if (id) await db.from("services").update(row).eq("id", id); else await db.from("services").insert(row);
  revalidateSite();
  redirect("/admin/dashboard?status=service-saved");
}

export async function deleteService(id: string) { const db = await adminClient(); if (!db) redirect("/admin"); await db.from("services").delete().eq("id", id); revalidateSite(); redirect("/admin/dashboard?status=service-deleted"); }

export async function saveSettings(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const updates = PUBLIC_SETTING_KEYS.map((key) => ({ key, value: { text: String(formData.get(key) || "").trim() }, updated_at: new Date().toISOString() }));
  const { error } = await db.from("site_settings").upsert(updates, { onConflict: "key" });
  if (error) redirect("/admin/dashboard?error=save-settings");
  revalidateSite();
  redirect("/admin/dashboard?status=settings-saved");
}

export async function updateMessage(id: string, status: string) { const db = await adminClient(); if (!db) redirect("/admin"); if (!["new", "read", "archived"].includes(status)) return; await db.from("contact_messages").update({ status }).eq("id", id); redirect("/admin/dashboard?status=message-updated"); }
export async function deleteMessage(id: string) { const db = await adminClient(); if (!db) redirect("/admin"); await db.from("contact_messages").delete().eq("id", id); redirect("/admin/dashboard?status=message-deleted"); }

export async function deleteProject(id: string) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const { data: project } = await db.from("projects").select("slug").eq("id", id).maybeSingle();
  await db.from("project_images").delete().eq("project_id", id);
  await db.from("projects").delete().eq("id", id);
  revalidateSite(project?.slug);
  redirect("/admin/dashboard?status=project-deleted");
}

export async function logout() { const db = await createClient(); await db?.auth.signOut(); redirect("/admin"); }


export async function createMessageGroup(formData: FormData) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  const color = String(formData.get("color") || "#7c1e2d").trim();
  if (!name || !/^#[0-9a-fA-F]{6}$/.test(color)) redirect("/admin/dashboard?section=messages&status=invalid-group");
  await db.from("message_groups").insert({ name, color });
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?section=messages&status=group-created");
}

export async function addMessageToGroup(messageId: string, groupId: string) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  if (!messageId || !groupId) return;
  await db.from("message_group_members").upsert({ message_id: messageId, group_id: groupId }, { onConflict: "group_id,message_id" });
  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?section=messages&message=${encodeURIComponent(messageId)}`);
}

export async function removeMessageFromGroup(messageId: string, groupId: string) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  await db.from("message_group_members").delete().eq("message_id", messageId).eq("group_id", groupId);
  revalidatePath("/admin/dashboard");
  redirect(`/admin/dashboard?section=messages&message=${encodeURIComponent(messageId)}`);
}

export async function deleteMessageGroup(groupId: string) {
  const db = await adminClient();
  if (!db) redirect("/admin");
  await db.from("message_groups").delete().eq("id", groupId);
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard?section=messages&status=group-deleted");
}
