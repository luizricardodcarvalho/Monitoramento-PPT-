import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  Clock, 
  Sliders, 
  Calendar,
  Filter,
  User,
  Activity,
  AlertCircle
} from "lucide-react";
import { registerVinhacaActivity, VinhacaHistoricEntry } from "../lib/vinhacaSync";

export const VinhacaHistorico: React.FC = () => {
  const [historyList, setHistoryList] = useState<VinhacaHistoricEntry[]>([]);
  const [filteredList, setFilteredList] = useState<VinhacaHistoricEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOrigem, setFilterOrigem] = useState<string>("TODOS");
  const [filterAcao, setFilterAcao] = useState<string>("TODOS");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem("vinhaca_historico_db");
      if (raw) {
        setHistoryList(JSON.parse(raw));
      } else {
        // Seed default history data if empty
        const initialSeed: VinhacaHistoricEntry[] = [
          {
            id: "V-SEED101",
            timestamp: "21/05/2026 às 10:20:15",
            origem: "Despacho",
            tipoAcao: "Inclusão",
            caminhao: "104.908",
            detalhes: "Viagem cadastrada para frota 104.908 no parceiro Sta Rosa na frente 51-3 Aspersão.",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "V-SEED102",
            timestamp: "21/05/2026 às 08:45:00",
            origem: "Apontamento",
            tipoAcao: "Edição",
            detalhes: "Alterado vazão real de vinhaça para 300 m³ às 08:00.",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "V-SEED103",
            timestamp: "21/05/2026 às 06:12:30",
            origem: "Níveis",
            tipoAcao: "Edição",
            detalhes: "Altura da caixa reguladora Usina1 (Bonança) atualizada para 195 cm (Variação: -5cm).",
            usuario: "luizricardocarvalhod@gmail.com"
          },
          {
            id: "V-SEED104",
            timestamp: "20/05/2026 às 23:55:18",
            origem: "Fechamento",
            tipoAcao: "Boletim",
            detalhes: "Fechamento de Boletim Oficial da unidade Usina1 (Bonança) gravado: 40 viagens (2.400 m³).",
            usuario: "luizricardocarvalhod@gmail.com"
          }
        ];
        localStorage.setItem("vinhaca_historico_db", JSON.stringify(initialSeed));
        setHistoryList(initialSeed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener("vinhaca_historico_changed", loadHistory);
    return () => {
      window.removeEventListener("vinhaca_historico_changed", loadHistory);
    };
  }, []);

  // Filter logic
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const result = historyList.filter(item => {
      const matchesSearch = 
        item.detalhes.toLowerCase().includes(query) ||
        item.timestamp.toLowerCase().includes(query) ||
        (item.caminhao && item.caminhao.toLowerCase().includes(query)) ||
        item.usuario.toLowerCase().includes(query);
      
      const matchesOrigem = filterOrigem === "TODOS" || item.origem === filterOrigem;
      const matchesAcao = filterAcao === "TODOS" || item.tipoAcao === filterAcao;

      return matchesSearch && matchesOrigem && matchesAcao;
    });
    setFilteredList(result);
  }, [historyList, searchQuery, filterOrigem, filterAcao]);

  // Handle Clear Database
  const handleClearHistory = () => {
    if (confirm("⚠️ ATENÇÃO: Deseja realmente LIMPAR a Central Histórica de Vinhaça?\nEsta ação é irreversível e excluirá todos os snapshots salvos nesta máquina.")) {
      localStorage.removeItem("vinhaca_historico_db");
      setHistoryList([]);
      showToast("Central Histórica de dados redefinida com sucesso!");
    }
  };

  // Export database as CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      alert("Nenhum dado disponível para exportação na pesquisa de filtros atual.");
      return;
    }
    
    // Header
    let csvContent = "\ufeffIdentificador;Data/Hora;Origem;Açao;Frota;Detalhes;Usuario\n";
    
    // Rows
    filteredList.forEach(item => {
      const cam = item.caminhao || "-";
      const cleanedDet = item.detalhes.replace(/;/g, ",").replace(/\n/g, " ");
      csvContent += `${item.id};${item.timestamp};${item.origem};${item.tipoAcao};${cam};${cleanedDet};${item.usuario}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vinhaça_historico_banco_dados_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Planilha CSV exportada com sucesso!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[1000] bg-[#00843D] text-white font-extrabold text-xs uppercase px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-top duration-300">
          <Activity size={14} className="animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Database control header */}
      <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <h4 className="text-sm font-black text-[#005B2B] uppercase tracking-wide flex items-center gap-2">
            🗄️ Central de Dados Consolidada da Vinhaça
          </h4>
          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
            Snapshot de auditoria automática alimentada integralmente pela Central de Despacho, Apontamentos e Fechamento.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none bg-[#00843D] hover:bg-[#005B2B] text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm border border-emerald-600"
          >
            <FileSpreadsheet size={13} />
            Exportar Filtro (CSV)
          </button>
          <button
            onClick={handleClearHistory}
            className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <Trash2 size={13} />
            Limpar Central
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="bg-white border border-gray-150 p-4.5 rounded-2xl shadow-xs text-left grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por frota, detalhes do evento ou usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-9 text-xs font-bold outline-none focus:bg-white focus:border-[#00843D] transition text-[#334155]"
          />
        </div>

        {/* Filter Origin */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden lg:inline">Sistema:</span>
          <select
            value={filterOrigem}
            onChange={(e) => setFilterOrigem(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-black text-[#005B2B] outline-none cursor-pointer"
          >
            <option value="TODOS">Todas Origens</option>
            <option value="Despacho">Central de Despacho</option>
            <option value="Apontamento">Apontamento Diário</option>
            <option value="Níveis">Controle Níveis</option>
            <option value="Fechamento">Fechamento Unidade</option>
          </select>
        </div>

        {/* Filter Action */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden lg:inline">Ação:</span>
          <select
            value={filterAcao}
            onChange={(e) => setFilterAcao(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-black text-[#005B2B] outline-none cursor-pointer"
          >
            <option value="TODOS">Todas Ações</option>
            <option value="Inclusão">Inclusão</option>
            <option value="Edição">Edição</option>
            <option value="Exclusão">Exclusão</option>
            <option value="Despacho Rápido">Despacho Rápido</option>
            <option value="Boletim">Boletim / Fechamento</option>
          </select>
        </div>
      </div>

      {/* Table view of results */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 font-black uppercase text-[9px] w-[14%] border-r border-gray-100">ID Local</th>
                <th className="py-3 px-4 font-black uppercase text-[9px] w-[20%] border-r border-gray-100">Timestamp</th>
                <th className="py-3 px-4 font-black uppercase text-[9px] w-[15%] border-r border-gray-100">Módulo/Origem</th>
                <th className="py-3 px-4 font-black uppercase text-[9px] w-[15%] border-r border-gray-100">Ação Relatada</th>
                <th className="py-3 px-4 font-black uppercase text-[9px] border-r border-gray-100">Detalhamento Completo do Evento</th>
                <th className="py-3 px-4 font-black uppercase text-[9px] w-[15%]">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-bold bg-slate-50">
                    <AlertCircle className="mx-auto text-gray-300 mb-2" size={24} />
                    Nenhum registro de auditoria encontrado nos filtros atuais de vinhaça.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  // Badge helpers
                  const isDespacho = item.origem === "Despacho";
                  const isApontamento = item.origem === "Apontamento";
                  const isNiveis = item.origem === "Níveis";
                  const isFechamento = item.origem === "Fechamento";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 border-r border-gray-100 font-mono font-bold text-gray-400 text-[10px]">
                        {item.id}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-100 text-gray-650 font-bold font-mono">
                        {item.timestamp}
                      </td>
                      <td className="py-3 px-4 border-r border-gray-100">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-center ${
                          isDespacho ? "bg-emerald-50 text-[#00843D] border border-emerald-100" :
                          isApontamento ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                          isNiveis ? "bg-cyan-50 text-cyan-700 border border-cyan-100" :
                          "bg-purple-50 text-purple-700 border border-purple-100"
                        }`}>
                          {item.origem}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-gray-100">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          item.tipoAcao === "Inclusão" ? "bg-green-100/60 text-green-800" :
                          item.tipoAcao === "Edição" ? "bg-blue-100/60 text-blue-800" :
                          item.tipoAcao === "Exclusão" ? "bg-rose-100/60 text-rose-800" :
                          item.tipoAcao === "Despacho Rápido" ? "bg-amber-100/60 text-amber-800" :
                          "bg-purple-100/60 text-purple-800"
                        }`}>
                          {item.tipoAcao}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-gray-100 font-semibold text-[#0B1B3D] text-[11px] leading-relaxed">
                        {item.detalhes}
                        {item.caminhao && (
                          <span className="ml-2 font-mono text-[9px] bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded font-black uppercase">
                            Frota: {item.caminhao}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-emerald-800 font-black flex items-center gap-1.5 uppercase tracking-wide text-[9px]">
                        <User size={10} />
                        <span>{item.usuario.split("@")[0]}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
