import { NextRequest, NextResponse } from "next/server";
import { createCart, getCart, addToCart } from "@/lib/shopify";
import type { CartLineInput } from "@/lib/shopify";

// GET /api/cart?cartId=...
export async function GET(request: NextRequest) {
  try {
    const cartId = new URL(request.url).searchParams.get("cartId");

    if (!cartId) {
      return NextResponse.json(
        { error: "Missing cartId query parameter" },
        { status: 400 }
      );
    }

    const cart = await getCart(cartId);

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch cart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/cart — create a new cart or add lines to an existing cart
// Body: { cartId?: string, lines: CartLineInput[] }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lines } = body as {
      cartId?: string;
      lines?: CartLineInput[];
    };

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty lines array" },
        { status: 400 }
      );
    }

    // Validate each line
    for (const line of lines) {
      if (!line.merchandiseId || typeof line.quantity !== "number") {
        return NextResponse.json(
          {
            error:
              "Each line must have a merchandiseId (string) and quantity (number)",
          },
          { status: 400 }
        );
      }
    }

    let cart;
    if (cartId) {
      cart = await addToCart(cartId, lines);
    } else {
      cart = await createCart(lines);
    }

    return NextResponse.json(cart, { status: cartId ? 200 : 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create/update cart";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
