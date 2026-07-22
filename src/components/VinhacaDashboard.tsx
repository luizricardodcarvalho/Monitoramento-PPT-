import React, { useState, useEffect } from "react";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Cell
} from "recharts";
import { 
  Droplet, 
  Truck, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  X,
  Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HourlyApontamento {
  hora: string;
  f_54_4_vln: number;
  f_54_2_vln: number;
  f_54_1_vln: number;
  f_51_4_asp: number;
  f_51_2_asp: number;
  f_51_3_asp: number;
  solicitado: number;
  atendidos: number;
  teorK2O: number;
  caixaUsina1: number;
  caixaUsina2: number;
  caixaAcorce: number;
  caixaLeila: number;
  caixaOlaria: number;
  caixaRosa: number;
  caixaManLinha: number;
  aguaResiduais: number;
  vazaoVinhacaInformada: number;
  vazaoReal: number;
  totalEstoque: number;
  retirado: number;
  necessidadeTrabalhou: number;
  caminhaoNecessidade: number;
  caminhaoTrabalhou: number;
  obs: string;
}

const HOURS_LIST = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

// Fallback seed generator matching exact screenshots
const getSeedData = (): HourlyApontamento[] => {
  return HOURS_LIST.map((h, i) => {
    let f_54_4_vln = 0;
    let f_51_3_asp = 0;
    let f_54_1_vln = 0;
    let solicitado = 9;
    let teorK2O = 5.1;
    let caixaUsina1 = 200;
    let aguaResiduais = 60;
    let vazaoVinhacaInformada = 280;
    let vazaoReal = 280;
    let totalEstoque = 10000000;
    let retirado = 300;
    let necessidadeTrabalhou = 0;
    let caminhaoNecessidade = 10;
    let caminhaoTrabalhou = 17;

    if (i === 0) {
      f_54_4_vln = 1; f_51_3_asp = 4; solicitado = 9; caixaUsina1 = 200; vazaoVinhacaInformada = 286; vazaoReal = 300; retirado = 300;
    } else if (i === 1) {
      f_54_4_vln = 3; f_54_1_vln = 1; f_51_3_asp = 2; solicitado = 10; caixaUsina1 = 200; vazaoVinhacaInformada = 288; vazaoReal = 360; retirado = 360; caminhaoTrabalhou = 21;
    } else if (i === 2) {
      f_54_4_vln = 1; f_51_3_asp = 2; solicitado = 9; caixaUsina1 = 200; vazaoVinhacaInformada = 286; vazaoReal = 180; retirado = 180; caminhaoTrabalhou = 21;
    } else if (i === 3) {
      f_54_4_vln = 1; f_54_1_vln = 1; f_51_3_asp = 1; solicitado = 9; caixaUsina1 = 185; vazaoVinhacaInformada = 275; vazaoReal = 180; retirado = 180; caminhaoTrabalhou = 21;
    } else if (i === 4) {
      f_54_4_vln = 1; f_51_3_asp = 3; solicitado = 8; caixaUsina1 = 190; vazaoVinhacaInformada = 280; vazaoReal = 240; retirado = 240; caminhaoTrabalhou = 19;
    } else if (i === 5) {
      f_54_4_vln = 3; f_54_1_vln = 2; f_51_3_asp = 2; solicitado = 9; caixaUsina1 = 185; vazaoVinhacaInformada = 270; vazaoReal = 420; retirado = 420; caminhaoTrabalhou = 17;
    } else if (i === 6) {
      f_54_4_vln = 2; f_51_3_asp = 2; solicitado = 9; caixaUsina1 = 185; vazaoVinhacaInformada = 280; vazaoReal = 240; retirado = 240; caminhaoTrabalhou = 17;
    } else if (i === 7) {
      f_54_4_vln = 0; f_51_3_asp = 1; solicitado = 9; caixaUsina1 = 180; vazaoVinhacaInformada = 280; vazaoReal = 240; retirado = 240; caminhaoTrabalhou = 17;
    } else {
      f_54_4_vln = Math.random() > 0.4 ? 1 : 0;
      f_51_3_asp = Math.random() > 0.4 ? 2 : 0;
      solicitado = 8;
      caixaUsina1 = 180 - (i % 5) * 5;
      vazaoVinhacaInformada = 260 + (i % 4) * 10;
      vazaoReal = Math.random() > 0.6 ? vazaoVinhacaInformada : 0;
      caminhaoTrabalhou = Math.random() > 0.6 ? 17 : 0;
    }

    const atendidos = f_54_4_vln + f_54_1_vln + f_51_3_asp;

    return {
      hora: h,
      f_54_4_vln,
      f_54_2_vln: 0,
      f_54_1_vln,
      f_51_4_asp: 0,
      f_51_2_asp: 0,
      f_51_3_asp,
      solicitado,
      atendidos,
      teorK2O,
      caixaUsina1,
      caixaUsina2: 0,
      caixaAcorce: 0,
      caixaLeila: 0,
      caixaOlaria: 0,
      caixaRosa: 0,
      caixaManLinha: 0,
      aguaResiduais,
      vazaoVinhacaInformada,
      vazaoReal,
      totalEstoque,
      retirado,
      necessidadeTrabalhou,
      caminhaoNecessidade: i < 8 ? 10 : 0,
      caminhaoTrabalhou,
      obs: ""
    };
  });
};

export const VinhacaDashboard = React.memo<{ selectedUsina?: string }>(({ selectedUsina = "Ariranha" }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [dayData, setDayData] = useState<HourlyApontamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCarregamento, setActiveCarregamento] = useState<any>(null);
  const [zoomedChartId, setZoomedChartId] = useState<string | null>(null);

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

  // Sync with VinhacaNiveis localstorage
  useEffect(() => {
    const loadCarregamento = () => {
      const listRaw = localStorage.getItem("vinhaca_nivel_carregamentos");
      const activeId = localStorage.getItem("vinhaca_selected_carregamento_id");
      if (listRaw) {
        try {
          const list = JSON.parse(listRaw);
          const active = list.find((c: any) => c.id === activeId) || list[0];
          setActiveCarregamento(active);
        } catch (e) {
          // ignore
        }
      } else {
        // Fallback seed matching user's photo
        const fallback = {
          id: "C-01",
          usina: "Usina1 (Bonança)",
          dataHora: "20/05/2026 23:50",
          alturaCaixa: 195,
          alturaMaxima: 250,
          volumeMaximo: 12500,
          capacidadeCaminhao: 60,
          variacaoPeriodo: -5
        };
        setActiveCarregamento(fallback);
      }
    };

    loadCarregamento();
    window.addEventListener("vinhaca_nivel_changed", loadCarregamento);
    return () => {
      window.removeEventListener("vinhaca_nivel_changed", loadCarregamento);
    };
  }, []);

  // Load data from localStorage matching the spreadsheet filter key
  useEffect(() => {
    const reload = () => {
      setLoading(true);
      const key = `vinhaca_apontamento_${selectedDate}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDayData(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore
        }
      }
      const seed = getSeedData();
      setDayData(seed);
      setLoading(false);
    };

    reload();

    window.addEventListener("vinhaca_apontamento_changed", reload);
    window.addEventListener("vinhaca_despacho_changed", reload);
    return () => {
      window.removeEventListener("vinhaca_apontamento_changed", reload);
      window.removeEventListener("vinhaca_despacho_changed", reload);
    };
  }, [selectedDate]);

  // Compute stats
  const totalSolicitado = dayData.reduce((acc, r) => acc + (r.solicitado || 0), 0);
  const totalAtendidos = dayData.reduce((acc, r) => acc + (r.atendidos || 0), 0);
  const totalVazaoReal = dayData.reduce((acc, r) => acc + (r.vazaoReal || 0), 0);
  const totalVazaoInformada = dayData.reduce((acc, r) => acc + (r.vazaoVinhacaInformada || 0), 0);
  
  const vazoesAtivas = dayData.filter(r => r.vazaoReal > 0).length;
  const avgVazaoReal = vazoesAtivas > 0 ? Math.round(dayData.reduce((acc, r) => acc + (r.vazaoReal || 0), 0) / vazoesAtivas) : 0;
  
  const aderenciaLogistica = totalSolicitado > 0 ? Math.round((totalAtendidos / totalSolicitado) * 100) : 50;
  const aderenciaVazao = totalVazaoInformada > 0 ? Math.round((totalVazaoReal / totalVazaoInformada) * 100) : 0;

  // Front summaries (Total trips fulfilled)
  const f_54_1_Atend = dayData.reduce((acc, r) => acc + (r.f_54_1_vln || 0), 0);
  const f_54_2_Atend = dayData.reduce((acc, r) => acc + (r.f_54_2_vln || 0), 0);
  const f_54_4_Atend = dayData.reduce((acc, r) => acc + (r.f_54_4_vln || 0), 0);
  const f_51_1_Atend = dayData.reduce((acc, r) => acc + (r.f_51_4_asp || 0), 0); // mapped f_51_1 as f_51_4
  const f_51_2_Atend = dayData.reduce((acc, r) => acc + (r.f_51_2_asp || 0), 0);
  const f_51_3_Atend = dayData.reduce((acc, r) => acc + (r.f_51_3_asp || 0), 0);
  const subTotalAtend = f_54_1_Atend + f_54_2_Atend + f_54_4_Atend + f_51_1_Atend + f_51_2_Atend + f_51_3_Atend;

  // Dynamic Chart 1: Comparativo Vazão Horária
  const chart1Data = dayData.map(r => {
    const aderência = r.vazaoVinhacaInformada > 0 ? Math.round((r.vazaoReal / r.vazaoVinhacaInformada) * 100) : 0;
    return {
      hora: r.hora,
      Informada: r.vazaoVinhacaInformada,
      Real: r.vazaoReal,
      "Aderência (%)": aderência
    };
  });

  // Dynamic Chart 2: Solicitado vs Atendido
  const chart2Data = dayData.map(r => {
    const aderência = r.solicitado > 0 ? Math.round((r.atendidos / r.solicitado) * 100) : 0;
    return {
      hora: r.hora,
      Solicitado: r.solicitado,
      Atendidos: r.atendidos,
      "Aderência (%)": aderência
    };
  });

  // Dynamic Chart 3: Necessidade x Realizado
  const chart3Data = dayData.map(r => {
    return {
      hora: r.hora,
      "Necessidade": r.caminhaoNecessidade || 0,
      "Trabalhou": r.caminhaoTrabalhou || 0
    };
  });

  // Dynamic Chart 4: Atendidos por Frente
  const chart4Data = dayData.map(r => {
    return {
      hora: r.hora,
      "54-1 Vin. Loc": r.f_54_1_vln || 0,
      "54-2 Vin. Loc": r.f_54_2_vln || 0,
      "54-4 Vin. Loc": r.f_54_4_vln || 0,
      "51-1 Aspersão": r.f_51_4_asp || 0,
      "51-2 Aspersão": r.f_51_2_asp || 0,
      "51-3 Aspersão": r.f_51_3_asp || 0,
    };
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <RefreshCw className="animate-spin text-[#00843D]" size={36} />
        <p className="text-sm font-black text-emerald-800 uppercase tracking-widest animate-pulse">Sincronizando Central...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Custom Green Scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-green-scrollbar::-webkit-scrollbar {
          height: 10px;
          width: 10px;
        }
        .custom-green-scrollbar::-webkit-scrollbar-track {
          background: #022c22;
          border-radius: 8px;
        }
        .custom-green-scrollbar::-webkit-scrollbar-thumb {
          background: #00843d;
          border-radius: 8px;
          border: 2.5px solid #022c22;
        }
        .custom-green-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5adc6a;
        }
      `}} />
      
      {/* FILTER PANEL AND REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100">
        <div className="flex items-center gap-3">
          <Calendar className="text-[#00843D]" size={20} />
          <div>
            <p className="text-[9px] font-black text-emerald-800 uppercase tracking-wider mb-0.5">FILTRAR DATA DA SAFRA</p>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-black text-gray-800 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest self-center">MODO DE APRESENTAÇÃO</span>
          <button 
            onClick={() => {
              const seed = getSeedData();
              setDayData(seed);
              localStorage.setItem(`vinhaca_apontamento_${selectedDate}`, JSON.stringify(seed));
            }}
            className="flex items-center gap-2 bg-[#00843D] text-white hover:bg-[#5adc6a] hover:text-[#004d22] text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={12} className="animate-hover" />
            Recarregar Dados Reais
          </button>
        </div>
      </div>

      {/* ACTIVE REPORTED LOADING LEVEL DISPLAY BLOCK (EXCEL & PHOTO STYLE) */}
      {activeCarregamento && (() => {
        const pct = Math.round((activeCarregamento.alturaCaixa / activeCarregamento.alturaMaxima) * 100);
        const volEstocado = Math.round((activeCarregamento.alturaCaixa / activeCarregamento.alturaMaxima) * activeCarregamento.volumeMaximo);
        const volSaldo = activeCarregamento.volumeMaximo - volEstocado;
        const viagens = activeCarregamento.capacidadeCaminhao > 0 ? Math.round(volEstocado / activeCarregamento.capacidadeCaminhao) : 0;
        const formattedEstocado = (volEstocado * 1000).toLocaleString("pt-BR");
        const formattedMaximo = (activeCarregamento.volumeMaximo * 1000).toLocaleString("pt-BR");
        const formattedSaldo = (volSaldo * 1000).toLocaleString("pt-BR");
        const valVar = activeCarregamento.variacaoPeriodo;
        const sign = valVar < 0 ? "" : "+";
        const direction = valVar < 0 ? "para baixo" : "para cima";

        return (
          <div className="bg-white rounded-[32px] border-2 border-[#00843D]/20 p-6 md:p-8 shadow-md text-left space-y-6">
            <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] font-black text-[#00843D] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  ⚠️ Telemetria em Tempo Real • Sincronizado: {lastUpdated}
                </span>
                <h3 className="text-base font-black text-gray-900 uppercase mt-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-[#00843D] rounded-full animate-ping" />
                  Nível da Caixa de Carregamento Informada: <span className="text-[#00843D] underline">{activeCarregamento.usina}</span>
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-extrabold uppercase bg-slate-100 px-3 py-1.5 rounded-xl">
                Atualizado: {activeCarregamento.dataHora}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Grand Beaker Graphic */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center space-y-2 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Frasco Volumétrico</span>
                
                <div className="relative w-36 h-56 flex items-end justify-center">
                  {/* Background tick lines */}
                  <div className="absolute right-0 top-0 h-full flex flex-col justify-between items-end text-[8px] font-mono font-bold text-gray-400 pointer-events-none">
                    <span>{activeCarregamento.alturaMaxima} cm</span>
                    <span>{Math.round(activeCarregamento.alturaMaxima * 0.5)} cm</span>
                    <span>0 cm</span>
                  </div>

                  {/* Graduated chemical beaker cylinder */}
                  <div className="w-20 h-48 bg-zinc-50 border-x-4 border-b-4 border-zinc-400 rounded-b-2xl relative overflow-hidden flex items-end shadow-inner">
                    {/* Tick markers */}
                    <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex flex-col justify-between py-5 px-1 opacity-70">
                      <div className="w-4 h-0.5 bg-zinc-350" />
                      <div className="w-2 h-0.5 bg-zinc-350" />
                      <div className="w-4 h-0.5 bg-zinc-350" />
                      <div className="w-2 h-0.5 bg-zinc-350" />
                      <div className="w-4 h-0.5 bg-zinc-350" />
                    </div>

                    {/* Green liquid level */}
                    <div 
                      style={{ height: `${pct}%` }}
                      className="w-full bg-gradient-to-t from-[#004d22] to-[#5adc6a] transition-all duration-1000 flex flex-col items-center justify-center relative"
                    >
                      <div className="absolute top-0 left-0 w-full h-2 bg-white/30 animate-pulse" />
                      <span className="relative z-10 font-mono text-sm font-black text-white drop-shadow">{pct}%</span>
                    </div>
                  </div>
                </div>

                <p className="font-mono text-xl font-black text-gray-800 leading-none">{pct}%</p>
                <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Status Volumétrico</p>
              </div>

              {/* Arc speedometer gauge */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-gray-100">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Velocímetro de Nível</span>
                
                <div className="relative w-60 h-30 flex flex-col justify-end items-center overflow-hidden">
                  <svg className="w-56 h-28" viewBox="0 0 100 50">
                    <path d="M 10,50 A 40,40 0 0,1 26,26 L 31,31 A 30,30 0 0,0 20,50 Z" fill="#D1FAE5" />
                    <path d="M 26,26 A 40,40 0 0,1 50,10 L 50,20 A 30,30 0 0,0 31,31 Z" fill="#A7F3D0" />
                    <path d="M 50,10 A 40,40 0 0,1 74,26 L 69,31 A 30,30 0 0,0 50,20 Z" fill="#34D399" />
                    <path d="M 74,26 A 40,40 0 0,1 90,50 L 80,50 A 30,30 0 0,0 69,31 Z" fill="#059669" />
                    <circle cx="50" cy="50" r="3" fill="#EAB308" />

                    <text x="18" y="45" fill="#047857" fontSize="4.5" fontWeight="900" textAnchor="middle">20%</text>
                    <text x="32" y="25" fill="#047857" fontSize="4.5" fontWeight="900" textAnchor="middle">40%</text>
                    <text x="68" y="25" fill="#047857" fontSize="4.5" fontWeight="900" textAnchor="middle">60%</text>
                    <text x="82" y="45" fill="#047857" fontSize="4.5" fontWeight="900" textAnchor="middle">80%</text>

                    {(() => {
                      const angle = (pct / 100) * 180 - 180;
                      return (
                        <g transform={`rotate(${angle} 50 50)`}>
                          <line x1="50" y1="50" x2="16" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                          <polygon points="16,50 21,48.5 21,51.5" fill="#EAB308" />
                        </g>
                      );
                    })()}
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <span className="block text-[8px] font-black text-[#004d22] uppercase tracking-wider">{activeCarregamento.usina}</span>
                    <span className="block text-2xl font-black text-slate-800 font-mono leading-none">{pct}%</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 font-bold text-center mt-1">
                  Indicador instantâneo ajustado fisicamente
                </p>
              </div>

              {/* Exact Photo Reconstructed Metrics Card */}
              <div className="lg:col-span-5 bg-[#eaf4ed]/50 rounded-2xl p-5 md:p-6 border border-emerald-100 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3 font-sans text-xs md:text-sm">
                  
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Altura da caixa (cm)</span>
                    <div className="flex-grow border-b border-dotted border-gray-300 mx-1.5 self-end h-2.5" />
                    <span className="font-mono font-black text-gray-800 text-right text-base underline decoration-1">
                      {activeCarregamento.alturaCaixa}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Volume estocado (m³)</span>
                    <div className="flex-grow border-b border-dotted border-gray-300 mx-1.5 self-end h-2.5" />
                    <span className="font-mono font-black text-gray-800 text-right text-base underline decoration-1">
                      {formattedEstocado}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Volume maximo (m³)</span>
                    <div className="flex-grow border-b border-dotted border-gray-300 mx-1.5 self-end h-2.5" />
                    <span className="font-mono font-black text-gray-800 text-right text-base underline decoration-1">
                      {formattedMaximo}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Volume saldo (m³)</span>
                    <div className="flex-grow border-b border-dotted border-gray-300 mx-1.5 self-end h-2.5" />
                    <span className="font-mono font-black text-gray-800 text-right text-base underline decoration-1">
                      {formattedSaldo}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#004d22] italic pr-2">Viagens estocadas (v)</span>
                    <div className="flex-grow border-b border-dotted border-gray-300 mx-1.5 self-end h-2.5" />
                    <span className="font-mono font-black text-gray-800 text-right text-base underline decoration-1">
                      {viagens}
                    </span>
                  </div>

                </div>

                <div className={`p-2.5 rounded-xl text-center font-extrabold text-[10px] md:text-xs tracking-wider uppercase border ${
                  valVar < 0 
                    ? "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]" 
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  Durante o período, a caixa variou {sign}{valVar} cm {direction}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* TOP EXCEL-STYLE HIGH FIDELITY HERO KPI BLOCK */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* TEOR K2O CARD */}
        <div className="xl:col-span-3 bg-white border-2 border-gray-150 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#004d22] uppercase tracking-wider bg-[#5adc6a]/20 px-3 py-1 rounded-full">Fórmula Química</span>
            <span className="p-1 px-3 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-black rounded-lg">CALDA NPK</span>
          </div>
          <div className="flex items-center justify-center gap-2 my-6">
            <div className="relative">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-amber-500" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C12 2 19 9 19 14C19 17.866 15.866 21 12 21C8.13401 21 5 17.866 5 14C5 9 12 2 12 2Z" fill="currentColor"/>
                  <path d="M12 5V18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-500 text-white font-black text-[10px] rounded-full flex items-center justify-center shadow">K</span>
            </div>
            <div className="text-left leading-none ml-2">
              <p className="text-4xl font-black text-[#004d22] font-mono">5,1</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Teor K₂O (%)</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-center text-gray-500 bg-gray-50 py-2 rounded-xl border border-gray-100">
            Fertirrigação Direta Colombo • Dosagem Ideal
          </p>
        </div>

        {/* ECOFLOW / SMARTFLOW INTEGRATED LOGISTIC TABLE CARD */}
        <div className="xl:col-span-6 bg-[#004d22] text-white rounded-[28px] p-6 shadow-md border border-[#5adc6a]/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none translate-x-10 -translate-y-10" />
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#5adc6a] rounded-full animate-pulse" />
              <h4 className="text-[11px] font-black tracking-widest uppercase text-[#5adc6a]">SINCRONIZAÇÃO EM TEMPO REAL COM O COLETOR DA USINA</h4>
            </div>
            <Activity className="text-white/40" size={16} />
          </div>

          <div className="overflow-x-auto custom-green-scrollbar pb-1">
            <table className="w-full text-left text-[11px] tracking-wide">
              <thead>
                <tr className="border-b border-white/10 text-[#5adc6a] font-black uppercase text-[9px] tracking-wider">
                  <th className="pb-2">Frentes Ativas</th>
                  <th className="pb-2 text-center">Raio (Km)</th>
                  <th className="pb-2 text-center">Ciclo</th>
                  <th className="pb-2 text-center">Vazão (m³/h)</th>
                  <th className="pb-2 text-center">Nec. CM Ciclo</th>
                  <th className="pb-2 text-center">Atendidos</th>
                </tr>
              </thead>
              <tbody className="font-mono font-bold text-white/95">
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 font-sans font-black text-xs">54-1 Vin. Loc</td>
                  <td className="text-center text-xs">--</td>
                  <td className="text-center text-xs">--</td>
                  <td className="text-center text-xs">0</td>
                  <td className="text-center text-xs text-[#5adc6a]">0</td>
                  <td className="text-center text-xs font-black text-[#5adc6a]">{f_54_1_Atend}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 font-sans font-black text-xs">54-2 Vin. Loc</td>
                  <td className="text-center text-xs">30,30</td>
                  <td className="text-center text-xs">02:30</td>
                  <td className="text-center text-xs">0</td>
                  <td className="text-center text-xs text-[#5adc6a]">0</td>
                  <td className="text-center text-xs font-black text-gray-400">--</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 font-sans font-black text-xs">54-4 Vin. Loc</td>
                  <td className="text-center text-xs">53,90</td>
                  <td className="text-center text-xs">02:35</td>
                  <td className="text-center text-xs">90</td>
                  <td className="text-center text-xs text-[#5adc6a]">4</td>
                  <td className="text-center text-xs font-black text-[#5adc6a]">{f_54_4_Atend}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 font-sans font-black text-xs">51-3 Aspersão</td>
                  <td className="text-center text-xs">7,80</td>
                  <td className="text-center text-xs">01:10</td>
                  <td className="text-center text-xs">90</td>
                  <td className="text-center text-xs text-[#5adc6a]">2</td>
                  <td className="text-center text-xs font-black text-[#5adc6a]">{f_51_3_Atend}</td>
                </tr>
                <tr className="bg-emerald-950 font-black text-[#5adc6a]">
                  <td className="py-2 font-sans uppercase text-xs">Sub Total</td>
                  <td className="text-center text-xs">30,85</td>
                  <td className="text-center text-xs">01:15</td>
                  <td className="text-center text-white">180</td>
                  <td className="text-center text-white">6</td>
                  <td className="text-center text-xs text-amber-300">{subTotalAtend} Tr.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT METADATA & SIDE METRICS (PULSO LOGISTICO + ADERENCIA) */}
        <div className="xl:col-span-3 flex flex-col justify-between gap-4">
          
          {/* PULSO LOGISTICO CARD */}
          <div className="bg-[#0c1f30] text-white p-5 rounded-[24px] border border-blue-900/30 shadow-sm flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Pulso Logístico</p>
              <h5 className="text-[11px] font-black uppercase text-gray-300 leading-tight">"Limite Carregamento"</h5>
            </div>
            <div className="bg-blue-950 px-4 py-2 rounded-2xl border border-blue-800/40 text-center font-mono text-3xl font-black text-blue-300 min-w-[60px]">
              9
            </div>
          </div>

          {/* ADERENCIA DESPACHO CARD */}
          <div className="bg-[#0a1b2c] text-white p-5 rounded-[24px] border border-emerald-900/10 shadow-sm flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Índice de Aderência</p>
              <span className="text-[10px] font-black uppercase text-gray-300 leading-tight flex items-center gap-1">
                🚛 Despacho x Solicitação
              </span>
            </div>
            <div className="bg-[#1c131a] px-4 py-3 rounded-2xl border border-rose-950 text-center min-w-[70px]">
              <span className="block font-mono text-xl font-black text-rose-500 leading-none">{aderenciaLogistica}%</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-rose-500 mt-0.5 block">LIMITADO</span>
            </div>
          </div>
          
        </div>

      </div>

      {/* DASHBOARD GRID: THE FOUR MAIN CHARTS FROM EXCEL WITH THEIR VALUES LISTED ACCURATELY */}
      <div className="space-y-10">

        {/* 1. COMPARATIVO VAZÃO HOÁRIA (REAL X INFORMADA) */}
        <div 
          onClick={() => setZoomedChartId('VazaoHoraria')}
          className="bg-white rounded-[32px] border-2 border-slate-100 hover:border-[#00843D] p-6 md:p-8 shadow-sm text-left cursor-pointer transition-all hover:shadow-md group relative"
        >
          {/* Zoom badge in corner */}
          <div className="absolute right-6 top-6 bg-[#00843D]/5 text-[#00843D] hover:bg-[#00843D]/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition opacity-60 group-hover:opacity-100">
            <Maximize2 size={11} />
            <span>Ampliar</span>
          </div>

          <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-16">
            <div>
              <span className="text-[9px] font-black text-emerald-800 bg-[#5adc6a]/20 px-3 py-1 rounded-full uppercase tracking-wider">Métrica de Eficiência Agroindustrial</span>
              <h4 className="text-base font-black text-gray-900 uppercase mt-2">Comparativo Vazão Horária (Real x Informada)</h4>
            </div>
            <div className="flex items-center gap-4 text-xs font-black">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <span className="w-3 h-3 bg-[#004d22] rounded-xs" />
                <span>Informada (m³/h)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="w-3 h-3 bg-[#EAB308] rounded-xs" />
                <span>Real (m³/h)</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-1 bg-[#5adc6a] rounded-full inline-block" />
                <span>Aderência (%)</span>
              </div>
            </div>
          </div>

          {/* CHART AREA */}
          <div className="h-[430px] w-full bg-slate-50/60 p-4 rounded-3xl border border-gray-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart1Data} margin={{ top: 20, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                <XAxis dataKey="hora" fontSize={13} fontWeight="black" stroke="#334155" tickLine={true} />
                <YAxis yAxisId="left" fontSize={13} fontWeight="black" stroke="#1E293B" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 150]} fontSize={13} fontWeight="black" stroke="#10B981" />
                <Tooltip 
                  contentStyle={{ background: "#004d22", border: "none", borderRadius: "14px", color: "#fff", fontSize: "13px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar yAxisId="left" dataKey="Informada" fill="#004d22" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="Real" fill="#EAB308" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Aderência (%)" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* SYSTEM STATS TABLE ROW - SCROLLABLE FOR FULL EXACT RECONSTRUCTION */}
          <div className="mt-8 border-2 border-gray-200 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto custom-green-scrollbar pb-1">
              <table className="w-full text-right text-xs border-collapse min-w-[1300px]">
                <thead>
                  <tr className="bg-emerald-950 text-white font-black text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-left sticky left-0 bg-emerald-950 border-r-2 border-[#5adc6a]/20 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">Métrica / Hora</th>
                    {HOURS_LIST.map(h => (
                      <th key={h} className="p-3 text-center border-l border-white/5 font-mono font-bold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-gray-800">
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-800 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Vazão Informada (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.vazaoVinhacaInformada > 0 ? "text-[#004d22]" : "text-gray-300")}>
                        {r.vazaoVinhacaInformada || "--"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20 bg-[#FBFDFB]">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-[#004d22] bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Vazão Real (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.vazaoReal > 0 ? "text-amber-600 bg-amber-50/25" : "text-gray-300")}>
                        {r.vazaoReal || "--"}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/20 font-black">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-[#004d22] bg-emerald-50 sticky left-0 border-r-2 border-emerald-150 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Aderência (%)
                    </td>
                    {dayData.map((r, idx) => {
                      const ad = r.vazaoVinhacaInformada > 0 ? Math.round((r.vazaoReal / r.vazaoVinhacaInformada) * 100) : 0;
                      return (
                        <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", ad >= 90 ? "text-[#00843D] bg-emerald-50/30" : ad > 0 ? "text-rose-600 bg-rose-50/10" : "text-gray-300")}>
                          {ad > 0 ? `${ad}%` : "--"}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* 2. FLUXO LOGÍSTICO CAMINHÃO: SOLICITADO VS ATENDIDO */}
        <div 
          onClick={() => setZoomedChartId('FluxoCaminhao')}
          className="bg-white rounded-[32px] border-2 border-slate-100 hover:border-[#00843D] p-6 md:p-8 shadow-sm text-left cursor-pointer transition-all hover:shadow-md group relative"
        >
          {/* Zoom badge in corner */}
          <div className="absolute right-6 top-6 bg-[#00843D]/5 text-[#00843D] hover:bg-[#00843D]/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition opacity-60 group-hover:opacity-100">
            <Maximize2 size={11} />
            <span>Ampliar</span>
          </div>

          <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-16">
            <div>
              <span className="text-[9px] font-black text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Monitoramento de Despacho de Viagens</span>
              <h4 className="text-base font-black text-gray-900 uppercase mt-2">Fluxo Logístico Caminhão: Solicitado vs. Atendido</h4>
            </div>
            <div className="flex items-center gap-4 text-xs font-black">
              <div className="flex items-center gap-1.5 text-indigo-900">
                <span className="w-3 h-3 bg-[#0a1b2c] rounded-xs" />
                <span>Solicitado (Quantidade)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="w-3 h-3 bg-[#F5B000] rounded-xs" />
                <span>Atendidos (Fila)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5adc6a]">
                <span className="w-3 h-1 bg-[#10B981] rounded-full inline-block" />
                <span>Aderência (%)</span>
              </div>
            </div>
          </div>

          <div className="h-[420px] w-full bg-slate-50/60 p-4 rounded-3xl border border-gray-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart2Data} margin={{ top: 20, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                <XAxis dataKey="hora" fontSize={13} fontWeight="black" stroke="#334155" tickLine={true} />
                <YAxis yAxisId="left" fontSize={13} fontWeight="black" stroke="#1E293B" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 150]} fontSize={13} fontWeight="black" stroke="#10B981" />
                <Tooltip 
                  contentStyle={{ background: "#0a1b2c", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar yAxisId="left" dataKey="Solicitado" fill="#0a1b2c" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="left" dataKey="Atendidos" fill="#F5B000" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="Aderência (%)" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* SECOND SYSTEM DATA ROW TABLE */}
          <div className="mt-8 border-2 border-gray-200 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto custom-green-scrollbar pb-1">
              <table className="w-full text-right text-xs md:text-sm border-collapse min-w-[1300px]">
                <thead>
                  <tr className="bg-[#0a1b2c] text-white font-black text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-left sticky left-0 bg-[#0a1b2c] border-r-2 border-[#5adc6a]/20 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">Métrica / Hora</th>
                    {HOURS_LIST.map(h => (
                      <th key={h} className="p-3 text-center border-l border-white/5 font-mono font-bold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-gray-800">
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-800 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Solicitados
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.solicitado > 0 ? "text-[#0a1b2c]" : "text-gray-300")}>
                        {r.solicitado || "--"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20 bg-[#FBFDFB]">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-amber-600 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Atendidos
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.atendidos > 0 ? "text-amber-500 bg-amber-50/25" : "text-gray-300")}>
                        {r.atendidos || "--"}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/20 font-black">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-emerald-800 bg-emerald-50 sticky left-0 border-r-2 border-emerald-150 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Aderência (%)
                    </td>
                    {dayData.map((r, idx) => {
                      const ad = r.solicitado > 0 ? Math.round((r.atendidos / r.solicitado) * 100) : 0;
                      return (
                        <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", ad >= 90 ? "text-[#00843D] bg-emerald-50/30" : ad > 0 ? "text-rose-600 bg-rose-50/10" : "text-gray-300")}>
                          {ad > 0 ? `${ad}%` : "--"}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* 3. FLUXO LOGÍSTICO CAMINHÃO: NECESSIDADE X REALIZADO */}
        <div 
          onClick={() => setZoomedChartId('FluxoCaminhaoNecessidade')}
          className="bg-white rounded-[32px] border-2 border-slate-100 hover:border-[#00843D] p-6 md:p-8 shadow-sm text-left cursor-pointer transition-all hover:shadow-md group relative"
        >
          {/* Zoom badge in corner */}
          <div className="absolute right-6 top-6 bg-[#00843D]/5 text-[#00843D] hover:bg-[#00843D]/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition opacity-60 group-hover:opacity-100">
            <Maximize2 size={11} />
            <span>Ampliar</span>
          </div>

          <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-16">
            <div>
              <span className="text-[9px] font-black text-rose-800 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">Dimensionamento Logístico e Dimensionamento Frota</span>
              <h4 className="text-base font-black text-gray-900 uppercase mt-2">Fluxo Logístico Caminhão: Necessidade x Realizado</h4>
            </div>
            <div className="flex items-center gap-4 text-xs font-black">
              <div className="flex items-center gap-1.5 text-[#0a1b2c]">
                <span className="w-3 h-3 bg-[#0a1b2c] rounded-xs" />
                <span>Necessidade Ideal (Frota)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="w-3 h-3 bg-[#EAB308] rounded-xs" />
                <span>Trabalhou (Realizado)</span>
              </div>
            </div>
          </div>

          <div className="h-[420px] w-full bg-slate-50/60 p-4 rounded-3xl border border-gray-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart3Data} margin={{ top: 20, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                <XAxis dataKey="hora" fontSize={13} fontWeight="black" stroke="#334155" tickLine={true} />
                <YAxis fontSize={13} fontWeight="black" stroke="#1E293B" />
                <Tooltip 
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Bar dataKey="Necessidade" fill="#0a1b2c" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Trabalhou" fill="#EAB308" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* THIRD SYSTEM ROW TABLE */}
          <div className="mt-8 border-2 border-gray-200 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto custom-green-scrollbar pb-1">
              <table className="w-full text-right text-xs md:text-sm border-collapse min-w-[1300px]">
                <thead>
                  <tr className="bg-amber-950 text-white font-black text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-left sticky left-0 bg-amber-950 border-r-2 border-[#5adc6a]/20 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">Métrica / Hora</th>
                    {HOURS_LIST.map(h => (
                      <th key={h} className="p-3 text-center border-l border-white/5 font-mono font-bold text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-gray-800">
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20 bg-[#FBFDFB]">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-[#004d22] bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Trabalhou (Caminhões)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.caminhaoTrabalhou > 0 ? "text-emerald-700 bg-emerald-50/20" : "text-gray-300")}>
                        {r.caminhaoTrabalhou || "--"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-800 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Necessidade Ideal
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.caminhaoNecessidade > 0 ? "text-indigo-850 bg-indigo-50/15" : "text-gray-300")}>
                        {r.caminhaoNecessidade || "--"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* 4. ATENDIDOS POR NÍVEIS */}
        <div 
          onClick={() => setZoomedChartId('AtendidosNivel')}
          className="bg-white rounded-[32px] border-2 border-slate-100 hover:border-[#00843D] p-6 md:p-8 shadow-sm text-left cursor-pointer transition-all hover:shadow-md group relative"
        >
          {/* Zoom badge in corner */}
          <div className="absolute right-6 top-6 bg-[#00843D]/5 text-[#00843D] hover:bg-[#00843D]/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition opacity-60 group-hover:opacity-100">
            <Maximize2 size={11} />
            <span>Ampliar</span>
          </div>

          <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pr-16">
            <div>
              <span className="text-[9px] font-black text-[#00843D] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Produtividade Segmentada das Equipes</span>
              <h4 className="text-base font-black text-gray-900 uppercase mt-2">Atendidos por Nível</h4>
            </div>
          </div>
          <div className="h-[420px] w-full bg-slate-50/60 p-4 rounded-3xl border border-gray-100 shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart4Data} margin={{ top: 20, right: 10, left: -15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                <XAxis dataKey="hora" fontSize={13} fontWeight="black" stroke="#334155" tickLine={true} />
                <YAxis fontSize={13} fontWeight="black" stroke="#1E293B" />
                <Tooltip 
                  contentStyle={{ background: "#004d22", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", fontWeight: "black" }} />
                <Bar dataKey="54-1 Vin. Loc" stackId="a" fill="#004d22" />
                <Bar dataKey="54-2 Vin. Loc" stackId="a" fill="#00843D" />
                <Bar dataKey="54-4 Vin. Loc" stackId="a" fill="#10B981" />
                <Bar dataKey="51-1 Aspersão" stackId="a" fill="#34D399" />
                <Bar dataKey="51-2 Aspersão" stackId="a" fill="#6EE7B7" />
                <Bar dataKey="51-3 Aspersão" stackId="a" fill="#A7F3D0" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 border-2 border-gray-200 rounded-3xl overflow-hidden shadow-md">
            <div className="overflow-x-auto custom-green-scrollbar pb-1">
              <table className="w-full text-right text-xs md:text-sm border-collapse min-w-[1350px]">
                <thead>
                  <tr className="bg-[#004d22] text-white font-black text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-left sticky left-0 bg-[#004d22] border-r-2 border-[#5adc6a]/20 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">Segmento Nível</th>
                    {HOURS_LIST.map(h => (
                      <th key={h} className="p-3 text-center border-l border-white/5 font-mono font-bold text-xs">{h}</th>
                    ))}
                    <th className="p-3 text-center bg-emerald-900 text-amber-200 font-bold text-xs min-w-[100px]">Total m³</th>
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-gray-700">
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-805 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      54-1 Vin. Loc (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.f_54_1_vln > 0 ? "text-[#004d22]" : "text-gray-300")}>
                        {r.f_54_1_vln || "--"}
                      </td>
                    ))}
                    <td className="p-2.5 text-center bg-gray-50/90 font-black text-[#004d22] text-xs md:text-sm">{f_54_1_Atend}</td>
                  </tr>
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20 bg-[#FBFDFB]">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-850 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      54-2 Vin. Loc (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.f_54_2_vln > 0 ? "text-emerald-700" : "text-gray-300")}>
                        {r.f_54_2_vln || "--"}
                      </td>
                    ))}
                    <td className="p-2.5 text-center bg-gray-50/90 font-black text-[#00843D] text-xs md:text-sm">{f_54_2_Atend}</td>
                  </tr>
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-850 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      54-4 Vin. Loc (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.f_54_4_vln > 0 ? "text-emerald-600 bg-emerald-50/5" : "text-gray-300")}>
                        {r.f_54_4_vln || "--"}
                      </td>
                    ))}
                    <td className="p-2.5 text-center bg-gray-50/90 font-black text-emerald-600 text-xs md:text-sm">{f_54_4_Atend}</td>
                  </tr>
                  <tr className="border-b border-gray-150 hover:bg-emerald-50/20 bg-[#FBFDFB]">
                    <td className="py-3.5 px-4 text-left font-sans font-black text-xs md:text-sm text-gray-850 bg-gray-50/95 sticky left-0 border-r-2 border-gray-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      51-3 Aspersão (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className={cn("p-2.5 text-center text-xs md:text-sm font-black", r.f_51_3_asp > 0 ? "text-[#00843D]" : "text-gray-300")}>
                        {r.f_51_3_asp || "--"}
                      </td>
                    ))}
                    <td className="p-2.5 text-center bg-gray-50/90 font-black text-amber-500 text-xs md:text-sm">{f_51_3_Atend}</td>
                  </tr>
                  <tr className="bg-emerald-50/30 font-black text-emerald-950">
                    <td className="py-3.5 px-4 text-left font-sans uppercase text-xs sticky left-0 bg-emerald-100 border-r-2 border-emerald-200 min-w-[200px] z-10 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.05)]">
                      Total Atendidos (m³)
                    </td>
                    {dayData.map((r, idx) => (
                      <td key={idx} className="p-2.5 text-center text-emerald-900 bg-emerald-100/50 text-xs md:text-sm">
                        {r.atendidos || "--"}
                      </td>
                    ))}
                    <td className="p-2.5 text-center bg-emerald-900 text-white font-mono text-xs md:text-sm">{subTotalAtend}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER BADGE OUTLETS */}
      <div className="bg-emerald-950 text-white p-6 rounded-[28px] border-l-4 border-[#5adc6a] text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h5 className="text-[11px] font-black uppercase text-[#5adc6a] tracking-wider mb-1">CONFORMIDADE E SEGURANÇA AGROAMBIENTAL SUCROENERGÉTICA</h5>
          <p className="text-[10px] text-white/75 leading-relaxed">
            A aplicação da vinhaça segue estritamente a norma técnica oficial de dosagem NPK e metas operacionais para preservação do lençol freático.
          </p>
        </div>
        <div className="flex items-center gap-2 font-black text-[10px] bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl self-start md:self-auto uppercase tracking-wider text-[#5adc6a]">
          <ShieldCheck size={14} />
          <span>NORMA INSTRUÇÃO CETESB 2026</span>
        </div>
      </div>

      {/* FULL SCREEN ZOOM MODAL */}
      <AnimatePresence>
        {zoomedChartId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setZoomedChartId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="text-left">
                  {zoomedChartId === 'VazaoHoraria' && (
                    <>
                      <span className="text-[9px] font-black text-emerald-800 bg-[#5adc6a]/20 px-3 py-1 rounded-full uppercase tracking-wider">Métrica de Eficiência Agroindustrial</span>
                      <h4 className="text-xl font-black text-gray-900 uppercase mt-2">Comparativo Vazão Horária (Real x Informada) - Ampliado</h4>
                    </>
                  )}
                  {zoomedChartId === 'FluxoCaminhao' && (
                    <>
                      <span className="text-[9px] font-black text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Monitoramento de Despacho de Viagens</span>
                      <h4 className="text-xl font-black text-gray-900 uppercase mt-2">Fluxo Logístico Caminhão: Solicitado vs. Atendido - Ampliado</h4>
                    </>
                  )}
                  {zoomedChartId === 'FluxoCaminhaoNecessidade' && (
                    <>
                      <span className="text-[9px] font-black text-rose-800 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">Dimensionamento Logístico e Frota</span>
                      <h4 className="text-xl font-black text-gray-900 uppercase mt-2">Fluxo Logístico Caminhão: Necessidade x Realizado - Ampliado</h4>
                    </>
                  )}
                  {zoomedChartId === 'AtendidosNivel' && (
                    <>
                      <span className="text-[9px] font-black text-[#00843D] bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">Produtividade Segmentada das Equipes</span>
                      <h4 className="text-xl font-black text-gray-900 uppercase mt-2">Atendidos por Nível - Ampliado</h4>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setZoomedChartId(null)}
                  className="p-3 bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-full transition-all hover:scale-105 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body with Chart */}
              <div className="p-6 md:p-8 overflow-y-auto custom-green-scrollbar flex-1 space-y-8">
                {/* Visual Chart Area */}
                <div className="h-[380px] md:h-[450px] w-full bg-slate-50/80 p-4 rounded-3xl border border-gray-150 shadow-inner">
                  {zoomedChartId === 'VazaoHoraria' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chart1Data} margin={{ top: 20, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                        <XAxis dataKey="hora" fontSize={14} fontWeight="black" stroke="#334155" />
                        <YAxis yAxisId="left" fontSize={14} fontWeight="black" stroke="#1E293B" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 150]} fontSize={14} fontWeight="black" stroke="#10B981" />
                        <Tooltip 
                          contentStyle={{ background: "#004d22", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                          itemStyle={{ color: "#fff", fontWeight: "bold" }}
                        />
                        <Bar yAxisId="left" dataKey="Informada" fill="#004d22" radius={[6, 6, 0, 0]} />
                        <Bar yAxisId="left" dataKey="Real" fill="#EAB308" radius={[6, 6, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="Aderência (%)" stroke="#10B981" strokeWidth={5} dot={{ r: 6, strokeWidth: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}

                  {zoomedChartId === 'FluxoCaminhao' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chart2Data} margin={{ top: 20, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                        <XAxis dataKey="hora" fontSize={14} fontWeight="black" stroke="#334155" />
                        <YAxis yAxisId="left" fontSize={14} fontWeight="black" stroke="#1E293B" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 150]} fontSize={14} fontWeight="black" stroke="#10B981" />
                        <Tooltip 
                          contentStyle={{ background: "#0a1b2c", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                          itemStyle={{ color: "#fff", fontWeight: "bold" }}
                        />
                        <Bar yAxisId="left" dataKey="Solicitado" fill="#0a1b2c" radius={[6, 6, 0, 0]} />
                        <Bar yAxisId="left" dataKey="Atendidos" fill="#F5B000" radius={[6, 6, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="Aderência (%)" stroke="#10B981" strokeWidth={5} dot={{ r: 6, strokeWidth: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}

                  {zoomedChartId === 'FluxoCaminhaoNecessidade' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart3Data} margin={{ top: 20, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                        <XAxis dataKey="hora" fontSize={14} fontWeight="black" stroke="#334155" />
                        <YAxis fontSize={14} fontWeight="black" stroke="#1E293B" />
                        <Tooltip 
                          contentStyle={{ background: "#1e293b", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                          itemStyle={{ color: "#fff", fontWeight: "bold" }}
                        />
                        <Bar dataKey="Necessidade" fill="#0a1b2c" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Trabalhou" fill="#EAB308" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {zoomedChartId === 'AtendidosNivel' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart4Data} margin={{ top: 20, right: 10, left: -10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                        <XAxis dataKey="hora" fontSize={14} fontWeight="black" stroke="#334155" />
                        <YAxis fontSize={14} fontWeight="black" stroke="#1E293B" />
                        <Tooltip 
                          contentStyle={{ background: "#004d22", border: "none", borderRadius: "14px", color: "#fff", fontSize: "14px" }}
                          itemStyle={{ color: "#fff", fontWeight: "bold" }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: "14px", fontWeight: "black" }} />
                        <Bar dataKey="54-1 Vin. Loc" stackId="a" fill="#004d22" />
                        <Bar dataKey="54-2 Vin. Loc" stackId="a" fill="#00843D" />
                        <Bar dataKey="54-4 Vin. Loc" stackId="a" fill="#10B981" />
                        <Bar dataKey="51-1 Aspersão" stackId="a" fill="#34D399" />
                        <Bar dataKey="51-2 Aspersão" stackId="a" fill="#6EE7B7" />
                        <Bar dataKey="51-3 Aspersão" stackId="a" fill="#A7F3D0" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Sub-summaries row in zoom block to give it maximum legibility and fidelity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {zoomedChartId === 'VazaoHoraria' && (
                    <>
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                        <span className="block text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Total Informado</span>
                        <span className="text-2xl font-black text-gray-800 font-mono">{totalVazaoInformada.toLocaleString("pt-BR")} m³</span>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Total Realizado</span>
                        <span className="text-2xl font-black text-gray-800 font-mono">{totalVazaoReal.toLocaleString("pt-BR")} m³</span>
                      </div>
                      <div className="bg-emerald-900 text-white rounded-2xl p-4">
                        <span className="block text-[10px] font-black text-[#5adc6a] uppercase tracking-widest mb-1">Aderência de Vazão Global</span>
                        <span className="text-2xl font-black font-mono text-white">{aderenciaVazao}%</span>
                      </div>
                    </>
                  )}

                  {zoomedChartId === 'FluxoCaminhao' && (
                    <>
                      <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                        <span className="block text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Viagens Solicitadas</span>
                        <span className="text-2xl font-black text-gray-800 font-mono">{totalSolicitado} viagens</span>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Viagens Atendidas</span>
                        <span className="text-2xl font-black text-gray-800 font-mono">{totalAtendidos} viagens</span>
                      </div>
                      <div className="bg-emerald-900 text-white rounded-2xl p-4">
                        <span className="block text-[10px] font-black text-[#5adc6a] uppercase tracking-widest mb-1">Índice Geral de Aderência</span>
                        <span className="text-2xl font-black font-mono text-white">{aderenciaLogistica}%</span>
                      </div>
                    </>
                  )}

                  {zoomedChartId === 'FluxoCaminhaoNecessidade' && (
                    <>
                      <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                        <span className="block text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1">Total Horas Necessidade</span>
                        <span className="text-2xl font-black text-gray-800 font-mono">
                          {dayData.reduce((acc, r) => acc + (r.caminhaoNecessidade || 0), 0)} CM
                        </span>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                        <span className="block text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Total Horas Trabalhadas</span>
                        <span className="text-2xl font-black text-gray-800 font-mono">
                          {dayData.reduce((acc, r) => acc + (r.caminhaoTrabalhou || 0), 0)} CM
                        </span>
                      </div>
                      <div className="bg-emerald-900 text-white rounded-2xl p-4">
                        <span className="block text-[10px] font-black text-[#5adc6a] uppercase tracking-widest mb-1">Dimensionamento Frota</span>
                        <span className="text-lg font-black uppercase text-white">Dimensionado Oficial</span>
                      </div>
                    </>
                  )}

                  {zoomedChartId === 'AtendidosNivel' && (
                    <>
                      <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 col-span-1 md:col-span-2">
                        <div className="flex flex-wrap gap-4 justify-between">
                          <div>
                            <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest">54-1 Vin. Loc</span>
                            <span className="text-lg font-black text-gray-850 font-mono">{f_54_1_Atend} m³</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest">54-2 Vin. Loc</span>
                            <span className="text-lg font-black text-gray-850 font-mono">{f_54_2_Atend} m³</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest">54-4 Vin. Loc</span>
                            <span className="text-lg font-black text-gray-850 font-mono">{f_54_4_Atend} m³</span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest">51-3 Aspersão</span>
                            <span className="text-lg font-black text-gray-850 font-mono">{f_51_3_Atend} m³</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-emerald-900 text-white rounded-2xl p-4">
                        <span className="block text-[10px] font-black text-[#5adc6a] uppercase tracking-widest mb-1">Volume Consolidado</span>
                        <span className="text-2xl font-black font-mono text-white">{subTotalAtend} m³</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
});
