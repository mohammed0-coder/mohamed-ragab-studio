"use client";
import {useRef,useState} from "react";
import {createPublicClient} from "@/lib/supabase/public";

type UploadTicket={path:string;token:string;value:string};

async function prepareUpload(file:File):Promise<UploadTicket>{
  const response=await fetch("/api/admin/upload",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({bucket:"project-images",folder:"projects/gallery",name:file.name,type:file.type,size:file.size}),
  });
  const raw=await response.text();
  let result:{path?:string;token?:string;value?:string;error?:string}={};
  try{result=JSON.parse(raw);}catch{throw new Error(response.status===413?"الصورة أكبر من الحد المسموح.":"تعذر تجهيز رفع الصورة.");}
  if(!response.ok||!result.path||!result.token||!result.value)throw new Error(result.error||"تعذر تجهيز رفع الصورة.");
  return result as UploadTicket;
}

export function AdminGalleryUploader({fieldId}:{fieldId:string}){
  const inputRef=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");

  async function upload(files:FileList|null){
    if(!files?.length)return;
    const db=createPublicClient();
    if(!db){setMessage("Supabase is not configured.");return;}
    setBusy(true);setMessage("");
    for(const file of Array.from(files)){
      try{
        const ticket=await prepareUpload(file);
        const {data,error}=await db.storage.from("project-images").uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:file.type,cacheControl:"3600"});
        if(error||!data)throw new Error(error?.message||"تعذر رفع الصورة.");
        const field=document.getElementById(fieldId) as HTMLTextAreaElement|null;
        if(field)field.value=[field.value.trim(),ticket.path].filter(Boolean).join("\n");
        setMessage("تم رفع الصور وإضافتها للمعرض.");
      }catch(error){
        setMessage(error instanceof Error?error.message:"تعذر رفع الصورة.");
        break;
      }
    }
    setBusy(false);
    if(inputRef.current)inputRef.current.value="";
  }

  return <div className="admin-uploader" tabIndex={0}
    onDragOver={event=>event.preventDefault()}
    onDrop={event=>{event.preventDefault();void upload(event.dataTransfer.files);}}
    onPaste={event=>{const images=Array.from(event.clipboardData.files).filter(file=>file.type.startsWith("image/"));if(!images.length)return;event.preventDefault();const transfer=new DataTransfer();images.forEach(image=>transfer.items.add(image));void upload(transfer.files);}}>
    <span>ارفع صور المشروع أو اسحبها هنا. ستضاف تلقائيًا إلى قائمة المعرض.</span>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={event=>void upload(event.target.files)}/>
    <button type="button" className="admin-button" disabled={busy} onClick={()=>inputRef.current?.click()}>{busy?"جارٍ الرفع…":"اختيار صور المعرض"}</button>
    {message&&<small role="status">{message}</small>}
  </div>;
}
