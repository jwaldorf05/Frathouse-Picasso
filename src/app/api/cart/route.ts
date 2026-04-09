import { NextRequest, NextResponse } from "next/server";
import { getInventoryProductByHandle, getProductPrice } from "@/lib/shopData";
import {
  addItemToCart,
  getCartItemCount,
  readCartFromCookieHeader,
  serializeCartCookie,
} from "@/lib/cart";
import { rateLimit, getClientIdentifier, formatTimeRemaining, RATE_LIMITS } from "@/lib/rateLimit";

export const dynamic = 'force-dynamic';

interface AddCartItemBody {
  handle?: string;
  quantity?: number;
  selectedSize?: string | null;
}

function jsonCartResponse(cartHeader: string | null) {
  const cart = readCartFromCookieHeader(cartHeader);

  return {
    items: cart.items,
    totalQuantity: getCartItemCount(cart),
  };
}

export async function GET(request: NextRequest) {
  return NextResponse.json(jsonCartResponse(request.headers.get("cookie")));
}

export async function POST(request: NextRequest) {
  // Rate limiting - 100 requests per minute
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await rateLimit(clientId, RATE_LIMITS.CART);

  if (!rateLimitResult.success) {
    const timeRemaining = formatTimeRemaining(rateLimitResult.resetTime);
    return NextResponse.json(
      { 
        error: `Too many cart operations. Please try again in ${timeRemaining}.`,
        retryAfter: rateLimitResult.resetTime,
      },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as AddCartItemBody;
    const { handle, quantity, selectedSize } = body;

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "Missing product handle." }, { status: 400 });
    }

    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Quantity must be a positive integer." }, { status: 400 });
    }

    const product = getInventoryProductByHandle(handle);

    if (!product) {
      return NextResponse.json({ error: `Product not found: ${handle}` }, { status: 404 });
    }

    if (product.sizeOptions?.length) {
      if (!selectedSize) {
        return NextResponse.json(
          { error: "Please select a size before adding to cart." },
          { status: 400 }
        );
      }

      const sizeExists = product.sizeOptions.some((option) => option.size === selectedSize);

      if (!sizeExists) {
        return NextResponse.json(
          { error: "Selected size is not available for this product." },
          { status: 400 }
        );
      }
    }

    const currentCart = readCartFromCookieHeader(request.headers.get("cookie"));
    const unitPrice = getProductPrice(product, selectedSize);
    const updatedCart = addItemToCart(currentCart, {
      handle: product.handle,
      name: product.name,
      selectedSize: selectedSize ?? null,
      quantity,
      unitPrice,
      image: product.image,
    });

    const response = NextResponse.json(
      {
        items: updatedCart.items,
        totalQuantity: getCartItemCount(updatedCart),
      },
      { status: 201 }
    );
    response.headers.set("Set-Cookie", serializeCartCookie(updatedCart));

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update cart.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear the cart by setting an empty cart cookie
    const emptyCart = { items: [] };
    const response = NextResponse.json(
      {
        items: [],
        totalQuantity: 0,
        message: 'Cart cleared successfully',
      },
      { status: 200 }
    );
    response.headers.set("Set-Cookie", serializeCartCookie(emptyCart));

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to clear cart.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
