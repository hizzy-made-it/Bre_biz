import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./brand.css";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Wander & Revel Event Services | A Place for Every Story.",
  description: "A Place for Every Story. Thoughtful wedding coordination, mobile bartending, private events, styling, and customized event support.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Wander & Revel Event Services",
    title: "Wander & Revel Event Services | A Place for Every Story.",
    description: "Thoughtful wedding coordination, mobile bartending, private events, styling, and customized event support.",
    images: [{ url: "/images/wander-revel-logo.png", alt: "Wander & Revel Event Services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wander & Revel Event Services | A Place for Every Story.",
    description: "Thoughtful wedding coordination, mobile bartending, private events, styling, and customized event support.",
    images: ["/images/wander-revel-logo.png"],
  },
  // PNG favicon and Apple touch icon come from app/icon.tsx and app/apple-icon.tsx.
};

/** Fit the device width; pinch-zoom stays available. 16px fields stop iOS tap-zoom. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F3EA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
