import { describe, it, expect, vi, afterEach, type Mock } from "vitest";
import { getCollections, getCollectionByHandle } from "./collections";

// ─── Mock the client ────────────────────────────────────────────────

vi.mock("./client", () => ({
  shopifyFetch: vi.fn(),
}));

import { shopifyFetch } from "./client";
const mockShopifyFetch = shopifyFetch as Mock;

// ─── Fixtures ───────────────────────────────────────────────────────

const mockCollection = {
  id: "gid://shopify/Collection/1",
  handle: "summer-sale",
  title: "Summer Sale",
  description: "Hot deals for summer",
  image: {
    url: "https://cdn.shopify.com/collection.jpg",
    altText: "Summer Sale",
    width: 800,
    height: 600,
  },
  products: {
    edges: [
      {
        node: {
          id: "gid://shopify/Product/1",
          handle: "sunglasses",
          title: "Sunglasses",
        },
        cursor: "cursor-p1",
      },
    ],
    pageInfo: { hasNextPage: false, endCursor: null },
  },
};

const mockCollectionsConnection = {
  edges: [
    { node: mockCollection, cursor: "cursor-1" },
    {
      node: {
        ...mockCollection,
        id: "gid://shopify/Collection/2",
        handle: "winter-sale",
        title: "Winter Sale",
      },
      cursor: "cursor-2",
    },
  ],
  pageInfo: { hasNextPage: false, endCursor: null },
};

// ─── Tests ──────────────────────────────────────────────────────────

afterEach(() => {
  mockShopifyFetch.mockReset();
});

describe("getCollections", () => {
  it("fetches collections with default limit", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      collections: mockCollectionsConnection,
    });

    const result = await getCollections();

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("GetCollections");
    expect(variables).toEqual({ first: 20 });
    expect(result.edges).toHaveLength(2);
  });

  it("fetches collections with custom limit", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      collections: {
        edges: [{ node: mockCollection, cursor: "cursor-1" }],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    });

    const result = await getCollections(1);

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect(variables).toEqual({ first: 1 });
    expect(result.edges).toHaveLength(1);
  });

  it("returns collection data with correct structure", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      collections: mockCollectionsConnection,
    });

    const result = await getCollections();
    const collection = result.edges[0].node;

    expect(collection.id).toBe("gid://shopify/Collection/1");
    expect(collection.handle).toBe("summer-sale");
    expect(collection.title).toBe("Summer Sale");
    expect(collection.image).not.toBeNull();
    expect(collection.image?.url).toContain("shopify.com");
    expect(collection.products.edges).toHaveLength(1);
  });

  it("propagates errors from shopifyFetch", async () => {
    mockShopifyFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(getCollections()).rejects.toThrow("Network error");
  });
});

describe("getCollectionByHandle", () => {
  it("fetches a single collection by handle", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      collectionByHandle: mockCollection,
    });

    const result = await getCollectionByHandle("summer-sale");

    expect(mockShopifyFetch).toHaveBeenCalledTimes(1);
    const [query, variables] = mockShopifyFetch.mock.calls[0];
    expect(query).toContain("GetCollectionByHandle");
    expect(variables).toEqual({ handle: "summer-sale", productsFirst: 20 });
    expect(result).toEqual(mockCollection);
  });

  it("fetches collection with custom products limit", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      collectionByHandle: mockCollection,
    });

    await getCollectionByHandle("summer-sale", 50);

    const [, variables] = mockShopifyFetch.mock.calls[0];
    expect(variables).toEqual({ handle: "summer-sale", productsFirst: 50 });
  });

  it("returns null when collection is not found", async () => {
    mockShopifyFetch.mockResolvedValueOnce({
      collectionByHandle: null,
    });

    const result = await getCollectionByHandle("nonexistent");
    expect(result).toBeNull();
  });

  it("propagates errors from shopifyFetch", async () => {
    mockShopifyFetch.mockRejectedValueOnce(new Error("API error"));

    await expect(getCollectionByHandle("test")).rejects.toThrow("API error");
  });
});
