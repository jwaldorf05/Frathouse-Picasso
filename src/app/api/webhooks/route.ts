import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabase";
import {
  sendCustomerConfirmation,
  sendOwnerNotification,
} from "@/lib/email";

export const dynamic = 'force-dynamic';

async function resolveCustomerEmail(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const fromDetails = session.customer_details?.email;
  if (fromDetails) return fromDetails;

  const fromSession = session.customer_email;
  if (fromSession) return fromSession;

  if (typeof session.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(session.customer);
      if (!("deleted" in customer) && customer.email) {
        return customer.email;
      }
    } catch (error) {
      console.error("Failed to retrieve Stripe customer for email lookup:", error);
    }
  } else if (
    session.customer &&
    typeof session.customer !== "string" &&
    !("deleted" in session.customer) &&
    session.customer.email
  ) {
    return session.customer.email;
  }

  return null;
}

function resolveCustomerName(session: Stripe.Checkout.Session): string | null {
  const fromDetails = session.customer_details?.name;
  if (fromDetails) return fromDetails;

  if (
    session.customer &&
    typeof session.customer !== "string" &&
    !("deleted" in session.customer) &&
    session.customer.name
  ) {
    return session.customer.name;
  }

  return null;
}

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
        const supabase = getSupabase();
        await handleCheckoutSessionCompleted(session, supabase);
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

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getSupabase>
) {
  console.log("Checkout session completed:", session.id);

  // --- Duplicate guard ---
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) {
    console.log("Order already recorded for session:", session.id);
    return;
  }

  // --- Expand session to get line items + product metadata ---
  const stripe = getStripeInstance();
  const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items.data.price.product", "customer"],
  });

  const customerEmail = await resolveCustomerEmail(stripe, expandedSession);
  const customerName = resolveCustomerName(expandedSession);
  const orderEmail = customerEmail ?? `unknown+${session.id}@no-email.invalid`;

  if (!customerEmail) {
    console.warn(
      "No customer email found in checkout session; saving order with placeholder email:",
      session.id
    );
  }

  const shipping = (expandedSession as any).shipping_details;

  // --- Generate order number (FP-0001 format) ---
  const { data: lastOrder } = await supabase
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1;
  if (lastOrder?.order_number) {
    const parsed = parseInt(lastOrder.order_number.replace("FP-", ""), 10);
    if (!isNaN(parsed)) nextNum = parsed + 1;
  }
  const orderNumber = `FP-${String(nextNum).padStart(4, "0")}`;

  // --- Insert order ---
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      stripe_session_id: session.id,
      order_number: orderNumber,
      status: "new",
      customer_email: orderEmail,
      customer_name: customerName,
      shipping_name: shipping?.name ?? null,
      shipping_address_line1: shipping?.address?.line1 ?? null,
      shipping_address_line2: shipping?.address?.line2 ?? null,
      shipping_city: shipping?.address?.city ?? null,
      shipping_state: shipping?.address?.state ?? null,
      shipping_postal_code: shipping?.address?.postal_code ?? null,
      shipping_country: shipping?.address?.country ?? null,
      amount_total: expandedSession.amount_total ?? 0,
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error("Failed to insert order:", orderError);
    return;
  }

  console.log("✓ Order saved:", orderNumber);

  // --- Insert order items ---
  const lineItems = expandedSession.line_items?.data ?? [];
  if (lineItems.length > 0) {
    const itemRows = lineItems.map((item) => {
      const product = item.price?.product as Stripe.Product | null;
      const meta = product?.metadata ?? {};
      return {
        order_id: newOrder.id,
        sign_id: product?.id ?? null,
        sign_name: product?.name ?? null,
        dimensions: meta.selectedSize ?? null,
        selected_color: meta.selectedColor ?? null,
        selected_format: meta.selectedFormat ?? null,
        design_file_url: meta.design_file ?? null,
        quantity: item.quantity ?? 1,
        unit_price: item.price?.unit_amount ?? 0,
      };
    });

    let { error: itemsError } = await supabase.from("order_items").insert(itemRows);

    // Backward-compatible fallback if selected_color/selected_format columns are not present.
    if (itemsError) {
      const fallbackRows = itemRows.map(({ selected_color, selected_format, ...rest }) => rest);
      const fallback = await supabase.from("order_items").insert(fallbackRows);
      itemsError = fallback.error;
    }

    if (itemsError) {
      console.error("Failed to insert order items:", itemsError);
    } else {
      console.log("✓ Order items saved:", itemRows.length);
    }
  }

  // --- Send emails (never crash the webhook if email fails) ---
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", newOrder.id);

  if (customerEmail) {
    try {
      await sendCustomerConfirmation(newOrder, orderItems ?? []);
      console.log("✓ Customer confirmation sent to:", customerEmail);
    } catch (err) {
      console.error("Failed to send customer confirmation:", err);
    }
  } else {
    console.warn("Skipping customer confirmation email because no customer email is available.");
  }

  try {
    await sendOwnerNotification(newOrder, orderItems ?? []);
    console.log("✓ Owner notification sent");
  } catch (err) {
    console.error("Failed to send owner notification:", err);
  }
}
