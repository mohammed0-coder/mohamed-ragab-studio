import type { Metadata } from "next";
import Image from "next/image";
import { CTA, PageIntro } from "@/components/site";
import { T } from "@/components/language";

export const metadata: Metadata = { title: "من نحن", description: "استوديو إبداعي مستقل في القاهرة." };

const team = [
  { name: "فريق الاستراتيجية", role: "الاستراتيجية والهوية", bio: "يحوّل الرؤى إلى اتجاه واضح للعلامة التجارية وتجربة متماسكة.", enName: "Strategy team", enRole: "Strategy & Identity", enBio: "Turns a vision into a clear brand direction and a consistent experience." },
  { name: "فريق الإبداع", role: "الإبداع والتصميم", bio: "يبني أفكارًا بصرية تترجم شخصية العلامة إلى لغة يمكن تذكرها.", enName: "Creative team", enRole: "Creative & Design", enBio: "Creates visual ideas that translate a brand’s character into a memorable language." },
  { name: "فريق التطوير", role: "التطوير الرقمي", bio: "يصمم ويطوّر تجارب رقمية سهلة الاستخدام وجاهزة للنمو.", enName: "Development team", enRole: "Digital Development", enBio: "Designs and builds digital experiences that are easy to use and ready to grow." },
  { name: "فريق الإنتاج", role: "الإنتاج والمحتوى", bio: "ينتج محتوى مرئيًا وسردًا متماسكًا يمنح الفكرة حضورًا عبر القنوات.", enName: "Production team", enRole: "Production & Content", enBio: "Produces visual content and clear storytelling that gives ideas presence across channels." },
];

export default function About() {
  return <>
    <PageIntro kicker="استوديو إبداعي مستقل" title="نحن نصنع الفرق." description="نحن فريق صغير بطموح كبير؛ نساعد الأفكار الجيدة أن تجد شكلها وصوتها ومكانها." english={{ kicker: "Independent creative studio", title: "We make a difference.", description: "A small team with big ambition, helping good ideas find their shape, voice, and place." }} />
    <section className="content-wrap page-section" id="content">
      <div className="about-block"><div className="eyebrow"><T ar="01 / حكايتنا" en="01 / Our story" /></div><div><h2><T ar="بداية كل شيء، سؤال." en="It starts with a question." /></h2><p><T ar="كيف تصبح الفكرة حضورًا حقيقيًا؟ نبدأ بالاستماع، نفهم الناس والسياق، ثم نبني استراتيجية تمنح الإبداع اتجاهًا. نعمل كفريق واحد من الفكرة إلى التنفيذ، ونؤمن أن التفاصيل الصغيرة تصنع الفرق الكبير." en="How does an idea become a real presence? We listen, understand people and context, then build a strategy that gives creativity direction. We work as one team from idea to execution, because small details make a big difference." /></p></div></div>
      <div className="about-statement"><T ar={<>نؤمن أن الإبداع ليس زينة للفكرة، بل هو ما يجعلها <span style={{ color: "var(--muted)" }}>تُرى وتُفهم وتُتذكر.</span></>} en={<>Creativity is not decoration. It helps an idea <span style={{ color: "var(--muted)" }}>be seen, understood, and remembered.</span></>} /></div>
      <div className="about-block"><div className="eyebrow"><T ar="02 / طريقتنا" en="02 / How we work" /></div><div><h2><T ar="وضوحٌ يقود إلى عمل أفضل." en="Clarity leads to better work." /></h2><p><T ar="نصغي جيدًا، نختبر الفرضيات، نشارك العمل مبكرًا، ونبقى قريبين من شركائنا في كل مرحلة. هدفنا ليس تسليم الملفات؛ هدفنا أن نرى الفكرة تعمل في العالم الحقيقي." en="We listen closely, test assumptions, share work early, and stay close to our partners at every stage. Our goal is to see the idea work in the real world." /></p></div></div>
      <div className="about-block"><div className="eyebrow"><T ar="03 / ما نؤمن به" en="03 / What we believe" /></div><div><h2><T ar="الفضول، الشجاعة، والمسؤولية." en="Curiosity, courage, and care." /></h2><p><T ar="نظل فضوليين تجاه الناس والثقافة والتقنية. نختار الأفكار الشجاعة، ونفكر في أثر ما نصنعه. هكذا نبني علاقات عمل طويلة وأعمالًا نشعر بالفخر بها." en="We stay curious about people, culture, and technology. We choose brave ideas and think about their impact. That is how we build lasting relationships and work we are proud of." /></p></div></div>
      <div className="team-section"><div className="section-head"><div><div className="eyebrow"><T ar="04 / الأشخاص" en="04 / The people" /></div><h2><T ar="فريق يصنع الفكرة." en="The people behind the ideas." /></h2></div></div><div className="team-grid">{team.map((person) => <article className="team-card" key={person.role}><Image src="/images/image-placeholder.svg" alt="" width={1200} height={760} className="team-photo" /><div className="team-card-copy"><span className="team-role"><T ar={person.role} en={person.enRole} /></span><h3><T ar={person.name} en={person.enName} /></h3><p><T ar={person.bio} en={person.enBio} /></p></div></article>)}</div></div>
    </section>
    <CTA />
  </>;
}
