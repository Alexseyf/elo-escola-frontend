import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google"; // Removed Montserrat and Inter
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"], // Lighter weights included
  display: "swap",
});

export const metadata: Metadata = {
  title: "Elo Escola",
  description: "Plataforma Elo Escola",
  icons: {
    icon: "/logo_elo_circle.png",
    shortcut: "/logo_elo_circle.png",
    apple: "/logo_elo_circle.png",
  },
  openGraph: {
    title: "Elo Escola",
    description: "Plataforma Elo Escola",
    images: ["/logo_elo_circle.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${nunitoSans.variable}`}>
      <body className="antialiased">
        <Sidebar>
          {children}
        </Sidebar>
        <Toaster />
      </body>
    </html>
  );
}
