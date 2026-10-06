"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
};

const offsets = { up: { y: 34 }, down: { y: -34 }, left: { x: 34 }, right: { x: -34 } };

export function MotionReveal({ children, className, delay = 0, direction = "up", once = true }: RevealProps) {
  const reduced = useReducedMotion();
  return <motion.div
    className={className}
    initial={{ opacity: 0, ...offsets[direction] }}
    whileInView={{ opacity: 1, x: 0, y: 0 }}
    viewport={{ once, amount: 0.14, margin: "0px 0px -6%" }}
    transition={{ duration: reduced ? 0.01 : 0.78, delay: reduced ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
  >{children}</motion.div>;
}

export function GsapHeadline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const node = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced || !node.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(node.current, { yPercent: 115, rotate: 2, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.05, ease: "power4.out", delay: 0.08 });
    }, node);
    return () => context.revert();
  }, [reduced]);
  return <span className={`gsap-headline ${className}`}><span ref={node}>{children}</span></span>;
}

export function PageMotion({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0.01 : 0.35, ease: "easeOut" }}>{children}</motion.div>;
}

export function GsapScrollAnimator() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(".section-head, .service-row, .client-mark, .about-block, .team-card, .numbered-service, .contact-info, .contact-layout > div, .project-info, .editorial-copy, .project-nav"));
    if (!items.length) return;
    const observers: IntersectionObserver[] = [];
    const mobile = window.matchMedia("(max-width: 800px)").matches;
    items.forEach((item, index) => {
      gsap.set(item, { opacity: 0, y: mobile ? 14 : 28 });
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        gsap.to(item, { opacity: 1, y: 0, duration: mobile ? .52 : .72, delay: (index % 5) * (mobile ? .02 : .035), ease: "power3.out", overwrite: true });
        observer.disconnect();
      }, { threshold: .12 });
      observer.observe(item);
      observers.push(observer);
    });
    return () => {
      observers.forEach((observer) => observer.disconnect());
      gsap.set(items, { clearProps: "opacity,transform" });
    };
  });
  return null;
}
