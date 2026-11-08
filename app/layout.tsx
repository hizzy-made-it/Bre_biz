import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import "./brand.css";

export const metadata: Metadata = {
  title: "Wander & Revel Event Services | A Place for Every Story.",
  description: "A Place for Every Story. Discover thoughtful wedding coordination, mobile bartending, private events, styling, and customized event support in this private concept demo.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
