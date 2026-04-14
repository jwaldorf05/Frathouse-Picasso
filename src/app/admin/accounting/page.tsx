import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { LogoutButton } from "../orders/LogoutButton";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
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
            Accounting
          </h2>
          <p style={{ color: "var(--text-muted)" }} className="text-sm mt-1">
            Financial overview and transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Revenue */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Total Revenue
              </span>
              <svg className="w-5 h-5" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold mb-1">
              $—
            </div>
            <div style={{ color: "#10b981" }} className="text-xs">
              ↑ — This month
            </div>
          </div>

          {/* Expenses */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Total Expenses
              </span>
              <svg className="w-5 h-5" style={{ color: "#ef4444" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold mb-1">
              $—
            </div>
            <div style={{ color: "#ef4444" }} className="text-xs">
              ↓ — This month
            </div>
          </div>

          {/* Net Profit */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
                Net Profit
              </span>
              <svg className="w-5 h-5" style={{ color: "#3b82f6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold mb-1">
              $—
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs">
              This month
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
          className="rounded-lg overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-[#1e1e1e]">
            <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold">
              Recent Transactions
            </h3>
          </div>
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ color: "var(--text-muted)" }} className="text-sm">
              Transaction history coming soon
            </p>
          </div>
        </div>

        {/* Financial Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Statement */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
              Income Statement
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Gross Revenue
                </span>
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  $—
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Discounts
                </span>
                <span style={{ color: "#ef4444" }} className="font-semibold">
                  -$—
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Net Revenue
                </span>
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  $—
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Cost of Goods
                </span>
                <span style={{ color: "#ef4444" }} className="font-semibold">
                  -$—
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Operating Expenses
                </span>
                <span style={{ color: "#ef4444" }} className="font-semibold">
                  -$—
                </span>
              </div>
              <div className="flex justify-between items-center py-3 mt-2">
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  Net Profit
                </span>
                <span style={{ color: "#10b981" }} className="text-xl font-bold">
                  $—
                </span>
              </div>
            </div>
          </div>

          {/* Cash Flow */}
          <div
            style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
            className="rounded-lg p-6"
          >
            <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
              Cash Flow
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Operating Activities
                </span>
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  $—
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Investing Activities
                </span>
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  $—
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                <span style={{ color: "var(--text-muted)" }} className="text-sm">
                  Financing Activities
                </span>
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  $—
                </span>
              </div>
              <div className="flex justify-between items-center py-3 mt-2">
                <span style={{ color: "var(--foreground)" }} className="font-semibold">
                  Net Cash Flow
                </span>
                <span style={{ color: "#10b981" }} className="text-xl font-bold">
                  $—
                </span>
              </div>
            </div>
            <div
              style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
              className="rounded-lg p-4 mt-4"
            >
              <div style={{ color: "var(--text-muted)" }} className="text-xs mb-1">
                Current Balance
              </div>
              <div style={{ color: "var(--foreground)" }} className="text-2xl font-bold">
                $—
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div
          style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
          className="rounded-lg p-6 mt-6"
        >
          <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
            Export Reports
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              style={{ background: "#1e1e1e", border: "1px solid #333", color: "var(--text-muted)" }}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2a2a2a] transition-colors cursor-not-allowed"
              disabled
            >
              Export to CSV
            </button>
            <button
              style={{ background: "#1e1e1e", border: "1px solid #333", color: "var(--text-muted)" }}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2a2a2a] transition-colors cursor-not-allowed"
              disabled
            >
              Export to Excel
            </button>
            <button
              style={{ background: "#1e1e1e", border: "1px solid #333", color: "var(--text-muted)" }}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2a2a2a] transition-colors cursor-not-allowed"
              disabled
            >
              Generate PDF Report
            </button>
          </div>
          <p style={{ color: "var(--text-muted)" }} className="text-xs mt-3">
            Export functionality coming soon
          </p>
        </div>
      </main>
    </div>
  );
}
