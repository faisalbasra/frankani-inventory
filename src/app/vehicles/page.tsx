"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Car, Search } from "lucide-react";
import Link from "next/link";

interface CarMake {
  id: number;
  name: string;
  country: string | null;
  models: CarModel[];
}

interface CarModel {
  id: number;
  make_id: number;
  name: string;
  full_name: string;
  year_from: number | null;
  year_to: number | null;
  part_count: number;
}

interface VehicleWithParts {
  make_name: string;
  model_name: string;
  part_count: number;
  parts: {
    id: number;
    deler: string;
    delenummer_oem: string;
    antall: number;
    utpris_m_mva: number | null;
  }[];
}

export default function VehiclesPage() {
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [vehicleParts, setVehicleParts] = useState<VehicleWithParts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCarMakes();
  }, []);

  useEffect(() => {
    if (selectedMake) {
      loadVehicleParts();
    }
  }, [selectedMake]);

  const loadCarMakes = async () => {
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      setMakes(data);
    } catch (error) {
      console.error("Feil ved lasting av bilmerker:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicleParts = async () => {
    try {
      const response = await fetch(`/api/vehicles/${selectedMake}/parts`);
      const data = await response.json();
      setVehicleParts(data);
    } catch (error) {
      console.error("Feil ved lasting av bildeler:", error);
      setVehicleParts([]);
    }
  };

  const filteredMakes = makes.filter(make => 
    make.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Laster bilmodeller...</div>
      </div>
    );
  }

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
          <Car className="h-8 w-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-800">
            Bilmodeller og Kompatibilitet
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Finn deler ved å bla gjennom bilmerker og modeller
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Car Makes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Bilmerker</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-large w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Søk bilmerke..."
            />
          </div>

          <div className="space-y-2">
            {filteredMakes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Ingen bilmerker funnet i systemet</p>
              </div>
            ) : (
              filteredMakes.map((make) => (
                <button
                  key={make.id}
                  onClick={() => setSelectedMake(make.name)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    selectedMake === make.name
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{make.name}</div>
                      {make.country && (
                        <div className="text-sm text-gray-600">📍 {make.country}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {make.models?.length || 0} modeller
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Vehicle Parts */}
        <div className="lg:col-span-2">
          {!selectedMake ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Velg et bilmerke
              </h3>
              <p className="text-gray-500">
                Klikk på et bilmerke til venstre for å se tilgjengelige deler
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  Deler for {selectedMake}
                </h2>
                <p className="text-gray-600 mt-1">
                  {vehicleParts.length} modeller med tilgjengelige deler
                </p>
              </div>

              <div className="p-6">
                {vehicleParts.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Ingen deler funnet for {selectedMake}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {vehicleParts.map((vehicle, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium">
                            {vehicle.make_name} {vehicle.model_name}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {vehicle.part_count} deler
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {vehicle.parts.map((part) => (
                            <Link
                              key={part.id}
                              href={`/parts/${part.id}`}
                              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="font-medium text-gray-900 mb-1">
                                {part.deler}
                              </div>
                              {part.delenummer_oem && (
                                <div className="text-sm text-gray-600 font-mono mb-1">
                                  OEM: {part.delenummer_oem}
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${
                                  part.antall === 0 
                                    ? "text-red-600" 
                                    : part.antall <= 2 
                                    ? "text-orange-600" 
                                    : "text-green-600"
                                }`}>
                                  {part.antall} stk
                                </span>
                                {part.utpris_m_mva && (
                                  <span className="text-sm font-medium text-gray-700">
                                    {part.utpris_m_mva.toFixed(2)} kr
                                  </span>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}