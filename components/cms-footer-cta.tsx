import Link from "next/link";
import { T } from "@/components/language";
import { getCmsPage } from "@/lib/cms";

export async function CmsFooterCta() {
  const content = await getCmsPage("global");
  return <section className="global-cta">
    <Link href="/contact" className="cta-marquee" aria-label="Contact Mohamed Ragab Studio">
      <span className="cta-marquee-track">
        <span className="cta-marquee-group">
          <span><T ar={content.footer_headline_ar || "لديك فكرة جديدة؟"} en={content.footer_headline_en || "Have a new idea?"} /></span>
          <span><T ar={content.footer_headline_ar || "لديك فكرة جديدة؟"} en={content.footer_headline_en || "Have a new idea?"} /></span>
          <span><T ar={content.footer_headline_ar || "لديك فكرة جديدة؟"} en={content.footer_headline_en || "Have a new idea?"} /></span>
        </span>
        <span className="cta-marquee-group" aria-hidden="true">
          <span><T ar={content.footer_headline_ar || "لديك فكرة جديدة؟"} en={content.footer_headline_en || "Have a new idea?"} /></span>
          <span><T ar={content.footer_headline_ar || "لديك فكرة جديدة؟"} en={content.footer_headline_en || "Have a new idea?"} /></span>
          <span><T ar={content.footer_headline_ar || "لديك فكرة جديدة؟"} en={content.footer_headline_en || "Have a new idea?"} /></span>
        </span>
      </span>
    </Link>
    <div className="cta-caption"><T ar={content.footer_caption_ar || "احكِ لنا عن مشروعك ودعنا نحوله إلى تجربة تستحق أن تُرى."} en={content.footer_caption_en || "Tell us about your project and let’s turn it into an experience worth seeing."} /></div>
    <div className="cta-action-row"><Link className="text-link" href="/contact"><T ar={content.footer_cta_ar || "ابدأ مشروعك معنا ↗"} en={content.footer_cta_en || "Start a project with us ↗"} /></Link></div>
  </section>;
}
