-- =========================================================================
-- PPT SUPABASE POSTGRESQL - CENTRAL DATA REGISTRY DATABASE SCHEMA (REVISED)
-- Project: Plantio & Vinhaça Control System
-- Optimized for Security, Performance & Supabase Auth Integration
-- =========================================================================

-- -------------------------------------------------------------------------
-- 0. UTILITIES AND EXTENSIONS
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- -------------------------------------------------------------------------
-- 1. USERS & PROFILES INTEGRATION WITH SUPABASE AUTH
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    dark_mode BOOLEAN DEFAULT false,
    color_theme TEXT DEFAULT 'green',
    sidebar_collapsed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, color_theme, dark_mode)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        'green',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------------------
-- 2. OPERATIONAL MODULES (PLANTIO & FRENTES)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.frentes (
    id SERIAL PRIMARY KEY,
    frente TEXT NOT NULL,
    nome TEXT,
    fazenda TEXT,
    cidade TEXT,
    quadras INTEGER DEFAULT 0,
    talhoes INTEGER DEFAULT 0,
    gestor TEXT,
    status TEXT,
    obs TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.fleet (
    id SERIAL PRIMARY KEY,
    unidade TEXT NOT NULL,
    tipo TEXT NOT NULL,
    modelo TEXT,
    prefixo TEXT NOT NULL,
    status TEXT DEFAULT 'Reserva',
    hourly_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.plantio_history (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    usina TEXT NOT NULL,
    fleet_snapshot JSONB DEFAULT '[]'::jsonb,
    efficiency TEXT,
    cleared_at TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.logs (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    event TEXT NOT NULL,
    detail TEXT,
    time TEXT NOT NULL,
    user_email TEXT DEFAULT 'luizricardocarvalhod@gmail.com',
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 3. AREA MANAGEMENT MODULE (GESTÃO DE ÁREAS)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gestao_areas_gerencial (
    id SERIAL PRIMARY KEY,
    usina TEXT NOT NULL,
    modalidade TEXT NOT NULL,
    frente TEXT,
    dia_planej NUMERIC DEFAULT 0,
    dia_realiz NUMERIC DEFAULT 0,
    dia_chuva NUMERIC DEFAULT 0,
    mes_planej NUMERIC DEFAULT 0,
    mes_realiz NUMERIC DEFAULT 0,
    mes_chuva NUMERIC DEFAULT 0,
    acumulado_planej NUMERIC DEFAULT 0,
    acumulado_realiz NUMERIC DEFAULT 0,
    acumulado_chuva NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gestao_areas_banco (
    id TEXT PRIMARY KEY,
    usina TEXT NOT NULL,
    fazenda TEXT NOT NULL,
    quadra TEXT NOT NULL,
    talhao TEXT NOT NULL,
    area_plantio NUMERIC DEFAULT 0,
    sistema_plantio TEXT,
    renovacao TEXT,
    variedade TEXT,
    fleg_plantio TEXT,
    plantio_cco NUMERIC DEFAULT 0,
    plantio_pims NUMERIC DEFAULT 0,
    status_area TEXT DEFAULT 'Á PLANTAR',
    situacao_plantio TEXT,
    replantio BOOLEAN DEFAULT false,
    conf_sist_plantio TEXT DEFAULT 'Pendente',
    conf_sist_area TEXT,
    sistematizacao NUMERIC DEFAULT 0,
    sulcacao NUMERIC DEFAULT 0,
    cobricao NUMERIC DEFAULT 0,
    distribuicao NUMERIC DEFAULT 0,
    transporte_muda NUMERIC DEFAULT 0,
    carregamento NUMERIC DEFAULT 0,
    descarregamento NUMERIC DEFAULT 0,
    corte_muda NUMERIC DEFAULT 0,
    transporte_insumos NUMERIC DEFAULT 0,
    apoio NUMERIC DEFAULT 0,
    tampacao NUMERIC DEFAULT 0,
    quebra_lombo NUMERIC DEFAULT 0,
    aplic_herbicida NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gestao_areas_boletim (
    id SERIAL PRIMARY KEY,
    usina TEXT NOT NULL,
    turno TEXT NOT NULL,
    horario TEXT,
    plantio NUMERIC DEFAULT 0,
    chuva NUMERIC DEFAULT 0,
    viagens NUMERIC DEFAULT 0,
    muda NUMERIC DEFAULT 0,
    rendimento NUMERIC DEFAULT 0,
    pessoas NUMERIC DEFAULT 0,
    hec_pessoas NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'TRABALHOU',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gestao_areas_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    categoria TEXT NOT NULL,
    frente TEXT,
    fazenda TEXT,
    detalhes TEXT NOT NULL,
    usuario TEXT DEFAULT 'luizricardocarvalhod@gmail.com',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.gestao_areas_divergencias (
    id SERIAL PRIMARY KEY,
    frente TEXT NOT NULL,
    modalidade TEXT NOT NULL,
    fisico_mecanizado NUMERIC DEFAULT 0,
    fisico_meiosi NUMERIC DEFAULT 0,
    total_fisico NUMERIC DEFAULT 0,
    pims_mecanizado NUMERIC DEFAULT 0,
    pims_meiosi NUMERIC DEFAULT 0,
    total_pims NUMERIC DEFAULT 0,
    desvio NUMERIC DEFAULT 0,
    status TEXT NOT NULL,
    data_auditoria TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.usina_areas_data (
    usina TEXT PRIMARY KEY,
    areas_text TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analytical_maps (
    id TEXT PRIMARY KEY,
    usina TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 4. VINHAÇA MODULE (DESPACHOS, APONTAMENTOS, NÍVEIS, HISTÓRICO)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vinhaca_nivel_carregamentos (
    id TEXT PRIMARY KEY,
    usina TEXT NOT NULL,
    data_hora TEXT,
    altura_caixa NUMERIC DEFAULT 0,
    altura_maxima NUMERIC DEFAULT 0,
    volume_maximo NUMERIC DEFAULT 0,
    capacidade_caminhao NUMERIC DEFAULT 0,
    variacao_periodo NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vinhaca_fechamentos (
    unit_id TEXT PRIMARY KEY REFERENCES public.vinhaca_nivel_carregamentos(id) ON DELETE CASCADE,
    periodo_inicio TEXT,
    periodo_fim TEXT,
    trips_54_1 INTEGER DEFAULT 0,
    trips_54_2 INTEGER DEFAULT 0,
    trips_54_4 INTEGER DEFAULT 0,
    trips_51_1 INTEGER DEFAULT 0,
    trips_51_2 INTEGER DEFAULT 0,
    trips_51_3 INTEGER DEFAULT 0,
    vol_per_trip_54 NUMERIC DEFAULT 0,
    vol_per_trip_51 NUMERIC DEFAULT 0,
    lancados_trips INTEGER DEFAULT 0,
    lancados_m3 NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vinhaca_despacho_trucks (
    id TEXT PRIMARY KEY,
    caminhao TEXT NOT NULL,
    primeiro_tanque TEXT,
    segundo_tanque TEXT,
    cm_alocado TEXT,
    condicao TEXT DEFAULT 'Livre',
    frente_situacao TEXT,
    data_hora_alocacao TEXT,
    operacao_tempo TEXT,
    tempo_horario TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vinhaca_apontamentos (
    data DATE NOT NULL,
    hora TEXT NOT NULL,
    f_54_4_vln INTEGER DEFAULT 0,
    f_54_2_vln INTEGER DEFAULT 0,
    f_54_1_vln INTEGER DEFAULT 0,
    f_51_4_asp INTEGER DEFAULT 0,
    f_51_2_asp INTEGER DEFAULT 0,
    f_51_3_asp INTEGER DEFAULT 0,
    solicitado INTEGER DEFAULT 0,
    atendidos INTEGER DEFAULT 0,
    teor_k2o NUMERIC DEFAULT 0,
    caixa_usina_1 NUMERIC DEFAULT 0,
    caixa_usina_2 NUMERIC DEFAULT 0,
    caixa_acorce NUMERIC DEFAULT 0,
    caixa_leila NUMERIC DEFAULT 0,
    caixa_olaria NUMERIC DEFAULT 0,
    caixa_rosa NUMERIC DEFAULT 0,
    caixa_man_linha NUMERIC DEFAULT 0,
    agua_residuais NUMERIC DEFAULT 0,
    vazao_vinhaca_informada NUMERIC DEFAULT 0,
    vazao_real NUMERIC DEFAULT 0,
    total_estoque NUMERIC DEFAULT 0,
    retirado NUMERIC DEFAULT 0,
    necessidade_trabalhou NUMERIC DEFAULT 0,
    caminhao_necessidade NUMERIC DEFAULT 0,
    caminhao_trabalhou NUMERIC DEFAULT 0,
    obs TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (data, hora)
);

CREATE TABLE IF NOT EXISTS public.vinhaca_historico (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    origem TEXT NOT NULL,
    tipo_acao TEXT NOT NULL,
    caminhao TEXT,
    detalhes TEXT NOT NULL,
    user_email TEXT DEFAULT 'luizricardocarvalhod@gmail.com',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.vinhaca_painel_telemetria (
    id TEXT PRIMARY KEY,
    vazao_vinhaca NUMERIC DEFAULT 280,
    subindo_em TEXT DEFAULT '-280 M³',
    necessidade_cm_retirar INTEGER DEFAULT 10,
    necessidade_cm_manter INTEGER DEFAULT 10,
    necessidade_cm_limite INTEGER DEFAULT 9,
    necessidade_avl_rolo INTEGER DEFAULT 3,
    litros_retirados TEXT DEFAULT '1.920.000 L',
    litros_lancados TEXT DEFAULT '2.385.000 L',
    necessidade_tanques INTEGER DEFAULT 20,
    tanques_trabalhando INTEGER DEFAULT 42,
    tanques_parados INTEGER DEFAULT 14,
    raio_medio_atendido NUMERIC DEFAULT 13,
    idx_aderencia TEXT DEFAULT '50,0%',
    eficiencia_caminhoes TEXT DEFAULT '35%',
    caminhoes_usina INTEGER DEFAULT 9,
    caminhoes_acorce INTEGER DEFAULT 7,
    caminhoes_leila INTEGER DEFAULT 0,
    caminhoes_olaria INTEGER DEFAULT 0,
    caminhoes_sta_rosa INTEGER DEFAULT 6,
    sequencia TEXT DEFAULT '1,2,3,4,6,7,8',
    medias TEXT[] DEFAULT ARRAY[
        '45 m³', '8 min', '7 min', '31 min', '190 m³/h',
        '0 min', '13 min', '45 min', '26 min', '40 min',
        '25 min', '6 min', '39 min', '30 min', '45 min',
        '20 min', '50 min'
    ],
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.coazito_chat_history (
    id TEXT PRIMARY KEY,
    user_email TEXT DEFAULT 'luizricardocarvalhod@gmail.com',
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 5. EXCEL DATA INGESTION DIARIES (COA, PLANTIO, PLUVIOMETRIA)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.diario_coa (
    id SERIAL PRIMARY KEY,
    usina TEXT NOT NULL,
    last_update TEXT NOT NULL,
    excel_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.diario_plantio (
    id SERIAL PRIMARY KEY,
    usina TEXT NOT NULL,
    last_update TEXT NOT NULL,
    excel_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.diario_pluviometria (
    id SERIAL PRIMARY KEY,
    usina TEXT NOT NULL,
    last_update TEXT NOT NULL,
    excel_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 6. DDS SAFETY DISCUSSIONS MODULE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dds_topics (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.dds_meetings (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    usina TEXT NOT NULL,
    frente TEXT,
    topic_title TEXT NOT NULL,
    category TEXT NOT NULL,
    attendees TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 7. AUTO-UPDATE TIMESTAMPS TRIGGERS
-- -------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE public.apply_updated_at_triggers() AS $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'profiles', 'frentes', 'fleet', 'gestao_areas_gerencial', 
        'gestao_areas_banco', 'gestao_areas_boletim', 'gestao_areas_divergencias',
        'usina_areas_data', 'analytical_maps', 'vinhaca_nivel_carregamentos', 
        'vinhaca_fechamentos', 'vinhaca_despacho_trucks', 'vinhaca_apontamentos', 
        'vinhaca_painel_telemetria', 'diario_coa', 'diario_plantio', 
        'diario_pluviometria', 'dds_topics', 'dds_meetings'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%I ON public.%I;', t, t);
        EXECUTE format('CREATE TRIGGER trigger_update_%I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CALL public.apply_updated_at_triggers();
DROP PROCEDURE public.apply_updated_at_triggers();

-- -------------------------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE OPTIMIZATION
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_fleet_prefixo ON public.fleet(prefixo);
CREATE INDEX IF NOT EXISTS idx_frentes_frente ON public.frentes(frente);
CREATE INDEX IF NOT EXISTS idx_logs_type ON public.logs(type);
CREATE INDEX IF NOT EXISTS idx_gestao_areas_banco_usina ON public.gestao_areas_banco(usina);
CREATE INDEX IF NOT EXISTS idx_gestao_areas_boletim_usina ON public.gestao_areas_boletim(usina);
CREATE INDEX IF NOT EXISTS idx_vinhaca_despacho_trucks_caminhao ON public.vinhaca_despacho_trucks(caminhao);
CREATE INDEX IF NOT EXISTS idx_vinhaca_apontamentos_data ON public.vinhaca_apontamentos(data);
CREATE INDEX IF NOT EXISTS idx_vinhaca_historico_timestamp ON public.vinhaca_historico(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gestao_areas_logs_categoria ON public.gestao_areas_logs (categoria);
CREATE INDEX IF NOT EXISTS idx_coazito_chat_history_user_email ON public.coazito_chat_history (user_email);
CREATE INDEX IF NOT EXISTS idx_diario_coa_usina ON public.diario_coa(usina);
CREATE INDEX IF NOT EXISTS idx_diario_plantio_usina ON public.diario_plantio(usina);
CREATE INDEX IF NOT EXISTS idx_diario_pluviometria_usina ON public.diario_pluviometria(usina);
CREATE INDEX IF NOT EXISTS idx_dds_meetings_date ON public.dds_meetings(date);

-- -------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plantio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_areas_gerencial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_areas_banco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_areas_boletim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usina_areas_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytical_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinhaca_nivel_carregamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinhaca_fechamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinhaca_despacho_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinhaca_apontamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinhaca_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_areas_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_areas_divergencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinhaca_painel_telemetria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coazito_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diario_coa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diario_plantio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diario_pluviometria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dds_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dds_meetings ENABLE ROW LEVEL SECURITY;

-- Setup secure dynamic RLS policy assignments
CREATE OR REPLACE PROCEDURE public.apply_rls_policies() AS $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'frentes', 'fleet', 'plantio_history', 'logs', 'gestao_areas_gerencial', 
        'gestao_areas_banco', 'gestao_areas_boletim', 'gestao_areas_logs',
        'gestao_areas_divergencias', 'usina_areas_data', 'analytical_maps', 
        'vinhaca_nivel_carregamentos', 'vinhaca_fechamentos', 'vinhaca_despacho_trucks', 
        'vinhaca_apontamentos', 'vinhaca_historico', 'vinhaca_painel_telemetria',
        'coazito_chat_history', 'diario_coa', 'diario_plantio', 'diario_pluviometria', 
        'dds_topics', 'dds_meetings'
    ];
BEGIN
    -- Profiles policy
    DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
    CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
    
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

    FOREACH t IN ARRAY tables LOOP
        -- Select Policy
        EXECUTE format('DROP POLICY IF EXISTS "Select allowed for authenticated" ON public.%I;', t);
        EXECUTE format('CREATE POLICY "Select allowed for authenticated" ON public.%I FOR SELECT TO authenticated USING (true);', t);
        
        -- Modification Policy
        EXECUTE format('DROP POLICY IF EXISTS "All operations allowed for authenticated" ON public.%I;', t);
        EXECUTE format('CREATE POLICY "All operations allowed for authenticated" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CALL public.apply_rls_policies();
DROP PROCEDURE public.apply_rls_policies();
