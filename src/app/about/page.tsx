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
            <p>
              Fidget Newton was a peculiar inventor who lived in a cluttered workshop at the edge of town. 
              His days were spent tinkering with springs, gears, and levers, creating contraptions that 
              served no practical purpose but brought him endless joy.
            </p>

            <p>
              One morning, while rummaging through a box of old parts, Fidget discovered a mysterious golden 
              cog. It was unlike anything he had ever seen—perfectly smooth, warm to the touch, and humming 
              with a faint energy. Intrigued, he decided to incorporate it into his latest invention: a 
              mechanical bird designed to sing at sunrise.
            </p>

            <p>
              As soon as Fidget attached the golden cog, the bird sprang to life. But instead of singing, 
              it began to speak. "Thank you for freeing me," it chirped in a voice that sounded both ancient 
              and kind. "I have been waiting for someone with a curious heart."
            </p>

            <p>
              The bird explained that it was no ordinary creation—it was a guardian of forgotten dreams, 
              tasked with finding those who still believed in the magic of imagination. Fidget, with his 
              endless curiosity and love for the whimsical, had proven himself worthy.
            </p>

            <p>
              From that day forward, Fidget and the mechanical bird became inseparable companions. Together, 
              they traveled the world, collecting stories of wonder and sharing them with anyone willing to 
              listen. And in every town they visited, they left behind a small golden cog—a reminder that 
              magic still exists for those who dare to dream.
            </p>

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
