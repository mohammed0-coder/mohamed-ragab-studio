import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CMS_DEFAULTS, type CmsPageKey } from "@/lib/cms";

export const dynamic = "force-dynamic";
export default async function CmsPreview({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const db = await createClient(); if (!db) redirect("/admin");
  const { data: { user } } = await db.auth.getUser(); if (!user || user.app_metadata?.role !== "admin") redirect("/admin");
  const params=await searchParams; const key=String(params.key||"homepage") as CmsPageKey; if (!(key in CMS_DEFAULTS)) redirect("/admin/cms");
  const {data}=await db.from("cms_pages").select("draft,status,updated_at").eq("key",key).maybeSingle();
  const draft={...CMS_DEFAULTS[key],...((data?.draft&&typeof data.draft==="object")?data.draft:{})};
  return <main className="admin-dashboard-shell"><div className="admin-main" style={{width:"100%"}}><header className="admin-topbar"><div><span className="eyebrow">DRAFT PREVIEW</span><h1>{key}</h1><p className="admin-muted">هذه المعاينة للمسودة فقط. لا تغيّر المحتوى المنشور حتى تضغط Publish.</p></div><Link className="admin-secondary" href={`/admin/cms?section=${key}`}>رجوع</Link></header><section className="content-wrap page-section cms-preview-card"><span className="eyebrow">Draft</span>{Object.entries(draft).map(([name,value])=><article key={name}><small>{name}</small><p>{String(value)}</p></article>)}</section></div></main>;
}
