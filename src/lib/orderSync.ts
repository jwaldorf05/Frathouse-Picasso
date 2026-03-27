import type Stripe from "stripe";
import { getStripeInstance } from "@/lib/stripe";
import { getSupabase, type Order, type OrderItem } from "@/lib/supabase";
import { sendCustomerConfirmation, sendOwnerNotification } from "@/lib/email";

interface SyncResult {
  ok: boolean;
  created: boolean;
  alreadyExists: boolean;
  orderNumber?: string;
  reason?: string;
}

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { code?: string; message?: string };
  const message = err.message ?? "";
  return err.code === "PGRST204" || message.includes("Could not find") || message.includes("column");
}

function isSessionFinalized(session: Stripe.Checkout.Session): boolean {
  return (
    session.status === "complete" ||
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required"
  );
}

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

async function nextOrderNumber(startOffset = 0): Promise<string> {
  const supabase = getSupabase();
  const { data: lastOrder } = await supabase
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1 + startOffset;
  if (lastOrder?.order_number) {
    const parsed = parseInt(lastOrder.order_number.replace("FP-", ""), 10);
    if (!isNaN(parsed)) nextNum = parsed + 1 + startOffset;
  }

  return `FP-${String(nextNum).padStart(4, "0")}`;
}

function getLineItemProduct(item: Stripe.LineItem): Stripe.Product | null {
  const productRef = item.price?.product;
  if (!productRef || typeof productRef === "string") {
    return null;
  }
  if ("deleted" in productRef) {
    return null;
  }
  return productRef;
}

async function createOrderFromSession(
  session: Stripe.Checkout.Session
): Promise<{ order: Order; items: OrderItem[] }> {
  const supabase = getSupabase();

  const customerEmail = getCustomerEmail(session);
  const customerName = getCustomerName(session);
  const orderEmail = customerEmail ?? `unknown+${session.id}@no-email.invalid`;
  const sessionMeta = session.metadata ?? {};
  const shipping = (session as any).shipping_details;

  let createdOrder: Order | null = null;
  let insertError: any = null;

  // Retry on rare order_number collisions caused by concurrent inserts.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const orderNumber = await nextOrderNumber(attempt);

    const fullInsertPayload = {
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
    };

    const compactInsertPayload = {
      stripe_session_id: session.id,
      order_number: orderNumber,
      status: "new",
      customer_email: orderEmail,
      customer_name: customerName,
      amount_total: session.amount_total ?? 0,
    };

    let result = await supabase
      .from("orders")
      .insert(fullInsertPayload)
      .select()
      .single();

    // Backward-compatible fallback for deployments where shipping columns
    // have not yet been added to the orders table schema.
    if (result.error && isMissingColumnError(result.error)) {
      result = await supabase
        .from("orders")
        .insert(compactInsertPayload)
        .select()
        .single();
    }

    if (result.data) {
      createdOrder = result.data as Order;
      insertError = null;
      break;
    }

    insertError = result.error;

    // Unique violation on stripe_session_id means another process already inserted this order.
    if (insertError?.code === "23505") {
      const { data: existing } = await supabase
        .from("orders")
        .select("*")
        .eq("stripe_session_id", session.id)
        .maybeSingle();

      if (existing) {
        createdOrder = existing as Order;
        insertError = null;
        break;
      }
    }
  }

  if (!createdOrder) {
    throw new Error(`Failed to insert order: ${insertError?.message ?? "unknown error"}`);
  }

  const lineItems = session.line_items?.data ?? [];
  const itemRows = lineItems.map((item) => {
    const product = getLineItemProduct(item);
    const productMeta = product?.metadata ?? {};

    return {
      order_id: createdOrder!.id,
      sign_id: product?.id ?? (typeof item.price?.product === "string" ? item.price.product : null),
      sign_name: product?.name ?? item.description ?? null,
      dimensions: productMeta.selectedSize ?? sessionMeta.selectedSize ?? sessionMeta.size ?? null,
      selected_color: productMeta.selectedColor ?? sessionMeta.selectedColor ?? null,
      selected_format: productMeta.selectedFormat ?? sessionMeta.selectedFormat ?? null,
      design_file_url: productMeta.design_file ?? null,
      quantity: item.quantity ?? 1,
      unit_price: item.price?.unit_amount ?? 0,
    };
  });

  if (itemRows.length > 0) {
    let { error: itemsError } = await supabase.from("order_items").insert(itemRows);

    if (itemsError) {
      const fallbackRows = itemRows.map(({ selected_color, selected_format, ...rest }) => rest);
      const fallback = await supabase.from("order_items").insert(fallbackRows);
      itemsError = fallback.error;
    }

    if (itemsError) {
      throw new Error(`Failed to insert order items: ${itemsError.message}`);
    }
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", createdOrder.id);

  return {
    order: createdOrder,
    items: (items ?? []) as OrderItem[],
  };
}

export async function syncCheckoutSessionById(sessionId: string): Promise<SyncResult> {
  const supabase = getSupabase();
  const stripe = getStripeInstance();

  const { data: existing } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return {
      ok: true,
      created: false,
      alreadyExists: true,
      orderNumber: existing.order_number,
    };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "customer"],
  });

  if (!isSessionFinalized(session)) {
    return {
      ok: false,
      created: false,
      alreadyExists: false,
      reason: "Session not finalized yet",
    };
  }

  const { order, items } = await createOrderFromSession(session);

  const customerEmail = getCustomerEmail(session);
  if (customerEmail) {
    try {
      await sendCustomerConfirmation(order, items);
    } catch (error) {
      console.error("Customer confirmation email failed:", error);
    }
  }

  try {
    await sendOwnerNotification(order, items);
  } catch (error) {
    console.error("Owner notification email failed:", error);
  }

  return {
    ok: true,
    created: true,
    alreadyExists: false,
    orderNumber: order.order_number,
  };
}

export async function reconcileRecentStripeSessions(limit = 50): Promise<{ checked: number; created: number }> {
  const stripe = getStripeInstance();
  const list = await stripe.checkout.sessions.list({ limit });

  let created = 0;
  let checked = 0;

  for (const session of list.data) {
    if (!isSessionFinalized(session)) {
      continue;
    }

    checked += 1;

    try {
      const result = await syncCheckoutSessionById(session.id);
      if (result.created) {
        created += 1;
      }
    } catch (error) {
      console.error("Reconciliation failed for session", session.id, error);
    }
  }

  return { checked, created };
}
