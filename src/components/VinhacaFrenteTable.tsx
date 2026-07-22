import React from "react";
import { Settings, Trash2, Droplet, Activity, Sprout } from "lucide-react";
import { SmartFlowLogo, VinhacaLogo, ColomboLogo } from "./Logos";

interface VinhacaFrenteTableProps {
  frenteKey: string;
  activeData: {
    carregamentoAtual: string;
    situacaoTransporte: string;
    situacaoDescarregamento: string;
    areaQuadra: string;
    qtdaAplicMotor: string;
    raioSelecionado: number;
    vazaoFrenteEstimada: number;
    vazaoFrenteReal: number;
    tempoCarregamento: number;
    tempoTrajetoCarregado: number;
    tempoDescarregamentoEspera: number;
    tempoTrajetoVazio: number;
    velocidadeMedia: number;
    intervaloDespachos: number;
    ultimoDespacho: string;
    proximoDespacho: string;
    despachoAtrasado: string;
  };
  monitoringTime: string;
  formattedDate: string;
  editingFrenteKey: string | null;
  editSmartFlowFrenteNameInput: string;
  setEditingFrenteKey: (val: string | null) => void;
  setEditSmartFlowFrenteNameInput: (val: string) => void;
  handleDataUpdate: (fKey: string, field: string, val: any) => void;
  handleRenameFrente: (oldName: string, newName: string) => void;
  handleDeleteFrente: (fName: string) => void;
}

