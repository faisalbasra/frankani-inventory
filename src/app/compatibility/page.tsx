"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Search as SearchIcon, Eye } from "lucide-react";
import Link from "next/link";

interface CompatibilityItem {
  id: number;
  deler: string | null;
  delenummer_oem: string | null;
  category: string | null;
  leverandor: string | null;
  antall: number;
  compatibility_status: string;
  last_compatibility_check: string | null;
  compatible_count: number;
}

export default function CompatibilityPage() {
  const [items, setItems] = useState<CompatibilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unchecked" | "checking" | "found" | "not_found">("unchecked");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCompatibilityItems();
  }, [filter, searchTerm]);

  const loadCompatibilityItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        search: searchTerm,
      });

      const response = await fetch(`/api/compatibility?${params}`);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Feil ved lasting av kompatibilitetsstatus:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "found":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "checking":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "not_found":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "found":
        return "Kompatibilitet funnet";
      case "checking":
        return "Sjekker kompatibilitet";
      case "not_found":
        return "Ingen kompatibilitet funnet";
      case "unchecked":
      default:
        return "Ikke sjekket";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "found":
        return "bg-green-100 text-green-800";
      case "checking":
        return "bg-yellow-100 text-yellow-800";
      case "not_found":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const uncheckedCount = items.filter(item => item.compatibility_status === "unchecked").length;
  const foundCount = items.filter(item => item.compatibility_status === "found").length;
  const notFoundCount = items.filter(item => item.compatibility_status === "not_found").length;

  const handlePolcarCheck = async (itemId: number, oemNumber: string) => {
    try {
      const response = await fetch("/api/polcar/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId,
          oemNumber,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reload items to show updated status
        loadCompatibilityItems();
      } else {
        alert(`Feil ved Polcar-oppslag: ${result.error}`);
      }
    } catch (error) {
      console.error("Error during Polcar check:", error);
      alert("Feil ved Polcar-oppslag");
    }
  };

  const handleBulkPolcarCheck = async () => {
    if (!confirm(`Vil du sjekke alle ${uncheckedCount} usjekket deler? Dette kan ta opptil ${Math.ceil(uncheckedCount * 2.5 / 60)} minutter.`)) {
      return;
    }

    try {
      const response = await fetch("/api/polcar/check", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: "unchecked",
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Behandlet ${result.processed} deler, fant kompatibilitet for ${result.found} deler`);
        loadCompatibilityItems();
      } else {
        alert(`Feil ved massesjekking: ${result.error}`);
      }
    } catch (error) {
      console.error("Error during bulk Polcar check:", error);
      alert("Feil ved massesjekking");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Tilbake til Dashboard
        </Link>
        <div className="flex items-center mb-4">
          <CheckCircle className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-800">
            Kompatibilitetssjekk
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Administrer og sjekk bilkompatibilitet for deler med Polcar-integrasjon
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-gray-600 mb-2">{items.length}</div>
          <div className="text-sm text-gray-600">Totalt antall deler</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-gray-600 mb-2">{uncheckedCount}</div>
          <div className="text-sm text-gray-600">Ikke sjekket</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{foundCount}</div>
          <div className="text-sm text-gray-600">Kompatibilitet funnet</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{notFoundCount}</div>
          <div className="text-sm text-gray-600">Ingen kompatibilitet</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-large w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Søk etter deler eller OEM-nummer..."
              />
            </div>
          </div>
          
          <div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Alle deler</option>
              <option value="unchecked">Ikke sjekket</option>
              <option value="checking">Sjekker nå</option>
              <option value="found">Kompatibilitet funnet</option>
              <option value="not_found">Ingen kompatibilitet</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-4 mb-6">
          <button 
            onClick={handleBulkPolcarCheck}
            disabled={uncheckedCount === 0}
            className="btn-large bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Sjekk alle usjekket ({uncheckedCount})
          </button>
          <button className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Eksporter rapport
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Laster kompatibilitetsstatus...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Ingen deler funnet
              </h3>
              <p className="text-gray-500">
                Ingen deler matcher de valgte kriteriene
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    {/* Part Information */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {item.deler || "Ukjent del"}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>
                          <strong>OEM:</strong>{" "}
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                            {item.delenummer_oem || "N/A"}
                          </code>
                        </div>
                        <div>
                          <strong>Kategori:</strong>{" "}
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {item.category || "Ukjent"}
                          </span>
                        </div>
                        <div>
                          <strong>Leverandør:</strong> {item.leverandor || "N/A"}
                        </div>
                        <div>
                          <strong>Antall:</strong>{" "}
                          <span className={`font-medium ${
                            item.antall === 0 
                              ? "text-red-600" 
                              : item.antall <= 2 
                              ? "text-orange-600" 
                              : "text-green-600"
                          }`}>
                            {item.antall} stk
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status and Compatibility */}
                    <div className="text-center">
                      <div className="mb-3">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          {getStatusIcon(item.compatibility_status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.compatibility_status)}`}>
                            {getStatusText(item.compatibility_status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Sist sjekket: {item.last_compatibility_check 
                            ? new Date(item.last_compatibility_check).toLocaleDateString('no-NO')
                            : "Aldri"
                          }
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {item.compatible_count}
                        </div>
                        <div className="text-sm text-gray-600">Kompatible biler</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Link
                        href={`/parts/${item.id}`}
                        className="btn-large bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detaljer
                      </Link>
                      {item.delenummer_oem && item.compatibility_status === "unchecked" && (
                        <button
                          onClick={() => handlePolcarCheck(item.id, item.delenummer_oem!)}
                          className="btn-large bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Sjekk Polcar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Kompatibilitetssjekk med Polcar
        </h3>
        <ul className="text-blue-700 space-y-2">
          <li>• Automatisk oppslag mot Polcar-katalogen for OEM-numre</li>
          <li>• Finner kompatible bilmodeller, årganger og motorkoder</li>
          <li>• Rate-begrenset til å respektere Polcar sine retningslinjer</li>
          <li>• Lagrer resultater for rask tilgang og auditspor</li>
          <li>• Støtter manuelle overstyringer for spesielle tilfeller</li>
        </ul>
      </div>
    </div>
  );
}