import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { NonAdminOnly } from "@/components/layout/NonAdminOnly";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ChatBot } from "@/components/ai/ChatBot";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { ConsentBanner } from "@/components/analytics/ConsentBanner";
import { AbandonedCartTracker } from "@/components/analytics/AbandonedCartTracker";
import { FreeShippingPopup } from "@/components/marketing/FreeShippingPopup";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "BabyOnline.hu – Baba-Mama Webshop",
  description:
    "Magyarország kedvenc baba-mama webshopja. Pelenkák, babaruhák, babakocsik, etetési termékek és minden, amit a babádhoz és magadhoz szükséges. Magyarországi szállítás, gyors kiszállítás.",
  keywords: [
    "baba",
    "babaruha",
    "pelenka",
    "babakocsi",
    "mama",
    "webshop",
    "Magyarország",
  ],
  icons: {
    icon: [{ url: "/fav-babyonline.png", type: "image/png" }],
    shortcut: ["/fav-babyonline.png"],
    apple: [{ url: "/fav-babyonline.png" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    locale: "hu_HU",
    siteName: "BabyOnline.hu",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BabyOnline.hu",
    url: siteUrl,
    logo: absoluteUrl("/babyonline-logo.png"),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@jatekonline.hu",
      areaServed: "HU",
      availableLanguage: "hu",
    },
  };

  const webSiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BabyOnline.hu",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/keresek?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="hu">
      <body
        className={`${playfair.variable} ${inter.variable} font-body antialiased min-h-screen flex flex-col`}
      >
        <AnalyticsScripts />
        <NonAdminOnly>
          <ConsentBanner />
          <FreeShippingPopup />
        </NonAdminOnly>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteStructuredData) }}
        />
        <LayoutWrapper>{children}</LayoutWrapper>
        <AbandonedCartTracker />
        <CartDrawer />
        <NonAdminOnly>
          <ChatBot />
        </NonAdminOnly>
      </body>
    </html>
  );
}
