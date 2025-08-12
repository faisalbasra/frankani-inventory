"use client";

import { useState, useEffect } from "react";
import { Search, Car, Package, Building, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

interface InventoryItem {
  id: number;
  model: string | null;
  category: string | null;
  deler: string | null;
  lagerplass: string | null;
  antall: number;
  lagerkode: string | null;
  utpris_m_mva: number | null;
  evt_bestilltid: string | null;
  leverandor: string | null;
  delenummer_oem: string | null;
  leverandor_pa_lager: string | null;
  oem_alt: string | null;
  link: string | null;
  webshop_done: boolean;
  compatibility_status: string;
  created_at: string;
  updated_at: string;
}

interface SearchSuggestions {
  categories: string[];
  suppliers: string[];
  carModels: string[];
  carMakes: string[];
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"oem" | "car" | "supplier" | "category" | "make" | "all">("oem");
  const [results, setResults] = useState<InventoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ categories: [], suppliers: [], carModels: [], carMakes: [] });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch("/api/search/suggestions");
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Feil ved lasting av forslag:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Søkefeil:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const getSuggestionsForType = () => {
    switch (searchType) {
      case "category":
        return suggestions.categories;
      case "supplier":
        return suggestions.suppliers;
      case "car":
        return suggestions.carModels;
      case "make":
        return suggestions.carMakes;
      default:
        return [];
    }
  };

  const filteredSuggestions = getSuggestionsForType()
    .filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Tilbake til Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Søk Deler
        </h1>
        <p className="text-lg text-slate-600">
          Søk etter deler ved OEM-nummer, bilmodell, leverandør eller kategori
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-3 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="input-large w-full pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Skriv inn søketerm..."
              />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                      handleSearch();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as any)}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="oem">OEM Nummer</option>
              <option value="car">Bilmodell</option>
              <option value="make">Bilmerke</option>
              <option value="supplier">Leverandør</option>
              <option value="category">Kategori</option>
              <option value="all">Alle felt</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-large bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <Search className="h-5 w-5 mr-2" />
            {loading ? "Søker..." : "Søk"}
          </button>

          <button
            onClick={() => {
              setSearchQuery("");
              setResults([]);
              setShowSuggestions(false);
            }}
            className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Tøm
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">OEM-nummer</div>
            <div className="text-xs text-gray-500">Eksakt match</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <Car className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Bilmodell</div>
            <div className="text-xs text-gray-500">Kompatibilitet</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <Car className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Bilmerke</div>
            <div className="text-xs text-gray-500">Produsent</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <Building className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Leverandør</div>
            <div className="text-xs text-gray-500">Fuzzy matching</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <Package className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Kategori</div>
            <div className="text-xs text-gray-500">Gruppering</div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Søkeresultater ({results.length})
            </h2>
          </div>

          <div className="space-y-4">
            {results.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-medium text-slate-800 mb-2">
                      {item.deler || "Ukjent del"}
                    </h3>
                    <div className="text-gray-600 space-y-1">
                      <div><strong>OEM:</strong> {item.delenummer_oem || "N/A"}</div>
                      <div><strong>Kategori:</strong> {item.category || "N/A"}</div>
                      <div><strong>Leverandør:</strong> {item.leverandor || "N/A"}</div>
                      {item.model && <div><strong>Bilmodell:</strong> {item.model}</div>}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Lagerplass:</strong> {item.lagerplass || "N/A"}</div>
                      <div><strong>Lagerkode:</strong> {item.lagerkode || "N/A"}</div>
                      {item.evt_bestilltid && (
                        <div><strong>Bestilltid:</strong> {item.evt_bestilltid}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold mb-2 ${
                      item.antall <= 2 ? "text-red-600" : "text-green-600"
                    }`}>
                      {item.antall} stk
                    </div>
                    {item.utpris_m_mva && (
                      <div className="text-lg font-medium text-slate-800 mb-2">
                        {item.utpris_m_mva.toFixed(2)} kr
                      </div>
                    )}
                    <div className="space-y-2">
                      <Link
                        href={`/parts/${item.id}`}
                        className="btn-large bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors block text-center"
                      >
                        Se Detaljer
                      </Link>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {item.compatibility_status !== "unchecked" && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 mr-2">Kompatibilitet:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.compatibility_status === "found" 
                          ? "bg-green-100 text-green-800" 
                          : item.compatibility_status === "checking"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {item.compatibility_status === "found" && "Funnet"}
                        {item.compatibility_status === "checking" && "Sjekker"}
                        {item.compatibility_status === "not_found" && "Ikke funnet"}
                        {item.compatibility_status === "unchecked" && "Ikke sjekket"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && searchQuery && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Ingen resultater funnet
          </h3>
          <p className="text-gray-500">
            Prøv å søke med andre termer eller velg en annen søketype
          </p>
        </div>
      )}
    </div>
  );
}