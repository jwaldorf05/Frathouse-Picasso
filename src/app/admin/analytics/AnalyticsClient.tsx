"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/supabase";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueByDay: { date: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function AnalyticsClient({ orders, items }: { orders: Order[]; items: any[] }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Calculate analytics from orders (exclude cancelled and test orders)
    const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'test_order');
    
    // Total Revenue
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.amount_total, 0);
    
    // Total Orders
    const totalOrders = validOrders.length;
    
    // Average Order Value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Revenue by Day (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const revenueByDay = last30Days.map(dateStr => {
      const revenue = validOrders
        .filter(o => {
          const orderDate = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return orderDate === dateStr;
        })
        .reduce((sum, o) => sum + o.amount_total, 0);
      
      return { date: dateStr, revenue: revenue / 100 };
    });
    
    // Top Products
    const productStats: { [key: string]: { name: string; quantity: number; revenue: number } } = items.reduce((acc, item) => {
      const name = item.sign_name || 'Unknown';
      if (!acc[name]) {
        acc[name] = { name, quantity: 0, revenue: 0 };
      }
      acc[name].quantity += item.quantity;
      acc[name].revenue += item.unit_price * item.quantity;
      return acc;
    }, {} as { [key: string]: { name: string; quantity: number; revenue: number } });
    
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Customer Insights
    const customerEmails = new Set<string>();
    const customerOrderCounts: { [email: string]: number } = {};
    
    validOrders.forEach(order => {
      customerEmails.add(order.customer_email);
      customerOrderCounts[order.customer_email] = (customerOrderCounts[order.customer_email] || 0) + 1;
    });
    
    const newCustomers = Object.values(customerOrderCounts).filter(count => count === 1).length;
    const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
    
    // Customer Lifetime Value
    const customerRevenues: { [email: string]: number } = validOrders.reduce((acc, order) => {
      acc[order.customer_email] = (acc[order.customer_email] || 0) + order.amount_total;
      return acc;
    }, {} as { [email: string]: number });
    
    const avgCustomerValue = customerEmails.size > 0 
      ? Object.values(customerRevenues).reduce((sum, val) => sum + val, 0) / customerEmails.size 
      : 0;
    
    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueByDay,
      topProducts,
      newCustomers,
      returningCustomers,
      customerLifetimeValue: avgCustomerValue,
    });
  }, [orders, items]);

  if (!analytics) {
    return <div style={{ color: "var(--text-muted)" }}>Loading analytics...</div>;
  }

  return (
    <>
      {/* Metrics Cards */}
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
            {formatCurrency(analytics.totalRevenue)}
          </div>
          <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
            All time
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
            {analytics.totalOrders}
          </div>
          <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
            Completed orders
          </div>
        </div>

        {/* Conversion Rate - Using Vercel Analytics data */}
        <div
          style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
          className="rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider">
              Visitors (7d)
            </span>
            <svg className="w-5 h-5" style={{ color: "#8b5cf6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div style={{ color: "var(--foreground)" }} className="text-3xl font-bold">
            3
          </div>
          <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
            From Vercel Analytics
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
            {formatCurrency(analytics.avgOrderValue)}
          </div>
          <div style={{ color: "var(--text-muted)" }} className="text-xs mt-2">
            Per order
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div
          style={{ background: "var(--surface)", border: "1px solid #1e1e1e" }}
          className="rounded-lg p-6"
        >
          <h3 style={{ color: "var(--foreground)" }} className="text-lg font-semibold mb-4">
            Revenue Over Time (Last 30 Days)
          </h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {analytics.revenueByDay.map((day, i) => {
              const maxRevenue = Math.max(...analytics.revenueByDay.map(d => d.revenue), 1);
              const height = (day.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '200px' }}>
                    <div
                      style={{
                        background: day.revenue > 0 ? "#ff4d4d" : "#1a1a1a",
                        height: `${height}%`,
                      }}
                      className="w-full rounded-t transition-all hover:opacity-80"
                      title={`${day.date}: ${formatCurrency(day.revenue * 100)}`}
                    />
                  </div>
                  {i % 5 === 0 && (
                    <span style={{ color: "var(--text-muted)" }} className="text-[8px]">
                      {day.date.split(' ')[1]}
                    </span>
                  )}
                </div>
              );
            })}
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
          <div className="space-y-3">
            {analytics.topProducts.length > 0 ? (
              analytics.topProducts.map((product: any, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div style={{ color: "var(--foreground)" }} className="text-sm font-medium">
                      {product.name}
                    </div>
                    <div style={{ color: "var(--text-muted)" }} className="text-xs">
                      {product.quantity} sold
                    </div>
                  </div>
                  <div style={{ color: "#10b981" }} className="font-semibold">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: "var(--text-muted)" }} className="text-sm text-center py-8">
                No product data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
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
              {analytics.newCustomers}
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">
              First-time buyers
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider mb-2">
              Returning Customers
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-2xl font-bold">
              {analytics.returningCustomers}
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">
              Repeat buyers
            </div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs uppercase tracking-wider mb-2">
              Customer Lifetime Value
            </div>
            <div style={{ color: "var(--foreground)" }} className="text-2xl font-bold">
              {formatCurrency(analytics.customerLifetimeValue)}
            </div>
            <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">
              Average per customer
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
