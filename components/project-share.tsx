"use client";

import { useState } from "react";
import { T, useLanguage } from "@/components/language";

const shareChannels = [
  { key: "facebook", label: "Facebook", getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { key: "whatsapp", label: "WhatsApp", getUrl: (url: string, title: string) => `https://wa.me/?text=${encodeURIComponent(title + " " + url)}` },
  { key: "x", label: "X", getUrl: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  { key: "linkedin", label: "LinkedIn", getUrl: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
];

export function ProjectShare({ projectUrl, projectTitle }: { projectUrl: string; projectTitle: string }) {
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();

  const fullUrl = typeof window !== "undefined" ? window.location.origin + projectUrl : projectUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="project-share">
      <div className="eyebrow">
        <T ar="شارك المشروع" en="Share this project" />
        <span>✳</span>
      </div>
      <div className="share-buttons">
        {shareChannels.map(({ key, label, getUrl }) => (
          <a
            key={key}
            href={getUrl(fullUrl, projectTitle)}
            target="_blank"
            rel="noreferrer"
            className="share-btn"
            aria-label={`${language === "ar" ? "مشاركة عبر" : "Share via"} ${label}`}
          >
            {label}
          </a>
        ))}
        <button
          type="button"
          className="share-btn"
          onClick={handleCopy}
        >
          {copied
            ? <T ar="✓ تم النسخ" en="✓ Copied" />
            : <T ar="نسخ الرابط" en="Copy link" />
          }
        </button>
      </div>
    </div>
  );
}
