"use client";
import {useRef,useState} from "react";
import {createPublicClient} from "@/lib/supabase/public";

type Props={fieldName:string;bucket:"project-images"|"client-logos"|"site-assets";folder?:string};

type UploadTicket={path:string;token:string;value:string};

async function prepareUpload(file:File,bucket:Props["bucket"],folder:string):Promise<UploadTicket>{
  const response=await fetch("/api/admin/upload",{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({bucket,folder,name:file.name,type:file.type,size:file.size}),
  });
  const raw=await response.text();
  let result:{path?:string;token?:string;value?:string;error?:string}={};
  try{result=JSON.parse(raw);}catch{throw new Error(response.status===413?"الصورة أكبر من الحد المسموح.":"تعذر تجهيز رفع الصورة.");}
  if(!response.ok||!result.path||!result.token||!result.value)throw new Error(result.error||"تعذر تجهيز رفع الصورة.");
  return result as UploadTicket;
}

export function AdminUploader({fieldName,bucket,folder="uploads"}:Props){
  const inputRef=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");

  async function upload(files:FileList|null){
    if(!files?.length)return;
    const db=createPublicClient();
    if(!db){setMessage("Supabase is not configured.");return;}
    setBusy(true);setMessage("");
    const input=inputRef.current?.closest("form")?.querySelector<HTMLInputElement>(`[name="${fieldName}"]`);
    for(const file of Array.from(files)){
      try{
        const ticket=await prepareUpload(file,bucket,folder);
        const {data,error}=await db.storage.from(bucket).uploadToSignedUrl(ticket.path,ticket.token,file,{contentType:file.type,cacheControl:"3600"});
        if(error||!data)throw new Error(error?.message||"تعذر رفع الصورة.");
        if(input)input.value=ticket.value;
        setMessage(`تم الرفع: ${ticket.path}`);
      }catch(error){
        setMessage(error instanceof Error?error.message:"تعذر رفع الصورة.");
        break;
      }
    }
    setBusy(false);
    if(inputRef.current)inputRef.current.value="";
  }

  return <div className="admin-uploader" tabIndex={0}
    onDragOver={e=>e.preventDefault()}
    onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files);}}
    onPaste={e=>{const files=Array.from(e.clipboardData.files).filter(f=>f.type.startsWith("image/"));if(files.length){e.preventDefault();const transfer=new DataTransfer();files.forEach(f=>transfer.items.add(f));void upload(transfer.files);}}}>
    <span>اسحب الصور هنا، أو الصق صورة من الحافظة</span>
    <input ref={inputRef} type="file" accept="image/*" multiple onChange={e=>void upload(e.target.files)}/>
    <button type="button" className="admin-button" disabled={busy} onClick={()=>inputRef.current?.click()}>{busy?"جارٍ الرفع…":"اختيار صور"}</button>
    {message&&<small role="status">{message}</small>}
  </div>;
}
