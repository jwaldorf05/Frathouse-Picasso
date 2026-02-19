"use client";

import { forwardRef, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const scrollLines = [
  "Beautifully crafted, custom made",
  "Where did we get them? Don't worry about it.",
];

const ScrollTextSection = forwardRef<HTMLDivElement>(
  function ScrollTextSection(_props, ref) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
      const ctx = gsap.context(() => {
        lineRefs.current.forEach((el) => {
          if (!el) return;

          // Smooth fade-in as text enters viewport from below
          gsap.fromTo(
            el,
            { opacity: 0 },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                end: "top 55%",
                scrub: true,
              },
            }
          );

          // Smooth fade-out as text exits viewport at top
          gsap.fromTo(
            el,
            { opacity: 1 },
            {
              opacity: 0.15,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 30%",
                end: "top 5%",
                scrub: true,
              },
            }
          );
        });
      }, sectionRef);

      return () => ctx.revert();
    }, []);

    return (
      <div
        ref={(node) => {
          // Assign to both the internal ref and the forwarded ref
          (sectionRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className="relative z-[1]"
        style={{ paddingTop: "20vh", paddingBottom: "10vh" }}
      >
        <div className="flex flex-col items-center gap-[18vh] px-6 md:px-12 max-w-[900px] mx-auto">
          {scrollLines.map((line, i) => (
            <div
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="text-white text-hero-shadow font-[family-name:var(--font-body)] font-bold text-center leading-snug will-change-[opacity]"
              style={{ fontSize: "clamp(1.5rem, 5vw, 3.5rem)" }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default ScrollTextSection;
