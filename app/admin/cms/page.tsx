import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/site-settings";
import { CMS_DEFAULTS, type CmsPageData, type CmsPageKey } from "@/lib/cms";
import { discardCmsDraft, publishCmsDraft, saveCmsDraft, saveContactSettings, saveServiceCms, saveClientCms, setFeaturedProject } from "@/app/admin/cms/actions";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";
const sections: Array<{ key: CmsPageKey | "services" | "clients" | "team" | "portfolio"; label: string }> = [
  { key: "homepage", label: "Homepage" },
  { key: "about", label: "About Us" },
  { key: "services", label: "Services" },
  { key: "clients", label: "Clients" },
  { key: "team", label: "Team" },
  { key: "portfolio", label: "Portfolio" },
  { key: "contact", label: "Contact" },
  { key: "global", label: "Global Content" },
];

function Field({ label, name, value, multiline = false }: { label: string; name: string; value: string; multiline?: boolean }) {
  return <label className="admin-field"><span className="admin-field-label">{label}</span>{multiline ? <textarea name={name} defaultValue={value} rows={4} /> : <input name={name} defaultValue={value} />}</label>;
}

function jsonFromForm(data: CmsPageData) { return JSON.stringify(data); }

export default async function CmsAdmin({ searchParams }: { searchParams: Promise<{ section?: string; saved?: string; error?: string }> }) {
  const db = await createClient();
  if (!db) redirect("/admin");
  const { data: { user } } = await db.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin");
  const params = await searchParams;
  const requested = String(params.section || "homepage");
  const section = sections.some(item => item.key === requested) ? requested : "homepage";
  const [cmsResult, settings, projectsResult, clientsResult, servicesResult] = await Promise.all([
    db.from("cms_pages").select("*").order("key"),
    getSiteSettings(),
    db.from("projects").select("id,title,client_name,homepage_featured,published,sort_order").order("sort_order"),
    db.from("clients").select("id,name,logo_url,website_url,visible,sort_order,row_assignment,animation_speed,alt_text").order("sort_order"),
    db.from("services").select("id,number,title,title_en,description,description_en,items,sort_order,visible,cta_label_ar,cta_label_en,cta_url").order("sort_order"),
  ]);
  const cmsRows = new Map<string, any>(((cmsResult.data || []) as any[]).map(row => [row.key, row]));
  const cmsKey: CmsPageKey = section === "about" || section === "contact" || section === "global" ? section : "homepage";
  const row = cmsRows.get(cmsKey);
  const content: CmsPageData = { ...CMS_DEFAULTS[cmsKey], ...((row?.draft && typeof row.draft === "object") ? row.draft : {}) };
  const status = row?.status || "published";
  const projects = (projectsResult.data || []) as Pick<Project, "id" | "title" | "client_name" | "homepage_featured" | "published" | "sort_order">[];

  return <main className="admin-dashboard-shell">
    <aside className="admin-sidebar">
      <a className="admin-sidebar-brand" href="/"><img className="admin-brand-logo admin-brand-logo-light" src="/brand/MRS_Black_Horizontal.png" alt="Mohamed Ragab Studio"/><img className="admin-brand-logo admin-brand-logo-dark" src="/brand/MRS_White_Horizontal.png" alt="Mohamed Ragab Studio"/></a>
      <nav aria-label="CMS modules">{sections.map(item => <Link key={item.key} href={`/admin/cms?section=${item.key}`} className={section===item.key?"is-active":""}>{item.label}</Link>)}</nav>
      <div className="admin-sidebar-bottom"><Link href="/admin/dashboard?section=overview">لوحة الإدارة ↗</Link><Link href="/" target="_blank">الموقع ↗</Link></div>
    </aside>
    <div className="admin-main">
      <header className="admin-topbar"><div><span className="eyebrow">Studio CMS / CONTENT</span><h1>إدارة المحتوى</h1><p className="admin-muted">تعديل المحتوى العادي بدون لمس الكود. المسودة لا تظهر للزائر حتى النشر.</p></div><div className="admin-topbar-actions"><span className="admin-status-pill">{status === "draft" ? "مسودة" : "منشور"}</span></div></header>
      {params.saved && <div className="admin-flash">تم حفظ التغيير: {params.saved}</div>}
      {params.error && <div className="admin-flash admin-error">حدثت مشكلة في البيانات. راجع الحقول وحاول مرة أخرى.</div>}

      {section === "homepage" || section === "about" || section === "global" ? <section className="admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">CONTENT EDITOR</span><h2>{sections.find(item=>item.key===section)?.label}</h2></div><Link className="text-link" href={section==="about"?"/about":section==="homepage"?"/":"/contact"} target="_blank">View Live ↗</Link></div>
        <form action={saveCmsDraft} className="admin-form admin-form-large">
          <input type="hidden" name="key" value={cmsKey}/>
          <input type="hidden" name="fields" value={jsonFromForm(content)} id="cms-fields-json"/>
          <div className="cms-editor-grid">
            {Object.entries(content).map(([key,value]) => <Field key={key} name={key} label={key} value={value} multiline={/description|body|title|headline|caption/.test(key)} />)}
          </div>
          <div className="admin-editor-actions"><button className="admin-button" type="submit" formNoValidate onClick={(event) => { const form = (event.currentTarget as HTMLButtonElement).form; if (!form) return; const fields = Object.fromEntries(Array.from(form.querySelectorAll("[name]")).filter((input: any) => input.name !== "fields" && input.name !== "key").map((input: any) => [input.name, input.value])); const hidden = form.querySelector<HTMLInputElement>('input[name="fields"]'); if (hidden) hidden.value = JSON.stringify(fields); }}>Save Draft</button><button className="admin-secondary" type="submit" formAction={publishCmsDraft}>Publish</button><button className="admin-secondary" type="submit" formAction={discardCmsDraft}>Cancel Changes</button><Link className="admin-secondary" href={`/admin/cms/preview?key=${cmsKey}`} target="_blank">Preview Draft</Link></div>
        </form>
      </section> : null}

      {section === "contact" ? <section className="admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">CONTACT SETTINGS</span><h2>بيانات التواصل</h2></div><Link className="text-link" href="/contact" target="_blank">View Live ↗</Link></div>
        <form action={saveContactSettings} className="admin-form admin-form-large"><Field label="Phone" name="contact_phone" value={settings.contact_phone}/><Field label="WhatsApp URL" name="contact_whatsapp" value={settings.contact_whatsapp}/><Field label="LinkedIn" name="social_linkedin" value={settings.social_linkedin}/><Field label="Instagram" name="social_instagram" value={settings.social_instagram}/><Field label="Facebook" name="social_facebook" value={settings.social_facebook}/><Field label="Behance" name="social_behance" value={settings.social_behance}/><div className="admin-editor-actions"><button className="admin-button" type="submit">Save Contact Settings</button></div></form>
        <div className="admin-note-block"><strong>Public platforms</strong><span>X و TikTok غير موجودين في النظام العام ولا يتم عرضهما.</span></div>
      </section> : null}

      {section === "homepage" ? <section className="admin-panel-section"><div className="admin-section-heading"><div><span className="eyebrow">FEATURED PROJECT</span><h2>اختيار العمل المميز</h2></div></div><form action={setFeaturedProject} className="admin-form"><label className="admin-field"><span className="admin-field-label">Homepage featured project</span><select name="project_id" defaultValue={projects.find(p=>p.homepage_featured)?.id || ""}><option value="">بدون مشروع مميز</option>{projects.filter(p=>p.published!==false).map(project=><option value={project.id} key={project.id}>{project.title} — {project.client_name}</option>)}</select></label><div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ الاختيار</button></div></form></section> : null}

      {section === "services" ? <section className="admin-panel-section"><div className="admin-section-heading"><div><span className="eyebrow">SERVICES MANAGER</span><h2>الخدمات</h2></div><Link className="text-link" href="/admin/dashboard?section=services">إضافة / حذف ↗</Link></div><div className="admin-note-block"><strong>أقسام الخدمات الأساسية</strong><span>Strategy & Branding · Campaigns & Advertising · Content & Communication · Digital Products</span></div><div className="admin-project-table">{(servicesResult.data||[]).map((service:any)=><details className="admin-editor" key={service.id}><summary><strong>{service.title}</strong><span>{service.visible===false?"مخفي":"ظاهر"} · {service.sort_order ?? 0}</span></summary><form action={saveServiceCms} className="admin-form admin-form-large"><input type="hidden" name="id" value={service.id}/><label className="admin-field"><span className="admin-field-label">Arabic title</span><input name="title" defaultValue={service.title||""}/></label><label className="admin-field"><span className="admin-field-label">English title</span><input name="title_en" defaultValue={service.title_en||""}/></label><label className="admin-field"><span className="admin-field-label">Arabic description</span><textarea name="description" defaultValue={service.description||""} rows={4}/></label><label className="admin-field"><span className="admin-field-label">English description</span><textarea name="description_en" defaultValue={service.description_en||""} rows={4}/></label><label className="admin-field"><span className="admin-field-label">CTA Arabic</span><input name="cta_label_ar" defaultValue={service.cta_label_ar||"اطلب هذه الخدمة ↙"}/></label><label className="admin-field"><span className="admin-field-label">CTA English</span><input name="cta_label_en" defaultValue={service.cta_label_en||"Request this service ↙"}/></label><label className="admin-field"><span className="admin-field-label">CTA URL</span><input name="cta_url" defaultValue={service.cta_url||""}/></label><label className="admin-field"><span className="admin-field-label">Sort order</span><input name="sort_order" type="number" defaultValue={service.sort_order||0}/></label><label className="admin-checks"><input type="checkbox" name="visible" defaultChecked={service.visible!==false}/> ظاهر على الموقع</label><div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ الخدمة</button></div></form></details>)}</div></section> : null}
      {section === "clients" ? <section className="admin-panel-section"><div className="admin-section-heading"><div><span className="eyebrow">CLIENT MANAGER</span><h2>العملاء</h2></div><Link className="text-link" href="/admin/dashboard?section=clients">إضافة / حذف ↗</Link></div><div className="admin-note-block"><strong>الـMarquee</strong><span>الصف الأول RTL والصف الثاني LTR، مع سرعة لكل عميل وalt text وrow assignment.</span></div><div className="admin-project-table">{(clientsResult.data||[]).map((client:any)=><details className="admin-editor" key={client.id}><summary><strong>{client.name}</strong><span>row {client.row_assignment||1} · {client.animation_speed||28}s</span></summary><form action={saveClientCms} className="admin-form admin-form-large"><input type="hidden" name="id" value={client.id}/><label className="admin-field"><span className="admin-field-label">Client name</span><input name="name" defaultValue={client.name||""}/></label><label className="admin-field"><span className="admin-field-label">Logo URL</span><input name="logo_url" defaultValue={client.logo_url||""}/></label><label className="admin-field"><span className="admin-field-label">Website URL</span><input name="website_url" defaultValue={client.website_url||""}/></label><label className="admin-field"><span className="admin-field-label">Alt text</span><input name="alt_text" defaultValue={client.alt_text||""}/></label><label className="admin-field"><span className="admin-field-label">Row</span><select name="row_assignment" defaultValue={String(client.row_assignment||1)}><option value="1">Row 1 — RTL</option><option value="2">Row 2 — LTR</option></select></label><label className="admin-field"><span className="admin-field-label">Animation speed (seconds)</span><input name="animation_speed" type="number" min="8" max="120" defaultValue={client.animation_speed||28}/></label><label className="admin-field"><span className="admin-field-label">Sort order</span><input name="sort_order" type="number" defaultValue={client.sort_order||0}/></label><label className="admin-checks"><input type="checkbox" name="visible" defaultChecked={client.visible!==false}/> ظاهر على الموقع</label><div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ العميل</button></div></form></details>)}</div></section> : null}
      {section === "team" ? <section className="admin-panel-section"><div className="admin-section-heading"><div><span className="eyebrow">TEAM MANAGER</span><h2>فريق العمل</h2></div></div><div className="admin-note-block"><strong>أشخاص حقيقيون فقط</strong><span>تم إخفاء بيانات placeholder من الواجهة العامة. أدر الأعضاء من مدير الفريق الحالي.</span></div><div className="admin-editor-actions"><Link className="admin-button" href="/admin/team">فتح مدير الفريق ↗</Link></div></section> : null}
      {section === "portfolio" ? <section className="admin-panel-section"><div className="admin-section-heading"><div><span className="eyebrow">PORTFOLIO MANAGER</span><h2>المشاريع</h2></div></div><div className="admin-note-block"><strong>المكان الصحيح للمشاريع</strong><span>المشروع المعزول من الصفحة الرئيسية أصبح جزءًا من قائمة الأعمال، مع featured selection أعلاه.</span></div><div className="admin-editor-actions"><Link className="admin-button" href="/admin/dashboard?section=projects">فتح مدير المشاريع ↗</Link></div></section> : null}
    </div>
  </main>;
}
