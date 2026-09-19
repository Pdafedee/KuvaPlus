import { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { PaymentGatewayType } from '../types';

interface PaymentGatewaysProps {
  onProcessPayment: (gateway: PaymentGatewayType, amount: number, concept: string) => void;
  onOpenQr: (payload: string, title: string) => void;
}

export default function PaymentGateways({
  onProcessPayment,
  onOpenQr,
}: PaymentGatewaysProps) {
  const [selectedGateway, setSelectedGateway] = useState<'transfermovil' | 'enzona' | 'qvapay'>(
    'transfermovil'
  );

  // Form states
  const [amount, setAmount] = useState('3500');
  const [concept, setConcept] = useState('Compra en KuvaPlus');
  const [targetAccount, setTargetAccount] = useState('9202123456789012');
  const [selectedBank, setSelectedBank] = useState('BANMET');
  const [copiedText, setCopiedText] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // USSD string calculation for Transfermóvil
  const ussdCode = `*444*40*${targetAccount}*${amount}#`;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSimulatePayment = (gatewayName: PaymentGatewayType) => {
    const numAmount = Number(amount) || 0;
    onProcessPayment(gatewayName, numAmount, concept);
    setPaymentSuccessMsg(`¡Pago procesado con éxito vía ${gatewayName} y registrado en Blockchain!`);
    setTimeout(() => setPaymentSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Pasarelas de Pago Oficiales
            </span>
            <span className="text-xs text-slate-500 font-medium">Cuba & Cripto Regional</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Centro de Pagos: Transfermóvil, EnZona & QvaPay
          </h2>
          <p className="text-xs text-slate-500">
            Generación de códigos USSD, enlaces Boulevard, invoices cripto e integración de códigos QR.
          </p>
        </div>

        {/* Gateway switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSelectedGateway('transfermovil')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedGateway === 'transfermovil'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Transfermóvil
          </button>
          <button
            onClick={() => setSelectedGateway('enzona')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedGateway === 'enzona'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            EnZona
          </button>
          <button
            onClick={() => setSelectedGateway('qvapay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              selectedGateway === 'qvapay'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            QvaPay
          </button>
        </div>
      </div>

      {paymentSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {paymentSuccessMsg}
        </div>
      )}

      {/* Main Gateway Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Configuration */}
        <div className="lg:col-span-2 space-y-4">
          {selectedGateway === 'transfermovil' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    TM
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Transfermóvil (ETECSA Telebanca)</h3>
                    <p className="text-xs text-slate-500">
                      Pago directo mediante código USSD o código QR (funciona sin conexión a internet).
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                  USSD / QR Offline
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monto en Pesos (CUP):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Banco Receptor:</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="BANMET">Banco Metropolitano (BANMET)</option>
                    <option value="BPA">Banco Popular de Ahorro (BPA)</option>
                    <option value="BANDEC">Banco de Crédito y Comercio (BANDEC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Tarjeta o Cuenta Matriz del Comercio (16 dígitos):
                </label>
                <input
                  type="text"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              {/* USSD Display Box */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <span className="text-[11px] text-slate-400 font-medium block">
                  Cadena USSD Generada para Marcado Rápido:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-base text-blue-400 font-bold break-all">
                    {ussdCode}
                  </div>
                  <button
                    onClick={() => copyCode(ussdCode)}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 border border-slate-700"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedText ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <a
                    href={`tel:${encodeURIComponent(ussdCode)}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Marcar en el Celular
                  </a>
                  <button
                    onClick={() =>
                      onOpenQr(
                        ussdCode,
                        `Código QR Transfermóvil ($${amount} CUP)`
                      )
                    }
                    className="bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    <QrCode className="w-3.5 h-3.5 text-sky-400" />
                    Generar Código QR de Cobro
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedGateway === 'enzona' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    EZ
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">EnZona Boulevard & Pagos QR</h3>
                    <p className="text-xs text-slate-500">
                      Plataforma de pagos digitales de Xetid para transacciones en CUP mediante QR y API.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Boulevard Virtual
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monto a Cobrar (CUP):</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Identificador de Comercio:</label>
                  <input
                    type="text"
                    value="KUVAPLUS_COMERCIO_01"
                    readOnly
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 font-mono text-slate-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-900 block">
                  Enlace de Checkout para Escaneo con EnZona:
                </span>
                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-slate-800 break-all">
                  https://enzona.net/payment/checkout?merchant=KUVAPLUS_COMERCIO_01&amount={amount}&currency=CUP
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() =>
                      onOpenQr(
                        `https://enzona.net/payment/checkout?merchant=KUVAPLUS_COMERCIO_01&amount=${amount}&currency=CUP`,
                        `QR EnZona Boulevard ($${amount} CUP)`
                      )
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Mostrar QR EnZona
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedGateway === 'qvapay' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    QP
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">QvaPay Pasarela Cripto & USD</h3>
                    <p className="text-xs text-slate-500">
                      Pasarela sin fronteras para cobrar en USDT, Bitcoin, tarjetas internacionales y saldo QvaPay.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-purple-50 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                  Cripto / Multi-Moneda
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Monto en USD / USDT:</label>
                  <input
                    type="number"
                    value={Math.round((Number(amount) / 330) * 10) / 10 || '10.5'}
                    onChange={(e) => setAmount((Number(e.target.value) * 330).toString())}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Usuario Receptor QvaPay:</label>
                  <input
                    type="text"
                    value="@kuvaplus_store"
                    readOnly
                    className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 font-mono text-slate-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-purple-900 block">
                  Enlace Invoice Directo de QvaPay:
                </span>
                <div className="bg-white p-2.5 rounded-lg border border-purple-200 font-mono text-[11px] text-slate-800 break-all">
                  https://qvapay.com/pay/invoicing?to=kuvaplus_store&amount={(
                    Number(amount) / 330
                  ).toFixed(2)}&currency=USD
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() =>
                      onOpenQr(
                        `https://qvapay.com/pay/invoicing?to=kuvaplus_store&amount=${(
                          Number(amount) / 330
                        ).toFixed(2)}&currency=USD`,
                        `QR Invoice QvaPay ($${(Number(amount) / 330).toFixed(2)} USD)`
                      )
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Generar QR Cripto QvaPay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Instant Payment Simulator & Blockchain Registration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Simulador de Cobro en Vivo
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Prueba el procesamiento de un cobro real con la pasarela seleccionada. Al completarse, la operación se cifra con SHA-256 y se agrega automáticamente a la cadena de bloques y a la base de datos SQLite <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">kba_mas</code>.
              </p>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Concepto de la Operación:</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Pasarela:</span>
                  <span className="capitalize font-bold text-slate-900">{selectedGateway}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Monto Total:</span>
                  <span className="font-bold text-emerald-700">${amount} CUP</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              handleSimulatePayment(
                selectedGateway === 'transfermovil'
                  ? 'Transfermóvil'
                  : selectedGateway === 'enzona'
                  ? 'EnZona'
                  : 'QvaPay'
              )
            }
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Confirmar y Sellar en Blockchain
          </button>
        </div>
      </div>
    </div>
  );
}
