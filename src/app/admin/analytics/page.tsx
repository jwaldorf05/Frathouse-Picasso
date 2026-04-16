import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { LogoutButton } from "../orders/LogoutButton";
import { AdminNav } from "../AdminNav";
import { AnalyticsClient } from "./AnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = getSupabase();

  // Check if user is authenticated and fetch all orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    redirect("/admin/login");
  }

  // Fetch all order items
  const { data: items } = await supabase
    .from("order_items")
    .select("*");

  const lastUpdated = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/New_York",
  });

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
        {/* Title */}
        <div className="mb-6">
          <h2 style={{ color: "var(--foreground)" }} className="text-2xl font-semibold">
            Analytics
          </h2>
          <p style={{ color: "var(--text-muted)" }} className="text-sm mt-1">
            Site performance and customer insights
          </p>
        </div>

        {/* Analytics Data */}
        <AnalyticsClient orders={orders || []} items={items || []} />
      </main>
    </div>
  );
}
