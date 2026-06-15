import { supabase } from "../lib/supabaseClient";
import { assertSupabaseEnv } from "../lib/supabaseEnv";

const ESTADOS_VALIDOS = ["pendiente", "en_progreso", "cumplido"];

function normalizeObjetivoPayload(data) {
  if (!data.mes) {
    throw new Error("El mes es obligatorio.");
  }

  if (!data.titulo?.trim()) {
    throw new Error("El titulo del objetivo es obligatorio.");
  }

  if (!ESTADOS_VALIDOS.includes(data.estado)) {
    throw new Error("El estado del objetivo debe ser pendiente, en_progreso o cumplido.");
  }

  return {
    mes: data.mes,
    titulo: data.titulo.trim(),
    descripcion: data.descripcion?.trim() || "",
    estado: data.estado,
    deadline: data.deadline || null,
  };
}

export async function getObjetivos() {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from("objetivos")
    .select("*")
    .order("mes", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return data || [];
}

export async function createObjetivo(data) {
  assertSupabaseEnv();

  const payload = normalizeObjetivoPayload(data);
  const { data: createdObjetivo, error } = await supabase
    .from("objetivos")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return createdObjetivo;
}

export async function updateObjetivo(id, data) {
  assertSupabaseEnv();

  const payload = normalizeObjetivoPayload(data);
  const { data: updatedObjetivo, error } = await supabase
    .from("objetivos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return updatedObjetivo;
}
