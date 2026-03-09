"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  ImageIcon,
  Loader2,
  Save,
} from "lucide-react";
import Link from "next/link";
import type { Category, Product } from "@/types";
import { cn, formatPrice } from "@/lib/utils";
import { StatusChip } from "@/app/admin/_components/StatusChip";

const ITEMS_PER_PAGE = 15;

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  description: string;
  shortDesc: string;
  price: string;
  salePrice: string;
  stock: string;
  images: string;
  tags: string;
  ageGroups: string;
  weight: string;
  rating: string;
  reviewCount: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  isFeatured: boolean;
};

function formFromProduct(product: Product): ProductForm {
  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    sku: product.sku ?? "",
    categoryId: product.categoryId ?? "",
    description: product.description ?? "",
    shortDesc: product.shortDesc ?? "",
    price: String(product.price ?? ""),
    salePrice: product.salePrice !== undefined ? String(product.salePrice) : "",
    stock: String(product.stock ?? 0),
    images: (product.images ?? []).join("\n"),
    tags: (product.tags ?? []).join(", "),
    ageGroups: (product.ageGroups ?? []).join(", "),
    weight: product.weight !== undefined ? String(product.weight) : "",
    rating: product.rating !== undefined ? String(product.rating) : "",
    reviewCount: product.reviewCount !== undefined ? String(product.reviewCount) : "",
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    isActive: Boolean(product.isActive),
    isFeatured: Boolean(product.isFeatured),
  };
}

