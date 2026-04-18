"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderItem } from "@/lib/supabase";

const STATUS_OPTIONS: { value: Order["status"]; label: string }[] = [
  { value: "new", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "sent_to_supplier", label: "Sent to Supplier" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "test_order", label: "Test Order" },
];

const STATUS_COLORS: Record<Order["status"], string> = {
  new: "#ff4d4d",
  processing: "#f59e0b",
  sent_to_supplier: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#6b7280",
  test_order: "#a855f7",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function buildAddress(order: Order): string {
  return [
    order.shipping_name,
    order.shipping_address_line1,
    order.shipping_address_line2,
    [order.shipping_city, order.shipping_state, order.shipping_postal_code]
      .filter(Boolean)
      .join(", "),
    order.shipping_country,
  ]
    .filter(Boolean)
    .join("\n");
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
      className="rounded-lg p-6 mb-5"
    >
      <h3
        style={{ color: "var(--text-secondary)" }}
        className="text-xs font-semibold uppercase tracking-wider mb-4"
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div style={{ color: "var(--text-muted)" }} className="text-xs mb-0.5">
        {label}
      </div>
      <div style={{ color: "var(--text-primary)" }} className="text-sm">
        {value ?? "—"}
      </div>
    </div>
  );
}

interface OrderDetailClientProps {
  order: Order;
  items: OrderItem[];
}

