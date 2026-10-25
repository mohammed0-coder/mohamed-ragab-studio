import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addMessageToGroup, createMessageGroup, deleteClient, deleteMessage, deleteMessageGroup, deleteProject, deleteService, duplicateProject, logout, removeMessageFromGroup, saveClient, saveProject, saveService, saveSettings, updateMessage } from "@/app/admin/actions";
import type { Client, ContactMessage, MessageGroup, Project, Service } from "@/lib/types";
import { AdminDeleteButton } from "@/components/admin-delete";
import { AdminUploader } from "@/components/admin-uploader";
import { AdminGalleryUploader } from "@/components/admin-gallery-uploader";
import { AdminOnboarding } from "@/components/admin-onboarding";
import { AdminFlash } from "@/components/admin-flash";
import { PUBLIC_SETTING_KEYS, getSiteSettings } from "@/lib/site-settings";
import { getAnalyticsSummary, type AnalyticsPeriod } from "@/lib/analytics";
import { PROJECT_CATEGORIES } from "@/lib/project-categories";
import { AdminMessageCenter } from "@/components/admin-message-center";
import { AdminNotifications } from "@/components/admin-notifications";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  contact_phone: "رقم الهاتف",
  contact_whatsapp: "رابط واتساب",
  contact_email: "البريد الإلكتروني",
  contact_location: "الموقع",
  social_facebook: "Facebook",
  social_instagram: "Instagram",
  social_whatsapp: "WhatsApp",
  social_linkedin: "LinkedIn",
  social_x: "X",
  social_behance: "Behance",
  footer_text: "نص الفوتر",
};

const periodLabels: Record<AnalyticsPeriod, string> = { day: "اليوم", week: "7 أيام", month: "30 يومًا", year: "12 شهرًا" };
const projectThemes = [
  { value: "olive", label: "Olive", swatch: "#ced5a7" },
  { value: "blue", label: "Blue", swatch: "#9faec1" },
  { value: "red", label: "Red", swatch: "#7c1e2d" },
  { value: "sand", label: "Sand", swatch: "#d9c6a5" },
  { value: "ink", label: "Ink", swatch: "#242321" },
  { value: "lilac", label: "Lilac", swatch: "#b7abc4" },
] as const;
const sectionTitles: Record<string, string> = { overview: "نظرة عامة", analytics: "التحليلات", projects: "المشاريع", clients: "العملاء", services: "الخدمات", messages: "الرسائل", settings: "إعدادات الموقع", help: "المساعدة" };
const allowedSections = Object.keys(sectionTitles);

function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return <label className={`admin-field ${className}`}><span className="admin-field-label">{label}</span>{hint && <small className="admin-field-hint">{hint}</small>}{children}</label>;
}

