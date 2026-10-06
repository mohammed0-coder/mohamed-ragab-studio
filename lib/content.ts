import { createPublicClient } from "@/lib/supabase/public";
import { seedClients, seedProjects, seedServices } from "@/lib/seed";
import type { Client, Project, Service } from "@/lib/types";

type PublicDb = NonNullable<ReturnType<typeof createPublicClient>>;

function assetUrl(db: PublicDb, path: string | null | undefined) {
  if (!path || /^https?:\/\//i.test(path)) return path || null;
  return db.storage.from("project-images").getPublicUrl(path).data.publicUrl || null;
}

async function hydrateProject(db: PublicDb, project: Project) {
  try {
    const { data: gallery } = await db
      .from("project_images")
      .select("project_id,image_url,alt_text,sort_order")
      .eq("project_id", project.id)
      .order("sort_order");

    return {
      ...project,
      hero_image: assetUrl(db, project.hero_image),
      cover_image: assetUrl(db, project.cover_image),
      gallery_images: (gallery || [])
        .map((image) => ({
          url: assetUrl(db, image.image_url) || "",
          alt: image.alt_text || project.title,
        }))
        .filter((image) => image.url),
    };
  } catch (error) {
    console.error("[content] hydrateProject", error instanceof Error ? error.message : error);
    return {
      ...project,
      hero_image: assetUrl(db, project.hero_image),
      cover_image: assetUrl(db, project.cover_image),
      gallery_images: [],
    };
  }
}

export async function getProjects(): Promise<Project[]> {
  const db = createPublicClient();
  if (!db) return seedProjects;
  try {
    const { data, error } = await db.from("projects").select("*").eq("published", true).order("sort_order");
    if (error) {
      console.error("[content] getProjects", error.message);
      return [];
    }
    return Promise.all(((data || []) as Project[]).map((project) => hydrateProject(db, project)));
  } catch (error) {
    console.error("[content] getProjects", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getProject(slug: string): Promise<Project | null> {
  const db = createPublicClient();
  if (!db) return seedProjects.find((project) => project.slug === slug) || null;
  try {
    const { data, error } = await db.from("projects").select("*").eq("published", true).eq("slug", slug).maybeSingle();
    if (error) {
      console.error("[content] getProject", error.message);
      return null;
    }
    return data ? hydrateProject(db, data as Project) : null;
  } catch (error) {
    console.error("[content] getProject", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getClients(): Promise<Client[]> {
  const db = createPublicClient();
  if (!db) return seedClients;
  try {
    const { data, error } = await db.from("clients").select("*").eq("visible", true).order("sort_order");
    if (error) {
      console.error("[content] getClients", error.message);
      return [];
    }
    return (data || []) as Client[];
  } catch (error) {
    console.error("[content] getClients", error instanceof Error ? error.message : error);
    return [];
  }
}

export async function getServices(): Promise<Service[]> {
  const db = createPublicClient();
  if (!db) return seedServices;
  try {
    const { data, error } = await db.from("services").select("*").eq("visible", true).order("sort_order");
    if (error) {
      console.error("[content] getServices", error.message);
      return seedServices;
    }
    return (data || []) as Service[];
  } catch (error) {
    console.error("[content] getServices", error instanceof Error ? error.message : error);
    return seedServices;
  }
}
