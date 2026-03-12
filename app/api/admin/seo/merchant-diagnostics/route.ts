import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/api-auth";
import { getEffectiveProducts } from "@/lib/server/products";

function extractDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

function looksLikeValidGtin(value: string): boolean {
  return [8, 12, 13, 14].includes(value.length);
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const products = (await getEffectiveProducts()).filter((p) => p.isActive);

    const diagnostics = products.map((product) => {
      const issues: string[] = [];
      const price = Number(product.salePrice ?? product.price ?? 0);
      const primaryImage = product.images?.[0] ?? "";
      const gtinCandidate = extractDigits(product.sku || "");

      if (!product.name?.trim()) issues.push("missing_name");
      if (!product.slug?.trim()) issues.push("missing_slug");
      if (!primaryImage) issues.push("missing_primary_image");
      if (!product.sku?.trim()) issues.push("missing_sku");
      if (!Number.isFinite(price) || price <= 0) issues.push("invalid_price");
      if (!looksLikeValidGtin(gtinCandidate)) issues.push("gtin_not_detected");

      return {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        issues,
      };
    });

    const withIssues = diagnostics.filter((item) => item.issues.length > 0);
    return NextResponse.json({
      totalActiveProducts: products.length,
      productsWithIssues: withIssues.length,
      issueCounts: {
        missing_name: withIssues.filter((p) => p.issues.includes("missing_name")).length,
        missing_slug: withIssues.filter((p) => p.issues.includes("missing_slug")).length,
        missing_primary_image: withIssues.filter((p) => p.issues.includes("missing_primary_image")).length,
        missing_sku: withIssues.filter((p) => p.issues.includes("missing_sku")).length,
        invalid_price: withIssues.filter((p) => p.issues.includes("invalid_price")).length,
        gtin_not_detected: withIssues.filter((p) => p.issues.includes("gtin_not_detected")).length,
      },
      samples: withIssues.slice(0, 100),
    });
  } catch (error) {
    console.error("GET /api/admin/seo/merchant-diagnostics error:", error);
    return NextResponse.json(
      { error: "Nem sikerult a Merchant feed diagnozis lekérése." },
      { status: 500 }
    );
  }
}
