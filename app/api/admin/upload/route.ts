import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {createClient} from "@/lib/supabase/server";

const imageTypes=new Set(["image/jpeg","image/png","image/webp","image/avif","image/svg+xml"]);
export async function POST(request:Request){
 const length=Number(request.headers.get("content-length")||0);if(length>16*1024*1024)return NextResponse.json({error:"The upload is too large."},{status:413});
 const db=await createClient();if(!db)return NextResponse.json({error:"Supabase is not configured."},{status:503});
 const {data:{user}}=await db.auth.getUser();if(!user||user.app_metadata?.role!=="admin")return NextResponse.json({error:"Unauthorized."},{status:401});
 try{const form=await request.formData(),value=form.get("file"),bucket=String(form.get("bucket")||"project-images");if(!(value instanceof File)||!imageTypes.has(value.type))return NextResponse.json({error:"Choose a supported image file."},{status:400});
  const max=bucket==="client-logos"?5*1024*1024:15*1024*1024;if(value.size>max)return NextResponse.json({error:"The selected file is too large."},{status:413});if(!["project-images","client-logos","site-assets"].includes(bucket))return NextResponse.json({error:"Invalid storage bucket."},{status:400});
  const safeName=value.name.toLowerCase().replace(/[^a-z0-9._-]/g,"-").slice(-80),folder=String(form.get("folder")||"uploads").toLowerCase().replace(/[^a-z0-9/_-]/g,"").replace(/\/{2,}/g,"/").slice(0,100),path=`${folder}/${randomUUID()}-${safeName}`;
  const {data,error}=await db.storage.from(bucket).upload(path,value,{cacheControl:"3600",contentType:value.type,upsert:false});if(error)return NextResponse.json({error:"The upload could not be saved."},{status:400});
  const result=bucket==="project-images"?data.path:db.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;return NextResponse.json({path:data.path,value:result});
 }catch{return NextResponse.json({error:"The upload request could not be processed."},{status:400});}
}
