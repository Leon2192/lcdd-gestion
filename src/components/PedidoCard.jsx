import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconPackage,
  IconPencil,
  IconProgressCheck,
  IconTrash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { usePedidos } from "../hooks/usePedidos";
import { useToast } from "../hooks/useToast";
import { formatCurrency, formatDate, formatYesNo, normalizePhone } from "../lib/formatters";
import {
  getCanalVentaLabel,
  getNextPedidoStatusAction,
  getPedidoPagoStatus,
  getPedidoStatusLabel,
  pedidoPagoStatusColors,
  pedidoStatusColors,
} from "../lib/pedidos";

export default function PedidoCard({ pedido, onEdit }) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { updatePedidoEstado, deletePedido, loading } = usePedidos();
  const toast = useToast();
  const phone = normalizePhone(pedido.telefono);
  const totalProductos = pedido.items.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);
  const nextAction = getNextPedidoStatusAction(pedido.estado);
  const pagoStatus = getPedidoPagoStatus(pedido);

  return (
    <Card p="lg" bg="rgba(250, 252, 252, 0.96)">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Stack gap={2}>
            <Text fw={700} fz="lg">
              {pedido.cliente_nombre}
            </Text>
            <Text c="dimmed" fz="sm">
              Pedido #{pedido.id}
            </Text>
          </Stack>
          <Badge color={pedidoStatusColors[pedido.estado]} variant="light">
            {getPedidoStatusLabel(pedido.estado)}
          </Badge>
        </Group>

        <Stack gap={8}>
          <Group gap="xs">
            <Badge color={pedidoPagoStatusColors[pagoStatus.value]} variant="light">
              {pagoStatus.label}
            </Badge>
            <Text fz="sm" c="dimmed">
              {getCanalVentaLabel(pedido.canal_venta)}
            </Text>
          </Group>
          <Group gap="xs">
            <IconCalendarEvent size={16} color="#6f8f9b" />
            <Text fz="sm">Evento: {formatDate(pedido.fecha_evento)}</Text>
          </Group>
          <Group gap="xs">
            <IconCalendarEvent size={16} color="#6f8f9b" />
            <Text fz="sm">Creado: {formatDate(pedido.created_at)}</Text>
          </Group>
          <Group gap="xs">
            <IconTruckDelivery size={16} color="#6f8f9b" />
            <Text fz="sm">Es envío: {formatYesNo(pedido.es_envio)}</Text>
          </Group>
          <Group gap="xs">
            <IconPackage size={16} color="#6f8f9b" />
            <Text fz="sm">Productos totales: {totalProductos}</Text>
          </Group>
        </Stack>

        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={2}>
            <Text c="dimmed" fz="xs" tt="uppercase" fw={700}>
              Total
            </Text>
            <Text fw={700} fz="xl">
              {formatCurrency(pedido.total)}
            </Text>
            <Text fz="sm">
              Monto pagado: <Text span fw={700}>{formatCurrency(pedido.monto_pagado)}</Text>
            </Text>
            <Text fz="sm" c={pedido.saldo_pendiente > 0 ? "red.6" : "green.7"}>
              Saldo pendiente:{" "}
              <Text span fw={700} c={pedido.saldo_pendiente > 0 ? "red.6" : "green.7"}>
                {formatCurrency(pedido.saldo_pendiente)}
              </Text>
            </Text>
          </Stack>
          <Group gap="xs" wrap="wrap" justify={isMobile ? "stretch" : "flex-end"} style={{ flex: isMobile ? "1 1 100%" : undefined }}>
            {nextAction ? (
              <Button
                variant="filled"
                color="brand"
                size="xs"
                fullWidth={isMobile}
                loading={loading.updatePedido}
                leftSection={<IconProgressCheck size={15} />}
                onClick={async () => {
                  try {
                    await updatePedidoEstado(pedido.id, nextAction.value);
                    toast.success(
                      "Estado actualizado",
                      `${pedido.cliente_nombre} quedó como ${getNextPedidoStatusAction(pedido.estado)?.label?.replace("Marcar como ", "")}.`
                    );
                  } catch {}
                }}
              >
                {nextAction.label}
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
                size="xs"
                fullWidth={isMobile}
                leftSection={<IconBrandWhatsapp size={15} />}
              >
                WhatsApp
              </Button>
            ) : null}
            {pedido.estado !== "entregado" ? (
              <Button
                variant="default"
                size="xs"
                fullWidth={isMobile}
                leftSection={<IconPencil size={15} />}
                onClick={() => onEdit?.(pedido)}
              >
                Editar
              </Button>
            ) : null}
            <Button
              variant="light"
              color="red"
              size="xs"
              fullWidth={isMobile}
              loading={loading.deletePedido}
              leftSection={<IconTrash size={15} />}
              onClick={async () => {
                const confirmed = window.confirm(
                  `¿Querés eliminar el pedido #${pedido.id} de ${pedido.cliente_nombre}?`
                );

                if (!confirmed) {
                  return;
                }

                try {
                  await deletePedido(pedido.id);
                  toast.success("Pedido eliminado", `Se eliminó el pedido de ${pedido.cliente_nombre}.`);
                } catch {}
              }}
            >
              Eliminar
            </Button>
            <Button
              component={Link}
              to={`/pedidos/${pedido.id}`}
              variant="light"
              color="brand"
              size="xs"
              fullWidth={isMobile}
            >
              Ver detalle
            </Button>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
