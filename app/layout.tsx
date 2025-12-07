import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { getSidebarItems } from "@/utils/sidebarItems";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elo Escola",
  description: "Plataforma Elo Escola",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const role = "ADMIN"; // role fixa. posteriormente substituir pela lógica de obtenção do role
  const items = getSidebarItems(role);

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar role={role} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </body>
    </html>
  );
}
