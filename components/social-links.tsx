"use client";

import { useEffect, useState } from "react";

type SocialState = { facebook?: string; instagram?: string; whatsapp?: string; linkedin?: string; x?: string; behance?: string };
const fallback: SocialState = {
  facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP,
  linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
  x: process.env.NEXT_PUBLIC_SOCIAL_X,
  behance: process.env.NEXT_PUBLIC_SOCIAL_BEHANCE,
};
const items = [
  { key: "facebook", label: "Facebook", icon: <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8z" /> },
  { key: "instagram", label: "Instagram", icon: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.6" cy="6.6" r="1.1" /></> },
  { key: "whatsapp", label: "WhatsApp", icon: <path d="M20.2 3.8A11 11 0 0 0 2.9 17.1L1.5 22.5l5.5-1.4a11 11 0 0 0 13.2-17.3ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1-.6.8-.8.9-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.2 1 2.5 1.1 2.7a10 10 0 0 0 3.8 3.4c.5.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.2s.2-1.1.1-1.2-.2-.2-.4-.3Z" /> },
  { key: "linkedin", label: "LinkedIn", icon: <path d="M5.2 8.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.7 10h3v10h-3zm5 0h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.6V20h-3v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5h-3z" /> },
  { key: "x", label: "X", icon: <path d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.8 6.6 21H3.4l7.3-8.4L3 3h6.5l4.5 5.9zM17.8 19h1.7L8.5 4.9H6.7z" /> },
  { key: "behance", label: "Behance", icon: <><path d="M5 5h5.6c3 0 4.8 1.4 4.8 3.6 0 1.5-.8 2.6-2.1 3.1 1.8.5 2.8 1.8 2.8 3.5 0 2.8-2.2 4.8-5.5 4.8H5V5Zm3 2.5v3.1h2.3c1.2 0 2-.5 2-1.6s-.8-1.5-2-1.5H8Zm0 5.5v4.3h2.5c1.5 0 2.5-.7 2.5-2.1s-1-2.2-2.5-2.2H8Z"/><path d="M18 8h3.5v1.5H18V8Zm1.7 2.3c2.7 0 4.3 1.8 4.3 4.8v.6h-6.5c.2 1.2 1 2 2.3 2 .9 0 1.6-.3 2.2-.9l1.7 1.5c-1 1.1-2.3 1.7-4 1.7-3.2 0-5.2-1.9-5.2-4.8 0-2.9 2-4.9 5.2-4.9Zm-2.3 3.5h3.7c-.2-1-1-1.8-1.8-1.8s-1.7.7-1.9 1.8Z"/></> },
] as const;

export function SocialLinks({ label = "Social media" }: { label?: string }) {
  const [social, setSocial] = useState<SocialState>(fallback);
  useEffect(() => { fetch("/api/site-settings").then((response) => response.ok ? response.json() : null).then((data) => data && setSocial({ facebook: data.social_facebook, instagram: data.social_instagram, whatsapp: data.social_whatsapp, linkedin: data.social_linkedin, x: data.social_x, behance: data.social_behance })).catch(() => undefined); }, []);

  return <div className="social-links" aria-label={label}>
    {items.map(({ key, label: name, icon }) => {
      const url = social[key]?.trim();
      const mark = <><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{icon}</svg><span className="sr-only">{name}</span></>;
      return url ? <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}>{mark}</a> : <span key={name} className="social-link-unset" aria-label={`${name} link not configured`}>{mark}</span>;
    })}
  </div>;
}
