import { NextRequest, NextResponse } from "next/server";
import { getCollectionByHandle } from "@/lib/shopify";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const { searchParams } = new URL(request.url);
    const productsFirst = parseInt(
      searchParams.get("productsFirst") ?? "20",
      10
    );

    const collection = await getCollectionByHandle(handle, productsFirst);

    if (!collection) {
      return NextResponse.json(
        { error: `Collection not found: ${handle}` },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch collection";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
