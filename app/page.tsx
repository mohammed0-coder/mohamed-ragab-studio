import Link from "next/link";
import { getClients, getProjects, getServices } from "@/lib/content";
import { getCmsPage } from "@/lib/cms";
import { CmsFooterCta } from "@/components/cms-footer-cta";
import { ProjectShowcase } from "@/components/project-showcase";
import { ClientMarquee } from "@/components/client-marquee";
import { ContentText, T } from "@/components/language";
import { GsapHeadline, MotionReveal } from "@/components/motion";

export const dynamic = "force-dynamic";

function Lines({ value }: { value: string }) {
  return <>{value.split("\n").map((line, index) => <span key={`${line}-${index}`}>{line}{index < value.split("\n").length - 1 && <br />}</span>)}</>;
}

export default async function Home() {
  const [projects, clients, services, cms] = await Promise.all([getProjects(), getClients(), getServices(), getCmsPage("homepage")]);
  const latest = [...projects.filter(p => p.homepage_featured), ...projects.filter(p => !p.homepage_featured)].slice(0, 4);
  const featured = projects.filter(p => !latest.some(item => item.id === p.id));
  return <>
    <section className="home-hero acadio-hero">
      <div className="hero-composition acadio-composition">
        <h1><GsapHeadline><T ar={<><span className="hero-line-one"><Lines value={cms.hero_title_ar || "نبني\nعلامات تُرى"} /></span></>} en={<><span className="hero-line-one"><Lines value={cms.hero_title_en || "We Build Brands\nThat Matter"} /></span></>} /></GsapHeadline></h1>
        <MotionReveal delay={0.15}><div className="hero-subtitle-wrapper"><p className="hero-subtitle"><T ar={cms.hero_subtitle_ar} en={cms.hero_subtitle_en} /></p></div></MotionReveal>
      </div>
      <MotionReveal className="hero-bottom-motion" delay={.2}>
        <div className="hero-bottom acadio-bottom">
          <div className="hero-bottom-left"><a className="hero-scroll-btn" href="#latest"><div className="scroll-icon-wrap"><i className="arrow-icon-down">↓</i></div><span className="scroll-text"><T ar="مرر لتكتشف" en="Scroll To Explore" /></span></a></div>
          <div className="hero-bottom-right"><span className="hero-latest"><T ar="أحدث أعمالنا" en="Our Latest Endeavors" /></span></div>
        </div>
      </MotionReveal>
    </section>

    <section className="content-wrap clients-marquee-home section" aria-label="شركاء الرحلة">
      <div className="section-head clients-marquee-head">
        <div><div className="eyebrow"><T ar={cms.clients_kicker_ar || "شركاء الرحلة"} en={cms.clients_kicker_en || "Our partners"} /></div><h2><T ar={<Lines value={cms.clients_title_ar || "أناس نعتز\nبالعمل معهم."} />} en={<Lines value={cms.clients_title_en || "People we’re\nproud to work with."} />} /></h2></div>
        <Link className="text-link" href="/clients"><T ar="كل الشركاء ↙" en="All partners ↙" /></Link>
      </div>
      <ClientMarquee clients={clients} />
    </section>

    <section className="content-wrap section" id="latest">
      <div className="section-head"><div><div className="eyebrow"><T ar="مشاريع مختارة" en="Selected work" /></div><h2><T ar={<>من الفكرة<br />إلى الأثر.</>} en={<>From idea<br />to impact.</>} /></h2></div><Link className="text-link" href="/projects"><T ar="كل المشاريع ↙" en="All projects ↙" /></Link></div>
      <ProjectShowcase projects={latest} />
    </section>

    <section className="content-wrap services-home">
      <div className="section-head"><div><div className="eyebrow"><T ar="ما نفعله" en="What we do" /></div><h2><T ar={<>فكرة واحدة،<br />طرق كثيرة.</>} en={<>One idea,<br />many ways.</>} /></h2></div><p><T ar="من أول سؤال استراتيجي إلى آخر تفصيلة رقمية؛ نعمل معك على الصورة كاملة." en="From the first strategic question to the final digital detail, we work with you on the whole picture." /></p></div>
      <div className="service-list">{services.slice(0, 4).map(s => <div className="service-row" key={s.id}><Link href={`/contact?service=${encodeURIComponent(s.title)}`}><ContentText ar={s.title} en={s.title_en || s.title} /></Link></div>)}</div>
      <div style={{ marginTop: 28 }}><Link className="text-link" href="/services"><T ar="اكتشف خدماتنا ↙" en="Explore our services ↙" /></Link></div>
    </section>

    <section className="content-wrap statement">
      <div className="eyebrow"><T ar="أعمالنا" en="Our work" /></div>
      <h2><T ar={<Lines value={cms.statement_ar || "نصنع ما يستحق\nأن يبقى في الذاكرة."} />} en={<Lines value={cms.statement_en || "We make work\nthat stays with you."} />} /></h2>
    </section>

    <section className="content-wrap section">
      <div className="section-head"><div><div className="eyebrow"><T ar="مختارات من أعمالنا" en="A few more projects" /></div><h2><T ar={<>أثرٌ وراء<br />كل فكرة.</>} en={<>Impact behind<br />every idea.</>} /></h2></div><Link className="text-link" href="/projects"><T ar="استكشف الأعمال ↙" en="Explore the work ↙" /></Link></div>
      <div className="project-rows">{featured.map((p) => <Link className="project-row" href={`/projects/${p.slug}`} key={p.id}><span className="project-row-title"><strong><ContentText ar={p.title} /></strong><small><ContentText ar={p.client_name} /> · <ContentText ar={p.category} /></small></span><span className="project-row-preview">{p.cover_image && <img src={p.cover_image} alt="" loading="lazy" />}<b>↗</b></span></Link>)}</div>
    </section>
    <CmsFooterCta />
  </>;
}
