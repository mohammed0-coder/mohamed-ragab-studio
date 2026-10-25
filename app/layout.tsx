import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site";
import { ThemeBoot } from "@/components/theme";
import {themeSchedule} from "@/lib/theme-config";
import { LanguageProvider } from "@/components/language";
import { Preloader } from "@/components/preloader";
import { CookieConsent } from "@/components/cookie-consent";

export const metadata: Metadata = { metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"), title:{default:"محمد رجب — استوديو إبداعي",template:"%s — محمد رجب"}, description:"استوديو إبداعي يبني علامات وتجارب رقمية ذات حضور واضح.", openGraph:{type:"website",locale:"ar_EG",siteName:"محمد رجب — استوديو إبداعي",title:"محمد رجب — استوديو إبداعي",description:"نصنع حضورًا يستحق أن يُرى."}, twitter:{card:"summary_large_image"}, robots:{index:true,follow:true} };
export default function RootLayout({children}:{children:React.ReactNode}){const earlyTheme=`(()=>{try{const m=localStorage.getItem('theme-mode')||'auto-device';let h;if(m==='dark')h='dark';else if(m==='light')h='light';else {const hour=m==='auto-cairo'?Number(new Intl.DateTimeFormat('en-US',{hour:'2-digit',hourCycle:'h23',timeZone:'${themeSchedule.cairoTimeZone}'}).format(new Date())):new Date().getHours();h=hour>=${themeSchedule.dayStart}&&hour<${themeSchedule.nightStart}?'light':'dark'}document.documentElement.dataset.theme=h;const l=localStorage.getItem('site-language')||'ar';document.documentElement.dataset.language=l;document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'}catch{document.documentElement.dataset.theme='light'}})()`;return <html lang="ar" dir="rtl" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:earlyTheme}}/></head><body id="top"><ThemeBoot/><LanguageProvider><Preloader/><SiteChrome>{children}</SiteChrome><CookieConsent/></LanguageProvider></body></html>}
