import { supabase } from "../lib/supabaseClient";
import { assertSupabaseEnv } from "../lib/supabaseEnv";

function normalizeConsultaPayload(data) {
  if (!data.fecha) {
    throw new Error("La fecha es obligatoria.");
  }

  if (!data.nombre?.trim()) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!data.articulo?.trim()) {
    throw new Error("El articulo es obligatorio.");
  }

  if (!data.telefono?.trim()) {
    throw new Error("El telefono es obligatorio.");
  }

  return {
    fecha: data.fecha,
    nombre: data.nombre.trim(),
    articulo: data.articulo.trim(),
    telefono: data.telefono.trim(),
    observaciones: data.observaciones?.trim() || null,
  };
}

export async function getConsultas() {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from("consultas")
    .select("*")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return data || [];
}

export async function createConsulta(data) {
  assertSupabaseEnv();

  const payload = normalizeConsultaPayload(data);
  const { data: createdConsulta, error } = await supabase
    .from("consultas")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return createdConsulta;
}

export async function updateConsulta(id, data) {
  assertSupabaseEnv();

  const payload = normalizeConsultaPayload(data);
  const { data: updatedConsulta, error } = await supabase
    .from("consultas")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return updatedConsulta;
}
