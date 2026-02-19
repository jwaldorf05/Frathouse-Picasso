import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  getInventoryProductByHandle,
  getProductPrice,
  type InventoryProduct,
} from "@/lib/shopData";
import { parsePriceToCents, resolveCheckoutOrigin } from "@/lib/checkout";
import { readCartFromCookieHeader, toStripeLineItems } from "@/lib/cart";

interface CheckoutRequestBody {
  fromCart?: boolean;
  handle?: string;
  quantity?: number;
  selectedSize?: string | null;
}

function validateSizeSelection(product: InventoryProduct, selectedSize?: string | null): string | null {
  if (!product.sizeOptions?.length) {
    return null;
  }

  if (!selectedSize) {
    return "Please select a size before checkout.";
  }

  const matchingSize = product.sizeOptions.find((option) => option.size === selectedSize);

  if (!matchingSize) {
    return "Selected size is not available for this product.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;
    const { fromCart = false, handle, quantity, selectedSize } = body;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing Stripe configuration. Set STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const requestUrl = new URL(request.url);
    const origin = resolveCheckoutOrigin(requestUrl.origin);
    const fallbackUrl = `${origin}/?shop=1`;

    let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
    let successUrl: string;
    let cancelUrl: string;
    let metadata: Record<string, string>;

    if (fromCart) {
      const cart = readCartFromCookieHeader(request.headers.get("cookie"));

      if (cart.items.length === 0) {
        return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
      }

      lineItems = toStripeLineItems(cart);
      successUrl = `${fallbackUrl}&checkout=success`;
      cancelUrl = `${fallbackUrl}&checkout=cancel`;
      metadata = {
        checkoutType: "cart",
        itemCount: String(cart.items.length),
      };
    } else {
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

      const sizeValidationError = validateSizeSelection(product, selectedSize);

      if (sizeValidationError) {
        return NextResponse.json({ error: sizeValidationError }, { status: 400 });
      }

      const activePrice = getProductPrice(product, selectedSize);
      const unitAmount = parsePriceToCents(activePrice);
      const productUrl = `${origin}/items/${product.handle}?shop=1`;

      lineItems = [
        {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: product.name,
              description: product.shortDescription,
              metadata: {
                handle: product.handle,
                ...(selectedSize ? { size: selectedSize } : {}),
              },
            },
          },
        },
      ];
      successUrl = `${productUrl}&checkout=success`;
      cancelUrl = `${productUrl}&checkout=cancel`;
      metadata = {
        checkoutType: "single-item",
        handle: product.handle,
        quantity: String(quantity),
        ...(selectedSize ? { size: selectedSize } : {}),
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe checkout URL was not created." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
