"use client";

import { useState } from "react";

export type AnalyticsPayload = {
  current: number;
  previous: number;
  change: number;
  label: string;
  series: { label: string; value: number }[];
};

export function AdminAnalytics({ data }: { data: Record<string, AnalyticsPayload> }) {
  const [period, setPeriod] = useState("week");
  const item = data[period] || data.week;
  const positive = item.change > 0;
  const negative = item.change < 0;
  const max = Math.max(1, ...item.series.map(point => point.value));
  return <section id="analytics" className="admin-panel-section admin-analytics-section">
    <div className="admin-section-heading"><div><span className="eyebrow">01 / الأداء</span><h2>تحليل زيارات الموقع</h2></div><div className="admin-period-switcher">{[["day","يومي"],["week","أسبوعي"],["month","شهري"],["year","سنوي"]].map(([key,label])=><button key={key} type="button" className={period===key?"is-active":""} onClick={()=>setPeriod(key)}>{label}</button>)}</div></div>
    <div className="analytics-summary"><div><span>زيارات الفترة</span><strong>{item.current.toLocaleString("ar-EG")}</strong><small className={positive?"is-positive":negative?"is-negative":""}>{positive?"↑":negative?"↓":"→"} {Math.abs(item.change).toFixed(1)}% مقارنة بالفترة السابقة</small></div><div><span>التقييم</span><strong>{positive?"مرتفع":negative?"في هبوط":"مستقر"}</strong><small>{item.label}</small></div></div>
    <div className="analytics-chart" aria-label={`زيارات ${item.label}`}>{item.series.map(point=><div className="analytics-bar" key={point.label}><div className="analytics-bar-value" style={{height:`${Math.max(3, point.value/max*100)}%`}} title={`${point.label}: ${point.value}`}/><span>{point.label}</span></div>)}</div>
    <p className="admin-analytics-note">البيانات تقريبية ومجهولة الهوية؛ يتم احتساب زيارة واحدة لكل جهاز في اليوم.</p>
  </section>;
}
