import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import logoImg from '../assets/images/colombo_gestao_logo_1784131662820.jpg';
import { 
  ArrowLeft, 
  Sprout, 
  Tractor, 
  Truck, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Settings, 
  Activity, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Users, 
  Factory, 
  ChevronRight,
  Sparkles,
  Layers,
  Shield,
  Gauge,
  Sliders,
  DollarSign,
  Download,
  Share2,
  Pencil,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend, 
  Cell, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  PieChart,
  Pie,
  LineChart,
  Line,
  LabelList
} from 'recharts';

type UsinaKey = 'Ariranha' | 'Santa Albertina' | 'Palestina';

interface FleetItem {
  id: number;
  unidade: UsinaKey;
  tipo: 'Caminhão' | 'Plantadeira' | 'Trator' | 'Colhedeira';
  modelo: string;
  prefixo: string;
  status: 'Reserva' | 'Trabalhando' | 'Manutenção';
  updatedAt: string;
  hourlyData?: string[];
}

interface Frente {
  id: number;
  frente: string;
  nome: string;
  fazenda: string;
  cidade: string;
  quadras: number;
  talhoes: number;
  gestor: string;
  status: string;
  obs: string;
  updatedAt: string;
}

interface VisaoPlantioProps {
  onClose: () => void;
  lastPlantioUpdate: string;
  fleet: FleetItem[];
  frentes: Frente[];
  selectedUsina: UsinaKey;
}

