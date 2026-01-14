// app/layout.js (com meta viewport)
// Adicione ou atualize a tag meta viewport no cabeçalho

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layouts/ClientLayout";

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  icons: {
    icon: '/vercel.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
