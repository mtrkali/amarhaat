import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Amar Haat | আপনার এলাকার বিশ্বস্ত বাজার",
  description:
    "Amar Haat থেকে আপনার প্রয়োজনীয় পণ্য স্থানীয় বিক্রেতাদের কাছ থেকে সহজেই খুঁজে নিন ও অর্ডার করুন।",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the page draw under the iPhone notch / home indicator.
  // The header and bottom nav add safe-area padding to stay clear of them.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
};

// Runs before first paint so dark-theme users never see a light flash.
// Uses the same storage key and fallback logic as ThemeToggle.
const themeInitScript = `(function(){try{var t=localStorage.getItem("amar-haat-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;

// TODO: replace with real cart state once the cart exists.
const CART_COUNT = 2;

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} ${hindSiliguri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      {/* Bottom padding keeps content clear of the fixed mobile nav (4rem + safe area). */}
      <body className="flex min-h-full flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Header cartCount={CART_COUNT} />
        {children}
        <BottomNav cartCount={CART_COUNT} />
      </body>
    </html>
  );
}