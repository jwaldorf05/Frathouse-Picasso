"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const SYNC_STORAGE_PREFIX = "fhp-order-sync-";

async function syncOrder(sessionId: string): Promise<Response> {
  return fetch("/api/orders/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId }),
  });
}

export default function CheckoutSyncClient() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (checkoutStatus !== "success") return;
    if (!sessionId || !sessionId.startsWith("cs_")) return;

    const storageKey = `${SYNC_STORAGE_PREFIX}${sessionId}`;
    const alreadySynced = window.localStorage.getItem(storageKey) === "1";
    if (alreadySynced) return;

    let cancelled = false;

    const runSyncWithRetry = async () => {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        if (cancelled) return;

        try {
          const response = await syncOrder(sessionId);

          if (response.ok) {
            window.localStorage.setItem(storageKey, "1");
            return;
          }

          // Session may not be finalized immediately on redirect back from Stripe.
          if (response.status !== 409) {
            return;
          }
        } catch (error) {
          console.error("Checkout sync attempt failed:", error);
        }

        const waitMs = 600 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
    };

    void runSyncWithRetry();

    return () => {
      cancelled = true;
    };
  }, [checkoutStatus, sessionId]);

  return null;
}
