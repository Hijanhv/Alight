"use client";

import { useEffect } from "react";

// Progressive enhancement: fade sections up as they scroll into view.
// No-JS and reduced-motion users see everything immediately.
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll("section.section"));
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
