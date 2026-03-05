import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shopifyFetch } from "./client";

// ─── Mock global fetch ──────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

// ─── Set env vars for all tests ─────────────────────────────────────

beforeEach(() => {
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = "test-store.myshopify.com";
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN = "test-token-123";
});

afterEach(() => {
  mockFetch.mockReset();
});

// ─── Tests ──────────────────────────────────────────────────────────

describe("shopifyFetch", () => {
  it("sends a POST request with correct headers and body", async () => {
    const mockData = { products: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    });

    const query = "query { products { edges { node { id } } } }";
    const variables = { first: 10 };

    await shopifyFetch(query, variables);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe(
      "https://test-store.myshopify.com/api/2024-01/graphql.json"
    );
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers["X-Shopify-Storefront-Access-Token"]).toBe(
      "test-token-123"
    );
    expect(JSON.parse(options.body)).toEqual({ query, variables });
  });

  it("returns the data from a successful response", async () => {
    const mockData = { products: [{ id: "1", title: "Test Product" }] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockData }),
    });

    const result = await shopifyFetch("query { products { id } }");
    expect(result).toEqual(mockData);
  });

  it("throws an error when the HTTP response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });

    await expect(shopifyFetch("query { shop { name } }")).rejects.toThrow(
      "Shopify API error: 401 Unauthorized"
    );
  });

  it("throws an error when GraphQL errors are present", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: null,
        errors: [
          { message: "Field 'foo' doesn't exist" },
          { message: "Syntax error" },
        ],
      }),
    });

    await expect(shopifyFetch("query { foo }")).rejects.toThrow(
      "Shopify GraphQL errors: Field 'foo' doesn't exist, Syntax error"
    );
  });

  it("throws an error when environment variables are missing", async () => {
    delete process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    delete process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    await expect(shopifyFetch("query { shop { name } }")).rejects.toThrow(
      "Missing Shopify environment variables"
    );
  });

  it("throws when only domain is missing", async () => {
    delete process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

    await expect(shopifyFetch("query { shop { name } }")).rejects.toThrow(
      "Missing Shopify environment variables"
    );
  });

  it("throws when only token is missing", async () => {
    delete process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    await expect(shopifyFetch("query { shop { name } }")).rejects.toThrow(
      "Missing Shopify environment variables"
    );
  });

  it("passes empty variables object by default", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: {} }),
    });

    await shopifyFetch("query { shop { name } }");

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.variables).toEqual({});
  });
});
