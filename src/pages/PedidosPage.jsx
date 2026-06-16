import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Grid,
  Group,
  Pagination,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { IconInfoCircle } from "@tabler/icons-react";
import FloatingActionButton from "../components/FloatingActionButton";
import ModalForm from "../components/ModalForm";
import PedidoCard from "../components/PedidoCard";
import PedidoFormFields from "../components/PedidoFormFields";
import StatCard from "../components/StatCard";
import { usePedidos } from "../hooks/usePedidos";
import { useToast } from "../hooks/useToast";
import { formatCurrency, getEndOfDay, getStartOfDay } from "../lib/formatters";
import { pedidoStatusOptions } from "../lib/pedidos";
import { initialPedidoForm, mapPedidoToForm } from "../lib/pedidoForm";

const PEDIDOS_PER_PAGE = 6;

export default function PedidosPage() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { pedidos, loading, error, createPedido, editPedido } = usePedidos();
  const toast = useToast();
  const [opened, setOpened] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [form, setForm] = useState(initialPedidoForm);
  const [formError, setFormError] = useState("");
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    estado: "",
  });
  const [page, setPage] = useState(1);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const [fromDate, toDate] = filters.dateRange;
      const pedidoCreatedAt = pedido.created_at ? new Date(pedido.created_at) : null;
      const fromDateStart = getStartOfDay(fromDate);
      const toDateEnd = getEndOfDay(toDate);

      if (!pedidoCreatedAt || Number.isNaN(pedidoCreatedAt.getTime())) {
        return false;
      }

      if (fromDateStart && pedidoCreatedAt < fromDateStart) {
        return false;
      }

      if (toDateEnd && pedidoCreatedAt > toDateEnd) {
        return false;
      }

      if (filters.estado && pedido.estado !== filters.estado) {
        return false;
      }

      return true;
    });
  }, [pedidos, filters]);

  const stats = useMemo(() => {
    const total = filteredPedidos.length;
    const enCurso = filteredPedidos.filter((item) => item.estado === "en_curso").length;
    const enviados = filteredPedidos.filter((item) => item.estado === "enviado").length;
    const entregados = filteredPedidos.filter((item) => item.estado === "entregado").length;
    const totalGenerado = filteredPedidos.reduce(
      (acc, item) => acc + Number(item.total || 0),
      0
    );

    return { total, enCurso, enviados, entregados, totalGenerado };
  }, [filteredPedidos]);

  const totalPages = Math.max(1, Math.ceil(filteredPedidos.length / PEDIDOS_PER_PAGE));

  const paginatedPedidos = useMemo(() => {
    const startIndex = (page - 1) * PEDIDOS_PER_PAGE;
    return filteredPedidos.slice(startIndex, startIndex + PEDIDOS_PER_PAGE);
  }, [filteredPedidos, page]);

  useEffect(() => {
    setPage(1);
  }, [filters.dateRange, filters.estado]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function resetForm() {
    setForm(initialPedidoForm);
    setEditingPedido(null);
    setFormError("");
  }

  function resetFilters() {
    setFilters({
      dateRange: [null, null],
      estado: "",
    });
  }

  function handleEditPedido(pedido) {
    if (pedido.estado === "entregado") {
      return;
    }

    setEditingPedido(pedido);
    setForm(mapPedidoToForm(pedido));
    setFormError("");
    setOpened(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.cliente_nombre.trim()) {
      setFormError("El nombre del cliente es obligatorio.");
      return;
    }

    if (!form.telefono.trim()) {
      setFormError("El teléfono es obligatorio.");
      return;
    }

    if (!form.fecha_evento) {
      setFormError("La fecha del evento es obligatoria.");
      return;
    }

    if (!form.estado) {
      setFormError("El estado es obligatorio.");
      return;
    }

    if (!form.canal_venta) {
      setFormError("El canal de venta es obligatorio.");
      return;
    }

    if (form.es_envio === "si" && !form.direccion_envio.trim()) {
      setFormError("La dirección de envío es obligatoria cuando el pedido requiere envío.");
      return;
    }

    if (!form.items.length) {
      setFormError("Debés cargar al menos 1 producto.");
      return;
    }

    const hasInvalidItem = form.items.some(
      (item) =>
        !item.producto_nombre ||
        Number(item.cantidad || 0) <= 0 ||
        Number(item.precio_unitario || 0) < 0
    );

    if (hasInvalidItem) {
      setFormError(
        "Cada producto debe tener nombre, cantidad mayor a 0 y precio unitario mayor o igual a 0."
      );
      return;
    }

    try {
      const payload = {
        ...form,
        es_envio: form.es_envio === "si",
        items: form.items.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad || 0),
          precio_unitario: Number(item.precio_unitario || 0),
          subtotal: Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
        })),
      };

      if (editingPedido) {
        await editPedido(editingPedido.id, payload);
        toast.success("Pedido actualizado", "Los cambios del pedido se guardaron correctamente.");
      } else {
        await createPedido(payload);
        toast.success("Pedido creado", "El nuevo pedido se registró correctamente.");
      }

      resetForm();
      setOpened(false);
    } catch (submitError) {
      setFormError(submitError.message);
    }
  }

  return (
    <Stack gap="lg" className="fab-safe-area">
      <Stack gap="xs">
        <Title order={2}>Pedidos</Title>
        <Text c="dimmed">Registro y seguimiento de pedidos de clientes.</Text>
      </Stack>

      <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={700}>Filtros</Text>
              <Text c="dimmed" fz="sm">
                Filtrá por rango de fechas de creación y estado del pedido.
              </Text>
            </div>
            <Button type="button" variant="default" onClick={resetFilters} fullWidth={isMobile}>
              Limpiar filtros
            </Button>
          </Group>

          <Grid>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <DatePickerInput
                type="range"
                label="Rango de fechas de creación"
                placeholder="Seleccioná un período"
                value={filters.dateRange}
                onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                valueFormat="DD/MM/YYYY"
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Select
                label="Estado"
                data={pedidoStatusOptions}
                value={filters.estado}
                onChange={(value) => setFilters((prev) => ({ ...prev, estado: value || "" }))}
                placeholder="Todos los estados"
                clearable
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {error.pedidos ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {error.pedidos}
        </Alert>
      ) : null}

      {error.updatePedido ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {error.updatePedido}
        </Alert>
      ) : null}

      {error.deletePedido ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {error.deletePedido}
        </Alert>
      ) : null}

      {error.markPagoCompletado ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {error.markPagoCompletado}
        </Alert>
      ) : null}

      <SimpleGrid cols={{ base: 1, md: 2, xl: 5 }} spacing={{ base: "md", md: "lg" }}>
        <div>
          <StatCard compact title="Total de pedidos" value={stats.total} subtitle="Pedidos registrados" />
        </div>
        <div>
          <StatCard compact title="Pedidos en curso" value={stats.enCurso} subtitle="Producción activa" />
        </div>
        <div>
          <StatCard compact title="Pedidos enviados" value={stats.enviados} subtitle="En camino" />
        </div>
        <div>
          <StatCard compact title="Pedidos entregados" value={stats.entregados} subtitle="Cerrados" />
        </div>
        <div>
          <StatCard
            compact
            title="Total generado"
            value={formatCurrency(stats.totalGenerado)}
            subtitle="Importe acumulado según filtros activos"
          />
        </div>
      </SimpleGrid>

      {loading.pedidos ? (
        <Card p="xl" bg="rgba(250, 252, 252, 0.96)">
          <Text c="dimmed" ta="center">
            Cargando pedidos...
          </Text>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing={{ base: "md", md: "lg" }}>
          {paginatedPedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} onEdit={handleEditPedido} />
          ))}
        </SimpleGrid>
      )}

      {!loading.pedidos && !filteredPedidos.length ? (
        <Card p="xl" bg="rgba(250, 252, 252, 0.96)">
          <Text c="dimmed" ta="center">
            No hay pedidos para los filtros seleccionados.
          </Text>
        </Card>
      ) : null}

      {!loading.pedidos ? (
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
        title={editingPedido ? `Editar pedido #${editingPedido.id}` : "Nuevo pedido"}
        onSubmit={handleSubmit}
        submitLabel={editingPedido ? "Guardar cambios" : "Guardar pedido"}
        loading={editingPedido ? loading.editPedido : loading.createPedido}
        size={isMobile ? "100%" : "xl"}
      >
        <Stack gap="lg">
          {formError ? (
            <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
              {formError}
            </Alert>
          ) : null}

          <PedidoFormFields
            form={form}
            setForm={setForm}
            setFormError={setFormError}
            isMobile={isMobile}
          />
        </Stack>
      </ModalForm>

      {!opened ? (
        <FloatingActionButton
          label="Cargar pedido"
          onClick={() => {
            resetForm();
            setOpened(true);
          }}
        />
      ) : null}
    </Stack>
  );
}
