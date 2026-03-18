"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSprayPlacements } from "@/lib/sprays";

export default function AboutPage() {
  const [isMounted, setIsMounted] = useState(false);
  const pageSeed = 'about'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background spray patterns */}
      {isMounted && getSprayPlacements(8, pageSeed).map((spray, i) => (
        <img
          key={i}
          src={spray.src}
          alt=""
          className="fixed pointer-events-none z-0"
          style={{
            ...spray.pos,
            width: spray.size,
            height: 'auto',
            opacity: spray.opacity * 0.15,
            transform: `rotate(${spray.rotation}deg) scale(${spray.scale})`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/?shop=1"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>

        {/* Header */}
        <div className="mb-12 relative z-10">
          <Image
            src="/FP_Borderless.png"
            alt="Frathouse Picasso"
            width={200}
            height={67}
            className="w-[180px] h-auto mb-6"
          />
          <h1 className="font-[family-name:var(--font-body)] font-bold text-4xl md:text-5xl mb-4">
            ABOUT US
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="space-y-6 text-text-secondary leading-relaxed">
            <p className="text-lg md:text-xl">
              This mission begun with a few college students who found a few street sings that fell off some poles and got an idea. Many shenanigans later, this hobby has become an obsession where we procured custom signage from our dorms to deliver to friends. We strive to bring an urban, sketchy aesthetic to dorms and frat houses around the world.
            </p>

            {/* Beautiful/Legal Tagline */}
            <div className="mt-16 mb-12 flex flex-col items-center text-center">
              {/* Line 1: Beautiful ✓ */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span 
                  className="font-[family-name:var(--font-body)] font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none"
                  style={{ 
                    color: '#CCFF00',
                    textShadow: '0 0 20px rgba(204, 255, 0, 0.5), 0 0 40px rgba(204, 255, 0, 0.3)'
                  }}
                >
                  Beautiful
                </span>
                <img 
                  src="/images/Checkmark_Yellow.png"
                  alt="Checkmark"
                  className="h-[0.9em] w-auto flex-shrink-0"
                  style={{
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 20px rgba(204, 255, 0, 0.5)) drop-shadow(0 0 40px rgba(204, 255, 0, 0.3))'
                  }}
                />
              </div>
              
              {/* Line 2: Legal ? */}
              <div className="flex items-center justify-center gap-4">
                <span 
                  className="font-[family-name:var(--font-body)] font-bold text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-none"
                  style={{ 
                    color: '#FF007F',
                    textShadow: '0 0 20px rgba(255, 0, 127, 0.5), 0 0 40px rgba(255, 0, 127, 0.3)'
                  }}
                >
                  Legal
                </span>
                <img 
                  src="/images/Question_Pink.png"
                  alt="Question mark"
                  className="h-[0.9em] w-auto flex-shrink-0"
                  style={{
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 20px rgba(255, 0, 127, 0.5)) drop-shadow(0 0 40px rgba(255, 0, 127, 0.3))'
                  }}
                />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-[#1a1a1a]">
              <h2 className="font-[family-name:var(--font-body)] font-bold text-white text-2xl mb-4">
                GET IN TOUCH
              </h2>
              <p className="mb-4">
                Have questions or want to learn more about our custom designs? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/custom"
                  className="inline-block bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-6 py-3 rounded-md transition-colors font-bold text-center"
                >
                  Request Custom Design
                </Link>
                <Link
                  href="/?shop=1"
                  className="inline-block border border-[#333] hover:border-white text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-6 py-3 rounded-md transition-colors font-bold text-center"
                >
                  Browse Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
