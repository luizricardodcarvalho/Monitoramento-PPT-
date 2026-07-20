import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Define paths
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const pdfPath = path.join(publicDir, 'documentacao_tecnica_coa.pdf');

console.log('Iniciando a geração do PDF em:', pdfPath);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true
});

// Keep track of pageCount silently
let pageCount = 1;
doc.on('pageAdded', () => {
  pageCount++;
});

const writeStream = fs.createWriteStream(pdfPath);
doc.pipe(writeStream);

// Corporate Colors (Matching Colombo branding)
const PRIMARY_GREEN = '#005B2B'; // Verde Colombo Escuro
const ACCENT_GREEN = '#00843D';  // Verde Colombo Operacional
const LIGHT_GREEN = '#E2F5E5';   // Verde Claro de destaque
const TEXT_SLATE = '#1E293B';    // Cinza Escuro Texto
const LIGHT_BG = '#F8FAFC';      // Fundo sutil para tabelas e caixas
const MUTED_GRAY = '#64748B';    // Cinza de apoio

// Helper function to draw dynamic headers/footers at the end
function generateHeaderFooter() {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Skip cover page
    if (i === 0) continue;

    // Header
    doc.save();
    doc.fontSize(7)
       .font('Helvetica-Bold')
       .fillColor(ACCENT_GREEN)
       .text('COLOMBO AGROINDÚSTRIA S/A', 50, 25)
       .font('Helvetica')
       .fillColor(MUTED_GRAY)
       .text('CENTRO DE OPERAÇÕES AGRÍCOLAS (COA) • MONITORAMENTO INTEGRADO', 200, 25, { align: 'right' });
    
    // Header Line
    doc.moveTo(50, 35)
       .lineTo(545, 35)
       .strokeColor('#E2E8F0')
       .lineWidth(0.5)
       .stroke();

    // Footer Line
    doc.moveTo(50, 795)
       .lineTo(545, 795)
       .strokeColor('#E2E8F0')
       .lineWidth(0.5)
       .stroke();

    // Footer
    const oldBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 10;
    
    doc.fontSize(7)
       .font('Helvetica')
       .fillColor(MUTED_GRAY)
       .text(`Código: COA-DOC-001-V1  |  Responsável Técnico: Luiz Ricardo D. Carvalho  |  Versão 1.0`, 50, 802)
       .text(`Página ${i + 1} de ${range.count}`, 450, 802, { align: 'right' });
        
    doc.page.margins.bottom = oldBottomMargin;
    doc.restore();
  }
}

// Custom structure builder for rich styling
function drawCoverPage() {
  // Background gradient overlay
  doc.rect(0, 0, 595, 842).fill('#022C16'); // Dark deep green

  // Background grid to represent precision logistics network (very subtle)
  doc.save();
  doc.strokeColor('rgba(255, 199, 44, 0.04)').lineWidth(0.5);
  for (let x = 0; x < 595; x += 40) {
    doc.moveTo(x, 0).lineTo(x, 842).stroke();
  }
  for (let y = 0; y < 842; y += 40) {
    doc.moveTo(0, y).lineTo(595, y).stroke();
  }
  
  // Draw an elegant circular grid at the top-right representing tracking & radar
  doc.circle(520, 120, 100).strokeColor('rgba(255, 199, 44, 0.06)').lineWidth(1).stroke();
  doc.circle(520, 120, 60).strokeColor('rgba(255, 199, 44, 0.04)').lineWidth(1).stroke();
  doc.moveTo(520, 0).lineTo(520, 240).strokeColor('rgba(255, 199, 44, 0.03)').stroke();
  doc.moveTo(400, 120).lineTo(595, 120).strokeColor('rgba(255, 199, 44, 0.03)').stroke();
  doc.restore();

  // Top Accent bars
  doc.rect(0, 0, 595, 15).fill('#005B2B');
  doc.rect(0, 15, 595, 4).fill('#FFC72C'); // Yellow accent line

  // Embed corporate logo if it exists
  const logoPath = './src/assets/images/colombo_gestao_logo_1784131662820.jpg';
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { height: 35 });
  } else {
    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(12)
       .text('COLOMBO AGROINDÚSTRIA S/A', 50, 55, { characterSpacing: 1 });
  }

  // Project Logo (Emblema do Projeto COA) - Vector Graphic
  doc.save();
  const px = 480;
  const py = 215;
  // Outer shield
  doc.moveTo(px, py - 35)
     .lineTo(px + 25, py - 20)
     .lineTo(px + 25, py + 15)
     .quadraticCurveTo(px + 25, py + 35, px, py + 45)
     .quadraticCurveTo(px - 25, py + 35, px - 25, py + 15)
     .lineTo(px - 25, py - 20)
     .closePath()
     .fillColor('rgba(255, 199, 44, 0.1)')
     .fill();

  doc.moveTo(px, py - 35)
     .lineTo(px + 25, py - 20)
     .lineTo(px + 25, py + 15)
     .quadraticCurveTo(px + 25, py + 35, px, py + 45)
     .quadraticCurveTo(px - 25, py + 35, px - 25, py + 15)
     .lineTo(px - 25, py - 20)
     .closePath()
     .strokeColor('#FFC72C')
     .lineWidth(1.5)
     .stroke();

  // Stylized sugarcane leaf inside project logo
  doc.moveTo(px, py + 30)
     .quadraticCurveTo(px + 12, py + 5, px + 8, py - 15)
     .quadraticCurveTo(px, py - 5, px, py + 30)
     .fillColor('#00843D')
     .fill();
  doc.moveTo(px, py + 30)
     .quadraticCurveTo(px - 12, py + 5, px - 8, py - 15)
     .quadraticCurveTo(px, py - 5, px, py + 30)
     .fillColor('#FFC72C')
     .fill();
  doc.restore();

  // Project Logo Label
  doc.fontSize(7)
     .font('Helvetica-Bold')
     .fillColor('#FFC72C')
     .text('PROJETO COA', 452, 275, { width: 60, align: 'center' });

  // Main system title
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('#FFFFFF')
     .text('SISTEMA INTEGRADO COA', 50, 160, { width: 400, lineGap: 6 });
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#FFC72C') // Golden accent
     .text('MONITORAMENTO PPT & DIÁRIO OPERACIONAL', 50, 225, { width: 400 });

  // Divider Line
  doc.moveTo(50, 295)
     .lineTo(545, 295)
     .strokeColor('rgba(255, 255, 255, 0.2)')
     .lineWidth(1)
     .stroke();

  // Subtitle
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#CBD5E1')
     .text('Documentação Técnica Completa de Arquitetura, Requisitos, Modelagem, Segurança, Implantação, Manutenção e Operações de Campo para as Usinas Ariranha, Palestina e Santa Albertina.', 50, 310, { width: 480, lineGap: 4 });

  // Specs block container - glassmorphism look
  doc.rect(50, 410, 495, 220).fill('#01381D');
  doc.rect(50, 410, 4, 220).fill('#FFC72C'); // Yellow band on left
  doc.rect(50, 410, 495, 220).strokeColor('rgba(255, 199, 44, 0.15)').lineWidth(0.5).stroke();

  // Meta specifications inside block
  doc.fontSize(9.5)
     .font('Helvetica-Bold')
     .fillColor('#FFC72C')
     .text('ESPECIFICAÇÕES DA DOCUMENTAÇÃO TÉCNICA (V1.0)', 70, 430)
     .fontSize(8.5)
     .font('Helvetica')
     .fillColor('#FFFFFF')
     
     .text('Código do Documento:', 70, 460).font('Helvetica-Bold').text('COLOMBO-COA-PROPOSTA-001', 200, 460)
     .font('Helvetica').text('Classificação:', 70, 478).font('Helvetica-Bold').text('CONFIDENCIAL - USO INTERNO EXCLUSIVO', 200, 478)
     .font('Helvetica').text('Versão / Status:', 70, 496).font('Helvetica-Bold').text('v1.0 (Primeira Versão - Proposta Técnica)', 200, 496)
     .font('Helvetica').text('Autor / Responsável:', 70, 514).font('Helvetica-Bold').text('Luiz Ricardo Dominguês Carvalho', 200, 514)
     .font('Helvetica').text('Função Técnica:', 70, 532).font('Helvetica-Bold').fillColor('#FFC72C').text('Analista Logística Agroind. JR', 200, 532).fillColor('#FFFFFF')
     .font('Helvetica').text('Responsável Técnico:', 70, 550).font('Helvetica-Bold').text('Luiz Ricardo Dominguês Carvalho', 200, 550)
     .font('Helvetica').text('Data de Emissão:', 70, 568).font('Helvetica-Bold').text('20 de Julho de 2026', 200, 568)
     .font('Helvetica').text('Empresa Cliente:', 70, 586).font('Helvetica-Bold').text('Colombo Agroindústria S/A', 200, 586)
     .font('Helvetica').text('Bacia / Local de Uso:', 70, 604).font('Helvetica-Bold').text('Centro de Operações Agrícolas (COA) - Unidades S/A', 200, 604, { width: 320 });

  // Footer text on cover
  doc.fontSize(7.5)
     .font('Helvetica-Oblique')
     .fillColor('#94A3B8')
     .text('© 2026 Colombo Agroindústria S/A. Todos os direitos reservados. Proibida a reprodução externa sem autorização prévia.', 50, 765, { align: 'center', width: 495 });
}

