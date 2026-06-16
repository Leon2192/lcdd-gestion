import { supabase } from "../lib/supabaseClient";
import { assertSupabaseEnv } from "../lib/supabaseEnv";
import { calculatePedidoPayment, canalVentaOptions } from "../lib/pedidos";

const ESTADOS_VALIDOS = ["en_curso", "enviado", "entregado"];
const CANALES_VALIDOS = canalVentaOptions.map((item) => item.value);

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

  if (!CANALES_VALIDOS.includes(payload.canal_venta)) {
    throw new Error("Seleccioná un canal de venta válido.");
  }

  const items = normalizePedidoItems(payload.items);
  const total = items.reduce((acc, item) => acc + item.subtotal, 0);
  const pagoCompletado = Boolean(payload.pago_completado);
  const anticipoPagado = pagoCompletado ? false : Boolean(payload.anticipo_50_pagado);

  const payment = calculatePedidoPayment(total, anticipoPagado, pagoCompletado);

  return {
    pedido: {
      cliente_nombre: payload.cliente_nombre.trim(),
      telefono: payload.telefono.trim(),
      fecha_evento: payload.fecha_evento,
      es_envio: Boolean(payload.es_envio),
      estado: payload.estado,
      total,
      anticipo_50_pagado: anticipoPagado,
      pago_completado: pagoCompletado,
      monto_pagado: payment.monto_pagado,
      saldo_pendiente: payment.saldo_pendiente,
      canal_venta: payload.canal_venta,
      direccion_envio: payload.direccion_envio?.trim() || null,
      localidad: payload.localidad?.trim() || null,
      provincia: payload.provincia?.trim() || null,
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
    anticipo_50_pagado: Boolean(record.pago_completado) ? false : Boolean(record.anticipo_50_pagado),
    pago_completado: Boolean(record.pago_completado),
    monto_pagado: Number(record.monto_pagado || 0),
    saldo_pendiente: Number(record.saldo_pendiente || 0),
    canal_venta: record.canal_venta,
    direccion_envio: record.direccion_envio,
    localidad: record.localidad,
    provincia: record.provincia,
    created_at: record.created_at,
    items,
  };
}

export async function getPedidos() {
  assertSupabaseEnv();

  const { data, error } = await supabase
    .from("pedidos")
    .select("*, pedido_items(*)")
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

export async function markPedidoPagoCompletado(id) {
  assertSupabaseEnv();

  const pedidoActual = await getPedidoById(id);

  if (!pedidoActual) {
    throw new Error("No se encontró el pedido.");
  }

  const { error } = await supabase
    .from("pedidos")
    .update({
      anticipo_50_pagado: false,
      pago_completado: true,
      monto_pagado: Number(pedidoActual.total || 0),
      saldo_pendiente: 0,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  return getPedidoById(id);
}