// Beautiful Semi-circular Gauge Chart
const GaugeChart: React.FC<{ value: number; size?: number }> = ({ value, size = 120 }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const angle = -90 + (clampedValue / 100) * 180;
  
  // Dynamic color based on performance
  const getGaugeColor = (val: number) => {
    if (val >= 100) return '#22C55E'; // Vibrant Green
    if (val >= 80) return '#EAB308';  // Rich Yellow/Gold
    return '#EF4444';                 // Bold Red
  };

  const color = getGaugeColor(clampedValue);
  const arcLength = 251.3; // PI * r where r = 80
  const strokeDashoffset = arcLength - (clampedValue / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center relative select-none mx-auto" style={{ width: size, height: size * 0.78 }}>
      <svg viewBox="0 0 200 150" className="w-full h-full overflow-visible">
        {/* Background track (Grey) - nice thick path */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="24"
          strokeLinecap="round"
        />
        
        {/* Colored dynamic fill track - very thick and bright */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke={color}
          strokeWidth="24"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.8s ease' }}
        />
        
        {/* Sleek bold needle pointer line */}
        <line
          x1="100"
          y1="110"
          x2="100"
          y2="30"
          stroke="#0F172A"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${angle} 100 110)`}
          style={{ transformOrigin: '100px 110px', transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {/* Modern elegant pin */}
        <circle cx="100" cy="110" r="9" fill="#0F172A" />
        <circle cx="100" cy="110" r="4" fill="#FFFFFF" />

        {/* Centered value text below pin, super bold and legible */}
        <text 
          x="100" 
          y="144" 
          textAnchor="middle" 
          className="font-black" 
          fill="#002855"
          style={{ fontSize: '28px', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
        >
          {value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </text>
      </svg>
    </div>
  );
};

export interface ExcelPlantioRow {
  usina: string;       // 'Ariranha' | 'Santa Albertina' | 'Palestina'
  frente: string;      // e.g. '72-1', '84-5'
  hora: number;        // 0 to 23
  realizado: number;   // hectares realized in that hour
  meta: number;        // meta hectares for that hour
  plantadoras: number; // active plantadoras in that hour
  rendimento: number;  // productivity ha/h in that hour
}

export const generateDefaultExcelData = (): ExcelPlantioRow[] => {
  const rows: ExcelPlantioRow[] = [];
  const usinas: UsinaKey[] = ['Ariranha', 'Palestina', 'Santa Albertina'];
  const frentes = {
    'Ariranha': '72-1',
    'Palestina': '84-5',
    'Santa Albertina': '91-2'
  };
  
  // Cyclic hourly pattern for 24 hours to give realistic, beautifully varying productivity values
  const hourlyBaseFactors = [
    0.38, 0.38, 0.35, 0.30, 0.42, 0.40, 0.45, 0.38, 0.38, // 00h - 08h
    0.39, 0.41, 0.43, 0.40, 0.37, 0.36, 0.38, 0.40, 0.42, // 09h - 17h
    0.39, 0.38, 0.35, 0.34, 0.36, 0.37                    // 18h - 23h
  ];

  usinas.forEach(usina => {
    const frente = frentes[usina];
    const numPlantadoras = usina === 'Palestina' ? 4 : usina === 'Santa Albertina' ? 2 : 3;
    const baseMetaFactor = usina === 'Palestina' ? 1.8 : usina === 'Santa Albertina' ? 1.2 : 1.5;

    for (let h = 0; h < 24; h++) {
      const baseFactor = hourlyBaseFactors[h] || 0.38;
      // Let's vary slightly
      const variation = (h % 5 - 2) * 0.05;
      const factor = Math.max(0.2, baseFactor + variation);
      
      const realizado = Math.round(numPlantadoras * factor * 10) / 10;
      const meta = baseMetaFactor;
      const rendimento = Math.round((realizado / numPlantadoras) * 100) / 100;

      rows.push({
        usina,
        frente,
        hora: h,
        realizado,
        meta,
        plantadoras: numPlantadoras,
        rendimento
      });
    }
  });

  return rows;
};

export const VisaoPlantio: React.FC<VisaoPlantioProps> = ({
  onClose,
  lastPlantioUpdate,
  fleet,
  frentes,
  selectedUsina
}) => {
  const [selectedSubPage, setSelectedSubPage] = useState<string | null>(null);
  const [selectedDashboardUsina, setSelectedDashboardUsina] = useState<UsinaKey>(selectedUsina);

  // Spreadsheet imported data state
  const [importedData, setImportedData] = useState<ExcelPlantioRow[] | null>(() => {
    const saved = localStorage.getItem('imported_excel_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler dados importados salvos:', e);
      }
    }
    return null;
  });

  const defaultExcelData = useMemo(() => {
    return generateDefaultExcelData();
  }, []);

  const currentExcelData = useMemo(() => {
    return importedData || defaultExcelData;
  }, [importedData, defaultExcelData]);

  const handleDownloadTemplate = () => {
    const headers = ['Usina', 'Frente', 'Hora', 'Realizado (ha)', 'Meta (ha)', 'Plantadoras Ativas', 'Rendimento (ha/h)'];
    const sampleRows = [
      // Ariranha
      ['Ariranha', '72-1', 0, 1.2, 1.5, 3, 0.4],
      ['Ariranha', '72-1', 1, 1.4, 1.5, 3, 0.47],
      ['Ariranha', '72-1', 2, 0.8, 1.5, 2, 0.4],
      ['Ariranha', '72-1', 3, 0.5, 1.5, 1, 0.5],
      ['Ariranha', '72-1', 4, 1.8, 1.5, 3, 0.6],
      ['Ariranha', '72-1', 5, 1.5, 1.5, 3, 0.5],
      ['Ariranha', '72-1', 6, 2.1, 1.5, 3, 0.7],
      ['Ariranha', '72-1', 7, 1.2, 1.5, 3, 0.4],
      ['Ariranha', '72-1', 8, 1.3, 1.5, 3, 0.43],
      ['Ariranha', '72-1', 9, 1.4, 1.5, 3, 0.47],
      ['Ariranha', '72-1', 10, 1.5, 1.5, 3, 0.5],
      ['Ariranha', '72-1', 11, 1.6, 1.5, 3, 0.53],
      ['Ariranha', '72-1', 12, 1.2, 1.5, 3, 0.4],
      ['Ariranha', '72-1', 13, 1.1, 1.5, 3, 0.37],
      ['Ariranha', '72-1', 14, 1.3, 1.5, 3, 0.43],
      ['Ariranha', '72-1', 15, 1.4, 1.5, 3, 0.47],
      ['Ariranha', '72-1', 16, 1.5, 1.5, 3, 0.5],
      ['Ariranha', '72-1', 17, 1.6, 1.5, 3, 0.53],
      ['Ariranha', '72-1', 18, 1.3, 1.5, 3, 0.43],
      ['Ariranha', '72-1', 19, 1.2, 1.5, 3, 0.4],
      ['Ariranha', '72-1', 20, 1.1, 1.5, 3, 0.37],
      ['Ariranha', '72-1', 21, 1.0, 1.5, 2, 0.5],
      ['Ariranha', '72-1', 22, 1.2, 1.5, 3, 0.4],
      ['Ariranha', '72-1', 23, 1.3, 1.5, 3, 0.43],
      // Palestina
      ['Palestina', '84-5', 0, 1.5, 1.8, 4, 0.38],
      ['Palestina', '84-5', 1, 1.6, 1.8, 4, 0.4],
      ['Palestina', '84-5', 2, 1.1, 1.8, 3, 0.37],
      ['Palestina', '84-5', 3, 0.8, 1.8, 2, 0.4],
      ['Palestina', '84-5', 4, 2.2, 1.8, 4, 0.55],
      ['Palestina', '84-5', 5, 1.9, 1.8, 4, 0.48],
      ['Palestina', '84-5', 6, 2.5, 1.8, 4, 0.63],
      ['Palestina', '84-5', 7, 1.5, 1.8, 4, 0.38],
      ['Palestina', '84-5', 8, 1.6, 1.8, 4, 0.4],
      ['Palestina', '84-5', 9, 1.7, 1.8, 4, 0.43],
      ['Palestina', '84-5', 10, 1.8, 1.8, 4, 0.45],
      ['Palestina', '84-5', 11, 1.9, 1.8, 4, 0.48],
      ['Palestina', '84-5', 12, 1.5, 1.8, 4, 0.38],
      ['Palestina', '84-5', 13, 1.4, 1.8, 4, 0.35],
      ['Palestina', '84-5', 14, 1.6, 1.8, 4, 0.4],
      ['Palestina', '84-5', 15, 1.7, 1.8, 4, 0.43],
      ['Palestina', '84-5', 16, 1.8, 1.8, 4, 0.45],
      ['Palestina', '84-5', 17, 1.9, 1.8, 4, 0.48],
      ['Palestina', '84-5', 18, 1.6, 1.8, 4, 0.4],
      ['Palestina', '84-5', 19, 1.5, 1.8, 4, 0.38],
      ['Palestina', '84-5', 20, 1.4, 1.8, 4, 0.35],
      ['Palestina', '84-5', 21, 1.3, 1.8, 3, 0.43],
      ['Palestina', '84-5', 22, 1.5, 1.8, 4, 0.38],
      ['Palestina', '84-5', 23, 1.6, 1.8, 4, 0.4],
      // Santa Albertina
      ['Santa Albertina', '91-2', 0, 1.0, 1.2, 2, 0.5],
      ['Santa Albertina', '91-2', 1, 1.1, 1.2, 2, 0.55],
      ['Santa Albertina', '91-2', 2, 0.7, 1.2, 1, 0.7],
      ['Santa Albertina', '91-2', 3, 0.4, 1.2, 1, 0.4],
      ['Santa Albertina', '91-2', 4, 1.4, 1.2, 2, 0.7],
      ['Santa Albertina', '91-2', 5, 1.2, 1.2, 2, 0.6],
      ['Santa Albertina', '91-2', 6, 1.6, 1.2, 2, 0.8],
      ['Santa Albertina', '91-2', 7, 1.0, 1.2, 2, 0.5],
      ['Santa Albertina', '91-2', 8, 1.1, 1.2, 2, 0.55],
      ['Santa Albertina', '91-2', 9, 1.2, 1.2, 2, 0.6],
      ['Santa Albertina', '91-2', 10, 1.3, 1.2, 2, 0.65],
      ['Santa Albertina', '91-2', 11, 1.4, 1.2, 2, 0.7],
      ['Santa Albertina', '91-2', 12, 1.0, 1.2, 2, 0.5],
      ['Santa Albertina', '91-2', 13, 0.9, 1.2, 2, 0.45],
      ['Santa Albertina', '91-2', 14, 1.1, 1.2, 2, 0.55],
      ['Santa Albertina', '91-2', 15, 1.2, 1.2, 2, 0.6],
      ['Santa Albertina', '91-2', 16, 1.3, 1.2, 2, 0.65],
      ['Santa Albertina', '91-2', 17, 1.4, 1.2, 2, 0.7],
      ['Santa Albertina', '91-2', 18, 1.1, 1.2, 2, 0.55],
      ['Santa Albertina', '91-2', 19, 1.0, 1.2, 2, 0.5],
      ['Santa Albertina', '91-2', 20, 0.9, 1.2, 2, 0.45],
      ['Santa Albertina', '91-2', 21, 0.8, 1.2, 1, 0.8],
      ['Santa Albertina', '91-2', 22, 1.0, 1.2, 2, 0.5],
      ['Santa Albertina', '91-2', 23, 1.1, 1.2, 2, 0.55]
    ];

    const data = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantio_Hora_Hora");
    XLSX.writeFile(wb, "Modelo_Importacao_Plantio.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const mappedRows: ExcelPlantioRow[] = [];
        data.forEach((row: any) => {
          const findValue = (possibleKeys: string[], defaultVal: any) => {
            for (const key of Object.keys(row)) {
              if (possibleKeys.some(pk => key.toLowerCase().trim().includes(pk.toLowerCase()))) {
                return row[key];
              }
            }
            return defaultVal;
          };

          const rawUsina = findValue(['usina', 'unidade', 'fabrica'], 'Ariranha');
          let usina: UsinaKey = 'Ariranha';
          if (rawUsina.toString().toLowerCase().includes('palestina') || rawUsina.toString().toLowerCase().includes('pal')) {
            usina = 'Palestina';
          } else if (rawUsina.toString().toLowerCase().includes('albertina') || rawUsina.toString().toLowerCase().includes('sta')) {
            usina = 'Santa Albertina';
          }

          const frente = findValue(['frente', 'talhao', 'area'], '72-1').toString();
          const horaVal = findValue(['hora', 'time', 'hour'], 0);
          
          let hora = 0;
          if (typeof horaVal === 'number') {
            hora = Math.floor(horaVal) % 24;
          } else if (typeof horaVal === 'string') {
            const clean = horaVal.replace(/[^\d:]/g, '');
            if (clean.includes(':')) {
              hora = parseInt(clean.split(':')[0]) || 0;
            } else {
              hora = parseInt(clean) || 0;
            }
            hora = hora % 24;
          }

          const realizado = parseFloat(findValue(['realizado', 'ha', 'hectares', 'feito'], 0)) || 0;
          const meta = parseFloat(findValue(['meta', 'planejado', 'goal'], 0)) || 0;
          const plantadoras = parseInt(findValue(['plantadoras', 'maquinas', 'tratores', 'ativos'], 3)) || 0;
          const rendimento = parseFloat(findValue(['rendimento', 'produtividade', 'rend', 'ha/h'], 0)) || 0;

          mappedRows.push({
            usina,
            frente,
            hora,
            realizado,
            meta,
            plantadoras,
            rendimento: rendimento || (plantadoras > 0 ? realizado / plantadoras : 0)
          });
        });

        if (mappedRows.length > 0) {
          setImportedData(mappedRows);
          localStorage.setItem('imported_excel_data', JSON.stringify(mappedRows));
          setDynamicUpdateTime(getFormattedDateTime());
          alert(`Sucesso! ${mappedRows.length} registros de plantio importados com sucesso.`);
        } else {
          alert('Nenhum registro de plantio válido pôde ser importado. Verifique os cabeçalhos das colunas.');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao processar arquivo Excel. Certifique-se de que é um arquivo válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // State for manual overrides for each card, per usina
  const [cardOverrides, setCardOverrides] = useState<Record<UsinaKey, Record<string, string>>>({
    'Ariranha': {},
    'Palestina': {},
    'Santa Albertina': {}
  });

  const [cobricaoOverrides, setCobricaoOverrides] = useState<Record<UsinaKey, Record<string, string>>>({
    'Ariranha': {},
    'Palestina': {},
    'Santa Albertina': {}
  });

  const [timelineHourStatus, setTimelineHourStatus] = useState<Record<string, string>>({});

  // Dynamic update time state
  const getFormattedDateTime = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const [dynamicUpdateTime, setDynamicUpdateTime] = useState<string>(lastPlantioUpdate);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    setDynamicUpdateTime(lastPlantioUpdate);
  }, [lastPlantioUpdate]);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDynamicUpdateTime(getFormattedDateTime());
  }, [cardOverrides, cobricaoOverrides, timelineHourStatus, fleet, frentes]);

  const [editingCard, setEditingCard] = useState<{ usina: UsinaKey, cardKey: string, cardName: string, currentValue: string, isCobricao?: boolean } | null>(null);

  // Sync with global usina selection initially or when it changes
  React.useEffect(() => {
    setSelectedDashboardUsina(selectedUsina);
  }, [selectedUsina]);

  // City mapping helper
  const getAbbrFromUsinaKey = (key: UsinaKey): string => {
    if (key === 'Ariranha') return 'ARI';
    if (key === 'Palestina') return 'PAL';
    return 'STA';
  };

  // Helper to get productivity based on status and hour
  const getProductivity = React.useCallback((status: string | undefined, hourIdx: number, prefixo: string) => {
    if (!status) return 0;
    if (status !== 'Trabalhando' && status !== 'Trabalhando Parcial') {
      return 0;
    }
    const isWorking = status === 'Trabalhando';
    const factor = isWorking ? 1 : 0.5;

    // Cyclic hourly pattern for 24 hours to give realistic, beautifully varying productivity values
    const hourlyBaseFactors = [
      0.38, 0.38, 0.35, 0.30, 0.42, 0.40, 0.45, 0.38, 0.38, // 00h - 08h
      0.39, 0.41, 0.43, 0.40, 0.37, 0.36, 0.38, 0.40, 0.42, // 09h - 17h
      0.39, 0.38, 0.35, 0.34, 0.36, 0.37                    // 18h - 23h
    ];

    const baseFactor = hourlyBaseFactors[hourIdx % 24] || 0.38;

    // Specific equipment overrides to preserve exact screenshot patterns for h 0-8
    if (prefixo === 'TR-001' || prefixo === 'PL-042' || prefixo === 'TR-015') {
      if (hourIdx >= 0 && hourIdx <= 8) {
        if (hourIdx === 0) return (prefixo === 'TR-001' ? 0.38 : prefixo === 'PL-042' ? 0.40 : 0.32) * factor;
        if (hourIdx === 1) return (prefixo === 'TR-001' ? 0.38 : prefixo === 'PL-042' ? 0.40 : 0.32) * factor;
        if (hourIdx === 2) return (prefixo === 'TR-001' ? 0.38 : prefixo === 'PL-042' ? 0.20 : 0.32) * factor;
        if (hourIdx === 3) return (prefixo === 'TR-001' ? 0.20 : prefixo === 'PL-042' ? 0.15 : 0.15) * factor;
        if (hourIdx === 4) return (prefixo === 'TR-001' ? 0.48 : prefixo === 'PL-042' ? 0.50 : 0.42) * factor;
        if (hourIdx === 5) return (prefixo === 'TR-001' ? 0.40 : prefixo === 'PL-042' ? 0.45 : 0.35) * factor;
        if (hourIdx === 6) return (prefixo === 'TR-001' ? 0.52 : prefixo === 'PL-042' ? 0.55 : 0.43) * factor;
        if (hourIdx === 7) return (prefixo === 'TR-001' ? 0.38 : prefixo === 'PL-042' ? 0.40 : 0.32) * factor;
        if (hourIdx === 8) return (prefixo === 'TR-001' ? 0.38 : prefixo === 'PL-042' ? 0.40 : 0.32) * factor;
      }
    }

    // Default base value for general calculation
    let baseVal = baseFactor;
    if (prefixo.includes('PL') || prefixo.startsWith('PL-')) {
      baseVal = baseFactor + 0.02;
    } else if (prefixo.includes('TR') || prefixo.startsWith('TR-')) {
      baseVal = baseFactor - 0.03;
    }

    const hash = (prefixo.charCodeAt(3) || 0) + hourIdx;
    const variation = (hash % 7 - 3) * 0.02;

    const result = (baseVal + variation) * factor;
    return Math.max(0.1, Math.round(result * 100) / 100);
  }, []);

  // Hours list from 00:00 to 23:00 (24 hours)
  const hoursList = Array.from({ length: 24 }, (_, i) => {
    return `${i.toString().padStart(2, '0')}:00`;
  });

  // Filter plantio frentes and fleet
  const plantioFrentes = useMemo(() => {
    return frentes.filter(f => f.cidade === selectedUsina && f.nome.toLowerCase().includes('plantio'));
  }, [frentes, selectedUsina]);

  const plantioFleet = useMemo(() => {
    return fleet.filter(item => item.unidade === selectedUsina && (item.tipo === 'Trator' || item.tipo === 'Plantadeira'));
  }, [fleet, selectedUsina]);

  // Dynamic Dashboard Calculations for the "Plantio Hora a Hora" Page
  const activeFrentesForDash = useMemo(() => {
    let list = frentes.filter(f => f.cidade === selectedDashboardUsina && (f.nome.toLowerCase().includes('plantio') || f.nome.toLowerCase().includes('mecanizado')));
    if (list.length === 0) {
      list = frentes.filter(f => f.cidade === selectedDashboardUsina);
    }
    if (list.length > 0) {
      return list;
    }
    const defaultFrenteName = selectedDashboardUsina === 'Santa Albertina' ? '72-1' : selectedDashboardUsina === 'Ariranha' ? '84-5' : '91-2';
    return [
      {
        id: 9991,
        frente: defaultFrenteName,
        nome: 'Plantio/Mecanizado',
        fazenda: 'Fazenda Unidade',
        cidade: selectedDashboardUsina,
        quadras: 10,
        talhoes: 30,
        gestor: 'Supervisor Local',
        status: 'Trabalhando',
        obs: '',
        updatedAt: ''
      }
    ];
  }, [frentes, selectedDashboardUsina]);

  const activeFleetForDash = useMemo(() => {
    let list = fleet.filter(item => item.unidade === selectedDashboardUsina && (item.tipo === 'Trator' || item.tipo === 'Plantadeira'));
    if (list.length > 0) {
      return list;
    }
    return [
      { id: 9101, unidade: selectedDashboardUsina, tipo: 'Trator', modelo: 'John Deere 8R', prefixo: 'TR-001', status: 'Trabalhando', updatedAt: '', hourlyData: Array(24).fill('Trabalhando') },
      { id: 9102, unidade: selectedDashboardUsina, tipo: 'Plantadeira', modelo: 'DB90', prefixo: 'PL-042', status: 'Trabalhando', updatedAt: '', hourlyData: Array(24).fill('Trabalhando') },
      { id: 9103, unidade: selectedDashboardUsina, tipo: 'Trator', modelo: 'Case IH 340', prefixo: 'TR-015', status: 'Reserva', updatedAt: '', hourlyData: Array(24).fill('Reserva') }
    ];
  }, [fleet, selectedDashboardUsina]);

  const hourlyDataPoints = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina);
    return Array.from({ length: 24 }, (_, h) => {
      const hourRows = usinaRows.filter(r => r.hora === h);
      const sumRealizado = hourRows.reduce((acc, curr) => acc + curr.realizado, 0);
      const sumMeta = hourRows.reduce((acc, curr) => acc + curr.meta, 0);
      return {
        hour: `${h.toString().padStart(2, '0')}h`,
        ha: Math.round(sumRealizado * 10) / 10,
        meta: Math.round(sumMeta * 10) / 10
      };
    });
  }, [currentExcelData, selectedDashboardUsina]);

  const lastHourIdx = useMemo(() => {
    for (let i = 23; i >= 0; i--) {
      if ((hourlyDataPoints[i]?.ha || 0) > 0) {
        return i;
      }
    }
    return Math.min(23, Math.max(0, new Date().getHours()));
  }, [hourlyDataPoints]);

  const lastHourVal = useMemo(() => {
    return hourlyDataPoints[lastHourIdx]?.ha || 0;
  }, [hourlyDataPoints, lastHourIdx]);

  const realizadoVal = useMemo(() => {
    const sum = hourlyDataPoints.reduce((acc, curr) => acc + curr.ha, 0);
    return Math.round(sum * 10) / 10;
  }, [hourlyDataPoints]);

  const activeHoursCount = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina);
    let count = 0;
    for (let h = 0; h < 24; h++) {
      const hasActivity = usinaRows.some(r => r.hora === h && r.realizado > 0);
      if (hasActivity) {
        count++;
      }
    }
    return count || 24;
  }, [currentExcelData, selectedDashboardUsina]);

  const projectionVal = useMemo(() => {
    if (realizadoVal <= 0) return 0;
    return Math.round((realizadoVal / activeHoursCount) * 24 * 10) / 10;
  }, [realizadoVal, activeHoursCount]);

  const plantadorasVal = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina && r.hora === lastHourIdx);
    const sumPlantadoras = usinaRows.reduce((acc, curr) => acc + curr.plantadoras, 0);
    return sumPlantadoras || 3;
  }, [currentExcelData, selectedDashboardUsina, lastHourIdx]);

  const medRealizadoHr = useMemo(() => {
    return Math.round((realizadoVal / activeHoursCount) * 100) / 100;
  }, [realizadoVal, activeHoursCount]);

  const rendHr = useMemo(() => {
    if (plantadorasVal <= 0) return 0;
    return Math.round((medRealizadoHr / plantadorasVal) * 100) / 100;
  }, [medRealizadoHr, plantadorasVal]);

  const rendDia = useMemo(() => {
    if (plantadorasVal <= 0) return 0;
    return Math.round((realizadoVal / plantadorasVal) * 100) / 100;
  }, [realizadoVal, plantadorasVal]);

  const finalRealizadoVal = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['realizado'];
    if (override !== undefined && override !== '') {
      const parsed = parseFloat(override.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    return realizadoVal;
  }, [cardOverrides, selectedDashboardUsina, realizadoVal]);

  const finalProjectionVal = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['projecao'];
    if (override !== undefined && override !== '') {
      const parsed = parseFloat(override.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    return projectionVal;
  }, [cardOverrides, selectedDashboardUsina, projectionVal]);

  const finalPlantadorasVal = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['plantadoras'];
    if (override !== undefined && override !== '') {
      const parsed = parseInt(override);
      if (!isNaN(parsed)) return parsed;
    }
    return plantadorasVal;
  }, [cardOverrides, selectedDashboardUsina, plantadorasVal]);

  const finalMedRealizadoHr = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['medRealizadoHr'];
    if (override !== undefined && override !== '') {
      const parsed = parseFloat(override.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    return medRealizadoHr;
  }, [cardOverrides, selectedDashboardUsina, medRealizadoHr]);

  const finalRendHr = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['rendPltHr'];
    if (override !== undefined && override !== '') {
      const parsed = parseFloat(override.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    return rendHr;
  }, [cardOverrides, selectedDashboardUsina, rendHr]);

  const finalRendDia = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['rendPltDia'];
    if (override !== undefined && override !== '') {
      const parsed = parseFloat(override.replace(',', '.'));
      if (!isNaN(parsed)) return parsed;
    }
    return rendDia;
  }, [cardOverrides, selectedDashboardUsina, rendDia]);

  const finalMeta8h = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['meta8h'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cardOverrides, selectedDashboardUsina]);

  const finalMetaDia = useMemo(() => {
    const override = cardOverrides[selectedDashboardUsina]?.['metaDia'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cardOverrides, selectedDashboardUsina]);

  const cobRealizado = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['realizado'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobMeta8h = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['meta8h'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobProjecao = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['projecao'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobMetaDia = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['metaDia'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobTratoores = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['tratores'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobRendTratorHr = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['rendTratorHr'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobRendTratorDia = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['rendTratorDia'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const cobMedRealizadoHr = useMemo(() => {
    const override = cobricaoOverrides[selectedDashboardUsina]?.['medRealizadoHr'];
    if (override !== undefined && override !== '') {
      return override;
    }
    return '(Vazio)';
  }, [cobricaoOverrides, selectedDashboardUsina]);

  const frentesChartData = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina);
    const frentesMap: Record<string, number> = {};
    usinaRows.forEach(r => {
      frentesMap[r.frente] = (frentesMap[r.frente] || 0) + r.realizado;
    });
    return Object.entries(frentesMap).map(([name, val]) => ({
      name,
      subLabel: getAbbrFromUsinaKey(selectedDashboardUsina),
      ha: Math.round(val * 10) / 10
    }));
  }, [currentExcelData, selectedDashboardUsina]);

  const bottomFrentesChartData = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina && r.hora === lastHourIdx);
    const frentesMap: Record<string, number> = {};
    usinaRows.forEach(r => {
      frentesMap[r.frente] = (frentesMap[r.frente] || 0) + r.realizado;
    });
    return Object.entries(frentesMap).map(([name, val]) => ({
      name,
      subLabel: getAbbrFromUsinaKey(selectedDashboardUsina),
      ha: Math.round(val * 10) / 10
    }));
  }, [currentExcelData, selectedDashboardUsina, lastHourIdx]);

  const qtyPlantadorasChartData = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina && r.hora === lastHourIdx);
    const frentesMap: Record<string, number> = {};
    usinaRows.forEach(r => {
      frentesMap[r.frente] = (frentesMap[r.frente] || 0) + r.plantadoras;
    });
    return Object.entries(frentesMap).map(([name, val]) => ({
      name: `${getAbbrFromUsinaKey(selectedDashboardUsina)} ${name}`,
      value: val
    }));
  }, [currentExcelData, selectedDashboardUsina, lastHourIdx]);

  const rendPlantadoraChartData = useMemo(() => {
    const usinaRows = currentExcelData.filter(r => r.usina === selectedDashboardUsina && r.hora === lastHourIdx);
    const frentesMap: Record<string, number> = {};
    usinaRows.forEach(r => {
      frentesMap[r.frente] = r.rendimento;
    });
    return Object.entries(frentesMap).map(([name, val]) => ({
      name: `${getAbbrFromUsinaKey(selectedDashboardUsina)} ${name}`,
      value: Math.round(val * 100) / 100
    }));
  }, [currentExcelData, selectedDashboardUsina, lastHourIdx]);

  // Helper to get metrics dynamically for each Usina
  const getUsinaMetrics = React.useCallback((usina: UsinaKey) => {
    const usinaRows = currentExcelData.filter(r => r.usina === usina);

    // 2. Calculate hourly data points
    const points = Array.from({ length: 24 }, (_, h) => {
      const hourRows = usinaRows.filter(r => r.hora === h);
      const sumRealizado = hourRows.reduce((acc, curr) => acc + curr.realizado, 0);
      return {
        hour: h.toString(),
        ha: Math.round(sumRealizado * 10) / 10,
      };
    });

    // 3. Realizado base value
    const sum = points.reduce((acc, curr) => acc + curr.ha, 0);
    const baseRealizado = Math.round(sum * 10) / 10;

    // 4. Projeção base value
    let activeHoursCount = 0;
    for (let h = 0; h < 24; h++) {
      const hasActivity = usinaRows.some(r => r.hora === h && r.realizado > 0);
      if (hasActivity) {
        activeHoursCount++;
      }
    }
    const divisor = activeHoursCount || 24;
    const baseProjecao = baseRealizado <= 0 ? 0 : Math.round((baseRealizado / divisor) * 24 * 10) / 10;

    // 5. Final values with overrides
    // Realizado
    let finalReal = baseRealizado;
    const ovReal = cardOverrides[usina]?.['realizado'];
    if (ovReal !== undefined && ovReal !== '') {
      const parsed = parseFloat(ovReal.replace(',', '.'));
      if (!isNaN(parsed)) finalReal = parsed;
    }

    // Meta até as 8h
    let finalMeta8 = 0;
    const ovMeta8 = cardOverrides[usina]?.['meta8h'];
    if (ovMeta8 !== undefined && ovMeta8 !== '') {
      const parsed = parseFloat(ovMeta8.replace(',', '.'));
      if (!isNaN(parsed)) finalMeta8 = parsed;
    }

    // Projeção
    let finalProj = baseProjecao;
    const ovProj = cardOverrides[usina]?.['projecao'];
    if (ovProj !== undefined && ovProj !== '') {
      const parsed = parseFloat(ovProj.replace(',', '.'));
      if (!isNaN(parsed)) finalProj = parsed;
    }

    // Meta Dia
    let finalMetaD = 0;
    const ovMetaD = cardOverrides[usina]?.['metaDia'];
    if (ovMetaD !== undefined && ovMetaD !== '') {
      const parsed = parseFloat(ovMetaD.replace(',', '.'));
      if (!isNaN(parsed)) finalMetaD = parsed;
    }

    // Text representations
    const realTxt = ovReal !== undefined && ovReal !== '' ? ovReal : (baseRealizado > 0 ? baseRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--');
    const meta8Txt = ovMeta8 !== undefined && ovMeta8 !== '' ? ovMeta8 : '--';
    const projTxt = ovProj !== undefined && ovProj !== '' ? ovProj : (baseProjecao > 0 ? baseProjecao.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--');
    const metaDTxt = ovMetaD !== undefined && ovMetaD !== '' ? ovMetaD : '--';

    // Calculate performance % if meta is defined
    let performance = 0;
    if (finalMetaD > 0) {
      performance = (finalReal / finalMetaD) * 100;
    }

    return {
      realizadoVal: finalReal,
      meta8hVal: finalMeta8,
      projectionVal: finalProj,
      metaDiaVal: finalMetaD,
      realTxt,
      meta8Txt,
      projTxt,
      metaDTxt,
      performance,
      hasRealOverride: ovReal !== undefined && ovReal !== '',
      hasMeta8Override: ovMeta8 !== undefined && ovMeta8 !== '',
      hasProjOverride: ovProj !== undefined && ovProj !== '',
      hasMetaDOverride: ovMetaD !== undefined && ovMetaD !== '',
    };
  }, [cardOverrides, currentExcelData]);

  const consolidatedMetrics = useMemo(() => {
    const ariranha = getUsinaMetrics('Ariranha');
    const palestina = getUsinaMetrics('Palestina');
    const santaAlbertina = getUsinaMetrics('Santa Albertina');

    const totalReal = ariranha.realizadoVal + palestina.realizadoVal + santaAlbertina.realizadoVal;
    const totalMeta8h = ariranha.meta8hVal + palestina.meta8hVal + santaAlbertina.meta8hVal;
    const totalProj = ariranha.projectionVal + palestina.projectionVal + santaAlbertina.projectionVal;
    const totalMetaDia = ariranha.metaDiaVal + palestina.metaDiaVal + santaAlbertina.metaDiaVal;

    // Check if overrides or base values are set to determine if we show '--' or numeric sum
    const hasReal = ariranha.realizadoVal > 0 || palestina.realizadoVal > 0 || santaAlbertina.realizadoVal > 0 || ariranha.hasRealOverride || palestina.hasRealOverride || santaAlbertina.hasRealOverride;
    const hasMeta8 = ariranha.meta8hVal > 0 || palestina.meta8hVal > 0 || santaAlbertina.meta8hVal > 0 || ariranha.hasMeta8Override || palestina.hasMeta8Override || santaAlbertina.hasMeta8Override;
    const hasProj = ariranha.projectionVal > 0 || palestina.projectionVal > 0 || santaAlbertina.projectionVal > 0 || ariranha.hasProjOverride || palestina.hasProjOverride || santaAlbertina.hasProjOverride;
    const hasMetaDia = ariranha.metaDiaVal > 0 || palestina.metaDiaVal > 0 || santaAlbertina.metaDiaVal > 0 || ariranha.hasMetaDOverride || palestina.hasMetaDOverride || santaAlbertina.hasMetaDOverride;

    const realTxt = hasReal ? totalReal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--';
    const meta8Txt = hasMeta8 ? totalMeta8h.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--';
    const projTxt = hasProj ? totalProj.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--';
    const metaDTxt = hasMetaDia ? totalMetaDia.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '--';

    let performance = 0;
    if (totalMetaDia > 0) {
      performance = (totalReal / totalMetaDia) * 100;
    }

    return {
      ariranha,
      palestina,
      santaAlbertina,
      totalReal,
      totalMeta8h,
      totalProj,
      totalMetaDia,
      realTxt,
      meta8Txt,
      projTxt,
      metaDTxt,
      performance
    };
  }, [cardOverrides, fleet, getUsinaMetrics]);

  // Hourly plantio data for Recharts
  const hourlyPlantedArea = useMemo(() => {
    return hoursList.map((hour, idx) => {
      // simulate cumulative planted area
      const factor = selectedUsina === 'Ariranha' ? 12 : selectedUsina === 'Santa Albertina' ? 9 : 14;
      const baseReal = Math.round((idx + 1) * (factor * 1.1) + Math.sin(idx) * 3);
      const baseMeta = Math.round((idx + 1) * factor);
      return {
        hour,
        Realizado: baseReal,
        Meta: baseMeta,
        Eficiência: Math.round((baseReal / baseMeta) * 100)
      };
    });
  }, [selectedUsina]);

  // Cobrição data
  const cobricaoData = useMemo(() => {
    return hoursList.map((hour, idx) => {
      const base = selectedUsina === 'Ariranha' ? 15 : selectedUsina === 'Santa Albertina' ? 11 : 18;
      return {
        hour,
        'Cobrição A': Math.round(base * 0.4 + Math.sin(idx * 0.8) * 2),
        'Cobrição B': Math.round(base * 0.5 + Math.cos(idx * 0.6) * 3),
        'Total Coberto': Math.round(base + Math.sin(idx) * 4)
      };
    });
  }, [selectedUsina]);

  // Terceiros machinery performance
  const terceirosData = useMemo(() => {
    return [
      { name: 'AgroServ S.A.', Proprio: 0, Terceiro: 91, color: '#002855' },
      { name: 'LocaTerra', Proprio: 0, Terceiro: 86, color: '#003A70' },
      { name: 'Parcerias Sul', Proprio: 0, Terceiro: 88, color: '#004B87' },
      { name: 'Próprio Colombo', Proprio: 95, Terceiro: 0, color: '#00843D' },
    ];
  }, []);

  // Status handler for interactive timeline
  const handleToggleTimelineStatus = (equipPref: string, hour: string) => {
    const key = `${equipPref}-${hour}`;
    const current = timelineHourStatus[key] || 'Trabalhando';
    let next = 'Trabalhando';
    if (current === 'Trabalhando') next = 'Parada';
    else if (current === 'Parada') next = 'Clima';
    else if (current === 'Clima') next = 'Manutenção';
    else next = 'Trabalhando';

    setTimelineHourStatus(prev => ({
      ...prev,
      [key]: next
    }));
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'Trabalhando': return 'bg-green-500 hover:bg-green-600 border-green-600';
      case 'Parada': return 'bg-orange-500 hover:bg-orange-600 border-orange-600';
      case 'Clima': return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
      case 'Manutenção': return 'bg-red-600 hover:bg-red-700 border-red-700';
      default: return 'bg-green-500 hover:bg-green-600 border-green-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F3F4F6] text-gray-800 flex flex-col font-sans overflow-hidden">
      
      {/* HEADER BAR FLOATING IN THE VIEWPORT (STAY CONTROLLABLE) */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={() => {
            if (selectedSubPage) {
              setSelectedSubPage(null);
            } else {
              onClose();
            }
          }}
          className="bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 transition-all active:scale-95 border border-gray-200"
        >
          <ArrowLeft size={16} strokeWidth={3} />
          Voltar
        </button>
      </div>

      {selectedSubPage === null ? (
        /* LANDING PAGE - IDENTICAL TO SCREENSHOT LAYOUT */
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* LEFT AREA: HEADER & BRAND LOGOS */}
          <div className="w-full md:w-[42%] flex flex-col justify-between bg-[#F3F4F6] relative z-10">
            
            {/* Top Blue Banner */}
            <div className="bg-[#002855] text-white p-10 pt-12 pb-14 rounded-br-[70px] relative shadow-lg flex flex-col justify-center select-none">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Plantio Hora a Hora</h1>
              <p className="text-sm font-bold text-white/70 tracking-[0.2em] mt-1.5 uppercase">Plantio 2026</p>
            </div>

            {/* Central Logos Section - Large Original Image */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 px-6 select-none">
              <div className="w-full max-w-[360px] md:max-w-[420px] px-2">
                <img 
                  src={logoImg} 
                  alt="Colombo Agroindústria & Gestão da Informação" 
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-contain rounded-[36px] shadow-xl border border-gray-100/80 bg-white p-2 hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
            </div>

            {/* Bottom Sky-Blue Band */}
            <div className="h-[30%] w-full bg-[#54b8ff]" />

          </div>

          {/* RIGHT AREA: THE rounded PAGES CONTAINER */}
          <div className="w-full md:w-[58%] bg-[#54b8ff] md:bg-transparent flex flex-col relative">
            
            {/* The absolute sky-blue block beneath the container to align spacing precisely */}
            <div className="hidden md:block absolute inset-y-0 right-0 left-0 bg-[#54b8ff] -z-10" />

            <div className="bg-white rounded-[40px] md:rounded-[48px] shadow-2xl flex-1 flex flex-col justify-between p-8 md:p-12 my-6 mr-6 overflow-hidden">
              
              {/* Header Title inside the card */}
              <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold italic text-[#002855] tracking-wide mb-8 pl-4 uppercase">
                  Páginas
                </h2>
              </div>

              {/* Slanted Parallelogram Buttons Stack */}
              <div className="flex-1 flex flex-col justify-center space-y-5 max-w-md mx-auto w-full py-4">
                
                {/* Button 1: Plantio Hora Hora */}
                <button 
                  onClick={() => setSelectedSubPage('plantio-hora')}
                  className="group relative w-full h-16 bg-[#001F3F] text-white hover:bg-[#002855] hover:scale-[1.03] transition-all duration-200 shadow-md rounded overflow-hidden transform -skew-x-[16deg] flex items-center justify-center border border-[#001D4A]"
                >
                  <div className="transform skew-x-[16deg] font-black italic text-sm md:text-base tracking-wider uppercase">
                    Plantio Hora Hora
                  </div>
                </button>

                {/* Button 4: Visão Corporativa */}
                <button 
                  onClick={() => setSelectedSubPage('visao-corporativa')}
                  className="group relative w-full h-16 bg-[#001F3F] text-white hover:bg-[#002855] hover:scale-[1.03] transition-all duration-200 shadow-md rounded overflow-hidden transform -skew-x-[16deg] flex items-center justify-center border border-[#001D4A]"
                >
                  <div className="transform skew-x-[16deg] font-black italic text-sm md:text-base tracking-wider uppercase">
                    Visão Corporativa
                  </div>
                </button>

                {/* Hidden File Input for Excel parsing */}
                <input 
                  type="file" 
                  id="excel-upload-input" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />

                {/* Button 3: Importar Planilha Excel */}
                <button 
                  onClick={() => document.getElementById('excel-upload-input')?.click()}
                  className="group relative w-full h-16 bg-[#00843D] text-white hover:bg-[#006e32] hover:scale-[1.03] transition-all duration-200 shadow-md rounded overflow-hidden transform -skew-x-[16deg] flex items-center justify-center border border-[#005a28]"
                >
                  <div className="transform skew-x-[16deg] font-black italic text-sm md:text-base tracking-wider uppercase flex items-center gap-2">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                    Importar Planilha
                  </div>
                </button>

              </div>

              {/* Bottom Right Update Timestamp */}
              <div className="text-right mt-6 mr-4 select-none">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest text-right block">
                  Últ. Atualização
                </span>
                <span className="text-xs text-gray-500 font-black tracking-wider text-right block mt-0.5">
                  {dynamicUpdateTime}
                </span>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* INTERACTIVE DASHBOARD DETAIL VIEWS (WHEN SUB-PAGES CLICKED) */
        <div className={`flex-1 overflow-y-auto ${(selectedSubPage === 'plantio-hora' || selectedSubPage === 'cobricao-hora') ? 'bg-[#F4F6FA] pb-10 pt-16 md:pt-0' : 'p-6 md:p-10 space-y-8 pt-20 bg-[#F3F4F6]'}`}>
          
          {/* Header of detail dashboard */}
          {selectedSubPage !== 'plantio-hora' && selectedSubPage !== 'cobricao-hora' && (
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#002855] text-white rounded-2xl flex items-center justify-center shadow-md">
                  <Sprout size={24} />
                </div>
                <div>
                  <span className="text-xs font-black text-[#00843D] uppercase tracking-wider block">
                    Unidade / {selectedUsina}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#002855] uppercase tracking-tight">
                    {selectedSubPage === 'cobricao-hora' ? 'Cobrição Hora Hora' :
                     selectedSubPage === 'terceiro-hora' ? 'Terceiro Hora Hora' :
                     selectedSubPage === 'visao-corporativa' ? 'Visão Corporativa' :
                     'Relatório D-1 Consolidados'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-xs font-bold text-gray-500">
                <Clock size={14} className="text-gray-400" />
                Última Sincronização: {dynamicUpdateTime}
              </div>
            </div>
          )}

          {/* SUB-PAGE 1: Plantio Hora Hora - IMMERSIVE ORIGINAL DASHBOARD */}
          {selectedSubPage === 'plantio-hora' && (
            <div className="space-y-6">
              
              {/* Top Dark Blue Header Banner */}
              <div className="bg-[#00205B] text-white p-6 md:pl-10 md:pr-48 md:py-8 rounded-b-[36px] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative select-none">
                {/* Left: Title & Subtitle */}
                <div className="text-left w-full lg:w-auto">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                    Plantio Hora a Hora
                  </h1>
                  <p className="text-sm md:text-base font-bold text-white/80 tracking-wider mt-1.5 uppercase">
                    Mecanizado Próprio
                  </p>
                </div>

                {/* Center: Tabs Filter (ARI, PAL, STA) */}
                <div className="flex items-center bg-white p-1 rounded-2xl shadow-inner border border-gray-100">
                  {(['Ariranha', 'Palestina', 'Santa Albertina'] as UsinaKey[]).map((usina) => {
                    const abbr = usina === 'Ariranha' ? 'ARI' : usina === 'Palestina' ? 'PAL' : 'STA';
                    const isActive = selectedDashboardUsina === usina;
                    return (
                      <button
                        key={usina}
                        onClick={() => setSelectedDashboardUsina(usina)}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive
                            ? 'bg-[#333333] text-white shadow-md'
                            : 'bg-white text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {abbr}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Last Update & Logo Badge */}
                <div className="flex items-center gap-6 self-end lg:self-auto w-full lg:w-auto justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Últ. Atualização</p>
                    <p className="text-sm font-black text-white/95 mt-1.5 leading-none">
                      {dynamicUpdateTime}
                    </p>
                  </div>

                  {/* COA and Gestão badges replication */}
                  <div className="flex items-center gap-3">
                    {/* COA Badge (Green circle, yellow border) */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPage('visao-corporativa');
                      }}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1b5e20] hover:bg-[#144718] hover:scale-105 active:scale-95 border-2 border-[#ffeb3b] text-white shadow-md cursor-pointer transition-all duration-200"
                      title="Ir para Visão Corporativa"
                    >
                      <div className="text-center font-black leading-none text-[8px] tracking-tight">
                        <p className="text-[8px] leading-none">COA</p>
                        <p className="text-[4px] leading-none uppercase text-[#ffeb3b]">Centro de</p>
                        <p className="text-[4px] leading-none uppercase text-[#ffeb3b]">Operações</p>
                      </div>
                    </div>
                    
                    {/* Gestão da Informação Badge */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPage(null);
                      }}
                      className="flex items-center gap-1.5 bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 px-2.5 py-1.5 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all duration-200"
                      title="Voltar ao Menu Principal"
                    >
                      <div className="w-5 h-5 rounded-md bg-[#00843D] flex items-center justify-center text-white text-xs">
                        📈
                      </div>
                      <div className="text-left leading-none select-none">
                        <p className="text-[7px] font-extrabold text-[#002855] uppercase leading-none">Gestão da</p>
                        <p className="text-[7px] font-black text-[#00843D] uppercase leading-none mt-0.5 tracking-widest">Informação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Metrics Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 px-6 md:px-10 mt-6 select-none">
                
                {/* Card 1: Realizado */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'realizado',
                      cardName: 'Realizado',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['realizado'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['realizado']
                        : realizadoVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Realizado"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Realizado
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xl font-black text-gray-900 tracking-tight">
                      {typeof finalRealizadoVal === 'number' 
                        ? finalRealizadoVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                        : finalRealizadoVal}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm shrink-0 inline-block" />
                  </div>
                  {cardOverrides[selectedDashboardUsina]?.['realizado'] !== undefined && cardOverrides[selectedDashboardUsina]?.['realizado'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 2: Meta até as 8h */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'meta8h',
                      cardName: 'Meta até as 8h',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['meta8h'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['meta8h']
                        : ''
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Meta até as 8h"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Meta até as 8h
                  </span>
                  <span className={`text-xl font-black mt-2 block ${finalMeta8h === '(Vazio)' ? 'text-gray-300 text-sm font-extrabold' : 'text-gray-900 tracking-tight'}`}>
                    {finalMeta8h}
                  </span>
                  {cardOverrides[selectedDashboardUsina]?.['meta8h'] !== undefined && cardOverrides[selectedDashboardUsina]?.['meta8h'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 3: Projeção */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'projecao',
                      cardName: 'Projeção',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['projecao'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['projecao']
                        : projectionVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Projeção"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Projeção
                  </span>
                  <span className="text-xl font-black text-gray-900 mt-2 tracking-tight">
                    {typeof finalProjectionVal === 'number'
                      ? finalProjectionVal.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                      : finalProjectionVal}
                  </span>
                  {cardOverrides[selectedDashboardUsina]?.['projecao'] !== undefined && cardOverrides[selectedDashboardUsina]?.['projecao'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 4: Meta Dia */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'metaDia',
                      cardName: 'Meta Dia',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['metaDia'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['metaDia']
                        : ''
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Meta Dia"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Meta Dia
                  </span>
                  <span className={`text-xl font-black mt-2 block ${finalMetaDia === '(Vazio)' ? 'text-gray-300 text-sm font-extrabold' : 'text-gray-900 tracking-tight'}`}>
                    {finalMetaDia}
                  </span>
                  {cardOverrides[selectedDashboardUsina]?.['metaDia'] !== undefined && cardOverrides[selectedDashboardUsina]?.['metaDia'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 5: Plantadoras */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'plantadoras',
                      cardName: 'Plantadoras',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['plantadoras'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['plantadoras']
                        : plantadorasVal.toString()
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Plantadoras"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Plantadoras
                  </span>
                  <span className="text-xl font-black text-gray-900 mt-2 tracking-tight">
                    {finalPlantadorasVal}
                  </span>
                  {cardOverrides[selectedDashboardUsina]?.['plantadoras'] !== undefined && cardOverrides[selectedDashboardUsina]?.['plantadoras'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 6: Rend. Plantadora/Hr */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'rendPltHr',
                      cardName: 'Rend. Plantadora/Hr',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['rendPltHr'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['rendPltHr']
                        : rendHr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Rend. Plantadora/Hr"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Rend. Plantadora/Hr
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xl font-black text-gray-900 tracking-tight">
                      {finalRendHr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white shadow-sm shrink-0 inline-block" />
                  </div>
                  {cardOverrides[selectedDashboardUsina]?.['rendPltHr'] !== undefined && cardOverrides[selectedDashboardUsina]?.['rendPltHr'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 7: Rend. Plantadora/Dia */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'rendPltDia',
                      cardName: 'Rend. Plantadora/Dia',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['rendPltDia'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['rendPltDia']
                        : rendDia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Rend. Plantadora/Dia"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Rend. Plantadora/Dia
                  </span>
                  <span className="text-xl font-black text-gray-900 mt-2 tracking-tight">
                    {finalRendDia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {cardOverrides[selectedDashboardUsina]?.['rendPltDia'] !== undefined && cardOverrides[selectedDashboardUsina]?.['rendPltDia'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 8: Med. Realizado/Hr */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'medRealizadoHr',
                      cardName: 'Med. Realizado/Hr',
                      currentValue: cardOverrides[selectedDashboardUsina]?.['medRealizadoHr'] !== undefined
                        ? cardOverrides[selectedDashboardUsina]?.['medRealizadoHr']
                        : medRealizadoHr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Med. Realizado/Hr"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase py-1 px-2.5 rounded-full mx-auto self-center w-full max-w-[110px] truncate">
                    Med. Realizado/Hr
                  </span>
                  <span className="text-xl font-black text-gray-900 mt-2 tracking-tight">
                    {finalMedRealizadoHr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {cardOverrides[selectedDashboardUsina]?.['medRealizadoHr'] !== undefined && cardOverrides[selectedDashboardUsina]?.['medRealizadoHr'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>
              </div>

              {/* First Row of Charts (Realizado por Frentes & Ha Plantados por Hora) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 md:px-10 mt-6">
                
                {/* Realizado por Frentes (Vertical Bars) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Realizado por Frentes
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={frentesChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={({ x, y, payload }) => {
                            const item = frentesChartData.find(d => d.name === payload.value);
                            return (
                              <g transform={`translate(${x},${y})`}>
                                <text x={0} y={4} dy={10} textAnchor="middle" fill="#4B5563" fontSize={11} fontWeight="bold">
                                  {payload.value}
                                </text>
                                <text x={0} y={16} dy={12} textAnchor="middle" fill="#9CA3AF" fontSize={9} fontWeight="bold">
                                  {item?.subLabel || ''}
                                </text>
                              </g>
                            );
                          }} 
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="ha" fill="#9EBE30" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                          <LabelList dataKey="ha" position="top" formatter={(val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} style={{ fill: '#333333', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ha Plantados por Hora */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Ha Plantados por Hora
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyDataPoints} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="ha" fill="#9EBE30" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                          <LabelList dataKey="ha" position="top" formatter={(val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} style={{ fill: '#333333', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Section Divider: Resultados da Última Hora */}
              <div className="px-6 md:px-10 mt-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight shrink-0">
                    Resultados da Última Hora - {lastHourIdx}h
                  </h2>
                  <div className="h-[2px] bg-gray-300 w-full rounded-full" />
                </div>
              </div>

              {/* Second Row of Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 md:px-10">
                
                {/* Realizado por Frentes - Última Hora */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Realizado por Frentes
                  </h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bottomFrentesChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={({ x, y, payload }) => {
                            const item = bottomFrentesChartData.find(d => d.name === payload.value);
                            return (
                              <g transform={`translate(${x},${y})`}>
                                <text x={0} y={4} dy={10} textAnchor="middle" fill="#4B5563" fontSize={11} fontWeight="bold">
                                  {payload.value}
                                </text>
                                <text x={0} y={16} dy={12} textAnchor="middle" fill="#9CA3AF" fontSize={9} fontWeight="bold">
                                  {item?.subLabel || ''}
                                </text>
                              </g>
                            );
                          }} 
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="ha" fill="#9EBE30" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                          <LabelList dataKey="ha" position="top" formatter={(val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} style={{ fill: '#333333', fontSize: 10, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Qtd. Plantadoras - Última Hora (Horizontal) */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Qtd. Plantadoras
                  </h3>
                  <div className="h-56 w-full flex items-center">
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart layout="vertical" data={qtyPlantadorasChartData} margin={{ top: 5, right: 40, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="value" fill="#9EBE30" radius={[0, 4, 4, 0]} maxBarSize={40} isAnimationActive={false}>
                          <LabelList dataKey="value" position="right" style={{ fill: '#333333', fontSize: 11, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rend. Plantadora/Hr - Última Hora (Horizontal) */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Rend. Plantadora/Hr
                  </h3>
                  <div className="h-56 w-full flex items-center">
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart layout="vertical" data={rendPlantadoraChartData} margin={{ top: 5, right: 40, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        <Bar dataKey="value" fill="#9EBE30" radius={[0, 4, 4, 0]} maxBarSize={40} isAnimationActive={false}>
                          <LabelList dataKey="value" position="right" formatter={(val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} style={{ fill: '#333333', fontSize: 11, fontWeight: 'bold' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SUB-PAGE 2: Cobrição Hora Hora */}
          {selectedSubPage === 'cobricao-hora' && (
            <div className="space-y-6">
              
              {/* Top Dark Blue Header Banner */}
              <div className="bg-[#00205B] text-white p-6 md:pl-10 md:pr-48 md:py-8 rounded-b-[36px] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative select-none">
                {/* Left: Title & Subtitle */}
                <div className="text-left w-full lg:w-auto">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                    Cobrição Hora a Hora
                  </h1>
                  <p className="text-sm md:text-base font-bold text-white/80 tracking-wider mt-1.5 uppercase">
                    Mecanizado Próprio
                  </p>
                </div>

                {/* Center: Tabs Filter (ARI, PAL, STA) */}
                <div className="flex items-center bg-white p-1 rounded-2xl shadow-inner border border-gray-100">
                  {(['Ariranha', 'Palestina', 'Santa Albertina'] as UsinaKey[]).map((usina) => {
                    const abbr = usina === 'Ariranha' ? 'ARI' : usina === 'Palestina' ? 'PAL' : 'STA';
                    const isActive = selectedDashboardUsina === usina;
                    return (
                      <button
                        key={usina}
                        onClick={() => setSelectedDashboardUsina(usina)}
                        className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                          isActive
                            ? 'bg-[#333333] text-white shadow-md'
                            : 'bg-white text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {abbr}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Last Update & Logo Badge */}
                <div className="flex items-center gap-6 self-end lg:self-auto w-full lg:w-auto justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Últ. Atualização</p>
                    <p className="text-sm font-black text-white/95 mt-1.5 leading-none">
                      {dynamicUpdateTime}
                    </p>
                  </div>

                  {/* COA and Gestão badges replication */}
                  <div className="flex items-center gap-3">
                    {/* COA Badge (Green circle, yellow border) */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPage('visao-corporativa');
                      }}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1b5e20] hover:bg-[#144718] hover:scale-105 active:scale-95 border-2 border-[#ffeb3b] text-white shadow-md cursor-pointer transition-all duration-200"
                      title="Ir para Visão Corporativa"
                    >
                      <div className="text-center font-black leading-none text-[8px] tracking-tight">
                        <p className="text-[8px] leading-none">COA</p>
                        <p className="text-[4px] leading-none uppercase text-[#ffeb3b]">Centro de</p>
                        <p className="text-[4px] leading-none uppercase text-[#ffeb3b]">Operações</p>
                      </div>
                    </div>
                    
                    {/* Gestão da Informação Badge */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPage(null);
                      }}
                      className="flex items-center gap-1.5 bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 px-2.5 py-1.5 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all duration-200"
                      title="Voltar ao Menu Principal"
                    >
                      <div className="w-5 h-5 rounded-md bg-[#00843D] flex items-center justify-center text-white text-xs">
                        📈
                      </div>
                      <div className="text-left leading-none select-none">
                        <p className="text-[7px] font-extrabold text-[#002855] uppercase leading-none">Gestão da</p>
                        <p className="text-[7px] font-black text-[#00843D] uppercase leading-none mt-0.5 tracking-widest">Informação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Metrics Cards Row for Cobrição */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 px-6 md:px-10 mt-6 select-none">
                
                {/* Card 1: Realizado */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'realizado',
                      cardName: 'Realizado',
                      currentValue: cobRealizado,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Realizado"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Realizado
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xl font-bold text-gray-800">
                      {cobRealizado}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#52C41A] border-2 border-white shadow-sm shrink-0 inline-block" />
                  </div>
                  {cobricaoOverrides[selectedDashboardUsina]?.['realizado'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['realizado'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 2: Meta até as 8h */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'meta8h',
                      cardName: 'Meta até as 8h',
                      currentValue: cobMeta8h,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Meta até as 8h"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Meta até as 8h
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-2 block">
                    {cobMeta8h}
                  </span>
                  {cobricaoOverrides[selectedDashboardUsina]?.['meta8h'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['meta8h'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 3: Projeção */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'projecao',
                      cardName: 'Projeção',
                      currentValue: cobProjecao,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Projeção"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Projeção
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-2 block">
                    {cobProjecao}
                  </span>
                  {cobricaoOverrides[selectedDashboardUsina]?.['projecao'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['projecao'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 4: Meta Dia */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'metaDia',
                      cardName: 'Meta Dia',
                      currentValue: cobMetaDia,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Meta Dia"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Meta Dia
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-2 block">
                    {cobMetaDia}
                  </span>
                  {cobricaoOverrides[selectedDashboardUsina]?.['metaDia'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['metaDia'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 5: Tratores */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'tratores',
                      cardName: 'Tratores',
                      currentValue: cobTratoores,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Tratores"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Tratores
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-2 block">
                    {cobTratoores}
                  </span>
                  {cobricaoOverrides[selectedDashboardUsina]?.['tratores'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['tratores'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 6: Rend. Trator/Hr */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'rendTratorHr',
                      cardName: 'Rend. Trator/Hr',
                      currentValue: cobRendTratorHr,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Rend. Trator/Hr"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Rend. Trator/Hr
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    <span className="text-xl font-bold text-gray-800">
                      {cobRendTratorHr}
                    </span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#52C41A] border-2 border-white shadow-sm shrink-0 inline-block" />
                  </div>
                  {cobricaoOverrides[selectedDashboardUsina]?.['rendTratorHr'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['rendTratorHr'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 7: Rend. Trator/Dia */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'rendTratorDia',
                      cardName: 'Rend. Trator/Dia',
                      currentValue: cobRendTratorDia,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Rend. Trator/Dia"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Rend. Trator/Dia
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-2 block">
                    {cobRendTratorDia}
                  </span>
                  {cobricaoOverrides[selectedDashboardUsina]?.['rendTratorDia'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['rendTratorDia'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>

                {/* Card 8: Med. Realizado/Hr */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between text-center min-h-[110px] relative hover:shadow-lg transition-all group">
                  <button 
                    onClick={() => setEditingCard({
                      usina: selectedDashboardUsina,
                      cardKey: 'medRealizadoHr',
                      cardName: 'Med. Realizado/Hr',
                      currentValue: cobMedRealizadoHr,
                      isCobricao: true
                    })}
                    className="absolute top-2 right-2 opacity-60 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 p-1 bg-gray-50 hover:bg-[#00843D] text-gray-400 hover:text-white rounded-md transition-all shadow-sm border border-gray-100 cursor-pointer"
                    title="Editar Med. Realizado/Hr"
                  >
                    <Pencil size={11} />
                  </button>
                  <span className="bg-gray-200 text-gray-700 text-[10px] font-black uppercase py-1 px-2.5 rounded-lg mx-auto self-center w-full max-w-[110px] truncate">
                    Med. Realizado/Hr
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-2 block">
                    {cobMedRealizadoHr}
                  </span>
                  {cobricaoOverrides[selectedDashboardUsina]?.['medRealizadoHr'] !== undefined && cobricaoOverrides[selectedDashboardUsina]?.['medRealizadoHr'] !== '' && (
                    <span className="text-[8px] font-extrabold text-[#00843D] uppercase tracking-wider block mt-1">
                      Manual
                    </span>
                  )}
                </div>
              </div>

              {/* First Row of Charts (Realizado por Frentes & Ha Plantados por Hora) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 md:px-10 mt-6 select-none">
                
                {/* Realizado por Frentes */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 min-h-[280px] flex flex-col">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Realizado por Frentes
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <span className="text-sm font-semibold text-gray-400">Sem dados de frentes para exibir</span>
                    <span className="text-[10px] mt-1 text-gray-300">Aguardando novos registros de cobrição</span>
                  </div>
                </div>

                {/* Ha Plantados por Hora */}
                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 min-h-[280px] flex flex-col">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Ha Plantados por Hora
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <span className="text-sm font-semibold text-gray-400">Sem dados de horas para exibir</span>
                    <span className="text-[10px] mt-1 text-gray-300">Aguardando novos registros de cobrição</span>
                  </div>
                </div>

              </div>

              {/* Section Divider: Resultados da Última Hora */}
              <div className="px-6 md:px-10 mt-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-base md:text-lg font-bold text-gray-800 uppercase tracking-tight shrink-0">
                    Resultados da Última Hora - {lastHourIdx}h
                  </h2>
                  <div className="h-[2px] bg-gray-300 w-full rounded-full" />
                </div>
              </div>

              {/* Second Row of Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-6 md:px-10 pb-6 select-none">
                
                {/* Realizado por Frentes */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-md border border-gray-200 min-h-[240px] flex flex-col">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Realizado por Frentes
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <span className="text-xs font-semibold text-gray-400">Sem dados</span>
                  </div>
                </div>

                {/* Qtd. Tratores */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md border border-gray-200 min-h-[240px] flex flex-col">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Qtd. Tratores
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <span className="text-xs font-semibold text-gray-400">Sem dados</span>
                  </div>
                </div>

                {/* Rend. Tratores/Hr */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-md border border-gray-200 min-h-[240px] flex flex-col">
                  <h3 className="font-bold text-gray-800 text-xs uppercase tracking-tight text-left mb-6">
                    Rend. Tratores/Hr
                  </h3>
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-300 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <span className="text-xs font-semibold text-gray-400">Sem dados</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SUB-PAGE 3: Terceiro Hora Hora */}
          {selectedSubPage === 'terceiro-hora' && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">Equipamentos de Terceiros</p>
                  <p className="text-2xl font-black text-gray-900 leading-tight">6 Ativos</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Prestadores de serviços certificados</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">Hectares Plantados por Terceiros</p>
                  <p className="text-2xl font-black text-blue-600 leading-tight">48.2 hectares</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Massa operacional de 34% do total de plantio</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">Custo Médio Equivalente / ha</p>
                  <p className="text-2xl font-black text-green-600 leading-tight">R$ 480,00 / ha</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Dentro da margem orçamentária corporativa</p>
                </div>
              </div>

              {/* Side-by-side Efficiency Comparison Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left">
                  <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight mb-6">Eficiência Comparada: Colombo vs Terceiros</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={terceirosData} margin={{ left: -10 }} barSize={35}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="Proprio" name="Colombo Próprio (%)" fill="#00843D" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="Terceiro" name="Terceiro (%)" fill="#002855" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight mb-4">Detalhamento Técnico de Operações de Terceiros</h3>
                    <p className="text-xs text-gray-500 font-bold leading-relaxed mb-4">
                      A terceirização de frentes é monitorada em tempo real via telemetria unificada integrado ao Monitoramento PPT Colombo. Os prestadores recebem alertas de telemetria automáticos em caso de desvio de velocidade.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-bold">
                      <span className="text-gray-800">Velocidade Crítica Terceiros</span>
                      <span className="text-red-600 font-extrabold">0 incidentes registrados</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-bold">
                      <span className="text-gray-800">Disponibilidade Mecânica Terceiros</span>
                      <span className="text-green-600 font-extrabold">98.4% de disponibilidade</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SUB-PAGE 4: Visão Corporativa */}
          {selectedSubPage === 'visao-corporativa' && (
            <div className="space-y-6">
              
              {/* Top Dark Blue Header Banner */}
              <div className="bg-[#00205B] text-white p-6 md:pl-10 md:pr-48 md:py-8 rounded-b-[36px] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl relative select-none">
                {/* Left: Title & Subtitle */}
                <div className="text-left w-full lg:w-auto">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-none">
                    Plantio Consolidado
                  </h1>
                  <p className="text-sm md:text-base font-bold text-white/80 tracking-wider mt-1.5 uppercase">
                    Mecanizado Próprio
                  </p>
                </div>

                {/* Center: Tabs Filter Replicated but with third-party and cobrição removed */}
                <div className="flex items-center bg-white p-1 rounded-2xl shadow-inner border border-gray-100">
                  <button className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#333333] text-white shadow-md">
                    Mecanizado
                  </button>
                </div>

                {/* Right: Last Update & Logo Badge */}
                <div className="flex items-center gap-6 self-end lg:self-auto w-full lg:w-auto justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Últ. Atualização</p>
                    <p className="text-sm font-black text-white/95 mt-1.5 leading-none">
                      {dynamicUpdateTime}
                    </p>
                  </div>

                  {/* COA and Gestão badges replication */}
                  <div className="flex items-center gap-3">
                    {/* COA Badge - Clicking here toggles back to Plantio Hora a Hora */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPage('plantio-hora');
                      }}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#1b5e20] hover:bg-[#144718] hover:scale-105 active:scale-95 border-2 border-[#ffeb3b] text-white shadow-md cursor-pointer transition-all duration-200"
                      title="Voltar ao Plantio Hora a Hora"
                    >
                      <div className="text-center font-black leading-none text-[8px] tracking-tight">
                        <p className="text-[8px] leading-none">COA</p>
                        <p className="text-[4px] leading-none uppercase text-[#ffeb3b]">Centro de</p>
                        <p className="text-[4px] leading-none uppercase text-[#ffeb3b]">Operações</p>
                      </div>
                    </div>
                    
                    {/* Gestão da Informação Badge */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubPage(null);
                      }}
                      className="flex items-center gap-1.5 bg-white hover:bg-gray-50 hover:scale-105 active:scale-95 px-2.5 py-1.5 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all duration-200"
                      title="Voltar ao Menu Principal"
                    >
                      <div className="w-5 h-5 rounded-md bg-[#00843D] flex items-center justify-center text-white text-xs">
                        📈
                      </div>
                      <div className="text-left leading-none select-none">
                        <p className="text-[7px] font-extrabold text-[#002855] uppercase leading-none">Gestão da</p>
                        <p className="text-[7px] font-black text-[#00843D] uppercase leading-none mt-0.5 tracking-widest">Informação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Consolidated Dashboard Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-6 md:px-10 py-6 items-stretch">
                
                {/* COLUMN 1: Colombo (Consolidated View) - Takes up 3/12 width */}
                <div className="xl:col-span-3 flex flex-col text-left">
                  <h2 className="text-[#002855] text-2xl font-black mb-4 uppercase tracking-tight">
                    Colombo
                  </h2>
                  
                  <div className="bg-white rounded-[32px] p-6 shadow-md border border-gray-100 flex-1 flex flex-col justify-between space-y-6">
                    {/* 2x2 Grid of Big Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Realizado Card */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between relative min-h-[110px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Realizado</span>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="w-3 h-3 rounded-full bg-[#52C41A] block shrink-0" />
                          <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-none">
                            {consolidatedMetrics.realTxt}
                          </span>
                        </div>
                      </div>

                      {/* Meta até as 8h Card */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Meta até as 8h</span>
                        <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-none mt-4">
                          {consolidatedMetrics.meta8Txt}
                        </span>
                      </div>

                      {/* Projeção Card */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Projeção</span>
                        <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-none mt-4">
                          {consolidatedMetrics.projTxt}
                        </span>
                      </div>

                      {/* Meta Dia Card */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[110px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Meta do Dia</span>
                        <span className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-none mt-4">
                          {consolidatedMetrics.metaDTxt}
                        </span>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Performance Section */}
                    <div className="space-y-4 py-2 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-[#002855] uppercase tracking-widest block text-center">Performance</span>
                      <GaugeChart value={consolidatedMetrics.performance} size={300} />
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Central Graphic Leaf Logo - Takes up 3/12 width with pointing arrows */}
                <div className="xl:col-span-3 hidden xl:flex flex-col items-center justify-center relative">
                  <div className="relative w-full h-full flex items-center justify-center select-none py-4 px-2">
                    <div className="relative z-20 w-full max-w-[360px] bg-white rounded-[32px] shadow-xl border border-gray-100 p-3 hover:scale-[1.04] transition-all duration-300">
                      <img 
                        src={logoImg} 
                        alt="Colombo Agroindústria & Gestão da Informação" 
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-contain rounded-[24px]" 
                      />
                    </div>

                    {/* Beautiful Elegant Pointing Arrows linking the Middle Logo to Column 3 cards */}
                    <div className="absolute left-[calc(50%+150px)] right-[-42px] top-[10%] bottom-[10%] pointer-events-none hidden xl:block z-10 overflow-visible">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
                        <defs>
                          {/* Markers for Arrow Heads with subtle styling */}
                          <marker id="arrow-blue" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#3b82f6" />
                          </marker>
                          <marker id="arrow-yellow" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#eab308" />
                          </marker>
                          <marker id="arrow-green" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                            <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#22c55e" />
                          </marker>
                        </defs>

                        {/* Top Line to Ariranha (Blue) */}
                        <path 
                          d="M 0 50 C 35 50, 45 12, 100 12" 
                          stroke="#3b82f6" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3"
                          markerEnd="url(#arrow-blue)"
                          className="opacity-40"
                        />
                        
                        {/* Middle Line to Palestina (Yellow) */}
                        <path 
                          d="M 0 50 L 100 50" 
                          stroke="#eab308" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3"
                          markerEnd="url(#arrow-yellow)"
                          className="opacity-40"
                        />

                        {/* Bottom Line to Santa Albertina (Green) */}
                        <path 
                          d="M 0 50 C 35 50, 45 88, 100 88" 
                          stroke="#22c55e" 
                          strokeWidth="1.5" 
                          strokeDasharray="4 3"
                          markerEnd="url(#arrow-green)"
                          className="opacity-40"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: Individual Usinas List - Takes up 6/12 width */}
                <div className="xl:col-span-6 flex flex-col text-left justify-between space-y-6">
                  <h2 className="text-[#002855] text-2xl font-black uppercase tracking-tight">
                    Usinas
                  </h2>

                  {/* Vertical list of Usina Cards */}
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    
                    {/* Usina 1: Ariranha */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 pl-2">
                        <span className="w-4 h-4 rounded-full bg-[#3b82f6] border-2 border-white shadow-md inline-block animate-pulse shrink-0" />
                        <span className="text-xl md:text-2xl font-black text-[#002855] uppercase tracking-wide">Ariranha</span>
                      </div>
                      <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all">
                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-4 gap-3.5 flex-1 w-full sm:w-auto">
                          
                          {/* Realizado */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Ariranha',
                              cardKey: 'realizado',
                              cardName: 'Realizado (Ariranha)',
                              currentValue: consolidatedMetrics.ariranha.realTxt === '--' ? '' : consolidatedMetrics.ariranha.realTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#52C41A] shrink-0" />
                              <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                                {consolidatedMetrics.ariranha.realTxt}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Realizado</span>
                          </div>

                          {/* Meta 8h */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Ariranha',
                              cardKey: 'meta8h',
                              cardName: 'Meta até as 8h (Ariranha)',
                              currentValue: consolidatedMetrics.ariranha.meta8Txt === '--' ? '' : consolidatedMetrics.ariranha.meta8Txt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.ariranha.meta8Txt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Meta 8h</span>
                          </div>

                          {/* Previsão */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Ariranha',
                              cardKey: 'projecao',
                              cardName: 'Previsão (Ariranha)',
                              currentValue: consolidatedMetrics.ariranha.projTxt === '--' ? '' : consolidatedMetrics.ariranha.projTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.ariranha.projTxt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Previsão</span>
                          </div>

                          {/* Meta */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Ariranha',
                              cardKey: 'metaDia',
                              cardName: 'Meta (Ariranha)',
                              currentValue: consolidatedMetrics.ariranha.metaDTxt === '--' ? '' : consolidatedMetrics.ariranha.metaDTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.ariranha.metaDTxt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Meta</span>
                          </div>

                        </div>

                        {/* Performance Gauge */}
                        <div className="w-36 md:w-40 shrink-0 border-l border-gray-100 pl-4 flex items-center justify-center">
                          <GaugeChart value={consolidatedMetrics.ariranha.performance} size={135} />
                        </div>
                      </div>
                    </div>

                    {/* Usina 2: Palestina */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 pl-2">
                        <span className="w-4 h-4 rounded-full bg-[#eab308] border-2 border-white shadow-md inline-block animate-pulse shrink-0" />
                        <span className="text-xl md:text-2xl font-black text-[#002855] uppercase tracking-wide">Palestina</span>
                      </div>
                      <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all">
                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-4 gap-3.5 flex-1 w-full sm:w-auto">
                          
                          {/* Realizado */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Palestina',
                              cardKey: 'realizado',
                              cardName: 'Realizado (Palestina)',
                              currentValue: consolidatedMetrics.palestina.realTxt === '--' ? '' : consolidatedMetrics.palestina.realTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#52C41A] shrink-0" />
                              <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                                {consolidatedMetrics.palestina.realTxt}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Realizado</span>
                          </div>

                          {/* Meta 8h */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Palestina',
                              cardKey: 'meta8h',
                              cardName: 'Meta até as 8h (Palestina)',
                              currentValue: consolidatedMetrics.palestina.meta8Txt === '--' ? '' : consolidatedMetrics.palestina.meta8Txt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.palestina.meta8Txt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Meta 8h</span>
                          </div>

                          {/* Previsão */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Palestina',
                              cardKey: 'projecao',
                              cardName: 'Previsão (Palestina)',
                              currentValue: consolidatedMetrics.palestina.projTxt === '--' ? '' : consolidatedMetrics.palestina.projTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.palestina.projTxt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Previsão</span>
                          </div>

                          {/* Meta */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Palestina',
                              cardKey: 'metaDia',
                              cardName: 'Meta (Palestina)',
                              currentValue: consolidatedMetrics.palestina.metaDTxt === '--' ? '' : consolidatedMetrics.palestina.metaDTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.palestina.metaDTxt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Meta</span>
                          </div>

                        </div>

                        {/* Performance Gauge */}
                        <div className="w-36 md:w-40 shrink-0 border-l border-gray-100 pl-4 flex items-center justify-center">
                          <GaugeChart value={consolidatedMetrics.palestina.performance} size={135} />
                        </div>
                      </div>
                    </div>

                    {/* Usina 3: Santa Albertina */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 pl-2">
                        <span className="w-4 h-4 rounded-full bg-[#22c55e] border-2 border-white shadow-md inline-block animate-pulse shrink-0" />
                        <span className="text-xl md:text-2xl font-black text-[#002855] uppercase tracking-wide">Santa Albertina</span>
                      </div>
                      <div className="bg-white rounded-[24px] p-5 md:p-6 shadow-lg border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all">
                        {/* 4 Cards Grid */}
                        <div className="grid grid-cols-4 gap-3.5 flex-1 w-full sm:w-auto">
                          
                          {/* Realizado */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Santa Albertina',
                              cardKey: 'realizado',
                              cardName: 'Realizado (Santa Albertina)',
                              currentValue: consolidatedMetrics.santaAlbertina.realTxt === '--' ? '' : consolidatedMetrics.santaAlbertina.realTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <div className="flex items-center justify-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#52C41A] shrink-0" />
                              <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                                {consolidatedMetrics.santaAlbertina.realTxt}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Realizado</span>
                          </div>

                          {/* Meta 8h */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Santa Albertina',
                              cardKey: 'meta8h',
                              cardName: 'Meta até as 8h (Santa Albertina)',
                              currentValue: consolidatedMetrics.santaAlbertina.meta8Txt === '--' ? '' : consolidatedMetrics.santaAlbertina.meta8Txt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.santaAlbertina.meta8Txt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Meta 8h</span>
                          </div>

                          {/* Previsão */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Santa Albertina',
                              cardKey: 'projecao',
                              cardName: 'Previsão (Santa Albertina)',
                              currentValue: consolidatedMetrics.santaAlbertina.projTxt === '--' ? '' : consolidatedMetrics.santaAlbertina.projTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.santaAlbertina.projTxt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Previsão</span>
                          </div>

                          {/* Meta */}
                          <div 
                            onClick={() => setEditingCard({
                              usina: 'Santa Albertina',
                              cardKey: 'metaDia',
                              cardName: 'Meta (Santa Albertina)',
                              currentValue: consolidatedMetrics.santaAlbertina.metaDTxt === '--' ? '' : consolidatedMetrics.santaAlbertina.metaDTxt
                            })}
                            className="bg-gray-50/60 hover:bg-gray-50 p-3 md:p-4 rounded-2xl border border-gray-150 flex flex-col justify-between text-center min-h-[95px] cursor-pointer hover:shadow-md transition-all group relative"
                          >
                            <Pencil size={11} className="absolute top-2.5 right-2.5 text-gray-300 group-hover:text-[#00843D] transition-colors" />
                            <span className="text-base md:text-lg font-black text-gray-800 tracking-tight leading-none">
                              {consolidatedMetrics.santaAlbertina.metaDTxt}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase mt-3.5 block leading-none tracking-wider">Meta</span>
                          </div>

                        </div>

                        {/* Performance Gauge */}
                        <div className="w-36 md:w-40 shrink-0 border-l border-gray-100 pl-4 flex items-center justify-center">
                          <GaugeChart value={consolidatedMetrics.santaAlbertina.performance} size={135} />
                        </div>
                      </div>
                    </div>

                    {/* Elegant Legend displaying <80%, 80% to 100%, and >100% placed below Santa Albertina */}
                    <div className="flex justify-end pt-2">
                      <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-150 flex items-center gap-3.5 shadow-md text-[10px] font-black text-gray-700 select-none tracking-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D4F] shadow-sm shrink-0 inline-block" />
                          <span>&lt; 80%</span>
                        </div>
                        <div className="w-[1px] h-3 bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FADB14] shadow-sm shrink-0 inline-block" />
                          <span>80% a 100%</span>
                        </div>
                        <div className="w-[1px] h-3 bg-gray-200" />
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#52C41A] shadow-sm shrink-0 inline-block" />
                          <span>&gt; 100%</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* SUB-PAGE 5: Visões D-1 */}
          {selectedSubPage === 'visoes-d1' && (
            <div className="space-y-8">
              
              {/* Yesterday summary */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-[#00843D] text-white rounded-xl flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">Consolidado D-1 (Ontem)</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-0.5">Visão consolidada das frentes de plantio do dia anterior</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 font-bold leading-relaxed mb-6">
                  Ontem a Colombo obteve excelente produtividade sob ótimas condições meteorológicas gerais. O total de área plantada pelas três usinas somou mais de 240.5 hectares, superando a meta diária estabelecida de 230 hectares.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Área Total Plantada</span>
                    <span className="text-xl font-black text-[#00843D] block mt-1">240.5 ha</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Meta Prevista</span>
                    <span className="text-xl font-black text-gray-600 block mt-1">230.0 ha</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Eficiência Geral D-1</span>
                    <span className="text-xl font-black text-blue-600 block mt-1">104.5%</span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Paradas Críticas</span>
                    <span className="text-xl font-black text-red-600 block mt-1">0 registradas</span>
                  </div>
                </div>
              </div>

              {/* D-1 Shift breakdown chart */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-left">
                <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-tight mb-6">Produção Plantada (ha) por Turno de Trabalho</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { shift: 'Turno A (Manhã)', ha: 82, meta: 75 },
                      { shift: 'Turno B (Tarde)', ha: 95, meta: 85 },
                      { shift: 'Turno C (Noite)', ha: 63.5, meta: 70 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="shift" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                      <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      <Bar dataKey="ha" name="Plantado Real (ha)" fill="#00843D" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="meta" name="Meta Turno (ha)" fill="#9CA3AF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* CARD EDIT MODAL WINDOW */}
      {editingCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setEditingCard(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col z-10">
            {/* Modal Header */}
            <div className="bg-[#00205B] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-yellow-400" />
                <h3 className="font-extrabold text-base tracking-tight uppercase">Editar Indicador</h3>
              </div>
              <button 
                onClick={() => setEditingCard(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-black text-[#00843D] uppercase tracking-wider block mb-1">
                  Unidade: {editingCard.usina}
                </span>
                <h4 className="text-xl font-black text-[#00205B] tracking-tight uppercase">
                  {editingCard.cardName}
                </h4>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Ajuste o valor exibido manualmente ou restaure para o cálculo automático do sistema.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">
                  Novo Valor
                </label>
                <input 
                  type="text"
                  value={editingCard.currentValue}
                  onChange={(e) => setEditingCard({ ...editingCard, currentValue: e.target.value })}
                  placeholder="Ex: 15,2 ou Vazio"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00843D] focus:outline-none font-bold text-gray-800 text-lg shadow-inner bg-gray-50 text-left"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (editingCard.isCobricao) {
                        setCobricaoOverrides(prev => ({
                          ...prev,
                          [editingCard.usina]: {
                            ...prev[editingCard.usina],
                            [editingCard.cardKey]: editingCard.currentValue
                          }
                        }));
                      } else {
                        setCardOverrides(prev => ({
                          ...prev,
                          [editingCard.usina]: {
                            ...prev[editingCard.usina],
                            [editingCard.cardKey]: editingCard.currentValue
                          }
                        }));
                      }
                      setEditingCard(null);
                    }
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-2 justify-end border-t border-gray-100">
              <button 
                type="button"
                onClick={() => {
                  if (editingCard.isCobricao) {
                    setCobricaoOverrides(prev => ({
                      ...prev,
                      [editingCard.usina]: {
                        ...prev[editingCard.usina],
                        [editingCard.cardKey]: ''
                      }
                    }));
                  } else {
                    setCardOverrides(prev => ({
                      ...prev,
                      [editingCard.usina]: {
                        ...prev[editingCard.usina],
                        [editingCard.cardKey]: ''
                      }
                    }));
                  }
                  setEditingCard(null);
                }}
                className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Restaurar Padrão
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  if (editingCard.isCobricao) {
                    setCobricaoOverrides(prev => ({
                      ...prev,
                      [editingCard.usina]: {
                        ...prev[editingCard.usina],
                        [editingCard.cardKey]: editingCard.currentValue
                      }
                    }));
                  } else {
                    setCardOverrides(prev => ({
                      ...prev,
                      [editingCard.usina]: {
                        ...prev[editingCard.usina],
                        [editingCard.cardKey]: editingCard.currentValue
                      }
                    }));
                  }
                  setEditingCard(null);
                }}
                className="bg-[#00843D] hover:bg-[#006a30] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