function splitInputList(value: string): string[] {
  return value
    .split(/[\n,]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function AdminTermekekPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch("/api/admin/products", { cache: "no-store" });
        const payload = (await response.json()) as {
          products?: Product[];
          categories?: Category[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Nem sikerült betölteni a termékeket.");
        }
        setProducts(payload.products ?? []);
        setCategories(payload.categories ?? []);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Betöltési hiba.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchStatus = !statusFilter || (statusFilter === "active" && p.isActive) || (statusFilter === "inactive" && !p.isActive);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

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
  const closeModal = () => {
    setEditingProduct(null);
    setForm(null);
    setSaveError("");
    setSaveSuccess("");
  };

  const openEditor = (product: Product) => {
    setEditingProduct(product);
    setForm(formFromProduct(product));
    setSaveError("");
    setSaveSuccess("");
  };

  async function handleSave() {
    if (!editingProduct || !form) return;
    setSaveLoading(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const response = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          sku: form.sku,
          categoryId: form.categoryId,
          description: form.description,
          shortDesc: form.shortDesc,
          price: Number(form.price || 0),
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
          stock: Number(form.stock || 0),
          images: splitInputList(form.images),
          tags: splitInputList(form.tags),
          ageGroups: splitInputList(form.ageGroups),
          weight: form.weight ? Number(form.weight) : undefined,
          rating: form.rating ? Number(form.rating) : undefined,
          reviewCount: form.reviewCount ? Number(form.reviewCount) : undefined,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
        }),
      });
      const payload = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !payload.product) {
        throw new Error(payload.error ?? "Mentési hiba.");
      }
      setProducts((prev) => prev.map((entry) => (entry.id === payload.product!.id ? payload.product! : entry)));
      setEditingProduct(payload.product);
      setForm(formFromProduct(payload.product));
      setSaveSuccess("Termék mentve.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Mentési hiba.");
    } finally {
      setSaveLoading(false);
    }
  }

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

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

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

      {loading && (
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-8 text-sm text-neutral-medium flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Termékek betöltése...
        </div>
      )}

      {/* Bulk actions */}
      {!loading && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl">
          <span className="text-xs font-bold text-primary">{selectedIds.size} termék kiválasztva</span>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-xs text-neutral-medium hover:text-neutral-dark flex items-center gap-1">
            <X className="size-3" /> Mégse
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && (
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
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-neutral-medium">
                    Nincs megjeleníthető termék.
                  </td>
                </tr>
              )}
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
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="size-10 rounded-xl object-cover bg-gray-100 flex-shrink-0 border border-gray-200"
                        />
                      ) : (
                        <div className="size-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="size-4 text-neutral-medium/50" />
                        </div>
                      )}
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
                      <button
                        type="button"
                        onClick={() => openEditor(product)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-neutral-dark hover:bg-gray-50 transition-colors"
                        title="Szerkesztés"
                      >
                        <Pencil className="size-3.5" />
                        Szerkesztés
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
      )}

      {editingProduct && form && (
        <div className="fixed inset-0 z-[95] bg-black/45 backdrop-blur-[1px] p-4 sm:p-6 grid place-items-center">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-neutral-dark tracking-tight">Termék szerkesztése</h2>
                <p className="text-xs text-neutral-medium">{editingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-neutral-medium hover:bg-gray-100 hover:text-neutral-dark"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-132px)] overflow-y-auto px-5 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Input label="Termék neve" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                <Input label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} />
                <Input label="SKU" value={form.sku} onChange={(value) => setForm({ ...form, sku: value })} />
                <Select
                  label="Kategória"
                  value={form.categoryId}
                  onChange={(value) => setForm({ ...form, categoryId: value })}
                  options={categories.map((category) => ({ label: category.name, value: category.id }))}
                />

                <Input label="Normál ár (Ft)" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
                <Input label="Akciós ár (Ft)" value={form.salePrice} onChange={(value) => setForm({ ...form, salePrice: value })} />
                <Input label="Készlet" value={form.stock} onChange={(value) => setForm({ ...form, stock: value })} />
                <Input label="Súly (kg)" value={form.weight} onChange={(value) => setForm({ ...form, weight: value })} />

                <Input label="Értékelés (0-5)" value={form.rating} onChange={(value) => setForm({ ...form, rating: value })} />
                <Input label="Értékelések száma" value={form.reviewCount} onChange={(value) => setForm({ ...form, reviewCount: value })} />

                <ToggleRow
                  label="Aktív termék"
                  checked={form.isActive}
                  onChange={(value) => setForm({ ...form, isActive: value })}
                />
                <ToggleRow
                  label="Kiemelt termék"
                  checked={form.isFeatured}
                  onChange={(value) => setForm({ ...form, isFeatured: value })}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <TextArea
                  label="Rövid leírás"
                  value={form.shortDesc}
                  onChange={(value) => setForm({ ...form, shortDesc: value })}
                  rows={3}
                />
                <TextArea
                  label="Termékleírás"
                  value={form.description}
                  onChange={(value) => setForm({ ...form, description: value })}
                  rows={7}
                />
                <TextArea
                  label="Képek URL-jei (soronként vagy vesszővel)"
                  value={form.images}
                  onChange={(value) => setForm({ ...form, images: value })}
                  rows={5}
                />
                <TextArea
                  label="Címkék (vesszővel)"
                  value={form.tags}
                  onChange={(value) => setForm({ ...form, tags: value })}
                  rows={2}
                />
                <TextArea
                  label="Korosztályok (vesszővel)"
                  value={form.ageGroups}
                  onChange={(value) => setForm({ ...form, ageGroups: value })}
                  rows={2}
                />
                <Input label="Meta title" value={form.metaTitle} onChange={(value) => setForm({ ...form, metaTitle: value })} />
                <TextArea
                  label="Meta description"
                  value={form.metaDescription}
                  onChange={(value) => setForm({ ...form, metaDescription: value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-xs">
                {saveError && <span className="text-red-600 font-semibold">{saveError}</span>}
                {!saveError && saveSuccess && <span className="text-emerald-600 font-semibold">{saveSuccess}</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-neutral-dark hover:bg-gray-50"
                >
                  Bezárás
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Mentés
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-dark">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-dark">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Válassz kategóriát</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-dark">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
      <span className="text-xs font-semibold text-neutral-dark">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-gray-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </label>
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
