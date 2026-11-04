import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !serviceRoleKey) return null;
  if (!cached) cached = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  return cached;
}
