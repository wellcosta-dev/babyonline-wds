import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/api-auth";
import { updateProductById } from "@/lib/server/products";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateProductById(id, body);

    if (!updated) {
      return NextResponse.json({ error: "A termék nem található." }, { status: 404 });
    }

    return NextResponse.json({ product: updated });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { error: "Nem sikerült menteni a terméket." },
      { status: 500 }
    );
  }
}
