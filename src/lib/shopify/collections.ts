import { shopifyFetch } from "./client";
import { PRODUCT_FRAGMENT, IMAGE_FRAGMENT } from "./fragments";
import type { Collection, Connection } from "./types";

// ─── Queries ────────────────────────────────────────────────────────

const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            ...ImageFields
          }
          products(first: 20) {
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
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

const GET_COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $productsFirst: Int!) {
    collectionByHandle(handle: $handle) {
      id
      handle
      title
      description
      image {
        ...ImageFields
      }
      products(first: $productsFirst) {
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
  }
  ${PRODUCT_FRAGMENT}
  ${IMAGE_FRAGMENT}
`;

// ─── Functions ──────────────────────────────────────────────────────

export async function getCollections(
  first: number = 20
): Promise<Connection<Collection>> {
  const data = await shopifyFetch<{ collections: Connection<Collection> }>(
    GET_COLLECTIONS_QUERY,
    { first }
  );
  return data.collections;
}

export async function getCollectionByHandle(
  handle: string,
  productsFirst: number = 20
): Promise<Collection | null> {
  const data = await shopifyFetch<{
    collectionByHandle: Collection | null;
  }>(GET_COLLECTION_BY_HANDLE_QUERY, { handle, productsFirst });
  return data.collectionByHandle;
}