// Write standard section headings
function writeHeading(title, subtitle = null) {
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor(PRIMARY_GREEN)
     .text(title, 50, 55);
  
  // Draw separator line under heading
  doc.moveTo(50, 72)
     .lineTo(545, 72)
     .strokeColor(ACCENT_GREEN)
     .lineWidth(1)
     .stroke();

  if (subtitle) {
    doc.fontSize(8.5)
       .font('Helvetica-Oblique')
       .fillColor(MUTED_GRAY)
       .text(subtitle, 50, 78, { lineGap: 3 });
    doc.y = 96;
  } else {
    doc.y = 82;
  }
  doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_SLATE);
}

function writeSubHeading(title) {
  doc.fontSize(10.5)
     .font('Helvetica-Bold')
     .fillColor(ACCENT_GREEN)
     .text(title, { lineGap: 4 });
  doc.moveDown(0.4);
}

function writeParagraph(text, options = {}) {
  const lineGap = options.lineGap || 4;
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor(TEXT_SLATE)
     .text(text, { width: 495, align: 'justify', lineGap, ...options });
  doc.moveDown(0.7);
}

function writeBulletPoints(points) {
  points.forEach(point => {
    doc.font('Helvetica')
       .fontSize(9.5)
       .fillColor(TEXT_SLATE)
       .text(`• ${point}`, 65, doc.y, { width: 480, align: 'justify', lineGap: 3.5 });
    doc.moveDown(0.3);
  });
  doc.moveDown(0.4);
}

// Calculate row height dynamically using PDFKit heightOfString to avoid cell text clipping!
function getRowHeight(row, columnWidths, fontSize = 8) {
  let maxHeight = 22; // Minimum height
  doc.font('Helvetica').fontSize(fontSize);
  row.forEach((cell, cellIndex) => {
    const width = columnWidths[cellIndex] - 12;
    const height = doc.heightOfString(cell, { width: width });
    if (height + 12 > maxHeight) {
      maxHeight = height + 12;
    }
  });
  return maxHeight;
}

// Draw highly polished tables with dynamic cell wrapping and no overlaps
function drawSimpleTable(headers, rows, columnWidths) {
  doc.moveDown(0.3);
  const startX = 50;
  let startY = doc.y;
  const headerHeight = 22;
  
  // Header background
  doc.rect(startX, startY, 495, headerHeight).fill(PRIMARY_GREEN);
  
  // Header Text
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
  let currentX = startX;
  headers.forEach((header, idx) => {
    doc.text(header, currentX + 6, startY + 7, { width: columnWidths[idx] - 12, align: 'left' });
    currentX += columnWidths[idx];
  });
  
  startY += headerHeight;
  
  // Rows
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_SLATE);
  rows.forEach((row, rowIdx) => {
    const rHeight = getRowHeight(row, columnWidths, 8);
    
    // Background color for zebra stripe
    if (rowIdx % 2 === 1) {
      doc.rect(startX, startY, 495, rHeight).fill(LIGHT_BG);
    } else {
      doc.rect(startX, startY, 495, rHeight).fill('#FFFFFF');
    }
    
    // Draw borders on bottom and sides
    doc.rect(startX, startY, 495, rHeight).strokeColor('#E2E8F0').lineWidth(0.5).stroke();
    
    currentX = startX;
    row.forEach((cell, cellIndex) => {
      doc.fillColor(TEXT_SLATE).text(cell, currentX + 6, startY + 6, {
        width: columnWidths[cellIndex] - 12,
        align: 'left'
      });
      currentX += columnWidths[cellIndex];
    });
    
    startY += rHeight;
  });
  
  doc.y = startY + 5;
  doc.font('Helvetica').fontSize(9.5).fillColor(TEXT_SLATE);
  doc.moveDown(0.6);
}

// Helper to draw clean vector mockups with dark-and-green aesthetic
function drawSleekHeaderBanner(screenX, screenY, screenW, title) {
  // Main green header background
  doc.rect(screenX, screenY, screenW, 16).fill('#022C16');
  // Bright green outline indicator below the banner
  doc.rect(screenX, screenY + 16, screenW, 1).fill('#5adc6a');
  // White title text
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text(title, screenX + 10, screenY + 5);
}

// 1. MONITORAMENTO MOCKUP (Aba 1)
function drawMonitoramentoMockup(screenX, screenY, screenW, screenH) {
  doc.save();
  // Browser outer box (clean dark canvas background matching screenshots)
  doc.roundedRect(screenX, screenY, screenW, screenH, 4).fill('#0b0f19');
  
  drawSleekHeaderBanner(screenX, screenY, screenW, 'COLOMBO COA   |   Aba 1: Painel de Monitoramento Geral');
  
  // Left Panel - Frentes Ativas
  doc.roundedRect(screenX + 15, screenY + 28, 210, 95, 3).fill('#1e293b');
  doc.fontSize(6).font('Helvetica-Bold').fillColor('#FFC72C').text('Frentes Operacionais Ativas:', screenX + 22, screenY + 35);
  
  // Table
  doc.rect(screenX + 22, screenY + 45, 196, 7).fill('#022C16');
  doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('Frente / Cidade', screenX + 25, screenY + 47)
     .text('Equipamentos', screenX + 110, screenY + 47)
     .text('Status', screenX + 165, screenY + 47);
     
  const ry = screenY + 55;
  doc.rect(screenX + 22, ry, 196, 30).fill('#111827');
  doc.fontSize(4).font('Helvetica').fillColor('#CBD5E1')
     .text('Frente Ariranha 01', screenX + 25, ry + 3)
     .text('3 Tratores / 2 Plantadoras', screenX + 110, ry + 3)
     .text('Trabalhando', screenX + 165, ry + 3)
     
     .text('Frente Palestina 02', screenX + 25, ry + 12)
     .text('4 Tratores / 3 Plantadoras', screenX + 110, ry + 12)
     .text('Trabalhando', screenX + 165, ry + 12)
     
     .text('Frente Albertina 03', screenX + 25, ry + 21)
     .text('2 Tratores / 1 Plantadora', screenX + 110, ry + 21)
     .text('Parado (Chuva)', screenX + 165, ry + 21);
     
  // Right Panel - KPI Dashboard circular gauges
  doc.roundedRect(screenX + 240, screenY + 28, 220, 95, 3).fill('#1e293b');
  doc.fontSize(6).font('Helvetica-Bold').fillColor('#FFFFFF').text('Resumo de Produtividade Diária:', screenX + 248, screenY + 35);
  
  // Circular gauge for compliance
  doc.circle(screenX + 300, screenY + 75, 20).strokeColor('rgba(255, 255, 255, 0.1)').lineWidth(3).stroke();
  doc.circle(screenX + 300, screenY + 75, 20).strokeColor('#5adc6a').lineWidth(3).stroke();
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF').text('94%', screenX + 294, screenY + 72);
  doc.fontSize(4.5).font('Helvetica').fillColor('#94A3B8').text('Metas de Plantio', screenX + 276, screenY + 102);

  // Line chart representation
  doc.fontSize(5).font('Helvetica-Bold').fillColor('#FFC72C').text('Eficiência Operacional (PPT):', screenX + 355, screenY + 45);
  doc.rect(screenX + 355, screenY + 54, 95, 45).fill('#111827');
  doc.moveTo(screenX + 360, screenY + 90)
     .lineTo(screenX + 380, screenY + 70)
     .lineTo(screenX + 400, screenY + 80)
     .lineTo(screenX + 420, screenY + 60)
     .lineTo(screenX + 440, screenY + 65)
     .strokeColor('#5adc6a')
     .lineWidth(1)
     .stroke();

  doc.restore();
}

