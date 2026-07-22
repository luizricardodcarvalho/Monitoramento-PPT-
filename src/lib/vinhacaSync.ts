/**
 * Utility functions for Vinhaça data synchronization, logging, and real-time database management.
 * Consolidates actions from Central de Despacho, Apontamentos, Níveis, and Fechamentos.
 */

import { addVinhacaHistoricoToSupabase } from './supabaseService';

export interface VinhacaHistoricEntry {
  id: string;
  timestamp: string;
  origem: 'Despacho' | 'Apontamento' | 'Níveis' | 'Fechamento';
  tipoAcao: 'Inclusão' | 'Edição' | 'Exclusão' | 'Despacho Rápido' | 'Boletim';
  caminhao?: string;
  detalhes: string;
  usuario: string;
}

/**
 * Registers an operational change/action in the centralized Vinhaça History Database (vinhaca_historico_db & Supabase).
 */
export function registerVinhacaActivity(activity: {
  origem: 'Despacho' | 'Apontamento' | 'Níveis' | 'Fechamento';
  tipoAcao: 'Inclusão' | 'Edição' | 'Exclusão' | 'Despacho Rápido' | 'Boletim';
  caminhao?: string;
  detalhes: string;
}) {
  try {
    const raw = localStorage.getItem("vinhaca_historico_db");
    const arr: VinhacaHistoricEntry[] = raw ? JSON.parse(raw) : [];
    
    // Create current timestamp formatted as DD/MM/AAAA às HH:MM:SS
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestampStr = `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
    
    const currentUser = localStorage.getItem('ppt_user_email') || localStorage.getItem('ppt_username') || "Operador CCO";
    const newEntry: VinhacaHistoricEntry = {
      id: "V-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      timestamp: timestampStr,
      usuario: currentUser,
      ...activity
    };
    
    arr.unshift(newEntry);
    localStorage.setItem("vinhaca_historico_db", JSON.stringify(arr));

    // Async sync to Supabase
    addVinhacaHistoricoToSupabase({
      id: newEntry.id,
      timestamp: newEntry.timestamp,
      origem: newEntry.origem,
      tipo_acao: newEntry.tipoAcao,
      caminhao: newEntry.caminhao || null,
      detalhes: newEntry.detalhes,
      user_email: newEntry.usuario
    }).catch(err => console.warn('Supabase vinhaca_historico sync warning:', err));
    
    // Notify all components in the active React session
    window.dispatchEvent(new Event("vinhaca_historico_changed"));
    localStorage.setItem("vinhaca_despacho_last_updated", timestampStr);
    window.dispatchEvent(new Event("vinhaca_despacho_changed"));
  } catch (err) {
    console.error("Erro ao registrar atividade de vinhaça:", err);
  }
}

/**
 * Automatically syncs trucks allocated in the Central de Despacho with the current hour's row in the pointing sheet (Apontamento).
 * Recalculates frentes, atendidos, active trucks, and estimated reals volumes (60m3 per trip).
 */
export function syncDespachoToApontamento() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `vinhaca_apontamento_${todayStr}`;
    
    // Load despachos
    const trucksRaw = localStorage.getItem("vinhaca_despacho_trucks");
    if (!trucksRaw) return;
    const trucks = JSON.parse(trucksRaw);
    
    // Load pointing
    let apontamentoRaw = localStorage.getItem(key);
    let dayData: any[] = [];
    if (apontamentoRaw) {
      dayData = JSON.parse(apontamentoRaw);
    } else {
      // If pointing sheet doesn't exist yet, we will skip or fallback to rendering
      return; 
    }
    
    // Current hour segment (e.g. "15:00")
    const currentHourStr = `${String(new Date().getHours()).padStart(2, "0")}:00`;
    
    // Filter active trucks in transits/active frentes
    const f54_4 = trucks.filter((t: any) => t.frenteSituacao === "54-4 Vln. Loc" && t.condicao === "Em Rota").length;
    const f54_2 = trucks.filter((t: any) => t.frenteSituacao === "54-2 Vln. Loc" && t.condicao === "Em Rota").length;
    const f54_1 = trucks.filter((t: any) => t.frenteSituacao === "54-1 Vln. Loc" && t.condicao === "Em Rota").length;
    const f51_4 = trucks.filter((t: any) => (t.frenteSituacao === "51-4 Vln. Loc" || t.frenteSituacao === "51-1 Aspersão") && t.condicao === "Em Rota").length;
    const f51_2 = trucks.filter((t: any) => t.frenteSituacao === "51-2 Aspersão" && t.condicao === "Em Rota").length;
    const f51_3 = trucks.filter((t: any) => t.frenteSituacao === "51-3 Aspersão" && t.condicao === "Em Rota").length;
    
    const countAtendidos = f54_4 + f54_2 + f54_1 + f51_4 + f51_2 + f51_3;
    const countTrabalhou = trucks.filter((t: any) => t.condicao === "Em Rota" && (t.frenteSituacao.includes("Vln. Loc") || t.frenteSituacao.includes("Aspersão"))).length;
    
    // Update the row matching the current hour with live telemetry aggregates
    let updated = false;
    dayData = dayData.map((row: any) => {
      if (row.hora === currentHourStr) {
        updated = true;
        return {
          ...row,
          f_54_4_vln: f54_4,
          f_54_2_vln: f54_2,
          f_54_1_vln: f54_1,
          f_51_4_asp: f51_4,
          f_51_2_asp: f51_2,
          f_51_3_asp: f51_3,
          atendidos: countAtendidos,
          caminhaoTrabalhou: countTrabalhou,
          // Estimating actual vinhaça volume processed based on 60m³/trip capacity
          vazaoReal: countAtendidos * 60,
          retirado: countAtendidos * 60
        };
      }
      return row;
    });
    
    if (updated) {
      localStorage.setItem(key, JSON.stringify(dayData));
      window.dispatchEvent(new Event("vinhaca_apontamento_changed"));
    }
  } catch (e) {
    console.error("Erro na sincronização automática do despacho para o apontamento:", e);
  }
}
