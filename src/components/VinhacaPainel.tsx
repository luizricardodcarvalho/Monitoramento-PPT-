import React, { useState } from "react";
import { Activity, Edit2, Check, RefreshCw, Sliders, ArrowLeft, Info, Eye, ShieldCheck, Truck, ListCollapse } from "lucide-react";

interface PtCaminhoes {
  usina: number;
  acorce: number;
  leila: number;
  olaria: number;
  staRosa: number;
}

export const VinhacaPainel = React.memo<{ onClose: () => void }>(({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);

  // Panel State Variables (Pre-populated with exact values from the images)
  const [vazaoVinhaca, setVazaoVinhaca] = useState<number>(280);
  const [subindoEm, setSubindoEm] = useState<string>("-280 M³");
  
  // High-End Operational Values
  const [necessidadeCMRetirar, setNecessidadeCMRetirar] = useState<number>(10);
  const [necessidadeCMManter, setNecessidadeCMManter] = useState<number>(10);
  const [necessidadeCMLimite, setNecessidadeCMLimite] = useState<number>(9);
  const [necessidadeAvlRolo, setNecessidadeAvlRolo] = useState<number>(3);
  const [litrosRetirados, setLitrosRetirados] = useState<string>("1.920.000 L");
  const [litrosLancados, setLitrosLancados] = useState<string>("2.385.000 L");
  const [necessidadeTanques, setNecessidadeTanques] = useState<number>(20);
  const [tanquesTrabalhando, setTanquesTrabalhando] = useState<number>(42);
  const [tanquesParados, setTanquesParados] = useState<number>(14);
  const [raioMedioAtendido, setRaioMedioAtendido] = useState<number>(13);

  // Left Telemetry Column list values
  const [medias, setMedias] = useState<string[]>([
    "45 m³",      // #1: Carregamento Médio
    "8 min",      // #2: Espera na Fila
    "7 min",      // #3: Carregamento Ativo
    "31 min",     // #4: Trajeto Carregado
    "190 m³/h",   // #5: Produtividade Média
    "0 min",      // #6: Espera no Destino
    "13 min",     // #7: Tempo Descarregando
    "45 min",     // #8: Trajeto Vazio Retorno
    "26 min",     // #9: Intervalo Médio Despachos
    "40 min",     // #10: Tempo Parada Operacional
    "25 min",     // #11: Tempo de Manobra
    "6 min",      // #12: Intervalo entre Frentes
    "39 min",     // #13: Tempo de Espera Estação
    "30 min",     // #14: Tempo de Abastecimento
    "45 min",     // #15: Tempo Limpeza Filtros
    "20 min",     // #16: Manutenção Preventiva
    "50 min"      // #17: Refeição/Troca Turno
  ]);

  const [idxAderencia, setIdxAderencia] = useState<string>("50,0%");
  const [eficienciaCaminhoes, setEficienciaCaminhoes] = useState<string>("35%");

  const [quantidadesCaminhoes, setQuantidadesCaminhoes] = useState<PtCaminhoes>({
    usina: 9,
    acorce: 7,
    leila: 0,
    olaria: 0,
    staRosa: 6
  });

  const [sequencia, setSequencia] = useState<number[]>([1, 2, 3, 4, 6, 7, 8]);

  // Helper labels for the left medias column
  const labelsMedias = [
    "Carregamento Médio",
    "Tempo de Fila",
    "Carregamento Ativo",
    "Trajeto Carregado",
    "Produtividade Média",
    "Espera Descarregamento",
    "Tempo Descarregando",
    "Trajeto Vazio Retorno",
    "Intervalo Despacho",
    "Parada Operacional",
    "Tempo de Manobra",
    "Interv. entre Frentes",
    "Tempo Espera Estação",
    "Tempo Abastecimento",
    "Limpeza de Filtros",
    "Manutenção do Tanque",
    "Refeição/Troca Turno"
  ];

  const updateMediaValue = (index: number, value: string) => {
    const updated = [...medias];
    updated[index] = value;
    setMedias(updated);
  };

  const handleAutoCalc = () => {
    setSubindoEm(`-${vazaoVinhaca} M³`);
    const scale = vazaoVinhaca / 280;
    setNecessidadeCMRetirar(Math.round(10 * scale));
    setNecessidadeCMManter(Math.round(10 * scale));
    setNecessidadeCMLimite(Math.round(9 * scale));
    setNecessidadeAvlRolo(Math.round(3 * scale));
    
    const baseRetirados = 1920000;
    const baseLancados = 2385000;
    setLitrosRetirados(`${Math.round(baseRetirados * scale).toLocaleString("pt-BR")} L`);
    setLitrosLancados(`${Math.round(baseLancados * scale).toLocaleString("pt-BR")} L`);
    setNecessidadeTanques(Math.round(20 * scale));
    setTanquesTrabalhando(Math.round(42 * scale));
  };

  return (
    <div className="bg-[#FAFDFB] p-2 sm:p-6 rounded-3xl border border-[#00843D]/25 shadow-sm space-y-6 font-sans">
      
      {/* 1. Header of the Dashboard Pane */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-[#00843D]/10 shadow-sm">
        <div className="text-left flex items-start gap-3">
          <button
            id="btn-vinhaca-painel-voltar"
            onClick={onClose}
            className="bg-white hover:bg-[#e2f5e5] text-[#00843D] border-2 border-[#00843D]/20 px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={14} className="stroke-[3]" />
            Voltar
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="p-1 bg-[#e2f5e5] text-[#00843D] rounded-lg">
                <Activity size={18} className="stroke-[3]" />
              </span>
              <h3 className="text-sm font-black text-[#005B2B] uppercase tracking-wide">
                Painel Integrado de Telemetria — Vinhaça SmartFlow
              </h3>
            </div>
            <p className="text-[11px] text-[#00843D]/80 font-semibold mt-0.5 ml-8">
              Mapeamento de telemetria de fertirrigação em tempo real seguindo o padrão de tons Colombo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Quick Info Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00843D] bg-[#e2f5e5] px-3.5 py-2.5 rounded-xl border border-[#00843D]/20">
            <ShieldCheck size={14} className="text-[#00843D]" />
            <span>Sistema Conectado</span>
          </div>

          {/* Edit toggle button */}
          <button
            id="btn-painel-edit-toggle"
            onClick={() => setIsEditing(!isEditing)}
            className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition active:scale-95 border-2 ${
              isEditing 
                ? "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white" 
                : "bg-[#00843D] hover:bg-[#005B2B] border-[#005B2B] text-white"
            }`}
          >
            {isEditing ? <Check size={14} className="stroke-[3]" /> : <Edit2 size={14} className="stroke-[2.5]" />}
            <span>{isEditing ? "Salvar Alterações" : "Ajustar Valores"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* EDITING INTERFACE / SIDEBAR DRAWER */}
        {isEditing && (
          <div className="xl:col-span-4 bg-[#e2f5e5]/40 border-2 border-[#00843D]/20 rounded-2xl p-4 md:p-5 space-y-4 text-left animate-in fade-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between border-b border-[#00843D]/20 pb-3">
              <h4 className="font-extrabold text-xs text-[#005B2B] uppercase tracking-wider flex items-center gap-2">
                <Sliders size={16} className="text-[#00843D]" /> Editar Parâmetros do Painel
              </h4>
              <button 
                onClick={handleAutoCalc}
                className="bg-white hover:bg-[#e2f5e5] border border-[#00843D]/40 text-[#00843D] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                title="Sincronizar cálculos com base na vazão vinhaça atual"
              >
                <RefreshCw size={11} className="stroke-[2.5]" /> Auto-Calcular
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              {/* Seção 1 */}
              <div>
                <span className="block text-[10px] font-black text-[#005B2B] uppercase tracking-wider mb-2 border-l-2 border-[#00843D] pl-1.5">Gerais & Vazão</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Vazão Vinhaça (m³/h)</label>
                    <input
                      type="number"
                      value={vazaoVinhaca}
                      onChange={(e) => setVazaoVinhaca(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/30 focus:border-[#00843D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subindo em</label>
                    <input
                      type="text"
                      value={subindoEm}
                      onChange={(e) => setSubindoEm(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/30 focus:border-[#00843D]"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2 */}
              <div>
                <span className="block text-[10px] font-black text-[#005B2B] uppercase tracking-wider mb-2 border-l-2 border-[#00843D] pl-1.5">Necessidades de Atendimento (CM)</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CM (Retirar Vazão)</label>
                    <input
                      type="number"
                      value={necessidadeCMRetirar}
                      onChange={(e) => setNecessidadeCMRetirar(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/30 focus:border-[#00843D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CM (Manter Frentes)</label>
                    <input
                      type="number"
                      value={necessidadeCMManter}
                      onChange={(e) => setNecessidadeCMManter(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/30 focus:border-[#00843D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CM (Limite Carregam.)</label>
                    <input
                      type="number"
                      value={necessidadeCMLimite}
                      onChange={(e) => setNecessidadeCMLimite(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/30 focus:border-[#00843D]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CM (AVL / Rolo)</label>
                    <input
                      type="number"
                      value={necessidadeAvlRolo}
                      onChange={(e) => setNecessidadeAvlRolo(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]/30 focus:border-[#00843D]"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3 */}
              <div>
                <span className="block text-[10px] font-black text-[#005B2B] uppercase tracking-wider mb-2 border-l-2 border-[#00843D] pl-1.5">Acúmulo de Volume & Raio</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Litros Retirados</label>
                    <input
                      type="text"
                      value={litrosRetirados}
                      onChange={(e) => setLitrosRetirados(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Litros Lançados</label>
                    <input
                      type="text"
                      value={litrosLancados}
                      onChange={(e) => setLitrosLancados(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Raio Médio (Km)</label>
                    <input
                      type="number"
                      value={raioMedioAtendido}
                      onChange={(e) => setRaioMedioAtendido(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Necessidade Tanques</label>
                    <input
                      type="number"
                      value={necessidadeTanques}
                      onChange={(e) => setNecessidadeTanques(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4 */}
              <div>
                <span className="block text-[10px] font-black text-[#005B2B] uppercase tracking-wider mb-2 border-l-2 border-[#00843D] pl-1.5">Rendimento & Frota Ativa</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Aderência Despacho</label>
                    <input
                      type="text"
                      value={idxAderencia}
                      onChange={(e) => setIdxAderencia(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Eficiência Geral</label>
                    <input
                      type="text"
                      value={eficienciaCaminhoes}
                      onChange={(e) => setEficienciaCaminhoes(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#00843D]/25 space-y-2 mt-3">
                  <span className="block text-[9px] font-black uppercase text-[#005B2B] tracking-wider">Tanques Vinhaça Fixos</span>
                  <div className="grid grid-cols-5 gap-1 text-center font-bold text-[10px]">
                    <div>
                      <label className="block text-gray-500 mb-0.5">Usi</label>
                      <input
                        type="number"
                        value={quantidadesCaminhoes.usina}
                        onChange={(e) => setQuantidadesCaminhoes(p => ({ ...p, usina: Number(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border rounded p-1 text-center font-bold text-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-0.5">Aco</label>
                      <input
                        type="number"
                        value={quantidadesCaminhoes.acorce}
                        onChange={(e) => setQuantidadesCaminhoes(p => ({ ...p, acorce: Number(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border rounded p-1 text-center font-bold text-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-0.5">Lei</label>
                      <input
                        type="number"
                        value={quantidadesCaminhoes.leila}
                        onChange={(e) => setQuantidadesCaminhoes(p => ({ ...p, leila: Number(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border rounded p-1 text-center font-bold text-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-0.5">Ola</label>
                      <input
                        type="number"
                        value={quantidadesCaminhoes.olaria}
                        onChange={(e) => setQuantidadesCaminhoes(p => ({ ...p, olaria: Number(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border rounded p-1 text-center font-bold text-neutral-800"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-0.5">Ros</label>
                      <input
                        type="number"
                        value={quantidadesCaminhoes.staRosa}
                        onChange={(e) => setQuantidadesCaminhoes(p => ({ ...p, staRosa: Number(e.target.value) || 0 }))}
                        className="w-full bg-slate-50 border rounded p-1 text-center font-bold text-neutral-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 5 */}
              <div>
                <span className="block text-[10px] font-black text-[#005B2B] uppercase tracking-wider mb-2 border-l-2 border-[#00843D] pl-1.5">Médias Detalhadas (17 Variáveis)</span>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto p-2 bg-white border border-gray-300 rounded-xl space-y-1">
                  {medias.map((med, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-medium py-1 border-b border-gray-100">
                      <span className="text-gray-500 truncate mr-2 font-black">{idx + 1}. {labelsMedias[idx]}</span>
                      <input
                        type="text"
                        value={med}
                        onChange={(e) => updateMediaValue(idx, e.target.value)}
                        className="w-16 bg-slate-50 border border-gray-300 rounded px-1.5 py-1 text-center text-[10px] font-black text-[#005B2B]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN PANEL VIEW - MODERN AND STUNNING TABLE LAYOUT IN COLOMBO GREEN */}
        <div className={`${isEditing ? "xl:col-span-8" : "xl:col-span-12"} w-full space-y-6`}>
          
          {/* Section A: Big Bento Header Metric Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Vazão Principal */}
            <div className="bg-[#FAFDFB] border-2 border-[#00843D] p-5 rounded-2xl flex flex-col justify-between shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#e2f5e5]/40 rounded-full blur-2xl transform translate-x-8 -translate-y-8 transition-transform group-hover:scale-125"></div>
              <span className="text-[10px] font-black text-[#00843D] uppercase tracking-widest block">Vazão Vinhaça Atual</span>
              <div className="flex items-baseline gap-1.5 mt-3 relative z-10">
                <span className="text-4xl font-black text-[#005B2B] tracking-tight">{vazaoVinhaca}</span>
                <span className="text-sm font-bold text-[#00843D] pl-0.5">m³/h</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 relative z-10 border-t border-gray-100 pt-2">
                <span>Efeito de Saída:</span>
                <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">{subindoEm}</span>
              </div>
            </div>

            {/* Índice de Aderência */}
            <div className="bg-white border border-[#00843D]/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Aderência (Despacho)</span>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-[#005B2B] tracking-tight">{idxAderencia}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                <span>Indicador Geral</span>
                <span className="font-extrabold text-[#00843D] bg-[#e2f5e5] px-1.5 py-0.5 rounded">Adequado</span>
              </div>
            </div>

            {/* Eficiência Geral */}
            <div className="bg-white border border-[#00843D]/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Eficiência Líquida</span>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-[#005B2B] tracking-tight">{eficienciaCaminhoes}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                <span>Rendimento Frota</span>
                <span className="font-extrabold text-[#00843D] bg-[#e2f5e5] px-1.5 py-0.5 rounded">Estável</span>
              </div>
            </div>

            {/* Tanques Trab / Parados */}
            <div className="bg-white border border-[#00843D]/20 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Relação de Atividade</span>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-4xl font-black text-[#005B2B] tracking-tight">{tanquesTrabalhando}</span>
                <span className="text-base text-gray-400 font-bold">/</span>
                <span className="text-xl text-neutral-500 font-black">{tanquesParados}</span>
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider pl-1 font-mono">Tanques</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-100 pt-2">
                <span>necessários:</span>
                <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{necessidadeTanques} Tanques</span>
              </div>
            </div>

          </div>

          {/* Section B: Grid Layout divided precisely into Two Majestic Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUMN 1 (Left 5 cols): MÉDIAS DE CICLO TELEMETRIA TABLE */}
            <div className="lg:col-span-5 bg-white border border-[#00843D]/20 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              
              <div className="bg-[#00843D] p-3.5 flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ListCollapse size={14} className="stroke-[2.5]" />
                  Médias de Ciclos & Tempos
                </h4>
                <span className="text-[10px] font-black text-[#e2f5e5] uppercase bg-[#005B2B] px-2.5 py-1 rounded-md border border-[#00843D]/35">
                  17 Variáveis
                </span>
              </div>

              {/* Clean Telemetry Table */}
              <div className="flex-1 divide-y divide-[#e2f5e5]/40 text-xs">
                {medias.map((med, idx) => {
                  const isTrajetoHighLight = idx === 3; // idx 3 is Trajeto Carregado
                  return (
                    <div 
                      key={idx} 
                      className={`flex justify-between items-center px-4 py-2 hover:bg-[#e2f5e5]/10 transition-colors ${
                        isTrajetoHighLight ? "bg-[#e2f5e5]/30" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-4">
                        <span className="font-mono text-[10px] text-[#00843D] font-black bg-[#e2f5e5] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-[#005B2B] truncate">{labelsMedias[idx]}</span>
                      </div>
                      <span className={`font-black text-right shrink-0 px-2.5 py-1 rounded-lg ${
                        isTrajetoHighLight 
                          ? "bg-[#00843D] text-white shadow-sm" 
                          : "bg-slate-50 text-slate-800 border border-slate-100"
                      }`}>
                        {med}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* COLUMN 2 (Right 7 cols): OPERAÇÕES & PARÂMETROS / FROTA ATIVA */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-start">
              
              {/* Box 1: Tabela de Telemetria Operacional */}
              <div className="bg-white border border-[#00843D]/20 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-[#00843D] p-3.5 border-b border-[#00843D]/10">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    📋 Métricas & Necessidades Operacionais
                  </h4>
                </div>

                <div className="divide-y divide-gray-100 text-xs text-left">
                  
                  {/* Item 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Necessidade de CM — Retirar Vazão</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Necessidade estimada calculada pela taxa de flutuação atual.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="inline-block bg-[#e2f5e5] text-[#00843D] font-black border border-[#00843D]/30 px-4 py-2 rounded-xl text-xs uppercase tracking-wider">
                        {necessidadeCMRetirar} CM
                      </span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Necessidade de CM — Manter Frentes</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Relação estável para cobertura de frentes fixas.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="inline-block bg-[#e2f5e5] text-[#00843D] font-black border border-[#00843D]/30 px-4 py-2 rounded-xl text-xs uppercase tracking-wider">
                        {necessidadeCMManter} CM
                      </span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Necessidade de CM — Limite de Carregamento</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Teto de transporte em operation gargalo logística.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="inline-block bg-[#e2f5e5] text-[#00843D] font-black border border-[#00843D]/30 px-4 py-2 rounded-xl text-xs uppercase tracking-wider">
                        {necessidadeCMLimite} CM
                      </span>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Necessidade de Auxiliares (AVL / Rolo)</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Maquinário ativo para compactação e apoio de frentes.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <span className="inline-block bg-[#e2f5e5] text-[#00843D] font-black border border-[#00843D]/30 px-4 py-2 rounded-xl text-xs uppercase tracking-wider">
                        {necessidadeAvlRolo} Equip
                      </span>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Litros de Vinhaça Retirados das Caixas</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Volume de acumulação drenado no período analítico.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right font-black text-sky-600 text-sm">
                      {litrosRetirados}
                    </div>
                  </div>

                  {/* Item 6 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Litros de Vinhaça Lançados</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Entrada bruta coletada da extração industrial.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right font-black text-[#00843D] text-sm">
                      {litrosLancados}
                    </div>
                  </div>

                  {/* Item 7 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-slate-50 transition">
                    <div className="flex-1">
                      <span className="font-extrabold text-neutral-800 block">Raio Médio Atendido</span>
                      <span className="text-[10px] text-gray-500 font-medium block">Distância linear média do centro industrial às frentes.</span>
                    </div>
                    <div className="shrink-0 text-left sm:text-right font-black text-neutral-800 text-sm">
                      {raioMedioAtendido} KM
                    </div>
                  </div>

                </div>
              </div>

              {/* Box 2: Tabela de Frota Fixada & Sequenciamento */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Caminhões Fixos Grid (Left Part) */}
                <div className="md:col-span-7 bg-white border border-[#00843D]/20 rounded-2xl shadow-sm overflow-hidden text-left flex flex-col justify-between">
                  <div className="bg-[#FAFDFB] p-3 border-b border-[#00843D]/10">
                    <span className="text-[10px] font-black text-[#005B2B] uppercase tracking-widest block">
                      🚚 Frota de Caminhões Fixados
                    </span>
                  </div>
                  
                  <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-around text-xs">
                    <div className="flex justify-between items-center py-2 px-3.5 hover:bg-slate-50">
                      <span className="font-semibold text-gray-600">Usina Colombo</span>
                      <span className="font-black text-[#00843D] bg-[#e2f5e5] px-2.5 py-0.5 rounded-md border border-[#00843D]/10">{quantidadesCaminhoes.usina}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3.5 hover:bg-slate-50">
                      <span className="font-semibold text-gray-600">Acorce</span>
                      <span className="font-black text-[#00843D] bg-[#e2f5e5] px-2.5 py-0.5 rounded-md border border-[#00843D]/10">{quantidadesCaminhoes.acorce}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3.5 hover:bg-slate-50">
                      <span className="font-semibold text-gray-600">Leila Transportes</span>
                      <span className="font-black text-[#00843D] bg-[#e2f5e5] px-2.5 py-0.5 rounded-md border border-[#00843D]/10">{quantidadesCaminhoes.leila}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3.5 hover:bg-slate-50">
                      <span className="font-semibold text-gray-600">Olaria</span>
                      <span className="font-black text-[#00843D] bg-[#e2f5e5] px-2.5 py-0.5 rounded-md border border-[#00843D]/10">{quantidadesCaminhoes.olaria}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3.5 hover:bg-slate-50">
                      <span className="font-semibold text-gray-600">Santa Rosa</span>
                      <span className="font-black text-[#00843D] bg-[#e2f5e5] px-2.5 py-0.5 rounded-md border border-[#00843D]/10">{quantidadesCaminhoes.staRosa}</span>
                    </div>
                  </div>
                </div>

                {/* Sequenciamento Ativo (Right Part) */}
                <div className="md:col-span-5 bg-white border border-[#00843D]/20 rounded-2xl shadow-sm overflow-hidden text-left flex flex-col justify-between">
                  <div className="bg-[#FAFDFB] p-3 border-b border-[#00843D]/10">
                    <span className="text-[10px] font-black text-[#005B2B] uppercase tracking-widest block">
                      🔢 Sequenciamento de Despacho
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 items-center justify-start">
                      {sequencia.map((seq, i) => (
                        <div 
                          key={i} 
                          className="w-9 h-9 rounded-xl bg-[#00843D] text-white font-black text-xs flex items-center justify-center shadow-sm relative group hover:scale-105 transition"
                          title={`Sequência #${i+1}: Local ID ${seq}`}
                        >
                          {seq}
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"></span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#e2f5e5] p-2.5 rounded-xl border border-[#00843D]/20 mt-4 text-[10px] text-[#005B2B] font-semibold leading-relaxed">
                      Ordem sequencial parametrizada ativa para distribuição direta nos canais.
                    </div>
                  </div>
                </div>

              </div>
              
            </div>

          </div>

          {/* Quick interactive note */}
          <div className="p-3.5 bg-[#FAFDFB] border border-[#00843D]/25 rounded-2xl text-center text-[10px] text-[#00843D]/90 font-semibold shadow-sm">
            💡 <span className="font-black uppercase text-[#005B2B]">Painel Dinâmico:</span> Os cálculos e tabelas de fertirrigação são recalculados integrando os dados inseridos. Use o gerenciador no canto superior para testar cenários hipotéticos.
          </div>

        </div>

      </div>

    </div>
  );
});