// 2. PLANTIO MOCKUP (Aba 2)
function drawPlantioMockup(screenX, screenY, screenW, screenH) {
  doc.save();
  doc.roundedRect(screenX, screenY, screenW, screenH, 4).fill('#0b0f19');
  
  drawSleekHeaderBanner(screenX, screenY, screenW, 'COLOMBO COA   |   Aba 2: Gestão de Plantio e Frotas');
  
  // Left Panel - Cadastrar Equipamento
  doc.roundedRect(screenX + 15, screenY + 28, 200, 95, 3).fill('#1e293b');
  doc.fontSize(6).font('Helvetica-Bold').fillColor('#FFC72C').text('Cadastro Rápido de Frota:', screenX + 22, screenY + 35);
  
  // Forms fields
  doc.rect(screenX + 22, screenY + 45, 186, 12).fill('#111827');
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#94A3B8').text('Prefixo: TR-8120', screenX + 26, screenY + 49);
  
  doc.rect(screenX + 22, screenY + 61, 186, 12).fill('#111827');
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#94A3B8').text('Equipamento: Trator John Deere 8R', screenX + 26, screenY + 65);
  
  doc.rect(screenX + 22, screenY + 77, 186, 12).fill('#111827');
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#94A3B8').text('Frente Destino: Frente Ariranha 01', screenX + 26, screenY + 81);
  
  doc.rect(screenX + 22, screenY + 97, 80, 15).fill('#00843D');
  doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#FFFFFF').text('GRAVAR DADOS', screenX + 38, screenY + 102);
  
  // Right Panel - Frota Ativa List
  doc.roundedRect(screenX + 230, screenY + 28, 230, 95, 3).fill('#1e293b');
  doc.fontSize(6).font('Helvetica-Bold').fillColor('#FFFFFF').text('Equipamentos Alocados na Frente:', screenX + 238, screenY + 35);
  
  doc.rect(screenX + 238, screenY + 45, 214, 7).fill('#022C16');
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('Prefixo', screenX + 242, screenY + 47)
     .text('Equipamento', screenX + 280, screenY + 47)
     .text('Alocação', screenX + 360, screenY + 47)
     .text('Estado', screenX + 415, screenY + 47);
     
  const ry = screenY + 54;
  doc.fontSize(4).font('Helvetica').fillColor('#CBD5E1')
     .text('TR-001', screenX + 242, ry + 2).text('John Deere 8R', screenX + 280, ry + 2).text('Frente Ariranha 01', screenX + 360, ry + 2).text('Trabalhando', screenX + 415, ry + 2)
     .text('PL-004', screenX + 242, ry + 10).text('Plantadora Colombo', screenX + 280, ry + 10).text('Frente Ariranha 01', screenX + 360, ry + 10).text('Trabalhando', screenX + 415, ry + 10)
     .text('TR-002', screenX + 242, ry + 18).text('Case IH Magnum', screenX + 280, ry + 18).text('Frente Palestina 02', screenX + 360, ry + 18).text('Manutenção', screenX + 415, ry + 18)
     .text('PL-001', screenX + 242, ry + 26).text('Plantadora DMB 3L', screenX + 280, ry + 26).text('Frente Palestina 02', screenX + 360, ry + 26).text('Trabalhando', screenX + 415, ry + 26);

  doc.restore();
}

// 3. VINHAÇA MOCKUP (Aba 3) - EXACT MATCH FOR USER'S SCREENSHOT "PRINT 1"
function drawVinhacaMockup(screenX, screenY, screenW, screenH) {
  doc.save();
  // Slate dark canvas background matching Print 1 exactly
  doc.roundedRect(screenX, screenY, screenW, screenH, 4).fill('#0b0f19');
  
  // Header matching header bar from user's image
  doc.rect(screenX, screenY, screenW, 16).fill('#022C16');
  doc.rect(screenX, screenY + 16, screenW, 1).fill('#5adc6a'); // Light green border line
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('COLOMBO COA   |   Aba 3: Módulo de Distribuição de Vinhaça', screenX + 12, screenY + 5);

  // Left Card: "Níveis das Caixas de Acumulação:"
  const leftX = screenX + 15;
  const leftY = screenY + 28;
  doc.roundedRect(leftX, leftY, 200, 95, 3).fill('#1e293b');
  
  // Yellow title exactly matching user's image
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#FFC72C')
     .text('Níveis das Caixas de Acumulação:', leftX + 10, leftY + 12);
  
  // Perfect circular gauge matching Print 1 (with green progress ring)
  const cx = leftX + 100;
  const cy = leftY + 50;
  doc.circle(cx, cy, 22).strokeColor('rgba(255, 255, 255, 0.08)').lineWidth(3.5).stroke();
  doc.circle(cx, cy, 22).strokeColor('#00843D').lineWidth(3.5).stroke(); // Green indicator
  
  // Inner gauge text
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('78%', cx - 8, cy - 3);
     
  // Description under gauge
  doc.fontSize(5).font('Helvetica').fillColor('#94A3B8')
     .text('Capacidade Ativa Usina', cx - 24, cy + 28);

  // Right Card: "Frota de Despacho Ativa:"
  const rightX = screenX + 230;
  const rightY = screenY + 28;
  doc.roundedRect(rightX, rightY, 230, 95, 3).fill('#1e293b');
  
  // White title exactly matching user's image
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('Frota de Despacho Ativa:', rightX + 10, rightY + 12);
  
  // Table headers on a green background bar matching Print 1 exactly
  doc.rect(rightX + 10, rightY + 26, 210, 7).fill('#022C16');
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('Veículo (Tanque)', rightX + 14, rightY + 28)
     .text('Motorista', rightX + 75, rightY + 28)
     .text('Status', rightX + 145, rightY + 28);
     
  // Row data with identical names and values as the Print 1 screenshot
  doc.rect(rightX + 10, rightY + 33, 210, 8).fill('#1e293b');
  doc.fontSize(4).font('Helvetica').fillColor('#CBD5E1')
     .text('CAM-004 (Vinhaça)', rightX + 14, rightY + 35)
     .text('José da Silva', rightX + 75, rightY + 35)
     .text('Descarregando em Campo', rightX + 145, rightY + 35);

  doc.restore();
}

// 4. DDS MOCKUP (Aba 6)
function drawDdsMockup(screenX, screenY, screenW, screenH) {
  doc.save();
  doc.roundedRect(screenX, screenY, screenW, screenH, 4).fill('#0b0f19');
  
  drawSleekHeaderBanner(screenX, screenY, screenW, 'COLOMBO COA   |   Aba 6: Diálogo Diário de Segurança (DDS)');
  
  // Left Clipboard Document
  doc.roundedRect(screenX + 15, screenY + 28, 210, 95, 3).fill('#FFFFFF');
  doc.rect(screenX + 15, screenY + 28, 3, 95).fill('#00843D');
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#005B2B').text('SMS: RECOMENDAÇÕES PARA OPERAÇÃO DIÁRIA', screenX + 24, screenY + 35);
  
  doc.fontSize(4.5).font('Helvetica').fillColor(TEXT_SLATE)
     .text('1. Obrigatório uso de óculos de proteção contra poeira nas plantadoras.', screenX + 24, screenY + 45, { width: 190 })
     .text('2. Evite manobras bruscas com tratores articulados em aclives de talhão.', screenX + 24, screenY + 57, { width: 190 })
     .text('3. Mantenha os caminhões de vinhaça com os freios inspecionados.', screenX + 24, screenY + 69, { width: 190 })
     .text('4. Em fadiga corporal acentuada, comunique o gestor de frente no rádio.', screenX + 24, screenY + 81, { width: 190 });

  // Right Sign-off progress bar
  doc.roundedRect(screenX + 240, screenY + 28, 220, 95, 3).fill('#1e293b');
  doc.fontSize(6).font('Helvetica-Bold').fillColor('#FFC72C').text('Taxas de Leitura e Aceite Eletrônico:', screenX + 248, screenY + 35);
  
  doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#FFFFFF').text('Frente Ariranha PPT (John Deere):', screenX + 248, screenY + 48);
  doc.rect(screenX + 248, screenY + 55, 204, 5).fill('#111827');
  doc.rect(screenX + 248, screenY + 55, 187, 5).fill('#5adc6a'); // 92%
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#5adc6a').text('92% Concluído', screenX + 248, screenY + 63);
  
  doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#FFFFFF').text('Frente Palestina PPT (Case IH):', screenX + 248, screenY + 74);
  doc.rect(screenX + 248, screenY + 81, 204, 5).fill('#111827');
  doc.rect(screenX + 248, screenY + 81, 163, 5).fill('#FFC72C'); // 80%
  doc.fontSize(4).font('Helvetica-Bold').fillColor('#FFC72C').text('80% Concluído', screenX + 248, screenY + 89);

  doc.restore();
}

