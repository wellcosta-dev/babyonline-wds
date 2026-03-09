"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  ShoppingBag,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { useCartStore } from "@/store/cartStore";
import { useUiStore } from "@/store/uiStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { categories } from "@/lib/mock-data";
import { MobileMenu } from "./MobileMenu";
import { SearchBar } from "./SearchBar";

const NAV_CATEGORIES: Array<{ name: string; slug: string; isSale?: boolean }> = [
  ...categories.map((c) => ({ name: c.name, slug: c.slug })),
  { name: "Akciók", slug: "akciok", isSale: true },
];

export function Header() {
  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const toggleMobileMenu = useUiStore((s) => s.toggleMobileMenu);
  const [isHydrated, setIsHydrated] = useState(false);
  const mainHeaderRef = useRef<HTMLElement | null>(null);
  const [mainHeaderHeight, setMainHeaderHeight] = useState(88);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const element = mainHeaderRef.current;
    if (!element) return;
    const updateHeight = () => {
      setMainHeaderHeight(element.offsetHeight || 88);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <>
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-accent text-neutral-dark text-sm"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <span className="font-semibold text-center text-xs sm:text-sm">
              🚚 Ingyenes szállítás 20 000 Ft feletti rendelés esetén
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main header */}
      <motion.header
        ref={mainHeaderRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-primary sticky top-0 z-40 shadow-lg"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="focus-ring lg:hidden p-2 -ml-1 rounded-lg hover:bg-white/15 transition-colors shrink-0"
              aria-label="Menü megnyitása"
            >
              <Menu className="size-5 text-white" />
            </button>

            {/* Logo */}
            <Link
              href="/"
              onClick={() =>
                trackEvent("navigation_click", { location: "header", target: "home_logo" })
              }
              className="flex items-center gap-2 group min-w-0 flex-1 lg:flex-none"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 min-w-0"
              >
                <Image
                  src="/babyonline-logo.png"
                  alt="BabyOnline.hu"
                  width={320}
                  height={90}
                  priority
                  className="h-8 sm:h-9 md:h-14 lg:h-16 w-auto max-w-full"
                />
              </motion.div>
            </Link>

            {/* Search bar - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <SearchBar />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
              <Link
                href="/bejelentkezes"
                className="focus-ring p-1.5 sm:p-2 rounded-lg hover:bg-white/15 transition-colors"
                aria-label="Bejelentkezés"
              >
                <User className="size-4 sm:size-5 text-white/90" />
              </Link>
              <Link
                href="/kivansaglista"
                className="focus-ring hidden sm:block p-1.5 sm:p-2 rounded-lg hover:bg-white/15 transition-colors relative"
                aria-label="Kedvencek"
              >
                <Heart className="size-4 sm:size-5 text-white/90" />
                {isHydrated && wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-accent text-neutral-dark text-xs font-bold flex items-center justify-center px-1 shadow-md"
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </motion.span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => useCartStore.getState().toggleDrawer()}
                className="focus-ring p-1.5 sm:p-2 rounded-lg hover:bg-white/15 transition-colors relative"
                aria-label="Kosár"
              >
                <ShoppingBag className="size-4 sm:size-5 text-white/90" />
                {isHydrated && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-accent text-neutral-dark text-xs font-bold flex items-center justify-center px-1 shadow-md"
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <SearchBar />
          </div>
        </div>

      </motion.header>

      {/* Category navigation bar — separate from header */}
      <nav
        className="hidden md:block bg-white border-b border-gray-100 sticky z-30 shadow-sm"
        style={{ top: `${mainHeaderHeight}px` }}
      >
        <div className="container mx-auto px-4">
          <ul className="flex items-center md:justify-start lg:justify-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat.slug} className="flex-shrink-0">
                <Link
                  href={cat.isSale ? "/akciok" : `/kategoriak/${cat.slug}`}
                  onClick={() =>
                    trackEvent("navigation_click", {
                      location: "header_category_nav",
                      target: cat.slug,
                    })
                  }
                  className={cn(
                    "focus-ring block px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200",
                    cat.isSale
                      ? "bg-accent text-neutral-dark hover:bg-accent/80"
                      : "text-neutral-dark/80 hover:text-primary hover:bg-primary-pale/60"
                  )}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <MobileMenu />
    </>
  );
}
