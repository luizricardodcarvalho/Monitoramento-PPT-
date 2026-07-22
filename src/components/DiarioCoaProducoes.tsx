import React, { useState, useEffect } from 'react';
import { parseTxtContent } from '../lib/txtParser';
import { motion, AnimatePresence } from 'motion/react';
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
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  Activity, 
  Users, 
  Gauge, 
  Sliders, 
  Tractor,
  HelpCircle,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

// Custom circular gauge component to replicate "Taxa de Descarga dos Bordos PTT (%)"
const HalfGauge: React.FC<{ value: number; size?: number; label?: string }> = ({ value, size = 160, label }) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const angle = -90 + (clampedValue / 100) * 180;
  
  // Custom red-to-green speedometer arc
  const getGaugeColor = (val: number) => {
    if (val >= 80) return '#00843D'; // Green
    if (val >= 50) return '#EAB308'; // Yellow
    return '#EF4444'; // Red
  };

  const color = getGaugeColor(clampedValue);

  return (
    <div className="flex flex-col items-center justify-center relative select-none mx-auto" style={{ width: size, height: size * 0.8 }}>
      <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible">
        {/* Background track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Colored arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray="251.3"
          strokeDashoffset={251.3 - (clampedValue / 100) * 251.3}
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="#1F2937"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${angle}, 100, 100)`}
          className="transition-all duration-1000 ease-out"
        />

        {/* Pin */}
        <circle cx="100" cy="100" r="8" fill="#1F2937" />
        <circle cx="100" cy="100" r="3" fill="#FFFFFF" />

        {/* Labels in bold black for high legibility */}
        <text x="22" y="122" textAnchor="middle" fontSize="10" fontWeight="900" fill="#000000">0,0%</text>
        <text x="178" y="122" textAnchor="middle" fontSize="10" fontWeight="900" fill="#000000">100,0%</text>

        {/* Main Value in bold black inside SVG to prevent any overlap */}
        <text x="100" y="142" textAnchor="middle" fontSize="23" fontWeight="900" fill="#000000">
          {value.toFixed(1).replace('.', ',')}%
        </text>

        {/* Optional Label inside SVG */}
        {label && (
          <text x="100" y="156" textAnchor="middle" fontSize="8" fontWeight="900" fill="#000000" letterSpacing="1">
            {label.toUpperCase()}
          </text>
        )}
      </svg>
    </div>
  );
};

