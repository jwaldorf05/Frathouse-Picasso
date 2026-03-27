import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stripePriceId, selectedColor, selectedSize, selectedFormat, quantity = 1 } = body;

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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/items/{CHECKOUT_SESSION_ID}?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/items/{CHECKOUT_SESSION_ID}?checkout=cancelled`,
      metadata: metadata,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout session creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
