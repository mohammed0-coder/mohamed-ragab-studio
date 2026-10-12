"use client";

import { useCallback, useRef, useState } from "react";

type GalleryImage = { url: string; alt: string };

export function ProjectGallery({ images, projectTitle }: { images: GalleryImage[]; projectTitle: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, lastX: 0, lastTime: 0, velocity: 0 });
  const [dragging, setDragging] = useState(false);

  const stopMomentum = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const snapToNearest = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let nearest = track.children[0] as HTMLElement;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child) => {
      const el = child as HTMLElement;
      const childCenter = el.offsetLeft + el.offsetWidth / 2;
      const d = Math.abs(childCenter - center);
      if (d < distance) { distance = d; nearest = el; }
    });
    const target = Math.max(0, nearest.offsetLeft - (track.clientWidth - nearest.offsetWidth) / 2);
    track.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  const release = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    drag.current.active = false;
    setDragging(false);
    const run = () => {
      const velocity = drag.current.velocity;
      if (Math.abs(velocity) < 0.12) {
        frameRef.current = null;
        window.setTimeout(snapToNearest, 80);
        return;
      }
      track.scrollLeft -= velocity * 18;
      drag.current.velocity *= 0.92;
      frameRef.current = requestAnimationFrame(run);
    };
    stopMomentum();
    frameRef.current = requestAnimationFrame(run);
  }, [snapToNearest, stopMomentum]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    stopMomentum();
    track.setPointerCapture?.(event.pointerId);
    drag.current = { active: true, startX: event.clientX, startScroll: track.scrollLeft, lastX: event.clientX, lastTime: performance.now(), velocity: 0 };
    setDragging(true);
  }, [stopMomentum]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    event.preventDefault();
    const now = performance.now();
    const dx = event.clientX - drag.current.startX;
    const dt = Math.max(8, now - drag.current.lastTime);
    drag.current.velocity = (event.clientX - drag.current.lastX) / dt;
    drag.current.lastX = event.clientX;
    drag.current.lastTime = now;
    track.scrollLeft = drag.current.startScroll - dx * 1.05;
  }, []);

  return <div
    ref={trackRef}
    className={`project-gallery-track no-scrollbar${dragging ? " is-dragging" : ""}`}
    role="region"
    aria-label={`${projectTitle} gallery`}
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={release}
    onPointerCancel={release}
    onPointerLeave={(event) => { if (drag.current.active && event.pointerType === "mouse") release(); }}
  >
    {images.map((image, index) => <img
      key={`${image.url}-${index}`}
      src={image.url}
      alt={image.alt || `${projectTitle} — ${index + 1}`}
      loading={index === 0 ? "eager" : "lazy"}
      draggable={false}
    />)}
  </div>;
}
