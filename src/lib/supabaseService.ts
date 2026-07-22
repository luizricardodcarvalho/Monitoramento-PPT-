import { supabase, isSupabaseConfigured } from './supabase';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// In-memory query cache map with 5s TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}
const queryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5000;

function pruneExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of queryCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      queryCache.delete(key);
    }
  }
  if (queryCache.size > 80) {
    const keys = Array.from(queryCache.keys());
    for (let i = 0; i < 20 && i < keys.length; i++) {
      queryCache.delete(keys[i]);
    }
  }
}

function clearTableCache(table: string) {
  const prefix = `${table}:`;
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  }
}

/**
 * Utility to check if Supabase is active and operational.
 */
export function isSupabaseReady(): boolean {
  return isSupabaseConfigured();
}

/**
 * Generic Fetch helper for any table with loading, error handling and 5s TTL caching.
 */
export async function fetchFromTable<T = any>(
  table: string,
  options?: {
    select?: string;
    eq?: { column: string; value: any };
    order?: { column: string; ascending?: boolean };
    limit?: number;
    bypassCache?: boolean;
  }
): Promise<ServiceResponse<T[]>> {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' };
  }

  const cacheKey = `${table}:${JSON.stringify(options || {})}`;
  if (!options?.bypassCache && queryCache.has(cacheKey)) {
    const cached = queryCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { data: cached.data as T[], error: null };
    }
  }

  try {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.eq) {
      query = query.eq(options.eq.column, options.eq.value);
    }

    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`[Supabase Error - fetchFromTable (${table})]:`, error);
      return { data: null, error: translateSupabaseError(error.message) };
    }

    pruneExpiredCache();
    queryCache.set(cacheKey, { data, timestamp: Date.now() });
    return { data: data as T[], error: null };
  } catch (err: any) {
    console.error(`[Supabase Catch - fetchFromTable (${table})]:`, err);
    return { data: null, error: translateSupabaseError(err.message) || 'Erro inesperado de conexão com o Supabase.' };
  }
}

/**
 * Generic Insert helper with cache invalidation.
 */
export async function insertIntoTable<T = any>(
  table: string,
  record: Record<string, any>
): Promise<ServiceResponse<T>> {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado.' };
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error(`[Supabase Error - insertIntoTable (${table})]:`, error);
      return { data: null, error: translateSupabaseError(error.message) };
    }

    clearTableCache(table);
    return { data: data as T, error: null };
  } catch (err: any) {
    console.error(`[Supabase Catch - insertIntoTable (${table})]:`, err);
    return { data: null, error: translateSupabaseError(err.message) || 'Erro de rede ou banco ao inserir registro.' };
  }
}

/**
 * Generic Update helper with cache invalidation.
 */
export async function updateInTable<T = any>(
  table: string,
  idColumn: string,
  idValue: any,
  updates: Record<string, any>
): Promise<ServiceResponse<T>> {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado.' };
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(idColumn, idValue)
      .select();

    if (error) {
      console.error(`[Supabase Error - updateInTable (${table})]:`, error);
      return { data: null, error: translateSupabaseError(error.message) };
    }

    clearTableCache(table);
    return { data: (data?.[0] || null) as T, error: null };
  } catch (err: any) {
    console.error(`[Supabase Catch - updateInTable (${table})]:`, err);
    return { data: null, error: translateSupabaseError(err.message) || 'Erro ao atualizar registro no Supabase.' };
  }
}

/**
 * Generic Delete helper with cache invalidation.
 */
export async function deleteFromTable(
  table: string,
  idColumn: string,
  idValue: any
): Promise<ServiceResponse<boolean>> {
  if (!isSupabaseReady()) {
    return { data: false, error: 'Supabase não está configurado.' };
  }

  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idColumn, idValue);

    if (error) {
      console.error(`[Supabase Error - deleteFromTable (${table})]:`, error);
      return { data: false, error: translateSupabaseError(error.message) };
    }

    clearTableCache(table);
    return { data: true, error: null };
  } catch (err: any) {
    console.error(`[Supabase Catch - deleteFromTable (${table})]:`, err);
    return { data: false, error: translateSupabaseError(err.message) || 'Erro ao excluir registro no Supabase.' };
  }
}

/* =========================================================================
 * TYPED WRAPPERS FOR DOMAIN ENTITIES
 * ========================================================================= */

// 1. Frentes
export async function getFrentesFromSupabase() {
  return fetchFromTable('frentes', { order: { column: 'id', ascending: true } });
}

export async function addFrenteToSupabase(frenteData: {
  frente: string;
  nome?: string;
  fazenda?: string;
  cidade?: string;
  quadras?: number;
  talhoes?: number;
  gestor?: string;
  status?: string;
  obs?: string;
}) {
  return insertIntoTable('frentes', frenteData);
}

export async function updateFrenteInSupabase(id: number, frenteData: Partial<{
  frente: string;
  nome: string;
  fazenda: string;
  cidade: string;
  quadras: number;
  talhoes: number;
  gestor: string;
  status: string;
  obs: string;
}>) {
  return updateInTable('frentes', 'id', id, frenteData);
}

export async function deleteFrenteFromSupabase(id: number) {
  return deleteFromTable('frentes', 'id', id);
}

// 2. Fleet (Equipamentos)
export async function getFleetFromSupabase() {
  return fetchFromTable('fleet', { order: { column: 'id', ascending: true } });
}

export async function addFleetToSupabase(fleetData: {
  unidade: string;
  tipo: string;
  modelo?: string;
  prefixo: string;
  status?: string;
  hourly_data?: any[];
}) {
  return insertIntoTable('fleet', fleetData);
}

export async function updateFleetInSupabase(id: number, fleetData: any) {
  return updateInTable('fleet', 'id', id, fleetData);
}

