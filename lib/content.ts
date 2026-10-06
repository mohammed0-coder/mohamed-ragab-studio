import { createPublicClient } from "@/lib/supabase/public";
import { seedClients, seedProjects, seedServices } from "@/lib/seed";
import type { Client, Project, Service } from "@/lib/types";

export async function getProjects(): Promise<Project[]> {
  const db=createPublicClient(); if(!db) return seedProjects;
  const {data,error}=await db.from("projects").select("*").eq("published",true).order("sort_order");
  if(error || !data?.length)return seedProjects;
  const projects = (data || []) as Project[];
  const { data: themeRows } = await db.from("site_settings").select("key,value").like("key", "project_theme:%");
  const themeBySlug = new Map<string, string>();
  for (const row of themeRows || []) {
    const key = String((row as {key?: string}).key || "");
    const slug = key.startsWith("project_theme:") ? key.slice("project_theme:".length) : "";
    const value = (row as {value?: {text?: string} | null}).value?.text;
    if (slug && value) themeBySlug.set(slug, value);
  }
  const { data: gallery } = await db.from("project_images").select("project_id,image_url,alt_text,sort_order").in("project_id", projects.map((project) => project.id)).order("sort_order");
  const galleryByProject = new Map<string, { url: string; alt: string }[]>();
  for (const image of gallery || []) {
    const entry = image as { project_id: string; image_url: string; alt_text: string | null };
    const images = galleryByProject.get(entry.project_id) || [];
    images.push({ url: entry.image_url, alt: entry.alt_text || "" });
    galleryByProject.set(entry.project_id, images);
  }
  return Promise.all(projects.map(async project=>{
    const signed=async(path:string|null|undefined)=>{if(!path||/^https?:\/\//i.test(path))return path||null;const {data:result}=await db.storage.from("project-images").createSignedUrl(path,3600);return result?.signedUrl||null;};
    const gallery_images = await Promise.all((galleryByProject.get(project.id) || []).map(async image => ({ ...image, url: await signed(image.url) || "" })));
    return {...project,theme:themeBySlug.get(project.slug) || null,hero_image:await signed(project.hero_image),cover_image:await signed(project.cover_image),gallery_images:gallery_images.filter(image => image.url)};
  }));
}
export async function getProject(slug:string):Promise<Project|null>{return (await getProjects()).find(p=>p.slug===slug)||null;}
export async function getClients():Promise<Client[]>{const db=createPublicClient();if(!db)return seedClients;const {data,error}=await db.from("clients").select("*").eq("visible",true).order("sort_order");return error?seedClients:(data as Client[]);}
export async function getServices():Promise<Service[]>{const db=createPublicClient();if(!db)return seedServices;const {data,error}=await db.from("services").select("*").eq("visible",true).order("sort_order");return error?seedServices:(data as Service[]);}

