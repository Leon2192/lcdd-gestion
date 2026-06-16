import { Card, NavLink, Stack } from "@mantine/core";
import { IconMessages, IconPackage, IconTargetArrow } from "@tabler/icons-react";
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
    hidden: true,
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
    <Stack h="100%" gap="xl">
      <Card padding="lg" bg="rgba(244, 248, 249, 0.86)">
        <img
          src={logoLcdd}
          alt="La Casa del Detalle"
          className="brand-logo"
        />
      </Card>

      <Stack gap="xs">
        {navItems.filter((item) => !item.hidden).map((item) => (
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
    </Stack>
  );
}