// 5. PLUVIOMETRIA MOCKUP (Aba 9) - EXACT MATCH FOR USER'S SCREENSHOT "PRINT 2"
function drawPluviometriaMockup(screenX, screenY, screenW, screenH) {
  doc.save();
  // Slate dark canvas background matching Print 2 exactly
  doc.roundedRect(screenX, screenY, screenW, screenH, 4).fill('#0b0f19');
  
  // Header matching the header bar from Print 2 exactly
  doc.rect(screenX, screenY, screenW, 16).fill('#022C16');
  doc.rect(screenX, screenY + 16, screenW, 1).fill('#5adc6a');
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('COLOMBO COA   |   Aba 2: Painel Pluviométrico Regional', screenX + 12, screenY + 5);

  // Left Card: "Importar Planilha de Chuvas (.XLSX)"
  const leftX = screenX + 15;
  const leftY = screenY + 28;
  doc.roundedRect(leftX, leftY, 200, 95, 3).fill('#1e293b');
  
  // Gold title exactly matching Print 2
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#FFC72C')
     .text('Importar Planilha de Chuvas (.XLSX)', leftX + 10, leftY + 15);
  
  // Dashed outline rectangle box matching Print 2 exactly
  doc.rect(leftX + 12, leftY + 28, 176, 55).strokeColor('rgba(255, 199, 44, 0.35)').lineWidth(1).dash(2.5, {space: 2}).stroke();
  
  // Text inside dashed box
  doc.fontSize(4.5).font('Helvetica').fillColor('#94A3B8')
     .text('Arraste o arquivo ou clique para selecionar', leftX + 24, leftY + 54);

  // Right Card: "Precipitação Acumulada por Usina (mm):"
  const rightX = screenX + 230;
  const rightY = screenY + 28;
  doc.roundedRect(rightX, rightY, 230, 95, 3).fill('#1e293b');
  
  // White title matching Print 2 exactly
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#FFFFFF')
     .text('Precipitação Acumulada por Usina (mm):', rightX + 10, rightY + 12);
  
  // Draw the exact three green vertical bars matching user's image values:
  // Ariranha: 14.5, Palestina: 32.0, Albertina: 12.2
  
  // 1. Ariranha (14.5 mm)
  doc.rect(rightX + 35, rightY + 45, 18, 30).fill('#00843D');
  doc.fontSize(5).font('Helvetica-Bold').fillColor('#FFFFFF').text('14.5', rightX + 37, rightY + 56);
  doc.fontSize(4.5).font('Helvetica').fillColor('#94A3B8').text('Ariranha', rightX + 31, rightY + 81);
  
  // 2. Palestina (32.0 mm)
  doc.rect(rightX + 105, rightY + 25, 18, 50).fill('#00843D');
  doc.fontSize(5).font('Helvetica-Bold').fillColor('#FFFFFF').text('32.0', rightX + 107, rightY + 45);
  doc.fontSize(4.5).font('Helvetica').fillColor('#94A3B8').text('Palestina', rightX + 101, rightY + 81);
  
  // 3. Albertina (12.2 mm)
  doc.rect(rightX + 175, rightY + 49, 18, 26).fill('#00843D');
  doc.fontSize(5).font('Helvetica-Bold').fillColor('#FFFFFF').text('12.2', rightX + 177, rightY + 58);
  doc.fontSize(4.5).font('Helvetica').fillColor('#94A3B8').text('Albertina', rightX + 171, rightY + 81);

  doc.restore();
}

// 6. COAZITO MOCKUP (Aba 10)
function drawCoazitoMockup(screenX, screenY, screenW, screenH) {
  doc.save();
  doc.roundedRect(screenX, screenY, screenW, screenH, 4).fill('#0b0f19');
  
  drawSleekHeaderBanner(screenX, screenY, screenW, 'COLOMBO COA   |   Aba 10: Assistente de IA Coazito AI');
  
  // Conversation Window Background
  doc.roundedRect(screenX + 15, screenY + 24, 445, 100, 3).fill('#002B13');
  doc.fontSize(5.5).font('Helvetica-Bold').fillColor('#FFC72C').text('Mesa do COA - Chatbot de Suporte Integrado:', screenX + 22, screenY + 30);
  
  // User Prompt bubble on the right
  doc.roundedRect(screenX + 180, screenY + 40, 270, 24, 3).fill('#1E293B');
  doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#FFC72C').text('Luiz Ricardo:', screenX + 185, screenY + 45);
  doc.fontSize(4.5).font('Helvetica').fillColor('#FFFFFF').text('Como andam as médias pluviométricas de Ariranha este mês?', screenX + 222, screenY + 45);
  
  // AI Response bubble on the left
  doc.roundedRect(screenX + 22, screenY + 70, 390, 42, 3).fill('#022C16');
  doc.roundedRect(screenX + 22, screenY + 70, 390, 42, 3).strokeColor('#FFC72C').lineWidth(0.5).stroke();
  
  doc.fontSize(4.5).font('Helvetica-Bold').fillColor('#FFC72C').text('Coazito AI:', screenX + 27, screenY + 75);
  doc.fontSize(4.5).font('Helvetica').fillColor('#FFFFFF')
     .text('Segundo as planilhas importadas de pluviometria regional, a Usina Ariranha acumula 14.5 mm de chuvas neste período de safra. Isto está dentro do patamar de segurança operacional para frentes de plantio de cana.', screenX + 27, screenY + 83, { width: 380, lineGap: 1 });

  doc.restore();
}


// PAGE GENERATOR 2: Sumário
function generatePage2() {
  writeHeading('1. Sumário & Controle de Versões', 'Tabela de conteúdo estruturada e histórico formal de revisões.');
  writeParagraph('Este documento consolida as especificações funcionais e técnicas da solução desenvolvida sob medida para a Colombo Agroindústria S/A, visando a implantação eficiente do Sistema Integrado COA.');
  
  writeSubHeading('Tópicos Documentados na Proposta:');
  const topics = [
    '1. Sumário & Controle de Versões',
    '2. Objetivo do Sistema & Contexto de Negócio',
    '3. Design Responsivo & Adaptação de Campo',
    '4. Guia de Telas - Aba 1: Monitoramento (Dashboard)',
    '5. Guia de Telas - Aba 2: Plantio (Frotas e PPT)',
    '6. Guia de Telas - Aba 3: Vinhaça (Distribuição Líquida)',
    '7. Guia de Telas - Aba 4: Histórico & Aba 5: Relatórios',
    '8. Guia de Telas - Aba 6: DDS (Segurança Operacional)',
    '9. Guia de Telas - Aba 7: Diário COA & Aba 8: Diário Plantio',
    '10. Guia de Telas - Aba 9: Pluviometria (Upload XLSX)',
    '11. Guia de Telas - Aba 10: Coazito AI (Chatbot Gemini)',
    '12. Arquitetura Lógica do Sistema & C4 Model',
    '13. Fluxogramas BPMN, Permissões RBAC & Supabase',
    '14. APIs do Servidor, Integração SAP & Encerramento'
  ];

  const midPoint = Math.ceil(topics.length / 2);
  const leftColumn = topics.slice(0, midPoint);
  const rightColumn = topics.slice(midPoint);
  
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(ACCENT_GREEN);
  doc.text('ESTRUTURA DE SEÇÕES:', 50, doc.y);
  doc.moveDown(0.4);
  doc.fontSize(8).font('Helvetica').fillColor(TEXT_SLATE);
  
  const startY = doc.y;
  let leftY = startY;
  leftColumn.forEach(topic => {
    doc.text(topic, 50, leftY, { width: 230 });
    leftY += 16;
  });

  let rightY = startY;
  rightColumn.forEach(topic => {
    doc.text(topic, 300, rightY, { width: 235 });
    rightY += 16;
  });

  doc.y = Math.max(leftY, rightY) + 15;

  writeSubHeading('Histórico de Revisões e Controle Operacional:');
  
  drawSimpleTable(
    ['Versão', 'Data', 'Autor', 'Descrição do Status Documental'],
    [
      ['v1.0', '20/07/2026', 'Luiz Ricardo D. Carvalho', 'Versão Inicial. Arquitetura de software completa, modelagem e especificações de frentes PPT e diários.']
    ],
    [50, 75, 140, 230]
  );
}

