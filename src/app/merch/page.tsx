"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MerchComingSoonPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden flex items-center justify-center">
      {/* Background - Murder Spray centered */}
      {isMounted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/stickers/Murder Spray.png"
            alt=""
            className="w-[600px] h-auto opacity-15"
            style={{ transform: 'rotate(-12deg)' }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Logo */}
        <Image
          src="/FP_Borderless.png"
          alt="Frathouse Picasso"
          width={200}
          height={67}
          className="w-[180px] h-auto mb-12 mx-auto"
        />

        {/* Coming Soon Text */}
        <h1 className="font-[family-name:var(--font-body)] font-bold text-6xl md:text-7xl mb-6 text-white">
          COMING SOON!
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed mb-12">
          We're working on something special. Check back soon for exclusive merch.
        </p>

        {/* Back to Shop Button */}
        <Link
          href="/?shop=1"
          className="inline-flex items-center gap-2 border border-[#333] hover:border-white text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-8 py-4 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>
      </div>
    </main>
  );
}
