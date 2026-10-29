import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La Bodeguita Drinks | Bebidas para compartir",
  description: "Catálogo de bebidas y carrito de compras de demostración de La Bodeguita.",
};

export const viewport: Viewport = {
  themeColor: "#4d2f20",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
