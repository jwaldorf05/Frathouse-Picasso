import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import {
  createCart,
  getCart,
  addToCart,
  updateCartLines,
  removeFromCart,
} from "./cart";

// ─── Mock the client ────────────────────────────────────────────────

vi.mock("./client", () => ({
  shopifyFetch: vi.fn(),
}));

import { shopifyFetch } from "./client";
const mockShopifyFetch = shopifyFetch as Mock;

// ─── Fixtures ───────────────────────────────────────────────────────

const mockCart = {
  id: "gid://shopify/Cart/abc123",
  checkoutUrl: "https://test-store.myshopify.com/cart/c/abc123",
  totalQuantity: 2,
  cost: {
    subtotalAmount: { amount: "40.00", currencyCode: "USD" },
    totalAmount: { amount: "43.20", currencyCode: "USD" },
    totalTaxAmount: { amount: "3.20", currencyCode: "USD" },
  },
  lines: {
    edges: [
      {
        node: {
          id: "gid://shopify/CartLine/line1",
          quantity: 2,
          merchandise: {
            id: "gid://shopify/ProductVariant/v1",
            title: "Default Title",
            product: {
              id: "gid://shopify/Product/1",
              handle: "test-product",
              title: "Test Product",
            },
            price: { amount: "20.00", currencyCode: "USD" },
            image: null,
            selectedOptions: [{ name: "Size", value: "M" }],
          },
          cost: {
            totalAmount: { amount: "40.00", currencyCode: "USD" },
          },
        },
        cursor: "cursor-line1",
      },
    ],
    pageInfo: { hasNextPage: false, endCursor: null },
  },
};

const emptyCart = {
  ...mockCart,
  totalQuantity: 0,
  cost: {
    subtotalAmount: { amount: "0.00", currencyCode: "USD" },
    totalAmount: { amount: "0.00", currencyCode: "USD" },
    totalTaxAmount: null,
  },
  lines: {
    edges: [],
    pageInfo: { hasNextPage: false, endCursor: null },
  },
};

// ─── Tests ──────────────────────────────────────────────────────────

afterEach(() => {
  mockShopifyFetch.mockReset();
});

describe("createCart", () => {
  it("creates an empty cart when no lines are provided", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: { cart: emptyCart, userErrors: [] },
    });

    const result = await createCart();

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("CreateCart");
    expect(variables).toEqual({ lines: [] });
    expect(result.totalQuantity).toBe(0);
    expect(result.lines.edges).toHaveLength(0);
  });

  it("creates a cart with initial line items", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: { cart: mockCart, userErrors: [] },
    });

    const lines = [
      { merchandiseId: "gid://shopify/ProductVariant/v1", quantity: 2 },
    ];
    const result = await createCart(lines);

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect(variables).toEqual({ lines });
    expect(result.totalQuantity).toBe(2);
    expect(result.checkoutUrl).toContain("myshopify.com");
  });

  it("throws on user errors from Shopify", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartCreate: {
        cart: null,
        userErrors: [
          {
            field: ["lines", "0", "merchandiseId"],
            message: "Invalid variant",
          },
        ],
      },
    });

    await expect(
      createCart([{ merchandiseId: "invalid", quantity: 1 }])
    ).rejects.toThrow("Shopify user errors: Invalid variant");
  });

  it("propagates network errors", async () => {
    mockShopifyFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(createCart()).rejects.toThrow("Network error");
  });
});

describe("getCart", () => {
  it("fetches an existing cart by ID", async () => {
    mockShopifyFetch.mockResolvedValueOnce({ cart: mockCart });

    const result = await getCart("gid://shopify/Cart/abc123");

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("GetCart");
    expect(variables).toEqual({ cartId: "gid://shopify/Cart/abc123" });
    expect(result).toEqual(mockCart);
  });

  it("returns null for a non-existent cart", async () => {
    mockShopifyFetch.mockResolvedValueOnce({ cart: null });

    const result = await getCart("gid://shopify/Cart/nonexistent");
    expect(result).toBeNull();
  });

  it("returns cart with correct cost structure", async () => {
    mockShopifyFetch.mockResolvedValueOnce({ cart: mockCart });

    const result = await getCart("gid://shopify/Cart/abc123");

    expect(result?.cost.subtotalAmount.amount).toBe("40.00");
    expect(result?.cost.totalAmount.amount).toBe("43.20");
    expect(result?.cost.totalTaxAmount?.amount).toBe("3.20");
  });

  it("propagates errors", async () => {
    mockShopifyFetch.mockRejectedValueOnce(new Error("Unauthorized"));

    await expect(getCart("some-id")).rejects.toThrow("Unauthorized");
  });
});

