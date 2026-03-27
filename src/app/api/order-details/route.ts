import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session with expanded line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'line_items.data.price.product'],
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Extract order details
    const orderDetails = {
      sessionId: session.id,
      customerEmail: session.customer_details?.email || '',
      customerName: session.customer_details?.name || '',
      amountTotal: session.amount_total || 0,
      currency: session.currency || 'usd',
      lineItems: session.line_items?.data.map((item) => ({
        description: item.description || 'Unknown item',
        quantity: item.quantity || 1,
        amountTotal: item.amount_total || 0,
      })) || [],
      metadata: session.metadata || {},
    };

    return NextResponse.json(orderDetails);
  } catch (error: any) {
    console.error('Failed to retrieve order details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
}
