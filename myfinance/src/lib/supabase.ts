import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !anonKey) {
  console.warn('Supabase não configurado: crie o arquivo .env a partir do .env.example.');
}

export const supabase = createClient(url || 'http://localhost', anonKey || 'missing', {
  auth: { persistSession: false, autoRefreshToken: false },
});
