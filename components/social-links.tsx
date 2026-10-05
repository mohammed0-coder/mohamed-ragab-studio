"use client";

const socialItems = [
  { label: "Facebook", href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK, icon: <path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8z" /> },
  { label: "Instagram", href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM, icon: <><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.6" cy="6.6" r="1.1" /></> },
  { label: "WhatsApp", href: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP, icon: <path d="M20.2 3.8A11 11 0 0 0 2.9 17.1L1.5 22.5l5.5-1.4a11 11 0 0 0 13.2-17.3ZM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1-.6.8-.8.9-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.3 0-.5s-.6-1.5-.9-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.2 1 2.5 1.1 2.7a10 10 0 0 0 3.8 3.4c.5.2 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.2s.2-1.1.1-1.2-.2-.2-.4-.3Z" /> },
  { label: "LinkedIn", href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN, icon: <path d="M5.2 8.4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM3.7 10h3v10h-3zm5 0h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.7 2 3.7 4.6V20h-3v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5h-3z" /> },
  { label: "X", href: process.env.NEXT_PUBLIC_SOCIAL_X, icon: <path d="M18.9 3H22l-6.8 7.8L23.2 21h-6.3L12 14.8 6.6 21H3.4l7.3-8.4L3 3h6.5l4.5 5.9zM17.8 19h1.7L8.5 4.9H6.7z" /> },
] as const;

export function SocialLinks({ label = "Social media" }: { label?: string }) {
  return <div className="social-links" aria-label={label}>
    {socialItems.map(({ label: name, href, icon }) => {
      const url = href?.trim();
      const mark = <><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">{icon}</svg><span className="sr-only">{name}</span></>;
      return url
        ? <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}>{mark}</a>
        : <span key={name} className="social-link-unset" aria-label={`${name} link not configured`}>{mark}</span>;
    })}
  </div>;
}
