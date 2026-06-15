export const pedidoStatusOptions = [
  { value: "en_curso", label: "En curso" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
];

export const pedidoStatusColors = {
  en_curso: "brand.4",
  enviado: "brand.6",
  entregado: "brand.8",
};

export function getPedidoStatusLabel(value) {
  return pedidoStatusOptions.find((item) => item.value === value)?.label || value;
}

export function getNextPedidoStatusAction(status) {
  if (status === "en_curso") {
    return {
      value: "enviado",
      label: "Marcar como enviado",
    };
  }

  if (status === "enviado") {
    return {
      value: "entregado",
      label: "Marcar como entregado",
    };
  }

  return null;
}
