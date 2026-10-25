import { createPublicClient } from "@/lib/supabase/public";

export const PUBLIC_SETTING_KEYS = [
  "contact_phone",
  "contact_whatsapp",
  "contact_email",
  "contact_location",
  "social_facebook",
  "social_instagram",
  "social_whatsapp",
  "social_linkedin",
  "social_x",
  "social_behance",
  "footer_text",
] as const;

export type SiteSettings = Record<(typeof PUBLIC_SETTING_KEYS)[number], string>;

const defaults: SiteSettings = {
  contact_phone: "+20",
  contact_whatsapp: "",
  contact_email: "",
  contact_location: "القاهرة، مصر",
  social_facebook: "",
  social_instagram: "",
  social_whatsapp: "",
  social_linkedin: "",
  social_x: "",
  social_behance: "",
  footer_text: "نصنع حضورًا يستحق أن يُرى.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = createPublicClient();
  if (!db) return defaults;
  const { data, error } = await db.from("site_settings").select("key,value").in("key", [...PUBLIC_SETTING_KEYS]);
  if (error) {
    console.error("[content] getSiteSettings", error.message);
    return defaults;
  }
  const result: SiteSettings = { ...defaults };
  for (const row of data || []) {
    if (row.key in result && typeof row.value?.text === "string") {
      result[row.key as keyof SiteSettings] = row.value.text;
    }
  }
  return result;
}
