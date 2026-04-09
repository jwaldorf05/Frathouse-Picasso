import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { rateLimit, getClientIdentifier, formatTimeRemaining, RATE_LIMITS } from '@/lib/rateLimit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  // Rate limiting - 20 attempts per 15 minutes
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await rateLimit(clientId, RATE_LIMITS.CHECKOUT);

  if (!rateLimitResult.success) {
    const timeRemaining = formatTimeRemaining(rateLimitResult.resetTime);
    return NextResponse.json(
      { 
        error: `Too many checkout attempts. Please try again in ${timeRemaining}.`,
        retryAfter: rateLimitResult.resetTime,
      },
      { status: 429 }
    );
  }

  try {
    const requestUrl = new URL(request.url);
    const origin = requestUrl.origin;

    const body = await request.json();
    const {
      stripePriceId,
      productHandle,
      selectedColor,
      selectedSize,
      selectedFormat,
      quantity = 1,
    } = body;

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Missing required field: stripePriceId' },
        { status: 400 }
      );
    }

    // Build metadata object with all selected options
    const metadata: Record<string, string> = {};
    
    if (selectedColor) {
      metadata.selectedColor = selectedColor;
    }
    
    if (selectedSize) {
      metadata.selectedSize = selectedSize;
    }
    
    if (selectedFormat) {
      metadata.selectedFormat = selectedFormat;
    }

    // Create Stripe checkout session with native promotion codes
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      customer_creation: 'always',
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      // Enable Stripe's native promotion code input
      allow_promotion_codes: true,
      // Don't require payment method for 100% off codes
      payment_method_collection: 'if_required',
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?collection=All`,
      metadata: metadata,
    });
    
    console.log(`[Checkout] Created session ${session.id} with native promotion codes enabled`);
    console.log(`[Checkout] Session amount: $${((session.amount_total || 0) / 100).toFixed(2)}`);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
