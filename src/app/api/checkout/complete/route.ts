import { NextRequest, NextResponse } from "next/server";
import { syncCheckoutSessionById } from "@/lib/orderSync";

export const dynamic = "force-dynamic";

function sanitizeReturnTo(returnTo: string | null): string {
  if (!returnTo) return "/?shop=1";
  if (!returnTo.startsWith("/")) return "/?shop=1";
  if (returnTo.startsWith("//")) return "/?shop=1";
  return returnTo;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const returnTo = sanitizeReturnTo(url.searchParams.get("return_to"));

  const redirectUrl = new URL(returnTo, request.url);

  if (sessionId && sessionId.startsWith("cs_")) {
    try {
      const result = await syncCheckoutSessionById(sessionId);
      if (!result.ok) {
        console.error("Checkout completion sync not ready:", result.reason);
      }
    } catch (error) {
      console.error("Checkout completion sync failed:", error);
    }

    redirectUrl.searchParams.set("checkout", "success");
    redirectUrl.searchParams.set("session_id", sessionId);
    return NextResponse.redirect(redirectUrl);
  }

  redirectUrl.searchParams.set("checkout", "cancelled");
  return NextResponse.redirect(redirectUrl);
}
