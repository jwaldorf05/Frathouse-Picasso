"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

// ─── Mock product data ──────────────────────────────────────────────

const mockProducts = [
  { id: "1", name: "NEON DRIP TEE", price: "$65", image: null },
  { id: "2", name: "SPLATTER HOODIE", price: "$120", image: null },
  { id: "3", name: "TAGGED CREWNECK", price: "$95", image: null },
  { id: "4", name: "STENCIL CAP", price: "$45", image: null },
  { id: "5", name: "MURAL JOGGERS", price: "$85", image: null },
  { id: "6", name: "CANVAS JACKET", price: "$180", image: null },
  { id: "7", name: "THROW-UP SHORTS", price: "$55", image: null },
  { id: "8", name: "WILDSTYLE TANK", price: "$50", image: null },
];

const collectionItems = [
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];

const footerNavItems = [
  { label: "About", href: "#" },
  { label: "All", href: "#" },
  { label: "Harvard Collection", href: "#" },
];

// ─── Sidebar ────────────────────────────────────────────────────────

function Sidebar({ visible }: { visible: boolean }) {
  const [activeNav, setActiveNav] = useState("All");
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col justify-between z-50 will-change-transform"
        style={{
          width: 240,
          background: "#0a0a0a",
          borderRight: "1px solid #1a1a1a",
          transform: visible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Brand logo */}
        <div className="p-6">
          <Image
            src="/FP_Borderless.png?v=2"
            alt="Frathouse Picasso"
            width={180}
            height={60}
            className="w-[160px] h-auto"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          {/* About */}
          <button
            onClick={() => setActiveNav("About")}
            className="w-full text-left px-3 py-3 rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors"
            style={{
              color: activeNav === "About" ? "#fff" : "#999",
              background: activeNav === "About" ? "#1e1e1e" : "transparent",
            }}
          >
            About
          </button>

          {/* Collections accordion */}
          <button
            onClick={() => setCollectionsOpen(!collectionsOpen)}
            className="w-full flex items-center justify-between px-3 py-3 rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors text-[#999] hover:text-white"
          >
            Collections
            <svg
              className="w-4 h-4 transition-transform"
              style={{ transform: collectionsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {collectionsOpen && (
            <div className="pl-4">
              {collectionItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className="w-full text-left px-3 py-2 rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1px] transition-colors"
                  style={{
                    color: activeNav === item.label ? "#fff" : "#999",
                    background: activeNav === item.label ? "#1e1e1e" : "transparent",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Cart */}
        <div className="p-6 border-t border-[#1a1a1a]">
          <button className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase text-text-secondary hover:text-white transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            CART
            <span className="ml-auto bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              0
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-3 will-change-transform"
        style={{
          background: "#0a0a0a",
          borderTop: "1px solid #1a1a1a",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <button
          onClick={() => setActiveNav("About")}
          className="font-[family-name:var(--font-body)] text-[10px] tracking-[1px] uppercase transition-colors"
          style={{ color: activeNav === "About" ? "#fff" : "#666" }}
        >
          About
        </button>
        {collectionItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveNav(item.label)}
            className="font-[family-name:var(--font-body)] text-[10px] tracking-[1px] uppercase transition-colors"
            style={{ color: activeNav === item.label ? "#fff" : "#666" }}
          >
            {item.label}
          </button>
        ))}
        <button className="relative">
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
            0
          </span>
        </button>
      </nav>
    </>
  );
}

// ─── Product Card ───────────────────────────────────────────────────

function ProductCard({
  product,
}: {
  product: { id: string; name: string; price: string; image: string | null };
}) {
  return (
    <div className="flex-shrink-0 w-[220px] md:w-[260px] group cursor-pointer">
      {/* Image placeholder */}
      <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-[family-name:var(--font-body)] font-bold text-white/20 text-2xl text-center px-4">
            {product.name}
          </span>
        </div>
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      </div>
      <h3 className="font-[family-name:var(--font-body)] font-bold text-white text-sm leading-tight">
        {product.name}
      </h3>
      <p className="font-[family-name:var(--font-body)] text-text-secondary text-sm mt-1">
        {product.price}
      </p>
    </div>
  );
}

// ─── Carousel ───────────────────────────────────────────────────────

function ProductCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="font-[family-name:var(--font-body)] font-bold text-white text-2xl md:text-3xl">
          HOTTEST RIGHT NOW
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Right fade gradient */}
      {canScrollNext && (
        <div className="absolute right-0 top-[3.5rem] bottom-0 w-16 pointer-events-none bg-gradient-to-l from-[#0a0a0a] to-transparent" />
      )}
    </div>
  );
}

// ─── ShopLayout (main export) ───────────────────────────────────────

interface ShopLayoutProps {
  visible: boolean;
}

export default function ShopLayout({ visible }: ShopLayoutProps) {
  return (
    <>
      <Sidebar visible={visible} />

      <div
        className={`relative z-[2] shop-content ${visible ? "shop-content-visible" : ""}`}
        style={{ background: "#0a0a0a" }}
      >
        <div className="px-6 md:px-10">
          {/* Hero banner — same horizontal alignment as carousel content */}
          <div
            className="w-full relative overflow-hidden rounded-lg mt-6"
            style={{ height: "45vh", minHeight: 300 }}
          >
            <Image
              src="/FP_Background.jpeg"
              alt="Frathouse Picasso"
              fill
              className="object-cover"
              sizes="(min-width: 768px) calc(100vw - 240px), 100vw"
            />
          </div>

          {/* Carousel section */}
          <div className="py-10 md:py-14">
            <ProductCarousel />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#1a1a1a] px-6 md:px-10 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand */}
            <div>
              <Image
                src="/FP_Borderless.png?v=2"
                alt="Frathouse Picasso"
                width={160}
                height={53}
                className="w-[120px] h-auto mb-4"
              />
              <p className="font-[family-name:var(--font-body)] text-text-muted text-sm leading-relaxed">
                Wearable art born from the culture. Every piece hand-finished, one of one.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-[family-name:var(--font-body)] text-white text-sm tracking-[1.5px] uppercase mb-4">
                Shop
              </h4>
              <ul className="space-y-2">
                {footerNavItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="font-[family-name:var(--font-body)] text-text-secondary text-sm hover:text-white transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact / Social */}
            <div>
              <h4 className="font-[family-name:var(--font-body)] text-white text-sm tracking-[1.5px] uppercase mb-4">
                Connect
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="font-[family-name:var(--font-body)] text-text-secondary text-sm hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="font-[family-name:var(--font-body)] text-text-secondary text-sm hover:text-white transition-colors">
                    Twitter / X
                  </a>
                </li>
                <li>
                  <a href="#" className="font-[family-name:var(--font-body)] text-text-secondary text-sm hover:text-white transition-colors">
                    TikTok
                  </a>
                </li>
                <li>
                  <a href="#" className="font-[family-name:var(--font-body)] text-text-secondary text-sm hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#1a1a1a] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-[family-name:var(--font-body)] text-text-muted text-xs">
              &copy; {new Date().getFullYear()} Frathouse Picasso. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-[family-name:var(--font-body)] text-text-muted text-xs hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="font-[family-name:var(--font-body)] text-text-muted text-xs hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="font-[family-name:var(--font-body)] text-text-muted text-xs hover:text-white transition-colors">
                Shipping & Returns
              </a>
            </div>
          </div>
        </footer>

        {/* Spacer for mobile bottom nav */}
        <div className="h-16 md:hidden" />
      </div>
    </>
  );
}
