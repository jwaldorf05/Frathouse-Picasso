"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Order } from "@/lib/supabase";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "New",
  processing: "Processing",
  sent_to_supplier: "Sent to Supplier",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  test_order: "Test Order",
};

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

interface StatusBadgeProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: Order["status"]) => Promise<void>;
}

function StatusBadge({ order, onStatusChange }: StatusBadgeProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  // Calculate dropdown position when menu opens
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // Approximate height of 6 items
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // If not enough space below but more space above, show above
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [showMenu]);

  async function handleStatusSelect(newStatus: Order["status"]) {
    if (newStatus === order.status) {
      setShowMenu(false);
      return;
    }

    setUpdating(true);
    try {
      await onStatusChange(order.id, newStatus);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setShowMenu(!showMenu)}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
        disabled={updating}
        style={{
          background: STATUS_COLORS[order.status] + "22",
          color: STATUS_COLORS[order.status],
          border: `1px solid ${STATUS_COLORS[order.status]}44`,
          cursor: updating ? "wait" : "pointer",
        }}
        className="inline-block px-2 py-0.5 rounded text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
        title="Click or right-click to change status"
      >
        {updating ? "..." : STATUS_LABELS[order.status]}
      </button>

      {showMenu && !updating && (
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid #333",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            maxHeight: "240px",
            overflowY: "auto",
            ...(dropdownPosition === "top" 
              ? { bottom: "100%", marginBottom: "4px" } 
              : { top: "100%", marginTop: "4px" }
            ),
          }}
          className="absolute left-0 rounded-md py-1 z-50 min-w-[160px]"
        >
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusSelect(option.value)}
              style={{
                background: option.value === order.status ? "#2a2a2a" : "transparent",
                color: STATUS_COLORS[option.value],
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-[#2a2a2a] transition-colors"
            >
              <span
                style={{
                  background: STATUS_COLORS[option.value] + "22",
                  border: `1px solid ${STATUS_COLORS[option.value]}44`,
                }}
                className="inline-block px-2 py-0.5 rounded font-semibold"
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface OrdersTableClientProps {
  orders: Order[];
}

export function OrdersTableClient({ orders: initialOrders }: OrdersTableClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const router = useRouter();

  // Update orders when the prop changes (e.g., when filters are applied)
  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  async function handleStatusChange(orderId: string, newStatus: Order["status"]) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to update status");
    }

    const updated = await res.json();
    
    // Update local state
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    );

    // Refresh the page data
    router.refresh();
  }

  return (
    <div style={{ border: "1px solid #1e1e1e" }} className="rounded-lg overflow-hidden">
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
                <StatusBadge order={order} onStatusChange={handleStatusChange} />
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
  );
}
