import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  Calendar,
  Filter,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Layers,
  Table,
  ClipboardList,
  ArrowRightLeft,
  XCircle,
  HelpCircle
} from "lucide-react";
import * as XLSX from "xlsx";

export interface AreaHistoricEntry {
  id: string;
  timestamp: string;
  categoria: 'Auditoria' | 'Cadastro' | 'Status' | 'Boletim';
  frente?: string;
  fazenda?: string;
  detalhes: string;
  usuario: string;
}

export interface DivergenciaItem {
  frente: string;
  modalidade: string;
  fisicoMecanizado: number;
  fisicoMeiosi: number;
  totalFisico: number;
  pimsMecanizado: number;
  pimsMeiosi: number;
  totalPims: number;
  desvio: number;
  status: 'Consolidado' | 'Desvio sob Revisão' | 'Aprovado com Ressalva';
  dataAuditoria: string;
}

export const GestaoAreasHistorico: React.FC = () => {
  const [activeSubSubTab, setActiveSubSubTab] = useState<'logs' | 'divergencias' | 'boletins'>('logs');
  const [logsList, setLogsList] = useState<AreaHistoricEntry[]>([]);
  const [divergenciasList, setDivergenciasList] = useState<DivergenciaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<string>("TODOS");
  const [filterStatusDivergencia, setFilterStatusDivergencia] = useState<string>("TODOS");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    try {
      // 1. Logs
      const rawLogs = localStorage.getItem("gestao_areas_historico_logs");
      if (rawLogs) {
        setLogsList(JSON.parse(rawLogs));
      } else {
        const initialLogs: AreaHistoricEntry[] = [
          {
            id: "GA-LOG-101",
            timestamp: "16/07/2026 às 14:30:15",
            categoria: "Cadastro",
            frente: "72-1",
            fazenda: "Faz. Progresso",
            detalhes: "Nova área de plantio cadastrada: Fazenda Progresso - Quadra 15 - Talhão 60 (Área de 12.50 ha, Variedade CTC 3445, Sistema Mecanizado Convenc).",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "GA-LOG-102",
            timestamp: "16/07/2026 às 11:20:00",
            categoria: "Status",
            frente: "72-1",
            fazenda: "Faz. Ariranha Norte",
            detalhes: "Status da área alterado de 'PLANTANDO' para 'PLANTIO FECHADO' na Fazenda Ariranha Norte - Talhão 2.",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "GA-LOG-103",
            timestamp: "16/07/2026 às 10:45:12",
            categoria: "Status",
            frente: "71-1",
            fazenda: "Faz. Bela Vista",
            detalhes: "Etapa de solo 'Sulcação' concluída com sucesso (Área total: 4.70 ha).",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "GA-LOG-104",
            timestamp: "15/07/2026 às 18:30:00",
            categoria: "Auditoria",
            frente: "72-2",
            fazenda: "Faz. Bonança",
            detalhes: "Divergência PIMS conciliada para a Frente 72-2. Desvio físico de 0.00 ha validado contra banco oficial ERP.",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "GA-LOG-105",
            timestamp: "15/07/2026 às 14:00:00",
            categoria: "Boletim",
            frente: "72-1",
            fazenda: "Faz. Progresso",
            detalhes: "Boletim Operacional do Turno B homologado: Plantio de 4.70 ha concluído com rendimento médio de 3.25 ha/h.",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "GA-LOG-106",
            timestamp: "14/07/2026 às 16:30:00",
            categoria: "Boletim",
            frente: "71-1",
            fazenda: "Faz. Bela Vista",
            detalhes: "Medição de chuva pluviométrica registrada no Turno C: 15 mm. Operações de plantio suspensas para segurança do solo.",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "GA-LOG-107",
            timestamp: "14/07/2026 às 09:15:22",
            categoria: "Auditoria",
            frente: "72-1",
            fazenda: "Faz. Ariranha",
            detalhes: "Identificada inconsistência no encerramento da quadra: desvio de -7.24 ha detectado entre PIMS ERP e controle físico de campo.",
            usuario: "luizricardocarvalhod@gmail.com"
          }
        ];
        localStorage.setItem("gestao_areas_historico_logs", JSON.stringify(initialLogs));
        setLogsList(initialLogs);
      }

      // 2. Divergências
      const rawDivergencias = localStorage.getItem("gestao_areas_historico_divergencias");
      if (rawDivergencias) {
        setDivergenciasList(JSON.parse(rawDivergencias));
      } else {
        const initialDivergencias: DivergenciaItem[] = [
          {
            frente: "71-1",
            modalidade: "MAN/PRÓPRIO",
            fisicoMecanizado: 0.00,
            fisicoMeiosi: 377.71,
            totalFisico: 406.29,
            pimsMecanizado: 0.00,
            pimsMeiosi: 377.71,
            totalPims: 406.29,
            desvio: 0.00,
            status: "Consolidado",
            dataAuditoria: "16/07/2026"
          },
          {
            frente: "72-1",
            modalidade: "MEC/PRÓPRIO",
            fisicoMecanizado: 3052.62,
            fisicoMeiosi: 22.75,
            totalFisico: 3075.37,
            pimsMecanizado: 3059.86,
            pimsMeiosi: 22.75,
            totalPims: 3082.61,
            desvio: -7.24,
            status: "Desvio sob Revisão",
            dataAuditoria: "15/07/2026"
          },
          {
            frente: "72-2",
            modalidade: "MEC/PRÓPRIO",
            fisicoMecanizado: 1168.42,
            fisicoMeiosi: 11.98,
            totalFisico: 1180.40,
            pimsMecanizado: 1168.42,
            pimsMeiosi: 11.98,
            totalPims: 1180.40,
            desvio: 0.00,
            status: "Consolidado",
            dataAuditoria: "15/07/2026"
          },
          {
            frente: "72-3",
            modalidade: "MEC/PRÓPRIO",
            fisicoMecanizado: 598.92,
            fisicoMeiosi: 0.00,
            totalFisico: 598.92,
            pimsMecanizado: 598.92,
            pimsMeiosi: 0.00,
            totalPims: 598.92,
            desvio: 0.00,
            status: "Consolidado",
            dataAuditoria: "14/07/2026"
          },
          {
            frente: "73-2",
            modalidade: "MEC/PRÓPRIO",
            fisicoMecanizado: 1450.50,
            fisicoMeiosi: 0.00,
            totalFisico: 1450.50,
            pimsMecanizado: 1452.10,
            pimsMeiosi: 0.00,
            totalPims: 1452.10,
            desvio: -1.60,
            status: "Aprovado com Ressalva",
            dataAuditoria: "13/07/2026"
          }
        ];
        localStorage.setItem("gestao_areas_historico_divergencias", JSON.stringify(initialDivergencias));
        setDivergenciasList(initialDivergencias);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico de gestão de áreas", e);
    }
  };

  useEffect(() => {
    loadData();
    // Escutar eventos de alterações de Gestão de Áreas para recarregar
    window.addEventListener("gestao_areas_historico_changed", loadData);
    return () => {
      window.removeEventListener("gestao_areas_historico_changed", loadData);
    };
  }, []);

  const handleResolveDivergencia = (frente: string) => {
    const updated = divergenciasList.map(item => {
      if (item.frente === frente) {
        const nextStatus = item.status === "Desvio sob Revisão" ? "Consolidado" : "Aprovado com Ressalva";
        
        // Log activity
        const newLog: AreaHistoricEntry = {
          id: `GA-LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString("pt-BR"),
          categoria: "Auditoria",
          frente: frente,
          detalhes: `Conciliação manual de divergência executada para a Frente ${frente}. Status alterado de '${item.status}' para '${nextStatus}' por luizricardocarvalhod@gmail.com.`,
          usuario: "luizricardocarvalhod@gmail.com"
        };
        
        const currentLogs = JSON.parse(localStorage.getItem("gestao_areas_historico_logs") || "[]");
        localStorage.setItem("gestao_areas_historico_logs", JSON.stringify([newLog, ...currentLogs]));
        
        return { ...item, status: nextStatus as any, desvio: 0.00 };
      }
      return item;
    });

    localStorage.setItem("gestao_areas_historico_divergencias", JSON.stringify(updated));
    setDivergenciasList(updated);
    loadData();
    showToast(`Divergência da Frente ${frente} resolvida com sucesso!`);
    
    // Dispatch general event to sync
    window.dispatchEvent(new Event("gestao_areas_historico_changed"));
  };

  const handleClearHistory = () => {
    if (confirm("ATENÇÃO: Deseja realmente limpar todo o histórico de logs e auditorias da Gestão de Áreas? Esta ação é irreversível.")) {
      localStorage.removeItem("gestao_areas_historico_logs");
      localStorage.removeItem("gestao_areas_historico_divergencias");
      loadData();
      showToast("Histórico redefinido para os padrões de fábrica.");
      window.dispatchEvent(new Event("gestao_areas_historico_changed"));
    }
  };

  const exportToExcel = () => {
    let exportData: any[] = [];
    let filename = "";

    if (activeSubSubTab === "logs") {
      exportData = filteredLogs.map(l => ({
        "ID": l.id,
        "Data/Hora": l.timestamp,
        "Categoria": l.categoria,
        "Frente": l.frente || "N/A",
        "Fazenda": l.fazenda || "N/A",
        "Detalhes do Evento": l.detalhes,
        "Usuário Responsável": l.usuario
      }));
      filename = "HISTORICO_ATIVIDADES_GESTAO_AREAS";
    } else if (activeSubSubTab === "divergencias") {
      exportData = filteredDivergencias.map(d => ({
        "Frente": d.frente,
        "Modalidade": d.modalidade,
        "Físico Mecanizado (ha)": d.fisicoMecanizado,
        "Físico Meiosi (ha)": d.fisicoMeiosi,
        "Total Controle Físico (ha)": d.totalFisico,
        "PIMS Mecanizado (ha)": d.pimsMecanizado,
        "PIMS Meiosi (ha)": d.pimsMeiosi,
        "Total ERP PIMS (ha)": d.totalPims,
        "Desvio Encontrado (ha)": d.desvio,
        "Data de Auditoria": d.dataAuditoria,
        "Status de Auditoria": d.status
      }));
      filename = "AUDITORIA_DIVERGENCIAS_PIMS_FISICO";
    } else {
      // Boletins
      try {
        const savedBoletins = localStorage.getItem("gestao_areas_boletim");
        const raw = savedBoletins ? JSON.parse(savedBoletins) : [
          { turno: "TURNO A", horario: "00:00 as 10:00", plantio: 0.00, chuva: 0, viagens: 0, muda: 0.00, rendimento: 0.00, pessoas: 0, hecPessoas: 0, status: "NÃO TRABALHOU" },
          { turno: "TURNO B", horario: "10:00 as 14:00", plantio: 4.70, chuva: 0, viagens: 12, muda: 8.50, rendimento: 3.25, pessoas: 15, hecPessoas: 0.31, status: "TRABALHOU" },
          { turno: "TURNO C", horario: "14:00 as 00:00", plantio: 0.00, chuva: 15, viagens: 0, muda: 0.00, rendimento: 0.00, pessoas: 0, hecPessoas: 0, status: "NÃO TRABALHOU" }
        ];
        exportData = raw.map((s: any) => ({
          "Turno": s.turno,
          "Horário Operacional": s.horario,
          "Plantio Realizado (ha)": s.plantio,
          "Precipitação Pluviométrica (mm)": s.chuva,
          "Total Viagens": s.viagens,
          "Muda Consumida (t)": s.muda,
          "Rendimento Operacional (ha/h)": s.rendimento,
          "Pessoas Ativas": s.pessoas,
          "ha por Pessoa": s.hecPessoas,
          "Status Operacional": s.status
        }));
        filename = "APONTAMENTO_BOLETINS_DIARIOS_FRENTES";
      } catch {
        exportData = [];
      }
    }

    if (exportData.length === 0) {
      alert("Nenhum dado para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "HistoricoAreas");

    // Auto fit
    const maxProps = Object.keys(exportData[0] || {});
    const wscols = maxProps.map(key => {
      let maxLen = key.length;
      exportData.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
    });
    worksheet["!cols"] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    link.href = url;
    link.download = `${filename}_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Planilha exportada com sucesso!");
  };

  // Filter logs
  const filteredLogs = logsList.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      item.detalhes.toLowerCase().includes(query) ||
      (item.fazenda && item.fazenda.toLowerCase().includes(query)) ||
      (item.frente && item.frente.includes(query)) ||
      item.timestamp.toLowerCase().includes(query);

    const matchesCategoria = filterCategoria === "TODOS" || item.categoria === filterCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Filter divergencias
  const filteredDivergencias = divergenciasList.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      item.frente.includes(query) ||
      item.modalidade.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query);

    const matchesStatus = filterStatusDivergencia === "TODOS" || item.status === filterStatusDivergencia;
    return matchesSearch && matchesStatus;
  });

  // Load shift records from localStorage or defaults
  const getShiftRecords = () => {
    try {
      const saved = localStorage.getItem("gestao_areas_boletim");
      return saved ? JSON.parse(saved) : [
        { turno: "TURNO A", horario: "00:00 as 10:00", plantio: 0.00, chuva: 0, viagens: 0, muda: 0.00, rendimento: 0.00, pessoas: 0, hecPessoas: 0, status: "NÃO TRABALHOU" },
        { turno: "TURNO B", horario: "10:00 as 14:00", plantio: 4.70, chuva: 0, viagens: 12, muda: 8.50, rendimento: 3.25, pessoas: 15, hecPessoas: 0.31, status: "TRABALHOU" },
        { turno: "TURNO C", horario: "14:00 as 00:00", plantio: 0.00, chuva: 15, viagens: 0, muda: 0.00, rendimento: 0.00, pessoas: 0, hecPessoas: 0, status: "NÃO TRABALHOU" }
      ];
    } catch {
      return [];
    }
  };

  const shiftRecords = getShiftRecords();

  // KPIs
  const totalDivergenciasAtivas = divergenciasList.filter(d => d.status === "Desvio sob Revisão").length;
  const desvioTotalHectares = divergenciasList.reduce((acc, curr) => acc + Math.abs(curr.desvio), 0);
  const totalChuvaRegistrada = shiftRecords.reduce((acc: number, curr: any) => acc + (curr.chuva || 0), 0);

  return (
    <div className="space-y-6 text-left" onClick={(e) => e.stopPropagation()}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 z-50 text-xs font-black animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#5adc6a] animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* KPI WIDGETS PANEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Registros Históricos</span>
            <p className="text-2xl font-black text-gray-900">{logsList.length}</p>
            <span className="text-[8px] text-green-600 font-bold uppercase tracking-wider block">Atividades de Planejamento</span>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Divergências Ativas</span>
            <p className="text-2xl font-black text-amber-600">{totalDivergenciasAtivas}</p>
            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider block">Frentes sob Auditoria</span>
          </div>
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Desvio Total de Área</span>
            <p className="text-2xl font-black text-rose-600">{desvioTotalHectares.toFixed(2)} ha</p>
            <span className="text-[8px] text-rose-500 font-bold uppercase tracking-wider block">Inconsistência ERP vs Físico</span>
          </div>
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
            <ArrowRightLeft size={18} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Chuva Acumulada</span>
            <p className="text-2xl font-black text-[#00843D]">{totalChuvaRegistrada} mm</p>
            <span className="text-[8px] text-green-600 font-bold uppercase tracking-wider block">Registros nos Boletins</span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#00843D] shrink-0">
            <ClipboardList size={18} />
          </div>
        </div>
      </div>

      {/* INNER NAVIGATION & GENERAL FILTERS */}
      <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* SubSubTabs */}
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 self-start">
          <button 
            onClick={() => {
              setActiveSubSubTab('logs');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubSubTab === 'logs' 
                ? 'bg-[#00843D] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock size={12} />
            Logs de Auditoria ({filteredLogs.length})
          </button>
          <button 
            onClick={() => {
              setActiveSubSubTab('divergencias');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubSubTab === 'divergencias' 
                ? 'bg-[#00843D] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ArrowRightLeft size={12} />
            Divergências PIMS ({filteredDivergencias.length})
          </button>
          <button 
            onClick={() => {
              setActiveSubSubTab('boletins');
              setSearchQuery('');
            }}
            className={`px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
              activeSubSubTab === 'boletins' 
                ? 'bg-[#00843D] text-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <ClipboardList size={12} />
            Fechamento de Turnos ({shiftRecords.length})
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          {activeSubSubTab !== 'boletins' && (
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="absolute left-3.5 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                placeholder={activeSubSubTab === 'logs' ? "Buscar logs..." : "Buscar frente..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00843D] font-bold"
              />
            </div>
          )}

          {/* Log Category Filter */}
          {activeSubSubTab === 'logs' && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-gray-400" />
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase focus:outline-none text-gray-700 cursor-pointer"
              >
                <option value="TODOS">Todas Categorias</option>
                <option value="Cadastro">Cadastro</option>
                <option value="Status">Status</option>
                <option value="Auditoria">Auditoria</option>
                <option value="Boletim">Boletim</option>
              </select>
            </div>
          )}

          {/* Divergência Status Filter */}
          {activeSubSubTab === 'divergencias' && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-gray-400" />
              <select
                value={filterStatusDivergencia}
                onChange={(e) => setFilterStatusDivergencia(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase focus:outline-none text-gray-700 cursor-pointer"
              >
                <option value="TODOS">Todos Status</option>
                <option value="Consolidado">Consolidado</option>
                <option value="Desvio sob Revisão">Desvio sob Revisão</option>
                <option value="Aprovado com Ressalva">Aprovado com Ressalva</option>
              </select>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={exportToExcel}
            className="p-2.5 bg-green-50 hover:bg-green-100 text-[#00843D] rounded-xl transition-all border border-green-200 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase"
            title="Exportar dados atuais para planilha Excel"
          >
            <Download size={14} />
            Exportar Excel
          </button>

          {/* Reset Button */}
          <button
            onClick={handleClearHistory}
            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase"
            title="Redefinir histórico"
          >
            <Trash2 size={14} />
            Redefinir
          </button>
        </div>
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        
        {/* TAB 1: LOGS */}
        {activeSubSubTab === 'logs' && (
          <div className="divide-y divide-gray-50">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-5 hover:bg-gray-50/50 transition-all flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      log.categoria === 'Cadastro' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      log.categoria === 'Status' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      log.categoria === 'Auditoria' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {log.categoria === 'Cadastro' && <Layers size={18} />}
                      {log.categoria === 'Status' && <Activity size={18} />}
                      {log.categoria === 'Auditoria' && <ArrowRightLeft size={18} />}
                      {log.categoria === 'Boletim' && <ClipboardList size={18} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                          log.categoria === 'Cadastro' ? 'bg-blue-100 text-blue-700' :
                          log.categoria === 'Status' ? 'bg-amber-100 text-amber-700' :
                          log.categoria === 'Auditoria' ? 'bg-rose-100 text-rose-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {log.categoria}
                        </span>
                        {log.frente && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px] font-bold">
                            Frente: {log.frente}
                          </span>
                        )}
                        {log.fazenda && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px] font-bold">
                            {log.fazenda}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          ID: #{log.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-800 font-bold leading-relaxed">{log.detalhes}</p>
                      
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase pt-1">
                        <User size={10} className="text-gray-400" />
                        <span>Responsável: {log.usuario}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl shrink-0 self-start md:self-center">
                    {log.timestamp}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-24 text-center space-y-3">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-700 uppercase">Nenhum log encontrado</h4>
                  <p className="text-xs text-gray-400 font-bold max-w-sm mx-auto mt-1 uppercase">Ajuste os filtros de busca ou cadastre novas informações na Gestão de Áreas para gerar logs.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIVERGÊNCIAS PIMS */}
        {activeSubSubTab === 'divergencias' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[9px] tracking-wider">
                  <th className="px-6 py-4">Frente</th>
                  <th className="px-4 py-4">Modalidade</th>
                  <th className="px-4 py-4">Físico (ha)</th>
                  <th className="px-4 py-4">ERP PIMS (ha)</th>
                  <th className="px-4 py-4">Desvio / Diferença</th>
                  <th className="px-4 py-4">Data Auditoria</th>
                  <th className="px-4 py-4">Status Auditoria</th>
                  <th className="px-6 py-4 text-right">Ação Corretiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                {filteredDivergencias.length > 0 ? (
                  filteredDivergencias.map((item) => (
                    <tr key={item.frente} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#00843D]" />
                          <span className="font-black text-gray-900 text-sm">Frente {item.frente}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-400 uppercase text-[10px]">{item.modalidade}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="text-gray-900 font-black">{item.totalFisico.toFixed(2)} ha</div>
                          <div className="text-[8px] text-gray-400 font-bold uppercase">Mec: {item.fisicoMecanizado} | Meio: {item.fisicoMeiosi}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="text-gray-900 font-black">{item.totalPims.toFixed(2)} ha</div>
                          <div className="text-[8px] text-gray-400 font-bold uppercase">Mec: {item.pimsMecanizado} | Meio: {item.pimsMeiosi}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.desvio === 0 ? (
                          <span className="text-green-600 font-black flex items-center gap-1">
                            <CheckCircle size={12} />
                            Sem desvio (0 ha)
                          </span>
                        ) : (
                          <span className="text-rose-600 font-black flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 w-fit">
                            <AlertCircle size={12} />
                            {item.desvio.toFixed(2)} ha
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-400 text-[10px]">{item.dataAuditoria}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                          item.status === 'Consolidado' ? 'bg-green-100 text-green-700' :
                          item.status === 'Desvio sob Revisão' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.status === 'Consolidado' && <CheckCircle size={10} />}
                          {item.status === 'Desvio sob Revisão' && <AlertCircle size={10} />}
                          {item.status === 'Aprovado com Ressalva' && <HelpCircle size={10} />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === 'Desvio sob Revisão' ? (
                          <button
                            onClick={() => handleResolveDivergencia(item.frente)}
                            className="px-3 py-1.5 bg-[#00843D] hover:bg-[#006B32] text-white font-black text-[9px] uppercase rounded-xl shadow-md shadow-green-900/10 active:scale-95 transition-all"
                          >
                            Conciliar ERP
                          </button>
                        ) : item.status === 'Aprovado com Ressalva' ? (
                          <button
                            onClick={() => handleResolveDivergencia(item.frente)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase rounded-xl shadow-md active:scale-95 transition-all"
                          >
                            Consolidar Total
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-gray-400 uppercase block tracking-wider">Aprovado ✓</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-24 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-2">
                        <ArrowRightLeft size={24} />
                      </div>
                      <h4 className="text-sm font-black text-gray-700 uppercase">Nenhuma divergência encontrada</h4>
                      <p className="text-xs text-gray-400 font-bold max-w-sm mx-auto mt-1 uppercase">Todas as auditorias estão finalizadas e sem inconsistências.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: BOLETINS */}
        {activeSubSubTab === 'boletins' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <div className="text-left space-y-0.5">
                <h4 className="font-black text-gray-900 uppercase text-sm">Resumo Consolidado de Turnos Recentes</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Ciclo de frentes agrícolas em atividade de 24 horas</p>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-[#00843D] font-black text-[10px] uppercase tracking-wider">
                Safra Ativa: 2026/2027
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Table */}
              <div className="lg:col-span-2 overflow-x-auto border border-gray-100 rounded-2xl">
                <table className="w-full border-collapse text-left text-xs min-w-[550px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-black uppercase text-[9px] tracking-wider">
                      <th className="px-4 py-4">Turno</th>
                      <th className="px-4 py-4">Horário</th>
                      <th className="px-4 py-4">Plantio (ha)</th>
                      <th className="px-4 py-4">Chuva (mm)</th>
                      <th className="px-4 py-4">Viagens</th>
                      <th className="px-4 py-4">Equipe</th>
                      <th className="px-4 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
                    {shiftRecords.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-4 text-[#00843D] font-black">{row.turno}</td>
                        <td className="px-4 py-4 text-gray-400">{row.horario}</td>
                        <td className="px-4 py-4 text-gray-900">{row.plantio.toFixed(2)} ha</td>
                        <td className="px-4 py-4 text-emerald-600">{row.chuva} mm</td>
                        <td className="px-4 py-4 text-gray-400">{row.viagens}</td>
                        <td className="px-4 py-4 text-gray-400">{row.pessoas} colab.</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[8px] font-black uppercase ${
                            row.status === 'TRABALHOU' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sidebar Analysis inside Bulletins Tab */}
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
                <h5 className="text-[10px] font-black text-[#00843D] uppercase tracking-wider border-b border-gray-200 pb-2">Métricas de Produtividade</h5>
                
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Rendimento Acumulado</span>
                    <span className="text-xs text-gray-900 font-black">3.25 ha/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Muda / ha</span>
                    <span className="text-xs text-gray-900 font-black">1.81 t/ha</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Hectares / Colaborador</span>
                    <span className="text-xs text-[#00843D] font-black">0.31 ha/pessoa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Volume Total de Mudas</span>
                    <span className="text-xs text-gray-900 font-black">8.50 t</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 text-xs">
                  <span className="text-[8px] text-gray-400 font-black uppercase block tracking-wider">Nota Técnica de Chuva</span>
                  <p className="text-gray-500 leading-relaxed font-bold text-[10px] uppercase">
                    Conforme normas da Colombo S/A, precipitações acima de 10mm em menos de 4 horas geram interrupção automática das frentes por encharcamento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
