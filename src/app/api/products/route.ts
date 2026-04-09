import { NextRequest, NextResponse } from "next/server";
import { inventoryProducts } from "@/lib/shopData";
import { rateLimit, getClientIdentifier, formatTimeRemaining, RATE_LIMITS } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  // Rate limiting - 200 requests per minute
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await rateLimit(clientId, RATE_LIMITS.PRODUCTS);

  if (!rateLimitResult.success) {
    const timeRemaining = formatTimeRemaining(rateLimitResult.resetTime);
    return NextResponse.json(
      { 
        error: `Too many requests. Please try again in ${timeRemaining}.`,
        retryAfter: rateLimitResult.resetTime,
      },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim().toLowerCase() ?? "";
    const first = parseInt(searchParams.get("first") ?? "20", 10);
    const after = parseInt(searchParams.get("after") ?? "0", 10);

    const safeFirst = Number.isFinite(first) && first > 0 ? first : 20;
    const safeAfter = Number.isFinite(after) && after >= 0 ? after : 0;
    const filteredProducts = query
      ? inventoryProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.handle.toLowerCase().includes(query)
        )
      : inventoryProducts;
    const sliceEnd = safeAfter + safeFirst;
    const paginatedProducts = filteredProducts.slice(safeAfter, sliceEnd);

    return NextResponse.json({
      edges: paginatedProducts.map((product, index) => ({
        node: product,
        cursor: String(safeAfter + index + 1),
      })),
      pageInfo: {
        hasNextPage: sliceEnd < filteredProducts.length,
        endCursor:
          paginatedProducts.length > 0
            ? String(safeAfter + paginatedProducts.length)
            : null,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
