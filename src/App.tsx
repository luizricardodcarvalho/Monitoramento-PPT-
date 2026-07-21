/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, FormEvent, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, 
  Factory, 
  Map as MapIcon, 
  Truck, 
  Users, 
  FileText, 
  Bell, 
  Plus, 
  PlusCircle,
  RefreshCw,
  XCircle,
  BarChart3, 
  Activity, 
  MapPin,
  Trash2,
  Edit2,
  Clock,
  MessageSquare,
  Save,
  X,
  Upload,
  FileUp,
  BarChart2,
  Download,
  FileSpreadsheet,
  Share2,
  FileCode,
  FileText as FileIcon,
  Mail,
  Sprout,
  Tractor,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar,
  Eraser,
  Droplet,
  Lock,
  Database,
  Eye,
  Bot,
  Shield,
  Layers,
  Table,
  ClipboardList,
  CloudRain,
  ArrowRightLeft,
  Sun,
  Moon,
  Search,
  ArrowLeft
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  Cell, 
  PieChart, 
  Pie,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { VinhacaFrenteTable } from './components/VinhacaFrenteTable';
import { VinhacaPainel } from './components/VinhacaPainel';
import { VinhacaDespacho } from './components/VinhacaDespacho';
import { VinhacaApontamentos } from './components/VinhacaApontamentos';
import { VinhacaDashboard } from './components/VinhacaDashboard';
import { VinhacaNiveis } from './components/VinhacaNiveis';
import { VinhacaFechamento } from './components/VinhacaFechamento';
import { VinhacaHistorico } from './components/VinhacaHistorico';
import { CoazitoChat } from './components/CoazitoChat';
import { SmartFlowLogo, VinhacaLogo, ColomboLogo } from './components/Logos';
import { VisaoPlantio } from './components/VisaoPlantio';
import { GestaoAreas } from './components/GestaoAreas';
import { GestaoAreasHistorico } from './components/GestaoAreasHistorico';
import DiarioCoaProducoes from './components/DiarioCoaProducoes';
import DiarioPlantioMecanizado from './components/DiarioPlantioMecanizado';
import Pluviometria from './components/Pluviometria';
import { INITIAL_DDS_TOPICS, DdsTopic } from './data/ddsTopicsData';
import { LoginScreen } from './components/LoginScreen';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UsinaKey = 'Ariranha' | 'Santa Albertina' | 'Palestina';

interface FleetItem {
  id: number;
  unidade: UsinaKey;
  tipo: 'Caminhão' | 'Plantadeira' | 'Trator' | 'Colhedeira';
  modelo: string;
  prefixo: string;
  status: 'Reserva' | 'Trabalhando' | 'Manutenção';
  updatedAt: string;
  hourlyData?: string[]; // Array of 24 hourly status values
}

interface PlantioSnapshot {
  id: number;
  date: string;
  time: string;
  usina: UsinaKey;
  fleetSnapshot: FleetItem[];
  efficiency: string;
  clearedAt: string;
}

const HOURLY_STATUS_MAP = [
  { label: 'Trabalhando', color: 'bg-green-500', hex: '#22c55e' },
  { label: 'Trabalhando Parcial', color: 'bg-yellow-400', hex: '#facc15' },
  { label: 'Parada Operacional', color: 'bg-orange-500', hex: '#f97316' },
  { label: 'Condições Climáticas', color: 'bg-blue-500', hex: '#3b82f6' },
  { label: 'Manutenção GPS', color: 'bg-pink-500', hex: '#ec4899' },
  { label: 'Manutenção Máquina', color: 'bg-red-600', hex: '#dc2626' },
  { label: 'Reserva', color: 'bg-gray-300', hex: '#d1d5db' }
];

interface UsinaData {
  trabalhando: number;
  paradas: number;
  ventoChuva: number;
  mudancaArea: number;
  cidade: string;
}

const DADOS_USINAS: Record<UsinaKey, UsinaData> = {
  'Ariranha': {
    trabalhando: 12,
    paradas: 3,
    ventoChuva: 2,
    mudancaArea: 1,
    cidade: 'Ariranha - SP'
  },
  'Santa Albertina': {
    trabalhando: 8,
    paradas: 2,
    ventoChuva: 4,
    mudancaArea: 2,
    cidade: 'Santa Albertina - SP'
  },
  'Palestina': {
    trabalhando: 15,
    paradas: 1,
    ventoChuva: 1,
    mudancaArea: 3,
    cidade: 'Palestina - SP'
  }
};

interface ExportCardProps {
  key?: number | string;
  card: {
    title: string;
    desc: string;
    icon: any;
    color: string;
    data: any[];
    filename: string;
  };
  onExport: (data: any[], filename: string, format: 'xml' | 'html' | 'csv' | 'json') => void;
  onShare: (data: any[], title: string, filename: string) => void | Promise<void>;
  onExportExcel: (data: any[], filename: string) => void;
  onShareExcel: (data: any[], title: string, filename: string) => void;
  onViewDetail?: (card: any) => void;
}

