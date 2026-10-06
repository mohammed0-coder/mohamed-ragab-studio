"use client";

import { useEffect } from "react";

const KEY = "mrs-analytics-visitor";
const DAY_KEY = "mrs-analytics-day";

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function VisitTracker() {
  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(DAY_KEY) === day) return;
    const visitorId = localStorage.getItem(KEY) || uuid();
    localStorage.setItem(KEY, visitorId);
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId, path: window.location.pathname }),
      keepalive: true,
    }).finally(() => localStorage.setItem(DAY_KEY, day));
  }, []);
  return null;
}
