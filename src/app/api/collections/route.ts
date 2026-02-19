import { NextRequest, NextResponse } from "next/server";
import { inventoryProducts } from "@/lib/shopData";

function toCollectionHandle(label: string): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get("first") ?? "20", 10);
    const safeFirst = Number.isFinite(first) && first > 0 ? first : 20;
    const categories = Array.from(new Set(inventoryProducts.map((product) => product.category)));
    const collectionNames = ["All", ...categories];
    const collections = collectionNames.slice(0, safeFirst).map((name, index) => ({
      id: `local-collection-${index + 1}`,
      handle: toCollectionHandle(name),
      title: name,
      description:
        name === "All"
          ? "All available Frathouse Picasso pieces."
          : `${name} collection`,
      image: null,
      products: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
      },
    }));

    return NextResponse.json({
      edges: collections.map((collection, index) => ({
        node: collection,
        cursor: String(index + 1),
      })),
      pageInfo: {
        hasNextPage: safeFirst < collectionNames.length,
        endCursor: String(collections.length),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch collections";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
