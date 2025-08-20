"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Package, Car, CheckCircle, List, Settings, Plus } from "lucide-react";
import BusinessIntelligenceCards from "@/components/BusinessIntelligenceCards";

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
      <div className="text-center py-6">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          Velkommen til Frankani Delssystem
        </h2>
        <p className="text-lg text-slate-600">
          Oversikt og hurtigvalg for lagerstyring
        </p>
      </div>

      {/* Business Intelligence Cards */}
      <BusinessIntelligenceCards />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-4">
        <Link
          href="/search"
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-6 md:p-10 border border-slate-200 hover:border-blue-300 hover:scale-[1.02] min-h-[200px] flex flex-col"
        >
          <div className="flex items-center mb-4">
            <Search className="h-8 w-8 text-blue-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Søk Deler</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-4 flex-grow">
            Søk etter deler med OEM-nummer, bilmodell eller leverandør. Hovedfunksjon for å finne deler raskt.
          </p>
          {!loading && (
            <div className="mb-4 text-base text-gray-700 bg-blue-50 px-4 py-2 rounded-lg">
              📦 {stats.totalParts.toLocaleString()} deler tilgjengelig
            </div>
          )}
          <div className="mt-auto text-blue-600 group-hover:text-blue-700 font-semibold text-lg">
            Gå til søk →
          </div>
        </Link>

        <Link
          href="/low-stock"
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-10 border border-slate-200 hover:border-red-300 hover:scale-[1.02] min-h-[200px] flex flex-col"
        >
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 text-red-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Lav Beholdning</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-4 flex-grow">
            Vis deler med lav beholdning (≤ 2 stykker). Rød markering for kritiske varer.
          </p>
          {!loading && (
            <div className="mb-4 text-base text-red-700 bg-red-50 px-4 py-2 rounded-lg font-medium">
              ⚠️ {stats.lowStockParts} deler med lav beholdning
            </div>
          )}
          <div className="mt-auto text-red-600 group-hover:text-red-700 font-semibold text-lg">
            Se lav beholdning →
          </div>
        </Link>

        <Link
          href="/vehicles"
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-10 border border-slate-200 hover:border-green-300 hover:scale-[1.02] min-h-[200px] flex flex-col"
        >
          <div className="flex items-center mb-4">
            <Car className="h-8 w-8 text-green-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Bilmodeller</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-4 flex-grow">
            Bla gjennom deler etter bilkompatibilitet. Finn deler for spesifikke bilmodeller.
          </p>
          {!loading && (
            <div className="mb-4 text-base text-green-700 bg-green-50 px-4 py-2 rounded-lg">
              🚗 {stats.totalMakes} bilmerker{stats.topMake && `, mest: ${stats.topMake}`}
            </div>
          )}
          <div className="mt-auto text-green-600 group-hover:text-green-700 font-semibold text-lg">
            Se bilmodeller →
          </div>
        </Link>

        <Link
          href="/compatibility"
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-10 border border-slate-200 hover:border-purple-300 hover:scale-[1.02] min-h-[200px] flex flex-col"
        >
          <div className="flex items-center mb-4">
            <CheckCircle className="h-8 w-8 text-purple-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Kompatibilitet</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-4 flex-grow">
            Deler som trenger kompatibilitetssjekk. Automatisk Polcar-oppslag og manuell registrering.
          </p>
          {!loading && (
            <div className="mb-4 text-base text-purple-700 bg-purple-50 px-4 py-2 rounded-lg">
              🔍 {stats.uncheckedParts} deler usjekket
            </div>
          )}
          <div className="mt-auto text-purple-600 group-hover:text-purple-700 font-semibold text-lg">
            Sjekk kompatibilitet →
          </div>
        </Link>

        <Link
          href="/parts"
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-10 border border-slate-200 hover:border-indigo-300 hover:scale-[1.02] min-h-[200px] flex flex-col"
        >
          <div className="flex items-center mb-4">
            <List className="h-8 w-8 text-indigo-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Vis Alle Deler</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-4 flex-grow">
            Bla gjennom alle deler i lageret. Se lagerstatus, priser og detaljer for alle varer.
          </p>
          <div className="mb-4 text-base text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg">
            📋 Komplett deleliste
          </div>
          <div className="mt-auto text-indigo-600 group-hover:text-indigo-700 font-semibold text-lg">
            Se alle deler →
          </div>
        </Link>
        <Link
          href="/parts/new"
          className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 md:p-10 border border-slate-200 hover:border-orange-300 hover:scale-[1.02] min-h-[200px] flex flex-col"
        >
          <div className="flex items-center mb-4">
            <Plus className="h-8 w-8 text-orange-600 mr-4" />
            <h3 className="text-xl font-semibold text-slate-800">Legg til Ny Del</h3>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-4 flex-grow">
            Registrer en ny bildel manuelt i systemet. Fyll ut detaljer og lagerstatus.
          </p>
          <div className="mb-4 text-base text-orange-700 bg-orange-50 px-4 py-2 rounded-lg">
            ➕ Ny delregistrering
          </div>
          <div className="mt-auto text-orange-600 group-hover:text-orange-700 font-semibold text-lg">
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
