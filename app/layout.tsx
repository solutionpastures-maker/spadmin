import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../lib/providers";

export const metadata: Metadata = {
  title: "Solution Pastures Admin",
  description: "Premium church management software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