describe("addToCart", () => {
  it("adds line items to an existing cart", async () => {
    const updatedCart = { ...mockCart, totalQuantity: 4 };
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesAdd: { cart: updatedCart, userErrors: [] },
    });

    const lines = [
      { merchandiseId: "gid://shopify/ProductVariant/v2", quantity: 2 },
    ];
    const result = await addToCart("gid://shopify/Cart/abc123", lines);

    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("AddToCart");
    expect(variables).toEqual({
      cartId: "gid://shopify/Cart/abc123",
      lines,
    });
    expect(result.totalQuantity).toBe(4);
  });

  it("adds multiple line items at once", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesAdd: { cart: mockCart, userErrors: [] },
    });

    const lines = [
      { merchandiseId: "gid://shopify/ProductVariant/v1", quantity: 1 },
      { merchandiseId: "gid://shopify/ProductVariant/v2", quantity: 3 },
    ];
    await addToCart("gid://shopify/Cart/abc123", lines);

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect((variables as { lines: unknown[] }).lines).toHaveLength(2);
  });

  it("throws on user errors", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesAdd: {
        cart: null,
        userErrors: [{ field: ["lines"], message: "Variant not found" }],
      },
    });

    await expect(
      addToCart("cart-id", [{ merchandiseId: "bad-id", quantity: 1 }])
    ).rejects.toThrow("Shopify user errors: Variant not found");
  });
});

describe("updateCartLines", () => {
  it("updates line item quantities", async () => {
    const updatedCart = {
      ...mockCart,
      totalQuantity: 5,
      lines: {
        ...mockCart.lines,
        edges: [
          {
            ...mockCart.lines.edges[0],
            node: { ...mockCart.lines.edges[0].node, quantity: 5 },
          },
        ],
      },
    };
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesUpdate: { cart: updatedCart, userErrors: [] },
    });

    const lines = [
      {
        id: "gid://shopify/CartLine/line1",
        merchandiseId: "gid://shopify/ProductVariant/v1",
        quantity: 5,
      },
    ];
    const result = await updateCartLines("gid://shopify/Cart/abc123", lines);

    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("UpdateCartLines");
    expect(variables).toEqual({
      cartId: "gid://shopify/Cart/abc123",
      lines,
    });
    expect(result.totalQuantity).toBe(5);
  });

  it("throws on user errors", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesUpdate: {
        cart: null,
        userErrors: [{ field: ["lines"], message: "Line not found" }],
      },
    });

    await expect(
      updateCartLines("cart-id", [
        { id: "bad-line", merchandiseId: "v1", quantity: 1 },
      ])
    ).rejects.toThrow("Shopify user errors: Line not found");
  });
});

describe("removeFromCart", () => {
  it("removes line items from cart", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesRemove: { cart: emptyCart, userErrors: [] },
    });

    const result = await removeFromCart("gid://shopify/Cart/abc123", [
      "gid://shopify/CartLine/line1",
    ]);

    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("RemoveCartLines");
    expect(variables).toEqual({
      cartId: "gid://shopify/Cart/abc123",
      lineIds: ["gid://shopify/CartLine/line1"],
    });
    expect(result.totalQuantity).toBe(0);
    expect(result.lines.edges).toHaveLength(0);
  });

  it("removes multiple lines at once", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesRemove: { cart: emptyCart, userErrors: [] },
    });

    await removeFromCart("cart-id", ["line1", "line2", "line3"]);

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect((variables as { lineIds: string[] }).lineIds).toHaveLength(3);
  });

  it("throws on user errors", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      cartLinesRemove: {
        cart: null,
        userErrors: [{ field: ["lineIds"], message: "Invalid line ID" }],
      },
    });

    await expect(removeFromCart("cart-id", ["bad-id"])).rejects.toThrow(
      "Shopify user errors: Invalid line ID"
    );
  });
});
