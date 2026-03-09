"use client";

import type { Product } from "@/types";

type EventParams = Record<string, string | number | boolean | null | undefined | unknown[]>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (command: "event", eventName: string, params?: EventParams) => void;
  }
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...params });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export interface AnalyticsItemInput {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
  listName?: string;
}

export function toAnalyticsItem(item: AnalyticsItemInput) {
  return {
    item_id: item.id,
    item_name: item.name,
    item_category: item.category,
    price: item.price,
    quantity: item.quantity ?? 1,
    item_list_name: item.listName,
  };
}

export function toAnalyticsItemFromProduct(
  product: Product,
  options?: { quantity?: number; listName?: string }
) {
  return toAnalyticsItem({
    id: product.id,
    name: product.name,
    category: product.categoryId,
    price: product.salePrice ?? product.price,
    quantity: options?.quantity ?? 1,
    listName: options?.listName,
  });
}
