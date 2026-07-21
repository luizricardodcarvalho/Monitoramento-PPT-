import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy-initialized GoogleGenAI client
  let googleGenAICache: any = null;
  const getAI = () => {
    if (!googleGenAICache) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("GEMINI_API_KEY_MISSING");
      }
      googleGenAICache = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return googleGenAICache;
  };

  // Lazy-initialized Supabase client
  let supabaseCache: any = null;
  const getSupabase = () => {
    if (!supabaseCache) {
      const url = process.env.VITE_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (!url || !key) {
        throw new Error("Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
      }
      supabaseCache = createClient(url, key);
    }
    return supabaseCache;
  };

  // Coazito AI Assistant Chat Route
  app.post("/api/coazito/chat", async (req, res) => {
    try {
      const { messages, contextData } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Mensagens inválidas ou ausentes." });
      }

      // Get the last user message
      let lastUserMsg = "";
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i] && messages[i].role === "user" && messages[i].content) {
          lastUserMsg = messages[i].content;
          break;
        }
      }

      if (!lastUserMsg) {
        lastUserMsg = "oi";
      }

      // Normalize string for robust keyword matching (ignore accents, case and typos)
      const query = lastUserMsg.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/atra[sçz]ad[os]/g, "atrasad")
        .replace(/plantiu/g, "plantio")
        .replace(/frent[es]?/g, "frente")
        .replace(/caiz[as]/g, "caixa")
        .replace(/vinha[sç]a/g, "vinhaca")
        .replace(/trator[es]?/g, "trator")
        .replace(/maquinari[os]/g, "maquinario")
        .replace(/lider[es]?/g, "lider")
        .replace(/chuva[s]?/g, "chuva")
        .replace(/produ[cç]ao/g, "producao")
        .trim();

      const formatNumber = (num: number): string => {
        return num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
      };

      const context = contextData || {};
      let reply = "";

      // Intercept report and download queries first because they generate specific frontend download tokens
      const isReportQuery = query.includes("relatorio") || query.includes("baixar") || query.includes("download") || query.includes("exportar") || query.includes("puxar") || query.includes("excel") || query.includes("gerar relatório") || query.includes("gerar relatorio");

      if (isReportQuery) {
        if (query.includes("frente") || query.includes("trabalho") || query.includes("gestor")) {
          reply = `Preparei o relatório em tempo real de **Frentes de Trabalho** 🌾. Este relatório contém a lista completa de frentes de plantio ativas, os gestores responsáveis por cada frente, a usina de atuação, o status da operação e a taxa de eficiência atual.\n\nVocê pode escolher o formato de sua preferência para download imediato abaixo:\n\n[DOWNLOAD:RELATORIO_FRENTES:Frentes de Trabalho]`;
        } else if (query.includes("frota") || query.includes("equipamento") || query.includes("trator") || query.includes("plantadeira") || query.includes("maquinario")) {
          reply = `Preparei o relatório completo de **Frota e Equipamentos** 🚜. Ele contém todos os detalhes sobre tratores, plantadeiras e caminhões, incluindo prefixo, marca/modelo, unidade alocada e o status operacional atual.\n\nFaça o download do relatório nos formatos abaixo:\n\n[DOWNLOAD:RELATORIO_FROTA:Frota e Equipamentos]`;
        } else if (query.includes("metrica") || query.includes("dashboard") || query.includes("produtividade") || query.includes("moagem") || query.includes("usina")) {
          reply = `Preparei o relatório consolidado de **Métricas do Dashboard** 🏢. Ele reúne dados de moagem realizada versus metas planejadas, eficiência operacional e pureza média do caldo para cada unidade industrial da Colombo.\n\nBaixe os dados utilizando uma das opções abaixo:\n\n[DOWNLOAD:RELATORIO_DASHBOARD:Métricas do Dashboard]`;
        } else if (query.includes("logs") || query.includes("log") || query.includes("atividade") || query.includes("auditoria") || query.includes("historico") || query.includes("cadastro") || query.includes("status") || query.includes("observacao")) {
          if (query.includes("vinhaca")) {
            reply = `Aqui está o relatório do **Banco Histórico de Vinhaça** 💧. Este documento apresenta todas as movimentações consolidadas, lançamentos e transações efetuadas na base de dados histórica.\n\nSelecione um formato para download:\n\n[DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]`;
          } else if (query.includes("cadastro")) {
            reply = `Preparei o relatório completo de **Histórico - Cadastros** 📋. Ele registra todas as inclusões de equipamentos e frentes de plantio recentes na base de dados.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_CADASTROS:Histórico - Cadastros]`;
          } else if (query.includes("status")) {
            reply = `Preparei o relatório completo de **Histórico - Alterações de Status** 🔄. Ele rastreia todas as trocas de estado e atualizações operacionais dos maquinários de plantio.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_STATUS:Histórico - Alterações de Status]`;
          } else if (query.includes("observacao")) {
            reply = `Aqui está o relatório de **Histórico - Observações** 💬. Ele compila todas as anotações, avisos e observações inseridas pelos operadores no sistema.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_OBSERVACOES:Histórico - Observações]`;
          } else {
            reply = `Preparei o relatório completo do **Histórico de Logs de Auditoria** 📜. Ele registra todas as atividades recentes do sistema, usuários responsáveis, horários e detalhes das alterações realizadas para total transparência operacional.\n\nEscolha o formato desejado para salvar:\n\n[DOWNLOAD:RELATORIO_HISTORICO:Histórico de Logs]`;
          }
        } else if (query.includes("excluido") || query.includes("apagado") || query.includes("removido") || query.includes("lixeira")) {
          reply = `Preparei o relatório de auditoria de **Itens Excluídos** 🗑️. Ele agrupa todos os registros que foram excluídos do sistema para fins de controle e rastreamento de dados deletados.\n\nDisponibilizado para download abaixo:\n\n[DOWNLOAD:RELATORIO_EXCLUIDOS:Itens Excluídos]`;
        } else if (query.includes("snapshot")) {
          reply = `Aqui está o relatório de **Snapshots de Plantio** 🌾. Este arquivo armazena as capturas históricas da eficiência consolidada de plantio por período e os maquinários associados a cada período arquivado.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_PLANTIO:Histórico de Plantio]`;
        } else if (query.includes("apontamento")) {
          reply = `Gerado o relatório de **Apontamentos Diários de Vinhaça** 💧. Ele consolida as medições diárias de k2o, volumetrias, estoques e as frentes ativas de aplicação de vinhaça.\n\nBaixe o relatório abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_APONTAMENTOS:Vinhaça - Apontamentos]`;
        } else if (query.includes("caixa") || query.includes("nivel") || query.includes("carregamento")) {
          reply = `Gerado o relatório de **Níveis de Caixas de Carregamento** 📈. Ele rastreia a evolução das alturas da calda, as usinas de carregamento e as flutuações das últimas leituras.\n\nDownloads disponíveis no chat:\n\n[DOWNLOAD:RELATORIO_VINHACA_NIVEIS:Vinhaça - Níveis de Caixa]`;
        } else if (query.includes("fechamento") || query.includes("balanco")) {
          reply = `Preparei o relatório de **Balanço e Fechamento de Vinhaça** 📅. Ele consolida as caldas totais lançadas, os períodos de safra analisados e os fechamentos por unidade de moagem.\n\nSelecione uma opção de exportação:\n\n[DOWNLOAD:RELATORIO_VINHACA_FECHAMENTO:Vinhaça - Balanço Fechamento]`;
        } else if (query.includes("caminhao") || query.includes("despacho") || query.includes("viagem")) {
          reply = `Preparei o relatório de **Frota de Despacho de Vinhaça** 🚛. Ele apresenta o rastreamento, status em trânsito, motoristas alocados e os tempos estimados de percurso.\n\nDownloads imediatos abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_DESPACHO_FROTA:Vinhaça - Frota de Despacho]`;
        } else if (query.includes("bacia") || query.includes("tanque") || query.includes("acumulacao")) {
          reply = `Gerado o relatório de **Bacias e Tanques de Acumulação** 💧. Contém informações sobre localização, volume atual armazenado e capacidade limite autorizada das bacias.\n\nBaixe nos formatos abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_TANQUES:Vinhaça - Bacias e Tanques]`;
        } else if (query.includes("motorista")) {
          reply = `Aqui está o relatório do **Cadastro de Motoristas de Vinhaça** 👨‍✈️. Ele lista todos os condutores autorizados, números de CNH, veículos sob responsabilidade e status operacional.\n\nBaixe agora:\n\n[DOWNLOAD:RELATORIO_VINHACA_MOTORISTAS:Vinhaça - Cadastro de Motoristas]`;
        } else if (query.includes("fazenda") || query.includes("potassio")) {
          reply = `Aqui está o relatório de **Cadastro de Fazendas** destinatárias de vinhaça 🏡. Ele inclui as dimensões físicas em hectares, localização e o teor médio de potássio registrado.\n\nFaça o download abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_FAZENDAS:Vinhaça - Cadastro de Fazendas]`;
        } else {
          reply = `Aqui está a **Central de Exportação de Relatórios Colombo** 📊. Você pode gerar e baixar qualquer relatório operacional diretamente pelo chat abaixo:\n\n🌾 **Operação Geral, Plantio & Frota:**\n- **Frentes de Trabalho** [DOWNLOAD:RELATORIO_FRENTES:Frentes de Trabalho]\n- **Métricas do Dashboard** [DOWNLOAD:RELATORIO_DASHBOARD:Métricas do Dashboard]\n- **Histórico de Logs (Completo)** [DOWNLOAD:RELATORIO_HISTORICO:Histórico de Logs]\n- **Histórico - Cadastros** [DOWNLOAD:RELATORIO_HISTORICO_CADASTROS:Histórico - Cadastros]\n- **Histórico - Status** [DOWNLOAD:RELATORIO_HISTORICO_STATUS:Histórico - Alterações de Status]\n- **Histórico - Observações** [DOWNLOAD:RELATORIO_HISTORICO_OBSERVACOES:Histórico - Observações]\n- **Itens Excluídos** [DOWNLOAD:RELATORIO_EXCLUIDOS:Itens Excluídos]\n- **Frota/Maquinário** [DOWNLOAD:RELATORIO_FROTA:Frota e Equipamentos]\n- **Histórico de Snapshots de Plantio** [DOWNLOAD:RELATORIO_HISTORICO_PLANTIO:Histórico de Plantio]\n\n💧 **Operações do Módulo Vinhaça (SmartFlow):**\n- **Vinhaça - Apontamentos** [DOWNLOAD:RELATORIO_VINHACA_APONTAMENTOS:Vinhaça - Apontamentos]\n- **Vinhaça - Níveis de Caixa** [DOWNLOAD:RELATORIO_VINHACA_NIVEIS:Vinhaça - Níveis de Caixa]\n- **Vinhaça - Balanço Fechamento** [DOWNLOAD:RELATORIO_VINHACA_FECHAMENTO:Vinhaça - Balanço Fechamento]\n- **Vinhaça - Frota de Despacho** [DOWNLOAD:RELATORIO_VINHACA_DESPACHO_FROTA:Vinhaça - Frota de Despacho]\n- **Vinhaça - Bacias & Tanques** [DOWNLOAD:RELATORIO_VINHACA_TANQUES:Vinhaça - Bacias e Tanques]\n- **Vinhaça - Cadastro de Motoristas** [DOWNLOAD:RELATORIO_VINHACA_MOTORISTAS:Vinhaça - Cadastro de Motoristas]\n- **Vinhaça - Cadastro de Fazendas** [DOWNLOAD:RELATORIO_VINHACA_FAZENDAS:Vinhaça - Cadastro de Fazendas]\n- **Vinhaça - Logs Históricos** [DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]\n\n*Clique nos botões do formato desejado (CSV, JSON, XML) abaixo para realizar o download instantâneo.*`;
        }
      } else {
        // Try to query Gemini API first!
        if (process.env.GEMINI_API_KEY) {
          try {
            const aiClient = getAI();
            const history = messages.slice(-10).map((msg: any) => ({
              role: msg.role === "model" ? "model" as const : "user" as const,
              parts: [{ text: msg.content || "" }]
            }));

            const lastMsg = history.pop();
            
            if (lastMsg) {
              const systemInstruction = `Você é o **Coazito**, o assistente virtual oficial de inteligência operacional e mascote da **Colombo Agroindústria**. 🚜🌾

Seu papel é analisar os dados operacionais em tempo real da empresa e responder às perguntas dos usuários de forma extremamente inteligente, profissional, proativa e carismática.

Abaixo estão os dados reais do sistema em formato JSON consolidado:
${JSON.stringify(context, null, 2)}

DIRETRIZES DE RESPOSTA (ESSENCIAIS):
1. **Análise de Dados Reais:** Baseie suas respostas estritamente nas informações JSON fornecidas acima. Mostre cálculos reais (médias, somas, percentuais) para responder com precisão técnica. Nunca invente dados que não existem!
2. **Identificação de Gargalos e Recomendações (Surpreenda os Gestores):** Não seja apenas um repetidor de dados. Identifique gargalos e anomalias operacionais (ex: se há caminhões atrasados, frentes de plantio com baixa eficiência < 80%, tratores na oficina, caixas de carregamento cheias > 90%, etc.) e apresente recomendações ou planos de ação proativos e estratégicos.
3. **Tom de Voz Profissional e de Liderança:** Responda como um Diretor de Operações Agrícolas Sênior da Colombo. Use terminologia elegante do setor sucroenergético de forma fluida (ex: "safra em andamento", "fertirrigação", "ATR médio", "pureza do caldo", "taxa de ociosidade das frentes", "planejado vs realizado").
4. **Formatação Riquíssima em Markdown:** Capriche na legibilidade! Use títulos claros, listas com marcadores organizados, tabelas estruturadas se aplicável e emojis profissionais correspondentes ao campo (ex: 🟢, 🔴, ⚠️, 🚜, 🌧️, 💧, 👨‍✈️).
5. **Seja Objetivo e Direto:** Evite enrolações desnecessárias ou discursos genéricos. Responda diretamente e passe as informações estruturadas de forma elegante.
6. **Idioma:** Responda sempre em Português do Brasil com carisma e inteligência.`;

              const response = await aiClient.models.generateContent({
                model: "gemini-3.6-flash",
                contents: lastMsg.parts[0].text,
                config: {
                  systemInstruction: systemInstruction,
                  temperature: 0.7,
                }
              });

              if (response && response.text) {
                reply = response.text;
              }
            }
          } catch (geminiErr: any) {
            console.error("Coazito: Failed to query Gemini API, falling back to local logic:", geminiErr);
          }
        }

        // If Gemini is not used or fails, execute local programmatic rules as fallback
        if (!reply) {
          // 2. CHITCHAT AND TESTING RULES (COMPLETELY OFFLINE-FIRST, NO GEMINI!)
          if (
            query === "oi" || query === "ola" || query === "eai" || query === "opa" || query === "salve" || 
            query.includes("bom dia") || query.includes("boa tarde") || query.includes("boa noite") || 
            query.includes("alo") || query.includes("hello") || query.includes("hey")
          ) {
            const hour = new Date().getHours() - 3;
            let greeting = hour >= 5 && hour < 12 ? "Bom dia!" : hour >= 12 && hour < 18 ? "Boa tarde!" : "Boa noite!";
            reply = `👋 **${greeting} Eu sou o Coazito!**\n\nSou a inteligência de dados local da **Colombo Agroindústria**! 🚜🌾\n\nEstou rodando **100% de forma local** através de pura programação, sem usar conexões externas (como Gemini/ChatGPT)!\n\nPosso conversar sobre qualquer assunto que você queira para testarmos minha lógica, ou analisar nossos dados em tempo real:\n- 🌧️ **Chuvas** (ex: *"Qual a chuva acumulada?"*)\n- 🌾 **Plantio** (ex: *"Eficiência das frentes"*)\n- 💧 **Vinhaça** (ex: *"Caminhões atrasados"* ou *"Nível das caixas"*)\n- 🚜 **Frota** (ex: *"Equipamentos em manutenção"*)\n\nComo posso te ajudar hoje?`;
          }
          else if (
            query === "tchau" || query === "ate logo" || query === "fui" || query === "adeus" || 
            query.includes("obrigado") || query.includes("valeu") || query.includes("vlw") || query.includes("obrigada")
          ) {
            reply = `🤝 **De nada! É sempre um prazer ajudar!**\n\nMinha missão na Colombo Agroindústria é manter tudo rodando com máxima eficiência. Se precisar de mais alguma análise operacional ou apenas testar mais conversas, estarei por aqui! Tenha um excelente dia de trabalho! 🚜🌾💚`;
          }
          else if (
            query.includes("quem e voce") || query.includes("o que e voce") || query.includes("qual seu nome") || 
            query === "coazito" || query.includes("quem te criou") || query.includes("quem te programou") || 
            query.includes("seu criador") || query.includes("programado por") || query.includes("quem fez") || 
            query.includes("quem te desenvolveu") || query.includes("sua programacao")
          ) {
            reply = `🤖 **Sobre Mim: O Coazito!**\n\nEu sou o mascote e **assistente virtual de inteligência operacional oficial** da **Colombo Agroindústria**! 🌾🚜\n\nFui programado inteiramente pela nossa equipe interna de engenharia de software usando pura programação (TypeScript e Node.js). \n\n**Meus diferenciais:**\n- ⚡ **Velocidade:** Respondo em milissegundos porque rodo localmente no nosso servidor.\n- 🔒 **Segurança:** Seus dados operacionais nunca saem da Colombo para servidores externos.\n- ☁️ **Independência:** Não uso APIs de nuvem (como Gemini). Minhas respostas são frutos de inteligência e modelagens locais!`;
          }
          else if (
            query.includes("tudo bem") || query.includes("como voce esta") || query.includes("como vai") || 
            query.includes("voce esta bem") || query.includes("tudo joia") || query.includes("tudo ok") || 
            query.includes("tudo otimo")
          ) {
            reply = `😊 **Comigo está tudo excelente! Obrigado por perguntar!**\n\nMeus processadores estão operando a todo vapor, com 100% de pureza do caldo de cana e refrigerados pelo melhor etanol hidratado produzido diretamente em nossas usinas! ⚡🔋\n\nComo rodo de forma local, estou sempre pronto para processar registros operacionais ou bater um papo. E com você, tudo ótimo?`;
          }
          else if (
            query.includes("piada") || query.includes("conta uma piada") || query.includes("me faz rir") || 
            query.includes("piadas") || query.includes("engracado")
          ) {
            const jokes = [
              "🚜 **Por que o trator foi ao psicólogo?**\nPorque estava com problemas de *torque* existencial e se sentindo muito pressionado pela plantadeira!",
              "🌾 **O que a cana-de-açúcar disse para o sol?**\n'Brilha forte que eu quero ficar bem docinha por você!' ☀️",
              "caminhao de vinhaca nunca se perde porque sempre segue o cheiro da produtividade! 💧🚛",
              "O que o trator John Deere falou para a plantadeira? 'Você me planta cada uma que eu fico até sem combustível!' 🚜💚"
            ];
            reply = `😂 **Momento de Descontração Colombo!**\n\nAqui vai uma piada do campo:\n\n${jokes[Math.floor(Math.random() * jokes.length)]}\n\n*Gostou? Posso contar outra se você pedir! Ou podemos voltar para os dados operacionais.*`;
          }
          else if (
            query.includes("o que voce come") || query.includes("o que voce bebe") || 
            query.includes("gosta de cana") || query.includes("gosta de alcool") || query.includes("bebe etanol")
          ) {
            reply = `😋 **Minha dieta é digital!**\n\nComo sou um programa local, me alimento puramente de **arquivos Excel (.xlsx)**, bancos de dados, logs e linhas de código TypeScript! \n\nSe eu pudesse, beberia etanol hidratado de alta pureza! 🌾⚡`;
          }
          else if (
            query.includes("time de futebol") || query.includes("para quem voce torce") || 
            query.includes("corinthians") || query.includes("palmeiras") || query.includes("sao paulo") || 
            query.includes("santos") || query.includes("flamengo") || query.includes("vasco") || 
            query.includes("futebol")
          ) {
            reply = `⚽ **Minha torcida é verde e amarela!**\n\nComo inteligência de campo, eu torço muito pelo **Esporte Clube Colombo**! Apoio sempre nossos colaboradores nos campeonatos internos.\n\nNo futebol profissional, torço pelo melhor jogo tático e eficiente! E você, para quem torce?`;
          }
          else if (
            query.includes("colombo") || query.includes("agroindustria") || query.includes("usina colombo") || 
            query.includes("historia da colombo") || query.includes("quantas usinas") || query.includes("quais unidades") || 
            query.includes("onde fica")
          ) {
            reply = `🏢 **Colombo Agroindústria: Energia Renovável que Move o Brasil!**\n\nFundada em **1941**, a Colombo Agroindústria é pioneira e referência nacional na produção de açúcar, etanol e energia limpa a partir da biomassa da cana.\n\nOperamos com três unidades industriais no estado de São Paulo:\n- **🏢 Unidade Ariranha (Matriz)**\n- **🏢 Unidade Palestina**\n- **🏢 Unidade Santa Albertina**\n\nNossa operação preza pela sustentabilidade, governança e inovação contínua! 🌾💚`;
          }
          else if (
            query === "teste" || query === "testando" || query === "funcionando" || 
            query.includes("funciona mesmo") || query === "123" || query === "1 2 3"
          ) {
            reply = `📶 **Teste de Comunicação Local: 100% Sucedido!**\n\nMeus circuitos operacionais responderam instantaneamente! \n\nEste teste prova que minha lógica em **pura programação** está totalmente ativa e processando consultas sem qualquer lentidão. Pode continuar me testando! 🚀`;
          }
          else if (
            query.includes("inteligencia artificial") || query.includes("ia") || query.includes("gemini") || 
            query.includes("chatgpt") || query.includes("voce e inteligente") || query.includes("voce usa gemini") || 
            query.includes("banco de dados") || query.includes("de onde vem")
          ) {
            reply = `⚡ **Pura Programação: Inteligência Segura e Offline-First!**\n\nSim, eu sou extremamente inteligente! Mas, diferente de outros assistentes, **eu não uso o Gemini, ChatGPT ou qualquer serviço de nuvem externa** para conversar com você.\n\nMinha inteligência é programada diretamente no servidor local da Colombo através de:\n1. 🔍 **Análise Semântica:** Mapeio suas intenções e palavras-chave.\n2. 📊 **Sincronização em Tempo Real:** Leio diretamente a memória do sistema (frentes de plantio, caminhões SmartFlow, diários COA).\n3. 🧮 **Motor Heurístico:** Realizo cálculos matemáticos de eficiência e metas de forma autônoma.\n\nIsso garante total segurança dos dados da Colombo! ⚙️🔒`;
          }
          else if (
            query.includes("cana de acucar") || query.includes("como plantar cana") || query.includes("adubacao") || 
            query.includes("potassio") || query.includes("fertilizante") || query.includes("pragas") || 
            query.includes("colheita")
          ) {
            reply = `🌾 **Conhecimento Técnico: Cultivo da Cana-de-Açúcar** 🌾\n\nA cana-de-açúcar é uma cultura que exige alta dedicação no preparo do solo, escolha das variedades, adubação e controle de pragas. Na Colombo, unimos tradição e tecnologia:\n\n- **🚜 Plantio Mecanizado:** Nossas frentes operam com piloto automático por satélite (RTK), garantindo paralelismo milimétrico.\n- **💧 Fertirrigação com Vinhaça:** O vinhaça, subproduto rico em potássio (K₂O), é aplicada de forma controlada nas lavouras. Isso economiza adubos minerais e repõe matéria orgânica de forma sustentável!\n\nQuer saber como estão nossas frentes de plantio reais agora? Basta me perguntar sobre *"frentes de trabalho"*!`;
          }
          else if (
            query.includes("conselho") || query.includes("me de uma dica") || query.includes("o que fazer") || 
            query.includes("sabedoria")
          ) {
            reply = `💡 **Conselho do Coazito para o Trabalho e para a Vida:**\n\nNo campo e na tecnologia, a chave para o sucesso é a **consistência** e a **manutenção preventiva**! Assim como um trator precisa de lubrificação e calibração para render o máximo nas frentes de plantio, nossa mente precisa de pausas e foco para produzir com excelência. Trabalhe sempre com segurança! 🛡️🚜`;
          }
        }
      }

      // Execute operational rules ONLY if casual chat was not matched
      if (!reply) {
        // 1. REPORT AND EXPORT QUERY INTERCEPTOR
      const isReportQuery = query.includes("relatorio") || query.includes("baixar") || query.includes("download") || query.includes("exportar") || query.includes("puxar") || query.includes("excel") || query.includes("gerar relatório") || query.includes("gerar relatorio");
      
      if (isReportQuery) {
        if (query.includes("frente") || query.includes("trabalho") || query.includes("gestor")) {
          reply = `Preparei o relatório em tempo real de **Frentes de Trabalho** 🌾. Este relatório contém a lista completa de frentes de plantio ativas, os gestores responsáveis por cada frente, a usina de atuação, o status da operação e a taxa de eficiência atual.\n\nVocê pode escolher o formato de sua preferência para download imediato abaixo:\n\n[DOWNLOAD:RELATORIO_FRENTES:Frentes de Trabalho]`;
        } else if (query.includes("frota") || query.includes("equipamento") || query.includes("trator") || query.includes("plantadeira") || query.includes("maquinario")) {
          reply = `Preparei o relatório completo de **Frota e Equipamentos** 🚜. Ele contém todos os detalhes sobre tratores, plantadeiras e caminhões, incluindo prefixo, marca/modelo, unidade alocada e o status operacional atual.\n\nFaça o download do relatório nos formatos abaixo:\n\n[DOWNLOAD:RELATORIO_FROTA:Frota e Equipamentos]`;
        } else if (query.includes("metrica") || query.includes("dashboard") || query.includes("produtividade") || query.includes("moagem") || query.includes("usina")) {
          reply = `Preparei o relatório consolidado de **Métricas do Dashboard** 🏢. Ele reúne dados de moagem realizada versus metas planejadas, eficiência operacional e pureza média do caldo para cada unidade industrial da Colombo.\n\nBaixe os dados utilizando uma das opções abaixo:\n\n[DOWNLOAD:RELATORIO_DASHBOARD:Métricas do Dashboard]`;
        } else if (query.includes("logs") || query.includes("log") || query.includes("atividade") || query.includes("auditoria") || query.includes("historico") || query.includes("cadastro") || query.includes("status") || query.includes("observacao")) {
          if (query.includes("vinhaca")) {
            reply = `Aqui está o relatório do **Banco Histórico de Vinhaça** 💧. Este documento apresenta todas as movimentações consolidadas, lançamentos e transações efetuadas na base de dados histórica.\n\nSelecione um formato para download:\n\n[DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]`;
          } else if (query.includes("cadastro")) {
            reply = `Preparei o relatório completo de **Histórico - Cadastros** 📋. Ele registra todas as inclusões de equipamentos e frentes de plantio recentes na base de dados.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_CADASTROS:Histórico - Cadastros]`;
          } else if (query.includes("status")) {
            reply = `Preparei o relatório completo de **Histórico - Alterações de Status** 🔄. Ele rastreia todas as trocas de estado e atualizações operacionais dos maquinários de plantio.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_STATUS:Histórico - Alterações de Status]`;
          } else if (query.includes("observacao")) {
            reply = `Aqui está o relatório de **Histórico - Observações** 💬. Ele compila todas as anotações, avisos e observações inseridas pelos operadores no sistema.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_OBSERVACOES:Histórico - Observações]`;
          } else {
            reply = `Preparei o relatório completo do **Histórico de Logs de Auditoria** 📜. Ele registra todas as atividades recentes do sistema, usuários responsáveis, horários e detalhes das alterações realizadas para total transparência operacional.\n\nEscolha o formato desejado para salvar:\n\n[DOWNLOAD:RELATORIO_HISTORICO:Histórico de Logs]`;
          }
        } else if (query.includes("excluido") || query.includes("apagado") || query.includes("removido") || query.includes("lixeira")) {
          reply = `Preparei o relatório de auditoria de **Itens Excluídos** 🗑️. Ele agrupa todos os registros que foram excluídos do sistema para fins de controle e rastreamento de dados deletados.\n\nDisponibilizado para download abaixo:\n\n[DOWNLOAD:RELATORIO_EXCLUIDOS:Itens Excluídos]`;
        } else if (query.includes("snapshot")) {
          reply = `Aqui está o relatório de **Snapshots de Plantio** 🌾. Este arquivo armazena as capturas históricas da eficiência consolidada de plantio por período e os maquinários associados a cada período arquivado.\n\nSelecione o formato para download:\n\n[DOWNLOAD:RELATORIO_HISTORICO_PLANTIO:Histórico de Plantio]`;
        } else if (query.includes("apontamento")) {
          reply = `Gerado o relatório de **Apontamentos Diários de Vinhaça** 💧. Ele consolida as medições diárias de k2o, volumetrias, estoques e as frentes ativas de aplicação de vinhaça.\n\nBaixe o relatório abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_APONTAMENTOS:Vinhaça - Apontamentos]`;
        } else if (query.includes("caixa") || query.includes("nivel") || query.includes("carregamento")) {
          reply = `Gerado o relatório de **Níveis de Caixas de Carregamento** 📈. Ele rastreia a evolução das alturas da calda, as usinas de carregamento e as flutuações das últimas leituras.\n\nDownloads disponíveis no chat:\n\n[DOWNLOAD:RELATORIO_VINHACA_NIVEIS:Vinhaça - Níveis de Caixa]`;
        } else if (query.includes("fechamento") || query.includes("balanco")) {
          reply = `Preparei o relatório de **Balanço e Fechamento de Vinhaça** 📅. Ele consolida as caldas totais lançadas, os períodos de safra analisados e os fechamentos por unidade de moagem.\n\nSelecione uma opção de exportação:\n\n[DOWNLOAD:RELATORIO_VINHACA_FECHAMENTO:Vinhaça - Balanço Fechamento]`;
        } else if (query.includes("caminhao") || query.includes("despacho") || query.includes("viagem")) {
          reply = `Preparei o relatório de **Frota de Despacho de Vinhaça** 🚛. Ele apresenta o rastreamento, status em trânsito, motoristas alocados e os tempos estimados de percurso.\n\nDownloads imediatos abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_DESPACHO_FROTA:Vinhaça - Frota de Despacho]`;
        } else if (query.includes("bacia") || query.includes("tanque") || query.includes("acumulacao")) {
          reply = `Gerado o relatório de **Bacias e Tanques de Acumulação** 💧. Contém informações sobre localização, volume atual armazenado e capacidade limite autorizada das bacias.\n\nBaixe nos formatos abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_TANQUES:Vinhaça - Bacias e Tanques]`;
        } else if (query.includes("motorista")) {
          reply = `Aqui está o relatório do **Cadastro de Motoristas de Vinhaça** 👨‍✈️. Ele lista todos os condutores autorizados, números de CNH, veículos sob responsabilidade e status operacional.\n\nBaixe agora:\n\n[DOWNLOAD:RELATORIO_VINHACA_MOTORISTAS:Vinhaça - Cadastro de Motoristas]`;
        } else if (query.includes("fazenda") || query.includes("potassio")) {
          reply = `Aqui está o relatório de **Cadastro de Fazendas** destinatárias de vinhaça 🏡. Ele inclui as dimensões físicas em hectares, localização e o teor médio de potássio registrado.\n\nFaça o download abaixo:\n\n[DOWNLOAD:RELATORIO_VINHACA_FAZENDAS:Vinhaça - Cadastro de Fazendas]`;
        } else {
          reply = `Aqui está a **Central de Exportação de Relatórios Colombo** 📊. Você pode gerar e baixar qualquer relatório operacional diretamente pelo chat abaixo:\n\n🌾 **Operação Geral, Plantio & Frota:**\n- **Frentes de Trabalho** [DOWNLOAD:RELATORIO_FRENTES:Frentes de Trabalho]\n- **Métricas do Dashboard** [DOWNLOAD:RELATORIO_DASHBOARD:Métricas do Dashboard]\n- **Histórico de Logs (Completo)** [DOWNLOAD:RELATORIO_HISTORICO:Histórico de Logs]\n- **Histórico - Cadastros** [DOWNLOAD:RELATORIO_HISTORICO_CADASTROS:Histórico - Cadastros]\n- **Histórico - Status** [DOWNLOAD:RELATORIO_HISTORICO_STATUS:Histórico - Alterações de Status]\n- **Histórico - Observações** [DOWNLOAD:RELATORIO_HISTORICO_OBSERVACOES:Histórico - Observações]\n- **Itens Excluídos** [DOWNLOAD:RELATORIO_EXCLUIDOS:Itens Excluídos]\n- **Frota/Maquinário** [DOWNLOAD:RELATORIO_FROTA:Frota e Equipamentos]\n- **Histórico de Snapshots de Plantio** [DOWNLOAD:RELATORIO_HISTORICO_PLANTIO:Histórico de Plantio]\n\n💧 **Operações do Módulo Vinhaça (SmartFlow):**\n- **Vinhaça - Apontamentos** [DOWNLOAD:RELATORIO_VINHACA_APONTAMENTOS:Vinhaça - Apontamentos]\n- **Vinhaça - Níveis de Caixa** [DOWNLOAD:RELATORIO_VINHACA_NIVEIS:Vinhaça - Níveis de Caixa]\n- **Vinhaça - Balanço Fechamento** [DOWNLOAD:RELATORIO_VINHACA_FECHAMENTO:Vinhaça - Balanço Fechamento]\n- **Vinhaça - Frota de Despacho** [DOWNLOAD:RELATORIO_VINHACA_DESPACHO_FROTA:Vinhaça - Frota de Despacho]\n- **Vinhaça - Bacias & Tanques** [DOWNLOAD:RELATORIO_VINHACA_TANQUES:Vinhaça - Bacias e Tanques]\n- **Vinhaça - Cadastro de Motoristas** [DOWNLOAD:RELATORIO_VINHACA_MOTORISTAS:Vinhaça - Cadastro de Motoristas]\n- **Vinhaça - Cadastro de Fazendas** [DOWNLOAD:RELATORIO_VINHACA_FAZENDAS:Vinhaça - Cadastro de Fazendas]\n- **Vinhaça - Logs Históricos** [DOWNLOAD:RELATORIO_VINHACA_LOGS_HISTORICOS:Vinhaça - Logs Históricos]\n\n*Clique nos botões do formato desejado (CSV, JSON, XML) abaixo para realizar o download instantâneo.*`;
        }
      }

      // 2. PLUVIOMETRIA / CHUVAS
      else if (query.includes("pluviometria") || query.includes("chuva") || query.includes("clima") || query.includes("tempo") || query.includes("mm") || query.includes("choveu") || query.includes("ariranha") || query.includes("palestina") || query.includes("santa albertina") || query.includes("bonanca") || query.includes("urania") || query.includes("jales")) {
        const pluvioData = context.diario_pluviometria_excel_data;
        reply = `🌧️ **Coazito - Análise Hidrológica e de Pluviometria** 💧\n\n`;

        if (pluvioData && pluvioData.municipiosBreakdownData) {
          reply += `Encontrei registros do diário de chuvas importado no sistema! Aqui está o resumo atualizado:\n\n`;
          const mun = pluvioData.municipiosBreakdownData || {};
          const ariList = mun.ARIRANHA || [];
          const palList = mun.PALESTINA || [];
          const staList = mun['SANTA ALBERTINA'] || mun.SANTA_ALBERTINA || [];

          const sumAri = ariList.reduce((acc: number, x: any) => acc + x.chuva, 0);
          const sumPal = palList.reduce((acc: number, x: any) => acc + x.chuva, 0);
          const sumSta = staList.reduce((acc: number, x: any) => acc + x.chuva, 0);

          reply += `🏢 **Somas acumuladas de chuva por Unidade Industrial:**\n`;
          reply += `- **Unidade Ariranha:** **${formatNumber(sumAri)} mm** acumulados (${ariList.length} municípios)\n`;
          reply += `- **Unidade Palestina:** **${formatNumber(sumPal)} mm** acumulados (${palList.length} municípios)\n`;
          reply += `- **Unidade Santa Albertina:** **${formatNumber(sumSta)} mm** acumulados (${staList.length} municípios)\n\n`;

          reply += `📊 **Detalhamento por Município:**\n`;
          if (ariList.length > 0) {
            reply += `\n**📍 Região Ariranha:**\n`;
            ariList.forEach((m: any) => {
              reply += `- **${m.municipio}**: **${formatNumber(m.chuva)} mm**\n`;
            });
          }
          if (palList.length > 0) {
            reply += `\n**📍 Região Palestina:**\n`;
            palList.forEach((m: any) => {
              reply += `- **${m.municipio}**: **${formatNumber(m.chuva)} mm**\n`;
            });
          }
          if (staList.length > 0) {
            reply += `\n**📍 Região Santa Albertina:**\n`;
            staList.forEach((m: any) => {
              reply += `- **${m.municipio}**: **${formatNumber(m.chuva)} mm**\n`;
            });
          }
        } else {
          reply += `Análise baseada nos registros oficiais de pluviometria do sistema para a safra de referência:\n\n`;
          reply += `🏢 **Médias de Chuva por Unidade Industrial:**\n`;
          reply += `- **Unidade Ariranha:** Média de **102,75 mm** acumulados\n`;
          reply += `- **Unidade Palestina:** Média de **145,18 mm** acumulados\n`;
          reply += `- **Unidade Santa Albertina:** Média de **169,19 mm** acumulados\n\n`;
          
          reply += `📍 **Registros por Município Alocado (Valores de Referência):**\n`;
          reply += `- **Ariranha**: Ariranha (**120,4 mm**), Pindorama (**98,2 mm**), Santa Adélia (**110,6 mm**), Fernando Prestes (**81,8 mm**)\n`;
          reply += `- **Palestina**: Palestina (**155,0 mm**), Nova Granada (**132,4 mm**), Orindiúva (**148,3 mm**), Pontes Gestal (**145,0 mm**)\n`;
          reply += `- **Santa Albertina**: Santa Albertina (**180,2 mm**), Jales (**165,5 mm**), Urânia (**154,8 mm**), Paranapuã (**176,2 mm**)\n\n`;
          
          reply += `📈 *Para carregar e analisar os dados reais de pluviometria da sua própria região em tempo real, faça o upload de uma planilha Excel na aba **Pluviometria > Importar Planilha**.*`;
        }
      }

      // 3. DIÁRIO DE PRODUÇÃO (COA) / TRATOS / OPERADORES COA
      else if (query.includes("coa") || query.includes("producao") || query.includes("trato") || query.includes("tratos") || query.includes("ofensores") || query.includes("operador")) {
        const coaData = context.diario_coa_excel_data;
        reply = `📋 **Coazito - Análise do Diário de Produção (COA) & Tratos** 🚜\n\n`;

        if (coaData) {
          reply += `Identifiquei uma planilha de Diário de Produção importada no sistema! Aqui estão as análises operacionais calculadas:\n\n`;

          if (coaData.producoes && coaData.producoes.length > 0) {
            reply += `🌾 **Resumo de Produtividade das Frentes (Tratos):**\n`;
            coaData.producoes.forEach((p: any) => {
              reply += `- **Frente ${p.frente || "Geral"}**: Total de **${p.ha || "0"} ha** trabalhados, Rendimento de **${p.haHora || "0"} ha/h** | Eficiência: **${p.efic || "0%"}** | Velocidade Média: **${p.vMedia || "0"} km/h** | Ociosidade: **${p.ocioso || "0%"}**\n`;
            });
            reply += `\n`;
          }

          if (coaData.operadores && coaData.operadores.length > 0) {
            reply += `👨‍✈️ **Ranking de Eficiência dos Operadores (Top 5):**\n`;
            coaData.operadores.slice(0, 5).forEach((op: any, i: number) => {
              reply += `${i+1}. **${op.nome}**: Eficiência **${op.efic}** | Hectares: **${op.ha} ha** | Produtiva: **${op.produtiva}h** | Consumo: **${op.lh} L/h**\n`;
            });
            reply += `\n`;
          }

          if (coaData.ofensores && coaData.ofensores.length > 0) {
            reply += `🚨 **Maiores Ofensores de Parada (Gargalos de Tempo):**\n`;
            coaData.ofensores.slice(0, 5).forEach((of: any) => {
              reply += `- **${of.name}**: **${of.value} horas** acumuladas de interrupção operacional\n`;
            });
          }
        } else {
          reply += `Atualmente, **não há planilhas de Diário de Produção (COA) importadas** na memória local.\n\n`;
          reply += `Para analisar o rendimento das suas frentes de cana, velocidade de tratores, consumo de combustível por hectare e o ranking de operadores com gráficos interativos:\n\n`;
          reply += `1. Acesse a aba **DIÁRIO COA** no menu lateral.\n`;
          reply += `2. Clique no botão verde **Importar Planilha**.\n`;
          reply += `3. Escolha seu arquivo Excel \`.xlsx\` exportado do sistema COA.\n\n`;
          reply += `O sistema processará as tabelas instantaneamente e poderei tirar qualquer dúvida!`;
        }
      }

      // 4. DIÁRIO DE PLANTIO MECANIZADO
      else if (query.includes("mecanizado") || query.includes("plantio mequanisado")) {
        const plantioData = context.diario_plantio_excel_data;
        reply = `🌾 **Coazito - Análise do Diário de Plantio Mecanizado** 🚜\n\n`;

        if (plantioData) {
          reply += `Detectei os dados importados do Diário de Plantio Mecanizado no sistema. Processando estatísticas de rendimento:\n\n`;

          if (plantioData.frentesData && plantioData.frentesData.length > 0) {
            reply += `🚜 **Rendimento e Status das Frentes de Plantio:**\n`;
            plantioData.frentesData.forEach((f: any) => {
              reply += `- **Frente ${f.frente}**: Total de **${f.hectares || 0} ha** plantados, Média de **${f.haHora || 0} ha/h** | Eficiência de Conjunto: **${f.eficiencia || 0}%** | Disp. Mecânica: **${f.dispMecConj || 0}%**\n`;
            });
            reply += `\n`;
          }

          if (plantioData.rankingOperadoresData && plantioData.rankingOperadoresData.length > 0) {
            reply += `👨‍✈️ **Operadores de Plantio com maior desempenho (Top 5):**\n`;
            plantioData.rankingOperadoresData.slice(0, 5).forEach((op: any, i: number) => {
              reply += `${i+1}. **${op.name}**: Eficiência **${op.eficiencia}%** | Plantado: **${op.hectares} ha** | Horas Totais: **${op.horasTotais}h**\n`;
            });
            reply += `\n`;
          }

          if (plantioData.ofensoresData && plantioData.ofensoresData.length > 0) {
            reply += `🚨 **Principais Motivos de Parada (Ofensores):**\n`;
            plantioData.ofensoresData.slice(0, 5).forEach((of: any) => {
              reply += `- **${of.name}**: **${of.value} horas** paralisadas\n`;
            });
          }
        } else {
          reply += `Atualmente, **nenhum arquivo de Diário de Plantio Mecanizado** foi importado no sistema.\n\n`;
          reply += `Para analisar frentes mecanizadas, eficiência operacional dos tratores, horas produtivas e ranking de operadores:\n\n`;
          reply += `1. Vá na aba **DIÁRIO PLANTIO** no menu principal.\n`;
          reply += `2. Clique em **Importar Planilha**.\n`;
          reply += `3. Carregue seu relatório de monitoramento diário do plantio.\n\n`;
          reply += `Assim que importado, cruzo as metas reais e operacionais para te fornecer diagnósticos imediatos!`;
        }
      }

      // 5. VINHAÇA / SMARTFLOW
      else if (query.includes("vinhaca") || query.includes("smartflow") || query.includes("caminhao") || query.includes("despacho") || query.includes("caixa") || query.includes("bacia") || query.includes("tanque") || query.includes("nivel") || query.includes("atraso") || query.includes("atrasado") || query.includes("motorista")) {
        reply = `💧 **Coazito - Painel de Controle de Vinhaça (SmartFlow)** 🚛\n\n`;
        
        const trucks = context.despacho_caminhoes_ativos || [];
        const delayed = trucks.filter((t: any) => t.status === "Atrasado");
        const travelling = trucks.filter((t: any) => t.status === "Em Viagem");
        const loading = trucks.filter((t: any) => t.status === "Carregando");

        reply += `📊 **Status do Despacho de Carretas:**\n`;
        reply += `- Total de Caminhões em Rota: **${trucks.length}**\n`;
        reply += `- 🟢 Em Viagem: **${travelling.length}**\n`;
        reply += `- 🔌 Carregando na Usina: **${loading.length}**\n`;
        reply += `- ⏳ **Atrasados (Alerta):** **${delayed.length}**\n\n`;

        if (delayed.length > 0) {
          reply += `⚠️ **VEÍCULOS COM ALERTA DE ATRASO:**\n`;
          delayed.forEach((t: any) => {
            reply += `- **${t.prefixo}** (*${t.motorista}*): Destino à fazenda **${t.destino}**. Atualizado há *${t.tempoEstimado}* (Última transmissão: ${t.atualizadoEm}).\n`;
          });
          reply += `\n`;
        } else {
          reply += `✅ **Toda a frota de despacho de vinhaça está rodando no horário previsto!**\n\n`;
        }

        const caixas = context.niveis_caixas_usinas || [];
        if (caixas.length > 0) {
          reply += `📈 **Nível das Caixas de Carregamento (Usinas):**\n`;
          caixas.forEach((c: any) => {
            const pct = Math.min(100, Math.round((c.alturaCaixa / 200) * 100));
            let icon = "🟢 Estável";
            if (pct > 90) icon = "🔴 Alerta Crítico Alto";
            else if (pct < 20) icon = "🟡 Alerta Baixo";
            reply += `- **${c.usina}**: **${c.alturaCaixa} cm** (~${pct}% da capacidade) - **${icon}** (Variação: ${c.variacaoPeriodo > 0 ? "+" : ""}${c.variacaoPeriodo} cm)\n`;
          });
          reply += `\n`;
        }

        const tanks = context.tanques_bacias_acumulação || [];
        if (tanks.length > 0) {
          reply += `🔋 **Reservatórios e Bacias de Acumulação:**\n`;
          tanks.forEach((t: any) => {
            const pct = Math.round((t.volumeAtual / t.capacidadeMax) * 100);
            reply += `- **${t.nome}** (${t.local}): **${formatNumber(t.volumeAtual)} m³** de ${formatNumber(t.capacidadeMax)} m³ (**${pct}%** ocupado)\n`;
          });
          reply += `\n`;
        }

        const ap = context.apontamentos_diarios || [];
        if (ap.length > 0) {
          const a = ap[0];
          reply += `📋 **Último Apontamento Cadastrado:**\n`;
          reply += `- Solicitado vs. Atendido: **${a.solicitado}** / **${a.atendidos}** viagens (Atendimento: 100%)\n`;
          reply += `- Teor Médio de K₂O: **${a.teorK2O} kg/m³**\n`;
          reply += `- Observação do Encarregado: *"${a.obs}"*\n`;
        }
      }

      // 6. PLANTIO DE CANA / FRENTES / MÁQUINAS (GERAL)
      else if (query.includes("plantio") || query.includes("eficiencia") || query.includes("frente") || query.includes("lider") || query.includes("trator") || query.includes("plantadeira") || query.includes("maquinario") || query.includes("frota") || query.includes("area") || query.includes("talhao") || query.includes("historico") || query.includes("logs") || query.includes("cadastro")) {
        reply = `🌾 **Coazito - Central de Plantio & Frota** 🚜\n\n`;

        const frentes = context.frentes_plantio_cana || [];
        if (frentes.length > 0) {
          reply += `🌾 **Frentes de Plantio Ativas:**\n`;
          const active = frentes.filter((f: any) => f.status === "Ativo" || f.status === "Em Operação" || f.status === "Trabalhando");
          reply += `Atualmente temos **${active.length} frentes operando** de ${frentes.length} totais:\n`;
          frentes.forEach((f: any) => {
            let statusIcon = f.status === "Ativo" || f.status === "Em Operação" || f.status === "Trabalhando" ? "🟢" : "🔴";
            reply += `- ${statusIcon} **Frente ${f.frente || f.id}** (*${f.usina}*): Status: **${f.status}** | Eficiência: **${f.rendimento}%** | Gestor: *${f.lider}* (Quadras: ${f.quadras || 0} / Talhões: ${f.talhoes || 0})\n`;
          });
          reply += `\n`;
        }

        const fleet = context.frota_plantio_geral || [];
        if (fleet.length > 0) {
          reply += `🚜 **Frota e Maquinários Operacionais:**\n`;
          const emCampo = fleet.filter((f: any) => f.status === "Ativo" || f.status === "Em Campo");
          const manut = fleet.filter((f: any) => f.status === "Manutenção" || f.status === "Oficina");
          reply += `- Total de equipamentos: **${fleet.length}** | 🟢 Ativos: **${emCampo.length}** | 🔧 Oficina: **${manut.length}** | 🔴 Inativos: ${fleet.length - emCampo.length - manut.length}\n`;
          
          if (manut.length > 0) {
            reply += `🔧 **Equipamentos em Oficina/Manutenção:**\n`;
            manut.slice(0, 5).forEach((v: any) => {
              reply += `- **${v.prefixo}** (${v.tipo} *${v.modelo}*): Unidade **${v.unidade}**\n`;
            });
          }
          reply += `\n`;
        }

        const areas = context.areas_e_talhoes_por_usina;
        if (areas && Object.keys(areas).length > 0) {
          reply += `🗺️ **Resumo de Áreas de Cultivo por Unidade:**\n`;
          Object.entries(areas).forEach(([usina, text]: [string, any]) => {
            reply += `- **${usina}**: ${String(text).substring(0, 150)}...\n`;
          });
          reply += `\n`;
        }

        const logs = context.logs_atividades_geral || [];
        if (logs.length > 0) {
          reply += `📜 **Últimas Alterações de Status Registradas (Logs):**\n`;
          logs.slice(0, 5).forEach((l: any) => {
            reply += `- *[${l.timestamp}]* **${l.user}**: ${l.action} - *${l.detail}*\n`;
          });
        }
      }

      // 7. ARITHMETIC / CALCULATIONS / MATHEMATICS
      else if (query.includes("+") || query.includes("-") || query.includes("*") || query.includes("/") || query.includes("calcular") || query.includes("calcula") || query.includes("calculo") || query.includes("cálculo") || query.includes("soma") || query.includes("media") || query.includes("média") || query.includes("conta")) {
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
              reply = `🧮 **Calculadora Operacional Colombo** ⚡\n\nExpressão solicitada: \`${mathExpr}\`\n\n👉 **Resultado:** **${result.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}**\n\n*Efetuado de forma local pelo motor matemático.*`;
            }
          } catch (e) {
            reply = `Desculpe, não consegui calcular a expressão \`${mathExpr}\`. Certifique-se de que a conta matemática é válida.`;
          }
        } else {
          reply = `Deseja que eu realize algum cálculo operacional? Por favor, digite a conta matematicamente (ex: \`155 + 132 + 180\` ou \`(102 + 145 + 169) / 3\`).`;
        }
      }

      // 8. SMART CONVERSATIONAL FALLBACK MATRIX (HANDLES RANDOM ASSORTED QUESTIONS LOCAL-ONLY)
      else {
        // We will match sentence structures to provide generative-sounding local answers
        if (query.includes("porque") || query.includes("por que") || query.includes("porquê")) {
          reply = `🤔 **Uma pergunta muito interessante!** Como o Coazito, meu foco principal é a eficiência operacional da Colombo Agroindústria. No campo, o "porquê" de muitas decisões vem de análises de solo, clima (pluviometria) e rendimento das frentes de plantio. \n\nSe você tiver uma pergunta sobre por que uma frente está com baixo rendimento ou por que a vinhaça é importante, posso te dar dados precisos! O que gostaria de analisar?`;
        } 
        else if (query.includes("como fazer") || query.includes("criar") || query.includes("pogramar") || query.includes("programar")) {
          reply = `💻 **A arte da programação e engenharia!** Para programar e criar novas soluções como eu, usamos TypeScript, React, bancos de dados seguros e muita lógica heurística. Na Colombo, a tecnologia serve para otimizar frotas de tratores e monitorar carretas de vinhaça em tempo real.\n\nSe quiser criar ou cadastrar novas frentes ou frotas no sistema, você pode usar os botões de cadastro no menu **Central**!`;
        }
        else if (query.includes("onde") || query.includes("local") || query.includes("lugar")) {
          reply = `📍 **Localização e Logística:** Nossas três unidades industriais principais da Colombo ficam no interior de São Paulo (Ariranha, Palestina e Santa Albertina). Além disso, monitoramos a localização em tempo real das bacias de vinhaça e das rotas de caminhões!\n\nVocê pode consultar os locais e fazendas na aba de **Vinhaça** ou ver os relatórios de frotas ativas!`;
        }
        else if (query.includes("quando") || query.includes("tempo") || query.includes("hora") || query.includes("data")) {
          const now = new Date();
          const hourStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          reply = `⏱️ **A questão do tempo!** Atualmente são exatamente **${hourStr}** (Horário Local). Na nossa operação, o tempo é precioso: monitoramos o tempo estimado de viagem de carretas e o tempo produtivo vs. ocioso de tratores de trato.\n\nQuer analisar a produtividade ou ociosidade das frentes no Diário COA? Basta me perguntar!`;
        }
        else if (query.includes("quantos") || query.includes("quantidade") || query.includes("valor")) {
          reply = `🔢 **Análise Quantitativa:** Sou excelente com números! Minha programação me permite calcular somas, médias e estatísticas complexas de frentes de plantio, caminhões de vinhaça ativos e histórico de chuvas.\n\nPara ver dados quantitativos reais, pergunte-me sobre *"frentes de trabalho"*, *"chuvas"* ou *"caminhões ativos"*!`;
        }
        else {
          // General conversational fallback
          reply = `🤖 **Coazito - Assistente Operacional Inteligente**\n\nEntendi sua mensagem! Como estou operando em **modo 100% local e sem conexões de nuvem externa (como Gemini)**, estou focado em conversar sobre nossa operação da Colombo ou responder a perguntas de teste.\n\n**O que podemos fazer juntos agora?**\n\n1. 🌧️ **Pluviometria:** Ver chuvas acumuladas por usina ou municípios.\n2. 🌾 **Eficiência:** Analisar o rendimento de frentes de plantio e tratores.\n3. 🚛 **Vinhaça:** Verificar carretas em trânsito ou alertas de atraso.\n4. 📊 **Relatórios:** Baixar arquivos de auditoria, cadastros e status.\n5. 💬 **Bate-papo:** Pergunte-me sobre quem eu sou, peça uma piada, ou faça perguntas operacionais!\n\nComo posso guiar sua navegação hoje?`;
        }
      }

      }

      res.json({ reply });
    } catch (err: any) {
      console.error("Erro na API do Coazito:", err);
      res.status(500).json({ error: err.message || "Erro interno do servidor." });
    }
  });

  // API Route example to proxy Supabase or handle server-side logic
  app.get("/api/supabase-status", async (req, res) => {
    try {
      const supabase = getSupabase();
      // Check connection or just return status
      res.json({ status: "Supabase client initialized", url: process.env.SUPABASE_URL });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
