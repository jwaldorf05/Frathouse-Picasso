"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import {
  collectionItems,
  footerNavItems,
  inventoryProducts,
  type InventoryProduct,
} from "@/lib/shopData";
import { getSprayPlacements } from "@/lib/sprays";

export const dynamic = 'force-dynamic';

// ─── Sidebar ────────────────────────────────────────────────────────

interface SidebarProps {
  visible: boolean;
  cartCount: number;
  onCartClick: () => void;
  isMounted: boolean;
}

function Sidebar({ visible, cartCount, onCartClick, isMounted }: SidebarProps) {
  const [activeNav, setActiveNav] = useState("All");
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col justify-between z-50 will-change-transform overflow-x-hidden"
        style={{
          background: "#0a0a0a",
          borderRight: "1px solid #1a1a1a",
          transform: visible ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Caution tape - edge to edge */}
        <img
          src="/stickers/Caution Tape 1.png"
          alt=""
          className="absolute top-14 left-0 w-full h-auto pointer-events-none z-[1] opacity-70"
          style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 2.png"
          alt=""
          className="absolute top-[44%] left-0 w-full h-auto pointer-events-none z-[1] opacity-65"
          style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 3.png"
          alt=""
          className="absolute bottom-20 left-0 w-full h-auto pointer-events-none z-[1] opacity-60"
          style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }}
        />
        {/* Brand logo */}
        <div className="p-6 relative z-[110]" style={{ background: 'radial-gradient(circle at 40% 50%, rgba(10,10,10,1) 0%, rgba(10,10,10,0.85) 55%, rgba(10,10,10,0) 100%)' }}>
          <Image
            src="/FP_Borderless.png"
            alt="Frathouse Picasso"
            width={180}
            height={60}
            className="w-[160px] h-auto"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 relative z-[110]">
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
        <div className="p-6 border-t border-[#1a1a1a] relative z-[110] bg-[#0a0a0a]/80 backdrop-blur-sm">
          <button 
            onClick={() => {
              console.log('Desktop cart button clicked! Count:', cartCount);
              onCartClick();
            }}
            className="flex items-center gap-2 font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase text-text-secondary hover:text-white transition-colors"
          >
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
              {isMounted ? cartCount : 0}
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
        <button 
          onClick={() => {
            console.log('Mobile cart button clicked! Count:', cartCount);
            onCartClick();
          }}
          className="relative"
        >
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
            {isMounted ? cartCount : 0}
          </span>
        </button>
      </nav>
    </>
  );
}

// ─── Cart Panel ─────────────────────────────────────────────────────

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cartCount: number;
}

