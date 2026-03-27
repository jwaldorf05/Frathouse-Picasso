import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import { sendCustomerConfirmation, sendOwnerNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

function getCustomerEmail(session: Stripe.Checkout.Session): string | null {
  const detailsEmail = session.customer_details?.email;
  if (detailsEmail) return detailsEmail;

  if (session.customer_email) return session.customer_email;

  if (
    session.customer &&
    typeof session.customer !== "string" &&
    !("deleted" in session.customer) &&
    session.customer.email
  ) {
    return session.customer.email;
  }

  return null;
}

function getCustomerName(session: Stripe.Checkout.Session): string | null {
  const detailsName = session.customer_details?.name;
  if (detailsName) return detailsName;

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
  let body: { sessionId?: string };

  try {
    body = (await request.json()) as { sessionId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid or missing sessionId" }, { status: 400 });
  }

  const stripe = getStripeInstance();
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, alreadyExists: true, orderNumber: existing.order_number });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "customer"],
  });

  // Only sync paid/settled sessions.
  if (session.payment_status !== "paid" && session.status !== "complete") {
    return NextResponse.json(
      { ok: false, reason: "Session not finalized yet" },
      { status: 409 }
    );
  }

  const customerEmail = getCustomerEmail(session);
  const customerName = getCustomerName(session);
  const sessionMeta = session.metadata ?? {};
  const shipping = (session as any).shipping_details;

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

  const orderEmail = customerEmail ?? `unknown+${session.id}@no-email.invalid`;

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
      amount_total: session.amount_total ?? 0,
    })
    .select()
    .single();

  if (orderError || !newOrder) {
    console.error("Failed to insert order from sync:", orderError);
    return NextResponse.json({ error: "Unable to save order" }, { status: 500 });
  }

  const lineItems = session.line_items?.data ?? [];
  if (lineItems.length > 0) {
    const itemRows = lineItems.map((item) => {
      const product = item.price?.product as Stripe.Product | null;
      const meta = product?.metadata ?? {};

      return {
        order_id: newOrder.id,
        sign_id: product?.id ?? null,
        sign_name: product?.name ?? item.description ?? null,
        dimensions: meta.selectedSize ?? sessionMeta.selectedSize ?? sessionMeta.size ?? null,
        selected_color: meta.selectedColor ?? sessionMeta.selectedColor ?? null,
        selected_format: meta.selectedFormat ?? sessionMeta.selectedFormat ?? null,
        design_file_url: meta.design_file ?? null,
        quantity: item.quantity ?? 1,
        unit_price: item.price?.unit_amount ?? 0,
      };
    });

    let { error: itemsError } = await supabase.from("order_items").insert(itemRows);

    if (itemsError) {
      const fallbackRows = itemRows.map(({ selected_color, selected_format, ...rest }) => rest);
      const fallback = await supabase.from("order_items").insert(fallbackRows);
      itemsError = fallback.error;
    }

    if (itemsError) {
      console.error("Failed to insert order items from sync:", itemsError);
    }
  }

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", newOrder.id);

  if (customerEmail) {
    try {
      await sendCustomerConfirmation(newOrder, orderItems ?? []);
    } catch (error) {
      console.error("Failed to send customer confirmation from sync:", error);
    }
  }

  try {
    await sendOwnerNotification(newOrder, orderItems ?? []);
  } catch (error) {
    console.error("Failed to send owner notification from sync:", error);
  }

  return NextResponse.json({ ok: true, created: true, orderNumber });
}
