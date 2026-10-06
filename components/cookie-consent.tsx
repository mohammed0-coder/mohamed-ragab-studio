"use client";

import { useEffect, useState } from "react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(localStorage.getItem("mrs-cookie-consent") !== "accepted"); }, []);
  if (!visible) return null;
  return <div className="cookie-consent" role="dialog" aria-label="Cookie consent">
    <p>نستخدم ملفات الارتباط لتحسين تجربة استخدام الموقع وحفظ تفضيلاتك.</p>
    <button type="button" onClick={() => { localStorage.setItem("mrs-cookie-consent", "accepted"); window.dispatchEvent(new Event("mrs-cookie-consent")); setVisible(false); }}>موافق</button>
  </div>;
}
