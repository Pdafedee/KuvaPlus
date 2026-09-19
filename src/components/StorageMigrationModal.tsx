import { useState } from 'react';
import {
  Database,
  FileJson,
  ArrowRight,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Server,
  HardDrive,
  Shield,
  Layers,
} from 'lucide-react';
import { AppState } from '../types';
import {
  exportToPdf,
  exportToDoc,
  exportToTxt,
  downloadJsonFile,
  downloadSqlDump,
} from '../services/exportService';
import { sqliteManager } from '../services/sqliteManager';

interface StorageMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onRefreshStorage?: () => void;
}

export default function StorageMigrationModal({
  isOpen,
  onClose,
  appState,
  onRefreshStorage,
}: StorageMigrationModalProps) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'persistence' | 'export'>('persistence');

  if (!isOpen) return null;

  const jsonString = JSON.stringify(appState, null, 2);
  const jsonSizeBytes = new Blob([jsonString]).size;
  const jsonSizeKb = (jsonSizeBytes / 1024).toFixed(2);

  const handleManualMigrate = async () => {
    setIsMigrating(true);
    setMigrationStatus(null);
    try {
      // 1. Client-side WASM SQLite migration
      await sqliteManager.init();
      await sqliteManager.migrateFromJson(appState);

      // 2. Server-side persistence sync
      const res = await fetch('/api/data/sync-to-sqlite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appState),
      });
      const data = await res.json();

      setMigrationStatus(
        `Migración exitosa a SQLite (kba_mas): ${appState.products.length} productos, ${appState.businesses.length} comercios, ${appState.transactions.length} transacciones y ${appState.blockchain.length} bloques asegurados.`
      );
      if (onRefreshStorage) onRefreshStorage();
    } catch (err: any) {
      setMigrationStatus(`Error durante la migración: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDownloadSql = () => {
    downloadSqlDump(appState, 'kba_mas.sql');
  };

  const handleDownloadJson = () => {
    downloadJsonFile(appState, 'kba_mas.json');
  };

  const handleDownloadBinaryDb = () => {
    sqliteManager.exportDatabaseFile('kba_mas.db');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">Persistencia JSON y Migración SQLite (kba_mas)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Sub tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-3 bg-slate-50">
          <button
            onClick={() => setActiveTab('persistence')}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'persistence'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Persistencia & Migración SQLite
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Salidas (PDF, DOC, TXT)
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {activeTab === 'persistence' ? (
            <>
              {/* Dual Persistence status cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <FileJson className="w-4 h-4 text-amber-600" />
                      JSON Persistente
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Activo
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Almacenamiento ultra-ligero para poca señal sin necesidad de contenedores Docker.
                  </p>
                  <div className="pt-2 text-xs font-mono text-slate-700">
                    Tamaño: <span className="font-bold">{jsonSizeKb} KB</span> ({appState.products.length + appState.transactions.length + appState.businesses.length} registros)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Database className="w-4 h-4 text-indigo-600" />
                      SQLite (kba_mas)
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded">
                      Auto-Migración
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Base de datos estructurada que se sincroniza automáticamente al crecer el volumen.
                  </p>
                  <div className="pt-2 text-xs font-mono text-slate-700">
                    Tablas: <span className="font-bold">5 tablas relacionales</span>
                  </div>
                </div>
              </div>

              {/* Migration trigger */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900">
                    Sincronizar y Migrar Ahora a SQLite (kba_mas)
                  </span>
                  <button
                    onClick={handleManualMigrate}
                    disabled={isMigrating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isMigrating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Layers className="w-3.5 h-3.5" />
                    )}
                    {isMigrating ? 'Migrando...' : 'Ejecutar Migración'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Transforma el JSON incremental en sentencias normalizadas SQL (DDL y DML) dentro de la base de datos local <code className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">kba_mas.db</code>.
                </p>
              </div>

              {migrationStatus && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{migrationStatus}</span>
                </div>
              )}

              {/* Downloads section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block">
                  Descarga Directa de Base de Datos y Respaldos:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={handleDownloadJson}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium flex flex-col items-center gap-1 text-center transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-amber-600" />
                    Descargar JSON (kba_mas.json)
                  </button>

                  <button
                    onClick={handleDownloadSql}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium flex flex-col items-center gap-1 text-center transition-colors"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Script SQL (kba_mas.sql)
                  </button>

                  <button
                    onClick={handleDownloadBinaryDb}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-medium flex flex-col items-center gap-1 text-center transition-colors"
                  >
                    <Database className="w-4 h-4 text-emerald-600" />
                    Base SQLite (kba_mas.db)
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* EXPORT VIEW (PDF, DOC, TXT) */
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                Genera reportes ejecutivos consolidados con toda la información de Ganvent (inventario), Lokoo+ (directorio comercial), FinaPartner (finanzas) y sellos Blockchain.
              </div>

              <div className="space-y-2.5">
                {/* PDF */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Documento PDF Formal</h4>
                      <p className="text-[11px] text-slate-500">
                        Informe con tablas formateadas, totales CUP/USD y sello criptográfico.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportToPdf(appState)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar PDF
                  </button>
                </div>

                {/* DOC */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      DOC
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Documento Word (.doc)</h4>
                      <p className="text-[11px] text-slate-500">
                        Editable en Microsoft Word o LibreOffice Writer.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportToDoc(appState)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar DOC
                  </button>
                </div>

                {/* TXT */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      TXT
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Texto Plano Ligero (.txt)</h4>
                      <p className="text-[11px] text-slate-500">
                        Ideal para enviar por correo nacional (.cu), SMS o notas de WhatsApp.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportToTxt(appState)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar TXT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
