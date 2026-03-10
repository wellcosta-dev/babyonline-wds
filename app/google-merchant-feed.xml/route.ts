import { NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/seo";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import { getEffectiveCategories, getEffectiveProducts } from "@/lib/server/products";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toPriceHuf(value: number): string {
  return `${Math.max(0, Number(value || 0)).toFixed(2)} HUF`;
}

export async function GET() {
  const [products, categories] = await Promise.all([
    getEffectiveProducts(),
    Promise.resolve(getEffectiveCategories()),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c.name]));
  const activeProducts = products.filter((p) => p.isActive);

  const itemsXml = activeProducts
    .map((product) => {
      const link = absoluteUrl(`/termekek/${product.slug}`);
      const title = escapeXml(product.name);
      const description = escapeXml(
        stripHtml(product.shortDesc || product.description || product.name).slice(0, 5000)
      );
      const price = product.salePrice ?? product.price;
      const imageLink = absoluteUrl(product.images?.[0] || "/images/placeholder.jpg");
      const additionalImages = (product.images || [])
        .slice(1, 10)
        .map((image) => `      <g:additional_image_link>${escapeXml(absoluteUrl(image))}</g:additional_image_link>`)
        .join("\n");
      const productType = escapeXml(categoryById.get(product.categoryId) || "Babatermék");
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const shippingPrice = price >= FREE_SHIPPING_THRESHOLD ? 0 : 1490;

      return `    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
${additionalImages ? `${additionalImages}\n` : ""}      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${toPriceHuf(price)}</g:price>
${product.salePrice ? `      <g:sale_price>${toPriceHuf(product.salePrice)}</g:sale_price>\n` : ""}      <g:brand>BabyOnline.hu</g:brand>
      <g:mpn>${escapeXml(product.sku || product.id)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:product_type>${productType}</g:product_type>
      <g:shipping>
        <g:country>HU</g:country>
        <g:service>Standard</g:service>
        <g:price>${toPriceHuf(shippingPrice)}</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>BabyOnline.hu Product Feed</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <description>Google Merchant Center termek feed</description>
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=3600",
    },
  });
}
