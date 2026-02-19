import { beforeEach, describe, expect, it, vi } from "vitest";

const createSessionMock = vi.hoisted(() => vi.fn());

vi.mock("stripe", () => ({
  default: class MockStripe {
    checkout = {
      sessions: {
        create: createSessionMock,
      },
    };
  },
}));

import { POST } from "./route";
import { serializeCartCookie, type CartState } from "@/lib/cart";

describe("/api/checkout route", () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_51N9xM8D2I3x4y5z6a7b8c9d0e";
    createSessionMock.mockReset();
    createSessionMock.mockResolvedValue({ url: "https://checkout.stripe.com/session/test" });
  });

  it("returns 500 when Stripe key is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "stencil-cap", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("returns 400 for cart checkout when cart is empty", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ fromCart: true }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates checkout session from cart items", async () => {
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

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ fromCart: true }),
      headers: {
        "Content-Type": "application/json",
        cookie: serializeCartCookie(cart),
      },
    });

    const response = await POST(request);
    const body = (await response.json()) as { url: string };

    expect(response.status).toBe(200);
    expect(body.url).toContain("checkout.stripe.com");
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ checkoutType: "cart" }),
      })
    );
  });

  it("returns 400 when handle is missing for single-item checkout", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when quantity is invalid", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "stencil-cap", quantity: 0 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 404 when product is missing", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "missing", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it("returns 400 for missing size on sized products", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "neon-drip-tee", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid size selection", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "neon-drip-tee", quantity: 1, selectedSize: "XXL" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates single-item Stripe session", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "stencil-cap", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = (await response.json()) as { url: string };

    expect(response.status).toBe(200);
    expect(body.url).toContain("checkout.stripe.com");
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ checkoutType: "single-item", handle: "stencil-cap" }),
      })
    );
  });

  it("creates single-item Stripe session for a valid sized product", async () => {
    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "neon-drip-tee", quantity: 1, selectedSize: "L" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createSessionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ size: "L" }),
      })
    );
  });

  it("returns 500 when Stripe session has no URL", async () => {
    createSessionMock.mockResolvedValueOnce({ url: null });

    const request = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ handle: "stencil-cap", quantity: 1 }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("returns 500 when request parsing throws", async () => {
    const request = {
      url: "http://localhost/api/checkout",
      headers: new Headers(),
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Request;

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when non-Error is thrown", async () => {
    const request = {
      url: "http://localhost/api/checkout",
      headers: new Headers(),
      json: async () => {
        throw "invalid json";
      },
    } as unknown as Request;

    const response = await POST(request);
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Unable to start checkout.");
  });
});
