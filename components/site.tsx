"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import type { Client, Project } from "@/lib/types";
import { ContentText, T, useLanguage } from "@/components/language";
import { GsapHeadline, GsapScrollAnimator, MotionReveal, PageMotion } from "@/components/motion";
import { SocialLinks } from "@/components/social-links";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { Classic } from "@/components/classic-loader";
import { PwaInstallButton } from "@/components/pwa-install";

const nav=[ ["الرئيسية","/"],["المشاريع","/projects"],["من نحن","/about"],["العملاء","/clients"],["الخدمات","/services"],["تواصل","/contact"] ];
export function Header(){
  const [open,setOpen]=useState(false),[mode,setMode]=useState("auto-device");
  const {language,toggle}=useLanguage();
  useEffect(()=>{setMode(localStorage.getItem("theme-mode")||"auto-device");},[]);useEffect(()=>{document.body.style.overflow=open?"hidden":"";return()=>{document.body.style.overflow=""};},[open]);
  function cycle(){const modes=["auto-device","auto-cairo","light","dark"],next=modes[(modes.indexOf(mode)+1)%modes.length];setMode(next);localStorage.setItem("theme-mode",next);window.dispatchEvent(new CustomEvent("theme-change",{detail:next}));}
  return <header className="site-header"><Link className="brand" href="/" aria-label={language==="ar"?"محمد رجب، الرئيسية":"Mohamed Ragab, home"}><><img className="brand-logo brand-logo-light" src="/brand/MRS_Black_Horizontal.png" alt="Mohamed Ragab Studio" /><img className="brand-logo brand-logo-dark" src="/brand/MRS_White_Horizontal.png" alt="Mohamed Ragab Studio" /></></Link><div className="header-tools"><button type="button" onClick={toggle} className="language-switch" aria-label={language==="ar"?"Switch to English":"التغيير إلى العربية"}>{language==="ar"?"EN":"عربي"}</button><button onClick={cycle} className="theme-switch" aria-label={language==="ar"?"تغيير المظهر":"Change theme"} title={mode==="dark"?"Dark":mode==="light"?"Light":"Auto"}><span className="theme-dot"/><span className="theme-label">{mode==="dark"?<T ar="داكن" en="Dark"/>:mode==="light"?<T ar="فاتح" en="Light"/>:<T ar="تلقائي" en="Auto"/>}</span></button><button className={`menu-toggle ${open?"is-open":""}`} onClick={()=>setOpen(!open)} aria-expanded={open} aria-label={open?(language==="ar"?"إغلاق القائمة":"Close menu"):(language==="ar"?"فتح القائمة":"Open menu")}><i/><i/></button></div><AnimatePresence>{open&&<motion.div className="menu-panel" initial={{clipPath:"inset(0 0 100% 0)"}} animate={{clipPath:"inset(0 0 0% 0)"}} exit={{clipPath:"inset(0 0 100% 0)"}} transition={{duration:.58,ease:[.22,1,.36,1]}}><span className="eyebrow"><T ar="القائمة الرئيسية" en="Main menu"/></span>{nav.map(([ar,url],i)=><motion.div initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={{delay:.16+i*.055,duration:.42,ease:[.22,1,.36,1]}} key={url}><Link style={{transitionDelay:`${i*35}ms`}} href={url} onClick={()=>setOpen(false)}><span>0{i+1}</span><T ar={ar} en={["Home","Projects","About","Clients","Services","Contact"][i]}/><b>↙</b></Link></motion.div>)}<div className="menu-bottom"><PwaInstallButton /><T ar="القاهرة، مصر" en="Cairo, Egypt"/><span>© 2026</span></div></motion.div>}</AnimatePresence></header>
}
export function Footer(){return <footer className="footer"><div className="footer-top"><div className="footer-brand-block"><Link className="brand" href="/"><><img className="brand-logo brand-logo-light" src="/brand/MRS_Black_Horizontal.png" alt="Mohamed Ragab Studio" /><img className="brand-logo brand-logo-dark" src="/brand/MRS_White_Horizontal.png" alt="Mohamed Ragab Studio" /></></Link><p><T ar="نصنع حضورًا يستحق أن يُرى." en="We create presence worth seeing."/></p></div><div className="footer-social-block"><span className="footer-label"><T ar="تابعنا" en="Follow us"/></span><SocialLinks label="Social media"/></div></div><div className="footer-bottom"><span><T ar="© ٢٠٢٦ محمد رجب. جميع الحقوق محفوظة." en="© 2026 Mohamed Ragab. All rights reserved."/></span><a href="https://mohammedabdullah.vercel.app/" target="_blank" rel="noreferrer">developed by mohammed abdullah</a></div></footer>}
import {usePathname} from "next/navigation";
export function SiteChrome({children}:{children:React.ReactNode}){const path=usePathname(),admin=path.startsWith("/admin");return admin?<>{children}</>:<><Header/><AnalyticsTracker/><InteractionLayer/><main><PageMotion>{children}</PageMotion><GsapScrollAnimator/></main><Footer/></>}
export function PageIntro({kicker,title,description,english}:{kicker:string;title:string;description?:string;english?:{kicker:string;title:string;description?:string}}){return <section className="page-intro"><MotionReveal delay={.08}><div className="eyebrow"><T ar={kicker} en={english?.kicker||kicker}/><span>✳</span></div></MotionReveal><h1><GsapHeadline><T ar={title} en={english?.title||title}/></GsapHeadline></h1>{description&&<MotionReveal delay={.16}><p className="intro-copy"><T ar={description} en={english?.description||description}/></p></MotionReveal>}<MotionReveal delay={.25}><a href="#content" className="scroll-cue"><span className="scroll-line"/><T ar="اكتشف المزيد" en="Discover more"/> <span>↓</span></a></MotionReveal></section>}
export function CTA(){return <section className="global-cta"><Link href="/contact" className="cta-marquee" aria-label="Contact Mohamed Ragab Studio"><span className="cta-marquee-track"><span className="cta-marquee-group"><span><T ar="احكِ لنا عن فكرتك ↗" en="Tell us about your idea ↗"/></span><span><T ar="احكِ لنا عن فكرتك ↗" en="Tell us about your idea ↗"/></span><span><T ar="احكِ لنا عن فكرتك ↗" en="Tell us about your idea ↗"/></span></span><span className="cta-marquee-group" aria-hidden="true"><span><T ar="احكِ لنا عن فكرتك ↗" en="Tell us about your idea ↗"/></span><span><T ar="احكِ لنا عن فكرتك ↗" en="Tell us about your idea ↗"/></span><span><T ar="احكِ لنا عن فكرتك ↗" en="Tell us about your idea ↗"/></span></span></span></Link><div className="cta-caption"><T ar="نستقبل المشاريع والتعاونات الجديدة." en="We are open to new projects and collaborations."/></div></section>}
const palettes=["art-ink","art-red","art-sand","art-ink","art-red","art-sand"];
export function ProjectCard({project,index=0}:{project:Project;index?:number}){return <MotionReveal delay={(index%2)*.09}><Link href={`/projects/${project.slug}`} className="project-card"><div className={`project-art ${palettes[index%palettes.length]}`}>{project.cover_image&&<img className="project-art-photo" src={project.cover_image} alt={project.title} loading="lazy"/>}<div className="art-top"><span><T ar="مشروع رقم" en="Project"/> {String(index+1).padStart(2,"0")}</span><span>٢٠٢٦</span></div><div className="art-shape shape-one"/><div className="art-shape shape-two"/><div className="art-word" dir="rtl"><ContentText ar={project.title}/></div><div className="art-caption"><ContentText ar={project.category}/></div><span className="art-arrow">↙</span></div><div className="project-meta"><div><h3><ContentText ar={project.title}/></h3><span><ContentText ar={project.client_name}/></span></div><p>{project.services?.slice(0,3).map((service,index)=><span key={service}><ContentText ar={service}/>{index < (project.services?.slice(0,3).length||0)-1 ? " · " : ""}</span>)}</p></div></Link></MotionReveal>}
export function ProjectGrid({projects}:{projects:Project[]}){return projects.length?<div className="project-grid">{projects.map((p,i)=><ProjectCard key={p.id} project={p} index={i}/>)}</div>:<div className="empty-state"><T ar="أعمال جديدة قريبًا" en="New work coming soon"/> <span>✳</span></div>}
export function ProjectRows({projects}:{projects:Project[]}){return projects.length?<div className="project-rows">{projects.map((p,i)=><Link className="project-row" href={`/projects/${p.slug}`} key={p.id}><span className="project-row-number">{String(i+1).padStart(2,"0")}</span><span className="project-row-title"><strong><ContentText ar={p.title}/></strong><small><ContentText ar={p.client_name}/> · <ContentText ar={p.category}/></small></span><span className="project-row-preview">{p.cover_image&&<img src={p.cover_image} alt="" loading="lazy"/>}<b>↗</b></span></Link>)}</div>:<div className="empty-state"><T ar="أعمال جديدة قريبًا" en="New work coming soon"/> <span>✳</span></div>}
export function ClientWall({clients}:{clients:Client[]}){return <div className="clients-wall">{clients.map(c=><a key={c.id} className="client-mark" href={c.website_url||"#"} target={c.website_url?"_blank":undefined} rel={c.website_url?"noreferrer":undefined}>{c.logo_url?<img src={c.logo_url} alt={c.name} loading="lazy"/>:<ContentText ar={c.name}/>} {!c.logo_url&&<span><T ar="شريك إبداعي" en="Creative partner"/></span>}</a>)}</div>}
export function Reveal({children,className=""}:{children:React.ReactNode;className?:string}){return <div className={`reveal ${className}`}>{children}</div>}
export function InteractionLayer(){
 const [enabled,setEnabled]=useState(false),[active,setActive]=useState(false),[label,setLabel]=useState("");
 const pointerX=useMotionValue(-100),pointerY=useMotionValue(-100);
 const x=useSpring(pointerX,{stiffness:520,damping:36,mass:.28}),y=useSpring(pointerY,{stiffness:520,damping:36,mass:.28});
 const {language}=useLanguage();
 useEffect(()=>{const media=matchMedia("(pointer:fine)");const update=()=>setEnabled(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update);},[]);
 useEffect(()=>{if(!enabled)return;const move=(event:MouseEvent)=>{pointerX.set(event.clientX);pointerY.set(event.clientY);const target=event.target as HTMLElement;const interactive=target.closest("a,button");setActive(Boolean(interactive));setLabel(interactive?"↗":"");};window.addEventListener("mousemove",move);return()=>window.removeEventListener("mousemove",move);},[enabled,language,pointerX,pointerY]);
 if(!enabled)return null;
 return <motion.div className={`custom-cursor visible${active?" is-active":""}${label?" has-label":""}`} style={{left:x,top:y}} aria-hidden="true"><span>{label}</span></motion.div>;
}
function BrandedSelect({name,placeholder,options}:{name:string;placeholder:string;options:string[]}){
 const [value,setValue]=useState(""),[open,setOpen]=useState(false);
 return <div className="branded-select"><input type="hidden" name={name} value={value}/><button type="button" className="branded-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(v=>!v)} onKeyDown={e=>{if(e.key==="Escape")setOpen(false);if(e.key==="ArrowDown")setOpen(true);}}><span>{value||placeholder}</span><b>{open?"−":"+"}</b></button>{open&&<div className="branded-select-options" role="listbox">{options.map(option=><button type="button" role="option" aria-selected={value===option} key={option} onClick={()=>{setValue(option);setOpen(false);}}>{option}</button>)}</div>}</div>
}
export function ContactForm(){
 const [sent,setSent]=useState(false),[error,setError]=useState(""),[validation,setValidation]=useState(""),[busy,setBusy]=useState(false),[selectKey,setSelectKey]=useState(0);const {language}=useLanguage();
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError("");setValidation("");
  const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));
  if(!String(data.name||"").trim()||!String(data.email||"").trim()||!String(data.message||"").trim()){setValidation("required");return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))){setValidation("email");return;}
  setBusy(true);
  try{
   const r=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
   const result=await r.json().catch(()=>({}));
   if(r.ok){setSent(true);form.reset();setSelectKey(value=>value+1);}
   else setError(result.error||"تعذر إرسال الرسالة.");
  }catch{setError("تحقق من اتصالك بالإنترنت وحاول مرة أخرى.");}
  finally{setBusy(false);}
 }
 const words=language==="ar"?{name:"الاسم الكامل",yourName:"اسمك",email:"البريد الإلكتروني",phone:"رقم الهاتف",company:"الشركة",job:"المسمى الوظيفي",service:"الخدمة المطلوبة",choose:"اختر الخدمة",strategy:"استراتيجية وهوية",campaign:"حملة إعلانية",content:"محتوى وفيديو",digital:"تطوير رقمي",other:"أخرى",idea:"حدثنا عن فكرتك",placeholder:"ما الذي ترغب في صنعه؟",busy:"جارٍ الإرسال…",sent:"وصلتنا رسالتك، شكرًا",submit:"أرسل رسالتك",success:"سنعود إليك قريبًا.",required:"أكمل الحقول المطلوبة ثم أرسل رسالتك.",emailError:"اكتب بريدًا إلكترونيًا صحيحًا.",serverError:"تعذر إرسال الرسالة. حاول مرة أخرى.",networkError:"تحقق من اتصالك بالإنترنت وحاول مرة أخرى."}:{name:"Full name",yourName:"Your name",email:"Email address",phone:"Phone number",company:"Company",job:"Job title",service:"Service needed",choose:"Choose a service",strategy:"Strategy and identity",campaign:"Advertising campaign",content:"Content and video",digital:"Digital development",other:"Other",idea:"Tell us about your idea",placeholder:"What would you like to make?",busy:"Sending…",sent:"Message received, thank you",submit:"Send your message",success:"We will be in touch soon.",required:"Complete the required fields before sending.",emailError:"Enter a valid email address.",serverError:"We could not send your message. Please try again.",networkError:"Check your internet connection and try again."};
 return <form className="contact-form" onSubmit={submit} noValidate aria-label={language === "ar" ? "نموذج التواصل" : "Contact form"}>
  <div className="form-grid">
   <label>{words.name}<input name="name" required placeholder={words.yourName} autoComplete="name"/></label>
   <label>{words.email}<input name="email" type="email" required placeholder="name@email.com" autoComplete="email"/></label>
   <label>{words.phone}<input name="phone" type="tel" placeholder="+20" autoComplete="tel"/></label>
   <label>{words.company}<input name="company" placeholder={words.company} autoComplete="organization"/></label>
   <label>{words.job}<input name="job_title" placeholder={words.job}/></label>
   <div className="form-control"><span>{words.service}</span><BrandedSelect key={selectKey} name="project_type" placeholder={words.choose} options={[words.strategy,words.campaign,words.content,words.digital,words.other]}/></div>
   <label className="full-field">{words.idea}<textarea name="message" rows={4} maxLength={5000} required placeholder={words.placeholder}/></label>
   <input className="honeypot" name="website" tabIndex={-1} autoComplete="off"/>
  </div>
  <button className="submit-link" type="submit" disabled={busy}>{busy?<span className="submit-loading"><Classic className="size-4" aria-label="جارٍ الإرسال" />{words.busy}</span>:sent?words.sent:words.submit}<span aria-hidden="true">↙</span></button>
  {sent&&<p className="form-success" role="status">{words.success}</p>}
  {(validation||error)&&<p className="form-error" role="alert">{validation==="required"?words.required:validation==="email"?words.emailError:error?error:words.serverError}</p>}
 </form>
}
