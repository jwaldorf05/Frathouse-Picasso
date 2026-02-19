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
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["**/__tests__/**", "**/node_modules/**"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/app/api/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
