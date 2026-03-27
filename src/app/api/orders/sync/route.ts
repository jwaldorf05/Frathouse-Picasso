import { NextRequest, NextResponse } from "next/server";
import { syncCheckoutSessionById } from "@/lib/orderSync";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: { sessionId?: string };

  try {
    body = (await request.json()) as { sessionId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sessionId = body.sessionId;
  if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid or missing sessionId" }, { status: 400 });
  }

  const result = await syncCheckoutSessionById(sessionId);

  if (!result.ok && result.reason === "Session not finalized yet") {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 409 });
  }

  return NextResponse.json(result);
}
