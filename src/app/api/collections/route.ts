import { NextRequest, NextResponse } from "next/server";
import { getCollections } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get("first") ?? "20", 10);

    const collections = await getCollections(first);
    return NextResponse.json(collections);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch collections";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
