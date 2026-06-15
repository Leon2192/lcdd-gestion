import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowLeft, IconBrandWhatsapp, IconInfoCircle, IconPencil } from "@tabler/icons-react";
import { Link, useParams } from "react-router-dom";
import ModalForm from "../components/ModalForm";
import PedidoFormFields from "../components/PedidoFormFields";
import StatCard from "../components/StatCard";
import { usePedidos } from "../hooks/usePedidos";
import {
  formatCurrency,
  formatDate,
  formatYesNo,
  normalizePhone,
} from "../lib/formatters";
import { initialPedidoForm, mapPedidoToForm } from "../lib/pedidoForm";
import {
  getNextPedidoStatusAction,
  getPedidoStatusLabel,
  pedidoStatusColors,
} from "../lib/pedidos";

export default function PedidoDetailPage() {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { id } = useParams();
  const { selectedPedido, fetchPedidoById, updatePedidoEstado, editPedido, loading, error } = usePedidos();
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(initialPedidoForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchPedidoById(id).catch(() => null);
  }, [id]);

  if (loading.pedidoDetail && !selectedPedido) {
    return (
      <Card p="xl" bg="rgba(250, 252, 252, 0.96)">
        <Text c="dimmed" ta="center">
          Cargando detalle del pedido...
        </Text>
      </Card>
    );
  }

  if (error.pedidoDetail) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
        {error.pedidoDetail}
      </Alert>
    );
  }

  if (!selectedPedido) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} color="brand" variant="light">
        No se encontró el pedido solicitado.
      </Alert>
    );
  }

  const phone = normalizePhone(selectedPedido.telefono);
  const totalProductos = selectedPedido.items.reduce(
    (acc, item) => acc + Number(item.cantidad || 0),
    0
  );
  const nextAction = getNextPedidoStatusAction(selectedPedido.estado);

  function handleOpenEdit() {
    if (selectedPedido.estado === "entregado") {
      return;
    }

    setForm(mapPedidoToForm(selectedPedido));
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
      await editPedido(selectedPedido.id, {
        ...form,
        es_envio: form.es_envio === "si",
        items: form.items.map((item) => ({
          ...item,
          cantidad: Number(item.cantidad || 0),
          precio_unitario: Number(item.precio_unitario || 0),
          subtotal: Number(item.cantidad || 0) * Number(item.precio_unitario || 0),
        })),
      });
      await fetchPedidoById(selectedPedido.id);
      setOpened(false);
    } catch (submitError) {
      setFormError(submitError.message);
    }
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" gap="md">
        <Stack gap="xs">
          <Button
            component={Link}
            to="/pedidos"
            variant="subtle"
            color="brand"
            leftSection={<IconArrowLeft size={16} />}
            px={0}
          >
            Volver a Pedidos
          </Button>
          <Title order={2}>{selectedPedido.cliente_nombre}</Title>
          <Text c="dimmed">Detalle completo del pedido #{selectedPedido.id}.</Text>
        </Stack>
        <Group gap="sm" wrap="wrap">
          <Badge color={pedidoStatusColors[selectedPedido.estado]} variant="light" size="lg">
            {getPedidoStatusLabel(selectedPedido.estado)}
          </Badge>
          {selectedPedido.estado !== "entregado" ? (
            <Button
              variant="default"
              leftSection={<IconPencil size={16} />}
              onClick={handleOpenEdit}
            >
              Editar pedido
            </Button>
          ) : null}
          {phone ? (
            <Button
              component="a"
              href={`https://wa.me/${phone}`}
              target="_blank"
              rel="noreferrer"
              variant="light"
              color="green"
              leftSection={<IconBrandWhatsapp size={16} />}
            >
              Abrir WhatsApp
            </Button>
          ) : null}
        </Group>
      </Group>

      {error.updatePedido ? (
        <Alert icon={<IconInfoCircle size={16} />} color="red" variant="light">
          {error.updatePedido}
        </Alert>
      ) : null}

      <Grid>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Fecha del evento"
            value={formatDate(selectedPedido.fecha_evento)}
            subtitle="Compromiso agendado"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Es envio"
            value={formatYesNo(selectedPedido.es_envio)}
            subtitle="Logística del pedido"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Productos"
            value={totalProductos}
            subtitle="Cantidad total de unidades"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 3 }}>
          <StatCard
            title="Total"
            value={formatCurrency(selectedPedido.total)}
            subtitle="Importe general del pedido"
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={700} fz="lg">
                    Productos del pedido
                  </Text>
                  <Text c="dimmed" fz="sm">
                    Desglose completo por item.
                  </Text>
                </div>
              </Group>

              {isMobile ? (
                <SimpleGrid cols={1} spacing="sm">
                  {selectedPedido.items.map((item) => (
                    <Card key={item.id} p="md" bg="#f8fbfc">
                      <Stack gap={6}>
                        <Text fw={700}>{item.producto_nombre}</Text>
                        <Text fz="sm">Cantidad: {item.cantidad}</Text>
                        <Text fz="sm">Precio unitario: {formatCurrency(item.precio_unitario)}</Text>
                        <Text fz="sm" fw={700}>
                          Subtotal: {formatCurrency(item.subtotal)}
                        </Text>
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Producto</Table.Th>
                      <Table.Th>Cantidad</Table.Th>
                      <Table.Th>Precio unitario</Table.Th>
                      <Table.Th>Subtotal</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {selectedPedido.items.map((item) => (
                      <Table.Tr key={item.id}>
                        <Table.Td>{item.producto_nombre}</Table.Td>
                        <Table.Td>{item.cantidad}</Table.Td>
                        <Table.Td>{formatCurrency(item.precio_unitario)}</Table.Td>
                        <Table.Td>{formatCurrency(item.subtotal)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
            <Stack gap="md">
              <div>
                <Text fw={700} fz="lg">
                  Datos del cliente
                </Text>
                <Text c="dimmed" fz="sm">
                  Seguimiento directo y administración del estado.
                </Text>
              </div>

              <Stack gap={8}>
                <Text>
                  <Text span fw={700}>
                    Cliente:
                  </Text>{" "}
                  {selectedPedido.cliente_nombre}
                </Text>
                <Text>
                  <Text span fw={700}>
                    Telefono:
                  </Text>{" "}
                  {selectedPedido.telefono}
                </Text>
                <Text>
                  <Text span fw={700}>
                    Creado:
                  </Text>{" "}
                  {new Intl.DateTimeFormat("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedPedido.created_at))}
                </Text>
              </Stack>

              {nextAction ? (
                <Button
                  color="brand"
                  fullWidth={isMobile}
                  loading={loading.updatePedido}
                  onClick={async () => {
                    try {
                      await updatePedidoEstado(selectedPedido.id, nextAction.value);
                    } catch {}
                  }}
                >
                  {nextAction.label}
                </Button>
              ) : (
                <Alert icon={<IconInfoCircle size={16} />} color="brand" variant="light">
                  Este pedido ya está marcado como entregado.
                </Alert>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <ModalForm
        opened={opened}
        onClose={() => {
          setOpened(false);
          setForm(mapPedidoToForm(selectedPedido));
          setFormError("");
        }}
        title={`Editar pedido #${selectedPedido.id}`}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
        loading={loading.editPedido}
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
    </Stack>
  );
}
