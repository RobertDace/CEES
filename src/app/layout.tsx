import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cees-area.vercel.app"),
  title: "CEES AREA | Official E-Sport Community Samarinda - INVICTUS MANEO",
  description:
    "Website resmi CEES AREA (CEES GANK), wadah komunitas dan tim esports terdepan di Samarinda, Kalimantan Timur. Divisi PUBG Mobile, Mobile Legends, dan Roblox. Invictus Maneo!",
  keywords: [
    "CEES AREA",
    "CEES GANK",
    "Esports Samarinda",
    "Komunitas Game Kaltim",
    "PUBG Mobile Samarinda",
    "Mobile Legends Kaltim",
    "Invictus Maneo",
    "PAWPAW Samarinda",
  ],
  authors: [{ name: "CEES AREA Media Team" }],
  openGraph: {
    title: "CEES AREA | Komunitas E-Sport Resmi Samarinda",
    description: "Invictus Maneo - Wadah Pemersatu & Pembinaan Talenta Esports Samarinda",
    url: "https://cees-area.vercel.app",
    siteName: "CEES AREA",
    images: [
      {
        url: "/assets/logo_white.png",
        width: 922,
        height: 533,
        alt: "CEES AREA Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/assets/logo_blue.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${oswald.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-void dark:text-steel-100 antialiased selection:bg-brand-blue selection:text-white transition-colors duration-200">
        <ThemeProvider>
          {/* Background Grid Pattern */}
          <div className="fixed inset-0 pointer-events-none z-0 bg-industrial-grid opacity-30 dark:opacity-40" />
          
          {/* Ambient Brand Glow */}
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-brand-blue/10 dark:bg-brand-blue/20 blur-[130px] pointer-events-none z-0" />

          <div className="relative z-10 flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
