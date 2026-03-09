export type ShippingMethod =
  | "gls"
  | "gls-csomagautomata"
  | "gls-csomagpont"
  | "magyar-posta";

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  gls: "GLS házhoz",
  "gls-csomagautomata": "GLS automata",
  "gls-csomagpont": "GLS csomagpont",
  "magyar-posta": "Magyar Posta",
};

export type GlsPickupPointType = "parcel-locker" | "parcel-shop";

export interface GlsPickupPoint {
  id: string;
  type: GlsPickupPointType;
  name: string;
  postalCode: string;
  city: string;
  address: string;
  distanceKm: number;
  openingHours?: string;
}

export interface OrderShippingPickupPoint {
  id: string;
  type: GlsPickupPointType;
  name: string;
  postalCode: string;
  city: string;
  address: string;
}

export function requiresGlsPickupPoint(method: ShippingMethod): boolean {
  return method === "gls-csomagautomata" || method === "gls-csomagpont";
}
