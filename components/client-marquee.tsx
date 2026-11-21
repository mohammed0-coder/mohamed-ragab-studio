"use client";

import type { CSSProperties } from "react";
import type { Client } from "@/lib/types";

function Logo({ client }: { client: Client }) {
  const content = client.logo_url ? <img src={client.logo_url} alt={client.alt_text || client.name} loading="lazy" /> : <span>{client.name}</span>;
  return client.website_url ? <a className="client-marquee-item" href={client.website_url} target="_blank" rel="noreferrer" aria-label={client.name}>{content}</a> : <span className="client-marquee-item" aria-label={client.name}>{content}</span>;
}

function Track({ clients, direction }: { clients: Client[]; direction: "rtl" | "ltr" }) {
  const duration = Math.max(12, Math.min(120, Number(clients[0]?.animation_speed || (direction === "rtl" ? 28 : 31))));
  return <div className="client-marquee-track" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
    <div className={`client-marquee-sequence client-marquee-${direction}`}>{clients.map(client => <Logo key={`a-${client.id}`} client={client} />)}</div>
    <div className={`client-marquee-sequence client-marquee-${direction}`} aria-hidden="true">{clients.map(client => <Logo key={`b-${client.id}`} client={client} />)}</div>
  </div>;
}

export function ClientMarquee({ clients }: { clients: Client[] }) {
  const visible = clients.filter(client => client.visible !== false);
  if (!visible.length) return <div className="empty-state">شركاء جدد قريبًا <span>✳</span></div>;
  const rowOne = visible.filter(client => client.row_assignment !== 2);
  const rowTwo = visible.filter(client => client.row_assignment === 2);
  const second = rowTwo.length ? [...rowTwo].reverse() : [...visible].reverse();
  return <div className="client-marquee" aria-label="Client logos">
    <div className="client-marquee-row"><Track clients={rowOne.length ? rowOne : visible} direction="rtl" /></div>
    <div className="client-marquee-row"><Track clients={second.length ? second : visible} direction="ltr" /></div>
  </div>;
}
