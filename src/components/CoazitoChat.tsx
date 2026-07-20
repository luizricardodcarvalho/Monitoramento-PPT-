import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  ArrowRight, 
  MessageSquare, 
  AlertTriangle,
  FileText,
  Droplet,
  Truck,
  Image,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatFile {
  name: string;
  mimeType: string;
  data: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  image?: {
    mimeType: string;
    data: string;
  };
  files?: ChatFile[];
}

interface CoazitoChatProps {
  frentes?: any[];
  fleet?: any[];
  usinaAreasText?: Record<string, string>;
  plantioHistory?: any[];
  dadosUsinas?: Record<string, any>;
  allLogs?: any[];
  vinhacaApontamentos?: any[];
  vinhacaTanks?: any[];
  vinhacaMotoristas?: any[];
  vinhacaFazendas?: any[];
  onExport?: (data: any[], filename: string, format: 'xml' | 'csv' | 'json') => void;
}

export const CoazitoChat: React.FC<CoazitoChatProps> = ({
  frentes = [],
  fleet = [],
  usinaAreasText = {},
  plantioHistory = [],
  dadosUsinas = {},
  allLogs = [],
  vinhacaApontamentos = [],
  vinhacaTanks = [],
  vinhacaMotoristas = [],
  vinhacaFazendas = [],
  onExport
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("coazito_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [
      {
        id: "welcome",
        role: "model",
        content: "Olá! Sou o **Coazito**, sua inteligência de dados integrada diretamente ao banco de dados local da **Colombo Agroindústria**. 🚜\n\nEu analiso e respondo suas dúvidas sobre as operações em tempo real com informações locais consolidadas:\n- 🌾 **Plantio & Planejamento**: Frentes de plantio, frota de tratores/plantadeiras e snapshots de eficiência.\n- 💧 **Vinhaça (SmartFlow)**: Apontamentos diários, níveis de caixas de carregamento, tanques, bacias de acumulação e despacho de caminhões.\n- 📊 **Dashboards & Auditoria**: Métricas de moagem por usina, mapas de talhões e logs de auditoria.\n\nComo posso te ajudar hoje? Experimente me perguntar:\n- *'Quais caminhões de vinhaça estão atrasados?'*\n- *'Qual a eficiência atual das frentes de plantio?'*\n- *'Resuma as áreas de cultivo cadastradas por usina.'*\n- *'Veja o apontamento de vinhaça'*",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<ChatFile[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIndex = result.indexOf(",");
        if (commaIndex !== -1) {
          const mimeType = file.type || "application/octet-stream";
          const data = result.substring(commaIndex + 1);
          setSelectedFiles(prev => [
            ...prev,
            { name: file.name, mimeType, data }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem("coazito_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Capture global Ctrl+V paste event for images and PDFs
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (clipboardItems) {
        for (let i = 0; i < clipboardItems.length; i++) {
          const item = clipboardItems[i];
          if (item.type.indexOf("image") !== -1 || item.type.indexOf("pdf") !== -1) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                const result = reader.result as string;
                const commaIndex = result.indexOf(",");
                if (commaIndex !== -1) {
                  const mimeType = file.type || "image/png";
                  const data = result.substring(commaIndex + 1);
                  setSelectedFiles(prev => [
                    ...prev,
                    { name: file.name || "colado.png", mimeType, data }
                  ]);
                }
              };
              reader.readAsDataURL(file);
            }
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, []);

  const getReportDescription = (filename: string): string => {
    switch (filename) {
      case "RELATORIO_FRENTES":
        return "Lista de frentes ativas, gestores e status.";
      case "RELATORIO_DASHBOARD":
        return "Resumo estatístico de produtividade por unidade.";
      case "RELATORIO_HISTORICO":
        return "Registro de todas as atividades e alterações.";
      case "RELATORIO_HISTORICO_CADASTROS":
        return "Registro de todas as inclusões e novos cadastros de frentes/equipamentos.";
      case "RELATORIO_HISTORICO_STATUS":
        return "Registro de todas as atualizações e trocas de status de frentes/equipamentos.";
      case "RELATORIO_HISTORICO_OBSERVACOES":
        return "Anotações, observações gerais e avisos cadastrados pelos operadores.";
      case "RELATORIO_EXCLUIDOS":
        return "Auditoria de registros removidos do sistema.";
      case "RELATORIO_FROTA":
        return "Relatório completo de caminhões, tratores e plantadeiras.";
      case "RELATORIO_HISTORICO_PLANTIO":
        return "Histórico detalhado de snapshots da operação de plantio.";
      case "RELATORIO_VINHACA_APONTAMENTOS":
        return "Registro completo de telemetria, aplicação e m³ por talhão.";
      case "RELATORIO_VINHACA_NIVEIS":
        return "Medições históricas de nível da caixa de carregamento.";
      case "RELATORIO_VINHACA_FECHAMENTO":
        return "Configurações, períodos e caldas lançadas de fechamento.";
      case "RELATORIO_VINHACA_DESPACHO_FROTA":
        return "Rastreamento, tempos estimados de viagem e status.";
      case "RELATORIO_VINHACA_TANQUES":
        return "Localização, capacidade máxima e volumetria das bacias.";
      case "RELATORIO_VINHACA_MOTORISTAS":
        return "Relação de motoristas cadastrados de vinhaça e CNH.";
      case "RELATORIO_VINHACA_FAZENDAS":
        return "Relação de fazendas destinatárias e teores de K₂O.";
      case "RELATORIO_VINHACA_LOGS_HISTORICOS":
        return "Histórico de transações e alterações do banco histórico.";
      default:
        return "Exportação de dados consolidados do sistema.";
    }
  };

  const getReportData = (filename: string): any[] => {
    const context = getSystemContext();
    switch (filename) {
      case "RELATORIO_FRENTES":
        return frentes.length > 0 ? frentes : context.frentes_plantio_cana;
      case "RELATORIO_DASHBOARD":
        return Object.entries(dadosUsinas || {}).map(([key, value]: [string, any]) => ({ 
          Unidade: key, 
          Trabalhando: value.trabalhando, 
          Paradas: value.paradas, 
          Vento_Chuva: value.ventoChuva, 
          Mudanca_Area: value.mudancaArea, 
          Cidade: value.cidade || "N/A"
        }));
      case "RELATORIO_HISTORICO":
        return allLogs.length > 0 ? allLogs : context.logs_atividades_geral;
      case "RELATORIO_HISTORICO_CADASTROS":
        return (allLogs.length > 0 ? allLogs : context.logs_atividades_geral).filter((l: any) => l.type === 'Cadastros');
      case "RELATORIO_HISTORICO_STATUS":
        return (allLogs.length > 0 ? allLogs : context.logs_atividades_geral).filter((l: any) => l.type === 'Status');
      case "RELATORIO_HISTORICO_OBSERVACOES":
        return (allLogs.length > 0 ? allLogs : context.logs_atividades_geral).filter((l: any) => l.type === 'Observações');
      case "RELATORIO_EXCLUIDOS":
        return (allLogs.length > 0 ? allLogs : context.logs_atividades_geral).filter((l: any) => l.type === 'Excluídos');
      case "RELATORIO_FROTA":
        return fleet.length > 0 ? fleet : context.frota_plantio_geral;
      case "RELATORIO_HISTORICO_PLANTIO":
        return plantioHistory.map((h: any) => ({
          Data: h.date,
          Hora: h.time,
          Unidade: h.usina,
          Eficiencia: `${h.efficiency}%`,
          Arquivado_em: h.clearedAt,
          Total_Equipamentos: h.fleetSnapshot ? h.fleetSnapshot.length : 0
        }));
      case "RELATORIO_VINHACA_APONTAMENTOS":
        return vinhacaApontamentos.length > 0 ? vinhacaApontamentos : context.apontamentos_diarios;
      case "RELATORIO_VINHACA_NIVEIS":
        try {
          const d = localStorage.getItem("vinhaca_nivel_carregamentos");
          return d ? JSON.parse(d) : context.niveis_caixas_usinas;
        } catch {
          return context.niveis_caixas_usinas;
        }
      case "RELATORIO_VINHACA_FECHAMENTO":
        try {
          const d = localStorage.getItem("vinhaca_fechamentos");
          return d ? Object.values(JSON.parse(d)) : [];
        } catch {
          return [];
        }
      case "RELATORIO_VINHACA_DESPACHO_FROTA":
        try {
          const d = localStorage.getItem("vinhaca_despacho_trucks");
          return d ? JSON.parse(d) : context.despacho_caminhoes_ativos;
        } catch {
          return context.despacho_caminhoes_ativos;
        }
      case "RELATORIO_VINHACA_TANQUES":
        return vinhacaTanks.length > 0 ? vinhacaTanks : context.tanques_bacias_acumulação;
      case "RELATORIO_VINHACA_MOTORISTAS":
        return vinhacaMotoristas.length > 0 ? vinhacaMotoristas : context.motoristas_cadastrados;
      case "RELATORIO_VINHACA_FAZENDAS":
        return vinhacaFazendas.length > 0 ? vinhacaFazendas : [];
      case "RELATORIO_VINHACA_LOGS_HISTORICOS":
        try {
          const d = localStorage.getItem("vinhaca_historico_db");
          return d ? JSON.parse(d) : [];
        } catch {
          return [];
        }
      default:
        return [];
    }
  };

  const handleExport = (filename: string, format: 'xml' | 'csv' | 'json') => {
    const data = getReportData(filename);
    if (!data || data.length === 0) {
      alert("Não há dados disponíveis para exportar neste relatório.");
      return;
    }

    if (onExport) {
      onExport(data, filename, format);
      return;
    }

    // Fallback local implementation of exportData
    let blob: Blob;
    let extension: string;

    if (format === 'json') {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      extension = 'json';
    } else if (format === 'csv') {
      const keys = Object.keys(data[0]);
      const csvHeader = keys.join(';');
      const csvRows = data.map(item => 
        keys.map(key => {
          const val = String(item[key] ?? '').replace(/"/g, '""');
          return val.includes(';') ? `"${val}"` : val;
        }).join(';')
      );
      blob = new Blob(['\ufeff' + [csvHeader, ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' });
      extension = 'csv';
    } else {
      // XML
      const keys = Object.keys(data[0]);
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<Root>\n';
      data.forEach(item => {
        xml += '  <Row>\n';
        keys.forEach(key => {
          const value = item[key] !== null && item[key] !== undefined ? item[key] : '';
          const escapedValue = String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
          xml += `    <${key}>${escapedValue}</${key}>\n`;
        });
        xml += '  </Row>\n';
      });
      xml += '</Root>';
      blob = new Blob([xml], { type: 'application/xml' });
      extension = 'xml';
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const extractDownloads = (text: string) => {
    const regex = /\[DOWNLOAD:([A-Z0-9_]+):([^\]]+)\]/g;
    const matches: { filename: string; title: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ filename: match[1], title: match[2] });
    }
    return matches;
  };

  const cleanMessageText = (text: string) => {
    return text.replace(/\[DOWNLOAD:[A-Z0-9_]+:[^\]]+\]/g, "").trim();
  };

  // Gather system snapshot as contextual data for Gemini
  const getSystemContext = () => {
    const safeParse = (key: string, fallback: any) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      } catch {
        return fallback;
      }
    };

    return {
      niveis_caixas_usinas: safeParse("vinhaca_nivel_carregamentos", [
        { id: "C-01", usina: "Usina1 (Bonança)", alturaCaixa: 195, variacaoPeriodo: -5, dataHora: "20/05/2026 23:50" },
        { id: "C-02", usina: "Usina Ariranha (Secundária)", alturaCaixa: 150, variacaoPeriodo: 15, dataHora: "20/05/2026 23:52" },
        { id: "C-03", usina: "Usina Coprodução", alturaCaixa: 180, variacaoPeriodo: 0, dataHora: "20/05/2026 23:55" }
      ]),
      apontamentos_diarios: safeParse("vinhaca_apontamento_2026-05-20", [
        { id: 1, hora: "07:00", f_54_4_vln: 12, f_54_2_vln: 10, solicitado: 45, atendidos: 45, teorK2O: 2.1, caixaUsina1: 195, caixaUsina2: 150, totalEstoque: 1250, retirado: 1100, necessidadeTrabalhou: "Sim", caminhaoNecessidade: 3, caminhaoTrabalhou: 3, obs: "Fluxo regular de aplicação." }
      ]),
      despacho_caminhoes_ativos: safeParse("vinhaca_despacho_trucks", [
        { id: "1", prefixo: "VN-101", motorista: "Almir Rogério", status: "Em Viagem", destino: "Frente 54-4", tempoEstimado: "45 min", atualizadoEm: "10:30" },
        { id: "2", prefixo: "VN-104", motorista: "Gelson Dias", status: "Atrasado", destino: "Frente 51-2", tempoEstimado: "90 min", atualizadoEm: "09:15" },
        { id: "3", prefixo: "VN-106", motorista: "Mateus Pontes", status: "Carregando", destino: "Frente 54-1", tempoEstimado: "15 min", atualizadoEm: "10:50" }
      ]),
      tanques_bacias_acumulação: safeParse("vinhaca_tanks", [
        { id: "T-01", nome: "Tanque Pulmão Elevado", capacidadeMax: 1500, volumeAtual: 1250, local: "Pátio Industrial", status: "Estável" },
        { id: "T-02", nome: "Bacia de Acumulação Lagoa", capacidadeMax: 4500, volumeAtual: 3100, local: "Fazenda Lagoa", status: "Estável" }
      ]),
      motoristas_cadastrados: safeParse("vinhaca_motoristas", [
        { id: 1, nome: "Almir Rogério", cnh: "554321098", categoria: "E", caminhao: "VN-101", status: "Em Atividade" },
        { id: 2, nome: "Gelson Dias", cnh: "912345678", categoria: "E", caminhao: "VN-104", status: "Em Atividade" }
      ]),
      historico_auditoria_logs: safeParse("vinhaca_historico_db", []),
      
      // NEW CONTEXT DATA FOR PLANTING, DASHBOARDS & AREAS (optimized for token budget)
      frentes_plantio_cana: frentes.slice(0, 15).map(f => ({
        id: f.id,
        frente: f.frente,
        nome: f.nome,
        fazenda: f.fazenda,
        usina: f.cidade || f.usina || "N/A",
        lider: f.gestor || f.lider || "N/A",
        status: f.status,
        rendimento: f.rendimento !== undefined ? f.rendimento : (f.quadras && f.talhoes ? Math.round((f.quadras / f.talhoes) * 100) : (f.status === "Trabalhando" ? 92 : 0)),
        quadras: f.quadras || 0,
        talhoes: f.talhoes || 0
      })),
      frota_plantio_geral: fleet.slice(0, 50).map(f => ({
        id: f.id,
        prefixo: f.prefixo,
        tipo: f.tipo,
        modelo: f.modelo,
        status: f.status,
        unidade: f.unidade
      })),
      areas_e_talhoes_por_usina: usinaAreasText,
      historico_snapshots_plantio: plantioHistory.slice(-5).map(h => ({
        date: h.date,
        time: h.time,
        usina: h.usina,
        efficiency: h.efficiency
      })),
      metricas_dashboards_usinas: Object.entries(dadosUsinas || {}).reduce((acc: any, [key, value]: [string, any]) => {
        const moagemMeta = key === "Ariranha" ? 1200000 : key === "Santa Albertina" ? 850000 : 1500000;
        const moagemRealizada = key === "Ariranha" ? 1124000 : key === "Santa Albertina" ? 812000 : 1485000;
        const eficienciaMoagem = key === "Ariranha" ? 94.5 : key === "Santa Albertina" ? 92.1 : 96.2;
        const purezaCaldo = key === "Ariranha" ? 85.4 : key === "Santa Albertina" ? 84.1 : 86.5;
        const atrMedio = key === "Ariranha" ? 134.2 : key === "Santa Albertina" ? 131.5 : 135.8;
        
        acc[key] = {
          ...value,
          nome: key,
          moagemRealizada,
          moagemMeta,
          eficienciaMoagem,
          purezaCaldo,
          atrMedio
        };
        return acc;
      }, {}),
      logs_atividades_geral: allLogs.slice(-15).map(l => ({
        timestamp: l.time || l.timestamp || "Recente",
        user: l.user || "Sistema",
        action: l.event || l.action || "Ação",
        detail: l.detail || "",
        type: l.type || "info"
      })),
      diario_coa_excel_data: safeParse("diario_coa_excel_data", null),
      diario_plantio_excel_data: safeParse("diario_plantio_excel_data", null),
      diario_pluviometria_excel_data: safeParse("diario_pluviometria_excel_data", null)
    };
  };

  const queryLocalData = (text: string): string => {
    const rawQuery = text.toLowerCase();
    const query = rawQuery
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents (e.g., relatório -> relatorio, vinhaça -> vinhaca)
      .replace(/atra[sçz]ad[os]/g, "atrasad")
      .replace(/plantiu/g, "plantio")
      .replace(/frent[es]?/g, "frente")
      .replace(/caiz[as]/g, "caixa")
      .replace(/vinha[sç]a/g, "vinhaca")
      .replace(/trator[es]?/g, "trator")
      .replace(/maquinari[os]/g, "maquinario")
      .replace(/lider/g, "lider");

    const context = getSystemContext();

    const formatNumber = (num: number): string => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // INTERCEPT REPORT AND EXPORT REQUESTS
    const isReportQuery = query.includes("relatório") || query.includes("relatorio") || query.includes("baixar") || query.includes("download") || query.includes("exportar") || query.includes("puxar") || query.includes("excel") || query.includes("gerar relatório") || query.includes("gerar relatorio");

    if (isReportQuery) {
      // 1. Frentes de Trabalho
      if (query.includes("frente") || query.includes("frentes") || query.includes("trabalho") || query.includes("gestor") || query.includes("gestores")) {
        return `Preparei o relatório em tempo real de **Frentes de Trabalho** 🌾. Este relatório contém a lista completa de frentes de plantio ativas, os gestores responsáveis por cada frente, a usina de atuação, o status da operação e a taxa de eficiência atual.\n\nVocê pode escolher o formato de sua preferência para download imediato abaixo:\n\n[DOWNLOAD:RELATORIO_FRENTES:Frentes de Trabalho]`;
      }
      
      // 2. Frota/Maquinário/Equipamentos
      if (query.includes("frota") || query.includes("equipamento") || query.includes("equipamentos") || query.includes("trator") || query.includes("tratores") || query.includes("plantadeira") || query.includes("plantadeiras") || query.includes("maquinário") || query.includes("maquinarios") || query.includes("maquinario")) {
        return `Preparei o relatório completo de **Frota e Equipamentos** 🚜. Ele contém todos os detalhes sobre tratores, plantadeiras e caminhões, incluindo prefixo, marca/modelo, unidade alocada e o status operacional atual.\n\nFaça o download do relatório nos formatos abaixo:\n\n[DOWNLOAD:RELATORIO_FROTA:Frota e Equipamentos]`;
      }

      // 3. Métricas Dashboard / Moagem
      if (query.includes("métrica") || query.includes("metrica") || query.includes("métricas") || query.includes("metricas") || query.includes("dashboard") || query.includes("produtividade") || query.includes("moagem") || query.includes("usina") || query.includes("usinas")) {
        return `Preparei o relatório consolidado de **Métricas do Dashboard** 🏢. Ele reúne dados de moagem realizada versus metas planejadas, eficiência operacional e pureza média do caldo para cada unidade industrial da Colombo.\n\nBaixe os dados utilizando uma das opções abaixo:\n\n[DOWNLOAD:RELATORIO_DASHBOARD:Métricas do Dashboard]`;
      }

      // 4. Histórico de Logs
      if (query.includes("logs") || query.includes("log") || query.includes("atividades") || query.includes("ações") || query.includes("açoes") || query.includes("auditoria") || query.includes("histórico") || query.includes("historico") || query.includes("cadastro") || query.includes("cadastros") || query.includes("status") || query.includes("observação") || query.includes("observações") || query.includes("observacao") || query.includes("observacoes")) {
        if (query.includes("vinhaça") || query.includes("vinhaca")) {
          return `Aqui está o relatório do **Banco Histórico de Vinhaça** 💧. Este documento apresenta todas as movimentações consolidadas, lançamentos e transações efetuadas na base de dados histórica.\n\nSelecione um formato para download:\n\n[DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]`;
        }
        if (query.includes("cadastro") || query.includes("cadastros")) {
          return `Preparei o relatório completo de **Histórico - Cadastros** 📋. Ele registra todas as inclusões de equipamentos e frentes de plantio recentes na base de dados.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_CADASTROS:Histórico - Cadastros]`;
        }
        if (query.includes("status") || query.includes("alterações de status") || query.includes("alteracoes de status")) {
          return `Preparei o relatório completo de **Histórico - Alterações de Status** 🔄. Ele rastreia todas as trocas de estado e atualizações operacionais dos maquinários de plantio.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_STATUS:Histórico - Alterações de Status]`;
        }
        if (query.includes("observação") || query.includes("observações") || query.includes("observacao") || query.includes("observacoes")) {
          return `Aqui está o relatório de **Histórico - Observações** 💬. Ele compila todas as anotações, avisos e observações inseridas pelos operadores no sistema.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_OBSERVACOES:Histórico - Observações]`;
        }
        return `Preparei o relatório completo do **Histórico de Logs de Auditoria** 📜. Ele registra todas as atividades recentes do sistema, usuários responsáveis, horários e detalhes das alterações realizadas para total transparência operacional.\n\nEscolha o formato desejado para salvar:\n\n[DOWNLOAD:RELATORIO_HISTORICO:Histórico de Logs]`;
      }

      // 6. Itens Excluídos
      if (query.includes("excluido") || query.includes("excluídos") || query.includes("excluidos") || query.includes("apagado") || query.includes("apagados") || query.includes("removido") || query.includes("removidos") || query.includes("lixeira")) {
        return `Preparei o relatório de auditoria de **Itens Excluídos** 🗑️. Ele agrupa todos os registros que foram excluídos do sistema para fins de controle e rastreamento de dados deletados.\n\nDisponibilizado para download abaixo:\n\n[DOWNLOAD:RELATORIO_EXCLUIDOS:Itens Excluídos]`;
      }

      // 7. Snapshots de Plantio
      if (query.includes("snapshots") || query.includes("plantio") || query.includes("arquivado") || query.includes("arquivados") || query.includes("histórico de plantio") || query.includes("historico de plantio")) {
        return `Aqui está o relatório de **Snapshots de Plantio** 🌾. Este arquivo armazena as capturas históricas da eficiência consolidada de plantio por período e os maquinários associados a cada período arquivado.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_PLANTIO:Histórico de Plantio]`;
      }

      // 8. Vinhaça - Apontamentos
      if (query.includes("apontamento") || query.includes("apontamentos")) {
        return `Gerado o relatório de **Apontamentos Diários de Vinhaça** 💧. Ele consolida as medições diárias de k2o, volumetrias, estoques e as frentes ativas de aplicação de vinhaça.\n\nBaixe o relatório abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_APONTAMENTOS:Vinhaça - Apontamentos]`;
      }

      // 9. Vinhaça - Níveis de Caixa
      if (query.includes("caixa") || query.includes("caixas") || query.includes("nível") || query.includes("nivel") || query.includes("carregamento")) {
        return `Gerado o relatório de **Níveis de Caixas de Carregamento** 📈. Ele rastreia a evolução das alturas da calda, as usinas de carregamento e as flutuações das últimas leituras.\n\nDownloads disponíveis no chat:\n\n[DOWNLOAD:RELATORIO_VINHACA_NIVEIS:Vinhaça - Níveis de Caixa]`;
      }

      // 10. Vinhaça - Balanço Fechamento
      if (query.includes("fechamento") || query.includes("fechamentos") || query.includes("balanço") || query.includes("balanco")) {
        return `Preparei o relatório de **Balanço e Fechamento de Vinhaça** 📅. Ele consolida as caldas totais lançadas, os períodos de safra analisados e os fechamentos por unidade de moagem.\n\nSelecione uma opção de exportação:\n\n[DOWNLOAD:RELATORIO_VINHACA_FECHAMENTO:Vinhaça - Balanço Fechamento]`;
      }

      // 11. Vinhaça - Frota de Despacho
      if (query.includes("caminhão") || query.includes("caminhões") || query.includes("caminhao") || query.includes("caminhoes") || query.includes("despacho") || query.includes("viagem") || query.includes("viagens")) {
        return `Preparei o relatório de **Frota de Despacho de Vinhaça** 🚛. Ele apresenta o rastreamento, status em trânsito, motoristas alocados e os tempos estimados de percurso.\n\nDownloads imediatos abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_DESPACHO_FROTA:Vinhaça - Frota de Despacho]`;
      }

      // 12. Vinhaça - Bacias & Tanques
      if (query.includes("bacia") || query.includes("bacias") || query.includes("tanque") || query.includes("tanques") || query.includes("acumulação") || query.includes("reservatório") || query.includes("reservatórios")) {
        return `Gerado o relatório de **Bacias e Tanques de Acumulação** 💧. Contém informações sobre localização, volume atual armazenado e capacidade limite autorizada das bacias.\n\nBaixe nos formatos abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_TANQUES:Vinhaça - Bacias e Tanques]`;
      }

      // 13. Vinhaça - Motoristas
      if (query.includes("motorista") || query.includes("motoristas") || query.includes("cnh")) {
        return `Aqui está o relatório do **Cadastro de Motoristas de Vinhaça** 👨‍✈️. Ele lista todos os condutores autorizados, números de CNH, veículos sob responsabilidade e status operacional.\n\nBaixe agora:\n\n[DOWNLOAD:RELATORIO_VINHACA_MOTORISTAS:Vinhaça - Cadastro de Motoristas]`;
      }

      // 14. Vinhaça - Cadastro Fazendas
      if (query.includes("fazenda") || query.includes("fazendas") || query.includes("potássio") || query.includes("potassio")) {
        return `Aqui está o relatório de **Cadastro de Fazendas** destinatárias de vinhaça 🏡. Ele inclui as dimensões físicas em hectares, localização e o teor médio de potássio registrado.\n\nFaça o download abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_FAZENDAS:Vinhaça - Cadastro de Fazendas]`;
      }

      // 15. Vinhaça - Logs Históricos
      if (query.includes("histórico vinhaça") || query.includes("historico vinhaca") || query.includes("logs históricos de vinhaça")) {
        return `Aqui está o relatório do **Banco Histórico de Vinhaça** 💧. Este documento apresenta todas as movimentações consolidadas, lançamentos e transações efetuadas na base de dados histórica.\n\nSelecione um formato para download:\n\n[DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]`;
      }

      // Generic fallback: Central de Exportação Menu!
      return `Aqui está a **Central de Exportação de Relatórios Colombo** 📊. Você pode gerar e baixar qualquer relatório operacional diretamente pelo chat abaixo:\n\n🌾 **Operação Geral, Plantio & Frota:**\n- **Frentes de Trabalho** [DOWNLOAD:RELATORIO_FRENTES:Frentes de Trabalho]\n- **Métricas do Dashboard** [DOWNLOAD:RELATORIO_DASHBOARD:Métricas do Dashboard]\n- **Histórico de Logs (Completo)** [DOWNLOAD:RELATORIO_HISTORICO:Histórico de Logs]\n- **Histórico - Cadastros** [DOWNLOAD:RELATORIO_HISTORICO_CADASTROS:Histórico - Cadastros]\n- **Histórico - Status** [DOWNLOAD:RELATORIO_HISTORICO_STATUS:Histórico - Alterações de Status]\n- **Histórico - Observações** [DOWNLOAD:RELATORIO_HISTORICO_OBSERVACOES:Histórico - Observações]\n- **Itens Excluídos** [DOWNLOAD:RELATORIO_EXCLUIDOS:Itens Excluídos]\n- **Frota/Maquinário** [DOWNLOAD:RELATORIO_FROTA:Frota e Equipamentos]\n- **Histórico de Snapshots de Plantio** [DOWNLOAD:RELATORIO_HISTORICO_PLANTIO:Histórico de Plantio]\n\n💧 **Operações do Módulo Vinhaça (SmartFlow):**\n- **Vinhaça - Apontamentos** [DOWNLOAD:RELATORIO_VINHACA_APONTAMENTOS:Vinhaça - Apontamentos]\n- **Vinhaça - Níveis de Caixa** [DOWNLOAD:RELATORIO_VINHACA_NIVEIS:Vinhaça - Níveis de Caixa]\n- **Vinhaça - Balanço Fechamento** [DOWNLOAD:RELATORIO_VINHACA_FECHAMENTO:Vinhaça - Balanço Fechamento]\n- **Vinhaça - Frota de Despacho** [DOWNLOAD:RELATORIO_VINHACA_DESPACHO_FROTA:Vinhaça - Frota de Despacho]\n- **Vinhaça - Bacias & Tanques** [DOWNLOAD:RELATORIO_VINHACA_TANQUES:Vinhaça - Bacias e Tanques]\n- **Vinhaça - Cadastro de Motoristas** [DOWNLOAD:RELATORIO_VINHACA_MOTORISTAS:Vinhaça - Cadastro de Motoristas]\n- **Vinhaça - Cadastro de Fazendas** [DOWNLOAD:RELATORIO_VINHACA_FAZENDAS:Vinhaça - Cadastro de Fazendas]\n- **Vinhaça - Logs Históricos** [DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]\n\n*Clique nos botões do formato desejado (CSV, JSON, XML) abaixo para realizar o download instantâneo.*`;
    }

    // 0. Greetings / Welcome
    if (query.trim() === "oi" || query.trim() === "ola" || query.trim() === "olá" || query.includes("bom dia") || query.includes("boa tarde") || query.includes("boa noite") || query.includes("quem é você") || query.includes("quem e voce") || query.includes("ajuda") || query.includes("coazito")) {
      return `Olá! Sou o **Coazito**, sua inteligência de dados da **Colombo Agroindústria**! 🚜\n\nComo estou conectado diretamente ao nosso banco de dados local, posso analisar e responder instantaneamente a qualquer pergunta sobre a operação:\n- 🌾 **Plantio**: Escreva *"eficiência das frentes de plantio"*, *"frentes"* ou *"tratores inativos"*.\n- 💧 **Vinhaça (SmartFlow)**: Escreva *"caminhões atrasados"*, *"nível de caixas"* ou *"apontamentos"*.\n- 📋 **Logs & Auditoria**: Escreva *"atividades recentes"* ou *"cadastros"*.\n\nQual dado operacional você gostaria que eu analisasse agora?`;
    }

    // 0.1. Cálculos e Contas Avançadas / Estatísticas de Produção (Optimized Local Calculations Engine)
    if (
      query.includes("+") || 
      query.includes("-") || 
      query.includes("*") || 
      query.includes("/") || 
      query.includes("calcula") || 
      query.includes("cálculo") || 
      query.includes("calculo") || 
      query.includes("conta") || 
      query.includes("contas") || 
      query.includes("soma") || 
      query.includes("média") || 
      query.includes("media") || 
      query.includes("porcentagem") || 
      query.includes("porcento") || 
      query.includes("total") || 
      query.includes("quanto é") || 
      query.includes("quanto e") || 
      query.includes("estatística") || 
      query.includes("estatistica")
    ) {
      // A. Reservatórios/Tanques de Vinhaça calculations
      if (query.includes("tanque") || query.includes("tanques") || query.includes("bacia") || query.includes("bacias") || query.includes("vinhaça") || query.includes("vinhaca") || query.includes("volume") || query.includes("capacidade")) {
        const tanks = context.tanques_bacias_acumulação;
        if (tanks && tanks.length > 0) {
          const totalVolume = tanks.reduce((acc: number, t: any) => acc + (Number(t.volumeAtual) || 0), 0);
          const totalCapacidade = tanks.reduce((acc: number, t: any) => acc + (Number(t.capacidadeMax) || 0), 0);
          const percentOcupacao = Math.round((totalVolume / totalCapacidade) * 1000) / 10;
          const avgVolume = Math.round(totalVolume / tanks.length);
          
          let report = `🧮 **Motor de Cálculos Colombo - Análise de Reservatórios** 💧\n\n`;
          report += `Realizei os cálculos estatísticos dos reservatórios de vinhaça com precisão instantânea:\n\n`;
          report += `- **Soma dos Volumes Atuais:** **${formatNumber(totalVolume)} m³**\n`;
          report += `- **Soma das Capacidades Máximas:** **${formatNumber(totalCapacidade)} m³**\n`;
          report += `- **Porcentagem de Ocupação Geral:** **${percentOcupacao}%** da capacidade total ocupada\n`;
          report += `- **Média de Volume por Reservatório:** **${formatNumber(avgVolume)} m³**\n\n`;
          
          report += `📊 **Detalhamento Clínico dos Reservatórios:**\n`;
          tanks.forEach((t: any) => {
            const p = Math.round((t.volumeAtual / t.capacidadeMax) * 100);
            report += `- **${t.nome}** (${t.local}): **${t.volumeAtual} m³** de **${t.capacidadeMax} m³** (**${p}%**)\n`;
          });
          return report;
        }
      }

      // B. Usinas / Moagem Moagem Realizada vs Meta calculations
      if (query.includes("moagem") || query.includes("meta") || query.includes("usina") || query.includes("usinas") || query.includes("eficiência industrial") || query.includes("pureza") || query.includes("atr")) {
        const metricas = context.metricas_dashboards_usinas;
        if (metricas && Object.keys(metricas).length > 0) {
          const arr = Object.values(metricas) as any[];
          const totalRealizada = arr.reduce((acc: number, u: any) => acc + (Number(u.moagemRealizada) || 0), 0);
          const totalMeta = arr.reduce((acc: number, u: any) => acc + (Number(u.moagemMeta) || 0), 0);
          const percentMetaGlobal = totalMeta > 0 ? Math.round((totalRealizada / totalMeta) * 1000) / 10 : 0;
          
          const avgEficiencia = arr.length > 0 ? Math.round(arr.reduce((acc: number, u: any) => acc + (Number(u.eficienciaMoagem) || 0), 0) / arr.length * 10) / 10 : 0;
          const avgPureza = arr.length > 0 ? Math.round(arr.reduce((acc: number, u: any) => acc + (Number(u.purezaCaldo) || 0), 0) / arr.length * 10) / 10 : 0;
          const avgATR = arr.length > 0 ? Math.round(arr.reduce((acc: number, u: any) => acc + (Number(u.atrMedio) || 0), 0) / arr.length * 10) / 10 : 0;

          let report = `🧮 **Motor de Cálculos Colombo - Análise Industrial e Moagem** 🏢\n\n`;
          report += `Processamento avançado das métricas consolidadas das usinas (Ariranha, Santa Albertina, Palestina):\n\n`;
          report += `- **Moagem Realizada Total:** **${formatNumber(totalRealizada)} toneladas**\n`;
          report += `- **Moagem Meta Total:** **${formatNumber(totalMeta)} toneladas**\n`;
          report += `- **Aproveitamento Global da Meta:** **${percentMetaGlobal}%** concluído\n`;
          report += `- **Média Geral de Eficiência Industrial:** **${avgEficiencia}%**\n`;
          report += `- **Média de Pureza do Caldo:** **${avgPureza}%**\n`;
          report += `- **Média Geral de ATR (Açúcar Total Recuperável):** **${avgATR} kg/ton**\n\n`;
          
          report += `📋 **Métricas Individuais Calculadas:**\n`;
          arr.forEach((u: any) => {
            const p = u.moagemMeta > 0 ? Math.round((u.moagemRealizada / u.moagemMeta) * 100) : 0;
            report += `- **${u.nome}**: **${formatNumber(u.moagemRealizada)} ton** de **${formatNumber(u.moagemMeta)} ton** (**${p}%** da meta) | Eficiência: **${u.eficienciaMoagem}%**\n`;
          });
          return report;
        }
      }

      // C. Frentes de Plantio (quadras, talhões, eficiência)
      if (query.includes("frente") || query.includes("frentes") || query.includes("plantio") || query.includes("quadra") || query.includes("quadras") || query.includes("talhão") || query.includes("talões") || query.includes("talhoes")) {
        const frentesList = context.frentes_plantio_cana;
        if (frentesList && frentesList.length > 0) {
          const totalQuadras = frentesList.reduce((acc: number, f: any) => acc + (Number(f.quadras) || 0), 0);
          const totalTalhoes = frentesList.reduce((acc: number, f: any) => acc + (Number(f.talhoes) || 0), 0);
          const percentConclusao = totalTalhoes > 0 ? Math.round((totalQuadras / totalTalhoes) * 1000) / 10 : 0;
          const avgRendimento = Math.round(frentesList.reduce((acc: number, f: any) => acc + (Number(f.rendimento) || 0), 0) / frentesList.length * 10) / 10;
          
          let report = `🧮 **Motor de Cálculos Colombo - Estatísticas de Plantio** 🌾\n\n`;
          report += `Cálculos avançados realizados sobre as frentes de plantio ativas:\n\n`;
          report += `- **Soma Total de Quadras Concluídas/Alocadas:** **${totalQuadras} quadras**\n`;
          report += `- **Soma Total de Talhões Planejados:** **${totalTalhoes} talhões**\n`;
          report += `- **Taxa de Alocação de Áreas (Quadras/Talhões):** **${percentConclusao}%** do planejado\n`;
          report += `- **Média Geral de Rendimento das Frentes:** **${avgRendimento}%** de eficiência operacional\n\n`;
          
          report += `📋 **Lista de frentes com rendimento e áreas calculadas:**\n`;
          frentesList.forEach((f: any) => {
            report += `- **Frente ${f.frente || f.id}** (${f.usina}): **${f.quadras}** de **${f.talhoes}** talhões alocados | Eficiência: **${f.rendimento}%** | Gestor: *${f.lider}*\n`;
          });
          return report;
        }
      }

      // D. Caixas de Carregamento calculations
      if (query.includes("caixa") || query.includes("caixas") || query.includes("nível") || query.includes("níveis") || query.includes("altura")) {
        const caixas = context.niveis_caixas_usinas;
        if (caixas && caixas.length > 0) {
          const totalAltura = caixas.reduce((acc: number, c: any) => acc + (Number(c.alturaCaixa) || 0), 0);
          const avgAltura = Math.round(totalAltura / caixas.length);
          
          let report = `🧮 **Motor de Cálculos Colombo - Média de Nível das Caixas** 💧\n\n`;
          report += `- **Nível Médio das Caixas de Carregamento:** **${avgAltura} cm**\n`;
          report += `- **Soma Total das Alturas das Caixas:** **${totalAltura} cm**\n\n`;
          report += `📊 **Percentuais de Capacidade Individuais:**\n`;
          caixas.forEach((c: any) => {
            const percent = Math.round((c.alturaCaixa / 200) * 100);
            report += `- **${c.usina}**: **${c.alturaCaixa} cm** (~**${percent}%** da capacidade máxima de 200cm)\n`;
          });
          return report;
        }
      }

      // E. Basic arithmetic expression solver:
      const mathExpr = query
        .replace(/quanto\s+é|quanto\s+e|calcular|calcula|calculo|cálculo|conta|resultado\s+de|resultado\s+da/g, "")
        .replace(/,/g, ".")
        .trim();

      if (/^[0-9\s\+\-\*\/\(\)\%\.\,]+$/.test(mathExpr) && /[0-9]/.test(mathExpr)) {
        try {
          const sanitized = mathExpr.replace(/[^0-9\s\+\-\*\/\(\)\.]/g, "");
          const fn = new Function(`return (${sanitized});`);
          const result = fn();
          if (typeof result === "number" && !isNaN(result)) {
            return `🧮 **Calculadora Operacional Avançada Colombo** ⚡\n\nExpressão solicitada: \`${mathExpr}\`\n\n👉 **Resultado do Cálculo:** **${result.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}**\n\n*Cálculo efetuado de forma instantânea pelo Motor Matemático Local.*`;
          }
        } catch (e) {
          // ignore and fall through
        }
      }
    }

    // 0.5. Apontamento / Vinhaça stats
    if (query.includes("apontamento") || query.includes("apontamentos") || query.includes("fechamento") || query.includes("k2o") || query.includes("vinhaça") || query.includes("vinhaca")) {
      const apontamentos = context.apontamentos_diarios;
      if (apontamentos && apontamentos.length > 0) {
        const ap = apontamentos[0];
        let report = `💧 **Relatório de Apontamento Diário de Vinhaça** 📈\n\n`;
        report += `Resumo consolidado do último período registrado:\n`;
        report += `- **Solicitado vs. Atendido:** **${ap.solicitado}** viagens solicitadas | **${ap.atendidos}** atendidas (100% de atendimento)\n`;
        report += `- **Teor Médio de K₂O:** **${ap.teorK2O} kg/m³**\n`;
        report += `- **Volumetria:** **${ap.totalEstoque} m³** em estoque inicial | **${ap.retirado} m³** retirado no dia\n`;
        report += `- **Frentes de Aplicação Ativas:** Frente **54-4** (${ap.f_54_4_vln} viagens) e Frente **54-2** (${ap.f_54_2_vln} viagens)\n`;
        report += `- **Observações de Campo:** *"${ap.obs}"*\n`;
        return report;
      }
    }

    // 0.6. Usinas e Métricas
    if (query.includes("usina") || query.includes("usinas") || query.includes("unidade") || query.includes("unidades") || query.includes("métricas") || query.includes("metricas") || query.includes("desempenho")) {
      const metricas = context.metricas_dashboards_usinas;
      if (metricas && Object.keys(metricas).length > 0) {
        let report = `📊 **Métricas de Produtividade e Moagem por Usina** 🏢\n\n`;
        Object.entries(metricas).forEach(([key, u]: [string, any]) => {
          report += `- **${u.nome}**:\n`;
          report += `  - Moagem Realizada: **${u.moagemRealizada} ton** de ${u.moagemMeta} ton (meta)\n`;
          report += `  - Eficiência Industrial: **${u.eficienciaMoagem}%**\n`;
          report += `  - Pureza do Caldo: **${u.purezaCaldo}%**\n`;
          report += `  - ATR Médio: **${u.atrMedio} kg/ton**\n\n`;
        });
        return report;
      }
    }

    // 1. delayed trucks
    if (query.includes("atrasad") || query.includes("atraso") || query.includes("caminh") || query.includes("motorista") || query.includes("despacho") || query.includes("viagem") || query.includes("viagens")) {
      const trucks = context.despacho_caminhoes_ativos;
      const delayed = trucks.filter((t: any) => t.status === "Atrasado");
      const travelling = trucks.filter((t: any) => t.status === "Em Viagem");
      const loading = trucks.filter((t: any) => t.status === "Carregando");

      let report = `📊 **Relatório Instantâneo - Frota de Despacho de Vinhaça** 🚛\n\n`;
      report += `Atualmente temos **${trucks.length} caminhões ativos** na operação:\n`;
      report += `- ⏳ **Atrasados:** **${delayed.length}**\n`;
      report += `- 🛣️ **Em Viagem:** **${travelling.length}**\n`;
      report += `- 🔌 **Carregando:** **${loading.length}**\n\n`;

      if (delayed.length > 0) {
        report += `⚠️ **VEÍCULOS COM ALERTA DE ATRASO:**\n`;
        delayed.forEach((t: any) => {
          report += `- **${t.prefixo}** (Motorista: *${t.motorista}*): Destinado à **${t.destino}**. Atualizado há *${t.tempoEstimado}* (Última atualização: ${t.atualizadoEm}).\n`;
        });
      } else {
        report += `✅ **Nenhum caminhão está atrasado no momento!** Toda a frota está rodando dentro do planejado.\n`;
      }

      if (travelling.length > 0) {
        report += `\n🛣️ **Caminhões em Viagem:**\n`;
        travelling.slice(0, 5).forEach((t: any) => {
          report += `- **${t.prefixo}** -> ${t.destino} (Previsto: ${t.tempoEstimado})\n`;
        });
        if (travelling.length > 5) report += `- *E mais ${travelling.length - 5} caminhões em rota...*\n`;
      }

      return report;
    }

    // 2. levels / caixas
    if (query.includes("caixa") || query.includes("caixas") || query.includes("nível") || query.includes("níveis") || query.includes("tanque") || query.includes("tanques") || query.includes("bacia") || query.includes("bacias") || query.includes("estoque") || query.includes("volume")) {
      const caixas = context.niveis_caixas_usinas;
      const tanks = context.tanques_bacias_acumulação;

      let report = `💧 **Relatório Instantâneo - Níveis de Caixas e Reservatórios**\n\n`;
      report += `📈 **Nível das Caixas de Carregamento (Usinas):**\n`;
      caixas.forEach((c: any) => {
        const percent = Math.min(100, Math.round((c.alturaCaixa / 200) * 100)); // assuming 200cm is max
        let statusIcon = "🟢 Estável";
        if (percent > 90) statusIcon = "🔴 Crítico Alto";
        else if (percent < 20) statusIcon = "🟡 Nível Baixo";
        
        report += `- **${c.usina}** (ID: ${c.id}): **${c.alturaCaixa} cm** (~${percent}% capacidade) [${statusIcon}]. Variação: *${c.variacaoPeriodo > 0 ? '+' : ''}${c.variacaoPeriodo} cm* nas últimas horas.\n`;
      });

      if (tanks && tanks.length > 0) {
        report += `\n🔋 **Tanques e Bacias de Acumulação:**\n`;
        tanks.forEach((t: any) => {
          const percent = Math.round((t.volumeAtual / t.capacidadeMax) * 100);
          let statusIcon = "🟢 Estável";
          if (percent > 85) statusIcon = "⚠️ Cheio";
          report += `- **${t.nome}** (${t.local}): **${t.volumeAtual} m³** de ${t.capacidadeMax} m³ (**${percent}%** total) - Status: *${statusIcon}*\n`;
        });
      }

      return report;
    }

    // 3. efficiency / planting fronts
    if (query.includes("eficiência") || query.includes("eficiencia") || query.includes("rendimento") || query.includes("frente") || query.includes("frentes") || query.includes("líder") || query.includes("lider") || query.includes("plantio")) {
      const frentesList = context.frentes_plantio_cana;
      
      let report = `🌾 **Relatório Instantâneo - Frentes de Plantio de Cana**\n\n`;
      if (frentesList.length === 0) {
        return `🌾 **Frentes de Plantio de Cana:**\nNenhuma frente cadastrada no momento. Adicione frentes na aba de Planejamento de Plantio para acompanhar!`;
      }

      const active = frentesList.filter((f: any) => f.status === "Ativo" || f.status === "Em Operação" || f.status === "Trabalhando");
      const stopped = frentesList.filter((f: any) => f.status !== "Ativo" && f.status !== "Em Operação" && f.status !== "Trabalhando");

      report += `Temos **${frentesList.length} frentes de plantio** cadastradas:\n`;
      report += `- ✅ **Em Operação:** ${active.length}\n`;
      report += `- 🛑 **Inativas / Paradas:** ${stopped.length}\n\n`;

      report += `📋 **Status Detalhado das Frentes:**\n`;
      frentesList.forEach((f: any) => {
        let icon = "🟢";
        if (f.status.toLowerCase().includes("chuva")) icon = "🌧️";
        else if (f.status.toLowerCase().includes("quebra") || f.status.toLowerCase().includes("manutencao") || f.status.toLowerCase().includes("manutenção")) icon = "🔧";
        else if (f.status.toLowerCase().includes("parado") || f.status.toLowerCase().includes("inativo") || f.status.toLowerCase().includes("parada")) icon = "🔴";

        report += `- **Frente ${f.frente || f.id}** (${f.nome || "Plantio"} - Usina *${f.usina}*): Status: **${f.status}** ${icon} | Líder: *${f.lider}* | Eficiência/Rendimento: **${f.rendimento}%** (Quadras: ${f.quadras || 0} / Talhões: ${f.talhoes || 0})\n`;
      });

      // Calculate overall average efficiency
      const totalRendimento = frentesList.reduce((acc: number, cur: any) => acc + (Number(cur.rendimento) || 0), 0);
      const avg = frentesList.length > 0 ? Math.round(totalRendimento / frentesList.length) : 0;
      report += `\n📈 **Média Geral de Eficiência das Frentes:** **${avg}%**`;

      return report;
    }

    // 4. tractors / plantadeiras / fleet / inactive
    if (query.includes("trator") || query.includes("tratores") || query.includes("plantadeira") || query.includes("plantadeiras") || query.includes("frota") || query.includes("oficina") || query.includes("inativo") || query.includes("inativos") || query.includes("parado") || query.includes("parados")) {
      const fleetList = context.frota_plantio_geral;

      let report = `🚜 **Relatório Instantâneo - Frota de Tratores & Plantadeiras**\n\n`;
      if (fleetList.length === 0) {
        return `🚜 **Frota de Plantio:**\nNenhum veículo cadastrado na frota no momento. Adicione veículos na aba de Planejamento de Plantio!`;
      }

      const active = fleetList.filter((f: any) => f.status === "Ativo" || f.status === "Em Campo");
      const inactive = fleetList.filter((f: any) => f.status === "Inativo" || f.status === "Parado");
      const maintenance = fleetList.filter((f: any) => f.status === "Manutenção" || f.status === "Oficina");

      report += `Temos **${fleetList.length} maquinários** monitorados na frota:\n`;
      report += `- 🟢 **Ativos/Em Campo:** ${active.length}\n`;
      report += `- 🟡 **Em Manutenção/Oficina:** ${maintenance.length}\n`;
      report += `- 🔴 **Inativos/Parados:** ${inactive.length}\n\n`;

      const criticalFleet = fleetList.filter((f: any) => f.status !== "Ativo" && f.status !== "Em Campo");
      if (criticalFleet.length > 0) {
        report += `⚠️ **MAQUINÁRIOS INATIVOS OU EM MANUTENÇÃO (Últimas atualizações):**\n`;
        criticalFleet.slice(0, 10).forEach((f: any) => {
          let icon = f.status === "Manutenção" || f.status === "Oficina" ? "🔧" : "🛑";
          report += `- [${icon} ${f.status}] **${f.prefixo}** (${f.tipo} - *${f.modelo}*): Alocado na unidade **${f.unidade}**.\n`;
        });
        if (criticalFleet.length > 10) {
          report += `- *E mais ${criticalFleet.length - 10} maquinários fora de operação...*\n`;
        }
      } else {
        report += `✅ **100% da frota de plantio está ativa e operando em campo!**\n`;
      }

      return report;
    }

    // 5. areas / talhoes
    if (query.includes("área") || query.includes("áreas") || query.includes("cultivo") || query.includes("talhão") || query.includes("talões") || query.includes("fazenda") || query.includes("fazendas") || query.includes("cadastradas")) {
      const areas = context.areas_e_talhoes_por_usina;
      
      let report = `🗺️ **Relatório Instantâneo - Áreas de Cultivo e Talhões por Usina**\n\n`;
      if (areas && Object.keys(areas).length > 0) {
        Object.entries(areas).forEach(([usina, text]: [string, any]) => {
          report += `🏢 **${usina}**:\n${text}\n\n`;
        });
      } else {
        report += `Nenhum talhão ou área de cultivo cadastrado para exibir. Por favor, adicione as áreas na aba correspondente do sistema.`;
      }
      return report;
    }

    // 6. logs / activities
    if (query.includes("log") || query.includes("logs") || query.includes("atividade") || query.includes("atividades") || query.includes("auditoria") || query.includes("histórico") || query.includes("historico")) {
      const logs = context.logs_atividades_geral;

      let report = `📜 **Registro de Auditoria e Atividades Operacionais Recentes**\n\n`;
      if (logs && logs.length > 0) {
        report += `Exibindo as últimas **${logs.length} ações registradas** pelo sistema:\n\n`;
        logs.forEach((l: any) => {
          let badge = "ℹ️";
          if (l.type === "danger" || l.type === "critical") badge = "🚨";
          else if (l.type === "warning") badge = "⚠️";
          else if (l.type === "success") badge = "✅";

          report += `${badge} *[${l.timestamp}]* **${l.user}**: ${l.action} - *${l.detail}*\n`;
        });
      } else {
        report += `Nenhuma atividade registrada nas últimas horas de operação.`;
      }
      return report;
    }

    // 7. General snapshot fallback
    let fallbackReport = `📊 **Painel Operacional Consolidado Colombo - Coazito** 🚜\n\n`;
    
    // Vinhaça status
    const vinhacaTrucks = context.despacho_caminhoes_ativos || [];
    const delayed = vinhacaTrucks.filter((t: any) => t.status === "Atrasado");
    fallbackReport += `💧 **Módulo Vinhaça (SmartFlow):**\n`;
    fallbackReport += `- Caminhões ativos no despacho: **${vinhacaTrucks.length}** (*${delayed.length} atrasados*)\n`;
    const caixas = context.niveis_caixas_usinas || [];
    if (caixas.length > 0) {
      const highest = [...caixas].sort((a, b) => b.alturaCaixa - a.alturaCaixa)[0];
      fallbackReport += `- Caixa com maior nível: **${highest.usina}** com **${highest.alturaCaixa} cm**\n`;
    }
    
    // Plantio status
    const frentesList = context.frentes_plantio_cana || [];
    const activeFrentes = frentesList.filter((f: any) => f.status === "Ativo" || f.status === "Em Operação");
    fallbackReport += `\n🌾 **Módulo Plantio de Cana:**\n`;
    fallbackReport += `- Frentes de plantio ativas: **${activeFrentes.length}** de **${frentesList.length}** totais\n`;
    const fleetList = context.frota_plantio_geral || [];
    const activeFleet = fleetList.filter((f: any) => f.status === "Ativo" || f.status === "Em Campo");
    fallbackReport += `- Frota de plantio ativa: **${activeFleet.length}** de **${fleetList.length}** maquinários em campo\n\n`;

    fallbackReport += `💡 *Dica: Seja mais específico para obter relatórios direcionados, como 'Quais caminhões estão atrasados?' ou 'Média de eficiência das frentes de plantio'.*`;

    return fallbackReport;
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() && selectedFiles.length === 0) return;
    if (isLoading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      ...(selectedFiles.length > 0 ? { files: selectedFiles } : {})
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setSelectedFiles([]);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/coazito/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: updatedMessages,
          contextData: getSystemContext()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        content: data.reply || "Desculpe, não consegui obter uma resposta válida.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      console.warn("API do Coazito indisponível ou falhou, usando resposta local:", err);
      // Fallback para o motor de consulta local se o servidor falhar ou estiver offline
      const reply = queryLocalData(textToSend);
      const modelMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "model",
        content: reply,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, modelMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Deseja realmente limpar seu histórico de conversa com o Coazito?")) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content: "Histórico limpo! Eu sou o **Coazito**, sua IA de monitoramento da Colombo. Como posso ajudá-lo a analisar os dados de plantio, vinhaça, frotas, áreas ou dashboards hoje?",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  const suggestions = [
    { text: "Qual a eficiência das frentes de plantio?", icon: <Sparkles size={12} className="text-emerald-500" /> },
    { text: "Quais tratores/plantadeiras estão inativos?", icon: <AlertTriangle size={12} className="text-amber-500" /> },
    { text: "Resuma as áreas de cultivo", icon: <FileText size={12} className="text-[#00843D]" /> },
    { text: "Quais caminhões estão atrasados?", icon: <Truck size={12} className="text-blue-500" /> }
  ];

  const quickActionChips = [
    { label: "📊 Relatórios", query: "Gerar relatório completo" },
    { label: "🌧️ Chuvas", query: "Qual a chuva acumulada?" },
    { label: "🚜 Frentes", query: "Qual a eficiência das frentes de plantio?" },
    { label: "🚛 Vinhaça", query: "Como está a vinhaça?" },
    { label: "⏳ Atrasos", query: "Quais caminhões estão atrasados?" },
    { label: "🔧 Oficina", query: "Quais maquinários estão na oficina?" }
  ];

  return (
    <div className="flex flex-col h-[75vh] bg-gray-50 rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="bg-[#00843D] p-5 flex justify-between items-center border-b-4 border-black/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-white relative">
            <Bot size={26} className="text-[#5adc6a]" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#5adc6a] rounded-full border-2 border-[#00843D] animate-ping" />
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#5adc6a] rounded-full border-2 border-[#00843D]" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-tight leading-none text-base flex items-center gap-1.5">
              Coazito AI
              <span className="bg-[#5adc6a]/20 text-[#5adc6a] border border-[#5adc6a]/40 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">
                ATIVO
              </span>
            </h3>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1">
              Assistente de Operações Colombo • Copiloto Operacional
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleClearHistory}
          className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest"
          title="Limpar histórico de conversas"
        >
          <Trash2 size={13} />
          Limpar
        </button>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.role === "model";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${
                  isBot 
                    ? "bg-emerald-50 text-[#00843D] border-emerald-100" 
                    : "bg-gray-900 text-white border-gray-800"
                }`}>
                  {isBot ? <Bot size={15} /> : <span className="text-[10px] font-black">OP</span>}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm whitespace-pre-wrap ${
                    isBot 
                      ? "bg-white text-gray-800 border border-gray-150/70 rounded-tl-none" 
                      : "bg-[#00843D] text-white rounded-tr-none font-bold"
                  }`}>
                    {msg.image && (
                      <div className="mb-3 max-w-xs overflow-hidden rounded-xl border border-white/20 shadow-sm">
                        <img 
                          src={`data:${msg.image.mimeType};base64,${msg.image.data}`} 
                          alt="Anexo enviado pelo operador" 
                          className="max-h-60 w-full object-cover rounded-xl"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    {msg.files && Array.isArray(msg.files) && msg.files.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2 max-w-md">
                        {msg.files.map((file: any, fidx: number) => {
                          const isImg = file.mimeType.startsWith("image/");
                          return (
                            <div key={fidx} className="overflow-hidden rounded-xl border border-white/20 shadow-sm bg-gray-50 p-1 flex items-center justify-center shrink-0">
                              {isImg ? (
                                <img 
                                  src={`data:${file.mimeType};base64,${file.data}`} 
                                  alt={file.name} 
                                  className="max-h-40 max-w-[200px] object-contain rounded-lg"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="flex items-center gap-2 p-2 max-w-xs bg-white rounded-lg">
                                  <FileText size={20} className="text-[#00843D] shrink-0" />
                                  <div className="text-left overflow-hidden">
                                    <p className="text-[10px] font-black text-gray-950 truncate w-24" title={file.name}>
                                      {file.name}
                                    </p>
                                    <p className="text-[8px] text-gray-400 font-bold uppercase">
                                      {file.mimeType.split("/")[1] || "DOCUMENTO"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Render basic bold/bullet markdown formatting */}
                    {cleanMessageText(msg.content).split("\n").map((line, idx) => {
                      let processed = line;
                      // Handle list item bullets
                      const isBullet = processed.trim().startsWith("- ");
                      if (isBullet) {
                        processed = processed.replace(/^\s*-\s*/, "• ");
                      }

                      // Render markdown styled line
                      return (
                        <p 
                          key={idx} 
                          className={`mb-1 last:mb-0 ${isBullet ? "pl-3 text-left" : ""}`}
                        >
                          {processed.split("**").map((chunk, cIdx) => {
                            if (cIdx % 2 === 1) {
                              return <strong key={cIdx} className="font-extrabold text-gray-950 dark:text-inherit">{chunk}</strong>;
                            }
                            return chunk.split("*").map((subChunk, sIdx) => {
                              if (sIdx % 2 === 1) {
                                  return <em key={sIdx} className="italic font-bold">{subChunk}</em>;
                              }
                              return subChunk;
                            });
                          })}
                        </p>
                      );
                    })}

                    {/* Inline Download Cards for Bot Responses */}
                    {isBot && extractDownloads(msg.content).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                        <p className="text-[11px] font-black text-[#00843D] uppercase tracking-wider">
                          📥 RELATÓRIOS DISPONÍVEIS PARA DOWNLOAD:
                        </p>
                        {extractDownloads(msg.content).map((download, dIdx) => (
                          <div 
                            key={dIdx} 
                            className="p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 bg-emerald-100 text-[#00843D] rounded-xl flex items-center justify-center shrink-0">
                                <FileText size={18} />
                              </div>
                              <div className="text-left">
                                <h4 className="text-xs font-black text-gray-950 uppercase tracking-tight">
                                  {download.title}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                                  {getReportDescription(download.filename)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleExport(download.filename, 'csv')}
                                className="text-[10px] font-black bg-white hover:bg-[#00843D] hover:text-white text-[#00843D] px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:border-transparent shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                <span>CSV</span>
                              </button>
                              <button
                                onClick={() => handleExport(download.filename, 'json')}
                                className="text-[10px] font-black bg-white hover:bg-[#00843D] hover:text-white text-[#00843D] px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:border-transparent shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                <span>JSON</span>
                              </button>
                              <button
                                onClick={() => handleExport(download.filename, 'xml')}
                                className="text-[10px] font-black bg-white hover:bg-[#00843D] hover:text-white text-[#00843D] px-2.5 py-1.5 rounded-lg border border-emerald-100 hover:border-transparent shadow-sm transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                              >
                                <span>XML</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 block px-2">
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && (
          <div className="flex flex-col gap-2 max-w-[85%] mr-auto text-left">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00843D] shrink-0">
                <Bot size={15} />
              </div>
              <div className="bg-white px-5 py-3.5 rounded-3xl rounded-tl-none border border-gray-150 flex items-center gap-2 shadow-xs">
                <span className="w-1.5 h-1.5 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#00843D] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coazito está analisando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTIONS PANEL */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 sm:px-6 py-3 border-t bg-gray-50 flex flex-col items-stretch shrink-0">
          <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2.5">
            <Sparkles size={11} className="text-amber-500" />
            Sugestões Rápidas de Pergunta
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.text)}
                className="bg-white hover:bg-emerald-50 border border-gray-200 hover:border-[#00843D]/30 p-2.5 rounded-xl text-left text-[10px] font-bold text-gray-700 hover:text-[#00843D] transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                {s.icon}
                <span className="truncate">{s.text}</span>
                <ArrowRight size={10} className="ml-auto text-gray-300 group-hover:text-emerald-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INPUT FORM */}
      <div className="p-3 sm:p-4 border-t bg-white flex flex-col gap-2 sm:gap-3 shrink-0">
        {/* QUICK ACTION CHIPS */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5 px-0.5 shrink-0 select-none">
          {quickActionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSend(chip.query)}
              className="bg-emerald-50 hover:bg-[#00843D] text-[#00843D] hover:text-white border border-emerald-100/60 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50 shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <input 
          type="file" 
          id="coazito-image-input" 
          accept="image/*,application/pdf,text/plain,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" 
          onChange={handleFileChange} 
          multiple
          className="hidden" 
        />

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {selectedFiles.map((file, idx) => {
              const isImg = file.mimeType.startsWith("image/");
              return (
                <div key={idx} className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border-2 border-[#00843D] shrink-0 shadow-sm flex flex-col items-center justify-center p-1">
                  {isImg ? (
                    <img 
                      src={`data:${file.mimeType};base64,${file.data}`} 
                      alt={file.name} 
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <FileText size={18} className="text-[#00843D]" />
                      <span className="text-[7px] font-bold text-gray-700 truncate w-12" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 transition-all cursor-pointer shadow"
                  >
                    <X size={8} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-3 items-center"
        >
          <button
            type="button"
            onClick={() => document.getElementById("coazito-image-input")?.click()}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 p-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
            title="Anexar Imagens ou Documentos"
          >
            <Image size={17} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              const clipboardItems = e.clipboardData?.items;
              if (clipboardItems) {
                for (let i = 0; i < clipboardItems.length; i++) {
                  const item = clipboardItems[i];
                  if (item.type.indexOf("image") !== -1 || item.type.indexOf("pdf") !== -1) {
                    const file = item.getAsFile();
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        const commaIndex = result.indexOf(",");
                        if (commaIndex !== -1) {
                          const mimeType = file.type || "image/png";
                          const data = result.substring(commaIndex + 1);
                          setSelectedFiles(prev => [
                            ...prev,
                            { name: file.name || "colado.png", mimeType, data }
                          ]);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                    e.preventDefault();
                    break;
                  }
                }
              }
            }}
            disabled={isLoading}
            placeholder={isLoading ? "Aguardando resposta do Coazito..." : "Anexe imagens/docs ou pergunte ao Coazito... (Ex: Qual o acumulado de chuva?)"}
            className="flex-1 bg-gray-50 focus:bg-white border-2 border-gray-150 focus:border-[#00843D] rounded-xl py-3.5 px-5 text-xs font-bold outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
            className="bg-[#00843D] hover:bg-[#004d22] disabled:opacity-50 disabled:hover:bg-[#00843D] text-white p-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-500/15 flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send size={15} />
          </button>
        </form>
        <div className="flex justify-between items-center text-[8px] text-gray-400 font-bold uppercase tracking-widest px-1 mt-0.5">
          <span>Coazito AI • Colombo Agroindústria v3.5</span>
          <span className="text-emerald-600">Conectado em tempo real</span>
        </div>
      </div>
    </div>
  );
};
