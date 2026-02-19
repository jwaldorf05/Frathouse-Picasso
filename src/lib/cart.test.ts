import { describe, expect, it } from "vitest";
import {
  addItemToCart,
  getCartItemCount,
  getEmptyCart,
  readCartFromCookieHeader,
  removeCartLine,
  serializeCartCookie,
  toStripeLineItems,
  updateCartLineQuantity,
  type CartState,
} from "./cart";

describe("cart utils", () => {
  it("returns an empty cart by default", () => {
    expect(getEmptyCart()).toEqual({ items: [] });
  });

  it("reads empty cart when cookie is missing", () => {
    expect(readCartFromCookieHeader(null)).toEqual({ items: [] });
  });

  it("reads empty cart when cookie payload is invalid", () => {
    const header = "fhp-cart=%7Bbad-json; Path=/";
    expect(readCartFromCookieHeader(header)).toEqual({ items: [] });
  });

  it("filters malformed items from parsed cart cookie", () => {
    const malformed = encodeURIComponent(
      JSON.stringify({
        items: [
          { id: "ok", handle: "h", name: "n", selectedSize: null, quantity: 1, unitPrice: "$10" },
          { id: "bad", quantity: 2 },
        ],
      })
    );

    const result = readCartFromCookieHeader(`fhp-cart=${malformed}`);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("ok");
  });

  it("serializes and restores cart state", () => {
    const cart: CartState = {
      items: [
        {
          id: "line-1",
          handle: "neon-drip-tee",
          name: "NEON DRIP TEE",
          selectedSize: "M",
          quantity: 2,
          unitPrice: "$65",
          image: null,
        },
      ],
    };

    const cookie = serializeCartCookie(cart);
    const parsed = readCartFromCookieHeader(cookie);

    expect(cookie).toContain("HttpOnly");
    expect(parsed).toEqual(cart);
  });

  it("adds a new line item when no match exists", () => {
    const result = addItemToCart(getEmptyCart(), {
      handle: "neon-drip-tee",
      name: "NEON DRIP TEE",
      selectedSize: "M",
      quantity: 1,
      unitPrice: "$65",
      image: null,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBeTypeOf("string");
    expect(result.items[0].quantity).toBe(1);
  });

  it("merges quantity for matching cart line", () => {
    const base = addItemToCart(getEmptyCart(), {
      handle: "neon-drip-tee",
      name: "NEON DRIP TEE",
      selectedSize: "M",
      quantity: 1,
      unitPrice: "$65",
      image: null,
    });

    const merged = addItemToCart(base, {
      handle: "neon-drip-tee",
      name: "NEON DRIP TEE",
      selectedSize: "M",
      quantity: 3,
      unitPrice: "$65",
      image: null,
    });

    expect(merged.items).toHaveLength(1);
    expect(merged.items[0].quantity).toBe(4);
  });

  it("updates cart line quantity", () => {
    const base: CartState = {
      items: [
        {
          id: "line-1",
          handle: "stencil-cap",
          name: "STENCIL CAP",
          selectedSize: null,
          quantity: 1,
          unitPrice: "$45",
          image: null,
        },
      ],
    };

    const updated = updateCartLineQuantity(base, "line-1", 5);

    expect(updated.items[0].quantity).toBe(5);
  });

  it("removes cart line", () => {
    const base: CartState = {
      items: [
        {
          id: "line-1",
          handle: "stencil-cap",
          name: "STENCIL CAP",
          selectedSize: null,
          quantity: 1,
          unitPrice: "$45",
          image: null,
        },
      ],
    };

    expect(removeCartLine(base, "line-1").items).toEqual([]);
  });

  it("calculates total quantity", () => {
    const cart: CartState = {
      items: [
        {
          id: "line-1",
          handle: "stencil-cap",
          name: "STENCIL CAP",
          selectedSize: null,
          quantity: 1,
          unitPrice: "$45",
          image: null,
        },
        {
          id: "line-2",
          handle: "neon-drip-tee",
          name: "NEON DRIP TEE",
          selectedSize: "L",
          quantity: 2,
          unitPrice: "$69",
          image: null,
        },
      ],
    };

    expect(getCartItemCount(cart)).toBe(3);
  });

  it("converts cart items to Stripe line items", () => {
    const cart: CartState = {
      items: [
        {
          id: "line-1",
          handle: "stencil-cap",
          name: "STENCIL CAP",
          selectedSize: null,
          quantity: 1,
          unitPrice: "$45",
          image: null,
        },
        {
          id: "line-2",
          handle: "neon-drip-tee",
          name: "NEON DRIP TEE",
          selectedSize: "L",
          quantity: 2,
          unitPrice: "$69",
          image: null,
        },
      ],
    };

    const lineItems = toStripeLineItems(cart);

    expect(lineItems).toHaveLength(2);
    expect(lineItems[0].price_data?.unit_amount).toBe(4500);
    expect(lineItems[1].price_data?.product_data?.name).toContain("(L)");
  });
});
