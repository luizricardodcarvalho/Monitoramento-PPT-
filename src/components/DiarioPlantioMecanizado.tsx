import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search,
  Sliders,
  Filter,
  Info,
  ChevronRight,
  User,
  Cpu,
  Tractor,
  Maximize2,
  ChevronLeft,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ComposedChart, 
  Line 
} from 'recharts';
import * as XLSX from 'xlsx';

// Status Icon Renderer
const renderStatusIcon = (status: 'ok' | 'warning' | 'error') => {
  switch (status) {
    case 'ok':
      return <CheckCircle2 size={15} className="text-green-600 inline-block align-middle" />;
    case 'warning':
      return <AlertTriangle size={15} className="text-yellow-500 inline-block align-middle" />;
    case 'error':
      return <XCircle size={15} className="text-red-600 inline-block align-middle" />;
    default:
      return null;
  }
};

export default function DiarioPlantioMecanizado({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [selectedUsina, setSelectedUsina] = useState<'ARIRANHA' | 'PALESTINA' | 'SANTA ALBERTINA'>('ARIRANHA');
  const [selectedFrente, setSelectedFrente] = useState<string>('Tudo');
  const [dataInicio, setDataInicio] = useState<string>('2026-01-01');
  const [dataFim, setDataFim] = useState<string>('2026-07-16');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('16-07-2026 19:09:25');
  const [isTableExpanded, setIsTableExpanded] = useState<Record<string, boolean>>({
    '0.72-4 PLANTIO MECANIZADO': true,
    '0.72-3 PLANTIO MECANIZADO': false,
  });

  const [zoomedChartId, setZoomedChartId] = useState<string | null>(null);
  const zoomableCharts = ['plantio_mecanizado', 'ofensores', 'hectares_hahora'];
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

  // Load last update time and data if present
  useEffect(() => {
    const savedTime = localStorage.getItem('diario_plantio_last_update');
    if (savedTime) {
      setLastUpdateTime(savedTime);
    }
    
    const loadExcelData = () => {
      const savedExcel = localStorage.getItem('diario_plantio_excel_data');
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
      const updatedTime = localStorage.getItem('diario_plantio_last_update');
      if (updatedTime) {
        setLastUpdateTime(updatedTime);
      }
      loadExcelData();
    };
    window.addEventListener('diario_plantio_updated', handleSync);
    return () => {
      window.removeEventListener('diario_plantio_updated', handleSync);
    };
  }, []);

  // Base Data that scales or changes dynamically based on selected Usina or Date filter
  // We use factors to make the dashboard highly responsive and dynamic
  const factors = useMemo(() => {
    let uFact = 1.0;
    if (selectedUsina === 'PALESTINA') uFact = 0.85;
    if (selectedUsina === 'SANTA ALBERTINA') uFact = 1.15;

    // Date range factor
    const d1 = new Date(dataInicio).getTime();
    const d2 = new Date(dataFim).getTime();
    const diffDays = Math.max(1, (d2 - d1) / (1000 * 60 * 60 * 24));
    const dateFact = Math.min(1.5, Math.max(0.2, diffDays / 197)); // base is 197 days

    return {
      uFact,
      dateFact,
      combined: uFact * dateFact
    };
  }, [selectedUsina, dataInicio, dataFim]);

  const toggleGroupExpand = (frente: string) => {
    setIsTableExpanded(prev => ({
      ...prev,
      [frente]: !prev[frente]
    }));
  };

  // 1. Plantio Mecanizado Donut Data
  const donutData = useMemo(() => {
    if (importedData?.plantioTableData && importedData.plantioTableData.length > 0) {
      const sumProd = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.hProdutiva || 0), 0);
      const sumParadas = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.hParadas || 0), 0);
      const total = sumProd + sumParadas;
      const prodPercent = total > 0 ? ((sumProd / total) * 100).toFixed(1) : '0';
      const paradaPercent = total > 0 ? ((sumParadas / total) * 100).toFixed(1) : '0';
      return [
        { name: `Produtiva ${sumProd.toLocaleString('pt-BR')} (${prodPercent}%)`, value: sumProd, color: '#0C2340' },
        { name: `H_Paradas ${sumParadas.toLocaleString('pt-BR')} (${paradaPercent}%)`, value: sumParadas, color: '#3B82F6' }
      ];
    }

    const prodVal = parseFloat((36.6 * factors.combined).toFixed(1));
    const paradaVal = parseFloat((179.4 * factors.combined).toFixed(1));
    const total = prodVal + paradaVal;
    const prodPercent = ((prodVal / total) * 100).toFixed(1);
    const paradaPercent = ((paradaVal / total) * 100).toFixed(1);

    return [
      { name: `Produtiva ${prodVal.toLocaleString('pt-BR')} (${prodPercent}%)`, value: prodVal, color: '#0C2340' },
      { name: `H_Paradas ${paradaVal.toLocaleString('pt-BR')} (${paradaPercent}%)`, value: paradaVal, color: '#3B82F6' }
    ];
  }, [factors, importedData]);

  // 2. Indicadores Gerais
  const indicadoresGerais = useMemo(() => {
    if (importedData?.plantioTableData && importedData.plantioTableData.length > 0) {
      const validRows = importedData.plantioTableData.filter((r: any) => r.frente !== 'Total');
      const avgDisp = validRows.reduce((acc: number, item: any) => acc + (item.dispMecConj || 0), 0) / (validRows.length || 1);
      const avgEfic = validRows.reduce((acc: number, item: any) => acc + (item.eficiencia || 0), 0) / (validRows.length || 1);
      const avgOcioso = validRows.reduce((acc: number, item: any) => acc + (item.mOcioso || 0), 0) / (validRows.length || 1);
      return {
        disp: parseFloat(avgDisp.toFixed(1)),
        efic: parseFloat(avgEfic.toFixed(1)),
        ocioso: parseFloat(avgOcioso.toFixed(1))
      };
    }

    const dispBase = 84.4;
    const eficBase = 29.1;
    const ociosoBase = 24.0;

    // Apply slight changes per Usina for dynamism
    let disp = dispBase;
    let efic = eficBase;
    let ocioso = ociosoBase;

    if (selectedUsina === 'PALESTINA') {
      disp = 82.1;
      efic = 27.5;
      ocioso = 26.2;
    } else if (selectedUsina === 'SANTA ALBERTINA') {
      disp = 86.8;
      efic = 31.2;
      ocioso = 21.5;
    }

    return {
      disp: parseFloat(disp.toFixed(1)),
      efic: parseFloat(efic.toFixed(1)),
      ocioso: parseFloat(ocioso.toFixed(1))
    };
  }, [selectedUsina, importedData]);

  // 3. Top 10 Ofensores Data
  const ofensoresData = useMemo(() => {
    if (importedData?.ofensoresData && importedData.ofensoresData.length > 0) {
      return importedData.ofensoresData.slice(0, 10);
    }

    const base = [
      { name: 'Auto Deslocamento', rawValue: 7.4 },
      { name: 'Falta Muda Plantio Mec', rawValue: 6.4 },
      { name: 'Carregamento de Insumo', rawValue: 3.2 },
      { name: 'Aguardando Carregamento', rawValue: 2.4 },
      { name: 'Sem Apontamento', rawValue: 1.5 },
      { name: 'Calib/Regulag Implemento', rawValue: 1.2 },
      { name: 'Abastecimento de Muda', rawValue: 1.0 },
      { name: 'Recarga de Bateria', rawValue: 0.9 },
      { name: 'Veículo Encalhado', rawValue: 0.8 },
      { name: 'Guarda de Maquinas', rawValue: 0.7 }
    ];

    return base.map(item => ({
      name: item.name,
      value: parseFloat((item.rawValue * factors.uFact).toFixed(1))
    }));
  }, [factors, importedData]);

  // 4. Hectares e Ha/Hora Chart Data
  const comboChartData = useMemo(() => {
    if (importedData?.plantioTableData && importedData.plantioTableData.length > 0) {
      const validRows = importedData.plantioTableData.filter((r: any) => r.frente !== 'Total');
      return validRows
        .map((item: any) => ({
          name: item.frente,
          Hectares: parseFloat((item.hectares || 0).toFixed(2)),
          HaHora: parseFloat((item.haHora || 0).toFixed(2))
        }))
        .filter((item: any) => selectedFrente === 'Tudo' || item.name.includes(selectedFrente));
    }

    const base = [
      { name: '0.72-1 PLANTIO MECANIZADO', Hectares: 0.83, HaHora: 0.04 },
      { name: '0.72-2 PLANTIO MECANIZADO', Hectares: 0.34, HaHora: 0.03 },
      { name: '0.72-3 PLANTIO MECANIZADO', Hectares: 0.31, HaHora: 0.07 },
      { name: '0.72-4 PLANTIO MECANIZADO', Hectares: 0.20, HaHora: 0.11 },
      { name: '0.72-2 PLANTIO MECANIZADO PROPRIO', Hectares: 0.03, HaHora: 0.03 }
    ];

    return base.map(item => ({
      name: item.name,
      Hectares: parseFloat((item.Hectares * factors.combined).toFixed(2)),
      HaHora: parseFloat((item.HaHora * factors.uFact).toFixed(2))
    })).filter(item => selectedFrente === 'Tudo' || item.name.includes(selectedFrente));
  }, [factors, selectedFrente]);

  // 5. Table 1: Plantio Mecanizado (Hierarchical / Expandable)
  const plantioTableData = useMemo(() => {
    const f1 = factors.combined;
    const f2 = factors.uFact;

    return [
      {
        id: '1',
        frente: '0.72-4 PLANTIO MECANIZADO',
        horasTotais: parseFloat((4531.4 * f1).toFixed(1)),
        hProdutiva: parseFloat((1.8 * f1).toFixed(1)),
        hParadas: parseFloat((10.6 * f1).toFixed(1)),
        semApto: parseFloat((0.1 * f1).toFixed(1)),
        vMedia: parseFloat((6.2 * f2).toFixed(1)),
        mOcioso: 33.9,
        statusOcioso: 'error' as const,
        eficiencia: 32.2,
        statusEfic: 'error' as const,
        dispMecConj: 90.4,
        statusDisp: 'ok' as const,
        dispMecTrator: 99.9,
        statusTrator: 'ok' as const,
        dispMecImp: 99.5,
        statusImp: 'ok' as const,
        hectares: parseFloat((0.2 * f1).toFixed(1)),
        haHora: parseFloat((0.1 * f2).toFixed(1)),
        subRows: [
          {
            id: '1-1',
            frente: '  122004-CAMINHAO TRANSBORDO',
            horasTotais: 0.0,
            hProdutiva: 0.0,
            hParadas: 0.0,
            semApto: 0.0,
            vMedia: 0.0,
            mOcioso: 0.0,
            statusOcioso: 'error' as const,
            eficiencia: 0.0,
            statusEfic: 'error' as const,
            dispMecConj: 100.0,
            statusDisp: 'ok' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 100.0,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 0.0,
          },
          {
            id: '1-2',
            frente: '  501142-TRATORES PESADOS',
            horasTotais: parseFloat((5.0 * f1).toFixed(1)),
            hProdutiva: 0.0,
            hParadas: 0.0,
            semApto: 0.0,
            vMedia: 0.0,
            mOcioso: 27.2,
            statusOcioso: 'error' as const,
            eficiencia: 0.0,
            statusEfic: 'error' as const,
            dispMecConj: 57.8,
            statusDisp: 'error' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 100.0,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 1.4,
          },
          {
            id: '1-3',
            frente: '  501150-TRATORES PESADOS',
            horasTotais: parseFloat((9.8 * f1).toFixed(1)),
            hProdutiva: 0.0,
            hParadas: 0.0,
            semApto: 0.0,
            vMedia: 5.1,
            mOcioso: 31.1,
            statusOcioso: 'error' as const,
            eficiencia: 24.4,
            statusEfic: 'error' as const,
            dispMecConj: 100.0,
            statusDisp: 'ok' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 100.0,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 1.4,
          },
          {
            id: '1-4',
            frente: '  501151-TRATORES PESADOS',
            horasTotais: parseFloat((32.7 * f1).toFixed(1)),
            hProdutiva: 0.0,
            hParadas: 0.1,
            semApto: 0.0,
            vMedia: 5.0,
            mOcioso: 32.2,
            statusOcioso: 'error' as const,
            eficiencia: 24.0,
            statusEfic: 'error' as const,
            dispMecConj: 87.0,
            statusDisp: 'ok' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 99.9,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 1.0,
          },
          {
            id: '1-5',
            frente: '  501149-TRATORES PESADOS',
            horasTotais: parseFloat((34.8 * f1).toFixed(1)),
            hProdutiva: 0.0,
            hParadas: 0.1,
            semApto: 0.0,
            vMedia: 5.0,
            mOcioso: 23.9,
            statusOcioso: 'error' as const,
            eficiencia: 35.3,
            statusEfic: 'error' as const,
            dispMecConj: 99.8,
            statusDisp: 'ok' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 100.0,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 1.5,
          },
          {
            id: '1-6',
            frente: '  501147-TRATORES PESADOS',
            horasTotais: parseFloat((159.8 * f1).toFixed(1)),
            hProdutiva: 0.2,
            hParadas: 0.3,
            semApto: 0.0,
            vMedia: 7.0,
            mOcioso: 20.6,
            statusOcioso: 'error' as const,
            eficiencia: 50.2,
            statusEfic: 'warning' as const,
            dispMecConj: 86.2,
            statusDisp: 'ok' as const,
            dispMecTrator: 99.9,
            statusTrator: 'ok' as const,
            dispMecImp: 99.7,
            statusImp: 'ok' as const,
            hectares: 0.1,
            haHora: 0.3,
          },
          {
            id: '1-7',
            frente: '  501141-TRATORES PESADOS',
            horasTotais: parseFloat((656.8 * f1).toFixed(1)),
            hProdutiva: 0.2,
            hParadas: 1.6,
            semApto: 0.0,
            vMedia: 4.7,
            mOcioso: 30.1,
            statusOcioso: 'error' as const,
            eficiencia: 27.8,
            statusEfic: 'error' as const,
            dispMecConj: 93.8,
            statusDisp: 'ok' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 99.5,
            statusImp: 'ok' as const,
            hectares: 0.3,
            haHora: 1.4,
          }
        ]
      },
      {
        id: '2',
        frente: '0.72-3 PLANTIO MECANIZADO',
        horasTotais: parseFloat((9433.2 * f1).toFixed(1)),
        hProdutiva: parseFloat((4.3 * f1).toFixed(1)),
        hParadas: parseFloat((21.6 * f1).toFixed(1)),
        semApto: parseFloat((0.3 * f1).toFixed(1)),
        vMedia: parseFloat((5.9 * f2).toFixed(1)),
        mOcioso: 28.1,
        statusOcioso: 'error' as const,
        eficiencia: 36.1,
        statusEfic: 'error' as const,
        dispMecConj: 83.4,
        statusDisp: 'error' as const,
        dispMecTrator: 99.6,
        statusTrator: 'ok' as const,
        dispMecImp: 99.4,
        statusImp: 'ok' as const,
        hectares: parseFloat((0.3 * f1).toFixed(1)),
        haHora: parseFloat((0.1 * f2).toFixed(1)),
        subRows: [
          {
            id: '2-1',
            frente: '  501151-TRATORES PESADOS',
            horasTotais: parseFloat((55.5 * f1).toFixed(1)),
            hProdutiva: 0.0,
            hParadas: 0.1,
            semApto: 0.0,
            vMedia: 5.9,
            mOcioso: 30.0,
            statusOcioso: 'error' as const,
            eficiencia: 27.0,
            statusEfic: 'error' as const,
            dispMecConj: 96.1,
            statusDisp: 'ok' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 100.0,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 1.2,
          },
          {
            id: '2-2',
            frente: '  505874-TRATORES PESADOS',
            horasTotais: parseFloat((157.9 * f1).toFixed(1)),
            hProdutiva: 0.1,
            hParadas: 0.3,
            semApto: 0.0,
            vMedia: 5.9,
            mOcioso: 29.7,
            statusOcioso: 'error' as const,
            eficiencia: 52.2,
            statusEfic: 'warning' as const,
            dispMecConj: 62.5,
            statusDisp: 'error' as const,
            dispMecTrator: 100.0,
            statusTrator: 'ok' as const,
            dispMecImp: 99.8,
            statusImp: 'ok' as const,
            hectares: 0.0,
            haHora: 0.2,
          }
        ]
      }
    ];
  }, [factors, selectedFrente, importedData]);

  // Collapsed plantio rows sum up for the total row
  const plantioTableTotal = useMemo(() => {
    if (importedData?.plantioTableData && importedData.plantioTableData.length > 0) {
      const sumTotal = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.horasTotais || 0), 0);
      const sumProd = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.hProdutiva || 0), 0);
      const sumParadas = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.hParadas || 0), 0);
      const sumSemApto = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.semApto || 0), 0);
      const sumHectares = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.hectares || 0), 0);
      
      const avgVMedia = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.vMedia || 0), 0) / (importedData.plantioTableData.length || 1);
      const avgOcioso = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.mOcioso || 0), 0) / (importedData.plantioTableData.length || 1);
      const avgEfic = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.eficiencia || 0), 0) / (importedData.plantioTableData.length || 1);
      const avgDispConj = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.dispMecConj || 0), 0) / (importedData.plantioTableData.length || 1);
      const avgDispTrator = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.dispMecTrator || 0), 0) / (importedData.plantioTableData.length || 1);
      const avgDispImp = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.dispMecImp || 0), 0) / (importedData.plantioTableData.length || 1);
      const avgHaHora = importedData.plantioTableData.reduce((acc: number, item: any) => acc + (item.haHora || 0), 0) / (importedData.plantioTableData.length || 1);

      return {
        frente: 'Total',
        horasTotais: parseFloat(sumTotal.toFixed(1)),
        hProdutiva: parseFloat(sumProd.toFixed(1)),
        hParadas: parseFloat(sumParadas.toFixed(1)),
        semApto: parseFloat(sumSemApto.toFixed(1)),
        vMedia: parseFloat(avgVMedia.toFixed(1)),
        mOcioso: parseFloat(avgOcioso.toFixed(1)),
        statusOcioso: avgOcioso <= 15 ? 'ok' as const : avgOcioso <= 25 ? 'warning' as const : 'error' as const,
        eficiencia: parseFloat(avgEfic.toFixed(1)),
        statusEfic: avgEfic >= 35 ? 'ok' as const : avgEfic >= 25 ? 'warning' as const : 'error' as const,
        dispMecConj: parseFloat(avgDispConj.toFixed(1)),
        statusDisp: avgDispConj >= 85 ? 'ok' as const : avgDispConj >= 80 ? 'warning' as const : 'error' as const,
        dispMecTrator: parseFloat(avgDispTrator.toFixed(1)),
        statusTrator: 'ok' as const,
        dispMecImp: parseFloat(avgDispImp.toFixed(1)),
        statusImp: 'ok' as const,
        hectares: parseFloat(sumHectares.toFixed(1)),
        haHora: parseFloat(avgHaHora.toFixed(1)),
      };
    }

    const f1 = factors.combined;
    const f2 = factors.uFact;

    return {
      frente: 'Total',
      horasTotais: parseFloat((77747.3 * f1).toFixed(1)),
      hProdutiva: parseFloat((36.2 * f1).toFixed(1)),
      hParadas: parseFloat((176.8 * f1).toFixed(1)),
      semApto: parseFloat((4.0 * f1).toFixed(1)),
      vMedia: parseFloat((5.9 * f2).toFixed(1)),
      mOcioso: 24.0,
      statusOcioso: 'error' as const,
      eficiencia: 29.1,
      statusEfic: 'error' as const,
      dispMecConj: 84.4,
      statusDisp: 'error' as const,
      dispMecTrator: 99.6,
      statusTrator: 'ok' as const,
      dispMecImp: 98.2,
      statusImp: 'ok' as const,
      hectares: parseFloat((0.9 * f1).toFixed(1)),
      haHora: parseFloat((0.0 * f2).toFixed(1)),
    };
  }, [factors, importedData]);

  // 6. Table 2: Ranking Operadores Data
  const rankingOperadoresData = useMemo(() => {
    if (importedData?.rankingOperadoresData && importedData.rankingOperadoresData.length > 0) {
      return importedData.rankingOperadoresData;
    }

    const f1 = factors.combined;
    const f2 = factors.uFact;

    return [
      { name: '41152 - DEIVID FERREIRA RODRIGUES', horasTotais: 1580.5, hProdutiva: 0.8, hParadas: 3.5, eficiencia: 26.2, statusEfic: 'error' as const, dispMec: 92.8, statusDisp: 'ok' as const, mOcioso: 12.5, statusOcioso: 'error' as const, volMedia: 6.1, semApto: 0.0, hectares: 0.3, haHora: 0.4 },
      { name: '34078 - GENIOMAR QUERINO DE ALMEIDA', horasTotais: 1063.4, hProdutiva: 0.7, hParadas: 2.2, eficiencia: 32.8, statusEfic: 'error' as const, dispMec: 82.1, statusDisp: 'error' as const, mOcioso: 8.5, statusOcioso: 'ok' as const, volMedia: 4.8, semApto: 0.0, hectares: 0.1, haHora: 0.2 },
      { name: '39795 - CESAR ADRIANO DAMACENO DE SOUZA', horasTotais: 857.1, hProdutiva: 0.6, hParadas: 1.7, eficiencia: 33.6, statusEfic: 'error' as const, dispMec: 88.7, statusDisp: 'ok' as const, mOcioso: 15.6, statusOcioso: 'error' as const, volMedia: 4.9, semApto: 0.0, hectares: 0.2, haHora: 0.3 },
      { name: '28060 - CLAUDEMIR ROBERTO SILVERIO', horasTotais: 1482.1, hProdutiva: 0.6, hParadas: 3.4, eficiencia: 28.2, statusEfic: 'error' as const, dispMec: 88.6, statusDisp: 'ok' as const, mOcioso: 18.4, statusOcioso: 'error' as const, volMedia: 5.2, semApto: 0.0, hectares: 0.1, haHora: 0.2 },
      { name: '50872 - DIEGO LUIZ QUIRINO', horasTotais: 1414.2, hProdutiva: 0.6, hParadas: 3.2, eficiencia: 26.8, statusEfic: 'error' as const, dispMec: 73.3, statusDisp: 'error' as const, mOcioso: 21.4, statusOcioso: 'error' as const, volMedia: 5.7, semApto: 0.1, hectares: 0.1, haHora: 0.2 },
      { name: '32135 - THIAGO FERREIRA CORCINO', horasTotais: 1030.5, hProdutiva: 0.6, hParadas: 2.2, eficiencia: 31.9, statusEfic: 'error' as const, dispMec: 88.5, statusDisp: 'ok' as const, mOcioso: 13.9, statusOcioso: 'error' as const, volMedia: 6.8, semApto: 0.0, hectares: 0.3, haHora: 0.5 },
      { name: '40013 - FERNANDO PRADO DA CUNHA', horasTotais: 792.6, hProdutiva: 0.6, hParadas: 1.6, eficiencia: 33.9, statusEfic: 'error' as const, dispMec: 91.7, statusDisp: 'ok' as const, mOcioso: 20.4, statusOcioso: 'error' as const, volMedia: 5.9, semApto: 0.0, hectares: 0.1, haHora: 0.2 },
      { name: '42241 - JOAO CARLOS MAZUQUI', horasTotais: 1078.3, hProdutiva: 0.6, hParadas: 2.4, eficiencia: 30.7, statusEfic: 'error' as const, dispMec: 81.8, statusDisp: 'error' as const, mOcioso: 12.7, statusOcioso: 'error' as const, volMedia: 5.1, semApto: 0.1, hectares: 0.1, haHora: 0.2 },
      { name: '56942 - DEIVID JOSE DOS SANTOS', horasTotais: 820.2, hProdutiva: 0.6, hParadas: 1.7, eficiencia: 38.1, statusEfic: 'error' as const, dispMec: 84.5, statusDisp: 'error' as const, mOcioso: 17.6, statusOcioso: 'error' as const, volMedia: 6.0, semApto: 0.1, hectares: 0.1, haHora: 0.2 },
      { name: '62606 - RAINEL TEIXEIRA MARQUES', horasTotais: 997.5, hProdutiva: 0.5, hParadas: 2.2, eficiencia: 26.0, statusEfic: 'error' as const, dispMec: 86.5, statusDisp: 'ok' as const, mOcioso: 29.8, statusOcioso: 'error' as const, volMedia: 5.4, semApto: 0.0, hectares: 0.1, haHora: 0.2 },
      { name: '55967 - RAFAEL SANTOS LOPES', horasTotais: 931.5, hProdutiva: 0.5, hParadas: 2.0, eficiencia: 30.0, statusEfic: 'error' as const, dispMec: 87.1, statusDisp: 'ok' as const, mOcioso: 19.8, statusOcioso: 'error' as const, volMedia: 5.4, semApto: 0.1, hectares: 0.2, haHora: 0.3 },
      { name: '39672 - JOSE MARIA FOGACA DA SILVA', horasTotais: 1084.9, hProdutiva: 0.5, hParadas: 2.5, eficiencia: 29.4, statusEfic: 'error' as const, dispMec: 94.0, statusDisp: 'ok' as const, mOcioso: 10.5, statusOcioso: 'warning' as const, volMedia: 8.0, semApto: 0.0, hectares: 0.1, haHora: 0.2 }
    ].map(op => ({
      ...op,
      horasTotais: parseFloat((op.horasTotais * f1).toFixed(1)),
      hProdutiva: parseFloat((op.hProdutiva * f1).toFixed(1)),
      hParadas: parseFloat((op.hParadas * f1).toFixed(1)),
      volMedia: parseFloat((op.volMedia * f2).toFixed(1)),
      hectares: parseFloat((op.hectares * f1).toFixed(1)),
      haHora: parseFloat((op.haHora * f2).toFixed(1)),
    }));
  }, [factors, importedData]);

  // Summary row of Ranking Table
  const rankingOperadoresTotal = useMemo(() => {
    if (importedData?.rankingOperadoresData && importedData.rankingOperadoresData.length > 0) {
      const sumTotal = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.horasTotais || 0), 0);
      const sumProd = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.hProdutiva || 0), 0);
      const sumParadas = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.hParadas || 0), 0);
      const sumSemApto = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.semApto || 0), 0);
      const sumHectares = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.hectares || 0), 0);
      
      const avgVMedia = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.volMedia || 0), 0) / (importedData.rankingOperadoresData.length || 1);
      const avgOcioso = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.mOcioso || 0), 0) / (importedData.rankingOperadoresData.length || 1);
      const avgEfic = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.eficiencia || 0), 0) / (importedData.rankingOperadoresData.length || 1);
      const avgDispMec = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.dispMec || 0), 0) / (importedData.rankingOperadoresData.length || 1);
      const avgHaHora = importedData.rankingOperadoresData.reduce((acc: number, item: any) => acc + (item.haHora || 0), 0) / (importedData.rankingOperadoresData.length || 1);

      return {
        name: 'Total',
        horasTotais: parseFloat(sumTotal.toFixed(1)),
        hProdutiva: parseFloat(sumProd.toFixed(1)),
        hParadas: parseFloat(sumParadas.toFixed(1)),
        eficiencia: parseFloat(avgEfic.toFixed(1)),
        statusEfic: avgEfic >= 35 ? 'ok' as const : 'error' as const,
        dispMec: parseFloat(avgDispMec.toFixed(1)),
        statusDisp: avgDispMec >= 85 ? 'ok' as const : 'error' as const,
        mOcioso: parseFloat(avgOcioso.toFixed(1)),
        statusOcioso: avgOcioso <= 15 ? 'ok' as const : 'error' as const,
        volMedia: parseFloat(avgVMedia.toFixed(1)),
        semApto: parseFloat(sumSemApto.toFixed(1)),
        hectares: parseFloat(sumHectares.toFixed(1)),
        haHora: parseFloat(avgHaHora.toFixed(1)),
      };
    }

    return {
      name: 'Total',
      horasTotais: parseFloat((77747.3 * factors.combined).toFixed(1)),
      hProdutiva: parseFloat((36.2 * factors.combined).toFixed(1)),
      hParadas: parseFloat((176.8 * factors.combined).toFixed(1)),
      eficiencia: 29.1,
      statusEfic: 'error' as const,
      dispMec: 84.4,
      statusDisp: 'error' as const,
      mOcioso: 24.0,
      statusOcioso: 'error' as const,
      volMedia: parseFloat((5.9 * factors.uFact).toFixed(1)),
      semApto: parseFloat((4.0 * factors.combined).toFixed(1)),
      hectares: parseFloat((1.0 * factors.combined).toFixed(1)),
      haHora: parseFloat((0.0 * factors.uFact).toFixed(1)),
    };
  }, [factors, importedData]);

  // List of frentes for filter select dropdown
  const allFrenteOptions = useMemo(() => {
    if (importedData?.plantioTableData && importedData.plantioTableData.length > 0) {
      const list = importedData.plantioTableData
        .filter((r: any) => r.frente !== 'Total')
        .map((r: any) => r.frente);
      return ['Tudo', ...Array.from(new Set(list)) as string[]];
    }
    return ['Tudo', '0.72-1', '0.72-2', '0.72-3', '0.72-4'];
  }, [importedData]);

  // Excel Ingestion Handler with smart structure identifier
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const imported: any = {};
        
        wb.SheetNames.forEach((sheetName) => {
          const ws = wb.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<any>(ws);
          if (rawRows.length === 0) return;
          
          const sampleRow = rawRows[0];
          const keys = Object.keys(sampleRow).map(k => k.toLowerCase().trim());
          
          const hasKeyMatching = (keywords: string[]) => {
            return keys.some(k => keywords.some(kw => k.includes(kw)));
          };
          
          // 1. Detect "Plantio" or "Frentes"
          if (hasKeyMatching(['frente', 'equipamento', 'm_ocioso', 'horas']) || hasKeyMatching(['plantio', 'mecanizado', 'horas_totais'])) {
            const groups: Record<string, any[]> = {};
            let currentFrenteGroup = '0.72-4 PLANTIO MECANIZADO';
            
            rawRows.forEach((row: any) => {
              const find = (keywords: string[], def: any) => {
                const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                return k !== undefined ? row[k] : def;
              };
              
              const frenteRaw = String(find(['frente', 'frente_trabalho', 'frente trabalho', 'area', 'setor'], '')).trim();
              
              // If it has "PLANTIO" or is a group header, update the group name
              if (frenteRaw && (frenteRaw.includes('PLANTIO') || frenteRaw.includes('FRENTE') || frenteRaw.startsWith('0.'))) {
                currentFrenteGroup = frenteRaw;
              }
              
              if (!groups[currentFrenteGroup]) {
                groups[currentFrenteGroup] = [];
              }
              groups[currentFrenteGroup].push(row);
            });
            
            let gIdx = 0;
            imported.plantioTableData = Object.entries(groups).map(([frenteName, rows]) => {
              const subRows = rows
                .filter(row => {
                  const find = (keywords: string[]) => {
                    const k = Object.keys(row).find(key => keywords.some(kw => key.toLowerCase().trim().includes(kw)));
                    return k !== undefined ? String(row[k]).trim() : '';
                  };
                  const fVal = find(['frente', 'equipamento', 'ativo']);
                  // Filter out rows that are actually the group header
                  return fVal && fVal !== frenteName && !fVal.includes('PLANTIO') && !fVal.includes('FRENTE');
                })
                .map((row, rIdx) => {
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

                  const totalVal = parseNum(find(['horas_totais', 'total', 'horas', 'h_total'], 10));
                  const prodVal = parseNum(find(['h_produtiva', 'produtiva', 'produtiva_h', 'hprodutiva'], 3));
                  const paradasVal = parseNum(find(['h_paradas', 'parada', 'paradas', 'hparadas'], 2));
                  const semAptoVal = parseNum(find(['sem_apto', 'sem apto', 'semapto'], 0));
                  const vMediaVal = parseNum(find(['v_media', 'velocidade', 'vol_media', 'vol_media'], 6));
                  const ociosoVal = parseNum(find(['m_ocioso', 'ociosidade', 'ocioso'], 25));
                  const eficVal = parseNum(find(['eficiencia', 'efic', 'eficiencia_percent'], 35));
                  const dispConj = parseNum(find(['disp_mec_conj', 'disp_conj', 'disp_mecanica', 'disponibilidade'], 90));
                  const dispTrator = parseNum(find(['disp_mec_trator', 'disp_trator'], 99));
                  const dispImp = parseNum(find(['disp_mec_imp', 'disp_implemento', 'disp_imp'], 99));
                  const hectaresVal = parseNum(find(['hectares', 'ha', 'hectare'], 0.2));
                  const haHoraVal = parseNum(find(['ha_hora', 'ha_por_hora', 'rendimento'], 0.1));

                  return {
                    id: `${gIdx}-${rIdx}`,
                    frente: String(find(['equipamento', 'ativo', 'frente', 'nome'], 'EQUIPAMENTO')).trim(),
                    horasTotais: totalVal,
                    hProdutiva: prodVal,
                    hParadas: paradasVal,
                    semApto: semAptoVal,
                    vMedia: vMediaVal,
                    mOcioso: ociosoVal,
                    statusOcioso: ociosoVal <= 15 ? 'ok' as const : ociosoVal <= 25 ? 'warning' as const : 'error' as const,
                    eficiencia: eficVal,
                    statusEfic: eficVal >= 35 ? 'ok' as const : eficVal >= 25 ? 'warning' as const : 'error' as const,
                    dispMecConj: dispConj,
                    statusDisp: dispConj >= 85 ? 'ok' as const : dispConj >= 80 ? 'warning' as const : 'error' as const,
                    dispMecTrator: dispTrator,
                    statusTrator: 'ok' as const,
                    dispMecImp: dispImp,
                    statusImp: 'ok' as const,
                    hectares: hectaresVal,
                    haHora: haHoraVal,
                  };
                });

              const sumTotal = subRows.reduce((acc, sr) => acc + sr.horasTotais, 0);
              const sumProdutiva = subRows.reduce((acc, sr) => acc + sr.hProdutiva, 0);
              const sumParadas = subRows.reduce((acc, sr) => acc + sr.hParadas, 0);
              const sumSemApto = subRows.reduce((acc, sr) => acc + sr.semApto, 0);
              const sumHectares = subRows.reduce((acc, sr) => acc + sr.hectares, 0);
              const avgVMedia = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.vMedia, 0) / subRows.length) : 5.0;
              const avgOcioso = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.mOcioso, 0) / subRows.length) : 25.0;
              const avgEfic = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.eficiencia, 0) / subRows.length) : 30.0;
              const avgDispConj = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.dispMecConj, 0) / subRows.length) : 85.0;
              const avgDispTrator = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.dispMecTrator, 0) / subRows.length) : 95.0;
              const avgDispImp = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.dispMecImp, 0) / subRows.length) : 95.0;
              const avgHaHora = subRows.length ? (subRows.reduce((acc, sr) => acc + sr.haHora, 0) / subRows.length) : 0.1;

              gIdx++;
              return {
                id: String(gIdx),
                frente: frenteName,
                horasTotais: parseFloat(sumTotal.toFixed(1)),
                hProdutiva: parseFloat(sumProdutiva.toFixed(1)),
                hParadas: parseFloat(sumParadas.toFixed(1)),
                semApto: parseFloat(sumSemApto.toFixed(1)),
                vMedia: parseFloat(avgVMedia.toFixed(1)),
                mOcioso: parseFloat(avgOcioso.toFixed(1)),
                statusOcioso: avgOcioso <= 15 ? 'ok' as const : avgOcioso <= 25 ? 'warning' as const : 'error' as const,
                eficiencia: parseFloat(avgEfic.toFixed(1)),
                statusEfic: avgEfic >= 35 ? 'ok' as const : avgEfic >= 25 ? 'warning' as const : 'error' as const,
                dispMecConj: parseFloat(avgDispConj.toFixed(1)),
                statusDisp: avgDispConj >= 85 ? 'ok' as const : avgDispConj >= 80 ? 'warning' as const : 'error' as const,
                dispMecTrator: parseFloat(avgDispTrator.toFixed(1)),
                statusTrator: 'ok' as const,
                dispMecImp: parseFloat(avgDispImp.toFixed(1)),
                statusImp: 'ok' as const,
                hectares: parseFloat(sumHectares.toFixed(1)),
                haHora: parseFloat(avgHaHora.toFixed(1)),
                subRows
              };
            });
          }
          
          // 2. Detect "Operadores"
          else if (hasKeyMatching(['operador', 'motorista', 'nome']) && hasKeyMatching(['horas_totais', 'h_produtiva', 'total', 'produtiva'])) {
            imported.rankingOperadoresData = rawRows.map((row: any) => {
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

              const ociosoVal = parseNum(find(['m_ocioso', 'ociosidade', 'ocioso'], 15));
              const eficVal = parseNum(find(['eficiencia', 'efic', 'eficiencia_percent'], 30));
              const dispConj = parseNum(find(['disp_mec', 'disp_mecanica', 'disponibilidade'], 90));

              return {
                name: String(find(['operador', 'motorista', 'nome'], 'OPERADOR')).toUpperCase(),
                horasTotais: parseNum(find(['horas_totais', 'total', 'horas'], 10)),
                hProdutiva: parseNum(find(['h_produtiva', 'produtiva'], 3)),
                hParadas: parseNum(find(['h_paradas', 'parada', 'paradas'], 2)),
                eficiencia: eficVal,
                statusEfic: eficVal >= 35 ? 'ok' as const : 'error' as const,
                dispMec: dispConj,
                statusDisp: dispConj >= 85 ? 'ok' as const : 'error' as const,
                mOcioso: ociosoVal,
                statusOcioso: ociosoVal <= 15 ? 'ok' as const : 'error' as const,
                volMedia: parseNum(find(['v_media', 'velocidade', 'vol_media'], 6)),
                semApto: parseNum(find(['sem_apto', 'sem apto'], 0)),
                hectares: parseNum(find(['hectares', 'ha'], 0.2)),
                haHora: parseNum(find(['ha_hora', 'ha/hora'], 0.1))
              };
            });
          }
          
          // 3. Detect "Ofensores"
          else if (hasKeyMatching(['ofensor', 'motivo', 'parada']) && hasKeyMatching(['valor', 'horas', 'tempo'])) {
            imported.ofensoresData = rawRows.map((row: any) => {
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
        
        localStorage.setItem('diario_plantio_excel_data', JSON.stringify(imported));
        setImportedData(imported);
        
        // Formata data atual do upload
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        
        localStorage.setItem('diario_plantio_last_update', formattedDate);
        setLastUpdateTime(formattedDate);
        
        // Dispara evento global para outros componentes escutarem a atualização
        window.dispatchEvent(new Event('diario_plantio_updated'));
        
        alert(`Sucesso! Planilha de Plantio carregada e atualizada. Horário de sincronização definido para ${formattedDate}`);
      } catch (err) {
        console.error(err);
        alert('Erro ao carregar a planilha do Excel. Certifique-se que o arquivo é válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12 text-left bg-gray-50/50" onClick={(e) => e.stopPropagation()}>
      
      {/* HEADER CARD */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col xl:flex-row items-center justify-between gap-6 mb-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full xl:w-auto">
          <div className="w-16 h-16 bg-[#00843D]/10 rounded-[22px] flex items-center justify-center text-[#00843D] shadow-inner shrink-0">
            <Tractor size={32} />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex flex-col sm:flex-row items-center gap-2">
              <span>Diário PLANTIO</span>
              <span className="text-gray-300 font-bold hidden sm:inline">|</span>
              <span className="text-[#00843D]">Mecanizado</span>
            </h2>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-1">
              Painel Corporativo Colombo - Operações Agrícolas e Plantio Sistemático
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
              accept=".xlsx, .xls" 
              onChange={handleExcelImport} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-4 sm:p-6 rounded-[24px] sm:rounded-[28px] border border-gray-150 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          
          {/* Usina Switch */}
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Unidade:</span>
            <div className="bg-gray-100 p-1 rounded-2xl border border-gray-200/50 flex gap-1">
              {(['ARIRANHA', 'PALESTINA', 'SANTA ALBERTINA'] as const).map((usina) => (
                <button
                  key={usina}
                  onClick={() => setSelectedUsina(usina)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-200 ${
                    selectedUsina === usina
                      ? 'bg-[#00843D] text-white shadow-sm'
                      : 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200/40'
                  }`}
                >
                  {usina === 'ARIRANHA' ? 'ARI' : usina === 'PALESTINA' ? 'PAL' : 'STA'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-200" />

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

        {/* Frente Selection Dropdown */}
        <div className="flex items-center justify-between sm:justify-start gap-3 w-full lg:w-auto">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest shrink-0">Frente:</span>
          <div className="relative w-full sm:w-52">
            <select
              value={selectedFrente}
              onChange={(e) => setSelectedFrente(e.target.value)}
              className="w-full bg-gray-50 border border-gray-250 text-gray-800 font-black text-xs rounded-xl px-4 py-2.5 pr-10 shadow-sm focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {allFrenteOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. ROW 1: PLANTIO MECANIZADO DONUT & INDICADORES GERAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Donut Chart - Plantio Mecanizado */}
        <div 
          onClick={() => setZoomedChartId('plantio_mecanizado')}
          className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm lg:col-span-7 flex flex-col justify-between relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-sm font-black text-[#0C2340] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Cpu size={16} className="text-[#0C2340] dark:text-[#5adc6a]" />
                <span>Plantio Mecanizado</span>
              </h3>
              <p className="text-[10px] text-black dark:text-gray-400 font-black uppercase tracking-widest mt-1">Divisão de Horas Operacionais (Produtiva vs Parada)</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setZoomedChartId('plantio_mecanizado'); }}
              className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm"
              title="Expandir Gráfico"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Recharts Pie container */}
            <div className="h-56 md:col-span-7 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '10px' }}
                    itemStyle={{ color: '#000000', fontWeight: '900', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Absolute center text for high polished look */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black uppercase text-black dark:text-gray-400 tracking-wider leading-none">Total Horas</span>
                <span className="text-2xl font-black text-[#0C2340] dark:text-white tracking-tighter mt-1 leading-none">
                  {(donutData[0].value + donutData[1].value).toFixed(1).replace('.', ',')}h
                </span>
              </div>
            </div>

            {/* Custom Pie Legend on Right */}
            <div className="md:col-span-5 flex flex-col gap-4 px-2">
              {donutData.map((entry, index) => (
                <div key={index} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150 shadow-sm">
                  <div className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: entry.color }} />
                  <div>
                    {/* Make all legend labels bold black as required */}
                    <span className="block text-[11px] font-black text-black dark:text-white leading-tight uppercase">
                      {index === 0 ? 'Produtiva' : 'H_Paradas'}
                    </span>
                    <span className="block text-sm font-black text-black dark:text-white mt-1 leading-none">
                      {entry.value.toFixed(1).replace('.', ',')}h
                    </span>
                    <span className="block text-[9px] font-black text-black dark:text-gray-400 mt-0.5 opacity-90">
                      {((entry.value / (donutData[0].value + donutData[1].value)) * 100).toFixed(1)}% de Participação
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Indicadores Geral Horizontal Bars */}
        <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#0C2340] dark:text-white uppercase tracking-wider mb-1">
              Indicadores Geral
            </h3>
            <p className="text-[10px] text-black dark:text-gray-400 font-black uppercase tracking-widest mb-6">Metas de Eficiência de Ativos e Disponibilidade</p>
          </div>

          <div className="space-y-6 flex-1 flex flex-col justify-center">
            {/* Indicator 1: Disp.Mecânica (%) */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black text-black uppercase tracking-wider">Disp.Mecânica (%)</span>
                <span className="text-sm font-black text-black">{indicadoresGerais.disp.toFixed(1).replace('.', ',')}%</span>
              </div>
              <div className="h-5 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                <div 
                  className="h-full bg-blue-600 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end px-3.5"
                  style={{ width: `${indicadoresGerais.disp}%` }}
                >
                  <span className="text-[10px] font-black text-white">{indicadoresGerais.disp}%</span>
                </div>
              </div>
            </div>

            {/* Indicator 2: Eficiência */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black text-black uppercase tracking-wider">Eficiência</span>
                <span className="text-sm font-black text-black">{indicadoresGerais.efic.toFixed(1).replace('.', ',')}%</span>
              </div>
              <div className="h-5 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                <div 
                  className="h-full bg-blue-600 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end px-3.5"
                  style={{ width: `${indicadoresGerais.efic}%` }}
                >
                  <span className="text-[10px] font-black text-white">{indicadoresGerais.efic}%</span>
                </div>
              </div>
            </div>

            {/* Indicator 3: Motor Ocioso */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-black text-black uppercase tracking-wider">Motor Ocioso</span>
                <span className="text-sm font-black text-black">{indicadoresGerais.ocioso.toFixed(1).replace('.', ',')}%</span>
              </div>
              <div className="h-5 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-inner">
                <div 
                  className="h-full bg-blue-600 rounded-lg transition-all duration-1000 ease-out flex items-center justify-end px-3.5"
                  style={{ width: `${indicadoresGerais.ocioso}%` }}
                >
                  <span className="text-[10px] font-black text-white">{indicadoresGerais.ocioso}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. ROW 2: TOP 10 OFENSORES DA EFICIÊNCIA OPERACIONAL */}
      <div 
        onClick={() => setZoomedChartId('ofensores')}
        className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm mb-6 relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-black text-[#0C2340] dark:text-white uppercase tracking-wider mb-1 text-center">
              Top 10 Ofensores da Eficiência Operacional
            </h3>
            <p className="text-[10px] text-black dark:text-gray-400 font-black uppercase tracking-widest text-center">Total acumulado de paradas por tipo de event operacionais (valores em K horas)</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setZoomedChartId('ofensores'); }}
            className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm shrink-0"
            title="Expandir Gráfico"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ofensoresData} margin={{ top: 25, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
              {/* Force x-axis labels to bold black as required */}
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#8b949e' : '#000000'} 
                tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 9 }} 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tickLine={false} 
                tickFormatter={(val) => val && val.length > 12 ? `${val.substring(0, 10)}...` : val}
              />
              <YAxis 
                stroke={isDarkMode ? '#8b949e' : '#000000'} 
                tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} 
                tickFormatter={(val) => `${val}K`}
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}
                labelStyle={{ fontWeight: '900', color: isDarkMode ? '#ffffff' : '#000000' }}
                itemStyle={{ fontWeight: '900', color: '#B91C1C' }}
              />
              <Bar 
                dataKey="value" 
                fill="#B91C1C" 
                radius={[6, 6, 0, 0]}
                label={{ 
                  position: 'top', 
                  fill: isDarkMode ? '#ffffff' : '#000000', 
                  fontWeight: '900', 
                  fontSize: 10,
                  formatter: (val: number) => `${val.toFixed(1).replace('.', ',')} K`
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. ROW 3: HECTARES E HA/HORA COMPOSED CHART */}
      <div 
        onClick={() => setZoomedChartId('hectares_hahora')}
        className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm mb-6 relative group cursor-pointer hover:shadow-xl hover:scale-[1.005] transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-black text-[#0C2340] dark:text-white uppercase tracking-wider mb-1 text-center">
              Hectares e Ha/Hora
            </h3>
            <p className="text-[10px] text-black dark:text-gray-400 font-black uppercase tracking-widest text-center">Distribuição e Rendimento operacional por grupo de frentes de plantio</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setZoomedChartId('hectares_hahora'); }}
            className="p-1.5 bg-gray-50 hover:bg-green-50 text-gray-400 hover:text-[#00843D] rounded-lg border border-gray-100 hover:border-green-100 transition-all shadow-sm shrink-0"
            title="Expandir Gráfico"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={comboChartData} margin={{ top: 25, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#8b949e' : '#000000'} 
                tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 9 }} 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tickLine={false} 
                tickFormatter={(val) => val && val.length > 12 ? `${val.substring(0, 10)}...` : val}
              />
              {/* Y-Axis Left for Hectares */}
              <YAxis 
                yAxisId="left" 
                stroke="#00843D" 
                tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} 
                tickLine={false} 
                axisLine={false} 
                label={{ value: 'Hectares', angle: -90, position: 'insideLeft', style: { fontSize: 11, fontWeight: '900', fill: '#00843D' } }} 
              />
              {/* Y-Axis Right for Ha/Hora */}
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#2563EB" 
                tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} 
                tickLine={false} 
                axisLine={false} 
                label={{ value: 'Ha/Hora', angle: 90, position: 'insideRight', style: { fontSize: 11, fontWeight: '900', fill: '#2563EB' } }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }}
                labelStyle={{ fontWeight: '900', color: isDarkMode ? '#ffffff' : '#000000' }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                wrapperStyle={{ fontSize: 11, fontWeight: '900', color: isDarkMode ? '#ffffff' : '#000000' }} 
              />
              <Bar 
                yAxisId="left" 
                name="Hectares" 
                dataKey="Hectares" 
                fill="#00843D" 
                radius={[4, 4, 0, 0]} 
                label={{ 
                  position: 'top', 
                  fill: isDarkMode ? '#ffffff' : '#000000', 
                  fontWeight: '900', 
                  fontSize: 10,
                  formatter: (val: number) => val.toFixed(2).replace('.', ',')
                }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                name="Ha/Hora" 
                dataKey="HaHora" 
                stroke="#2563EB" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                label={{ 
                  position: 'bottom', 
                  fill: isDarkMode ? '#ffffff' : '#000000', 
                  fontWeight: '900', 
                  fontSize: 10,
                  formatter: (val: number) => val.toFixed(2).replace('.', ',')
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. ROW 4: TABLE 1 - PLANTIO MECANIZADO EXPANDABLE */}
      <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-black text-[#0C2340] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={18} className="text-[#0C2340]" />
            <span>Frentes de Plantio Mecanizado</span>
          </h3>
          <div className="text-[10px] font-black uppercase text-black tracking-widest bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
            Unidade Logística: <span className="text-[#00843D]">{selectedUsina}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#0C2340] text-white text-[10px] font-black uppercase tracking-wider border-b border-gray-250">
                <th className="py-3 px-4 sticky left-0 bg-[#0C2340] z-10 w-[240px]">Frente</th>
                <th className="py-3 px-3 text-center">Horas Totais</th>
                <th className="py-3 px-3 text-center">H_Produtiva</th>
                <th className="py-3 px-3 text-center">H_Paradas</th>
                <th className="py-3 px-3 text-center">Sem Apto</th>
                <th className="py-3 px-3 text-center">V_Média</th>
                <th className="py-3 px-3 text-center">M_Ocioso (%)</th>
                <th className="py-3 px-3 text-center">Eficiência (%)</th>
                <th className="py-3 px-3 text-center">Disp.Mec Conj.</th>
                <th className="py-3 px-3 text-center">Disp.Mec - Trator</th>
                <th className="py-3 px-3 text-center">Disp.Mec - Imp</th>
                <th className="py-3 px-3 text-center">Hectares</th>
                <th className="py-3 px-3 text-center">Ha/Hora</th>
              </tr>
            </thead>
            <tbody className="text-xs text-black">
              {plantioTableData.map((group) => (
                <React.Fragment key={group.id}>
                  {/* Collapsible Header Group Row */}
                  <tr className="bg-gray-100/80 border-b border-gray-200 hover:bg-gray-200/50 transition-colors">
                    <td className="py-3 px-4 sticky left-0 bg-gray-100 z-10 font-black">
                      <button
                        onClick={() => toggleGroupExpand(group.frente)}
                        className="flex items-center gap-2 text-[#0C2340] font-black uppercase text-left w-full focus:outline-none"
                      >
                        {isTableExpanded[group.frente] ? <ChevronUp size={15} className="text-[#0C2340]" /> : <ChevronDown size={15} className="text-[#0C2340]" />}
                        <span>{group.frente}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-center font-black">{group.horasTotais.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-3 text-center font-black">{group.hProdutiva.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-3 text-center font-black">{group.hParadas.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-3 text-center font-black">{group.semApto.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-3 text-center font-black">{group.vMedia.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-3 text-center font-black">
                      <span className="mr-1.5">{group.mOcioso.toFixed(1).replace('.', ',')}%</span>
                      {renderStatusIcon(group.statusOcioso)}
                    </td>
                    <td className="py-3 px-3 text-center font-black">
                      <span className="mr-1.5">{group.eficiencia.toFixed(1).replace('.', ',')}%</span>
                      {renderStatusIcon(group.statusEfic)}
                    </td>
                    <td className="py-3 px-3 text-center font-black">
                      <span className="mr-1.5">{group.dispMecConj.toFixed(1).replace('.', ',')}%</span>
                      {renderStatusIcon(group.statusDisp)}
                    </td>
                    <td className="py-3 px-3 text-center font-black">
                      <span className="mr-1.5">{group.dispMecTrator.toFixed(1).replace('.', ',')}%</span>
                      {renderStatusIcon(group.statusTrator)}
                    </td>
                    <td className="py-3 px-3 text-center font-black">
                      <span className="mr-1.5">{group.dispMecImp.toFixed(1).replace('.', ',')}%</span>
                      {renderStatusIcon(group.statusImp)}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-emerald-800">{group.hectares.toLocaleString('pt-BR')}</td>
                    <td className="py-3 px-3 text-center font-black text-blue-800">{group.haHora.toLocaleString('pt-BR')}</td>
                  </tr>

                  {/* Nested Child Equipment Rows */}
                  {isTableExpanded[group.frente] && group.subRows.map((subRow) => (
                    <tr key={subRow.id} className="bg-white border-b border-gray-150 hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-8 sticky left-0 bg-white z-10 font-black text-black whitespace-pre">
                        • {subRow.frente.trim()}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-black">{subRow.horasTotais.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-center font-black text-black">{subRow.hProdutiva.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-center font-black text-black">{subRow.hParadas.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-center font-black text-black">{subRow.semApto.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-center font-black text-black">{subRow.vMedia.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-center font-black text-black">
                        <span className="mr-1">{subRow.mOcioso.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(subRow.statusOcioso)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-black">
                        <span className="mr-1">{subRow.eficiencia.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(subRow.statusEfic)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-black">
                        <span className="mr-1">{subRow.dispMecConj.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(subRow.statusDisp)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-black">
                        <span className="mr-1">{subRow.dispMecTrator.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(subRow.statusTrator)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-black">
                        <span className="mr-1">{subRow.dispMecImp.toFixed(1).replace('.', ',')}%</span>
                        {renderStatusIcon(subRow.statusImp)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-emerald-950">{subRow.hectares.toLocaleString('pt-BR')}</td>
                      <td className="py-2.5 px-3 text-center font-black text-blue-950">{subRow.haHora.toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Grand Total Footer Row */}
              <tr className="bg-emerald-50 border-t-2 border-emerald-800 text-black font-black">
                <td className="py-3 px-4 sticky left-0 bg-emerald-50 z-10 font-black uppercase text-[#00843D]">
                  {plantioTableTotal.frente}
                </td>
                <td className="py-3 px-3 text-center font-black">{plantioTableTotal.horasTotais.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{plantioTableTotal.hProdutiva.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{plantioTableTotal.hParadas.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{plantioTableTotal.semApto.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{plantioTableTotal.vMedia.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{plantioTableTotal.mOcioso.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(plantioTableTotal.statusOcioso)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{plantioTableTotal.eficiencia.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(plantioTableTotal.statusEfic)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{plantioTableTotal.dispMecConj.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(plantioTableTotal.statusDisp)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{plantioTableTotal.dispMecTrator.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(plantioTableTotal.statusTrator)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{plantioTableTotal.dispMecImp.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(plantioTableTotal.statusImp)}
                </td>
                <td className="py-3 px-3 text-center font-black text-emerald-800">{plantioTableTotal.hectares.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black text-blue-800">{plantioTableTotal.haHora.toLocaleString('pt-BR')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. ROW 5: TABLE 2 - RANKING OPERADORES */}
      <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <h3 className="text-base font-black text-[#0C2340] uppercase tracking-wider flex items-center gap-1.5">
            <User size={18} className="text-[#0C2340]" />
            <span>Ranking Operadores</span>
          </h3>
          <span className="text-[10px] font-black uppercase text-black tracking-widest bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl">
            Indicadores de Desempenho de Tratos
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm max-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#0C2340] text-white text-[10px] font-black uppercase tracking-wider border-b border-gray-250 sticky top-0 z-20">
                <th className="py-3 px-4 sticky left-0 bg-[#0C2340] z-30 w-[300px]">Operador</th>
                <th className="py-3 px-3 text-center">Horas Totais</th>
                <th className="py-3 px-3 text-center">H_Produtiva</th>
                <th className="py-3 px-3 text-center">H_Paradas</th>
                <th className="py-3 px-3 text-center">Eficiência (%)</th>
                <th className="py-3 px-3 text-center">Disp.Mecânica (%)</th>
                <th className="py-3 px-3 text-center">M_Ocioso (%)</th>
                <th className="py-3 px-3 text-center">Vol_Média</th>
                <th className="py-3 px-3 text-center">Sem Apto</th>
                <th className="py-3 px-3 text-center">Hectares</th>
                <th className="py-3 px-3 text-center">Ha/Hora</th>
              </tr>
            </thead>
            <tbody className="text-xs text-black">
              {rankingOperadoresData.map((op, idx) => (
                <tr key={idx} className="bg-white border-b border-gray-150 hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 sticky left-0 bg-white z-10 font-black text-black border-r border-gray-100">
                    <span className="inline-block w-5 text-black font-black text-[10px]">{idx + 1}</span>
                    {op.name}
                  </td>
                  <td className="py-2.5 px-3 text-center font-black text-black">{op.horasTotais.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-center font-black text-black">{op.hProdutiva.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-center font-black text-black">{op.hParadas.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-center font-black text-black">
                    <span className="mr-1">{op.eficiencia.toFixed(1).replace('.', ',')}%</span>
                    {renderStatusIcon(op.statusEfic)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-black text-black">
                    <span className="mr-1">{op.dispMec.toFixed(1).replace('.', ',')}%</span>
                    {renderStatusIcon(op.statusDisp)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-black text-black">
                    <span className="mr-1">{op.mOcioso.toFixed(1).replace('.', ',')}%</span>
                    {renderStatusIcon(op.statusOcioso)}
                  </td>
                  <td className="py-2.5 px-3 text-center font-black text-black">{op.volMedia.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-center font-black text-black">{op.semApto.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-center font-black text-emerald-950">{op.hectares.toLocaleString('pt-BR')}</td>
                  <td className="py-2.5 px-3 text-center font-black text-blue-950">{op.haHora.toLocaleString('pt-BR')}</td>
                </tr>
              ))}

              {/* Ranking Grand Total Row */}
              <tr className="bg-emerald-50 border-t-2 border-emerald-800 text-black font-black sticky bottom-0 z-20">
                <td className="py-3 px-4 sticky left-0 bg-emerald-50 z-30 font-black uppercase text-[#00843D] border-r border-gray-200">
                  {rankingOperadoresTotal.name}
                </td>
                <td className="py-3 px-3 text-center font-black">{rankingOperadoresTotal.horasTotais.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{rankingOperadoresTotal.hProdutiva.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{rankingOperadoresTotal.hParadas.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{rankingOperadoresTotal.eficiencia.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(rankingOperadoresTotal.statusEfic)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{rankingOperadoresTotal.dispMec.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(rankingOperadoresTotal.statusDisp)}
                </td>
                <td className="py-3 px-3 text-center font-black">
                  <span className="mr-1.5">{rankingOperadoresTotal.mOcioso.toFixed(1).replace('.', ',')}%</span>
                  {renderStatusIcon(rankingOperadoresTotal.statusOcioso)}
                </td>
                <td className="py-3 px-3 text-center font-black">{rankingOperadoresTotal.volMedia.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black">{rankingOperadoresTotal.semApto.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black text-emerald-800">{rankingOperadoresTotal.hectares.toLocaleString('pt-BR')}</td>
                <td className="py-3 px-3 text-center font-black text-blue-800">{rankingOperadoresTotal.haHora.toLocaleString('pt-BR')}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
                  <span className="text-[10px] font-black text-[#00843D] bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Painel Diário Plantio Expandido</span>
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
                {zoomedChartId === 'plantio_mecanizado' && (
                  <div className="h-[320px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">Plantio Mecanizado</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Divisão de Horas Operacionais (Produtiva vs Parada)</p>
                    </div>
                    <div className="h-[75%] mt-4 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={100}
                            outerRadius={140}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {donutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB', padding: '10px' }}
                            itemStyle={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: '900', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-black uppercase text-gray-400 tracking-wider">Total Horas</span>
                        <span className="text-4xl font-black text-[#0C2340] dark:text-white tracking-tighter mt-1">
                          {(donutData[0].value + donutData[1].value).toFixed(1).replace('.', ',')}h
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {zoomedChartId === 'ofensores' && (
                  <div className="h-[320px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner flex flex-col justify-between">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">Top 10 Ofensores da Eficiência Operacional</h3>
                    <div className="h-[80%] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ofensoresData} margin={{ top: 25, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
                          <XAxis dataKey="name" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={70} tickLine={false} tickFormatter={(val) => val && val.length > 12 ? `${val.substring(0, 10)}...` : val} />
                          <YAxis stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} tickFormatter={(val) => `${val}K`} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }} labelStyle={{ fontWeight: '900', color: isDarkMode ? '#ffffff' : '#000000' }} itemStyle={{ fontWeight: '900', color: '#B91C1C' }} />
                          <Bar dataKey="value" fill="#B91C1C" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: isDarkMode ? '#ffffff' : '#000000', fontWeight: '900', fontSize: 11, formatter: (val: number) => `${val.toFixed(1).replace('.', ',')} K` }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {zoomedChartId === 'hectares_hahora' && (
                  <div className="h-[320px] sm:h-[450px] w-full bg-slate-50/80 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-inner flex flex-col justify-between">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase">Hectares e Ha/Hora</h3>
                    <div className="h-[80%] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={comboChartData} margin={{ top: 25, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#30363d' : '#E5E7EB'} />
                          <XAxis dataKey="name" stroke={isDarkMode ? '#8b949e' : '#000000'} tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={70} tickLine={false} tickFormatter={(val) => val && val.length > 12 ? `${val.substring(0, 10)}...` : val} />
                          <YAxis yAxisId="left" stroke="#00843D" tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Hectares', angle: -90, position: 'insideLeft', style: { fontSize: 11, fontWeight: '900', fill: '#00843D' } }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#2563EB" tick={{ fill: isDarkMode ? '#c9d1d9' : '#000000', fontWeight: '900', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Ha/Hora', angle: 90, position: 'insideRight', style: { fontSize: 11, fontWeight: '900', fill: '#2563EB' } }} />
                          <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB' }} labelStyle={{ fontWeight: '900', color: isDarkMode ? '#ffffff' : '#000000' }} />
                          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontWeight: '900', color: isDarkMode ? '#ffffff' : '#000000' }} />
                          <Bar yAxisId="left" name="Hectares" dataKey="Hectares" fill="#00843D" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: isDarkMode ? '#ffffff' : '#000000', fontWeight: '900', fontSize: 10, formatter: (val: number) => val.toFixed(2).replace('.', ',') }} />
                          <Line yAxisId="right" type="monotone" name="Ha/Hora" dataKey="HaHora" stroke="#2563EB" strokeWidth={3} dot={{ r: 6, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} label={{ position: 'bottom', fill: isDarkMode ? '#ffffff' : '#000000', fontWeight: '900', fontSize: 10, formatter: (val: number) => val.toFixed(2).replace('.', ',') }} />
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
