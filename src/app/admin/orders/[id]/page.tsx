import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { OrderDetailClient } from "./OrderDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [orderResult, itemsResult] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).single(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (orderResult.error || !orderResult.data) {
    notFound();
  }

  const order = orderResult.data;
  const items = itemsResult.data ?? [];

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Header */}
      <header
        style={{ background: "var(--surface)", borderBottom: "1px solid #1e1e1e" }}
        className="sticky top-0 z-10"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/admin/orders"
            style={{ color: "var(--text-muted)" }}
            className="text-sm hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Orders
          </Link>
          <span style={{ color: "#333" }}>/</span>
          <h1
            style={{ fontFamily: "var(--font-marker), cursive", color: "#ff4d4d" }}
            className="text-xl"
          >
            {order.order_number}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <OrderDetailClient order={order} items={items} />
      </main>
    </div>
  );
}
