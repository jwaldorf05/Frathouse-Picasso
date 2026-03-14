export interface ShopNavItem {
  label: string;
  href: string;
}

export interface ProductSizeOption {
  size: string;
  price?: string;
}

export interface ProductGalleryImage {
  id: string;
  title: string;
  image: string | null;
}

export interface InventoryProduct {
  id: string;
  handle: string;
  name: string;
  // Base display and starting checkout price. Used when no size override exists.
  defaultPrice: string;
  image: string | null;
  category: string;
  shortDescription: string;
  description: string;
  materials: string[];
  // Collections this product belongs to
  collections: string[];
  // Optional size matrix. Set `price` only when a size should cost more/less than defaultPrice.
  sizeOptions?: ProductSizeOption[];
  // Optional gallery driving thumbnail labels and image order on the item page.
  gallery?: ProductGalleryImage[];
}

// Centralized editable inventory source of truth for storefront views.
// Editing notes:
// 1) Keep `defaultPrice` as the visual anchor price used on cards and as PDP fallback.
// 2) Use `sizeOptions.price` only for true size-based cost differences.
// 3) `gallery.title` appears in the UI thumbnail label, so keep titles short and intentional.
export const inventoryProducts: InventoryProduct[] = [
  {
    id: "1",
    handle: "eliot-st",
    name: "ELIOT ST",
    defaultPrice: "$95",
    image: "/Product Photos/EliotSt/EliotStMockup.png",
    category: "Street Signs",
    shortDescription: "Classic street sign with authentic urban aesthetic.",
    description:
      "The Eliot St sign captures the essence of city navigation with hand-finished detailing. Each sign is crafted to bring that authentic street corner vibe to your space.",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection", "Hottest"],
    sizeOptions: [
      { size: '10" × 30"' },
      { size: '12" × 36"', price: "$125" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/EliotSt/EliotStMockup.png" },
    ],
  },
  {
    id: "2",
    handle: "enjoy-cocaine",
    name: "ENJOY COCAINE",
    defaultPrice: "$200",
    image: "/Product Photos/EnjoyCocaine/Enjoy_Cocaine_Mockup.png",
    category: "Street Signs",
    shortDescription: "Parody sign with bold statement graphics.",
    description:
      "A tongue-in-cheek take on classic advertising, the Enjoy Cocaine sign brings irreverent humor to any wall. Hand-crafted with attention to vintage signage details.",
    materials: ["Aluminum street sign blank", "High-grade vinyl graphics", "UV-resistant coating"],
    collections: ["All", "Best Sellers", "Fraternity Collection", "Hottest"],
    sizeOptions: [
      { size: '24" × 24"' },
      { size: '30" × 30"', price: "$250" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/EnjoyCocaine/Enjoy_Cocaine_Mockup.png" },
    ],
  },
  {
    id: "3",
    handle: "frat-fluids",
    name: "FRAT FLUIDS",
    defaultPrice: "$75",
    image: "/Product Photos/FratFluids/Frat Fluids Mockup.png",
    category: "Street Signs",
    shortDescription: "Warning sign with fraternity house humor.",
    description:
      "The Frat Fluids sign combines hazard signage aesthetics with college culture comedy. Perfect for the basement bar or common room that needs a conversation starter.",
    materials: ["Aluminum street sign blank", "Screen-printed graphics", "Powder-coated finish"],
    collections: ["All", "New Releases", "Fraternity Collection", "Hottest"],
    sizeOptions: [
      { size: '10" × 14"' },
      { size: '12" × 18"', price: "$100" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/FratFluids/Frat Fluids Mockup.png" },
    ],
  },
  {
    id: "4",
    handle: "pledges-leash",
    name: "PLEDGE'S LEASH",
    defaultPrice: "$100",
    image: "/Product Photos/PledgesLeash/Pledge_Sign_Mockup.jpg",
    category: "Street Signs",
    shortDescription: "Parking-style sign with Greek life twist.",
    description:
      "Pledge's Leash brings parking lot humor to the fraternity house. This sign is built with the same specs as municipal signage for that authentic street-lifted look.",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "All-weather construction"],
    collections: ["All", "Fraternity Collection", "Hottest"],
    sizeOptions: [
      { size: '12" × 18"' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/PledgesLeash/Pledge_Sign_Mockup.jpg" },
    ],
  },
  {
    id: "5",
    handle: "rage-cage",
    name: "RAGE CAGE",
    defaultPrice: "$75",
    image: "/Product Photos/RageCage/RageCageMockup.png",
    category: "Street Signs",
    shortDescription: "Warning sign for the party zone.",
    description:
      "Rage Cage marks the territory where things get wild. Built with durable materials to withstand whatever chaos unfolds in your designated party space.",
    materials: ["Aluminum street sign blank", "High-impact graphics", "Scratch-resistant coating"],
    collections: ["All", "Best Sellers", "Fraternity Collection", "Hottest"],
    sizeOptions: [
      { size: '10" × 14"' },
      { size: '12" × 18"', price: "$100" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/RageCage/RageCageMockup.png" },
    ],
  },
  {
    id: "6",
    handle: "three-way",
    name: "THREE WAY",
    defaultPrice: "$95",
    image: "/Product Photos/ThreeWay/Threeway_Right_Mockup.jpg",
    category: "Street Signs",
    shortDescription: "Directional arrow sign with double meaning.",
    description:
      "The Three Way sign plays on classic directional signage with a wink and a nod. Available in left or right arrow configurations to point wherever you need.",
    materials: ["Aluminum street sign blank", "Reflective directional arrows", "Weatherproof finish"],
    collections: ["All", "New Releases", "Fraternity Collection", "Hottest"],
    sizeOptions: [
      { size: '10" × 14" (Right)' },
      { size: '10" × 14" (Left)', price: "$95" },
      { size: '12" × 18" (Right)', price: "$105" },
      { size: '12" × 18" (Left)', price: "$105" },
    ],
    gallery: [
      { id: "right", title: "Right Arrow", image: "/Product Photos/ThreeWay/Threeway_Right_Mockup.jpg" },
      { id: "left", title: "Left Arrow", image: "/Product Photos/ThreeWay/Threeway_Left_Mockup.jpg" },
    ],
  },
  {
    id: "7",
    handle: "wizard-crossing",
    name: "WIZARD CROSSING",
    defaultPrice: "$95",
    image: "/Product Photos/WizardCrossing/Wizard_Sign_Mockup.jpg",
    category: "Street Signs",
    shortDescription: "Pedestrian crossing sign with magical twist.",
    description:
      "Wizard Crossing transforms the everyday crosswalk sign into something mystical. Perfect for Harry Potter fans or anyone who believes in a little magic on campus.",
    materials: ["Aluminum street sign blank", "Screen-printed wizard silhouette", "Reflective background"],
    collections: ["All", "Harvard Collection", "Hottest"],
    sizeOptions: [
      { size: '12" × 12"' },
      { size: '24" × 24"', price: "$145" },
      { size: '30" × 30"', price: "$175" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/WizardCrossing/Wizard_Sign_Mockup.jpg" },
    ],
  },
];

export function getProductPrice(
  product: InventoryProduct,
  selectedSize?: string | null
): string {
  if (!selectedSize || !product.sizeOptions?.length) {
    return product.defaultPrice;
  }

  return (
    product.sizeOptions.find((option) => option.size === selectedSize)?.price ??
    product.defaultPrice
  );
}

export function getInventoryProductById(id: string): InventoryProduct | undefined {
  return inventoryProducts.find((product) => product.id === id);
}

export function getInventoryProductByHandle(
  handle: string
): InventoryProduct | undefined {
  return inventoryProducts.find((product) => product.handle === handle);
}

export const collectionItems: ShopNavItem[] = [
  { label: "All", href: "/?shop=1&collection=all" },
  { label: "New Releases", href: "/?shop=1&collection=new-releases" },
  { label: "Best Sellers", href: "/?shop=1&collection=best-sellers" },
  { label: "Fraternity Collection", href: "/?shop=1&collection=fraternity" },
  { label: "Harvard Collection", href: "/?shop=1&collection=harvard" },
  { label: "Custom Design", href: "/custom" },
];

export function getProductsByCollection(collectionSlug?: string): InventoryProduct[] {
  if (!collectionSlug || collectionSlug === 'all') {
    return inventoryProducts;
  }
  
  const collectionMap: Record<string, string> = {
    'new-releases': 'New Releases',
    'best-sellers': 'Best Sellers',
    'fraternity': 'Fraternity Collection',
    'harvard': 'Harvard Collection',
    'hottest': 'Hottest',
  };
  
  const collectionName = collectionMap[collectionSlug];
  if (!collectionName) {
    return inventoryProducts;
  }
  
  return inventoryProducts.filter(product => 
    product.collections.includes(collectionName)
  );
}

export const footerNavItems: ShopNavItem[] = [
  { label: "About", href: "#" },
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];
