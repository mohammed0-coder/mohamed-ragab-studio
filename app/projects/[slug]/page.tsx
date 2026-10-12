import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject, getProjects } from "@/lib/content";
import type { Project } from "@/lib/types";
import { ContentText, T } from "@/components/language";
import { ProjectGallery } from "@/components/project-gallery";
import { ProjectShare } from "@/components/project-share";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

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

  return <>
    <div className="acadio-project-wrapper" data-project-theme={project.theme || "red"}>
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
              <ContentText ar={project.intro_text_ar || project.intro_text || project.description || project.short_description} en={project.intro_text_en || project.description || project.short_description} />
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

        <div className="project-nav acadio-project-nav"><Link href="/projects">← <T ar="جميع المشاريع" en="All projects" /></Link>{all.length > 1 && <Link href={`/projects/${all[(index + 1) % all.length].slug}`}><T ar="المشروع التالي:" en="Next project:" /> <ContentText ar={all[(index + 1) % all.length].title} /> ↙</Link>}</div>
      </section>
    </div>
    
  </>;
}
