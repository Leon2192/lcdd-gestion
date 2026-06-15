import { ActionIcon, Button, Card, Grid, Group, NumberInput, Select, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { formatCurrency } from "../lib/formatters";
import { envioOptions, createEmptyPedidoItem } from "../lib/pedidoForm";
import { pedidoStatusOptions } from "../lib/pedidos";
import { productOptions } from "../lib/productOptions";

export default function PedidoFormFields({ form, setForm, setFormError, isMobile }) {
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
      items: [...prev.items, createEmptyPedidoItem()],
    }));
  }

  function removeItem(index) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  const totalPedido = form.items.reduce((acc, item) => {
    const cantidad = Number(item.cantidad || 0);
    const precio = Number(item.precio_unitario || 0);
    return acc + cantidad * precio;
  }, 0);

  return (
    <Stack gap="lg">
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
            <Text fw={700}>{pedidoStatusOptions.find((item) => item.value === form.estado)?.label || "-"}</Text>
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
  );
}
