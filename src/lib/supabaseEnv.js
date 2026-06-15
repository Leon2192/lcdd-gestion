const PLACEHOLDER_VALUES = new Set([
  "",
  "tu-anon-key",
  "PEGAR_ACA_LA_ANON_PUBLIC_KEY_DE_SUPABASE",
]);

export function assertSupabaseEnv() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl) {
    throw new Error(
      "Falta VITE_SUPABASE_URL en el archivo .env. Reinicia Vite despues de configurarla."
    );
  }

  if (PLACEHOLDER_VALUES.has(supabaseAnonKey.trim())) {
    throw new Error(
      "Falta la anon public key de Supabase en .env. Pegala en VITE_SUPABASE_ANON_KEY y reinicia Vite."
    );
  }
}
