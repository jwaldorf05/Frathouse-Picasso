import { parsePriceToCents } from "@/lib/checkout";

export const CART_COOKIE_NAME = "fhp-cart";

export interface CartItem {
  id: string;
  handle: string;
  name: string;
  selectedSize: string | null;
  quantity: number;
  unitPrice: string;
  image: string | null;
}

export interface CartState {
  items: CartItem[];
}

export function getEmptyCart(): CartState {
  return { items: [] };
}

function generateLineId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.trim().split("=");

    if (rawName === name) {
      return rest.join("=");
    }
  }

  return null;
}

export function readCartFromCookieHeader(cookieHeader: string | null): CartState {
  const cookieValue = getCookieValue(cookieHeader, CART_COOKIE_NAME);

  if (!cookieValue) {
    return getEmptyCart();
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as CartState;

    if (!parsed || !Array.isArray(parsed.items)) {
      return getEmptyCart();
    }

    return {
      items: parsed.items.filter(
        (item) =>
          typeof item.id === "string" &&
          typeof item.handle === "string" &&
          typeof item.name === "string" &&
          (item.selectedSize === null || typeof item.selectedSize === "string") &&
          typeof item.quantity === "number" &&
          item.quantity > 0 &&
          typeof item.unitPrice === "string"
      ),
    };
  } catch {
    return getEmptyCart();
  }
}

export function serializeCartCookie(cart: CartState): string {
  return `${CART_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(cart))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}

export function addItemToCart(
  cart: CartState,
  item: Omit<CartItem, "id">
): CartState {
  const existing = cart.items.find(
    (line) =>
      line.handle === item.handle &&
      line.selectedSize === item.selectedSize &&
      line.unitPrice === item.unitPrice
  );

  if (existing) {
    return {
      items: cart.items.map((line) =>
        line.id === existing.id
          ? { ...line, quantity: line.quantity + item.quantity }
          : line
      ),
    };
  }

  return {
    items: [...cart.items, { ...item, id: generateLineId() }],
  };
}

export function updateCartLineQuantity(
  cart: CartState,
  lineId: string,
  quantity: number
): CartState {
  return {
    items: cart.items.map((line) =>
      line.id === lineId
        ? {
            ...line,
            quantity,
          }
        : line
    ),
  };
}

export function removeCartLine(cart: CartState, lineId: string): CartState {
  return {
    items: cart.items.filter((line) => line.id !== lineId),
  };
}

export function getCartItemCount(cart: CartState): number {
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

export function toStripeLineItems(cart: CartState) {
  return cart.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: "usd",
      unit_amount: parsePriceToCents(item.unitPrice),
      product_data: {
        name: item.selectedSize ? `${item.name} (${item.selectedSize})` : item.name,
        metadata: {
          handle: item.handle,
          ...(item.selectedSize ? { size: item.selectedSize } : {}),
        },
      },
    },
  }));
}
