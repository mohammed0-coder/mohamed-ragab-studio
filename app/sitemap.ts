import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
  const staticRoutes = ["/", "/projects", "/about", "/clients", "/services", "/contact"];
  const entries = staticRoutes.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.7 }));
  try {
    const projects = await getProjects();
    return [...entries, ...projects.map((project) => ({ url: `${base}/projects/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }))];
  } catch {
    return entries;
  }
}
