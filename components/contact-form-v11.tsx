"use client";

import {useEffect,useState} from "react";
import {useLanguage} from "@/components/language";
import {Classic} from "@/components/classic-loader";
import type {Service} from "@/lib/types";

export function ContactFormV11({services=[],initialService=""}:{services?:Service[];initialService?:string}){
  const {language}=useLanguage();
  const [sent,setSent]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const [projectType,setProjectType]=useState(initialService||"");
  useEffect(()=>{if(initialService)setProjectType(initialService)},[initialService]);

  const words=language==="ar"
    ? {name:"الاسم الكامل",yourName:"اسمك",email:"البريد الإلكتروني",phone:"رقم الهاتف",company:"الشركة",job:"المسمى الوظيفي",service:"الخدمة المطلوبة",choose:"اختر الخدمة",idea:"حدثنا عن فكرتك",placeholder:"ما الذي ترغب في صنعه؟",busy:"جارٍ الإرسال…",sent:"وصلتنا رسالتك، شكرًا",submit:"أرسل رسالتك",success:"سنعود إليك قريبًا.",required:"أكمل الحقول المطلوبة ثم أرسل رسالتك.",emailError:"اكتب بريدًا إلكترونيًا صحيحًا.",serverError:"تعذر إرسال الرسالة. حاول مرة أخرى.",fallback:"تحقق من اتصالك بالإنترنت وحاول مرة أخرى."}
    : {name:"Full name",yourName:"Your name",email:"Email address",phone:"Phone number",company:"Company",job:"Job title",service:"Service needed",choose:"Choose a service",idea:"Tell us about your idea",placeholder:"What would you like to make?",busy:"Sending…",sent:"Message received, thank you",submit:"Send your message",success:"We will be in touch soon.",required:"Complete the required fields before sending.",emailError:"Enter a valid email address.",serverError:"We could not send your message. Please try again.",fallback:"Check your internet connection and try again."};

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");
    const form=event.currentTarget;const data=Object.fromEntries(new FormData(form));
    if(!String(data.name||"").trim()||!String(data.email||"").trim()||!String(data.message||"").trim()){setError(words.required);return;}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))){setError(words.emailError);return;}
    setBusy(true);
    try{
      const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...data,project_type:projectType})});
      const result=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(result.error||words.serverError);
      setSent(true);form.reset();
    }catch(error){setError(error instanceof Error?error.message:words.fallback);}
    finally{setBusy(false);}
  }

  return <form className="contact-form contact-form-v11" onSubmit={submit} noValidate aria-label={language==="ar"?"نموذج التواصل":"Contact form"}>
    <div className="form-grid">
      <label>{words.name}<input name="name" required placeholder={words.yourName} autoComplete="name"/></label>
      <label>{words.email}<input name="email" type="email" required placeholder="name@email.com" autoComplete="email"/></label>
      <label>{words.phone}<input name="phone" type="tel" placeholder="+20" autoComplete="tel"/></label>
      <label>{words.company}<input name="company" placeholder={words.company} autoComplete="organization"/></label>
      <label>{words.job}<input name="job_title" placeholder={words.job}/></label>
      <label>{words.service}
        <select name="project_type" value={projectType} onChange={event=>setProjectType(event.target.value)}>
          <option value="">{words.choose}</option>
          {services.map(service=><option value={service.title} key={service.id}>{service.title}</option>)}
        </select>
      </label>
      <label className="full-field">{words.idea}<textarea name="message" rows={5} maxLength={5000} required placeholder={words.placeholder}/></label>
      <input className="honeypot" name="website" tabIndex={-1} autoComplete="off"/>
    </div>
    <button className="submit-link" type="submit" disabled={busy}>{busy?<span className="submit-loading"><Classic className="size-4" />{words.busy}</span>:sent?words.sent:words.submit}<span aria-hidden="true">↙</span></button>
    {sent&&<p className="form-success" role="status">{words.success}</p>}
    {error&&<p className="form-error" role="alert">{error}</p>}
  </form>;
}
