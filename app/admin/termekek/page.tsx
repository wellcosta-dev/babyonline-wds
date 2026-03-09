"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Sparkles,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Package,
  Check,
  X,
  ImageIcon,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { products, categories } from "@/lib/mock-data";
import { cn, formatPrice } from "@/lib/utils";
import { StatusChip } from "@/app/admin/_components/StatusChip";

const ITEMS_PER_PAGE = 15;

export default function AdminTermekekPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchStatus = !statusFilter || (statusFilter === "active" && p.isActive) || (statusFilter === "inactive" && !p.isActive);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const getCategoryName = (categoryId: string) => categories.find((c) => c.id === categoryId)?.name ?? "-";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-neutral-dark tracking-tight">Termékkezelés</h1>
          <p className="text-sm text-neutral-medium">{filteredProducts.length} termék</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-dark bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="size-3.5" />
            Export
          </button>
          <Link href="/admin/termekek/uj" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-dark shadow-sm shadow-primary/20 transition-colors">
            <Plus className="size-3.5" />
            Új termék
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-medium" />
          <input
            type="search"
            placeholder="Keresés név vagy SKU alapján..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Összes kategória</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="">Összes státusz</option>
            <option value="active">Aktív</option>
            <option value="inactive">Inaktív</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
          <span className="text-xs font-bold text-primary">{selectedIds.size} termék kiválasztva</span>
          <button className="text-xs font-semibold text-primary hover:underline">Tömeges szerkesztés</button>
          <button className="text-xs font-semibold text-red-500 hover:underline">Törlés</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-neutral-medium hover:text-neutral-dark flex items-center gap-1">
            <X className="size-3" /> Mégse
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && selectedIds.size === paginatedProducts.length}
                    onChange={toggleSelectAll}
                    className="size-4 rounded-md border-gray-300 text-primary focus:ring-primary/20"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider">Termék</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider">SKU</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider">Kategória</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider">Ár</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider">Készlet</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider">Státusz</th>
                <th className="w-32 px-4 py-3 text-xs font-bold text-neutral-medium uppercase tracking-wider text-right">Művelet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="size-4 rounded-md border-gray-300 text-primary focus:ring-primary/20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="size-4 text-neutral-medium/50" />
                      </div>
                      <span className="text-xs font-bold text-neutral-dark tracking-tight line-clamp-1">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-neutral-medium bg-gray-100 px-1.5 py-0.5 rounded">{product.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-neutral-medium">{getCategoryName(product.categoryId)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-dark">{formatPrice(product.salePrice ?? product.price)}</span>
                      {product.salePrice && (
                        <span className="text-[10px] text-neutral-medium line-through">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 text-xs font-bold",
                      product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {product.stock === 0 ? "Nincs" : product.stock}
                      {product.stock > 0 && product.stock < 10 && <AlertTriangleIcon />}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip label={product.isActive ? "Aktív" : "Inaktív"} tone={product.isActive ? "success" : "neutral"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-dark hover:bg-gray-50 transition-colors" title="Szerkesztés">
                        <Pencil className="size-3.5" />
                        Szerkesztés
                      </button>
                      <button className="p-1.5 text-neutral-medium hover:text-neutral-dark hover:bg-gray-100 rounded-lg transition-colors" title="További műveletek">
                        <MoreHorizontal className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-[10px] text-neutral-medium">
              {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredProducts.length)} / {filteredProducts.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-neutral-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-[10px] text-neutral-medium px-1">...</span>}
                    <button
                      onClick={() => setPage(p)}
                      className={cn(
                        "size-7 rounded-lg text-[10px] font-bold transition-colors",
                        p === page ? "bg-primary text-white" : "text-neutral-medium hover:bg-gray-50 border border-gray-200"
                      )}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-neutral-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AlertTriangleIcon() {
  return (
    <svg className="size-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
