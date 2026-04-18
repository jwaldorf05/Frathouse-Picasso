import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendShippingNotification, sendDeliveryNotification, sendCancellationNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "new",
  "processing",
  "sent_to_supplier",
  "shipped",
  "delivered",
  "cancelled",
  "test_order",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsError) {
    console.error("Failed to fetch order items:", itemsError);
  }

  return NextResponse.json({ order, items: items ?? [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  let body: {
    status?: string;
    tracking_number?: string;
    tracking_url?: string;
    admin_notes?: string;
    supplier_order_id?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  // Fetch current order to detect status transition
  const { data: currentOrder, error: fetchError } = await supabase
    .from("orders")
    .select("status, customer_email, customer_name, tracking_number, tracking_url, order_number")
    .eq("id", id)
    .single();

  if (fetchError || !currentOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) updates.status = body.status;
  if (body.tracking_number !== undefined) updates.tracking_number = body.tracking_number;
  if (body.tracking_url !== undefined) updates.tracking_url = body.tracking_url;
  if (body.admin_notes !== undefined) updates.admin_notes = body.admin_notes;
  if (body.supplier_order_id !== undefined) updates.supplier_order_id = body.supplier_order_id;

  const { data: updatedOrder, error: updateError } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError || !updatedOrder) {
    console.error("Failed to update order:", updateError);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }

  // Send notifications when status transitions
  const statusChanged = body.status && body.status !== currentOrder.status;
  
  // Send shipping notification when status transitions to "shipped"
  if (statusChanged && body.status === "shipped") {
    try {
      await sendShippingNotification(updatedOrder);
      console.log("✓ Shipping notification sent for order:", updatedOrder.order_number);
    } catch (err) {
      console.error("Failed to send shipping notification:", err);
      // Don't fail the response — the order was updated successfully
    }
  }

  // Send delivery notification when status transitions to "delivered"
  if (statusChanged && body.status === "delivered") {
    try {
      await sendDeliveryNotification(updatedOrder);
      console.log("✓ Delivery notification sent for order:", updatedOrder.order_number);
    } catch (err) {
      console.error("Failed to send delivery notification:", err);
      // Don't fail the response — the order was updated successfully
    }
  }

  // Send cancellation notification when status transitions to "cancelled"
  if (statusChanged && body.status === "cancelled") {
    try {
      await sendCancellationNotification(updatedOrder);
      console.log("✓ Cancellation notification sent for order:", updatedOrder.order_number);
    } catch (err) {
      console.error("Failed to send cancellation notification:", err);
      // Don't fail the response — the order was updated successfully
    }
  }

  return NextResponse.json(updatedOrder);
}
