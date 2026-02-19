import { describe, it, expect } from "vitest";
import {
  collectionItems,
  footerNavItems,
  getInventoryProductByHandle,
  getInventoryProductById,
  getProductPrice,
  inventoryProducts,
} from "./shopData";

describe("shopData", () => {
  it("exports inventory products with expected shape", () => {
    expect(inventoryProducts.length).toBeGreaterThan(0);

    for (const product of inventoryProducts) {
      expect(product.id).toBeTypeOf("string");
      expect(product.handle).toBeTypeOf("string");
      expect(product.name).toBeTypeOf("string");
      expect(product.defaultPrice).toMatch(/^\$/);
      expect(product.image === null || typeof product.image === "string").toBe(true);
      expect(product.category).toBeTypeOf("string");
      expect(product.shortDescription).toBeTypeOf("string");
      expect(product.description).toBeTypeOf("string");
      expect(Array.isArray(product.materials)).toBe(true);
      expect(product.materials.length).toBeGreaterThan(0);

      if (product.sizeOptions !== undefined) {
        expect(Array.isArray(product.sizeOptions)).toBe(true);
      }

      if (product.gallery !== undefined) {
        expect(Array.isArray(product.gallery)).toBe(true);
        for (const frame of product.gallery) {
          expect(frame.id).toBeTypeOf("string");
          expect(frame.title).toBeTypeOf("string");
          expect(frame.image === null || typeof frame.image === "string").toBe(true);
        }
      }
    }
  });

  it("uses default price and size override pricing", () => {
    const productWithOverrides = inventoryProducts.find(
      (product) => product.handle === "neon-drip-tee"
    );
    const productWithoutSizes = inventoryProducts.find(
      (product) => product.handle === "stencil-cap"
    );

    expect(productWithOverrides).toBeDefined();
    expect(productWithoutSizes).toBeDefined();

    if (!productWithOverrides || !productWithoutSizes) {
      return;
    }

    expect(getProductPrice(productWithOverrides)).toBe(productWithOverrides.defaultPrice);
    expect(getProductPrice(productWithOverrides, "L")).toBe("$69");
    expect(getProductPrice(productWithOverrides, "S")).toBe(productWithOverrides.defaultPrice);
    expect(getProductPrice(productWithoutSizes, "L")).toBe(productWithoutSizes.defaultPrice);
  });

  it("finds products by id and handle", () => {
    const first = inventoryProducts[0];

    expect(getInventoryProductById(first.id)).toEqual(first);
    expect(getInventoryProductByHandle(first.handle)).toEqual(first);
  });

  it("returns undefined for unknown id and handle", () => {
    expect(getInventoryProductById("missing-id")).toBeUndefined();
    expect(getInventoryProductByHandle("missing-handle")).toBeUndefined();
  });

  it("exports collection nav items with label + href", () => {
    expect(collectionItems.length).toBeGreaterThan(0);

    for (const item of collectionItems) {
      expect(item.label).toBeTypeOf("string");
      expect(item.href).toBeTypeOf("string");
    }
  });

  it("exports footer nav items with label + href", () => {
    expect(footerNavItems.length).toBeGreaterThan(0);

    for (const item of footerNavItems) {
      expect(item.label).toBeTypeOf("string");
      expect(item.href).toBeTypeOf("string");
    }
  });
});
