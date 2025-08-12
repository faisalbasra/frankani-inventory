import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Frankani Delssystem - Bildelerlager",
  description: "Norsk bildelerlager system med kompatibilitetssjekk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="antialiased">
        <div className="min-h-screen bg-slate-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
