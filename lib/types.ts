export type Project = {
  id: string; slug: string; title: string; client_name: string; short_description: string;
  description?: string | null; intro_title?: string | null; intro_text?: string | null; intro_text_ar?: string | null; intro_text_en?: string | null;
  category: string; services: string[]; technologies?: string[]; start_date?: string | null;
  end_date?: string | null; status?: string; hero_image?: string | null; cover_image?: string | null;
  challenge?: string | null; solution?: string | null; results?: string | null; external_url?: string | null;
  featured?: boolean; homepage_featured?: boolean; published?: boolean; theme?: string; sort_order?: number;
  gallery_images?: { url: string; alt: string }[];
};
export type Client = { id: string; name: string; logo_url?: string | null; website_url?: string | null; sort_order?: number; visible?: boolean };
export type Service = { id: string; number: string; title: string; description: string; items: string[]; sort_order?: number; visible?: boolean };
export type ContactMessage = { id:string; name:string; email:string; phone:string; company:string; job_title:string; project_type:string; message:string; status:"new"|"read"|"archived"; created_at:string };
export type SiteSetting = { key:string; value:{text?:string}; updated_at:string };
