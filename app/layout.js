export const dynamic = 'force-dynamic';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layouts/ClientLayout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import GlobalSearch from "@/components/ui/GlobalSearch";
import LoadingProvider from "@/components/loading/LoadingProvider";

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
  maximumScale: 3,
  viewportFit: 'cover',
  themeColor: '#050505',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" data-theme="dark" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased mesh-gradient-bg">
        <ErrorBoundary>
          <LoadingProvider>
            <ClientLayout>{children}</ClientLayout>
            <GlobalSearch />
          </LoadingProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
