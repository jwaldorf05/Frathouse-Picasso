import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getInventoryProductByHandle,
  getProductPrice,
  type InventoryProduct,
} from "@/lib/shopData";
import { parsePriceToCents, resolveCheckoutOrigin } from "@/lib/checkout";
import { readCartFromCookieHeader, toStripeLineItems, type ProductCustomization } from "@/lib/cart";
import { getStripeInstance } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

interface CheckoutRequestBody {
  fromCart?: boolean;
  handle?: string;
  quantity?: number;
  selectedSize?: string | null;
  customization?: ProductCustomization;
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
    const { fromCart = false, handle, quantity, selectedSize, customization } = body;

    let stripe;
    try {
      stripe = getStripeInstance();
    } catch (stripeError) {
      const message = stripeError instanceof Error ? stripeError.message : "Stripe configuration error";
      console.error("Failed to initialize Stripe:", message);
      return NextResponse.json({ 
        error: "Missing STRIPE_SECRET_KEY environment variable" 
      }, { status: 500 });
    }

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
      const returnTo = '/order-confirmation';
      successUrl = `${origin}/api/checkout/complete?session_id={CHECKOUT_SESSION_ID}&return_to=${encodeURIComponent(returnTo)}`;
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
      const returnTo = "/order-confirmation";

      const productMetadata: Record<string, string> = {
        handle: product.handle,
        ...(selectedSize ? { size: selectedSize } : {}),
      };

      if (customization) {
        Object.entries(customization).forEach(([key, value]) => {
          if (value !== undefined) {
            productMetadata[`custom_${key}`] = value;
          }
        });
      }

      lineItems = [
        {
          quantity,
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: product.name,
              description: product.shortDescription,
              metadata: productMetadata,
            },
          },
        },
      ];
      successUrl = `${origin}/api/checkout/complete?session_id={CHECKOUT_SESSION_ID}&return_to=${encodeURIComponent(returnTo)}`;
      cancelUrl = `${productUrl}&checkout=cancel`;
      metadata = {
        checkoutType: "single-item",
        handle: product.handle,
        quantity: String(quantity),
        ...(selectedSize ? { size: selectedSize } : {}),
      };

      if (customization) {
        Object.entries(customization).forEach(([key, value]) => {
          if (value !== undefined) {
            metadata[`custom_${key}`] = value;
          }
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      metadata,
      payment_intent_data: {
        metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
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
