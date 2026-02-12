import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Enforce co-location: only match .test.ts files that live next to source
    // Explicitly exclude __tests__ directories to enforce co-location
    include: ["src/**/*.test.ts"],
    exclude: ["**/__tests__/**", "**/node_modules/**"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/lib/shopify/**/*.ts"],
      exclude: [
        "src/lib/shopify/types.ts",
        "src/lib/shopify/fragments.ts",
        "src/lib/shopify/index.ts",
        "src/**/*.test.ts",
      ],
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
