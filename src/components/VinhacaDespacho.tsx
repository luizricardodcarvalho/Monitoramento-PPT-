import React, { useState } from "react";
import { 
  Truck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  ArrowLeft
} from "lucide-react";
import { registerVinhacaActivity, syncDespachoToApontamento } from "../lib/vinhacaSync";

interface DispatchTruck {
  id: string;
  caminhao: string;
  primeiroTanque: string;
  segundoTanque: string;
  cmAlocado: "Sta Rosa" | "Usina" | "Acorce" | "Leila" | "Olaria" | "-";
  condicao: "Livre" | "Em Rota" | "Rápido" | "Indisponível";
  frenteSituacao: string;
  dataHoraAlocacao: string;
  operacaoTempo: string; // Ex: Atrasado || 12:42:09 ou Parada em: Outros
  tempoHorario: string; // Tempo corrido ou hora estimada
}

export const VinhacaDespacho: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // Mock initial data based exactly on the requested excel screenshot but stripped of cards/drivers
  const [trucks, setTrucks] = useState<DispatchTruck[]>(() => {
    const saved = localStorage.getItem("vinhaca_despacho_trucks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use fallback initial list
      }
    }
    const initialList: DispatchTruck[] = [
      {
        id: "1",
        caminhao: "104.908",
        primeiroTanque: "226.688",
        segundoTanque: "226.689",
        cmAlocado: "Sta Rosa",
        condicao: "Em Rota",
        frenteSituacao: "51-3 Aspersão",
        dataHoraAlocacao: "19/05 - 05:59:39",
        operacaoTempo: "Atrasado || 12:42:09",
        tempoHorario: "15:17"
      },
    {
      id: "2",
      caminhao: "104.909",
      primeiroTanque: "226.672",
      segundoTanque: "226.675",
      cmAlocado: "Usina",
      condicao: "Em Rota",
      frenteSituacao: "54-4 Vln. Loc",
      dataHoraAlocacao: "19/05 - 05:59:03",
      operacaoTempo: "Normal",
      tempoHorario: "15:17"
    },
    {
      id: "3",
      caminhao: "104.910",
      primeiroTanque: "-",
      segundoTanque: "-",
      cmAlocado: "Usina",
      condicao: "Em Rota",
      frenteSituacao: "54-4 Vln. Loc",
      dataHoraAlocacao: "19/05 - 04:10:49",
      operacaoTempo: "Normal",
      tempoHorario: "17:05"
    },
    {
      id: "4",
      caminhao: "104.913",
      primeiroTanque: "-",
      segundoTanque: "-",
      cmAlocado: "Acorce",
      condicao: "Em Rota",
      frenteSituacao: "54-1 Vln. Loc",
      dataHoraAlocacao: "19/05 - 06:05:42",
      operacaoTempo: "Atrasado || 14:01:05",
      tempoHorario: "15:11"
    },
    {
      id: "5",
      caminhao: "104.916",
      primeiroTanque: "226.579",
      segundoTanque: "226.598",
      cmAlocado: "Sta Rosa",
      condicao: "Livre",
      frenteSituacao: "51-3 Aspersão",
      dataHoraAlocacao: "19/05 - 04:22:29",
      operacaoTempo: "Parada em: Outros",
      tempoHorario: "16:54"
    },
    {
      id: "6",
      caminhao: "104.917",
      primeiroTanque: "-",
      segundoTanque: "-",
      cmAlocado: "Sta Rosa",
      condicao: "Indisponível",
      frenteSituacao: "Outros",
      dataHoraAlocacao: "19/05 - 04:20:47",
      operacaoTempo: "Parada em: Outros",
      tempoHorario: "16:56"
    },
    {
      id: "7",
      caminhao: "104.918",
      primeiroTanque: "226.614",
      segundoTanque: "224.522",
      cmAlocado: "Usina",
      condicao: "Em Rota",
      frenteSituacao: "54-4 Vln. Loc",
      dataHoraAlocacao: "19/05 - 05:58:39",
      operacaoTempo: "Normal",
      tempoHorario: "15:18"
    },
    {
      id: "8",
      caminhao: "104.919",
      primeiroTanque: "226.610",
      segundoTanque: "226.626",
      cmAlocado: "Acorce",
      condicao: "Em Rota",
      frenteSituacao: "54-1 Vln. Loc",
      dataHoraAlocacao: "19/05 - 06:32:18",
      operacaoTempo: "Atrasado || 13:34:29",
      tempoHorario: "14:44"
    },
    {
      id: "9",
      caminhao: "104.920",
      primeiroTanque: "226.692",
      segundoTanque: "226.693",
      cmAlocado: "Usina",
      condicao: "Em Rota",
      frenteSituacao: "54-4 Vln. Loc",
      dataHoraAlocacao: "19/05 - 06:44:38",
      operacaoTempo: "Atrasado || 11:57:09",
      tempoHorario: "14:32"
    },
    {
      id: "10",
      caminhao: "104.921",
      primeiroTanque: "-",
      segundoTanque: "-",
      cmAlocado: "Sta Rosa",
      condicao: "Indisponível",
      frenteSituacao: "Outros",
      dataHoraAlocacao: "19/05 - 04:17:13",
      operacaoTempo: "Parada em: Outros",
      tempoHorario: "16:59"
    },
    {
      id: "11",
      caminhao: "104.924",
      primeiroTanque: "226.612",
      segundoTanque: "226.577",
      cmAlocado: "Acorce",
      condicao: "Em Rota",
      frenteSituacao: "54-1 Vln. Loc",
      dataHoraAlocacao: "17/05 - 03:06:30",
      operacaoTempo: "Atrasado || 17:00:17",
      tempoHorario: "18:10"
    },
    {
      id: "12",
      caminhao: "104.823",
      primeiroTanque: "-",
      segundoTanque: "-",
      cmAlocado: "-",
      condicao: "Livre",
      frenteSituacao: "Carregando",
      dataHoraAlocacao: "25/04 - 16:40:45",
      operacaoTempo: "Parada em: Carregando",
      tempoHorario: "04:36"
    },
    {
      id: "13",
      caminhao: "104.911",
      primeiroTanque: "-",
      segundoTanque: "-",
      cmAlocado: "Acorce",
      condicao: "Indisponível",
      frenteSituacao: "Manutenção",
      dataHoraAlocacao: "17/05 - 17:47:40",
      operacaoTempo: "Parada em: Manutenção",
      tempoHorario: "03:29"
    }
    ];
    localStorage.setItem("vinhaca_despacho_trucks", JSON.stringify(initialList));
    return initialList;
  });

  const updateTrucksList = (newList: DispatchTruck[], actionDetails?: {
    tipoAcao: 'Inclusão' | 'Edição' | 'Exclusão' | 'Despacho Rápido';
    detalhes: string;
    caminhao?: string;
  }) => {
    setTrucks(newList);
    localStorage.setItem("vinhaca_despacho_trucks", JSON.stringify(newList));
    // Auto-sync Central de Despacho with Apontamento database
    syncDespachoToApontamento();
    if (actionDetails) {
      registerVinhacaActivity({
        origem: 'Despacho',
        tipoAcao: actionDetails.tipoAcao,
        caminhao: actionDetails.caminhao,
        detalhes: actionDetails.detalhes
      });
    } else {
      window.dispatchEvent(new Event("vinhaca_despacho_changed"));
    }
  };

  // UI Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCM, setFilterCM] = useState<string>("TODOS");
  const [filterSituacao, setFilterSituacao] = useState<string>("TODOS");

  // Inline item editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<DispatchTruck>>({});

  // Add new truck state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTruck, setNewTruck] = useState({
    caminhao: "",
    primeiroTanque: "",
    segundoTanque: "",
    cmAlocado: "Usina" as any,
    condicao: "Em Rota" as any,
    frenteSituacao: "54-4 Vln. Loc",
    operacaoTempo: "Normal",
    tempoHorario: "15:00"
  });

  // Unique lists for dropdown filters
  const cms = ["TODOS", "Usina", "Sta Rosa", "Acorce", "Leila", "Olaria", "-"];
  const situacoes = ["TODOS", "54-4 Vln. Loc", "54-1 Vln. Loc", "51-3 Aspersão", "Carregando", "Manutenção", "Outros"];

  // Handle CM change instantly - with automatic Frente / Situação mapping
  const handleCMChange = (id: string, newCM: "Sta Rosa" | "Usina" | "Acorce" | "Leila" | "Olaria" | "-") => {
    const truck = trucks.find(t => t.id === id);
    if (!truck) return;
    let newFrente = truck.frenteSituacao;
    if (newCM === "Usina") {
      newFrente = "54-4 Vln. Loc";
    } else if (newCM === "Sta Rosa") {
      newFrente = "51-3 Aspersão";
    } else if (newCM === "Acorce") {
      newFrente = "54-1 Vln. Loc";
    } else if (newCM === "Leila") {
      newFrente = "Carregando";
    } else if (newCM === "Olaria" || newCM === "-") {
      newFrente = "Outros";
    }
    const nextList = trucks.map(t => (t.id === id ? { ...t, cmAlocado: newCM, frenteSituacao: newFrente } : t));
    updateTrucksList(nextList, {
      tipoAcao: 'Edição',
      caminhao: truck.caminhao,
      detalhes: `Mudança rápida de Parceiro da frota ${truck.caminhao} para ${newCM} (Frente: ${newFrente}).`
    });
  };

  // Handle Quick Dispatch (saída) - Updates allocation date/time to now
  const handleQuickDispatch = (id: string) => {
    const d = new Date();
    const formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    const truck = trucks.find(t => t.id === id);
    if (!truck) return;
    const nextList = trucks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          dataHoraAlocacao: formattedDate,
          operacaoTempo: "Normal",
          tempoHorario: "00:00"
        };
      }
      return t;
    });
    updateTrucksList(nextList, {
      tipoAcao: 'Despacho Rápido',
      caminhao: truck.caminhao,
      detalhes: `Despacho rápido realizado para a frota ${truck.caminhao} às ${d.toLocaleTimeString("pt-BR")}.`
    });
  };

  const handleStartEdit = (truck: DispatchTruck) => {
    setEditingId(truck.id);
    setEditFormData(truck);
  };

  const handleSaveEdit = (id: string) => {
    const truck = trucks.find(t => t.id === id);
    if (!truck) return;
    const nextList = trucks.map(t => (t.id === id ? { ...t, ...editFormData } : t));
    updateTrucksList(nextList, {
      tipoAcao: 'Edição',
      caminhao: truck.caminhao,
      detalhes: `Parâmetros editados na Central de Despacho para a frota ${truck.caminhao}.`
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const truck = trucks.find(t => t.id === id);
    if (!truck) return;
    const nextList = trucks.filter(t => t.id !== id);
    updateTrucksList(nextList, {
      tipoAcao: 'Exclusão',
      caminhao: truck.caminhao,
      detalhes: `Frota ${truck.caminhao} excluída permanentemente da listagem de despacho.`
    });
  };

  const handleAddNewTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruck.caminhao) {
      alert("Por favor, digite o número da Frota.");
      return;
    }

    const d = new Date();
    const formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

    const newlyCreated: DispatchTruck = {
      id: Math.random().toString(),
      caminhao: newTruck.caminhao,
      primeiroTanque: newTruck.primeiroTanque || "-",
      segundoTanque: newTruck.segundoTanque || "-",
      cmAlocado: newTruck.cmAlocado,
      condicao: newTruck.condicao,
      frenteSituacao: newTruck.frenteSituacao,
      dataHoraAlocacao: formattedDate,
      operacaoTempo: newTruck.operacaoTempo,
      tempoHorario: newTruck.tempoHorario
    };

    const nextList = [newlyCreated, ...trucks];
    updateTrucksList(nextList, {
      tipoAcao: 'Inclusão',
      caminhao: newlyCreated.caminhao,
      detalhes: `Nova viagem registrada para frota ${newlyCreated.caminhao} no parceiro ${newlyCreated.cmAlocado} (Frente: ${newlyCreated.frenteSituacao}).`
    });
    setShowAddForm(false);
    // Reset form
    setNewTruck({
      caminhao: "",
      primeiroTanque: "",
      segundoTanque: "",
      cmAlocado: "Usina",
      condicao: "Em Rota",
      frenteSituacao: "54-4 Vln. Loc",
      operacaoTempo: "Normal",
      tempoHorario: "15:00"
    });
  };

  // Filter logic based on Frota number
  const filteredTrucks = trucks.filter(t => {
    const matchesSearch = t.caminhao.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCM = filterCM === "TODOS" || t.cmAlocado === filterCM;
    const matchesSituacao = filterSituacao === "TODOS" || t.frenteSituacao.includes(filterSituacao) || (filterSituacao === "Outros" && t.frenteSituacao === "Outros");
    return matchesSearch && matchesCM && matchesSituacao;
  });

  // Totals for metrics bar (using exclusively Colombo Green palette)
  const totalFrota = trucks.length;
  const emTransito = trucks.filter(t => t.frenteSituacao.includes("Vln. Loc") || t.frenteSituacao.includes("Aspersão")).length;
  const emCarregamento = trucks.filter(t => t.frenteSituacao === "Carregando" || t.frenteSituacao === "Ag. Carregamento").length;
  const emManutencaoNum = trucks.filter(t => t.frenteSituacao === "Manutenção").length;

  return (
    <div className="bg-[#FAFDFB] p-2 sm:p-6 rounded-3xl border border-[#00843D]/25 shadow-sm space-y-6 font-sans">
      
      {/* 1. Integrated Actions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#00843D]/10 shadow-sm text-left">
        <div className="flex items-start gap-3">
          <button
            onClick={onClose}
            className="bg-white hover:bg-[#e2f5e5] text-[#00843D] border-2 border-[#00843D]/20 px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            Voltar
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="p-1 bg-[#e2f5e5] text-[#00843D] rounded-lg">
                <Truck size={18} className="stroke-[2.5]" />
              </span>
              <h3 className="text-sm font-black text-[#005B2B] uppercase tracking-wide">
                Controle de Despacho de Fertirrigação — SmartFlow
              </h3>
            </div>
            <p className="text-[11px] text-[#00843D]/80 font-semibold mt-0.5 ml-8">
              Gerencie a alocação de frotas tanque, tanques auxiliares e sequências de despacho com precisão.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full md:w-auto bg-[#00843D] hover:bg-[#005B2B] text-white flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 border-2 border-[#005B2B]"
          >
            {showAddForm ? <X size={14} className="stroke-[3]" /> : <Plus size={14} className="stroke-[3]" />}
            <span>{showAddForm ? "Fechar Cadastro" : "Cadastrar Viagem"}</span>
          </button>
        </div>
      </div>

      {/* 2. Operational Metrics Grid - Designed with clean, high-contrast Colombo Greens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        <div className="bg-white border border-[#00843D]/20 p-4.5 rounded-2xl shadow-sm">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Frota Total Monitorada</span>
          <span className="text-2xl font-black text-[#005B2B] block mt-1">{totalFrota} Tanques</span>
          <span className="text-[10px] text-emerald-800 bg-[#e2f5e5] font-black px-1.5 py-0.5 rounded mt-3 inline-block">100% Ativa</span>
        </div>
        <div className="bg-white border border-[#00843D]/20 p-4.5 rounded-2xl shadow-sm">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Frotas em Rota</span>
          <span className="text-2xl font-black text-[#00843D] block mt-1">{emTransito} Unidades</span>
          <span className="text-[10px] text-slate-500 font-bold mt-2.5 block">Aplicando Fertirrigação</span>
        </div>
        <div className="bg-white border border-[#00843D]/20 p-4.5 rounded-2xl shadow-sm">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">No Carregador / Pátio</span>
          <span className="text-2xl font-black text-[#005B2B] block mt-1">{emCarregamento} Tanques</span>
          <span className="text-[10px] text-emerald-800 bg-[#e2f5e5] font-black px-1.5 py-0.5 rounded mt-3 inline-block">Fluxo Estável</span>
        </div>
        {/* RENAMED TO "AVL" BY USER REQUEST */}
        <div className="bg-white border border-[#00843D]/20 p-4.5 rounded-2xl shadow-sm">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">AVL</span>
          <span className="text-2xl font-black text-[#005B2B] block mt-1">{emManutencaoNum} Equipamentos</span>
          <span className="text-[10px] text-slate-500 font-bold mt-2.5 block">Monitoramento Ativo</span>
        </div>
      </div>

      {/* 3. Register Truck Overlay / Dropdown form (Stripped of Cards and Drivers by user request) */}
      {showAddForm && (
        <form onSubmit={handleAddNewTruck} className="bg-[#e2f5e5]/30 border-2 border-[#00843D]/25 p-5 rounded-2xl text-left gap-4 grid grid-cols-1 md:grid-cols-5 animate-in slide-in-from-top duration-300">
          <div className="md:col-span-5 border-b border-[#00843D]/20 pb-2">
            <h4 className="text-xs font-black text-[#005B2B] uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-[#00843D]" /> Cadastrar Nova Viagem / Carregamento
            </h4>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Prefix da Frota *</label>
            <input 
              type="text" 
              placeholder="Ex: 104.912" 
              required
              value={newTruck.caminhao}
              onChange={(e) => setNewTruck(p => ({ ...p, caminhao: e.target.value }))}
              className="w-full bg-white border border-[#00843D]/30 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/40"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Parceiro / CM Alocado</label>
            <select 
              value={newTruck.cmAlocado}
              onChange={(e) => {
                const selectedCM = e.target.value as any;
                // Auto change Frente / Situação based on CM Alocado selection!
                let defaultFrente = "Outros";
                if (selectedCM === "Usina") defaultFrente = "54-4 Vln. Loc";
                else if (selectedCM === "Sta Rosa") defaultFrente = "51-3 Aspersão";
                else if (selectedCM === "Acorce") defaultFrente = "54-1 Vln. Loc";
                else if (selectedCM === "Leila") defaultFrente = "Carregando";
                else if (selectedCM === "Olaria") defaultFrente = "Outros";

                setNewTruck(p => ({ 
                  ...p, 
                  cmAlocado: selectedCM,
                  frenteSituacao: defaultFrente
                }));
              }}
              className="w-full bg-white border border-[#00843D]/30 rounded-xl p-2.5 text-xs font-bold text-gray-800"
            >
              <option value="Usina">Usina Colombo</option>
              <option value="Sta Rosa">Santa Rosa</option>
              <option value="Acorce">Acorce</option>
              <option value="Leila">Leila Transportes</option>
              <option value="Olaria">Olaria</option>
              <option value="-">Indefinido</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Frente ou Situação</label>
            <select 
              value={newTruck.frenteSituacao}
              onChange={(e) => setNewTruck(p => ({ ...p, frenteSituacao: e.target.value }))}
              className="w-full bg-white border border-[#00843D]/30 rounded-xl p-2.5 text-xs font-bold text-gray-800"
            >
              {situacoes.slice(1).map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">1º Tanque (Código)</label>
            <input 
              type="text" 
              placeholder="Ex: 226.581" 
              value={newTruck.primeiroTanque}
              onChange={(e) => setNewTruck(p => ({ ...p, primeiroTanque: e.target.value }))}
              className="w-full bg-white border border-[#00843D]/30 rounded-xl p-2.5 text-xs font-bold text-gray-800"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">2º Tanque (Código)</label>
            <input 
              type="text" 
              placeholder="Ex: 226.582" 
              value={newTruck.segundoTanque}
              onChange={(e) => setNewTruck(p => ({ ...p, segundoTanque: e.target.value }))}
              className="w-full bg-white border border-[#00843D]/30 rounded-xl p-2.5 text-xs font-bold text-gray-800"
            />
          </div>

          <div className="md:col-span-5 flex items-end justify-end">
            <button 
              type="submit"
              className="w-full md:w-auto px-10 bg-[#00843D] hover:bg-[#005B2B] text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl shadow transition"
            >
              Gravar Viagem
            </button>
          </div>
        </form>
      )}

      {/* 4. Telemetry Filtering Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-left">
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Pesquisar por frota ou tanque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-2 px-9 text-xs font-bold outline-none focus:bg-white focus:border-[#00843D] transition"
            />
          </div>

          {/* CM Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Parceiro:</span>
            <select
              value={filterCM}
              onChange={(e) => setFilterCM(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-black text-[#005B2B] outline-none"
            >
              {cms.map((cm, idx) => (
                <option key={idx} value={cm}>{cm === "TODOS" ? "Todos Parceiros" : cm}</option>
              ))}
            </select>
          </div>

          {/* Frente Filter Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline">Situação:</span>
            <select
              value={filterSituacao}
              onChange={(e) => setFilterSituacao(e.target.value)}
              className="bg-slate-50 border border-gray-200 rounded-xl py-2 px-3 text-xs font-black text-[#005B2B] outline-none"
            >
              {situacoes.map((sit, idx) => (
                <option key={idx} value={sit}>{sit === "TODOS" ? "Todas Situações" : sit}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info label */}
        <div className="hidden lg:block text-right shrink-0">
          <span className="text-[10px] font-black text-emerald-800 bg-[#e2f5e5] px-3 py-1.5 rounded-lg border border-[#00843D]/10">
            Mostrando {filteredTrucks.length} de {trucks.length} tanques
          </span>
        </div>
      </div>

      {/* 5. Majestic Dispatch Table */}
      <div className="bg-white border border-[#00843D]/15 rounded-2xl shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-sans text-left border-collapse">
            <thead>
              <tr className="bg-[#00843D] text-white border-b border-[#005B2B]">
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] text-center border-r border-[#005B2B]/40">Frota</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] text-center border-r border-[#005B2B]/40">1º Tanque</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] text-center border-r border-[#005B2B]/40">2º Tanque</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] text-center border-r border-[#005B2B]/40">CM Alocado</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] border-r border-[#005B2B]/40">Frente / Situação</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] border-r border-[#005B2B]/40">Alocada em</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] border-r border-[#005B2B]/40">Operação / Tempo</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] text-center border-r border-[#005B2B]/40">Tempo Horário</th>
                <th className="py-3 px-3 font-black uppercase tracking-wider text-[10px] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTrucks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 font-bold bg-slate-50">
                    <AlertCircle size={28} className="mx-auto text-gray-400/80 mb-2" />
                    Nenhuma frota de vinhaça encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTrucks.map((truck) => {
                  const isEditing = editingId === truck.id;
                  
                  // Color codes transformed strictly into system Colombo Green tones
                  // Delay operation
                  const isAtrasado = truck.operacaoTempo.toLowerCase().includes("atrasado");
                  const isParada = truck.operacaoTempo.toLowerCase().includes("parada");

                  return (
                    <tr 
                      key={truck.id} 
                      className={`hover:bg-[#e2f5e5]/10 transition-colors ${
                        isAtrasado ? "bg-red-500/[0.02]" : isParada ? "bg-[#e2f5e5]/20" : ""
                      }`}
                    >
                      {/* FROTA (NO UNDERLINE AS REQUESTED BY USER) */}
                      <td className="py-3 px-2 border-r border-gray-100 text-center font-mono font-black text-[#005B2B]">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-16 bg-white border border-gray-300 rounded text-center p-1 text-xs font-black text-gray-800"
                            value={editFormData.caminhao || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, caminhao: e.target.value })}
                          />
                        ) : (
                          <span className="hover:text-[#00843D] cursor-pointer" title="Clique para abrir telemetria">
                            {truck.caminhao}
                          </span>
                        )}
                      </td>

                      {/* 1o TANQUE */}
                      <td className="py-3 px-2 border-r border-gray-100 text-center font-mono text-gray-500 font-semibold">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-16 bg-white border border-gray-300 rounded text-center p-1"
                            value={editFormData.primeiroTanque || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, primeiroTanque: e.target.value })}
                          />
                        ) : (
                          truck.primeiroTanque || "-"
                        )}
                      </td>

                      {/* 2o TANQUE */}
                      <td className="py-3 px-2 border-r border-gray-100 text-center font-mono text-gray-500 font-semibold">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-16 bg-white border border-gray-300 rounded text-center p-1"
                            value={editFormData.segundoTanque || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, segundoTanque: e.target.value })}
                          />
                        ) : (
                          truck.segundoTanque || "-"
                        )}
                      </td>

                      {/* CM ALOCADO - INSTANT PICKER FROM BELOW ALREADY REGISTERED */}
                      <td className="py-3 px-2 border-r border-gray-100 text-center">
                        <div className="relative inline-block w-full min-w-[120px]">
                          <select 
                            className="w-full bg-[#f4faf6] border border-[#00843D]/30 hover:border-[#00843D] text-[#005B2B] font-black text-[11px] uppercase tracking-wide rounded-lg px-2.5 py-1.5 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00843D]/40 transition-all pr-8"
                            value={isEditing ? (editFormData.cmAlocado || "") : truck.cmAlocado}
                            onChange={(e) => {
                              const selectedVal = e.target.value as any;
                              if (isEditing) {
                                // Auto change Frente / Situação based on CM Alocado selection!
                                let defaultFrente = "Outros";
                                if (selectedVal === "Usina") defaultFrente = "54-4 Vln. Loc";
                                else if (selectedVal === "Sta Rosa") defaultFrente = "51-3 Aspersão";
                                else if (selectedVal === "Acorce") defaultFrente = "54-1 Vln. Loc";
                                else if (selectedVal === "Leila") defaultFrente = "Carregando";
                                else if (selectedVal === "Olaria") defaultFrente = "Outros";

                                setEditFormData({ 
                                  ...editFormData, 
                                  cmAlocado: selectedVal,
                                  frenteSituacao: defaultFrente
                                });
                              } else {
                                handleCMChange(truck.id, selectedVal);
                              }
                            }}
                          >
                            <option value="Usina">Usina</option>
                            <option value="Sta Rosa">Sta Rosa</option>
                            <option value="Acorce">Acorce</option>
                            <option value="Leila">Leila</option>
                            <option value="Olaria">Olaria</option>
                            <option value="-">-</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-[#00843D]">
                            <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </div>
                      </td>

                      {/* FRENTE / SITUACAO - AUTO UPDATED UPON CM ALOCADO SELECTION */}
                      <td className="py-3 px-3 border-r border-gray-100 font-semibold text-slate-800">
                        {isEditing ? (
                          <select 
                            className="w-full bg-white border border-gray-300 rounded p-1 text-xs font-semibold"
                            value={editFormData.frenteSituacao || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, frenteSituacao: e.target.value })}
                          >
                            {situacoes.slice(1).map((s, idx) => (
                              <option key={idx} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00843D]"></span>
                            <span className="font-bold text-gray-800">{truck.frenteSituacao}</span>
                          </span>
                        )}
                      </td>

                      {/* ALOCADA EM */}
                      <td className="py-3 px-3 border-r border-gray-100 font-mono text-gray-400 font-semibold text-[10px]">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-300 rounded p-1 text-[10px]"
                            value={editFormData.dataHoraAlocacao || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, dataHoraAlocacao: e.target.value })}
                          />
                        ) : (
                          truck.dataHoraAlocacao
                        )}
                      </td>

                      {/* OPERACAO / TEMPO */}
                      <td className="py-3 px-3 border-r border-gray-100">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-full bg-white border border-gray-300 rounded p-1 text-xs"
                            value={editFormData.operacaoTempo || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, operacaoTempo: e.target.value })}
                          />
                        ) : (
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-[10px] uppercase border ${
                            isAtrasado 
                              ? "bg-slate-900 text-[#00843D] border-slate-950" 
                              : isParada 
                              ? "bg-[#e2f5e5] text-[#00843D] border-[#00843D]/25 font-bold" 
                              : "bg-white text-[#005B2B] border-gray-100"
                          }`}>
                            {truck.operacaoTempo}
                          </span>
                        )}
                      </td>

                      {/* TEMPO / HORARIO */}
                      <td className="py-3 px-2 border-r border-gray-100 text-center font-mono font-bold text-slate-800">
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="w-16 bg-white border border-gray-300 rounded text-center p-1"
                            value={editFormData.tempoHorario || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, tempoHorario: e.target.value })}
                          />
                        ) : (
                          truck.tempoHorario
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={() => handleSaveEdit(truck.id)}
                                className="bg-[#00843D] hover:bg-[#005B2B] text-white p-1.5 rounded-lg active:scale-95 shadow-sm transition"
                                title="Gravar"
                              >
                                <Check size={12} className="stroke-[3]" />
                              </button>
                              <button 
                                onClick={() => setEditingId(null)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded-lg active:scale-95 transition"
                                title="Cancelar"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Quick Dispatch trigger action */}
                              <button 
                                onClick={() => handleQuickDispatch(truck.id)}
                                className="bg-[#e2f5e5] hover:bg-[#00843D] text-[#00843D] hover:text-white p-1.5 rounded-lg active:scale-95 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mr-1 border border-[#00843D]/30"
                                title="Registrar Despacho / Saída rápida"
                              >
                                <Clock size={11} className="stroke-[2.5]" />
                                Despachar
                              </button>
                              <button 
                                onClick={() => handleStartEdit(truck)}
                                className="bg-slate-50 hover:bg-[#e2f5e5] border border-gray-200 text-slate-700 p-1.5 rounded-lg active:scale-95 transition"
                                title="Editar"
                              >
                                <Edit2 size={12} className="stroke-[2.5]" />
                              </button>
                              <button 
                                onClick={() => handleDelete(truck.id)}
                                className="bg-red-550/10 hover:bg-red-550 hover:text-white text-red-550 p-1.5 rounded-lg active:scale-95 transition"
                                title="Excluir"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
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
