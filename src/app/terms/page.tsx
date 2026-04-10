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
║                    TERMS OF SERVICE                           ║
║                    THE FINE PRINT                             ║
╚═══════════════════════════════════════════════════════════════╝`}
        </pre>

        <div className="space-y-8 text-sm leading-relaxed">
          <div className="border border-[#00ff00]/20 p-4 bg-[#001100]/30">
            <p className="text-[#00ff00]/60 mb-2">&gt; Last Updated: April 2026</p>
          </div>

          {/* Section 1 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [1] The &ldquo;Authenticity&rdquo; Disclaimer
            </h2>
            <p className="text-[#00ff00]/80">
              Frathouse Picasso produces high-fidelity, custom-made novelty signage. While our products are engineered to look, feel, and weigh exactly like municipal or industrial assets, they are 100% legitimate artistic reproductions. By purchasing, you acknowledge that you are buying a custom decor piece and not a &ldquo;liberated&rdquo; government asset. We do not sell stolen property; we just sell the vibe.
            </p>
          </section>

          {/* Section 2 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [2] Custom Orders &amp; Finality
            </h2>
            <p className="text-[#00ff00]/80">
              Because each sign is custom-made to order via our specialized workshop, all sales are final. Once an order enters our production queue (typically within 24 hours), we cannot offer cancellations or refunds. If your sign arrives damaged or with a typo that we made, contact &ldquo;The Management&rdquo; immediately.
            </p>
          </section>

          {/* Section 3 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [3] Usage &amp; Liability
            </h2>
            <p className="text-[#00ff00]/80">
              Our signs are for indoor/private outdoor decor only. Frathouse Picasso is not responsible if you decide to mount one of our signs in a public right-of-way and a confused city official tries to fine you. Use your head.
            </p>
          </section>

          {/* Section 4 */}
          <section className="border-l-2 border-[#00ff00]/40 pl-4">
            <h2 className="text-lg font-bold mb-3 text-[#00ff00]">
              [4] Payments
            </h2>
            <p className="text-[#00ff00]/80">
              All transactions are handled securely via Stripe. We never see or store your full credit card number. If a charge shows up as &ldquo;FRATHOUSE PICASSO,&rdquo; don&rsquo;t panic—it&rsquo;s just the signs.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t border-[#00ff00]/20 pt-8 mt-12">
            <pre className="text-[#00ff00]/40 text-xs">
{`> END OF DOCUMENT
> FRATHOUSE_PICASSO_LEGAL_v1.0
> [ACCEPT] [DECLINE] [CONTACT_MANAGEMENT]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
