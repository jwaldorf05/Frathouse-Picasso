import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance } from '@/lib/stripe';
import { getSupabase } from '@/lib/supabase';

/**
 * Test endpoint to diagnose discount sync issues
 * 
 * Usage:
 * POST /api/test-discount-sync
 * Body: { "sessionId": "cs_test_..." }
 * 
 * This will:
 * 1. Retrieve the Stripe session with expanded discount details
 * 2. Extract discount information
 * 3. Check if the order exists in the database
 * 4. Show what discount data would be saved
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const stripe = getStripeInstance();
    const supabase = getSupabase();

    console.log(`[Test] Retrieving session: ${sessionId}`);

    // Retrieve session with expanded details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        'line_items.data.price.product',
        'customer',
        'total_details.breakdown'
      ],
    });

    // Extract discount information (same logic as orderSync)
    const totalDetails = (session as any).total_details;
    const discountAmount = totalDetails?.amount_discount ?? 0;
    let discountCode: string | null = null;

    if (totalDetails?.breakdown?.discounts && Array.isArray(totalDetails.breakdown.discounts)) {
      const firstDiscount = totalDetails.breakdown.discounts[0];
      if (firstDiscount?.discount?.promotion_code) {
        const promoCodeRef = firstDiscount.discount.promotion_code;
        if (typeof promoCodeRef === 'object' && promoCodeRef !== null && 'code' in promoCodeRef) {
          discountCode = (promoCodeRef as any).code;
        }
      } else if (firstDiscount?.discount?.coupon) {
        const couponRef = firstDiscount.discount.coupon;
        if (typeof couponRef === 'object' && couponRef !== null) {
          discountCode = (couponRef as any).name || (couponRef as any).id;
        }
      }
    }

    // Check if order exists in database
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number, amount_total, discount_amount, discount_code')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    // Build diagnostic response
    const diagnostics = {
      sessionId: session.id,
      sessionStatus: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      amountSubtotal: (session as any).amount_subtotal,
      currency: session.currency,
      
      // Discount extraction results
      discountDetection: {
        hasDiscount: discountAmount > 0,
        discountAmount: discountAmount,
        discountAmountFormatted: `$${(discountAmount / 100).toFixed(2)}`,
        discountCode: discountCode,
        rawTotalDetails: totalDetails,
      },

      // Database status
      database: {
        orderExists: !!existingOrder,
        orderNumber: existingOrder?.order_number,
        savedDiscountAmount: existingOrder?.discount_amount,
        savedDiscountCode: existingOrder?.discount_code,
        discountSyncedCorrectly: existingOrder 
          ? (existingOrder.discount_amount === discountAmount && existingOrder.discount_code === discountCode)
          : null,
      },

      // What would be saved
      wouldSave: {
        discount_amount: discountAmount > 0 ? discountAmount : null,
        discount_code: discountCode,
      },

      // Validation checks
      checks: {
        sessionCompleted: session.status === 'complete',
        hasLineItems: (session.line_items?.data?.length ?? 0) > 0,
        hasTotalDetails: !!totalDetails,
        hasDiscountBreakdown: !!(totalDetails?.breakdown?.discounts),
        discountAmountMatches: discountAmount === (totalDetails?.amount_discount ?? 0),
      },
    };

    console.log('[Test] Diagnostics:', JSON.stringify(diagnostics, null, 2));

    return NextResponse.json({
      success: true,
      diagnostics,
      message: discountAmount > 0 
        ? `✅ Discount detected: ${discountCode} - $${(discountAmount / 100).toFixed(2)}`
        : '⚠️ No discount found on this session',
    });

  } catch (error: any) {
    console.error('[Test] Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Test failed',
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