// PAGE GENERATOR 3: Objetivo do Sistema
function generatePage3() {
  writeHeading('2. Objetivo do Sistema & Contexto de Negócio', 'Alinhamento estratégico, justificativa e valor da solução para as Usinas.');
  
  writeParagraph('A Colombo Agroindústria S/A, como um dos maiores players agroindustriais do Brasil, demanda eficiência operacional em escala em suas três usinas: Ariranha, Palestina e Santa Albertina. O Centro de Operações Agrícolas (COA) atua como o cérebro centralizador das operações de campo, necessitando de uma ferramenta moderna para tomada de decisão ágil.');
  
  writeParagraph('O Sistema Integrado COA foi planejado especificamente para unificar o monitoramento do plantio, tratos culturais e a pluviometria regional, eliminando a descentralização de informações em planilhas Excel soltas e boletins em papel suscetíveis a falhas humanas.');

  writeSubHeading('Pilares de Impacto e Valor Operacional:');
  
  const values = [
    { title: 'Excelência Operacional de Campo:', desc: 'Visualização imediata de rendimentos das plantadoras nas três unidades, permitindo remanejamentos rápidos para garantir as metas diárias de plantio de cana.' },
    { title: 'Pluviometria Estruturada:', desc: 'Importação intuitiva de arquivos XLSX de chuva diretamente para um banco de dados relacional seguro, alimentando relatórios instantâneos e gráficos de precipitação regional por usina.' },
    { title: 'Assistência por IA (Coazito):', desc: 'Uso de inteligência artificial generativa em linguagem natural para responder a dúvidas críticas dos operadores da central sobre moagem, médias históricas de chuva e andamento de metas.' }
  ];

  values.forEach(val => {
    const boxY = doc.y;
    doc.rect(50, boxY, 495, 42).fill(LIGHT_BG);
    doc.rect(50, boxY, 3, 42).fill(PRIMARY_GREEN);
    
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(PRIMARY_GREEN)
       .text(val.title, 60, boxY + 6);
    doc.font('Helvetica').fontSize(8).fillColor(TEXT_SLATE)
       .text(val.desc, 60, boxY + 16, { width: 475, lineGap: 1.5 });
    
    doc.y = boxY + 48;
  });
}

// PAGE GENERATOR 4: Design Responsivo
function drawResponsiveMockup(startX, startY) {
  doc.save();
  
  // 1. DESKTOP MONITOR (Background)
  const deskW = 200;
  const deskH = 110;
  const deskX = startX;
  const deskY = startY;
  
  // Monitor stand
  doc.rect(deskX + deskW/2 - 20, deskY + deskH, 40, 15).fill('#475569');
  doc.rect(deskX + deskW/2 - 30, deskY + deskH + 15, 60, 5).fill('#334155');
  
  // Monitor body
  doc.roundedRect(deskX, deskY, deskW, deskH, 6).fill('#1E293B'); // dark frame
  doc.rect(deskX + 6, deskY + 6, deskW - 12, deskH - 20).fill('#0F172A'); // screen
  doc.rect(deskX + 6, deskY + deskH - 14, deskW - 12, 8).fill('#1E293B'); // bottom bezel
  
  // Desktop UI elements (charts, sidebar)
  // Sidebar (emerald)
  doc.rect(deskX + 8, deskY + 8, 25, deskH - 24).fill('#022C16');
  doc.circle(deskX + 20, deskY + 16, 4).fill('#FFC72C'); // user icon
  
  // Cards
  doc.rect(deskX + 38, deskY + 10, 45, 25).fill('#1E293B'); // KPI card 1
  doc.rect(deskX + 38, deskY + 10, 2, 25).fill('#FFC72C');
  doc.rect(deskX + 88, deskY + 10, 45, 25).fill('#1E293B'); // KPI card 2
  doc.rect(deskX + 88, deskY + 10, 2, 25).fill('#00843D');
  doc.rect(deskX + 138, deskY + 10, 48, 25).fill('#1E293B'); // KPI card 3
  doc.rect(deskX + 138, deskY + 10, 2, 25).fill('#3B82F6');

  // Main Chart
  doc.rect(deskX + 38, deskY + 40, 148, 42).fill('#1E293B');
  // Draw mini line chart inside Main Chart
  doc.moveTo(deskX + 44, deskY + 70)
     .lineTo(deskX + 70, deskY + 50)
     .lineTo(deskX + 100, deskY + 65)
     .lineTo(deskX + 130, deskY + 45)
     .lineTo(deskX + 160, deskY + 55)
     .lineTo(deskX + 180, deskY + 48)
     .strokeColor('#00843D')
     .lineWidth(1.5)
     .stroke();
  
  // 2. TABLET (Middle-ground, overlapping)
  const tabW = 85;
  const tabH = 110;
  const tabX = startX + 150;
  const tabY = startY + 20;
  
  // Tablet body
  doc.roundedRect(tabX, tabY, tabW, tabH, 8).fill('#334155'); // bezel
  doc.rect(tabX + 4, tabY + 4, tabW - 8, tabH - 8).fill('#0F172A'); // screen
  
  // Tablet UI
  doc.rect(tabX + 8, tabY + 8, tabW - 16, 12).fill('#022C16'); // header
  doc.rect(tabX + 8, tabY + 24, tabW - 16, 25).fill('#1E293B'); // map placeholder
  doc.circle(tabX + tabW/2, tabY + 36, 6).fill('#FFC72C'); // node on map
  
  doc.rect(tabX + 8, tabY + 54, tabW - 16, 20).fill('#1E293B'); // card 1
  doc.rect(tabX + 8, tabY + 78, tabW - 16, 20).fill('#1E293B'); // card 2
  
  // 3. MOBILE SMARTPHONE (Foreground, overlapping)
  const mobW = 50;
  const mobH = 85;
  const mobX = startX + 210;
  const mobY = startY + 50;
  
  // Mobile body
  doc.roundedRect(mobX, mobY, mobW, mobH, 6).fill('#1E293B'); // frame
  doc.rect(mobX + 2, mobY + 2, mobW - 4, mobH - 4).fill('#0F172A'); // screen
  
  // Mobile UI
  doc.rect(mobX + 4, mobY + 4, mobW - 8, 10).fill('#022C16'); // header
  doc.rect(mobX + 4, mobY + 16, mobW - 8, 20).fill('#1E293B'); // KPI card
  doc.rect(mobX + 4, mobY + 40, mobW - 8, 11).fill('#1E293B'); // list item 1
  doc.rect(mobX + 4, mobY + 54, mobW - 8, 11).fill('#1E293B'); // list item 2
  
  doc.restore();
}

function generatePage4() {
  writeHeading('3. Design Responsivo & Adaptação de Campo', 'Visualização de alta densidade se adaptando a desktops, tablets e celulares.');
  
  writeParagraph('Para atender à dinâmica das frentes agrícolas, onde os dispositivos variam drasticamente de acordo com a função do colaborador, a aplicação do COA Colombo foi concebida sob o conceito Mobile-First com grades fluídas altamente flexíveis.');

  writeParagraph('O layout suporta de forma nativa a exibição unificada em painéis de monitoramento (Video Walls) da central do COA, tablets operacionais transportados por fiscais dentro de picapes, e smartphones pessoais de colaboradores autorizados.');

  writeSubHeading('Representação Esquemática da Adaptação de Interfaces:');

  // Draw responsive mockup
  const mockY = doc.y + 10;
  drawResponsiveMockup(130, mockY);
  
  doc.y = mockY + 130; // Spacing after mockup
  doc.moveDown(0.5);

  writeParagraph('Isso garante a democratização do fluxo de informações e elimina barreiras físicas de comunicação, permitindo que fiscais tomem ações corretivas rápidas no talhão de Ariranha antes do término do turno.');
}

