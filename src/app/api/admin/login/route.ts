import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

function computeSessionToken(password: string): string {
  return createHmac("sha256", password).update("admin-session-v1").digest("hex");
}

function getAdminPassword(): string | null {
  const candidates = [
    process.env.ADMIN_PASSWORD,
    process.env.ADMIN_LOGIN_PASSWORD,
    process.env.FRATHOUSE_ADMIN_PASSWORD,
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body;
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    console.error(
      "Admin password env var not set. Checked: ADMIN_PASSWORD, ADMIN_LOGIN_PASSWORD, FRATHOUSE_ADMIN_PASSWORD, NEXT_PUBLIC_ADMIN_PASSWORD"
    );
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
