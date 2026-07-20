import React, { useState, useEffect } from "react";
import { 
  Trash2, 
  Plus, 
  Beaker, 
  Check, 
  TrendingDown, 
  TrendingUp, 
  Truck, 
  Layers, 
  Droplet, 
  Info, 
  Calendar,
  Sparkles,
  ChevronRight,
  Database,
  ArrowRightLeft
} from "lucide-react";
import { registerVinhacaActivity } from "../lib/vinhacaSync";

// Types
export interface CarregamentoNivel {
  id: string;
  usina: string;
  dataHora: string;
  alturaCaixa: number;      // Current level height in cm (e.g. 195)
  alturaMaxima: number;     // Max height in cm (e.g. 250)
  volumeMaximo: number;     // Max volume in m³ (e.g. 12500)
  capacidadeCaminhao: number; // Truck capacity in m³ (e.g. 60)
  variacaoPeriodo: number;   // Period change in cm (e.g. -5 means 5cm down)
}

const LOCAL_STORAGE_KEY_LIST = "vinhaca_nivel_carregamentos";
const LOCAL_STORAGE_KEY_SELECTED = "vinhaca_selected_carregamento_id";

// Formatter helper
export const formatVolume = (valM3: number): string => {
  // Multiply by 1000 to convert to litters/exact units matching Excel photo
  return (valM3 * 1000).toLocaleString("pt-BR");
};