// PAGE GENERATOR 5: ABA 1 - MONITORAMENTO
function generatePage5() {
  writeHeading('4. Guia de Telas - Aba 1: Painel de Monitoramento', 'Visão em tempo real de frentes operacionais ativas e KPIs de eficiência.');
  writeParagraph('A aba de `Monitoramento` serve como a central de comando operacional. Ela permite aos gestores acompanhar quais frentes de plantio de cana estão ativas e o seu desempenho consolidado em tempo real.');
  
  writeParagraph('Esta tela é subdividida em duas sub-abas integradas: `Frentes` (que lista frentes ativas e a produtividade de cada local) e `Dashboard` (que agrega gráficos em barras e área comparativos de metas físicas).');

  writeSubHeading('Representação Esquemática do Painel de Monitoramento Geral:');

  const screenY = doc.y + 10;
  drawMonitoramentoMockup(60, screenY, 475, 135);
  doc.y = screenY + 150;

  writeSubHeading('Integração de Endpoint e Operações:');
  writeParagraph('Essa tela consome o endpoint GET `/api/frentes/plantio` para carregar dinamicamente o status operacional das plantadoras e tratores John Deere alocados, permitindo remanejamentos imediatos pela mesa de tecnologia do COA.');
}

// PAGE GENERATOR 6: ABA 2 - PLANTIO
function generatePage6() {
  writeHeading('5. Guia de Telas - Aba 2: Módulo de Plantio', 'Gerenciamento de frota agrícola e planejamento de frentes PPT.');
  writeParagraph('A aba de `Plantio` é focada na gestão de ativos e frentes. É através deste painel que o supervisor pode registrar novas plantadoras, tratores, caminhões transbordo e alocá-los a frentes específicas em Ariranha, Palestina ou Santa Albertina.');
  
  writeParagraph('O sistema disponibiliza modais interativos para cadastrar novos equipamentos de forma ágil e atribuir metas de rendimento físico (hectares por dia) para cada maquinário operante em campo.');

  writeSubHeading('Representação Esquemática da Gestão de Plantio:');

  const screenY = doc.y + 10;
  drawPlantioMockup(60, screenY, 475, 135);
  doc.y = screenY + 150;

  writeSubHeading('Integração de Endpoint e Operações:');
  writeParagraph('Utiliza os endpoints POST `/api/frotas` para gravação de novos maquinários agrícolas no banco Supabase e POST `/api/frentes` para a criação de frentes de trabalho. Os dados alimentam diretamente os relatórios integrados com o SAP.');
}

// PAGE GENERATOR 7: ABA 3 - VINHAÇA
function generatePage7() {
  writeHeading('6. Guia de Telas - Aba 3: Gestão de Vinhaça', 'Controle operacional do módulo de distribuição de vinhaça.');
  writeParagraph('O módulo de `Vinhaça` provê governança sobre a frota de despacho e distribuição líquida. É crucial para o controle de dosagem NPK em solo agrícola, monitoramento dos níveis das caixas de vinhaça nas usinas e registro de viagens dos caminhões tanque.');
  
  writeParagraph('Com ele, a mesa de logística controla a volumetria de caixas e assegura que os limites agrícolas e ambientais sejam estritamente respeitados, evitando a contaminação ou sobrecarga hídrica nos canaviais.');

  writeSubHeading('Representação do Painel Operacional de Vinhaça:');

  const screenY = doc.y + 10;
  drawVinhacaMockup(60, screenY, 475, 135);
  doc.y = screenY + 150;

  writeSubHeading('Integração de Endpoint e Funções da Aba:');
  writeParagraph('Este módulo se integra aos endpoints GET `/api/vinhaca/status` (para coleta dos níveis hidráulicos por telemetria e frotas ativas) e POST `/api/vinhaca/apontamento` (para registro de viagens e auditoria de vazão líquida de K2O em talhões cadastrados). Em celulares de motoristas, serve como um guia simples de entrega.');
}

// PAGE GENERATOR 8: ABA 4 & ABA 5 - HISTÓRICO E RELATÓRIOS
function generatePage8() {
  writeHeading('7. Guia de Telas - Abas 4 & 5: Histórico & Relatórios', 'Auditoria completa de logs de transações e central de fechamentos.');
  writeParagraph('Para manter a rastreabilidade absoluta de todas as alterações feitas na operação de campo, a aba de `Histórico` grava logs de auditoria automatizados. Cada cadastro, exclusão, troca de status de trator ou observação inserida por operadores gera uma linha de transação imutável registrada no banco relacional.');
  
  writeParagraph('Paralelamente, a aba de `Relatórios` provê uma central de fechamento operacional. Ela permite exportar boletins e planilhas fechadas contendo dados de rendimento físico consolidado das usinas, que podem ser encaminhados formalmente via e-mail ou integrados ao ERP SAP da Colombo.');

  writeSubHeading('Mapeamento de Logs e Segurança Operacional:');
  writeBulletPoints([
    'Histórico Rastreável: Registro de modificações com timestamp UTC, usuário responsável e usina semente.',
    'Classificação de Filtros: Filtros inteligentes por Tipo de Log (Cadastros, Status, Observações, Excluídos).',
    'Exportação Consolidada: Geração dinâmica de planilhas operacionais e dados estruturados JSON para contabilidade e planejamento agrícola.'
  ]);

  writeSubHeading('Exemplo de Rota de Integração de Logs:');
  writeParagraph('Os logs operacionais de auditoria são gerenciados via endpoint GET `/api/logs` e as exportações do fechamento diário são disparadas via GET `/api/relatorios/exportar` para auditoria do Centro de Operações Agrícolas.');
}

// PAGE GENERATOR 9: ABA 6 - DDS
function generatePage9() {
  writeHeading('8. Guia de Telas - Aba 6: Segurança (DDS)', 'Diálogo Diário de Segurança e conscientização de frentes.');
  writeParagraph('A aba de `DDS` (Diálogo Diário de Segurança) provê um repositório formal de orientações e circulares diárias de SMS (Segurança, Meio Ambiente e Saúde). Tratoristas, motoristas e ajudantes de campo são integrados a essa rotina para mitigar acidentes de trabalho nas usinas.');
  
  writeParagraph('A cada dia, um novo tema crítico (ex: direção defensiva em estradas rurais, operação em declives, manuseio seguro de vinhaça) é disponibilizado no painel, permitindo a coleta eletrônica de assinaturas eletrônicas das frentes.');

  writeSubHeading('Representação da Interface de DDS:');

  const screenY = doc.y + 10;
  drawDdsMockup(60, screenY, 475, 135);
  doc.y = screenY + 150;

  writeSubHeading('Integração de Endpoint e Funções da Aba:');
  writeParagraph('A aba DDS utiliza o endpoint GET `/api/dds/temas` para listar orientações de saúde e segurança pré-carregadas pelo time corporativo de SMS da Colombo, e POST `/api/dds/assinatura` para coletar as assinaturas e o aceite eletrônico das frentes de plantio. Essa validação é essencial para auditorias externas.');
}

