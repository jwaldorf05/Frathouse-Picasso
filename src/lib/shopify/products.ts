import { shopifyFetch } from "./client";
import { PRODUCT_FRAGMENT } from "./fragments";
import type { Connection, Product } from "./types";

// ─── Queries ────────────────────────────────────────────────────────

const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          ...ProductFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

const GET_PRODUCTS_BY_QUERY = `
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          ...ProductFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// ─── Functions ──────────────────────────────────────────────────────

export async function getProducts(
  first: number = 20,
  after?: string
): Promise<Connection<Product>> {
  const data = await shopifyFetch<{ products: Connection<Product> }>(
    GET_PRODUCTS_QUERY,
    { first, after }
  );
  return data.products;
}

export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  const data = await shopifyFetch<{ productByHandle: Product | null }>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    { handle }
  );
  return data.productByHandle;
}

export async function searchProducts(
  query: string,
  first: number = 20
): Promise<Connection<Product>> {
  const data = await shopifyFetch<{ products: Connection<Product> }>(
    GET_PRODUCTS_BY_QUERY,
    { query, first }
  );
  return data.products;
}
