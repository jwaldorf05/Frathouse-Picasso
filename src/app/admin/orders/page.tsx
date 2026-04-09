import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSupabase, type Order } from "@/lib/supabase";
import { reconcileRecentStripeSessions } from "@/lib/orderSync";
import { LogoutButton } from "./LogoutButton";
import { StatusFilter } from "./StatusFilter";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "New",
  processing: "Processing",
  sent_to_supplier: "Sent to Supplier",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<Order["status"], string> = {
  new: "#ff4d4d",
  processing: "#f59e0b",
  sent_to_supplier: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#6b7280",
};

const VALID_STATUSES = Object.keys(STATUS_LABELS);

function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span
      style={{
        background: STATUS_COLORS[status] + "22",
        color: STATUS_COLORS[status],
        border: `1px solid ${STATUS_COLORS[status]}44`,
      }}
      className="inline-block px-2 py-0.5 rounded text-xs font-semibold"
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const activeStatus = status && VALID_STATUSES.includes(status) ? status : null;

  // Capture the current time for "Last Updated" display
  const lastUpdated = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  // Reconcile recent Stripe sessions on admin load to backfill missed webhook deliveries.
  try {
    await reconcileRecentStripeSessions(40);
  } catch (error) {
    console.error("Order reconciliation failed on admin load:", error);
  }

  const supabase = getSupabase();

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeStatus) {
    query = query.eq("status", activeStatus);
  }

  const { data: orders, error } = await query;

  if (error) {
    redirect("/admin/login");
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{ background: "var(--surface)", borderBottom: "1px solid #1e1e1e" }}
        className="sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1
              style={{ fontFamily: "var(--font-marker), cursive", color: "var(--foreground)" }}
              className="text-xl"
            >
              Frathouse Picasso
            </h1>
            <span style={{ color: "var(--text-muted)" }} className="text-sm">
              / Orders
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ color: "var(--text-muted)" }} className="text-xs">
              Last updated: <span style={{ color: "var(--text-secondary)" }}>{lastUpdated}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title + filter row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 style={{ color: "var(--foreground)" }} className="text-2xl font-semibold">
              Orders
            </h2>
            <p style={{ color: "var(--text-muted)" }} className="text-sm mt-1">
              {orders?.length ?? 0} {activeStatus ? `${STATUS_LABELS[activeStatus as Order["status"]].toLowerCase()} ` : ""}order{orders?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Suspense>
            <StatusFilter activeStatus={activeStatus} statusLabels={STATUS_LABELS} />
          </Suspense>
        </div>

        {/* Orders table */}
        {!orders || orders.length === 0 ? (
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-12 text-center"
          >
            <p style={{ color: "var(--text-muted)" }}>No orders found.</p>
          </div>
        ) : (
          <div
            style={{ border: "1px solid #1e1e1e" }}
            className="rounded-lg overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#0d0d0d", borderBottom: "1px solid #1e1e1e" }}>
                  {["Order", "Customer", "Status", "Total", "Date", ""].map((col) => (
                    <th
                      key={col}
                      style={{ color: "var(--text-muted)" }}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    style={{
                      background: idx % 2 === 0 ? "var(--surface)" : "#0f0f0f",
                      borderBottom: "1px solid #1a1a1a",
                    }}
                    className="hover:bg-[#1e1e1e] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span style={{ color: "#ff4d4d" }} className="font-semibold">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div style={{ color: "var(--foreground)" }}>
                        {order.customer_name || "—"}
                      </div>
                      <div style={{ color: "var(--text-muted)" }} className="text-xs">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4" style={{ color: "var(--text-primary)" }}>
                      {formatCents(order.amount_total)}
                    </td>
                    <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{ color: "#ff4d4d" }}
                        className="text-xs font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
