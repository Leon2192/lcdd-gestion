import { Card, NavLink, Stack, Text } from "@mantine/core";
import {
  IconChecklist,
  IconMessages,
  IconPackage,
  IconTargetArrow,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import logoLcdd from "../assets/logo-lcdd.png";

const navItems = [
  {
    label: "Consultas",
    description: "Ingresos y seguimiento",
    path: "/consultas",
    icon: IconMessages,
  },
  {
    label: "Objetivos",
    description: "Metas mensuales",
    path: "/objetivos",
    icon: IconTargetArrow,
  },
  {
    label: "Pedidos",
    description: "Ventas y entregas",
    path: "/pedidos",
    icon: IconPackage,
  },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack h="100%" justify="space-between">
      <Card padding="lg" bg="rgba(244, 248, 249, 0.86)">
        <img
          src={logoLcdd}
          alt="La Casa del Detalle"
          className="brand-logo"
        />
      </Card>

      <Stack gap="xs">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            active={location.pathname.startsWith(item.path)}
            label={item.label}
            description={item.description}
            leftSection={<item.icon size={18} stroke={1.7} />}
            variant="filled"
            color="brand"
            onClick={() => {
              navigate(item.path);
              onNavigate?.();
            }}
            styles={{
              root: {
                borderRadius: "18px",
                color: location.pathname.startsWith(item.path) ? "#24343a" : undefined,
              },
            }}
          />
        ))}
      </Stack>

      <Card padding="lg" bg="#f4f8f9" visibleFrom="sm">
        <Stack gap={8}>
          <IconChecklist size={20} color="#6f8f9b" />
          <Text fw={700}>Base preparada para escalar</Text>
          <Text c="dimmed" fz="sm">
            El MVP ya separa UI, estado global y servicios para sumar autenticación, filtros y KPIs.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
