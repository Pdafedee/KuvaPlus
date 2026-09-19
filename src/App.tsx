import { useState, useEffect } from 'react';
import {
  Package,
  MapPin,
  DollarSign,
  Sparkles,
  Shield,
  CreditCard,
  Database,
  Mail,
  QrCode,
  Wifi,
  WifiOff,
  Menu,
  X,
  RefreshCw,
  Download,
} from 'lucide-react';
import {
  AppState,
  Product,
  BusinessListing,
  FinancialTransaction,
  MicroCreditRecord,
  PaymentGatewayType,
  SwarmMarketingResult,
  CartItem,
} from './types';
import { INITIAL_APP_STATE } from './data/initialData';
import { createGenesisBlock, mineBlock, verifyChainIntegrity } from './services/blockchain';
import { sqliteManager } from './services/sqliteManager';

// Components
import GanventInventoryPOS from './components/GanventInventoryPOS';
import LokooMarketplaceMap from './components/LokooMarketplaceMap';
import FinaPartnerLedger from './components/FinaPartnerLedger';
import PaymentGateways from './components/PaymentGateways';
import MarketingGenerator from './components/MarketingGenerator';
import BlockchainLedgerView from './components/BlockchainLedgerView';
import QRCodeModal from './components/QRCodeModal';
import EmailValidationModal from './components/EmailValidationModal';
import StorageMigrationModal from './components/StorageMigrationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'ganvent' | 'lokoo' | 'finapartner' | 'gateways' | 'swarm_ai' | 'blockchain'
  >('ganvent');

  // Application State
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('kba_mas_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing local storage state:', e);
      }
    }
    return INITIAL_APP_STATE;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLowBandwidthMode, setIsLowBandwidthMode] = useState(true);

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPayload, setQrPayload] = useState('KUVAPLUS-APP-GATEWAY');
  const [qrTitle, setQrTitle] = useState('Código QR KuvaPlus');

  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('mkrlosfedee@gmail.com');
  const [emailBusinessName, setEmailBusinessName] = useState('Mi Negocio KuvaPlus');

  const [storageModalOpen, setStorageModalOpen] = useState(false);

  // Backup original blockchain for tamper test
  const [originalChain, setOriginalChain] = useState(state.blockchain);

  // Auto persist state to localStorage and backend
  useEffect(() => {
    localStorage.setItem('kba_mas_state', JSON.stringify(state));

    // Async sync with backend for persistence in low bandwidth
    const syncTimeout = setTimeout(() => {
      fetch('/api/data/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }).catch((err) => {
        // Silent catch for offline capability
        console.log('Low signal: Operating in offline-first mode.');
      });
    }, 1500);

    return () => clearTimeout(syncTimeout);
  }, [state]);

  // Open QR modal helper
  const handleOpenQr = (payload: string, title: string) => {
    setQrPayload(payload);
    setQrTitle(title);
    setQrModalOpen(true);
  };

  // Open Email verify modal helper
  const handleOpenEmailVerify = (email: string, businessName: string) => {
    setEmailToVerify(email);
    setEmailBusinessName(businessName);
    setEmailModalOpen(true);
  };

  // 1. Ganvent Inventory handlers
  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'updatedAt'>) => {
    const prodId = `prod-${Date.now()}`;
    const fullProduct: Product = {
      ...newProduct,
      id: prodId,
      updatedAt: new Date().toISOString(),
    };

    // Mine a blockchain block for this catalog alteration
    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'ADD_PRODUCT',
      productId: prodId,
      sku: fullProduct.sku,
      name: fullProduct.name,
      stock: fullProduct.stock,
      priceCup: fullProduct.priceCup,
    });

    setState((prev: AppState) => ({
      ...prev,
      products: [fullProduct, ...prev.products],
      blockchain: [...prev.blockchain, newBlock],
    }));
  };

  const handleUpdateProduct = (updated: Product) => {
    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'UPDATE_PRODUCT',
      productId: updated.id,
      name: updated.name,
      stock: updated.stock,
    });

    setState((prev: AppState) => ({
      ...prev,
      products: prev.products.map((p: Product) => (p.id === updated.id ? updated : p)),
      blockchain: [...prev.blockchain, newBlock],
    }));
  };

  const handleDeleteProduct = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      products: prev.products.filter((p: Product) => p.id !== id),
    }));
  };

  const handleCheckoutSale = (
    cart: CartItem[],
    gateway: PaymentGatewayType,
    totalCup: number,
    totalUsd: number
  ) => {
    // 1. Decrease inventory stocks
    const updatedProducts = state.products.map((p: Product) => {
      const inCart = cart.find((item) => item.product.id === p.id);
      if (inCart) {
        return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
      }
      return p;
    });

    // 2. Create financial transaction
    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'Ingreso',
      concept: `Venta TPV Ganvent (${cart.length} artículos)`,
      amount: totalCup,
      currency: 'CUP',
      gateway,
      status: 'Completado',
      reference: `POS-${Math.floor(10000 + Math.random() * 90000)}`,
      clientOrSupplier: 'Cliente Mostrador',
    };

    // 3. Mine block for cryptographic sale seal
    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'SALE_COMPLETED',
      txId: newTx.id,
      totalCup,
      totalUsd,
      gateway,
      items: cart.map((i) => ({ sku: i.product.sku, qty: i.quantity })),
    });

    setState((prev: AppState) => ({
      ...prev,
      products: updatedProducts,
      transactions: [newTx, ...prev.transactions],
      blockchain: [...prev.blockchain, newBlock],
    }));

    handleOpenQr(
      `KUVAPLUS-RECIBO-VENTA:TOTAL_CUP=${totalCup}-GATEWAY=${gateway}-REF=${newTx.reference}`,
      `Comprobante de Venta TPV ($${totalCup} CUP)`
    );
  };

  // 2. Lokoo+ Marketplace Handlers
  const handleAddBusiness = (biz: BusinessListing) => {
    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'REGISTER_BUSINESS',
      bizId: biz.id,
      name: biz.name,
      province: biz.province,
    });

    setState((prev: AppState) => ({
      ...prev,
      businesses: [biz, ...prev.businesses],
      blockchain: [...prev.blockchain, newBlock],
    }));
  };

  const handleSuccessEmailVerify = (verifiedEmail: string) => {
    // Update business email verification state
    const updatedBiz = state.businesses.map((b: BusinessListing) =>
      b.email.toLowerCase() === verifiedEmail.toLowerCase()
        ? { ...b, isVerifiedEmail: true }
        : b
    );

    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'EMAIL_VERIFIED',
      email: verifiedEmail,
      gateway: 'Gmail OAuth Pasarela',
      timestamp: new Date().toISOString(),
    });

    setState((prev: AppState) => ({
      ...prev,
      businesses: updatedBiz,
      blockchain: [...prev.blockchain, newBlock],
    }));
  };

  // 3. FinaPartner Financial Handlers
  const handleAddTransaction = (newTx: Omit<FinancialTransaction, 'id'>) => {
    const txId = `tx-${Date.now()}`;
    const fullTx: FinancialTransaction = { ...newTx, id: txId };

    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'FINANCIAL_TRANSACTION',
      txId,
      concept: fullTx.concept,
      amount: fullTx.amount,
      currency: fullTx.currency,
      gateway: fullTx.gateway,
    });

    setState((prev: AppState) => ({
      ...prev,
      transactions: [fullTx, ...prev.transactions],
      blockchain: [...prev.blockchain, newBlock],
    }));
  };

  const handleAddCredit = (newCred: Omit<MicroCreditRecord, 'id'>) => {
    const credId = `cred-${Date.now()}`;
    const fullCred: MicroCreditRecord = { ...newCred, id: credId };

    setState((prev: AppState) => ({
      ...prev,
      credits: [fullCred, ...prev.credits],
    }));
  };

  const handleToggleCreditStatus = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      credits: prev.credits.map((c: MicroCreditRecord) =>
        c.id === id
          ? { ...c, status: c.status === 'Pagado' ? 'Activo' : 'Pagado' }
          : c
      ),
    }));
  };

  // 4. Payment Gateways Process Handler
  const handleProcessPayment = (
    gateway: PaymentGatewayType,
    amount: number,
    concept: string
  ) => {
    const txId = `pay-${Date.now()}`;
    const newTx: FinancialTransaction = {
      id: txId,
      date: new Date().toISOString(),
      type: 'Ingreso',
      concept: `${concept} (${gateway})`,
      amount,
      currency: 'CUP',
      gateway,
      status: 'Completado',
      reference: `${gateway.substring(0, 2).toUpperCase()}-${Math.floor(
        10000 + Math.random() * 90000
      )}`,
      clientOrSupplier: 'Pasarela Digital',
    };

    const lastBlock = state.blockchain[state.blockchain.length - 1];
    const newBlock = mineBlock(lastBlock, {
      action: 'GATEWAY_PAYMENT',
      gateway,
      amount,
      concept,
      txId,
    });

    setState((prev: AppState) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
      blockchain: [...prev.blockchain, newBlock],
    }));
  };

  // 5. Blockchain Integrity Inspection
  const handleVerifyChain = (): boolean => {
    return verifyChainIntegrity(state.blockchain);
  };

  const handleTamperSimulate = () => {
    setOriginalChain([...state.blockchain]);
    // Introduce an altered block payload without recalculating hashes
    setState((prev: AppState) => {
      if (prev.blockchain.length < 2) return prev;
      const tamperedChain = [...prev.blockchain];
      tamperedChain[1] = {
        ...tamperedChain[1],
        data: {
          operation: 'TRANSACTION',
          payload: { ...tamperedChain[1].data.payload, amount: 99999999, fraud: true },
        },
      };
      return { ...prev, blockchain: tamperedChain };
    });
  };

  const handleRestoreChain = () => {
    setState((prev: AppState) => ({ ...prev, blockchain: originalChain }));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Main Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-md">
                K+
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                    KuvaPlus
                  </h1>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                    Ganvent + Lokoo+ + FinaPartner
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Plataforma Compacta para Poca Señal // SQLite & Blockchain
                </p>
              </div>
            </div>

            {/* Global Utility Actions (Right) */}
            <div className="flex items-center gap-2">
              {/* Low bandwidth indicator */}
              <button
                type="button"
                onClick={() => setIsLowBandwidthMode(!isLowBandwidthMode)}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  isLowBandwidthMode
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modo Baja Señal</span>
              </button>

              {/* QR Scanner / Generator shortcut */}
              <button
                type="button"
                onClick={() =>
                  handleOpenQr(
                    'KUVAPLUS-APP-GATEWAY-TRANSFERMOVIL-ENZONA-QVAPAY',
                    'Pasarela QR Central KuvaPlus'
                  )
                }
                title="Generar / Escanear Código QR"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Gmail Validation shortcut */}
              <button
                type="button"
                onClick={() => setEmailModalOpen(true)}
                title="Pasarela de Validación de Correos"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative"
              >
                <Mail className="w-4 h-4" />
              </button>

              {/* Storage & SQLite Migration Modal shortcut */}
              <button
                type="button"
                onClick={() => setStorageModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">kba_mas (SQLite / JSON)</span>
                <span className="sm:hidden">kba_mas</span>
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:block bg-slate-950/80 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1">
              <button
                onClick={() => setActiveTab('ganvent')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'ganvent'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Package className="w-4 h-4" />
                Ganvent (Inventario & TPV)
              </button>

              <button
                onClick={() => setActiveTab('lokoo')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'lokoo'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Lokoo+ (Directorio & Mapa)
              </button>

              <button
                onClick={() => setActiveTab('finapartner')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'finapartner'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                FinaPartner (Finanzas & Microcréditos)
              </button>

              <button
                onClick={() => setActiveTab('gateways')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'gateways'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Pasarelas (TM, EnZona, QvaPay)
              </button>

              <button
                onClick={() => setActiveTab('swarm_ai')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'swarm_ai'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Enjambre IA (Prompts & Guiones)
              </button>

              <button
                onClick={() => setActiveTab('blockchain')}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === 'blockchain'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Shield className="w-4 h-4 text-sky-400" />
                Blockchain ({state.blockchain.length} Bloques)
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 pt-2 pb-4 space-y-1">
            <button
              onClick={() => {
                setActiveTab('ganvent');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-amber-500" /> Ganvent (Inventario & TPV)
            </button>
            <button
              onClick={() => {
                setActiveTab('lokoo');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-sky-500" /> Lokoo+ (Directorio & Mapa)
            </button>
            <button
              onClick={() => {
                setActiveTab('finapartner');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4 text-emerald-500" /> FinaPartner (Finanzas)
            </button>
            <button
              onClick={() => {
                setActiveTab('gateways');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-purple-500" /> Pasarelas (TM, EnZona, QvaPay)
            </button>
            <button
              onClick={() => {
                setActiveTab('swarm_ai');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" /> Enjambre IA (Prompts & Guiones)
            </button>
            <button
              onClick={() => {
                setActiveTab('blockchain');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-sky-400" /> Blockchain Ledger ({state.blockchain.length} Bloques)
            </button>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'ganvent' && (
          <GanventInventoryPOS
            products={state.products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onCheckoutSale={handleCheckoutSale}
            onOpenQr={handleOpenQr}
          />
        )}

        {activeTab === 'lokoo' && (
          <LokooMarketplaceMap
            businesses={state.businesses}
            onAddBusiness={handleAddBusiness}
            onOpenEmailVerify={handleOpenEmailVerify}
            onOpenQr={handleOpenQr}
          />
        )}

        {activeTab === 'finapartner' && (
          <FinaPartnerLedger
            transactions={state.transactions}
            credits={state.credits}
            onAddTransaction={handleAddTransaction}
            onAddCredit={handleAddCredit}
            onToggleCreditStatus={handleToggleCreditStatus}
            onOpenQr={handleOpenQr}
          />
        )}

        {activeTab === 'gateways' && (
          <PaymentGateways
            onProcessPayment={handleProcessPayment}
            onOpenQr={handleOpenQr}
          />
        )}

        {activeTab === 'swarm_ai' && (
          <MarketingGenerator
            products={state.products}
            onSaveCampaign={(topic, result) => {
              // Store campaign in blockchain
              const lastBlock = state.blockchain[state.blockchain.length - 1];
              const newBlock = mineBlock(lastBlock, {
                action: 'AI_SWARM_CAMPAIGN_GENERATED',
                topic,
                imageCount: result.imagePrompts.length,
                scriptCount: result.videoScripts.length,
              });
              setState((prev: AppState) => ({
                ...prev,
                blockchain: [...prev.blockchain, newBlock],
              }));
            }}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainLedgerView
            chain={state.blockchain}
            onVerifyIntegrity={handleVerifyChain}
            onTamperSimulate={handleTamperSimulate}
            onRestoreChain={handleRestoreChain}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            KuvaPlus © 2026 // Ingeniería Inversa & Enjambre IA sobre Ganvent, Lokoo+ y FinaPartner.
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              SQLite (kba_mas): Sincronizado
            </span>
            <button
              onClick={() => setStorageModalOpen(true)}
              className="text-indigo-600 hover:underline font-medium"
            >
              Respaldar / Exportar (PDF/DOC/TXT)
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        payload={qrPayload}
        title={qrTitle}
      />

      <EmailValidationModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        initialEmail={emailToVerify}
        businessName={emailBusinessName}
        onSuccessVerified={handleSuccessEmailVerify}
      />

      <StorageMigrationModal
        isOpen={storageModalOpen}
        onClose={() => setStorageModalOpen(false)}
        appState={state}
      />
    </div>
  );
}