// PAGE GENERATOR 10: ABA 7 & ABA 8 - DIÁRIO COA & DIÁRIO PLANTIO
function generatePage10() {
  writeHeading('9. Guia de Telas - Abas 7 & 8: Diários Operacionais', 'Lançamento de produção do COA e controle de plantio mecanizado.');
  writeParagraph('A aba de `DIÁRIO COA` funciona como o caderno eletrônico principal de lançamentos da central. Nela, os assistentes do Centro de Operações Agrícolas digitam diariamente os dados consolidados de moagem (toneladas de cana entregues), rendimento geral de frentes e ocorrências mecânicas de cada usina.');
  
  writeParagraph('A aba de `DIÁRIO PLANTIO` é focada exclusivamente na operação de plantio mecanizado. Registra-se o andamento físico de cada frente de plantio, a profundidade de sulcação, espaçamentos aplicados e o consumo de mudas por hectare, garantindo a qualidade agronômica exigida pelaColombo.');

  writeSubHeading('Resumo de Parâmetros Registrados nos Diários:');
  writeBulletPoints([
    'Métricas do Diário COA: Moagem diária (t), frotas ativas, consumo de combustível das colhedoras, horas mecânicas paradas e perdas de tempo por clima.',
    'Métricas do Diário Plantio: Hectares plantados por trator/frente, consumo médio de gema de cana, velocidade média de plantio e índice de falhas de cobrição.',
    'Sincronia do Turno: Lançamento em 3 turnos rotativos, permitindo a comparação automática de produtividade inter-equipes.'
  ]);

  writeSubHeading('Endpoints de Diários:');
  writeParagraph('Comunica-se com os endpoints POST `/api/diario/coa` (para moagem e dados gerais) e POST `/api/diario/plantio` (para estatísticas específicas do plantio mecanizado), persistindo os dados de forma consolidada no Supabase.');
}

// PAGE GENERATOR 11: ABA 9 - PLUVIOMETRIA
function generatePage11() {
  writeHeading('10. Guia de Telas - Aba 9: Pluviometria Regional', 'Importação estruturada de chuvas e monitoramento de precipitação.');
  writeParagraph('A aba de `Pluviometria` foi desenhada para resolver o problema de descentralização histórica de dados de chuva. Nela, o assistente pode fazer o upload manual ou arrastar planilhas Excel (.xlsx) contendo os índices de chuvas diários medidos nas bacias de Ariranha, Palestina e Santa Albertina.');
  
  writeParagraph('O sistema processa o arquivo no servidor Node.js, valida a integridade das colunas e renderiza instantaneamente o gráfico comparativo de milímetros acumulados por usina na bacia regional.');

  writeSubHeading('Representação da Interface Pluviométrica:');

  const screenY = doc.y + 10;
  drawPluviometriaMockup(60, screenY, 475, 135);
  doc.y = screenY + 150;

  writeSubHeading('Integração de Endpoint e Funções da Aba:');
  writeParagraph('Essa aba comunica-se com os endpoints GET `/api/chuva` (para renderização dos gráficos comparativos em tempo real via biblioteca Recharts no frontend) e POST `/api/chuva/importar`. Este último processa a planilha enviada, valida as linhas e persiste os milímetros coletados no banco de dados, recalculando todas as métricas instantaneamente.');
}

// PAGE GENERATOR 12: ABA 10 - COAZITO AI
function generatePage12() {
  writeHeading('11. Guia de Telas - Aba 10: Chatbot Coazito AI', 'Inteligência Artificial conectada para insights rápidos de dados.');
  writeParagraph('A aba `Coazito` é alimentada pelo modelo cognitivo da Gemini API. Ela permite aos gestores e supervisores da Colombo extrair relatórios, médias de chuvas históricas e desempenho de frentes agrícolas em linguagem natural simples.');
  
  writeParagraph('Através de um fluxo inteligente no servidor backend, a pergunta do usuário é enriquecida com o contexto consolidado de banco de dados (estatísticas de metas, frotas operantes e chuvas acumuladas), garantindo respostas precisas e livres de alucinações.');

  writeSubHeading('Representação da Interface de Chat do Coazito:');

  const screenY = doc.y + 10;
  drawCoazitoMockup(60, screenY, 475, 135);
  doc.y = screenY + 150;

  writeSubHeading('Integração de Endpoint e Funções da Aba:');
  writeParagraph('O Coazito AI se comunica diretamente com o endpoint POST `/api/chat`. No backend Express, a mensagem do usuário é contextualizada juntamente aos dados consolidados das bacias agrícolas e, através da biblioteca oficial `@google/genai` (utilizando a chave secreta `GEMINI_API_KEY` guardada no servidor), gera-se uma resposta técnica objetiva.');
}

// PAGE GENERATOR 13: C4 MODEL
function generatePage13() {
  writeHeading('12. Arquitetura Lógica do Sistema & C4 Model', 'Projeto lógico de sistemas e fluxo integrado de dados entre componentes.');
  writeParagraph('A solução adota padrões modernos de arquitetura web cliente-servidor (SPA - Single Page Application), projetada para operar em alta velocidade sob redes de baixa conectividade em frentes agrícolas ou em grandes Video Walls centrais na Colombo.');

  writeSubHeading('Arquitetura de Contêineres (Modelagem C4 Nível 2):');
  
  // DRAW HIGH FIDELITY VECTOR DIAGRAM INSTEAD OF OVERLAPPING ASCII ART!
  doc.save();
  
  // Core box dimensions
  const boxW = 125;
  const boxH = 65;
  const startYDiag = doc.y + 10;

  // Box 1: React UI
  doc.roundedRect(50, startYDiag, boxW, boxH, 4).fill(LIGHT_BG);
  doc.roundedRect(50, startYDiag, boxW, boxH, 4).strokeColor(ACCENT_GREEN).lineWidth(1.5).stroke();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(PRIMARY_GREEN).text('React Frontend', 58, startYDiag + 10);
  doc.font('Helvetica').fontSize(7.5).fillColor(TEXT_SLATE).text('Painel SPA Responsivo\nTailwind & Recharts', 58, startYDiag + 22, { width: 110, lineGap: 1.5 });

  // Arrow 1 -> 2
  doc.moveTo(175, startYDiag + boxH / 2).lineTo(235, startYDiag + boxH / 2).strokeColor(MUTED_GRAY).lineWidth(1).stroke();
  doc.moveTo(235, startYDiag + boxH / 2).lineTo(230, startYDiag + boxH / 2 - 4).lineTo(230, startYDiag + boxH / 2 + 4).fill(MUTED_GRAY);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED_GRAY).text('HTTPS / JSON', 182, startYDiag + boxH / 2 - 12);

  // Box 2: Express Backend
  doc.roundedRect(235, startYDiag, boxW, boxH, 4).fill('#01381D');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFFFFF').text('Express Backend', 243, startYDiag + 10);
  doc.font('Helvetica').fontSize(7.5).fillColor('#E2E8F0').text('Node.js Server\nAPIs & XLSX Parser', 243, startYDiag + 22, { width: 110, lineGap: 1.5 });

  // Arrow 2 -> 3
  doc.moveTo(360, startYDiag + boxH / 2).lineTo(420, startYDiag + boxH / 2).strokeColor(MUTED_GRAY).lineWidth(1).stroke();
  doc.moveTo(420, startYDiag + boxH / 2).lineTo(415, startYDiag + boxH / 2 - 4).lineTo(415, startYDiag + boxH / 2 + 4).fill(MUTED_GRAY);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED_GRAY).text('gRPC / SQL', 370, startYDiag + boxH / 2 - 12);

  // Box 3: PostgreSQL Database
  doc.roundedRect(420, startYDiag, boxW, boxH, 4).fill('#022C16');
  doc.roundedRect(420, startYDiag, boxW, boxH, 4).strokeColor('#FFC72C').lineWidth(1).stroke();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FFC72C').text('Supabase DB', 428, startYDiag + 10);
  doc.font('Helvetica').fontSize(7.5).fillColor('#FFFFFF').text('PostgreSQL Relacional\nPolíticas RLS ativas', 428, startYDiag + 22, { width: 110, lineGap: 1.5 });

  doc.restore();
  
  doc.y = startYDiag + boxH + 25;

  writeSubHeading('Justificativa Tecnológica (Decisões de Projeto):');
  writeBulletPoints([
    'Camada de Dados Relacional: PostgreSQL (Supabase) provê consistência transacional forte (ACID) indispensável para o registro de metas de toneladas de cana moídas e fechamento diário de apontamentos de chuva por usinas.',
    'Construção Compacta: O servidor Express e o React SPA são compilados num bundle estático leve, garantindo tempos de carregamento curtos mesmo sob conexão rural de satélite (Starlink) ou redes de dados celulares limitadas (4G rural).'
  ]);
}

