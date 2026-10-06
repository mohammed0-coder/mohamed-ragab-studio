import type { Metadata } from "next";
import { ContactForm, PageIntro } from "@/components/site";
import { T } from "@/components/language";
import { SocialLinks } from "@/components/social-links";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "شاركنا فكرتك، وسنبدأ الحديث عن مشروعك.",
};

export default async function Contact() {
  const settings = await getSiteSettings();
  const phone = settings.contact_phone || "+20";
  const whatsapp = settings.contact_whatsapp || "—";
  return <>
    <PageIntro
      kicker="لنتحدث عن فكرتك"
      title="لنتواصل."
      description="أخبرنا بما تريد إنجازه. اترك تفاصيل مشروعك ورسالتك، وسنعود إليك خلال يومي عمل."
      english={{
        kicker: "Tell us what you have in mind",
        title: "Get in touch.",
        description: "Tell us what you want to make. Share a few details and we’ll get back to you within two business days.",
      }}
    />
    <section className="content-wrap contact-layout" id="content">
      <div className="contact-form-column">
        <div className="eyebrow">01 / <T ar="ابدأ من هنا" en="Start here" /></div>
        <h2><T ar="صف لنا المشروع الذي تريد أن نبدأه معًا." en="Tell us about the project you’d like us to start together." /></h2>
        <ContactForm />
      </div>
      <aside className="contact-info">
        <div className="eyebrow">02 / <T ar="معلومات التواصل" en="Contact details" /></div>
        <div className="contact-info-block">
          <h3><T ar="أرسل لنا رسالة" en="Send us a message" /></h3>
          <p><T ar="استخدم النموذج واكتب لنا عن فكرتك. سنراجع رسالتك ونتواصل معك خلال يومي عمل." en="Use the form to tell us about your idea. We’ll review your message and reply within two business days." /></p>
        </div>
        <div className="contact-info-block">
          <h3><T ar="الموقع" en="Location" /></h3>
          <p><T ar={settings.contact_location || "القاهرة، مصر"} en={settings.contact_location || "Cairo, Egypt"} /></p>
        </div>
        <div className="contact-info-block">
          <h3><T ar="الهاتف" en="Phone" /></h3>
          <p><a href={`tel:${phone}`}>{phone}</a></p>
        </div>
        <div className="contact-info-block">
          <h3><T ar="واتساب" en="WhatsApp" /></h3>
          <p>{whatsapp.startsWith("http") ? <a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a> : whatsapp}</p>
        </div>
        <div className="contact-info-block">
          <h3><T ar="ماذا يحدث بعد ذلك؟" en="What happens next" /></h3>
          <p><T ar="بعد استلام رسالتك، سنتواصل معك لترتيب مكالمة قصيرة وفهم احتياجك." en="Once we receive your note, we’ll arrange a short call to understand what you need." /></p>
        </div>
        <div className="contact-info-block contact-socials">
          <h3><T ar="تابعنا" en="Follow us" /></h3>
          <SocialLinks label="Social media" />
        </div>
      </aside>
    </section>
  </>;
}
