export interface ShopNavItem {
  label: string;
  href: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  price: string;
  image: string | null;
}

// Centralized editable inventory source of truth for storefront views.
export const inventoryProducts: InventoryProduct[] = [
  { id: "1", name: "NEON DRIP TEE", price: "$65", image: null },
  { id: "2", name: "SPLATTER HOODIE", price: "$120", image: null },
  { id: "3", name: "TAGGED CREWNECK", price: "$95", image: null },
  { id: "4", name: "STENCIL CAP", price: "$45", image: null },
  { id: "5", name: "MURAL JOGGERS", price: "$85", image: null },
  { id: "6", name: "CANVAS JACKET", price: "$180", image: null },
  { id: "7", name: "THROW-UP SHORTS", price: "$55", image: null },
  { id: "8", name: "WILDSTYLE TANK", price: "$50", image: null },
];

export const collectionItems: ShopNavItem[] = [
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];

export const footerNavItems: ShopNavItem[] = [
  { label: "About", href: "#" },
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];
