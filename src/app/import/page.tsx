"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ImportResult {
  success: boolean;
  message: string;
  stats?: {
    totalRows: number;
    processed: number;
    newCategories: number;
    newSuppliers: number;
    newCarMakes: number;
    newCarModels: number;
    errors: string[];
  };
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result: ImportResult = await response.json();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: "Feil ved import: " + (error as Error).message
      });
    } finally {
      setImporting(false);
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Importer Excel Data
        </h1>
        <p className="text-lg text-slate-600">
          Last opp Excel-fil med bildeler for automatisk import og databehandling
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-xl font-semibold mb-6">Last opp fil</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          
          {!file ? (
            <>
              <p className="text-lg text-gray-600 mb-4">
                Velg eller dra en Excel-fil hit
              </p>
              <p className="text-gray-500 mb-6">
                Støttede formater: .xlsx, .xls
              </p>
              <label className="btn-large bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Velg fil
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <div>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-800 mb-2">
                {file.name}
              </p>
              <p className="text-gray-600 mb-6">
                Størrelse: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="btn-large bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {importing ? "Importerer..." : "Start Import"}
                </button>
                <button
                  onClick={() => setFile(null)}
                  className="btn-large bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold mb-6">Import Resultat</h2>
          
          <div className={`flex items-center mb-4 ${result.success ? "text-green-600" : "text-red-600"}`}>
            {result.success ? (
              <CheckCircle className="h-6 w-6 mr-2" />
            ) : (
              <AlertCircle className="h-6 w-6 mr-2" />
            )}
            <span className="text-lg font-medium">{result.message}</span>
          </div>

          {result.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-6">
              <div>
                <div className="text-2xl font-bold text-blue-600">{result.stats.totalRows}</div>
                <div className="text-gray-600">Totale rader</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{result.stats.processed}</div>
                <div className="text-gray-600">Prosessert</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{result.stats.newCategories}</div>
                <div className="text-gray-600">Nye kategorier</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{result.stats.newSuppliers}</div>
                <div className="text-gray-600">Nye leverandører</div>
              </div>
            </div>
          )}

          {result.stats?.errors && result.stats.errors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-red-600 mb-3">Feil og advarsler:</h3>
              <div className="bg-red-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {result.stats.errors.map((error, index) => (
                  <div key={index} className="text-red-700 py-1">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          Smart Import Funksjoner
        </h3>
        <ul className="text-blue-700 space-y-2">
          <li>• Automatisk gjenkjenning av kategorier og leverandører</li>
          <li>• Intelligent parsing av bilmodeller (f.eks. "Audi 80 B2")</li>
          <li>• Deteksjon og standardisering av duplikater</li>
          <li>• Validering av data med forslag til rettelser</li>
          <li>• Norsk tekst-encoding support</li>
        </ul>
      </div>
    </div>
  );
}