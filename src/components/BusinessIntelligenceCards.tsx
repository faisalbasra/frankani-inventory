"use client";

import { useState, useEffect } from "react";
import { DollarSign, Package, TrendingUp, AlertCircle, BarChart3, Car } from "lucide-react";

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="h-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Financial Overview Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-slate-800">Lager-Verdi</h3>
          </div>
          {stats.financial.zeroPriceParts > 0 && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-green-700">
              {formatCurrency(stats.financial.totalInventoryValue)}
            </span>
            <span className="text-xs text-gray-600">Total verdi</span>
          </div>
          
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Snitt per del:</span>
              <span className="font-medium">{formatCurrency(stats.financial.averagePartValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hoy verdi (&gt;1000kr):</span>
              <span className="font-medium text-green-600">{formatNumber(stats.financial.highValueParts)}</span>
            </div>
            {stats.financial.zeroPriceParts > 0 && (
              <div className="flex justify-between">
                <span className="text-yellow-600">Mangler pris:</span>
                <span className="font-medium text-yellow-600">{formatNumber(stats.financial.zeroPriceParts)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Suppliers Card */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-slate-800">Fordeling</h3>
          </div>
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
        
        <div className="space-y-3">
          {/* Top Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Top Kategorier:</h4>
            <div className="space-y-1">
              {stats.distribution.topCategories.slice(0, 2).map((cat, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate max-w-20">{cat.name}</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{cat.count}</span>
                    <span className="text-blue-600">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Suppliers */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Top Leverandører:</h4>
            <div className="space-y-1">
              {stats.distribution.topSuppliers.slice(0, 2).map((sup, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-gray-600 truncate max-w-20">{sup.name}</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{sup.count}</span>
                    <span className="text-blue-600">({sup.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Data Warning */}
          {(stats.distribution.missingData.noCategory + stats.distribution.missingData.noSupplier) > 0 && (
            <div className="text-xs text-yellow-600 bg-yellow-50 p-1 rounded">
              ⚠️ {stats.distribution.missingData.noCategory + stats.distribution.missingData.noSupplier} deler mangler data
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Compatibility & Stock Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Car className="h-6 w-6 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-slate-800">Bil & Lager</h3>
          </div>
          <Package className="h-5 w-5 text-purple-500" />
        </div>
        
        <div className="space-y-3">
          {/* Stock Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Beholdning:</h4>
            <div className="flex justify-between text-xs">
              <div className="text-center">
                <div className="font-bold text-red-600">{stats.compatibility.stockDistribution.zeroStock}</div>
                <div className="text-gray-500">Tom</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-600">{stats.compatibility.stockDistribution.lowStock}</div>
                <div className="text-gray-500">Lav (1-5)</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{stats.compatibility.stockDistribution.goodStock}</div>
                <div className="text-gray-500">God (5+)</div>
              </div>
            </div>
          </div>

          {/* Compatibility Stats */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Kompatibilitet:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Deler med bil-data:</span>
                <span className="font-medium text-purple-600">
                  {stats.compatibility.vehicleData.partsWithCompatibility}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Polcar records:</span>
                <span className="font-medium text-green-600">
                  {stats.compatibility.vehicleData.polcarRecords}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manuell records:</span>
                <span className="font-medium text-blue-600">
                  {stats.compatibility.vehicleData.manualRecords}
                </span>
              </div>
            </div>
          </div>

          {/* OEM Coverage */}
          {stats.distribution.missingData.noOEM > 0 && (
            <div className="text-xs text-orange-600 bg-orange-50 p-1 rounded">
              💡 {stats.distribution.missingData.noOEM} deler uten OEM (Polcar mulig)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}