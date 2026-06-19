// app/layout.js (com meta viewport)
// Adicione ou atualize a tag meta viewport no cabeçalho

// Prevent static prerendering - this layout requires runtime env vars
export const dynamic = 'force-dynamic';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layouts/ClientLayout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FoodLister - Organize seus restaurantes favoritos",
  description: "Aplicativo para organizar e descobrir restaurantes",
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
