import type { Metadata } from "next";
import { Oswald, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import CeesAlertContainer from "@/components/common/CeesAlertContainer";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
});

// Body grotesk with more street character than Inter; same neutral role.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

// Previously referenced in tailwind.config but never loaded -> mono fell back to browser default.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-jetbrains",
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

// Runs before paint: light is the default, dark only if the visitor chose it explicitly.
const themeInitScript = `(function(){try{var t=localStorage.getItem('cees_theme');if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${oswald.variable} ${archivo.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-dark-void dark:text-steel-100 antialiased selection:bg-brand-blue selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <a href="#main-content" className="skip-link">
              Langsung ke konten
            </a>

            {/* Paper texture: hard grid + grain instead of soft glow blobs */}
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-industrial-grid opacity-60 dark:opacity-50" />
            <div aria-hidden className="grain-overlay" />

            <div className="relative z-10 flex min-h-screen flex-col">
              <Navbar />
              <main id="main-content" className="flex-1 pb-20 lg:pb-0">
                {children}
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
            <CeesAlertContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
