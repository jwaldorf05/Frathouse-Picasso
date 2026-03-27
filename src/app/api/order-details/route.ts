import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { syncCheckoutSessionById } from '@/lib/orderSync';
import { getSupabase } from '@/lib/supabase';

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

    // Sync the session to create order in database if not already exists
    const syncResult = await syncCheckoutSessionById(sessionId);
    
    if (!syncResult.ok) {
      return NextResponse.json(
        { error: syncResult.reason || 'Order not ready yet' },
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

    // Get order from database to retrieve order number
    const supabase = getSupabase();
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, shipping_name, shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country')
      .eq('stripe_session_id', sessionId)
      .single();

    // Extract order details
    const orderDetails = {
      sessionId: session.id,
      orderNumber: order?.order_number || syncResult.orderNumber || 'FP-0000',
      customerEmail: session.customer_details?.email || '',
      customerName: session.customer_details?.name || '',
      shippingAddress: order ? {
        name: order.shipping_name,
        line1: order.shipping_address_line1,
        line2: order.shipping_address_line2,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country,
      } : null,
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
