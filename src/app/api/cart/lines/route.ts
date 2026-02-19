import { NextRequest, NextResponse } from "next/server";
import {
  getCartItemCount,
  readCartFromCookieHeader,
  removeCartLine,
  serializeCartCookie,
  updateCartLineQuantity,
} from "@/lib/cart";

interface UpdateCartLineBody {
  lineId?: string;
  quantity?: number;
}

interface DeleteCartLineBody {
  lineId?: string;
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as UpdateCartLineBody;
    const { lineId, quantity } = body;

    if (!lineId || typeof lineId !== "string") {
      return NextResponse.json({ error: "Missing cart line id." }, { status: 400 });
    }

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Quantity must be a positive integer." }, { status: 400 });
    }

    const currentCart = readCartFromCookieHeader(request.headers.get("cookie"));
    const lineExists = currentCart.items.some((line) => line.id === lineId);

    if (!lineExists) {
      return NextResponse.json({ error: "Cart line not found." }, { status: 404 });
    }

    const updatedCart = updateCartLineQuantity(currentCart, lineId, quantity);
    const response = NextResponse.json(
      {
        items: updatedCart.items,
        totalQuantity: getCartItemCount(updatedCart),
      },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", serializeCartCookie(updatedCart));

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update cart line.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as DeleteCartLineBody;
    const { lineId } = body;

    if (!lineId || typeof lineId !== "string") {
      return NextResponse.json({ error: "Missing cart line id." }, { status: 400 });
    }

    const currentCart = readCartFromCookieHeader(request.headers.get("cookie"));
    const lineExists = currentCart.items.some((line) => line.id === lineId);

    if (!lineExists) {
      return NextResponse.json({ error: "Cart line not found." }, { status: 404 });
    }

    const updatedCart = removeCartLine(currentCart, lineId);
    const response = NextResponse.json(
      {
        items: updatedCart.items,
        totalQuantity: getCartItemCount(updatedCart),
      },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", serializeCartCookie(updatedCart));

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to remove cart line.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
