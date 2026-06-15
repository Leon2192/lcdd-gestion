import { Burger, Button, Group, Stack, Text, ThemeIcon } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconLogout, IconSparkles } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Header({ opened, onToggle, title, description }) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <Group justify="space-between" h="100%" px={{ base: "sm", md: "lg" }} wrap="nowrap">
      <Group gap={{ base: "sm", md: "md" }} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        <Burger opened={opened} onClick={onToggle} hiddenFrom="md" size="sm" />
        <ThemeIcon
          size={isMobile ? 42 : 48}
          radius="xl"
          variant="gradient"
          gradient={{ from: "#dce8ec", to: "#afc5ce", deg: 135 }}
          c="#24343a"
          flex="0 0 auto"
        >
          <IconSparkles size={isMobile ? 20 : 24} />
        </ThemeIcon>
        <Stack gap={1} style={{ minWidth: 0 }}>
          <Text fz={11} fw={700} tt="uppercase" c="dimmed" lineClamp={1}>
            LCDD Dashboard
          </Text>
          <Text fz={{ base: 20, md: 28 }} fw={700} lh={1} lineClamp={1}>
            {title}
          </Text>
          <Text c="dimmed" fz="sm" lineClamp={1} visibleFrom="sm">
            {description}
          </Text>
        </Stack>
      </Group>
      <Group gap={{ base: "xs", md: "md" }} wrap="nowrap" flex="0 0 auto">
        <Text visibleFrom="md" c="dimmed" fz="sm" ta="right">
          Plataforma interna para La Casa del Detalle.
        </Text>
        <Button
          variant="light"
          color="brand"
          leftSection={<IconLogout size={16} />}
          onClick={handleLogout}
          loading={loggingOut}
          size={isMobile ? "sm" : "md"}
          h={44}
          px={isMobile ? 10 : undefined}
        >
          {isMobile ? "Salir" : "Cerrar sesión"}
        </Button>
      </Group>
    </Group>
  );
}
