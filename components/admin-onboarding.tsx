"use client";

import { useEffect, useState } from "react";

const steps = [
  ["المشاريع", "أضف مشروعًا جديدًا، عدّل البيانات والصور، وحدد ما يظهر في الأربعة الرئيسيين."],
  ["الشركاء والخدمات", "حدّث العملاء والخدمات من نفس لوحة التحكم، بدون لمس الكود."],
  ["الرسائل", "افتح رسائل العملاء، علّمها كمقروءة، أرشفها أو ابدأ الرد مباشرة."],
  ["إعدادات الموقع", "غيّر الهاتف والواتساب والإيميلات وروابط السوشيال ونص الفوتر من مكان واحد."],
] as const;

export function AdminOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [device, setDevice] = useState("جهازك");

  useEffect(() => {
    if (localStorage.getItem("mrs-admin-tour-v2") !== "done") setOpen(true);
    const width = window.innerWidth;
    setDevice(width < 700 ? "الهاتف" : width < 1100 ? "الجهاز اللوحي" : "سطح المكتب");
  }, []);

  function finish() {
    localStorage.setItem("mrs-admin-tour-v2", "done");
    setOpen(false);
  }

  if (!open) return null;
  const current = steps[step];
  return <div className="admin-dialog-backdrop" role="presentation">
    <div className="admin-dialog admin-tour" role="dialog" aria-modal="true" aria-label="جولة لوحة التحكم">
      <div className="eyebrow">جولة سريعة · {step + 1}/{steps.length} · {device}</div>
      <div className="admin-tour-mark">0{step + 1}</div>
      <h3>{current[0]}</h3>
      <p>{current[1]}</p>
      <div className="admin-tour-actions">
        <button type="button" className="admin-button admin-secondary" onClick={finish}>تخطي</button>
        {step < steps.length - 1 ? <button type="button" className="admin-button" onClick={() => setStep((value) => value + 1)}>التالي ↙</button> : <button type="button" className="admin-button" onClick={finish}>أبدأ العمل</button>}
      </div>
    </div>
  </div>;
}
