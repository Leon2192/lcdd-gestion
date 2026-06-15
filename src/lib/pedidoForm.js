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
  items: [createEmptyPedidoItem()],
};

export function mapPedidoToForm(pedido) {
  if (!pedido) {
    return initialPedidoForm;
  }

  return {
    cliente_nombre: pedido.cliente_nombre || "",
    telefono: pedido.telefono || "",
    fecha_evento: pedido.fecha_evento || "",
    es_envio: pedido.es_envio ? "si" : "no",
    estado: pedido.estado || "en_curso",
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
