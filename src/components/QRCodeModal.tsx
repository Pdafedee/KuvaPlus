import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Scan, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPayload?: string;
  defaultTitle?: string;
  payload?: string;
  title?: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  defaultPayload = 'KUVAPLUS-PAY-001',
  defaultTitle = 'Código QR Multifunción',
  payload,
  title,
}: QRCodeModalProps) {
  const initialPayload = payload || defaultPayload;
  const initialTitle = title || defaultTitle;
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [qrType, setQrType] = useState<'custom' | 'transfermovil' | 'enzona' | 'qvapay' | 'vcard'>('custom');
  const [textToEncode, setTextToEncode] = useState(initialPayload);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Pre-configured payment values
  const [amount, setAmount] = useState('2500');
  const [accountOrCommerce, setAccountOrCommerce] = useState('9202123456789012');
  const [concept, setConcept] = useState('Pago KuvaPlus');

  // Scanner simulator state
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (payload) {
      setTextToEncode(payload);
    } else if (defaultPayload) {
      setTextToEncode(defaultPayload);
    }
  }, [payload, defaultPayload]);

  useEffect(() => {
    let payload = textToEncode;
    if (qrType === 'transfermovil') {
      // Standard USSD / TM format
      payload = `*444*40*${accountOrCommerce}*${amount}#`;
    } else if (qrType === 'enzona') {
      payload = `https://enzona.net/payment/checkout?merchant=MERCHANT_${accountOrCommerce.slice(-6)}&amount=${amount}&currency=CUP`;
    } else if (qrType === 'qvapay') {
      payload = `https://qvapay.com/pay/invoicing?to=kuvaplus_store&amount=${amount}&currency=USD`;
    } else if (qrType === 'vcard') {
      payload = `BEGIN:VCARD\nVERSION:3.0\nN:Comercio KuvaPlus\nFN:Comercio KuvaPlus\nTEL:+5352849102\nEMAIL:contacto@kuvaplus.cu\nNOTE:Negocio verificado en Lokoo+\nEND:VCARD`;
    }

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [textToEncode, qrType, amount, accountOrCommerce, concept]);

  if (!isOpen) return null;

  const copyPayload = () => {
    navigator.clipboard.writeText(textToEncode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `KuvaPlus_QR_${Date.now()}.png`;
    a.click();
  };

  const simulateScan = (sampleText: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(sampleText);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-base">{defaultTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'generate'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Generar Código QR
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'scan'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Escanear / Validar QR
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'generate' ? (
            <>
              {/* Type Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setQrType('transfermovil')}
                  className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    qrType === 'transfermovil'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Transfermóvil
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('enzona')}
                  className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    qrType === 'enzona'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  EnZona
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('qvapay')}
                  className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    qrType === 'qvapay'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  QvaPay
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('custom')}
                  className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    qrType === 'custom'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Personalizado
                </button>
              </div>

              {/* Dynamic Inputs depending on QR Type */}
              {qrType === 'transfermovil' && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2 text-blue-900">
                  <div className="font-semibold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    Telebanca Transfermóvil (Código USSD / QR de Pago)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Tarjeta / Cuenta CUP</label>
                      <input
                        type="text"
                        value={accountOrCommerce}
                        onChange={(e) => setAccountOrCommerce(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Monto CUP</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-700 font-mono bg-white p-1.5 rounded border border-blue-100">
                    USSD: *444*40*{accountOrCommerce}*{amount}#
                  </div>
                </div>
              )}

              {qrType === 'enzona' && (
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs space-y-2 text-emerald-900">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    EnZona Boulevard (Pago Móvil y QR de Comercio)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">ID Comercio / Tarjeta</label>
                      <input
                        type="text"
                        value={accountOrCommerce}
                        onChange={(e) => setAccountOrCommerce(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Monto CUP</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {qrType === 'qvapay' && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 text-xs space-y-2 text-purple-900">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    QvaPay Digital Checkout (Cripto & Saldo USD)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Usuario / Tienda QvaPay</label>
                      <input
                        type="text"
                        value="kuvaplus_store"
                        readOnly
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 font-medium">Monto USD</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {qrType === 'custom' && (
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Texto, Hash Criptográfico o Enlace:
                  </label>
                  <textarea
                    rows={2}
                    value={textToEncode}
                    onChange={(e) => setTextToEncode(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    placeholder="Escribe el texto a codificar..."
                  />
                </div>
              )}

              {/* QR Image Visualizer */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="KuvaPlus QR Code"
                    className="w-48 h-48 rounded-lg shadow-sm border border-slate-200 bg-white p-2"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400 text-xs">
                    Generando código QR...
                  </div>
                )}
                <span className="text-[11px] text-slate-500 mt-2 font-mono break-all text-center px-4 max-w-sm line-clamp-1">
                  {qrType === 'transfermovil'
                    ? `*444*40*${accountOrCommerce}*${amount}#`
                    : textToEncode}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={downloadQr}
                  className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar PNG
                </button>
                <button
                  type="button"
                  onClick={copyPayload}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar Texto'}
                </button>
              </div>
            </>
          ) : (
            /* SCANNER TAB */
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl text-center text-white space-y-3 relative overflow-hidden">
                <div className="w-36 h-36 mx-auto border-2 border-dashed border-sky-400 rounded-xl flex flex-col items-center justify-center bg-slate-800/80 relative">
                  <Scan className="w-12 h-12 text-sky-400 animate-pulse" />
                  <span className="text-[11px] text-slate-300 mt-2">Visor de Cámara QR</span>
                  {isScanning && (
                    <div className="absolute inset-0 bg-sky-500/20 animate-pulse rounded-xl flex items-center justify-center">
                      <span className="text-xs font-semibold text-white bg-slate-900/80 px-2 py-1 rounded">
                        Decodificando...
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-300">
                  Alinea el código QR del producto, pago Transfermóvil, EnZona o hash de Blockchain.
                </p>
              </div>

              {/* Sample QR scanner triggers for testing without webcam */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Simulaciones de lectura rápida en bajo ancho de banda:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => simulateScan('*444*40*9202123456789012*4500# [Transfermóvil Aprobado]')}
                    className="text-left text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>📲 Escanear Pago Transfermóvil ($4,500 CUP)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">Probar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateScan('https://qvapay.com/pay/invoicing?order=78291&amount=30.00&auth=KUVAPLUS')}
                    className="text-left text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>💳 Escanear Invoice QvaPay ($30.00 USD)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">Probar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      simulateScan(
                        'KUVAPLUS-BLOCK:#4-HASH:00a94e82f1bc2839d481230abef29381-VALIDATED'
                      )
                    }
                    className="text-left text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between"
                  >
                    <span>🛡️ Escanear Sello Blockchain KuvaPlus</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Probar</span>
                  </button>
                </div>
              </div>

              {scannedResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Lectura Exitosa Decodificada:
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200 text-xs font-mono text-slate-800 break-all">
                    {scannedResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
