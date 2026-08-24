import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Limpa a URL caso termine com /rest/v1 ou barra
rawUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

export const isSupabaseConfigured = Boolean(
  rawUrl && 
  supabaseAnonKey && 
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, supabaseAnonKey)
  : null;

if (isSupabaseConfigured) {
  console.log('⚡ Conectado com sucesso ao Supabase PostgreSQL:', rawUrl);
} else {
  console.log('📦 Modo de Armazenamento Local ativo (LocalStorage). Configure o .env para conectar à nuvem.');
}
