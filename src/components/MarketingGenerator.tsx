import { useState } from 'react';
import {
  Sparkles,
  Bot,
  Layers,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  Share2,
  FileText,
  RefreshCw,
  Cpu,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';
import { Product, SwarmMarketingResult } from '../types';

interface MarketingGeneratorProps {
  products: Product[];
  onSaveCampaign?: (topic: string, result: SwarmMarketingResult) => void;
  onExportPdf?: () => void;
}

export default function MarketingGenerator({
  products,
  onSaveCampaign,
}: MarketingGeneratorProps) {
  const [businessName, setBusinessName] = useState('KuvaPlus Store');
  const [selectedProductId, setSelectedProductId] = useState<string>('custom');
  const [customProduct, setCustomProduct] = useState('Café Serrano & Bombillos LED Recargables');
  const [campaignGoal, setCampaignGoal] = useState('Ventas directas y fidelización con pago en línea');
  const [tone, setTone] = useState('Dinámico, cercano y confiable (estilo caribeño)');
  const [imageCount, setImageCount] = useState<number>(3);
  const [scriptCount, setScriptCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompts' | 'scripts' | 'swarmLogic'>('prompts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Result state
  const [result, setResult] = useState<SwarmMarketingResult | null>(null);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    if (id !== 'custom') {
      const p = products.find((prod) => prod.id === id);
      if (p) {
        setCustomProduct(`${p.name} - $${p.priceCup} CUP ($${p.priceUsd} USD) - ${p.description}`);
      }
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/swarm-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          industry: 'Comercio y Servicios Multirubro',
          targetAudience: 'Comunidad local, familias y jóvenes emprendedores en Cuba',
          campaignGoal,
          tone,
          imageCount,
          scriptCount,
          productDetails: customProduct,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const campaignResult: SwarmMarketingResult = {
          swarmMetadata: data.swarmMetadata || {
            strategy: 'Divide and Conquer Multi-Agent Swarm',
            agentsInvolved: ['Agent-Analyst', 'Agent-VisualCreator', 'Agent-ScriptWriter'],
          },
          imagePrompts: data.imagePrompts || [],
          videoScripts: data.videoScripts || [],
        };
        setResult(campaignResult);
        if (onSaveCampaign) {
          onSaveCampaign(customProduct.substring(0, 40), campaignResult);
        }
      }
    } catch (err) {
      console.error('Error generating marketing swarm:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Swarm Intelligence & Divide & Conquer */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-900/50 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-400/30">
            <Bot className="w-3.5 h-3.5" />
            Enjambre Multi-Agente IA // Algoritmo Divide y Vencerás
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Generador Especial de Prompts Visuales y Guiones Cortos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Basado en ingeniería inversa de mercados locales y orquestación multiagente en entornos de poca señal. 
            Descompone tu objetivo comercial en subproblemas: dirección artística para imágenes y guiones estructurados 
            segundo a segundo para TikTok, Reels y Shorts.
          </p>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Parámetros de la Campaña</h3>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Nombre de tu Negocio / Marca:
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Vincular Producto de Inventario (Ganvent):
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="custom">-- Escribir producto personalizado --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} (${prod.priceCup} CUP)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Detalles del Producto / Oferta / Servicio:
            </label>
            <textarea
              rows={2}
              value={customProduct}
              onChange={(e) => setCustomProduct(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              placeholder="Describe lo que vendes, precios, beneficios y pagos aceptados..."
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Tono de Comunicación:
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
            >
              <option value="Dinámico, cercano y confiable (estilo caribeño)">
                Dinámico, cercano y criollo (Recomendado)
              </option>
              <option value="Profesional, corporativo y de alta gama">
                Profesional, corporativo y elegante
              </option>
              <option value="Urgente, oferta flash y escasez positiva">
                Urgencia, oferta limitada y llamado a la acción rápido
              </option>
              <option value="Educativo y resolución de problemas cotidianos">
                Educativo (Solución a apagones o problemas cotidianos)
              </option>
            </select>
          </div>

          {/* Quantities requested by user */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Prompts de Imagen (N):
                </span>
                <span className="text-[11px] text-slate-500">
                  Para Midjourney, Imagen 3, DALL-E
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 3, 5, 8].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setImageCount(qty)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      imageCount === qty
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Guiones de Video Corto (N):
                </span>
                <span className="text-[11px] text-slate-500">
                  Para Reels, TikTok, YouTube Shorts
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setScriptCount(qty)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      scriptCount === qty
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Ejecutando Enjambre Multiagente...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                Generar {imageCount} Prompts + {scriptCount} Guiones con IA
              </>
            )}
          </button>
        </div>

        {/* Right Column (Span 2): Results & Storyboard */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sub tabs */}
          <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'prompts'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Prompts de Imágenes ({result?.imagePrompts?.length || imageCount})
            </button>
            <button
              onClick={() => setActiveTab('scripts')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'scripts'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              Guiones para Videos Cortos ({result?.videoScripts?.length || scriptCount})
            </button>
            <button
              onClick={() => setActiveTab('swarmLogic')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'swarmLogic'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              Arquitectura Divide y Vencerás
            </button>
          </div>

          {/* Tab 1: Image Prompts */}
          {activeTab === 'prompts' && (
            <div className="space-y-3">
              {result?.imagePrompts && result.imagePrompts.length > 0 ? (
                result.imagePrompts.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            Estilo: {item.suggestedStyle}
                          </span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                            Aspect Ratio: {item.aspectRatio}
                          </span>
                          {item.bestPlatforms?.map((plat) => (
                            <span
                              key={plat}
                              className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium"
                            >
                              {plat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.prompt, item.id)}
                        className="text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 shrink-0"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono leading-relaxed select-all">
                      {item.prompt}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Aún no has generado prompts de marketing
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Selecciona tu producto o servicio a la izquierda, ajusta la cantidad deseada y pulsa "Generar con IA" para que el enjambre de agentes cree los prompts optimizados.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Video Scripts */}
          {activeTab === 'scripts' && (
            <div className="space-y-4">
              {result?.videoScripts && result.videoScripts.length > 0 ? (
                result.videoScripts.map((script, sIdx) => (
                  <div
                    key={script.id || sIdx}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center">
                            #{sIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{script.title}</h4>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[11px] bg-pink-50 text-pink-700 font-medium px-2 py-0.5 rounded-md">
                            {script.platform}
                          </span>
                          <span className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                            Duración: {script.targetDuration}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const fullScript = `GUIÓN: ${script.title}\nPLATAFORMA: ${script.platform}\n\n` +
                            script.scenes
                              .map(
                                (sc) =>
                                  `[${sc.time}]\n• VISUAL: ${sc.visual}\n• LOCUCIÓN: ${sc.audioVoiceover}\n• TEXTO EN PANTALLA: ${sc.onScreenText}`
                              )
                              .join('\n\n') +
                            `\n\nCTA: ${script.callToAction}`;
                          copyToClipboard(fullScript, script.id);
                        }}
                        className="text-xs font-medium text-slate-600 hover:text-pink-600 bg-slate-50 hover:bg-pink-50 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1 shrink-0"
                      >
                        {copiedId === script.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar Guión Completo
                          </>
                        )}
                      </button>
                    </div>

                    {/* Scene by scene breakdown */}
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Desglose Escena por Escena (Storyboard Rápido):
                      </span>
                      {script.scenes.map((scene, scIdx) => (
                        <div
                          key={scIdx}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs grid grid-cols-1 md:grid-cols-3 gap-2"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
                              ⏱️ Tiempo & Visual ({scene.time})
                            </span>
                            <p className="text-slate-800 font-medium">{scene.visual}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                              🎙️ Locución (Voz en off)
                            </span>
                            <p className="text-slate-700 italic">"{scene.audioVoiceover}"</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                              📱 Texto en Pantalla
                            </span>
                            <p className="text-slate-900 font-bold bg-white px-2 py-1 rounded border border-slate-200">
                              {scene.onScreenText}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-emerald-900 block">Llamada a la Acción (Call To Action):</span>
                        <p className="text-emerald-800">{script.callToAction}</p>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-1 rounded">
                        Conversión
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Aún no hay guiones generados
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Presiona el botón de generación para redactar los guiones de 20 a 40 segundos con ganchos virales para TikTok y Reels.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Swarm Logic & Architecture */}
          {activeTab === 'swarmLogic' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Fundamentos de la Teoría de Enjambre y Divide y Vencerás
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-1">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                    Fase Divide (Descomposición)
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    El problema general ("Marketing en Cuba con poca señal") se subdivide en:
                    1) Análisis de producto, 2) Dirección de arte visual, 3) Redacción de guiones orales de alta retención.
                  </p>
                </div>

                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 space-y-1">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">2</span>
                    Fase Enjambre (Swarm Consensus)
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Múltiples agentes especializados operan en paralelo coordinados por el modelo Gemini 3 Flash. Cada sub-agente afina aspectos técnicos específicos (iluminación 3D, ratio 1:1 vs 9:16).
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                    Fase Vence (Síntesis y Salida)
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Los resultados estructurados en JSON ultracompacto se empaquetan para funcionar sin Docker, listos para exportar a PDF, DOC o TXT, e integrados con el libro de Blockchain.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono space-y-1">
                <span className="text-indigo-400 font-semibold block">
                  # Pseudocódigo Python / Swarm Divide & Conquer de KuvaPlus:
                </span>
                <p className="text-slate-400">def kuva_swarm_orchestrator(business, n_images, n_scripts):</p>
                <p className="text-slate-400 pl-4">subtasks = divide_into_creative_cells(business)</p>
                <p className="text-slate-400 pl-4">img_agent_results = swarm_execute(AgentVisualDirector, n=n_images)</p>
                <p className="text-slate-400 pl-4">script_agent_results = swarm_execute(AgentScreenplayWriter, n=n_scripts)</p>
                <p className="text-slate-400 pl-4">return conquer_merge(img_agent_results, script_agent_results)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
