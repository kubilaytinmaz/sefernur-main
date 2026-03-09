import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { SiteSettingsProvider } from "@/providers/site-settings-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sefernur - Umre ve Hac Seyahat Platformu",
  description:
    "Umre ve Hac seyahatleriniz için otel, tur, transfer, rehber ve araç kiralama hizmetleri",
  keywords: ["umre", "hac", "otel", "tur", "transfer", "rehber", "seyahat"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <SiteSettingsProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </SiteSettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
