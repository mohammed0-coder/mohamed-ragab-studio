"use client";

import { useMemo } from "react";

export function ProjectWebsitePreview({ url, title, thumbnail }: { url: string; title: string; thumbnail?: string | null }) {
  const safeUrl = useMemo(() => {
    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : "";
    } catch {
      return "";
    }
  }, [url]);

  if (!safeUrl) return null;

  return (
    <section className="project-browser-showcase" aria-label={`${title} website preview`}>
      <div className="project-browser-frame">
        <div className="project-browser-toolbar">
          <span className="project-browser-dots"><i /><i /><i /></span>
          <span className="project-browser-address">{new URL(safeUrl).host}</span>
          <span className="project-browser-lock" aria-hidden="true">•</span>
        </div>
        <div className="project-browser-viewport">
          <iframe src={safeUrl} title={`${title} website preview`} loading="lazy" sandbox="allow-scripts allow-forms allow-same-origin" referrerPolicy="strict-origin-when-cross-origin" />
          {thumbnail && <img className="project-browser-fallback" src={thumbnail} alt="" aria-hidden="true" />}
        </div>
      </div>
      <div className="project-browser-meta">
        <span>LIVE WEBSITE PREVIEW</span>
        <a href={safeUrl} target="_blank" rel="noreferrer">فتح الموقع ↗</a>
      </div>
    </section>
  );
}
