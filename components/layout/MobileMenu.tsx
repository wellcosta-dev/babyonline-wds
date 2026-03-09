"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, User, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { categories } from "@/lib/mock-data";

export function MobileMenu() {
  const isOpen = useUiStore((s) => s.isMobileMenuOpen);
  const closeMobileMenu = useUiStore((s) => s.closeMobileMenu);
  const itemCount = useCartStore((s) => s.itemCount());
  const toggleCartDrawer = useUiStore((s) => s.toggleCartDrawer);

  const handleCartClick = () => {
    closeMobileMenu();
    toggleCartDrawer();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-neutral-dark/60 backdrop-blur-sm z-50 lg:hidden"
            aria-hidden="true"
          />

          {/* Menu panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-heavy z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-pale">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/babyonline-logo.png"
                    alt="BabyOnline.hu"
                    width={220}
                    height={56}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-primary-pale transition-colors"
                  aria-label="Menü bezárása"
                >
                  <X className="size-6 text-neutral-dark" />
                </button>
              </div>

              {/* Menu links */}
              <nav className="flex-1 overflow-y-auto py-6">
                <div className="px-4 space-y-1">
                  <p className="text-xs font-semibold text-neutral-medium uppercase tracking-wider mb-3">
                    Kategóriák
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategoriak/${cat.slug}`}
                      onClick={closeMobileMenu}
                      className={cn(
                        "block px-4 py-3 rounded-xl",
                        "text-neutral-dark hover:bg-primary-pale hover:text-primary",
                        "font-medium transition-colors"
                      )}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    href="/akciok"
                    onClick={closeMobileMenu}
                    className={cn(
                      "block px-4 py-3 rounded-xl",
                      "text-secondary hover:bg-secondary/10",
                      "font-medium transition-colors"
                    )}
                  >
                    Akciók
                  </Link>
                </div>

                <div className="px-4 mt-8 pt-6 border-t border-neutral-pale">
                  <p className="text-xs font-semibold text-neutral-medium uppercase tracking-wider mb-3">
                    Fiók
                  </p>
                  <div className="space-y-1">
                    <Link
                      href="/bejelentkezes"
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        "text-neutral-dark hover:bg-primary-pale hover:text-primary",
                        "transition-colors"
                      )}
                    >
                      <User className="size-5" />
                      <span>Bejelentkezés</span>
                    </Link>
                    <Link
                      href="/kivansaglista"
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl",
                        "text-neutral-dark hover:bg-primary-pale hover:text-primary",
                        "transition-colors"
                      )}
                    >
                      <Heart className="size-5" />
                      <span>Kedvencek</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleCartClick}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left",
                        "text-neutral-dark hover:bg-primary-pale hover:text-primary",
                        "transition-colors"
                      )}
                    >
                      <ShoppingBag className="size-5" />
                      <span>Kosár</span>
                      {itemCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {itemCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
