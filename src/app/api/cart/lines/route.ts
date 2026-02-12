import { NextRequest, NextResponse } from "next/server";
import { updateCartLines, removeFromCart } from "@/lib/shopify";
import type { CartLineUpdateInput } from "@/lib/shopify";

// PUT /api/cart/lines — update line quantities
// Body: { cartId: string, lines: CartLineUpdateInput[] }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lines } = body as {
      cartId?: string;
      lines?: CartLineUpdateInput[];
    };

    if (!cartId) {
      return NextResponse.json(
        { error: "Missing cartId" },
        { status: 400 }
      );
    }

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty lines array" },
        { status: 400 }
      );
    }

    for (const line of lines) {
      if (!line.id || !line.merchandiseId || typeof line.quantity !== "number") {
        return NextResponse.json(
          {
            error:
              "Each line must have id (string), merchandiseId (string), and quantity (number)",
          },
          { status: 400 }
        );
      }
    }

    const cart = await updateCartLines(cartId, lines);
    return NextResponse.json(cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update cart lines";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/cart/lines — remove lines from cart
// Body: { cartId: string, lineIds: string[] }
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, lineIds } = body as {
      cartId?: string;
      lineIds?: string[];
    };

    if (!cartId) {
      return NextResponse.json(
        { error: "Missing cartId" },
        { status: 400 }
      );
    }

    if (!lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty lineIds array" },
        { status: 400 }
      );
    }

    const cart = await removeFromCart(cartId, lineIds);
    return NextResponse.json(cart);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove cart lines";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
