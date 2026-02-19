import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "./route";

describe("/api/products route", () => {
  it("returns paginated products", async () => {
    const response = await GET(new Request("http://localhost/api/products?first=2&after=0") as NextRequest);
    const body = (await response.json()) as { edges: Array<{ node: { handle: string } }>; pageInfo: { hasNextPage: boolean } };

    expect(response.status).toBe(200);
    expect(body.edges).toHaveLength(2);
    expect(body.pageInfo.hasNextPage).toBe(true);
  });

  it("filters products by query", async () => {
    const response = await GET(new Request("http://localhost/api/products?query=hoodie") as NextRequest);
    const body = (await response.json()) as { edges: Array<{ node: { handle: string } }> };

    expect(body.edges).toHaveLength(1);
    expect(body.edges[0].node.handle).toBe("splatter-hoodie");
  });

  it("falls back to defaults for invalid pagination params", async () => {
    const response = await GET(new Request("http://localhost/api/products?first=-1&after=-2") as NextRequest);
    const body = (await response.json()) as { edges: unknown[]; pageInfo: { endCursor: string | null } };

    expect(body.edges.length).toBeGreaterThan(0);
    expect(body.pageInfo.endCursor).not.toBeNull();
  });

  it("returns null endCursor when query has no matches", async () => {
    const response = await GET(new Request("http://localhost/api/products?query=no-match-term") as NextRequest);
    const body = (await response.json()) as { edges: unknown[]; pageInfo: { endCursor: string | null } };

    expect(response.status).toBe(200);
    expect(body.edges).toHaveLength(0);
    expect(body.pageInfo.endCursor).toBeNull();
  });

  it("returns 500 when URL parsing fails", async () => {
    const response = await GET({ url: "not-a-valid-url" } as NextRequest);
    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when non-Error is thrown", async () => {
    const request = {
      get url() {
        throw "bad";
      },
    } as unknown as NextRequest;

    const response = await GET(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch products");
  });
});
