import { createClient } from "@/lib/supabase/server";

export type AnalyticsPeriod = "day" | "week" | "month" | "year";

export type AnalyticsSummary = {
  period: AnalyticsPeriod;
  label: string;
  currentVisitors: number;
  previousVisitors: number;
  currentViews: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  series: { bucket: string; visitors: number; views: number }[];
};

export async function getAnalyticsSummary(period: AnalyticsPeriod): Promise<AnalyticsSummary | null> {
  const db = await createClient();
  if (!db) return null;
  const { data: { user } } = await db.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  const { data, error } = await db.rpc("analytics_summary", { p_period: period });
  if (error || !data) return null;
  return data as AnalyticsSummary;
}
