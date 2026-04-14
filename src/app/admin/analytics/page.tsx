import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { LogoutButton } from "../orders/LogoutButton";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = getSupabase();

  // Check if user is authenticated
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .limit(1);

  if (error) {
    redirect("/admin/login");
  }

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

        {/* Placeholder Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Revenue */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Total Revenue
              </span>
              <svg className="w-5 h-5" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold">
              $—
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
              Coming soon
            </div>
          </div>

          {/* Total Orders */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Total Orders
              </span>
              <svg className="w-5 h-5" style={{ color: "#3b82f6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold">
              —
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
              Coming soon
            </div>
          </div>

          {/* Conversion Rate */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Conversion Rate
              </span>
              <svg className="w-5 h-5" style={{ color: "#8b5cf6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold">
              —%
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
              Coming soon
            </div>
          </div>

          {/* Avg Order Value */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Avg Order Value
              </span>
              <svg className="w-5 h-5" style={{ color: "#f59e0b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold">
              $—
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
              Coming soon
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
              Revenue Over Time
            </h3>
            <div
              style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
              className="rounded-lg h-64 flex items-center justify-center"
            >
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Chart coming soon
                </p>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
              Top Products
            </h3>
            <div
              style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
              className="rounded-lg h-64 flex items-center justify-center"
            >
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p style={{ color: "var(--text-muted)" }} className="text-sm">
                  Product rankings coming soon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div
          style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
          className="rounded-lg p-6"
        >
          <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
            Customer Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider mb-2">
                New Customers
              </div>
              <div style={{ color: "var(--foreground)" }} className="text-2xl font-bold">
                —
              </div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">
                This month
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider mb-2">
                Returning Customers
              </div>
              <div style={{ color: "var(--foreground)" }} className="text-2xl font-bold">
                —
              </div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">
                This month
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider mb-2">
                Customer Lifetime Value
              </div>
              <div style={{ color: "var(--foreground)" }} className="text-2xl font-bold">
                $—
              </div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">
                Average
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
