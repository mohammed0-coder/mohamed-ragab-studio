import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {createClient} from "@/lib/supabase/server";

const imageTypes=new Set(["image/jpeg","image/png","image/webp","image/avif","image/svg+xml"]);
const buckets=new Set(["project-images","client-logos","site-assets"]);

function cleanFolder(value:string){
  return value.toLowerCase().replace(/[^a-z0-9/_-]/g,"").replace(/\/{2,}/g,"/").replace(/^\/+|\/+$/g,"").slice(0,100) || "uploads";
}

function cleanName(value:string){
  const name=value.toLowerCase().replace(/[^a-z0-9._-]/g,"-").replace(/-+/g,"-").slice(-80);
  return name || "image";
}

export async function POST(request:Request){
  const db=await createClient();
  if(!db)return NextResponse.json({error:"Supabase is not configured."},{status:503});

  const {data:{user}}=await db.auth.getUser();
  if(!user||user.app_metadata?.role!=="admin")return NextResponse.json({error:"Unauthorized."},{status:401});

  try{
    const body=await request.json() as {bucket?:string;folder?:string;name?:string;type?:string;size?:number};
    const bucket=String(body.bucket||"project-images");
    const folder=cleanFolder(String(body.folder||"uploads"));
    const name=cleanName(String(body.name||"image"));
    const type=String(body.type||"");
    const size=Number(body.size||0);

    if(!buckets.has(bucket))return NextResponse.json({error:"Invalid storage bucket."},{status:400});
    if(!imageTypes.has(type))return NextResponse.json({error:"Choose a supported image file."},{status:400});
    if(!Number.isFinite(size)||size<=0)return NextResponse.json({error:"The selected file is invalid."},{status:400});

    const max=bucket==="client-logos"?5*1024*1024:15*1024*1024;
    if(size>max)return NextResponse.json({error:`The selected file is too large. Maximum is ${Math.round(max/1024/1024)} MB.`},{status:413});

    const path=`${folder}/${randomUUID()}-${name}`;
    const {data,error}=await db.storage.from(bucket).createSignedUploadUrl(path);
    if(error||!data?.token)return NextResponse.json({error:"Could not prepare the upload."},{status:400});

    const value=db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    return NextResponse.json({path,token:data.token,value});
  }catch{
    return NextResponse.json({error:"The upload request could not be prepared."},{status:400});
  }
}
