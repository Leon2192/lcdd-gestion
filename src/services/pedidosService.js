import { supabase } from "../lib/supabaseClient";
import { assertSupabaseEnv } from "../lib/supabaseEnv";

const ESTADOS_VALIDOS = ["en_curso", "enviado", "entregado"];

function normalizePedidoItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Debés cargar al menos 1 producto.");
  }

  return items.map((item) => {
    const cantidad = Number(item.cantidad || 0);
    const precioUnitario = Number(item.precio_unitario || 0);

    if (!item.producto_nombre?.trim()) {
      throw new Error("Cada producto debe tener nombre.");
    }

    if (cantidad <= 0) {
      throw new Error("Cada producto debe tener cantidad mayor a 0.");
    }

    if (precioUnitario < 0) {
      throw new Error("El precio unitario debe ser mayor o igual a 0.");
    }

    return {
      producto_nombre: item.producto_nombre.trim(),
      cantidad,
      precio_unitario: precioUnitario,
      subtotal: cantidad * precioUnitario,
    };
  });
}

function normalizePedidoPayload(payload) {
  if (!payload.cliente_nombre?.trim()) {
    throw new Error("El nombre del cliente es obligatorio.");
  }

  if (!payload.telefono?.trim()) {
    throw new Error("El teléfono es obligatorio.");
  }

  if (!payload.fecha_evento) {
    throw new Error("La fecha del evento es obligatoria.");
  }

  if (!ESTADOS_VALIDOS.includes(payload.estado)) {
    throw new Error("El estado del pedido debe ser en_curso, enviado o entregado.");
  }

  const items = normalizePedidoItems(payload.items);
  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    pedido: {
      cliente_nombre: payload.cliente_nombre.trim(),
      telefono: payload.telefono.trim(),
      fecha_evento: payload.fecha_evento,
      es_envio: Boolean(payload.es_envio),
      estado: payload.estado,
      total,
    },
    items,
  };
}

function transformPedido(record) {
  if (!record) {
    return null;
  }

  const items = (record.pedido_items || [])
    .map((item) => ({
      id: item.id,
      pedido_id: item.pedido_id,
      producto_nombre: item.producto_nombre,
      cantidad: Number(item.cantidad || 0),
      precio_unitario: Number(item.precio_unitario || 0),
      subtotal: Number(item.subtotal || 0),
      created_at: item.created_at,
    }))
    .sort((a, b) => a.id - b.id);

  return {
    id: record.id,
    cliente_nombre: record.cliente_nombre,
    telefono: record.telefono,
    fecha_evento: record.fecha_evento,
    es_envio: record.es_envio,
    estado: record.estado,
    total: Number(record.total || 0),
    created_at: record.created_at,
    items,
  };
}

export async function getPedidos() {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_items(*)")
    .order("fecha_evento", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    throw error;
  }

  return (data || []).map(transformPedido);
}

export async function getPedidoById(id) {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_items(*)")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return transformPedido(data);
}

export async function createPedido(payload) {
  assertSupabaseEnv();

  const normalized = normalizePedidoPayload(payload);

  const { data: pedidoRecord, error: pedidoError } = await supabase
    .from("pedidos")
    .insert(normalized.pedido)
    .select()
    .single();

  if (pedidoError) {
    console.error(pedidoError);
    throw pedidoError;
  }

  const itemsPayload = normalized.items.map((item) => ({
    pedido_id: pedidoRecord.id,
    ...item,
  }));

  const { error: itemsError } = await supabase.from("pedido_items").insert(itemsPayload);

  if (itemsError) {
    console.error(itemsError);
    throw itemsError;
  }

  return getPedidoById(pedidoRecord.id);
}

export async function updatePedido(id, payload) {
  assertSupabaseEnv();

  const pedidoActual = await getPedidoById(id);

  if (!pedidoActual) {
    throw new Error("No se encontró el pedido a editar.");
  }

  if (pedidoActual.estado === "entregado") {
    throw new Error("No se puede editar un pedido entregado.");
  }

  const normalized = normalizePedidoPayload(payload);

  const { error: pedidoError } = await supabase
    .from("pedidos")
    .update(normalized.pedido)
    .eq("id", id);

  if (pedidoError) {
    console.error(pedidoError);
    throw pedidoError;
  }

  const { error: deleteItemsError } = await supabase
    .from("pedido_items")
    .delete()
    .eq("pedido_id", id);

  if (deleteItemsError) {
    console.error(deleteItemsError);
    throw deleteItemsError;
  }

  const itemsPayload = normalized.items.map((item) => ({
    pedido_id: id,
    ...item,
  }));

  const { error: itemsError } = await supabase.from("pedido_items").insert(itemsPayload);

  if (itemsError) {
    console.error(itemsError);
    throw itemsError;
  }

  return getPedidoById(id);
}

export async function updatePedidoEstado(id, estado) {
  assertSupabaseEnv();

  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error("El estado del pedido debe ser en_curso, enviado o entregado.");
  }

  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function deletePedido(id) {
  assertSupabaseEnv();

  const { error } = await supabase.from("pedidos").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
}
