"use client";

import { useState } from "react";
import Link from "next/link";
import type { Service } from "@/lib/types";
import { ContentText, T } from "@/components/language";

export function ServiceDiscovery({ services }: { services: Service[] }) {
  const [active, setActive] = useState(services[0]?.id || "");
  const selected = services.find(service => service.id === active) || services[0];
  if (!selected) return null;
  return <div className="service-discovery">
    <div className="service-discovery-tabs" role="tablist" aria-label="Services">
      {services.slice(0, 4).map(service => <button key={service.id} type="button" role="tab" aria-selected={selected.id === service.id} className={selected.id === service.id ? "is-active" : ""} onClick={() => setActive(service.id)}>
        <strong><ContentText ar={service.title} en={service.title_en || service.title} /></strong>
      </button>)}
    </div>
    <article className="service-discovery-panel">
      <div className="service-discovery-copy">
        <div className="eyebrow"><T ar="الخدمة المختارة" en="Selected service" /></div>
        <h2><ContentText ar={selected.title} en={selected.title_en || selected.title} /></h2>
        <p><ContentText ar={selected.description} en={selected.description_en || selected.description} /></p>
        {!!selected.items?.length && <ul>{selected.items.map(item => <li key={item}><ContentText ar={item} /></li>)}</ul>}
        <Link className="admin-button service-request-button" href={selected.cta_url || `/contact?service=${encodeURIComponent(selected.title)}`}><T ar={selected.cta_label_ar || "اطلب هذه الخدمة ↙"} en={selected.cta_label_en || "Request this service ↙"} /></Link>
      </div>
      <div className="service-discovery-meta"><span className="service-discovery-mark" aria-hidden="true">✳</span><small><T ar="اختر الخدمة المناسبة، استكشف التفاصيل، ثم ابدأ طلبك." en="Choose the right service, explore the details, then start your request." /></small></div>
    </article>
  </div>;
}
