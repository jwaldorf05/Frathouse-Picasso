import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "./route";

describe("/api/collections route", () => {
  it("returns collection edges", async () => {
    const response = await GET(new Request("http://localhost/api/collections?first=2") as NextRequest);
    const body = (await response.json()) as { edges: Array<{ node: { handle: string } }>; pageInfo: { hasNextPage: boolean } };

    expect(response.status).toBe(200);
    expect(body.edges).toHaveLength(2);
    expect(body.edges[0].node.handle).toBe("all");
    expect(body.pageInfo.hasNextPage).toBe(true);
  });

  it("falls back when first is invalid", async () => {
    const response = await GET(new Request("http://localhost/api/collections?first=-1") as NextRequest);
    const body = (await response.json()) as { edges: unknown[] };

    expect(body.edges.length).toBeGreaterThan(0);
  });

  it("uses default first value when first is omitted", async () => {
    const response = await GET(new Request("http://localhost/api/collections") as NextRequest);
    const body = (await response.json()) as { pageInfo: { endCursor: string } };

    expect(response.status).toBe(200);
    expect(body.pageInfo.endCursor).toBe("5");
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
    expect(body.error).toBe("Failed to fetch collections");
  });
});
