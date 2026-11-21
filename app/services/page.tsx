import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { PageIntro } from "@/components/site";
import { T } from "@/components/language";
import { ServiceDiscovery } from "@/components/service-discovery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "الخدمات", description: "استراتيجية وهوية وإبداع وحملات وتجارب رقمية." };

export default async function Services() {
  const services = await getServices();
  return <>
    <PageIntro kicker="من الاستراتيجية إلى التنفيذ" title="مهارات إبداعية، لأفكار جريئة." description="استكشف ما نقدمه، ثم اختر الخدمة الأقرب إلى احتياج مشروعك." english={{ kicker: "From strategy to execution", title: "Creative skills for bold ideas.", description: "Explore what we offer, then choose the service closest to your project." }} />
    <section className="content-wrap page-section" id="content">
      <div className="section-head"><div><div className="eyebrow"><T ar="اكتشف خدماتنا" en="Explore our services" /></div><h2><T ar={<>اختر ما تحتاجه،<br />ثم دعنا نكمل الطريق.</>} en={<>Choose what you need,<br />then let’s take it from there.</>} /></h2></div><p><T ar="طريقة عرض أبسط، تفاصيل أوضح، وخطوة مباشرة نحو طلب الخدمة." en="A clearer presentation, useful details, and a direct path to request the service." /></p></div>
      <ServiceDiscovery services={services} />
    </section>
  </>;
}
