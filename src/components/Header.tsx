"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show header on login page
  if (pathname === "/login") {
    return null;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "DELETE",
      });

      if (response.ok) {
        // Clear client-side session data
        localStorage.removeItem("frankani_session");
        // Redirect to login
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if API call fails
      localStorage.removeItem("frankani_session");
      router.push("/login");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Frankani Delssystem
          </h1>
          <p className="text-slate-600 text-lg mt-1">
            Bildelerlager og Kompatibilitetssystem
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Logg ut"
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span className="text-lg">Logg ut</span>
        </button>
      </div>
    </header>
  );
}