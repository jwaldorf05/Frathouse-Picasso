import { NextRequest, NextResponse } from "next/server";
import { inventoryProducts } from "@/lib/shopData";

function toCollectionHandle(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

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
    const safeProductsFirst =
      Number.isFinite(productsFirst) && productsFirst > 0 ? productsFirst : 20;

    const allProducts =
      handle === "all"
        ? inventoryProducts
        : inventoryProducts.filter(
            (product) => toCollectionHandle(product.category) === handle
          );

    const edges = allProducts.slice(0, safeProductsFirst).map((product, index) => ({
      node: product,
      cursor: String(index + 1),
    }));

    const collection =
      allProducts.length > 0
        ? {
            id: `local-collection-${handle}`,
            handle,
            title: handle === "all" ? "All" : allProducts[0].category,
            description:
              handle === "all"
                ? "All available Frathouse Picasso pieces."
                : `${allProducts[0].category} collection`,
            image: null,
            products: {
              edges,
              pageInfo: {
                hasNextPage: safeProductsFirst < allProducts.length,
                endCursor: String(edges.length),
              },
            },
          }
        : null;

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
