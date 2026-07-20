import React, { useState, useEffect } from "react";
import { 
  Clock, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  FileSpreadsheet, 
  TrendingUp, 
  Droplet, 
  Activity, 
  Truck, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  AlertCircle, 
  Sliders, 
  Calendar,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  Search,
  BookOpen
} from "lucide-react";

// Individual Hourly Sheet Row schema
interface HourlyApontamento {
  hora: string;
  // Frentes (despachos de caminhões)
  f_54_4_vln: number;
  f_54_2_vln: number;
  f_54_1_vln: number;
  f_51_4_asp: number;
  f_51_2_asp: number;
  f_51_3_asp: number;
  
  // Atendidos
  solicitado: number;
  atendidos: number; // auto sum of frentes
  
  // Teor
  teorK2O: number;
  
  // Caixas (cm)
  caixaUsina1: number;
  caixaUsina2: number;
  caixaAcorce: number;
  caixaLeila: number;
  caixaOlaria: number;
  caixaRosa: number;
  caixaManLinha: number;
  
  // Vazões
  aguaResiduais: number;
  vazaoVinhacaInformada: number;
  vazaoReal: number;
  
  // Estoque
  totalEstoque: number;
  retirado: number;
  
  // Necessidades
  necessidadeTrabalhou: number; // Trabalhou
  
  // Caminhão
  caminhaoNecessidade: number;
  caminhaoTrabalhou: number;
  
  // Obs
  obs: string;
}

const HOURS_LIST = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

// Seed dummy data matching user's Excel photos perfectly
const createInitialDayData = (): HourlyApontamento[] => {
  return HOURS_LIST.map((h, i) => {
    // Seed realistic mock data from the Excel screenshots
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

    // Apply specific matches from the photos depending on the hour
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
    } else {
      // General mock data for the rest of hours
      f_54_4_vln = Math.random() > 0.4 ? 1 : 0;
      f_51_3_asp = Math.random() > 0.4 ? 2 : 0;
      solicitado = 8;
      caixaUsina1 = 180 - (i % 5)*5;
      vazaoVinhacaInformada = 260 + (i % 4)*10;
      vazaoReal = vazaoVinhacaInformada + (Math.random() > 0.5 ? 20 : -20);
      retirado = Math.round(vazaoReal * 1.1);
    }

    const atendidos = f_54_4_vln + 0 + f_54_1_vln + 0 + 0 + f_51_3_asp; // initial sum

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
      caminhaoNecessidade,
      caminhaoTrabalhou,
      obs: i < 3 ? "Operação de fertirrigação sem paradas técnicas." : ""
    };
  });
};

