import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { GET, POST } from "./route";
import { serializeCartCookie, type CartState } from "@/lib/cart";

function asNextRequest(request: Request): NextRequest {
  return request as unknown as NextRequest;
}

describe("/api/cart route", () => {
  it("returns empty cart when cookie is missing", async () => {
    const response = await GET(asNextRequest(new Request("http://localhost/api/cart")));
    const body = (await response.json()) as { items: unknown[]; totalQuantity: number };

    expect(response.status).toBe(200);
    expect(body.items).toEqual([]);
    expect(body.totalQuantity).toBe(0);
  });

  it("returns cart contents from cookie", async () => {
    const cart: CartState = {
      items: [
        {
          id: "line-1",
          handle: "stencil-cap",
          name: "STENCIL CAP",
          selectedSize: null,
          quantity: 2,
          unitPrice: "$45",
          image: null,
        },
      ],
    };

    const request = new Request("http://localhost/api/cart", {
      headers: { cookie: serializeCartCookie(cart) },
    });

    const response = await GET(asNextRequest(request));
    const body = (await response.json()) as { totalQuantity: number };

    expect(body.totalQuantity).toBe(2);
  });

  it("returns 400 when handle is missing", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("adds sized product when selected size is valid", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ handle: "neon-drip-tee", quantity: 1, selectedSize: "M" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    const body = (await response.json()) as { items: Array<{ selectedSize: string | null }> };

    expect(response.status).toBe(201);
    expect(body.items[0].selectedSize).toBe("M");
  });

  it("returns 400 when quantity is invalid", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ handle: "stencil-cap", quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("returns 404 when product is missing", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ handle: "missing-product", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    expect(response.status).toBe(404);
  });

  it("returns 400 when sized product is missing selected size", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ handle: "neon-drip-tee", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid selected size", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ handle: "neon-drip-tee", quantity: 1, selectedSize: "XXL" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("adds item and sets cart cookie", async () => {
    const request = new Request("http://localhost/api/cart", {
      method: "POST",
      body: JSON.stringify({ handle: "stencil-cap", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(asNextRequest(request));
    const body = (await response.json()) as { totalQuantity: number };

    expect(response.status).toBe(201);
    expect(body.totalQuantity).toBe(1);
    expect(response.headers.get("Set-Cookie")).toContain("fhp-cart=");
  });

  it("returns 500 when parsing request body throws", async () => {
    const request = {
      headers: new Headers(),
      json: async () => {
        throw new Error("broken json");
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when non-Error is thrown", async () => {
    const request = {
      headers: new Headers(),
      json: async () => {
        throw "broken";
      },
    } as unknown as NextRequest;

    const response = await POST(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Unable to update cart.");
  });
});
