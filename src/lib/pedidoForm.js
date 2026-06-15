export const envioOptions = [
  { value: "no", label: "No" },
  { value: "si", label: "Si" },
];

export function createEmptyPedidoItem() {
  return {
    producto_nombre: "",
    cantidad: 1,
    precio_unitario: 0,
  };
}

export const initialPedidoForm = {
  cliente_nombre: "",
  telefono: "",
  fecha_evento: "",
  es_envio: "no",
  estado: "en_curso",
  anticipo_50_pagado: true,
  pago_completado: false,
  canal_venta: "",
  direccion_envio: "",
  localidad: "",
  provincia: "",
  items: [createEmptyPedidoItem()],
};

export function mapPedidoToForm(pedido) {
  if (!pedido) {
    return initialPedidoForm;
  }

  const pagoCompletado = Boolean(pedido.pago_completado);
  const anticipoPagado = pagoCompletado ? false : Boolean(pedido.anticipo_50_pagado);

  return {
    cliente_nombre: pedido.cliente_nombre || "",
    telefono: pedido.telefono || "",
    fecha_evento: pedido.fecha_evento || "",
    es_envio: pedido.es_envio ? "si" : "no",
    estado: pedido.estado || "en_curso",
    anticipo_50_pagado: anticipoPagado,
    pago_completado: pagoCompletado,
    canal_venta: pedido.canal_venta || "",
    direccion_envio: pedido.direccion_envio || "",
    localidad: pedido.localidad || "",
    provincia: pedido.provincia || "",
    items:
      pedido.items?.length > 0
        ? pedido.items.map((item) => ({
            producto_nombre: item.producto_nombre || "",
            cantidad: Number(item.cantidad || 1),
            precio_unitario: Number(item.precio_unitario || 0),
          }))
        : [createEmptyPedidoItem()],
  };
}
