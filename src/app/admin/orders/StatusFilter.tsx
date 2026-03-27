"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Order } from "@/lib/supabase";

interface StatusFilterProps {
  activeStatus: string | null;
  statusLabels: Record<Order["status"], string>;
}

export function StatusFilter({ activeStatus, statusLabels }: StatusFilterProps) {
  const searchParams = useSearchParams();

  function buildHref(status: string | null): string {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  const allStatuses = [null, ...Object.keys(statusLabels)] as (string | null)[];

  return (
    <div className="flex flex-wrap gap-2">
      {allStatuses.map((s) => {
        const isActive = s === activeStatus;
        const label = s ? statusLabels[s as Order["status"]] : "All";
        return (
          <Link
            key={s ?? "all"}
            href={buildHref(s)}
            style={{
              background: isActive ? "#ff4d4d22" : "var(--surface)",
              color: isActive ? "#ff4d4d" : "var(--text-secondary)",
              border: `1px solid ${isActive ? "#ff4d4d44" : "#333"}`,
            }}
            className="px-3 py-1 rounded text-xs font-medium hover:border-[#555] transition-colors"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
