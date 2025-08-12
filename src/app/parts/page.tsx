"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Package, ExternalLink, AlertTriangle, Filter, Settings, Eye, EyeOff, Columns, ChevronUp, ChevronDown, ArrowUpDown, X } from "lucide-react";
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

// Column configuration
const COLUMNS = {
  part: { key: 'part', label: 'Del', defaultVisible: true, sortable: false },
  oem: { key: 'oem', label: 'OEM', defaultVisible: true, sortable: false },
  category: { key: 'category', label: 'Kategori', defaultVisible: true, sortable: true },
  supplier: { key: 'supplier', label: 'Leverandør', defaultVisible: true, sortable: true },
  quantity: { key: 'quantity', label: 'Antall', defaultVisible: true, sortable: true },
  price: { key: 'price', label: 'Pris', defaultVisible: true, sortable: true },
  model: { key: 'model', label: 'Bilmodell', defaultVisible: false, sortable: false },
  location: { key: 'location', label: 'Plassering', defaultVisible: false, sortable: false },
  actions: { key: 'actions', label: 'Handlinger', defaultVisible: true, sortable: false }
} as const;

export default function AllPartsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low_stock" | "no_stock">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const itemsPerPage = 20;

  // Initialize column visibility from localStorage or defaults
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('partsTableColumns');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // Default visibility
    return Object.fromEntries(
      Object.entries(COLUMNS).map(([key, config]) => [key, config.defaultVisible])
    );
  });

  useEffect(() => {
    loadItems();
  }, [filter, searchTerm, currentPage]);

  // Close column settings when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showColumnSettings && !target.closest('[data-column-settings]')) {
        setShowColumnSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnSettings]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        filter,
        search: searchTerm,
      });

      const response = await fetch(`/api/parts?${params}`);
      const data = await response.json();
      
      setItems(data.items || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error("Feil ved lasting av deler:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleFilterChange = (newFilter: "all" | "low_stock" | "no_stock") => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisibility = {
      ...columnVisibility,
      [columnKey]: !columnVisibility[columnKey]
    };
    setColumnVisibility(newVisibility);
    localStorage.setItem('partsTableColumns', JSON.stringify(newVisibility));
  };

  const resetColumnsToDefault = () => {
    const defaultVisibility = Object.fromEntries(
      Object.entries(COLUMNS).map(([key, config]) => [key, config.defaultVisible])
    );
    setColumnVisibility(defaultVisibility);
    localStorage.setItem('partsTableColumns', JSON.stringify(defaultVisibility));
  };

  const visibleColumns = Object.entries(COLUMNS).filter(([key]) => columnVisibility[key]);

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  const getSortedItems = (items: InventoryItem[]) => {
    if (!sortConfig.key) return items;

    return [...items].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'supplier':
          aValue = a.leverandor || '';
          bValue = b.leverandor || '';
          break;
        case 'quantity':
          aValue = a.antall;
          bValue = b.antall;
          break;
        case 'price':
          aValue = a.utpris_m_mva || 0;
          bValue = b.utpris_m_mva || 0;
          break;
        default:
          return 0;
      }

      if (sortConfig.key === 'quantity' || sortConfig.key === 'price') {
        // Numeric sorting
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      } else {
        // String sorting
        const comparison = aValue.localeCompare(bValue, 'no', { 
          sensitivity: 'base',
          numeric: true 
        });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
    });
  };

  const sortedItems = getSortedItems(items);

  const renderTableCell = (item: InventoryItem, columnKey: string) => {
    switch (columnKey) {
      case 'part':
        return (
          <td className="py-4 px-6">
            <div>
              <div className="font-medium text-gray-900">
                {item.deler || "Ukjent del"}
              </div>
              {!columnVisibility.location && item.lagerplass && (
                <div className="text-sm text-gray-500">
                  📍 {item.lagerplass}
                </div>
              )}
            </div>
          </td>
        );
      case 'oem':
        return (
          <td className="py-4 px-6">
            <div className="font-mono text-sm">
              {item.delenummer_oem || "N/A"}
            </div>
          </td>
        );
      case 'category':
        return (
          <td className="py-4 px-6">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {item.category || "Ukjent"}
            </span>
          </td>
        );
      case 'supplier':
        return (
          <td className="py-4 px-6">
            <div className="text-sm">
              {item.leverandor || "N/A"}
            </div>
          </td>
        );
      case 'quantity':
        return (
          <td className="py-4 px-6 text-center">
            <div className={`font-bold text-lg ${
              item.antall === 0 
                ? "text-red-600" 
                : item.antall <= 2 
                ? "text-orange-600" 
                : "text-green-600"
            }`}>
              {item.antall}
            </div>
            {item.antall <= 2 && (
              <AlertTriangle className="h-4 w-4 text-red-500 mx-auto mt-1" />
            )}
          </td>
        );
      case 'price':
        return (
          <td className="py-4 px-6 text-right">
            <div className="font-semibold">
              {item.utpris_m_mva 
                ? `${item.utpris_m_mva.toFixed(2)} kr`
                : "N/A"
              }
            </div>
          </td>
        );
      case 'model':
        return (
          <td className="py-4 px-6">
            <div className="text-sm">
              {item.model || "N/A"}
            </div>
          </td>
        );
      case 'location':
        return (
          <td className="py-4 px-6">
            <div className="text-sm">
              {item.lagerplass ? `📍 ${item.lagerplass}` : "N/A"}
            </div>
          </td>
        );
      case 'actions':
        return (
          <td className="py-4 px-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Link
                href={`/parts/${item.id}`}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Detaljer
              </Link>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </td>
        );
      default:
        return <td className="py-4 px-6">N/A</td>;
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
          <Package className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-slate-800">
            Alle Deler
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          Oversikt over alle deler i lageret med filter- og søkefunksjoner
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-large w-full pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Søk i alle deler..."
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value as any)}
              className="input-large w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Alle deler</option>
              <option value="low_stock">Lav beholdning (≤2)</option>
              <option value="no_stock">Ikke på lager (0)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-4">
            {sortConfig.key && (
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg flex items-center space-x-2">
                {sortConfig.direction === 'asc' ? (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                )}
                <span>
                  Sortert: <strong>{COLUMNS[sortConfig.key as keyof typeof COLUMNS]?.label}</strong>
                </span>
                <button
                  onClick={() => setSortConfig({ key: null, direction: 'asc' })}
                  className="ml-2 p-1 hover:bg-blue-100 rounded text-blue-600"
                  title="Fjern sortering"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="text-lg font-medium text-slate-700">
              {totalItems.toLocaleString()} deler
            </div>
            <div className="relative" data-column-settings>
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="btn-large bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Columns className="h-5 w-5 mr-2" />
                Kolonner
              </button>
              
              {showColumnSettings && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Kolonnevisning</h3>
                      <button
                        onClick={resetColumnsToDefault}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Tilbakestill
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Velg hvilke kolonner som skal vises i tabellen
                    </p>
                  </div>
                  
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {Object.entries(COLUMNS).map(([key, config]) => (
                      <label
                        key={key}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={columnVisibility[key]}
                          onChange={() => toggleColumnVisibility(key)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          {columnVisibility[key] ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            columnVisibility[key] ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {config.label}
                          </span>
                        </div>
                        {config.defaultVisible && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            Standard
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                    <div className="text-sm text-gray-600">
                      <strong>{visibleColumns.length}</strong> av {Object.keys(COLUMNS).length} kolonner synlige
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
            <div className="text-sm text-gray-600">Totalt antall deler</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {items.filter(item => item.antall <= 2).length}
            </div>
            <div className="text-sm text-gray-600">Lav beholdning</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {items.filter(item => item.antall > 2).length}
            </div>
            <div className="text-sm text-gray-600">God beholdning</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg">Laster deler...</div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Ingen deler funnet
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Prøv å søke med andre termer eller endre filteret"
                  : "Det ser ut til at lageret er tomt. Importer data for å komme i gang."
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {visibleColumns.map(([key, config]) => (
                        <th 
                          key={key}
                          className={`py-4 px-6 font-semibold text-gray-700 ${
                            key === 'quantity' || key === 'actions' ? 'text-center' : 
                            key === 'price' ? 'text-right' : 'text-left'
                          } ${config.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}
                          onClick={config.sortable ? () => handleSort(key) : undefined}
                        >
                          <div className={`flex items-center space-x-2 ${
                            key === 'quantity' || key === 'actions' ? 'justify-center' : 
                            key === 'price' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{config.label}</span>
                            {config.sortable && (
                              <div className="flex flex-col">
                                {sortConfig.key === key ? (
                                  sortConfig.direction === 'asc' ? (
                                    <ChevronUp className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                  )
                                ) : (
                                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        {visibleColumns.map(([key]) => 
                          renderTableCell(item, key)
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-600">
                    Viser {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} av {totalItems} deler
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Forrige
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + Math.max(1, currentPage - 2);
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg ${
                              page === currentPage
                                ? "bg-indigo-600 text-white"
                                : "bg-white border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Neste
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}