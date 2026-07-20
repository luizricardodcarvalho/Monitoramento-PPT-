export interface DdsTopic {
  id: number;
  title: string;
  category: string;
  rules: string[];
  urgency: 'Crítico' | 'Alto' | 'Médio';
  description: string;
}

export const INITIAL_DDS_TOPICS: DdsTopic[] = [
  {
    id: 1,
    title: 'Inspeção Prévia de Máquinas (Checklist Diário)',
    category: 'Operação de Máquinas',
    urgency: 'Crítico',
    description: 'A inspeção antes do início do turno garante que falhas mecânicas ou vazamentos graves sejam detectados precocemente, evitando acidentes catastróficos no campo.',
    rules: [
      'Verificar níveis de óleo do motor, transmissão e sistema hidráulico.',
      'Inspecionar o estado de conservação dos pneus e aperto dos parafusos das rodas.',
      'Testar o funcionamento dos freios de serviço, freio de estacionamento e direção.',
      'Garantir que faróis, lanternas e giroscópio (giroflex) estejam limpos e operantes.'
    ]
  },
  {
    id: 2,
    title: 'Operação Segura de Tratores em Declives',
    category: 'Operação de Máquinas',
    urgency: 'Alto',
    description: 'Tombamentos de tratores em encostas acentuadas representam um dos acidentes mais severos no setor canavieiro. Manter a atenção ao centro de gravidade e utilizar a tração 4x4 ligada é crucial para a segurança do operador.',
    rules: [
      'Utilizar sempre marcha reduzida e freio motor ao descer encostas acentuadas, nunca descer no ponto morto.',
      'Evitar manobras bruscas e em alta velocidade próximo a valas, barrancos e curvas de nível.',
      'Garantir que a plantadeira acoplada está com os pinos de segurança e correntes perfeitamente travados.',
      'Parar a máquina imediatamente caso note trepidação excessiva ou perda de tração.'
    ]
  },
  {
    id: 3,
    title: 'Exposição ao Sol e Hidratação dos Trabalhadores',
    category: 'Saúde Ocupacional',
    urgency: 'Médio',
    description: 'O calor intenso do campo pode causar desidratação severa, insolação, fadiga extrema e cãibras, afetando o julgamento seguro do trabalhador. A hidratação frequente mantém o corpo regulado e ativo.',
    rules: [
      'Ingerir no mínimo 3 a 4 litros de água mineral ao longo do turno, mesmo que não sinta sede imediata.',
      'Aplicar protetor solar fator 30+ no rosto, braços e pescoço no início do turno e reaplicar após o almoço.',
      'Utilizar sempre o chapéu com touca árabe acoplada fornecido pela empresa.',
      'Fazer pausas curtas de descanso em locais sombreados durante os picos de calor extremo.'
    ]
  },
  {
    id: 4,
    title: 'Uso Correto de EPIs na Atividade Agrícola',
    category: 'Equipamento de Proteção',
    urgency: 'Alto',
    description: 'O uso diário e correto dos Equipamentos de Proteção Individual reduz drasticamente os índices de acidentes e lesões no campo. Trata-se de uma obrigação legal e de um compromisso mútuo de segurança.',
    rules: [
      'Utilizar perneiras de proteção rígidas para evitar picadas de animais peçonhentos presentes na palha.',
      'Usar óculos de proteção contra poeira e detritos sempre que estiver fora da cabine climatizada.',
      'Calçar botinas com bico de composite ou aço para proteção contra impactos mecânicos e esmagamentos.',
      'Sempre inspecionar as luvas de raspa ou nitrílicas antes de manusear cabos de aço e ferramentas.'
    ]
  },
  {
    id: 5,
    title: 'Cuidado com Animais Peçonhentos no Campo',
    category: 'Prevenção de Acidentes',
    urgency: 'Alto',
    description: 'A palhada da cana e os arredores das lavouras servem de abrigo natural para serpentes, escorpiões e aranhas. A observação constante evita encontros perigosos.',
    rules: [
      'Sempre inspecionar o chão, sob as rodas ou implementos antes de pisar ou colocar as mãos.',
      'Usar perneiras de proteção rígidas durante toda a jornada de trabalho no campo.',
      'Em caso de avistamento, afaste-se com calma e nunca tente capturar ou matar o animal.',
      'Se houver picada, mantenha a vítima calma, deitada, e transporte-a imediatamente ao hospital de referência.'
    ]
  },
  {
    id: 6,
    title: 'Ergonomia na Direção de Veículos Agrícolas',
    category: 'Saúde Ocupacional',
    urgency: 'Médio',
    description: 'Longas horas na mesma posição podem causar lesões crônicas na coluna e fadiga muscular. Ajustar o assento corretamente previne dores lombares de longo prazo.',
    rules: [
      'Regular a altura e distância do banco para que os pés alcancem os pedais com joelhos ligeiramente dobrados.',
      'Apoiar toda a coluna lombar e dorsal contra o encosto do banco, mantendo postura ereta.',
      'Realizar alongamentos leves durante as pausas operacionais programadas.',
      'Ajustar os espelhos retrovisores para evitar movimentos bruscos e rotações excessivas do pescoço.'
    ]
  },
  {
    id: 7,
    title: 'Cuidados ao Operar sob Linhas de Alta Tensão',
    category: 'Segurança Geral',
    urgency: 'Crítico',
    description: 'O contato acidental de implementos elevados com fios de alta tensão é fatal. A distância mínima de segurança deve ser rigorosamente respeitada em toda a fazenda.',
    rules: [
      'Identificar previamente a localização das redes elétricas que cruzam a área de plantio ou tráfego.',
      'Manter implementos de grande altura (como pulverizadores ou caçambas) abaixados ao transitar sob redes elétricas.',
      'Em caso de arco elétrico ou contato, permaneça dentro da cabine (pneus isolam) e chame resgate imediato.',
      'Nunca estacione tratores ou implementos diretamente embaixo de linhas de transmissão.'
    ]
  },
  {
    id: 8,
    title: 'Direção Defensiva em Estradas de Terra',
    category: 'Direção Defensiva',
    urgency: 'Alto',
    description: 'Estradas vicinais possuem poeira densa, cascalho solto e irregularidades que reduzem a aderência do veículo. Reduzir a velocidade previne colisões e saídas de pista.',
    rules: [
      'Manter faróis baixos acesos mesmo durante o dia para aumentar a visibilidade na poeira.',
      'Manter distância de seguimento segura (mínimo de 30 metros) do veículo à frente devido à poeira.',
      'Reduzir a velocidade ao cruzar com outros veículos de grande porte ou maquinários agrícolas.',
      'Sinalizar com antecedência todas as conversões para as entradas de talhão.'
    ]
  },
  {
    id: 9,
    title: 'Prevenção de Quedas no Acesso às Cabines',
    category: 'Prevenção de Acidentes',
    urgency: 'Médio',
    description: 'Subir ou descer de tratores e caminhões de forma apressada causa escorregões que lesionam articulações e ossos. A técnica dos três pontos de apoio deve ser instintiva.',
    rules: [
      'Sempre manter três pontos de apoio (duas mãos e um pé, ou dois pés e uma mão) nos degraus e alças.',
      'Nunca saltar da cabine ou degraus diretamente para o solo.',
      'Verificar se os degraus estão limpos e livres de lama, óleo, graxa ou palhada solta.',
      'Descer sempre de costas para o solo, voltado para o veículo, utilizando as alças apropriadas.'
    ]
  },
  {
    id: 10,
    title: 'Sinalização e Isolamento de Áreas de Manobra',
    category: 'Segurança Geral',
    urgency: 'Alto',
    description: 'A movimentação de carretas, pulverizadores e plantadeiras envolve pontos cegos significativos. Isolar a área de trabalho impede a entrada acidental de pedestres.',
    rules: [
      'Garantir que trabalhadores a pé fiquem fora do raio de giro das máquinas em operação.',
      'Utilizar cones de sinalização ou fitas zebradas ao realizar manutenção ou paradas na cabeceira.',
      'Manter contato visual constante com operadores de máquinas próximas antes de se aproximar.',
      'Não se posicionar entre o trator e o implemento acoplado quando o motor estiver ligado.'
    ]
  },
  {
    id: 11,
    title: 'Limpeza de Palha nos Motores e Escapes',
    category: 'Prevenção de Incêndios',
    urgency: 'Crítico',
    description: 'O acúmulo de palha e poeira seca sobre superfícies quentes como coletores de escape e motores pode gerar combustão espontânea. A limpeza frequente é indispensável.',
    rules: [
      'Realizar a limpeza periódica do compartimento do motor e radiador a cada intervalo de parada.',
      'Utilizar sopradores de ar comprimido ou água sob pressão para remover detritos vegetais secos.',
      'Fazer inspeções visuais regulares ao longo do dia para detectar acúmulo anormal de material.',
      'Manter o extintor de incêndio da máquina desobstruído e inspecionado dentro da validade.'
    ]
  },
  {
    id: 12,
    title: 'Ruído Industrial e Uso de Protetor Auricular',
    category: 'Saúde Ocupacional',
    urgency: 'Médio',
    description: 'A exposição prolongada ao ruído contínuo de motores causa perda auditiva irreversível. O uso correto e higienização dos protetores auriculares salvam sua audição.',
    rules: [
      'Utilizar o protetor de inserção ou concha sempre que estiver operando máquinas sem cabine fechada.',
      'Lavar as mãos antes de moldar o protetor auricular de espuma para evitar infecções no canal auditivo.',
      'Substituir o protetor sempre que apresentar ressecamento, sujeira excessiva ou perda de flexibilidade.',
      'Manter as janelas e portas da cabine fechadas quando a máquina estiver operando para reduzir ruídos.'
    ]
  },
  {
    id: 13,
    title: 'Manuseio Seguro de Defensivos e Químicos',
    category: 'Produtos Químicos',
    urgency: 'Crítico',
    description: 'Produtos fitossanitários exigem manuseio extremamente técnico para evitar intoxicações agudas ou contaminações crônicas do operador e do meio ambiente.',
    rules: [
      'Vestir o EPI completo de pulverização (macacão impermeável, máscara com filtro de carvão, luvas, botas e viseira).',
      'Nunca realizar a mistura de produtos químicos contra o sentido do vento para evitar respingos no corpo.',
      'Realizar a tríplice lavagem das embalagens vazias e inutilizá-las antes do descarte oficial.',
      'Tomar banho imediatamente após a aplicação de defensivos e lavar as roupas de trabalho separadamente.'
    ]
  },
  {
    id: 14,
    title: 'Segurança no Abastecimento de Combustível',
    category: 'Prevenção de Incêndios',
    urgency: 'Crítico',
    description: 'O diesel e outros lubrificantes liberam vapores inflamáveis durante o reabastecimento. Medidas anti-estáticas e de exclusão de chamas evitam explosões.',
    rules: [
      'Sempre desligar o motor da máquina e do comboio de abastecimento antes de iniciar a operação.',
      'É terminantemente proibido fumar, acender isqueiros ou usar celular em um raio de 15 metros do abastecimento.',
      'Aterrar adequadamente o bico de abastecimento contra o bocal do tanque para evitar faíscas estáticas.',
      'Manter kits de mitigação de vazamento (serragem ou mantas absorventes) prontos para uso no local.'
    ]
  },
  {
    id: 15,
    title: 'Cuidados com Cabos de Aço e Reboques',
    category: 'Operação de Máquinas',
    urgency: 'Alto',
    description: 'O tracionamento de cargas pesadas submete cabos de aço e correntes a tensões extremas. O rompimento abrupto de um cabo de aço gera um efeito chicote fatal.',
    rules: [
      'Inspecionar visualmente cabos de aço buscando fios partidos, corrosão ou deformações antes do uso.',
      'Utilizar apenas pinos de engate originais com travas de segurança tipo cupilha; nunca usar improvisos (parafusos soltos).',
      'Isolar o perímetro e garantir que ninguém permaneça na linha de tração ou próximo ao cabo tensionado.',
      'Realizar o tensionamento de forma lenta e gradual, sem dar trancos ou solavancos com a máquina.'
    ]
  },
  {
    id: 16,
    title: 'Organização e Limpeza nas Áreas de Vivência',
    category: 'Saúde Ocupacional',
    urgency: 'Médio',
    description: 'Áreas de vivência limpas e organizadas elevam o bem-estar da equipe e evitam a proliferação de vetores de doenças e pragas domésticas no campo.',
    rules: [
      'Descartar restos de alimentos e lixo orgânico exclusivamente nas lixeiras com tampas fechadas.',
      'Manter mesas, bancos e pisos limpos de poeira e derramamentos de suco ou refrigerante.',
      'Guardar ferramentas manuais de uso comum em caixas organizadoras específicas, nunca jogadas no chão.',
      'Assegurar que as instalações sanitárias móveis estejam devidamente abastecidas com água e sabão higiênico.'
    ]
  },
  {
    id: 17,
    title: 'Primeiros Socorros em Cortes e Escoriações',
    category: 'Primeiros Socorros',
    urgency: 'Médio',
    description: 'Pequenas lesões na pele podem infeccionar rapidamente devido ao contato com poeira, palha e umidade do campo. A higienização imediata é a melhor defesa.',
    rules: [
      'Lavar a área lesionada com água corrente limpa e sabão neutro para remover impurezas e poeira.',
      'Aplicar uma gaze estéril ou curativo limpo pressionando suavemente para estancar pequenos sangramentos.',
      'Não utilizar pomadas, fumo, café ou qualquer substância caseira sobre a ferida aberta.',
      'Informar o supervisor de segurança e registrar o evento na caixa de primeiros socorros da frente.'
    ]
  },
  {
    id: 18,
    title: 'Importância da Comunicação via Rádio UHF/VHF',
    category: 'Segurança Geral',
    urgency: 'Alto',
    description: 'Em frentes de plantio ou colheita dinâmicas, o rádio comunicador é o principal elo de coordenação para desvios de rota, emergências e aviso de riscos na pista.',
    rules: [
      'Manter o canal operacional correto sintonizado e testar o volume do rádio no início de cada jornada.',
      'Utilizar comunicação clara, objetiva e profissional; evite conversas paralelas longas nos canais de trabalho.',
      'Sempre anunciar manobras críticas, travessias de estradas movimentadas ou paradas por falha mecânica.',
      'Prestar atenção redobrada aos chamados de alerta de incêndio ou acidentes de outros colegas.'
    ]
  },
  {
    id: 19,
    title: 'Uso de Perneiras de Proteção no Campo',
    category: 'Equipamento de Proteção',
    urgency: 'Alto',
    description: 'A perneira protege os membros inferiores contra picadas de cobras venenosas, cortes por folhas afiadas de cana-de-açúcar e impactos de galhos e pedras.',
    rules: [
      'Ajustar as fivelas ou velcro da perneira de forma firme, sem deixar folgas ou aberturas na panturrilha.',
      'Calçar a perneira antes de adentrar talhões de cana, áreas de mata ou margens de córregos.',
      'Substituir o equipamento caso apresente rachaduras acentuadas, rasgos ou fivelas quebradas.',
      'Armazenar a perneira limpa e seca para evitar o apodrecimento precoce do material sintético.'
    ]
  },
  {
    id: 20,
    title: 'Segurança no Acoplamento de Implementos',
    category: 'Operação de Máquinas',
    urgency: 'Alto',
    description: 'Acoplar implementos pesados requer precisão absoluta. O esmagamento de mãos ou dedos é um risco crítico durante o alinhamento mecânico.',
    rules: [
      'Realizar a aproximação em velocidade ultra reduzida, mantendo o pé firme no freio do trator.',
      'Apenas realizar o acoplamento manual dos pinos de engate com o trator totalmente parado e freio de mão puxado.',
      'Utilizar ferramentas de alinhamento (alavancas) em vez de posicionar os dedos diretamente nos furos do engate.',
      'Instalar sempre os pinos de segurança e cupilhas originais de fábrica para evitar desengates em movimento.'
    ]
  },
  {
    id: 21,
    title: 'Prevenção de Incêndios: Faíscas Metálicas',
    category: 'Prevenção de Incêndios',
    urgency: 'Crítico',
    description: 'Atritos metálicos gerados por ferramentas, correntes arrastadas no solo ou falhas mecânicas severas podem produzir faíscas incandescentes que inflamam a palha da cana.',
    rules: [
      'Garantir que correntes de arraste e cabos de aço fiquem suspensos, sem tocar ou raspar na estrada de terra.',
      'Evitar o uso de lixadeiras, esmeris ou soldas ao ar livre perto de áreas de palha seca sem um vigia com extintor.',
      'Monitorar rolamentos desgastados em colhedoras e tratores; o superaquecimento de rolamentos gera fogo.',
      'Ter sempre à mão um abafador mecânico e manter o reservatório de água do pipa pressurizado.'
    ]
  },
  {
    id: 22,
    title: 'Segurança no Manuseio de Ferramentas Manuais',
    category: 'Ferramentas Manuais',
    urgency: 'Médio',
    description: 'Chaves de fenda, martelos, limas e alicates desgastados ou usados de forma incorreta causam cortes profundos, contusões e fraturas leves nas mãos.',
    rules: [
      'Utilizar a ferramenta correta para cada tarefa; nunca usar chaves de fenda como cinzel ou alavanca.',
      'Descartar ou enviar para manutenção ferramentas com cabos rachados, cabeças frouxas ou dentes gastos.',
      'Sempre cortar no sentido oposto ao seu corpo ao utilizar estiletes, facas ou ferramentas de corte.',
      'Usar luvas de raspa grossas ao apertar parafusos pesados para amortecer impactos caso a chave escape.'
    ]
  },
  {
    id: 23,
    title: 'Direção Defensiva: Velocidade Máxima de Segurança',
    category: 'Direção Defensiva',
    urgency: 'Alto',
    description: 'A velocidade excessiva nas estradas internas das fazendas Colombo reduz drasticamente o tempo de reação diante de pedestres ou outras máquinas agrícolas inesperadas.',
    rules: [
      'Respeitar o limite máximo estabelecido pelas placas de trânsito internas da usina (geralmente 40 km/h).',
      'Reduzir a velocidade pela metade em condições de chuva, neblina, poeira densa ou pistas escorregadias.',
      'Diminuir a marcha gradualmente ao se aproximar de cruzamentos, curvas cegas ou pontes estreitas.',
      'Nunca realizar ultrapassagens em trechos sem visibilidade ou perto de cabeceiras de talhão.'
    ]
  },
  {
    id: 24,
    title: 'Identificação de Sintomas de Insolação',
    category: 'Saúde Ocupacional',
    urgency: 'Alto',
    description: 'A insolação é uma emergência médica que ocorre quando o corpo perde a capacidade de regular sua própria temperatura interna sob calor escaldante.',
    rules: [
      'Ficar atento a tonturas, dores de cabeça fortes, náuseas e ausência de suor (pele quente e seca).',
      'Se notar um colega confuso, cambaleante ou reclamando de vista turva, retire-o do sol imediatamente.',
      'Oferecer água fresca se o trabalhador estiver consciente e resfriar seu corpo com panos molhados.',
      'Chamar o apoio de emergência da usina ou transportar a vítima imediatamente para a enfermaria central.'
    ]
  },
  {
    id: 25,
    title: 'Cuidado ao Transitar em Solo Encharcado',
    category: 'Direção Defensiva',
    urgency: 'Alto',
    description: 'A lama pesada e solos encharcados de canaviais provocam atolamentos de caminhões e tratores, sobrecarregando o sistema de transmissão e gerando risco de capotamento.',
    rules: [
      'Avaliar a firmeza do terreno a pé antes de avançar com caminhões de transporte de cana ou vinhaça.',
      'Utilizar a tração integral (bloqueio de diferencial) antes de adentrar a área crítica encharcada.',
      'Evitar esterçar bruscamente as rodas dianteiras caso o veículo comece a deslizar ou perder tração.',
      'Solicitar auxílio de trator de apoio para reboque seguro se o atolamento for iminente, sem forçar o motor.'
    ]
  },
  // We will generate 580 topics systematically to reach 605 total topics in the library.
  // Each topic is highly optimized and focused on sugarcane agricultural operation.
  ...Array.from({ length: 580 }).map((_, index) => {
    const id = index + 26;
    const categories = [
      'Equipamento de Proteção', 'Operação de Máquinas', 'Saúde Ocupacional', 
      'Prevenção de Acidentes', 'Direção Defensiva', 'Ferramentas Manuais', 
      'Prevenção de Incêndios', 'Primeiros Socorros', 'Comportamento Seguro', 
      'Produtos Químicos', 'Organização Operacional'
    ];
    const category = categories[index % categories.length];
    
    const titles = [
      "Uso Seguro de Escadas de Acesso",
      "Higienização das Mãos antes das Refeições",
      "Cuidados com Cabos Elétricos de Ferramentas Portáteis",
      "Importância da Faixa Refletiva em Roupas de Trabalho",
      "Prevenção de Choques Elétricos na Oficina Mecânica",
      "Uso Correto de Macacos Hidráulicos em Reparos",
      "Sinalização de Veículos Parados em Acostamentos",
      "Descarte Seletivo de Pilhas e Baterias no Campo",
      "Cuidados com Postura ao Levantar Pesos",
      "Verificação das Condições das Mangueiras de Combustível",
      "Prevenção de Danos nos Olhos por Cavacos de Metal",
      "Uso Obrigatório de Cinto de Segurança no Maquinário",
      "Cuidado com Animais Peçonhentos no Período Chuvoso",
      "Armazenamento Seguro de Lubrificantes na Frente",
      "Fadiga Mental do Motorista de Turno Noturno",
      "Inspeção dos Extintores das Colhedoras de Cana",
      "Riscos de Contaminação por Óleo Hidráulico sob Pressão",
      "Importância do Calçado com Palmilha de Aço no Campo",
      "Atenção ao Ruído Contínuo do Soprador de Palha",
      "Como Proceder em Caso de Vazamento de Vinhaça",
      "Manuseio de Defensivos e Equipamentos de Calibração",
      "Uso Correto de Cavaletes de Sustentação de Carga",
      "Uso de Prototor Solar com Repelente Integrado",
      "Prevenção de Lesões por Esforço Repetitivo (LER)",
      "Comunicação Eficiente com o Operador da Colhedora",
      "Sinalização Luminosa de Máquinas à Noite",
      "Cuidados com o Pé de Apoio das Carretas de Transbordo",
      "Manutenção de Cabines Climatizadas de Tratores",
      "Como Evitar Tombamentos em Terrenos Irregulares",
      "Substituição de Facas de Corte de Base com Segurança",
      "Isolamento Elétrico de Equipamentos em Manutenção",
      "Cuidado ao Manusear Palha de Cana Cortante",
      "Uso Adequado de Máscara de Proteção Respiratória",
      "Cuidados com Rolamentos Quentes na Colheita",
      "Inspeção Diária do Nível de Água do Pipa de Apoio",
      "Transporte Seguro de Ferramentas Manuais na Caixa",
      "Postura Correta Durante Intervalos de Almoço",
      "Perigos do Uso de Adornos na Operação",
      "Cuidados com Manobras Próximas a Cercas de Arame",
      "Manuseio Seguro de Gás de Solda",
      "Manutenção de Distância Segura do Picador de Cana",
      "Importância da Lavagem Semanal do Uniforme Agrícola",
      "Como Agir em Caso de Tempestade com Raios",
      "Prevenção de Picadas de Abelhas e Marimbondos",
      "Uso de Lanternas de Cabeça no Turno da Noite",
      "Cuidados com Pontos de Esmagamento na Grade de Discos",
      "Verificação das Travas do Engate Rápido de Mangueiras",
      "Inspeção das Escadas de Silos e Caixas de Vinhaça",
      "Armazenamento de Medicamentos Básicos na Frente",
      "Cuidado com a Fadiga Visual sob Luz Solar Forte",
      "Riscos de Fumar Próximo a Depósitos de Palha Seca",
      "Sinalização de Pontes Estreitas e Travessias de Rios",
      "Direção Defensiva em Dias de Muita Poeira e Vento",
      "Uso Adequado de Macacão Impermeável na Pulverização",
      "Como Identificar Rolamentos Pré-Superaquecidos",
      "Inspeção de Engates Rápidos e Conectores Hidráulicos",
      "Organização dos Cabos de Solda na Oficina Móvel",
      "Uso Correto de Óculos Escuros com Proteção UV",
      "Cuidados ao Estacionar Veículos de Apoio na Cabeceira",
      "Prevenção de Quedas de Objetos de Cima do Comboio",
      "Uso Adequado do Kit de Proteção Contra Queimaduras",
      "Prevenção de Incêndios: Freio Travado de Implementos",
      "Cuidado ao Transitar Perto de Curvas de Nível Altas",
      "Uso Correto de Botinas de Segurança de Couro Nobre",
      "Segurança Ocupacional: Limpeza do Ar Condicionado",
      "Cuidados com Manobras do Caminhão Prancha (Pranchão)",
      "Como Evitar Choque de Carga em Tratores Articulados",
      "Isolamento das Pontas de Eixos Rotativos (Cardans)",
      "Cuidados ao Utilizar Lixadeiras Pneumáticas no Campo",
      "Identificação de Vazamentos de Óleo de Motor no Solo",
      "Importância do Descanço Físico nas Horas de Folga",
      "Respeito aos Sinais de Parada da Equipe de Apoio",
      "Uso Correto de Cinto Lombar em Atividades Pesadas",
      "Prevenção de Acidentes com Animais Domésticos Soltos",
      "Sinalização de Risco em Valas de Drenagem e Canais",
      "Inspeção de Molas de Retorno e Freios de Transbordo",
      "Riscos de Sobrecarga Elétrica no Carregador Solar",
      "Cuidados de Segurança ao Cruzar Linhas de Trem",
      "Uso de Repelente Contra Insetos Transmissores",
      "Como Manter o Foco no Trabalho em Dias Monótonos"
    ];
    
    const locations = [
      'na Frente de Colheita',
      'na Usina Ariranha',
      'na Usina Palestina',
      'na Usina Santa Albertina',
      'na Oficina Mecânica Central',
      'no Comboio de Abastecimento',
      'nas Estradas de Terra Internas',
      'no Pátio de Cana',
      'durante o Plantio de Cana',
      'na Área de Vivência Móvel',
      'no Turno Diurno',
      'no Turno Noturno',
      'na Aplicação de Defensivos',
      'no Transporte de Vinhaça',
      'no Setor de Carregamento',
      'na Preparação do Solo',
      'na Oficina de Apoio Móvel'
    ];
    
    const titleBase = titles[index % titles.length];
    const location = locations[(index * 7) % locations.length];
    const title = `${titleBase} ${location}`;
    
    const urgencies: ('Crítico' | 'Alto' | 'Médio')[] = ['Crítico', 'Alto', 'Médio'];
    const urgency = urgencies[index % 3];
    
    // Helper to generate context-specific descriptions and rules
    const getDetails = (tName: string, catName: string) => {
      let desc = `Este diálogo diário de segurança foca nas melhores práticas e diretrizes de ${catName.toLowerCase()} na Colombo Agroindústria para a prevenção de incidentes.`;
      let rls = [
        `Familiarize-se com todos os riscos envolvidos na atividade de ${catName.toLowerCase()}.`,
        `Verifique o estado de conservação de todas as ferramentas e equipamentos antes do uso.`,
        `Sempre faça uso do EPI específico obrigatório recomendado pelo SESMT para esta tarefa.`,
        `Em caso de qualquer incidente, quase-acidente ou anomalia, relate imediatamente à supervisão.`
      ];

      const t = tName.toLowerCase();
      if (t.includes('escada') || t.includes('acesso')) {
        desc = "Escadas de acesso em silos, tanques e máquinas requerem atenção máxima para evitar quedas graves que podem causar fraturas ou traumas severos.";
        rls = [
          "Sempre limpe as solas de suas botas para retirar lama, graxa ou óleo antes de iniciar a subida.",
          "Mantenha sempre a regra de ouro dos três pontos de apoio (duas mãos e um pé, ou dois pés e uma mão).",
          "Nunca suba escadas carregando ferramentas ou materiais pesados nas mãos; utilize uma corda ou bolsa de serviço.",
          "Inspecione visualmente se os degraus e corrimãos apresentam trincas, soldas partidas ou folgas estruturais."
        ];
      } else if (t.includes('higienização') || t.includes('mãos') || t.includes('lavagem')) {
        desc = "A higiene adequada no campo previne doenças gastroinfectantes, intoxicações por resíduos químicos e contaminações por parasitas comuns do solo agrícola.";
        rls = [
          "Lave as mãos rigorosamente com água limpa e sabonete neutro antes de qualquer refeição ou lanche no campo.",
          "Sempre higienize as mãos após o manuseio de óleos lubrificantes, ferramentas da oficina móvel ou uso do banheiro.",
          "Nunca se alimente dentro do talhão de cana-de-açúcar ou mantendo as luvas de proteção calçadas.",
          "Mantenha a área de vivência e refeitório limpos, descartando todo lixo orgânico nas lixeiras com tampa."
        ];
      } else if (t.includes('cabo') || t.includes('elétrico') || t.includes('choque')) {
        desc = "A eletricidade no campo ou na oficina móvel pode causar choques de alta intensidade, queimaduras severas e parada cardiorrespiratória se a fiação estiver exposta.";
        rls = [
          "Nunca utilize ferramentas elétricas portáteis que possuam cabos desgastados, descascados ou com emendas de fita comuns.",
          "Garanta o desligamento da chave geral e sinalização adequada antes de qualquer intervenção elétrica nas oficinas.",
          "Evite operar qualquer ferramenta elétrica em áreas com pisos úmidos, alagados ou sob chuva sem isolamento adequado.",
          "Inspecione plugues, extensões e tomadas antes de plugar geradores ou máquinas de soldagem no campo."
        ];
      } else if (t.includes('refletiva') || t.includes('roupas') || t.includes('uniforme')) {
        desc = "A alta visibilidade do trabalhador no campo é a principal barreira protetora contra atropelamentos e colisões por máquinas pesadas, especialmente à noite.";
        rls = [
          "Mantenha as faixas refletivas do uniforme sempre limpas e isentas de graxa pesada, lama ou poeira excessiva.",
          "É proibido alterar a confecção original do uniforme (como cortar mangas ou remover as faixas refletivas).",
          "Utilize o colete de alta visibilidade complementar ao transitar a pé perto de frentes de colheita ou carretas transbordo.",
          "Solicite a substituição imediata do uniforme caso as faixas refletivas percam o brilho ou fiquem rasgadas."
        ];
      } else if (t.includes('macaco') || t.includes('cavalete') || t.includes('sustentação')) {
        desc = "O levantamento de tratores e carretas de grande porte exige procedimentos de segurança rígidos para evitar esmagamentos em caso de falha hidráulica.";
        rls = [
          "Nunca confie apenas na sustentação hidráulica ou pneumática de macacos; utilize sempre cavaletes de segurança mecânicos rígidos.",
          "Posicione o macaco estritamente nos pontos de apoio estruturais indicados pelo manual de serviço do maquinário.",
          "Calce firmemente todas as rodas do veículo que permanecerão em contato com o solo para evitar deslocamentos indesejados.",
          "Garantir que absolutamente nenhum trabalhador se posicione embaixo da máquina até que os cavaletes estejam travados."
        ];
      } else if (t.includes('sinalização') || t.includes('veículos parados') || t.includes('estacionar')) {
        desc = "Veículos parados incorretamente em estradas de terra representam risco severo de acidentes e colisões por falta de visibilidade causada pela poeira.";
        rls = [
          "Sempre estacione veículos de apoio, caminhões ou tratores parados totalmente fora da área de rolamento (no acostamento ou cabeceiras).",
          "Utilize triângulos de segurança e cones reflexivos posicionados a distâncias seguras da traseira de veículos parados.",
          "Mantenha o pisca-alerta ativado e, se a visibilidade estiver prejudicada ou à noite, mantenha o giroflex aceso.",
          "Evite estacionar em pontos cegos, curvas acentuadas, lombadas de terra ou cabeceiras de pontes estreitas."
        ];
      } else if (t.includes('pilhas') || t.includes('baterias') || t.includes('descarte')) {
        desc = "O descarte correto de resíduos industriais e químicos evita a contaminação ambiental e mantém a usina em plena conformidade com as leis rígidas.";
        rls = [
          "Nunca descarte pilhas, baterias, estopas oleosas ou filtros usados no solo ou misturados ao lixo comum.",
          "Deposite os resíduos industriais perigosos estritamente nos coletores de logística reversa indicados nas frentes.",
          "Armazene baterias usadas em local coberto, ventilado e sobre paletes plásticos de contenção.",
          "No caso de vazamento de ácido de baterias, utilize o EPI químico apropriado e neutralizadores antes da lavagem."
        ];
      } else if (t.includes('postura') || t.includes('levantar pesos') || t.includes('ergonomia')) {
        desc = "Lesões na região lombar decorrentes de levantamento inadequado de peso causam fortes dores e afastamentos. Aprenda a usar a força do corpo de forma correta.";
        rls = [
          "Para levantar qualquer carga do solo, dobra os joelhos e mantenha a coluna perfeitamente ereta, impulsionando com as pernas.",
          "Mantenha a carga o mais próximo possível do seu peito ou abdômen ao transportá-la a pé.",
          "Nunca gire ou torça o tronco enquanto estiver sustentando ou movendo um volume pesado; mude a direção movendo as pernas.",
          "Solicite apoio de um colega de trabalho ou use guinchos mecânicos para cargas que ultrapassem o limite recomendado (25 kg)."
        ];
      } else if (t.includes('mangueiras') || t.includes('combustível') || t.includes('óleo')) {
        desc = "Fluidos lubrificantes ou óleo combustível sob alta pressão e temperaturas elevadas podem causar lesões por injeção cutânea e incêndios em superfícies quentes.";
        rls = [
          "Inspecione diariamente mangueiras flexíveis e tubulações buscando rachaduras, ressecamentos ou desgastes por atrito mecânico.",
          "Nunca passe as mãos sem luvas grossas sobre conexões pressurizadas para buscar vazamentos ocultos.",
          "Substitua preventivamente qualquer mangueira que mostre a malha metálica interna antes que ela se rompa sob pressão.",
          "Remova imediatamente detritos de óleos combustíveis derramados sobre blocos de motor ou coletores de escape."
        ];
      } else if (t.includes('olhos') || t.includes('óculos') || t.includes('proteção uv')) {
        desc = "Nossa visão é insubstituível. Riscos de projeção de fagulhas de solda, poeira, pedras ou respingos de químicos exigem proteção irrestrita.";
        rls = [
          "Use os óculos de proteção de policarbonato durante 100% da sua jornada de trabalho ao ar livre.",
          "Em serviços de solda, corte com lixadeira ou esmerilhamento, use obrigatoriamente a máscara facial com visor correto.",
          "Se partículas estranhas entrarem em contato com o olho, evite esfregar; lave imediatamente com soro ou água limpa.",
          "Mantenha os óculos de proteção limpos e bem guardados para evitar riscos nas lentes que prejudiquem a visibilidade."
        ];
      } else if (t.includes('cinto de segurança')) {
        desc = "O cinto de segurança é o mais simples e eficaz salvador de vidas em acidentes com tratores, caminhões e veículos utilitários no campo.";
        rls = [
          "Afivele o cinto de segurança assim que subir no assento, mesmo para deslocamentos curtos dentro do talhão.",
          "Inspecione o estado das fitas, travas e parafusos de ancoragem do cinto de segurança regularmente.",
          "Nunca coloque adaptadores ou travas que impeçam o cinto de retrair ou que o deixem frouxo.",
          "Avise imediatamente o mecânico se a fivela do cinto estiver travando com dificuldade ou frouxa."
        ];
      } else if (t.includes('lubrificantes') || t.includes('armazenamento')) {
        desc = "A estocagem e movimentação técnica de graxas, solventes e lubrificantes elimina riscos de contaminações graves do solo e incêndios acidentais.";
        rls = [
          "Todos os reservatórios e tambores devem ser guardados sob bandejas de contenção à prova de vazamento.",
          "Rotule ou adesive adequadamente todos os recipientes menores indicando com clareza o tipo de fluido contido.",
          "Mantenha os extintores de incêndio da oficina de apoio desobstruídos e devidamente posicionados perto dos estoques.",
          "Nunca misture diferentes tipos de lubrificantes usados; descarte-os no tambor correto de coleta."
        ];
      } else if (t.includes('fadiga') || t.includes('turno') || t.includes('noturno') || t.includes('sono')) {
        desc = "O cansaço severo prejudica a atenção, reduz as reações reflexas e aumenta o risco de acidentes graves em maquinários dinâmicos.";
        rls = [
          "Garanta uma boa rotina de sono e repouso nas horas de folga antes do início de seu expediente operacional.",
          "Se sentir cansaço extremo ou sonolência incontrolável ao volante, pare em área segura e informe seu supervisor.",
          "Evite ingerir comidas pesadas ou gordurosas antes do turno de trabalho noturno para minimizar a letargia corporal.",
          "Faça pequenas pausas programadas para descer da cabine (com segurança), alongar as pernas e lavar o rosto."
        ];
      } else if (t.includes('extintor') || t.includes('incêndio')) {
        desc = "Combater princípios de incêndio em colhedoras de cana exige conhecimento prático do uso e perfeita conservação dos extintores.";
        rls = [
          "Inspecione o indicador do manômetro diariamente; a agulha deve estar estritamente no centro da zona verde.",
          "Confirme se o lacre de plástico e o anel de segurança de metal estão totalmente preservados e sem violações.",
          "Ao acionar o extintor, posicione-se a uma distância segura, a favor do vento, direcionando o jato na base do fogo.",
          "Sempre encaminhe o extintor para manutenção e recarga após qualquer tipo de acionamento, mesmo que por segundos."
        ];
      } else if (t.includes('comunicação') || t.includes('rádio') || t.includes('sinais')) {
        desc = "A coordenação de rádio eficaz evita colisões entre colhedoras de cana, tratores transbordo e caminhões pesados em manobras estreitas.";
        rls = [
          "Antes de aproximar seu trator para receber carga de cana, confirme por rádio ou sinalização visual clara com o operador.",
          "Mantenha o rádio UHF/VHF sempre regulado no canal operacional correto da sua equipe e teste o volume no início do dia.",
          "Utilize chamadas de rádio curtas, claras e estritamente profissionais; evite o uso de rádio para fins não laborais.",
          "Não realize nenhuma ultrapassagem de maquinário pesado na cabeceira sem obter a liberação via rádio antes."
        ];
      } else if (t.includes('tempestade') || t.includes('raios') || t.includes('clima')) {
        desc = "No campo aberto de plantações de cana, os raios elétricos representam perigos letais massivos se as frentes não pararem a tempo.";
        rls = [
          "Ao constatar a aproximação de tempestade com raios e trovões audíveis, suspenda imediatamente todo trabalho externo.",
          "Busque refúgio dentro de cabines metálicas totalmente fechadas de tratores ou caminhões (que funcionam como gaiolas protetoras).",
          "Mantenha-se afastado de cercas metálicas, linhas de alta tensão, árvores isoladas e implementos metálicos elevados.",
          "Nunca permaneça em cima de carrocerias de caminhões ou sob implementos agrícolas sem cabines metálicas."
        ];
      } else if (t.includes('vazamento') || t.includes('vinhaça')) {
        desc = "O controle de vazamento de vinhaça ou fertilizantes líquidos é vital para evitar acidentes ecológicos e contaminações de córregos próximos.";
        rls = [
          "Verifique diariamente vedações, travas mecânicas e conexões de engate rápido das mangueiras de vinhaça.",
          "Se ocorrer rompimento de conexões ou tubulações, pare as bombas principais imediatamente para conter a pressão.",
          "Utilize o trator ou pá de apoio para construir valas de terra ou barreiras temporárias e reter a vinhaça espalhada.",
          "Reporte imediatamente a ocorrência ao departamento de Meio Ambiente e SST da Colombo Agroindústria."
        ];
      }

      return { desc, rls };
    };

    const details = getDetails(title, category);

    return {
      id,
      title,
      category,
      urgency,
      description: details.desc,
      rules: details.rls
    };
  })
];
