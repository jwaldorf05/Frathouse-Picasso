import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/products/[handle] route", () => {
  it("returns product when found", async () => {
    const response = await GET(new Request("http://localhost/api/products/stencil-cap"), {
      params: Promise.resolve({ handle: "stencil-cap" }),
    });
    const body = (await response.json()) as { handle: string };

    expect(response.status).toBe(200);
    expect(body.handle).toBe("stencil-cap");
  });

  it("returns 404 when product is missing", async () => {
    const response = await GET(new Request("http://localhost/api/products/missing"), {
      params: Promise.resolve({ handle: "missing" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns 500 when params resolution fails", async () => {
    const response = await GET(new Request("http://localhost/api/products/fail"), {
      params: Promise.reject(new Error("bad params")),
    });

    expect(response.status).toBe(500);
  });

  it("returns fallback 500 message when params reject with non-Error", async () => {
    const response = await GET(new Request("http://localhost/api/products/fail"), {
      params: Promise.reject("bad params"),
    });
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("Failed to fetch product");
  });
});
