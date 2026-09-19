export type Currency = 'CUP' | 'MLC' | 'USD' | 'USDT';

export type PaymentGatewayType = 'Transfermóvil' | 'EnZona' | 'QvaPay' | 'Efectivo';

// ------------------------------------------------------------------
// 1. Ganvent Core: Products & POS Inventory
// ------------------------------------------------------------------
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  priceCup: number;
  priceUsd: number;
  costCup?: number;
  stock: number;
  minStock?: number;
  unit: string;
  description: string;
  qrCode?: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPriceCurrency: 'CUP' | 'USD';
}

// ------------------------------------------------------------------
// 2. Lokoo+ Core: Local Business & Map Directory
// ------------------------------------------------------------------
export interface BusinessListing {
  id: string;
  name: string;
  category: 'Gastronomía' | 'Servicios Técnicos' | 'Textil y Calzado' | 'Transporte' | 'Tecnología' | 'Artesanía' | 'Hospedaje' | 'Comercio';
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  isVerifiedEmail: boolean;
  address: string;
  province: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  paymentMethods: PaymentGatewayType[];
  openingHours: string;
  featuredProducts?: string[];
}

// ------------------------------------------------------------------
// 3. FinaPartner Core: Finance, Cashflow & Microcredits
// ------------------------------------------------------------------
export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'Ingreso' | 'Gasto' | 'Transferencia' | 'Cobro Pendiente';
  concept: string;
  amount: number;
  currency: Currency;
  gateway: PaymentGatewayType;
  status: 'Completado' | 'Pendiente' | 'En Proceso';
  reference?: string;
  clientOrSupplier?: string;
  blockchainBlockHash?: string;
}

export interface MicroCreditRecord {
  id: string;
  clientName: string;
  phone: string;
  amount: number;
  currency: Currency;
  startDate: string;
  dueDate: string;
  status: 'Activo' | 'Pagado' | 'Vencido';
  notes: string;
}

// ------------------------------------------------------------------
// 4. Blockchain Ledger Core
// ------------------------------------------------------------------
export interface BlockchainBlock {
  index: number;
  timestamp: string;
  data: {
    operation: 'TRANSACTION' | 'INVENTORY_UPDATE' | 'EMAIL_VERIFICATION' | 'GATEWAY_PAYMENT' | 'DATA_SYNC' | 'GENESIS';
    payload: Record<string, any>;
  };
  previousHash: string;
  hash: string;
  nonce: number;
}

// ------------------------------------------------------------------
// 5. Swarm AI Marketing Generator (Divide & Conquer)
// ------------------------------------------------------------------
export interface ImagePromptItem {
  id: string;
  title: string;
  prompt: string;
  suggestedStyle: string;
  aspectRatio: string;
  bestPlatforms: string[];
}

export interface VideoScriptScene {
  time: string;
  visual: string;
  audioVoiceover: string;
  onScreenText: string;
}

export interface VideoScriptItem {
  id: string;
  title: string;
  targetDuration: string;
  platform: string;
  scenes: VideoScriptScene[];
  callToAction: string;
}

export interface SwarmMarketingResult {
  swarmMetadata: {
    strategy: string;
    agentsInvolved: string[];
    synthesisSummary?: string;
  };
  imagePrompts: ImagePromptItem[];
  videoScripts: VideoScriptItem[];
}

// ------------------------------------------------------------------
// 6. Persistence & SQLite Migration
// ------------------------------------------------------------------
export interface AppStorageState {
  version: string;
  updatedAt: string;
  businesses: BusinessListing[];
  products: Product[];
  transactions: FinancialTransaction[];
  credits: MicroCreditRecord[];
  blockchain: BlockchainBlock[];
  savedMarketingCampaigns: Array<{
    id: string;
    createdAt: string;
    topic: string;
    result: SwarmMarketingResult;
  }>;
}

export type AppState = AppStorageState;

export interface MigrationStatus {
  lastSync: string;
  jsonSizeBytes: number;
  itemCount: number;
  sqliteMigrated: boolean;
  databaseName: string;
  sqlDumpReady: boolean;
}
