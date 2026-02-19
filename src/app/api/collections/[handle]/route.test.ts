import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "./route";

describe("/api/collections/[handle] route", () => {
  it("returns all collection", async () => {
    const response = await GET(new Request("http://localhost/api/collections/all?productsFirst=2") as NextRequest, {
      params: Promise.resolve({ handle: "all" }),
    });
    const body = (await response.json()) as { handle: string; products: { edges: unknown[] } };

    expect(response.status).toBe(200);
    expect(body.handle).toBe("all");
    expect(body.products.edges).toHaveLength(2);
  });

  it("returns specific category collection", async () => {
    const response = await GET(new Request("http://localhost/api/collections/tops") as NextRequest, {
      params: Promise.resolve({ handle: "tops" }),
    });
    const body = (await response.json()) as { title: string };

    expect(response.status).toBe(200);
    expect(body.title).toBe("Tops");
  });

  it("falls back to default productsFirst when value is invalid", async () => {
    const response = await GET(new Request("http://localhost/api/collections/tops?productsFirst=-1") as NextRequest, {
      params: Promise.resolve({ handle: "tops" }),
    });
    const body = (await response.json()) as { products: { edges: unknown[] } };

    expect(response.status).toBe(200);
    expect(body.products.edges.length).toBe(3);
  });

  it("returns string endCursor for category collection pagination", async () => {
    const response = await GET(new Request("http://localhost/api/collections/tops?productsFirst=2&productsAfter=999") as NextRequest, {
      params: Promise.resolve({ handle: "tops" }),
    });
    const body = (await response.json()) as { products: { pageInfo: { endCursor: string } } };

    expect(response.status).toBe(200);
    expect(body.products.pageInfo.endCursor).toBe("2");
  });

  it("returns 404 when collection is missing", async () => {
    const response = await GET(new Request("http://localhost/api/collections/missing") as NextRequest, {
      params: Promise.resolve({ handle: "missing" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 500 when params resolution fails", async () => {
    const response = await GET(new Request("http://localhost/api/collections/fail") as NextRequest, {
      params: Promise.reject(new Error("bad params")),
    });

    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when params reject with non-Error", async () => {
    const response = await GET(new Request("http://localhost/api/collections/fail") as NextRequest, {
      params: Promise.reject("bad params"),
    });
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch collection");
  });
});
