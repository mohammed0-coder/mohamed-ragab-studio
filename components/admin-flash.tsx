"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const messages: Record<string, string> = {
  "project-saved": "تم حفظ المشروع بنجاح.",
  "project-deleted": "تم حذف المشروع.",
  "project-duplicated": "تم نسخ المشروع كمسودة جديدة.",
  "client-saved": "تم حفظ العميل.",
  "client-deleted": "تم حذف العميل.",
  "service-saved": "تم حفظ الخدمة.",
  "service-deleted": "تم حذف الخدمة.",
  "message-updated": "تم تحديث حالة الرسالة.",
  "message-deleted": "تم حذف الرسالة.",
  "settings-saved": "تم حفظ إعدادات الموقع.",
};

export function AdminFlash() {
  const params = useSearchParams();
  const key = params.get("status");
  const [visible, setVisible] = useState(Boolean(key && messages[key]));

  useEffect(() => {
    setVisible(Boolean(key && messages[key]));
    if (!key) return;
    const timer = window.setTimeout(() => setVisible(false), 3200);
    return () => window.clearTimeout(timer);
  }, [key]);

  if (!visible || !key || !messages[key]) return null;
  return <div className="admin-flash" role="status"><span>✓</span>{messages[key]}</div>;
}
