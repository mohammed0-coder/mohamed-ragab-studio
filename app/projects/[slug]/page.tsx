import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getProjects } from "@/lib/content";
import type { Project } from "@/lib/types";
import { CTA } from "@/components/site";
import { ContentText, T } from "@/components/language";
import { ProjectGallery } from "@/components/project-gallery";
import { ProjectShare } from "@/components/project-share";

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  return project
    ? { title: project.title, description: project.short_description, alternates: { canonical: `/projects/${project.slug}` }, openGraph: { title: project.title, description: project.short_description, images: project.hero_image || project.cover_image ? [project.hero_image || project.cover_image!] : [] } }
    : { title: "المشروع غير موجود" };
}

function ProjectCover({ project, className = "" }: { project: Project; className?: string }) {
  const image = project.cover_image || project.hero_image;
  return image
    ? <img className={className} src={image} alt={project.title} />
    : <div className={`project-art art-red ${className}`}><div className="art-top"><span><ContentText ar={project.client_name} /></span><span><T ar="عمل مختار" en="Selected work" /></span></div><div className="art-shape shape-one" /><div className="art-shape shape-two" /><div className="art-word" dir="rtl"><ContentText ar={project.title} /></div><div className="art-caption"><ContentText ar={project.category} /></div></div>;
}

const placeholderText = {
  ar: "يمثل هذا المشروع واحدًا من أهم الأعمال التي قمنا بتنفيذها، حيث جمعنا بين الإبداع والتخطيط الاستراتيجي لتحقيق نتائج استثنائية. بدأت الرحلة بفهم عميق لاحتياجات العميل ورؤيته، ثم عملنا على تطوير هوية بصرية قوية تعكس قيم المشروع وتخاطب الجمهور المستهدف بلغة مؤثرة. من خلال فريق عمل متخصص ومنهجية عمل مدروسة، استطعنا تحويل التحديات إلى فرص وصنع تجربة متكاملة تترك أثرًا واضحًا.",
  en: "This project represents one of the most significant works we have executed, combining creativity with strategic planning to achieve exceptional results. The journey began with a deep understanding of the client's needs and vision, followed by developing a strong visual identity that reflects the project's values and speaks to the target audience in an impactful way. Through a specialized team and a well-considered methodology, we were able to turn challenges into opportunities and create a comprehensive experience that leaves a lasting impact."
};

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const all = await getProjects();
  const index = all.findIndex((item) => item.slug === slug);
  const galleryImages = project.gallery_images?.length
    ? project.gallery_images
    : Array.from(new Set([project.cover_image, project.hero_image].filter((image): image is string => Boolean(image)))).map((url) => ({ url, alt: "" }));

  const projectUrl = `/projects/${project.slug}`;
  const themeClass = ({wine:"project-theme-wine",olive:"project-theme-olive",blue:"project-theme-blue",sand:"project-theme-sand",lilac:"project-theme-lilac",ink:"project-theme-ink",coral:"project-theme-coral"} as Record<string,string>)[project.theme || ""] || "project-theme-auto";

  return <>
    <div className={`acadio-project-wrapper ${themeClass}`}>
      <section className="acadio-project-hero">
        <h1 className="acadio-project-title"><ContentText ar={project.title} /></h1>
        
        <div className="acadio-project-hero-bottom">
          <a href="#project-content" className="acadio-scroll-explore">
            <T ar="مرر لتكتشف" en="SCROLL TO EXPLORE" /> <i className="arrow-icon-down">↘</i>
          </a>
          
          <div className="acadio-hero-share">
            <span className="share-label"><T ar="شارك المشروع:" en="SHARE PROJECT:" /></span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`} target="_blank" rel="noreferrer">FB</a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(projectUrl)}`} target="_blank" rel="noreferrer">TW</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`} target="_blank" rel="noreferrer">LI</a>
            <a href={`https://wa.me/?text=${encodeURIComponent(project.title + " " + projectUrl)}`} target="_blank" rel="noreferrer">WA</a>
          </div>
        </div>
      </section>

      <div className="acadio-project-cover">
        <ProjectCover project={project} className="full-width-image" />
      </div>

      <section id="project-content" className="acadio-project-content">
        <div className="project-intro-flex">
          <div className="project-intro-left">
            <h6 className="project-client-name">/<ContentText ar={project.client_name} /></h6>
            <hr className="acadio-hr" />
          </div>
          <div className="project-intro-right">
            <p className="project-description-large">
              <ContentText ar={(project.intro_text || project.description) || placeholderText.ar} en={placeholderText.en} />
            </p>

            {project.challenge && <>
              <h5 className="acadio-section-title"><T ar="التحدي" en="The challenge" /></h5>
              <p className="project-description-large"><ContentText ar={project.challenge} /></p>
            </>}

            {project.solution && <>
              <h5 className="acadio-section-title"><T ar="الحل" en="The solution" /></h5>
              <p className="project-description-large"><ContentText ar={project.solution} /></p>
            </>}

            {project.results && <>
              <h5 className="acadio-section-title"><T ar="الأثر" en="The impact" /></h5>
              <p className="project-description-large"><ContentText ar={project.results} /></p>
            </>}
          </div>
        </div>

        {/* Gallery carousel with hidden scrollbar */}
        {!!galleryImages.length && <section className="project-gallery-acadio" aria-label="Project gallery">
          <ProjectGallery images={galleryImages} projectTitle={project.title} />
        </section>}

        <nav className="project-nav acadio-project-nav"><Link className="project-nav-prev" href="/projects">← <T ar="جميع المشاريع" en="All projects" /></Link>{all.length > 1 && <Link className="project-nav-next" href={`/projects/${all[(index + 1) % all.length].slug}`}><T ar="المشروع التالي:" en="Next project:" /> <ContentText ar={all[(index + 1) % all.length].title} /> ↙</Link>}</nav>
      </section>
    </div>
    <CTA />
  </>;
}