export const VinhacaFrenteTable = React.memo<VinhacaFrenteTableProps>(({
  frenteKey,
  activeData,
  monitoringTime,
  formattedDate,
  editingFrenteKey,
  editSmartFlowFrenteNameInput,
  setEditingFrenteKey,
  setEditSmartFlowFrenteNameInput,
  handleDataUpdate,
  handleRenameFrente,
  handleDeleteFrente,
}) => {
  // Dynamic calculations for this specific table
  const tCarregamento = Number(activeData.tempoCarregamento) || 0;
  const tTrajetoCarregado = Number(activeData.tempoTrajetoCarregado) || 0;
  const tDescarregamentoEspera = Number(activeData.tempoDescarregamentoEspera) || 0;
  const tTrajetoVazio = Number(activeData.tempoTrajetoVazio) || 0;
  
  const activeTempoTotalCiclo = tCarregamento + tTrajetoCarregado + tDescarregamentoEspera + tTrajetoVazio;
  const formattedCiclo = `${Math.floor(activeTempoTotalCiclo / 60).toString().padStart(2, '0')}:${(activeTempoTotalCiclo % 60).toString().padStart(2, '0')}`;
  
  const intDespachos = Number(activeData.intervaloDespachos) || 1;
  const activeNecessidadeCM = intDespachos > 0 ? (activeTempoTotalCiclo / intDespachos).toFixed(1) : '0.0';

  // Next dispatch calculation helper
  const addMins = (timeStr: string, minutes: number) => {
    if (!timeStr || !timeStr.includes(':')) return '--:--';
    const [hStr, mStr] = timeStr.split(':');
    let hrs = parseInt(hStr, 10);
    let mns = parseInt(mStr, 10);
    if (isNaN(hrs) || isNaN(mns)) return '--:--';
    mns += minutes;
    hrs += Math.floor(mns / 60);
    mns = mns % 60;
    hrs = hrs % 24;
    return `${hrs.toString().padStart(2, '0')}:${mns.toString().padStart(2, '0')}`;
  };

  const calculatedNextDispatch = addMins(activeData.ultimoDespacho, intDespachos);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 border-4 border-[#005B2B] rounded-3xl overflow-hidden shadow-xl bg-white mt-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER BAR SPANNING FULL WIDTH OF WIDGET */}
      <div className="col-span-12 bg-[#005B2B] px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-[#005B2B]/20 gap-2">
        <span className="text-sm font-black text-white uppercase tracking-wider select-none">
          📅 {formattedDate}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-[#5adc6a] text-[#004d22] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest">
            LIVE
          </span>
          <span className="text-xs font-black text-emerald-200 uppercase tracking-widest block">
            Frente de Vinhaça: {frenteKey}
          </span>
        </div>
      </div>

      {/* 2. LEFT SIDE LOGO COLUMN */}
      <div className="col-span-12 md:col-span-3 bg-slate-50 border-r border-gray-200 p-4 flex flex-col justify-between space-y-4 min-h-[500px]">
        {/* Logo 1: SmartFlow - Logística da Vinhaça */}
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition hover:shadow-md">
          <SmartFlowLogo className="w-full h-auto max-w-[140px]" />
        </div>

        {/* Logo 2: Logística de Vinhaça */}
        <div className="p-4 bg-[#FFFDF7] rounded-2xl shadow-sm border border-emerald-100/60 flex flex-col items-center text-center transition hover:shadow-md">
          <VinhacaLogo className="w-full h-auto max-w-[140px]" />
        </div>

        {/* Logo 3: Colombo Agroindústria */}
        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition hover:shadow-md">
          <ColomboLogo className="w-full h-auto max-w-[140px]" />
        </div>
      </div>

      {/* 3. MAIN PARAMETERS PANEL */}
      <div className="col-span-12 md:col-span-9 flex flex-col">
        
        {/* Subheaders Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#005B2B]/10">
          {/* Selected Frente Selector (Green Active Tab matching screen style) */}
          <div className="bg-[#5adc6a] px-5 py-3 text-[#004d22] font-extrabold flex items-center justify-between shadow-inner gap-2 min-h-[58px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004d22] animate-ping" />
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#004d22]">
                Frente Ativa:
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {editingFrenteKey !== frenteKey ? (
                <>
                  <span className="text-sm font-black text-[#004d22] bg-white/30 px-3 py-1 rounded-lg uppercase tracking-wide">
                    {frenteKey} {frenteKey === 'Ariranha' ? '🚜' : frenteKey === 'Santa Albertina' ? '🛠️' : frenteKey === 'Palestina' ? '⚡' : '📌'}
                  </span>
                  <button
                    onClick={() => {
                      setEditingFrenteKey(frenteKey);
                      setEditSmartFlowFrenteNameInput(frenteKey);
                    }}
                    className="bg-[#004d22] hover:bg-[#00381A] text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg active:scale-95 cursor-pointer shadow-sm transition flex items-center gap-1"
                    title="Editar nome ou apagar esta frente"
                  >
                    <Settings size={10} className="stroke-[2.5]" />
                    Editar
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1 bg-white/80 p-1.5 rounded-lg border border-[#004d22]/20">
                  <input
                    type="text"
                    value={editSmartFlowFrenteNameInput}
                    onChange={(e) => setEditSmartFlowFrenteNameInput(e.target.value)}
                    placeholder="Novo nome"
                    className="bg-white text-emerald-950 text-xs font-black rounded px-2 py-1 border border-emerald-800/25 focus:outline-none w-28 uppercase"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameFrente(frenteKey, editSmartFlowFrenteNameInput);
                      } else if (e.key === 'Escape') {
                        setEditingFrenteKey(null);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameFrente(frenteKey, editSmartFlowFrenteNameInput)}
                    className="bg-emerald-700 text-white hover:bg-emerald-800 font-extrabold text-[9px] px-2 py-1 rounded cursor-pointer transition shadow-sm"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => handleDeleteFrente(frenteKey)}
                    className="bg-rose-600 text-white hover:bg-rose-700 font-extrabold text-[9px] px-2 py-1 rounded cursor-pointer uppercase flex items-center gap-0.5 transition shadow-sm"
                    title="Apagar esta tabela permanentemente"
                  >
                    <Trash2 size={9} />
                    Apagar
                  </button>
                  <button
                    onClick={() => setEditingFrenteKey(null)}
                    className="bg-gray-600 text-white hover:bg-gray-700 font-extrabold text-[9px] px-1.5 py-1 rounded cursor-pointer transition shadow-sm"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Indicação por Ralo indicator (Deep Green Tab) */}
          <div className="bg-[#00843D] px-5 py-3 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 select-none shadow-inner">
            <Droplet size={14} className="text-white fill-white/20" />
            Indicação de Carregamento por Ralo
          </div>
        </div>

        {/* 19 Parameter Rows list */}
        <div className="flex-1 divide-y divide-gray-100 bg-white font-sans text-xs">
          
          {/* Row 1: Carregamento atual */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Carregamento atual
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <input
                type="text"
                value={activeData.carregamentoAtual}
                onChange={(e) => handleDataUpdate(frenteKey, 'carregamentoAtual', e.target.value)}
                className="w-full bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                placeholder="Ex: VN-101 (45 m³)"
              />
            </div>
          </div>

          {/* Row 2: Situação Transporte */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Situação Transporte
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <select
                value={activeData.situacaoTransporte}
                onChange={(e) => handleDataUpdate(frenteKey, 'situacaoTransporte', e.target.value)}
                className="w-full bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D] cursor-pointer"
              >
                <option value="Normal">🟢 NORMAL (SEM INTERRUPÇÕES)</option>
                <option value="Lento (Fila)">🟡 FILA NA USINA</option>
                <option value="Congestionamento">🟠 CONGESTIONAMENTO DE ROTA</option>
                <option value="Paralisado">🔴 PARADO (FALTA CAMINHÕES)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Situação Descarregamento */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Situação Descarregamento
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <select
                value={activeData.situacaoDescarregamento}
                onChange={(e) => handleDataUpdate(frenteKey, 'situacaoDescarregamento', e.target.value)}
                className="w-full bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D] cursor-pointer"
              >
                <option value="Descarregando">🟢 DESCARREGANDO / EM APLICAÇÃO</option>
                <option value="Normal / Aplicando">🟢 NORMAL / APLICANDO</option>
                <option value="Aguardando Aplicador">🟡 AGUARDANDO APLICADOR</option>
                <option value="Manutenção Mecânica">🔴 MANUTEÇÃO APLICADOR / PUMP</option>
              </select>
            </div>
          </div>

          {/* Row 4: Area/Quadra */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Area/Quadra
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <input
                type="text"
                value={activeData.areaQuadra}
                onChange={(e) => handleDataUpdate(frenteKey, 'areaQuadra', e.target.value)}
                className="w-full bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                placeholder="Fazenda e Quadra de aplicação"
              />
            </div>
          </div>

          {/* Row 5: Qtda (Aplic/Motor) */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Qtda (Aplic/Motor)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <input
                type="text"
                value={activeData.qtdaAplicMotor}
                onChange={(e) => handleDataUpdate(frenteKey, 'qtdaAplicMotor', e.target.value)}
                className="w-full bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                placeholder="Mecanização ativa"
              />
            </div>
          </div>

          {/* Row 6: Raio Selecionado */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Raio Selecionado
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.raioSelecionado}
                  onChange={(e) => handleDataUpdate(frenteKey, 'raioSelecionado', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="1"
                  max="150"
                />
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                  Raio {activeData.raioSelecionado} KM
                </span>
              </div>
            </div>
          </div>

          {/* Row 7: Vazão Frente (ESTIMADO HORA) */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Vazão Frente (ESTIMADO HORA)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.vazaoFrenteEstimada}
                  onChange={(e) => handleDataUpdate(frenteKey, 'vazaoFrenteEstimada', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="0"
                  max="1000"
                />
                <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-2 py-1 rounded">m³/h</span>
              </div>
            </div>
          </div>

          {/* Row 8: Vazão Frente (REAL ULTIMA HORA) */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Vazão Frente (REAL ULTIMA HORA) || {monitoringTime}
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.vazaoFrenteReal}
                  onChange={(e) => handleDataUpdate(frenteKey, 'vazaoFrenteReal', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="0"
                  max="1000"
                />
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-1 rounded">m³/h</span>
              </div>
            </div>
          </div>

          {/* Row 9: Tempo de Carregamento */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Tempo de Carregamento (Minutos)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.tempoCarregamento}
                  onChange={(e) => handleDataUpdate(frenteKey, 'tempoCarregamento', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="0"
                  max="240"
                />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">min</span>
              </div>
            </div>
          </div>

          {/* Row 10: Tempo Trajeto Carregado */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Tempo Trajeto Carregado (Minutos)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.tempoTrajetoCarregado}
                  onChange={(e) => handleDataUpdate(frenteKey, 'tempoTrajetoCarregado', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="0"
                  max="240"
                />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">min</span>
              </div>
            </div>
          </div>

          {/* Row 11: Tempo Descarregamento + Espera */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Tempo Descarregamento + Espera (Minutos)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.tempoDescarregamentoEspera}
                  onChange={(e) => handleDataUpdate(frenteKey, 'tempoDescarregamentoEspera', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="0"
                  max="240"
                />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">min</span>
              </div>
            </div>
          </div>

          {/* Row 12: Tempo Trajeto Vazio */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Tempo Trajeto Vazio (Minutos)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.tempoTrajetoVazio}
                  onChange={(e) => handleDataUpdate(frenteKey, 'tempoTrajetoVazio', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="0"
                  max="240"
                />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">min</span>
              </div>
            </div>
          </div>

          {/* Row 13: TempoTotal Ciclo (Calculado) */}
          <div className="grid grid-cols-12 bg-emerald-50/10">
            <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              TempoTotal Ciclo (Calculado)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <span className="bg-[#005B2B] text-[#00FF66] font-mono font-black border border-[#005B2B] rounded-lg px-4 py-1.5 shadow-sm text-xs select-all">
                {formattedCiclo} h ({activeTempoTotalCiclo} min)
              </span>
            </div>
          </div>

          {/* Row 14: Necessidade CM Ciclo (Calculado) */}
          <div className="grid grid-cols-12 bg-emerald-50/10">
            <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Necessidade CM Ciclo (Frota)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <span className="bg-[#00843D] text-[#e2f5e5] font-mono font-black border border-[#005B2B] rounded-lg px-4 py-1.5 shadow-sm text-xs select-all">
                {activeNecessidadeCM} Caminhões / Ciclo
              </span>
            </div>
          </div>

          {/* Row 15: Velocidade Média CM */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Velocidade Média CM
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.velocidadeMedia}
                  onChange={(e) => handleDataUpdate(frenteKey, 'velocidadeMedia', parseInt(e.target.value) || 0)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="1"
                  max="120"
                />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">km/h</span>
              </div>
            </div>
          </div>

          {/* Row 16: Intervalo Entre Despachos */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Intervalo Entre Despachos
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <div className="flex items-center gap-2 w-full">
                <input
                  type="number"
                  value={activeData.intervaloDespachos}
                  onChange={(e) => handleDataUpdate(frenteKey, 'intervaloDespachos', parseInt(e.target.value) || 1)}
                  className="w-2/3 bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                  min="1"
                  max="240"
                />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">min</span>
              </div>
            </div>
          </div>

          {/* Row 17: Ultimo Despacho (Hora) */}
          <div className="grid grid-cols-12 hover:bg-emerald-50/20 transition duration-150">
            <div className="col-span-12 sm:col-span-7 flex items-center bg-[#00843D]/5 px-4 py-3 font-black text-[#005B2B] border-r border-gray-100 uppercase tracking-wider">
              Ultimo Despacho (Hora)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
              <input
                type="text"
                value={activeData.ultimoDespacho}
                onChange={(e) => handleDataUpdate(frenteKey, 'ultimoDespacho', e.target.value)}
                className="w-full max-w-[120px] bg-white border border-[#00843D]/30 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                placeholder="HH:MM"
              />
            </div>
          </div>

          {/* Row 18: Proximo Despacho (hora) (Calculated dynamically) */}
          <div className="grid grid-cols-12 bg-emerald-50/10">
            <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-3 font-black border-r border-gray-100 uppercase tracking-wider text-[#005B2B]">
              Proximo Despacho (hora) (Calculado)
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
              <span className="bg-[#005B2B] text-white font-mono font-black rounded-lg px-4 py-1.5 shadow-sm text-xs border border-[#00381A]">
                {calculatedNextDispatch}
              </span>
            </div>
          </div>

          {/* Row 19: Despacho Atrasado? */}
          <div className="grid grid-cols-12 text-sm border-t-2 border-[#005B2B]">
            <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-4 font-black text-[#005B2B] bg-emerald-50/5 border-r border-gray-100 uppercase tracking-wider">
              Despacho Atrasado?
            </div>
            <div className="col-span-12 sm:col-span-5 px-4 py-3 flex items-center gap-2 bg-[#00843D]/5">
              <select
                value={activeData.despachoAtrasado}
                onChange={(e) => handleDataUpdate(frenteKey, 'despachoAtrasado', e.target.value)}
                className="bg-white border border-[#00843D]/30 text-xs font-black rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#005B2B] focus:outline-none"
              >
                <option value="Não">Auto / Sem Atraso</option>
                <option value="Sim">Sim (Atrasado)</option>
              </select>

              {activeData.despachoAtrasado === 'Sim' ? (
                <span className="flex-1 text-center bg-rose-600 text-white font-extrabold uppercase px-4 py-2 rounded-xl border border-rose-700 shadow-md animate-pulse tracking-wide">
                  🔴 SIM - ATRASADO!
                </span>
              ) : (
                <span className="flex-1 text-center bg-[#00843D] text-white font-extrabold uppercase px-4 py-2 rounded-xl border border-[#004d22] shadow-md tracking-wide">
                  🟢 NÃO - FLUXO NORMAL
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
});

