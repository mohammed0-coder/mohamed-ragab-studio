"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let cancelled = false;
    const register = () => {
      if (cancelled) return;
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => undefined);
    };
    const idleWindow = window.setTimeout(register, 2200);
    return () => {
      cancelled = true;
      window.clearTimeout(idleWindow);
    };
  }, []);
  return null;
}