function CategorySelect({ value, required = false }: { value?: string; required?: boolean }) {
  const current = value || "Advertising";
  const isKnown = PROJECT_CATEGORIES.includes(current as (typeof PROJECT_CATEGORIES)[number]);
  return <select name="category" defaultValue={isKnown ? current : "Other"} required={required}>
    {PROJECT_CATEGORIES.map((category) => <option value={category} key={category}>{category}</option>)}
  </select>;
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ analytics?: string; section?: string; message?: string }> }) {
  const db = await createClient();
  if (!db) redirect("/admin");
  const { data: { user } } = await db.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin");

  const params = await searchParams;
  const requested = params.analytics as AnalyticsPeriod | undefined;
  const period: AnalyticsPeriod = requested && ["day", "week", "month", "year"].includes(requested) ? requested : "week";
  const requestedSection = String(params.section || "overview");
  const activeSection = allowedSections.includes(requestedSection) ? requestedSection : "overview";

  let projects: Project[] = [];
  let clients: Client[] = [];
  let services: Service[] = [];
  let messages: ContactMessage[] = [];
  let messageGroups: MessageGroup[] = [];
  let messageGroupMembers: { message_id: string; group_id: string }[] = [];
  let settings: Record<string, string> = {};
  let analytics: Awaited<ReturnType<typeof getAnalyticsSummary>> = null;
  let totalProjects = 0;
  let published = 0;
  let homepageFeatured = 0;
  let newMessages = 0;
  let totalClients = 0;
  let totalServices = 0;
  const galleryTextMap = new Map<string, string[]>();

  if (activeSection === "overview") {
    const [projectTotal, projectPublished, projectFeatured, clientCount, serviceCount, newMessageCount] = await Promise.all([
      db.from("projects").select("id", { count: "exact", head: true }),
      db.from("projects").select("id", { count: "exact", head: true }).eq("published", true),
      db.from("projects").select("id", { count: "exact", head: true }).eq("published", true).eq("homepage_featured", true),
      db.from("clients").select("id", { count: "exact", head: true }),
      db.from("services").select("id", { count: "exact", head: true }).eq("visible", true),
      db.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);
    totalProjects = projectTotal.count || 0;
    published = projectPublished.count || 0;
    homepageFeatured = projectFeatured.count || 0;
    totalClients = clientCount.count || 0;
    totalServices = serviceCount.count || 0;
    newMessages = newMessageCount.count || 0;
  } else if (activeSection === "analytics") {
    analytics = await getAnalyticsSummary(period);
  } else if (activeSection === "projects") {
    const [pr, gr] = await Promise.all([
      db.from("projects").select("*").order("sort_order").order("created_at", { ascending: false }),
      db.from("project_images").select("project_id,image_url").order("sort_order"),
    ]);
    projects = (pr.data || []) as Project[];
    const galleryByProject = new Map<string, string[]>();
    for (const image of (gr.data || []) as { project_id: string; image_url: string }[]) {
      galleryByProject.set(image.project_id, [...(galleryByProject.get(image.project_id) || []), image.image_url]);
    }
    for (const [projectId, images] of galleryByProject) galleryTextMap.set(projectId, images);
  } else if (activeSection === "clients") {
    const { data } = await db.from("clients").select("*").order("sort_order");
    clients = (data || []) as Client[];
  } else if (activeSection === "services") {
    const { data } = await db.from("services").select("*").order("sort_order");
    services = (data || []) as Service[];
  } else if (activeSection === "messages") {
    const [messageResult, groupResult, memberResult] = await Promise.all([
      db.from("contact_messages").select("*").order("created_at", { ascending: false }),
      db.from("message_groups").select("*").order("created_at", { ascending: true }),
      db.from("message_group_members").select("message_id,group_id"),
    ]);
    messages = (messageResult.data || []) as ContactMessage[];
    messageGroups = (groupResult.data || []) as MessageGroup[];
    messageGroupMembers = (memberResult.data || []) as { message_id: string; group_id: string }[];
    newMessages = messages.filter((message) => message.status === "new").length;
  } else if (activeSection === "settings") {
    settings = await getSiteSettings();
  }

  const galleryText = (id: string) => galleryTextMap.get(id)?.join("\n") || "";

  return <main className="admin-dashboard-shell">
    <AdminOnboarding />
    <AdminFlash />
    <aside className="admin-sidebar">
      <a className="admin-sidebar-brand" href="/">{["light","dark"].map((theme) => <img key={theme} className={`admin-brand-logo admin-brand-logo-${theme}`} src={theme === "dark" ? "/brand/MRS_White_Horizontal.png" : "/brand/MRS_Black_Horizontal.png"} alt="Mohamed Ragab Studio" />)}</a>
      <nav aria-label="Admin navigation">
        {allowedSections.map((key) => <a key={key} className={activeSection === key ? "is-active" : ""} href={`?section=${key}`}>{sectionTitles[key]}{key === "messages" && newMessages > 0 && <b>{newMessages}</b>}</a>)}
      </nav>
      <div className="admin-sidebar-bottom">
        <a href="/" target="_blank" rel="noreferrer">زيارة الموقع ↗</a>
        <form action={logout}><button type="submit">تسجيل الخروج</button></form>
      </div>
    </aside>

    <div className="admin-main" data-admin-section={activeSection}>
      <header className="admin-topbar">
        <div><span className="eyebrow">Studio CMS / CMS</span><h1>{sectionTitles[activeSection]}</h1></div>
        <div className="admin-topbar-actions"><AdminNotifications /><div className="admin-user">{user.email}</div></div>
      </header>

      <section id="overview" className="admin-view-section admin-view-overview admin-overview">
        <div><span>المشاريع</span><strong>{totalProjects}</strong><small>{published} منشور</small></div>
        <div><span>العملاء</span><strong>{totalClients}</strong><small>شريك محفوظ</small></div>
        <div><span>الخدمات</span><strong>{totalServices}</strong><small>خدمة نشطة</small></div>
        <div><span>رسائل جديدة</span><strong>{newMessages}</strong><small>تحتاج انتباهك</small></div><div><span>الأعمال الرئيسية</span><strong>{homepageFeatured}/4</strong><small>اختيار للواجهة الرئيسية</small></div>
      </section>


      <section className="admin-quick-grid" aria-label="وصول سريع">
        <a href="?section=projects"><strong>المشاريع</strong><span>إضافة · تعديل · حذف</span></a>
        <a href="?section=clients"><strong>العملاء</strong><span>إدارة الشركاء والشعارات</span></a>
        <a href="?section=services"><strong>الخدمات</strong><span>تعديل الخدمات وترتيبها</span></a>
        <a href="?section=messages"><strong>الرسائل</strong><span>{newMessages} رسائل جديدة</span></a>
        <a href="?section=analytics"><strong>التحليلات</strong><span>اليوم · أسبوع · شهر · سنة</span></a>
        <a href="?section=settings"><strong>إعدادات الموقع</strong><span>التواصل والسوشيال والفوتر</span></a>
      </section>
      <section id="analytics" className="admin-view-section admin-view-analytics admin-panel-section admin-analytics-panel">
        <div className="admin-section-heading"><div><span className="eyebrow">01 / الأداء</span><h2>زوار الموقع</h2></div><div className="analytics-periods">{(Object.keys(periodLabels) as AnalyticsPeriod[]).map((key) => <a className={key === period ? "is-active" : ""} href={`?section=analytics&analytics=${key}`} key={key}>{periodLabels[key]}</a>)}</div></div>
        {analytics ? <>
          <div className="analytics-cards">
            <div><span>الزوار</span><strong>{analytics.currentVisitors.toLocaleString("ar-EG")}</strong><small className={`trend-${analytics.trend}`}>{analytics.changePercent > 0 ? "+" : ""}{analytics.changePercent}% مقارنة بالفترة السابقة</small></div>
            <div><span>الزيارات المسجلة</span><strong>{analytics.currentViews.toLocaleString("ar-EG")}</strong><small>{analytics.label}</small></div>
            <div className={`analytics-status trend-${analytics.trend}`}><span>حالة الأداء</span><strong>{analytics.trend === "up" ? "الموقع يتحسن" : analytics.trend === "down" ? "يوجد هبوط" : "مستقر"}</strong><small>{analytics.trend === "up" ? "النمو الحالي جيد." : analytics.trend === "down" ? "راجع المحتوى ومصادر الزيارات." : "الأداء قريب من مستواه السابق."}</small></div>
          </div>
          <div className="analytics-chart" aria-label={`Analytics ${period}`}>
            {analytics.series.map((point) => <div className="analytics-bar-wrap" key={point.bucket} title={`${point.bucket}: ${point.visitors}`}><div className="analytics-bar" style={{ height: `${Math.max(4, Math.min(100, point.visitors * 100 / Math.max(1, ...analytics.series.map((item) => item.visitors))))}%` }} /><span>{point.bucket}</span></div>)}
          </div>
        </> : <div className="admin-empty">لم تبدأ الزيارات المسجلة بعد. سيظهر الرسم تلقائيًا بعد أول زيارات يوافق أصحابها على ملفات الارتباط.</div>}
      </section>

      <section id="projects" className="admin-view-section admin-view-projects admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">02 / المحتوى</span><h2>المشاريع</h2></div><a href="?section=projects#new-project" className="admin-inline-cta">+ مشروع جديد</a></div>
        <details id="new-project" className="admin-editor" open>
          <summary><strong>إضافة مشروع جديد</strong><span>معلومات أساسية ← المحتوى ← الصور ← النشر</span></summary>
          <form action={saveProject} className="admin-form admin-form-large project-editor">
            <Field label="عنوان المشروع" hint="الاسم الذي سيظهر للزائر."><input name="title" required /></Field>
            <Field label="الرابط المختصر" hint="حروف إنجليزية فقط، مثل nawa."><input name="slug" required /></Field>
            <Field label="اسم العميل" hint="اسم الشركة أو العميل الظاهر في بطاقة المشروع."><input name="client_name" /></Field>
            <Field label="التصنيف" hint="اختر تصنيفًا موحدًا لتجنب تكرار نفس التصنيف بأسماء مختلفة."><CategorySelect required /></Field>
            <Field label="الوصف المختصر"><input name="short_description" /></Field>
            <Field label="الخدمات" hint="افصل كل خدمة بفاصلة."><input name="services" /></Field>
            <Field label="الوصف الكامل" className="field-span"><textarea name="description" rows={3} /></Field>
            <Field label="التحدي" className="field-span"><textarea name="challenge" rows={3} /></Field>
            <Field label="الحل" className="field-span"><textarea name="solution" rows={3} /></Field>
            <Field label="النتائج" className="field-span"><textarea name="results" rows={3} /></Field>
            <Field label="النص التعريفي — عربي" hint="يظهر في صفحة المشروع تحت معلومات العميل." className="field-span"><textarea name="intro_text_ar" rows={5} /></Field>
            <Field label="Project intro — English" hint="English version shown in the project details page." className="field-span"><textarea name="intro_text_en" rows={5} /></Field>
            <div className="admin-theme-picker field-span"><span className="admin-field-label">ثيم صفحة المشروع</span><div className="admin-theme-options">{projectThemes.map((theme) => <label key={theme.value} className="admin-theme-option"><input type="radio" name="theme" value={theme.value} defaultChecked={theme.value === "red"} /><span className="admin-theme-swatch" style={{ background: theme.swatch }} /><span>{theme.label}</span></label>)}</div></div>
            <Field label="تاريخ البداية"><input name="start_date" type="date" /></Field>
            <Field label="نوع عرض المشروع" hint="معرض صور، موقع حي، أو رابط خارجي مثل Behance."><select name="showcase_type" defaultValue="gallery"><option value="gallery">معرض صور</option><option value="website">موقع حي</option><option value="external">رابط خارجي</option></select></Field>
            <Field label="رابط العرض" hint="للموقع الحي أو الرابط الخارجي."><input name="showcase_url" type="url" placeholder="https://..." /></Field>
            <Field label="تاريخ النهاية"><input name="end_date" type="date" /></Field>
            <Field label="ترتيب العرض"><input name="sort_order" type="number" defaultValue="0" /></Field>
            <div className="admin-upload-group project-image-upload-fields"><strong>صور المشروع</strong><p>ارفع صورة الغلاف، الصورة الرئيسية، ثم صور المعرض. لا تحتاج إلى نسخ روابط طويلة يدويًا.</p><label className="admin-field"><span className="admin-field-label">صورة الغلاف</span><input name="cover_image" /></label><AdminUploader fieldName="cover_image" bucket="project-images" folder="projects" /><label className="admin-field"><span className="admin-field-label">الصورة الرئيسية</span><input name="hero_image" /></label><AdminUploader fieldName="hero_image" bucket="project-images" folder="projects" /><Field label="روابط صور المعرض" hint="صورة في كل سطر." className="field-span"><textarea name="gallery_images" rows={4} id="gallery-new" /></Field><AdminGalleryUploader fieldId="gallery-new" /></div>
            <div className="admin-checks"><label><input type="checkbox" name="published" defaultChecked /> منشور على الموقع</label><label><input type="checkbox" name="featured" /> مميز</label><label><input type="checkbox" name="homepage_featured" /> ضمن الأربعة الرئيسية (أول 4)</label></div>
            <div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ المشروع</button></div>
          </form>
        </details>
        <div className="admin-project-table">
          {projects.map((project) => <details className="admin-editor" key={project.id}>
            <summary><strong>{project.title}</strong><span>{project.published ? "منشور" : "مسودة"} · {project.category || "بدون تصنيف"}</span></summary>
            <form action={saveProject} className="admin-form admin-form-large project-editor">
              <input type="hidden" name="id" value={project.id} />
              <Field label="عنوان المشروع"><input name="title" defaultValue={project.title} /></Field>
              <Field label="الرابط المختصر"><input name="slug" defaultValue={project.slug} /></Field>
              <Field label="اسم العميل"><input name="client_name" defaultValue={project.client_name} /></Field>
              <Field label="التصنيف"><CategorySelect value={project.category} /></Field>
              <Field label="الوصف المختصر"><input name="short_description" defaultValue={project.short_description} /></Field>
              <Field label="الخدمات"><input name="services" defaultValue={project.services.join(", ")} /></Field>
              <Field label="الوصف الكامل" className="field-span"><textarea name="description" rows={3} defaultValue={project.description || ""} /></Field>
              <Field label="التحدي" className="field-span"><textarea name="challenge" rows={3} defaultValue={project.challenge || ""} /></Field>
              <Field label="الحل" className="field-span"><textarea name="solution" rows={3} defaultValue={project.solution || ""} /></Field>
              <Field label="النتائج" className="field-span"><textarea name="results" rows={3} defaultValue={project.results || ""} /></Field>
              <Field label="النص التعريفي — عربي" hint="يظهر في صفحة المشروع تحت معلومات العميل." className="field-span"><textarea name="intro_text_ar" rows={5} defaultValue={project.intro_text_ar || project.intro_text || ""} /></Field>
              <Field label="Project intro — English" hint="English version shown in the project details page." className="field-span"><textarea name="intro_text_en" rows={5} defaultValue={project.intro_text_en || ""} /></Field>
              <div className="admin-theme-picker field-span"><span className="admin-field-label">ثيم صفحة المشروع</span><div className="admin-theme-options">{projectThemes.map((theme) => <label key={theme.value} className="admin-theme-option"><input type="radio" name="theme" value={theme.value} defaultChecked={(project.theme || "red") === theme.value} /><span className="admin-theme-swatch" style={{ background: theme.swatch }} /><span>{theme.label}</span></label>)}</div></div>
              <Field label="تاريخ البداية"><input name="start_date" type="date" defaultValue={project.start_date || ""} /></Field>
              <Field label="نوع عرض المشروع" hint="تطوير برمجيات = موقع حي داخل إطار MacBook. التصاميم والفيديو يمكنها استخدام رابط خارجي."><select name="showcase_type" defaultValue={project.showcase_type || (project.category === "Software Development" ? "website" : "gallery")}><option value="gallery">معرض صور</option><option value="website">موقع حي</option><option value="external">رابط خارجي</option></select></Field>
              <Field label="رابط العرض" hint="https://..."><input name="showcase_url" type="url" defaultValue={project.showcase_url || project.external_url || ""} /></Field>
              <Field label="تاريخ النهاية"><input name="end_date" type="date" defaultValue={project.end_date || ""} /></Field>
              <Field label="ترتيب العرض"><input name="sort_order" type="number" defaultValue={project.sort_order || 0} /></Field>
              <div className="admin-upload-group project-image-upload-fields"><strong>صور المشروع</strong><p>إذا كان المشروع «تطوير برمجيات» سيُستخدم رابط الموقع بدل صور المعرض.</p><label className="admin-field"><span className="admin-field-label">صورة الغلاف</span><input name="cover_image" defaultValue={project.cover_image || ""} /></label><AdminUploader fieldName="cover_image" bucket="project-images" folder="projects" /><label className="admin-field"><span className="admin-field-label">الصورة الرئيسية</span><input name="hero_image" defaultValue={project.hero_image || ""} /></label><AdminUploader fieldName="hero_image" bucket="project-images" folder="projects" /><Field label="روابط صور المعرض" hint="صورة في كل سطر." className="field-span"><textarea name="gallery_images" rows={4} defaultValue={galleryText(project.id)} id={`gallery-${project.id}`} /></Field><AdminGalleryUploader fieldId={`gallery-${project.id}`} /></div>
              <div className="admin-checks"><label><input type="checkbox" name="published" defaultChecked={project.published} /> منشور على الموقع</label><label><input type="checkbox" name="featured" defaultChecked={project.featured} /> مميز</label><label><input type="checkbox" name="homepage_featured" defaultChecked={project.homepage_featured} /> ضمن الأربعة الرئيسية (أول 4)</label></div>
              <div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ التعديلات</button></div>
            </form>
            <div className="admin-editor-actions"><form action={duplicateProject.bind(null, project.id)}><button className="admin-button admin-secondary" type="submit">نسخ المشروع</button></form><AdminDeleteButton action={deleteProject.bind(null, project.id)} /></div>
          </details>)}
        </div>
      </section>

      <section id="clients" className="admin-view-section admin-view-clients admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">03 / العلاقات</span><h2>العملاء والشركاء</h2></div></div>
        <form action={saveClient} className="admin-form admin-form-compact"><Field label="اسم العميل"><input name="name" required /></Field><Field label="رابط الموقع"><input name="website_url" type="url" /></Field><Field label="رابط الشعار"><input name="logo_url" type="url" /></Field><AdminUploader fieldName="logo_url" bucket="client-logos" folder="logos" /><Field label="ترتيب العرض"><input name="sort_order" type="number" defaultValue="0" /></Field><div className="admin-checks"><label><input type="checkbox" name="visible" defaultChecked /> ظاهر على الموقع</label></div><div className="admin-editor-actions"><button className="admin-button" type="submit">إضافة عميل</button></div></form>
        <div className="admin-project-table">{clients.map((client) => <details className="admin-editor" key={client.id}><summary><strong>{client.name}</strong><span>{client.visible ? "ظاهر" : "مخفي"}</span></summary><form action={saveClient} className="admin-form admin-form-compact"><input type="hidden" name="id" value={client.id} /><Field label="اسم العميل"><input name="name" defaultValue={client.name} /></Field><Field label="رابط الموقع"><input name="website_url" defaultValue={client.website_url || ""} /></Field><Field label="رابط الشعار"><input name="logo_url" defaultValue={client.logo_url || ""} /></Field><AdminUploader fieldName="logo_url" bucket="client-logos" folder="logos" /><Field label="ترتيب العرض"><input name="sort_order" type="number" defaultValue={client.sort_order || 0} /></Field><div className="admin-checks"><label><input type="checkbox" name="visible" defaultChecked={client.visible} /> ظاهر</label></div><div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ العميل</button></div></form><div className="admin-editor-actions"><AdminDeleteButton action={deleteClient.bind(null, client.id)} /></div></details>)}</div>
      </section>

      <section id="services" className="admin-view-section admin-view-services admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">04 / العرض</span><h2>الخدمات</h2></div></div>
        <form action={saveService} className="admin-form admin-form-compact"><Field label="رقم الخدمة"><input name="number" defaultValue="01" /></Field><Field label="اسم الخدمة"><input name="title" required /></Field><Field label="وصف الخدمة" className="field-span"><textarea name="description" rows={3} /></Field><Field label="العناصر" hint="افصل كل عنصر بفاصلة." className="field-span"><input name="items" /></Field><Field label="ترتيب العرض"><input name="sort_order" type="number" defaultValue="0" /></Field><div className="admin-checks"><label><input type="checkbox" name="visible" defaultChecked /> ظاهرة</label></div><div className="admin-editor-actions"><button className="admin-button" type="submit">إضافة خدمة</button></div></form>
        <div className="admin-project-table">{services.map((service) => <details className="admin-editor" key={service.id}><summary><strong>{service.number} · {service.title}</strong><span>{service.visible ? "ظاهرة" : "مخفية"}</span></summary><form action={saveService} className="admin-form admin-form-compact"><input type="hidden" name="id" value={service.id} /><Field label="رقم الخدمة"><input name="number" defaultValue={service.number} /></Field><Field label="اسم الخدمة"><input name="title" defaultValue={service.title} /></Field><Field label="وصف الخدمة" className="field-span"><textarea name="description" rows={3} defaultValue={service.description} /></Field><Field label="العناصر" hint="افصل كل عنصر بفاصلة." className="field-span"><input name="items" defaultValue={service.items.join(", ")} /></Field><Field label="ترتيب العرض"><input name="sort_order" type="number" defaultValue={service.sort_order || 0} /></Field><div className="admin-checks"><label><input type="checkbox" name="visible" defaultChecked={service.visible} /> ظاهرة</label></div><div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ الخدمة</button></div></form><div className="admin-editor-actions"><AdminDeleteButton action={deleteService.bind(null, service.id)} /></div></details>)}</div>
      </section>

      <section id="messages" className="admin-view-section admin-view-messages admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">05 / Inbox</span><h2>رسائل العملاء</h2></div><span className="admin-badge">{newMessages} جديدة</span></div>
        <AdminMessageCenter
          messages={messages}
          groups={messageGroups}
          memberships={messageGroupMembers}
          createGroup={createMessageGroup}
          deleteGroup={deleteMessageGroup}
          addToGroup={addMessageToGroup}
          removeFromGroup={removeMessageFromGroup}
          updateMessage={updateMessage}
          deleteMessage={deleteMessage}
          initialMessageId={params.message}
        />
      </section>

      <section id="settings" className="admin-view-section admin-view-settings admin-panel-section">
        <div className="admin-section-heading"><div><span className="eyebrow">06 / النظام</span><h2>إعدادات الموقع</h2></div></div>
        <form action={saveSettings} className="admin-form settings-form">
          {PUBLIC_SETTING_KEYS.map((key) => <Field label={labels[key]} key={key}>{key === "footer_text" ? <textarea name={key} rows={3} defaultValue={settings[key]} /> : <input name={key} defaultValue={settings[key]} />}</Field>)}
          <div className="admin-security-note"><strong>الحماية والرسائل</strong><p>الرسائل تُحفظ في Supabase فقط، ومفتاح الكتابة الداخلي لا يُرسل للمتصفح. نظام الحماية يحد الإرسال إلى رسالتين لكل عنوان شبكة خلال دقيقة مع حد إضافي للبريد نفسه، كما أن الإشعارات تعمل عبر Web Push للأدمن.</p></div>
          <div className="admin-editor-actions"><button className="admin-button" type="submit">حفظ إعدادات الموقع</button></div>
        </form>
      </section>

      <section id="help" className="admin-view-section admin-view-help admin-panel-section admin-help">
        <div className="admin-section-heading"><div><span className="eyebrow">07 / المساعدة</span><h2>ابدأ من هنا</h2></div></div>
        <div className="admin-help-grid"><article><b>إضافة مشروع</b><p>افتح المشاريع ← مشروع جديد ← املأ المعلومات الأساسية ← اختر الثيم ← اكتب النص العربي والإنجليزي ← ارفع الصور ← احفظ. المشروع الجديد يُنشر تلقائيًا.</p></article><article><b>الأربعة الرئيسية</b><p>فعّل «ضمن الأربعة الرئيسية» على أي عدد من المشاريع؛ الموقع يعرض أول أربعة منشورة حسب ترتيب العرض.</p></article><article><b>إدارة الرسائل</b><p>تمتلك كل رسالة حالة مستقلة: جديدة، مقروءة أو مؤرشفة. الرد يفتح بريد العميل مباشرة.</p></article><article><b>التحليلات</b><p>يبدأ التتبع بعد موافقة الزائر على ملفات الارتباط، وتظهر الأرقام حسب يوم أو أسبوع أو شهر أو سنة.</p></article></div>
      </section>
    </div>
  </main>;
}