export async function deleteFleetFromSupabase(id: number) {
  return deleteFromTable('fleet', 'id', id);
}

// 3. Logs
export async function getLogsFromSupabase() {
  return fetchFromTable('logs', { order: { column: 'id', ascending: false }, limit: 100 });
}

export async function addLogToSupabase(logData: {
  type: string;
  event: string;
  detail?: string;
  time: string;
  user_email?: string;
  city?: string;
}) {
  return insertIntoTable('logs', logData);
}

// 4. Gestão de Áreas (Central de Áreas / Master Plan)
export async function getGestaoAreasBancoFromSupabase(usina?: string) {
  return fetchFromTable('gestao_areas_banco', {
    ...(usina ? { eq: { column: 'usina', value: usina } } : {}),
    order: { column: 'created_at', ascending: false }
  });
}

export async function saveGestaoAreasBancoItemToSupabase(item: any) {
  if (!isSupabaseReady()) return { data: null, error: 'Supabase não configurado' };
  
  try {
    const { data, error } = await supabase
      .from('gestao_areas_banco')
      .upsert([item], { onConflict: 'id' })
      .select();

    if (error) return { data: null, error: error.message };
    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function deleteGestaoAreasBancoItemFromSupabase(id: string) {
  return deleteFromTable('gestao_areas_banco', 'id', id);
}

// 5. Vinhaça Histórico
export async function getVinhacaHistoricoFromSupabase() {
  return fetchFromTable('vinhaca_historico', { order: { column: 'created_at', ascending: false }, limit: 100 });
}

export async function addVinhacaHistoricoToSupabase(entry: {
  id: string;
  timestamp: string;
  origem: string;
  tipo_acao: string;
  caminhao?: string;
  detalhes: string;
  user_email?: string;
}) {
  return insertIntoTable('vinhaca_historico', entry);
}

/**
 * Translate common Supabase error messages into user-friendly Portuguese.
 */
export function translateSupabaseError(msg: string | null | undefined): string {
  if (!msg) return 'Ocorreu um erro desconhecido.';
  const lower = msg.toLowerCase();
  
  if (lower.includes('invalid login credentials')) return 'E-mail/Usuário ou senha incorretos.';
  if (lower.includes('user already registered') || lower.includes('email already in use')) return 'Este e-mail já está cadastrado no sistema.';
  if (lower.includes('password should be at least 6 characters')) return 'A senha deve possuir pelo menos 6 caracteres.';
  if (lower.includes('rate limit exceeded')) return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes.';
  if (lower.includes('user not found')) return 'Usuário não encontrado.';
  if (lower.includes('email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada.';
  if (lower.includes('new password should be different')) return 'A nova senha deve ser diferente da senha atual.';
  if (lower.includes('jwt expired') || lower.includes('session expired')) return 'Sua sessão expirou. Por favor, faça login novamente.';
  
  return msg;
}

// 6. Supabase Auth & User Profiles Integration
export async function saveOrUpdateProfile(profile: {
  id: string;
  email?: string;
  username?: string;
  dark_mode?: boolean;
  color_theme?: string;
  sidebar_collapsed?: boolean;
}) {
  if (!isSupabaseReady()) return { data: null, error: 'Supabase não configurado' };
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profile], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[Supabase Profile Upsert Error]:', error);
      return { data: null, error: translateSupabaseError(error.message) };
    }
    return { data: data?.[0] || null, error: null };
  } catch (err: any) {
    return { data: null, error: translateSupabaseError(err.message) };
  }
}

export async function getUserProfileFromSupabase(userId: string) {
  if (!isSupabaseReady()) return { data: null, error: 'Supabase não configurado' };
  return fetchFromTable('profiles', { eq: { column: 'id', value: userId }, limit: 1 });
}

export async function signUpUserWithSupabase(email: string, password: string, username: string) {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado nas variáveis de ambiente.' };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          username: username.trim()
        }
      }
    });

    if (error) {
      return { data: null, error: translateSupabaseError(error.message) };
    }

    if (data.user) {
      await saveOrUpdateProfile({
        id: data.user.id,
        email: data.user.email || email,
        username: username.trim() || email.split('@')[0]
      });
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: translateSupabaseError(err.message) || 'Erro inesperado ao realizar cadastro.' };
  }
}

export async function signInUserWithSupabase(emailOrUsername: string, password: string) {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado.' };
  }
  try {
    let email = emailOrUsername.trim();
    if (!email.includes('@')) {
      email = `${email.toLowerCase()}@colombo.com.br`;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim()
    });

    if (error) {
      return { data: null, error: translateSupabaseError(error.message) };
    }

    if (data.user) {
      // Refresh or ensure profile exists
      await saveOrUpdateProfile({
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || email.split('@')[0]
      });
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: translateSupabaseError(err.message) || 'Erro inesperado ao autenticar.' };
  }
}

export async function resetPasswordWithSupabase(email: string) {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado.' };
  }
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.href
    });

    if (error) {
      return { data: null, error: translateSupabaseError(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: translateSupabaseError(err.message) || 'Erro inesperado ao solicitar recuperação.' };
  }
}

export async function updatePasswordWithSupabase(newPassword: string) {
  if (!isSupabaseReady()) {
    return { data: null, error: 'Supabase não está configurado.' };
  }
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword.trim()
    });

    if (error) {
      return { data: null, error: translateSupabaseError(error.message) };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: translateSupabaseError(err.message) || 'Erro inesperado ao redefinir senha.' };
  }
}

export async function signOutUserWithSupabase() {
  if (isSupabaseReady()) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase SignOut Warning:', err);
    }
  }
  localStorage.removeItem('ppt_is_logged_in');
}

