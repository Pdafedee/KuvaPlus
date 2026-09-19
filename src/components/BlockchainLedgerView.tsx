import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Blocks,
  RefreshCw,
  Hash,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lock,
  FileCheck,
} from 'lucide-react';
import { BlockchainBlock } from '../types';

interface BlockchainLedgerViewProps {
  chain: BlockchainBlock[];
  onVerifyIntegrity: () => boolean;
  onTamperSimulate?: () => void;
  onRestoreChain?: () => void;
}

export default function BlockchainLedgerView({
  chain,
  onVerifyIntegrity,
  onTamperSimulate,
  onRestoreChain,
}: BlockchainLedgerViewProps) {
  const [isValid, setIsValid] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isTampered, setIsTampered] = useState(false);

  const handleRunVerification = () => {
    setIsChecking(true);
    setTimeout(() => {
      const valid = onVerifyIntegrity();
      setIsValid(valid);
      setIsChecking(false);
    }, 400);
  };

  const handleToggleTamper = () => {
    if (!isTampered) {
      if (onTamperSimulate) onTamperSimulate();
      setIsTampered(true);
      setIsValid(false);
    } else {
      if (onRestoreChain) onRestoreChain();
      setIsTampered(false);
      setIsValid(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-900 text-white font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Seguridad Criptográfica
            </span>
            <span className="text-xs text-slate-500 font-medium">Libro Mayor Distribuido SHA-256</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Blockchain KuvaPlus: Integridad y Registro Inmutable
          </h2>
          <p className="text-xs text-slate-500">
            Protección contra alteraciones en ventas, inventarios y validación de usuarios para entornos con poca señal.
          </p>
        </div>

        {/* Verification Status Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleRunVerification}
            disabled={isChecking}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
              isValid
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isValid ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
            {isValid ? 'Cadena Válida (100% Integra)' : '¡Alerta: Alteración Detectada!'}
          </button>

          {onTamperSimulate && (
            <button
              onClick={handleToggleTamper}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              {isTampered ? 'Restaurar Cadena Original' : 'Simular Intento de Fraude'}
            </button>
          )}
        </div>
      </div>

      {isTampered && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-xs text-red-800 space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Prueba de Seguridad: Se ha modificado un registro de venta en el bloque sin calcular el hash anterior.
          </div>
          <p>
            El algoritmo criptográfico de KuvaPlus detecta instantáneamente la discrepancia en la firma SHA-256 y bloquea la sincronización con SQLite <code className="font-mono bg-red-100 px-1 py-0.5 rounded">kba_mas</code>.
          </p>
        </div>
      )}

      {/* Blocks Timeline / Explorer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Blocks className="w-4 h-4 text-indigo-600" />
            Bloques Registrados en la Cadena ({chain.length} Bloques)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Algoritmo: SHA-256 Compact / Proof of Authority
          </span>
        </div>

        <div className="space-y-3">
          {chain.map((block, idx) => (
            <div
              key={block.hash + idx}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                idx === chain.length - 1
                  ? 'border-indigo-300 ring-2 ring-indigo-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                    #{block.index}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {block.index === 0
                        ? 'Bloque Génesis (KuvaPlus Launch)'
                        : `Bloque de Registro #${block.index}`}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(block.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Nonce: {block.nonce}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verificado
                  </span>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-3 text-[11px] font-mono">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 truncate">
                  <span className="text-slate-400 text-[10px] block font-sans">Hash Previo:</span>
                  <span className="text-slate-600 truncate">{block.previousHash}</span>
                </div>
                <div className="p-2 bg-slate-900 text-indigo-300 rounded-lg truncate">
                  <span className="text-slate-400 text-[10px] block font-sans">Hash del Bloque (SHA-256):</span>
                  <span className="truncate">{block.hash}</span>
                </div>
              </div>

              {/* Data payload summary */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Carga Útil de Datos (Payload Sellado):
                </span>
                <pre className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap overflow-x-auto">
                  {typeof block.data === 'string'
                    ? block.data
                    : JSON.stringify(block.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
