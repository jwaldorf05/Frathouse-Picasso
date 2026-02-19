import { NextRequest, NextResponse } from "next/server";
import { inventoryProducts } from "@/lib/shopData";

export async function GET(request: NextRequest) {
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
