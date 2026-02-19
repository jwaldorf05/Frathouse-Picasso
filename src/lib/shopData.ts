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
    handle: "neon-drip-tee",
    name: "NEON DRIP TEE",
    defaultPrice: "$65",
    image: null,
    category: "Tops",
    shortDescription: "Soft cotton tee with hand-finished paint drip detailing.",
    description:
      "The Neon Drip Tee is cut from a heavyweight jersey and hand-marked in studio, so every piece lands a little different. Designed for daily wear with gallery-level detail.",
    materials: ["100% cotton", "Screen printed front", "Hand-painted accents"],
    sizeOptions: [
      { size: "S" },
      { size: "M" },
      { size: "L", price: "$69" },
      { size: "XL", price: "$72" },
    ],
    gallery: [
      { id: "front", title: "Studio Front", image: null },
      { id: "back", title: "Back Graphic", image: null },
      { id: "detail", title: "Paint Detail", image: null },
    ],
  },
  {
    id: "2",
    handle: "splatter-hoodie",
    name: "SPLATTER HOODIE",
    defaultPrice: "$120",
    image: null,
    category: "Outerwear",
    shortDescription: "Fleece hoodie featuring layered graffiti splatter motifs.",
    description:
      "Built with a relaxed fit and dense fleece body, the Splatter Hoodie balances comfort with statement texture. Each finish pass is done by hand for one-of-one character.",
    materials: ["80/20 cotton blend fleece", "Rib cuffs and hem", "Hand-finished splatter"],
    sizeOptions: [
      { size: "S" },
      { size: "M" },
      { size: "L", price: "$126" },
      { size: "XL", price: "$132" },
      { size: "2XL", price: "$136" },
    ],
    gallery: [
      { id: "look-01", title: "Main Look", image: null },
      { id: "look-02", title: "Sleeve Texture", image: null },
    ],
  },
  {
    id: "3",
    handle: "tagged-crewneck",
    name: "TAGGED CREWNECK",
    defaultPrice: "$95",
    image: null,
    category: "Tops",
    shortDescription: "Midweight crewneck with tonal tag graphics across chest.",
    description:
      "The Tagged Crewneck combines clean lines with custom typography rooted in street lettering. Versatile enough for layering and cut for an easy everyday silhouette.",
    materials: ["Midweight French terry", "Direct-to-garment print", "Pre-shrunk fabric"],
    sizeOptions: [
      { size: "S" },
      { size: "M" },
      { size: "L", price: "$99" },
      { size: "XL", price: "$103" },
    ],
  },
  {
    id: "4",
    handle: "stencil-cap",
    name: "STENCIL CAP",
    defaultPrice: "$45",
    image: null,
    category: "Accessories",
    shortDescription: "Classic six-panel cap with stencil logo embroidery.",
    description:
      "An everyday cap with custom stitch work inspired by stencil walls and transit markings. Finished with an adjustable strap for a secure fit across head sizes.",
    materials: ["100% cotton twill", "Embroidered front logo", "Adjustable back strap"],
  },
  {
    id: "5",
    handle: "mural-joggers",
    name: "MURAL JOGGERS",
    defaultPrice: "$85",
    image: null,
    category: "Bottoms",
    shortDescription: "Relaxed joggers with mural-inspired panel graphics.",
    description:
      "The Mural Joggers pair clean tailoring with painted panel motifs that nod to city walls after dark. Made for movement with a structured but comfortable feel.",
    materials: ["Cotton-poly fleece", "Elastic waistband", "Tapered leg opening"],
    sizeOptions: [
      { size: "S" },
      { size: "M" },
      { size: "L", price: "$89" },
      { size: "XL", price: "$93" },
    ],
  },
  {
    id: "6",
    handle: "canvas-jacket",
    name: "CANVAS JACKET",
    defaultPrice: "$180",
    image: null,
    category: "Outerwear",
    shortDescription: "Structured canvas jacket with paint marker details.",
    description:
      "A heavyweight layer built from durable canvas and hand-tagged accents. The Canvas Jacket is made to wear in and age with character over time.",
    materials: ["Heavy cotton canvas", "Metal zip closure", "Interior utility pocket"],
    sizeOptions: [
      { size: "M" },
      { size: "L", price: "$188" },
      { size: "XL", price: "$196" },
      { size: "2XL", price: "$204" },
    ],
  },
  {
    id: "7",
    handle: "throw-up-shorts",
    name: "THROW-UP SHORTS",
    defaultPrice: "$55",
    image: null,
    category: "Bottoms",
    shortDescription: "Mesh shorts with throw-up lettering at hemline.",
    description:
      "Lightweight and breathable, the Throw-Up Shorts are built for warm-weather sets and studio sessions. Graphic placement keeps the look loud without compromising comfort.",
    materials: ["Breathable mesh shell", "Soft inner lining", "Drawcord waistband"],
    sizeOptions: [
      { size: "S" },
      { size: "M" },
      { size: "L", price: "$59" },
      { size: "XL", price: "$63" },
    ],
  },
  {
    id: "8",
    handle: "wildstyle-tank",
    name: "WILDSTYLE TANK",
    defaultPrice: "$50",
    image: null,
    category: "Tops",
    shortDescription: "Athletic-cut tank with wildstyle inspired script.",
    description:
      "The Wildstyle Tank keeps things light with an athletic silhouette and high-impact lettering. It is designed to be worn solo or layered over long sleeves.",
    materials: ["100% ringspun cotton", "Curved hem", "Soft-wash finish"],
    sizeOptions: [
      { size: "S" },
      { size: "M" },
      { size: "L", price: "$54" },
      { size: "XL", price: "$58" },
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
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];

export const footerNavItems: ShopNavItem[] = [
  { label: "About", href: "#" },
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];
