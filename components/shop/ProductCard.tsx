"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Check, Clock, Loader2, Truck } from "lucide-react";
import {
  cn,
  formatPrice,
  calculateDiscount,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toAnalyticsItemFromProduct, trackEvent } from "@/lib/analytics";
import { useWishlistStore } from "@/store/wishlistStore";

interface ProductCardProps {
  product: Product;
  listName?: string;
}

export function ProductCard({ product, listName = "Product Listing" }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const toggleWishlistItem = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.items.includes(product.id));
  const [imgError, setImgError] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const hasSale = !!product.salePrice;
  const discountAmount = hasSale
    ? calculateDiscount(product.price, product.salePrice!)
    : 0;
  const inStock = product.stock > 0;
  const qualifiesFreeShipping =
    (product.salePrice ?? product.price) >= FREE_SHIPPING_THRESHOLD;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    trackEvent("add_to_cart", {
      currency: "HUF",
      value: product.salePrice ?? product.price,
      items: [toAnalyticsItemFromProduct(product, { listName })],
    });
    setDrawerOpen(true);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 1400);
  };

  const handleNavigate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    trackEvent("select_item", {
      item_list_name: listName,
      source_path: pathname,
      items: [toAnalyticsItemFromProduct(product, { listName })],
    });
    router.push(`/termekek/${product.slug}`);
  }, [router, product, listName, pathname]);

  return (
    <div className="group">
      <a
        href={`/termekek/${product.slug}`}
        onClick={handleNavigate}
        className="relative block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
      >
        {showAddedToast && (
          <div className="absolute left-3 right-3 bottom-3 z-30 rounded-lg bg-neutral-dark/90 px-3 py-2 text-center text-xs font-semibold text-white backdrop-blur-sm">
            Termék a kosárba került
          </div>
        )}
        {/* Loading overlay */}
        {isNavigating && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
            <Loader2 className="size-6 text-neutral-dark animate-spin" />
          </div>
        )}

        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          {product.images?.length && !imgError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
              <span className="text-2xl text-slate-400">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Sale badge - top left */}
          {hasSale && (
            <span
              className="absolute left-2.5 top-2.5 z-10 rounded-md border border-amber-300 bg-amber-100 px-2.5 py-1 text-sm font-extrabold text-amber-900 shadow-sm"
            >
              -{discountAmount}%
            </span>
          )}

          {/* Wishlist button - top right */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlistItem(product.id);
            }}
            className="absolute right-2.5 top-2.5 z-10 rounded-full border border-gray-200 bg-white/95 p-1.5 text-neutral-medium shadow-sm backdrop-blur-sm transition-colors hover:border-gray-300 hover:text-rose-500"
          >
            <Heart
              className={cn(
                "size-4",
                isWishlisted && "fill-rose-500 text-rose-500"
              )}
            />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Info area */}
        <div className="p-3.5">
          <h3 className="mb-2.5 min-h-[2.8rem] line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-neutral-dark group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Stock badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                inStock
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              )}
            >
              {inStock ? (
                <><Check className="size-3" strokeWidth={3} /> Raktáron</>
              ) : (
                <><Clock className="size-3" strokeWidth={2.5} /> Előrendelhető</>
              )}
            </span>
            {qualifiesFreeShipping && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                <Truck className="size-3" strokeWidth={2.5} />
                Ingyenes szállítás
              </span>
            )}
          </div>

          {/* Price row + cart button */}
          <div className="border-t border-gray-100 pt-2 md:flex md:items-center md:justify-between md:gap-2">
            <div className="flex items-baseline gap-2 min-w-0 md:pt-0">
              {hasSale ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-extrabold text-primary">
                    {formatPrice(product.salePrice!)}
                  </span>
                  <span className="text-xs font-semibold text-neutral-medium line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-extrabold text-primary">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className={cn(
                "mt-2 md:mt-0 inline-flex min-h-11 w-full md:w-auto items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors",
                inStock
                  ? "bg-primary text-white hover:bg-primary-light"
                  : "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              )}
            >
              <ShoppingCart className="size-3.5" />
              {inStock ? "Kosárba" : "Előrendelés"}
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}
