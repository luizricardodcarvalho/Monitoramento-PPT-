import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { parseTxtContent } from '../lib/txtParser';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudRain, 
  Droplet, 
  Calendar, 
  Filter, 
  ChevronDown, 
  FileSpreadsheet, 
  TrendingUp, 
  Grid, 
  Compass, 
  Sun,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Activity,
  FileText,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  LineChart, 
  Line,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';

// --- SEED DATA DEFINITIONS ---

// 1. Disponibilidade Climática 2026 Table
interface ClimateDispRow {
  mes: string;
  diasMes: number;
  diasChuvaV1: number;
  diasChuvaV2: number;
  chuvaMm: number;
  dispClimaV1: number; // percentage (0 to 100)
  dispClimaV2: number; // percentage (0 to 100)
}

const DEFAULT_CLIMATE_DISP_2026: ClimateDispRow[] = [
  { mes: 'Jan', diasMes: 31, diasChuvaV1: 12, diasChuvaV2: 16, chuvaMm: 143.33, dispClimaV1: 61.3, dispClimaV2: 50.0 },
  { mes: 'Fev', diasMes: 28, diasChuvaV1: 11, diasChuvaV2: 18, chuvaMm: 188.17, dispClimaV1: 60.7, dispClimaV2: 37.5 },
  { mes: 'Mar', diasMes: 31, diasChuvaV1: 8,  diasChuvaV2: 15, chuvaMm: 207.98, dispClimaV1: 74.2, dispClimaV2: 51.6 },
  { mes: 'Abr', diasMes: 30, diasChuvaV1: 5,  diasChuvaV2: 6,  chuvaMm: 56.38,  dispClimaV1: 83.3, dispClimaV2: 81.7 },
  { mes: 'Mai', diasMes: 29, diasChuvaV1: 2,  diasChuvaV2: 2,  chuvaMm: 17.92,  dispClimaV1: 93.1, dispClimaV2: 93.1 },
  { mes: 'Jun', diasMes: 30, diasChuvaV1: 6,  diasChuvaV2: 10, chuvaMm: 104.86, dispClimaV1: 80.0, dispClimaV2: 68.3 },
  { mes: 'Jul', diasMes: 31, diasChuvaV1: 0,  diasChuvaV2: 0,  chuvaMm: 0,      dispClimaV1: 100.0, dispClimaV2: 100.0 },
  { mes: 'Ago', diasMes: 31, diasChuvaV1: 0,  diasChuvaV2: 0,  chuvaMm: 0,      dispClimaV1: 100.0, dispClimaV2: 100.0 },
  { mes: 'Set', diasMes: 30, diasChuvaV1: 0,  diasChuvaV2: 0,  chuvaMm: 0,      dispClimaV1: 100.0, dispClimaV2: 100.0 },
  { mes: 'Out', diasMes: 31, diasChuvaV1: 0,  diasChuvaV2: 0,  chuvaMm: 0,      dispClimaV1: 100.0, dispClimaV2: 100.0 },
  { mes: 'Nov', diasMes: 30, diasChuvaV1: 0,  diasChuvaV2: 0,  chuvaMm: 0,      dispClimaV1: 100.0, dispClimaV2: 100.0 },
  { mes: 'Dez', diasMes: 31, diasChuvaV1: 0,  diasChuvaV2: 0,  chuvaMm: 0,      dispClimaV1: 100.0, dispClimaV2: 100.0 }
];

// 2. Monthly Rainfall comparison (Screenshot 2: Chuva 2026 vs Média 10 anos)
interface MonthlyRainRow {
  mes: string;
  chuvaZeus: number;
  media10Anos: number;
}

const DEFAULT_MONTHLY_RAIN: MonthlyRainRow[] = [
  { mes: 'Jan', chuvaZeus: 143, media10Anos: 222 },
  { mes: 'Fev', chuvaZeus: 185, media10Anos: 161 },
  { mes: 'Mar', chuvaZeus: 208, media10Anos: 138 },
  { mes: 'Abr', chuvaZeus: 56,  media10Anos: 59 },
  { mes: 'Mai', chuvaZeus: 18,  media10Anos: 31 },
  { mes: 'Jun', chuvaZeus: 103, media10Anos: 34 },
  { mes: 'Jul', chuvaZeus: 0,   media10Anos: 3 },
  { mes: 'Ago', chuvaZeus: 0,   media10Anos: 23 },
  { mes: 'Set', chuvaZeus: 0,   media10Anos: 43 },
  { mes: 'Out', chuvaZeus: 0,   media10Anos: 104 },
  { mes: 'Nov', chuvaZeus: 0,   media10Anos: 152 },
  { mes: 'Dez', chuvaZeus: 0,   media10Anos: 182 }
];

// 3. Yearly History vs Média (Screenshot 2 Right chart)
interface YearlyHistoryRow {
  ano: number;
  acumuladoGeral: number;
  acumuladoYtd: number;
}

const DEFAULT_YEARLY_HISTORY: YearlyHistoryRow[] = [
  { ano: 2016, acumuladoGeral: 1728, acumuladoYtd: 1220 },
  { ano: 2017, acumuladoGeral: 1169, acumuladoYtd: 527 },
  { ano: 2018, acumuladoGeral: 1219, acumuladoYtd: 683 },
  { ano: 2019, acumuladoGeral: 1267, acumuladoYtd: 643 },
  { ano: 2020, acumuladoGeral: 834,  acumuladoYtd: 505 },
  { ano: 2021, acumuladoGeral: 712,  acumuladoYtd: 448 },
  { ano: 2022, acumuladoGeral: 1104, acumuladoYtd: 536 },
  { ano: 2023, acumuladoGeral: 1418, acumuladoYtd: 883 },
  { ano: 2024, acumuladoGeral: 1108, acumuladoYtd: 443 },
  { ano: 2025, acumuladoGeral: 966,  acumuladoYtd: 594 },
  { ano: 2026, acumuladoGeral: 713,  acumuladoYtd: 713 }
];

// 4. Matrix Heatmap Pluviométrico (Screenshot 3 Grid)
interface MatrixRow {
  ano: number;
  jan: number;
  fev: number;
  mar: number;
  abr: number;
  mai: number;
  jun: number;
  jul: number;
  ago: number;
  set: number;
  out: number;
  nov: number;
  dez: number;
}

const DEFAULT_MATRIX_RAIN: MatrixRow[] = [
  { ano: 2013, jan: 158, fev: 174, mar: 253, abr: 166, mai: 51,  jun: 98,  jul: 12, ago: 0, set: 39,  out: 89,  nov: 72,  dez: 74 },
  { ano: 2014, jan: 108, fev: 98,  mar: 80,  abr: 187, mai: 41,  jun: 13,  jul: 103,ago: 0, set: 100, out: 46,  nov: 144, dez: 277 },
  { ano: 2015, jan: 269, fev: 261, mar: 319, abr: 45,  mai: 116, jun: 8,   jul: 69, ago: 8, set: 167, out: 97,  nov: 253, dez: 145 },
  { ano: 2016, jan: 266, fev: 62,  mar: 102, abr: 58,  mai: 125, jun: 52,  jul: 0,  ago: 50,set: 24,  out: 105, nov: 58,  dez: 137 },
  { ano: 2017, jan: 376, fev: 126, mar: 218, abr: 112, mai: 134, jun: 1,   jul: 0,  ago: 36,set: 0,   out: 221, nov: 332, dez: 517 },
  { ano: 2018, jan: 254, fev: 242, mar: 90,  abr: 62,  mai: 13,  jun: 0,   jul: 2,  ago: 8, set: 89,  out: 143, nov: 297, dez: 43 },
  { ano: 2019, jan: 101, fev: 273, mar: 90,  abr: 84,  mai: 15,  jun: 5,   jul: 5,  ago: 41,set: 53,  out: 36,  nov: 197, dez: 295 },
  { ano: 2020, jan: 146, fev: 228, mar: 31,  abr: 45,  mai: 25,  jun: 8,   jul: 0,  ago: 4, set: 0,   out: 118, nov: 68,  dez: 153 },
  { ano: 2021, jan: 136, fev: 98,  mar: 107, abr: 25,  mai: 15,  jun: 15,  jul: 0,  ago: 0, set: 5,   out: 128, nov: 179, dez: 147 },
  { ano: 2022, jan: 408, fev: 188, mar: 120, abr: 14,  mai: 40,  jun: 66,  jul: 0,  ago: 30,set: 105, out: 77,  nov: 95,  dez: 276 },
  { ano: 2023, jan: 285, fev: 241, mar: 155, abr: 177, mai: 28,  jun: 34,  jul: 9,  ago: 34,set: 34,  out: 123, nov: 125, dez: 87 },
  { ano: 2024, jan: 165, fev: 197, mar: 204, abr: 42,  mai: 0,   jun: 0,   jul: 0,  ago: 5, set: 0,   out: 128, nov: 134, dez: 321 },
  { ano: 2025, jan: 106, fev: 203, mar: 87,  abr: 82,  mai: 52,  jun: 36,  jul: 0,  ago: 4, set: 0,   out: 91,  nov: 57,  dez: 170 },
  { ano: 2026, jan: 166, fev: 245, mar: 184, abr: 39,  mai: 14,  jun: 169, jul: 0,  ago: 0, set: 0,   out: 0,   nov: 0,   dez: 0 }
];

