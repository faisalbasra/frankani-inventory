"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Package, Car, CheckCircle, List, Settings, Plus } from "lucide-react";

interface DashboardStats {
  totalParts: number;
  lowStockParts: number;
  totalMakes: number;
  topMake?: string;
  uncheckedParts: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalParts: 0,
    lowStockParts: 0,
    totalMakes: 0,
    uncheckedParts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Velkommen til Frankani Delssystem
        </h2>
        <p className="text-lg text-slate-600">
          Velg en funksjon nedenfor for å komme i gang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Link
          href="/search"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border-2 border-transparent hover:border-blue-200"
        >
          <div className="flex items-center mb-4">
            <Search className="h-8 w-8 text-blue-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Søk Deler</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Søk etter deler med OEM-nummer, bilmodell eller leverandør. Hovedfunksjon for å finne deler raskt.
          </p>
          {!loading && (
            <div className="mt-3 text-sm text-gray-600">
              {stats.totalParts.toLocaleString()} deler tilgjengelig
            </div>
          )}
          <div className="mt-4 text-blue-600 group-hover:text-blue-700 font-medium">
            Gå til søk →
          </div>
        </Link>

        <Link
          href="/low-stock"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border-2 border-transparent hover:border-red-200"
        >
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 text-red-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Lav Beholdning</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Vis deler med lav beholdning (≤ 2 stykker). Rød markering for kritiske varer.
          </p>
          {!loading && (
            <div className="mt-3 text-sm text-red-600 font-medium">
              {stats.lowStockParts} deler med lav beholdning
            </div>
          )}
          <div className="mt-4 text-red-600 group-hover:text-red-700 font-medium">
            Se lav beholdning →
          </div>
        </Link>

        <Link
          href="/vehicles"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border-2 border-transparent hover:border-green-200"
        >
          <div className="flex items-center mb-4">
            <Car className="h-8 w-8 text-green-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Bilmodeller</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Bla gjennom deler etter bilkompatibilitet. Finn deler for spesifikke bilmodeller.
          </p>
          {!loading && (
            <div className="mt-3 text-sm text-green-600">
              {stats.totalMakes} bilmerker{stats.topMake && `, mest: ${stats.topMake}`}
            </div>
          )}
          <div className="mt-4 text-green-600 group-hover:text-green-700 font-medium">
            Se bilmodeller →
          </div>
        </Link>

        <Link
          href="/compatibility"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border-2 border-transparent hover:border-purple-200"
        >
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-purple-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Kompatibilitet</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Deler som trenger kompatibilitetssjekk. Automatisk Polcar-oppslag og manuell registrering.
          </p>
          {!loading && (
            <div className="mt-3 text-sm text-purple-600">
              {stats.uncheckedParts} deler usjekket
            </div>
          )}
          <div className="mt-4 text-purple-600 group-hover:text-purple-700 font-medium">
            Sjekk kompatibilitet →
          </div>
        </Link>

        <Link
          href="/parts"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border-2 border-transparent hover:border-indigo-200"
        >
          <div className="flex items-center mb-4">
            <List className="h-8 w-8 text-indigo-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Vis Alle Deler</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Bla gjennom alle deler i lageret. Se lagerstatus, priser og detaljer for alle varer.
          </p>
          <div className="mt-4 text-indigo-600 group-hover:text-indigo-700 font-medium">
            Se alle deler →
          </div>
        </Link>
        <Link
          href="/parts/new"
          className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-8 border-2 border-transparent hover:border-orange-200"
        >
          <div className="flex items-center mb-4">
            <Plus className="h-8 w-8 text-orange-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Legg til Ny Del</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Registrer en ny bildel manuelt i systemet. Fyll ut detaljer og lagerstatus.
          </p>
          <div className="mt-4 text-orange-600 group-hover:text-orange-700 font-medium">
            Legg til ny del →
          </div>
        </Link>
      </div>

      <div className="text-center pt-8">
        <Link
          href="/settings"
          className="inline-flex items-center px-6 py-3 text-slate-600 hover:text-slate-800 font-medium transition-colors"
        >
          <Settings className="h-5 w-5 mr-2" />
          Innstillinger og Administrasjon
        </Link>
      </div>
    </div>
  );
}
