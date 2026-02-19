import { NextResponse } from "next/server";
import { getInventoryProductByHandle } from "@/lib/shopData";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;
    const product = getInventoryProductByHandle(handle);

    if (!product) {
      return NextResponse.json(
        { error: `Product not found: ${handle}` },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
