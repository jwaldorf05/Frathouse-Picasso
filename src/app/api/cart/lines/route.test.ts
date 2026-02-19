import { describe, expect, it } from "vitest";
import type { NextRequest } from "next/server";
import { DELETE, PUT } from "./route";
import { serializeCartCookie, type CartState } from "@/lib/cart";

function asNextRequest(request: Request): NextRequest {
  return request as unknown as NextRequest;
}

const baseCart: CartState = {
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

describe("/api/cart/lines route", () => {
  it("returns 400 when update lineId is missing", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "PUT",
      body: JSON.stringify({ quantity: 2 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("returns 400 when update quantity is invalid", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "PUT",
      body: JSON.stringify({ lineId: "line-1", quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("returns 404 when updating missing line", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "PUT",
      body: JSON.stringify({ lineId: "line-x", quantity: 2 }),
      headers: {
        "Content-Type": "application/json",
        cookie: serializeCartCookie(baseCart),
      },
    });

    const response = await PUT(asNextRequest(request));
    expect(response.status).toBe(404);
  });

  it("updates line quantity and writes cookie", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "PUT",
      body: JSON.stringify({ lineId: "line-1", quantity: 3 }),
      headers: {
        "Content-Type": "application/json",
        cookie: serializeCartCookie(baseCart),
      },
    });

    const response = await PUT(asNextRequest(request));
    const body = (await response.json()) as { totalQuantity: number };

    expect(response.status).toBe(200);
    expect(body.totalQuantity).toBe(3);
    expect(response.headers.get("Set-Cookie")).toContain("fhp-cart=");
  });

  it("returns 500 when update json parse fails", async () => {
    const request = {
      headers: new Headers(),
      json: async () => {
        throw new Error("bad");
      },
    } as unknown as NextRequest;

    const response = await PUT(request);
    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when update throws non-Error", async () => {
    const request = {
      headers: new Headers(),
      json: async () => {
        throw "bad";
      },
    } as unknown as NextRequest;

    const response = await PUT(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Unable to update cart line.");
  });

  it("returns 400 when delete lineId is missing", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "DELETE",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await DELETE(asNextRequest(request));
    expect(response.status).toBe(400);
  });

  it("returns 404 when deleting missing line", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "DELETE",
      body: JSON.stringify({ lineId: "line-x" }),
      headers: {
        "Content-Type": "application/json",
        cookie: serializeCartCookie(baseCart),
      },
    });

    const response = await DELETE(asNextRequest(request));
    expect(response.status).toBe(404);
  });

  it("deletes line and writes cookie", async () => {
    const request = new Request("http://localhost/api/cart/lines", {
      method: "DELETE",
      body: JSON.stringify({ lineId: "line-1" }),
      headers: {
        "Content-Type": "application/json",
        cookie: serializeCartCookie(baseCart),
      },
    });

    const response = await DELETE(asNextRequest(request));
    const body = (await response.json()) as { totalQuantity: number };

    expect(response.status).toBe(200);
    expect(body.totalQuantity).toBe(0);
    expect(response.headers.get("Set-Cookie")).toContain("fhp-cart=");
  });

  it("returns 500 when delete json parse fails", async () => {
    const request = {
      headers: new Headers(),
      json: async () => {
        throw new Error("bad");
      },
    } as unknown as NextRequest;

    const response = await DELETE(request);
    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when delete throws non-Error", async () => {
    const request = {
      headers: new Headers(),
      json: async () => {
        throw "bad";
      },
    } as unknown as NextRequest;

    const response = await DELETE(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Unable to remove cart line.");
  });
});
