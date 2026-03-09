"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Mail,
  Search,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  Settings2,
  ChevronDown,
  MapPin,
  Phone,
  CreditCard,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { StatusChip } from "@/app/admin/_components/StatusChip";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Függőben",
  CONFIRMED: "Megerősítve",
  PROCESSING: "Feldolgozás",
  SHIPPED: "Szállítás alatt",
  DELIVERED: "Kézbesítve",
  CANCELLED: "Törölve",
  REFUNDED: "Visszatérítve",
};

const statusStyles: Record<OrderStatus, { icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
  CONFIRMED: { icon: CheckCircle, color: "text-blue-700", bg: "bg-blue-50" },
  PROCESSING: { icon: Settings2, color: "text-orange-700", bg: "bg-orange-50" },
  SHIPPED: { icon: Truck, color: "text-purple-700", bg: "bg-purple-50" },
  DELIVERED: { icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
  CANCELLED: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-100" },
  REFUNDED: { icon: RotateCcw, color: "text-red-700", bg: "bg-red-50" },
};

const filterTabs = [
  { id: "all", label: "Összes" },
  { id: "PENDING", label: "Függőben" },
  { id: "PROCESSING", label: "Feldolgozás" },
  { id: "SHIPPED", label: "Szállítva" },
  { id: "DELIVERED", label: "Teljesítve" },
  { id: "CANCELLED", label: "Törölt" },
  { id: "REFUNDED", label: "Visszatérítve" },
];

export default function AdminRendelesekPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailState, setEmailState] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [statusSaving, setStatusSaving] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) throw new Error("Nem sikerült betölteni a rendeléseket.");
      const data = (await response.json()) as { orders: Order[] };
      setOrders(data.orders ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba történt.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setStatusSaving((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Nem sikerült frissíteni a státuszt.");
      const updated = (await response.json()) as Order;
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Hiba történt a státusz frissítésekor.");
    } finally {
      setStatusSaving((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function sendOrderEmail(orderId: string, type: "confirmation" | "status_update") {
    setEmailState((prev) => ({ ...prev, [orderId]: "sending" }));
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Nem sikerült emailt küldeni.");
      }
      setEmailState((prev) => ({ ...prev, [orderId]: "sent" }));
    } catch {
      setEmailState((prev) => ({ ...prev, [orderId]: "error" }));
    }
  }

  const tabCounts = filterTabs.map((tab) => ({
    ...tab,
    count: tab.id === "all" ? orders.length : orders.filter((o) => o.status === tab.id).length,
  }));

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const matchFilter = activeFilter === "all" || o.status === activeFilter;
        const matchSearch =
          !search ||
          o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          o.shippingAddress.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
      }),
    [orders, activeFilter, search]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-dark tracking-tight">Rendeléskezelés</h1>
          <p className="text-sm text-neutral-medium">{filteredOrders.length} rendelés</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
        >
          Frissítés
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-medium" />
          <input
            type="search"
            placeholder="Rendelésszám vagy vásárló..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tabCounts.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors",
                activeFilter === tab.id
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-white border border-gray-200 text-neutral-medium hover:bg-gray-50"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-1.5 px-1.5 py-0.5 rounded-md text-[9px]",
                  activeFilter === tab.id ? "bg-white/20" : "bg-gray-100"
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm text-neutral-medium">Rendelések betöltése...</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {notice && <div className="text-sm text-amber-700">{notice}</div>}

      <div className="space-y-2.5">
        {filteredOrders.map((order) => {
          const style = statusStyles[order.status] ?? statusStyles.PENDING;
          const StatusIcon = style.icon;
          const isExpanded = expandedOrder === order.id;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
            >
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold text-primary tracking-tight">{order.orderNumber}</span>
                    <StatusChip
                      label={statusLabels[order.status]}
                      tone={order.status === "CANCELLED" ? "neutral" : order.status === "DELIVERED" ? "success" : "info"}
                    />
                    <StatusChip
                      label={order.paymentStatus === "PAID" ? "Fizetve" : "Függőben"}
                      tone={order.paymentStatus === "PAID" ? "success" : "warning"}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-xs font-bold text-neutral-dark">{order.shippingAddress.name}</span>
                    <span className="text-[10px] text-neutral-medium">{order.items.length} termék</span>
                    <span className="text-[10px] text-neutral-medium">
                      {new Date(order.createdAt).toLocaleDateString("hu-HU")}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-extrabold text-neutral-dark tracking-tight">{formatPrice(order.total)}</span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="p-1.5 text-neutral-medium hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Státusz email"
                    onClick={() => sendOrderEmail(order.id, "status_update")}
                  >
                    <Mail className="size-3.5" />
                  </button>
                </div>

                <div className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")}>
                  <ChevronDown className="size-4 text-neutral-medium" />
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="p-4 rounded-xl bg-gray-50/80">
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="size-3.5 text-primary" />
                        <h4 className="text-[10px] font-bold text-neutral-dark uppercase tracking-wider">
                          Szállítási cím
                        </h4>
                      </div>
                      <div className="text-xs text-neutral-medium space-y-0.5">
                        <p className="font-semibold text-neutral-dark">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.postalCode} {order.shippingAddress.city}
                        </p>
                        <p className="flex items-center gap-1 mt-1.5">
                          <Phone className="size-3" /> {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/80">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="size-3.5 text-brand-cyan" />
                        <h4 className="text-[10px] font-bold text-neutral-dark uppercase tracking-wider">
                          Termékek
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex items-center justify-between text-xs">
                            <span className="text-neutral-dark font-medium">
                              {item.productName} <span className="text-neutral-medium">×{item.quantity}</span>
                            </span>
                            <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/80">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="size-3.5 text-brand-pink" />
                        <h4 className="text-[10px] font-bold text-neutral-dark uppercase tracking-wider">
                          Összesítő
                        </h4>
                      </div>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between text-neutral-medium">
                          <span>Részösszeg</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-neutral-medium">
                          <span>Szállítás</span>
                          <span>{formatPrice(order.shippingPrice)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Kedvezmény</span>
                            <span>-{formatPrice(order.discount)}</span>
                          </div>
                        )}
                        {order.loyaltyDiscount ? (
                          <div className="flex justify-between text-primary">
                            <span>Babapont levonás ({order.loyaltyPointsRedeemed ?? 0} pont)</span>
                            <span>-{formatPrice(order.loyaltyDiscount)}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between font-extrabold text-neutral-dark text-sm pt-1.5 border-t border-gray-200">
                          <span>Összesen</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                        {order.loyaltyPointsGranted && typeof order.loyaltyPointsEarned === "number" && (
                          <div className="text-[11px] font-semibold text-emerald-700">
                            +{order.loyaltyPointsEarned} Babapont jóváírva
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-neutral-medium uppercase tracking-wider">
                      Státusz módosítás:
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold rounded-xl border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={statusSaving[order.id]}
                    >
                      {(Object.entries(statusLabels) as [OrderStatus, string][]).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                      onClick={() => sendOrderEmail(order.id, "confirmation")}
                    >
                      Visszaigazolás újraküldése
                    </button>
                    {emailState[order.id] === "sending" && (
                      <span className="text-xs text-neutral-medium">Email küldése...</span>
                    )}
                    {emailState[order.id] === "sent" && (
                      <span className="text-xs text-emerald-600">Email elküldve.</span>
                    )}
                    {emailState[order.id] === "error" && (
                      <span className="text-xs text-red-600">Email küldési hiba.</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
