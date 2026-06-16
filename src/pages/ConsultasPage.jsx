import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBrandWhatsapp,
  IconInfoCircle,
  IconMessageCircle,
  IconPencil,
  IconRosetteDiscountCheck,
  IconSend,
} from "@tabler/icons-react";
import DataTable from "../components/DataTable";
import FloatingActionButton from "../components/FloatingActionButton";
import ModalForm from "../components/ModalForm";
import StatCard from "../components/StatCard";
import { useDashboard } from "../hooks/useDashboard";
import { useToast } from "../hooks/useToast";
import {
  consultaQuickFilterOptions,
  consultaStatusColors,
  consultaStatusOptions,
  getConsultaStatusLabel,
  getTodayDateString,
  isConsultaClosed,
  matchesConsultaQuickFilter,
  OFFER_TEMPLATES,
  offerAudienceOptions,
  renderOfferMessage,
} from "../lib/consultas";
import {
  buildWhatsAppUrl,
  formatDate,
  getEndOfDay,
  getStartOfDay,
  normalizePhone,
} from "../lib/formatters";
import { productOptions } from "../lib/productOptions";

const initialForm = {
  fecha: "",
  nombre: "",
  articulo: "",
  telefono: "",
  observaciones: "",
  fecha_recontacto: "",
  estado: "nuevo",
};

const initialSingleOfferState = {
  opened: false,
  consulta: null,
  templateId: OFFER_TEMPLATES[0].id,
  message: "",
};

const initialBulkOfferState = {
  opened: false,
  templateId: OFFER_TEMPLATES[0].id,
  message: OFFER_TEMPLATES[0].message,
  audience: "filtrados_actualmente",
  articulo: "",
};

const CONSULTAS_PER_PAGE = 10;

