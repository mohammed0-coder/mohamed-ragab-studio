"use server";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import type {Project} from "@/lib/types";

export async function login(_state:{error?:string}|undefined,formData:FormData):Promise<{error?:string}|undefined>{
 const db=await createClient();if(!db)return {error:"أضف إعدادات Supabase في ملف البيئة أولًا."};
 const email=String(formData.get("email")||""),password=String(formData.get("password")||"");
 const {data,error}=await db.auth.signInWithPassword({email,password});if(error||!data.user)return {error:"تعذر تسجيل الدخول. راجع البريد وكلمة المرور."};
 if(data.user.app_metadata?.role!=="admin"){await db.auth.signOut();return {error:"هذا الحساب لا يملك صلاحية الإدارة."};}
 redirect("/admin/dashboard");
}
async function adminClient(){const db=await createClient();if(!db)return null;const {data:{user}}=await db.auth.getUser();return user?.app_metadata?.role==="admin"?db:null;}
export async function saveProject(formData:FormData):Promise<void>{
 const db=await adminClient();if(!db)redirect("/admin");
 const id=String(formData.get("id")||""),title=String(formData.get("title")||"").trim(),slug=String(formData.get("slug")||"").trim().toLowerCase().replace(/[^a-z0-9-]/g,"-");
 const themeValue=String(formData.get("theme")||"auto");
 const allowedThemes=["auto","wine","olive","blue","sand","lilac","ink","coral"];
 const theme=allowedThemes.includes(themeValue)?themeValue:"auto";
 if(title.length<2||slug.length<2)redirect("/admin/dashboard?error=invalid-project");
 const row:Partial<Project>={title,slug,client_name:String(formData.get("client_name")||""),category:String(formData.get("category")||""),short_description:String(formData.get("short_description")||""),description:String(formData.get("description")||"")||null,intro_title:String(formData.get("intro_title")||"")||null,intro_text:String(formData.get("intro_text")||"")||null,challenge:String(formData.get("challenge")||"")||null,solution:String(formData.get("solution")||"")||null,results:String(formData.get("results")||"")||null,start_date:String(formData.get("start_date")||"")||null,end_date:String(formData.get("end_date")||"")||null,cover_image:String(formData.get("cover_image")||"")||null,hero_image:String(formData.get("hero_image")||"")||null,services:String(formData.get("services")||"").split(",").map(x=>x.trim()).filter(Boolean),published:formData.get("published")==="on",featured:formData.get("featured")==="on",homepage_featured:formData.get("homepage_featured")==="on",sort_order:Number(formData.get("sort_order")||0)};
 let projectId=id;
 if(id){const {error}=await db.from("projects").update(row).eq("id",id);if(error)redirect("/admin/dashboard?error=save-project");}
 else {const {data,error}=await db.from("projects").insert(row).select("id").single();if(error||!data)redirect("/admin/dashboard?error=save-project");projectId=data.id;}
 if(formData.has("gallery_images")){
  const images=String(formData.get("gallery_images")||"").split(/\r?\n/).map(value=>value.trim()).filter(Boolean);
  const {error:deleteError}=await db.from("project_images").delete().eq("project_id",projectId);
  if(deleteError)redirect("/admin/dashboard?error=save-gallery");
  if(images.length){const {error}=await db.from("project_images").insert(images.map((image_url,sort_order)=>({project_id:projectId,image_url,alt_text:title,sort_order})));if(error)redirect("/admin/dashboard?error=save-gallery");}
 }
 const {error:themeError}=await db.from("site_settings").upsert({key:`project_theme:${slug}`,value:{text:theme},updated_at:new Date().toISOString()});
 if(themeError)redirect("/admin/dashboard?error=save-theme");
 redirect("/admin/dashboard?status=project-saved");
}
export async function saveClient(formData:FormData){const db=await adminClient();if(!db)return;const id=String(formData.get("id")||""),row={name:String(formData.get("name")||"").trim(),website_url:String(formData.get("website_url")||"").trim()||null,logo_url:String(formData.get("logo_url")||"").trim()||null,visible:formData.get("visible")==="on",sort_order:Number(formData.get("sort_order")||0)};if(!row.name)return;if(id)await db.from("clients").update(row).eq("id",id);else await db.from("clients").insert(row);}
export async function deleteClient(id:string){const db=await adminClient();if(!db)redirect("/admin");await db.from("clients").delete().eq("id",id);redirect("/admin/dashboard");}
export async function saveService(formData:FormData){const db=await adminClient();if(!db)return;const id=String(formData.get("id")||""),row={number:String(formData.get("number")||"01"),title:String(formData.get("title")||"").trim(),description:String(formData.get("description")||""),items:String(formData.get("items")||"").split(",").map(x=>x.trim()).filter(Boolean),visible:formData.get("visible")==="on",sort_order:Number(formData.get("sort_order")||0)};if(!row.title)return;if(id)await db.from("services").update(row).eq("id",id);else await db.from("services").insert(row);}
export async function deleteService(id:string){const db=await adminClient();if(!db)redirect("/admin");await db.from("services").delete().eq("id",id);redirect("/admin/dashboard");}
export async function saveSetting(formData:FormData){const db=await adminClient();if(!db)return;const key=String(formData.get("key")||"").trim(),value=String(formData.get("value")||"");if(!key)return;await db.from("site_settings").upsert({key,value:{text:value},updated_at:new Date().toISOString()});}
export async function updateMessage(id:string,status:string){const db=await adminClient();if(!db)redirect("/admin");if(!["new","read","archived"].includes(status))return;await db.from("contact_messages").update({status}).eq("id",id);redirect("/admin/dashboard");}
export async function deleteProject(id:string){const db=await adminClient();if(!db)redirect("/admin");await db.from("projects").delete().eq("id",id);redirect("/admin/dashboard");}
export async function logout(){const db=await createClient();await db?.auth.signOut();redirect("/admin");}
