import { supabase } from "../lib/supabaseClient";
import { assertSupabaseEnv } from "../lib/supabaseEnv";
import { consultaStatusOptions } from "../lib/consultas";

const ESTADOS_VALIDOS = consultaStatusOptions.map((item) => item.value);

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

  if (!data.fecha_recontacto) {
    throw new Error("La fecha de primer recontacto es obligatoria.");
  }

  const estado = data.estado || "nuevo";

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error("El estado del lead no es válido.");
  }

  return {
    fecha: data.fecha,
    nombre: data.nombre.trim(),
    articulo: data.articulo.trim(),
    tipo_evento: data.tipo_evento?.trim() || null,
    telefono: data.telefono.trim(),
    observaciones: data.observaciones?.trim() || null,
    fecha_recontacto: data.fecha_recontacto,
    estado,
  };
}

export async function getConsultas() {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from("consultas")
    .select("*")
    .order("fecha_recontacto", { ascending: true })
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

export async function updateConsultaEstado(id, estado) {
  assertSupabaseEnv();

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error("El estado del lead no es válido.");
  }

  const { data: updatedConsulta, error } = await supabase
    .from("consultas")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return updatedConsulta;
}

export async function deleteConsulta(id) {
  assertSupabaseEnv();

  const { error } = await supabase.from("consultas").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}
