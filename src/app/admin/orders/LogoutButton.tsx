"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{ color: "var(--text-muted)", border: "1px solid #333" }}
      className="px-4 py-1.5 rounded text-sm hover:border-[#555] hover:text-[var(--text-secondary)] transition-colors"
    >
      Sign Out
    </button>
  );
}
