import { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Star,
  ExternalLink,
  Plus,
  Navigation,
  Compass,
  Filter,
  CheckCircle,
  QrCode,
} from 'lucide-react';
import { BusinessListing } from '../types';

interface LokooMarketplaceMapProps {
  businesses: BusinessListing[];
  onAddBusiness: (biz: BusinessListing) => void;
  onOpenEmailVerify: (email: string, name: string) => void;
  onOpenQr: (payload: string, title: string) => void;
}

export default function LokooMarketplaceMap({
  businesses,
  onAddBusiness,
  onOpenEmailVerify,
  onOpenQr,
}: LokooMarketplaceMapProps) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Todas');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessListing | null>(businesses[0] || null);

  // New business modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<BusinessListing['category']>('Comercio');
  const [newPhone, setNewPhone] = useState('+53 5');
  const [newWhatsapp, setNewWhatsapp] = useState('+53 5');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newProvince, setNewProvince] = useState('La Habana');
  const [newDesc, setNewDesc] = useState('');

  const provinces = ['Todas', 'La Habana', 'Santiago de Cuba', 'Holguín', 'Matanzas', 'Villa Clara', 'Camagüey'];
  const categories = [
    'Todas',
    'Gastronomía',
    'Tecnología',
    'Textil y Calzado',
    'Servicios Técnicos',
    'Transporte',
    'Comercio',
  ];

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const matchQuery =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProv = selectedProvince === 'Todas' || b.province === selectedProvince;
      const matchCat = selectedCategory === 'Todas' || b.category === selectedCategory;
      return matchQuery && matchProv && matchCat;
    });
  }, [businesses, searchTerm, selectedProvince, selectedCategory]);

  // Coordinates bounding box for Cuba interactive map view
  // Cuba spans approximately: Lat 19.8 to 23.3, Lng -85.0 to -74.0
  const mapCenter = {
    minLat: 19.8,
    maxLat: 23.4,
    minLng: -85.0,
    maxLng: -74.0,
  };

  const getMapCoordinates = (lat: number, lng: number) => {
    // Map GPS coords to percentage coordinates inside SVG container
    const x = ((lng - mapCenter.minLng) / (mapCenter.maxLng - mapCenter.minLng)) * 100;
    const y = ((mapCenter.maxLat - lat) / (mapCenter.maxLat - mapCenter.minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(10, Math.min(90, y)),
    };
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newBiz: BusinessListing = {
      id: `biz-${Date.now()}`,
      name: newName,
      category: newCat,
      description: newDesc || 'Comercio local verificado en KuvaPlus Lokoo+.',
      phone: newPhone,
      whatsapp: newWhatsapp,
      email: newEmail,
      isVerifiedEmail: false,
      address: newAddress || 'Calle Principal',
      province: newProvince,
      lat: newProvince === 'Santiago de Cuba' ? 20.02 : 23.13 + (Math.random() - 0.5) * 0.05,
      lng: newProvince === 'Santiago de Cuba' ? -75.81 : -82.38 + (Math.random() - 0.5) * 0.05,
      rating: 5.0,
      reviewCount: 1,
      paymentMethods: ['Transfermóvil', 'EnZona', 'QvaPay', 'Efectivo'],
      openingHours: '9:00 AM - 6:00 PM',
    };

    onAddBusiness(newBiz);
    setSelectedBusiness(newBiz);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Módulo Lokoo+ Integrado
            </span>
            <span className="text-xs text-slate-500 font-medium">Búsqueda Geográfica de Negocios</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Directorio Comercial & Mapa Interactivo
          </h2>
          <p className="text-xs text-slate-500">
            Descubre negocios locales, valida su autenticidad por Gmail y conecta vía WhatsApp o llamada sin consumo excesivo de datos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Mapa
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Lista ({filteredBusinesses.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Negocio
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por negocio, servicio, dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden"
        >
          {provinces.map((p) => (
            <option key={p} value={p}>
              Provincia: {p}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-hidden"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Rubro: {c}
            </option>
          ))}
        </select>
      </div>

      {/* View Content */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Canvas (Span 2) */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-800 relative overflow-hidden min-h-[380px] flex flex-col justify-between">
            {/* Top map info */}
            <div className="flex items-center justify-between z-10">
              <div className="bg-slate-800/90 text-white px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-xs border border-slate-700 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                Mapa Offline Vectorial de Negocios en Cuba
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredBusinesses.length} comercios visibles
              </span>
            </div>

            {/* Simulated Interactive Vector Map of Cuba */}
            <div className="relative w-full h-72 sm:h-84 my-2">
              <svg
                viewBox="0 0 800 350"
                className="w-full h-full text-slate-800 drop-shadow-md"
                fill="currentColor"
              >
                {/* Simplified aesthetic silhouette of Cuban archipelago */}
                <path
                  d="M 60 110 Q 120 95 180 100 Q 250 110 320 120 Q 400 135 480 150 Q 560 180 640 220 Q 720 250 780 270 Q 740 290 680 275 Q 600 240 520 200 Q 440 170 360 160 Q 280 145 200 140 Q 120 130 50 140 Z"
                  className="fill-slate-800 stroke-slate-700 stroke-2"
                />
                <circle cx="160" cy="180" r="18" className="fill-slate-800 stroke-slate-700" /> {/* Isla de la Juventud */}
              </svg>

              {/* Business Markers on Map */}
              {filteredBusinesses.map((biz) => {
                const coords = getMapCoordinates(biz.lat, biz.lng);
                const isSelected = selectedBusiness?.id === biz.id;

                return (
                  <button
                    key={biz.id}
                    onClick={() => setSelectedBusiness(biz)}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform group cursor-pointer ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-sky-500 border-white text-white ring-4 ring-sky-500/40'
                          : 'bg-slate-900 border-sky-400 text-sky-400 hover:bg-sky-600 hover:text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    {/* Hover pill */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/95 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 pointer-events-none">
                      {biz.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom map legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 z-10 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Negocios Verificados
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Transfermóvil & EnZona
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> QvaPay Digital
              </span>
            </div>
          </div>

          {/* Business Details Panel (Col 3) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            {selectedBusiness ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                        {selectedBusiness.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {selectedBusiness.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {selectedBusiness.address}, {selectedBusiness.province}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedBusiness.rating}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {selectedBusiness.description}
                  </p>
                </div>

                {/* Email Verification Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700">Validación de Correo:</span>
                    {selectedBusiness.isVerifiedEmail ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verificado Gmail
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Pendiente
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 font-mono truncate">
                    {selectedBusiness.email}
                  </div>
                  {!selectedBusiness.isVerifiedEmail && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenEmailVerify(selectedBusiness.email, selectedBusiness.name)
                      }
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Validar con Pasarela Gmail ahora →
                    </button>
                  )}
                </div>

                {/* Accepted Payment Gateways */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Pasarelas de Pago Aceptadas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedBusiness.paymentMethods.map((pm) => (
                      <span
                        key={pm}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                          pm === 'Transfermóvil'
                            ? 'bg-blue-100 text-blue-800'
                            : pm === 'EnZona'
                            ? 'bg-emerald-100 text-emerald-800'
                            : pm === 'QvaPay'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {pm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-semibold text-slate-700 block">
                    Conectar con el Comercio:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://wa.me/${selectedBusiness.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hola, vi su negocio ${selectedBusiness.name} en KuvaPlus Lokoo+ y deseo consultar sus productos.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>

                    <a
                      href={`tel:${selectedBusiness.phone.replace(/\s+/g, '')}`}
                      className="bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Llamar Directo
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenQr(
                        `KUVAPLUS-BIZ:${selectedBusiness.name}-TEL:${selectedBusiness.phone}-DIR:${selectedBusiness.address}`,
                        `Tarjeta QR de Contacto: ${selectedBusiness.name}`
                      )
                    }
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Generar QR de Contacto / vCard
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Selecciona un negocio en el mapa para ver sus detalles.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBusinesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                      {biz.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{biz.name}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {biz.rating}
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{biz.description}</p>
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{biz.address}, {biz.province}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {biz.isVerifiedEmail ? (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Verificado
                    </span>
                  ) : (
                    <button
                      onClick={() => onOpenEmailVerify(biz.email, biz.name)}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Validar correo
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5">
                  <a
                    href={`https://wa.me/${biz.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedBusiness(biz);
                      setViewMode('map');
                    }}
                    className="text-xs text-sky-600 font-semibold hover:underline"
                  >
                    Ver en Mapa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Business Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateBusiness}
            className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Registrar Negocio en Lokoo+</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nombre Comercial:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  placeholder="Ej: Cafetería El Rincón"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Rubro / Categoría:</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {categories
                      .filter((c) => c !== 'Todas')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Provincia:</label>
                  <select
                    value={newProvince}
                    onChange={(e) => setNewProvince(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    {provinces
                      .filter((p) => p !== 'Todas')
                      .map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Teléfono:</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={newWhatsapp}
                    onChange={(e) => setNewWhatsapp(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Correo Electrónico (Gmail preferente):
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="comercio@gmail.com"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Dirección Física:</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Calle, Entrecalle, Municipio"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Descripción del Negocio:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg"
              >
                Registrar y Geoposicionar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