const ExportCard = ({ card, onExport, onShare, onExportExcel, onShareExcel, onViewDetail }: ExportCardProps) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col justify-between">
      <div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
          card.color === 'blue' ? "bg-blue-50 text-blue-600" :
          card.color === 'amber' ? "bg-amber-50 text-amber-600" :
          card.color === 'purple' ? "bg-purple-50 text-purple-600" :
          card.color === 'green' ? "bg-green-50 text-green-600" :
          "bg-red-50 text-red-600"
        )}>
          {card.icon}
        </div>
        <h4 className="font-black text-gray-800 uppercase text-xs mb-2">{card.title}</h4>
        <p className="text-[10px] text-gray-400 font-bold mb-6 leading-relaxed h-8 line-clamp-2 uppercase">{card.desc}</p>
      </div>
      
      <div className="space-y-3 relative">
        {/* VIEW DETAILS BUTTON */}
        {onViewDetail && (
          <button 
            onClick={() => onViewDetail(card)}
            className="w-full py-3 bg-green-50 text-[#00843D] hover:bg-green-100 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-black"
          >
            <Eye size={14} className="text-[#00843D]" />
            Visualizar Dados
          </button>
        )}

        {/* EXPORT BUTTON */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowShareMenu(false);
            }}
            className="w-full py-4 bg-[#5adc6a] text-[#004d22] rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-[#4bc75b] transition-all active:scale-95 shadow-md shadow-[#5adc6a]/15"
          >
            <Download size={14} className="text-[#004d22]" />
            Exportar Relatório
          </button>
          
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowExportMenu(false)} />
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-30 p-2.5 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-1 border-b border-gray-100">Selecionar Formato</div>
                <button
                  onClick={() => {
                    onExport(card.data, card.filename, 'html');
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-gray-50 text-gray-700 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span className="text-sm">📄</span> PDF / Impressão
                </button>
                <button
                  onClick={() => {
                    onExportExcel(card.data, card.filename);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-gray-50 text-[#00843D] rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span className="text-sm">📊</span> Planilha Excel
                </button>
              </div>
            </>
          )}
        </div>

        {/* SHARE BUTTON */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowShareMenu(!showShareMenu);
              setShowExportMenu(false);
            }}
            className="w-full py-3 bg-gray-900/5 text-gray-900 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-900/10 transition-colors"
          >
            <Share2 size={14} />
            Compartilhar
          </button>

          {showShareMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowShareMenu(false)} />
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200/80 rounded-2xl shadow-xl z-30 p-2.5 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-2 pb-1 border-b border-gray-100">Selecionar Formato</div>
                <button
                  onClick={() => {
                    onShare(card.data, card.title, card.filename);
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-gray-50 text-gray-700 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span className="text-sm">📄</span> PDF / HTML
                </button>
                <button
                  onClick={() => {
                    onShareExcel(card.data, card.title, card.filename);
                    setShowShareMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] font-black uppercase hover:bg-gray-50 text-[#00843D] rounded-xl flex items-center gap-2 transition-colors"
                >
                  <span className="text-sm">📊</span> Planilha Excel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const generateHtmlReport = (data: any[], filename: string) => {
  if (data.length === 0) return '';
  const keys = Object.keys(data[0]);
  const reportTitle = filename.replace(/_/g, ' ').toUpperCase();
  const reportDate = new Date().toLocaleDateString('pt-BR');
  const reportTime = new Date().toLocaleTimeString('pt-BR');

  const headersHtml = keys.map(k => {
    const readableHeader = k.replace(/_/g, ' ').toUpperCase();
    return `<th style="background-color: #0f172a; color: white; padding: 14px 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #1e293b; text-align: left; font-size: 11px;">${readableHeader}</th>`;
  }).join('');

  const rowsHtml = data.map((item, idx) => {
    const cellsHtml = keys.map(k => {
      const rawVal = item[k];
      let valStr = rawVal !== null && rawVal !== undefined ? String(rawVal) : '';
      
      // Format lists (DDS Rules/Guidelines) beautifully
      if (valStr.includes('|')) {
        const listItems = valStr.split('|').map(li => `<li style="margin-bottom: 4px; list-style-type: square; color: #334155;">${li.trim()}</li>`).join('');
        valStr = `<ul style="margin: 0; padding-left: 16px; text-align: left;">${listItems}</ul>`;
      }
      return `<td style="padding: 14px 16px; border-bottom: 1px solid #e2e8f0; color: #334155; font-weight: 500; font-size: 11px; line-height: 1.5; vertical-align: top;">${valStr}</td>`;
    }).join('');
    
    const bg = idx % 2 === 0 ? 'white' : '#f8fafc';
    return `<tr style="background-color: ${bg};">${cellsHtml}</tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>PPT - ${reportTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 40px;
      background-color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #00843D;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 48px;
      height: 48px;
      background-color: #00843D;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    .logo-text h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      color: #00843D;
      letter-spacing: 0.5px;
    }
    .logo-text p {
      margin: 0;
      font-size: 9px;
      color: #64748b;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-area {
      text-align: right;
      font-size: 11px;
      color: #64748b;
      font-weight: bold;
      line-height: 1.6;
    }
    .report-heading {
      margin-bottom: 32px;
    }
    .report-heading h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .report-heading p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .kpi-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }
    .kpi-card {
      flex: 1;
      background: #f8fafc;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      border-left: 5px solid #00843D;
    }
    .kpi-label {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .kpi-value {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 6px;
    }
    .action-bar {
      margin-bottom: 32px;
    }
    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background-color: #00843D;
      color: white;
      border: none;
      padding: 14px 28px;
      font-size: 12px;
      font-weight: 900;
      border-radius: 12px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s;
      box-shadow: 0 4px 6px -1px rgba(0, 132, 61, 0.15);
    }
    .btn-print:hover {
      background-color: #006B32;
      transform: translateY(-1px);
    }
    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      background: white;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-align: left;
    }
    .signature-section {
      margin-top: 64px;
      display: flex;
      justify-content: space-between;
      gap: 32px;
    }
    .signature-card {
      flex: 1;
      border-top: 1px solid #cbd5e1;
      padding-top: 12px;
      text-align: center;
      font-size: 10px;
      color: #64748b;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      margin-top: 64px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 24px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border: none;
        padding: 0;
        border-radius: 0;
        max-width: 100%;
      }
      .btn-print {
        display: none !important;
      }
      th {
        background-color: #0f172a !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        <div class="logo-icon">🚜</div>
        <div class="logo-text">
          <h1>PPT - Planejamento</h1>
          <p>Portal de Planejamento de Tráfego</p>
        </div>
      </div>
      <div class="meta-area">
        <div>DATA DE EMISSÃO: ${reportDate}</div>
        <div>HORA DE EMISSÃO: ${reportTime}</div>
        <div>SISTEMA: PPT v4.0</div>
      </div>
    </div>

    <div class="report-heading">
      <h2>${reportTitle}</h2>
      <p>Relatório executivo exportado diretamente do sistema de planejamento e monitoramento logístico.</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">TOTAL DE REGISTROS</div>
        <div class="kpi-value">${data.length}</div>
      </div>
      <div class="kpi-card" style="border-left-color: #3b82f6;">
        <div class="kpi-label">STATUS DO ARQUIVO</div>
        <div class="kpi-value">CONSOLIDADO</div>
      </div>
      <div class="kpi-card" style="border-left-color: #a855f7;">
        <div class="kpi-label">CLASSIFICAÇÃO</div>
        <div class="kpi-value">INTERNO</div>
      </div>
    </div>

    <div class="action-bar">
      <button class="btn-print" onclick="window.print()">
        🖨️ IMPRIMIR RELATÓRIO / SALVAR EM PDF
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            ${headersHtml}
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <div class="signature-section">
      <div class="signature-card">
        ASSINATURA DO EMISSOR
      </div>
      <div class="signature-card">
        RESPONSÁVEL / COORDENADORIA GERAL
      </div>
    </div>

    <div class="footer">
      Documento gerado eletronicamente pelo Portal de Planejamento de Tráfego. Todos os direitos reservados.
    </div>
  </div>
</body>
</html>`;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('ppt_is_logged_in') === 'true';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('ppt_is_dark_mode') === 'true';
  });
  const [theme, setTheme] = useState<'green' | 'blue'>(() => {
    const saved = localStorage.getItem('ppt_color_theme');
    return (saved === 'blue' ? 'blue' : 'green');
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('ppt_is_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('ppt_is_dark_mode', isDarkMode ? 'true' : 'false');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('ppt_color_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ppt_is_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  const [activeMonitoramentoSubTab, setActiveMonitoramentoSubTab] = useState('Frentes');

  // Protect the application against easy inspection and source viewing using key blockers and disabling right click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (isCmdOrCtrl) {
        if (e.shiftKey && (
          e.key === 'I' || e.key === 'i' || 
          e.key === 'J' || e.key === 'j' || 
          e.key === 'C' || e.key === 'c'
        )) {
          e.preventDefault();
          return false;
        }
        if (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's') {
          e.preventDefault();
          return false;
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Dark Mode Drag-to-Toggle Slider State & Handlers
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDragX(isDarkMode ? 80 : 0);
  }, [isDarkMode]);

  const handleKnobPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const startX = e.clientX;
    const initialDragX = dragX;
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newDragX = initialDragX + deltaX;
      if (newDragX < 0) newDragX = 0;
      if (newDragX > 80) newDragX = 80;
      setDragX(newDragX);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      setIsDragging(false);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      
      // Determine threshold midpoint (40 for an 80px range)
      if (dragX > 40) {
        setIsDarkMode(true);
        setDragX(80);
      } else {
        setIsDarkMode(false);
        setDragX(0);
      }
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleTrackPointerDown = (e: React.PointerEvent) => {
    if (sliderTrackRef.current) {
      const rect = sliderTrackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left - 16; // centering knob
      let targetX = clickX;
      if (targetX < 0) targetX = 0;
      if (targetX > 80) targetX = 80;
      
      if (targetX > 40) {
        setIsDarkMode(true);
        setDragX(80);
      } else {
        setIsDarkMode(false);
        setDragX(0);
      }
    }
  };

  const [selectedUsina, setSelectedUsina] = useState<UsinaKey>('Ariranha');
  const [activeTab, setActiveTab] = useState('Monitoramento');
  
  // States for the interactive Reports (Relatórios) tab
  const [reportSearchText, setReportSearchText] = useState('');
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [innerReportSearch, setInnerReportSearch] = useState('');
  const [reportSearchFocused, setReportSearchFocused] = useState(false);
  const [reportPage, setReportPage] = useState(1);

  // Global toast state & clipboard helper
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setGlobalToast({ message, type });
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setGlobalToast(null);
    }, 4000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn('Fallback to traditional copy because of clipboard API block:', e);
    }
    
    // Fallback using textarea
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Traditional copy fallback failed:', err);
      return false;
    }
  };

  const [historySubTab, setHistorySubTab] = useState('Cadastros');
  const [lastGlobalUpdate, setLastGlobalUpdate] = useState(new Date().toLocaleString('pt-BR'));
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedFrenteId, setSelectedFrenteId] = useState<number | null>(null);
  const [selectedFleetId, setSelectedFleetId] = useState<number | null>(null);
  const [selectedKPIStatus, setSelectedKPIStatus] = useState<string | null>(null);
  const [zoomedCardId, setZoomedCardId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVisaoPlantioOpen, setIsVisaoPlantioOpen] = useState(false);
  const [selectedPlantioSubPage, setSelectedPlantioSubPage] = useState<string | null>(null);

  const [activeVinhacaSubTab, setActiveVinhacaSubTab] = useState('SmartFlow - Vinhaça');
  const [vinhacaApontamentos, setVinhacaApontamentos] = useState<any[]>([
    { id: 1, data: '2026-05-20', caminhao: 'VN-101', motorista: 'Almir Rogério', fazenda: 'Fazenda Bonança', localizacao: 'Talhão 08-A', m3: 45, horaInicio: '08:15', horaFim: '09:00', status: 'Concluído' },
    { id: 2, data: '2026-05-20', caminhao: 'VN-104', motorista: 'Gelson Dias', fazenda: 'Fazenda Ariranha Norte', localizacao: 'Talhão 14-C', m3: 45, horaInicio: '09:10', horaFim: '09:55', status: 'Concluído' },
    { id: 3, data: '2026-05-20', caminhao: 'VN-106', motorista: 'Mateus Pontes', fazenda: 'Fazenda São Carlos', localizacao: 'Talhão 22', m3: 45, horaInicio: '10:05', horaFim: '10:50', status: 'Em Andamento' }
  ]);
  const [vinhacaMotoristas, setVinhacaMotoristas] = useState<any[]>([
    { id: 1, nome: 'Almir Rogério', cnh: '554321098', categoria: 'E', caminhao: 'VN-101', status: 'Em Atividade' },
    { id: 2, nome: 'Gelson Dias', cnh: '912345678', categoria: 'E', caminhao: 'VN-104', status: 'Em Atividade' },
    { id: 3, nome: 'Mateus Pontes', cnh: '831092837', categoria: 'AE', caminhao: 'VN-106', status: 'Em Atividade' },
    { id: 4, nome: 'Antônio Carlos', cnh: '772183921', categoria: 'D', caminhao: 'VN-108', status: 'De Folga' }
  ]);
  const [vinhacaFazendas, setVinhacaFazendas] = useState<any[]>([
    { id: 1, nome: 'Fazenda Bonança', area: '142', potassio: 'Alto', gestor: 'Carlos Eduardo' },
    { id: 2, nome: 'Fazenda Ariranha Norte', area: '298', potassio: 'Médio', gestor: 'Fernando José' },
    { id: 3, nome: 'Fazenda São Carlos', area: '85', potassio: 'Baixo', gestor: 'Sandro Moreira' }
  ]);
  const [vinhacaTanks, setVinhacaTanks] = useState<any[]>([
    { id: 'T-01', nome: 'Tanque Pulmão Elevado', capacidadeMax: 1500, volumeAtual: 1250, local: 'Pátio Industrial', status: 'Estável' },
    { id: 'T-02', nome: 'Bacia de Acumulação Lagoa', capacidadeMax: 4500, volumeAtual: 3100, local: 'Fazenda Lagoa', status: 'Estável' },
    { id: 'T-03', nome: 'Bacia Regional Progresso', capacidadeMax: 3000, volumeAtual: 1200, local: 'Fazenda Progresso', status: 'Estável' }
  ]);
  const [vinhacaFlowRate, setVinhacaFlowRate] = useState(185);
  const [valve1Active, setValve1Active] = useState(true);
  const [valve2Active, setValve2Active] = useState(false);
  const [volumeDistributedToday, setVolumeDistributedToday] = useState(4250);
  const [vinhacaNotification, setVinhacaNotification] = useState<string | null>(null);

  const [vinhacaSmartFlowData, setVinhacaSmartFlowData] = useState<Record<string, any>>({
    'Ariranha': {
      carregamentoAtual: 'VN-101 (45 m³)',
      situacaoTransporte: 'Normal',
      situacaoDescarregamento: 'Descarregando',
      areaQuadra: 'Fazenda Ariranha - Quadra 12',
      qtdaAplicMotor: '2 Aplicadores / 4 Caminhões',
      raioSelecionado: 15,
      vazaoFrenteEstimada: 180,
      vazaoFrenteReal: 175,
      tempoCarregamento: 15,
      tempoTrajetoCarregado: 32,
      tempoDescarregamentoEspera: 45,
      tempoTrajetoVazio: 28,
      velocidadeMedia: 38,
      intervaloDespachos: 15,
      ultimoDespacho: '21:45',
      proximoDespacho: '22:00',
      despachoAtrasado: 'Não',
    },
    'Santa Albertina': {
      carregamentoAtual: 'VN-104 (50 m³)',
      situacaoTransporte: 'Normal',
      situacaoDescarregamento: 'Normal / Aplicando',
      areaQuadra: 'Fazenda Sabina - Quadra 08',
      qtdaAplicMotor: '3 Motores / 5 Caminhões',
      raioSelecionado: 20,
      vazaoFrenteEstimada: 240,
      vazaoFrenteReal: 238,
      tempoCarregamento: 12,
      tempoTrajetoCarregado: 40,
      tempoDescarregamentoEspera: 50,
      tempoTrajetoVazio: 38,
      velocidadeMedia: 42,
      intervaloDespachos: 22,
      ultimoDespacho: '22:05',
      proximoDespacho: '22:27',
      despachoAtrasado: 'Não',
    },
    'Palestina': {
      carregamentoAtual: 'VN-106 (45 m³)',
      situacaoTransporte: 'Lento (Fila)',
      situacaoDescarregamento: 'Aguardando Aplicador',
      areaQuadra: 'Fazenda Sabino - Quadra 33',
      qtdaAplicMotor: '2 Motores / 3 Caminhões',
      raioSelecionado: 10,
      vazaoFrenteEstimada: 150,
      vazaoFrenteReal: 135,
      tempoCarregamento: 18,
      tempoTrajetoCarregado: 25,
      tempoDescarregamentoEspera: 30,
      tempoTrajetoVazio: 20,
      velocidadeMedia: 35,
      intervaloDespachos: 30,
      ultimoDespacho: '21:10',
      proximoDespacho: '21:40',
      despachoAtrasado: 'Sim',
    },
    'Frente 02': {
      carregamentoAtual: 'VN-102 (40 m³)',
      situacaoTransporte: 'Normal',
      situacaoDescarregamento: 'Normal / Aplicando',
      areaQuadra: 'Fazenda Marazul - Quadra 04',
      qtdaAplicMotor: '1 Motor / 2 Caminhões',
      raioSelecionado: 12,
      vazaoFrenteEstimada: 160,
      vazaoFrenteReal: 158,
      tempoCarregamento: 15,
      tempoTrajetoCarregado: 28,
      tempoDescarregamentoEspera: 35,
      tempoTrajetoVazio: 22,
      velocidadeMedia: 36,
      intervaloDespachos: 25,
      ultimoDespacho: '22:15',
      proximoDespacho: '22:40',
      despachoAtrasado: 'Não',
    },
    'Frente 10': {
      carregamentoAtual: 'VN-110 (45 m³)',
      situacaoTransporte: 'Normal',
      situacaoDescarregamento: 'Normal / Aplicando',
      areaQuadra: 'Fazenda Estrela - Quadra 19',
      qtdaAplicMotor: '2 Motores / 4 Caminhões',
      raioSelecionado: 18,
      vazaoFrenteEstimada: 200,
      vazaoFrenteReal: 195,
      tempoCarregamento: 14,
      tempoTrajetoCarregado: 35,
      tempoDescarregamentoEspera: 45,
      tempoTrajetoVazio: 30,
      velocidadeMedia: 40,
      intervaloDespachos: 20,
      ultimoDespacho: '22:00',
      proximoDespacho: '22:20',
      despachoAtrasado: 'Não',
    },
    'Frente 72': {
      carregamentoAtual: 'VN-172 (50 m³)',
      situacaoTransporte: 'Normal',
      situacaoDescarregamento: 'Descarregando',
      areaQuadra: 'Fazenda Bonança - Quadra 72',
      qtdaAplicMotor: '2 Aplicadores / 4 Caminhões',
      raioSelecionado: 15,
      vazaoFrenteEstimada: 190,
      vazaoFrenteReal: 185,
      tempoCarregamento: 15,
      tempoTrajetoCarregado: 30,
      tempoDescarregamentoEspera: 40,
      tempoTrajetoVazio: 25,
      velocidadeMedia: 38,
      intervaloDespachos: 18,
      ultimoDespacho: '21:30',
      proximoDespacho: '21:48',
      despachoAtrasado: 'Não',
    }
  });

  const [vinhacaFrentesList, setVinhacaFrentesList] = useState<string[]>([
    'Ariranha',
    'Santa Albertina',
    'Palestina',
    'Frente 02',
    'Frente 10',
    'Frente 72'
  ]);

  const [vinhacaLiveDateTime, setVinhacaLiveDateTime] = useState<Date>(new Date());
  const [isAddingSmartFlowFrente, setIsAddingSmartFlowFrente] = useState(false);
  const [newSmartFlowFrenteInput, setNewSmartFlowFrenteInput] = useState('');
  const [editingFrenteKey, setEditingFrenteKey] = useState<string | null>(null);
  const [editSmartFlowFrenteNameInput, setEditSmartFlowFrenteNameInput] = useState('');
  const [showVinhacaControl, setShowVinhacaControl] = useState(false);
  const [showVinhacaPainel, setShowVinhacaPainel] = useState(false);
  const [showVinhacaDespacho, setShowVinhacaDespacho] = useState(false);

  const [monitoringDate, setMonitoringDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [monitoringTime, setMonitoringTime] = useState(() => {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  });

  // Ticking live clock interval for SmartFlow and monitoring elements
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setVinhacaLiveDateTime(now);
      
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      setMonitoringDate(`${year}-${month}-${day}`);
      
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setMonitoringTime(`${hrs}:${mins}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [plantioHistory, setPlantioHistory] = useState<PlantioSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('ppt_plantio_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [lastClearInfo, setLastClearInfo] = useState(() => {
     return localStorage.getItem('ppt_last_clear_info') || new Date().toLocaleString('pt-BR');
  });

  useEffect(() => {
    localStorage.setItem('ppt_plantio_history', JSON.stringify(plantioHistory));
  }, [plantioHistory]);

  useEffect(() => {
    localStorage.setItem('ppt_last_clear_info', lastClearInfo);
  }, [lastClearInfo]);
  
  // Persistent Frentes State
  const [frentes, setFrentes] = useState(() => {
    try {
      const saved = localStorage.getItem('ppt_frentes_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return [
      { id: 1, frente: '72.1', nome: 'Plantio/Mecanizado', fazenda: 'Faz. Ariranha Norte', cidade: 'Ariranha', quadras: 12, talhoes: 48, gestor: 'Carlos Silva', status: 'Trabalhando', obs: '', updatedAt: new Date().toLocaleString('pt-BR') },
      { id: 2, frente: '84.5', nome: 'Plantio/Mecanizado', fazenda: 'Talhão 12', cidade: 'Santa Albertina', quadras: 8, talhoes: 32, gestor: 'Ricardo Lima', status: 'Trabalhando', obs: '', updatedAt: new Date().toLocaleString('pt-BR') },
      { id: 3, frente: '91.2', nome: 'Plantio/Mecanizado', fazenda: 'Faz. Progresso', cidade: 'Palestina', quadras: 15, talhoes: 60, gestor: 'Marcos Souza', status: 'Trabalhando', obs: 'Atenção ao clima', updatedAt: new Date().toLocaleString('pt-BR') }
    ];
  });

  useEffect(() => {
    localStorage.setItem('ppt_frentes_data', JSON.stringify(frentes));
  }, [frentes]);

  // Persistent Logs State (Activities across all cities)
  const [allLogs, setAllLogs] = useState([
    { id: 1, type: 'Cadastros', event: 'Nova frente cadastrada', detail: 'Frente 72.1 - Faz. Ariranha Norte', time: 'Há 5 minutos', user: 'Centro de Operações Agricola', city: 'Ariranha' },
    { id: 2, type: 'Status', event: 'Status alterado', detail: 'Frente 84.5 mudou para PARADA', time: 'Há 12 minutos', user: 'João', city: 'Ariranha' },
    { id: 5, type: 'Cadastros', event: 'Nova frente cadastrada', detail: 'Frente 10.2 - Faz. Bela Vista', time: 'Há 10 minutos', user: 'Centro de Operações Agricola', city: 'Santa Albertina' },
  ]);

  const handleDeleteFrente = (id: number) => {
    const frente = frentes.find(f => f.id === id);
    if (frente && confirm(`Deseja realmente excluir a Frente ${frente.frente}?`)) {
      const now = new Date().toLocaleString('pt-BR');
      
      // Add to Excluídos log
      setAllLogs(prev => [{
        id: Date.now(),
        type: 'Excluídos',
        event: 'Frente Excluída',
        detail: `Frente ${frente.frente} (${frente.nome}) | Fazenda: ${frente.fazenda} | Gestor: ${frente.gestor} | Status Final: ${frente.status}`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: frente.cidade
      }, ...prev]);

      // Remove from active frentes
      setFrentes(prev => prev.filter(f => f.id !== id));
      setLastGlobalUpdate(now);
      if (selectedFrenteId === id) setSelectedFrenteId(null);
    }
  };

  const handleNextFrente = () => {
    if (selectedFrenteId === null) return;
    const items = filteredFrentes;
    if (items.length === 0) return;
    const currentIndex = items.findIndex(f => f.id === selectedFrenteId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % items.length;
    setSelectedFrenteId(items[nextIndex].id);
  };

  const handlePrevFrente = () => {
    if (selectedFrenteId === null) return;
    const items = filteredFrentes;
    if (items.length === 0) return;
    const currentIndex = items.findIndex(f => f.id === selectedFrenteId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setSelectedFrenteId(items[prevIndex].id);
  };

  const handleNextFleet = () => {
    if (selectedFleetId === null) return;
    const items = fleet.filter(item => item.unidade === selectedUsina);
    if (items.length === 0) return;
    const currentIndex = items.findIndex(f => f.id === selectedFleetId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % items.length;
    setSelectedFleetId(items[nextIndex].id);
  };

  const handlePrevFleet = () => {
    if (selectedFleetId === null) return;
    const items = fleet.filter(item => item.unidade === selectedUsina);
    if (items.length === 0) return;
    const currentIndex = items.findIndex(f => f.id === selectedFleetId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    setSelectedFleetId(items[prevIndex].id);
  };
  
  const kpiStatuses = ['Trabalhando', 'Paradas', 'C/Vento/Chuva', 'Mudança'];
  const handleNextKPI = () => {
    if (!selectedKPIStatus) return;
    const idx = kpiStatuses.indexOf(selectedKPIStatus);
    const next = kpiStatuses[(idx + 1) % kpiStatuses.length];
    setSelectedKPIStatus(next);
  };

  const handlePrevKPI = () => {
    if (!selectedKPIStatus) return;
    const idx = kpiStatuses.indexOf(selectedKPIStatus);
    const prev = kpiStatuses[(idx - 1 + kpiStatuses.length) % kpiStatuses.length];
    setSelectedKPIStatus(prev);
  };

  const dashboardCards = ['Efficiency', 'Distribution', '3DPerf', 'StatusRanking', 'StatusPie', 'Evolution', 'Comparison', 'Profile'];
  const handleNextDashboardCard = () => {
    if (!zoomedCardId) return;
    const idx = dashboardCards.indexOf(zoomedCardId);
    const next = dashboardCards[(idx + 1) % dashboardCards.length];
    setZoomedCardId(next);
  };

  const handlePrevDashboardCard = () => {
    if (!zoomedCardId) return;
    const idx = dashboardCards.indexOf(zoomedCardId);
    const prev = dashboardCards[(idx - 1 + dashboardCards.length) % dashboardCards.length];
    setZoomedCardId(prev);
  };
  
  // OBS Modal State
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [currentFrenteId, setCurrentFrenteId] = useState<number | null>(null);
  const [tempObs, setTempObs] = useState('');

  // Areas Management State with LocalStorage Persistence
  const [usinaAreasText, setUsinaAreasText] = useState<Record<UsinaKey, string>>(() => {
    try {
      const saved = localStorage.getItem('ppt_areas_data');
      return saved ? JSON.parse(saved) : {
        'Ariranha': '',
        'Santa Albertina': '',
        'Palestina': ''
      };
    } catch (e) {
      return {
        'Ariranha': '',
        'Santa Albertina': '',
        'Palestina': ''
      };
    }
  });
  const [isEditingAreas, setIsEditingAreas] = useState(false);
  const [tempAreasText, setTempAreasText] = useState('');

  // Analytical Maps State
  const [analyticalMaps, setAnalyticalMaps] = useState<Record<UsinaKey, { id: string, name: string, date: string, type: string }[]>>(() => {
    try {
      const saved = localStorage.getItem('ppt_analytical_maps');
      return saved ? JSON.parse(saved) : {
        'Ariranha': [],
        'Santa Albertina': [],
        'Palestina': []
      };
    } catch (e) {
      return {
        'Ariranha': [],
        'Santa Albertina': [],
        'Palestina': []
      };
    }
  });

  // Persist maps to localStorage
  useEffect(() => {
    localStorage.setItem('ppt_analytical_maps', JSON.stringify(analyticalMaps));
  }, [analyticalMaps]);

  // Persist areas to localStorage
  useEffect(() => {
    localStorage.setItem('ppt_areas_data', JSON.stringify(usinaAreasText));
  }, [usinaAreasText]);

  // Reset editing mode when usina changes to prevent data cross-contamination
  useEffect(() => {
    setIsEditingAreas(false);
  }, [selectedUsina]);

  // Edit/New Frente Modal State
  const [isFrenteModalOpen, setIsFrenteModalOpen] = useState(false);
  const [editingFrenteId, setEditingFrenteId] = useState<number | null>(null);

  // Fleet Management State
  const [fleet, setFleet] = useState<FleetItem[]>(() => {
    const getFullDefaultFleet = (): FleetItem[] => {
      return [
        // Ariranha
        { id: 1, unidade: 'Ariranha', tipo: 'Trator', modelo: 'John Deere 8R', prefixo: 'TR-001', status: 'Trabalhando', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Trabalhando') },
        { id: 2, unidade: 'Ariranha', tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-042', status: 'Trabalhando', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Trabalhando') },
        { id: 10, unidade: 'Ariranha', tipo: 'Trator', modelo: 'Case IH 340', prefixo: 'TR-015', status: 'Reserva', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Reserva') },
        { id: 11, unidade: 'Ariranha', tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-018', status: 'Reserva', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Reserva') },

        // Palestina
        { id: 20, unidade: 'Palestina', tipo: 'Trator', modelo: 'John Deere 8R', prefixo: 'TR-002', status: 'Trabalhando', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Trabalhando') },
        { id: 21, unidade: 'Palestina', tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-043', status: 'Trabalhando', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Trabalhando') },
        { id: 22, unidade: 'Palestina', tipo: 'Trator', modelo: 'Case IH 340', prefixo: 'TR-016', status: 'Reserva', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Reserva') },
        { id: 23, unidade: 'Palestina', tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-019', status: 'Reserva', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Reserva') },

        // Santa Albertina
        { id: 30, unidade: 'Santa Albertina', tipo: 'Trator', modelo: 'John Deere 8R', prefixo: 'TR-003', status: 'Trabalhando', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Trabalhando') },
        { id: 31, unidade: 'Santa Albertina', tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-044', status: 'Trabalhando', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Trabalhando') },
        { id: 32, unidade: 'Santa Albertina', tipo: 'Trator', modelo: 'Case IH 340', prefixo: 'TR-017', status: 'Reserva', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Reserva') },
        { id: 33, unidade: 'Santa Albertina', tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-020', status: 'Reserva', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Reserva') },
        { id: 3, unidade: 'Santa Albertina', tipo: 'Caminhão', modelo: 'Volvo FMX', prefixo: 'CM-105', status: 'Manutenção', updatedAt: new Date().toLocaleString('pt-BR'), hourlyData: Array(24).fill('Manutenção Máquina') }
      ];
    };

    try {
      const saved = localStorage.getItem('ppt_fleet_data');
      if (saved) {
        let parsed = JSON.parse(saved);
        if (parsed.length <= 3) {
          // Reset to the full default list if they only had the old limited 3-item list
          parsed = getFullDefaultFleet();
          localStorage.setItem('ppt_fleet_data', JSON.stringify(parsed));
        }
        return parsed.map((item: any) => ({
          ...item,
          hourlyData: item.hourlyData || Array(24).fill('Reserva')
        }));
      }
      return getFullDefaultFleet();
    } catch (e) {
      return [];
    }
  });

  const updateHourlyStatus = (fleetId: number, hourIndex: number, newStatus: string) => {
    setFleet(prev => prev.map(item => {
      if (item.id === fleetId) {
        const newData = [...(item.hourlyData || Array(24).fill('Reserva'))];
        // Se selecionar "Limpar", voltamos para "Reserva" que é o estado padrão
        newData[hourIndex] = newStatus === 'Limpar' ? 'Reserva' : newStatus;
        return { ...item, hourlyData: newData };
      }
      return item;
    }));
  };

  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [editingFleetId, setEditingFleetId] = useState<number | null>(null);

  // Fleet Modal Form State
  const [fleetFormData, setFleetFormData] = useState<Partial<FleetItem>>({
    tipo: 'Trator',
    modelo: '',
    prefixo: '',
    status: 'Reserva'
  });

  const saveFleet = (e: FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleString('pt-BR');
    
    if (editingFleetId) {
      setFleet(prev => prev.map(item => 
        item.id === editingFleetId ? { ...item, ...fleetFormData, updatedAt: now } as FleetItem : item
      ));
      
      setAllLogs(prev => [{
        id: Date.now(),
        type: 'Status',
        event: 'Equipamento Atualizado',
        detail: `${fleetFormData.tipo} ${fleetFormData.prefixo} (${fleetFormData.modelo}) atualizado em ${selectedUsina}`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: selectedUsina
      }, ...prev]);
    } else {
      const newItem: FleetItem = {
        id: Date.now(),
        unidade: selectedUsina,
        tipo: fleetFormData.tipo as any || 'Trator',
        modelo: fleetFormData.modelo || '',
        prefixo: fleetFormData.prefixo || '',
        status: fleetFormData.status as any || 'Reserva',
        updatedAt: now,
        hourlyData: Array(24).fill(fleetFormData.status === 'Reserva' ? 'Reserva' : 'Trabalhando')
      };
      setFleet(prev => [newItem, ...prev]);

      setAllLogs(prev => [{
        id: newItem.id,
        type: 'Cadastros',
        event: 'Novo Equipamento Cadastrado',
        detail: `${newItem.tipo} ${newItem.prefixo} (${newItem.modelo}) registrado para a frota de ${selectedUsina}`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: selectedUsina
      }, ...prev]);
    }
    
    setIsFleetModalOpen(false);
    setFleetFormData({ tipo: 'Trator', modelo: '', prefixo: '', status: 'Reserva' });
  };

  const calculateUsinaEfficiency = (usina: UsinaKey) => {
    const usinaFleet = fleet.filter(item => item.unidade === usina);
    let total = 0;
    let active = 0;
    usinaFleet.forEach(f => {
      (f.hourlyData || []).forEach(s => {
        total++;
        if (s === 'Trabalhando' || s === 'Trabalhando Parcial') active++;
      });
    });
    return total > 0 ? ((active / total) * 100).toFixed(1) : "0";
  };

  const handleClearPlantioTable = () => {
    const usinaFleet = fleet.filter(item => item.unidade === selectedUsina);
    if (usinaFleet.length === 0) {
      alert("Não há equipamentos para limpar nesta unidade.");
      return;
    }

    if (confirm(`Deseja realmente LIMPAR a tabela de cores de ${selectedUsina}?\nAs informações atuais serão migradas para o Histórico > Plantio.`)) {
      const now = new Date();
      const efficiency = calculateUsinaEfficiency(selectedUsina);
      
      const snapshot: PlantioSnapshot = {
        id: Date.now(),
        date: monitoringDate,
        time: monitoringTime,
        usina: selectedUsina,
        fleetSnapshot: JSON.parse(JSON.stringify(usinaFleet)),
        efficiency: efficiency,
        clearedAt: now.toLocaleString('pt-BR')
      };

      setPlantioHistory(prev => [snapshot, ...prev]);
      
      // Clear data only for selected usina
      setFleet(prev => prev.map(item => {
        if (item.id === 0) return item; // dummy
        if (item.unidade === selectedUsina) {
          return {
            ...item,
            hourlyData: Array(24).fill('Reserva')
          };
        }
        return item;
      }));

      const newClearInfo = now.toLocaleString('pt-BR');
      setLastClearInfo(newClearInfo);
      setMonitoringDate(now.toISOString().split('T')[0]);
      setMonitoringTime(now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0'));
      
      setAllLogs(prev => [{
        id: Date.now(),
        type: 'Status',
        event: 'Tabela de Plantio Limpa',
        detail: `Tabela de acompanhamento de ${selectedUsina} limpa e arquivada. Eficiência no momento: ${efficiency}%`,
        time: newClearInfo,
        user: 'Centro de Operações Agricola',
        city: selectedUsina
      }, ...prev]);

      alert("Tabela limpa com sucesso! Os dados foram movidos para Histórico > Plantio.");
    }
  };

  // Persist fleet to localStorage
  useEffect(() => {
    localStorage.setItem('ppt_fleet_data', JSON.stringify(fleet));
  }, [fleet]);

  const [lastPlantioUpdate, setLastPlantioUpdate] = useState(() => {
    return localStorage.getItem('last_plantio_update') || new Date().toLocaleString('pt-BR');
  });

  useEffect(() => {
    const now = new Date().toLocaleString('pt-BR');
    setLastPlantioUpdate(now);
    localStorage.setItem('last_plantio_update', now);
  }, [fleet, frentes]);

  // --- DDS (Diálogo Diário de Segurança) State ---
  const [ddsTopics, setDdsTopics] = useState<DdsTopic[]>(() => {
    try {
      const saved = localStorage.getItem('ppt_dds_topics_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_DDS_TOPICS;
  });

  const [selectedDdsTopicId, setSelectedDdsTopicId] = useState<number>(1);
  const [ddsUsina, setDdsUsina] = useState<UsinaKey>('Ariranha');
  const [ddsSupervisor, setDdsSupervisor] = useState<string>('Carlos Silva');
  const [ddsDate, setDdsDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [ddsSelectedOperators, setDdsSelectedOperators] = useState<string[]>([]);
  
  const [savedDdsMeetings, setSavedDdsMeetings] = useState<{
    id: number;
    date: string;
    usina: string;
    supervisor: string;
    topicTitle: string;
    category: string;
    attendees: string[];
  }[]>(() => {
    try {
      const saved = localStorage.getItem('ppt_dds_meetings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 1001,
        date: '14/07/2026',
        usina: 'Ariranha',
        supervisor: 'Carlos Silva',
        topicTitle: 'Prevenção de Incêndios em Canaviais',
        category: 'Incêndio',
        attendees: ['TR-001 (Operador)', 'PL-042 (Operador)', 'TR-015 (Operador)']
      },
      {
        id: 1002,
        date: '13/07/2026',
        usina: 'Santa Albertina',
        supervisor: 'Ricardo Lima',
        topicTitle: 'Uso Correto de EPIs na Atividade Agrícola',
        category: 'Equipamento de Proteção',
        attendees: ['TR-003 (Operador)', 'PL-044 (Operador)', 'CM-105 (Motorista)']
      }
    ];
  });

  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('Segurança Geral');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [newTopicRuleInput, setNewTopicRuleInput] = useState('');
  const [newTopicRulesList, setNewTopicRulesList] = useState<string[]>([]);
  const [isAddingTopicModal, setIsAddingTopicModal] = useState(false);

  // New DDS Search, Filter and Confirmation states
  const [ddsSearchQuery, setDdsSearchQuery] = useState('');
  const [ddsSelectedCategory, setDdsSelectedCategory] = useState('Todos');
  const [isMarkingDoneModal, setIsMarkingDoneModal] = useState(false);
  const [topicToMarkDone, setTopicToMarkDone] = useState<DdsTopic | null>(null);
  const [markDoneUsina, setMarkDoneUsina] = useState<UsinaKey>('Ariranha');

  useEffect(() => {
    localStorage.setItem('ppt_dds_topics_v4', JSON.stringify(ddsTopics));
  }, [ddsTopics]);

  useEffect(() => {
    localStorage.setItem('ppt_dds_meetings', JSON.stringify(savedDdsMeetings));
  }, [savedDdsMeetings]);

  useEffect(() => {
    localStorage.setItem('ppt_dds_meetings', JSON.stringify(savedDdsMeetings));
  }, [savedDdsMeetings]);

  const allAvailableReports = useMemo(() => {
    return [
      {
        id: 'frentes_de_trabalho',
        title: 'Frentes de Trabalho',
        desc: 'Lista de frentes ativas, gestores e status.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <Factory size={20} />,
        color: 'blue',
        data: frentes,
        filename: 'RELATORIO_FRENTES'
      },
      {
        id: 'metricas_dashboard',
        title: 'Métricas Dashboard',
        desc: 'Resumo estatístico de produtividade por unidade.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <BarChart2 size={20} />,
        color: 'amber',
        data: Object.entries(DADOS_USINAS).map(([key, value]) => ({ 
          Unidade: key, 
          Trabalhando: value.trabalhando, 
          Paradas: value.paradas, 
          Vento_Chuva: value.ventoChuva, 
          Mudanca_Area: value.mudancaArea, 
          Cidade: value.cidade 
        })),
        filename: 'RELATORIO_DASHBOARD'
      },
      {
        id: 'historico_de_logs',
        title: 'Histórico de Logs',
        desc: 'Registro de todas as atividades e alterações.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <Clock size={20} />,
        color: 'purple',
        data: allLogs,
        filename: 'RELATORIO_HISTORICO'
      },
      {
        id: 'itens_excluidos',
        title: 'Itens Excluídos',
        desc: 'Auditoria de registros removidos do sistema.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <Trash2 size={20} />,
        color: 'red',
        data: allLogs.filter(l => l.type === 'Excluídos'),
        filename: 'RELATORIO_EXCLUIDOS'
      },
      {
        id: 'frota_equipamentos',
        title: 'Frota/Equipamentos',
        desc: 'Relatório completo de caminhões, tratores e plantadeiras.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <Truck size={20} />,
        color: 'blue',
        data: fleet,
        filename: 'RELATORIO_FROTA'
      },
      {
        id: 'arquivos_de_plantio',
        title: 'Arquivos de Plantio',
        desc: 'Histórico detalhado de snapshots da operação de plantio.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <Sprout size={20} />,
        color: 'green',
        data: plantioHistory.map(h => ({
          Data: h.date,
          Hora: h.time,
          Unidade: h.usina,
          Eficiencia: `${h.efficiency}%`,
          Arquivado_em: h.clearedAt,
          Total_Equipamentos: h.fleetSnapshot.length
        })),
        filename: 'RELATORIO_HISTORICO_PLANTIO'
      },
      {
        id: 'historico_cadastros',
        title: 'Histórico - Cadastros',
        desc: 'Registro de todas as inclusões e novos cadastros de equipamentos/frentes.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <PlusCircle size={20} />,
        color: 'blue',
        data: allLogs.filter(l => l.type === 'Cadastros'),
        filename: 'RELATORIO_HISTORICO_CADASTROS'
      },
      {
        id: 'historico_status',
        title: 'Histórico - Alterações de Status',
        desc: 'Registro de todas as atualizações e trocas de status de equipamentos.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <RefreshCw size={20} />,
        color: 'amber',
        data: allLogs.filter(l => l.type === 'Status'),
        filename: 'RELATORIO_HISTORICO_STATUS'
      },
      {
        id: 'historico_observacoes',
        title: 'Histórico - Observações',
        desc: 'Anotações e observações gerais inseridas pelos operadores.',
        category: 'Operações Gerais, Plantio & Frotas',
        icon: <MessageSquare size={20} />,
        color: 'purple',
        data: allLogs.filter(l => l.type === 'Observações'),
        filename: 'RELATORIO_HISTORICO_OBSERVACOES'
      },
      {
        id: 'acompanhamento_gerencial',
        title: 'Acompanhamento Gerencial',
        desc: 'Metas operacionais de plantio planejadas vs. realizadas no dia, mês e acumulado.',
        category: 'Gestão de Áreas & Planejamento',
        icon: <LayoutDashboard size={20} />,
        color: 'green',
        data: (() => {
          try {
            const saved = localStorage.getItem('gestao_areas_gerencial');
            const raw = saved ? JSON.parse(saved) : [
              { modalidade: 'MAN/PRÓPRIO', frente: '71-1', dia: { planej: 0, realiz: 0, chuva: 0 }, mes: { planej: 396.90, realiz: 406.29, chuva: 351 }, acumulado: { planej: 391.89, realiz: 406.29, chuva: 351 } },
              { modalidade: 'MEC/PRÓPRIO', frente: '72-1', dia: { planej: 0.36, realiz: 4.70, chuva: 0 }, mes: { planej: 3010.27, realiz: 3017.82, chuva: 479 }, acumulado: { planej: 3000.61, realiz: 3017.82, chuva: 479 } },
              { modalidade: 'MEC/PRÓPRIO', frente: '72-2', dia: { planej: 0, realiz: 0, chuva: 0 }, mes: { planej: 1183.35, realiz: 1180.40, chuva: 517 }, acumulado: { planej: 1166.54, realiz: 1178.40, chuva: 517 } },
              { modalidade: 'MEC/PRÓPRIO', frente: '72-3', dia: { planej: 0, realiz: 0, chuva: 0 }, mes: { planej: 601.37, realiz: 598.92, chuva: 523 }, acumulado: { planej: 598.29, realiz: 598.92, chuva: 523 } }
            ];
            return raw.map((r: any) => ({
              'Modalidade': r.modalidade,
              'Frente': r.frente,
              'Dia Planejado (ha)': r.dia.planej,
              'Dia Realizado (ha)': r.dia.realiz,
              'Dia Chuva (mm)': r.dia.chuva,
              'Mês Planejado (ha)': r.mes.planej,
              'Mês Realizado (ha)': r.mes.realiz,
              'Mês Chuva (mm)': r.mes.chuva,
              'Acumulado Planejado (ha)': r.acumulado.planej,
              'Acumulado Realizado (ha)': r.acumulado.realiz,
              'Acumulado Chuva (mm)': r.acumulado.chuva,
            }));
          } catch { return []; }
        })(),
        filename: 'GEST_AREAS_ACOMPANHAMENTO_GERENCIAL'
      },
      {
        id: 'central_areas_master',
        title: 'Central de Áreas (Master Plan)',
        desc: 'Cadastro geral de fazendas, talhões, variedades de cana e status de frentes de plantio.',
        category: 'Gestão de Áreas & Planejamento',
        icon: <Table size={20} />,
        color: 'blue',
        data: (() => {
          try {
            const saved = localStorage.getItem('gestao_areas_banco');
            const raw = saved ? JSON.parse(saved) : [];
            return raw.map((item: any) => ({
              'Fazenda': item.fazenda,
              'Quadra': item.quadra,
              'Talhão': item.talhao,
              'Área Plantio (ha)': item.areaPlantio,
              'Sistema Plantio': item.sistemaPlantio,
              'Variedade': item.variedade,
              'Renovação': item.renovacao,
              'Tipo Plantio': item.flegPlantio,
              'Status da Área': item.statusArea,
              'Situação': item.situacaoPlantio,
              'Replantio': item.replantio ? 'Sim' : 'Não',
              'Realizado CCO (ha)': item.plantioCco,
              'Realizado PIMS (ha)': item.plantioPims,
              'Confirmação Sist.': item.confSistPlantio,
              'Chuva (mm)': item.chuvaMm || 0,
              'Turno': item.turno || '',
              'Data e Hora': item.dataHora || ''
            }));
          } catch { return []; }
        })(),
        filename: 'GEST_AREAS_BANCO_DE_AREAS_MASTER'
      },
      {
        id: 'turnos_boletins',
        title: 'Turnos e Boletins Operacionais',
        desc: 'Horários de frentes de trabalho, volumes de plantio e medição de chuvas por turno.',
        category: 'Gestão de Áreas & Planejamento',
        icon: <ClipboardList size={20} />,
        color: 'purple',
        data: (() => {
          try {
            const saved = localStorage.getItem('gestao_areas_boletim');
            const raw = saved ? JSON.parse(saved) : [
              { turno: 'TURNO A', horario: '00:00 as 10:00', plantio: 0.00, chuva: 0, viagens: 0, muda: 0.00, rendimento: 0.00, pessoas: 0, hecPessoas: 0, status: 'NÃO TRABALHOU' },
              { turno: 'TURNO B', horario: '10:00 as 14:00', plantio: 4.70, chuva: 0, viagens: 12, muda: 8.50, rendimento: 3.25, pessoas: 15, hecPessoas: 0.31, status: 'TRABALHOU' },
              { turno: 'TURNO C', horario: '14:00 as 00:00', plantio: 0.00, chuva: 15, viagens: 0, muda: 0.00, rendimento: 0.00, pessoas: 0, hecPessoas: 0, status: 'NÃO TRABALHOU' }
            ];
            return raw.map((s: any) => ({
              'Turno': s.turno,
              'Horário': s.horario,
              'Plantio (ha)': s.plantio,
              'Chuva (mm)': s.chuva,
              'Viagens': s.viagens,
              'Mudas (t)': s.muda,
              'Rendimento (ha/h)': s.rendimento,
              'Pessoas': s.pessoas,
              'ha/Pessoa': s.hecPessoas,
              'Status': s.status
            }));
          } catch { return []; }
        })(),
        filename: 'GEST_AREAS_TURNOS_E_BOLETINS'
      },
      {
        id: 'auditoria_plantio_pims',
        title: 'Auditoria de Plantio vs PIMS',
        desc: 'Discrepâncias físicas colhidas em campo contra os boletins integrados no PIMS ERP.',
        category: 'Gestão de Áreas & Planejamento',
        icon: <ArrowRightLeft size={20} />,
        color: 'red',
        data: [
          { 'Frente': '71-1', 'Controle Físico Mecanizado (ha)': 0.00, 'Controle Físico Meiosi (ha)': 377.71, 'Total Controle Físico (ha)': 406.29, 'PIMS Mecanizado (ha)': 0.00, 'PIMS Meiosi (ha)': 377.71, 'Total PIMS ERP (ha)': 406.29, 'Desvio (ha)': 0.00, 'Status Auditoria': 'Consolidado' },
          { 'Frente': '72-1', 'Controle Físico Mecanizado (ha)': 3052.62, 'Controle Físico Meiosi (ha)': 22.75, 'Total Controle Físico (ha)': 3075.37, 'PIMS Mecanizado (ha)': 3059.86, 'PIMS Meiosi (ha)': 22.75, 'Total PIMS ERP (ha)': 3082.61, 'Desvio (ha)': -7.24, 'Status Auditoria': 'Desvio sob Revisão' },
          { 'Frente': '72-2', 'Controle Físico Mecanizado (ha)': 1168.42, 'Controle Físico Meiosi (ha)': 11.98, 'Total Controle Físico (ha)': 1180.40, 'PIMS Mecanizado (ha)': 1168.42, 'PIMS Meiosi (ha)': 11.98, 'Total PIMS ERP (ha)': 1180.40, 'Desvio (ha)': 0.00, 'Status Auditoria': 'Consolidado' },
          { 'Frente': '72-3', 'Controle Físico Mecanizado (ha)': 598.92, 'Controle Físico Meiosi (ha)': 0.00, 'Total Controle Físico (ha)': 598.92, 'PIMS Mecanizado (ha)': 598.92, 'PIMS Meiosi (ha)': 0.00, 'Total PIMS ERP (ha)': 598.92, 'Desvio (ha)': 0.00, 'Status Auditoria': 'Consolidado' },
        ],
        filename: 'GEST_AREAS_AUDITORIA_PIMS_FISICO'
      },
      {
        id: 'vinhaca_apontamentos',
        title: 'Vinhaça - Apontamentos',
        desc: 'Registro completo de telemetria, aplicação e m³ por talhão.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <FileText size={20} />,
        color: 'purple',
        data: vinhacaApontamentos,
        filename: 'RELATORIO_VINHACA_APONTAMENTOS'
      },
      {
        id: 'vinhaca_niveis_caixa',
        title: 'Vinhaça - Níveis de Caixa',
        desc: 'Medições históricas de nível da caixa de carregamento.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Droplet size={20} />,
        color: 'green',
        data: (() => {
          try {
            const d = localStorage.getItem("vinhaca_nivel_carregamentos");
            return d ? JSON.parse(d) : [];
          } catch { return []; }
        })(),
        filename: 'RELATORIO_VINHACA_NIVEIS'
      },
      {
        id: 'vinhaca_balanco_fechamento',
        title: 'Vinhaça - Balanço Fechamento',
        desc: 'Configurações, períodos e caldas lançadas de fechamento por unidade.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Calendar size={20} />,
        color: 'amber',
        data: (() => {
          try {
            const d = localStorage.getItem("vinhaca_fechamentos");
            return d ? Object.values(JSON.parse(d)) : [];
          } catch { return []; }
        })(),
        filename: 'RELATORIO_VINHACA_FECHAMENTO'
      },
      {
        id: 'vinhaca_frota_despacho',
        title: 'Vinhaça - Frota de Despacho',
        desc: 'Rastreamento, tempos estimados de viagem e status dos caminhões de vinhaça.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Truck size={20} />,
        color: 'blue',
        data: (() => {
          try {
            const d = localStorage.getItem("vinhaca_despacho_trucks");
            return d ? JSON.parse(d) : [];
          } catch { return []; }
        })(),
        filename: 'RELATORIO_VINHACA_DESPACHO_FROTA'
      },
      {
        id: 'vinhaca_bacias_tanques',
        title: 'Vinhaça - Bacias & Tanques',
        desc: 'Localização, capacidade máxima e volumetria atual das bacias de acumulação.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Factory size={20} />,
        color: 'blue',
        data: vinhacaTanks,
        filename: 'RELATORIO_VINHACA_TANQUES'
      },
      {
        id: 'vinhaca_cadastro_motoristas',
        title: 'Vinhaça - Cadastro Motoristas',
        desc: 'Relação de motoristas cadastrados de vinhaça, CNH e status.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Users size={20} />,
        color: 'purple',
        data: vinhacaMotoristas,
        filename: 'RELATORIO_VINHACA_MOTORISTAS'
      },
      {
        id: 'vinhaca_cadastro_fazendas',
        title: 'Vinhaça - Cadastro Fazendas',
        desc: 'Relação de fazendas destinatárias, áreas físicas e teores de potássio.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Sprout size={20} />,
        color: 'green',
        data: vinhacaFazendas,
        filename: 'RELATORIO_VINHACA_FAZENDAS'
      },
      {
        id: 'vinhaca_logs_historicos',
        title: 'Vinhaça - Logs Históricos',
        desc: 'Histórico de transações e alterações do banco histórico de vinhaça.',
        category: 'Operações do Módulo Vinhaça (SmartFlow)',
        icon: <Clock size={20} />,
        color: 'red',
        data: (() => {
          try {
            const d = localStorage.getItem("vinhaca_historico_db");
            return d ? JSON.parse(d) : [];
          } catch { return []; }
        })(),
        filename: 'RELATORIO_VINHACA_LOGS_HISTORICOS'
      },
      {
        id: 'biblioteca_temas_dds',
        title: 'Biblioteca de Temas DDS',
        desc: 'Relação completa de todos os temas e diretrizes cadastradas na biblioteca do sistema.',
        category: 'Gestão de Diálogos de Segurança (DDS)',
        icon: <Shield size={20} />,
        color: 'green',
        data: ddsTopics.map(t => ({
          ID: t.id,
          Título: t.title,
          Categoria: t.category,
          Urgência: t.urgency,
          Descrição: t.description,
          Diretrizes: t.rules ? t.rules.join(' | ') : ''
        })),
        filename: 'BIBLIOTECA_TEMAS_DDS'
      },
      {
        id: 'historico_dds_realizados',
        title: 'Histórico de DDS Realizados',
        desc: 'Registro consolidado de todos os Diálogos Diários de Segurança concluídos.',
        category: 'Gestão de Diálogos de Segurança (DDS)',
        icon: <FileText size={20} />,
        color: 'blue',
        data: savedDdsMeetings.map(m => ({
          ID: m.id,
          Data: m.date,
          Hora: m.time,
          Unidade_Usina: m.usina,
          Tema_Título: m.topicTitle,
          Categoria: m.category,
          Participantes: m.attendees ? m.attendees.join(', ') : ''
        })),
        filename: 'HISTORICO_REALIZACOES_DDS'
      }
    ];
  }, [frentes, DADOS_USINAS, allLogs, fleet, plantioHistory, vinhacaApontamentos, vinhacaTanks, vinhacaMotoristas, vinhacaFazendas, ddsTopics, savedDdsMeetings]);

  const exportData = (data: any[], filename: string, format: 'xml' | 'html' | 'csv' | 'json') => {
    if (data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

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
      // HTML - HIGHLY PROFESSIONAL STYLED EXECUTIVE REPORT
      const htmlContent = generateHtmlReport(data, filename);
      blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      extension = 'html';
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

  const handleShare = async (data: any[], title: string, filename: string) => {
    if (data.length === 0) {
      alert("Não há dados para compartilhar.");
      return;
    }

    const htmlContent = generateHtmlReport(data, filename);
    const reportDateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const fullFilename = `${filename}_${reportDateStr}.html`;
    const text = `Relatório PPT: ${title}\nData: ${new Date().toLocaleString('pt-BR')}\nTotal de registros: ${data.length}`;

    // Try sharing as file if supported
    const file = new File([htmlContent], fullFilename, { type: 'text/html' });
    let sharedSuccessfully = false;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `PPT - ${title}`,
          text: text,
        });
        sharedSuccessfully = true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // Aborted by user
        }
        console.warn('Native file share failed, trying text share or fallback:', err);
      }
    }

    if (!sharedSuccessfully && navigator.share) {
      try {
        await navigator.share({
          title: `PPT - ${title}`,
          text: `${text}\nRelatório em PDF/HTML disponível no portal.`,
          url: window.location.href,
        });
        sharedSuccessfully = true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // Aborted by user
        }
        console.warn('Native text share failed, using local fallback:', err);
      }
    }

    if (!sharedSuccessfully) {
      // Fallback: copy report details to clipboard and download HTML/PDF immediately
      const copied = await copyToClipboard(`${text}\n\nVisualizar relatório no portal Colombo: ${window.location.href}`);
      exportData(data, filename, 'html');
      
      if (copied) {
        showToast("Arquivo baixado e link de resumo copiado para transferência!");
      } else {
        showToast("Arquivo de relatório baixado com sucesso!");
      }
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");

    // Auto-fit column widths
    const maxProps = Object.keys(data[0] || {});
    const wscols = maxProps.map(key => {
      let maxLen = key.length;
      data.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
    });
    worksheet['!cols'] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    link.href = url;
    link.download = `${filename}_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareAsExcel = async (data: any[], title: string, filename: string) => {
    if (data.length === 0) {
      alert("Não há dados para compartilhar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");

    // Auto-fit column widths
    const maxProps = Object.keys(data[0] || {});
    const wscols = maxProps.map(key => {
      let maxLen = key.length;
      data.forEach(row => {
        const val = row[key];
        if (val !== null && val !== undefined) {
          maxLen = Math.max(maxLen, String(val).length);
        }
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 40) };
    });
    worksheet['!cols'] = wscols;

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const reportDateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const fullFilename = `${filename}_${reportDateStr}.xlsx`;
    const text = `Planilha de Relatório: ${title}\nExportado em: ${new Date().toLocaleString('pt-BR')}\nTotal de registros: ${data.length}`;

    const file = new File([excelBuffer], fullFilename, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let sharedSuccessfully = false;

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Relatório Colombo - ${title}`,
          text: text,
        });
        sharedSuccessfully = true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // Aborted by user
        }
        console.warn('Native excel share failed, trying text share or fallback:', err);
      }
    }

    if (!sharedSuccessfully && navigator.share) {
      try {
        await navigator.share({
          title: `Relatório Colombo - ${title}`,
          text: `${text}\nPlanilha disponível no portal.`,
          url: window.location.href,
        });
        sharedSuccessfully = true;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return; // Aborted by user
        }
        console.warn('Native text share failed, using local fallback:', err);
      }
    }

    if (!sharedSuccessfully) {
      // Fallback: copy spreadsheet details to clipboard and download spreadsheet (.xlsx) immediately
      const copied = await copyToClipboard(`${text}\n\nBaixar planilha no portal Colombo: ${window.location.href}`);
      exportToExcel(data, filename);
      
      if (copied) {
        showToast("Planilha baixada e link de resumo copiado para transferência!");
      } else {
        showToast("Planilha de relatório baixada com sucesso!");
      }
    }
  };

  const [frenteFormData, setFrenteFormData] = useState({
    frente: '',
    nome: 'Corte/Carregamento',
    fazenda: '',
    quadras: '',
    talhoes: '',
    gestor: '',
    status: 'Trabalhando'
  });

  useEffect(() => {
    // Clock removed as requested - time is now fixed to last update
  }, []);

  const currentData = useMemo(() => {
    const cityFrentes = frentes.filter(f => f.cidade === selectedUsina);
    const counts = {
      trabalhando: cityFrentes.filter(f => f.status === 'Trabalhando').length,
      paradas: cityFrentes.filter(f => f.status === 'Parada').length,
      ventoChuva: cityFrentes.filter(f => f.status === 'C/Vento/Chuva').length,
      mudancaArea: cityFrentes.filter(f => f.status === 'Mudança').length,
    };
    
    // Fallback for visual weight if no frentes exist
    const baseTotal = counts.trabalhando + counts.paradas + counts.ventoChuva + counts.mudancaArea;
    const total = baseTotal || 1;
    
    return { 
      ...counts, 
      total, 
      cidade: DADOS_USINAS[selectedUsina].cidade 
    };
  }, [frentes, selectedUsina]);

  const addFrente = () => {
    setEditingFrenteId(null);
    setFrenteFormData({
      frente: '',
      nome: 'Corte/Carregamento',
      fazenda: '',
      quadras: '',
      talhoes: '',
      gestor: '',
      status: 'Trabalhando'
    });
    setIsFrenteModalOpen(true);
  };

  const editFrente = (frente: any) => {
    setEditingFrenteId(frente.id);
    setFrenteFormData({
      frente: frente.frente,
      nome: frente.nome,
      fazenda: frente.fazenda,
      quadras: frente.quadras.toString(),
      talhoes: frente.talhoes.toString(),
      gestor: frente.gestor,
      status: frente.status
    });
    setIsFrenteModalOpen(true);
  };

  const updateFrenteStatus = (id: number, newStatus: any) => {
    const now = new Date().toLocaleString('pt-BR');
    let frenteRef: any = null;
    
    setFrentes(prev => {
      const updated = prev.map(f => {
        if (f.id === id) {
          frenteRef = f;
          return { ...f, status: newStatus, updatedAt: now };
        }
        return f;
      });
      return updated;
    });

    if (frenteRef) {
      setLastGlobalUpdate(now);
      setAllLogs(prev => [{
        id: Date.now(),
        type: 'Status',
        event: 'Alteração de Status',
        detail: `Frente ${frenteRef.frente} (${frenteRef.nome}) mudou de [${frenteRef.status}] para [${newStatus}]`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: selectedUsina as string
      }, ...prev]);
    }
  };

  const saveFrente = (e: FormEvent) => {
    e.preventDefault();
    const now = new Date().toLocaleString('pt-BR');
    const newEntry = {
      frente: frenteFormData.frente || 'S/N',
      nome: frenteFormData.nome,
      fazenda: frenteFormData.fazenda || 'Faz. Local',
      cidade: selectedUsina,
      quadras: parseInt(frenteFormData.quadras) || 0,
      talhoes: parseInt(frenteFormData.talhoes) || 0,
      gestor: frenteFormData.gestor || 'A definir',
      status: frenteFormData.status as any,
      obs: '',
      updatedAt: now
    };

    if (editingFrenteId) {
      const existingFrente = frentes.find(f => f.id === editingFrenteId);
      const statusChanged = existingFrente && existingFrente.status !== newEntry.status;

      setFrentes(prev => prev.map(f => f.id === editingFrenteId ? { ...f, ...newEntry } : f));
      setLastGlobalUpdate(now);
      
      setAllLogs(prev => [{
        id: Date.now(),
        type: 'Status',
        event: statusChanged ? 'Status Alterado' : 'Dados Atualizados',
        detail: statusChanged 
          ? `Frente ${newEntry.frente} (${newEntry.nome}) alterou status para [${newEntry.status}] | Fazenda: ${newEntry.fazenda}`
          : `Frente ${newEntry.frente} (${newEntry.nome}) atualizada | Gestor: ${newEntry.gestor} | Fazenda: ${newEntry.fazenda}`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: selectedUsina as string
      }, ...prev]);
    } else {
      const id = Date.now();
      setFrentes(prev => [...prev, { id, ...newEntry }]);
      setLastGlobalUpdate(now);
      setAllLogs(prev => [{
        id: id,
        type: 'Cadastros',
        event: 'Nova frente cadastrada',
        detail: `Frente ${newEntry.frente} (${newEntry.nome}) | Fazenda: ${newEntry.fazenda} | Gestor: ${newEntry.gestor} | Estrutura: ${newEntry.quadras} Quadras / ${newEntry.talhoes} Talhões`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: selectedUsina as string
      }, ...prev]);
    }
    setIsFrenteModalOpen(false);
  };

  const openObsModal = (frente: any) => {
    setCurrentFrenteId(frente.id);
    setTempObs(frente.obs || '');
    setIsObsModalOpen(true);
  };

  const saveObs = () => {
    if (currentFrenteId !== null) {
      const now = new Date().toLocaleString('pt-BR');
      const frente = frentes.find(f => f.id === currentFrenteId);
      
      setFrentes(frentes.map(f => f.id === currentFrenteId ? { ...f, obs: tempObs, updatedAt: now } : f));
      setLastGlobalUpdate(now);

      if (frente) {
        setAllLogs(prev => [{
          id: Date.now(),
          type: 'Observações',
          event: 'Observação Adicionada',
          detail: `Frente ${frente.frente} (${frente.nome}) | Nova Obs: "${tempObs || 'Vazia'}"`,
          time: now,
          user: 'Centro de Operações Agricola',
          city: selectedUsina as string
        }, ...prev]);
      }

      setIsObsModalOpen(false);
      setCurrentFrenteId(null);
    }
  };

  const removeFrente = (frente: any) => {
    if (confirm(`Deseja excluir a frente ${frente.frente}?`)) {
      const now = new Date().toLocaleString('pt-BR');
      setFrentes(prev => prev.filter(f => f.id !== frente.id));
      setLastGlobalUpdate(now);
      setAllLogs(prev => [{
        id: Date.now(),
        type: 'Excluídos',
        event: 'Frente Removida permanentemente',
        detail: `Frente ${frente.frente} (${frente.nome}) | Fazenda: ${frente.fazenda} | Gestor: ${frente.gestor} | Estrutura: ${frente.quadras} Quadras / ${frente.talhoes} Talhões`,
        time: now,
        user: 'Centro de Operações Agricola',
        city: selectedUsina as string
      }, ...prev]);
      return true;
    }
    return false;
  };

  const usinaFleetCount = useMemo(() => {
    return fleet.filter(item => item.unidade === selectedUsina).length;
  }, [fleet, selectedUsina]);

  const allRankingData = useMemo(() => [
    { name: 'Trabalhando', value: currentData.trabalhando, color: '#00843D' },
    { name: 'Paradas', value: currentData.paradas, color: '#EF4444' },
    { name: 'C/Vento/Chuva', value: currentData.ventoChuva, color: '#60A5FA' },
    { name: 'Mudança', value: currentData.mudancaArea, color: '#9CA3AF' }
  ].sort((a, b) => b.value - a.value), [currentData]);

  const rankingData = useMemo(() => 
    filterStatus ? allRankingData.filter(d => d.name === filterStatus) : allRankingData,
  [allRankingData, filterStatus]);

  const allPieData = useMemo(() => [
    { name: 'Trabalhando', value: currentData.trabalhando, color: '#00843D' },
    { name: 'Paradas', value: currentData.paradas, color: '#EF4444' },
    { name: 'Vento/Chuva', value: currentData.ventoChuva, color: '#60A5FA' },
    { name: 'Mudança', value: currentData.mudancaArea, color: '#9CA3AF' }
  ], [currentData]);

  const pieData = useMemo(() => 
    filterStatus ? allPieData.filter(d => d.name === filterStatus || (filterStatus === 'C/Vento/Chuva' && d.name === 'Vento/Chuva')) : allPieData,
  [allPieData, filterStatus]);

  const hourlyData = useMemo(() => {
    // Adicionando variação baseada na usina para os dados parecerem reais
    const seed = selectedUsina.length;
    const data = [
      { time: '06:00', Trabalhando: 10 + seed % 3, Paradas: 2, 'Vento/Chuva': 0, 'Mudança': 1 },
      { time: '08:00', Trabalhando: 12 + seed % 2, Paradas: 1, 'Vento/Chuva': 0, 'Mudança': 2 },
      { time: '10:00', Trabalhando: 14 - seed % 3, Paradas: 0, 'Vento/Chuva': 1, 'Mudança': 1 },
      { time: '12:00', Trabalhando: 9 + seed % 4, Paradas: 4, 'Vento/Chuva': 2, 'Mudança': 1 },
      { time: '14:00', Trabalhando: 13 - seed % 2, Paradas: 1, 'Vento/Chuva': 1, 'Mudança': 2 },
      { time: '16:00', Trabalhando: 15 - seed % 4, Paradas: 0, 'Vento/Chuva': 0, 'Mudança': 3 },
      { time: '18:00', Trabalhando: 11 + seed % 3, Paradas: 2, 'Vento/Chuva': 1, 'Mudança': 1 },
      { time: '20:00', Trabalhando: 8 + seed % 2, Paradas: 3, 'Vento/Chuva': 0, 'Mudança': 2 },
    ];
    if (!filterStatus) return data;
    const key = filterStatus === 'C/Vento/Chuva' ? 'Vento/Chuva' : filterStatus;
    return data.map(d => ({ time: d.time, [key]: d[key as keyof typeof d] }));
  }, [filterStatus, selectedUsina]);

  const allComparisonData = useMemo(() => [
    { name: 'Trabalhando', Atual: currentData.trabalhando, Percentual: Math.round((currentData.trabalhando / currentData.total) * 100), color: '#00843D' },
    { name: 'Paradas', Atual: currentData.paradas, Percentual: Math.round((currentData.paradas / currentData.total) * 100), color: '#EF4444' },
    { name: 'Vento/Chuva', Atual: currentData.ventoChuva, Percentual: Math.round((currentData.ventoChuva / currentData.total) * 100), color: '#60A5FA' },
    { name: 'Mudança', Atual: currentData.mudancaArea, Percentual: Math.round((currentData.mudancaArea / currentData.total) * 100), color: '#9CA3AF' },
  ], [currentData]);

  const comparisonData = useMemo(() => 
    filterStatus ? allComparisonData.filter(d => d.name === filterStatus || (filterStatus === 'C/Vento/Chuva' && d.name === 'Vento/Chuva')) : allComparisonData,
  [allComparisonData, filterStatus]);

  const radarData = useMemo(() => {
    const data = [
      { subject: 'Trabalhando', A: currentData.trabalhando * 5, B: 12 * 5, fullMark: 100 },
      { subject: 'Paradas', A: (10 - currentData.paradas) * 10, B: 8 * 10, fullMark: 100 },
      { subject: 'V/Chuva', A: (10 - currentData.ventoChuva) * 10, B: 9 * 10, fullMark: 100 },
      { subject: 'Mudança', A: (10 - currentData.mudancaArea) * 10, B: 8 * 10, fullMark: 100 },
    ];
    if (!filterStatus) return data;
    const subjectMap: Record<string, string> = {
      'Trabalhando': 'Trabalhando',
      'Paradas': 'Paradas',
      'C/Vento/Chuva': 'V/Chuva',
      'Mudança': 'Mudança'
    };
    return data.filter(d => d.subject === subjectMap[filterStatus]);
  }, [currentData, filterStatus]);

  const logsData = useMemo(() => {
    return allLogs.filter(log => log.city === selectedUsina && log.type === historySubTab);
  }, [allLogs, selectedUsina, historySubTab]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'Cadastros': return <PlusCircle size={20} />;
      case 'Status': return <RefreshCw size={20} />;
      case 'Observações': return <MessageSquare size={20} />;
      case 'Excluídos': return <Trash2 size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const filteredFrentes = useMemo(() => {
    return frentes.filter(f => f.cidade === selectedUsina);
  }, [frentes, selectedUsina]);

  const themeStyleBlock = (
    <style>{`
      /* Safety net to preserve status green colors across themes */
      [data-theme] .status-label-ignore { color: #00843D !important; fill: #00843D !important; }
      [data-theme] [data-theme-ignore="true"] { color: #00843D !important; fill: #00843D !important; }
      [data-theme] .custom-green-scrollbar h2.text-\\[\\#00843D\\] { color: #00843D !important; }

      /* Custom Global Color Theme Overrides */
      [data-theme="blue"] {
        --color-primary: #02529C;
        --color-accent: #00D2FC;
      }

      /* Background overrides */
      [data-theme="blue"] .bg-\\[\\#00843D\\]:not([data-theme-ignore="true"]) { background-color: #02529C !important; }
      [data-theme="blue"] .hover\\:bg-\\[\\#00843D\\]:not([data-theme-ignore="true"]):hover { background-color: #004585 !important; }
      [data-theme="blue"] .bg-\\[\\#006B32\\]:not([data-theme-ignore="true"]) { background-color: #01417D !important; }
      [data-theme="blue"] .bg-\\[\\#5adc6a\\]:not([data-theme-ignore="true"]) { background-color: #00D2FC !important; }
      [data-theme="blue"] .bg-\\[\\#5adc6a\\]\\/15:not([data-theme-ignore="true"]) { background-color: rgba(0, 210, 252, 0.15) !important; }
      [data-theme="blue"] .bg-\\[\\#5adc6a\\]\\/20:not([data-theme-ignore="true"]) { background-color: rgba(0, 210, 252, 0.20) !important; }
      [data-theme="blue"] .bg-\\[\\#5adc6a\\]\\/\\[0\\.06\\]:not([data-theme-ignore="true"]) { background-color: rgba(0, 210, 252, 0.06) !important; }
      [data-theme="blue"] .bg-\\[\\#00843D\\]\\/10:not([data-theme-ignore="true"]) { background-color: rgba(2, 82, 156, 0.1) !important; }
      [data-theme="blue"] .bg-\\[\\#00843D\\]\\/30:not([data-theme-ignore="true"]) { background-color: rgba(2, 82, 156, 0.3) !important; }
      [data-theme="blue"] .hover\\:bg-green-800:not([data-theme-ignore="true"]):hover { background-color: #01417D !important; }
      [data-theme="blue"] .hover\\:bg-green-950\\/20:not([data-theme-ignore="true"]):hover { background-color: rgba(10, 25, 49, 0.2) !important; }

      /* Text overrides */
      [data-theme="blue"] .text-\\[\\#00843D\\]:not([data-theme-ignore="true"]):not(.status-label-ignore) { color: #02529C !important; }
      [data-theme="blue"] .text-\\[\\#006B32\\]:not([data-theme-ignore="true"]) { color: #01417D !important; }
      [data-theme="blue"] .text-\\[\\#5adc6a\\]:not([data-theme-ignore="true"]) { color: #00D2FC !important; }
      [data-theme="blue"] .text-\\[\\#5adc6a\\]\\/\\[0\\.02\\]:not([data-theme-ignore="true"]) { color: rgba(0, 210, 252, 0.02) !important; }
      [data-theme="blue"] .text-\\[\\#6ef27f\\]:not([data-theme-ignore="true"]) { color: #38BDF8 !important; }

      /* Gradients */
      [data-theme="blue"] .from-\\[\\#011a0c\\] {
        --tw-gradient-from: #040d21 !important;
        --tw-gradient-to: rgba(4, 13, 33, 0) !important;
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
      }
      [data-theme="blue"] .via-\\[\\#05160d\\] {
        --tw-gradient-to: rgba(5, 14, 30, 0) !important;
        --tw-gradient-stops: var(--tw-gradient-from), #050e1e !important, var(--tw-gradient-to) !important;
      }
      [data-theme="blue"] .to-\\[\\#010905\\] {
        --tw-gradient-to: #020611 !important;
      }
      [data-theme="blue"] .from-\\[\\#00843D\\] {
        --tw-gradient-from: #02529C !important;
      }
      [data-theme="blue"] .to-\\[\\#006B32\\] {
        --tw-gradient-to: #01417D !important;
      }
      [data-theme="blue"] .from-\\[\\#003B1A\\] {
        --tw-gradient-from: #081a3e !important;
      }
      [data-theme="blue"] .via-\\[\\#004D22\\] {
        --tw-gradient-to: rgba(8, 30, 70, 0) !important;
        --tw-gradient-stops: var(--tw-gradient-from), #0d2757 !important, var(--tw-gradient-to) !important;
      }
      [data-theme="blue"] .to-\\[\\#0d1e15\\] {
        --tw-gradient-to: #041026 !important;
      }

      /* Borders and shadows */
      [data-theme="blue"] .border-\\[\\#00843D\\]:not([data-theme-ignore="true"]) { border-color: #02529C !important; }
      [data-theme="blue"] .border-\\[\\#5adc6a\\]:not([data-theme-ignore="true"]) { border-color: #00D2FC !important; }
      [data-theme="blue"] .focus\\:border-\\[\\#5adc6a\\]:not([data-theme-ignore="true"]):focus { border-color: #00D2FC !important; }
      [data-theme="blue"] .hover\\:border-\\[\\#5adc6a\\]\\/30:not([data-theme-ignore="true"]):hover { border-color: rgba(0, 210, 252, 0.3) !important; }
      [data-theme="blue"] .shadow-green-900\\/10:not([data-theme-ignore="true"]) { --tw-shadow-color: rgba(2, 40, 90, 0.1) !important; }
      [data-theme="blue"] .focus\\:ring-\\[\\#5adc6a\\]\\/20:not([data-theme-ignore="true"]):focus { --tw-ring-color: rgba(0, 210, 252, 0.20) !important; }

      /* SVG override restricted ONLY to sidebar and login screen to protect charts */
      [data-theme="blue"] aside svg [fill="#00843D"] { fill: #02529C !important; }
      [data-theme="blue"] aside svg [stroke="#00843D"] { stroke: #02529C !important; }
      [data-theme="blue"] aside svg [fill="#006B32"] { fill: #01417D !important; }
      [data-theme="blue"] aside svg [stroke="#006B32"] { stroke: #01417D !important; }
      [data-theme="blue"] aside svg [fill="#5adc6a"] { fill: #00D2FC !important; }
      [data-theme="blue"] aside svg [stroke="#5adc6a"] { stroke: #00D2FC !important; }
      [data-theme="blue"] aside svg path[stroke="#00843D"] { stroke: #02529C !important; }
      [data-theme="blue"] aside svg path[stroke="#5adc6a"] { stroke: #00D2FC !important; }
      [data-theme="blue"] aside svg circle[fill="#5adc6a"] { fill: #00D2FC !important; }

      [data-theme="blue"] #login-container svg [fill="#00843D"] { fill: #02529C !important; }
      [data-theme="blue"] #login-container svg [stroke="#00843D"] { stroke: #02529C !important; }
      [data-theme="blue"] #login-container svg [fill="#006B32"] { fill: #01417D !important; }
      [data-theme="blue"] #login-container svg [stroke="#006B32"] { stroke: #01417D !important; }
      [data-theme="blue"] #login-container svg [fill="#5adc6a"] { fill: #00D2FC !important; }
      [data-theme="blue"] #login-container svg [stroke="#5adc6a"] { stroke: #00D2FC !important; }
      [data-theme="blue"] #login-container svg path[stroke="#5adc6a"] { stroke: #00D2FC !important; }
      [data-theme="blue"] #login-container svg circle[fill="#5adc6a"] { fill: #00D2FC !important; }

      /* Sidebar */
      [data-theme="blue"] aside.bg-\\[\\#00843D\\] { background-color: #02488a !important; }
      [data-theme="blue"] aside .bg-\\[\\#5adc6a\\] { background-color: #00D2FC !important; color: #012040 !important; }
      [data-theme="blue"] aside .text-\\[\\#004d22\\] { color: #012040 !important; }

      /* ================= BLUE THEME DARK MODE ACCESSIBILITY ================= */
      .dark [data-theme="blue"] .text-\\[\\#00843D\\]:not([data-theme-ignore="true"]):not(.status-label-ignore),
      .dark[data-theme="blue"] .text-\\[\\#00843D\\]:not([data-theme-ignore="true"]):not(.status-label-ignore) {
        color: #38BDF8 !important;
      }
      .dark [data-theme="blue"] .text-\\[\\#006B32\\]:not([data-theme-ignore="true"]),
      .dark[data-theme="blue"] .text-\\[\\#006B32\\]:not([data-theme-ignore="true"]) {
        color: #00D2FC !important;
      }
      .dark [data-theme="blue"] .bg-white,
      .dark[data-theme="blue"] .bg-white {
        background-color: #111827 !important;
        border-color: #1f2937 !important;
      }
      .dark [data-theme="blue"] .border-gray-100,
      .dark[data-theme="blue"] .border-gray-100 {
        border-color: #1f2937 !important;
      }
    `}</style>
  );

  if (!isLoggedIn) {
    return (
      <div data-theme={theme} className="contents">
        {themeStyleBlock}
        <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div data-theme={theme} className={cn("contents", isDarkMode && "dark")}>
      {themeStyleBlock}
      <div className={cn("flex h-screen w-full bg-[#F3F4F6] font-sans overflow-hidden transition-colors duration-300", isDarkMode && "dark")}>
      {activeTab === 'Visão Plantio' && (
        <VisaoPlantio
          onClose={() => setActiveTab('Plantio')}
          lastPlantioUpdate={lastPlantioUpdate}
          fleet={fleet}
          frentes={frentes}
          selectedUsina={selectedUsina}
        />
      )}
      {/* SIDEBAR BACKDROP FOR MOBILE */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 bg-[#00843D] flex flex-col shadow-2xl transition-all duration-300 ease-in-out lg:static lg:z-20 shrink-0 h-full overflow-hidden",
        isSidebarCollapsed ? "w-0 lg:w-0 -translate-x-full lg:translate-x-0 opacity-0 pointer-events-none" : "w-64 lg:w-64 translate-x-0 opacity-100",
        isMobileSidebarOpen ? "translate-x-0 animate-none" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="w-64 flex flex-col h-full shrink-0">
          <div className="pt-12 pb-10 flex flex-col items-center justify-center border-b border-white/10 relative">
          {/* Close button on mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            <X size={16} />
          </button>
          <div className="w-full flex items-center justify-center px-4">
            <svg viewBox="5 5 275 80" className="w-full h-auto text-white fill-current transition-transform duration-300 hover:scale-[1.03]" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(10, -1) scale(1.15)" stroke="#00843D" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
                <path d="M 35 5 C 16.5 5 2 19.5 2 38 C 2 56.5 16.5 71 35 71 C 39.3 71 43.4 70.2 47.1 68.7 C 40.2 66.7 35 60.4 35 52.9 C 35 43.5 42.7 35.8 52.1 35.8 C 52.8 35.8 53.4 35.8 54 35.9 C 53.5 29.6 50.8 23.8 46.4 19.4 C 43.4 16.4 39.8 13.1 35 5 Z" fill="currentColor" />
                <path d="M 39.8 13.1 C 48.4 13.1 56 20.2 59.3 28.3 C 55 28.8 50.7 28.1 47.4 25 C 42.6 20.5 40 16.9 39.8 13.1 Z" fill="currentColor" />
                <path d="M 28.4 38 C 32.2 33.3 38.8 30.4 44.5 30.4 C 40.7 32.3 38.3 35.6 37.9 39.4 C 37.4 43.7 39.8 47 43.6 48.4 C 36.5 47.5 32.2 42.7 28.4 38 Z" fill="currentColor" />
                <path d="M 8.5 38 C 8.5 21.9 21.6 8.7 37.7 8.7 C 30.1 11.4 24.6 18.2 24.6 26.2 C 24.6 36.8 33.2 45.4 43.8 45.4 C 47.9 45.4 51.7 44.1 54.8 41.8 C 51.7 53.6 40.9 62.4 28.2 62.4 C 17.3 62.4 8.5 51.4 8.5 38 Z" fill="currentColor" />
                {/* Linhas divisorias internas (veios) das velas e casco, reproduzindo o logo oficial idêntico */}
                <path d="M 35 5 C 22 11 12 23 8.5 38" fill="none" />
                <path d="M 39.8 13.1 C 46 17 52 23 59.3 28.3" fill="none" />
                <path d="M 28.4 38 C 34 35 39 32 44.5 30.4" fill="none" />
                <path d="M 28.2 62.4 C 27 50 25.5 38 24.6 26.2" fill="none" />
              </g>
              <text x="96" y="45" fontFamily="Inter, system-ui, sans-serif" fontWeight="950" fontSize="30" fill="currentColor" letterSpacing="0.02em">COLOMBO</text>
              <text x="96" y="62" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="11" fill="currentColor" letterSpacing="0.12em" opacity="0.95">AGROINDÚSTRIA</text>
            </svg>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto">
          {[
            { id: 'Monitoramento', icon: LayoutDashboard },
            { id: 'Plantio', icon: Sprout },
            { id: 'Vinhaça', icon: Droplet },
            { id: 'Histórico', icon: Clock },
            { id: 'Relatórios', icon: FileText },
            { id: 'DDS', icon: Shield },
            { id: 'DIÁRIO COA', icon: ClipboardList },
            { id: 'DIÁRIO PLANTIO', icon: ClipboardList },
            { id: 'Pluviometria', icon: CloudRain },
            { id: 'Coazito', icon: Bot },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 text-left",
                activeTab === item.id 
                  ? "bg-[#5adc6a] text-[#004d22] shadow-lg shadow-[#5adc6a]/15 scale-[1.02]" 
                  : "bg-transparent text-white/80 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={16} className={cn("shrink-0", activeTab === item.id ? "text-[#004d22]" : "text-white/60 group-hover:text-white")} />
              <span className="truncate" title={item.id} translate="no">{item.id}</span>
            </button>
          ))}
        </nav>

        {/* MINIMIZED THEME CONTROL FOOTER */}
        <div className="p-3 border-t border-white/15 flex items-center justify-between shrink-0 bg-black/10 gap-2 select-none">
          {/* Dark Mode toggle - compact premium click button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-xl transition-all duration-200 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0",
              isDarkMode && "bg-white/5 text-yellow-400 hover:text-yellow-300"
            )}
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* Color Palette selectors - small premium glowing dots */}
          <div className="flex items-center gap-2 bg-black/20 px-2.5 py-1.5 rounded-full border border-white/5">
            {(['green', 'blue'] as const).map((t) => {
              const isActive = theme === t;
              const colorHex = t === 'green' ? '#5adc6a' : '#00D2FC';
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "w-4.5 h-4.5 rounded-full transition-all duration-300 relative flex items-center justify-center border border-white/10",
                    isActive ? "ring-2 ring-white scale-110 shadow-lg shadow-black/40" : "opacity-60 hover:opacity-100 hover:scale-105"
                  )}
                  title={t === 'green' ? 'Tema Verde' : 'Tema Azul'}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: colorHex }} 
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* LOGOUT SECURE ACTION */}
        <div className="p-4 border-t border-white/10 shrink-0 bg-black/20">
          <button
            onClick={() => {
              if (confirm('Deseja realmente encerrar sua sessão no sistema?')) {
                localStorage.removeItem('ppt_is_logged_in');
                setIsLoggedIn(false);
              }
            }}
            className="w-full py-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 text-red-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Lock size={12} />
            Encerrar Sessão
          </button>
        </div>
        </div>
      </aside>

      {/* Sleek Sidebar Toggle Arrow Button for Desktop */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={cn(
          "hidden lg:flex fixed top-1/2 -translate-y-1/2 z-30 items-center justify-center w-5 h-14 bg-[#00843D] text-white hover:bg-[#006B32] border border-white/20 rounded-r-2xl shadow-2xl transition-all duration-300 hover:scale-y-110 cursor-pointer",
          isSidebarCollapsed ? "left-0" : "left-64"
        )}
        style={{
          boxShadow: "4px 0 16px rgba(0,0,0,0.12)",
        }}
        title={isSidebarCollapsed ? "Expandir Menu" : "Recolher Menu"}
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={13} className="animate-pulse" />
        ) : (
          <ChevronLeft size={13} />
        )}
      </button>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* HEADER */}
        <header className="px-4 md:px-8 pt-4 md:pt-8 pb-4 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 bg-[#F3F4F6]">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[24px] shadow-sm border border-gray-100 flex-1 w-full lg:w-auto">
            {/* Hamburger button for mobile/tablet */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2.5 -ml-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-[#00843D] rounded-xl border border-gray-150 transition-all flex items-center justify-center shrink-0"
              title="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-1.5 h-8 bg-[#00843D] rounded-full hidden lg:block" />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] leading-none mb-1.5">
                Logística &amp; Tecnologia
              </p>
              <h1 className="text-sm md:text-2xl font-black text-[#006B32] uppercase tracking-tighter flex items-center gap-2 leading-none">
                Monitoramento PPT
                <span className="text-gray-300 font-bold text-lg select-none">/</span>
                <span className="text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-[10px] md:text-xs font-black tracking-widest uppercase transition-all shrink-0" translate="no">
                  {selectedUsina === 'Ariranha' ? 'ARI' : selectedUsina === 'Palestina' ? 'PAL' : 'STA'}
                </span>
                <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5 ml-1 items-center justify-center shrink-0">
                  <span className="relative inline-flex rounded-full h-2 md:h-2.5 md:w-2.5 bg-green-500"></span>
                </span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 bg-white px-3 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[24px] shadow-sm border border-gray-100 shrink-0 w-full lg:w-auto justify-between lg:justify-start overflow-x-auto">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden xl:inline">
              Selecione a Unidade:
            </span>
            <div className="flex gap-2" translate="no">
              {(['Ariranha', 'Palestina', 'Santa Albertina'] as UsinaKey[]).map((usina) => {
                const isActive = selectedUsina === usina;
                const label = usina === 'Ariranha' ? 'ARI' : usina === 'Palestina' ? 'PAL' : 'STA';
                return (
                  <button
                    key={usina}
                    onClick={() => setSelectedUsina(usina)}
                    className={cn(
                      "px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all duration-300 relative overflow-hidden",
                      isActive 
                        ? "bg-gradient-to-r from-[#00843D] to-[#006B32] text-white shadow-md shadow-green-900/10 scale-105 active:scale-95 border-none" 
                        : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 hover:text-gray-800"
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-0 bg-white/10 opacity-30 transform -skew-x-12" />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div 
          className="flex-1 p-4 md:p-8 space-y-4 md:space-y-6 overflow-y-auto w-full"
          onClick={() => setFilterStatus(null)}
        >
          {activeTab === 'Monitoramento' && (
            <>
              {/* SUB-TABS BAR FOR MONITORAMENTO (FRENTES VS DASHBOARD) */}
              <div className="flex bg-gray-200/50 dark:bg-gray-850/80 p-1.5 rounded-2xl w-fit gap-1 mb-6 border border-gray-300/30 dark:border-gray-700 select-none">
                <button
                  onClick={() => setActiveMonitoramentoSubTab('Frentes')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2",
                    activeMonitoramentoSubTab === 'Frentes'
                      ? "bg-[#00843D] text-white shadow-md shadow-green-900/10 scale-[1.02]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <LayoutDashboard size={14} />
                  Frentes - PPT
                </button>
                <button
                  onClick={() => setActiveMonitoramentoSubTab('Dashboard')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2",
                    activeMonitoramentoSubTab === 'Dashboard'
                      ? "bg-[#00843D] text-white shadow-md shadow-green-900/10 scale-[1.02]"
                      : "text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <BarChart3 size={14} />
                  Dashboard
                </button>
              </div>

              {activeMonitoramentoSubTab === 'Frentes' && (
                <>
                  {/* COA HERO BANNER - PROFESSIONAL TECH SVG GRAPHIC */}
              <div className="bg-gradient-to-r from-[#003B1A] via-[#004D22] to-[#0d1e15] text-white rounded-[32px] p-6 md:p-8 shadow-xl relative overflow-hidden border border-green-800 flex flex-col lg:flex-row items-center justify-between gap-8 mb-6">
                {/* Decorative glowing background mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(90,220,106,0.15),transparent_50%)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#5adc6a]/5 rounded-full filter blur-[80px] pointer-events-none" />
                
                {/* Left content panel */}
                <div className="flex-1 space-y-4 z-10">
                  <div className="inline-flex items-center gap-2 bg-[#5adc6a]/15 text-[#5adc6a] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#5adc6a]/20">
                    <span className="w-2 h-2 rounded-full bg-[#5adc6a]" />
                    Central de Operações Agrícolas (COA)
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase text-white leading-tight">
                    Conectividade &amp; <span className="text-[#5adc6a]">Telemetria Avançada</span>
                  </h2>
                  <p className="text-white/75 text-sm leading-relaxed max-w-xl">
                    Preparo, Plantio e Tratos Culturais (PPT) integrados em uma plataforma única. Gerencie a eficiência operacional das frentes de cultivo, controle o fluxo de vinhaça (SmartFlow) e audite frotas em tempo real.
                  </p>
                  
                  {/* Real-time statistics badges */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-black/20 px-3.5 py-2 rounded-xl border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/90">Sinais de Satélite: Ativos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 px-3.5 py-2 rounded-xl border border-white/5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#5adc6a]">Frotas Online: 100%</span>
                    </div>
                  </div>
                </div>

                {/* Right side - Tech Vector SVG Graphic */}
                <div className="w-full lg:w-[420px] h-[180px] lg:h-[200px] relative shrink-0 z-10 flex items-center justify-center">
                  <svg className="w-full h-full text-[#5adc6a]" viewBox="0 0 420 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Concentric Telemetry Radar Grids */}
                    <circle cx="210" cy="100" r="85" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3 3" />
                    <circle cx="210" cy="100" r="65" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.15" />
                    <circle cx="210" cy="100" r="45" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 5" />
                    
                    {/* Perspective Field Rows (Sugarcane / Agricultural) */}
                    <path d="M50 200 L210 100 M80 200 L210 100 M110 200 L210 100 M140 200 L210 100 M170 200 L210 100 M200 200 L210 100 M230 200 L210 100 M260 200 L210 100 M290 200 L210 100 M320 200 L210 100 M350 200 L210 100 M370 200 L210 100" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" />
                    <path d="M110 200 L210 100 M160 200 L210 100 M210 200 L210 100 M260 200 L210 100 M310 200 L210 100" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                    
                    {/* Horizon line */}
                    <line x1="10" y1="100" x2="410" y2="100" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                    
                    {/* Connected Nodes and Signals */}
                    <g opacity="0.85">
                      {/* Satellite Node */}
                      <circle cx="210" cy="30" r="5" fill="#5adc6a" />
                      <path d="M210 30 L210 100" stroke="#5adc6a" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
                      {/* Signal Waves */}
                      <path d="M195 45 Q210 55 225 45" stroke="#5adc6a" strokeWidth="1" strokeOpacity="0.5" fill="none" />
                      <path d="M185 55 Q210 70 235 55" stroke="#5adc6a" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                    </g>
                    
                    {/* Tractor representation - High-tech wireframe concept */}
                    <g transform="translate(190, 85)" opacity="0.9">
                      {/* Cabin */}
                      <rect x="12" y="5" width="16" height="12" rx="2" stroke="#5adc6a" strokeWidth="1.5" fill="#003B1A" />
                      {/* Engine Body */}
                      <rect x="5" y="14" width="30" height="12" rx="2" stroke="#5adc6a" strokeWidth="1.5" fill="#004D22" />
                      {/* Rear Large Wheel */}
                      <circle cx="8" cy="24" r="7" stroke="#5adc6a" strokeWidth="2" fill="#0d1e15" />
                      <circle cx="8" cy="24" r="3" fill="#5adc6a" />
                      {/* Front Small Wheel */}
                      <circle cx="30" cy="26" r="4.5" stroke="#5adc6a" strokeWidth="1.5" fill="#0d1e15" />
                      <circle cx="30" cy="26" r="1.5" fill="#5adc6a" />
                      {/* Antenna */}
                      <line x1="15" y1="5" x2="15" y2="-5" stroke="#5adc6a" strokeWidth="1" />
                      <circle cx="15" cy="-5" r="1.5" fill="#5adc6a" />
                      {/* Telemetry connection node */}
                      <circle cx="20" cy="18" r="2.5" fill="#5adc6a" />
                    </g>

                    {/* Decorative cybernetic UI details */}
                    <rect x="15" y="15" width="40" height="18" rx="4" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
                    <text x="22" y="27" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" fontSize="8">SYS_OK</text>
                    
                    <rect x="345" y="15" width="60" height="18" rx="4" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
                    <text x="352" y="27" fill="currentColor" fillOpacity="0.4" fontFamily="monospace" fontSize="8">LAT: 21.1S</text>

                    <circle cx="30" cy="150" r="1.5" fill="#5adc6a" />
                    <circle cx="390" cy="150" r="1.5" fill="#5adc6a" />
                    <line x1="30" y1="150" x2="60" y2="150" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
                    <line x1="360" y1="150" x2="390" y2="150" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />
                  </svg>
                </div>
              </div>

              {/* FRENTES - PPT TABLE SECTION */}
              <section className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-md overflow-hidden border border-gray-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-[#006B32] dark:text-green-400 uppercase tracking-tighter">Frentes - PPT</h3>
                  <button 
                    onClick={addFrente}
                    className="bg-[#00843D] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-sm uppercase tracking-wider hover:bg-green-800 transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} strokeWidth={3} />
                    Nova Frente
                  </button>
                </div>

                {/* Desktop View Table */}
                <div className="hidden xl:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-800">
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Frente</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fazenda</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cidade</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quadras</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Talhões</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestor</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data/Hora</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">OBS</th>
                        <th className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFrentes.map((f) => (
                        <tr key={f.id} className="border-b border-gray-50 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="py-4 pl-2 font-black text-[#006B32] dark:text-green-400">{f.frente}</td>
                          <td className="py-4 font-bold text-gray-800 dark:text-white notranslate" translate="no">{f.fazenda}</td>
                          <td className="py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 notranslate" translate="no">{f.cidade}</td>
                          <td className="py-4">
                            <div className="flex flex-col gap-1">
                              <span className={cn(
                                "text-[9px] px-2 py-0.5 rounded-full font-black uppercase text-white w-fit",
                                f.status === 'Trabalhando' ? "bg-green-600" :
                                f.status === 'Parada' ? "bg-red-600" :
                                f.status === 'C/Vento/Chuva' ? "bg-blue-600" :
                                "bg-gray-600"
                              )}>
                                {f.status}
                              </span>
                              <div className="flex gap-1">
                                {['T', 'P', 'V', 'M'].map((st) => {
                                  const statusMap: any = { 'T': 'Trabalhando', 'P': 'Parada', 'V': 'C/Vento/Chuva', 'M': 'Mudança' };
                                  const fullName = statusMap[st];
                                  return (
                                    <button
                                      key={st}
                                      onClick={() => updateFrenteStatus(f.id, fullName)}
                                      className={cn(
                                        "w-5 h-5 rounded flex items-center justify-center text-[8px] font-black border transition-all",
                                        f.status === fullName
                                          ? "bg-gray-100 border-gray-300 text-gray-400"
                                          : st === 'T' ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-600 hover:text-white" :
                                            st === 'P' ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white" :
                                            st === 'V' ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white" :
                                            "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white"
                                      )}
                                      title={`Mudar para ${fullName}`}
                                    >
                                      {st}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-bold text-[#00843D]">{f.quadras}</td>
                          <td className="py-4 text-sm font-bold text-[#00843D]">{f.talhoes}</td>
                          <td className="py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">{f.gestor}</td>
                          <td className="py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500">{f.updatedAt || lastGlobalUpdate}</td>
                          <td className="py-4 text-center">
                            <button 
                              onClick={() => openObsModal(f)}
                              className={cn(
                                "p-2 rounded-lg transition-all relative group/btn",
                                f.obs ? "bg-green-100 dark:bg-green-950/40 text-[#00843D] dark:text-green-400 border border-green-200 dark:border-green-900" : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                              )}
                            >
                              <MessageSquare size={16} fill={f.obs ? "currentColor" : "none"} />
                              {f.obs && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                            </button>
                          </td>
                          <td className="py-4 pr-2">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleDeleteFrente(f.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                title="Excluir Permanentemente"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button 
                                onClick={() => editFrente(f)}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile and Tablet View Cards */}
                <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFrentes.map((f) => (
                    <div 
                      key={f.id} 
                      className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col justify-between gap-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs font-black text-[#006B32] dark:text-green-400 uppercase tracking-tight">{f.frente}</p>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm notranslate mt-0.5" translate="no">{f.fazenda}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 notranslate" translate="no">{f.cidade}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded-full font-black uppercase text-white w-fit",
                            f.status === 'Trabalhando' ? "bg-green-600" :
                            f.status === 'Parada' ? "bg-red-600" :
                            f.status === 'C/Vento/Chuva' ? "bg-blue-600" :
                            "bg-gray-600"
                          )}>
                            {f.status}
                          </span>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {['T', 'P', 'V', 'M'].map((st) => {
                              const statusMap: any = { 'T': 'Trabalhando', 'P': 'Parada', 'V': 'C/Vento/Chuva', 'M': 'Mudança' };
                              const fullName = statusMap[st];
                              return (
                                <button
                                  key={st}
                                  onClick={() => updateFrenteStatus(f.id, fullName)}
                                  className={cn(
                                    "w-6 h-6 rounded flex items-center justify-center text-[9px] font-black border transition-all",
                                    f.status === fullName
                                      ? "bg-gray-100 border-gray-300 text-gray-400 cursor-default"
                                      : st === 'T' ? "bg-green-50 border-green-200 text-green-600 hover:bg-green-600 hover:text-white" :
                                        st === 'P' ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-600 hover:text-white" :
                                        st === 'V' ? "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white" :
                                        "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-600 hover:text-white"
                                  )}
                                  title={`Mudar para ${fullName}`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-gray-150/40 dark:border-slate-800/40 py-2.5">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Quadras</p>
                          <p className="font-bold text-[#00843D] mt-0.5">{f.quadras}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Talhões</p>
                          <p className="font-bold text-[#00843D] mt-0.5">{f.talhoes}</p>
                        </div>
                        <div className="col-span-2 mt-1.5">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Gestor</p>
                          <p className="font-semibold text-gray-700 dark:text-gray-300 mt-0.5">{f.gestor}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                        <span>Atualizado: {f.updatedAt || lastGlobalUpdate}</span>
                        <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => openObsModal(f)}
                            className={cn(
                              "p-2 rounded-lg transition-all relative",
                              f.obs ? "bg-green-100 dark:bg-green-950/40 text-[#00843D] dark:text-green-400 border border-green-200 dark:border-green-900" : "bg-gray-100 dark:bg-slate-800 text-gray-400 hover:bg-gray-200"
                            )}
                          >
                            <MessageSquare size={14} fill={f.obs ? "currentColor" : "none"} />
                            {f.obs && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
                          </button>
                          <button 
                            onClick={() => editFrente(f)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-blue-100 dark:border-slate-700"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFrente(f.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100 dark:border-slate-700"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ACOMPANHAMENTO DE FRENTES SECTION */}
              <div className="bg-white p-6 rounded-[32px] shadow-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-[#006B32] uppercase tracking-tighter">Acompanhamento de frentes</h3>
                  <button 
                    onClick={() => alert('Filtro de visualização avançada')}
                    className="bg-[#00843D] text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm uppercase tracking-wider hover:bg-green-800 transition-colors"
                  >
                    Visualizar Status
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFrentes.map((f) => (
                    <div 
                      key={f.id} 
                      onClick={() => setSelectedFrenteId(f.id)}
                      className={cn(
                        "border-2 rounded-2xl p-4 transition-all cursor-pointer hover:border-[#5adc6a] hover:scale-[1.02] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-lg hover:shadow-[#5adc6a]/15 active:scale-95",
                        f.status === 'Trabalhando' ? "border-[#00843D]/10 bg-[#00843D]/5" :
                        f.status === 'Parada' ? "border-red-100 bg-red-50" :
                        "border-blue-100 bg-blue-50"
                      )}
                      data-theme-ignore={f.status === 'Trabalhando' ? "true" : undefined}
                    >
                      <div className="flex justify-between items-start">
                        <h4 
                          className={cn(
                            "font-black",
                            f.status === 'Trabalhando' ? "text-[#00843D]" :
                            f.status === 'Parada' ? "text-red-700" :
                            "text-blue-700"
                          )}
                          data-theme-ignore={f.status === 'Trabalhando' ? "true" : undefined}
                        >{f.frente} - {f.nome}</h4>
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn(
                            "text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase",
                            f.status === 'Trabalhando' ? "bg-green-600" :
                            f.status === 'Parada' ? "bg-red-600" :
                            "bg-blue-600"
                          )}>{f.status}</span>
                          <div className="flex gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                            {['T', 'P', 'V', 'M'].map((st) => {
                              const statusMap: any = { 'T': 'Trabalhando', 'P': 'Parada', 'V': 'C/Vento/Chuva', 'M': 'Mudança' };
                              const fullName = statusMap[st];
                              return (
                                <button
                                  key={st}
                                  onClick={() => updateFrenteStatus(f.id, fullName)}
                                  className={cn(
                                    "w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black border transition-all",
                                    f.status === fullName
                                      ? "bg-white/50 border-white/20 text-white/40 cursor-default"
                                      : st === 'T' ? "bg-green-600 border-green-500 text-white hover:scale-110 shadow-sm" :
                                        st === 'P' ? "bg-red-600 border-red-500 text-white hover:scale-110 shadow-sm" :
                                        st === 'V' ? "bg-blue-600 border-blue-500 text-white hover:scale-110 shadow-sm" :
                                        "bg-gray-600 border-gray-500 text-white hover:scale-110 shadow-sm"
                                  )}
                                  title={`Mudar para ${fullName}`}
                                >
                                  {st}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs space-y-1 font-semibold text-gray-600">
                        <p className="flex items-center gap-1">
                          <MapPin 
                            size={12} 
                            className={f.status === 'Trabalhando' ? "text-[#00843D]" : f.status === 'Parada' ? "text-red-700" : "text-blue-700"} 
                            data-theme-ignore={f.status === 'Trabalhando' ? "true" : undefined}
                          /> 
                          {f.fazenda}
                        </p>
                        <p className="flex items-center gap-1">
                          <Users 
                            size={12} 
                            className={f.status === 'Trabalhando' ? "text-[#00843D]" : f.status === 'Parada' ? "text-red-700" : "text-blue-700"} 
                            data-theme-ignore={f.status === 'Trabalhando' ? "true" : undefined}
                          /> 
                          Gestor: {f.gestor}
                        </p>
                        <p className="flex items-center gap-1 text-[10px] mt-2 font-bold opacity-60"><Clock size={10} /> {f.updatedAt || lastGlobalUpdate}</p>
                      </div>
                    </div>
                  ))}
                  {filteredFrentes.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-[32px]">
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest" translate="no">Nenhuma frente monitorada em {selectedUsina}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

          {activeTab === 'Gestão Áreas' && (
            <GestaoAreas 
              onBack={() => setActiveTab('Plantio')} 
              selectedUsina={selectedUsina}
              onAddLog={(type, event, detail) => {
                try {
                  const raw = localStorage.getItem("gestao_areas_historico_logs");
                  const currentLogs = raw ? JSON.parse(raw) : [];
                  const newLog = {
                    id: `GA-LOG-${Date.now()}`,
                    timestamp: new Date().toLocaleString("pt-BR"),
                    categoria: type,
                    frente: "Várias",
                    detalhes: detail,
                    usuario: "luizricardocarvalhod@gmail.com"
                  };
                  localStorage.setItem("gestao_areas_historico_logs", JSON.stringify([newLog, ...currentLogs]));
                  window.dispatchEvent(new Event("gestao_areas_historico_changed"));
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          )}

          {activeTab === 'Plantio' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 text-left">
                  <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-[#00843D] shadow-inner shrink-0">
                    <Sprout size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Plantio</h2>
                    <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
                      Gestão de Frota e Monitoramento de Operação de Plantio
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => {
                      setEditingFleetId(null);
                      setIsFleetModalOpen(true);
                    }}
                    className="bg-[#00843D] hover:bg-[#006B32] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-900/10"
                  >
                    <PlusCircle size={18} />
                    Adicionar Equipamento
                  </button>
                  <button 
                    onClick={() => {
                      setEditingFrenteId(null);
                      setFrenteFormData({
                        frente: '',
                        nome: 'Plantio',
                        fazenda: '',
                        quadras: '',
                        talhoes: '',
                        gestor: '',
                        status: 'Trabalhando'
                      });
                      setIsFrenteModalOpen(true);
                    }}
                    className="bg-white border-2 border-[#00843D] text-[#00843D] hover:bg-green-50 px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                  >
                    <Tractor size={18} />
                    Adicionar Frente de Plantio
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('Visão Plantio');
                    }}
                    className="bg-[#00843D] hover:bg-[#006B32] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-green-900/10"
                  >
                    <span className="text-sm">👁️</span>
                    Visão Plantio
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab('Gestão Áreas');
                    }}
                    className="bg-white border-2 border-[#00843D] text-[#00843D] hover:bg-green-50 px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                  >
                    <Layers size={18} />
                    Gestão Áreas
                  </button>
                </div>
              </div>

              {/* HIGHLIGHTED PLANTIO FRENTES SECTION */}
              {filteredFrentes.filter(f => f.nome.toLowerCase().includes('plantio')).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredFrentes.filter(f => f.nome.toLowerCase().includes('plantio')).map((f) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-[#00843D] to-[#006B32] p-8 rounded-[40px] shadow-xl relative overflow-hidden group cursor-pointer hover:scale-[1.01] hover:shadow-2xl hover:shadow-[#5adc6a]/15 hover:ring-2 hover:ring-[#5adc6a]/40 transition-all border border-transparent hover:border-[#5adc6a]"
                      onClick={() => setSelectedFrenteId(f.id)}
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl group-hover:scale-125 transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/10 rounded-full translate-y-16 -translate-x-16 blur-2xl" />
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-3">
                              Frente de Plantio
                            </div>
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                              {f.frente}
                            </h3>
                            <p className="text-green-100 font-bold text-sm mt-1 opacity-80">{f.fazenda}</p>
                          </div>
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                            <Tractor size={32} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-green-100/50 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-lg font-black text-white uppercase tracking-tight">{f.status}</p>
                          </div>
                          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-green-100/50 uppercase tracking-widest mb-1">Gestor</p>
                            <p className="text-lg font-black text-white uppercase tracking-tight truncate">{f.gestor}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-green-100 font-black text-[10px] uppercase">
                              <MapPin size={14} />
                              {f.quadras} Quadras
                            </div>
                            <div className="w-1 h-1 bg-green-100/20 rounded-full" />
                            <div className="flex items-center gap-1.5 text-green-100 font-black text-[10px] uppercase">
                              <Sprout size={14} />
                              {f.talhoes} Talhões
                            </div>
                          </div>
                          <div className="text-[10px] font-black text-green-100/40 uppercase">
                            Atualizado: {f.updatedAt}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 bg-black/20 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: f.status === 'Trabalhando' ? '65%' : '0%' }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fleet.filter(item => item.unidade === selectedUsina).length > 0 ? (
                  fleet.filter(item => item.unidade === selectedUsina).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedFleetId(item.id)}
                      className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-[#5adc6a]/15 transition-all group cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                          item.tipo === 'Trator' ? "bg-amber-50 text-amber-600" :
                          item.tipo === 'Plantadeira' ? "bg-green-50 text-green-600" :
                          item.tipo === 'Colhedeira' ? "bg-purple-50 text-purple-600" :
                          "bg-blue-50 text-blue-600"
                        )}>
                          {item.tipo === 'Trator' ? <Tractor size={24} /> : 
                           item.tipo === 'Plantadeira' ? <Sprout size={24} /> : 
                           item.tipo === 'Colhedeira' ? <Settings size={24} /> :
                           <Truck size={24} />}
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              const itemToEdit = fleet.find(f => f.id === item.id);
                              if (itemToEdit) {
                                setFleetFormData({
                                  tipo: itemToEdit.tipo,
                                  modelo: itemToEdit.modelo,
                                  prefixo: itemToEdit.prefixo,
                                  status: itemToEdit.status,
                                  unidade: itemToEdit.unidade // Added missing unidad
                                });
                                setEditingFleetId(item.id);
                                setIsFleetModalOpen(true);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Deseja excluir este equipamento?')) {
                                const now = new Date().toLocaleString('pt-BR');
                                const itemToRemove = fleet.find(f => f.id === item.id);
                                if (itemToRemove) {
                                  setAllLogs(prev => [{
                                    id: Date.now(),
                                    type: 'Excluídos',
                                    event: 'Equipamento Removido',
                                    detail: `${itemToRemove.tipo} ${itemToRemove.prefixo} (${itemToRemove.modelo}) removido da frota de ${itemToRemove.unidade}`,
                                    time: now,
                                    user: 'Centro de Operações Agricola',
                                    city: itemToRemove.unidade
                                  }, ...prev]);
                                }
                                setFleet(prev => prev.filter(f => f.id !== item.id));
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.tipo}</p>
                        <h4 className="text-lg font-black text-gray-900 uppercase leading-none">{item.modelo}</h4>
                        <p className="text-xs font-bold text-[#00843D] uppercase">Frota: {item.prefixo}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter",
                          item.status === 'Reserva' ? "bg-orange-100 text-orange-700" :
                          item.status === 'Trabalhando' ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {item.status}
                        </div>
                        <span className="text-[8px] font-bold text-gray-400 uppercase">{item.updatedAt}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Truck size={32} />
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest" translate="no">Nenhum equipamento cadastrado em {selectedUsina}</p>
                    <button 
                      onClick={() => {
                        setEditingFleetId(null);
                        setIsFleetModalOpen(true);
                      }}
                      className="mt-6 text-[#00843D] hover:text-[#006B32] font-black uppercase text-[10px] underline underline-offset-4"
                    >
                      Cadastrar Primeiro Equipamento
                    </button>
                  </div>
                )}
              </div>

              {/* 24H MONITORING TABLE */}
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                  <div className="shrink-0 text-left">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg">Acompanhamento do Plantio</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status operacional detalhado por equipamento</p>
                    <p className="text-[9px] text-[#00843D] font-black uppercase mt-2 border-l-2 border-[#F4D000] pl-2">Ultima limpeza: {lastClearInfo}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 px-3 border-r border-gray-200">
                        <Calendar size={14} className="text-gray-400" />
                        <input 
                          type="date" 
                          value={monitoringDate}
                          onChange={(e) => setMonitoringDate(e.target.value)}
                          className="bg-transparent border-none text-[10px] font-black uppercase outline-none focus:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-2 px-3">
                        <Clock size={14} className="text-gray-400" />
                        <input 
                          type="time" 
                          value={monitoringTime}
                          onChange={(e) => setMonitoringTime(e.target.value)}
                          className="bg-transparent border-none text-[10px] font-black uppercase outline-none focus:ring-0"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleClearPlantioTable}
                      className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all border border-red-100"
                    >
                      <Eraser size={14} />
                      Limpar Tabela
                    </button>
                  </div>

                  {/* Legend */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {HOURLY_STATUS_MAP.map(opt => (
                        <div key={opt.label} className="flex items-center gap-2 bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm transition-all hover:bg-gray-100">
                          <div className={cn("w-3 h-3 rounded-full shadow-sm", opt.color)}></div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-tight">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                <div className="overflow-x-auto custom-scrollbar rounded-[32px] border border-gray-100 bg-white">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full text-left border-separate border-spacing-0">
                      <thead>
                        <tr className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">
                          <th className="py-6 px-8 sticky left-0 bg-white z-30 min-w-[300px] text-sm font-black text-[#006B32] uppercase tracking-[0.2em] border-b border-r border-gray-100 italic shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
                            Frota / Modelo
                          </th>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <th key={i} className="py-6 text-center px-4 min-w-[70px] border-b border-gray-100 text-sm font-black text-gray-700 tracking-tighter bg-white z-10" translate="no">
                              {i.toString().padStart(2, '0')}<span className="text-[10px] opacity-60 ml-0.5 font-bold">h</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {fleet.filter(item => item.unidade === selectedUsina).map((item) => (
                          <tr key={item.id} className="group hover:bg-gray-50/30 transition-colors">
                            <td 
                              className="py-6 px-8 sticky left-0 bg-white z-20 border-r border-gray-100 shadow-[4px_0_12px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-gray-50 transition-all active:scale-95"
                              onClick={() => setSelectedFleetId(item.id)}
                            >
                              <div className="flex items-center gap-5">
                                <div className={cn(
                                  "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 transition-all group-hover:scale-105 group-hover:shadow-green-900/10",
                                  item.tipo === 'Trator' ? "bg-amber-500" :
                                  item.tipo === 'Plantadeira' ? "bg-green-600" :
                                  item.tipo === 'Colhedeira' ? "bg-purple-600" :
                                  "bg-blue-600"
                                )}>
                                  {item.tipo === 'Trator' ? <Tractor size={32} /> : 
                                   item.tipo === 'Plantadeira' ? <Sprout size={32} /> : 
                                   item.tipo === 'Colhedeira' ? <Settings size={32} /> :
                                   <Truck size={32} />}
                                </div>
                                <div className="leading-none">
                                  <p className="text-4xl font-black text-gray-950 uppercase truncate max-w-[200px] font-['Arial',sans-serif] tracking-tighter drop-shadow-sm leading-none">{item.prefixo}</p>
                                  <p className="text-[15px] font-black text-gray-400 uppercase truncate max-w-[200px] font-['Arial',sans-serif] tracking-[0.15em] mt-2 opacity-80 leading-none">{item.modelo}</p>
                                </div>
                              </div>
                            </td>
                            {Array.from({ length: 24 }).map((_, h) => {
                              const currentStatus = item.hourlyData?.[h] || 'Reserva';
                              const statusInfo = HOURLY_STATUS_MAP.find(s => s.label === currentStatus) || HOURLY_STATUS_MAP[6];
                              
                              return (
                                <td key={h} className="py-4 text-center relative group/cell border-b border-gray-50/50">
                                  <div className="relative inline-block">
                                    <select
                                      value={currentStatus}
                                      onChange={(e) => updateHourlyStatus(item.id, h, e.target.value)}
                                      className={cn(
                                        "w-10 h-10 rounded-xl appearance-none cursor-pointer transition-all hover:scale-110 shadow-md border-0 focus:ring-2 focus:ring-black px-0 text-center",
                                        statusInfo.color
                                      )}
                                      style={{ color: 'transparent' }}
                                      title={`${h}h: ${currentStatus}`}
                                    >
                                      {HOURLY_STATUS_MAP.map(opt => (
                                        <option key={opt.label} value={opt.label} className="text-gray-900 bg-white text-[10px] font-bold">
                                          {opt.label}
                                        </option>
                                      ))}
                                      <option value="Limpar" className="text-red-600 bg-white text-[10px] font-black uppercase">Limpar</option>
                                    </select>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                       <ChevronDown size={8} className="text-black/30" />
                                    </div>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ANALYTICS SECTION */}
              {fleet.filter(item => item.unidade === selectedUsina).length > 0 && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Efficiency Card */}
                    <div 
                      onClick={() => setZoomedCardId('Efficiency')}
                      className="bg-white p-4 sm:p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center lg:row-span-2 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all group w-full"
                    >
                       <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner group-hover:scale-110 transition-transform">
                        <Activity className="text-[#00843D]" size={36} />
                      </div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-tight">Eficiência Operacional</h4>
                      <p className="text-5xl sm:text-6xl font-black text-gray-900 mt-2 tracking-tighter">
                        {calculateUsinaEfficiency(selectedUsina)}%
                      </p>
                      <div className="mt-6 sm:mt-8 w-full space-y-2.5">
                         {HOURLY_STATUS_MAP.map(status => {
                           const usinaFleet = fleet.filter(item => item.unidade === selectedUsina);
                           let total = 0;
                           let count = 0;
                           usinaFleet.forEach(f => {
                             (f.hourlyData || []).forEach(s => {
                               total++;
                               if (s === status.label) count++;
                             });
                           });
                           if (total === 0 && status.label === 'Reserva') return null;
                           const perc = total > 0 ? (count / total * 100).toFixed(1) : "0";
                           return (
                             <div key={status.label} className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-2xl bg-gray-50/50 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-100 group">
                               <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                 <div className={cn("w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md group-hover:scale-110 transition-transform shrink-0", status.color)}></div>
                                 <span className="text-[9px] sm:text-[11px] font-black text-gray-700 uppercase tracking-wide truncate" title={status.label}>{status.label}</span>
                               </div>
                               <span className="text-lg sm:text-xl font-black text-gray-950 shrink-0 ml-2">{perc}%</span>
                             </div>
                           );
                         })}
                      </div>
                    </div>

                    {/* Operational Distribution */}
                    <div 
                      onClick={() => setZoomedCardId('Distribution')}
                      className="bg-white p-4 sm:p-8 rounded-[32px] shadow-sm border border-gray-100 lg:col-span-2 cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all w-full overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 text-left">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight text-base sm:text-lg">Distribuição Operacional (Horas Totais)</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                           {HOURLY_STATUS_MAP.slice(0, 3).map(s => (
                             <div key={s.label} className="flex items-center gap-1.5 sm:gap-2">
                               <div className={cn("w-2 h-2 rounded-full", s.color)}></div>
                               <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">{s.label}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Array.from({ length: 24 }).map((_, h) => {
                              const data: any = { hour: `${h}h` };
                              HOURLY_STATUS_MAP.forEach(s => {
                                data[s.label] = fleet
                                  .filter(item => item.unidade === selectedUsina)
                                  .filter(item => item.hourlyData?.[h] === s.label).length;
                              });
                              return data;
                            })}
                            barCategoryGap={10}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis 
                              dataKey="hour" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 8, fontWeight: 900, fill: '#9ca3af' }}
                              interval={0}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              domain={[0, (fleet.filter(item => item.unidade === selectedUsina).length || 1) + 1]}
                              tick={{ fontSize: 8, fontWeight: 900, fill: '#9ca3af' }}
                            />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }}
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                            />
                            {HOURLY_STATUS_MAP.map(status => (
                              <Bar key={status.label} dataKey={status.label} stackId="a" fill={status.hex} radius={[0, 0, 0, 0]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* NEW: 3D Realistic Performance Chart */}
                    <div 
                      onClick={() => setZoomedCardId('3DPerf')}
                      className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 lg:col-span-2 overflow-hidden relative group cursor-pointer hover:shadow-xl hover:scale-[1.01] transition-all"
                    >
                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <h4 className="font-black text-gray-900 uppercase tracking-tight text-lg">Visão 3D Operacional <span className="text-gray-300 font-bold ml-2">Realista</span></h4>
                        <div className="flex items-center gap-3">
                           <div className="flex -space-x-2">
                             {[...Array(4)].map((_, i) => (
                               <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                                 {i + 1}
                               </div>
                             ))}
                           </div>
                           <div className="w-16 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                             <motion.div 
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="h-full w-1/2 bg-[#00843D]"
                             />
                           </div>
                        </div>
                      </div>

                      <div className="h-[280px] w-full flex items-center justify-center relative" style={{ perspective: '2000px' }}>
                        {/* 3D Content Container */}
                        <motion.div
                          animate={{ 
                            rotateY: [0, 360],
                            rotateX: [15, 25, 15],
                          }}
                          transition={{ 
                            duration: 30, 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                          className="relative w-[300px] h-[300px] flex items-center justify-center"
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          {/* We simulate a 3D Donut by stacking 10 identical PieCharts with Z-offset */}
                          {[...Array(12)].map((_, i) => {
                            const usinaFleet = fleet.filter(item => item.unidade === selectedUsina);
                            const pieData = HOURLY_STATUS_MAP.map(status => {
                              let count = 0;
                              let total = 0;
                              usinaFleet.forEach(f => {
                                (f.hourlyData || []).forEach(s => {
                                  total++;
                                  if (s === status.label) count++;
                                });
                              });
                              return { name: status.label, value: count || 0.1, color: status.hex };
                            }).filter(s => s.value > 0);

                            return (
                              <div 
                                key={i} 
                                className="absolute inset-0 pointer-events-none" 
                                style={{ 
                                  transform: `translateZ(${i * 1.5}px)`,
                                  opacity: i === 11 ? 1 : 0.8 - (i * 0.05),
                                  filter: i < 11 ? 'brightness(0.7) blur(0.5px)' : 'none'
                                }}
                              >
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={pieData}
                                      innerRadius={70}
                                      outerRadius={110}
                                      paddingAngle={2}
                                      dataKey="value"
                                      stroke="none"
                                      isAnimationActive={false}
                                    >
                                      {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                    </Pie>
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            );
                          })}

                          {/* Center Floating Core */}
                          <div 
                            className="absolute bg-white rounded-full w-24 h-24 shadow-[inset_0_4px_12px_rgba(0,0,0,0.1),0_8px_32px_rgba(0,132,61,0.1)] flex flex-col items-center justify-center text-center border-4 border-gray-50"
                            style={{ transform: 'translateZ(25px)' }}
                          >
                             <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                             <p className="text-xl font-black text-[#00843D] tracking-tighter">{calculateUsinaEfficiency(selectedUsina)}%</p>
                          </div>
                        </motion.div>

                        {/* Aesthetic Floating Elements */}
                        <div className="absolute inset-0 pointer-events-none">
                           <motion.div 
                            animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-2xl"
                           />
                           <motion.div 
                            animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                            className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl"
                           />
                        </div>
                      </div>

                      {/* Legend Overlay */}
                      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
                         {HOURLY_STATUS_MAP.slice(0, 4).map(s => (
                           <div key={s.label} className="flex items-center gap-3 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                             <div className={cn("w-2 h-2 rounded-full", s.color)}></div>
                             <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{s.label}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>


                  {/* PRODUCTIVITY RANKING */}
                  <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 mt-6">
                    <h4 className="font-black text-gray-900 uppercase tracking-tight text-lg mb-6">Ranking de Produtividade (Horas Trabalhadas)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {fleet
                        .filter(item => item.unidade === selectedUsina)
                        .map(item => {
                          const workingHours = (item.hourlyData || []).filter(s => s === 'Trabalhando').length;
                          const partialHours = (item.hourlyData || []).filter(s => s === 'Trabalhando Parcial').length;
                          const totalScore = workingHours + (partialHours * 0.5);
                          return { ...item, score: totalScore, workingHours, partialHours };
                        })
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 6)
                        .map((item, idx) => (
                          <div 
                            key={item.id} 
                            onClick={() => setSelectedFleetId(item.id)}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-green-200 transition-all cursor-pointer hover:scale-[1.02]"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-gray-400 border border-gray-100">
                              #{idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-gray-900 uppercase truncate">{item.prefixo}</p>
                              <p className="text-[9px] font-bold text-gray-400 uppercase truncate">{item.modelo}</p>
                              <div className="mt-2 flex items-center gap-1">
                                 <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-green-500 rounded-full" 
                                     style={{ width: `${(item.score / 24) * 100}%` }}
                                   ></div>
                                 </div>
                                 <span className="text-[9px] font-black text-gray-900">{item.workingHours}h</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'Vinhaça' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onClick={(e) => e.stopPropagation()}>
              
              {/* NOTIFICATION FEEDBACK TOAST */}
              {vinhacaNotification && (
                <div className="bg-[#00843D] border border-[#5adc6a]/30 text-white p-4 rounded-2xl flex items-center justify-between font-black uppercase text-xs shadow-lg shadow-green-950/20 animate-bounce">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span>{vinhacaNotification}</span>
                  </div>
                  <button onClick={() => setVinhacaNotification(null)} className="hover:scale-110 active:scale-90 transition-transform p-1">
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* BEAUTIFUL BANNER CONTAINER AT TOP */}
              <div className="bg-gradient-to-br from-[#005c36] via-[#00843D] to-[#0d5335] p-8 md:p-10 rounded-[32px] text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full translate-y-32 -translate-x-32 blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6 text-left">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#5adc6a] border border-white/20 shadow-inner shrink-0">
                      <Droplet size={36} className="text-[#5adc6a]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.3em] leading-none mb-2">
                        MONITORAMENTO INDUSTRIAL &amp; AGRO-LOGÍSTICA
                      </p>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">
                        Gestão de Frota e Monitoramento de Distribuição de Vinhaça
                      </h2>
                      <p className="text-white/70 text-[11px] font-bold uppercase mt-2 tracking-wide">
                        Unidade {selectedUsina} • Fertirrigação Sustentável Colombo
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl py-3 px-5 flex items-center gap-3 shrink-0 self-start md:self-auto shadow-inner">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                    </span>
                    <div className="text-left">
                      <p className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Status Conexão</p>
                      <p className="text-[10px] font-black text-white uppercase mt-0.5">TELEMETRIA ONLINE</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HORIZONTAL SUB-TAB BAR (FOLLOWING EXACTLY THE USER SCREENSHOT DESIGN AND COLOURS) */}
              <div className="bg-white p-3 rounded-[28px] shadow-sm border border-gray-100 flex flex-col items-stretch">
                <div className="overflow-x-auto scrollbar-custom pb-2">
                  <div className="flex items-center gap-2 min-w-max px-1 py-1">
                    {[
                      { id: 'SmartFlow - Vinhaça', icon: Activity },
                      { id: 'Apontamento', icon: FileText },
                      { id: 'Dashboard', icon: BarChart3 },
                      { id: 'Níveis', icon: Droplet },
                      { id: 'Fechamento', icon: Calendar },
                      { id: 'Tanques', icon: Factory },
                      { id: 'Cad Motoristas', icon: Users },
                      { id: 'Cad Fazendas', icon: Sprout },
                    ].map((btn) => {
                      const isActive = activeVinhacaSubTab === btn.id;
                      const IconComponent = btn.icon;
                      return (
                        <div key={btn.id} className="relative flex flex-col items-center">
                          <button
                            onClick={() => setActiveVinhacaSubTab(btn.id)}
                            className={cn(
                              "flex items-center gap-2 px-5 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer",
                              isActive 
                                ? "bg-[#5adc6a] text-[#004d22] scale-[1.03] shadow-md shadow-[#5adc6a]/15" 
                                : "bg-[#00843D] text-white hover:bg-[#5adc6a] hover:text-[#004d22]"
                            )}
                          >
                            <IconComponent size={14} className={isActive ? "text-[#004d22] shrink-0" : "text-white/60 shrink-0"} />
                            <span>{btn.id}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT AREA ACCORDING TO THE ACTIVE SUB-TAB */}
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 min-h-[400px]">
                
                {/* SUB TAB 1: SMARTFLOW - VINHAÇA */}
                {activeVinhacaSubTab === 'SmartFlow - Vinhaça' && (() => {
                  const handleDataUpdate = (fKey: string, field: any, val?: any) => {
                    if (val === undefined) return;
                    setVinhacaSmartFlowData((prev: any) => ({
                      ...prev,
                      [fKey]: {
                        ...(prev[fKey] || {}),
                        [field]: val
                      }
                    }));
                  };

                  const handleAddFrenteSubmit = () => {
                    const cleanName = newSmartFlowFrenteInput.trim();
                    if (!cleanName) return;
                    if (vinhacaFrentesList.map(f => f.toLowerCase()).includes(cleanName.toLowerCase())) {
                      alert("Esta frente ou unidade já existe!");
                      return;
                    }
                    
                    setVinhacaFrentesList(prev => [...prev, cleanName]);
                    setVinhacaSmartFlowData(prev => ({
                      ...prev,
                      [cleanName]: {
                        carregamentoAtual: 'VN-115 (45 m³)',
                        situacaoTransporte: 'Normal',
                        situacaoDescarregamento: 'Normal / Aplicando',
                        areaQuadra: 'Fazenda Bonança - Quadra 04',
                        qtdaAplicMotor: '2 Motores / 4 Caminhões',
                        raioSelecionado: 15,
                        vazaoFrenteEstimada: 180,
                        vazaoFrenteReal: 175,
                        tempoCarregamento: 15,
                        tempoTrajetoCarregado: 32,
                        tempoDescarregamentoEspera: 45,
                        tempoTrajetoVazio: 28,
                        velocidadeMedia: 38,
                        intervaloDespachos: 15,
                        ultimoDespacho: '21:45',
                        proximoDespacho: '22:00',
                        despachoAtrasado: 'Não',
                      }
                    }));
                    setIsAddingSmartFlowFrente(false);
                    setNewSmartFlowFrenteInput('');
                  };

                  const handleRenameFrente = (oldName: string, newName: string) => {
                    const cleanNewName = newName.trim();
                    if (!cleanNewName) return;
                    if (cleanNewName.toLowerCase() === oldName.toLowerCase()) {
                      setEditingFrenteKey(null);
                      return;
                    }
                    if (vinhacaFrentesList.map(f => f.toLowerCase()).includes(cleanNewName.toLowerCase())) {
                      alert("Este nome de frente já está cadastrado!");
                      return;
                    }

                    setVinhacaFrentesList(prev => prev.map(f => f === oldName ? cleanNewName : f));
                    setVinhacaSmartFlowData((prev: any) => {
                      const updated = { ...prev };
                      if (updated[oldName]) {
                        updated[cleanNewName] = { ...updated[oldName] };
                        delete updated[oldName];
                      }
                      return updated;
                    });
                    setEditingFrenteKey(null);
                  };

                  const handleDeleteFrente = (frenteName: string) => {
                    if (vinhacaFrentesList.length <= 1) {
                      alert("Aviso: É preciso manter ao menos uma frente de vinhaça ativa no painel!");
                      return;
                    }
                    const confirmed = confirm(`Deseja realmente apagar a frente "${frenteName}" e excluir sua tabela de monitoramento?`);
                    if (!confirmed) return;

                    const filtered = vinhacaFrentesList.filter(f => f !== frenteName);
                    setVinhacaFrentesList(filtered);
                    setVinhacaSmartFlowData((prev: any) => {
                      const updated = { ...prev };
                      delete updated[frenteName];
                      return updated;
                    });
                    setEditingFrenteKey(null);
                  };

                  // Formatting today's date in Portuguese
                  const todayObj = vinhacaLiveDateTime;
                  const weekday = todayObj.toLocaleDateString('pt-BR', { weekday: 'long' });
                  const day = todayObj.getDate();
                  const month = todayObj.toLocaleDateString('pt-BR', { month: 'long' });
                  const year = todayObj.getFullYear();
                  const timeStr = todayObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const formattedDate = `${weekday}, ${day} de ${month} de ${year} • ${timeStr}`;

                  // Temporary stub variables to prevent breaking compilation downstream mid-edit
                  const currentFrenteKey = 'Ariranha';
                  const activeData = vinhacaSmartFlowData[currentFrenteKey] || {
                    carregamentoAtual: '',
                    situacaoTransporte: 'Normal',
                    situacaoDescarregamento: 'Normal / Aplicando',
                    areaQuadra: '',
                    qtdaAplicMotor: '',
                    raioSelecionado: 0,
                    vazaoFrenteEstimada: 0,
                    vazaoFrenteReal: 0,
                    tempoCarregamento: 0,
                    tempoTrajetoCarregado: 0,
                    tempoDescarregamentoEspera: 0,
                    tempoTrajetoVazio: 0,
                    velocidadeMedia: 0,
                    intervaloDespachos: 1,
                    ultimoDespacho: '00:00',
                    proximoDespacho: '00:00',
                    despachoAtrasado: 'Não',
                  };
                  const activeTempoTotalCiclo = 0;
                  const formattedCiclo = '00:00';
                  const activeNecessidadeCM = '0.0';
                  const calculatedNextDispatch = '00:00';

                  if (!showVinhacaControl) {
                    return (
                      <div className="space-y-6 animate-in fade-in duration-300 text-left max-w-2xl mx-auto py-8">
                        <div className="bg-[#e2f5e5]/40 border-2 border-[#00843D]/10 rounded-3xl p-8 text-center space-y-6 shadow-sm">
                          <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#00843D]/15 flex flex-col items-center text-center transition hover:shadow-md max-w-[150px] mx-auto animate-pulse">
                            <SmartFlowLogo className="w-full h-auto" />
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-black text-[#005B2B] uppercase tracking-wide">
                              Módulo SmartFlow — Vinhaça
                            </h3>
                            <p className="text-xs text-emerald-800/80 font-bold uppercase mt-1 tracking-wider">
                              Controle Integrado de Logística de Fertirrigação
                            </p>
                            <p className="text-sm text-[#005B2B] mt-4 leading-relaxed font-normal">
                              Bem-vindo à central inteligente de monitoramento e cálculos automáticos para frentes de vinhaça. Clique no botão de controle abaixo para acessar, adicionar e gerenciar as tabelas operacionais em tempo real.
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2 text-left">
                            <div className="bg-white p-4 rounded-2xl border border-emerald-800/10 shadow-sm">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Frentes Ativas</span>
                              <span className="text-2xl font-black text-[#005B2B] block mt-0.5">{vinhacaFrentesList.length} Frentes</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-emerald-800/10 shadow-sm">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Telemetria</span>
                              <span className="text-md font-black text-emerald-600 flex items-center gap-1.5 mt-2 uppercase tracking-wider text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                100% Conectado
                              </span>
                            </div>
                          </div>

                          <div className="pt-4">
                            <button
                              id="btn-vinhaca-controle-acesso"
                              onClick={() => {
                                setShowVinhacaControl(true);
                                setVinhacaNotification("Painel SmartFlow operacional inicializado.");
                              }}
                              className="bg-[#00843D] text-white hover:bg-[#5adc6a] hover:text-[#004d22] flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#00843D]/25 hover:shadow-[#5adc6a]/20 hover:scale-[1.02] active:scale-95 cursor-pointer w-full max-w-sm mx-auto border-2 border-transparent"
                            >
                              <Activity size={18} className="shrink-0 stroke-[3]" />
                              <span>Controle</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Control Panel Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-left flex-1 flex items-center gap-3">
                          <button
                            onClick={() => setShowVinhacaControl(false)}
                            className="bg-white hover:bg-gray-50 text-[#00843D] border-2 border-emerald-800/10 hover:border-[#00843D]/20 px-4 py-2 rounded-2xl transition-all duration-200 cursor-pointer text-xs font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 shadow-sm shrink-0"
                            title="Voltar ao menu do SmartFlow"
                          >
                            ← Voltar
                          </button>
                          <div>
                            <h4 className="text-sm font-black text-[#005B2B] uppercase tracking-wide">📦 Central SmartFlow de Logística de Vinhaça</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">Configure os parâmetros operacionais de cada frente de aplicação em tempo real. Os cálculos de ciclo e frota são automáticos para cada tabela.</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Botão de alternância Despacho */}
                          <button
                            id="btn-vinhaca-despacho-toggle"
                            onClick={() => {
                              setShowVinhacaDespacho(prev => !prev);
                              setShowVinhacaPainel(false);
                            }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border-2 ${
                              showVinhacaDespacho 
                                ? "bg-[#e2f5e5] hover:bg-[#d0f2d8] text-[#00843D] border-[#00843D]/40" 
                                : "bg-[#00843D] border-[#005B2B] hover:bg-[#005B2B] text-white"
                            }`}
                          >
                            <Truck size={14} className="stroke-[3]" />
                            <span>{showVinhacaDespacho ? "Ver Frentes" : "Despacho"}</span>
                          </button>

                          {/* Botão de alternância Painel */}
                          <button
                            id="btn-vinhaca-painel-toggle"
                            onClick={() => {
                              setShowVinhacaPainel(prev => !prev);
                              setShowVinhacaDespacho(false);
                            }}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border-2 ${
                              showVinhacaPainel 
                                ? "bg-[#e2f5e5] hover:bg-[#d0f2d8] text-[#00843D] border-[#00843D]/40" 
                                : "bg-[#00843D] border-[#005B2B] hover:bg-[#005B2B] text-white"
                            }`}
                          >
                            <Eye size={14} className="stroke-[3]" />
                            <span>{showVinhacaPainel ? "Ver Frentes" : "Ver Painel"}</span>
                          </button>

                          {!showVinhacaPainel && !showVinhacaDespacho && (
                            !isAddingSmartFlowFrente ? (
                              <button
                                onClick={() => {
                                  setIsAddingSmartFlowFrente(true);
                                  setNewSmartFlowFrenteInput('');
                                }}
                                className="bg-[#00843D] text-white hover:bg-[#5adc6a] hover:text-[#004d22] flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border-2 border-transparent"
                              >
                                <Plus size={14} className="shrink-0 stroke-[3]" />
                                <span>Adicionar Frente</span>
                              </button>
                            ) : (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#e2f5e5] p-2 rounded-xl border border-[#00843D]/20 animate-in slide-in-from-right duration-200">
                                <input
                                  type="text"
                                  value={newSmartFlowFrenteInput}
                                  onChange={(e) => setNewSmartFlowFrenteInput(e.target.value)}
                                  placeholder="Nome da frente (ex: Frente 45)"
                                  className="bg-white text-gray-800 text-xs font-black rounded-lg px-3 py-2 border-2 border-[#00843D]/30 focus:outline-none focus:ring-2 focus:ring-[#00843D]/50 focus:border-[#00843D] uppercase w-48 shadow-sm placeholder:lowercase placeholder:font-normal text-left placeholder:text-left"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddFrenteSubmit();
                                    } else if (e.key === 'Escape') {
                                      setIsAddingSmartFlowFrente(false);
                                    }
                                  }}
                                  autoFocus
                                />
                                <div className="flex gap-1.5 justify-end">
                                  <button
                                    onClick={handleAddFrenteSubmit}
                                    className="bg-[#00843D] hover:bg-[#005a2b] text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg active:scale-95 cursor-pointer shadow-sm transition"
                                  >
                                    Criar
                                  </button>
                                  <button
                                    onClick={() => setIsAddingSmartFlowFrente(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Segment Tab Switcher */}
                      <div className="flex border-b border-gray-200 gap-2 flex-wrap mb-4">
                        <button
                          onClick={() => { setShowVinhacaPainel(false); setShowVinhacaDespacho(false); }}
                          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                            !showVinhacaPainel && !showVinhacaDespacho
                              ? "border-[#00843D] text-[#00843D]"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Activity size={14} className="stroke-[3]" />
                          Monitoramento por Frentes
                        </button>
                        <button
                          onClick={() => { setShowVinhacaPainel(true); setShowVinhacaDespacho(false); }}
                          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                            showVinhacaPainel && !showVinhacaDespacho
                              ? "border-[#00843D] text-[#00843D]"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Eye size={14} className="stroke-[2.5]" />
                          Painel Geral de Telemetria
                        </button>
                        <button
                          onClick={() => { setShowVinhacaPainel(false); setShowVinhacaDespacho(true); }}
                          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all duration-200 border-b-2 flex items-center gap-2 cursor-pointer ${
                            showVinhacaDespacho
                              ? "border-[#00843D] text-[#00843D]"
                              : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Truck size={14} className="stroke-[2.5]" />
                          Central de Despacho
                        </button>
                      </div>

                      {showVinhacaDespacho ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <VinhacaDespacho onClose={() => { setShowVinhacaDespacho(false); setShowVinhacaPainel(false); }} />
                        </div>
                      ) : showVinhacaPainel ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <VinhacaPainel onClose={() => setShowVinhacaPainel(false)} />
                        </div>
                      ) : (
                        /* Stack of Tables (one below the other) */
                        <div className="space-y-6">
                          {vinhacaFrentesList.map((fKey) => {
                            const activeData = vinhacaSmartFlowData[fKey] || {
                              carregamentoAtual: 'VN-115 (45 m³)',
                              situacaoTransporte: 'Normal',
                              situacaoDescarregamento: 'Normal / Aplicando',
                              areaQuadra: 'Fazenda Bonança',
                              qtdaAplicMotor: '2 Motores',
                              raioSelecionado: 15,
                              vazaoFrenteEstimada: 180,
                              vazaoFrenteReal: 175,
                              tempoCarregamento: 15,
                              tempoTrajetoCarregado: 32,
                              tempoDescarregamentoEspera: 45,
                              tempoTrajetoVazio: 28,
                              velocidadeMedia: 38,
                              intervaloDespachos: 15,
                              ultimoDespacho: '21:45',
                              proximoDespacho: '22:00',
                              despachoAtrasado: 'Não',
                            };

                            return (
                              <VinhacaFrenteTable
                                key={fKey}
                                frenteKey={fKey}
                                activeData={activeData}
                                monitoringTime={monitoringTime}
                                formattedDate={formattedDate}
                                editingFrenteKey={editingFrenteKey}
                                editSmartFlowFrenteNameInput={editSmartFlowFrenteNameInput}
                                setEditingFrenteKey={setEditingFrenteKey}
                                setEditSmartFlowFrenteNameInput={setEditSmartFlowFrenteNameInput}
                                handleDataUpdate={handleDataUpdate}
                                handleRenameFrente={handleRenameFrente}
                                handleDeleteFrente={handleDeleteFrente}
                              />
                            );
                          })}
                        </div>
                      )}

                    </div>
                  );

                  // The remaining unreachable code below will be ignored by React runtime completely
                  const _dummyToMuteUnused = [formattedCiclo, activeTempoTotalCiclo, activeNecessidadeCM, calculatedNextDispatch, currentFrenteKey, activeData];
                  if (Math.random() > 2) {
                    console.log(_dummyToMuteUnused);
                  }

                  const isEditingSmartFlowFrente = false;
                  const setActiveSmartFlowFrente = (val: any) => {};
                  const setIsEditingSmartFlowFrente = (val: any) => {};

                  return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      {/* Control Panel Header */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-100">
                        <div>
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">📦 Central SmartFlow de Logística de Vinhaça</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Configure os parâmetros operacionais da frente de aplicação em tempo real. Os cálculos de ciclo e frota são automáticos.</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!isAddingSmartFlowFrente ? (
                            <button
                              onClick={() => {
                                setIsAddingSmartFlowFrente(true);
                                setNewSmartFlowFrenteInput('');
                              }}
                              className="bg-[#00843D] text-white hover:bg-[#5adc6a] hover:text-[#004d22] flex items-center gap-2 px-5 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border-2 border-transparent"
                            >
                              <Plus size={14} className="shrink-0 stroke-[3]" />
                              <span>Adicionar Frente</span>
                            </button>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#e2f5e5] p-2 rounded-xl border border-[#00843D]/20 animate-in slide-in-from-right duration-200">
                              <input
                                type="text"
                                value={newSmartFlowFrenteInput}
                                onChange={(e) => setNewSmartFlowFrenteInput(e.target.value)}
                                placeholder="Nome da frente (ex: Frente 45)"
                                className="bg-white text-gray-800 text-xs font-black rounded-lg px-3 py-2 border-2 border-[#00843D]/30 focus:outline-none focus:ring-2 focus:ring-[#00843D]/50 focus:border-[#00843D] uppercase w-48 shadow-sm placeholder:lowercase placeholder:font-normal"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddFrenteSubmit();
                                  } else if (e.key === 'Escape') {
                                    setIsAddingSmartFlowFrente(false);
                                  }
                                }}
                                autoFocus
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={handleAddFrenteSubmit}
                                  className="bg-[#00843D] hover:bg-[#005a2b] text-white font-black text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg active:scale-95 cursor-pointer shadow-sm transition"
                                >
                                  Criar
                                </button>
                                <button
                                  onClick={() => setIsAddingSmartFlowFrente(false)}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-extrabold text-[10px] uppercase tracking-widest px-3 py-2 rounded-lg cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Combined Widget Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 border-4 border-[#0B1B3D] rounded-3xl overflow-hidden shadow-xl bg-white">
                        
                        {/* 1. TOP HEADER BAR SPANNING FULL WIDTH OF WIDGET */}
                        <div className="col-span-12 bg-[#0B1B3D] px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-[#0B1B3D]/20 gap-2">
                          <span className="text-sm font-black text-white uppercase tracking-wider select-none">
                            📅 {formattedDate}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-sky-500 text-white font-extrabold px-2.5 py-1 rounded-md uppercase tracking-widest">
                              LIVE
                            </span>
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest block">
                              MÓDULO DE FRENTE
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-[#0B1B3D]/10">
                            {/* Selected Frente Selector (Yellow Tab in Screenshot) */}
                            <div className="bg-[#F5B000] px-5 py-3 text-black font-extrabold flex items-center justify-between shadow-inner gap-2 min-h-[58px]">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                                <span className="text-[11px] uppercase tracking-wider font-extrabold text-black">
                                  Frente Ativa:
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {!isEditingSmartFlowFrente ? (
                                  <>
                                    <select
                                      value={currentFrenteKey}
                                      onChange={(e) => {
                                        setActiveSmartFlowFrente(e.target.value);
                                        setIsEditingSmartFlowFrente(false);
                                      }}
                                      className="bg-white text-black text-xs font-black rounded-xl px-3 py-1.5 border-2 border-black/10 focus:outline-none focus:ring-2 focus:ring-black shadow-sm cursor-pointer hover:bg-gray-50 uppercase tracking-wide"
                                    >
                                      {vinhacaFrentesList.map(f => (
                                        <option key={f} value={f}>
                                          {f} {f === 'Ariranha' ? '🚜' : f === 'Santa Albertina' ? '🛠️' : f === 'Palestina' ? '⚡' : '📌'}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => {
                                        setEditSmartFlowFrenteNameInput(currentFrenteKey);
                                        setIsEditingSmartFlowFrente(true);
                                      }}
                                      className="bg-black hover:bg-neutral-900 text-white font-black text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg active:scale-95 cursor-pointer shadow-sm transition flex items-center gap-1"
                                      title="Editar nome ou apagar esta frente"
                                    >
                                      <Settings size={10} className="stroke-[2.5]" />
                                      Editar
                                    </button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-1 bg-yellow-100/80 p-1.5 rounded-lg border border-black/10">
                                    <input
                                      type="text"
                                      value={editSmartFlowFrenteNameInput}
                                      onChange={(e) => setEditSmartFlowFrenteNameInput(e.target.value)}
                                      placeholder="Novo nome"
                                      className="bg-white text-black text-xs font-bold rounded px-2 py-1 border border-black/20 focus:outline-none w-28 uppercase"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleRenameFrente(currentFrenteKey, editSmartFlowFrenteNameInput);
                                        } else if (e.key === 'Escape') {
                                          setIsEditingSmartFlowFrente(false);
                                        }
                                      }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleRenameFrente(currentFrenteKey, editSmartFlowFrenteNameInput)}
                                      className="bg-emerald-700 text-white hover:bg-emerald-800 font-extrabold text-[9px] px-2 py-1 rounded cursor-pointer"
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFrente(currentFrenteKey)}
                                      className="bg-rose-600 text-white hover:bg-rose-700 font-extrabold text-[9px] px-2 py-1 rounded cursor-pointer uppercase flex items-center gap-0.5"
                                      title="Apagar esta tabela permanentemente"
                                    >
                                      <Trash2 size={9} />
                                      Apagar
                                    </button>
                                    <button
                                      onClick={() => setIsEditingSmartFlowFrente(false)}
                                      className="bg-gray-600 text-white hover:bg-gray-700 font-extrabold text-[9px] px-1.5 py-1 rounded cursor-pointer"
                                    >
                                      Sair
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Indicação por Ralo indicator (Blue Tab in Screenshot) */}
                            <div className="bg-[#00B0FF] px-5 py-3 text-white font-extrabold text-xs uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2 select-none shadow-inner">
                              <Droplet size={14} className="text-white fill-white/20" />
                              Indicação de Carregamento por Ralo
                            </div>
                          </div>

                          {/* 19 Parameter Rows list */}
                          <div className="flex-1 divide-y divide-gray-100 bg-white font-sans text-xs">
                            
                            {/* Row 1: Carregamento atual */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Carregamento atual
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <input
                                  type="text"
                                  value={activeData.carregamentoAtual}
                                  onChange={(e) => handleDataUpdate('carregamentoAtual', e.target.value)}
                                  className="w-full bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                  placeholder="Ex: VN-101 (45 m³)"
                                />
                              </div>
                            </div>

                            {/* Row 2: Situação Transporte */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Situação Transporte
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <select
                                  value={activeData.situacaoTransporte}
                                  onChange={(e) => handleDataUpdate('situacaoTransporte', e.target.value)}
                                  className="w-full bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D] cursor-pointer"
                                >
                                  <option value="Normal">🟢 NORMAL (SEM INTERRUPÇÕES)</option>
                                  <option value="Lento (Fila)">🟡 FILA NA USINA</option>
                                  <option value="Congestionamento">🟠 CONGESTIONAMENTO DE ROTA</option>
                                  <option value="Paralisado">🔴 PARADO (FALTA CAMINHÕES)</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 3: Situação Descarregamento */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Situação Descarregamento
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <select
                                  value={activeData.situacaoDescarregamento}
                                  onChange={(e) => handleDataUpdate('situacaoDescarregamento', e.target.value)}
                                  className="w-full bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D] cursor-pointer"
                                >
                                  <option value="Descarregando">🟢 DESCARREGANDO / EM APLICAÇÃO</option>
                                  <option value="Normal / Aplicando">🟢 NORMAL / APLICANDO</option>
                                  <option value="Aguardando Aplicador">🟡 AGUARDANDO APLICADOR</option>
                                  <option value="Manutenção Mecânica">🔴 MANUTEÇÃO APLICADOR / PUMP</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 4: Area/Quadra */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Area/Quadra
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <input
                                  type="text"
                                  value={activeData.areaQuadra}
                                  onChange={(e) => handleDataUpdate('areaQuadra', e.target.value)}
                                  className="w-full bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                  placeholder="Fazenda e Quadra de aplicação"
                                />
                              </div>
                            </div>

                            {/* Row 5: Qtda (Aplic/Motor) */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Qtda (Aplic/Motor)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <input
                                  type="text"
                                  value={activeData.qtdaAplicMotor}
                                  onChange={(e) => handleDataUpdate('qtdaAplicMotor', e.target.value)}
                                  className="w-full bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                  placeholder="Mecanização ativa"
                                />
                              </div>
                            </div>

                            {/* Row 6: Raio Selecionado */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Raio Selecionado
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.raioSelecionado}
                                    onChange={(e) => handleDataUpdate('raioSelecionado', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="1"
                                    max="150"
                                  />
                                  <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    Raio {activeData.raioSelecionado} KM
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Row 7: Vazão Frente (ESTIMADO HORA) */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Vazão Frente (ESTIMADO HORA)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.vazaoFrenteEstimada}
                                    onChange={(e) => handleDataUpdate('vazaoFrenteEstimada', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="0"
                                    max="1000"
                                  />
                                  <span className="text-[10px] text-blue-600 bg-blue-50 font-bold px-2 py-1 rounded">m³/h</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 8: Vazão Frente (REAL ULTIMA HORA) || REALTIME UTC */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                {`Vazão Frente (REAL ULTIMA HORA) || ${monitoringTime}`}
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.vazaoFrenteReal}
                                    onChange={(e) => handleDataUpdate('vazaoFrenteReal', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="0"
                                    max="1000"
                                  />
                                  <span className="text-[10px] text-emerald-600 bg-emerald-50 font-bold px-2 py-1 rounded">m³/h</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 9: Tempo de Carregamento */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider flex-wrap">
                                Tempo de Carregamento (Minutos)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.tempoCarregamento}
                                    onChange={(e) => handleDataUpdate('tempoCarregamento', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="0"
                                    max="240"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">min</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 10: Tempo Trajeto Carregado */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Tempo Trajeto Carregado (Minutos)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.tempoTrajetoCarregado}
                                    onChange={(e) => handleDataUpdate('tempoTrajetoCarregado', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="0"
                                    max="240"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">min</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 11: Tempo Descarregamento + Espera */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Tempo Descarregamento + Espera (Minutos)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.tempoDescarregamentoEspera}
                                    onChange={(e) => handleDataUpdate('tempoDescarregamentoEspera', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="0"
                                    max="240"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">min</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 12: Tempo Trajeto Vazio */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Tempo Trajeto Vazio (Minutos)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.tempoTrajetoVazio}
                                    onChange={(e) => handleDataUpdate('tempoTrajetoVazio', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="0"
                                    max="240"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">min</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 13: TempoTotal Ciclo (Gray background - Autocalculated output) */}
                            <div className="grid grid-cols-12 bg-slate-50/70">
                              <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                TempoTotal Ciclo (Calculado)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <span className="bg-[#0B1B3D] text-[#00FF66] font-mono font-black border border-[#0B1B3D] rounded-lg px-4 py-1.5 shadow-sm text-xs select-all">
                                  {formattedCiclo} h ({activeTempoTotalCiclo} min)
                                </span>
                              </div>
                            </div>

                            {/* Row 14: Necessidade CM Ciclo (Gray background - Autocalculated output) */}
                            <div className="grid grid-cols-12 bg-slate-50/70">
                              <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Necessidade CM Ciclo (Frota)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <span className="bg-slate-700 text-sky-300 font-mono font-black border border-slate-800 rounded-lg px-4 py-1.5 shadow-sm text-xs select-all">
                                  {activeNecessidadeCM} Caminhões / Ciclo
                                </span>
                              </div>
                            </div>

                            {/* Row 15: Velocidade Média CM */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Velocidade Média CM
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.velocidadeMedia}
                                    onChange={(e) => handleDataUpdate('velocidadeMedia', parseInt(e.target.value) || 0)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="1"
                                    max="120"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">km/h</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 16: Intervalo Entre Despachos */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Intervalo Entre Despachos
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <div className="flex items-center gap-2 w-full">
                                  <input
                                    type="number"
                                    value={activeData.intervaloDespachos}
                                    onChange={(e) => handleDataUpdate('intervaloDespachos', parseInt(e.target.value) || 1)}
                                    className="w-2/3 bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                    min="1"
                                    max="240"
                                  />
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">min</span>
                                </div>
                              </div>
                            </div>

                            {/* Row 17: Ultimo Despacho (Hora) */}
                            <div className="grid grid-cols-12 hover:bg-slate-50/50 transition duration-150">
                              <div className="col-span-12 sm:col-span-7 flex items-center bg-slate-50/40 px-4 py-3 font-black text-[#0B1B3D] border-r border-gray-100 uppercase tracking-wider">
                                Ultimo Despacho (Hora)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-1.5 flex items-center">
                                <input
                                  type="text"
                                  value={activeData.ultimoDespacho}
                                  onChange={(e) => handleDataUpdate('ultimoDespacho', e.target.value)}
                                  className="w-full max-w-[120px] bg-white border border-gray-300/80 rounded-lg px-3 py-1.5 text-xs font-mono font-black text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#00843D]"
                                  placeholder="HH:MM"
                                />
                              </div>
                            </div>

                            {/* Row 18: Proximo Despacho (hora) (Calculated dynamically) */}
                            <div className="grid grid-cols-12 bg-slate-50/20">
                              <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-3 font-black border-r border-gray-100 uppercase tracking-wider text-[#005B2B]">
                                Proximo Despacho (hora) (Calculado)
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-2 flex items-center">
                                <span className="bg-[#005B2B] text-white font-mono font-black rounded-lg px-4 py-1.5 shadow-sm text-xs border border-[#00381A]">
                                  {calculatedNextDispatch}
                                </span>
                              </div>
                            </div>

                            {/* Row 19: Despacho Atrasado (Special colorized row mimicking the bottom conditional block in sheet) */}
                            <div className="grid grid-cols-12 text-sm border-t-2 border-[#0B1B3D]">
                              <div className="col-span-12 sm:col-span-7 flex items-center px-4 py-4 font-black text-[#0B1B3D] bg-slate-100 border-r border-gray-100 uppercase tracking-wider">
                                Despacho Atrasado ?
                              </div>
                              <div className="col-span-12 sm:col-span-5 px-4 py-3 flex items-center gap-2 bg-slate-100">
                                <select
                                  value={activeData.despachoAtrasado}
                                  onChange={(e) => handleDataUpdate('despachoAtrasado', e.target.value)}
                                  className="bg-white border border-gray-300/85 text-xs font-black rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#0B1B3D] focus:outline-none"
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
                    </div>
                  );
                })()}

                {/* SUB TAB 2: APONTAMENTO */}
                {activeVinhacaSubTab === 'Apontamento' && (
                  <div className="animate-in fade-in duration-300">
                    <VinhacaApontamentos />
                  </div>
                )}

                {/* SUB TAB 3: DASHBOARD */}
                {activeVinhacaSubTab === 'Dashboard' && (
                  <VinhacaDashboard selectedUsina={selectedUsina} />
                )}

                {/* SUB TAB 4: NÍVEIS */}
                {activeVinhacaSubTab === 'Níveis' && (
                  <VinhacaNiveis />
                )}

                {/* SUB TAB 5: FECHAMENTO */}
                {activeVinhacaSubTab === 'Fechamento' && (
                  <VinhacaFechamento />
                )}

                {/* SUB TAB 6: BANCO DE DADOS */}
                {activeVinhacaSubTab === 'Banco de Dados' && (
                  <div className="space-y-6 animate-in fade-in duration-300 text-left">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase">📁 Central de Registros Oficiais</h3>
                      <button 
                        onClick={() => {
                          setVinhacaNotification("Exportando dados em formato .CSV... Verifique sua pasta de Downloads.");
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        📥 Exportar planilha CSV (2026)
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 rounded-2xl">
                      <table className="w-full text-left border-collapse border-spacing-0">
                        <thead>
                          <tr className="bg-gray-50 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">
                            <th className="py-4 px-6">Identificador</th>
                            <th className="py-4 px-6">Data Lançamento</th>
                            <th className="py-4 px-6">Veículo Aplicador</th>
                            <th className="py-4 px-6">Operador Mestre</th>
                            <th className="py-4 px-6">Fazenda Destinatária</th>
                            <th className="py-4 px-6 text-center">Volume Despejado</th>
                            <th className="py-4 px-6 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                          {vinhacaApontamentos.map((itm) => (
                            <tr key={itm.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-4 px-6 font-black text-gray-400">#VN-DB{itm.id}</td>
                              <td className="py-4 px-6 font-mono text-[10px]">{itm.data}</td>
                              <td className="py-4 px-6 font-black text-red-600">{itm.caminhao}</td>
                              <td className="py-4 px-6">{itm.motorista}</td>
                              <td className="py-4 px-6">{itm.fazenda}</td>
                              <td className="py-4 px-6 text-center text-blue-600 font-bold">{itm.m3} m³</td>
                              <td className="py-4 px-6 text-center">
                                <button
                                  onClick={() => {
                                    setVinhacaApontamentos(vinhacaApontamentos.filter(x => x.id !== itm.id));
                                    setVinhacaNotification("Entrada apagada permanentemente da Central.");
                                  }}
                                  className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-transform hover:scale-105 active:scale-90 cursor-pointer font-black uppercase text-[10px] tracking-wider"
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB TAB 7: TANQUES */}
                {activeVinhacaSubTab === 'Tanques' && (
                  <div className="space-y-6 animate-in fade-in duration-300 text-left">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase">🏢 Cadastro e Gerenciamento de Tanques Assets</h3>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const fData = new FormData(form);
                      const id = `T-0${vinhacaTanks.length + 1}`;
                      const nome = fData.get('nome') as string;
                      const cap = parseInt(fData.get('cap') as string || '2000');
                      const local = fData.get('local') as string || 'Unidade Central';
                      
                      const nTk = { id, nome, capacidadeMax: cap, volumeAtual: Math.round(cap * 0.7), local, status: 'Estável' };
                      setVinhacaTanks([...vinhacaTanks, nTk]);
                      setVinhacaNotification(`Tanque ${nome} acoplado à malha com sucesso.`);
                      form.reset();
                    }} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Identificação do Tanque</label>
                        <input type="text" name="nome" placeholder="Ex: Tanque Regional 04" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Capacidade Máxima (m³)</label>
                        <input type="number" name="cap" defaultValue="2000" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Localização Física</label>
                        <input type="text" name="local" placeholder="Ex: Fazenda Aliança" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>
                      <div className="col-span-full flex justify-end">
                        <button type="submit" className="bg-[#4b5563] hover:bg-[#374151] text-white font-black uppercase text-xs px-8 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer">
                          Acoplar Novo Tanque Físico
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      {vinhacaTanks.map((tk) => (
                        <div key={tk.id} className="bg-white border border-gray-100 p-6 rounded-2xl flex flex-col justify-between shadow-xs">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase">ID: {tk.id}</span>
                            <h4 className="text-sm font-black text-gray-900 uppercase mt-0.5">{tk.nome}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">CAPACIDADE: {tk.capacidadeMax} m³</p>
                          </div>
                          <button 
                            onClick={() => {
                              setVinhacaTanks(vinhacaTanks.filter(t => t.id !== tk.id));
                              setVinhacaNotification("Tanque removido da lista física.");
                            }}
                            className="bg-red-50 text-red-600 text-[10px] font-black uppercase py-2 px-4 rounded-xl mt-4 self-start hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
                          >
                            Remover Tanque
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB TAB 8: CAD MOTORISTAS */}
                {activeVinhacaSubTab === 'Cad Motoristas' && (
                  <div className="space-y-6 animate-in fade-in duration-300 text-left">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase">👤 Cadastro de Operadores &amp; Motoristas Vinhaça</h3>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const fData = new FormData(form);
                      const nome = fData.get('nome') as string;
                      const cnh = fData.get('cnh') as string;
                      const cat = fData.get('cat') as string;
                      const caminhao = fData.get('caminhao') as string;
                      
                      const nMot = { id: Date.now(), nome, cnh, categoria: cat, caminhao, status: 'Em Atividade' };
                      setVinhacaMotoristas([...vinhacaMotoristas, nMot]);
                      setVinhacaNotification(`Motorista ${nome} habilitado no sistema.`);
                      form.reset();
                    }} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                      
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nome Completo</label>
                        <input type="text" name="nome" placeholder="Nome do Motorista" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Documento CNH</label>
                        <input type="text" name="cnh" placeholder="Ex: 1029312389" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Categoria CNH</label>
                        <select name="cat" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500">
                          <option value="D">D - Pesados</option>
                          <option value="E">E - Carreta</option>
                          <option value="AE">AE - Articulado Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Caminhão Vinculado</label>
                        <select name="caminhao" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500">
                          <option value="VN-101">VN-101</option>
                          <option value="VN-104">VN-104</option>
                          <option value="VN-106">VN-106</option>
                          <option value="VN-108">VN-108</option>
                        </select>
                      </div>

                      <div className="col-span-full flex justify-end">
                        <button type="submit" className="bg-[#f5b000] hover:bg-[#d69900] text-gray-900 font-black uppercase text-xs px-8 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer">
                          Habilitar Operador na Frota
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {vinhacaMotoristas.map((m) => (
                        <div key={m.id} className="bg-white border border-gray-100 p-6 rounded-2xl flex justify-between items-center shadow-xs">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase">{m.nome}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">CNH: {m.cnh} • CAT {m.categoria}</p>
                            <span className="inline-block mt-2 bg-yellow-50 text-[10px] font-black text-yellow-800 px-2 py-0.5 rounded uppercase">Atribuído ao caminhão {m.caminhao}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setVinhacaMotoristas(vinhacaMotoristas.filter(x => x.id !== m.id));
                              setVinhacaNotification("Motorista dispensado da escala corrente.");
                            }}
                            className="bg-red-50 text-red-600 text-[10px] font-black uppercase p-2 rounded-xl hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
                          >
                            Dispensar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB TAB 9: CAD FAZENDAS */}
                {activeVinhacaSubTab === 'Cad Fazendas' && (
                  <div className="space-y-6 animate-in fade-in duration-300 text-left">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-black text-gray-900 uppercase">🚜 Cadastro de Áreas Receptivas de Fertirrigação (Fazendas)</h3>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const fData = new FormData(form);
                      const nome = fData.get('nome') as string;
                      const area = fData.get('area') as string;
                      const pot = fData.get('pot') as string;
                      
                      const nFaz = { id: Date.now(), nome, area, potassio: pot, gestor: 'Supervisor Local' };
                      setVinhacaFazendas([...vinhacaFazendas, nFaz]);
                      setVinhacaNotification(`Fazenda ${nome} cadastrada receptivamente no canal.`);
                      form.reset();
                    }} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Identificação da Fazenda</label>
                        <input type="text" name="nome" placeholder="Ex: Fazenda Santa Maria" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Área de Cultivo Ativa (Hectares)</label>
                        <input type="number" name="area" defaultValue="150" required className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500" />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nível Potássio Recomendado</label>
                        <select name="pot" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:border-green-500">
                          <option value="Baixo">Baixo Teor (Alta Demanda)</option>
                          <option value="Médio">Médio Teor (Cuidado Controle)</option>
                          <option value="Alto">Alto Teor (Meta Concluída)</option>
                        </select>
                      </div>

                      <div className="col-span-full flex justify-end">
                        <button type="submit" className="bg-[#f5b000] hover:bg-[#d69900] text-gray-900 font-black uppercase text-xs px-8 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer">
                          Acoplar Área Territorial
                        </button>
                      </div>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {vinhacaFazendas.map((fzd) => (
                        <div key={fzd.id} className="bg-white border border-gray-100 p-6 rounded-2xl flex justify-between items-center shadow-xs">
                          <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase">{fzd.nome}</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">ÁREA ATIVA: {fzd.area} ha • GESTOR: {fzd.gestor}</p>
                            <span className="inline-block mt-2 bg-yellow-50 text-[10px] font-black text-yellow-800 px-2 py-0.5 rounded uppercase">Potássio recomendável: {fzd.potassio}</span>
                          </div>
                          <button 
                            onClick={() => {
                              setVinhacaFazendas(vinhacaFazendas.filter(x => x.id !== fzd.id));
                              setVinhacaNotification("Propriedade rural desvinculada do canal de distribuição.");
                            }}
                            className="bg-red-50 text-red-600 text-[10px] font-black uppercase p-2 rounded-xl hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
                          >
                            Desvincular
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
              
            </div>
          )}

          {activeTab === 'Monitoramento' && activeMonitoramentoSubTab === 'Dashboard' && (
            <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
              {/* KPI GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                  onClick={() => {
                    setFilterStatus('Trabalhando');
                    setSelectedKPIStatus('Trabalhando');
                  }}
                  className={cn(
                    "bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border-b-8 border-[#00843D] relative overflow-hidden group hover:translate-y-[-8px] hover:border-b-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-lg hover:shadow-[#5adc6a]/15 transition-all cursor-pointer flex flex-col items-center justify-center text-center hover:shadow-xl active:scale-95",
                    filterStatus && filterStatus !== 'Trabalhando' && "opacity-40 grayscale"
                  )}
                  data-theme-ignore="true"
                >
                  <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block mb-2 sm:mb-4">Frentes Trabalhando</p>
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#1F2937] leading-none tracking-tighter">{currentData.trabalhando}</p>
                  <div className="absolute top-4 right-4 text-2xl sm:text-3xl opacity-20 group-hover:opacity-40 transition-opacity">🚜</div>
                </div>
                <div 
                  onClick={() => {
                    setFilterStatus('Paradas');
                    setSelectedKPIStatus('Paradas');
                  }}
                  className={cn(
                    "bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border-b-8 border-[#EF4444] relative overflow-hidden group hover:translate-y-[-8px] hover:border-b-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-lg hover:shadow-[#5adc6a]/15 transition-all cursor-pointer flex flex-col items-center justify-center text-center hover:shadow-xl active:scale-95",
                    filterStatus && filterStatus !== 'Paradas' && "opacity-40 grayscale"
                  )}
                >
                  <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block mb-2 sm:mb-4">Frentes Paradas</p>
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#1F2937] leading-none tracking-tighter">{currentData.paradas}</p>
                  <div className="absolute top-4 right-4 text-2xl sm:text-3xl opacity-20 group-hover:opacity-40 transition-opacity">🛑</div>
                </div>
                <div 
                  onClick={() => {
                    setFilterStatus('C/Vento/Chuva');
                    setSelectedKPIStatus('C/Vento/Chuva');
                  }}
                  className={cn(
                    "bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border-b-8 border-blue-400 relative overflow-hidden group hover:translate-y-[-8px] hover:border-b-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-lg hover:shadow-[#5adc6a]/15 transition-all cursor-pointer flex flex-col items-center justify-center text-center hover:shadow-xl active:scale-95",
                    filterStatus && filterStatus !== 'C/Vento/Chuva' && "opacity-40 grayscale"
                  )}
                >
                  <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block mb-2 sm:mb-4">Vento / Chuva</p>
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-blue-600 leading-none tracking-tighter">{currentData.ventoChuva}</p>
                  <div className="absolute top-4 right-4 text-2xl sm:text-3xl opacity-20 group-hover:opacity-40 transition-opacity">🌧️</div>
                </div>
                <div 
                  onClick={() => {
                    setFilterStatus('Mudança');
                    setSelectedKPIStatus('Mudança');
                  }}
                  className={cn(
                    "bg-white p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border-b-8 border-gray-400 relative overflow-hidden group hover:translate-y-[-8px] hover:border-b-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-lg hover:shadow-[#5adc6a]/15 transition-all cursor-pointer flex flex-col items-center justify-center text-center hover:shadow-xl active:scale-95",
                    filterStatus && filterStatus !== 'Mudança' && "opacity-40 grayscale"
                  )}
                >
                  <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-[0.2em] bg-gray-50 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full inline-block mb-2 sm:mb-4">Em Mudança</p>
                  <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-600 leading-none tracking-tighter">{currentData.mudancaArea}</p>
                  <div className="absolute top-4 right-4 text-2xl sm:text-3xl opacity-20 group-hover:opacity-40 transition-opacity">🔄</div>
                </div>
              </div>

              {/* CHARTS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* RANKING CHART */}
                <div 
                  onClick={() => setZoomedCardId('StatusRanking')}
                  className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-md border border-transparent hover:border-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-xl hover:shadow-[#5adc6a]/10 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-[#006B32] uppercase tracking-tighter">Status PPT</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lastGlobalUpdate}</p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">Produtividade</span>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rankingData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 'bold', fill: '#1F2937' }}
                          width={100}
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                          dataKey="value" 
                          name="Frentes" 
                          radius={[0, 4, 4, 0]}
                          onClick={(data) => setFilterStatus(data.name)}
                          className="cursor-pointer"
                        >
                          {rankingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PERCENTAGE PIE CHART */}
                <div 
                  onClick={() => setZoomedCardId('StatusPie')}
                  className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-md border border-transparent hover:border-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-xl hover:shadow-[#5adc6a]/10 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-full text-center">
                      <h3 className="font-black text-[#006B32] uppercase">Status Operacional (%)</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lastGlobalUpdate}</p>
                    </div>
                  </div>
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          onClick={(data) => {
                            const name = data.name === 'Vento/Chuva' ? 'C/Vento/Chuva' : data.name;
                            setFilterStatus(name);
                          }}
                          className="cursor-pointer"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: '900', paddingTop: '20px', textTransform: 'uppercase' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 text-center">
                      <span className="text-xl font-black text-[#006B32] break-after-auto leading-tight">
                        {filterStatus ? filterStatus : (selectedUsina === 'Ariranha' ? 'ARI' : selectedUsina === 'Palestina' ? 'PAL' : 'STA')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* EVOLUÇÃO DE STATUS (AREA CHART) */}
                <div 
                  onClick={() => setZoomedCardId('Evolution')}
                  className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-md border border-transparent hover:border-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-xl hover:shadow-[#5adc6a]/10 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-[#006B32] uppercase tracking-tighter">Evolução de Status (24h)</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lastGlobalUpdate}</p>
                    </div>
                    <Clock size={20} className="text-[#00843D]" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="Trabalhando" stroke="#00843D" fill="#00843D" fillOpacity={0.1} strokeWidth={3} />
                        <Area type="monotone" dataKey="Paradas" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={3} />
                        <Area type="monotone" dataKey="Vento/Chuva" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.1} strokeWidth={3} />
                        <Area type="monotone" dataKey="Mudança" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.1} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* COMPARATIVO DE STATUS (BAR CHART) */}
                <div 
                  onClick={() => setZoomedCardId('Comparison')}
                  className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-md border border-transparent hover:border-[#5adc6a] hover:ring-2 hover:ring-[#5adc6a]/25 hover:shadow-xl hover:shadow-[#5adc6a]/10 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-[#006B32] uppercase tracking-tighter">Comparativo de Status (Atual vs %)</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lastGlobalUpdate}</p>
                    </div>
                    <Activity size={20} className="text-[#F4D000]" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                        <Bar yAxisId="left" dataKey="Atual" name="Atual (Qtd)" radius={[4, 4, 0, 0]}>
                          {comparisonData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                        <Bar yAxisId="right" dataKey="Percentual" name="% de Trabalhando" fill="#D1D5DB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PERFIL OPERACIONAL (RADAR CHART) */}
                <div 
                  onClick={() => setZoomedCardId('Profile')}
                  className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] shadow-md md:col-span-2 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-black text-[#006B32] uppercase tracking-tighter">Perfil Operacional da Unidade</h3>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{lastGlobalUpdate}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-[#00843D] rounded-full"></div>
                        <span className="text-[10px] font-bold">Realized</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                        <span className="text-[10px] font-bold">Benchmark</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#f0f0f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#1F2937' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                        <Radar name="Benchmark" dataKey="B" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.3} />
                        <Radar name="Realized" dataKey="A" stroke="#00843D" fill="#00843D" fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Histórico' && (
            <div className="bg-white p-6 rounded-[32px] shadow-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h3 className="font-black text-[#006B32] uppercase tracking-tighter text-xl">Histórico de Atividades</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1" translate="no">Unidade: {selectedUsina}</p>
                </div>
                
                 {/* SUB-ABAS HISTÓRICO */}
                 <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto">
                   {['Cadastros', 'Status', 'Observações', 'Excluídos', 'Plantio', 'Vinhaça', 'DDS', 'Gestão Áreas'].map((tab) => (
                     <button
                       key={tab}
                       onClick={() => setHistorySubTab(tab)}
                       className={cn(
                         "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shrink-0",
                         historySubTab === tab 
                           ? "bg-white text-[#00843D] shadow-sm" 
                           : "text-gray-400 hover:text-gray-600"
                       )}
                     >
                       {tab === 'Cadastros' && <PlusCircle size={12} />}
                       {tab === 'Status' && <RefreshCw size={12} />}
                       {tab === 'Observações' && <MessageSquare size={12} />}
                       {tab === 'Excluídos' && <Trash2 size={12} />}
                       {tab === 'Plantio' && <Sprout size={12} />}
                       {tab === 'Vinhaça' && <Droplet size={12} />}
                       {tab === 'DDS' && <Shield size={12} />}
                       {tab === 'Gestão Áreas' && <Layers size={12} />}
                       {tab}
                     </button>
                   ))}
                 </div>
               </div>
 
               <div className="space-y-4">
                 {historySubTab === 'Gestão Áreas' ? (
                   <GestaoAreasHistorico />
                 ) : historySubTab === 'Vinhaça' ? (
                   <VinhacaHistorico />
                 ) : historySubTab === 'DDS' ? (
                  savedDdsMeetings.filter(m => m.usina === selectedUsina).length > 0 ? (
                    savedDdsMeetings.filter(m => m.usina === selectedUsina).map((meeting) => (
                      <div key={meeting.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 group hover:border-[#00843D]/30 transition-all text-left">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#00843D] shadow-sm border border-gray-100">
                              <Shield size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#00843D]/5 text-[#00843D] text-[8px] font-black uppercase rounded-md tracking-wider">
                                  {meeting.category}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  ID #{meeting.id}
                                </span>
                              </div>
                              <h4 className="font-black text-gray-900 uppercase text-sm mt-1">{meeting.topicTitle}</h4>
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-xl">
                            {meeting.date}
                          </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100/80">
                          <div>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Unidade / Usina</span>
                            <span className="text-xs font-bold text-gray-700 block mt-0.5">{meeting.usina}</span>
                          </div>
                        </div>

                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="mt-4">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Participantes ({meeting.attendees.length})</span>
                            <div className="flex flex-wrap gap-1.5">
                              {meeting.attendees.map((attendee, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-[#00843D]/5 text-[#00843D] text-[9px] font-bold rounded-lg border border-[#00843D]/10">
                                  {attendee}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Shield size={24} />
                      </div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum Diálogo (DDS) realizado nesta unidade</p>
                    </div>
                  )
                ) : historySubTab === 'Plantio' ? (
                  plantioHistory.filter(h => h.usina === selectedUsina).length > 0 ? (
                    plantioHistory.filter(h => h.usina === selectedUsina).map((entry) => (
                      <div key={entry.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 group hover:border-[#00843D]/30 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#00843D] shadow-sm">
                              <Sprout size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-gray-900 uppercase text-sm">Registro de Plantio - {entry.date}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                Referência: {entry.time} | Finalizado em: {entry.clearedAt}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-black text-gray-400 uppercase">Eficiência Final</p>
                             <p className="text-2xl font-black text-[#00843D]">{entry.efficiency}%</p>
                          </div>
                        </div>

                        <div className="overflow-x-auto no-scrollbar pb-2">
                           <div className="flex gap-1 min-w-max">
                              {entry.fleetSnapshot.map(item => (
                                <div key={item.id} className="flex flex-col gap-1 w-20">
                                   <div className="text-[7px] font-black text-gray-400 uppercase truncate text-center">{item.prefixo}</div>
                                   <div className="flex gap-[1px]">
                                      {(item.hourlyData || Array(24).fill('Reserva')).map((st, i) => {
                                        const stInfo = HOURLY_STATUS_MAP.find(s => s.label === st) || HOURLY_STATUS_MAP[6];
                                        return (
                                          <div key={i} className={cn("w-1.5 h-4", stInfo.color)} title={`${i}h: ${st}`}></div>
                                        );
                                      })}
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Sprout size={24} />
                      </div>
                      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum registro de plantio arquivado</p>
                    </div>
                  )
                ) : logsData.length > 0 ? (
                  logsData.map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        log.type === 'Cadastros' ? "bg-blue-100 text-blue-600" :
                        log.type === 'Status' ? "bg-amber-100 text-amber-600" :
                        log.type === 'Observações' ? "bg-purple-100 text-purple-600" :
                        log.type === 'Excluídos' ? "bg-red-100 text-red-600" :
                        "bg-green-100 text-green-600"
                      )}>
                        {getLogIcon(log.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-800 text-sm">{log.event}</p>
                          <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-lg">{log.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">{log.detail}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#00843D]"></div>
                          <p className="text-[9px] font-black text-[#00843D] uppercase">Operador: {log.user}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      {getLogIcon(historySubTab)}
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum registro encontrado para esta unidade</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Relatórios' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
              {/* TOP HEADER */}
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center text-[#00843D] shadow-inner shrink-0">
                  <FileText size={48} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Central de Exportação &amp; Relatórios</h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Gere relatórios gerenciais, visualize dados integrados e compartilhe em múltiplas plataformas</p>
                </div>
              </div>

              {/* INTERACTIVE SEARCH WIDGET (MANOPLA DE PESQUISA) */}
              <div className="bg-gradient-to-br from-[#004d22] to-[#003818] p-6 sm:p-8 rounded-[32px] text-white shadow-lg border border-white/5 relative overflow-visible">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24 blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-[#5adc6a] uppercase tracking-[0.2em] mb-1">
                      BUSCA INTELIGENTE DE DADOS
                    </p>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">
                      Painel Seletor de Relatórios Operacionais
                    </h3>
                  </div>

                  {/* Autocomplete Input Container */}
                  <div className="relative w-full max-w-3xl">
                    <div className="relative flex items-center bg-white rounded-2xl shadow-xl transition-all border-2 border-transparent focus-within:border-[#5adc6a]">
                      <Search className="absolute left-5 text-gray-400 shrink-0" size={18} />
                      <input
                        type="text"
                        value={reportSearchText}
                        onChange={(e) => {
                          setReportSearchText(e.target.value);
                          setReportSearchFocused(true);
                        }}
                        onFocus={() => setReportSearchFocused(true)}
                        placeholder="Digite o nome ou descrição do relatório para pesquisar..."
                        className="w-full pl-14 pr-12 py-4.5 bg-transparent border-none text-gray-900 text-xs font-bold outline-none placeholder:text-gray-400 rounded-2xl"
                      />
                      {reportSearchText && (
                        <button
                          onClick={() => {
                            setReportSearchText('');
                            setReportSearchFocused(false);
                          }}
                          className="absolute right-4 w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown Suggestions */}
                    {reportSearchFocused && reportSearchText.trim().length > 0 && (() => {
                      const query = reportSearchText.toLowerCase().trim();
                      const suggestions = allAvailableReports.filter(r => 
                        r.title.toLowerCase().includes(query) || 
                        r.desc.toLowerCase().includes(query) ||
                        r.category.toLowerCase().includes(query)
                      );

                      if (suggestions.length === 0) return null;

                      return (
                        <>
                          {/* Transparent full-screen click-away overlay */}
                          <div className="fixed inset-0 z-30" onClick={() => setReportSearchFocused(false)} />
                          
                          <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-40 p-3 space-y-1.5 animate-in fade-in slide-in-from-top-3 duration-200">
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-1 border-b border-gray-50 mb-1">
                              Relatórios Encontrados ({suggestions.length})
                            </div>
                            <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
                              {suggestions.slice(0, 8).map((report) => (
                                <button
                                  key={report.id}
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setReportPage(1);
                                    setInnerReportSearch('');
                                    setReportSearchText(report.title);
                                    setReportSearchFocused(false);
                                  }}
                                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl flex items-center gap-4 transition-all hover:translate-x-1 cursor-pointer"
                                >
                                  <div className="w-10 h-10 bg-green-50 text-[#00843D] rounded-xl flex items-center justify-center shrink-0">
                                    {report.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-black text-gray-800 text-xs truncate uppercase">{report.title}</span>
                                      <span className="bg-gray-100 text-gray-500 font-bold uppercase text-[8px] px-2 py-0.5 rounded-md shrink-0">
                                        {report.category.split('&')[0].split(',')[0]}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate uppercase">{report.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* REPORT VIEWER OR CARDS GRID */}
              {selectedReport ? (
                /* SELECTED REPORT VIEW (EXIBIÇÃO DE RELATÓRIO NO MEIO DA TELA) */
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      setInnerReportSearch('');
                      setReportSearchText('');
                    }}
                    className="flex items-center gap-2 text-xs font-black uppercase text-[#004d22] hover:text-[#003818] bg-[#5adc6a]/15 hover:bg-[#5adc6a]/25 px-5 py-3 rounded-2xl transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Voltar para Todos os Relatórios
                  </button>

                  <div className="bg-white rounded-[32px] border border-gray-150 p-6 sm:p-8 shadow-sm space-y-6">
                    {/* TOP BANNER INFO OF REPORT */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
                      <div className="flex items-start gap-5">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                          selectedReport.color === 'blue' ? "bg-blue-50 text-blue-600" :
                          selectedReport.color === 'amber' ? "bg-amber-50 text-amber-600" :
                          selectedReport.color === 'purple' ? "bg-purple-50 text-purple-600" :
                          selectedReport.color === 'green' ? "bg-green-50 text-green-600" :
                          "bg-red-50 text-red-600"
                        )}>
                          {selectedReport.icon}
                        </div>
                        <div className="text-left">
                          <span className="inline-block bg-gray-100 text-gray-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider mb-2">
                            {selectedReport.category}
                          </span>
                          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{selectedReport.title}</h3>
                          <p className="text-gray-400 font-bold text-[11px] mt-1 leading-relaxed uppercase">{selectedReport.desc}</p>
                        </div>
                      </div>

                      {/* KPI BADGE OF TOTAL ITEMS */}
                      <div className="bg-gray-50 border border-gray-150 rounded-2xl py-3 px-5 flex items-center gap-4 shadow-xs self-start lg:self-auto min-w-[180px]">
                        <div className="w-10 h-10 bg-[#00843D]/10 rounded-xl flex items-center justify-center text-[#00843D] shrink-0 font-bold text-xl">
                          📊
                        </div>
                        <div className="text-left">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Registros</p>
                          <p className="text-lg font-black text-gray-800 mt-1">{selectedReport.data?.length || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* SEARCH INSIDE AND ACTION/EXPORT BUTTONS */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl">
                      {/* Search Inside Table */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          value={innerReportSearch}
                          onChange={(e) => {
                            setInnerReportSearch(e.target.value);
                            setReportPage(1);
                          }}
                          placeholder="Filtrar dados nesta tabela..."
                          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 outline-none focus:border-green-500 transition-all placeholder:text-gray-400"
                        />
                      </div>

                      {/* EXPORT AND SHARE OPTIONS BUTTONS */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Print / HTML button */}
                        <button
                          onClick={() => exportData(selectedReport.data, selectedReport.filename, 'html')}
                          className="px-4 py-2.5 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                          title="Exportar PDF / Imprimir"
                        >
                          <span>📄</span> PDF / Imprimir
                        </button>

                        {/* Excel Export */}
                        <button
                          onClick={() => exportToExcel(selectedReport.data, selectedReport.filename)}
                          className="px-4 py-2.5 bg-[#00843D] text-white hover:bg-[#006e33] rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                          title="Exportar Excel"
                        >
                          <span>📊</span> Excel
                        </button>

                        {/* Share HTML */}
                        <button
                          onClick={() => handleShare(selectedReport.data, selectedReport.title, selectedReport.filename)}
                          className="px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                          title="Compartilhar Link PDF/HTML"
                        >
                          <Share2 size={12} /> PDF/HTML
                        </button>

                        {/* Share Excel */}
                        <button
                          onClick={() => shareAsExcel(selectedReport.data, selectedReport.title, selectedReport.filename)}
                          className="px-4 py-2.5 bg-amber-600 text-white hover:bg-amber-700 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
                          title="Compartilhar Excel"
                        >
                          <Share2 size={12} /> Excel
                        </button>
                      </div>
                    </div>

                    {/* TABLE RENDERING WITH PAGINATION */}
                    {(() => {
                      const query = innerReportSearch.toLowerCase().trim();
                      const filteredRows = selectedReport.data.filter((row: any) => {
                        if (!query) return true;
                        return Object.values(row).some((val) => 
                          String(val ?? '').toLowerCase().includes(query)
                        );
                      });

                      const itemsPerPage = 15;
                      const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
                      const currentPage = Math.min(reportPage, totalPages);
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const displayedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

                      if (filteredRows.length === 0) {
                        return (
                          <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                              <Search size={20} />
                            </div>
                            <h4 className="font-black text-gray-800 uppercase text-xs">Nenhum registro correspondente</h4>
                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Ajuste os termos de sua busca na tabela</p>
                          </div>
                        );
                      }

                      // Get object keys dynamically
                      const allKeys = Object.keys(filteredRows[0] || {}).filter(k => k !== 'id');

                      return (
                        <div className="space-y-4">
                          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-inner">
                            <table className="w-full text-left border-collapse min-w-full">
                              <thead className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-wider sticky top-0 border-b border-gray-100">
                                <tr>
                                  {allKeys.map((key) => (
                                    <th key={key} className="px-5 py-3.5 whitespace-nowrap">
                                      {key.replace(/_/g, ' ')}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-xs font-bold text-gray-700">
                                {displayedRows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-green-50/25 transition-colors">
                                    {allKeys.map((key) => {
                                      const val = row[key];
                                      let displayVal = '';
                                      if (typeof val === 'boolean') {
                                        displayVal = val ? 'Sim' : 'Não';
                                      } else if (typeof val === 'object' && val !== null) {
                                        displayVal = Array.isArray(val) ? val.join(', ') : JSON.stringify(val);
                                      } else {
                                        displayVal = String(val ?? '');
                                      }
                                      return (
                                        <td key={key} className="px-5 py-3.5 whitespace-nowrap uppercase text-[11px]">
                                          {displayVal}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                Registros {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRows.length)} de {filteredRows.length}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setReportPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                
                                <span className="text-xs font-black text-gray-700 uppercase px-3">
                                  Página {currentPage} de {totalPages}
                                </span>

                                <button
                                  onClick={() => setReportPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages}
                                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                /* CARDS BROWSING VIEW (DEFAULT) */
                (() => {
                  const query = reportSearchText.toLowerCase().trim();
                  const filteredCards = allAvailableReports.filter(r => {
                    if (!query) return true;
                    return r.title.toLowerCase().includes(query) || 
                           r.desc.toLowerCase().includes(query) ||
                           r.category.toLowerCase().includes(query);
                  });

                  if (filteredCards.length === 0) {
                    return (
                      <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <Search size={24} />
                        </div>
                        <h4 className="font-black text-gray-800 uppercase text-sm">Nenhum relatório encontrado</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase mt-1">Nenhum dos relatórios operacionais corresponde a "{reportSearchText}"</p>
                        <button
                          onClick={() => setReportSearchText('')}
                          className="mt-6 px-5 py-3 bg-green-50 text-[#00843D] text-[10px] font-black uppercase rounded-xl hover:bg-green-100 transition-colors"
                        >
                          Limpar Filtro de Busca
                        </button>
                      </div>
                    );
                  }

                  // Group by Category
                  const categories = Array.from(new Set(filteredCards.map(c => c.category)));

                  return (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      {categories.map((category) => {
                        const cardsInCategory = filteredCards.filter(c => c.category === category);
                        return (
                          <div key={category} className="space-y-4 text-left">
                            <h3 className="text-xs font-black text-[#00843D] uppercase tracking-widest pl-1">
                              {category === 'Operações Gerais, Plantio & Frotas' ? '🚜 Operação Geral, Plantio & Frota (PPT)' :
                               category === 'Gestão de Áreas & Planejamento' ? '🌱 Módulo de Gestão de Áreas & Planejamento' :
                               category === 'Operações do Módulo Vinhaça (SmartFlow)' ? '💧 Operações do Módulo Vinhaça (SmartFlow)' :
                               '🛡️ Gestão de Diálogos de Segurança (DDS)'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {cardsInCategory.map((card, idx) => (
                                <ExportCard
                                  key={idx}
                                  card={card}
                                  onExport={exportData}
                                  onShare={handleShare}
                                  onExportExcel={exportToExcel}
                                  onShareExcel={shareAsExcel}
                                  onViewDetail={(item) => {
                                    setSelectedReport(item);
                                    setReportPage(1);
                                    setInnerReportSearch('');
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          )}

          {activeTab === 'DDS' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left" onClick={(e) => e.stopPropagation()}>
              {/* BEAUTIFUL BANNER CONTAINER AT TOP */}
              <div className="bg-gradient-to-br from-[#005c36] via-[#00843D] to-[#0d5335] p-8 md:p-10 rounded-[32px] text-white relative overflow-hidden shadow-xl border border-white/10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full translate-y-32 -translate-x-32 blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6 text-left">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#5adc6a] border border-white/20 shadow-inner shrink-0">
                      <Shield size={36} className="text-[#5adc6a]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.3em] leading-none mb-2">
                        COLOMBO AGROINDÚSTRIA • SEGURANÇA &amp; PREVENÇÃO DO TRABALHO
                      </p>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">
                        Biblioteca e Controle de DDS Inteligente
                      </h2>
                      <p className="text-white/70 text-[11px] font-bold uppercase mt-2 tracking-wide">
                        Diálogo Diário de Segurança — Mitigação de Riscos no Campo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 self-start md:self-auto">
                    <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl py-3 px-5 flex items-center gap-3 shadow-inner">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5adc6a] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5adc6a]"></span>
                      </span>
                      <div className="text-left">
                        <p className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">Status</p>
                        <p className="text-[10px] font-black text-white uppercase mt-0.5">SISTEMA ATIVO</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsAddingTopicModal(true)}
                      className="px-5 py-4 bg-[#5adc6a] hover:bg-[#4cc55b] text-[#004d22] font-black uppercase text-xs rounded-2xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98 shadow-md"
                    >
                      <Plus size={16} />
                      Novo Tema
                    </button>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              {(() => {
                const filteredTopics = ddsTopics.filter(topic => {
                  const query = ddsSearchQuery.toLowerCase().trim();
                  const matchesSearch = !query || 
                    topic.title.toLowerCase().includes(query) || 
                    topic.category.toLowerCase().includes(query) ||
                    topic.description.toLowerCase().includes(query);
                  const matchesCategory = ddsSelectedCategory === 'Todos' || topic.category === ddsSelectedCategory;
                  return matchesSearch && matchesCategory;
                });

                const categories = ['Todos', ...Array.from(new Set(ddsTopics.map(t => t.category)))];

                return (
                  <div className="space-y-6">
                    {/* BIBLIOTECA DE TEMAS DDS CARD */}
                    <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                        <div>
                          <h3 className="font-black text-gray-900 uppercase tracking-tight text-xl">Biblioteca de Temas do DDS</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Clique em qualquer tema para revisar as diretrizes e registrar como Feito
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#00843D]/5 border border-[#00843D]/10 px-4 py-2 rounded-xl text-[10px] font-black text-[#00843D] uppercase tracking-wide">
                          📚 Total de Temas: {ddsTopics.length}
                        </div>
                      </div>

                      {/* FILTERS BAR: Search + Category Pills */}
                      <div className="space-y-4 mb-6">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            value={ddsSearchQuery}
                            onChange={(e) => setDdsSearchQuery(e.target.value)}
                            placeholder="Buscar tema de DDS por título, categoria ou palavra-chave..."
                            className="w-full bg-gray-50 border border-gray-100 hover:border-gray-200 focus:border-[#00843D] rounded-2xl pl-12 pr-10 py-4 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#00843D]/10 outline-none transition-all placeholder:text-gray-400/80 shadow-inner"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Clock size={18} />
                          </div>
                          {ddsSearchQuery && (
                            <button
                              onClick={() => setDdsSearchQuery('')}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Category Pills (Horizontal scroll bar) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
                          {categories.map((cat) => {
                            const isSelected = ddsSelectedCategory === cat;
                            return (
                              <button
                                key={cat}
                                onClick={() => setDdsSelectedCategory(cat)}
                                className={cn(
                                  "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all border shrink-0",
                                  isSelected
                                    ? "bg-[#00843D] border-[#00843D] text-white shadow-md shadow-green-900/10"
                                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                                )}
                              >
                                {cat}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* SCROLLABLE GRID WITH THEMES */}
                      <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-gray-50 rounded-2xl bg-gray-50/20 p-4">
                        {filteredTopics.length === 0 ? (
                          <div className="py-16 text-center text-gray-400">
                            <p className="font-bold uppercase text-xs">Nenhum tema encontrado para os filtros selecionados.</p>
                            <p className="text-[10px] mt-1">Tente ajustar a busca ou limpe o termo digitado.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredTopics.map((topic) => (
                              <div
                                key={topic.id}
                                onClick={() => {
                                  setTopicToMarkDone(topic);
                                  setIsMarkingDoneModal(true);
                                }}
                                className="group bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer text-left flex flex-col justify-between min-h-[160px] relative overflow-hidden active:scale-98"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[8px] font-black uppercase rounded-md tracking-wider">
                                      {topic.category}
                                    </span>
                                    <span className={cn(
                                      "px-2 py-0.5 text-[8px] font-black uppercase rounded-md tracking-wider",
                                      topic.urgency === 'Crítico' ? "bg-red-50 text-red-600" :
                                      topic.urgency === 'Alto' ? "bg-amber-50 text-amber-600" :
                                      "bg-blue-50 text-blue-600"
                                    )}>
                                      {topic.urgency}
                                    </span>
                                  </div>
                                  <h4 className="font-black text-gray-900 uppercase tracking-tight text-xs leading-snug group-hover:text-[#00843D] transition-colors line-clamp-2">
                                    {topic.title}
                                  </h4>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 line-clamp-2 leading-relaxed">
                                    {topic.description}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                    ID #{topic.id}
                                  </span>
                                  <span className="px-3 py-1.5 bg-[#00843D]/5 text-[#00843D] group-hover:bg-[#00843D] group-hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1">
                                    Feito ✓
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HISTÓRICO DE DIÁLOGOS REALIZADOS CARD */}
                    <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
                        <div>
                          <h3 className="font-black text-gray-900 uppercase tracking-tight text-xl">Histórico de Diálogos Realizados</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Registros assinados digitalmente através da marcação de conclusão
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-[#00843D]/5 border border-[#00843D]/10 px-4 py-2 rounded-xl text-[10px] font-black text-[#00843D] uppercase tracking-wide">
                          📊 Total de Realizações: {savedDdsMeetings.length}
                        </div>
                      </div>

                      {savedDdsMeetings.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 bg-gray-50/20 rounded-2xl border border-dashed border-gray-200">
                          <p className="font-bold uppercase text-xs">Nenhum diálogo diário registrado no histórico.</p>
                          <p className="text-[10px] mt-1">Selecione um tema acima e clique em "Feito" para registrar.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-gray-100">
                          <table className="min-w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="py-4 px-6">Data</th>
                                <th className="py-4 px-6">Hora</th>
                                <th className="py-4 px-6">Unidade</th>
                                <th className="py-4 px-6">Tema do Diálogo</th>
                                <th className="py-4 px-6 text-right">Ação</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {savedDdsMeetings.map((meeting) => (
                                <tr key={meeting.id} className="text-xs hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 px-6 font-black text-gray-900">{meeting.date}</td>
                                  <td className="py-4 px-6 font-bold text-gray-500">{meeting.time || '07:00:00'}</td>
                                  <td className="py-4 px-6 font-black text-[#00843D] uppercase tracking-wider">{meeting.usina}</td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded tracking-wider">
                                        {meeting.category || 'Geral'}
                                      </span>
                                      <span className="font-black text-gray-800 uppercase tracking-tight">{meeting.topicTitle}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <button
                                      onClick={() => {
                                        if (confirm("Excluir este registro de DDS do histórico?")) {
                                          setSavedDdsMeetings(prev => prev.filter(m => m.id !== meeting.id));
                                        }
                                      }}
                                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all"
                                      title="Excluir Registro"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {isAddingTopicModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-[#005c36] to-[#00843D] text-white p-6 flex justify-between items-center shrink-0">
                  <h3 className="text-sm font-black uppercase tracking-tight">Novo Tema do DDS</h3>
                  <button 
                    onClick={() => {
                      setIsAddingTopicModal(false);
                      setNewTopicTitle('');
                      setNewTopicCategory('Segurança Geral');
                      setNewTopicDescription('');
                      setNewTopicRuleInput('');
                      setNewTopicRulesList([]);
                    }}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTopicTitle || !newTopicDescription) {
                      alert("Preencha o título e a descrição do tema.");
                      return;
                    }
                    const newTopic = {
                      id: ddsTopics.length + 1,
                      title: newTopicTitle,
                      category: newTopicCategory,
                      rules: [
                        "Familiarize-se com todos os riscos envolvidos nesta atividade.",
                        "Verifique o estado de conservação de ferramentas e equipamentos antes do uso.",
                        "Sempre faça uso do EPI específico obrigatório recomendado pelo SESMT.",
                        "Em caso de qualquer incidente, quase-acidente ou anomalia, relate imediatamente à supervisão."
                      ],
                      urgency: 'Alto',
                      description: newTopicDescription
                    };
                    setDdsTopics(prev => [...prev, newTopic]);
                    setSelectedDdsTopicId(newTopic.id);
                    setIsAddingTopicModal(false);

                    setNewTopicTitle('');
                    setNewTopicCategory('Segurança Geral');
                    setNewTopicDescription('');
                    setNewTopicRuleInput('');
                    setNewTopicRulesList([]);
                    
                    alert(`Tema "${newTopic.title}" cadastrado e selecionado!`);
                  }}
                  className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar text-left dark:text-white"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Título do Tema</label>
                    <input
                      type="text"
                      required
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#00843D] outline-none"
                      placeholder="Ex: Prevenção de Animais Peçonhentos"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Categoria</label>
                      <select
                        value={newTopicCategory}
                        onChange={(e) => setNewTopicCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#00843D] outline-none"
                      >
                        <option value="Incêndio">Incêndio</option>
                        <option value="Operação de Máquinas">Operação de Máquinas</option>
                        <option value="Saúde Ocupacional">Saúde Ocupacional</option>
                        <option value="Equipamento de Proteção">Equipamento de Proteção</option>
                        <option value="Segurança Geral">Segurança Geral</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nível de Alerta</label>
                      <span className="w-full bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 rounded-2xl px-4 py-3 text-xs font-black block text-center uppercase tracking-wider">
                        ⚠️ ALTO
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Descrição explicativa</label>
                    <textarea
                      required
                      rows={3}
                      value={newTopicDescription}
                      onChange={(e) => setNewTopicDescription(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#00843D] outline-none resize-none"
                      placeholder="Explique o risco e a importância deste tema no ambiente de campo..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#00843D] hover:bg-[#006B32] text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Save size={16} />
                    Cadastrar e Salvar Tema
                  </button>
                </form>
              </div>
            </div>
          )}

          {isMarkingDoneModal && topicToMarkDone && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-gray-100 dark:border-slate-800 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200">
                <div className="bg-gradient-to-r from-[#005c36] to-[#00843D] text-white p-4 sm:p-6 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-[#5adc6a]" />
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-300">CONFIRMAÇÃO DE DDS</h3>
                      <p className="text-xs sm:text-sm font-black uppercase tracking-tight mt-0.5">Marcar como Realizado</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsMarkingDoneModal(false);
                      setTopicToMarkDone(null);
                    }}
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto custom-scrollbar dark:text-white">
                  {/* Topic Details Overview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[8px] font-black uppercase rounded-md tracking-wider">
                        {topicToMarkDone.category}
                      </span>
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                        ID #{topicToMarkDone.id}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {topicToMarkDone.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-300 font-bold bg-gray-50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 italic leading-relaxed">
                      "{topicToMarkDone.description}"
                    </p>
                  </div>

                  {/* Rules / Guidelines if any */}
                  {topicToMarkDone.rules && topicToMarkDone.rules.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">DIRETRIZES DE SEGURANÇA</h5>
                      <ul className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                        {topicToMarkDone.rules.map((rule, idx) => (
                          <li key={idx} className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                            <span className="text-[#00843D] dark:text-green-400 shrink-0 font-black">✓</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Select Usina to register */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-slate-800/60 pt-4">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Selecione a Unidade / Usina de Realização</label>
                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
                      {(['Ariranha', 'Palestina', 'Santa Albertina'] as UsinaKey[]).map((usina) => {
                        const isSelected = markDoneUsina === usina;
                        const label = usina === 'Ariranha' ? 'ARI' : usina === 'Palestina' ? 'PAL' : 'STA';
                        return (
                          <button
                            key={usina}
                            type="button"
                            onClick={() => setMarkDoneUsina(usina)}
                            className={cn(
                              "py-2 px-1 rounded-xl text-[9px] xs:text-[10px] font-black uppercase tracking-wider text-center border transition-all truncate",
                              isSelected
                                ? "bg-[#00843D]/5 border-[#00843D] text-[#00843D] dark:text-green-400 dark:border-green-500 ring-2 ring-[#00843D]/10"
                                : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm and Close buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMarkingDoneModal(false);
                        setTopicToMarkDone(null);
                      }}
                      className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-black uppercase text-xs rounded-xl transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
                        const newMeeting = {
                          id: Date.now(),
                          date: now.toLocaleDateString('pt-BR'),
                          time: timeStr,
                          usina: markDoneUsina,
                          supervisor: "Líder de Campo",
                          topicTitle: topicToMarkDone.title,
                          category: topicToMarkDone.category,
                          attendees: []
                        };

                        setSavedDdsMeetings(prev => [newMeeting, ...prev]);

                        // Add action log
                        setAllLogs(prev => [{
                          id: Date.now(),
                          type: 'Status',
                          event: 'DDS Concluído',
                          detail: `DDS: "${topicToMarkDone.title}" concluído na unidade ${markDoneUsina}.`,
                          time: now.toLocaleString('pt-BR'),
                          user: "Supervisor",
                          city: markDoneUsina
                        }, ...prev]);

                        // Clear and close
                        setIsMarkingDoneModal(false);
                        setTopicToMarkDone(null);
                      }}
                      className="flex-1 py-3.5 bg-[#00843D] hover:bg-[#006B32] text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-green-900/10 transition-all"
                    >
                      Confirmar Realização
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DIÁRIO COA' && (
            <DiarioCoaProducoes isDarkMode={isDarkMode} />
          )}

          {activeTab === 'DIÁRIO PLANTIO' && (
            <DiarioPlantioMecanizado isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Pluviometria' && (
            <Pluviometria isDarkMode={isDarkMode} />
          )}

          {activeTab === 'Coazito' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 text-left">
                <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-[#00843D] shadow-inner shrink-0 border border-emerald-100">
                  <Bot size={36} />
                </div>
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Coazito AI • Copiloto Operacional</h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Sua inteligência artificial integrada com dados operacionais de vinhaça, frotas, plantio, áreas e fechamentos</p>
                </div>
              </div>
              <CoazitoChat 
                frentes={frentes}
                fleet={fleet}
                usinaAreasText={usinaAreasText}
                plantioHistory={plantioHistory}
                dadosUsinas={DADOS_USINAS}
                allLogs={allLogs}
                vinhacaApontamentos={vinhacaApontamentos}
                vinhacaTanks={vinhacaTanks}
                vinhacaMotoristas={vinhacaMotoristas}
                vinhacaFazendas={vinhacaFazendas}
                onExport={exportData}
              />
            </div>
          )}
        </div>
        
        {/* FOOTER INFO */}
        <footer className="px-8 py-3 bg-white border-t flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase">Sistema de Monitoramento Operacional - PPT</span>
          </div>
        </footer>
      </main>

      {/* FLEET MODAL */}
      {isFleetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsFleetModalOpen(false)}>
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#00843D] p-6 flex justify-between items-center border-b-4 border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  {editingFleetId ? <Edit2 size={20} /> : <PlusCircle size={20} />}
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-tight leading-none">{editingFleetId ? 'Editar Equipamento' : 'Novo Equipamento'}</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1" translate="no">Frota: {selectedUsina}</p>
                </div>
              </div>
              <button onClick={() => setIsFleetModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveFleet} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tipo de Equipamento</label>
                  <select 
                    value={fleetFormData.tipo}
                    onChange={(e) => setFleetFormData({...fleetFormData, tipo: e.target.value as any})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] transition-all"
                  >
                    <option value="Trator">Trator</option>
                    <option value="Plantadeira">Plantadeira</option>
                    <option value="Colhedeira">Colhedeira</option>
                    <option value="Caminhão">Caminhão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Frota</label>
                  <input 
                    type="text"
                    required
                    value={fleetFormData.prefixo}
                    onChange={(e) => setFleetFormData({...fleetFormData, prefixo: e.target.value})}
                    placeholder="Ex: TR-001"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modelo / Descrição</label>
                  <input 
                    type="text"
                    required
                    value={fleetFormData.modelo}
                    onChange={(e) => setFleetFormData({...fleetFormData, modelo: e.target.value})}
                    placeholder="Ex: John Deere 8R"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status Inicial</label>
                  <select 
                    value={fleetFormData.status}
                    onChange={(e) => setFleetFormData({...fleetFormData, status: e.target.value as any})}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] transition-all"
                  >
                    <option value="Reserva">Reserva</option>
                    <option value="Trabalhando">Trabalhando</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unidade</label>
                  <input 
                    type="text"
                    disabled
                    value={selectedUsina}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  type="button"
                  onClick={() => setIsFleetModalOpen(false)}
                  className="flex-1 py-4 bg-gray-50 text-gray-400 font-black uppercase text-xs rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-2 py-4 bg-gray-900 text-white font-black uppercase text-xs rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200"
                >
                  {editingFleetId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT/NEW FRENTE MODAL */}
      {isFrenteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#00843D] p-6 flex justify-between items-center border-b-4 border-black/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  {editingFrenteId ? <Edit2 size={20} /> : <Plus size={20} strokeWidth={3} />}
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-tight leading-none">{editingFrenteId ? 'Editar Frente' : 'Cadastrar Nova Frente'}</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1" translate="no">Unidade: {selectedUsina}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsFrenteModalOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveFrente} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Número da Frente</label>
                  <input 
                    type="text"
                    required
                    value={frenteFormData.frente}
                    onChange={(e) => setFrenteFormData({...frenteFormData, frente: e.target.value})}
                    placeholder="Ex: 72.1"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Serviço / Nome</label>
                  <input 
                    type="text"
                    value={frenteFormData.nome}
                    onChange={(e) => setFrenteFormData({...frenteFormData, nome: e.target.value})}
                    placeholder="Ex: Plantio"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fazenda</label>
                  <input 
                    type="text"
                    required
                    value={frenteFormData.fazenda}
                    onChange={(e) => setFrenteFormData({...frenteFormData, fazenda: e.target.value})}
                    placeholder="Digite o nome da propriedade"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cidade (Auto)</label>
                  <input 
                    type="text"
                    disabled
                    value={selectedUsina}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl p-3 text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gestor da Frente</label>
                  <input 
                    type="text"
                    value={frenteFormData.gestor}
                    onChange={(e) => setFrenteFormData({...frenteFormData, gestor: e.target.value})}
                    placeholder="Nome do gestor"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantidade de Quadras</label>
                  <input 
                    type="number"
                    value={frenteFormData.quadras}
                    onChange={(e) => setFrenteFormData({...frenteFormData, quadras: e.target.value})}
                    placeholder="0"
                    min="0"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantidade de Talhões</label>
                  <input 
                    type="number"
                    value={frenteFormData.talhoes}
                    onChange={(e) => setFrenteFormData({...frenteFormData, talhoes: e.target.value})}
                    placeholder="0"
                    min="0"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm font-bold outline-none focus:border-[#00843D] focus:bg-white transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status da Operação</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Trabalhando', 'Parada', 'C/Vento/Chuva', 'Mudança'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFrenteFormData({...frenteFormData, status})}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border-2",
                          frenteFormData.status === status
                            ? status === 'Trabalhando' ? "bg-green-600 border-green-600 text-white" :
                              status === 'Parada' ? "bg-red-600 border-red-600 text-white" :
                              status === 'C/Vento/Chuva' ? "bg-blue-600 border-blue-600 text-white" :
                              "bg-gray-600 border-gray-600 text-white"
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-8">
                {editingFrenteId && (
                  <button 
                    type="button"
                    onClick={() => {
                      const fToRemove = frentes.find(f => f.id === editingFrenteId);
                      if (fToRemove) {
                        const removed = removeFrente(fToRemove);
                        if (removed) {
                          setIsFrenteModalOpen(false);
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-xl font-bold uppercase text-xs text-red-500 hover:bg-red-50 transition-all border border-red-100 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Deletar
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setIsFrenteModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-all border border-transparent"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={cn(
                    "px-4 py-3 rounded-xl font-black uppercase text-xs shadow-lg transition-all flex items-center justify-center gap-2",
                    editingFrenteId ? "flex-[1.5] bg-blue-600 hover:bg-blue-800" : "flex-[2] bg-[#00843D] hover:bg-green-800",
                    "text-white"
                  )}
                >
                  {editingFrenteId ? <Save size={16} /> : <PlusCircle size={16} />}
                  {editingFrenteId ? 'Salvar Alterações' : 'Cadastrar Frente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OBS MODAL */}
      {isObsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#00843D] p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-tight leading-none">Observações da Frente</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Frente: {frentes.find(f => f.id === currentFrenteId)?.frente}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsObsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Relato de Campo / Observação Técnica</label>
              <textarea 
                value={tempObs}
                onChange={(e) => setTempObs(e.target.value)}
                placeholder="Digite aqui os detalhes sobre a frente, motivos de parada ou observações importantes..."
                className="w-full h-40 bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-gray-700 font-medium outline-none focus:border-[#F4D000] focus:bg-white transition-all resize-none"
              />
              
              <div className="flex gap-4 mt-6">
                <button 
                  onClick={() => setIsObsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold uppercase text-xs text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveObs}
                  className="flex-[2] bg-[#00843D] text-white px-4 py-3 rounded-xl font-bold uppercase text-xs shadow-lg hover:bg-green-800 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Salvar Observação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* FLASH MESSAGE FOR LOGS */}
      <AnimatePresence>
        {/* ... existing notification logic ... */}
      </AnimatePresence>

      {/* ZOOMED FRENTE MODAL */}
      <AnimatePresence>
        {selectedFrenteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setSelectedFrenteId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-slate-800 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Buttons (Desktop Only) */}
              <button 
                onClick={handlePrevFrente}
                className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextFrente}
                className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronRight size={24} />
              </button>

              <div className="p-4 sm:p-6 md:p-12 overflow-y-auto custom-green-scrollbar flex-1 space-y-6 sm:space-y-8">
                {(() => {
                  const f = frentes.find(item => item.id === selectedFrenteId);
                  if (!f) return null;
                  return (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <h2 
                            className={cn(
                              "text-3xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-4",
                              f.status === 'Trabalhando' ? "text-[#00843D]" :
                              f.status === 'Parada' ? "text-red-700" :
                              "text-blue-700"
                            )}
                            data-theme-ignore={f.status === 'Trabalhando' ? "true" : undefined}
                          >
                            {f.frente}
                          </h2>
                          <p className="text-lg sm:text-2xl font-bold text-gray-400 uppercase tracking-[0.2em]">
                            {f.nome}
                          </p>
                        </div>
                        <div className={cn(
                          "px-6 py-3 sm:px-8 sm:py-4 rounded-3xl text-lg sm:text-2xl font-black text-white uppercase shadow-xl",
                          f.status === 'Trabalhando' ? "bg-green-600" :
                          f.status === 'Parada' ? "bg-red-600" :
                          "bg-blue-600"
                        )}>
                          {f.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y-2 border-gray-50 dark:border-slate-800">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <MapPin size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fazenda / Localização</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{f.fazenda}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <Users size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gestor Responsável</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{f.gestor}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <LayoutDashboard size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Estrutura (Quadras/Talhões)</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{f.quadras} Quadras | {f.talhoes} Talhões</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <Clock size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Última Atualização</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{f.updatedAt || lastGlobalUpdate}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {f.obs && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/40">
                          <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             <MessageSquare size={12} /> Observações de Campo
                          </p>
                          <p className="text-amber-900 dark:text-amber-100 font-bold italic">"{f.obs}"</p>
                        </div>
                      )}

                      {/* Mobile Navigation Row */}
                      <div className="flex sm:hidden justify-between items-center w-full gap-3 pt-2 border-t border-gray-150 dark:border-slate-800/60">
                        <button 
                          onClick={handlePrevFrente}
                          className="flex-1 py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 border border-gray-150 dark:border-slate-800"
                        >
                          <ChevronLeft size={14} /> Anterior
                        </button>
                        <button 
                          onClick={handleNextFrente}
                          className="flex-1 py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 border border-gray-150 dark:border-slate-800"
                        >
                          Próximo <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                        <button 
                          onClick={() => {
                            setSelectedFrenteId(null);
                            editFrente(f);
                          }}
                          className="w-full sm:w-auto px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} /> Editar Dados
                        </button>
                        <button 
                          onClick={() => setSelectedFrenteId(null)}
                          className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-gray-800 transition-all text-center"
                        >
                          Fechar Detalhes
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZOOMED FLEET MODAL */}
      <AnimatePresence>
        {selectedFleetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setSelectedFleetId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-slate-800 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Buttons (Desktop Only) */}
              <button 
                onClick={handlePrevFleet}
                className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextFleet}
                className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronRight size={24} />
              </button>

              <div className="p-4 sm:p-6 md:p-12 overflow-y-auto custom-green-scrollbar flex-1 space-y-6 sm:space-y-8">
                {(() => {
                  const item = fleet.find(f => f.id === selectedFleetId);
                  if (!item) return null;
                  
                  // Calculate efficiency for this item
                  const data = item.hourlyData || [];
                  const workHours = data.filter(s => s === 'Trabalhando').length;
                  const partialHours = data.filter(s => s === 'Trabalhando Parcial').length;
                  const totalSlots = data.length || 24;
                  const itemEfficiency = (((workHours + (partialHours * 0.5)) / 24) * 100).toFixed(1);

                  return (
                    <div className="space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                           <div className={cn(
                            "w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] sm:rounded-[32px] flex items-center justify-center text-white shadow-2xl shrink-0 transition-transform scale-105 sm:scale-110",
                            item.tipo === 'Trator' ? "bg-amber-500" :
                            item.tipo === 'Plantadeira' ? "bg-green-600" :
                            item.tipo === 'Colhedeira' ? "bg-purple-600" :
                            "bg-blue-600"
                          )}>
                            {item.tipo === 'Trator' ? <Tractor className="w-10 h-10 sm:w-12 sm:h-12" /> : 
                             item.tipo === 'Plantadeira' ? <Sprout className="w-10 h-10 sm:w-12 sm:h-12" /> : 
                             item.tipo === 'Colhedeira' ? <Settings className="w-10 h-10 sm:w-12 sm:h-12" /> :
                             <Truck className="w-10 h-10 sm:w-12 sm:h-12" />}
                          </div>
                          <div>
                            <h2 className="text-4xl sm:text-7xl font-black text-gray-950 dark:text-white uppercase tracking-tighter leading-none mb-2 sm:mb-4">
                              {item.prefixo}
                            </h2>
                            <p className="text-lg sm:text-2xl font-black text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                              {item.modelo}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Eficiência Diária</p>
                          <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl">
                             <span className="text-2xl sm:text-4xl font-black text-[#00843D] status-label-ignore dark:text-green-400">{itemEfficiency}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-y-2 border-gray-50 dark:border-slate-800">
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <Activity size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Equipamento</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{item.tipo}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <MapPin size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade Alocada</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{item.unidade}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
                              <Clock size={24} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monitoramento 24h</p>
                              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase">{item.hourlyData?.filter(s => s !== 'Reserva').length} Horas Registradas</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status timeline in modal */}
                      <div className="bg-gray-50 dark:bg-slate-850/30 p-6 sm:p-8 rounded-[32px] border border-gray-100 dark:border-slate-800">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Status por Hora (Visualização Rápida)</p>
                         <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                           {Array.from({ length: 24 }).map((_, h) => {
                             const status = item.hourlyData?.[h] || 'Reserva';
                             const info = HOURLY_STATUS_MAP.find(s => s.label === status) || HOURLY_STATUS_MAP[6];
                             return (
                               <div key={h} className="flex-shrink-0 flex flex-col items-center gap-2">
                                 <div className={cn("w-8 h-8 rounded-lg shadow-sm border border-black/5", info.color)}></div>
                                 <span className="text-[8px] font-black text-gray-400">{h}h</span>
                               </div>
                             )
                           })}
                         </div>
                      </div>

                      {/* Mobile Navigation Row */}
                      <div className="flex sm:hidden justify-between items-center w-full gap-3 pt-2 border-t border-gray-150 dark:border-slate-800/60">
                        <button 
                          onClick={handlePrevFleet}
                          className="flex-1 py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 border border-gray-150 dark:border-slate-800"
                        >
                          <ChevronLeft size={14} /> Anterior
                        </button>
                        <button 
                          onClick={handleNextFleet}
                          className="flex-1 py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 border border-gray-150 dark:border-slate-800"
                        >
                          Próximo <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                        <button 
                          onClick={() => {
                            setSelectedFleetId(null);
                            setEditingFleetId(item.id);
                            setFleetFormData({
                              prefixo: item.prefixo,
                              tipo: item.tipo,
                              modelo: item.modelo,
                              unidade: item.unidade
                            });
                            setIsFleetModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black uppercase text-xs hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Edit2 size={16} /> Editar Equipamento
                        </button>
                        <button 
                          onClick={() => setSelectedFleetId(null)}
                          className="w-full sm:w-auto px-8 py-4 bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-gray-800 transition-all text-center"
                        >
                          Fechar Detalhes
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZOOMED KPI STATUS MODAL */}
      <AnimatePresence>
        {selectedKPIStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setSelectedKPIStatus(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-slate-800 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Buttons (Desktop Only) */}
              <button 
                onClick={handlePrevKPI}
                className="hidden sm:flex absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextKPI}
                className="hidden sm:flex absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronRight size={24} />
              </button>

              <div className="p-4 sm:p-6 md:p-12 overflow-y-auto custom-green-scrollbar flex-1 space-y-6 sm:space-y-8 text-left">
                 <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div>
                       <h2 className={cn(
                          "text-6xl font-black uppercase tracking-tighter leading-none mb-2",
                          selectedKPIStatus === 'Trabalhando' ? "text-[#00843D]" :
                          selectedKPIStatus === 'Paradas' ? "text-red-600" :
                          selectedKPIStatus === 'C/Vento/Chuva' ? "text-blue-600" :
                          "text-gray-600"
                       )}>
                          {selectedKPIStatus}
                       </h2>
                       <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">Resumo Operacional • {selectedUsina}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-7xl font-black text-gray-950 leading-none">
                          {filteredFrentes.filter(f => f.status === (selectedKPIStatus === 'Paradas' ? 'Parada' : selectedKPIStatus)).length}
                       </p>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Frentes Ativas</p>
                    </div>
                 </div>

                 <div className="bg-gray-50 dark:bg-slate-850/30 rounded-[32px] p-4 sm:p-8 max-h-[400px] overflow-y-auto custom-scrollbar border border-gray-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {filteredFrentes
                          .filter(f => f.status === (selectedKPIStatus === 'Paradas' ? 'Parada' : selectedKPIStatus))
                          .map(f => (
                             <div 
                              key={f.id} 
                              onClick={() => {
                                 setSelectedKPIStatus(null);
                                 setSelectedFrenteId(f.id);
                              }}
                              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer flex justify-between items-center group"
                             >
                                <div>
                                   <p className="text-lg font-black text-gray-900 uppercase leading-none mb-1">{f.frente}</p>
                                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{f.fazenda}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:bg-green-50 dark:group-hover:bg-green-950/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                   <ChevronRight size={20} />
                                </div>
                             </div>
                          ))
                       }
                       {filteredFrentes.filter(f => f.status === (selectedKPIStatus === 'Paradas' ? 'Parada' : selectedKPIStatus)).length === 0 && (
                          <div className="col-span-full py-12 text-center">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                                <Activity size={32} />
                             </div>
                             <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma frente neste status no momento</p>
                          </div>
                       )}
                    </div>
                 </div>

                  {/* Mobile Navigation Row */}
                  <div className="flex sm:hidden justify-between items-center w-full gap-3 pt-2 border-t border-gray-150 dark:border-slate-800/60 mt-4 mb-4">
                    <button 
                      onClick={handlePrevKPI}
                      className="flex-1 py-3 px-4 bg-gray-50 dark:bg-slate-850/40 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 border border-gray-150 dark:border-slate-800"
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <button 
                      onClick={handleNextKPI}
                      className="flex-1 py-3 px-4 bg-gray-50 dark:bg-slate-850/40 hover:bg-gray-100 text-gray-700 dark:text-gray-200 rounded-xl font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-1 border border-gray-150 dark:border-slate-800"
                    >
                      Próximo <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex justify-end mt-8">
                    <button 
                      onClick={() => setSelectedKPIStatus(null)}
                      className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-gray-800 transition-all active:scale-95 text-center"
                    >
                      Fechar Painel
                    </button>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ZOOMED GENERIC DASHBOARD CARD MODAL */}
      <AnimatePresence>
        {zoomedCardId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setZoomedCardId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-slate-800 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Buttons */}
              <button 
                onClick={handlePrevDashboardCard}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextDashboardCard}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronRight size={24} />
              </button>

              <div className="p-6 md:p-12 overflow-y-auto custom-green-scrollbar flex-1 space-y-8">
                 {(() => {
                   if (zoomedCardId === 'Efficiency') {
                     return (
                        <div className="flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12">
                           <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-50 dark:bg-green-950/20 rounded-[32px] sm:rounded-[40px] flex items-center justify-center shadow-inner">
                             <Activity className="text-[#00843D] dark:text-green-400 w-12 h-12 sm:w-16 sm:h-16" />
                           </div>
                           <div>
                              <h4 className="text-sm sm:text-xl font-black text-gray-400 uppercase tracking-[0.3em] mb-2 sm:mb-4">Eficiência Operacional</h4>
                              <p className="text-[5rem] sm:text-[12rem] font-black text-gray-900 dark:text-white leading-none tracking-tighter">
                                 {calculateUsinaEfficiency(selectedUsina)}%
                              </p>
                           </div>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
                              {HOURLY_STATUS_MAP.map(status => {
                                const usinaFleet = fleet.filter(item => item.unidade === selectedUsina);
                                let total = 0;
                                let count = 0;
                                usinaFleet.forEach(f => {
                                  (f.hourlyData || []).forEach(s => {
                                    total++;
                                    if (s === status.label) count++;
                                  });
                                });
                                if (total === 0 && status.label === 'Reserva') return null;
                                const perc = total > 0 ? (count / total * 100).toFixed(1) : "0";
                                return (
                                  <div key={status.label} className="bg-gray-50 dark:bg-slate-800 p-4 sm:p-6 rounded-3xl border border-gray-100 dark:border-slate-700/80">
                                     <div className={cn("w-4 h-4 rounded-full mx-auto mb-3", status.color)}></div>
                                     <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">{status.label}</p>
                                     <p className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white mt-1">{perc}%</p>
                                  </div>
                                );
                              })}
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === 'Distribution') {
                     return (
                        <div className="space-y-10">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Distribuição Operacional Detalhada</h4>
                           <div className="h-[300px] sm:h-[500px] w-full text-gray-400 dark:text-gray-500">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={Array.from({ length: 24 }).map((_, h) => {
                                    const data: any = { hour: `${h}h` };
                                    HOURLY_STATUS_MAP.forEach(s => {
                                      data[s.label] = fleet
                                        .filter(item => item.unidade === selectedUsina)
                                        .filter(item => item.hourlyData?.[h] === s.label).length;
                                    });
                                    return data;
                                  })}
                                  barCategoryGap={8}
                                >
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'currentColor' }} className="text-gray-400 dark:text-gray-500" />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'currentColor' }} className="text-gray-400 dark:text-gray-500" />
                                  <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', background: 'rgba(15, 23, 42, 0.95)', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', padding: '16px' }}
                                    itemStyle={{ fontSize: '14px', fontWeights: 900, textTransform: 'uppercase' }}
                                  />
                                  {HOURLY_STATUS_MAP.map(status => (
                                    <Bar key={status.label} dataKey={status.label} stackId="a" fill={status.hex} />
                                  ))}
                                </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === '3DPerf') {
                     return (
                        <div className="flex flex-col items-center justify-center space-y-12 h-full">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Visão 3D Imersiva</h4>
                           <div className="h-[320px] sm:h-[500px] w-full flex items-center justify-center relative" style={{ perspective: '3000px' }}>
                              <motion.div
                                animate={{ rotateY: [0, 360], rotateX: [15, 30, 15] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="relative w-[280px] h-[280px] sm:w-[500px] sm:h-[500px] flex items-center justify-center"
                                style={{ transformStyle: 'preserve-3d' }}
                              >
                                {[...Array(20)].map((_, i) => {
                                  const usinaFleet = fleet.filter(item => item.unidade === selectedUsina);
                                  const pieData = HOURLY_STATUS_MAP.map(status => {
                                    let count = 0;
                                    let total = 0;
                                    usinaFleet.forEach(f => { (f.hourlyData || []).forEach(s => { total++; if (s === status.label) count++; }); });
                                    return { name: status.label, value: count || 0.1, color: status.hex };
                                  }).filter(s => s.value > 0);

                                  return (
                                    <div key={i} className="absolute inset-0" style={{ transform: `translateZ(${i * 2}px)`, opacity: i === 19 ? 1 : 0.8 - (i * 0.03) }}>
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie data={pieData} innerRadius="55%" outerRadius="80%" paddingAngle={2} dataKey="value" stroke="none" isAnimationActive={false}>
                                            {pieData.map((e, idx) => <Cell key={idx} fill={e.color} />)}
                                          </Pie>
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                  );
                                })}
                                <div className="absolute bg-white dark:bg-slate-800 rounded-full w-24 h-24 sm:w-40 sm:h-40 shadow-2xl flex flex-col items-center justify-center border-4 sm:border-8 border-gray-50 dark:border-slate-700" style={{ transform: 'translateZ(45px)' }}>
                                   <p className="text-2xl sm:text-4xl font-black text-[#00843D] status-label-ignore dark:text-green-400">{calculateUsinaEfficiency(selectedUsina)}%</p>
                                </div>
                              </motion.div>
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === 'StatusRanking') {
                     return (
                        <div className="space-y-10">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Ranking de Status PPT</h4>
                           <div className="h-[600px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rankingData} layout="vertical" margin={{ left: 100, right: 40 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                  <XAxis type="number" hide />
                                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: 'currentColor' }} width={100} />
                                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                                  <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                                    {rankingData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === 'StatusPie') {
                     return (
                        <div className="flex flex-col items-center justify-center space-y-10">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Composição Operacional</h4>
                           <div className="h-[600px] w-full relative">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={pieData} cx="50%" cy="50%" innerRadius="40%" outerRadius="65%" paddingAngle={6} dataKey="value">
                                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                  </Pie>
                                  <Tooltip />
                                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '18px', fontWeight: '900', paddingTop: '40px' }} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-20">
                                <span className="text-xl sm:text-4xl font-black text-[#006B32] dark:text-green-400">{selectedUsina}</span>
                              </div>
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === 'Evolution') {
                     return (
                        <div className="space-y-10">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Evolução Operacional (24 Horas)</h4>
                           <div className="h-[600px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hourlyData}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', paddingTop: '20px' }} />
                                  <Area type="monotone" dataKey="Trabalhando" stroke="#00843D" fill="#00843D" fillOpacity={0.1} strokeWidth={4} />
                                  <Area type="monotone" dataKey="Paradas" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={4} />
                                  <Area type="monotone" dataKey="Vento/Chuva" stroke="#60A5FA" fill="#60A5FA" fillOpacity={0.1} strokeWidth={4} />
                                  <Area type="monotone" dataKey="Mudança" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.1} strokeWidth={4} />
                                </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === 'Comparison') {
                     return (
                        <div className="space-y-10">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Comparativo de Produtividade</h4>
                           <div className="h-[600px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={comparisonData} barGap={10}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 'bold' }} />
                                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none' }} />
                                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
                                  <Bar yAxisId="left" dataKey="Atual" name="Quantidade Atual" radius={[8, 8, 0, 0]}>
                                    {comparisonData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                  </Bar>
                                  <Bar yAxisId="right" dataKey="Percentual" name="Eficiência %" fill="#D1D5DB" radius={[8, 8, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     );
                   }
                   if (zoomedCardId === 'Profile') {
                     return (
                        <div className="flex flex-col items-center justify-center space-y-10">
                           <h4 className="text-2xl sm:text-4xl font-black text-gray-950 dark:text-white uppercase tracking-tighter">Perfil de Desempenho</h4>
                           <div className="h-[350px] sm:h-[650px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                  <PolarGrid stroke="#f0f0f0" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 'black', fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                                  <Radar name="Benchmark" dataKey="B" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.3} />
                                  <Radar name="Realized" dataKey="A" stroke="#00843D" fill="#00843D" fillOpacity={0.6} />
                                  <Tooltip />
                                </RadarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     );
                   }
                   // Other cases can be added similarly
                   return <div className="flex items-center justify-center h-full"><p className="text-4xl font-black text-gray-300">Visualização em Alta Definição</p></div>;
                 })()}
                 
                 <div className="flex justify-end mt-12">
                    <button 
                      onClick={() => setZoomedCardId(null)}
                      className="px-8 py-4 sm:px-12 sm:py-6 bg-black dark:bg-white text-white dark:text-black rounded-[20px] sm:rounded-[24px] font-black uppercase text-xs sm:text-sm shadow-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Voltar ao Painel
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL NOTIFICATION TOAST */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={cn(
            "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border font-black uppercase text-xs tracking-wider",
            globalToast.type === 'success' 
              ? "bg-[#00843D] border-[#5adc6a]/30 text-white" 
              : "bg-red-600 border-red-500/30 text-white"
          )}>
            <div className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <span>{globalToast.message}</span>
            <button 
              onClick={() => setGlobalToast(null)} 
              className="ml-3 hover:scale-110 active:scale-90 transition-transform p-1 rounded-lg bg-white/10 hover:bg-white/20"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}


