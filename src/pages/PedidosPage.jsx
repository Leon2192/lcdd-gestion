import { useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Grid,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { IconInfoCircle, IconPlus, IconTrash } from "@tabler/icons-react";
import FloatingActionButton from "../components/FloatingActionButton";
import ModalForm from "../components/ModalForm";
import PedidoCard from "../components/PedidoCard";
import StatCard from "../components/StatCard";
import { usePedidos } from "../hooks/usePedidos";
import { formatCurrency } from "../lib/formatters";
import { getPedidoStatusLabel, pedidoStatusOptions } from "../lib/pedidos";
import { productOptions } from "../lib/productOptions";

const envioOptions = [
  { value: "no", label: "No" },
  { value: "si", label: "Si" },
];

const createEmptyItem = () => ({
  producto_nombre: "",
  cantidad: 1,
  precio_unitario: 0,
});

const initialForm = {
  cliente_nombre: "",
  telefono: "",
  fecha_evento: "",
  es_envio: "no",
  estado: "en_curso",
  items: [createEmptyItem()],
};

export default function PedidosPage() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { pedidos, loading, error, createPedido } = usePedidos();
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [filters, setFilters] = useState({
    dateRange: [null, null],
    estado: "",
  });

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      const [fromDate, toDate] = filters.dateRange;
      const pedidoDate = new Date(`${pedido.fecha_evento}T00:00:00`);

      if (fromDate && pedidoDate < fromDate) {
        return false;
      }

      if (toDate && pedidoDate > toDate) {
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

  const totalPedido = useMemo(
    () =>
      form.items.reduce((acc, item) => {
        const cantidad = Number(item.cantidad || 0);
        const precio = Number(item.precio_unitario || 0);
        return acc + cantidad * precio;
      }, 0),
    [form.items]
  );

  function resetForm() {
    setForm(initialForm);
    setFormError("");
  }

  function resetFilters() {
    setFilters({
      dateRange: [null, null],
      estado: "",
    });
  }

  function handleChange(event) {
    const { name, value } = event.currentTarget;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateItem(index, field, value) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  }

  function removeItem(index) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
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
      await createPedido({
        ...form,
        es_envio: form.es_envio === "si",
        total: totalPedido,
        items: form.items.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad || 0),
          precio_unitario: Number(item.precio_unitario || 0),
          subtotal: Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
        })),
      });
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
                Filtrá por rango de fechas del evento y estado del pedido.
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
                label="Rango de fechas"
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

      <SimpleGrid cols={{ base: 1, md: 2, xl: 5 }} spacing="lg">
        <div>
          <StatCard title="Total de pedidos" value={stats.total} subtitle="Pedidos registrados" />
        </div>
        <div>
          <StatCard title="Pedidos en curso" value={stats.enCurso} subtitle="Producción activa" />
        </div>
        <div>
          <StatCard title="Pedidos enviados" value={stats.enviados} subtitle="En camino" />
        </div>
        <div>
          <StatCard title="Pedidos entregados" value={stats.entregados} subtitle="Cerrados" />
        </div>
        <div>
          <StatCard
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
        <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
          {filteredPedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
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

      <ModalForm
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title="Nuevo pedido"
        onSubmit={handleSubmit}
        submitLabel="Guardar pedido"
        loading={loading.createPedido}
        size={isMobile ? "100%" : "xl"}
      >
        <Stack gap="lg">
          {formError ? (
            <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
              {formError}
            </Alert>
          ) : null}

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Nombre y apellido del cliente"
                name="cliente_nombre"
                value={form.cliente_nombre}
                onChange={(event) => {
                  handleChange(event);
                  setFormError("");
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Telefono / WhatsApp"
                name="telefono"
                value={form.telefono}
                onChange={(event) => {
                  handleChange(event);
                  setFormError("");
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                label="Fecha del evento"
                type="date"
                name="fecha_evento"
                value={form.fecha_evento}
                onChange={(event) => {
                  handleChange(event);
                  setFormError("");
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Es envio"
                data={envioOptions}
                value={form.es_envio}
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, es_envio: value || "no" }));
                  setFormError("");
                }}
                allowDeselect={false}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Estado del pedido"
                data={pedidoStatusOptions}
                value={form.estado}
                onChange={(value) => {
                  setForm((prev) => ({ ...prev, estado: value || "en_curso" }));
                  setFormError("");
                }}
                allowDeselect={false}
                required
              />
            </Grid.Col>
          </Grid>

          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <div>
                <Text fw={700}>Productos del pedido</Text>
                <Text c="dimmed" fz="sm">
                  Cargá cada item con cantidad y precio unitario.
                </Text>
              </div>
              <Button
                type="button"
                variant="light"
                color="brand"
                leftSection={<IconPlus size={16} />}
                onClick={addItem}
                fullWidth={isMobile}
              >
                Agregar producto
              </Button>
            </Group>

            <Stack gap="md">
              {form.items.map((item, index) => {
                const subtotal = Number(item.cantidad || 0) * Number(item.precio_unitario || 0);

                return (
                  <Card key={`item-${index}`} p="md" bg="#f8fbfc">
                    <Grid align="flex-end">
                      <Grid.Col span={{ base: 12, md: 5 }}>
                        <Select
                          label={`Producto ${index + 1}`}
                          data={productOptions}
                          value={item.producto_nombre}
                          onChange={(value) => {
                            updateItem(index, "producto_nombre", value || "");
                            setFormError("");
                          }}
                          placeholder="Seleccioná un producto"
                          searchable
                          nothingFoundMessage="No hay coincidencias"
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 6, md: 2 }}>
                        <NumberInput
                          label="Cantidad"
                          min={1}
                          value={item.cantidad}
                          onChange={(value) => {
                            updateItem(index, "cantidad", Number(value || 0));
                            setFormError("");
                          }}
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 6, md: 2 }}>
                        <NumberInput
                          label="Precio unitario"
                          min={0}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={0}
                          value={item.precio_unitario}
                          onChange={(value) => {
                            updateItem(index, "precio_unitario", Number(value || 0));
                            setFormError("");
                          }}
                          required
                        />
                      </Grid.Col>
                      <Grid.Col span={{ base: 9, md: 2 }}>
                        <Stack gap={2}>
                          <Text c="dimmed" fz="xs" fw={700} tt="uppercase">
                            Subtotal
                          </Text>
                          <Text fw={700}>{formatCurrency(subtotal)}</Text>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={{ base: 3, md: 1 }}>
                        <ActionIcon
                          type="button"
                          color="red"
                          variant="light"
                          size="lg"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Grid.Col>
                    </Grid>
                  </Card>
                );
              })}
            </Stack>
          </Stack>

          <Card p="md" bg="#eef5f7">
            <Group justify="space-between" wrap="wrap" gap="md">
              <Stack gap={2}>
                <Text c="dimmed" fz="xs" fw={700} tt="uppercase">
                  Estado seleccionado
                </Text>
                <Text fw={700}>{getPedidoStatusLabel(form.estado)}</Text>
              </Stack>
              <Stack gap={2} align={isMobile ? "flex-start" : "flex-end"}>
                <Text c="dimmed" fz="xs" fw={700} tt="uppercase">
                  Total del pedido
                </Text>
                <Text fw={700} fz="xl">
                  {formatCurrency(totalPedido)}
                </Text>
              </Stack>
            </Group>
          </Card>
        </Stack>
      </ModalForm>

      <FloatingActionButton label="Cargar pedido" onClick={() => setOpened(true)} />
    </Stack>
  );
}
