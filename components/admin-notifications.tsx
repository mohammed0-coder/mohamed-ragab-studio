"use client";

import { useEffect, useState } from "react";
import { Classic } from "@/components/classic-loader";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function AdminNotifications() {
  const [state, setState] = useState<"idle" | "enabled" | "denied" | "unsupported" | "busy" | "error">("idle");
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();

  useEffect(() => {
    if (!publicKey || !("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") setState("denied");
    if (Notification.permission === "granted") setState("enabled");
  }, [publicKey]);

  async function enable() {
    if (!publicKey) return;
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) throw new Error("subscription_failed");
      setState("enabled");
    } catch {
      setState("error");
    }
  }

  if (state === "unsupported") return <span className="admin-notification-note">إشعارات الويب غير متاحة في هذا المتصفح.</span>;
  if (state === "denied") return <span className="admin-notification-note">الإشعارات موقوفة من إعدادات المتصفح.</span>;

  return (
    <button type="button" className={`admin-notification-button ${state === "enabled" ? "is-enabled" : ""}`} onClick={() => void enable()} disabled={state === "busy" || state === "enabled"}>
      {state === "busy" ? <Classic className="size-4" aria-label="جارٍ التفعيل" /> : <span aria-hidden="true">◉</span>}
      {state === "enabled" ? "الإشعارات مفعلة" : state === "error" ? "حاول تفعيل الإشعارات" : "تفعيل الإشعارات"}
    </button>
  );
}
