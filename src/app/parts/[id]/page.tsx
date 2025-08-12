"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Save, 
  Car, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  AlertTriangle,
  Edit3,
  ExternalLink,
  Trash2
} from "lucide-react";
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

interface CompatibleVehicle {
  id: number;
  make_name: string;
  model_name: string;
  year_from: number | null;
  year_to: number | null;
  engine_code: string | null;
  source: string;
  verified: boolean;
}

export default function PartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [compatibleVehicles, setCompatibleVehicles] = useState<CompatibleVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingPolcar, setCheckingPolcar] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadItem();
      loadCompatibleVehicles();
    }
  }, [params.id]);

  const loadItem = async () => {
    try {
      const response = await fetch(`/api/parts/${params.id}`);
      const data = await response.json();
      setItem(data);
      setTempQuantity(data.antall);
      setEditData(data);
    } catch (error) {
      console.error("Feil ved lasting av del:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompatibleVehicles = async () => {
    try {
      const response = await fetch(`/api/parts/${params.id}/compatibility`);
      const data = await response.json();
      setCompatibleVehicles(data);
    } catch (error) {
      console.error("Feil ved lasting av kompatibilitet:", error);
    }
  };

  const updateQuantity = async (newQuantity: number) => {
    if (!item || newQuantity < 0) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/parts/${params.id}/quantity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (response.ok) {
        setItem({ ...item, antall: newQuantity });
        setTempQuantity(newQuantity);
      }
    } catch (error) {
      console.error("Feil ved oppdatering av antall:", error);
    } finally {
      setSaving(false);
    }
  };

  const checkPolcarCompatibility = async () => {
    if (!item?.delenummer_oem) return;

    setCheckingPolcar(true);
    try {
      const response = await fetch(`/api/polcar/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemId: item.id, 
          oemNumber: item.delenummer_oem 
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setItem({ ...item, compatibility_status: "found" });
        loadCompatibleVehicles();
      } else {
        setItem({ ...item, compatibility_status: "not_found" });
      }
    } catch (error) {
      console.error("Polcar-sjekk feilet:", error);
    } finally {
      setCheckingPolcar(false);
    }
  };

  const saveChanges = async () => {
    if (!item) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/parts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updated = await response.json();
        setItem(updated);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Feil ved lagring:", error);
    } finally {
      setSaving(false);
    }
  };

  const deletePart = async () => {
    if (!item) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/parts/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Success - redirect to dashboard
        router.push('/');
      } else {
        const error = await response.json();
        alert(`Feil ved sletting: ${error.error}`);
      }
    } catch (error) {
      console.error("Feil ved sletting av del:", error);
      alert("Det oppstod en feil ved sletting av delen");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const deleteCompatibility = async (compatibilityId: number) => {
    try {
      const response = await fetch(`/api/parts/${params.id}/compatibility/${compatibilityId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadCompatibleVehicles();
      }
    } catch (error) {
      console.error("Feil ved sletting av kompatibilitet:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Laster...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Del ikke funnet</h2>
        <Link href="/search" className="btn-large bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Tilbake til søk
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link
          href="/search"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Tilbake til søk
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">
            {item.deler || "Ukjent del"}
          </h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="btn-large bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <Edit3 className="h-5 w-5 mr-2" />
            {editMode ? "Avbryt" : "Rediger"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">Delinformasjon</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    OEM Nummer
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.delenummer_oem || ""}
                      onChange={(e) => setEditData({ ...editData, delenummer_oem: e.target.value })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg font-mono">{item.delenummer_oem || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Kategori
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.category || ""}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg">{item.category || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Leverandør
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.leverandor || ""}
                      onChange={(e) => setEditData({ ...editData, leverandor: e.target.value })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg">{item.leverandor || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Bilmodell
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.model || ""}
                      onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg">{item.model || "N/A"}</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Lagerplass
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.lagerplass || ""}
                      onChange={(e) => setEditData({ ...editData, lagerplass: e.target.value })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg">{item.lagerplass || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Lagerkode
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.lagerkode || ""}
                      onChange={(e) => setEditData({ ...editData, lagerkode: e.target.value })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg">{item.lagerkode || "N/A"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Pris (m/mva)
                  </label>
                  {editMode ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editData.utpris_m_mva || ""}
                      onChange={(e) => setEditData({ ...editData, utpris_m_mva: parseFloat(e.target.value) })}
                      className="input-large w-full border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div className="text-lg font-semibold">
                      {item.utpris_m_mva ? `${item.utpris_m_mva.toFixed(2)} kr` : "N/A"}
                    </div>
                  )}
                </div>

                {item.link && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Link
                    </label>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Åpne link
                    </a>
                  </div>
                )}
              </div>
            </div>

            {editMode && (
              <div className="flex justify-between pt-6 border-t mt-6">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-large bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Slett del
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="btn-large bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? "Lagrer..." : "Lagre endringer"}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Kompatible biler</h2>
              {item.delenummer_oem && (
                <button
                  onClick={checkPolcarCompatibility}
                  disabled={checkingPolcar}
                  className="btn-large bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {checkingPolcar ? "Sjekker Polcar..." : "Sjekk Polcar"}
                </button>
              )}
            </div>

            {compatibleVehicles.length > 0 ? (
              <div className="space-y-3">
                {compatibleVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="font-medium">
                          {vehicle.make_name} {vehicle.model_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {vehicle.year_from && vehicle.year_to 
                            ? `${vehicle.year_from}-${vehicle.year_to}`
                            : vehicle.year_from 
                            ? `Fra ${vehicle.year_from}`
                            : "Alle år"
                          }
                          {vehicle.engine_code && ` • Motor: ${vehicle.engine_code}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        vehicle.source === "polcar_auto" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {vehicle.source === "polcar_auto" ? "Polcar" : "Manuell"}
                      </span>
                      
                      {vehicle.verified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}

                      <button
                        onClick={() => deleteCompatibility(vehicle.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Ingen kompatible biler registrert ennå</p>
                <p className="text-sm mt-2">
                  Bruk "Sjekk Polcar" for automatisk oppslag
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">Lager</h2>
            
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold mb-2 ${
                item.antall <= 2 ? "text-red-600" : "text-green-600"
              }`}>
                {item.antall}
              </div>
              <div className="text-gray-600">stykker på lager</div>
              {item.antall <= 2 && (
                <div className="flex items-center justify-center mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Lav beholdning!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={() => updateQuantity(tempQuantity - 1)}
                disabled={saving || tempQuantity <= 0}
                className="btn-large bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Minus className="h-6 w-6" />
              </button>
              
              <input
                type="number"
                min="0"
                value={tempQuantity}
                onChange={(e) => setTempQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="input-large w-20 text-center border border-gray-300 rounded-lg"
              />
              
              <button
                onClick={() => updateQuantity(tempQuantity + 1)}
                disabled={saving}
                className="btn-large bg-green-500 text-white rounded-full p-3 hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            {tempQuantity !== item.antall && (
              <button
                onClick={() => updateQuantity(tempQuantity)}
                disabled={saving}
                className="btn-large w-full bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Lagrer..." : "Oppdater antall"}
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">Status</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kompatibilitet:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  item.compatibility_status === "found" 
                    ? "bg-green-100 text-green-800" 
                    : item.compatibility_status === "checking"
                    ? "bg-yellow-100 text-yellow-800"
                    : item.compatibility_status === "not_found"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {item.compatibility_status === "found" && "Funnet"}
                  {item.compatibility_status === "checking" && "Sjekker"}
                  {item.compatibility_status === "not_found" && "Ikke funnet"}
                  {item.compatibility_status === "unchecked" && "Ikke sjekket"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Webshop:</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  item.webshop_done 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {item.webshop_done ? "Ferdig" : "Ikke ferdig"}
                </span>
              </div>

              {item.evt_bestilltid && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Bestilltid:</span>
                  <span className="text-sm">{item.evt_bestilltid}</span>
                </div>
              )}

              {item.leverandor_pa_lager && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Leverandør lager:</span>
                  <span className="text-sm">{item.leverandor_pa_lager}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Slett bildel permanent
                  </h3>
                  <p className="text-sm text-gray-500">
                    Denne handlingen kan ikke angres
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Del som slettes:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Navn:</span>
                    <span className="font-medium">{item?.deler || 'Ukjent del'}</span>
                  </div>
                  {item?.delenummer_oem && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">OEM:</span>
                      <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {item.delenummer_oem}
                      </code>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Antall på lager:</span>
                    <span className={`font-medium ${
                      item?.antall === 0 
                        ? 'text-red-600' 
                        : item?.antall && item.antall <= 2 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {item?.antall || 0} stk
                    </span>
                  </div>
                  {item?.category && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-red-800">
                      Advarsel - Permanent sletting
                    </h4>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Denne delen og all tilhørende data vil bli slettet permanent:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Bilkompatibilitet</li>
                        <li>Polcar-oppslag historikk</li>
                        <li>Aktivitetslogg</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 btn-large bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Avbryt
                </button>
                <button
                  onClick={deletePart}
                  disabled={isDeleting}
                  className="flex-1 btn-large bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sletter...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Slett permanent
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}