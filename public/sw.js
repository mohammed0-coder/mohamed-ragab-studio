const CACHE_PREFIX = "mrs-shell-";
const CACHE_NAME = "mrs-shell-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.resolve());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Intentionally no fetch handler: all site assets stay on the normal Vercel/CDN path.

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch {}
  const title = data.title || "Mohamed Ragab Studio";
  const body = data.body || "لديك رسالة جديدة.";
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/brand/MRS_Black_Vertical.png",
    badge: "/brand/MRS_Black_Vertical.png",
    data: { url: data.url || "/admin/dashboard?section=messages" },
    tag: "mrs-new-message",
    renotify: true,
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/admin/dashboard?section=messages", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => "focus" in client);
      if (existing) {
        existing.navigate(target);
        return existing.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
