"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSprayPlacements } from "@/lib/sprays";

interface OrderDetails {
  sessionId: string;
  customerEmail: string;
  customerName: string;
  amountTotal: number;
  currency: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    amountTotal: number;
  }>;
  metadata: Record<string, string>;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError('No order session found');
      setLoading(false);
      return;
    }

    // Fetch order details from Stripe session
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/order-details?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to retrieve order details');
        }

        setOrderDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  const handleBackToShop = async () => {
    // Clear the cart
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { action: 'clear' } }));
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }

    // Redirect to All collection
    router.push('/?collection=All');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4"></div>
          <p className="text-text-secondary">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (error || !orderDetails) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <h1 className="font-[family-name:var(--font-body)] font-bold text-3xl mb-4">
            Order Not Found
          </h1>
          <p className="text-text-secondary mb-6">{error || 'Unable to retrieve order details'}</p>
          <Link
            href="/?collection=All"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-6 py-3 rounded-md transition-colors font-bold"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background spray patterns */}
      {getSprayPlacements(8, 42).map((spray, i) => (
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-body)] font-bold text-4xl md:text-5xl mb-2">
            Order Confirmed!
          </h1>
          <p className="text-text-secondary text-lg">
            Thank you for your purchase
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#0d0d0d] border border-[#1c1c1c] rounded-xl p-6 md:p-8 mb-6">
          {/* Order Number */}
          <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
            <p className="text-xs uppercase tracking-[2px] text-text-secondary mb-2">Order Number</p>
            <p className="font-[family-name:var(--font-body)] font-bold text-xl">
              {orderDetails.sessionId.substring(0, 16).toUpperCase()}
            </p>
          </div>

          {/* Customer Details */}
          <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
            <p className="text-xs uppercase tracking-[2px] text-text-secondary mb-3">Customer Details</p>
            <div className="space-y-2">
              {orderDetails.customerName && (
                <p className="text-sm">
                  <span className="text-text-secondary">Name:</span>{' '}
                  <span className="text-white">{orderDetails.customerName}</span>
                </p>
              )}
              {orderDetails.customerEmail && (
                <p className="text-sm">
                  <span className="text-text-secondary">Email:</span>{' '}
                  <span className="text-white">{orderDetails.customerEmail}</span>
                </p>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-3">
              A confirmation email has been sent to {orderDetails.customerEmail}
            </p>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[2px] text-text-secondary mb-4">Order Items</p>
            <div className="space-y-3">
              {orderDetails.lineItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-text-secondary">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium ml-4">
                    {formatPrice(item.amountTotal, orderDetails.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata (Color, Size, Format) */}
          {Object.keys(orderDetails.metadata).length > 0 && (
            <div className="mb-6 pb-6 border-b border-[#1a1a1a]">
              <p className="text-xs uppercase tracking-[2px] text-text-secondary mb-3">Customization</p>
              <div className="space-y-2">
                {orderDetails.metadata.selectedColor && (
                  <p className="text-sm">
                    <span className="text-text-secondary">Color:</span>{' '}
                    <span className="text-white">{orderDetails.metadata.selectedColor}</span>
                  </p>
                )}
                {orderDetails.metadata.selectedSize && (
                  <p className="text-sm">
                    <span className="text-text-secondary">Size:</span>{' '}
                    <span className="text-white">{orderDetails.metadata.selectedSize}</span>
                  </p>
                )}
                {orderDetails.metadata.selectedFormat && (
                  <p className="text-sm">
                    <span className="text-text-secondary">Format:</span>{' '}
                    <span className="text-white">{orderDetails.metadata.selectedFormat}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-4">
            <p className="font-[family-name:var(--font-body)] font-bold text-lg">Total</p>
            <p className="font-[family-name:var(--font-body)] font-bold text-2xl text-accent">
              {formatPrice(orderDetails.amountTotal, orderDetails.currency)}
            </p>
          </div>
        </div>

        {/* Back to Shop Button */}
        <div className="text-center">
          <button
            onClick={handleBackToShop}
            className="inline-block bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-8 py-4 rounded-md transition-colors font-bold"
          >
            Back to Shop
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary">
            Need help with your order?{' '}
            <Link href="/contact" className="text-accent hover:text-accent/80 underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </main>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
