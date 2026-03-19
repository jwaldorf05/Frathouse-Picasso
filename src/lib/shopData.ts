export interface ShopNavItem {
  label: string;
  href: string;
}

export interface ProductSizeOption {
  size: string;
  price?: string;
}

export interface ProductColorOption {
  color: string;
  price?: string;
}

export interface ProductFormatOption {
  format: string;
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
  // Optional color options
  colorOptions?: ProductColorOption[];
  // Optional format options (e.g., Left/Right for directional signs)
  formatOptions?: ProductFormatOption[];
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
    handle: "harvard-tstop",
    name: "HARVARD T STOP",
    defaultPrice: "$95",
    image: "/Product Photos/HarvardTStop/HarvardTStopMockup.png",
    category: "Street Signs",
    shortDescription: "I go to a school in Boston",
    description:
      "More fun than a banner, no?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      { size: '12" × 36"', price: "$125" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/HarvardTStop/HarvardTStopMockup.png" },
    ],
  },
  {
    id: "2",
    handle: "enjoy-cocaine",
    name: "ENJOY COCAINE",
    defaultPrice: "$200",
    image: "/Product Photos/EnjoyCocaine/Enjoy_Cocaine_Mockup.png",
    category: "Street Signs",
    shortDescription: "I'm more of a fan of the original Coca-Cola recipe personally",
    description:
      "Nothing like a little snow to get a party started! Perfect for your your friendly neighborhood cokehead.",
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
    shortDescription: "Alcohol, hopefully.",
    description:
      "A warning suitable for any punch bowl, bitch cup or fraternity basement.",
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
    name: "PLEDGES ON LEASH",
    defaultPrice: "$100",
    image: "/Product Photos/PledgesLeash/Pledge_Sign_Mockup.jpg",
    category: "Street Signs",
    shortDescription: "I don't make the rules. Now get on your knees.",
    description:
      "Show your pledges who's in charge. A top-tier gift for pledge masters everywhere. Note: we are not liable for the *voluntary activities* that ensue.",
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
    shortDescription: "You have been warned.",
    description:
      "The pledges knew what they signed up for, so you're not liable right? RIGHT?",
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
    defaultPrice: "$115",
    image: "/Product Photos/ThreeWay/Threeway_Right_Mockup.jpg",
    category: "Street Signs",
    shortDescription: "Is that a threat or a promise?",
    description:
      "The most confusing intersection in town. Put this in your room to invite guests, or put it up on the street and enjoy the chaos that ensues.",
    materials: ["Aluminum street sign blank", "Reflective directional arrows", "Weatherproof finish"],
    collections: ["All", "New Releases", "Fraternity Collection", "Hottest"],
    sizeOptions: [
      { size: '10" × 30"' },
      { size: '12" × 36"', price: "$135" },
    ],
    formatOptions: [
      { format: 'Right' },
      { format: 'Left' },
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
    defaultPrice: "$200",
    image: "/Product Photos/WizardCrossing/Wizard_Sign_Mockup.jpg",
    category: "Street Signs",
    shortDescription: "Who says wizards can't have rights too?",
    description:
      "How dare you insinuate that the sign didn't come this way? 100% muggle made (probably)",
    materials: ["Aluminum street sign blank", "Screen-printed wizard silhouette", "Reflective background"],
    collections: ["All", "Hottest"],
    sizeOptions: [
      { size: '24" × 24"'},
      { size: '30" × 30"', price: "$250" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/WizardCrossing/Wizard_Sign_Mockup.jpg" },
    ],
  },
  {
    id: "8",
    handle: "eliot-st",
    name: "ELIOT ST",
    defaultPrice: "$95",
    image: "/Product Photos/EliotSt/EliotStMockup.png",
    category: "Street Signs",
    shortDescription: "Floreat Domus De Eliot",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/EliotSt/EliotStMockup.png" },
    ],
  },
  {
    id: "9",
    handle: "kirkland-st",
    name: "KIRKLAND ST",
    defaultPrice: "$95",
    image: "/Product Photos/KirklandSt/KirklandStMockup.png",
    category: "Street Signs",
    shortDescription: "Incest fest?",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/KirklandSt/KirklandStMockup.png" },
    ],
  },
  {
    id: "10",
    handle: "Winthrop-st",
    name: "WINTHROP ST",
    defaultPrice: "$95",
    image: "/Product Photos/WinthropSt/WinthropStMockup.png",
    category: "Street Signs",
    shortDescription: "Throp on top",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/WinthropSt/WinthropStMockup.png" },
    ],
  },
  {
    id: "11",
    handle: "lowell-st",
    name: "LOWELL ST",
    defaultPrice: "$95",
    image: "/Product Photos/LowellSt/LowellStMockup.png",
    category: "Street Signs",
    shortDescription: "Suck my bells",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/LowellSt/LowellStMockup.png" },
    ],
  },
  {
    id: "12",
    handle: "quincy-st",
    name: "QUINCY ST",
    defaultPrice: "$95",
    image: "/Product Photos/QuincySt/QuincyStMockup.png",
    category: "Street Signs",
    shortDescription: "A house as hot as our breakfast",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/QuincySt/QuincyStMockup.png" },
    ],
  },
  {
    id: "13",
    handle: "adams-st",
    name: "ADAMS ST",
    defaultPrice: "$95",
    image: "/Product Photos/AdamsSt/AdamsStMockup.png",
    category: "Street Signs",
    shortDescription: "Bust a nut",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/AdamsSt/AdamsStMockup.png" },
    ],
  },
  {
    id: "14",
    handle: "leverett-st",
    name: "LEVERETT ST",
    defaultPrice: "$95",
    image: "/Product Photos/LeverettSt/LeverettStMockup.png",
    category: "Street Signs",
    shortDescription: "Level up bitch",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/LeverettSt/LeverettStMockup.png" },
    ],
  },
  {
    id: "15",
    handle: "dunster-st",
    name: "DUNSTER ST",
    defaultPrice: "$95",
    image: "/Product Photos/DunsterSt/DunsterStMockup.png",
    category: "Street Signs",
    shortDescription: "Get that big D",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/DunsterSt/DunsterStMockup.png" },
    ],
  },
  {
    id: "16",
    handle: "mather-st",
    name: "MATHER ST",
    defaultPrice: "$95",
    image: "/Product Photos/MatherSt/MatherStMockup.png",
    category: "Street Signs",
    shortDescription: "It's a good house, I swear!",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/MatherSt/MatherStMockup.png" },
    ],
  },
  {
    id: "17",
    handle: "currier-st",
    name: "CURRIER ST",
    defaultPrice: "$95",
    image: "/Product Photos/CurrierSt/CurrierStMockup.png",
    category: "Street Signs",
    shortDescription: "Definitely the next Bill Gates",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/CurrierSt/CurrierStMockup.png" },
    ],
  },
  {
    id: "18",
    handle: "phoho-st",
    name: "PHOHO ST",
    defaultPrice: "$95",
    image: "/Product Photos/PhohoSt/PhohoStMockup.png",
    category: "Street Signs",
    shortDescription: "Where my Phohomies at?",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/PhohoSt/PhohoStMockup.png" },
    ],
  },
  {
    id: "19",
    handle: "cabot-st",
    name: "CABOT ST",
    defaultPrice: "$95",
    image: "/Product Photos/CabotSt/CabotStMockup.png",
    category: "Street Signs",
    shortDescription: "Something's fishy here",
    description:
      "What better way is there to show your pride for the best house at Harvard than a sign of questionable legality?",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '10" × 30"' },
      // { size: '12" × 36"', price: "$125" },
    ],
    colorOptions: [
      { color: 'Blue' },
      { color: 'Green' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/CabotSt/CabotStMockup.png" },
    ],
  },
  {
    id: "20",
    handle: "throppy-toppy",
    name: "THROPPY TOPPY?",
    defaultPrice: "$200",
    image: "/Product Photos/ThroppyToppy/ThroppyToppyMockup.png",
    category: "Street Signs",
    shortDescription: "I did not have intercourse with that woman",
    description:
      "Becoming a Harvard man is a distinction I hope to achieve",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Best Sellers", "Harvard Collection"],
    sizeOptions: [
      { size: '24" × 24"' },
      { size: '30" × 30"', price: "$250" },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/ThroppyToppy/ThroppyToppyMockup.png" },
    ],
  },
  {
    id: "21",
    handle: "no-yalies",
    name: "NO YALIES",
    defaultPrice: "$50",
    image: "/Product Photos/NoYalies/NoYaliesMockup.png",
    category: "Street Signs",
    shortDescription: "Safety School",
    description:
      "Just to make it obvious they're not welcome here.",
    materials: ["Aluminum street sign blank", "Reflective sheeting", "Weather-resistant finish"],
    collections: ["All", "Harvard Collection"],
    sizeOptions: [
      { size: '12" × 12"' },
    ],
    gallery: [
      { id: "main", title: "Main View", image: "/Product Photos/NoYalies/NoYaliesMockup.png" },
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
  { label: "Metro Collection", href: "/?shop=1&collection=metro" },
  { label: "Custom Design", href: "/custom" },
  { label: "Merch", href: "/merch" },
  { label: "Stickers", href: "/stickers" },
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
  // { label: "About", href: "/about" },
  { label: "All", href: "/?shop=1&collection=all" },
  { label: "Fraternity Collection", href: "/?shop=1&collection=fraternity" },
  { label: "Harvard Collection", href: "/?shop=1&collection=harvard" },
];