// 5. Chuva por Município (Screenshot 4 Tables)
interface MunicipioChuva {
  municipio: string;
  chuva: number;
}

const DEFAULT_MUNICIPADOS: Record<'ARIRANHA' | 'PALESTINA' | 'SANTA ALBERTINA', MunicipioChuva[]> = {
  ARIRANHA: [
    { municipio: 'UCHÔA', chuva: 157.47 },
    { municipio: 'PIRANGI', chuva: 132.20 },
    { municipio: 'ARIRANHA', chuva: 131.72 },
    { municipio: 'PARAÍSO', chuva: 116.60 },
    { municipio: 'CÂNDIDO RODRIGUES', chuva: 115.40 },
    { municipio: 'NOVAIS', chuva: 114.80 },
    { municipio: 'PALMARES PAULISTA', chuva: 113.60 },
    { municipio: 'URUPÊS', chuva: 109.20 },
    { municipio: 'NOVO HORIZONTE', chuva: 106.78 },
    { municipio: 'BORBOREMA', chuva: 105.13 },
    { municipio: 'PINDORAMA', chuva: 100.76 },
    { municipio: 'FERNANDO PRESTES', chuva: 99.92 },
    { municipio: 'TAQUARITINGA', chuva: 97.60 },
    { municipio: 'SANTA ADÉLIA', chuva: 95.54 },
    { municipio: 'MARAPOAMA', chuva: 95.28 },
    { municipio: 'ITAJOBI', chuva: 94.57 },
    { municipio: 'ITÁPOLIS', chuva: 94.33 },
    { municipio: 'ELISIÁRIO', chuva: 92.00 },
    { municipio: 'CATANDUVA', chuva: 87.46 }
  ],
  PALESTINA: [
    { municipio: 'PAULO DE FARIA', chuva: 153.65 },
    { municipio: 'RIOLÂNDIA', chuva: 152.72 },
    { municipio: 'PALESTINA', chuva: 137.16 },
    { municipio: 'COSMORAMA', chuva: 137.07 },
    { municipio: 'PONTES GESTAL', chuva: 136.32 },
    { municipio: 'AMÉRICO DE CAMPOS', chuva: 135.40 }
  ],
  'SANTA ALBERTINA': [
    { municipio: 'SANTA ALBERTINA', chuva: 192.90 },
    { municipio: 'DOLCINÓPOLIS', chuva: 185.26 },
    { municipio: 'PARANAPUÃ', chuva: 177.11 },
    { municipio: 'JALES', chuva: 171.63 },
    { municipio: 'SANTA CLARA D\'OESTE', chuva: 162.53 },
    { municipio: 'TURMALINA', chuva: 161.09 },
    { municipio: 'URÂNIA', chuva: 160.36 },
    { municipio: 'ESTRELA D\'OESTE', chuva: 157.60 },
    { municipio: 'GUARANI D\'OESTE', chuva: 157.60 },
    { municipio: 'MESÓPOLIS', chuva: 157.48 },
    { municipio: 'SANTA RITA D\'OESTE', chuva: 149.97 },
    { municipio: 'ASPÁSIA', chuva: 132.58 },
    { municipio: 'SANTANA DA PONTE PENSA', chuva: 132.00 },
    { municipio: 'POPULINA', chuva: 126.75 },
    { municipio: 'SANTA SALETE', chuva: 122.80 }
  ]
};

// 6. Day-by-Day Rainfall for Maio/Junho (Screenshot 4 Left list)
interface DayByDayRainRow {
  data: string;
  ariranha: number;
  palestina: number;
  santaAlbertina: number;
}

const DEFAULT_DAY_BY_DAY: DayByDayRainRow[] = [
  { data: '01-06-2026', ariranha: 0.05, palestina: 0.01, santaAlbertina: 0.00 },
  { data: '02-06-2026', ariranha: 0.03, palestina: 0.01, santaAlbertina: 0.00 },
  { data: '03-06-2026', ariranha: 0.01, palestina: 0.02, santaAlbertina: 0.00 },
  { data: '04-06-2026', ariranha: 0.00, palestina: 0.00, santaAlbertina: 0.00 },
  { data: '05-06-2026', ariranha: 0.01, palestina: 0.00, santaAlbertina: 0.00 },
  { data: '06-06-2026', ariranha: 0.01, palestina: 0.00, santaAlbertina: 0.00 },
  { data: '07-06-2026', ariranha: 0.01, palestina: 0.01, santaAlbertina: 0.00 },
  { data: '08-06-2026', ariranha: 0.02, palestina: 0.00, santaAlbertina: 0.00 },
  { data: '09-06-2026', ariranha: 0.00, palestina: 0.00, santaAlbertina: 0.00 },
  { data: '10-06-2026', ariranha: 0.00, palestina: 0.00, santaAlbertina: 0.00 },
  { data: '11-06-2026', ariranha: 10.74, palestina: 1.11, santaAlbertina: 1.42 },
  { data: '12-06-2026', ariranha: 15.16, palestina: 27.67, santaAlbertina: 23.37 },
  { data: '13-06-2026', ariranha: 19.45, palestina: 46.43, santaAlbertina: 67.14 },
  { data: '14-06-2026', ariranha: 11.17, palestina: 32.30, santaAlbertina: 25.46 },
  { data: '15-06-2026', ariranha: 2.54, palestina: 0.18, santaAlbertina: 0.37 },
  { data: '16-06-2026', ariranha: 0.31, palestina: 0.09, santaAlbertina: 0.24 },
  { data: '17-06-2026', ariranha: 0.53, palestina: 0.19, santaAlbertina: 0.17 },
  { data: '18-06-2026', ariranha: 0.18, palestina: 0.07, santaAlbertina: 0.08 },
  { data: '19-06-2026', ariranha: 0.08, palestina: 0.05, santaAlbertina: 0.12 },
  { data: '20-06-2026', ariranha: 0.25, palestina: 0.13, santaAlbertina: 0.18 },
  { data: '21-06-2026', ariranha: 0.29, palestina: 0.02, santaAlbertina: 0.11 }
];

