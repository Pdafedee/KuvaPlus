import { useState } from 'react';
import {
  Package,
  ShoppingCart,
  Plus,
  Trash2,
  Edit2,
  QrCode,
  Search,
  CheckCircle2,
  Zap,
  ArrowRight,
  TrendingDown,
  Tag,
  DollarSign,
  Smartphone,
} from 'lucide-react';
import { Product, CartItem, PaymentGatewayType } from '../types';

interface GanventInventoryPOSProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onCheckoutSale: (cart: CartItem[], gateway: PaymentGatewayType, totalCup: number, totalUsd: number) => void;
  onOpenQr: (payload: string, title: string) => void;
}

export default function GanventInventoryPOS({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onCheckoutSale,
  onOpenQr,
}: GanventInventoryPOSProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'pos'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>('Transfermóvil');

  // New Product Modal Form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Comercio General');
  const [formPriceCup, setFormPriceCup] = useState('');
  const [formPriceUsd, setFormPriceUsd] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formUnit, setFormUnit] = useState('unidad');
  const [formDesc, setFormDesc] = useState('');

  const categories = ['Todas', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedPriceCurrency: 'CUP' }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalCup = cart.reduce((sum, item) => sum + item.product.priceCup * item.quantity, 0);
  const totalUsd = cart.reduce((sum, item) => sum + item.product.priceUsd * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    onCheckoutSale(cart, selectedGateway, totalCup, totalUsd);
    setCart([]);
  };

  const handleOpenAddModal = (prodToEdit?: Product) => {
    if (prodToEdit) {
      setEditingProduct(prodToEdit);
      setFormName(prodToEdit.name);
      setFormSku(prodToEdit.sku);
      setFormCategory(prodToEdit.category);
      setFormPriceCup(prodToEdit.priceCup.toString());
      setFormPriceUsd(prodToEdit.priceUsd.toString());
      setFormStock(prodToEdit.stock.toString());
      setFormUnit(prodToEdit.unit);
      setFormDesc(prodToEdit.description);
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setFormCategory('Comercio');
      setFormPriceCup('1500');
      setFormPriceUsd('4.5');
      setFormStock('20');
      setFormUnit('unidad');
      setFormDesc('');
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: formName,
        sku: formSku,
        category: formCategory,
        priceCup: Number(formPriceCup) || 0,
        priceUsd: Number(formPriceUsd) || 0,
        stock: Number(formStock) || 0,
        unit: formUnit,
        description: formDesc,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddProduct({
        name: formName,
        sku: formSku,
        category: formCategory,
        priceCup: Number(formPriceCup) || 0,
        priceUsd: Number(formPriceUsd) || 0,
        stock: Number(formStock) || 0,
        unit: formUnit,
        description: formDesc,
      });
    }
    setShowProductModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Módulo Ganvent Integrado
            </span>
            <span className="text-xs text-slate-500 font-medium">Bajo Ancho de Banda</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Gestión de Inventario & Punto de Venta (TPV)
          </h2>
          <p className="text-xs text-slate-500">
            Control de existencias rápido, doble precio CUP/USD y cobros instantáneos.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Catálogo ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab('pos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors relative ${
              activeSubTab === 'pos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Punto de Venta (POS)
            {cart.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'inventory' ? (
        /* INVENTORY VIEW */
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 w-full sm:w-auto gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-hidden"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenAddModal()}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                        {product.sku}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{product.name}</h4>
                      <span className="text-[11px] text-slate-500">{product.category}</span>
                    </div>

                    <button
                      onClick={() =>
                        onOpenQr(
                          `KUVAPLUS-SKU:${product.sku}-PRECIO_CUP:${product.priceCup}`,
                          `Código QR SKU: ${product.name}`
                        )
                      }
                      title="Ver Código QR para Etiqueta"
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{product.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        ${product.priceCup.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">CUP</span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">
                        ${product.priceUsd.toFixed(2)} <span className="text-[10px] text-slate-500 font-normal">USD</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          product.stock <= (product.minStock || 5)
                            ? 'bg-red-100 text-red-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Stock: {product.stock} {product.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                      className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Añadir al TPV
                    </button>
                    <button
                      onClick={() => handleOpenAddModal(product)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* POS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Products picker */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar rápido para vender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="bg-white p-3 rounded-xl border border-slate-200 hover:border-amber-400 text-left shadow-xs transition-all flex flex-col justify-between disabled:opacity-50 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono">{product.sku}</span>
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">
                      {product.name}
                    </h5>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">
                      ${product.priceCup} CUP
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({product.stock})
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Col: Cart & Instant Checkout */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                  Ticket de Venta
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto py-2">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    El carrito está vacío. Haz clic en un producto para comenzar.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h6 className="text-xs font-semibold text-slate-800 truncate">
                          {item.product.name}
                        </h6>
                        <span className="text-[11px] text-slate-500">
                          ${item.product.priceCup} CUP c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-red-500 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Totals and Gateway Select */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total en Moneda Nacional:</span>
                  <span className="font-bold text-slate-900">${totalCup.toLocaleString()} CUP</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Equivalente en Divisa:</span>
                  <span className="font-bold text-emerald-600">${totalUsd.toFixed(2)} USD</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Pasarela de Cobro:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Transfermóvil', 'EnZona', 'QvaPay', 'Efectivo'] as PaymentGatewayType[]).map(
                    (g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGateway(g)}
                        className={`text-xs p-1.5 rounded-lg border text-center font-medium transition-colors ${
                          selectedGateway === g
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {g}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar Venta ({selectedGateway})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {editingProduct ? 'Editar Producto' : 'Añadir Producto a Ganvent'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nombre del Producto:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Código SKU:</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Categoría:</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Precio CUP:</label>
                  <input
                    type="number"
                    required
                    value={formPriceCup}
                    onChange={(e) => setFormPriceCup(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Precio USD:</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formPriceUsd}
                    onChange={(e) => setFormPriceUsd(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Stock Inicial:</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Unidad de Medida:</label>
                  <input
                    type="text"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="unidad, kg, litro"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Descripción Breve:</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
