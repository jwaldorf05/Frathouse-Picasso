"use client";

import { forwardRef } from "react";
import Image from "next/image";

interface HeroSectionProps {
  heroBackgroundRef: React.RefObject<HTMLDivElement | null>;
  heroDimRef: React.RefObject<HTMLDivElement | null>;
}

const HeroSection = forwardRef<HTMLDivElement, HeroSectionProps>(
  function HeroSection({ heroBackgroundRef, heroDimRef }, ref) {
    return (
      <>
        {/* Fixed hero background — stays pinned behind everything */}
        <div
          ref={heroBackgroundRef}
          className="fixed inset-0 z-0"
          style={{ width: "100vw", height: "100vh" }}
        >
          <Image
            src="/FP_Background.jpeg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Dark overlay to dim background behind logo & scroll text */}
          <div
            ref={heroDimRef}
            className="absolute inset-0 bg-black/50 will-change-[opacity]"
          />
        </div>

        {/* Hero overlay content — logo image, tagline, scroll indicator */}
        <div
          ref={ref}
          className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none hero-overlay"
        >
          {/* Placeholder logo image — replace /logo-placeholder.svg with your real logo */}
          <Image
            src="/FP_Borderless.png?v=2"
            alt="Frathouse Picasso"
            width={500}
            height={167}
            priority
            className="w-[80vw] max-w-[600px] h-auto drop-shadow-2xl"
          />
          <p
            className="font-[family-name:var(--font-body)] text-white text-hero-shadow mt-6 tracking-[0.3em] uppercase text-center font-medium"
            style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.4rem)" }}
          >
            Art That Hits Different
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 flex flex-col items-center gap-3">
            <span className="font-[family-name:var(--font-body)] text-white/80 text-sm tracking-[0.25em] uppercase text-hero-shadow font-medium">
              Scroll to explore
            </span>
            <svg
              className="w-6 h-6 text-white/80 animate-bounce-slow"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </>
    );
  }
);

export default HeroSection;
