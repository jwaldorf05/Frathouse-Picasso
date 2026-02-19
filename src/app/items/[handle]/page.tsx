import { notFound } from "next/navigation";
import {
  getInventoryProductByHandle,
  inventoryProducts,
} from "@/lib/shopData";
import ItemDisplayClient from "./ItemDisplayClient";

interface ItemPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export function generateStaticParams() {
  return inventoryProducts.map((product) => ({ handle: product.handle }));
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { handle } = await params;
  const product = getInventoryProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const relatedItems = inventoryProducts
    .filter((item) => item.handle !== product.handle)
    .slice(0, 3);

  return <ItemDisplayClient product={product} relatedItems={relatedItems} />;
}
