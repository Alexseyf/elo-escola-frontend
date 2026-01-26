export const metadata = {
  title: 'Login - Elo Escola',
  description: 'Faça login na plataforma Elo Escola',
  icons: {
    icon: "/logo_elo64.jpg",
    shortcut: "/logo_elo64.jpg",
    apple: "/logo_elo64.jpg",
  },
  openGraph: {
    title: 'Login - Elo Escola',
    description: 'Faça login na plataforma Elo Escola',
    images: ["/logo.png"],
  },
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
