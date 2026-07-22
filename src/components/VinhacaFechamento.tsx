import React, { useState, useEffect } from "react";
import { 
  Check, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Calculator, 
  RefreshCw, 
  FileSpreadsheet, 
  ChevronRight, 
  DollarSign, 
  Edit3, 
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";
import { registerVinhacaActivity } from "../lib/vinhacaSync";

// LocalStorage Keys (matching VinhacaNiveis)
const LOCAL_STORAGE_KEY_LIST = "vinhaca_nivel_carregamentos";
const LOCAL_STORAGE_KEY_SELECTED = "vinhaca_selected_carregamento_id";
const LOCAL_STORAGE_KEY_FECHAMENTOS = "vinhaca_fechamentos";

export interface UnitFechamentoConfig {
  unitId: string;
  periodoInicio: string; // Ex: "18/05/26 - 07:00"
  periodoFim: string;    // Ex: "19/05/26 - 06:59"
  trips_54_1: number;
  trips_54_2: number;
  trips_54_4: number;
  trips_51_1: number;
  trips_51_2: number;
  trips_51_3: number;
  volPerTrip_54: number; // Ex: 60
  volPerTrip_51: number; // Ex: 60
  lancadosTrips: number;  // Ex: 40
  lancadosM3: number;     // Ex: 2400
}

interface SelectionUnit {
  id: string;
  usina: string;
  alturaCaixa: number;
  variacaoPeriodo: number;
  dataHora: string;
}

export const VinhacaFechamento: React.FC = () => {
  const [units, setUnits] = useState<SelectionUnit[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [fechamentos, setFechamentos] = useState<Record<string, UnitFechamentoConfig>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Editable configurations state for active record
  const [isEditingParams, setIsEditingParams] = useState(false);
  const [filtrarProporcional, setFiltrarProporcional] = useState<boolean>(true);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Initial Loading
  useEffect(() => {
    // A. Load units
    const loadUnitsData = () => {
      const listRaw = localStorage.getItem(LOCAL_STORAGE_KEY_LIST);
      const activeId = localStorage.getItem(LOCAL_STORAGE_KEY_SELECTED);
      let list: SelectionUnit[] = [];

      if (listRaw) {
        try {
          list = JSON.parse(listRaw);
        } catch (e) {
          list = [];
        }
      }

      // Seed fallback identical to VinhacaNiveis if not present
      if (list.length === 0) {
        list = [
          {
            id: "C-01",
            usina: "Usina1 (Bonança)",
            alturaCaixa: 195,
            variacaoPeriodo: -5,
            dataHora: "20/05/2026 23:50"
          },
          {
            id: "C-02",
            usina: "Usina Ariranha (Secundária)",
            alturaCaixa: 150,
            variacaoPeriodo: 15,
            dataHora: "21/05/2026 01:10"
          },
          {
            id: "C-03",
            usina: "Usina Santa Albertina",
            alturaCaixa: 215,
            variacaoPeriodo: -12,
            dataHora: "21/05/2026 02:40"
          }
        ];
      }

      setUnits(list);

      const resolvedActive = (activeId && list.some(x => x.id === activeId)) ? activeId : (list[0]?.id || "");
      setSelectedId(resolvedActive);

      // B. Load Fechamento configs
      const savedFechamentosRaw = localStorage.getItem(LOCAL_STORAGE_KEY_FECHAMENTOS);
      let fMap: Record<string, UnitFechamentoConfig> = {};

      if (savedFechamentosRaw) {
        try {
          fMap = JSON.parse(savedFechamentosRaw);
        } catch (e) {
          fMap = {};
        }
      }

      // Seed defaults for each unit if missing
      list.forEach((u) => {
        if (!fMap[u.id]) {
          // Initialize with default values matching the Excel screenshot
          if (u.id === "C-01") {
            fMap[u.id] = {
              unitId: u.id,
              periodoInicio: "18/05/26 - 07:00",
              periodoFim: "19/05/26 - 06:59",
              trips_54_1: 11,
              trips_54_2: 0,
              trips_54_4: 5,
              trips_51_1: 0,
              trips_51_2: 0,
              trips_51_3: 17,
              volPerTrip_54: 60,
              volPerTrip_51: 60,
              lancadosTrips: 40,
              lancadosM3: 2400
            };
          } else if (u.id === "C-02") {
            fMap[u.id] = {
              unitId: u.id,
              periodoInicio: "19/05/26 - 07:00",
              periodoFim: "20/05/26 - 06:59",
              trips_54_1: 8,
              trips_54_2: 12,
              trips_54_4: 4,
              trips_51_1: 6,
              trips_51_2: 0,
              trips_51_3: 20,
              volPerTrip_54: 60,
              volPerTrip_51: 60,
              lancadosTrips: 60,
              lancadosM3: 3600
            };
          } else {
            fMap[u.id] = {
              unitId: u.id,
              periodoInicio: "20/05/26 - 07:00",
              periodoFim: "21/05/26 - 06:59",
              trips_54_1: 15,
              trips_54_2: 5,
              trips_54_4: 10,
              trips_51_1: 0,
              trips_51_2: 15,
              trips_51_3: 10,
              volPerTrip_54: 60,
              volPerTrip_51: 60,
              lancadosTrips: 65,
              lancadosM3: 3900
            };
          }
        }
      });

      setFechamentos(fMap);
      localStorage.setItem(LOCAL_STORAGE_KEY_FECHAMENTOS, JSON.stringify(fMap));
    };

    loadUnitsData();

    // Listen to changes in levels tab to keep selected unit synchronized live!
    window.addEventListener("vinhaca_nivel_changed", loadUnitsData);
    return () => {
      window.removeEventListener("vinhaca_nivel_changed", loadUnitsData);
    };
  }, []);

  // Update active selected unit
  const handleSelectUnit = (id: string) => {
    setSelectedId(id);
    localStorage.setItem(LOCAL_STORAGE_KEY_SELECTED, id);
    // Notify other components (Niveis & Dashboard)
    window.dispatchEvent(new Event("vinhaca_nivel_changed"));
    showToast(`Unidade alterada com sucesso!`);
  };

  // Active configurations & unit variables
  const activeUnit = units.find(u => u.id === selectedId) || units[0];
  const activeConf = activeUnit && fechamentos[activeUnit.id] ? fechamentos[activeUnit.id] : {
    unitId: selectedId || "C-01",
    periodoInicio: "18/05/26 - 07:00",
    periodoFim: "19/05/26 - 06:59",
    trips_54_1: 11,
    trips_54_2: 0,
    trips_54_4: 5,
    trips_51_1: 0,
    trips_51_2: 0,
    trips_51_3: 17,
    volPerTrip_54: 60,
    volPerTrip_51: 60,
    lancadosTrips: 40,
    lancadosM3: 2400
  };

  // Helper to save fechamento parameters
  const saveActiveConf = (updatedConf: UnitFechamentoConfig, changePerformed?: string) => {
    const nextFechamentos = {
      ...fechamentos,
      [updatedConf.unitId]: updatedConf
    };
    setFechamentos(nextFechamentos);
    localStorage.setItem(LOCAL_STORAGE_KEY_FECHAMENTOS, JSON.stringify(nextFechamentos));

    const unitName = units.find(u => u.id === updatedConf.unitId)?.usina || "Colombo";

    registerVinhacaActivity({
      origem: 'Fechamento',
      tipoAcao: 'Boletim',
      detalhes: changePerformed 
        ? `Fechamento de boletim físico da ${unitName} alterado: ${changePerformed}.`
        : `Boletim físico da ${unitName} salvo nas configurações gerais de fechamento.`
    });
  };

  // Individual field editor
  const updateField = (field: keyof UnitFechamentoConfig, val: any) => {
    if (!activeConf) return;
    const oldVal = activeConf[field];
    const next = {
      ...activeConf,
      [field]: val
    };
    saveActiveConf(next, `campo "${String(field)}" alterado de "${oldVal}" para "${val}"`);
  };

  // Helpers for datetime formatting and calculations
  const convertToIso = (str: string) => {
    if (!str) return "";
    if (str.includes("T")) return str;
    try {
      const cleanStr = str.replace(" às ", " - ").trim();
      const parts = cleanStr.split(" - ");
      if (parts.length < 2) return str;
      const dateParts = parts[0].split("/");
      const timeParts = parts[1].split(":");
      
      const day = dateParts[0].padStart(2, "0");
      const month = dateParts[1].padStart(2, "0");
      let year = dateParts[2];
      if (year && year.length === 2) {
        year = "20" + year;
      } else if (!year) {
        year = "2026";
      }
      
      const hoursVal = timeParts[0].padStart(2, "0");
      const minutesVal = timeParts[1].padStart(2, "0");
      
      return `${year}-${month}-${day}T${hoursVal}:${minutesVal}`;
    } catch (e) {
      return str;
    }
  };

  const formatDateTimeToBR = (isoStr: string) => {
    if (!isoStr) return "";
    if (isoStr.includes(" - ") && !isoStr.includes("T")) return isoStr;
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).substring(2); // 2-digit year
      const hoursVal = String(d.getHours()).padStart(2, "0");
      const minutesVal = String(d.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} - ${hoursVal}:${minutesVal}`;
    } catch (e) {
      return isoStr;
    }
  };

  const getDurationHours = (startStr: string, endStr: string) => {
    try {
      const t1 = new Date(convertToIso(startStr)).getTime();
      const t2 = new Date(convertToIso(endStr)).getTime();
      if (!isNaN(t1) && !isNaN(t2) && t2 > t1) {
        return (t2 - t1) / (1000 * 3600);
      }
    } catch (e) {
      console.error(e);
    }
    return 24; // fallback to 24 hours
  };

  const hours = activeConf ? getDurationHours(activeConf.periodoInicio, activeConf.periodoFim) : 24;
  const scaleFactor = hours / 24;

  // Calculations for Table 1: Frentes (scaled dynamically if toggle active)
  const trips_54_1_scaled = filtrarProporcional ? Math.round(activeConf.trips_54_1 * scaleFactor) : activeConf.trips_54_1;
  const trips_54_2_scaled = filtrarProporcional ? Math.round(activeConf.trips_54_2 * scaleFactor) : activeConf.trips_54_2;
  const trips_54_4_scaled = filtrarProporcional ? Math.round(activeConf.trips_54_4 * scaleFactor) : activeConf.trips_54_4;
  
  const trips_51_1_scaled = filtrarProporcional ? Math.round(activeConf.trips_51_1 * scaleFactor) : activeConf.trips_51_1;
  const trips_51_2_scaled = filtrarProporcional ? Math.round(activeConf.trips_51_2 * scaleFactor) : activeConf.trips_51_2;
  const trips_51_3_scaled = filtrarProporcional ? Math.round(activeConf.trips_51_3 * scaleFactor) : activeConf.trips_51_3;

  const m3_54_1 = trips_54_1_scaled * activeConf.volPerTrip_54;
  const m3_54_2 = trips_54_2_scaled * activeConf.volPerTrip_54;
  const m3_54_4 = trips_54_4_scaled * activeConf.volPerTrip_54;
  
  const m3_51_1 = trips_51_1_scaled * activeConf.volPerTrip_51;
  const m3_51_2 = trips_51_2_scaled * activeConf.volPerTrip_51;
  const m3_51_3 = trips_51_3_scaled * activeConf.volPerTrip_51;

  const totalTrips = 
    trips_54_1_scaled + 
    trips_54_2_scaled + 
    trips_54_4_scaled + 
    trips_51_1_scaled + 
    trips_51_2_scaled + 
    trips_51_3_scaled;

  const totalVolume = m3_54_1 + m3_54_2 + m3_54_4 + m3_51_1 + m3_51_2 + m3_51_3;

  const getPercentParticipation = (itemVolume: number) => {
    if (totalVolume <= 0) return 0;
    return Math.round((itemVolume / totalVolume) * 100);
  };

  // Calculations for Table 2: Modalidades
  const localizedTrips = trips_54_1_scaled + trips_54_2_scaled + trips_54_4_scaled;
  const localizedVolume = m3_54_1 + m3_54_2 + m3_54_4;

  const aspersionTrips = trips_51_1_scaled + trips_51_2_scaled + trips_51_3_scaled;
  const aspersionVolume = m3_51_1 + m3_51_2 + m3_51_3;

  // Calculations for Table 3: Status Caixas
  const lancadosTrips_scaled = filtrarProporcional ? Math.round(activeConf.lancadosTrips * scaleFactor) : activeConf.lancadosTrips;
  const lancadosM3_scaled = filtrarProporcional ? Math.round(activeConf.lancadosM3 * scaleFactor) : activeConf.lancadosM3;

  const saldoTrips = Math.max(0, lancadosTrips_scaled - totalTrips);
  const saldoVolume = Math.max(0, lancadosM3_scaled - totalVolume);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative text-left">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 bg-[#004d22] border-2 border-[#5adc6a]/40 text-white font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="w-2.5 h-2.5 bg-[#5adc6a] rounded-full animate-ping" />
          <span className="text-xs uppercase tracking-wider">{toastMessage}</span>
        </div>
      )}

      {/* Styled Head Banner */}
      <div className="bg-gradient-to-r from-[#004d22] via-[#006e33] to-[#00843D] text-white p-6 md:p-8 rounded-[32px] border border-[#5adc6a]/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full pointer-events-none translate-x-12 -translate-y-12" />
        <div className="z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[#5adc6a] text-[9px] font-black uppercase tracking-widest mb-2.5">
            <span className="w-2 h-2 bg-[#5adc6a] rounded-full animate-pulse" />
            Safra do Período • Fechamento Físico • Sincronizado: {lastUpdated}
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider leading-none">
            Fechamento de Unidade e Balanço de Canal
          </h1>
          <p className="text-[11px] text-white/70 italic mt-1.5 leading-normal">
            Balanço dinâmico integrado! Monitore a eficiência do destino, calcule volumes em tempo real por frentes e modalidades para a usina escolhida.
          </p>
        </div>

        <div className="z-10 shrink-0 bg-white/10 border border-white/15 p-3 rounded-2xl flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[8px] font-bold uppercase text-[#5adc6a] tracking-widest">Unidade Selecionada</span>
            <span className="block text-sm font-black uppercase">{activeUnit?.usina || "Carregando..."}</span>
          </div>
          <div className="w-10 h-10 bg-[#5adc6a] text-emerald-950 font-black text-xs rounded-xl flex items-center justify-center">
            {activeUnit?.id || "N/A"}
          </div>
        </div>
      </div>

      {/* Main Grid: Selection Sidebar (Left) & Professional Visual Balance Tables (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Sidebar Switcher and Param Adjuster */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
              Selecione a Unidade para o Fechamento
            </h3>
            
            <div className="space-y-2.5">
              {units.map((u) => {
                const active = u.id === selectedId;
                const confData = fechamentos[u.id];
                const totalTripsCount = confData 
                  ? (confData.trips_54_1 + confData.trips_54_2 + confData.trips_54_4 + confData.trips_51_1 + confData.trips_51_2 + confData.trips_51_3)
                  : 0;
                
                return (
                  <div 
                    key={u.id}
                    onClick={() => handleSelectUnit(u.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left relative flex items-center justify-between ${
                      active 
                        ? "bg-zinc-50 border-[#00843D] shadow-md scale-[1.01]" 
                        : "bg-white border-gray-150 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs md:text-sm font-black text-gray-900 uppercase">
                        {u.usina}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase flex items-center gap-1">
                        <FileSpreadsheet size={11} className="text-[#00843D]" /> {totalTripsCount} Viagens Totais Homologadas
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {active ? (
                        <span className="w-6 h-6 rounded-full bg-[#00843D] text-white flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <ChevronRight size={14} className="text-gray-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Realtime Parameters Adjustment Area */}
          {activeConf && (
            <div className="bg-white border border-gray-150 p-6 rounded-3xl shadow-sm text-left space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator size={15} className="text-[#00843D]" />
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Ajuste de Variáveis (Simular)</h4>
                </div>
                <button 
                  onClick={() => setIsEditingParams(!isEditingParams)}
                  className="text-[#00843D] hover:bg-emerald-50 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-emerald-100 transition"
                >
                  {isEditingParams ? "Fechar" : "Simulação Completa"}
                </button>
              </div>

              {/* Simple Inputs always visible */}
              <div className="space-y-4 text-xs font-sans">
                
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">M³/Viagem (Frentes 54)</label>
                    <input 
                      type="number"
                      value={activeConf.volPerTrip_54}
                      onChange={(e) => updateField("volPerTrip_54", Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono font-bold text-gray-800 focus:outline-[#00843D] focus:bg-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">M³/Viagem (Frentes 51)</label>
                    <input 
                      type="number"
                      value={activeConf.volPerTrip_51}
                      onChange={(e) => updateField("volPerTrip_51", Number(e.target.value))}
                      className="w-full bg-slate-50 border border-gray-200 rounded-lg p-2 font-mono font-bold text-gray-800 focus:outline-[#00843D] focus:bg-white text-center"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1">🛻 Quantidade de Viagens por Frente:</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-bold text-gray-500 uppercase">54-1 Vin. Loc.</label>
                      <input 
                        type="number"
                        min="0"
                        value={activeConf.trips_54_1}
                        onChange={(e) => updateField("trips_54_1", Number(e.target.value))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-gray-500 uppercase">54-2 Vin. Loc.</label>
                      <input 
                        type="number"
                        min="0"
                        value={activeConf.trips_54_2}
                        onChange={(e) => updateField("trips_54_2", Number(e.target.value))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-gray-500 uppercase">54-4 Vin. Loc.</label>
                      <input 
                        type="number"
                        min="0"
                        value={activeConf.trips_54_4}
                        onChange={(e) => updateField("trips_54_4", Number(e.target.value))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-gray-500 uppercase">51-3 Aspersão</label>
                      <input 
                        type="number"
                        min="0"
                        value={activeConf.trips_51_3}
                        onChange={(e) => updateField("trips_51_3", Number(e.target.value))}
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                {isEditingParams && (
                  <div className="space-y-4 pt-3 border-t border-gray-100 animate-in slide-in-from-top duration-300">
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] font-bold text-gray-500 uppercase">51-1 Aspersão</label>
                        <input 
                          type="number"
                          min="0"
                          value={activeConf.trips_51_1}
                          onChange={(e) => updateField("trips_51_1", Number(e.target.value))}
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-bold text-gray-500 uppercase">51-2 Aspersão</label>
                        <input 
                          type="number"
                          min="0"
                          value={activeConf.trips_51_2}
                          onChange={(e) => updateField("trips_51_2", Number(e.target.value))}
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-center"
                        />
                      </div>
                    </div>

                    <div className="bg-[#edf7f2] p-3 rounded-xl space-y-2 border border-emerald-100">
                      <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">📦 Simular Calda Lançada:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[7px] font-bold text-emerald-700 uppercase">Viagens Iniciais</label>
                          <input 
                            type="number"
                            value={activeConf.lancadosTrips}
                            onChange={(e) => updateField("lancadosTrips", Number(e.target.value))}
                            className="w-full bg-white border border-emerald-200 rounded-md p-1 font-mono text-center font-bold text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[7px] font-bold text-emerald-700 uppercase">Volume M³</label>
                          <input 
                            type="number"
                            value={activeConf.lancadosM3}
                            onChange={(e) => updateField("lancadosM3", Number(e.target.value))}
                            className="w-full bg-white border border-emerald-200 rounded-md p-1 font-mono text-center font-bold text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Período de Início</label>
                        <input 
                          type="text"
                          value={activeConf.periodoInicio}
                          onChange={(e) => updateField("periodoInicio", e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-xs text-gray-700 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Período de Fim</label>
                        <input 
                          type="text"
                          value={activeConf.periodoFim}
                          onChange={(e) => updateField("periodoFim", e.target.value)}
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg p-1.5 font-mono text-xs text-gray-700 font-bold"
                        />
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

          <div className="bg-gray-50/70 p-5 rounded-3xl border border-gray-200 text-left">
            <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Info size={13} className="text-[#00843D]" /> Sobre a Conciliação
            </h5>
            <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
              Esta aba representa o Relatório de Fechamento por canal físico de destinação de vinhaça. Ajuste as viagens em cada uma das frentes para recalcular instantaneamente as tabelas ao lado.
            </p>
          </div>
        </div>

        {/* Right column: High Fidelity Excel Tables mimicking the uploaded picture perfectly */}
        <div className="lg:col-span-8 space-y-8 bg-white p-6 md:p-8 rounded-[32px] border border-gray-150 shadow-sm">
          
          {/* Header indicator - interactive and editable period picker */}
          <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-500/20 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-400" /> Período Oficial de Fechamento
                </span>
                <p className="text-xs text-emerald-100/70 italic font-medium">
                  Ajuste o início e fim para recalcular e filtrar proporcionalmente as viagens e volumes.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 w-full md:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase text-emerald-400">De:</span>
                  <input 
                    type="datetime-local" 
                    value={convertToIso(activeConf.periodoInicio)}
                    onChange={(e) => updateField("periodoInicio", e.target.value)}
                    className="bg-emerald-900/40 border border-emerald-500/30 rounded-lg px-2 py-1 text-xs font-bold font-mono text-white outline-none focus:border-emerald-400 cursor-pointer"
                  />
                </div>
                
                <span className="text-emerald-400 text-xs font-bold font-mono">até</span>
                
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase text-emerald-400">Até:</span>
                  <input 
                    type="datetime-local" 
                    value={convertToIso(activeConf.periodoFim)}
                    onChange={(e) => updateField("periodoFim", e.target.value)}
                    className="bg-emerald-900/40 border border-emerald-500/30 rounded-lg px-2 py-1 text-xs font-bold font-mono text-white outline-none focus:border-emerald-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-[11px] text-emerald-100/80 font-bold">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono text-[10px]">
                  ⏱️ {hours.toFixed(1)} horas de operação
                </span>
                <span className="text-emerald-400/50">|</span>
                <span className="text-emerald-300">
                  Fator Escala: {scaleFactor.toFixed(2)}x
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={filtrarProporcional}
                  onChange={(e) => setFiltrarProporcional(e.target.checked)}
                  className="rounded border-emerald-500/30 bg-emerald-900 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span>Filtrar e ajustar viagens proporcionalmente</span>
              </label>
            </div>
          </div>

          {/* TABLE 1: Frentes */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest px-1">
              • Distribuição de Calda por Frentes de Trabalho
            </h4>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-xs">
              <table className="w-full text-center border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#004d22] text-white font-extrabold uppercase text-[10px] md:text-xs">
                    <th className="py-3 px-4 text-left border-r border-[#5adc6a]/20">Frentes</th>
                    <th className="py-3 px-4 border-r border-[#5adc6a]/20">Qtda de Viagens</th>
                    <th className="py-3 px-4 border-r border-[#5adc6a]/20">Metros Cúbicos</th>
                    <th className="py-3 px-4">(%) Participação</th>
                  </tr>
                </thead>
                <tbody className="font-sans font-bold text-gray-700">
                  
                  {/* Row 1: 54-1 Vin. Loc. */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold italic">54-1 Vin. Loc.</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{trips_54_1_scaled || "0"}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{m3_54_1 || "0"}</td>
                    <td className="py-3 px-4 font-mono text-[#00843D] text-[13px] font-black">{trips_54_1_scaled > 0 ? `${getPercentParticipation(m3_54_1)}%` : "-"}</td>
                  </tr>

                  {/* Row 2: 54-2 Vin. Loc. */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold italic">54-2 Vin. Loc.</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{trips_54_2_scaled || "0"}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{m3_54_2 || "0"}</td>
                    <td className="py-3 px-4 font-mono text-[#00843D] text-[13px] font-black">{trips_54_2_scaled > 0 ? `${getPercentParticipation(m3_54_2)}%` : "-"}</td>
                  </tr>

                  {/* Row 3: 54-4 Vin. Loc. */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold italic">54-4 Vin. Loc.</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{trips_54_4_scaled || "0"}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{m3_54_4 || "0"}</td>
                    <td className="py-3 px-4 font-mono text-[#00843D] text-[13px] font-black">{trips_54_4_scaled > 0 ? `${getPercentParticipation(m3_54_4)}%` : "-"}</td>
                  </tr>

                  {/* Row 4: 51-1 Aspersão */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold italic">51-1 Aspersão</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{trips_51_1_scaled || "0"}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{m3_51_1 || "0"}</td>
                    <td className="py-3 px-4 font-mono text-[#00843D] text-[13px] font-black">{trips_51_1_scaled > 0 ? `${getPercentParticipation(m3_51_1)}%` : "-"}</td>
                  </tr>

                  {/* Row 5: 51-2 Aspersão */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold italic">51-2 Aspersão</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{trips_51_2_scaled || "0"}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{m3_51_2 || "0"}</td>
                    <td className="py-3 px-4 font-mono text-[#00843D] text-[13px] font-black">{trips_51_2_scaled > 0 ? `${getPercentParticipation(m3_51_2)}%` : "-"}</td>
                  </tr>

                  {/* Row 6: 51-3 Aspersão */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold italic">51-3 Aspersão</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{trips_51_3_scaled || "0"}</td>
                    <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{m3_51_3 || "0"}</td>
                    <td className="py-3 px-4 font-mono text-[#00843D] text-[13px] font-black">{trips_51_3_scaled > 0 ? `${getPercentParticipation(m3_51_3)}%` : "-"}</td>
                  </tr>

                  {/* CONSOLIDADO ROW - Beautiful orange background matching the image */}
                  <tr className="bg-[#f5b813] text-gray-900 font-black text-sm md:text-base selection:bg-black/10">
                    <td className="py-3.5 px-4 text-left border-r border-amber-400/30 uppercase tracking-widest">Consolidado</td>
                    <td className="py-3.5 px-4 border-r border-amber-400/30 font-mono text-base">{totalTrips}</td>
                    <td className="py-3.5 px-4 border-r border-amber-400/30 font-mono text-base">{totalVolume}</td>
                    <td className="py-3.5 px-4 font-mono text-base">100%</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: Modalidade */}
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest px-1">
              • Resumo Balanço por Modalidade de Fertilização
            </h4>

            <div className="overflow-x-auto rounded-3xl border border-gray-200 shadow-xs">
              <table className="w-full text-center border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#004d22] text-white font-extrabold uppercase text-[10px] md:text-xs">
                    <th className="py-3 px-4 text-left border-r border-[#5adc6a]/20">Modalidade</th>
                    <th className="py-3 px-4 border-r border-[#5adc6a]/20">Qtda de Viagens</th>
                    <th className="py-3 px-4 border-r border-[#5adc6a]/20">Metros Cúbicos</th>
                    <th className="py-3 px-4">(%) Participação</th>
                  </tr>
                </thead>
                <tbody className="font-sans font-bold text-gray-700">
                  
                  {/* Row 1: Localizada */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold">Localizada</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 font-mono text-gray-600">{localizedTrips}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 font-mono text-gray-600">{localizedVolume}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-black text-sm">{getPercentParticipation(localizedVolume)}%</td>
                  </tr>

                  {/* Row 2: Aspersão */}
                  <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold">Aspersão</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 font-mono text-gray-600">{aspersionTrips}</td>
                    <td className="py-3.5 px-4 border-r border-gray-200 font-mono text-gray-600">{aspersionVolume}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-black text-sm">{getPercentParticipation(aspersionVolume)}%</td>
                  </tr>

                  {/* CONSOLIDADO ROW */}
                  <tr className="bg-[#f5b813] text-gray-900 font-black text-sm md:text-base">
                    <td className="py-3.5 px-4 text-left border-r border-amber-400/30 uppercase tracking-widest">Consolidado</td>
                    <td className="py-3.5 px-4 border-r border-amber-400/30 font-mono text-base">{totalTrips}</td>
                    <td className="py-3.5 px-4 border-r border-amber-400/30 font-mono text-base">{totalVolume}</td>
                    <td className="py-3.5 px-4 font-mono text-base">100%</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 3: Status Caixas (Lançados vs Retirados Output Reconciliation) */}
          <div className="space-y-4 text-left">
            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest px-1">
              • Estatísticas Conciliação de Canais (Entrada vs Saída)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Table */}
              <div className="md:col-span-8 overflow-x-auto rounded-3xl border border-gray-200 shadow-xs">
                <table className="w-full text-center border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[#004d22] text-white font-extrabold uppercase text-[10px] md:text-xs">
                      <th className="py-3 px-4 text-left border-r border-[#5adc6a]/20">Status Caixas</th>
                      <th className="py-3 px-4 border-r border-[#5adc6a]/20">Viagens</th>
                      <th className="py-3 px-4">Metros Cúbicos</th>
                    </tr>
                  </thead>
                  <tbody className="font-sans font-bold text-gray-700">
                    
                    {/* Row 1: Lançados */}
                    <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold">Lançados</td>
                      <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{lancadosTrips_scaled}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{lancadosM3_scaled}</td>
                    </tr>

                    {/* Row 2: Retirados */}
                    <tr className="border-b border-gray-150 hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-left border-r border-gray-200 text-gray-900 font-extrabold">Retirados</td>
                      <td className="py-3 px-4 border-r border-gray-200 font-mono text-gray-600">{totalTrips}</td>
                      <td className="py-3 px-4 font-mono text-gray-600">{totalVolume}</td>
                    </tr>

                    {/* Saldo Row - Beautiful light reddish/pink background with reddish text exactly like Excel image */}
                    <tr className="bg-[#fcdede] text-[#b91c1c] font-black text-sm md:text-base">
                      <td className="py-3 px-4 text-left border-r border-red-200/50 uppercase">Saldo</td>
                      <td className="py-3 px-4 border-r border-red-200/50 font-mono text-base">{saldoTrips}</td>
                      <td className="py-3 px-4 font-mono text-base">{saldoVolume}</td>
                    </tr>

                  </tbody>
                </table>
              </div>

              {/* Text note next to the status as requested from the Excel copy */}
              {activeUnit && (
                <div className="md:col-span-4 p-4.5 bg-gray-50 border border-gray-200 rounded-3xl">
                  <p className="font-sans font-extrabold text-xs md:text-sm text-gray-800 leading-relaxed italic text-left underline decoration-[#00843D] decoration-solid underline-offset-4">
                    Durante o período, a caixa variou {activeUnit.variacaoPeriodo < 0 ? "" : "+"}{activeUnit.variacaoPeriodo} cm, com saldo final de {activeUnit.alturaCaixa} cm.
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* Quick PDF/Report Generation Button to give user closure */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 animate-spin" />
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">Homologação Digital de Safra Ativa</span>
            </div>
            
            <button 
              onClick={() => {
                // Generate a beautiful styled print layout HTML
                const printHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Fechamento de Vinhaça - ${activeUnit.usina}</title>
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; margin: 40px; background-color: #fff; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #00843D; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-title { font-weight: 900; font-size: 24px; color: #00843D; letter-spacing: -0.02em; }
        .subtitle { font-weight: 800; font-size: 11px; color: #64748b; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.1em; }
        .metadata { margin-bottom: 30px; font-size: 12px; line-height: 1.6; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
        th { background: #004d22; color: #fff; text-transform: uppercase; padding: 10px; font-weight: 800; border: 1px solid #004d22; font-size: 10px; letter-spacing: 0.05em; }
        td { padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: 600; }
        .text-left { text-align: left; }
        .bold { font-weight: 800; }
        .highlight-row { background: #f5b813; font-weight: 900; color: #1e293b; }
        .red-row { background: #fcdede; color: #b91c1c; font-weight: 900; }
        .note { border-left: 4px solid #00843D; padding: 15px; background: #f0fdf4; font-style: italic; margin-bottom: 40px; border-radius: 0 12px 12px 0; font-size: 12px; font-weight: 700; color: #166534; }
        .print-btn { background: #00843D; color: #fff; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 11px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 132, 61, 0.1); }
        @media print { .print-btn { display: none; } }
    </style>
</head>
<body>
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
    <div class="header">
        <div>
            <div class="logo-title">COLOMBO AGROINDÚSTRIA</div>
            <div class="subtitle">Balanço Físico de Vinhaça - SmartFlow</div>
        </div>
        <div style="text-align: right; font-size: 11px; font-weight: 800; color: #475569; line-height: 1.4;">
            UNIDADE: ${activeUnit.usina.toUpperCase()}<br>
            EMISSÃO: ${new Date().toLocaleString('pt-BR')}
        </div>
    </div>

    <div class="metadata">
        <strong>Período do Fechamento:</strong> de ${formatDateTimeToBR(activeConf.periodoInicio)} até ${formatDateTimeToBR(activeConf.periodoFim)}<br>
        <strong>Gerado por:</strong> Sistema de Monitoramento Operacional PPT<br>
        <strong>Status de Homologação:</strong> Homologado Digitalmente por Colombo SmartFlow
    </div>

    <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; color: #004d22;">1. Resumo por Frente de Trabalho / Destino</h3>
    <table>
        <thead>
            <tr>
                <th class="text-left">Identificação Frente</th>
                <th>Quantidade Viagens</th>
                <th>Metros Cúbicos (m³)</th>
                <th>(%) Participação</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-left bold">Frente 54-4 (Vinhaça Localizada)</td>
                <td>${trips_54_4_scaled}</td>
                <td>${m3_54_4} m³</td>
                <td>${getPercentParticipation(m3_54_4)}%</td>
            </tr>
            <tr>
                <td class="text-left bold">Frente 54-2 (Vinhaça Localizada)</td>
                <td>${trips_54_2_scaled}</td>
                <td>${m3_54_2} m³</td>
                <td>${getPercentParticipation(m3_54_2)}%</td>
            </tr>
            <tr>
                <td class="text-left bold">Frente 54-1 (Vinhaça Localizada)</td>
                <td>${trips_54_1_scaled}</td>
                <td>${m3_54_1} m³</td>
                <td>${getPercentParticipation(m3_54_1)}%</td>
            </tr>
            <tr>
                <td class="text-left bold">Frente 51-1 (Vinhaça Aspersão)</td>
                <td>${trips_51_1_scaled}</td>
                <td>${m3_51_1} m³</td>
                <td>${getPercentParticipation(m3_51_1)}%</td>
            </tr>
            <tr>
                <td class="text-left bold">Frente 51-2 (Vinhaça Aspersão)</td>
                <td>${trips_51_2_scaled}</td>
                <td>${m3_51_2} m³</td>
                <td>${getPercentParticipation(m3_51_2)}%</td>
            </tr>
            <tr>
                <td class="text-left bold">Frente 51-3 (Vinhaça Aspersão)</td>
                <td>${trips_51_3_scaled}</td>
                <td>${m3_51_3} m³</td>
                <td>${getPercentParticipation(m3_51_3)}%</td>
            </tr>
            <tr class="highlight-row">
                <td class="text-left uppercase">Consolidado</td>
                <td>${totalTrips}</td>
                <td>${totalVolume} m³</td>
                <td>100%</td>
            </tr>
        </tbody>
    </table>

    <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; color: #004d22;">2. Resumo por Modalidade de Fertilização</h3>
    <table>
        <thead>
            <tr>
                <th class="text-left">Modalidade</th>
                <th>Quantidade de Viagens</th>
                <th>Metros Cúbicos (m³)</th>
                <th>(%) Participação</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-left bold">Localizada</td>
                <td>${localizedTrips}</td>
                <td>${localizedVolume} m³</td>
                <td>${getPercentParticipation(localizedVolume)}%</td>
            </tr>
            <tr>
                <td class="text-left bold">Aspersão</td>
                <td>${aspersionTrips}</td>
                <td>${aspersionVolume} m³</td>
                <td>${getPercentParticipation(aspersionVolume)}%</td>
            </tr>
            <tr class="highlight-row">
                <td class="text-left uppercase">Consolidado</td>
                <td>${totalTrips}</td>
                <td>${totalVolume} m³</td>
                <td>100%</td>
            </tr>
        </tbody>
    </table>

    <h3 style="font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 12px; color: #004d22;">3. Conciliação de Canais (Entrada vs Saída)</h3>
    <table>
        <thead>
            <tr>
                <th class="text-left">Fluxo de Caixa / Canal</th>
                <th>Quantidade Viagens</th>
                <th>Metros Cúbicos (m³)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-left bold">Lançados (Entrada)</td>
                <td>${lancadosTrips_scaled}</td>
                <td>${lancadosM3_scaled} m³</td>
            </tr>
            <tr>
                <td class="text-left bold">Retirados (Saída)</td>
                <td>${totalTrips}</td>
                <td>${totalVolume} m³</td>
            </tr>
            <tr class="red-row">
                <td class="text-left uppercase">Saldo (Perda/Ganho)</td>
                <td>${saldoTrips}</td>
                <td>${saldoVolume} m³</td>
            </tr>
        </tbody>
    </table>

    <div class="note">
        <strong>Nota Operacional de Nível:</strong> Durante o período avaliado, a caixa variou ${activeUnit.variacaoPeriodo < 0 ? "" : "+"}${activeUnit.variacaoPeriodo} cm, com uma altura de caixa final estabilizada em ${activeUnit.alturaCaixa} cm.
    </div>

    <div style="margin-top: 60px; display: flex; justify-content: space-between; font-size: 11px; color: #475569; font-weight: 700;">
        <div style="border-top: 2px solid #cbd5e1; width: 40%; text-align: center; padding-top: 10px;">
            Responsável Técnico - SmartFlow Colombo
        </div>
        <div style="border-top: 2px solid #cbd5e1; width: 40%; text-align: center; padding-top: 10px;">
            Supervisor Operacional PPT
        </div>
    </div>
</body>
</html>`;

                const blob = new Blob([printHTML], { type: "text/html;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `FECHAMENTO_VINHACA_${activeUnit.usina.toUpperCase().replace(/\s/g, "_")}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showToast(`Fechamento da unidade "${activeUnit.usina}" exportado digitalmente com sucesso!`);
              }}
              className="bg-[#00843D] hover:bg-[#004d22] text-white flex items-center justify-center gap-1 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              📥 Exportar Relatório Consolidado (.PDF)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
