"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle, Package, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface LowStockItem {
  id: number;
  deler: string | null;
  delenummer_oem: string | null;
  category: string | null;
  leverandor: string | null;
  antall: number;
  lagerplass: string | null;
  utpris_m_mva: number | null;
  evt_bestilltid: string | null;
}

export default function LowStockPage() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadLowStockItems();
  }, []);

  const loadLowStockItems = async () => {
    try {
      const response = await fetch("/api/low-stock");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Feil ved lasting av lav beholdning:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 0) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await fetch(`/api/parts/${itemId}/quantity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, antall: newQuantity } : item
      ));
    } catch (error) {
      console.error("Feil ved oppdatering av antall:", error);
    } finally {
      setUpdatingItems(prev => {
        const updated = new Set(prev);
        updated.delete(itemId);
        return updated;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Laster...</div>
      </div>
    );
  }

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
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-800">
            Lav Beholdning
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Deler med 2 eller færre stykker på lager
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Kritisk lav beholdning ({items.length} varer)
          </h2>
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">Krever oppmerksomhet</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Ingen varer med lav beholdning
            </h3>
            <p className="text-gray-500">
              Alle deler har tilstrekkelig antall på lager
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className={`border-2 rounded-lg p-6 ${
                  item.antall === 0 
                    ? "border-red-500 bg-red-50" 
                    : "border-orange-300 bg-orange-50"
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-medium text-slate-800 mb-2">
                      {item.deler || "Ukjent del"}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div><strong>OEM:</strong> {item.delenummer_oem || "N/A"}</div>
                      <div><strong>Kategori:</strong> {item.category || "N/A"}</div>
                      <div><strong>Leverandør:</strong> {item.leverandor || "N/A"}</div>
                      {item.lagerplass && (
                        <div><strong>Lagerplass:</strong> {item.lagerplass}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      item.antall === 0 ? "text-red-600" : "text-orange-600"
                    }`}>
                      {item.antall}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">stykker</div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.antall - 1)}
                        disabled={updatingItems.has(item.id) || item.antall <= 0}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateQuantity(item.id, item.antall + 1)}
                        disabled={updatingItems.has(item.id)}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    {item.utpris_m_mva && (
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        {item.utpris_m_mva.toFixed(2)} kr
                      </div>
                    )}
                    {item.evt_bestilltid && (
                      <div className="text-sm text-gray-600 mb-3">
                        Bestilltid: {item.evt_bestilltid}
                      </div>
                    )}
                    <Link
                      href={`/parts/${item.id}`}
                      className="btn-large bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
                    >
                      Se Detaljer
                    </Link>
                  </div>
                </div>

                {item.antall === 0 && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-center text-red-700">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        KRITISK: Ingen varer på lager! Bør bestilles umiddelbart.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            Tips for lageroptimalisering
          </h3>
          <ul className="text-blue-700 space-y-2">
            <li>• Sett opp automatiske bestillinger for kritiske deler</li>
            <li>• Overvåk salgshistorikk for å forutse behov</li>
            <li>• Koordiner med leverandører for bedre leveringstider</li>
            <li>• Vurder å øke sikkerhetslageret for populære deler</li>
          </ul>
        </div>
      </div>
    </div>
  );
}