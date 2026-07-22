import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { parseTxtContent } from '../lib/txtParser';
import { 
  LayoutDashboard, 
  Table, 
  ClipboardList, 
  AlertTriangle, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Calendar, 
  Tractor, 
  Droplet, 
  Layers, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  FileSpreadsheet,
  Download,
  Share2,
  ChevronRight,
  Info,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Cpu,
  BarChart4,
  Maximize2,
  ChevronLeft,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

// Interfaces for our state and data
interface AreaRecord {
  id: string;
  fazenda: string;
  quadra: string;
  talhao: string;
  areaPlantio: number; // in hectares
  sistemaPlantio: 'Mecanizado Convenc' | 'Meiosi Desdobra' | 'Manual Convenc';
  renovacao: string;
  variedade: string;
  flegPlantio: 'Plantio Meio' | 'Plantio Normal';
  plantioCco: number;
  plantioPims: number;
  statusArea: 'Á PLANTAR' | 'PLANTANDO' | 'PLANTIO FECHADO';
  situacaoPlantio: string;
  replantio: boolean;
  
  // Conferências e Alertas
  confSistPlantio: 'Ok' | 'Verificar' | 'Pendente';
  confSistArea: string; // e.g. "ok-16/04/2026"
  sistematizacao: number;
  sulcacao: number;
  cobricao: number;
  distribuicao: number;
  transporteMuda: number;
  carregamento: number;
  descarregamento: number;
  corteMuda: number;
  transporteInsumos: number;
  apoio: number;
  tampacao: number;
  quebraLombo: number;
  aplicHerbicida: number;
}

interface GerencialRow {
  modalidade: string;
  frente: string;
  dia: { planej: number; realiz: number; chuva: number };
  mes: { planej: number; realiz: number; chuva: number };
  acumulado: { planej: number; realiz: number; chuva: number };
}

interface ShiftRecord {
  turno: 'TURNO A' | 'TURNO B' | 'TURNO C';
  horario: string;
  plantio: number;
  chuva: number;
  viagens: number;
  muda: number;
  rendimento: number;
  pessoas: number;
  hecPessoas: number;
  status: 'TRABALHOU' | 'NÃO TRABALHOU';
}

export const GestaoAreas = React.memo(({ 
  onBack,
  selectedUsina = "Palestina",
  onAddLog
}: { 
  onBack?: () => void;
  selectedUsina?: string;
  onAddLog?: (type: 'Cadastro' | 'Status' | 'Auditoria' | 'Boletim', event: string, detail: string) => void;
}) => {
  const [subTab, setSubTab] = useState<'gerencial' | 'banco' | 'boletim' | 'pims'>('gerencial');
  const [zoomedSectionId, setZoomedSectionId] = useState<string | null>(null);
  const zoomableSections = ['gerencial', 'banco', 'boletim', 'pims'];
  
  const handlePrevSection = () => {
    if (!zoomedSectionId) return;
    const idx = zoomableSections.indexOf(zoomedSectionId);
    const prev = zoomableSections[(idx - 1 + zoomableSections.length) % zoomableSections.length];
    setZoomedSectionId(prev);
  };

  const handleNextSection = () => {
    if (!zoomedSectionId) return;
    const idx = zoomableSections.indexOf(zoomedSectionId);
    const next = zoomableSections[(idx + 1) % zoomableSections.length];
    setZoomedSectionId(next);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFrente, setSelectedFrente] = useState('72-1');
  const [selectedDate, setSelectedDate] = useState('2026-06-02');
  
  // State variables for Planting Launch and Routing
  const [launchHectares, setLaunchHectares] = useState<number>(3.0);
  const [launchFrente, setLaunchFrente] = useState<string>('72-1');
  const [launchFazenda, setLaunchFazenda] = useState<string>('20008');
  const [launchQuadra, setLaunchQuadra] = useState<string>('1');
  const [launchSistema, setLaunchSistema] = useState<'Mecanizado Convenc' | 'Meiosi Desdobra' | 'Manual Convenc'>('Mecanizado Convenc');
  const [launchTalhao, setLaunchTalhao] = useState<string>('ALL');
  const [launchTurno, setLaunchTurno] = useState<'TURNO A' | 'TURNO B' | 'TURNO C'>('TURNO A');
  const [launchChuva, setLaunchChuva] = useState<number>(0);
  const [launchDataHora, setLaunchDataHora] = useState<string>(() => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('16-07-2026 19:09:35');

  React.useEffect(() => {
    const savedTime = localStorage.getItem('diario_coa_last_update');
    if (savedTime) {
      setLastUpdateTime(savedTime);
    }
    const savedGerencial = localStorage.getItem('diario_coa_gerencial_data');
    if (savedGerencial) {
      try { setGerencialData(JSON.parse(savedGerencial)); } catch (e) { console.error(e); }
    }
    const savedBanco = localStorage.getItem('diario_coa_banco_data');
    if (savedBanco) {
      try { setBancoData(JSON.parse(savedBanco)); } catch (e) { console.error(e); }
    }

    const handleSync = () => {
      const updatedTime = localStorage.getItem('diario_coa_last_update');
      if (updatedTime) {
        setLastUpdateTime(updatedTime);
      }
      const updatedGerencial = localStorage.getItem('diario_coa_gerencial_data');
      if (updatedGerencial) {
        try { setGerencialData(JSON.parse(updatedGerencial)); } catch (e) { console.error(e); }
      }
      const updatedBanco = localStorage.getItem('diario_coa_banco_data');
      if (updatedBanco) {
        try { setBancoData(JSON.parse(updatedBanco)); } catch (e) { console.error(e); }
      }
    };
    window.addEventListener('diario_coa_updated', handleSync);
    return () => {
      window.removeEventListener('diario_coa_updated', handleSync);
    };
  }, []);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isTxt = file.name.endsWith('.txt');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const fileContent = evt.target?.result;
        let wb: any;

        if (isTxt) {
          wb = parseTxtContent(fileContent as string);
        } else {
          wb = XLSX.read(fileContent, { type: 'binary' });
        }

        let updatedGerencial = false;
        let updatedBanco = false;

        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rawRows = Array.isArray(ws) ? ws : XLSX.utils.sheet_to_json<any>(ws);
          if (rawRows.length === 0) return;

          const keys = Object.keys(rawRows[0]).map(k => k.toLowerCase().trim());
          const hasKeyMatching = (keywords: string[]) => keys.some(k => keywords.some(kw => k.includes(kw)));

          // Parse Acompanhamento Gerencial
          if (hasKeyMatching(['modalidade', 'frente']) && hasKeyMatching(['planej', 'realiz'])) {
            const mapped = rawRows.map((row: any) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              const parseNum = (val: any) => {
                if (typeof val === 'number') return val;
                if (typeof val === 'string') {
                  const clean = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
                  return parseFloat(clean) || 0;
                }
                return 0;
              };
              return {
                modalidade: String(find(['modalidade', 'tipo', 'operacao'], 'MAN/PRÓPRIO')).toUpperCase(),
                frente: String(find(['frente', 'frente_trabalho', 'frente trabalho', 'area'], '71-1')),
                dia: {
                  planej: parseNum(find(['dia_planej', 'dia planej', 'planej_dia', 'dia'], 0)),
                  realiz: parseNum(find(['dia_realiz', 'dia realiz', 'realiz_dia', 'realizado'], 0)),
                  chuva: parseNum(find(['dia_chuva', 'dia chuva', 'chuva_dia', 'chuva'], 0))
                },
                mes: {
                  planej: parseNum(find(['mes_planej', 'mes planej', 'planej_mes', 'mes'], 0)),
                  realiz: parseNum(find(['mes_realiz', 'mes realiz', 'realiz_mes', 'realizado'], 0)),
                  chuva: parseNum(find(['mes_chuva', 'mes chuva', 'chuva_mes', 'chuva'], 0))
                },
                acumulado: {
                  planej: parseNum(find(['acumulado_planej', 'acumulado planej', 'planej_acumulado', 'acumulado'], 0)),
                  realiz: parseNum(find(['acumulado_realiz', 'acumulado realiz', 'realiz_acumulado', 'realizado'], 0)),
                  chuva: parseNum(find(['acumulado_chuva', 'acumulado chuva', 'chuva_acumulado', 'chuva'], 0))
                }
              };
            });
            setGerencialData(mapped);
            localStorage.setItem('diario_coa_gerencial_data', JSON.stringify(mapped));
            updatedGerencial = true;
          }

          // Parse Banco de Áreas Master
          else if (hasKeyMatching(['talhao', 'variedade', 'area'])) {
            const mapped = rawRows.map((row: any, i: number) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              const parseNum = (val: any) => {
                if (typeof val === 'number') return val;
                if (typeof val === 'string') {
                  const clean = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
                  return parseFloat(clean) || 0;
                }
                return 0;
              };
              return {
                id: String(find(['id', 'codigo'], i + 1)),
                fazenda: String(find(['fazenda', 'propriedade'], '20008')),
                quadra: String(find(['quadra', 'gleba'], '1')),
                talhao: String(find(['talhao', 'talhão'], '1')),
                areaPlantio: parseNum(find(['area', 'area_plantio', 'hectares', 'tamanho'], 1.0)),
                sistemaPlantio: String(find(['sistema', 'sistema_plantio', 'tipo'], 'Mecanizado Convenc')),
                renovacao: String(find(['renovacao', 'renovação'], 'Renovação')),
                variedade: String(find(['variedade', 'cultivar'], 'CTC 3445')),
                flegPlantio: String(find(['fleg', 'fleg_plantio', 'status'], 'Plantio Normal')),
                plantioCco: parseNum(find(['cco', 'plantio_cco'], 0)),
                plantioPims: parseNum(find(['pims', 'plantio_pims'], 0)),
                statusArea: String(find(['status', 'status_area'], 'Á PLANTAR')).toUpperCase(),
                situacaoPlantio: String(find(['situacao', 'situacao_plantio'], 'A')),
                replantio: !!find(['replantio'], false),
                confSistPlantio: String(find(['conf_sist', 'conf_sist_plantio'], 'Ok')),
                confSistArea: String(find(['conf_sist_area'], 'ok-16/04/2026')),
                sistematizacao: parseNum(find(['sistematizacao', 'sistematização'], 1.0)),
                sulcacao: parseNum(find(['sulcacao', 'sulcação'], 0)),
                cobricao: parseNum(find(['cobricao', 'cobrição'], 0)),
                distribuicao: parseNum(find(['distribuicao', 'distribuição'], 0)),
                transporteMuda: parseNum(find(['transporte_muda', 'transporte muda'], 0)),
                carregamento: parseNum(find(['carregamento'], 0)),
                descarregamento: parseNum(find(['descarregamento'], 0)),
                corteMuda: parseNum(find(['corte_muda', 'corte muda'], 0)),
                transporteInsumos: parseNum(find(['transporte_insumos', 'transporte insumos'], 0)),
                apoio: parseNum(find(['apoio'], 0)),
                tampacao: parseNum(find(['tampacao', 'tampação'], 0)),
                quebraLombo: parseNum(find(['quebra_lombo', 'quebra lombo'], 0)),
                aplicHerbicida: parseNum(find(['aplic_herbicida', 'herbicida'], 0)),
              };
            });
            setBancoData(mapped);
            localStorage.setItem('diario_coa_banco_data', JSON.stringify(mapped));
            updatedBanco = true;
          }
        });

        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        localStorage.setItem('diario_coa_last_update', formattedDate);
        setLastUpdateTime(formattedDate);
        
        window.dispatchEvent(new Event('diario_coa_updated'));

        if (onAddLog) {
          onAddLog('Boletim', 'Importação', `Nova planilha / arquivo importado por luizricardocarvalhod@gmail.com - Atualizado em ${formattedDate}`);
        }

        let msg = `Sucesso! Sincronização de arquivos efetuada.`;
        if (updatedGerencial) msg += ` (Acompanhamento Gerencial atualizado)`;
        if (updatedBanco) msg += ` (Banco de Áreas Master atualizado)`;
        alert(`${msg}\nHorário de sincronização definido para ${formattedDate}`);
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar o arquivo. Certifique-se que o formato está correto.');
      }
    };

    if (isTxt) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsBinaryString(file);
    }
  };
  
  // State for Editing Area
  const [editingArea, setEditingArea] = useState<AreaRecord | null>(null);
  
  // Filter for master database
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sistemaFilter, setSistemaFilter] = useState<string>('ALL');

  // --- Initial Mock Data representing Palestine 2026 Excel System ---

  // 1. Acompanhamento Gerencial Dashboard Data
  const [gerencialData, setGerencialData] = useState<GerencialRow[]>([
    {
      modalidade: 'MAN/PRÓPRIO',
      frente: '71-1',
      dia: { planej: 0.00, realiz: 0.00, chuva: 0 },
      mes: { planej: 396.90, realiz: 406.29, chuva: 351 },
      acumulado: { planej: 391.89, realiz: 406.29, chuva: 351 }
    },
    {
      modalidade: 'MEC/PRÓPRIO',
      frente: '72-1',
      dia: { planej: 0.36, realiz: 4.70, chuva: 0 },
      mes: { planej: 3010.27, realiz: 3017.82, chuva: 479 },
      acumulado: { planej: 3000.61, realiz: 3017.82, chuva: 479 }
    },
    {
      modalidade: 'MEC/PRÓPRIO',
      frente: '72-2',
      dia: { planej: 0.00, realiz: 0.00, chuva: 0 },
      mes: { planej: 1183.35, realiz: 1180.40, chuva: 517 },
      acumulado: { planej: 1166.54, realiz: 1178.40, chuva: 517 }
    },
    {
      modalidade: 'MEC/PRÓPRIO',
      frente: '72-3',
      dia: { planej: 0.00, realiz: 0.00, chuva: 0 },
      mes: { planej: 601.37, realiz: 598.92, chuva: 523 },
      acumulado: { planej: 598.29, realiz: 598.92, chuva: 523 }
    }
  ]);

  // General KPIs metadata
  const metaDoMes = 10.8;
  const realizadoMes = 5203.43;
  const noMesHectaresAdiantados = 11.54;
  const acumuladoHectaresAdiantados = 44.10;

  // 2. Banco Atualizado (Master Areas DB) Mock Data
  const [bancoData, setBancoData] = useState<AreaRecord[]>([
    {
      id: '1',
      fazenda: '20008',
      quadra: '1',
      talhao: '1',
      areaPlantio: 1.21,
      sistemaPlantio: 'Mecanizado Convenc',
      renovacao: 'Renovação',
      variedade: 'CTC 3445',
      flegPlantio: 'Plantio Normal',
      plantioCco: 0.00,
      plantioPims: 0.00,
      statusArea: 'Á PLANTAR',
      situacaoPlantio: 'A',
      replantio: false,
      confSistPlantio: 'Ok',
      confSistArea: 'ok-16/04/2026',
      sistematizacao: 1.21,
      sulcacao: 0, cobricao: 0, distribuicao: 0, transporteMuda: 0, carregamento: 0,
      descarregamento: 0, corteMuda: 0, transporteInsumos: 0, apoio: 0, tampacao: 0,
      quebraLombo: 0, aplicHerbicida: 0
    },
    {
      id: '2',
      fazenda: '20008',
      quadra: '1',
      talhao: '2',
      areaPlantio: 3.08,
      sistemaPlantio: 'Mecanizado Convenc',
      renovacao: 'Renovação',
      variedade: 'CTC 3445',
      flegPlantio: 'Plantio Normal',
      plantioCco: 0.00,
      plantioPims: 0.00,
      statusArea: 'Á PLANTAR',
      situacaoPlantio: 'A',
      replantio: false,
      confSistPlantio: 'Ok',
      confSistArea: 'ok-16/04/2026',
      sistematizacao: 3.08,
      sulcacao: 0, cobricao: 0, distribuicao: 0, transporteMuda: 0, carregamento: 0,
      descarregamento: 0, corteMuda: 0, transporteInsumos: 0, apoio: 0, tampacao: 0,
      quebraLombo: 0, aplicHerbicida: 0
    },
    {
      id: '3',
      fazenda: '20008',
      quadra: '1',
      talhao: '3',
      areaPlantio: 1.84,
      sistemaPlantio: 'Mecanizado Convenc',
      renovacao: 'Renovação',
      variedade: 'CTC 3445',
      flegPlantio: 'Plantio Normal',
      plantioCco: 0.00,
      plantioPims: 0.00,
      statusArea: 'Á PLANTAR',
      situacaoPlantio: 'A',
      replantio: false,
      confSistPlantio: 'Ok',
      confSistArea: 'ok-16/04/2026',
      sistematizacao: 1.84,
      sulcacao: 0, cobricao: 0, distribuicao: 0, transporteMuda: 0, carregamento: 0,
      descarregamento: 0, corteMuda: 0, transporteInsumos: 0, apoio: 0, tampacao: 0,
      quebraLombo: 0, aplicHerbicida: 0
    },
    {
      id: '4',
      fazenda: '20239',
      quadra: '1',
      talhao: '3',
      areaPlantio: 8.12,
      sistemaPlantio: 'Mecanizado Convenc',
      renovacao: 'Renovação',
      variedade: 'RB 97 5242',
      flegPlantio: 'Plantio Normal',
      plantioCco: 8.12,
      plantioPims: 8.12,
      statusArea: 'PLANTIO FECHADO',
      situacaoPlantio: 'A',
      replantio: false,
      confSistPlantio: 'Ok',
      confSistArea: 'ok-19/09/2025',
      sistematizacao: 8.12,
      sulcacao: 7.65, cobricao: 8.12, distribuicao: 8.12, transporteMuda: 8.12, carregamento: 8.12,
      descarregamento: 8.12, corteMuda: 8.12, transporteInsumos: 8.12, apoio: 8.12, tampacao: 8.12,
      quebraLombo: 8.12, aplicHerbicida: 8.12
    },
    {
      id: '5',
      fazenda: '20239',
      quadra: '1',
      talhao: '4',
      areaPlantio: 6.64,
      sistemaPlantio: 'Mecanizado Convenc',
      renovacao: 'Renovação',
      variedade: 'RB 97 5242',
      flegPlantio: 'Plantio Normal',
      plantioCco: 2.48,
      plantioPims: 2.48,
      statusArea: 'PLANTANDO',
      situacaoPlantio: 'A',
      replantio: false,
      confSistPlantio: 'Ok',
      confSistArea: 'Verificar-16/04/2026',
      sistematizacao: 5.83,
      sulcacao: 2.48, cobricao: 2.48, distribuicao: 2.48, transporteMuda: 2.48, carregamento: 2.48,
      descarregamento: 2.48, corteMuda: 2.48, transporteInsumos: 2.48, apoio: 2.48, tampacao: 2.48,
      quebraLombo: 0, aplicHerbicida: 2.48
    },
    {
      id: '6',
      fazenda: '20301',
      quadra: '1',
      talhao: '21',
      areaPlantio: 0.66,
      sistemaPlantio: 'Meiosi Desdobra',
      renovacao: 'Renovação',
      variedade: 'CTC 9003',
      flegPlantio: 'Plantio Normal',
      plantioCco: 0.52,
      plantioPims: 0.52,
      statusArea: 'PLANTANDO',
      situacaoPlantio: 'A',
      replantio: true,
      confSistPlantio: 'Ok',
      confSistArea: 'ok-11/05/2025',
      sistematizacao: 0.77,
      sulcacao: 0.66, cobricao: 0.52, distribuicao: 0.52, transporteMuda: 0, carregamento: 0,
      descarregamento: 0, corteMuda: 0, transporteInsumos: 0, apoio: 0, tampacao: 0.52,
      quebraLombo: 0, aplicHerbicida: 0.52
    }
  ]);

  // 3. Boletim Diário shift data
  const [shiftRecords, setShiftRecords] = useState<ShiftRecord[]>([
    {
      turno: 'TURNO A',
      horario: '00:00 as 10:00',
      plantio: 0.00,
      chuva: 0,
      viagens: 0,
      muda: 0.00,
      rendimento: 0.00,
      pessoas: 0,
      hecPessoas: 0,
      status: 'NÃO TRABALHOU'
    },
    {
      turno: 'TURNO B',
      horario: '10:00 as 14:00',
      plantio: 4.70,
      chuva: 0,
      viagens: 12,
      muda: 8.50,
      rendimento: 3.25,
      pessoas: 15,
      hecPessoas: 0.31,
      status: 'TRABALHOU'
    },
    {
      turno: 'TURNO C',
      horario: '14:00 as 00:00',
      plantio: 0.00,
      chuva: 15,
      viagens: 0,
      muda: 0.00,
      rendimento: 0.00,
      pessoas: 0,
      hecPessoas: 0,
      status: 'NÃO TRABALHOU'
    }
  ]);

  React.useEffect(() => {
    const savedGerencial = localStorage.getItem('gestao_areas_gerencial');
    if (savedGerencial) {
      try { setGerencialData(JSON.parse(savedGerencial)); } catch (e) {}
    }
    const savedBanco = localStorage.getItem('gestao_areas_banco');
    if (savedBanco) {
      try { setBancoData(JSON.parse(savedBanco)); } catch (e) {}
    }
    const savedBoletim = localStorage.getItem('gestao_areas_boletim');
    if (savedBoletim) {
      try { setShiftRecords(JSON.parse(savedBoletim)); } catch (e) {}
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('gestao_areas_gerencial', JSON.stringify(gerencialData));
  }, [gerencialData]);

  React.useEffect(() => {
    localStorage.setItem('gestao_areas_banco', JSON.stringify(bancoData));
  }, [bancoData]);

  React.useEffect(() => {
    localStorage.setItem('gestao_areas_boletim', JSON.stringify(shiftRecords));
  }, [shiftRecords]);

  React.useEffect(() => {
    const unique = Array.from(new Set(bancoData.map(b => b.fazenda)));
    if (unique.length > 0 && !unique.includes(launchFazenda)) {
      setLaunchFazenda(unique[0]);
    }
  }, [bancoData, launchFazenda]);

  React.useEffect(() => {
    const uniqueQ = Array.from(new Set(bancoData.filter(b => b.fazenda === launchFazenda).map(b => b.quadra)));
    if (uniqueQ.length > 0 && !uniqueQ.includes(launchQuadra)) {
      setLaunchQuadra(uniqueQ[0]);
    }
  }, [launchFazenda, bancoData, launchQuadra]);

  React.useEffect(() => {
    const matching = bancoData.filter(b => 
      b.fazenda === launchFazenda &&
      b.quadra === launchQuadra &&
      b.sistemaPlantio === launchSistema &&
      b.statusArea !== 'PLANTIO FECHADO'
    );
    if (launchTalhao !== 'ALL' && !matching.some(m => m.talhao === launchTalhao)) {
      setLaunchTalhao('ALL');
    }
  }, [launchFazenda, launchQuadra, launchSistema, bancoData, launchTalhao]);

  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newArea, setNewArea] = useState<Partial<AreaRecord>>({
    fazenda: '',
    quadra: '',
    talhao: '',
    areaPlantio: 0,
    sistemaPlantio: 'Mecanizado Convenc',
    variedade: 'CTC 3445',
    flegPlantio: 'Plantio Normal',
    statusArea: 'Á PLANTAR',
    situacaoPlantio: 'A',
    replantio: false
  });

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AreaRecord = {
      id: String(bancoData.length + 1),
      fazenda: newArea.fazenda || '20000',
      quadra: newArea.quadra || '1',
      talhao: newArea.talhao || '1',
      areaPlantio: Number(newArea.areaPlantio) || 1.0,
      sistemaPlantio: newArea.sistemaPlantio as any || 'Mecanizado Convenc',
      renovacao: 'Renovação',
      variedade: newArea.variedade || 'CTC 3445',
      flegPlantio: 'Plantio Normal',
      plantioCco: 0,
      plantioPims: 0,
      statusArea: newArea.statusArea as any || 'Á PLANTAR',
      situacaoPlantio: 'A',
      replantio: !!newArea.replantio,
      confSistPlantio: 'Ok',
      confSistArea: 'Pendente',
      sistematizacao: 0,
      sulcacao: 0, cobricao: 0, distribuicao: 0, transporteMuda: 0, carregamento: 0,
      descarregamento: 0, corteMuda: 0, transporteInsumos: 0, apoio: 0, tampacao: 0,
      quebraLombo: 0, aplicHerbicida: 0
    };

    setBancoData([created, ...bancoData]);
    if (onAddLog) {
      onAddLog(
        'Cadastro',
        'Área Cadastrada',
        `Nova área de plantio cadastrada no Master Plan: Fazenda ${created.fazenda} - Quadra ${created.quadra} - Talhão ${created.talhao} (${created.areaPlantio} ha, Variedade ${created.variedade}, Sistema ${created.sistemaPlantio}).`
      );
    }
    setIsAddingArea(false);
    setNewArea({
      fazenda: '',
      quadra: '',
      talhao: '',
      areaPlantio: 0,
      sistemaPlantio: 'Mecanizado Convenc',
      variedade: 'CTC 3445',
      flegPlantio: 'Plantio Normal',
      statusArea: 'Á PLANTAR',
      situacaoPlantio: 'A',
      replantio: false
    });
  };

  const toggleCheck = (id: string, field: keyof AreaRecord) => {
    setBancoData(bancoData.map(item => {
      if (item.id === id) {
        const val = item[field];
        if (typeof val === 'number') {
          const nextVal = val === 0 ? item.areaPlantio : 0;
          if (onAddLog) {
            onAddLog(
              'Status',
              'Preparo de Solo',
              `Etapa de solo '${field}' atualizada para ${nextVal > 0 ? 'CONCLUÍDA' : 'PENDENTE'} na Fazenda ${item.fazenda} - Talhão ${item.talhao}.`
            );
          }
          return {
            ...item,
            [field]: nextVal
          };
        }
      }
      return item;
    }));
  };

  const handleStatusChange = (id: string, newStatus: 'Á PLANTAR' | 'PLANTANDO' | 'PLANTIO FECHADO') => {
    setBancoData(bancoData.map(item => {
      if (item.id === id) {
        if (onAddLog && item.statusArea !== newStatus) {
          onAddLog(
            'Status',
            'Alteação de Status',
            `Status da área Fazenda ${item.fazenda} - Talhão ${item.talhao} alterado para '${newStatus}' (Área total: ${item.areaPlantio} ha).`
          );
        }
        return {
          ...item,
          statusArea: newStatus,
          plantioCco: newStatus === 'PLANTIO FECHADO' ? item.areaPlantio : newStatus === 'PLANTANDO' ? item.areaPlantio / 2 : 0,
          plantioPims: newStatus === 'PLANTIO FECHADO' ? item.areaPlantio : newStatus === 'PLANTANDO' ? item.areaPlantio / 2 : 0
        };
      }
      return item;
    }));
  };

  const handleDeleteArea = (id: string) => {
    const item = bancoData.find(b => b.id === id);
    if (!item) return;
    setBancoData(bancoData.filter(b => b.id !== id));
    if (onAddLog) {
      onAddLog(
        'Auditoria',
        'Área Excluída',
        `Área excluída do Banco: Fazenda ${item.fazenda} - Quadra ${item.quadra} - Talhão ${item.talhao} (${item.areaPlantio} ha, Variedade ${item.variedade}, Sistema ${item.sistemaPlantio}).`
      );
    }
  };

  const handleEditAreaSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;

    setBancoData(bancoData.map(item => {
      if (item.id === editingArea.id) {
        if (onAddLog) {
          onAddLog(
            'Cadastro',
            'Área Atualizada',
            `Informações da área ID ${item.id} (Fazenda ${editingArea.fazenda}, Talhão ${editingArea.talhao}) foram atualizadas pelo usuário via painel de edição.`
          );
        }
        return {
          ...editingArea,
          plantioPims: editingArea.plantioCco
        };
      }
      return item;
    }));

    setEditingArea(null);
  };

  const handleDeleteGerencialRow = (frente: string) => {
    const item = gerencialData.find(g => g.frente === frente);
    if (!item) return;
    setGerencialData(gerencialData.filter(row => row.frente !== frente));
    if (onAddLog) {
      onAddLog(
        'Auditoria',
        'Frente Excluída',
        `Frente de trabalho de plantio ${frente} foi excluída dos relatórios gerenciais.`
      );
    }
  };

  const handleLaunchPlantio = () => {
    if (!launchHectares || launchHectares <= 0) {
      alert("Por favor, insira uma quantidade de hectares válida.");
      return;
    }

    setIsOptimizing(true);
    setTimeout(() => {
      // Find matching candidates based on Farm, Block/Quadra, and System
      let candidates = bancoData.filter(item => 
        item.fazenda === launchFazenda &&
        item.quadra === launchQuadra &&
        item.sistemaPlantio === launchSistema &&
        item.statusArea !== 'PLANTIO FECHADO'
      );

      // If a specific talhão is chosen (not 'ALL'), filter by it
      if (launchTalhao !== 'ALL') {
        candidates = candidates.filter(item => item.talhao === launchTalhao);
      }

      if (candidates.length === 0) {
        alert(`Nenhuma área em aberto foi encontrada na Fazenda ${launchFazenda}, Quadra ${launchQuadra}, no Sistema ${launchSistema}. Verifique se o sistema de plantio está correto ou crie uma nova área correspondente.`);
        setIsOptimizing(false);
        return;
      }

      let remainingToAllocate = launchHectares;
      let totalAllocated = 0;

      const updatedBanco = bancoData.map(item => {
        const isCandidate = candidates.some(c => c.id === item.id);
        if (isCandidate && remainingToAllocate > 0) {
          const maxPossible = item.areaPlantio - item.plantioCco;
          if (maxPossible <= 0) return item; // already 100%

          const alloc = Math.min(maxPossible, remainingToAllocate);
          const nextPlantio = item.plantioCco + alloc;
          remainingToAllocate -= alloc;
          totalAllocated += alloc;

          // Reach 100% and really mark as fully planted (PLANTIO FECHADO)
          // only when total accumulated launched hectares equals total hectares of that area
          const isClosed = nextPlantio >= item.areaPlantio;

          if (onAddLog) {
            onAddLog(
              'Status',
              'Plantio Lançado',
              `Frente ${launchFrente} realizou ${alloc.toFixed(2)} ha na Fazenda ${item.fazenda}, Quadra ${item.quadra}, Talhão ${item.talhao} (${item.sistemaPlantio}). Progresso: ${nextPlantio.toFixed(2)}/${item.areaPlantio.toFixed(2)} ha (${((nextPlantio/item.areaPlantio)*100).toFixed(0)}%).`
            );
          }

          return {
            ...item,
            plantioCco: parseFloat(nextPlantio.toFixed(2)),
            plantioPims: parseFloat(nextPlantio.toFixed(2)),
            statusArea: (isClosed ? 'PLANTIO FECHADO' : 'PLANTANDO') as any,
            turno: launchTurno,
            chuvaMm: launchChuva,
            dataHora: launchDataHora.replace('T', ' ')
          };
        }
        return item;
      });

      setBancoData(updatedBanco);
      setIsOptimizing(false);

      if (totalAllocated > 0) {
        alert(`Lançamento de plantio efetuado com sucesso!\n\nFoi alocado um total de ${totalAllocated.toFixed(2)} ha na Frente ${launchFrente}, Fazenda ${launchFazenda}, Quadra ${launchQuadra}.\nOs talhões foram atualizados com sucesso.`);
        if (remainingToAllocate > 0) {
          alert(`Aviso: Sobraram ${remainingToAllocate.toFixed(2)} ha que excederam o limite planejado de hectares para a área.`);
        }
      } else {
        alert("Não foi possível alocar hectares. A área selecionada pode já estar 100% concluída (PLANTIO FECHADO).");
      }
    }, 800);
  };

  // Filter master DB data
  const filteredBanco = bancoData.filter(item => {
    const matchesSearch = item.fazenda.includes(searchTerm) || 
                          item.variedade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.talhao.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || item.statusArea === statusFilter;
    const matchesSistema = sistemaFilter === 'ALL' || item.sistemaPlantio === sistemaFilter;
    return matchesSearch && matchesStatus && matchesSistema;
  });

  return (
    <div className="space-y-6 w-full text-left" onClick={(e) => e.stopPropagation()}>
      {/* HEADER CARD */}
      <div className="bg-white p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3.5 hover:bg-gray-100 active:scale-95 text-gray-500 hover:text-[#00843D] rounded-2xl border border-gray-200 bg-white transition-all shadow-sm flex items-center justify-center shrink-0"
              title="Voltar para Plantio"
            >
              <ArrowLeft size={18} className="stroke-[3px]" />
            </button>
          )}
          <div className="w-16 h-16 bg-[#00843D]/10 rounded-2xl flex items-center justify-center text-[#00843D] shadow-inner shrink-0">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Gestão de Áreas &amp; Planejamento</h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
              Painel Integrado de Controle de Plantio, Auditoria PIMS e Conferência de Frentes
            </p>
          </div>
        </div>

        {/* SYSTEM SUB NAVIGATION & UPDATE CONTROLS */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <button 
              onClick={() => setSubTab('gerencial')}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                subTab === 'gerencial' 
                  ? 'bg-[#00843D] text-white shadow-md shadow-green-900/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={14} />
              Acompanhamento Gerencial
            </button>
            
            <button 
              onClick={() => setSubTab('banco')}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                subTab === 'banco' 
                  ? 'bg-[#00843D] text-white shadow-md shadow-green-900/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Table size={14} />
              Central de Áreas
            </button>

            <button 
              onClick={() => setSubTab('boletim')}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                subTab === 'boletim' 
                  ? 'bg-[#00843D] text-white shadow-md shadow-green-900/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ClipboardList size={14} />
              Boletim de Operação
            </button>

            <button 
              onClick={() => setSubTab('pims')}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                subTab === 'pims' 
                  ? 'bg-[#00843D] text-white shadow-md shadow-green-900/10' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowRightLeft size={14} />
              Controle vs PIMS
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#00843D]/5 border border-[#00843D]/10 px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black text-gray-700 tracking-tight uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00843D]"></span>
              </span>
              <span>Atualizado em: <span className="text-[#00843D]" translate="no">{lastUpdateTime}</span></span>
            </div>
            
            <label className="bg-green-700 hover:bg-[#00843D] active:scale-95 text-white font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 border border-green-800 transition-all shadow-sm">
              <FileSpreadsheet size={12} />
              <span>Importar Planilha</span>
              <input 
                type="file" 
                accept=".xlsx, .xls, .txt" 
                onChange={handleExcelImport} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      </div>

      {/* SUB TAB: ACOMPANHAMENTO GERENCIAL */}
      {subTab === 'gerencial' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* TOP EXCEL KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm border-l-4 border-[#00843D]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meta do Mês</p>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-3xl font-black text-gray-900">{metaDoMes} ha</span>
                <span className="text-xs font-bold text-gray-400">Palestina 2026</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm border-l-4 border-emerald-600">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Realizado Total</p>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-3xl font-black text-[#00843D]">{realizadoMes.toLocaleString('pt-BR')} ha</span>
                <span className="bg-green-100 text-[#00843D] text-[9px] font-black uppercase px-2.5 py-1 rounded-full">97.5%</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm border-l-4 border-emerald-500">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hectares Adiantados (Mês)</p>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-3xl font-black text-emerald-600">+{noMesHectaresAdiantados} ha</span>
                <span className="text-xs font-bold text-[#00843D]">Dentro da Meta</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm border-l-4 border-teal-600">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hectares Adiantados (Acumulado)</p>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-3xl font-black text-teal-600">+{acumuladoHectaresAdiantados} ha</span>
                <span className="text-xs font-bold text-teal-600">Consolidado</span>
              </div>
            </div>
          </div>

          {/* MAIN MANAGEMENT TABLE CONTAINER */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Boletim de Acompanhamento Gerencial</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Acompanhamento diário e acumulado por Modalidade e Frente</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-green-50 text-[#00843D] border border-green-100 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                  <TrendingUp size={14} />
                  Plano Consolidado 2026
                </span>
                <button
                  onClick={() => setZoomedSectionId('gerencial')}
                  className="p-2.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-xl border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                  title="Expandir Painel"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* EXCEL STYLED COMPARATIVE GRID */}
            <div className="overflow-x-auto rounded-[20px] border border-gray-100 shadow-inner">
              <table className="w-full border-collapse text-left text-xs min-w-[800px]">
                <thead>
                  <tr className="bg-[#00843D] text-white font-bold uppercase tracking-wider border-b border-[#005B2B]">
                    <th colSpan={2} className="px-6 py-4 border-r border-[#005B2B] bg-[#005B2B] text-center text-[10px]">Identificação</th>
                    <th colSpan={4} className="px-6 py-4 border-r border-[#005B2B] bg-green-800/20 text-center text-[10px]">Dia (02/06/2026)</th>
                    <th colSpan={4} className="px-6 py-4 border-r border-[#005B2B] bg-green-700/20 text-center text-[10px]">Mês</th>
                    <th colSpan={4} className="px-6 py-4 bg-green-600/20 text-center text-[10px]">Acumulado</th>
                  </tr>
                  <tr className="bg-[#005B2B] text-white font-bold uppercase text-[9px] tracking-wider border-b border-green-700">
                    <th className="px-6 py-3.5 border-r border-green-700">Modalidade</th>
                    <th className="px-6 py-3.5 border-r border-green-700">Frente</th>
                    <th className="px-4 py-3.5 bg-green-800/10 text-white">Planej. (ha)</th>
                    <th className="px-4 py-3.5 bg-green-800/10 text-white">Realiz. (ha)</th>
                    <th className="px-4 py-3.5 bg-green-800/10 text-white text-center">% Realiz.</th>
                    <th className="px-4 py-3.5 bg-green-800/10 text-white border-r border-green-700 text-center">Chuva (mm)</th>
                    
                    <th className="px-4 py-3.5 bg-green-700/10 text-white">Planej. (ha)</th>
                    <th className="px-4 py-3.5 bg-green-700/10 text-white">Realiz. (ha)</th>
                    <th className="px-4 py-3.5 bg-green-700/10 text-white text-center">% Realiz.</th>
                    <th className="px-4 py-3.5 bg-green-700/10 text-white border-r border-green-700 text-center">Chuva (mm)</th>

                    <th className="px-4 py-3.5 bg-green-600/10 text-white">Planej. (ha)</th>
                    <th className="px-4 py-3.5 bg-green-600/10 text-white">Realiz. (ha)</th>
                    <th className="px-4 py-3.5 bg-green-600/10 text-white text-center">% Realiz.</th>
                    <th className="px-4 py-3.5 bg-green-600/10 text-white text-center">Chuva (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold">
                  {gerencialData.map((row, idx) => {
                    const diaPct = row.dia.planej > 0 ? (row.dia.realiz / row.dia.planej) * 100 : 0;
                    const mesPct = row.mes.planej > 0 ? (row.mes.realiz / row.mes.planej) * 100 : 0;
                    const acPct = row.acumulado.planej > 0 ? (row.acumulado.realiz / row.acumulado.planej) * 100 : 0;

                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 border-r border-gray-100 text-gray-900 uppercase text-[10px]">{row.modalidade}</td>
                        <td className="px-6 py-4 border-r border-gray-100 text-[#00843D] text-sm font-black">
                          <div className="flex items-center justify-between gap-2 group/frente">
                            <span>{row.frente}</span>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Deseja realmente remover a Frente ${row.frente} de seus controles gerenciais?`)) {
                                  handleDeleteGerencialRow(row.frente);
                                }
                              }}
                              className="opacity-0 group-hover/frente:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all cursor-pointer"
                              title="Remover Frente"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                        
                        {/* Dia */}
                        <td className="px-4 py-4 text-gray-500 bg-green-50/5">{row.dia.planej.toFixed(2)}</td>
                        <td className="px-4 py-4 text-gray-900 bg-green-50/5">{row.dia.realiz.toFixed(2)}</td>
                        <td className="px-4 py-4 text-center bg-green-50/5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase ${getStatusTextColor(diaPct)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(diaPct)}`} />
                            {diaPct > 0 ? `${diaPct.toFixed(1)}%` : '0.0%'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-emerald-600 bg-green-50/5 border-r border-gray-100">{row.dia.chuva} mm</td>

                        {/* Mês */}
                        <td className="px-4 py-4 text-gray-500 bg-green-50/10">{row.mes.planej.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-4 text-gray-900 bg-green-50/10">{row.mes.realiz.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-4 text-center bg-green-50/10">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase ${getStatusTextColor(mesPct)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(mesPct)}`} />
                            {mesPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-emerald-700 bg-green-50/10 border-r border-gray-100">{row.mes.chuva} mm</td>

                        {/* Acumulado */}
                        <td className="px-4 py-4 text-gray-500 bg-green-50/20">{row.acumulado.planej.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-4 text-gray-900 bg-green-50/20">{row.acumulado.realiz.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        <td className="px-4 py-4 text-center bg-green-50/20">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-black uppercase ${getStatusTextColor(acPct)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(acPct)}`} />
                            {acPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-emerald-800 bg-green-50/20">{row.acumulado.chuva} mm</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* EXCEL SUMMARY BOXES AT BOTTOM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-green-50/30 p-6 rounded-2xl border border-green-100">
                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-3">Resumo de Metas Operacionais</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-emerald-900">
                    <span>Meta Diária Estimada:</span>
                    <span className="font-black">0.40 ha / Frente</span>
                  </div>
                  <div className="flex justify-between text-emerald-900">
                    <span>Situação do Dia:</span>
                    <span className="font-black text-green-600">Atingido (4.70 ha Realizado)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#00843D]/5 p-6 rounded-2xl border border-green-100">
                <h4 className="text-xs font-black text-green-800 uppercase tracking-widest mb-3">Alertas Logísticos do Dia</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-green-900">
                    <span>Atrasos Críticos:</span>
                    <span className="font-black text-red-600">Nenhum</span>
                  </div>
                  <div className="flex justify-between text-green-900">
                    <span>Discrepâncias de Viagem (Controle vs PIMS):</span>
                    <span className="font-black text-emerald-600">Frente 72-1 (+0.07 ha variação)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: BANCO DE ÁREAS (MASTER PLANTING PLAN) */}
      {subTab === 'banco' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* PAINEL DE LANÇAMENTO E DIRECIONAMENTO INTELIGENTE DE PLANTIO */}
          <div className="bg-gradient-to-r from-[#003B1C] via-[#005B2B] to-[#00843D] p-8 rounded-[32px] text-white space-y-6 shadow-lg shadow-green-950/15 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-24 translate-x-24 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Tractor size={10} className="animate-pulse" /> Registro Operacional Ativo
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Lançador de Execução e Direcionador de Plantio</h3>
                <p className="text-green-100 text-xs font-medium uppercase tracking-wider">
                  Insira os hectares realizados, frentes operacionais e talhão correspondente para consolidar a execução e avançar o progresso até 100%.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4 items-end">
              {/* 1. HECTARES */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Hectares Realizados</label>
                <div className="relative">
                  <Tractor className="absolute left-4 top-3.5 text-emerald-300" size={14} />
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/30"
                    placeholder="Ex: 3.50"
                    value={launchHectares || ''}
                    onChange={(e) => setLaunchHectares(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* 2. FRENTE QUE FOI */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Frente de Trabalho</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:text-gray-900"
                  value={launchFrente}
                  onChange={(e) => setLaunchFrente(e.target.value)}
                >
                  {Array.from(new Set(gerencialData.map(g => g.frente))).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                  <option value="Outra">Outra Frente</option>
                </select>
              </div>

              {/* 3. FAZENDA */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Fazenda</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:text-gray-900"
                  value={launchFazenda}
                  onChange={(e) => setLaunchFazenda(e.target.value)}
                >
                  {Array.from(new Set(bancoData.map(b => b.fazenda))).map(fz => (
                    <option key={fz} value={fz}>Fz. {fz}</option>
                  ))}
                </select>
              </div>

              {/* 4. QUADRA */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Quadra</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:text-gray-900"
                  value={launchQuadra}
                  onChange={(e) => setLaunchQuadra(e.target.value)}
                >
                  {Array.from(new Set(bancoData.filter(b => b.fazenda === launchFazenda).map(b => b.quadra))).map(q => (
                    <option key={q} value={q}>Q. {q}</option>
                  ))}
                </select>
              </div>

              {/* 5. SISTEMA DE PLANTIO */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Sistema de Plantio</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:text-gray-900"
                  value={launchSistema}
                  onChange={(e) => setLaunchSistema(e.target.value as any)}
                >
                  <option value="Mecanizado Convenc">Mecanizado Convenc</option>
                  <option value="Meiosi Desdobra">Meiosi Desdobra</option>
                  <option value="Manual Convenc">Manual Convenc</option>
                </select>
              </div>

              {/* 6. TALHÃO */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Talhão (Área Alvo)</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:text-gray-900"
                  value={launchTalhao}
                  onChange={(e) => setLaunchTalhao(e.target.value)}
                >
                  <option value="ALL">Todos (Distribuir)</option>
                  {bancoData
                    .filter(b => b.fazenda === launchFazenda && b.quadra === launchQuadra && b.sistemaPlantio === launchSistema && b.statusArea !== 'PLANTIO FECHADO')
                    .map(t => (
                      <option key={t.id} value={t.talhao}>Talhão {t.talhao} ({t.variedade})</option>
                    ))
                  }
                </select>
              </div>

              {/* 7. TURNO */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Turno</label>
                <select 
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 [&>option]:text-gray-900"
                  value={launchTurno}
                  onChange={(e) => setLaunchTurno(e.target.value as any)}
                >
                  <option value="TURNO A">Turno A</option>
                  <option value="TURNO B">Turno B</option>
                  <option value="TURNO C">Turno C</option>
                </select>
              </div>

              {/* 8. CHUVA */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Chuva (mm)</label>
                <div className="relative">
                  <Droplet className="absolute left-4 top-3.5 text-emerald-300" size={14} />
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/30"
                    placeholder="0.0 mm"
                    value={launchChuva || ''}
                    onChange={(e) => setLaunchChuva(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* 9. DATA E HORA */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[10px] text-green-200 font-bold uppercase tracking-wider block">Data e Hora</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 text-emerald-300" size={14} />
                  <input 
                    type="datetime-local" 
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl font-bold text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 select-none [&::-webkit-calendar-picker-indicator]:invert"
                    value={launchDataHora}
                    onChange={(e) => setLaunchDataHora(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <div className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">
                * Áreas atingem 100% e são fechadas automaticamente quando a somatória de lançamentos atinge o total de hectares.
              </div>
              <button 
                onClick={handleLaunchPlantio}
                disabled={isOptimizing}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-white py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-green-950/20 cursor-pointer"
              >
                <Sparkles size={14} className={isOptimizing ? "animate-spin" : ""} />
                {isOptimizing ? "Processando..." : "Lançar e Atualizar Área"}
              </button>
            </div>
          </div>
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por Fazenda, Talhão ou Variedade (ex: CTC 3445)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#00843D] outline-none"
              />
            </div>

            <div className="flex gap-3 flex-wrap w-full md:w-auto">
              {/* Status Filter */}
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase outline-none bg-white text-gray-700"
              >
                <option value="ALL">Todos os Status</option>
                <option value="Á PLANTAR">Á Plantar</option>
                <option value="PLANTANDO">Plantando</option>
                <option value="PLANTIO FECHADO">Plantio Fechado</option>
              </select>

              {/* Sistema Filter */}
              <select 
                value={sistemaFilter}
                onChange={(e) => setSistemaFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 text-xs font-black uppercase outline-none bg-white text-gray-700"
              >
                <option value="ALL">Todos os Sistemas</option>
                <option value="Mecanizado Convenc">Mecanizado Convenc</option>
                <option value="Meiosi Desdobra">Meiosi Desdobra</option>
                <option value="Manual Convenc">Manual Convenc</option>
              </select>

              <button 
                onClick={() => setIsAddingArea(true)}
                className="bg-[#00843D] hover:bg-[#006B32] text-white px-5 py-3 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-green-900/10"
              >
                <Plus size={14} />
                Nova Área
              </button>
            </div>
          </div>

          {/* ADD AREA FORM MODAL */}
          {isAddingArea && (
            <div className="bg-white p-8 rounded-[32px] border-2 border-[#00843D]/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-black text-gray-900 uppercase">Inserir Nova Área de Plantio</h3>
              <form onSubmit={handleAddArea} className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Fazenda</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: 20008"
                    value={newArea.fazenda}
                    onChange={(e) => setNewArea({...newArea, fazenda: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Quadra</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: 1"
                    value={newArea.quadra}
                    onChange={(e) => setNewArea({...newArea, quadra: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Talhão</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: 12"
                    value={newArea.talhao}
                    onChange={(e) => setNewArea({...newArea, talhao: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Área Plantio (Hectares)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="ex: 4.5"
                    value={newArea.areaPlantio || ''}
                    onChange={(e) => setNewArea({...newArea, areaPlantio: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Sistema de Plantio</label>
                  <select 
                    value={newArea.sistemaPlantio}
                    onChange={(e) => setNewArea({...newArea, sistemaPlantio: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  >
                    <option value="Mecanizado Convenc">Mecanizado Convencional</option>
                    <option value="Meiosi Desdobra">Meiosi Desdobra</option>
                    <option value="Manual Convenc">Manual Convencional</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Variedade de Cana</label>
                  <input 
                    type="text" 
                    placeholder="ex: CTC 3445"
                    value={newArea.variedade}
                    onChange={(e) => setNewArea({...newArea, variedade: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Status Inicial</label>
                  <select 
                    value={newArea.statusArea}
                    onChange={(e) => setNewArea({...newArea, statusArea: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  >
                    <option value="Á PLANTAR">Á Plantar</option>
                    <option value="PLANTANDO">Plantando</option>
                    <option value="PLANTIO FECHADO">Plantio Fechado</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex items-center pt-6">
                  <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newArea.replantio}
                      onChange={(e) => setNewArea({...newArea, replantio: e.target.checked})}
                      className="w-4 h-4 text-[#00843D] focus:ring-[#00843D]"
                    />
                    Área de Replantio
                  </label>
                </div>

                <div className="col-span-full flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingArea(false)}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold uppercase hover:bg-gray-50 text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-[#00843D] hover:bg-[#006B32] text-white rounded-xl font-black uppercase shadow-lg"
                  >
                    Salvar Área
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* EDIT AREA FORM MODAL */}
          {editingArea && (
            <div className="bg-white p-8 rounded-[32px] border-2 border-blue-500/30 shadow-xl space-y-6 animate-in zoom-in-95 duration-200 text-left">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black text-gray-900 uppercase flex items-center gap-2">
                  <Edit size={18} className="text-blue-600" /> Editar Informações da Área
                </h3>
                <span className="text-xs text-gray-400 font-bold">ID: {editingArea.id}</span>
              </div>
              <form onSubmit={handleEditAreaSave} className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-gray-700">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Fazenda</label>
                  <input 
                    type="text" 
                    required
                    value={editingArea.fazenda}
                    onChange={(e) => setEditingArea({...editingArea, fazenda: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Quadra</label>
                  <input 
                    type="text" 
                    required
                    value={editingArea.quadra}
                    onChange={(e) => setEditingArea({...editingArea, quadra: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Talhão</label>
                  <input 
                    type="text" 
                    required
                    value={editingArea.talhao}
                    onChange={(e) => setEditingArea({...editingArea, talhao: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Área Plantio (ha)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={editingArea.areaPlantio || ''}
                    onChange={(e) => setEditingArea({...editingArea, areaPlantio: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Sistema de Plantio</label>
                  <select 
                    value={editingArea.sistemaPlantio}
                    onChange={(e) => setEditingArea({...editingArea, sistemaPlantio: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    <option value="Mecanizado Convenc">Mecanizado Convencional</option>
                    <option value="Meiosi Desdobra">Meiosi Desdobra</option>
                    <option value="Manual Convenc">Manual Convencional</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Variedade de Cana</label>
                  <input 
                    type="text" 
                    value={editingArea.variedade}
                    onChange={(e) => setEditingArea({...editingArea, variedade: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Status da Área</label>
                  <select 
                    value={editingArea.statusArea}
                    onChange={(e) => setEditingArea({...editingArea, statusArea: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    <option value="Á PLANTAR">Á Plantar</option>
                    <option value="PLANTANDO">Plantando</option>
                    <option value="PLANTIO FECHADO">Plantio Fechado</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Hectares Feitos (ha)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={editingArea.plantioCco || 0}
                    onChange={(e) => setEditingArea({...editingArea, plantioCco: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Chuva Registrada (mm)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={editingArea.chuvaMm || 0}
                    onChange={(e) => setEditingArea({...editingArea, chuvaMm: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Turno Selecionado</label>
                  <select 
                    value={editingArea.turno || 'TURNO A'}
                    onChange={(e) => setEditingArea({...editingArea, turno: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold bg-white"
                  >
                    <option value="TURNO A">Turno A</option>
                    <option value="TURNO B">Turno B</option>
                    <option value="TURNO C">Turno C</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Data e Hora de Registro</label>
                  <input 
                    type="text" 
                    value={editingArea.dataHora || ''}
                    placeholder="Ex: 2026-07-16 16:30"
                    onChange={(e) => setEditingArea({...editingArea, dataHora: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 font-bold"
                  />
                </div>

                <div className="space-y-1.5 flex items-center pt-6">
                  <label className="flex items-center gap-2 font-bold uppercase tracking-wider text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingArea.replantio}
                      onChange={(e) => setEditingArea({...editingArea, replantio: e.target.checked})}
                      className="w-4 h-4 text-[#00843D] focus:ring-[#00843D]"
                    />
                    Área de Replantio
                  </label>
                </div>

                <div className="col-span-full flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingArea(null)}
                    className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold uppercase hover:bg-gray-50 text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase shadow-lg"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MASTER DATABASE GRID */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div>
                <h4 className="text-sm font-black text-gray-900 uppercase">Central de Áreas Operacionais</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Base unificada de planejamento, preparo e tratos culturais</p>
              </div>
              <button
                onClick={() => setZoomedSectionId('banco')}
                className="p-2 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-xl border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                title="Expandir Tabela"
              >
                <Maximize2 size={13} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs min-w-[1200px]">
                <thead>
                  <tr className="bg-[#00843D] text-white font-bold uppercase text-[9px] tracking-wider border-b border-[#005B2B]/20">
                    <th className="px-6 py-4 sticky left-0 bg-[#00843D] z-10 min-w-[120px]">Fazenda / Quadra / Talhão</th>
                    <th className="px-4 py-4">Área Plan (ha)</th>
                    <th className="px-4 py-4">Sistema</th>
                    <th className="px-4 py-4">Variedade</th>
                    <th className="px-4 py-4">Status da Área</th>
                    <th className="px-4 py-4 text-center">Hectares Feitos (ha)</th>
                    <th className="px-4 py-4 text-center">Chuva (mm)</th>
                    <th className="px-4 py-4 text-center">Turno</th>
                    <th className="px-4 py-4 text-center">Data e Hora</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold">
                  {filteredBanco.map((item) => {
                    const progressPercent = item.areaPlantio > 0 ? (item.plantioCco / item.areaPlantio) * 100 : 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 text-sm">Fz. {item.fazenda}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500 text-[10px]">Q.{item.quadra}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-900">T.{item.talhao}</span>
                          </div>
                          {item.replantio && (
                            <span className="inline-block mt-1 bg-green-100 text-[#00843D] text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Replantio</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-900 text-sm">{item.areaPlantio.toFixed(2)} ha</td>
                        <td className="px-4 py-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] uppercase">
                            {item.sistemaPlantio}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#00843D]">{item.variedade}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            item.statusArea === 'PLANTIO FECHADO' 
                              ? 'bg-green-100 text-green-700' 
                              : item.statusArea === 'PLANTANDO' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-green-50 text-[#00843D]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.statusArea === 'PLANTIO FECHADO' 
                                ? 'bg-green-500' 
                                : item.statusArea === 'PLANTANDO' 
                                ? 'bg-emerald-500' 
                                : 'bg-[#00843D]'
                            }`} />
                            {item.statusArea}
                          </span>
                        </td>

                        {/* Hectares Feitos (ha) */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-xs font-black text-gray-900">
                              {item.plantioCco.toFixed(2)} / {item.areaPlantio.toFixed(2)} ha
                            </span>
                            <div className="flex items-center gap-1.5 w-28">
                              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#00843D] h-full" style={{ width: `${Math.min(100, progressPercent)}%` }} />
                              </div>
                              <span className="text-[9px] text-gray-400 font-bold">{progressPercent.toFixed(0)}%</span>
                            </div>
                          </div>
                        </td>

                        {/* Chuva (mm) */}
                        <td className="px-4 py-4 text-center">
                          {item.chuvaMm !== undefined && item.chuvaMm > 0 ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-black">
                              <Droplet size={12} className="fill-blue-500 stroke-blue-500" />
                              {item.chuvaMm.toFixed(1)} mm
                            </span>
                          ) : (
                            <span className="text-gray-300">0.0 mm</span>
                          )}
                        </td>

                        {/* Turno */}
                        <td className="px-4 py-4 text-center">
                          {item.turno ? (
                            <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                              {item.turno}
                            </span>
                          ) : (
                            <span className="text-gray-300">---</span>
                          )}
                        </td>

                        {/* Data e Hora */}
                        <td className="px-4 py-4 text-center text-gray-600 font-medium text-[11px]">
                          {item.dataHora ? (
                            <div className="flex items-center justify-center gap-1">
                              <span className="font-bold text-gray-700">{item.dataHora}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300">---</span>
                          )}
                        </td>

                        {/* Actions (Pencil to edit, and Trash to delete) */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => setEditingArea(item)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-all"
                              title="Editar Qualquer Informação"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Deseja realmente excluir a área Fazenda ${item.fazenda} - Talhão ${item.talhao}?`)) {
                                  handleDeleteArea(item.id);
                                }
                              }}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-all"
                              title="Excluir Área"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* SUB TAB: BOLETIM DE OPERAÇÃO */}
      {subTab === 'boletim' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* LEFT BULLETIN FORM & ACTIVE SELECTOR */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 lg:col-span-1 h-fit">
            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <Tractor className="text-[#00843D]" size={24} />
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase">Boletim Diário de Campo</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lançamentos de Turno por Frente</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-bold">
              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase tracking-widest text-[9px]">Frente de Trabalho</label>
                <select 
                  value={selectedFrente}
                  onChange={(e) => setSelectedFrente(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="71-1">71-1 (MAN/PRÓPRIO)</option>
                  <option value="72-1">72-1 (MEC/PRÓPRIO)</option>
                  <option value="72-2">72-2 (MEC/PRÓPRIO)</option>
                  <option value="72-3">72-3 (MEC/PRÓPRIO)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 uppercase tracking-widest text-[9px]">Data da Operação</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3 text-gray-400" size={14} />
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* QUICK TOTALIZER STATS */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Acumuladores da Frente</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase">Hectares Plantados</span>
                    <p className="text-lg font-black text-[#00843D] mt-0.5">4,70 ha</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase">Meta Diária</span>
                    <p className="text-lg font-black text-gray-900 mt-0.5">0,40 ha</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase">Média Pessoas</span>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">15 pessoas</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase">Situação</span>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-green-100 text-[#00843D] rounded-full font-black text-[9px] uppercase">OK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BULLETIN SHIFT TABLE & STATS */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 lg:col-span-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase">Turnos &amp; Rendimentos - Frente {selectedFrente}</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Apontamentos por período operational de 24 horas</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-xs font-black uppercase">
                  Plantio Normal
                </span>
                <button
                  onClick={() => setZoomedSectionId('boletim')}
                  className="p-2.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-xl border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                  title="Expandir Painel"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-[20px] border border-gray-100">
              <table className="w-full border-collapse text-left text-xs min-w-[650px]">
                <thead>
                  <tr className="bg-[#00843D] text-white font-bold uppercase text-[9px] tracking-wider border-b border-[#005B2B]/20">
                    <th className="px-6 py-4">Turno</th>
                    <th className="px-4 py-4">Horário</th>
                    <th className="px-4 py-4">Plantio (ha)</th>
                    <th className="px-4 py-4">Chuva (mm)</th>
                    <th className="px-4 py-4">Viagens</th>
                    <th className="px-4 py-4">Pessoas</th>
                    <th className="px-4 py-4 text-center">Status Operacional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-bold">
                  {shiftRecords.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-[#00843D] text-xs font-black">{row.turno}</td>
                      <td className="px-4 py-4 text-gray-500">{row.horario}</td>
                      <td className="px-4 py-4 text-gray-900 text-sm">{row.plantio.toFixed(2)} ha</td>
                      <td className="px-4 py-4 text-emerald-600">{row.chuva} mm</td>
                      <td className="px-4 py-4 text-gray-500">{row.viagens}</td>
                      <td className="px-4 py-4 text-gray-500">{row.pessoas}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                          row.status === 'TRABALHOU' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            row.status === 'TRABALHOU' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* HOURLY CALCULATION PREVIEW CARD */}
            <div className="bg-[#00843D]/5 p-6 rounded-2xl border border-green-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] text-[#00843D] uppercase font-black tracking-widest">Resumo Operacional de Produtividade</span>
                <p className="text-sm font-black text-gray-900 uppercase">Média por dia desde o início: <span className="text-[#00843D]">28,32 ha</span></p>
                <p className="text-xs font-bold text-gray-400">Total acumulado de frentes de plantio normal: 5.238,38 ha</p>
              </div>
              <div className="bg-white px-6 py-4 rounded-xl border border-green-200 shadow-sm text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Produção do Dia</p>
                <p className="text-3xl font-black text-[#00843D] mt-0.5">4,70 ha</p>
                <span className="text-[10px] font-bold text-green-600">Meta Diária Batida!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: CONTROLE VS PIMS (AUDIT COMPLIANCE MODULE) */}
      {subTab === 'pims' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* BANNER DESPLANNING AUDIT */}
          <div className="bg-gradient-to-r from-[#005B2B] to-[#00843D] p-8 rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-lg shadow-green-900/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
            
            <div className="space-y-2 relative z-10 text-left">
              <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Módulo de Auditoria Ativo
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight">Conferência Física vs. PIMS</h3>
              <p className="text-green-100 text-xs font-bold uppercase max-w-xl">
                Evite variações fiscais e de faturamento auditando lançamentos físicos de controle contra o PIMS ERP em tempo real.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[200px] text-center shrink-0 relative z-10">
              <span className="text-[9px] font-black text-green-200 uppercase tracking-widest block">Total Plantio 2026</span>
              <span className="text-4xl font-black block mt-1 text-white">5.238,38 ha</span>
              <div className="mt-2 text-green-200 font-bold text-xs flex justify-center gap-2 items-center">
                <span>Realizado PIMS:</span>
                <span className="text-white font-black">5.238,38 ha</span>
              </div>
            </div>
          </div>

          {/* DUAL TABLE MATRIX CONTAINER */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* LEFT COMPARATIVE TABLE */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase">Preenchimento de Controle Físico</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Consolidação manual colhida nas frentes</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-50 text-[#00843D] text-[9px] font-black uppercase px-2 py-1 rounded">
                    Frentes Ativas
                  </span>
                  <button
                    onClick={() => setZoomedSectionId('pims')}
                    className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                    title="Expandir Painel"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-[#00843D]/5 text-[#00843D] font-bold uppercase text-[9px] tracking-wider border-b border-green-100">
                      <th className="px-6 py-3.5">Frentes</th>
                      <th className="px-4 py-3.5 text-right">Mecanizado (ha)</th>
                      <th className="px-4 py-3.5 text-right">Meiosi (ha)</th>
                      <th className="px-6 py-3.5 text-right">Total Controle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-gray-900">71-1</td>
                      <td className="px-4 py-4 text-right text-gray-500">0.00</td>
                      <td className="px-4 py-4 text-right text-gray-500">377.71</td>
                      <td className="px-6 py-4 text-right text-gray-900">406.29</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">72-1</td>
                      <td className="px-4 py-4 text-right text-gray-500">3052.62</td>
                      <td className="px-4 py-4 text-right text-gray-500">22.75</td>
                      <td className="px-6 py-4 text-right text-[#00843D]">3075.37</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">72-2</td>
                      <td className="px-4 py-4 text-right text-gray-500">1168.42</td>
                      <td className="px-4 py-4 text-right text-gray-500">11.98</td>
                      <td className="px-6 py-4 text-right text-gray-900">1180.40</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">72-3</td>
                      <td className="px-4 py-4 text-right text-gray-500">598.92</td>
                      <td className="px-4 py-4 text-right text-gray-500">0.00</td>
                      <td className="px-6 py-4 text-right text-gray-900">598.92</td>
                    </tr>
                    <tr className="bg-[#00843D]/5 font-black border-t-2 border-green-100">
                      <td className="px-6 py-4 text-gray-900">Total Geral</td>
                      <td className="px-4 py-4 text-right text-[#00843D]">4819.96</td>
                      <td className="px-4 py-4 text-right text-[#00843D]">412.44</td>
                      <td className="px-6 py-4 text-right text-[#00843D] text-sm">5260.98</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT COMPARATIVE TABLE */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase">Lançamento no Sistema ERP PIMS</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Registros extraídos dos boletins eletrônicos integrados</p>
                </div>
                <span className="bg-green-50 text-[#00843D] text-[9px] font-black uppercase px-2 py-1 rounded">
                  Sincronizado
                </span>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-[#00843D]/5 text-[#00843D] font-bold uppercase text-[9px] tracking-wider border-b border-green-100">
                      <th className="px-6 py-3.5">Frentes</th>
                      <th className="px-4 py-3.5 text-right">Mecanizado (ha)</th>
                      <th className="px-4 py-3.5 text-right">Meiosi (ha)</th>
                      <th className="px-6 py-3.5 text-right">Total PIMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-gray-900">71-1</td>
                      <td className="px-4 py-4 text-right text-gray-500">0.00</td>
                      <td className="px-4 py-4 text-right text-gray-500">377.71</td>
                      <td className="px-6 py-4 text-right text-gray-900">406.29</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">72-1</td>
                      <td className="px-4 py-4 text-right text-gray-500">3059.86</td>
                      <td className="px-4 py-4 text-right text-gray-500">22.75</td>
                      <td className="px-6 py-4 text-right text-[#00843D]">3082.61</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">72-2</td>
                      <td className="px-4 py-4 text-right text-gray-500">1168.42</td>
                      <td className="px-4 py-4 text-right text-gray-500">11.98</td>
                      <td className="px-6 py-4 text-right text-gray-900">1180.40</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-gray-900">72-3</td>
                      <td className="px-4 py-4 text-right text-gray-500">598.92</td>
                      <td className="px-4 py-4 text-right text-gray-500">0.00</td>
                      <td className="px-6 py-4 text-right text-gray-900">598.92</td>
                    </tr>
                    <tr className="bg-[#00843D]/5 font-black border-t-2 border-green-100">
                      <td className="px-6 py-4 text-gray-900">Total Geral</td>
                      <td className="px-4 py-4 text-right text-[#00843D]">4827.20</td>
                      <td className="px-4 py-4 text-right text-[#00843D]">412.44</td>
                      <td className="px-6 py-4 text-right text-[#00843D] text-sm">5268.22</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DELTA RECONCILIATION SUMMARY */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6 text-left">
            <h4 className="text-sm font-black text-gray-900 uppercase">Conciliação de Diferenças Ativas (Deltas)</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs font-bold">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Delta Frente 71-1</span>
                <span className="text-lg text-green-600">0,00 ha</span>
                <p className="text-[9px] text-gray-400 uppercase mt-1">100% Conciliado</p>
              </div>

              <div className="p-5 rounded-2xl bg-green-50/50 border border-green-200">
                <span className="text-[10px] text-[#00843D] uppercase tracking-widest block mb-1">Delta Frente 72-1</span>
                <span className="text-lg text-[#00843D]">-7,24 ha</span>
                <p className="text-[9px] text-emerald-700 uppercase mt-1">PIMS maior que o físico (revisar)</p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Delta Frente 72-2</span>
                <span className="text-lg text-green-600">0,00 ha</span>
                <p className="text-[9px] text-gray-400 uppercase mt-1">100% Conciliado</p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Delta Frente 72-3</span>
                <span className="text-lg text-green-600">0,00 ha</span>
                <p className="text-[9px] text-gray-400 uppercase mt-1">100% Conciliado</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZOOMED SECTION MODAL OVERLAY */}
      <AnimatePresence>
        {zoomedSectionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setZoomedSectionId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-y-auto max-h-[90vh] p-8 sm:p-12 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Carousel navigation controls */}
              <button 
                onClick={handlePrevSection}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/95 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150"
              >
                <ChevronLeft size={36} />
              </button>
              <button 
                onClick={handleNextSection}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/95 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150"
              >
                <ChevronRight size={36} />
              </button>

              <button 
                onClick={() => setZoomedSectionId(null)}
                className="absolute right-8 top-8 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="py-2">
                <span className="text-[10px] font-black text-[#00843D] bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Painel de Gestão Área Expandido</span>
                <p className="text-xs text-gray-400 mt-1 uppercase font-black">Use as setas laterais para navegar entre os módulos de Gestão de Área</p>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                {zoomedSectionId === 'gerencial' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase">Boletim de Acompanhamento Gerencial</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Acompanhamento diário e acumulado por Modalidade e Frente</p>
                    </div>

                    <div className="overflow-x-auto rounded-[20px] border border-gray-100 shadow-md">
                      <table className="w-full border-collapse text-left text-xs min-w-[800px]">
                        <thead>
                          <tr className="bg-[#00843D] text-white font-bold uppercase tracking-wider border-b border-[#005B2B]">
                            <th colSpan={2} className="px-6 py-4 border-r border-[#005B2B] bg-[#005B2B] text-center text-[10px]">Identificação</th>
                            <th colSpan={4} className="px-6 py-4 border-r border-[#005B2B] bg-green-800/20 text-center text-[10px]">Dia (02/06/2026)</th>
                            <th colSpan={4} className="px-6 py-4 border-r border-[#005B2B] bg-green-700/20 text-center text-[10px]">Mês</th>
                            <th colSpan={4} className="px-6 py-4 bg-green-600/20 text-center text-[10px]">Acumulado</th>
                          </tr>
                          <tr className="bg-[#005B2B] text-white font-bold uppercase text-[9px] tracking-wider border-b border-green-700">
                            <th className="px-6 py-3.5 border-r border-green-700">Modalidade</th>
                            <th className="px-6 py-3.5 border-r border-green-700">Frente</th>
                            <th className="px-4 py-3.5 bg-green-800/10 text-white">Planej. (ha)</th>
                            <th className="px-4 py-3.5 bg-green-800/10 text-white">Realiz. (ha)</th>
                            <th className="px-4 py-3.5 bg-green-800/10 text-white text-center">% Realiz.</th>
                            <th className="px-4 py-3.5 bg-green-800/10 text-white border-r border-green-700 text-center">Chuva (mm)</th>
                            
                            <th className="px-4 py-3.5 bg-green-700/10 text-white">Planej. (ha)</th>
                            <th className="px-4 py-3.5 bg-green-700/10 text-white">Realiz. (ha)</th>
                            <th className="px-4 py-3.5 bg-green-700/10 text-white text-center">% Realiz.</th>
                            <th className="px-4 py-3.5 bg-green-700/10 text-white border-r border-green-700 text-center">Chuva (mm)</th>

                            <th className="px-4 py-3.5 bg-green-600/10 text-white">Planej. (ha)</th>
                            <th className="px-4 py-3.5 bg-green-600/10 text-white">Realiz. (ha)</th>
                            <th className="px-4 py-3.5 bg-green-600/10 text-white text-center">% Realiz.</th>
                            <th className="px-4 py-3.5 bg-green-600/10 text-white text-center">Chuva (mm)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 font-bold text-gray-800 bg-white">
                          <tr>
                            <td className="px-6 py-3.5 border-r border-gray-200">Mecanizado</td>
                            <td className="px-6 py-3.5 border-r border-gray-200">72-1</td>
                            <td className="px-4 py-3.5 text-gray-500 text-right">3,00</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">3,50</td>
                            <td className="px-4 py-3.5 text-center text-[#00843D]">117%</td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-200 text-gray-400">0</td>
                            
                            <td className="px-4 py-3.5 text-gray-500 text-right">90,00</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">95,20</td>
                            <td className="px-4 py-3.5 text-center text-[#00843D]">106%</td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-200 text-gray-400">22</td>

                            <td className="px-4 py-3.5 text-gray-500 text-right">3.059,86</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">3.082,61</td>
                            <td className="px-4 py-3.5 text-center text-[#00843D]">101%</td>
                            <td className="px-4 py-3.5 text-center text-gray-400">452</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-3.5 border-r border-gray-200">Mecanizado</td>
                            <td className="px-6 py-3.5 border-r border-gray-200">72-2</td>
                            <td className="px-4 py-3.5 text-gray-500 text-right">1,20</td>
                            <td className="px-4 py-3.5 text-right text-amber-600">0,80</td>
                            <td className="px-4 py-3.5 text-center text-amber-600">67%</td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-200 text-gray-400">0</td>
                            
                            <td className="px-4 py-3.5 text-gray-500 text-right">36,00</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">38,40</td>
                            <td className="px-4 py-3.5 text-center text-[#00843D]">107%</td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-200 text-gray-400">14</td>

                            <td className="px-4 py-3.5 text-gray-500 text-right">1.168,42</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">1.180,40</td>
                            <td className="px-4 py-3.5 text-center text-[#00843D]">101%</td>
                            <td className="px-4 py-3.5 text-center text-gray-400">415</td>
                          </tr>
                          <tr>
                            <td className="px-6 py-3.5 border-r border-gray-200">Manual</td>
                            <td className="px-6 py-3.5 border-r border-gray-200">72-3</td>
                            <td className="px-4 py-3.5 text-gray-500 text-right">0,50</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">0,40</td>
                            <td className="px-4 py-3.5 text-center text-amber-600">80%</td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-200 text-gray-400">0</td>
                            
                            <td className="px-4 py-3.5 text-gray-500 text-right">15,00</td>
                            <td className="px-4 py-3.5 text-right text-amber-600">12,10</td>
                            <td className="px-4 py-3.5 text-center text-amber-600">81%</td>
                            <td className="px-4 py-3.5 text-center border-r border-gray-200 text-gray-400">5</td>

                            <td className="px-4 py-3.5 text-gray-500 text-right">598,92</td>
                            <td className="px-4 py-3.5 text-right text-[#00843D]">598,92</td>
                            <td className="px-4 py-3.5 text-center text-[#00843D]">100%</td>
                            <td className="px-4 py-3.5 text-center text-gray-400">380</td>
                          </tr>
                          <tr className="bg-[#00843D]/10 font-black border-t-2 border-[#00843D]/20">
                            <td colSpan={2} className="px-6 py-4 border-r border-gray-200 text-[#00843D]">Consolidado Geral</td>
                            <td className="px-4 py-4 text-right text-gray-700">4,70</td>
                            <td className="px-4 py-4 text-right text-[#00843D]">4,70</td>
                            <td className="px-4 py-4 text-center text-[#00843D]">100%</td>
                            <td className="px-4 py-4 text-center border-r border-gray-200 text-gray-400">0</td>
                            
                            <td className="px-4 py-4 text-right text-gray-700">141,00</td>
                            <td className="px-4 py-4 text-right text-[#00843D]">145,70</td>
                            <td className="px-4 py-4 text-center text-[#00843D]">103%</td>
                            <td className="px-4 py-4 text-center border-r border-gray-200 text-gray-400">41</td>

                            <td className="px-4 py-4 text-right text-gray-700">4.827,20</td>
                            <td className="px-4 py-4 text-right text-[#00843D]">4.861,93</td>
                            <td className="px-4 py-4 text-center text-[#00843D]">101%</td>
                            <td className="px-4 py-4 text-center text-gray-400">1.247</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {zoomedSectionId === 'banco' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase">Central de Áreas Operacionais</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Base unificada de planejamento, preparo e tratos culturais</p>
                    </div>

                    <div className="overflow-x-auto rounded-[20px] border border-gray-150 shadow-md">
                      <table className="w-full border-collapse text-left text-xs min-w-[1000px]">
                        <thead>
                          <tr className="bg-[#00843D] text-white font-bold uppercase text-[9px] tracking-wider border-b border-[#005B2B]/20">
                            <th className="px-6 py-4 sticky left-0 bg-[#00843D] z-10 min-w-[120px]">Fazenda / Quadra / Talhão</th>
                            <th className="px-4 py-4">Área Plan (ha)</th>
                            <th className="px-4 py-4">Sistema</th>
                            <th className="px-4 py-4">Variedade</th>
                            <th className="px-4 py-4">Status da Área</th>
                            <th className="px-4 py-4 text-center">Hectares Feitos (ha)</th>
                            <th className="px-4 py-4 text-center">Chuva (mm)</th>
                            <th className="px-4 py-4 text-center">Turno</th>
                            <th className="px-4 py-4 text-center">Data e Hora</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-bold text-gray-800 bg-white">
                          {bancoData.map((item) => {
                            const progressPercent = item.areaPlantio > 0 ? (item.plantioCco / item.areaPlantio) * 100 : 0;
                            return (
                              <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                                <td className="px-6 py-4 font-black text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                                  <div className="flex flex-col">
                                    <span className="text-xs">{item.fazenda}</span>
                                    <span className="text-[10px] text-gray-400">Quadra {item.quadra} — Talhão {item.talhao}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-gray-600">{item.areaPlantio.toFixed(2)} ha</td>
                                <td className="px-4 py-4 text-gray-500 font-bold uppercase text-[10px]">{item.sistemaPlantio}</td>
                                <td className="px-4 py-4 text-[#00843D] font-mono text-[11px]">{item.variedade}</td>
                                <td className="px-4 py-4">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                                    item.statusArea === 'PLANTIO FECHADO' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-850'
                                  }`}>
                                    {item.statusArea}
                                  </span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <span className="text-xs font-black text-gray-900">{item.plantioCco.toFixed(2)} ha</span>
                                </td>
                                <td className="px-4 py-4 text-center text-blue-900 font-extrabold">{item.chuvaMm} mm</td>
                                <td className="px-4 py-4 text-center uppercase text-[10px]">{item.turno || '---'}</td>
                                <td className="px-4 py-4 text-center text-gray-600 text-[11px]">{item.dataHora || '---'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {zoomedSectionId === 'boletim' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase">Turnos &amp; Rendimentos - Frente {selectedFrente}</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Apontamentos por período operational de 24 horas</p>
                    </div>

                    <div className="overflow-x-auto rounded-[20px] border border-gray-100 shadow-md bg-white">
                      <table className="w-full border-collapse text-left text-xs min-w-[650px]">
                        <thead>
                          <tr className="bg-[#00843D] text-white font-bold uppercase text-[9px] tracking-wider border-b border-[#005B2B]/20">
                            <th className="px-6 py-4">Turno</th>
                            <th className="px-4 py-4">Horário</th>
                            <th className="px-4 py-4">Plantio (ha)</th>
                            <th className="px-4 py-4">Chuva (mm)</th>
                            <th className="px-4 py-4">Frente</th>
                            <th className="px-4 py-4">Operação</th>
                            <th className="px-6 py-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-bold text-gray-800 bg-white">
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-black">TURNO A</td>
                            <td className="px-4 py-4 text-gray-500">07:00 às 15:00</td>
                            <td className="px-4 py-4 text-[#00843D] font-extrabold text-sm">1,80 ha</td>
                            <td className="px-4 py-4 text-blue-900 font-extrabold">0,00 mm</td>
                            <td className="px-4 py-4 text-gray-600">{selectedFrente}</td>
                            <td className="px-4 py-4 text-gray-400 font-mono text-[10px]">PREPARO/PLANTIO</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-green-50 text-[#00843D] text-[9px] uppercase font-black">EFICIENTE</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 bg-gray-50/50">
                            <td className="px-6 py-4 text-gray-900 font-black">TURNO B</td>
                            <td className="px-4 py-4 text-gray-500">15:00 às 23:00</td>
                            <td className="px-4 py-4 text-[#00843D] font-extrabold text-sm">2,10 ha</td>
                            <td className="px-4 py-4 text-blue-900 font-extrabold">0,00 mm</td>
                            <td className="px-4 py-4 text-gray-600">{selectedFrente}</td>
                            <td className="px-4 py-4 text-gray-400 font-mono text-[10px]">PREPARO/PLANTIO</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-green-50 text-[#00843D] text-[9px] uppercase font-black">EFICIENTE</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-900 font-black">TURNO C</td>
                            <td className="px-4 py-4 text-gray-500">23:00 às 07:00</td>
                            <td className="px-4 py-4 text-[#00843D] font-extrabold text-sm">0,80 ha</td>
                            <td className="px-4 py-4 text-blue-900 font-extrabold">0,00 mm</td>
                            <td className="px-4 py-4 text-gray-600">{selectedFrente}</td>
                            <td className="px-4 py-4 text-gray-400 font-mono text-[10px]">PREPARO/PLANTIO</td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-green-50 text-[#00843D] text-[9px] uppercase font-black">EFICIENTE</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {zoomedSectionId === 'pims' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 uppercase">Conferência Física vs. PIMS ERP</h3>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Auditoria de conformidade fiscal e operacional</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Físico */}
                      <div className="space-y-4">
                        <span className="bg-[#00843D] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Controle Físico (Frente)</span>
                        <div className="overflow-x-auto rounded-[20px] border border-gray-150">
                          <table className="w-full border-collapse text-left text-xs bg-white">
                            <thead>
                              <tr className="bg-gray-50 text-gray-700 font-black border-b border-gray-100">
                                <th className="px-4 py-3">Frente</th>
                                <th className="px-4 py-3 text-right">Mecanizado</th>
                                <th className="px-4 py-3 text-right">Meiosi</th>
                                <th className="px-4 py-3 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-bold">
                              <tr>
                                <td className="px-4 py-3">71-1</td>
                                <td className="px-4 py-3 text-right text-gray-500">0.00</td>
                                <td className="px-4 py-3 text-right text-gray-500">377.71</td>
                                <td className="px-4 py-3 text-right text-gray-900">406.29</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">72-1</td>
                                <td className="px-4 py-3 text-right text-gray-500">3052.62</td>
                                <td className="px-4 py-3 text-right text-gray-500">22.75</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">3075.37</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">Total</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">4819.96</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">412.44</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">5260.98</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right PIMS */}
                      <div className="space-y-4">
                        <span className="bg-[#054425] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">ERP PIMS (Faturamento)</span>
                        <div className="overflow-x-auto rounded-[20px] border border-gray-150">
                          <table className="w-full border-collapse text-left text-xs bg-white">
                            <thead>
                              <tr className="bg-gray-50 text-gray-700 font-black border-b border-gray-100">
                                <th className="px-4 py-3">Frente</th>
                                <th className="px-4 py-3 text-right">Mecanizado</th>
                                <th className="px-4 py-3 text-right">Meiosi</th>
                                <th className="px-4 py-3 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-bold">
                              <tr>
                                <td className="px-4 py-3">71-1</td>
                                <td className="px-4 py-3 text-right text-gray-500">0.00</td>
                                <td className="px-4 py-3 text-right text-gray-500">377.71</td>
                                <td className="px-4 py-3 text-right text-gray-900">406.29</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">72-1</td>
                                <td className="px-4 py-3 text-right text-gray-500">3059.86</td>
                                <td className="px-4 py-3 text-right text-gray-500">22.75</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">3082.61</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">Total</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">4827.20</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">412.44</td>
                                <td className="px-4 py-3 text-right text-[#00843D]">5268.22</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
});
