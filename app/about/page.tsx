import type { Metadata } from "next";
import { PageIntro } from "@/components/site";
import { T } from "@/components/language";
import { getCmsPage } from "@/lib/cms";
import { createPublicClient } from "@/lib/supabase/public";
import type { TeamMember } from "@/lib/types";

export const metadata: Metadata = { title: "من نحن", description: "Mohamed Ragab Studio — استوديو إبداعي للهوية والتصميم والتجارب الرقمية." };

export default async function About() {
  const [cms, db] = await Promise.all([getCmsPage("about"), Promise.resolve(createPublicClient())]);
  const { data } = db ? await db.from("team_members").select("*").eq("visible", true).order("sort_order").order("created_at") : { data: null };
  const team = ((data || []) as TeamMember[]).filter(person => person.name_ar && person.role_ar && !String(person.image_url || "").includes("image-placeholder.svg"));
  return <>
    <PageIntro kicker={cms.kicker_ar} title={cms.title_ar} description={cms.description_ar} english={{ kicker: cms.kicker_en, title: cms.title_en, description: cms.description_en }} />
    <section className="content-wrap page-section about-v12" id="content">
      <div className="about-v11-statement"><span className="eyebrow"><T ar={cms.idea_label_ar} en={cms.idea_label_en} /></span><h2><T ar={cms.idea_title_ar} en={cms.idea_title_en} /></h2></div>
      <div className="about-v11-grid">
        <article><span className="eyebrow"><T ar="الاستراتيجية" en="Strategy" /></span><h3><T ar={cms.strategy_title_ar} en={cms.strategy_title_en} /></h3><p><T ar={cms.strategy_body_ar} en={cms.strategy_body_en} /></p></article>
        <article><span className="eyebrow"><T ar="الإبداع" en="Creative" /></span><h3><T ar={cms.creative_title_ar} en={cms.creative_title_en} /></h3><p><T ar={cms.creative_body_ar} en={cms.creative_body_en} /></p></article>
        <article><span className="eyebrow"><T ar="التقنية" en="Technology" /></span><h3><T ar={cms.technology_title_ar} en={cms.technology_title_en} /></h3><p><T ar={cms.technology_body_ar} en={cms.technology_body_en} /></p></article>
      </div>
      <div className="about-v11-people">
        <div className="section-head"><div><span className="eyebrow"><T ar={cms.team_label_ar} en={cms.team_label_en} /></span><h2><T ar={cms.team_title_ar} en={cms.team_title_en} /></h2></div><p><T ar={cms.team_intro_ar} en={cms.team_intro_en} /></p></div>
        {team.length ? <div className="team-grid">{team.map(person => <article className="team-card team-card-v10" key={person.id}><div className="team-photo-wrap">{person.image_url && <img className="team-photo" src={person.image_url} alt={person.name_ar} loading="lazy" />}</div><div className="team-card-copy"><span className="team-role"><T ar={person.role_ar} en={person.role_en} /></span><h3><T ar={person.name_ar} en={person.name_en} /></h3><p><T ar={person.bio_ar} en={person.bio_en} /></p></div></article>)}</div> : null}
      </div>
      <div className="about-v11-close"><span className="eyebrow"><T ar={cms.close_label_ar} en={cms.close_label_en} /></span><p><T ar={cms.close_body_ar} en={cms.close_body_en} /></p></div>
    </section>
  </>;
}
