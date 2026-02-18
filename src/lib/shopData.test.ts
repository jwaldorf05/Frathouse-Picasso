import { describe, it, expect } from "vitest";
import {
  collectionItems,
  footerNavItems,
  inventoryProducts,
} from "./shopData";

describe("shopData", () => {
  it("exports inventory products with expected shape", () => {
    expect(inventoryProducts.length).toBeGreaterThan(0);

    for (const product of inventoryProducts) {
      expect(product.id).toBeTypeOf("string");
      expect(product.name).toBeTypeOf("string");
      expect(product.price).toMatch(/^\$/);
      expect(product.image === null || typeof product.image === "string").toBe(true);
    }
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
