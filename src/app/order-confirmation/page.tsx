"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OrderDetails {
  sessionId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    name: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
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

  const formatAddress = () => {
    if (!orderDetails.shippingAddress) return null;
    const addr = orderDetails.shippingAddress;
    const parts = [
      addr.name,
      addr.line1,
      addr.line2,
      [addr.city, addr.state, addr.postalCode].filter(Boolean).join(', '),
      addr.country,
    ].filter(Boolean);
    return parts.join('\n');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Spray Paint Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <img src="/stickers/Murder Spray.png" alt="" className="absolute top-10 left-10 w-32 h-32 rotate-12" />
        <img src="/stickers/Pledge Leash Spray.png" alt="" className="absolute top-40 right-20 w-28 h-28 -rotate-6" />
        <img src="/stickers/Pong Spray.png" alt="" className="absolute bottom-32 left-16 w-36 h-36 rotate-45" />
        <img src="/stickers/Radioactive Spray.png" alt="" className="absolute top-1/3 right-10 w-32 h-32 -rotate-12" />
        <img src="/stickers/SEND Spraypaint.png" alt="" className="absolute bottom-20 right-24 w-40 h-40 rotate-6" />
        <img src="/stickers/Three Way Spray.png" alt="" className="absolute top-20 right-1/3 w-28 h-28 rotate-90" />
        <img src="/stickers/Wizard Spraypaint.png" alt="" className="absolute bottom-40 left-1/4 w-32 h-32 -rotate-45" />
      </div>
      
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 relative z-10">
        {/* Header */}
        <div className="mb-8 pb-8 border-b border-accent/30">
          <h1 className="font-[family-name:var(--font-body)] font-bold text-3xl md:text-4xl mb-3">
            The goods are moving.
          </h1>
          <p className="text-text-secondary text-base">
            Hi {orderDetails.customerName || 'there'}, thanks for your order.
          </p>
          <p className="text-text-secondary text-sm mt-2">
            We received your payment successfully. You should receive a confirmation email shortly with your order details.
          </p>
        </div>

        {/* Order Number */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[2px] text-text-secondary mb-2">Order Number</p>
          <p className="font-[family-name:var(--font-body)] font-bold text-2xl text-accent">
            {orderDetails.orderNumber}
          </p>
        </div>

        {/* Your Items */}
        <div className="mb-8">
          <h2 className="font-[family-name:var(--font-body)] font-bold text-xl mb-4">Your Items</h2>
          
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 pb-3 mb-3 border-b border-[#333] text-xs uppercase tracking-[1.5px] text-text-secondary">
            <div>Item</div>
            <div className="text-right">Qty</div>
            <div className="text-right">Price</div>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-3">
            {orderDetails.lineItems.map((item, index) => {
              const sizeInfo = orderDetails.metadata.selectedSize ? ` — Size: ${orderDetails.metadata.selectedSize}` : '';
              return (
                <div key={index} className="grid grid-cols-[2fr_1fr_1fr] gap-4 items-start">
                  <div className="text-sm">{item.description}{sizeInfo}</div>
                  <div className="text-sm text-right">{item.quantity}</div>
                  <div className="text-sm text-right font-medium">
                    {formatPrice(item.amountTotal, orderDetails.currency)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Total */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 mt-4 pt-4 border-t border-[#333]">
            <div></div>
            <div className="text-sm font-bold text-right">Total</div>
            <div className="text-sm font-bold text-right">
              {formatPrice(orderDetails.amountTotal, orderDetails.currency)}
            </div>
          </div>
        </div>

        {/* Shipping To */}
        {orderDetails.shippingAddress && (
          <div className="mb-8">
            <h2 className="font-[family-name:var(--font-body)] font-bold text-xl mb-4">Shipping To</h2>
            <div className="bg-[#0d0d0d] border border-[#1c1c1c] rounded-lg p-4">
              <pre className="text-sm text-text-secondary whitespace-pre-line font-[family-name:var(--font-body)]">
                {formatAddress()}
              </pre>
            </div>
          </div>
        )}

        {/* Delivery Info */}
        <div className="mb-8">
          <div className="bg-[#1a1111] border-l-4 border-accent p-4 rounded">
            <p className="text-sm">
              <span className="font-bold">Estimated delivery:</span> 5-7 business days. We'll send you another email with tracking info once your order ships.
            </p>
          </div>
        </div>

        {/* Back to Shop Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToShop}
            className="w-full bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase px-6 py-3 rounded-md transition-colors font-bold"
          >
            Back to Shop
          </button>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-text-secondary">
            Questions? Reply to this email and we'll get back to you.
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