export function OrderDetailClient({ order: initialOrder, items }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [status, setStatus] = useState<Order["status"]>(initialOrder.status);
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.tracking_number ?? "");
  const [trackingUrl, setTrackingUrl] = useState(initialOrder.tracking_url ?? "");
  const [supplierOrderId, setSupplierOrderId] = useState(initialOrder.supplier_order_id ?? "");
  const [adminNotes, setAdminNotes] = useState(initialOrder.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const address = buildAddress(order);

  async function handleSave() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          supplier_order_id: supplierOrderId || null,
          admin_notes: adminNotes || null,
        }),
      });
      if (res.ok) {
        const updated = (await res.json()) as Order;
        setOrder(updated);
        setSaveMsg("Saved!");
        router.refresh();
      } else {
        const data = (await res.json()) as { error?: string };
        setSaveMsg(data.error ?? "Failed to save");
      }
    } catch {
      setSaveMsg("Network error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const statusColor = STATUS_COLORS[status];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left column — order info */}
      <div className="lg:col-span-2 space-y-5">
        {/* Order summary */}
        <Section title="Order Summary">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Field label="Order Number" value={<span style={{ color: "#ff4d4d", fontWeight: 700 }}>{order.order_number}</span>} />
            <Field label="Placed On" value={formatDate(order.created_at)} />
            <Field label="Customer" value={order.customer_name} />
            <Field label="Email" value={<a href={`mailto:${order.customer_email}`} style={{ color: "#3b82f6" }} className="hover:underline">{order.customer_email}</a>} />
            <Field label="Total" value={<span style={{ color: "var(--foreground)", fontWeight: 600 }}>{formatCents(order.amount_total)}</span>} />
            <Field label="Stripe Session" value={<span style={{ color: "var(--text-muted)", fontSize: "11px", wordBreak: "break-all" }}>{order.stripe_session_id}</span>} />
          </div>
          
          {/* Discount section */}
          {order.discount_amount && order.discount_amount > 0 && (
            <div style={{ borderTop: "1px solid #222", marginTop: "16px", paddingTop: "16px" }}>
              <div style={{ color: "var(--text-muted)" }} className="text-xs mb-2">
                DISCOUNT APPLIED
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <div style={{ color: "var(--text-muted)" }} className="text-xs mb-0.5">
                    Code
                  </div>
                  <div style={{ color: "#10b981", fontWeight: 600 }} className="text-sm">
                    {order.discount_code || "UNKNOWN"}
                  </div>
                </div>
                <div>
                  <div style={{ color: "var(--text-muted)" }} className="text-xs mb-0.5">
                    Amount Saved
                  </div>
                  <div style={{ color: "#10b981", fontWeight: 600 }} className="text-sm">
                    -{formatCents(order.discount_amount)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* Items */}
        <Section title="Items Ordered">
          {items.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }} className="text-sm">No items recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["Product", "Dimensions", "Color", "Format", "Design File", "Qty", "Unit Price"].map((h) => (
                    <th
                      key={h}
                      style={{ color: "var(--text-muted)", borderBottom: "1px solid #222" }}
                      className="pb-2 text-left text-xs font-semibold uppercase tracking-wider pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ color: "var(--text-primary)" }} className="py-3 pr-4">
                      <div>{item.sign_name ?? "—"}</div>
                      {item.sign_id && <div style={{ color: "var(--text-muted)" }} className="text-xs">{item.sign_id}</div>}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }} className="py-3 pr-4">{item.dimensions ?? "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }} className="py-3 pr-4">{item.selected_color ?? "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }} className="py-3 pr-4">{item.selected_format ?? "—"}</td>
                    <td style={{ color: "var(--text-secondary)" }} className="py-3 pr-4">
                      {item.design_file_url ? (
                        <a href={item.design_file_url} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6" }} className="hover:underline text-xs">View file</a>
                      ) : "—"}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }} className="py-3 pr-4">{item.quantity}</td>
                    <td style={{ color: "var(--text-primary)" }} className="py-3">{formatCents(item.unit_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Shipping address */}
        <Section title="Shipping Address">
          <pre
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              color: "var(--text-primary)",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
            }}
            className="rounded p-4 text-sm mb-3"
          >
            {address || "No shipping address recorded."}
          </pre>
          {address && (
            <button
              onClick={handleCopyAddress}
              style={{
                background: copied ? "#10b98122" : "var(--surface-hover)",
                color: copied ? "#10b981" : "var(--text-secondary)",
                border: `1px solid ${copied ? "#10b98144" : "#333"}`,
              }}
              className="px-4 py-2 rounded text-sm transition-all"
            >
              {copied ? "✓ Copied!" : "Copy Shipping Address"}
            </button>
          )}
        </Section>
      </div>

      {/* Right column — admin controls */}
      <div className="space-y-5">
        {/* Status */}
        <Section title="Order Status">
          <div className="mb-4">
            <div
              style={{ background: statusColor + "22", borderColor: statusColor + "44", color: statusColor }}
              className="border rounded px-3 py-1.5 text-sm font-semibold inline-block mb-3"
            >
              {STATUS_OPTIONS.find((o) => o.value === status)?.label}
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Order["status"])}
              style={{
                background: "#111",
                border: "1px solid #333",
                color: "var(--foreground)",
              }}
              className="w-full px-3 py-2 rounded text-sm outline-none focus:border-[#555]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {status === "shipped" && order.status !== "shipped" && (
              <p style={{ color: "#f59e0b" }} className="text-xs mt-2">
                ⚠ Saving will send a shipping email to the customer.
              </p>
            )}
          </div>
        </Section>

        {/* Fulfillment */}
        <Section title="Fulfillment">
          <div className="space-y-3">
            <div>
              <label style={{ color: "var(--text-muted)" }} className="block text-xs mb-1">
                Supplier Order ID
              </label>
              <input
                type="text"
                value={supplierOrderId}
                onChange={(e) => setSupplierOrderId(e.target.value)}
                placeholder="e.g. SUP-12345"
                style={{ background: "#111", border: "1px solid #333", color: "var(--foreground)" }}
                className="w-full px-3 py-2 rounded text-sm outline-none focus:border-[#555]"
              />
            </div>
            <div>
              <label style={{ color: "var(--text-muted)" }} className="block text-xs mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1Z999AA1..."
                style={{ background: "#111", border: "1px solid #333", color: "var(--foreground)" }}
                className="w-full px-3 py-2 rounded text-sm outline-none focus:border-[#555]"
              />
            </div>
            <div>
              <label style={{ color: "var(--text-muted)" }} className="block text-xs mb-1">
                Tracking URL
              </label>
              <input
                type="url"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://..."
                style={{ background: "#111", border: "1px solid #333", color: "var(--foreground)" }}
                className="w-full px-3 py-2 rounded text-sm outline-none focus:border-[#555]"
              />
            </div>
          </div>
        </Section>

        {/* Admin Notes */}
        <Section title="Admin Notes">
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            placeholder="Internal notes about this order…"
            style={{ background: "#111", border: "1px solid #333", color: "var(--foreground)" }}
            className="w-full px-3 py-2 rounded text-sm outline-none focus:border-[#555] resize-y"
          />
        </Section>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: "#ff4d4d" }}
          className="w-full py-3 rounded font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saveMsg && (
          <p
            style={{ color: saveMsg === "Saved!" ? "#10b981" : "#ff4d4d" }}
            className="text-sm text-center"
          >
            {saveMsg}
          </p>
        )}
      </div>
    </div>
  );
}
