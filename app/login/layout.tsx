export const metadata = {
  title: 'Login - Elo Escola',
  description: 'Faça login na plataforma Elo Escola',
  icons: {
    icon: "/logo_elo_circle.png",
    shortcut: "/logo_elo_circle.png",
    apple: "/logo_elo_circle.png",
  },
  openGraph: {
    title: 'Login - Elo Escola',
    description: 'Faça login na plataforma Elo Escola',
    images: ["/logo_elo_circle.png"],
  },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
