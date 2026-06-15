import { useState } from "react";
import { AppShell, Box } from "@mantine/core";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const sectionMeta = {
  "/consultas": {
    title: "Consultas",
    description: "Seguimiento comercial y contacto directo con cada cliente.",
  },
  "/objetivos": {
    title: "Objetivos",
    description: "Panorama mensual de foco, avance y cumplimiento del equipo.",
  },
  "/pedidos": {
    title: "Pedidos",
    description: "Registro y seguimiento de pedidos de clientes.",
  },
};

function getSectionByPath(pathname) {
  if (pathname.startsWith("/pedidos")) {
    return sectionMeta["/pedidos"];
  }

  if (pathname.startsWith("/objetivos")) {
    return sectionMeta["/objetivos"];
  }

  return sectionMeta["/consultas"];
}

export default function AppLayout() {
  const [opened, setOpened] = useState(false);
  const location = useLocation();
  const currentSection = getSectionByPath(location.pathname);

  return (
    <Box className="page-shell">
      <AppShell
        padding={{ base: "sm", md: "lg" }}
        navbar={{
          width: { base: 280, md: 300 },
          breakpoint: "md",
          collapsed: { mobile: !opened },
        }}
        header={{ height: 92 }}
        styles={{
          main: {
            background: "transparent",
          },
          navbar: {
            background: "rgba(249, 252, 252, 0.88)",
            backdropFilter: "blur(14px)",
            overflowY: "auto",
          },
          header: {
            background: "rgba(245, 249, 250, 0.8)",
            backdropFilter: "blur(14px)",
          },
        }}
      >
        <AppShell.Header>
          <Header
            opened={opened}
            onToggle={() => setOpened((prev) => !prev)}
            title={currentSection.title}
            description={currentSection.description}
          />
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Sidebar onNavigate={() => setOpened(false)} />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}
