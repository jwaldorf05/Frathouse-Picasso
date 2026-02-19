import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { parsePriceToCents, resolveCheckoutOrigin } from "./checkout";

describe("checkout utils", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercelUrl = process.env.VERCEL_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    if (originalSiteUrl) {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }

    if (originalVercelUrl) {
      process.env.VERCEL_URL = originalVercelUrl;
    } else {
      delete process.env.VERCEL_URL;
    }
  });

  it("parses whole dollar prices", () => {
    expect(parsePriceToCents("$65")).toBe(6500);
  });

  it("parses decimal prices", () => {
    expect(parsePriceToCents("$69.99")).toBe(6999);
  });

  it("parses formatted prices with commas", () => {
    expect(parsePriceToCents("$1,204.50")).toBe(120450);
  });

  it("throws on empty price formats", () => {
    expect(() => parsePriceToCents("$")).toThrow("Invalid product price format");
  });

  it("throws on non-numeric prices", () => {
    expect(() => parsePriceToCents("price-unset")).toThrow("Invalid product price format");
  });

  it("prefers NEXT_PUBLIC_SITE_URL as checkout origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://frathousepicasso.com";
    process.env.VERCEL_URL = "frathouse-picasso.vercel.app";

    expect(resolveCheckoutOrigin("http://localhost:3000")).toBe("https://frathousepicasso.com");
  });

  it("uses VERCEL_URL when NEXT_PUBLIC_SITE_URL is unset", () => {
    process.env.VERCEL_URL = "frathouse-picasso.vercel.app";

    expect(resolveCheckoutOrigin("http://localhost:3000")).toBe(
      "https://frathouse-picasso.vercel.app"
    );
  });

  it("falls back to request origin in local development", () => {
    expect(resolveCheckoutOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });
});
