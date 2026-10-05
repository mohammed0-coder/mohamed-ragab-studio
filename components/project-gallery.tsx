"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface GalleryImage {
  url: string;
  alt: string;
}

export function ProjectGallery({ images, projectTitle }: { images: GalleryImage[]; projectTitle: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    setIsDragging(true);
    dragStart.current = { x: e.pageX - track.offsetLeft, scrollLeft: track.scrollLeft };
    track.style.cursor = "grabbing";
    track.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    const track = trackRef.current;
    if (track) {
      track.style.cursor = "grab";
      track.style.userSelect = "";
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const x = e.pageX - track.offsetLeft;
    const walk = (x - dragStart.current.x) * 1.5;
    track.scrollLeft = dragStart.current.scrollLeft - walk;
  }, [isDragging]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollAmount = 320;
      if (e.key === "ArrowRight") {
        track.scrollBy({ left: scrollAmount, behavior: "smooth" });
      } else if (e.key === "ArrowLeft") {
        track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      }
    };

    track.addEventListener("keydown", handleKeyDown);
    return () => track.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      const track = trackRef.current;
      if (track) {
        track.style.cursor = "grab";
        track.style.userSelect = "";
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={trackRef}
      className="project-gallery-track no-scrollbar"
      tabIndex={0}
      role="region"
      aria-label={`${projectTitle} gallery`}
      style={{ cursor: "grab" }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {images.map((image, i) => (
        <img
          key={`${image.url}-${i}`}
          src={image.url}
          alt={image.alt || `${projectTitle} — ${i + 1}`}
          loading="lazy"
          draggable={false}
        />
      ))}
    </div>
  );
}
