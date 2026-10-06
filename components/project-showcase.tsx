"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { ContentText, T, useLanguage } from "@/components/language";

const palettes = ["art-red", "art-ink", "art-red", "art-sand"];

export function ProjectShowcase({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const router = useRouter();
  const { language } = useLanguage();
  if (!projects.length) return <div className="empty-state"><T ar="أعمال جديدة قريبًا" en="New work coming soon"/> <span>✳</span></div>;
  return <div className={`project-showcase${opening ? " is-opening" : ""}`} onMouseLeave={() => !opening && setActive(null)}>
    {projects.slice(0, 4).map((project, index) => <motion.div
      key={project.id}
      className={`showcase-card ${palettes[index % palettes.length]} ${active === index ? "is-active" : ""} ${opening === project.slug ? "is-opening-card" : ""}`}
      animate={{ flexGrow: active === null ? 1 : active === index ? 3.45 : .85 }}
      transition={{ type: "spring", stiffness: 155, damping: 23, mass: .68 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .25 }}
    ><Link
      href={`/projects/${project.slug}`}
      className="showcase-link"
      data-cursor-type="project"
      onMouseEnter={() => setActive(index)}
      onFocus={() => setActive(index)}
      onClick={(event) => { event.preventDefault(); if (opening) return; setActive(index); setOpening(project.slug); window.setTimeout(() => router.push(`/projects/${project.slug}`), 480); }}
      aria-label={language === "ar" ? `عرض مشروع ${project.title}` : `View ${project.title}`}
    >
      {project.cover_image && <img src={project.cover_image} alt="" loading={index === 0 ? "eager" : "lazy"} />}
      <span className="showcase-index">0{index + 1}</span>
      <span className="showcase-name"><ContentText ar={project.title}/></span>
      <span className="showcase-category"><ContentText ar={project.category || project.client_name}/></span>
      <span className="showcase-arrow">↙</span>
    </Link></motion.div>)}
  </div>;
}
