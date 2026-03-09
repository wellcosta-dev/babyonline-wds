"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Package,
  RotateCcw,
  ShieldCheck,
  Check,
  Clock,
  Star,
  ChevronDown,
  LoaderCircle,
} from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { RecommendedProducts } from "@/components/shop/RecommendedProducts";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { cn, formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { getProductBySlug, categories } from "@/lib/mock-data";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";
import { toAnalyticsItemFromProduct, trackEvent } from "@/lib/analytics";

const TABS = [
  { id: "leiras", label: "Leírás" },
  { id: "spec", label: "Specifikációk" },
  { id: "velemenyek", label: "Vélemények" },
] as const;

const SAMPLE_REVIEWS = [
  {
    author: "Katalin M.",
    rating: 5,
    date: "2024.02.28",
    text: "Nagyon elégedett vagyok a termékkel! Minőségben és árban is kiváló. A gyors szállítás miatt külön köszönöm.",
    avatar: "KM",
  },
  {
    author: "Péter K.",
    rating: 4,
    date: "2024.02.15",
    text: "Jó termék, pontosan azt kaptam amit vártam. Egy kisebb javaslat: a csomagolás lehetne még környezetbarátabb.",
    avatar: "PK",
  },
  {
    author: "Anna V.",
    rating: 5,
    date: "2024.02.01",
    text: "Már másodszor rendelek innen. Mindkét alkalommal gyorsan megérkezett és tökéletes állapotban. Ajánlom mindenkinek!",
    avatar: "AV",
  },
];

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "size-6" : size === "md" ? "size-5" : "size-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("leiras");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isCategoryNavigating, setIsCategoryNavigating] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="font-bold text-2xl md:text-3xl text-neutral-dark mb-4">
          Termék nem található
        </h1>
        <p className="text-neutral-medium mb-6">
          A keresett termék nem létezik vagy már nem elérhető.
        </p>
        <Link
          href="/termekek"
          className="btn-primary inline-flex items-center gap-2"
        >
          Vissza a termékekhez
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const hasSale = !!product.salePrice;
  const displayPrice = product.salePrice ?? product.price;
  const savings = hasSale ? product.price - product.salePrice! : 0;
  const inStock = product.stock > 0;
  const maxQuantity = product.stock > 0 ? product.stock : 99;

  const breadcrumbItems = [
    { label: "Főoldal", href: "/" },
    { label: "Termékek", href: "/termekek" },
    ...(category
      ? [{ label: category.name, href: `/kategoriak/${category.slug}` }]
      : []),
    { label: product.name },
  ];

  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.shortDesc ?? product.description,
    image: (product.images ?? []).slice(0, 5).map((image) => absoluteUrl(image)),
    brand: {
      "@type": "Brand",
      name: "BabyOnline.hu",
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/termekek/${product.slug}`),
      priceCurrency: "HUF",
      price: displayPrice,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating:
      product.rating && product.reviewCount
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating.toFixed(1)),
            reviewCount: product.reviewCount,
          }
        : undefined,
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href ?? `/termekek/${product.slug}`),
    })),
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    trackEvent("add_to_cart", {
      currency: "HUF",
      value: (product.salePrice ?? product.price) * quantity,
      items: [toAnalyticsItemFromProduct(product, { quantity, listName: "Product Detail" })],
    });
    setDrawerOpen(true);
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 1400);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    trackEvent("add_to_cart", {
      currency: "HUF",
      value: (product.salePrice ?? product.price) * quantity,
      items: [toAnalyticsItemFromProduct(product, { quantity, listName: "Product Detail Buy Now" })],
    });
    setDrawerOpen(false);
    router.push("/rendeles");
  };

  useEffect(() => {
    trackEvent("view_item", {
      currency: "HUF",
      value: product.salePrice ?? product.price,
      items: [toAnalyticsItemFromProduct(product, { listName: "Product Detail" })],
    });
  }, [product]);

  const handleCategoryNavigation = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    if (isCategoryNavigating) return;
    setIsCategoryNavigating(true);

    // Tiny delay so users see immediate feedback before route transition.
    window.setTimeout(() => {
      router.push(href);
    }, 160);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 md:py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
        />
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* LEFT: Gallery */}
          <div className="flex flex-col items-center justify-center">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* RIGHT: Product info */}
          <div className="space-y-5">
            {category && (
              <Link
                href={`/kategoriak/${category.slug}`}
                onClick={handleCategoryNavigation(`/kategoriak/${category.slug}`)}
                aria-busy={isCategoryNavigating}
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary bg-primary-pale/60 px-3 py-1 rounded-full transition-colors",
                  isCategoryNavigating
                    ? "pointer-events-none bg-primary-pale animate-pulse"
                    : "hover:bg-primary-pale"
                )}
              >
                {isCategoryNavigating && (
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                )}
                {isCategoryNavigating ? "Betöltés..." : category.name}
              </Link>
            )}

            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-dark tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating != null && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="md" />
                <a
                  href="#velemenyek"
                  onClick={() => setActiveTab("velemenyek")}
                  className="text-sm text-neutral-medium hover:text-primary transition-colors"
                >
                  {product.reviewCount ?? 0} vélemény
                </a>
              </div>
            )}

            {/* Price block */}
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl font-extrabold text-primary tracking-tight">
                {formatPrice(displayPrice)}
              </span>
              {hasSale && (
                <>
                  <span className="text-lg text-neutral-medium line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="px-2.5 py-1 text-sm font-bold rounded-md text-neutral-dark bg-accent">
                    -{Math.round((savings / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Stock badge */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg",
                  inStock
                    ? "bg-emerald-500 text-white"
                    : "bg-brand-cyan text-white"
                )}
              >
                {inStock ? (
                  <><Check className="size-3.5" strokeWidth={3} /> Raktáron</>
                ) : (
                  <><Clock className="size-3.5" strokeWidth={2.5} /> Előrendelhető</>
                )}
              </span>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 items-center pt-2 flex-wrap">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3.5 hover:bg-gray-50 transition-colors text-neutral-dark disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setQuantity(Math.max(1, Math.min(maxQuantity, v)));
                  }}
                  className="w-14 text-center font-semibold border-x border-gray-200 py-3.5 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  disabled={quantity >= maxQuantity}
                  className="p-3.5 hover:bg-gray-50 transition-colors text-neutral-dark"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={cn(
                  "flex-1 flex min-h-11 items-center justify-center gap-2 py-3.5 text-base font-bold rounded-xl text-white transition-colors",
                  inStock
                    ? "bg-primary hover:bg-primary-light"
                    : "bg-brand-cyan hover:bg-brand-cyan/80"
                )}
              >
                <ShoppingBag className="size-5" />
                {inStock ? "Kosárba teszem" : "Előrendelés"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:w-auto min-h-11 px-5 py-3.5 rounded-xl border border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors"
              >
                {inStock ? "Megveszem most" : "Előrendelem most"}
              </button>
            </div>

            <div className="flex items-center gap-3 pb-2">
              <WishlistButton productId={product.id} size="lg" />
              <span className="text-sm text-neutral-medium">Kívánságlistára</span>
            </div>

            {/* Benefits cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl px-4 py-4">
                <div className="size-11 rounded-xl bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                  <Truck className="size-5 text-brand-cyan" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-dark">Ingyenes szállítás</p>
                  <p className="text-xs text-neutral-medium">{formatPrice(FREE_SHIPPING_THRESHOLD)} felett</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-4">
                <div className="size-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-dark">30 napos visszaküldés</p>
                  <p className="text-xs text-neutral-medium">Kérdés nélkül</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-brand-pink/10 border border-brand-pink/20 rounded-2xl px-4 py-4">
                <div className="size-11 rounded-xl bg-brand-pink/20 flex items-center justify-center flex-shrink-0">
                  <Package className="size-5 text-brand-pink" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-dark">1-2 napos kiszállítás</p>
                  <p className="text-xs text-neutral-medium">Gyors feldolgozás</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-accent/10 border border-accent/20 rounded-2xl px-4 py-4">
                <div className="size-11 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="size-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-dark">Biztonságos fizetés</p>
                  <p className="text-xs text-neutral-medium">SSL titkosítás</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16" id="velemenyek">
          {/* Tab buttons */}
          <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-neutral-dark/70 hover:bg-gray-200 hover:text-neutral-dark"
                )}
              >
                {tab.id === "velemenyek"
                  ? `Vélemények (${product.reviewCount ?? 0})`
                  : tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
            {activeTab === "leiras" && (
              <div className="text-neutral-dark leading-relaxed text-[15px]">
                {product.description}
              </div>
            )}

            {activeTab === "spec" && (
              <div className="grid gap-0 divide-y divide-gray-100">
                <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] py-3.5">
                  <span className="text-sm font-semibold text-neutral-medium">Cikkszám</span>
                  <span className="text-sm text-neutral-dark">{product.sku}</span>
                </div>
                {product.weight != null && (
                  <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] py-3.5">
                    <span className="text-sm font-semibold text-neutral-medium">Súly</span>
                    <span className="text-sm text-neutral-dark">{product.weight} kg</span>
                  </div>
                )}
                {category && (
                  <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] py-3.5">
                    <span className="text-sm font-semibold text-neutral-medium">Kategória</span>
                    <span className="text-sm text-neutral-dark">{category.name}</span>
                  </div>
                )}
                {product.tags.length > 0 && (
                  <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] py-3.5">
                    <span className="text-sm font-semibold text-neutral-medium">Címkék</span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 bg-primary-pale/60 text-primary text-xs font-medium rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "velemenyek" && (
              <div className="space-y-5">
                {/* Summary */}
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                  <div className="text-center">
                    <div className="text-4xl font-extrabold text-neutral-dark tracking-tight">
                      {product.rating?.toFixed(1) ?? "0.0"}
                    </div>
                    <StarRating rating={product.rating ?? 0} size="sm" />
                    <p className="text-xs text-neutral-medium mt-1">{product.reviewCount ?? 0} vélemény</p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                  A lenti értékelések jelenleg mintavélemények a felület szemléltetésére.
                </div>
                {SAMPLE_REVIEWS.map((review, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 py-4 border-b border-gray-50 last:border-0"
                  >
                    <div className="size-10 rounded-full bg-primary-pale flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{review.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-neutral-dark">
                          {review.author}
                        </span>
                        <span className="text-xs text-neutral-medium">
                          {review.date}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      <p className="text-sm text-neutral-dark mt-2 leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended products */}
        {product.categoryId && (
          <RecommendedProducts
            currentProductId={product.id}
            categoryId={product.categoryId}
          />
        )}
      </div>

      {showAddedToast && (
        <div className="fixed left-4 right-4 bottom-24 md:bottom-6 z-[60] rounded-xl bg-neutral-dark/90 px-4 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm md:left-auto md:right-6 md:w-auto">
          A termék a kosárba került
        </div>
      )}

      {/* Sticky add to cart bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 md:hidden",
          showStickyBar ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Product info */}
              <div className="flex-1 min-w-0 hidden sm:block">
                <h3 className="text-sm font-bold text-neutral-dark truncate">{product.name}</h3>
                <span className="text-lg font-extrabold text-primary">{formatPrice(displayPrice)}</span>
              </div>
              {/* Mobile: just price */}
              <div className="flex-1 min-w-0 sm:hidden">
                <span className="text-lg font-extrabold text-primary">{formatPrice(displayPrice)}</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={quantity >= maxQuantity}
                  className="p-2.5 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              {/* Add to cart button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={cn(
                  "flex min-h-11 items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors",
                  inStock
                    ? "bg-primary hover:bg-primary-light"
                    : "bg-brand-cyan hover:bg-brand-cyan/80"
                )}
              >
                <ShoppingBag className="size-4" />
                {inStock ? "Kosárba teszem" : "Előrendelés"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
