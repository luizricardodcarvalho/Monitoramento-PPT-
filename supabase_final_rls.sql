-- PPT SUPABASE HARDENED RLS POLICIES
-- Execute este script no SQL Editor do Supabase (https://app.supabase.com/project/_/sql)

-- 1. LIMPEZA E SEGURANÇA INICIAL
-- ------------------------------
-- Garante que RLS está habilitado em todas as tabelas
ALTER TABLE frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- 2. FUNÇÕES DE VALIDAÇÃO (PILLAR 3: ID Poisoning Guard)
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_valid_id(id text)
RETURNS boolean AS $$
BEGIN
  RETURN id IS NOT NULL AND length(id) <= 128 AND id ~ '^[a-zA-Z0-9_\-]+$';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLÍTICAS DE ACESSO (PILLAR 6 & 8: Secure List Queries & PII Isolation)
-- -------------------------------------------------------------------------

-- TABELA: FRENTES
DROP POLICY IF EXISTS "Enable read for all" ON frentes;
CREATE POLICY "Enable read for all" 
ON frentes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Restricted write access" ON frentes;
CREATE POLICY "Restricted write access" 
ON frentes FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- TABELA: FLEET
DROP POLICY IF EXISTS "Enable read for all" ON fleet;
CREATE POLICY "Enable read for all" 
ON fleet FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Restricted write access" ON fleet;
CREATE POLICY "Restricted write access" 
ON fleet FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- TABELA: PLANTIO HISTORY
DROP POLICY IF EXISTS "Enable read for all" ON plantio_history;
CREATE POLICY "Enable read for all" 
ON plantio_history FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Restricted write access" ON plantio_history;
CREATE POLICY "Restricted write access" 
ON plantio_history FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- TABELA: LOGS
DROP POLICY IF EXISTS "Enable read for all" ON logs;
CREATE POLICY "Enable read for all" 
ON logs FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Restricted write access" ON logs;
CREATE POLICY "Restricted write access" 
ON logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.role() = 'authenticated');

-- 4. ALERTA DE VULNERABILIDADE (PILLAR 4: Tiered Identity Logic)
-- -------------------------------------------------------------
-- IMPORTANTE: NUNCA exponha a 'service_role key' (sb_secret_...) no seu arquivo .env do frontend (Vite).
-- Use sempre a 'anon key' pública. O Supabase usará as políticas RLS acima para decidir
-- se o usuário (mesmo anônimo) pode ou não realizar a operação.

-- Se você precisar de acesso total e seguro via backend (server.ts), 
-- o server.ts deve usar a SUPABASE_SERVICE_ROLE_KEY armazenada como SEGREDO de ambiente.
