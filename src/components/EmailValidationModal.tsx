import { useState } from 'react';
import { Mail, CheckCircle, Shield, ArrowRight, RefreshCw, Send, ExternalLink } from 'lucide-react';

interface EmailValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  businessName?: string;
  onSuccessVerified?: (email: string) => void;
}

export default function EmailValidationModal({
  isOpen,
  onClose,
  initialEmail = 'mkrlosfedee@gmail.com',
  businessName = 'Mi Negocio KuvaPlus',
  onSuccessVerified,
}: EmailValidationModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'success'>('input');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [serverData, setServerData] = useState<any>(null);

  if (!isOpen) return null;

  const isGmail = email.toLowerCase().endsWith('@gmail.com');

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Por favor introduce un correo válido.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/email/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, businessName }),
      });
      const data = await res.json();
      if (data.success) {
        setServerData(data);
        setStep('verify');
        // Pre-fill code for developer/preview convenience
        if (data.code) {
          setCode(data.code);
        }
      } else {
        setErrorMsg(data.message || 'Error solicitando código.');
      }
    } catch (err: any) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!code || code.length < 6) {
      setErrorMsg('Introduce el código de 6 dígitos.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/email/confirm-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success && data.verified) {
        setStep('success');
        if (onSuccessVerified) {
          onSuccessVerified(email);
        }
      } else {
        setErrorMsg(data.message || 'Código incorrecto o expirado.');
      }
    } catch (err) {
      setErrorMsg('Error validando el código con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-sm">Pasarela de Validación de Correos</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 'input' && (
            <>
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 font-bold">
                  G
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Validación Segura con Gmail</h4>
                  <p className="text-[11px] text-slate-600">
                    Garantiza la autenticidad del comercio frente a fraudes y sella la identidad en Blockchain.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Correo Electrónico a Validar:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu_nombre@gmail.com"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                {isGmail ? (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Servidor Gmail detectado: Compatible con Pasarela Express
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Nota: Se recomienda @gmail.com para validación prioritaria en entornos con poca señal.
                  </p>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Código de Verificación OTP
                  </>
                )}
              </button>
            </>
          )}

          {step === 'verify' && (
            <>
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">Introduce el Código de 6 Dígitos</h4>
                <p className="text-xs text-slate-500">
                  Emitido para <span className="font-semibold text-slate-800">{email}</span>
                </p>
              </div>

              {serverData?.instructions && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  {serverData.instructions}
                </div>
              )}

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-2xl font-mono py-2.5 border-2 border-slate-300 rounded-xl focus:border-red-500 focus:outline-hidden"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-medium"
                >
                  Cambiar Correo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCode}
                  disabled={loading || code.length < 6}
                  className="flex-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Validar Identidad
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-slate-900">¡Correo Gmail Verificado Exitosamente!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                La identidad digital de <span className="font-semibold">{email}</span> ha sido verificada a través de la pasarela y registrada en el libro mayor de Blockchain.
              </p>
              <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] rounded-lg border border-emerald-200 font-mono">
                Sello de Verificación Criptográfica: ACTIVO
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold mt-2"
              >
                Finalizar y Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
