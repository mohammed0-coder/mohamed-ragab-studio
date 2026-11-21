import { createPublicClient } from "@/lib/supabase/public";

export type CmsPageKey = "homepage" | "about" | "contact" | "global";
export type CmsPageData = Record<string, string>;

export const CMS_DEFAULTS: Record<CmsPageKey, CmsPageData> = {
  homepage: {
    hero_title_ar: "نبني\nعلامات تُرى",
    hero_title_en: "We Build Brands\nThat Matter",
    hero_subtitle_ar: "استراتيجية، إبداع، وتجارب رقمية تصنع حضورًا واضحًا.",
    hero_subtitle_en: "Strategy, creativity, and digital experiences that build a clear presence.",
    clients_kicker_ar: "شركاء الرحلة",
    clients_kicker_en: "Our partners",
    clients_title_ar: "أناس نعتز\nبالعمل معهم.",
    clients_title_en: "People we’re\nproud to work with.",
    statement_ar: "نصنع ما يستحق\nأن يبقى في الذاكرة.",
    statement_en: "We make work\nthat stays with you.",
  },
  about: {
    kicker_ar: "استوديو إبداعي مستقل",
    title_ar: "نصنع الفرق عندما تتحول الفكرة إلى حضور.",
    description_ar: "نقرب بين الاستراتيجية والإبداع والتقنية لنصنع علامات وتجارب يمكن رؤيتها وفهمها وتذكرها.",
    kicker_en: "Independent creative studio",
    title_en: "We make the difference when ideas become presence.",
    description_en: "We connect strategy, creativity, and technology to build brands and experiences people can see, understand, and remember.",
    idea_label_ar: "فكرتنا",
    idea_label_en: "Our idea",
    idea_title_ar: "الإبداع عندنا ليس طبقة فوق الفكرة؛ هو الطريقة التي تصل بها الفكرة.",
    idea_title_en: "Creativity is not a layer on top of the idea; it is how the idea gets through.",
    strategy_title_ar: "نبدأ بالوضوح.",
    strategy_title_en: "We start with clarity.",
    strategy_body_ar: "نفهم الجمهور والسياق والهدف قبل أن نرسم أي شكل. ثم نحول ذلك إلى اتجاه يمكن للفريق أن يعمل عليه.",
    strategy_body_en: "We understand the audience, context, and goal before drawing a shape. Then we turn that into a direction the team can build on.",
    creative_title_ar: "نصنع لغة يمكن تذكرها.",
    creative_title_en: "We build a language people remember.",
    creative_body_ar: "من الهوية إلى الحركة، نبحث عن الفكرة البصرية التي تحمل شخصية العلامة ولا تعتمد على الزخرفة فقط.",
    creative_body_en: "From identity to motion, we look for the visual idea that carries the brand’s character instead of relying on decoration alone.",
    technology_title_ar: "نجعل الفكرة تعمل.",
    technology_title_en: "We make the idea work.",
    technology_body_ar: "نبني تجارب رقمية سريعة وواضحة وقابلة للنمو، بحيث لا يتوقف التصميم عند الشاشة الأولى.",
    technology_body_en: "We build digital experiences that are fast, clear, and ready to grow, so the design does not stop at the first screen.",
    team_label_ar: "الفريق",
    team_label_en: "The team",
    team_title_ar: "الأشخاص خلف العمل.",
    team_title_en: "The people behind the work.",
    team_intro_ar: "فريق متعدد التخصصات يجمع التفكير والتصميم والتقنية والإنتاج.",
    team_intro_en: "A multidisciplinary team bringing together strategy, design, technology, and production.",
    close_label_ar: "كيف نعمل",
    close_label_en: "How we work",
    close_body_ar: "نشارك مبكرًا، نختبر كثيرًا، ونبقى قريبين من التنفيذ حتى تظهر الفكرة في العالم الحقيقي.",
    close_body_en: "We share early, test often, and stay close to execution until the idea works in the real world.",
  },
  contact: {
    kicker_ar: "لنتحدث عن فكرتك",
    title_ar: "لنتواصل.",
    description_ar: "أخبرنا بما تريد إنجازه. اترك تفاصيل مشروعك ورسالتك، وسنعود إليك خلال يومي عمل.",
    kicker_en: "Tell us what you have in mind",
    title_en: "Get in touch.",
    description_en: "Tell us what you want to make. Share a few details and we’ll get back to you within two business days.",
  },
  global: {
    footer_headline_ar: "لديك فكرة جديدة؟ احكِ لنا عن مشروعك.",
    footer_headline_en: "Have a new idea? Tell us about your project.",
    footer_caption_ar: "احكِ لنا عن مشروعك ودعنا نحوله إلى تجربة تستحق أن تُرى.",
    footer_caption_en: "Tell us about your project and let’s turn it into an experience worth seeing.",
    footer_cta_ar: "ابدأ مشروعك معنا ↗",
    footer_cta_en: "Start a project with us ↗",
  },
};

export async function getCmsPage(key: CmsPageKey): Promise<CmsPageData> {
  const defaults = CMS_DEFAULTS[key];
  const db = createPublicClient();
  if (!db) return defaults;
  try {
    const { data, error } = await db.from("cms_pages").select("published,status").eq("key", key).maybeSingle();
    if (error || !data || data.status !== "published" || typeof data.published !== "object") return defaults;
    return { ...defaults, ...(data.published as CmsPageData) };
  } catch (error) {
    console.error("[cms] getCmsPage", error instanceof Error ? error.message : error);
    return defaults;
  }
}
