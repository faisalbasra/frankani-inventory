import type { Metadata } from "next";
import "./globals.css";

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
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h1 className="text-3xl font-bold text-slate-800">
                Frankani Delssystem
              </h1>
              <p className="text-slate-600 text-lg mt-1">
                Bildelerlager og Kompatibilitetssystem
              </p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
