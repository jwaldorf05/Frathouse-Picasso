"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import {
  collectionItems,
  footerNavItems,
  inventoryProducts,
  getProductsByCollection,
  type InventoryProduct,
} from "@/lib/shopData";
import { getSprayPlacements } from "@/lib/sprays";

export const dynamic = 'force-dynamic';

interface SidebarProps {
  visible: boolean;
  cartCount: number;
  onCartClick: () => void;
  isMounted: boolean;
}

interface ShopLayoutProps {
  collection?: string;
  showHeroBanner?: boolean;
  isHomepage?: boolean;
}

function getCollectionTitle(collectionSlug?: string): string {
  if (!collectionSlug || collectionSlug === 'all') {
    return 'All Signs';
  }
  
  const titleMap: Record<string, string> = {
    'new-releases': 'New Releases',
    'best-sellers': 'Best Sellers',
    'fraternity': 'Fraternity Collection',
    'harvard': 'Harvard Collection',
  };
  
  return titleMap[collectionSlug] || 'All Signs';
}

// ─── Mobile Header ──────────────────────────────────────────────────

function MobileHeader({ onMenuClick, cartCount, onCartClick, isMounted }: {
  onMenuClick: () => void;
  cartCount: number;
  onCartClick: () => void;
  isMounted: boolean;
}) {
  return (
    <header className="md:hidden sticky top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Hamburger button - 44x44px touch target */}
        <button
          onClick={onMenuClick}
          className="w-11 h-11 flex items-center justify-center text-white"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Centered logo - clickable to home */}
        <a href="/?shop=1" className="flex items-center">
          <Image
            src="/FP_Borderless.png"
            alt="Frathouse Picasso"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </a>
        
        {/* Spacer to balance layout */}
        <div className="w-11" />
      </div>
    </header>
  );
}

// ─── Mobile Navigation Drawer ───────────────────────────────────────

function MobileNavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[90]"
          onClick={onClose}
        />
      )}
      
      {/* Drawer - slides from left */}
      <aside
        className="md:hidden fixed left-0 top-0 h-screen w-[280px] flex flex-col justify-between z-[100] bg-[#0a0a0a] border-r border-[#1a1a1a] transition-transform duration-300 ease-in-out overflow-hidden relative"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Caution tape decorations */}
        <img src="/stickers/Caution Tape 1.png" alt="" className="absolute top-14 left-0 w-full h-auto pointer-events-none z-[1] opacity-70" style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }} />
        <img src="/stickers/Caution Tape 2.png" alt="" className="absolute top-[44%] left-0 w-full h-auto pointer-events-none z-[1] opacity-65" style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }} />
        <img src="/stickers/Caution Tape 3.png" alt="" className="absolute bottom-20 left-0 w-full h-auto pointer-events-none z-[1] opacity-60" style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }} />
        {/* Murder Spray decoration */}
        <img src="/stickers/Murder Spray.png" alt="" className="absolute top-[28%] right-2 w-40 h-auto pointer-events-none z-[1] opacity-40" style={{ transform: 'rotate(-15deg)' }} />
        
        {/* Logo */}
        <div className="p-6 relative z-[110]">
          <Image src="/FP_Borderless.png" alt="Frathouse Picasso" width={180} height={60} className="w-[160px] h-auto" />
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 relative z-[110] overflow-y-auto">
          {/* Home - 44px min height */}
          <a href="/?shop=1" className="block w-full text-left px-3 py-3 min-h-[44px] flex items-center rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors text-[#999] hover:text-white hover:bg-[#1e1e1e]">
            Home
          </a>
          
          {/* About - 44px min height */}
          <a href="/about" className="block w-full text-left px-3 py-3 min-h-[44px] flex items-center rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors text-[#999] hover:text-white hover:bg-[#1e1e1e]">
            About
          </a>
          
          {/* Collections accordion */}
          <button onClick={() => setCollectionsOpen(!collectionsOpen)} className="w-full flex items-center justify-between px-3 py-3 min-h-[44px] rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors text-[#999] hover:text-white">
            Collections
            <svg className="w-4 h-4 transition-transform" style={{ transform: collectionsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {collectionsOpen && (
            <div className="pl-4">
              {collectionItems.map((item) => (
                <a key={item.label} href={item.href} className="block w-full text-left px-3 py-2 min-h-[44px] flex items-center rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1px] transition-colors text-[#999] hover:text-white hover:bg-[#1e1e1e]">
                  {item.label}
                </a>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────

function Sidebar({ visible, cartCount, onCartClick, isMounted }: SidebarProps) {
  const [activeNav, setActiveNav] = useState("All");
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <MobileHeader 
        onMenuClick={() => setMobileMenuOpen(true)}
        cartCount={cartCount}
        onCartClick={onCartClick}
        isMounted={isMounted}
      />
      
      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      
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
          className="absolute top-20 left-0 w-full h-auto pointer-events-none z-[1] opacity-65"
          style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 2.png"
          alt=""
          className="absolute top-[44%] left-0 w-full h-auto pointer-events-none z-[1] opacity-60"
          style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 3.png"
          alt=""
          className="absolute bottom-32 left-0 w-full h-auto pointer-events-none z-[1] opacity-70"
          style={{ transform: 'scaleX(1.05)', transformOrigin: 'left' }}
        />
        {/* Murder Spray decoration */}
        <img
          src="/stickers/Murder Spray.png"
          alt=""
          className="absolute top-[30%] right-4 w-48 h-auto pointer-events-none z-[1] opacity-35"
          style={{ transform: 'rotate(-12deg)' }}
        />
        {/* Brand logo */}
        <div className="p-6 relative z-[110]">
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
          {/* Home */}
          <a
            href="/?shop=1"
            className="block w-full text-left px-3 py-3 rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors text-[#999] hover:text-white hover:bg-[#1e1e1e]"
          >
            Home
          </a>
          
          {/* About */}
          <a
            href="/about"
            className="block w-full text-left px-3 py-3 rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase transition-colors text-[#999] hover:text-white hover:bg-[#1e1e1e]"
          >
            About
          </a>

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
                <a
                  key={item.label}
                  href={item.href}
                  className="block w-full text-left px-3 py-2 rounded-md font-[family-name:var(--font-body)] text-sm tracking-[1px] transition-colors text-[#999] hover:text-white hover:bg-[#1e1e1e]"
                >
                  {item.label}
                </a>
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

      {/* Mobile FAB Cart Button */}
      <button
        onClick={() => {
          console.log('Mobile FAB cart button clicked! Count:', cartCount);
          onCartClick();
        }}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent hover:bg-accent/90 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
        aria-label="Open cart"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0)',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        {isMounted && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-accent text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {cartCount}
          </span>
        )}
      </button>
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
        style={{ display: isOpen ? 'block' : 'none' }}
      />
      
      {/* Panel - slides from right on desktop, bottom on mobile */}
      <div 
        className={`fixed bg-[#0a0a0a] z-[110] flex flex-col overflow-hidden transition-transform duration-300 ease-in-out
                   bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t border-[#1a1a1a]
                   md:bottom-0 md:left-auto md:right-0 md:top-0 md:max-h-none md:w-full md:max-w-md md:border-l md:border-t-0 md:rounded-none
                   ${isOpen ? 'translate-y-0 md:translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'}`}
      >
        {/* Caution tape - only on desktop */}
        <img
          src="/stickers/Caution Tape 1.png"
          alt=""
          className="hidden md:block absolute top-20 left-0 w-full h-auto pointer-events-none z-[1] opacity-65"
          style={{ transform: 'scaleX(1.02)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 2.png"
          alt=""
          className="hidden md:block absolute top-[40%] left-0 w-full h-auto pointer-events-none z-[1] opacity-60"
          style={{ transform: 'scaleX(1.02)', transformOrigin: 'left' }}
        />
        <img
          src="/stickers/Caution Tape 3.png"
          alt=""
          className="hidden md:block absolute bottom-32 left-0 w-full h-auto pointer-events-none z-[1] opacity-70"
          style={{ transform: 'scaleX(1.02)', transformOrigin: 'left' }}
        />
        {/* Murder Spray decoration - desktop cart */}
        <img
          src="/stickers/Murder Spray.png"
          alt=""
          className="hidden md:block absolute top-[25%] right-6 w-56 h-auto pointer-events-none z-[1] opacity-30"
          style={{ transform: 'rotate(-10deg)' }}
        />
        
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-[#333] rounded-full" />
        </div>
        
        {/* Header - 44px min height for close button */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a] relative z-[110] bg-[#0a0a0a]/90 backdrop-blur-sm">
          <h2 className="font-[family-name:var(--font-body)] text-xl font-bold text-white">
            YOUR CART ({cartCount})
          </h2>
          <button 
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-white transition-colors"
            aria-label="Close cart"
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
              {cartItems.map((item: any) => {
                const product = inventoryProducts.find(p => p.handle === item.handle);
                return (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-[#0d0d0d] rounded-lg border border-[#1a1a1a]">
                    <div className="w-20 h-20 bg-[#111] rounded-md flex-shrink-0 overflow-hidden">
                      {product?.image ? (
                        <img 
                          src={product.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e]" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-[family-name:var(--font-body)] text-white text-sm font-bold">
                        {item.name}
                      </h3>
                    {item.selectedSize && (
                      <p className="text-text-secondary text-xs mt-1">Size: {item.selectedSize}</p>
                    )}
                    
                    {/* Quantity controls - 44x44px touch targets */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="inline-flex items-center border border-[#333] rounded-md overflow-hidden bg-[#0d0d0d]">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-11 h-11 flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-white text-sm min-w-[2rem] text-center border-x border-[#333]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-11 h-11 flex items-center justify-center text-white hover:bg-[#1a1a1a] transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-white text-sm font-bold">{item.unitPrice}</p>
                    </div>
                  </div>

                  {/* Remove button - 44x44px touch target */}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="w-11 h-11 flex items-center justify-center text-text-secondary hover:text-white transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                );
              })}
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
              className="w-full bg-accent hover:bg-accent/90 text-white font-[family-name:var(--font-body)] text-sm tracking-[1.5px] uppercase py-4 min-h-[44px] rounded-md transition-colors font-bold"
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
  const sprays = [
    '/stickers/Murder Spray.png',
    '/stickers/Pledge Leash Spray.png',
    '/stickers/Pong Spray.png',
    '/stickers/Radioactive Spray.png',
    '/stickers/SEND Spraypaint.png',
    '/stickers/Three Way Spray.png',
    '/stickers/Wizard Spraypaint.png'
  ];
  const sprayStickerIndex = Math.abs(product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % sprays.length;
  
  return (
    <Link
      href={`/items/${product.handle}`}
      className="flex-shrink-0 w-full md:w-[260px] group cursor-pointer block"
      aria-label={`View ${product.name}`}
    >
      {/* Product image */}
      <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[#111] relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-[family-name:var(--font-body)] font-bold text-white/20 text-2xl text-center px-4">
              {product.name}
            </span>
          </div>
        )}
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

function ProductCarousel({ products, collectionTitle, showTitle, showArrows = false }: { products: InventoryProduct[]; collectionTitle: string; showTitle: boolean; showArrows?: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

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
      {/* Header - only show on homepage */}
      {showTitle && (
        <div className="mb-6 px-1">
          <h2 className="font-[family-name:var(--font-body)] font-bold text-white text-2xl md:text-3xl">
            {collectionTitle}
          </h2>
        </div>
      )}

      {/* Carousel viewport with hover zones */}
      <div 
        className="overflow-hidden relative" 
        ref={emblaRef}
        onMouseMove={(e) => {
          if (!showArrows) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const width = rect.width;
          setShowLeftArrow(x < width * 0.15 && canScrollPrev);
          setShowRightArrow(x > width * 0.85 && canScrollNext);
        }}
        onMouseLeave={() => {
          if (showArrows) {
            setShowLeftArrow(false);
            setShowRightArrow(false);
          }
        }}
      >
        <div className="flex gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Left arrow - appears on hover */}
        {showArrows && showLeftArrow && (
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-black hover:border-white/40 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right arrow - appears on hover */}
        {showArrows && showRightArrow && (
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-black hover:border-white/40 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Right fade gradient */}
      {canScrollNext && (
        <div className="absolute right-0 top-[3.5rem] bottom-0 w-16 pointer-events-none bg-gradient-to-l from-[#0a0a0a] to-transparent" />
      )}
    </div>
  );
}

// ─── ShopLayout (main export) ───────────────────────────────────────

export default function ShopLayout({ visible, collection, showHeroBanner = true, isHomepage = false }: ShopLayoutProps & { visible: boolean }) {
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Homepage shows "Hottest" products, collection pages show filtered products
  const displayProducts = isHomepage 
    ? getProductsByCollection('hottest')
    : getProductsByCollection(collection);
  const collectionTitle = getCollectionTitle(collection);
  const pageSeed = collection ? collection.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 42;

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
        {isMounted && getSprayPlacements(9, pageSeed).map((spray, i) => (
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
          {/* Hero banner — only show on homepage */}
          {isHomepage && (
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
          )}

          {/* Collection Title - only show on collection pages */}
          {!isHomepage && (
            <div className="mt-8 mb-6">
              <h1 className="font-[family-name:var(--font-body)] font-bold text-white text-3xl md:text-4xl">
                {collectionTitle}
              </h1>
            </div>
          )}

          {/* Homepage: Carousel with "Hottest Right Now" */}
          {isHomepage && (
            <div className="py-10 md:py-14">
              <ProductCarousel products={displayProducts} collectionTitle="Hottest Right Now" showTitle={true} showArrows={true} />
            </div>
          )}

          {/* Collection Pages: Grid Layout */}
          {!isHomepage && (
            <div className="pb-10 md:pb-14">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-6 lg:gap-8 w-full">
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
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
                Where did we get them? Don't worry about it.
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
                    TikTok
                  </a>
                </li>
                <li>
                  <a href="/contact" className="font-[family-name:var(--font-body)] text-text-secondary text-sm hover:text-white transition-colors">
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
