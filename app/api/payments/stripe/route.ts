import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSiteUrl } from "@/lib/seo";
import { getOrderById, upsertStoredOrder } from "@/lib/server/orders";

function toStripeMinorUnits(value: number, currency: string): number {
  // In this project prices are stored in major units (e.g. 18 190 Ft).
  // Stripe Checkout for HUF in this account expects two decimal places.
  if (currency === "huf") return Math.round(value * 100);
  return Math.round(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currency = String(body.currency ?? "huf").toLowerCase();
    const orderId = String(body.orderId ?? "");
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "A rendelés nem található." }, { status: 404 });
    }
    const amount = Math.max(0, Math.round(Number(order.total ?? 0)));
    const amountMinor = toStripeMinorUnits(amount, currency);
    const orderNumber = order.orderNumber;
    const email = order.guestEmail ?? "";
    const siteUrl = getSiteUrl();
    const successUrl = `${siteUrl}/rendeles/megerosites?order=${encodeURIComponent(orderNumber)}`;
    const cancelUrl = `${siteUrl}/rendeles`;

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Az összegnek nagyobbnak kell lennie 0-nál." },
        { status: 400 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: "A Stripe nincs konfigurálva." }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);
    const lineItems = order.items.length > 0
      ? order.items.map((item) => ({
          quantity: Math.max(1, Number(item.quantity ?? 1)),
          price_data: {
            currency,
            product_data: {
              name: String(item.productName ?? "BabyOnline termék"),
            },
            unit_amount: Math.max(
              0,
              toStripeMinorUnits(Number(item.price ?? 0), currency)
            ),
          },
        }))
      : [
          {
            quantity: 1,
            price_data: {
              currency,
              product_data: { name: `Rendelés ${orderNumber}` },
              unit_amount: amountMinor,
            },
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: lineItems,
      customer_email: email || undefined,
      payment_method_types: ["card"],
      metadata: {
        orderId,
        orderNumber,
        email,
      },
      payment_intent_data: {
        metadata: {
          orderId,
          orderNumber,
          email,
        },
      },
    });

    await upsertStoredOrder({
      ...order,
      paymentStatus: "PENDING",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      checkoutSessionId: session.id,
      amount,
      currency,
      mode: "live",
    });
  } catch (error) {
    console.error("POST /api/payments/stripe error:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
