import { NextRequest, NextResponse } from "next/server";
import { getProducts, searchProducts } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const first = parseInt(searchParams.get("first") ?? "20", 10);
    const after = searchParams.get("after") ?? undefined;

    if (query) {
      const products = await searchProducts(query, first);
      return NextResponse.json(products);
    }

    const products = await getProducts(first, after);
    return NextResponse.json(products);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
