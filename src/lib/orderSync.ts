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

interface ResolvedAddress {
  name: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

interface DiscountDetails {
  amount: number;
  code: string | null;
}

type OrderItemInsertRow = {
  order_id: string;
  sign_id: string | null;
  sign_name: string | null;
  dimensions: string | null;
  selected_color: string | null;
  selected_format: string | null;
  design_file_url: string | null;
  quantity: number;
  unit_price: number;
};

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

function resolveAddress(session: Stripe.Checkout.Session): ResolvedAddress {
  const shippingDetails = (session as any).shipping_details;
  const collectedShipping = (session as any).collected_information?.shipping_details;
  const customerDetails = session.customer_details;

  const shippingAddress =
    shippingDetails?.address ?? collectedShipping?.address ?? customerDetails?.address ?? null;

  const shippingName =
    shippingDetails?.name ?? collectedShipping?.name ?? customerDetails?.name ?? null;

  return {
    name: shippingName ?? null,
    line1: shippingAddress?.line1 ?? null,
    line2: shippingAddress?.line2 ?? null,
    city: shippingAddress?.city ?? null,
    state: shippingAddress?.state ?? null,
    postal_code: shippingAddress?.postal_code ?? null,
    country: shippingAddress?.country ?? null,
  };
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

function resolveDiscountDetails(session: Stripe.Checkout.Session): DiscountDetails {
  const totalDetails = (session as any).total_details;
  const discountAmount = totalDetails?.amount_discount ?? 0;
  let discountCode: string | null = null;

  if (!totalDetails) {
    console.warn(`[Order Sync] WARNING: Session ${session.id} has no total_details - discount extraction may fail`);
    console.warn(`[Order Sync] Session may need to be retrieved with expand: ['total_details.breakdown']`);
  }

  if (totalDetails?.breakdown?.discounts && Array.isArray(totalDetails.breakdown.discounts)) {
    const firstDiscount = totalDetails.breakdown.discounts[0];

    console.log(`[Order Sync] Discount breakdown found:`, {
      discountCount: totalDetails.breakdown.discounts.length,
      firstDiscountType: firstDiscount?.discount?.promotion_code ? "promotion_code" :
        firstDiscount?.discount?.coupon ? "coupon" : "unknown",
    });

    if (firstDiscount?.discount?.promotion_code) {
      const promoCodeRef = firstDiscount.discount.promotion_code;
      if (typeof promoCodeRef === "object" && promoCodeRef !== null && "code" in promoCodeRef) {
        discountCode = (promoCodeRef as any).code;
        console.log(`[Order Sync] Extracted promotion code: ${discountCode}`);
      } else {
        console.warn(`[Order Sync] Promotion code reference is not expanded:`, typeof promoCodeRef);
      }
    } else if (firstDiscount?.discount?.coupon) {
      const couponRef = firstDiscount.discount.coupon;
      if (typeof couponRef === "object" && couponRef !== null) {
        discountCode = (couponRef as any).name || (couponRef as any).id;
        console.log(`[Order Sync] Extracted coupon code: ${discountCode}`);
      } else {
        console.warn(`[Order Sync] Coupon reference is not expanded:`, typeof couponRef);
      }
    }
  } else if (discountAmount > 0) {
    console.warn(`[Order Sync] Discount amount exists ($${(discountAmount / 100).toFixed(2)}) but no breakdown found`);
    console.warn(`[Order Sync] This may indicate the session was not retrieved with proper expansion`);
  }

  if (discountAmount > 0) {
    console.log(`[Order Sync] ✅ Discount detected: ${discountCode || "UNKNOWN_CODE"} - $${(discountAmount / 100).toFixed(2)} off`);
    console.log(`[Order Sync] Will save to database: { discount_amount: ${discountAmount}, discount_code: "${discountCode}" }`);
  } else {
    console.log(`[Order Sync] No discount applied to this order`);
  }

  return {
    amount: discountAmount,
    code: discountCode,
  };
}

function buildOrderItemRows(session: Stripe.Checkout.Session, orderId: string): OrderItemInsertRow[] {
  const sessionMeta = session.metadata ?? {};

  return (session.line_items?.data ?? []).map((item: Stripe.LineItem) => {
    const product = getLineItemProduct(item);
    const productMeta = product?.metadata ?? {};

    return {
      order_id: orderId,
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
}

async function insertOrderItems(itemRows: OrderItemInsertRow[]): Promise<void> {
  const supabase = getSupabase();

  if (itemRows.length === 0) {
    return;
  }

  let { error: itemsError } = await supabase.from("order_items").insert(itemRows);

  if (itemsError) {
    const fallbackRows = itemRows.map(({ selected_color: _selectedColor, selected_format: _selectedFormat, ...rest }) => rest);
    const fallback = await supabase.from("order_items").insert(fallbackRows);
    itemsError = fallback.error;
  }

  if (itemsError) {
    throw new Error(`Failed to insert order items: ${itemsError.message}`);
  }
}

async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = getSupabase();
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return (items ?? []) as OrderItem[];
}

async function patchExistingOrderFromSession(
  order: Order,
  session: Stripe.Checkout.Session
): Promise<Order> {
  const supabase = getSupabase();
  const address = resolveAddress(session);
  const customerEmail = getCustomerEmail(session);
  const customerName = getCustomerName(session);
  const discount = resolveDiscountDetails(session);

  const fullUpdatePayload = {
    customer_email: order.customer_email.includes("@no-email.invalid") ? (customerEmail ?? order.customer_email) : order.customer_email,
    customer_name: order.customer_name ?? customerName,
    shipping_name: order.shipping_name ?? address.name,
    shipping_address_line1: order.shipping_address_line1 ?? address.line1,
    shipping_address_line2: order.shipping_address_line2 ?? address.line2,
    shipping_city: order.shipping_city ?? address.city,
    shipping_state: order.shipping_state ?? address.state,
    shipping_postal_code: order.shipping_postal_code ?? address.postal_code,
    shipping_country: order.shipping_country ?? address.country,
    amount_total: order.amount_total || session.amount_total || 0,
    discount_amount: order.discount_amount ?? (discount.amount > 0 ? discount.amount : null),
    discount_code: order.discount_code ?? discount.code,
  };

  const compactUpdatePayload = {
    customer_email: fullUpdatePayload.customer_email,
    customer_name: fullUpdatePayload.customer_name,
    amount_total: fullUpdatePayload.amount_total,
    discount_amount: fullUpdatePayload.discount_amount,
    discount_code: fullUpdatePayload.discount_code,
  };

  const orderRecord = order as unknown as Record<string, unknown>;

  const changedEntries = Object.entries(fullUpdatePayload).filter(([key, value]) => value !== orderRecord[key]);
  if (changedEntries.length === 0) {
    return order;
  }

  const updates = Object.fromEntries(changedEntries);
  let result = await supabase
    .from("orders")
    .update(updates)
    .eq("id", order.id)
    .select("*")
    .single();

  if (result.error && isMissingColumnError(result.error)) {
    const compactUpdates = Object.fromEntries(
      Object.entries(compactUpdatePayload).filter(([key, value]) => value !== orderRecord[key])
    );

    if (Object.keys(compactUpdates).length === 0) {
      return order;
    }

    result = await supabase
      .from("orders")
      .update(compactUpdates)
      .eq("id", order.id)
      .select("*")
      .single();
  }

  if (result.error) {
    throw new Error(`Failed to update existing order: ${result.error.message}`);
  }

  return result.data as Order;
}

async function hydrateExistingOrderFromSession(
  order: Order,
  session: Stripe.Checkout.Session
): Promise<{ order: Order; items: OrderItem[] }> {
  const patchedOrder = await patchExistingOrderFromSession(order, session);
  let items = await fetchOrderItems(patchedOrder.id);

  if (items.length === 0) {
    const itemRows = buildOrderItemRows(session, patchedOrder.id);
    await insertOrderItems(itemRows);
    items = await fetchOrderItems(patchedOrder.id);
  }

  return {
    order: patchedOrder,
    items,
  };
}

async function deliverOrderEmails(
  session: Stripe.Checkout.Session,
  order: Order,
  items: OrderItem[]
): Promise<void> {
  const customerEmail = getCustomerEmail(session) ?? order.customer_email;

  if (customerEmail && customerEmail !== order.customer_email) {
    order.customer_email = customerEmail;
  }

  console.log("[Order Sync] Preparing email delivery", {
    sessionId: session.id,
    orderNumber: order.order_number,
    customerEmail: order.customer_email,
    itemCount: items.length,
  });

  if (customerEmail) {
    try {
      const customerEmailId = await sendCustomerConfirmation(order, items, {
        idempotencyKey: `customer-confirmation-${session.id}`,
      });
      console.log("[Order Sync] Customer confirmation email sent", {
        sessionId: session.id,
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        resendEmailId: customerEmailId ?? null,
      });
    } catch (error) {
      console.error("Customer confirmation email failed:", error);
    }
  } else {
    console.error("Customer confirmation email skipped: no customer email found", {
      sessionId: session.id,
      orderNumber: order.order_number,
    });
  }

  try {
    const ownerEmailId = await sendOwnerNotification(order, items, {
      idempotencyKey: `owner-notification-${session.id}`,
    });
    console.log("[Order Sync] Owner notification email sent", {
      sessionId: session.id,
      orderNumber: order.order_number,
      resendEmailId: ownerEmailId ?? null,
    });
  } catch (error) {
    console.error("Owner notification email failed:", error);
  }
}

async function createOrderFromSession(
  session: Stripe.Checkout.Session
): Promise<{ order: Order; items: OrderItem[] }> {
  const supabase = getSupabase();

  const customerEmail = getCustomerEmail(session);
  const customerName = getCustomerName(session);
  const orderEmail = customerEmail ?? `unknown+${session.id}@no-email.invalid`;
  const address = resolveAddress(session);
  const discount = resolveDiscountDetails(session);

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
      shipping_name: address.name,
      shipping_address_line1: address.line1,
      shipping_address_line2: address.line2,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postal_code,
      shipping_country: address.country,
      amount_total: session.amount_total ?? 0,
      discount_amount: discount.amount > 0 ? discount.amount : null,
      discount_code: discount.code,
    };

    const compactInsertPayload = {
      stripe_session_id: session.id,
      order_number: orderNumber,
      status: "new",
      customer_email: orderEmail,
      customer_name: customerName,
      amount_total: session.amount_total ?? 0,
      discount_amount: discount.amount > 0 ? discount.amount : null,
      discount_code: discount.code,
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

  const itemRows = buildOrderItemRows(session, createdOrder.id);
  await insertOrderItems(itemRows);
  const items = await fetchOrderItems(createdOrder.id);

  return {
    order: createdOrder,
    items,
  };
}

export async function syncCheckoutSessionById(sessionId: string): Promise<SyncResult> {
  const supabase = getSupabase();
  const stripe = getStripeInstance();

  const { data: existing } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "customer", "total_details.breakdown"],
  });

  if (!isSessionFinalized(session)) {
    return {
      ok: false,
      created: false,
      alreadyExists: false,
      reason: "Session not finalized yet",
    };
  }

  if (existing) {
    const hydrated = await hydrateExistingOrderFromSession(existing as Order, session);
    await deliverOrderEmails(session, hydrated.order, hydrated.items);

    return {
      ok: true,
      created: false,
      alreadyExists: true,
      orderNumber: hydrated.order.order_number,
    };
  }

  const { order, items } = await createOrderFromSession(session);
  await deliverOrderEmails(session, order, items);

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
