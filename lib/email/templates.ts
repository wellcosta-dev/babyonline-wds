import type { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export interface EmailTemplatePayload {
  subject: string;
  html: string;
  text: string;
}

function baseTemplate(params: { title: string; intro: string; contentHtml: string }) {
  return `
  <div style="margin:0;padding:24px;background:#f6f8fb;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;background:linear-gradient(120deg,#00a8d8,#0ebbe4);color:#ffffff;">
          <div style="font-weight:800;font-size:18px;letter-spacing:-0.02em;">BabyOnline.hu</div>
          <div style="opacity:0.9;margin-top:4px;font-size:13px;">Rendelési értesítő</div>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px;font-size:24px;line-height:1.2;letter-spacing:-0.03em;">${params.title}</h1>
          <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">${params.intro}</p>
          ${params.contentHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;">
          Köszönjük, hogy a BabyOnline.hu-t választottad.
        </td>
      </tr>
    </table>
  </div>
  `;
}

function orderRows(order: Order): string {
  return order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;">${item.productName} × ${item.quantity}</td>
        <td style="padding:8px 0;color:#0f172a;font-size:14px;text-align:right;font-weight:700;">${formatPrice(
          item.price * item.quantity
        )}</td>
      </tr>
      `
    )
    .join("");
}

export function renderOrderConfirmationTemplate(order: Order): EmailTemplatePayload {
  const contentHtml = `
    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:12px 14px;margin-bottom:16px;">
      <div style="font-size:13px;color:#64748b;">Rendelésszám</div>
      <div style="font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">${order.orderNumber}</div>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${orderRows(order)}
      <tr><td colspan="2" style="padding:8px 0;border-top:1px solid #e5e7eb;"></td></tr>
      <tr>
        <td style="color:#475569;font-size:14px;">Végösszeg</td>
        <td style="text-align:right;color:#0f172a;font-size:18px;font-weight:800;">${formatPrice(
          order.total
        )}</td>
      </tr>
    </table>
  `;

  return {
    subject: `Rendelés visszaigazolás - ${order.orderNumber}`,
    html: baseTemplate({
      title: "Sikeres rendelés",
      intro:
        "Megkaptuk a rendelésedet, hamarosan feldolgozzuk. Az alábbiakban látod az összesítőt.",
      contentHtml,
    }),
    text: `Sikeres rendelés: ${order.orderNumber}. Végösszeg: ${order.total} Ft.`,
  };
}

export function renderOrderStatusUpdateTemplate(order: Order): EmailTemplatePayload {
  const contentHtml = `
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:14px;margin-bottom:16px;">
      <div style="font-size:13px;color:#1d4ed8;">Rendelésszám</div>
      <div style="font-size:18px;font-weight:800;color:#1e3a8a;letter-spacing:-0.02em;">${order.orderNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#1e3a8a;">Új státusz: <strong>${order.status}</strong></div>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
      Követjük a rendelésed állapotát, és minden fontos változásról értesítünk.
    </p>
  `;

  return {
    subject: `Rendelés frissítés - ${order.orderNumber}`,
    html: baseTemplate({
      title: "Rendelés státusz frissült",
      intro: "A rendelésed állapota megváltozott. Az új státuszt lent találod.",
      contentHtml,
    }),
    text: `A rendelés státusza frissült: ${order.orderNumber} -> ${order.status}.`,
  };
}

export function renderAdminNewOrderTemplate(order: Order): EmailTemplatePayload {
  const contentHtml = `
    <div style="background:#ecfeff;border:1px solid #bae6fd;border-radius:12px;padding:14px;margin-bottom:16px;">
      <div style="font-size:13px;color:#0369a1;">Új rendelés érkezett</div>
      <div style="font-size:18px;font-weight:800;color:#0c4a6e;letter-spacing:-0.02em;">${order.orderNumber}</div>
      <div style="margin-top:8px;font-size:14px;color:#0c4a6e;">Összeg: <strong>${formatPrice(
        order.total
      )}</strong></div>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
      Vásárló: <strong>${order.shippingAddress.name}</strong> (${order.guestEmail ?? "n/a"})
    </p>
  `;

  return {
    subject: `Új rendelés érkezett - ${order.orderNumber}`,
    html: baseTemplate({
      title: "Új rendelés az adminban",
      intro: "Új rendelés érkezett a BabyOnline webshopból.",
      contentHtml,
    }),
    text: `Új rendelés: ${order.orderNumber}, összeg: ${order.total} Ft, vásárló: ${order.shippingAddress.name}.`,
  };
}
