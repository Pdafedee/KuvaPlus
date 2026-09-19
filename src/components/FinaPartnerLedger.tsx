import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Calendar,
} from 'lucide-react';
import {
  FinancialTransaction,
  MicroCreditRecord,
  Currency,
  PaymentGatewayType,
} from '../types';
import { CURRENCY_RATES } from '../data/initialData';

interface FinaPartnerLedgerProps {
  transactions: FinancialTransaction[];
  credits: MicroCreditRecord[];
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  onAddCredit: (cred: Omit<MicroCreditRecord, 'id'>) => void;
  onToggleCreditStatus: (id: string) => void;
  onOpenQr: (payload: string, title: string) => void;
}

export default function FinaPartnerLedger({
  transactions,
  credits,
  onAddTransaction,
  onAddCredit,
  onToggleCreditStatus,
  onOpenQr,
}: FinaPartnerLedgerProps) {
  const [subTab, setSubTab] = useState<'cashflow' | 'credits' | 'converter'>('cashflow');

  // New transaction modal state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<FinancialTransaction['type']>('Ingreso');
  const [txConcept, setTxConcept] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCurrency, setTxCurrency] = useState<Currency>('CUP');
  const [txGateway, setTxGateway] = useState<PaymentGatewayType>('Transfermóvil');
  const [txReference, setTxReference] = useState('');
  const [txClient, setTxClient] = useState('');

  // New credit modal state
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [credClient, setCredClient] = useState('');
  const [credPhone, setCredPhone] = useState('+53 5');
  const [credAmount, setCredAmount] = useState('');
  const [credCurrency, setCredCurrency] = useState<Currency>('CUP');
  const [credDueDate, setCredDueDate] = useState('2026-09-30');
  const [credNotes, setCredNotes] = useState('');

  // Multi-currency live converter state
  const [calcAmount, setCalcAmount] = useState('1000');
  const [calcBaseCurrency, setCalcBaseCurrency] = useState<Currency>('CUP');

  // Aggregated metrics
  const totalIncomeCup = transactions
    .filter((t) => t.type === 'Ingreso')
    .reduce((sum, t) => {
      const rate = CURRENCY_RATES[t.currency] || 1;
      return sum + t.amount * rate;
    }, 0);

  const totalExpenseCup = transactions
    .filter((t) => t.type === 'Gasto')
    .reduce((sum, t) => {
      const rate = CURRENCY_RATES[t.currency] || 1;
      return sum + t.amount * rate;
    }, 0);

  const netBalanceCup = totalIncomeCup - totalExpenseCup;
  const netBalanceUsd = netBalanceCup / (CURRENCY_RATES['USD'] || 330);

  const totalPendingCreditsCup = credits
    .filter((c) => c.status === 'Activo')
    .reduce((sum, c) => {
      const rate = CURRENCY_RATES[c.currency] || 1;
      return sum + c.amount * rate;
    }, 0);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txConcept.trim() || !txAmount) return;

    onAddTransaction({
      date: new Date().toISOString(),
      type: txType,
      concept: txConcept,
      amount: Number(txAmount) || 0,
      currency: txCurrency,
      gateway: txGateway,
      status: 'Completado',
      reference: txReference || `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      clientOrSupplier: txClient || 'Comercio Local',
    });

    setTxConcept('');
    setTxAmount('');
    setTxReference('');
    setShowTxModal(false);
  };

  const handleSaveCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credClient.trim() || !credAmount) return;

    onAddCredit({
      clientName: credClient,
      phone: credPhone,
      amount: Number(credAmount) || 0,
      currency: credCurrency,
      startDate: new Date().toISOString().substring(0, 10),
      dueDate: credDueDate,
      status: 'Activo',
      notes: credNotes,
    });

    setCredClient('');
    setCredAmount('');
    setCredNotes('');
    setShowCreditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Módulo FinaPartner Integrado
            </span>
            <span className="text-xs text-slate-500 font-medium">Contabilidad Multidivisa y Microcréditos</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Gestión Financiera & Pasarelas de Pago
          </h2>
          <p className="text-xs text-slate-500">
            Libro mayor sellado en Blockchain con soporte nativo para Transfermóvil, EnZona, QvaPay, CUP, USD, MLC y USDT.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('cashflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === 'cashflow'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flujo de Caja ({transactions.length})
          </button>
          <button
            onClick={() => setSubTab('credits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === 'credits'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cuentas y Créditos ({credits.length})
          </button>
          <button
            onClick={() => setSubTab('converter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subTab === 'converter'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calculadora Divisas
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium block">Balance Neto Consolidado</span>
          <div className="text-lg font-extrabold text-slate-900">
            ${netBalanceCup.toLocaleString()} <span className="text-xs text-slate-500 font-normal">CUP</span>
          </div>
          <div className="text-xs font-semibold text-emerald-600">
            ≈ ${netBalanceUsd.toFixed(2)} USD
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Ingresos Registrados</span>
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-extrabold text-emerald-700">
            +${totalIncomeCup.toLocaleString()} <span className="text-xs font-normal">CUP</span>
          </div>
          <span className="text-[10px] text-slate-400">Cobros Transfermóvil/QvaPay</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Gastos Operativos</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-extrabold text-rose-700">
            -${totalExpenseCup.toLocaleString()} <span className="text-xs font-normal">CUP</span>
          </div>
          <span className="text-[10px] text-slate-400">Compras e insumos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Créditos por Cobrar</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-extrabold text-amber-700">
            ${totalPendingCreditsCup.toLocaleString()} <span className="text-xs font-normal">CUP</span>
          </div>
          <span className="text-[10px] text-slate-400">{credits.filter((c) => c.status === 'Activo').length} cuentas abiertas</span>
        </div>
      </div>

      {subTab === 'cashflow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Historial de Transacciones</h3>
            <button
              onClick={() => setShowTxModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Transacción
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Fecha & Ref</th>
                    <th className="py-3 px-4">Concepto</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Pasarela</th>
                    <th className="py-3 px-4">Blockchain</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        <div>{tx.date.substring(0, 10)}</div>
                        <span className="text-[10px] text-slate-400">{tx.reference || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {tx.concept}
                        {tx.clientOrSupplier && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Parte: {tx.clientOrSupplier}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tx.type === 'Ingreso'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.type === 'Gasto'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {tx.type === 'Ingreso' ? '+' : '-'}
                        {tx.amount.toLocaleString()} {tx.currency}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            tx.gateway === 'Transfermóvil'
                              ? 'bg-blue-100 text-blue-800'
                              : tx.gateway === 'EnZona'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.gateway === 'QvaPay'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {tx.gateway}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-mono">
                          <Shield className="w-3 h-3 text-sky-500" />
                          Sellado SHA-256
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() =>
                            onOpenQr(
                              `KUVAPLUS-TX:${tx.id}-REF:${tx.reference}-MONTO:${tx.amount}${tx.currency}`,
                              `Comprobante QR: ${tx.concept}`
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Generar Comprobante QR"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === 'credits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Control de Microcréditos y Cuentas por Cobrar</h3>
            <button
              onClick={() => setShowCreditModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Crédito
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credits.map((cred) => (
              <div
                key={cred.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cred.clientName}</h4>
                      <span className="text-xs text-slate-500">{cred.phone}</span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        cred.status === 'Pagado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cred.status === 'Vencido'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cred.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2">{cred.notes}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-base font-extrabold text-slate-900">
                      ${cred.amount.toLocaleString()} {cred.currency}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> Vence: {cred.dueDate}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleCreditStatus(cred.id)}
                    className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                      cred.status === 'Pagado'
                        ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                    }`}
                  >
                    {cred.status === 'Pagado' ? 'Marcar Pendiente' : 'Marcar Pagado ✓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'converter' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Calculadora de Tasas y Divisas KuvaPlus</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Monto a Convertir:</label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Moneda Base:</label>
              <select
                value={calcBaseCurrency}
                onChange={(e) => setCalcBaseCurrency(e.target.value as Currency)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white"
              >
                <option value="CUP">CUP (Peso Cubano)</option>
                <option value="USD">USD (Dólar)</option>
                <option value="MLC">MLC (Moneda Libremente Convertible)</option>
                <option value="USDT">USDT (Tether Cripto)</option>
              </select>
            </div>
          </div>

          {/* Conversion results */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Equivalencias Calculadas:</span>
            {(() => {
              const baseNum = Number(calcAmount) || 0;
              const cupValue = baseNum * (CURRENCY_RATES[calcBaseCurrency] || 1);

              return (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500">En CUP:</span>
                    <div className="font-bold text-slate-900">${cupValue.toLocaleString()} CUP</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500">En USD (Tasa 330):</span>
                    <div className="font-bold text-emerald-600">
                      ${(cupValue / 330).toFixed(2)} USD
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500">En MLC (Tasa 285):</span>
                    <div className="font-bold text-blue-600">
                      ${(cupValue / 285).toFixed(2)} MLC
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500">En USDT (Tasa 332):</span>
                    <div className="font-bold text-purple-600">
                      ${(cupValue / 332).toFixed(2)} USDT
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveTransaction}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Registrar Movimiento Financiero</h3>
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Tipo:</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Ingreso">Ingreso (+)</option>
                    <option value="Gasto">Gasto (-)</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Pasarela:</label>
                  <select
                    value={txGateway}
                    onChange={(e) => setTxGateway(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Transfermóvil">Transfermóvil</option>
                    <option value="EnZona">EnZona</option>
                    <option value="QvaPay">QvaPay</option>
                    <option value="Efectivo">Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Concepto:</label>
                <input
                  type="text"
                  required
                  value={txConcept}
                  onChange={(e) => setTxConcept(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Ej: Cobro por servicio técnico"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monto:</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Moneda:</label>
                  <select
                    value={txCurrency}
                    onChange={(e) => setTxCurrency(e.target.value as Currency)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="CUP">CUP</option>
                    <option value="USD">USD</option>
                    <option value="MLC">MLC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Cliente / Proveedor:</label>
                  <input
                    type="text"
                    value={txClient}
                    onChange={(e) => setTxClient(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Referencia / Comprobante:</label>
                  <input
                    type="text"
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                    placeholder="TM-XXXX / EZ-XXXX"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTxModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Registrar y Sellar en Blockchain
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credit Modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveCredit}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Registrar Microcrédito / Deuda</h3>
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nombre del Cliente / Deudor:</label>
                <input
                  type="text"
                  required
                  value={credClient}
                  onChange={(e) => setCredClient(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    required
                    value={credPhone}
                    onChange={(e) => setCredPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Fecha de Vencimiento:</label>
                  <input
                    type="date"
                    required
                    value={credDueDate}
                    onChange={(e) => setCredDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monto Prestado / Fíado:</label>
                  <input
                    type="number"
                    required
                    value={credAmount}
                    onChange={(e) => setCredAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Moneda:</label>
                  <select
                    value={credCurrency}
                    onChange={(e) => setCredCurrency(e.target.value as Currency)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="CUP">CUP</option>
                    <option value="USD">USD</option>
                    <option value="MLC">MLC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Notas del Acuerdo:</label>
                <textarea
                  rows={2}
                  value={credNotes}
                  onChange={(e) => setCredNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Detalle de productos fiados o condiciones de pago..."
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreditModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Registrar Crédito
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
