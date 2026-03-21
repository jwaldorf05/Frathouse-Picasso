"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSprayPlacements } from "@/lib/sprays";

export default function ShippingReturnsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const pageSeed = 'shipping-returns'.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

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
            Custom designs, made-to-order
          </h1>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="space-y-6 text-text-secondary leading-relaxed">
            <p className="text-lg md:text-xl">
              All signs are made-to-order, so we are unable to offer returns. Please allow 7–14 days for your order to arrive given the logistical challenges of shipping these large, beautiful signs. Our team takes all feedback seriously; if you have an issue with your artwork, please message us through our <Link href="/contact" className="text-accent hover:text-accent/80 transition-colors underline">contact form</Link> and we will do everything possible to make it right.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
