'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] p-6">
        <Link 
          href="/?shop=1" 
          className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors text-sm font-[family-name:var(--font-body)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-[family-name:var(--font-body)] font-bold text-4xl md:text-5xl text-white mb-4">
          Terms of Service: The Fine Print
        </h1>

        <div className="space-y-8 text-base leading-relaxed">
          <div className="border-l-2 border-[#333] pl-4">
            <p className="text-[var(--text-muted)] mb-4">Last Updated: April 2026</p>
          </div>

          {/* Section 1 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              1. The &ldquo;Authenticity&rdquo; Disclaimer
            </h2>
            <p className="text-[var(--text-secondary)]">
              Frathouse Picasso produces high-fidelity, custom-made novelty signage. While our products are engineered to look, feel, and weigh exactly like municipal or industrial assets, they are 100% legitimate artistic reproductions. By purchasing, you acknowledge that you are buying a custom decor piece and not a &ldquo;liberated&rdquo; government asset. We do not sell stolen property; we just sell the vibe.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              2. Custom Orders &amp; Finality
            </h2>
            <p className="text-[var(--text-secondary)]">
              Because each sign is custom-made to order via our specialized workshop, all sales are final. Once an order enters our production queue (typically within 24 hours), we cannot offer cancellations or refunds. If your sign arrives damaged or with a typo that we made, contact &ldquo;The Management&rdquo; immediately.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              3. Usage &amp; Liability
            </h2>
            <p className="text-[var(--text-secondary)]">
              Our signs are for indoor/private outdoor decor only. Frathouse Picasso is not responsible if you decide to mount one of our signs in a public right-of-way and a confused city official tries to fine you. Use your head.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              4. Payments
            </h2>
            <p className="text-[var(--text-secondary)]">
              All transactions are handled securely via Stripe. We never see or store your full credit card number. If a charge shows up as &ldquo;FRATHOUSE PICASSO,&rdquo; don&rsquo;t panic—it&rsquo;s just the signs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
