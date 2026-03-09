"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Filter, X, Star, RotateCcw } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { categories } from "@/lib/mock-data";
import { trackEvent } from "@/lib/analytics";
import type { FilterState } from "@/types";

const AGE_GROUPS = [
  "0-3 hónap",
  "3-6 hónap",
  "6-12 hónap",
  "1-2 év",
  "2-3 év",
  "3+ év",
] as const;

const RATING_OPTIONS = [4, 3, 2, 1] as const;

const DEFAULT_PRICE_RANGE: [number, number] = [0, 100000];

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({ title, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3.5 text-left text-sm font-bold text-neutral-dark hover:text-primary transition-colors tracking-tight"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="size-4 text-neutral-medium" />
        ) : (
          <ChevronDown className="size-4 text-neutral-medium" />
        )}
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  priceBounds?: [number, number];
  onMobileClose?: () => void;
  isMobileDrawer?: boolean;
  hideCategoryFilter?: boolean;
}

export function ProductFilters({
  filters,
  onFilterChange,
  priceBounds = DEFAULT_PRICE_RANGE,
  onMobileClose,
  isMobileDrawer = false,
  hideCategoryFilter = false,
}: ProductFiltersProps) {
  const priceSpan = Math.max(1, priceBounds[1] - priceBounds[0]);

  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    age: true,
    rating: true,
    stock: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    const next = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    onFilterChange({ categories: next });
    trackEvent("filter_change", { filter_type: "category", value: categoryId, active_count: next.length });
  };

  const handlePriceMinChange = (value: number) => {
    const min = Math.min(value, filters.priceRange[1]);
    onFilterChange({ priceRange: [min, filters.priceRange[1]] });
    trackEvent("filter_change", { filter_type: "price_min", value: min });
  };

  const handlePriceMaxChange = (value: number) => {
    const max = Math.max(value, filters.priceRange[0]);
    onFilterChange({ priceRange: [filters.priceRange[0], max] });
    trackEvent("filter_change", { filter_type: "price_max", value: max });
  };

  const handleAgeToggle = (age: string) => {
    const next = filters.ageGroups.includes(age)
      ? filters.ageGroups.filter((a) => a !== age)
      : [...filters.ageGroups, age];
    onFilterChange({ ageGroups: next });
    trackEvent("filter_change", { filter_type: "age_group", value: age, active_count: next.length });
  };

  const handleRatingClick = (stars: number) => {
    const nextRating = filters.rating === stars ? null : stars;
    onFilterChange({
      rating: nextRating,
    });
    trackEvent("filter_change", { filter_type: "rating", value: nextRating ?? "none" });
  };

  const handleInStockToggle = () => {
    const nextValue = !filters.inStock;
    onFilterChange({ inStock: nextValue });
    trackEvent("filter_change", { filter_type: "in_stock", value: nextValue });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      priceRange: priceBounds,
      ageGroups: [],
      rating: null,
      inStock: false,
    });
    trackEvent("filter_clear");
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] !== priceBounds[0] ||
    filters.priceRange[1] !== priceBounds[1] ||
    filters.ageGroups.length > 0 ||
    filters.rating !== null ||
    filters.inStock;

  const panelContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-base text-neutral-dark tracking-tight">
          Szűrők
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition-colors"
            >
              <RotateCcw className="size-3" />
              Törlés
            </button>
          )}
          {isMobileDrawer && onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-neutral-medium"
              aria-label="Szűrők bezárása"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Category filter — pill chips */}
        {!hideCategoryFilter && (
          <FilterSection
            title="Kategória"
            isOpen={openSections.category}
            onToggle={() => toggleSection("category")}
          >
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isActive = filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-gray-100 text-neutral-dark/70 hover:bg-gray-200 hover:text-neutral-dark"
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* Price filter */}
        <FilterSection
          title="Ár"
          isOpen={openSections.price}
          onToggle={() => toggleSection("price")}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary">
                {formatPrice(filters.priceRange[0])}
              </span>
              <span className="text-xs text-neutral-medium">—</span>
              <span className="text-sm font-bold text-primary">
                {formatPrice(filters.priceRange[1])}
              </span>
            </div>
            <div className="relative pt-1 px-0.5">
              <div className="relative h-8 flex items-center">
                <div className="absolute w-full h-1.5 rounded-full bg-gray-200" />
                <div
                  className="absolute h-1.5 rounded-full bg-primary"
                  style={{
                    left: `${
                      ((filters.priceRange[0] - priceBounds[0]) /
                        priceSpan) *
                      100
                    }%`,
                    right: `${
                      ((priceBounds[1] - filters.priceRange[1]) /
                        priceSpan) *
                      100
                    }%`,
                  }}
                />
                <input
                  type="range"
                  min={priceBounds[0]}
                  max={filters.priceRange[1]}
                  step={500}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceMinChange(Number(e.target.value))}
                  className="range-thumb absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10"
                />
                <input
                  type="range"
                  min={filters.priceRange[0]}
                  max={priceBounds[1]}
                  step={500}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceMaxChange(Number(e.target.value))}
                  className="range-thumb absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer z-10"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Age filter — pill chips */}
        <FilterSection
          title="Korosztály"
          isOpen={openSections.age}
          onToggle={() => toggleSection("age")}
        >
          <div className="flex flex-wrap gap-1.5">
            {AGE_GROUPS.map((age) => {
              const isActive = filters.ageGroups.includes(age);
              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => handleAgeToggle(age)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                    isActive
                      ? "bg-brand-cyan text-white shadow-sm"
                      : "bg-gray-100 text-neutral-dark/70 hover:bg-gray-200 hover:text-neutral-dark"
                  )}
                >
                  {age}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Rating filter — star icons */}
        <FilterSection
          title="Értékelés"
          isOpen={openSections.rating}
          onToggle={() => toggleSection("rating")}
        >
          <div className="space-y-1">
            {RATING_OPTIONS.map((stars) => (
              <button
                key={stars}
                type="button"
                onClick={() => handleRatingClick(stars)}
                className={cn(
                  "flex w-full items-center gap-2.5 py-2 px-3 rounded-lg transition-all duration-200 text-left",
                  filters.rating === stars
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-gray-50"
                )}
              >
                <span className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i <= stars
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </span>
                <span className="text-xs font-semibold text-neutral-dark">
                  {stars}+ felett
                </span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* In stock toggle */}
        <FilterSection
          title="Készleten"
          isOpen={openSections.stock}
          onToggle={() => toggleSection("stock")}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-dark">
              Csak raktáron lévők
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={filters.inStock}
              onClick={handleInStockToggle}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                filters.inStock ? "bg-emerald-500" : "bg-gray-200"
              )}
            >
              <span
                className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 absolute top-0.5"
                style={{
                  left: filters.inStock ? "calc(100% - 22px)" : "2px",
                }}
              />
            </button>
          </div>
        </FilterSection>
      </div>
    </div>
  );

  if (isMobileDrawer) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 lg:hidden flex"
      >
        <div
          onClick={onMobileClose}
          className="flex-1 bg-black/40"
          aria-hidden="true"
        />
        <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 pb-3">
            {panelContent}
          </div>
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-dark hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="size-4" />
                Törlés
              </button>
              <button
                type="button"
                onClick={() => onMobileClose?.()}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-sm font-bold text-white hover:bg-primary-light transition-colors"
              >
                Alkalmaz
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-36">{panelContent}</div>
    </aside>
  );
}

interface ProductFiltersTriggerProps {
  onClick: () => void;
  activeCount?: number;
}

export function ProductFiltersTrigger({
  onClick,
  activeCount = 0,
}: ProductFiltersTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-neutral-dark hover:border-primary/30 transition-colors"
    >
      <Filter className="size-4" />
      Szűrők
      {activeCount > 0 && (
        <span className="size-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </button>
  );
}
