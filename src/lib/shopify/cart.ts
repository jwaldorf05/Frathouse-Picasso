import { shopifyFetch } from "./client";
import { CART_FRAGMENT } from "./fragments";
import type { Cart, CartLineInput, CartLineUpdateInput } from "./types";

// ─── Mutations ──────────────────────────────────────────────────────

const CREATE_CART_MUTATION = `
  mutation CreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const ADD_TO_CART_MUTATION = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const UPDATE_CART_LINES_MUTATION = `
  mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const REMOVE_CART_LINES_MUTATION = `
  mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
  ${CART_FRAGMENT}
`;

// ─── Helper ─────────────────────────────────────────────────────────

interface UserError {
  field: string[];
  message: string;
}

function handleUserErrors(userErrors: UserError[]) {
  if (userErrors.length > 0) {
    throw new Error(
      `Shopify user errors: ${userErrors.map((e) => e.message).join(", ")}`
    );
  }
}

// ─── Functions ──────────────────────────────────────────────────────

export async function createCart(lines: CartLineInput[] = []): Promise<Cart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: Cart; userErrors: UserError[] };
  }>(CREATE_CART_MUTATION, { lines });

  handleUserErrors(data.cartCreate.userErrors);
  return data.cartCreate.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: Cart | null }>(GET_CART_QUERY, {
    cartId,
  });
  return data.cart;
}

export async function addToCart(
  cartId: string,
  lines: CartLineInput[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: Cart; userErrors: UserError[] };
  }>(ADD_TO_CART_MUTATION, { cartId, lines });

  handleUserErrors(data.cartLinesAdd.userErrors);
  return data.cartLinesAdd.cart;
}

export async function updateCartLines(
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesUpdate: { cart: Cart; userErrors: UserError[] };
  }>(UPDATE_CART_LINES_MUTATION, { cartId, lines });

  handleUserErrors(data.cartLinesUpdate.userErrors);
  return data.cartLinesUpdate.cart;
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await shopifyFetch<{
    cartLinesRemove: { cart: Cart; userErrors: UserError[] };
  }>(REMOVE_CART_LINES_MUTATION, { cartId, lineIds });

  handleUserErrors(data.cartLinesRemove.userErrors);
  return data.cartLinesRemove.cart;
}
