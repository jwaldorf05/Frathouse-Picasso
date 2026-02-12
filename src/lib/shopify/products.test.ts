import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { getProducts, getProductByHandle, searchProducts } from "./products";

// ─── Mock the client ────────────────────────────────────────────────

vi.mock("./client", () => ({
  shopifyFetch: vi.fn(),
}));

import { shopifyFetch } from "./client";
const mockShopifyFetch = shopifyFetch as Mock;

// ─── Fixtures ───────────────────────────────────────────────────────

const mockProduct = {
  id: "gid://shopify/Product/1",
  handle: "test-product",
  title: "Test Product",
  description: "A test product",
  descriptionHtml: "<p>A test product</p>",
  availableForSale: true,
  priceRange: {
    minVariantPrice: { amount: "10.00", currencyCode: "USD" },
    maxVariantPrice: { amount: "20.00", currencyCode: "USD" },
  },
  images: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
  variants: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } },
  options: [],
  tags: ["test"],
  updatedAt: "2024-01-01T00:00:00Z",
};

const mockProductsConnection = {
  edges: [
    { node: mockProduct, cursor: "cursor-1" },
    {
      node: { ...mockProduct, id: "gid://shopify/Product/2", handle: "test-2" },
      cursor: "cursor-2",
    },
  ],
  pageInfo: { hasNextPage: true, endCursor: "cursor-2" },
};

// ─── Tests ──────────────────────────────────────────────────────────

afterEach(() => {
  mockShopifyFetch.mockReset();
});

describe("getProducts", () => {
  it("fetches products with default pagination", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      products: mockProductsConnection,
    });

    const result = await getProducts();

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("GetProducts");
    expect(variables).toEqual({ first: 20, after: undefined });
    expect(result.edges).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
  });

  it("fetches products with custom pagination", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      products: {
        ...mockProductsConnection,
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    const result = await getProducts(5, "cursor-1");

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect(variables).toEqual({ first: 5, after: "cursor-1" });
    expect(result.pageInfo.hasNextPage).toBe(false);
  });

  it("returns product data with correct structure", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      products: mockProductsConnection,
    });

    const result = await getProducts();
    const product = result.edges[0].node;

    expect(product.id).toBe("gid://shopify/Product/1");
    expect(product.handle).toBe("test-product");
    expect(product.title).toBe("Test Product");
    expect(product.availableForSale).toBe(true);
    expect(product.priceRange.minVariantPrice.amount).toBe("10.00");
  });

  it("propagates errors from shopifyFetch", async () => {
    mockShopifyFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(getProducts()).rejects.toThrow("Network error");
  });
});

describe("getProductByHandle", () => {
  it("fetches a single product by handle", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      productByHandle: mockProduct,
    });

    const result = await getProductByHandle("test-product");

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("GetProductByHandle");
    expect(variables).toEqual({ handle: "test-product" });
    expect(result).toEqual(mockProduct);
  });

  it("returns null when product is not found", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      productByHandle: null,
    });

    const result = await getProductByHandle("nonexistent");
    expect(result).toBeNull();
  });

  it("propagates errors from shopifyFetch", async () => {
    mockShopifyFetch.mockRejectedValueOnce(
      new Error("Shopify API error: 500 Internal Server Error")
    );

    await expect(getProductByHandle("test")).rejects.toThrow(
      "Shopify API error: 500 Internal Server Error"
    );
  });
});

describe("searchProducts", () => {
  it("searches products with a query string", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      products: mockProductsConnection,
    });

    const result = await searchProducts("test");

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("SearchProducts");
    expect(variables).toEqual({ query: "test", first: 20 });
    expect(result.edges).toHaveLength(2);
  });

  it("searches with custom limit", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      products: {
        edges: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    const result = await searchProducts("shoes", 5);

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect(variables).toEqual({ query: "shoes", first: 5 });
    expect(result.edges).toHaveLength(0);
  });

  it("propagates errors from shopifyFetch", async () => {
    mockShopifyFetch.mockRejectedValueOnce(new Error("GraphQL error"));

    await expect(searchProducts("test")).rejects.toThrow("GraphQL error");
  });
});
