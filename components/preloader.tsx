"use client";

import { useEffect, useState, useRef } from "react";

const words = ["إبداع", "تميّز", "حضور", "ابتكار", "أثر"];

export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [percent, setPercent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    // Cycle words
    intervalRef.current = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 600);

    let cancelled = false;

    const ready = async () => {
      const images = Array.from(document.images).filter((img) => img.loading !== "lazy");
      const total = images.length + 1; // +1 for fonts
      let loaded = 0;

      const tick = () => {
        loaded++;
        if (!cancelled) setPercent(Math.min(Math.round((loaded / total) * 100), 100));
      };

      await Promise.all(
        images.map(async (img) => {
          if (img.complete) {
            try { await img.decode(); } catch { /* skip broken */ }
            tick();
            return;
          }
          await new Promise<void>((resolve) => {
            img.addEventListener("load", () => { tick(); resolve(); }, { once: true });
            img.addEventListener("error", () => { tick(); resolve(); }, { once: true });
          });
        })
      );

      try { await document.fonts.ready; } catch { /* continue */ }
      tick();

      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) =>
          window.addEventListener("load", () => resolve(), { once: true })
        );
      }

      if (!cancelled) {
        setPercent(100);
        window.setTimeout(() => {
          setVisible(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }, 500);
      }
    };

    const timeout = window.setTimeout(() => {
      setVisible(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }, 6000);

    void ready();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={`site-preloader${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="preloader-word-wrapper">
        {words.map((word, i) => (
          <span
            key={word}
            className={`preloader-word${i === wordIndex ? " is-active" : ""}`}
          >
            {word}
          </span>
        ))}
      </div>
      <span className="preloader-percent">{percent}%</span>
    </div>
  );
}
