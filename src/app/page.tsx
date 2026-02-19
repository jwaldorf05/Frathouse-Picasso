"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSearchParams } from "next/navigation";
import HeroSection from "./components/HeroSection";
import ScrollTextSection from "./components/ScrollTextSection";
import ShopLayout from "./components/ShopLayout";

gsap.registerPlugin(ScrollTrigger);

const SHOP_INTRO_SEEN_KEY = "fhp-shop-intro-seen";

export default function Home() {
  const heroBackgroundRef = useRef<HTMLDivElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const heroDimRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const shopLayoutRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [shopVisible, setShopVisible] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  const showShopView = useCallback((scrollToShop: boolean) => {
    queueMicrotask(() => setShopVisible(true));

    if (heroBackgroundRef.current) {
      heroBackgroundRef.current.style.display = "none";
    }
    if (heroOverlayRef.current) {
      heroOverlayRef.current.style.display = "none";
    }
    if (heroDimRef.current) {
      heroDimRef.current.style.opacity = "0";
    }

    if (scrollToShop) {
      requestAnimationFrame(() => {
        shopLayoutRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, []);

  const completeIntro = useCallback((scrollToShop: boolean) => {
    localStorage.setItem(SHOP_INTRO_SEEN_KEY, "1");
    queueMicrotask(() => setIntroCompleted(true));
    showShopView(scrollToShop);
  }, [showShopView]);

  useEffect(() => {
    if (introCompleted) {
      return;
    }

    const ctx = gsap.context(() => {
      // ── 1. Fade out hero overlay (logo, tagline, scroll indicator)
      //    as soon as the scroll text section enters the viewport.
      //    This ensures hero branding and scroll text never coexist.
      if (heroOverlayRef.current && scrollTextRef.current) {
        gsap.to(heroOverlayRef.current, {
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: scrollTextRef.current,
            start: "top bottom",   // first pixel of scroll text enters viewport
            end: "top 75%",        // fully hidden by the time text is 25% in
            scrub: true,
          },
        });
      }

      // ── 2. Layout shift: fires when the bottom of the scroll text
      //    section reaches the top of the viewport (all text gone).
      if (scrollTextRef.current && heroBackgroundRef.current) {
        ScrollTrigger.create({
          trigger: scrollTextRef.current,
          start: "bottom top",
          onEnter: () => {
            completeIntro(false);
          },
          onLeaveBack: () => {
            // Restore fixed hero when scrolling back up
            if (heroBackgroundRef.current) {
              heroBackgroundRef.current.style.display = "";
              heroBackgroundRef.current.style.opacity = "1";
            }
            if (heroOverlayRef.current) {
              heroOverlayRef.current.style.display = "";
            }
            // Restore dim overlay
            if (heroDimRef.current) {
              heroDimRef.current.style.opacity = "1";
            }
            setShopVisible(false);
          },
        });
      }
    });

    return () => ctx.revert();
  }, [completeIntro, introCompleted]);

  useEffect(() => {
    const deepLinkedToShop = searchParams.get("shop") === "1";
    const introAlreadySeen = localStorage.getItem(SHOP_INTRO_SEEN_KEY) === "1";

    if (!deepLinkedToShop && !introAlreadySeen) {
      return;
    }

    completeIntro(true);
  }, [completeIntro, searchParams]);

  return (
    <main className="relative">
      {!introCompleted && (
        <>
          {/* Fixed hero: background image + overlay (logo, tagline, scroll indicator) */}
          <HeroSection heroBackgroundRef={heroBackgroundRef} heroDimRef={heroDimRef} ref={heroOverlayRef} />

          {/* 100vh spacer so hero is fully visible on initial load */}
          <div className="relative z-[1] h-screen" />

          {/* Scroll text floating over the fixed hero — NO background */}
          <ScrollTextSection ref={scrollTextRef} />
        </>
      )}

      {/* Shop layout: sidebar + hero banner + carousel */}
      <div ref={shopLayoutRef}>
        <ShopLayout visible={shopVisible} />
      </div>
    </main>
  );
}
