function parseDateValue(dateValue) {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return Number.isNaN(dateValue.getTime()) ? null : dateValue;
  }

  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(dateValue) {
  const parsedDate = parseDateValue(dateValue);

  if (!parsedDate) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export function formatMonthLabel(monthValue) {
  if (!monthValue) {
    return "Sin mes";
  }

  const [year, month] = monthValue.split("-");
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

export function normalizePhone(phone) {
  return (phone || "").replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone, message = "") {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return "";
  }

  if (!message) {
    return `https://wa.me/${normalizedPhone}`;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatYesNo(value) {
  return value ? "Si" : "No";
}

export function getStartOfDay(dateValue) {
  const parsedDate = parseDateValue(dateValue);

  if (!parsedDate) {
    return null;
  }

  const startOfDay = new Date(parsedDate);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

export function getEndOfDay(dateValue) {
  const parsedDate = parseDateValue(dateValue);

  if (!parsedDate) {
    return null;
  }

  const endOfDay = new Date(parsedDate);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}
