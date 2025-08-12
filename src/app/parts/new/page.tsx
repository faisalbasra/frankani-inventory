"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  name_norwegian: string | null;
}

interface Supplier {
  id: number;
  name: string;
}

interface CarMake {
  id: number;
  name: string;
}

export default function NewPartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  
  const [formData, setFormData] = useState({
    deler: "",
    delenummer_oem: "",
    category: "",
    leverandor: "",
    carMake: "",
    model: "",
    antall: 1,
    utpris_m_mva: "",
    plassering: "",
  });

  useEffect(() => {
    loadLookupData();
  }, []);

  const loadLookupData = async () => {
    try {
      const [categoriesRes, suppliersRes, makesRes] = await Promise.all([
        fetch("/api/settings/categories"),
        fetch("/api/settings/suppliers"),
        fetch("/api/settings/car-makes"),
      ]);

      setCategories(await categoriesRes.json());
      setSuppliers(await suppliersRes.json());
      setCarMakes(await makesRes.json());
    } catch (error) {
      console.error("Feil ved lasting av oppslagsdata:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          utpris_m_mva: formData.utpris_m_mva ? parseFloat(formData.utpris_m_mva) : null,
          antall: parseInt(formData.antall.toString()) || 0,
        }),
      });

      if (response.ok) {
        const newPart = await response.json();
        router.push(`/parts/${newPart.id}`);
      } else {
        const error = await response.json();
        alert(`Feil ved lagring: ${error.error}`);
      }
    } catch (error) {
      console.error("Feil ved lagring av del:", error);
      alert("Feil ved lagring av del");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Tilbake til Dashboard
        </Link>
        <div className="flex items-center mb-4">
          <Plus className="h-8 w-8 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-800">
            Legg til ny del
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Registrer en ny bildel i systemet
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delnavn */}
          <div className="lg:col-span-2">
            <label className="block text-lg font-medium mb-2">
              Delnavn *
            </label>
            <input
              type="text"
              required
              value={formData.deler}
              onChange={(e) => setFormData({ ...formData, deler: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="F.eks. Bremseskive, Luftfilter, etc."
            />
          </div>

          {/* OEM Nummer */}
          <div>
            <label className="block text-lg font-medium mb-2">
              OEM Nummer
            </label>
            <input
              type="text"
              value={formData.delenummer_oem}
              onChange={(e) => setFormData({ ...formData, delenummer_oem: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Original Equipment Manufacturer nummer"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name_norwegian || category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Leverandør */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Leverandør
            </label>
            <select
              value={formData.leverandor}
              onChange={(e) => setFormData({ ...formData, leverandor: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg leverandør</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bilmerke */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Bilmerke
            </label>
            <select
              value={formData.carMake}
              onChange={(e) => setFormData({ ...formData, carMake: e.target.value, model: e.target.value ? `${e.target.value} ` : "" })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Velg bilmerke</option>
              {carMakes.map((make) => (
                <option key={make.id} value={make.name}>
                  {make.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bilmodell */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Bilmodell
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.carMake ? `F.eks. ${formData.carMake} A4, ${formData.carMake} 320i` : "F.eks. Audi A4 B8, BMW 3 Series E90"}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.carMake ? `Bilmerke ${formData.carMake} er automatisk inkludert` : "Velg bilmerke først for smartere forslag"}
            </p>
          </div>

          {/* Antall */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Antall på lager *
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.antall}
              onChange={(e) => setFormData({ ...formData, antall: parseInt(e.target.value) || 0 })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Utsalgspris */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Utsalgspris (med mva)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.utpris_m_mva}
                onChange={(e) => setFormData({ ...formData, utpris_m_mva: e.target.value })}
                className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                kr
              </span>
            </div>
          </div>


          {/* Plassering */}
          <div>
            <label className="block text-lg font-medium mb-2">
              Plassering i lager
            </label>
            <input
              type="text"
              value={formData.plassering}
              onChange={(e) => setFormData({ ...formData, plassering: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="F.eks. Hylle A-3, Reol 2B"
            />
          </div>

        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Link
            href="/"
            className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            Avbryt
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-large bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? "Lagrer..." : "Lagre del"}
          </button>
        </div>
      </form>

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          💡 Tips for registrering av nye deler
        </h3>
        <ul className="text-blue-700 space-y-2">
          <li>• Fyll ut så mange felter som mulig for best søkbarhet</li>
          <li>• OEM-nummer gjør det mulig å bruke Polcar-integrasjonen</li>
          <li>• Velg bilmerke fra listen for bedre kategorisering og søk</li>
          <li>• Bilmodell kan være generisk (f.eks. "A4") eller spesifikk (f.eks. "A4 B8 2008-2015")</li>
          <li>• Plassering hjelper med å finne delen fysisk i lageret</li>
          <li>• Delen vil automatisk være tilgjengelig i søk etter lagring</li>
        </ul>
      </div>
    </div>
  );
}