import type { Metadata } from "next";
import { ContactFormV11 } from "@/components/contact-form-v11";
import { PageIntro } from "@/components/site";
import { T } from "@/components/language";
import { SocialLinks } from "@/components/social-links";
import { getSiteSettings } from "@/lib/site-settings";
import { getServices } from "@/lib/content";
import { getCmsPage } from "@/lib/cms";

export const metadata: Metadata = { title: "تواصل معنا", description: "شاركنا فكرتك، وسنبدأ الحديث عن مشروعك." };
export const dynamic = "force-dynamic";

export default async function Contact({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [settings, services, params, cms] = await Promise.all([getSiteSettings(), getServices(), searchParams, getCmsPage("contact")]);
  const phone = settings.contact_phone || "01040947991";
  const whatsapp = settings.contact_whatsapp || "https://wa.me/201040947991";
  const selectedService = params.service || "";
  return <>
    <PageIntro kicker={cms.kicker_ar} title={cms.title_ar} description={cms.description_ar} english={{ kicker: cms.kicker_en, title: cms.title_en, description: cms.description_en }} />
    <section className="content-wrap contact-layout" id="content">
      <div className="contact-form-column">
        <div className="eyebrow"><T ar="ابدأ من هنا" en="Start here" /></div>
        <h2><T ar={selectedService ? <>طلب خدمة: <span>{selectedService}</span></> : "صف لنا المشروع الذي تريد أن نبدأه معًا."} en={selectedService ? <>Service request: <span>{selectedService}</span></> : "Tell us about the project you’d like us to start together."} /></h2>
        <ContactFormV11 services={services} initialService={selectedService} />
      </div>
      <aside className="contact-info">
        <div className="eyebrow"><T ar="معلومات التواصل" en="Contact details" /></div>
        <div className="contact-info-block"><h3><T ar="الهاتف" en="Phone" /></h3><p><a href={`tel:${phone}`}>{phone}</a></p></div>
        <div className="contact-info-block"><h3><T ar="واتساب" en="WhatsApp" /></h3><p><a href={whatsapp} target="_blank" rel="noreferrer">01040947991 ↗</a></p></div>
        <div className="contact-info-block"><h3><T ar="الموقع" en="Location" /></h3><p><T ar={settings.contact_location || "القاهرة، مصر"} en={settings.contact_location || "Cairo, Egypt"} /></p></div>
        <div className="contact-info-block"><h3><T ar="ماذا يحدث بعد ذلك؟" en="What happens next" /></h3><p><T ar="بعد استلام رسالتك، سنتواصل معك لترتيب مكالمة قصيرة وفهم احتياجك." en="Once we receive your note, we’ll arrange a short call to understand what you need." /></p></div>
        <div className="contact-info-block contact-socials"><h3><T ar="تابعنا" en="Follow us" /></h3><SocialLinks label="Social media" /></div>
      </aside>
    </section>
  </>;
}
