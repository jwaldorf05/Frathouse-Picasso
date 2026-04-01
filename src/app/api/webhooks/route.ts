import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { headers } from "next/headers";
import { syncCheckoutSessionById } from "@/lib/orderSync";

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
        
        // Retrieve full session with expanded details to capture discount info
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: [
            'line_items.data.price.product',
            'customer',
            'total_details.breakdown'
          ],
        });
        
        console.log(`[Webhook] Processing checkout.session.completed: ${session.id}`);
        console.log(`[Webhook] Session total: $${((fullSession.amount_total || 0) / 100).toFixed(2)}`);
        
        if ((fullSession as any).total_details?.amount_discount > 0) {
          console.log(`[Webhook] Discount applied: $${(((fullSession as any).total_details.amount_discount || 0) / 100).toFixed(2)}`);
        }
        
        const result = await syncCheckoutSessionById(fullSession.id);

        if (!result.ok && result.reason === "Session not finalized yet") {
          console.warn(`[Webhook] Session ${fullSession.id} not finalized on first attempt, retrying once...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const retryResult = await syncCheckoutSessionById(fullSession.id);
          console.log(`[Webhook] Retry sync result:`, retryResult);
        } else if (result.alreadyExists) {
          console.log(`[Webhook] Order ${result.orderNumber} already exists - no emails sent (preventing duplicates)`);
        } else if (result.created) {
          console.log(`[Webhook] New order ${result.orderNumber} created - confirmation emails sent`);
        }

        console.log(`[Webhook] Sync result:`, result);
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