export const VinhacaApontamentos: React.FC = () => {
  // Persistence key based on date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [activeSheetTab, setActiveSheetTab] = useState<"frentes" | "caixas" | "vazoes" | "necessidades">("frentes");
  const [selectedHour, setSelectedHour] = useState<string>("08:00");
  const [dayData, setDayData] = useState<HourlyApontamento[]>(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `vinhaca_apontamento_${todayStr}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    const generated = createInitialDayData();
    localStorage.setItem(key, JSON.stringify(generated));
    return generated;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Load data from localStorage or create new mock data
  useEffect(() => {
    const key = `vinhaca_apontamento_${selectedDate}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDayData(parsed);
          return;
        }
      } catch (e) {
        // ignore
      }
    }
    const generated = createInitialDayData();
    setDayData(generated);
    localStorage.setItem(key, JSON.stringify(generated));
  }, [selectedDate]);

  // Handle local state updates + persist
  const updateHourField = (hora: string, field: keyof HourlyApontamento, val: any) => {
    const updated = dayData.map(row => {
      if (row.hora === hora) {
        const updatedRow = { ...row, [field]: val };
        // Recalculate automatic sum fields inside the row!
        updatedRow.atendidos = 
          Number(updatedRow.f_54_4_vln) + 
          Number(updatedRow.f_54_2_vln) + 
          Number(updatedRow.f_54_1_vln) + 
          Number(updatedRow.f_51_4_asp) + 
          Number(updatedRow.f_51_2_asp) + 
          Number(updatedRow.f_51_3_asp);
        return updatedRow;
      }
      return row;
    });
    setDayData(updated);
    const key = `vinhaca_apontamento_${selectedDate}`;
    localStorage.setItem(key, JSON.stringify(updated));
  };

  // Quick Action: Autofill / Copy previous values or reset
  const handleResetDayData = () => {
    if (confirm("Deseja realmente redefinir todos os apontamentos desta data?")) {
      const reseted = createInitialDayData();
      setDayData(reseted);
      localStorage.setItem(`vinhaca_apontamento_${selectedDate}`, JSON.stringify(reseted));
      showToast("Dados redefinidos com sucesso para a safra atual!");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find the selected hour row to feed into the form
  const focusedRow = dayData.find(r => r.hora === selectedHour) || dayData[8] || dayData[0];

  // Global calculations for KPIs
  const kpis = React.useMemo(() => {
    if (dayData.length === 0) return { totalAtendidos: 0, totalSolicitado: 0, aderenciaGeral: 0, mediaVazaoReal: 0, totalCmhAtividades: 0 };
    
    let totalAtendidos = 0;
    let totalSolicitado = 0;
    let sumVazaoReal = 0;
    let numActiveVazao = 0;

    dayData.forEach(row => {
      totalAtendidos += row.atendidos;
      totalSolicitado += row.solicitado;
      if (row.vazaoReal > 0) {
        sumVazaoReal += row.vazaoReal;
        numActiveVazao++;
      }
    });

    const mediaVazaoReal = numActiveVazao > 0 ? Math.round(sumVazaoReal / numActiveVazao) : 0;
    const mediaVazaoInformada = numActiveVazao > 0 ? Math.round(dayData.reduce((acc, r) => acc + r.vazaoVinhacaInformada, 0) / dayData.length) : 0;
    const aderenciaGeral = totalSolicitado > 0 ? Math.round((totalAtendidos / totalSolicitado) * 100) : 0;

    return {
      totalAtendidos,
      totalSolicitado,
      aderenciaGeral,
      mediaVazaoReal,
      vazaoAderencia: mediaVazaoInformada > 0 ? Math.round((mediaVazaoReal / mediaVazaoInformada) * 100) : 0
    };
  }, [dayData]);

  // Export to Excel-simulated CSV
  const handleExportCSV = () => {
    if (dayData.length === 0) return;
    
    // Create Excel Headers mirroring formatting
    const headers = [
      "Hora;54-4 Vln;54-2 Vln;54-1 Vln;51-4 Asp;51-2 Asp;51-3 Asp;Solicitado;Atendidos;Aderência;Teor K2O;Usina 1 (cm);Usina 2 (cm);Acorce (cm);Leila (cm);Olaria (cm);Rosa (cm);Man. Linha (cm);Mts Ponderada;Agua Residuais;Vazao Informada;Vazao Real;Aderência Vazao;Total Estoque;Retirado;Status Ganho/Perda;Necessidades Trabalhou;Caminhao Necessidade;Caminhao Trabalhou;Observacoes"
    ];

    const rows = dayData.map(r => {
      const aderenciaAtend = r.solicitado > 0 ? Math.round((r.atendidos / r.solicitado) * 100) : 0;
      const avgMts = Math.round(
        (r.caixaUsina1 + r.caixaUsina2 + r.caixaAcorce + r.caixaLeila + r.caixaOlaria + r.caixaRosa + r.caixaManLinha) / 
        ([r.caixaUsina1, r.caixaUsina2, r.caixaAcorce, r.caixaLeila, r.caixaOlaria, r.caixaRosa, r.caixaManLinha].filter(v => v > 0).length || 1)
      );
      const aderenciaVazao = r.vazaoVinhacaInformada > 0 ? Math.round((r.vazaoReal / r.vazaoVinhacaInformada) * 100) : 0;
      const deltaVazao = r.vazaoReal - r.vazaoVinhacaInformada;
      const statusVazao = deltaVazao >= 0 ? `${deltaVazao} Ganhou` : `${Math.abs(deltaVazao)} Perdeu`;

      return [
        r.hora,
        r.f_54_4_vln, r.f_54_2_vln, r.f_54_1_vln, r.f_51_4_asp, r.f_51_2_asp, r.f_51_3_asp,
        r.solicitado, r.atendidos, `${aderenciaAtend}%`,
        r.teorK2O.toFixed(1).replace(".", ","),
        r.caixaUsina1, r.caixaUsina2, r.caixaAcorce, r.caixaLeila, r.caixaOlaria, r.caixaRosa, r.caixaManLinha,
        avgMts,
        r.aguaResiduais, r.vazaoVinhacaInformada, r.vazaoReal, `${aderenciaVazao}%`,
        r.totalEstoque, r.retirado, statusVazao,
        r.necessidadeTrabalhou, r.caminhaoNecessidade, r.caminhaoTrabalhou,
        `"${r.obs.replace(/"/g, '""')}"`
      ].join(";");
    });

    const csvContent = "\ufeff" + [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Apontamento_Vinhaca_Colombo_${selectedDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Planilha (.CSV) gerada e baixada com sucesso!");
  };

  if (dayData.length === 0 || !focusedRow) {
    return (
      <div className="p-12 text-center bg-white border border-gray-150 rounded-3xl shadow-sm text-xs font-black text-gray-500 uppercase tracking-widest flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[#00843D]" size={24} />
        <span>Carregando apontamentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#004d22] text-white px-5 py-3 rounded-2xl border border-[#5adc6a]/40 flex items-center gap-2.5 shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle size={18} className="text-[#5adc6a]" />
          <span className="text-xs font-black uppercase tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Top Controller Panel */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-gray-50/80 p-5 rounded-[24px] border border-[#00843D]/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="shrink-0 flex items-center gap-2">
            <span className="p-2 bg-[#e2f5e5] text-[#00843D] rounded-xl border border-[#00843D]/10">
              <FileSpreadsheet size={20} className="stroke-[2.5]" />
            </span>
            <div>
              <h3 className="text-sm font-black text-[#005B2B] uppercase tracking-wide">
                Controle de Apontamento Horário de Vinhaça
              </h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Fertirrigação • Lançamento Integrado 24 Horas
              </p>
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-xs">
            <Calendar size={14} className="text-[#00843D]" />
            <span className="text-[10px] font-black uppercase text-gray-400">Data:</span>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-black text-gray-800 outline-none select-none cursor-pointer"
            />
          </div>
        </div>

        {/* Global Toolbar actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none bg-[#00843D] hover:bg-[#004d22] text-white flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 border border-[#004d22]/30 shadow-md shadow-[#00843D]/10"
          >
            <Download size={13} className="text-white" />
            <span>Exportar CSV / Planilha</span>
          </button>
          
          <button 
            onClick={handleResetDayData}
            title="Redefinir planilha"
            className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 hover:text-rose-700 p-2.5 rounded-xl transition active:scale-95"
          >
            <RefreshCw size={14} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Modern Dashboard Stats Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-[#e2f5e5] text-[#00843D] rounded-xl">
            <Check size={18} className="stroke-[3]" />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Aderência Viagens</span>
            <span className="text-xl font-black text-[#005B2B] block leading-tight">{kpis.aderenciaGeral}%</span>
            <span className="text-[9px] text-[#00843D] font-bold block">{kpis.totalAtendidos} de {kpis.totalSolicitado} viagens atendidas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-[#e2f5e5] text-[#00843D] rounded-xl">
            <Activity size={18} className="stroke-[3.5]" />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Média Vazão Real</span>
            <span className="text-xl font-black text-[#005B2B] block leading-tight">{kpis.mediaVazaoReal} m³/h</span>
            <span className="text-[9px] text-[#00843D] font-bold block">Aderência: {kpis.vazaoAderencia}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Droplet size={18} className="stroke-[3]" />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Metragem Caixas (média)</span>
            <span className="text-xl font-black text-blue-900 block leading-tight">
              {Math.round(dayData.reduce((acc, r) => acc + r.caixaUsina1, 0) / (dayData.length || 1))} cm
            </span>
            <span className="text-[9px] text-blue-500 font-bold block">Nível do pulmão estável</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Truck size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Frota em Operação</span>
            <span className="text-xl font-black text-amber-800 block leading-tight">
              {dayData[8]?.caminhaoTrabalhou || 17} Caminhões
            </span>
            <span className="text-[9px] text-amber-600 font-semibold block">Déficit regulado por folga</span>
          </div>
        </div>

      </div>

      {/* Main Grid + Sidebar Detail Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Modern Interactive Sheet */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          
          {/* Sub Header Segmented Tab Selector of the Excel Sections */}
          <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1.5">
            {[
              { id: "frentes", label: "🚜 Frentes & Atendimento" },
              { id: "caixas", label: "🔋 Metragem Caixas" },
              { id: "vazoes", label: "💧 Vazões & Estoques" },
              { id: "necessidades", label: "📌 Dimensionamento & Nível" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSheetTab(tab.id as any)}
                className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  activeSheetTab === tab.id 
                    ? "bg-[#00843D] text-white shadow-sm"
                    : "bg-white text-[#004d22] border border-[#00843D]/20 hover:bg-[#e2f5e5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 font-bold uppercase p-3 border-b border-gray-100 bg-white leading-none">
            💡 Dica: Clique em qualquer horário na tabela para preencher e editar com facilidade no painel lateral
          </p>

          {/* Core Table View Container */}
          <div className="overflow-x-auto max-h-[640px] scrollbar-custom">
            <table className="w-full text-xs text-left border-collapse border-spacing-0">
              <thead className="bg-[#00843D] text-white sticky top-0 z-10 border-b border-[#004d22]">
                
                {/* Dynamic Headers based on selected Tab */}
                {activeSheetTab === "frentes" && (
                  <tr>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Hora</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center bg-[#004d22]/30">54-4 Vln</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center bg-[#004d22]/30">54-2 Vln</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center bg-[#004d22]/30">54-1 Vln</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center bg-emerald-900/30">51-4 Asp</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center bg-emerald-900/30">51-2 Asp</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center bg-emerald-900/30">51-3 Asp</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center border-l border-white/20">Solicitado</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center text-[#5adc6a]">Atendidos</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Aderência</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Obs</th>
                  </tr>
                )}

                {activeSheetTab === "caixas" && (
                  <tr>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Hora</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Usina 1</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Usina 2</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Acorce</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Leila</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Olaria</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Rosa</th>
                    <th className="py-3 px-2 uppercase text-[9px] font-black tracking-widest text-center">Man Linha</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center text-[#5adc6a] bg-[#004d22]">Mts Ponderado</th>
                  </tr>
                )}

                {activeSheetTab === "vazoes" && (
                  <tr>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Hora</th>
                    <th className="py-3 px-2.5 uppercase text-[9px] font-black tracking-widest text-center">Água Residuais</th>
                    <th className="py-3 px-2.5 uppercase text-[9px] font-black tracking-widest text-center">Vazão Informada</th>
                    <th className="py-3 px-2.5 uppercase text-[9px] font-black tracking-widest text-center">Vazão Real</th>
                    <th className="py-3 px-2.5 uppercase text-[9px] font-black tracking-widest text-center text-[#5adc6a]">Aderência %</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Estoque Caixas (L)</th>
                    <th className="py-3 px-2.5 uppercase text-[9px] font-black tracking-widest text-center">Retirado (m³)</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center border-l border-white/20">Delta / Status</th>
                  </tr>
                )}

                {activeSheetTab === "necessidades" && (
                  <tr>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Hora</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center text-amber-200">K2O (%)</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center">Nec. Trabalhou</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center text-rose-300">Nec. Saldo</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center bg-emerald-900/30">Nível Necessário</th>
                    <th className="py-3 px-3 uppercase text-[9px] font-black tracking-widest text-center bg-emerald-900/30">Nível</th>
                    <th className="py-3 px-4 uppercase text-[9px] font-black tracking-widest text-center">Observações</th>
                  </tr>
                )}

                {activeSheetTab === "full" && (
                  <tr>
                    <th className="py-2 px-2.5 uppercase text-[8px] font-black tracking-widest text-center border-r border-[#004d22]">Hora</th>
                    <th className="py-2 px-1.5 uppercase text-[8px] font-black tracking-widest text-center bg-[#004d22]/30">54-4</th>
                    <th className="py-2 px-1.5 uppercase text-[8px] font-black tracking-widest text-center bg-[#004d22]/30">54-1</th>
                    <th className="py-2 px-1.5 uppercase text-[8px] font-black tracking-widest text-center bg-emerald-900/30">51-3</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center">Solic</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center text-[#5adc6a]">Atend</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center font-mono">%</th>
                    <th className="py-2 px-1.5 uppercase text-[8px] font-black tracking-widest text-center bg-black/15">Usina 1</th>
                    <th className="py-2 px-1.5 uppercase text-[8px] font-black tracking-widest text-center bg-black/15">Olaria</th>
                    <th className="py-2 px-1.5 uppercase text-[8px] font-black tracking-widest text-center bg-black/15">Rosa</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center bg-black/20 text-[#5adc6a]">Avg cm</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center">V.Inform</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center">V.Real</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center text-[#5adc6a] font-mono">% Vz</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center bg-cyan-900/30">Delta</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center text-rose-300">Nec.Saldo</th>
                    <th className="py-2 px-2 uppercase text-[8px] font-black tracking-widest text-center">Frota Trab</th>
                  </tr>
                )}

              </thead>
              <tbody className="divide-y divide-gray-150">
                {dayData.map((row) => {
                  const isSelected = row.hora === selectedHour;
                  
                  // Calculations
                  const totalFrentes = row.atendidos;
                  const adAtend = row.solicitado > 0 ? Math.round((totalFrentes / row.solicitado) * 100) : 0;
                  const adVazao = row.vazaoVinhacaInformada > 0 ? Math.round((row.vazaoReal / row.vazaoVinhacaInformada) * 100) : 0;
                  
                  const activeCaixas = [
                    row.caixaUsina1, row.caixaUsina2, row.caixaAcorce,
                    row.caixaLeila, row.caixaOlaria, row.caixaRosa, row.caixaManLinha
                  ].filter(v => v > 0);
                  const averageCaixas = activeCaixas.length > 0 ? Math.round(activeCaixas.reduce((s, v) => s + v, 0) / activeCaixas.length) : 0;

                  const deltaV = row.vazaoReal - row.vazaoVinhacaInformada;
                  const statusLabel = deltaV >= 0 ? `${deltaV} Ganhou` : `${Math.abs(deltaV)} Perdeu`;
                  const saldoNecessidade = row.necessidadeTrabalhou - 10; // dummy matches "-10 Falta" in Excel if zero

                  return (
                    <tr 
                      key={row.hora} 
                      onClick={() => {
                        setSelectedHour(row.hora);
                        // Add feedback sound tone simulated or visual
                      }}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isSelected 
                          ? "bg-[#e2f5e5] hover:bg-[#e2f5e5] border-y-2 border-[#00843D]/50" 
                          : "hover:bg-slate-50 even:bg-slate-50/50"
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-center font-black text-[#005B2B] border-r border-gray-150">
                        {row.hora}
                      </td>

                      {/* --- TABS --- */}
                      
                      {activeSheetTab === "frentes" && (
                        <>
                          <td className="py-2.5 px-2 text-center font-bold text-gray-800">{row.f_54_4_vln || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-gray-800">{row.f_54_2_vln || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-gray-800">{row.f_54_1_vln || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-500">{row.f_51_4_asp || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-500">{row.f_51_2_asp || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-bold text-slate-500">{row.f_51_3_asp || "-"}</td>
                          
                          <td className="py-2.5 px-3 text-center border-l border-gray-150 font-black text-[#004d22]">{row.solicitado}</td>
                          <td className="py-2.5 px-3 text-center font-black text-rose-700 bg-rose-50/40">{totalFrentes}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[10px] ${
                              adAtend >= 70 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
                            }`}>
                              {adAtend}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold truncate max-w-[120px] text-gray-400" title={row.obs}>
                            {row.obs || "--"}
                          </td>
                        </>
                      )}

                      {activeSheetTab === "caixas" && (
                        <>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-700">{row.caixaUsina1} cm</td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-400">{row.caixaUsina2 || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-400">{row.caixaAcorce || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-400">{row.caixaLeila || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-400">{row.caixaOlaria || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-400">{row.caixaRosa || "-"}</td>
                          <td className="py-2.5 px-2 text-center font-mono font-semibold text-gray-400">{row.caixaManLinha || "-"}</td>
                          <td className="py-2.5 px-3 text-center bg-[#00843D]/5 font-black text-[#005B2B]">{averageCaixas} cm</td>
                        </>
                      )}

                      {activeSheetTab === "vazoes" && (
                        <>
                          <td className="py-2.5 px-2.5 text-center font-mono font-semibold text-[#005B2B]">{row.aguaResiduais} m³</td>
                          <td className="py-2.5 px-2.5 text-center font-mono font-bold text-[#004d22]">{row.vazaoVinhacaInformada} m³</td>
                          <td className="py-2.5 px-2.5 text-center font-mono font-black text-blue-900 bg-blue-50/30">{row.vazaoReal} m³</td>
                          <td className="py-2.5 px-2.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[10px] ${
                              adVazao >= 95 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                            }`}>
                              {adVazao}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-gray-500 font-mono font-bold">{row.totalEstoque.toLocaleString()} L</td>
                          <td className="py-2.5 px-2.5 text-center text-[#004d22] font-black">{row.retirado} m³</td>
                          <td className="py-2.5 px-3 text-center border-l border-gray-150 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                              deltaV >= 0 ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                        </>
                      )}

                      {activeSheetTab === "necessidades" && (
                        <>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-[#00843D]">{row.teorK2O.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-center font-mono text-gray-700">{row.necessidadeTrabalhou}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-black uppercase">
                              {saldoNecessidade} FALTA
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-gray-400 bg-slate-50/50">{row.caminhaoNecessidade} CM</td>
                          <td className="py-2.5 px-3 text-center font-black text-[#005B2B] bg-emerald-50/30">{row.caminhaoTrabalhou} CM</td>
                          <td className="py-2.5 px-4 font-bold text-gray-400 truncate max-w-[200px]" title={row.obs}>
                            {row.obs || "--"}
                          </td>
                        </>
                      )}

                      {activeSheetTab === "full" && (
                        <>
                          <td className="py-2 px-1.5 text-center font-bold text-gray-800">{row.f_54_4_vln || "-"}</td>
                          <td className="py-2 px-1.5 text-center font-bold text-gray-800">{row.f_54_1_vln || "-"}</td>
                          <td className="py-2 px-1.5 text-center font-bold text-slate-500">{row.f_51_3_asp || "-"}</td>
                          <td className="py-2 px-2 text-center font-black text-slate-400">{row.solicitado}</td>
                          <td className="py-2 px-2 text-center font-black text-rose-700 bg-rose-50/20">{totalFrentes}</td>
                          <td className="py-2 px-2 text-center font-bold font-mono text-[9px] text-[#005B2B]">{adAtend}%</td>
                          <td className="py-2 px-1.5 text-center font-mono font-semibold text-gray-700 md:bg-gray-100/30">{row.caixaUsina1}</td>
                          <td className="py-2 px-1.5 text-center font-mono font-semibold text-gray-400">{row.caixaOlaria || "-"}</td>
                          <td className="py-2 px-1.5 text-center font-mono font-semibold text-gray-400">{row.caixaRosa || "-"}</td>
                          <td className="py-2 px-2 text-center font-black text-blue-900 bg-blue-50/20 font-mono text-[9px]">{averageCaixas}</td>
                          <td className="py-2 px-2 text-center text-gray-600 font-mono">{row.vazaoVinhacaInformada}</td>
                          <td className="py-2 px-2 text-center font-black text-[#004d22] font-mono">{row.vazaoReal}</td>
                          <td className="py-2 px-2 text-center font-bold text-[#00843D] font-mono text-[9px]">{adVazao}%</td>
                          <td className="py-2 px-2 text-center text-[8px] font-black uppercase tracking-wider font-mono text-slate-500">{statusLabel}</td>
                          <td className="py-2 px-2 text-center font-bold text-rose-700 text-[8px] tracking-wider">{saldoNecessidade} FALTA</td>
                          <td className="py-2 px-2 text-center font-black text-[#005B2B] font-mono">{row.caminhaoTrabalhou}</td>
                        </>
                      )}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Interactive Hour Controller Slider Panel */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#00843D]/25 rounded-3xl shadow-md p-6 overflow-hidden flex flex-col space-y-6">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="p-1 px-2.5 bg-[#e2f5e5] text-[#00843D] font-mono font-black text-xs rounded-lg flex items-center gap-1">
                <Clock size={12} strokeWidth={3} />
                {focusedRow.hora}
              </span>
              <h4 className="text-sm font-black text-[#005B2B] uppercase">Lançamento por Horário</h4>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const idx = HOURS_LIST.indexOf(focusedRow.hora);
                  if (idx > 0) setSelectedHour(HOURS_LIST[idx - 1]);
                }}
                className="p-1.5 bg-gray-50 hover:bg-[#e2f5e5] rounded-lg transition text-[#004d22]"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => {
                  const idx = HOURS_LIST.indexOf(focusedRow.hora);
                  if (idx < HOURS_LIST.length - 1) setSelectedHour(HOURS_LIST[idx + 1]);
                }}
                className="p-1.5 bg-gray-50 hover:bg-[#e2f5e5] rounded-lg transition text-[#004d22]"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-[500px] overflow-y-auto pr-1 select-none text-xs pb-4">
            
            {/* Group 1: Frentes de Despacho (Caminhão) */}
            <div className="col-span-2 border-b border-gray-100 pb-3 mt-1">
              <span className="text-[10px] font-black text-[#00843D] uppercase tracking-wider block">🚜 Despacho Viagens (Frentes)</span>
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">54-4 Vln. Loc</label>
              <input 
                type="number"
                min="0"
                max="50"
                value={focusedRow.f_54_4_vln}
                onChange={(e) => updateHourField(focusedRow.hora, "f_54_4_vln", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">54-2 Vln. Loc</label>
              <input 
                type="number"
                min="0"
                max="50"
                value={focusedRow.f_54_2_vln}
                onChange={(e) => updateHourField(focusedRow.hora, "f_54_2_vln", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">54-1 Vln. Loc</label>
              <input 
                type="number"
                min="0"
                max="50"
                value={focusedRow.f_54_1_vln}
                onChange={(e) => updateHourField(focusedRow.hora, "f_54_1_vln", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">51-3 Aspersão</label>
              <input 
                type="number"
                min="0"
                max="50"
                value={focusedRow.f_51_3_asp}
                onChange={(e) => updateHourField(focusedRow.hora, "f_51_3_asp", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            {/* Atendidos & Solicitados */}
            <div className="col-span-2 grid grid-cols-2 gap-4 bg-emerald-50/40 p-3 rounded-xl border border-[#00843D]/10">
              <div>
                <label className="block text-[9px] font-black text-[#005B2B] uppercase mb-1">Solicitado</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={focusedRow.solicitado}
                  onChange={(e) => updateHourField(focusedRow.hora, "solicitado", parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-[#00843D]/40 focus:border-[#00843D] rounded-xl py-2 px-3 font-mono font-black text-center text-emerald-950 outline-none"
                />
              </div>

              <div>
                <span className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 text-center">Atendidos Aut.</span>
                <span className="block w-full py-2 px-3 font-mono font-black text-center text-lg text-rose-700">
                  {focusedRow.atendidos}
                </span>
              </div>
            </div>

            {/* Group 2: Caixas de Vinhaça Metragem */}
            <div className="col-span-2 border-b border-gray-100 pb-3 pt-2">
              <span className="text-[10px] font-black text-[#00843D] uppercase tracking-wider block">🔋 Metragem Caixas (cm)</span>
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Usina 1</label>
              <input 
                type="number"
                min="0"
                max="500"
                value={focusedRow.caixaUsina1}
                onChange={(e) => updateHourField(focusedRow.hora, "caixaUsina1", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Usina 2</label>
              <input 
                type="number"
                min="0"
                max="500"
                value={focusedRow.caixaUsina2}
                onChange={(e) => updateHourField(focusedRow.hora, "caixaUsina2", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Rosa / Sta Rosa</label>
              <input 
                type="number"
                min="0"
                max="500"
                value={focusedRow.caixaRosa}
                onChange={(e) => updateHourField(focusedRow.hora, "caixaRosa", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Olaria</label>
              <input 
                type="number"
                min="0"
                max="500"
                value={focusedRow.caixaOlaria}
                onChange={(e) => updateHourField(focusedRow.hora, "caixaOlaria", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            {/* Group 3: Vazões & Estoques */}
            <div className="col-span-2 border-b border-gray-100 pb-3 pt-2">
              <span className="text-[10px] font-black text-[#00843D] uppercase tracking-wider block">💧 Vazões &amp; Estoque</span>
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Água Residuais</label>
              <input 
                type="number"
                min="0"
                max="1000"
                value={focusedRow.aguaResiduais}
                onChange={(e) => updateHourField(focusedRow.hora, "aguaResiduais", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Teor K2O (%)</label>
              <input 
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={focusedRow.teorK2O}
                onChange={(e) => updateHourField(focusedRow.hora, "teorK2O", parseFloat(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Vazão Informada</label>
              <input 
                type="number"
                min="0"
                max="2000"
                value={focusedRow.vazaoVinhacaInformada}
                onChange={(e) => updateHourField(focusedRow.hora, "vazaoVinhacaInformada", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-[#005B2B] outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Vazão Real</label>
              <input 
                type="number"
                min="0"
                max="2000"
                value={focusedRow.vazaoReal}
                onChange={(e) => updateHourField(focusedRow.hora, "vazaoReal", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-blue-900 outline-none"
              />
            </div>

            {/* Retirado */}
            <div className="col-span-2">
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Estoque Retirado (m³)</label>
              <input 
                type="number"
                min="0"
                max="50000"
                value={focusedRow.retirado}
                onChange={(e) => updateHourField(focusedRow.hora, "retirado", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-gray-800 outline-none"
              />
            </div>

            {/* Group 4: Frota & Dimensionamento */}
            <div className="col-span-2 border-b border-gray-100 pb-3 pt-2">
              <span className="text-[10px] font-black text-[#00843D] uppercase tracking-wider block">📌 Frota / Dimensionamento</span>
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Cm. Necessário</label>
              <input 
                type="number"
                min="0"
                max="200"
                value={focusedRow.caminhaoNecessidade}
                onChange={(e) => updateHourField(focusedRow.hora, "caminhaoNecessidade", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1 font-sans">Cm. Trabalhou</label>
              <input 
                type="number"
                min="0"
                max="200"
                value={focusedRow.caminhaoTrabalhou}
                onChange={(e) => updateHourField(focusedRow.hora, "caminhaoTrabalhou", parseInt(e.target.value) || 0)}
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-mono font-black text-center text-gray-800 outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Observações do Horário</label>
              <textarea 
                rows={2}
                value={focusedRow.obs}
                onChange={(e) => updateHourField(focusedRow.hora, "obs", e.target.value)}
                placeholder="Ex: Parada na bacia pulmão devido a reparo mecânico..."
                className="w-full bg-[#f4faf6] border border-[#00843D]/30 focus:border-[#00843D] focus:bg-white rounded-xl py-2 px-3 font-medium text-gray-800 outline-none"
              />
            </div>

          </div>

          {/* Quick status confirmation feedback */}
          <div className="bg-[#e2f5e5]/50 border-t border-[#004d22]/10 p-3 rounded-2xl flex items-center gap-2.5">
            <CheckCircle size={16} className="text-[#00843D]" />
            <span className="text-[10px] font-black text-emerald-950 uppercase">Alterações gravadas automaticamente</span>
          </div>

        </div>

      </div>

    </div>
  );
};