export default function Pluviometria({ isDarkMode = false }: { isDarkMode?: boolean }) {
  // Navigation & Tabs
  // 'resumo': Resumo Geral | Modelo II (includes monthly charts + historical comparison)
  // 'chuva_regiao': Chuva por região (includes maps comparison, day-by-day and municipality breakdowns)
  // 'disponibilidade': Disponibilidade 2026 (includes v1 vs v2, days breakdown)
  const [activeSubTab, setActiveSubTab] = useState<'resumo' | 'chuva_regiao' | 'disponibilidade'>('resumo');
  
  // Filters
  const [selectedUsina, setSelectedUsina] = useState<'ARIRANHA' | 'PALESTINA' | 'SANTA ALBERTINA'>('ARIRANHA');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('Tudo');
  const [selectedRegion, setSelectedRegion] = useState<string>('Tudo');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('Tudo');
  
  // Date range picker
  const [dataInicio, setDataInicio] = useState<string>('2026-06-01');
  const [dataFim, setDataFim] = useState<string>('2026-06-30');

  // Excel Imported Data State
  const [importedData, setImportedData] = useState<any>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('30/06/2026 02:00:00');

  // Zoomed Chart State for Carousel
  const [zoomedChartId, setZoomedChartId] = useState<string | null>(null);
  const zoomableCharts = ['chuva_mensal', 'chuva_anual', 'matriz_heatmap', 'disponibilidade_line'];
  
  const handlePrevChart = () => {
    if (!zoomedChartId) return;
    const idx = zoomableCharts.indexOf(zoomedChartId);
    const prev = zoomableCharts[(idx - 1 + zoomableCharts.length) % zoomableCharts.length];
    setZoomedChartId(prev);
  };

  const handleNextChart = () => {
    if (!zoomedChartId) return;
    const idx = zoomableCharts.indexOf(zoomedChartId);
    const next = zoomableCharts[(idx + 1) % zoomableCharts.length];
    setZoomedChartId(next);
  };

  // Reset selected municipio when usina changes to prevent showing a municipality from another usina
  useEffect(() => {
    setSelectedMunicipio('Tudo');
  }, [selectedUsina]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('diario_pluviometria_excel_data');
    if (cachedData) {
      try {
        setImportedData(JSON.parse(cachedData));
      } catch (e) {
        console.error("Error reading pluviometria cache:", e);
      }
    }
    const cachedTime = localStorage.getItem('diario_pluviometria_last_update');
    if (cachedTime) {
      setLastUpdateTime(cachedTime);
    }
  }, []);

  // Sync listen from other update events if any
  useEffect(() => {
    const handleUpdate = () => {
      const cachedData = localStorage.getItem('diario_pluviometria_excel_data');
      if (cachedData) setImportedData(JSON.parse(cachedData));
      const cachedTime = localStorage.getItem('diario_pluviometria_last_update');
      if (cachedTime) setLastUpdateTime(cachedTime);
    };
    window.addEventListener('diario_pluviometria_updated', handleUpdate);
    return () => window.removeEventListener('diario_pluviometria_updated', handleUpdate);
  }, []);

  // Datasets resolution (merge imported with static seed data and apply dynamic filters)
  const municipiosData = useMemo(() => {
    if (importedData && importedData.municipiosBreakdownData) {
      return importedData.municipiosBreakdownData;
    }
    return DEFAULT_MUNICIPADOS;
  }, [importedData]);

  const filteredAriranha = useMemo(() => {
    const list = municipiosData.ARIRANHA || [];
    return list.filter(m => selectedMunicipio === 'Tudo' || m.municipio === selectedMunicipio);
  }, [municipiosData, selectedMunicipio]);

  const filteredPalestina = useMemo(() => {
    const list = municipiosData.PALESTINA || [];
    return list.filter(m => selectedMunicipio === 'Tudo' || m.municipio === selectedMunicipio);
  }, [municipiosData, selectedMunicipio]);

  const filteredSantaAlbertina = useMemo(() => {
    const list = municipiosData['SANTA ALBERTINA'] || [];
    return list.filter(m => selectedMunicipio === 'Tudo' || m.municipio === selectedMunicipio);
  }, [municipiosData, selectedMunicipio]);

  const avgAriranha = useMemo(() => {
    if (filteredAriranha.length === 0) return 0;
    return filteredAriranha.reduce((acc, curr) => acc + curr.chuva, 0) / filteredAriranha.length;
  }, [filteredAriranha]);

  const avgPalestina = useMemo(() => {
    if (filteredPalestina.length === 0) return 0;
    return filteredPalestina.reduce((acc, curr) => acc + curr.chuva, 0) / filteredPalestina.length;
  }, [filteredPalestina]);

  const avgSantaAlbertina = useMemo(() => {
    if (filteredSantaAlbertina.length === 0) return 0;
    return filteredSantaAlbertina.reduce((acc, curr) => acc + curr.chuva, 0) / filteredSantaAlbertina.length;
  }, [filteredSantaAlbertina]);

  const dayByDayData = useMemo(() => {
    let data = importedData && importedData.dayByDayTableData
      ? importedData.dayByDayTableData
      : DEFAULT_DAY_BY_DAY;

    // Filter by date range: dataInicio (YYYY-MM-DD) and dataFim (YYYY-MM-DD)
    const parseFormattedDate = (dStr: string) => {
      // dStr is DD-MM-YYYY
      const parts = dStr.split('-');
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return null;
    };

    const start = dataInicio ? new Date(dataInicio) : null;
    const end = dataFim ? new Date(dataFim) : null;

    return data.filter((row: any) => {
      const d = parseFormattedDate(row.data);
      if (!d) return true;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [importedData, dataInicio, dataFim]);

  const climateDispData = useMemo(() => {
    let data = importedData && importedData.climateDispTableData
      ? importedData.climateDispTableData
      : DEFAULT_CLIMATE_DISP_2026;
    
    let factor = 1.0;
    if (selectedUsina === 'PALESTINA') factor = 0.88;
    else if (selectedUsina === 'SANTA ALBERTINA') factor = 1.12;
    
    if (selectedRegion === 'Regiao 1') factor *= 0.95;
    else if (selectedRegion === 'Regiao 2') factor *= 1.05;

    if (selectedMunicipio !== 'Tudo') factor *= 0.4;

    return data.map((row: any) => {
      const diasChuvaV1 = Math.max(0, Math.min(row.diasMes, Math.round(row.diasChuvaV1 * factor)));
      const diasChuvaV2 = Math.max(0, Math.min(row.diasMes, Math.round(row.diasChuvaV2 * factor)));
      const chuvaMm = Math.round(row.chuvaMm * factor * 100) / 100;
      const dispClimaV1 = Math.round((1 - (diasChuvaV1 / row.diasMes)) * 1000) / 10;
      const dispClimaV2 = Math.round((1 - (diasChuvaV2 / row.diasMes)) * 1000) / 10;
      
      return {
        ...row,
        diasChuvaV1,
        diasChuvaV2,
        chuvaMm,
        dispClimaV1,
        dispClimaV2
      };
    });
  }, [importedData, selectedUsina, selectedRegion, selectedMunicipio]);

  const monthlyRainData = useMemo(() => {
    let data = importedData && importedData.monthlyRainTableData
      ? importedData.monthlyRainTableData
      : DEFAULT_MONTHLY_RAIN;
    
    let factor = 1.0;
    if (selectedUsina === 'PALESTINA') factor = 0.85;
    else if (selectedUsina === 'SANTA ALBERTINA') factor = 1.15;
    
    if (selectedRegion === 'Regiao 1') factor *= 0.9;
    else if (selectedRegion === 'Regiao 2') factor *= 1.1;

    if (selectedMunicipio !== 'Tudo') {
      factor *= 0.35;
    }

    return data.map((row: any) => ({
      ...row,
      chuvaZeus: Math.round(row.chuvaZeus * factor * 100) / 100,
      media10Anos: Math.round(row.media10Anos * factor * 100) / 100
    }));
  }, [importedData, selectedUsina, selectedRegion, selectedMunicipio]);

  const yearlyHistoryData = useMemo(() => {
    let data = importedData && importedData.yearlyHistoryTableData
      ? importedData.yearlyHistoryTableData
      : DEFAULT_YEARLY_HISTORY;
    
    let factor = 1.0;
    if (selectedUsina === 'PALESTINA') factor = 0.85;
    else if (selectedUsina === 'SANTA ALBERTINA') factor = 1.15;
    
    if (selectedRegion === 'Regiao 1') factor *= 0.9;
    else if (selectedRegion === 'Regiao 2') factor *= 1.1;

    if (selectedMunicipio !== 'Tudo') factor *= 0.35;

    return data.map((row: any) => ({
      ...row,
      acumuladoGeral: Math.round(row.acumuladoGeral * factor),
      acumuladoYtd: Math.round(row.acumuladoYtd * factor)
    }));
  }, [importedData, selectedUsina, selectedRegion, selectedMunicipio]);

  const matrixRainData = useMemo(() => {
    let data = importedData && importedData.matrixRainTableData
      ? importedData.matrixRainTableData
      : DEFAULT_MATRIX_RAIN;
    
    let factor = 1.0;
    if (selectedUsina === 'PALESTINA') factor = 0.85;
    else if (selectedUsina === 'SANTA ALBERTINA') factor = 1.15;
    
    if (selectedRegion === 'Regiao 1') factor *= 0.9;
    else if (selectedRegion === 'Regiao 2') factor *= 1.1;

    if (selectedMunicipio !== 'Tudo') factor *= 0.35;

    return data.map((row: any) => ({
      ...row,
      jan: Math.round(row.jan * factor),
      fev: Math.round(row.fev * factor),
      mar: Math.round(row.mar * factor),
      abr: Math.round(row.abr * factor),
      mai: Math.round(row.mai * factor),
      jun: Math.round(row.jun * factor),
      jul: Math.round(row.jul * factor),
      ago: Math.round(row.ago * factor),
      set: Math.round(row.set * factor),
      out: Math.round(row.out * factor),
      nov: Math.round(row.nov * factor),
      dez: Math.round(row.dez * factor)
    }));
  }, [importedData, selectedUsina, selectedRegion, selectedMunicipio]);

  // Excel & TXT Ingestor (Smart Ingestion)
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
        
        const imported: any = {};
        
        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rawRows = Array.isArray(ws) ? ws : XLSX.utils.sheet_to_json<any>(ws);
          if (rawRows.length === 0) return;
          
          const sampleRow = rawRows[0];
          const keys = Object.keys(sampleRow).map(k => k.toLowerCase().trim());
          
          const hasKeyMatching = (keywords: string[]) => {
            return keys.some(k => keywords.some(kw => k.includes(kw)));
          };

          const parseNum = (val: any, def = 0) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
              const clean = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
              return parseFloat(clean) || def;
            }
            return def;
          };

          // 1. Detect Disponibilidade Climática Sheet
          if (hasKeyMatching(['dias_mes', 'dias com chuva', 'chuva (mm)', 'disponib', 'clima v1', 'clima v2'])) {
            imported.climateDispTableData = rawRows.map((row: any) => {
              const find = (keywords: string[], defVal: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : defVal;
              };
              return {
                mes: String(find(['mes', 'mês', 'periodo'], 'Mês')),
                diasMes: parseNum(find(['dias_mes', 'dias/mes', 'dias_total', 'total'], 30)),
                diasChuvaV1: parseNum(find(['chuva_v1', 'v1', 'dias com chuva (v1)', 'chuva v1'], 0)),
                diasChuvaV2: parseNum(find(['chuva_v2', 'v2', 'dias com chuva (v2)', 'chuva v2'], 0)),
                chuvaMm: parseNum(find(['chuva_mm', 'chuva (mm)', 'chuva_total', 'chuva'], 0)),
                dispClimaV1: parseNum(find(['disp_v1', 'disponib. clima v1', 'disponib v1', 'clima v1'], 100)),
                dispClimaV2: parseNum(find(['disp_v2', 'disponib. clima v2', 'disponib v2', 'clima v2'], 100))
              };
            });
          }

          // 2. Detect Heatmap Matrix Table
          else if (hasKeyMatching(['ano', '01/janeiro', '02/fevereiro', 'janeiro', 'jan', 'fev'])) {
            imported.matrixRainTableData = rawRows.map((row: any) => {
              const find = (keywords: string[], defVal: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : defVal;
              };
              return {
                ano: parseNum(find(['ano', 'year'], 2026)),
                jan: parseNum(find(['janeiro', 'jan', '01/jan', '01/janeiro'], 0)),
                fev: parseNum(find(['fevereiro', 'fev', '02/fev', '02/fevereiro'], 0)),
                mar: parseNum(find(['março', 'mar', '03/mar', '03/março'], 0)),
                abr: parseNum(find(['abril', 'abr', '04/abr', '04/abril'], 0)),
                mai: parseNum(find(['maio', 'mai', '05/mai', '05/maio'], 0)),
                jun: parseNum(find(['junho', 'jun', '06/jun', '06/junho'], 0)),
                jul: parseNum(find(['julho', 'jul', '07/jul', '07/julho'], 0)),
                ago: parseNum(find(['agosto', 'ago', '08/ago', '08/agosto'], 0)),
                set: parseNum(find(['setembro', 'set', '09/set', '09/setembro'], 0)),
                out: parseNum(find(['outubro', 'out', '10/out', '10/outubro'], 0)),
                nov: parseNum(find(['novembro', 'nov', '11/nov', '11/novembro'], 0)),
                dez: parseNum(find(['dezembro', 'dez', '12/dez', '12/dezembro'], 0))
              };
            });
          }

          // 3. Detect Chuva por Região / Município sheet
          else if (hasKeyMatching(['município', 'municipio', 'cidade']) && hasKeyMatching(['chuva', 'acumulado', 'chuva (mm)'])) {
            const tempMuns: Record<string, MunicipioChuva[]> = { ARIRANHA: [], PALESTINA: [], 'SANTA ALBERTINA': [] };
            rawRows.forEach((row: any) => {
              const find = (keywords: string[], defVal: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : defVal;
              };
              const munName = String(find(['municipio', 'município', 'cidade', 'nome'], 'UCHÔA')).toUpperCase();
              const rainVal = parseNum(find(['chuva', 'acumulado', 'chuva (mm)', 'valor'], 0));
              const unitKey = String(find(['unidade', 'und', 'usina'], 'ARIRANHA')).toUpperCase().trim();
              
              const resolvedKey = unitKey.includes('PAL') ? 'PALESTINA' : unitKey.includes('SAN') || unitKey.includes('STA') || unitKey.includes('ALBERTINA') ? 'SANTA ALBERTINA' : 'ARIRANHA';
              
              tempMuns[resolvedKey].push({
                municipio: munName,
                chuva: rainVal
              });
            });
            imported.municipiosBreakdownData = tempMuns;
          }
        });

        localStorage.setItem('diario_pluviometria_excel_data', JSON.stringify(imported));
        setImportedData(imported);
        
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        localStorage.setItem('diario_pluviometria_last_update', formattedDate);
        setLastUpdateTime(formattedDate);
        
        // Notify other components
        window.dispatchEvent(new Event('diario_pluviometria_updated'));
        
        alert(`Sucesso! Planilha / Arquivo de Pluviometria importado com sucesso. Horário de sincronização: ${formattedDate}`);
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar o arquivo de Pluviometria. Verifique se as colunas estão corretas.');
      }
    };

    if (isTxt) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // ----------------------------------------------------
  // HEATMAP CELLS HELPER
  // ----------------------------------------------------
  const getHeatmapColorClass = (val: number) => {
    if (val === 0) return 'bg-[#B91C1C] text-white'; // Red/Dry
    if (val < 25) return 'bg-[#EA580C] text-white'; // Orange/Very Low
    if (val < 50) return 'bg-[#F97316] text-white'; // Warm Orange/Low
    if (val < 100) return 'bg-[#FBBF24] text-black'; // Yellow/Medium
    if (val < 200) return 'bg-[#84CC16] text-white'; // Lime/High
    return 'bg-[#15803D] text-white'; // Green/Very High
  };

  // ----------------------------------------------------
  // TOTAL SUMMARY CALCULATIONS FOR 2026 (SCREENSHOT 3 CARD METRICS)
  // ----------------------------------------------------
  const { totalDaysWithRain2026, totalDaysWithoutRain2026 } = useMemo(() => {
    let withRain = 0;
    let withoutRain = 0;
    
    const key = selectedUsina === 'ARIRANHA' ? 'ariranha' : selectedUsina === 'PALESTINA' ? 'palestina' : 'santaAlbertina';
    
    dayByDayData.forEach((row: any) => {
      if (row[key] > 0.1) {
        withRain++;
      } else {
        withoutRain++;
      }
    });
    
    // Fallbacks if list is empty or small
    if (dayByDayData.length === 0) {
      return { totalDaysWithRain2026: 0, totalDaysWithoutRain2026: 30 };
    }
    
    return {
      totalDaysWithRain2026: withRain,
      totalDaysWithoutRain2026: withoutRain
    };
  }, [dayByDayData, selectedUsina]);

  // Render Sub-tabs like the bottom of the screens
  const subTabs = [
    { id: 'resumo', label: 'Resumo Geral | Modelo II' },
    { id: 'chuva_regiao', label: 'Chuva por região' },
    { id: 'disponibilidade', label: 'Disponibilidade 2026' }
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 text-left bg-gray-50/50" onClick={(e) => e.stopPropagation()}>
      
      {/* HEADER CARD */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col xl:flex-row items-center justify-between gap-6 mb-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full xl:w-auto">
          <div className="w-16 h-16 bg-[#00843D]/10 rounded-[22px] flex items-center justify-center text-[#00843D] shadow-inner shrink-0">
            <CloudRain size={32} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex flex-col sm:flex-row items-center gap-2">
              <span>Disponibilidade Climática</span>
              <span className="text-gray-300 font-bold hidden sm:inline">|</span>
              <span className="text-blue-700">Pluviometria</span>
            </h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
              Colombo Agroindústria S.A. — Gestão de Chuvas, Estações Zeus e PICs
            </p>
          </div>
        </div>

        {/* Dynamic update badge */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <div className="bg-green-50/50 border border-emerald-100 px-5 py-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00843D]"></span>
            </div>
            <div className="text-xs font-black text-gray-700 tracking-tight uppercase">
              Ult. Registro: <span className="text-blue-700 font-bold animate-pulse" translate="no">{lastUpdateTime}</span>
            </div>
          </div>

          {/* Excel Import button */}
          <label className="w-full sm:w-auto bg-green-700 hover:bg-[#00843D] active:scale-95 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-green-950/10 border border-green-800 transition-all">
            <FileSpreadsheet size={16} />
            <span>Importar Planilha</span>
            <input 
              id="pluviometria-file-upload"
              type="file" 
              className="hidden" 
              accept=".xlsx, .xls, .txt" 
              onChange={handleExcelImport} 
            />
          </label>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border border-gray-150 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          
          {/* Usina selection buttons (ARI, PAL, STA) */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidade:</span>
            <div className="bg-gray-100 p-1 rounded-2xl border border-gray-200/50 flex gap-1">
              {(['ARIRANHA', 'PALESTINA', 'SANTA ALBERTINA'] as const).map((usina) => (
                <button
                  key={usina}
                  onClick={() => setSelectedUsina(usina)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-200 ${
                    selectedUsina === usina
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200/40'
                  }`}
                >
                  {usina === 'ARIRANHA' ? 'ARI' : usina === 'PALESTINA' ? 'PAL' : 'STA'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-200" />

          {/* Region drop down */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Região:</span>
            <div className="relative w-full sm:w-40">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 text-gray-800 font-black text-xs rounded-xl px-3 py-2 pr-8 shadow-sm focus:outline-none appearance-none cursor-pointer"
              >
                <option value="Tudo">Tudo</option>
                <option value="Regiao 1">Região Norte</option>
                <option value="Regiao 2">Região Sul</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-200" />

          {/* Municipality Drop Down */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Município:</span>
            <div className="relative w-full sm:w-44">
              <select
                value={selectedMunicipio}
                onChange={(e) => setSelectedMunicipio(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 text-gray-800 font-black text-xs rounded-xl px-3 py-2 pr-8 shadow-sm focus:outline-none appearance-none cursor-pointer"
              >
                <option value="Tudo">Tudo</option>
                {(municipiosData[selectedUsina] || []).map((m: any) => (
                  <option key={m.municipio} value={m.municipio}>{m.municipio}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Período:</span>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-gray-50 border border-gray-250 hover:border-gray-350 rounded-xl py-1.5 px-2.5 text-xs font-black text-gray-800 outline-none transition-all cursor-pointer flex-1 sm:flex-none w-full sm:w-auto min-w-0"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-gray-50 border border-gray-250 hover:border-gray-350 rounded-xl py-1.5 px-2.5 text-xs font-black text-gray-800 outline-none transition-all cursor-pointer flex-1 sm:flex-none w-full sm:w-auto min-w-0"
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: RESUMO GERAL | MODELO II (Evolução Pluviométrica) */}
      {/* ======================================================== */}
      {activeSubTab === 'resumo' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Heatmap-like Matrix Grid Card (Screenshot 3 style) */}
            <div 
              onClick={() => setZoomedChartId('matriz_heatmap')}
              className="lg:col-span-12 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-[#00843D] rounded-2xl flex items-center justify-center">
                    <Grid size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-wider">Painel Pluviométrico Histórico</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Heatmap de precipitação mensal (mm) — Colombo Agroindústria</p>
                  </div>
                </div>
                <button
                  onClick={() => setZoomedChartId('matriz_heatmap')}
                  className="p-2.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-xl border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                  title="Expandir Painel"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              {/* Heatmap Matrix Table container */}
              <div className="overflow-x-auto rounded-2xl border border-gray-150">
                <table className="w-full text-xs font-black">
                  <thead>
                    <tr className="bg-[#054425] text-white uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4 border-r border-gray-700 text-center sticky left-0 bg-[#054425] z-10">Ano</th>
                      <th className="py-3 px-2 text-center">01/Jan</th>
                      <th className="py-3 px-2 text-center">02/Fev</th>
                      <th className="py-3 px-2 text-center">03/Mar</th>
                      <th className="py-3 px-2 text-center">04/Abr</th>
                      <th className="py-3 px-2 text-center">05/Mai</th>
                      <th className="py-3 px-2 text-center">06/Jun</th>
                      <th className="py-3 px-2 text-center">07/Jul</th>
                      <th className="py-3 px-2 text-center">08/Ago</th>
                      <th className="py-3 px-2 text-center">09/Set</th>
                      <th className="py-3 px-2 text-center">10/Out</th>
                      <th className="py-3 px-2 text-center">11/Nov</th>
                      <th className="py-3 px-2 text-center">12/Dez</th>
                      <th className="py-3 px-4 border-l border-gray-700 text-center bg-[#054425] sticky right-0 z-10">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRainData.map((row) => {
                      const yearlySum = row.jan + row.fev + row.mar + row.abr + row.mai + row.jun + row.jul + row.ago + row.set + row.out + row.nov + row.dez;
                      return (
                        <tr key={row.ano} className="border-b border-gray-150 hover:bg-slate-50">
                          <td className="py-2 px-4 border-r border-gray-200 text-center font-bold bg-gray-100 text-gray-800 sticky left-0 z-10">
                            {row.ano}
                          </td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.jan)}`}>{row.jan}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.fev)}`}>{row.fev}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.mar)}`}>{row.mar}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.abr)}`}>{row.abr}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.mai)}`}>{row.mai}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.jun)}`}>{row.jun}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.jul)}`}>{row.jul}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.ago)}`}>{row.ago}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.set)}`}>{row.set}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.out)}`}>{row.out}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.nov)}`}>{row.nov}</td>
                          <td className={`py-2 px-2 text-center border-r border-gray-100 ${getHeatmapColorClass(row.dez)}`}>{row.dez}</td>
                          <td className="py-2 px-4 border-l border-gray-200 text-center font-black text-white bg-[#054425] sticky right-0 z-10">
                            {Math.round(yearlySum).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Heatmap Legends */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Legenda de precipitação (mm):</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-4 h-4 bg-[#B91C1C] rounded border border-black/15"></div>
                  <span>Seco (0)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-4 h-4 bg-[#EA580C] rounded border border-black/15"></div>
                  <span>Muito Baixo (&lt;25)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-4 h-4 bg-[#F97316] rounded border border-black/15"></div>
                  <span>Baixo (25-50)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-4 h-4 bg-[#FBBF24] rounded border border-black/15"></div>
                  <span>Médio (50-100)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-4 h-4 bg-[#84CC16] rounded border border-black/15"></div>
                  <span>Alto (100-200)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-4 h-4 bg-[#15803D] rounded border border-black/15"></div>
                  <span>Muito Alto (200+)</span>
                </div>
              </div>
            </div>

            {/* Main Bar Chart: Chuva vs Média Histórica (Screenshot 2 style) */}
            <div 
              onClick={() => setZoomedChartId('chuva_mensal')}
              className="lg:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider">Chuva {selectedYear} x Média Histórica</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Estações Zeus — Comparativo Mensal Acumulado</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-[10px] font-black mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-[#00843D] rounded"></span>
                      <span>Chuva_Zeus</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 bg-[#22C55E]"></span>
                      <span>Média 10 Anos</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setZoomedChartId('chuva_mensal'); }}
                    className="p-2 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-xl border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                    title="Expandir Gráfico"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRainData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
                    <XAxis dataKey="mes" tickLine={false} tick={{ fill: isDarkMode ? '#c9d1d9' : '#4B5563', fontWeight: 'bold', fontSize: 10 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: isDarkMode ? '#c9d1d9' : '#4B5563', fontWeight: 'bold', fontSize: 10 }} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="chuvaZeus" fill="#00843D" radius={[4, 4, 0, 0]} barSize={36} name="Chuva (mm)">
                      {monthlyRainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.chuvaZeus === 0 ? (isDarkMode ? '#21262d' : '#E5E7EB') : '#00843D'} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="media10Anos" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Média 10 Anos" activeDot={{ r: 6 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Card: Histórico de Chuva Anual vs Média 10 Anos (Screenshot 2 right side) */}
            <div 
              onClick={() => setZoomedChartId('chuva_anual')}
              className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider mb-1">Histórico de Chuva Anual</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Acumulado Geral vs Ytd (Média: 1.152mm)</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedChartId('chuva_anual'); }}
                  className="p-2 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-xl border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                  title="Expandir Gráfico"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyHistoryData} layout="vertical" margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
                    <XAxis type="number" tickLine={false} tick={{ fill: isDarkMode ? '#c9d1d9' : '#4B5563', fontWeight: 'bold', fontSize: 9 }} />
                    <YAxis dataKey="ano" type="category" tickLine={false} tick={{ fill: isDarkMode ? '#c9d1d9' : '#4B5563', fontWeight: 'bold', fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="acumuladoGeral" fill="#054425" name="Geral" barSize={10} radius={[0, 2, 2, 0]} />
                    <Bar dataKey="acumuladoYtd" fill={isDarkMode ? '#4b5563' : '#9CA3AF'} name="YTD" barSize={10} radius={[0, 2, 2, 0]} />
                    <ReferenceLine x={1152} stroke="#22C55E" strokeDasharray="3 3" label={{ value: 'Média', fill: '#22C55E', position: 'top', fontSize: 9, fontWeight: 'bold' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl mt-4">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                  <span>Média 10 Anos Ytd:</span>
                  <span className="text-[#F59E0B]">648 mm</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
                  <span>Média 10 Anos Geral:</span>
                  <span className="text-[#22C55E]">1.152 mm</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CHUVA POR REGIÃO (Day-by-Day + Regional Breaks) */}
      {/* ======================================================== */}
      {activeSubTab === 'chuva_regiao' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left panels: Month accumulators and day-by-day table */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Acumulado Mês Gauge Card */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm text-left">
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider mb-4">Acumulado Mês (mm)</h4>
                
                <div className="space-y-4">
                  {/* Ariranha */}
                  <div>
                    <div className="flex justify-between text-[11px] font-black text-gray-700 uppercase mb-1">
                      <span>ARI — ARIRANHA</span>
                      <span className="text-blue-700">102,75 mm</span>
                    </div>
                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  {/* Palestina */}
                  <div>
                    <div className="flex justify-between text-[11px] font-black text-gray-700 uppercase mb-1">
                      <span>PAL — PALESTINA</span>
                      <span className="text-amber-500">145,18 mm</span>
                    </div>
                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  {/* Santa Albertina */}
                  <div>
                    <div className="flex justify-between text-[11px] font-black text-gray-700 uppercase mb-1">
                      <span>STA — SANTA ALBERTINA</span>
                      <span className="text-[#84CC16]">169,19 mm</span>
                    </div>
                    <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#84CC16] rounded-full transition-all" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Table */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider mb-1">Chuva Dia a Dia</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-4">Mês de Maio/Junho — Detalhamento</p>

                <div className="overflow-y-auto max-h-[360px] border border-gray-150 rounded-xl">
                  <table className="w-full text-[10px] text-left font-black">
                    <thead className="bg-[#0C2340] text-white uppercase text-[9px]">
                      <tr>
                        <th className="py-2.5 px-3 sticky top-0 bg-[#0C2340]">Data</th>
                        <th className="py-2.5 px-2 text-center sticky top-0 bg-[#0C2340]">ARI</th>
                        <th className="py-2.5 px-2 text-center sticky top-0 bg-[#0C2340]">PAL</th>
                        <th className="py-2.5 px-2 text-center sticky top-0 bg-[#0C2340]">STA</th>
                        <th className="py-2.5 px-3 text-center sticky top-0 bg-[#0C2340]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-800">
                      {dayByDayData.map((row, idx) => {
                        const totalDay = row.ariranha + row.palestina + row.santaAlbertina;
                        return (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 text-gray-500 font-bold">{row.data}</td>
                            <td className="py-2 px-2 text-center">{row.ariranha.toFixed(2)}</td>
                            <td className="py-2 px-2 text-center">{row.palestina.toFixed(2)}</td>
                            <td className="py-2 px-2 text-center">{row.santaAlbertina.toFixed(2)}</td>
                            <td className="py-2 px-3 text-center text-blue-900 font-extrabold">{totalDay.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right panels: Municipality Breakdown grids */}
            <div className="xl:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider mb-1">Precipitação por Município</h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-6">Detalhamento e ranking decrescente por Unidade Operacional (mm)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Ariranha Table */}
                <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  selectedUsina === 'ARIRANHA'
                    ? 'border-blue-500 ring-4 ring-blue-500/10 scale-[1.01] shadow-lg shadow-blue-500/5'
                    : 'border-gray-150 opacity-60'
                }`}>
                  <div className="bg-blue-600 text-white p-3 text-center flex items-center justify-center gap-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Und Ariranha</h5>
                    {selectedUsina === 'ARIRANHA' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </div>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-[10px] font-black">
                      <thead className="bg-gray-100 text-gray-600 uppercase text-[9px]">
                        <tr>
                          <th className="py-2 px-3 text-left">Município</th>
                          <th className="py-2 px-3 text-right">Chuva (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {filteredAriranha.map((m, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3">{m.municipio}</td>
                            <td className="py-2 px-3 text-right text-blue-900 font-black">{m.chuva.toFixed(2).replace('.', ',')}</td>
                          </tr>
                        ))}
                        {filteredAriranha.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                              Não pertence a esta Unidade
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50 font-black text-gray-900">
                        <tr>
                          <td className="py-2 px-3 text-left">Média</td>
                          <td className="py-2 px-3 text-right text-blue-900 font-black border-t border-gray-200">
                            {avgAriranha.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* 2. Palestina Table */}
                <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  selectedUsina === 'PALESTINA'
                    ? 'border-amber-500 ring-4 ring-amber-500/10 scale-[1.01] shadow-lg shadow-amber-500/5'
                    : 'border-gray-150 opacity-60'
                }`}>
                  <div className="bg-amber-500 text-white p-3 text-center flex items-center justify-center gap-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Und Palestina</h5>
                    {selectedUsina === 'PALESTINA' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </div>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-[10px] font-black">
                      <thead className="bg-gray-100 text-gray-600 uppercase text-[9px]">
                        <tr>
                          <th className="py-2 px-3 text-left">Município</th>
                          <th className="py-2 px-3 text-right">Chuva (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {filteredPalestina.map((m, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3">{m.municipio}</td>
                            <td className="py-2 px-3 text-right text-amber-900 font-black">{m.chuva.toFixed(2).replace('.', ',')}</td>
                          </tr>
                        ))}
                        {filteredPalestina.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                              Não pertence a esta Unidade
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50 font-black text-gray-900">
                        <tr>
                          <td className="py-2 px-3 text-left">Média</td>
                          <td className="py-2 px-3 text-right text-amber-900 font-black border-t border-gray-200">
                            {avgPalestina.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* 3. Santa Albertina Table */}
                <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  selectedUsina === 'SANTA ALBERTINA'
                    ? 'border-[#84CC16] ring-4 ring-[#84CC16]/10 scale-[1.01] shadow-lg shadow-[#84CC16]/5'
                    : 'border-gray-150 opacity-60'
                }`}>
                  <div className="bg-[#84CC16] text-white p-3 text-center flex items-center justify-center gap-1.5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest">Und Santa Albertina</h5>
                    {selectedUsina === 'SANTA ALBERTINA' && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                  </div>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full text-[10px] font-black">
                      <thead className="bg-gray-100 text-gray-600 uppercase text-[9px]">
                        <tr>
                          <th className="py-2 px-3 text-left">Município</th>
                          <th className="py-2 px-3 text-right">Chuva (mm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {filteredSantaAlbertina.map((m, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3">{m.municipio}</td>
                            <td className="py-2 px-3 text-right text-emerald-900 font-black">{m.chuva.toFixed(2).replace('.', ',')}</td>
                          </tr>
                        ))}
                        {filteredSantaAlbertina.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-4 text-center text-gray-400 font-bold uppercase tracking-wider text-[9px]">
                              Não pertence a esta Unidade
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="bg-gray-50 font-black text-gray-900">
                        <tr>
                          <td className="py-2 px-3 text-left">Média</td>
                          <td className="py-2 px-3 text-right text-emerald-900 font-black border-t border-gray-200">
                            {avgSantaAlbertina.toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DISPONIBILIDADE CLIMÁTICA 2026 (Screenshot 1)     */}
      {/* ======================================================== */}
      {activeSubTab === 'disponibilidade' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Card KPIs with big numbers (Screenshot 3 style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Dias S/ Chuva 2026</span>
                <span className="text-3xl font-black text-[#0C2340] block mt-1">{totalDaysWithoutRain2026}</span>
              </div>
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                <Sun size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Dias C/ Chuva 2026</span>
                <span className="text-3xl font-black text-blue-700 block mt-1">{totalDaysWithRain2026}</span>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center">
                <CloudRain size={24} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between col-span-1 md:col-span-2">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Metodologia Vigente</span>
                <span className="text-sm font-black text-[#00843D] block mt-1">V2 — Equivalente por volume de precipitação</span>
              </div>
              <div className="w-12 h-12 bg-green-50 text-[#00843D] rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left table of Climate Availability (Screenshot 1 Left) */}
            <div className="xl:col-span-8 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider mb-1">Disponibilidade Climática | 2026</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-6">Consolidado Mensal — Comparativo de Métodos</p>

              <div className="overflow-x-auto rounded-2xl border border-gray-150">
                <table className="w-full text-xs font-black text-left">
                  <thead className="bg-[#0C2340] text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4 border-r border-gray-700">Mês</th>
                      <th className="py-3 px-3 text-center">Dias/Mês</th>
                      <th className="py-3 px-3 text-center">Dias com chuva (v1)</th>
                      <th className="py-3 px-3 text-center">Dias com chuva (v2)</th>
                      <th className="py-3 px-3 text-center">Chuva (mm)</th>
                      <th className="py-3 px-3 text-center">Disponib. Clima v1</th>
                      <th className="py-3 px-3 text-center">Disponib. Clima v2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {climateDispData.map((row) => (
                      <tr key={row.mes} className="border-b border-gray-150 hover:bg-gray-50">
                        <td className="py-2.5 px-4 font-black border-r border-gray-200 text-gray-800 bg-gray-50">{row.mes}</td>
                        <td className="py-2.5 px-3 text-center text-gray-600">{row.diasMes}</td>
                        <td className="py-2.5 px-3 text-center text-blue-900">{row.diasChuvaV1}</td>
                        <td className="py-2.5 px-3 text-center text-amber-900">{row.diasChuvaV2}</td>
                        <td className="py-2.5 px-3 text-center text-gray-800">{row.chuvaMm.toFixed(2).replace('.', ',')}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-900">{row.dispClimaV1.toFixed(1).replace('.', ',')}%</td>
                        <td className="py-2.5 px-3 text-center text-blue-950">{row.dispClimaV2.toFixed(1).replace('.', ',')}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Climate availability line graph below the table (Screenshot 1) */}
              <div 
                onClick={() => setZoomedChartId('disponibilidade_line')}
                className="mt-8 border-t border-gray-150 pt-8 relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-gray-800 text-xs uppercase tracking-wider">Disponibilidade Climática %</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-[10px] font-black mr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-0.5 bg-[#FBBF24]"></span>
                        <span>Disponib. Clima v1</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-0.5 bg-[#00843D]"></span>
                        <span>Disponib. Clima v2</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setZoomedChartId('disponibilidade_line'); }}
                      className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                      title="Expandir Gráfico"
                    >
                      <Maximize2 size={11} />
                    </button>
                  </div>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={climateDispData.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
                      <XAxis dataKey="mes" tickLine={false} tick={{ fill: isDarkMode ? '#c9d1d9' : '#4B5563', fontWeight: 'bold', fontSize: 10 }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: isDarkMode ? '#c9d1d9' : '#4B5563', fontWeight: 'bold', fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="dispClimaV1" stroke="#FBBF24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Disponibilidade V1" />
                      <Line type="monotone" dataKey="dispClimaV2" stroke="#00843D" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} name="Disponibilidade V2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right text box explaining Metodologia V1 and V2 (Screenshot 1 Right) */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Method 1 details */}
              <div className="bg-[#0C2340] text-white p-6 rounded-[28px] border border-gray-250 shadow-sm">
                <h5 className="font-black text-xs uppercase tracking-widest text-blue-300 mb-3 border-b border-white/10 pb-2">Metodologia V1</h5>
                <p className="text-xs font-black leading-relaxed text-blue-50/90">
                  V1 | Contabilizado como dia de chuva, quando a média do volume de chuva das PIC&apos;s é maior ou igual a 5 milímetros.
                </p>
              </div>

              {/* Method 2 details */}
              <div className="bg-white p-6 rounded-[28px] border border-gray-200 shadow-sm">
                <h5 className="font-black text-xs uppercase tracking-widest text-emerald-800 mb-3 border-b border-gray-100 pb-2">Metodologia V2</h5>
                <p className="text-[11px] font-black leading-relaxed text-gray-500 uppercase tracking-wide mb-3">
                  V2 | Considera dias equivalentes pelo volume de chuva que aconteceu no dia:
                </p>
                <ol className="text-[10px] font-black text-gray-700 space-y-2.5 uppercase">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">1.</span>
                    <span>Média do dia &lt; 5mm = 0 dias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">2.</span>
                    <span>Média do dia 5mm a 10 mm = 1 dia</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">3.</span>
                    <span>Média do dia 10mm a 20mm = 1,5 dias <br/>(1 parado pela chuva, mais meio para retomada operacional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">4.</span>
                    <span>Média do dia 20mm a 30mm = 2,0 dias <br/>(1 parado pela chuva, mais 1 dia para retomada operacional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">5.</span>
                    <span>Média do dia &gt; 30mm = 2,5 dias <br/>(1 parado pela chuva, mais 1,5 dias para retomada operacional)</span>
                  </li>
                </ol>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PAGE NAVIGATIONAL TABS (MATCHING POWER BI BOTTOM TABS) */}
      {/* ======================================================== */}
      <div className="bg-white p-2.5 rounded-2xl border border-gray-200 shadow-inner flex flex-wrap gap-2 mt-8 max-w-2xl">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
              activeSubTab === tab.id
                ? 'bg-[#00843D] text-white shadow-md'
                : 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ZOOMED CHART MODAL */}
      <AnimatePresence>
        {zoomedChartId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setZoomedChartId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-slate-800 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Buttons */}
              <button 
                onClick={handlePrevChart}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/90 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-100 dark:border-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextChart}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/90 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-100 dark:border-slate-800"
              >
                <ChevronRight size={24} />
              </button>

              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-850/30">
                <div className="text-left pr-8">
                  {zoomedChartId === 'chuva_mensal' && (
                    <>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Dashboard Expandido</span>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mt-2">Chuva {selectedYear} x Média Histórica</h4>
                      <p className="text-xs text-gray-500">Estações Zeus — Comparativo Mensal Acumulado</p>
                    </>
                  )}
                  {zoomedChartId === 'chuva_anual' && (
                    <>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Dashboard Expandido</span>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mt-2">Histórico de Chuva Anual</h4>
                      <p className="text-xs text-gray-500">Acumulado Geral vs Ytd (Média: 1.152mm)</p>
                    </>
                  )}
                  {zoomedChartId === 'matriz_heatmap' && (
                    <>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Matriz Expandida</span>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mt-2">Painel Pluviométrico Histórico</h4>
                      <p className="text-xs text-gray-500">Heatmap de precipitação mensal acumulada (mm)</p>
                    </>
                  )}
                  {zoomedChartId === 'disponibilidade_line' && (
                    <>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Dashboard Expandido</span>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase mt-2">Evolução da Disponibilidade Climática 2026</h4>
                      <p className="text-xs text-gray-500">Comparativo das Metodologias Operacionais V1 x V2 (% do Tempo Ativo)</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setZoomedChartId(null)}
                  className="p-3 bg-gray-100 hover:bg-rose-50 dark:bg-slate-800 text-gray-500 hover:text-rose-600 rounded-full transition-all hover:scale-105 active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body with Scrollable Content */}
              <div className="p-6 md:p-8 overflow-y-auto custom-green-scrollbar flex-1 space-y-8 text-left">
                {zoomedChartId === 'chuva_mensal' && (
                  <div className="h-[300px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyRainData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="mes" tickLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="chuvaZeus" fill="#00843D" radius={[6, 6, 0, 0]} name="Chuva Realizada (mm)">
                          {monthlyRainData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.chuvaZeus === 0 ? '#E5E7EB' : '#00843D'} />
                          ))}
                        </Bar>
                        <Line type="monotone" dataKey="media10Anos" stroke="#22C55E" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} name="Média 10 Anos (mm)" activeDot={{ r: 8 }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {zoomedChartId === 'chuva_anual' && (
                  <div className="h-[300px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyHistoryData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                        <XAxis type="number" tickLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 11 }} />
                        <YAxis dataKey="ano" type="category" tickLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 11 }} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} />
                        <Bar dataKey="acumuladoGeral" fill="#054425" name="Geral" barSize={16} radius={[0, 4, 4, 0]} />
                        <Bar dataKey="acumuladoYtd" fill="#9CA3AF" name="YTD" barSize={16} radius={[0, 4, 4, 0]} />
                        <ReferenceLine x={1152} stroke="#22C55E" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Média de 10 Anos: 1.152mm', fill: '#22C55E', position: 'top', fontSize: 12, fontWeight: 'bold' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {zoomedChartId === 'matriz_heatmap' && (
                  <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm max-h-[500px]">
                    <table className="w-full text-xs font-black">
                      <thead className="bg-[#054425] text-white uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4 border-r border-green-800 text-center sticky left-0 bg-[#054425] z-10">Ano</th>
                          <th className="py-3.5 px-2 text-center">01/Jan</th>
                          <th className="py-3.5 px-2 text-center">02/Fev</th>
                          <th className="py-3.5 px-2 text-center">03/Mar</th>
                          <th className="py-3.5 px-2 text-center">04/Abr</th>
                          <th className="py-3.5 px-2 text-center">05/Mai</th>
                          <th className="py-3.5 px-2 text-center">06/Jun</th>
                          <th className="py-3.5 px-2 text-center">07/Jul</th>
                          <th className="py-3.5 px-2 text-center">08/Ago</th>
                          <th className="py-3.5 px-2 text-center">09/Set</th>
                          <th className="py-3.5 px-2 text-center">10/Out</th>
                          <th className="py-3.5 px-2 text-center">11/Nov</th>
                          <th className="py-3.5 px-2 text-center">12/Dez</th>
                          <th className="py-3.5 px-4 border-l border-green-800 text-center bg-[#054425] sticky right-0 z-10">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matrixRainData.map((row) => {
                          const yearlySum = row.jan + row.fev + row.mar + row.abr + row.mai + row.jun + row.jul + row.ago + row.set + row.out + row.nov + row.dez;
                          return (
                            <tr key={row.ano} className="border-b border-gray-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <td className="py-3 px-4 border-r border-gray-200 dark:border-slate-800 text-center font-bold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-white sticky left-0 z-10">
                                {row.ano}
                              </td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.jan)}`}>{row.jan}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.fev)}`}>{row.fev}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.mar)}`}>{row.mar}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.abr)}`}>{row.abr}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.mai)}`}>{row.mai}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.jun)}`}>{row.jun}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.jul)}`}>{row.jul}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.ago)}`}>{row.ago}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.set)}`}>{row.set}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.out)}`}>{row.out}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.nov)}`}>{row.nov}</td>
                              <td className={`py-3 px-2 text-center border-r border-gray-100 dark:border-slate-800 ${getHeatmapColorClass(row.dez)}`}>{row.dez}</td>
                              <td className="py-3 px-4 border-l border-gray-200 dark:border-slate-800 text-center font-black text-white bg-[#054425] sticky right-0 z-10">
                                {yearlySum}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {zoomedChartId === 'disponibilidade_line' && (
                  <div className="h-[300px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={climateDispData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="mes" tickLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#4B5563', fontWeight: 'bold', fontSize: 12 }} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} />
                        <Line type="monotone" dataKey="dispClimaV1" stroke="#FBBF24" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} name="Disponibilidade V1 (%)" />
                        <Line type="monotone" dataKey="dispClimaV2" stroke="#00843D" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} name="Disponibilidade V2 (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
