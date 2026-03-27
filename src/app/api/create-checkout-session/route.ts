import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { validateDiscountCode } from '@/lib/discountCodes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
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
      discountCode,
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

    // Handle discount code if provided
    let discounts: Array<{ coupon: string }> | undefined;
    let is100PercentOff = false;
    
    if (discountCode) {
      const normalizedCode = discountCode.trim().toUpperCase();
      const discountPercent = validateDiscountCode(normalizedCode);
      
      if (discountPercent !== null) {
        console.log(`[Discount] Code "${normalizedCode}" validated: ${discountPercent}% off`);
        
        // Create or retrieve Stripe coupon for this discount
        const couponId = `${normalizedCode}-${discountPercent}`;
        
        try {
          // Try to retrieve existing coupon first
          const existingCoupon = await stripe.coupons.retrieve(couponId);
          console.log(`[Discount] Using existing Stripe coupon: ${couponId}`);
          
          // Verify the coupon matches our expected discount
          if (existingCoupon.percent_off !== discountPercent) {
            console.warn(`[Discount] WARNING: Coupon ${couponId} has ${existingCoupon.percent_off}% but expected ${discountPercent}%`);
          }
        } catch (error: any) {
          // Coupon doesn't exist, create it
          if (error.code === 'resource_missing') {
            console.log(`[Discount] Creating new Stripe coupon: ${couponId}`);
            try {
              await stripe.coupons.create({
                id: couponId,
                percent_off: discountPercent,
                duration: 'once',
                name: `${normalizedCode} - ${discountPercent}% off`,
              });
              console.log(`[Discount] Successfully created coupon: ${couponId}`);
            } catch (createError: any) {
              // Handle race condition where coupon was created between retrieve and create
              if (createError.code === 'resource_already_exists') {
                console.log(`[Discount] Coupon ${couponId} already exists (race condition handled)`);
              } else {
                console.error(`[Discount] Failed to create coupon ${couponId}:`, createError.message);
                throw createError;
              }
            }
          } else {
            console.error(`[Discount] Failed to retrieve coupon ${couponId}:`, error.message);
            throw error;
          }
        }
        
        discounts = [{ coupon: couponId }];
        metadata.discountCode = normalizedCode;
        metadata.discountPercent = discountPercent.toString();
        
        // Check if this is a 100% discount
        if (discountPercent === 100) {
          is100PercentOff = true;
          console.log(`[Discount] 100% discount detected - will set payment_method_collection to 'if_required'`);
        }
        
        console.log(`[Discount] Successfully applied discount: ${normalizedCode} (${discountPercent}% off)`);
      } else {
        console.warn(`[Discount] Invalid or inactive discount code attempted: "${normalizedCode}"`);
      }
    }

    // Create Stripe checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
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
      success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?collection=All`,
      metadata: metadata,
    };

    // Add discounts if available
    if (discounts) {
      sessionConfig.discounts = discounts;
    }

    // For 100% off codes, don't require payment method
    if (is100PercentOff) {
      sessionConfig.payment_method_collection = 'if_required';
      console.log(`[Discount] Set payment_method_collection to 'if_required' for free order`);
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log(`[Checkout] Created session ${session.id} with ${discounts ? `discount ${metadata.discountCode}` : 'no discount'}`);
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
