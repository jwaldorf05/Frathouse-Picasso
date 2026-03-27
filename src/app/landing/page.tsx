"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import HeroSection from "../components/HeroSection";
import ScrollTextSection from "../components/ScrollTextSection";

gsap.registerPlugin(ScrollTrigger);

const LANDING_SEEN_KEY = "fhp-landing-seen";

export default function LandingPage() {
  const heroBackgroundRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroDimRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const completeLanding = useCallback(() => {
    localStorage.setItem(LANDING_SEEN_KEY, "1");
    router.replace("/?collection=All");
  }, [router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade out hero overlay as scroll text enters viewport
      if (heroOverlayRef.current && scrollTextRef.current) {
        gsap.to(heroOverlayRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: scrollTextRef.current,
            start: "top bottom",
            end: "top 75%",
            scrub: true,
          },
        });
      }

      // Auto-redirect when scroll animation completes
      if (scrollTextRef.current) {
        ScrollTrigger.create({
          trigger: scrollTextRef.current,
          start: "bottom center",
          onEnter: () => {
            completeLanding();
          },
        });
      }
    });

    return () => ctx.revert();
  }, [completeLanding]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      {/* Fixed hero: background image + overlay (logo, tagline, scroll indicator) */}
      <HeroSection 
        heroBackgroundRef={heroBackgroundRef} 
        heroDimRef={heroDimRef} 
        ref={heroOverlayRef} 
      />

      {/* 100vh spacer so hero is fully visible on initial load */}
      <div className="relative z-[1] h-screen" />

      {/* Scroll text floating over the fixed hero */}
      <ScrollTextSection ref={scrollTextRef} />
      
      {/* Extra spacer to ensure scroll trigger fires */}
      <div className="relative z-[1] h-screen" />
    </main>
  );
}