export default function ConsultasPage() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const {
    consultas,
    loading,
    errors,
    createConsulta,
    updateConsulta,
    updateConsultaEstado,
  } = useDashboard();
  const toast = useToast();
  const [opened, setOpened] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [singleOffer, setSingleOffer] = useState(initialSingleOfferState);
  const [bulkOffer, setBulkOffer] = useState(initialBulkOfferState);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    estado: "",
    dateRange: [null, null],
    quickFilter: "todos",
  });

  const filteredConsultas = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();
    const normalizedSearchPhone = normalizePhone(filters.search);

    return consultas.filter((consulta) => {
      const [fromDate, toDate] = filters.dateRange;
      const recontactDate = consulta.fecha_recontacto
        ? new Date(`${consulta.fecha_recontacto}T00:00:00`)
        : null;
      const fromDateStart = getStartOfDay(fromDate);
      const toDateEnd = getEndOfDay(toDate);

      if (searchValue) {
        const matchesText =
          consulta.nombre?.toLowerCase().includes(searchValue) ||
          consulta.articulo?.toLowerCase().includes(searchValue) ||
          consulta.telefono?.toLowerCase().includes(searchValue);
        const matchesPhone =
          normalizedSearchPhone && normalizePhone(consulta.telefono).includes(normalizedSearchPhone);

        if (!matchesText && !matchesPhone) {
          return false;
        }
      }

      if (filters.estado && consulta.estado !== filters.estado) {
        return false;
      }

      if (fromDateStart && (!recontactDate || recontactDate < fromDateStart)) {
        return false;
      }

      if (toDateEnd && (!recontactDate || recontactDate > toDateEnd)) {
        return false;
      }

      if (!matchesConsultaQuickFilter(consulta, filters.quickFilter)) {
        return false;
      }

      return true;
    });
  }, [consultas, filters]);

  const stats = useMemo(() => {
    const today = getTodayDateString();

    return {
      total: filteredConsultas.length,
      nuevos: filteredConsultas.filter((consulta) => consulta.estado === "nuevo").length,
      recontactarHoy: filteredConsultas.filter(
        (consulta) => consulta.fecha_recontacto === today && !isConsultaClosed(consulta)
      ).length,
      vencidos: filteredConsultas.filter(
        (consulta) => consulta.fecha_recontacto && consulta.fecha_recontacto < today && !isConsultaClosed(consulta)
      ).length,
      convertidos: filteredConsultas.filter((consulta) => consulta.estado === "convertido").length,
      rechazados: filteredConsultas.filter((consulta) => consulta.estado === "rechazado").length,
    };
  }, [filteredConsultas]);

  const totalPages = Math.max(1, Math.ceil(filteredConsultas.length / CONSULTAS_PER_PAGE));

  const paginatedConsultas = useMemo(() => {
    const startIndex = (page - 1) * CONSULTAS_PER_PAGE;
    return filteredConsultas.slice(startIndex, startIndex + CONSULTAS_PER_PAGE);
  }, [filteredConsultas, page]);

  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.estado, filters.quickFilter, filters.dateRange]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const bulkAudienceConsultas = useMemo(() => {
    if (bulkOffer.audience === "filtrados_actualmente") {
      return filteredConsultas;
    }

    if (bulkOffer.audience === "recontactar_hoy") {
      return consultas.filter((consulta) => matchesConsultaQuickFilter(consulta, "hoy"));
    }

    if (bulkOffer.audience === "vencidos") {
      return consultas.filter((consulta) => matchesConsultaQuickFilter(consulta, "vencidos"));
    }

    if (bulkOffer.audience === "nuevos") {
      return consultas.filter((consulta) => consulta.estado === "nuevo");
    }

    if (bulkOffer.audience === "contactados") {
      return consultas.filter((consulta) => consulta.estado === "contactado");
    }

    if (bulkOffer.audience === "por_articulo") {
      return consultas.filter((consulta) =>
        bulkOffer.articulo ? consulta.articulo === bulkOffer.articulo : false
      );
    }

    return [];
  }, [bulkOffer.audience, bulkOffer.articulo, consultas, filteredConsultas]);

  function resetForm() {
    setForm(initialForm);
    setEditingConsulta(null);
    setFormError("");
  }

  function resetFilters() {
    setFilters({
      search: "",
      estado: "",
      dateRange: [null, null],
      quickFilter: "todos",
    });
  }

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleEditConsulta(consulta) {
    setEditingConsulta(consulta);
    setForm({
      fecha: consulta.fecha || "",
      nombre: consulta.nombre || "",
      articulo: consulta.articulo || "",
      telefono: consulta.telefono || "",
      observaciones: consulta.observaciones || "",
      fecha_recontacto: consulta.fecha_recontacto || "",
      estado: consulta.estado || "nuevo",
    });
    setFormError("");
    setOpened(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fecha) {
      setFormError("La fecha es obligatoria.");
      return;
    }

    if (!form.nombre.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    if (!form.articulo.trim()) {
      setFormError("El artículo es obligatorio.");
      return;
    }

    if (!form.telefono.trim()) {
      setFormError("El teléfono es obligatorio.");
      return;
    }

    if (!form.fecha_recontacto) {
      setFormError("La fecha de primer recontacto es obligatoria.");
      return;
    }

    try {
      const payload = {
        ...form,
        estado: editingConsulta ? form.estado : "nuevo",
      };

      if (editingConsulta) {
        await updateConsulta(editingConsulta.id, payload);
        toast.success("Lead actualizado", "Los datos del lead se guardaron correctamente.");
      } else {
        await createConsulta(payload);
        toast.success("Lead creado", "La nueva consulta se cargó correctamente.");
      }

      resetForm();
      setOpened(false);
    } catch (error) {
      setFormError(error.message);
    }
  }

  async function handleStatusChange(consulta, estado) {
    try {
      await updateConsultaEstado(consulta.id, estado);
      toast.success(
        "Estado actualizado",
        `${consulta.nombre} ahora figura como ${getConsultaStatusLabel(estado)}.`
      );
    } catch {}
  }

  function handleOpenSingleOffer(consulta) {
    const template = OFFER_TEMPLATES[0];
    setSingleOffer({
      opened: true,
      consulta,
      templateId: template.id,
      message: renderOfferMessage(template.message, consulta),
    });
  }

  function resetBulkOffer() {
    setBulkOffer(initialBulkOfferState);
  }

  function handleOpenBulkOffer() {
    setBulkOffer({
      ...initialBulkOfferState,
      opened: true,
    });
  }

  function handleBulkTemplateChange(templateId) {
    const template = OFFER_TEMPLATES.find((item) => item.id === templateId) || OFFER_TEMPLATES[0];
    setBulkOffer((prev) => ({
      ...prev,
      templateId: template.id,
      message: template.message,
    }));
  }

  function renderActions(consulta, stacked = false) {
    const phone = normalizePhone(consulta.telefono);
    const actions = (
      <>
        {phone ? (
          <Button
            component="a"
            href={buildWhatsAppUrl(consulta.telefono)}
            target="_blank"
            rel="noreferrer"
            variant="light"
            color="green"
            size="xs"
            fullWidth={stacked}
            leftSection={<IconBrandWhatsapp size={16} />}
          >
            WhatsApp
          </Button>
        ) : null}
        <Button
          variant="default"
          size="xs"
          fullWidth={stacked}
          leftSection={<IconPencil size={16} />}
          onClick={() => handleEditConsulta(consulta)}
        >
          Editar
        </Button>
        <Button
          variant="light"
          color="brand"
          size="xs"
          fullWidth={stacked}
          leftSection={<IconMessageCircle size={16} />}
          loading={loading.updateConsultaEstado}
          disabled={consulta.estado === "contactado"}
          onClick={() => handleStatusChange(consulta, "contactado")}
        >
          Marcar contactado
        </Button>
        <Button
          variant="light"
          color="green"
          size="xs"
          fullWidth={stacked}
          leftSection={<IconRosetteDiscountCheck size={16} />}
          loading={loading.updateConsultaEstado}
          disabled={consulta.estado === "convertido"}
          onClick={() => handleStatusChange(consulta, "convertido")}
        >
          Marcar convertido
        </Button>
        <Button
          variant="light"
          color="red"
          size="xs"
          fullWidth={stacked}
          loading={loading.updateConsultaEstado}
          disabled={consulta.estado === "rechazado"}
          onClick={() => handleStatusChange(consulta, "rechazado")}
        >
          Marcar rechazado
        </Button>
        <Button
          variant="filled"
          color="brand"
          size="xs"
          fullWidth={stacked}
          leftSection={<IconSend size={16} />}
          onClick={() => handleOpenSingleOffer(consulta)}
        >
          Enviar oferta
        </Button>
      </>
    );

    return stacked ? (
      <Stack gap="xs" align="stretch">
        {actions}
      </Stack>
    ) : (
      <Group gap="xs" wrap="wrap" justify="flex-start">
        {actions}
      </Group>
    );
  }

  return (
    <Stack gap="lg" className="fab-safe-area">
      <Group justify="space-between" align="flex-end" gap="md">
        <Stack gap="xs">
          <Title order={2}>Consultas</Title>
          <Text c="dimmed">
            Bandeja de leads con seguimiento por recontacto, cambios de estado y ofertas por WhatsApp.
          </Text>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={{ base: "md", md: "lg" }}>
        <StatCard compact title="Total leads" value={stats.total} subtitle="Leads según filtros activos." />
        <StatCard compact title="Nuevos" value={stats.nuevos} subtitle="Ingresos pendientes de primer contacto." />
        <StatCard compact title="Para recontactar hoy" value={stats.recontactarHoy} subtitle="Seguimiento prioritario del día." />
        <StatCard compact title="Recontactos vencidos" value={stats.vencidos} subtitle="Leads activos con seguimiento atrasado." />
        <StatCard compact title="Convertidos" value={stats.convertidos} subtitle="Leads que avanzaron a venta." />
        <StatCard compact title="Rechazados" value={stats.rechazados} subtitle="Leads descartados por el equipo." />
      </SimpleGrid>

      <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={700}>Filtros</Text>
              <Text c="dimmed" fz="sm">
                Buscá por nombre, teléfono o artículo y combiná con recontacto, estado y vistas rápidas.
              </Text>
            </div>
            <Button type="button" variant="default" onClick={resetFilters} fullWidth={isMobile}>
              Limpiar filtros
            </Button>
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Buscar lead"
                placeholder="Nombre, teléfono o artículo"
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.currentTarget.value }))
                }
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Estado"
                data={consultaStatusOptions}
                value={filters.estado}
                onChange={(value) => setFilters((prev) => ({ ...prev, estado: value || "" }))}
                placeholder="Todos los estados"
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <DatePickerInput
                type="range"
                label="Rango de fechas de recontacto"
                placeholder="Seleccioná un período"
                value={filters.dateRange}
                onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                valueFormat="DD/MM/YYYY"
                clearable
              />
            </Grid.Col>
          </Grid>

          <Group gap="sm" wrap="wrap">
            {consultaQuickFilterOptions.map((option) => (
              <Button
                key={option.value}
                size="xs"
                variant={filters.quickFilter === option.value ? "filled" : "light"}
                color="brand"
                onClick={() => setFilters((prev) => ({ ...prev, quickFilter: option.value }))}
              >
                {option.label}
              </Button>
            ))}
          </Group>
        </Stack>
      </Card>

      {errors.consultas ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {errors.consultas}
        </Alert>
      ) : null}

      {errors.updateConsulta ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {errors.updateConsulta}
        </Alert>
      ) : null}

      {errors.updateConsultaEstado ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {errors.updateConsultaEstado}
        </Alert>
      ) : null}

      {isMobile ? (
        <Stack className="mobile-list">
          {loading.consultas ? (
            <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
              <Text c="dimmed" ta="center">
                Cargando leads...
              </Text>
            </Card>
          ) : paginatedConsultas.length ? (
            paginatedConsultas.map((consulta) => (
              <Card key={consulta.id} p="md" bg="rgba(250, 252, 252, 0.96)">
                <Stack gap="sm">
                  <Group justify="space-between" align="flex-start" wrap="wrap">
                    <div>
                      <Text fw={700}>{consulta.nombre}</Text>
                      <Text c="dimmed" fz="sm">
                        {consulta.articulo}
                      </Text>
                    </div>
                    <Badge color={consultaStatusColors[consulta.estado]} variant="light">
                      {getConsultaStatusLabel(consulta.estado)}
                    </Badge>
                  </Group>
                  <Text fz="sm">Teléfono: {consulta.telefono}</Text>
                  <Text fz="sm">Fecha de consulta: {formatDate(consulta.fecha)}</Text>
                  <Text fz="sm">Fecha de recontacto: {formatDate(consulta.fecha_recontacto)}</Text>
                  <Text fz="sm">
                    Observaciones: {consulta.observaciones?.trim() ? consulta.observaciones : "Sin observaciones"}
                  </Text>
                  {renderActions(consulta, true)}
                </Stack>
              </Card>
            ))
          ) : (
            <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
              <Text c="dimmed" ta="center">
                No hay leads para los filtros seleccionados.
              </Text>
            </Card>
          )}
        </Stack>
      ) : (
        <DataTable
          columns={[
            { key: "nombre", label: "Nombre" },
            { key: "articulo", label: "Artículo" },
            { key: "telefono", label: "Teléfono / WhatsApp" },
            { key: "fecha", label: "Fecha consulta" },
            { key: "fecha_recontacto", label: "Fecha recontacto" },
            { key: "estado", label: "Estado" },
            { key: "observaciones", label: "Observaciones" },
            { key: "acciones", label: "Acciones" },
          ]}
          rows={paginatedConsultas}
          loading={loading.consultas}
          tableMinWidth={1320}
          emptyMessage="No hay leads para los filtros seleccionados."
          renderRow={(consulta) => (
            <Table.Tr key={consulta.id}>
              <Table.Td>{consulta.nombre}</Table.Td>
              <Table.Td>{consulta.articulo}</Table.Td>
              <Table.Td>{consulta.telefono}</Table.Td>
              <Table.Td>{formatDate(consulta.fecha)}</Table.Td>
              <Table.Td>{formatDate(consulta.fecha_recontacto)}</Table.Td>
              <Table.Td>
                <Badge color={consultaStatusColors[consulta.estado]} variant="light">
                  {getConsultaStatusLabel(consulta.estado)}
                </Badge>
              </Table.Td>
              <Table.Td maw={220}>
                <Text lineClamp={2} fz="sm">
                  {consulta.observaciones?.trim() ? consulta.observaciones : "Sin observaciones"}
                </Text>
              </Table.Td>
              <Table.Td>{renderActions(consulta)}</Table.Td>
            </Table.Tr>
          )}
        />
      )}

      {!loading.consultas ? (
        <Group justify="center" align="center" wrap="wrap" gap="md">
          <Pagination
            value={page}
            onChange={setPage}
            total={totalPages}
            color="brand"
            withEdges
            siblings={isMobile ? 0 : 1}
            boundaries={1}
            getItemProps={(pageNumber) => {
              if (pageNumber === "previous") {
                return { "aria-label": "Anterior" };
              }

              if (pageNumber === "next") {
                return { "aria-label": "Siguiente" };
              }

              return {};
            }}
          />
        </Group>
      ) : null}

      <ModalForm
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title={editingConsulta ? `Editar lead #${editingConsulta.id}` : "Nuevo lead"}
        onSubmit={handleSubmit}
        submitLabel={editingConsulta ? "Guardar cambios" : "Guardar lead"}
        loading={editingConsulta ? loading.updateConsulta : loading.createConsulta}
      >
        <Stack gap="md">
          {formError ? (
            <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
              {formError}
            </Alert>
          ) : null}
          <TextInput
            label="Fecha de consulta"
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            required
          />
          <TextInput
            label="Nombre"
            name="nombre"
            value={form.nombre}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="Nombre del lead"
            required
          />
          <Select
            label="Artículo consultado"
            data={productOptions}
            value={form.articulo}
            onChange={(value) => {
              setForm((prev) => ({ ...prev, articulo: value || "" }));
              setFormError("");
            }}
            placeholder="Seleccioná un artículo"
            searchable
            nothingFoundMessage="No hay coincidencias"
            required
          />
          <TextInput
            label="Teléfono / WhatsApp"
            name="telefono"
            value={form.telefono}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="54911..."
            required
          />
          <TextInput
            label="Fecha de primer recontacto"
            type="date"
            name="fecha_recontacto"
            value={form.fecha_recontacto}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            required
          />
          {editingConsulta ? (
            <Select
              label="Estado"
              data={consultaStatusOptions}
              value={form.estado}
              onChange={(value) => {
                setForm((prev) => ({ ...prev, estado: value || "nuevo" }));
                setFormError("");
              }}
              allowDeselect={false}
            />
          ) : (
            <Alert color="brand" variant="light">
              Este lead se creará con estado inicial <strong>Nuevo</strong>.
            </Alert>
          )}
          <Textarea
            label="Observaciones"
            name="observaciones"
            value={form.observaciones}
            onChange={(event) => {
              handleChange(event);
              setFormError("");
            }}
            placeholder="Notas de contexto para seguimiento"
            minRows={4}
          />
        </Stack>
      </ModalForm>

      <ModalForm
        opened={singleOffer.opened}
        onClose={() => setSingleOffer(initialSingleOfferState)}
        title={
          singleOffer.consulta
            ? `Enviar oferta a ${singleOffer.consulta.nombre}`
            : "Enviar oferta"
        }
        onSubmit={(event) => {
          event.preventDefault();
          setSingleOffer(initialSingleOfferState);
        }}
        submitLabel="Listo"
        loading={false}
        size={isMobile ? "100%" : "lg"}
      >
        <Stack gap="md">
          {singleOffer.consulta ? (
            <>
              <Text c="dimmed" fz="sm">
                Revisá el mensaje, ajustalo si hace falta y abrí WhatsApp con el texto listo.
              </Text>
              <Stack gap={6}>
                <Text fw={600} fz="sm">
                  Este cliente consultó por
                </Text>
                <Badge color="brand" variant="light" size="lg" w="fit-content">
                  {singleOffer.consulta.articulo}
                </Badge>
              </Stack>
              <Textarea
                label="Vista previa del mensaje"
                value={singleOffer.message}
                onChange={(event) =>
                  setSingleOffer((prev) => ({ ...prev, message: event.currentTarget.value }))
                }
                autosize
                minRows={12}
                maxRows={18}
              />
              {normalizePhone(singleOffer.consulta.telefono) ? (
                <Button
                  component="a"
                  href={buildWhatsAppUrl(singleOffer.consulta.telefono, singleOffer.message)}
                  target="_blank"
                  rel="noreferrer"
                  color="green"
                  leftSection={<IconBrandWhatsapp size={18} />}
                >
                  Abrir WhatsApp
                </Button>
              ) : (
                <Alert color="red" variant="light">
                  Este lead no tiene un teléfono válido para abrir WhatsApp.
                </Alert>
              )}
            </>
          ) : null}
        </Stack>
      </ModalForm>

      <ModalForm
        opened={bulkOffer.opened}
        onClose={resetBulkOffer}
        title="Crear oferta para leads"
        onSubmit={(event) => {
          event.preventDefault();
          resetBulkOffer();
        }}
        submitLabel="Listo"
        loading={false}
        size={isMobile ? "100%" : "xl"}
      >
        <Stack gap="lg">
          <Text c="dimmed" fz="sm">
            Armá una oferta, elegí la audiencia y abrí WhatsApp lead por lead. La app no envía mensajes automáticamente.
          </Text>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Oferta / tipo de producto"
                data={OFFER_TEMPLATES.map((template) => ({
                  value: template.id,
                  label: template.label,
                }))}
                value={bulkOffer.templateId}
                onChange={(value) => handleBulkTemplateChange(value || OFFER_TEMPLATES[0].id)}
                allowDeselect={false}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Audiencia"
                data={offerAudienceOptions}
                value={bulkOffer.audience}
                onChange={(value) =>
                  setBulkOffer((prev) => ({ ...prev, audience: value || "filtrados_actualmente" }))
                }
                allowDeselect={false}
              />
            </Grid.Col>
            {bulkOffer.audience === "por_articulo" ? (
              <Grid.Col span={{ base: 12 }}>
                <Select
                  label="Artículo consultado"
                  data={productOptions}
                  value={bulkOffer.articulo}
                  onChange={(value) => setBulkOffer((prev) => ({ ...prev, articulo: value || "" }))}
                  searchable
                  clearable
                  nothingFoundMessage="No hay coincidencias"
                />
              </Grid.Col>
            ) : null}
          </Grid>

          <Textarea
            label="Mensaje base"
            value={bulkOffer.message}
            onChange={(event) =>
              setBulkOffer((prev) => ({ ...prev, message: event.currentTarget.value }))
            }
            description="Podés usar {nombre} y {articulo} para personalizar el mensaje."
            minRows={7}
          />

          <Card p="md" bg="#f8fbfc">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={700}>Leads encontrados</Text>
                <Text c="dimmed" fz="sm">
                  {bulkAudienceConsultas.length} lead{bulkAudienceConsultas.length === 1 ? "" : "s"} en esta audiencia.
                </Text>
              </div>
            </Group>
          </Card>

          <Stack gap="md">
            {bulkAudienceConsultas.length ? (
              bulkAudienceConsultas.map((consulta) => {
                const message = renderOfferMessage(bulkOffer.message, consulta);
                const whatsappUrl = buildWhatsAppUrl(consulta.telefono, message);
                const hasPhone = Boolean(normalizePhone(consulta.telefono));

                return (
                  <Card key={`offer-${consulta.id}`} p="md" bg="rgba(250, 252, 252, 0.96)">
                    <Stack gap="sm">
                      <Group justify="space-between" align="flex-start" wrap="wrap">
                        <div>
                          <Text fw={700}>{consulta.nombre}</Text>
                          <Text c="dimmed" fz="sm">
                            {consulta.articulo}
                          </Text>
                        </div>
                        <Badge color={consultaStatusColors[consulta.estado]} variant="light">
                          {getConsultaStatusLabel(consulta.estado)}
                        </Badge>
                      </Group>
                      <Text fz="sm">Fecha de recontacto: {formatDate(consulta.fecha_recontacto)}</Text>
                      <Text fz="sm">Teléfono: {consulta.telefono}</Text>
                      <Textarea
                        label="Vista previa del mensaje"
                        value={message}
                        readOnly
                        minRows={5}
                      />
                      {hasPhone ? (
                        <Button
                          component="a"
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          color="green"
                          leftSection={<IconBrandWhatsapp size={18} />}
                        >
                          Abrir WhatsApp
                        </Button>
                      ) : (
                        <Alert color="red" variant="light">
                          Este lead no tiene un teléfono válido para abrir WhatsApp.
                        </Alert>
                      )}
                    </Stack>
                  </Card>
                );
              })
            ) : (
              <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
                <Text c="dimmed" ta="center">
                  No hay leads para la audiencia seleccionada.
                </Text>
              </Card>
            )}
          </Stack>
        </Stack>
      </ModalForm>

      {!opened && !singleOffer.opened && !bulkOffer.opened ? (
        <FloatingActionButton
          label="Cargar consulta"
          onClick={() => {
            resetForm();
            setOpened(true);
          }}
        />
      ) : null}
    </Stack>
  );
}
