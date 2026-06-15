export const consultaStatusOptions = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "convertido", label: "Convertido" },
  { value: "rechazado", label: "Rechazado" },
];

export const consultaStatusColors = {
  nuevo: "blue",
  contactado: "brand",
  convertido: "green",
  rechazado: "red",
};

export const consultaQuickFilterOptions = [
  { value: "todos", label: "Todos" },
  { value: "hoy", label: "Para recontactar hoy" },
  { value: "vencidos", label: "Vencidos" },
  { value: "proximos_7_dias", label: "Próximos 7 días" },
  { value: "convertidos", label: "Convertidos" },
  { value: "rechazados", label: "Rechazados" },
];

export const offerAudienceOptions = [
  { value: "recontactar_hoy", label: "Leads para recontactar hoy" },
  { value: "vencidos", label: "Leads vencidos" },
  { value: "nuevos", label: "Leads nuevos" },
  { value: "contactados", label: "Leads contactados" },
  { value: "por_articulo", label: "Leads por artículo consultado" },
  { value: "filtrados_actualmente", label: "Leads filtrados actualmente" },
];

export const OFFER_TEMPLATES = [
  {
    id: "promo_vasos",
    label: "Promo vasos personalizados",
    message:
      "Hola {nombre}! Cómo estás? Te escribo de La Casa del Detalle 😊 Hace unos días nos consultaste por {articulo}. Esta semana tenemos una promo especial en vasos personalizados. ¿Querés que te pase más info?",
  },
  {
    id: "promo_kits",
    label: "Promo kits para eventos",
    message:
      "Hola {nombre}! Cómo estás? Te escribo de La Casa del Detalle 😊 Vi que nos consultaste por {articulo}. Tenemos opciones ideales para eventos y regalos personalizados. ¿Querés que te comparta algunas opciones?",
  },
  {
    id: "oferta_general",
    label: "Oferta general LCDD",
    message:
      "Hola {nombre}! Cómo estás? Te escribo de La Casa del Detalle 😊 Hace unos días nos consultaste por {articulo}. Quería contarte que tenemos nuevas promos y opciones personalizadas. ¿Te gustaría que te pase info?",
  },
];

export function getConsultaStatusLabel(value) {
  return consultaStatusOptions.find((item) => item.value === value)?.label || value;
}

export function isConsultaClosed(consulta) {
  return consulta.estado === "convertido" || consulta.estado === "rechazado";
}

export function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

export function addDaysToDateString(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function matchesConsultaQuickFilter(consulta, quickFilter) {
  const today = getTodayDateString();
  const nextWeek = addDaysToDateString(today, 7);
  const recontactDate = consulta.fecha_recontacto;
  const closed = isConsultaClosed(consulta);

  if (quickFilter === "todos") {
    return true;
  }

  if (quickFilter === "hoy") {
    return recontactDate === today && !closed;
  }

  if (quickFilter === "vencidos") {
    return Boolean(recontactDate) && recontactDate < today && !closed;
  }

  if (quickFilter === "proximos_7_dias") {
    return Boolean(recontactDate) && recontactDate > today && recontactDate <= nextWeek && !closed;
  }

  if (quickFilter === "convertidos") {
    return consulta.estado === "convertido";
  }

  if (quickFilter === "rechazados") {
    return consulta.estado === "rechazado";
  }

  return true;
}

export function renderOfferMessage(templateMessage, consulta) {
  return templateMessage
    .replaceAll("{nombre}", consulta.nombre || "hola")
    .replaceAll("{articulo}", consulta.articulo || "el producto consultado");
}
