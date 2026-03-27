import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

function computeSessionToken(password: string): string {
  return createHmac("sha256", password).update("admin-session-v1").digest("hex");
}

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  // Constant-time comparison to prevent timing attacks
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
  const match =
    a.length === b.length &&
    timingSafeEqual(a, b);

  if (!match) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = computeSessionToken(adminPassword);
  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ ok: true });
  response.cookies.set("admin-session", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