function CartPanel({ isOpen, onClose, cartCount }: CartPanelProps) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  console.log('CartPanel render - isOpen:', isOpen, 'cartCount:', cartCount);

  useEffect(() => {
    console.log('CartPanel useEffect - isOpen:', isOpen);
    if (!isOpen) return;

    const loadCart = async () => {
      console.log('Loading cart items...');
      setIsLoading(true);
      try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        console.log('Cart panel loaded items:', data.items);
        setCartItems(data.items || []);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isOpen, cartCount]);

  const handleCheckout = async () => {
    console.log('Checkout button clicked');
    setCheckoutError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromCart: true }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Unable to start checkout');
      }
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      console.error('Checkout failed:', message);
      setCheckoutError(message);
    }
  };

  const handleUpdateQuantity = async (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(lineId);
      return;
    }

    try {
      const response = await fetch('/api/cart/lines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId, quantity: newQuantity }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Unable to update quantity');
      }

      setCartItems(data.items || []);
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { action: 'update' } }));
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (lineId: string) => {
    try {
      const response = await fetch('/api/cart/lines', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineId }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error ?? 'Unable to remove item');
      }

      setCartItems(data.items || []);
      window.dispatchEvent(new CustomEvent('cart-updated', { detail: { action: 'remove' } }));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (!isOpen) {
    console.log('CartPanel not rendering - isOpen is false');
    return null;
  }

  console.log('CartPanel rendering with', cartItems.length, 'items');

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[100]"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] z-[110] border-l border-[#1a1a1a] flex flex-col overflow-hidden">
        {/* Caution tape - edge to edge */}
        <img
          src="/stickers/Caution Tape 1.png"
          alt=""
          className="absolute top-20 left-0 w-full h-auto pointer-events-none z-[1] opacity-65"
          style={{ transform: 'scaleX(1.02)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 2.png"
          alt=""
          className="absolute top-[40%] left-0 w-full h-auto pointer-events-none z-[1] opacity-60"
          style={{ transform: 'scaleX(1.02)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 3.png"
          alt=""
          className="absolute bottom-32 left-0 w-full h-auto pointer-events-none z-[1] opacity-70"
          style={{ transform: 'scaleX(1.02)', transformOrigin: 'left' }}
        />
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a] relative z-[110] bg-[#0a0a0a]/90 backdrop-blur-sm">
          <h2 className="font-[family-name:var(--font-body)] text-xl font-bold text-white">
            YOUR CART ({cartCount})
          </h2>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 relative z-[110]">
          {isLoading ? (
            <p className="text-text-secondary text-center">Loading...</p>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">Your gallery is empty. Start your collection.</p>
              <button 
                onClick={onClose}
                className="text-accent hover:text-white transition-colors text-sm uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0d0d0d] rounded-lg border border-[#1a1a1a]">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-md flex-shrink-0" />
                  
                  <div className="flex-1">
                    <h3 className="font-[family-name:var(--font-body)] text-white text-sm font-bold">
                      {item.name}
                    </h3>
                    {item.selectedSize && (
                      <p className="text-text-secondary text-xs mt-1">Size: {item.selectedSize}</p>
                    )}
                    
                    {/* Quantity controls */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="inline-flex items-center border border-[#333] rounded-md overflow-hidden bg-[#0d0d0d]">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1 text-white hover:bg-[#1a1a1a] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-white text-sm min-w-[2rem] text-center border-x border-[#333]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1 text-white hover:bg-[#1a1a1a] transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-white text-sm font-bold">{item.unitPrice}</p>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center text-text-secondary hover:text-white transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-[#1a1a1a] relative z-[110]">
            {checkoutError && (
              <div className="mb-3 rounded-md border border-[#3b2222] bg-[#1a1111] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[1.4px] text-[#ffb4b4]">
                  Checkout Error
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {checkoutError}
                </p>
              </div>
            )}
            <button
              onClick={handleCheckout}
              className="w-full bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase py-4 rounded-md transition-colors font-bold"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Product Card ───────────────────────────────────────────────────

function ProductCard({
  product,
}: {
  product: InventoryProduct;
}) {
  const sprayStickerIndex = Math.abs(product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 4;
  const sprayStickers = [
    '/stickers/Pledge Leash Spray.png',
    '/stickers/SEND Spraypaint.png',
    '/stickers/Three Way Spray.png',
    '/stickers/Wizard Spraypaint.png'
  ];
  
  return (
    <Link
      href={`/items/${product.handle}`}
      className="flex-shrink-0 w-[220px] md:w-[260px] group cursor-pointer block"
      aria-label={`View ${product.name}`}
    >
      {/* Image placeholder */}
      <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-[#111] relative">
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
        {product.defaultPrice}
      </p>
    </Link>
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
    queueMicrotask(onSelect);
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
          {inventoryProducts.map((product) => (
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
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const syncCartCount = async () => {
      try {
        const response = await fetch('/api/cart');
        console.log('Cart API response status:', response.ok);
        if (!response.ok) {
          setCartCount(0);
          return;
        }
        const data = await response.json();
        console.log('Cart API data:', data);
        const totalItems = data.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) || 0;
        console.log('Total cart items:', totalItems);
        setCartCount(totalItems);
      } catch (error) {
        console.error('Cart API error:', error);
        setCartCount(0);
      }
    };

    syncCartCount();
    const interval = setInterval(syncCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Cart update event received:', customEvent.detail);
      if (customEvent.detail?.action === 'add') {
        setIsCartOpen(true);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const handleCartClick = () => {
    console.log('handleCartClick called, current isCartOpen:', isCartOpen);
    setIsCartOpen(!isCartOpen);
    console.log('Setting isCartOpen to:', !isCartOpen);
  };

  return (
    <>
      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartCount={cartCount} />
      <Sidebar visible={visible} cartCount={cartCount} onCartClick={handleCartClick} isMounted={isMounted} />

      <div
        className={`relative z-[2] shop-content ${visible ? "shop-content-visible" : ""} overflow-hidden`}
        style={{ background: "#0a0a0a" }}
      >
        {/* Background graffiti sprays */}
        {isMounted && getSprayPlacements(9, 42).map((spray, i) => (
          <img
            key={i}
            src={spray.src}
            alt=""
            className="absolute pointer-events-none z-0"
            style={{
              ...spray.pos,
              width: spray.size,
              height: 'auto',
              opacity: spray.opacity,
              transform: `rotate(${spray.rotation}deg) scale(${spray.scale})`,
            }}
          />
        ))}
        <div className="px-6 md:px-10 relative z-[3]">
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
                src="/FP_Borderless.png"
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
