import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;

function configure() {
  const subject = process.env.VAPID_SUBJECT?.trim();
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!subject || !publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }
  return true;
}

export async function notifyAdmins(title: string, body: string, messageId?: string) {
  if (!configure()) return;
  const db = createAdminClient();
  if (!db) return;
  const { data: subscriptions, error } = await db.from("admin_push_subscriptions").select("id,endpoint,subscription");
  if (error || !subscriptions?.length) return;

  const payload = JSON.stringify({ title, body, url: messageId ? `/admin/dashboard?section=messages&message=${encodeURIComponent(messageId)}` : "/admin/dashboard?section=messages" });
  await Promise.allSettled(subscriptions.map(async (item) => {
    try {
      await webpush.sendNotification(item.subscription as webpush.PushSubscription, payload, { TTL: 120 });
    } catch (sendError) {
      const status = typeof sendError === "object" && sendError && "statusCode" in sendError ? Number((sendError as { statusCode?: number }).statusCode) : 0;
      if (status === 404 || status === 410) await db.from("admin_push_subscriptions").delete().eq("id", item.id);
    }
  }));
}
