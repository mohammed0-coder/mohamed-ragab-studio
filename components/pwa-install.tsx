"use client";

import { useEffect, useState } from "react";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: "accepted" | "dismissed" }> };

export function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onBeforeInstall = (event: Event) => { event.preventDefault(); setPromptEvent(event as InstallPrompt); };
    const onInstalled = () => { setInstalled(true); setPromptEvent(null); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onBeforeInstall); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed) return null;
  if (ios) return <span className="pwa-install-ios">على iPhone/iPad: من مشاركة Safari اختر «إضافة إلى الشاشة الرئيسية»</span>;
  if (!promptEvent) return null;

  return <button className="pwa-install-button" type="button" onClick={async () => { await promptEvent.prompt(); await promptEvent.userChoice?.catch(() => undefined); setPromptEvent(null); }}>تثبيت الموقع كتطبيق ↗</button>;
}
