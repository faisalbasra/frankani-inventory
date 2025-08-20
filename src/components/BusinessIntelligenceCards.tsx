"use client";

import { useState, useEffect } from "react";
import { DollarSign, Package, TrendingUp, AlertCircle, BarChart3, Car, ChevronDown, ChevronUp } from "lucide-react";

interface EnhancedStats {
  totalParts: number;
  financial: {
    totalInventoryValue: number;
    averagePartValue: number;
    zeroPriceParts: number;
    highValueParts: number;
  };
  distribution: {
    topCategories: Array<{ name: string; count: number; value: number; percentage: number }>;
    topSuppliers: Array<{ name: string; count: number; value: number; percentage: number }>;
    missingData: {
      noCategory: number;
      noSupplier: number;
      noOEM: number;
      noModel: number;
    };
  };
  compatibility: {
    stockDistribution: {
      zeroStock: number;
      lowStock: number;
      goodStock: number;
    };
    vehicleData: {
      partsWithCompatibility: number;
      totalCompatibilityRecords: number;
      manualRecords: number;
      polcarRecords: number;
    };
  };
}

export default function BusinessIntelligenceCards() {
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading BI stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('nb-NO').format(value);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCardClick = (cardIndex: number) => {
    setActiveCard(activeCard === cardIndex ? null : cardIndex);
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 animate-pulse">
          <div className="px-6 py-4">
            <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mb-8">
      {/* Compact Header Bar */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        {/* Toggle Header */}
        <button
          onClick={toggleExpanded}
          onKeyDown={(e) => handleKeyPress(e, toggleExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-label="Toggle business intelligence overview"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-slate-800">📊 Forretningsoversikt</h2>
            </div>
            
            {/* Quick Stats Preview (when collapsed) */}
            {!isExpanded && (
              <div className="hidden lg:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {formatCurrency(stats.financial.totalInventoryValue)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">{formatNumber(stats.totalParts)} deler</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Car className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700 font-medium">
                    {formatNumber(stats.compatibility.vehicleData.partsWithCompatibility)} kompatible
                  </span>
                </div>
                {stats.financial.zeroPriceParts > 0 && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-yellow-600 font-medium text-xs">
                      {formatNumber(stats.financial.zeroPriceParts)} mangler pris
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 hidden sm:block">
              {isExpanded ? "Skjul detaljer" : "Vis detaljer"}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-slate-600 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-600 transition-transform duration-200" />
            )}
          </div>
        </button>

        {/* Expandable Content */}
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-6 bg-white">
            {/* Card Selection Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
              {[
                { id: 0, icon: DollarSign, label: "💰 Økonomi", color: "green" },
                { id: 1, icon: BarChart3, label: "📊 Fordeling", color: "blue" },
                { id: 2, icon: Car, label: "🚗 Bil & Lager", color: "purple" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleCardClick(tab.id)}
                  onKeyDown={(e) => handleKeyPress(e, () => handleCardClick(tab.id))}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    activeCard === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-800 border-2 border-${tab.color}-300 shadow-sm`
                      : `bg-white text-slate-600 border border-slate-200 hover:bg-${tab.color}-50 hover:text-${tab.color}-700 hover:border-${tab.color}-200`
                  }`}
                  aria-pressed={activeCard === tab.id}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Card Content */}
            <div className="min-h-48">
              {activeCard !== null && (
                <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                  {activeCard === 0 && <FinancialCard stats={stats} formatCurrency={formatCurrency} formatNumber={formatNumber} />}
                  {activeCard === 1 && <DistributionCard stats={stats} formatNumber={formatNumber} />}
                  {activeCard === 2 && <VehicleCard stats={stats} formatNumber={formatNumber} />}
                </div>
              )}
              
              {activeCard === null && (
                <div className="text-center py-12 animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-lg font-medium mb-2">Velg en kategori ovenfor</p>
                  <p className="text-slate-500 text-sm">Klikk på en av tabene for å se detaljert forretningsdata</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Card Components
function FinancialCard({ stats, formatCurrency, formatNumber }: { stats: EnhancedStats, formatCurrency: (n: number) => string, formatNumber: (n: number) => string }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
      <div className="flex items-center mb-4">
        <DollarSign className="h-6 w-6 text-green-600 mr-2" />
        <h3 className="text-xl font-semibold text-slate-800">Økonomisk Oversikt</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-700 mb-1">
            {formatCurrency(stats.financial.totalInventoryValue)}
          </div>
          <div className="text-sm text-gray-600">Total lagerverdi</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-lg font-semibold text-green-600 mb-1">
            {formatCurrency(stats.financial.averagePartValue)}
          </div>
          <div className="text-sm text-gray-600">Gjennomsnittlig verdi per del</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-lg font-semibold text-green-600 mb-1">
            {formatNumber(stats.financial.highValueParts)}
          </div>
          <div className="text-sm text-gray-600">Høy verdi (&gt;1000kr)</div>
        </div>
        
        {stats.financial.zeroPriceParts > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-lg font-semibold text-yellow-700 mb-1">
              {formatNumber(stats.financial.zeroPriceParts)}
            </div>
            <div className="text-sm text-yellow-600">Deler uten pris (tapt omsetning)</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DistributionCard({ stats, formatNumber }: { stats: EnhancedStats, formatNumber: (n: number) => string }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center mb-4">
        <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-semibold text-slate-800">Fordeling & Analyse</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">🏷️ Top Kategorier</h4>
          <div className="space-y-3">
            {stats.distribution.topCategories.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">{cat.name}</span>
                <div className="text-right">
                  <div className="text-blue-700 font-semibold">{formatNumber(cat.count)}</div>
                  <div className="text-xs text-blue-600">{cat.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">🏢 Top Leverandører</h4>
          <div className="space-y-3">
            {stats.distribution.topSuppliers.slice(0, 3).map((sup, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">{sup.name}</span>
                <div className="text-right">
                  <div className="text-blue-700 font-semibold">{formatNumber(sup.count)}</div>
                  <div className="text-xs text-blue-600">{sup.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Data */}
        {(stats.distribution.missingData.noCategory + stats.distribution.missingData.noSupplier) > 0 && (
          <div className="lg:col-span-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Manglende Data</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Uten kategori: <span className="font-semibold text-yellow-700">{formatNumber(stats.distribution.missingData.noCategory)}</span></div>
              <div>Uten leverandør: <span className="font-semibold text-yellow-700">{formatNumber(stats.distribution.missingData.noSupplier)}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleCard({ stats, formatNumber }: { stats: EnhancedStats, formatNumber: (n: number) => string }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
      <div className="flex items-center mb-4">
        <Car className="h-6 w-6 text-purple-600 mr-2" />
        <h3 className="text-xl font-semibold text-slate-800">Bil & Lager Status</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">📦 Beholdningsfordeling</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-red-600">{formatNumber(stats.compatibility.stockDistribution.zeroStock)}</div>
              <div className="text-xs text-red-600">Tom</div>
            </div>
            <div>
              <div className="text-xl font-bold text-yellow-600">{formatNumber(stats.compatibility.stockDistribution.lowStock)}</div>
              <div className="text-xs text-yellow-600">Lav (1-5)</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">{formatNumber(stats.compatibility.stockDistribution.goodStock)}</div>
              <div className="text-xs text-green-600">God (5+)</div>
            </div>
          </div>
        </div>

        {/* Compatibility Stats */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-gray-700 mb-3">🔗 Kompatibilitet</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Deler med bil-data:</span>
              <span className="font-semibold text-purple-600">
                {formatNumber(stats.compatibility.vehicleData.partsWithCompatibility)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Polcar records:</span>
              <span className="font-semibold text-green-600">
                {formatNumber(stats.compatibility.vehicleData.polcarRecords)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Manuelle records:</span>
              <span className="font-semibold text-blue-600">
                {formatNumber(stats.compatibility.vehicleData.manualRecords)}
              </span>
            </div>
          </div>
        </div>

        {/* OEM Coverage */}
        {stats.distribution.missingData.noOEM > 0 && (
          <div className="lg:col-span-2 bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">💡 Polcar Mulighet</h4>
            <div className="text-sm text-orange-700">
              <span className="font-semibold">{formatNumber(stats.distribution.missingData.noOEM)}</span> deler uten OEM-nummer kan være tilgjengelige via Polcar-oppslag
            </div>
          </div>
        )}
      </div>
    </div>
  );
}