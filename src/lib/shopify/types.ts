// ─── Shared GraphQL types ───────────────────────────────────────────

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: { node: T; cursor: string }[];
  pageInfo: PageInfo;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

// ─── Image ──────────────────────────────────────────────────────────

export interface Image {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

// ─── Product ────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  selectedOptions: { name: string; value: string }[];
  image: Image | null;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  images: Connection<Image>;
  variants: Connection<ProductVariant>;
  options: { id: string; name: string; values: string[] }[];
  tags: string[];
  updatedAt: string;
}

// ─── Collection ─────────────────────────────────────────────────────

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image | null;
  products: Connection<Product>;
}

// ─── Cart ───────────────────────────────────────────────────────────

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      handle: string;
      title: string;
    };
    price: Money;
    image: Image | null;
    selectedOptions: { name: string; value: string }[];
  };
  cost: {
    totalAmount: Money;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  lines: Connection<CartLineItem>;
}

// ─── API input types ────────────────────────────────────────────────

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface CartLineUpdateInput {
  id: string;
  merchandiseId: string;
  quantity: number;
}
