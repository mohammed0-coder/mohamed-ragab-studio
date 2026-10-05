"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Language = "ar" | "en";
const LanguageContext = createContext<{ language: Language; toggle: () => void }>({
  language: "ar",
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("site-language");
    const initial = saved === "en" ? "en" : "ar";
    setLanguage(initial);
    document.documentElement.lang = initial;
    document.documentElement.dir = initial === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.language = initial;
  }, []);

  function toggle() {
    const next = language === "ar" ? "en" : "ar";
    setLanguage(next);
    localStorage.setItem("site-language", next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.language = next;
  }

  return <LanguageContext.Provider value={{ language, toggle }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function T({ ar, en }: { ar: React.ReactNode; en: React.ReactNode }) {
  const { language } = useLanguage();
  return <>{language === "ar" ? ar : en}</>;
}

const contentDictionary: Record<string, string> = {
  "علامة تجريبية": "Demo brand", "مشروع تجريبي": "Demo project", "مشروع ناشئ": "Startup", "وجهة محلية": "Local destination", "منصة رقمية": "Digital platform", "فكرة جديدة": "New venture", "مساحة إبداعية": "Creative space", "منتج مستقل": "Independent product", "شريك نمو": "Growth partner",
  "هوية بصرية": "Visual identity", "تجارب رقمية": "Digital experiences", "حملات إعلانية": "Advertising campaigns", "محتوى وفيديو": "Content & video",
  "هوية تنمو من الفكرة إلى السوق.": "An identity that grows from idea to market.", "حضور رقمي يتحرك بإيقاع جديد.": "A digital presence moving to a new rhythm.", "لغة بصرية لمنتج يومي مختلف.": "A visual language for an everyday product with a difference.", "حكاية محلية بصوت معاصر.": "A local story in a contemporary voice.", "منصة تربط الفكرة بجمهورها.": "A platform that connects an idea with its audience.", "مساحة جديدة للقاء والتجربة.": "A new place to meet and explore.",
  "استراتيجية": "Strategy", "تجربة رقمية": "Digital experience", "تطوير ويب": "Web development", "إبداع": "Creative", "إنتاج": "Production", "استراتيجية محتوى": "Content strategy", "فيديو": "Video", "تسويق رقمي": "Digital marketing", "تسمية": "Naming",
  "الاستراتيجية والعلامة": "Strategy & brand", "الحملات والإعلان": "Campaigns & advertising", "المحتوى والتواصل": "Content & communication", "المنتجات الرقمية": "Digital products",
  "نمنح الأفكار اتجاهًا واضحًا، ونبني علامات تعرف من تكون وإلى أين تتجه.": "We give ideas clear direction and build brands that know who they are and where they’re heading.", "أفكار إعلانية تجد طريقها إلى الناس، عبر قصة واحدة وصيغ متعددة.": "Advertising ideas that reach people through one story in many formats.", "محتوى مستمر وواضح يمنح العلامة صوتًا حاضرًا في يوم جمهورها.": "Clear, consistent content that gives a brand a voice in its audience’s day.", "نصمم ونطور تجارب رقمية سهلة الاستخدام، من الصفحة الأولى إلى التفاصيل الصغيرة.": "We design and build easy-to-use digital experiences, from the first screen to the smallest details.",
  "استراتيجية العلامة": "Brand strategy", "التسمية والتموضع": "Naming & positioning", "الهوية البصرية": "Visual identity", "التوجيه الإبداعي": "Creative direction", "الفكرة الإبداعية": "Creative concept", "الحملات المتكاملة": "Integrated campaigns", "الإعلان الرقمي": "Digital advertising", "الإنتاج المرئي": "Visual production", "إدارة المنصات": "Channel management", "التصوير والفيديو": "Photography & video", "العلاقات العامة": "Public relations", "تصميم تجربة المستخدم": "User experience design", "تطوير المواقع": "Website development", "التجارة الإلكترونية": "E-commerce", "تطوير البرمجيات": "Software development",
};

export function ContentText({ ar, en }: { ar?: string | null; en?: string | null }) {
  const { language } = useLanguage();
  const text = ar || "";
  return <>{language === "en" ? (en || contentDictionary[text] || text) : text}</>;
}
