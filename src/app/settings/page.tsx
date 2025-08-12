"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit3, Trash2, Save, X } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  name_norwegian: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Supplier {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  notes: string | null;
  is_active: boolean;
}

interface CarMake {
  id: number;
  name: string;
  country: string | null;
  is_active: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "suppliers" | "makes">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [carMakes, setCarMakes] = useState<CarMake[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
      console.error("Feil ved lasting av innstillinger:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async (category: Partial<Category>) => {
    try {
      const url = category.id ? `/api/settings/categories/${category.id}` : "/api/settings/categories";
      const method = category.id ? "PATCH" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      
      loadData();
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Feil ved lagring av kategori:", error);
    }
  };

  const saveSupplier = async (supplier: Partial<Supplier>) => {
    try {
      const url = supplier.id ? `/api/settings/suppliers/${supplier.id}` : "/api/settings/suppliers";
      const method = supplier.id ? "PATCH" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });
      
      loadData();
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Feil ved lagring av leverandør:", error);
    }
  };

  const saveCarMake = async (make: Partial<CarMake>) => {
    try {
      const url = make.id ? `/api/settings/car-makes/${make.id}` : "/api/settings/car-makes";
      const method = make.id ? "PATCH" : "POST";
      
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(make),
      });
      
      loadData();
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error) {
      console.error("Feil ved lagring av bilmerke:", error);
    }
  };

  const deleteItem = async (type: string, id: number) => {
    if (!confirm("Er du sikker på at du vil slette dette elementet?")) return;

    try {
      await fetch(`/api/settings/${type}/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error("Feil ved sletting:", error);
    }
  };

  const CategoryForm = ({ category, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(category || {
      name: "",
      name_norwegian: "",
      description: "",
      sort_order: 0,
      is_active: true
    });

    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Navn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Norsk navn</label>
            <input
              type="text"
              value={formData.name_norwegian || ""}
              onChange={(e) => setFormData({ ...formData, name_norwegian: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Beskrivelse</label>
            <textarea
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </button>
          <button
            onClick={() => onSave(formData)}
            className="btn-large bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Lagre
          </button>
        </div>
      </div>
    );
  };

  const SupplierForm = ({ supplier, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(supplier || {
      name: "",
      contact_email: "",
      contact_phone: "",
      website_url: "",
      notes: "",
      is_active: true
    });

    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Navn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">E-post</label>
            <input
              type="email"
              value={formData.contact_email || ""}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <input
              type="text"
              value={formData.contact_phone || ""}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nettside</label>
            <input
              type="url"
              value={formData.website_url || ""}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Notater</label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </button>
          <button
            onClick={() => onSave(formData)}
            className="btn-large bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Lagre
          </button>
        </div>
      </div>
    );
  };

  const CarMakeForm = ({ carMake, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(carMake || {
      name: "",
      country: "",
      is_active: true
    });

    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Navn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
              placeholder="Bilmerke navn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Land</label>
            <input
              type="text"
              value={formData.country || ""}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="input-large w-full border border-gray-300 rounded-lg"
              placeholder="Opprinnelsesland"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onCancel}
            className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <X className="h-4 w-4 mr-2" />
            Avbryt
          </button>
          <button
            onClick={() => onSave(formData)}
            className="btn-large bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Lagre
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="text-lg">Laster...</div></div>;
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Innstillinger og Administrasjon
        </h1>
        <p className="text-lg text-slate-600">
          Administrer kategorier, leverandører og bilmerker
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Kategorier ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("suppliers")}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === "suppliers"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Leverandører ({suppliers.length})
            </button>
            <button
              onClick={() => setActiveTab("makes")}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === "makes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Bilmerker ({carMakes.length})
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {activeTab === "categories" && "Kategorier"}
              {activeTab === "suppliers" && "Leverandører"}
              {activeTab === "makes" && "Bilmerker"}
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-large bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Legg til ny
            </button>
          </div>

          {showAddForm && (
            <div className="mb-8">
              {activeTab === "categories" && (
                <CategoryForm
                  onSave={saveCategory}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
              {activeTab === "suppliers" && (
                <SupplierForm
                  onSave={saveSupplier}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
              {activeTab === "makes" && (
                <CarMakeForm
                  onSave={saveCarMake}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </div>
          )}

          <div className="space-y-4">
            {activeTab === "categories" && categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-6">
                {editingItem?.id === category.id ? (
                  <CategoryForm
                    category={editingItem}
                    onSave={saveCategory}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      {category.name_norwegian && (
                        <p className="text-gray-600">{category.name_norwegian}</p>
                      )}
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {category.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                      <button
                        onClick={() => setEditingItem(category)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem("categories", category.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {activeTab === "suppliers" && suppliers.map((supplier) => (
              <div key={supplier.id} className="border border-gray-200 rounded-lg p-6">
                {editingItem?.id === supplier.id ? (
                  <SupplierForm
                    supplier={editingItem}
                    onSave={saveSupplier}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{supplier.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {supplier.contact_email && <div>E-post: {supplier.contact_email}</div>}
                        {supplier.contact_phone && <div>Telefon: {supplier.contact_phone}</div>}
                        {supplier.website_url && (
                          <div>
                            <a href={supplier.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {supplier.website_url}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        supplier.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {supplier.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                      <button
                        onClick={() => setEditingItem(supplier)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem("suppliers", supplier.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {activeTab === "makes" && carMakes.map((make) => (
              <div key={make.id} className="border border-gray-200 rounded-lg p-6">
                {editingItem?.id === make.id ? (
                  <CarMakeForm
                    carMake={editingItem}
                    onSave={saveCarMake}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{make.name}</h3>
                      {make.country && <p className="text-gray-600">{make.country}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        make.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {make.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                      <button
                        onClick={() => setEditingItem(make)}
                        className="p-2 text-blue-600 hover:text-blue-800"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteItem("car-makes", make.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}