// Main Component
export default function DiarioCoaProducoes({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [selectedUsina, setSelectedUsina] = useState<'ARIRANHA' | 'PALESTINA' | 'SANTA ALBERTINA'>('ARIRANHA');
  const [selectedFrente, setSelectedFrente] = useState<string>('Tudo');
  const [selectedSegmento, setSelectedSegmento] = useState<string>('Tudo');
  const [tipoEquipamento, setTipoEquipamento] = useState<'Tudo' | 'Apoio' | 'Principal'>('Tudo');
  const [dataInicio, setDataInicio] = useState<string>('2026-01-01');
  const [dataFim, setDataFim] = useState<string>('2026-07-15');
  
  const [activeTab, setActiveTab] = useState<'producoes' | 'indicadores' | 'tabela' | 'operadores'>('producoes');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('16-07-2026 19:09:35');
  const [isTableExpanded, setIsTableExpanded] = useState<Record<string, boolean>>({
    '0.12-3 PÁTIO DE COMPOSTAGEM': true,
    '0.32 ENLEIRADEIRA DE PALHA': false,
    '0.42-1 QUEBRA LOMBO': false
  });
  const [tableMode, setTableMode] = useState<'Média' | 'Total'>('Média');

  const [zoomedChartId, setZoomedChartId] = useState<string | null>(null);
  const zoomableCharts = ['meta_vs_realizado', 'ofensores', 'hectares_hahora'];
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

  // State for imported data
  const [importedData, setImportedData] = useState<any>(null);

  // Reset selectedFrente on Usina change
  useEffect(() => {
    setSelectedFrente('Tudo');
  }, [selectedUsina]);

  const availableFrentes = React.useMemo(() => {
    const base = importedData?.tratos || [
      { frente: '0.12-3 PÁTIO DE COMPOSTAGEM', usina: 'ARIRANHA' },
      { frente: '0.32 ENLEIRADEIRA DE PALHA', usina: 'PALESTINA' },
      { frente: '0.42-1 QUEBRA LOMBO', usina: 'SANTA ALBERTINA' }
    ];
    return base
      .filter((g: any) => !g.usina || g.usina === selectedUsina)
      .map((g: any) => g.frente);
  }, [importedData, selectedUsina]);

  // Load last update time and data if present
  useEffect(() => {
    const savedTime = localStorage.getItem('diario_coa_last_update');
    if (savedTime) {
      setLastUpdateTime(savedTime);
    }
    
    const loadExcelData = () => {
      const savedExcel = localStorage.getItem('diario_coa_excel_data');
      if (savedExcel) {
        try {
          setImportedData(JSON.parse(savedExcel));
        } catch (e) {
          console.error('Error parsing excel data from localstorage:', e);
        }
      } else {
        setImportedData(null);
      }
    };
    
    loadExcelData();
    
    // Sync with global custom event
    const handleSync = () => {
      const updatedTime = localStorage.getItem('diario_coa_last_update');
      if (updatedTime) {
        setLastUpdateTime(updatedTime);
      }
      loadExcelData();
    };
    window.addEventListener('diario_coa_updated', handleSync);
    return () => {
      window.removeEventListener('diario_coa_updated', handleSync);
    };
  }, []);

  // Excel & TXT Ingestion Handler with smart structure identifier
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
          
          // 1. Detect "Producoes"
          if (hasKeyMatching(['segmento', 'operação', 'operacao']) && hasKeyMatching(['meta', 'real'])) {
            imported.producoes = rawRows.map((row: any, i) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              return {
                id: String(i + 1),
                segmento: String(find(['segmento', 'operação', 'operacao', 'nome'], 'OPERAÇÃO')).toUpperCase(),
                dispMec: parseFloat(find(['disp', 'mecanica', 'mecanica'], 85)),
                efic: parseFloat(find(['efic', 'eficiencia', 'eficiencia'], 30)),
                horasEf: parseFloat(find(['horas', 'efetivas', 'tempo'], 10)),
                haMeta: parseFloat(find(['meta', 'ha meta'], 100)),
                haReal: parseFloat(find(['real', 'ha real'], 90)),
                dif: parseFloat(find(['dif', 'diferença', 'diferenca'], -10)),
                haHMeta: parseFloat(find(['meta_h', 'ha_h_meta', 'ha/h meta'], 1)),
                haHReal: parseFloat(find(['real_h', 'ha_h_real', 'ha/h real'], 1)),
                statusDisp: parseFloat(find(['disp', 'mecanica'], 85)) >= 85 ? 'ok' : parseFloat(find(['disp', 'mecanica'], 85)) >= 80 ? 'warning' : 'error',
                statusEfic: parseFloat(find(['efic', 'eficiencia'], 30)) >= 35 ? 'ok' : 'error',
              };
            });
          }
          
          // 2. Detect "Tratos"
          else if (hasKeyMatching(['frente', 'equipamento', 'total', 'paradas', 'produtiva'])) {
            const groups: Record<string, any[]> = {};
            rawRows.forEach((row: any) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              const frente = String(find(['frente', 'area', 'setor'], 'GERAL')).trim();
              if (!groups[frente]) groups[frente] = [];
              groups[frente].push(row);
            });
            
            imported.tratos = Object.entries(groups).map(([frenteName, rows], gIdx) => {
              const subRows = rows.map((row, rIdx) => {
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

                const totalVal = parseNum(find(['total', 'h_total', 'horas'], 0));
                const paradasVal = parseNum(find(['paradas', 'parada'], 0));
                const produtivaVal = parseNum(find(['produtiva', 'prod'], 0));
                const auxiliarVal = parseNum(find(['auxiliar', 'aux'], 0));
                const haVal = parseNum(find(['ha', 'hectares'], 0));
                const haHoraVal = parseNum(find(['ha_hora', 'ha/hora', 'rendimento'], 0));
                const ociosoVal = parseNum(find(['ocioso', 'ociosidade'], 0));
                const eficVal = parseNum(find(['efic', 'eficiencia'], 0));
                const dispMecVal = parseNum(find(['disp', 'mecanica'], 0));
                const vMediaVal = parseNum(find(['v_media', 'velocidade'], 0));
                const lhVal = parseNum(find(['l_h', 'lh', 'consumo'], 0));

                return {
                  id: `g_${gIdx}_s_${rIdx}`,
                  frente: String(find(['equipamento', 'ativo', 'nome'], 'EQUIPAMENTO')).trim(),
                  total: totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                  paradas: paradasVal.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                  produtiva: produtivaVal.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                  auxiliar: auxiliarVal.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                  semApto: '0,0%',
                  vMedia: vMediaVal.toFixed(1).replace('.', ','),
                  ocioso: ociosoVal.toFixed(1).replace('.', ',') + '%',
                  efic: eficVal.toFixed(1).replace('.', ',') + '%',
                  dispMec: dispMecVal.toFixed(1).replace('.', ',') + '%',
                  lh: lhVal.toFixed(1).replace('.', ','),
                  ha: haVal.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                  haHora: haHoraVal.toFixed(1).replace('.', ','),
                  statusOcioso: ociosoVal <= 10 ? 'ok' : 'error',
                  statusEfic: eficVal >= 35 ? 'ok' : 'error',
                  statusDisp: dispMecVal >= 85 ? 'ok' : 'error',
                  _total: totalVal,
                  _paradas: paradasVal,
                  _produtiva: produtivaVal,
                  _auxiliar: auxiliarVal,
                  _ha: haVal,
                  _haHora: haHoraVal,
                  _ocioso: ociosoVal,
                  _efic: eficVal,
                  _dispMec: dispMecVal,
                  _vMedia: vMediaVal,
                  _lh: lhVal,
                };
              });

              const sumTotal = subRows.reduce((acc, sr) => acc + sr._total, 0);
              const sumParadas = subRows.reduce((acc, sr) => acc + sr._paradas, 0);
              const sumProdutiva = subRows.reduce((acc, sr) => acc + sr._produtiva, 0);
              const sumAuxiliar = subRows.reduce((acc, sr) => acc + sr._auxiliar, 0);
              const sumHa = subRows.reduce((acc, sr) => acc + sr._ha, 0);
              const avgOcioso = subRows.length ? (subRows.reduce((acc, sr) => acc + sr._ocioso, 0) / subRows.length) : 0;
              const avgEfic = subRows.length ? (subRows.reduce((acc, sr) => acc + sr._efic, 0) / subRows.length) : 0;
              const avgDispMec = subRows.length ? (subRows.reduce((acc, sr) => acc + sr._dispMec, 0) / subRows.length) : 0;
              const avgVMedia = subRows.length ? (subRows.reduce((acc, sr) => acc + sr._vMedia, 0) / subRows.length) : 0;
              const avgLh = subRows.length ? (subRows.reduce((acc, sr) => acc + sr._lh, 0) / subRows.length) : 0;
              const avgHaHora = subRows.length ? (subRows.reduce((acc, sr) => acc + sr._haHora, 0) / subRows.length) : 0;

              return {
                id: `g_${gIdx}`,
                isGroup: true,
                frente: frenteName,
                total: sumTotal.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                paradas: sumParadas.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                produtiva: sumProdutiva.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                auxiliar: sumAuxiliar.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                semApto: '0,0%',
                vMedia: avgVMedia.toFixed(1).replace('.', ','),
                ocioso: avgOcioso.toFixed(1).replace('.', ',') + '%',
                efic: avgEfic.toFixed(1).replace('.', ',') + '%',
                dispMec: avgDispMec.toFixed(1).replace('.', ',') + '%',
                lh: avgLh.toFixed(1).replace('.', ','),
                ha: sumHa.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
                haHora: avgHaHora.toFixed(1).replace('.', ','),
                statusOcioso: avgOcioso <= 10 ? 'ok' : 'error',
                statusEfic: avgEfic >= 35 ? 'ok' : 'error',
                statusDisp: avgDispMec >= 85 ? 'ok' : 'error',
                subRows
              };
            });
          }
          
          // 3. Detect "Operadores"
          else if (hasKeyMatching(['operador', 'motorista', 'nome']) && hasKeyMatching(['total', 'produtiva'])) {
            imported.operadores = rawRows.map((row: any, i) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              return {
                id: `op_${i}`,
                nome: String(find(['operador', 'motorista', 'nome'], 'OPERADOR')).toUpperCase(),
                total: parseFloat(find(['total', 'horas'], 10)).toFixed(1).replace('.', ','),
                paradas: parseFloat(find(['paradas', 'parada'], 5)).toFixed(1).replace('.', ','),
                produtiva: parseFloat(find(['produtiva', 'prod'], 5)).toFixed(1).replace('.', ','),
                auxiliar: parseFloat(find(['auxiliar', 'aux'], 0)).toFixed(1).replace('.', ','),
                semApto: '0,0%',
                vMedia: parseFloat(find(['v_media', 'velocidade'], 10)).toFixed(1).replace('.', ','),
                ocioso: parseFloat(find(['ocioso', 'ociosidade'], 5)).toFixed(1).replace('.', ',') + '%',
                efic: parseFloat(find(['efic', 'eficiencia'], 50)).toFixed(1).replace('.', ',') + '%',
                dispMec: parseFloat(find(['disp', 'mecanica'], 90)).toFixed(1).replace('.', ',') + '%',
                lh: parseFloat(find(['l_h', 'lh', 'consumo'], 8)).toFixed(1).replace('.', ','),
                ha: parseFloat(find(['ha', 'hectares'], 0)).toFixed(1).replace('.', ','),
                haHora: parseFloat(find(['ha_hora', 'ha/hora'], 0)).toFixed(1).replace('.', ','),
                statusOcioso: 'ok',
                statusEfic: 'ok',
                statusDisp: 'ok'
              };
            });
          }
          
          // 4. Detect "Ofensores"
          else if (hasKeyMatching(['ofensor', 'motivo', 'parada']) && hasKeyMatching(['valor', 'horas', 'tempo'])) {
            imported.ofensores = rawRows.map((row: any) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              return {
                name: String(find(['ofensor', 'motivo', 'parada'], 'OUTROS')),
                value: parseFloat(find(['valor', 'horas', 'tempo'], 0))
              };
            });
          }
        });
        
        localStorage.setItem('diario_coa_excel_data', JSON.stringify(imported));
        setImportedData(imported);
        
        // Formata data atual do upload
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        localStorage.setItem('diario_coa_last_update', formattedDate);
        setLastUpdateTime(formattedDate);
        
        // Dispara evento global para outros componentes escutarem a atualização
        window.dispatchEvent(new Event('diario_coa_updated'));
        
        // Log in Gestão de Áreas se houver utilitário
        try {
          const rawLogs = localStorage.getItem("gestao_areas_historico_logs");
          const logs = rawLogs ? JSON.parse(rawLogs) : [];
          const newLog = {
            id: `GA-LOG-${Date.now()}`,
            timestamp: now.toLocaleString("pt-BR"),
            categoria: 'Importação Excel',
            frente: selectedFrente,
            detalhes: `Nova planilha importada por luizricardocarvalhod@gmail.com - Atualizado em ${formattedDate}`,
            usuario: "luizricardocarvalhod@gmail.com"
          };
          localStorage.setItem("gestao_areas_historico_logs", JSON.stringify([newLog, ...logs]));
          window.dispatchEvent(new Event("gestao_areas_historico_changed"));
        } catch (err) {
          console.error(err);
        }

        alert(`Sucesso! Planilha carregada e atualizada. Horário de sincronização definido para ${formattedDate}`);
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar a planilha do Excel. Certifique-se que o arquivo é válido.');
      }
    };
    if (isTxt) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // --- DYNAMIC FACTORS COMPUTATION ---
  const factors = React.useMemo(() => {
    const usinaFactors = {
      'ARIRANHA': 1.0,
      'PALESTINA': 1.15,
      'SANTA ALBERTINA': 0.85
    };
    const frenteFactors = {
      'Tudo': 1.0,
      '0.12-3 PÁTIO DE COMPOSTAGEM': 0.9,
      '0.32 ENLEIRADEIRA DE PALHA': 1.1,
      '0.42-1 QUEBRA LOMBO': 1.05
    };
    
    const uFact = usinaFactors[selectedUsina] || 1.0;
    const fFact = frenteFactors[selectedFrente] || 1.0;
    
    // Date Range factor based on 195 baseline days
    let dFact = 1.0;
    try {
      const t1 = new Date(dataInicio).getTime();
      const t2 = new Date(dataFim).getTime();
      if (!isNaN(t1) && !isNaN(t2) && t2 >= t1) {
        const diffDays = (t2 - t1) / (1000 * 3600 * 24);
        dFact = Math.max(0.05, diffDays / 195);
      }
    } catch (e) {
      console.error(e);
    }
    
    return {
      uFact,
      fFact,
      dFact,
      combined: uFact * fFact * dFact
    };
  }, [selectedUsina, selectedFrente, dataInicio, dataFim]);

  // --- DYNAMIC STATES AND COMPUTED VALUES ---

  const { filteredProducoesData, filteredProducoesTotal } = React.useMemo(() => {
    const base = importedData?.producoes || [
      // ARIRANHA Rows
      { id: '1', usina: 'ARIRANHA', segmento: 'CORRETIVO', dispMec: 92.3, efic: 21.4, horasEf: 11.1, haMeta: 51.4, haReal: 8.3, dif: -43.1, haHMeta: 0.95, haHReal: 0.6, statusDisp: 'ok', statusEfic: 'error' },
      { id: '2', usina: 'ARIRANHA', segmento: 'SISTEMATIZAÇÃO', dispMec: 87.3, efic: 39.7, horasEf: 50.5, haMeta: 11332.1, haReal: 62.1, dif: -11270.0, haHMeta: 1.13, haHReal: 0.9, statusDisp: 'ok', statusEfic: 'error' },
      { id: '3', usina: 'ARIRANHA', segmento: 'ADUBAÇÃO', dispMec: 86.1, efic: 17.7, horasEf: 30.2, haMeta: 21304.9, haReal: 166.7, dif: -21138.2, haHMeta: 3.83, haHReal: 3.7, statusDisp: 'ok', statusEfic: 'error' },
      { id: '4', usina: 'ARIRANHA', segmento: 'HERBICIDA', dispMec: 84.0, efic: 27.2, horasEf: 44.0, haMeta: 75449.1, haReal: 398.0, dif: -75051.1, haHMeta: 5.83, haHReal: 6.1, statusDisp: 'warning', statusEfic: 'error' },
      { id: '5', usina: 'ARIRANHA', segmento: 'CONTROLE DE PRAGAS', dispMec: 82.4, efic: 10.7, horasEf: 2.2, haMeta: 1547.5, haReal: 6.7, dif: -1540.7, haHMeta: 2.00, haHReal: 1.5, statusDisp: 'warning', statusEfic: 'error' },
      { id: '6', usina: 'ARIRANHA', segmento: 'PREPARO DE SOLO', dispMec: 81.1, efic: 40.5, horasEf: 50.2, haMeta: 25453.1, haReal: 112.3, dif: -25340.9, haHMeta: 1.57, haHReal: 1.4, statusDisp: 'warning', statusEfic: 'error' },
      { id: '7', usina: 'ARIRANHA', segmento: 'QUEBRA LOMBO', dispMec: 76.5, efic: 33.0, horasEf: 17.8, haMeta: 11978.9, haReal: 62.1, dif: -11916.8, haHMeta: 2.24, haHReal: 2.1, statusDisp: 'error', statusEfic: 'error' },
      
      // PALESTINA Rows
      { id: '1_p', usina: 'PALESTINA', segmento: 'CORRETIVO', dispMec: 94.5, efic: 26.1, horasEf: 15.2, haMeta: 60.0, haReal: 14.8, dif: -45.2, haHMeta: 1.0, haHReal: 0.9, statusDisp: 'ok', statusEfic: 'error' },
      { id: '2_p', usina: 'PALESTINA', segmento: 'SISTEMATIZAÇÃO', dispMec: 88.0, efic: 41.5, horasEf: 55.4, haMeta: 11500.0, haReal: 70.2, dif: -11429.8, haHMeta: 1.15, haHReal: 1.0, statusDisp: 'ok', statusEfic: 'ok' },
      { id: '3_p', usina: 'PALESTINA', segmento: 'ADUBAÇÃO', dispMec: 87.2, efic: 22.0, horasEf: 35.8, haMeta: 22000.0, haReal: 195.4, dif: -21804.6, haHMeta: 3.9, haHReal: 3.8, statusDisp: 'ok', statusEfic: 'error' },
      { id: '4_p', usina: 'PALESTINA', segmento: 'HERBICIDA', dispMec: 86.3, efic: 30.5, horasEf: 48.0, haMeta: 77000.0, haReal: 420.0, dif: -76580.0, haHMeta: 5.9, haHReal: 5.8, statusDisp: 'ok', statusEfic: 'error' },
      { id: '5_p', usina: 'PALESTINA', segmento: 'CONTROLE DE PRAGAS', dispMec: 83.5, efic: 12.0, horasEf: 3.0, haMeta: 1600.0, haReal: 8.5, dif: -1591.5, haHMeta: 2.1, haHReal: 1.8, statusDisp: 'warning', statusEfic: 'error' },
      { id: '6_p', usina: 'PALESTINA', segmento: 'PREPARO DE SOLO', dispMec: 82.0, efic: 42.1, horasEf: 52.0, haMeta: 26000.0, haReal: 130.0, dif: -25870.0, haHMeta: 1.6, haHReal: 1.5, statusDisp: 'warning', statusEfic: 'ok' },
      
      // SANTA ALBERTINA Rows
      { id: '1_sa', usina: 'SANTA ALBERTINA', segmento: 'CORRETIVO', dispMec: 91.2, efic: 19.8, horasEf: 9.5, haMeta: 48.0, haReal: 6.5, dif: -41.5, haHMeta: 0.9, haHReal: 0.5, statusDisp: 'ok', statusEfic: 'error' },
      { id: '2_sa', usina: 'SANTA ALBERTINA', segmento: 'SISTEMATIZAÇÃO', dispMec: 86.1, efic: 35.2, horasEf: 45.0, haMeta: 10800.0, haReal: 55.0, dif: -10745.0, haHMeta: 1.1, haHReal: 0.8, statusDisp: 'ok', statusEfic: 'error' },
      { id: '3_sa', usina: 'SANTA ALBERTINA', segmento: 'ADUBAÇÃO', dispMec: 84.5, efic: 15.1, horasEf: 26.4, haMeta: 20000.0, haReal: 145.0, dif: -19855.0, haHMeta: 3.7, haHReal: 3.5, statusDisp: 'warning', statusEfic: 'error' },
      { id: '4_sa', usina: 'SANTA ALBERTINA', segmento: 'HERBICIDA', dispMec: 82.1, efic: 24.5, horasEf: 40.0, haMeta: 72000.0, haReal: 370.0, dif: -71630.0, haHMeta: 5.7, haHReal: 5.5, statusDisp: 'warning', statusEfic: 'error' },
      { id: '7_sa', usina: 'SANTA ALBERTINA', segmento: 'QUEBRA LOMBO', dispMec: 74.0, efic: 30.2, horasEf: 15.0, haMeta: 11000.0, haReal: 52.4, dif: -10947.6, haHMeta: 2.2, haHReal: 2.0, statusDisp: 'error', statusEfic: 'error' }
    ];
    
    const segmentCategories: Record<string, string[]> = {
      'Tratos Culturais': ['ADUBAÇÃO', 'HERBICIDA', 'CONTROLE DE PRAGAS', 'QUEBRA LOMBO'],
      'Preparo de Solo': ['SISTEMATIZAÇÃO', 'PREPARO DE SOLO'],
      'Corretivo': ['CORRETIVO']
    };
    
    const filtered = base.filter((row: any) => {
      if (row.usina && row.usina !== selectedUsina) return false;
      if (selectedSegmento === 'Tudo') return true;
      const allowed = segmentCategories[selectedSegmento] || [];
      return allowed.includes(row.segmento.toUpperCase());
    }).map((row: any) => {
      const scaledHoras = row.horasEf * factors.combined;
      const scaledMeta = row.haMeta * factors.combined;
      const scaledReal = row.haReal * factors.combined;
      
      const scaledDispMec = Math.min(100, Math.max(50, row.dispMec * factors.uFact));
      const scaledEfic = Math.min(100, Math.max(5, row.efic * factors.fFact));
      const scaledHaHReal = Math.max(0.1, row.haHReal * factors.uFact);
      
      return {
        ...row,
        dispMec: scaledDispMec,
        efic: scaledEfic,
        horasEf: scaledHoras,
        haMeta: scaledMeta,
        haReal: scaledReal,
        dif: scaledReal - scaledMeta,
        haHReal: scaledHaHReal,
        statusDisp: scaledDispMec >= 85 ? 'ok' : scaledDispMec >= 80 ? 'warning' : 'error',
        statusEfic: scaledEfic >= 35 ? 'ok' : 'error'
      };
    });
    
    const sumHoras = filtered.reduce((acc: number, r: any) => acc + r.horasEf, 0);
    const sumMeta = filtered.reduce((acc: number, r: any) => acc + r.haMeta, 0);
    const sumReal = filtered.reduce((acc: number, r: any) => acc + r.haReal, 0);
    const avgDisp = filtered.length ? (filtered.reduce((acc: number, r: any) => acc + r.dispMec, 0) / filtered.length) : 84.2;
    const avgEfic = filtered.length ? (filtered.reduce((acc: number, r: any) => acc + r.efic, 0) / filtered.length) : 29.5;
    const avgHaHMeta = filtered.length ? (filtered.reduce((acc: number, r: any) => acc + r.haHMeta, 0) / filtered.length) : 3.16;
    const avgHaHReal = filtered.length ? (filtered.reduce((acc: number, r: any) => acc + r.haHReal, 0) / filtered.length) : 2.7;
    
    const total = {
      segmento: 'Total',
      dispMec: avgDisp,
      efic: avgEfic,
      horasEf: sumHoras,
      haMeta: sumMeta,
      haReal: sumReal,
      dif: sumReal - sumMeta,
      haHMeta: avgHaHMeta,
      haHReal: avgHaHReal,
      statusDisp: avgDisp >= 85 ? 'ok' : avgDisp >= 80 ? 'warning' : 'error',
      statusEfic: avgEfic >= 35 ? 'ok' : 'error'
    };
    
    return {
      filteredProducoesData: filtered,
      filteredProducoesTotal: total
    };
  }, [importedData, selectedSegmento, factors]);

  const filteredTratosCulturaisTable = React.useMemo(() => {
    const base = importedData?.tratos || [
      {
        id: 'f1',
        isGroup: true,
        usina: 'ARIRANHA',
        frente: '0.12-3 PÁTIO DE COMPOSTAGEM',
        total: '12.663,2',
        paradas: '9.431,4',
        produtiva: '2.927,4',
        auxiliar: '304,5',
        semApto: '0,8%',
        vMedia: '16,1',
        ocioso: '9,8%',
        efic: '30,6%',
        dispMec: '80,9%',
        lh: '8,7',
        ha: '832,4',
        haHora: '0,3',
        statusOcioso: 'ok',
        statusEfic: 'error',
        statusDisp: 'error',
        subRows: [
          { id: 'f1_s1', frente: '  114505-CAMINHOES', total: '44,7', paradas: '41,3', produtiva: '3,4', auxiliar: '0,0', semApto: '8,1%', vMedia: '21,8', ocioso: '33,5%', efic: '28,6%', dispMec: '99,2%', lh: '22,7', ha: '0,0', haHora: '0,0', statusOcioso: 'error', statusEfic: 'error', statusDisp: 'ok' },
          { id: 'f1_s2', frente: '  114506-CAMINHOES', total: '141,2', paradas: '103,1', produtiva: '37,4', auxiliar: '0,7', semApto: '0,0%', vMedia: '16,1', ocioso: '14,8%', efic: '42,2%', dispMec: '84,1%', lh: '22,7', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'error', statusDisp: 'error' },
          { id: 'f1_s3', frente: '  310052-CAMINHOES', total: '289,7', paradas: '261,5', produtiva: '27,6', auxiliar: '0,7', semApto: '1,0%', vMedia: '17,3', ocioso: '21,2%', efic: '11,3%', dispMec: '85,4%', lh: '10,8', ha: '0,0', haHora: '0,0', statusOcioso: 'error', statusEfic: 'error', statusDisp: 'error' },
          { id: 'f1_s4', frente: '  310055-CAMINHOES', total: '1.478,3', paradas: '1.153,3', produtiva: '310,1', auxiliar: '14,9', semApto: '1,2%', vMedia: '18,3', ocioso: '16,0%', efic: '26,8%', dispMec: '81,4%', lh: '7,5', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'error', statusDisp: 'error' }
        ]
      },
      {
        id: 'f2',
        isGroup: true,
        usina: 'PALESTINA',
        frente: '0.32 ENLEIRADEIRA DE PALHA',
        total: '9.787,0',
        paradas: '7.919,3',
        produtiva: '1.589,1',
        auxiliar: '278,6',
        semApto: '2,4%',
        vMedia: '8,3',
        ocioso: '9,7%',
        efic: '10,7%',
        dispMec: '82,4%',
        lh: '7,1',
        ha: '2.458,1',
        haHora: '1,5',
        statusOcioso: 'ok',
        statusEfic: 'error',
        statusDisp: 'warning',
        subRows: [
          { id: 'f2_s1', frente: '  505504-TRATOR ENLEIRADOR', total: '7,0', paradas: '7,0', produtiva: '0,0', auxiliar: '0,0', semApto: '0,0%', vMedia: '10,3', ocioso: '15,7%', efic: '4,3%', dispMec: '100,0%', lh: '0,0', ha: '0,0', haHora: '0,0', statusOcioso: 'error', statusEfic: 'error', statusDisp: 'ok' },
          { id: 'f2_s2', frente: '  505505-TRATORES LEVES', total: '415,1', paradas: '390,1', produtiva: '25,0', auxiliar: '0,0', semApto: '0,3%', vMedia: '10,3', ocioso: '15,7%', efic: '4,3%', dispMec: '84,9%', lh: '6,1', ha: '35,8', haHora: '1,4', statusOcioso: 'error', statusEfic: 'error', statusDisp: 'error' }
        ]
      },
      {
        id: 'f3',
        isGroup: true,
        usina: 'SANTA ALBERTINA',
        frente: '0.42-1 QUEBRA LOMBO',
        total: '55.893,0',
        paradas: '34.183,4',
        produtiva: '16.794,5',
        auxiliar: '4.915,0',
        semApto: '0,8%',
        vMedia: '8,1',
        ocioso: '5,7%',
        efic: '36,1%',
        dispMec: '82,9%',
        lh: '12,0',
        ha: '22.864,1',
        haHora: '1,4',
        statusOcioso: 'ok',
        statusEfic: 'error',
        statusDisp: 'warning',
        subRows: [
          { id: 'f3_s1', frente: '  104665-CAMINHOES PESADOS', total: '1.396,6', paradas: '268,7', produtiva: '1.123,7', auxiliar: '4,1', semApto: '0,7%', vMedia: '10,3', ocioso: '3,4%', efic: '89,5%', dispMec: '98,4%', lh: '14,0', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' },
          { id: 'f3_s2', frente: '  104809-CAMINHÃO PESADO', total: '122,4', paradas: '98,9', produtiva: '22,8', auxiliar: '0,7', semApto: '0,0%', vMedia: '13,0', ocioso: '6,2%', efic: '65,4%', dispMec: '100,0%', lh: '62,9', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' }
        ]
      }
    ];

    const parseNum = (val: string | number) => {
      if (typeof val === 'number') return val;
      const clean = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
      return parseFloat(clean) || 0;
    };

    return base.filter((group: any) => {
      if (group.usina && group.usina !== selectedUsina) return false;
      if (selectedFrente === 'Tudo') return true;
      return group.frente === selectedFrente;
    }).map((group: any) => {
      const filteredSub = (group.subRows || []).filter((sub: any) => {
        if (tipoEquipamento === 'Tudo') return true;
        const nameUpper = sub.frente.toUpperCase();
        const isApoio = nameUpper.includes('CAMINH') || nameUpper.includes('APOIO');
        if (tipoEquipamento === 'Apoio') return isApoio;
        return !isApoio;
      }).map((sub: any) => {
        const t = parseNum(sub.total) * factors.combined;
        const p = parseNum(sub.paradas) * factors.combined;
        const pr = parseNum(sub.produtiva) * factors.combined;
        const aux = parseNum(sub.auxiliar) * factors.combined;
        const h = parseNum(sub.ha) * factors.combined;
        const ociosoVal = Math.min(100, Math.max(0, parseNum(sub.ocioso) * factors.fFact));
        const eficVal = Math.min(100, Math.max(0, parseNum(sub.efic) * factors.uFact));
        const dispVal = Math.min(100, Math.max(50, parseNum(sub.dispMec) * factors.uFact));
        
        return {
          ...sub,
          total: t.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
          paradas: p.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
          produtiva: pr.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
          auxiliar: aux.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
          ha: h.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
          ocioso: ociosoVal.toFixed(1).replace('.', ',') + '%',
          efic: eficVal.toFixed(1).replace('.', ',') + '%',
          dispMec: dispVal.toFixed(1).replace('.', ',') + '%',
          statusOcioso: ociosoVal <= 10 ? 'ok' : 'error',
          statusEfic: eficVal >= 35 ? 'ok' : 'error',
          statusDisp: dispVal >= 85 ? 'ok' : 'error',
          _t: t, _p: p, _pr: pr, _aux: aux, _h: h, _ocioso: ociosoVal, _efic: eficVal, _disp: dispVal
        };
      });

      const sumT = filteredSub.reduce((acc, s) => acc + s._t, 0) || (parseNum(group.total) * factors.combined);
      const sumP = filteredSub.reduce((acc, s) => acc + s._p, 0) || (parseNum(group.paradas) * factors.combined);
      const sumPr = filteredSub.reduce((acc, s) => acc + s._pr, 0) || (parseNum(group.produtiva) * factors.combined);
      const sumAux = filteredSub.reduce((acc, s) => acc + s._aux, 0) || (parseNum(group.auxiliar) * factors.combined);
      const sumHa = filteredSub.reduce((acc, s) => acc + s._h, 0) || (parseNum(group.ha) * factors.combined);
      const avgOcioso = filteredSub.length ? (filteredSub.reduce((acc, s) => acc + s._ocioso, 0) / filteredSub.length) : (parseNum(group.ocioso) * factors.fFact);
      const avgEfic = filteredSub.length ? (filteredSub.reduce((acc, s) => acc + s._efic, 0) / filteredSub.length) : (parseNum(group.efic) * factors.uFact);
      const avgDisp = filteredSub.length ? (filteredSub.reduce((acc, s) => acc + s._disp, 0) / filteredSub.length) : (parseNum(group.dispMec) * factors.uFact);
      const vMediaVal = parseNum(group.vMedia) * factors.uFact;
      const lhVal = parseNum(group.lh) * factors.fFact;
      const haHoraVal = parseNum(group.haHora) * factors.uFact;

      return {
        ...group,
        total: sumT.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        paradas: sumP.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        produtiva: sumPr.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        auxiliar: sumAux.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        ha: sumHa.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        vMedia: vMediaVal.toFixed(1).replace('.', ','),
        lh: lhVal.toFixed(1).replace('.', ','),
        haHora: haHoraVal.toFixed(1).replace('.', ','),
        ocioso: avgOcioso.toFixed(1).replace('.', ',') + '%',
        efic: avgEfic.toFixed(1).replace('.', ',') + '%',
        dispMec: avgDisp.toFixed(1).replace('.', ',') + '%',
        statusOcioso: avgOcioso <= 10 ? 'ok' : 'error',
        statusEfic: avgEfic >= 35 ? 'ok' : 'error',
        statusDisp: avgDisp >= 85 ? 'ok' : 'error',
        subRows: filteredSub
      };
    });
  }, [importedData, selectedFrente, tipoEquipamento, factors]);

  const filteredOfensoresData = React.useMemo(() => {
    const base = importedData?.ofensores || [
      { name: 'Guarda de Maquinas', value: 66.1 },
      { name: 'Aguardando Carreg.', value: 29.0 },
      { name: 'Auto Deslocamento', value: 25.2 },
      { name: 'Carreg. Insumo', value: 12.7 },
      { name: 'Refeição', value: 11.2 },
      { name: 'Aguard. Rolão Tubo', value: 10.7 },
      { name: 'Ag Descarregar', value: 9.8 },
      { name: 'Falta de Operador', value: 9.1 },
      { name: 'Sem Apontamento', value: 7.7 },
      { name: 'Aguard. Terraceamento', value: 7.2 }
    ];
    return base.map((item: any) => ({
      ...item,
      value: Number((item.value * factors.combined).toFixed(1))
    })).sort((a: any, b: any) => b.value - a.value);
  }, [importedData, factors]);

  const filteredComboChartData = React.useMemo(() => {
    const base = importedData?.combo || [
      { name: '0.46-1 AUTOPROP', Hectares: 171.9, HaHora: 8.4 },
      { name: '0.46-2 AUTOPROP', Hectares: 72.1, HaHora: 6.0 },
      { name: '0.43-1 HERBICIDA', Hectares: 15.5, HaHora: 3.6 },
      { name: '0.81-1 PREP SOLO', Hectares: 71.1, HaHora: 3.0 },
      { name: '0.83-1 CORREÇÃO', Hectares: 62.6, HaHora: 4.6 },
      { name: '0.62-1 SISTEMAT', Hectares: 31.2, HaHora: 4.9 },
      { name: '0.42-1 QUEB LOMB', Hectares: 23.2, HaHora: 4.4 },
      { name: '0.42-1 VINHAÇA', Hectares: 12.1, HaHora: 0.9 },
      { name: '0.54-1 CORTE SO', Hectares: 1.6, HaHora: 0.8 },
      { name: '0.44-1 HERBICIDA', Hectares: 21.1, HaHora: 1.0 },
      { name: '0.54-2 VINHAÇA', Hectares: 15.6, HaHora: 1.1 },
      { name: '0.82-3 PATIO COM', Hectares: 9.9, HaHora: 0.7 },
      { name: '0.53-2 AUTOPROP', Hectares: 13.0, HaHora: 1.6 },
      { name: '0.45-1 QUADRICIC', Hectares: 8.6, HaHora: 1.5 },
      { name: '0.81-3 PREP SOLO', Hectares: 7.7, HaHora: 2.5 }
    ];
    
    return base.filter((item: any) => {
      if (tipoEquipamento === 'Tudo') return true;
      const isApoio = item.name.toUpperCase().includes('CAMINH') || item.name.toUpperCase().includes('PATIO') || item.name.toUpperCase().includes('QUADRI');
      if (tipoEquipamento === 'Apoio') return isApoio;
      return !isApoio;
    }).map((item: any) => ({
      ...item,
      Hectares: Number((item.Hectares * factors.combined).toFixed(1)),
      HaHora: Number((item.HaHora * factors.uFact).toFixed(1))
    }));
  }, [importedData, tipoEquipamento, factors]);

  const filteredOperadoresData = React.useMemo(() => {
    const base = importedData?.operadores || [
      { id: 'op1', usina: 'ARIRANHA', nome: '38617 - EMERSON HENRIQUE ASSI', total: '1.628,3', paradas: '466,8', produtiva: '1.154,3', auxiliar: '7,2', semApto: '0,3%', vMedia: '11,2', ocioso: '2,4%', efic: '88,9%', dispMec: '95,8%', lh: '5,9', ha: '0,1', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' },
      { id: 'op2', usina: 'ARIRANHA', nome: '8696 - DEVANIR JOSE DE SOUZA JUNIOR', total: '2.012,2', paradas: '878,8', produtiva: '1.130,7', auxiliar: '2,7', semApto: '0,1%', vMedia: '8,0', ocioso: '1,5%', efic: '65,5%', dispMec: '98,6%', lh: '8,5', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' },
      { id: 'op3', usina: 'PALESTINA', nome: '28887 - PAULO ROGERIO PERES', total: '1.729,7', paradas: '606,2', produtiva: '1.120,0', auxiliar: '3,6', semApto: '2,4%', vMedia: '10,6', ocioso: '2,5%', efic: '76,6%', dispMec: '98,4%', lh: '3,8', ha: '0,9', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' },
      { id: 'op4', usina: 'SANTA ALBERTINA', nome: '9999 - OPERADOR NAO CADASTRADO', total: '46.936,0', paradas: '45.059,1', produtiva: '1.066,2', auxiliar: '810,7', semApto: '1,9%', vMedia: '5,8', ocioso: '29,4%', efic: '2,4%', dispMec: '92,8%', lh: '13,9', ha: '3,2', haHora: '1,1', statusOcioso: 'error', statusEfic: 'error', statusDisp: 'ok' },
      { id: 'op5', usina: 'PALESTINA', nome: '52041 - EVERTON BRUNO BOAVENTURA VAL', total: '2.056,0', paradas: '1.015,9', produtiva: '1.040,0', auxiliar: '0,1', semApto: '0,5%', vMedia: '7,1', ocioso: '1,7%', efic: '58,4%', dispMec: '99,8%', lh: '7,7', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' },
      { id: 'op6', usina: 'SANTA ALBERTINA', nome: '29954 - LINIKER BRANDAO DE CASTRO', total: '1.808,9', paradas: '823,8', produtiva: '983,6', auxiliar: '1,5', semApto: '0,5%', vMedia: '15,0', ocioso: '4,9%', efic: '60,5%', dispMec: '93,6%', lh: '9,3', ha: '0,0', haHora: '0,0', statusOcioso: 'ok', statusEfic: 'ok', statusDisp: 'ok' }
    ];

    const parseNum = (val: string | number) => {
      if (typeof val === 'number') return val;
      const clean = val.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
      return parseFloat(clean) || 0;
    };

    const filteredBase = base.filter((op: any) => !op.usina || op.usina === selectedUsina);

    return filteredBase.map((op: any) => {
      const t = parseNum(op.total) * factors.combined;
      const p = parseNum(op.paradas) * factors.combined;
      const pr = parseNum(op.produtiva) * factors.combined;
      const aux = parseNum(op.auxiliar) * factors.combined;
      const ociosoVal = Math.min(100, Math.max(0, parseNum(op.ocioso) * factors.fFact));
      const eficVal = Math.min(100, Math.max(0, parseNum(op.efic) * factors.uFact));
      const dispVal = Math.min(100, Math.max(50, parseNum(op.dispMec) * factors.uFact));
      const h = parseNum(op.ha) * factors.combined;
      
      return {
        ...op,
        total: t.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        paradas: p.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        produtiva: pr.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        auxiliar: aux.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        ha: h.toLocaleString('pt-BR', { minimumFractionDigits: 1 }),
        ocioso: ociosoVal.toFixed(1).replace('.', ',') + '%',
        efic: eficVal.toFixed(1).replace('.', ',') + '%',
        dispMec: dispVal.toFixed(1).replace('.', ',') + '%',
        statusOcioso: ociosoVal <= 10 ? 'ok' : 'error',
        statusEfic: eficVal >= 35 ? 'ok' : 'error',
        statusDisp: dispVal >= 85 ? 'ok' : 'error',
      };
    });
  }, [importedData, selectedUsina, factors]);

  const { totalHoursProdutiva, totalHoursParadas } = React.useMemo(() => {
    let sumProd = 0;
    let sumPara = 0;
    filteredTratosCulturaisTable.forEach(g => {
      const pNum = (val: string) => parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0;
      sumProd += pNum(g.produtiva);
      sumPara += pNum(g.paradas);
    });
    return {
      totalHoursProdutiva: sumProd || 450.7,
      totalHoursParadas: sumPara || 1100.0
    };
  }, [filteredTratosCulturaisTable]);

  const toggleGroupExpand = (frenteName: string) => {
    setIsTableExpanded(prev => ({ ...prev, [frenteName]: !prev[frenteName] }));
  };


  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle size={15} className="text-green-600 inline" />;
      case 'warning':
        return <AlertTriangle size={15} className="text-yellow-500 inline" />;
      case 'error':
        return <XCircle size={15} className="text-red-500 inline" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 text-left bg-gray-50/50" onClick={(e) => e.stopPropagation()}>
      
      {/* HEADER CARD */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col xl:flex-row items-center justify-between gap-6 mb-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full xl:w-auto">
          <div className="w-16 h-16 bg-[#00843D]/10 rounded-[22px] flex items-center justify-center text-[#00843D] shadow-inner shrink-0">
            <TrendingUp size={32} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex flex-col sm:flex-row items-center gap-2">
              <span>Diário COA</span>
              <span className="text-gray-300 font-bold hidden sm:inline">|</span>
              <span className="text-[#00843D]">Indicadores &amp; Produções</span>
            </h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
              Painel Corporativo Colombo - Tratos Culturais e Eficiência de Ativos
            </p>
          </div>
        </div>

        {/* Dynamic update badge */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <div className="bg-[#00843D]/5 border border-[#00843D]/10 px-5 py-3 rounded-2xl flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00843D]"></span>
            </div>
            <div className="text-xs font-black text-gray-700 tracking-tight uppercase">
              Atualizado em: <span className="text-[#00843D]" translate="no">{lastUpdateTime}</span>
            </div>
          </div>

          {/* Excel Import button */}
          <label className="w-full sm:w-auto bg-green-700 hover:bg-[#00843D] active:scale-95 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-green-950/10 border border-green-800 transition-all">
            <FileSpreadsheet size={16} />
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

      {/* FILTER PANEL */}
      <div className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          
          {/* Usina Switch */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Unidade:</span>
            <div className="bg-gray-100 p-1 rounded-2xl border border-gray-200/50 flex gap-1">
              {(['ARIRANHA', 'PALESTINA', 'SANTA ALBERTINA'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUsina(u)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] font-black tracking-wider transition-all uppercase ${
                    selectedUsina === u 
                      ? 'bg-[#00843D] text-white shadow-md shadow-green-950/15' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {u === 'ARIRANHA' ? 'ARI' : u === 'PALESTINA' ? 'PAL' : 'STA'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-250" />

          {/* Frente Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frente:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedFrente}
                onChange={(e) => setSelectedFrente(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-150 hover:border-gray-300 rounded-xl py-2 px-4 pr-10 text-xs font-black text-gray-800 outline-none appearance-none transition-all cursor-pointer min-w-[140px]"
              >
                <option value="Tudo">Tudo</option>
                {availableFrentes.map((f: string) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none stroke-[2.5px]" />
            </div>
          </div>

          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-250" />

          {/* Segment Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Segmento:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedSegmento}
                onChange={(e) => setSelectedSegmento(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-150 hover:border-gray-300 rounded-xl py-2 px-4 pr-10 text-xs font-black text-gray-800 outline-none appearance-none transition-all cursor-pointer min-w-[140px]"
              >
                <option value="Tudo">Tudo</option>
                <option value="Tratos Culturais">Tratos Culturais</option>
                <option value="Preparo de Solo">Preparo de Solo</option>
                <option value="Corretivo">Corretivo</option>
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none stroke-[2.5px]" />
            </div>
          </div>

          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-250" />

          {/* Tipo Equipamento Selector */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Equipamento:</span>
            <div className="bg-gray-100 p-1 rounded-2xl border border-gray-200/50 flex gap-1">
              {(['Tudo', 'Apoio', 'Principal'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoEquipamento(t)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all uppercase ${
                    tipoEquipamento === t 
                      ? 'bg-gray-800 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fechamento:</span>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-gray-50 border-2 border-gray-150 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-700 outline-none flex-1 sm:flex-none w-full sm:w-auto min-w-0"
            />
            <span className="text-gray-400 text-xs font-bold">até</span>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-gray-50 border-2 border-gray-150 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-700 outline-none flex-1 sm:flex-none w-full sm:w-auto min-w-0"
            />
          </div>
        </div>
      </div>

      {/* DASHBOARD SUB-PAGE SELECTOR NAVIGATION */}
      <div className="flex border-b border-gray-200 gap-2 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('producoes')}
          className={`shrink-0 px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === 'producoes'
              ? 'border-[#00843D] text-[#00843D]'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          📈 Diário COA - Produções
        </button>
        <button
          onClick={() => setActiveTab('indicadores')}
          className={`shrink-0 px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === 'indicadores'
              ? 'border-[#00843D] text-[#00843D]'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          📊 Indicadores de Tratos
        </button>
        <button
          onClick={() => setActiveTab('tabela')}
          className={`shrink-0 px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === 'tabela'
              ? 'border-[#00843D] text-[#00843D]'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          📋 Tratos Culturais (Tabela)
        </button>
        <button
          onClick={() => setActiveTab('operadores')}
          className={`shrink-0 px-6 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 -mb-[2px] ${
            activeTab === 'operadores'
              ? 'border-[#00843D] text-[#00843D]'
              : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
          }`}
        >
          👥 Ranking de Operadores
        </button>
      </div>

      {/* VIEWPORT AREA */}
      <div className="transition-all duration-300">
        
        {/* SUB-PAGE 1: DIÁRIO COA - PRODUÇÕES */}
        {activeTab === 'producoes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Legend warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-red-50/50 border border-red-100 p-4 rounded-2xl">
              <div className="text-[10px] font-bold text-red-700 leading-snug">
                *Fonte: Solinftec — dados processados às 00:00, sujeitos a ajustes após processamento.
              </div>
              <div className="text-[10px] font-bold text-red-700 leading-snug">
                *Diesel: PIMS-MANFRO — volumes com base nos últimos 5 dias.
              </div>
              <div className="text-[10px] font-bold text-red-700 leading-snug">
                *Ha Real: estimado por largura do implemento (m), velocidade (km/h) e tempo efetivo (h).
              </div>
              <div className="text-[10px] font-bold text-red-700 leading-snug">
                *Ha Meta: baseado no rendimento orçado da operação × horas produtivas.
              </div>
            </div>

            {/* Main Production Grid Table */}
            <div className="bg-white rounded-[28px] border border-gray-150 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-700">Tratos Culturais e Preparo de Solo</span>
                <span className="bg-[#00843D]/10 text-[#00843D] text-[9px] font-black px-3 py-1 rounded-full uppercase">Visão por Segmento</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#004d22] text-white font-black uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Segmento</th>
                      <th className="py-3 px-4 text-center">Disp.Mec (%)</th>
                      <th className="py-3 px-4 text-center">Eficiência (%)</th>
                      <th className="py-3 px-4 text-center">Horas Efetivas</th>
                      <th className="py-3 px-4 text-center">Ha Meta</th>
                      <th className="py-3 px-4 text-center">Ha Real</th>
                      <th className="py-3 px-4 text-center">Dif. (Ha)</th>
                      <th className="py-3 px-4 text-center">(Ha/H) Meta</th>
                      <th className="py-3 px-4 text-center">(Ha/H) Real</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold text-gray-700">
                    {filteredProducoesData.map((row) => (
                      <tr key={row.id} className="border-b border-gray-150 hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-gray-900">{row.segmento}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="mr-1.5">{row.dispMec.toFixed(1).replace('.', ',')}%</span>
                          {renderStatusIcon(row.statusDisp)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="mr-1.5">{row.efic.toFixed(1).replace('.', ',')}%</span>
                          {renderStatusIcon(row.statusEfic)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-gray-900">{row.horasEf.toFixed(1).replace('.', ',')}</td>
                        <td className="py-3.5 px-4 text-center">{row.haMeta.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                        <td className="py-3.5 px-4 text-center text-[#00843D]">{row.haReal.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                        <td className={`py-3.5 px-4 text-center ${row.dif < 0 ? 'text-red-500' : 'text-green-600'}`}>
                          {row.dif.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
                        </td>
                        <td className="py-3.5 px-4 text-center text-gray-500">{row.haHMeta.toFixed(2).replace('.', ',')}</td>
                        <td className="py-3.5 px-4 text-center text-gray-900">{row.haHReal.toFixed(1).replace('.', ',')}</td>
                      </tr>
                    ))}
                    {/* TOTAL FOOTER ROW */}
                    <tr className="bg-emerald-50 text-gray-900 font-black text-[13px] border-t-2 border-[#004d22]">
                      <td className="py-4 px-4 uppercase font-black text-[#004d22]">{filteredProducoesTotal.segmento}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="mr-1.5">{filteredProducoesTotal.dispMec.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(filteredProducoesTotal.statusDisp)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="mr-1.5">{filteredProducoesTotal.efic.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(filteredProducoesTotal.statusEfic)}
                      </td>
                      <td className="py-4 px-4 text-center">{filteredProducoesTotal.horasEf.toFixed(1).replace('.', ',')}</td>
                      <td className="py-4 px-4 text-center">{filteredProducoesTotal.haMeta.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                      <td className="py-4 px-4 text-center text-[#00843D]">{filteredProducoesTotal.haReal.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                      <td className="py-4 px-4 text-center text-red-600">{filteredProducoesTotal.dif.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                      <td className="py-4 px-4 text-center text-gray-500">{filteredProducoesTotal.haHMeta.toFixed(2).replace('.', ',')}</td>
                      <td className="py-4 px-4 text-center text-emerald-800">{filteredProducoesTotal.haHReal.toFixed(1).replace('.', ',')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div 
                onClick={() => setZoomedChartId('meta_vs_realizado')}
                className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Meta vs Realizado (Hectares)</h4>
                  <button
                    onClick={(e) => { e.stopPropagation(); setZoomedChartId('meta_vs_realizado'); }}
                    className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                    title="Expandir Gráfico"
                  >
                    <Maximize2 size={12} />
                  </button>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredProducoesData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#F3F4F6'} />
                      <XAxis dataKey="segmento" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} tickLine={false} />
                      <YAxis stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                      <Bar name="Meta Hectares" dataKey="haMeta" fill={isDarkMode ? '#4b5563' : '#94A3B8'} radius={[4, 4, 0, 0]} />
                      <Bar name="Realizado Hectares" dataKey="haReal" fill="#00843D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2">Desempenho Geral de Produção</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Média de Eficiência Realizada vs Meta Acumulada</p>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center my-auto">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hectares Fechados</span>
                    <p className="text-3xl font-black text-[#00843D] mt-2">{filteredProducoesTotal.haReal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ha</p>
                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">De {filteredProducoesTotal.haMeta.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} Planejados</span>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Eficiência Realizada</span>
                    <p className="text-3xl font-black text-red-500 mt-2">{filteredProducoesTotal.efic.toFixed(1).replace('.', ',')}%</p>
                    <span className="text-[9px] font-black uppercase text-red-600 tracking-wider">Desvio de {(filteredProducoesTotal.dif / 1000).toFixed(1).replace('.', ',')}K</span>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-4 text-center">
                  O sistema de monitoramento recomenda recalcular o desdobramento e frentes operacionais.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 2: INDICADORES DE TRATOS */}
        {activeTab === 'indicadores' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Indicator KPI Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              
              {/* Tratos Culturais Pie */}
              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col items-center">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 text-center w-full">Tratos Culturais</h3>
                <div className="h-32 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Produtiva_Media', value: totalHoursProdutiva, fill: '#004d22' },
                          { name: 'Paradas_Media', value: totalHoursParadas, fill: '#3B82F6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="#004d22" />
                        <Cell fill="#3B82F6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-black text-gray-800">{(totalHoursProdutiva + totalHoursParadas).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}h</span>
                  </div>
                </div>
                <div className="w-full text-[10px] font-bold text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#004d22]" />Produtiva_Média:</span>
                    <span className="text-gray-900 font-black">{totalHoursProdutiva.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ({(totalHoursProdutiva / (totalHoursProdutiva + totalHoursParadas || 1) * 100).toFixed(1).replace('.', ',')}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />Paradas_Média:</span>
                    <span className="text-gray-900 font-black">{totalHoursParadas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ({(totalHoursParadas / (totalHoursProdutiva + totalHoursParadas || 1) * 100).toFixed(1).replace('.', ',')}%)</span>
                  </div>
                </div>
              </div>

              {/* Indicadores Geral Horizontal Bars */}
              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider text-center">Indicadores Geral</h3>
                
                <div className="space-y-4 my-auto pt-2">
                  {/* Eficiência Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                      <span>Eficiência</span>
                      <span className="text-blue-600 font-black">{filteredProducoesTotal.efic.toFixed(1).replace('.', ',')}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${filteredProducoesTotal.efic}%` }} />
                    </div>
                  </div>

                  {/* Motor Ocioso Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                      <span>Motor Ocioso</span>
                      <span className="text-blue-500 font-black">{(7.5 * factors.fFact).toFixed(1).replace('.', ',')}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, 7.5 * factors.fFact)}%` }} />
                    </div>
                  </div>

                  {/* Disp Mecânica Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                      <span>Disp.Mecânica (%)</span>
                      <span className="text-blue-700 font-black">{filteredProducoesTotal.dispMec.toFixed(1).replace('.', ',')}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-700 rounded-full" style={{ width: `${filteredProducoesTotal.dispMec}%` }} />
                    </div>
                  </div>
                </div>
                
                <div className="h-2" />
              </div>

              {/* Half Gauge Descarga dos Bordos PTT */}
              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col items-center justify-center">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3 text-center">Taxa de Descarga dos Bordos PTT (%)</h3>
                <HalfGauge value={Math.min(100, Math.max(12, 23.0 * factors.uFact * factors.fFact))} size={150} />
              </div>

              {/* Resumo Card */}
              <div className="bg-[#00843D] p-6 rounded-[28px] border border-[#006B32] shadow-sm flex flex-col justify-between text-white">
                <div>
                  <span className="text-[10px] font-black uppercase text-white/70 tracking-widest">Resumo Operacional</span>
                  <p className="text-2xl font-black mt-2 leading-tight uppercase">Trato Cultivo Eficaz</p>
                </div>
                <div className="space-y-2 text-xs font-bold text-white/80">
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span>Produtividade:</span>
                    <span className="text-white font-black">Alta</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span>Média Ociosa:</span>
                    <span className="text-white font-black">{(7.5 * factors.fFact).toFixed(1).replace('.', ',')}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meta Solinftec:</span>
                    <span className="text-white font-black">Ok</span>
                  </div>
                </div>
                <div className="text-[9px] font-black uppercase text-[#5adc6a] tracking-wider">
                  Mapeamento em Tempo Real
                </div>
              </div>

            </div>

            {/* Top 10 Ofensores Operational Efficiency */}
            <div 
              onClick={() => setZoomedChartId('ofensores')}
              className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Top 10 Ofensores da Eficiência Operacional</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedChartId('ofensores'); }}
                  className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                  title="Expandir Gráfico"
                >
                  <Maximize2 size={12} />
                </button>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredOfensoresData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#F3F4F6'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} angle={-15} textAnchor="end" height={40} interval={0} tickLine={false} />
                    <YAxis stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#991B1B" radius={[4, 4, 0, 0]}>
                      {filteredOfensoresData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#991B1B' : '#C2410C'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hectares e Ha/Hora Combo Chart */}
            <div 
              onClick={() => setZoomedChartId('hectares_hahora')}
              className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Hectares e Ha/Hora</h3>
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomedChartId('hectares_hahora'); }}
                  className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm"
                  title="Expandir Gráfico"
                >
                  <Maximize2 size={12} />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={filteredComboChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#F3F4F6'} />
                    <XAxis dataKey="name" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={50} />
                    <YAxis yAxisId="left" stroke="#00843D" tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} tickLine={false} axisLine={false} label={{ value: 'Hectares', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontWeight: 'bold', fill: '#00843D' } }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 9 }} tickLine={false} axisLine={false} label={{ value: 'Ha/Hora', angle: 90, position: 'insideRight', style: { fontSize: 10, fontWeight: 'bold', fill: '#3B82F6' } }} />
                    <Tooltip />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Bar yAxisId="left" name="Hectares" dataKey="Hectares" fill="#00843D" opacity={0.8} radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" name="Ha/Hora" type="monotone" dataKey="HaHora" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* SUB-PAGE 3: TRATOS CULTURAIS DETAILED TABLE */}
        {activeTab === 'tabela' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Planilha Detalhada de Tratos Culturais</span>
              <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex gap-1">
                {(['Média', 'Total'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTableMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all ${
                      tableMode === mode 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable grid table */}
            <div className="bg-white rounded-[28px] border border-gray-150 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-bold">
                  <thead>
                    <tr className="bg-[#004d22] text-white font-black uppercase text-[10px] tracking-wider border-b border-gray-100">
                      <th className="py-3 px-4">Frente / Equipamento</th>
                      <th className="py-3 px-4 text-center">H_Total</th>
                      <th className="py-3 px-4 text-center">Paradas</th>
                      <th className="py-3 px-4 text-center">Produtiva</th>
                      <th className="py-3 px-4 text-center">Auxiliar</th>
                      <th className="py-3 px-4 text-center">Sem Apto</th>
                      <th className="py-3 px-4 text-center">V_Média</th>
                      <th className="py-3 px-4 text-center">Ocioso (%)</th>
                      <th className="py-3 px-4 text-center">Efic (%)</th>
                      <th className="py-3 px-4 text-center">Disp.Mec (%)</th>
                      <th className="py-3 px-4 text-center">L/H</th>
                      <th className="py-3 px-4 text-center">Ha</th>
                      <th className="py-3 px-4 text-center">Ha/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTratosCulturaisTable.map((group) => (
                      <React.Fragment key={group.id}>
                        {/* Parent Group Row */}
                        <tr className="bg-gray-50 border-b border-gray-150 hover:bg-gray-100/70 transition-colors">
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleGroupExpand(group.frente)}
                              className="flex items-center gap-2 text-gray-900 font-black uppercase text-left w-full"
                            >
                              {isTableExpanded[group.frente] ? <ChevronUp size={14} className="text-green-700" /> : <ChevronDown size={14} className="text-green-700" />}
                              <span>{group.frente}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-900">{group.total}</td>
                          <td className="py-3 px-4 text-center">{group.paradas}</td>
                          <td className="py-3 px-4 text-center text-[#00843D]">{group.produtiva}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{group.auxiliar}</td>
                          <td className="py-3 px-4 text-center">{group.semApto}</td>
                          <td className="py-3 px-4 text-center">{group.vMedia}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="mr-1.5">{group.ocioso}</span>
                            {renderStatusIcon(group.statusOcioso)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="mr-1.5">{group.efic}</span>
                            {renderStatusIcon(group.statusEfic)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="mr-1.5">{group.dispMec}</span>
                            {renderStatusIcon(group.statusDisp)}
                          </td>
                          <td className="py-3 px-4 text-center">{group.lh}</td>
                          <td className="py-3 px-4 text-center text-[#00843D]">{group.ha}</td>
                          <td className="py-3 px-4 text-center text-gray-900">{group.haHora}</td>
                        </tr>

                        {/* Collapsed/Expanded Children rows representing specific Equipment */}
                        {isTableExpanded[group.frente] && group.subRows.map((subRow) => (
                          <tr key={subRow.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-2.5 px-8 font-black text-black whitespace-pre">{subRow.frente}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.total}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.paradas}</td>
                            <td className="py-2.5 px-4 text-center text-green-950 font-black">{subRow.produtiva}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.auxiliar}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.semApto}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.vMedia}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">
                              <span className="mr-1">{subRow.ocioso}</span>
                              {renderStatusIcon(subRow.statusOcioso)}
                            </td>
                            <td className="py-2.5 px-4 text-center text-black font-black">
                              <span className="mr-1">{subRow.efic}</span>
                              {renderStatusIcon(subRow.statusEfic)}
                            </td>
                            <td className="py-2.5 px-4 text-center text-black font-black">
                              <span className="mr-1">{subRow.dispMec}</span>
                              {renderStatusIcon(subRow.statusDisp)}
                            </td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.lh}</td>
                            <td className="py-2.5 px-4 text-center text-green-950 font-black">{subRow.ha}</td>
                            <td className="py-2.5 px-4 text-center text-black font-black">{subRow.haHora}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUB-PAGE 4: RANKING DE OPERADORES */}
        {activeTab === 'operadores' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="bg-white rounded-[28px] border border-gray-150 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-700">Ranking Geral de Operadores e Colaboradores</span>
                <span className="bg-[#00843D]/10 text-[#00843D] text-[9px] font-black px-3 py-1 rounded-full uppercase">Filtro Inteligente COA</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px] font-bold">
                  <thead>
                    <tr className="bg-[#004d22] text-white font-black uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Operador</th>
                      <th className="py-3 px-4 text-center">H_Total</th>
                      <th className="py-3 px-4 text-center">Paradas</th>
                      <th className="py-3 px-4 text-center">Produtiva</th>
                      <th className="py-3 px-4 text-center">Auxiliar</th>
                      <th className="py-3 px-4 text-center">Sem Apto</th>
                      <th className="py-3 px-4 text-center">V_Média</th>
                      <th className="py-3 px-4 text-center">Ocioso (%)</th>
                      <th className="py-3 px-4 text-center">Efic (%)</th>
                      <th className="py-3 px-4 text-center">Disp.Mec (%)</th>
                      <th className="py-3 px-4 text-center">L/H</th>
                      <th className="py-3 px-4 text-center">Ha</th>
                      <th className="py-3 px-4 text-center">Ha/Hora</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 font-bold">
                    {filteredOperadoresData.map((op) => (
                      <tr key={op.id} className="border-b border-gray-150 hover:bg-gray-50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-black uppercase whitespace-nowrap">{op.nome}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.total}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.paradas}</td>
                        <td className="py-3.5 px-4 text-center text-green-950 font-black">{op.produtiva}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.auxiliar}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.semApto}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.vMedia}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">
                          <span className="mr-1">{op.ocioso}</span>
                          {renderStatusIcon(op.statusOcioso)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-black font-black">
                          <span className="mr-1">{op.efic}</span>
                          {renderStatusIcon(op.statusEfic)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-black font-black">
                          <span className="mr-1">{op.dispMec}</span>
                          {renderStatusIcon(op.statusDisp)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.lh}</td>
                        <td className="py-3.5 px-4 text-center text-green-950 font-black">{op.ha}</td>
                        <td className="py-3.5 px-4 text-center text-black font-black">{op.haHora}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ZOOMED CHART MODAL OVERLAY */}
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
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between border border-gray-100 dark:border-slate-800 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Carousel navigation controls */}
              <button 
                onClick={handlePrevChart}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextChart}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2.5 md:p-4 bg-white/95 dark:bg-slate-850/90 hover:bg-white text-gray-800 dark:text-white rounded-full shadow-lg transition-all hover:scale-110 z-10 border border-gray-150 dark:border-slate-800"
              >
                <ChevronRight size={24} />
              </button>

              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-850/30">
                <div className="text-left pr-8">
                  <span className="text-[10px] font-black text-[#00843D] bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Painel Diário COA Expandido</span>
                  <p className="text-xs text-gray-400 mt-1 uppercase font-black">Use as setas laterais para navegar entre os gráficos operacionais</p>
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
                {zoomedChartId === 'meta_vs_realizado' && (
                  <div className="h-[320px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner flex flex-col justify-between">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">Meta vs Realizado (Hectares)</h3>
                    <div className="h-[80%] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredProducoesData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#F3F4F6'} />
                          <XAxis dataKey="segmento" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} tickLine={false} />
                          <YAxis stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                          <Bar name="Meta Hectares" dataKey="haMeta" fill={isDarkMode ? '#4b5563' : '#94A3B8'} radius={[4, 4, 0, 0]} />
                          <Bar name="Realizado Hectares" dataKey="haReal" fill="#00843D" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {zoomedChartId === 'ofensores' && (
                  <div className="h-[320px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner flex flex-col justify-between">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">Top 10 Ofensores da Eficiência Operacional</h3>
                    <div className="h-[80%] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredOfensoresData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#F3F4F6'} />
                          <XAxis dataKey="name" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} angle={-15} textAnchor="end" height={40} interval={0} tickLine={false} />
                          <YAxis stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#991B1B" radius={[4, 4, 0, 0]}>
                            {filteredOfensoresData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#991B1B' : '#C2410C'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {zoomedChartId === 'hectares_hahora' && (
                  <div className="h-[320px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner flex flex-col justify-between">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">Hectares e Ha/Hora - Visão Operacional</h3>
                    <div className="h-[80%] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={filteredComboChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#F3F4F6'} />
                          <XAxis dataKey="name" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
                          <YAxis yAxisId="left" stroke="#00843D" tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Hectares', angle: -90, position: 'insideLeft', style: { fontSize: 11, fontWeight: 'bold', fill: '#00843D' } }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: 'black', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Ha/Hora', angle: 90, position: 'insideRight', style: { fontSize: 11, fontWeight: 'bold', fill: '#3B82F6' } }} />
                          <Tooltip />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} />
                          <Bar yAxisId="left" name="Hectares" dataKey="Hectares" fill="#00843D" opacity={0.8} radius={[4, 4, 0, 0]} />
                          <Line yAxisId="right" name="Ha/Hora" type="monotone" dataKey="HaHora" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
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
}
