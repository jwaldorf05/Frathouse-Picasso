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
    <div className="min-h-screen bg-black text-[#00ff00] font-mono">
      {/* Header */}
      <div className="border-b border-[#00ff00]/30 p-4">
        <Link 
          href="/?shop=1" 
          className="inline-flex items-center gap-2 text-[#00ff00] hover:text-[#00ff00]/80 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          [RETURN_TO_SHOP]
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* ASCII Art Header */}
        <pre className="text-[#00ff00]/60 text-xs mb-8 overflow-x-auto">
{`╔═══════════════════════════════════════════════════════════════╗
║                    PRIVACY POLICY                             ║
║                 YOUR SECRETS ARE SAFE                         ║
╚═══════════════════════════════════════════════════════════════╝`}
        </pre>

        <div className="space-y-8 text-sm leading-relaxed">
          <div className="border border-[#00ff00]/20 p-4 bg-[#001100]/30">
            <p className="text-[#00ff00]/60 mb-2">&gt; Effective Date: April 2026</p>
          </div>

          {/* Section 1 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [1] Data Collection (The Digital Footprint)
            </h2>
            <p className="text-[#00ff00]/80 mb-4">
              We collect the bare minimum needed to get your gear to your door:
            </p>
            <ul className="space-y-2 text-[#00ff00]/80 ml-4">
              <li className="flex gap-2">
                <span className="text-[#00ff00]">&gt;</span>
                <span><strong>Identity:</strong> Name and Email (stored via Supabase Auth).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00ff00]">&gt;</span>
                <span><strong>Logistics:</strong> Shipping address and order history.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00ff00]">&gt;</span>
                <span><strong>Tech:</strong> IP address and browser type (standard Vercel logging for site performance).</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [2] Third-Party &ldquo;Associates&rdquo;
            </h2>
            <p className="text-[#00ff00]/80 mb-4">
              We don&rsquo;t &ldquo;snitch&rdquo; or sell your data. We only share it with the essential partners required to complete your transaction:
            </p>
            <ul className="space-y-2 text-[#00ff00]/80 ml-4">
              <li className="flex gap-2">
                <span className="text-[#00ff00]">&gt;</span>
                <span><strong>Stripe:</strong> To process your payment.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00ff00]">&gt;</span>
                <span><strong>Supabase:</strong> To keep your account and order data secure.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00ff00]">&gt;</span>
                <span><strong>Shipping Carriers:</strong> (UPS/USPS/FedEx) So they know where to drop the package.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [3] No Paper Trail (Data Retention)
            </h2>
            <p className="text-[#00ff00]/80">
              You have the &ldquo;Right to be Forgotten.&rdquo; If you want your account and data purged from our Supabase backend, just shoot us an email. We&rsquo;ll wipe the record clean, no questions asked.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [4] Cookies
            </h2>
            <p className="text-[#00ff00]/80">
              We use cookies to keep you logged in and to remember what&rsquo;s in your cart. No tracking pixels for &ldquo;Big Brother&rdquo;—just functional stuff to make the site work.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-[#00ff00]/20 pt-8 mt-12">
            <pre className="text-[#00ff00]/40 text-xs">
{`> END OF DOCUMENT
> FRATHOUSE_PICASSO_PRIVACY_v1.0
> [ENCRYPTED] [SECURE] [NO_TRACKING]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
