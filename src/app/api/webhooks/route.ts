import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const stripe = getStripeInstance();
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("❌ Webhook Error: Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ CRITICAL: STRIPE_WEBHOOK_SECRET is not configured in production environment!");
    console.error("Please add STRIPE_WEBHOOK_SECRET to your Vercel environment variables");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  console.log("✓ Webhook secret found, verifying signature...");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("PaymentIntent succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("PaymentIntent failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    console.error("Webhook processing error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout session completed:", session.id);

  const stripe = getStripeInstance();
  
  const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items', 'customer', 'shipping_cost'],
  });

  const customerEmail = expandedSession.customer_details?.email;
  const customerName = expandedSession.customer_details?.name;
  const shippingDetails = expandedSession.shipping_cost;
  const metadata = expandedSession.metadata || {};

  console.log("Order details:", {
    sessionId: expandedSession.id,
    customerEmail,
    customerName,
    shippingDetails,
    metadata,
    amountTotal: expandedSession.amount_total,
    currency: expandedSession.currency,
  });

  const customizationData: Record<string, string> = {};
  Object.entries(metadata).forEach(([key, value]) => {
    if (key.startsWith("custom_")) {
      customizationData[key.replace("custom_", "")] = value;
    }
  });

  if (Object.keys(customizationData).length > 0) {
    console.log("Product customization:", customizationData);
  }

  console.log("TODO: Save order to database");
  console.log("TODO: Send confirmation email to:", customerEmail);
  console.log("TODO: Trigger fulfillment workflow");
}
