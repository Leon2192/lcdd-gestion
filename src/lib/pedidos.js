export const pedidoStatusOptions = [
  { value: "en_curso", label: "En curso" },
  { value: "enviado", label: "Enviado" },
  { value: "entregado", label: "Entregado" },
];

export const canalVentaOptions = [
  { value: "anuncio_instagram", label: "Anuncio Instagram" },
  { value: "sitio_web", label: "Sitio web" },
  { value: "organico", label: "Orgánico" },
];

export const pedidoStatusColors = {
  en_curso: "brand.4",
  enviado: "brand.6",
  entregado: "brand.8",
};

export const pedidoPagoStatusColors = {
  sin_pago: "gray",
  anticipo_pagado: "blue",
  pago_completo: "green",
};

export function getPedidoStatusLabel(value) {
  return pedidoStatusOptions.find((item) => item.value === value)?.label || value;
}

export function getCanalVentaLabel(value) {
  return canalVentaOptions.find((item) => item.value === value)?.label || "Sin canal";
}

export function calculatePedidoPayment(total, anticipoPagado, pagoCompletado) {
  const numericTotal = Number(total || 0);

  if (pagoCompletado) {
    return {
      monto_pagado: numericTotal,
      saldo_pendiente: 0,
    };
  }

  if (anticipoPagado) {
    return {
      monto_pagado: numericTotal * 0.5,
      saldo_pendiente: numericTotal * 0.5,
    };
  }

  return {
    monto_pagado: 0,
    saldo_pendiente: numericTotal,
  };
}

export function getPedidoPagoStatus(pedido) {
  if (pedido?.pago_completado || Number(pedido?.saldo_pendiente || 0) === 0) {
    return {
      value: "pago_completo",
      label: "Pago completo",
    };
  }

  if (pedido?.anticipo_50_pagado || Number(pedido?.monto_pagado || 0) > 0) {
    return {
      value: "anticipo_pagado",
      label: "50% abonado",
    };
  }

  return {
    value: "sin_pago",
    label: "Sin pago",
  };
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
