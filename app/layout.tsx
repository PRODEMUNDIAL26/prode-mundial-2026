import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prode Mundial 2026",
  description: "Predicciones del Mundial 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen antialiased">{children}</body>
    </html>
  );
}
