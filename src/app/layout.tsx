import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { ToastProvider } from "@/components/Toast";
import { AppProvider } from "@/context/AppContext";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SafeCycle - Suivi de cycle Zero-Knowledge",
  description: "Application de suivi menstrual ultra-confidentielle. Vos données sont chiffrées et stockées uniquement sur votre appareil.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SafeCycle",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F5F1EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ backgroundColor: '#F5F1EB' }}
      >
        <AppProvider>
          <ToastProvider>
            <main className="min-h-screen pb-20">
              {children}
            </main>
            <TabBar />
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