// PAGE GENERATOR 14: FLOWCHARTS & RBAC
function generatePage14() {
  writeHeading('13. Fluxogramas de Trabalho BPMN & Permissões', 'Coreografia do fluxo de apontamento de boletins e segurança RBAC.');
  writeParagraph('A modelagem sob os padrões BPMN garante a sincronia perfeita das operações no COA. O fluxo estruturado do Diário Operacional de Frentes de Plantio descreve os passos operacionais de ponta a ponta:');

  writeSubHeading('Fluxograma do Processo: Fechamento de Turno COA:');

  // DRAW FLOWCHART USING HIGH-QUALITY VECTOR SHAPES INSTEAD OF TEXT LAYERS!
  doc.save();
  const boxW = 85;
  const boxH = 40;
  const stepY = doc.y + 10;
  const steps = [
    { text: 'Início do Turno\nOperador COA', x: 50 },
    { text: 'Sincronizar\nTelemetria', x: 150 },
    { text: 'Digitar Boletim\nde Campo', x: 250 },
    { text: 'Análise de Metas\n& Alertas', x: 350 },
    { text: 'Homologar no\nSistema & SAP', x: 450 }
  ];

  steps.forEach((step, idx) => {
    // Draw step box
    doc.roundedRect(step.x, stepY, boxW, boxH, 4).fill(LIGHT_BG);
    doc.roundedRect(step.x, stepY, boxW, boxH, 4).strokeColor(idx === 3 ? '#EAB308' : ACCENT_GREEN).lineWidth(1).stroke();
    
    doc.fontSize(7).font('Helvetica-Bold').fillColor(PRIMARY_GREEN);
    doc.text(step.text, step.x + 4, stepY + 10, { width: boxW - 8, align: 'center', lineGap: 1.5 });
    
    // Draw connecting arrow if not the last step
    if (idx < steps.length - 1) {
      const arrowStartX = step.x + boxW;
      const arrowEndX = steps[idx + 1].x;
      doc.moveTo(arrowStartX, stepY + boxH / 2).lineTo(arrowEndX, stepY + boxH / 2).strokeColor(MUTED_GRAY).lineWidth(1).stroke();
      doc.moveTo(arrowEndX, stepY + boxH / 2).lineTo(arrowEndX - 4, stepY + boxH / 2 - 3).lineTo(arrowEndX - 4, stepY + boxH / 2 + 3).fill(MUTED_GRAY);
    }
  });

  doc.restore();
  
  doc.y = stepY + boxH + 20;

  writeSubHeading('Tabela de Perfis de Acesso e Permissões (RBAC):');

  drawSimpleTable(
    ['Perfil de Usuário', 'Leitura Autorizada', 'Escrita Autorizada', 'Ações Críticas Permitidas'],
    [
      ['Administrador', 'Todos os painéis e logs', 'Todos os dados', 'Cadastrar operadores, alterar metas fiscais, limpar histórico'],
      ['Supervisor Turno', 'Todos os painéis', 'Frentes de plantio', 'Sincronizar dados com SAP, aprovar desvios de metas'],
      ['Auxiliar COA', 'Frentes, Pluviometria', 'Pluviometria, Chuva', 'Importar planilhas Excel de chuva, lançar boletins diários'],
      ['Diretoria', 'Dashboards executivos', 'Nenhum', 'Exportar relatórios em formato PDF e estatísticas consolidadas']
    ],
    [90, 120, 120, 165]
  );
}

// PAGE GENERATOR 15: APIs & SIGNATURE
function generatePage15() {
  writeHeading('14. APIs do Servidor, Integração SAP & Homologação', 'Sincronização de sistemas corporativos e termo formal de encerramento.');
  
  writeParagraph('Para operar de forma integrada com os demais sistemas corporativos da Colombo Agroindústria S/A, o sistema do COA disponibiliza um barramento unificado de APIs JSON e fluxos estruturados de homologação.');

  writeSubHeading('Rotas de APIs Oficiais do Servidor COA:');
  
  const apis = [
    { m: 'GET', p: '/api/chuva', d: 'Retorna a série histórica pluviométrica regional das usinas.' },
    { m: 'POST', p: '/api/chuva/importar', d: 'Processa planilha XLSX de chuva e persiste no Supabase.' },
    { m: 'POST', p: '/api/frentes/apontamento', d: 'Grava novos apontamentos de boletins das frentes.' },
    { m: 'POST', p: '/api/chat', d: 'Consome a inteligência artificial do Coazito AI via Gemini.' }
  ];

  apis.forEach(api => {
    const boxY = doc.y;
    doc.rect(50, boxY, 495, 20).fill(LIGHT_BG);
    doc.rect(50, boxY, 3, 20).fill(PRIMARY_GREEN);
    
    doc.font('Helvetica-Bold').fontSize(8).fillColor(PRIMARY_GREEN).text(api.m, 60, boxY + 5);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(TEXT_SLATE).text(api.p, 100, boxY + 5);
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(MUTED_GRAY).text(api.d, 230, boxY + 5, { width: 310 });
    
    doc.y = boxY + 23;
  });

  doc.moveDown(0.3);

  writeParagraph('Por meio deste termo, formaliza-se a conclusão e entrega do **Sistema Integrado COA - Monitoramento PPT & Diário Operacional (v1.0)** para a **Colombo Agroindústria S/A**, atestando sua estabilidade técnica e prontidão.');

  writeSubHeading('ASSINATURAS DE ACEITE TÉCNICO:');
  doc.moveDown(0.2);
  
  doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_SLATE);
  doc.text('Luiz Ricardo Dominguês Carvalho', 50, doc.y);
  doc.fontSize(8).font('Helvetica').fillColor(MUTED_GRAY);
  doc.text('Responsável Técnico / Analista Logística Agroind. JR', 50, doc.y);
  doc.text('Mesa de Tecnologia COA • Data do Aceite: 20 de Julho de 2026', 50, doc.y);

  doc.moveDown(1.2);
  doc.moveTo(50, doc.y).lineTo(250, doc.y).strokeColor(TEXT_SLATE).lineWidth(0.8).stroke();
  doc.moveDown(0.1);
  doc.fontSize(7.5).font('Helvetica-Oblique').fillColor(MUTED_GRAY).text('Assinatura Eletrônica do Autor (Token de Certificado Digital COA)', 50, doc.y);
  
  // Seal graphic
  doc.save();
  doc.circle(460, 680, 42).strokeColor('#FFC72C').lineWidth(1.5).stroke();
  doc.circle(460, 680, 37).strokeColor('rgba(255, 199, 44, 0.15)').lineWidth(1).stroke();
  doc.fontSize(6).font('Helvetica-Bold').fillColor('#FFC72C')
     .text('PRODUTO', 420, 665, { width: 80, align: 'center' })
     .text('HOMOLOGADO', 420, 675, { width: 80, align: 'center' })
     .text('COLOMBO S/A', 420, 685, { width: 80, align: 'center' })
     .fontSize(5).font('Helvetica').fillColor('#FFFFFF')
     .text('COA v1.0 - 2026', 420, 695, { width: 80, align: 'center' });
  doc.restore();
}

// ==================== GENERATING PAGES SEQUENTIALLY ====================

// Page 1: Cover Page
drawCoverPage();

// Page 2: Sumário & Controle de Versões
doc.addPage();
generatePage2();

// Page 3: Objetivo do Sistema
doc.addPage();
generatePage3();

// Page 4: Design Responsivo
doc.addPage();
generatePage4();

// Page 5: Aba 1 - Monitoramento
doc.addPage();
generatePage5();

// Page 6: Aba 2 - Plantio
doc.addPage();
generatePage6();

// Page 7: Aba 3 - Vinhaça (Print 1 exact match!)
doc.addPage();
generatePage7();

// Page 8: Aba 4 & Aba 5 - Histórico e Relatórios
doc.addPage();
generatePage8();

// Page 9: Aba 6 - DDS
doc.addPage();
generatePage9();

// Page 10: Aba 7 & Aba 8 - Diários Operacionais
doc.addPage();
generatePage10();

// Page 11: Aba 9 - Pluviometria (Print 2 exact match!)
doc.addPage();
generatePage11();

// Page 12: Aba 10 - Coazito AI
doc.addPage();
generatePage12();

// Page 13: C4 Model
doc.addPage();
generatePage13();

// Page 14: BPMN & RBAC
doc.addPage();
generatePage14();

// Page 15: APIs & Signature
doc.addPage();
generatePage15();

// Execute Header and Footer generation over all buffers
generateHeaderFooter();

// Finalize the PDF document
doc.end();

console.log('PDF gerado com sucesso!');
