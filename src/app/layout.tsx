import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Asistencia Biométrica",
    template: "%s | Asistencia Biométrica",
  },
  description: "Control académico de asistencia con reconocimiento facial y privacidad por diseño.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
