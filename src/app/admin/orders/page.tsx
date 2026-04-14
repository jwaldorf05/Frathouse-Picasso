import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getSupabase, type Order } from "@/lib/supabase";
import { LogoutButton } from "./LogoutButton";
import { StatusFilter } from "./StatusFilter";
import { OrdersTableClient } from "./OrdersTableClient";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "New",
  processing: "Processing",
  sent_to_supplier: "Sent to Supplier",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const VALID_STATUSES = Object.keys(STATUS_LABELS);

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const activeStatus = status && VALID_STATUSES.includes(status) ? status : null;

  // Capture the current time for "Last Updated" display (EST timezone)
  const lastUpdated = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/New_York",
  });

  // Note: Removed slow reconcileRecentStripeSessions() call that was causing 1+ second lag.
  // Orders are now synced via webhooks. If needed, reconciliation can be triggered manually
  // via /api/orders/sync endpoint.

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
          <Link
            href="/?shop=1"
            style={{ color: "var(--foreground)" }}
            className="text-xl font-semibold hover:opacity-80 transition-opacity"
          >
            Frathouse Picasso
          </Link>
          <div className="flex items-center gap-6">
            <AdminNav />
            <div className="flex items-center gap-4">
              <span style={{ color: "var(--text-muted)" }} className="text-xs">
                Last updated: <span style={{ color: "var(--text-secondary)" }}>{lastUpdated}</span>
              </span>
              <LogoutButton />
            </div>
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
          <OrdersTableClient orders={orders} />
        )}
      </main>
    </div>
  );
}