export const VinhacaNiveis: React.FC = () => {
  const [carregamentos, setCarregamentos] = useState<CarregamentoNivel[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem("vinhaca_despacho_last_updated") || new Date().toLocaleString("pt-BR");
  });

  useEffect(() => {
    const handleSync = () => {
      setLastUpdated(localStorage.getItem("vinhaca_despacho_last_updated") || new Date().toLocaleString("pt-BR"));
    };
    window.addEventListener("vinhaca_despacho_changed", handleSync);
    window.addEventListener("vinhaca_historico_changed", handleSync);
    return () => {
      window.removeEventListener("vinhaca_despacho_changed", handleSync);
      window.removeEventListener("vinhaca_historico_changed", handleSync);
    };
  }, []);

  // Form states for adding new
  const [newUsina, setNewUsina] = useState("Usina Coprodução");
  const [newAlturaCaixa, setNewAlturaCaixa] = useState(195);
  const [newAlturaMaxima, setNewAlturaMaxima] = useState(250);
  const [newVolumeMaximo, setNewVolumeMaximo] = useState(12500);
  const [newCapacidadeCaminhao, setNewCapacidadeCaminhao] = useState(60);
  const [newVariacaoPeriodo, setNewVariacaoPeriodo] = useState(-5);
  const [newDataHora, setNewDataHora] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load from LocalStorage
  useEffect(() => {
    const savedList = localStorage.getItem(LOCAL_STORAGE_KEY_LIST);
    const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED);

    let list: CarregamentoNivel[] = [];

    if (savedList) {
      try {
        list = JSON.parse(savedList);
      } catch (e) {
        list = [];
      }
    }

    // Seed default data if empty
    if (list.length === 0) {
      list = [
        {
          id: "C-01",
          usina: "Usina1 (Bonança)",
          dataHora: "20/05/2026 23:50",
          alturaCaixa: 195,
          alturaMaxima: 250,
          volumeMaximo: 12500,
          capacidadeCaminhao: 60,
          variacaoPeriodo: -5
        },
        {
          id: "C-02",
          usina: "Usina Ariranha (Secundária)",
          dataHora: "21/05/2026 01:10",
          alturaCaixa: 150,
          alturaMaxima: 250,
          volumeMaximo: 12500,
          capacidadeCaminhao: 60,
          variacaoPeriodo: 15
        },
        {
          id: "C-03",
          usina: "Usina Santa Albertina",
          dataHora: "21/05/2026 02:40",
          alturaCaixa: 215,
          alturaMaxima: 250,
          volumeMaximo: 12500,
          capacidadeCaminhao: 60,
          variacaoPeriodo: -12
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(list));
    }

    setCarregamentos(list);

    if (savedSelected && list.some(x => x.id === savedSelected)) {
      setSelectedId(savedSelected);
    } else if (list.length > 0) {
      setSelectedId(list[0].id);
      localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED, list[0].id);
    }
  }, []);

  // Save changes helper
  const saveAll = (
    updatedList: CarregamentoNivel[], 
    activeId: string, 
    logInfo?: { tipoAcao: 'Inclusão' | 'Edição' | 'Exclusão'; detalhes: string }
  ) => {
    setCarregamentos(updatedList);
    setSelectedId(activeId);
    localStorage.setItem(LOCAL_STORAGE_KEY_LIST, JSON.stringify(updatedList));
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED, activeId);
    
    // Dispatch custom event to notify Dashboard if it's currently rendered
    window.dispatchEvent(new Event("vinhaca_nivel_changed"));

    if (logInfo) {
      registerVinhacaActivity({
        origem: 'Níveis',
        tipoAcao: logInfo.tipoAcao,
        detalhes: logInfo.detalhes
      });
    }
  };

  // Find active record
  const activeRecord = carregamentos.find(c => c.id === selectedId) || carregamentos[0];

  // Calculations
  const calcPercent = (rec: CarregamentoNivel) => {
    if (!rec) return 0;
    return Math.round((rec.alturaCaixa / rec.alturaMaxima) * 100);
  };

  const calcVolumeEstocado = (rec: CarregamentoNivel) => {
    if (!rec) return 0;
    const fraction = rec.alturaCaixa / rec.alturaMaxima;
    return Math.round(fraction * rec.volumeMaximo);
  };

  const calcVolumeSaldo = (rec: CarregamentoNivel) => {
    if (!rec) return 0;
    return rec.volumeMaximo - calcVolumeEstocado(rec);
  };

  const calcViagensEstocadas = (rec: CarregamentoNivel) => {
    if (!rec) return 0;
    const volEstocado = calcVolumeEstocado(rec);
    if (rec.capacidadeCaminhao <= 0) return 0;
    return Math.round(volEstocado / rec.capacidadeCaminhao);
  };

  // Add new record
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const formattedDate = newDataHora || now.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).replace(",", "");

    const newRec: CarregamentoNivel = {
      id: `C-${Date.now()}`,
      usina: newUsina,
      dataHora: formattedDate,
      alturaCaixa: newAlturaCaixa,
      alturaMaxima: newAlturaMaxima,
      volumeMaximo: newVolumeMaximo,
      capacidadeCaminhao: newCapacidadeCaminhao,
      variacaoPeriodo: newVariacaoPeriodo
    };

    const updated = [newRec, ...carregamentos];
    saveAll(updated, newRec.id, {
      tipoAcao: 'Inclusão',
      detalhes: `Inserido novo carregamento de nível na base para usina ${newUsina} com nível de ${newAlturaCaixa}cm.`
    });
    setIsAdding(false);
    showToast(`Carregamento para "${newUsina}" adicionado com sucesso!`);

    // Reset default form values
    setNewUsina("Usina Coprodução");
    setNewAlturaCaixa(195);
    setNewAlturaMaxima(250);
    setNewVolumeMaximo(12500);
    setNewCapacidadeCaminhao(60);
    setNewVariacaoPeriodo(-5);
    setNewDataHora("");
  };

  // Delete record
  const handleDelete = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the record
    if (carregamentos.length <= 1) {
      showToast("Não é possível apagar. Você precisa manter pelo menos 1 registro de nível.");
      return;
    }

    const targetRec = carregamentos.find(c => c.id === idToDelete);
    const updated = carregamentos.filter(c => c.id !== idToDelete);
    let nextSelected = selectedId;
    if (selectedId === idToDelete) {
      nextSelected = updated[0].id;
    }

    saveAll(updated, nextSelected, {
      tipoAcao: 'Exclusão',
      detalhes: `Excluído registro de nível de carregamento da usina ${targetRec?.usina || "Desconhecida"}.`
    });
    showToast("Registro removido com sucesso!");
  };

  // Edit fields on active record
  const updateActiveField = (field: keyof CarregamentoNivel, val: any) => {
    if (!activeRecord) return;
    const oldVal = activeRecord[field];
    const updated = carregamentos.map(c => {
      if (c.id === activeRecord.id) {
        return {
          ...c,
          [field]: val
        };
      }
      return c;
    });
    saveAll(updated, activeRecord.id, {
      tipoAcao: 'Edição',
      detalhes: `Alterado campo "${String(field)}" de "${oldVal}" para "${val}" em ajuste rápido na usina ${activeRecord.usina}.`
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative text-left">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#004d22] border-2 border-[#5adc6a]/40 text-white font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="w-2.5 h-2.5 bg-[#5adc6a] rounded-full animate-ping" />
          <span className="text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Hero Subtab-header banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#004d22] to-emerald-900 text-white p-6 md:p-8 rounded-[32px] border border-white/5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full pointer-events-none translate-x-12 -translate-y-12" />
        <div className="z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[#5adc6a] text-[9px] font-black uppercase tracking-widest mb-2.5">
            <span className="w-2 h-2 bg-[#5adc6a] rounded-full animate-pulse" />
            Vinhaça • Unidades de Fertirrigação • Sincronizado: {lastUpdated}
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider leading-none">
            Monitor de Níveis de Caixa de Carregamento
          </h1>
          <p className="text-[11px] text-white/70 italic mt-1.5 leading-normal">
            Faça simulações, calcule volumes, registre variações em tempo real e defina qual unidade enviará os dados para os gráficos integrados do Painel Principal.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="z-10 bg-[#5adc6a] hover:bg-[#4bcc5b] text-emerald-950 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-[#5adc6a]/20 shrink-0"
        >
          <Plus size={15} strokeWidth={3} />
          Adicionar Nível
        </button>
      </div>

      {/* Grid Layout: Sidebar List of Caixas (Left) & Live Graphic/Form Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar: All Caixas Records (Col Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
            Unidades Registradas ({carregamentos.length})
          </h3>
          
          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {carregamentos.map((rec) => {
              const active = rec.id === selectedId;
              const pct = calcPercent(rec);
              
              return (
                <div 
                  key={rec.id}
                  onClick={() => saveAll(carregamentos, rec.id)}
                  className={`p-5 rounded-3xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between pointer-events-auto select-none ${
                    active 
                      ? "bg-[#edf7f2] border-[#00843D] shadow-md relative scale-[1.01]" 
                      : "bg-white border-gray-150 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    {/* Level Visual Icon Indicator */}
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono text-sm font-black transition-all ${
                      active ? "bg-[#00843D] text-white" : "bg-emerald-50 text-[#00843D]"
                    }`}>
                      <span>{pct}%</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs md:text-sm font-black text-gray-900 uppercase">
                          {rec.usina}
                        </h4>
                        {active && (
                          <span className="bg-[#00843D] text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded">
                            ATIVO NO DASH
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase flex items-center gap-1">
                        <Calendar size={11} /> {rec.dataHora}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Delete */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={(e) => handleDelete(rec.id, e)}
                      title="Apagar este carregamento"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition duration-150"
                    >
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} className={`text-gray-300 transition-transform ${active ? "translate-x-1" : ""}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50/70 py-4.5 px-5 rounded-3xl border border-gray-150 text-left">
            <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Info size={13} className="text-[#00843D]" /> Como funciona?
            </h5>
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
              Selecione uma caixa na lista para visualizar o simulador. O carregamento marcado com <span className="text-[#00843D] font-extrabold uppercase">"ATIVO NO DASH"</span> será o único sincronizado e exibido no painel de relatórios integrado de vinhaça.
            </p>
          </div>
        </div>

        {/* Live Graphic & Form Calculator Panel (Col Span 8) */}
        <div className="lg:col-span-8">
          
          {/* Add form Overlay Mode */}
          {isAdding ? (
            <div className="bg-white rounded-[32px] border-2 border-dashed border-[#00843D]/50 p-6 md:p-8 shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h3 className="text-base font-black text-gray-900 uppercase">➕ Formular Novo Carregamento de Vinhaça</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Cálculo Preciso com Configuração de Dimensões</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs font-black uppercase py-1 px-3 border border-gray-200 rounded-xl"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Nome do Ponto / Usina / Caixa</label>
                    <input 
                      type="text"
                      required
                      value={newUsina}
                      onChange={(e) => setNewUsina(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Data / Hora de Coleta (Opcional)</label>
                    <input 
                      type="text"
                      placeholder="Ex: 21/05/2026 23:50"
                      value={newDataHora}
                      onChange={(e) => setNewDataHora(e.target.value)}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Altura Atual do Fluido (cm)</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      value={newAlturaCaixa}
                      onChange={(e) => setNewAlturaCaixa(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Altura Máxima Operacional da Caixa (cm)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={newAlturaMaxima}
                      onChange={(e) => setNewAlturaMaxima(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Volume Máximo de Calda Projetado (m³)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={newVolumeMaximo}
                      onChange={(e) => setNewVolumeMaximo(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Capacidade Média de cada Caminhão (m³)</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      value={newCapacidadeCaminhao}
                      onChange={(e) => setNewCapacidadeCaminhao(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-700 uppercase tracking-wider mb-2">Variação do Período (cm)</label>
                    <input 
                      type="number"
                      required
                      value={newVariacaoPeriodo}
                      onChange={(e) => setNewVariacaoPeriodo(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 text-gray-800 p-3 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                    />
                    <span className="text-[10px] text-gray-400 font-medium block mt-1 uppercase">Use valores negativos para indicar queda e positivos para aumento</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAdding(false)}
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-[#00843D] hover:bg-[#004d22] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    Salvar Novo Registro
                  </button>
                </div>
              </form>
            </div>
          ) : activeRecord ? (
            <div className="bg-white rounded-[32px] border border-gray-150 p-6 md:p-8 shadow-sm space-y-8">
              
              {/* Header Meta information */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#004d22] uppercase tracking-wider">
                      {activeRecord.usina}
                    </h2>
                    <span className="bg-[#5adc6a]/20 text-[#004d22] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      Simulação Ativa
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase flex items-center gap-1">
                    Última atualização : <span className="text-gray-600 underline decoration-dotted">{activeRecord.dataHora}</span>
                  </p>
                </div>

                {/* Switcher Indicator */}
                <div className="bg-emerald-50 border border-emerald-100/60 p-3 rounded-2xl flex items-center gap-3 self-stretch sm:self-auto justify-between">
                  <div className="text-left font-sans">
                    <span className="block text-[8px] font-black text-emerald-800 uppercase tracking-widest leading-none mb-1">Status de Integração</span>
                    <span className="block text-xs font-black text-[#004d22]">Apresentado no Dashboard</span>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-[#00843D] flex items-center justify-center text-white shadow-md">
                    <Check size={16} strokeWidth={3} />
                  </span>
                </div>
              </div>

              {/* Graphic Representation Area Split */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                
                {/* 1. Beaker (Bebe-Frasco) Visual representation - Grandão as expected (Col Span 2) */}
                <div className="md:col-span-2 flex flex-col items-center justify-center space-y-3 py-2 border-b md:border-b-0 md:border-r border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Nível Volumétrico</span>
                  
                  {/* BEAKER MAIN CONTAINER */}
                  <div className="relative w-44 h-72 flex items-end justify-center">
                    
                    {/* Background tick lines outside Beaker */}
                    <div className="absolute right-3.5 top-0 h-full flex flex-col justify-between items-end text-[10px] font-mono font-bold text-gray-400 pr-1 pointer-events-none">
                      <span>{activeRecord.alturaMaxima} cm (100%)</span>
                      <span>{Math.round(activeRecord.alturaMaxima * 0.8)} cm (80%)</span>
                      <span>{Math.round(activeRecord.alturaMaxima * 0.6)} cm (60%)</span>
                      <span>{Math.round(activeRecord.alturaMaxima * 0.4)} cm (40%)</span>
                      <span>{Math.round(activeRecord.alturaMaxima * 0.2)} cm (20%)</span>
                      <span>0 cm (0%)</span>
                    </div>

                    {/* SVG Solid Graduated Beaker Cylinder */}
                    <div className="w-28 h-64 bg-zinc-100/80 border-x-[6px] border-b-[6px] border-zinc-400 rounded-b-3xl relative overflow-hidden flex items-end shadow-inner">
                      
                      {/* Graduated lines inside */}
                      <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex flex-col justify-between py-6 px-1">
                        <div className="w-5 h-0.5 bg-zinc-300" />
                        <div className="w-3 h-0.5 bg-zinc-300" />
                        <div className="w-5 h-0.5 bg-zinc-300" />
                        <div className="w-3 h-0.5 bg-zinc-300" />
                        <div className="w-5 h-0.5 bg-zinc-300" />
                        <div className="w-3 h-0.5 bg-zinc-300" />
                        <div className="w-5 h-0.5 bg-zinc-300" />
                        <div className="w-3 h-0.5 bg-zinc-300" />
                        <div className="w-5 h-0.5 bg-zinc-300" />
                      </div>

                      {/* Liquid level representation using high fidelity animated colors */}
                      <div 
                        style={{ height: `${calcPercent(activeRecord)}%` }}
                        className="w-full bg-gradient-to-t from-[#004d22] via-[#00843D] to-[#5adc6a] transition-all duration-1000 flex flex-col items-center justify-center text-white relative z-10"
                      >
                        {/* Wavy active animation top layer */}
                        <div className="absolute top-0 left-0 w-full h-3 bg-white/25 animate-pulse opacity-80" />
                        
                        <div className="px-2 text-center text-white drop-shadow-md z-30">
                          <Droplet size={18} className="mx-auto text-white/90 animate-bounce" />
                          <span className="block font-mono text-base font-black tracking-tighter leading-tight mt-1">{calcPercent(activeRecord)}%</span>
                          <span className="block text-[8px] font-bold uppercase tracking-wider text-emerald-100">Fração</span>
                        </div>
                      </div>
                    </div>

                    {/* Beaker Lip spout */}
                    <div className="absolute top-[3px] left-8 w-6 h-5 bg-zinc-400 rounded-tl-full -translate-x-1 border-t-2 border-zinc-300" style={{ transform: 'skewY(-15deg)' }} />
                  </div>

                  <p className="font-mono text-2xl font-black text-slate-800 leading-none">
                    {calcPercent(activeRecord)}%
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                    Preenchimento Caixa
                  </p>
                </div>

                {/* 2. Semi-Circle Gauge speedometer (Col Span 3) */}
                <div className="md:col-span-3 flex flex-col items-center justify-center space-y-4">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Velocímetro de Capacidade</span>
                  
                  {/* Gauge SVG with needle */}
                  <div className="relative w-72 h-36 flex flex-col justify-end items-center overflow-hidden">
                    <svg className="w-64 h-32" viewBox="0 0 100 50">
                      {/* Gauge Arcs */}
                      {/* Sector 20%: soft gray-green */}
                      <path d="M 10,50 A 40,40 0 0,1 26,26 L 31,31 A 30,30 0 0,0 20,50 Z" fill="#D1FAE5" />
                      {/* Sector 40%: light jade */}
                      <path d="M 26,26 A 40,40 0 0,1 50,10 L 50,20 A 30,30 0 0,0 31,31 Z" fill="#A7F3D0" />
                      {/* Sector 60%: medium green */}
                      <path d="M 50,10 A 40,40 0 0,1 74,26 L 69,31 A 30,30 0 0,0 50,20 Z" fill="#34D399" />
                      {/* Sector 80%: dark emerald */}
                      <path d="M 74,26 A 40,40 0 0,1 90,50 L 80,50 A 30,30 0 0,0 69,31 Z" fill="#059669" />

                      {/* Needle pivot */}
                      <circle cx="50" cy="50" r="4" fill="#EAB308" />

                      {/* Floating percentage values on gauge sectors */}
                      <text x="18" y="44" fill="#047857" fontSize="5" fontWeight="900" textAnchor="middle">20%</text>
                      <text x="32" y="24" fill="#047857" fontSize="5" fontWeight="900" textAnchor="middle">40%</text>
                      <text x="68" y="24" fill="#047857" fontSize="5" fontWeight="900" textAnchor="middle">60%</text>
                      <text x="82" y="44" fill="#047857" fontSize="5" fontWeight="900" textAnchor="middle">80%</text>

                      {/* Active needle rotation calculated. 
                          At 0%, needle angle is -180 degrees or points left (pointing to (10, 50)). 
                          At 100%, needle angle is 0 degrees or points right.
                          Formula for angle in degrees = (percent / 100) * 180 - 180
                      */}
                      {(() => {
                        const pct = calcPercent(activeRecord);
                        const angle = (pct / 100) * 180 - 180;
                        return (
                          <g transform={`rotate(${angle} 50 50)`}>
                            {/* Stylish needle line pointing outwards */}
                            <line x1="50" y1="50" x2="16" y2="50" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                            <polygon points="16,50 22,48 22,52" fill="#EAB308" />
                          </g>
                        );
                      })()}
                    </svg>

                    {/* Gauge label in the middle */}
                    <div className="absolute bottom-1 text-center font-sans">
                      <p className="text-sm font-black text-emerald-800 tracking-wide uppercase italic">
                        {activeRecord.usina}
                      </p>
                      <p className="text-3xl font-black text-gray-900 leading-none font-mono">
                        {calcPercent(activeRecord)}%
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 font-bold max-w-[260px] text-center leading-normal">
                    Fração volumétrica recomendada de vazegamento seguro a <span className="font-extrabold text-[#00843D]">80% de segurança</span>
                  </p>
                </div>
              </div>

              {/* Exact Photo Layout Reconstructed with dotted backgrounds and real-time calculations */}
              <div className="border border-gray-150 rounded-[32px] overflow-hidden bg-[#eaf4ed]/50 text-gray-900 p-6 md:p-8 space-y-7 shadow-xs">
                
                {/* Metric list with dot layout resembling Excel photos perfectly */}
                <div className="space-y-4 font-sans text-sm md:text-base">
                  
                  {/* Metric 1 */}
                  <div className="flex justify-between items-center group">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Altura da caixa (cm)</span>
                    <div className="flex-grow border-b-2 border-dotted border-gray-300 mx-2 self-end h-3" />
                    <span className="font-mono font-black text-gray-800 text-right text-lg underline decoration-1">
                      {activeRecord.alturaCaixa} 
                    </span>
                  </div>

                  {/* Metric 2 */}
                  <div className="flex justify-between items-center group">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Volume estocado (m³)</span>
                    <div className="flex-grow border-b-2 border-dotted border-gray-300 mx-2 self-end h-3" />
                    <span className="font-mono font-black text-gray-800 text-right text-lg underline decoration-1">
                      {formatVolume(calcVolumeEstocado(activeRecord))}
                    </span>
                  </div>

                  {/* Metric 3 */}
                  <div className="flex justify-between items-center group">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Volume maximo (m³)</span>
                    <div className="flex-grow border-b-2 border-dotted border-gray-300 mx-2 self-end h-3" />
                    <span className="font-mono font-black text-gray-800 text-right text-lg underline decoration-1">
                      {formatVolume(activeRecord.volumeMaximo)}
                    </span>
                  </div>

                  {/* Metric 4 */}
                  <div className="flex justify-between items-center group">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Volume saldo (m³)</span>
                    <div className="flex-grow border-b-2 border-dotted border-gray-300 mx-2 self-end h-3" />
                    <span className="font-mono font-black text-gray-800 text-right text-lg underline decoration-1">
                      {formatVolume(calcVolumeSaldo(activeRecord))}
                    </span>
                  </div>

                  {/* Metric 5 */}
                  <div className="flex justify-between items-center group">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Viagens estocadas (v)</span>
                    <div className="flex-grow border-b-2 border-dotted border-gray-300 mx-2 self-end h-3" />
                    <span className="font-mono font-black text-gray-800 text-right text-lg underline decoration-1">
                      {calcViagensEstocadas(activeRecord)}
                    </span>
                  </div>

                </div>

                {/* Period Change dynamic green/alert banner at bottom */}
                {(() => {
                  const val = activeRecord.variacaoPeriodo;
                  const isNegative = val < 0;
                  const sign = isNegative ? "" : "+";
                  const directionTxt = isNegative ? "para baixo" : "para cima";
                  
                  return (
                    <div className={`p-4 rounded-2xl text-center font-extrabold text-xs md:text-sm tracking-wider uppercase border ${
                      isNegative 
                        ? "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]" 
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      Durante o período, a caixa variou {sign}{val} cm {directionTxt}
                    </div>
                  );
                })()}

              </div>

              {/* Slider & Form Configuration Area to play on fly */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-gray-200 text-left space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#00843D]" />
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Painel de Ajuste Rápido (Valores em Tempo Real)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* USINA NAME EDITABLE */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Nome da Caixa / Unidade</label>
                    <input 
                      type="text"
                      value={activeRecord.usina}
                      onChange={(e) => updateActiveField("usina", e.target.value)}
                      className="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00843D]"
                    />
                  </div>

                  {/* DATA HORA EDITABLE */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-gray-400 uppercase">Data / Horário de Coleta</label>
                    <input 
                      type="text"
                      value={activeRecord.dataHora}
                      onChange={(e) => updateActiveField("dataHora", e.target.value)}
                      className="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-xs font-bold font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#00843D]"
                    />
                  </div>

                  {/* HEIGHT SLIDER */}
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black text-gray-400 uppercase">
                        Ajustar Nível da Caixa: <span className="text-[#00843D] text-xs font-black">{activeRecord.alturaCaixa} cm</span>
                      </label>
                      <span className="text-[10px] font-black text-gray-400">Máx: {activeRecord.alturaMaxima} cm</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <input 
                        type="range"
                        min="0"
                        max={activeRecord.alturaMaxima}
                        value={activeRecord.alturaCaixa}
                        onChange={(e) => updateActiveField("alturaCaixa", Number(e.target.value))}
                        className="flex-1 accent-[#00843D] h-2 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <input 
                        type="number"
                        min="0"
                        max={activeRecord.alturaMaxima}
                        value={activeRecord.alturaCaixa}
                        onChange={(e) => updateActiveField("alturaCaixa", Math.min(activeRecord.alturaMaxima, Number(e.target.value)))}
                        className="w-20 bg-white border border-gray-200 p-2 rounded-xl text-xs font-black font-mono text-center text-gray-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* ADVANCED CALIBRATION */}
                  <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200/60">
                    
                    <div className="space-y-1">
                      <span className="block text-[8px] font-black text-gray-400 uppercase">Alt. Máx (cm)</span>
                      <input 
                        type="number"
                        value={activeRecord.alturaMaxima}
                        onChange={(e) => updateActiveField("alturaMaxima", Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold font-mono text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] font-black text-gray-400 uppercase">Vol. Máx (m³)</span>
                      <input 
                        type="number"
                        value={activeRecord.volumeMaximo}
                        onChange={(e) => updateActiveField("volumeMaximo", Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold font-mono text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] font-black text-gray-400 uppercase">Caminhão (m³)</span>
                      <input 
                        type="number"
                        value={activeRecord.capacidadeCaminhao}
                        onChange={(e) => updateActiveField("capacidadeCaminhao", Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold font-mono text-gray-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8px] font-black text-gray-400 uppercase">Variação (cm)</span>
                      <input 
                        type="number"
                        value={activeRecord.variacaoPeriodo}
                        onChange={(e) => updateActiveField("variacaoPeriodo", Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 p-2 rounded-lg text-xs font-bold font-mono text-gray-800"
                      />
                    </div>

                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 bg-white rounded-[32px] border">
              Carregando dados dos níveis...
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
