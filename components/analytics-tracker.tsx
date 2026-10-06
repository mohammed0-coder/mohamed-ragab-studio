"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function sessionId() {
  const key = "mrs-analytics-session";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const send = () => {
      if (cancelled || localStorage.getItem("mrs-cookie-consent") !== "accepted") return;
      const body = JSON.stringify({ path: pathname || "/", sessionId: sessionId() });
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => undefined);
    };

    send();
    const onConsent = () => send();
    window.addEventListener("mrs-cookie-consent", onConsent);
    return () => {
      cancelled = true;
      window.removeEventListener("mrs-cookie-consent", onConsent);
    };
  }, [pathname]);

  return null;
}
