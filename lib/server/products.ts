import type { Category, Product } from "@/types";
import { categories as baseCategories, products as baseProducts } from "@/lib/mock-data";
import { readJsonFile, writeJsonFile } from "@/lib/server/storage";

const PRODUCT_OVERRIDES_FILE = "product-overrides.json";

type StoredProductsMap = Record<string, Product>;

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function normalizeTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry ?? "").trim())
    .filter(Boolean);
}

export function sanitizeProductPatch(input: Record<string, unknown>): Partial<Product> {
  const output: Partial<Product> = {};
  if (typeof input.name === "string") output.name = input.name.trim();
  if (typeof input.slug === "string") output.slug = input.slug.trim();
  if (typeof input.description === "string") output.description = input.description;
  if (typeof input.shortDesc === "string") output.shortDesc = input.shortDesc;
  if (typeof input.sku === "string") output.sku = input.sku.trim();
  if (typeof input.categoryId === "string") output.categoryId = input.categoryId.trim();
  if (Array.isArray(input.images)) output.images = normalizeTextArray(input.images);
  if (Array.isArray(input.tags)) output.tags = normalizeTextArray(input.tags);
  if (Array.isArray(input.ageGroups)) output.ageGroups = normalizeTextArray(input.ageGroups);
  if (typeof input.metaTitle === "string") output.metaTitle = input.metaTitle;
  if (typeof input.metaDescription === "string") output.metaDescription = input.metaDescription;
  if (typeof input.isActive === "boolean") output.isActive = input.isActive;
  if (typeof input.isFeatured === "boolean") output.isFeatured = input.isFeatured;

  const price = toOptionalNumber(input.price);
  if (price !== undefined) output.price = Math.max(0, price);

  const salePrice = toOptionalNumber(input.salePrice);
  output.salePrice = salePrice !== undefined ? Math.max(0, salePrice) : undefined;

  const stock = toOptionalNumber(input.stock);
  if (stock !== undefined) output.stock = Math.max(0, Math.floor(stock));

  const weight = toOptionalNumber(input.weight);
  output.weight = weight !== undefined ? Math.max(0, weight) : undefined;

  const rating = toOptionalNumber(input.rating);
  output.rating = rating !== undefined ? Math.min(5, Math.max(0, rating)) : undefined;

  const reviewCount = toOptionalNumber(input.reviewCount);
  output.reviewCount = reviewCount !== undefined ? Math.max(0, Math.floor(reviewCount)) : undefined;

  return output;
}

export async function getStoredProductOverrides(): Promise<StoredProductsMap> {
  return readJsonFile<StoredProductsMap>(PRODUCT_OVERRIDES_FILE, {});
}

export async function saveStoredProductOverrides(value: StoredProductsMap): Promise<void> {
  await writeJsonFile(PRODUCT_OVERRIDES_FILE, value);
}

export async function getEffectiveProducts(): Promise<Product[]> {
  const overrides = await getStoredProductOverrides();
  const map = new Map<string, Product>();

  for (const product of baseProducts) {
    map.set(product.id, product);
  }

  for (const [id, product] of Object.entries(overrides)) {
    map.set(id, product);
  }

  return Array.from(map.values());
}

export async function getEffectiveProductById(id: string): Promise<Product | undefined> {
  const all = await getEffectiveProducts();
  return all.find((entry) => entry.id === id);
}

export async function getEffectiveProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await getEffectiveProducts();
  return all.find((entry) => entry.slug === slug);
}

export async function updateProductById(
  id: string,
  patch: Record<string, unknown>
): Promise<Product | null> {
  const current = await getEffectiveProductById(id);
  if (!current) return null;

  const sanitized = sanitizeProductPatch(patch);
  const next: Product = {
    ...current,
    ...sanitized,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const overrides = await getStoredProductOverrides();
  overrides[id] = next;
  await saveStoredProductOverrides(overrides);
  return next;
}

export function getEffectiveCategories(): Category[] {
  return baseCategories;
}
