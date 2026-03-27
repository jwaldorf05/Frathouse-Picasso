"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/orders");
      } else {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ background: "var(--background)" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1
            style={{
              fontFamily: "var(--font-marker), cursive",
              color: "var(--foreground)",
            }}
            className="text-3xl mb-1"
          >
            Frathouse Picasso
          </h1>
          <p style={{ color: "var(--text-muted)" }} className="text-sm">
            Admin Dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ background: "var(--surface)", border: "1px solid #222" }}
          className="rounded-lg p-8"
        >
          <h2
            style={{ color: "var(--foreground)" }}
            className="text-lg font-semibold mb-6"
          >
            Sign In
          </h2>

          <div className="mb-4">
            <label
              htmlFor="password"
              style={{ color: "var(--text-secondary)" }}
              className="block text-sm mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{
                background: "#111",
                border: "1px solid #333",
                color: "var(--foreground)",
              }}
              className="w-full px-4 py-2.5 rounded-md text-sm outline-none focus:border-[#ff4d4d] transition-colors disabled:opacity-50"
            />
          </div>

          {error && (
            <p
              style={{ color: "#ff4d4d" }}
              className="text-sm mb-4"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{ background: "#ff4d4d" }}
            className="w-full py-2.5 rounded-md text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
