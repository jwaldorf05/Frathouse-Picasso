"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getProductPrice,
  type InventoryProduct,
  type ProductGalleryImage,
} from "@/lib/shopData";

interface ItemDisplayClientProps {
  product: InventoryProduct;
  relatedItems: InventoryProduct[];
}

export default function ItemDisplayClient({
  product,
  relatedItems,
}: ItemDisplayClientProps) {
  const hasSizes = (product.sizeOptions?.length ?? 0) > 0;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const galleryFrames = useMemo<ProductGalleryImage[]>(
    () =>
      product.gallery?.length
        ? product.gallery
        : [{ id: "primary", title: "Primary", image: product.image }],
    [product.gallery, product.image]
  );

  const activeFrame = galleryFrames[activeImageIndex] ?? galleryFrames[0];
  const activePrice = getProductPrice(product, selectedSize);

  const canAddToCart = !hasSizes || selectedSize !== null;

  const decreaseQuantity = () => {
    setQuantity((previous) => Math.max(1, previous - 1));
  };

  const increaseQuantity = () => {
    setQuantity((previous) => previous + 1);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-8 md:px-10 md:pb-20 md:pt-10">
        <Link
          href="/?shop=1"
          className="inline-flex items-center gap-2 text-sm tracking-[1.2px] uppercase text-text-secondary transition-colors hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Continue shopping
        </Link>

        <section className="mt-6 grid grid-cols-1 gap-8 md:mt-8 md:grid-cols-[1.1fr_1fr] md:gap-10">
          <div>
            <div className="rounded-xl border border-[#1c1c1c] bg-[#0d0d0d] p-3">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                {activeFrame.image ? (
                  <Image
                    src={activeFrame.image}
                    alt={`${product.name} ${activeFrame.title.toLowerCase()}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <p className="font-[family-name:var(--font-body)] text-2xl font-bold text-white/20 md:text-3xl">
                      {product.name}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[2px] text-white/40">
                      {activeFrame.title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {galleryFrames.map((frame, index) => {
                const isActive = index === activeImageIndex;

                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className="group rounded-lg border p-2 text-left transition-colors"
                    style={{
                      borderColor: isActive ? "#ff4d4d" : "#2b2b2b",
                      background: "#0d0d0d",
                    }}
                    aria-label={`Show ${frame.title.toLowerCase()} image`}
                  >
                    <div className="relative aspect-[5/6] overflow-hidden rounded-md bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                      {frame.image ? (
                        <Image
                          src={frame.image}
                          alt={`${product.name} ${frame.title.toLowerCase()} thumbnail`}
                          fill
                          className="object-cover"
                          sizes="(min-width: 768px) 20vw, 30vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center px-2 text-center">
                          <span className="text-[10px] uppercase tracking-[1.5px] text-white/45">
                            {frame.title}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="mt-2 block text-[10px] uppercase tracking-[1.3px] text-text-secondary group-hover:text-white">
                      {frame.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col">
            <p className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase text-text-secondary">
              {product.category}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-body)] text-3xl font-bold leading-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 font-[family-name:var(--font-body)] text-base leading-relaxed text-text-primary">
              {product.shortDescription}
            </p>
            <p className="mt-6 font-[family-name:var(--font-body)] text-2xl font-bold text-white md:text-3xl">
              {activePrice}
            </p>

            {hasSizes ? (
              <div className="mt-8">
                <p className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase text-text-secondary">
                  Available sizes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizeOptions?.map((sizeOption) => {
                    const isSelected = selectedSize === sizeOption.size;

                    return (
                      <button
                        key={sizeOption.size}
                        type="button"
                        onClick={() =>
                          setSelectedSize((previous) =>
                            previous === sizeOption.size ? null : sizeOption.size
                          )
                        }
                        className="min-w-12 rounded-md border px-3 py-2 text-sm font-medium text-white transition-colors"
                        style={{ borderColor: isSelected ? "#ff4d4d" : "#333" }}
                        aria-pressed={isSelected}
                      >
                        {sizeOption.size}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && (
                  <p className="mt-2 text-xs text-[#ff6b6b]">
                    Please select a size before adding to cart.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-8 font-[family-name:var(--font-body)] text-sm text-text-secondary">
                This item is one-size / no size selection needed.
              </p>
            )}

            <div className="mt-8">
              <p className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase text-text-secondary">
                Quantity
              </p>
              <div className="mt-3 inline-flex items-center overflow-hidden rounded-md border border-[#333] bg-[#0d0d0d]">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="px-4 py-2 text-lg text-white transition-colors hover:bg-[#141414]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-12 border-x border-[#333] px-4 py-2 text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="px-4 py-2 text-lg text-white transition-colors hover:bg-[#141414]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={!canAddToCart}
                className="w-full rounded-md bg-[#ff4d4d] px-5 py-3 text-sm font-bold uppercase tracking-[1.4px] text-white transition-colors hover:bg-[#ff6666] disabled:cursor-not-allowed disabled:bg-[#6a2b2b]"
              >
                Add to cart · {quantity}
              </button>
            </div>

            <div className="mt-8 rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-5">
              <h2 className="font-[family-name:var(--font-body)] text-xs tracking-[2px] uppercase text-text-secondary">
                Product details
              </h2>
              <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-relaxed text-text-primary md:text-base">
                {product.description}
              </p>
              <ul className="mt-4 space-y-2">
                {product.materials.map((material) => (
                  <li
                    key={material}
                    className="font-[family-name:var(--font-body)] text-sm text-text-secondary"
                  >
                    • {material}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-[#1a1a1a] pt-8 md:mt-16 md:pt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-body)] text-xl font-bold md:text-2xl">
              You may also like
            </h2>
            <Link
              href="/?shop=1"
              className="text-xs tracking-[1.5px] uppercase text-text-secondary transition-colors hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.handle}`}
                className="group rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-4 transition-colors hover:border-[#2a2a2a]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                      <p className="font-[family-name:var(--font-body)] text-lg font-bold text-white/20">
                        {item.name}
                      </p>
                    </div>
                  )}
                </div>
                <p className="mt-3 font-[family-name:var(--font-body)] text-sm font-bold leading-tight text-white">
                  {item.name}
                </p>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-text-secondary">
                  {item.defaultPrice}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
