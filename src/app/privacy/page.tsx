'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          Privacy Policy: Your Secrets Are Safe
        </h1>

        <div className="space-y-8 text-base leading-relaxed">
          <div className="border-l-2 border-[#333] pl-4">
            <p className="text-[var(--text-muted)] mb-4">Effective Date: April 2026</p>
          </div>

          {/* Section 1 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              1. Data Collection (The Digital Footprint)
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We collect the bare minimum needed to get your gear to your door:
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)] ml-4 list-disc">
              <li>
                <strong className="text-white">Identity:</strong> Name and Email (stored via Supabase Auth).
              </li>
              <li>
                <strong className="text-white">Logistics:</strong> Shipping address and order history.
              </li>
              <li>
                <strong className="text-white">Tech:</strong> IP address and browser type (standard Vercel logging for site performance).
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              2. Third-Party &ldquo;Associates&rdquo;
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              We don&rsquo;t &ldquo;snitch&rdquo; or sell your data. We only share it with the essential partners required to complete your transaction:
            </p>
            <ul className="space-y-2 text-[var(--text-secondary)] ml-4 list-disc">
              <li>
                <strong className="text-white">Stripe:</strong> To process your payment.
              </li>
              <li>
                <strong className="text-white">Supabase:</strong> To keep your account and order data secure.
              </li>
              <li>
                <strong className="text-white">Shipping Carriers:</strong> (UPS/USPS/FedEx) So they know where to drop the package.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              3. No Paper Trail (Data Retention)
            </h2>
            <p className="text-[var(--text-secondary)]">
              You have the &ldquo;Right to be Forgotten.&rdquo; If you want your account and data purged from our Supabase backend, just shoot us an email. We&rsquo;ll wipe the record clean, no questions asked.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-l-2 border-[#333] pl-4">
            <h2 className="text-xl font-bold mb-3 text-white font-[family-name:var(--font-body)]">
              4. Cookies
            </h2>
            <p className="text-[var(--text-secondary)]">
              We use cookies to keep you logged in and to remember what&rsquo;s in your cart. No tracking pixels for &ldquo;Big Brother&rdquo;—just functional stuff to make the site work.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
